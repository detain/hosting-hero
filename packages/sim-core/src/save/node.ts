/**
 * CompanyNode — the generational vertex of THE LONG SAVE lineage tree
 * (MASTER_REPORT Appendix C §2.2 verbatim schema, RATIFIED owner decision R-3).
 *
 * Shape laws encoded here (Appendix C §2.1 theses):
 *  - faces ≠ storage: Wall/Scrapbook/Almanac/People are READ VIEWS (faces.ts);
 *    everything below is a WRITE FACET (~27 of them, modes.ts);
 *  - append-only event spine + materialized projections: the unbounded lists
 *    are exactly `attributionEvents`, treatment logs (inside customerBooks),
 *    and career logs — all append-only facts; everything else is bounded by
 *    design (scar cap 3, playbook ≤8, named customers 12) so the Long Save
 *    stays low-MB (size discipline, Appendix C);
 *  - all events stamp SIM TIME (fictional-clock discipline: "years later"
 *    queries are sim-time ranges);
 *  - cross-mode uptime streaks live at the SaveFile ROOT (`streaksShared`),
 *    never per node — nodes consume them as DATA refs (streakDataRef).
 *
 * Money = MoneyUnit (µ$ bigint), time = SimTick/SimTimeUs (bigint) per
 * ../types.js; Fixed = Q16.16 bigint for every ratio/valence.
 *
 * INTEGER DOMAIN, STATED EXACTLY (round-2 S-4 — the claim above is the law,
 * this paragraph is the EXEMPTED SET, pinned by parser tests): plain JS
 * `number` is legal ONLY in the display domain, and the exempted fields are
 * EXACTLY these — everything else that arrives as a number must be a safe
 * integer (asInt), and every bigint stays bigint:
 *  - unit fractions, validated 0..1 (scale-safe: consumers read them as a
 *    position on a unit bar): scars[].clearance.progress,
 *    nodesUnlocked[].faded;
 *  - credit display score, validated 0..850 (FICO-anchored gauge):
 *    creditGrade.score;
 *  - safe-integer grid coordinates (validated): scars[].mapPosition.x / .y;
 *  - breachHistoryTicks and all counters/minutes/rungs/seqs: safe integers.
 * The parser normalizes -0 → 0 on EVERY number leaf (asNum), so a signed
 * zero can never enter display state (it would encode "0" yet compare
 * Object.is-distinct — a divergence seed for the canonical digests).
 */

import type { EntityId, Fixed, HashHex, MoneyUnit, RunSeed, SimMinute, SimTick } from "../types.ts";
import { asEntityId, asMoney, asRunSeed } from "../types.ts";
import { fail, requireDefined } from "./errors.ts";

/* ═══════════════════════ identity & succession ═══════════════════════ */

export type NodeStatus = "active" | "retired" | "retired_npc";

/** Appendix C: succession type ∈ exit | failure_restart | found | npc_pivot. */
export type SuccessionType = "found" | "exit" | "failure_restart" | "npc_pivot";

/** The §1.6 "seven exit kinds" enum is content-pending (WS-3 taxonomy);
 *  stored as an opaque string so the schema never blocks on it. */
export type ExitKind = string;

export interface NodeIdentity {
  readonly name: string;
  /** Procedural mark + quality — opaque to save (renderer interprets). */
  readonly mark: string;
  readonly foundedAtTick: SimTick;
  readonly eraOrigin: string;
  readonly status: NodeStatus;
}

export interface Succession {
  readonly type: SuccessionType;
  readonly exitKind: ExitKind | null;
}

/** L14 Goal Card — declared win condition, re-choosable once per chapter. */
export interface GoalCardState {
  readonly declared: string | null;
  readonly rechoiceCount: number;
  readonly chapter: number;
}

/** U27 Doctrine — per-act beliefs; exactly one rides an inheritance edge. */
export interface DoctrineEntry {
  readonly id: EntityId;
  readonly textRef: string;
  readonly adoptedAtTick: SimTick;
}

export interface DoctrineState {
  readonly perAct: readonly DoctrineEntry[];
  readonly current: DoctrineEntry | null;
}

/** X1 calendar slice — business-clock anchors stored on the node. */
export interface NodeCalendar {
  readonly monthBoundaryTick: SimTick;
  readonly seasonalityPhase: string;
}

/* ═══════════════════════ PEOPLE face ═══════════════════════ */

/** One career stop on a staff member's accumulator log (append-only). */
export interface StaffCareerStop {
  readonly atTick: SimTick;
  readonly kind: "hire" | "promotion" | "role_change" | "departure" | "milestone";
  readonly note: string;
}

/** U22 staff record. `documented` marks facemakers/bindermakers. */
export interface StaffRecord {
  readonly id: EntityId;
  readonly name: string;
  readonly hiredAtTick: SimTick;
  readonly role: string;
  readonly arcStage: string;
  readonly skillNodesHeld: readonly EntityId[];
  readonly documented: "facemaker" | "bindermaker" | null;
  readonly morale: Fixed;
  readonly fatigue: Fixed;
  readonly onCallTurn: boolean;
  readonly apprenticeshipRemaining: number;
  /** THE career accumulator — append-only, read by People face + alumni. */
  readonly careerLog: readonly StaffCareerStop[];
}

/** L5 alumni network row — sentiment gates rehire and references. */
export interface AlumniRecord {
  readonly staffId: EntityId;
  readonly leftAtTick: SimTick;
  readonly reason: string;
  /** Signed −1..+1 (Fixed): how they SPEAK of you later. */
  readonly sentiment: Fixed;
  readonly currentCompany: string;
  readonly rehireDarkened: boolean;
}

/** T14 recurring-cast NPCs with accumulator state. */
export interface SpineCastRecord {
  readonly npcKind:
    | "first_customer"
    | "rival"
    | "transit_am"
    | "auditor"
    | "journalist"
    | "tier1_eng";
  /** Named accumulators, e.g. {"journalist.article.0.tone": …, "auditor.opinion": …}. */
  readonly accumulatorState: Readonly<Record<string, Fixed>>;
}

/* ═══════════════════════ SCRAPBOOK face ═══════════════════════ */

/** T8 scar row. CAP = 3 ACTIVE (enforced by addScar; overflow retires the
 *  oldest — history is immortal, modifier slots are capped: reading D7). */
export interface ScarRecord {
  readonly id: EntityId;
  readonly originEventRef: CauseRef;
  readonly acquiredAtTick: SimTick;
  /** Opaque modifier payload — pipeline interprets, save only stores. */
  readonly modifierPayload: Readonly<Record<string, unknown>>;
  readonly clearance: { readonly rule: "90_clean_days" | "audit_passed"; /** unit fraction 0..1 (S-4 exempted display domain) */ readonly progress: number };
  /** §1.6 detonation-in-diligence: concealment is a stored fact. */
  readonly disclosure: "disclosed" | "concealed";
  readonly payoffGrant: { readonly node: EntityId; readonly failureOnly: boolean; readonly discountRatio: Fixed | null } | null;
  /** Burned rack position (U7 one-key blueprint export). Whole-grid cells —
   *  safe integers (S-4). */
  readonly mapPosition: { readonly x: number; readonly y: number } | null;
}

/** Cause refs are plain strings pre-parsed; keep loose to avoid import cycles. */
export type CauseRef = string;

/** Immortal retired-scar memorial (cap governs slots, not memory). */
export interface RetiredScarRecord {
  readonly id: EntityId;
  readonly replacedBy: EntityId | null;
  readonly memorial: boolean;
  readonly retiredAtTick: SimTick;
}

/** U9/U20 postmortem — wrong root cause is a STORED outcome, not an error. */
export interface PostmortemRecord {
  readonly polaroidRef: string;
  readonly rootCause: string;
  readonly correct: boolean;
  readonly costBreakdownMicroUsd: MoneyUnit;
  readonly blameMode: string;
  readonly published: boolean;
  readonly unlocks: readonly EntityId[];
}

