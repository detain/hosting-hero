/**
 * ┌─ TEST FIXTURE MIRROR ────────────────────────────────────────────────────┐
 * │ UPSTREAM ORIGINAL: apps/proto/src/gates/g5/quarter.ts                    │
 * │ (owner of both sides: the GATE-G5 lane). This file is a BYTE-IDENTICAL   │
 * │ copy of that engine below this header, imported by src/__tests__/         │
 * │ gate-g5.test.ts because sim-core's tsconfig rootDir forbids reaching     │
 * │ outside packages/sim-core/src (TS6059) — while vitest runs happily on    │
 * │ the cross-package path, `tsc --noEmit` may not.                          │
 * │ SYNC LAW: edit quarter.ts upstream FIRST, then re-copy it over this file  │
 * │ (everything below this header must stay a byte-identical `diff` target).  │
 * │ Never edit logic here — divergence would silently fork the G5 economy.    │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

/**
 * GATE-G5 · "One Quarter, Playable and Legible" (§9.13 gate #5) — scripted
 * quarter engine. Browser-safe: NO node builtins, NO template imports; the
 * content wires (shared-web bundle, g1 wave table) arrive as `unknown` and
 * are PARSED here at the boundary (Law 2), never re-parsed downstream.
 *
 * OD-1 RATIFIED 2026-10-09 (choice (c) commitment-convergence ACTIVE,
 * ADR-0009): this gate STILL runs WITHOUT the scorecard by design. It
 * consumes ONLY ledger primitives — journal entries, buckets, invoices,
 * contracts' economy records, error budgets, notices. It never touches
 * `getActiveScorecard` / `defaultScorecardConfig.active` (which now
 * resolves to the ratified candidate) and never calls `resolveActiveSheet`
 * (OD-2 ratified sheet B the same day).
 * Every tuning-sheet value it inherits from `defaultEconomyConfig()` is
 * marked PROVISIONAL in economy/config.ts — this fixture rides those
 * defaults, it does not mint new numbers.
 *
 * The stochastic dice are SILENCED (card failure / dunning recovery /
 * voluntary churn patched to 0 bps): fate here is SCRIPTED, minute-exact,
 * so the gate tests the machinery's legibility, not its RNG path (economy's
 * own suite covers probabilistic rolls). The rolls themselves still RUN —
 * they are forced by config, not bypassed.
 *
 * Deterministic business clock: we land on business minute m by feeding
 * advanceClocks the real-clock delta between CLOSED-FORM real marks
 *   realMark(m) = ceil(m × 7/43200 in µs) = (m×420_000_000n + 43_199n) / 43_200n
 * — the post-telescoping-fix law makes the landing partition-invariant, and
 * every settle re-asserts `businessMinuteOf(clocks) === m` (fail loud, Law 4).
 * Business-clock scale 43200/7 is RATIFIED (OD-2, 2026-10-09: the
 * 7-real-minute month was kept; the Sheet-B 4-min flip was declined).
 */

import {
  asCauseId,
  asEntityId,
  asMoney,
  asRunSeed,
  emptyMoneyBuckets,
  type BucketId,
  type Contract,
  type EntityId,
  type LedgerEntry,
  type MoneyBuckets,
  type MoneyUnit,
  type RunSeed,
  type SimMinute,
  type TickContext,
} from "@hh/sim-core/types";
import { advanceClocks, fromRatio, initialClocks } from "@hh/sim-core/kernel";
import {
  BUCKET_IDS,
  businessMinuteOf,
  defaultEconomyConfig,
  DUNNING_STAGE_ORDER,
  emptyEconomyState,
  emptyJournal,
  postEntry,
  registerContractEconomy,
  runEconomyTick,
  type BudgetSpendAction,
  type ContractEconomy,
  type DunningStage,
  type EconomyConfig,
  type EconomyNotice,
  type EconomyState,
  type EntryDraft,
  type Invoice,
  type InvoiceTerms,
  type RenewalDecisionInput,
  type RevenueColourTags,
  type UnlockSchedule,
} from "@hh/sim-core/economy";
import { loadTypeBundle, stableSerialize, type LoadedTypeBundle } from "@hh/sim-core/loader";

/* ─────────────────────────── calendar of the quarter ─────────────────────────── */

/** One business month = 30 days = 43,200 business minutes (config calendar). */
export const MINUTES_PER_DAY = 1_440;
export const MINUTES_PER_MONTH = 43_200;
/** Gate window: exactly three business months — "one quarter". */
export const QUARTER_MINUTES = 129_600;

const REAL_MARK_NUM_PER_MIN = 420_000_000n; // 7 min of real µs per 43200-business-min scale
const REAL_MARK_CEIL_EPS = 43_199n;

/** Closed-form real-clock mark (µs) that telescopes the business clock onto
 *  exactly business minute `m` under scale 43200/7 (ceiling inverse). */
export function realMarkForBusinessMinute(m: SimMinute): bigint {
  if (!Number.isSafeInteger(m) || m < 0) {
    throw new RangeError(`g5/quarter: bad business minute ${m}`);
  }
  return (BigInt(m) * REAL_MARK_NUM_PER_MIN + REAL_MARK_CEIL_EPS) / 43_200n;
}

