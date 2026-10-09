/**
 * Decision Highlight — the annotation producer (§7.6 "The Decision Highlight").
 *
 * "Overlays show state; nothing shows agency." This module answers, from
 * observed-layer material only (counters deltas, event notices, lanes), the
 * question the spec names as the hardest one at scale: **"what am I actually
 * being asked?"** It marks at most three things as decisions — the CAP itself
 * is BudgetManager's `markedDecision` slot (decision/tracker.ts is the first
 * producer in the repo; before this lane the cap shipped with zero claims).
 *
 * Selection rule (§7.6, verbatim): something is a decision when
 *   (a) two options are both viable      → `viabilityEvidence` (each kind
 *       names the evidence that BOTH branches are live; a crisis — where one
 *       branch is already forced — is information, not a decision),
 *   (b) the window is closing            → `closingPressure` (an expired
 *       window drops the candidate entirely — a closed fork is history),
 *   (c) the player has the resources to act → `resourceReady` (v0 observed
 *       proxy: a `hands-exhausted` door refusal in the frame discounts every
 *       candidate; the true hands counter lives behind the runner seam —
 *       recorded as a batch-D wiring item).
 *
 * IT IS NOT A HINT SYSTEM (§7.6): `options` name the fork, never endorse a
 * branch. No option carries a score, recommendation, or ordering hint.
 *
 * Pure-module law: no Vue, no BudgetManager, no timers, no Date.now — every
 * timestamp comes from the trusted SimProjection's clocks, so ranking is a
 * deterministic function of (prev frame, next frame) and fully unit-testable.
 * "Parse, Don't Validate": SimProjection arrives already boundary-parsed by
 * shared/protocol.ts; this file trusts it and fails loud (DecisionError) on
 * producer-level impossibilities (counters running backwards).
 */
import type { SimTimeUs } from "@hh/sim-core";
import type { SimProjection } from "../shared/protocol";
import { fixedToDisplay } from "../shared/protocol";
import type { ExplainPayload } from "../chrome/explainRegistry";
import { compareCodeUnits } from "../chrome/textLaw";

/* ═══════════════════════ closed vocabulary (§7.6 v0) ═══════════════════════ */

/** The five forks v0 can evidence from the observed seam alone. Growing this
 *  union means growing the audit trail below — every kind must name BOTH
 *  viable options and the evidence gate that proves it is a fork, not a
 *  fire alarm. */
export const DECISION_KINDS = [
  "surge-fork",
  "fp-fork",
  "bounce-fork",
  "door-refusal",
  "cash-burn",
] as const;
export type DecisionKind = (typeof DECISION_KINDS)[number];

/** One branch of the fork, neutrally worded. */
export interface ForkOption {
  readonly id: string;
  readonly label: string;
}

export interface DecisionWindow {
  readonly openedAtUs: SimTimeUs;
  readonly closesAtUs: SimTimeUs;
}

/** The three §7.6 selection signals, each in [0,1], plus their fold. */
export interface DecisionSignals {
  readonly closingPressure: number;
  readonly viabilityEvidence: number;
  readonly resourceReady: number;
  readonly score: number;
}

/** A ranked, explainable decision annotation — the object that claims a
 *  `markedDecision` budget slot (via tracker.ts) and feeds the "Now" list. */
export interface DecisionAnnotation {
  /** Stable, self-describing: "<kind>:<subject>:<stamp>". Re-firing the same
   *  event (same stamp) is a refresh; a new event stamps a new id, which is
   *  how supersession falls out structurally in the tracker. */
  readonly id: string;
  readonly kind: DecisionKind;
  /** The board object the fork is about (lane id, node id, "ledger"). */
  readonly subjectId: string;
  readonly title: string;
  /** One line of "why it matters" — stakes, never advice. */
  readonly whyItMatters: string;
  /** Exactly two or more neutral options; §7.6: where the fork is, not which
   *  branch to take. */
  readonly options: readonly ForkOption[];
  readonly window: DecisionWindow;
  readonly signals: DecisionSignals;
  /** 0-based position in the ranked output. */
  readonly rank: number;
  /** Explain-This-Number payload (§8.8 hookup): the law in prose plus the
   *  literal inputs, so the rail's "why" click is a lookup, not a compute. */
  readonly explain: ExplainPayload;
}

