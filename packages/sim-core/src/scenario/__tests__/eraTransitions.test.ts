/**
 * eraTransitions.test.ts — L-ER-T (wave-26 owner ruling): the era pilot's
 * named future seam is BUILT. `eraYearAt` widens from the run-frozen
 * constant to a STEP FUNCTION over the sim business clock — pure floor
 * division (the shieldBusinessMinuteOf law at pipeline/corruption.ts:81,
 * scenario-local private twin), consulted PER-INTENT inside the door-config
 * closure. A tech introduced mid-run flips refused→allowed with NO state
 * change; a retired tech flips the other way.
 *
 * Laws pinned here:
 *  1. THE STEP LANDS ON THE BUSINESS CLOCK: minute exactly on a step reads
 *     the NEW year (inclusive), one minute before reads the old; the opening
 *     eraYear owns minute 0 (a step at 0 is refused by name). NO wall clock,
 *     NO GameState, NO digest input — determinism untouched (×100 pinned).
 *  2. THE PARSE WALLS ARE THE SAME AUTHORITY FOR BOTH HOSTS: the steps are
 *     boundary-parsed in composeEraPlan (runner + tools/host both call it);
 *     unsorted / duplicate / negative / zero-minute entries throw naming
 *     the position; eraTransition rides the eraYear+eraBundle pair.
 *  3. ABSENT ≡ EMPTY ≡ THE PILOT: zero steps ⇒ eraYearAt never reads the
 *     context and every frozen-era digest byte-stands. The byte-witness
 *     literals were captured PRE-EDIT at 0c2549e by a temporary probe file
 *     (same runs, same seed 904n) — disclosed method; the eraless-vs-armed
 *     equality arms stay self-re-deriving.
 *  4. THE REPORT ECHO IS SPARSE WITHIN SPARSE: the `era` key keeps the
 *     OPENING eraYear + bundleId verbatim and grows `transitions` ONLY for
 *     a non-empty calendar — frozen-era reports (all shipped) unchanged.
 *  5. STEPS DO NOT MOVE THE OTHER LAYERS: a perspective ban still holds (and
 *     still delegates non-banned verbs) across the step; greyed policy cards
 *     stay OPENING-year frozen (the door's lookup seam carries no context —
 *     the documented seam limitation, never silently per-year).
 *
 * Retirement legs ride FORGED fixtures only (R66 — zero shipped `to` rows);
 * the LIVE retirement witness forges the §1.6 modem-bank row, same as the
 * pilot's frozen fixture.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { asRunSeed } from "../../types.ts";
import type { ExternalIntent, GameState, PolicyCard, TickContext } from "../../types.ts";
import { applyIntentDoor, createBoardState, createInitialState } from "../../pipeline/index.ts";
import { MICROS_PER_MIN, initialClocks } from "../../kernel/time.ts";
import { loadTypeBundle } from "../../loader/bundle.ts";
import type { LoadedTypeBundle } from "../../loader/bundle.ts";
import { runScenario, shippedScenario, SHIPPED_SCENARIO_WIRES } from "../index.ts";
import type { EraTransition } from "../index.ts";
import { parseScenarioDoc } from "../doc.ts";
import { applyPerspectiveToDoorConfig, PERSPECTIVE_V0 } from "../perspective.ts";
import { applyEraAvailabilityToDoorConfig, composeEraPlan } from "../eraAvailability.ts";
import type { EraPlan } from "../eraAvailability.ts";

// vitest roots at packages/sim-core (era-dating.test.ts law).
const CONTENT = join(process.cwd(), "..", "content");

function readTypeWire(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(CONTENT, "types", name + ".json"), "utf8")) as Record<string, unknown>;
}

const SHARED_WEB: LoadedTypeBundle = loadTypeBundle(readTypeWire("shared-web"));
const BASE_SEED = asRunSeed(904n);

/** §1.6 modem-bank FORGED bundle (R66: zero shipped `to` rows): the row
 *  retires at the exclusive `to` = 2008, exactly the pilot's frozen fixture. */
function forgedModemBundle(): LoadedTypeBundle {
  const raw = JSON.parse(JSON.stringify(readTypeWire("shared-web"))) as Record<string, unknown>;
  (raw.eras as Record<string, unknown>).availability = { "modem-bank-pilot": { from: "1994", to: "2008" } };
  return loadTypeBundle(raw);
}

/* ─────────────────────────── door-level scaffolding ─────────────────────────── */