/* ───────────────────────────── the scripted cast ─────────────────────────────
 * Twelve signings, one per story beat. Days are distinct and < 30, so every
 * monthly cycle boundary (anchor + k×43200) lands on a distinct minute — the
 * scripted decline/lock windows can never catch a bystander.
 * MRC values are PROVISIONAL fixture money (thin-margin shared-web book +
 * one outsized whale, per the bundle's revenueShape 'many-tiny-high-churn').
 */

export interface G5Signing {
  readonly contractId: string;
  readonly customerLabel: string;
  readonly signDay: number;
  readonly mrcMicroUsd: bigint;
  readonly cycle: "monthly" | "annual";
  readonly termMonths: number;
  readonly tags: RevenueColourTags;
  readonly role: "whale" | "tiny" | "b2b" | "doomed" | "survivor" | "renewer";
}

const BLUE5: RevenueColourTags = {
  margin: "blue",
  churnRisk: "blue",
  term: "blue",
  concentration: "blue",
  abuse: "blue",
};

export const GATE5_SCRIPT: readonly G5Signing[] = [
  {
    contractId: "c01",
    customerLabel: "MegaBlog Ltd (WHALE)",
    signDay: 0,
    mrcMicroUsd: 2_500_000_000n, // $2,500/mo — the concentration risk, tagged red
    cycle: "monthly",
    termMonths: 2, // cliff lands EXACTLY at 2×43200 = 86400, scripted lapse
    tags: { margin: "green", churnRisk: "red", term: "amber", concentration: "red", abuse: "blue" },
    role: "whale",
  },
  { contractId: "c02", customerLabel: "birdsong.page", signDay: 1, mrcMicroUsd: 30_000_000n, cycle: "monthly", termMonths: 12, tags: BLUE5, role: "tiny" },
  { contractId: "c03", customerLabel: "garageband-mirror", signDay: 2, mrcMicroUsd: 45_000_000n, cycle: "monthly", termMonths: 12, tags: BLUE5, role: "tiny" },
  {
    contractId: "c04",
    customerLabel: "print-shop-404 (B2B)",
    signDay: 3,
    mrcMicroUsd: 15_000_000n,
    cycle: "annual", // prepaid-year invoice, net-30+15 ⇒ cash lands deep in the quarter
    termMonths: 12,
    tags: { margin: "green", churnRisk: "blue", term: "green", concentration: "blue", abuse: "blue" },
    role: "b2b",
  },
  { contractId: "c05", customerLabel: "eu-hostel-booking", signDay: 4, mrcMicroUsd: 25_000_000n, cycle: "monthly", termMonths: 12, tags: { ...BLUE5, churnRisk: "amber" }, role: "doomed" },
  { contractId: "c06", customerLabel: "podcast-raws", signDay: 5, mrcMicroUsd: 60_000_000n, cycle: "monthly", termMonths: 12, tags: { ...BLUE5, churnRisk: "amber" }, role: "doomed" },
  { contractId: "c07", customerLabel: "fan-trove.org", signDay: 6, mrcMicroUsd: 20_000_000n, cycle: "monthly", termMonths: 12, tags: { ...BLUE5, abuse: "amber" }, role: "survivor" },
  {
    contractId: "c08",
    customerLabel: "law-office-berman (B2B)",
    signDay: 8,
    mrcMicroUsd: 40_000_000n,
    cycle: "annual",
    termMonths: 12,
    tags: { margin: "green", churnRisk: "blue", term: "green", concentration: "blue", abuse: "blue" },
    role: "b2b",
  },
  { contractId: "c09", customerLabel: "devlog-collective", signDay: 11, mrcMicroUsd: 90_000_000n, cycle: "monthly", termMonths: 12, tags: BLUE5, role: "tiny" },
  { contractId: "c10", customerLabel: "recipe-circus", signDay: 15, mrcMicroUsd: 12_000_000n, cycle: "monthly", termMonths: 12, tags: BLUE5, role: "tiny" },
  {
    contractId: "c11",
    customerLabel: "dental-clinic-north (B2B)",
    signDay: 22,
    mrcMicroUsd: 75_000_000n,
    cycle: "annual",
    termMonths: 12,
    tags: { margin: "green", churnRisk: "blue", term: "green", concentration: "amber", abuse: "blue" },
    role: "b2b",
  },
  {
    contractId: "c12",
    customerLabel: "indie-game-mods",
    signDay: 28,
    mrcMicroUsd: 50_000_000n,
    cycle: "monthly",
    termMonths: 2, // cliff at 40320+86400 = 126720, scripted RENEW (evergreen)
    tags: { margin: "blue", churnRisk: "amber", term: "amber", concentration: "blue", abuse: "blue" },
    role: "renewer",
  },
] as const;

/* Story beats, in business minutes (all on day boundaries ⇒ distinct from
 * every other contract's cycle grid — see the cast comment above). */

export const WHALE_ID = asEntityId("c01");
export const DOOMED_IDS = [asEntityId("c05"), asEntityId("c06")] as const;
export const SURVIVOR_ID = asEntityId("c07"); // E-2 post-suspension recovery + incident victim
export const RENEWER_ID = asEntityId("c12");

