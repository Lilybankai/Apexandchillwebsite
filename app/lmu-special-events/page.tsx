import type { Metadata } from "next";
import { CalendarDays, Clock, Flag, Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "LMU Special Events Calendar",
  alternates: { canonical: "/lmu-special-events" },
  description:
    "The full Le Mans Ultimate (LMU) Special Events calendar — from the 6 Hours of Le Mans to the 24 Hours of Le Mans, with Hypercar, WEC LMP2, ELMS LMP2, LMP3 and LMGT3 classes. Special events run Friday, Saturday and Sunday.",
  keywords: [
    "LMU special events",
    "Le Mans Ultimate special events",
    "LMU special events calendar",
    "Le Mans Ultimate calendar",
    "24 Hours of Le Mans LMU",
    "Hypercar",
    "LMGT3",
    "WEC LMP2",
    "ELMS",
  ],
};

/** Le Mans Ultimate class entrants that appear across the special events. */
type RaceClass = "Hypercar" | "WEC LMP2" | "ELMS LMP2" | "LMP3" | "LMGT3";

interface SpecialEvent {
  /** Week-commencing marker, exactly as published (e.g. "w/c 23/6"). */
  week: string;
  /** Race duration, e.g. "6 Hours". */
  duration: string;
  /** Circuit / venue. "TBA" where not yet confirmed. */
  circuit: string;
  classes: RaceClass[];
}

interface EventMonth {
  month: string;
  events: SpecialEvent[];
}

/**
 * Q3/Q4 Le Mans Ultimate Special Events calendar, as published by the operator.
 * Events run Friday / Saturday / Sunday — exact time slots are confirmed closer
 * to each event. Circuits marked "TBA" are yet to be announced.
 */
const CALENDAR: EventMonth[] = [
  {
    month: "June",
    events: [
      { week: "w/c 23/6", duration: "6 Hours", circuit: "Le Mans", classes: ["Hypercar", "WEC LMP2", "LMGT3"] },
    ],
  },
  {
    month: "July",
    events: [
      { week: "w/c 7/7", duration: "4 Hours", circuit: "Imola", classes: ["ELMS LMP2", "LMP3", "LMGT3"] },
      { week: "w/c 14/7", duration: "6 Hours", circuit: "Interlagos", classes: ["Hypercar", "LMGT3"] },
      { week: "w/c 28/7", duration: "4 Hours", circuit: "TBA", classes: ["Hypercar", "WEC LMP2", "LMGT3"] },
    ],
  },
  {
    month: "August",
    events: [
      { week: "w/c 11/8", duration: "8 Hours", circuit: "TBA", classes: ["Hypercar", "WEC LMP2", "LMGT3"] },
      { week: "w/c 25/8", duration: "4 Hours", circuit: "Spa", classes: ["ELMS LMP2", "LMP3", "LMGT3"] },
    ],
  },
  {
    month: "September",
    events: [
      { week: "w/c 8/9", duration: "6 Hours", circuit: "COTA", classes: ["Hypercar", "LMGT3"] },
      { week: "w/c 15/9", duration: "4 Hours", circuit: "Silverstone", classes: ["ELMS LMP2", "LMP3", "LMGT3"] },
      { week: "w/c 22/9", duration: "4 Hours", circuit: "TBA", classes: ["Hypercar", "LMGT3"] },
      { week: "w/c 29/9", duration: "6 Hours", circuit: "Fuji", classes: ["Hypercar", "LMGT3"] },
    ],
  },
  {
    month: "October",
    events: [
      { week: "w/c 6/10", duration: "10 Hours", circuit: "TBA", classes: ["Hypercar", "WEC LMP2", "LMGT3"] },
      { week: "w/c 13/10", duration: "4 Hours", circuit: "Portimao", classes: ["ELMS LMP2", "LMP3", "LMGT3"] },
      { week: "w/c 20/10", duration: "24 Hours", circuit: "Le Mans", classes: ["Hypercar", "WEC LMP2", "LMGT3"] },
    ],
  },
  {
    month: "November",
    events: [
      { week: "w/c 10/11", duration: "8 Hours", circuit: "Bahrain", classes: ["Hypercar", "LMGT3"] },
    ],
  },
  {
    month: "December",
    events: [
      { week: "w/c 1/12", duration: "6 Hours", circuit: "Silverstone", classes: ["Hypercar", "LMGT3"] },
      { week: "w/c 15/12", duration: "6 Hours", circuit: "TBA", classes: ["Hypercar", "WEC LMP2", "LMGT3"] },
    ],
  },
];

const DISCORD_URL = "https://discord.gg/MBew2Bb2hj";

export default function LmuSpecialEventsPage() {
  return (
    <div className="pb-8">
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 blur-[120px]"
        />
        <div className="container-rail relative py-20">
          <span className="kicker mb-4">Le Mans Ultimate · Q3 / Q4</span>
          <h1 className="max-w-3xl text-5xl font-bold text-ink sm:text-6xl">
            LMU <span className="text-gradient">Special Events</span> Calendar
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            The full Le Mans Ultimate special events schedule — endurance racing from the 6 Hours of
            Le Mans through to the 24 Hours of Le Mans, across Hypercar, WEC LMP2, ELMS LMP2, LMP3
            and LMGT3.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-card border border-line bg-surface/50 px-4 py-2 text-sm text-muted">
            <Clock size={15} className="text-cyan" />
            Special events run Friday / Saturday / Sunday — refer to the detailed schedule closer to
            the time for exact time slots.
          </p>
        </div>
      </section>

      {/* Calendar */}
      <section className="container-rail py-16">
        <div className="space-y-12">
          {CALENDAR.map((block) => (
            <div key={block.month}>
              <div className="mb-5 flex items-center gap-3">
                <CalendarDays size={20} className="text-accent" />
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-ink">
                  {block.month}
                </h2>
                <span className="h-px flex-1 bg-line" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {block.events.map((event) => (
                  <Card
                    key={`${event.week}-${event.circuit}`}
                    variant="default"
                    className="flex flex-col gap-4 p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-subtle">
                          <CalendarDays size={12} />
                          {event.week}
                        </span>
                        <h3 className="mt-2 flex items-center gap-2 text-2xl font-bold text-ink">
                          <Flag size={18} className="shrink-0 text-cyan" />
                          {event.circuit}
                        </h3>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-card border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-accent">
                        <Timer size={13} />
                        {event.duration}
                      </span>
                    </div>

                    <ul className="flex flex-wrap gap-2">
                      {event.classes.map((c) => (
                        <li
                          key={c}
                          className="rounded-full border border-line bg-elevated px-3 py-1 font-mono text-[0.7rem] uppercase tracking-wide text-muted"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-rail py-8">
        <div className="flex flex-col items-center gap-5 rounded-card border border-accent/40 bg-surface/50 p-10 text-center shadow-glow-soft">
          <h2 className="text-4xl font-bold text-ink">Race The Special Events</h2>
          <p className="max-w-xl text-muted">
            Our Le Mans Ultimate endurance league runs alongside the special events calendar. Jump
            into the Discord for entry details, team-ups and exact time slots as each event
            approaches.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href={DISCORD_URL} target="_blank" rel="noopener noreferrer" variant="discord" size="lg">
              Join the Discord
            </Button>
            <Button href="/schedule" variant="outline" size="lg">
              League Schedule
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
