/**
 * GATE-G5 · read-projection adapter — THE CONTRACT between the economy module's
 * public state and The Book's minimal slice (kanban, invoice tape, bucket
 * stack, renewal strip, dunning ladder, cash-vs-profit panes).
 *
 * LAWS OF THIS LAYER (the shape other gates will reuse):
 *  1. READ-ONLY. Nothing here mutates sim state or adds mutators — every value
 *     is recomputed from QuarterResult's immutable journal/notices/state.
 *  2. AS-OF MINUTE. `projectFrame(result, minute)` answers "what does the book
 *     say at business minute m?" by summing only deltas and notices stamped
 *     ≤ m. Bucket balances are EXACT as-of (the journal is the single source);
 *     structure (invoices, schedules, budgets) is read from the final state and
 *     gated by its own timestamps — never by re-running the sim.
 *  3. EVERY NUMBER CARRIES ITS LAW. Each rendered value ships an
 *     ExplainPayload: the formula in prose + the literal inputs, so the UI's
 *     Explain-This-Number click is a lookup, not a computation.
 *  4. OD-1. No scorecard anywhere: only ledger primitives (journal deltas,
 *     buckets, invoice records, notices, error-budget structs).
 */

import { asMoney, type BucketId, type EntityId, type MoneyUnit } from "@hh/sim-core/types";
import { BUCKET_IDS } from "@hh/sim-core/economy";
import type { DunningStage, EconomyNotice, Invoice } from "./quarter.ts";
import {
  DUNNING_STAGE_ORDER,
  GATE5_SCRIPT,
  MINUTES_PER_DAY,
  MINUTES_PER_MONTH,
  QUARTER_MINUTES,
  usd,
  type G5Signing,
  type QuarterResult,
} from "./quarter.ts";

/* ────────────────────────── Explain-This-Number contract ────────────────────────── */

export interface ExplainInput {
  readonly name: string;
  readonly value: string;
}

export interface ExplainPayload {
  readonly title: string;
  /** The LAW in one line of prose — what computes this number. */
  readonly formula: string;
  readonly inputs: readonly ExplainInput[];
}

export interface Explainable {
  readonly explain: ExplainPayload;
}

/* ───────────────────────── six buckets, six laws (§6.13) ───────────────────────── */

export interface BucketLaw {
  readonly bucket: BucketId;
  readonly label: string;
  /** The law of this money — tooltip copy, verbatim §6.13 "Cash Is Not One Number". */
  readonly law: string;
  /** CSS color token for the stack segment (skin chord of the shared-web bundle). */
  readonly hue: string;
}

export const BUCKET_LAWS: Readonly<Record<BucketId, BucketLaw>> = {
  free: {
    bucket: "free",
    label: "Free cash",
    law: "Spendable now. Death happens on free — you can be profitable and bankrupt.",
    hue: "var(--g5-mint)",
  },
  restricted: {
    bucket: "restricted",
    label: "Rolling reserve",
    law: "10 % of every card settlement, held by the acquirer for 180 days. Your money, hostage.",
    hue: "var(--g5-putty)",
  },
  deferred: {
    bucket: "deferred",
    label: "Deferred revenue",
    law: "Prepaid money for service not yet delivered. Not earned until recognized, 1/12 per month — refund pulls the unreleased part back.",
    hue: "var(--g5-teal)",
  },
  accountsReceivable: {
    bucket: "accountsReceivable",
    label: "Receivables (AR)",
    law: "Invoiced, uncollected. Net-terms B2B lives here for 30–45 days while payroll does not wait.",
    hue: "var(--g5-sodium)",
  },
  backlog: {
    bucket: "backlog",
    label: "Backlog",
    law: "Sold, not delivered. A promise wearing a money costume until provisioning catches up.",
    hue: "var(--g5-dishwater)",
  },
  committedOut: {
    bucket: "committedOut",
    label: "Committed outflow",
    law: "Money already promised out the door (contracts signed against it). Subtract it before you feel rich.",
    hue: "var(--g5-oxide)",
  },
};

/* ─────────────────────────────── frame shapes ─────────────────────────────── */

