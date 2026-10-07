/**
 * unattended/guardrails.ts — the Nothing-Catastrophic law as DATA.
 *
 * §9.2 "The Long Weekend": the company runs on YOUR policies for ≤48h while
 * you are offline, and "a LOT can drift, but nothing catastrophic may
 * happen". This file is the enforcement contract for that second half: a
 * catastrophe is a DECLARATIVE rule (rows, not code — the same law the
 * Policy Book obeys, §7.14), evaluated once per tick boundary by
 * fastForward.ts. A triggered guard HALTS the run; it never fires mid-tick.
 *
 * Closed vocabularies (parse, don't validate): every guard is one of six
 * kinds, every custom threshold rides one of five enumerated metrics.
 * Functions are ILLEGAL in a guard record — a config that could compute
 * arbitrary logic would smuggle nondeterminism into the offline session.
 *
 *  §-grounding for the built-in shapes:
 *  • freeCashDepleted  — insolvency ends the company (economy/ledger
 *    six-bucket cash; the weekend must not end broke — and a refused burn
 *    IS inability to pay, chain-armed even while cash rides above zero).
 *  • totalOutage       — every ingress lane serving nothing UNDER DEMAND
 *    (§6.2 lanes; the player returns to a dead company; a quiet world is
 *    idle, not dead, and never breaches).
 *  • cascadeCollapse   — a critical mass of nodes degraded at once
 *    (TopologyGraph blast-radius story; §6.13 health cells).
 *  • ruleRunaway       — "automation executes your mistakes at machine
 *    speed" (hosting_game.md:2187). THE unattended catastrophe: a
 *    self-inflicted Policy-Book conflict loop.
 *  • errorBudgetGone   — SLA error budgets exhausted (economy/errorBudget
 *    remainingSec; commitment breach while nobody is watching).
 *
 * PROVISIONAL owner taste (marked for ratification): the five BUILTIN
 * defaults below are §-grounded guesses, not canon. Omitting a field takes
 * the builtin default; supplying one overrides it.
 */
import type { Fixed, ClockState, SimMinute, SimTick } from "../types.ts";
import { FIXED_SCALE, FIXED_ZERO, compare, toNumber } from "../kernel/fixed.ts";
import { compareCodeUnits } from "../internal/canonical.ts";

/* ═══════════════════════════ closed vocabularies ═══════════════════════════ */

/** The enumerated observation selectors a custom threshold may ride.
 *  CLOSED on purpose — the "rows-not-code" law; adding a metric means
 *  adding it here AND to the per-tick sampler in fastForward.ts. */
export const GUARD_METRICS = Object.freeze([
  "cash.free",
  "servedRate",
  "nodesDegradedPct",
  "ruleFiringsPerMin",
  "errorBudgetSec",
] as const);

export type GuardMetric = (typeof GUARD_METRICS)[number];

/** The six legal guard kinds. */
export const GUARD_KINDS = Object.freeze([
  "freeCashDepleted",
  "totalOutage",
  "cascadeCollapse",
  "ruleRunaway",
  "errorBudgetGone",
  "threshold",
] as const);

export type GuardKind = (typeof GUARD_KINDS)[number];

export const GUARD_COMPARATORS = Object.freeze(["lt", "lte", "gt", "gte"] as const);

export type GuardComparator = (typeof GUARD_COMPARATORS)[number];

/* ═══════════════════════════ the rule records ═══════════════════════════ */

/** Free cash ≤ 0 sustained (sim minutes) — insolvency. A ledger REFUSAL on
 *  this tick (a burn that could not be covered, an invoice settle routed
 *  around the negative-bucket law) also arms the chain: inability to PAY is
 *  the catastrophe the cash number alone hides while pennies sit stuck
 *  above zero (review F5). */
export interface FreeCashDepletedDef {
  readonly type: "freeCashDepleted";
  readonly sustainedMin: SimMinute;
}