/** A door TickContext at a chosen BUSINESS minute: the step function reads
 *  ONLY clocks.businessUs, so the forged clock is a faithful query context
 *  for the as-of law (the runner-level tests below prove the real clock
 *  chain lands where the floor law says). */
function ctxAtBusinessMinute(tick: bigint, businessMinute: number, usOffset = 0n): TickContext {
  return Object.freeze({
    tick,
    minute: Number(tick),
    clocks: Object.freeze({ ...initialClocks(), businessUs: BigInt(businessMinute) * MICROS_PER_MIN + usOffset }),
  });
}

function forgedExt(tick: bigint, seq: number, args: Record<string, unknown>): unknown {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MICROS_PER_MIN,
      origin: "player" as const,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  });
}

function sweepState(): GameState {
  return createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "test-era-transitions",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [],
    handCapacity: 2,
    board: createBoardState(),
  });
}

function placeArgs(deviceKind: string, nodeId = "web-9"): Record<string, unknown> {
  return { verb: "place-device", nodeId, deviceKind, template: null };
}

function queryAt(verb: string, args: Record<string, unknown>, context: TickContext, carrier: string | null = null) {
  return { verb, args, carrier, state: {}, context } as never;
}

const STEP_AT_10000: readonly EraTransition[] = Object.freeze([
  Object.freeze({ atBusinessMinute: 10000, eraYear: 2026 }),
]);

/* ─────────────────── 1. the parse walls (position-naming, one authority) ─────────────────── */

describe("the eraTransition parse walls — fail loud, name the position", () => {
  const wireId = "the-not-invented-yet";
  const run = (eraTransition: readonly unknown[]) =>
    runScenario(shippedScenario(wireId), BASE_SEED, {
      eraYear: 1998,
      eraBundle: SHARED_WEB,
      eraTransition: eraTransition as never,
    });

  it("unsorted steps throw BAD_ERA naming the offending position", () => {
    expect(() => run([{ atBusinessMinute: 5000, eraYear: 2010 }, { atBusinessMinute: 3000, eraYear: 2020 }])).toThrow(
      /scenario\[BAD_ERA\] at 'eraTransition\[1\]\.atBusinessMinute'.*STRICTLY/s,
    );
  });

  it("duplicate minutes are not ascending — the second throws naming [1]", () => {
    expect(() => run([{ atBusinessMinute: 5000, eraYear: 2010 }, { atBusinessMinute: 5000, eraYear: 2020 }])).toThrow(
      /BAD_ERA.*eraTransition\[1\]/s,
    );
  });

  it("a zero-minute entry throws — the opening eraYear owns minute 0", () => {
    expect(() => run([{ atBusinessMinute: 0, eraYear: 2026 }])).toThrow(
      /scenario\[BAD_ERA\] at 'eraTransition\[0\]\.atBusinessMinute': the opening eraYear owns minute 0/,
    );
  });

  it("negative minutes throw naming the position and the value", () => {
    expect(() => run([{ atBusinessMinute: -1, eraYear: 2026 }])).toThrow(
      /eraTransition\[0\]\.atBusinessMinute.*got -1/s,
    );
  });

  it("non-integer fields throw BAD_INT naming the field; bad entry shapes throw BAD_ERA", () => {
    expect(() => run([{ atBusinessMinute: 100.5, eraYear: 2026 }])).toThrow(/BAD_INT.*eraTransition\[0\]\.atBusinessMinute/s);
    expect(() => run([{ atBusinessMinute: 100, eraYear: 2025.5 }])).toThrow(/BAD_INT.*eraTransition\[0\]\.eraYear/s);
    expect(() => run([{ atBusinessMinute: 100, eraYear: -1 }])).toThrow(/BAD_INT.*eraYear.*got -1/s);
    expect(() => run([null])).toThrow(/BAD_ERA.*eraTransition\[0\].*got null/s);
    expect(() => run(["2026"])).toThrow(/BAD_ERA.*eraTransition\[0\]/s);
  });

  it("a bare calendar has no world to step: eraTransition WITHOUT the pair throws", () => {
    expect(() =>
      runScenario(shippedScenario(wireId), BASE_SEED, { eraTransition: STEP_AT_10000 } as never),
    ).toThrow(/scenario\[BAD_ERA\] at 'runScenario\.eraTransition': eraTransition rides the eraYear\+eraBundle pair/);
    // half-pair (year, no bundle) keeps the EXISTING pair wall untouched:
    expect(() =>
      runScenario(shippedScenario(wireId), BASE_SEED, { eraYear: 1998, eraTransition: STEP_AT_10000 } as never),
    ).toThrow(/BAD_ERA.*eraYear and eraBundle arm TOGETHER/s);
  });

  it("tools/host rides the SAME walls — composeEraPlan throws directly (one authority, no runner dependency)", () => {
    expect(() => composeEraPlan(SHARED_WEB, 1998, { transitions: [{ atBusinessMinute: 2, eraYear: 2026 }, { atBusinessMinute: 1, eraYear: 2027 }] })).toThrow(/BAD_ERA.*eraTransition\[1\]/s);
    expect(() => composeEraPlan(SHARED_WEB, 1998, { transitions: [{ atBusinessMinute: 1, eraYear: 1998.5 }] })).toThrow(/BAD_INT/);
  });
});

