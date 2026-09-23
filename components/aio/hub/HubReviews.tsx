import { SectionHeading } from "@/components/aio/SectionHeading";
import { AIO_REVIEWS } from "@/lib/aio";

/**
 * The test team's words: the featured review as one large pull quote, the
 * rest as a short column beside it. Quotes are printed exactly as written.
 */
export function HubReviews({ index }: { index?: string }) {
  const featured = AIO_REVIEWS.find((r) => r.featured) ?? AIO_REVIEWS[0];
  const rest = AIO_REVIEWS.filter((r) => r !== featured);
  const average = AIO_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / AIO_REVIEWS.length;

  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="border-y border-line bg-surface/30 py-20">
      <div className="container-rail">
        <SectionHeading
          index={index}
          id="reviews-heading"
          label="Test team"
          title="From the drivers who tested it"
          lead={
            <>
              LMU drivers from the Apex &amp; Chill community, posted in our Discord.{" "}
              <span className="font-mono text-sm tabular-nums text-ink">
                {average.toFixed(1)}/5
              </span>{" "}
              <span className="font-mono text-sm text-subtle">from {AIO_REVIEWS.length} reviews.</span>
            </>
          }
        />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <figure>
            <blockquote className="font-display text-3xl font-medium leading-[1.2] text-ink sm:text-4xl">
              <span aria-hidden className="text-cyan">&ldquo;</span>
              {featured.body}
              <span aria-hidden className="text-cyan">&rdquo;</span>
            </blockquote>
            <figcaption className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-subtle">
              <span className="text-ink">{featured.author}</span> · {featured.context}
            </figcaption>
          </figure>

          <ul className="border-t border-line">
            {rest.map((review, i) => (
              <li key={`${review.author}-${i}`} className="border-b border-line py-5">
                <figure>
                  <blockquote className="text-muted">&ldquo;{review.body}&rdquo;</blockquote>
                  <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-subtle">
                    <span className="text-ink">{review.author}</span> · {review.context}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
