/**
 * Baseline security headers for every response. Deliberately conservative so
 * nothing on the site breaks:
 * - HSTS without `includeSubDomains`/`preload` — subdomains (mail etc.) aren't
 *   ours to promise HTTPS for.
 * - Framing limited to our own origin (clickjacking), not denied outright —
 *   except the stream overlay (`/r/<code>/overlay`), which streamers may load
 *   into third-party widget tools that iframe it.
 * - Permissions-Policy only switches off device APIs the site never uses; the
 *   YouTube embeds still get autoplay/fullscreen/picture-in-picture.
 * A full Content-Security-Policy needs per-source allow-lists (GA, Stripe,
 * YouTube, Supabase, POD image hosts) and is left for its own change.
 */
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), usb=(), serial=(), hid=(), browsing-topics=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Stamped at build so the sitemap can report when deploy-only pages last changed.
  env: {
    BUILD_TIME: new Date().toISOString(),
  },
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        source: "/:path((?!r/[^/]+/overlay$).*)",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      // YouTube thumbnails (replays)
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      // Print-on-demand product imagery
      { protocol: "https", hostname: "**.cdn.tapstitch.com" },
      { protocol: "https", hostname: "files.tapstitch.com" },
      { protocol: "https", hostname: "images.printify.com" },
      { protocol: "https", hostname: "images-api.printify.com" },
      { protocol: "https", hostname: "**.printify.com" },
      // Supabase public storage (partner logos, media)
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  // Foundation ships before the data-layer and feature pages are complete, and this
  // is a multi-author codebase. Keep TypeScript checking ON (catches real errors) but
  // don't let stylistic lint rules fail production builds. See README.md.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
