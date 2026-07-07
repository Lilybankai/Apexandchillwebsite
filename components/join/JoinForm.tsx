'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import type { JoinResult, JoinSubmission, League } from '@/lib/types';
import { LEAGUES, LEAGUE_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

/** Leagues that run on PC (Steam) and use a gamertag rather than a PSN ID. */
const PC_LEAGUES: League[] = ['LMU', 'THU'];
const isPcLeague = (league: League): boolean => PC_LEAGUES.includes(league);

/** Platform options offered per league (GT7 = PlayStation, LMU/THU = PC). */
const PLATFORMS: Record<League, string[]> = {
  GT7: ['PS5', 'PS4'],
  LMU: ['PC (Steam)'],
  THU: ['PC (Steam)'],
};

/** Car-class options offered per league. */
const CAR_CLASSES: Record<League, string[]> = {
  GT7: ['GR.4 (Beginner)', 'GR.3 (Advanced)', 'Both'],
  LMU: ['GT3', 'Hypercar'],
  THU: ['GT3', 'Hypercar'],
};

const INPUT_METHODS = ['Wheel', 'Controller'];

const EXPERIENCE_OPTIONS = [
  'New to sim racing',
  'Casual / a few leagues',
  'Experienced league racer',
  'Competitive / alien pace',
];

/** Discord invite for the community (fallback contact + CTA). */
const DISCORD_URL = 'https://discord.gg/MBew2Bb2hj';

/** Basic email shape check — mirrors the server rule for instant feedback. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** The controlled form state. Mirrors {@link JoinSubmission}. */
interface FormState {
  league: League;
  driverName: string;
  platform: string;
  psn: string;
  gamertag: string;
  email: string;
  discord: string;
  carClass: string;
  experience: string;
  inputMethod: string;
  eligibilityAck: boolean;
  message: string;
}

const INITIAL: FormState = {
  league: 'GT7',
  driverName: '',
  platform: PLATFORMS.GT7[0],
  psn: '',
  gamertag: '',
  email: '',
  discord: '',
  carClass: '',
  experience: '',
  inputMethod: '',
  eligibilityAck: false,
  message: '',
};

/** Client-side mirror of the server validation, for instant feedback. */
function validateClient(form: FormState): string | null {
  if (form.driverName.trim().length < 2) return 'Please enter your driver name.';
  if (!form.platform) return 'Please select your platform.';
  if (form.league === 'GT7' && !form.psn.trim()) return 'Please enter your PSN ID.';
  if (isPcLeague(form.league) && !form.gamertag.trim()) return 'Please enter your Steam name / gamertag.';
  if (!EMAIL_RE.test(form.email.trim())) return 'Please enter a valid email address.';
  if (form.discord.trim().length < 2) return 'Please enter your Discord username.';
  if (!form.carClass) return 'Please choose a car class.';
  if (!form.experience) return 'Please tell us your experience level.';
  if (!form.inputMethod) return 'Please tell us if you race on a wheel or controller.';
  if (!form.eligibilityAck) return 'Please confirm you meet the eligibility requirements.';
  return null;
}

/** Shared class for text inputs / selects. */
const fieldClass =
  'w-full rounded-lg border border-line bg-base/60 px-4 py-3 text-ink placeholder:text-subtle transition-colors focus:border-cyan focus:outline-none';
const labelClass = 'mb-1.5 block font-mono text-xs font-semibold uppercase tracking-widest text-subtle';

/**
 * The Join the League application form. Supports BOTH the GT7 and LMU leagues:
 * choosing a league swaps the platform + car-class options and the relevant
 * in-game ID field (PSN for GT7, gamertag for LMU). Validates on the client for
 * instant feedback and again on the server via `POST /api/join`.
 */
export function JoinForm({ leagues = LEAGUES }: { leagues?: readonly League[] }) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /** Switch league and reset the league-dependent fields to sensible defaults,
   * clearing the in-game id that no longer applies (GT7 uses PSN, LMU gamertag). */
  function selectLeague(league: League) {
    setForm((prev) => ({
      ...prev,
      league,
      platform: PLATFORMS[league][0],
      carClass: '',
      psn: league === 'GT7' ? prev.psn : '',
      gamertag: isPcLeague(league) ? prev.gamertag : '',
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clientError = validateClient(form);
    if (clientError) {
      setStatus('error');
      setMessage(clientError);
      return;
    }

    setStatus('submitting');
    setMessage(null);

    const payload: JoinSubmission = {
      league: form.league,
      driverName: form.driverName.trim(),
      platform: form.platform,
      psn: form.psn.trim() || undefined,
      gamertag: form.gamertag.trim() || undefined,
      email: form.email.trim(),
      discord: form.discord.trim(),
      carClass: form.carClass,
      experience: form.experience,
      inputMethod: form.inputMethod,
      eligibilityAck: form.eligibilityAck,
      message: form.message.trim() || undefined,
    };

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as JoinResult;
      if (res.ok && result.ok) {
        setStatus('success');
        setForm(INITIAL);
      } else {
        setStatus('error');
        setMessage(result.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error — please check your connection and try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="glass rounded-card p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h3 className="mt-5 font-display text-2xl text-ink">You&apos;re On The Grid</h3>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Application received. Our stewards will be in touch — jump into Discord
          to introduce yourself and get race-ready.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href={DISCORD_URL} variant="discord" target="_blank" rel="noopener noreferrer">
            Join the Discord
          </Button>
          <Button type="button" variant="outline" onClick={() => setStatus('idle')}>
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-card p-6 sm:p-8" noValidate>
      {/* League selector */}
      <fieldset className="mb-6">
        <legend className={labelClass}>Which league?</legend>
        <div className="inline-flex rounded-card border border-line bg-base/60 p-1">
          {leagues.map((league) => (
            <button
              key={league}
              type="button"
              onClick={() => selectLeague(league)}
              aria-pressed={form.league === league}
              className={cn(
                'rounded-[10px] px-5 py-2.5 font-display text-sm uppercase tracking-wide transition-all duration-150',
                form.league === league ? 'bg-neon-primary text-white shadow-glow-soft' : 'text-muted hover:text-ink',
              )}
            >
              {LEAGUE_LABELS[league]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Driver name */}
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="driverName">
            Driver name
          </label>
          <input
            id="driverName"
            className={fieldClass}
            value={form.driverName}
            onChange={(e) => update('driverName', e.target.value)}
            placeholder="e.g. Carl Jones"
            required
          />
        </div>

        {/* Platform */}
        <div>
          <label className={labelClass} htmlFor="platform">
            Platform
          </label>
          <select
            id="platform"
            className={fieldClass}
            value={form.platform}
            onChange={(e) => update('platform', e.target.value)}
          >
            {PLATFORMS[form.league].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* League-specific in-game ID */}
        {form.league === 'GT7' ? (
          <div>
            <label className={labelClass} htmlFor="psn">
              PSN ID
            </label>
            <input
              id="psn"
              className={fieldClass}
              value={form.psn}
              onChange={(e) => update('psn', e.target.value)}
              placeholder="Your PlayStation Network ID"
              required
            />
          </div>
        ) : (
          <div>
            <label className={labelClass} htmlFor="gamertag">
              Steam name / gamertag
            </label>
            <input
              id="gamertag"
              className={fieldClass}
              value={form.gamertag}
              onChange={(e) => update('gamertag', e.target.value)}
              placeholder="Your Steam name"
              required
            />
          </div>
        )}

        {/* Email */}
        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            className={fieldClass}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Discord */}
        <div>
          <label className={labelClass} htmlFor="discord">
            Discord username
          </label>
          <input
            id="discord"
            className={fieldClass}
            value={form.discord}
            onChange={(e) => update('discord', e.target.value)}
            placeholder="e.g. apexdriver"
            required
          />
        </div>

        {/* Car class (league-aware) */}
        <div>
          <label className={labelClass} htmlFor="carClass">
            Preferred car class
          </label>
          <select
            id="carClass"
            className={fieldClass}
            value={form.carClass}
            onChange={(e) => update('carClass', e.target.value)}
            required
          >
            <option value="" disabled>
              Select a class…
            </option>
            {CAR_CLASSES[form.league].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Input method */}
        <div>
          <label className={labelClass} htmlFor="inputMethod">
            Wheel or controller?
          </label>
          <select
            id="inputMethod"
            className={fieldClass}
            value={form.inputMethod}
            onChange={(e) => update('inputMethod', e.target.value)}
            required
          >
            <option value="" disabled>
              Select…
            </option>
            {INPUT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Experience */}
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="experience">
            Experience level
          </label>
          <select
            id="experience"
            className={fieldClass}
            value={form.experience}
            onChange={(e) => update('experience', e.target.value)}
            required
          >
            <option value="" disabled>
              Select your experience…
            </option>
            {EXPERIENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="message">
            Anything else? <span className="text-subtle/70">(optional)</span>
          </label>
          <textarea
            id="message"
            className={cn(fieldClass, 'min-h-[96px] resize-y')}
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder="Tell us about your racing, your favourite car, or ask a question."
          />
        </div>

        {/* Eligibility acknowledgement */}
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--color-accent))]"
              checked={form.eligibilityAck}
              onChange={(e) => update('eligibilityAck', e.target.checked)}
              required
            />
            <span>
              I&apos;m 16 or over and agree to race clean and follow the league
              rules and stewarding decisions.
            </span>
          </label>
        </div>
      </div>

      {/* Error banner */}
      {status === 'error' && message && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-card border border-flag-red/40 bg-flag-red/10 px-4 py-3 text-sm text-ink"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-flag-red" aria-hidden />
          <span>{message}</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" clip disabled={status === 'submitting'}>
          {status === 'submitting' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            'Apply to Race'
          )}
        </Button>
        <Button href={DISCORD_URL} variant="discord" size="lg" target="_blank" rel="noopener noreferrer">
          Join the Discord
        </Button>
      </div>
      <p className="mt-4 font-mono text-xs text-subtle">
        All leagues welcome. GT7 runs on PlayStation; our Le Mans Ultimate leagues
        run on PC. We&apos;ll get you set up in Discord after you apply.
      </p>
    </form>
  );
}
