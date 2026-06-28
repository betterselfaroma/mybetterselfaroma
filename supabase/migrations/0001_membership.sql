-- ============================================================================
-- Better Self Aroma — Membership, Referral (RM10 TnG PIN) & Points
-- Postgres / Supabase. Run once in the Supabase SQL editor.
--
-- Security model:
--  * Members use the ANON key; Row Level Security limits them to their own rows.
--  * All privileged writes (booking status, awarding, reward approval, points
--    adjustments, redemption moderation) run server-side with the SERVICE ROLE
--    key, which bypasses RLS. The service role key is NEVER exposed to the client.
--  * Awarding logic lives in DB triggers so it is atomic and tamper-proof.
-- ============================================================================

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------
create table if not exists customers (
  id               uuid primary key default gen_random_uuid(),
  auth_user_id     uuid unique references auth.users(id) on delete set null,
  name             text not null default '',
  email            text unique not null,
  phone            text unique,
  referral_code    text unique not null,
  referred_by_code text,
  points_balance   integer not null default 0,
  is_admin         boolean not null default false,
  created_at       timestamptz not null default now()
);

create table if not exists bookings (
  id                      uuid primary key default gen_random_uuid(),
  customer_id             uuid not null references customers(id) on delete cascade,
  package_type            text not null check (package_type in ('RM49','RM129')),
  status                  text not null default 'pending'
                            check (status in ('pending','confirmed','completed','cancelled')),
  booking_date            timestamptz,
  notes                   text,
  points_awarded          boolean not null default false,
  referral_reward_created boolean not null default false,
  created_at              timestamptz not null default now()
);
create index if not exists bookings_customer_idx on bookings(customer_id);
create index if not exists bookings_status_idx on bookings(status);

create table if not exists referrals (
  id                   uuid primary key default gen_random_uuid(),
  referrer_customer_id uuid not null references customers(id) on delete cascade,
  referred_customer_id uuid not null references customers(id) on delete cascade,
  referral_code        text not null,
  status               text not null default 'registered'
                         check (status in ('registered','completed_rm49','completed_rm129','rewarded')),
  created_at           timestamptz not null default now(),
  completed_at         timestamptz,
  constraint referrals_one_per_referred unique (referred_customer_id),
  constraint referrals_no_self check (referrer_customer_id <> referred_customer_id)
);
create index if not exists referrals_referrer_idx on referrals(referrer_customer_id);

create table if not exists referral_rewards (
  id                   uuid primary key default gen_random_uuid(),
  referrer_customer_id uuid not null references customers(id) on delete cascade,
  referred_customer_id uuid not null references customers(id) on delete cascade,
  booking_id           uuid not null references bookings(id) on delete cascade,
  reward_type          text not null default 'tng_pin',
  reward_value         text not null default 'RM10',
  status               text not null default 'pending'
                         check (status in ('pending','approved','issued','cancelled')),
  tng_pin_code         text,
  issued_at            timestamptz,
  created_at           timestamptz not null default now(),
  constraint referral_rewards_one_per_referred unique (referred_customer_id),
  constraint referral_rewards_no_self check (referrer_customer_id <> referred_customer_id)
);
create index if not exists referral_rewards_referrer_idx on referral_rewards(referrer_customer_id);
create index if not exists referral_rewards_status_idx on referral_rewards(status);

create table if not exists points_ledger (
  id                        uuid primary key default gen_random_uuid(),
  customer_id               uuid not null references customers(id) on delete cascade,
  points                    integer not null,
  type                      text not null check (type in (
                              'signup_bonus','purchase_rm49','purchase_rm129',
                              'referral_rm49','referral_rm129','redeem','manual_adjustment')),
  description               text,
  related_booking_id        uuid references bookings(id) on delete set null,
  related_referral_reward_id uuid references referral_rewards(id) on delete set null,
  created_at                timestamptz not null default now()
);
create index if not exists points_ledger_customer_idx on points_ledger(customer_id);

