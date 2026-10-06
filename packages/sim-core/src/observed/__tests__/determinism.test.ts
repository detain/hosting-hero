import { describe, expect, it } from "vitest";

import type { Fixed, ObservedCell, ObservedKey } from "../../types";
import { ResolutionBand, asCauseId, asEntityId, asRunSeed, observedKey } from "../../types";
import { FIXED_ONE, fromRatio } from "../../kernel/fixed";
import { MICROS_PER_SEC } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import {
  CLASS_GRAPHS_30S,
  CLASS_GRAPHS_5MIN,
  CLASS_HEALTHCHECK,
  CLASS_PACKET_TAP,
  CLASS_TRACING,
  type InstrumentClass,
} from "../instrument";
import { ObservedStore, stableSerialize, type ObservedRecord } from "../store";
import { asSeatId, entityScope, estateScope, projectSeat } from "../view";

/**
 * Determinism tripwire for the observed layer (CONVENTIONS §3: "×100
 * byte-identical replay is a hard gate"). The fixture drives the store the
 * way the real pipeline does — seeded draws pick which properties move, what
 * values they take, when instruments are bought — then the FULL twin state
 * (cells, watermarks, bindings, ladder counts, causes) is hashed. 100 replays
 * of one seed must agree to the hex char; different seeds must diverge
 * (guarding the digest against degenerating into a constant).
 */

const ENTITIES = [0, 1, 2, 3, 4].map((i) => asEntityId(`node-${i}`));
const PROPS = ["cpu", "latency", "health", "up"];
const TICKS = 400n;

const CLASS_POOL: readonly InstrumentClass[] = [
  CLASS_GRAPHS_5MIN,
  CLASS_GRAPHS_30S,
  CLASS_TRACING,
  CLASS_PACKET_TAP,
  CLASS_HEALTHCHECK,
];
const COVERAGE_POOL = [FIXED_ONE, fromRatio(3n, 4n), fromRatio(1n, 20n)] as const;

function buildRun(seed: bigint): ObservedStore {
  const rng = streamFor(asRunSeed(seed), "observed/determinism-fixture", 0, null);
  const store = new ObservedStore();

  for (let tick = 0n; tick < TICKS; tick += 1n) {
    const atUs = tick * MICROS_PER_SEC; // 1-s incident-clock cadence
    const records: ObservedRecord[] = [];
    for (const entity of ENTITIES) {
      for (const property of PROPS) {
        if (rng.range(3) !== 0) continue;
        records.push({
          kind: "ground",
          key: observedKey(entity, property),
          value: BigInt(rng.range(1000)),
          changedAtUs: atUs,
        });
      }
    }
    if (tick === 5n) {
      // scripted purchase wave: instrument every node's cpu
      for (const entity of ENTITIES) {
        const k = observedKey(entity, "cpu");
        const cls = CLASS_POOL[rng.range(CLASS_POOL.length)] as InstrumentClass;
        const coverage = COVERAGE_POOL[rng.range(COVERAGE_POOL.length)] as Fixed;
        records.push({
          kind: "instrument",
          binding: { instrumentId: `buy-cpu-${entity}`, target: k, source: k, cls, coverage, misBound: false },
        });
      }
    }
    if (tick === 50n) {
      records.push({
        kind: "instrument",
        binding: {
          instrumentId: "buy-health-0",
          target: observedKey(ENTITIES[0]!, "health"),
          source: observedKey(ENTITIES[0]!, "latency"),
          cls: CLASS_HEALTHCHECK,
          coverage: FIXED_ONE,
          misBound: true,
        },
      });
    }
    if (tick === 77n) {
      records.push({
        kind: "ground",
        key: observedKey(ENTITIES[1]!, "up"),
        value: 0n,
        changedAtUs: atUs,
        fairnessChannel: "pulse-strip",
      });
    }
    if (tick % 7n === 0n) {
      // producer-side explicit cell (aggregate stat), overriding derivation
      records.push({
        key: observedKey(ENTITIES[2]!, "latency"),
        causeId: asCauseId(`fixture/aggregate/${tick}`),
        cell: {
          value: BigInt(rng.range(500)),
          fidelity: ResolutionBand.Coarse,
          freshnessUs: 0n,
          coverage: FIXED_ONE,
          certainty: fromRatio(8n, 10n),
          status: "live",
        },
      });
    }
    store.applyObservedWrites(records, atUs);
  }
  return store;
}

function projectionText(map: ReadonlyMap<ObservedKey, ObservedCell<unknown>>): string {
  return [...map.entries()]
    .map(([k, c]) => `${k}|${c.status}|${c.fidelity}|${c.freshnessUs}|${c.coverage}|${c.certainty}|${stableSerialize(c.value, 0)}`)
    .sort()
    .join(";");
}

describe("observed layer determinism (§8 RISK-1 gate: ×100 identical)", () => {
  it("same seed ⇒ identical twin digest ×100", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) digests.add(buildRun(1234n).digest());
    expect(digests.size).toBe(1);
    expect([...digests][0]).toMatch(/^[0-9a-f]{16}$/);
  });

  it("same seed ⇒ identical per-seat projections ×100 (two scope shapes)", () => {
    const estate = new Set<string>();
    const partial = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const store = buildRun(99n);
      estate.add(projectionText(projectSeat(store, estateScope(asSeatId("seat-local")))));
      const scope = entityScope(asSeatId("seat-half"), [ENTITIES[0]!, ENTITIES[2]!]);
      partial.add(projectionText(projectSeat(store, scope)));
    }
    expect(estate.size).toBe(1);
    expect(partial.size).toBe(1);
    const partialText = [...partial][0] as string;
    expect(estate.has(partialText)).toBe(false); // scopes genuinely project different state
  });

  it("different seeds ⇒ different digests (the tripwire actually watches state)", () => {
    expect(buildRun(1n).digest()).not.toBe(buildRun(2n).digest());
  });

  it("watermark + batch accounting are seed-pinned too", () => {
    const store = buildRun(7n);
    expect(store.tickWatermarkUs).toBe((TICKS - 1n) * MICROS_PER_SEC);
    expect(store.appliedBatches).toBe(Number(TICKS));
    expect(store.digest()).toBe(buildRun(7n).digest());
  });
});
