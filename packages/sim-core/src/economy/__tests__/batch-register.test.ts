/**
 * Batch-register lane (owner-ratified 2026-10-09, ADR-0009 rec #14):
 * `registerContractsEconomy` must be BYTE-IDENTICAL to folding
 * `registerContractEconomy` over the same sequence — same sorted Map
 * iteration order (digests are insertion-order sensitive), same per-entry
 * constructions, same error family/message/position for every failure class —
 * while turning the O(n·m) chained setup into one validate pass + one merge
 * pass per twin map.
 *
 * Perf-floor discipline copied from journal.test.ts (shared box, sibling
 * lanes): self-measured contention factor from a fixed CPU spin, clamp
 * [1,4], best-of-3, plus an independent linearity probe so a re-introduced
 * per-entry copy cannot pass both. NEVER a bare tight ms literal.
 */

import { describe, expect, it } from "vitest";

import {
  asEntityId,
  asMoney,
  type Contract,
  type EntityId,
} from "../../types.ts";
import { fromRatio } from "../../kernel/fixed.ts";
import { defaultEconomyConfig, type EconomyConfig } from "../config.ts";
import {
  emptyEconomyState,
  registerContractEconomy,
  registerContractsEconomy,
  type EconomyState,
  type RegisterContractInput,
} from "../state.ts";
import { initBudget } from "../errorBudget.ts";
import { MONTH, TAGS, digest } from "./helpers.js";

const cfg: EconomyConfig = defaultEconomyConfig();

function contractOf(id: string): Contract {
  return {
    id: asEntityId(id),
    customerEntityId: asEntityId(`cust:${id}`),
    bundleId: "shared",
    mrcMicroUsd: asMoney(100_000_000n), // $100/mo
    tcvMicroUsd: asMoney(0n),
    acvMicroUsd: asMoney(0n),
    termStartMin: 0,
    termEndMin: 2 * MONTH,
    billingCycle: "monthly",
    sla: {
      uptimeTarget: fromRatio(999n, 1000n),
      responseBudgetUs: 0n,
      creditRate: 0n,
      creditCap: 0n,
      claimWindowUs: 0n,
      autoRenew: false,
      noticePeriodMin: 0,
      threeBreachExitRight: false,
    },
    routingLocks: [],
    shedImmunityClassId: null,
    allocations: [],
  };
}

/** Per-entry variance so equivalence proves the CONSTRUCTION, not a stub:
 *  clause refs flip mfnActive, minutes span months, commitments vary bps. */
function inputOf(n: number): RegisterContractInput {
  return {
    contract: contractOf(rowId(n)),
    atBusinessMin: (n * 97) % 86_400,
    clauseRefs: n % 3 === 0 ? ["mfn"] : [],
    grandfather: null,
    revenueTags: TAGS,
    commitmentBps: 9990n + BigInt(n % 10),
  };
}

/** Zero-padded ids: codepoint order == numeric order, but the LCG shuffle
 *  below still feeds the merge from every direction. */
function rowId(n: number): EntityId {
  return asEntityId(`b-${String(n).padStart(5, "0")}`);
}

function inputsOf(count: number): RegisterContractInput[] {
  return Array.from({ length: count }, (_, i) => inputOf(i));
}

