import type { Metadata } from "next";
import { AIO_PRODUCT } from "@/lib/aio";
import { AIO_SOFTWARE_ID } from "@/lib/aio-seo";
import { getAioPage } from "@/lib/aio-pages";
import { ORGANIZATION_ID, WEBSITE_ID } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

/** The fields of a comparison page (or the index) that its metadata needs. */
type PageLike = {
  key: string;
  path: string;
  title: string;
  description: string;
  breadcrumb: string;
  checked: string;
};

const HUB = getAioPage("overview");

export function buildCompareMetadata(page: PageLike): Metadata {
  return {
    title: { absolute: page.title },
    description: page.description,
    applicationName: AIO_PRODUCT.name,
    category: "Sim racing software",
    creator: "Apex & Chill Racing",
    publisher: "Apex & Chill Racing",
    alternates: { canonical: page.path },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      locale: "en_GB",
      type: "article",
      url: page.path,
      siteName: "Apex & Chill Racing",
      title: page.title,
      description: page.description,
      modifiedTime: page.checked,
    },
    twitter: { card: "summary_large_image", title: page.title, description: page.description },
  };
}

/** Home → Apex AIO → Compare → this page (or Home → Apex AIO → Compare). */
export function buildCompareBreadcrumbJsonLd(page: PageLike, index?: PageLike) {
  const items = [
    { name: "Home", item: SITE_URL },
    { name: HUB.breadcrumb, item: `${SITE_URL}${HUB.path}` },
  ];
  if (index && index.key !== page.key) items.push({ name: index.breadcrumb, item: `${SITE_URL}${index.path}` });
  items.push({ name: page.breadcrumb, item: `${SITE_URL}${page.path}` });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, i) => ({ "@type": "ListItem", position: i + 1, ...entry })),
  };
}

export function buildCompareWebPageJsonLd(page: PageLike) {
  const url = `${SITE_URL}${page.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: "en-GB",
    dateModified: page.checked,
    isPartOf: { "@type": "WebSite", "@id": WEBSITE_ID, name: "Apex & Chill Racing", url: SITE_URL },
    publisher: { "@id": ORGANIZATION_ID, name: "Apex & Chill Racing", url: SITE_URL },
    about: { "@id": AIO_SOFTWARE_ID, name: AIO_PRODUCT.name },
  };
}
