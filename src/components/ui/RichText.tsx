import { Fragment, type ReactNode } from "react";
import { parseRichText, type RichInline } from "@/contracts";
import { cn } from "./cn";

export interface RichTextProps {
  /** Source in the light markup of `contracts/rich-text.ts`. */
  text: string;
  /** `lang` of the text (e.g. `de` for a reading passage). */
  lang?: string;
  className?: string;
}

function inline(parts: RichInline[]): ReactNode {
  return parts.map((part, i) =>
    part.kind === "bold" ? (
      <strong key={i} className="font-bold">
        {part.text}
      </strong>
    ) : part.kind === "italic" ? (
      <em key={i}>{part.text}</em>
    ) : (
      <Fragment key={i}>{part.text}</Fragment>
    ),
  );
}

/**
 * Renders authored rich text (TELC-001): paragraphs, line breaks, bullet lists,
 * sub-headings, bold and italic. Never renders HTML, so content can't inject markup.
 */
export function RichText({ text, lang, className }: RichTextProps) {
  const blocks = parseRichText(text);
  return (
    <div lang={lang} className={cn("flex flex-col gap-3 break-words hyphens-auto", className)}>
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          return (
            <h3 key={i} className="font-display text-lg leading-snug font-bold">
              {inline(block.inline)}
            </h3>
          );
        }
        if (block.kind === "list") {
          return (
            <ul key={i} className="flex list-disc flex-col gap-1 pl-5">
              {block.items.map((item, j) => (
                <li key={j}>{inline(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(line)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
