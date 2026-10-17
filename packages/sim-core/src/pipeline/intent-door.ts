/**
 * THE INTENT DOOR — the only legal door through which external (player or
 * re-fed rule) intents enter the deterministic sim (MASTER_REPORT §4.2
 * player action economy + Hands, §7.5 hands-as-action-slots, §7.13
 * tick-inserted intents / pause-with-orders). Closes proto friction #1
 * ("TickInputs has NO external-intent door").
 *
 * Laws this file obeys:
 *  - CANONICAL POSITION: the driver calls `applyIntentDoor` BEFORE step 1
 *    (arrival) each tick; entries are applied in (tick, seq) order — a fixed
 *    order over host-fed data, so two runs with the same schedule digest
 *    identically (×100-gated in __tests__/intent-door.test.ts);
 *  - EXECUTE-OR-REFUSE, NEVER CRASH-BUT-ALSO-NEVER-SILENT: VALUE-DOMAIN
 *    violations (speed ∉ {1,2,4}, empty-after-parse strings, unknown ids,
 *    slot taken, power cycle, hands exhausted…) become deterministic
 *    `intent-refused` events — no RNG is consulted anywhere here, no state
 *    changes, nothing is consumed. STRUCTURAL wire garbage — a primitive TYPE
 *    mismatch anywhere on the entry (stamp fields AND, per M2, every per-verb
 *    arg shape parsed in `parseEntry`) — throws `IntentDoorError` at the
 *    boundary (Law 2 parse-don't-validate + Law 4 fail-fast): a host feeding
 *    malformed wire data has a bug to find, not a game state to fork. The
 *    split is one law, not three handlers: type checks happen ONLY at parse,
 *    handlers trust their args and own the refusal space alone;
 *  - FEED UNIQUENESS (M4): a schedule is a SET of (tick, seq) stamps — a
 *    repeated pair within one `applyIntentDoor` feed is host programming
 *    garbage (two intents claiming one attribution identity) and throws,
 *    naming both offending input positions;
 *  - HANDS ARE PHYSICS (§7.5): every executed intent pays its verb's
 *    `handCost` tokens for `occupancyTicks` from `GameState.hands` — and a
 *    verb whose cost is 0 (toggle-speed by default, or any host override)
 *    books NOTHING: the rail is never touched (`if (cost > 0)` gates the
 *    whole allocation). Refusal never spends hands.
 *    Default occupancies follow the §7.5 reference durations (config change
 *    40s→1 tick, failover 90s→2, cable trace 3min→3; 1 tick = 1 sim-minute);
 *  - SCOPE DISCIPLINE: handlers mutate ONLY their named slice — nodes (place/
 *    configure), board (connect/disconnect), ruleBook (+hash) (commit),
 *    pricing (adjust-price — the OPTIONAL OD-24(a) part-1 override book,
 *    STATE-NEUTRAL: no revenue, no elasticity, no invoice math in the door),
 *    shield (shield-node — the OPTIONAL ADR-0014 #D2 corruption pre-arm book,
 *    STATE-NEUTRAL: the corrupts-channel veto is read at step 9 through
 *    pipeline/corruption.ts, never by the door),
 *    scale (scale-node — the OPTIONAL ADR-0015 reserved-warmth book,
 *    STATE-NEUTRAL: the warmth is materialized at the step-5/6 capacity read
 *    through pipeline/defaults.ts, never by the door — and the COST of
 *    warmth is not door-side either: the door never touches cash, host opex
 *    consumption of the book is the future seam),
 *    maintain (maintain-node — the OPTIONAL ADR-0015 maintenance-attendance
 *    book, STATE-NEUTRAL: the abandonment-die veto is read at step 9 through
 *    pipeline/defaults.ts `maintainInForce`, never by the door),
 *    schedule (schedule-window — the OPTIONAL ADR-0015 backup job-window
 *    book, STATE-NEUTRAL: the deadline substitution is read at step 9 for
 *    patience-mode "window" units through pipeline/defaults.ts
 *    `jobWindowInForce`/`jobBandDistanceUs`, never by the door),
 *    sell (sell-offer — the OPTIONAL ADR-0015 offer book, STATE-NEUTRAL by
 *    the OD-24(a) PART-1 POSTURE: the door books the offer, the host signs
 *    it through the EXISTING economy priceKey seam — no revenue, no money
 *    math, no acceptance dice in the door, ever),
 *    negotiate (negotiate-terms — the OPTIONAL ADR-0015 term book,
 *    STATE-NEUTRAL at the door: the money lane consumes the forwarded
 *    book (economy/negotiate.ts) by TILTING the cliff's EXISTING single
 *    retention draw and discounting the billing base at the chain head —
 *    the door casts no dice, moves no money, and never touches units),
 *    isolate (isolate-node — the OPTIONAL ADR-0015 session-6 fence book,
 *    STATE-NEUTRAL: new work is refused at the step-5 serve input through
 *    the driver-threaded fence set (the as-of law is pipeline/isolation.ts
 *    `nodeIsolated`/`isolatedNodeIds`, the gate is pipeline/defaults.ts
 *    `defaultServeStep` §(c)), never by the door; the door writes ONLY the
 *    book — no roster is written, no queue truncated, no unit evicted),
 *    throttle (throttle-node — the OPTIONAL ADR-0016 successor capacity-cut
 *    book, the dbaas card's OWN second verb ("isolate and throttle"),
 *    STATE-NEUTRAL: the cut discounts the step-5 ADMISSION ceiling through
 *    the driver-threaded cut map (the as-of law is pipeline/throttle.ts
 *    `nodeThrottleCut`/`throttleCuts`, the gate is pipeline/defaults.ts
 *    `defaultServeStep` §(c)), never by the door; the door writes ONLY the
 *    book — no roster is written (capacity-as-CLAMP; materialized shrink
 *    REJECTED — it would poison recovery's fullSlots capture), no queue
 *    truncated, no unit evicted; the door REFUSES `cut >= roster` pointing
 *    at `isolate-node`, so the fence stays the total case and every booked
 *    throttle is a PARTIAL cut),
 *    restart (restart-node — the OPTIONAL ADR-0016 successor reboot book,
 *    the LAST unbuilt §7.16 Act-row verb, STATE-NEUTRAL: while the bounded
 *    window is live the node admits nothing (the fence leg, driver-threaded
 *    `ServeInExt.restartFence`) and, in "drop" mode, its whole waiting queue
 *    walks the EXISTED hard-ceiling shed channel each in-window tick
 *    (§(c′), byte-for-byte the §(d) shape — driver reorder, rec#5
 *    attribution, R8 F-2 terminal PRESET branch, zero new event kinds, zero
 *    dice; the as-of law is pipeline/restart.ts
 *    `nodeRestartWindow`/`restartSets`), never by the door; the door writes
 *    ONLY the book — no roster is written, occupied arms are NEVER evicted
 *    (§(b) releases run first — completion-before-purge; true
 *    kill-in-flight stays DEFERRED); the release leg is REQUIRED on the
 *    wire (plain `number`): an unbounded restart would be `isolate-node`
 *    under another name, and the door refuses to fork the fence),
 *    reclaim (reclaim-node — the OPTIONAL ADR-0017 #3 tombstone book,
 *    STATE-NEUTRAL: the void is materialized at the six player-booking
 *    capacity reads (steps 5/9) through pipeline/reclaim.ts
 *    (`reclaimInForce`/`reclaimIndex`/`voidedByTombstone`), never by the
 *    door — the door writes ONLY the book: no roster written, no queue
 *    truncated, no occupied arm evicted, no unit/queue/board/cash/RNG
 *    touched; collecting an unbooked node is a legal no-op — the door keeps
 *    no "nothing-to-collect" refusal (the corpus spot law is "reclaimable
 *    at ANY moment"), and the shield pre-arm / recovery windows /
 *    priceKey-space books are load-bearing EXCLUSIONS of the void),
 *    hands+events (everything), events-only (shed-load/communicate/
 *    toggle-speed). units/lanes/observed/cash/ledger/contracts are NEVER
 *    reachable from the door (audit-tested by reference identity);
 *  - GROUND-TRUTH TOPOLOGY STAYS GROUND: `BoardState` is the pipeline-local
 *    structural embed (this module never imports topology/ — the topology
 *    lane's mutable MultiGraph keeps owning blast/domain math; edge ids
 *    follow topology's `defaultEdgeId` FORMAT for data and power edges only
 *    so hosts correlate those two views — control/trust suffix topology
 *    hangs on `domain`/`via` fields this slice does not carry, so their ids
 *    are door-local and not 1:1 correlatable);
 *  - pause-with-orders (§7.13): an entry stamped at the PAUSED tick arrives
 *    at the first unfrozen `advance` and applies then (tick <= current);
 *    future stamps are refused loudly, so "the whole schedule at once" host
 *    patterns fail visible instead of smearing across ticks. Each intent is
 *    fed EXACTLY ONCE (ambient-input contract, same as envelopes/evidence);
 *  - DRAIN BEFORE DISCONNECT (§7.2 R54, OPT-IN): with
 *    `config.drainPolicy.enabled` (DEFAULT OFF — v0 plain pull stays law),
 *    `disconnect-drain` becomes a two-phase choreography carried ENTIRELY by
 *    the EXISTING occupancy law, so the ratified BoardState/HandState wire
 *    shapes stay untouched: phase 1 reserves hands with
 *    `busyCauseId = drain:<edgeId>` for `drainTicks` (edge still present,
 *    still routable — in-flight is not dropped); when the reservation comes
 *    due, a DOOR-INTERNAL continuation (never a fed input) executes the pull
 *    as a due-queue entry BEFORE that tick's external intents, minting its
 *    own `intent-executed` event under the same `drain:<edgeId>` cause with
 *    detail `drained:<edgeId>` (v0's executed-pull detail is `pulled:<edgeId>`).
 *    The hand token IS the pending-disconnect record — the digest already
 *    absorbs cause + stamp, replays re-fire the continuation identically, and
 *    a started drain COMPLETES even if the host flips the policy off mid-drain
 *    (the promise lives in state, not config). `drain:<edgeId>` is the door's
 *    RESERVED continuation namespace; while enabled, occupancyTicks for
 *    disconnect-drain is superseded by drainTicks (the drain hold covers the
 *    whole choreography, and the pull lands exactly as the hand frees).
 */

import type {
  AdjustPriceArgs,
  BoardEdgeRecord,
  BoardRelation,
  BoardState,
  CauseId,
  CommunicateArgs,
  ConfigureNodeArgs,
  ConnectPortsArgs,
  DisconnectDrainArgs,
  EntityId,
  ExternalIntent,
  GameState,
  HandState,
  HandToken,
  InspectionDepth,
  IsolateArgs,
  IsolateBook,
  IsolateEntry,
  JobWindow,
  JobWindowBook,
  MaintainArgs,
  MaintainBook,
  MaintainWindow,
  NodeDiscipline,
  NodeRecord,
  NegotiateBook,
  NegotiateTermsArgs,
  NegotiationTerm,
  NegotiationTone,
  PlaceDeviceArgs,
  PlayerIntent,
  PolicyCard,
  PolicyCardCommitArgs,
  PriceOverrideBook,
  PriceOverrideRecord,
  PriceTargetKind,
  ReclaimArgs,
  ReclaimBook,
  ReclaimEntry,
  RestartArgs,
  RestartBook,
  RestartEntry,
  ScaleArgs,
  ScaleBook,
  ScaleEntry,
  ScheduleArgs,
  SellBook,
  SellOffer,
  SellOfferArgs,
  ShedLoadArgs,
  ShedOrder,
  ShieldArgs,
  ShieldBook,
  ShieldEntry,
  SimEvent,
  SimTick,
  SimTimeUs,
  ThrottleArgs,
  ThrottleBook,
  ThrottleEntry,
  TickContext,
  ToggleSpeedArgs,
} from "../types.ts";
import {
  asCauseId,
  asEntityId,
  PLAYER_VERBS,
  PlayerVerb,
} from "../types.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import { compareCodeUnits, fnv1a64OverCodePoints } from "../internal/canonical.ts";
import { compareEntityId } from "./internal.ts";
import { makeSlots } from "./queue.ts";
import { attentionRelease, attentionSpend } from "./attention.ts";
import type { AttentionState } from "../types.ts";

/* ═══════════════════════════ Errors & config ═══════════════════════════ */

/** Boundary parse failure — malformed wire TYPES (host bug). Distinct from
 *  refusal (semantic, in-game, event-logged). */
export class IntentDoorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntentDoorError";
  }
}

/** What the host's placement validator sees: the parsed args plus a READ-ONLY
 *  view of the state the device would land in. Returns null = accept, or a
 *  rejection reason that lands verbatim in the refusal event. Needs/provides
 *  checks (palette membership, U-space, power fit…) stay in the HOST lane —
 *  this callback is how they enter the sim without the pipeline importing
 *  bundle/content knowledge (module-decoupling decision, reported). */
export interface PlaceDeviceQuery {
  readonly args: PlaceDeviceArgs;
  readonly state: GameState;
  readonly context: TickContext;
}
export interface PlacementRejection {
  readonly reason: string;
}

/** What the host's price-target validator sees — the SAME decoupling pattern
 *  as `canPlaceDevice`: plan/catalog/contract-class knowledge stays HOST-side,
 *  the door only learns "resolved" or "refused, because <reason verbatim>".
 *  Returns null = accept (target resolves in the host's namespace), or a
 *  rejection that lands in the refusal event as `unknown-plan: <reason>`. */
export interface AdjustPriceQuery {
  readonly args: AdjustPriceArgs;
  readonly state: GameState;
  readonly context: TickContext;
}
export interface PriceTargetRejection {
  readonly reason: string;
}

/** What the host's sell-target validator sees — the SAME decoupling pattern
 *  as `canAdjustPrice`: catalog/entitlement knowledge stays HOST-side, the
 *  door only learns "resolved" or "refused, because <reason verbatim>".
 *  Returns null = accept (the offer stands in the host's namespace), or a
 *  rejection that lands in the refusal event as `unknown-target: <reason>`.
 *  ADR-0015 3/5 (Sell): the counterparty voice — in v0 the sales act has no
 *  acceptance dice, so THIS grammar is the only "no a customer can hear". */
export interface SellOfferQuery {
  readonly args: SellOfferArgs;
  readonly state: GameState;
  readonly context: TickContext;
}
export interface SellOfferRejection {
  readonly reason: string;
}

/** What the host's negotiation-target validator sees — the SAME decoupling
 *  pattern as `canSellOffer`: tenant/lease knowledge stays HOST-side, the
 *  door only learns "resolved" or "refused, because <reason verbatim>".
 *  Returns null = accept (the tenant conversation stands in the host's
 *  namespace), or a rejection that lands in the refusal event as
 *  `unknown-target: <reason>`. ADR-0015 5/5 (Negotiate): the tenant's
 *  door — v0 books the talk deterministically (no acceptance dice); the
 *  money effect lands later at the renewal cliff, not at the desk. */
export interface NegotiateQuery {
  readonly args: NegotiateTermsArgs;
  readonly state: GameState;
  readonly context: TickContext;
}
export interface NegotiateRejection {
  readonly reason: string;
}

