/**
 * Main-thread side of the worker bridge.
 *
 * The bridge knows nothing about engines — only about the protocol envelope.
 * It accepts any `WorkerLike` so the same client can drive a real Web Worker
 * in the browser and an in-process fake in vitest (headless protocol tests).
 *
 * Renderer contract (§3.1): this is the ONLY inbound data path for the world
 * view. Nothing else may claim sim state, and nothing writes back except
 * `sendIntent` (discrete, clock-typed actions entering the input log).
 */
import {
  assertFromWorker,
  decodeProjection,
  type BootBuildWire,
  type BootCorpusWire,
  type SimProjection,
  type SpeedX,
  type WireIntentPayload,
} from "../shared/protocol";
import { type ClockKind, type EntityId } from "@hh/sim-core";

/** Minimal structural view of a Worker (or an in-process test fake). */
export interface WorkerLike {
  postMessage(message: unknown): void;
  set onmessage(handler: ((event: { data: unknown }) => void) | null);
  set onerror(handler: ((event: { message?: string }) => void) | null);
  terminate?(): void;
}

export interface SimClientEvents {
  onReady?(info: { engineVersion: string; runnerId: string }): void;
  onProjection?(projection: SimProjection): void;
  onFault?(message: string): void;
}

export class SimClient {
  private seq = 0;
  private destroyed = false;

  constructor(
    private readonly worker: WorkerLike,
    private readonly events: SimClientEvents,
  ) {
    this.worker.onmessage = (event) => this.handle(event.data);
    this.worker.onerror = (event) => {
      this.events.onFault?.(event.message ?? "worker error");
    };
  }

  /** `corpus` (WORKER-CORPUS leg, additive protocol-v1): a shipped-slice
   *  citation that boots a sim-core runner in corpus drive mode
   *  (`shared/corpusHost.ts` builds the authority worker-side). Omitted ⇒
   *  the key is never posted — legacy boots ride the identical wire.
   *  `build` (D7 rider, ADR-0014 #D7, same additive law and the same
   *  positions-1-3-unchanged shape @1165368 set): optional opening build
   *  state (door hands capacity + structural board edges) forwarded to the
   *  sim-core runner. Omitted ⇒ never posted; both riders are sim-core-only
   *  (mock boot + rider is a wiring bug the worker hosts fault loud). */
  boot(
    seed: string,
    speedX: SpeedX = 1,
    runnerKind: "mock" | "sim-core" = "mock",
    corpus?: BootCorpusWire,
    build?: BootBuildWire,
  ): void {
    this.worker.postMessage({
      kind: "boot",
      protocol: 1,
      seed,
      speedX,
      runnerKind,
      ...(corpus === undefined ? {} : { corpus }),
      ...(build === undefined ? {} : { build }),
    });
  }

  setSpeed(speedX: SpeedX): void {
    this.worker.postMessage({ kind: "speed", protocol: 1, speedX });
  }

  /** Discrete player action → input log (gestures never reach the sim, §4.2). */
  sendSlider(control: string, valueFixed: bigint, clock: ClockKind = "sim"): void {
    this.sendIntent(clock, { kind: "slider", control, value: valueFixed.toString() });
  }

  sendVerb(verb: string, target: EntityId | null, valueFixed: bigint | null, clock: ClockKind = "sim"): void {
    this.sendIntent(clock, {
      kind: "verb",
      verb,
      target,
      value: valueFixed?.toString() ?? null,
    });
  }

  /** Door-bound player verb (contract #10): the args record crosses as flat
   *  scalars and the runner stamps it for the NEXT macro-tick — execute-or-
   *  refuse at the intent door, never a silent drop.
   *
   *  E2b bigint-wire law: a caller may hand a REAL bigint (MoneyUnit-family
   *  fields like `newPriceMicroUsd`); it is stringified HERE, at the send
   *  boundary — the same decimal-string discipline `sendSlider`/`sendVerb`
   *  already apply — and the worker side revives it through
   *  `wireIntentToPlayerIntent`. JSON can carry no bigint; both directions of
   *  this seam are what makes a price survive the hop. */
  sendPlayerVerb(args: Readonly<Record<string, string | number | bigint | null>>, clock: ClockKind = "sim"): void {
    const wire: Record<string, string | number | null> = {};
    for (const [field, value] of Object.entries(args)) {
      wire[field] = typeof value === "bigint" ? value.toString() : value;
    }
    this.sendIntent(clock, { kind: "player-verb", args: Object.freeze(wire) });
  }

  halt(): void {
    this.worker.postMessage({ kind: "halt", protocol: 1 });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.halt();
    this.worker.onmessage = null;
    this.worker.onerror = null;
    this.worker.terminate?.();
  }

  private sendIntent(clock: ClockKind, payload: WireIntentPayload): void {
    this.seq += 1;
    this.worker.postMessage({
      kind: "intent",
      protocol: 1,
      seq: this.seq,
      clock,
      // Arrival order is host-stamped for MP (§3.2); the mock ignores it —
      // presentation-side constant, never sim-authoritative.
      atUs: "0",
      origin: "player",
      payload,
    });
  }

  private handle(data: unknown): void {
    if (this.destroyed) return;
    const message = assertFromWorker(data);
    switch (message.kind) {
      case "ready":
        this.events.onReady?.({ engineVersion: message.engineVersion, runnerId: message.runnerId });
        return;
      case "projection": {
        const decoded = decodeSafe(message.projection);
        if (decoded !== null) this.events.onProjection?.(decoded);
        return;
      }
      case "fault":
        this.events.onFault?.(message.message);
        return;
    }
  }
}

/** Decode boundary: a bad frame must never take the frame loop down — the
 *  renderer keeps painting the last good projection while the fault surfaces
 *  in the console (fail loud, but fail beside the frame loop, not inside it). */
function decodeSafe(wire: unknown): SimProjection | null {
  try {
    return decodeProjection(wire);
  } catch (error) {
    console.error("[proto] projection frame rejected:", error);
    return null;
  }
}

/** Adapt a real Worker to the structural interface. */
export function asWorkerLike(worker: Worker): WorkerLike {
  return {
    postMessage: (message) => worker.postMessage(message),
    set onmessage(handler: ((event: { data: unknown }) => void) | null) {
      worker.onmessage = handler === null ? null : (event) => handler({ data: event.data });
    },
    set onerror(handler: ((event: { message?: string }) => void) | null) {
      worker.onerror = handler === null ? null : (event) => handler({ message: event.message });
    },
    terminate: () => worker.terminate(),
  };
}

/** Spawn the production worker the Vite way (module-format ES2022). */
export function createBrowserSimClient(events: SimClientEvents): {
  client: SimClient;
  destroy(): void;
} {
  const worker = new Worker(new URL("../worker/sim.worker.ts", import.meta.url), {
    type: "module",
  });
  const client = new SimClient(asWorkerLike(worker), events);
  return { client, destroy: () => client.destroy() };
}