/** §6.9 Wall of Ghosts — churned customers keep a voice. */
export interface GhostRecord {
  readonly customerId: EntityId;
  readonly exitQuote: string;
  readonly voice: string;
  readonly cause: CauseRef;
  readonly repaired: boolean;
}

/** L19 habit recorder — THE Past-Self generator input (Appendix C). */
export interface HabitCounters {
  readonly docRate: Fixed;
  readonly standardizationRate: Fixed;
  readonly snowflakesLeft: number;
  readonly overPermissionCount: number;
  readonly debtPayoffLatencyMin: SimMinute;
}

/** §5.8 hardware tombstone row. */
export interface DeadDriveRecord {
  readonly serial: string;
  readonly deathAtTick: SimTick;
  readonly cause: string;
}

/** L2 "hardware biographies" — the living ledger behind dead drives. */
export interface HardwareBiography {
  readonly id: EntityId;
  readonly kind: string;
  readonly model: string;
  readonly serial: string;
  readonly installedAtTick: SimTick;
  readonly retiredAtTick: SimTick | null;
  readonly rackRef: string | null;
  /** Append-only biography beats ("survived the flood", "re-seated 4×"). */
  readonly events: readonly { readonly atTick: SimTick; readonly note: string }[];
}

/** U8 "roads not taken" — passed-on unlock drafts stay visible. */
export interface PassedUnlockDraft {
  readonly node: EntityId;
  readonly draftId: string;
}

/* ═══════════════════════ WALL face ═══════════════════════ */

/** U1/§5.1 acquisition paths — unlocks hang off EXPERIENCES, and scar-driven
 *  ones carry the scar ref (task: "which unlocks hang off them"). */
export type UnlockVia = "scar" | "foresight" | "testimony" | "anticipation" | "milestone" | "era" | "acquisition";

export interface NodeUnlockRecord {
  readonly node: EntityId;
  readonly via: UnlockVia;
  /** Set when via === "scar": the scar this unlock hangs off. */
  readonly scarRef: EntityId | null;
  readonly incidentRef: CauseRef | null;
  /** The "LEARNED THE HARD WAY" rubber stamp (U7). */
  readonly stamp: "learned_hard_way" | null;
  readonly stampAtTick: SimTick | null;
  /** §1.6 prestige: inherited nodes keep the ORIGINAL owner's handwriting. */
  readonly handwritingOwnerStaffId: EntityId | null;
  /** Knowledge degrades: 0 = crisp, ≤0.4 = faded (binder-fade family).
   *  Unit fraction 0..1 (S-4 exempted display domain). */
  readonly faded: number;
}

export type CredentialKind =
  | "ASN"
  | "ICANN"
  | "SOC2_I"
  | "PCI"
  | "HIPAA"
  | "FedRAMP"
  | "TierIII"
  | "merchant"
  | "utility_kw"
  | "gpu_alloc";

/** U35 certifications with clean-day requirements and revocation memory. */
export interface CredentialRecord {
  readonly kind: CredentialKind;
  readonly grantedAtTick: SimTick;
  readonly requiresCleanDays: number;
  readonly expiryAtTick: SimTick | null;
  readonly revoked: boolean;
  readonly revocationCause: CauseRef | null;
  /** §5.7/5.8 frame state renders pride or neglect. */
  readonly frameState: "crisp" | "dusty" | "crooked";
}

export interface MedalRecord {
  readonly kind: string;
  readonly levelRef: string;
  readonly atTick: SimTick;
}

/** T20/U30 product-line placards. */
export interface LineEverRunRecord {
  readonly type: string;
  readonly launchedAtTick: SimTick;
  readonly retiredAtTick: SimTick | null;
  readonly placardState: "intact" | "divested_faced_wall" | "cracked";
  readonly distillateGranted: boolean;
  readonly nameplateData: string;
}

/** U17 codex — company-scoped threat mastery (Consultant teaches it both ways). */
export interface CodexEntry {
  readonly stage: "seen" | "analyzed" | "countered" | "mastered";
  readonly personalRecord: string;
  readonly lifetimeCostMicroUsd: MoneyUnit;
  readonly counteredWith: readonly string[];
  readonly silhouettesUnlocked: readonly string[];
}

/* ═══════════════════════ ALMANAC face ═══════════════════════ */

/** The treatment VECTOR dimensions (task item 1: reputation ledger). */
export type TreatmentDimension = "service" | "pricing" | "support" | "incident" | "honesty";

/** ONE append-only treatment fact. "Level 3's shortcut is Level 9's
 *  deposition" (L6) works because quotes/summaries are STORED verbatim. */
export interface TreatmentEvent {
  readonly seq: number;
  readonly atTick: SimTick;
  readonly causeId: CauseRef;
  /** Entity ref: the customer book this was done TO/for. */
  readonly subject: EntityId;
  readonly dimension: TreatmentDimension;
  /** Signed −1..+1 (Fixed): kindness positive, shortcuts negative. */
  readonly valence: Fixed;
  /** Verbatim line a later deposition can quote (generated, not authored). */
  readonly summary: string;
  /** Museum provenance law: every fact names its run + seed. */
  readonly provenance: { readonly runId: EntityId; readonly runSeed: RunSeed };
}

/** T9 book-of-business row — THE query target. Named-customer cap 12 (L23). */
export interface CustomerBookRecord {
  readonly id: EntityId;
  readonly name: string;
  readonly plan: string;
  readonly mrrMicroUsd: MoneyUnit;
  readonly tenureMin: SimMinute;
  readonly termEndMin: SimMinute;
  readonly cohortId: string;
  /** Append-only treatment spine (one of the three unbounded lists). */
  readonly treatmentLog: readonly TreatmentEvent[];
  /** Cheap projection over treatmentLog (recomputed, never trusted over it). */
  readonly grudgeScore: Fixed;
  readonly referenceEligible: boolean;
  readonly status: "active" | "churned" | "won_back";
  readonly whaleShare: Fixed;
}

/** L6/U13 reputation — projection; breachHistory arrives at FILE v2 (the
 *  Appendix C prototype's literal "adds breach_history[] mid-save" migration). */
export interface ReputationState {
  readonly overall: Fixed;
  readonly domains: {
    readonly customerTrust: Fixed;
    readonly upstreamTrust: Fixed;
    readonly staffTrust: Fixed;
    readonly industry: Fixed;
  };
  readonly honestHostFloor: boolean;
  /** v2 facet: sim-ticks of trustworthiness (U22). */
  readonly breachHistoryTicks: readonly number[];
}

/** L11 credit grade — derived inputs AND effects, all stored as data. */
export interface CreditGradeState {
  /** Display gauge reading 0..850 (S-4 exempted domain, FICO-anchored). */
  readonly score: number;
  readonly factors: {
    readonly streak: Fixed;
    readonly docs: Fixed;
    readonly audits: Fixed;
    readonly diversification: Fixed;
  };
  readonly effects: {
    readonly interestRatio: Fixed;
    readonly vendorTermsDays: number;
    readonly insurancePremiumMicroUsd: MoneyUnit;
    readonly personalGuarantees: boolean;
  };
}

/** L12 valuation meta-stat. */
export interface TheMultipleState {
  readonly current: Fixed;
  readonly history: readonly { readonly atTick: SimTick; readonly value: Fixed }[];
  readonly factors: Readonly<Record<string, Fixed>>;
}

/** L13/§6.9 Attribution Ledger row — cause stamped AT CREATION, append-only
 *  ("the unretrofittable law": back-filling attribution is impossible here). */
export interface AttributionEvent {
  readonly seq: number;
  readonly effect: string;
  readonly magnitude: Fixed;
  readonly createdAtTick: SimTick;
  readonly causeEventRef: CauseRef;
}

