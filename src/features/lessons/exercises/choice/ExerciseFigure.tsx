import type { ExerciseFigure as Figure, LanguageCode } from "@/contracts";
import { cn } from "@/components/ui";

export interface ExerciseFigureProps {
  figure: Figure;
  /** Language of the visible labels ("Bild 1" …). */
  learningLanguage: LanguageCode;
}

/**
 * Pictures of a picture question (TELC-005): one image at full width, or 2–4 images in a
 * grid, each with its label ("Bild 1" …) as in the real test. Every image has a text
 * alternative; the credit line names the source. Static files from `/public/images`
 * (precached by the service worker, so they work offline).
 */
export function ExerciseFigure({ figure, learningLanguage }: ExerciseFigureProps) {
  const single = figure.images.length === 1;
  return (
    <figure className="flex flex-col gap-2" data-testid="exercise-figure">
      <ul className={cn("grid gap-3", single ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-4")}>
        {figure.images.map((image) => (
          <li
            key={image.src}
            className="flex flex-col items-center gap-1.5 rounded-card border-2 border-border bg-white p-2"
          >
            {/* Plain <img>: static, precached files; next/image would fetch /_next/image,
                which is not available offline. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className={cn("w-auto object-contain", single ? "max-h-[38dvh]" : "h-28 sm:h-32")}
            />
            {image.label && (
              <span lang={learningLanguage} className="text-sm font-bold text-neutral-800">
                {image.label}
              </span>
            )}
          </li>
        ))}
      </ul>
      {figure.credit && <figcaption className="text-xs text-fg-muted">{figure.credit}</figcaption>}
    </figure>
  );
}