export interface IntentDoorConfig {
  /** Hand tokens when materializing a missing GameState.hands (default 1 —
   *  T0/T2 per §7.5). Hosts SHOULD seed hands via createInitialState instead. */
  readonly handCapacity?: number;
  /** Tokens consumed per verb (default table below; toggle-speed is free). */
  readonly handCost?: Partial<Record<PlayerVerb, number>>;
  /** Ticks a verb holds its tokens (default = §7.5 reference durations). */
  readonly occupancyTicks?: Partial<Record<PlayerVerb, number>>;
  /** place-device validator (host-wired needs/provides check; absent = the
   *  door only enforces id uniqueness + structural sanity). */
  readonly canPlaceDevice?: (query: PlaceDeviceQuery) => PlacementRejection | null;
  /** adjust-price target validator (OD-24(a) part 1; host-wired plan/catalog
   *  resolution — absent = the door only enforces structural sanity, exactly
   *  the `canPlaceDevice` law). Callback output is validated: `reason` must
   *  be a string, host bugs throw rather than fork a state. */
  readonly canAdjustPrice?: (query: AdjustPriceQuery) => PriceTargetRejection | null;
  /** sell-offer target validator (ADR-0015 3/5 Sell; host-wired plan/catalog
   *  resolution — absent = the door books the offer on structural sanity
   *  only, exactly the `canAdjustPrice`/`canPlaceDevice` law). Callback
   *  output is validated: `reason` must be a string, host bugs throw rather
   *  than fork a state. This seam is the v0 counterparty — an executed
   *  intent IS the close (no acceptance dice), so a refusal here is the only
   *  "no" the sale can hear. */
  readonly canSellOffer?: (query: SellOfferQuery) => SellOfferRejection | null;
  /** negotiate-terms target validator (ADR-0015 5/5 Negotiate; host-wired
   *  tenant/lease resolution — absent = the door books the terms on
   *  structural sanity only, exactly the `canSellOffer` law). Callback
   *  output is validated: `reason` must be a string, host bugs throw
   *  rather than fork a state. */
  readonly canNegotiateTerms?: (query: NegotiateQuery) => NegotiateRejection | null;
  /** policy-card-commit resolver: maps the payload hash to the authored card.
   *  Absent → commits refuse with "no-card-lookup". */
  readonly lookupPolicyCard?: (cardHash: string) => PolicyCard | null;
  /** Skeleton NodeRecord knobs for placed devices. */
  readonly deviceSlots?: number;
  readonly deviceServiceTimeUs?: SimTimeUs;
  readonly deviceInspectionDepth?: InspectionDepth;
  readonly deviceShedOrder?: ShedOrder;
  readonly deviceDiscipline?: NodeDiscipline;
  /** GRACEFUL DRAIN (§7.2 R54), opt-in. `enabled` defaults FALSE — hosts
   *  without this field keep the v0 plain-pull law byte-identically. When
   *  true, `disconnect-drain` executes phase 1 (stop new, edge stays live,
   *  hands reserved `drain:<edgeId>` for `drainTicks`) and the pull executes
   *  as a door-internal continuation when the reservation matures.
   *  `drainTicks` default 2; must be a safe integer >= 1 (0-length drain ==
   *  plain pull — use the flag off for that). A malformed policy object is
   *  host programming garbage and THROWS `IntentDoorError` (Laws 2+4), and
   *  enabling with `handCost[disconnect-drain]` overridden to 0 throws too:
   *  the pending-drain record lives on a hand token, a free verb would leave
   *  the continuation unrecordable. */
  readonly drainPolicy?: {
    readonly enabled?: boolean;
    readonly drainTicks?: number;
  };
  /** OD-6(a) DOUBLE-DENOMINATION PAYMENT, opt-in. A verb mapped to 1 pays
   *  its NORMAL hand cost (unchanged table) AND occupies one free token from
   *  `GameState.attention` (pipeline/attention.ts) for the SAME occupancy
   *  window. Absent/empty map = zero behavior change; a listed verb whose
   *  attention pool is missing or has no free hand refuses `attention-debt`
   *  (never a silent loss) with the normal rail refunded. Values must be 0 or
   *  1 — anything else is host programming garbage and throws
   *  `IntentDoorError` at the door boundary (Laws 2+4). */
  readonly attentionCost?: Partial<Record<PlayerVerb, 0 | 1>>;
}

/** §7.5 reference durations, rounded UP to whole sim-minute ticks:
 *  config change 40s → 1 · failover 90s → 2 · cable trace 3 min → 3.
 *  "duration vs attendance" is COLLAPSED to one window in v0 (attendance ==
 *  duration): the unattended-job split (RAID 19h/0 hands) needs a scheduler
 *  the door does not own — reported as a seam for the receipt-engine twist.
 *
 *  CONFIG ANOMALY (W3 — documented, legal, no behavior gate): a host may
 *  override `occupancyTicks` to 0 for a verb whose `handCost` is > 0. The
 *  reservation is then stamped `busyUntilTick == tick + 0n`, and because
 *  occupancy is HALF-OPEN `[start, busyUntilTick)` that window is empty — the
 *  token's cause is cleared by the next door pass that TOUCHES the rail —
 *  the release sweep runs once per `draftHands` invocation (before any
 *  allocation), and a pass that never allocates never invokes it — firing at
 *  `busyUntilTick <= tick`. Within
 *  the submitting pass the token still counts as busy (free-hand accounting
 *  and refusals see the reservation it paid for), so the combination is not
 *  a spend-free loophole — it is a same-tick-boundary release, exactly what
 *  the half-open law promises. No DEFAULT verb pairs the two (the only
 *  occupancy-0 entry, toggle-speed, is also cost-0). */
export const DEFAULT_INTENT_OCCUPANCY_TICKS: Readonly<Record<PlayerVerb, number>> = Object.freeze({
  [PlayerVerb.PlaceDevice]: 3,
  [PlayerVerb.ConnectPorts]: 3,
  [PlayerVerb.DisconnectDrain]: 2,
  [PlayerVerb.ConfigureNode]: 1,
  [PlayerVerb.PolicyCardCommit]: 1,
  [PlayerVerb.ShedLoad]: 2,
  [PlayerVerb.Communicate]: 2,
  [PlayerVerb.ToggleSpeed]: 0,
  // OD-24(a) part 1: a price order is a decision at the desk — the COMMIT
  // class (1 tick, same window as policy-card-commit/configure-node).
  [PlayerVerb.AdjustPrice]: 1,
  // ADR-0014 #D2: pre-arming a node is likewise a desk decision — the COMMIT
  // class (1 tick), same hand cost. The protection itself is state-neutral
  // here: step 9 reads the book, the door never touches units or RNG.
  [PlayerVerb.Shield]: 1,
  // ADR-0015 (Scale 1/5): booking reserved warmth is the same desk decision
  // class — COMMIT, 1 tick. The warmth lands at the step-5/6 capacity read
  // (pipeline/defaults.ts); the door only writes the book.
  // RATIFIED 2026-10-17 (ADR-0016 #11) — occupancy pinned red on drift.
  [PlayerVerb.ScaleNode]: 1,
  // ADR-0015 (Maintain 2/5): booking attendance is an on-site task, not a
  // desk tap — the ATTENDANCE class (2 ticks, same window as
  // disconnect-drain/shed-load/communicate). The veto lands at step 9
  // (pipeline/defaults.ts `maintainInForce`); the door only writes the book.
  // RATIFIED 2026-10-17 (ADR-0016 #11) — occupancy pinned red on drift.
  [PlayerVerb.MaintainNode]: 2,
  // ADR-0015 (Schedule 2/5): arming a calendar band is a TAP — 1 tick. The
  // 26-hour-disaster law (hosting_game.md:1964: a mis-set window is how a
  // night becomes a week) demands cheap re-arm, so the correction must never
  // cost attendance-grade time. The deadline lands at step 9; the door only
  // writes the book. RATIFIED 2026-10-17 (ADR-0016 #11) — occupancy pinned
  // red on drift.
  [PlayerVerb.ScheduleWindow]: 1,
  // ADR-0015 (Sell 3/5): signing an offer is a desk decision — the COMMIT
  // class (1 tick), same hand cost. RATIFIED 2026-10-17 (ADR-0016 #11):
  // selling space/latency is a contract tap like a price order.
  // The door only writes the book; the sale closes host-side through the
  // existing economy priceKey seam (OD-24(a) part-1 posture).
  [PlayerVerb.SellOffer]: 1,
  // ADR-0015 (Negotiate 5/5): a negotiation is the card's combat — "a
  // ticket/conversation system with a tenant" (§1.3 "Amps and Aisles",
  // hosting_game.md:1637) — conversation costs ATTENDANCE, so it joins the
  // communicate cohort (2 ticks), not the desk-tap COMMIT class.
  // RATIFIED 2026-10-17 (ADR-0016 #11) — occupancy pinned red on drift.
  [PlayerVerb.NegotiateTerms]: 2,
  // ADR-0015 session-6 roster extension (Isolate): the §7.16 Act-row law
  // says ONE-CLICK ("an 'Act' row of at most four one-click emergency
  // verbs… drain, restart, isolate, shed") ⇒ the COMMIT class (1 tick),
  // same window as shield-node/adjust-price.
  // RATIFIED 2026-10-17 (ADR-0016 #11) — occupancy pinned red on drift. The
  // fence lands at step 5 (pipeline/isolation.ts + defaults.ts §(c)); the
  // door only writes the book.
  [PlayerVerb.IsolateNode]: 1,
  // ADR-0016 successor program (Throttle): the §7.16 Act-row law covers this
  // one too — dropping a capacity cut is the same one-click emergency dial as
  // dropping a fence ⇒ the COMMIT class (1 tick), same window as
  // isolate-node/shield-node. RATIFIED 2026-10-17 (ADR-0016 #11) —
  // occupancy pinned red on drift. The cut lands at step 5
  // (pipeline/throttle.ts + defaults.ts §(c)); the door only writes the book.
  [PlayerVerb.ThrottleNode]: 1,
  // ADR-0016 successor program (Restart): the §7.16 Act-row one-click law
  // covers the last unbuilt row verb ⇒ the COMMIT class (1 tick), same
  // window as isolate-node/throttle-node; §7.5's reference durations
  // (~:26741: "restart a service **20s**") price the desk tap.
  // RATIFIED 2026-10-17 (ADR-0016 #11) — occupancy pinned red on drift. The
  // reboot lands at step 5 (pipeline/restart.ts + defaults.ts
  // §(c)/(c′)); the door only writes the book.
  [PlayerVerb.RestartNode]: 1,
  // ADR-0017 #1/#3 (Reclaim): collecting a node's stale bookings is the same
  // one-click desk tap as pulling the reboot lever — §7.5's reference
  // durations floor family (~:26741: "restart a service **20s**") plus the
  // corpus spot law "~:24851: reclaimable at any moment" (collecting must
  // never be expensive or it is not "at any moment") ⇒ the COMMIT class,
  // same window as isolate-node/throttle-node/restart-node. PROVISIONAL
  // taste (post-ratify new numeric, 2026-10-17) — occupancy pinned red on
  // drift. The ADR-0016 #11 ratify register CLOSED (e2a1bba) BEFORE this
  // verb existed, so house law ships the new numeric PROVISIONAL with
  // mechanics context. The void lands at the six reads
  // (pipeline/reclaim.ts + steps 5/9); the door only writes the book.
  [PlayerVerb.ReclaimNode]: 1,
});

export const DEFAULT_INTENT_HAND_COST: Readonly<Record<PlayerVerb, number>> = Object.freeze({
  [PlayerVerb.PlaceDevice]: 1,
  [PlayerVerb.ConnectPorts]: 1,
  [PlayerVerb.DisconnectDrain]: 1,
  [PlayerVerb.ConfigureNode]: 1,
  [PlayerVerb.PolicyCardCommit]: 1,
  [PlayerVerb.ShedLoad]: 1,
  [PlayerVerb.Communicate]: 1,
  [PlayerVerb.ToggleSpeed]: 0,
  [PlayerVerb.AdjustPrice]: 1,
  [PlayerVerb.Shield]: 1,
  // ADR-0015 (Scale 1/5): one desk hand to book warmth — same cost as the
  // other COMMIT-class verbs — RATIFIED 2026-10-17 (ADR-0016 #11); see the
  // occupancy table above.
  [PlayerVerb.ScaleNode]: 1,
  // ADR-0015 (Maintain 2/5): one hand to book attendance (the attendance
  // shows in the 2-tick occupancy, occupancy table above).
  // RATIFIED 2026-10-17 (ADR-0016 #11).
  [PlayerVerb.MaintainNode]: 1,
  // ADR-0015 (Schedule 2/5): one hand to arm a calendar band — same cost as
  // the other COMMIT-class verbs — RATIFIED 2026-10-17 (ADR-0016 #11); see
  // the occupancy table above.
  [PlayerVerb.ScheduleWindow]: 1,
  // ADR-0015 (Sell 3/5): one desk hand to sign an offer — same cost as the
  // other COMMIT-class verbs — RATIFIED 2026-10-17 (ADR-0016 #11); see the
  // occupancy table above.
  [PlayerVerb.SellOffer]: 1,
  // ADR-0015 (Negotiate 5/5): one hand to open the conversation (the
  // attendance shows in the 2-tick occupancy, occupancy table above).
  [PlayerVerb.NegotiateTerms]: 1,
  // ADR-0015 session-6 (Isolate): one desk hand to drop a fence — same cost
  // as the other COMMIT-class verbs (occupancy table above; the one-click
  // Act-row law makes it a tap, not an attendance).
  // RATIFIED 2026-10-17 (ADR-0016 #11).
  [PlayerVerb.IsolateNode]: 1,
  // ADR-0016 (Throttle): one desk hand to drop a capacity cut — same cost as
  // the other COMMIT-class verbs (occupancy table above; the one-click
  // Act-row law makes it a tap, not an attendance).
  // RATIFIED 2026-10-17 (ADR-0016 #11).
  [PlayerVerb.ThrottleNode]: 1,
  // ADR-0016 (Restart): one desk hand to pull the reboot lever — same cost
  // as the other COMMIT-class verbs (occupancy table above; the one-click
  // Act-row law makes it a tap, not an attendance).
  // §7.5: "restart a service 20s". RATIFIED 2026-10-17 (ADR-0016 #11).
  [PlayerVerb.RestartNode]: 1,
  // ADR-0017 #3 (Reclaim): one desk hand to collect a node's stale bookings
  // — same cost as the other COMMIT-class verbs (occupancy table above; the
  // corpus spot law "reclaimable at any moment" prices it as a tap, never
  // an attendance). PROVISIONAL taste (post-ratify new numeric, 2026-10-17)
  // — the ADR-0016 #11 register closed before this verb existed; see the
  // occupancy row.
  [PlayerVerb.ReclaimNode]: 1,
});

/* ═══════════════════════════ Drain choreography (§7.2 R54) ═══════════════ */

const DEFAULT_DRAIN_TICKS = 2;

/** RESERVED continuation namespace on `HandToken.busyCauseId`: a token whose
 *  cause is `drain:<edgeId>` IS the pending-disconnect record (the whole
 *  reason BoardState/HandState shapes never changed). The maturity scan reads
 *  this prefix from state — it runs WHETHER OR NOT the policy is currently
 *  enabled, because a drain that was started is a promise kept in state. */
const DRAIN_CAUSE_PREFIX = "drain:";

/** `intent-executed` events minted by the drain continuation carry this
 *  sentinel seq: a continuation is never a fed schedule entry, so it owns no
 *  player seq — attribution lives in its `drain:<edgeId>` causeId. */
const DRAIN_CONTINUATION_SEQ = -1;

interface ResolvedDrainPolicy {
  readonly enabled: boolean;
  readonly drainTicks: number;
}

const IDLE_DRAIN_POLICY: ResolvedDrainPolicy = Object.freeze({ enabled: false, drainTicks: DEFAULT_DRAIN_TICKS });

/** Parse the host-supplied drain policy at the door boundary (Laws 2+4):
 *  absent = the frozen idle constant (byte-identical v0 path), malformed =
 *  throw naming the field, exactly like the wire-parse law for entries. */
function resolveDrainPolicy(config: IntentDoorConfig): ResolvedDrainPolicy {
  const policy = config.drainPolicy;
  if (policy === undefined) return IDLE_DRAIN_POLICY;
  if (policy.enabled !== undefined && typeof policy.enabled !== "boolean") {
    fail("config.drainPolicy.enabled", `expected boolean, got ${typeof policy.enabled}`);
  }
  let drainTicks = DEFAULT_DRAIN_TICKS;
  if (policy.drainTicks !== undefined) {
    requireInt(policy.drainTicks, "config.drainPolicy.drainTicks");
    if (policy.drainTicks < 1) {
      fail("config.drainPolicy.drainTicks", `expected >= 1 (a 0-length drain IS the plain pull — leave the policy off for that), got ${String(policy.drainTicks)}`);
    }
    drainTicks = policy.drainTicks;
  }
  const enabled = policy.enabled === true;
  if (enabled) {
    const disconnectCost = config.handCost?.[PlayerVerb.DisconnectDrain] ?? DEFAULT_INTENT_HAND_COST[PlayerVerb.DisconnectDrain];
    if (!(Number.isSafeInteger(disconnectCost) && disconnectCost >= 1)) {
      fail(
        "config.drainPolicy",
        `enabled requires handCost[disconnect-drain] >= 1 (got ${String(disconnectCost)}) — the pending drain lives on a hand token (busyCauseId \`${DRAIN_CAUSE_PREFIX}<edgeId>\`); a cost-0 disconnect would leave no continuation record`,
      );
    }
  }
  return Object.freeze({ enabled, drainTicks });
}

