/**
 * sim-worker boot (MASTER_REPORT §3.1: the Web Worker IS the simulator; §7.0:
 * worker→main observed-delta channel at ≤10 Hz; renderer holds zero authority).
 *
 * The worker: parses every inbound envelope at the boundary (`assertToWorker`),
 * owns exactly one `SimRunner`, and replies with `ProjectionWire` batches only.
 * It never receives DOM, canvas or Vue — same file runs under any WorkerHost.
 */
import { assertToWorker, encodeProjection, wireIntentToPlayerIntent } from "../shared/protocol";
import { createRunner, type SimRunner } from "../runner";

const host = self as unknown as DedicatedWorkerGlobalScope;

let runner: SimRunner | null = null;

function post(message: unknown): void {
  host.postMessage(message);
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
      runner.submit(wireIntentToPlayerIntent(message));
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