export const WHALE_CLIFF_MIN = 86_400; // 2 months, minute-exact
export const RENEWER_CLIFF_MIN = 126_720; // anchor 40320 + 2 months
export const DECLINE_MINUTES: readonly [EntityId, SimMinute][] = [
  [asEntityId("c05"), 4 * MINUTES_PER_DAY], // their cycle-0 invoices are due at anchor (net-0)
  [asEntityId("c06"), 5 * MINUTES_PER_DAY],
  [asEntityId("c07"), 6 * MINUTES_PER_DAY],
];
/** c07's terminate-stage entry = due day 0 + 20 dunning days (§6.4 ladder). */
export const E2_RECOVERY_MIN = (6 + 20) * MINUTES_PER_DAY;

/** Wave-4 incident window of g1-shared-web-first-quarter: the quarter split
 *  into five wave slots puts wave 4 at [77760, 103680). We strike at its
 *  opening minute, on the day grid. PROVISIONAL mapping (waves→minutes is a
 *  G5 fixture convention until the waves lane ships a schedule law). */
export const INCIDENT_MIN = 77_760;
/** Sized to blow through the 99.9 % monthly budget (2,592 s) EVEN WITH the
 *  month-end full-surplus carry (§6.1 carryCapBps 10,000 = 100 %, another
 *  2,592 s riding in from month 1) so the exhaustion lock is unmissable. */
export const INCIDENT_OUTAGE_SECS = 6_000n;

/** E-9 multi-week refunds: the settlement ledger FREEZES between the month-2
 *  close (86400) and day 79 — rollWeek's catch-up then closes weeks 9, 10
 *  and 11 in ONE settle, each with its own clean-week refund cause. */
export const E9_RESUME_MIN = 79 * MINUTES_PER_DAY; // 113760

export const WHALE_LAPSE_CAUSE = "gate5:rule:whale-price-increase-refused";
export const RENEWER_RENEW_CAUSE = "gate5:rule:c12-renewed-evergreen";

/* ───────────────────────────── scripted events ───────────────────────────── */

interface SettleEvent {
  readonly cardFailureBps?: bigint;
  readonly postSuspensionRecoveryBps?: bigint;
  readonly decisions?: readonly RenewalDecisionInput[];
  readonly outageSecs?: ReadonlyMap<EntityId, bigint>;
  readonly spends?: readonly { contractId: EntityId; action: BudgetSpendAction; seconds: bigint | null }[];
  readonly opex?: readonly Omit<EntryDraft, "atBusinessMin">[];
}

function scriptEvents(): ReadonlyMap<SimMinute, SettleEvent> {
  const events = new Map<SimMinute, SettleEvent>();
  /* Day boundaries double as month/payroll beats and cliff beats — merge,
     never clobber (a lost decision would silently hand fate to the dice). */
  const at = (m: SimMinute, e: SettleEvent) => {
    const prev = events.get(m);
    events.set(
      m,
      prev === undefined
        ? e
        : {
            ...(e.cardFailureBps ?? prev.cardFailureBps) !== undefined
              ? { cardFailureBps: (e.cardFailureBps ?? prev.cardFailureBps)! }
              : {},
            ...(e.postSuspensionRecoveryBps ?? prev.postSuspensionRecoveryBps) !== undefined
              ? { postSuspensionRecoveryBps: (e.postSuspensionRecoveryBps ?? prev.postSuspensionRecoveryBps)! }
              : {},
            ...(e.decisions ?? prev.decisions) !== undefined
              ? { decisions: (e.decisions ?? prev.decisions)! }
              : {},
            ...(e.outageSecs ?? prev.outageSecs) !== undefined
              ? { outageSecs: (e.outageSecs ?? prev.outageSecs)! }
              : {},
            ...(e.spends ?? prev.spends) !== undefined
              ? { spends: (e.spends ?? prev.spends)! }
              : {},
            opex: [...(prev.opex ?? []), ...(e.opex ?? [])],
          },
    );
  };

  at(0, {
    opex: [
      {
        causeId: asCauseId("gate5:capital:founding"),
        moneyColour: "gold",
        delta: { free: asMoney(40_000_000_000n) }, // $40k runway, posted THROUGH the ledger
        context: "g5 founding capital",
      },
    ],
  });
  for (const [id, m] of DECLINE_MINUTES) {
    void id;
    at(m, { cardFailureBps: 10_000n }); // deterministic decline — only the anchor-tick invoice pays here
  }
  at(E2_RECOVERY_MIN, { postSuspensionRecoveryBps: 10_000n }); // E-2: the card works again
  at(WHALE_CLIFF_MIN, {
    decisions: [
      {
        contractId: WHALE_ID,
        decision: { choice: "lapse", causeId: asCauseId(WHALE_LAPSE_CAUSE), escalatedMrc: null },
      },
    ],
  });
  at(RENEWER_CLIFF_MIN, {
    decisions: [
      {
        contractId: RENEWER_ID,
        decision: { choice: "renew", causeId: asCauseId(RENEWER_RENEW_CAUSE), escalatedMrc: null },
      },
    ],
  });
  at(INCIDENT_MIN, {
    outageSecs: new Map([[SURVIVOR_ID, INCIDENT_OUTAGE_SECS]]),
    spends: [{ contractId: SURVIVOR_ID, action: "risky-deploy", seconds: null }],
    opex: [
      {
        causeId: asCauseId("gate5:opex:incident-mitigation"),
        moneyColour: "red",
        delta: { free: asMoney(-2_500_000_000n) }, // $2.5k emergency bandwidth + mitigation
        context: "g5 wave-4 incident surge",
      },
    ],
  });
  /* Monthly payroll, one per business month. Day 12 lands INSIDE month 1 on
     purpose: with auto-pay money net-0 but annual prepay stuck in deferred
     and B2B net-terms stuck in AR, month 1 books a profit while free cash
     craters — the scripted "cash is not profit" lesson (§6.13). */
  for (const [day, cause, month] of [
    [12, "gate5:opex:payroll:m1", 1],
    [42, "gate5:opex:payroll:m2", 2],
    [72, "gate5:opex:payroll:m3", 3],
  ] as const) {
    at(day * MINUTES_PER_DAY, {
      opex: [
        {
          causeId: asCauseId(cause),
          moneyColour: "red",
          delta: { free: asMoney(-4_000_000_000n) }, // $4k/mo, thin-volume shared-web (§6.16 PROVISIONAL)
          context: `g5 payroll, business month ${month}`,
        },
      ],
    });
  }
  return events;
}

