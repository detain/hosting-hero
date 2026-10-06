/**
 * G2 session — the panel's view-model. All state is the APPEND-ONLY build
 * log + a tick + a mastery counter map (the ledger's own data model), and
 * every view is a pure fold of it via `waves/ledger` primitives. No hidden
 * mutation, no timers, no RNG: the UI can re-render at any tick and the
 * answer is byte-stable (§3.3 replay law applies to panels too).
 */
import type { BuildOp, LedgerConfig, LedgerSnapshot, TelegraphBand, ThreatInvitations } from "@hh/sim-core/waves";
import { DEFAULT_LEDGER_CONFIG, bandAfterMastery, buildInvitations, isThreatSpawnable, ledgerSnapshot } from "@hh/sim-core/waves";
import type { ThreatFamily } from "@hh/sim-core/types";
import type { G2Bundle, ThreatId } from "./corpus.ts";
import { G2_BUNDLES, THREAT_CATALOG } from "./corpus.ts";
import type { InvitationPreview } from "./deriveInvitations.ts";
import { activeInvitersOf, deriveThreatInvitations } from "./deriveInvitations.ts";

export interface PoolRow {
  readonly threatId: ThreatId;
  readonly label: string;
  readonly family: ThreatFamily;
  readonly authoredBand: TelegraphBand;
  readonly effectiveBand: TelegraphBand;
  readonly mastered: boolean;
  readonly counters: number;
  /** Existing builds keeping it alive; empty ⇒ authored-ungated (organic-safe). */
  readonly inviters: readonly string[];
  readonly haunting: boolean;
}

export interface HauntingRow {
  readonly buildableId: string;
  readonly label: string;
  readonly removedAtTick: number;
  readonly memoArrivesAtTick: number;
  readonly ticksLeft: number;
}

export interface LogRow {
  readonly seq: number;
  readonly atTick: number;
  readonly op: "build" | "remove";
  readonly buildableId: string;
  readonly label: string;
}

export interface G2View {
  readonly tick: number;
  readonly bundleId: string;
  readonly pool: readonly PoolRow[];
  readonly poolByFamily: readonly { readonly family: ThreatFamily; readonly rows: readonly PoolRow[] }[];
  readonly haunting: readonly HauntingRow[];
  readonly log: readonly LogRow[];
  readonly spawnableCount: number;
  readonly universeCount: number;
  readonly previews: Readonly<Record<string, InvitationPreview>>;
}

const FAMILY_ORDER: readonly ThreatFamily[] = ["malicious", "human", "systemic", "entropic", "customerAsThreat"];

function labelOf(bundle: G2Bundle, buildableId: string): string {
  return bundle.components.find((c) => c.id === buildableId)?.label ?? buildableId;
}

/**
 * A session is created per bundle; switching era/type means a fresh session
 * (honest: the build log belongs to one estate).
 */
