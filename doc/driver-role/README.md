# Driver role — implementation pack

This folder holds the plan and checklist for finishing the **driver (rider)** experience in the Gratitude Ride Expo app.

## Files

| File | Purpose |
|------|---------|
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Full phased plan (what exists, goals, phases, DoD) |
| [TODO.md](./TODO.md) | Checkable to-do list — work through this in order |
| [CURRENT_STATE.md](./CURRENT_STATE.md) | Snapshot of what already ships in `/rider` |
| [PHASE0_AUDIT.md](./PHASE0_AUDIT.md) | Phase 0 gate/RLS audit notes |

## How to use

1. Read **CURRENT_STATE** so you know what not to rebuild.
2. Follow **TODO** top to bottom (Phase 0 → 5).
3. Use **IMPLEMENTATION_PLAN** when you need context for a phase.
4. Tick items in `TODO.md` as you finish them (`[ ]` → `[x]`).

## App paths (quick map)

- Mobile driver UI: `mobile/app/rider/`
- Matching / accept: `mobile/lib/ride-matching.ts`
- GPS publish: `mobile/lib/driver-location.ts`
- Rider row helpers: `mobile/lib/deliveries.ts` (`ensureRiderId`)
- Types: `mobile/types/database.ts` (`riders`, `deliveries`, `delivery_declines`)

## Suggested cadence

| Week | Focus |
|------|--------|
| 1 | Phase 0 + Phase 1 (identity + full trip smoke) |
| 2 | Phase 2 (Account / profile / vehicle / inbox) |
| 3 | Phase 3 + Phase 4 (Discover + earnings / verification UI) |
| 4 | Phase 5 (push, safety, polish, multi-device QA) |

Start at **Phase 0** in [TODO.md](./TODO.md).
