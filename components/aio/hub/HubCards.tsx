import { Bot, Mic, Radio, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Two small panels for features that have no widget mock of their own: the
 * engineer's radio log and StreamBot + the league board. Representative
 * data, written in the app's own phrasing. Not live.
 */

function PanelChrome({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-card border border-line bg-[#080a0f]", className)}>
      <div className="flex items-center justify-between border-b border-line bg-elevated/80 px-4 py-3">
        <span className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-ink">
          {icon}
          {title}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest text-success">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
          LIVE
        </span>
      </div>
      {children}
    </div>
  );
}

const RADIO: { who: "you" | "eng"; text: string; tag?: string }[] = [
  { who: "you", text: "Gap behind?" },
  { who: "eng", text: "Car behind, one point four. He's lost two tenths this lap.", tag: "Offline" },
  { who: "eng", text: "Yellow flag, sector two. Yellow, sector two.", tag: "Proactive" },
  { who: "you", text: "Fuel to the end?" },
  { who: "eng", text: "Plus one point eight laps. You're good to the flag.", tag: "Offline" },
  { who: "you", text: "Should I pit for softs if it dries up?" },
  { who: "eng", text: "Track's drying at sector one. Box in two laps, not now.", tag: "AI" },
];

export function RadioCallsCard() {
  return (
    <PanelChrome title="Engineer · radio" icon={<Radio size={15} className="text-cyan" aria-hidden />}>
      <ul className="space-y-2.5 p-4" aria-label="Example race engineer radio exchange">
        {RADIO.map((line, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm",
              line.who === "you"
                ? "ml-8 border-accent/30 bg-accent/10 text-ink"
                : "mr-8 border-line bg-surface/60 text-muted",
            )}
          >
            {line.who === "you" ? (
              <Mic size={15} className="mt-0.5 shrink-0 text-accent-2" aria-label="You, on push-to-talk" />
            ) : (
              <Radio size={15} className="mt-0.5 shrink-0 text-cyan" aria-label="Engineer" />
            )}
            <span className="flex-1">{line.text}</span>
            {line.tag && (
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-subtle">
                {line.tag}
              </span>
            )}
          </li>
        ))}
      </ul>
    </PanelChrome>
  );
}

const CHAT: { user: string; text: string; bot?: boolean }[] = [
  { user: "kerb_hopper", text: "!gap" },
  { user: "Apex Bot", text: "P4 in Hypercar, +1.2 s to the car ahead.", bot: true },
  { user: "late_apex_liz", text: "!setup" },
  { user: "Apex Bot", text: "Tonight's Spa setup is on the league board. Clean lap 2:18.4.", bot: true },
  { user: "Apex Bot", text: "Goal: 42 / 50 members. Thanks for joining, slipstream_sam!", bot: true },
];

const BOARD = [
  { pos: 1, name: "M. Varga", lap: "2:18.412" },
  { pos: 2, name: "You", lap: "2:18.906", me: true },
  { pos: 3, name: "T. Okafor", lap: "2:19.140" },
  { pos: 4, name: "J. Lind", lap: "2:19.577" },
];

export function StreamBotCard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PanelChrome title="StreamBot" icon={<Bot size={15} className="text-cyan" aria-hidden />}>
        <ul className="space-y-2 p-4 font-mono text-xs" aria-label="Example StreamBot chat">
          {CHAT.map((line, i) => (
            <li key={i} className="leading-relaxed">
              <span className={line.bot ? "font-bold text-cyan" : "font-bold text-accent-2"}>{line.user}</span>
              <span className="text-muted">: {line.text}</span>
            </li>
          ))}
        </ul>
      </PanelChrome>
      <PanelChrome title="League · Spa · GT3" icon={<Trophy size={15} className="text-cyan" aria-hidden />}>
        <table className="w-full font-mono text-xs">
          <caption className="sr-only">Example league leaderboard: best clean laps</caption>
          <tbody>
            {BOARD.map((row) => (
              <tr
                key={row.pos}
                className={cn("border-b border-line/60 last:border-0", row.me && "bg-accent/10 text-ink")}
              >
                <td className="px-4 py-2.5 text-subtle">P{row.pos}</td>
                <td className={cn("py-2.5", row.me ? "font-bold text-ink" : "text-muted")}>{row.name}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink">{row.lap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PanelChrome>
    </div>
  );
}