/** Node-level record projections (cross-lineage ones live root globalRecords). */
export interface NodeRecords {
  readonly worstOutageSeconds: number;
  readonly longestPerfectStreak: number;
  readonly biggestCustomerMrrMicroUsd: MoneyUnit;
  readonly costliestMistakeMicroUsd: MoneyUnit;
}

export interface AnnualReportRef {
  readonly year: number;
  /** Derived artifacts are generate-on-write, store frozen (§2.1 lifetime c). */
  readonly artifactRef: string;
}

/** T7 capped finances slice (caps are per-mode — matrix governs writes). */
export interface FinancesSlice {
  readonly cashCapped: boolean;
  /** T7 "carry-over-but-thin" capped cash slice the child STARTS with.
   *  Written only through lineage.applyInheritanceManifest at campaign
   *  bootstrap (round-2 S-14) — spawn records the manifest, bootstrapping
   *  spends it; modes never mutate it mid-run (settlement law). */
  readonly cashMicroUsd: MoneyUnit;
  readonly mrrMicroUsd: MoneyUnit;
  readonly deferredRevenueMicroUsd: MoneyUnit;
  readonly runwayMin: SimMinute;
  readonly debt: readonly {
    readonly id: EntityId;
    readonly principalMicroUsd: MoneyUnit;
    readonly dueAtMin: SimMinute;
  }[];
}

/* ═══════════════════════ writable-but-not-face subsystems ═══════════════════════ */

/** U19/U38 runbook ladder. `mttrBonusMicroUsd`… no: MTTR bonus is µs.
 *  RUNBOOK_MTTR_BONUS_US is pure DATA — the decay formula is tuning
 *  (OD-2 pending), never computed here (task item 6). */
export interface PlaybookSlotRecord {
  readonly runbookId: string;
  /** Ladder rung 1..6. */
  readonly rung: number;
  readonly draftedByStaffId: EntityId | null;
  /** Hollow runbooks automate wrongly at 3am (U38); stale = binder fade. */
  readonly sealState: "hollow" | "drilled" | "stale";
  /** Only carried slots ride inheritance edges (≤8 slots, L3). */
  readonly carried: boolean;
  /** Knowledge-decay DATA: MTTR bonus this rung currently grants (µs). */
  readonly mttrBonusUs: number;
}

/** L4 wiki entry — onboarding-speed data: new hires onboard faster per
 *  entry. `binderFade` is the decay field (0 crisp … ≤1 unreadable). */
export interface WikiEntryRecord {
  readonly topic: string;
  readonly prose: string;
  readonly authorStaffId: EntityId | null;
  readonly lastVerifiedAtTick: SimTick;
  readonly fogState: "clear" | "hazy" | "forgotten";
  readonly binderFade: Fixed;
}

export interface AnticipationState {
  readonly tokensAvailable: number;
  readonly tokenSpends: readonly { readonly node: EntityId; readonly atTick: SimTick }[];
}

export interface ResearchQueueRecord {
  readonly node: EntityId;
  readonly slotsUsed: number;
  readonly progress: Fixed;
  readonly paused: boolean;
  readonly debtFinanced: boolean;
}

/** T6 legacy liability constraint card ("DO NOT DECOM — DNS STILL ON THIS"). */
export interface ConstraintCardRecord {
  readonly legacyObjectRef: string;
  readonly carriedLiability: string;
}

/** Museum exhibit registry — failure restarts NEVER destroy it (§2.5). */
export interface MuseumExhibitRecord {
  readonly id: EntityId;
  readonly sourceFacet: string;
  readonly sourceRef: string;
  readonly title: string;
  /** Provenance law: every exhibit names its run + seed. */
  readonly runId: EntityId;
  readonly runSeed: RunSeed;
  readonly acquiredAtTick: SimTick;
  /** Migrations keep removed mechanics' exhibits with deprecated: true so
   *  "the museum doesn't lose an exhibit" (Appendix C §2.4). */
  readonly deprecated: boolean;
  readonly memorialNote: string | null;
}

/** Policy Book snapshot ref — the rule book is state BY HASH (ARCHITECTURE
 *  §5 table); MySQL keeps version history, the save keeps the pin. */
export interface PolicyBookSnapshotRef {
  readonly ruleBookHash: HashHex;
  readonly versionRef: string;
}

/* ═══════════════════════ the node ═══════════════════════ */

/** One generation of the company lineage. All facets are writable storage;
 *  the four faces are compiled views over them (faces.ts). */
export interface CompanyNode {
  readonly id: EntityId;
  readonly parentId: EntityId | null;
  readonly succession: Succession;
  readonly identity: NodeIdentity;
  /** Ratified decision #6: tier reached on the 7-tier ladder. */
  readonly tierReached: number;
  readonly goalCard: GoalCardState;
  readonly doctrine: DoctrineState;
  readonly calendar: NodeCalendar;
  readonly policyBook: PolicyBookSnapshotRef;

  // PEOPLE
  readonly staff: readonly StaffRecord[];
  readonly alumni: readonly AlumniRecord[];
  readonly spineCast: readonly SpineCastRecord[];
  readonly culture: Fixed;
  readonly orgDrag: Fixed; // derived-but-stored display value (§1.1 axis)

  // SCRAPBOOK
  readonly scars: readonly ScarRecord[];
  readonly scarsRetired: readonly RetiredScarRecord[];
  readonly postmortems: readonly PostmortemRecord[];
  readonly ghosts: readonly GhostRecord[];
  readonly habits: HabitCounters;
  readonly deadDrives: readonly DeadDriveRecord[];
  readonly hardware: readonly HardwareBiography[];
  readonly unlockDraftsPassed: readonly PassedUnlockDraft[];
  readonly lifetimeCostOfLessonsMicroUsd: MoneyUnit;

  // WALL
  readonly nodesUnlocked: readonly NodeUnlockRecord[];
  readonly credentials: readonly CredentialRecord[];
  readonly medals: readonly MedalRecord[];
  readonly linesEverRun: readonly LineEverRunRecord[];
  readonly codex: Readonly<Record<string, CodexEntry>>;

  // ALMANAC
  readonly customerBooks: readonly CustomerBookRecord[];
  readonly reputation: ReputationState;
  readonly creditGrade: CreditGradeState;
  readonly theMultiple: TheMultipleState;
  readonly attributionEvents: readonly AttributionEvent[];
  readonly records: NodeRecords;
  readonly annualReports: readonly AnnualReportRef[];
  readonly benchmarksContextRef: string | null;
  readonly finances: FinancesSlice;

  // writable-not-face subsystems
  readonly playbook: readonly PlaybookSlotRecord[];
  readonly wiki: readonly WikiEntryRecord[];
  readonly anticipation: AnticipationState;
  readonly researchQueue: readonly ResearchQueueRecord[];
  readonly constraintCards: readonly ConstraintCardRecord[];
  readonly museum: readonly MuseumExhibitRecord[];
}

/* ═══════════════════════ bounds (size discipline constants) ═══════════════════════ */

export const SCAR_ACTIVE_CAP = 3 as const;
export const PLAYBOOK_CARRY_CAP = 8 as const;
export const NAMED_CUSTOMER_CAP = 12 as const;
export const RUNG_MIN = 1 as const;
export const RUNG_MAX = 6 as const;

/* Display-domain bounds (round-2 S-4): the ONLY legal plain-number domains. */
/** scars[].clearance.progress and nodesUnlocked[].faded live here. */
export const UNIT_FRACTION_MIN = 0 as const;
export const UNIT_FRACTION_MAX = 1 as const;
/** creditGrade.score: 0 = unrated … 850 = perfect (FICO-anchored gauge). */
export const CREDIT_SCORE_MIN = 0 as const;
export const CREDIT_SCORE_MAX = 850 as const;

/* ═══════════════════════ factories (trusted internal state by construction) ═══════════════════════ */

export function emptyHabits(): HabitCounters {
  return {
    docRate: 0n,
    standardizationRate: 0n,
    snowflakesLeft: 0,
    overPermissionCount: 0,
    debtPayoffLatencyMin: 0,
  };
}

