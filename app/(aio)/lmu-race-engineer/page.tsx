import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { AskEngineer } from "@/components/overlay/AskEngineer";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioRelatedPages } from "@/components/aio/AioRelatedPages";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { SectionHeading } from "@/components/aio/SectionHeading";
import { Annotated, type Annotation } from "@/components/aio/overlays/Annotated";
import { RadioPanel } from "@/components/aio/race-engineer/RadioPanel";
import { AIO_PRODUCT } from "@/lib/aio";
import { getAioFaq, type AioFaqItem } from "@/lib/aio-faq";
import { buildAioBreadcrumbJsonLd, buildAioPageMetadata } from "@/lib/aio-seo";
import { cn } from "@/lib/utils";

const { priceDisplay: PRICE, trialDays: TRIAL_DAYS } = AIO_PRODUCT;

/** The trial buttons read the live release; keep in step with AIO_RELEASE_TTL_SECONDS. */
export const revalidate = 1800;

export const metadata = buildAioPageMetadata("race-engineer");

/** Teardown of one exchange. Positions are % of the radio panel's box. */
const RADIO_NOTES: Annotation[] = [
  {
    side: "left",
    x: 10,
    y: 24,
    label: "Push-to-talk",
    body: "Bind one button on your wheel. The mic opens only while you hold it, and a chirp tells you he's listening.",
  },
  {
    side: "left",
    x: 30,
    y: 82,
    label: "The answer",
    body: "Worked out from live telemetry on your PC and read back through the app's radio effects.",
  },
  {
    side: "right",
    x: 86,
    y: 5,
    label: "Voice",
    body: "Alan, the app's en-GB engineer. One of six voices bundled in the installer.",
  },
  {
    side: "right",
    x: 94,
    y: 64,
    label: "Response",
    body: "Back in under a second, so your hands stay on the wheel mid-corner.",
  },
];

/**
 * The areas the 28 offline questions cover. "Demo" lines are the scripted
 * demo questions in the hero, each one of the real 28.
 */
const QUESTION_GROUPS: { title: string; body: string; demo?: string }[] = [
  { title: "Gaps", body: "The car behind, the car ahead, and how the gap is moving.", demo: "Gap behind?" },
  { title: "Rivals", body: "Who's around you and what they're lapping, including where the leader is.", demo: "Where's the leader?" },
  { title: "Pace", body: "Your laps against theirs, so you know whether you're matching the car you're chasing." },
  { title: "Fuel", body: "Litres needed to the flag and what that means for the plan.", demo: "Fuel to the end?" },
  { title: "Tyres", body: "Corner-by-corner condition, and which one is running away from you.", demo: "How are my tyres?" },
  { title: "Damage", body: "What's damaged, how badly, and roughly what it's costing a lap.", demo: "Any damage?" },
  { title: "Pit windows", body: "When your window opens and who stops around you.", demo: "When do we pit?" },
  { title: "Flags", body: "What race control is showing, and where you stand on track limits.", demo: "Track limits?" },
  { title: "Weather", body: "Rain on the way, and which way the track temperature is heading.", demo: "What's the weather doing?" },
];

/** The proactive radio dial, exactly as the app offers it. */
const DIAL: { level: string; tag: string; calls: string[]; body: string }[] = [
  {
    level: "Off",
    tag: "Silence",
    calls: [],
    body: "He only speaks when you press the button and ask.",
  },
  {
    level: "Essential",
    tag: "What matters",
    calls: ["Flags", "Fuel", "Penalties", "Damage"],
    body: "The calls you'd want from a real engineer in a tight race.",
  },
  {
    level: "Standard",
    tag: "Plus the race",
    calls: ["Everything on Essential", "Fastest laps", "Position changes", "Rivals' pit stops"],
    body: "For following how the race is unfolding around your own car.",
  },
];

const PRIVACY: [string, string][] = [
  ["Microphone", "Open only while you hold your push-to-talk button. There is no wake word."],
  ["Team chat, stream, room", "Not listened to."],
  ["The 28 core questions", "Answered on your PC from live telemetry. Nothing is sent anywhere."],
  ["Free-form questions", "Transcribed on your PC by whisper.cpp. Only the text and a telemetry summary are sent."],
  ["Your audio", "Never leaves your machine."],
  ["A mumbled question", "He says “Say again?” instead of guessing."],
];