export interface KanbanCard extends Explainable {
  readonly contractId: string;
  readonly label: string;
  readonly mrcText: string;
  readonly role: G5Signing["role"];
  readonly hint: string;
}

export interface KanbanColumn extends Explainable {
  readonly column: "lead" | "contracted" | "billing" | "renewal" | "offbook";
  readonly title: string;
  readonly cards: readonly KanbanCard[];
}

export interface BucketRow extends Explainable {
  readonly law: BucketLaw;
  readonly amount: MoneyUnit;
  readonly amountText: string;
  readonly share: number; // 0..1 of the six-bucket total (bar width)
}

export interface TapeRow extends Explainable {
  readonly key: string;
  readonly minute: number;
  readonly stamp: string; // "D3 07:12" business stamp
  readonly contractId: string;
  readonly event: "issued" | "landed" | "declined" | "written-off";
  readonly grossText: string;
  readonly netText: string;
  readonly landing: string; // which bucket the money went to / stays in
}

export interface RenewalRow extends Explainable {
  readonly contractId: string;
  readonly label: string;
  readonly cliffMinute: number;
  readonly pulseOpenMinute: number;
  readonly pulseOpen: boolean;
  readonly status: "quiet" | "pulsing" | "renewed" | "lapsed" | "dead-ladder";
}

export interface DunningRow extends Explainable {
  readonly contractId: string;
  readonly label: string;
  readonly invoiceId: string;
  readonly pips: readonly { stage: DunningStage; reached: boolean; label: string }[];
  readonly outcome: string;
}

export interface MonthPane extends Explainable {
  readonly label: string;
  readonly profitText: string;
  readonly accrualText: string;
  readonly opexText: string;
  readonly cashText: string; // Δfree over the month
  readonly collectedText: string;
  readonly profitPositive: boolean;
  readonly cashCratering: boolean;
}

export interface BudgetRow extends Explainable {
  readonly contractId: string;
  readonly label: string;
  readonly remainingSec: string;
  readonly monthBudgetSec: string;
  readonly weekIndex: number;
  readonly burned: boolean;
  readonly lockedAtMinute: number | null;
}

export interface TickerRow {
  readonly key: string;
  readonly minute: number;
  readonly kind: string;
  readonly contractId: string;
  readonly causeId: string;
  readonly detail: string;
}

export interface Gate5Frame {
  readonly minute: number;
  readonly day: number;
  readonly quarterEndsAt: number;
  readonly buckets: readonly BucketRow[];
  readonly bankBalanceText: string;
  readonly spendableText: string;
  readonly netPositionText: string;
  readonly bucketTotalText: string;
  readonly kanban: readonly KanbanColumn[];
  readonly tape: readonly TapeRow[];
  readonly renewals: readonly RenewalRow[];
  readonly dunning: readonly DunningRow[];
  readonly months: readonly MonthPane[];
  readonly budgets: readonly BudgetRow[];
  readonly ticker: readonly TickerRow[];
}

/* ────────────────────────────── helpers (pure) ────────────────────────────── */

const signingsById: ReadonlyMap<string, G5Signing> = new Map(
  GATE5_SCRIPT.map((s) => [s.contractId, s]),
);

function signingOf(contractId: string): G5Signing {
  const s = signingsById.get(contractId);
  if (s === undefined) throw new RangeError(`g5/projection: '${contractId}' is not in GATE5_SCRIPT`);
  return s;
}

type PlainTotals = Record<BucketId, bigint>;

function sumDeltasUpTo(result: QuarterResult, minute: number): PlainTotals {
  const totals = Object.fromEntries(BUCKET_IDS.map((b) => [b, 0n])) as PlainTotals;
  for (const e of result.allEntries) {
    if (e.atBusinessMin > minute) break; // journal is time-ordered (audit proves it)
    for (const b of BUCKET_IDS) {
      const d = e.delta[b];
      if (d !== undefined) totals[b] = totals[b] + d;
    }
  }
  return totals;
}