function drainCause(edgeId: EntityId): CauseId {
  return asCauseId(`${DRAIN_CAUSE_PREFIX}${edgeId}`);
}

/** Decode a hand cause back to its pending edge id — null for every other
 *  namespace (a plain `intent:<seq>` release, a forged unrelated cause). */
function drainEdgeOf(cause: CauseId | null): EntityId | null {
  if (cause === null || !cause.startsWith(DRAIN_CAUSE_PREFIX)) return null;
  return asEntityId(cause.slice(DRAIN_CAUSE_PREFIX.length));
}

/* ── OD-6(a) double-denomination attention cost (opt-in, default OFF) ── */

/** Parse the host's `attentionCost` map at the boundary (Laws 2+4): every
 *  value must be exactly 0 or 1 (the special hand is one slot; 2+ is
 *  unrepresentable garbage), keys must be real PlayerVerbs. A value of 1 is
 *  stored; 0 is dropped (an explicit 0 is IDENTICAL to omission — the map
 *  only ever lists verbs that DO require attention). Returns null when nothing
 *  is required, which keeps the whole attention path off for the pass — the
 *  byte-identity guarantee. */
function resolveAttentionCost(
  config: IntentDoorConfig,
): ReadonlyMap<PlayerVerb, 1> | null {
  const map = config.attentionCost;
  if (map === undefined) return null;
  let required: Map<PlayerVerb, 1> | null = null;
  for (const verb of PLAYER_VERBS) {
    const value = map[verb];
    if (value === undefined || value === 0) continue;
    if (value !== 1) {
      fail(
        "config.attentionCost",
        `value for "${verb}" must be 0 or 1 (the focus hand is a single slot), got ${String(value)}`,
      );
    }
    if (required === null) required = new Map<PlayerVerb, 1>();
    required.set(verb, 1);
  }
  return required;
}

/* ═══════════════════════════ Result surface ═══════════════════════════ */

/** One per fed intent — the door's verdict roll-up (host HUD ticker / test
 *  assertion sugar; the events array is the replay-grade record). */
export interface IntentReceipt {
  /** Submission stamp carried in from the entry (ordering key). */
  readonly submittedTick: SimTick;
  readonly seq: number;
  /** PlayerVerb string, or a carrier label for refused non-door payloads. */
  readonly verb: string;
  readonly outcome: "executed" | "refused";
  readonly reason: string | null;
  /** The handler's detail rider on an EXECUTION (E2b additive seam — mirrors
   *  the `detail` field of the intent-executed SimEvent, e.g. adjust-price
   *  carries `target=<kind>:<id>,price=<µ$>`). Absent when the handler
   *  returned no detail; refused receipts never carry one (their truth is
   *  `reason`). Hosts map fields field-wise — no consumer deep-equals the
   *  whole receipt, so the extra key is wire- and digest-inert. */
  readonly detail?: string;
}

export interface IntentDoorResult {
  /** Same object identity when NOTHING applied (no intents / all refused)
   *  AND no hand token was due for release — a refused pass that still
   *  touches the rail materializes the released-hands slice (F4/P3-proven),
   *  which is a state change, not an identity violation. */
  readonly state: GameState;
  /** Executed + refused events in canonical application order (future-stamp
   *  refusals trail, in input order). */
  readonly events: readonly SimEvent[];
  readonly receipts: readonly IntentReceipt[];
}

/* ═══════════════════════════ State constructors ═══════════════════════════ */

export function mintHandState(capacity: number): HandState {
  if (!Number.isSafeInteger(capacity) || capacity < 1) {
    throw new IntentDoorError(`mintHandState: capacity must be a safe integer >= 1, got ${String(capacity)}`);
  }
  const tokens: HandToken[] = [];
  for (let i = 0; i < capacity; i += 1) {
    tokens.push(Object.freeze({ index: i, busyUntilTick: 0n, busyCauseId: null }));
  }
  return Object.freeze({ capacity, tokens: Object.freeze(tokens) });
}

export function createBoardState(edges: readonly BoardEdgeRecord[] = []): BoardState {
  const byId = new Map<EntityId, BoardEdgeRecord>();
  for (const edge of [...edges].sort((a, b) => compareEntityId(a.id, b.id))) {
    byId.set(edge.id, Object.freeze({ ...edge }));
  }
  return Object.freeze({ version: 0, edges: Object.freeze(byId) });
}

/** Empty price-override book (OD-24(a) part 1) — hosts that want the embed
 *  present from tick 0 (e.g. seeded catalog overrides) mint it here; the
 *  `adjust-price` handler materializes lazily without it. */
export function createPriceOverrideBook(): PriceOverrideBook {
  return Object.freeze({ version: 0, overrides: Object.freeze(new Map<string, PriceOverrideRecord>()) });
}

/** Empty corruption pre-arm book (ADR-0014 #D2) — hosts that want the embed
 *  present from tick 0 mint it here; the `shield-node` handler materializes
 *  lazily without it. Node-keyed, last-write-wins per node. */
export function createShieldBook(): ShieldBook {
  return Object.freeze({ version: 0, entries: Object.freeze(new Map<EntityId, ShieldEntry>()) });
}

/** Empty reserved-warmth book (ADR-0015 Scale 1/5) — hosts that want the
 *  embed present from tick 0 mint it here; the `scale-node` handler
 *  materializes lazily without it. Node-keyed, last-write-wins per node. */
export function createScaleBook(): ScaleBook {
  return Object.freeze({ version: 0, entries: Object.freeze(new Map<EntityId, ScaleEntry>()) });
}

/** Empty maintenance-attendance book (ADR-0015 Maintain 2/5) — hosts that
 *  want the embed present from tick 0 mint it here; the `maintain-node`
 *  handler materializes lazily without it. Node-keyed, last-write-wins per
 *  node; expired bands are never pruned (expiry is a read-time law). */
export function createMaintainBook(): MaintainBook {
  return Object.freeze({ version: 0, entries: Object.freeze(new Map<EntityId, MaintainWindow>()) });
}

/** Empty backup job-window book (ADR-0015 Schedule 2/5) — hosts that want
 *  the embed present from tick 0 mint it here; the `schedule-window` handler
 *  materializes lazily without it. Node-keyed, last-write-wins per node. */
export function createJobWindowBook(): JobWindowBook {
  return Object.freeze({ version: 0, entries: Object.freeze(new Map<EntityId, JobWindow>()) });
}

/** Empty sell-offer book (ADR-0015 Sell 3/5) — hosts that want the embed
 *  present from tick 0 mint it here; the `sell-offer` handler materializes
 *  lazily without it. Keyed by the COMPOSITE `<targetKind>:<targetId>`
 *  priceKey grammar (`priceOverrideKey` REUSED by identity — a sell-book key
 *  IS an economy priceKey), last-write-wins per key. */
export function createSellBook(): SellBook {
  return Object.freeze({ version: 0, entries: Object.freeze(new Map<string, SellOffer>()) });
}

/** Empty negotiate-terms book (ADR-0015 Negotiate 5/5) — hosts that want
 *  the embed present from tick 0 mint it here; the `negotiate-terms`
 *  handler materializes lazily without it. Keyed by the COMPOSITE
 *  `<targetKind>:<targetId>` priceKey grammar (`priceOverrideKey` REUSED by
 *  identity — a negotiation key IS an economy priceKey, the leg the money
 *  fold matches against a contract's sparse `priceKey`), last-write-wins
 *  per key (re-negotiating replaces the standing terms; there is no
 *  expiry leg — the `activeNegotiation` as-of law at read time). */
export function createNegotiateBook(): NegotiateBook {
  return Object.freeze({ version: 0, entries: Object.freeze(new Map<string, NegotiationTerm>()) });
}

/** Empty isolation book (ADR-0015 session-6 roster extension · Isolate) —
 *  hosts that want the door fed an unarmed-but-present board state can seed
 *  one; the fold law is the same as the other books (an EMPTY book still
 *  switches the digest, an ABSENT field never does). Keyed by node id. */
export function createIsolateBook(): IsolateBook {
  return Object.freeze({ version: 0, entries: Object.freeze(new Map<EntityId, IsolateEntry>()) });
}

/** Empty throttle book (ADR-0016 successor program · Throttle) — hosts that
 *  want the door fed an unarmed-but-present board state can seed one; the
 *  fold law is the same as the other books (an EMPTY book still switches the
 *  digest, an ABSENT field never does). Keyed by node id; every booked cut
 *  is a PARTIAL discount on the admission ceiling (the door's `[0, roster)`
 *  range check keeps the total case owned by `isolate-node`). */
export function createThrottleBook(): ThrottleBook {
  return Object.freeze({ version: 0, entries: Object.freeze(new Map<EntityId, ThrottleEntry>()) });
}

/** Empty restart book (ADR-0016 successor program · Restart) — hosts that
 *  want the door fed an unarmed-but-present board state can seed one; the
 *  fold law is the same as the other books (an EMPTY book still switches the
 *  digest, an ABSENT field never does). Keyed by node id; every booked
 *  window is BOUNDED by construction (the wire's required release leg —
 *  a never-ending restart would be an `isolate-node` under another name). */
export function createRestartBook(): RestartBook {
  return Object.freeze({ version: 0, entries: Object.freeze(new Map<EntityId, RestartEntry>()) });
}

/** Empty reclaim tombstone book (ADR-0017 #3 · Reclaim) — hosts that want
 *  the door fed an unarmed-but-present board state can seed one; the fold
 *  law is the same as the other books (an EMPTY book still switches the
 *  digest, an ABSENT field never does). Keyed by node id; LAST-WRITE-WINS;
 *  the tombstone never expires (no release leg — amendments are the only
 *  motion, and re-collecting an unbooked node is a legal no-op). */
export function createReclaimBook(): ReclaimBook {
  return Object.freeze({ version: 0, entries: Object.freeze(new Map<EntityId, ReclaimEntry>()) });
}

/** Composite book key. `targetKind` is a colon-free closed vocabulary, so the
 *  first-colon split is exact even for namespaced ids ("plan:pro-2026"
 *  and "sku:cb:bandwidth" both round-trip through `parsePriceOverrideKey`). */
export function priceOverrideKey(targetKind: PriceTargetKind, targetId: EntityId): string {
  return `${targetKind}:${targetId}`;
}

/** Inverse of `priceOverrideKey` — null for any key outside the closed kind
 *  vocabulary (foreign book, hand-forged state). Consumers (economy/HUD lanes)
 *  parse through this instead of re-splitting. */
export function parsePriceOverrideKey(key: string): { readonly targetKind: PriceTargetKind; readonly targetId: EntityId } | null {
  const sep = key.indexOf(":");
  if (sep <= 0) return null;
  const kind = key.slice(0, sep);
  if (!PRICE_TARGET_KINDS.includes(kind as PriceTargetKind)) return null;
  const targetId = key.slice(sep + 1);
  if (targetId.length === 0) return null; // empty ids are uncastable (types.ts asEntityId law)
  return Object.freeze({ targetKind: kind as PriceTargetKind, targetId: asEntityId(targetId) });
}

/* ═══════════════════════════ Door internals (mutable draft) ═══════════════ */

interface Draft {
  readonly origin: GameState;
  readonly context: TickContext;
  readonly config: IntentDoorConfig;
  readonly drain: ResolvedDrainPolicy;
  /** OD-6(a) parsed attention-cost set (null = denomination off for this
   *  pass — the byte-identity gate). */
  readonly attentionCost: ReadonlyMap<PlayerVerb, 1> | null;
  nodes: ReadonlyMap<EntityId, NodeRecord> | null;
  board: BoardState | null;
  hands: HandState | null;
  /** OD-6(a) COW attention slice — null until a verb requires (or releases)
   *  the special hand; then the running copy materialized from origin. */
  attention: AttentionState | null;
  ruleBook: readonly PolicyCard[] | null;
  ruleBookHash: string | null;
  pricing: PriceOverrideBook | null;
  /** ADR-0014 #D2 COW pre-arm book — null until a `shield-node` order lands. */
  shield: ShieldBook | null;
  /** ADR-0015 COW reserved-warmth book — null until a `scale-node` order lands. */
  scale: ScaleBook | null;
  /** ADR-0015 COW maintenance-attendance book — null until a `maintain-node`
   *  order lands. */
  maintain: MaintainBook | null;
  /** ADR-0015 COW backup job-window book — null until a `schedule-window`
   *  order lands. */
  schedule: JobWindowBook | null;
  /** ADR-0015 COW sell-offer book — null until a `sell-offer` order lands. */
  sell: SellBook | null;
  /** ADR-0015 COW negotiate-terms book — null until a `negotiate-terms`
   *  order lands. */
  negotiate: NegotiateBook | null;
  /** ADR-0015 session-6 COW isolation book — null until an `isolate-node`
   *  order lands. */
  isolate: IsolateBook | null;
  /** ADR-0016 COW throttle book — null until a `throttle-node` order lands. */
  throttle: ThrottleBook | null;
  /** ADR-0016 COW restart book — null until a `restart-node` order lands. */
  restart: RestartBook | null;
  /** ADR-0017 #3 COW reclaim tombstone book — null until a `reclaim-node`
   *  order lands. */
  reclaim: ReclaimBook | null;
  readonly events: SimEvent[];
  readonly receipts: IntentReceipt[];
}

const SPEED_VALUES: readonly number[] = Object.freeze([1, 2, 4]);
const INSPECTION_DEPTHS: readonly InspectionDepth[] = Object.freeze([
  "pass-through",
  "sample-1-in-20",
  "inspect",
  "challenge",
]);
const SHED_ORDERS: readonly ShedOrder[] = Object.freeze([
  "first-in-first-out",
  "last-in-first-out",
  "lowest-value-first",
  "qos-weighted",
]);
const RELATIONS: readonly BoardRelation[] = Object.freeze(["data", "power", "control", "trust"]);
/** adjust-price target namespaces (OD-24(a) part 1, closed — types.ts
 *  `PriceTargetKind` is the type-law twin of this value law). */
const PRICE_TARGET_KINDS: readonly PriceTargetKind[] = Object.freeze(["plan", "contract-class", "sku"]);
/** negotiate-terms tones (ADR-0015 5/5, closed — types.ts `NegotiationTone`
 *  is the type-law twin). The economy names the vocabulary
 *  (`NEGOTIATION_TONES`, economy/negotiate.ts); the door keeps this private
 *  mirror because pipeline never imports economy — the same import law the
 *  `PRICE_TARGET_KINDS`/`PRICE_KEY_KINDS` pair lives under, drift-pinned
 *  by tests reading BOTH sources (intent-door-negotiate.test.ts). */
const NEGOTIATE_TONES: readonly NegotiationTone[] = Object.freeze(["rapport", "firm", "legal"]);
const VERB_SET: ReadonlySet<string> = new Set<string>(PLAYER_VERBS);

function fail(where: string, detail: string): never {
  throw new IntentDoorError(`intent-door: ${where}: ${detail}`);
}

function requireBigint(value: unknown, where: string): bigint {
  if (typeof value !== "bigint") fail(where, `expected bigint, got ${typeof value}`);
  return value;
}

function requireString(value: unknown, where: string): string {
  if (typeof value !== "string") fail(where, `expected string, got ${typeof value}`);
  return value;
}

function requireRecord(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(where, `expected plain object, got ${Array.isArray(value) ? "array" : typeof value}`);
  }
  return value as Record<string, unknown>;
}

