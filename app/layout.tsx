import type { Metadata, Viewport } from "next";
import { Oswald, Barlow, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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

const siteUrl = "https://apexandchillracing.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Apex & Chill Racing — Multi-Platform Sim Racing League",
    template: "%s · Apex & Chill Racing",
  },
  description:
    "The home of Apex & Chill Racing — a multi-platform sim racing community running competitive GT7 and Le Mans Ultimate leagues. Clean racing, live standings, weekly replays and a thriving Discord.",
  icons: {
    icon: "/brand/apex-chill-logo.jpg",
    apple: "/brand/apex-chill-logo.jpg",
  },
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
    url: siteUrl,
    title: "Apex & Chill Racing — Multi-Platform Sim Racing League",
    description:
      "Competitive GT7 & Le Mans Ultimate leagues. Clean racing, live standings, weekly replays and a thriving Discord community.",
    siteName: "Apex & Chill Racing",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex & Chill Racing",
    description:
      "Competitive GT7 & Le Mans Ultimate sim racing leagues. Clean racing, real community.",
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
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
