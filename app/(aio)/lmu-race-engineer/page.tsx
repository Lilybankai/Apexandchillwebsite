import Link from "next/link";
import {
  CheckCircle2,
  CloudOff,
  CloudSun,
  Flag,
  Fuel,
  Gauge,
  HelpCircle,
  Lock,
  Mic,
  Radio,
  ShieldCheck,
  Timer,
  Users,
  Volume2,
  Wrench,
  Disc3,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { AskEngineer } from "@/components/overlay/AskEngineer";
import { AioPageHero } from "@/components/aio/AioPageHero";
import { AioFaq } from "@/components/aio/AioFaq";
import { AioRelatedPages } from "@/components/aio/AioRelatedPages";
import { AioTrialCta } from "@/components/aio/AioTrialCta";
import { JsonLd } from "@/components/aio/JsonLd";
import { AIO_PRODUCT } from "@/lib/aio";
import { getAioFaq, type AioFaqItem } from "@/lib/aio-faq";
import { buildAioBreadcrumbJsonLd, buildAioPageMetadata } from "@/lib/aio-seo";

const { priceDisplay: PRICE, trialDays: TRIAL_DAYS } = AIO_PRODUCT;

/** The trial buttons read the live release; keep in step with AIO_RELEASE_TTL_SECONDS. */
export const revalidate = 1800;

export const metadata = buildAioPageMetadata("race-engineer");

/** Press, ask, hear — how one exchange with the engineer goes. */
const HOW_IT_WORKS: { icon: typeof Mic; title: string; body: string }[] = [
  {
    icon: Disc3,
    title: "Bind one wheel button",
    body: "That's your push-to-talk. Hands stay where they belong — on the wheel, mid-corner.",
  },
  {
    icon: Mic,
    title: "Press it, hear the chirp, ask",
    body: "Out loud, in your own words: gap behind, fuel to the end, when do we pit, what's the weather doing.",
  },
  {
    icon: Radio,
    title: "The answer comes back on the radio",
    body: "In under a second, from your live telemetry, through radio effects — like a real pit wall on the other end.",
  },
];

/**
 * The areas the 28 offline questions cover. "Heard in the demo" lines are the
 * scripted demo questions above, each one of the real 28.
 */
const QUESTION_GROUPS: { icon: typeof Mic; title: string; body: string; demo?: string }[] = [
  {
    icon: Timer,
    title: "Gaps",
    body: "The car behind, the car ahead, and how the gap is moving.",
    demo: "Gap behind?",
  },
  {
    icon: Users,
    title: "Rivals",
    body: "Who's around you and what they're lapping — including where the leader is.",
    demo: "Where's the leader?",
  },
  {
    icon: Gauge,
    title: "Pace",
    body: "Your laps against theirs, so you know whether you're matching the car you're chasing.",
  },
  {
    icon: Fuel,
    title: "Fuel",
    body: "Litres needed to the flag and what that means for the plan.",
    demo: "Fuel to the end?",
  },
  {
    icon: Sparkles,
    title: "Tyres",
    body: "Corner-by-corner condition, and which one is running away from you.",
    demo: "How are my tyres?",
  },
  {
    icon: Wrench,
    title: "Damage",
    body: "What's damaged, how badly, and roughly what it's costing a lap.",
    demo: "Any damage?",
  },
  {
    icon: Radio,
    title: "Pit windows",
    body: "When your window opens and who stops around you.",
    demo: "When do we pit?",
  },
  {
    icon: Flag,
    title: "Flags",
    body: "What race control is showing, and where you stand on track limits — without looking away from the road.",
    demo: "Track limits?",
  },
  {
    icon: CloudSun,
    title: "Weather",
    body: "Rain on the way, and which way the track temperature is heading.",
    demo: "What's the weather doing?",
  },
];

/** The proactive radio dial, exactly as the app offers it. */
const DIAL: { level: string; tag: string; calls: string[]; body: string }[] = [
  {
    level: "Off",
    tag: "Silence",
    calls: [],
    body: "Off means off. He only speaks when you press the button and ask.",
  },
  {
    level: "Essential",
    tag: "The things that matter",
    calls: ["Flags", "Fuel", "Penalties", "Damage"],
    body: "The calls you'd want from a real engineer in a tight race — nothing you'd have to filter out.",
  },
  {
    level: "Standard",
    tag: "Essential, plus the race around you",
    calls: ["Everything on Essential", "Fastest laps", "Position changes", "Rivals' pit stops"],
    body: "For when you want to know how the race is unfolding, not just your own car.",
  },
];

/** New questions this page answers — none duplicated in the shared bank. */
const PAGE_FAQ: AioFaqItem[] = [
  {
    q: "What can I ask the LMU race engineer?",
    page: "race-engineer",
    a: "Twenty-eight questions are answered instantly from live Le Mans Ultimate telemetry, on your PC: gaps, rivals, pace, fuel, tyres, damage, pit windows, flags and weather — things like \"Gap behind?\", \"Fuel to the end?\", \"When do we pit?\" or \"What's the weather doing?\". Anything outside that set can be asked as a free-form question, which goes to an AI engineer with your speech transcribed locally first.",
  },
  {
    q: "Does the LMU voice race engineer work offline?",
    page: "race-engineer",
    a: "The 28 core questions do — they're answered entirely on your PC from live telemetry, with no cloud and no per-use cost, and they keep working with the internet unplugged. Only free-form AI questions need a connection. A confirmed subscription also carries a 72-hour offline grace window, so the app keeps running for three full days with no connection at all.",
  },
  {
    q: "How do I talk to the race engineer in Le Mans Ultimate?",
    page: "race-engineer",
    a: "Bind one button on your wheel as push-to-talk. Press it, hear the chirp, and ask out loud; the answer comes back over radio effects in under a second. There's no wake word and no open mic — the microphone only opens while you hold the button.",
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
        kicker="Apex AIO · Voice race engineer"
        title={
          <>
            LMU Race Engineer, <span className="text-gradient">on push-to-talk</span>
          </>
        }
        lead={
          <>
            A voice race engineer for Le Mans Ultimate. Bind one wheel button, press it and ask out
            loud — gap behind, fuel to the end, when do we pit, what the weather&apos;s doing. The
            Apex AIO LMU race engineer answers 28 questions offline from live telemetry, in under a
            second, over radio effects — and makes proactive radio calls on a dial you control.{" "}
            <strong className="text-ink">Try it: pick a question.</strong>
          </>
        }
        points={[
          "Push-to-talk, never an open mic",
          "28 questions answered offline",
          "Audio never leaves your PC",
          "Included in the subscription",
        ]}
        visual={<AskEngineer />}
      />

      {/* ── What it is ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="container-rail scroll-mt-36 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <Reveal>
            <span className="kicker mb-4">How it works</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              A voice race engineer <span className="text-gradient">for Le Mans Ultimate</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              If you&apos;ve used a crew-chief-style app before, the idea will be familiar: an
              engineer on the radio who knows what the car is doing, so you don&apos;t have to take
              your eyes off the road to find out. The Apex AIO engineer reads Le Mans
              Ultimate&apos;s live telemetry and talks back in a proper radio voice — ask him
              something, or let him call the important moments on his own.
            </p>
            <p className="mt-4 text-lg text-muted">
              He lives in the same app as your{" "}
              <Link href="/lmu-overlays" className="text-cyan hover:underline">
                LMU overlays
              </Link>
              , your{" "}
              <Link href="/lmu-setups" className="text-cyan hover:underline">
                setups
              </Link>{" "}
              and the{" "}
              <Link href="/lmu-pit-wall" className="text-cyan hover:underline">
                team pit wall
              </Link>
              , so there&apos;s nothing extra to install, configure or keep running beside the sim.
            </p>
            <p className="mt-6 rounded-card border border-line bg-surface/60 p-4 text-sm text-subtle">
              Not to be confused with the setup optimiser&apos;s <em>Race engineer</em> sliders on{" "}
              <Link href="/lmu-setups" className="text-cyan hover:underline">
                LMU Setups
              </Link>
              , which turn a handling intent into staged garage changes. This page is about the one
              you talk to on track.
            </p>
          </Reveal>

          <div className="grid gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.title} delay={i * 100}>
                <Card variant="default" className="flex items-start gap-4 p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-display text-lg font-bold text-accent">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 text-xl font-bold text-ink">
                      <step.icon size={18} className="text-cyan" />
                      {step.title}
                    </h3>
                    <p className="mt-1 text-muted">{step.body}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── The 28 questions ─────────────────────────────────────────────── */}
      <section id="questions" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail">
          <Reveal className="max-w-3xl">
            <span className="kicker mb-4">28 core questions · on your PC</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Ask out loud: <span className="text-gradient">28 questions answered offline</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              The engineer&apos;s core question set is answered locally, straight from live
              telemetry — no cloud, no per-use cost, and it works with the internet unplugged.
              Free, offline, forever. These are the areas it covers:
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUESTION_GROUPS.map((group, i) => (
              <Reveal key={group.title} delay={(i % 3) * 80}>
                <Card variant="default" className="flex h-full flex-col gap-3 p-6">
                  <div className="flex items-center gap-3">
                    <group.icon size={20} className="text-cyan" />
                    <h3 className="text-xl font-bold text-ink">{group.title}</h3>
                  </div>
                  <p className="text-sm text-muted">{group.body}</p>
                  {group.demo && (
                    <p className="mt-auto font-mono text-xs text-subtle">
                      Heard in the demo: <span className="text-cyan">&ldquo;{group.demo}&rdquo;</span>
                    </p>
                  )}
                </Card>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Card variant="glow" clip className="p-7">
              <div className="flex items-center gap-3">
                <Fuel size={22} className="text-cyan" />
                <h3 className="text-2xl font-bold text-ink">An LMU fuel calculator, by voice</h3>
              </div>
              <p className="mt-3 text-muted">
                Ask &ldquo;Fuel to the end?&rdquo; and you get the number, not a spreadsheet:{" "}
                <em className="text-ink">
                  &ldquo;You need 46.7 litres to the flag. That&apos;s a splash at the last stop —
                  plan&apos;s unchanged.&rdquo;
                </em>{" "}
                Follow it with &ldquo;When do we pit?&rdquo; for the window. If you&apos;d rather
                see it, the fuel widget in the{" "}
                <Link href="/lmu-overlays" className="text-cyan hover:underline">
                  LMU overlays
                </Link>{" "}
                keeps the same picture on screen.
              </p>
            </Card>
            <Card variant="default" className="p-7">
              <div className="flex items-center gap-3">
                <Sparkles size={22} className="text-accent" />
                <h3 className="text-2xl font-bold text-ink">Anything else: ask the AI engineer</h3>
              </div>
              <p className="mt-3 text-muted">
                Harder, free-form questions go to an AI engineer. Your speech is transcribed on your
                own PC by whisper.cpp first, and only the transcribed text plus a telemetry summary is
                sent to be answered — never your audio. Free-form questions are included in the{" "}
                {PRICE} subscription with a generous monthly allowance, and they&apos;re the one part
                of the engineer that needs an internet connection.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Proactive radio ──────────────────────────────────────────────── */}
      <section id="proactive-radio" className="container-rail scroll-mt-36 py-16">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="kicker mb-4">Proactive radio</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">
            Proactive radio calls — <span className="text-gradient">on a dial you control</span>
          </h2>
          <p className="mt-5 text-lg text-muted">
            The engineer doesn&apos;t only answer. Set the dial and he calls the things that matter
            on his own — the way a spotter or engineer would on a real team radio — and stays quiet
            when you&apos;d rather concentrate.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {DIAL.map((setting, i) => (
            <Reveal key={setting.level} delay={i * 100}>
              <Card
                variant={setting.level === "Essential" ? "glow" : "default"}
                className="flex h-full flex-col gap-4 p-7"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-3xl font-bold uppercase text-ink">{setting.level}</h3>
                  <span className="chip border-accent/40 text-accent-2">{setting.tag}</span>
                </div>
                {setting.calls.length > 0 ? (
                  <ul className="space-y-2">
                    {setting.calls.map((call) => (
                      <li key={call} className="flex items-start gap-3 text-muted">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
                        <span>{call}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="flex items-center gap-3 text-muted">
                    <Volume2 size={16} className="shrink-0 text-subtle" />
                    No unprompted calls at all
                  </p>
                )}
                <p className="mt-auto text-sm text-subtle">{setting.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-subtle">
          Want to see who&apos;s alongside as well as hear it? Pair the engineer with the radar and
          relative widgets in the{" "}
          <Link href="/lmu-overlays" className="text-cyan hover:underline">
            LMU overlays
          </Link>
          . Engineering a teammate instead of driving? The{" "}
          <Link href="/lmu-pit-wall" className="text-cyan hover:underline">
            LMU pit wall
          </Link>{" "}
          follows whoever is in the car.
        </p>
      </section>

      {/* ── Privacy ──────────────────────────────────────────────────────── */}
      <section id="privacy" className="scroll-mt-36 border-y border-line bg-surface/30 py-16">
        <div className="container-rail grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <span className="kicker mb-4">Push-to-talk · local transcription</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Private by design: <span className="text-gradient">push-to-talk, transcribed on your PC</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              An LMU push-to-talk engineer should hear exactly what you say to him and nothing else.
              That&apos;s the whole design: the microphone is closed unless your thumb is on the
              button, and what you say is turned into text on your own machine.
            </p>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Lock,
                title: "No open mic, no wake word",
                body: "The microphone only opens while you hold your bound push-to-talk button. Team chat, the stream, the room — none of it is listened to.",
              },
              {
                icon: CloudOff,
                title: "The 28 questions stay on your PC",
                body: "Core questions are answered entirely locally from live telemetry. Nothing is sent anywhere, and there's no per-use cost.",
              },
              {
                icon: Mic,
                title: "Free-form questions: whisper.cpp, locally",
                body: "Your speech is transcribed on your PC by whisper.cpp, so your audio never leaves your machine — only the text plus a telemetry summary is sent to be answered.",
              },
              {
                icon: HelpCircle,
                title: "“Say again?”",
                body: "When he can't make out what you said, he asks you to repeat it rather than guessing — so a mumbled question never gets a confident wrong answer.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={(i % 2) * 100}>
                <Card variant="default" className="flex h-full flex-col gap-3 p-6">
                  <item.icon size={22} className="text-cyan" />
                  <h3 className="text-xl font-bold text-ink">{item.title}</h3>
                  <p className="text-sm text-muted">{item.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Voices, offline, cost ───────────────────────────────────────── */}
      <section id="voices" className="container-rail scroll-mt-36 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <span className="kicker mb-4">Bundled · signed · included</span>
            <h2 className="text-4xl font-bold text-ink sm:text-5xl">
              Six voices, <span className="text-gradient">nothing to download</span>
            </h2>
            <p className="mt-5 text-lg text-muted">
              The engineer — voices, speech recognition and all — ships inside the Apex AIO
              installer. The voice you hear in the demo above is Alan, the app&apos;s own en-GB
              engineer, through the same radio channel the app uses; he&apos;s one of six.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Six voices, bundled and signed inside the installer — nothing to download afterwards, nothing for antivirus to flag.",
                "Every build, and the bundled voice engine, is code-signed through Azure Trusted Signing under The Lilybank Agency Ltd — no SmartScreen “unknown publisher” prompt.",
                "The 28 core questions keep working offline, and a confirmed subscription carries a 72-hour offline grace window for LAN events and weekends away.",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-muted">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={140}>
            <Card variant="glow" clip className="p-8">
              <div className="flex items-center gap-3">
                <ShieldCheck size={24} className="text-cyan" />
                <h3 className="text-2xl font-bold text-ink">What the race engineer costs</h3>
              </div>
              <p className="mt-4 text-muted">
                Nothing on top. The voice race engineer is bundled and included in the Apex AIO
                subscription — {TRIAL_DAYS} days free, then {PRICE} a month, alongside every
                overlay, the setup optimiser, the team pit wall and{" "}
                <Link href="/lmu-telemetry" className="text-cyan hover:underline">
                  lap-by-lap telemetry review
                </Link>
                .
              </p>
              <dl className="mt-6 grid gap-3 text-sm">
                {[
                  ["28 telemetry questions", "Answered locally — effectively free forever"],
                  ["Free-form AI questions", "Included, with a generous monthly allowance"],
                  ["Voices & speech recognition", "Bundled in the installer"],
                ].map(([term, detail]) => (
                  <div
                    key={term}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-card border border-line bg-base/50 px-4 py-3"
                  >
                    <dt className="font-display uppercase tracking-wide text-ink">{term}</dt>
                    <dd className="text-muted">{detail}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm text-subtle">
                Full plan and billing details on the{" "}
                <Link href="/apex-overlay-system#pricing" className="text-cyan hover:underline">
                  Apex AIO pricing section
                </Link>
                .
              </p>
            </Card>
          </Reveal>
        </div>
      </section>

      <AioFaq items={[...getAioFaq("race-engineer"), ...PAGE_FAQ]} heading="Race engineer FAQ" />

      <AioRelatedPages current="race-engineer" />

      <AioTrialCta
        body={`Bind a wheel button, press it and ask. The voice race engineer — 28 offline questions, proactive radio and six bundled voices — is in the ${TRIAL_DAYS}-day free trial, with everything else in Apex AIO.`}
      />
    </>
  );
}
