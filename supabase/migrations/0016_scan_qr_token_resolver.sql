-- Resolve member, booking, and completion QR tokens for Admin/native scan.
-- Safe to run in Supabase SQL Editor: no table drops and no data deletion.

create extension if not exists pgcrypto;

alter table public.customers
  add column if not exists role text default 'member',
  add column if not exists is_admin boolean default false,
  add column if not exists qr_token text;

alter table public.bookings
  add column if not exists booking_qr_token text,
  add column if not exists customer_id uuid,
  add column if not exists user_id uuid,
  add column if not exists notes text;

create unique index if not exists customers_qr_token_unique_idx
  on public.customers(qr_token)
  where qr_token is not null;

create index if not exists bookings_booking_qr_token_idx
  on public.bookings(booking_qr_token)
  where booking_qr_token is not null;

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

create or replace function public.resolve_member_qr_token(raw_token text)
returns table (
  customer_id uuid,
  source text,
  booking_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text := nullif(trim(coalesce(raw_token, '')), '');
  v_customer_id uuid;
  v_booking_id uuid;
begin
  if v_token is null then
    return;
  end if;

  if auth.role() is distinct from 'service_role'
     and not public.is_staff_or_admin_user(auth.uid()) then
    raise exception 'not_authorized';
  end if;

  select c.id
    into v_customer_id
    from public.customers c
   where c.qr_token = v_token
   limit 1;

  if v_customer_id is not null then
    customer_id := v_customer_id;
    source := 'member_qr';
    booking_id := null;
    return next;
    return;
  end if;

  select b.id, coalesce(b.customer_id, b.user_id)
    into v_booking_id, v_customer_id
    from public.bookings b
   where b.booking_qr_token = v_token
   limit 1;

  if v_customer_id is not null then
    customer_id := v_customer_id;
    source := 'booking_qr';
    booking_id := v_booking_id;
    return next;
    return;
  end if;

  select b.id, coalesce(b.customer_id, b.user_id)
    into v_booking_id, v_customer_id
    from public.bookings b
   where position('[booking_qr_token:' || v_token || ']' in coalesce(b.notes, '')) > 0
   limit 1;

  if v_customer_id is not null then
    customer_id := v_customer_id;
    source := 'booking_qr_notes';
    booking_id := v_booking_id;
    return next;
    return;
  end if;

  if to_regclass('public.booking_completion_tokens') is not null then
    execute
      'select customer_id from public.booking_completion_tokens where token = $1 limit 1'
      into v_customer_id
      using v_token;

    if v_customer_id is not null then
      customer_id := v_customer_id;
      source := 'completion_qr';
      booking_id := null;
      return next;
      return;
    end if;
  end if;

  return;
end;
$$;

grant execute on function public.resolve_member_qr_token(text) to authenticated, service_role;

notify pgrst, 'reload schema';
