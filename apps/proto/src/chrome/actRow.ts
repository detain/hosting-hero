/**
 * actRow — §7.16 "The Two-Action Rule" as PURE law (L-HUD, 2026-10-17).
 *
 * The emergency desk promise: an object's inspector carries an Act row of
 * at most FOUR one-click verbs above everything else — drain, restart,
 * isolate, shed. All four are door-built (disconnect-drain, restart-node
 * @fd91138, isolate-node @86cff89, shed-load); this module additionally
 * surfaces the tier successors (throttle-node @81b0589, reclaim-node
 * @c8b92a2) and the live-book readouts (warmth via scale-node @8037a4f,
 * shield via shield-node @d3b1db3) in a second DESK section — the spec's
 * "at most four" is honored by keeping the act section four-verb.
 *
 * Every status line is derived through the engine's OWN as-of reader laws
 * (@hh/sim-core/pipeline): nodeIsolated / nodeThrottleCut / nodeRestartWindow
 * / reclaimInForce / scaleWarmInForce / nodeShielded — the HUD never
 * re-implements arm/expire/tombstone-void semantics (parse-don't-validate:
 * the books are already trusted state; the minute clock rides the driver's
 * own shieldBusinessMinuteOf law, imported not duplicated).
 *
 * Every minted payload matches the door's VERB_ARG_SHAPES exactly — all
 * keys present, nulls spelled — pinned red/green by a source-read drift
 * test against intent-door.ts (scenario/doc.ts mirror precedent).
 *
 * Node-env pure: no Vue, no timers, no DOM. Frozen all the way down.
 */
import {
  PlayerVerb,
  asEntityId,
  type BoardEdgeRecord,
  type EntityId,
  type GameState,
  type PlayerVerbArgs,
  type ReclaimEntry,
  type SimEvent,
  type SimTick,
} from "@hh/sim-core/types";
import {
  nodeIsolated,
  nodeRestartWindow,
  nodeShielded,
  nodeThrottleCut,
  reclaimIndex,
  reclaimInForce,
  scaleWarmInForce,
  shieldBusinessMinuteOf,
  voidedByTombstone,
} from "@hh/sim-core/pipeline";

/* ─────────────────────────── taste + law constants ─────────────────────────── */

/** PROVISIONAL taste row (owner-ratify owed, ADR-0017 register): the
 *  one-click bounded restart window. §7.16's restart is a BOOT, not a
 *  fence — the door REQUIRES a release minute (an unbounded restart is
 *  isolate-node under another name), so the desk mints a short window. */
export const RESTART_WINDOW_MINUTES = 5;

/** Isolate-lift law mirror: the door has NO un-isolate verb. The honest
 *  "end it now" is a replacement entry releasing at the NEXT minute
 *  boundary, labelled that way in every UI string. */
export const LIFT_AT_NEXT_MINUTE = 1;

/* ──────────────────────────────── error family ─────────────────────────────── */

export class ActRowError extends Error {
  override name = "ActRowError";
}

function fail(where: string, detail: string): never {
  throw new ActRowError(`act[missing-option] at '${where}': ${detail}`);
}

/* ───────────────────────────────── mints ───────────────────────────────────── */

export interface ActMintOptions {
  /** throttle-node: how many slots the ceiling loses (>=1; 0 = lift). */
  readonly cutSlots?: number;
  /** restart-node: closed vocab {drop, keep} — the door's refusal space. */
  readonly dropQueued?: "drop" | "keep";
  /** disconnect-drain: the board edge to pull (the v0 plain pull stays law). */
  readonly edgeId?: string;
  /** scale-node: total reserved warmth slots after this commit. */
  readonly reservedSlots?: number;
  /** isolate-node: true = lift at the next minute boundary (LWW replace). */
  readonly lift?: boolean;
}

/**
 * Mint ONE door-shaped player-verb payload (the args arm of
 * PlayerVerbPayload). Every VERB_ARG_SHAPES key is present, nulls spelled
 * — a missing key is structural garbage the door THROWS on, so this is
 * the only legal mint site. Keys quoted from intent-door.ts (drift-pinned
 * by actRow.test.ts against the door source, not this comment):
 *   disconnect-drain {edgeId}
 *   shed-load        {nodeId, qosClassId}
 *   scale-node       {targetNodeId, reservedSlots, effectiveAtBusinessMinute}
 *   isolate-node     {targetNodeId, effectiveAtBusinessMinute, releaseAtBusinessMinute}
 *   throttle-node    {targetNodeId, cutSlots, effectiveAtBusinessMinute, releaseAtBusinessMinute}
 *   restart-node     {targetNodeId, dropQueued, effectiveAtBusinessMinute, releaseAtBusinessMinute(REQUIRED)}
 *   reclaim-node     {targetNodeId, effectiveAtBusinessMinute}
 */
