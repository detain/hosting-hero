/**
 * render · boardIntent — the §3.1 renderer-intent law as PURE data (L-B).
 *
 * The mouse may mint a PlayerVerb: pointer input arms a verb, picks a
 * target, previews the terms where the verb has them, and commits through
 * the EXISTING door round-trip (SimClient.sendPlayerVerb → worker → the
 * engine's applyIntentDoor). This module owns the whole client side of that
 * grammar with ZERO Pixi, ZERO Vue, ZERO DOM and ZERO timers — it is unit-
 * testable in node like screenSpace.ts, and the renderer law pins it there.
 *
 * Determinism-safe laws this file keeps:
 *  · No intent transport is invented. Mints are the door's own arg shapes
 *    (drift-pinned against pipeline/intent-door.ts VERB_ARG_SHAPES by
 *    boardIntent.test.ts); the SimClient stamps seq/clock/atUs/origin.
 *  · Ground truth stays the wire. The client keeps NO engine authority: the
 *    cable ledger and roster ghosts are FOLDS over the projection's door
 *    receipts (intent-executed / intent-refused notices). Depth movement is
 *    anchored to this seat's own in-flight token — the door's configure
 *    detail carries no node id (fog law), so a rule-deck depth shift stays
 *    honestly invisible to the chip ledger.
 *  · rAF re-reads the SAME projection between worker ticks — `ingest` is
 *    seq-guarded so every frame's notices fold exactly once.
 *  · Terms prediction mirrors the door's refusal ORDER client-side only to
 *    decide whether a dialog is worth opening; the door keeps the last word
 *    and its refusal arrives as a bounce chip on the wire.
 */
import type { BoardRelation, ClockKind } from "@hh/sim-core/types";
import type { SimProjection } from "../shared/protocol";
import type { LedgerHue } from "./hues";
import { compareCodeUnits } from "../chrome/textLaw";

/* ═══════════════════ the door's vocab, mirrored (drift-pinned) ═══════════════════ */

export const BOARD_CLOCK: ClockKind = "sim";

/** The four sandbox-honest verbs (§9.13 gate grammar, v0): the ones the
 *  mounted g1-smoke board can execute today. */
export type BoardVerb = "place-device" | "connect-ports" | "disconnect-drain" | "configure-node";

export const BOARD_VERBS = Object.freeze([
  "place-device",
  "connect-ports",
  "disconnect-drain",
  "configure-node",
] as const satisfies readonly BoardVerb[]);

/** Per-verb KEY list the door's VERB_ARG_SHAPES parses (minus the `verb`
 *  discriminator every wire mint carries). boardIntent.test.ts extracts the
 *  rows from intent-door.ts source and reddens on drift. */
export const MINT_SHAPES: Readonly<Record<BoardVerb, readonly string[]>> = Object.freeze({
  "place-device": Object.freeze(["nodeId", "deviceKind", "template"]),
  "connect-ports": Object.freeze(["relation", "from", "to", "slot"]),
  "disconnect-drain": Object.freeze(["edgeId"]),
  "configure-node": Object.freeze(["nodeId", "inspectionDepth", "shedOrder"]),
} as const);

/** Mirror of the door's PRIVATE INSPECTION_DEPTHS ladder (drift-pinned). */
export const INSPECTION_DEPTHS = Object.freeze([
  "pass-through",
  "sample-1-in-20",
  "inspect",
  "challenge",
] as const);
export type InspectionDepth = (typeof INSPECTION_DEPTHS)[number];

/** Mirror of the door's PRIVATE SHED_ORDERS vocab (drift-pinned). */
export const SHED_ORDERS = Object.freeze([
  "first-in-first-out",
  "last-in-first-out",
  "lowest-value-first",
  "qos-weighted",
] as const);
export type ShedOrder = (typeof SHED_ORDERS)[number];

/** Mirror of the four board relations (types.ts BoardRelation). */
export const BOARD_RELATIONS = Object.freeze([
  "data",
  "power",
  "control",
  "trust",
] as const satisfies readonly BoardRelation[]);