/** Settle grid: every day boundary 0…60 (ladder + cycle story), then the
 *  E-9 freeze (days 61–78 skipped), resume 113760, renewer cliff 126720,
 *  quarter close 129600. */
export function settleMinutes(): readonly SimMinute[] {
  const mins = new Set<SimMinute>();
  for (let day = 0; day <= 60; day++) mins.add(day * MINUTES_PER_DAY);
  mins.add(E9_RESUME_MIN);
  mins.add(RENEWER_CLIFF_MIN);
  mins.add(QUARTER_MINUTES);
  return [...mins].sort((a, b) => a - b);
}

/* ─────────────────────────── config (scripted fate) ─────────────────────────── */

/** Base config: shipped defaults (all PROVISIONAL-marked sheet values ride
 *  along, unmodified) with the three dice silenced so the script is the only
 *  source of death and recovery. */
export function gate5Config(): EconomyConfig {
  const base = defaultEconomyConfig();
  return {
    ...base,
    dunning: {
      ...base.dunning,
      cardFailureBps: 0n,
      stageRecoveryBps: { retry: 0n, reminder: 0n, warning: 0n, suspend: 0n },
      postSuspensionRecoveryBps: 0n,
    },
    churn: {
      ...base.churn,
      monthlyLogoChurnBpsByBundle: {},
      fallbackMonthlyBps: 0n,
    },
  };
}

function patchConfig(base: EconomyConfig, e: SettleEvent): EconomyConfig {
  if (e.cardFailureBps === undefined && e.postSuspensionRecoveryBps === undefined) return base;
  return {
    ...base,
    dunning: {
      ...base.dunning,
      ...(e.cardFailureBps !== undefined ? { cardFailureBps: e.cardFailureBps } : {}),
      ...(e.postSuspensionRecoveryBps !== undefined
        ? { postSuspensionRecoveryBps: e.postSuspensionRecoveryBps }
        : {}),
    },
  };
}

/* ─────────────────────────── contract construction ─────────────────────────── */

const SLA_999 = {
  uptimeTarget: fromRatio(999n, 1000n),
  responseBudgetUs: 3_600_000_000n,
  creditRate: fromRatio(10n, 100n),
  creditCap: fromRatio(50n, 100n),
  claimWindowUs: 30n * 1_440n * 60_000_000n,
  autoRenew: true,
  noticePeriodMin: 4_320,
  threeBreachExitRight: false,
};

export function buildContract(signing: G5Signing, bundleId: string): Contract {
  const anchor = signing.signDay * MINUTES_PER_DAY;
  const termEnd = anchor + signing.termMonths * MINUTES_PER_MONTH;
  const id = asEntityId(signing.contractId);
  return {
    id,
    customerEntityId: asEntityId(`customer:${signing.contractId}`),
    bundleId,
    mrcMicroUsd: asMoney(signing.mrcMicroUsd),
    tcvMicroUsd: asMoney((signing.mrcMicroUsd * 12n * BigInt(signing.termMonths)) / 1n),
    acvMicroUsd: asMoney(signing.mrcMicroUsd * 12n),
    termStartMin: anchor,
    termEndMin: termEnd,
    billingCycle: signing.cycle,
    sla: SLA_999,
    routingLocks: [],
    shedImmunityClassId: null,
    allocations: [],
  };
}

/* ─────────────────────────────── run the quarter ─────────────────────────────── */

export interface SettleRecord {
  readonly minute: SimMinute;
  readonly entries: readonly LedgerEntry[];
  readonly notices: readonly EconomyNotice[];
  readonly cash: MoneyBuckets;
}

