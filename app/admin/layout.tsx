import type { Metadata } from "next";

/**
 * Keep the admin dashboard out of search indexes. robots.ts already disallows
 * crawling /admin; this adds a noindex directive to the pages themselves so they
 * can't be indexed even if a URL leaks or is linked.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