export function emptyReputation(): ReputationState {
  return {
    overall: 0n,
    domains: { customerTrust: 0n, upstreamTrust: 0n, staffTrust: 0n, industry: 0n },
    honestHostFloor: false,
    breachHistoryTicks: [],
  };
}

export function emptyCreditGrade(): CreditGradeState {
  return {
    score: 0,
    factors: { streak: 0n, docs: 0n, audits: 0n, diversification: 0n },
    effects: { interestRatio: 0n, vendorTermsDays: 0, insurancePremiumMicroUsd: asMoney(0n), personalGuarantees: false },
  };
}

export function emptyMultiple(): TheMultipleState {
  return { current: 0n, history: [], factors: {} };
}

export function emptyRecords(): NodeRecords {
  return { worstOutageSeconds: 0, longestPerfectStreak: 0, biggestCustomerMrrMicroUsd: asMoney(0n), costliestMistakeMicroUsd: asMoney(0n) };
}

export function emptyFinances(): FinancesSlice {
  return { cashCapped: false, cashMicroUsd: asMoney(0n), mrrMicroUsd: asMoney(0n), deferredRevenueMicroUsd: asMoney(0n), runwayMin: 0, debt: [] };
}

export function emptyAnticipation(): AnticipationState {
  return { tokensAvailable: 0, tokenSpends: [] };
}

export interface NewNodeOptions {
  readonly id: string;
  readonly parentId: string | null;
  readonly name: string;
  readonly mark?: string;
  readonly eraOrigin: string;
  readonly foundedAtTick: SimTick;
  readonly successionType: SuccessionType;
  readonly exitKind?: string | null;
  readonly status?: NodeStatus;
}

/** Fresh node with every facet at its empty-but-typed default. */
export function newCompanyNode(options: NewNodeOptions): CompanyNode {
  if (options.id.length === 0) fail("newCompanyNode: empty node id");
  return {
    id: asEntityId(options.id),
    parentId: options.parentId === null ? null : asEntityId(options.parentId),
    succession: { type: options.successionType, exitKind: options.exitKind ?? null },
    identity: {
      name: options.name,
      mark: options.mark ?? "",
      foundedAtTick: options.foundedAtTick,
      eraOrigin: options.eraOrigin,
      status: options.status ?? "active",
    },
    tierReached: 0,
    goalCard: { declared: null, rechoiceCount: 0, chapter: 0 },
    doctrine: { perAct: [], current: null },
    calendar: { monthBoundaryTick: 0n, seasonalityPhase: "none" },
    policyBook: { ruleBookHash: "", versionRef: "" },
    staff: [],
    alumni: [],
    spineCast: [],
    culture: 0n,
    orgDrag: 0n,
    scars: [],
    scarsRetired: [],
    postmortems: [],
    ghosts: [],
    habits: emptyHabits(),
    deadDrives: [],
    hardware: [],
    unlockDraftsPassed: [],
    lifetimeCostOfLessonsMicroUsd: asMoney(0n),
    nodesUnlocked: [],
    credentials: [],
    medals: [],
    linesEverRun: [],
    codex: {},
    customerBooks: [],
    reputation: emptyReputation(),
    creditGrade: emptyCreditGrade(),
    theMultiple: emptyMultiple(),
    attributionEvents: [],
    records: emptyRecords(),
    annualReports: [],
    benchmarksContextRef: null,
    finances: emptyFinances(),
    playbook: [],
    wiki: [],
    anticipation: emptyAnticipation(),
    researchQueue: [],
    constraintCards: [],
    museum: [],
  };
}

/* ═══════════════════════ facet ops (pure — return new nodes) ═══════════════════════ */

/** T8 three-floor rule: scar cap governs ACTIVE slots only; the 4th scar
 *  retires the oldest to immortal history (never deletes). */
export function addScar(node: CompanyNode, scar: ScarRecord): CompanyNode {
  const overflow = [scar, ...node.scars];
  const active = overflow.slice(0, SCAR_ACTIVE_CAP);
  const demoted = overflow.slice(SCAR_ACTIVE_CAP);
  const retiredRows: readonly RetiredScarRecord[] = demoted.map((old) => ({
    id: old.id,
    replacedBy: scar.id,
    memorial: true,
    retiredAtTick: scar.acquiredAtTick,
  }));
  return { ...node, scars: active, scarsRetired: [...node.scarsRetired, ...retiredRows] };
}

/** Append an attribution row — cause stamped at creation, seq monotonic. */
export function appendAttribution(node: CompanyNode, effect: string, magnitude: Fixed, createdAtTick: SimTick, causeEventRef: CauseRef): CompanyNode {
  const seq = node.attributionEvents.length;
  return { ...node, attributionEvents: [...node.attributionEvents, { seq, effect, magnitude, createdAtTick, causeEventRef }] };
}

/* ═══════════════════════ boundary parse (Law 2 + Law 4) ═══════════════════════ */

type Dict = Record<string, unknown>;

function asDict(value: unknown, where: string): Dict {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(`${where}: expected object`);
  return value as Dict;
}

function asStr(value: unknown, where: string): string {
  if (typeof value !== "string") fail(`${where}: expected string, got ${typeof value}`);
  return value;
}

function asNum(value: unknown, where: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) fail(`${where}: expected finite number`);
  // S-4c: -0 never enters display state — it would serialize "0" yet stay
  // Object.is-distinct, seeding phantom diffs in recomputed digests.
  return Object.is(value, -0) ? 0 : value;
}

function asInt(value: unknown, where: string): number {
  const n = asNum(value, where);
  // Header law: every non-exempt number leaf is a SAFE integer — an integer
  // beyond 2^53 has already lost precision on the wire, so it is illegal.
  if (!Number.isSafeInteger(n)) fail(`${where}: expected safe integer`);
  return n;
}

/** S-4: an exempted display-domain fraction — normalized 0..1 (scale-safe). */
function asUnitFraction(value: unknown, where: string): number {
  const n = asNum(value, where);
  if (n < UNIT_FRACTION_MIN || n > UNIT_FRACTION_MAX) {
    fail(`${where}: ${n} outside display fraction ${UNIT_FRACTION_MIN}..${UNIT_FRACTION_MAX}`);
  }
  return n;
}

/** S-4: rack-grid coordinate — burned positions are whole cells. */
function asGridCoord(value: unknown, where: string): number {
  const n = asNum(value, where);
  if (!Number.isSafeInteger(n)) fail(`${where}: ${n} is not a safe-integer grid coordinate`);
  return n;
}

/** S-4: credit gauge reading — bounded display domain. */
function asCreditScore(value: unknown, where: string): number {
  const n = asNum(value, where);
  if (n < CREDIT_SCORE_MIN || n > CREDIT_SCORE_MAX) {
    fail(`${where}: ${n} outside credit score ${CREDIT_SCORE_MIN}..${CREDIT_SCORE_MAX}`);
  }
  return n;
}

/** Bigints MUST arrive as real bigint (canonical decode). A string here means
 *  someone JSON.parse'd a raw dump — fail loud, never coerce (Law 4). */
function asBig(value: unknown, where: string): bigint {
  if (typeof value !== "bigint") fail(`${where}: expected bigint (use fromCanonicalJson, not JSON.parse)`);
  return value;
}

/** Money arrives bigint, brands at the boundary (Law 2). */
function asMoneyBig(value: unknown, where: string): MoneyUnit {
  return asMoney(asBig(value, where));
}

function asSeedBig(value: unknown, where: string): RunSeed {
  return asRunSeed(asBig(value, where));
}

function asBool(value: unknown, where: string): boolean {
  if (typeof value !== "boolean") fail(`${where}: expected boolean`);
  return value;
}

function asArr(value: unknown, where: string): unknown[] {
  if (!Array.isArray(value)) fail(`${where}: expected array`);
  return value;
}

function asId(value: unknown, where: string): EntityId {
  return asEntityId(asStr(value, where));
}

