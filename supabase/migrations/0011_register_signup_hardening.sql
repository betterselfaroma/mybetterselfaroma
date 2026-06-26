-- Register flow hardening.
-- Idempotent: no table drops and no existing row deletion.

create extension if not exists pgcrypto;

alter table public.customers
  add column if not exists role text default 'member',
  add column if not exists is_admin boolean default false,
  add column if not exists points integer default 0,
  add column if not exists points_balance integer default 0,
  add column if not exists qr_token text;

create unique index if not exists customers_qr_token_key
  on public.customers(qr_token)
  where qr_token is not null;

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_qr_token text;
  v_name text := coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), '');
  v_phone text := nullif(trim(new.raw_user_meta_data->>'phone'), '');
  v_ref text := upper(nullif(trim(new.raw_user_meta_data->>'referred_by_code'), ''));
  v_cid uuid;
  v_referrer public.customers%rowtype;
begin
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1 from public.customers where referral_code = v_code
    );
  end loop;

  loop
    v_qr_token := encode(gen_random_bytes(32), 'base64');
    v_qr_token := replace(replace(replace(v_qr_token, '+', '-'), '/', '_'), '=', '');
    exit when not exists (
      select 1 from public.customers where qr_token = v_qr_token
    );
  end loop;

  if v_ref is not null and not exists (
    select 1 from public.customers where referral_code = v_ref
  ) then
    v_ref := null;
  end if;

  insert into public.customers(
    auth_user_id,
    name,
    email,
    phone,
    referral_code,
    referred_by_code,
    points_balance,
    points,
    role,
    is_admin,
    qr_token
  )
  values (
    new.id,
    v_name,
    new.email,
    v_phone,
    v_code,
    v_ref,
    0,
    0,
    'member',
    false,
    v_qr_token
  )
  returning id into v_cid;

  insert into public.points_ledger(customer_id, points, type, description)
  values (v_cid, 10, 'signup_bonus', 'New member signup bonus');

  update public.customers
     set points_balance = coalesce(points_balance, 0) + 10,
         points = coalesce(points, 0) + 10
   where id = v_cid;

  if v_ref is not null then
    select * into v_referrer from public.customers where referral_code = v_ref;
    if v_referrer.id is not null and v_referrer.id <> v_cid then
      insert into public.referrals(referrer_customer_id, referred_customer_id, referral_code, status)
      values (v_referrer.id, v_cid, v_ref, 'registered')
      on conflict (referred_customer_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.customers enable row level security;

drop policy if exists customers_self_insert on public.customers;
create policy customers_self_insert on public.customers
  for insert
  with check (
    auth_user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists customers_self_select on public.customers;
create policy customers_self_select on public.customers
  for select
  using (
    auth_user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_staff_or_admin_user()
  );

notify pgrst, 'reload schema';
