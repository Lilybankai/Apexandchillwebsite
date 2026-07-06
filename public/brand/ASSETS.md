# Brand Assets — operator-supplied (USE THESE, do NOT generate AI替代 imagery)

These are the **real** Apex & Chill brand assets supplied by the operator. All builders MUST
use these in the build instead of AI-generated placeholders. Reference them from `/brand/<file>`
(they live in `public/`, so the URL path drops the `public/` prefix).

| File | Path | Source | Size | Intended use |
|------|------|--------|------|--------------|
| `apex-chill-logo.jpg` | `/brand/apex-chill-logo.jpg` | operator (real Apex & Chill logo) | 150×150 | **Primary logo** — cyan→violet "A" chevron + "APEX & CHILL RACING LEAGUE" wordmark. Use in Header, Footer, favicon, hero lockup. Replaces the placeholder `components/ui/Logo.tsx` SVG. NOTE: only 150×150 — request hi-res/SVG from operator for large placements; keep the `<Logo>` component as a styled wrapper so we can swap the source. |
| `andysmanclub-logo-white.png` | `/brand/andysmanclub-logo-white.png` | operator | 1000×200 (transparent, WHITE) | Andy's Man Club partner logo — **white variant, use on DARK backgrounds only**. For the site-wide AMC exclusive-partner feature (home band, About, Footer, partner pages). |
| `itsokaytotalk-logo-white.png` | `/brand/itsokaytotalk-logo-white.png` | operator | 1000×200 (transparent, WHITE) | AMC "#ITSOKAYTOTALK" campaign logo — white, dark-bg only. Pair with AMC logo in mental-health messaging. |
| `banner.png` | `/brand/banner.png` | operator | 300×147 | Neon car render (brand hero art). **Low-res** — use as section accent/thumbnail or small card art, NOT a full-bleed hero background (will pixelate). Request hi-res hero from operator. |
| `about.png` | `/brand/about.png` | operator | 300×147 | Neon render — About page section art / card thumbnail. Low-res. |
| `replays.png` | `/brand/replays.png` | operator | 300×147 | Neon render — Replays section accent / fallback thumb. Low-res. |
| `schedule.png` | `/brand/schedule.png` | operator | 300×147 | Neon render — Schedule section art. Low-res. |
| `standings.png` | `/brand/standings.png` | operator | 300×147 | Neon render — Standings section art. Low-res. |

## Rules
1. **Never** replace these with AI-generated or stock imagery. The operator explicitly wants the real brand assets used.
2. The 300×147 banners are low-res — use them where small (thumbnails, card art, section accents). Do not upscale into full-bleed heroes; instead use a tasteful CSS gradient/neon composition + the real logo until the operator supplies hi-res hero art.
3. Use `next/image` with explicit width/height; the AMC/ITSOKAYTOTALK logos are white → only place on dark surfaces.
4. Operator is supplying more assets over time — re-check this folder; Coordinator will announce additions.
