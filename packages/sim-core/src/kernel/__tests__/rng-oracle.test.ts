import { describe, expect, it } from "vitest";

import { asEntityId, asRunSeed, type EntityId, type RngKey } from "../../types";
import { openStream } from "../rng";
import { deriveBaseReference, openStreamReference } from "../rng-reference";

/**
 * DIFFERENTIAL PROPERTY SUITE — fast limb path vs the bigint ORACLE
 * (rng-reference.ts). Requirement (kernel perf work, 2026-10-06): the fast
 * path must equal the oracle for ≥10^6 seeded inputs across ALL stream-key
 * axes: runSeed, domain (BMP/astral/long), simMinute (incl. > 2^32 limbs),
 * entityId (null + unicode), and counter (incl. 64-bit accumulator wraps).
 *
 * Inputs are seeded deterministically (splitmix-style bigint scrambling here
 * in the test harness — the shape of the inputs is stable across runs).
 */

const MASK64 = (1n << 64n) - 1n;
const GOLDEN = 0x9e3779b97f4a7c15n;
const SPLIT_A = 0xbf58476d1ce4e5b9n;
const SPLIT_B = 0x94d049bb133111ebn;

/** Test-side only: cheap deterministic 64-bit scrambler for input generation. */
function scramble(value: bigint): bigint {
  let z = (value * GOLDEN) & MASK64;
  z = ((z ^ (z >> 30n)) * SPLIT_A) & MASK64;
  z = ((z ^ (z >> 27n)) * SPLIT_B) & MASK64;
  return (z ^ (z >> 31n)) & MASK64;
}

const DOMAINS: readonly string[] = [
  "wave",
  "inspect",
  "outcome/bounce",
  "a",
  "director/trough",
  "queue-deep-path-a-b-c-d-e-f-g-h",
  "1234567890",
  "route::edge-007",
  "backpressure",
  "rules/lint",
];

const MINUTES: readonly number[] = [
  0, 1, 2, 59, 60, 255, 256, 4096, 65_535, 65_536, 16_777_216, 2_147_483_647, 4_294_967_296,
  4_294_967_297, 1_099_511_627_775, Number.MAX_SAFE_INTEGER,
];

const RANGE_NS: readonly number[] = [1, 2, 3, 6, 7, 10, 37, 100, 1_000, 65_536, 1_000_000, 2 ** 31 - 1];

interface CompareReport {
  compared: number;
  firstMismatch: string;
}

/** Run identical consumption scripts against both implementations. */
function compareStreams(key: RngKey, draws: number, report: CompareReport): void {
  const fast = openStream(key);
  const ref = openStreamReference(key);
  for (let c = 0; c < draws; c += 1) {
    const a = fast.nextU32();
    const b = ref.nextU32();
    report.compared += 1;
    if (a !== b && report.firstMismatch.length === 0) {
      report.firstMismatch = `nextU32 at counter ${String(c + 1)} key=${JSON.stringify({ ...key, runSeed: (key.runSeed as bigint).toString() })}: fast ${String(a)} ref ${String(b)}`;
    }
    // Deterministic per-draw range() as well (rejection paths consume counters).
    const n = RANGE_NS[(c + draws) % RANGE_NS.length] as number;
    const ra = fast.range(n);
    const rb = ref.range(n);
    report.compared += 1;
    if (ra !== rb && report.firstMismatch.length === 0) {
      report.firstMismatch = `range(${String(n)}) at draw ${String(c)}: ${String(ra)} vs ${String(rb)}`;
    }
  }
}

