/**
 * Mode write-access matrix — OD-8 RATIFIED as Matrix B (owner decision
 * 2026-10-09, recorded in docs/adr/0009-owner-ratifications-calibration.md).
 *
 * Appendix C §2.5 posed three options (A bypass / B ledger-only / C diegetic
 * staffing) and DECISIONS-PENDING.md carried the specialist recommendation (B).
 * The owner ratified B — with one explicit carve-out — and this file now
 * ENCODES THE RATIFICATION:
 *
 *  - `campaign` rows ship LIVE (full-carry writes, L18 — the doc is
 *    unambiguous there, and the game is unplayable without them);
 *  - `scenario`, `daily`, `consultant` and `blitz` rows are LIVE with the
 *    Matrix B pattern that was formerly the stored recommendation: a shadow
 *    instance appends ONLY records / medals / streaksShared / codex at
 *    settlement and is DENIED every other facet (§2.5-B: NEVER scars,
 *    reputation, customer_book, cash);
 *  - `endless` is the carve-out — contested at ratification, so its rows stay
 *    status PENDING and `writeGuard()` THROWS naming OD-8 on any attempt to
 *    exercise one. The declared `kind` still mirrors campaign semantics
 *    (§2.5: "the Long Save continuing in place") as data for a future
 *    unblock.
 *
 * The write protocol underneath (Appendix C §2.4): modes NEVER mutate the
 * Company mid-run; a run accumulates a `writes[]` batch that is committed at
 * SETTLEMENT, and `writeGuard(mode, facet)` is the commit-time gate.
 */

import { fail } from "./errors.ts";

export type SaveMode = "campaign" | "scenario" | "endless" | "daily" | "consultant" | "blitz";

export const SAVE_MODES: readonly SaveMode[] = ["campaign", "scenario", "endless", "daily", "consultant", "blitz"];

/** How a committed write-batch row may touch one facet.
 *  - append:   event-spine only — the batch appends facts, never rewrites;
 *  - instance: bounded projection/state — the batch replaces the value;
 *  - deny:     probes may READ this kind (writeGuard returns it as data), but
 *              the facet is off-limits at settlement: a batch row targeting a
 *              denied facet is a defect, and guardBatch aborts the entire
 *              settlement with a throw (§2.4 atomicity — never a silent no-op). */
export type WriteKind = "append" | "instance" | "deny";

export type RowStatus = "LIVE" | "PENDING_OD8";

/** The ~30 write facets (the faces compile READ views over these — the
 *  facet list is storage, the Wall/Scrapbook/Almanac/People faces in faces.ts
 *  are projections; never confuse the two, WS-6 R6). */
export const WRITE_FACETS = [
  "staff",
  "alumni",
  "spineCast",
  "culture",
  "scars",
  "scarsRetired",
  "postmortems",
  "ghosts",
  "habits",
  "deadDrives",
  "hardware",
  "unlockDraftsPassed",
  "nodesUnlocked",
  "credentials",
  "medals",
  "linesEverRun",
  "codex",
  "customerBooks",
  "reputation",
  "creditGrade",
  "theMultiple",
  "attributionEvents",
  "records",
  "annualReports",
  "finances",
  "playbook",
  "wiki",
  "anticipation",
  "researchQueue",
  "constraintCards",
  "museum",
  "streaksShared",
] as const;

export type WriteFacet = (typeof WRITE_FACETS)[number];

export interface WriteAccessRow {
  readonly mode: SaveMode;
  readonly facet: WriteFacet;
  readonly kind: WriteKind;
  readonly status: RowStatus;
  readonly note: string;
}

/* ═══════════════════════ the declarative table ═══════════════════════ */

/** Facets whose truth is an event spine (append) vs a bounded value
 *  (instance). Mode-independent classification. */
const APPEND_FACETS: ReadonlySet<WriteFacet> = new Set<WriteFacet>([
  "staff",
  "alumni",
  "spineCast",
  "scars",
  "scarsRetired",
  "postmortems",
  "ghosts",
  "deadDrives",
  "hardware",
  "unlockDraftsPassed",
  "nodesUnlocked",
  "credentials",
  "medals",
  "linesEverRun",
  "customerBooks",
  "attributionEvents",
  "records",
  "annualReports",
  "museum",
  "streaksShared",
]);

