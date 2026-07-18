"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Radio, Users, CalendarClock, Youtube, Bell } from "lucide-react";
import type { ApiResult, LiveStream, LiveStreams } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn, compactNumber, formatRaceDate } from "@/lib/utils";

/** How often to re-poll `/api/live` for a change in broadcast state (ms). */
const POLL_INTERVAL_MS = 60_000;

/** How often to re-tick the countdown clock for upcoming streams (ms). */
const CLOCK_INTERVAL_MS = 30_000;

const FALLBACK_THUMB = "/brand/replays.png";

type Variant = "home" | "page";

/**
 * The "Live Now / Upcoming Streams" section.
 *
 * Server-rendered from an initial {@link ApiResult}, then polls `GET /api/live`
 * so a broadcast going live (or ending) is reflected within about a minute
 * without a page reload. When live, it embeds the stream inline with a pulsing
 * LIVE badge and viewer count; otherwise it counts down to the next scheduled
 * stream. On the homepage (`variant="home"`) it renders nothing when there's
 * neither a live nor an upcoming stream, so it only appears when there's
 * something to watch; the dedicated `/live` page shows a friendly empty state.
 */
export function LiveStreamSection({
  initial,
  variant = "page",
  subscribeUrl = DEFAULT_SUBSCRIBE_URL,
}: {
  initial: ApiResult<LiveStreams>;
  variant?: Variant;
  /** Channel subscribe link; defaults to the Apex & Chill channel. */
  subscribeUrl?: string;
}) {
  const [data, setData] = useState<LiveStreams>(initial.data);
  // `now` is only set after mount so the countdown never causes a hydration
  // mismatch between server and client render.
  const [now, setNow] = useState<number | null>(null);

  // Poll the live endpoint. Runs immediately so a stale SSR payload (the
  // homepage caches for 5 minutes) is corrected soon after mount.
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as ApiResult<LiveStreams>;
        if (active && json?.data) setData(json.data);
      } catch {
        // Best-effort — keep the last known state on a transient failure.
      }
    };
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  // Tick a clock for the upcoming-stream countdowns.
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), CLOCK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const { live, upcoming } = data;
  const hasContent = live.length > 0 || upcoming.length > 0;

  // On the homepage, stay invisible until there's something worth showing.
  if (variant === "home" && !hasContent) return null;

  return (
    <section className="container-rail py-16 sm:py-20">
      <header className="mb-8 max-w-2xl">
        <span className="kicker mb-3">{live.length > 0 ? "On Air" : "Broadcasts"}</span>
        <h2 className="flex flex-wrap items-center gap-3 text-4xl font-bold text-ink sm:text-5xl">
          {live.length > 0 ? (
            <>
              Live <span className="text-gradient">Now</span>
              <LiveBadge />
            </>
          ) : (
            <>
              Upcoming <span className="text-gradient">Streams</span>
            </>
          )}
        </h2>
        <p className="mt-4 text-muted">
          {live.length > 0
            ? "We're broadcasting right now — watch the action live below."
            : upcoming.length > 0
              ? "Set a reminder and join us on YouTube when we go live."
              : "No stream is live right now. Subscribe on YouTube so you never miss lights out."}
        </p>
      </header>

      {/* Live players */}
      {live.length > 0 && (
        <div className="space-y-6">
          <LivePlayer stream={live[0]} autoPlay />
          {live.length > 1 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {live.slice(1).map((stream) => (
                <LivePlayer key={stream.videoId} stream={stream} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming schedule */}
      {upcoming.length > 0 && (
        <div className={cn(live.length > 0 && "mt-14")}>
          {live.length > 0 && (
            <h3 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold uppercase text-ink">
              <CalendarClock className="h-5 w-5 text-cyan" /> Coming Up
            </h3>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((stream) => (
              <UpcomingCard key={stream.videoId} stream={stream} now={now} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state (dedicated page only) */}
      {!hasContent && (
        <Card className="flex flex-col items-center gap-5 p-10 text-center sm:p-14">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-elevated text-subtle">
            <Radio className="h-7 w-7" />
          </span>
          <div>
            <h3 className="text-xl font-bold text-ink">Nothing live at the moment</h3>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Our race broadcasts appear here automatically the second we go live.
              Subscribe and hit the bell to get notified.
            </p>
          </div>
          <Button href={subscribeUrl} target="_blank" rel="noopener noreferrer" clip>
            <Youtube className="h-5 w-5" />
            Subscribe on YouTube
          </Button>
        </Card>
      )}
    </section>
  );
}

/** Default channel subscribe link (opens YouTube's confirm-subscription dialog). */
const DEFAULT_SUBSCRIBE_URL =
  "https://www.youtube.com/channel/UCu7lyaGuo3sY2wWZo42-LVw?sub_confirmation=1";

/** Pulsing red "LIVE" badge. */
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-flag-red/50 bg-flag-red/15 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-flag-red">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flag-red opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-flag-red" />
      </span>
      Live
    </span>
  );
}

/** An embedded live player. The first/featured stream autoplays (muted). */
function LivePlayer({ stream, autoPlay = false }: { stream: LiveStream; autoPlay?: boolean }) {
  const src = `${stream.embedUrl}?rel=0&modestbranding=1${autoPlay ? "&autoplay=1&mute=1" : ""}`;
  return (
    <Card variant="glow" className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        <iframe
          src={src}
          title={stream.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <LiveBadge />
            {stream.league && <span className="chip text-cyan">{stream.league}</span>}
          </div>
          <h3 className="line-clamp-2 font-display text-lg font-semibold uppercase leading-tight text-ink">
            {stream.title}
          </h3>
        </div>
        {typeof stream.concurrentViewers === "number" && (
          <span className="flex shrink-0 items-center gap-1.5 font-mono text-sm text-muted">
            <Users size={14} className="text-flag-red" />
            {compactNumber(stream.concurrentViewers)}
          </span>
        )}
      </div>
    </Card>
  );
}

/** A scheduled upcoming stream, with a live countdown. */
function UpcomingCard({ stream, now }: { stream: LiveStream; now: number | null }) {
  const countdown = now != null ? formatCountdown(stream.scheduledStartTime, now) : null;
  return (
    <a href={stream.url} target="_blank" rel="noopener noreferrer" className="group">
      <Card variant="default" interactive className="flex h-full flex-col overflow-hidden">
        <div className="relative aspect-video overflow-hidden bg-elevated">
          <Image
            src={stream.thumbnail || FALLBACK_THUMB}
            alt={stream.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base/80 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-cyan/50 bg-base/70 px-2.5 py-1 font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-cyan backdrop-blur">
            <CalendarClock size={12} /> Upcoming
          </span>
          {countdown && (
            <span className="absolute bottom-3 right-3 rounded-full bg-base/80 px-2.5 py-1 font-mono text-xs font-semibold text-ink backdrop-blur">
              {countdown}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          {stream.league && <span className="chip mb-2 self-start text-cyan">{stream.league}</span>}
          <h3 className="line-clamp-2 font-display text-base font-semibold uppercase leading-tight text-ink transition-colors group-hover:text-accent">
            {stream.title}
          </h3>
          <div className="mt-auto pt-3 font-mono text-xs text-subtle">
            {stream.scheduledStartTime && (
              <span className="flex items-center gap-1.5">
                <Bell size={12} /> {formatScheduled(stream.scheduledStartTime)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </a>
  );
}

/** Format a scheduled start as e.g. "Sat 25 Jul 2026, 19:00". Empty if invalid. */
function formatScheduled(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${formatRaceDate(date)}, ${time}`;
}

/**
 * Format the time until `iso` relative to `now` (ms), e.g. "in 2h 15m",
 * "in 3d", "Starting soon", or "Live soon" once the scheduled time has passed.
 * Returns `null` for a missing/invalid time.
 */
function formatCountdown(iso: string | undefined, now: number): string | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - now;
  if (diff <= 0) return "Live soon";
  const mins = Math.floor(diff / 60_000);
  const days = Math.floor(mins / (60 * 24));
  const hours = Math.floor((mins % (60 * 24)) / 60);
  const rem = mins % 60;
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${rem}m`;
  if (rem > 0) return `in ${rem}m`;
  return "Starting soon";
}
