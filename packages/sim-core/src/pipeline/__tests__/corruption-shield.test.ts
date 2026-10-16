/**
 * ADR-0014 #D2 — the SHIELD ↔ corruption pre-arm, end to end. The door verb
 * (intent-door-shield.test.ts) writes the book; THIS file pins the consume
 * path: step 9 (`createPatienceCheckStep` in defaults.ts) reads the OPTIONAL
 * `GameState.shield` via `nodeShielded` and, for a unit queued at a shielded
 * node, NEVER CASTS the exhaustion die — the mark never lands and the
 * terminal completes as a plain `served`.
 *
 * Falsification pairs on the SAME seed (the corruption.test.ts `chain`
 * witness board: congested 1-slot edge, `corr:probe` corrupts mode):
 *  - no shield ⇒ N > 0 corruptions (the historical witness);
 *  - shield planted at tick 0 (in-force `null` stamp) ⇒ ZERO corruptions,
 *    while the per-tick served/bounced rosters stay BYTE-EQUAL to the
 *    baseline (a vetoed mark changes nothing else — per-unit streams give
 *    the die-cast skip zero blast radius on any other dice);
 *  - a door-fed real `shield-node` intent at tick 1 ⇒ the same zero —
 *    pre-arm through the actual payment path, hands materialized;
 *  - an armed-but-FUTURE stamp (business minute 1_000_000, past the run's
 *    ~103 biz-min/tick fold) ⇒ corruption stream IDENTICAL to baseline —
 *    armed is not yet law (`activePriceOverride` discipline);
 *  - unshielded twin runs across fresh driver closures ⇒ digest-identical
 *    (the absent-book byte-identity switch).
 *
 * As-of law unit pins (`shieldBusinessMinuteOf`, `nodeShielded`) close the file.
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  PatienceMode,
  ShieldArgs,
  ShieldBook,
  ShieldEntry,
} from "../../types";
import { asEntityId, asRunSeed, PlayerVerb } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN, MICROS_PER_SEC, advanceClocks } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { shieldBusinessMinuteOf, nodeShielded } from "../corruption";
import { createShieldBook } from "../intent-door";
import { DEFAULT_CLASSES, freshClocks, NO_RETRY, envelope, node, testConfig, tickInputs } from "./helpers";

const IDS = { edge: asEntityId("edge"), origin: asEntityId("origin") } as const;

function shieldBook(
  entries: ReadonlyMap<EntityId, ShieldEntry>,
  version = 1,
): ShieldBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function seedEntry(shippedAtTick: bigint, effectiveAtBusinessMinute: number | null): ShieldEntry {
  return Object.freeze({ shippedAtTick, effectiveAtBusinessMinute });
}

/* ═══════════════════ the chain witness (corruption.test.ts board) ═══════════════════ */

type ChainFrame = {
  digest: string;
  corruptions: { unitId: EntityId; causeId: string }[];
  servedUnitIds: EntityId[];
  bouncedUnitIds: EntityId[];
};

