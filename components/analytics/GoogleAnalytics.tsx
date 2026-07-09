import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js).
 *
 * Renders nothing unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set, so local dev and
 * un-configured deploys stay analytics-free. Set the env var to your GA4
 * **Measurement ID** — the `G-XXXXXXXXXX` value from GA4 Admin ▸ Data Streams ▸
 * your web stream (NOT the numeric property/stream id).
 *
 * Loaded with `afterInteractive` so it never blocks first paint.
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
