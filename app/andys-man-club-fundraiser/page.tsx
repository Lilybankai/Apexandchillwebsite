import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Flag,
  HeartHandshake,
  Radio,
  Ticket,
  Timer,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { fetchSimgridEvent } from "@/lib/api/simgrid";
import {
  AMC_CHAMPIONSHIP_ID,
  AMC_DONATE_URL,
  AMC_EVENT,
  AMC_EVENT_PATH,
  AMC_EVENT_SNAPSHOT,
  AMC_VIDEOS,
  DISCORD_URL,
  YOUTUBE_URL,
} from "@/lib/events/andys-man-club";
import { SITE_URL } from "@/lib/site";
import { ORGANIZATION_ID } from "@/lib/seo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/aio/JsonLd";
import { AndysManClubFeature } from "@/components/partners/AndysManClubFeature";
import { EventDetailText } from "@/components/events/EventDetailText";
import { VideoEmbed } from "@/components/events/VideoEmbed";
import type { EventDetail } from "@/lib/events/tbc";

export const metadata: Metadata = {
  title: "Andy's Man Club Charity Race — Daytona 3 Hours",
  alternates: { canonical: AMC_EVENT_PATH },
  description:
    "Race the Daytona 3 Hours in Le Mans Ultimate on Saturday 12 December 2026 at 18:00 UK time and raise money for Andy's Man Club. Hypercar, LMP2 and LMGT3 on a 66-car grid — £10 entry, and all money raised on the day goes to the charity.",
  keywords: [
    "Andy's Man Club",
    "charity sim race",
    "Le Mans Ultimate charity race",
    "LMU Daytona",
    "sim racing fundraiser",
    "#ITSOKAYTOTALK",
  ],
};

/** Entry count + registration state come from SimGrid; refresh every 5 minutes. */
export const revalidate = 300;

const LONDON_DATE = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const LONDON_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZoneName: "short",
});

/** `{ date, time }` in UK time, or TBC placeholders when the race is unscheduled. */
function ukDateTime(iso: string): { date: EventDetail; time: EventDetail } {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) {
    return {
      date: { tbc: true, note: "Race date to be confirmed" },
      time: { tbc: true, note: "Start time to be confirmed" },
    };
  }
  return { date: LONDON_DATE.format(d), time: LONDON_TIME.format(d) };
}

