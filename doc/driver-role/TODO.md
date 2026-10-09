# Driver role — to-do list

Work **top to bottom**. Mark items `[x]` when done.  
Details for each phase: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

---

## Phase 0 — Foundations

- [x] Audit `/rider` gate vs `profile.role` + `accountType` + `riders` row → see [PHASE0_AUDIT.md](./PHASE0_AUDIT.md)
- [x] On enter driver mode: call `ensureRiderId`; upsert role/`account_type` as needed (`driver-bootstrap` + auth + `/rider` layout)
- [x] When switching from passenger: prompt for vehicle type if missing (`switchToDriverMode` on Account + Settings)
- [x] Verify/fix RLS for riders, deliveries, declines, accept → migration `driver_phase0_rls` **applied via Supabase MCP**
- [x] Switch Driver Home map to Carto/OSM tiles (RouteMap already Carto; fixed 0,0 center + tile sizing)
- [ ] Smoke: register/switch as driver → land on Home with `riders` row + GPS permission (**manual in Expo Go**)

---

## Phase 1 — Trip loop

### Home
- [x] Polish Online / Offline UI and copy
- [x] Empty state: offline vs online waiting for jobs
- [x] Offer modal: fee, distance, ETA, pickup/dropoff (+ to-pickup km)
- [x] Resume active trip banner → `/rider/active/[id]`

### Active trip
- [x] Map: pickup, dropoff, driver self-marker
- [x] Deep link open in Maps / Waze (`maps-nav`)
- [x] Call / WhatsApp passenger (`ContactBar`)
- [x] Status slides only in order (`accepted` → `picked_up` → `in_transit` → `delivered`)
- [x] Keep GPS publisher while trip is live
- [x] Cancel / help path (Help + WhatsApp / Safety)

### Passenger side
- [x] Track screen shows live driver when GPS is fresh
- [x] Stale location messaging when update is old

### QA
- [ ] End-to-end: book → online → offer → accept → complete → earnings row (**manual in Expo Go**)
- [ ] Accept race: two drivers; only one wins via `accept_delivery` (**manual**)

---

## Phase 2 — Account shell

- [ ] Menu header: photo/avatar, name, rating, vehicle, online chip
- [ ] Profile screen: create / read / update (name, phone, email, avatar)
- [ ] Wire ProfileAvatar on Menu (and Home if useful)
- [ ] Vehicle screen: type, license/plate fields persisted
- [ ] Wire Menu rows: Account, Vehicle (no dead taps)
- [ ] Help → WhatsApp; Sign out
- [ ] Switch account back to passenger
- [ ] Inbox: load `notifications` for this user
- [ ] Inbox Support tab stays WhatsApp
- [ ] Align Menu styling with Gratitude palette

---

## Phase 3 — Discover

- [x] List nearby pending requests with distance (when online + GPS)
- [x] Empty / offline messaging
- [x] CTA: Go online (or open Home)
- [x] Optional: static boost/promo cards (placeholder OK)

---

## Phase 4 — Earnings & trust

- [ ] Earnings: today / week / all-time totals
- [ ] Trip history list + detail
- [ ] Pull-to-refresh
- [ ] Payouts v1: show balance + “coming soon”
- [ ] Capture bank / payout details form (store only)
- [ ] Verification UI using `is_verified` (pending / verified)
- [ ] Show rating + delivery count on Menu
- [ ] Optional post-trip rating prompt for passenger (if not already)

---

## Phase 5 — Ops & polish

- [ ] Document Expo Go location limits for drivers
- [ ] Push notifications plan for new offers (implement when ready)
- [ ] Safety: SOS or share-trip action on active trip
- [ ] Basic metrics logging (online time / accept / decline) — optional
- [ ] Full visual pass on all `/rider` screens
- [ ] Multi-device QA checklist pass

---

## Multi-device QA checklist

- [ ] Driver A online sees passenger booking within ~25 km
- [ ] Decline hides offer for A; still available for B
- [ ] Accept assigns trip; passenger Track updates
- [ ] Status steps sync to passenger timeline
- [ ] Delivered updates Earnings and `riders` stats as designed
- [ ] Sign out / switch role does not leave orphan online state (`is_available` false)

---

## Progress log (optional)

| Date | Phase | Notes |
|------|-------|-------|
| | | |

---

## Next action

Start here: **Phase 0 — Audit `/rider` gate** and tick the first box when the audit note is written or the fix is merged.
