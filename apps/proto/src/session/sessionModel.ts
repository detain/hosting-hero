/**
 * session/sessionModel — pure data for the SESSION rail entry (slice-(d)).
 *
 * One continuous playable product session: the colo line's REAL shipped
 * traffic (boot.corpus over the g1-colo-first-quarter slice), over a
 * MULTI-LANE board seeded through the boot.build rider, the watch-the-door
 * book ARMED through boot.rules, the money lane live, the intent door open
 * from tick 1, and a clean halt on company-dissolved. Everything that makes
 * that boot is FROZEN DATA here so the wire test, the panel and App.vue
 * cannot drift on it; the module never imports the deck book
 * (`runner/productionRules` is main-thread/App law — worker quarantine) and
 * never touches globalBudget (the LossCard posture: claims stay with the
 * chrome that owns them).
 *
 * The board (ADR-0014 #D7 rider semantics — see simWorker.build.test.ts):
 * the door's four seedable nodes (edge/waf/deep/origin) wired as a full
 * maze — data front-door, control mid, trust tail, and a power feed with a
 * named socket (the door's own socket law: power carries a slot, every
 * other relation forbids one). Edge ids are ABSENT so the runner derives
 * the engine's private `defaultEdgeId` grammar — a seeded edge and a
 * connect-verb mint collide on the same id by construction (edge-exists
 * witness), and the disconnect verbs below target exactly those derived
 * strings.
 */
import { asEntityId, observedKey, type EntityId } from "@hh/sim-core/types";
import { fixedToDisplay, type BootBoardEdgeWire, type BootBuildWire, type BootCorpusWire, type BootRules, type EventNotice, type ProtoCell, type SimProjection } from "../shared/protocol";
import { compareCodeUnits } from "../chrome/textLaw";
import type { SeedCable } from "../render/boardIntent";

/** The App-owned rail id (never collides with a "G<n>" gateId). */
export const SESSION_ID = "session";

/** Hashed to a u32 run seed by the worker hosts; twin boots share it. */
export const SESSION_SEED = "hh-session-colo-001";

/** §1.3 colo card ("Amps and Aisles") — the shipped quarter, all five waves. */
export const SESSION_CORPUS: BootCorpusWire = Object.freeze({
  tableId: "colo" as const,
  waves: Object.freeze([1, 2, 3, 4, 5]) as readonly number[],
});

/** Hands rail of THREE (rider `hands` — door capacity from tick 1) over the
 *  four-node maze board. The 3-capacity is playable law, not decoration:
 *  the wire test feeds four communicate verbs in one tick and the fourth
 *  refuses `hands-exhausted` exactly like §7.5 promises. */
/** The maze as its own definite array (the rider type's board is optional;
 *  our boot is not). SESSION_BOARD_EDGES below maps THIS, so the stage seed
 *  can never silently derive from an absent field. */
const SESSION_BOARD: readonly BootBoardEdgeWire[] = Object.freeze([
  Object.freeze({ relation: "data" as const, from: "edge", to: "waf" }),
  Object.freeze({ relation: "control" as const, from: "waf", to: "deep" }),
  Object.freeze({ relation: "trust" as const, from: "deep", to: "origin" }),
  Object.freeze({ relation: "power" as const, from: "origin", to: "edge", slot: "psu-a" }),
]);

export const SESSION_BUILD: BootBuildWire = Object.freeze({
  hands: 3,
  board: SESSION_BOARD,
});

/**
 * Boot RIDERS — the frozen constants above, generalized so a boot call site
 * takes its seed/corpus/build as ONE data parameter.
 *
 * The campaign's chapter docs CANNOT ride this wire today: each chapter
 * carries synthetic traffic tables and off-mainline boards outside the
 * boot.corpus (shipped slices only) / boot.build (the door's four seedable
 * nodes only) protocol — a per-chapter live worker boot is a NEW sim-core
 * seam, refused under the frozen-engine directive and reported for a
 * follow-on lane. The parameterization stands as the seam-shaped hole: the
 * future product run passes chapter-derived riders; nobody touches the
 * boot call site again.
 *
 * DEFAULT_SESSION_RIDERS ARE the frozen SESSION_* constants (twin-pinned to
 * the wire payload by sessionRiders.test.ts); `rules` is an ABSENT key so
 * `riders.rules ?? productionBootRules()` reproduces today's exact
 * positional boot — the dormant path stays byte-stand by construction.
 */
