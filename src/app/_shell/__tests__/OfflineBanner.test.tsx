import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { navigationState } from "./navigation-mock";
import TabsLayout from "../../(tabs)/layout";
import OnboardingLayout from "../../onboarding/layout";
import {
  BACK_ONLINE_MS,
  BACK_ONLINE_TEXT,
  OFFLINE_TEXT,
  OfflineBanner,
  isBannerSuppressed,
} from "../OfflineBanner";

let onLine: ReturnType<typeof vi.spyOn>;

function setNetwork(online: boolean) {
  act(() => {
    onLine.mockReturnValue(online);
    window.dispatchEvent(new Event(online ? "online" : "offline"));
  });
}

const banner = () => screen.getByTestId("offline-banner");

describe("OfflineBanner (PLT-006)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigationState.pathname = "/";
    onLine = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders an empty live region while online", () => {
    render(<OfflineBanner />);
    expect(screen.getByRole("status")).toBe(banner());
    expect(banner()).toBeEmptyDOMElement();
  });

  it("shows the offline message with an icon when the connection drops", () => {
    render(<OfflineBanner />);
    setNetwork(false);
    expect(screen.getByRole("status")).toHaveTextContent(OFFLINE_TEXT);
    expect(screen.getByTestId("icon-cloud-off")).toHaveAttribute("aria-hidden", "true");
    expect(banner()).toHaveAttribute("data-mode", "offline");
  });

  it("shows 'Back online' for 3 seconds after reconnecting, then disappears", () => {
    render(<OfflineBanner />);
    setNetwork(false);
    setNetwork(true);
    expect(screen.getByRole("status")).toHaveTextContent(BACK_ONLINE_TEXT);
    expect(screen.getByTestId("icon-cloud-check")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(BACK_ONLINE_MS - 1));
    expect(banner()).toHaveTextContent(BACK_ONLINE_TEXT);
    act(() => vi.advanceTimersByTime(1));
    expect(banner()).toBeEmptyDOMElement();
  });

  it("a new offline event cancels the 'Back online' message", () => {
    render(<OfflineBanner />);
    setNetwork(false);
    setNetwork(true);
    act(() => vi.advanceTimersByTime(1000));
    setNetwork(false);
    expect(banner()).toHaveTextContent(OFFLINE_TEXT);
    act(() => vi.advanceTimersByTime(BACK_ONLINE_MS * 2));
    expect(banner()).toHaveTextContent(OFFLINE_TEXT);
  });

  it("shows the offline message on first render when opened offline", () => {
    onLine.mockReturnValue(false);
    render(<OfflineBanner />);
    expect(banner()).toHaveTextContent(OFFLINE_TEXT);
  });

  it("clears its timer on unmount", () => {
    const { unmount } = render(<OfflineBanner />);
    setNetwork(false);
    setNetwork(true);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("uses motion only through the motion-safe variant", () => {
    render(<OfflineBanner />);
    setNetwork(false);
    const animated = banner().querySelector("[class*='animate']");
    expect(animated?.className).toMatch(/(^|\s)motion-safe:animate-fade-in(\s|$)/);
    expect(animated?.className).not.toMatch(/(^|\s)animate-/);
  });

  it("is not shown on lesson routes", () => {
    navigationState.pathname = "/lesson/en-es-u1-l1";
    onLine.mockReturnValue(false);
    render(<OfflineBanner />);
    expect(banner()).toBeEmptyDOMElement();
  });

  it.each([
    ["/lesson", true],
    ["/lesson/abc", true],
    ["/lessons", false],
    ["/", false],
    ["/profile", false],
    [null, false],
  ])("isBannerSuppressed(%s) is %s", (path, expected) => {
    expect(isBannerSuppressed(path)).toBe(expected);
  });

  it("sits above <main> in the tabs layout, outside the bottom nav", () => {
    onLine.mockReturnValue(false);
    render(
      <TabsLayout>
        <h1>Learn</h1>
      </TabsLayout>,
    );
    const status = banner();
    const main = screen.getByRole("main");
    expect(main).not.toContainElement(status);
    expect(screen.getByRole("navigation", { name: "Main" })).not.toContainElement(status);
    expect(status.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("is rendered by the onboarding layout", () => {
    onLine.mockReturnValue(false);
    render(
      <OnboardingLayout>
        <main>
          <h1>Get started</h1>
        </main>
      </OnboardingLayout>,
    );
    expect(banner()).toHaveTextContent(OFFLINE_TEXT);
  });
});
