/**
 * The acceptance-test roster ledger (§8.16 "The acceptance-test roster").
 *
 * The audit finding (group-23 TOP-PROBLEMS #1, spec lines 32326/32505) is an
 * OVER-PROMISE: docs claimed the a11y/acceptance harness "runs in CI from day
 * one" while only pieces existed. This ledger is the honesty artifact: one row
 * per §8.16 gate, `live` only where a shipped mechanism verifiably answers
 * the gate's question, `absent` everywhere else — and every absent row ships
 * a GREP PROBE proving it stays absent-looking, so nobody can quietly claim
 * it later (chrome/__tests__/a11yRoster.test.ts walks the probes).
 *
 * Statuses are deliberately coarse (live|absent). A live row's `where` states
 * EXACTLY which mechanism answers the gate — e.g. greyscale-pass now names
 * BOTH of its halves live: the CI census (contrastAudit) and the runtime
 * luminance-only render mode (contrastAuditMode, the 'a' key).
 */

export type RosterStatus = "live" | "absent";

export interface AcceptanceGateRow {
  readonly id: string;
  /** the question the gate asks (§8.16 table, verbatim column). */
  readonly asks: string;
  readonly spec: string;
  readonly status: RosterStatus;
  /** live → the shipped mechanism; absent → null. */
  readonly where: string | null;
}

/** The §8.16 roster, in table order. 11 gates — pinned against the spec file
 *  by the roster test (add a row to hosting_game.md and this ledger goes red
 *  until it is honestly extended). */
const ROSTER_SPECS: readonly AcceptanceGateRow[] = [
  {
    id: "quiet-frame",
    asks: "is a healthy screenshot calm?",
    spec: "§8.9",
    status: "absent",
    where: null,
  },
  {
    id: "loud-frame",
    asks: "can a stranger answer what's broken / what's worst / what can I do in 5s, and is there exactly one most-urgent thing?",
    spec: "§8.9",
    status: "absent",
    where: null,
  },
  {
    id: "thumbnail",
    asks: "at 128px: which line, what tier, is it okay?",
    spec: "§8.9",
    status: "absent",
    where: null,
  },
  {
    id: "two-screenshot",
    asks: "can a 4-hour player name two hosting types from one screenshot each?",
    spec: "§8.10",
    status: "absent",
    where: null,
  },
  {
    id: "silhouette-sheet",
    asks: "no two units confusable at 24px, no two families at 48px",
    spec: "§8.16",
    status: "absent",
    where: null,
  },
  {
    id: "silhouette-first-authoring",
    asks: "16px, in motion, no colour, after three exposures",
    spec: "§8.16",
    status: "absent",
    where: null,
  },
  {
    id: "greyscale-pass",
    asks: "does every state survive Contrast Audit Mode?",
    spec: "§8.14",
    status: "live",
    where:
      "chrome/a11y/contrastAudit.ts — CI census of every shipped chrome pairing against WCAG AA luminance math (a11yRoster + contrastAudit tests). Plus the runtime half: chrome/a11y/contrastAuditMode.ts — the 'a'-key mode renders the live screen luminance-only (grayscale backdrop overlay), re-checks every self-painted text pairing against computed styles, marks failures with white outlines and prints a report strip; the 40-row census re-resolves against the live era tokens inside the same mode.",
  },
  {
    id: "greyscale-motion",
    asks: "can a tester name the problem with colour muted and motion only?",
    spec: "§8.2",
    status: "live",
    where:
      "chrome/a11y/contrastAuditMode.ts — the runtime mode supplies the COLOUR-MUTED half of the question at the press of 'a' (grayscale everything below the HUD, motion untouched, markers white-luminance); the MOTION half it must stand on is the census-audited vocabulary of chrome/a11y/motionAudit.ts (bezel lip, klaxon wash, heartbeat — strobe-lawed, reduced-motion-guarded). The tester-side verdict itself stays human, as §8.2 intends — what was missing was a way to mute colour without muting motion, and that now ships.",
  },
  {
    id: "two-second-rule",
    asks: "does every incident-time panel yield its answer in 2s?",
    spec: "§8.8",
    status: "absent",
    where: null,
  },
  {
    id: "chroma-meter",
    asks: "are the colour, FX, motion and label budgets being respected right now?",
    spec: "§8.2",
    status: "live",
    where:
      "render/budget.ts BudgetManager.snapshot() → chrome/ChromaMeter.vue player-visible readout (App.vue 'c' key + Chroma button) — shipped 4ff4a4f, re-pinned by this ledger.",
  },
  {
    id: "strobe-budget-check",
    asks: "≤3 luminance transitions/sec across >25% of screen",
    spec: "§8.14",
    status: "live",
    where:
      "chrome/a11y/motionAudit.ts — strobe math over the shipped chrome motion census + prefers-reduced-motion guard scan of every chrome style block (motionAudit test).",
  },
];