/** Served rate exactly 0 across every lane for N minutes while DEMAND
 *  existed — total darkness. The demand gate (review F2): zero served with
 *  zero arrivals in the trailing window is an IDLE world, and idle is
 *  CLEAR (not "unavailable": the world is fully observed, merely quiet —
 *  the sustain chain resets), never a breach. Dead-under-load still halts. */
export interface TotalOutageDef {
  readonly type: "totalOutage";
  readonly sustainedMin: SimMinute;
}

/** nodesDegradedPct strictly above the threshold, sustained. "Degraded" =
 *  a node's service-rate slot stamp exceeds degradeServiceRateUs (the
 *  data-driven reading of a §6.13 degraded health cell). */
export interface CascadeCollapseDef {
  readonly type: "cascadeCollapse";
  readonly degradedPctGt: number;
  readonly sustainedMin: SimMinute;
}

/** ruleFiringsPerMin strictly above threshold, sustained — the §2187
 *  machine-speed mistake. Fixed Q16.16 firings per (sim) minute. */
export interface RuleRunawayDef {
  readonly type: "ruleRunaway";
  readonly firingsPerMinGt: Fixed;
  readonly sustainedMin: SimMinute;
}

/** Minimum remaining SLA error budget across contracts at or below the
 *  threshold seconds (Fixed), sustained. Requires a THREADED economy: a
 *  guard over an unavailable observation reports "unavailable" and NEVER
 *  fires — it does not fire on ignorance. */
export interface ErrorBudgetGoneDef {
  readonly type: "errorBudgetGone";
  readonly remainingSecLte: Fixed;
  readonly sustainedMin: SimMinute;
}

/** Custom closed-vocab threshold on one GUARD_METRICS selector. */
export interface ThresholdGuardDef {
  readonly type: "threshold";
  readonly metric: GuardMetric;
  readonly comparator: GuardComparator;
  readonly value: Fixed;
  readonly sustainedMin: SimMinute;
}

export type CatastropheDef =
  | FreeCashDepletedDef
  | TotalOutageDef
  | CascadeCollapseDef
  | RuleRunawayDef
  | ErrorBudgetGoneDef
  | ThresholdGuardDef;

/** PROVISIONAL (owner-taste, §-grounded guesses): builtin defaults. A bare
 *  `{type:"totalOutage"}` is a complete guard through this table. */
export const BUILTIN_CATASTROPHE_DEFS = Object.freeze({
  freeCashDepleted: { type: "freeCashDepleted", sustainedMin: 10 },
  totalOutage: { type: "totalOutage", sustainedMin: 30 },
  cascadeCollapse: { type: "cascadeCollapse", degradedPctGt: 50, sustainedMin: 10 },
  ruleRunaway: { type: "ruleRunaway", firingsPerMinGt: guardFixedFromInt(30), sustainedMin: 5 },
  errorBudgetGone: { type: "errorBudgetGone", remainingSecLte: 0n, sustainedMin: 10 },
} as const satisfies Record<string, CatastropheDef>);

/* ═══════════════════════════ error family + parse ═══════════════════════════ */

/** All unattended-lane failures carry this code family (fail-fast, named).
 *  CLOSED union — every code has a live throw site (the review sweep
 *  deleted the never-minted REPLAY_STATE and renamed NO_TRAFFIC, whose one
 *  site refuses an EMPTY BOARD, not empty traffic — traffic emptiness is
 *  the NO-TRAFFIC warn's job). Grammar follows the versus/deck.ts family
 *  and docs/API-REFERENCE.md: `unattended[CODE] at 'path': detail`. */
export type UnattendedErrorCode =
  | "GUARD_PARSE"
  | "CONFIG_PARSE"
  | "TICK_BOUNDS"
  | "BOARD_EMPTY"
  | "WHATIF_PATCH"
  | "CHECKPOINT_CADENCE";

export class UnattendedError extends Error {
  readonly code: UnattendedErrorCode;
  readonly path: string;