export default async function AndysManClubFundraiserPage() {
  const { data: event } = await fetchSimgridEvent(AMC_CHAMPIONSHIP_ID, AMC_EVENT_SNAPSHOT);
  const race = event.races.find((r) => !r.ended) ?? event.races[event.races.length - 1];
  // The organiser-confirmed start wins over SimGrid's (which still lists 7 Dec).
  const { date, time } = ukDateTime(AMC_EVENT.raceStart);
  const live = event.source === "simgrid";
  // The snapshot can't know a race has run, so fall back to the clock.
  const finished = live
    ? event.races.every((r) => r.ended)
    : new Date(AMC_EVENT.raceStart).getTime() < Date.now();
  const placesLeft = event.capacity === null ? null : Math.max(event.capacity - event.spotsTaken, 0);

  const status = finished
    ? { label: "Race complete", tone: "bg-subtle" }
    : !live
      ? { label: "Registration status on SimGrid", tone: "bg-subtle" }
      : event.acceptingRegistrations
        ? { label: "Registrations open", tone: "bg-success" }
        : { label: "Registrations closed", tone: "bg-flag-red" };

  const primaryCta = finished
    ? { href: event.resultsUrl, label: "View Results" }
    : event.acceptingRegistrations || !live
      ? { href: event.url, label: "Enter on SimGrid" }
      : { href: event.url, label: "View on SimGrid" };

  const details: { icon: typeof Flag; label: string; value: EventDetail }[] = [
    { icon: Flag, label: "Circuit", value: race.track },
    { icon: Timer, label: "Race length", value: AMC_EVENT.raceLength },
    { icon: CalendarDays, label: "Date", value: date },
    { icon: Clock, label: "Race start", value: time },
    { icon: Trophy, label: "Sim", value: event.game },
    { icon: event.teamsEnabled ? Users : User, label: "Entry", value: event.teamsEnabled ? "Teams" : "Solo drivers" },
    { icon: Ticket, label: "Classes", value: `${AMC_EVENT.carClass} · ${AMC_EVENT.gridSize}-car grid` },
    { icon: Timer, label: "Practice & qualifying", value: AMC_EVENT.sessionFormat },
  ];

  return (
    <div className="pb-8">
      {/* Only confirmed facts go into structured data — no placeholder values. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: AMC_EVENT.title,
          description: AMC_EVENT.summary,
          startDate: AMC_EVENT.raceStart,
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: { "@type": "VirtualLocation", url: event.url },
          organizer: { "@type": "Organization", "@id": ORGANIZATION_ID, name: "Apex & Chill Racing", url: SITE_URL },
          offers: {
            "@type": "Offer",
            price: AMC_EVENT.entryFeeGbp,
            priceCurrency: "GBP",
            url: event.url,
          },
          url: `${SITE_URL}${AMC_EVENT_PATH}`,
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/15 via-transparent to-cyan/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-16 h-80 w-80 rounded-full bg-pink/20 blur-[110px]"
        />
        <div className="container-rail relative grid gap-12 py-20 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-pink/15 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-pink">
              <HeartHandshake size={14} />
              Charity Race · {event.game}
            </span>
            <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-tight text-ink sm:text-6xl">
              The Daytona 3 Hours
              <br />
              <span className="text-gradient">for Andy&apos;s Man Club</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted">{AMC_EVENT.summary}</p>

            <ul className="mt-6 flex flex-wrap gap-2 text-sm">
              {[
                { icon: CalendarDays, value: date },
                { icon: Clock, value: time },
                { icon: Flag, value: race.track },
              ].map((fact, i) => (
                <li
                  key={i}
                  className="inline-flex items-center gap-2 rounded-card border border-line bg-surface/50 px-3 py-1.5 text-muted"
                >
                  <fact.icon size={15} className="shrink-0 text-cyan" />
                  <EventDetailText detail={fact.value} />
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={primaryCta.href} target="_blank" rel="noopener noreferrer" size="lg">
                {primaryCta.label}
                <ArrowRight size={18} />
              </Button>
              <Button href={AMC_DONATE_URL} target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
                Donate on JustGiving
              </Button>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-subtle">
              <span className={`h-2 w-2 rounded-full ${status.tone}`} aria-hidden />
              {status.label}
            </p>
          </div>

          <div className="flex flex-col items-center gap-8 rounded-card border border-pink/40 bg-base/50 p-8 shadow-glow-soft">
            <Image
              src="/brand/andysmanclub-logo-white.png"
              alt="Andy's Man Club"
              width={1000}
              height={200}
              priority
              className="h-auto w-full max-w-[300px] object-contain"
            />
            <div aria-hidden className="h-px w-24 bg-line" />
            <Image
              src="/brand/itsokaytotalk-logo-white.png"
              alt="#ITSOKAYTOTALK"
              width={1000}
              height={200}
              className="h-auto w-full max-w-[240px] object-contain"
            />
          </div>
        </div>
      </section>

      {/* Entry — live from SimGrid */}
      <section aria-labelledby="entry-heading" className="container-rail py-16">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="kicker mb-3">Entry</span>
            <h2 id="entry-heading" className="text-4xl font-bold text-ink sm:text-5xl">
              Grab A Place On The Grid
            </h2>
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
            {live ? "Live from SimGrid · updates every 5 min" : "Live entry count on SimGrid"}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col gap-3 p-6">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-subtle">Places</span>
            {live && event.capacity !== null ? (
              <>
                <p className="font-display text-4xl font-bold text-ink">
                  {event.spotsTaken}
                  <span className="text-xl text-subtle"> / {event.capacity}</span>
                </p>
                <div
                  role="progressbar"
                  aria-label="Places taken"
                  aria-valuemin={0}
                  aria-valuemax={event.capacity}
                  aria-valuenow={event.spotsTaken}
                  aria-valuetext={`${event.spotsTaken} of ${event.capacity} places taken`}
                  className="h-2 overflow-hidden rounded-full bg-elevated"
                >
                  <div
                    className="h-full bg-neon-primary"
                    style={{ width: `${Math.min((event.spotsTaken / Math.max(event.capacity, 1)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted">
                  {placesLeft === 0 ? "Grid full" : `${placesLeft} places left`}
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-4xl font-bold text-ink">
                  {AMC_EVENT.gridSize}
                </p>
                <p className="text-sm text-muted">Car grid — see SimGrid for places left.</p>
              </>
            )}
          </Card>

          <Card className="flex flex-col gap-3 p-6">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-subtle">Entry fee</span>
            <p className="font-display text-4xl font-bold text-ink">{AMC_EVENT.entryFee}</p>
            <p className="text-sm text-muted">{AMC_EVENT.feeDestination}.</p>
          </Card>

          <Card className="flex flex-col gap-3 p-6 sm:col-span-2 lg:col-span-1">
            <span className="font-mono text-[0.65rem] uppercase tracking-widest text-subtle">Format</span>
            <p className="font-display text-4xl font-bold text-ink">{AMC_EVENT.raceLength}</p>
            <p className="text-sm text-muted">
              {AMC_EVENT.sessionFormat}, then {AMC_EVENT.raceLength.toLowerCase()} of racing.{" "}
              {event.teamsEnabled ? "Team entries." : "Solo entries — one driver per car."}
            </p>
          </Card>
        </div>
      </section>

      {/* Event details */}
      <section aria-labelledby="details-heading" className="container-rail pb-16">
        <div className="mb-6 flex items-center gap-3">
          <Flag size={20} className="text-accent" />
          <h2 id="details-heading" className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
            Race Details
          </h2>
          <span className="h-px flex-1 bg-line" />
        </div>
        <dl className="grid gap-px overflow-hidden rounded-card border border-line bg-line/60 sm:grid-cols-2">
          {details.map((d) => (
            <div key={d.label} className="min-w-0 bg-base/70 px-5 py-5">
              <dt className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
                <d.icon size={16} className="shrink-0 text-pink" aria-hidden />
                {d.label}
              </dt>
              <dd className="mt-2 font-display text-lg font-semibold uppercase text-ink">
                <EventDetailText detail={d.value} />
              </dd>
            </div>
          ))}
        </dl>
        {event.races.length > 1 && (
          <ol className="mt-6 grid gap-3 md:grid-cols-2">
            {event.races.map((r) => {
              const when = ukDateTime(r.startsAt);
              return (
                <li key={`${r.name}-${r.startsAt}`}>
                  <Card className="p-5">
                    <p className="font-display text-lg font-semibold uppercase text-ink">{r.track}</p>
                    <p className="mt-1 text-sm text-muted">
                      <EventDetailText detail={when.date} /> · <EventDetailText detail={when.time} />
                    </p>
                  </Card>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Fundraising */}
      <section aria-labelledby="fundraising-heading" className="container-rail pb-16">
        <div className="relative overflow-hidden rounded-card border border-pink/40 shadow-glow-soft">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pink/10 via-base to-accent/10"
          />
          <div className="relative grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <span className="kicker mb-3">Fundraising</span>
              <h2 id="fundraising-heading" className="text-4xl font-bold text-ink sm:text-5xl">
                Every Lap <span className="text-gradient">Keeps Someone Talking</span>
              </h2>
              <p className="mt-5 max-w-xl text-muted">
                Andy&apos;s Man Club runs free, peer-to-peer talking groups for men across the UK.
                Can&apos;t make the race? You can still back the drivers who are — every donation
                goes straight to our Andy&apos;s Man Club fundraising page.
              </p>
              <div className="mt-8">
                <Button href={AMC_DONATE_URL} target="_blank" rel="noopener noreferrer" size="lg">
                  Donate on JustGiving
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
            <dl className="grid gap-4 rounded-card border border-line bg-base/50 p-6">
              <div>
                <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-subtle">Target</dt>
                <dd className="mt-1 font-display text-4xl font-bold text-ink">
                  {AMC_EVENT.fundraisingTarget}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-subtle">Where it goes</dt>
                <dd className="mt-2 text-ink">{AMC_EVENT.feeDestination}.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Andy's Man Club in their own words */}
      <section aria-labelledby="videos-heading" className="container-rail pb-16">
        <header className="mb-8 max-w-2xl">
          <span className="kicker mb-3">Why We Race</span>
          <h2 id="videos-heading" className="text-4xl font-bold text-ink sm:text-5xl">
            Hear It From <span className="text-gradient">The Club</span>
          </h2>
          <p className="mt-4 text-muted">
            What Andy&apos;s Man Club does, in its own words — from the official #ANDYSMANCLUB
            channel.
          </p>
        </header>
        <ul className="grid gap-8 md:grid-cols-2">
          {AMC_VIDEOS.map((video) => (
            <li key={video.id}>
              <VideoEmbed videoId={video.id} title={video.title} />
              <h3 className="mt-4 font-display text-lg font-semibold uppercase text-ink">{video.title}</h3>
            </li>
          ))}
        </ul>
      </section>

      {/* How to enter */}
      <section aria-labelledby="enter-heading" className="container-rail pb-16">
        <header className="mb-8 max-w-2xl">
          <span className="kicker mb-3">How To Enter</span>
          <h2 id="enter-heading" className="text-4xl font-bold text-ink sm:text-5xl">
            Four Steps To The Grid
          </h2>
        </header>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Register on SimGrid",
              body: "Sign in to SimGrid and sign up to the fundraiser championship.",
            },
            {
              title: `Pay your ${AMC_EVENT.entryFee} entry`,
              body: `${AMC_EVENT.feeDestination}.`,
            },
            {
              title: "Join the Discord",
              body: "Chat with the rest of the grid and catch event updates in the Apex & Chill Discord.",
            },
            {
              title: "Race for a reason",
              body: "Be in the lobby early on race night and bring it home clean.",
            },
          ].map((step, i) => (
            <li key={step.title}>
              <Card className="flex h-full flex-col gap-3 p-6">
                <span className="font-display text-4xl font-bold text-accent">0{i + 1}</span>
                <h3 className="font-display text-lg font-semibold uppercase text-ink">{step.title}</h3>
                <p className="text-sm text-muted">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Watch */}
      <section aria-labelledby="watch-heading" className="container-rail pb-16">
        <Card className="flex flex-col gap-5 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Radio size={24} className="mt-1 shrink-0 text-cyan" aria-hidden />
            <div>
              <h2 id="watch-heading" className="font-display text-2xl font-bold uppercase text-ink">
                Watch It Live
              </h2>
              <p className="mt-2 max-w-xl text-muted">
                Not racing? {AMC_EVENT.broadcast}.
              </p>
            </div>
          </div>
          <Button href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" variant="outline" size="md">
            Watch on YouTube
          </Button>
        </Card>
      </section>

      {/* Why Andy's Man Club — the feature is its own labelled section */}
      <div className="container-rail pb-16">
        <AndysManClubFeature compact />
      </div>

      {/* CTA */}
      <section className="container-rail py-8">
        <div className="flex flex-col items-center gap-5 rounded-card border border-accent/40 bg-surface/50 p-10 text-center shadow-glow-soft">
          <h2 className="text-4xl font-bold text-ink">Race For A Reason</h2>
          <p className="max-w-xl text-muted">
            Three hours at Daytona, one grid, one cause. Enter on SimGrid, back the drivers on
            JustGiving, and jump into the Discord for event updates.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href={primaryCta.href} target="_blank" rel="noopener noreferrer" size="lg">
              {primaryCta.label}
            </Button>
            <Button href={AMC_DONATE_URL} target="_blank" rel="noopener noreferrer" variant="outline" size="lg">
              Donate on JustGiving
            </Button>
            <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" variant="discord" size="lg">
              Join the Discord
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