function campaignRow(facet: WriteFacet): WriteAccessRow {
  const kind: WriteKind = APPEND_FACETS.has(facet) ? "append" : "instance";
  return { mode: "campaign", facet, kind, status: "LIVE", note: "L18: campaign full-carry — the Long Save's home mode." };
}

/** Facets a Matrix B shadow instance may append at settlement (§2.5-B):
 *  records, medals, streaks (mode-stamped), codex stages. Nothing else. */
const MATRIX_B_LEDGER_FACETS: ReadonlySet<WriteFacet> = new Set<WriteFacet>([
  "records",
  "medals",
  "streaksShared",
  "codex",
]);

/** Modes whose rows flipped LIVE under the OD-8 Matrix B ratification
 *  (owner decision 2026-10-09, ADR-0009). Endless is NOT here — it was
 *  explicitly held PENDING as contested. */
const RATIFIED_MATRIX_B_MODES: readonly SaveMode[] = ["scenario", "daily", "consultant", "blitz"];

/** The ratified Matrix B pattern (owner decision 2026-10-09, ADR-0009):
 *  shadow instances write ONLY records, medals, streaksShared and codex —
 *  NEVER scars, reputation, customer_book, cash (§2.5-B).
 *  For the still-held endless rows the same function is recommendation-as-
 *  DATA only: endless mirrors campaign semantics (§2.5: "the Long Save
 *  continuing in place") until the owner unblocks it. */
function matrixBKind(mode: SaveMode, facet: WriteFacet): WriteKind {
  if (mode === "endless") {
    // §2.5: endless is "the Long Save continuing in place" — same node,
    // quarterly commits; the held row mirrors campaign semantics.
    return APPEND_FACETS.has(facet) ? "append" : "instance";
  }
  return MATRIX_B_LEDGER_FACETS.has(facet) ? "append" : "deny";
}

/** A LIVE row under the Matrix B ratification (scenario/daily/consultant/blitz). */
function ratifiedRow(mode: SaveMode, facet: WriteFacet): WriteAccessRow {
  return {
    mode,
    facet,
    kind: matrixBKind(mode, facet),
    status: "LIVE",
    note: `OD-8 Matrix B ratified 2026-10-09 (ADR-0009): shadow-instance rows write ONLY records/medals/streaks/codex, NEVER scars/reputation/customer_book/cash.`,
  };
}

/** An endless row: held PENDING (contested at the 2026-10-09 ratification)
 *  with the campaign-mirror recommendation carried as data. */
function pendingRow(mode: SaveMode, facet: WriteFacet): WriteAccessRow {
  return {
    mode,
    facet,
    kind: matrixBKind(mode, facet),
    status: "PENDING_OD8",
    note: `OD-8 ratified Matrix B 2026-10-09 but "${mode}" rows are explicitly HELD PENDING (contested); kind mirrors campaign semantics as data only — exercising this row throws.`,
  };
}

function buildMatrix(): readonly WriteAccessRow[] {
  const rows: WriteAccessRow[] = [];
  for (const facet of WRITE_FACETS) rows.push(campaignRow(facet));
  for (const mode of SAVE_MODES) {
    if (mode === "campaign") continue;
    const rowOf = RATIFIED_MATRIX_B_MODES.includes(mode) ? ratifiedRow : pendingRow;
    for (const facet of WRITE_FACETS) rows.push(rowOf(mode, facet));
  }
  return rows;
}

export const WRITE_ACCESS_MATRIX: readonly WriteAccessRow[] = buildMatrix();

const ROW_INDEX: ReadonlyMap<string, WriteAccessRow> = new Map(
  WRITE_ACCESS_MATRIX.map((row) => [`${row.mode}::${row.facet}`, row]),
);

/* ═══════════════════════ the commit-time gate ═══════════════════════ */

