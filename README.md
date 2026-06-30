# PeaPods

PeaPods is a sublease marketplace built for university students and summer interns. It focuses on trust-based matching, map-first discovery, and fast temporary housing search.

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth + PostgreSQL + PostGIS
- React Leaflet + marker clustering
- Vercel

## Current Features

- Google OAuth with Supabase
- Listing create, read, and delete flows
- Map-based listing discovery
- Address autocomplete via `/api/address-search`
- Automatic geocoding from address input
- Demo listing seed migration

## Project Structure

```text
app/                  Next.js app routes and API routes
features/auth/        Auth UI
features/listings/    Listing forms and cards
features/map/         Map UI and map helpers
lib/actions/          Server Actions
lib/supabase/         Supabase client helpers
supabase/migrations/  Database schema and seed SQL
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Add your environment variables to `.env.local`.

3. Apply Supabase migrations.

If you are using the Supabase CLI:

```bash
supabase db push
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Database Notes

- PostGIS is enabled for geospatial listing storage.
- Listing locations are stored as `geography(POINT, 4326)`.
- Row Level Security is enabled on core tables.
- Demo listings are seeded through `supabase/migrations/004_seed_demo_listings.sql`.

## Deployment

This project is designed for deployment on Vercel.

Before deploying:

- Set the same environment variables in Vercel.
- Make sure Supabase migrations have been applied.
- Use a patched Next.js version in `package.json`.

## Status

MVP progress:

- Auth: done
- Listings CRUD: in progress
- Map discovery: done
- Payments: not started
