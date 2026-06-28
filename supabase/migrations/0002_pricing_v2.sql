-- ============================================================================
-- Better Self Aroma — Pricing v2 (RM60 / RM150) + stable package codes
--
-- Decouples package_type from the displayed price so future price changes only
-- touch the frontend price map, never the database:
--   scent_test   = 摸香状态测试体验   (displayed as RM60)
--   custom_blend = 专属特调精油方案   (displayed as RM150)
--
-- Run AFTER 0001_membership.sql. Idempotent: safe to run once on an existing
-- database that already has RM49/RM129 (or RM66/RM136) booking rows.
--
-- NOTE: points_ledger.type and referrals.status keep their existing enum
-- strings (purchase_rm49 / completed_rm129 …) as opaque internal identifiers,
-- so their CHECK constraints are left untouched. Only the DISPLAY price changes.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Migrate bookings.package_type to stable codes
-- ----------------------------------------------------------------------------
alter table bookings drop constraint if exists bookings_package_type_check;

update bookings set package_type = 'scent_test'   where package_type in ('RM49','RM66');
update bookings set package_type = 'custom_blend' where package_type in ('RM129','RM136');

alter table bookings
  add constraint bookings_package_type_check
  check (package_type in ('scent_test','custom_blend'));

-- ----------------------------------------------------------------------------
-- 2) Re-create the award trigger function for the new codes.
--    Point values are unchanged:
--      own completion    — scent_test +20, custom_blend +60
--      referral reward   — scent_test +30, custom_blend +50  (+ RM10 TnG PIN)
--    The trigger trg_award_on_booking_complete keeps pointing at this function.
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
  v_rstatus   text;
  v_label     text;
  v_reward_id uuid;
  v_existing  int;
begin
  if NEW.status = 'completed' and OLD.status is distinct from 'completed' then
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

    -- (1) purchase points for the customer's own completed experience
    if not coalesce(NEW.points_awarded, false) then
      insert into points_ledger(customer_id, points, type, description, related_booking_id)
        values (NEW.customer_id, v_ppoints, v_ptype,
                'Completed '||v_label||' experience', NEW.id);
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

        insert into points_ledger(customer_id, points, type, description,
                                  related_booking_id, related_referral_reward_id)
          values (v_referrer.id, v_rpoints, v_rtype,
                  'Referral reward — friend completed '||v_label, NEW.id, v_reward_id);
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

-- ----------------------------------------------------------------------------
-- 3) Update reward catalogue copy to the new prices (points_required unchanged)
-- ----------------------------------------------------------------------------
update rewards
   set name_cn = '免费 RM60 摸香测试一次',
       name_en = 'Free RM60 scent intuition test',
       reward_value = 'RM60'
 where name_en = 'Free RM49 scent intuition test';

update rewards
   set name_cn = 'RM150 专属特调 RM50 折扣',
       name_en = 'RM50 off the RM150 custom blend plan'
 where name_en = 'RM50 off the RM129 custom blend plan';