function requireInt(value: unknown, where: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    fail(where, `expected safe integer, got ${String(value)}`);
  }
  return value;
}

function requireNumber(value: unknown, where: string): number {
  if (typeof value !== "number") fail(where, `expected number, got ${typeof value}`);
  return value;
}

/** Per-verb WIRE arg shapes (M2 — one type law at the boundary). A primitive
 *  TYPE mismatch here (including a missing key, which parses as `undefined`)
 *  is structural garbage → `IntentDoorError`; value-domain violations stay
 *  the handlers' refusal space. `string-or-null` / `number-or-null` fields
 *  accept the JSON null sentinel ONLY — null in a non-nullable field is a
 *  type mismatch, and a present-but-wrong type is never silently coerced.
 *  `bigint` is the money/clock wire family (MoneyUnit, SimTimeUs): a float or
 *  string price is structural garbage, which makes a FRACTIONAL price
 *  unrepresentable (Law 2 — the handler's `invalid-price` refusal owns only
 *  the ≤ 0 value domain). The table's field order is fixed, so an error
 *  naming "the first offender" is deterministic. */
type ArgWireType = "string" | "string-or-null" | "number" | "number-or-null" | "bigint" | "bigint-or-null";
const VERB_ARG_SHAPES: Readonly<Record<PlayerVerb, Readonly<Record<string, ArgWireType>>>> = Object.freeze({
  [PlayerVerb.PlaceDevice]: Object.freeze({ nodeId: "string", deviceKind: "string", template: "string-or-null" }),
  [PlayerVerb.ConnectPorts]: Object.freeze({ relation: "string", from: "string", to: "string", slot: "string-or-null" }),
  [PlayerVerb.DisconnectDrain]: Object.freeze({ edgeId: "string" }),
  [PlayerVerb.ConfigureNode]: Object.freeze({ nodeId: "string", inspectionDepth: "string-or-null", shedOrder: "string-or-null" }),
  [PlayerVerb.PolicyCardCommit]: Object.freeze({ cardHash: "string" }),
  [PlayerVerb.ShedLoad]: Object.freeze({ nodeId: "string", qosClassId: "string-or-null" }),
  [PlayerVerb.Communicate]: Object.freeze({ target: "string-or-null", note: "string" }),
  [PlayerVerb.ToggleSpeed]: Object.freeze({ speedX: "number" }),
  [PlayerVerb.AdjustPrice]: Object.freeze({ targetKind: "string", targetId: "string", newPriceMicroUsd: "bigint", effectiveAtBusinessMinute: "number-or-null" }),
  [PlayerVerb.Shield]: Object.freeze({ targetNodeId: "string", effectiveAtBusinessMinute: "number-or-null" }),
  [PlayerVerb.ScaleNode]: Object.freeze({ targetNodeId: "string", reservedSlots: "number", effectiveAtBusinessMinute: "number-or-null" }),
  [PlayerVerb.MaintainNode]: Object.freeze({ targetNodeId: "string", openAtBusinessMinute: "number-or-null", closeAtBusinessMinute: "number" }),
  [PlayerVerb.ScheduleWindow]: Object.freeze({ targetNodeId: "string", openAtBusinessMinute: "number-or-null", closeAtBusinessMinute: "number" }),
  [PlayerVerb.SellOffer]: Object.freeze({ targetKind: "string", targetId: "string", offerPriceMicroUsd: "bigint", termMonths: "number", effectiveAtBusinessMinute: "number-or-null" }),
  [PlayerVerb.NegotiateTerms]: Object.freeze({ targetKind: "string", targetId: "string", tone: "string", concessionMicroUsd: "bigint-or-null", termMonthsExtension: "number-or-null", effectiveAtBusinessMinute: "number-or-null" }),
  [PlayerVerb.IsolateNode]: Object.freeze({ targetNodeId: "string", effectiveAtBusinessMinute: "number-or-null", releaseAtBusinessMinute: "number-or-null" }),
  // ADR-0016 Throttle: the fence's minute legs VERBATIM (both number-or-null)
  // plus the plain-`number` cut — same family as scale's reservedSlots, so
  // NO new ArgWireType arm is needed and JSON's plain numbers cross the
  // proto bridge without the bigint revival dance (wireIntent pin).
  [PlayerVerb.ThrottleNode]: Object.freeze({ targetNodeId: "string", cutSlots: "number", effectiveAtBusinessMinute: "number-or-null", releaseAtBusinessMinute: "number-or-null" }),
  // ADR-0016 Restart: `dropQueued` rides the closed-vocab STRING leg (the
  // negotiate `tone` family — ArgWireType has no boolean arm; the {drop,
  // keep} value domain is the handler's refusal space). `releaseAtBusinessMinute`
  // is a REQUIRED plain `number` — the fence's nullable release leg is
  // DELIBERATELY not reused: an unbounded restart is structurally
  // `isolate-node` under another name, and the door refuses to fork the
  // fence; null release is structural garbage (M2 throws).
  [PlayerVerb.RestartNode]: Object.freeze({ targetNodeId: "string", dropQueued: "string", effectiveAtBusinessMinute: "number-or-null", releaseAtBusinessMinute: "number" }),
  [PlayerVerb.ReclaimNode]: Object.freeze({ targetNodeId: "string", effectiveAtBusinessMinute: "number-or-null" }),
});

/** Boundary parse (Law 2): validate WIRE TYPES of one fed entry; a pass here
 *  means the entry is well-formed, NOT that it will execute (semantics are
 *  the handlers' refusal space). Per M2 this covers the per-verb ARG SHAPES
 *  too — handlers never re-check primitive types of their args. */
function parseEntry(entry: unknown, index: number): ExternalIntent {
  const where = `externalIntents[${index}]`;
  const record = requireRecord(entry, where);
  const tick = requireBigint(record.tick, `${where}.tick`);
  const intentWire = requireRecord(record.intent, `${where}.intent`);
  requireInt(intentWire.seq, `${where}.intent.seq`);
  requireBigint(intentWire.atUs, `${where}.intent.atUs`);
  const clock = requireString(intentWire.clock, `${where}.intent.clock`);
  if (clock !== "sim" && clock !== "business" && clock !== "wall") {
    fail(`${where}.intent.clock`, `"${clock}" not in {sim, business, wall}`);
  }
  const origin = requireString(intentWire.origin, `${where}.intent.origin`);
  if (origin !== "player" && origin !== "rule") {
    fail(`${where}.intent.origin`, `"${origin}" not in {player, rule}`);
  }
  const payload = requireRecord(intentWire.payload, `${where}.intent.payload`);
  const kind = requireString(payload.kind, `${where}.intent.payload.kind`);
  if (kind === "player-verb") {
    const args = requireRecord(payload.args, `${where}.intent.payload.args`);
    const verb = requireString(args.verb, `${where}.intent.payload.args.verb`);
    if (!VERB_SET.has(verb)) fail(`${where}.intent.payload.args.verb`, `"${verb}" not a PlayerVerb`);
    const shape = VERB_ARG_SHAPES[verb as PlayerVerb];
    for (const field of Object.keys(shape)) {
      const fieldWhere = `${where}.intent.payload.args.${field}`;
      const value = args[field];
      const wireType = shape[field];
      if (wireType === "string") requireString(value, fieldWhere);
      else if (wireType === "number") requireNumber(value, fieldWhere);
      else if (wireType === "bigint") requireBigint(value, fieldWhere);
      else if (wireType === "bigint-or-null") { if (value !== null) requireBigint(value, fieldWhere); }
      else if (wireType === "number-or-null") { if (value !== null) requireNumber(value, fieldWhere); }
      else if (value !== null) requireString(value, fieldWhere);
    }
  }
  return entry as ExternalIntent;
}

/* ── draft accessors (copy-on-write; unchanged sections keep identity) ── */

function draftNodes(draft: Draft): Map<EntityId, NodeRecord> {
  return new Map(draft.nodes ?? draft.origin.nodes);
}

function draftBoard(draft: Draft): Map<EntityId, BoardEdgeRecord> {
  return new Map(draft.board?.edges ?? draft.origin.board?.edges ?? createBoardState().edges);
}

function draftHands(draft: Draft, tick: SimTick): HandState {
  if (draft.hands !== null) return draft.hands;
  const base = draft.origin.hands ?? mintHandState(draft.config.handCapacity ?? 1);
  // Release due tokens once per tick, before any allocation (§7.5: a hand is
  // free again at its busyUntilTick boundary). The release is cached ONLY
  // when it actually changed something — a refused-only pass with nothing
  // due must leave the state's hands identity untouched.
  const tokens = base.tokens.map(
    (token): HandToken =>
      token.busyCauseId !== null && token.busyUntilTick <= tick
        ? Object.freeze({ ...token, busyCauseId: null })
        : token,
  );
  const changed = tokens.some((token, i) => token !== base.tokens[i]);
  if (!changed) return base;
  const released = Object.freeze({ capacity: base.capacity, tokens: Object.freeze(tokens) });
  draft.hands = released;
  return released;
}

function occupyHands(draft: Draft, tick: SimTick, cost: number, cause: CauseId, until: SimTick): number[] {
  const hands = draftHands(draft, tick);
  const taken: number[] = [];
  const tokens = [...hands.tokens];
  for (let i = 0; i < tokens.length && taken.length < cost; i += 1) {
    const token = tokens[i] as HandToken;
    if (token.busyCauseId !== null) continue;
    tokens[i] = Object.freeze({ ...token, busyUntilTick: until, busyCauseId: cause });
    taken.push(token.index);
  }
  draft.hands = Object.freeze({ capacity: hands.capacity, tokens: Object.freeze(tokens) });
  return taken;
}

function freeHandCount(hands: HandState): number {
  let free = 0;
  for (const token of hands.tokens) if (token.busyCauseId === null) free += 1;
  return free;
}

/** OD-6(a) COW attention accessor — materializes `origin.attention` and runs
 *  the due-release sweep ONCE, caching only when something actually matured
 *  (a refused-only pass that frees nothing leaves the rail identity-untouched,
 *  the exact law `draftHands` obeys). Returns null when the host never seeded
 *  an attention pool — the denomination is off for this state. */
function draftAttention(draft: Draft, tick: SimTick): AttentionState | null {
  if (draft.attention !== null) return draft.attention;
  const base = draft.origin.attention;
  if (base === undefined) return null;
  const released = attentionRelease(base, tick);
  if (released !== base) draft.attention = released;
  return released;
}

/**
 * DRAIN CONTINUATION — the due-queue half of the two-phase disconnect.
 * Called ONCE at the top of every door pass, BEFORE the external entries of
 * the tick (deterministic ordering law, pinned in tests: a pull maturing at
 * tick T makes its edge safe-to-touch for entries also stamped at T).
 *
 * Reads the pending-disconnect records straight off the ORIGIN hand rail
 * (tokens whose cause is `drain:<edgeId>` and whose reservation has come due,
 * `busyUntilTick <= tick` — the same half-open release law every occupancy
 * obeys) and executes the actual pulls: edge deleted (board version bumps
 * once PER removal, the mutation-count convention), one `intent-executed`
 * event per pull carrying causeId `drain:<edgeId>`, detail `drained:<edgeId>`
 * and the sentinel continuation seq. Then the ordinary release sweep runs
 * (cause nulled, busyUntilTick stamp kept) so the continuation can never
 * re-fire. Runs regardless of the CURRENT policy — a drain started is a
 * drain finished; flipping the flag mid-drain cannot strand a promised pull.
 */
function processMaturedDrains(draft: Draft): void {
  const hands = draft.origin.hands;
  if (hands === undefined) return;
  const tick = draft.context.tick;
  const due: { readonly index: number; readonly edgeId: EntityId; readonly busyUntilTick: SimTick }[] = [];
  for (const token of hands.tokens) {
    // pinned token-index order — the rail is the schedule, never a Map.
    const edgeId = drainEdgeOf(token.busyCauseId);
    if (edgeId !== null && token.busyUntilTick <= tick) {
      due.push(Object.freeze({ index: token.index, edgeId, busyUntilTick: token.busyUntilTick }));
    }
  }
  if (due.length === 0) return;
  const board = draft.board ?? draft.origin.board ?? createBoardState();
  const edges = new Map(board.edges);
  let version = board.version;
  for (const drain of due) {
    if (edges.delete(drain.edgeId)) version += 1; // already gone (forged state) → no phantom bump
    draft.events.push(
      Object.freeze({
        kind: "intent-executed" as const,
        atUs: draft.context.clocks.simUs,
        tick,
        causeId: drainCause(drain.edgeId),
        verb: PlayerVerb.DisconnectDrain,
        intentSeq: DRAIN_CONTINUATION_SEQ,
        handIndexes: Object.freeze([drain.index]),
        busyUntilTick: drain.busyUntilTick,
        detail: `drained:${drain.edgeId}`,
      }),
    );
  }
  if (version !== board.version) {
    draft.board = Object.freeze({ version, edges: Object.freeze(edges) });
  }
  // Materialize the release sweep so the matured drains free their tokens in
  // the built state (identity-preserving when nothing else is due).
  draftHands(draft, tick);
}

/* ═══════════════════════════ Handlers (execute-or-refuse) ═══════════════ */

type HandlerVerdict = { readonly ok: true; readonly detail: string | null } | { readonly ok: false; readonly reason: string };

function defaultEdgeId(relation: BoardRelation, from: EntityId, to: EntityId, slot: string | null): EntityId {
  // topology/graph.ts `defaultEdgeId` convention (control/trust suffixes are
  // topology-only fields; this slice carries no domain/via metadata).
  const base = `edge:${relation}:${from}->${to}`;
  return (relation === "power" && slot !== null ? `${base}:${slot}` : base) as EntityId;
}

/** Would a power edge from→to close a feed cycle? Walk `from`'s UPSTREAM
 *  supplier chain; reaching `to` means `to` already feeds `from`, so making
 *  `from` feed `to` back would form a loop — the feed graph is a tree
 *  (structural mirror of topology's assertNoPowerCycle). Note `from` already
 *  feeding `to` on a DIFFERENT slot is a legal multi-feed (dual-PSU), never
 *  a cycle, and passes. */
function powerCycle(edges: ReadonlyMap<EntityId, BoardEdgeRecord>, from: EntityId, to: EntityId): boolean {
  const suppliers = new Map<EntityId, EntityId[]>();
  for (const edge of edges.values()) {
    if (edge.relation !== "power") continue;
    const list = suppliers.get(edge.to) ?? [];
    list.push(edge.from);
    suppliers.set(edge.to, list);
  }
  const seen = new Set<EntityId>([from]);
  let frontier: EntityId[] = [from];
  while (frontier.length > 0) {
    const next: EntityId[] = [];
    for (const current of frontier) {
      for (const supplier of suppliers.get(current) ?? []) {
        if (supplier === to) return true;
        if (seen.has(supplier)) continue;
        seen.add(supplier);
        next.push(supplier);
      }
    }
    frontier = next;
  }
  return false;
}