/** New questions this page answers, none duplicated in the shared bank. */
const PAGE_FAQ: AioFaqItem[] = [
  {
    q: "What can I ask the LMU race engineer?",
    page: "race-engineer",
    a: "Twenty-eight questions are answered instantly from live Le Mans Ultimate telemetry, on your PC: gaps, rivals, pace, fuel, tyres, damage, pit windows, flags and weather. Things like \"Gap behind?\", \"Fuel to the end?\", \"When do we pit?\" or \"What's the weather doing?\". Anything outside that set can be asked as a free-form question, which goes to an AI engineer with your speech transcribed locally first.",
  },
  {
    q: "Does the LMU voice race engineer work offline?",
    page: "race-engineer",
    a: "The 28 core questions do. They're answered entirely on your PC from live telemetry, with no cloud and no per-use cost, and they keep working with the internet unplugged. Only free-form AI questions need a connection. A confirmed subscription also carries a 72-hour offline grace window, so the app keeps running for three full days with no connection at all.",
  },
  {
    q: "How do I talk to the race engineer in Le Mans Ultimate?",
    page: "race-engineer",
    a: "Bind one button on your wheel as push-to-talk. Press it, hear the chirp, and ask out loud; the answer comes back over radio effects in under a second. There's no wake word and no open mic. The microphone only opens while you hold the button.",
  },
  {
    q: "Does the race engineer make calls without being asked?",
    page: "race-engineer",
    a: "Only if you want him to. Proactive radio sits on a dial you control: Off means he only answers when asked; Essential calls flags, fuel, penalties and damage; Standard adds fastest laps, position changes and rivals' pit stops.",
  },
];

