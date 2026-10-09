/**
 * §2.24 rules-block consumers (audit fix 4): feint / second-incident /
 * copycat were DEAD DATA declared in the g1 slices with zero engine
 * consumers. The engine now reads them off WaveTable.rules — every law here
 * is PRESENCE-GATED: without the rules block (every shipped table to date)
 * plans stay byte-identical, and the full-suite golden chain proves it.
 */
import { describe, expect, it } from "vitest";
import { parseWaveTable } from "../table.js";
import type { WaveTable } from "../table.js";
import { planWave, waveStream } from "../generate.js";
import type { WavePlanInput } from "../generate.js";
import { INITIAL_DIRECTOR_STATE } from "../director.js";
import { ledgerSnapshot, buildInvitations } from "../ledger.js";
import { cleanTable, mutableClone } from "./fixtures.js";
import { asRunSeed } from "../../types.js";

const EMPTY_LEDGER = ledgerSnapshot([], 0n);

function input(seed: bigint, extra: Partial<WavePlanInput> = {}): WavePlanInput {
  return {
    startMinute: 100,
    tick: 100n,
    rng: waveStream(asRunSeed(seed), 1, 100),
    director: INITIAL_DIRECTOR_STATE,
    ledger: EMPTY_LEDGER,
    invitations: buildInvitations({}),
    entropyForecastPurchased: false,
    ...extra,
  };
}

/** cleanTable through the boundary parser, mutated as raw JSON would be. */
function parsedTable(mk: (t: ReturnType<typeof mutableClone>) => void): WaveTable {
  const raw = mutableClone(cleanTable());
  mk(raw);
  return parseWaveTable(raw);
}

const key = (a: { threatId: string; targetId: string; unitOrdinal: number }): string =>
  `${a.threatId}/${a.targetId}/${a.unitOrdinal}`;

/* ═══════════════════════ 1 · closed-vocabulary parsing ═══════════════════════ */

describe("parseWaveTable rules (closed vocabulary, §2.24)", () => {
  it("accepts the three dead-data families when authored", () => {
    const t = parsedTable((r) => {
      r.waves[0]!.feint = true;
      r.waves[1]!.secondIncident = true;
      r.rules = {
        feints: { maxPerLevel: 2, neverTwoLevelsInRow: true },
        secondIncidentMultiplierDuringIncident: 1.8,
        secondIncidentMultiplierDuringRecovery: 2.5,
        copycatReservePct: [10, 15],
      };
    });
    expect(t.rules?.feints?.maxPerLevel).toBe(2);
    expect(t.rules?.secondIncidentMultiplierDuringIncident).toBe(1.8);
    expect(t.waves[0]?.feint).toBe(true);
    expect(t.waves[1]?.secondIncident).toBe(true);
  });

  it("rejects unknown rules keys and unknown feints keys", () => {
    expect(() =>
      parsedTable((r) => {
        (r as { rules?: unknown }).rules = { secondIncidentMultiplierDuringIncident: 2, bogus: 3 };
      }),
    ).toThrow(/unknown rules key "bogus"/);
    expect(() =>
      parsedTable((r) => {
        (r as { rules?: unknown }).rules = { feints: { maxPerLevel: 1, neverTwoLevelsInRow: false, surprise: 1 } };
      }),
    ).toThrow(/unknown rules.feints key "surprise"/);
  });

  it("rejects a second-incident multiplier ≤ 1 and a malformed copycat band", () => {
    expect(() =>
      parsedTable((r) => {
        (r as { rules?: unknown }).rules = { secondIncidentMultiplierDuringIncident: 1 };
      }),
    ).toThrow(/must be a finite number > 1/);
    expect(() =>
      parsedTable((r) => {
        (r as { rules?: unknown }).rules = { copycatReservePct: [50, 10] };
      }),
    ).toThrow(/copycatReservePct/);
  });

  it("enforces neverTwoLevelsInRow and maxPerLevel against flagged waves", () => {
    expect(() =>
      parsedTable((r) => {
        r.waves[0]!.feint = true;
        r.waves[1]!.feint = true;
        r.rules = { feints: { maxPerLevel: 4, neverTwoLevelsInRow: true } };
      }),
    ).toThrow(/neverTwoLevelsInRow forbids it/);
    expect(() =>
      parsedTable((r) => {
        r.waves[0]!.feint = true;
        r.waves[2]!.feint = true;
        r.rules = { feints: { maxPerLevel: 1, neverTwoLevelsInRow: true } };
      }),
    ).toThrow(/exceed rules.feints.maxPerLevel/);
  });

  it("a prose secondIncident marker (foreign slices) parses as presence", () => {
    const t = parsedTable((r) => {
      r.waves[0]!.secondIncident = "ticket avalanche arrives inside the defacement window" as never;
    });
    expect(t.waves[0]?.secondIncident).toBe(true);
    expect(() => {
      const raw = mutableClone(cleanTable());
      raw.waves[0]!.secondIncident = 7 as never;
      parseWaveTable(raw);
    }).toThrow(/boolean or a non-empty prose marker/);
  });
});

