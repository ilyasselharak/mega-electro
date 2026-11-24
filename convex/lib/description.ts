// Electro Darna descriptions mix prose with "Label : value" spec lines
// ("Marque : KRAFT", "Capacité de lavage : 6 kg"). Those lines become the
// product's specs table; the rest stays as the description.

const BULLET = /^\s*(?:[*•–-]|\d+[.)])\s+/;
// A spec label is short (≤ 5 words) and the value fits on one line.
const SPEC_LINE = /^([^:：]{2,40}?)\s*[:：]\s*(.{1,120})$/;
// Section titles that only introduce the spec lines ("4. Caractéristiques techniques").
const SPEC_HEADING = /^(?:\d+[.)]\s*)?(caract[ée]ristiques(?: techniques)?|fiche technique|sp[ée]cifications(?: techniques)?|المواصفات(?: التقنية)?)\s*:?$/i;

export function splitSpecs(text: string | undefined): { description: string | undefined; specs: { label: string; value: string }[] } {
  if (!text) return { description: undefined, specs: [] };
  const specs: { label: string; value: string }[] = [];
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.replace(BULLET, "").replace(/\*\*/g, "").trim();
    const m = line.match(SPEC_LINE);
    const label = m?.[1].trim();
    if (m && label && label.split(/\s+/).length <= 5 && !/https?$/i.test(label)) {
      const key = label.toLowerCase();
      if (!seen.has(key) && specs.length < 40) {
        seen.add(key);
        specs.push({ label: label.slice(0, 60), value: m[2].trim().replace(/[.;]$/, "").slice(0, 120) });
      }
      continue;
    }
    if (SPEC_HEADING.test(line)) continue;
    kept.push(raw);
  }
  const description = kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  // Fewer than 2 spec lines: probably prose that happens to contain a colon.
  if (specs.length < 2) return { description: text.trim() || undefined, specs: [] };
  return { description: description || undefined, specs };
}
