/**
 * `apps/proto/src/chrome/coopRoomWire.ts` — the WIRE-mode incident room
 * controller (lane L-WS-B, ADR-0017): one browser seat of the two-browser
 * co-op demo over the hh-coop-transport@1 dev wire.
 *
 * Topology (b), the portable-lib bet made playable (MASTER_REPORT §2 MP-
 * topology ruling, proven by the relay spike @9a3d508): each browser boots
 * its OWN local sim (the relay package's `createSpikeRunner` — the real
 * intent door, pre-step, nothing re-stamped) and converges by consuming the
 * HUB-STAMPED shared log. There is no client authority and no host sim: the
 * only channel between seats is the stamped CoopTimelineRecord stream.
 *
 * BOOT-SEED LAW (the demo's one fragile convention, stated loudly): both
 * windows MUST boot the same run seed. The default `COOP_WIRE_BOOT_SEED`
 * (904n — the house prototype seed) makes that automatic for any two windows
 * on the same build; overriding `seed` per window breaks convergence by
 * construction and nothing here can catch it. Equal seed + equal hub-stamped
 * feed + equal pump count ⇒ equal digestState frames (the spike claim,
 * reused verbatim).
 *
 * PUMP LAW (I-T §3, truth 7): the transport client applies inbound ONLY on
 * `drain()`, so the controller owns the per-loop pump — and it is USER-GATED
 * (button clicks). Zero timers, zero rAF, zero scheduling inside this file;
 * CoopRoom's zero-timer mount pin survives because construction happens on
 * the connect click, never on mount.
 *
 * DOOR FEED SHAPE (mirror of tools/relay runner.ts:53-93, NOT a re-stamp):
 * `pump(n)` drains → `client.feedToDoor()` (orderCoopTimeline → action arm →
 * ExternalIntent[], the relay.feedFrom behavioral twin pinned in transport's
 * suite) → `runner.runTicks(feed, n)`. Intents stamped at future hub ticks
 * wait as pause-with-orders and fire when the local clock reaches them;
 * intents stamped behind the local clock are already-dead frames (counted
 * out honestly — late arrival past your tick is exactly what real RTT will
 * model later, unmodeled here by ruling).
 *
 * OUTBOUND DOOR SHAPE: actions ride `{ args: RELAY_ACTION_BUILDERS[verb](…) }`
 * — the builders throw locally on non-door-shaped args (relay[bad-action])
 * BEFORE a byte leaves the tab; inbound, the client's own envelope law
 * (assertActionEnvelope + the strict coopTimeline parser at the codec) is the
 * second gate, and the door's parseEntry is the final authority (R2 posture:
 * the relay carries, the door refuses).
 *
 * v0 honest gaps (disclosed, not patched): re-connecting the SAME seat id on
 * a dead socket without a prior leave() hits the hub's double-open-row
 * refusal as a fault frame (the dev carrier prunes routes, not tenures);
 * no auth, localhost carrier only. The per-seat fog rider (lane L-THIN,
 * ADR-0017 #7 owe) IS now surfaced — read-only through wireView()/
 * wireViewSeenAt() into CoopRoom's own column; a carrier without a wired
 * projectionSource (the plain relay carrier; the host-sim `--sim` one HAS
 * it) sends no rider and the seat sees the honest no-rider state, never a
 * fabricated view.
 */
import { createTransportClient } from "transport-tools";
import type { SeatLedgerWire, SeatViewWire, TransportClient } from "transport-tools";
import type { ScopedReadView } from "@hh/sim-core/observed";
import { RELAY_ACTION_BUILDERS, createSpikeRunner } from "relay-tools";
import type { SpikeRunner } from "relay-tools";
import type { CoopTimelineRecord } from "@hh/sim-core/replay";
import { asEntityId, asRunSeed, PlayerVerb } from "@hh/sim-core/types";
import type { EntityId, GameState, HashHex, RunSeed, SimTick } from "@hh/sim-core/types";
import { createWsClientPort } from "../transport/wsClientPort";
import type { WsSocketFactory } from "../transport/wsClientPort";
import type { CoopTapeRow } from "./coopRoom";

/** The two-window convergence convention, pinned as a value (see header). */
export const COOP_WIRE_BOOT_SEED: RunSeed = asRunSeed(904n);

/** Catch-up guard: a page idled across many hub ticks still advances a
 *  BOUNDED number of door steps per click (fail loud, never livelock). */
const MAX_CATCH_UP_STEPS = 10_000;

function failWire(code: string, detail: string): never {
  throw new RangeError(`coop-wire[${code}]: ${detail}`);
}