/* ─────────────────── 2. the step function (pure over the business clock) ─────────────────── */

describe("eraYearAt — the step function the pilot named", () => {
  it("no steps (absent OR empty array) ⇒ the EXACT pilot constant: the context is never read", () => {
    for (const opts of [{}, { transitions: [] }, { transitions: Object.freeze([]) }]) {
      const plan = composeEraPlan(SHARED_WEB, 1998, opts);
      expect(plan.transitions.length).toBe(0);
      expect(plan.eraYearAt({ tick: 0n })).toBe(1998); // no clocks — and it must not care
      expect(plan.eraYearAt({})).toBe(1998);
      expect(plan.eraYearAt(undefined)).toBe(1998);
    }
  });

  it("one step, both sides: the minute exactly ON the step reads the NEW year; one before reads the old", () => {
    const plan = composeEraPlan(SHARED_WEB, 1998, { transitions: STEP_AT_10000 });
    expect(plan.eraYearAt(ctxAtBusinessMinute(1n, 0))).toBe(1998); // the opening floor owns minute 0
    expect(plan.eraYearAt(ctxAtBusinessMinute(9n, 9999))).toBe(1998);
    expect(plan.eraYearAt(ctxAtBusinessMinute(10n, 10000))).toBe(2026); // inclusive AT the step
    expect(plan.eraYearAt(ctxAtBusinessMinute(11n, 10001))).toBe(2026);
    // the floor law is µs-exact (mirrors shieldBusinessMinuteOf, corruption.ts:81):
    expect(plan.eraYearAt(ctxAtBusinessMinute(10n, 10000, -1n))).toBe(1998); // one µs short = one minute short
    expect(plan.eraYearAt(ctxAtBusinessMinute(10n, 10000, 59_999_999n))).toBe(2026); // still minute 10000
  });

  it("three steps: each lands inclusive, the last never expires (there is no un-step)", () => {
    const plan = composeEraPlan(SHARED_WEB, 1998, {
      transitions: [
        { atBusinessMinute: 100, eraYear: 2001 },
        { atBusinessMinute: 200, eraYear: 2009 },
        { atBusinessMinute: 300, eraYear: 2026 },
      ],
    });
    const at = (m: number) => plan.eraYearAt(ctxAtBusinessMinute(1n, m));
    expect([at(0), at(99), at(100), at(199), at(200), at(299), at(300), at(10 ** 7)]).toEqual([
      1998, 1998, 2001, 2001, 2009, 2009, 2026, 2026,
    ]);
  });

  it("a step to the year it already lives in is a legal no-op echo (the law is the calendar, not an authoring game)", () => {
    const plan = composeEraPlan(SHARED_WEB, 1998, {
      transitions: [{ atBusinessMinute: 500, eraYear: 1998 }],
    });
    expect(plan.eraYearAt(ctxAtBusinessMinute(1n, 499))).toBe(1998);
    expect(plan.eraYearAt(ctxAtBusinessMinute(1n, 500))).toBe(1998);
    expect(plan.gatesByYear.size).toBe(1); // composed ONCE per distinct year
  });

  it("a transitioning plan reads clocks or FAILS LOUD — it never guesses a year", () => {
    const plan = composeEraPlan(SHARED_WEB, 1998, { transitions: STEP_AT_10000 });
    expect(() => plan.eraYearAt({ tick: 5n })).toThrow(/BAD_ERA.*eraYearAt.*carried no clocks/);
    expect(() => plan.eraYearAt(undefined)).toThrow(/carried no clocks/);
    expect(() => plan.eraYearAt({ clocks: { ...initialClocks(), businessUs: 2n ** 120n } })).toThrow(/safe-integer/);
  });

  it("gatesByYear is the SAME resolution authority per year — the step re-composes nothing new (cross-authority)", () => {
    const stepped = composeEraPlan(SHARED_WEB, 1998, {
      transitions: [
        { atBusinessMinute: 100, eraYear: 2001 },
        { atBusinessMinute: 200, eraYear: 2026 },
      ],
    });
    expect([...stepped.gatesByYear.keys()].sort((a, b) => a - b)).toEqual([1998, 2001, 2026]);
    expect(stepped.gate).toBe(stepped.gatesByYear.get(1998)); // gate === opening-year entry, by identity
    for (const year of [1998, 2001, 2026]) {
      const twin = composeEraPlan(SHARED_WEB, year); // the pilot path, one frozen year
      const mine = stepped.gatesByYear.get(year) as ReadonlyMap<string, unknown>;
      expect([...mine.keys()].sort(), String(year)).toEqual([...twin.gate.keys()].sort());
      for (const [techId, av] of mine) {
        expect(av, techId + "@" + year).toEqual(twin.gate.get(techId));
      }
    }
    // 1998/2001 refuse the whole named line; 2026 gates nothing:
    expect(stepped.gatesByYear.get(1998)!.size).toBeGreaterThan(0);
    expect(stepped.gatesByYear.get(2026)!.size).toBe(0);
    expect(stepped.gatesAnyYear).toBe(true); // armed from t0 — the flip must EXIST before it happens
  });
});