function businessStamp(minute: number): string {
  const day = Math.floor(minute / MINUTES_PER_DAY);
  const hh = String(Math.floor((minute % MINUTES_PER_DAY) / 60)).padStart(2, "0");
  const mm = String(minute % 60).padStart(2, "0");
  return `D${day} ${hh}:${mm}`;
}

function pulseOpenMinuteOf(cliffMinute: number): number {
  return cliffMinute - 90 * MINUTES_PER_DAY; // §6.4 renewal-pulse lead
}

/** The contract's ORIGINAL cliff (termEnd at signing), from the script — the
 *  final state may show post-renewal extension; the strip tells the quarter's story. */
function originalCliffOf(contractId: string): number {
  const s = signingOf(contractId);
  return s.signDay * MINUTES_PER_DAY + s.termMonths * MINUTES_PER_MONTH;
}

/* ─────────────────────────────── the projector ─────────────────────────────── */

export function projectFrame(result: QuarterResult, minute: number): Gate5Frame {
  const asOf = sumDeltasUpTo(result, minute);
  const noticesSoFar = result.allNotices.filter((n) => n.atBusinessMin <= minute);

  const buckets = bucketRows(asOf);
  const totals = summaryLines(asOf);

  return {
    minute,
    day: Math.floor(minute / MINUTES_PER_DAY),
    quarterEndsAt: QUARTER_MINUTES,
    buckets,
    ...totals,
    kanban: kanbanColumns(result, minute, noticesSoFar),
    tape: invoiceTape(result, minute, 14),
    renewals: renewalRows(result, minute, noticesSoFar),
    dunning: dunningRows(result, minute, noticesSoFar),
    months: monthPanes(result, minute),
    budgets: budgetRows(result, minute, noticesSoFar),
    ticker: tickerRows(noticesSoFar, 24),
  };
}

/* Buckets + their law-tooltips + explain payloads */

function bucketRows(asOf: PlainTotals): readonly BucketRow[] {
  const grand = BUCKET_IDS.reduce((acc, b) => acc + (asOf[b] > 0n ? asOf[b] : 0n), 0n);
  return BUCKET_IDS.map((b) => {
    const amount = asMoney(asOf[b]);
    const contributions = topCausesFor(b, amount);
    return {
      law: BUCKET_LAWS[b],
      amount,
      amountText: usd(amount),
      share: grand === 0n ? 0 : Number((amount > 0n ? amount : 0n) * 10_000n / grand) / 10_000,
      explain: {
        title: `${BUCKET_LAWS[b].label} — as of this minute`,
        formula: "Σ of every ledger delta on this bucket with atBusinessMin ≤ now (the journal is the ONLY money writer)",
        inputs: [
          { name: "as-of minute", value: "current scrub position" },
          { name: "balance", value: usd(amount) },
          ...contributions,
        ],
      },
    };
  });
}

/** Heuristic forensics for the popover: named laws that commonly drive each
 *  bucket. (Trail-level detail lives in attributionTrail; the frame keeps a
 *  cheap, deterministic summary so scrubbing stays O(entries).) */
function topCausesFor(b: BucketId, amount: MoneyUnit): readonly ExplainInput[] {
  return [{ name: "law", value: BUCKET_LAWS[b].law }].concat(
    b === "free"
      ? [{ name: "rule", value: "spendable-now: payroll, incidents and reserves hit this bucket first" }]
      : [],
  ).concat([{ name: "current", value: usd(amount) }]);
}

function summaryLines(asOf: PlainTotals): {
  bankBalanceText: string;
  spendableText: string;
  netPositionText: string;
  bucketTotalText: string;
} {
  const bank = asOf.free + asOf.restricted + asOf.deferred;
  const net = bank + asOf.accountsReceivable + asOf.backlog - asOf.committedOut;
  const grand = BUCKET_IDS.reduce((acc, b) => acc + asOf[b], 0n);
  return {
    bankBalanceText: usd(bank),
    spendableText: usd(asOf.free),
    netPositionText: usd(net),
    bucketTotalText: usd(grand),
  };
}

/* Kanban — TRUE as-of: position derives from signing day + notices ≤ minute */