  constructor(code: UnattendedErrorCode, path: string, message: string) {
    super(`unattended[${code}] at '${path}': ${message}`);
    this.name = "UnattendedError";
    this.code = code;
    this.path = path;
  }
}

/** GUARD_PARSE is reserved STRICTLY for guard-record parse failures —
 *  aggregate math that overflows the Fixed CARRIER is not a parse error
 *  (review F1: mislabeled GUARD_PARSE sent hosts hunting for a bad config
 *  row while their busy weekend's DATA was simply large). */
function bad(path: string, message: string): never {
  throw new UnattendedError("GUARD_PARSE", path, message);
}

/** Q16.16 from a safe plain integer (fixed.ts fromInt has a ±32768 raw range
 *  designed for protocol values; guard thresholds ride the same law).
 *  LEGAL USE: authoring THRESHOLD constants (they name human decisions that
 *  fit the carrier). ILLEGAL USE: converting run-time SUMS/AGGREGATES — a
 *  busy weekend banks 60 000 arrivals an hour; route those through the raw
 *  bigint domain and a single `fromRatio` (review F1). */
export function guardFixedFromInt(whole: number): Fixed {
  if (!Number.isSafeInteger(whole)) bad("guardrails/guardFixedFromInt", `needs a safe integer, got ${String(whole)}`);
  if (whole > 32767 || whole < -32768) bad("guardrails/guardFixedFromInt", `${whole} overflows the Q16.16 raw range`);
  return BigInt(whole) * FIXED_SCALE;
}

/** Parsed + frozen guard: the trusted def plus its stable reason code and
 *  the fields the runner needs without re-reading the union. */
export interface ParsedGuard {
  readonly def: CatastropheDef;
  readonly kind: GuardKind;
  /** Halt reason line: `guard:<kind>` (sorted-stable, report-facing). */
  readonly reason: string;
  readonly sustainedMin: SimMinute;
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    bad(path, `expected a guard object, got ${Array.isArray(value) ? "array" : typeof value}`);
  }
  return value as Record<string, unknown>;
}

function readSustainedMin(src: Record<string, unknown>, fallback: SimMinute, path: string): SimMinute {
  const raw = src["sustainedMin"] ?? fallback;
  if (typeof raw !== "number" || !Number.isSafeInteger(raw) || raw < 1) {
    bad(`${path}.sustainedMin`, `must be a safe integer ≥ 1, got ${String(raw)}`);
  }
  return raw;
}

function readFractionToFixed(raw: unknown, field: string, path: string): Fixed {
  if (typeof raw === "bigint") return raw;
  if (typeof raw === "number" && Number.isFinite(raw)) return percentToFixed(raw);
  if (typeof raw === "function") bad(`${path}.${field}`, "functions are illegal in guard config (rows-not-code law)");
  bad(`${path}.${field}`, `must be a Fixed bigint or finite number, got ${typeof raw}`);
}

function readPercent(src: Record<string, unknown>, field: string, fallback: number, path: string): number {
  const raw = src[field] ?? fallback;
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0 || raw >= 100) {
    bad(`${path}.${field}`, `must be a finite percent in (0,100), got ${String(raw)}`);
  }
  return raw;
}

/**
 * Parse one unknown guard record into a frozen ParsedGuard. Fail-loud on
 * anything outside the closed vocabularies: unknown `type`, unknown
 * `metric`, unknown `comparator`, and FUNCTION-BEARING configs (the classic
 * "make the guard smart" smell) are refused by name.
 */