/** Mirror of the door's private defaultEdgeId convention (drift-pinned to
 *  the two template lines, same law as simCoreRunner.deriveBoardEdgeId). */
export function deriveEdgeId(
  relation: BoardRelation,
  from: string,
  to: string,
  slot: string | null,
): string {
  const base = `edge:${relation}:${from}->${to}`;
  return relation === "power" && slot !== null ? `${base}:${slot}` : base;
}

/** R32 hue flavor per relation — every name is a hue-ledger entry (pinned). */
export const RELATION_HUES: Readonly<Record<BoardRelation, LedgerHue>> = Object.freeze({
  data: "cyan",
  power: "copper",
  control: "white",
  trust: "violet",
});

/* ══════════════════════════ the authored maze board ══════════════════════════ */

export interface ScreenPoint {
  readonly x: number;
  readonly y: number;
}

export interface BoardPlate {
  readonly nodeId: string;
  readonly cx: number;
  readonly cy: number;
  readonly w: number;
  readonly h: number;
  readonly authored: boolean;
}

export interface BoardPort {
  readonly portId: string;
  readonly nodeId: string;
  readonly relation: BoardRelation;
  readonly x: number;
  readonly y: number;
  /** Power sockets carry a slot name (the door's power-needs-slot law is
   *  unloseable through a power port; other relations carry none). */
  readonly slot: string | null;
}

export const PLATE_W = 64;
export const PLATE_H = 48;
export const PORT_R = 14;

/** Maze row sits ABOVE the g1 lane band (LANE_START y 40 … LANE_END y −30),
 *  clear of the motes — the board reads as a separate rack shelf. */
const MAZE_Y = -190;
const NODE_X: Readonly<Record<string, number>> = Object.freeze({
  edge: -240,
  waf: -80,
  deep: 80,
  origin: 240,
});

/** Initial depths of the authored nodes — drift-pinned against the runner's
 *  mkNode lines (simCoreRunner.ts), never hand-waved. */
export const AUTHORED_DEPTHS: Readonly<Record<string, InspectionDepth>> = Object.freeze({
  edge: "sample-1-in-20",
  waf: "pass-through",
  deep: "inspect",
  origin: "pass-through",
});

export const AUTHORED_NODES = Object.freeze(AUTHORED_KEYS());
function AUTHORED_KEYS(): string[] {
  return Object.keys(NODE_X);
}

function authoredPlates(): BoardPlate[] {
  return AUTHORED_NODES.map((nodeId) => ({
    nodeId,
    cx: NODE_X[nodeId] as number,
    cy: MAZE_Y,
    w: PLATE_W,
    h: PLATE_H,
    authored: true,
  }));
}

/** Ports hang below each plate in fixed relation order (R32: shape is the
 *  fact; positions are stable so muscle memory works). */
function authoredPorts(): BoardPort[] {
  const ports: BoardPort[] = [];
  for (const plate of authoredPlates()) {
    BOARD_RELATIONS.forEach((relation, i) => {
      ports.push({
        portId: `${plate.nodeId}#${relation}`,
        nodeId: plate.nodeId,
        relation,
        x: plate.cx - 48 + i * 32,
        y: plate.cy + PLATE_H / 2 + 18,
        slot: relation === "power" ? "psu1" : null,
      });
    });
  }
  return ports;
}

export const BOARD_PLATES: readonly BoardPlate[] = Object.freeze(authoredPlates());
export const BOARD_PORTS: readonly BoardPort[] = Object.freeze(authoredPorts());
export const PORT_BY_ID: ReadonlyMap<string, BoardPort> = new Map(
  BOARD_PORTS.map((p) => [p.portId, p]),
);

/** Bench shelf for placed devices: idle plates (the sandbox router is code-
 *  defined — a placed node is honestly NOT routed; it joins the roster). */