function chain(
  opts: {
    patienceModeByType?: Readonly<Record<string, PatienceMode>>;
    ticks?: number;
    shield?: ShieldBook;
    doorArm?: { tick: number; effectiveAtBusinessMinute: number | null };
  } = {},
): { frames: ChainFrame[]; finalState: GameState } {
  const config = testConfig({
    runSeed: asRunSeed(31n),
    defaultPatienceUs: 3n * MIN,
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.edge, IDS.origin]),
    ...(opts.patienceModeByType !== undefined ? { patienceModeByType: opts.patienceModeByType } : {}),
  });
  const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
    purgeTargetedMinNodes: 0,
  });
  let state: GameState = Object.freeze({
    ...createInitialState({
      runSeed: config.runSeed,
      engineVersion: "shield-test",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "shield-test", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: Object.freeze([
        node(IDS.edge, { slots: 1, serviceUs: MIN }), // congested: queues, waits, patience
        node(IDS.origin, { slots: 8, serviceUs: MIN }),
      ]),
    }),
    // Host-style seed of the book (the door-fed variant below proves the REAL
    // payment path; this pin isolates the consume side from door side effects):
    ...(opts.shield !== undefined ? { shield: opts.shield } : {}),
  });
  const frames: ChainFrame[] = [];
  for (let t = 0; t < (opts.ticks ?? 30); t += 1) {
    const partial: Omit<Partial<TickInputs>, "externalIntents"> &
      Pick<TickInputs, "envelopes"> & {
        externalIntents?: readonly ExternalIntent[];
      } = {
      envelopes: Object.freeze([envelope("corr:probe", fromInt(6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    };
    if (opts.doorArm !== undefined && opts.doorArm.tick === t + 1) {
      const args: ShieldArgs = {
        verb: PlayerVerb.Shield,
        targetNodeId: IDS.edge,
        effectiveAtBusinessMinute: opts.doorArm.effectiveAtBusinessMinute,
      };
      const intent: ExternalIntent = Object.freeze({
        tick: BigInt(t + 1),
        intent: Object.freeze({
          seq: 1,
          clock: "sim" as const,
          atUs: BigInt(t + 1) * MIN,
          origin: "player" as const,
          payload: Object.freeze({ kind: "player-verb" as const, args }),
        }),
      });
      partial.externalIntents = Object.freeze([intent]);
    }
    const inputs: TickInputs = tickInputs(partial);
    const result = driver.advance(state, inputs);
    state = result.state;
    frames.push({
      digest: digestState(state),
      corruptions: (result.corruptions ?? []).map((c) => ({ unitId: c.unitId, causeId: String(c.causeId) })),
      servedUnitIds: result.outcomes.filter((o) => o.terminal === "served").map((o) => o.unitId),
      bouncedUnitIds: result.outcomes.filter((o) => o.terminal === "bounced").map((o) => o.unitId),
    });
  }
  return { frames, finalState: state };
}

const corrupts = { "corr:probe": "corrupts" as const };
const total = (frames: ChainFrame[]): number => frames.reduce((sum, f) => sum + f.corruptions.length, 0);

/* ═══════════════════════════ the falsification pairs ═══════════════════════════ */

describe("shield pre-arm — corruption falsification on one seed", () => {
  it("baseline armed board corrupts (the historical witness: N > 0)", () => {
    const { frames } = chain({ patienceModeByType: corrupts });
    expect(total(frames)).toBeGreaterThan(0);
  });

  it("shield planted at tick 0 ⇒ ZERO corruptions, rosters byte-equal to baseline", () => {
    const baseline = chain({ patienceModeByType: corrupts }).frames;
    const armed = chain({
      patienceModeByType: corrupts,
      shield: shieldBook(new Map([[IDS.edge, seedEntry(0n, null)]])),
    }).frames;
    expect(total(armed)).toBe(0);
    // the veto has ZERO blast radius: every served/bounced roster per tick is
    // the same units in the same order — only the corruption stream differs:
    expect(armed.map((f) => f.servedUnitIds)).toStrictEqual(baseline.map((f) => f.servedUnitIds));
    expect(armed.map((f) => f.bouncedUnitIds)).toStrictEqual(baseline.map((f) => f.bouncedUnitIds));
  });

  it("a door-fed shield-node intent at tick 1 pays real hands and still zeroes the channel", () => {
    const { frames, finalState } = chain({
      patienceModeByType: corrupts,
      doorArm: { tick: 1, effectiveAtBusinessMinute: null },
    });
    expect(total(frames)).toBe(0);
    expect(finalState.shield?.version).toBe(1);
    expect(finalState.shield?.entries.get(IDS.edge)).toEqual({
      shippedAtTick: 1n,
      effectiveAtBusinessMinute: null,
    });
    expect(finalState.hands).toBeDefined(); // the commit-class payment materialized
  });

  it("armed-but-future stamp (biz-min 1_000_000) ⇒ corruption stream IDENTICAL to baseline", () => {
    const baseline = chain({ patienceModeByType: corrupts }).frames;
    const future = chain({
      patienceModeByType: corrupts,
      shield: shieldBook(new Map([[IDS.edge, seedEntry(0n, 1_000_000)]])),
    }).frames;
    expect(future.map((f) => f.corruptions)).toStrictEqual(baseline.map((f) => f.corruptions));
    expect(total(future)).toBeGreaterThan(0);
    // non-vacuity of the as-of gate: the book IS in state (digest moved)
    // yet law had not arrived — presence without power:
    expect(future[29]?.digest).not.toBe(baseline[29]?.digest);
  });

  it("unshielded twins across fresh driver closures are digest-identical (absent-book switch)", () => {
    const a = chain({ patienceModeByType: corrupts }).frames.map((f) => f.digest);
    const b = chain({ patienceModeByType: corrupts }).frames.map((f) => f.digest);
    expect(a).toStrictEqual(b);
  });

  it("shielding a node the units never queue at (origin) changes nothing — node-keyed law", () => {
    const baseline = chain({ patienceModeByType: corrupts }).frames;
    const wrongNode = chain({
      patienceModeByType: corrupts,
      shield: shieldBook(new Map([[IDS.origin, seedEntry(0n, null)]])),
    }).frames;
    expect(wrongNode.map((f) => f.corruptions)).toStrictEqual(baseline.map((f) => f.corruptions));
  });
});

/* ═══════════════════════════ as-of law unit pins ═══════════════════════════ */

describe("nodeShielded / shieldBusinessMinuteOf — the as-of law in the small", () => {
  const book = shieldBook(new Map([[IDS.edge, seedEntry(5n, 100)]]));

  it("shieldBusinessMinuteOf floors the business clock fold and refuses unsafe minutes", () => {
    expect(shieldBusinessMinuteOf(freshClocks())).toBe(0);
    expect(shieldBusinessMinuteOf({ ...freshClocks(), businessUs: 120n * MIN })).toBe(120);
    expect(shieldBusinessMinuteOf({ ...freshClocks(), businessUs: MIN - 1n })).toBe(0);
    const huge = (BigInt(Number.MAX_SAFE_INTEGER) + 1n) * MIN;
    expect(() => shieldBusinessMinuteOf({ ...freshClocks(), businessUs: huge })).toThrow(RangeError);
  });

  it("a real tick step moves the business minute ~103 (the Dual-Clock scale witness)", () => {
    const stepped = advanceClocks(freshClocks(), {
      realElapsedUs: MICROS_PER_SEC,
      speed: 1,
      incident: false,
    });
    expect(shieldBusinessMinuteOf(stepped)).toBe(102); // 43200/7 s = 102.857 min, floored → stamp boundaries
  });

  it("nodeShielded: undefined book ⇒ false; absent entry ⇒ false; null ⇒ in force", () => {
    expect(nodeShielded(undefined, IDS.edge, 999)).toBe(false);
    expect(nodeShielded(createShieldBook(), IDS.edge, 0)).toBe(false);
    expect(nodeShielded(book, IDS.origin, 1_000_000)).toBe(false); // different node
    expect(nodeShielded(shieldBook(new Map([[IDS.edge, seedEntry(0n, null)]])), IDS.edge, 0)).toBe(true);
  });

  it("nodeShielded as-of: before the stamp NOT law, at/after the stamp law", () => {
    expect(nodeShielded(book, IDS.edge, 99)).toBe(false); // armed, not yet
    expect(nodeShielded(book, IDS.edge, 100)).toBe(true); // the stamp minute itself
    expect(nodeShielded(book, IDS.edge, 101)).toBe(true);
  });
});
