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
  merch/             # Tapstitch / Printify clients + cart
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

## Setup & Integrations (operator guide)

Everything here is optional. **The site runs out-of-the-box on graceful *sample*
data** — every integration falls back to bundled placeholder content until you
supply credentials, and switching to live data needs **no code changes**. Each
data section shows a "sample data" chip while it's on the fallback so the
"waiting for live data" state stays honest.

### 1. Create your env file

```bash
cp .env.example .env.local
```

Fill in only the keys you have. `.env*.local` is git-ignored — **never commit
secrets.**

### 2. Keys grouped by system

**SimGrid — LMU standings + next race**
| Variable | Notes |
| --- | --- |
| `SIMGRID_API_KEY` | Primary key (SimGrid account → API/integrations). |
| `SIMGRID_API_BASE_URL` | Defaults to `https://www.simgrid.com/api`. |
| `SIMGRID_LMU_CHAMPIONSHIP_ID` | SimGrid championship id for the current LMU season. |

**Sim League Pro — GT7 standings + next race**
| Variable | Notes |
| --- | --- |
| `SIMLEAGUEPRO_API_KEY` | API key. |
| `SIMLEAGUEPRO_API_BASE_URL` | Defaults to `https://api.simleague.pro`. |
| `SIMLEAGUEPRO_GT7_LEAGUE_ID` | League id for the current GT7 season. |
| `SIMLEAGUEPRO_GT7_SEASON_ID` | Optional — pins a season; defaults to active. |

**YouTube Data API v3 — replays gallery**
| Variable | Notes |
| --- | --- |
| `YOUTUBE_API_KEY` | The only value you must supply (Google Cloud → Credentials). |
| `YOUTUBE_CHANNEL_ID` | Defaults to Apex & Chill's channel. |
| `YOUTUBE_UPLOADS_PLAYLIST_ID` | Single playlist to pull replays from. Accepts a bare id **or** a pasted playlist/share URL (the `list=` id is extracted for you). Blank = the channel's uploads. |
| `YOUTUBE_PLAYLISTS` | Show **several** playlists as separate sections on the Replays page. Comma-separated; each entry is `Heading \| url-or-id` (the `Heading \|` is optional — without it the playlist's own YouTube title is used). Supersedes `YOUTUBE_UPLOADS_PLAYLIST_ID` when set. |

> **Finding a playlist id:** open the playlist on YouTube and copy the `list=` value from the URL (e.g. `.../playlist?list=PLxxxx` → `PLxxxx`). You can also paste the whole URL — it's parsed automatically. Example of two sections:
> `YOUTUBE_PLAYLISTS=GT7 League | PLaaaa, LMU League | PLbbbb`

**Supabase — join submissions + optional cached standings**
| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (public). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (public, browser-safe). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** — never expose to the client. |

**Merch — Tapstitch + Printify (print-on-demand)**
| Variable | Notes |
| --- | --- |
| `TAPSTITCH_API_KEY` / `TAPSTITCH_STORE_ID` | Tapstitch store credentials. |
| `PRINTIFY_API_KEY` | Printify Personal Access Token (Account → Connections). |
| `PRINTIFY_SHOP_ID` | Numeric shop id (from `GET /v1/shops.json`). Required. |
| `PRINTIFY_AUTO_CONFIRM` | `true` = webhook sends Printify orders to production automatically; unset/`false` = create orders to review and send yourself. |

**Stripe — checkout**
| Variable | Notes |
| --- | --- |
| `STRIPE_SECRET_KEY` | Server-side Stripe key. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client publishable key. |
| `STRIPE_WEBHOOK_SECRET` | Verifies incoming Stripe webhooks. |

### 3. Merch integration path

The store reads the **Tapstitch and Printify product APIs directly** and
normalises both into a single provider-agnostic product/variant model — so there
is **no WordPress import/sync step** (the pain point on the old site is gone).
Products merge into one catalog; when keys are absent, a bundled sample catalog
is shown instead.

Checkout uses **Stripe-hosted checkout** (no card data touches this app).
Fulfilment is wired via webhook: `POST /api/webhooks/stripe` verifies the
signature with `STRIPE_WEBHOOK_SECRET` and, on `checkout.session.completed`,
pushes the order to **Printify's Orders API** for print-and-ship. Register the
endpoint in the Stripe Dashboard (Developers → Webhooks) at
`https://<your-domain>/api/webhooks/stripe`, subscribed to
`checkout.session.completed`. Printify orders are created but **not sent to
production** by default — set `PRINTIFY_AUTO_CONFIRM=true` to fulfil
automatically. Tapstitch items are logged for manual fulfilment until a Tapstitch
Orders client is added.

### 4. Apply the database schema

Once Supabase is configured, apply the schema (join submissions, cached
standings, replays cache) via the Supabase SQL editor or CLI:

```bash
# e.g. with the Supabase CLI / psql against your project
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
```

## Build notes

- TypeScript type-checking runs during `next build` and **is** enforced.
- ESLint does **not** fail the production build (`eslint.ignoreDuringBuilds`)
  to keep a multi-author scaffold shippable; run `npm run lint` locally.

---

_Built by the Apex & Chill team. Clean racing. Real community._