export function benchPlate(index: number): BoardPlate {
  return {
    nodeId: `bench-${index}`,
    cx: -240 + (index - 1) * 96,
    cy: -96,
    w: PLATE_W,
    h: PLATE_H,
    authored: false,
  };
}

export const DEVICE_KINDS = Object.freeze(["web", "db", "cache"] as const);
export type DeviceKind = (typeof DEVICE_KINDS)[number];

/** Hit law (pure): the code-drawn board is tested on its vector shapes —
 *  plate rects and port circles — never a pixel lookup. Pointer events on
 *  the Pixi side ride container hitAreas of the same geometry; this is the
 *  testable authority behind them. */
export function portAt(point: ScreenPoint): string | null {
  for (const port of BOARD_PORTS) {
    const dx = point.x - port.x;
    const dy = point.y - port.y;
    if (dx * dx + dy * dy <= PORT_R * PORT_R) return port.portId;
  }
  return null;
}

/** Roster-aware plate hit: authored nodes plus the bench ghosts this seat
 *  has placed (placedCount = how many bench rows exist). */
export function plateAt(point: ScreenPoint, placedCount = 0): string | null {
  for (const plate of BOARD_PLATES) {
    if (Math.abs(point.x - plate.cx) <= plate.w / 2 && Math.abs(point.y - plate.cy) <= plate.h / 2) {
      return plate.nodeId;
    }
  }
  for (let i = 1; i <= placedCount; i += 1) {
    const plate = benchPlate(i);
    if (Math.abs(point.x - plate.cx) <= plate.w / 2 && Math.abs(point.y - plate.cy) <= plate.h / 2) {
      return plate.nodeId;
    }
  }
  return null;
}

/* ══════════════════════ client-side terms prediction ══════════════════════ */

export interface CableEdge {
  readonly edgeId: string;
  readonly relation: BoardRelation;
  readonly from: string;
  readonly to: string;
  readonly slot: string | null;
}

export type TermsCard =
  | {
      readonly kind: "connect";
      readonly relation: BoardRelation;
      readonly from: string;
      readonly to: string;
      readonly slot: string | null;
      readonly edgeId: string;
    }
  | {
      readonly kind: "disconnect";
      readonly edgeId: string;
      readonly relation: BoardRelation;
      readonly from: string;
      readonly to: string;
      readonly slot: string | null;
    };

export type PredictVerdict = { ok: true; card: TermsCard } | { ok: false; reason: string };

/** Mirrors the door's handleConnectPorts refusal ORDER over the client's
 *  ledger view (fog-legal: everything here was minted by THIS seat or read
 *  off the wire). R32 shape-mismatch is a client-only bounce (the door
 *  never sees ports, only relations) and leads. */
