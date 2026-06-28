-- Mobile Admin RLS/RPC compatibility for the current bookings schema.
-- Idempotent: no table drops and no existing row deletion.

create extension if not exists pgcrypto;

alter table public.customers
  add column if not exists auth_user_id uuid,
  add column if not exists email text,
  add column if not exists role text default 'member',
  add column if not exists is_admin boolean default false,
  add column if not exists points integer default 0,
  add column if not exists points_balance integer default 0,
  add column if not exists qr_token text;

alter table public.bookings
  add column if not exists user_id uuid,
  add column if not exists package_name text,
  add column if not exists package_code text,
  add column if not exists amount numeric default 0,
  add column if not exists booking_date date,
  add column if not exists booking_time text,
  add column if not exists contact text,
  add column if not exists notes text,
  add column if not exists status text default 'pending',
  add column if not exists created_at timestamptz default now();

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

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action text not null,
  target_table text not null,
  target_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

create unique index if not exists customers_qr_token_key
  on public.customers(qr_token)
  where qr_token is not null;

create index if not exists bookings_user_id_idx
  on public.bookings(user_id);

create index if not exists bookings_date_time_idx
  on public.bookings(booking_date, booking_time);

create index if not exists bookings_status_idx
  on public.bookings(status);

create index if not exists points_transactions_user_idx
  on public.points_transactions(user_id);

create index if not exists points_transactions_created_at_idx
  on public.points_transactions(created_at desc);

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs(created_at desc);

grant usage on schema public to authenticated;
grant select on public.customers to authenticated;
grant select, insert, update on public.bookings to authenticated;
grant select, insert on public.points_transactions to authenticated;
grant select, insert on public.admin_audit_logs to authenticated;

create or replace function public.current_customer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id
    from public.customers c
   where c.auth_user_id = auth.uid()
      or lower(c.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
   order by case when c.auth_user_id = auth.uid() then 0 else 1 end
   limit 1
$$;

create or replace function public.is_staff_or_admin_user(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.customers c
     where (c.auth_user_id = p_user_id
        or lower(c.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
       and (
         coalesce(c.is_admin, false) = true
         or coalesce(c.role, 'member') in ('admin', 'staff')
       )
  )
$$;

alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.points_transactions enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists customers_self_select on public.customers;
drop policy if exists customers_staff_select on public.customers;
drop policy if exists customers_self_update on public.customers;
create policy customers_self_select on public.customers
  for select
  using (
    auth_user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_staff_or_admin_user()
  );
create policy customers_staff_select on public.customers
  for select
  using (public.is_staff_or_admin_user());

drop policy if exists bookings_self_select on public.bookings;
drop policy if exists bookings_self_insert on public.bookings;
drop policy if exists bookings_staff_select on public.bookings;
drop policy if exists bookings_staff_update on public.bookings;
create policy bookings_self_select on public.bookings
  for select
  using (user_id = public.current_customer_id());
create policy bookings_self_insert on public.bookings
  for insert
  with check (user_id = public.current_customer_id());
create policy bookings_staff_select on public.bookings
  for select
  using (public.is_staff_or_admin_user());
create policy bookings_staff_update on public.bookings
  for update
  using (public.is_staff_or_admin_user())
  with check (public.is_staff_or_admin_user());

drop policy if exists points_transactions_self_select on public.points_transactions;
drop policy if exists points_transactions_staff_select on public.points_transactions;
drop policy if exists points_transactions_staff_insert on public.points_transactions;
create policy points_transactions_self_select on public.points_transactions
  for select
  using (
    user_id = auth.uid()
    or user_id = public.current_customer_id()
  );
create policy points_transactions_staff_select on public.points_transactions
  for select
  using (public.is_staff_or_admin_user());
create policy points_transactions_staff_insert on public.points_transactions
  for insert
  with check (public.is_staff_or_admin_user());

drop policy if exists admin_audit_logs_staff_select on public.admin_audit_logs;
drop policy if exists admin_audit_logs_staff_insert on public.admin_audit_logs;
create policy admin_audit_logs_staff_select on public.admin_audit_logs
  for select
  using (public.is_staff_or_admin_user());
create policy admin_audit_logs_staff_insert on public.admin_audit_logs
  for insert
  with check (public.is_staff_or_admin_user());

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
  v_current_points integer;
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

  v_current_points := coalesce(v_customer.points_balance, v_customer.points, 0);
  v_next_points := v_current_points + points_delta;

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
  values (
    target_customer_id,
    points_delta,
    v_type,
    coalesce(nullif(reason, ''), 'Admin points adjustment')
  );

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
      'old_points', v_current_points,
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
  v_points integer;
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
     set status = new_status
   where id = target_booking_id
   returning * into v_updated;

  if new_status = 'completed'
     and v_booking.status is distinct from 'completed'
     and v_booking.user_id is not null then
    v_points := case
      when v_booking.package_code = 'custom_blend' then 60
      else 20
    end;

    perform public.adjust_member_points(
      v_booking.user_id,
      v_points,
      'Admin booking completed',
      'earn',
      operator_user_id
    );
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
      'user_id', v_booking.user_id
    )
  );

  return v_updated;
end;
$$;

grant execute on function public.adjust_member_points(uuid, integer, text, text, uuid) to authenticated, service_role;
grant execute on function public.admin_set_booking_status(uuid, text, uuid) to authenticated, service_role;

NOTIFY pgrst, 'reload schema';
