/**
 * gates/g7 · session — TWO BOARDS, ONE POOL (the §9.13 gate #7 stepper).
 *
 * The architecture is g4Session's (a local createTickDriver, queue-then-step,
 * receipts as the panel's truth) wired to the engine's Gate-7 world shape
 * EXACTLY as packages/sim-core/src/__tests__/gate-g7.test.ts pins it: real
 * step-12.5 rule phase (policy/evaluator via createRulePhaseStep), real
 * rule-carrier translation at the door (`ruleCarriers: "mapped"`), the Book's
 * stamped intents re-fed on the NEXT tick — the only channel the driver
 * offers — and player feeds in the 1000+ seq space (the M4 collision law).
 *
 * The thesis, in code:
 *  - ONE hands rail: a player `connect-ports` and a rule
 *    `raise-inspection-depth→configure-node` pay the SAME two tokens, and
 *    (tick, seq) decides the loser — `origin` never does;
 *  - the unwatched board runs: no player clicks, the committed book keeps
 *    adjudicating, executing, and booking refusals every tick;
 *  - the bought-verb wall: `failover` fires in the tape and dies at the door
 *    as `unsupported-verb-carrier` — ticker-yes, board-no;
 *  - §7.12 staff-hours: the door's `attentionCost` is the owner's opening
 *    map (ATTENTION_DEFAULT_COSTS — exactly policy-card-commit and
 *    communicate pay a focus hand); rule carriers are EXEMPT (ADR-0013
 *    #12(v)/D4) — the Book works nights;
 *  - §7.14 dry-run: `shadowEvaluationConfig` through the same step —
 *    firings visible, zero intents minted.
 */
import { asEntityId, asRuleId, PlayerVerb } from "@hh/sim-core/types";
import type {
  AttentionLoanKind,
  AttentionState,
  EntityId,
  ExternalIntent,
  GameState,
  PlayerIntent,
  PlayerVerbArgs,
  RuleFiring,
  RuleId,
  RunSeed,
  SimEvent,
  SimTick,
} from "@hh/sim-core/types";
import { fromInt, initialClocks, MICROS_PER_MIN, streamFor } from "@hh/sim-core/kernel";
import {
  attentionWindowEntry,
  ATTENTION_DEFAULT_COSTS,
  createAttentionState,
  createBoardState,
  createDefaultSlots,
  createInitialState,
  createTickDriver,
  digestState,
  makeSlots,
  mintHandState,
  type IntentReceipt,
  type TickDriver,
} from "@hh/sim-core/pipeline";
import {
  createRulePhaseStep,
  defaultEvaluationConfig,
  shadowEvaluationConfig,
  type PolicyEvaluationConfig,
} from "@hh/sim-core/policy";
import { canonicalDigest } from "@hh/sim-core/replay";
import {
  G7_CABLE,
  G7_CARD_BLURB,
  G7_CARDS,
  G7_DB,
  G7_EDGE,
  G7_ORIGIN,
  g7CardHash,
  g7LookupPolicyCard,
} from "./g7Deck.ts";

export const G7_ENGINE_VERSION = "gate-g7-proto";

/** Player stamps live in 1000+; the driver's rule counter starts at 1 (M4). */
const PLAYER_SEQ_FLOOR = 1000;

const MIN = MICROS_PER_MIN;

/* The micro-board node stubs — the gate test's shape, halved (edge → origin,
 * one slot, one minute of service). Fed at 2/min below, ρ crosses the 62.5 %
 * wall the book watches and never comes back: the pressure is permanent, so
 * "the unwatched board runs" is observable on any tick you look. */
function nodeStub(id: EntityId, kind: string) {
  return {
    id,
    kind,
    slots: makeSlots(1),
    serviceTimeUs: MIN,
    queueDepth: 0,
    queue: [],
    shedOrder: "qos-weighted" as const,
    inspectionDepth: "pass-through" as const,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: null,
  };
}

const ENVELOPES = Object.freeze([
  Object.freeze({
    tableId: "g7-plateau",
    role: "baseline" as const,
    shape: "plateau" as const,
    ratePerMin: fromInt(2),
    telegraphed: false,
    dominantFamily: "organic" as const,
  }),
]);

