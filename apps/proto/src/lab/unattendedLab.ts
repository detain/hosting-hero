/**
 * unattendedLab.ts — the PURE model behind UnattendedLabPanel (§9.2 "The Long
 * Weekend" made playable in the browser).
 *
 * HudLabPanel precedent: the lab drives the sim-core service LOCALLY (no
 * worker) because runUnattended / runWhatIf are pure synchronous functions —
 * a weekend of 240 ticks is one atomic computation, not a live ticker.
 * Honesty law: because the call is atomic, progress yields happen per LEG
 * (config → run → done), never pretend-mid-tick; the tick cap (2880, the
 * LONG_WEEKEND ceiling) is what keeps each atomic block browser-friendly.
 *
 * Nothing in this file touches Vue. The panel is a thin renderer over these
 * records; every string here is deterministic (pinned by __tests__).
 */
import type { Contract, Fixed, PolicyCard, RunSeed } from "@hh/sim-core/types";
import { asEntityId, asMoney, asRunSeed } from "@hh/sim-core/types";
import { MICROS_PER_MIN, fromInt } from "@hh/sim-core/kernel";
import {
  BUILTIN_CATASTROPHE_DEFS,
  GUARD_COMPARATORS,
  GUARD_KINDS,
  GUARD_METRICS,
  LONG_WEEKEND_MAX_TICKS,
  UNATTENDED_BASELINE_RATE_PER_MIN,
  UnattendedError,
  runUnattended,
  runWhatIf,
} from "@hh/sim-core/unattended";
import type {
  GuardComparator,
  GuardKind,
  GuardMetric,
  RunUnattendedConfig,
  TrafficSurgeDelta,
  UnattendedBoardCast,
  UnattendedHourBucket,
  UnattendedOpexDraft,
  UnattendedReport,
  WhatIfDelta,
  WhatIfResult,
} from "@hh/sim-core/unattended";
import { formatMoney, NO_DATA, tabularNumber } from "../chrome/numberLaw";

/* ═══════════════════════════ board presets ═══════════════════════════ */

/** A named starting board. Numbers mirror the sanctioned shapes: the roomy
 *  preset echoes simCoreRunner's G1 lane (edge → origin, dependency edge in
 *  between), the tight preset is the fixtures' SATURATED_ONLY node (1 slot,
 *  120s service) so totalOutage has something real to witness. */
export interface BoardPreset {
  readonly id: string;
  readonly label: string;
  readonly note: string;
  readonly board: UnattendedBoardCast;
}

export const BOARD_PRESETS: readonly BoardPreset[] = Object.freeze([
  Object.freeze({
    id: "g1-lane",
    label: "G1 lane — roomy",
    note: "edge → origin, headroom everywhere. The boring profitable weekend.",
    board: Object.freeze({
      nodes: Object.freeze([
        Object.freeze({ id: "edge", kind: "waf", slots: 400, serviceTimeUs: 2_000_000n, inspectionDepth: "inspect" as const }),
        Object.freeze({ id: "origin", kind: "web", slots: 400, serviceTimeUs: 2_000_000n, dependencyNodeId: "edge", inspectionDepth: "pass-through" as const }),
      ]),
      edges: Object.freeze([Object.freeze({ id: "edge-data-origin", relation: "data" as const, from: "edge", to: "origin" })]),
    }),
  }),
  Object.freeze({
    id: "tight-lane",
    label: "Tight lane — one slot",
    note: "1 slot, 120 s service: everything bounces. Built for the totalOutage guard to prove itself.",
    board: Object.freeze({
      nodes: Object.freeze([
        Object.freeze({ id: "web-1", kind: "web", slots: 1, serviceTimeUs: 120_000_000_000n }),
      ]),
    }),
  }),
  Object.freeze({
    id: "degraded-pair",
    label: "Degraded pair — hot origin",
    note: "Origin choked to 4 slots behind a healthy edge; cascadeCollapse bait.",
    board: Object.freeze({
      nodes: Object.freeze([
        Object.freeze({ id: "edge", kind: "waf", slots: 400, serviceTimeUs: 500_000n }),
        Object.freeze({ id: "origin", kind: "web", slots: 4, serviceTimeUs: 60_000_000n, dependencyNodeId: "edge" }),
      ]),
      edges: Object.freeze([Object.freeze({ id: "edge-data-origin", relation: "data" as const, from: "edge", to: "origin" })]),
    }),
  }),
]);

