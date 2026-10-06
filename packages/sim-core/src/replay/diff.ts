/**
 * Structured path-level diff between two decoded state values (replay
 * verifier's "first-divergent-tick" report, MASTER_REPORT §3.3 item 3 —
 * postmortem/Decision-Audit consumers need the PATH of divergence, not a
 * hash mismatch).
 *
 * Equality here is canonical equality: bigint by value, numbers by Object.is
 * (so −0 ≠ +0 when two RAW values are walked — the diff stays the finest
 * diagnostic; the canonical codecs meanwhile normalise −0→+0 at encode, so
 * two states differing only in signed zero can never disagree on a digest),
 * Maps compared as INSERTION-ORDERED pair lists (a reorder is a real
 * divergence, §3.4), plain objects compared by key sets.
 *
 * Nesting is capped at MAX_CANONICAL_DEPTH (same ceiling as the parsers):
 * deep input throws ReplayError, never a RangeError stack-overflow.
 */

import { MAX_CANONICAL_DEPTH, ReplayError, compareCodeUnits } from "./canonical.ts";

export type DiffKind = "changed" | "missing-in-actual" | "extra-in-actual";

export interface PathDiff {
  /** Dot/bracket access path, e.g. `nodes[edge].queueDepth[2]` or
   *  `units⟨u1⟩.confidence`. Empty string = the root value itself. */
  readonly path: string;
  readonly kind: DiffKind;
  /** Only set for "changed" (both sides present). */
  readonly expected?: unknown;
  readonly actual?: unknown;
}

export interface DiffResult {
  readonly diffs: readonly PathDiff[];
  /** True when the walk stopped at `limit` before exhausting differences. */
  readonly truncated: boolean;
}

export interface DiffOptions {
  /** Hard cap on reported paths (default 64) — divergence reports must stay
   *  legible even when a state blob exploded wholesale. */
  readonly limit?: number;
}

/** Render a decoded value compactly for diff payloads (Maps/Sets flattened
 *  to readable summaries; everything else passes through untouched).
 *  Depth-capped like the parse paths: a caller feeding diffStates raw
 *  (unparsed) state must get ReplayError, never a RangeError stack-overflow. */
function compact(value: unknown, depth: number): unknown {
  if (depth > MAX_CANONICAL_DEPTH) {
    throw new ReplayError(`diffStates: value nesting exceeds depth cap ${MAX_CANONICAL_DEPTH} (rejected, not overflowed)`);
  }
  if (value instanceof Map) {
    return { "#map": [...value.entries()].map(([k, v]) => [compact(k, depth + 1), compact(v, depth + 1)]) };
  }
  if (value instanceof Set) return { "#set": [...value].map((m) => compact(m, depth + 1)) };
  if (Array.isArray(value)) return value.map((item) => compact(item, depth + 1));
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort(compareCodeUnits)) out[key] = compact((value as Record<string, unknown>)[key], depth + 1);
    return out;
  }
  if (typeof value === "bigint") return value.toString(10);
  return value;
}

function sameLeaf(a: unknown, b: unknown): boolean {
  if (typeof a === "bigint" || typeof b === "bigint") {
    return typeof a === "bigint" && typeof b === "bigint" && a === b;
  }
  if (typeof a === "number" && typeof b === "number") return Object.is(a, b);
  return a === b;
}

function isIndexableKey(value: unknown): value is string {
  return typeof value === "string" || typeof value === "number" || typeof value === "bigint";
}

function childPath(parent: string, segment: string): string {
  return parent.length === 0 ? segment : `${parent}.${segment}`;
}

function joinBracket(parent: string, bracket: string): string {
  return parent.length === 0 ? bracket : `${parent}${bracket}`;
}

class DiffWalk {
  private readonly diffs: PathDiff[] = [];
  private truncated = false;

  constructor(private readonly limit: number) {}

  get result(): DiffResult {
    return { diffs: this.diffs, truncated: this.truncated };
  }

  private get full(): boolean {
    return this.diffs.length >= this.limit;
  }

  private push(diff: PathDiff): void {
    if (this.full) {
      this.truncated = true;
      return;
    }
    this.diffs.push(diff);
  }

  walk(expected: unknown, actual: unknown, path: string, depth: number): void {
    if (this.full) {
      this.truncated = true;
      return;
    }
    // Nesting ceiling BEFORE any recursion or payload rendering (R1): two raw
    // deep chains — or a deep chain vs a leaf, whose payload compact() would
    // walk — must ReplayError, never RangeError.
    if (depth > MAX_CANONICAL_DEPTH) {
      throw new ReplayError(`diffStates: nesting exceeds depth cap ${MAX_CANONICAL_DEPTH} (rejected, not overflowed)`);
    }
    // Leaf fast-path first (Law 1: guards at the top).
    if (isLeaf(expected) && isLeaf(actual)) {
      if (!sameLeaf(expected, actual)) {
        this.push({ path, kind: "changed", expected: compact(expected, depth), actual: compact(actual, depth) });
      }
      return;
    }
    if (isLeaf(expected) !== isLeaf(actual)) {
      this.push({ path, kind: "changed", expected: compact(expected, depth), actual: compact(actual, depth) });
      return;
    }
    if (Array.isArray(expected) && Array.isArray(actual)) {
      this.walkArrays(expected, actual, path, depth);
      return;
    }
    if (expected instanceof Map && actual instanceof Map) {
      this.walkMaps(expected, actual, path, depth);
      return;
    }
    if (expected instanceof Set && actual instanceof Set) {
      this.walkSets(expected, actual, path, depth);
      return;
    }
    if (isPlainDict(expected) && isPlainDict(actual)) {
      this.walkObjects(expected, actual, path, depth);
      return;
    }
    // Structural kind mismatch (array vs map vs object…).
    this.push({ path, kind: "changed", expected: compact(expected, depth), actual: compact(actual, depth) });
  }

