-- Admin PWA production security hardening.
-- Idempotent: no table drops and no existing row deletion.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Core columns and safe defaults.
-- ---------------------------------------------------------------------------
alter table public.customers
  add column if not exists role text default 'member',
  add column if not exists qr_token text,
  add column if not exists points integer default 0;

update public.customers
   set role = case
     when is_admin = true then 'admin'
     else coalesce(nullif(role, ''), 'member')
   end;

update public.customers
   set points = coalesce(points, points_balance, 0);

create or replace function public.sync_customer_points_alias()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  NEW.points := coalesce(NEW.points_balance, 0);
  return NEW;
end;
$$;

drop trigger if exists trg_sync_customer_points_alias_insert on public.customers;
create trigger trg_sync_customer_points_alias_insert
  before insert on public.customers
  for each row execute function public.sync_customer_points_alias();

drop trigger if exists trg_sync_customer_points_alias_update on public.customers;
create trigger trg_sync_customer_points_alias_update
  before update of points_balance on public.customers
  for each row execute function public.sync_customer_points_alias();

create unique index if not exists customers_qr_token_key
  on public.customers(qr_token)
  where qr_token is not null;

do $$
declare
  v_customer record;
  v_token text;
begin
  for v_customer in
    select id
      from public.customers
     where qr_token is null
  loop
    loop
      v_token := encode(gen_random_bytes(32), 'base64');
      v_token := replace(replace(replace(v_token, '+', '-'), '/', '_'), '=', '');
      exit when not exists (
        select 1
          from public.customers
         where qr_token = v_token
      );
    end loop;

    update public.customers
       set qr_token = v_token
     where id = v_customer.id;
  end loop;
end $$;

alter table public.bookings
  add column if not exists updated_at timestamptz default now(),
  add column if not exists completed_at timestamptz;

update public.bookings
   set status = 'confirmed'
 where status = 'booked';

update public.bookings
   set status = 'cancelled'
 where status = 'no_show';

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check
  check (status in ('pending', 'confirmed', 'completed', 'cancelled'));

create table if not exists public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  points integer not null,
  type text not null,
  reason text,
  created_at timestamptz default now()
);

alter table public.points_transactions
  add column if not exists user_id uuid,
  add column if not exists points integer,
  add column if not exists type text,
  add column if not exists reason text,
  add column if not exists created_at timestamptz default now();

update public.points_transactions
   set points = 0
 where points is null;

update public.points_transactions
   set type = 'adjust'
 where type is null;

alter table public.points_transactions
  alter column points set not null,
  alter column type set not null,
  alter column created_at set default now();

alter table public.points_transactions drop constraint if exists points_transactions_type_check;
alter table public.points_transactions
  add constraint points_transactions_type_check
  check (type in ('earn', 'redeem', 'adjust'));

create index if not exists points_transactions_user_idx
  on public.points_transactions(user_id);

create index if not exists points_transactions_created_at_idx
  on public.points_transactions(created_at desc);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action text not null,
  target_table text not null,
  target_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

create index if not exists admin_audit_logs_admin_idx
  on public.admin_audit_logs(admin_user_id);

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs(created_at desc);

-- ---------------------------------------------------------------------------
-- Shared auth helpers for RLS and RPC.
-- ---------------------------------------------------------------------------
create or replace function public.current_customer_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.customers where auth_user_id = auth.uid()
$$;

create or replace function public.is_staff_or_admin_user(p_user_id uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from public.customers c
     where c.auth_user_id = p_user_id
       and (coalesce(c.is_admin, false) = true or coalesce(c.role, 'member') in ('admin', 'staff'))
  )
$$;

-- ---------------------------------------------------------------------------
-- RLS hardening.
-- ---------------------------------------------------------------------------
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.points_transactions enable row level security;
alter table public.admin_audit_logs enable row level security;

do $$
begin
  if to_regclass('public.profiles') is not null then
    execute 'alter table public.profiles enable row level security';
  end if;
  if to_regclass('public.members') is not null then
    execute 'alter table public.members enable row level security';
  end if;
end $$;

drop policy if exists customers_self_select on public.customers;
drop policy if exists customers_self_update on public.customers;
drop policy if exists customers_staff_select on public.customers;
create policy customers_self_select on public.customers
  for select
  using (auth_user_id = auth.uid() or public.is_staff_or_admin_user());
create policy customers_staff_select on public.customers
  for select
  using (public.is_staff_or_admin_user());

drop policy if exists bookings_self_select on public.bookings;
drop policy if exists bookings_self_insert on public.bookings;
drop policy if exists bookings_staff_select on public.bookings;
drop policy if exists bookings_staff_update on public.bookings;
create policy bookings_self_select on public.bookings
  for select
  using (customer_id = public.current_customer_id());
create policy bookings_self_insert on public.bookings
  for insert
  with check (customer_id = public.current_customer_id() and status = 'pending');
create policy bookings_staff_select on public.bookings
  for select
  using (public.is_staff_or_admin_user());
create policy bookings_staff_update on public.bookings
  for update
  using (public.is_staff_or_admin_user())
  with check (public.is_staff_or_admin_user());

drop policy if exists points_transactions_self_select on public.points_transactions;
drop policy if exists points_transactions_staff_select on public.points_transactions;
create policy points_transactions_self_select on public.points_transactions
  for select
  using (user_id = auth.uid() or user_id = public.current_customer_id());
