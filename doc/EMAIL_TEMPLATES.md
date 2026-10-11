# Gratitude Ride — Supabase Auth email templates

Branded HTML for all auth emails (not the Supabase default). Each template includes the Gratitude Ride logo, forest/orange palette, and clear CTAs.

## Logo URL (used in every template)

```
https://raw.githubusercontent.com/Ferastack13/gratitude-ride/main/public/brand/gratitude-ride-logo.jpg
```

Source file in this repo: [`public/brand/gratitude-ride-logo.jpg`](../public/brand/gratitude-ride-logo.jpg)

## Templates

| Dashboard item | Subject | File |
|---|---|---|
| Confirm sign up | Confirm your Gratitude Ride email | [`supabase/templates/confirm-signup.html`](../supabase/templates/confirm-signup.html) |
| Invite user | You're invited to Gratitude Ride | [`supabase/templates/invite-user.html`](../supabase/templates/invite-user.html) |
| Magic link | Your Gratitude Ride sign-in link | [`supabase/templates/magic-link.html`](../supabase/templates/magic-link.html) |
| Change email address | Confirm your new Gratitude Ride email | [`supabase/templates/change-email.html`](../supabase/templates/change-email.html) |
| Reset password | Reset your Gratitude Ride password | [`supabase/templates/reset-password.html`](../supabase/templates/reset-password.html) |
| Reauthentication | `{{ .Token }} is your Gratitude Ride code` | [`supabase/templates/reauthentication.html`](../supabase/templates/reauthentication.html) |

## Apply to hosted Supabase (required for live emails)

The dashboard does not pick up local `config.toml` templates automatically.

1. Open **Supabase → Authentication → Emails → Templates**.
2. For each row above:
   - Set the **Subject**.
   - Open the matching HTML file → select all → copy → paste into **Message body**.
   - Save.
3. Optional: **Authentication → Emails → SMTP Settings** — set sender name to `Gratitude Ride` when you add custom SMTP.

## Local / CLI

`supabase/config.toml` already points each auth email type at these HTML files via `content_path`. They apply when you run the local Supabase stack.

## Placeholders (do not change)

Keep these exactly as written:

- `{{ .ConfirmationURL }}`
- `{{ .Token }}`
- `{{ .Email }}`
- `{{ .NewEmail }}`

## Design notes (app palette from `mobile/constants/theme.ts`)

| Role | Hex | Token |
|---|---|---|
| Forest header / titles | `#12372A` | `primary` |
| Gold accent / CTA | `#F59E3D` | `secondary` |
| Cream canvas | `#F7F4ED` | `surface` |
| Body text | `#5B675F` | `muted` |
| Helper text | `#8A938C` | `mutedLight` |
| Borders | `#D9D2C4` | `border` |
| Footer | `#0C261D` | `primaryDark` |
| Card | `#FFFFFF` | `white` |