export function predictConnect(
  from: { nodeId: string; relation: BoardRelation; slot: string | null },
  to: { nodeId: string; relation: BoardRelation; slot: string | null },
  ledger: ReadonlyMap<string, CableEdge>,
  roster: ReadonlySet<string>,
): PredictVerdict {
  if (from.relation !== to.relation) {
    return {
      ok: false,
      reason: `shape-mismatch: a ${from.relation} port is not a ${to.relation} port — R32 shapes are facts`,
    };
  }
  const relation = from.relation;
  if (relation === "power" && (from.slot === null || to.slot === null)) {
    return { ok: false, reason: "power-needs-slot: power edges must name their socket" };
  }
  if (relation !== "power" && (from.slot !== null || to.slot !== null)) {
    return { ok: false, reason: "slot-only-for-power: only power edges carry a slot" };
  }
  for (const id of [from.nodeId, to.nodeId]) {
    if (!roster.has(id)) return { ok: false, reason: `unknown-node: "${id}"` };
  }
  if (from.nodeId === to.nodeId) {
    return { ok: false, reason: `self-edge: "${from.nodeId}" cannot cable itself` };
  }
  const slot = relation === "power" ? to.slot : null;
  const edgeId = deriveEdgeId(relation, from.nodeId, to.nodeId, slot);
  if (ledger.has(edgeId)) {
    return { ok: false, reason: `edge-exists: "${edgeId}"` };
  }
  if (relation === "power") {
    for (const edge of ledger.values()) {
      if (edge.relation === "power" && edge.to === to.nodeId && edge.slot === to.slot) {
        return {
          ok: false,
          reason: `slot-occupied: "${to.nodeId}" slot "${to.slot}" already fed by "${edge.from}"`,
        };
      }
    }
    // Cycle law: walking UP the power suppliers of `from`, reaching `to`
    // would close a loop (the door walks the same rail).
    const seen = new Set<string>();
    const stack = [from.nodeId];
    while (stack.length > 0) {
      const at = stack.pop() as string;
      if (at === to.nodeId) {
        return { ok: false, reason: `power-cycle: "${to.nodeId}" already feeds "${from.nodeId}" upstream` };
      }
      if (seen.has(at)) continue;
      seen.add(at);
      for (const edge of ledger.values()) {
        if (edge.relation === "power" && edge.to === at) stack.push(edge.from);
      }
    }
  }
  return {
    ok: true,
    card: { kind: "connect", relation, from: from.nodeId, to: to.nodeId, slot, edgeId },
  };
}

export function predictDisconnect(
  edgeId: string,
  ledger: ReadonlyMap<string, CableEdge>,
): PredictVerdict {
  const edge = ledger.get(edgeId);
  if (edge === undefined) return { ok: false, reason: `unknown-edge: "${edgeId}"` };
  return {
    ok: true,
    card: {
      kind: "disconnect",
      edgeId: edge.edgeId,
      relation: edge.relation,
      from: edge.from,
      to: edge.to,
      slot: edge.slot,
    },
  };
}

/* ════════════════════════════ the intent machine ════════════════════════════ */

export type MintArgs = Readonly<Record<string, string | number | bigint | null>>;

/** mintBoardIntent — the wire shape the door parses: `verb` discriminator
 *  FIRST, then every key of the verb's MINT_SHAPES row (nulls spelled). */
export function mintBoardIntent(verb: BoardVerb, args: Record<string, string | null>): MintArgs {
  return Object.freeze({ verb, ...args });
}

export interface RefusalChip {
  readonly verb: string;
  readonly reason: string;
  readonly tick: string;
  /** "wire" = the door itself refused; "preview" = client-side bounce
   *  (shape law, dark desk, refused-before-mint). */
  readonly source: "wire" | "preview";
}

interface PendingToken {
  readonly verb: BoardVerb;
  readonly edge?: CableEdge;
  readonly nodeId?: string;
}

export interface BoardIntentOptions {
  readonly sink?: ((args: MintArgs, clock: ClockKind) => void) | null;
  readonly handCapacity?: number;
}

/** §7.5 default hand rail for the sandbox — drift-pinned (boardIntent.test)
 *  against the runner's `options.build?.hands ?? 2`. */
export const SANDBOX_HAND_CAPACITY = 2;

export class BoardIntentMachine {
  private sink: ((args: MintArgs, clock: ClockKind) => void) | null;
  readonly handCapacity: number;

  /** In-flight tokens, FIFO per verb (door receipts arrive feed-order). */
  private readonly _pending: PendingToken[] = [];
  /** Cables learned from the wire (executed connect ADDS, pulled REMOVES). */
  private readonly _ledger = new Map<string, CableEdge>();
  /** Depths this seat configured, seeded from the authored roster. The door's
   *  configure detail carries no node id (fog law), so rule-deck depth
   *  shifts stay honestly invisible here — wire-truth covers what it can. */
  private readonly _depths = new Map<string, string>(Object.entries(AUTHORED_DEPTHS));
  private readonly _roster = new Set<string>(AUTHORED_NODES);
  private _placed = 0;
  private _chip: RefusalChip | null = null;
  private _lastSeq = -1;
  private _tick = "0";

