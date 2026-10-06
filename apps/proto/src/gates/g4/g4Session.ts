/**
 * gates/g4 · session — the cable-drag engine door for the panel.
 *
 * Every physical act in this gate is a REAL intent-door verb on the REAL
 * tick driver (same law g1Runner's toggle rides): place-device pays the
 * validator callback, connect-ports pays a hand for 3 ticks, disconnect is
 * the v0 plain pull. The panel never mutates state — it PREVIEWES with pure
 * math (terms card + live ladder), then commits through the door; refusals
 * come back as receipts and name their reason.
 *
 * Accessibility law (§9.13 #4, pinned headless in packages/sim-core):
 * drag-to-cable and click-to-cable mint the IDENTICAL intent — `preview`
 * returns pure args, and `commitCable` is the SINGLE mint point both entry
 * paths call. The origin label lives only in the client log, never in the
 * sim payload, because the sim must not be able to tell the two apart.
 */
import {
  asEntityId,
  asRunSeed,
  PlayerVerb,
  type BoardRelation,
  type EntityId,
  type ExternalIntent,
  type Fixed,
  type GameState,
  type PlayerVerbArgs,
  type RunSeed,
  type SimTick,
} from "@hh/sim-core/types";
import { FIXED_ZERO, fromRatio, initialClocks, streamFor } from "@hh/sim-core/kernel";
import {
  createBoardState,
  createDefaultSlots,
  createInitialState,
  createTickDriver,
  digestState,
  mintHandState,
  type TickDriver,
} from "@hh/sim-core/pipeline";
import { canonicalDigest } from "@hh/sim-core/replay";
import { canConnect } from "@hh/sim-core/topology";
import { latencyDeltaUs, type HopLoad, type LatencyDelta } from "./latencyDelta.ts";
import { buildTermsCard, type TermsCard } from "./termsCard.ts";
import type { PortSpec } from "./portShapes.ts";

export const G4_ENGINE_VERSION = "gate-g4";

/* ── device profiles: the HOST-side table the validator + ports read ───── */

export interface DeviceProfile {
  readonly kind: string;
  readonly ports: readonly PortSpec[];
  readonly serviceTimeUs: bigint;
  readonly rhoEstimate: Fixed;
  readonly downstreamTimeoutUs: bigint | null;
  readonly ratedMbps: number;
  readonly monthlyCostMicroUsd: bigint;
}

function port(
  nodeId: string,
  relation: BoardRelation,
  label: string,
  needs: readonly string[],
  provides: readonly string[],
  slot: string | null,
): PortSpec {
  return Object.freeze({ portId: `${nodeId}:${relation}:${label}`, nodeId, relation, label, needs, provides, slot });
}

/** Ports + demo economics for a device kind, at a concrete id. The switch
 *  is a layer-7 patch panel (provides http-in AND sql-in) so both a data
 *  cable and the grammar-mismatch refusal are reachable in one screen. */
export function profileFor(kind: string, nodeId: string): DeviceProfile {
  if (kind === "server") {
    return Object.freeze({
      kind,
      ports: Object.freeze([
        port(nodeId, "data", "eth0", ["http-out"], ["http-in"], null),
        port(nodeId, "data", "db-out", ["sql-out"], [], null),
        port(nodeId, "power", "psu1", [], [], "psu1"),
        port(nodeId, "power", "psu2", [], [], "psu2"),
        port(nodeId, "control", "console", ["ssh-out"], ["ssh-in"], null),
      ]),
      serviceTimeUs: 45_000n,
      rhoEstimate: fromRatio(2n, 10n),
      downstreamTimeoutUs: 250_000n,
      ratedMbps: 1_000,
      monthlyCostMicroUsd: 0n,
    });
  }
  if (kind === "switch") {
    return Object.freeze({
      kind,
      ports: Object.freeze([
        port(nodeId, "data", "panel-in", [], ["http-in"], null),
        port(nodeId, "data", "uplink-out", ["http-out"], [], null),
        port(nodeId, "power", "psu1", [], [], "psu1"),
        port(nodeId, "power", "psu2", [], [], "psu2"),
        port(nodeId, "trust", "token", ["tcp-out"], ["tcp-in"], null),
      ]),
      serviceTimeUs: 20_000n,
      rhoEstimate: fromRatio(5n, 100n),
      downstreamTimeoutUs: 400_000n,
      ratedMbps: 10_000,
      monthlyCostMicroUsd: 4_000_000n, // $4/mo cross-rack patch
    });
  }
  throw new Error(`profileFor: unknown device kind "${kind}"`);
}

const ALLOWED_KINDS: ReadonlySet<string> = new Set(["server", "switch"]);
const MAX_DEVICES = 4;

/* ── views the panel renders ──────────────────────────────────────────── */

