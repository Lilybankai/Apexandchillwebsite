import { ImageResponse } from "next/og";

export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 };
export const SOCIAL_IMAGE_ALT =
  "Apex AIO System — LMU overlays, voice race engineer and live setup tools";

export function renderAioSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 75% 20%, #322260 0%, transparent 36%), linear-gradient(135deg, #08090d 0%, #111324 58%, #08090d 100%)",
          color: "#f5f5f7",
          display: "flex",
          fontFamily: "sans-serif",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          padding: "76px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(139, 92, 246, 0.42)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            padding: "58px",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "#67e8f9",
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Le Mans Ultimate · rFactor 2 · Windows
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 78,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              Apex AIO System
            </div>
            <div
              style={{
                color: "#c4b5fd",
                display: "flex",
                fontSize: 34,
                marginTop: 26,
              }}
            >
              Your whole pit wall in one app.
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              fontSize: 25,
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 30 }}>
              <span>20 overlays</span>
              <span>Voice engineer</span>
              <span>Live setups</span>
            </div>
            <div
              style={{
                background: "linear-gradient(135deg, #7c3aed, #db2777)",
                display: "flex",
                fontWeight: 700,
                padding: "15px 24px",
              }}
            >
              7 days free
            </div>
          </div>
        </div>
      </div>
    ),
    SOCIAL_IMAGE_SIZE,
  );
}
