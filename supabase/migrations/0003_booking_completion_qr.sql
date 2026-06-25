-- ============================================================================
-- Booking completion QR check-in
--
-- Adds one-time admin-generated QR tokens for offline experience completion.
-- Completing a token creates a booking and updates it to completed, reusing the
-- existing award_on_booking_complete trigger for purchase points and referral
-- rewards.
-- ============================================================================

create extension if not exists pgcrypto;

alter table bookings
  add column if not exists completed_at timestamptz,
  add column if not exists source text,
  add column if not exists completion_token_id uuid;

create table if not exists booking_completion_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  customer_id uuid not null references customers(id) on delete cascade,
  package_type text not null check (package_type in ('scent_test','custom_blend')),
  amount numeric not null check (amount in (60,150)),
  status text not null default 'active'
    check (status in ('active','used','expired','cancelled')),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by_customer_id uuid references customers(id) on delete set null,
  created_by_admin_email text,
  created_at timestamptz not null default now()
);

alter table bookings
  drop constraint if exists bookings_completion_token_id_fkey;

alter table bookings
  add constraint bookings_completion_token_id_fkey
  foreign key (completion_token_id)
  references booking_completion_tokens(id)
  on delete set null;

create index if not exists booking_completion_tokens_customer_idx
  on booking_completion_tokens(customer_id);
create index if not exists booking_completion_tokens_status_idx
  on booking_completion_tokens(status);
create index if not exists booking_completion_tokens_expires_idx
  on booking_completion_tokens(expires_at);
create index if not exists bookings_completion_token_idx
  on bookings(completion_token_id);

alter table booking_completion_tokens enable row level security;

create or replace function complete_booking_with_token(p_token text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_cid uuid := current_customer_id();
  v_token booking_completion_tokens%rowtype;
  v_booking_id uuid;
begin
  if v_cid is null then
    raise exception 'not_authenticated';
  end if;

  select *
    into v_token
    from booking_completion_tokens
   where token = p_token
   for update;

  if not found then
    raise exception 'invalid_token';
  end if;

  if v_token.customer_id <> v_cid then
    raise exception 'wrong_customer';
  end if;

  if v_token.status = 'used' then
    raise exception 'token_used';
  end if;

  if v_token.status <> 'active' then
    raise exception 'invalid_token';
  end if;

  if v_token.expires_at <= now() then
    update booking_completion_tokens
       set status = 'expired'
     where id = v_token.id
       and status = 'active';
    raise exception 'token_expired';
  end if;

  insert into bookings (
    customer_id,
    package_type,
    status,
    booking_date,
    notes,
    completion_token_id,
    source
  )
  values (
    v_cid,
    v_token.package_type,
    'pending',
    now(),
    'Completed via booking completion QR',
    v_token.id,
    'qr_completion'
  )
  returning id into v_booking_id;

  update bookings
     set status = 'completed',
         completed_at = now(),
         source = 'qr_completion'
   where id = v_booking_id;

  update booking_completion_tokens
     set status = 'used',
         used_at = now(),
         used_by_customer_id = v_cid
   where id = v_token.id;

  return v_booking_id;
end;
$$;

grant execute on function complete_booking_with_token(text) to authenticated;
