/**
 * R25 patience-MODE consumers at step 9 (audit g09/g11: "loader closes a
 * 7-mode patience enum … engine implements only sigmoid-budget").
 *
 * Pins:
 *  - every mode's DIFFERENCE from the LUT default is observable and exact;
 *  - the PRESENCE GATE: absent / empty / explicit-"sigmoid-budget" all keep
 *    the historical roll pattern byte-identically (driver digest chains);
 *  - authored-unknown mode fails loud at step BUILD.
 */

import { describe, expect, it } from "vitest";
import type { PatienceCheckIn, SourceRef, Unit } from "../../types";
import { asEntityId, asRunSeed } from "../../types";
import { FIXED_UNIT, FIXED_ZERO, fromInt } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { createPatienceCheckStep } from "../defaults";
import { bounceProbability, patienceRatioBps } from "../bounce";
import { rollUnder } from "../internal.ts";
import { freshClocks, NO_RETRY, DEFAULT_CLASSES, envelope, node, testConfig, tickInputs } from "./helpers";

const SEED = asRunSeed(777n);

function source(): SourceRef {
  return Object.freeze({ identity: "probe:s0", reputation: FIXED_UNIT });
}

function queuedUnit(overrides: {
  id: string;
  type?: string;
  patienceUs: bigint;
  elapsedUs?: bigint;
}): Unit {
  return Object.freeze({
    id: asEntityId(overrides.id),
    type: overrides.type ?? "patience:probe",
    sizeCost: fromInt(1),
    patienceUs: overrides.patienceUs,
    trueIntent: "customer" as const,
    source: source(),
    retryOf: null,
    arrivedAtTick: 1n,
    accumulatedLatencyUs: overrides.elapsedUs ?? 0n,
    inspectionCostUs: 0n,
    confidence: FIXED_ZERO,
    qosClassId: null,
    routeHops: Object.freeze([asEntityId("edge")]),
    waitingOn: null,
  });
}

function context(): PatienceCheckIn["context"] {
  return Object.freeze({ tick: 10n, minute: 10, clocks: freshClocks() });
}

function check(
  config: Parameters<typeof createPatienceCheckStep>[0],
  units: readonly Unit[],
  waitUs: bigint,
): readonly string[] {
  const step = createPatienceCheckStep(config);
  const out = step({
    context: context(),
    units,
    waits: units.map((u) => Object.freeze({ unitId: u.id, queueWaitUs: waitUs })),
  });
  return out.bounced.map((id) => String(id));
}

const base = { runSeed: SEED };

/* ═══════════════════════ window — hard cutoff, no gradient ═══════════════════════ */

describe('mode "window" (R25 window-cutoff)', () => {
  const cfg = { ...base, patienceModeByType: { "patience:probe": "window" as const } };

  it("80 % of budget spent ⇒ ZERO bounce — where the LUT would roll at ~0.30", () => {
    const unit = queuedUnit({ id: "w-under", patienceUs: 10n * MIN, elapsedUs: 4n * MIN });
    expect(check(cfg, [unit], 4n * MIN)).toStrictEqual([]);
    // Falsifier: the SAME unit under the default mode lands inside a rolled
    // band (LUT at 80 % is 0.30 → some of 40 sibling ids bounce, some don't).
    const many = Array.from({ length: 40 }, (_, k) => queuedUnit({ id: `lut-${k}`, patienceUs: 10n * MIN, elapsedUs: 4n * MIN }));
    const lutBounced = check(base, many, 4n * MIN).length;
    expect(lutBounced).toBeGreaterThan(0); // non-vacuity: LUT DOES roll here
  });

  it("exactly at budget ⇒ CERTAIN bounce, zero rolls (100 % of ids leave)", () => {
    const units = Array.from({ length: 30 }, (_, k) => queuedUnit({ id: `w-over-${k}`, patienceUs: 10n * MIN, elapsedUs: 6n * MIN }));
    expect(check(cfg, units, 4n * MIN)).toHaveLength(30);
  });
});

