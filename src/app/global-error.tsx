"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1>Une erreur est survenue</h1>
          <button onClick={reset} style={{ padding: "10px 20px", borderRadius: 999, border: "1px solid #ccc", cursor: "pointer" }}>Réessayer</button>
        </div>
      </body>
    </html>
  );
}