export interface MonthSummary {
  readonly monthIndex: number;
  readonly startMin: SimMinute;
  readonly endMin: SimMinute;
  /** Accrual: Σ gross AR credits issued in the month (the profit pane). */
  readonly accrualRevenue: MoneyUnit;
  /** Cash: Σ positive free deltas (payments + unlock releases). */
  readonly netCollected: MoneyUnit;
  /** Cash: Σ negative free deltas whose cause is scripted opex. */
  readonly opex: MoneyUnit;
  readonly freeStart: MoneyUnit;
  readonly freeEnd: MoneyUnit;
  /** The category axiom's punchline: OPERATING Δfree over the month —
   *  owner-capital causes (gate5:capital:*) are excluded on purpose. */
  readonly deltaFree: MoneyUnit;
}

export interface QuarterResult {
  readonly seed: RunSeed;
  readonly bundleId: string;
  readonly tuningSheetMarker: string;
  readonly incidentWindow: ParsedWaveTable;
  readonly cfg: EconomyConfig;
  readonly finalState: EconomyState;
  readonly settles: readonly SettleRecord[];
  readonly allEntries: readonly LedgerEntry[];
  readonly allNotices: readonly EconomyNotice[];
  readonly noticesByKind: Readonly<Record<string, readonly EconomyNotice[]>>;
  readonly months: readonly MonthSummary[];
  readonly minuteAuditViolations: readonly string[];
  readonly digest: string;
}

export interface RunQuarterOptions {
  readonly seed: bigint;
  /** packages/content/types/shared-web.json, parsed here via the loader. */
  readonly sharedWebWire: unknown;
  /** packages/content/waves/g1-shared-web-first-quarter.json — the incident script. */
  readonly waveWire: unknown;
  /** Full per-minute conservation audit (~130k bigint comparisons). Off in
   *  the ×100 replay arm; the settle-level check + digest cover those. */
  readonly withMinuteAudit?: boolean;
}

export class Gate5Error extends Error {}

export function runQuarter(options: RunQuarterOptions): QuarterResult {
  const bundle: LoadedTypeBundle = loadTypeBundle(options.sharedWebWire);
  const incidentWindow = parseWaveTable(options.waveWire);
  if (incidentWindow.incidentStartMin !== INCIDENT_MIN) {
    throw new Gate5Error(
      `g5/quarter: content drift — wave ${incidentWindow.id} slot 3 opens at ${incidentWindow.incidentStartMin}, script strikes at ${INCIDENT_MIN}`,
    );
  }
  const tuningSheetMarker = readTuningSheetMarker(options.sharedWebWire); // PROVISIONAL label, carried not resolved
  const runSeed = asRunSeed(options.seed);
  const cfg = gate5Config();

  const contractsById = new Map<string, Contract>();
  for (const s of GATE5_SCRIPT) contractsById.set(s.contractId, buildContract(s, bundle.id));

  const events = scriptEvents();
  const book = new Map<EntityId, Contract>();
  const signingsByMinute = new Map<SimMinute, G5Signing[]>();
  for (const s of GATE5_SCRIPT) {
    const m = s.signDay * MINUTES_PER_DAY;
    const row = signingsByMinute.get(m) ?? [];
    row.push(s);
    signingsByMinute.set(m, row);
  }

  let state = emptyEconomyState();
  let clocks = initialClocks();
  let prevRealMark = 0n;
  const settles: SettleRecord[] = [];

  for (const minute of settleMinutes()) {
    /* Land the business clock exactly on `minute` via real-mark deltas. */
    const realMark = realMarkForBusinessMinute(minute);
    clocks = advanceClocks(clocks, {
      realElapsedUs: realMark - prevRealMark,
      speed: 1,
      incident: minute === INCIDENT_MIN,
    });
    prevRealMark = realMark;
    const landed = businessMinuteOf(clocks);
    if (landed !== minute) {
      throw new Gate5Error(`g5/quarter: clock missed minute ${minute} (landed ${landed})`);
    }

    /* Signings at this minute enter THE BOOK (contracts map + registration). */
    for (const signing of signingsByMinute.get(minute) ?? []) {
      const contract = contractsById.get(signing.contractId)!;
      book.set(contract.id, contract);
      state = registerContractEconomy(
        state,
        {
          contract,
          atBusinessMin: minute,
          clauseRefs: ["auto-renew"],
          grandfather: null,
          revenueTags: signing.tags,
          commitmentBps: 9_990n, // 99.9 % uptime commitment (9,990 bps up) ⇒ 2,592 s downtime budget/month (§6.1)
        },
        cfg,
      );
    }

    const event = events.get(minute) ?? {};

    /* Scripted opex / capital — posted through the ledger, never by touch. */
    for (const draft of event.opex ?? []) {
      const posted = postEntry(state.journal, state.cash, { ...draft, atBusinessMin: minute });
      state = { ...state, journal: posted.journal, cash: posted.cash };
    }

    const context: TickContext = { tick: BigInt(minute), minute, clocks };
    const out = runEconomyTick({
      context,
      runSeed,
      contracts: book,
      prior: state,
      cfg: patchConfig(cfg, event),
      ...(event.outageSecs !== undefined ? { outageSecs: event.outageSecs } : {}),
      ...(event.spends !== undefined ? { spends: event.spends } : {}),
      ...(event.decisions !== undefined ? { renewalDecisions: event.decisions } : {}),
      dunningEngineOwned: false,
    });
    state = out.state;

    /* Fail-loud conservation checkpoint at every settle (the every-minute
       audit below generalizes it across the freeze gaps). */
    assertJournalMatchesCash(state, `settle ${minute}`);

    settles.push({ minute, entries: out.entries, notices: out.notices, cash: state.cash });
  }

  const allEntries = state.journal.entries;
  const allNotices = settles.flatMap((s) => s.notices);
  const noticesByKind: Record<string, EconomyNotice[]> = {};
  for (const n of allNotices) (noticesByKind[n.kind] ??= []).push(n);

  const violations =
    options.withMinuteAudit === true ? minuteByMinuteAudit(allEntries, settles) : [];

  return {
    seed: runSeed,
    bundleId: bundle.id,
    tuningSheetMarker,
    incidentWindow,
    cfg,
    finalState: state,
    settles,
    allEntries,
    allNotices,
    noticesByKind,
    months: summarizeMonths(allEntries),
    minuteAuditViolations: violations,
    digest: digestQuarter({ entries: allEntries, notices: allNotices, state }),
  };
}

