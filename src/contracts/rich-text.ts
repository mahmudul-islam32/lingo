/**
 * Light rich-text markup for long authored text (TELC-001): explanations, reading
 * passages, explain cards, tasks and model answers. Pure; the renderer lives in
 * `components/ui/RichText.tsx`.
 *
 * - A blank line separates blocks; a single newline is a line break inside a paragraph.
 * - A block whose lines all start with `- ` is a bullet list.
 * - A block starting with `## ` is a sub-heading.
 * - Inline: `**bold**` and `*italic*`. Anything else is plain text (no HTML).
 */

export type RichInline = { kind: "text" | "bold" | "italic"; text: string };

export type RichBlock =
  | { kind: "heading"; inline: RichInline[] }
  | { kind: "paragraph"; lines: RichInline[][] }
  | { kind: "list"; items: RichInline[][] };

const INLINE = /\*\*([\s\S]+?)\*\*|\*(?!\s)([^*\n]+?)\*/gu;

export function parseRichInline(text: string): RichInline[] {
  const parts: RichInline[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ kind: "text", text: text.slice(last, index) });
    if (match[1] !== undefined) parts.push({ kind: "bold", text: match[1] });
    else parts.push({ kind: "italic", text: match[2] ?? "" });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", text: text.slice(last) });
  return parts;
}

export function parseRichText(source: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  for (const raw of source.replace(/\r\n?/g, "\n").split(/\n\s*\n/)) {
    const lines = raw
      .split("\n")
      .map((l) => l.trimEnd())
      .filter((l) => l.trim() !== "");
    if (lines.length === 0) continue;
    if (lines.length === 1 && lines[0]!.startsWith("## ")) {
      blocks.push({ kind: "heading", inline: parseRichInline(lines[0]!.slice(3).trim()) });
    } else if (lines.every((l) => /^\s*[-•] /.test(l))) {
      blocks.push({
        kind: "list",
        items: lines.map((l) => parseRichInline(l.replace(/^\s*[-•] /, ""))),
      });
    } else {
      blocks.push({ kind: "paragraph", lines: lines.map((l) => parseRichInline(l.trim())) });
    }
  }
  return blocks;
}

/** Plain text of rich markup (markers removed), e.g. for speech or announcements. */
export function richTextToPlain(source: string): string {
  return parseRichText(source)
    .map((block) => {
      const join = (inline: RichInline[]) => inline.map((p) => p.text).join("");
      if (block.kind === "heading") return join(block.inline);
      if (block.kind === "list") return block.items.map(join).join("\n");
      return block.lines.map(join).join("\n");
    })
    .join("\n\n");
}
