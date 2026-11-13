"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn, VisuallyHidden } from "@/components/ui";
import type { LanguageCode } from "@/contracts";
import {
  add,
  answerTexts,
  createWordBank,
  isPlaced,
  remove,
  removeLast,
  type WordBankState,
} from "./word-bank-model";

export interface WordBankProps {
  /** Tile texts from the content (answer words plus distractors); shuffled once on mount. */
  tiles: string[];
  /** Language of the tile texts, set as the `lang` attribute on every tile. */
  tileLang: LanguageCode;
  /** Locks the tiles (after "Check"). */
  disabled: boolean;
  /** Called after every change with the ordered texts on the answer line. */
  onChange: (orderedTexts: string[]) => void;
  /** Random source for the shuffle (tests inject a fixed one). */
  random?: () => number;
}

/** Where focus should go after the DOM changes (set in handlers, applied after render). */
type FocusTarget = { kind: "bank"; slot: number } | { kind: "answer"; index: number } | "line";

/**
 * Tile height ≥ 44 px (CTO-004 `md` control size). Long words (German compounds such as
 * "Krankenversicherungskarte") wrap inside the tile instead of widening it (LES-014):
 * `overflow-wrap: anywhere` also lowers the tile's min-content width, so a flex row can
 * shrink it to the container; `hyphens: auto` uses the tile's `lang` to hyphenate nicely.
 * Text is rendered exactly as authored (never case-transformed: German noun capitals).
 */
const tileClasses =
  "inline-flex min-h-11 max-w-full min-w-0 items-center justify-center rounded-control " +
  "border-2 px-3 py-1.5 text-center text-base font-semibold wrap-anywhere hyphens-auto";

/** One ruled line every 3.25 rem (tile height + gap). */
const ruledLines =
  "bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_3.125rem," +
  "var(--color-border)_3.125rem,var(--color-border)_3.25rem)]";

/**
 * Reusable word bank (LES-005, reused by LES-007): an answer line above a bank of tiles.
 * Tap/Enter/Space on a bank tile appends it to the answer line and leaves a same-size
 * placeholder; tap on an answer tile returns it to its slot; Backspace on the answer line
 * removes the last tile. Tiles are tracked by slot index, so duplicate words are independent.
 */
