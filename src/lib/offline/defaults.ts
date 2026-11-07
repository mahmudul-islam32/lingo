/**
 * Default records for a new guest (ARCHITECTURE §6). Values come from the contracts;
 * the few that the contracts don't define yet are listed in CR-002
 * (docs/architecture/contract-requests.md).
 */
import {
  GAME_CONFIG,
  type HeartsState,
  type Identity,
  type Profile,
  type Settings,
} from "@/contracts";

/**
 * Placeholder name shown until the learner picks one (`DisplayNameSchema` requires a
 * name). Not personal data. CR-002 asks whether this should become `null`.
 */
export const DEFAULT_GUEST_DISPLAY_NAME = "Learner";

/** Toggle defaults applied when settings are first created at onboarding (CR-002). */
export const DEFAULT_SETTINGS_TOGGLES: Pick<
  Settings,
  "soundEffectsEnabled" | "speakingExercisesEnabled"
> = {
  soundEffectsEnabled: true,
  speakingExercisesEnabled: true,
};

export function createGuestIdentity(guestId: string): Identity {
  return { kind: "guest", guestId };
}

export function identityId(identity: Identity): string {
  return identity.kind === "guest" ? identity.guestId : identity.userId;
}

/** New profile: no name chosen (placeholder), initials avatar, onboarding not complete. */
export function createDefaultProfile(id: string, now: Date): Profile {
  const iso = now.toISOString();
  return {
    id,
    displayName: DEFAULT_GUEST_DISPLAY_NAME,
    avatar: { kind: "initials" },
    joinedAt: iso,
    onboardedAt: null,
    updatedAt: iso,
  };
}

/** Full hearts (PD-003): `refillStartedAt` is null exactly when hearts are full. */
export function createFullHearts(now: Date): HeartsState {
  return { current: GAME_CONFIG.maxHearts, refillStartedAt: null, updatedAt: now.toISOString() };
}
