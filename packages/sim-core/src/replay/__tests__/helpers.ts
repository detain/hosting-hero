/**
 * Shared fixtures for the replay module tests: a seeded pseudo-random value
 * generator (kernel RNG — never Math.random), a state-shape generator, the
 * stub SimRunner used as the "machine under replay", and bundle builders.
 */

import type { RunSeed, SimTick } from "../../types";
import { asEntityId, asRuleId, asRunSeed } from "../../types";
import { streamFor } from "../../kernel/rng";
import type { ReplayBundleDoc, StampedIntent } from "../bundle";
import type { SimRunner, SimRunnerRequest } from "../verify";

/** Deterministic PRNG over kernel/rng (u32 draws stitched into wider range). */
export class SeedRng {
  private readonly stream: ReturnType<typeof streamFor>;

  constructor(seed: bigint, domain: string) {
    this.stream = streamFor(asRunSeed(seed), domain, 0);
  }

  u32(): number {
    return this.stream.nextU32();
  }

  int(n: number): number {
    return this.stream.range(n);
  }

  pick<T>(items: readonly T[]): T {
    return items[this.int(items.length)] as T;
  }

  bool(): boolean {
    return this.int(2) === 0;
  }

  bigDecimal(bits: number): bigint {
    let value = 0n;
    for (let i = 0; i < bits; i += 8) {
      value = (value << 8n) | BigInt(this.u32() >>> 24);
    }
    return this.bool() ? value : -value;
  }

  word(): string {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$:.∅→ ⟨⟩\"\\ \n\tµ$é😀";
    const length = this.int(24);
    let out = "";
    for (let i = 0; i < length; i += 1) out += alphabet[this.int(alphabet.length)] as string;
    return out;
  }
}

/** Random canonicalizable value tree (no NaN/±Infinity — banned by law).
 *  At depth 0 only leaves are drawn, so the tree is finite by construction. */
export function randomCanonicalValue(rng: SeedRng, depth: number): unknown {
  const roll = depth <= 0 ? rng.int(6) : rng.int(10);
  switch (roll) {
    case 0:
      return null;
    case 1:
      return rng.bool();
    case 2:
      return rng.word();
    case 3: {
      // R2 fuzz coverage: ~1 in 8 number leaves is −0 — the codecs must
      // normalise it to +0 at encode in BOTH variants.
      if (rng.int(8) === 0) return -0;
      return rng.int(1_000_000); // safe-integer numbers only
    }
    case 4:
      return rng.bigDecimal(1 + rng.int(8)); // bigints of every width/sign
    case 5:
      return rng.bigDecimal(9); // beyond 2^53 — float would have rounded it
    case 6: {
      const arr: unknown[] = [];
      const size = rng.int(4);
      for (let i = 0; i < size; i += 1) arr.push(randomCanonicalValue(rng, depth - 1));
      return arr;
    }
    case 7: {
      const map = new Map<unknown, unknown>();
      const size = rng.int(4);
      for (let i = 0; i < size; i += 1) map.set(rng.word(), randomCanonicalValue(rng, depth - 1));
      return map;
    }
    case 8: {
      const set = new Set<unknown>();
      const size = rng.int(4);
      for (let i = 0; i < size; i += 1) set.add(rng.word());
      return set;
    }
    default: {
      const obj: Record<string, unknown> = {};
      const size = rng.int(5);
      for (let i = 0; i < size; i += 1) obj[rng.word()] = randomCanonicalValue(rng, depth - 1);
      return obj;
    }
  }
}

/** Deep copy with every −0 replaced by +0: vitest's `toEqual` distinguishes
 *  signed zeros (Object.is at leaves), while the canonical codecs normalise
 *  −0→+0 at encode — so round-trip equality assertions compare against the
 *  NORMALISED fixture (the digest assertions cover the encode law itself). */
export function normalizeSignedZeros(value: unknown): unknown {
  if (typeof value === "number" && Object.is(value, -0)) return 0;
  if (Array.isArray(value)) return value.map(normalizeSignedZeros);
  if (value instanceof Map) {
    return new Map([...value].map(([k, v]) => [normalizeSignedZeros(k), normalizeSignedZeros(v)]));
  }
  if (value instanceof Set) return new Set([...value].map(normalizeSignedZeros));
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value)) out[key] = normalizeSignedZeros((value as Record<string, unknown>)[key]);
    return out;
  }
  return value;
}

/** GameState-shaped stub state (plain data with Maps/bigints) at a tick. */
export interface StubState {
  readonly tick: SimTick;
  readonly cash: { readonly free: bigint; readonly restricted: bigint };
  readonly units: Map<string, { readonly id: string; readonly confidence: bigint; readonly hops: readonly string[] }>;
  readonly observed: Map<string, { readonly value: bigint | null; readonly status: string }>;
  readonly note: string;
}

