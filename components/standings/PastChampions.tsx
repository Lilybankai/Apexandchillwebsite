import { Trophy } from 'lucide-react';
import { LEAGUE_LABELS } from '@/lib/types';
import { PAST_CHAMPIONS } from '@/lib/seasons';

/**
 * The roll of honour: every finished season's class champions, newest first.
 * Data lives in `lib/seasons.ts`, so a season's winners go in the same commit
 * that moves the league on to its next championship.
 */
export function PastChampions() {
  if (PAST_CHAMPIONS.length === 0) return null;

  return (
    <section aria-labelledby="past-champions" className="border-t border-line">
      <div className="container-rail py-12 sm:py-16">
        <span className="kicker mb-4">Roll of honour</span>
        <h2 id="past-champions" className="font-display text-3xl font-bold text-ink sm:text-4xl">
          Past champions
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PAST_CHAMPIONS.map((season) => (
            <article
              key={`${season.league}-${season.seasonLabel}`}
              className="rounded-card border border-line bg-surface/50 p-6"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-subtle">
                {LEAGUE_LABELS[season.league]} · {season.seasonLabel}
              </p>
              <ul className="mt-4 space-y-3">
                {season.champions.map((c) => (
                  <li key={c.className} className="flex items-center gap-3">
                    <Trophy size={18} className="shrink-0 text-flag-gold" aria-hidden />
                    <span className="w-16 shrink-0 font-mono text-xs uppercase tracking-widest text-muted">
                      {c.className}
                    </span>
                    <span className="font-display text-xl font-bold uppercase tracking-wide text-ink">
                      {c.driver}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