export interface SessionBootRiders {
  readonly seed: string;
  readonly corpus: BootCorpusWire;
  readonly build: BootBuildWire;
  readonly rules?: BootRules;
}

export const DEFAULT_SESSION_RIDERS: SessionBootRiders = Object.freeze({
  seed: SESSION_SEED,
  corpus: SESSION_CORPUS,
  build: SESSION_BUILD,
});

/* ─────────────────────── seeded edge ids (derived grammar) ───────────────────────
 * Absent `id` ⇒ the runner mints `edge:<relation>:<from>-><to>` plus `:<slot>`
 * for power (intent-door defaultEdgeId mirror, pinned byte-for-byte by
 * simWorker.build.test.ts). Pinned here as literals because the DISCONNECT
 * verbs below target them through the door, and the wire test falsifies the
 * grammar against the live board. */
export const SESSION_EDGE_IDS = Object.freeze({
  dataEdgeWaf: "edge:data:edge->waf",
  controlWafDeep: "edge:control:waf->deep",
  trustDeepOrigin: "edge:trust:deep->origin",
  powerOriginEdge: "edge:power:origin->edge:psu-a",
});

/* ─────────────────── seeded cables for the stage (weld 3) ───────────────────
 * The same boot rider restated for the canvas: boardIntent's initialEdges
 * law is the HOST quoting its OWN build.board input, so the WorldStage
 * mounted beside this panel paints the four seeded cables at tick 0 while
 * the door's wire receipts remain the sole runtime authority. */
export const SESSION_BOARD_EDGES: readonly SeedCable[] = Object.freeze(
  SESSION_BOARD.map((e) => Object.freeze({
    relation: e.relation,
    from: e.from,
    to: e.to,
    slot: e.slot ?? null,
  })),
);

/* ───────────────────────────── door verbs ─────────────────────────────
 * The intent door is open from tick 1: every row is a COMPLETE flat wire
 * record for simClient.sendPlayerVerb (VERB_ARG_SHAPES law: every arg key
 * must ride; string-or-null fields accept null). `id` keys the button.
 * The discrete records stay the panel's door armament (every gate panel's
 * posture); since weld 3 the canvas beside the panel mints the SAME verb
 * shapes through the intent machine — L-B owns pointer→intent, these rows
 * own button→intent. */
export type WireArgRecord = Readonly<Record<string, string | number | null>>;

export interface DoorVerbRow {
  readonly id: string;
  readonly label: string;
  readonly why: string;
  readonly args: WireArgRecord;
}

export const SESSION_DOOR_VERBS: readonly DoorVerbRow[] = Object.freeze([
  Object.freeze({
    id: "communicate",
    label: "communicate",
    why: "page the rack (2-tick hand; the §7.5 three-hand rail caps the burst)",
    args: Object.freeze({ verb: "communicate", target: null, note: "session: hands on the cage door" }),
  }),
  Object.freeze({
    id: "configure-inspect",
    label: "edge → inspect",
    why: "arm the maze: arrivals scoring past the dial walk the deep path",
    args: Object.freeze({ verb: "configure-node", nodeId: "edge", inspectionDepth: "inspect", shedOrder: null }),
  }),
  Object.freeze({
    id: "configure-passthrough",
    label: "edge → pass-through",
    why: "disarm the maze: the front door waves everyone through",
    args: Object.freeze({ verb: "configure-node", nodeId: "edge", inspectionDepth: "pass-through", shedOrder: null }),
  }),
  Object.freeze({
    id: "connect-deep",
    label: "connect edge→deep",
    why: "mint a data edge by verb — collides with itself as edge-exists",
    args: Object.freeze({ verb: "connect-ports", relation: "data", from: "edge", to: "deep", slot: null }),
  }),
  Object.freeze({
    id: "disconnect-trust",
    label: "disconnect trust",
    why: `plain pull of the seeded ${SESSION_EDGE_IDS.trustDeepOrigin} (drain stays opt-in)`,
    args: Object.freeze({ verb: "disconnect-drain", edgeId: SESSION_EDGE_IDS.trustDeepOrigin }),
  }),
]);

