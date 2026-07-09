import type { Metadata, Viewport } from "next";
import { Oswald, Barlow, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/analytics/Analytics";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/** Condensed, mechanical display face for headings and CTAs. */
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

/** Slightly technical grotesque for body copy. */
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

/** Mono reserved for numeric "timing-board" data (points, positions, laps). */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

/** Site-wide social share image (1200×630 recommended); lives in /public/brand. */
const OG_IMAGE = {
  url: "/brand/banner.png",
  width: 1200,
  height: 630,
  alt: "Apex & Chill Racing — multi-platform GT7 & Le Mans Ultimate sim racing league",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Apex & Chill Racing — Multi-Platform Sim Racing League",
    template: "%s · Apex & Chill Racing",
  },
  description:
    "The home of Apex & Chill Racing — a multi-platform sim racing community running competitive GT7 and Le Mans Ultimate leagues. Clean racing, live standings, weekly replays and a thriving Discord.",
  // NOTE: canonical is intentionally set PER PAGE (not here) — a root-layout
  // canonical is inherited by every child route, which would wrongly point them
  // all at "/". Each page declares its own `alternates.canonical`.
  // Favicon/app icon is served from app/icon.png (a crisp square PNG generated
  // from the operator logo) via Next's file-convention — no explicit link needed.
  keywords: [
    "sim racing",
    "GT7 league",
    "Le Mans Ultimate",
    "Gran Turismo 7",
    "racing community",
    "Apex and Chill",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Apex & Chill Racing — Multi-Platform Sim Racing League",
    description:
      "Competitive GT7 & Le Mans Ultimate leagues. Clean racing, live standings, weekly replays and a thriving Discord community.",
    siteName: "Apex & Chill Racing",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex & Chill Racing",
    description:
      "Competitive GT7 & Le Mans Ultimate sim racing leagues. Clean racing, real community.",
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#08090d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${barlow.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-base font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