  wiring = false;
  armedPort: string | null = null;
  dragPoint: ScreenPoint | null = null;
  menuNode: string | null = null;
  preview: TermsCard | null = null;

  private _version = 0;
  private readonly _watchers = new Set<() => void>();

  constructor(options: BoardIntentOptions = {}) {
    this.sink = options.sink ?? null;
    this.handCapacity = options.handCapacity ?? SANDBOX_HAND_CAPACITY;
  }

  /* ── observation surface (HUD + tests) ── */

  get version(): number {
    return this._version;
  }
  subscribe(fn: () => void): () => void {
    this._watchers.add(fn);
    return () => this._watchers.delete(fn);
  }
  get pending(): readonly PendingToken[] {
    return this._pending;
  }
  get ledger(): ReadonlyMap<string, CableEdge> {
    return this._ledger;
  }
  get roster(): ReadonlySet<string> {
    return this._roster;
  }
  depthOf(nodeId: string): string {
    return this._depths.get(nodeId) ?? "unknown";
  }
  /** g3 ROC law: armed = anything but pass-through. */
  defenseOn(nodeId: string): boolean {
    return this.depthOf(nodeId) !== "pass-through";
  }
  get chip(): RefusalChip | null {
    return this._chip;
  }
  get hasSink(): boolean {
    return this.sink !== null;
  }
  setSink(fn: ((args: MintArgs, clock: ClockKind) => void) | null): void {
    this.sink = fn;
    this.bump();
  }
  /** Tick as display text (the wire tick is a branded bigint). */
  get tick(): string {
    return this._tick;
  }

  /* ── sorted views (text law: code units) ── */

  sortedNodes(): string[] {
    return [...this._roster].sort(compareCodeUnits);
  }
  sortedPorts(): readonly BoardPort[] {
    return BOARD_PORTS.slice().sort((a, b) => compareCodeUnits(a.portId, b.portId));
  }
  sortedEdges(): CableEdge[] {
    return [...this._ledger.values()].sort((a, b) => compareCodeUnits(a.edgeId, b.edgeId));
  }

  private bump(): void {
    this._version += 1;
    for (const fn of this._watchers) fn();
  }

  /* ── sending (the ONLY mint door) ── */

  private send(verb: BoardVerb, args: Record<string, string | null>, meta: PendingToken): boolean {
    if (this.sink === null) {
      // NodeActRow's dark-desk law: without a door there is nothing to
      // refuse you — the rail itself says so. Nothing mints, nothing pays.
      this._chip = { verb, reason: "no-door-attached", tick: this._tick, source: "preview" };
      this.bump();
      return false;
    }
    for (const key of MINT_SHAPES[verb]) {
      if (!(key in args)) throw new Error(`boardIntent[bad-mint]: ${verb} missing arg "${key}"`);
    }
    if (Object.keys(args).some((key) => !MINT_SHAPES[verb].includes(key))) {
      throw new Error(`boardIntent[bad-mint]: ${verb} carries an unlisted arg key`);
    }
    this._pending.push(meta);
    this.sink(mintBoardIntent(verb, args), BOARD_CLOCK);
    this.bump();
    return true;
  }

  private bouncePreview(verb: BoardVerb, reason: string): void {
    this._chip = { verb, reason, tick: this._tick, source: "preview" };
    this.armedPort = null;
    this.dragPoint = null;
    this.bump();
  }

  /* ── pointer/keyboard grammar ── */

  toggleWiring(): void {
    this.wiring = !this.wiring;
    if (!this.wiring) {
      this.armedPort = null;
      this.dragPoint = null;
    }
    this.bump();
  }

  /** Plate tap (non-wiring): open the configure menu for that node. */
  tapNode(nodeId: string): void {
    if (this.wiring) return;
    this.menuNode = nodeId;
    this.bump();
  }

  closeMenu(): void {
    this.menuNode = null;
    this.bump();
  }

