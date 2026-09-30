import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { RaceLogMock } from "@/components/overlay/RaceLogMock";
import { RL_COUNTS, RL_LAPS, rlCopyText } from "@/components/overlay/raceLogData";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioRelatedPages } from "@/components/aio/AioRelatedPages";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { SectionHeading } from "@/components/aio/SectionHeading";
import type { AioFaqItem } from "@/lib/aio-faq";
import { buildAioBreadcrumbJsonLd, buildAioPageMetadata, buildAioWebPageJsonLd } from "@/lib/aio-seo";

export const metadata = buildAioPageMetadata("incident-review");

/** The trial buttons read the live release, so the page refreshes with it. */
export const revalidate = 1800;

/**
 * Every question here is about reviewing a race after it is run, so they live
 * on this page and nowhere else: no other page's FAQPage markup competes for
 * "LMU incident review" or "LMU replay".
 */
const PAGE_FAQ: AioFaqItem[] = [
  {
    q: "How do I review incidents in Le Mans Ultimate?",
    page: "incident-review",
    a: "Open the Race log tab in Apex AIO and pick a race. Every contact, track-limits warning, penalty, damage report and flag on your car is listed on a timeline with the race time and lap it happened on. Filter to Incidents to see only those, then press Replay on any line and LMU's own replay opens with the camera on your car, five seconds before the moment.",
  },
  {
    q: "Can I jump straight to an incident in an LMU replay?",
    page: "incident-review",
    a: "Yes. Replay on a race-log line loads that race's replay in the game, puts the camera on your car and seeks to five seconds before the incident. Once it is open, Previous and Next step through the race's incidents one by one, and ↑ ↓, Enter and [ ] do the same from the keyboard. A long race's replay can take up to a minute to load the first time; every jump after that is instant. You need to be out of your session first, because Apex never pulls you out of one.",
  },
  {
    q: "How does Apex decide whether a contact was light or heavy?",
    page: "incident-review",
    a: "From the impact LMU records for the contact in its results file. The hardest fifth or so are called heavy, the rest light. That cut was measured across more than 12,000 real contacts from 207 races. The log also names the other car and its number, or says what you hit if it wasn't a car: the wall, a post, a sign or a loose wheel.",
  },
  {
    q: "Does the race log include races from before I installed Apex?",
    page: "incident-review",
    a: "Yes. LMU saves a results file on your PC after every race it finishes, online or offline, and the race log reads those files. Every race the game has kept is there the first time you open the tab. Replays are a different matter: the game only keeps its five most recent replays per circuit, so an older race still has its full log but tells you when its replay has gone.",
  },
  {
    q: "Can I use the race log for a league protest?",
    page: "incident-review",
    a: "That's what Copy as text is for. It copies the lines on screen as plain text with the circuit, date, car number and class on the first line, then one line per event: race time, lap, kind and what happened. Filter to Incidents or Contacts first and paste it straight into Discord or a protest form.",
  },
  {
    q: "What if LMU crashes before it saves the results?",
    page: "incident-review",
    a: "Apex also writes the race down while you drive, so a race still has a log if the game crashes before writing its results file. That log is marked provisional. The live recording also adds what the results file never has: yellow flags, full-course yellows and red flags, and your damage graded minor, major or critical.",
  },
  {
    q: "Does the race log follow a team car through driver swaps?",
    page: "incident-review",
    a: "Yes. Apex finds your car from your own lap times rather than your name, so it follows the car through a team race's driver swaps, and each swap is a line on the timeline. If it can't tell which car was yours, it asks once and remembers.",
  },
  {
    q: "Is the race log uploaded anywhere?",
    page: "incident-review",
    a: "No. It is read from LMU's files on your own PC and kept there. It needs no account and no internet connection, and nothing about your races is uploaded.",
  },
];

const LOG_SPEC = [
  ["Reads", "LMU's own results files"],
  ["Races", "Every one the game has kept"],
  ["Set-up needed", "None"],
  ["Stored", "Your own disk"],
  ["Upload", "None"],
  ["If the game crashes", "Recorded live as well"],
] as const;

