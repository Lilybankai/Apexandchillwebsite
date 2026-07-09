import type { MetadataRoute } from "next";

/**
 * Web app manifest — enables install-to-home-screen and gives search engines
 * richer app metadata. Icon is served from app/icon.png via file convention.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Apex & Chill Racing",
    short_name: "Apex & Chill",
    description:
      "Multi-platform GT7 & Le Mans Ultimate sim racing league — live standings, weekly replays, schedule and merch.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a12",
    theme_color: "#0a0a12",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png", purpose: "any" },
    ],
  };
}
