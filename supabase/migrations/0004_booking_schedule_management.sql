-- ============================================================================
-- Booking schedule management + booking proof QR
--
-- Extends the existing bookings table instead of replacing it. Member self
-- bookings and admin offline bookings are scheduled with start/end times and a
-- booking QR token. Completion rewards still only happen when status changes to
-- completed through the existing trigger.
-- ============================================================================

create extension if not exists pgcrypto;

alter table bookings
  alter column customer_id drop not null;

alter table bookings
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text,
  add column if not exists amount numeric,
  add column if not exists start_time timestamptz,
  add column if not exists end_time timestamptz,
  add column if not exists booking_qr_token text,
  add column if not exists booking_qr_created_at timestamptz,
  add column if not exists created_by_admin_email text,
  add column if not exists updated_at timestamptz not null default now();

update bookings
   set amount = case
     when package_type = 'scent_test' then 60
     when package_type = 'custom_blend' then 150
     else amount
   end
 where amount is null;

update bookings b
   set customer_name = coalesce(b.customer_name, c.name),
       customer_email = coalesce(b.customer_email, c.email),
       customer_phone = coalesce(b.customer_phone, c.phone)
  from customers c
 where b.customer_id = c.id;

update bookings
   set source = coalesce(nullif(source, ''), 'member_self_booking')
 where source is null or source = '';

update bookings
   set start_time = booking_date
 where start_time is null
   and booking_date is not null;

update bookings
   set end_time = start_time + case
     when package_type = 'custom_blend' then interval '60 minutes'
     else interval '30 minutes'
   end
 where end_time is null
   and start_time is not null;

update bookings
   set booking_qr_token = encode(gen_random_bytes(24), 'hex'),
       booking_qr_created_at = coalesce(created_at, now())
 where booking_qr_token is null;

create unique index if not exists bookings_booking_qr_token_key
  on bookings(booking_qr_token)
  where booking_qr_token is not null;

create index if not exists bookings_start_time_idx on bookings(start_time);
create index if not exists bookings_end_time_idx on bookings(end_time);
create index if not exists bookings_source_idx on bookings(source);

alter table bookings drop constraint if exists bookings_status_check;
alter table bookings
  add constraint bookings_status_check
  check (status in ('pending','booked','confirmed','completed','cancelled','no_show'));

alter table bookings drop constraint if exists bookings_source_check;
alter table bookings
  add constraint bookings_source_check
  check (source in ('member_self_booking','admin_offline_booking','whatsapp_manual','qr_completion'));

alter table bookings drop constraint if exists bookings_amount_check;
alter table bookings
  add constraint bookings_amount_check
  check (amount in (60,150));

alter table bookings drop constraint if exists bookings_time_order_check;
alter table bookings
  add constraint bookings_time_order_check
  check (start_time is null or end_time is null or start_time < end_time);

alter table bookings
  alter column amount set not null,
  alter column source set not null,
  alter column source set default 'member_self_booking';

create or replace function booking_has_conflict(
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_ignore_booking_id uuid default null
) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from bookings b
     where b.start_time is not null
       and b.end_time is not null
       and b.status not in ('cancelled','no_show')
       and (p_ignore_booking_id is null or b.id <> p_ignore_booking_id)
       and p_start_time < b.end_time
       and p_end_time > b.start_time
  )
$$;

create or replace function booking_amount_for_package(p_package_type text)
returns numeric
language sql immutable as $$
  select case
    when p_package_type = 'scent_test' then 60
    when p_package_type = 'custom_blend' then 150
    else null
  end
$$;