/** What a line can be, in the colours the timeline uses. */
const LINE_KINDS = [
  { kind: "Contact", tone: "text-flag-red", body: "Who with and their number, graded light or heavy. Or the wall, a post, a sign." },
  { kind: "Damage", tone: "text-flag-red", body: "Graded minor, major or critical, the scale of the in-car HUD, with parts lost." },
  { kind: "Limits", tone: "text-flag-amber", body: "Each warning with your points against the allowance, and invalidated laps." },
  { kind: "Penalty", tone: "text-flag-red", body: "Drive-through, stop-go or time penalty and the reason, then when it was served." },
  { kind: "Flag", tone: "text-flag-amber", body: "Yellows by sector and who was stopped, full-course yellow, red flag." },
  { kind: "Position", tone: "text-success", body: "Places gained and lost, in class and overall in a multiclass race." },
  { kind: "Lap", tone: "text-muted", body: "Every lap time, personal and class bests marked, invalid laps greyed." },
  { kind: "Pit · Driver", tone: "text-muted", body: "Stops, driver swaps, the start and the finish." },
] as const;

const REPLAY_STEPS = [
  {
    title: "Leave your session",
    body: "Replays open from the game's main menu. Apex never pulls you out of a session to get there; it waits until you have left.",
  },
  {
    title: "Press Replay on a line",
    body: "LMU loads that race's replay, puts the camera on your car and seeks to five seconds before the moment. A long race can take up to a minute to load.",
  },
  {
    title: "Step through the rest",
    body: "Previous and Next walk the race's incidents in order. Every jump after the first load is instant.",
  },
] as const;

const KEYS = [
  ["↑ ↓", "Move between lines"],
  ["Enter", "Replay the marked line"],
  ["[ ]", "Previous and next incident"],
] as const;

const SEVERITY = [
  {
    term: "Light · heavy contact",
    body: "Graded from the impact LMU records for each contact. Roughly the hardest fifth are heavy, a cut measured across more than 12,000 contacts from 207 real races. Heavy is red on the timeline, light is amber, so the one that mattered stands out of a race full of rubbing.",
  },
  {
    term: "Minor · major · critical damage",
    body: "The same three grades the in-car HUD uses, which the damage widget and the race engineer share, so the log, the overlay and the radio agree about how bad it was.",
  },
  {
    term: "Track-limit points",
    body: "The stewards' own count: each warning shows your points against the allowance, so you can see the drive-through coming three laps before it arrives.",
  },
  {
    term: "Penalties",
    body: "What was given and why, in the stewards' words, then a quieter line when it was served, so a penalty reads as one story rather than two alarms.",
  },
] as const;