/** Parsed+validated on module load: an illegal row shape cannot ship. */
export const ACCEPTANCE_ROSTER: readonly AcceptanceGateRow[] = Object.freeze(
  ROSTER_SPECS.map(parseRosterRow),
);

function parseRosterRow(row: AcceptanceGateRow): AcceptanceGateRow {
  if (row.status !== "live" && row.status !== "absent") {
    throw new Error(`roster[${row.id}]: status "${row.status}" is not live|absent`);
  }
  if (row.status === "live" && (row.where === null || row.where.trim() === "")) {
    throw new Error(`roster[${row.id}]: a live row must name its shipped mechanism (where)`);
  }
  if (row.status === "absent" && row.where !== null) {
    throw new Error(`roster[${row.id}]: an absent row must carry where=null — claiming a location for nothing is how over-promises start`);
  }
  return Object.freeze(row);
}

export function rosterRow(id: string): AcceptanceGateRow {
  const row = ACCEPTANCE_ROSTER.find((r) => r.id === id);
  if (row === undefined) {
    throw new Error(`roster[unknown-id]: "${id}" is not one of the §8.16 gates`);
  }
  return row;
}

export function liveGateCount(): number {
  return ACCEPTANCE_ROSTER.filter((r) => r.status === "live").length;
}

/**
 * grep probes for the absent rows — a file matching the pattern (case
 * insensitive) under src/ outside the a11y ledger itself would mean someone
 * BUILT the gate without updating this ledger. The roster test walks these
 * and arms one deliberately.
 */
export const ABSENT_GATE_PROBES: Readonly<Record<string, string>> = Object.freeze({
  "quiet-frame": "QuietFrame|quiet-frame",
  "loud-frame": "LoudFrame|loud-frame",
  thumbnail: "Thumbnail|thumbnail",
  "two-screenshot": "TwoScreenshot|two-screenshot",
  "silhouette-sheet": "Silhouette|silhouette",
  "silhouette-first-authoring": "SilhouetteFirst|silhouette-first",
  "two-second-rule": "TwoSecond|two-second",
});

/**
 * Shipped a11y SURFACES that PHASE1-PLAN:165 already credits ("Shape-First
 * pips + readout shipped"). They are NOT §8.16 roster gates — kept in their
 * own ledger so the "3 of 11 live" count can never be inflated by them, while
 * the mechanisms themselves still get drift pins.
 */
export interface ShippedA11ySurface {
  readonly id: string;
  readonly spec: string;
  readonly status: "live";
  readonly where: string;
}

export const SHIPPED_A11Y_SURFACES: readonly ShippedA11ySurface[] = Object.freeze([
  {
    id: "shape-first-notches",
    spec: "§8.14/§8.15",
    status: "live",
    where:
      "chrome/statusChip.ts — twelve status values, twelve distinct notch glyphs (circle/triangle/cross/chevron-down/wrench/bolt/seal/hourglass/flag/diamond/clock/dashed-ring), rendered stroke-only so geometry separates all states with colour stripped; gates/g3/pips.ts extends the shape-first arm to the suspicion dial.",
  },
  {
    id: "readout-mode",
    spec: "§8.14",
    status: "live",
    where:
      "chrome/instruments/InstrumentBezel.vue readout prop + registry.formatReadout — every diegetic gauge switches to plain numeric readout (the 'c'-adjacent Readout toggle in App.vue); the diegetic faces keep a .still static arm.",
  },
]);
