# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Quick install

Run the guided installer to set up everything automatically:

```bash
npm run setup
```

The installer will:
- Verify your environment (Node, npm, Expo CLI)
- Install dependencies
- Optionally run `expo prebuild`
- Optionally start the dev server

## Backend setup (Supabase)

Cloud features (attendance sync, voting sync, admin exports, email OTP sign-in) use Supabase. If you skip this, everything still works offline with local storage.

1) Create a Supabase project at https://supabase.com and copy:
- Project URL
- anon public key

2) In app.json, fill extra.supabaseUrl and extra.supabaseAnonKey:
```json
{
  "expo": {
    "extra": {
      "supabaseUrl": "https://YOUR_PROJECT.supabase.co",
      "supabaseAnonKey": "YOUR_PUBLIC_ANON_KEY",
      "brand": {
        "name": "Your Brand",
        "primary": "#0a7ea4",
        "accent": "#22d3ee",
        "logoUrl": "https://your.cdn/logo.png"
      }
    }
  }
}
```

3) In Supabase SQL editor, run the schema and restrictive RLS policies:
```sql
-- scripts/supabase.sql
```
You can paste the contents of [scripts/supabase.sql](./scripts/supabase.sql).

Notes:
- Attendance and votes are write-restricted to authenticated users (RLS).
- Profiles table manages admin roles (email, role).
- Bootstrap: The first authenticated user can upsert their own profile as admin once (if no admin exists). After that, only admins can manage roles.

4) Start the app:
```bash
npx expo start
```

## Branding

In app.json extra.brand you can set your brand name and primary color which will override the app tint:
```json
{
  "expo": {
    "extra": {
      "brand": {
        "name": "Your Brand",
        "primary": "#0a7ea4",
        "accent": "#22d3ee"
      }
    }
  }
}
```

## Features

- Animated, modern UI (glassmorphism, parallax headers, Lottie hero, custom tab bar)
- Theming with mode (System/Light/Dark) and presets (Default/AMOLED/High Contrast)
- Onboarding with persistence
- Attendance scanning (camera with barcode/QR; web fallback text input)
- Voting with ID verification and duplicate prevention (device-local and/or Supabase)
- Admin dashboard:
  - Email OTP sign-in (Supabase)
  - Optional admin email whitelist (app.json extra.adminEmails)
  - Export attendance and votes to CSV (web download or native share)

## Get started (manual)

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

### Web preview and 404 fix

If your hosting preview shows “404 Not Found” (common for SPAs), use one of these:

- Dev server (recommended):
  ```bash
  npm run web
  ```
  This starts the Expo web dev server with proper routing.

- Static export + local preview (single page fallback enabled):
  ```bash
  npm run preview:web
  ```
  This will export to dist/ and serve it on http://localhost:5000 with a SPA fallback, avoiding 404s on deep links.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
