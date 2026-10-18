/**
 * ADR-0019 program 5 — mainline rule automation (L-G7M).
 *
 * The gate-g7 host-loop mechanics (step-12.5 rule phase, `ruleCarriers:
 * "mapped"` door translation, per-tick intent re-feed, M4 seq floor) are now
 * adopted by the MAINLINE SimCoreRunner behind one opt-in: `rules:
 * {lookupPolicyCard}`. This file pins both sides of that seam:
 *
 *  OFF-PATH (the byte-identity law, the load-bearing half):
 *   - an ARMED runner with nothing committed replays the shipped 100-frame
 *     digests byte-for-byte — including the legacy boot goldens
 *     ca8863849cb3db32 / 780b1cbc61dff760 (seed 1) and the money goldens
 *     25_005_307_300n / 25_109_732_500n (seed 42). The rulePhase slot, the
 *     rule door keys, the seq re-stamp and the rule-fired detail are ALL
 *     invisible until a card actually fires — which never happens with an
 *     empty book.
 *   - the armed player path (re-stamped door copies) digests equal to the
 *     unarmed path: the seq band is not authority on the wire.
 *
 *  ON-PATH (the adoption is real) — seed 42, probe-pinned @ this lane:
 *   - commit through the door lands the card in GameState.ruleBook with the
 *     engine-folded ruleBookHash (receipt `policy-card-commit: rule=<id>`);
 *   - the edge saturating past the quarter-load wall fires three EXECUTE
 *     carriers at frame 7; their intents RE-FEED the next door pass (frame 8)
 *     and move the node config: `raise-inspection-depth→configure-node:
 *     depth=inspect` EXECUTES, `page→communicate` EXECUTES, and
 *     `shed-class→shed-load` LOSES the two-hand race — the Book pays the
 *     SAME rail as the player, low driver seqs first;
 *   - the bought-verb wall stays literal (`verb:failover` refused), the
 *     INFORM band fires with ZERO intents minted, and a player verb feeding
 *     into the same rail refuses `communicate: hands-exhausted` behind the
 *     rules — one pool, witnessed in one frame.
 *
 * Determinism: two fresh armed runners on one scripted run match per-frame
 * across 100 ticks; a seed change diverges. The deck is authored LOCALLY
 * (lane law: zero cross-import from gates/g7 — same §2.2 grammar, same
 * host-hash seam, own cards).
 */
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "@hh/sim-core/replay";
import { FIXED_ONE } from "@hh/sim-core/kernel";
import { validatePolicyCard } from "@hh/sim-core/policy";
import {
  asEntityId,
  asMoney,
  asRuleId,
  type EntityId,
  type PlayerIntent,
  type PlayerVerbArgs,
  type PolicyActionId,
  type PolicyCard,
} from "@hh/sim-core/types";
import { encodeProjection, type SimProjection } from "../shared/protocol";
import { SimCoreRunner } from "../runner/simCoreRunner";

const TICKS = 100;

/* ═══════════════════ the locally-authored deck (g7-shaped, g7-free) ═══════════════════
 * Scope refs are the MAINLINE board's fixed identities (simCoreRunner.ts
 * mints exactly "edge"/"waf"/"deep"/"origin"). Triggers ride the economy
 * step's own per-node observation: `utilizationRho` in raw Q16.16 Fixed
 * counts. The quarter-load wall (16_384 = 0.25 × 65536) is probe-derived
 * mainline truth: the congested front door alternates 0 / 32768 under the
 * shipped 6-per-minute pressure — 0.625 (g7's wall on g7's toy board) never
 * crosses here, so the deck says what THIS board means by busy. */

const EDGE = asEntityId("edge");
const ORIGIN = asEntityId("origin");

type CardPredicate = PolicyCard["when"][number];
function trigger(metric: string, amount: bigint): CardPredicate {
  return Object.freeze({
    metric,
    comparator: ">" as const,
    threshold: Object.freeze({ kind: "value" as const, amount, unit: "count" as const }),
  }) as CardPredicate;
}
const BUSY = trigger("utilizationRho", 16_384n);
const SWAMPED = trigger("utilizationRho", 49_152n);
/** The NEVER-fires thresholds: rho caps at FIXED_UNIT = 65_535, so `>` the
 *  unit boundary is law-true never — the control book commits byte-equal
 *  receipts and stays silent forever. */
