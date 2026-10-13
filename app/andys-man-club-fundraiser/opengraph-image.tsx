import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { AMC_EVENT } from "@/lib/events/andys-man-club";

export const alt =
  "The Daytona 3 Hours for Andy's Man Club — a Le Mans Ultimate charity race by Apex & Chill Racing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const RACE_DAY = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * The share card for the charity race, so a link posted to WhatsApp, Facebook
 * or X shows the event — not the homepage card. Details come from
 * `lib/events/andys-man-club.ts`, so the card can't drift from the page.
 */
export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/andysmanclub-logo-white.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const when = `${RACE_DAY.format(new Date(AMC_EVENT.raceStart))} UK`;

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "radial-gradient(circle at 82% 12%, rgba(236, 72, 153, 0.35) 0%, transparent 38%), radial-gradient(circle at 10% 90%, rgba(124, 58, 237, 0.3) 0%, transparent 40%), linear-gradient(135deg, #08090d 0%, #111324 58%, #08090d 100%)",
          color: "#f5f5f7",
          display: "flex",
          fontFamily: "sans-serif",
          height: "100%",
          padding: "64px",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(236, 72, 153, 0.5)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            padding: "52px",
            width: "100%",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                color: "#f472b6",
                display: "flex",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Charity Race · Le Mans Ultimate
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
            <img src={logoSrc} width={300} height={60} alt="" />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
              The Daytona 3 Hours
            </div>
            <div
              style={{
                backgroundClip: "text",
                backgroundImage: "linear-gradient(90deg, #22d3ee, #a855f7, #ec4899)",
                color: "transparent",
                display: "flex",
                fontSize: 64,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginTop: 12,
              }}
            >
              for Andy&apos;s Man Club
            </div>
          </div>

          <div style={{ alignItems: "center", display: "flex", fontSize: 26, justifyContent: "space-between" }}>
            <div style={{ color: "#c4b5fd", display: "flex", gap: 28 }}>
              <span>{when}</span>
              <span>{AMC_EVENT.carClasses.join(" · ")}</span>
              <span>{AMC_EVENT.entryFee} entry</span>
            </div>
            <div
              style={{
                background: "linear-gradient(135deg, #7c3aed, #db2777)",
                display: "flex",
                fontWeight: 700,
                padding: "14px 22px",
              }}
            >
              {AMC_EVENT.fundraisingTarget} target
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
