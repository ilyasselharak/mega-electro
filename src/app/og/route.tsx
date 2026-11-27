import { ImageResponse } from "next/og";

// Fallback social sharing image (used when no image is set in Admin → SEO).
// Served as a plain route instead of the `opengraph-image` file convention, because that
// convention overrides every page's own og:image (product and category photos).
const size = { width: 1200, height: 630 };

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0f172a", color: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="96" height="96" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#ffffff" /><path d="M15 45V20l17 17 17-17v25" fill="none" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="32" cy="45" r="4.5" fill="#f97316" /></svg>
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>Mega Electro</div>
        </div>
        <div style={{ fontSize: 44, marginTop: 40, maxWidth: 900, lineHeight: 1.2 }}>Équipez votre maison autrement.</div>
        <div style={{ fontSize: 28, marginTop: 28, color: "#f97316" }}>Livraison partout au Maroc, paiement à la livraison</div>
      </div>
    ),
    size,
  );
}
