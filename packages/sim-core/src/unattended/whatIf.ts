/**
 * unattended/whatIf.ts — the What-Would-Break forward sim (§9.2 tool row).
 *
 * "Kill any object, watch the consequences unfold at 4×, rewind." This is a
 * THOUGHT EXPERIMENT, not a chaos monkey: nothing here touches a live run.
 * Both worlds are minted from DATA — the baseline config and the SAME
 * config with one enumerable delta applied structurally (copied arrays,
 * replaced records, zero mutation) — fast-forwarded through the identical
 * engine (fastForward.runUnattendedInner, same seed, same cadence law), and
 * DIFFERENCED at the digest level.
 *
 * Bisection law: replay/verify.ts's bisect pattern over checkpoint digest
 * pairs. Checkpoints are read-only observations — the simulation does not
 * depend on the cadence (pinned by test: a cadence-60 checkpoint digest
 * equals the same tick's cadence-1 digest). So a coarse first pass locates
 * the divergent window, and one refinement pass at cadence 1 inside the
 * window names the EXACT tick — two bounded re-runs, never a full re-play.
 *
 * Deltas (closed vocabulary, parse-don't-validate at `applyWhatIfDelta`):
 *  • removeNode     — drop the node; edges touching it drop; dependency
 *    references to it are cut to null (the orphan census lands in
 *    deltaSummary.applied). The routing paths re-derive from the survivor
 *    set, so removing a load-bearing node genuinely reroutes/breaks.
 *  • disableDefense — node's per-tick inspection depth → "pass-through"
 *    (driver.ts:394 feeds node.inspectionDepth to the pipeline; this is the
 *    data-level meaning of "that WAF is off").
 *  • trafficSurge   — baseline envelope rate × multiplier (Fixed) for
 *    `minutes` sim-minutes starting at startMinute (default 1).
 *  scaleEvent — DECLINED for v0: trafficSurge is its inverse and the waves
 *  table already carries authored pressure; a second volume knob on the
 *  same envelope would fight planWave's placement law. (OWNER QUESTION.)
 *
 * Guards run in BOTH worlds exactly as configured — a variant that HALTS
 * early diverges by stopping, which is precisely the catastrophe a
 * What-Would-Break session is trying to see.
 */
import type { Fixed, SimMinute, SimTick } from "../types.ts";
import { FIXED_ZERO, compare } from "../kernel/fixed.ts";
import { UnattendedError, parseGuardList, type ParsedGuard } from "./guardrails.ts";
import {
  makeSurgeWindow,
  runUnattendedWithSurge,
  type RunUnattendedConfig,
  type SurgeWindow,
  type UnattendedCheckpoint,
  type UnattendedReport,
  type UnattendedStop,
} from "./fastForward.ts";

/* ═══════════════════════════ the delta record ═══════════════════════════ */

export const WHATIF_DELTA_KINDS = Object.freeze(["removeNode", "disableDefense", "trafficSurge"] as const);

export type WhatIfDeltaKind = (typeof WHATIF_DELTA_KINDS)[number];

export interface RemoveNodeDelta {
  readonly type: "removeNode";
  readonly id: string;
}

export interface DisableDefenseDelta {
  readonly type: "disableDefense";
  readonly id: string;
}

export interface TrafficSurgeDelta {
  readonly type: "trafficSurge";
  /** Fixed multiplier on the baseline plateau rate (1 = no-op is legal
   *  but boring; the parse keeps it ≥ 0). */
  readonly multiplier: Fixed;
  /** Surge duration in sim-minutes (≥1). */
  readonly minutes: SimMinute;
  /** First surged minute (default 1). */
  readonly startMinute?: SimMinute;
}

export type WhatIfDelta = RemoveNodeDelta | DisableDefenseDelta | TrafficSurgeDelta;

export interface RunWhatIfConfig {
  /** The committed weekend config — baseline world. */
  readonly config: RunUnattendedConfig;
  /** The one enumerable change — variant world. */
  readonly delta: WhatIfDelta;
  /** Horizon in ticks; default min(config.ticks, config.maxSimMinutes). An
   *  EXPLICIT horizon OVERRIDES the config's maxSimMinutes cap (review F7). */
  readonly horizon?: SimTick;
  /** Checkpoint cadence for the coarse pass (default 60; refinement is
   *  always tick-exact inside the located window). */
  readonly checkpointEvery?: number;
}

/* ═══════════════════════════ the result record ═══════════════════════════ */