export default function LmuRaceEngineerPage() {
  return (
    <>
      <JsonLd data={buildAioBreadcrumbJsonLd("race-engineer")} />

      <AioPageHero
        kicker="Apex AIO · Voice race engineer · Le Mans Ultimate"
        title={
          <>
            LMU Race Engineer, <span className="text-gradient">on push-to-talk</span>
          </>
        }
        lead={
          <>
            A voice race engineer for Le Mans Ultimate. Bind one wheel button, press it and ask out
            loud: gap behind, fuel to the end, when do we pit. He answers 28 questions offline from
            live telemetry, in under a second, over radio effects, and makes proactive calls on a dial
            you control. <strong className="text-ink">Pick a question to hear him.</strong>
          </>
        }
        stats={[
          { value: "28", label: "Questions offline" },
          { value: "<1 s", label: "To answer" },
          { value: "6", label: "Bundled voices" },
          { value: "72 h", label: "Offline grace" },
        ]}
        points={["Push-to-talk, never an open mic", "Audio never leaves your PC", "Included in the subscription"]}
        visualCaption="Radio · Race engineer"
        visualMeta="Demo"
        visual={<AskEngineer />}
      />

      {/* ── 01 How it works: a teardown of one exchange ───────────────────── */}
      <section id="how-it-works" className="scroll-mt-36 py-20">
        <div className="container-rail">
          <div className="grid gap-x-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionHeading index="01" label="How it works" title="A voice race engineer for Le Mans Ultimate" />
            </div>
            <div className="text-muted lg:col-span-5 lg:pt-10">
              <p>
                An engineer on the radio who knows what the car is doing, so you don&apos;t take your
                eyes off the road to find out. If you&apos;ve used a crew-chief-style app, the idea is
                familiar. He reads LMU&apos;s live telemetry and talks back in a radio voice, when you
                ask or, if you let him, on his own.
              </p>
              <p className="mt-4">
                He lives in the same app as your{" "}
                <Link href="/lmu-overlays" className="text-cyan hover:underline">
                  LMU overlays
                </Link>
                ,{" "}
                <Link href="/lmu-setups" className="text-cyan hover:underline">
                  setups
                </Link>{" "}
                and the{" "}
                <Link href="/lmu-pit-wall" className="text-cyan hover:underline">
                  team pit wall
                </Link>
                , so there&apos;s nothing extra to install or keep running beside the sim.
              </p>
            </div>
          </div>

          <Annotated caption="Radio · One exchange" meta="Teardown" notes={RADIO_NOTES} mockWidth={30} className="mt-4">
            <RadioPanel />
          </Annotated>

          <p className="mt-6 max-w-3xl font-mono text-xs leading-relaxed text-subtle">
            Not the setup optimiser&apos;s <em>Race engineer</em> sliders on{" "}
            <Link href="/lmu-setups" className="text-cyan hover:underline">
              LMU Setups
            </Link>
            , which turn a handling intent into staged garage changes. This page is about the one you
            talk to on track.
          </p>
        </div>
      </section>

      {/* ── 02 The 28 questions, as a radio log ──────────────────────────── */}
      <section id="questions" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail">
          <SectionHeading
            index="02"
            label="28 core questions · on your PC"
            title="Ask out loud: 28 questions answered offline"
            lead="The core set is answered locally, straight from live telemetry. It needs no cloud, costs nothing per question and works with the internet unplugged. These are the areas it covers."
          />

          <div className="border-t border-line">
            <div className="hidden grid-cols-[9rem_1fr_14rem] gap-6 border-b border-line py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-subtle md:grid">
              <span>Area</span>
              <span>What he tells you</span>
              <span>Heard in the demo</span>
            </div>
            <ul>
              {QUESTION_GROUPS.map((group) => (
                <li
                  key={group.title}
                  className="grid gap-1 border-b border-line py-3 md:grid-cols-[9rem_1fr_14rem] md:items-baseline md:gap-6"
                >
                  <h3 className="font-display text-lg font-bold text-ink">{group.title}</h3>
                  <p className="text-sm text-muted">{group.body}</p>
                  <p className="font-mono text-xs text-cyan">{group.demo ? `“${group.demo}”` : ""}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            <figure className="lg:col-span-7">
              <h3 className="font-mono text-[11px] font-normal tracking-[0.24em] text-cyan">
                An LMU fuel calculator, by voice
              </h3>
              <blockquote className="mt-4 font-mono text-2xl leading-snug text-ink sm:text-3xl">
                &ldquo;You need <span className="tabular-nums">46.7</span> litres to the flag. That&apos;s
                a splash at the last stop. Plan&apos;s unchanged.&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-muted">
                The answer to &ldquo;Fuel to the end?&rdquo;. Follow it with &ldquo;When do we
                pit?&rdquo; for the window. To see it as well, the fuel widget in the{" "}
                <Link href="/lmu-overlays" className="text-cyan hover:underline">
                  LMU overlays
                </Link>{" "}
                keeps the same picture on screen.
              </figcaption>
            </figure>
            <div className="border-l border-line pl-6 lg:col-span-5">
              <h3 className="font-mono text-[11px] font-normal tracking-[0.24em] text-cyan">
                Anything else: the AI engineer
              </h3>
              <p className="mt-4 text-muted">
                Harder, free-form questions go to an AI engineer. Your speech is transcribed on your own
                PC by whisper.cpp first, and only the text plus a telemetry summary is sent to be
                answered. Your audio isn&apos;t. Free-form questions are included in the {PRICE}{" "}
                subscription with a generous monthly allowance, and they&apos;re the one part of the
                engineer that needs an internet connection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 Proactive radio, as a three-position dial ─────────────────── */}
      <section id="proactive-radio" className="container-rail scroll-mt-36 py-20">
        <SectionHeading
          index="03"
          label="Proactive radio"
          title="Proactive radio calls, on a dial you control"
          lead="Set the dial and he calls the moments that matter on his own, the way an engineer would on a real team radio. Turn it down and he stays quiet."
          align="center"
        />

        <div className="mx-auto max-w-5xl">
          <div aria-hidden className="relative mb-8 hidden h-6 md:block">
            <span className="absolute inset-x-[16.66%] top-1/2 h-px bg-line" />
            {DIAL.map((setting, i) => (
              <span
                key={setting.level}
                className={cn(
                  "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border",
                  setting.level === "Essential" ? "border-cyan bg-cyan" : "border-subtle bg-base",
                )}
                style={{ left: `${16.66 + i * 33.33}%` }}
              />
            ))}
          </div>
          <ol className="grid border-y border-line md:grid-cols-3 md:divide-x md:divide-line">
            {DIAL.map((setting) => (
              <li
                key={setting.level}
                className="flex flex-col gap-4 border-b border-line px-2 py-6 last:border-b-0 md:border-b-0 md:px-6"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3
                    className={cn(
                      "font-display text-3xl font-bold",
                      setting.level === "Essential" ? "text-cyan" : "text-ink",
                    )}
                  >
                    {setting.level}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">{setting.tag}</span>
                </div>
                {setting.calls.length > 0 ? (
                  <ul className="font-mono text-sm text-ink">
                    {setting.calls.map((call) => (
                      <li key={call} className="border-b border-line/60 py-1.5 last:border-b-0">
                        {call}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-mono text-sm text-subtle">No unprompted calls</p>
                )}
                <p className="mt-auto text-sm text-muted">{setting.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-sm text-muted">
            Pair him with the radar and relative in the{" "}
            <Link href="/lmu-overlays" className="text-cyan hover:underline">
              LMU overlays
            </Link>{" "}
            to see who&apos;s alongside as well as hear it. Engineering a teammate instead? The{" "}
            <Link href="/lmu-pit-wall" className="text-cyan hover:underline">
              LMU pit wall
            </Link>{" "}
            follows whoever is in the car.
          </p>
        </div>
      </section>

      {/* ── 04 Privacy, as a spec sheet ───────────────────────────────────── */}
      <section id="privacy" className="scroll-mt-36 border-y border-line bg-surface/30 py-20">
        <div className="container-rail grid gap-12 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              index="04"
              label="Push-to-talk · local transcription"
              title="Private by design: push-to-talk, transcribed on your PC"
              lead="He should hear what you say to him and nothing else. The mic is closed unless your thumb is on the button, and your words become text on your own machine."
              className="mb-0"
            />
          </div>
          <dl className="border-t border-line lg:col-span-7">
            {PRIVACY.map(([term, detail]) => (
              <div key={term} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">{term}</dt>
                <dd className="text-ink">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 05 Voices and cost: big figures, then the ledger ──────────────── */}
      <section id="voices" className="container-rail scroll-mt-36 py-20">
        <SectionHeading index="05" label="Bundled · signed · included" title="Six voices, nothing to download" />

        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <dl className="grid grid-cols-2 border-y border-line">
              <div className="flex flex-col-reverse gap-3 py-6 pr-6">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">Voices in the installer</dt>
                <dd className="font-mono text-7xl font-semibold tabular-nums leading-none text-ink">6</dd>
              </div>
              <div className="flex flex-col-reverse gap-3 border-l border-line py-6 pl-6">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">Offline grace</dt>
                <dd className="font-mono text-7xl font-semibold tabular-nums leading-none text-ink">
                  72<span className="ml-1 text-2xl text-subtle">h</span>
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-muted">
              Voices, speech recognition and all ship inside the Apex AIO installer, signed, so there is
              nothing to download afterwards and nothing for antivirus to flag. The voice in the demo is
              Alan, the app&apos;s own en-GB engineer, through the same radio channel the app uses.
            </p>
            <p className="mt-4 text-muted">
              Every build, and the bundled voice engine, is code-signed through Azure Trusted Signing
              under The Lilybank Agency Ltd, so Windows shows no &ldquo;unknown publisher&rdquo; prompt.
              The 28 core questions keep working offline, and a confirmed subscription runs for 72 hours
              without a connection, for LAN events and weekends away.
            </p>
          </Reveal>

          <div className="lg:col-span-6">
            <h3 className="text-2xl font-bold text-ink">What the race engineer costs</h3>
            <p className="mt-3 text-muted">
              Nothing on top. It&apos;s in the Apex AIO subscription ({TRIAL_DAYS} days free, then{" "}
              {PRICE} a month) with every overlay, the setup optimiser, the team pit wall and{" "}
              <Link href="/lmu-telemetry" className="text-cyan hover:underline">
                lap-by-lap telemetry review
              </Link>
              .
            </p>
            <dl className="mt-6 border-t border-line">
              {[
                ["28 telemetry questions", "Answered locally. No per-use cost."],
                ["Free-form AI questions", "Included, with a generous monthly allowance"],
                ["Voices and speech recognition", "Bundled in the installer"],
              ].map(([term, detail]) => (
                <div key={term} className="grid gap-1 border-b border-line py-3 sm:grid-cols-[14rem_1fr] sm:gap-6">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-subtle">{term}</dt>
                  <dd className="text-ink">{detail}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-subtle">
              Plan and billing details are in the{" "}
              <Link href="/apex-overlay-system#pricing" className="text-cyan hover:underline">
                Apex AIO pricing section
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <AioFaq
        items={[...getAioFaq("race-engineer"), ...PAGE_FAQ]}
        heading="Race engineer FAQ"
        index="06"
        className="border-t border-line"
      />

      <AioRelatedPages current="race-engineer" />

      <AioTrialCta
        body={`Bind a wheel button, press it and ask. The race engineer (28 offline questions, proactive radio, six bundled voices) is in the ${TRIAL_DAYS}-day free trial with everything else in Apex AIO.`}
      />
    </>
  );
}
