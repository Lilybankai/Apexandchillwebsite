/**
 * `POST /api/join` — accept a "Join the League" application and persist it to
 * the Supabase `join_submissions` table.
 *
 * Request body: a JSON {@link JoinSubmission}. The payload is validated
 * server-side (never trust the client). On success returns `{ ok: true, id }`;
 * on a validation failure returns HTTP 400 with `{ ok: false, error }`; when
 * Supabase isn't configured yet returns HTTP 503 with a Discord-first message
 * so applicants are never left stranded.
 *
 * @packageDocumentation
 */

import { NextResponse } from 'next/server';
import type { JoinResult, JoinSubmission, League } from '@/lib/types';
import { getSupabaseAdminClient } from '@/lib/supabase';

const VALID_LEAGUES: League[] = ['GT7', 'LMU'];
const MAX_LEN = 500;

/** Basic email shape check — deliberately permissive, not RFC-exhaustive. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Coerce an unknown value to a trimmed, length-capped string. */
function str(v: unknown): string {
  return typeof v === 'string' ? v.trim().slice(0, MAX_LEN) : '';
}

/**
 * Validate + normalise a raw request body into a {@link JoinSubmission}.
 *
 * @returns The clean submission, or an error message describing the first
 *          failed rule.
 */
function validate(body: unknown): { data?: JoinSubmission; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request body.' };
  const b = body as Record<string, unknown>;

  const league = str(b.league).toUpperCase() as League;
  if (!VALID_LEAGUES.includes(league)) return { error: 'Please choose a league (GT7 or LMU).' };

  const driverName = str(b.driverName);
  if (driverName.length < 2) return { error: 'Please enter your driver name.' };

  const platform = str(b.platform);
  if (!platform) return { error: 'Please select your platform.' };

  const psn = str(b.psn);
  const gamertag = str(b.gamertag);
  // Require the in-game identity that matches the chosen league's platform.
  if (league === 'GT7' && !psn) {
    return { error: 'Please enter your PSN ID (GT7 runs on PlayStation).' };
  }
  if (league === 'LMU' && !gamertag) {
    return { error: 'Please enter your Steam name / gamertag (LMU runs on PC).' };
  }

  const email = str(b.email);
  if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email address.' };

  const discord = str(b.discord);
  if (discord.length < 2) return { error: 'Please enter your Discord username.' };

  const carClass = str(b.carClass);
  if (!carClass) return { error: 'Please choose a car class.' };

  const experience = str(b.experience);
  if (!experience) return { error: 'Please tell us your experience level.' };

  const inputMethod = str(b.inputMethod);
  if (!inputMethod) return { error: 'Please tell us if you race on a wheel or controller.' };

  const eligibilityAck = b.eligibilityAck === true;
  if (!eligibilityAck) {
    return { error: 'Please confirm you meet the eligibility and clean-racing requirements.' };
  }

  return {
    data: {
      league,
      driverName,
      platform,
      psn: psn || undefined,
      gamertag: gamertag || undefined,
      email,
      discord,
      carClass,
      experience,
      inputMethod,
      eligibilityAck,
      message: str(b.message) || undefined,
    },
  };
}

/**
 * Handle POST requests to submit a league application.
 *
 * @param request - The incoming request carrying a JSON {@link JoinSubmission}.
 */
export async function POST(request: Request): Promise<NextResponse<JoinResult>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed JSON body.' }, { status: 400 });
  }

  const { data, error } = validate(body);
  if (!data) {
    return NextResponse.json({ ok: false, error: error ?? 'Invalid submission.' }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    // Persistence isn't wired up yet — guide the applicant to Discord instead
    // of silently dropping their application.
    return NextResponse.json(
      {
        ok: false,
        error:
          'Applications aren’t connected yet. Please join our Discord and drop a message — we’ll get you on the grid.',
      },
      { status: 503 },
    );
  }

  try {
    const { data: inserted, error: dbError } = await admin
      .from('join_submissions')
      .insert({
        league: data.league,
        driver_name: data.driverName,
        platform: data.platform,
        psn: data.psn ?? null,
        gamertag: data.gamertag ?? null,
        email: data.email,
        discord: data.discord,
        car_class: data.carClass,
        experience: data.experience,
        input_method: data.inputMethod,
        eligibility_ack: data.eligibilityAck,
        message: data.message ?? null,
      })
      .select('id')
      .single();

    if (dbError) {
      return NextResponse.json(
        { ok: false, error: 'Something went wrong saving your application. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, id: inserted?.id as string | undefined, error: null });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Something went wrong saving your application. Please try again.' },
      { status: 500 },
    );
  }
}
