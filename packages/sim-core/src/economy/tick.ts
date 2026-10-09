/**
 * runEconomyTick — the step-12 economic settlement (pipeline slot 12,
 * MASTER_REPORT §3.2/§4.4 C5: the ledger is SIM STATE computed in-core;
 * MySQL is the notary).
 *
 * Determinism contract (§4.1 R-16, docs/CONVENTIONS.md):
 *  - every contract is visited in EntityId-sorted order;
 *  - every stochastic draw is a fresh counter-stream keyed
 *    (seed, domain, business-minute slot, contractId) — same run replays
 *    byte-identical (×100 CI gate);
 *  - money moves ONLY through `post`, whose signature REQUIRES a CauseId
 *    (P10 attribution is structurally mandatory) and asserts the six-bucket
 *    invariants (fail loud, Law 4);
 *  - pure over (prior state, inputs): no module globals, no wall-clock or
 *    Math.random reads, no floats anywhere in the money path.
 *
 * Sub-step order inside one tick (stable across replays):
 *   0.5 committedOut re-declaration from the vendor-commit book (§6.12/§6.13)
 *   1 auto-prime guard for contracts the orchestrator never registered
 *   1.5 backlog sign-post + pending→active service-start (§6.13)
 *   2 month rolls — burn close, runway/spiral, voluntary churn cohort,
 *     error-budget carry/re-grant, covenant bank review (may catch up
 *     several months of a pause)
 *   3 MFN reprices fire when their lag delay elapses (§7.15)
 *   4 renewal pulses — 90 d window (§6.4)
 *   5 renewal cliffs — fire exactly at the term-end business minute (§6.12);
 *     BEFORE the calendar, so a renew restarts the grid on the same tick and
 *     a lapse never writes a zombie invoice
 *   6 invoice calendar — AR credit at issue, backlog drain while seeded
 *     promise remains (§6.4 "billing 1st")
 *   7 payment attempts at due — card-failure roll (5–9%/mo, §6.4)
 *   8 dunning FSM ladder — recovery (lifting a suspension back to active) /
 *     suspend / write-off+terminate + cancellation refund settlement (§6.4)
 *   8.5 chargeback fees (§6.13)
 *   9 error budgets — outage drains, spends with exhaustion locks, clean
 *     weeks, sla-hit credit readouts (§6.1)
 *  10 ghosted churn signals / defusals (30–60 d lag, §7.15)
 *  11 unlock schedules — deferred recognition 1/12 & reserve release (§6.13)
 *  12 lose-slowly guard — ≥3 real-minutes warning (§9.6)
 *  12.5 reputation fold + publish-on-change observed write (§2.10/§5.10)
 */

import {
  asCauseId,
  asEntityId,
  asMoney,
  type CauseId,
  type Contract,
  type EntityId,
  type InvoiceSettledEvent,
  type LedgerEntry,
  type MoneyBuckets,
  type MoneyUnit,
  type ObservedWrite,
  type RevenueQualityBand,
  type RunSeed,
  type SimMinute,
  type TickContext,
} from "../types.ts";
import { compare, fromRatio } from "../kernel/fixed.ts";
import { streamFor } from "../kernel/rng.ts";
import { type BudgetSpendAction, type EconomyConfig } from "./config.ts";
import { appendJournal, draftEntry, type Journal } from "./ledger.ts";
import {
  cyclePeriodMinutes,
  issueInvoice,
  nextUnlockAt,
  openRecognitionSchedule,
  openReserveSchedule,
  partitionPrunableInvoices,
  planRefund,
  type Invoice,
  type InvoiceTerms,
  type UnlockSchedule,
} from "./billing.ts";
import {
  advanceDunning,
  assertDunningLadder,
  type DunningStage,
} from "./dunning.ts";
import { bpsOf } from "./money.ts";
import { floorDiv } from "./intMath.ts";
import {
  commitmentBpsOf,
  drainOutage,
  initBudget,
  remainingSec,
  rollMonth,
  rollWeek,
  slaCreditOwedSec,
  spend,
  weekIndexOf,
  RiskyActionLockedError,
  type ErrorBudgetState,
} from "./errorBudget.ts";
import {
  addChurnSignal,
  churnRoll,
  defuseForecasts,
  effectiveMonthlyChurnBps,
  paymentFailureRoll,
  pruneForecasts,
} from "./churn.ts";
import {
  openContractEconomy,
  queueMfnReprice,
  renewalPulseOpenMin,
  resolveRenewalCliff,
  revenueBar,
  setPhase,
  dueMfnReprices,
  markMfnFired,
  type ContractEconomy,
  type MfnRepriceEvent,
  type RenewalDecision,
} from "./contract.ts";
import {
  businessMinuteOf,
  defaultTermsFor,
  monthIndexOf,
  NEUTRAL_REVENUE_TAGS,
  sortedEntityIds,
  type EconomyState,
} from "./state.ts";
import {
  buildCovenantReadoutsBps,
  covenantBreaches,
  errorBudgetHealthBps,
  meetsLoseSlowlyGuard,
  observeRunway,
  type Covenant,
  type CovenantBreachRecord,
  type DeathSpiralState,
} from "./runway.ts";
import {
  applyReputationSignals,
  reputationObservedWrite,
  type ReputationLedger,
  type ReputationSignal,
  type ReputationSignalKind,
} from "./reputation.ts";

/* ────────────────────────────── in / out ──────────────────────────────── */

export interface SpendRequest {
  readonly contractId: EntityId;
  readonly action: BudgetSpendAction;
  /** Override the config flat cost (computed SLA-hit charges); null = table. */
  readonly seconds: bigint | null;
}

export interface MfnTrigger {
  readonly contractId: EntityId;
  readonly discountBps: bigint;
}

export interface RenewalDecisionInput {
  readonly contractId: EntityId;
  readonly decision: RenewalDecision;
}

/** One take-or-pay vendor promise (§6.12/§6.13 committedOut). The host
 *  re-declares the whole book per tick (input replaces, like cfg); the
 *  bucket tracks Σ monthly × whole months left, so it burns down by itself
 *  as terms elapse. */
export interface VendorCommitment {
  readonly id: string;
  readonly monthlyMicroUsd: MoneyUnit;
  readonly termEndMin: SimMinute;
}

