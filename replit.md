# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Application: Savor — Digital Menu & Restaurant Management SaaS

**Artifact**: `artifacts/savor/` (react-vite, served at `/`)

Savor is a full restaurant management platform with:
- **Digital Menu** (`/menu`) — customer-facing menu with category filtering, search, cart, and order placement
- **Admin Panel** (`/admin`) — analytics, menu item management, categories, branding, QR codes, settings
- **Kitchen Display** (`/kitchen`) — real-time order queue for kitchen staff
- **Board Display** (`/board`) — large-screen menu board for restaurants
- **POS** (`/pos`) — point-of-sale interface for staff
- **Table QR** (`/t/{tableNumber}`) — redirects customers to the menu with table number locked in

**Tech stack within the artifact**:
- TanStack Router (file-based routing in `src/routes/`)
- TanStack React Query for data fetching
- Supabase for real-time data sync (with local storage fallback)
- @dnd-kit for drag-and-drop category reordering
- Tailwind CSS v4 with custom sage green theme (Public Sans + Inter fonts)
- motion (Framer Motion) for animations
- Offline-capable with a sync engine queue

**Supabase**: Hardcoded defaults in `src/lib/supabase-config.ts`. Override with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` env vars.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
