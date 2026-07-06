import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ScheduleList } from "@/components/schedule/ScheduleList";

export const metadata: Metadata = {
  title: "Schedule",
  description:
    "The full race calendars for the Apex & Chill Racing GT7 and Le Mans Ultimate leagues — rounds, tracks, classes, dates and add-to-calendar links.",
};

export default function SchedulePage() {
  return (
    <div className="pb-16">
      {/* Header with brand accent */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div className="container-rail relative grid gap-8 py-16 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <span className="kicker mb-4">Race Calendar</span>
            <h1 className="text-5xl font-bold text-ink sm:text-6xl">
              The <span className="text-gradient">Schedule</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Every round across both leagues — tracks, classes and start times. Add rounds straight
              to your calendar so you never miss a lights-out.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/join" size="md" clip>
                Join the League
              </Button>
              <Button href="/standings" variant="outline" size="md">
                View Standings
              </Button>
            </div>
          </div>

          <div className="relative hidden aspect-[300/147] overflow-hidden rounded-card border border-line bg-elevated lg:block">
            <Image
              src="/brand/schedule.png"
              alt="Apex & Chill Racing neon car render"
              fill
              sizes="40vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Calendars */}
      <section className="container-rail py-14">
        <ScheduleList />
      </section>
    </div>
  );
}