export function parseCatastropheDef(raw: unknown, path = "guard"): ParsedGuard {
  const src = asRecord(raw, path);
  // Rows-not-code, enforced everywhere: a callable anywhere in a guard
  // record is the "make the guard smart" smell — refused by name, not
  // silently dropped with the other unknown keys.
  for (const key of Object.keys(src)) {
    if (typeof src[key] === "function") bad(`${path}.${key}`, "functions are illegal in guard config (rows-not-code law)");
  }
  const kind = src["type"];
  if (typeof kind !== "string" || !(GUARD_KINDS as readonly string[]).includes(kind)) {
    bad(`${path}.type`, `unknown guard kind ${String(kind)} — closed vocabulary is ${GUARD_KINDS.join("|")}`);
  }
  const parsedKind = kind as GuardKind;
  let def: CatastropheDef;

  if (parsedKind === "threshold") {
    const metric = src["metric"];
    if (typeof metric !== "string" || !(GUARD_METRICS as readonly string[]).includes(metric)) {
      bad(`${path}.metric`, `unknown metric ${String(metric)} — closed vocabulary is ${GUARD_METRICS.join("|")}`);
    }
    const comparator = src["comparator"];
    if (typeof comparator !== "string" || !(GUARD_COMPARATORS as readonly string[]).includes(comparator)) {
      bad(`${path}.comparator`, `unknown comparator ${String(comparator)} — closed vocabulary is ${GUARD_COMPARATORS.join("|")}`);
    }
    if (src["value"] === undefined) bad(`${path}.value`, "a threshold guard needs an explicit value");
    def = Object.freeze({
      type: "threshold" as const,
      metric: metric as GuardMetric,
      comparator: comparator as GuardComparator,
      value: readFractionToFixed(src["value"], "value", path),
      sustainedMin: readSustainedMin(src, 1, path),
    });
  } else if (parsedKind === "cascadeCollapse") {
    def = Object.freeze({
      type: "cascadeCollapse" as const,
      degradedPctGt: readPercent(src, "degradedPctGt", BUILTIN_CATASTROPHE_DEFS.cascadeCollapse.degradedPctGt, path),
      sustainedMin: readSustainedMin(src, BUILTIN_CATASTROPHE_DEFS.cascadeCollapse.sustainedMin, path),
    });
  } else if (parsedKind === "ruleRunaway") {
    def = Object.freeze({
      type: "ruleRunaway" as const,
      firingsPerMinGt: readFractionToFixed(
        src["firingsPerMinGt"] ?? BUILTIN_CATASTROPHE_DEFS.ruleRunaway.firingsPerMinGt,
        "firingsPerMinGt",
        path,
      ),
      sustainedMin: readSustainedMin(src, BUILTIN_CATASTROPHE_DEFS.ruleRunaway.sustainedMin, path),
    });
  } else if (parsedKind === "errorBudgetGone") {
    def = Object.freeze({
      type: "errorBudgetGone" as const,
      remainingSecLte: readFractionToFixed(
        src["remainingSecLte"] ?? BUILTIN_CATASTROPHE_DEFS.errorBudgetGone.remainingSecLte,
        "remainingSecLte",
        path,
      ),
      sustainedMin: readSustainedMin(src, BUILTIN_CATASTROPHE_DEFS.errorBudgetGone.sustainedMin, path),
    });
  } else if (parsedKind === "totalOutage") {
    def = Object.freeze({
      type: "totalOutage" as const,
      sustainedMin: readSustainedMin(src, BUILTIN_CATASTROPHE_DEFS.totalOutage.sustainedMin, path),
    });
  } else {
    def = Object.freeze({
      type: "freeCashDepleted" as const,
      sustainedMin: readSustainedMin(src, BUILTIN_CATASTROPHE_DEFS.freeCashDepleted.sustainedMin, path),
    });
  }

  return Object.freeze({
    def,
    kind: parsedKind,
    reason: guardReasonCode(parsedKind),
    sustainedMin: def.sustainedMin,
  });
}

/** Reason codes are stable across runs: `guard:<snake-kind>`. */
export function guardReasonCode(kind: GuardKind): string {
  return `guard:${kind}`;
}

/** Parse a whole guard list. Exact-duplicate guards are refused — two
 *  identical rows would double-report the same catastrophe. */