/** The g1 wave table is GATE5's incident script source: we parse it as the
 *  real shared-web quarter table and map its waves EVENLY onto the quarter's
 *  business minutes (a G5 fixture convention — the waves lane keeps owning
 *  the laws; here only the shape is read, never re-validated). Wave 4 of 5
 *  is the incident window ("second incident ×1.8", rules.incidentWindow). */
export interface ParsedWaveTable {
  readonly id: string;
  readonly type: string;
  readonly waveCount: number;
  readonly slotMinutes: number;
  readonly incidentSlot: number;
  readonly incidentStartMin: number;
  readonly incidentEndMin: number;
  readonly incidentWaveParPct: number;
}

export function parseWaveTable(wire: unknown): ParsedWaveTable {
  const doc = wire as { id?: unknown; type?: unknown; waves?: unknown };
  if (typeof doc?.id !== "string" || typeof doc.type !== "string" || !Array.isArray(doc.waves)) {
    throw new Gate5Error("g5/quarter: wave wire is not a g1 wave table (needs id, type, waves[])");
  }
  const waveCount = doc.waves.length;
  if (waveCount < 4) {
    throw new Gate5Error(`g5/quarter: wave table has ${waveCount} waves — need ≥ 4 to script an incident`);
  }
  const slotMinutes = Math.floor(QUARTER_MINUTES / waveCount);
  const incidentSlot = 3; // wave 4, 0-based slot 3 — the doc's incident window
  const fourth = doc.waves[incidentSlot] as { parPct?: unknown };
  if (typeof fourth.parPct !== "number") {
    throw new Gate5Error("g5/quarter: incident wave lacks parPct");
  }
  return {
    id: doc.id,
    type: doc.type,
    waveCount,
    slotMinutes,
    incidentSlot,
    incidentStartMin: incidentSlot * slotMinutes,
    incidentEndMin: (incidentSlot + 1) * slotMinutes,
    incidentWaveParPct: fourth.parPct,
  };
}

/** The bundle wire carries economy.tuningSheet as a PROVISIONAL string
 *  ("PROVISIONAL-B"); the loader's LoadedEconomy does not surface it, and
 *  this gate carries the marker only — it never resolves it via
 *  resolveActiveSheet() (whose OD-2 default is the ratified sheet B; the
 *  wire marker is authored content data, untouched here). */
function readTuningSheetMarker(wire: unknown): string {
  const sheet = (wire as { economy?: { tuningSheet?: unknown } })?.economy?.tuningSheet;
  if (typeof sheet !== "string" || sheet.length === 0) {
    throw new Gate5Error("g5/quarter: shared-web wire lacks economy.tuningSheet marker");
  }
  return sheet; // e.g. "PROVISIONAL-B" — never resolved to numbers here
}

/* ───────────────────────────── conservation laws ───────────────────────────── */

export function assertJournalMatchesCash(state: EconomyState, where: string): void {
  const totals = zeroTotals();
  for (const e of state.journal.entries) appendTotals(totals, e);
  for (const b of BUCKET_IDS) {
    if (state.cash[b] !== totals[b]) {
      throw new Gate5Error(
        `g5/quarter: ${where} — bucket '${b}' is ${state.cash[b]} but the journal says ${totals[b]}`,
      );
    }
    if (state.cash[b] < 0n) {
      throw new Gate5Error(`g5/quarter: ${where} — bucket '${b}' went negative (${state.cash[b]})`);
    }
  }
}

type Totals = Record<BucketId, bigint>;

function zeroTotals(): Totals {
  const t = {} as Totals;
  for (const b of BUCKET_IDS) t[b] = 0n;
  return t;
}

function appendTotals(totals: Totals, e: LedgerEntry): void {
  for (const [bucket, amount] of Object.entries(e.delta) as [BucketId, MoneyUnit][]) {
    totals[bucket] += amount;
  }
}

/**
 * The gate's headline invariant, checked EVERY business minute across the
 * whole quarter: for all m in [0, QUARTER_MINUTES],
 *   cash(m)[b] === Σ journal deltas (atBusinessMin ≤ m)[b]  and ≥ 0,
 * where cash(m) is the piecewise-constant state between settles. A money
 * mutation that skipped the ledger — or an entry stamped in the future —
 * trips this immediately.
 */