/* ── views (panel-renderable, stringified bigints, frozen) ───────────────── */

export type HandOrigin = "player" | "rule";

export interface G7HandView {
  readonly index: number;
  readonly busyUntilTick: string;
  readonly busyCauseId: string | null;
  /** Origin of the INTENT that holds this hand right now (half-open law),
   *  derived from `intent:<seq>` attribution — never from a guess. */
  readonly origin: HandOrigin | null;
}

export interface G7AttentionView {
  readonly capacity: number;
  readonly debt: number;
  readonly window: number;
  readonly freePips: number;
  readonly busyPips: number;
}

export interface G7NodeView {
  readonly id: string;
  readonly kind: string;
  readonly serviceTimeUs: bigint;
  readonly rho: bigint;
  readonly queueDepth: number;
  readonly inspectionDepth: string;
}

export interface G7EdgeView {
  readonly id: string;
  readonly relation: string;
  readonly from: string;
  readonly to: string;
}

export interface G7ReceiptView {
  readonly tick: string;
  readonly seq: number;
  readonly verb: string;
  readonly outcome: "executed" | "refused";
  readonly reason: string | null;
  readonly detail: string | null;
  readonly origin: HandOrigin;
}

export interface G7FiringView {
  readonly tick: string;
  readonly rule: string;
  readonly mode: "live" | "shadow";
  readonly band: string;
  readonly actions: readonly string[];
  readonly causeId: string;
}

export interface G7CardView {
  readonly id: string;
  readonly blurb: string;
  readonly band: string;
  readonly scopeRef: string;
  readonly actionIds: readonly string[];
  readonly hash8: string;
  readonly committed: boolean;
  readonly suspended: boolean;
  readonly firings: number;
  readonly shadowFirings: number;
  readonly executions: number;
  readonly refusals: number;
  readonly lastRefusalReason: string | null;
  /** Advisory bands mint zero intents by law (§7.14) — surfaced honestly. */
  readonly advisory: boolean;
}

export interface G7TapeEntry {
  readonly kind: "firing" | "receipt";
  readonly tick: string;
  readonly origin: HandOrigin | null;
  readonly text: string;
  readonly order: number;
}

export interface G7WindowResult {
  readonly opened: boolean;
  readonly refusal: string | null;
}

export interface G7Snapshot {
  readonly tick: string;
  readonly hands: readonly G7HandView[];
  readonly attention: G7AttentionView;
  readonly nodes: readonly G7NodeView[];
  readonly edges: readonly G7EdgeView[];
  readonly book: readonly G7CardView[];
  readonly receipts: readonly G7ReceiptView[];
  readonly firings: readonly G7FiringView[];
  readonly tape: readonly G7TapeEntry[];
  readonly cashFree: bigint;
  readonly ruleBookHash: string;
  readonly shadow: boolean;
  readonly digest: string;
}

/* ── the session ─────────────────────────────────────────────────────────── */

export class G7Session {
  readonly seed: number;
  private readonly runSeed: RunSeed;
  private readonly driver: TickDriver;
  private game: GameState;
  private readonly shadowRef = { shadow: false };
  private readonly suppressed = new Set<string>();
  private doorSeq = PLAYER_SEQ_FLOOR;
  private readonly pendingPlayer: ExternalIntent[] = [];
  private pendingRules: readonly PlayerIntent[] = [];
  /** seq → attribution, filled at stamp time: player queue + Book re-feeds. */
  private readonly seqToOrigin = new Map<number, HandOrigin>();
  private readonly seqToRule = new Map<number, RuleId>();
  private readonly receipts: G7ReceiptView[] = [];
  private readonly firings: G7FiringView[] = [];