export function parseGuardList(raw: readonly unknown[]): readonly ParsedGuard[] {
  const parsed = raw.map((guard, i) => parseCatastropheDef(guard, `guard[${i}]`));
  const seen = new Set<string>();
  for (const guard of parsed) {
    const identity = guardIdentity(guard);
    if (seen.has(identity)) bad("guards", `duplicate guard ${identity}`);
    seen.add(identity);
  }
  // Caller order is KEPT: it is part of the config's meaning (on a shared
  // trigger tick the first-listed guard wins).
  return Object.freeze([...parsed]);
}

function guardIdentity(guard: ParsedGuard): string {
  return encodeTaggedGuard(guard.def);
}

/** Deterministic fingerprint of a def (identity + future caching). */
export function encodeTaggedGuard(def: CatastropheDef): string {
  const parts: string[] = [def.type, String(def.sustainedMin)];
  if (def.type === "threshold") parts.push(def.metric, def.comparator, String(def.value));
  if (def.type === "cascadeCollapse") parts.push(String(def.degradedPctGt));
  if (def.type === "ruleRunaway") parts.push(String(def.firingsPerMinGt));
  if (def.type === "errorBudgetGone") parts.push(String(def.remainingSecLte));
  return parts.join("|");
}

/* ═══════════════════════════ evaluation ═══════════════════════════ */

/** One tick-boundary observation set, already reduced to Fixed-safe facts.
 *  `metrics` is keyed ONLY by closed-vocab names; an absent key means the
 *  observation is unavailable this tick (fog, unthreaded subsystem) — a
 *  guard over it evaluates "unavailable" and its sustain chain RESETS. */
export interface GuardrailSample {
  readonly tick: SimTick;
  readonly minute: SimMinute;
  readonly clocks: ClockState;
  readonly businessMinute: SimMinute;
  readonly metrics: ReadonlyMap<GuardMetric, Fixed>;
  /** True when a composed economy state backs this sample (cash/budget
   *  observations then exist). Kept for report honesty + future gates. */
  readonly economyAvailable: boolean;
  /** True when at least one contract error budget is readable. */
  readonly errorBudgetAvailable: boolean;
  /** Arrivals observed inside the guard's trailing window — DEMAND
   *  evidence (review F2). totalOutage breaches only under demand: an
   *  idle world (zero served AND zero asked) is fully observed and fine,
   *  so its verdict is "clear" — the sustain chain resets, it does not
   *  bank quiet minutes. */
  readonly windowArrivals: number;
  /** Ledger refusals counted on THIS tick (opex burns that could not be
   *  covered + invoice settles voided by the negative-bucket law). A
   *  refusal IS inability to pay: it arms the freeCashDepleted chain even
   *  while the cash number rides above zero (review F5). */
  readonly refusedBurns: number;
}

export type GuardVerdict = "ok" | "armed" | "triggered" | "unavailable";

export interface GuardEvaluation {
  readonly reason: string;
  readonly verdict: GuardVerdict;
  /** Consecutive breach minutes counted so far (0 when clear/unavailable). */
  readonly runMin: number;
}

/** Pure fold: (guard, sample, priorRun) → next verdict + next counter.
 *  Sustain counters live OUTSIDE the evaluator; fastForward threads them. */
export function evaluateGuardrail(
  guard: ParsedGuard,
  sample: GuardrailSample,
  priorRun: number,
): { readonly evaluation: GuardEvaluation; readonly nextRun: number } {
  const breach = breachOf(guard.def, sample);
  if (breach === "unavailable") {
    // Ignorance breaks the chain: a guard must not bank minutes it could
    // not actually observe.
    return { evaluation: { reason: guard.reason, verdict: "unavailable", runMin: 0 }, nextRun: 0 };
  }
  if (breach === "clear") {
    return { evaluation: { reason: guard.reason, verdict: "ok", runMin: 0 }, nextRun: 0 };
  }
  const runMin = priorRun + 1;
  if (runMin >= guard.sustainedMin) {
    return { evaluation: { reason: guard.reason, verdict: "triggered", runMin }, nextRun: runMin };
  }
  return { evaluation: { reason: guard.reason, verdict: "armed", runMin }, nextRun: runMin };
}