export interface CoopRoomWireOptions {
  readonly url: string;
  readonly seat: string;
  /** Boot-seed law: only pass this when BOTH windows pass the SAME override. */
  readonly seed?: RunSeed;
  /** Test seam: scripted socket instead of the real browser WebSocket. */
  readonly socketFactory?: WsSocketFactory;
}

export interface WireTenureRow {
  readonly participantId: string;
  readonly joinedAtTick: string;
  readonly leftAtTick: string | null;
  readonly open: boolean;
}

export interface CoopRoomWire {
  readonly seat: EntityId;
  /** Carrier truth: OPEN socket right now (never our wish). */
  connected(): boolean;
  droppedSends(): number;
  /** Ask the hub to open a tenure (construction joins automatically; re-join
   *  after leave() is the L-RH re-join-as-new-row law, live). */
  join(): void;
  leave(): void;
  /** The user-gated pump (truth 7): drain the wire, advance the LOCAL sim
   *  `ticks` door steps fed by the hub-stamped feed. Returns steps taken. */
  pump(ticks?: number): number;
  /** Pump the local clock up to the newest HUB STAMP (0 when already there,
   *  throws coop-wire[catch-up-runs-away] beyond the bounded guard). */
  catchUp(): number;
  submitNote(text: string): void;
  submitSightline(lane: string): void;
  submitAction(verb: PlayerVerb, args: Readonly<Record<string, unknown>>): void;
  /** Wire twin of coopRoom.buildTape — same row shape, newest first. */
  tapeRows(limit: number): readonly CoopTapeRow[];
  ledgerRows(): readonly WireTenureRow[];
  localDigest(): HashHex | null;
  /** The LOCAL sim's state — demo witness for door receipts (hands/busy
   *  tokens). Read-only by convention; the runner owns every write. */
  runnerState(): GameState;
  runnerTick(): SimTick;
  /** Hub tick as witnessed by the newest shared-log stamp (null while the
   *  room has stamped nothing). */
  hubTick(): SimTick | null;
  /** Read-through of the seat's FOG RIDER: the decoded ScopedReadView the hub
   *  last sent to THIS seat (client.observed() — the fog.ts decode of the
   *  seat-state `view` rider), null when no rider has arrived. DISPLAY-SIDE
   *  ONLY: nothing in this file feeds it to the runner or game state, and it
   *  deliberately never touches state/observedStore.ts — the store is the SP
   *  read door, this is the wire read door, and the two columns stay
   *  separate on purpose (coopSeatView.ts header law). */
  wireView(): ScopedReadView | null;
  /** Local sim tick of the pump on which the CURRENT rider was delivered
   *  (null until a rider has been drained). Truth 7 applies: bytes sitting
   *  in the inbound queue have NOT been seen — the clock only stamps on the
   *  pump's drain. Honest clock note: the frame's carrier sentAtTick is not
   *  carried through the transport client's API (a tools/transport field
   *  this lane does not own), so the LOCAL delivery pump is what the column
   *  witnesses — disclosed deviation from the lane brief's wording. */
  wireViewSeenAt(): SimTick | null;
  faultsText(): readonly string[];
  dispose(): void;
}

/** Half-open [joined, left) seating check over the WIRED ledger copy — the
 *  participantSeatedAt law re-expressed on decimal strings (never trusting
 *  the array tail: rows ride ledger order, re-joins are disjoint windows). */
function seatedAt(ledger: SeatLedgerWire | null, participantId: string, tick: bigint): boolean {
  if (ledger === null) return false;
  for (const row of ledger.seatHolders) {
    if (row.participantId !== participantId) continue;
    const joined = BigInt(row.joinedAtTick);
    if (tick < joined) continue;
    if (row.leftAtTick === undefined || tick < BigInt(row.leftAtTick)) return true;
  }
  return false;
}

function wirePayloadText(record: CoopTimelineRecord): string {
  if (record.kind === "action") {
    const args = (record.payload["args"] ?? {}) as Readonly<Record<string, unknown>>;
    return `verb=${String(args["verb"] ?? "?")}`;
  }
  if (record.kind === "note") return String(record.payload["text"] ?? "");
  return `sight → ${String(record.payload["lane"] ?? record.payload["view"] ?? "?")}`;
}

