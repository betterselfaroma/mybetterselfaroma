# Refer-a-Friend — RM10 TNG PIN (implementation spec)

The reward model: **a referrer earns an RM10 TNG PIN only after their referred
friend completes their first RM49/RM129 experience AND an admin confirms it.**
TNG PINs are **entered and issued manually** by an admin (v1) to prevent abuse —
never auto-generated, never sent on signup.

## What ships today (this repo)

- **Front-of-site section** (`components/Referral.tsx`, id `#referral`) — bilingual
  copy, 3-step flow, CTA → WhatsApp ("get my referral code"), fine print. Live.
- **`db/referral_rewards.sql`** — the `referral_rewards` table + anti-abuse constraints.

## What still needs a backend (NOT in this static site)

This site has no database, auth, customer accounts, or booking system (bookings
happen over WhatsApp). The following all require that foundation to be built or
connected first:

| Piece | Needs |
| --- | --- |
| Customer registration + per-customer `referral_code` | DB + auth |
| Capturing `?ref=CODE` at signup → `referred_by_code` | signup flow |
| Booking + `status = completed` tracking | bookings system |
| `/member/referral` dashboard | auth (member login) |
| `/admin/referral-rewards` backoffice | auth (admin role) |
| Reward generation logic | server / DB trigger |

## Referral lifecycle

1. New customer signs up; if URL has `?ref=CODE`, store `customers.referred_by_code = CODE`.
2. System validates the code exists (and is not the new customer's own).
3. New customer completes their **first** RM49 or RM129 booking.
4. Admin sets `bookings.status = 'completed'`.
5. System checks no reward already exists for this `referred_customer_id`.
6. If none, insert `referral_rewards` with `status = 'pending'`.
7. Admin reviews → `status = 'approved'`.
8. Admin fills `tng_pin_code` → `status = 'issued'`, `issued_at = now()`.
9. Referrer sees the reward + status in `/member/referral`.

## Anti-abuse rules (enforced in DB + app)

- One signup per `phone` → `customers.phone` UNIQUE.
- No self-referral → `check (referrer_customer_id <> referred_customer_id)`.
- One reward per referred customer → `unique (referred_customer_id)`.
- Reward only on `booking.status = 'completed'`; **cancelled bookings never pay out**.
- Admin can `cancel` any anomalous reward (`status = 'cancelled'`).

## Pages to build (once backend exists)

**`/member/referral`** — my code, my referral link (`…/?ref=CODE`), copy-link
button, # referred, # completed experiences, # TNG PINs earned, reward history.

**`/admin/referral-rewards`** — table of referrer / referred / package (RM49|RM129)
/ status, a TNG PIN input, and **Approve** / **Mark as issued** / **Cancel** actions.
