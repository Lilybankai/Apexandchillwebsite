import type { Metadata } from "next";
import { Radio, Youtube } from "lucide-react";
import { fetchLiveStreams } from "@/lib/api/youtube";
import { youtube } from "@/lib/env";
import { Button } from "@/components/ui/Button";
import { LiveStreamSection } from "@/components/live/LiveStreamSection";

export const metadata: Metadata = {
  title: "Live",
  alternates: { canonical: "/live" },
  description:
    "Watch Apex & Chill GT7 and Le Mans Ultimate races live. Our broadcasts stream here the moment we go on air, with a countdown to the next scheduled stream.",
};

/** Refresh the initial broadcast state every minute (the client keeps polling). */
export const revalidate = 60;

/** Channel subscribe link (opens the confirm-subscription dialog). */
const SUBSCRIBE_URL = `https://www.youtube.com/channel/${youtube.channelId}?sub_confirmation=1`;

/**
 * Dedicated live-stream page. Renders the current broadcast state on the server,
 * then hands off to the client {@link LiveStreamSection}, which polls `/api/live`
 * so the page flips to "Live Now" (with an inline player) the moment we go on
 * air, and counts down to the next scheduled stream otherwise.
 */
export default async function LivePage() {
  const initial = await fetchLiveStreams();

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div className="container-rail relative flex flex-col gap-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <span className="kicker mb-4">
              <Radio className="h-3.5 w-3.5" /> Live Broadcasts
            </span>
            <h1 className="text-4xl font-bold text-ink sm:text-6xl">
              Watch <span className="text-gradient">Live</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Every GT7 and Le Mans Ultimate race, streamed straight to the site.
              The player below goes live automatically the second we're on air —
              no refresh needed.
            </p>
            <div className="mt-8">
              <Button href={SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer" clip>
                <Youtube className="h-5 w-5" />
                Subscribe on YouTube
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LiveStreamSection initial={initial} variant="page" subscribeUrl={SUBSCRIBE_URL} />
    </>
  );
}