export function createCoopRoomWire(options: CoopRoomWireOptions): CoopRoomWire {
  if (options.seat.length === 0) failWire("empty-seat", "the seat id must be a non-empty string — the hub routes and seats by it");
  const seed = options.seed ?? COOP_WIRE_BOOT_SEED;
  const port = createWsClientPort(options.url, options.seat, options.socketFactory);
  const client: TransportClient = createTransportClient(port, options.seat);
  const runner: SpikeRunner = createSpikeRunner({ runSeed: seed });

  /** Rider-delivery witness (display-side): the LAST raw rider object the
   *  client applied, by identity. decodeScopedView hands a fresh wire object
   *  per seat-state frame, so identity change == a fresh rider was SENT to
   *  this seat and drained here (truth 7 — queued bytes are not seen until
   *  the pump's drain). */
  let lastRider: SeatViewWire | null | undefined = undefined;
  let viewSeenAtTick: SimTick | null = null;

  client.join(); // first frame out binds the socket route (truth 5)
  client.runCatchUp(); // joiner history arrives as paged catch-up (re-join story is ONE frame type)

  function tapeRowOf(record: CoopTimelineRecord): CoopTapeRow {
    return Object.freeze({
      key: `${record.tick}:${record.seq}`,
      tick: record.tick.toString(),
      seq: record.seq,
      participantId: record.participantId,
      label: record.participantId, // wire seats are free-form ids — raw id IS the label (demo cast has no entry here)
      kind: record.kind,
      seated: seatedAt(client.ledger(), record.participantId, record.tick),
      payloadText: wirePayloadText(record),
    });
  }

  return {
    seat: asEntityId(options.seat),
    connected: () => port.isOpen(),
    droppedSends: () => port.droppedSends(),

    join(): void {
      client.join();
    },
    leave(): void {
      client.leave();
    },

    pump(ticks = 1): number {
      if (!Number.isSafeInteger(ticks) || ticks < 1) return 0; // early exit: zero and nonsense advance nothing (not even a drain)
      client.drain();
      const rider = client.view(); // raw wire identity BEFORE the sim steps — this pump applied whatever arrived
      runner.runTicks(client.feedToDoor(), ticks); // the relay-runner door-feed shape verbatim (no re-stamping)
      if (rider !== null && rider !== lastRider) viewSeenAtTick = runner.tick();
      lastRider = rider;
      return ticks;
    },

    catchUp(): number {
      client.drain();
      const stamp = client.hubLastStamp();
      if (stamp === null) return 0; // nothing stamped yet — the local clock is ahead by definition
      const gap = BigInt(stamp.tick) - runner.tick() + 1n;
      if (gap < 1n) return 0; // local clock already past the newest stamp — late records are dead frames (see header)
      if (gap > BigInt(MAX_CATCH_UP_STEPS)) {
        failWire("catch-up-runs-away", `hub stamp ${stamp.tick} is ${gap} ticks ahead of local ${runner.tick()} — past the ${MAX_CATCH_UP_STEPS}-step bound; reload the seat instead of livelocking the tab`);
      }
      return this.pump(Number(gap));
    },

    submitNote(text: string): void {
      client.submit("note", { text });
    },

    submitSightline(lane: string): void {
      client.submit("sightline", { lane });
    },

    submitAction(verb: PlayerVerb, args: Readonly<Record<string, unknown>>): void {
      const build = RELAY_ACTION_BUILDERS[verb];
      if (build === undefined) {
        failWire("unbuilt-action", `"${verb}" has no seat-side builder [${Object.keys(RELAY_ACTION_BUILDERS).join(", ")}] — widen the relay's builders, do not hand-forge args here`);
      }
      client.submit("action", { args: build(args) }); // builder throws relay[bad-action] locally BEFORE the byte leaves (header law)
    },

    tapeRows(limit: number): readonly CoopTapeRow[] {
      if (!Number.isSafeInteger(limit) || limit < 1) failWire("bad-limit", `tape limit must be a safe integer ≥ 1, got ${String(limit)}`);
      return Object.freeze([...client.records()].reverse().slice(0, limit).map(tapeRowOf));
    },

    ledgerRows(): readonly WireTenureRow[] {
      const ledger = client.ledger();
      if (ledger === null) return Object.freeze([]);
      return Object.freeze(
        ledger.seatHolders.map((row) =>
          Object.freeze({
            participantId: row.participantId,
            joinedAtTick: row.joinedAtTick,
            leftAtTick: row.leftAtTick ?? null,
            open: row.leftAtTick === undefined,
          }),
        ),
      );
    },

    localDigest(): HashHex | null {
      const frames = runner.frames();
      return frames[frames.length - 1] ?? null;
    },
    runnerState: () => runner.state(),
    runnerTick: () => runner.tick(),
    hubTick(): SimTick | null {
      const stamp = client.hubLastStamp();
      return stamp === null ? null : BigInt(stamp.tick);
    },
    wireView: (): ScopedReadView | null => client.observed(),
    wireViewSeenAt: () => viewSeenAtTick,
    faultsText: () => Object.freeze(client.faults().map((fault) => `${fault.against}: ${fault.cause}`)),
    dispose(): void {
      port.close();
    },
  };
}