export default function LmuIncidentReviewPage() {
  return (
    <>
      <JsonLd data={buildAioBreadcrumbJsonLd("incident-review")} />
      <JsonLd data={buildAioWebPageJsonLd("incident-review")} />

      <AioPageHero
        kicker="Apex AIO · Race log · Replay"
        title={
          <>
            LMU Incident Review <span className="text-gradient">&amp; Race Replays</span>
          </>
        }
        lead={
          <>
            Every Le Mans Ultimate race you have driven, read back as a timeline:{" "}
            <strong className="text-ink">every contact and who it was with</strong>, track-limits
            warnings, penalties, damage, flags and places gained and lost. Press{" "}
            <strong className="text-ink">Replay</strong> on any incident and the game&rsquo;s own
            replay opens with the camera on your car, five seconds before it happened.
          </>
        }
        stats={[
          { value: "5 s", label: "Before each incident" },
          { value: "1 click", label: "Log to replay" },
          { value: "0", label: "Uploads" },
        ]}
        points={[
          "Every race LMU has kept, including before install",
          "Contacts graded light or heavy",
          "Copy as text for a protest",
        ]}
        visual={<RaceLogMock variant="hero" />}
        frame={false}
      />

      {/* 01 · What it is: prose on the left, the facts as a spec sheet on the right */}
      <section id="race-log" className="container-rail scroll-mt-36 py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading
              index="01"
              label="Race log · How it works"
              title="Every LMU race you've driven, read back incident by incident"
            />
            <div className="max-w-2xl space-y-4 text-lg leading-relaxed text-muted">
              <p>
                Le Mans Ultimate writes a results file after every race it finishes, online or
                offline, and then never shows you most of what is in it. The Race log tab in Apex AIO
                reads those files back. Races run down the left, newest first, with your finishing
                place and how many contacts and penalties each one had. Pick one and it opens as a
                timeline, one line per event.
              </p>
              <p>
                Because the game has been writing these files all along, every race it has kept is
                there the first time you open the tab, including races from before you installed
                Apex. Nothing needs switching on.
              </p>
              <p>
                Apex finds your car from your own lap times, not your name, so it follows the car
                through a team race&rsquo;s driver swaps. If it can&rsquo;t tell which car was
                yours, it asks once and remembers.
              </p>
            </div>
          </div>

          <Reveal delay={120} className="lg:col-span-5 lg:pt-24">
            <div className="border border-line bg-base/70">
              <p className="border-b border-line px-4 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
                Race log · spec
              </p>
              <dl>
                {LOG_SPEC.map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-b border-line/70 px-4 py-3 last:border-0"
                  >
                    <dt className="text-sm text-muted">{label}</dt>
                    <dd className="text-right font-mono text-sm text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 02 · The timeline: the whole tab, working, then what a line can be */}
      <section id="timeline" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail">
          <SectionHeading
            index="02"
            label="Race log · The timeline"
            title="A race timeline with every incident on it"
            lead={
              <>
                The race at the top: grid to finish in class and overall, laps, and a count of
                contacts, limits warnings and penalties, with your position drawn lap by lap. Under
                it, the race itself. Try the filters and the Replay buttons below: this is a working
                copy of the tab, on a {RL_LAPS}-lap race at Spa with {RL_COUNTS.incidents} incidents
                to step through.
              </>
            }
          />

          <Reveal>
            <RaceLogMock />
          </Reveal>

          <dl className="mt-12 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {LINE_KINDS.map((item) => (
              <div key={item.kind} className="bg-base p-5">
                <dt className={`font-mono text-[11px] uppercase tracking-[0.22em] ${item.tone}`}>{item.kind}</dt>
                <dd className="mt-2 text-sm text-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 03 · Replay: three steps, and the keys */}
      <section id="replay" className="container-rail scroll-mt-36 py-20">
        <SectionHeading
          index="03"
          label="Replay · From the game's own recording"
          title="Jump to any incident in the LMU replay"
          lead="Finding a contact in a 45-minute replay means scrubbing through it by hand. The race log already knows the second it happened and which car was yours, so Replay takes the game there for you."
        />

        <ol className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
          {REPLAY_STEPS.map((step, i) => (
            <li key={step.title} className="bg-base p-6">
              <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.24em]">
                <span className="tabular-nums text-cyan">{String(i + 1).padStart(2, "0")}</span>
                {i < REPLAY_STEPS.length - 1 && (
                  <span aria-hidden className="hidden text-subtle md:inline">
                    →
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-4 text-muted lg:col-span-7">
            <p>
              The replay is LMU&rsquo;s own, so every camera the game offers is there once it is
              open: the cockpit view to see what you saw, a chase or TV camera to see what everyone
              else saw. The race log only decides where the replay starts.
            </p>
            <p className="text-sm text-subtle">
              The game keeps its five most recent replays per circuit and replaces older ones, so a
              race from a while back keeps its full log but greys its Replay buttons and says why.
              Le Mans Ultimate has to be running to open a replay.
            </p>
          </div>
          <dl className="border-t border-line lg:col-span-5">
            {KEYS.map(([key, body]) => (
              <div key={key} className="grid grid-cols-[5rem_1fr] items-baseline gap-4 border-b border-line py-3">
                <dt>
                  <kbd className="rounded border border-line bg-surface px-2 py-0.5 font-mono text-sm text-ink">{key}</kbd>
                </dt>
                <dd className="text-sm text-muted">{body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 04 · How it grades: four terms, as a glossary */}
      <section id="severity" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              index="04"
              label="Stewarding · How it grades"
              title="Light or heavy contact, damage, limits and penalties"
              lead="A race full of rubbing and one real hit shouldn't read the same. The log grades what it can, in words the game already uses, and colours it so the one that mattered is the one you see."
            />
          </div>
          <dl className="border-t border-line lg:col-span-7">
            {SEVERITY.map((item) => (
              <div key={item.term} className="border-b border-line py-5">
                <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan">{item.term}</dt>
                <dd className="mt-2 text-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 05 · Protests: the paste itself is the picture */}
      <section id="protests" className="container-rail scroll-mt-36 py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              index="05"
              label="Copy as text · Protests"
              title="An incident report for a league protest, in one paste"
            />
            <div className="space-y-4 text-lg leading-relaxed text-muted">
              <p>
                Copy as text puts the lines on screen on your clipboard as plain text. The first
                line names the race (circuit, date, car number and class), because a paste is read
                later, somewhere else. Every line after it has the race time and lap, so a steward
                can find the moment in their own replay.
              </p>
              <p>
                Filter to Incidents or Contacts first and paste it into Discord or a protest form.
                Racing in the{" "}
                <Link href="/" className="text-cyan hover:underline">
                  Apex &amp; Chill league
                </Link>
                ? Paste it with your protest.
              </p>
            </div>
          </div>
          <Reveal delay={100} className="min-w-0 lg:col-span-7">
            <figure className="border border-line bg-base/80">
              <figcaption className="flex items-center justify-between border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle">
                <span>#protests · pasted</span>
                <span className="text-cyan">Incidents</span>
              </figcaption>
              <pre className="overflow-x-auto p-4 font-mono text-[11.5px] leading-relaxed text-ink">
                {rlCopyText()}
              </pre>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* 06 · Crash cover */}
      <section id="provisional" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            index="06"
            label="Recorded live · Crash cover"
            title="A race log even when LMU crashes"
            className="mb-0"
          />
          <div className="space-y-4 text-muted">
            <p>
              LMU writes its results file about a minute after the chequered flag. If the game
              crashes before then, including five hours into an endurance race, there is no file and
              the race is gone from the game&rsquo;s records.
            </p>
            <p>
              Apex writes the race down while you drive as well, so that race still has a log,
              marked <span className="font-mono text-flag-amber">provisional</span>. The live
              recording also adds what the results file never carries: yellow flags by sector and
              the car that caused them, full-course yellows, red flags, and your damage graded
              minor, major or critical.
            </p>
            <p className="text-sm text-subtle">
              A provisional log has no replay behind it, and a contact recorded live names the other
              car without a light or heavy grade, because the game only publishes the impact in the
              results file.
            </p>
          </div>
        </div>
      </section>

      <section className="container-rail py-16">
        <p className="max-w-3xl text-muted">
          The race log sits beside{" "}
          <Link href="/lmu-telemetry" className="text-cyan hover:underline">
            Review
          </Link>
          , which covers the laps: your optimal lap, lap comparison traces and pace against the
          aliens. The{" "}
          <Link href="/lmu-overlays" className="text-cyan hover:underline">
            track-limits overlay
          </Link>{" "}
          counts your points live while you drive, and the{" "}
          <Link href="/lmu-race-engineer" className="text-cyan hover:underline">
            race engineer
          </Link>{" "}
          calls the yellow and names the car behind it.
        </p>
      </section>

      <AioFaq items={PAGE_FAQ} className="border-t border-line" />

      <AioRelatedPages current="incident-review" />

      <AioTrialCta body="The race log and incident replay come with every overlay, the race engineer, Review, setups and the team pit wall. One subscription, everything included." />
    </>
  );
}
