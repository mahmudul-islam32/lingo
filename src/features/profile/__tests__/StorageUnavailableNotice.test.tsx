import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import { openLocalSession } from "@/lib/offline";
import { GuestProfileBootstrap } from "../GuestProfileBootstrap";
import { createGuestProfileStore } from "../guest-profile-store";
import { STORAGE_NOTICE_TEXT } from "../StorageUnavailableNotice";

describe("GuestProfileBootstrap + StorageUnavailableNotice", () => {
  it("creates the guest on mount and shows no notice when storage persists", async () => {
    const store = createGuestProfileStore({
      loadSession: () => openLocalSession({ indexedDB: new IDBFactory(), IDBKeyRange }),
    });
    render(<GuestProfileBootstrap store={store} />);
    await waitFor(() => expect(store.getState().status).toBe("ready"));
    expect(store.getState().profile).not.toBeNull();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows a dismissible status notice when storage is in memory", async () => {
    const store = createGuestProfileStore({
      loadSession: () => openLocalSession({ forceMemory: true }),
    });
    render(<GuestProfileBootstrap store={store} />);
    const notice = await screen.findByRole("status");
    expect(notice).toHaveTextContent(STORAGE_NOTICE_TEXT);

    // A native <button>, so it is focusable and activates with Enter/Space.
    const dismiss = screen.getByRole("button", { name: "Dismiss" });
    expect(dismiss).toHaveAttribute("type", "button");
    fireEvent.click(dismiss);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    // Learning continues: the guest is still available.
    expect(store.getState().status).toBe("ready");
  });
});
