# Better Self Aroma / 香气读懂你的心 Codex Rules

This repository contains two separate apps:

- The main website is a Next.js app at the repository root.
- `mobile-admin` is a standalone Capacitor Android app for Admin/staff use.

## Build Boundaries

- Vercel builds only the main Next.js website.
- Vercel must not build or install `mobile-admin`.
- Keep `mobile-admin` listed in `.vercelignore`.
- Keep `mobile-admin` excluded from the root TypeScript/Next.js build scan.
- Do not submit `mobile-admin/.env.local`.
- Do not submit Android keystores, signing files, Gradle caches, or APK build outputs.

## Secrets

- Never put `SUPABASE_SERVICE_ROLE_KEY` in frontend code, public env vars, Vite env vars, or the APK.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must stay outside client bundles.
- The mobile app may use only the Supabase URL and anon key needed for normal authenticated client access.

## Bookings Schema

The real `bookings` table fields currently used by the product are:

- `booking_date`
- `booking_time`
- `contact`
- `package_name`
- `package_code`
- `amount`
- `notes`
- `status`
- `created_at`
- `user_id`

Do not use `start_time`, `end_time`, or `customer_name` for new booking reads/writes unless a database migration, generated types, UI, and deployment plan officially support those fields.

## Points And Admin Audit

- Points changes must write `points_transactions`.
- Admin/staff actions must write `admin_audit_logs`.
- Regular `member` users must not enter Admin routes or the mobile Admin app.
- Only `admin` and `staff` users can operate backend/Admin workflows.

## Required Local Checks

- Run `npm run check:prod` before deploying the main website.
- Run `npm run apk:debug` before sharing a mobile Admin Debug APK.
- Do not run or create a Release APK unless explicitly requested.