const BUSY_DORMANT = trigger("utilizationRho", 65_536n);
const SWAMPED_DORMANT = trigger("utilizationRho", 65_536n);

function card(
  id: string,
  scopeRef: EntityId,
  actionId: PolicyActionId,
  value: bigint | null,
  band: PolicyCard["band"],
  when: CardPredicate,
): PolicyCard {
  return Object.freeze({
    id: asRuleId(id),
    scope: Object.freeze({ kind: "object" as const, ref: scopeRef }),
    when: Object.freeze([when]) as PolicyCard["when"],
    then: Object.freeze([Object.freeze({ id: actionId, runbookName: null, value })]) as PolicyCard["then"],
    band,
    upkeepMicroUsd: asMoney(0n),
  });
}

/** Stamping order is the race order at every crossing tick: depth first,
 *  ticket second, shed LOSES the two-hand rail (the g7 engine law, now
 *  witnessed mainline-side); failover is the unbought wall; the underwriter
 *  is INFORM-only — fires, mints zero intents. */
const DECK: readonly PolicyCard[] = Object.freeze([
  card("watch-the-door", EDGE, "raise-inspection-depth", 2n * FIXED_ONE, "execute", BUSY),
  card("page-the-founder", EDGE, "page", null, "execute", BUSY),
  card("shed-the-small", EDGE, "shed-class", null, "execute", BUSY),
  card("escape-hatch", ORIGIN, "failover", null, "execute", BUSY),
  card("the-underwriter", ORIGIN, "scale-out", 2n * FIXED_ONE, "inform", SWAMPED),
] as const);
for (const c of DECK) validatePolicyCard(c); // grammar-clean or the import dies

function cardSummary(c: PolicyCard): string {
  const when = c.when
    .map((p) => `${p.metric}${p.comparator}${p.threshold.kind === "value" ? p.threshold.amount : "—"}`)
    .join("&");
  const then = c.then
    .map((a) => `${a.id}:${a.value === null ? "—" : a.value.toString()}`)
    .join("&");
  return `l-g7m-card|${c.id}|${c.scope.kind}:${c.scope.ref ?? ""}|${c.band}|${when}|${then}`;
}

const HASH_BY_ID: ReadonlyMap<string, string> = new Map(
  DECK.map((c) => [String(c.id), canonicalDigest(cardSummary(c))] as const),
);
if (new Set(HASH_BY_ID.values()).size !== DECK.length) {
  throw new Error("rules deck: card hashes collided — the deck is not a set");
}

/** THE door config seam: hash → card; unknown → null (door keeps the word). */
function lookupPolicyCard(cardHash: string): PolicyCard | null {
  for (const c of DECK) if (canonicalDigest(cardSummary(c)) === cardHash) return c;
  return null;
}

/** The NEVER-fires control deck: same ids, same band, same carriers — only
 *  the threshold is unreachable (rho caps at FIXED_UNIT = 65_535, so `>`
 *  65_536 is law-true never). A commit receipt of this book is byte-equal to
 *  the live one on the wire; the ONLY divergence the two runs can ever show
 *  is the rule phase itself. */
const CONTROL_DECK: readonly PolicyCard[] = Object.freeze([
  card("watch-the-door", EDGE, "raise-inspection-depth", 2n * FIXED_ONE, "execute", BUSY_DORMANT),
  card("page-the-founder", EDGE, "page", null, "execute", BUSY_DORMANT),
  card("shed-the-small", EDGE, "shed-class", null, "execute", BUSY_DORMANT),
  card("escape-hatch", ORIGIN, "failover", null, "execute", BUSY_DORMANT),
  card("the-underwriter", ORIGIN, "scale-out", 2n * FIXED_ONE, "inform", SWAMPED_DORMANT),
] as const);
for (const c of CONTROL_DECK) validatePolicyCard(c);
const CONTROL_HASH_BY_ID: ReadonlyMap<string, string> = new Map(
  CONTROL_DECK.map((c) => [String(c.id), canonicalDigest(cardSummary(c))] as const),
);
function controlLookup(cardHash: string): PolicyCard | null {
  for (const c of CONTROL_DECK) if (canonicalDigest(cardSummary(c)) === cardHash) return c;
  return null;
}

/* ═══════════════════════════════ harness helpers ═══════════════════════════════ */