export interface EdgeView {
  readonly id: string;
  readonly relation: BoardRelation;
  readonly from: string;
  readonly to: string;
  readonly slot: string | null;
}

export interface NodeView {
  readonly id: string;
  readonly kind: string;
  readonly serviceTimeUs: bigint;
  readonly rho: Fixed;
  readonly ports: readonly PortSpec[];
}

export interface HandView {
  readonly index: number;
  readonly busyUntilTick: string;
  readonly busyCauseId: string | null;
}

export interface ReceiptView {
  readonly tick: string;
  readonly seq: number;
  readonly verb: string;
  readonly outcome: "executed" | "refused";
  readonly reason: string | null;
  readonly clientLabel: string | null;
}

export interface G4Snapshot {
  readonly tick: SimTick;
  readonly boardVersion: number;
  readonly edges: readonly EdgeView[];
  readonly nodes: readonly NodeView[];
  readonly hands: readonly HandView[];
  readonly receipts: readonly ReceiptView[];
  readonly digest: string;
}

export interface CablePreview {
  readonly card: TermsCard;
  readonly args: PlayerVerbArgs;
  readonly delta: LatencyDelta;
  readonly memoKey: string;
}

export type PreviewVerdict =
  | { readonly ok: true; readonly preview: CablePreview }
  | { readonly ok: false; readonly reason: string };

/* ── the session ──────────────────────────────────────────────────────── */

export class G4Session {
  private readonly runSeed: RunSeed;
  private readonly driver: TickDriver;
  private game: GameState;
  private doorSeq = 0;
  private readonly pending: ExternalIntent[] = [];
  private readonly clientLabels = new Map<number, string>();
  private readonly receipts: ReceiptView[] = [];
  /** Shift-memo: same action, same consequence ⇒ no prompt (§9.13 #4). */
  private readonly memoSkips = new Set<string>();