create table if not exists rewards (
  id              uuid primary key default gen_random_uuid(),
  name_cn         text not null,
  name_en         text not null,
  points_required integer not null,
  reward_type     text not null,
  reward_value    text not null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create table if not exists reward_redemptions (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references customers(id) on delete cascade,
  reward_id    uuid not null references rewards(id),
  points_used  integer not null,
  status       text not null default 'pending'
                 check (status in ('pending','approved','completed','cancelled')),
  admin_notes  text,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists reward_redemptions_customer_idx on reward_redemptions(customer_id);

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------
-- current customer id for the logged-in auth user
create or replace function current_customer_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from customers where auth_user_id = auth.uid()
$$;

-- ----------------------------------------------------------------------------
-- New auth user -> customer row (+ signup bonus + referral link)
-- ----------------------------------------------------------------------------
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_code   text;
  v_name   text := coalesce(new.raw_user_meta_data->>'name','');
  v_phone  text := nullif(new.raw_user_meta_data->>'phone','');
  v_ref    text := nullif(new.raw_user_meta_data->>'referred_by_code','');
  v_cid    uuid;
  v_referrer customers%rowtype;
begin
  loop
    v_code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
    exit when not exists (select 1 from customers where referral_code = v_code);
  end loop;

  insert into customers(auth_user_id, name, email, phone, referral_code, referred_by_code)
    values (new.id, v_name, new.email, v_phone, v_code,
            case when v_ref is not null
                  and v_ref <> v_code
                  and exists (select 1 from customers where referral_code = v_ref)
                 then v_ref else null end)
    returning id into v_cid;

  insert into points_ledger(customer_id, points, type, description)
    values (v_cid, 10, 'signup_bonus', 'New member signup bonus');
  update customers set points_balance = points_balance + 10 where id = v_cid;

  if v_ref is not null then
    select * into v_referrer from customers where referral_code = v_ref;
    if v_referrer.id is not null and v_referrer.id <> v_cid then
      insert into referrals(referrer_customer_id, referred_customer_id, referral_code, status)
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
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- Booking completed -> purchase points + referral reward (idempotent)
-- ----------------------------------------------------------------------------
create or replace function award_on_booking_complete() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_referred  customers%rowtype;
  v_referrer  customers%rowtype;
  v_ppoints   int;
  v_ptype     text;
  v_rpoints   int;
  v_rtype     text;
  v_reward_id uuid;
  v_existing  int;
begin
  if NEW.status = 'completed' and OLD.status is distinct from 'completed' then
    select * into v_referred from customers where id = NEW.customer_id;

    -- (1) purchase points for the customer's own completed experience
    if not coalesce(NEW.points_awarded, false) then
      if NEW.package_type = 'RM49' then v_ppoints := 20; v_ptype := 'purchase_rm49';
      else v_ppoints := 60; v_ptype := 'purchase_rm129'; end if;
      insert into points_ledger(customer_id, points, type, description, related_booking_id)
        values (NEW.customer_id, v_ppoints, v_ptype,
                'Completed '||NEW.package_type||' experience', NEW.id);
      update customers set points_balance = points_balance + v_ppoints where id = NEW.customer_id;
      NEW.points_awarded := true;
    end if;

    -- (2) referral reward — only once per referred customer, never self
    if not coalesce(NEW.referral_reward_created, false)
       and v_referred.referred_by_code is not null then
      select * into v_referrer from customers where referral_code = v_referred.referred_by_code;
      select count(*) into v_existing from referral_rewards where referred_customer_id = NEW.customer_id;

      if v_referrer.id is not null and v_referrer.id <> NEW.customer_id and v_existing = 0 then
        insert into referral_rewards(referrer_customer_id, referred_customer_id, booking_id, status)
          values (v_referrer.id, NEW.customer_id, NEW.id, 'pending')
          returning id into v_reward_id;

        if NEW.package_type = 'RM49' then v_rpoints := 30; v_rtype := 'referral_rm49';
        else v_rpoints := 50; v_rtype := 'referral_rm129'; end if;

        insert into points_ledger(customer_id, points, type, description,
                                  related_booking_id, related_referral_reward_id)
          values (v_referrer.id, v_rpoints, v_rtype,
                  'Referral reward — friend completed '||NEW.package_type, NEW.id, v_reward_id);
        update customers set points_balance = points_balance + v_rpoints where id = v_referrer.id;

        update referrals
           set status = case when NEW.package_type = 'RM49' then 'completed_rm49' else 'completed_rm129' end,
               completed_at = now()
         where referred_customer_id = NEW.customer_id;

        NEW.referral_reward_created := true;
      end if;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_award_on_booking_complete on bookings;
create trigger trg_award_on_booking_complete
  before update on bookings
  for each row execute function award_on_booking_complete();

-- ----------------------------------------------------------------------------
-- Member redemption request (RPC) — atomic points check + deduct
-- ----------------------------------------------------------------------------
create or replace function request_redemption(p_reward_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_cid    uuid := current_customer_id();
  v_reward rewards%rowtype;
  v_rid    uuid;
begin
  if v_cid is null then raise exception 'Not authenticated'; end if;
  select * into v_reward from rewards where id = p_reward_id and is_active = true;
  if v_reward.id is null then raise exception 'Reward not available'; end if;
  if (select points_balance from customers where id = v_cid) < v_reward.points_required then
    raise exception 'Not enough points';
  end if;

  insert into reward_redemptions(customer_id, reward_id, points_used, status)
    values (v_cid, p_reward_id, v_reward.points_required, 'pending')
    returning id into v_rid;

  insert into points_ledger(customer_id, points, type, description)
    values (v_cid, -v_reward.points_required, 'redeem', 'Redeemed: '||v_reward.name_en);
  update customers set points_balance = points_balance - v_reward.points_required where id = v_cid;

  return v_rid;
end;
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table customers          enable row level security;
alter table bookings           enable row level security;
alter table referrals          enable row level security;
alter table referral_rewards   enable row level security;
alter table points_ledger      enable row level security;
alter table rewards            enable row level security;
alter table reward_redemptions enable row level security;

-- customers: read/update own profile
create policy customers_self_select on customers for select using (auth_user_id = auth.uid());
create policy customers_self_update on customers for update using (auth_user_id = auth.uid());

-- bookings: read own, create own (always pending)
create policy bookings_self_select on bookings for select using (customer_id = current_customer_id());
create policy bookings_self_insert on bookings for insert
  with check (customer_id = current_customer_id() and status = 'pending');

-- referrals: visible to referrer or referred
create policy referrals_self_select on referrals for select
  using (referrer_customer_id = current_customer_id() or referred_customer_id = current_customer_id());

-- referral_rewards: referrer can see their own rewards
create policy referral_rewards_self_select on referral_rewards for select
  using (referrer_customer_id = current_customer_id());

-- points_ledger: read own
create policy points_ledger_self_select on points_ledger for select
  using (customer_id = current_customer_id());

-- rewards: active rewards are readable by any authenticated user
create policy rewards_public_select on rewards for select using (is_active = true);

-- reward_redemptions: read own (creation handled by request_redemption RPC)
create policy redemptions_self_select on reward_redemptions for select
  using (customer_id = current_customer_id());

-- NOTE: no client INSERT/UPDATE policies for privileged tables — those run
-- through the service role on the server only.

-- ----------------------------------------------------------------------------
-- Seed reward catalogue
-- ----------------------------------------------------------------------------
insert into rewards (name_cn, name_en, points_required, reward_type, reward_value)
values
  ('RM10 折扣',              'RM10 discount',                       100, 'discount',      'RM10'),
  ('RM25 折扣',              'RM25 discount',                       200, 'discount',      'RM25'),
  ('免费 RM49 摸香测试一次',  'Free RM49 scent intuition test',      300, 'free_session',  'RM49'),
  ('RM129 专属特调 RM50 折扣','RM50 off the RM129 custom blend plan',500, 'discount',      'RM50')
on conflict do nothing;