export function minuteByMinuteAudit(
  entries: readonly LedgerEntry[],
  settles: readonly SettleRecord[],
): readonly string[] {
  const violations: string[] = [];
  const byMinute = new Map<SimMinute, LedgerEntry[]>();
  let lastStamp = -1;
  for (const e of entries) {
    if (e.atBusinessMin < lastStamp) {
      violations.push(`seq ${e.seq}: atBusinessMin went backwards (${lastStamp} → ${e.atBusinessMin})`);
    }
    lastStamp = e.atBusinessMin;
    (byMinute.get(e.atBusinessMin) ?? byMinute.set(e.atBusinessMin, []).get(e.atBusinessMin)!).push(e);
  }
  const totals = zeroTotals();
  let settleIdx = 0;
  let cash: MoneyBuckets = settles[0]?.cash ?? emptyBucketsZero();
  for (let m = 0; m <= QUARTER_MINUTES; m++) {
    for (const e of byMinute.get(m) ?? []) appendTotals(totals, e);
    for (;;) {
      const rec = settles[settleIdx];
      if (rec === undefined || rec.minute > m) break;
      cash = rec.cash;
      settleIdx++;
    }
    for (const b of BUCKET_IDS) {
      if (cash[b] !== totals[b]) {
        violations.push(`minute ${m}: bucket '${b}' cash ${cash[b]} ≠ journal Σ ${totals[b]}`);
        return violations; // first trip is the forensics anchor; no spam
      }
      if (cash[b] < 0n) {
        violations.push(`minute ${m}: bucket '${b}' negative (${cash[b]})`);
        return violations;
      }
    }
  }
  return violations;
}

function emptyBucketsZero(): MoneyBuckets {
  return emptyMoneyBuckets();
}

/* ────────────────────────────── month summaries ────────────────────────────── */

export function summarizeMonths(entries: readonly LedgerEntry[]): readonly MonthSummary[] {
  const months: MonthSummary[] = [];
  const quarterMonths = QUARTER_MINUTES / MINUTES_PER_MONTH;
  for (let mi = 0; mi < quarterMonths; mi++) {
    const startMin = mi * MINUTES_PER_MONTH;
    const endMin = (mi + 1) * MINUTES_PER_MONTH;
    let accrualRevenue = 0n;
    let netCollected = 0n;
    let opex = 0n;
    for (const e of entries) {
      if (e.atBusinessMin < startMin || e.atBusinessMin >= endMin) continue;
      const dAr = e.delta.accountsReceivable ?? 0n;
      if (dAr > 0n) accrualRevenue += dAr; // accrual = NEW invoices issued (write-offs reverse, don't un-book)
      const dFree = e.delta.free ?? 0n;
      if (dFree > 0n && !e.causeId.startsWith("gate5:capital:")) netCollected += dFree;
      if (e.causeId.startsWith("gate5:opex:")) opex += -dFree;
    }
    /* OPERATING Δfree: owner capital is deliberately excluded — a funding
       round is not trading cash, and mixing it in would hide exactly the
       crater the pane exists to show. (The bucket stack still counts it.) */
    const freeAt = (m: SimMinute): MoneyUnit => {
      let free: bigint = 0n;
      for (const e of entries) {
        if (e.atBusinessMin <= m && !e.causeId.startsWith("gate5:capital:")) free += e.delta.free ?? 0n;
      }
      return asMoney(free);
    };
    const freeStart = mi === 0 ? asMoney(0n) : freeAt(startMin - 1);
    const freeEnd = freeAt(endMin - 1);
    months.push({
      monthIndex: mi,
      startMin,
      endMin,
      accrualRevenue: asMoney(accrualRevenue),
      netCollected: asMoney(netCollected),
      opex: asMoney(opex),
      freeStart,
      freeEnd,
      deltaFree: asMoney(freeEnd - freeStart),
    });
  }
  return months;
}

/* ─────────────────────────── attribution (P10 proof) ─────────────────────────── */

export interface AttributionTrail {
  readonly contractId: EntityId;
  readonly entries: readonly LedgerEntry[];
  readonly notices: readonly EconomyNotice[];
  readonly invoices: readonly Invoice[];
  readonly econ: ContractEconomy | null;
  readonly oneSentence: string;
}

/** Walk the ledger + notice feed for one contract: every causeId that names
 *  it (invoice grid, decline, dunning stages, unlocks) + every notice. The
 *  chain, not a summary — the UI Explain-This-Number popovers read this. */