export interface DecisionFrame {
  /** The previous trusted frame; null on the first frame (deltas undefined →
   *  only event-driven kinds — surge, door-refusal — can fire). */
  readonly prev: SimProjection | null;
  readonly next: SimProjection;
}

/* ═══════════════════════ provisional taste constants ═══════════════════════ */
/* Every number here is an un-ratified calibration row, pinned by test. */

/** Fork windows, sim µs. Surge/refusal act on patience tempo (minutes);
 *  tuning/money forks act on the hour. */
export const DECISION_WINDOWS: Readonly<Record<DecisionKind, SimTimeUs>> = Object.freeze({
  "surge-fork": 300_000_000n, // 5 min — visitor-patience scale
  "fp-fork": 600_000_000n, // 10 min — dial retune is a shift, not a reflex
  "bounce-fork": 600_000_000n, // 10 min — same tempo as fp
  "door-refusal": 300_000_000n, // 5 min — the board frees hands on this scale
  "cash-burn": 1_800_000_000n, // 30 min — money decisions breathe slower
});

/** Fold weights for the rank score (§7.6's three clauses made arithmetic). */
export const DECISION_SCORE_WEIGHTS: Readonly<{
  closing: number;
  viability: number;
  resource: number;
}> = Object.freeze({ closing: 0.5, viability: 0.3, resource: 0.2 });

/** Delta gates — below these, the frame is not evidence of a fork. */
export const DECISION_GATES: Readonly<{
  fpMin: number;
  bounceMin: number;
  bounceQuietServedMax: number;
  cashBurnMinMicroUsd: bigint;
  resourceDiscount: number;
}> = Object.freeze({
  fpMin: 1, // one amber-403 is already a premium being paid
  bounceMin: 3, // 1–2 bounces is texture; 3 in a frame is a pattern
  bounceQuietServedMax: 0, // with served==0 the bounce rate IS the story
  cashBurnMinMicroUsd: 1_000_000n, // $1 of free-bucket burn (µ$ scale)
  resourceDiscount: 0.35, // multiplier while hands-exhausted is observed
});

/* ═══════════════════════════ errors ═══════════════════════════ */

/** Producer-law violations (`decision[CODE]: detail`, the repo family shape). */
export class DecisionError extends Error {
  constructor(code: string, detail: string) {
    super(`decision[${code}]: ${detail}`);
    this.name = "DecisionError";
  }
}

/* ═══════════════════════════ derivation ═══════════════════════════ */

/**
 * The whole §7.6 selection loop, pure. Returns EVERY evidenced fork ranked
 * best-first (ties broken by code-unit id order — never map-iteration luck);
 * the caller (tracker) applies the ≤3 cap through the BudgetManager, so the
 * rail's "+N" stays cluster-honest instead of silently truncating.
 */
export function deriveDecisionCandidates(frame: DecisionFrame): readonly DecisionAnnotation[] {
  const { prev, next } = frame;
  if (prev !== null && prev.seq === next.seq) return []; // re-delivered frame
  assertMonotonicCounters(prev, next);

  const nowUs = next.clocks.simUs;
  const handsBlocked = frameHasRefusal(next, "hands-exhausted");
  const resourceReady = handsBlocked ? DECISION_GATES.resourceDiscount : 1;

  const candidates: DecisionAnnotation[] = [];
  pushIf(candidates, deriveSurge(next, nowUs, resourceReady));
  pushIf(candidates, deriveDoorRefusal(next, nowUs, resourceReady));
  if (prev !== null) {
    pushIf(candidates, deriveFalsePositive(prev, next, nowUs, resourceReady));
    pushIf(candidates, deriveBounce(prev, next, nowUs, resourceReady));
    pushIf(candidates, deriveCashBurn(prev, next, nowUs, resourceReady));
  }

  candidates.sort(
    (a, b) => b.signals.score - a.signals.score || compareCodeUnits(a.id, b.id),
  );
  return candidates.map((candidate, rank) => Object.freeze({ ...candidate, rank }));
}

/* ─────────────────────────── per-kind derivations ─────────────────────────── */

