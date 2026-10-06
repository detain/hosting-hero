/**
 * In-process WorkerLike fake — speaks the SAME protocol as sim.worker.ts.
 * Used by (a) headless tests of the full bridge loop and (b) a dev fallback
 * when Worker construction fails. The runner advances synchronously on
 * `pump()` so tests never depend on timers.
 */
import { assertToWorker, encodeProjection } from "../shared/protocol";
import { asEntityId, type PlayerIntent, type PlayerVerbArgs } from "@hh/sim-core";
import { createRunner, type SimRunner } from "../runner";

export class FakeWorkerLike {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { message?: string }) => void) | null = null;

  private runner: SimRunner | null = null;
  private pendingToWorker: unknown[] = [];

  /** Called by SimClient (our side of the wire). */
  postMessage(message: unknown): void {
    this.pendingToWorker.push(message);
  }

  terminate(): void {
    this.runner?.stop();
    this.runner = null;
  }

  /** Deliver N projection frames synchronously (drains pending inputs first). */
  pump(frames = 1, dtMs = 100): void {
    for (const message of this.pendingToWorker.splice(0)) this.handleInbound(message);
    const runner = this.runner;
    if (runner === null) return;
    for (let i = 0; i < frames; i++) {
      const projection = runner.headlessStep(dtMs);
      this.deliver({ kind: "projection", protocol: 1, projection: encodeProjection(projection) });
    }
  }

  /** Fake the runner dying mid-stream — fault-path tests. */
  emitFault(message: string): void {
    this.deliver({ kind: "fault", protocol: 1, message });
  }

  private handleInbound(raw: unknown): void {
    const message = assertToWorker(raw);
    if (message.kind === "boot") {
      this.runner = createRunner(message.runnerKind, 1);
      const runner = this.runner;
      runner.setSpeed(message.speedX);
      // The fake does NOT start the interval loop — pump() drives it.
      this.deliver({ kind: "ready", protocol: 1, engineVersion: runner.engineVersion, runnerId: runner.runnerId });
      this.lastIntent = null;
      return;
    }
    if (this.runner === null) {
      this.emitFault("intent before boot");
      return;
    }
    if (message.kind === "intent") {
      const payload = message.payload;
      const intent: PlayerIntent = {
        seq: message.seq,
        clock: message.clock,
        atUs: BigInt(message.atUs),
        origin: message.origin,
        payload:
          payload.kind === "slider"
            ? { kind: "slider", control: payload.control, value: BigInt(payload.value) }
            : payload.kind === "player-verb"
              ? // Codec proved flat scalar args + closed verb; the door owns typing.
                { kind: "player-verb", args: payload.args as unknown as PlayerVerbArgs }
              : {
                  kind: "verb",
                  verb: payload.verb,
                  target: payload.target === null ? null : asEntityId(payload.target),
                  value: payload.value === null ? null : BigInt(payload.value),
                },
      };
      this.lastIntent = intent;
      this.runner.submit(intent);
      return;
    }
    if (message.kind === "speed") this.runner.setSpeed(message.speedX);
    if (message.kind === "halt") {
      this.runner.stop();
      this.runner = null;
    }
  }

  lastIntent: PlayerIntent | null = null;

  private deliver(message: unknown): void {
    this.onmessage?.({ data: message });
  }
}