function verbIntent(seq: number, args: Readonly<Record<string, string | number | null>>): PlayerIntent {
  return {
    seq,
    clock: "sim",
    atUs: 0n,
    origin: "player",
    payload: { kind: "player-verb", args: args as unknown as PlayerVerbArgs },
  };
}

const commitIntent = (get: ReadonlyMap<string, string>, id: string, seq: number): PlayerIntent => {
  const cardHash = get.get(id);
  if (cardHash === undefined) throw new Error(`rules deck: no commit hash for "${id}"`);
  return verbIntent(seq, { verb: "policy-card-commit", cardHash });
};

function frameDigests(
  runner: SimCoreRunner,
  before?: (tick: number, runner: SimCoreRunner) => void,
): string[] {
  const digests: string[] = [];
  for (let i = 0; i < TICKS; i += 1) {
    before?.(i, runner);
    digests.push(canonicalDigest(encodeProjection(runner.headlessStep(10))));
  }
  runner.stop();
  return digests;
}

function runFrames(
  runner: SimCoreRunner,
  ticks: number,
  before?: (tick: number, runner: SimCoreRunner) => void,
): SimProjection[] {
  const frames: SimProjection[] = [];
  for (let i = 0; i < ticks; i += 1) {
    before?.(i, runner);
    frames.push(runner.headlessStep(10));
  }
  runner.stop();
  return frames;
}

const plainRunner = (seed: number): SimCoreRunner => new SimCoreRunner({ seed });
const armedRunner = (seed: number): SimCoreRunner =>
  new SimCoreRunner({ seed, rules: { lookupPolicyCard } });

const noticeDetails = (frame: SimProjection): string[] =>
  frame.notices
    .filter((n) => n.kind === "intent-executed" || n.kind === "intent-refused")
    .map((n) => n.detail ?? n.kind);
const firedIds = (frame: SimProjection): string[] =>
  frame.notices.filter((n) => n.kind === "rule-fired").map((n) => n.detail ?? "");

/** THE storm script (seed-42 probe-pinned frame law): commits ride f0/f1/f2
 *  (two hands per door pass — the M4-floor re-stamp keeps the order), the
 *  congested front door crosses the quarter-load wall at f7, its carriers
 *  re-feed and execute at f8, origin storms at f11 (wall + inform), and the
 *  f10 player submission races the f11 re-feed for the SAME two hands. */
function stormScript(tick: number, runner: SimCoreRunner): void {
  if (tick === 0) {
    runner.submit(commitIntent(HASH_BY_ID, "watch-the-door", 1));
    runner.submit(commitIntent(HASH_BY_ID, "page-the-founder", 2));
  }
  if (tick === 1) {
    runner.submit(commitIntent(HASH_BY_ID, "shed-the-small", 3));
    runner.submit(commitIntent(HASH_BY_ID, "escape-hatch", 4));
  }
  if (tick === 2) {
    runner.submit(commitIntent(HASH_BY_ID, "the-underwriter", 5));
  }
}

/* ══════════════════════════ OFF-PATH: the byte-identity law ══════════════════════════ */

describe("rules seam OFF-path (armed with an empty book = dead weight, byte-for-byte)", () => {
  it("armed 100-frame digests EQUAL the default runner's (seed 42)", () => {
    expect(frameDigests(armedRunner(42))).toEqual(frameDigests(plainRunner(42)));
  });

  it("the frozen legacy boot goldens stand armed (seed 1: ca8863849cb3db32 / 780b1cbc61dff760)", () => {
    const digests = frameDigests(armedRunner(1));
    expect(digests[0]).toBe("ca8863849cb3db32");
    expect(digests[99]).toBe("780b1cbc61dff760");
  });

  it("money goldens untouched by the arm (seed 42: 25_005_307_300n / 25_109_732_500n)", () => {
    const frames = runFrames(armedRunner(42), TICKS);
    expect(frames[0]?.freeCashMicroUsd).toBe(25_005_307_300n);
    expect(frames[TICKS - 1]?.freeCashMicroUsd).toBe(25_109_732_500n);
  });

  it("the M4 re-stamp is wire-invisible: armed player verbs digest equal to unarmed (seed 7)", () => {
    const script = (tick: number, runner: SimCoreRunner): void => {
      if (tick === 2) runner.submit(verbIntent(1, { verb: "communicate", note: "drill", target: null }));
      if (tick === 6)
        runner.submit(
          verbIntent(1, { verb: "configure-node", nodeId: "edge", inspectionDepth: "challenge", shedOrder: null }),
        );
    };
    expect(frameDigests(armedRunner(7), script)).toEqual(frameDigests(plainRunner(7), script));
  });

  it("unknown commit hash refuses at the door, never arms a lie", () => {
    const runner = armedRunner(5);
    runner.submit(verbIntent(1, { verb: "policy-card-commit", cardHash: "0".repeat(16) }));
    const projection = runner.headlessStep(10);
    expect(
      projection.notices.some((n) => n.kind === "intent-refused" && n.detail?.startsWith("policy-card-commit: unknown-card-hash")),
    ).toBe(true);
    expect(runner.lastTickFacts().game.ruleBook).toHaveLength(0);
    runner.stop();
  });
});

