import Image from "next/image";
import Link from "next/link";
import { Play, Eye } from "lucide-react";
import type { ApiResult, Replay } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatRaceDate, compactNumber } from "@/lib/utils";

const FALLBACK_THUMB = "/brand/replays.png";

/** Latest three YouTube replays, presented as rich cards. */
export function LatestReplays({ result }: { result: ApiResult<Replay[]> }) {
  const replays = result.data.slice(0, 3);

  return (
    <section className="container-rail py-20">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className="kicker mb-3">From The Channel</span>
          <h2 className="text-4xl font-bold text-ink sm:text-5xl">Latest Replays</h2>
          <p className="mt-4 text-muted">Catch up on the most recent racing action.</p>
        </div>
        <Button href="/replays" variant="outline" size="md">
          View All Replays
        </Button>
      </header>

      {replays.length === 0 ? (
        <Card className="p-10 text-center text-sm text-subtle">
          New replays are on the way — check back after the next race.
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {replays.map((replay) => (
            <a
              key={replay.videoId}
              href={replay.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card variant="default" interactive className="h-full overflow-hidden">
                <div className="relative aspect-video overflow-hidden bg-elevated">
                  <Image
                    src={replay.thumbnail || FALLBACK_THUMB}
                    alt={replay.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-base/80 via-transparent to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neon-primary opacity-0 shadow-glow transition-opacity duration-300 group-hover:opacity-100">
                      <Play size={22} className="ml-0.5 fill-white text-white" />
                    </span>
                  </span>
                  {replay.league && (
                    <span className="absolute left-3 top-3 chip text-cyan">{replay.league}</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="line-clamp-2 font-display text-lg font-semibold uppercase leading-tight text-ink transition-colors group-hover:text-accent">
                    {replay.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-3 font-mono text-xs text-subtle">
                    <span>{formatRaceDate(replay.publishedAt)}</span>
                    {typeof replay.viewCount === "number" && (
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {compactNumber(replay.viewCount)}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