/* ─────────────────── 3. the door, per-intent, across the step ─────────────────── */

describe("the intent door consulted AS OF the business minute (door untouched)", () => {
  it("same seed, same script: refused BEFORE the step (state IDENTITY, unpaid), EXECUTES AT/AFTER it", () => {
    const plan = composeEraPlan(SHARED_WEB, 1998, { transitions: STEP_AT_10000 });
    const config = applyEraAvailabilityToDoorConfig(Object.freeze({ handCapacity: 2 }), plan);
    // BEFORE — minute 9999 reads the opening year: the pilot posture exactly.
    const state0 = sweepState();
    const before = applyIntentDoor(
      state0,
      ctxAtBusinessMinute(5n, 9999),
      [forgedExt(5n, 0, placeArgs("shared-web"))] as unknown as ExternalIntent[],
      config,
    );
    expect(before.receipts[0]?.outcome).toBe("refused");
    expect(before.receipts[0]?.reason).toBe('era: "shared-web" not available in 1998 (available from 2009)');
    expect(before.state).toBe(state0); // pre-payment identity — the step adds no state event either
    // AT the step — the SAME config, the SAME intent, minute 10000 inclusive:
    const after = applyIntentDoor(
      state0,
      ctxAtBusinessMinute(6n, 10000),
      [forgedExt(6n, 0, placeArgs("shared-web", "web-7"))] as unknown as ExternalIntent[],
      config,
    );
    expect(after.receipts[0]?.outcome).toBe("executed");
    expect([...(after.state.nodes.keys() as Iterable<string>)]).toContain("web-7");
    // the flip needed NO state change: the only difference between the two
    // passes is the INJECTED clock the closure reads.
  });

  it("the retirement direction flips the same way (FORGED modem row, R66)", () => {
    const plan = composeEraPlan(forgedModemBundle(), 2001, {
      transitions: [{ atBusinessMinute: 10000, eraYear: 2016 }],
    });
    // opening 2001: the modem lives [1994,2008); the shared-web LINE is what
    // the opening year refuses — gatesAnyYear armed from t0 regardless.
    expect(plan.gate.has("modem-bank-pilot")).toBe(false);
    expect(plan.gatesByYear.get(2016)!.has("modem-bank-pilot")).toBe(true);
    const config = applyEraAvailabilityToDoorConfig(Object.freeze({ handCapacity: 2 }), plan);
    const state0 = sweepState();
    const before = applyIntentDoor(
      state0,
      ctxAtBusinessMinute(5n, 3000),
      [forgedExt(5n, 0, placeArgs("modem-bank-pilot", "web-2"))] as unknown as ExternalIntent[],
      config,
    );
    expect(before.receipts[0]?.outcome).toBe("executed"); // still 2001 — the modem bank still exists
    const after = applyIntentDoor(
      before.state,
      ctxAtBusinessMinute(6n, 12000),
      [forgedExt(6n, 0, placeArgs("modem-bank-pilot", "web-3"))] as unknown as ExternalIntent[],
      config,
    );
    expect(after.receipts[0]?.outcome).toBe("refused");
    expect(after.receipts[0]?.reason).toBe('era: "modem-bank-pilot" obsolete since 2008 (retired at era transition)');
    expect([...(after.state.nodes.keys() as Iterable<string>)]).not.toContain("web-3");
  });

  it("a plan gating NO year (even with steps armed) grows NO canExecute key — the zero-ban rule generalizes across the calendar", () => {
    const plan = composeEraPlan(SHARED_WEB, 2026, {
      transitions: [{ atBusinessMinute: 1000, eraYear: 2027 }],
    });
    expect(plan.gatesAnyYear).toBe(false);
    const config = applyEraAvailabilityToDoorConfig(Object.freeze({ handCapacity: 2 }), plan);
    expect(Object.prototype.hasOwnProperty.call(config, "canExecute")).toBe(false);
  });

  it("the opening-year empty gate WITH a retiring later year is STILL armed from t0 (a mid-run key growth would be a state event)", () => {
    // modem {1994→2016) + opening 2009: the LINE lives (availableFrom 2009)
    // and the modem lives — the opening gate is EMPTY; 2020 retires the
    // modem. The gate must exist before the retirement does.
    const raw = JSON.parse(JSON.stringify(readTypeWire("shared-web"))) as Record<string, unknown>;
    (raw.eras as Record<string, unknown>).availability = { "modem-bank-pilot": { from: "1994", to: "2016" } };
    const plan = composeEraPlan(loadTypeBundle(raw), 2009, {
      transitions: [{ atBusinessMinute: 10000, eraYear: 2020 }],
    });
    expect(plan.gate.size).toBe(0); // opening 2009: everything named lives
    expect(plan.gatesAnyYear).toBe(true); // 2020 retires the modem
    const config = applyEraAvailabilityToDoorConfig(Object.freeze({ handCapacity: 2 }), plan);
    expect(typeof config.canExecute).toBe("function");
    expect(config.canExecute?.(queryAt("place-device", placeArgs("modem-bank-pilot"), ctxAtBusinessMinute(2n, 9999)))).toBeNull();
    // BEFORE the step the installed gate still allows — armed ≠ refusing;
    // AFTER, the retirement is law:
    const retired = config.canExecute?.(queryAt("place-device", placeArgs("modem-bank-pilot"), ctxAtBusinessMinute(3n, 10000)));
    expect(retired?.reason).toBe('era: "modem-bank-pilot" obsolete since 2016 (retired at era transition)');
  });

  it("perspective STACKED under a stepping era: the ban holds across the step; the era allow does NOT override the seat", () => {
    const seat = PERSPECTIVE_V0["datacenter-tech"]; // place ALLOWED, adjust-price BANNED (:1211)
    const plan = composeEraPlan(SHARED_WEB, 1998, { transitions: STEP_AT_10000 });
    const chained = applyEraAvailabilityToDoorConfig(
      applyPerspectiveToDoorConfig(Object.freeze({ handCapacity: 2 }), seat),
      plan,
    );
    const price = { targetKind: "plan", targetId: "basic", newPriceMicroUsd: 5_000_000n, effectiveAtBusinessMinute: null };
    // before the step: era refuses the gated tech; the seat refuses its verb — both stand.
    expect(chained.canExecute?.(queryAt("place-device", placeArgs("shared-web"), ctxAtBusinessMinute(3n, 5000)))?.reason)
      .toContain("not available in 1998");
    expect(chained.canExecute?.(queryAt("adjust-price", price, ctxAtBusinessMinute(3n, 5000)))?.reason)
      .toContain("perspective-forbids");
    // after the step: the era DELEGATES place-device (tech now lives)…
    expect(chained.canExecute?.(queryAt("place-device", placeArgs("shared-web"), ctxAtBusinessMinute(9n, 15000)))).toBeNull();
    // …while the seat ban is UNMOVED by the calendar — seeing-as-of never
    // becomes dominance-as-of (the L-PERS axis law survives the step).
    expect(chained.canExecute?.(queryAt("adjust-price", price, ctxAtBusinessMinute(9n, 15000)))?.reason)
      .toContain("perspective-forbids");
  });

  it("card greying stays OPENING-year frozen under transitions — the lookup seam has no clock (documented limit, pinned)", () => {
    const plan = composeEraPlan(SHARED_WEB, 1998, {
      transitions: STEP_AT_10000,
      policyCards: new Map([["card-cpanel", "shared-web"]]),
    });
    // 1998 refuses shared-web → greyed; and it stays greyed even though 2026
    // would allow the tech: the eraCardLookup signature carries no context,
    // the door is out of scope, and half-stepped authorities are a lie.
    expect([...plan.greyedPolicyCardIds]).toEqual(["card-cpanel"]);
    const book = new Map<string, PolicyCard>([["h1", { id: "card-cpanel" } as PolicyCard]]);
    const config = applyEraAvailabilityToDoorConfig(
      Object.freeze({ handCapacity: 2, lookupPolicyCard: (hash: string) => book.get(hash) ?? null }),
      plan,
    );
    expect(config.lookupPolicyCard?.("h1")).toBeNull();
    expect(applyEraAvailabilityToDoorConfig(
      Object.freeze({ handCapacity: 2, lookupPolicyCard: (hash: string) => book.get(hash) ?? null }),
      composeEraPlan(SHARED_WEB, 2026, {
        transitions: [{ atBusinessMinute: 100, eraYear: 1998 }], // retiring INTO the past: opening 2026 greys nothing…
        policyCards: new Map([["card-cpanel", "shared-web"]]),
      }),
    ).lookupPolicyCard?.("h1")).not.toBeNull(); // …and stays un-greyed all run — same opening-year law, both directions.
  });
});