/* ─────────────────────────── money tape ───────────────────────────
 * The economy lane crosses the wire as `economy-notice` riders whose detail
 * is "<engineKind>:<contractId>" (runner law @45f0edf lineage; the SAME
 * grammar chrome/deathWatch parses for the loss rung). The session's money
 * legibility is this tape plus the reused chrome/metrics permanent rows —
 * G5's projection law, not a fork. */
export interface MoneyTapeRow {
  readonly kind: string;
  readonly contractId: string;
  readonly causeId: string | null;
}

export interface MoneyTape {
  /** Newest-first capped view of every economy-notice rider seen. */
  readonly rows: readonly MoneyTapeRow[];
  /** Per-kind lifetime counts (dunning stages, invoices, deaths — all here). */
  readonly counts: Readonly<Record<string, number>>;
}

/** Split economy-notice details on the FIRST colon (deathWatch precedent —
 *  contract ids may themselves carry colons, e.g. price keys). */
export function parseMoneyTape(
  notices: readonly EventNotice[],
  prior: MoneyTape | null = null,
  cap = 24,
): MoneyTape {
  const counts = new Map<string, number>();
  if (prior !== null) {
    for (const [kind, n] of Object.entries(prior.counts)) counts.set(kind, n);
  }
  const fresh: MoneyTapeRow[] = [];
  for (const notice of notices) {
    if (notice.kind !== "economy-notice") continue;
    const detail = notice.detail;
    if (detail === undefined) continue;
    const colon = detail.indexOf(":");
    if (colon === -1) continue;
    const kind = detail.slice(0, colon);
    const contractId = detail.slice(colon + 1); // full remainder — ids may carry colons
    fresh.push({ kind, contractId, causeId: notice.causeId ?? null });
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  const rows = [...fresh.reverse(), ...(prior?.rows ?? [])].slice(0, cap);
  return Object.freeze({
    rows: Object.freeze(rows.map((r) => Object.freeze(r))),
    counts: Object.freeze(Object.fromEntries(counts)),
  });
}

/* ─────────────────────────── board readers ───────────────────────────
 * Per-node view of the live board: the engine's own saturation cells
 * (utilizationRho fixed, queueDepth metered) PLUS the adapter's
 * per-node attribution totals that only exist on a corpus boot
 * (simCoreRunner "PER-NODE ATTRIBUTION"). Absent cells render null → "?". */
export const BOARD_NODES: readonly string[] = Object.freeze(["edge", "waf", "deep", "origin"]);

export interface BoardNodeView {
  readonly id: string;
  readonly rho: number | null;
  readonly queueDepth: number | null;
  readonly entryArrivalsTotal: number | null;
  readonly outcomeServedTotal: number | null;
  readonly outcomeBouncedTotal: number | null;
  readonly outcomeFalsePositiveTotal: number | null;
  readonly outcomeLandedTotal: number | null;
}

function readCell(projection: SimProjection, entity: EntityId, property: string): number | null {
  const cell: ProtoCell | undefined = projection.observed.get(observedKey(entity, property));
  if (cell === undefined || cell.value === null) return null;
  // Decoded cells self-describe by VALUE type (fixed ⇒ bigint revived at the
  // boundary; metered ints — queueDepth, attribution totals — ride as number).
  if (typeof cell.value === "bigint") return fixedToDisplay(cell.value);
  if (typeof cell.value === "number") return cell.value;
  return null;
}

const ENTRY_PROPS = Object.freeze([
  "entryArrivalsTotal",
  "outcomeServedTotal",
  "outcomeBouncedTotal",
  "outcomeFalsePositiveTotal",
  "outcomeLandedTotal",
] as const);

/** The four seeded nodes, then the two honest unattributed buckets the
 *  adapter keeps when a same-tick terminal hides its entry node (versus
 *  lane's "unattributed" floor precedent). */
export function readBoardHealth(projection: SimProjection | null): readonly BoardNodeView[] {
  if (projection === null) return [];
  const entities: readonly { id: string; entity: EntityId }[] = Object.freeze([
    ...BOARD_NODES.map((id) => ({ id, entity: asEntityId(id) })),
    { id: "entry/unattributed", entity: asEntityId("entry/unattributed") },
    { id: "outcome/unattributed", entity: asEntityId("outcome/unattributed") },
  ]);
  return entities.map(({ id, entity }) => ({
    id,
    rho: readCell(projection, entity, "utilizationRho"),
    queueDepth: readCell(projection, entity, "queueDepth"),
    entryArrivalsTotal: readCell(projection, entity, "entryArrivalsTotal"),
    outcomeServedTotal: readCell(projection, entity, "outcomeServedTotal"),
    outcomeBouncedTotal: readCell(projection, entity, "outcomeBouncedTotal"),
    outcomeFalsePositiveTotal: readCell(projection, entity, "outcomeFalsePositiveTotal"),
    outcomeLandedTotal: readCell(projection, entity, "outcomeLandedTotal"),
  }));
}

/** Sum of the per-node entry totals plus the unattributed bucket — the
 *  conservation witness the wire test pins against the rate aggregate. */
export function entryAttributionSum(rows: readonly BoardNodeView[]): number {
  return rows.reduce((sum, r) => sum + (r.entryArrivalsTotal ?? 0), 0);
}

/** Sum across every outcome column plus the outcome unattributed row. */
export function outcomeAttributionSum(rows: readonly BoardNodeView[]): number {
  return rows.reduce(
    (sum, r) =>
      sum +
      (r.outcomeServedTotal ?? 0) +
      (r.outcomeBouncedTotal ?? 0) +
      (r.outcomeFalsePositiveTotal ?? 0) +
      (r.outcomeLandedTotal ?? 0),
    0,
  );
}

/* ─────────────────────────── receipt tape ───────────────────────────
 * Door receipts ride the SAME notice stream (intent-executed/intent-refused
 * with "<verb>: <detail|reason>" per contract #10). Cap newest-first. */
export interface ReceiptRow {
  readonly kind: "intent-executed" | "intent-refused";
  readonly detail: string;
}

export function parseReceipts(
  notices: readonly EventNotice[],
  prior: readonly ReceiptRow[] = [],
  cap = 12,
): readonly ReceiptRow[] {
  const fresh: ReceiptRow[] = [];
  for (const notice of notices) {
    if (notice.kind !== "intent-executed" && notice.kind !== "intent-refused") continue;
    fresh.push({ kind: notice.kind, detail: notice.detail ?? notice.kind });
  }
  return Object.freeze([...fresh.reverse(), ...prior].slice(0, cap).map((r) => Object.freeze(r)));
}

/** Rule-book firings (boot.rules armed deck): the panel shows the book is
 *  breathing without re-deriving any card semantics. */
export function parseRuleFires(
  notices: readonly EventNotice[],
  prior: readonly string[] = [],
  cap = 8,
): readonly string[] {
  const fresh = notices
    .filter((n) => n.kind === "rule-fired")
    .map((n) => n.detail ?? n.causeId ?? "rule-fired");
  return Object.freeze([...fresh.reverse(), ...prior].slice(0, cap));
}

/** Stable ordering for any display list keyed by text (code-unit law). */
export function byCodeUnit(a: { readonly id: string }, b: { readonly id: string }): number {
  return compareCodeUnits(a.id, b.id);
}
