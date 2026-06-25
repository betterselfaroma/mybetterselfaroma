-- ============================================================================
-- Align bookings schema with scheduled booking RPC
--
-- This is a focused safety migration for production databases that still have
-- the older bookings table without start_time/end_time.
-- The project standard column is package_type, not package_code.
-- ============================================================================

create extension if not exists pgcrypto;

alter table public.bookings
  alter column customer_id drop not null;

alter table public.bookings
  add column if not exists start_time timestamptz,
  add column if not exists end_time timestamptz,
  add column if not exists booking_qr_token text,
  add column if not exists booking_qr_created_at timestamptz,
  add column if not exists source text,
  add column if not exists customer_phone text,
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists amount numeric,
  add column if not exists notes text,
  add column if not exists completed_at timestamptz,
  add column if not exists created_by_admin_email text,
  add column if not exists updated_at timestamptz default now();

update public.bookings
   set amount = case
     when package_type in ('scent_test','RM49','RM66') then 60
     when package_type in ('custom_blend','RM129','RM136') then 150
     else amount
   end
 where amount is null;

update public.bookings
   set start_time = booking_date
 where start_time is null
   and booking_date is not null;

update public.bookings
   set end_time = start_time + case
     when package_type in ('custom_blend','RM129','RM136') then interval '60 minutes'
     else interval '30 minutes'
   end
 where end_time is null
   and start_time is not null;

update public.bookings
   set source = coalesce(nullif(source, ''), 'member_self_booking')
 where source is null or source = '';

update public.bookings b
   set customer_name = coalesce(b.customer_name, c.name),
       customer_email = coalesce(b.customer_email, c.email),
       customer_phone = coalesce(b.customer_phone, c.phone)
  from public.customers c
 where b.customer_id = c.id;

update public.bookings
   set booking_qr_token = encode(gen_random_bytes(24), 'hex'),
       booking_qr_created_at = coalesce(created_at, now())
 where booking_qr_token is null;

create unique index if not exists bookings_booking_qr_token_key
  on public.bookings(booking_qr_token)
  where booking_qr_token is not null;

create index if not exists bookings_start_time_idx on public.bookings(start_time);
create index if not exists bookings_end_time_idx on public.bookings(end_time);

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check
  check (status in ('pending','booked','confirmed','completed','cancelled','no_show'));

alter table public.bookings drop constraint if exists bookings_time_order_check;
alter table public.bookings
  add constraint bookings_time_order_check
  check (start_time is null or end_time is null or start_time < end_time);

alter table public.bookings drop constraint if exists bookings_amount_check;
alter table public.bookings
  add constraint bookings_amount_check
  check (amount is null or amount in (60,150));

create or replace function public.booking_amount_for_package(p_package_type text)
returns numeric
language sql immutable as $$
  select case
    when p_package_type = 'scent_test' then 60
    when p_package_type = 'custom_blend' then 150
    else null
  end
$$;

create or replace function public.booking_has_conflict(
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_ignore_booking_id uuid default null
) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from public.bookings b
     where b.start_time is not null
       and b.end_time is not null
       and b.status in ('booked','confirmed','completed')
       and (p_ignore_booking_id is null or b.id <> p_ignore_booking_id)
       and p_start_time < b.end_time
       and p_end_time > b.start_time
  )
$$;

create or replace function public.create_scheduled_booking(
  p_created_by_admin_email text default null,
  p_customer_email text default null,
  p_customer_id uuid default null,
  p_customer_name text default null,
  p_customer_phone text default null,
  p_end_time timestamptz default null,
  p_notes text default null,
  p_package_type text default null,
  p_source text default 'member_self_booking',
  p_start_time timestamptz default null,
  p_status text default 'booked'
) returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_amount numeric := public.booking_amount_for_package(p_package_type);
  v_token text;
begin
  if v_amount is null then
    raise exception 'invalid_package';
  end if;

  if p_start_time is null or p_end_time is null or p_start_time >= p_end_time then
    raise exception 'invalid_time';
  end if;

  if coalesce(p_status, 'booked') not in ('pending','booked','confirmed','completed','cancelled','no_show') then
    raise exception 'invalid_status';
  end if;

  perform pg_advisory_xact_lock(hashtext('scent_knows_you_booking_schedule'));

  if public.booking_has_conflict(p_start_time, p_end_time, null) then
    raise exception 'booking_conflict';
  end if;

  loop
    v_token := encode(gen_random_bytes(24), 'hex');
    exit when not exists (select 1 from public.bookings where booking_qr_token = v_token);
  end loop;

  insert into public.bookings (
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    package_type,
    amount,
    status,
    booking_date,
    start_time,
    end_time,
    source,
    booking_qr_token,
    booking_qr_created_at,
    notes,
    created_by_admin_email,
    updated_at
  )
  values (
    p_customer_id,
    nullif(trim(coalesce(p_customer_name, '')), ''),
    nullif(trim(coalesce(p_customer_phone, '')), ''),
    nullif(trim(coalesce(p_customer_email, '')), ''),
    p_package_type,
    v_amount,
    coalesce(p_status, 'booked'),
    p_start_time,
    p_start_time,
    p_end_time,
    coalesce(p_source, 'member_self_booking'),
    v_token,
    now(),
    nullif(trim(coalesce(p_notes, '')), ''),
    p_created_by_admin_email,
    now()
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.create_scheduled_booking(
  text,
  text,
  uuid,
  text,
  text,
  timestamptz,
  text,
  text,
  text,
  timestamptz,
  text
) to authenticated;

grant execute on function public.booking_has_conflict(timestamptz,timestamptz,uuid) to authenticated;

select pg_notify('pgrst', 'reload schema');
