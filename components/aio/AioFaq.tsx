import { ChevronDown, Zap } from "lucide-react";
import { JsonLd } from "@/components/aio/JsonLd";
import type { AioFaqItem } from "@/lib/aio-faq";
import { cn } from "@/lib/utils";

/**
 * A page's FAQ, and the FAQPage markup for exactly the questions shown. Pass
 * the page's own questions from `getAioFaq()` so each answer is marked up on
 * one URL only.
 */
export function AioFaq({
  items,
  heading = "Frequently asked",
  className,
}: {
  items: readonly AioFaqItem[];
  heading?: string;
  className?: string;
}) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const columns = [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)];

  return (
    <section id="faq" className={cn("container-rail scroll-mt-36 py-16", className)}>
      <JsonLd data={jsonLd} />
      <div className="mb-8 flex items-center gap-3">
        <Zap size={20} className="text-accent" />
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide text-ink">{heading}</h2>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2">
        {columns.map((column, c) => (
          <div key={c} className="grid gap-4">
            {column.map((item) => (
              <details
                key={item.q}
                className="group rounded-card border border-line bg-surface/50 open:border-accent/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-subtle transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="px-5 pb-5 text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