interface PhaseFact {
  suspended: boolean; // currently suspended at minute
  dead: boolean; // written-off or cliff-lapsed
  deadByLapse: boolean; // cliff lapse (not the ladder)
  renewed: boolean;
}

function phaseFactsAt(notices: readonly EconomyNotice[], minute: number): Map<string, PhaseFact> {
  void minute;
  const facts = new Map<string, PhaseFact>();
  const factOf = (id: string): PhaseFact => {
    let f = facts.get(id);
    if (f === undefined) {
      f = { suspended: false, dead: false, deadByLapse: false, renewed: false };
      facts.set(id, f);
    }
    return f;
  };
  for (const n of notices) {
    const id = `${n.contractId}`;
    const f = factOf(id);
    if (n.kind === "suspended") f.suspended = true;
    if (n.kind === "suspension-lifted" || n.kind === "dunning-recovered") f.suspended = false;
    if (n.kind === "written-off" || n.kind === "cliff-lapsed") f.dead = true;
    if (n.kind === "cliff-lapsed") f.deadByLapse = true;
    if (n.kind === "cliff-renewed") f.renewed = true;
  }
  return facts;
}

function kanbanColumns(
  result: QuarterResult,
  minute: number,
  notices: readonly EconomyNotice[],
): readonly KanbanColumn[] {
  const facts = phaseFactsAt(notices, minute);
  const cols: Record<KanbanColumn["column"], KanbanCard[]> = {
    lead: [], contracted: [], billing: [], renewal: [], offbook: [],
  };
  for (const s of GATE5_SCRIPT) {
    const signMin = s.signDay * MINUTES_PER_DAY;
    const id = s.contractId;
    const f = facts.get(id) ?? { suspended: false, dead: false, deadByLapse: false, renewed: false };
    const firstIssue = result.allNotices.some(
      (n) => `${n.contractId}` === id && n.kind === "invoice-issued" && n.atBusinessMin <= minute,
    );
    const cliff = originalCliffOf(id);
    const card: KanbanCard = {
      contractId: id,
      label: s.customerLabel,
      mrcText: `${usd(s.mrcMicroUsd)}/mo`,
      role: s.role,
      hint: cardHint(s, f, firstIssue, cliff, minute),
      explain: cardExplain(s, result, minute),
    };
    if (signMin > minute) cols.lead.push(card);
    else if (f.dead) cols.offbook.push(card);
    else if (f.renewed || (minute >= pulseOpenMinuteOf(cliff) && minute < cliff)) cols.renewal.push(card);
    else if (firstIssue) cols.billing.push(card);
    else cols.contracted.push(card);
  }
  const titles: Record<KanbanColumn["column"], string> = {
    lead: "Lead",
    contracted: "Contracted",
    billing: "Billing",
    renewal: "Renewal",
    offbook: "Closed book",
  };
  return (["lead", "contracted", "billing", "renewal", "offbook"] as const).map((column) => ({
    column,
    title: titles[column],
    cards: cols[column],
    explain: columnExplain(column, cols[column].length),
  }));
}

function cardHint(
  s: G5Signing,
  f: PhaseFact,
  firstIssue: boolean,
  cliff: number,
  minute: number,
): string {
  if (s.signDay * MINUTES_PER_DAY > minute) return `signs day ${s.signDay}`;
  if (f.dead) return "off the book";
  if (f.suspended) return "SUSPENDED — dunning";
  if (minute >= pulseOpenMinuteOf(cliff) && minute < cliff) return "pulse open — cliff ahead";
  if (f.renewed) return "renewed at cliff";
  if (!firstIssue) return "awaiting first invoice";
  return s.cycle === "annual" ? "prepaid annual" : "auto-pay monthly";
}