create policy points_transactions_staff_select on public.points_transactions
  for select
  using (public.is_staff_or_admin_user());

drop policy if exists admin_audit_logs_staff_select on public.admin_audit_logs;
create policy admin_audit_logs_staff_select on public.admin_audit_logs
  for select
  using (public.is_staff_or_admin_user());

-- ---------------------------------------------------------------------------
-- Atomic admin/staff operations.
-- ---------------------------------------------------------------------------
create or replace function public.adjust_member_points(
  target_customer_id uuid,
  points_delta integer,
  reason text default null,
  transaction_type text default null,
  operator_user_id uuid default auth.uid()
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer public.customers%rowtype;
  v_next_points integer;
  v_type text;
  v_action text;
begin
  if target_customer_id is null then
    raise exception 'missing_customer';
  end if;

  if points_delta is null or points_delta = 0 or abs(points_delta) > 10000 then
    raise exception 'invalid_points_delta';
  end if;

  if auth.role() is distinct from 'service_role' and not public.is_staff_or_admin_user(operator_user_id) then
    raise exception 'not_authorized';
  end if;

  select * into v_customer
    from public.customers
   where id = target_customer_id
   for update;

  if v_customer.id is null then
    raise exception 'member_not_found';
  end if;

  v_next_points := coalesce(v_customer.points_balance, v_customer.points, 0) + points_delta;
  if v_next_points < 0 then
    raise exception 'insufficient_points';
  end if;

  v_type := case
    when transaction_type in ('earn', 'redeem', 'adjust') then transaction_type
    when points_delta > 0 then 'earn'
    else 'redeem'
  end;

  update public.customers
     set points_balance = v_next_points,
         points = v_next_points
   where id = target_customer_id;

  insert into public.points_transactions(user_id, points, type, reason)
  values (coalesce(v_customer.auth_user_id, v_customer.id), points_delta, v_type, coalesce(nullif(reason, ''), 'Admin points adjustment'));

  insert into public.points_ledger(customer_id, points, type, description)
  values (target_customer_id, points_delta, 'manual_adjustment', coalesce(nullif(reason, ''), 'Admin points adjustment'));

  v_action := case
    when v_type = 'earn' then 'staff_add_points'
    when v_type = 'redeem' then 'staff_redeem_points'
    else 'staff_adjust_points'
  end;

  insert into public.admin_audit_logs(admin_user_id, action, target_table, target_id, details)
  values (
    operator_user_id,
    v_action,
    'customers',
    target_customer_id,
    jsonb_build_object(
      'points_delta', points_delta,
      'new_points', v_next_points,
      'reason', reason,
      'transaction_type', v_type
    )
  );

  return v_next_points;
end;
$$;

create or replace function public.admin_set_booking_status(
  target_booking_id uuid,
  new_status text,
  operator_user_id uuid default auth.uid()
) returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_updated public.bookings%rowtype;
  v_points integer := 0;
  v_action text;
begin
  if target_booking_id is null then
    raise exception 'missing_booking';
  end if;

  if new_status not in ('pending', 'confirmed', 'completed', 'cancelled') then
    raise exception 'invalid_booking_status';
  end if;

  if auth.role() is distinct from 'service_role' and not public.is_staff_or_admin_user(operator_user_id) then
    raise exception 'not_authorized';
  end if;

  select * into v_booking
    from public.bookings
   where id = target_booking_id
   for update;

  if v_booking.id is null then
    raise exception 'booking_not_found';
  end if;

  update public.bookings
     set status = new_status,
         completed_at = case
           when new_status = 'completed' then coalesce(completed_at, now())
           else completed_at
         end,
         updated_at = now()
   where id = target_booking_id
   returning * into v_updated;

  if new_status = 'completed'
     and v_booking.status is distinct from 'completed'
     and v_booking.customer_id is not null
     and not coalesce(v_booking.points_awarded, false) then
    v_points := case
      when v_booking.package_type in ('custom_blend', 'RM129', 'RM136') then 60
      else 20
    end;

    insert into public.points_transactions(user_id, points, type, reason)
    select coalesce(c.auth_user_id, c.id), v_points, 'earn', 'Admin booking completed'
      from public.customers c
     where c.id = v_booking.customer_id;
  end if;

  if v_updated.customer_id is not null then
    update public.customers
       set points = points_balance
     where id = v_updated.customer_id;
  end if;

  v_action := case new_status
    when 'confirmed' then 'booking_confirm'
    when 'completed' then 'booking_complete'
    when 'cancelled' then 'booking_cancel'
    else 'booking_status_update'
  end;

  insert into public.admin_audit_logs(admin_user_id, action, target_table, target_id, details)
  values (
    operator_user_id,
    v_action,
    'bookings',
    target_booking_id,
    jsonb_build_object(
      'old_status', v_booking.status,
      'new_status', new_status,
      'customer_id', v_booking.customer_id
    )
  );

  return v_updated;
end;
$$;

grant execute on function public.adjust_member_points(uuid, integer, text, text, uuid) to authenticated, service_role;
grant execute on function public.admin_set_booking_status(uuid, text, uuid) to authenticated, service_role;

NOTIFY pgrst, 'reload schema';