export interface EconomyTickIn {
  readonly context: TickContext;
  readonly runSeed: RunSeed;
  readonly contracts: ReadonlyMap<EntityId, Contract>;
  readonly prior: EconomyState;
  readonly cfg: EconomyConfig;
  /** Ops-side outage seconds per contract since the previous tick. */
  readonly outageSecs?: ReadonlyMap<EntityId, bigint> | undefined;
  /** Deliberate mitigation/risk spends queued by rules/player cards. */
  readonly spends?: readonly SpendRequest[] | undefined;
  /** Cliff decisions delivered by the rules layer for THIS tick. */
  readonly renewalDecisions?: readonly RenewalDecisionInput[] | undefined;
  /** New MFN triggers to queue (they fire later per the lag table, §7.15). */
  readonly mfnTriggers?: readonly MfnTrigger[] | undefined;
  /** Unanswered-escalation signals lighting ghosted fuses (§7.15). */
  readonly churnSignals?: readonly EntityId[] | undefined;
  /** Save-the-account interventions: defuse that contract's fuses. */
  readonly churnInterventions?: readonly EntityId[] | undefined;
  /** Per-contract invoice terms; absent → defaultTermsFor(cycle). */
  readonly invoiceTerms?: ReadonlyMap<EntityId, InvoiceTerms> | undefined;
  /** Finance module signals: the credit line was drawn this month (§6.13). */
  readonly creditLineDrawn?: boolean | undefined;
  /** Dunning Engine buildable owned → recovery bonus applies (§6.4). */
  readonly dunningEngineOwned?: boolean | undefined;
  /** Contracts hit by a card chargeback THIS tick (§6.13): posts the fee
   *  from free at step 8.5 and docks reputation at 12.5 (audit g18 TP6
   *  consumes the once-dead `chargebackFeeMicroUsd` knob). */
  readonly chargebacks?: readonly EntityId[] | undefined;
  /** Host-reported major incidents the economy cannot see on its own
   *  (§2.10 outages outside SLA credits): reputation damage only, no money. */
  readonly majorIncidents?: readonly CauseId[] | undefined;
  /** Published honest post-mortems (§5.10): earn score back and set the
   *  PERMANENT honestHostFloor that halves future incident damage. */
  readonly honestPostmortems?: readonly CauseId[] | undefined;
  /** The bank's card (audit g19 #2): when provided it REPLACES the primed
   *  covenant set (whole-book re-declaration, like vendorCommits); the
   *  month roll evaluates them. Empty array / undefined = nothing to check. */
  readonly covenants?: readonly Covenant[] | undefined;
  /** Take-or-pay promises behind `committedOut` (§6.12/§6.13, audit
   *  g15 #2): the whole book per tick; the bucket follows
   *  Σ monthly × whole months left. Undefined = no write, byte-identity. */
  readonly vendorCommits?: readonly VendorCommitment[] | undefined;
  /**
   * LONG-SAVE retention (perf audit #3), OPT-IN default OFF:
   * settled-and-fully-resolved invoices (paid/written-off with no live
   * `:reserve`/`:recognition` schedule left) are dropped from
   * `state.invoices` at the END of the tick. The LEDGER JOURNAL is never
   * touched here — it remains the full money-truth audit trail, every
   * settle cause-stamped.
   *
   * Why opt-in: EconomyState is NOT absorbed by pipeline/digest.ts (digest
   * sees cash + ledgerSeq only, neither of which pruning moves), but the
   * g5 gate's digestQuarter serializes `state.invoices` and its P10
   * narration counts them — enabling pruning changes THAT digest until the
   * save format is ratified (owner question, see lane report). Hosts that
   * want the memory/latency win flip the flag; byte-identity of every
   * existing digest (g5 included) is pinned by the default staying false.
   */
  readonly pruneSettledInvoices?: boolean | undefined;
}

export type EconomyNoticeKind =
  | "contract-unprimed"
  | "invoice-issued"
  | "invoice-paid"
  | "invoice-failed"
  | "dunning-recovered"
  | "suspension-lifted"
  | "dunning-stage"
  | "suspended"
  | "written-off"
  | "prepaid-refunded"
  | "churned-voluntary"
  | "renewal-pulse"
  | "cliff-renewed"
  | "cliff-lapsed"
  | "mfn-queued"
  | "mfn-repriced"
  | "budget-locked"
  | "budget-carry"
  | "clean-week-refund"
  | "sla-credit-due"
  | "spiral-flagged"
  | "lose-slowly-violated"
  /** A signed-not-started (pending) deal reached its service start minute. */
  | "contract-activated"
  /** Bank-review covenant newly breached at this month roll (OD-25: data
   *  only — posture semantics remain owner-open). */
  | "covenant-breached"
  /** Chargeback fee posted from free (§6.13). */
  | "chargeback-posted";

/** Economy-side observations for HUD/rules (not SimEvents: types.ts owns
 *  that closed union; the orchestrator maps the ones it wants across). */
export interface EconomyNotice {
  readonly kind: EconomyNoticeKind;
  readonly contractId: EntityId;
  readonly atBusinessMin: SimMinute;
  readonly causeId: CauseId;
  readonly invoiceId?: EntityId;
  readonly stage?: DunningStage;
  readonly amount?: MoneyUnit;
  readonly seconds?: bigint;
}

export interface EconomyTickOut {
  readonly state: EconomyState;
  /** Entries appended THIS tick, in seq order (caller mirrors cash/seq
   *  into GameState for the notary export). */
  readonly entries: readonly LedgerEntry[];
  readonly events: readonly InvoiceSettledEvent[];
  readonly notices: readonly EconomyNotice[];
  /** Step-12 observed-layer writes the host feeds to
   *  ObservedStore.applyObservedWrites alongside the driver's own batch
   *  (audit g17 #2: `company::reputation` producer). Publish-on-change:
   *  EMPTY on every tick where the score did not move, so a host that wires
   *  it pays zero digest cost in the steady state. */
  readonly observedWrites: readonly ObservedWrite[];
}

/* ─────────────────────────── tick-local store ─────────────────────────── */

interface Working {
  cash: MoneyBuckets;
  /** Batch journal lane (perf lane): rows are validated through ledger's
   *  shared `draftEntry` core and buffered; the incoming journal value is
   *  appended ONCE at assembly via `appendJournal`. Byte-identical to the
   *  old post-per-call rebuild (same rows, same seqs, same cash folds) at
   *  ~1/4 the cost — the profile put per-post accessor materialization at
   *  ~40ms of the 2k/12-month catch-up tick. */
  journalBase: Journal;
  journalSeq: number;
  journalRows: LedgerEntry[];
  econ: Map<EntityId, ContractEconomy>;
  /** Live invoice list — ARRAY ORDER is content (digest- and save-visible),
   *  maintained in issue order; replaceInvoice writes in place, never moves. */
  invoices: Invoice[];
  /** Tick-local id→positions index over `invoices`, rebuilt from the array at
   *  the boundary parse (start of each tick) and kept in step with every push
   *  in this pass. The array stays the single source of truth — the map is
   *  pure derived state, so it can never disagree with order-by-design.
   *
   *  POSITIONAL, not id-keyed, because ids COLLIDE: `inv:<contract>:<cycle>`
   *  (billing.ts issueInvoice) re-mints after a renewal cliff resets the cycle
   *  counter, so a twin pair legitimately co-exists in the retained array.
   *  Read lookups AND replaceInvoice bind FIRST-in-array — byte-identical to
   *  the old `find()` / `findIndex()` semantics, twins included. That makes a
   *  post-renewal twin invisible to step 7 (its visits re-observe the settled
   *  first twin) and lets a dunning write clobber the stale slot: a REAL
   *  latent bug this index reproduces faithfully rather than silently
   *  fixing. Reported to the orchestrator as a follow-up semantics decision;
   *  a perf lane must not smuggle behavior changes (discipline: FSM,
   *  calendar ordering, money math UNCHANGED). */
  invoiceAt: Map<EntityId, number[]>;
  schedules: UnlockSchedule[];
  mfnQueue: MfnRepriceEvent[];
  forecasts: EconomyState["forecasts"];
  budgets: Map<EntityId, ErrorBudgetState>;
  spiral: DeathSpiralState;
  monthIndex: number;
  freeAtMonthStart: MoneyUnit;
  lastClosedBurn: MoneyUnit | null;
  creditDrawnThisMonth: boolean;
  loseSlowlyViolated: boolean;
  warnedAtBusinessMin: SimMinute | null;
  reputation: ReputationLedger;
  covenants: readonly Covenant[];
  breachedCovenantIds: readonly string[];
  covenantBreachLog: CovenantBreachRecord[];
  committedOutTarget: MoneyUnit;
  observedWrites: ObservedWrite[];
  entries: LedgerEntry[];
  events: InvoiceSettledEvent[];
  notices: EconomyNotice[];
}