function cardExplain(s: G5Signing, result: QuarterResult, minute: number): ExplainPayload {
  const grossFormula =
    s.cycle === "annual"
      ? "annual gross = MRC × 12 × (1 − 15 % prepay discount) — '2 months free', a financing instrument (§6.13)"
      : "monthly gross = MRC (hourly would be MRC/720; net-0 card auto-pay)";
  return {
    title: `${s.customerLabel} (${s.contractId})`,
    formula: grossFormula,
    inputs: [
      { name: "MRC", value: `${usd(s.mrcMicroUsd)}/mo` },
      { name: "cycle", value: s.cycle },
      { name: "signed", value: `day ${s.signDay}` },
      { name: "cliff", value: `minute ${originalCliffOf(s.contractId)}` },
      { name: "bundle", value: result.bundleId },
      { name: "sheet", value: `${result.tuningSheetMarker} (PROVISIONAL — carried, never resolved here)` },
      { name: "as-of", value: businessStamp(minute) },
    ],
  };
}

function columnExplain(column: KanbanColumn["column"], count: number): ExplainPayload {
  const laws: Record<KanbanColumn["column"], string> = {
    lead: "on the book at a future signing day — pipeline, not revenue",
    contracted: "signed, on the books, no invoice issued yet — TCV is a promise",
    billing: "at least one invoice on the grid — this is where money law runs",
    renewal: "inside the 90-day renewal-pulse window before the cliff (§6.4)",
    offbook: "written off or lapsed — dead, but its ledger history stays readable forever",
  };
  return {
    title: `Column: ${column}`,
    formula: "position = signing-day ≤ now, then phase notices ≤ now (suspended/lifted/dead/renewed), then pulse window, then first invoice",
    inputs: [{ name: "cards here", value: String(count) }, { name: "law", value: laws[column] }],
  };
}

/* Invoice tape — which money landed, which is deferred/AR */

function invoiceTape(result: QuarterResult, minute: number, cap: number): readonly TapeRow[] {
  const rows: TapeRow[] = [];
  for (const inv of result.finalState.invoices) {
    if (inv.issuedAtMin > minute) continue;
    rows.push(tapeRow("issued", inv, inv.issuedAtMin, result));
    if (inv.settledAtMin !== null && inv.settledAtMin <= minute) {
      rows.push(tapeRow("landed", inv, inv.settledAtMin, result));
    }
  }
  for (const n of result.allNotices) {
    if (n.atBusinessMin > minute) break;
    if (n.kind === "invoice-failed") rows.push(tapeNoticeRow("declined", n, result));
    if (n.kind === "written-off") rows.push(tapeNoticeRow("written-off", n, result));
  }
  rows.sort((a, b) => b.minute - a.minute);
  return rows.slice(0, cap);
}

function landingOf(inv: Invoice): string {
  if (inv.state === "written-off") return "reversed out of AR";
  if (inv.state !== "paid") return `sitting in AR (${inv.terms.netTermsDays > 0 ? `net-${inv.terms.netTermsDays}+15 slip` : "awaiting card retry"})`;
  if (inv.terms.netTermsDays > 0) return "collected → free, 10 % parked to reserve";
  return inv.terms.annualPrepay ? "prepaid → deferred, recognized 1/12" : "auto-pay → free, 10 % parked to reserve";
}

function tapeRow(event: "issued" | "landed", inv: Invoice, atMinute: number, _result: QuarterResult): TapeRow {
  const label = inv.contractId.replace(/^c/, "");
  return {
    key: `${inv.id}:${event}`,
    minute: atMinute,
    stamp: businessStamp(atMinute),
    contractId: `${inv.contractId}`,
    event,
    grossText: usd(inv.gross),
    netText: usd(inv.net),
    landing: event === "issued" ? "AR + gross (promise booked)" : landingOf(inv),
    explain: {
      title: `Invoice ${inv.id} — ${event}`,
      formula:
        event === "issued"
          ? "issue: accountsReceivable += gross · cause economy:invoice:<contract>:<cycle>"
          : "settle: AR −= gross; fee = 2.90 % + $0.30 (card) taken at the door; net → free (auto-pay, then 10 % reserve) or → deferred (invoiced/annual, recognized 1/12)",
      inputs: [
        { name: "gross", value: usd(inv.gross) },
        { name: "fee", value: usd(inv.fee) },
        { name: "net", value: usd(inv.net) },
        { name: "due law", value: inv.terms.netTermsDays > 0 ? `net-${inv.terms.netTermsDays} + 15-day slip` : "due at issue (net-0)" },
        { name: "contract", value: `c${label}` },
        { name: "as-of", value: businessStamp(atMinute) },
      ],
    },
  };
}

