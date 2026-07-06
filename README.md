# Apex & Chill Racing — Website

The official website for **Apex & Chill Racing**, a multi-platform sim racing
community running competitive **Gran Turismo 7** and **Le Mans Ultimate** leagues.

This is a ground-up rebuild of the previous WordPress/Astra site as a modern,
fast, statically-optimised **Next.js** application — with live standings, an
integrated schedule, a smarter replays gallery, a print-on-demand merch store,
and a prominent feature for our exclusive mental-health partner, **Andy's Man Club**.

---

## Tech stack

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 15 (App Router) + React 19                |
| Language       | TypeScript (strict)                               |
| Styling        | Tailwind CSS v3 + a custom design-token system    |
| Data / DB      | Supabase (`@supabase/supabase-js`)                |
| Payments       | Stripe (`stripe`, `@stripe/stripe-js`)            |
| Icons          | `lucide-react`                                    |
| Fonts          | Oswald (display) · Barlow (body) · JetBrains Mono (data) |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint (informational — not enforced during build)
```

> **Node:** 18.17+ (developed on Node 24).

## Project structure

```
app/                 # App Router routes
  layout.tsx         # Root layout: fonts, metadata, Header + Footer
  page.tsx           # Homepage
  globals.css        # Design tokens + base styles
  standings/         # Live standings (GT7 + LMU)
  schedule/          # Race calendars (GT7 + LMU)
  replays/           # YouTube replays gallery
  merch/             # Print-on-demand store
  about/  partners/  join/
  api/               # Route handlers (standings, next-race, replays, join, merch, checkout)
components/
  layout/            # Header, Footer
  ui/                # Button, Card + primitives
  home/  standings/  schedule/  replays/  merch/  partners/  join/
lib/
  utils.ts           # cn() + formatting helpers
  types.ts           # Shared domain types
  supabase.ts        # Supabase client
  api/               # Simgrid / Sim League Pro / YouTube clients
  merch/             # Tapstitch / Printful clients + cart
supabase/schema.sql  # Database schema
```

## Design system

A dark **synthwave / neon motorsport** aesthetic — deliberately *not* a generic
template. Key primitives:

- **Colour tokens** live in `app/globals.css` as space-separated RGB channels
  and are surfaced through Tailwind (`bg-base`, `text-accent`, `text-cyan`,
  `border-line`, …). The base is near-black `#0a0a12`; primary actions use an
  electric **violet→magenta** gradient (`bg-neon-primary`), **cyan** is the
  secondary neon, **hot pink** highlights, and the signature racing green
  `#00ff88` (`text-success`) is reserved for **P1 / success**. Team/flag colours
  (red, amber, blue, purple, gold) are available as `flag-*`.
- **Typography** — condensed uppercase Oswald for headings/CTAs, Barlow for
  body, and **JetBrains Mono reserved for numeric data** (positions, points,
  lap times) via the `.tabular` helper, so data reads like a live pit wall.
- **Primitives** — `Button` (`variant`, `size`, `clip`, renders `<a>`/`<button>`),
  `Card` (`variant`, `clip`, `interactive`) + `CardHeader`/`CardBody`,
  `Marquee` (reusable neon ticker strip), and `ApexChevron` (placeholder logo).
- Helpers: `.container-rail`, `.kicker`, `.chip`, `.glass`, `.text-gradient`,
  `.clip-corner`.

Use `cn(...)` from `@/lib/utils` to compose classes. Import paths use the
`@/*` alias mapped to the project root.

## Environment variables

Copy `.env.example` to `.env.local` and fill in as integrations come online.
The app degrades gracefully (sample data / skeletons) when keys are absent.

| Variable                          | Used by                    |
| --------------------------------- | -------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase client            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase client            |
| `SUPABASE_SERVICE_ROLE_KEY`       | Server-side writes (join)  |
| `SIMGRID_API_KEY`                 | LMU standings / next race  |
| `SIMLEAGUEPRO_API_KEY`            | GT7 standings              |
| `YOUTUBE_API_KEY`                 | Replays gallery            |
| `TAPSTITCH_API_KEY`               | Merch (print-on-demand)    |
| `PRINTFUL_API_KEY`                | Merch (print-on-demand)    |
| `STRIPE_SECRET_KEY`               | Checkout                   |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Checkout (client)       |

> **Never commit secrets.** `.env*.local` is git-ignored.

## Build notes

- TypeScript type-checking runs during `next build` and **is** enforced.
- ESLint does **not** fail the production build (`eslint.ignoreDuringBuilds`)
  to keep a multi-author scaffold shippable; run `npm run lint` locally.

---

_Built by the Apex & Chill team. Clean racing. Real community._
