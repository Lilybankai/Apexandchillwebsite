import { Suspense } from "react";
import { ArrowRight, CheckCircle2, Download, Globe, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { AioReviews } from "@/components/overlay/AioReviews";
import { WidgetCatalogue } from "@/components/overlay/WidgetCatalogue";
import { ReferralBanner } from "@/components/overlay/ReferralBanner";
import { ChannelPartners } from "@/components/partners/ChannelPartners";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { CompactCatalogue } from "@/components/aio/hub/CompactCatalogue";
import { FeatureExplorer } from "@/components/aio/hub/FeatureExplorer";
import { HeroDemo } from "@/components/aio/hub/HeroDemo";
import { HubPricing } from "@/components/aio/hub/HubPricing";
import { ProofStrip } from "@/components/aio/hub/ProofStrip";
import { HERO_DEMO_TABS } from "@/components/aio/hub/demo";
import { HUB_FEATURES } from "@/components/aio/hub/features";
import { AIO_PRODUCT } from "@/lib/aio";
import { getAioFaq } from "@/lib/aio-faq";
import { AIO_RELEASE_TTL_SECONDS, getLatestAioRelease } from "@/lib/aio-release";
import {
  AIO_BREADCRUMB_JSON_LD,
  AIO_METADATA,
  buildAioSoftwareJsonLd,
} from "@/lib/aio-seo";

/**
 * ── OPERATOR: THE LIVE LINKS ─────────────────────────────────────────────────
 * DOWNLOAD_PATH is this site's own `/api/aio/download`, which redirects to the
 * installer on the newest release in `Lilybankai/apex-aio-releases`. The
 * ~330 MB binary (the voice engineer is bundled and signed inside it) never
 * lands in this repo, and nothing here needs editing to ship a new build:
 * publish the release from the app repo (`npm run release`) and this page
 * picks it up within half an hour. The version shown on screen is read from
 * that same release. Existing installs auto-update themselves, so this link
 * only serves new users.
 *
 * `lib/aio.ts` still pins the last known-good installer. That is the fallback
 * if GitHub can't be read, so keep it pointing at a release that works.
 */
const {
  downloadPath: DOWNLOAD_PATH,
  priceDisplay: PRICE,
  trialDays: TRIAL_DAYS,
  webBoardsUrl: WEB_BOARDS_URL,
  webBoardsLabel: WEB_BOARDS_LABEL,
} = AIO_PRODUCT;

/**
 * Re-render the page on the same cadence as the release lookup, so the version
 * on screen never lags behind the installer the button hands out. Next.js
 * requires a static literal, so this cannot reference
 * {@link AIO_RELEASE_TTL_SECONDS} — keep the two in sync manually.
 */
export const revalidate = 1800;

export const metadata = AIO_METADATA;

/**
 * The hub. Deliberately short: one hero with a live demo, one feature
 * explorer that links out to each topic page, the widget list, proof,
 * pricing and the FAQ. Depth lives on the topic pages in `lib/aio-pages.ts`
 * — add a feature to `components/aio/hub/features.tsx`, not a section here.
 */
export default async function ApexAioSystemPage() {
  // The newest published release, or the pinned fallback if GitHub is unreachable.
  const release = await getLatestAioRelease();
  const { version: APP_VERSION, installerFilename: INSTALLER_FILENAME } = release;

  return (
    <div className="pb-8">
      <JsonLd data={buildAioSoftwareJsonLd(release)} />
      <JsonLd data={AIO_BREADCRUMB_JSON_LD} />

      {/* ── Referral banner ──────────────────────────────────────────────────
          Only renders for someone who arrived on a partner's /r/CODE link, and
          nothing at all for everyone else. A CLIENT component so this page
          keeps its static render and its 30-minute revalidate: reading the
          query string in the server component would opt the whole page out of
          that to personalise one strip.

          Suspense is not optional around useSearchParams — without the
          boundary the production build fails, which is at least the right end
          to find out. */}
      <Suspense fallback={null}>
        <ReferralBanner />
      </Suspense>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
        />
        <div className="container-rail relative py-16 lg:py-20">
          <Reveal>
            <span className="kicker mb-4">Apex AIO System · Le Mans Ultimate · rFactor 2</span>
            <h1 className="max-w-4xl text-4xl font-bold text-ink sm:text-5xl lg:text-6xl">
              LMU overlays, race engineer &amp; setups — <span className="text-gradient">one app</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted">
              Your whole pit wall for Le Mans Ultimate:{" "}
              <strong className="text-ink">lightweight overlays</strong> for OBS and over the sim, a{" "}
              <strong className="text-ink">voice race engineer</strong> on push-to-talk,{" "}
              <strong className="text-ink">setups</strong> tuned from intent, a live{" "}
              <strong className="text-ink">team pit wall</strong> on any device and{" "}
              <strong className="text-ink">telemetry review</strong> of every lap you have ever
              driven.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={DOWNLOAD_PATH} size="lg" clip download={INSTALLER_FILENAME}>
                <Download size={18} />
                Start your {TRIAL_DAYS}-day free trial
              </Button>
              <Button
                href={WEB_BOARDS_URL}
                size="lg"
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe size={18} />
                Open the boards on any device
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {[
                `${PRICE}/month after the trial`,
                "Signed installer — no SmartScreen warning",
                "No plugin needed for LMU",
                "Runs inside OBS's own browser",
                `v${APP_VERSION} · Windows`,
              ].map((point) => (
                <li key={point} className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-success" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* The live wall: the real widgets rebuilt in HTML/CSS/SVG from the
              app's own rendering code, one view at a time. */}
          <Reveal delay={150} className="mt-12">
            <HeroDemo tabs={HERO_DEMO_TABS} />
          </Reveal>
        </div>
      </section>

      {/* ── Trial band ───────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-gradient-to-r from-accent/10 via-accent-2/10 to-cyan/10">
        <div className="container-rail flex flex-wrap items-center justify-between gap-6 py-6">
          <div className="flex items-center gap-4">
            <span className="chip border-accent/50 text-accent-2">Everything included</span>
            <p className="font-display text-xl uppercase tracking-wide text-ink">
              {TRIAL_DAYS} days free, then {PRICE}/month
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={WEB_BOARDS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-card border border-cyan/50 bg-base/60 px-4 py-2 font-mono text-sm font-semibold text-cyan transition-all duration-200 hover:border-cyan hover:shadow-glow-cyan"
            >
              <Globe size={16} aria-hidden />
              Engineer boards on any device: {WEB_BOARDS_LABEL}
            </a>
            <Button href="#pricing" size="sm" variant="outline">
              See the pricing
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Feature explorer ─────────────────────────────────────────────────
          Every feature, one tab each, from HUB_FEATURES. Each panel links to
          the topic page that covers it in depth. */}
      <section id="features" className="scroll-mt-36 py-16">
        <div className="container-rail">
          <Reveal className="mb-10 max-w-3xl">
            <span className="kicker mb-4">
              {HUB_FEATURES.length} features · overlays · race engineer · setups · pit wall · telemetry
            </span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Everything an LMU driver needs, <span className="text-gradient">in one app</span>
            </h2>
            <p className="mt-4 text-lg text-muted">
              Plenty of tools will draw you a standings tower. Pick a feature to see the parts that
              took real work — each one a working rebuild of the app&apos;s own panel, not a
              screenshot.
            </p>
          </Reveal>
          <FeatureExplorer features={HUB_FEATURES} />
        </div>
      </section>

      {/* ── Widget inventory ─────────────────────────────────────────────── */}
      <section id="widgets" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail">
          <div className="mb-4 flex items-center gap-3">
            <Layers size={20} className="text-accent" />
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">
              Every LMU overlay in the box
            </h2>
            <span className="h-px flex-1 bg-line" />
          </div>
          <p className="mb-8 max-w-3xl text-muted">
            Each widget has its own switch, its own two destinations — an OBS Browser Source and the
            in-game layer — and its own background opacity. All of them are in the one price.
          </p>
          <CompactCatalogue>
            <WidgetCatalogue />
          </CompactCatalogue>
        </div>
      </section>

      {/* ── Proof ────────────────────────────────────────────────────────── */}
      <ProofStrip />
      <AioReviews />

      {/* ── Pricing + install steps ──────────────────────────────────────── */}
      <HubPricing version={APP_VERSION} />

      <AioFaq items={getAioFaq("overview")} />

      {/* ── Channel partners ────────────────────────────────────────────── */}
      <ChannelPartners
        className="border-t border-line py-16"
        blurb="Teams and communities we work with. They're not affiliates or resellers — they're the people we race, stream and build alongside."
        heading={<>Partnered <span className="text-gradient">communities</span></>}
      />

      {/* ── Credit ───────────────────────────────────────────────────────── */}
      <section className="container-rail py-4">
        <Card variant="outline" className="p-6">
          <p className="text-sm text-subtle">
            The reference lap times and the Alien → Offline pace bands behind the Reference Pace
            widget are{" "}
            <a
              href="https://www.youtube.com/@ohne_speed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline"
            >
              Ohne Speed
            </a>
            &apos;s work, with lap times contributed by beAlien, Go and Hymo. The Apex AIO System
            only reads them, and credits them in the app wherever a score is shown.
          </p>
        </Card>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <AioTrialCta body="The whole pit wall — every LMU overlay, the engineer on the radio, your setups, your telemetry and your stream, in one app. Install it before your next session and see what you've been driving without." />
    </div>
  );
}