function tapeNoticeRow(event: "declined" | "written-off", n: QuarterResult["allNotices"][number], result: QuarterResult): TapeRow {
  const inv = result.finalState.invoices.find((i) => i.id === n.invoiceId);
  return {
    key: `${n.invoiceId ?? n.kind}:${event}:${n.atBusinessMin}`,
    minute: n.atBusinessMin,
    stamp: businessStamp(n.atBusinessMin),
    contractId: `${n.contractId}`,
    event,
    grossText: inv === undefined ? "—" : usd(inv.gross),
    netText: inv === undefined ? "—" : usd(inv.net),
    landing: event === "declined" ? "stays in AR — the ladder starts" : "AR −= gross — the sale never happened",
    explain: {
      title: `${event === "declined" ? "Card declined" : "Written off"} — ${n.contractId}`,
      formula:
        event === "declined"
          ? "payment attempt at dueAtMin fails the roll → invoice state 'failed' → dunning ladder day 1"
          : "terminate rung (due + 20 dunning days) → AR reversed, prepaid parts refunded (deferred first, then claw from free)",
      inputs: [
        { name: "cause", value: `${n.causeId}` },
        { name: "minute", value: String(n.atBusinessMin) },
        ...(inv === undefined ? [] : [{ name: "invoice", value: `${inv.id}` }]),
      ],
    },
  };
}

/* Renewal strip — cliff markers on a quarter ruler */

function renewalRows(
  result: QuarterResult,
  minute: number,
  notices: readonly EconomyNotice[],
): readonly RenewalRow[] {
  const facts = phaseFactsAt(notices, minute);
  const rows: RenewalRow[] = [];
  for (const s of GATE5_SCRIPT) {
    const cliff = originalCliffOf(s.contractId);
    const pulse = pulseOpenMinuteOf(cliff);
    if (cliff > QUARTER_MINUTES + MINUTES_PER_MONTH && pulse > minute) continue; // never visible this quarter
    const f = facts.get(s.contractId) ?? { suspended: false, dead: false, deadByLapse: false, renewed: false };
    const status: RenewalRow["status"] = f.dead
      ? f.deadByLapse
        ? "lapsed"
        : "dead-ladder"
      : f.renewed
        ? "renewed"
        : minute >= pulse
          ? "pulsing"
          : "quiet";
    rows.push({
      contractId: s.contractId,
      label: s.customerLabel,
      cliffMinute: cliff,
      pulseOpenMinute: pulse,
      pulseOpen: minute >= pulse,
      status,
      explain: {
        title: `Renewal law — ${s.contractId}`,
        formula: "pulse opens at termEnd − 90 days; the cliff resolves EXACTLY at now ≥ termEndMin, BEFORE any calendar rung (§6.4). A 2-month deal re-cliffs every renewal.",
        inputs: [
          { name: "cliff minute", value: String(cliff) },
          { name: "pulse open minute", value: String(pulse) },
          { name: "status now", value: status },
          ...(s.role === "whale"
            ? [{ name: "scripted cause", value: result.allNotices.find((n) => n.kind === "cliff-lapsed")?.causeId ?? WHALE_CAUSE_FALLBACK }]
            : []),
        ],
      },
    });
  }
  return rows.sort((a, b) => a.cliffMinute - b.cliffMinute);
}

const WHALE_CAUSE_FALLBACK = "gate5:rule:whale-price-increase-refused";

/* Dunning ladder — per-contract pip chain from the notice trail */

const PIP_LABELS: Record<DunningStage, string> = {
  failed: "D0 declined",
  retry: "D1 retry",
  reminder: "D5 reminder",
  warning: "D8 warning",
  suspend: "D10 suspension",
  terminate: "D20 write-off",
};