/* ═══════════════════════ 2 · dead-neutral absence ═══════════════════════ */

describe("presence-gating — the inertness contract", () => {
  it("wave flags WITHOUT a rules block move nothing", () => {
    const plain = planWave(cleanTable(), 1, input(7n));
    const flaggedNoRules: WaveTable = {
      ...cleanTable(),
      waves: cleanTable().waves.map((w, i) => (i === 0 ? { ...w, feint: true, secondIncident: true } : w)),
    };
    expect(planWave(flaggedNoRules, 1, input(7n))).toEqual(plain);
  });

  it("rules + input knobs WITHOUT any matching wave flag / family stay inert", () => {
    const plain = planWave(cleanTable(), 1, input(7n));
    const table = parsedTable((r) => {
      r.rules = {
        feints: { maxPerLevel: 2, neverTwoLevelsInRow: true },
        secondIncidentMultiplierDuringIncident: 1.8,
        copycatReservePct: [10, 15],
      };
    });
    // no wave is flagged, and customerAsThreat matches no wave-1 entry:
    expect(
      planWave(table, 1, input(7n, { incidentState: "active", dominantDefenseFamily: "customerAsThreat" })),
    ).toEqual(plain);
  });
});

/* ═══════════════════════ 3 · feint ═══════════════════════ */

describe("feint — decoy quarter re-parks on the opening beat", () => {
  const table = parsedTable((r) => {
    r.waves[0]!.feint = true;
    r.rules = { feints: { maxPerLevel: 2, neverTwoLevelsInRow: true } };
  });

  it("first quarter (min 1) of EVERY threat sits at startMinute; existence untouched", () => {
    const plain = planWave(cleanTable(), 1, input(9n));
    const feinted = planWave(table, 1, input(9n));
    expect(feinted.startMinute).toBe(plain.startMinute); // placement draw unperturbed
    for (const [threatId, count] of Object.entries(feinted.unitsByThreat)) {
      const decoys = Math.max(1, Math.floor(count / 4));
      for (const a of feinted.arrivals) {
        if (a.threatId === threatId && a.unitOrdinal <= decoys) expect(a.minute).toBe(feinted.startMinute);
      }
    }
    // R-16 holds: same census, same identities, same targets — timing only.
    expect(feinted.unitsByThreat).toEqual(plain.unitsByThreat);
    expect(feinted.arrivals.map(key).sort()).toStrictEqual(plain.arrivals.map(key).sort());
    // and the split is REAL at this seed: the timing vector moved.
    expect(feinted.arrivals.map((a) => a.minute).join(",")).not.toBe(plain.arrivals.map((a) => a.minute).join(","));
  });

  it("deterministic: same seed twice; another seed diverges", () => {
    const a = planWave(table, 1, input(21n));
    const b = planWave(table, 1, input(21n));
    expect(a.arrivals).toEqual(b.arrivals);
    const c = planWave(table, 1, input(22n));
    expect(c.arrivals.map((x) => `${x.threatId}#${x.unitOrdinal}@${x.minute}`).join(",")).not.toBe(
      a.arrivals.map((x) => `${x.threatId}#${x.unitOrdinal}@${x.minute}`).join(","),
    );
  });
});

/* ═══════════════════════ 4 · second incident ═══════════════════════ */