/* ══════════════════════════ ON-PATH: the adoption is real ══════════════════════════ */

describe("rules seam ON-path (commit → fire → re-feed → execute through the same hands)", () => {
  it("a committed card lands in GameState.ruleBook with the engine-folded hash", () => {
    const runner = armedRunner(42);
    runner.submit(commitIntent(HASH_BY_ID, "watch-the-door", 1));
    const projection = runner.headlessStep(10);
    expect(noticeDetails(projection)).toContain("policy-card-commit: rule=watch-the-door");
    const state = runner.lastTickFacts().game;
    expect(state.ruleBook).toHaveLength(1);
    expect(state.ruleBook[0]?.id).toBe(asRuleId("watch-the-door"));
    expect(state.ruleBookHash).not.toBe("");
    runner.stop();
  });

  it("the re-feed chain: firing frame K names the cards, K+1 executes the carriers and MOVES THE NODE CONFIG", () => {
    const runner = armedRunner(42);
    const frames = runFrames(runner, 40, stormScript);
    const fireFrame = frames.findIndex((f) => firedIds(f).includes("watch-the-door"));
    expect(fireFrame).toBe(7); // probe-pinned: the congested edge crosses 0.25 rho here on seed 42
    expect(firedIds(frames[fireFrame] as SimProjection)).toEqual([
      "watch-the-door",
      "page-the-founder",
      "shed-the-small",
    ]);
    const executed = noticeDetails(frames[fireFrame + 1] as SimProjection);
    expect(executed).toContain("raise-inspection-depth→configure-node: depth=inspect");
    expect(executed).toContain('page→communicate: node=edge:"the Book opened a ticket"');
    // One-tick reaction lag is the law (the recovery channel's posture):
    // nothing executed the carrier on the firing frame itself.
    expect(noticeDetails(frames[fireFrame] as SimProjection)).toEqual([]);
    // The value the card authored (2 × FIXED_ONE) climbed the door rung:
    expect(runner.lastTickFacts().game.nodes.get(EDGE)?.inspectionDepth).toBe("inspect");
  });

  it("ONE pool: the third carrier loses the two-hand race — the Book pays the same rail as the player", () => {
    const runner = armedRunner(42);
    const frames = runFrames(runner, 12, stormScript);
    expect(noticeDetails(frames[8] as SimProjection)).toContain(
      'shed-class→shed-load: hands-exhausted: need 1, free 0 of 2 — rule carrier "shed-class" pays the same hands as the player',
    );
    // The rule reservations ride the PLAYER token rail — driver-internal low
    // seqs, the M4 band proof that two denominations share one ledger:
    const causes = (runner.lastTickFacts().game.hands?.tokens ?? []).map((t) => t.busyCauseId);
    expect(causes).toContain("intent:4");
    runner.stop();
  });

  it("the player loses the same race: a verb feeding into the re-feed frame refuses hands-exhausted behind the rules", () => {
    const runner = armedRunner(42);
    const frames = runFrames(runner, 13, (tick, r) => {
      stormScript(tick, r);
      // Submitted after frame 10 completes (context.tick 11) → stamped for
      // tick 12 — the EXACT pass the second rule storm re-feeds. The rules'
      // driver seqs (4, 5) sort below the floor-stamped player copy (1006)
      // in one feed, take both hands, and the player refuses behind them:
      // one pool, two denominations, witnessed inside a single frame.
      if (tick === 11) r.submit(verbIntent(6, { verb: "communicate", note: "contender", target: null }));
    });
    const raced = noticeDetails(frames[11] as SimProjection);
    expect(raced.filter((d) => d.startsWith("raise-inspection-depth→configure-node")).length).toBe(1);
    expect(raced.filter((d) => d.startsWith("page→communicate: node=")).length).toBe(1);
    expect(raced).toContain("communicate: hands-exhausted: need 1, free 0 of 2");
    expect(raced.some((d) => d.startsWith("shed-class→shed-load: hands-exhausted"))).toBe(true);
    runner.stop();
  });

  it("the bought-verb wall stays literal (ticker-yes, board-no) and INFORM mints zero intents", () => {
    const runner = armedRunner(42);
    const frames = runFrames(runner, 20, stormScript);
    const all = frames.flatMap((f) => noticeDetails(f));
    // escape-hatch fires (origin rho crosses) — the next pass refuses the
    // unmapped carrier through the ORDINARY wall, receipt and all:
    expect(frames.flatMap(firedIds)).toContain("escape-hatch");
    expect(all).toContain(
      'verb:failover: unsupported-verb-carrier: the door executes only kind="player-verb" intents',
    );
    // The underwriter fires (inform) — the tape knows, the board sees nothing:
    expect(frames.flatMap(firedIds)).toContain("the-underwriter");
    expect(all.some((d) => d.startsWith("scale-out"))).toBe(false);
    runner.stop();
  });

  it("divergence is the rule phase ALONE: the never-fires control deck digests identical until the live run fires", () => {
    const liveRunner = armedRunner(42);
    const controlRunner = new SimCoreRunner({ seed: 42, rules: { lookupPolicyCard: controlLookup } });
    const live = runFrames(liveRunner, 40, stormScript);
    const control = runFrames(controlRunner, 40, (tick, r) => {
      if (tick === 0) {
        r.submit(commitIntent(CONTROL_HASH_BY_ID, "watch-the-door", 1));
        r.submit(commitIntent(CONTROL_HASH_BY_ID, "page-the-founder", 2));
      }
      if (tick === 1) {
        r.submit(commitIntent(CONTROL_HASH_BY_ID, "shed-the-small", 3));
        r.submit(commitIntent(CONTROL_HASH_BY_ID, "escape-hatch", 4));
      }
      if (tick === 2) {
        r.submit(commitIntent(CONTROL_HASH_BY_ID, "the-underwriter", 5));
      }
    });
    const digest = (frames: SimProjection[]): string[] => frames.map((f) => canonicalDigest(encodeProjection(f)));
    const liveD = digest(live);
    const controlD = digest(control);
    let first = 0;
    while (first < liveD.length && liveD[first] === controlD[first]) first += 1;
    // Both arms carry byte-equal commit receipts and the same rail motion
    // until the first firing frame — then only the LIVE one fires:
    expect(first).toBe(7);
    expect(firedIds(control[first] as SimProjection)).toEqual([]);
    // and the control NEVER climbs the config the live arm moved:
    expect(controlRunner.lastTickFacts().game.nodes.get(EDGE)?.inspectionDepth).toBe("sample-1-in-20");
    expect(liveRunner.lastTickFacts().game.nodes.get(EDGE)?.inspectionDepth).toBe("inspect");
  });

  it("determinism: two fresh armed runners, one 100-tick storm, per-frame byte-equal", () => {
    expect(frameDigests(armedRunner(42), stormScript)).toEqual(frameDigests(armedRunner(42), stormScript));
  });

  it("seed divergence control: the armed world is seed-sensitive, not constant", () => {
    expect(frameDigests(armedRunner(43), stormScript)[TICKS - 1]).not.toBe(
      frameDigests(armedRunner(42), stormScript)[TICKS - 1],
    );
  });

  it("rule-fired notices carry the card id as detail and NOTHING else on the wire shape", () => {
    const runner = armedRunner(42);
    const frames = runFrames(runner, 40, stormScript);
    const fired = frames.flatMap((f) => f.notices).filter((n) => n.kind === "rule-fired");
    expect(fired.length).toBeGreaterThan(0);
    for (const f of fired) {
      expect(typeof f.detail).toBe("string");
      expect(DECK.some((c) => String(c.id) === f.detail)).toBe(true);
      expect(f.laneId).toBeNull();
    }
    runner.stop();
  });
});