type Post = (
  causeId: CauseId,
  colour: RevenueQualityBand,
  delta: Readonly<Partial<Record<keyof MoneyBuckets, MoneyUnit>>>,
  tag: string,
) => void;

/* ─────────────────────────────── the tick ─────────────────────────────── */

export function runEconomyTick(input: EconomyTickIn): EconomyTickOut {
  const { cfg, runSeed, context, contracts } = input;
  // Config-load gate (E-18): an out-of-order ladder is illegal state — halt
  // before any draw, notice, or posting can encode the bad dial.
  assertDunningLadder(cfg);
  const now = businessMinuteOf(context.clocks);
  guardTickClock(input.prior, now);

  /* Boundary parse: copy the invoice array once and index it in the same
     pass. Ids may legitimately REPEAT (renewal re-mints `inv:<id>:<cycle>`
     after the cycle counter resets) — the position lists record every slot,
     first occurrence leading, so first-twin binding below mirrors the old
     find()/findIndex() exactly. */
  const invoices: Invoice[] = [];
  const invoiceAt = new Map<EntityId, number[]>();
  for (const invoice of input.prior.invoices) {
    const seen = invoiceAt.get(invoice.id);
    if (seen === undefined) invoiceAt.set(invoice.id, [invoices.length]);
    else seen.push(invoices.length);
    invoices.push(invoice);
  }

  const w: Working = {
    cash: input.prior.cash,
    journalBase: input.prior.journal,
    journalSeq: input.prior.journal.nextSeq,
    journalRows: [],
    econ: new Map(input.prior.contractEconomy),
    invoices,
    invoiceAt,
    schedules: [...input.prior.unlockSchedules],
    mfnQueue: [...input.prior.mfnQueue],
    forecasts: [...input.prior.forecasts],
    budgets: new Map(input.prior.errorBudgets),
    spiral: input.prior.spiral,
    monthIndex: input.prior.monthIndex,
    freeAtMonthStart: input.prior.freeAtMonthStart,
    lastClosedBurn: input.prior.lastClosedBurn,
    creditDrawnThisMonth: input.prior.creditDrawnThisMonth || (input.creditLineDrawn ?? false),
    loseSlowlyViolated: input.prior.loseSlowlyViolated,
    warnedAtBusinessMin: input.prior.warnedAtBusinessMin,
    reputation: input.prior.reputation,
    covenants: input.covenants ?? input.prior.covenants,
    breachedCovenantIds: input.prior.breachedCovenantIds,
    covenantBreachLog: [...input.prior.covenantBreachLog],
    committedOutTarget: input.prior.committedOutTarget,
    observedWrites: [],
    entries: [],
    events: [],
    notices: [],
  };

  /** THE single money write path — causeId mandatory (P10). */
  const post: Post = (causeId, colour, delta, tag) => {
    const posted = draftEntry(w.cash, { causeId, atBusinessMin: now, moneyColour: colour, delta, context: tag }, w.journalSeq);
    w.journalRows.push(posted.entry);
    w.journalSeq = posted.entry.seq + 1;
    w.cash = posted.cash;
    w.entries.push(posted.entry);
  };

  const ids = sortedEntityIds(contracts.keys());

  /* 0.5 committedOut re-declaration (§6.12/§6.13; audit g15 #2 writer): the
   * bucket equals Σ monthly × whole months left over the vendor book. The
   * input REPLACES the book (like cfg), so recomputing a target and posting
   * the delta is the only honest fold — no event stream to replay, no
   * double-count. Undefined input → zero writes → byte-identity for every
   * existing host. */
  if (input.vendorCommits !== undefined) {
    let target = 0n;
    for (const commit of input.vendorCommits) target += commitTargetMicroUsd(commit, now, cfg);
    const delta = asMoney(target - w.committedOutTarget);
    if (delta !== 0n) {
      post(asCauseId(`economy:committed-out:${now}`), "blue", { committedOut: delta }, "vendor commitments");
      w.committedOutTarget = asMoney(target);
    }
  }

  /* 1 auto-prime guard: un-registered contracts get neutral records so an
   * orchestrator forgetfulness degrades LOUDLY (notice) but deterministically. */
  for (const id of ids) {
    if (w.econ.has(id)) continue;
    const contract = contracts.get(id)!;
    w.econ.set(id, openContractEconomy(
      {
        contract,
        atBusinessMin: now,
        clauseRefs: contract.sla.autoRenew ? ["auto-renew"] : [],
        grandfather: null,
        revenueTags: NEUTRAL_REVENUE_TAGS,
      },
      cfg,
    ));
    w.budgets.set(
      id,
      initBudget(contract.id, commitmentBpsOf(contract.sla.uptimeTarget), monthIndexOf(now, cfg), now, cfg),
    );
    w.notices.push({ kind: "contract-unprimed", contractId: id, atBusinessMin: now, causeId: asCauseId(`economy:prime:${id}`) });
  }

  /* 1.5 MRR backlog lifecycle (§6.13 "the gap between TCV and Billing MRR";
   * audit g15 #2 writer). Order per contract, sorted ids:
   *   a) a pending deal's promise is credited into `backlog` EXACTLY ONCE
   *      (stamp `backlogPostedAtMin`), then
   *   b) at its service-start minute the deal activates (pending→active,
   *      legal PHASE_EDGES) and the invoice calendar takes over below.
   * Activation precedes pulses/cliffs (steps 4-5) so a start-day activation
   * can legitimately cliff on the same tick it started its term. */
  for (const id of ids) {
    let econ = w.econ.get(id)!;
    if (econ.phase !== "pending") continue;
    if (econ.backlogPostedAtMin === null && econ.backlogRemaining > 0n) {
      post(
        asCauseId(`economy:backlog-sign:${id}`),
        econColour(econ),
        { backlog: econ.backlogRemaining },
        `backlog ${id}`,
      );
      econ = { ...econ, backlogPostedAtMin: now };
      w.econ.set(id, econ);
    }
    const contract = contracts.get(id)!;
    if (now < contract.termStartMin) continue;
    w.econ.set(id, setPhase(econ, "active", now));
    w.notices.push({
      kind: "contract-activated",
      contractId: id,
      atBusinessMin: now,
      causeId: asCauseId(`economy:activate:${id}`),
    });
  }

  /* 2 month rolls (catch-up loop for paused clocks). */
  const targetMonth = monthIndexOf(now, cfg);
  while (w.monthIndex < targetMonth) {
    rollBusinessMonth(w, ids, contracts, now, cfg, runSeed, post);
  }

  /* 3 MFN queue: enqueue fresh triggers (lagged now, fired later) + fire due. */
  for (const trigger of input.mfnTriggers ?? []) {
    w.mfnQueue.push(
      queueMfnReprice(trigger.contractId, trigger.discountBps, now, cfg, asCauseId(`economy:mfn-queue:${trigger.contractId}:${now}`)),
    );
    w.notices.push({
      kind: "mfn-queued",
      contractId: trigger.contractId,
      atBusinessMin: now,
      causeId: asCauseId(`economy:mfn-queue:${trigger.contractId}:${now}`),
    });
  }
  for (const due of dueMfnReprices(w.mfnQueue, now)) {
    w.mfnQueue = [...markMfnFired(w.mfnQueue, due.contractId)];
    w.notices.push({
      kind: "mfn-repriced",
      contractId: due.contractId,
      atBusinessMin: now,
      causeId: due.causeId,
    });
  }

  /* 4 renewal pulses + 5 cliffs — before the calendar so a renew restarts
     the grid the same tick and a lapse never writes a zombie invoice. */
  for (const id of ids) {
    const econ = w.econ.get(id)!;
    if (econ.phase === "terminated") continue;
    if (!econ.renewalPulseOpened && now >= renewalPulseOpenMin(econ.termEndMin, cfg)) {
      w.econ.set(id, { ...econ, renewalPulseOpened: true });
      w.notices.push({ kind: "renewal-pulse", contractId: id, atBusinessMin: now, causeId: asCauseId(`economy:pulse:${id}:${econ.termEndMin}`) });
    }
  }
  for (const id of ids) {
    let econ = w.econ.get(id)!;
    if (econ.phase !== "active" || econ.cliffFired || now < econ.termEndMin) continue;
    const contract = contracts.get(id)!;
    const supplied = input.renewalDecisions?.find((d) => d.contractId === id);
    const decision = supplied?.decision ?? defaultCliffDecision(contract, econ, runSeed, cfg);
    const outcome = resolveRenewalCliff(econ, decision, now, cfg);
    econ = outcome.econ;
    if (outcome.kind === "escalate-and-renew") {
      // Price change lands on the SHARED contract — orchestrator re-binds it
      // from the notice data; economy continues billing from cycleAnchor.
      w.notices.push({
        kind: "cliff-renewed",
        contractId: id,
        atBusinessMin: now,
        causeId: decision.causeId,
        amount: outcome.newMrc,
      });
    } else {
      w.notices.push({
        kind: outcome.kind === "lapsed" ? "cliff-lapsed" : "cliff-renewed",
        contractId: id,
        atBusinessMin: now,
        causeId: decision.causeId,
      });
    }
    w.econ.set(id, econ);
    if (outcome.kind === "lapsed") {
      settleCancellationRefunds(w, id, now, post);
      unwindBacklog(w, id, now, post);
    }
  }

  /* 6 invoice calendar. */
  generateDueInvoices(w, ids, contracts, input, now, cfg, post);

  /* 7 payment attempts + 8 dunning ladder.
   *
   * PERF (audit fix #2, O(invoices²)/tick): the old loop spread a snapshot
   * copy AND ran a per-invoice `find()` over the live array — quadratic in
   * retained history. Nothing is appended to `w.invoices` inside this loop
   * (issue is step 6; every step-7/8 write goes through replaceInvoice,
   * which preserves position), so scanning the live array by index and
   * resolving each visit through the first-twin position reproduces the old
   * snapshot+find() pass EXACTLY — same mid-loop replacements visible, same
   * order, same twin shadowing — at O(invoices) instead of O(invoices²). */
  const engineBonus = input.dunningEngineOwned ? cfg.dunning.dunningEngineBonusBps : 0n;
  const sweep = w.invoices.length;
  for (let slot = 0; slot < sweep; slot += 1) {
    const visiting = w.invoices[slot]!;
    const first = w.invoiceAt.get(visiting.id)![0]!;
    const current = w.invoices[first]!;
    // A terminated contract never pays again: settling post-cancellation would
    // re-open the deferred schedule that settleCancellationRefunds just closed
    // (zombie prepay). Billing already skips dead contracts at step 6.
    const payer = w.econ.get(current.contractId);
    if (payer !== undefined && payer.phase === "terminated") continue;
    if (current.state === "issued" && current.dueAtMin <= now) {
      const declined = paymentFailureRoll(current.dueAtMin, current.contractId, runSeed, cfg);
      if (!declined) {
        settleInvoice(w, current, now, context, cfg, post);
        continue;
      }
      replaceInvoice(w, { ...current, state: "failed", dunningStage: "failed", dunningStageAtMin: now });
      w.notices.push({
        kind: "invoice-failed",
        contractId: current.contractId,
        atBusinessMin: now,
        causeId: asCauseId(`economy:decline:${current.id}`),
        invoiceId: current.id,
      });
      continue;
    }
    if (current.state !== "failed") continue;
    advanceDunningLadder(w, current, now, runSeed, cfg, engineBonus, context, post);
  }

  /* 9 error budgets: drains, spends w/ exhaustion locks, clean weeks. */
  applyBudgets(w, ids, input, now, cfg);

  /* 8.5 chargeback fees (§6.13; audit g18 TP6 — the fee knob finally has a
   * consumer). Sorted visit for the determinism contract; duplicates in the
   * host's list are real repeat disputes and each posts its own fee. The
   * throw on insolvent free cash is §6.13 law ("death happens on free") —
   * hosts that tolerate it use the review-F4 catch-and-keep-prior pattern. */
  for (const id of sortedEntityIds(input.chargebacks ?? [])) {
    if (!w.econ.has(id)) {
      throw new Error(`economy/tick: chargeback on un-primed contract '${id}'`);
    }
    const cause = asCauseId(`economy:chargeback:${id}:${now}`);
    post(cause, "red", { free: asMoney(-cfg.fees.chargebackFeeMicroUsd) }, `chargeback ${id}`);
    w.notices.push({
      kind: "chargeback-posted",
      contractId: id,
      atBusinessMin: now,
      causeId: cause,
      amount: cfg.fees.chargebackFeeMicroUsd,
    });
  }

  /* 10 ghosted churn forecasts. */
  for (const id of input.churnSignals ?? []) {
    w.forecasts = addChurnSignal(w.forecasts, id, now, runSeed, cfg);
  }
  for (const id of input.churnInterventions ?? []) {
    w.forecasts = defuseForecasts(w.forecasts, id);
  }
  w.forecasts = pruneForecasts(w.forecasts, now);

  /* 11 unlock schedules due (recognition / reserve release). */
  releaseDueSchedules(w, now, post);

  /* 12 lose-slowly guard. */
  evaluateLoseSlowly(w, now, cfg);

  /* 12.5 reputation fold (§2.10/§5.10; audit g17 #2 producer). Signals come
   * from THIS tick's notices (money-lifecycle events the economy already
   * saw) plus the two host-reported vocabularies. Nothing moves money; the
   * score is state + one publish-on-change observed write. With no signals
   * the ledger returns BY IDENTITY, the score cannot move, and
   * `observedWrites` stays empty — byte-identity for every existing host. */
  const repSignals: ReputationSignal[] = [];
  for (const n of w.notices) {
    const kind = noticeReputationKind(n.kind);
    if (kind !== null) repSignals.push({ kind, causeId: n.causeId, contractId: n.contractId });
  }
  for (const causeId of input.majorIncidents ?? []) {
    repSignals.push({ kind: "major-incident", causeId });
  }
  for (const causeId of input.honestPostmortems ?? []) {
    repSignals.push({ kind: "honest-postmortem", causeId });
  }
  w.reputation = applyReputationSignals(w.reputation, repSignals, cfg);
  if (w.reputation.overallBps !== input.prior.reputation.overallBps) {
    w.observedWrites.push(reputationObservedWrite(w.reputation, asCauseId(`economy:reputation:${now}`)));
  }

  /* 13 OPT-IN retention (perf audit #3, default off — see EconomyTickIn):
     settled history leaves the WORKING SET only; the journal keeps every
     money movement. Runs after every consumer of `invoices` (steps 6-8,
     AR math in the HUD reads the RESULTING state, and arAgingTrays ignores
     settled records entirely, so the sweep is invisible to AR numbers). */
  if (input.pruneSettledInvoices === true) {
    w.invoices = [...partitionPrunableInvoices(w.invoices, w.schedules).keep];
    // The id→slot index still points at PRE-prune positions — every later
    // read would be silently wrong. Nothing consumes it after step 13 in this
    // pass (the next tick re-parses the index at the boundary), so empty it:
    // a stray read now fails loud via replaceInvoice's "vanished mid-tick".
    w.invoiceAt.clear();
  }

  const state: EconomyState = {
    cash: w.cash,
    journal: appendJournal(w.journalBase, w.journalRows),
    contractEconomy: sortedMap(w.econ),
    invoices: w.invoices,
    unlockSchedules: w.schedules,
    mfnQueue: w.mfnQueue,
    forecasts: w.forecasts,
    errorBudgets: sortedMap(w.budgets),
    spiral: w.spiral,
    monthIndex: w.monthIndex,
    freeAtMonthStart: w.freeAtMonthStart,
    lastClosedBurn: w.lastClosedBurn,
    creditDrawnThisMonth: w.creditDrawnThisMonth,
    loseSlowlyViolated: w.loseSlowlyViolated,
    warnedAtBusinessMin: w.warnedAtBusinessMin,
    lastBusinessMin: now,
    reputation: w.reputation,
    covenants: w.covenants,
    breachedCovenantIds: w.breachedCovenantIds,
    covenantBreachLog: w.covenantBreachLog,
    committedOutTarget: w.committedOutTarget,
  };
  return {
    state,
    entries: w.entries,
    events: w.events,
    notices: w.notices,
    observedWrites: w.observedWrites,
  };
}

