import { ImageResponse } from "next/og";

// Raster logo for Organization JSON-LD (Google prefers PNG/JPG to SVG). Same mark as /icon.svg.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <svg width="400" height="400" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#ffffff" /><path d="M15 45V20l17 17 17-17v25" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="32" cy="45" r="4.5" fill="#f97316" /></svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
