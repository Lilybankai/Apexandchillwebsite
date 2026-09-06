import { MessageCircle, Quote } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { AIO_REVIEWS, type AioReview } from "@/lib/aio";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ReviewCard({ review }: { review: AioReview }) {
  return (
    <figure
      className={cn(
        "relative flex h-full flex-col rounded-card border bg-base/70 p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60",
        review.featured
          ? "border-accent/50 shadow-glow-soft"
          : "border-line",
      )}
    >
      <Quote
        aria-hidden
        className="absolute right-5 top-5 text-accent/25"
        size={34}
        strokeWidth={1.5}
      />
      <blockquote className="relative flex-1 pr-8 text-lg leading-relaxed text-ink">
        “{review.body}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
        <span
          aria-hidden
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-mono text-xs font-bold text-accent-2"
        >
          {initials(review.author)}
        </span>
        <span>
          <span className="block font-display text-base font-semibold uppercase tracking-wide text-ink">
            {review.author}
          </span>
          <span className="block text-sm text-subtle">{review.context}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function AioReviews() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="border-y border-line bg-surface/30 py-16"
    >
      <div className="container-rail">
        <Reveal className="mb-10 text-center">
          <span className="kicker mb-4">From the test team</span>
          <h2 id="reviews-heading" className="text-4xl font-bold text-ink sm:text-5xl">
            Built with racers. <span className="text-gradient">Proven on track.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Early feedback from LMU drivers using Apex AIO in the Apex &amp; Chill community.
          </p>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {AIO_REVIEWS.map((review, index) => (
            <Reveal
              key={`${review.author}-${index}`}
              delay={(index % 3) * 90}
              className={cn("h-full", review.featured && "md:col-span-2 lg:col-span-2")}
            >
              <ReviewCard review={review} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-subtle">
            <MessageCircle aria-hidden size={16} className="text-cyan" />
            Shared by community members in the Apex &amp; Chill Discord.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