/* ────────────────────────────── guards ────────────────────────────────── */

function guardTickClock(prior: EconomyState, now: SimMinute): void {
  if (!Number.isSafeInteger(now) || now < 0) {
    throw new RangeError(`economy/tick: business minute ${now} must be a non-negative safe integer`);
  }
  if (prior.lastBusinessMin !== null && now < prior.lastBusinessMin) {
    throw new Error(
      `economy/tick: business clock went backwards (${prior.lastBusinessMin} → ${now}) — replay corruption`,
    );
  }
}

/* ─────────────────────────── calendar & settlement ────────────────────── */

function generateDueInvoices(
  w: Working,
  ids: readonly EntityId[],
  contracts: ReadonlyMap<EntityId, Contract>,
  input: EconomyTickIn,
  now: SimMinute,
  cfg: EconomyConfig,
  post: Post,
): void {
  for (const id of ids) {
    const contract = contracts.get(id)!;
    const econ = w.econ.get(id)!;
    if (econ.phase === "terminated") continue;
    const due = cyclesDueFor(econ, contract, now, cfg);
    const cap = Math.min(due, cfg.billing.maxCatchUpInvoicesPerTick);
    if (cap === 0) continue;
    const terms = input.invoiceTerms?.get(id) ?? defaultTermsFor(contract, cfg);
    const discount = firedMfnDiscountBps(w.mfnQueue, id);
    let invoicedCycles = econ.invoicedCycles;
    let backlogRemaining = econ.backlogRemaining;
    for (let n = 0; n < cap; n += 1) {
      const invoice = issueInvoice(contract, { ...econ, invoicedCycles }, invoicedCycles, now, terms, discount, cfg);
      /* §6.13 recognition: backlog money does NOT re-appear at issue — the
       * same entry MOVES it (backlog −drain ⇒ accountsReceivable +gross), so
       * a signed deal's promise is never counted twice inside netPosition.
       * drain = 0n for the ordinary signed-and-starting contract keeps the
       * single-bucket delta exactly as it was (byte-identity for g5 and the
       * unattended witnesses). */
      const drain = backlogRemaining < invoice.gross ? backlogRemaining : invoice.gross;
      backlogRemaining = asMoney(backlogRemaining - drain);
      post(
        asCauseId(`economy:invoice:${id}:${invoicedCycles}`),
        econColour(econ),
        drain > 0n
          ? { accountsReceivable: invoice.gross, backlog: asMoney(-drain) }
          : { accountsReceivable: invoice.gross },
        `invoice ${invoice.id}`,
      );
      const seen = w.invoiceAt.get(invoice.id);
      if (seen === undefined) w.invoiceAt.set(invoice.id, [w.invoices.length]);
      else seen.push(w.invoices.length);
      w.invoices.push(invoice);
      w.notices.push({
        kind: "invoice-issued",
        contractId: id,
        atBusinessMin: now,
        causeId: asCauseId(`economy:invoice:${id}:${invoicedCycles}`),
        invoiceId: invoice.id,
        amount: invoice.gross,
      });
      invoicedCycles += 1;
    }
    w.econ.set(id, { ...econ, invoicedCycles, backlogRemaining });
  }
}

