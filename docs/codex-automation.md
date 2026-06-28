# Codex Automation Workflow

Use these checks before changing production-facing parts of Better Self Aroma / 香气读懂你的心.

## Before Website Deploy

Run:

```bash
npm run check:prod
```

This verifies the main Next.js app can build, `mobile-admin` is excluded from the Vercel/root build path, required PWA assets exist, dangerous booking fields are not selected, and obvious secret leaks are blocked.

## Before Debug APK

Run:

```bash
npm run apk:debug
```

This builds the standalone `mobile-admin` Capacitor app, syncs Android, and runs `assembleDebug`. It does not build a Release APK or AAB.

## mobile-admin/.env.local

Create `mobile-admin/.env.local` locally when the mobile Admin app needs to run or build:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://scentknowsyou.com
```

Only use the Supabase anon key in the mobile app. Never add a service-role key to `mobile-admin/.env.local`.

## Secrets That Must Not Be Submitted

- `.env.local`
- `mobile-admin/.env.local`
- Supabase service-role key values
- Android keystores and signing files
- Play Store signing passwords or upload credentials
- Generated APK/AAB files unless there is an explicit release handoff

## Common Errors

### `bookings.start_time does not exist`

Use the current booking fields: `booking_date`, `booking_time`, `contact`, `package_name`, `package_code`, `amount`, `notes`, `status`, `created_at`, and `user_id`. Do not reintroduce `start_time` unless the database migration, UI, and generated types are intentionally updated together.

### `bookings.customer_name does not exist`

Do not select `customer_name` from `bookings`. Use member/customer data through the supported relationship or fall back to `contact` where the current UI allows it.

### `@capacitor/cli` Is Scanned By Vercel

Confirm `.vercelignore` contains:

```text
mobile-admin
mobile-admin/**
```

Also keep `mobile-admin` excluded from the root `tsconfig.json` so the main website build does not type-check the Capacitor app.

### Supabase Anon Key Missing

For the website, check root `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

For the mobile Admin app, check `mobile-admin/.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### APK Login Failed

Check these in order:

1. `mobile-admin/.env.local` points to the correct Supabase project.
2. The APK was rebuilt after changing env values.
3. The user can sign in with Supabase Auth.
4. The matching customer row has `role = admin` or `role = staff`, or `is_admin = true`.
5. The mobile app is using the anon key, not the service-role key.
