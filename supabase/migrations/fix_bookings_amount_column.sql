-- Fix /book booking payload columns without dropping existing bookings.
-- Run this in Supabase SQL Editor, then retry the booking form.

create extension if not exists pgcrypto;

alter table if exists public.bookings
  add column if not exists id uuid default gen_random_uuid();

alter table if exists public.bookings
  alter column id set default gen_random_uuid();

alter table if exists public.bookings
  add column if not exists user_id uuid;

alter table if exists public.bookings
  add column if not exists package_name text;

alter table if exists public.bookings
  add column if not exists package_code text;

alter table if exists public.bookings
  add column if not exists amount numeric default 0;

alter table if exists public.bookings
  add column if not exists booking_date date;

alter table if exists public.bookings
  add column if not exists booking_time text;

alter table if exists public.bookings
  add column if not exists contact text;

alter table if exists public.bookings
  add column if not exists notes text;

alter table if exists public.bookings
  add column if not exists status text default 'pending';

alter table if exists public.bookings
  add column if not exists created_at timestamptz default now();

alter table if exists public.bookings
  alter column amount set default 0;

alter table if exists public.bookings
  alter column status set default 'pending';

alter table if exists public.bookings
  alter column created_at set default now();

update public.bookings
   set user_id = customer_id
 where user_id is null
   and customer_id is not null;

update public.bookings
   set package_code = package_type
 where package_code is null
   and package_type is not null;

update public.bookings
   set package_code = case
     when package_code in ('RM49','RM66') then 'scent_test'
     when package_code in ('RM129','RM136') then 'custom_blend'
     else package_code
   end
 where package_code is not null;

update public.bookings
   set package_name = case
     when package_code = 'scent_test' then 'RM60 Scent Test'
     when package_code = 'custom_blend' then 'RM150 Custom Blend'
     else package_name
   end
 where package_name is null;

update public.bookings
   set amount = case
     when package_code = 'scent_test' then 60
     when package_code = 'custom_blend' then 150
     else coalesce(amount, 0)
   end
 where amount is null or amount = 0;

do $$
begin
  if exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name = 'bookings'
       and column_name = 'customer_phone'
  ) then
    execute 'update public.bookings set contact = customer_phone where contact is null and customer_phone is not null';
  end if;
end $$;

NOTIFY pgrst, 'reload schema';