export function mintActIntent(
  verb: PlayerVerb,
  nodeId: string,
  nowMinute: number,
  options: ActMintOptions = {},
): PlayerVerbArgs {
  switch (verb) {
    case PlayerVerb.DisconnectDrain: {
      const edgeId = options.edgeId ?? fail(`${verb}.edgeId`, "drain needs the board edge id to pull");
      return Object.freeze({ verb, edgeId: asEntityId(edgeId) });
    }
    case PlayerVerb.ShedLoad:
      // v0 single honest directive chip: qosClassId null = "the shed order decides".
      return Object.freeze({ verb, nodeId: asEntityId(nodeId), qosClassId: null });
    case PlayerVerb.IsolateNode:
      return Object.freeze(
        options.lift === true
          ? { verb, targetNodeId: asEntityId(nodeId), effectiveAtBusinessMinute: null, releaseAtBusinessMinute: nowMinute + LIFT_AT_NEXT_MINUTE }
          : { verb, targetNodeId: asEntityId(nodeId), effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null },
      );
    case PlayerVerb.ThrottleNode: {
      const cutSlots = options.cutSlots ?? fail(`${verb}.cutSlots`, "throttle needs the notch count");
      return Object.freeze({ verb, targetNodeId: asEntityId(nodeId), cutSlots, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null });
    }
    case PlayerVerb.RestartNode:
      return Object.freeze({
        verb,
        targetNodeId: asEntityId(nodeId),
        dropQueued: options.dropQueued ?? "drop",
        effectiveAtBusinessMinute: null,
        releaseAtBusinessMinute: nowMinute + RESTART_WINDOW_MINUTES,
      });
    case PlayerVerb.ReclaimNode:
      return Object.freeze({ verb, targetNodeId: asEntityId(nodeId), effectiveAtBusinessMinute: null });
    case PlayerVerb.ScaleNode: {
      const reservedSlots = options.reservedSlots ?? fail(`${verb}.reservedSlots`, "warmth needs the total reserved count");
      return Object.freeze({ verb, targetNodeId: asEntityId(nodeId), reservedSlots, effectiveAtBusinessMinute: null });
    }
    default:
      throw new ActRowError(`act[not-act-row] at 'verb': '${verb}' has no one-click desk surface (yet)`);
  }
}

/** Dual-Clock law (§4.4): minute-window business acts ride the business
 *  clock; packet-world verbs (drain a cable, shed load) ride sim. */
export function actIntentClock(verb: PlayerVerb): "business" | "sim" {
  switch (verb) {
    case PlayerVerb.DisconnectDrain:
    case PlayerVerb.ShedLoad:
      return "sim";
    default:
      return "business";
  }
}

/* ───────────────────────────────── model ───────────────────────────────────── */

export interface ActAction {
  /** stable key → data-test suffix (`act-<key>` on the button). */
  readonly key: string;
  readonly label: string;
  readonly enabled: boolean;
  /** the door verb this action mints (never null on action rows today). */
  readonly verb: PlayerVerb;
  /** everything mintActIntent needs — computed HERE, the SFC stays dumb. */
  readonly options: ActMintOptions;
  /** disabled-state honesty line (flavour forum-chip precedent). */
  readonly title: string | null;
}

export interface ActRow {
  readonly verbKey: string;
  readonly section: "act" | "desk";
  /** as-of honest status; "" = idle. Rendered in the `act-status-<verbKey>` chip. */
  readonly status: string;
  readonly live: boolean;
  readonly actions: readonly ActAction[];
}

export interface ActRowModel {
  readonly nodeId: string;
  readonly nodeExists: boolean;
  readonly minute: number;
  readonly rows: readonly ActRow[];
}

interface BookLike {
  readonly entries: ReadonlyMap<EntityId, { readonly shippedAtTick: SimTick }>;
}

function inertBookingsUnderTombstone(state: GameState, id: EntityId, tomb: ReclaimEntry): number {
  const books: readonly (BookLike | undefined)[] = [state.scale, state.isolate, state.throttle, state.restart, state.maintain, state.schedule];
  let inert = 0;
  for (const book of books) {
    const entry = book?.entries.get(id);
    if (entry !== undefined && voidedByTombstone(entry.shippedAtTick, tomb)) inert += 1;
  }
  return inert;
}

function dataEdgesOf(state: GameState, id: EntityId): readonly BoardEdgeRecord[] {
  if (state.board === undefined) return [];
  const out: BoardEdgeRecord[] = [];
  for (const edge of state.board.edges.values()) {
    if (edge.relation === "data" && (edge.from === id || edge.to === id)) out.push(edge);
  }
  return out;
}

