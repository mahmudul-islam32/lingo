import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WordBank } from "./WordBank";

/** random() ≈ 1 keeps the content order, so tests can rely on positions. */
const keepOrder = () => 0.999;

function setup(tiles = ["el", "gato", "come", "la"], disabled = false) {
  const onChange = vi.fn<(texts: string[]) => void>();
  const user = userEvent.setup();
  const view = render(
    <WordBank
      tiles={tiles}
      tileLang="es"
      disabled={disabled}
      onChange={onChange}
      random={keepOrder}
    />,
  );
  const answerLine = screen.getByRole("group", { name: "Your answer" });
  const bank = screen.getByRole("group", { name: "Word bank" });
  return { onChange, user, view, answerLine, bank };
}

/** Bank children in DOM order: tile text or "_" for a placeholder. */
function bankLayout(bank: HTMLElement): string[] {
  return Array.from(bank.children).map((child) =>
    child.getAttribute("aria-hidden") === "true"
      ? `_${child.textContent}`
      : (child.textContent ?? ""),
  );
}

describe("WordBank", () => {
  it("shows every tile as an 'Add <word>' button with the tile language, plus the hint", () => {
    const { bank, answerLine } = setup();
    const buttons = within(bank).getAllByRole("button");
    expect(buttons.map((b) => b.getAttribute("aria-label"))).toEqual([
      "Add el",
      "Add gato",
      "Add come",
      "Add la",
    ]);
    buttons.forEach((b) => expect(b).toHaveAttribute("lang", "es"));
    expect(within(answerLine).getByText("Tap the words")).toBeInTheDocument();
  });

  it("shuffles the tiles with the injected random source", () => {
    const onChange = vi.fn();
    render(
      <WordBank
        tiles={["a", "b", "c", "d"]}
        tileLang="en"
        disabled={false}
        onChange={onChange}
        random={() => 0}
      />,
    );
    const bank = screen.getByRole("group", { name: "Word bank" });
    expect(bankLayout(bank)).toEqual(["b", "c", "d", "a"]);
  });

  it("tapping a bank tile appends it to the answer line and leaves a same-text placeholder", async () => {
    const { user, bank, answerLine, onChange } = setup();
    await user.click(screen.getByRole("button", { name: "Add gato" }));
    await user.click(screen.getByRole("button", { name: "Add el" }));

    expect(
      within(answerLine)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["gato", "el"]);
    expect(within(answerLine).getByRole("button", { name: "Remove gato" })).toHaveAttribute(
      "lang",
      "es",
    );
    expect(within(answerLine).queryByText("Tap the words")).not.toBeInTheDocument();
    // Bank keeps its layout: placeholders (aria-hidden, invisible copy of the word) in place.
    expect(bankLayout(bank)).toEqual(["_el", "_gato", "come", "la"]);
    expect(within(bank).getAllByTestId("word-bank-placeholder")[0]?.firstElementChild).toHaveClass(
      "invisible",
    );
    expect(within(bank).getAllByRole("button")).toHaveLength(2);
    expect(onChange).toHaveBeenLastCalledWith(["gato", "el"]);
  });

  it("tapping an answer tile returns it to its original place in the bank", async () => {
    const { user, bank, answerLine, onChange } = setup();
    await user.click(screen.getByRole("button", { name: "Add come" }));
    await user.click(screen.getByRole("button", { name: "Add el" }));
    await user.click(screen.getByRole("button", { name: "Remove come" }));

    expect(bankLayout(bank)).toEqual(["_el", "gato", "come", "la"]);
    expect(
      within(answerLine)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["el"]);
    expect(onChange).toHaveBeenLastCalledWith(["el"]);
  });

  it("treats repeated words as independent tiles", async () => {
    const { user, bank, answerLine, onChange } = setup(["la", "casa", "la"]);
    const [firstLa, secondLa] = within(bank).getAllByRole("button", { name: "Add la" });
    await user.click(secondLa as HTMLElement);
    expect(bankLayout(bank)).toEqual(["la", "casa", "_la"]);
    await user.click(firstLa as HTMLElement);
    expect(onChange).toHaveBeenLastCalledWith(["la", "la"]);

    // Removing the first answer "la" returns the tile from slot 3, not slot 1.
    const answerTiles = within(answerLine).getAllByRole("button", { name: "Remove la" });
    await user.click(answerTiles[0] as HTMLElement);
    expect(bankLayout(bank)).toEqual(["_la", "casa", "la"]);
    expect(onChange).toHaveBeenLastCalledWith(["la"]);
  });

  it("reports the ordered answer, and an empty list once the line is cleared", async () => {
    const { user, onChange } = setup();
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Add el" }));
    expect(onChange).toHaveBeenLastCalledWith(["el"]);
    await user.click(screen.getByRole("button", { name: "Remove el" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  describe("keyboard", () => {
    it("puts every tile in the tab order and moves tiles with Enter", async () => {
      const { user, answerLine, onChange } = setup(["el", "gato"]);
      await user.tab();
      expect(answerLine).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("button", { name: "Add el" })).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(onChange).toHaveBeenLastCalledWith(["el"]);
      // Focus moved to the next available bank tile.
      expect(screen.getByRole("button", { name: "Add gato" })).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(onChange).toHaveBeenLastCalledWith(["el", "gato"]);
      // Bank is empty: focus lands on the answer line.
      expect(answerLine).toHaveFocus();
      await user.tab();
      expect(screen.getByRole("button", { name: "Remove el" })).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(onChange).toHaveBeenLastCalledWith(["gato"]);
      expect(screen.getByRole("button", { name: "Remove gato" })).toHaveFocus();
    });

    it("moves a tile exactly once with Space", async () => {
      const { user, onChange } = setup(["el", "gato", "come"]);
      screen.getByRole("button", { name: "Add el" }).focus();
      await user.keyboard(" ");
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith(["el"]);
      expect(screen.getByRole("button", { name: "Add gato" })).toHaveFocus();
      screen.getByRole("button", { name: "Remove el" }).focus();
      await user.keyboard(" ");
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenLastCalledWith([]);
    });

    it("calls preventDefault on handled keys (LES-002 keyboard contract)", () => {
      const { answerLine } = setup(["el", "gato"]);
      const tile = screen.getByRole("button", { name: "Add el" });
      expect(fireEvent.keyDown(tile, { key: "Enter" })).toBe(false);
      expect(fireEvent.keyDown(answerLine, { key: "Backspace" })).toBe(false);
    });

    it("Backspace on the answer line removes the last tile back to the bank", async () => {
      const { user, answerLine, bank, onChange } = setup();
      await user.click(screen.getByRole("button", { name: "Add la" }));
      await user.click(screen.getByRole("button", { name: "Add gato" }));
      answerLine.focus();
      await user.keyboard("{Backspace}");
      expect(onChange).toHaveBeenLastCalledWith(["la"]);
      expect(bankLayout(bank)).toEqual(["el", "gato", "come", "_la"]);
      expect(answerLine).toHaveFocus();
      await user.keyboard("{Backspace}");
      expect(onChange).toHaveBeenLastCalledWith([]);
      const calls = onChange.mock.calls.length;
      await user.keyboard("{Backspace}");
      expect(onChange).toHaveBeenCalledTimes(calls);
    });
  });

  describe("screen readers", () => {
    it("labels the answer line and announces its text after each change", async () => {
      const { user, answerLine } = setup();
      expect(answerLine).toHaveAttribute("tabindex", "0");
      const live = screen.getByRole("status");
      expect(live).toHaveAttribute("aria-live", "polite");
      expect(live).toHaveTextContent("");
      await user.click(screen.getByRole("button", { name: "Add el" }));
      await user.click(screen.getByRole("button", { name: "Add gato" }));
      expect(live).toHaveTextContent("Your answer: el gato");
      await user.click(screen.getByRole("button", { name: "Remove el" }));
      expect(live).toHaveTextContent("Your answer: gato");
      await user.click(screen.getByRole("button", { name: "Remove gato" }));
      expect(live).toHaveTextContent("Your answer is empty");
    });

    it("hides placeholders from assistive technology", async () => {
      const { user, bank } = setup();
      await user.click(screen.getByRole("button", { name: "Add el" }));
      expect(within(bank).getByTestId("word-bank-placeholder")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });

  describe("disabled", () => {
    it("blocks tapping, keyboard moves and Backspace", async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      const { rerender } = render(
        <WordBank
          tiles={["el", "gato"]}
          tileLang="es"
          disabled={false}
          onChange={onChange}
          random={keepOrder}
        />,
      );
      await user.click(screen.getByRole("button", { name: "Add el" }));
      rerender(
        <WordBank
          tiles={["el", "gato"]}
          tileLang="es"
          disabled
          onChange={onChange}
          random={keepOrder}
        />,
      );
      onChange.mockClear();

      const add = screen.getByRole("button", { name: "Add gato" });
      const remove = screen.getByRole("button", { name: "Remove el" });
      expect(add).toBeDisabled();
      expect(remove).toBeDisabled();
      await user.click(add);
      await user.click(remove);
      fireEvent.keyDown(add, { key: "Enter" });
      const line = screen.getByRole("group", { name: "Your answer" });
      expect(line).toHaveAttribute("tabindex", "-1");
      expect(line).toHaveAttribute("aria-disabled", "true");
      fireEvent.keyDown(line, { key: "Backspace" });
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Remove el" })).toBeInTheDocument();
    });
  });

  describe("layout and motion (375 px)", () => {
    it("wraps the answer line and the bank, and tiles are at least 44 px tall", async () => {
      const tiles = Array.from({ length: 12 }, (_, i) => `palabra${i}`);
      const { user, bank, answerLine } = setup(tiles);
      expect(bank).toHaveClass("flex-wrap", "min-w-0");
      expect(answerLine).toHaveClass("flex-wrap");
      await user.click(screen.getByRole("button", { name: "Add palabra0" }));
      for (const tile of screen.getAllByRole("button")) {
        expect(tile).toHaveClass("min-h-11", "max-w-full");
      }
      for (const placeholder of within(bank).getAllByTestId("word-bank-placeholder")) {
        expect(placeholder).toHaveClass("min-h-11");
      }
    });

    it("animates only through motion-safe classes (none under prefers-reduced-motion)", () => {
      setup();
      for (const tile of screen.getAllByRole("button")) {
        const animated = Array.from(tile.classList).filter((c) => c.includes("animate"));
        expect(animated.length).toBeGreaterThan(0);
        animated.forEach((c) => expect(c.startsWith("motion-safe:")).toBe(true));
      }
    });
  });
});
