# Project: PeaPods (Sublease Marketplace)

## Project Overview

PeaPods is a sublease marketplace for university students and summer interns. The platform focuses on trust-based matching, map-centric discovery, and seamless transitions for temporary housing.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript, TailwindCSS)
- **UI Components:** Shadcn/ui (Radix UI)
- **Database/Auth:** Supabase (PostgreSQL + PostGIS extension)
- **Maps:** React-Leaflet or Google Maps React
- **Payments:** Stripe (Checkout + Webhooks)
- **Deployment:** Vercel (Serverless)

## Core Architecture Principles

1. **Serverless-First:** All business logic must reside in Next.js Server Actions. No external backend service (Render/Express).
2. **Database-Driven Security:** All access control must be managed via Supabase Row-Level Security (RLS) policies. Never bypass RLS in queries.
3. **Feature-Based Folder Structure:** Use the `/features` pattern:
   - `/features/auth`
   - `/features/listings`
   - `/features/map`
   - `/features/payments`
4. **Geospatial Logic:** Use the `postgis` extension in Supabase for all location-based queries. Store locations as `geography(POINT)`.

## MVP Priorities

1. **Auth:** Supabase Auth (Google OAuth). Priority: Verified student email flow.
2. **Listings CRUD:** Full Create, Read, Update, Delete functionality.
3. **Map Discovery:** Interactive map with pin clustering. Load only listings within the current map bounding box.
4. **Payments:** Stripe Checkout for listing fees. Webhook listener for payment confirmation.

## AI Behavioral Instructions

- **Think Before Coding:** For every new feature, outline the database schema change and the server action logic before writing UI code.
- **Security First:** Always write SQL migration scripts that include RLS policies. Do not leave tables public.
- **Performance:** When implementing the map, prioritize fetching only visible bounds to keep API responses fast.
- **Maintainability:** Prioritize clean, modular components. If a component grows over 150 lines, refactor into smaller sub-components.
- **Clarification:** If an architectural decision is unclear (e.g., how to handle image storage), ask me to confirm the preferred approach before proceeding.

## Development Rules

- Use `shadcn/ui` for all UI primitives.
- Use `Lucide React` for icons.
- Use `TailwindCSS` for all styling. No external CSS files.
- All database interactions must use the provided Supabase client from `/lib/supabase`.