export interface WhatIfDeltaSummary {
  readonly deltaType: WhatIfDeltaKind;
  /** Human-readable, deterministic list of every structural edit actually
   *  made (ids sorted where enumerable). Empty applied = no-op delta. */
  readonly applied: readonly string[];
  readonly baselineTicksRun: SimTick;
  readonly variantTicksRun: SimTick;
  readonly baselineStop: UnattendedStop | null;
  readonly variantStop: UnattendedStop | null;
  readonly horizon: SimTick;
}

export interface WhatIfResult {
  readonly divergent: boolean;
  /** Exact tick where the two worlds' state digests first differ — null
   *  when identical through the horizon (or when divergence begins AFTER
   *  the last compared checkpoint and refinement found none inside). */
  readonly firstDivergentTick: SimTick | null;
  /** The coarse-pass window that contained the first difference. */
  readonly divergentWindow: { readonly afterTick: SimTick; readonly atTick: SimTick } | null;
  readonly deltaSummary: WhatIfDeltaSummary;
  readonly baseline: UnattendedReport;
  readonly variant: UnattendedReport;
}

/* ═══════════════════════════ patching (pure data → data) ═══════════════════════════ */

interface Patched {
  readonly config: RunUnattendedConfig;
  readonly applied: readonly string[];
  readonly surge: SurgeWindow | null;
}

/** Apply one delta to a config, returning a NEW config (frozen) plus the
 *  applied-edit census. Fail-loud: unknown id / unknown type / bad numbers
 *  throw UnattendedError("WHATIF_PATCH"). The input config is NEVER
 *  mutated — both worlds mint fresh from here. */
export function applyWhatIfDelta(config: RunUnattendedConfig, delta: WhatIfDelta): Patched {
  if (typeof delta !== "object" || delta === null || typeof (delta as { type?: unknown }).type !== "string") {
    throw new UnattendedError("WHATIF_PATCH", "delta", "expected a WhatIfDelta record with a string type");
  }
  if (delta.type === "removeNode") return patchRemoveNode(config, delta.id);
  if (delta.type === "disableDefense") return patchDisableDefense(config, delta.id);
  if (delta.type === "trafficSurge") return patchTrafficSurge(config, delta);
  throw new UnattendedError(
    "WHATIF_PATCH",
    "delta.type",
    `unknown what-if delta '${String((delta as { type: unknown }).type)}' — closed vocabulary is ${WHATIF_DELTA_KINDS.join("|")}`,
  );
}

function requireNode(config: RunUnattendedConfig, id: string, op: string): void {
  if (!config.board.nodes.some((n) => n.id === id)) {
    throw new UnattendedError("WHATIF_PATCH", op, `node '${id}' is not on the board`);
  }
}

function patchRemoveNode(config: RunUnattendedConfig, id: string): Patched {
  requireNode(config, id, "removeNode");
  const applied: string[] = [`node:${id} removed`];
  const nodes = config.board.nodes
    .filter((n) => n.id !== id)
    .map((n) => {
      if (n.dependencyNodeId !== id) return n;
      applied.push(`dependency:${n.id}→null (was ${id})`);
      return Object.freeze({ ...n, dependencyNodeId: null });
    });
  const edges = (config.board.edges ?? []).filter((e) => e.from !== id && e.to !== id);
  const droppedEdges = ((config.board.edges?.length ?? 0) - edges.length);
  if (droppedEdges > 0) applied.push(`edges dropped: ${droppedEdges}`);
  const next: RunUnattendedConfig = Object.freeze({
    ...config,
    board: Object.freeze({ nodes: Object.freeze(nodes), edges: Object.freeze(edges) }),
    ...(config.expressPath !== undefined
      ? { expressPath: Object.freeze(config.expressPath.filter((p) => p !== id)) }
      : {}),
    ...(config.deepPath !== undefined
      ? { deepPath: Object.freeze(config.deepPath.filter((p) => p !== id)) }
      : {}),
  });
  return Object.freeze({ config: next, applied: Object.freeze(applied.sort(compareApplied)), surge: null });
}

function patchDisableDefense(config: RunUnattendedConfig, id: string): Patched {
  requireNode(config, id, "disableDefense");
  const nodes = config.board.nodes.map((n) =>
    n.id === id ? Object.freeze({ ...n, inspectionDepth: "pass-through" as const }) : n,
  );
  const next: RunUnattendedConfig = Object.freeze({
    ...config,
    board: Object.freeze({ nodes: Object.freeze(nodes), ...(config.board.edges !== undefined ? { edges: config.board.edges } : {}) }),
  });
  return Object.freeze({
    config: next,
    applied: Object.freeze([`node:${id} inspectionDepth→pass-through`]),
    surge: null,
  });
}