export function boardPresetById(id: string): BoardPreset {
  const hit = BOARD_PRESETS.find((preset) => preset.id === id);
  if (hit === undefined) throw new Error(`unknown board preset '${id}'`);
  return hit;
}

/* ═══════════════════════════ guard editor rows ═══════════════════════════ */

/** One row of the guard editor. The six GUARD_KINDS, each armable, each with
 *  its PROVISIONAL defaults surfaced as editable fields (owner decision —
 *  these numbers are §-grounded guesses, the UI must SAY so). */
export interface GuardRowDraft {
  readonly kind: GuardKind;
  /** Mutable: this is editor state — the toggle flips it in place. */
  enabled: boolean;
  /** Sustained minutes before the halt (≥1, parse-enforced). */
  sustainedMin: number;
  /** cascadeCollapse only: percent in (0,100). */
  degradedPctGt: number;
  /** ruleRunaway only: firings per sim-minute. */
  firingsPerMinGt: number;
  /** errorBudgetGone only: seconds of budget remaining. */
  remainingSecLte: number;
  /** threshold only: closed-vocab selector + comparator + value. */
  metric: GuardMetric;
  comparator: GuardComparator;
  value: number;
}

const PROVISIONAL_NOTE =
  "PROVISIONAL defaults (owner-taste, guardrails.ts BUILTIN_CATASTROPHE_DEFS) — edit with intent.";

export function provisionalNote(): string {
  return PROVISIONAL_NOTE;
}

/** Fresh editor state: the two money/life guards armed at builtin defaults,
 *  everything else dormant until the player arms it. */
export function defaultGuardRows(): GuardRowDraft[] {
  return GUARD_KINDS.map((kind) => ({
    kind,
    enabled: kind === "freeCashDepleted" || kind === "totalOutage",
    sustainedMin: builtinSustained(kind),
    degradedPctGt: BUILTIN_CATASTROPHE_DEFS.cascadeCollapse.degradedPctGt,
    firingsPerMinGt: 30,
    remainingSecLte: 0,
    metric: "cash.free" as GuardMetric,
    comparator: "lt" as GuardComparator,
    value: 1,
  }));
}

function builtinSustained(kind: GuardKind): number {
  switch (kind) {
    case "freeCashDepleted":
      return BUILTIN_CATASTROPHE_DEFS.freeCashDepleted.sustainedMin;
    case "totalOutage":
      return BUILTIN_CATASTROPHE_DEFS.totalOutage.sustainedMin;
    case "cascadeCollapse":
      return BUILTIN_CATASTROPHE_DEFS.cascadeCollapse.sustainedMin;
    case "ruleRunaway":
      return BUILTIN_CATASTROPHE_DEFS.ruleRunaway.sustainedMin;
    case "errorBudgetGone":
      return BUILTIN_CATASTROPHE_DEFS.errorBudgetGone.sustainedMin;
    case "threshold":
      return 1; // no builtin — the runner's floor
    default:
      return 1;
  }
}

/** Which extra fields a kind exposes (panel renders inputs off this map). */
export function guardRowFields(kind: GuardKind): readonly string[] {
  switch (kind) {
    case "cascadeCollapse":
      return Object.freeze(["degradedPctGt", "sustainedMin"]);
    case "ruleRunaway":
      return Object.freeze(["firingsPerMinGt", "sustainedMin"]);
    case "errorBudgetGone":
      return Object.freeze(["remainingSecLte", "sustainedMin"]);
    case "threshold":
      return Object.freeze(["metric", "comparator", "value", "sustainedMin"]);
    default:
      return Object.freeze(["sustainedMin"]);
  }
}

/** Turn editor rows into the plain guard RECORDS RunUnattendedConfig wants
 *  (rows-not-code: data in, dice out — parse/validation belongs to
 *  parseCatastropheDef inside runUnattended, which fails loud via
 *  UnattendedError and the panel shows its grammar verbatim). */
