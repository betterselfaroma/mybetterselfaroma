-- Backfill and harden customer QR tokens.
-- Safe to run in Supabase SQL Editor: no drops and no old data deletion.

create extension if not exists pgcrypto;

alter table public.customers
add column if not exists qr_token text,
add column if not exists role text default 'member',
add column if not exists is_admin boolean default false;

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action text,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

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

grant execute on function public.is_staff_or_admin_user(uuid) to anon, authenticated, service_role;

update public.customers
set qr_token = encode(gen_random_bytes(16), 'hex')
where qr_token is null or trim(qr_token) = '';

do $$
declare
  v_customer record;
  v_token text;
begin
  for v_customer in
    select id
      from (
        select id,
               qr_token,
               row_number() over (partition by qr_token order by created_at nulls last, id) as rn
          from public.customers
         where qr_token is not null and trim(qr_token) <> ''
      ) duplicated
     where rn > 1
  loop
    loop
      v_token := encode(gen_random_bytes(16), 'hex');
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

create unique index if not exists customers_qr_token_unique_idx
on public.customers(qr_token)
where qr_token is not null;

create or replace function public.assign_customer_qr_token()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_token text;
begin
  if new.qr_token is null or trim(new.qr_token) = '' then
    loop
      v_token := encode(gen_random_bytes(16), 'hex');
      exit when not exists (
        select 1
          from public.customers
         where qr_token = v_token
      );
    end loop;

    new.qr_token := v_token;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_assign_customer_qr_token on public.customers;
create trigger trg_assign_customer_qr_token
  before insert or update of qr_token on public.customers
  for each row
  execute function public.assign_customer_qr_token();

create or replace function public.generate_customer_qr_token(
  target_customer_id uuid,
  operator_user_id uuid default auth.uid()
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing text;
  v_token text;
begin
  if target_customer_id is null then
    raise exception 'invalid_customer';
  end if;

  if auth.role() is distinct from 'service_role'
     and not public.is_staff_or_admin_user(operator_user_id) then
    raise exception 'not_authorized';
  end if;

  select qr_token
    into v_existing
    from public.customers
   where id = target_customer_id
   for update;

  if not found then
    raise exception 'customer_not_found';
  end if;

  if v_existing is not null and trim(v_existing) <> '' then
    return v_existing;
  end if;

  loop
    v_token := encode(gen_random_bytes(16), 'hex');
    exit when not exists (
      select 1
        from public.customers
       where qr_token = v_token
    );
  end loop;

  update public.customers
     set qr_token = v_token
   where id = target_customer_id;

  insert into public.admin_audit_logs(admin_user_id, action, target_table, target_id, details)
  values (
    operator_user_id,
    'generate_customer_qr_token',
    'customers',
    target_customer_id,
    jsonb_build_object('generated', true)
  )
  on conflict do nothing;

  return v_token;
end;
$$;

grant execute on function public.generate_customer_qr_token(uuid, uuid) to authenticated, service_role;

notify pgrst, 'reload schema';
