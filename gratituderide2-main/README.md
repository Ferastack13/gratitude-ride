# Gratitude Ride

Premium express delivery platform for Lagos, Abuja, and Port Harcourt.

## Tech Stack

- **Next.js 15** — App Router, Server Components
- **React 19** — Latest React features
- **TypeScript** — Full type safety
- **Tailwind CSS v4** — Utility-first styling
- **Supabase** — Auth & PostgreSQL database
- **Framer Motion** — Smooth animations
- **Paystack** — Payment processing
- **Google Maps** — Live tracking & navigation

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
```

Edit `.env.local` and set at least:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

Get the Supabase values from your project: **Settings → API**.

Then apply the database schema (required for login/register profiles):

1. Open Supabase → **SQL Editor**
2. Paste and run `supabase/schema.sql`

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── services/           # Services page
│   ├── business/           # Business solutions
│   ├── become-rider/       # Rider registration
│   ├── pricing/            # Pricing plans
│   ├── track/              # Package tracking
│   ├── about/              # About us
│   ├── contact/            # Contact form
│   ├── login/              # Authentication
│   ├── register/           # Registration
│   ├── blog/               # Blog listing
│   └── faq/                # FAQ page
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── layout/             # Header, Footer, Logo
│   ├── home/               # Homepage sections
│   └── shared/             # Shared components
├── data/dummy/             # Dummy/seed data
├── lib/                    # Utilities, constants, Supabase
└── types/                  # TypeScript interfaces
```

## Environment Variables

See `.env.local.example` for required variables.

## Database Setup

Run `supabase/schema.sql` in your Supabase SQL Editor to create all tables.

## Brand Colors

| Color     | Hex       | Usage              |
|-----------|-----------|--------------------|
| Primary   | `#16a34a` | Buttons, accents   |
| Secondary | `#facc15` | Highlights, badges |
| Dark      | `#0f0f0f` | Dark sections      |

## License

Proprietary — Gratitude Ride © 2026