function asIdOrNull(value: unknown, where: string): EntityId | null {
  return value === null ? null : asId(value, where);
}

function asTickOrNull(value: unknown, where: string): SimTick | null {
  return value === null ? null : asBig(value, where);
}

const SUCCESSON_TYPES: readonly string[] = ["found", "exit", "failure_restart", "npc_pivot"];
const NODE_STATUSES: readonly string[] = ["active", "retired", "retired_npc"];
const UNLOCK_VIAS: readonly string[] = ["scar", "foresight", "testimony", "anticipation", "milestone", "era", "acquisition"];
const TREATMENT_DIMENSIONS: readonly string[] = ["service", "pricing", "support", "incident", "honesty"];

function asEnum(value: unknown, allowed: readonly string[], where: string): string {
  const s = asStr(value, where);
  if (!allowed.includes(s)) fail(`${where}: "${s}" not in {${allowed.join("|")}}`);
  return s;
}

export function parseDoctrine(value: unknown, where: string): DoctrineEntry {
  const d = asDict(value, where);
  return { id: asId(requireDefined(d.id, `${where}.id`), `${where}.id`), textRef: asStr(d.textRef, `${where}.textRef`), adoptedAtTick: asBig(d.adoptedAtTick, `${where}.adoptedAtTick`) };
}

function parseTreatmentEvent(value: unknown, where: string): TreatmentEvent {
  const d = asDict(value, where);
  const seq = asInt(d.seq, `${where}.seq`);
  if (seq < 0) fail(`${where}.seq must be ≥ 0`);
  const provenance = asDict(requireDefined(d.provenance, `${where}.provenance`), `${where}.provenance`);
  return {
    seq,
    atTick: asBig(d.atTick, `${where}.atTick`),
    causeId: asStr(d.causeId, `${where}.causeId`),
    subject: asId(requireDefined(d.subject, `${where}.subject`), `${where}.subject`),
    dimension: asEnum(d.dimension, TREATMENT_DIMENSIONS, `${where}.dimension`) as TreatmentDimension,
    valence: asBig(d.valence, `${where}.valence`),
    summary: asStr(d.summary, `${where}.summary`),
    provenance: { runId: asId(requireDefined(provenance.runId, `${where}.provenance.runId`), `${where}.provenance.runId`), runSeed: asSeedBig(provenance.runSeed, `${where}.provenance.runSeed`) },
  };
}

function parseCustomerBook(value: unknown, where: string): CustomerBookRecord {
  const d = asDict(value, where);
  const log = asArr(d.treatmentLog, `${where}.treatmentLog`).map((e, i) => parseTreatmentEvent(e, `${where}.treatmentLog[${i}]`));
  for (let i = 1; i < log.length; i += 1) {
    const prev = requireDefined(log[i - 1], `${where}.treatmentLog[${i - 1}]`);
    const cur = requireDefined(log[i], `${where}.treatmentLog[${i}]`);
    if (cur.seq !== prev.seq + 1) fail(`${where}.treatmentLog: seq not monotonic at index ${i}`);
  }
  return {
    id: asId(requireDefined(d.id, `${where}.id`), `${where}.id`),
    name: asStr(d.name, `${where}.name`),
    plan: asStr(d.plan, `${where}.plan`),
    mrrMicroUsd: asMoneyBig(d.mrrMicroUsd, `${where}.mrrMicroUsd`),
    tenureMin: asInt(d.tenureMin, `${where}.tenureMin`),
    termEndMin: asInt(d.termEndMin, `${where}.termEndMin`),
    cohortId: asStr(d.cohortId, `${where}.cohortId`),
    treatmentLog: log,
    grudgeScore: asBig(d.grudgeScore, `${where}.grudgeScore`),
    referenceEligible: asBool(d.referenceEligible, `${where}.referenceEligible`),
    status: asEnum(d.status, ["active", "churned", "won_back"], `${where}.status`) as CustomerBookRecord["status"],
    whaleShare: asBig(d.whaleShare, `${where}.whaleShare`),
  };
}

function parseScar(value: unknown, where: string): ScarRecord {
  const d = asDict(value, where);
  const clearance = asDict(requireDefined(d.clearance, `${where}.clearance`), `${where}.clearance`);
  const grantRaw = d.payoffGrant;
  let payoffGrant: ScarRecord["payoffGrant"] = null;
  if (grantRaw !== null && grantRaw !== undefined) {
    const g = asDict(grantRaw, `${where}.payoffGrant`);
    payoffGrant = { node: asId(requireDefined(g.node, `${where}.payoffGrant.node`), `${where}.payoffGrant.node`), failureOnly: asBool(g.failureOnly, `${where}.payoffGrant.failureOnly`), discountRatio: g.discountRatio === null ? null : asBig(g.discountRatio, `${where}.payoffGrant.discountRatio`) };
  }
  const mapRaw = d.mapPosition;
  let mapPosition: ScarRecord["mapPosition"] = null;
  if (mapRaw !== null && mapRaw !== undefined) {
    const m = asDict(mapRaw, `${where}.mapPosition`);
    mapPosition = { x: asGridCoord(m.x, `${where}.mapPosition.x`), y: asGridCoord(m.y, `${where}.mapPosition.y`) };
  }
  return {
    id: asId(requireDefined(d.id, `${where}.id`), `${where}.id`),
    originEventRef: asStr(d.originEventRef, `${where}.originEventRef`),
    acquiredAtTick: asBig(d.acquiredAtTick, `${where}.acquiredAtTick`),
    modifierPayload: asDict(d.modifierPayload ?? {}, `${where}.modifierPayload`),
    clearance: { rule: asEnum(clearance.rule, ["90_clean_days", "audit_passed"], `${where}.clearance.rule`) as ScarRecord["clearance"]["rule"], progress: asUnitFraction(clearance.progress, `${where}.clearance.progress`) },
    disclosure: asEnum(d.disclosure, ["disclosed", "concealed"], `${where}.disclosure`) as ScarRecord["disclosure"],
    payoffGrant,
    mapPosition,
  };
}

function parseNodeUnlock(value: unknown, where: string): NodeUnlockRecord {
  const d = asDict(value, where);
  return {
    node: asId(requireDefined(d.node, `${where}.node`), `${where}.node`),
    via: asEnum(d.via, UNLOCK_VIAS, `${where}.via`) as UnlockVia,
    scarRef: asIdOrNull(d.scarRef ?? null, `${where}.scarRef`),
    incidentRef: d.incidentRef === null || d.incidentRef === undefined ? null : asStr(d.incidentRef, `${where}.incidentRef`),
    stamp: d.stamp === null || d.stamp === undefined ? null : asEnum(d.stamp, ["learned_hard_way"], `${where}.stamp`) as "learned_hard_way",
    stampAtTick: asTickOrNull(d.stampAtTick ?? null, `${where}.stampAtTick`),
    handwritingOwnerStaffId: asIdOrNull(d.handwritingOwnerStaffId ?? null, `${where}.handwritingOwnerStaffId`),
    faded: asUnitFraction(d.faded, `${where}.faded`),
  };
}

export function parsePlaybookSlot(value: unknown, where: string): PlaybookSlotRecord {
  const d = asDict(value, where);
  const rung = asInt(d.rung, `${where}.rung`);
  if (rung < RUNG_MIN || rung > RUNG_MAX) fail(`${where}.rung: ${rung} outside ladder ${RUNG_MIN}..${RUNG_MAX}`);
  return {
    runbookId: asStr(d.runbookId, `${where}.runbookId`),
    rung,
    draftedByStaffId: asIdOrNull(d.draftedByStaffId ?? null, `${where}.draftedByStaffId`),
    sealState: asEnum(d.sealState, ["hollow", "drilled", "stale"], `${where}.sealState`) as PlaybookSlotRecord["sealState"],
    carried: asBool(d.carried, `${where}.carried`),
    mttrBonusUs: asInt(d.mttrBonusUs, `${where}.mttrBonusUs`),
  };
}