  private walkArrays(expected: readonly unknown[], actual: readonly unknown[], path: string, depth: number): void {
    const shared = Math.min(expected.length, actual.length);
    for (let i = 0; i < shared; i += 1) {
      this.walk(expected[i], actual[i], joinBracket(path, `[${i}]`), depth + 1);
    }
    for (let i = shared; i < expected.length; i += 1) {
      this.push({ path: joinBracket(path, `[${i}]`), kind: "missing-in-actual" });
    }
    for (let i = shared; i < actual.length; i += 1) {
      this.push({ path: joinBracket(path, `[${i}]`), kind: "extra-in-actual", actual: compact(actual[i], depth + 1) });
    }
  }

  private walkMaps(expected: Map<unknown, unknown>, actual: Map<unknown, unknown>, path: string, depth: number): void {
    // Insertion-order pair comparison: position OR key disagreement is a
    // divergence (state Map order is content, §3.4).
    const expectedPairs = [...expected.entries()];
    const actualPairs = [...actual.entries()];
    const shared = Math.min(expectedPairs.length, actualPairs.length);
    for (let i = 0; i < shared; i += 1) {
      const [ek, ev] = expectedPairs[i] as [unknown, unknown];
      const [ak, av] = actualPairs[i] as [unknown, unknown];
      const label = isIndexableKey(ak) ? `⟨${String(ak)}⟩` : `⟨#${i}⟩`;
      const child = joinBracket(path, label);
      if (!sameLeaf(ek, ak)) {
        this.push({ path: child, kind: "changed", expected: `key ${compact(ek, depth + 1)}`, actual: `key ${compact(ak, depth + 1)}` });
      }
      this.walk(ev, av, child, depth + 1);
    }
    for (let i = shared; i < expectedPairs.length; i += 1) {
      const [ek] = expectedPairs[i] as [unknown, unknown];
      this.push({ path: joinBracket(path, `⟨${isIndexableKey(ek) ? String(ek) : `#${i}`}⟩`), kind: "missing-in-actual" });
    }
    for (let i = shared; i < actualPairs.length; i += 1) {
      const [ak, av] = actualPairs[i] as [unknown, unknown];
      this.push({
        path: joinBracket(path, `⟨${isIndexableKey(ak) ? String(ak) : `#${i}`}⟩`),
        kind: "extra-in-actual",
        actual: compact(av, depth + 1),
      });
    }
  }

  private walkSets(expected: Set<unknown>, actual: Set<unknown>, path: string, depth: number): void {
    const missing = [...expected].filter((m) => !actual.has(m));
    const extra = [...actual].filter((m) => !expected.has(m));
    for (const m of missing) this.push({ path: joinBracket(path, `⟨${compactKeyish(m, depth + 1)}⟩`), kind: "missing-in-actual" });
    for (const m of extra) this.push({ path: joinBracket(path, `⟨${compactKeyish(m, depth + 1)}⟩`), kind: "extra-in-actual", actual: compact(m, depth + 1) });
  }

  private walkObjects(expected: Record<string, unknown>, actual: Record<string, unknown>, path: string, depth: number): void {
    const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort(compareCodeUnits);
    for (const key of keys) {
      const inExpected = key in expected;
      const inActual = key in actual;
      const child = childPath(path, key);
      if (inExpected && inActual) {
        this.walk(expected[key], actual[key], child, depth + 1);
      } else if (inExpected) {
        this.push({ path: child, kind: "missing-in-actual" });
      } else {
        this.push({ path: child, kind: "extra-in-actual", actual: compact(actual[key], depth + 1) });
      }
    }
  }
}

function compactKeyish(value: unknown, depth: number): string {
  const c = compact(value, depth);
  return typeof c === "string" || typeof c === "number" || typeof c === "bigint" ? String(c) : JSON.stringify(c) ?? String(c);
}

function isLeaf(value: unknown): boolean {
  return value === null || value === undefined || (typeof value !== "object" && typeof value !== "function");
}

function isPlainDict(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Map) && !(value instanceof Set);
}

/** Diff two decoded state values, reporting up to `limit` divergent paths. */
export function diffStates(expected: unknown, actual: unknown, options: DiffOptions = {}): DiffResult {
  const walker = new DiffWalk(options.limit ?? 64);
  walker.walk(expected, actual, "", 0);
  return walker.result;
}
