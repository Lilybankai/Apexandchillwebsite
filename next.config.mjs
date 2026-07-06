/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // YouTube thumbnails (replays)
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      // Print-on-demand product imagery
      { protocol: "https", hostname: "**.cdn.tapstitch.com" },
      { protocol: "https", hostname: "files.cdn.printful.com" },
      { protocol: "https", hostname: "**.printful.com" },
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