/** Prepaid calendar (§6.4 "billing 1st"): the invoice for the cycle STARTING
 *  now is issued at the cycle boundary, not after service. */
function cyclesDueFor(econ: ContractEconomy, contract: Contract, now: SimMinute, cfg: EconomyConfig): number {
  const period = cyclePeriodMinutes(contract, cfg);
  if (now < econ.cycleAnchorMin) return 0;
  // bigint floor (E-12 class): the cycle grid must not float-round an
  // invoice due a full period early.
  const cyclesStarted = floorDiv(now - econ.cycleAnchorMin, period) + 1;
  return Math.max(0, cyclesStarted - econ.invoicedCycles);
}

function econColour(econ: ContractEconomy): RevenueQualityBand {
  return revenueBar(econ.revenueTags);
}

/** MFN entitles the customer to the BEST discount ever written into their
 *  book (§7.15): take the MAX across all fired reprices. Order-independent,
 *  so a same-tick double fire can't flip the price by queue luck (E-17). */
function firedMfnDiscountBps(queue: readonly MfnRepriceEvent[], id: EntityId): bigint {
  let discount = 0n;
  for (const e of queue) {
    if (e.contractId === id && e.fired && e.discountBps > discount) discount = e.discountBps;
  }
  return discount;
}

/** AR −gross; net lands free (card deals) or deferred (+1/12 recognition
 *  schedule) for prepay; card-processed receipts park the rolling reserve
 *  free→restricted behind a release schedule (§6.13). The processing fee is
 *  the gross−net spread — never a second posting, so it can't drift. */
