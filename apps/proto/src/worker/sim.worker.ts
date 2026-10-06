/**
 * sim-worker boot (MASTER_REPORT §3.1: the Web Worker IS the simulator; §7.0:
 * worker→main observed-delta channel at ≤10 Hz; renderer holds zero authority).
 *
 * The worker: parses every inbound envelope at the boundary (`assertToWorker`),
 * owns exactly one `SimRunner`, and replies with `ProjectionWire` batches only.
 * It never receives DOM, canvas or Vue — same file runs under any WorkerHost.
 */
import { assertToWorker, encodeProjection, type WireIntentPayload } from "../shared/protocol";
import { asEntityId, type PlayerIntent, type PlayerVerbArgs } from "@hh/sim-core";
import { createRunner, type SimRunner } from "../runner";

const host = self as unknown as DedicatedWorkerGlobalScope;

let runner: SimRunner | null = null;

function post(message: unknown): void {
  host.postMessage(message);
}

function parseWireIntent(
  seq: number,
  clock: "sim" | "business" | "wall",
  atUs: bigint,
  origin: "player" | "rule",
  payload: WireIntentPayload,
): PlayerIntent {
  if (payload.kind === "slider") {
    return {
      seq,
      clock,
      atUs,
      origin,
      payload: { kind: "slider", control: payload.control, value: BigInt(payload.value) },
    };
  }
  if (payload.kind === "player-verb") {
    // Codec proved args is a flat scalar record with a closed `verb`
    // discriminant; per-verb structural typing is the door's own boundary.
    return {
      seq,
      clock,
      atUs,
      origin,
      payload: { kind: "player-verb", args: payload.args as unknown as PlayerVerbArgs },
    };
  }
  return {
    seq,
    clock,
    atUs,
    origin,
    payload: {
      kind: "verb",
      verb: payload.verb,
      target: payload.target === null ? null : asEntityId(payload.target),
      value: payload.value === null ? null : BigInt(payload.value),
    },
  };
}

host.onmessage = (event: MessageEvent): void => {
  const message = assertToWorker(event.data);
  switch (message.kind) {
    case "boot": {
      if (runner !== null) runner.stop();
      const seed = hashSeed(message.seed);
      runner = createRunner(message.runnerKind, seed);
      runner.setSpeed(message.speedX);
      runner.start((projection) => {
        post({
          kind: "projection",
          protocol: 1,
          projection: encodeProjection(projection),
        });
      });
      post({
        kind: "ready",
        protocol: 1,
        engineVersion: runner.engineVersion,
        runnerId: runner.runnerId,
      });
      return;
    }
    case "intent": {
      if (runner === null) {
        post({ kind: "fault", protocol: 1, message: "intent before boot" });
        return;
      }
      runner.submit(parseWireIntent(message.seq, message.clock, BigInt(message.atUs), message.origin, message.payload));
      return;
    }
    case "speed": {
      runner?.setSpeed(message.speedX);
      return;
    }
    case "halt": {
      runner?.stop();
      runner = null;
      return;
    }
  }
};

/** Stable string→u32 hash (FNV-1a) so a share-code seed gives the same toy run. */
function hashSeed(raw: string): number {
  let hash = 0x811c9dc5;
  for (const char of raw) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}
