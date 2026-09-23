import { AioProductBar } from "@/components/aio/AioProductBar";

/**
 * Every Apex AIO page — the hub at /apex-overlay-system and the topic pages
 * beside it. The route group adds nothing to the URLs; it only gives these
 * pages the product bar without touching the rest of the site.
 */
export default function AioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AioProductBar />
      {children}
    </>
  );
}