export function createG2Session(bundleId: keyof typeof G2_BUNDLES, cfg: LedgerConfig = DEFAULT_LEDGER_CONFIG) {
  const bundle: G2Bundle = G2_BUNDLES[bundleId];
  const invitations: ThreatInvitations = buildInvitations(
    Object.fromEntries(bundle.components.map((c) => [c.id, c.invites])),
  );
  const ops: BuildOp[] = [];
  const counters = new Map<ThreatId, number>();
  let tick = 0;

  function snapshot(): LedgerSnapshot {
    return ledgerSnapshot(ops, BigInt(tick), cfg);
  }

  /** Fold-only view: pool, haunting ghosts, construction log, purchase previews. */
  function view(): G2View {
    const snap = snapshot();
    // The deck the player faces = the bundle's authored universe filtered by
    // the ledger (ungated threats are always spawnable — the world throws
    // them regardless of what you build).
    const poolIds = bundle.universe.filter((t) => isThreatSpawnable(t, snap, invitations));
    const livePool = new Set(poolIds);
    // A buildable "haunts" when its last op is a removal the lag hasn't
    // buried yet — derived by diffing the FULL snapshot against one where
    // every haunted id is force-absent (the ledger's own semantics, reused).
    const lastOpByBuildable = new Map<string, BuildOp>();
    for (const op of ops) {
      const prior = lastOpByBuildable.get(op.buildableId);
      if (prior === undefined || prior.atTick <= op.atTick) lastOpByBuildable.set(op.buildableId, op);
    }
    const haunting: HauntingRow[] = [];
    for (const [buildableId, op] of [...lastOpByBuildable.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
      if (op.op !== "remove" || !snap.existingBuildables.has(buildableId)) continue;
      const memoArrivesAtTick = Number(op.atTick) + Number(cfg.retirementLagTicks);
      haunting.push({
        buildableId,
        label: labelOf(bundle, buildableId),
        removedAtTick: Number(op.atTick),
        memoArrivesAtTick,
        ticksLeft: memoArrivesAtTick - tick,
      });
    }
    const rows: PoolRow[] = [];
    for (const threatId of poolIds) {
      const fact = THREAT_CATALOG[threatId as ThreatId];
      if (fact === undefined) throw new Error(`g2Session: threat "${threatId}" absent from THREAT_CATALOG (corpus drift)`);
      const mastery = new Map(counters);
      const effectiveBand = bandAfterMastery(threatId, fact.band, mastery, cfg);
      rows.push({
        threatId: threatId as ThreatId,
        label: fact.label,
        family: fact.family,
        authoredBand: fact.band,
        effectiveBand,
        mastered: effectiveBand === "weather" && fact.band !== "weather",
        counters: counters.get(threatId as ThreatId) ?? 0,
        inviters: activeInvitersOf(threatId, snap, invitations),
        haunting: false,
      });
    }
    const poolByFamily = FAMILY_ORDER.map((family) => ({
      family,
      rows: rows.filter((r) => r.family === family),
    })).filter((group) => group.rows.length > 0);

    const previews: Record<string, InvitationPreview> = {};
    for (const component of bundle.components) {
      previews[component.id] = deriveThreatInvitations(component.id, snap, invitations);
    }

    // threats invited-but-withheld (unlocked pool preview, the bestiary's
    // "???" half): shown nowhere by default — universe delta for the header.
    const log: LogRow[] = ops.map((op, i) => ({
      seq: i,
      atTick: Number(op.atTick),
      op: op.op,
      buildableId: op.buildableId,
      label: labelOf(bundle, op.buildableId),
    }));

    return {
      tick,
      bundleId: bundle.id,
      pool: rows,
      poolByFamily,
      haunting,
      log,
      spawnableCount: livePool.size,
      universeCount: bundle.universe.length,
      previews,
    };
  }

  return {
    bundleId: bundle.id,
    view,
    build(componentTemplateId: string): void {
      const component = bundle.components.find((c) => c.id === componentTemplateId);
      if (component === undefined) throw new Error(`g2Session: "${componentTemplateId}" not in bundle ${bundle.id}`);
      if (snapshot().existingBuildables.has(componentTemplateId)) {
        throw new Error(`g2Session: "${componentTemplateId}" already exists at tick ${tick}`);
      }
      ops.push({ atTick: BigInt(tick), buildableId: componentTemplateId, op: "build" });
    },
    retire(componentTemplateId: string): void {
      if (!snapshot().existingBuildables.has(componentTemplateId)) {
        throw new Error(`g2Session: cannot retire "${componentTemplateId}" — it does not exist at tick ${tick}`);
      }
      const last = [...ops].reverse().find((o) => o.buildableId === componentTemplateId);
      if (last?.op === "remove") throw new Error(`g2Session: "${componentTemplateId}" retirement already pending`);
      ops.push({ atTick: BigInt(tick), buildableId: componentTemplateId, op: "remove" });
    },
    /** Mastery demo: one more successful counterance for a threat. */
    counter(threatId: ThreatId): void {
      counters.set(threatId, (counters.get(threatId) ?? 0) + 1);
    },
    tickForward(n: number): void {
      if (!Number.isSafeInteger(n) || n < 1) throw new Error(`g2Session: tickForward needs int ≥ 1, got ${n}`);
      tick += n;
    },
  };
}

export type G2Session = ReturnType<typeof createG2Session>;