/** Deterministic Fisher–Yates (LCG — no Math.random, replay-honest). */
function shuffled<T>(rows: readonly T[], seed: number): T[] {
  const out = [...rows];
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

function foldSingles(base: EconomyState, order: readonly RegisterContractInput[]): EconomyState {
  let s = base;
  for (const input of order) s = registerContractEconomy(s, input, cfg);
  return s;
}

describe("registerContractsEconomy: byte-identity vs chained singles", () => {
  it(
    "3 seeds x shuffled 1,000-entry batches digest-equal the folds",
    () => {
      const order = inputsOf(1_000);
      for (const seed of [1, 7, 4242]) {
        const batch = shuffled(order, seed);
        const chained = foldSingles(emptyEconomyState(), batch);
        const grouped = registerContractsEconomy(emptyEconomyState(), batch, cfg);
        expect(digest(grouped)).toBe(digest(chained));
        // the sorted-key law stated directly, both twin maps
        const sortedIds = [...order].map((i) => i.contract.id).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
        expect([...grouped.contractEconomy.keys()]).toEqual(sortedIds);
        expect([...grouped.errorBudgets.keys()]).toEqual(sortedIds);
      }
    },
    120_000, // three 1k folds are the O(n²) reference itself — generous under load
  );

  it("per-entry variance really landed (the digest pin above is not vacuous)", () => {
    const s = registerContractsEconomy(emptyEconomyState(), inputsOf(6), cfg);
    expect(s.contractEconomy.get(rowId(0))!.mfnActive).toBe(true); // clauseRefs ["mfn"]
    expect(s.contractEconomy.get(rowId(1))!.mfnActive).toBe(false);
    expect(s.errorBudgets.get(rowId(0))!.commitmentBps).toBe(9990n);
    expect(s.errorBudgets.get(rowId(1))!.commitmentBps).toBe(9991n);
    // (n*97)%86400 spans month 0 at these small minutes; term/cycle parse ran per entry
    expect(s.contractEconomy.get(rowId(5))!.termMonths).toBe(2);
  });

  it("twin-map skew: id present only in errorBudgets replaces in position (mirrors sortedById's in-place arm)", () => {
    const keep = initBudget("a" as EntityId, 9990n, 0, 0, cfg);
    const stale = initBudget("m" as EntityId, 1n, 0, 0, cfg); // commitment 1n marks the OLD record
    const forged: EconomyState = {
      ...emptyEconomyState(),
      errorBudgets: new Map<EntityId, typeof keep>([
        ["a" as EntityId, keep],
        ["m" as EntityId, stale],
      ]),
    };
    // the batch's id is 'm' itself — the dup wall guards only contractEconomy,
    // so registration proceeds and the budget record swaps IN PLACE.
    const fresh: RegisterContractInput = { ...inputOf(500), contract: contractOf("m") };
    const chained = registerContractEconomy(forged, fresh, cfg);
    const batched = registerContractsEconomy(forged, [fresh], cfg);
    expect(digest(batched)).toBe(digest(chained));
    // falsifiable position pin: 'm' keeps its slot (never re-queued ahead of
    // 'a' by the merge's drain-early path) and carries the FRESH budget.
    expect([...batched.errorBudgets.keys()]).toEqual(["a", "m"]);
    expect(batched.errorBudgets.get("m" as EntityId)!.commitmentBps).toBe(9990n); // not the stale 1n
    expect([...batched.contractEconomy.keys()]).toEqual(["m"]);
  });

  it("unsorted forged sources fall back identically (sortedById's recovery, batched)", () => {
    const built = foldSingles(emptyEconomyState(), inputsOf(3));
    const forged: EconomyState = {
      ...built,
      contractEconomy: new Map([...built.contractEconomy].reverse()),
      errorBudgets: new Map([...built.errorBudgets].reverse()),
    };
    const batch = [...inputsOf(5)].slice(3); // b-00003, b-00004 join the skewed pair
    expect(digest(registerContractsEconomy(forged, batch, cfg))).toBe(
      digest(foldSingles(forged, batch)),
    );
  });

  it("empty batch returns the SAME state reference (fold's neutral element)", () => {
    const base = foldSingles(emptyEconomyState(), inputsOf(2));
    expect(registerContractsEconomy(base, [], cfg)).toBe(base);
    const fresh = emptyEconomyState();
    expect(registerContractsEconomy(fresh, [], cfg)).toBe(fresh);
  });
});

describe("registerContractsEconomy: fail-loud duplicates mirror the chain exactly", () => {
  function messageOf(fn: () => unknown): string {
    try {
      fn();
    } catch (e) {
      return e instanceof Error ? `${e.constructor.name}: ${e.message}` : String(e);
    }
    throw new Error("expected a throw, got none");
  }

  it("duplicate WITHIN the batch: plain Error, same message, same position", () => {
    const dup = inputOf(9);
    const order = [...inputsOf(4), dup, dup];
    const chained = messageOf(() => foldSingles(emptyEconomyState(), order));
    const batched = messageOf(() => registerContractsEconomy(emptyEconomyState(), order, cfg));
    expect(batched).toBe(chained);
    expect(batched).toBe(`Error: economy/state: '${rowId(9)}' already registered`);
  });

  it("duplicate AGAINST state (registered by the single path first): identical throw", () => {
    const primed = registerContractEconomy(emptyEconomyState(), inputOf(1), cfg);
    const order = [inputOf(2), inputOf(1)];
    expect(messageOf(() => registerContractsEconomy(primed, order, cfg))).toBe(
      messageOf(() => foldSingles(primed, order)),
    );
  });

  it("validation order preserved: earlier entry's bad term beats a later duplicate", () => {
    const broken = inputOf(3);
    const badTerm: RegisterContractInput = {
      ...broken,
      contract: { ...broken.contract, termEndMin: broken.contract.termStartMin },
    };
    const primed = registerContractEconomy(emptyEconomyState(), inputOf(4), cfg);
    const order = [badTerm, inputOf(4)]; // entry 0 invalid, entry 1 duplicate
    const batched = messageOf(() => registerContractsEconomy(primed, order, cfg));
    expect(batched).toBe(messageOf(() => foldSingles(primed, order)));
    expect(batched).toContain("RangeError: economy/contract:"); // the open() wall, not the dup wall
  });

  it("a throwing batch leaves the input state untouched (atomicity)", () => {
    const base = foldSingles(emptyEconomyState(), inputsOf(3));
    const before = digest(base);
    expect(() => registerContractsEconomy(base, [...inputsOf(4)].slice(0, 2).concat(inputOf(2)), cfg)).toThrow(
      /already registered/,
    );
    expect(digest(base)).toBe(before);
    // and the state stays usable: the same valid prefix registers cleanly afterwards
    expect(() => registerContractEconomy(base, inputOf(7), cfg)).not.toThrow();
  });

  it("bad commitment bps in a late entry throws the initBudget RangeError before any map lands", () => {
    const bad = { ...inputOf(2), commitmentBps: 20_000n };
    const order = [inputOf(0), inputOf(1), bad];
    expect(messageOf(() => registerContractsEconomy(emptyEconomyState(), order, cfg))).toBe(
      messageOf(() => foldSingles(emptyEconomyState(), order)),
    );
  });
});

describe("registerContractsEconomy: setup cost (batch-register audit)", () => {
  // Contention calibration, journal.test.ts discipline: a fixed 3e7-iteration
  // spin samples machine load; idle ≈ 8ms → factor 1, clamp [1,4].
  let spin = 0;
  const tCal = performance.now();
  for (let i = 0; i < 3e7; i += 1) spin += i & 7;
  const calMs = performance.now() - tCal;
  if (spin < 0) throw new Error("unreachable");
  const factor = Math.min(4, Math.max(1, calMs / 8));

  function bestOf(runs: number, fn: () => void): number {
    let best = Number.POSITIVE_INFINITY;
    for (let r = 0; r < runs; r += 1) {
      const t0 = performance.now();
      fn();
      best = Math.min(best, performance.now() - t0);
    }
    return best;
  }

  it(
    "1,000-contract setup < 25ms x contention factor (chained singles measured ~130ms at 1k idle; batch ~1-3ms)",
    () => {
      const order = inputsOf(1_000);
      const base = emptyEconomyState();
      let out: EconomyState | null = null;
      const best = bestOf(3, () => {
        out = registerContractsEconomy(base, order, cfg);
      });
      expect(out!.contractEconomy.size).toBe(1_000);
      expect(best).toBeLessThan(25 * factor);
    },
    120_000,
  );

  it("cost grows near-linearly: 8k batch < max(12 x 1k batch, 120ms) (quadratic would be ~64x)", () => {
    const base = emptyEconomyState();
    const small = inputsOf(1_000);
    const big = inputsOf(8_000);
    const t1k = bestOf(3, () => void registerContractsEconomy(base, small, cfg));
    const t8k = bestOf(1, () => void registerContractsEconomy(base, big, cfg));
    expect(t8k).toBeLessThan(Math.max(12 * t1k, 120));
  });
});
