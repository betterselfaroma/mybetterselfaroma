# Membership / Referral / Points — setup

The site runs **without** Supabase (marketing pages stay live); the membership
area shows a "not configured" notice until you add the env vars below.

## 1. Create a Supabase project
https://supabase.com → New project (free tier is fine).

## 2. Run the database migration
Supabase → **SQL Editor** → paste & run `supabase/migrations/0001_membership.sql`.
This creates all tables, RLS policies, the signup trigger, the booking-completion
award trigger, the redemption RPC, and seeds the reward catalogue.

## 3. Auth settings
Supabase → **Authentication → Providers → Email**: keep enabled.
For v1 (email + password, no email link), **turn OFF "Confirm email"** so members
can log in straight after registering. (Leave it on if you prefer confirmation —
registration then asks the user to confirm by email first.)

## 4. Get your keys
Supabase → **Project Settings → API**: copy the Project URL, the `anon` public key,
and the `service_role` key.

## 5. Set environment variables
Local: copy `.env.example` → `.env.local` and fill in. On **Vercel**:
Project → Settings → Environment Variables, add:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | your project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (server only) |
| `ADMIN_EMAILS` | comma-separated admin emails, e.g. `betterselfaroma@gmail.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://better-self-aroma.vercel.app` |

Then **redeploy** (push, or Vercel → Deployments → Redeploy).

## 6. Make yourself admin
Register once with the email you put in `ADMIN_EMAILS`, then visit `/admin`.
(Admin access is gated by the email allowlist, not a DB flag.)

## 7. End-to-end test
1. Register member A → gets a referral code (e.g. `ABCD1234`).
2. Open `/?ref=ABCD1234` in another browser → register member B (code auto-fills).
3. Member B books RM49 at `/book` (status `pending`).
4. Admin `/admin/bookings` → set B's booking to **completed**.
   - B gets +20 points; A gets an RM10 TNG PIN reward (`pending`) + 30 points.
5. Admin `/admin/referral-rewards` → enter a TNG PIN → **Mark issued**.
6. Member A sees the issued PIN in `/member` and `/member/referral`.

## Routes
- Public: `/` (landing with membership block), `/register`, `/login`
- Member: `/member`, `/member/referral`, `/member/rewards`, `/book`
- Admin: `/admin`, `/admin/customers`, `/admin/bookings`,
  `/admin/referral-rewards`, `/admin/points`, `/admin/redemptions`

## Security notes
- Members use the anon key; **RLS** limits them to their own rows.
- All privileged writes use the **service-role key on the server only**
  (`lib/supabase/admin.ts`, guarded by `server-only` + `ADMIN_EMAILS`).
- Awarding logic lives in DB triggers → atomic, idempotent, tamper-proof.
- TNG PINs are entered/issued manually by an admin — never auto-generated.
- Points are never cash and cannot be withdrawn; every change is written to
  `points_ledger` (balance is derived, never edited blindly).