function row(key: ActRow["verbKey"], section: ActRow["section"], status: string, live: boolean, actions: readonly ActAction[]): ActRow {
  return Object.freeze({ verbKey: key, section, status, live, actions: Object.freeze([...actions]) });
}

/* ────────────────────────────── the derivation ─────────────────────────────── */

/**
 * Derive the frozen Act-row model for ONE node from the post-advance
 * GameState. Absent node ⇒ nodeExists:false with every action disabled —
 * the row never lies about a node that is not on the board.
 */
export function deriveActRow(state: GameState, nodeId: string): ActRowModel {
  const minute = shieldBusinessMinuteOf(state.context.clocks);
  const id = asEntityId(nodeId);
  const node = state.nodes.get(id);
  const exists = node !== undefined;
  const roster = node?.slots.length ?? 0;
  const reclaims = reclaimIndex(state.reclaim, minute);
  const tomb = reclaimInForce(state.reclaim, id, minute);
  const noNode = exists ? null : "no such node on this board";

  /* drain — §7.16's original: pull a DATA cable (v0 = plain pull, the
     drain-policy handshake stays opt-in engine law the HUD does not fake). */
  const edges = exists ? dataEdgesOf(state, id) : [];
  const drainActions: readonly ActAction[] = exists && edges.length > 0
    ? edges.map((edge) => {
        const peer = edge.from === id ? edge.to : edge.from;
        return Object.freeze({
          key: `drain:${edge.id}`,
          label: `drain → ${peer}`,
          enabled: true,
          verb: PlayerVerb.DisconnectDrain,
          options: Object.freeze({ edgeId: edge.id }),
          title: null,
        });
      })
    : [Object.freeze({
        key: "drain",
        label: "drain edge",
        enabled: false,
        verb: PlayerVerb.DisconnectDrain,
        options: Object.freeze({}),
        title: noNode ?? "no data edges wired here — the lab board ships cables-free (v0)",
      })];
  const drain = row("drain", "act", edges.length > 0 ? `${edges.length} data edge(s) to pull` : "", edges.length > 0, drainActions);

  /* restart — bounded flush window; the door requires the release minute. */
  const win = exists ? nodeRestartWindow(state.restart, id, minute, reclaims) : null;
  const restart = row(
    "restart",
    "act",
    win === null ? "" : `rebooting to m${win.releaseAtBusinessMinute} · queue ${win.dropQueued ? "flushing" : "kept"}`,
    win !== null,
    [
      Object.freeze({ key: "restart-drop", label: `restart · flush queue (${RESTART_WINDOW_MINUTES}m)`, enabled: exists, verb: PlayerVerb.RestartNode, options: Object.freeze({ dropQueued: "drop" as const }), title: noNode }),
      Object.freeze({ key: "restart-keep", label: `restart · keep queue (${RESTART_WINDOW_MINUTES}m)`, enabled: exists, verb: PlayerVerb.RestartNode, options: Object.freeze({ dropQueued: "keep" as const }), title: noNode }),
    ],
  );

  /* isolate — half-open [eff, rel) via the engine reader; lift = next-minute release. */
  const isoEntry = state.isolate?.entries.get(id);
  const isoLive = exists && nodeIsolated(state.isolate, id, minute, reclaims);
  const isoStatus = !exists
    ? ""
    : isoLive
      ? `FENCED ${isoEntry?.effectiveAtBusinessMinute === null || isoEntry?.effectiveAtBusinessMinute === undefined ? "now" : `since m${isoEntry.effectiveAtBusinessMinute}`}${
          isoEntry !== undefined && isoEntry.releaseAtBusinessMinute !== null ? ` · releases m${isoEntry.releaseAtBusinessMinute}` : " · indefinite"} · admits 0`
      : isoEntry === undefined
        ? ""
        : voidedByTombstone(isoEntry.shippedAtTick, tomb ?? undefined)
          ? "booking tombstoned — inert"
          : isoEntry.effectiveAtBusinessMinute !== null && minute < isoEntry.effectiveAtBusinessMinute
            ? `armed for m${isoEntry.effectiveAtBusinessMinute}`
            : isoEntry.releaseAtBusinessMinute !== null && minute >= isoEntry.releaseAtBusinessMinute
              ? `released at m${isoEntry.releaseAtBusinessMinute}`
              : "";
  const isolate = row("isolate", "act", isoStatus, isoLive, [
    Object.freeze({ key: "isolate", label: "isolate now", enabled: exists && !isoLive, verb: PlayerVerb.IsolateNode, options: Object.freeze({ lift: false }), title: noNode ?? (isoLive ? "already fenced — LWW replace is a no-op amendment" : null) }),
    Object.freeze({ key: "isolate-lift", label: "lift at next minute", enabled: isoLive, verb: PlayerVerb.IsolateNode, options: Object.freeze({ lift: true }), title: isoLive ? null : (noNode ?? "nothing to lift — release at the minute boundary, the door has no un-isolate") }),
  ]);

  /* shed — directive-only: the door books nothing, step-5 enforces. */
  const shed = row("shed", "act", exists ? "directive — the door books nothing; the shed order decides" : "", false, [
    Object.freeze({ key: "shed", label: "shed lowest-value load", enabled: exists, verb: PlayerVerb.ShedLoad, options: Object.freeze({}), title: noNode }),
  ]);

  /* throttle — the donut-shrink (§7.16 prose ~hosting_game:7806): ceiling =
     roster − cut; the door's bad-cut-slots ceiling is roster−1. */
  const cut = exists ? nodeThrottleCut(state.throttle, id, minute, reclaims) : null;
  const nextCut = (cut ?? 0) + 1;
  const atCeiling = exists && cut !== null && cut >= roster - 1;
  const ceilingTitle = roster <= 1 ? "1-slot node — a total fence is isolate-node" : `ceiling ${roster - 1} of ${roster} — for a total fence use isolate-node`;
  const throttle = row(
    "throttle",
    "desk",
    cut === null ? (exists ? `unthrottled — full ceiling of ${roster}` : "") : `ceiling ${roster - cut} of ${roster} — max visibly shrunk${atCeiling ? " · at ceiling" : ""}`,
    cut !== null,
    [
      Object.freeze({ key: "throttle-raise", label: "cut one notch", enabled: exists && nextCut <= roster - 1, verb: PlayerVerb.ThrottleNode, options: Object.freeze({ cutSlots: nextCut }), title: exists && nextCut > roster - 1 ? ceilingTitle : noNode }),
      Object.freeze({ key: "throttle-lift", label: "lift throttle", enabled: cut !== null, verb: PlayerVerb.ThrottleNode, options: Object.freeze({ cutSlots: 0 }), title: cut !== null ? null : (noNode ?? "not throttled") }),
    ],
  );

  /* reclaim — the tombstone: voids bookings shipped at-or-before the stamp. */
  const inert = tomb === null ? 0 : inertBookingsUnderTombstone(state, id, tomb);
  const reclaim = row(
    "reclaim",
    "desk",
    tomb === null ? "" : `tombstone ${tomb.effectiveAtBusinessMinute === null ? "now" : `m${tomb.effectiveAtBusinessMinute}`} — ${inert} booking(s) inert`,
    tomb !== null,
    [Object.freeze({ key: "reclaim", label: tomb === null ? "tombstone node" : "re-reclaim (tombstone moves)", enabled: exists, verb: PlayerVerb.ReclaimNode, options: Object.freeze({}), title: noNode })],
  );

  /* warmth — READOUT of the scale book + one trivial +1 reserve action. */
  const warm = exists ? scaleWarmInForce(state.scale, id, minute, reclaims) : null;
  const warmth = row(
    "warmth",
    "desk",
    !exists ? "" : warm === null ? `warmth: none reserved — effective ${roster}` : `warmth: +${warm.reservedSlots} reserved on base roster ${warm.baseRosterSlots} — effective ${warm.baseRosterSlots + warm.reservedSlots}`,
    warm !== null,
    [Object.freeze({ key: "warmth-plus", label: "reserve +1 slot", enabled: exists, verb: PlayerVerb.ScaleNode, options: Object.freeze({ reservedSlots: (warm?.reservedSlots ?? 0) + 1 }), title: noNode })],
  );

  /* shield — READOUT ONLY, never an act: protection-not-capacity, and the
     reclaim void law deliberately excludes it (L-DM5 exclusions pinned). */
  const shielded = exists && nodeShielded(state.shield, id, minute);
  const shield = row("shield", "desk", shielded ? "SHIELDED — exhaustion vetoes land here (readout only)" : "", shielded, []);

  return Object.freeze({ nodeId, nodeExists: exists, minute, rows: Object.freeze([drain, restart, isolate, shed, throttle, reclaim, warmth, shield]) });
}

/* ───────────────────────────── the receipt line ────────────────────────────── */

export interface ActReceipt {
  readonly kind: "executed" | "refused";
  readonly verb: string;
  /** door detail (executed) / raw `code: detail` reason (refused) — VERBATIM,
   *  refusals are law-teaching and the HUD must not launder them. */
  readonly text: string;
}

/** Last door receipt in the tick's frozen event stream, or null. */
export function deriveActReceipt(events: readonly SimEvent[]): ActReceipt | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = events[i];
    if (e === undefined) continue;
    if (e.kind === "intent-executed") return Object.freeze({ kind: "executed", verb: e.verb, text: e.detail ?? "" });
    if (e.kind === "intent-refused") return Object.freeze({ kind: "refused", verb: e.verb, text: e.reason });
  }
  return null;
}
