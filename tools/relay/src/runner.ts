/**
 * SPIKE RUNNER (ADR-0014 #D6) — the client half of the relay proof.
 *
 * A closure holding an independent GameState, driven through the REAL intent
 * door (pipeline.applyIntentDoor) tick by tick, hashing every frame with the
 * pipeline's own digestState. Two of these fed the same relay-stamped
 * ExternalIntent[] (delivered to their seats in different arrival orders, then
 * normalized) must agree frame-for-frame — the mp-topology (b) claim: the TS
 * sim is portable enough that a Node host can be authoritative and every seat
 * converges from the stamped log alone.
 *
 * The runner never reaches into the relay and the relay never touches the sim;
 * the ONLY channel between them is the stamped CoopTimelineRecord list — the
 * same channel the future Workerman transport will carry over the wire.
 */

import { applyIntentDoor, createInitialState, digestState } from "@hh/sim-core/pipeline";
import type { ExternalIntent, GameState, HashHex, RunSeed, SimTick } from "@hh/sim-core/types";
import { minutesToSimUs } from "@hh/sim-core/kernel";

export interface SpikeRunnerOptions {
  readonly runSeed: RunSeed;
  /** §7.5 hands rail size (default 2 — the ratified T2 capacity). */
  readonly handCapacity?: number;
}

export interface SpikeRunner {
  tick(): SimTick;
  state(): GameState;
  /** digestState after each runTicks-driven tick, in tick order. */
  frames(): readonly HashHex[];
  /**
   * Drive `tickCount` ticks starting at the runner's clock, feeding the door
   * whatever intents are stamped at each tick. Arrival order inside a tick is
   * the door's (tick, seq) sort — never the transport's.
   */
  runTicks(feeds: readonly ExternalIntent[], tickCount: number): void;
}

function groupByTick(feeds: readonly ExternalIntent[]): ReadonlyMap<SimTick, readonly ExternalIntent[]> {
  const byTick = new Map<SimTick, ExternalIntent[]>();
  for (const entry of feeds) {
    const rows = byTick.get(entry.tick);
    if (rows === undefined) {
      byTick.set(entry.tick, [entry]);
    } else {
      rows.push(entry);
    }
  }
  return byTick;
}

export function createSpikeRunner(options: SpikeRunnerOptions): SpikeRunner {
  const handCapacity = options.handCapacity ?? 2;
  let state = createInitialState({
    runSeed: options.runSeed,
    engineVersion: "relay-spike-0",
    contentHashes: {
      rulesetCardHashes: {},
      sheetsHash: "relay-spike-sheets",
      ruleBookHash: "relay-spike-rulebook",
    },
    clocks: { realUs: 0n, simUs: 0n, businessUs: 0n, wallUs: 0n },
    handCapacity,
  });
  let tick: SimTick = 0n;
  const frames: HashHex[] = [];

  return {
    tick: () => tick,
    state: () => state,
    frames: () => Object.freeze([...frames]),

    runTicks(feeds: readonly ExternalIntent[], tickCount: number): void {
      const byTick = groupByTick(feeds);
      for (let i = 0; i < tickCount; i += 1) {
        const clock = minutesToSimUs(tick);
        const result = applyIntentDoor(
          state,
          {
            tick,
            minute: Number(tick),
            clocks: { realUs: clock, simUs: clock, businessUs: clock, wallUs: clock },
          },
          byTick.get(tick) ?? [],
          { handCapacity },
        );
        state = result.state;
        frames.push(digestState(state));
        tick += 1n;
      }
    },
  };
}
