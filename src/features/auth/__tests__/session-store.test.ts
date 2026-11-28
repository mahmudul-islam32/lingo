import { describe, expect, it, vi } from "vitest";
import { createFakeAuthClient, fakeSession } from "@/lib/supabase/testing";
import { createSessionStore } from "../session-store";

function setup(options: { enabled?: boolean; accountDevice?: boolean } = {}) {
  const fake = createFakeAuthClient();
  const loadClient = vi.fn(fake.load);
  const store = createSessionStore({
    loadClient,
    isAccountDevice: async () => options.accountDevice ?? false,
    enabled: () => options.enabled ?? true,
  });
  return { fake, store, loadClient };
}

describe("session store (PLT-010 criterion 10)", () => {
  it("with accounts disabled it is ready and never loads the client", async () => {
    const { store, loadClient } = setup({ enabled: false });
    await store.getState().init();
    expect(store.getState()).toMatchObject({ ready: true, status: "signed-out", user: null });
    expect(loadClient).not.toHaveBeenCalled();
  });

  it("restores a stored session (survives a reload)", async () => {
    const { fake, store } = setup();
    fake.auth.getSession.mockResolvedValue({
      data: { session: fakeSession({ email: "me@example.com" }) },
      error: null,
    });
    await store.getState().init();
    await store.getState().init();
    expect(fake.auth.getSession).toHaveBeenCalledTimes(1);
    expect(store.getState()).toMatchObject({
      ready: true,
      status: "signed-in",
      user: { email: "me@example.com" },
    });
  });

  it("follows refreshes, and a SIGNED_OUT it didn't ask for is expired", async () => {
    const { fake, store } = setup();
    fake.auth.getSession.mockResolvedValue({ data: { session: fakeSession() }, error: null });
    await store.getState().init();
    fake.emit("TOKEN_REFRESHED", fakeSession({ accessToken: "new" }));
    expect(store.getState().status).toBe("signed-in");
    // Refresh failed on reconnect: supabase-js drops the session.
    fake.emit("SIGNED_OUT", null);
    expect(store.getState().status).toBe("expired");
    expect(store.getState().user).not.toBeNull();
    fake.emit("SIGNED_IN", fakeSession());
    expect(store.getState().status).toBe("signed-in");
  });

  it("an account device without a stored session is expired", async () => {
    const { store } = setup({ accountDevice: true });
    await store.getState().init();
    expect(store.getState().status).toBe("expired");
  });

  it("a guest without a session is signed out", async () => {
    const { store } = setup();
    await store.getState().init();
    expect(store.getState().status).toBe("signed-out");
  });

  it("markExpired only affects a signed-in session", async () => {
    const { store } = setup();
    store.getState().markExpired();
    expect(store.getState().status).toBe("signed-out");
    store.getState().setSession(fakeSession());
    store.getState().markExpired();
    expect(store.getState().status).toBe("expired");
  });

  it("signOutLocal signs out locally and is never reported as expired", async () => {
    const { fake, store } = setup();
    fake.auth.getSession.mockResolvedValue({ data: { session: fakeSession() }, error: null });
    await store.getState().init();
    window.localStorage.setItem("polyglow-auth", "{}");
    window.localStorage.setItem("polyglow-auth-code-verifier", "x");
    window.localStorage.setItem("other", "keep");
    fake.auth.signOut.mockImplementation(async () => {
      fake.emit("SIGNED_OUT", null);
      return { error: null };
    });
    await store.getState().signOutLocal();
    expect(fake.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(store.getState()).toMatchObject({ status: "signed-out", user: null });
    expect(window.localStorage.getItem("polyglow-auth")).toBeNull();
    expect(window.localStorage.getItem("polyglow-auth-code-verifier")).toBeNull();
    expect(window.localStorage.getItem("other")).toBe("keep");
  });

  it("signOutLocal still clears the session when the request fails (offline)", async () => {
    const { fake, store } = setup();
    store.getState().setSession(fakeSession());
    window.localStorage.setItem("polyglow-auth", "{}");
    fake.auth.signOut.mockRejectedValue(new TypeError("Failed to fetch"));
    await store.getState().signOutLocal();
    expect(store.getState().status).toBe("signed-out");
    expect(window.localStorage.getItem("polyglow-auth")).toBeNull();
  });
});