describe("rng fast path == bigint oracle (≥10^6 seeded draws)", () => {
  it("agrees across a seeded matrix of seeds × domains × minutes × entities", () => {
    const report: CompareReport = { compared: 0, firstMismatch: "" };
    const KEYS = 12_000;
    const DRAWS = 42; // 12_000 × 42 × 2 (u32 + range) = 1,008,000 ≥ 10^6
    for (let k = 0; k < KEYS; k += 1) {
      const seedRaw = scramble(BigInt(k) ^ 0x5deece66dn) & MASK64;
      const domain = DOMAINS[k % DOMAINS.length] as string;
      const minute = MINUTES[(k >> 3) % MINUTES.length] as number;
      const entitySlot = k % 4;
      const entityId =
        entitySlot === 0 ? null : entitySlot === 1 ? (`e${String(k % 9_973)}` as EntityId) :
        entitySlot === 2 ? (asEntityId(`漢字-${String(k)}`)) : (asEntityId("\u{1f680}astral-\u{10ffff}"));
      const key: RngKey = {
        runSeed: asRunSeed(seedRaw),
        domain: k % 977 === 0 ? `${domain}/suffix-${String(k)}` : domain,
        simMinute: minute,
        entityId,
      };
      compareStreams(key, DRAWS, report);
    }
    expect(report.firstMismatch).toBe("");
    expect(report.compared).toBeGreaterThanOrEqual(1_000_000);
  }, 240_000);

  it("agrees for negative and extreme bigint seeds (two's-complement mask path)", () => {
    const report: CompareReport = { compared: 0, firstMismatch: "" };
    for (const raw of [-1n, -42n, -(1n << 63n), -(2n ** 53n), MASK64, 1n << 63n, 0n]) {
      compareStreams({ runSeed: asRunSeed(raw), domain: "seed-extremes", simMinute: 7, entityId: null }, 64, report);
    }
    expect(report.firstMismatch).toBe("");
    expect(report.compared).toBeGreaterThanOrEqual(800);
  }, 60_000);

  it("agrees when the 64-bit accumulator provably wraps", { timeout: 120_000 }, () => {
    // Rejection-sample keys whose derived base sits within a few steps of 2^64
    // so the limb carry-chain crosses the full-64 wrap immediately.
    const report: CompareReport = { compared: 0, firstMismatch: "" };
    let wrappedKeys = 0;
    for (let k = 0n; wrappedKeys < 16; k += 1n) {
      const candidate: RngKey = {
        runSeed: asRunSeed(scramble(k | (1n << 61n))),
        domain: "wrap",
        simMinute: Number(k % 64n),
        entityId: null,
      };
      const base = deriveBaseReference(candidate);
      if (base > MASK64 - (1n << 56n)) {
        compareStreams(candidate, 512, report);
        wrappedKeys += 1;
      }
      if (k > 10_000_000n) break; // safety stop; test fails below if none found
    }
    expect(wrappedKeys, "rejection search found near-wrap bases").toBe(16);
    expect(report.firstMismatch).toBe("");
    expect(report.compared).toBeGreaterThanOrEqual(16 * 512 * 2);
  });

  it("agrees across the whole Unicode code-point plane battery (hashText path)", { timeout: 60_000 }, () => {
    const report: CompareReport = { compared: 0, firstMismatch: "" };
    const probes = [
      "¡", // Latin-1
      "漢", // CJK BMP
      "\u{10000}", // first astral plane code point (surrogate pair)
      "\u{10FFFF}", // last code point
      "a\u200Bb\u{1f600}c\u0301", // ZWSP + emoji + combining acute
      "\uD800\uDC00", // raw surrogate pair for U+10000
      "\uD7FF", // last BMP scalar before surrogates
      "\u{1D400}", // math alphanumeric
    ];
    for (const [i, probe] of probes.entries()) {
      compareStreams({ runSeed: asRunSeed(scramble(BigInt(probe.codePointAt(0) ?? 0))), domain: probe || "x", simMinute: i, entityId: i % 2 === 0 ? null : asEntityId(probe) }, 96, report);
    }
    expect(report.firstMismatch).toBe("");
    expect(report.compared).toBeGreaterThanOrEqual(8 * 96 * 2);
  });

  it("fork paths agree (both re-open the child key through their own derive)", { timeout: 60_000 }, () => {
    const seed = asRunSeed(scramble(0xc0ffeebabe1234n));
    const fastRoot = openStream({ runSeed: seed, domain: "outcome", simMinute: 11, entityId: null });
    const refRoot = openStreamReference({ runSeed: seed, domain: "outcome", simMinute: 11, entityId: null });
    // Interleave parent draws and forked children at varying depths.
    let compared = 0;
    for (let round = 0; round < 8; round += 1) {
      expect(fastRoot.nextU32()).toBe(refRoot.nextU32());
      compared += 1;
      const childA = fastRoot.fork(`lvl1-${String(round)}`);
      const childB = refRoot.fork(`lvl1-${String(round)}`);
      const grand = childA.fork("lvl2").fork("lvl3");
      const refGrand = childB.fork("lvl2").fork("lvl3");
      for (let c = 0; c < 24; c += 1) {
        expect(grand.nextU32()).toBe(refGrand.nextU32());
        expect(childA.range(RANGE_NS[c % RANGE_NS.length] as number)).toBe(childB.range(RANGE_NS[c % RANGE_NS.length] as number));
        compared += 2;
      }
    }
    expect(compared).toBeGreaterThanOrEqual(8 * 49);
  });
});
