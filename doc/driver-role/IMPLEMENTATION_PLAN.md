# Driver role — implementation plan

Finish the **driver (rider)** role so a courier can sign up, go online, take nearby jobs, complete trips, see earnings, and manage profile/vehicle — matching passenger quality and Expo Go constraints.

## Goal

A driver can: **sign up → go online → get nearby jobs → run a trip → see earnings → manage profile/vehicle**, with Gratitude branding (cream `#F7F4ED`, forest `#12372A`, orange `#F59E3D`) and maps that work in Expo Go (Carto/OSM tiles, not blank Google MapView without a key).

## Definition of done

- [ ] Driver signup or switch creates a valid `riders` row and `users.role = rider` when appropriate
- [ ] Online → nearby offer → accept → complete → row appears in Earnings
- [ ] Passenger Track shows live driver while trip is active (fresh GPS)
- [ ] Menu covers profile, vehicle, help, sign-out (no dead core rows)
- [ ] Works in Expo Go with current tile maps

---

## Phase 0 — Foundations

**Why first:** Later screens fight auth/data bugs if identity is soft-only.

1. Harden `/rider` entry: ensure `riders` row (`ensureRiderId`), prefer `users.role = rider`, persist `account_type = driver`
2. Switch-from-passenger: collect vehicle type once if missing
3. Confirm RLS: own rider update (availability/location), pending delivery read, `accept_delivery`, `delivery_declines`
4. Map consistency: Driver Home/Active use Carto/OSM tiles like passenger Home

**Exit:** New driver lands on Home with a real `riders` row; GPS works when online.

---

## Phase 1 — Core trip loop polish

1. Driver Home: clear Online/Offline UI; empty states; offer modal (distance, fee, ETA, addresses)
2. Resume banner when an active trip exists
3. Active trip: map pickup→dropoff + self; nav deep link; call/WhatsApp passenger; ordered status slides; GPS while live
4. Passenger Track: live driver when location is fresh; stale copy when old
5. Smoke test: passenger books → driver online → offer → accept → statuses → delivered → earnings

**Exit:** One full trip on two accounts without manual DB edits.

---

## Phase 2 — Driver Account shell (passenger parity)

1. Menu header: avatar, rating, vehicle chip, online status
2. Profile CRUD (reuse passenger patterns): name, phone, email, avatar
3. Vehicle screen: type + plate/license on `riders` (or small `rider_vehicles` table)
4. Settings shortcuts: appearance/notifications; Help; switch back to passenger
5. Inbox: wire `notifications`; keep Support → WhatsApp

**Exit:** Driver updates photo/details/vehicle inside `/rider`.

---

## Phase 3 — Discover + demand

1. List nearby open requests (read-only) with distance when online
2. Optional static promo/boost cards (no backend)
3. CTA: Go online / jump to Home offer flow

**Exit:** Discover answers “is there demand near me?” without replacing the offer modal.

---

## Phase 4 — Earnings & trust

1. Earnings: today / week / all-time; trip detail; refresh
2. Payouts v1: balance + “coming soon” + bank details form (store only)
3. Verification v1: surface `is_verified`; pending review / soft gate flag
4. Ratings: show `rating` / `total_deliveries` on Menu and after trip

**Exit:** Driver understands earnings; verification path is clear even if approval is manual.

---

## Phase 5 — Ops & polish

1. Push for new offers (later: Expo Notifications + edge function)
2. Background location while on trip (document Expo Go limits)
3. Safety: SOS / share trip
4. Analytics: online minutes, accept rate, cancel rate
5. Visual pass: Gratitude palette, AppTabBar, remove leftover green web styling

---

## Do first / defer

**Do first:** identity hardening, trip loop QA, map tiles, profile/vehicle, real inbox.  
**Defer:** real bank payouts, smarter auto-dispatch beyond radius + first-accept, custom native Google Maps build, document OCR.

## Suggested week plan

| Week | Focus |
|------|--------|
| 1 | Phase 0 + Phase 1 |
| 2 | Phase 2 |
| 3 | Phase 3 + Phase 4 |
| 4 | Phase 5 |
