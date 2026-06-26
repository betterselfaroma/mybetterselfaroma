-- Admin PWA mobile support.
-- This project uses public.customers as the member/profile table.
-- Idempotent: no table drops and no existing data deletion.

create extension if not exists pgcrypto;

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

create unique index if not exists customers_qr_token_key
  on public.customers(qr_token)
  where qr_token is not null;

alter table public.bookings
  add column if not exists package_name text,
  add column if not exists package_code text,
  add column if not exists amount numeric default 0,
  add column if not exists booking_date date,
  add column if not exists booking_time text,
  add column if not exists contact text,
  add column if not exists notes text,
  add column if not exists status text default 'pending',
  add column if not exists created_at timestamptz default now();

update public.bookings
   set package_code = coalesce(package_code, package_type)
 where package_code is null;

update public.bookings
   set package_code = case
     when package_code in ('RM49','RM60','RM66','scent_test') then 'scent_test'
     when package_code in ('RM129','RM150','RM136','custom_blend') then 'custom_blend'
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

NOTIFY pgrst, 'reload schema';
