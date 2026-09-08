import type { Metadata } from "next";
import { AIO_PRODUCT, AIO_REVIEWS } from "@/lib/aio";
import { SITE_URL } from "@/lib/site";

const PAGE_PATH = "/apex-overlay-system";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const TITLE = "Apex AIO System | LMU Overlays & Voice Race Engineer";
const DESCRIPTION =
  "Download Apex AIO for 20 lightweight LMU and rFactor 2 overlays, a voice race engineer, setup optimiser, live team pit wall and Review — every lap you have driven, compared lap against lap. Try it free for 7 days.";

export const AIO_METADATA: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  applicationName: AIO_PRODUCT.name,
  category: "Sim racing software",
  creator: "Apex & Chill Racing",
  publisher: "Apex & Chill Racing",
  keywords: [
    "LMU overlay",
    "Le Mans Ultimate overlay",
    "LMU race engineer",
    "voice race engineer sim racing",
    "LMU telemetry overlay",
    "LMU OBS overlay",
    "Le Mans Ultimate HUD",
    "LMU MFD overlay",
    "LMU reference lap times",
    "LMU setup editor",
    "LMU setup optimiser",
    "LMU setups",
    "LMU community setups",
    "free LMU setups",
    "LMU setups with lap times",
    "LMU team engineering pit wall",
    "LMU telemetry analysis",
    "LMU lap comparison",
    "LMU stint review",
    "Le Mans Ultimate driving coach",
    "Le Mans Ultimate endurance race strategy",
    "LMU track map overlay",
    "LMU track limits overlay",
    "sim racing overlays",
    "rFactor 2 overlay",
    "LMU streaming overlay",
    "LMU pit stop timer",
    "best LMU overlays",
    "Apex AIO",
  ],
  alternates: { canonical: PAGE_PATH },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: PAGE_PATH,
    siteName: "Apex & Chill Racing",
    title: TITLE,
    description:
      "Twenty overlays, a voice race engineer, setup optimiser and live team pit wall for LMU and rFactor 2 in one Windows app.",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "20 lightweight overlays, a voice race engineer, setup optimiser and live team pit wall. Try Apex AIO free for 7 days.",
  },
};

export function buildAioSoftwareJsonLd() {
  const ratingCount = AIO_REVIEWS.length;
  const ratingValue =
    AIO_REVIEWS.reduce((total, review) => total + review.rating, 0) / ratingCount;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: AIO_PRODUCT.name,
    url: PAGE_URL,
    downloadUrl: AIO_PRODUCT.installerUrl,
    applicationCategory: "GameApplication",
    applicationSubCategory: "Sim racing telemetry and race engineer software",
    operatingSystem: "Windows",
    softwareVersion: AIO_PRODUCT.version,
    description: DESCRIPTION,
    featureList: [
      "20 telemetry overlays for OBS and in-game use",
      "Push-to-talk voice race engineer",
      "Live LMU setup editor with intent-based race engineer optimisation",
      "Team engineering pit wall with live strategy and telemetry relay",
      "Team and Solo engineer boards viewable in any browser, on any device",
      "Review: local session and lap telemetry analysis with lap-vs-lap comparison",
      "Per-session report with optimal lap, untapped time, consistency and clean-lap breakdown",
      "Lap traces against distance with a plan-view circuit map and micro-sector deltas",
      "Community setup sharing with verified pace",
      "Publish and download community setups without per-setup fees",
      "LMU MFD controls",
      "3D track maps",
      "Track limits and pit-stop tools",
      "Twitch and YouTube StreamBot",
    ],
    publisher: {
      "@type": "Organization",
      name: "Apex & Chill Racing",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      url: PAGE_URL,
      price: AIO_PRODUCT.price.toFixed(2),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      description: `${AIO_PRODUCT.trialDays}-day free trial, then ${AIO_PRODUCT.priceDisplay} per month`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: AIO_PRODUCT.price.toFixed(2),
        priceCurrency: "GBP",
        billingDuration: "P1M",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(ratingValue.toFixed(1)),
      ratingCount,
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: AIO_REVIEWS.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewBody: review.body,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })),
  };
}

export const AIO_BREADCRUMB_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: AIO_PRODUCT.name,
      item: PAGE_URL,
    },
  ],
};
