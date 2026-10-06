# Phase 0 audit — rider gate vs role / accountType / riders row

Date: 2026-10-06

## Before

| Check | Finding |
|-------|---------|
| `/rider` gate | Soft only: redirected when `role === client` **and** `accountType !== driver` |
| Enter driver | `setAccountTypePreference("driver")` only wrote AsyncStorage — **no** `riders` row, **no** `users.role` flip |
| Vehicle | Register collected vehicle; switch-from-passenger did not |
| `riders` RLS (schema.sql) | SELECT + INSERT only — **no UPDATE** (online toggle / GPS would fail under strict RLS) |
| Driver Home map | Already used `RouteMap` → Carto tiles, but center defaulted to **0,0** (blank ocean) |

## After (this phase)

| Fix | Where |
|-----|--------|
| `ensureDriverIdentity` / `ensureClientIdentity` | `mobile/lib/driver-bootstrap.ts` |
| Preference switch also bootstraps role + riders/clients | `mobile/context/auth.tsx` |
| Vehicle prompt on first switch to driver | Account + Settings via `switchToDriverMode` |
| Layout ensures riders row on enter | `mobile/app/rider/_layout.tsx` |
| RLS + `accept_delivery` + declines | `supabase/migrations/20261006140000_driver_phase0_rls.sql` |
| Map center Nigeria until GPS; RouteMap sized for tiles | `rider/index.tsx`, `RouteMap.tsx` |

## Apply migration

Run the SQL in `supabase/migrations/20261006140000_driver_phase0_rls.sql` against the project (Supabase SQL editor or CLI) if it is not already applied.