function parseWikiEntry(value: unknown, where: string): WikiEntryRecord {
  const d = asDict(value, where);
  return {
    topic: asStr(d.topic, `${where}.topic`),
    prose: asStr(d.prose, `${where}.prose`),
    authorStaffId: asIdOrNull(d.authorStaffId ?? null, `${where}.authorStaffId`),
    lastVerifiedAtTick: asBig(d.lastVerifiedAtTick, `${where}.lastVerifiedAtTick`),
    fogState: asEnum(d.fogState, ["clear", "hazy", "forgotten"], `${where}.fogState`) as WikiEntryRecord["fogState"],
    binderFade: asBig(d.binderFade, `${where}.binderFade`),
  };
}

function parseMuseumExhibit(value: unknown, where: string): MuseumExhibitRecord {
  const d = asDict(value, where);
  return {
    id: asId(requireDefined(d.id, `${where}.id`), `${where}.id`),
    sourceFacet: asStr(d.sourceFacet, `${where}.sourceFacet`),
    sourceRef: asStr(d.sourceRef, `${where}.sourceRef`),
    title: asStr(d.title, `${where}.title`),
    runId: asId(requireDefined(d.runId, `${where}.runId`), `${where}.runId`),
    runSeed: asSeedBig(d.runSeed, `${where}.runSeed`),
    acquiredAtTick: asBig(d.acquiredAtTick, `${where}.acquiredAtTick`),
    deprecated: asBool(d.deprecated, `${where}.deprecated`),
    memorialNote: d.memorialNote === null || d.memorialNote === undefined ? null : asStr(d.memorialNote, `${where}.memorialNote`),
  };
}

/** Strict boundary parse of one CompanyNode (Law 2). Load-bearing facets
 *  (treatment log, scars, playbook, wiki, museum, unlocks) get element-level
 *  checks; display-leaf records are shape-checked at first level — per-facet
 *  JSON leaves are never query surface (Appendix C stack verdict). */