function deriveSurge(
  next: SimProjection,
  nowUs: SimTimeUs,
  resourceReady: number,
): DecisionAnnotation | null {
  const notice = next.notices.find((n) => n.kind === "arrival-surge");
  if (notice === undefined) return null;
  const subjectId = notice.laneId ?? "ledger";
  const lane = next.lanes.find((l) => l.laneId === notice.laneId);
  // (a) both branches viable only while the lane still serves: a dead lane
  // is an incident, not a fork. Health cell/aggregate absent = NO DATA = not
  // evidenced (fog stays fog; we never guess).
  if (lane === undefined) return null;
  const health = fixedToDisplay(lane.health);
  if (health <= 0.05) return null;
  const rate = fixedToDisplay(lane.ratePerMin);
  return build({
    kind: "surge-fork",
    subjectId,
    stamp: notice.atUs,
    title: "Surge on the lane — shed early or ride it",
    whyItMatters:
      "Arrival rate jumped while the lane still serves. Pre-shedding loses a smaller coin; riding it risks the patience clock (§7.1 slots-not-HP).",
    options: [
      { id: "hold-posture", label: "Hold current posture, serve through" },
      { id: "pre-shed", label: "Shed low-class traffic before the knee" },
    ],
    openedAtUs: notice.atUs,
    nowUs,
    signals: { closingWindowFrom: notice.atUs, viabilityEvidence: 1, resourceReady },
    explainInputs: [
      { name: "lane rate/min", value: display(rate) },
      { name: "lane health", value: display(health) },
      { name: "surge observed at sim µs", value: notice.atUs.toString() },
    ],
    formula: "surge notice present AND lane health > 0.05 → both branches live (§7.6a)",
  });
}

function deriveDoorRefusal(
  next: SimProjection,
  nowUs: SimTimeUs,
  resourceReady: number,
): DecisionAnnotation | null {
  const notice = next.notices.find((n) => n.kind === "intent-refused");
  if (notice === undefined) return null;
  const { verb, reason } = parseRefusalDetail(notice.detail ?? "");
  // A future-stamped intent resolves itself on the clock — no fork for the
  // player to make, so the seam says nothing.
  if (reason === "stamped-in-future") return null;
  const subjectId = notice.laneId ?? "board";
  const handsBlocked = reason === "hands-exhausted";
  return build({
    kind: "door-refusal",
    subjectId,
    stamp: notice.atUs,
    title: `The board said no to "${verb}" — wait or re-plan`,
    whyItMatters: handsBlocked
      ? "Executive attention is the scarce resource (§7.5): the move is legal, the hands are not free. Spending a later hand here is a choice with a price somewhere else."
      : "The move bounced off board structure. Re-issuing unchanged will bounce again; re-planning spends a different shape of cost.",
    options: [
      { id: "re-issue", label: "Re-issue the same order when the board frees" },
      { id: "re-plan", label: "Re-plan the move through a different verb" },
    ],
    openedAtUs: notice.atUs,
    nowUs,
    signals: {
      closingWindowFrom: notice.atUs,
      // (c) evidence: a refusal whose reason is hands proves the block is
      // temporal (waiting is viable); structural reasons prove re-issue alone
      // is NOT viable, so only the re-plan branch is — evidence for the fork
      // as a whole stays 1 because both branches ARE live.
      viabilityEvidence: 1,
      resourceReady: handsBlocked ? DECISION_GATES.resourceDiscount : resourceReady,
    },
    explainInputs: [
      { name: "verb", value: verb },
      { name: "refusal reason", value: reason },
      { name: "refused at sim µs", value: notice.atUs.toString() },
    ],
    formula: 'intent-refused notice, reason ≠ "stamped-in-future" → wait-vs-replan fork (§7.6c)',
  });
}

