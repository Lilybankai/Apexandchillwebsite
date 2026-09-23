import { Suspense } from "react";
import { ArrowRight, Download, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WidgetCatalogue } from "@/components/overlay/WidgetCatalogue";
import { ReferralBanner } from "@/components/overlay/ReferralBanner";
import { ChannelPartners } from "@/components/partners/ChannelPartners";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { SectionHeading } from "@/components/aio/SectionHeading";
import { BroadcastFrame } from "@/components/aio/broadcast/BroadcastFrame";
import { StintStory } from "@/components/aio/broadcast/StintStory";
import { STINT_BEATS, STINT_TOTAL_LAPS } from "@/components/aio/broadcast/stint";
import { CompactCatalogue } from "@/components/aio/hub/CompactCatalogue";
import { FeatureExplorer } from "@/components/aio/hub/FeatureExplorer";
import { HubPricing } from "@/components/aio/hub/HubPricing";
import { HubReviews } from "@/components/aio/hub/HubReviews";
import { ProofStrip } from "@/components/aio/hub/ProofStrip";
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
 * {@link AIO_RELEASE_TTL_SECONDS}. Keep the two in sync manually.
 */
export const revalidate = 1800;

export const metadata = AIO_METADATA;

/**
 * The hub. The hero is a paused broadcast frame with the real widgets where a
 * stream puts them; the stint story walks one race through the rest; then the
 * feature explorer (one tab per feature, each linking to its topic page), the
 * widget list, numbers, reviews, pricing and the FAQ. Depth lives on the topic
 * pages in `lib/aio-pages.ts`: add a feature to
 * `components/aio/hub/features.tsx`, not a section here.
 *
 * SVG ids: the track map and speedo appear only in the hero frame, the radar
 * only in the stint story and the Review mock only in the explorer. Each
 * carries fixed gradient ids and must stay on the page once.
 */
