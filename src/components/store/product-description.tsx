import { Fragment } from "react";

// Product descriptions are plain text, often one idea per line (imported
// descriptions put a blank line between every line). This turns them into
// readable blocks: runs of short lines become a list, a short line that
// introduces a list becomes a heading, the rest stays as paragraphs.
// Light Markdown is honoured: "- " / "* " bullets, "# " headings, **bold**.

type Block = { type: "p"; text: string } | { type: "h"; text: string } | { type: "ul"; items: string[] };

const BULLET = /^\s*(?:[*•–-]|\d+[.)])\s+/;
const isShort = (line: string) => line.length <= 70 && !/[.!?…]$/.test(line);

function parse(text: string): Block[] {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^#{1,6}\s/.test(line)) {
      blocks.push({ type: "h", text: line.replace(/^#+\s*/, "") });
      i++;
      continue;
    }
    // Explicit bullets, or 3+ short lines in a row: a list.
    let j = i;
    while (j < lines.length && (BULLET.test(lines[j]) || isShort(lines[j])) && !/^#{1,6}\s/.test(lines[j])) j++;
    const run = lines.slice(i, j);
    const bulleted = run.some((l) => BULLET.test(l));
    if (run.length >= 3 || (bulleted && run.length >= 1)) {
      // A first line ending with ":" or not bulleted while the rest are introduces the list.
      let items = run;
      if (run.length > 1 && (/:$/.test(run[0]) || (!BULLET.test(run[0]) && run.slice(1).every((l) => BULLET.test(l))) || (!bulleted && /^[A-ZÀ-Ü]/.test(run[0]) && run[0].split(/\s+/).length <= 6))) {
        blocks.push({ type: "h", text: run[0].replace(/:$/, "") });
        items = run.slice(1);
      }
      blocks.push({ type: "ul", items: items.map((l) => l.replace(BULLET, "")) });
      i = j;
      continue;
    }
    const bold = line.match(/^\*\*(.+)\*\*:?$/);
    if (bold) blocks.push({ type: "h", text: bold[1] });
    else blocks.push({ type: "p", text: line });
    i++;
  }
  return blocks;
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((part, i) => (i % 2 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : <Fragment key={i}>{part}</Fragment>))}</>;
}

export function ProductDescription({ text }: { text: string }) {
  return (
    <div className="space-y-4 text-[15px] leading-7 text-foreground/80">
      {parse(text).map((b, i) =>
        b.type === "h" ? (
          <h3 key={i} className="pt-2 font-heading text-base font-semibold text-foreground"><Inline text={b.text} /></h3>
        ) : b.type === "ul" ? (
          <ul key={i} className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {b.items.map((item, k) => (
              <li key={k} className="flex gap-2.5">
                <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span><Inline text={item} /></span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}><Inline text={b.text} /></p>
        ),
      )}
    </div>
  );
}