function handlePlaceDevice(draft: Draft, args: PlaceDeviceArgs): HandlerVerdict {
  // args carry TRUSTED wire types (parseEntry parsed every field per M2) —
  // only value-domain checks remain below.
  const nodeId = args.nodeId;
  if (nodeId.length === 0) return { ok: false, reason: "empty-node-id" };
  const devices = draftNodes(draft);
  if (devices.has(nodeId as EntityId)) {
    return { ok: false, reason: `node-exists: "${nodeId}"` };
  }
  if (args.deviceKind.length === 0) return { ok: false, reason: "empty-device-kind" };
  const rejection = draft.config.canPlaceDevice?.({ args, state: snapshotFor(draft), context: draft.context });
  if (rejection !== undefined && rejection !== null) {
    // host CALLBACK output stays validated (it is not door-wire input):
    return { ok: false, reason: `placement-rejected: ${requireString(rejection.reason, "canPlaceDevice result.reason")}` };
  }
  const node: NodeRecord = Object.freeze({
    id: nodeId as EntityId,
    kind: args.deviceKind,
    slots: makeSlots(draft.config.deviceSlots ?? 1),
    serviceTimeUs: draft.config.deviceServiceTimeUs ?? MICROS_PER_MIN,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: draft.config.deviceShedOrder ?? "qos-weighted",
    inspectionDepth: draft.config.deviceInspectionDepth ?? "pass-through",
    discipline: draft.config.deviceDiscipline ?? "hockey-stick",
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
  devices.set(node.id, node);
  draft.nodes = Object.freeze(devices);
  return { ok: true, detail: `kind=${args.deviceKind}` };
}

function handleConnectPorts(draft: Draft, args: ConnectPortsArgs): HandlerVerdict {
  const relation = args.relation; // wire type trusted (parseEntry, M2)
  if (!RELATIONS.includes(relation as BoardRelation)) {
    return { ok: false, reason: `bad-relation: "${relation}" not in {${RELATIONS.join(",")}}` };
  }
  const from = args.from;
  const to = args.to;
  if (args.slot !== null && args.slot.length === 0) return { ok: false, reason: "empty-slot" };
  if (relation === "power" && args.slot === null) return { ok: false, reason: "power-needs-slot" };
  if (relation !== "power" && args.slot !== null) return { ok: false, reason: `slot-only-for-power: got "${args.slot}"` };
  const nodes = draftNodes(draft);
  if (!nodes.has(from)) return { ok: false, reason: `unknown-node: "${from}"` };
  if (!nodes.has(to)) return { ok: false, reason: `unknown-node: "${to}"` };
  if (from === to) return { ok: false, reason: `self-edge: "${from}"` };
  const edges = draftBoard(draft);
  const id = defaultEdgeId(relation as BoardRelation, from, to, args.slot);
  if (edges.has(id)) return { ok: false, reason: `edge-exists: "${id}"` };
  if (relation === "power") {
    for (const edge of edges.values()) {
      if (edge.relation === "power" && edge.to === to && edge.slot === args.slot) {
        return { ok: false, reason: `slot-occupied: "${args.slot}" on "${to}" fed by "${edge.from}" — one supplier per socket` };
      }
    }
    if (powerCycle(edges, from, to)) {
      return { ok: false, reason: `power-cycle: "${from}" already draws power through "${to}" — the feed graph is a tree` };
    }
  }
  edges.set(id, Object.freeze({ id, relation: relation as BoardRelation, from, to, slot: args.slot }));
  const board = draft.board ?? draft.origin.board ?? createBoardState();
  draft.board = Object.freeze({ version: board.version + 1, edges: Object.freeze(edges) });
  return { ok: true, detail: `${relation}:${from}->${to}` };
}

function handleDisconnectDrain(draft: Draft, args: DisconnectDrainArgs): HandlerVerdict {
  const edgeId = args.edgeId as EntityId; // wire type trusted (parseEntry, M2)
  const board = draft.board ?? draft.origin.board ?? createBoardState();
  if (!board.edges.has(edgeId)) return { ok: false, reason: `unknown-edge: "${edgeId}"` };
  if (draft.drain.enabled) {
    // PHASE 1 of the §7.2 R54 choreography — stop new, let finish. The board
    // is NOT touched here: the edge stays present (and the socket stays
    // occupied — `edge-exists` / `slot-occupied` refuse re-plugs for free,
    // the existing-code reuse decision) until the continuation pulls it when
    // the reservation matures. The pending-disconnect record IS the hand
    // reservation executeEntry minted with cause `drain:<edgeId>` — no
    // BoardState/HandState field was invented to carry it.
    return { ok: true, detail: `drain-started:${edgeId}` };
  }
  const edges = new Map(board.edges);
  edges.delete(edgeId);
  // v0 plain pull (policy OFF — the default law).
  draft.board = Object.freeze({ version: board.version + 1, edges: Object.freeze(edges) });
  return { ok: true, detail: `pulled:${edgeId}` };
}

function handleConfigureNode(draft: Draft, args: ConfigureNodeArgs): HandlerVerdict {
  const nodeId = args.nodeId as EntityId; // wire type trusted (parseEntry, M2)
  if (args.inspectionDepth === null && args.shedOrder === null) {
    return { ok: false, reason: "no-fields: set inspectionDepth and/or shedOrder" };
  }
  if (args.inspectionDepth !== null && !INSPECTION_DEPTHS.includes(args.inspectionDepth)) {
    return { ok: false, reason: `bad-inspection-depth: "${String(args.inspectionDepth)}"` };
  }
  if (args.shedOrder !== null && !SHED_ORDERS.includes(args.shedOrder)) {
    return { ok: false, reason: `bad-shed-order: "${String(args.shedOrder)}"` };
  }
  const nodes = draftNodes(draft);
  const node = nodes.get(nodeId);
  if (node === undefined) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  const detailParts: string[] = [];
  if (args.inspectionDepth !== null) detailParts.push(`depth=${args.inspectionDepth}`);
  if (args.shedOrder !== null) detailParts.push(`shed=${args.shedOrder}`);
  nodes.set(nodeId, Object.freeze({ ...node, ...(args.inspectionDepth !== null ? { inspectionDepth: args.inspectionDepth } : {}), ...(args.shedOrder !== null ? { shedOrder: args.shedOrder } : {}) }));
  draft.nodes = Object.freeze(nodes);
  return { ok: true, detail: detailParts.join(",") };
}

/* ── ruleBookHash derivation (M3) ─────────────────────────────────────────
 * FNV-1a-64, the KERNEL's hash family — same offset basis, prime and
 * codepoint walk as kernel/rng.ts `hashTextFast`, now shared through
 * src/internal/canonical.ts (`fnv1a64OverCodePoints`) instead of a local
 * transcription; that twin stays private in the kernel and rng-reference.ts
 * is test-only by its own header law (no new hash family is introduced).
 * The fold runs over the WHOLE book — code-unit-sorted by card id, hence
 * insertion-order independent — each entry `id␀fingerprint` joined by ␁.
 * The per-card fingerprint mirrors digest.ts's absorb walk (same fields in
 * same order) so "same hash" means "same digested book content". Like every
 * kernel hash this is a deterministic fingerprint, not a cryptographic
 * digest. */

function cardFingerprint(card: PolicyCard): string {
  const parts: string[] = [
    card.id,
    card.scope.kind,
    card.scope.ref ?? "\u2205",
    card.band,
    String(card.upkeepMicroUsd),
  ];
  for (const predicate of card.when) {
    const t = predicate.threshold;
    parts.push(predicate.metric, predicate.comparator, t.kind);
    if (t.kind === "value") parts.push(String(t.amount), t.unit);
    else if (t.kind === "class-ref") parts.push(t.classId);
    else parts.push(t.name);
  }
  for (const action of card.then) {
    parts.push(action.id, action.runbookName ?? "\u2205", String(action.value ?? -1n));
  }
  return fnv1a64OverCodePoints(parts.join("\u0000"));
}

function foldRuleBookHash(book: readonly PolicyCard[]): string {
  const sorted = [...book].sort((a, b) => compareCodeUnits(a.id, b.id));
  return fnv1a64OverCodePoints(sorted.map((card) => `${card.id}\u0000${cardFingerprint(card)}`).join("\u0001"));
}

function handlePolicyCardCommit(draft: Draft, args: PolicyCardCommitArgs): HandlerVerdict {
  const cardHash = args.cardHash; // wire type trusted (parseEntry, M2)
  if (cardHash.length === 0) return { ok: false, reason: "empty-card-hash" };
  if (draft.config.lookupPolicyCard === undefined) {
    return { ok: false, reason: "no-card-lookup: host wired no lookupPolicyCard" };
  }
  const card = draft.config.lookupPolicyCard(cardHash);
  if (card === null || card === undefined) return { ok: false, reason: `unknown-card-hash: "${cardHash}"` };
  requireString(card.id, "lookupPolicyCard result.id");
  const book = [...(draft.ruleBook ?? draft.origin.ruleBook)];
  if (book.some((existing) => existing.id === card.id)) {
    return { ok: false, reason: `card-id-collision: "${card.id}" already committed` };
  }
  book.push(Object.freeze({ ...card }));
  draft.ruleBook = Object.freeze(book);
  // M3: the hash describes the WHOLE BOOK (deterministic fold), never just
  // the last payment — save/ persists ruleBookHash as the book's identity.
  draft.ruleBookHash = foldRuleBookHash(book);
  return { ok: true, detail: `rule=${card.id}` };
}

function handleShedLoad(draft: Draft, args: ShedLoadArgs): HandlerVerdict {
  const nodeId = args.nodeId as EntityId; // wire types trusted (parseEntry, M2)
  const nodes = draft.nodes ?? draft.origin.nodes;
  if (!nodes.has(nodeId)) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  // Directive-only verb (contract scope): the actual shedding stays in step
  // 5's shed order / hard-ceiling logic; this records the player ORDER.
  return { ok: true, detail: args.qosClassId === null ? `node=${nodeId},qos=all-unclassified` : `node=${nodeId},qos=${args.qosClassId}` };
}

function handleCommunicate(draft: Draft, args: CommunicateArgs): HandlerVerdict {
  // wire types trusted (parseEntry, M2): note is a string, target string|null
  if (args.note.length === 0) return { ok: false, reason: "empty-note" };
  if (args.target !== null) {
    const target = args.target as EntityId;
    const nodes = draft.nodes ?? draft.origin.nodes;
    if (!nodes.has(target)) return { ok: false, reason: `unknown-node: "${target}"` };
  }
  return { ok: true, detail: args.target === null ? `estate:"${args.note}"` : `node=${args.target}:"${args.note}"` };
}

function handleToggleSpeed(_draft: Draft, args: ToggleSpeedArgs): HandlerVerdict {
  // speedX is a number by parse law (M2); membership in {1,2,4} is the
  // value-domain question — 2.5, NaN, 0 are refusals, never throws.
  if (!SPEED_VALUES.includes(args.speedX)) {
    return { ok: false, reason: `bad-speed: ${String(args.speedX)} not in {1,2,4}` };
  }
  return { ok: true, detail: `speed=${args.speedX}` };
}

/** OD-24(a) part 1 — the ONLY side effect is one frozen record in the
 *  OPTIONAL `GameState.pricing` book (absent ⇒ every pre-pricing digest is
 *  byte-identical — the same embed law as board/hands). No revenue, no
 *  elasticity, no invoice math: those are the queued part-2/part-3 lanes
 *  READING this book. Wire types are parse-trusted (M2): `newPriceMicroUsd`
 *  is a bigint by law, so fractional prices never exist down here — the
 *  value-domain refusals are positivity (`invalid-price`), target shape, and
 *  a well-formed non-negative business minute. */
function handleAdjustPrice(draft: Draft, args: AdjustPriceArgs): HandlerVerdict {
  const targetKind = args.targetKind;
  if (!PRICE_TARGET_KINDS.includes(targetKind)) {
    return { ok: false, reason: `bad-target-kind: "${String(targetKind)}" not in {${PRICE_TARGET_KINDS.join(",")}}` };
  }
  if (args.targetId.length === 0) return { ok: false, reason: "empty-target-id" };
  if (args.newPriceMicroUsd <= 0n) {
    return { ok: false, reason: `invalid-price: ${String(args.newPriceMicroUsd)} µ$ must be > 0` };
  }
  const effectiveAt = args.effectiveAtBusinessMinute;
  if (effectiveAt !== null && (!Number.isSafeInteger(effectiveAt) || effectiveAt < 0)) {
    return { ok: false, reason: `bad-effective-minute: ${String(effectiveAt)} must be a safe integer >= 0 (or null = now)` };
  }
  const rejection = draft.config.canAdjustPrice?.({ args, state: snapshotFor(draft), context: draft.context });
  if (rejection !== undefined && rejection !== null) {
    // host CALLBACK output stays validated (it is not door-wire input):
    return { ok: false, reason: `unknown-plan: ${requireString(rejection.reason, "canAdjustPrice result.reason")}` };
  }
  const base = draft.pricing ?? draft.origin.pricing ?? createPriceOverrideBook();
  const overrides = new Map(base.overrides);
  overrides.set(
    priceOverrideKey(targetKind, args.targetId as EntityId),
    Object.freeze({
      targetKind,
      targetId: args.targetId as EntityId,
      newPriceMicroUsd: args.newPriceMicroUsd,
      effectiveAtBusinessMinute: effectiveAt,
      setAtTick: draft.context.tick,
    }),
  );
  draft.pricing = Object.freeze({ version: base.version + 1, overrides: Object.freeze(overrides) });
  const detail = `target=${targetKind}:${args.targetId},price=${String(args.newPriceMicroUsd)}`;
  return { ok: true, detail: effectiveAt === null ? detail : `${detail},at=${String(effectiveAt)}` };
}

/** ADR-0014 #D2 SHIELD ↔ corruption — the ONLY side effect is one frozen
 *  entry in the OPTIONAL `GameState.shield` book (absent ⇒ every pre-shield
 *  digest byte-identical — the same embed law as pricing). The door NEVER
 *  touches units, corruption marks, or RNG: the veto is read at step 9
 *  through `nodeShielded` (pipeline/corruption.ts), which holds the
 *  as-of law (null = law from the executing tick; a future business-minute
 *  stamp is armed but NOT YET law — `PriceOverrideRecord`'s discipline).
 *  Last-write-wins per node: re-arming REPLACES the entry and bumps the
 *  book version. Wire types are parse-trusted (M2): the refusals own the
 *  value domain only — empty id, malformed minute, unknown node. */
function handleShield(draft: Draft, args: ShieldArgs): HandlerVerdict {
  const nodeId = args.targetNodeId as EntityId; // wire type trusted (parseEntry, M2)
  if (nodeId.length === 0) return { ok: false, reason: "empty-node-id" };
  const effectiveAt = args.effectiveAtBusinessMinute;
  if (effectiveAt !== null && (!Number.isSafeInteger(effectiveAt) || effectiveAt < 0)) {
    return { ok: false, reason: `bad-effective-minute: ${String(effectiveAt)} must be a safe integer >= 0 (or null = now)` };
  }
  const nodes = draft.nodes ?? draft.origin.nodes;
  if (!nodes.has(nodeId)) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  const base = draft.shield ?? draft.origin.shield ?? createShieldBook();
  const entries = new Map(base.entries);
  entries.set(
    nodeId,
    Object.freeze({
      shippedAtTick: draft.context.tick,
      effectiveAtBusinessMinute: effectiveAt,
    }),
  );
  draft.shield = Object.freeze({ version: base.version + 1, entries: Object.freeze(entries) });
  const detail = `node=${nodeId}`;
  return { ok: true, detail: effectiveAt === null ? detail : `${detail},at=${String(effectiveAt)}` };
}

/** ADR-0015 (Scale mechanic 1/5) SCALE ↔ reserved warmth — the ONLY side
 *  effect is one frozen entry in the OPTIONAL `GameState.scale` book
 *  (absent ⇒ every pre-scale digest byte-identical — the same embed law as
 *  pricing/shield). The door NEVER touches nodes, units, or RNG: the
 *  warmth is materialized at the step-5/6 serve capacity read through
 *  `applyScaleWarmth` (pipeline/defaults.ts), which holds the as-of law
 *  (`scaleWarmInForce` mirrors `nodeShielded`/`activePriceOverride` — null
 *  = law from the executing tick; a future business-minute stamp is armed
 *  but NOT YET law). §1.3 serverless card grounding: "a Chrysalis Pool of
 *  pre-warmed shells is the buildable: buying warmth is buying the absence
 *  of a stutter" — and `reservedSlots: 0` is the card's "scale to zero"
 *  amendment: re-booking REPLACES (no dedicated withdrawal verb, no expiry,
 *  per the shield precedent). The entry carries `baseRosterSlots` — the
 *  node's authored roster length — chain-inherited from the prior entry on
 *  amendments so withdrawal returns capacity to the AUTHORING baseline,
 *  never to whatever the live roster happens to be mid-warmth.
 *  HONEST GAP: the COST of warmth is not door-side — the door never
 *  touches cash; host opex consumption of this book is the future seam.
 *  Wire types are parse-trusted (M2): the refusals own the value domain
 *  only — empty id, malformed slots/minute, unknown node. */
function handleScaleNode(draft: Draft, args: ScaleArgs): HandlerVerdict {
  const nodeId = args.targetNodeId as EntityId; // wire type trusted (parseEntry, M2)
  if (nodeId.length === 0) return { ok: false, reason: "empty-node-id" };
  const reservedSlots = args.reservedSlots;
  if (!Number.isSafeInteger(reservedSlots) || reservedSlots < 0) {
    return { ok: false, reason: `bad-reserved-slots: ${String(reservedSlots)} must be a safe integer >= 0` };
  }
  const effectiveAt = args.effectiveAtBusinessMinute;
  if (effectiveAt !== null && (!Number.isSafeInteger(effectiveAt) || effectiveAt < 0)) {
    return { ok: false, reason: `bad-effective-minute: ${String(effectiveAt)} must be a safe integer >= 0 (or null = now)` };
  }
  const nodes = draft.nodes ?? draft.origin.nodes;
  if (!nodes.has(nodeId)) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  const base = draft.scale ?? draft.origin.scale ?? createScaleBook();
  // Chain-inherit the authored-roster anchor across amendments: the FIRST
  // booking on a node stamps the live roster length; every re-booking keeps
  // the prior entry's anchor. A pure function of (live roster, R) could
  // never tell grown warmth from authored capacity — the anchor rides the
  // entry so scale-to-zero is exact even while warm heads are in service.
  const prior = base.entries.get(nodeId);
  const anchor = prior !== undefined ? prior.baseRosterSlots : nodes.get(nodeId)!.slots.length;
  const entries = new Map(base.entries);
  entries.set(
    nodeId,
    Object.freeze({
      reservedSlots,
      baseRosterSlots: anchor,
      shippedAtTick: draft.context.tick,
      effectiveAtBusinessMinute: effectiveAt,
    }),
  );
  draft.scale = Object.freeze({ version: base.version + 1, entries: Object.freeze(entries) });
  const detail = `node=${nodeId},slots=${String(reservedSlots)}`;
  return { ok: true, detail: effectiveAt === null ? detail : `${detail},at=${String(effectiveAt)}` };
}

/** Shared band-shape law for the two ADR-0015 window books: open is the null
 *  now-sentinel or a safe integer >= 0; close is a safe integer >= 0 STRICTLY
 *  after open. A zero/negative-length band is a booking error, not a legal
 *  no-op — refusing is cheaper than pretending an empty window holds units
 *  (§2.24 hygiene "cheap but not free"). A null-open band is accepted with
 *  close 0 (an armed band already expired at the minute clock's zero — inert
 *  at read, honest history; the door compares numbers, never the clock). */
function malformedBand(openAt: number | null, closeAt: number): boolean {
  if (openAt !== null && (!Number.isSafeInteger(openAt) || openAt < 0)) return true;
  if (!Number.isSafeInteger(closeAt) || closeAt < 0) return true;
  return openAt !== null && closeAt <= openAt;
}

/** ADR-0015 (Maintain mechanic 2/5) MAINTAIN ↔ attendance — the ONLY side
 *  effect is one frozen entry in the OPTIONAL `GameState.maintain` book
 *  (absent ⇒ every pre-maintain digest byte-identical — the same embed law
 *  as pricing/shield/scale). The door NEVER touches units, dice, or RNG:
 *  the veto is read at step 9 through `maintainInForce` (pipeline/
 *  defaults.ts), which holds the as-of + expiry law (a queued unit whose
 *  queue-head node is manned as-of the business minute does NOT cast its
 *  abandonment die — the unit HOLDS). §1.3 trunk-group-voip card "The
 *  Switchboard" (hosting_game.md:1771) grounding: the trunk group is a
 *  finite set of circuits and the switchboard is a person — when nobody
 *  attends, callers give up (binary patience: they bounce; the card's
 *  patienceModel row makes this the corpus's first "binary"-mode type).
 *  The window EXPIRES — hygiene is periodic, so past `closeAtBusinessMinute`
 *  the row is inert at read but KEPT as the history witness. Last-write-
 *  wins per node: re-booking REPLACES the band and bumps the book version
 *  (the §2.24 "cheap but not free" law is priced here as occupancy 2, the
 *  ATTENDANCE class — manning a switchboard is an on-site task).
 *  Wire types are parse-trusted (M2): the refusals own the value domain
 *  only — empty id, malformed band, unknown node. */
function handleMaintainNode(draft: Draft, args: MaintainArgs): HandlerVerdict {
  const nodeId = args.targetNodeId as EntityId; // wire type trusted (parseEntry, M2)
  if (nodeId.length === 0) return { ok: false, reason: "empty-node-id" };
  const openAt = args.openAtBusinessMinute;
  const closeAt = args.closeAtBusinessMinute;
  if (malformedBand(openAt, closeAt)) {
    return { ok: false, reason: `bad-maintenance-window: open=${String(openAt)} must be null or a safe integer >= 0, close=${String(closeAt)} a safe integer >= 0 strictly after open` };
  }
  const nodes = draft.nodes ?? draft.origin.nodes;
  if (!nodes.has(nodeId)) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  const base = draft.maintain ?? draft.origin.maintain ?? createMaintainBook();
  const entries = new Map(base.entries);
  entries.set(
    nodeId,
    Object.freeze({
      openAtBusinessMinute: openAt,
      closeAtBusinessMinute: closeAt,
      shippedAtTick: draft.context.tick,
    }),
  );
  draft.maintain = Object.freeze({ version: base.version + 1, entries: Object.freeze(entries) });
  return { ok: true, detail: `node=${nodeId},open=${openAt === null ? "now" : String(openAt)},close=${String(closeAt)}` };
}

/** ADR-0015 (Schedule mechanic 2/5) SCHEDULE ↔ the job-window DEADLINE —
 *  the ONLY side effect is one frozen entry in the OPTIONAL `GameState.schedule`
 *  book (`JobWindowBook` — named for the jobs, deliberately NOT after §7.7
 *  recovery windows, which are damage records living in `GameState.recovery`).
 *  Absent ⇒ every pre-schedule digest byte-identical (the embed law). The
 *  door NEVER touches units or RNG: the deadline substitution is read at
 *  step 9 for patience-mode "window" units ONLY through `jobWindowInForce`
 *  + `jobBandDistanceUs` (pipeline/defaults.ts). §1.3 backup/archival card
 *  "Restore Point" grounding (hosting_game.md:1947/:1956/:4995): "the jobs
 *  must complete inside a backup window or fail. They don't bounce; they
 *  fail and retry" — a window-mode unit inside a live band gets its
 *  effective budget REPLACED by the sim-time distance to the band edge:
 *  a job that fits HOLDS (p = 0), a job that cannot finish by 06:00 FAILS
 *  at the edge (p = 1, the certain path — zero RNG either way). The
 *  26-hour-disaster law (:1964) prices the verb at occupancy 1 — the
 *  calendar must be cheap to correct. Last-write-wins per node; expired
 *  bands are inert at read, kept as history.
 *  Wire types are parse-trusted (M2): the refusals own the value domain
 *  only — empty id, malformed band, unknown node. */
function handleScheduleWindow(draft: Draft, args: ScheduleArgs): HandlerVerdict {
  const nodeId = args.targetNodeId as EntityId; // wire type trusted (parseEntry, M2)
  if (nodeId.length === 0) return { ok: false, reason: "empty-node-id" };
  const openAt = args.openAtBusinessMinute;
  const closeAt = args.closeAtBusinessMinute;
  if (malformedBand(openAt, closeAt)) {
    return { ok: false, reason: `bad-window-band: open=${String(openAt)} must be null or a safe integer >= 0, close=${String(closeAt)} a safe integer >= 0 strictly after open` };
  }
  const nodes = draft.nodes ?? draft.origin.nodes;
  if (!nodes.has(nodeId)) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  const base = draft.schedule ?? draft.origin.schedule ?? createJobWindowBook();
  const entries = new Map(base.entries);
  entries.set(
    nodeId,
    Object.freeze({
      openAtBusinessMinute: openAt,
      closeAtBusinessMinute: closeAt,
      shippedAtTick: draft.context.tick,
    }),
  );
  draft.schedule = Object.freeze({ version: base.version + 1, entries: Object.freeze(entries) });
  return { ok: true, detail: `node=${nodeId},open=${openAt === null ? "now" : String(openAt)},close=${String(closeAt)}` };
}

/** ADR-0015 3/5 SELL ↔ the existing money plumbing — the ONLY side effect
 *  is one frozen record in the OPTIONAL `GameState.sell` book (absent ⇒
 *  every pre-sell digest byte-identical — the same embed law as pricing).
 *  OD-24(a) part-1 posture VERBATIM: the door records the ORDER, never the
 *  money — closing the sale is the host's, which signs a contract through
 *  the EXISTING economy seam (register/openContractEconomy + priceKey
 *  @5781335) with the booked price and term; "the queued economy/HUD lanes
 *  reading this book, not the door's job". The sales act is deterministic
 *  player authority — an executed intent IS the close; no acceptance dice
 *  in v0 (grounded; the refusal grammar — `canSellOffer` above all — is the
 *  counterparty). §1.3 exchange-colo card "The Microsecond Cathedral",
 *  hosting_game.md:2361-2378: "microseconds are what you sell", "you sell
 *  *equal* latency as a product"; the verb-shift line "Colo: sell space and
 *  police power" :514. The book key REUSES `priceOverrideKey` — a sell-book
 *  key IS an economy priceKey (identity, not duplication; the door↔economy
 *  kind-vocabulary mirror is drift-pinned by tests on both sides).
 *  Wire types are parse-trusted (M2): `offerPriceMicroUsd` is a bigint by
 *  law, so a fractional offer never exists down here — the value-domain
 *  refusals are positivity (`bad-offer-price`), a whole-month term
 *  (`bad-term-months`), target shape, and a well-formed non-negative
 *  business minute. */
function handleSellOffer(draft: Draft, args: SellOfferArgs): HandlerVerdict {
  const targetKind = args.targetKind; // wire type trusted (parseEntry, M2)
  if (!PRICE_TARGET_KINDS.includes(targetKind)) {
    return { ok: false, reason: `bad-target-kind: "${String(targetKind)}" not in {${PRICE_TARGET_KINDS.join(",")}}` };
  }
  if (args.targetId.length === 0) return { ok: false, reason: "empty-target-id" };
  if (args.offerPriceMicroUsd <= 0n) {
    return { ok: false, reason: `bad-offer-price: ${String(args.offerPriceMicroUsd)} µ$ must be > 0` };
  }
  if (!Number.isSafeInteger(args.termMonths) || args.termMonths < 1) {
    return { ok: false, reason: `bad-term-months: ${String(args.termMonths)} must be a safe integer >= 1` };
  }
  const effectiveAt = args.effectiveAtBusinessMinute;
  if (effectiveAt !== null && (!Number.isSafeInteger(effectiveAt) || effectiveAt < 0)) {
    return { ok: false, reason: `bad-effective-minute: ${String(effectiveAt)} must be a safe integer >= 0 (or null = now)` };
  }
  const rejection = draft.config.canSellOffer?.({ args, state: snapshotFor(draft), context: draft.context });
  if (rejection !== undefined && rejection !== null) {
    // host CALLBACK output stays validated (it is not door-wire input):
    return { ok: false, reason: `unknown-target: ${requireString(rejection.reason, "canSellOffer result.reason")}` };
  }
  const base = draft.sell ?? draft.origin.sell ?? createSellBook();
  const entries = new Map(base.entries);
  entries.set(
    priceOverrideKey(targetKind, args.targetId as EntityId),
    Object.freeze({
      targetKind,
      targetId: args.targetId as EntityId,
      offerPriceMicroUsd: args.offerPriceMicroUsd,
      termMonths: args.termMonths,
      shippedAtTick: draft.context.tick,
      effectiveAtBusinessMinute: effectiveAt,
    }),
  );
  draft.sell = Object.freeze({ version: base.version + 1, entries: Object.freeze(entries) });
  const detail = `target=${targetKind}:${args.targetId},price=${String(args.offerPriceMicroUsd)},term=${String(args.termMonths)}`;
  return { ok: true, detail: effectiveAt === null ? detail : `${detail},at=${String(effectiveAt)}` };
}

/** ADR-0015 5/5 NEGOTIATE ↔ the conversation the card calls combat
 *  (§1.3 colo "Amps and Aisles", hosting_game.md:1632 "**Dominant verb:
 *  Negotiate.**", :1637 "a ticket/conversation system with a tenant, with
 *  tone options and a relationship meter. **This is the level's
 *  combat.**"). The ONLY door side effect is one frozen record in the
 *  OPTIONAL `GameState.negotiate` book; the MONEY leg is the economy
 *  fold's (economy/negotiate.ts reads the FORWARDED book at the renewal
 *  cliff — tone/concession tilt the EXISTING single retention draw, zero
 *  new rolls — and discount the billing base at the chain head, under the
 *  grandfather lock, ADR-0014 #D4). The door casts no dice and moves no
 *  money, ever: an executed conversation is booked player authority; the
 *  tenant's answer arrives at the cliff. The card's per-tenant
 *  relationship meter does NOT exist in v0 (honest gap; company
 *  reputation @57ea80e untouched) — the tone bumps are its stand-in.
 *  The book key REUSES `priceOverrideKey` (a negotiation key IS an
 *  economy priceKey — identity, not duplication, the sell precedent), and
 *  the tone vocabulary is a private mirror of the economy's, drift-pinned
 *  by tests on both sides. Wire types are parse-trusted (M2): the
 *  `bigint-or-null` concession carrier is a REAL bigint or the explicit
 *  null sentinel (the proto revives decimal strings before the door);
 *  value-domain refusals are the tone word (`bad-tone`), non-negative
 *  concession (`bad-concession` — the sign law lives on types.ts
 *  `NegotiateTermsArgs`), a whole-month positive extension
 *  (`bad-term-extension`), target shape, and a well-formed business
 *  minute (`bad-effective-minute`, reused verbatim). */
function handleNegotiateTerms(draft: Draft, args: NegotiateTermsArgs): HandlerVerdict {
  const targetKind = args.targetKind; // wire type trusted (parseEntry, M2)
  if (!PRICE_TARGET_KINDS.includes(targetKind)) {
    return { ok: false, reason: `bad-target-kind: "${String(targetKind)}" not in {${PRICE_TARGET_KINDS.join(",")}}` };
  }
  if (args.targetId.length === 0) return { ok: false, reason: "empty-target-id" };
  if (!NEGOTIATE_TONES.includes(args.tone)) {
    return { ok: false, reason: `bad-tone: "${String(args.tone)}" not in {${NEGOTIATE_TONES.join(",")}}` };
  }
  const concession = args.concessionMicroUsd;
  if (concession !== null && concession < 0n) {
    return {
      ok: false,
      reason: `bad-concession: ${String(concession)} µ$ must be >= 0 (or null = no money in the talk; a price RIDE rides adjust-price)`,
    };
  }
  const extension = args.termMonthsExtension;
  if (extension !== null && (!Number.isSafeInteger(extension) || extension < 1)) {
    return { ok: false, reason: `bad-term-extension: ${String(extension)} must be a safe integer >= 1 (or null = no extension)` };
  }
  const effectiveAt = args.effectiveAtBusinessMinute;
  if (effectiveAt !== null && (!Number.isSafeInteger(effectiveAt) || effectiveAt < 0)) {
    return { ok: false, reason: `bad-effective-minute: ${String(effectiveAt)} must be a safe integer >= 0 (or null = now)` };
  }
  const rejection = draft.config.canNegotiateTerms?.({ args, state: snapshotFor(draft), context: draft.context });
  if (rejection !== undefined && rejection !== null) {
    // host CALLBACK output stays validated (it is not door-wire input):
    return { ok: false, reason: `unknown-target: ${requireString(rejection.reason, "canNegotiateTerms result.reason")}` };
  }
  const base = draft.negotiate ?? draft.origin.negotiate ?? createNegotiateBook();
  const entries = new Map(base.entries);
  entries.set(
    priceOverrideKey(targetKind, args.targetId as EntityId),
    Object.freeze({
      targetKind,
      targetId: args.targetId as EntityId,
      tone: args.tone,
      concessionMicroUsd: concession,
      termMonthsExtension: extension,
      shippedAtTick: draft.context.tick,
      effectiveAtBusinessMinute: effectiveAt,
    }),
  );
  draft.negotiate = Object.freeze({ version: base.version + 1, entries: Object.freeze(entries) });
  const detail =
    `target=${targetKind}:${args.targetId},tone=${args.tone}` +
    `,concession=${concession === null ? "none" : String(concession)}` +
    `,ext=${extension === null ? "none" : String(extension)}`;
  return { ok: true, detail: effectiveAt === null ? detail : `${detail},at=${String(effectiveAt)}` };
}

/**
 * ADR-0015 session-6 roster extension ISOLATE ↔ fence (the 16th verb) — the
 * ONLY side effect is the book write. §1.3 dbaas card (hosting_game.md
 * ~:2243: "**Verb: isolate and throttle.** **The boss is a split brain.**");
 * §7.16 Act-row law (~:28825) names isolate among the four one-click
 * emergency verbs — one-click lands it in the COMMIT class; §7.5 Incident
 * Mode (~:26759) cites it in the incident verb set (the SET is host
 * choreography, not the door). The door books the WINDOW — a half-open
 * `[effective, release)` fence per node, last-write-wins — and the engine
 * reader (`pipeline/isolation.ts`, consumed at the step-5 serve input in
 * `pipeline/defaults.ts`) decides admissions. Wire types are parse-trusted
 * (M2): both minutes are `number | null` by `VERB_ARG_SHAPES`; the handler
 * owns only the VALUE domains (sign, cross-order). State-neutral by law:
 * no unit, no slot, no queue, no roster, no RNG, no cash is touched here —
 * the fence is READ downstream, never enforced at the door.
 *
 * Refusal grammar (door-shaped `reason: detail`):
 *  - `empty-node-id` / `unknown-node: "<id>"` — the shield/scale twins;
 *  - `bad-effective-minute: …` — the shield phrase VERBATIM;
 *  - `bad-release-minute: … (or null = indefinite)`;
 *  - `release-before-effective: …` — STRICT `>` when both non-null (the
 *    half-open window refuses its own empty twin); a null effective with
 *    release 0 is ACCEPTED as already-expired inert history (the maintain
 *    close-0 posture, lane L-DM2 @5987ef1).
 */
function handleIsolateNode(draft: Draft, args: IsolateArgs): HandlerVerdict {
  const nodeId = args.targetNodeId as EntityId; // wire type trusted (parseEntry, M2)
  if (nodeId.length === 0) return { ok: false, reason: "empty-node-id" };
  const effectiveAt = args.effectiveAtBusinessMinute;
  if (effectiveAt !== null && (!Number.isSafeInteger(effectiveAt) || effectiveAt < 0)) {
    return { ok: false, reason: `bad-effective-minute: ${String(effectiveAt)} must be a safe integer >= 0 (or null = now)` };
  }
  const releaseAt = args.releaseAtBusinessMinute;
  if (releaseAt !== null && (!Number.isSafeInteger(releaseAt) || releaseAt < 0)) {
    return { ok: false, reason: `bad-release-minute: ${String(releaseAt)} must be a safe integer >= 0 (or null = indefinite)` };
  }
  if (effectiveAt !== null && releaseAt !== null && releaseAt <= effectiveAt) {
    return {
      ok: false,
      reason: `release-before-effective: release ${String(releaseAt)} must be > effective ${String(effectiveAt)} (the fence window is half-open [effective, release))`,
    };
  }
  const nodes = draft.nodes ?? draft.origin.nodes;
  if (!nodes.has(nodeId)) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  const base = draft.isolate ?? draft.origin.isolate ?? createIsolateBook();
  const entries = new Map<EntityId, IsolateEntry>(base.entries);
  entries.set(
    nodeId,
    Object.freeze({
      shippedAtTick: draft.context.tick,
      effectiveAtBusinessMinute: effectiveAt,
      releaseAtBusinessMinute: releaseAt,
    }),
  );
  draft.isolate = Object.freeze({ version: base.version + 1, entries: Object.freeze(entries) });
  const detail =
    `target=${nodeId}` +
    `,eff=${effectiveAt === null ? "now" : String(effectiveAt)}` +
    `,rel=${releaseAt === null ? "indefinite" : String(releaseAt)}`;
  return { ok: true, detail };
}

/**
 * `throttle-node` handler (ADR-0016 successor program · lane L-TR) — the
 * dbaas card's OWN second verb, verbatim §1.3 "The Managed Database"
 * (hosting_game.md ~:2253: "**Verb: isolate and throttle.**"): the
 * PLAYER-AUTHORED PARTIAL capacity cut, the soft-degrade sibling of the
 * total fence above. §7.16's Act-row one-click law (~:28825) lands it in
 * the COMMIT class exactly like isolate-node. The door books the WINDOW
 * and the CUT — a half-open `[effective, release)` discount per node,
 * last-write-wins — and the engine reader (`pipeline/throttle.ts`,
 * consumed at the step-5 serve input in `pipeline/defaults.ts` §(c))
 * discounts the node's ADMISSION ceiling at read time. Wire types are
 * parse-trusted (M2): `cutSlots` is a plain `number`, both minutes are
 * `number | null` by `VERB_ARG_SHAPES`; the handler owns only the VALUE
 * domains. State-neutral by law: no unit, no slot, no roster, no queue,
 * no RNG, no cash is touched here — the cut is READ downstream, never
 * enforced at the door (the isolate posture VERBATIM).
 *
 * Refusal grammar: the fence's five codes reused VERBATIM
 * (`empty-node-id` / `bad-effective-minute: …` / `bad-release-minute: …
 * (or null = indefinite)` / `release-before-effective: …` /
 * `unknown-node: "<id>"`) plus ONE new phrase — `bad-cut-slots` — raised
 * in two legs: the shape leg (not a safe integer ≥ 0, checked before the
 * minute legs like scale's `bad-reserved-slots` family position) and the
 * RANGE leg `cut >= roster` (checked after `unknown-node`, because the
 * roster is only known once the node exists). The range leg is what keeps
 * the fence the TOTAL case: "throttle everything" is not a cut of
 * roster — it is a fence, and the refusal says so
 * ("for a total fence use isolate-node"). A cut of 0 is the explicit lift
 * amendment (booked, reads inert — `nodeThrottleCut` answers null).
 */
function handleThrottleNode(draft: Draft, args: ThrottleArgs): HandlerVerdict {
  const nodeId = args.targetNodeId as EntityId; // wire type trusted (parseEntry, M2)
  if (nodeId.length === 0) return { ok: false, reason: "empty-node-id" };
  const cutSlots = args.cutSlots;
  if (!Number.isSafeInteger(cutSlots) || cutSlots < 0) {
    return { ok: false, reason: `bad-cut-slots: ${String(cutSlots)} must be a safe integer in [0, roster) (0 = explicit lift amendment; for a total fence use isolate-node)` };
  }
  const effectiveAt = args.effectiveAtBusinessMinute;
  if (effectiveAt !== null && (!Number.isSafeInteger(effectiveAt) || effectiveAt < 0)) {
    return { ok: false, reason: `bad-effective-minute: ${String(effectiveAt)} must be a safe integer >= 0 (or null = now)` };
  }
  const releaseAt = args.releaseAtBusinessMinute;
  if (releaseAt !== null && (!Number.isSafeInteger(releaseAt) || releaseAt < 0)) {
    return { ok: false, reason: `bad-release-minute: ${String(releaseAt)} must be a safe integer >= 0 (or null = indefinite)` };
  }
  if (effectiveAt !== null && releaseAt !== null && releaseAt <= effectiveAt) {
    return {
      ok: false,
      reason: `release-before-effective: release ${String(releaseAt)} must be > effective ${String(effectiveAt)} (the cut window is half-open [effective, release))`,
    };
  }
  const nodes = draft.nodes ?? draft.origin.nodes;
  if (!nodes.has(nodeId)) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  // RANGE leg of bad-cut-slots — the live-roster check (the scale lane's
  // baseRosterSlots-from-live-roster precedent): cut ∈ [0, roster). This is
  // the door's promise that every booked throttle is PARTIAL; the total
  // case belongs to the fence.
  const roster = nodes.get(nodeId)!.slots.length;
  if (cutSlots >= roster) {
    return { ok: false, reason: `bad-cut-slots: ${String(cutSlots)} must be a safe integer in [0, ${String(roster)}) (0 = explicit lift amendment; for a total fence use isolate-node)` };
  }
  const base = draft.throttle ?? draft.origin.throttle ?? createThrottleBook();
  const entries = new Map<EntityId, ThrottleEntry>(base.entries);
  entries.set(
    nodeId,
    Object.freeze({
      shippedAtTick: draft.context.tick,
      cutSlots,
      effectiveAtBusinessMinute: effectiveAt,
      releaseAtBusinessMinute: releaseAt,
    }),
  );
  draft.throttle = Object.freeze({ version: base.version + 1, entries: Object.freeze(entries) });
  const detail =
    `target=${nodeId}` +
    `,cut=${String(cutSlots)}` +
    `,eff=${effectiveAt === null ? "now" : String(effectiveAt)}` +
    `,rel=${releaseAt === null ? "indefinite" : String(releaseAt)}`;
  return { ok: true, detail };
}

/**
 * `restart-node` handler (ADR-0016 successor program · lane L-RS) — the
 * LAST unbuilt §7.16 Act-row verb (hosting_game.md ~:28825: "an 'Act' row of
 * at most four one-click emergency verbs… drain, restart, isolate, shed";
 * the wave-20 rider at ~:28838 recorded restart as "the unbuilt named
 * successor" — this is the blessing). §7.5's reference durations (~:26741:
 * "restart a service **20s**") price the desk tap ⇒ COMMIT class, one hand /
 * one tick, the one-click law again. The door books the WINDOW and the FLUSH
 * MODE — a half-open `[effective, release)` reboot per node, last-write-wins
 * — and the engine reader (`pipeline/restart.ts`, consumed at the step-5
 * serve input in `pipeline/defaults.ts` §(c)/(c′)) zeroes admissions while
 * live and, in "drop" mode, walks the whole waiting queue through the
 * EXISTED hard-ceiling shed channel every in-window tick (zero dice, zero
 * new event kinds). Wire types are parse-trusted (M2): `dropQueued` is a
 * closed-vocab `string` (a BOOLEAN `true` is structural garbage — the
 * speedX wrong-TYPE throw precedent), both minute legs keep the fence's
 * discipline but `releaseAtBusinessMinute` is a REQUIRED `number`: null
 * release THROWS at the wall, because an unbounded restart would be
 * structurally indistinguishable from `isolate-node` and the door refuses to
 * fork the fence under another name. State-neutral by law: no unit, no slot,
 * no roster, no queue, no RNG, no cash is touched here — the reboot is READ
 * downstream, never enforced at the door (the fence posture VERBATIM).
 *
 * Refusal grammar: the fence's five codes reused VERBATIM
 * (`empty-node-id` / `bad-effective-minute: …` / `bad-release-minute: …` /
 * `release-before-effective: …` / `unknown-node: "<id>"`) plus ONE new
 * phrase — `bad-drop-mode` (the negotiate `bad-tone` twin: the value domain
 * is the handler's, checked at the fence's shape-leg position right after
 * `empty-node-id`). The `bad-release-minute` check still guards the VALUE
 * domain (non-safe-integer or < 0) even though the TYPE wall has already
 * made null unreachable — verbatim phrase reuse spends no new census code,
 * and the "(or null = indefinite)" tail of the shared string is honest for
 * the fence family that raised it first. There is NO range leg: a restart
 * reads no roster (unlike throttle's `cut >= roster`), and the required
 * release leg makes an indefinite "restart-equals-fence" authoring
 * impossible at the wire, so no pointing refusal is needed.
 */
function handleRestartNode(draft: Draft, args: RestartArgs): HandlerVerdict {
  const nodeId = args.targetNodeId as EntityId; // wire type trusted (parseEntry, M2)
  if (nodeId.length === 0) return { ok: false, reason: "empty-node-id" };
  const dropMode = args.dropQueued;
  if (dropMode !== "drop" && dropMode !== "keep") {
    return { ok: false, reason: `bad-drop-mode: "${String(dropMode)}" not in {drop,keep}` };
  }
  const effectiveAt = args.effectiveAtBusinessMinute;
  if (effectiveAt !== null && (!Number.isSafeInteger(effectiveAt) || effectiveAt < 0)) {
    return { ok: false, reason: `bad-effective-minute: ${String(effectiveAt)} must be a safe integer >= 0 (or null = now)` };
  }
  const releaseAt = args.releaseAtBusinessMinute;
  if (!Number.isSafeInteger(releaseAt) || releaseAt < 0) {
    return { ok: false, reason: `bad-release-minute: ${String(releaseAt)} must be a safe integer >= 0 (or null = indefinite)` };
  }
  if (effectiveAt !== null && releaseAt <= effectiveAt) {
    return {
      ok: false,
      reason: `release-before-effective: release ${String(releaseAt)} must be > effective ${String(effectiveAt)} (the reboot window is half-open [effective, release))`,
    };
  }
  const nodes = draft.nodes ?? draft.origin.nodes;
  if (!nodes.has(nodeId)) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  const base = draft.restart ?? draft.origin.restart ?? createRestartBook();
  const entries = new Map<EntityId, RestartEntry>(base.entries);
  entries.set(
    nodeId,
    Object.freeze({
      shippedAtTick: draft.context.tick,
      dropQueued: dropMode === "drop",
      effectiveAtBusinessMinute: effectiveAt,
      releaseAtBusinessMinute: releaseAt,
    }),
  );
  draft.restart = Object.freeze({ version: base.version + 1, entries: Object.freeze(entries) });
  const detail =
    `target=${nodeId}` +
    `,drop=${dropMode}` +
    `,eff=${effectiveAt === null ? "now" : String(effectiveAt)}` +
    `,rel=${String(releaseAt)}`;
  return { ok: true, detail };
}

/**
 * `reclaim-node` handler (ADR-0017 #1/#3 · lane L-DM5) — the §1.4 CI/build-
 * farm card's THIRD verb, verbatim "~:2679 `Verb: isolate, expire, reclaim`"
 * (isolate landed @86cff89, expire rides its release legs, reclaim closes
 * the row). A RECLAIM is a TOMBSTONE, not an act of destruction: the door
 * records one frozen entry into the OPTIONAL `GameState.reclaim` book and
 * touches NOTHING else — no roster written, no queue truncated, no occupied
 * arm evicted, no unit/board/cash/RNG touched (the shield/scale state-
 * neutrality VERBATIM). The VOID is materialized at the six player-booking
 * capacity reads (steps 5/9) through `pipeline/reclaim.ts`: while armed,
 * every booking that shipped AT OR BEFORE the tombstone answers inert, and
 * bookings shipped AFTER it stand — the rebuild half of the cycle. Guards:
 * the shield trio `empty-node-id` → `bad-effective-minute` → `unknown-node`
 * reused BYTE-EXACT (the zero-new-census law — reclaim is the first
 * tier-extension verb to add NO refusal phrase at all). NO "nothing-to-
 * collect" refusal exists: collecting an unbooked node is a legal no-op, the
 * corpus spot law is "reclaimable at ANY moment" (~:24851) and a future
 * stamp is the scheduled collection. The tombstone never expires (no
 * release leg — amendments LWW; Shield's un-shieldable posture, aimed at
 * promises instead of protection). */
function handleReclaimNode(draft: Draft, args: ReclaimArgs): HandlerVerdict {
  const nodeId = args.targetNodeId as EntityId; // wire type trusted (parseEntry, M2)
  if (nodeId.length === 0) return { ok: false, reason: "empty-node-id" };
  const effectiveAt = args.effectiveAtBusinessMinute;
  if (effectiveAt !== null && (!Number.isSafeInteger(effectiveAt) || effectiveAt < 0)) {
    return { ok: false, reason: `bad-effective-minute: ${String(effectiveAt)} must be a safe integer >= 0 (or null = now)` };
  }
  const nodes = draft.nodes ?? draft.origin.nodes;
  if (!nodes.has(nodeId)) return { ok: false, reason: `unknown-node: "${nodeId}"` };
  const base = draft.reclaim ?? draft.origin.reclaim ?? createReclaimBook();
  const entries = new Map<EntityId, ReclaimEntry>(base.entries);
  entries.set(
    nodeId,
    Object.freeze({
      shippedAtTick: draft.context.tick,
      effectiveAtBusinessMinute: effectiveAt,
    }),
  );
  draft.reclaim = Object.freeze({ version: base.version + 1, entries: Object.freeze(entries) });
  const detail = `target=${nodeId}` + `,eff=${effectiveAt === null ? "now" : String(effectiveAt)}`;
  return { ok: true, detail };
}

/** Read-only view of the draft for the placement validator (it must see
 *  devices placed EARLIER in the same tick, never a stale board — and,
 *  F5, never a stale TickContext either: snapshots take the stamped build). */
function snapshotFor(draft: Draft): GameState {
  return buildState(draft, true);
}

/** Freeze the draft into a GameState — unchanged sections keep the ORIGIN's
 *  object identity (the ground-truth audit test relies on it).
 *  `forSnapshot` (F5): the validator's view ALWAYS carries this pass's
 *  context stamp, even when nothing else materialized — with a zero-cost
 *  verb first, the old early-return handed `draft.origin` (PRIOR tick's
 *  context) straight to `query.state`, contradicting W1. Snapshots are
 *  throwaway frozen copies the validator cannot poison; the FINAL door
 *  state still keeps origin identity when nothing applied (identity law). */
function buildState(draft: Draft, forSnapshot = false): GameState {
  if (
    draft.nodes === null && draft.board === null && draft.hands === null &&
    draft.ruleBook === null && draft.ruleBookHash === null && draft.pricing === null &&
    draft.attention === null && draft.shield === null && draft.scale === null &&
    draft.maintain === null && draft.schedule === null && draft.sell === null &&
    draft.negotiate === null && draft.isolate === null && draft.throttle === null &&
    draft.restart === null && draft.reclaim === null
  ) {
    if (!forSnapshot) return draft.origin;
    return Object.freeze({ ...draft.origin, context: draft.context });
  }
  return Object.freeze({
    ...draft.origin,
    // W1 — single fresh-context source: the validator's `query.state.context`
    // must agree with `query.context`. draft.origin carries the PRIOR tick's
    // context; every state this door hands out (snapshots AND the final
    // result) is stamped with this pass's TickContext. Nothing mutates it —
    // the driver still rebuilds its own when it assembles the next state.
    context: draft.context,
    ...(draft.nodes !== null ? { nodes: draft.nodes } : {}),
    ...(draft.board !== null ? { board: draft.board } : {}),
    ...(draft.hands !== null ? { hands: draft.hands } : {}),
    ...(draft.ruleBook !== null ? { ruleBook: draft.ruleBook } : {}),
    ...(draft.ruleBookHash !== null ? { ruleBookHash: draft.ruleBookHash } : {}),
    ...(draft.pricing !== null ? { pricing: draft.pricing } : {}),
    ...(draft.attention !== null ? { attention: draft.attention } : {}),
    ...(draft.shield !== null ? { shield: draft.shield } : {}),
    ...(draft.scale !== null ? { scale: draft.scale } : {}),
    ...(draft.maintain !== null ? { maintain: draft.maintain } : {}),
    ...(draft.schedule !== null ? { schedule: draft.schedule } : {}),
    ...(draft.sell !== null ? { sell: draft.sell } : {}),
    ...(draft.negotiate !== null ? { negotiate: draft.negotiate } : {}),
    ...(draft.isolate !== null ? { isolate: draft.isolate } : {}),
    ...(draft.throttle !== null ? { throttle: draft.throttle } : {}),
    ...(draft.restart !== null ? { restart: draft.restart } : {}),
    ...(draft.reclaim !== null ? { reclaim: draft.reclaim } : {}),
  });
}

/* ═══════════════════════════ The door ═══════════════════════════ */

function carrierLabel(payload: PlayerIntent["payload"]): string {
  if (payload.kind === "verb") return `verb:${payload.verb}`;
  if (payload.kind === "slider") return `slider:${payload.control}`;
  return "player-verb";
}

function executeEntry(draft: Draft, entry: ExternalIntent): void {
  const context = draft.context;
  const tick = context.tick;
  const intent = entry.intent;
  const seq = intent.seq;
  const cause: CauseId = asCauseId(`intent:${seq}`);
  const reject = (verbLabel: string, reason: string): void => {
    draft.events.push(
      Object.freeze({
        kind: "intent-refused" as const,
        atUs: context.clocks.simUs,
        tick,
        causeId: cause,
        verb: verbLabel,
        intentSeq: seq,
        reason,
      }),
    );
    draft.receipts.push(Object.freeze({ submittedTick: entry.tick, seq, verb: verbLabel, outcome: "refused" as const, reason }));
  };

  if (intent.payload.kind !== "player-verb") {
    reject(carrierLabel(intent.payload), "unsupported-verb-carrier: the door executes only kind=\"player-verb\" intents");
    return;
  }
  const args = intent.payload.args;
  const verb = args.verb as PlayerVerb; // parseEntry validated membership
  const label = verb;

  // Canonical payment order: HANDS first, then handler semantics — an
  // unaffordable action is refused before its payload is even interpreted.
  const cost = draft.config.handCost?.[verb] ?? DEFAULT_INTENT_HAND_COST[verb];
  const occupancy = draft.config.occupancyTicks?.[verb] ?? DEFAULT_INTENT_OCCUPANCY_TICKS[verb];
  // DRAIN MODE (§7.2 R54): the hand's CAUSE becomes the pending-disconnect
  // record (`drain:<edgeId>` instead of `intent:<seq>`) and the hold covers
  // the drain window (drainTicks SUPERSEDES occupancyTicks for this verb —
  // the pull lands exactly as the token frees; resolveDrainPolicy has already
  // thrown if the host zeroed this verb's cost, so a drain always books a
  // hand). The EVENT keeps its `intent:<seq>` attribution; only the token
  // namespace differs.
  const drainMode = draft.drain.enabled && verb === PlayerVerb.DisconnectDrain;
  const tokenCause: CauseId = drainMode ? drainCause((args as DisconnectDrainArgs).edgeId) : cause;
  let handIndexes: readonly number[] = Object.freeze([]);
  let busyUntilTick = tick;
  let handsSnapshot: HandState | null = null; // pre-occupy draft value for undo
  if (cost > 0) {
    const hands = draftHands(draft, tick);
    const free = freeHandCount(hands);
    if (free < cost) {
      reject(label, `hands-exhausted: need ${cost}, free ${free} of ${hands.capacity}`);
      return;
    }
    if (drainMode && hands.tokens.some((token) => token.busyCauseId === tokenCause)) {
      // A live drain on this edge holds a token (matured ones were just
      // swept by the due-queue pass). Refused BEFORE any spend — the half of
      // "stop new" that says stop NEW disconnects too: one choreography per
      // cable, the second pull order is redundant input.
      reject(label, `edge-draining: "${(args as DisconnectDrainArgs).edgeId}" is already draining — the safe-to-touch pull lands when its reservation frees`);
      return;
    }
    handsSnapshot = draft.hands;
    busyUntilTick = tick + BigInt(drainMode ? draft.drain.drainTicks : occupancy);
    handIndexes = Object.freeze(occupyHands(draft, tick, cost, tokenCause, busyUntilTick));
  }

  // OD-6(a) DOUBLE-DENOMINATION: a verb listed in config.attentionCost ALSO
  // books one free token from the special-hand pool (pipeline/attention.ts)
  // for the SAME occupancy window and cause. Both denominations must be
  // payable or NOTHING spends (the normal-rail refund below mirrors the
  // handler-refusal undo). Absent pool or no free hand → refusal
  // `attention-debt:` — the skip-the-token-that-tick law, a visible event,
  // never a silent loss. Default: the map is empty and this block never runs.
  let attentionSnapshot: AttentionState | null = null; // pre-occupy value for undo
  let attentionPaid = false; // this entry booked a special token?
  if (draft.attentionCost?.has(verb) === true) {
    const pool = draftAttention(draft, tick); // caches any due-release
    attentionSnapshot = draft.attention;
    if (pool === null) {
      if (cost > 0) draft.hands = handsSnapshot;
      reject(label, `attention-debt: verb "${verb}" requires an attention hand but GameState.attention is absent (the host never seeded the special pool)`);
      return;
    }
    const spend = attentionSpend(pool, tick, tokenCause, busyUntilTick);
    if (spend.index === null) {
      // No special hand free: `draftAttention` ALREADY cached any due-release
      // above (attentionSpend's internal sweep is idempotent on the same tick,
      // so spend.state === pool — nothing further to materialize). Refund the
      // normal rail and refuse; a pass that freed nothing keeps state identity.
      if (cost > 0) draft.hands = handsSnapshot;
      reject(label, spend.refusal ?? "attention-debt: no free attention hand");
      return;
    }
    draft.attention = spend.state;
    attentionPaid = true;
  }

  const verdict: HandlerVerdict = (() => {
    switch (verb) {
      case PlayerVerb.PlaceDevice:
        return handlePlaceDevice(draft, args as PlaceDeviceArgs);
      case PlayerVerb.ConnectPorts:
        return handleConnectPorts(draft, args as ConnectPortsArgs);
      case PlayerVerb.DisconnectDrain:
        return handleDisconnectDrain(draft, args as DisconnectDrainArgs);
      case PlayerVerb.ConfigureNode:
        return handleConfigureNode(draft, args as ConfigureNodeArgs);
      case PlayerVerb.PolicyCardCommit:
        return handlePolicyCardCommit(draft, args as PolicyCardCommitArgs);
      case PlayerVerb.ShedLoad:
        return handleShedLoad(draft, args as ShedLoadArgs);
      case PlayerVerb.Communicate:
        return handleCommunicate(draft, args as CommunicateArgs);
      case PlayerVerb.ToggleSpeed:
        return handleToggleSpeed(draft, args as ToggleSpeedArgs);
      case PlayerVerb.AdjustPrice:
        return handleAdjustPrice(draft, args as AdjustPriceArgs);
      case PlayerVerb.Shield:
        return handleShield(draft, args as ShieldArgs);
      case PlayerVerb.ScaleNode:
        return handleScaleNode(draft, args as ScaleArgs);
      case PlayerVerb.MaintainNode:
        return handleMaintainNode(draft, args as MaintainArgs);
      case PlayerVerb.ScheduleWindow:
        return handleScheduleWindow(draft, args as ScheduleArgs);
      case PlayerVerb.SellOffer:
        return handleSellOffer(draft, args as SellOfferArgs);
      case PlayerVerb.NegotiateTerms:
        return handleNegotiateTerms(draft, args as NegotiateTermsArgs);
      case PlayerVerb.IsolateNode:
        return handleIsolateNode(draft, args as IsolateArgs);
      case PlayerVerb.ThrottleNode:
        return handleThrottleNode(draft, args as ThrottleArgs);
      case PlayerVerb.RestartNode:
        return handleRestartNode(draft, args as RestartArgs);
      case PlayerVerb.ReclaimNode:
        return handleReclaimNode(draft, args as ReclaimArgs);
    }
  })();

  if (!verdict.ok) {
    // Undo the reservation by restoring the pre-occupy snapshot: a refusal
    // spends nothing, including not materializing a `hands` slice that was
    // absent on entry (keeps refused-only passes state-identity-stable). The
    // attention denomination rides the same undo (OD-6(a): refusal spends
    // NOTHING, in either currency).
    draft.hands = handsSnapshot;
    if (attentionPaid) draft.attention = attentionSnapshot;
    reject(label, verdict.reason);
    return;
  }

  draft.events.push(
    Object.freeze({
      kind: "intent-executed" as const,
      atUs: context.clocks.simUs,
      tick,
      causeId: cause,
      verb: label,
      intentSeq: seq,
      handIndexes,
      busyUntilTick,
      detail: verdict.detail,
    }),
  );
  draft.receipts.push(
    Object.freeze({
      submittedTick: entry.tick,
      seq,
      verb: label,
      outcome: "executed" as const,
      reason: null,
      ...(verdict.detail === null ? {} : { detail: verdict.detail }),
    }),
  );
}

/**
 * Apply the external-intent schedule BEFORE step 1 of `context.tick`
 * (§7.13 canonical position). Pure over GameState: returns a NEW state (or
 * the same object when nothing applied). Order: entries stamped at or before
 * the current tick sort by (tick, seq); future stamps refuse after the due
 * pass, in input order. No RNG, no clock reads, no platform APIs.
 */
export function applyIntentDoor(
  state: GameState,
  context: TickContext,
  externalIntents: readonly ExternalIntent[],
  config: IntentDoorConfig = {},
): IntentDoorResult {
  const draft: Draft = {
    origin: state,
    context,
    config,
    drain: resolveDrainPolicy(config),
    attentionCost: resolveAttentionCost(config),
    nodes: null,
    board: null,
    hands: null,
    attention: null,
    ruleBook: null,
    ruleBookHash: null,
    pricing: null,
    shield: null,
    scale: null,
    maintain: null,
    schedule: null,
    sell: null,
    negotiate: null,
    isolate: null,
    throttle: null,
    restart: null,
    reclaim: null,
    events: [],
    receipts: [],
  };

  // Due-queue BEFORE entries (§7.13 ordering law for the two-phase pull): a
  // drain maturing at this tick pulls its cable FIRST, so entries stamped at
  // the same tick already see the edge safe-to-touch (gone). Continuations
  // mint events, never receipts — receipts stay "one per FED intent".
  processMaturedDrains(draft);

  const due: ExternalIntent[] = [];
  const future: ExternalIntent[] = [];
  // M4 — FEED UNIQUENESS: (tick, seq) is the attribution identity (causeId
  // `intent:<seq>` and receipts key on it). Two entries carrying one stamp in
  // a single feed would execute under ONE causeId — a host programming bug,
  // structural garbage by the same law as wrong wire types, so it throws and
  // names both offending input positions rather than silently double-firing.
  const seenStamp = new Map<string, number>();
  externalIntents.forEach((raw, index) => {
    const entry = parseEntry(raw, index);
    const stampKey = `${entry.tick}|${entry.intent.seq}`;
    const firstIndex = seenStamp.get(stampKey);
    if (firstIndex !== undefined) {
      fail(
        "externalIntents",
        `duplicate (tick, seq) stamp tick=${entry.tick} seq=${entry.intent.seq}: externalIntents[${firstIndex}] and externalIntents[${index}] both carry it — every intent must be fed EXACTLY ONCE per schedule`,
      );
    }
    seenStamp.set(stampKey, index);
    if (entry.tick > context.tick) future.push(entry);
    else due.push(entry);
  });
  due.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick < b.tick ? -1 : 1;
    return a.intent.seq - b.intent.seq;
  });

  for (const entry of due) executeEntry(draft, entry);
  for (const entry of future) {
    const label =
      entry.intent.payload.kind === "player-verb"
        ? (entry.intent.payload.args.verb as string)
        : carrierLabel(entry.intent.payload);
    draft.events.push(
      Object.freeze({
        kind: "intent-refused" as const,
        atUs: context.clocks.simUs,
        tick: context.tick,
        causeId: asCauseId(`intent:${entry.intent.seq}`),
        verb: label,
        intentSeq: entry.intent.seq,
        reason: `stamped-in-future: entry tick ${entry.tick} > current ${context.tick}`,
      }),
    );
    draft.receipts.push(
      Object.freeze({
        submittedTick: entry.tick,
        seq: entry.intent.seq,
        verb: label,
        outcome: "refused" as const,
        reason: `stamped-in-future: entry tick ${entry.tick} > current ${context.tick}`,
      }),
    );
  }

  return Object.freeze({
    state: buildState(draft),
    events: Object.freeze(draft.events),
    receipts: Object.freeze(draft.receipts),
  });
}