export function guardRowsToRecords(rows: readonly GuardRowDraft[]): readonly unknown[] {
  const out: unknown[] = [];
  for (const row of rows) {
    if (!row.enabled) continue;
    switch (row.kind) {
      case "threshold":
        out.push({
          type: "threshold",
          metric: row.metric,
          comparator: row.comparator,
          value: row.value,
          sustainedMin: row.sustainedMin,
        });
        break;
      case "cascadeCollapse":
        out.push({ type: row.kind, degradedPctGt: row.degradedPctGt, sustainedMin: row.sustainedMin });
        break;
      case "ruleRunaway":
        out.push({ type: row.kind, firingsPerMinGt: row.firingsPerMinGt, sustainedMin: row.sustainedMin });
        break;
      case "errorBudgetGone":
        out.push({ type: row.kind, remainingSecLte: row.remainingSecLte, sustainedMin: row.sustainedMin });
        break;
      default:
        out.push({ type: row.kind, sustainedMin: row.sustainedMin });
    }
  }
  return Object.freeze(out);
}

export { GUARD_KINDS, GUARD_METRICS, GUARD_COMPARATORS };

/* ═══════════════════════════ opex mini-form ═══════════════════════════ */

/** One burn row. Dollars ride the UI; the ledger is µ$ integers (§6 µ-usd
 *  law), so parse converts exactly once at the boundary. */
export interface OpexRowDraft {
  atMinute: number;
  dollars: number;
  memo: string;
}

export function parseOpexRows(rows: readonly OpexRowDraft[]): readonly UnattendedOpexDraft[] {
  const out: UnattendedOpexDraft[] = [];
  for (const [index, row] of rows.entries()) {
    const where = `opex[${index}]`;
    if (!Number.isSafeInteger(row.atMinute) || row.atMinute < 0) {
      throw new Error(`${where}.atMinute must be an integer ≥ 0, got ${String(row.atMinute)}`);
    }
    if (!Number.isFinite(row.dollars) || row.dollars <= 0) {
      throw new Error(`${where}.dollars must be > 0, got ${String(row.dollars)}`);
    }
    const micro = Math.round(row.dollars * 1_000_000);
    if (!Number.isSafeInteger(micro) || micro < 1) {
      throw new Error(`${where} rounds below 1 µ$ — a burn must be at least one micro-dollar`);
    }
    const memo = row.memo.trim().length > 0 ? row.memo.trim() : `opex-${String(index + 1)}`;
    out.push(Object.freeze({ atMinute: row.atMinute, amountMicroUsd: BigInt(micro), memo }));
  }
  return Object.freeze(out);
}

/* ═══════════════════════════ the form record ═══════════════════════════ */

export interface UnattendedLabForm {
  seed: number;
  boardPresetId: string;
  ticks: number;
  checkpointEvery: number;
  baselineRatePerMin: number;
  guardRows: GuardRowDraft[];
  /** Opening free cash in dollars (posted as the unattended:opening-balance
   *  entry). 0 + no rows ⇒ money absent entirely — and the runner warns
   *  MONEY-GUARD-WITHOUT-ECONOMY at armed money guards. Honest silence. */
  openingDollars: number;
  opexRows: OpexRowDraft[];
  /** Arm a single gold contract so the money lane has revenue physics too. */
  withContract: boolean;
}

export function defaultForm(): UnattendedLabForm {
  return {
    seed: 904,
    boardPresetId: "g1-lane",
    ticks: 240,
    checkpointEvery: 60,
    baselineRatePerMin: UNATTENDED_BASELINE_RATE_PER_MIN,
    guardRows: defaultGuardRows(),
    openingDollars: 100,
    opexRows: [
      { atMinute: 60, dollars: 50, memo: "payroll-weekend" },
      { atMinute: 180, dollars: 25, memo: "bandwidth-true-up" },
    ],
    withContract: true,
  };
}

/** One gold contract (simCoreRunner's ctr-gold-1 shape, monthly term past
 *  the weekend) — minted locally so the lab needs no sim-core internals. */
function labContract(): Contract {
  return Object.freeze({
    id: asEntityId("ctr-lab-gold"),
    customerEntityId: asEntityId("cust-lab-1"),
    bundleId: "shared-web",
    mrcMicroUsd: asMoney(5_000_000n),
    tcvMicroUsd: asMoney(60_000_000n),
    acvMicroUsd: asMoney(60_000_000n),
    termStartMin: 0,
    termEndMin: 43_200,
    billingCycle: "monthly" as const,
    sla: Object.freeze({
      uptimeTarget: fromInt(1),
      responseBudgetUs: 3_600n * MICROS_PER_MIN,
      creditRate: fromInt(0),
      creditCap: fromInt(0),
      claimWindowUs: 30n * 24n * 3_600n * MICROS_PER_MIN,
      autoRenew: false,
      noticePeriodMin: 1_440,
      threeBreachExitRight: false,
    }),
    routingLocks: Object.freeze([]),
    shedImmunityClassId: "gold",
    allocations: Object.freeze([]),
  });
}

