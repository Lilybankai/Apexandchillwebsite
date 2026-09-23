import type { Metadata } from "next";
import { AIO_PRODUCT, AIO_REVIEWS } from "@/lib/aio";
import { AIO_FALLBACK_RELEASE, type AioRelease } from "@/lib/aio-release";
import { getAioPage, type AioPageKey } from "@/lib/aio-pages";
import { SITE_URL } from "@/lib/site";

const HUB = getAioPage("overview");
const PAGE_PATH = HUB.path;
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const TITLE = HUB.title;
const DESCRIPTION = HUB.description;

/**
 * The topic pages share the hub's social card: it is generated from the hub
 * route by `opengraph-image.tsx`, so every page in the section links to it.
 */
const SHARED_SOCIAL_IMAGE = `${PAGE_PATH}/opengraph-image`;

const ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

/**
 * Metadata for one of the topic pages in `lib/aio-pages.ts`. Title and
 * description come from the registry so the product bar, sitemap and search
 * result always describe the page the same way.
 */
export function buildAioPageMetadata(key: Exclude<AioPageKey, "overview">): Metadata {
  const page = getAioPage(key);
  return {
    title: { absolute: page.title },
    description: page.description,
    applicationName: AIO_PRODUCT.name,
    category: "Sim racing software",
    creator: "Apex & Chill Racing",
    publisher: "Apex & Chill Racing",
    alternates: { canonical: page.path },
    robots: ROBOTS,
    openGraph: {
      type: "website",
      url: page.path,
      siteName: "Apex & Chill Racing",
      title: page.title,
      description: page.description,
      images: [SHARED_SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [SHARED_SOCIAL_IMAGE],
    },
  };
}

/** Home → Apex AIO → this page, or Home → Apex AIO for the hub itself. */
export function buildAioBreadcrumbJsonLd(key: AioPageKey) {
  const items = [
    { name: "Home", item: SITE_URL },
    { name: HUB.breadcrumb, item: PAGE_URL },
  ];
  if (key !== "overview") {
    const page = getAioPage(key);
    items.push({ name: page.breadcrumb, item: `${SITE_URL}${page.path}` });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      ...entry,
    })),
  };
}

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
  robots: ROBOTS,
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

/**
 * Build the SoftwareApplication structured data.
 *
 * @param release - The installer currently being offered, from
 *   `getLatestAioRelease()`. Defaults to the pinned fallback so callers that
 *   have no live lookup (or run at build time) still emit valid markup.
 */
export function buildAioSoftwareJsonLd(release: AioRelease = AIO_FALLBACK_RELEASE) {
  const ratingCount = AIO_REVIEWS.length;
  const ratingValue =
    AIO_REVIEWS.reduce((total, review) => total + review.rating, 0) / ratingCount;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: AIO_PRODUCT.name,
    url: PAGE_URL,
    downloadUrl: release.installerUrl,
    applicationCategory: "GameApplication",
    applicationSubCategory: "Sim racing telemetry and race engineer software",
    operatingSystem: "Windows",
    softwareVersion: release.version,
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

export const AIO_BREADCRUMB_JSON_LD = buildAioBreadcrumbJsonLd("overview");