export function WordBank({ tiles, tileLang, disabled, onChange, random }: WordBankProps) {
  const [state, setState] = useState<WordBankState>(() => createWordBank(tiles, random));
  const [announcement, setAnnouncement] = useState("");
  const lineRef = useRef<HTMLDivElement>(null);
  const bankRefs = useRef(new Map<number, HTMLButtonElement>());
  const answerRefs = useRef(new Map<number, HTMLButtonElement>());
  const pendingFocus = useRef<FocusTarget | null>(null);

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    if (target === "line") lineRef.current?.focus();
    else if (target.kind === "bank") bankRefs.current.get(target.slot)?.focus();
    else answerRefs.current.get(target.index)?.focus();
  }, [state]);

  function commit(next: WordBankState, focus: FocusTarget | null) {
    if (next === state) return;
    pendingFocus.current = focus;
    setState(next);
    const texts = answerTexts(next);
    setAnnouncement(texts.length ? `Your answer: ${texts.join(" ")}` : "Your answer is empty");
    onChange(texts);
  }

  /** Next bank slot still available after `from` (wrapping), else the answer line. */
  function nextBankFocus(next: WordBankState, from: number): FocusTarget {
    const count = next.slots.length;
    for (let step = 1; step < count; step += 1) {
      const slot = (from + step) % count;
      if (!isPlaced(next, slot)) return { kind: "bank", slot };
    }
    return "line";
  }

  /** Bank tile → end of the answer line. Focus follows only if the tile had it. */
  function addTile(slot: number, moveFocus: boolean) {
    if (disabled) return;
    const next = add(state, slot);
    commit(next, moveFocus ? nextBankFocus(next, slot) : null);
  }

  /** Answer tile → back to its slot in the bank. */
  function removeTile(index: number, moveFocus: boolean) {
    if (disabled) return;
    const next = remove(state, index);
    let focus: FocusTarget | null = null;
    if (moveFocus) {
      focus = next.placed.length
        ? { kind: "answer", index: Math.min(index, next.placed.length - 1) }
        : "line";
    }
    commit(next, focus);
  }

  function hasFocus(event: MouseEvent<HTMLButtonElement>): boolean {
    return event.currentTarget === event.currentTarget.ownerDocument.activeElement;
  }

  /**
   * Enter/Space are handled on keydown (not by the native click) so the event can be
   * `preventDefault`ed (LES-002 keyboard contract). Tile keyup for Space is also
   * cancelled so the browser doesn't fire a second click on the newly focused tile.
   */
  function tileKeyDown(event: KeyboardEvent<HTMLButtonElement>, action: () => void) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) action();
    }
  }

  function handleLineKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Backspace" || disabled) return;
    event.preventDefault();
    if (!state.placed.length) return;
    const next = removeLast(state);
    // Keep focus on the line when it was there; else on the new last answer tile.
    const focus: FocusTarget =
      event.target === event.currentTarget || !next.placed.length
        ? "line"
        : { kind: "answer", index: next.placed.length - 1 };
    commit(next, focus);
  }

  const answer = answerTexts(state);

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div
        ref={lineRef}
        role="group"
        aria-label="Your answer"
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleLineKeyDown}
        className={cn(
          "focus-visible:focus-ring flex min-h-[6.5rem] w-full flex-wrap content-start items-start",
          "gap-x-2 gap-y-1.5 rounded-control py-1",
          ruledLines,
        )}
      >
        {answer.length === 0 && (
          <span className="flex min-h-11 items-center px-1 text-fg-muted">Tap the words</span>
        )}
        {state.placed.map((slot, index) => {
          const tile = state.slots[slot];
          if (!tile) return null;
          return (
            <Tile
              key={tile.id}
              ref={(node) => trackNode(answerRefs, index, node)}
              lang={tileLang}
              label={`Remove ${tile.text}`}
              disabled={disabled}
              onClick={(event) => removeTile(index, hasFocus(event))}
              onKeyDown={(event) => tileKeyDown(event, () => removeTile(index, true))}
            >
              {tile.text}
            </Tile>
          );
        })}
      </div>

      <div
        role="group"
        aria-label="Word bank"
        className="flex w-full min-w-0 flex-wrap justify-center gap-2"
      >
        {state.slots.map((tile, slot) =>
          isPlaced(state, slot) ? (
            <span
              key={tile.id}
              aria-hidden="true"
              data-testid="word-bank-placeholder"
              lang={tileLang}
              className={cn(tileClasses, "border-border bg-surface")}
            >
              <span className="invisible">{tile.text}</span>
            </span>
          ) : (
            <Tile
              key={tile.id}
              ref={(node) => trackNode(bankRefs, slot, node)}
              lang={tileLang}
              label={`Add ${tile.text}`}
              disabled={disabled}
              onClick={(event) => addTile(slot, hasFocus(event))}
              onKeyDown={(event) => tileKeyDown(event, () => addTile(slot, true))}
            >
              {tile.text}
            </Tile>
          ),
        )}
      </div>

      <VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </VisuallyHidden>
    </div>
  );
}

function trackNode(
  map: { current: Map<number, HTMLButtonElement> },
  key: number,
  node: HTMLButtonElement | null,
) {
  if (node) map.current.set(key, node);
  else map.current.delete(key);
}

/** Cancels the native Space activation on keyup (keydown already handled the move). */
function cancelSpaceKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.key === " ") event.preventDefault();
}

interface TileProps {
  ref: (node: HTMLButtonElement | null) => void;
  lang: LanguageCode;
  label: string;
  disabled: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}

/** A word tile: native button in tab order, ≥ 44 px, fades in (motion-safe only, 150 ms). */
function Tile({ ref, lang, label, disabled, onClick, onKeyDown, children }: TileProps) {
  return (
    <button
      ref={ref}
      type="button"
      lang={lang}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onKeyUp={cancelSpaceKeyUp}
      className={cn(
        tileClasses,
        "border-border-strong bg-surface-raised text-fg shadow-sm select-none",
        "focus-visible:focus-ring motion-safe:animate-fade-in motion-safe:transition-colors",
        "enabled:hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <span className="min-w-0">{children}</span>
    </button>
  );
}
