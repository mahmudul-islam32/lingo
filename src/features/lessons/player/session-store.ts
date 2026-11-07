/**
 * Zustand store wrapping the pure session reducer (ARCHITECTURE §5: ephemeral lesson
 * session, not persisted). One store per mounted player, so two players (or two tests)
 * never share state and an unfinished lesson is discarded on unmount.
 */
import { createStore, useStore, type StoreApi } from "zustand";
import {
  createPlayerState,
  sessionReducer,
  type CreatePlayerStateInput,
  type PlayerState,
  type SessionAction,
} from "./session-reducer";

export interface SessionStore {
  state: PlayerState;
  dispatch: (action: SessionAction) => void;
}

export type SessionStoreApi = StoreApi<SessionStore>;

export function createSessionStore(input: CreatePlayerStateInput): SessionStoreApi {
  return createStore<SessionStore>()((set) => ({
    state: createPlayerState(input),
    dispatch: (action) => set((store) => ({ state: sessionReducer(store.state, action) })),
  }));
}

/** Reads the player state; re-renders only when the reducer returns a new state. */
export function usePlayerState(store: SessionStoreApi): PlayerState {
  return useStore(store, (s) => s.state);
}