function deriveFalsePositive(
  prev: SimProjection,
  next: SimProjection,
  nowUs: SimTimeUs,
  resourceReady: number,
): DecisionAnnotation | null {
  const fpDelta = next.counters.blockedFalsePositive - prev.counters.blockedFalsePositive;
  if (fpDelta < DECISION_GATES.fpMin) return null;
  const servedDelta = next.counters.served - prev.counters.served;
  // (a) the premium only reads as a CHOICE while there is still business to
  // protect; zero served means the dial question is moot — an incident owns it.
  if (servedDelta <= 0) return null;
  const fpNotice = next.notices.find((n) => n.kind === "false-positive");
  const subjectId = fpNotice?.laneId ?? "ledger";
  return build({
    kind: "fp-fork",
    subjectId,
    stamp: next.tick,
    title: "Amber-403s are landing — relax the dial or eat the premium",
    whyItMatters: `${fpDelta} paying visitor${fpDelta === 1 ? "" : "s"} blocked this frame (§5 triad). Every turn of paranoia buys safety with someone else's conversion.`,
    options: [
      { id: "relax-dial", label: "Relax the suspicion dial toward throughput" },
      { id: "hold-dial", label: "Hold the dial and absorb the false-positive cost" },
    ],
    openedAtUs: nowUs,
    nowUs,
    signals: { closingWindowFrom: nowUs, viabilityEvidence: 1, resourceReady },
    explainInputs: [
      { name: "false positives blocked (Δ frame)", value: String(fpDelta) },
      { name: "served (Δ frame)", value: String(servedDelta) },
    ],
    formula: "ΔblockedFalsePositive ≥ gate AND Δserved > 0 → the premium is real while business is (§7.6a)",
  });
}

function deriveBounce(
  prev: SimProjection,
  next: SimProjection,
  nowUs: SimTimeUs,
  resourceReady: number,
): DecisionAnnotation | null {
  const bounceDelta = next.counters.bounced - prev.counters.bounced;
  const servedDelta = next.counters.served - prev.counters.served;
  if (bounceDelta < DECISION_GATES.bounceMin) return null;
  const lane = next.lanes[0];
  // (a) capacity is only a live branch while the lane breathes; health 0.05
  // floor mirrors the surge gate (one crisis threshold, one source).
  if (lane !== undefined && fixedToDisplay(lane.health) <= 0.05) return null;
  const quiet = servedDelta <= DECISION_GATES.bounceQuietServedMax;
  return build({
    kind: "bounce-fork",
    subjectId: lane?.laneId ?? "ledger",
    stamp: next.tick,
    title: quiet ? "Everything is bouncing — admission now, or capacity now" : "Traffic is bouncing — buy headroom or tighten admission",
    whyItMatters: `${bounceDelta} request${bounceDelta === 1 ? "" : "s"} bounced this frame. Bounces are lost revenue now and reputation later (§6); the queue is the only thing between them and the exit.`,
    options: [
      { id: "buy-headroom", label: "Add or shift capacity (spend)" },
      { id: "tighten-admission", label: "Shed earlier by policy (protect the core)" },
    ],
    openedAtUs: nowUs,
    nowUs,
    signals: { closingWindowFrom: nowUs, viabilityEvidence: 1, resourceReady },
    explainInputs: [
      { name: "bounced (Δ frame)", value: String(bounceDelta) },
      { name: "served (Δ frame)", value: String(servedDelta) },
    ],
    formula: "Δbounced ≥ gate AND lane health > 0.05 → both spend-branches live (§7.6a)",
  });
}

function deriveCashBurn(
  prev: SimProjection,
  next: SimProjection,
  nowUs: SimTimeUs,
  resourceReady: number,
): DecisionAnnotation | null {
  const cashDelta = next.freeCashMicroUsd - prev.freeCashMicroUsd;
  if (cashDelta > -DECISION_GATES.cashBurnMinMicroUsd) return null;
  const landedDelta = next.counters.landed - prev.counters.landed;
  // (a) burn WITH landings is a trade-off (reinvest vs bank); burn WITHOUT
  // them is a leak — that is the ledger's alarm, not a marked decision.
  if (landedDelta <= 0) return null;
  return build({
    kind: "cash-burn",
    subjectId: "ledger",
    stamp: next.tick,
    title: "Free bucket is draining while traffic lands — reinvest or bank",
    whyItMatters: `Free cash fell ${(-cashDelta).toString()} µ$ this frame while ${landedDelta} requests landed. Working capital is the runway (§6.4); every framed fork spends from the same pool.`,
    options: [
      { id: "reinvest", label: "Reinvest the margin into capacity/defense" },
      { id: "bank", label: "Bank it — hold the buffer against the next spike" },
    ],
    openedAtUs: nowUs,
    nowUs,
    signals: { closingWindowFrom: nowUs, viabilityEvidence: 1, resourceReady },
    explainInputs: [
      { name: "free cash Δ (µ$)", value: cashDelta.toString() },
      { name: "landed (Δ frame)", value: String(landedDelta) },
    ],
    formula: "ΔfreeCash ≤ −$1 AND Δlanded > 0 → a trade, not a leak (§7.6a)",
  });
}