export const LAB_RULE_BOOK: readonly PolicyCard[] = Object.freeze([]);
export const LAB_RULE_BOOK_HASH = "lab-empty-book";

/** Assemble the RunUnattendedConfig from the form. Throws plain Errors with
 *  named complaints for UI-level problems (bad seed / ticks); guard and
 *  opex-shape problems surface later through UnattendedError, verbatim. */
export function buildRunConfig(form: UnattendedLabForm): RunUnattendedConfig {
  if (!Number.isSafeInteger(form.seed) || form.seed < 0) {
    throw new Error(`seed must be a non-negative integer, got ${String(form.seed)}`);
  }
  if (!Number.isSafeInteger(form.ticks) || form.ticks < 1 || form.ticks > LONG_WEEKEND_MAX_TICKS) {
    throw new Error(`ticks must be an integer in [1, ${LONG_WEEKEND_MAX_TICKS}] (the LONG_WEEKEND cap keeps one weekend one browser breath)`);
  }
  if (!Number.isSafeInteger(form.checkpointEvery) || form.checkpointEvery < 1) {
    throw new Error(`checkpointEvery must be an integer ≥ 1, got ${String(form.checkpointEvery)}`);
  }
  if (!Number.isFinite(form.baselineRatePerMin) || form.baselineRatePerMin < 0) {
    throw new Error(`baselineRatePerMin must be ≥ 0, got ${String(form.baselineRatePerMin)}`);
  }
  if (form.baselineRatePerMin > 32767) {
    throw new Error("baselineRatePerMin above 32767 overflows the Q16.16 carrier (fromInt law)");
  }
  if (!Number.isFinite(form.openingDollars) || form.openingDollars < 0) {
    throw new Error(`openingDollars must be ≥ 0, got ${String(form.openingDollars)}`);
  }
  const runSeed: RunSeed = asRunSeed(BigInt(form.seed));
  const board = boardPresetById(form.boardPresetId).board;
  const guards = guardRowsToRecords(form.guardRows);
  const opex = parseOpexRows(form.opexRows);

  const money =
    form.openingDollars === 0 && opex.length === 0 && !form.withContract
      ? undefined
      : Object.freeze({
          contracts: form.withContract ? Object.freeze([labContract()]) : Object.freeze([]),
          initialFreeMicroUsd: BigInt(Math.round(form.openingDollars * 1_000_000)),
          ...(opex.length > 0 ? { opex } : {}),
        });

  const trafficRate: Fixed = fromInt(form.baselineRatePerMin);

  return Object.freeze({
    runSeed,
    ticks: BigInt(form.ticks),
    board,
    ruleBook: LAB_RULE_BOOK,
    ruleBookHash: LAB_RULE_BOOK_HASH,
    guards,
    // baselineRatePerMin 0 is legal (fromInt(0) disables the plateau — the
    // runner then warns NO-TRAFFIC, honestly).
    traffic: Object.freeze({ baselineRatePerMin: trafficRate }),
    ...(money === undefined ? {} : { money }),
    checkpointEvery: form.checkpointEvery,
  });
}

/* ═══════════════════════════ run legs (progress-yielded) ═══════════════════════════ */

export type LabStage = "idle" | "building" | "weekend" | "whatif" | "done" | "error";

export interface LabRunOutcome {
  readonly stage: Extract<LabStage, "done" | "error">;
  readonly report: UnattendedReport | null;
  readonly error: string | null;
  readonly config: RunUnattendedConfig | null;
}

/** Await the microtask boundary so Vue can paint the "running" stage before
 *  the atomic block hogs the main thread. One yield per leg — pretend-
 *  progress inside an atomic pure call would be a lie. */