/** Settlement calls this for every row of a run's `writes[]` batch.
 *  LIVE → returns the permitted WriteKind. A ratified-mode row may lawfully
 *  return "deny" as probe data — but deny is ENFORCED, not silently skipped:
 *  a settlement batch row targeting a denied facet makes guardBatch throw and
 *  the whole batch aborts (§2.4 atomicity).
 *  PENDING → THROWS naming OD-8: the surviving PENDING rows are endless,
 *  explicitly held at the 2026-10-09 Matrix B ratification — exercising one
 *  while contested is a defect we want LOUD (Law 4), not one we want guessed. */
export function writeGuard(mode: SaveMode, facet: WriteFacet): WriteKind {
  const row = ROW_INDEX.get(`${mode}::${facet}`);
  if (row === undefined) fail(`writeGuard: no matrix row for mode "${mode}" facet "${facet}" (corrupt matrix)`);
  if (row.status === "PENDING_OD8") {
    fail(
      `OD-8 was ratified as Matrix B on 2026-10-09, but mode "${mode}" rows are explicitly HELD PENDING (contested): it may not write facet "${facet}" until the owner unblocks them. ` +
        `See docs/DECISIONS-PENDING.md OD-8, docs/adr/0009-owner-ratifications-calibration.md, and Appendix C §2.5 (current row carries the campaign-mirror recommendation as data).`,
    );
  }
  return row.kind;
}

/** Non-throwing probe for UI/validation: is this row live and what kind? */
export function writeAccessOf(mode: SaveMode, facet: WriteFacet): WriteAccessRow {
  const row = ROW_INDEX.get(`${mode}::${facet}`);
  return row ?? fail(`writeAccessOf: no row for "${mode}"::"${facet}"`);
}

export function pendingOd8Rows(): readonly WriteAccessRow[] {
  return WRITE_ACCESS_MATRIX.filter((row) => row.status === "PENDING_OD8");
}

export function liveRows(mode?: SaveMode): readonly WriteAccessRow[] {
  return WRITE_ACCESS_MATRIX.filter((row) => row.status === "LIVE" && (mode === undefined || row.mode === mode));
}

/* ═══════════════════════ settlement batch typing ═══════════════════════ */

/** One row of a run's outcome `writes[]` batch (RunInstance.outcome.writes). */
export interface SettlementWrite {
  readonly facet: WriteFacet;
  /** Canonical artifact id/value for this facet — validated by the facet's
   *  own applier, which the settlement executor pairs with writeGuard. */
  readonly payload: unknown;
}

export interface SettlementBatch {
  readonly runId: string;
  readonly mode: SaveMode;
  readonly committedAtTick: bigint;
  readonly writes: readonly SettlementWrite[];
}

/** Gate a whole batch BEFORE applying it: any held-PENDING or Matrix-B-denied
 *  row aborts the entire settlement (atomicity, Appendix C §2.4 — a
 *  half-committed batch is banned). Denied facets throw HERE rather than
 *  silently passing: writeGuard returns "deny" as data for probes, but a
 *  batch that targets a denied facet is a defect, not a no-op. */
export function guardBatch(batch: SettlementBatch): void {
  if (batch.writes.length === 0) fail("guardBatch: empty settlement batch — every run commits facts or nothing");
  for (const write of batch.writes) {
    const kind = writeGuard(batch.mode, write.facet);
    if (kind === "deny") {
      fail(
        `guardBatch: OD-8 Matrix B (ratified 2026-10-09) denies mode "${batch.mode}" the facet "${write.facet}" — a shadow-instance batch carries ONLY records/medals/streaksShared/codex, never scars/reputation/customer_book/cash. Whole settlement aborted (§2.4 atomicity).`,
      );
    }
  }
}

/* ═══════════════════ OD-16(a) MODE TIERING LAW (2026-10-09b) ═══════════════════ */

/** The three tiers the owner adopted AS LAW with ruling OD-16(a):
 *  - core:     the v1 spine — the mode wheel's first entries;
 *  - extended: ratified to exist, cheaper or data-later builds — design may
 *              author toward them, the shell does not promise them for v1;
 *  - deferred: parked (netcode-class engineering) or cut-candidate framings.
 *              A deferred mode is SCHEMA-ONLY in this registry: nothing here
 *              makes it buildable, and no save-ledger row may be exercised
 *              through it (see the endless override note on its row). */
export type ModeTier = "core" | "extended" | "deferred";

