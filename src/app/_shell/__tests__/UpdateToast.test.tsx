import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui";
import { navigationState } from "./navigation-mock";
import {
  SKIP_WAITING_MESSAGE,
  applyUpdate,
  resetUpdateReloadGuard,
  watchForWaitingWorker,
} from "../../_pwa/sw-update";
import { UPDATE_ACTION, UPDATE_TITLE, UpdateToast } from "../UpdateToast";

type FakeWorker = ServiceWorker & {
  postMessage: ReturnType<typeof vi.fn>;
  setState(s: ServiceWorkerState): void;
};

function fakeWorker(initial: ServiceWorkerState = "installed"): FakeWorker {
  const target = new EventTarget();
  let state = initial;
  const worker = Object.assign(target, {
    postMessage: vi.fn(),
    setState(next: ServiceWorkerState) {
      state = next;
      target.dispatchEvent(new Event("statechange"));
    },
  });
  Object.defineProperty(worker, "state", { get: () => state });
  return worker as unknown as FakeWorker;
}

type FakeRegistration = ServiceWorkerRegistration & {
  waiting: ServiceWorker | null;
  active: ServiceWorker | null;
  installing: ServiceWorker | null;
};

function fakeRegistration(init: Partial<FakeRegistration> = {}): FakeRegistration {
  const reg = new EventTarget() as FakeRegistration;
  reg.waiting = init.waiting ?? null;
  reg.active = init.active ?? null;
  reg.installing = init.installing ?? null;
  return reg;
}

function fakeContainer(registration: ServiceWorkerRegistration) {
  const target = new EventTarget() as EventTarget & { ready: Promise<ServiceWorkerRegistration> };
  target.ready = Promise.resolve(registration);
  return target as unknown as ServiceWorkerContainer;
}

/** Simulates the browser finding and installing a new version. */
function installUpdate(reg: FakeRegistration) {
  const next = fakeWorker("installing");
  reg.installing = next;
  reg.dispatchEvent(new Event("updatefound"));
  reg.installing = null;
  reg.waiting = next;
  next.setState("installed");
  return next;
}

const flush = () => act(async () => {});
const toast = () => screen.queryByText(UPDATE_TITLE);

describe("watchForWaitingWorker", () => {
  it("reports a worker that was already waiting", async () => {
    const waiting = fakeWorker();
    const onWaiting = vi.fn();
    watchForWaitingWorker(
      fakeContainer(fakeRegistration({ waiting, active: fakeWorker("activated") })),
      onWaiting,
    );
    await flush();
    expect(onWaiting).toHaveBeenCalledWith(waiting);
  });

  it("reports an update found later, but never the first install", async () => {
    const reg = fakeRegistration();
    const onWaiting = vi.fn();
    const stop = watchForWaitingWorker(fakeContainer(reg), onWaiting);
    await flush();
    expect(onWaiting).not.toHaveBeenCalled();

    reg.active = fakeWorker("activated");
    const next = installUpdate(reg);
    expect(onWaiting).toHaveBeenCalledWith(next);

    stop();
    installUpdate(reg);
    expect(onWaiting).toHaveBeenCalledTimes(1);
  });
});

describe("applyUpdate", () => {
  beforeEach(() => resetUpdateReloadGuard());

  it("posts SKIP_WAITING and reloads once on controllerchange", () => {
    const container = fakeContainer(fakeRegistration());
    const worker = fakeWorker("installed");
    const reload = vi.fn();
    applyUpdate(container, worker, reload);
    expect(worker.postMessage).toHaveBeenCalledWith(SKIP_WAITING_MESSAGE);
    expect(reload).not.toHaveBeenCalled();

    container.dispatchEvent(new Event("controllerchange"));
    container.dispatchEvent(new Event("controllerchange"));
    expect(reload).toHaveBeenCalledTimes(1);

    // A second click after the reload started never reloads twice.
    applyUpdate(container, worker, reload);
    container.dispatchEvent(new Event("controllerchange"));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("reloads right away when another tab already activated the worker", () => {
    const worker = fakeWorker("activated");
    const reload = vi.fn();
    applyUpdate(fakeContainer(fakeRegistration()), worker, reload);
    expect(worker.postMessage).not.toHaveBeenCalled();
    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe("UpdateToast (PLT-005 criteria 7-9)", () => {
  beforeEach(() => {
    navigationState.pathname = "/";
    resetUpdateReloadGuard();
  });
  afterEach(() => vi.restoreAllMocks());

  function setup() {
    const reg = fakeRegistration({ active: fakeWorker("activated") });
    const container = fakeContainer(reg);
    const reload = vi.fn();
    const utils = render(
      <ToastProvider>
        <UpdateToast container={container} reload={reload} />
      </ToastProvider>,
    );
    return { ...utils, reg, container, reload };
  }

  it("renders nothing without a service worker (dev and tests)", () => {
    render(
      <ToastProvider>
        <UpdateToast />
      </ToastProvider>,
    );
    expect(toast()).not.toBeInTheDocument();
  });

  it("shows a sticky polite toast; Refresh activates the worker and reloads once", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { reg, container, reload } = setup();
    await flush();
    expect(toast()).not.toBeInTheDocument();

    let next!: FakeWorker;
    act(() => {
      next = installUpdate(reg);
    });
    expect(toast()).toBeInTheDocument();
    expect(toast()!.closest('[role="status"]')).toHaveAttribute("aria-live", "polite");

    // Sticky: still there long after the default 5 s.
    act(() => vi.advanceTimersByTime(60_000));
    expect(toast()).toBeInTheDocument();

    // Keyboard-operable.
    const refresh = screen.getByRole("button", { name: UPDATE_ACTION });
    refresh.focus();
    await user.keyboard("{Enter}");
    expect(next.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });

    act(() => {
      container.dispatchEvent(new Event("controllerchange"));
    });
    expect(reload).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("never shows on /lesson/*, and appears after leaving the lesson", async () => {
    navigationState.pathname = "/lesson/es-u1-l1";
    const { reg, rerender, container, reload } = setup();
    await flush();
    act(() => void installUpdate(reg));
    expect(toast()).not.toBeInTheDocument();

    navigationState.pathname = "/";
    rerender(
      <ToastProvider>
        <UpdateToast container={container} reload={reload} />
      </ToastProvider>,
    );
    expect(toast()).toBeInTheDocument();

    // Entering a lesson withdraws it again; leaving brings it back.
    navigationState.pathname = "/lesson/es-u1-l2";
    rerender(
      <ToastProvider>
        <UpdateToast container={container} reload={reload} />
      </ToastProvider>,
    );
    expect(toast()).not.toBeInTheDocument();
    expect(reload).not.toHaveBeenCalled();
  });
});
