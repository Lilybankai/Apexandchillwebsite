import { Plus } from "lucide-react";
import { JsonLd } from "@/components/aio/JsonLd";
import { SectionHeading } from "@/components/aio/SectionHeading";
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
  index,
}: {
  items: readonly AioFaqItem[];
  heading?: string;
  className?: string;
  /** Two-digit section number for the heading rule, when the page numbers its sections. */
  index?: string;
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
      <SectionHeading index={index} label="FAQ" title={heading} />
      <div className="grid items-start gap-x-10 md:grid-cols-2">
        {columns.map((column, c) => (
          <div key={c} className={cn("border-t border-line", c === 1 && "max-md:border-t-0")}>
            {column.map((item) => (
              <details key={item.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 text-base font-semibold text-ink transition-colors hover:text-cyan [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus
                    size={16}
                    className="mt-1 shrink-0 text-subtle transition-transform group-open:rotate-45 group-open:text-cyan"
                    aria-hidden
                  />
                </summary>
                <p className="pb-5 pr-8 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