  /** g4 activate law on ports: Enter arms a source; Enter on another port
   *  attempts the target; re-pressing the armed port disarms. */
  armPort(portId: string): void {
    if (!this.wiring) return; // wiring mode is the door to the cable grammar
    if (this.armedPort === null) {
      this.armedPort = portId;
      this.bump();
      return;
    }
    if (this.armedPort === portId) {
      this.armedPort = null;
      this.bump();
      return;
    }
    this.attemptConnect(this.armedPort, portId);
  }

  dragStart(portId: string): void {
    if (!this.wiring) return;
    this.armedPort = portId;
    this.dragPoint = null;
    this.bump();
  }

  dragMove(point: ScreenPoint): void {
    if (this.armedPort === null) return;
    this.dragPoint = point;
    this.bump();
  }

  /** Release over nothing mints NOTHING (g4's Escape-law in pointer form). */
  dragEnd(portId: string | null): void {
    if (this.armedPort === null) return;
    const from = this.armedPort;
    this.dragPoint = null;
    if (portId !== null && portId !== from) {
      this.attemptConnect(from, portId);
      return;
    }
    this.armedPort = null;
    this.bump();
  }

  attemptConnect(fromPortId: string, toPortId: string): void {
    const from = PORT_BY_ID.get(fromPortId);
    const to = PORT_BY_ID.get(toPortId);
    if (from === undefined || to === undefined) return;
    const verdict = predictConnect(from, to, this._ledger, this._roster);
    this.armedPort = null;
    this.dragPoint = null;
    if (!verdict.ok) {
      this.bouncePreview("connect-ports", verdict.reason);
      return;
    }
    this.preview = verdict.card;
    this.bump();
  }

  /** Pull a cable chip (ledger row): opens the disconnect terms card. */
  pullCable(edgeId: string): void {
    const verdict = predictDisconnect(edgeId, this._ledger);
    if (!verdict.ok) {
      this.bouncePreview("disconnect-drain", verdict.reason);
      return;
    }
    this.preview = verdict.card;
    this.bump();
  }

  /** Terms dialog Enter — the ONLY place a connect/disconnect mints. */
  confirmPreview(): boolean {
    const card = this.preview;
    if (card === null) return false;
    this.preview = null;
    if (card.kind === "connect") {
      return this.send(
        "connect-ports",
        { relation: card.relation, from: card.from, to: card.to, slot: card.slot },
        {
          verb: "connect-ports",
          edge: {
            edgeId: card.edgeId,
            relation: card.relation,
            from: card.from,
            to: card.to,
            slot: card.slot,
          },
        },
      );
    }
    return this.send("disconnect-drain", { edgeId: card.edgeId }, { verb: "disconnect-drain" });
  }

  /** Escape cancels — mints nothing (g4 terms-card law, verbatim). */
  cancelPreview(): void {
    if (this.preview === null) return;
    this.preview = null;
    this.bump();
  }

  /* ── configure menu grammar (tap a plate) ── */

  chooseDepth(nodeId: string, depth: InspectionDepth): boolean {
    const sent = this.send(
      "configure-node",
      { nodeId, inspectionDepth: depth, shedOrder: null },
      { verb: "configure-node", nodeId },
    );
    this.menuNode = null;
    return sent;
  }

  chooseShed(nodeId: string, order: ShedOrder): boolean {
    const sent = this.send(
      "configure-node",
      { nodeId, inspectionDepth: null, shedOrder: order },
      { verb: "configure-node", nodeId },
    );
    this.menuNode = null;
    return sent;
  }

  /** toggle-defense v0: the door has no toggle-defense verb — the honest
   *  map is the g3 ROC pair on ConfigureNode depth: armed ⇄ pass-through
   *  (the front door's `sample-1-in-20` opening is ALREADY armed). */
  toggleDefense(nodeId: string): boolean {
    const next: InspectionDepth = this.defenseOn(nodeId) ? "pass-through" : "inspect";
    const sent = this.send(
      "configure-node",
      { nodeId, inspectionDepth: next, shedOrder: null },
      { verb: "configure-node", nodeId },
    );
    this.menuNode = null;
    return sent;
  }

