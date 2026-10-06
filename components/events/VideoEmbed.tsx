"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

/**
 * Click-to-play YouTube video. Shows the thumbnail until activated, then swaps
 * in the privacy-enhanced `youtube-nocookie` player — so nothing from YouTube
 * loads until someone presses play. Mirrors the replays player.
 */
export function VideoEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-card border border-line shadow-glow-soft">
      {playing ? (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`Play ${title}`}
        >
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-base/85 via-base/20 to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-neon-primary text-white shadow-glow transition-transform duration-200 group-hover:scale-110">
              <Play className="h-7 w-7 translate-x-0.5 fill-current" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
