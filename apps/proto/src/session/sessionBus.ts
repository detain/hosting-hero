/**
 * session/sessionBus — the shared handle between the app shell and the
 * SessionPanel (slice-(d), MODULE-STATUS gap "session build").
 *
 * App.vue owns the boot switch (entering the SESSION view re-boots the ONE
 * client with the session riders — the worker's boot branch stops the
 * previous runner, so re-boot is protocol-native, never a second worker).
 * The panel needs the client to arm the intent door and to halt the run;
 * it must NOT reach into the shell. This shallowRef singleton is the seam,
 * mirroring the i18n/eraState shared-ref law.
 *
 * `host` is null for the real browser Worker; under the FakeWorkerLike
 * fallback it exposes `pump()` so the panel (and tests) can step frames
 * without timers — the same user-gesture law the G4 panel follows.
 */
import { shallowRef } from "vue";
import type { SimClient } from "../bridge/simClient";

/** Structural view of "a host that can be stepped by hand" (the fake). */
export interface SessionPumpHost {
  pump(frames?: number, dtMs?: number): void;
}

export interface SessionHandle {
  readonly client: SimClient;
  readonly host: SessionPumpHost | null;
}

export const sessionHandle = shallowRef<SessionHandle | null>(null);

/** App.vue calls this when the SESSION view boots the riders onto the wire. */
export function setSessionHandle(next: SessionHandle | null): void {
  sessionHandle.value = next;
}

/** App.vue calls this when the shell leaves SESSION (and on unmount). */
export function clearSessionHandle(): void {
  sessionHandle.value = null;
}

/** Pump-host detection: a FakeWorkerLike exposes `pump`; a real Worker doesn't. */
export function asPumpHost(candidate: unknown): SessionPumpHost | null {
  return typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as { pump?: unknown }).pump === "function"
    ? (candidate as SessionPumpHost)
    : null;
}