/** The band labels the RECORDED triage (reports/MASTER_REPORT.md "Modes
 *  triage (§9.1)" — WS-8's consolidation of the doc's §9.1 tiering heading
 *  33137→33149, ★ = merge-orphan re-tiered by WS-8) assigns each mode.
 *  Carried verbatim on every row so the 3-tier fold stays auditable against
 *  the recorded source; the fold itself (band → ModeTier) is lane-authored
 *  and owner-ratify-on-read. */
export type GameModeBand = "SHIP-4 v1" | "CHEAP v1.1" | "DATA-LATER" | "LATER-ENGINE/NETCODE" | "CUT-CANDIDATES";

export interface GameModeRow {
  /** Stable registry key — never re-title a mode, re-title the row. */
  readonly slug: string;
  /** The §9.1 heading (or recorded cluster) this row tiers. */
  readonly title: string;
  /** Recorded band, verbatim from MASTER_REPORT.md:536. */
  readonly band: GameModeBand;
  /** The OD-16(a) law tier — BAND_TIER_LAW applied, with exactly one
 *   ratified override (endless). */
  readonly tier: ModeTier;
  /** The write-access-ledger mode this game mode settles through, or null
   *  when the mode has no shipped save rows yet (shell problem, §9.1
   *  triage: "all modes write into the one Long Save" — the day-one
   *  Company-write-API requirement). */
  readonly saveMode: SaveMode | null;
  readonly note: string;
}

/** The recorded band → law tier fold (lane-authored mapping of the ratified
 *  five-band triage into the three-tier schema ruling OD-16(a) names).
 *  THE ONLY override is `endless`, and the owner ratified it explicitly:
 *  "the endless-32 save rows STAY PENDING_OD8 until an endless loop is
 *  scoped (deferral ratified, not a gap)" — docs/DECISIONS-PENDING.md OD-16. */
const BAND_TIER_LAW: Readonly<Record<GameModeBand, ModeTier>> = Object.freeze({
  "SHIP-4 v1": "core",
  "CHEAP v1.1": "extended",
  "DATA-LATER": "extended",
  "LATER-ENGINE/NETCODE": "deferred",
  "CUT-CANDIDATES": "deferred",
});

const CORE = "core" as const;
const EXTENDED = "extended" as const;
const DEFERRED = "deferred" as const;
const SHIP4 = "SHIP-4 v1" as const;
const CHEAP = "CHEAP v1.1" as const;
const LATER_DATA = "DATA-LATER" as const;
const LATER_ENGINE = "LATER-ENGINE/NETCODE" as const;
const CUT = "CUT-CANDIDATES" as const;

/** The ~15-mode tiering adopted as law by OD-16(a), at §9.1 heading/cluster
 *  granularity — 32 rows over the recorded triage (42 headings ≈ 52 framings
 *  fold into the doc's own clusters). Census (pinned by tests):
 *  core 3 · extended 20 · deferred 9. */