function settleInvoice(w: Working, invoice: Invoice, now: SimMinute, context: TickContext, cfg: EconomyConfig, post: Post): void {
  const econ = w.econ.get(invoice.contractId);
  const colour = econ ? econColour(econ) : "blue";
  const cause = asCauseId(`economy:settle:${invoice.id}`);
  const landsFree = !invoice.terms.annualPrepay;
  post(
    cause,
    colour,
    landsFree ? { accountsReceivable: asMoney(-invoice.gross), free: invoice.net } : { accountsReceivable: asMoney(-invoice.gross), deferred: invoice.net },
    `settle ${invoice.id}`,
  );

  if (invoice.terms.netTermsDays === 0) {
    // Half-away-from-zero bps rounding (E-10), the same money.ts discipline
    // as every other rate application — truncating `/` under-parked odd µ$.
    const park = bpsOf(invoice.net, cfg.fees.rollingReserveBps, `reserve '${invoice.id}'`);
    if (park > 0n) {
      post(asCauseId(`economy:reserve:${invoice.id}`), "blue", { free: asMoney(-park), restricted: park }, `reserve ${invoice.id}`);
      w.schedules.push(openReserveSchedule(asEntityId(`${invoice.id}:reserve`), invoice.contractId, park, now, cfg));
    }
  }
  if (!landsFree) {
    w.schedules.push(
      openRecognitionSchedule(asEntityId(`${invoice.id}:recognition`), invoice.contractId, invoice.net, now, cfg),
    );
  }

  replaceInvoice(w, { ...invoice, state: "paid", settledAtMin: now });
  w.events.push({
    kind: "invoice-settled",
    atUs: context.clocks.businessUs,
    tick: context.tick,
    causeId: cause,
    contractId: invoice.contractId,
    amount: invoice.net,
    bucket: landsFree ? "free" : "deferred",
  });
  w.notices.push({
    kind: "invoice-paid",
    contractId: invoice.contractId,
    atBusinessMin: now,
    causeId: cause,
    invoiceId: invoice.id,
    amount: invoice.net,
  });
}

/** Position-preserving write via the tick-local index — O(1), not the old
 *  O(n) `findIndex`. First-twin binding kept byte-faithful (see Working):
 *  a duplicate id always writes its earliest slot, as `findIndex` did. */
function replaceInvoice(w: Working, invoice: Invoice): void {
  const at = w.invoiceAt.get(invoice.id)?.[0];
  if (at === undefined) throw new Error(`economy/tick: invoice '${invoice.id}' vanished mid-tick`);
  w.invoices[at] = invoice;
}

/* ──────────────────────────── dunning ladder ──────────────────────────── */

/** A long pause can cross several stage boundaries in one tick; each entry
 *  gets exactly one seeded recovery roll (advanceDunning pins the stream to
 *  stage+due-minute), so the walk is deterministic and bounded. */
function advanceDunningLadder(
  w: Working,
  invoice: Invoice,
  now: SimMinute,
  runSeed: RunSeed,
  cfg: EconomyConfig,
  engineBonus: bigint,
  context: TickContext,
  post: Post,
): void {
  let current = invoice;
  for (let hop = 0; hop < 6; hop += 1) {
    const adv = advanceDunning(current, now, runSeed, cfg, engineBonus);
    if (adv.kind === "held") return;
    const cause = asCauseId(`economy:dunning:${current.id}:${adv.stageNow}:${context.tick}`);
    if (adv.kind === "recovered") {
      const recovered: Invoice = { ...current, dunningStage: adv.stageNow, dunningStageAtMin: now };
      replaceInvoice(w, recovered);
      settleInvoice(w, recovered, now, context, cfg, post);
      w.notices.push({
        kind: "dunning-recovered",
        contractId: current.contractId,
        atBusinessMin: now,
        causeId: cause,
        invoiceId: current.id,
        stage: adv.stageNow,
      });
      // Payment recovered AFTER suspension must restore service (E-2): the
      // suspended→active edge is legal (§6.4 "recover to keep the customer")
      // and without it a post-suspension recovery strands the contract dark
      // forever, at the default 200 bps live post-suspension path.
      const econ = w.econ.get(current.contractId)!;
      if (econ.phase === "suspended") {
        w.econ.set(current.contractId, setPhase(econ, "active", now));
        w.notices.push({
          kind: "suspension-lifted",
          contractId: current.contractId,
          atBusinessMin: now,
          causeId: asCauseId(`economy:suspension-lifted:${current.id}`),
        });
      }
      return;
    }
    if (adv.kind === "terminated") {
      post(cause, econColour(w.econ.get(current.contractId)!), { accountsReceivable: asMoney(-current.gross) }, `write-off ${current.id}`);
      replaceInvoice(w, { ...current, state: "written-off", dunningStage: "terminate", dunningStageAtMin: now });
      const econ = w.econ.get(current.contractId)!;
      if (econ.phase !== "terminated") w.econ.set(current.contractId, setPhase(econ, "terminated", now));
      settleCancellationRefunds(w, current.contractId, now, post);
      unwindBacklog(w, current.contractId, now, post);
      w.notices.push({
        kind: "written-off",
        contractId: current.contractId,
        atBusinessMin: now,
        causeId: cause,
        invoiceId: current.id,
        amount: current.gross,
      });
      return;
    }
    const stepped: Invoice = { ...current, dunningStage: adv.stageNow, dunningStageAtMin: now };
    replaceInvoice(w, stepped);
    current = stepped;
    if (adv.kind === "suspended") {
      const econ = w.econ.get(current.contractId)!;
      if (econ.phase === "active") w.econ.set(current.contractId, setPhase(econ, "suspended", now));
      w.notices.push({ kind: "suspended", contractId: current.contractId, atBusinessMin: now, causeId: cause, invoiceId: current.id });
      return;
    }
    w.notices.push({
      kind: "dunning-stage",
      contractId: current.contractId,
      atBusinessMin: now,
      causeId: cause,
      invoiceId: current.id,
      stage: adv.stageNow,
    });
  }
}

/* ──────────────────────────── month roll internals ────────────────────── */