export function parseCompanyNode(value: unknown, where = "node"): CompanyNode {
  const d = asDict(value, where);
  const identity = asDict(requireDefined(d.identity, `${where}.identity`), `${where}.identity`);
  const succession = asDict(requireDefined(d.succession, `${where}.succession`), `${where}.succession`);
  const goalCard = asDict(requireDefined(d.goalCard, `${where}.goalCard`), `${where}.goalCard`);
  const doctrine = asDict(requireDefined(d.doctrine, `${where}.doctrine`), `${where}.doctrine`);
  const calendar = asDict(requireDefined(d.calendar, `${where}.calendar`), `${where}.calendar`);
  const policyBook = asDict(requireDefined(d.policyBook, `${where}.policyBook`), `${where}.policyBook`);
  const habits = asDict(requireDefined(d.habits, `${where}.habits`), `${where}.habits`);
  const reputation = asDict(requireDefined(d.reputation, `${where}.reputation`), `${where}.reputation`);
  const repDomains = asDict(requireDefined(reputation.domains, `${where}.reputation.domains`), `${where}.reputation.domains`);
  const creditGrade = asDict(requireDefined(d.creditGrade, `${where}.creditGrade`), `${where}.creditGrade`);
  const cgFactors = asDict(requireDefined(creditGrade.factors, `${where}.creditGrade.factors`), `${where}.creditGrade.factors`);
  const cgEffects = asDict(requireDefined(creditGrade.effects, `${where}.creditGrade.effects`), `${where}.creditGrade.effects`);
  const theMultiple = asDict(requireDefined(d.theMultiple, `${where}.theMultiple`), `${where}.theMultiple`);
  const records = asDict(requireDefined(d.records, `${where}.records`), `${where}.records`);
  const finances = asDict(requireDefined(d.finances, `${where}.finances`), `${where}.finances`);
  const anticipation = asDict(requireDefined(d.anticipation, `${where}.anticipation`), `${where}.anticipation`);

  const scars = asArr(d.scars, `${where}.scars`).map((s, i) => parseScar(s, `${where}.scars[${i}]`));
  if (scars.length > SCAR_ACTIVE_CAP) fail(`${where}.scars: ${scars.length} exceeds active cap ${SCAR_ACTIVE_CAP}`);
  const customerBooks = asArr(d.customerBooks, `${where}.customerBooks`).map((c, i) => parseCustomerBook(c, `${where}.customerBooks[${i}]`));
  if (customerBooks.length > NAMED_CUSTOMER_CAP) fail(`${where}.customerBooks: ${customerBooks.length} exceeds named-customer cap ${NAMED_CUSTOMER_CAP}`);

  const node: CompanyNode = {
    id: asId(requireDefined(d.id, `${where}.id`), `${where}.id`),
    parentId: asIdOrNull(d.parentId ?? null, `${where}.parentId`),
    succession: {
      type: asEnum(succession.type, SUCCESSON_TYPES, `${where}.succession.type`) as SuccessionType,
      exitKind: succession.exitKind === null || succession.exitKind === undefined ? null : asStr(succession.exitKind, `${where}.succession.exitKind`),
    },
    identity: {
      name: asStr(identity.name, `${where}.identity.name`),
      mark: asStr(identity.mark ?? "", `${where}.identity.mark`),
      foundedAtTick: asBig(identity.foundedAtTick, `${where}.identity.foundedAtTick`),
      eraOrigin: asStr(identity.eraOrigin, `${where}.identity.eraOrigin`),
      status: asEnum(identity.status, NODE_STATUSES, `${where}.identity.status`) as NodeStatus,
    },
    tierReached: asInt(d.tierReached, `${where}.tierReached`),
    goalCard: {
      declared: goalCard.declared === null || goalCard.declared === undefined ? null : asStr(goalCard.declared, `${where}.goalCard.declared`),
      rechoiceCount: asInt(goalCard.rechoiceCount, `${where}.goalCard.rechoiceCount`),
      chapter: asInt(goalCard.chapter, `${where}.goalCard.chapter`),
    },
    doctrine: {
      perAct: asArr(doctrine.perAct, `${where}.doctrine.perAct`).map((e, i) => parseDoctrine(e, `${where}.doctrine.perAct[${i}]`)),
      current: doctrine.current === null || doctrine.current === undefined ? null : parseDoctrine(doctrine.current, `${where}.doctrine.current`),
    },
    calendar: {
      monthBoundaryTick: asBig(calendar.monthBoundaryTick, `${where}.calendar.monthBoundaryTick`),
      seasonalityPhase: asStr(calendar.seasonalityPhase, `${where}.calendar.seasonalityPhase`),
    },
    policyBook: {
      ruleBookHash: asStr(policyBook.ruleBookHash, `${where}.policyBook.ruleBookHash`),
      versionRef: asStr(policyBook.versionRef ?? "", `${where}.policyBook.versionRef`),
    },
    staff: asArr(d.staff, `${where}.staff`).map((s, i) => parseStaff(s, `${where}.staff[${i}]`)),
    alumni: asArr(d.alumni, `${where}.alumni`).map((a, i) => parseAlumni(a, `${where}.alumni[${i}]`)),
    spineCast: asArr(d.spineCast, `${where}.spineCast`).map((c, i) => parseSpineCast(c, `${where}.spineCast[${i}]`)),
    culture: asBig(d.culture, `${where}.culture`),
    orgDrag: asBig(d.orgDrag ?? 0n, `${where}.orgDrag`),
    scars,
    scarsRetired: asArr(d.scarsRetired, `${where}.scarsRetired`).map((s, i) => {
      const r = asDict(s, `${where}.scarsRetired[${i}]`);
      return { id: asId(requireDefined(r.id, "id"), "id"), replacedBy: asIdOrNull(r.replacedBy ?? null, "replacedBy"), memorial: asBool(r.memorial, "memorial"), retiredAtTick: asBig(r.retiredAtTick, "retiredAtTick") };
    }),
    postmortems: asArr(d.postmortems, `${where}.postmortems`).map((p, i) => {
      const r = asDict(p, `${where}.postmortems[${i}]`);
      return {
        polaroidRef: asStr(r.polaroidRef, "polaroidRef"), rootCause: asStr(r.rootCause, "rootCause"), correct: asBool(r.correct, "correct"),
        costBreakdownMicroUsd: asMoneyBig(r.costBreakdownMicroUsd, "costBreakdownMicroUsd"), blameMode: asStr(r.blameMode, "blameMode"),
        published: asBool(r.published, "published"), unlocks: asArr(r.unlocks, "unlocks").map((u, j) => asId(u, `unlocks[${j}]`)),
      };
    }),
    ghosts: asArr(d.ghosts, `${where}.ghosts`).map((g, i) => {
      const r = asDict(g, `${where}.ghosts[${i}]`);
      return { customerId: asId(requireDefined(r.customerId, "customerId"), "customerId"), exitQuote: asStr(r.exitQuote, "exitQuote"), voice: asStr(r.voice, "voice"), cause: asStr(r.cause, "cause"), repaired: asBool(r.repaired, "repaired") };
    }),
    habits: {
      docRate: asBig(habits.docRate, `${where}.habits.docRate`),
      standardizationRate: asBig(habits.standardizationRate, `${where}.habits.standardizationRate`),
      snowflakesLeft: asInt(habits.snowflakesLeft, `${where}.habits.snowflakesLeft`),
      overPermissionCount: asInt(habits.overPermissionCount, `${where}.habits.overPermissionCount`),
      debtPayoffLatencyMin: asInt(habits.debtPayoffLatencyMin, `${where}.habits.debtPayoffLatencyMin`),
    },
    deadDrives: asArr(d.deadDrives, `${where}.deadDrives`).map((row, i) => {
      const r = asDict(row, `${where}.deadDrives[${i}]`);
      return { serial: asStr(r.serial, "serial"), deathAtTick: asBig(r.deathAtTick, "deathAtTick"), cause: asStr(r.cause, "cause") };
    }),
    hardware: asArr(d.hardware, `${where}.hardware`).map((row, i) => {
      const r = asDict(row, `${where}.hardware[${i}]`);
      return {
        id: asId(requireDefined(r.id, "id"), "id"), kind: asStr(r.kind, "kind"), model: asStr(r.model, "model"), serial: asStr(r.serial, "serial"),
        installedAtTick: asBig(r.installedAtTick, "installedAtTick"), retiredAtTick: asTickOrNull(r.retiredAtTick ?? null, "retiredAtTick"),
        rackRef: r.rackRef === null || r.rackRef === undefined ? null : asStr(r.rackRef, "rackRef"),
        events: asArr(r.events, "events").map((ev, j) => {
          const e = asDict(ev, `events[${j}]`);
          return { atTick: asBig(e.atTick, "atTick"), note: asStr(e.note, "note") };
        }),
      };
    }),
    unlockDraftsPassed: asArr(d.unlockDraftsPassed, `${where}.unlockDraftsPassed`).map((row, i) => {
      const r = asDict(row, `${where}.unlockDraftsPassed[${i}]`);
      return { node: asId(requireDefined(r.node, "node"), "node"), draftId: asStr(r.draftId, "draftId") };
    }),
    lifetimeCostOfLessonsMicroUsd: asMoneyBig(d.lifetimeCostOfLessonsMicroUsd, `${where}.lifetimeCostOfLessonsMicroUsd`),
    nodesUnlocked: asArr(d.nodesUnlocked, `${where}.nodesUnlocked`).map((u, i) => parseNodeUnlock(u, `${where}.nodesUnlocked[${i}]`)),
    credentials: asArr(d.credentials, `${where}.credentials`).map((c, i) => {
      const r = asDict(c, `${where}.credentials[${i}]`);
      return {
        kind: asEnum(r.kind, ["ASN", "ICANN", "SOC2_I", "PCI", "HIPAA", "FedRAMP", "TierIII", "merchant", "utility_kw", "gpu_alloc"], "kind") as CredentialKind,
        grantedAtTick: asBig(r.grantedAtTick, "grantedAtTick"), requiresCleanDays: asInt(r.requiresCleanDays, "requiresCleanDays"),
        expiryAtTick: asTickOrNull(r.expiryAtTick ?? null, "expiryAtTick"), revoked: asBool(r.revoked, "revoked"),
        revocationCause: r.revocationCause === null || r.revocationCause === undefined ? null : asStr(r.revocationCause, "revocationCause"),
        frameState: asEnum(r.frameState, ["crisp", "dusty", "crooked"], "frameState") as CredentialRecord["frameState"],
      };
    }),
    medals: asArr(d.medals, `${where}.medals`).map((m, i) => {
      const r = asDict(m, `${where}.medals[${i}]`);
      return { kind: asStr(r.kind, "kind"), levelRef: asStr(r.levelRef, "levelRef"), atTick: asBig(r.atTick, "atTick") };
    }),
    linesEverRun: asArr(d.linesEverRun, `${where}.linesEverRun`).map((l, i) => {
      const r = asDict(l, `${where}.linesEverRun[${i}]`);
      return {
        type: asStr(r.type, "type"), launchedAtTick: asBig(r.launchedAtTick, "launchedAtTick"), retiredAtTick: asTickOrNull(r.retiredAtTick ?? null, "retiredAtTick"),
        placardState: asEnum(r.placardState, ["intact", "divested_faced_wall", "cracked"], "placardState") as LineEverRunRecord["placardState"],
        distillateGranted: asBool(r.distillateGranted, "distillateGranted"), nameplateData: asStr(r.nameplateData, "nameplateData"),
      };
    }),
    codex: (() => {
      const src = asDict(d.codex ?? {}, `${where}.codex`);
      const out: Record<string, CodexEntry> = {};
      for (const [threatId, raw] of Object.entries(src)) {
        const c = asDict(raw, `${where}.codex.${threatId}`);
        out[threatId] = {
          stage: asEnum(c.stage, ["seen", "analyzed", "countered", "mastered"], "stage") as CodexEntry["stage"],
          personalRecord: asStr(c.personalRecord, "personalRecord"),
          lifetimeCostMicroUsd: asMoneyBig(c.lifetimeCostMicroUsd, "lifetimeCostMicroUsd"),
          counteredWith: asArr(c.counteredWith, "counteredWith").map((s) => asStr(s, "counteredWith entry")),
          silhouettesUnlocked: asArr(c.silhouettesUnlocked, "silhouettesUnlocked").map((s) => asStr(s, "silhouettesUnlocked entry")),
        };
      }
      return out;
    })(),
    customerBooks,
    reputation: {
      overall: asBig(reputation.overall, `${where}.reputation.overall`),
      domains: {
        customerTrust: asBig(repDomains.customerTrust, "domains.customerTrust"),
        upstreamTrust: asBig(repDomains.upstreamTrust, "domains.upstreamTrust"),
        staffTrust: asBig(repDomains.staffTrust, "domains.staffTrust"),
        industry: asBig(repDomains.industry, "domains.industry"),
      },
      honestHostFloor: asBool(reputation.honestHostFloor, `${where}.reputation.honestHostFloor`),
      breachHistoryTicks: asArr(reputation.breachHistoryTicks, `${where}.reputation.breachHistoryTicks`).map((t, i) => asInt(t, `breachHistoryTicks[${i}]`)),
    },
    creditGrade: {
      score: asCreditScore(creditGrade.score, `${where}.creditGrade.score`),
      factors: {
        streak: asBig(cgFactors.streak, "factors.streak"), docs: asBig(cgFactors.docs, "factors.docs"),
        audits: asBig(cgFactors.audits, "factors.audits"), diversification: asBig(cgFactors.diversification, "factors.diversification"),
      },
      effects: {
        interestRatio: asBig(cgEffects.interestRatio, "effects.interestRatio"), vendorTermsDays: asInt(cgEffects.vendorTermsDays, "effects.vendorTermsDays"),
        insurancePremiumMicroUsd: asMoneyBig(cgEffects.insurancePremiumMicroUsd, "effects.insurancePremiumMicroUsd"), personalGuarantees: asBool(cgEffects.personalGuarantees, "effects.personalGuarantees"),
      },
    },
    theMultiple: {
      current: asBig(theMultiple.current, `${where}.theMultiple.current`),
      history: asArr(theMultiple.history, `${where}.theMultiple.history`).map((h, i) => {
        const r = asDict(h, `history[${i}]`);
        return { atTick: asBig(r.atTick, "atTick"), value: asBig(r.value, "value") };
      }),
      factors: (() => {
        const src = asDict(theMultiple.factors ?? {}, "factors");
        const out: Record<string, Fixed> = {};
        for (const [k, v] of Object.entries(src)) out[k] = asBig(v, `factors.${k}`);
        return out;
      })(),
    },
    attributionEvents: asArr(d.attributionEvents, `${where}.attributionEvents`).map((a, i) => {
      const r = asDict(a, `${where}.attributionEvents[${i}]`);
      return { seq: asInt(r.seq, "seq"), effect: asStr(r.effect, "effect"), magnitude: asBig(r.magnitude, "magnitude"), createdAtTick: asBig(r.createdAtTick, "createdAtTick"), causeEventRef: asStr(r.causeEventRef, "causeEventRef") };
    }),
    records: {
      worstOutageSeconds: asInt(records.worstOutageSeconds, "worstOutageSeconds"),
      longestPerfectStreak: asInt(records.longestPerfectStreak, "longestPerfectStreak"),
      biggestCustomerMrrMicroUsd: asMoneyBig(records.biggestCustomerMrrMicroUsd, "biggestCustomerMrrMicroUsd"),
      costliestMistakeMicroUsd: asMoneyBig(records.costliestMistakeMicroUsd, "costliestMistakeMicroUsd"),
    },
    annualReports: asArr(d.annualReports, `${where}.annualReports`).map((a, i) => {
      const r = asDict(a, `annualReports[${i}]`);
      return { year: asInt(r.year, "year"), artifactRef: asStr(r.artifactRef, "artifactRef") };
    }),
    benchmarksContextRef: d.benchmarksContextRef === null || d.benchmarksContextRef === undefined ? null : asStr(d.benchmarksContextRef, `${where}.benchmarksContextRef`),
    finances: {
      cashCapped: asBool(finances.cashCapped, "cashCapped"),
      cashMicroUsd: asMoneyBig(finances.cashMicroUsd, "finances.cashMicroUsd"),
      mrrMicroUsd: asMoneyBig(finances.mrrMicroUsd, "mrrMicroUsd"),
      deferredRevenueMicroUsd: asMoneyBig(finances.deferredRevenueMicroUsd, "deferredRevenueMicroUsd"),
      runwayMin: asInt(finances.runwayMin, "runwayMin"),
      debt: asArr(finances.debt, "debt").map((row, i) => {
        const r = asDict(row, `debt[${i}]`);
        return { id: asId(requireDefined(r.id, "id"), "id"), principalMicroUsd: asMoneyBig(r.principalMicroUsd, "principalMicroUsd"), dueAtMin: asInt(r.dueAtMin, "dueAtMin") };
      }),
    },
    playbook: asArr(d.playbook, `${where}.playbook`).map((p, i) => parsePlaybookSlot(p, `${where}.playbook[${i}]`)),
    wiki: asArr(d.wiki, `${where}.wiki`).map((w, i) => parseWikiEntry(w, `${where}.wiki[${i}]`)),
    anticipation: {
      tokensAvailable: asInt(anticipation.tokensAvailable, "tokensAvailable"),
      tokenSpends: asArr(anticipation.tokenSpends, "tokenSpends").map((row, i) => {
        const r = asDict(row, `tokenSpends[${i}]`);
        return { node: asId(requireDefined(r.node, "node"), "node"), atTick: asBig(r.atTick, "atTick") };
      }),
    },
    researchQueue: asArr(d.researchQueue, `${where}.researchQueue`).map((row, i) => {
      const r = asDict(row, `researchQueue[${i}]`);
      return { node: asId(requireDefined(r.node, "node"), "node"), slotsUsed: asInt(r.slotsUsed, "slotsUsed"), progress: asBig(r.progress, "progress"), paused: asBool(r.paused, "paused"), debtFinanced: asBool(r.debtFinanced, "debtFinanced") };
    }),
    constraintCards: asArr(d.constraintCards, `${where}.constraintCards`).map((row, i) => {
      const r = asDict(row, `constraintCards[${i}]`);
      return { legacyObjectRef: asStr(r.legacyObjectRef, "legacyObjectRef"), carriedLiability: asStr(r.carriedLiability, "carriedLiability") };
    }),
    museum: asArr(d.museum, `${where}.museum`).map((m, i) => parseMuseumExhibit(m, `${where}.museum[${i}]`)),
  };
  return node;
}