  constructor(seed: number = 904) {
    if (!Number.isInteger(seed) || seed < 0) {
      throw new Error(`G4Session: seed must be a non-negative integer, got ${seed}`);
    }
    this.runSeed = asRunSeed(BigInt(seed));
    this.game = createInitialState({
      runSeed: this.runSeed,
      engineVersion: G4_ENGINE_VERSION,
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "gate-g4-sheets", ruleBookHash: "" },
      clocks: initialClocks(),
      hands: mintHandState(2),
      board: createBoardState(),
    });
    const slots = createDefaultSlots(
      Object.freeze({
        runSeed: this.runSeed,
        dnsNodeId: null,
        expressPath: Object.freeze(["web-1"] as EntityId[]),
        deepPath: Object.freeze([] as readonly EntityId[]),
        defaultPatienceUs: 3n * 60_000_000n,
        defaultSizeCost: fromRatio(1n, 1n),
        patienceJitterPct: 0,
        inspectionCostUs: Object.freeze({
          "pass-through": 0n,
          "sample-1-in-20": 3n * 60_000_000n,
          inspect: 10n * 60_000_000n,
          challenge: 20n * 60_000_000n,
        }),
        detectionRatio: fromRatio(1n, 1n),
        falsePositiveRatio: FIXED_ZERO,
        referralProbability: FIXED_ZERO,
        returnProbability: FIXED_ZERO,
      }),
    );
    this.driver = createTickDriver(slots, streamFor(this.runSeed, "root", 0), this.game.context.clocks, {
      intents: Object.freeze({
        handCapacity: 2,
        canPlaceDevice: (query: { readonly args: { nodeId: string; deviceKind: string; template: string | null }; readonly state: GameState }) => {
          if (!ALLOWED_KINDS.has(query.args.deviceKind)) {
            return { reason: `rack profile forbids device kind "${query.args.deviceKind}"` };
          }
          if (query.state.nodes.size >= MAX_DEVICES) {
            return { reason: `rack holds ${MAX_DEVICES} devices — retire one before adding` };
          }
          return null;
        },
      }),
    });
  }

  /* ── reads ─────────────────────────────────────────────────────────── */

  snapshot(): G4Snapshot {
    const edges: EdgeView[] = [];
    for (const edge of this.game.board?.edges.values() ?? []) {
      edges.push(
        Object.freeze({ id: edge.id, relation: edge.relation, from: edge.from, to: edge.to, slot: edge.slot }),
      );
    }
    edges.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const nodes: NodeView[] = [];
    for (const node of this.game.nodes.values()) {
      nodes.push(
        Object.freeze({
          id: node.id,
          kind: node.kind,
          serviceTimeUs: node.serviceTimeUs,
          rho: node.utilizationRho,
          ports: ALLOWED_KINDS.has(node.kind) ? profileFor(node.kind, node.id).ports : Object.freeze([]),
        }),
      );
    }
    nodes.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return Object.freeze({
      tick: this.game.context.tick,
      boardVersion: this.game.board?.version ?? 0,
      edges: Object.freeze(edges),
      nodes: Object.freeze(nodes),
      hands: Object.freeze(
        (this.game.hands?.tokens ?? []).map(
          (t): HandView =>
            Object.freeze({ index: t.index, busyUntilTick: t.busyUntilTick.toString(), busyCauseId: t.busyCauseId }),
        ),
      ),
      receipts: Object.freeze([...this.receipts]),
      digest: digestState(this.game),
    });
  }

  ports(): readonly PortSpec[] {
    return Object.freeze(this.snapshot().nodes.flatMap((n) => [...n.ports]));
  }

  /** Shift-memo: has this exact action-class been promised "no more cards"? */
  isMemoized(memoKey: string): boolean {
    return this.memoSkips.has(memoKey);
  }

  /* ── the three verbs of the gate ───────────────────────────────────── */

  /** Queues place-device for the next tick; the validator callback decides. */
  placeDevice(nodeId: string, deviceKind: string): void {
    this.queue(
      { verb: PlayerVerb.PlaceDevice, nodeId: asEntityId(nodeId), deviceKind, template: null },
      `place ${deviceKind} → ${nodeId}`,
    );
  }

  /**
   * Pure preflight — the whole reason drag and click are ONE path. Returns
   * the terms card, the ladder delta, and the exact ARGS the commit will
   * mint. Illegal pairs get a refusal verdict and mint NOTHING (host law:
   * an un-pluggable cable never becomes an intent, so it never costs a
   * hand — the door's own guards remain the last word for issued intents).
   */
  previewCable(sourcePortId: string, destPortId: string): PreviewVerdict {
    const ports = this.ports();
    const source = ports.find((p) => p.portId === sourcePortId);
    const dest = ports.find((p) => p.portId === destPortId);
    if (source === undefined || dest === undefined) {
      return { ok: false, reason: "unknown port — the device was retired mid-drag" };
    }
    if (source.nodeId === dest.nodeId) {
      return { ok: false, reason: "self-edge: a device cannot cable itself" };
    }
    if (source.relation !== dest.relation) {
      return {
        ok: false,
        reason: `shape mismatch — ${source.relation} plug will not seat in ${dest.relation} socket`,
      };
    }
    const srcProfile = this.profileOf(source.nodeId);
    const dstProfile = this.profileOf(dest.nodeId);
    if (srcProfile === null || dstProfile === null) {
      return { ok: false, reason: "device profile missing — host table bug" };
    }
    const slot = source.relation === "power" ? (source.slot ?? dest.slot) : null;
    if (source.relation === "power" && slot === null) {
      return { ok: false, reason: "power cable needs a socket name" };
    }
    const edgeId = powerEdgeId(source.relation, source.nodeId, dest.nodeId, slot);
    if (this.game.board?.edges.has(asEntityId(edgeId))) {
      return { ok: false, reason: `cable already seated: ${edgeId}` };
    }
    if (source.relation !== "power" && !canConnect(source, dest)) {
      return {
        ok: false,
        reason: `no socket fit — ${source.label} speaks ${source.needs.join("/") || "nothing"} into silence`,
      };
    }
    const delta = latencyDeltaUs(this.servedPath(source.nodeId), this.servedPath(source.nodeId, dest.nodeId));
    const card = buildTermsCard({
      relation: source.relation,
      edgeId,
      fromLabel: `${source.nodeId} · ${source.label}`,
      toLabel: `${dest.nodeId} · ${dest.label}`,
      latency: delta,
      ratedMbps: Math.min(srcProfile.ratedMbps, dstProfile.ratedMbps),
      monthlyCostMicroUsd: dstProfile.monthlyCostMicroUsd,
      downstreamTimeoutUs: dstProfile.downstreamTimeoutUs,
      upstreamTimeoutUs: srcProfile.downstreamTimeoutUs,
    });
    return Object.freeze({
      ok: true,
      preview: Object.freeze({
        card,
        args: Object.freeze({
          verb: PlayerVerb.ConnectPorts,
          relation: source.relation,
          from: asEntityId(source.nodeId),
          to: asEntityId(dest.nodeId),
          slot,
        }),
        delta,
        memoKey: memoKey(srcProfile.kind, dstProfile.kind, source.relation),
      }),
    });
  }

  /** THE single mint point. `origin` decorates only the client label —
   *  the sim-side payload is identical for drag and click (accessibility
   *  law, pinned by gate-g4.test.ts). */
  commitCable(
    preview: CablePreview,
    origin: "drag" | "click",
    opts: { readonly remember?: boolean } = {},
  ): void {
    if (opts.remember === true) this.memoSkips.add(preview.memoKey);
    this.queue(preview.args, `cable (${origin}) ${preview.card.edgeId}`);
  }

  /** v0 plain pull (drain choreography is a reported seam, not here). */
  pullCable(edgeId: string): void {
    this.queue({ verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId(edgeId) }, `pull ${edgeId}`);
  }

  /* ── the tick ──────────────────────────────────────────────────────── */

  step(): G4Snapshot {
    const due = this.pending.splice(0, this.pending.length);
    const result = this.driver.advance(this.game, Object.freeze({
      envelopes: Object.freeze([]),
      evidence: Object.freeze([]),
      classes: Object.freeze([]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: Object.freeze({ maxRetries: 2, backoffBaseUs: 2n * 60_000_000n, jitterPurchased: false }),
      aggression: FIXED_ZERO,
      expressMaxConfidence: fromRatio(1n, 1n),
      externalIntents: Object.freeze(due),
    }));
    this.game = result.state;
    for (const receipt of result.doorReceipts) {
      this.receipts.push(
        Object.freeze({
          tick: receipt.submittedTick.toString(),
          seq: receipt.seq,
          verb: receipt.verb,
          outcome: receipt.outcome,
          reason: receipt.reason,
          clientLabel: this.clientLabels.get(receipt.seq) ?? null,
        }),
      );
    }
    return this.snapshot();
  }

  /** Golden of the whole receipt sequence — the panel's determinism proof. */
  receiptsDigest(): string {
    return canonicalDigest(
      this.receipts.map((r) => ({ tick: r.tick, seq: r.seq, verb: r.verb, outcome: r.outcome, reason: r.reason })),
    );
  }

  /* ── internals ─────────────────────────────────────────────────────── */

  private queue(args: PlayerVerbArgs, clientLabel: string): void {
    const nextTick = this.game.context.tick + 1n;
    this.doorSeq += 1;
    this.clientLabels.set(this.doorSeq, `${clientLabel} @${String(nextTick)}`);
    this.pending.push(
      Object.freeze({
        tick: nextTick,
        intent: Object.freeze({
          seq: this.doorSeq,
          clock: "sim" as const,
          atUs: nextTick * 60_000_000n,
          origin: "player" as const,
          payload: Object.freeze({ kind: "player-verb" as const, args }),
        }),
      }),
    );
  }

  private serviceOf(nodeId: string): bigint {
    return this.game.nodes.get(asEntityId(nodeId))?.serviceTimeUs ?? 60_000_000n;
  }

  /** Real sim load when it exists, profile estimate at boot (§4.2: the
   *  ladder prices the truth it can see and labels the rest as estimate). */
  private rhoOf(nodeId: string): Fixed {
    const node = this.game.nodes.get(asEntityId(nodeId));
    if (node === undefined) return FIXED_ZERO;
    if (node.utilizationRho > 0n) return node.utilizationRho;
    return this.profileOf(nodeId)?.rhoEstimate ?? FIXED_ZERO;
  }

  private profileOf(nodeId: string): DeviceProfile | null {
    const node = this.game.nodes.get(asEntityId(nodeId));
    if (node === undefined || !ALLOWED_KINDS.has(node.kind)) return null;
    return profileFor(node.kind, node.id);
  }

  /** The traffic path `nodeId` serves today: itself, plus — when a data
   *  cable is in play — the provider hop it would add. */
  private servedPath(
    nodeId: string,
    addedProvider?: string,
  ): readonly HopLoad[] {
    const hops: HopLoad[] = [];
    if (this.game.nodes.has(asEntityId(nodeId))) {
      hops.push(
        Object.freeze({ label: `${nodeId} service`, serviceTimeUs: this.serviceOf(nodeId), rho: this.rhoOf(nodeId) }),
      );
    }
    if (addedProvider !== undefined && this.game.nodes.has(asEntityId(addedProvider))) {
      hops.push(
        Object.freeze({ label: `cable to ${addedProvider}`, serviceTimeUs: 0n, rho: FIXED_ZERO }),
        Object.freeze({
          label: `${addedProvider} service`,
          serviceTimeUs: this.serviceOf(addedProvider),
          rho: this.rhoOf(addedProvider),
        }),
      );
    }
    return Object.freeze(hops);
  }
}

/** Mirror of the door's `defaultEdgeId` — the ONLY legal way to predict it. */
export function powerEdgeId(relation: BoardRelation, from: string, to: string, slot: string | null): string {
  const base = `edge:${relation}:${from}->${to}`;
  return relation === "power" && slot !== null ? `${base}:${slot}` : base;
}

function memoKey(sourceKind: string, destKind: string, relation: BoardRelation): string {
  return `${sourceKind}-${relation}->${destKind}`;
}
