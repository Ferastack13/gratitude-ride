# Driver role — current state

Snapshot of what already exists before the phased build. Do not rebuild these from scratch unless they are broken.

## Navigation shell

- Layout: `mobile/app/rider/_layout.tsx`
- Tabs: Home, Discover, Earnings, Inbox, Menu
- Active trip (hidden tab): `mobile/app/rider/active/[id].tsx`
- Soft gate redirects non-driver clients away (preference-based; needs hardening)

## Working today

| Feature | Where |
|---------|--------|
| Online / offline toggle | `rider/index.tsx` + `riders.is_available` |
| Live GPS → `riders.current_lat/lng` | `lib/driver-location.ts` |
| Nearby pending offers | `lib/ride-matching.ts` + Home |
| Accept (atomic RPC) / decline | `accept_delivery`, `delivery_declines` |
| Active trip status slides | `rider/active/[id].tsx` |
| Today earnings snippet | Home + `rider/earnings.tsx` |
| Register as driver + vehicle type | `(auth)/register.tsx` |
| Switch passenger → driver | Account / Settings |

## Stubs / thin screens

| Screen | Gap |
|--------|-----|
| Discover | Count of pending jobs only; no list; promos placeholder |
| Inbox | Empty notifications; WhatsApp support only |
| Menu | Account & Vehicle rows do nothing; letter avatar only |
| Payouts | Earnings history only; no bank / payout flow |
| Verification | `riders.is_verified` unused in UX |

## Data model (relevant)

- `users` — role includes `rider`
- `riders` — vehicle, availability, GPS, rating, earnings
- `deliveries` — trip lifecycle + `rider_id`
- `delivery_declines` — per-driver declines
- RPC `accept_delivery` — first valid accept wins

## Design note

Passenger Account/Settings use Gratitude cream / forest / orange. Several rider screens still use older green “web” styling — align during Phase 2 / 5.