export default async function ApexAioSystemPage() {
  // The newest published release, or the pinned fallback if GitHub is unreachable.
  const release = await getLatestAioRelease();
  const { version: APP_VERSION, installerFilename: INSTALLER_FILENAME } = release;

  const heroFacts = [
    `${PRICE}/month after the trial`,
    "Signed installer, no SmartScreen warning",
    "No plugin needed for LMU",
    "Runs inside OBS's own browser",
    `v${APP_VERSION} · Windows`,
  ];

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

          Suspense is not optional around useSearchParams. Without the
          boundary the production build fails, which is at least the right end
          to find out. */}
      <Suspense fallback={null}>
        <ReferralBanner />
      </Suspense>

      {/* ── Hero: the headline, then a paused frame of the stream ─────────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-20 [mask-image:radial-gradient(70%_50%_at_30%_0%,black,transparent)]"
        />
        <div className="container-rail relative pt-14 lg:pt-20">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-7">
              <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-subtle">
                Apex AIO System · Le Mans Ultimate · rFactor 2
              </p>
              <h1 className="text-4xl font-bold text-ink sm:text-5xl lg:text-6xl">
                LMU overlays, race engineer &amp; setups in <span className="text-gradient">one app</span>
              </h1>
            </div>
            <div className="lg:col-span-5">
              <p className="text-lg leading-relaxed text-muted">
                Overlays for OBS and over the sim, a voice race engineer on push-to-talk, setups tuned
                from what you ask for, a live team pit wall on any device, and telemetry review of
                every lap you&apos;ve driven.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
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
                  Boards on any device
                </Button>
              </div>
            </div>
          </div>

          <ul className="mt-8 flex flex-wrap gap-y-2 border-t border-line pt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
            {heroFacts.map((fact, i) => (
              <li key={fact} className={i > 0 ? "border-l border-line pl-4 pr-4" : "pr-4"}>
                {fact}
              </li>
            ))}
          </ul>
        </div>

        {/* The widgets as a stream shows them: rebuilt in HTML/CSS/SVG from
            the app's own rendering code, laid out on a 16:9 frame. */}
        <div id="broadcast" className="mx-auto mt-10 w-full max-w-[1440px] scroll-mt-36 px-5 pb-14 sm:px-8 lg:pb-16">
          <BroadcastFrame />
        </div>
      </section>

      {/* ── Trial band ───────────────────────────────────────────────────── */}
      <section aria-label="Free trial" className="border-b border-line bg-surface/40">
        <div className="container-rail flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-5">
          <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">One plan</span>
            <span className="font-display text-xl uppercase tracking-wide text-ink">
              {TRIAL_DAYS} days free, then {PRICE}/month
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm">
            <a
              href={WEB_BOARDS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-cyan hover:underline"
            >
              <Globe size={15} aria-hidden />
              Engineer boards: {WEB_BOARDS_LABEL}
            </a>
            <a href="#pricing" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
              Pricing
              <ArrowRight size={15} aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* ── Stint story ──────────────────────────────────────────────────────
          One race in five beats, scroll-driven on a desktop. */}
      <section id="stint" aria-labelledby="stint-heading" className="container-rail scroll-mt-36 py-20">
        <SectionHeading
          index="01"
          id="stint-heading"
          label="Race story"
          title="One race, lights to flag"
          lead={`Five moments from a ${STINT_TOTAL_LAPS}-lap race and what the app has on screen at each of them.`}
        />
        <StintStory beats={STINT_BEATS} totalLaps={STINT_TOTAL_LAPS} />
      </section>

      {/* ── Feature explorer ─────────────────────────────────────────────────
          Every feature, one tab each, from HUB_FEATURES. Each panel links to
          the topic page that covers it in depth. */}
      <section id="features" aria-labelledby="features-heading" className="scroll-mt-36 border-t border-line py-20">
        <div className="container-rail">
          <SectionHeading
            index="02"
            id="features-heading"
            label={`Features · ${HUB_FEATURES.length}`}
            title="Everything an LMU driver needs, in one app"
            lead="Pick a feature for the spec and a working rebuild of the app's own panel, then follow the link for the full page on it."
          />
          <FeatureExplorer features={HUB_FEATURES} />
        </div>
      </section>

      {/* ── Widget inventory ─────────────────────────────────────────────── */}
      <section id="widgets" aria-labelledby="widgets-heading" className="scroll-mt-36 border-t border-line py-20">
        <div className="container-rail grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              index="03"
              id="widgets-heading"
              label="Widgets"
              title="Every LMU overlay in the box"
              lead="Each widget has its own switch, two destinations (an OBS Browser Source and the in-game layer) and its own background opacity. All of them are in the one price."
              className="lg:sticky lg:top-36"
            />
          </div>
          <div className="lg:col-span-8">
            <CompactCatalogue>
              <WidgetCatalogue />
            </CompactCatalogue>
          </div>
        </div>
      </section>

      {/* ── Proof ────────────────────────────────────────────────────────── */}
      <ProofStrip index="04" />
      <HubReviews index="05" />

      {/* ── Pricing + install steps ──────────────────────────────────────── */}
      <HubPricing version={APP_VERSION} index="06" />

      <AioFaq items={getAioFaq("overview")} />

      {/* ── Channel partners ────────────────────────────────────────────── */}
      <ChannelPartners
        className="border-t border-line py-16"
        kicker="Partners"
        blurb="Teams and communities we race, stream and build alongside. None of them are affiliates or resellers."
        heading="Partnered communities"
      />

      {/* ── Credit ───────────────────────────────────────────────────────── */}
      <section aria-label="Credit" className="container-rail py-6">
        <div className="grid gap-2 border-y border-line py-5 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">Reference times</p>
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
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <AioTrialCta body="Every LMU overlay, the engineer on the radio, your setups, your telemetry and your stream, in one app. Install it before your next session." />
    </div>
  );
}