function parseStaff(value: unknown, where: string): StaffRecord {
  const d = asDict(value, where);
  return {
    id: asId(requireDefined(d.id, `${where}.id`), `${where}.id`),
    name: asStr(d.name, `${where}.name`),
    hiredAtTick: asBig(d.hiredAtTick, `${where}.hiredAtTick`),
    role: asStr(d.role, `${where}.role`),
    arcStage: asStr(d.arcStage, `${where}.arcStage`),
    skillNodesHeld: asArr(d.skillNodesHeld, `${where}.skillNodesHeld`).map((s, i) => asId(s, `skillNodesHeld[${i}]`)),
    documented: d.documented === null || d.documented === undefined ? null : asEnum(d.documented, ["facemaker", "bindermaker"], `${where}.documented`) as "facemaker" | "bindermaker",
    morale: asBig(d.morale, `${where}.morale`),
    fatigue: asBig(d.fatigue, `${where}.fatigue`),
    onCallTurn: asBool(d.onCallTurn, `${where}.onCallTurn`),
    apprenticeshipRemaining: asInt(d.apprenticeshipRemaining, `${where}.apprenticeshipRemaining`),
    careerLog: asArr(d.careerLog, `${where}.careerLog`).map((row, i) => {
      const r = asDict(row, `careerLog[${i}]`);
      return { atTick: asBig(r.atTick, "atTick"), kind: asEnum(r.kind, ["hire", "promotion", "role_change", "departure", "milestone"], "kind") as StaffCareerStop["kind"], note: asStr(r.note, "note") };
    }),
  };
}

function parseAlumni(value: unknown, where: string): AlumniRecord {
  const d = asDict(value, where);
  return {
    staffId: asId(requireDefined(d.staffId, `${where}.staffId`), `${where}.staffId`),
    leftAtTick: asBig(d.leftAtTick, `${where}.leftAtTick`),
    reason: asStr(d.reason, `${where}.reason`),
    sentiment: asBig(d.sentiment, `${where}.sentiment`),
    currentCompany: asStr(d.currentCompany, `${where}.currentCompany`),
    rehireDarkened: asBool(d.rehireDarkened, `${where}.rehireDarkened`),
  };
}

function parseSpineCast(value: unknown, where: string): SpineCastRecord {
  const d = asDict(value, where);
  const acc = asDict(requireDefined(d.accumulatorState, `${where}.accumulatorState`), `${where}.accumulatorState`);
  const accumulatorState: Record<string, Fixed> = {};
  for (const [k, v] of Object.entries(acc)) accumulatorState[k] = asBig(v, `accumulatorState.${k}`);
  return {
    npcKind: asEnum(d.npcKind, ["first_customer", "rival", "transit_am", "auditor", "journalist", "tier1_eng"], `${where}.npcKind`) as SpineCastRecord["npcKind"],
    accumulatorState,
  };
}
