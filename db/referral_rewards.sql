-- ============================================================================
-- Better Self Aroma — Refer-a-Friend (RM10 TNG PIN) schema
-- Postgres / Supabase dialect.
--
-- NOTE: This migration assumes `customers` and `bookings` tables already
-- exist. The current website is a static marketing site and does NOT yet
-- include those tables / auth / a booking system — see docs/REFERRAL-SYSTEM.md
-- for the supporting columns each must have before this can run.
-- ============================================================================

-- Supporting columns the referral flow depends on (add if missing):
--
-- customers:
--   referral_code     text unique         -- this customer's own code to share
--   referred_by_code  text                -- code captured from ?ref=CODE at signup
--   phone             text unique         -- anti-abuse: one signup per phone
--
-- bookings:
--   customer_id       uuid references customers(id)
--   package           text                -- 'RM49' | 'RM129'
--   status            text                -- ... 'completed' | 'cancelled' ...
--   is_first          boolean             -- true on the customer's first booking

create table if not exists referral_rewards (
  id                    uuid primary key default gen_random_uuid(),
  referrer_customer_id  uuid not null references customers(id),
  referred_customer_id  uuid not null references customers(id),
  booking_id            uuid not null references bookings(id),
  reward_type           text not null default 'tng_pin',
  reward_value          text not null default 'RM10',
  status                text not null default 'pending'
                          check (status in ('pending','approved','issued','cancelled')),
  tng_pin_code          text,                          -- filled in by admin, never auto
  issued_at             timestamptz,
  created_at            timestamptz not null default now(),

  -- Anti-abuse guarantees, enforced at the DB level:
  -- 1) a given referred customer can only ever trigger ONE reward
  constraint referral_rewards_one_per_referred unique (referred_customer_id),
  -- 2) you cannot refer yourself
  constraint referral_rewards_no_self_referral
    check (referrer_customer_id <> referred_customer_id)
);

create index if not exists referral_rewards_referrer_idx
  on referral_rewards (referrer_customer_id);
create index if not exists referral_rewards_status_idx
  on referral_rewards (status);

-- Optional hardening: a TNG PIN may only be set when status moves to 'issued',
-- and issued_at must accompany it. (Enforce in app layer or a trigger.)