/* ═════════════════ value-decay — linear bleed to certainty at 1× ═════════════════ */

describe('mode "value-decay" (R25)', () => {
  const cfg = { ...base, patienceModeByType: { "patience:probe": "value-decay" as const } };

  it("certainty lands at 1× budget, NOT at the LUT's 2× saturation", () => {
    const units = Array.from({ length: 20 }, (_, k) => queuedUnit({ id: `vd-full-${k}`, patienceUs: 10n * MIN, elapsedUs: 7n * MIN }));
    expect(check(cfg, units, 3n * MIN)).toHaveLength(20); // 1.0× ⇒ p = 1
    const lutTwin = check(base, units, 3n * MIN); // LUT at 1.0× ⇒ 0.50 ⇒ leaves survivors
    expect(lutTwin.length).toBeLessThan(20);
    expect(lutTwin.length).toBeGreaterThan(0);
  });

  it("half-budget spend ⇒ half the herd leaves (binomial band, n=200)", () => {
    const units = Array.from({ length: 200 }, (_, k) => queuedUnit({ id: `vd-half-${k}`, patienceUs: 100n * MIN, elapsedUs: 40n * MIN }));
    const bounced = check(cfg, units, 10n * MIN).length; // ratio exactly 0.5 ⇒ p = 0.5
    expect(bounced).toBeGreaterThan(60); // ±4σ of 100 is ~60…140
    expect(bounced).toBeLessThan(140);
  });

  it("below any patience spent ⇒ p = 0, no rolls (fresh unit never decays)", () => {
    const unit = queuedUnit({ id: "vd-zero", patienceUs: 10n * MIN, elapsedUs: 0n });
    expect(check(cfg, [unit], 0n)).toStrictEqual([]);
  });
});

/* ═════════════════ binary — predicted wait itself is the repel ═════════════════ */

describe('mode "binary" (R25 binary-connect)', () => {
  const cfg = { ...base, patienceModeByType: { "patience:probe": "binary" as const } };

  it("any nonzero predicted wait repels at any budget fraction", () => {
    const unit = queuedUnit({ id: "bin-queue", patienceUs: 1_000n * MIN, elapsedUs: 1n });
    expect(check(cfg, [unit], 1n)).toStrictEqual(["bin-queue"]); // 0.1 % of budget, 1µs wait
  });

  it("zero predicted wait keeps it (instant service = connect now)", () => {
    const unit = queuedUnit({ id: "bin-instant", patienceUs: 10n * MIN, elapsedUs: 999n * MIN });
    expect(check(cfg, [unit], 0n)).toStrictEqual([]); // ignores elapsed: NOT a budget mode
  });
});

/* ═════════════════ none / resident / corrupts — never abandon ═════════════════ */

describe('modes "none" / "resident" / "corrupts" (never patience-bounce)', () => {
  for (const mode of ["none", "resident", "corrupts"] as const) {
    it(`${mode}: unit at 10× budget stays — where the LUT bounces with certainty`, () => {
      const cfg = { ...base, patienceModeByType: { "patience:probe": mode } };
      const units = Array.from({ length: 20 }, (_, k) => queuedUnit({ id: `nb-${k}`, patienceUs: 10n * MIN, elapsedUs: 95n * MIN }));
      expect(check(cfg, units, 5n * MIN)).toStrictEqual([]);
      expect(check(base, units, 5n * MIN)).toHaveLength(20); // LUT twin: 10× ⇒ certain
    });
  }
});

/* ═══════════════════════ presence gate + boundary parsing ═══════════════════════ */