function breathe(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export async function runWeekend(
  form: UnattendedLabForm,
  onStage: (stage: LabStage) => void = () => undefined,
): Promise<LabRunOutcome> {
  onStage("building");
  await breathe();
  let config: RunUnattendedConfig;
  try {
    config = buildRunConfig(form);
  } catch (error) {
    onStage("error");
    return { stage: "error", report: null, error: messageOf(error), config: null };
  }
  onStage("weekend");
  await breathe();
  try {
    const report = runUnattended(config);
    onStage("done");
    return { stage: "done", report, error: null, config };
  } catch (error) {
    onStage("error");
    return { stage: "error", report: null, error: messageOf(error), config };
  }
}

export interface WhatIfOutcome {
  readonly stage: Extract<LabStage, "done" | "error">;
  readonly result: WhatIfResult | null;
  readonly error: string | null;
}

/** What-if mini-mode. runWhatIf runs BOTH legs (baseline + variant + the
 *  bisection refinement) in one atomic call — honest chunk granularity. */
export async function runWeekendWhatIf(
  form: UnattendedLabForm,
  delta: WhatIfDelta,
  onStage: (stage: LabStage) => void = () => undefined,
): Promise<WhatIfOutcome> {
  onStage("building");
  await breathe();
  let config: RunUnattendedConfig;
  try {
    config = buildRunConfig(form);
  } catch (error) {
    onStage("error");
    return { stage: "error", result: null, error: messageOf(error) };
  }
  onStage("whatif");
  await breathe();
  try {
    const result = runWhatIf({ config, delta });
    onStage("done");
    return { stage: "done", result, error: null };
  } catch (error) {
    onStage("error");
    return { stage: "error", result: null, error: messageOf(error) };
  }
}

function messageOf(error: unknown): string {
  if (error instanceof UnattendedError) return `${error.message} (code ${error.code})`;
  if (error instanceof Error) return error.message;
  return String(error);
}

/* ═══════════════════════════ display projections ═══════════════════════════ */

export function shortDigest(digest: string): string {
  return digest.length <= 12 ? digest : `${digest.slice(0, 8)}…${digest.slice(-4)}`;
}

const GUARD_PLAIN: Readonly<Record<GuardKind, string>> = Object.freeze({
  freeCashDepleted: "free cash stayed at or below zero",
  totalOutage: "nothing was served while demand kept arriving",
  cascadeCollapse: "more than the threshold share of nodes sat degraded",
  ruleRunaway: "the Policy Book fired rules faster than the floor",
  errorBudgetGone: "the minimum SLA error budget crossed its line",
  threshold: "a custom threshold stayed breached",
});

/** One-sentence, deterministic summary of a weekend report (the lab's answer
 *  to "what happened while I was asleep"). */
export function explainWeekend(report: UnattendedReport): string {
  const served = tabularNumber(report.summary.served);
  if (report.stop !== null) {
    const kind = stopKind(report.stop.reason);
    const phrase = kind === null ? report.stop.reason : GUARD_PLAIN[kind];
    return (
      `The weekend halted at sim-minute ${report.stop.atMinute} on ${report.stop.reason} — ${phrase}. ` +
      `Before the halt: ${served} served, ${tabularNumber(report.summary.landed)} landed, ` +
      `${tabularNumber(report.summary.falsePositive)} false positives, cash ${formatMoney(report.summary.cashDeltaMicroUsd)}.`
    );
  }
  return (
    `Clean ${tabularNumber(Number(report.ticksRun))}-minute weekend: ${served} served, ` +
    `${tabularNumber(report.summary.blocked)} bounced, ${tabularNumber(report.summary.landed)} landed, ` +
    `${tabularNumber(report.summary.falsePositive)} false positives, cash ${formatMoney(report.summary.cashDeltaMicroUsd)}.`
  );
}

function stopKind(reason: string): GuardKind | null {
  if (!reason.startsWith("guard:")) return null;
  const kind = reason.slice("guard:".length);
  return (GUARD_KINDS as readonly string[]).includes(kind) ? (kind as GuardKind) : null;
}

/** One-sentence what-if verdict, attribution-style: name the delta, the
 *  exact divergence tick, and the first visible difference in the numbers. */
export function explainWhatIf(result: WhatIfResult): string {
  const { deltaSummary } = result;
  const deltaLabel =
    deltaSummary.applied.length === 0
      ? "the no-op change"
      : `${deltaSummary.deltaType} (${deltaSummary.applied.join(", ")})`;
  if (!result.divergent || result.firstDivergentTick === null) {
    return `With ${deltaLabel}, nothing diverged before the horizon at tick ${deltaSummary.horizon}.`;
  }
  const b = result.baseline.summary;
  const v = result.variant.summary;
  const landedDelta = v.landed - b.landed;
  const cashDelta = v.cashDeltaMicroUsd - b.cashDeltaMicroUsd;
  return (
    `With ${deltaLabel}, the worlds first differ at tick ${result.firstDivergentTick}: ` +
    `landed ${signed(landedDelta)} vs baseline, cash ${signedBig(cashDelta)} µ$ — ` +
    `${stopLine(deltaSummary.baselineStop)} for baseline, ${stopLine(deltaSummary.variantStop)} for the variant.`
  );
}

function stopLine(stop: WhatIfResult["deltaSummary"]["baselineStop"]): string {
  return stop === null ? "a clean run" : `a halt on ${stop.reason} at minute ${stop.atMinute}`;
}

function signed(n: number): string {
  return n === 0 ? "no change" : `${n > 0 ? "+" : ""}${tabularNumber(n)}`;
}

function signedBig(n: bigint): string {
  if (n === 0n) return "no change";
  const sign = n > 0n ? "+" : "−";
  return `${sign}${formatMoney(n < 0n ? -n : n)}`;
}

/** Hourly bucket rows → display strings (Fixed→ratio via /65536 at the LAST
 *  mile only; the numbers ride the ledger's own carriers until here). */
export interface BucketRow {
  readonly hour: number;
  readonly served: string;
  readonly blocked: string;
  readonly landed: string;
  readonly falsePositive: string;
  readonly arrivals: string;
  readonly ratePerMin: string;
  readonly meanRho: string;
  readonly peakRho: string;
  readonly degradedTicks: string;
  readonly meanCash: string;
}

const FIXED_SCALE_NUM = 65536; // Q16.16 — the carrier, spelled once for display math

export function bucketRows(buckets: readonly UnattendedHourBucket[]): readonly BucketRow[] {
  return buckets.map((b) =>
    Object.freeze({
      hour: b.hour,
      served: tabularNumber(b.served),
      blocked: tabularNumber(b.blocked),
      landed: tabularNumber(b.landed),
      falsePositive: tabularNumber(b.falsePositive),
      arrivals: tabularNumber(b.arrivals),
      ratePerMin: round2(Number(b.meanArrivalRatePerMin) / FIXED_SCALE_NUM),
      meanRho: round2(Number(b.meanRho) / FIXED_SCALE_NUM),
      peakRho: round2(Number(b.peakRho) / FIXED_SCALE_NUM),
      degradedTicks: tabularNumber(b.degradedTicks),
      meanCash: formatMoney(b.meanFreeCashMicroUsd),
    }),
  );
}

function round2(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : NO_DATA;
}

/* ═══════════════════════════ what-if delta assembly ═══════════════════════════ */

export type WhatIfDeltaKind = "removeNode" | "disableDefense" | "trafficSurge";

/** Build the WhatIfDelta from mini-form fields; throws with the same named
 *  complaint grammar the rest of the lane uses (fail fast at the boundary). */
export function buildDelta(input: {
  kind: WhatIfDeltaKind;
  nodeId?: string;
  surgeMultiplier?: number;
  surgeMinutes?: number;
}): WhatIfDelta {
  switch (input.kind) {
    case "removeNode":
    case "disableDefense": {
      const id = (input.nodeId ?? "").trim();
      if (id.length === 0) throw new Error(`${input.kind} needs a node id from the board`);
      return Object.freeze({ type: input.kind, id });
    }
    case "trafficSurge": {
      const multiplier = input.surgeMultiplier ?? 0;
      const minutes = input.surgeMinutes ?? 0;
      if (!Number.isFinite(multiplier) || multiplier < 0) {
        throw new Error(`trafficSurge multiplier must be ≥ 0, got ${String(multiplier)}`);
      }
      if (!Number.isSafeInteger(minutes) || minutes < 1) {
        throw new Error(`trafficSurge minutes must be an integer ≥ 1, got ${String(minutes)}`);
      }
      const surge: TrafficSurgeDelta = Object.freeze({
        type: "trafficSurge",
        multiplier: fixedFromNumber(multiplier),
        minutes,
      });
      return surge;
    }
    default:
      throw new Error(`unknown delta kind ${String(input.kind)}`);
  }
}

/** Number → Fixed for multiplier duty (0.5 steps are plenty; keep it exact
 *  on the 1/100 grid so percent-style inputs survive Q16.16 rounding). */
function fixedFromNumber(n: number): Fixed {
  if (n > 32767 || n < -32768) {
    throw new Error(`${n} overflows the Q16.16 carrier — pick a smaller surge`);
  }
  const hundredths = BigInt(Math.round(n * 100));
  return (hundredths * 65536n) / 100n;
}