function patchTrafficSurge(config: RunUnattendedConfig, delta: TrafficSurgeDelta): Patched {
  if (typeof delta.multiplier !== "bigint" || compare(delta.multiplier, FIXED_ZERO) < 0) {
    throw new UnattendedError("WHATIF_PATCH", "trafficSurge.multiplier", "needs a non-negative Fixed bigint");
  }
  if (!Number.isSafeInteger(delta.minutes) || delta.minutes < 1) {
    throw new UnattendedError("WHATIF_PATCH", "trafficSurge.minutes", `needs an integer ≥ 1, got ${String(delta.minutes)}`);
  }
  const startMinute = delta.startMinute ?? 1;
  if (!Number.isSafeInteger(startMinute) || startMinute < 1) {
    throw new UnattendedError("WHATIF_PATCH", "trafficSurge.startMinute", `needs an integer ≥ 1, got ${String(startMinute)}`);
  }
  const next: RunUnattendedConfig = Object.freeze({ ...config });
  const surge = makeSurgeWindow(delta.multiplier, startMinute, delta.minutes);
  return Object.freeze({
    config: next,
    applied: Object.freeze([
      `baseline surge ×${String(delta.multiplier)}Fixed for ${delta.minutes}m from m${startMinute}`,
    ]),
    surge,
  });
}