describe("secondIncident — delayed follow-on copy during an incident", () => {
  const table = parsedTable((r) => {
    r.waves[0]!.secondIncident = true;
    r.rules = {
      secondIncidentMultiplierDuringIncident: 1.8,
      secondIncidentMultiplierDuringRecovery: 2.5,
    };
  });
  const envelopeMinutes = 20; // ramp5 + plateau10 + decay5 in cleanTable

  const halfUpExtra = (count: number, extraMicro: bigint): number =>
    Number((2n * BigInt(count) * extraMicro + 1_000_000n) / (2n * 1_000_000n));

  it("active: extra = round(count × 0.8) per threat, parked AFTER the envelope", () => {
    const base = planWave(cleanTable(), 1, input(31n));
    const hit = planWave(table, 1, input(31n, { incidentState: "active" }));
    const expectedExtra = Object.values(base.unitsByThreat).reduce((s, c) => s + halfUpExtra(c, 800_000n), 0);
    expect(hit.arrivals.length - base.arrivals.length).toBe(expectedExtra);
    for (const a of hit.arrivals.slice(base.arrivals.length)) {
      expect(a.minute).toBeGreaterThanOrEqual(hit.startMinute + envelopeMinutes);
    }
    // originals ride UNCHANGED (extras append with continued ordinals under
    // the existing table~N~threat~ord grammar; envelope-end separation keeps
    // every extra strictly behind every original in sort order).
    const head = hit.arrivals.filter((a) => a.unitOrdinal <= (base.unitsByThreat[a.threatId] ?? 0));
    expect(head).toEqual(base.arrivals);
    const ids = new Set(hit.events.map((e) => String(e.causeId)));
    expect(ids.size).toBe(hit.arrivals.length);
  });

  it("recovering uses the recovery multiplier (2.5×), not the incident one", () => {
    const base = planWave(cleanTable(), 1, input(31n));
    const recovering = planWave(table, 1, input(31n, { incidentState: "recovering" }));
    const expectRec = Object.values(base.unitsByThreat).reduce((s, c) => s + halfUpExtra(c, 1_500_000n), 0);
    expect(recovering.arrivals.length).toBe(base.arrivals.length + expectRec);
    const active = planWave(table, 1, input(31n, { incidentState: "active" }));
    expect(recovering.arrivals.length).toBeGreaterThan(active.arrivals.length);
  });

  it("quiet / absent state and un-flagged waves stay inert", () => {
    const plain = planWave(cleanTable(), 1, input(41n));
    expect(planWave(table, 1, input(41n, { incidentState: "quiet" }))).toEqual(plain);
    expect(planWave(table, 1, input(41n))).toEqual(plain); // absent ≙ quiet
    const w2a = planWave(table, 2, input(41n, { incidentState: "active", rng: waveStream(asRunSeed(41n), 2, 100) }));
    const w2b = planWave(table, 2, input(41n, { rng: waveStream(asRunSeed(41n), 2, 100) }));
    expect(w2a).toEqual(w2b); // wave 2 is not flagged
  });
});

/* ═══════════════════════ 5 · copycat ═══════════════════════ */

describe("copycat — reserve flows to the defended family", () => {
  it("matching entries grow, others shrink, totals stay conserved (±1 rounding)", () => {
    const table = parsedTable((r) => {
      r.rules = { copycatReservePct: [10, 15] };
    });
    // wave1: scanner-drizzle malicious 60 / trial-swarm human 40.
    const plain = planWave(table, 1, input(51n));
    const cat = planWave(table, 1, input(51n, { dominantDefenseFamily: "malicious" }));
    expect(cat.unitsByThreat["scanner-drizzle"]!).toBeGreaterThan(plain.unitsByThreat["scanner-drizzle"]!);
    expect(cat.unitsByThreat["trial-swarm"]!).toBeLessThan(plain.unitsByThreat["trial-swarm"]!);
    const sum = (u: Readonly<Record<string, number>>): number => Object.values(u).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum(cat.unitsByThreat) - sum(plain.unitsByThreat))).toBeLessThanOrEqual(1);
    // EXACT micro-share law (no float wobble): non-matches floor-scale by the
    // reserve, the matched pool feeds off the remainder to sum exactly 1e6.
    const P = planWave(table, 1, input(51n)).pressureMicro;
    const upp = table.unitsPerPressurePoint;
    const halfUp = (num: bigint, den: bigint): number => Number((2n * num + den) / (2n * den));
    const expectedMal = halfUp(P * 640_000n * BigInt(upp), 1_000_000_000_000n);
    const expectedHuman = halfUp(P * 360_000n * BigInt(upp), 1_000_000_000_000n);
    expect(cat.unitsByThreat["scanner-drizzle"]).toBe(expectedMal);
    expect(cat.unitsByThreat["trial-swarm"]).toBe(expectedHuman);
  });

  it("inert without the input family, without a matching entry, and without the rule", () => {
    const plain = planWave(cleanTable(), 1, input(61n));
    expect(planWave(cleanTable(), 1, input(61n, { dominantDefenseFamily: "malicious" }))).toEqual(plain);
    const withRule = parsedTable((r) => {
      r.rules = { copycatReservePct: [10, 15] };
    });
    expect(planWave(withRule, 1, input(61n, { dominantDefenseFamily: "customerAsThreat" }))).toEqual(plain);
    expect(planWave(withRule, 1, input(61n))).toEqual(plain);
  });

  it("band share uses the LOWER bound (deterministic v0 reading)", () => {
    const wide = parsedTable((r) => {
      r.rules = { copycatReservePct: [10, 40] };
    });
    const narrow = parsedTable((r) => {
      r.rules = { copycatReservePct: [10, 11] };
    });
    const a = planWave(wide, 1, input(71n, { dominantDefenseFamily: "malicious" }));
    const b = planWave(narrow, 1, input(71n, { dominantDefenseFamily: "malicious" }));
    expect(a.unitsByThreat).toEqual(b.unitsByThreat); // max never consulted in v0
  });
});