function rollBusinessMonth(
  w: Working,
  ids: readonly EntityId[],
  contracts: ReadonlyMap<EntityId, Contract>,
  now: SimMinute,
  cfg: EconomyConfig,
  runSeed: RunSeed,
  post: Post,
): void {
  w.monthIndex += 1;
  const newMonth = w.monthIndex;

  /* Burn close + runway/spiral observation (§6.4/§6.13). */
  const burn = asMoney(w.freeAtMonthStart - w.cash.free);
  w.lastClosedBurn = burn > 0n ? burn : asMoney(0n);
  w.freeAtMonthStart = w.cash.free;
  const wasFlagged = w.spiral.spiralFlagged;
  w.spiral = observeRunway(w.spiral, {
    freeCash: w.cash.free,
    netBurnPerMonth: w.lastClosedBurn ?? asMoney(0n),
    creditDrawnThisMonth: w.creditDrawnThisMonth,
  }, cfg);
  w.creditDrawnThisMonth = false;
  if (w.spiral.spiralFlagged && !wasFlagged) {
    w.notices.push({ kind: "spiral-flagged", contractId: asEntityId("company"), atBusinessMin: now, causeId: asCauseId(`economy:spiral:m${newMonth}`) });
  }

  /* Voluntary churn cohort roll for the ENTERED month (§6.16:25610). */
  for (const id of ids) {
    const econ = w.econ.get(id);
    if (econ === undefined || econ.phase !== "active") continue;
    const contract = contracts.get(id);
    if (contract === undefined) continue;
    const bps = effectiveMonthlyChurnBps(contract.bundleId, id, w.forecasts, now, cfg);
    if (churnRoll(id, bps, newMonth, runSeed) === "churned") {
      w.econ.set(id, setPhase(econ, "terminated", now));
      settleCancellationRefunds(w, id, now, post);
      unwindBacklog(w, id, now, post);
      w.notices.push({
        kind: "churned-voluntary",
        contractId: id,
        atBusinessMin: now,
        causeId: asCauseId(`economy:churn:${id}:m${newMonth}`),
      });
    }
  }

  /* Covenant bank review (audit g19 #2 — the orphan evaluator finally gets
   * a consumer). Cadence: once per business month, AFTER the spiral
   * observation and BEFORE the budget re-grant, so the health readout still
   * sees the month just closed (rollMonth zeroes drained/spent).
   * EDGE-TRIGGERED: a covenant already breached at the previous roll
   * does not re-notice; recovery clears the latch so a relapse fires again.
   * OD-25 (insolvency posture) is OWNER-OPEN — a breach here is RECORD +
   * NOTICE ONLY; nothing terminates, nothing games-over. */
  if (w.covenants.length > 0) {
    const health: bigint[] = [];
    for (const id of ids) {
      const budget = w.budgets.get(id);
      if (budget === undefined) continue;
      health.push(errorBudgetHealthBps(remainingSec(budget), budget.budgetSec));
    }
    const readouts = buildCovenantReadoutsBps(w.spiral.runwayMonths, health);
    const latched = new Set(w.breachedCovenantIds);
    const breachedNow = covenantBreaches(w.covenants, readouts);
    for (const covenantId of breachedNow) {
      if (latched.has(covenantId)) continue;
      const causeId = asCauseId(`economy:covenant:${covenantId}:m${newMonth}`);
      w.covenantBreachLog.push({ covenantId, atBusinessMin: now, monthIndex: newMonth, causeId });
      w.notices.push({
        kind: "covenant-breached",
        contractId: asEntityId("company"),
        atBusinessMin: now,
        causeId,
      });
    }
    w.breachedCovenantIds = [...new Set(breachedNow)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  /* Error-budget month rolls: surplus carry + re-grant (§6.1/§6.14). */
  for (const id of ids) {
    const budget = w.budgets.get(id);
    if (budget === undefined) continue;
    const rolled = rollMonth(budget, newMonth, now, cfg);
    w.budgets.set(id, rolled.state);
    if (rolled.carryOutSec > 0n) {
      w.notices.push({
        kind: "budget-carry",
        contractId: id,
        atBusinessMin: now,
        causeId: asCauseId(`economy:budget-carry:${id}:m${newMonth}`),
        seconds: rolled.carryOutSec,
      });
    }
  }

}

/* ──────────────────────────── budget internals ────────────────────────── */

function applyBudgets(
  w: Working,
  ids: readonly EntityId[],
  input: EconomyTickIn,
  now: SimMinute,
  cfg: EconomyConfig,
): void {
  const week = weekIndexOf(now, cfg);
  for (const id of ids) {
    let budget = w.budgets.get(id);
    if (budget === undefined) continue;
    const outage = input.outageSecs?.get(id) ?? 0n;
    if (outage > 0n) budget = drainOutage(budget, outage, asCauseId(`economy:sla-hit:${id}:${now}`));
    const rolledWeek = rollWeek(budget, week, cfg);
    budget = rolledWeek.state;
    for (const refund of rolledWeek.refunds) {
      w.notices.push({
        kind: "clean-week-refund",
        contractId: id,
        atBusinessMin: now,
        causeId: refund.causeId,
        seconds: refund.seconds,
      });
    }
    w.budgets.set(id, budget);
  }
  for (const request of input.spends ?? []) {
    const budget = w.budgets.get(request.contractId);
    if (budget === undefined) {
      throw new Error(`economy/tick: spend on un-primed contract '${request.contractId}'`);
    }
    try {
      const after = spend(budget, request.action, request.seconds, cfg, asCauseId(`economy:budget:${request.contractId}:${request.action}:${now}`));
      w.budgets.set(request.contractId, after);
      const owed = slaCreditOwedSec(after);
      if (owed > 0n) {
        w.notices.push({
          kind: "sla-credit-due",
          contractId: request.contractId,
          atBusinessMin: now,
          causeId: asCauseId(`economy:sla-credit:${request.contractId}:${now}`),
          seconds: owed,
        });
      }
    } catch (err) {
      if (err instanceof RiskyActionLockedError) {
        // The lock IS the modeled behavior (§6.1): surface, don't crash the tick.
        w.notices.push({
          kind: "budget-locked",
          contractId: request.contractId,
          atBusinessMin: now,
          causeId: asCauseId(`economy:budget-lock:${request.contractId}:${request.action}:${now}`),
        });
        // The budget was already negative when the lock fired — the SLA
        // credit readout (overrun ⇒ pay credits, §6.1) is due regardless.
        const stillOwed = slaCreditOwedSec(budget);
        if (stillOwed > 0n) {
          w.notices.push({
            kind: "sla-credit-due",
            contractId: request.contractId,
            atBusinessMin: now,
            causeId: asCauseId(`economy:sla-credit:${request.contractId}:${now}`),
            seconds: stillOwed,
          });
        }
        continue;
      }
      throw err;
    }
  }
}

/* ──────────────────────── schedule release internals ──────────────────── */

/** §6.13 cancellation settlement ("refund punishes"): when a contract dies
 *  mid-deferred — voluntary churn, cliff lapse, or dunning write-off — its
 *  recognition schedule must close HERE, or a dead contract keeps dribbling
 *  deferred→free forever. Delivered-but-unrecognized periods are earned out
 *  first, then the unearned remainder is refunded through planRefund: the
 *  unreleased part pulls back out of deferred, and any already-recognized
 *  overshoot claws from free — the punishment split the doc names. */
function settleCancellationRefunds(w: Working, contractId: EntityId, now: SimMinute, post: Post): void {
  const closing = w.schedules.filter(
    (s) => s.contractId === contractId && s.reason === "deferred-recognition" && s.released < s.total,
  );
  if (closing.length === 0) return;
  w.schedules = w.schedules.filter((s) => !closing.includes(s));
  for (const schedule of closing) {
    let current = schedule;
    for (let hop = 0; hop < 600; hop += 1) {
      const release = nextUnlockAt(current, now);
      if (release === null) break;
      post(
        asCauseId(`economy:cancel-earn:${current.id}:${hop}`),
        "blue",
        { deferred: asMoney(-release.amount), free: release.amount },
        `cancel-earn ${current.id}`,
      );
      current = release.schedule;
    }
    const refund = asMoney(current.total - current.released);
    if (refund <= 0n) continue;
    const split = planRefund(current, refund);
    const cause = asCauseId(`economy:refund:${current.id}`);
    post(
      cause,
      "blue",
      { deferred: asMoney(-split.fromDeferred), free: asMoney(-split.fromFree) },
      `refund ${current.id}`,
    );
    w.notices.push({
      kind: "prepaid-refunded",
      contractId,
      atBusinessMin: now,
      causeId: cause,
      amount: refund,
    });
  }
}

/** Whole months of promise left on a vendor commitment at `now` (ceil — a
 *  partial month is still owed at monthly granularity, §6.12 take-or-pay).
 *  Boundary parse (Law 2): the shape is checked where the data enters. */
function commitTargetMicroUsd(commit: VendorCommitment, now: SimMinute, cfg: EconomyConfig): MoneyUnit {
  if (typeof commit.id !== "string" || commit.id.length === 0) {
    throw new RangeError("economy/tick: vendorCommit.id must be a non-empty string");
  }
  if (typeof commit.monthlyMicroUsd !== "bigint" || commit.monthlyMicroUsd < 0n) {
    throw new RangeError(
      `economy/tick: vendorCommit '${commit.id}' monthlyMicroUsd must be a bigint >= 0, got ${String(commit.monthlyMicroUsd)}`,
    );
  }
  if (!Number.isSafeInteger(commit.termEndMin) || commit.termEndMin < 0) {
    throw new RangeError(`economy/tick: vendorCommit '${commit.id}' termEndMin must be a non-negative integer minute`);
  }
  const left = commit.termEndMin - now;
  if (left <= 0) return asMoney(0n);
  const mpm = cfg.calendar.minutesPerMonth;
  const monthsLeft = floorDiv(left, mpm) + (left % mpm === 0 ? 0 : 1);
  return asMoney(commit.monthlyMicroUsd * BigInt(monthsLeft));
}

/** §6.13 backlog unwind: a dead deal's un-invoiced promise leaves the
 *  `backlog` bucket with it. Zero remaining (the normal case for every
 *  contract that never entered pending) posts NOTHING — byte-identity. */
function unwindBacklog(w: Working, contractId: EntityId, now: SimMinute, post: Post): void {
  const econ = w.econ.get(contractId);
  if (econ === undefined || econ.backlogRemaining === 0n) return;
  post(
    asCauseId(`economy:backlog-unwind:${contractId}`),
    econColour(econ),
    { backlog: asMoney(-econ.backlogRemaining) },
    `backlog unwind ${contractId}`,
  );
  w.econ.set(contractId, { ...econ, backlogRemaining: asMoney(0n) });
}

/** Money-lifecycle notices that carry reputation weight (§2.10), mapped to
 *  the signal vocabulary; every other notice kind is score-neutral. */
function noticeReputationKind(kind: EconomyNoticeKind): ReputationSignalKind | null {
  switch (kind) {
    case "written-off":
      return "written-off";
    case "churned-voluntary":
      return "voluntary-churn";
    case "dunning-recovered":
      return "dunning-recovered";
    case "chargeback-posted":
      return "chargeback";
    case "sla-credit-due":
      return "major-incident";
    default:
      return null;
  }
}

function releaseDueSchedules(w: Working, now: SimMinute, post: Post): void {
  const kept: UnlockSchedule[] = [];
  for (const schedule of w.schedules) {
    let current = schedule;
    for (let hop = 0; hop < 600; hop += 1) {
      const release = nextUnlockAt(current, now);
      if (release === null) break;
      const from = current.reason === "deferred-recognition" ? "deferred" : "restricted";
      post(
        asCauseId(`economy:unlock:${current.id}:${hop}`),
        "blue",
        { [from]: asMoney(-release.amount), free: release.amount } as Readonly<Partial<Record<keyof MoneyBuckets, MoneyUnit>>>,
        `unlock ${current.id}`,
      );
      current = release.schedule;
    }
    if (current.released < current.total) kept.push(current);
  }
  w.schedules = kept;
}

/* ──────────────────────── lose-slowly guard internals ─────────────────── */

function evaluateLoseSlowly(w: Working, now: SimMinute, cfg: EconomyConfig): void {
  if (w.loseSlowlyViolated) return;
  if (w.spiral.tone !== "normal" && w.warnedAtBusinessMin === null) {
    w.warnedAtBusinessMin = now;
    return;
  }
  if (w.warnedAtBusinessMin === null) return;
  const burn = w.lastClosedBurn ?? asMoney(0n);
  if (burn <= 0n || w.spiral.runwayMonths === null) return;
  if (compare(w.spiral.runwayMonths, fromRatio(BigInt(cfg.runway.criticalMonths), 1n)) >= 0) return;
  // Projected death minute from remaining runway months (floor: conservative
  // — favors finding violations, never hiding them). Whole computation in
  // bigint (E-16): Fixed raw × minutes is exact integer math; the Number
  // touch happens only at the SimMinute boundary, where the guard above has
  // already bounded the lead below criticalMonths × minutesPerMonth.
  const leadBusinessMin = Number((w.spiral.runwayMonths * BigInt(cfg.calendar.minutesPerMonth)) / 65_536n);
  const verdict = meetsLoseSlowlyGuard(now, now + leadBusinessMin, cfg);
  if (!verdict.ok) {
    w.loseSlowlyViolated = true;
    w.notices.push({
      kind: "lose-slowly-violated",
      contractId: asEntityId("company"),
      atBusinessMin: now,
      causeId: asCauseId(`economy:lose-slowly:${now}`),
    });
  }
}

/* ────────────────────────── default cliff rule ────────────────────────── */

/** Lapse-by-default law (§6.4): auto-renew contracts renew evergreen;
 *  otherwise the cohort roll draws the term-matrix retention (§6.12:24772).
 *  Stream slot = term-end minute ⇒ one pinned draw per (contract, term). */
function defaultCliffDecision(
  contract: Contract,
  econ: ContractEconomy,
  runSeed: RunSeed,
  cfg: EconomyConfig,
): RenewalDecision {
  const cause = asCauseId(`economy:cliff:${contract.id}:${econ.termEndMin}`);
  if (contract.sla.autoRenew) {
    return { choice: "renew", causeId: cause, escalatedMrc: null };
  }
  const retention =
    cfg.churn.renewalRetentionBpsByTermMonths[econ.termMonths] ?? cfg.churn.renewalRetentionFallbackBps;
  const stream = streamFor(runSeed, "economy/renewal", econ.termEndMin, contract.id);
  const stays = stream.range(10_000) < Number(retention);
  return { choice: stays ? "renew" : "lapse", causeId: cause, escalatedMrc: null };
}

function sortedMap<V>(source: Map<EntityId, V>): ReadonlyMap<EntityId, V> {
  return new Map([...source.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)));
}

/** Re-export convenience so callers don't reach past the tick for pure
 *  reads the HUD performs each frame (§6.13 trays, §6.1 meter). */
export { arAgingTrays as economyArAging } from "./billing.ts";
export { remainingSec as errorBudgetRemainingSec } from "./errorBudget.ts";

/** Standalone LONG-SAVE retention pass (perf audit #3) for hosts holding a
 *  finished EconomyState — identical predicate to the tick's opt-in step 13:
 *  settled-and-fully-resolved invoices leave the working set, survivors keep
 *  their relative order, the journal (and every cash bucket) is untouched.
 *  Money truth lives in the cause-stamped ledger journal; dropped records
 *  are returned so the caller can archive them. */
export function pruneResolvedInvoices(state: EconomyState): {
  readonly state: EconomyState;
  readonly pruned: readonly Invoice[];
} {
  const { keep, pruned } = partitionPrunableInvoices(state.invoices, state.unlockSchedules);
  return { state: { ...state, invoices: keep }, pruned };
}