/* ─────────────────── 4. the LIVE run: wire #31 walks through its own step ─────────────────── */

describe("runScenario with a stepping era — wire #31's intents straddle the business-minute step", () => {
  /* THE CLOCK FACT (probe-verified against the driver's own chain at
   * 0c2549e, never guessed): one tick advances the business clock by
   * 43_200/7 minutes (BUSINESS_SCALE_DEFAULT × the default 1s tickAdvance),
   * floored — t20 → business minute 2057, t30 → 3085, t150 → 15428. The
   * transition minute 10_000 sits strictly between t30 and t150; the
   * boundary probes pin t20's EXACT minute from both sides. */
  const wireId = "the-not-invented-yet";
  const T20_MINUTE = 2057;

  /** Clone #31 with the lose line RAISED to fire on the SECOND refusal (the
   *  shipped count-0 line stops the run at t20 and the step never arrives),
   *  and the win line narrowed to survival (the strict >2 executed line
   *  belongs to the frozen arms; here the census itself is the witness). */
  function straddlingDoc(): ReturnType<typeof parseScenarioDoc> {
    const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES[wireId])) as Record<string, unknown>;
    (wire.objectives as Record<string, unknown>).win = [{ kind: "survive-minutes", minutes: 240 }];
    (wire.objectives as Record<string, unknown>).lose = [{ kind: "intents-refused-above", verb: "place-device", count: 1 }];
    return parseScenarioDoc(wire as never);
  }

  /** Clone #31 with BOTH shared-web placements rewritten to the FORGED
   *  modem-bank row (retirement direction): t20 and t150 place modem,
   *  t30 stays the generic witness. */
  function modemDoc(): ReturnType<typeof parseScenarioDoc> {
    const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES[wireId])) as Record<string, unknown>;
    (wire.objectives as Record<string, unknown>).win = [{ kind: "survive-minutes", minutes: 240 }];
    (wire.objectives as Record<string, unknown>).lose = [{ kind: "intents-refused-above", verb: "place-device", count: 1 }];
    const intents = wire.intents as Record<string, unknown>[];
    for (const row of intents) {
      if (row.atTick === 20) (row.args as Record<string, unknown>).deviceKind = "modem-bank-pilot";
      if (row.atTick === 150) (row.args as Record<string, unknown>).deviceKind = "modem-bank-pilot";
    }
    return parseScenarioDoc(wire as never);
  }

  it("INTRODUCTION FLIP (×5 seed offsets): t20 refuses pre-step, t150 executes at/after — one script straddling the calendar", () => {
    for (const seedOffset of [0, 1, 2, 3, 4]) {
      const report = runScenario(straddlingDoc(), BASE_SEED, {
        seedOffset,
        eraYear: 1998,
        eraBundle: SHARED_WEB,
        eraTransition: STEP_AT_10000,
      });
      const tag = "@" + seedOffset;
      expect(report.outcome, tag).toBe("won");
      expect(report.endMinute, tag).toBe(240);
      // t20 (minute 2057 < 10000): the pilot refusal — unpaid, the lose line
      // needs a SECOND refusal; t150 (minute 15428 ≥ 10000): the SAME
      // deviceKind now EXISTS. No state change minted the flip — only the
      // clock crossed the step.
      expect(report.observation.intentsRefusedByVerb["place-device"], tag).toBe(1);
      expect(report.observation.intentsExecutedByVerb["place-device"], tag).toBe(2);
      // THE REPORT ECHO (design item 4, decision pinned): the `era` key
      // keeps the OPENING year verbatim and echoes the frozen calendar.
      expect(report.era, tag).toEqual({
        eraYear: 1998,
        bundleId: "official:shared-web",
        transitions: [{ atBusinessMinute: 10000, eraYear: 2026 }],
      });
      expect(Object.isFrozen(report.era!.transitions), tag).toBe(true);
      expect(Object.isFrozen(report.era!.transitions![0]), tag).toBe(true);
    }
  });

  it("the step boundary at the door minute: X = t20's minute lands INCLUSIVE (t20 executes); X+1 misses it", () => {
    const inclusive = runScenario(straddlingDoc(), BASE_SEED, {
      eraYear: 1998,
      eraBundle: SHARED_WEB,
      eraTransition: [{ atBusinessMinute: T20_MINUTE, eraYear: 2026 }],
    });
    expect(inclusive.observation.intentsRefusedByVerb["place-device"] ?? 0).toBe(0);
    expect(inclusive.observation.intentsExecutedByVerb["place-device"]).toBe(3);
    // every query after minute 2057 reads 2026, where the whole line lives:
    // the run is DOOR-EQUIVALENT to the frozen-2026 pilot (frozen arm and
    // eraless share one digest @22717d2; both are the eraless byte-path —
    // the self-re-deriving witness is the frozen 2026 twin below).
    const frozen2026 = runScenario(shippedScenario(wireId), BASE_SEED, { eraYear: 2026, eraBundle: SHARED_WEB });
    expect(inclusive.endDigest).toBe(frozen2026.endDigest);
    const exclusive = runScenario(straddlingDoc(), BASE_SEED, {
      eraYear: 1998,
      eraBundle: SHARED_WEB,
      eraTransition: [{ atBusinessMinute: T20_MINUTE + 1, eraYear: 2026 }],
    });
    expect(exclusive.observation.intentsRefusedByVerb["place-device"]).toBe(1); // 2057 < 2058 — one minute short
    expect(exclusive.observation.intentsExecutedByVerb["place-device"]).toBe(2);
  });

  it("a step beyond the run horizon is a calendar the run never reaches — the frozen 1998 shape stands (lose fires at the SECOND refusal, t150)", () => {
    const never = runScenario(straddlingDoc(), BASE_SEED, {
      eraYear: 1998,
      eraBundle: SHARED_WEB,
      eraTransition: [{ atBusinessMinute: 999_999, eraYear: 2026 }],
    });
    expect(never.outcome).toBe("lost");
    // stopReason rides the SIM minute (pilot law: the shipped arm stops at
    // "@20" for t20) — the SECOND refusal lands on t150's boundary.
    expect(never.stopReason).toBe("lose:intents-refused-above:place-device:1@150");
    expect(never.observation.intentsRefusedByVerb["place-device"]).toBe(2);
    expect(never.observation.intentsExecutedByVerb["place-device"]).toBe(1); // only t30's generic kind
  });

  it("RETIREMENT FLIP (FORGED modem row): t20 builds the modem bank while 2001 lives, t150 is scrap past the step to 2016", () => {
    const report = runScenario(modemDoc(), BASE_SEED, {
      eraYear: 2001,
      eraBundle: forgedModemBundle(),
      eraTransition: [{ atBusinessMinute: 10000, eraYear: 2016 }],
    });
    expect(report.outcome).toBe("won");
    expect(report.observation.intentsExecutedByVerb["place-device"]).toBe(2); // t20 modem + t30 generic
    expect(report.observation.intentsRefusedByVerb["place-device"]).toBe(1); // t150 — "your modem bank becomes scrap" (§1.6 :4577)
    expect(report.era!.transitions).toEqual([{ atBusinessMinute: 10000, eraYear: 2016 }]);
    // controls, self-derived: frozen-2001 never refuses the modem (ex=3, rf=0
    // — the shared-web LINE greys but no intent asks it); frozen-2016 refuses
    // BOTH modem placements (lose fires at t150).
    const open2001 = runScenario(modemDoc(), BASE_SEED, { eraYear: 2001, eraBundle: forgedModemBundle() });
    expect(open2001.outcome).toBe("won");
    expect(open2001.observation.intentsExecutedByVerb["place-device"]).toBe(3);
    const open2016 = runScenario(modemDoc(), BASE_SEED, { eraYear: 2016, eraBundle: forgedModemBundle() });
    expect(open2016.outcome).toBe("lost");
    expect(open2016.observation.intentsRefusedByVerb["place-device"]).toBe(2);
  });

  it("ABSENT ≡ EMPTY ≡ THE PILOT: the pre-edit 0c2549e digests byte-stand (captured by the temporary baseline probe, method in the header)", () => {
    // LITERALS disclosed: captured from `the-not-invented-yet` on the PRISTINE
    // 0c2549e tree (seed 904n) BEFORE any L-ER-T edit, then re-derived on the
    // edited tree via stash A/B — equal there, so they are transition-proof:
    const PRE_EDIT_ERALESS = "6aecd417c317a910c75e37f4da14b272"; // shipped wire, eraless
    const PRE_EDIT_FROZEN_1998 = "38e72c42b0f0e20b2077885c35e5f4f0"; // {eraYear:1998} — lose fires at t20
    const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES[wireId])) as Record<string, unknown>;
    (wire.objectives as Record<string, unknown>).lose = [{ kind: "intents-refused-above", verb: "place-device", count: 1 }];
    const doc = parseScenarioDoc(wire as never);
    const PRE_EDIT_FROZEN_1998_CAP40 = "7688b0eea714e58918b82264e850116f"; // same clone, tickCap 40
    expect(runScenario(shippedScenario(wireId), BASE_SEED, {}).endDigest).toBe(PRE_EDIT_ERALESS);
    expect(runScenario(shippedScenario(wireId), BASE_SEED, { eraYear: 1998, eraBundle: SHARED_WEB }).endDigest).toBe(PRE_EDIT_FROZEN_1998);
    expect(runScenario(doc, BASE_SEED, { tickCap: 40, eraYear: 1998, eraBundle: SHARED_WEB }).endDigest).toBe(PRE_EDIT_FROZEN_1998_CAP40);
    // EMPTY array ≡ absent, digest AND report shape (no transitions echo):
    const empty = runScenario(doc, BASE_SEED, { tickCap: 40, eraYear: 1998, eraBundle: SHARED_WEB, eraTransition: [] });
    expect(empty.endDigest).toBe(PRE_EDIT_FROZEN_1998_CAP40);
    expect(empty.era).toEqual({ eraYear: 1998, bundleId: "official:shared-web" });
    // (ABSENCE itself is pinned above: the key-not-written call hits the same
    // PRE_EDIT literal, and the report grows no transitions echo either way.)
  });

  it("a transitioning run is ×100 byte-deterministic (the step is closure arithmetic, never an extra die)", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      digests.add(
        runScenario(straddlingDoc(), BASE_SEED, {
          eraYear: 1998,
          eraBundle: SHARED_WEB,
          eraTransition: STEP_AT_10000,
        }).endDigest,
      );
    }
    expect(digests.size).toBe(1);
  });

  it("every eraless sibling still grows NO era key (the sparse law survives the transition arm existing)", () => {
    for (const id of ["the-long-weekend", "the-change-freeze", "the-not-invented-yet"]) {
      expect(runScenario(shippedScenario(id), BASE_SEED, { tickCap: 12 }), id).not.toHaveProperty("era");
    }
  });
});

/* ─────────────────── 5. determinism seam witnesses ─────────────────── */

describe("the transition adds no digest surface", () => {
  it("two independent plan instances for one calendar resolve identically at every sampled minute (no hidden state between composes)", () => {
    const a: EraPlan = composeEraPlan(SHARED_WEB, 1998, { transitions: STEP_AT_10000 });
    const b: EraPlan = composeEraPlan(SHARED_WEB, 1998, { transitions: [{ atBusinessMinute: 10000, eraYear: 2026 }] });
    for (const minute of [0, 9999, 10000, 10001, 43_200]) {
      expect(a.eraYearAt(ctxAtBusinessMinute(1n, minute))).toBe(b.eraYearAt(ctxAtBusinessMinute(7n, minute)));
    }
    expect(a.gate).toEqual(b.gate);
  });
});