/* ═══════════════════════════ internals ═══════════════════════════ */

function build(args: {
  kind: DecisionKind;
  subjectId: string;
  stamp: bigint | string;
  title: string;
  whyItMatters: string;
  options: readonly ForkOption[];
  openedAtUs: SimTimeUs;
  nowUs: SimTimeUs;
  signals: { closingWindowFrom: SimTimeUs; viabilityEvidence: number; resourceReady: number };
  explainInputs: ExplainPayload["inputs"];
  formula: string;
}): DecisionAnnotation | null {
  const span = DECISION_WINDOWS[args.kind];
  const remainingUs = args.openedAtUs + span - args.nowUs;
  if (remainingUs <= 0n) return null; // (b) window already closed → history
  const closingPressure = clamp01(1 - Number(remainingUs) / Number(span));
  const score =
    DECISION_SCORE_WEIGHTS.closing * closingPressure +
    DECISION_SCORE_WEIGHTS.viability * args.signals.viabilityEvidence +
    DECISION_SCORE_WEIGHTS.resource * args.signals.resourceReady;
  const id = `${args.kind}:${args.subjectId}:${args.stamp.toString()}`;
  return Object.freeze({
    id,
    kind: args.kind,
    subjectId: args.subjectId,
    title: args.title,
    whyItMatters: args.whyItMatters,
    options: Object.freeze(args.options.map((o) => Object.freeze({ ...o }))),
    window: Object.freeze({ openedAtUs: args.openedAtUs, closesAtUs: args.openedAtUs + span }),
    signals: Object.freeze({
      closingPressure,
      viabilityEvidence: args.signals.viabilityEvidence,
      resourceReady: args.signals.resourceReady,
      score,
    }),
    rank: 0, // stamped by the ranked fold in deriveDecisionCandidates
    explain: Object.freeze({
      title: `${args.kind} — ${args.subjectId}`,
      formula: args.formula,
      inputs: Object.freeze(args.explainInputs.map((i) => Object.freeze({ ...i }))),
    }),
  });
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function display(value: number): string {
  return value.toFixed(2);
}

function frameHasRefusal(next: SimProjection, reason: string): boolean {
  return next.notices.some(
    (n) => n.kind === "intent-refused" && (n.detail ?? "").includes(reason),
  );
}

/** Door receipt detail law (shared/protocol NoticeKind docs): executions
 *  carry "<verb>", refusals "<verb>: <reason>". Malformed detail is a
 *  producer bug — fail loud with the DecisionError family, never guess. */
export function parseRefusalDetail(detail: string): { verb: string; reason: string } {
  const cut = detail.indexOf(":");
  if (cut < 0) {
    throw new DecisionError("bad-refusal-detail", `"${detail}" is not "<verb>: <reason>"`);
  }
  const verb = detail.slice(0, cut).trim();
  const reason = detail.slice(cut + 1).trim();
  if (verb.length === 0 || reason.length === 0) {
    throw new DecisionError(
      "bad-refusal-detail",
      `"${detail}" has an empty verb or reason segment`,
    );
  }
  return { verb, reason };
}

function assertMonotonicCounters(prev: SimProjection | null, next: SimProjection): void {
  if (prev === null) return;
  const deltas: readonly [string, number][] = [
    ["served", next.counters.served - prev.counters.served],
    ["bounced", next.counters.bounced - prev.counters.bounced],
    ["blockedFalsePositive", next.counters.blockedFalsePositive - prev.counters.blockedFalsePositive],
    ["landed", next.counters.landed - prev.counters.landed],
  ];
  for (const [name, delta] of deltas) {
    if (delta < 0) {
      throw new DecisionError(
        "counters-went-backwards",
        `${name} decreased by ${-delta} between seq ${prev.seq} and ${next.seq} — cumulative counters never shrink`,
      );
    }
  }
}

function pushIf<T>(sink: T[], value: T | null): void {
  if (value !== null) sink.push(value);
}
