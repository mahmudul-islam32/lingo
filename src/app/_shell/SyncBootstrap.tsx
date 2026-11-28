"use client";

import { useEffect } from "react";
import { onAccountSwitched, sessionStore } from "@/features/auth";
import { configureSyncEngine, getSyncEngine, startSyncTriggers } from "@/lib/sync";

/**
 * Starts the sync engine once per tab (PLT-014). A no-op without the accounts flag: no
 * engine, no request. Wires it to the session: a refused session marks it `expired`
 * (criterion 5) and a new log-in resumes the engine; after a guest → account switch
 * (PLT-013) it syncs at once.
 */
export function SyncBootstrap() {
  useEffect(() => {
    configureSyncEngine({ onSessionExpired: () => sessionStore.getState().markExpired() });
    const engine = getSyncEngine();
    if (!engine) return;
    const stop = startSyncTriggers(engine);
    let last = sessionStore.getState().status;
    const offSession = sessionStore.subscribe((state) => {
      if (state.status === "signed-in" && last !== "signed-in") {
        engine.resume();
        void engine.syncNow();
      }
      last = state.status;
    });
    // Not awaited: the switch's success screen never waits for the network.
    const offSwitch = onAccountSwitched(() => {
      engine.resume();
      void engine.syncNow();
    });
    return () => {
      stop();
      offSession();
      offSwitch();
    };
  }, []);
  return null;
}