export const MODE_TIERING: readonly GameModeRow[] = Object.freeze([
  /* ── core — the v1 wheel ─────────────────────────────────────────────── */
  Object.freeze({
    slug: "campaign",
    title: "Campaign",
    band: SHIP4,
    tier: CORE,
    saveMode: "campaign",
    note: "SHIP-4 v1: the spine, 'the variety engine's delivery mechanism'; L18 full-carry writes — the Long Save's home mode.",
  }),
  Object.freeze({
    slug: "incident",
    title: "Incident Mode / Blitz Sev-1",
    band: SHIP4,
    tier: CORE,
    saveMode: "blitz",
    note: "SHIP-4 v1: pre-built boards 'already on fire', par times, 5–10 min archetypes; settles through the ratified Matrix B `blitz` rows.",
  }),
  Object.freeze({
    slug: "sandbox",
    title: "Sandbox / Architect / Lab / Zen / 'Rack Builder'",
    band: SHIP4,
    tier: CORE,
    saveMode: null,
    note: "SHIP-4 v1 — the game's screenshot engine (aquarium idle cam, stress-test button). NO save ledger row is shipped: the triage's shell requirement says even the 4-mode v1 needs the Company write API on day one rather than per-mode save formats; wiring that door is a proto/shell task, not a save-ledger change (adding a SaveMode would re-cut the pinned 192-row matrix).",
  }),

  /* ── extended — cheap v1.1 set + the whole DATA-LATER cluster ─────────── */
  Object.freeze({
    slug: "daily",
    title: "Daily Outage / Daily Incident / Scenario Weekly",
    band: CHEAP,
    tier: EXTENDED,
    saveMode: "daily",
    note: "CHEAP v1.1: one shared seed + global leaderboard; Matrix B `daily` rows LIVE.",
  }),
  Object.freeze({
    slug: "puzzle",
    title: "Puzzle Mode ('Root Cause') / The Postmortem Puzzle",
    band: CHEAP,
    tier: EXTENDED,
    saveMode: null,
    note: "CHEAP v1.1: authored data over the incident model; no save rows of its own — settlements ride whatever board-spec mode carries them.",
  }),
  Object.freeze({
    slug: "speedrun",
    title: "Speedrun ('Zero to Nines' / 'Zero to Rack' / 'Ship It')",
    band: CHEAP,
    tier: EXTENDED,
    saveMode: null,
    note: "CHEAP v1.1: a timer + goals over existing runs.",
  }),
  Object.freeze({
    slug: "minimalist",
    title: "Minimalist Mode",
    band: CHEAP,
    tier: EXTENDED,
    saveMode: null,
    note: "CHEAP v1.1: a render swap, 'but see its glyph-set cost' — the complete ASCII/box-drawing glyph set is the Shape-First a11y skin in another skin: BUILD IT ONCE, SHIP IT TWICE (OD-16 Q8; a11y-sprint scheduling stays owner-gated, this row only tiers the mode).",
  }),
  Object.freeze({
    slug: "line-draft",
    title: "Line Draft",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "★ merge-orphan re-tiered by WS-8. DATA-LATER: the versus draft-1-of-3 modifier machinery already ships headless (`versus/`); the mode itself is a data authoring job.",
  }),
  Object.freeze({
    slug: "through-the-eras",
    title: "Historical Campaign / Through the Eras",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "DATA-LATER: 'most ambitious mode here' — needs era expansion (owner-open).",
  }),
  Object.freeze({
    slug: "historical-scenarios",
    title: "Historical Scenarios / Historical Reenactments",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: "scenario",
    note: "DATA-LATER: authored scenario data; settles through the ratified Matrix B `scenario` rows.",
  }),
  Object.freeze({
    slug: "same-outage-six-ways",
    title: "The Same Outage Six Ways",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "DATA-LATER: 'the cheapest content multiplier' (§0.2) — one board, six hosting-type re-castings.",
  }),
  Object.freeze({
    slug: "business-presets",
    title: "The business modes (11 presets)",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "DATA-LATER per the ratified triage: all eleven framings ride ONE `mode_preset` schema (capital, obligations, customer book, scoring weights) — eleven presets, NEVER eleven SaveMode ledger entries.",
  }),
  Object.freeze({
    slug: "campaign-plus",
    title: "Campaign+ / New Game+ / 'The Incumbent'",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "DATA-LATER: a campaign start-state data variant; the lineage tree (9e701a0) is adjacent machinery.",
  }),
  Object.freeze({
    slug: "analyst-cluster",
    title: "Mode: The Analyst / Auditor / Quarter Close / Investor Update / The Agent",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "★ (The Agent) merge-orphan re-tiered by WS-8. DATA-LATER: 'zero new systems' — read-projection surfaces over the existing sim; The Agent is 'the business analog of Incident Mode', inverting the game without touching it.",
  }),
  Object.freeze({
    slug: "board-cluster",
    title: "One Building, Four Lines / The Handover / The Night Shift / Blind / Landlord vs Tenant / Tenant Mode",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "DATA-LATER board-framing cluster. SP-Handover precedence (OD-16 Q11): the single-player handoff 'ships regardless' of co-op — a content-budget promise inside this cluster, not a tier demotion. Blind: 'telemetry floods back at end — the flood is the lesson.'",
  }),
  Object.freeze({
    slug: "chaos-modifier",
    title: "Chaos Mode",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "★ re-tiered by WS-8 as a RUN MODIFIER, not a mode — rides the seasons/affix machinery; deliberately carries no SaveMode row.",
  }),
  Object.freeze({
    slug: "sunset",
    title: "The Sunset (the decommissioning level)",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "DATA-LATER: an authored end-of-life board.",
  }),
  Object.freeze({
    slug: "succession",
    title: "Succession / The Handoff",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "DATA-LATER: the diegetic spawnChildFromParent moment — lineage machinery ships (9e701a0), the mode framing waits.",
  }),
  Object.freeze({
    slug: "museum",
    title: "Museum Mode / The Era Gallery",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "DATA-LATER: a READ face over the `museum` facet (faces.ts) — the photo showcase folds into the Company Museum's public wing (§9.4).",
  }),
  Object.freeze({
    slug: "photo-contest",
    title: "Photo Contest / Rack Gallery",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "★ merge-orphan re-tiered by WS-8. DATA-LATER: community screenshots, 'cheap, social, rewards the art' — a print wall, not a pop-up.",
  }),
  Object.freeze({
    slug: "consultant",
    title: "The Consultant (20-minute roguelite)",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: "consultant",
    note: "DATA-LATER despite 'probably the highest-return single addition to the whole modes section' — the disagreement is cost, not quality (§9.1 tension). Half-data half-engine; the Bad-Habit library it needs is Incident Mode's v1 prerequisite anyway, so it is nearly free later. Save rows ship LIVE (Matrix B).",
  }),
  Object.freeze({
    slug: "attacker-interlude",
    title: "Attacker Mode / Reverse TD interlude",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "DATA-LATER: 'a very cheap way to double the content' — Codex decision-function marking of personally-used threats; the standalone Attack-My-Network framing is separately CUT (see attack-my-network).",
  }),
  Object.freeze({
    slug: "hotseat",
    title: "Hot-seat: 'Two Companies, One Keyboard'",
    band: LATER_DATA,
    tier: EXTENDED,
    saveMode: null,
    note: "★ merge-orphan re-tiered by WS-8. DATA-LATER: local alternating seats — no netcode, but a real shell/input discipline.",
  }),

  /* ── deferred — netcode-class, toggles, and the doc's 'probably never' ── */
  Object.freeze({
    slug: "endless",
    title: "Endless / Survival ('The NOC' / 'The Long Haul')",
    band: SHIP4,
    tier: DEFERRED,
    saveMode: "endless",
    note: "THE RULING'S OWN OVERRIDE. Design band stays SHIP-4 v1 — 'the mode people will actually play the most' — but the loop is unscoped (Seasons structure, draft-1-of-3 modifiers, hardware aging, line offers), so OD-16(a) ratifies the DEFERRAL explicitly: the 32 endless save rows stay PENDING_OD8 and writeGuard throws until the owner scopes the loop. 'Ratified, not a gap' (docs/DECISIONS-PENDING.md OD-16). Unblocking = scope the loop → flip this row's tier + flip the rows.",
  }),
  Object.freeze({
    slug: "coop-noc",
    title: "Co-op NOC (asymmetric information)",
    band: LATER_ENGINE,
    tier: DEFERRED,
    saveMode: null,
    note: "LATER-ENGINE/NETCODE: demoted by the tiering though 'the best multiplayer idea here' — decide by prototype, not argument (§9.1 tension); co-op pause gap (Q4) and save ownership (Q5) are open owner items behind it.",
  }),
  Object.freeze({
    slug: "coop-departments",
    title: "Co-op: Ops and Commercial ('Two Departments')",
    band: LATER_ENGINE,
    tier: DEFERRED,
    saveMode: null,
    note: "★ merge-orphan re-tiered by WS-8. LATER-ENGINE/NETCODE.",
  }),
  Object.freeze({
    slug: "versus-live",
    title: "Versus / Red vs Blue (live arm)",
    band: LATER_ENGINE,
    tier: DEFERRED,
    saveMode: null,
    note: "LATER-ENGINE/NETCODE for the LIVE mode: the async deck/draft/commit/match engine ships HEADLESS (2421257, 7607361) — 'the simulation cost is paid, the 95% around it is not'. OD-16 Q3: frozen formats-as-data BEFORE live Versus exists (live-ops appetite undecided).",
  }),
  Object.freeze({
    slug: "hardcore",
    title: "Hardcore / Ironman / On-Call",
    band: LATER_ENGINE,
    tier: DEFERRED,
    saveMode: null,
    note: "Ratified triage law: 'should be a TOGGLE, not a separate mode' — a settings bundle; it must never grow a SaveMode row.",
  }),
  Object.freeze({
    slug: "competitive-market",
    title: "Competitive Market / Market Share",
    band: CUT,
    tier: DEFERRED,
    saveMode: null,
    note: "CUT-CANDIDATES (doc's 'probably never': name them so they stop competing for design attention) — a full MP economy.",
  }),
  Object.freeze({
    slug: "franchise",
    title: "Franchise and multi-company play",
    band: CUT,
    tier: DEFERRED,
    saveMode: null,
    note: "CUT-CANDIDATES: 'Tier 7, if it ever exists' — stretch goal by the heading itself; the lineage graph is the only adjacent machinery.",
  }),
  Object.freeze({
    slug: "attack-my-network",
    title: "Async 'Attack My Network' (standalone)",
    band: CUT,
    tier: DEFERRED,
    saveMode: null,
    note: "CUT-CANDIDATES per the ratified triage: fold into B″ async-versus rather than ship standalone.",
  }),
  Object.freeze({
    slug: "pager-simulator",
    title: "The Pager Simulator",
    band: CUT,
    tier: DEFERRED,
    saveMode: null,
    note: "CUT-CANDIDATES: push-infra novelty — keep as Easter-egg or cut (OD-16 recorded cut-list).",
  }),
] as const satisfies readonly GameModeRow[]);