create or replace function create_scheduled_booking(
  p_customer_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_package_type text,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_source text,
  p_notes text,
  p_created_by_admin_email text default null,
  p_status text default 'booked'
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_booking bookings%rowtype;
  v_amount numeric := booking_amount_for_package(p_package_type);
  v_token text;
begin
  if v_amount is null then
    raise exception 'invalid_package';
  end if;

  if p_status not in ('pending','booked','confirmed','completed','cancelled','no_show') then
    raise exception 'invalid_status';
  end if;

  if p_source not in ('member_self_booking','admin_offline_booking','whatsapp_manual') then
    raise exception 'invalid_source';
  end if;

  if p_start_time is null or p_end_time is null or p_start_time >= p_end_time then
    raise exception 'invalid_time';
  end if;

  perform pg_advisory_xact_lock(hashtext('scent_knows_you_booking_schedule'));

  if booking_has_conflict(p_start_time, p_end_time, null) then
    raise exception 'booking_conflict';
  end if;

  loop
    v_token := encode(gen_random_bytes(24), 'hex');
    exit when not exists (select 1 from bookings where booking_qr_token = v_token);
  end loop;

  insert into bookings (
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
    created_by_admin_email
  )
  values (
    p_customer_id,
    nullif(trim(coalesce(p_customer_name, '')), ''),
    nullif(trim(coalesce(p_customer_phone, '')), ''),
    nullif(trim(coalesce(p_customer_email, '')), ''),
    p_package_type,
    v_amount,
    p_status,
    p_start_time,
    p_start_time,
    p_end_time,
    p_source,
    v_token,
    now(),
    nullif(trim(coalesce(p_notes, '')), ''),
    p_created_by_admin_email
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

create or replace function admin_update_scheduled_booking(
  p_booking_id uuid,
  p_package_type text,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_status text,
  p_notes text default null
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  v_existing bookings%rowtype;
  v_booking bookings%rowtype;
  v_amount numeric := booking_amount_for_package(p_package_type);
begin
  if v_amount is null then
    raise exception 'invalid_package';
  end if;

  if p_status not in ('pending','booked','confirmed','completed','cancelled','no_show') then
    raise exception 'invalid_status';
  end if;

  if p_start_time is null or p_end_time is null or p_start_time >= p_end_time then
    raise exception 'invalid_time';
  end if;

  select * into v_existing
    from bookings
   where id = p_booking_id
   for update;

  if not found then
    raise exception 'booking_not_found';
  end if;

  perform pg_advisory_xact_lock(hashtext('scent_knows_you_booking_schedule'));

  if p_status not in ('cancelled','no_show')
     and booking_has_conflict(p_start_time, p_end_time, p_booking_id) then
    raise exception 'booking_conflict';
  end if;

  update bookings
     set package_type = p_package_type,
         amount = v_amount,
         status = p_status,
         booking_date = p_start_time,
         start_time = p_start_time,
         end_time = p_end_time,
         notes = nullif(trim(coalesce(p_notes, '')), ''),
         completed_at = case
           when p_status = 'completed' then coalesce(v_existing.completed_at, now())
           else completed_at
         end,
         updated_at = now()
   where id = p_booking_id
   returning * into v_booking;

  return v_booking;
end;
$$;

create or replace function touch_bookings_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_bookings_updated_at on bookings;
create trigger trg_touch_bookings_updated_at
  before update on bookings
  for each row execute function touch_bookings_updated_at();

-- Keep the existing reward rules, but let offline guest bookings complete
-- without attempting member points on a null customer_id.
create or replace function award_on_booking_complete() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_referred  customers%rowtype;
  v_referrer  customers%rowtype;
  v_ppoints   int;
  v_ptype     text;
  v_rpoints   int;
  v_rtype     text;
  v_rstatus   text;
  v_label     text;
  v_reward_id uuid;
  v_existing  int;
begin
  if NEW.status = 'completed' and OLD.status is distinct from 'completed' then
    if NEW.customer_id is null then
      return NEW;
    end if;

    select * into v_referred from customers where id = NEW.customer_id;

    if NEW.package_type = 'scent_test' then
      v_ppoints := 20; v_ptype := 'purchase_rm49';
      v_rpoints := 30; v_rtype := 'referral_rm49'; v_rstatus := 'completed_rm49';
      v_label := 'RM60 scent test';
    else
      v_ppoints := 60; v_ptype := 'purchase_rm129';
      v_rpoints := 50; v_rtype := 'referral_rm129'; v_rstatus := 'completed_rm129';
      v_label := 'RM150 custom blend';
    end if;

    if not coalesce(NEW.points_awarded, false) then
      insert into points_ledger(customer_id, points, type, description, related_booking_id)
        values (NEW.customer_id, v_ppoints, v_ptype,
                'Completed '||v_label||' experience', NEW.id);
      update customers set points_balance = points_balance + v_ppoints where id = NEW.customer_id;
      NEW.points_awarded := true;
    end if;

    if not coalesce(NEW.referral_reward_created, false)
       and v_referred.referred_by_code is not null then
      select * into v_referrer from customers where referral_code = v_referred.referred_by_code;
      select count(*) into v_existing from referral_rewards where referred_customer_id = NEW.customer_id;

      if v_referrer.id is not null and v_referrer.id <> NEW.customer_id and v_existing = 0 then
        insert into referral_rewards(referrer_customer_id, referred_customer_id, booking_id, status)
          values (v_referrer.id, NEW.customer_id, NEW.id, 'pending')
          returning id into v_reward_id;

        insert into points_ledger(customer_id, points, type, description,
                                  related_booking_id, related_referral_reward_id)
          values (v_referrer.id, v_rpoints, v_rtype,
                  'Referral reward - friend completed '||v_label, NEW.id, v_reward_id);
        update customers set points_balance = points_balance + v_rpoints where id = v_referrer.id;

        update referrals
           set status = v_rstatus, completed_at = now()
         where referred_customer_id = NEW.customer_id;

        NEW.referral_reward_created := true;
      end if;
    end if;
  end if;
  return NEW;
end;
$$;


-- Rebuild completion QR RPC after scheduled booking columns exist.
create or replace function complete_booking_with_token(p_token text) returns uuid
language plpgsql security definer set search_path = public as $
declare
  v_cid uuid := current_customer_id();
  v_token booking_completion_tokens%rowtype;
  v_customer customers%rowtype;
  v_booking_id uuid;
  v_amount numeric;
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

  select * into v_customer from customers where id = v_cid;
  v_amount := booking_amount_for_package(v_token.package_type);

  insert into bookings (
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    package_type,
    amount,
    status,
    booking_date,
    notes,
    completion_token_id,
    source
  )
  values (
    v_cid,
    v_customer.name,
    v_customer.phone,
    v_customer.email,
    v_token.package_type,
    v_amount,
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
$;


grant execute on function booking_has_conflict(timestamptz,timestamptz,uuid) to authenticated;