function compareApplied(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/* ═══════════════════════════ the forward sim ═══════════════════════════ */

/**
 * Run What-Would-Break: baseline vs one delta, to the same horizon, and
 * locate the first divergent tick by checkpoint bisection + tick-exact
 * refinement. Deterministic — same (config, delta) ⇒ byte-identical result
 * (both inner reports are; the bisect walk is over their frozen arrays).
 */
export function runWhatIf(input: RunWhatIfConfig): WhatIfResult {
  const horizon = resolveHorizon(input);
  const every = input.checkpointEvery ?? DEFAULT_WHATIF_CHECKPOINT_EVERY;
  const { config: patched, applied, surge } = applyWhatIfDelta(input.config, input.delta);

  const base = runToHorizon(input.config, horizon, every, null);
  const variant = runToHorizon(patched, horizon, every, surge);

  const firstDiff = firstDivergentCheckpoint(base, variant, horizon);
  if (firstDiff === null) {
    return freezeResult(false, null, null, base, variant, applied, input, horizon);
  }

  // Refine: re-run BOTH worlds tick-exactly inside the located window.
  // The window is ≤ `every` ticks wide; digests at cadence 1 equal digests
  // at cadence 60 on shared ticks (cadence never feeds the sim), so the
  // bisect is over apples-to-apples observations.
  const windowStart = firstDiff.afterTick;
  const windowEnd = firstDiff.atTick;
  const refineBase = runToHorizon(input.config, windowEnd, 1, null);
  const refineVariant = runToHorizon(patched, windowEnd, 1, surge);
  const exact = firstDivergentTickIn(refineBase, refineVariant, windowStart, windowEnd);

  return freezeResult(true, exact, Object.freeze({ afterTick: windowStart, atTick: windowEnd }), base, variant, applied, input, horizon);
}

/** Coarse default: hourly handles over a weekend. */
export const DEFAULT_WHATIF_CHECKPOINT_EVERY = 60;

function runToHorizon(
  config: RunUnattendedConfig,
  horizon: SimTick,
  every: number,
  surge: SurgeWindow | null,
): UnattendedReport {
  // The whatIf horizon is the AUTHORITATIVE window for every phase (coarse
  // AND refine, review F7): strip config.maxSimMinutes so the runner's
  // min() can never silently shorten it — an explicit horizon of 20 under
  // a 10-minute config cap asked for 20 ticks and got 10, and the refine
  // re-play inside a window past the cap would corrupt the bisection.
  // When the horizon was DERIVED from the config the strip is a no-op
  // (resolveHorizon already took the same minimum).
  const { maxSimMinutes: _cappedByConfig, ...rest } = config;
  const scoped: RunUnattendedConfig = Object.freeze({
    ...rest,
    ticks: horizon,
    checkpointEvery: every,
  });
  return runUnattendedWithSurge(scoped, surge);
}

interface CheckpointPairRow {
  readonly tick: SimTick;
  readonly base: string | null;
  readonly variant: string | null;
}

function alignCheckpoints(a: readonly UnattendedCheckpoint[], b: readonly UnattendedCheckpoint[]): CheckpointPairRow[] {
  const byATick = new Map<string, string>();
  const byBTick = new Map<string, string>();
  for (const c of a) byATick.set(String(c.tick), c.digest);
  for (const c of b) byBTick.set(String(c.tick), c.digest);
  const ticks = [...new Set([...byATick.keys(), ...byBTick.keys()])].sort((x, y) => Number(x) - Number(y));
  return ticks.map((tick) => Object.freeze({
    tick: BigInt(tick),
    base: byATick.get(tick) ?? null,
    variant: byBTick.get(tick) ?? null,
  }));
}

/** Locate the first checkpoint window where the digests (or presence)
/** Locate the first checkpoint window where the digests (or presence)
 *  differ. A variant that STOPPED earlier has no checkpoints beyond its
 *  stop — absence past the baseline's presence is itself divergence. */
function firstDivergentCheckpoint(
  base: UnattendedReport,
  variant: UnattendedReport,
  horizon: SimTick,
): { readonly afterTick: SimTick; readonly atTick: SimTick } | null {
  const rows = alignCheckpoints(base.perCheckpoint, variant.perCheckpoint);
  let afterTick = 0n;
  for (const row of rows) {
    if (row.base !== row.variant) {
      // A stop mid-window shows up as: the running world keeps producing
      // digests while the halted one stops producing them — the mismatch
      // row still brackets the change.
      return Object.freeze({ afterTick, atTick: row.tick });
    }
    afterTick = row.tick;
  }
  // All checkpoints agree — including the case of NO checkpoints at all
  // (both worlds halted before the first cadence tick). The end-of-run
  // digests are the final witness; differing run lengths mean one world
  // kept ticking after the other stopped.
  if (base.finalDigest !== variant.finalDigest || base.ticksRun !== variant.ticksRun) {
    return Object.freeze({ afterTick, atTick: horizon });
  }
  return null;
}

/** Linear scan inside the window (≤ every ticks — bisect would save log-n
 *  string compares on an already-bounded list; the scan is the honest,
 *  auditable walk). Returns the first tick whose digests differ, or null
 *  when the refinement finds the two worlds identical throughout. */
function firstDivergentTickIn(
  base: UnattendedReport,
  variant: UnattendedReport,
  windowStart: SimTick,
  windowEnd: SimTick,
): SimTick | null {
  const rows = alignCheckpoints(base.perCheckpoint, variant.perCheckpoint);
  for (const row of rows) {
    if (row.tick <= windowStart && row.base === row.variant) continue;
    if (row.base !== row.variant) return row.tick;
  }
  // No per-tick pair differed — but the coarse pass said the window does.
  // The stop itself IS the divergence witness: a halted world's final
  // digest is its stop snapshot; report the halt tick (or the window end).
  const halt = variant.stop !== null && base.stop === null ? variant.stop.atTick
    : base.stop !== null && variant.stop === null ? base.stop.atTick
    : null;
  void windowEnd;
  return halt ?? windowEnd;
}

function freezeResult(
  divergent: boolean,
  firstDivergentTick: SimTick | null,
  divergentWindow: WhatIfResult["divergentWindow"],
  base: UnattendedReport,
  variant: UnattendedReport,
  applied: readonly string[],
  input: RunWhatIfConfig,
  horizon: SimTick,
): WhatIfResult {
  void input;
  return Object.freeze({
    divergent,
    firstDivergentTick,
    divergentWindow,
    deltaSummary: Object.freeze({
      deltaType: (input.delta as { type: WhatIfDeltaKind }).type,
      applied,
      baselineTicksRun: base.ticksRun,
      variantTicksRun: variant.ticksRun,
      baselineStop: base.stop,
      variantStop: variant.stop,
      horizon,
    }),
    baseline: base,
    variant,
  });
}

function resolveHorizon(input: RunWhatIfConfig): SimTick {
  if (input.horizon !== undefined) {
    const h = Number(input.horizon);
    if (!Number.isSafeInteger(h) || h < 1) {
      throw new UnattendedError("WHATIF_PATCH", "horizon", `needs a safe integer ≥ 1, got ${String(input.horizon)}`);
    }
    return BigInt(h);
  }
  const c = input.config;
  if (c.ticks !== undefined && c.maxSimMinutes !== undefined) {
    return BigInt(Math.min(Number(c.ticks), c.maxSimMinutes));
  }
  if (c.ticks !== undefined) return c.ticks;
  if (c.maxSimMinutes !== undefined) return BigInt(c.maxSimMinutes);
  throw new UnattendedError("WHATIF_PATCH", "horizon", "config carries no ticks/maxSimMinutes and no explicit horizon");
}

/** Census: how many parsed guards a whatIf will enforce (report sugar;
 *  parses through the SAME guardrails parser the runner uses, so a
 *  malformed guard fails at the door instead of mid-world). */
export function guardsInConfig(config: RunUnattendedConfig): readonly ParsedGuard[] {
  return parseGuardList(config.guards);
}