function dunningRows(
  result: QuarterResult,
  minute: number,
  notices: readonly EconomyNotice[],
): readonly DunningRow[] {
  const ladderNotices = notices.filter(
    (n) =>
      n.kind === "invoice-failed" ||
      n.kind === "dunning-stage" ||
      n.kind === "suspended" ||
      n.kind === "written-off" ||
      n.kind === "dunning-recovered" ||
      n.kind === "suspension-lifted",
  );
  const byContract = new Map<string, typeof ladderNotices>();
  for (const n of ladderNotices) {
    const id = `${n.contractId}`;
    const list = byContract.get(id) ?? [];
    list.push(n);
    byContract.set(id, list);
  }
  const rows: DunningRow[] = [];
  for (const [id, ns] of byContract) {
    const reached = new Set<DunningStage>();
    for (const n of ns) {
      if (n.kind === "invoice-failed") reached.add("failed");
      if (n.kind === "dunning-stage" && n.stage !== undefined) reached.add(n.stage as DunningStage);
      if (n.kind === "suspended") reached.add("suspend");
      if (n.kind === "written-off") reached.add("terminate");
      if (n.kind === "dunning-recovered" && n.stage === "terminate") reached.add("terminate");
    }
    const recovered = ns.some((n) => n.kind === "dunning-recovered" || n.kind === "suspension-lifted");
    const dead = ns.some((n) => n.kind === "written-off");
    const lastAt = Math.max(...ns.map((n) => n.atBusinessMin));
    rows.push({
      contractId: id,
      label: signingOf(id).customerLabel,
      invoiceId: `${ns.find((n) => n.invoiceId !== undefined)?.invoiceId ?? ""}`,
      pips: DUNNING_STAGE_ORDER.map((stage) => ({
        stage,
        reached: reached.has(stage),
        label: PIP_LABELS[stage],
      })),
      outcome: dead ? "written off" : recovered ? "RESURRECTED (E-2)" : "on the ladder",
      explain: {
        title: `Dunning ladder — ${id}`,
        formula: "rungs at 1/5/8/10/20 days past due; recovery is rolled at each stage ENTRY; the terminate rung is post-suspension — a dead man's wallet can still come back (E-2)",
        inputs: [
          { name: "stages hit", value: [...reached].join(" → ") },
          { name: "last beat", value: businessStamp(lastAt) },
          { name: "outcome", value: dead ? "written off — AR reversed" : recovered ? "recovered post-suspension, phase active" : "still climbing" },
          { name: "ladder law", value: "config PROVISIONAL: DUNNING_STAGE_ORDER + stage days from defaultEconomyConfig" },
        ],
      },
    });
  }
  return rows.sort((a, b) => a.contractId.localeCompare(b.contractId));
}

/* Cash-vs-profit — the SAME month, two lenses (the category axiom on screen) */

function monthPanes(result: QuarterResult, minute: number): readonly MonthPane[] {
  return result.months
    .filter((m) => m.startMin <= minute)
    .map((m) => {
      const profit = m.accrualRevenue - m.opex;
      const cratered = m.deltaFree < 0n;
      return {
        label: `Month ${m.monthIndex + 1}`,
        profitText: usd(profit),
        accrualText: usd(m.accrualRevenue),
        opexText: usd(m.opex),
        cashText: usd(m.deltaFree),
        collectedText: usd(m.netCollected),
        profitPositive: profit > 0n,
        cashCratering: cratered,
        explain: {
          title: `Month ${m.monthIndex + 1} — accrual vs cash`,
          formula:
            "PROFIT pane = Σ new AR credits (revenue BOOKED at invoice issue) − scripted opex · CASH pane = OPERATING Δfree across the month — owner capital excluded, only settled trading money moves free; prepaid annuals sit in deferred, B2B net-30+15 sits in AR, 10 % of card money sits in reserve",
          inputs: [
            { name: "accrual revenue", value: usd(m.accrualRevenue) },
            { name: "opex", value: usd(m.opex) },
            { name: "book profit", value: usd(profit) },
            { name: "cash collected (free in)", value: usd(m.netCollected) },
            { name: "operating Δfree", value: usd(m.deltaFree) },
            { name: "capital excluded", value: "founding/owner capital never counts as trading cash" },
            { name: "lesson", value: profit > 0n && cratered ? "PROFIT POSITIVE, CASH CRATERING — the categories are not the same river" : "—" },
          ],
        },
      };
    });
}