export function attributionTrail(result: QuarterResult, contractId: EntityId): AttributionTrail {
  const needle = `${contractId}`;
  const invoices = result.finalState.invoices.filter((i) => i.contractId === contractId);
  const invoiceIds = new Set(invoices.map((i) => i.id));
  const entries = result.allEntries.filter(
    (e) =>
      e.causeId.includes(needle) ||
      [...invoiceIds].some((inv) => e.causeId.includes(inv)),
  );
  const notices = result.allNotices.filter((n) => n.contractId === contractId);
  const econ = result.finalState.contractEconomy.get(contractId) ?? null;

  const billed = invoices.reduce((sum, i) => sum + i.gross, 0n);
  const paid = invoices.filter((i) => i.state === "paid").length;
  const cliff = notices.find((n) => n.kind === "cliff-lapsed" || n.kind === "cliff-renewed");
  const writtenOff = notices.find((n) => n.kind === "written-off");
  const recovered = notices.find((n) => n.kind === "dunning-recovered");

  let oneSentence: string;
  if (cliff !== undefined && cliff.kind === "cliff-lapsed") {
    oneSentence =
      `'${contractId}' paid ${paid} cycle${paid === 1 ? "" : "s"} (${usd(billed)} billed), then lapsed at its renewal cliff at business minute ${cliff.atBusinessMin} — cause '${cliff.causeId}'.`;
  } else if (writtenOff !== undefined) {
    oneSentence =
      `'${contractId}' declined its card at minute ${writtenOff.atBusinessMin - 20 * MINUTES_PER_DAY}, walked the full dunning ladder failed→retry→reminder→warning→suspend→terminate, and was written off (${usd(billed)} reversed out of AR) — cause '${writtenOff.causeId}'.`;
  } else if (recovered !== undefined && econ?.phase === "active") {
    oneSentence =
      `'${contractId}' died on the ladder at minute ${recovered.atBusinessMin} (post-suspension), the card came back to life, and it was resurrected to active billing — cause '${recovered.causeId}'.`;
  } else if (cliff !== undefined) {
    oneSentence =
      `'${contractId}' renewed at its cliff at business minute ${cliff.atBusinessMin} — cause '${cliff.causeId}'.`;
  } else {
    oneSentence = `'${contractId}' is billing quietly: ${invoices.length} invoices, ${paid} settled.`;
  }
  return { contractId, entries, notices, invoices, econ, oneSentence };
}

/* ────────────────────────────── digest (×100) ────────────────────────────── */

interface DigestInput {
  readonly entries: readonly LedgerEntry[];
  readonly notices: readonly EconomyNotice[];
  readonly state: EconomyState;
}

/** Canonical, platform-free serialization of everything the quarter decided.
 *  stableSerialize (loader) sorts object keys and prints bigints exactly. */
export function digestQuarter(input: DigestInput): string {
  return stableSerialize({
    entries: input.entries.map((e) => ({
      seq: e.seq,
      causeId: e.causeId,
      at: e.atBusinessMin,
      colour: e.moneyColour,
      delta: e.delta,
    })),
    notices: input.notices.map((n) => ({
      kind: n.kind,
      contractId: `${n.contractId}`,
      at: n.atBusinessMin,
      causeId: `${n.causeId}`,
      invoiceId: n.invoiceId === undefined ? null : `${n.invoiceId}`,
      stage: n.stage ?? null,
      amount: n.amount ?? null,
      seconds: n.seconds ?? null,
    })),
    cash: input.state.cash,
    phases: [...input.state.contractEconomy.entries()].map(([id, e]) => ({
      id: `${id}`,
      phase: e.phase,
      termEndMin: e.termEndMin,
      cycleAnchorMin: e.cycleAnchorMin,
      invoicedCycles: e.invoicedCycles,
      cliffFired: e.cliffFired,
      renewalPulseOpened: e.renewalPulseOpened,
    })),
    invoices: input.state.invoices.map((i) => ({
      id: `${i.id}`,
      state: i.state,
      stage: i.dunningStage ?? null,
      stageAt: i.dunningStageAtMin,
      settledAt: i.settledAtMin,
      gross: i.gross,
      fee: i.fee,
      net: i.net,
    })),
    schedules: input.state.unlockSchedules.map((s) => ({
      id: `${s.id}`,
      released: s.released,
      next: s.nextReleaseAtMin,
    })),
    budgets: [...input.state.errorBudgets.entries()].map(([id, b]) => ({
      id: `${id}`,
      weekIndex: b.weekIndex,
      drained: b.drainedSec,
      spent: b.spentSec,
      refunded: b.refundedSec,
      carryIn: b.carryInSec,
      weekConsumed: b.weekConsumedSec,
    })),
    spiral: input.state.spiral,
    monthIndex: input.state.monthIndex,
    lastClosedBurn: input.state.lastClosedBurn ?? null,
  });
}

/** Lean replay for the ×100 byte-identity gate: no minute audit, everything
 *  else identical (same seed ⇒ same digest). */
export function replayQuarterDigest(seed: bigint, sharedWebWire: unknown, waveWire: unknown): string {
  return runQuarter({ seed, sharedWebWire, waveWire }).digest;
}

/* Small screen-friendly money formatter (shares the UI's µ$ law). */
export function usd(amount: bigint): string {
  const sign = amount < 0n ? "-" : "";
  const abs = amount < 0n ? -amount : amount;
  const whole = abs / 1_000_000n;
  const cents = (abs % 1_000_000n) / 10_000n;
  return `${sign}$${whole.toLocaleString("en-US")}.${cents.toString().padStart(2, "0")}`;
}

export type { Invoice, InvoiceTerms, UnlockSchedule, DunningStage, ContractEconomy, LedgerEntry, EconomyNotice };
export { DUNNING_STAGE_ORDER, emptyJournal };