/** The machine-under-replay: pure function of (initialState, seed,
 *  intents≤tick) — an integer hash accumulator, one deterministic "bit"
 *  per contributing event, so a single mutation flips exactly one field. */
export function stubRunner(request: SimRunnerRequest<StubState>): StubState {
  const { initialState, runSeed, targetTick, intentsUpToTick } = request;
  let acc = initialState.tick;
  const units = new Map(initialState.units);
  const observed = new Map(initialState.observed);
  const mix = (input: bigint): bigint => {
    // exact 64-bit avalanche on bigint (no floats): xorshift-multiply
    let z = (input + runSeed) & ((1n << 64n) - 1n);
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & ((1n << 64n) - 1n);
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & ((1n << 64n) - 1n);
    return z ^ (z >> 31n);
  };
  for (let t = initialState.tick + 1n; t <= targetTick; t += 1n) acc = mix(acc ^ t);
  for (const entry of intentsUpToTick) {
    if (entry.tick > targetTick) break;
    acc = mix(acc ^ BigInt(entry.intent.seq) ^ entry.intent.atUs);
    const payload = entry.intent.payload;
    // Legacy arms: verb→target, slider→control. The intent-door arm
    // ("player-verb", added to IntentPayload later) is never fed to this
    // stub — stay total anyway: every PlayerVerbArgs arm carries `verb`.
    const id =
      payload.kind === "verb"
        ? String(payload.target ?? "estate")
        : payload.kind === "slider"
          ? String(payload.control)
          : String(payload.args.verb);
    units.set(id, { id, confidence: mix(acc), hops: [`${entry.tick}`] });
  }
  observed.set(`${targetTick}::rho`, { value: acc, status: "live" });
  return {
    tick: targetTick,
    cash: { free: mix(acc + 1n), restricted: mix(acc + 2n) },
    units,
    observed,
    note: initialState.note,
  };
}

export const STUB_SEED: RunSeed = asRunSeed(0x5eed20261006n);

export function stubInitialState(): StubState {
  return {
    tick: 0n,
    cash: { free: 1_000_000n, restricted: 0n },
    units: new Map(),
    observed: new Map(),
    note: "seed-state",
  };
}

export const TEST_HASHES = {
  rulesetCardHashes: { "official:shared-web": "aa".repeat(8), "official:vps": "bb".repeat(8) },
  sheetsHash: "cc".repeat(8),
  ruleBookHash: "dd".repeat(8),
} as const;

export function stampedIntents(count: number, everyTicks: SimTick): StampedIntent[] {
  const out: StampedIntent[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push({
      tick: BigInt(i + 1) * everyTicks,
      intent: {
        seq: i,
        clock: "sim",
        atUs: BigInt(i + 1) * everyTicks * 60_000_000n,
        origin: i % 3 === 0 ? "rule" : "player",
        ...(i % 3 === 0 ? { ruleId: asRuleId(`rule-${i % 4}`) } : {}),
        payload:
          i % 2 === 0
            ? { kind: "verb", verb: "scale-out", target: asEntityId(`node-${i % 3}`), value: BigInt(i * 1000) }
            : { kind: "slider", control: "aggression", value: BigInt(i * 500) },
      },
    });
  }
  return out;
}

/** Minimal hand-built doc (for codec tests without the harness). */
export function minimalDoc(overrides: Partial<ReplayBundleDoc> = {}): ReplayBundleDoc {
  return {
    schemaVersion: 1,
    runSeed: STUB_SEED,
    engineVersion: "test-1.0.0",
    contentHashes: { ...TEST_HASHES, rulesetCardHashes: { ...TEST_HASHES.rulesetCardHashes } },
    snapshotEveryTicks: 5n,
    intentLog: stampedIntents(4, 3n),
    directorDraws: [{ atTick: 2n, subject: "sawtooth-trough-depth", value: 1234n }],
    checkpoints: [
      { tick: 0n, stateHash: "0".repeat(16) },
      { tick: 5n, stateHash: "1".repeat(16) },
      { tick: 10n, stateHash: "2".repeat(16) },
    ],
    snapshots: [
      { tick: 0n, stateHash: "0".repeat(16), state: { a: 1n }, stateEncoding: "canonical-json" },
      { tick: 5n, stateHash: "1".repeat(16) },
      { tick: 10n, stateHash: "2".repeat(16) },
    ],
    lineage: { companyNodeId: "gen-3", parentRef: "gen-2", scars: ["burned-by-colo"] },
    ...overrides,
  };
}

export const stubRunnerTyped: SimRunner<StubState> = stubRunner;