/* Error budgets — burn + the E-9 multi-week refund story */

function budgetRows(
  result: QuarterResult,
  minute: number,
  notices: readonly EconomyNotice[],
): readonly BudgetRow[] {
  const endMinute = result.settles[result.settles.length - 1]?.minute ?? 0;
  const rows: BudgetRow[] = [];
  for (const [id, b] of result.finalState.errorBudgets) {
    const s = signingsById.get(`${id}`);
    if (s === undefined) continue;
    const refunds = notices.filter((n) => n.kind === "clean-week-refund" && `${n.contractId}` === `${id}`);
    const burn = notices.filter(
      (n) => (`${n.contractId}` === `${id}`) && (n.kind === "sla-credit-due" || n.kind === "budget-locked"),
    );
    const locked = notices.find((n) => n.kind === "budget-locked" && `${n.contractId}` === `${id}`);
    const monthBudget = (Number(b.budgetSec) / 60).toFixed(1);
    rows.push({
      contractId: `${id}`,
      label: s.customerLabel,
      remainingSec:
        minute >= endMinute
          ? `${(Number(remainingLike(result, id)) / 60).toFixed(1)} min (final)`
          : "— final at quarter close",
      monthBudgetSec: `${monthBudget} min`,
      weekIndex: b.weekIndex,
      burned: burn.length > 0, // rollMonth zeroes the struct — the NOTICE trail is the as-of truth
      lockedAtMinute: locked?.atBusinessMin ?? null,
      explain: {
        title: `Error budget — ${id} (99.9 % SLA, PROVISIONAL)`,
        formula: "budgetSec = 30 days × (1 − 99.9 %) = 2,592 s/month · outages drain silently · a risky deploy on an empty budget is LOCKED (never thrown) · every CLOSED week with zero consumption refunds 60 s (rollWeek catch-up: a settlement freeze stacks multiple clean-week refunds, one cause per week — E-9)",
        inputs: [
          { name: "month budget", value: "2592.0 s (43.2 min)" },
          { name: "drained by outage", value: `${b.drainedSec} s` },
          { name: "spent by risky action", value: `${b.spentSec} s` },
          { name: "refunded clean weeks", value: `${refunds.length} × 60 s` },
          { name: "burn beats ≤ now", value: burn.map((n) => n.kind).join(", ") || "none" },
          { name: "week index", value: String(b.weekIndex) },
        ],
      },
    });
  }
  return rows.sort((a, b) => a.contractId.localeCompare(b.contractId));
}

/** remainingSec is a value computed from final state only; budgets that died
 *  with their contract keep their last struct — the frame reads it as-of the
 *  final settle (error budgets have no intra-month history in the struct). */
function remainingLike(result: QuarterResult, id: EntityId): bigint {
  const b = result.finalState.errorBudgets.get(id);
  if (b === undefined) return 0n;
  const head = b.budgetSec + b.carryInSec + b.refundedSec - b.drainedSec - b.spentSec;
  return head < 0n ? 0n : head;
}

/* Ticker — the quarter's notice trail, newest first */

function tickerRows(notices: readonly EconomyNotice[], cap: number): readonly TickerRow[] {
  return notices
    .slice(-cap)
    .reverse()
    .map((n) => ({
      key: `${n.kind}:${n.contractId}:${n.atBusinessMin}:${n.invoiceId ?? ""}:${n.stage ?? ""}`,
      minute: n.atBusinessMin,
      kind: n.kind,
      contractId: `${n.contractId}`,
      causeId: `${n.causeId}`,
      detail:
        n.amount !== undefined ? usd(n.amount) : n.seconds !== undefined ? `${n.seconds} s` : n.stage ?? "",
    }));
}

export { signingsById, originalCliffOf, pulseOpenMinuteOf, businessStamp };
