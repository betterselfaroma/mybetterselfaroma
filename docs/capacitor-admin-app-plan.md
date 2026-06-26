# Admin App Capacitor Migration Plan

This plan keeps the current Next.js + Supabase Admin PWA working while preparing a later move to a more native Android app shell.

## Why The Current TWA Feels Limited

Trusted Web Activity is fast to package because it wraps the deployed PWA, but the app still behaves mostly like Chrome:

- The launcher icon, splash screen and install behavior depend heavily on PWA metadata and cached assets.
- First launch can feel like a website because the app must load the remote page before the Admin UI appears.
- Camera permission and QR scanning work, but the permission flow still feels browser-like.
- Status bar, navigation bar, splash screen timing and app lifecycle control are limited.
- Cache issues can persist if an older service worker cached Admin HTML.

## Why Capacitor Is A Better Next Step

Capacitor gives the Admin system a real Android project while still reusing the existing web app:

- Native splash screen control.
- Native status bar and Android system UI styling.
- Cleaner camera permission flow.
- App lifecycle hooks for resume, pause and refresh.
- Easier future access to native device APIs.
- Better path toward a Play Store build when the Admin workflow is stable.

## Recommended Approach

Start with the existing hosted Admin app as the web source:

- Production URL: `https://scentknowsyou.com/admin`
- Package name: `com.betterselfaroma.admin`
- App name: `香气读懂你的心 Admin`
- Short name: `Scent Admin`
- Orientation: portrait
- Theme color: `#2f5d46`
- Background color: `#f7f1e6`

This keeps the same Supabase auth, RLS, admin/staff permissions, booking logic, points logic and QR scanning pages.

## Plugins To Add

Use only what the Admin workflow needs:

- `@capacitor/app` for app lifecycle and deep link handling.
- `@capacitor/browser` if external links need controlled opening.
- `@capacitor/camera` only if QR scanning is later moved from `html5-qrcode` to a native camera flow.
- `@capacitor/splash-screen` for a polished launch screen.
- `@capacitor/status-bar` for native status bar color and contrast.
- `@capacitor/preferences` only if a small native setting cache is needed.

## Migration Steps

1. Keep the current PWA deployed and stable.
2. Create a separate Capacitor workspace, for example `capacitor-admin/`.
3. Install Capacitor:

   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init "香气读懂你的心 Admin" com.betterselfaroma.admin
   ```

4. Configure `capacitor.config.ts`:

   ```ts
   import type { CapacitorConfig } from "@capacitor/cli";

   const config: CapacitorConfig = {
     appId: "com.betterselfaroma.admin",
     appName: "香气读懂你的心 Admin",
     webDir: "out",
     server: {
       url: "https://scentknowsyou.com/admin",
       cleartext: false,
     },
     plugins: {
       SplashScreen: {
         backgroundColor: "#f7f1e6",
         showSpinner: false,
       },
       StatusBar: {
         style: "DARK",
         backgroundColor: "#f7f1e6",
       },
     },
   };

   export default config;
   ```

5. Add Android:

   ```bash
   npx cap add android
   ```

6. Add native assets:

   - Use `public/icons/icon-512.png` as the app icon source.
   - Use `public/icons/admin-splash.png` as the splash reference.
   - Generate Android adaptive icon and splash resources with Android Studio or a Capacitor asset tool.

7. Build and open Android Studio:

   ```bash
   npx cap sync android
   npx cap open android
   ```

8. Generate a Debug APK from Android Studio or Gradle.

## Testing Checklist

- App opens directly to Admin login or Dashboard.
- Admin login stays signed in after closing and reopening.
- Regular members cannot enter Admin pages.
- Dashboard loads without old cached booking errors.
- Bookings, Members, Points and Settings tabs work.
- Scan page requests camera permission only after tapping scan.
- QR scanning works on HTTPS.
- Add points, redeem points and booking status updates write to Supabase correctly.
- Status bar and splash screen match the brand.

## Notes Before Release

- Do not commit keystores or signing passwords.
- Keep `.env.local`, Supabase service role keys and local Android build output out of Git.
- Release APK/AAB needs a release signing key and a release SHA256 fingerprint.
- If Capacitor uses the hosted URL, Supabase environment variables stay on Vercel, not in the Android app.
- If a fully bundled offline web build is used later, review auth redirects, site URL handling and camera permissions again.
