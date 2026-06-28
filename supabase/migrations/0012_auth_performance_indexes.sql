-- Auth/member flow performance indexes.
-- Idempotent: no table drops and no existing row deletion.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'customers' and column_name = 'email'
  ) then
    execute 'create index if not exists customers_email_idx on public.customers (lower(email))';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'customers' and column_name = 'auth_user_id'
  ) then
    execute 'create index if not exists customers_auth_user_id_idx on public.customers (auth_user_id)';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'customers' and column_name = 'referral_code'
  ) then
    execute 'create index if not exists customers_referral_code_idx on public.customers (referral_code)';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'customers' and column_name = 'qr_token'
  ) then
    execute 'create index if not exists customers_qr_token_idx on public.customers (qr_token) where qr_token is not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'user_id'
  ) then
    execute 'create index if not exists bookings_user_id_idx on public.bookings (user_id)';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'contact'
  ) then
    execute 'create index if not exists bookings_contact_idx on public.bookings (contact)';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'booking_date'
  ) then
    execute 'create index if not exists bookings_booking_date_idx on public.bookings (booking_date)';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'status'
  ) then
    execute 'create index if not exists bookings_status_idx on public.bookings (status)';
  end if;
end $$;

notify pgrst, 'reload schema';