  /** place-device executes in the sandbox (no canPlaceDevice validator is
   *  configured) — an honest live witness. The router is code-defined, so
   *  the new plate lands idle on the bench shelf. */
  placeDevice(kind: DeviceKind): boolean {
    const nodeId = `bench-${this._placed + 1}`;
    this._placed += 1;
    const sent = this.send("place-device", { nodeId, deviceKind: kind, template: null }, { verb: "place-device", nodeId });
    this.menuNode = null;
    return sent;
  }

  /* ── wire fold (the projection is the ONLY ground truth) ── */

  ingest(projection: SimProjection): void {
    if (projection.seq <= this._lastSeq) return; // rAF re-read guard: fold once
    this._lastSeq = projection.seq;
    this._tick = String(projection.tick);
    for (const notice of projection.notices) {
      if (notice.kind !== "intent-executed" && notice.kind !== "intent-refused") continue;
      const detail = notice.detail ?? "";
      const head = detail.indexOf(": ");
      const verb = (head === -1 ? detail : detail.slice(0, head)) as BoardVerb;
      const rest = head === -1 ? "" : detail.slice(head + 2);
      if (notice.kind === "intent-refused") {
        this.releaseToken(verb);
        this._chip = { verb, reason: rest, tick: this._tick, source: "wire" };
        continue;
      }
      this.foldExecuted(verb, rest);
    }
    this.bump();
  }

  private foldExecuted(verb: BoardVerb, detail: string): void {
    switch (verb) {
      case "connect-ports": {
        const token = this.releaseToken(verb);
        if (token?.edge !== undefined) {
          this._ledger.set(token.edge.edgeId, token.edge);
          return;
        }
        // Rule-deck connect (none in the shipped decks): fold slot-free from
        // the detail — the honest best reading of the wire.
        const m = /^([a-z-]+):([a-zA-Z0-9_-]+)->([a-zA-Z0-9_-]+)$/.exec(detail);
        if (m === null) return;
        const relation = m[1] as BoardRelation;
        const edgeId = deriveEdgeId(relation, m[2] as string, m[3] as string, null);
        this._ledger.set(edgeId, { edgeId, relation, from: m[2] as string, to: m[3] as string, slot: null });
        return;
      }
      case "disconnect-drain": {
        this.releaseToken(verb);
        if (detail.startsWith("drain-started:")) return; // the pull is a later frame
        const edgeId = detail.startsWith("pulled:") ? detail.slice("pulled:".length) : detail;
        this._ledger.delete(edgeId);
        return;
      }
      case "configure-node": {
        // The door's detail (`depth=<d>`, `shed=<s>`, or both comma-joined)
        // carries no node id; THIS seat's in-flight token is the anchor.
        const token = this.releaseToken(verb);
        if (token?.nodeId === undefined) return;
        for (const segment of detail.split(",")) {
          if (segment.startsWith("depth=")) {
            this._depths.set(token.nodeId, segment.slice("depth=".length));
          }
        }
        return;
      }
      case "place-device": {
        const token = this.releaseToken(verb);
        if (token?.nodeId !== undefined) {
          this._roster.add(token.nodeId);
          this._depths.set(token.nodeId, "pass-through"); // the door's placement default
        }
        return;
      }
    }
  }

  /** Pop the first in-flight token of this verb (FIFO per verb; a rule-deck
   *  receipt with the same verb may consume one early — honest rail, the
   *  engine never was). */
  private releaseToken(verb: BoardVerb): PendingToken | undefined {
    const at = this._pending.findIndex((t) => t.verb === verb);
    if (at === -1) return undefined;
    return this._pending.splice(at, 1)[0];
  }
}

export function createBoardIntentMachine(options?: BoardIntentOptions): BoardIntentMachine {
  return new BoardIntentMachine(options);
}