  constructor(seed: number = 904) {
    if (!Number.isInteger(seed) || seed < 0) {
      throw new Error(`G7Session: seed must be a non-negative integer, got ${seed}`);
    }
    this.seed = seed;
    this.runSeed = fromRunSeed(seed);
    this.game = createInitialState({
      runSeed: this.runSeed,
      engineVersion: G7_ENGINE_VERSION,
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "gate-g7-proto-sheets", ruleBookHash: "" },
      clocks: initialClocks(),
      nodes: [nodeStub(G7_EDGE, "edge"), nodeStub(G7_ORIGIN, "origin")],
      hands: mintHandState(2),
      board: createBoardState([
        Object.freeze({ id: G7_CABLE, relation: "data" as const, from: G7_EDGE, to: G7_ORIGIN, slot: null }),
      ]),
      // The Book starts SHUT — every standing policy must be committed through
      // the door by a pair of hands (and a focus hand). That is the gate.
      ruleBook: [],
      ruleBookHash: "",
      attention: createAttentionState(1), // §7.5 "one special hand"; loans mint it
    });
    const slots = createDefaultSlots(
      Object.freeze({
        runSeed: this.runSeed,
        dnsNodeId: null,
        expressPath: Object.freeze([G7_EDGE, G7_ORIGIN] as readonly EntityId[]),
        deepPath: Object.freeze([] as readonly EntityId[]),
        defaultPatienceUs: 3n * MIN,
        defaultSizeCost: fromInt(1),
        patienceJitterPct: 0,
        inspectionCostUs: Object.freeze({
          "pass-through": 0n,
          "sample-1-in-20": 3n * MIN,
          inspect: 10n * MIN,
          challenge: 20n * MIN,
        }),
        detectionRatio: fromInt(1),
        falsePositiveRatio: fromInt(0),
        referralProbability: fromInt(0),
        returnProbability: fromInt(0),
      }),
    );
    // The Dry-Run Toggle seam is LIVE (§7.14): the step reads its config
    // through a getter, so flipping `shadowRef` switches adjudication mode
    // between ticks without rebuilding the driver.
    const rulePhase = createRulePhaseStep((): PolicyEvaluationConfig =>
      this.shadowRef.shadow ? shadowEvaluationConfig : defaultEvaluationConfig,
    );
    this.driver = createTickDriver(
      Object.freeze({ ...slots, rulePhase: rulePhase.step }),
      streamFor(this.runSeed, "root", 0),
      this.game.context.clocks,
      {
        intents: Object.freeze({
          handCapacity: 2,
          // The owner's opening tax (ADR-0013 #12(v)): commit + communicate.
          attentionCost: ATTENTION_DEFAULT_COSTS,
          // ADR-0018: the Book pays the SAME hands rail as the player.
          ruleCarriers: "mapped" as const,
          lookupPolicyCard: g7LookupPolicyCard,
          canPlaceDevice: (query: { readonly args: { nodeId: string; deviceKind: string }; readonly state: GameState }) => {
            if (query.args.deviceKind !== "server") {
              return { reason: `rack profile forbids device kind "${query.args.deviceKind}"` };
            }
            if (query.state.nodes.size >= 3) {
              return { reason: "rack holds 3 devices — the micro-board has no fourth slot" };
            }
            return null;
          },
        }),
      },
    );
  }

  /* ── player acts (every one queues a door intent — nothing mutates) ──── */

  /** THE commit: hash in, PolicyCardCommit verb out (1 hand + 1 focus hand). */
  commitCard(ruleId: string): void {
    const id = asRuleId(ruleId);
    const hash = g7CardHash(id); // throws on unknown id — host-side fail-loud
    this.queue(
      { verb: PlayerVerb.PolicyCardCommit, cardHash: hash },
      `commit ${String(id)}`,
    );
  }

  /** §7.14 Kill Switch channel: suppression is a HOST dial (TickInputs),
   *  not a door verb — it leaves no adjudication rows at all. */
  suspendRule(ruleId: string): void {
    this.assertCard(ruleId);
    this.suppressed.add(ruleId);
  }

  resumeRule(ruleId: string): void {
    this.assertCard(ruleId);
    this.suppressed.delete(ruleId);
  }

  isSuspended(ruleId: string): boolean {
    return this.suppressed.has(ruleId);
  }

  /** The Dry-Run Toggle. Firings stay visible; ZERO intents mint (pinned by
   *  gate-g7 §4: a shadow run digests identically to a frozen control). */
  setShadow(on: boolean): void {
    this.shadowRef.shadow = on;
  }

  get shadow(): boolean {
    return this.shadowRef.shadow;
  }

  /** §7.12's only hand-creation event: a bounded loan mints the focus hand.
   *  Applied between ticks as a host state replacement (the door never sees
   *  it — this is the attentionWindowEntry pattern simCoreRunner ships). */
  openAttentionWindow(kind: AttentionLoanKind = "grace"): G7WindowResult {
    const prior: AttentionState | undefined = this.game.attention;
    if (prior === undefined) throw new Error("g7[no-attention]: the world minted no attention pool");
    const minute = Number(this.game.context.clocks.businessUs / MIN);
    const result = attentionWindowEntry(prior, kind, minute);
    this.game = Object.freeze({ ...this.game, attention: result.state });
    return Object.freeze({ opened: result.opened, refusal: result.refusal ?? null });
  }

  placeDevice(): void {
    this.queue(
      { verb: PlayerVerb.PlaceDevice, nodeId: G7_DB, deviceKind: "server", template: null },
      "place db box",
    );
  }

  connectData(from: EntityId, to: EntityId): void {
    this.queue(
      { verb: PlayerVerb.ConnectPorts, relation: "data", from, to, slot: null },
      `cable ${from}→${to}`,
    );
  }

  pullCable(edgeId: EntityId): void {
    this.queue({ verb: PlayerVerb.DisconnectDrain, edgeId }, `pull ${edgeId}`);
  }

  /** A founder note — the SAME verb the Book's `page` carrier rides; the
   *  difference the panel can SEE: the human pays a focus hand, the Book
   *  does not (D4 exemption). */
  postNote(note: string = "founder posts"): void {
    this.queue({ verb: PlayerVerb.Communicate, target: null, note }, "post note");
  }

  /* ── the tick (the gate-g7.test.ts host loop, mirrored) ─────────────── */

  step(): G7Snapshot {
    const nextTick = this.game.context.tick + 1n;
    const due: ExternalIntent[] = this.pendingPlayer.splice(0, this.pendingPlayer.length);
    for (const intent of this.pendingRules) {
      due.push(Object.freeze({ tick: nextTick, intent }));
    }
    this.pendingRules = [];
    const result = this.driver.advance(
      this.game,
      Object.freeze({
        envelopes: ENVELOPES,
        evidence: Object.freeze([]),
        classes: Object.freeze([]),
        dependencyEdges: Object.freeze([]),
        retryPolicy: Object.freeze({ maxRetries: 2, backoffBaseUs: 2n * MIN, jitterPurchased: false }),
        aggression: fromInt(0),
        expressMaxConfidence: fromInt(1),
        suppressedRuleIds: Object.freeze([...this.suppressed].sort() as RuleId[]),
        externalIntents: Object.freeze(due),
      }),
    );
    this.game = result.state;
    this.lastEvents = result.events;
    for (const intent of result.intents) {
      this.seqToOrigin.set(intent.seq, "rule");
      if (intent.origin === "rule" && intent.ruleId !== undefined) this.seqToRule.set(intent.seq, intent.ruleId);
    }
    this.pendingRules = result.intents;
    for (const firing of result.ruleFirings) this.firings.push(firingView(firing));
    for (const receipt of result.doorReceipts) this.receipts.push(receiptView(receipt, this.originOf(receipt.seq)));
    return this.snapshot();
  }

  /** Last advance's frozen event stream (read accessor; the tape text is
   *  derived from receipts/firings — the events stay replay-grade). */
  events(): readonly SimEvent[] {
    return this.lastEvents;
  }

  private lastEvents: readonly SimEvent[] = Object.freeze([]);

  /* ── reads ───────────────────────────────────────────────────────────── */

  snapshot(): G7Snapshot {
    const tick = this.game.context.tick;
    const hands: readonly G7HandView[] = Object.freeze(
      (this.game.hands?.tokens ?? []).map((token) => {
        const busy = token.busyCauseId !== null && token.busyUntilTick > tick;
        const seq = busy && token.busyCauseId !== null ? parseIntentSeq(token.busyCauseId) : null;
        return Object.freeze({
          index: token.index,
          busyUntilTick: token.busyUntilTick.toString(),
          busyCauseId: token.busyCauseId,
          origin: busy && seq !== null ? this.originOf(seq) : null,
        });
      }),
    );
    const attention = this.game.attention;
    const attentionView: G7AttentionView = attention === undefined
      ? Object.freeze({ capacity: 0, debt: 0, window: 0, freePips: 0, busyPips: 0 })
      : Object.freeze({
          capacity: attention.capacity,
          debt: attention.debt,
          window: attention.window,
          freePips: attention.tokens.filter((t) => !(t.busyCauseId !== null && t.busyUntilTick > tick)).length,
          busyPips: attention.tokens.filter((t) => t.busyCauseId !== null && t.busyUntilTick > tick).length,
        });
    const nodes: readonly G7NodeView[] = Object.freeze(
      [...this.game.nodes.values()].map((n) =>
        Object.freeze({
          id: n.id,
          kind: n.kind,
          serviceTimeUs: n.serviceTimeUs,
          rho: n.utilizationRho,
          queueDepth: n.queueDepth,
          inspectionDepth: n.inspectionDepth,
        }),
      ),
    );
    const edges: readonly G7EdgeView[] = Object.freeze(
      [...(this.game.board?.edges.values() ?? [])].map((e) =>
        Object.freeze({ id: e.id, relation: e.relation, from: e.from, to: e.to }),
      ),
    );
    const committed = new Set(this.game.ruleBook.map((c) => String(c.id)));
    const book: readonly G7CardView[] = Object.freeze(
      G7_CARDS.map((c) => {
        const id = String(c.id);
        const firingsFor = this.firings.filter((f) => f.rule === id);
        const related = this.receipts.filter((r) => this.receiptBelongsTo(r, id, c.then[0]?.id ?? ""));
        const lastRefusal = [...related].reverse().find((r) => r.outcome === "refused") ?? null;
        return Object.freeze({
          id,
          blurb: G7_CARD_BLURB[id] ?? "",
          band: c.band,
          scopeRef: String(c.scope.ref ?? ""),
          actionIds: Object.freeze(c.then.map((a) => a.id)) as readonly string[],
          hash8: g7CardHash(c.id).slice(0, 8),
          committed: committed.has(id),
          suspended: this.suppressed.has(id),
          firings: firingsFor.filter((f) => f.mode === "live").length,
          shadowFirings: firingsFor.filter((f) => f.mode === "shadow").length,
          executions: related.filter((r) => r.outcome === "executed").length,
          refusals: related.filter((r) => r.outcome === "refused").length,
          lastRefusalReason: lastRefusal?.reason ?? null,
          advisory: c.band !== "execute",
        });
      }),
    );
    return Object.freeze({
      tick: tick.toString(),
      hands,
      attention: attentionView,
      nodes,
      edges,
      book,
      receipts: Object.freeze([...this.receipts]),
      firings: Object.freeze([...this.firings]),
      tape: this.tape(),
      cashFree: this.game.cash.free,
      ruleBookHash: this.game.ruleBookHash,
      shadow: this.shadowRef.shadow,
      digest: digestState(this.game),
    });
  }

  /** The interleaved tape: firings (why) beneath receipts (what the board
   *  did) at each tick — one stream, both boards. */
  private tape(): readonly G7TapeEntry[] {
    const entries: G7TapeEntry[] = [];
    for (const f of this.firings) {
      entries.push(
        Object.freeze({
          kind: "firing" as const,
          tick: f.tick,
          origin: "rule" as const,
          text: `the Book fires ${f.rule} [${f.band}${f.mode === "shadow" ? " · shadow" : ""}] → ${f.actions.join(",")}`,
          order: Number(BigInt(f.tick) * 4n),
        }),
      );
    }
    for (const r of this.receipts) {
      const mark = r.outcome === "executed" ? "✓" : "✗";
      const tail = r.outcome === "executed" ? (r.detail ?? "") : (r.reason ?? "");
      entries.push(
        Object.freeze({
          kind: "receipt" as const,
          tick: r.tick,
          origin: r.origin,
          text: `${mark} t${r.tick} #${r.seq} ${r.verb}${tail === "" ? "" : ` — ${tail}`}`,
          order: Number(BigInt(r.tick) * 4n) + 1 + (r.origin === "rule" ? 0 : 2),
        }),
      );
    }
    entries.sort((a, b) => a.order - b.order || (a.tick < b.tick ? -1 : 1));
    return Object.freeze(entries);
  }

  /** Golden of the receipt stream (g4's receiptsDigest precedent). */
  receiptsDigest(): string {
    return canonicalDigest(
      this.receipts.map((r) => ({
        tick: r.tick,
        seq: r.seq,
        verb: r.verb,
        outcome: r.outcome,
        reason: r.reason,
      })),
    );
  }

  /** Golden of the Book's motion. */
  firingsDigest(): string {
    return canonicalDigest(
      this.firings.map((f) => ({ tick: f.tick, rule: f.rule, mode: f.mode, band: f.band, cause: f.causeId })),
    );
  }

  terminalDigest(): string {
    return digestState(this.game);
  }

  stateView(): GameState {
    return this.game;
  }

  /* ── internals ───────────────────────────────────────────────────────── */

  private assertCard(ruleId: string): void {
    if (!G7_CARDS.some((c) => String(c.id) === ruleId)) {
      throw new Error(`g7[no-such-card]: "${ruleId}" is not on the shelf`);
    }
  }

  private originOf(seq: number): HandOrigin {
    return this.seqToOrigin.get(seq) ?? (seq < PLAYER_SEQ_FLOOR ? "rule" : "player");
  }

  /** A receipt belongs to a card when the door label matches the card's
   *  carrier translation (`<action>→<verb>`) or its wall refusal (`verb:<action>`),
   *  AND the receipt seq is one the Book stamped for that rule. Advisory
   *  cards never appear: dispatchBand mints no intents for them. */
  private receiptBelongsTo(receipt: G7ReceiptView, cardId: string, actionId: string): boolean {
    const ruleId = this.seqToRule.get(receipt.seq);
    if (ruleId === undefined || String(ruleId) !== cardId) return false;
    return receipt.verb === `verb:${actionId}` || receipt.verb.startsWith(`${actionId}→`);
  }

  private queue(args: PlayerVerbArgs, clientLabel: string): void {
    const nextTick = this.game.context.tick + 1n;
    this.doorSeq += 1;
    this.seqToOrigin.set(this.doorSeq, "player");
    // The client label rides a PARALLEL map (g4 law): the sim payload must
    // not be able to tell gestures or narrators apart.
    this.clientLabels.set(this.doorSeq, `${clientLabel} @${String(nextTick)}`);
    this.pendingPlayer.push(
      Object.freeze({
        tick: nextTick,
        intent: Object.freeze({
          seq: this.doorSeq,
          clock: "sim" as const,
          atUs: nextTick * MIN,
          origin: "player" as const,
          payload: Object.freeze({ kind: "player-verb" as const, args }),
        }),
      }),
    );
  }

  private readonly clientLabels = new Map<number, string>();

  clientLabelFor(seq: number): string | null {
    return this.clientLabels.get(seq) ?? null;
  }
}

function fromRunSeed(seed: number): RunSeed {
  // Local mint keeps the branded type honest without importing the cast
  // helper's error path into a hot panel (same bigint, same law).
  return BigInt(seed) as RunSeed;
}

function parseIntentSeq(causeId: string): number | null {
  const match = /^intent:(\d+)$/.exec(causeId);
  return match === null || match[1] === undefined ? null : Number(match[1]);
}

function receiptView(receipt: IntentReceipt, origin: HandOrigin): G7ReceiptView {
  return Object.freeze({
    tick: receipt.submittedTick.toString(),
    seq: receipt.seq,
    verb: receipt.verb,
    outcome: receipt.outcome,
    reason: receipt.reason,
    detail: receipt.detail ?? null,
    origin,
  });
}

function firingView(firing: RuleFiring): G7FiringView {
  return Object.freeze({
    tick: firing.tick.toString(),
    rule: String(firing.ruleId),
    mode: firing.mode,
    band: firing.band,
    actions: Object.freeze(firing.actions.map((a) => a.id)),
    causeId: String(firing.causeId),
  });
}