describe("patienceModeByType presence gate", () => {
  it("absent, empty table, and explicit sigmoid-budget are THE SAME RUN", () => {
    const units = Array.from({ length: 20 }, (_, k) => queuedUnit({ id: `pg-${k}`, patienceUs: 10n * MIN, elapsedUs: 7n * MIN }));
    const noTable = check(base, units, 3n * MIN);
    const emptyTable = check({ ...base, patienceModeByType: {} }, units, 3n * MIN);
    const explicit = check({ ...base, patienceModeByType: { "patience:probe": "sigmoid-budget" } }, units, 3n * MIN);
    expect(emptyTable).toStrictEqual(noTable);
    expect(explicit).toStrictEqual(noTable);
    // independent witness — the pre-lane formula recomputed here:
    const witness: string[] = [];
    for (const unit of units) {
      const p = bounceProbability(patienceRatioBps(7n * MIN + 3n * MIN, unit.patienceUs));
      if (p > FIXED_ZERO && (p >= FIXED_UNIT || rollUnder(p, streamFor(SEED, "bounce", 10, unit.id).nextU32()))) {
        witness.push(String(unit.id));
      }
    }
    expect(noTable).toStrictEqual(witness);
  });

  it("modes are keyed by UNIT TYPE — an unlisted type keeps the LUT", () => {
    const cfg = { ...base, patienceModeByType: { gamer: "resident" as const } };
    // resident gamer stays at 10× budget; LUT browser bounces with certainty.
    const stuck = [
      queuedUnit({ id: "g-1", type: "gamer", patienceUs: 10n * MIN, elapsedUs: 95n * MIN }),
      queuedUnit({ id: "b-1", type: "browser", patienceUs: 10n * MIN, elapsedUs: 95n * MIN }),
    ];
    expect(check(cfg, stuck, 5n * MIN)).toStrictEqual(["b-1"]);
  });

  it("a typo'd authored mode fails loud at step build, naming the type", () => {
    expect(() =>
      createPatienceCheckStep({ ...base, patienceModeByType: { "patience:probe": "sogmoid" as never } }),
    ).toThrow(/unknown patience mode sogmoid for type "patience:probe"/);
  });
});

/* ═══════════════════════ driver-level digest neutrality ═══════════════════════ */

describe("driver presence gate (digest chains)", () => {
  const IDS2 = { edge: asEntityId("edge"), origin: asEntityId("origin") } as const;

  function chain(patienceModeByType?: Readonly<Record<string, import("../../types").PatienceMode>>): string[] {
    const config = testConfig({
      runSeed: asRunSeed(31n),
      defaultPatienceUs: 3n * MIN,
      expressPath: Object.freeze([IDS2.edge, IDS2.origin]),
      deepPath: Object.freeze([IDS2.edge, IDS2.origin]),
      ...(patienceModeByType !== undefined ? { patienceModeByType } : {}),
    });
    const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
      purgeTargetedMinNodes: 0,
    });
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "patience-modes",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "patience-modes", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: Object.freeze([
        node(IDS2.edge, { slots: 1, serviceUs: MIN }), // congested: queues, waits, patience
        node(IDS2.origin, { slots: 8, serviceUs: MIN }),
      ]),
    });
    const out: string[] = [];
    for (let t = 0; t < 12; t += 1) {
      const inputs: TickInputs = tickInputs({
        envelopes: Object.freeze([envelope("modes:probe", fromInt(6))]),
        dependencyEdges: Object.freeze([]),
        retryPolicy: NO_RETRY,
        classes: DEFAULT_CLASSES,
      });
      state = driver.advance(state, inputs).state;
      out.push(digestState(state));
    }
    return out;
  }

  it("absent / empty / all-sigmoid configs digest byte-identically (zero golden risk)", () => {
    const bare = chain(undefined);
    expect(chain({})).toStrictEqual(bare);
    expect(chain({ "modes:probe": "sigmoid-budget" })).toStrictEqual(bare);
  });

  it("a PRESENT non-default mode changes the run (disclosed, config-gated only)", () => {
    const bare = chain(undefined);
    const resident = chain({ "modes:probe": "resident" });
    expect(resident).not.toStrictEqual(bare); // units stop abandoning the queue
  });
});
