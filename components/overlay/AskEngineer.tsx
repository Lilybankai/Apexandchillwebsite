"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./mocks.module.css";

/**
 * The page's one interactive demo: pick a question, the engineer answers it —
 * out loud, in the app's own voice. The clips in /public/engineer/ were
 * generated with the exact pipeline the product ships: Piper's
 * en_GB-alan-medium voice fed through the app's radio-fx comms channel
 * (band-pass, saturation, hiss bed, key-up/key-off squelch). The PTT chirp is
 * synthesised from an oscillator, the same way the app makes its cues.
 * The exchange is scripted — this is a marketing page, not live telemetry —
 * but every question is one of the 28 the real engineer answers offline.
 *
 * OPERATOR: to regenerate the clips after changing an answer, run the
 * gen-alan script against the app repo (piper -> radio-fx -> public/engineer).
 */

const T = {
  panel: "#0c0e18",
  panel2: "#10131f",
  header: "#090a12",
  borderSoft: "#232838",
  primary: "#f4f6fb",
  secondary: "#aeb6c8",
  muted: "#6b7387",
  warn: "#ffb020",
  cyan: "#22d3ee",
  magenta: "#ec4899",
} as const;

const ACCENT_BAR = "linear-gradient(180deg, #22d3ee 0%, #8b5cf6 55%, #ec4899 100%)";

/** Display text; the audio clip for index i is /engineer/answer-<i>.wav. */
const QA: { q: string; a: string }[] = [
  { q: "Gap behind?", a: "Rossi, one point two back — he did a 48.1 last lap. You're matching him." },
  { q: "How are my tyres?", a: "Fronts are good. Rear left is at 96 and climbing — give that kerb at eight a rest." },
  { q: "Fuel to the end?", a: "You need 46.7 litres to the flag. That's a splash at the last stop — plan's unchanged." },
  { q: "Where's the leader?", a: "Conway leads. Nine point two up the road, lapping in the 25.4s." },
  { q: "Any damage?", a: "Front aero's carrying thirty-six percent. Worth about half a second a lap — your call." },
  { q: "When do we pit?", a: "Window opens lap 18. Three of the five ahead of you stop first." },
  { q: "What's the weather doing?", a: "Dry for now — light rain in about fifteen minutes, and track temp's falling." },
  { q: "Track limits?", a: "One point seven five left. Watch turn eight — that kerb has cost you twice." },
];

const WAVE = [4, 9, 14, 7, 12, 16, 10, 5, 11, 15, 8, 4, 10, 13, 6];

