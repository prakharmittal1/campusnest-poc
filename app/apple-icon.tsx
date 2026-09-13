import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same design as app/icon.svg, rendered to PNG for iOS home screens.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffc629" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path d="M16 28.5S7.5 21 7.5 14.25a8.5 8.5 0 0 1 17 0C24.5 21 16 28.5 16 28.5z" fill="#0f1b2d" />
          <path
            d="M11.75 16 16 12l4.25 4"
            fill="none"
            stroke="#ffc629"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