type Breach = "breach" | "clear" | "unavailable";

function breachOf(def: CatastropheDef, sample: GuardrailSample): Breach {
  switch (def.type) {
    case "freeCashDepleted": {
      // Never fires on ignorance: without a threaded economy the mirrored
      // cash is mint-zero, and a zero that means "unobserved" must not
      // masquerade as a zero that means "broke".
      if (!sample.economyAvailable) return "unavailable";
      // Inability-to-pay arms the chain (review F5): cash stuck at a small
      // positive while every burn bounces reads "above zero" to the metric
      // alone — the refusals are the catastrophe, one chain step per tick
      // no matter how many burns bounced inside it (no double-fire).
      if (sample.refusedBurns > 0) return "breach";
      return compareMetric(sample, "cash.free", (v) => compare(v, FIXED_ZERO) <= 0);
    }
    case "totalOutage": {
      // Demand gate (review F2): idle ≠ dead ≠ ignorant. Zero arrivals in
      // the window means NOTHING was denied service — the honest verdict
      // is CLEAR (the chain resets), not a banked breach and not an
      // "unavailable" dodge. Traffic present and nothing served is death.
      if (sample.windowArrivals <= 0) return "clear";
      return compareMetric(sample, "servedRate", (v) => v === FIXED_ZERO);
    }
    case "cascadeCollapse":
      return compareMetric(sample, "nodesDegradedPct", (v) => compare(v, percentToFixed(def.degradedPctGt)) > 0);
    case "ruleRunaway":
      return compareMetric(sample, "ruleFiringsPerMin", (v) => compare(v, def.firingsPerMinGt) > 0);
    case "errorBudgetGone": {
      if (!sample.errorBudgetAvailable) return "unavailable";
      return compareMetric(sample, "errorBudgetSec", (v) => compare(v, def.remainingSecLte) <= 0);
    }
    case "threshold": {
      if (def.metric === "cash.free" && !sample.economyAvailable) return "unavailable";
      if (def.metric === "errorBudgetSec" && !sample.errorBudgetAvailable) return "unavailable";
      const value = sample.metrics.get(def.metric);
      if (value === undefined) return "unavailable";
      const c = compare(value, def.value);
      if (def.comparator === "lt") return c < 0 ? "breach" : "clear";
      if (def.comparator === "lte") return c <= 0 ? "breach" : "clear";
      if (def.comparator === "gt") return c > 0 ? "breach" : "clear";
      return c >= 0 ? "breach" : "clear";
    }
  }
}

function compareMetric(sample: GuardrailSample, metric: GuardMetric, test: (v: Fixed) => boolean): Breach {
  const value = sample.metrics.get(metric);
  if (value === undefined) return "unavailable";
  return test(value) ? "breach" : "clear";
}

/** Percent (0,100) → Fixed, integer-exact for one-decimal taste values. */
export function percentToFixed(pct: number): Fixed {
  const hundredths = Math.round(pct * 100);
  return (BigInt(hundredths) * FIXED_SCALE) / 100n;
}

/** Census: guard kinds in a parsed list, sorted by code-unit (report use). */
export function guardKindCensus(guards: readonly ParsedGuard[]): ReadonlyMap<GuardKind, number> {
  const counts = new Map<GuardKind, number>();
  for (const guard of guards) {
    counts.set(guard.kind, (counts.get(guard.kind) ?? 0) + 1);
  }
  const sorted = [...counts.keys()].sort(compareCodeUnits);
  return Object.freeze(new Map(sorted.map((kind) => [kind, counts.get(kind) as number])));
}

/** Builtin-threshold probe for reports: the ruleRunaway default as a
 *  human-readable count (PROVISIONAL owner-taste value). */
export function ruleRunawayDefaultPerMin(): number {
  return toNumber(BUILTIN_CATASTROPHE_DEFS.ruleRunaway.firingsPerMinGt);
}