export function AskEngineer({ className }: { className?: string }) {
  const [selected, setSelected] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const clips = useRef<Map<number, HTMLAudioElement>>(new Map());
  const playing = useRef<HTMLAudioElement | null>(null);
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;

  // Everything stops the moment the component goes away.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      playing.current?.pause();
      audioCtx.current?.close().catch(() => {});
    },
    [],
  );

  /** The PTT chirp: two quick rising tones from a plain oscillator. */
  const chirp = () => {
    if (!soundOnRef.current) return;
    try {
      audioCtx.current ??= new AudioContext();
      const ctx = audioCtx.current;
      if (ctx.state === "suspended") void ctx.resume();
      const t0 = ctx.currentTime;
      [
        { f: 950, start: 0, len: 0.07 },
        { f: 1400, start: 0.09, len: 0.08 },
      ].forEach(({ f, start, len }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0, t0 + start);
        gain.gain.linearRampToValueAtTime(0.12, t0 + start + 0.015);
        gain.gain.linearRampToValueAtTime(0, t0 + start + len);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + start);
        osc.stop(t0 + start + len + 0.02);
      });
    } catch {
      // no audio available — the demo still works silently
    }
  };

  const stopVoice = () => {
    if (playing.current) {
      playing.current.pause();
      playing.current.currentTime = 0;
      playing.current = null;
    }
  };

  /** Play Alan's clip for question i — the squelch is baked into the file. */
  const speak = (i: number) => {
    if (!soundOnRef.current) return;
    let clip = clips.current.get(i);
    if (!clip) {
      clip = new Audio(`/engineer/answer-${i}.wav`);
      clip.preload = "auto";
      clips.current.set(i, clip);
    }
    clip.currentTime = 0;
    playing.current = clip;
    void clip.play().catch(() => {
      // autoplay refused or file missing — the text answer still shows
    });
  };

  const ask = (i: number) => {
    if (timer.current) clearTimeout(timer.current);
    stopVoice();
    chirp();
    setSelected(i);
    setThinking(true);
    timer.current = setTimeout(() => {
      setThinking(false);
      speak(i);
    }, 750);
  };

  const toggleSound = () => {
    setSoundOn((on) => {
      if (on) stopVoice();
      return !on;
    });
  };

  return (
    <div className={className}>
      {/* Question chips — press one, exactly like pressing the PTT and asking */}
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Ask the engineer a question">
        {QA.map((item, i) => (
          <button
            key={item.q}
            type="button"
            onClick={() => ask(i)}
            aria-pressed={i === selected}
            className="rounded-full border px-3 py-1.5 font-mono text-[12px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: i === selected ? "color-mix(in srgb, #22d3ee 16%, transparent)" : T.panel2,
              borderColor: i === selected ? T.cyan : T.borderSoft,
              color: i === selected ? T.cyan : T.secondary,
              outlineColor: T.cyan,
            }}
          >
            {item.q}
          </button>
        ))}
      </div>

      {/* The radio panel */}
      <div
        className="relative overflow-hidden rounded-lg border"
        style={{ background: T.panel, borderColor: T.borderSoft, boxShadow: "0 4px 14px rgba(0,0,0,0.55)" }}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 z-10 w-[3px]" style={{ background: ACCENT_BAR }} />
        <div
          className="flex items-center justify-between gap-2 border-b py-[5px] pl-[13px] pr-[10px]"
          style={{ background: T.header, borderColor: T.borderSoft }}
        >
          <span className="font-display text-[12px] font-bold uppercase leading-none" style={{ color: T.primary, letterSpacing: "0.12em" }}>
            Race Engineer
          </span>
          <span className="flex items-center gap-3">
            <span className="font-mono text-[11px] leading-none" style={{ color: T.secondary, letterSpacing: "0.02em" }}>
              ALAN · EN-GB
            </span>
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Mute the engineer" : "Unmute the engineer"}
              title={soundOn ? "Mute the engineer" : "Unmute the engineer"}
              className="inline-flex items-center justify-center rounded-[4px] p-[3px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ color: soundOn ? T.cyan : T.muted, outlineColor: T.cyan }}
            >
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          </span>
        </div>

        <div className="flex flex-col gap-[8px] p-[10px] pl-[13px]">
          {/* PTT strip: held while you speak, waveform live */}
          <div
            className="flex items-center gap-[10px] rounded-[5px] px-[10px] py-[6px]"
            style={{ background: T.panel2, borderLeft: `3px solid ${T.cyan}` }}
          >
            <span
              className="rounded-[4px] px-[7px] py-[3px] font-display text-[10px] font-bold leading-none"
              style={{ background: "color-mix(in srgb, #22d3ee 18%, transparent)", color: T.cyan, letterSpacing: "0.12em" }}
            >
              ● PTT
            </span>
            <span className="flex h-[16px] flex-1 items-center gap-[2px]" aria-hidden>
              {WAVE.map((h, i) => (
                <span
                  key={i}
                  className={cn("w-[3px] rounded-[1px]", thinking && styles.waveBar)}
                  style={{
                    height: h,
                    background: T.cyan,
                    opacity: thinking ? 0.9 : 0.35,
                    animationDelay: `${(i % 5) * 0.09}s`,
                  }}
                />
              ))}
            </span>
            <span
              className="font-display text-[9px] font-bold uppercase leading-none"
              style={{ color: T.cyan, letterSpacing: "0.1em" }}
            >
              Wheel button
            </span>
          </div>

          {/* Your question */}
          <div className="pl-[2px]">
            <span className="font-display text-[9px] font-bold uppercase leading-none" style={{ color: T.muted, letterSpacing: "0.1em" }}>
              You
            </span>
            <p className="tabular mt-[3px] font-mono text-[14px] leading-snug" style={{ color: T.secondary }}>
              &ldquo;{QA[selected].q}&rdquo;
            </p>
          </div>

          {/* The reply — Alan's actual voice, through the app's radio channel */}
          <div
            className="min-h-[64px] rounded-r-[5px] px-[10px] py-[8px]"
            style={{ background: T.panel2, borderLeft: `3px solid ${T.magenta}` }}
            aria-live="polite"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-[9px] font-bold uppercase leading-none" style={{ color: T.magenta, letterSpacing: "0.1em" }}>
                Alan · on the radio
              </span>
              <span className="font-display text-[9px] font-bold uppercase leading-none" style={{ color: T.muted, letterSpacing: "0.1em" }}>
                {thinking ? "…" : "0.4 s"}
              </span>
            </div>
            {!thinking && (
              <p key={selected} className={cn("mt-[4px] font-mono text-[14px] leading-snug", styles.fadeUp)} style={{ color: T.primary }}>
                &ldquo;{QA[selected].a}&rdquo;
              </p>
            )}
          </div>

          <p className="font-display text-[9px] uppercase" style={{ color: T.muted, letterSpacing: "0.08em" }}>
            8 of the 28 questions · voiced by Alan — the app&apos;s own engineer, through its radio channel
          </p>
        </div>
      </div>
    </div>
  );
}
