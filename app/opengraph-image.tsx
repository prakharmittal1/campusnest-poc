import { ImageResponse } from "next/og";
import { LOGO_PIN_PATH, LOGO_ROOF_PATH } from "@/components/brand/Logo";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0f1b2d";
const ACCENT = "#ffc629";

// Social share card, used whenever a link to the site is posted (ads, chats, social).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#ffffff",
          color: INK,
          borderBottom: `24px solid ${ACCENT}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path d={LOGO_PIN_PATH} fill={INK} />
            <path d={LOGO_ROOF_PATH} fill="none" stroke={ACCENT} strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1.5 }}>{site.name.toLowerCase()}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3, maxWidth: 900 }}>
            {site.tagline}
          </span>
          <span style={{ fontSize: 30, color: "#6b7585" }}>{site.promises.join("   ·   ")}</span>
        </div>
      </div>
    ),
    size,
  );
}
