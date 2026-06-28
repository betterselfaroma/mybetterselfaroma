# Supabase Current Schema Baseline

This file records the schema shape the app currently expects. It is a baseline
reference for future migrations and debugging, not a one-click migration file.

## Core Customer Fields

`customers` is the canonical member table.

- `id uuid`
- `auth_user_id uuid`
- `name text`
- `email text`
- `phone text`
- `referral_code text`
- `referred_by_code text`
- `points_balance integer`
- `points integer`
- `qr_token text`
- `role text`
- `is_admin boolean`
- `created_at timestamptz`

Admin access must be based on at least one of:

- `role = 'admin'`
- `role = 'staff'`
- `is_admin = true`
- configured server-side admin email allowlist

Never put `SUPABASE_SERVICE_ROLE_KEY` in the website client bundle, Vite app, or
native app.

## Current Booking Fields

Current app reads and writes must use:

- `id uuid`
- `customer_id uuid`
- `user_id uuid`
- `package_type text`
- `package_name text`
- `package_code text`
- `amount numeric`
- `booking_date date`
- `booking_time text`
- `contact text`
- `notes text`
- `status text`
- `points_awarded boolean`
- `referral_reward_created boolean`
- `created_at timestamptz`

Do not add new code that reads from:

- `bookings.start_time`
- `bookings.end_time`
- `bookings.customer_name`
- `bookings.customer_phone`
- `bookings.service_name`

If older migrations mention these fields, treat them as historical compatibility
work, not the current application contract.

## Points And Audit

Points changes must update member points and write a transaction row.

Expected tables:

- `points_transactions`
- `points_ledger`
- `admin_audit_logs`

Admin/staff actions that change points or bookings should write
`admin_audit_logs`.

## Rewards Products

Current rewards product feature expects:

- `reward_products`
- `reward_redemptions`

If `reward_products` is missing, run the rewards product migration before using
the Admin rewards page.

## CMS

The homepage CMS layer expects:

- `site_pages`
- `page_sections`
- `media_assets`
- `site_settings`

The public homepage keeps hardcoded fallbacks so missing CMS rows should not
break the site.

## QR Tokens

Member QR identity uses `customers.qr_token`.

Do not use:

- phone number
- email
- `auth_user_id`
- `referral_code`

as QR token content.

QR URL format:

`https://scentknowsyou.com/member/checkin?token=USER_QR_TOKEN`

## App Boundaries

- Root app is the Next.js website.
- `mobile-admin` is the older Capacitor app.
- `native-admin` is the newer native Expo/React Native Admin app.
- Vercel must only build the root Next.js website.
