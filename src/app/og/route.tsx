import { ImageResponse } from "next/og";

// Fallback social sharing image (used when no image is set in Admin → SEO).
// Served as a plain route instead of the `opengraph-image` file convention, because that
// convention overrides every page's own og:image (product and category photos).
const size = { width: 1200, height: 630 };

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0b1a3a", color: "#eef2ff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="96" height="96" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#2350ff" /><path d="M14 46V20l18 18 18-18v26" fill="none" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="32" cy="38" r="5" fill="#ffc531" /></svg>
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>MEGA ELECTRO</div>
        </div>
        <div style={{ fontSize: 44, marginTop: 40, maxWidth: 900, lineHeight: 1.2 }}>Tout l&apos;électroménager, livré à votre porte.</div>
        <div style={{ fontSize: 28, marginTop: 28, color: "#ffc531" }}>Livraison partout au Maroc, paiement à la livraison</div>
      </div>
    ),
    size,
  );
}