/** Load-time fail-loud audit (Law 4): unique slugs, and every row's tier
 *  must equal BAND_TIER_LAW for its band — the ONE exempted override is
 *  `endless` (SHIP-4 band, DEFERRED tier by the owner's ratified deferral).
 *  A future re-tier edits the table + ruling, never the checker. */
function assertModeTiering(rows: readonly GameModeRow[]): void {
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.slug)) fail(`OD-16 tiering: duplicate mode slug "${row.slug}"`);
    seen.add(row.slug);
    if (row.tier === BAND_TIER_LAW[row.band]) continue;
    if (row.slug === "endless" && row.band === SHIP4 && row.tier === DEFERRED) continue; // ratified override
    fail(
      `OD-16 tiering: row "${row.slug}" breaks the band→tier fold — band "${row.band}" maps to "${BAND_TIER_LAW[row.band]}", row says "${row.tier}" (only "endless" may override, and only into "deferred")`,
    );
  }
  for (const mode of SAVE_MODES) {
    const claims = rows.filter((row) => row.saveMode === mode);
    if (claims.length === 1) continue;
    fail(`OD-16 tiering: ledger mode "${mode}" must be claimed by exactly one mode row, found ${claims.length}`);
  }
}
assertModeTiering(MODE_TIERING);

/** The ledger view: each of the six SaveModes' law tier, DERIVED from the
 *  MODE_TIERING saveMode back-links — the table stays the single source of
 *  truth; this is its projection, not a second bookkeeping (Laws 2+3). */
function deriveSaveModeTiers(): Readonly<Record<SaveMode, ModeTier>> {
  const tiers = {} as Record<SaveMode, ModeTier>;
  for (const row of MODE_TIERING) {
    if (row.saveMode === null) continue;
    tiers[row.saveMode] = row.tier;
  }
  return Object.freeze(tiers);
}

export const SAVE_MODE_TIER: Readonly<Record<SaveMode, ModeTier>> = deriveSaveModeTiers();

/** Non-throwing probe: which OD-16(a) tier governs this ledger mode? */
export function saveModeTier(mode: SaveMode): ModeTier {
  return SAVE_MODE_TIER[mode] ?? fail(`saveModeTier: no tier for mode "${mode}" (corrupt tiering)`);
}

/** Registry read: every mode row in a tier, in table order (the shell's mode
 *  wheel filters on "core"; tests census all three). */
export function modeRowsIn(tier: ModeTier): readonly GameModeRow[] {
  return MODE_TIERING.filter((row) => row.tier === tier);
}
