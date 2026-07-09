import type { Metadata } from 'next';
import Image from 'next/image';
import { Trophy, Users, Radio, ShieldCheck } from 'lucide-react';
import { JoinForm } from '@/components/join/JoinForm';
import { activeLeagues } from '@/lib/leagues';

export const metadata: Metadata = {
  title: 'Join the League',
  alternates: { canonical: '/join' },
  description:
    'Race with Apex & Chill. Apply to join our competitive GT7 (PlayStation) or Le Mans Ultimate (PC) sim racing leagues — clean racing, real community.',
};

/** Selling points shown alongside the application form. */
const PERKS = [
  { icon: Trophy, title: 'Real Championships', body: 'Full seasons across GT7 and LMU with live standings, points and title fights.' },
  { icon: Radio, title: 'Broadcast Every Round', body: 'Your races streamed and replayed on our YouTube channel — get your moment.' },
  { icon: ShieldCheck, title: 'Clean & Stewarded', body: 'Consistent rules and stewarding keep the racing fair, wheel-to-wheel and respectful.' },
  { icon: Users, title: 'A Community That Chills', body: 'A thriving Discord of drivers who take racing seriously and each other lightly.' },
];

/**
 * Join the League page. Presents the value proposition and the multi-league
 * application form (GT7 + LMU) which posts to `POST /api/join`.
 */
export default function JoinPage() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-lines bg-grid opacity-25 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div className="container-rail relative flex flex-col gap-10 py-16 sm:py-20 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="kicker mb-4">Get On The Grid</span>
            <h1 className="text-4xl font-bold text-ink sm:text-6xl">
              Join The <span className="text-gradient">League</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Whether you race on PlayStation in GT7 or on PC in Le Mans Ultimate,
              there&apos;s a seat for you. Apply below — no aliens required, just a
              love for clean, close racing.
            </p>
          </div>
          {/* Operator-supplied brand art (300x147) — native-size section accent. */}
          <Image
            src="/brand/banner.png"
            alt=""
            width={300}
            height={147}
            priority
            className="hidden shrink-0 rounded-card border border-line shadow-glow-soft md:block"
          />
        </div>
      </section>

      {/* Content */}
      <section className="container-rail grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        {/* Perks */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl text-ink">Why Race With Us</h2>
          <ul className="space-y-5">
            {PERKS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-neon-primary/15 text-accent shadow-glow-soft">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg text-ink">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div>
          <JoinForm leagues={activeLeagues()} />
        </div>
      </section>
    </>
  );
}
