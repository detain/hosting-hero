/**
 * eraAvailability.test.ts — L-EM (ADR-0019 program 4): the §0.4 sentence
 * "Whole branches of the tech tree are greyed out with 'not invented yet.'"
 * runs the door.
 *
 * Laws pinned here:
 *  1. COMPOSITION (the L-PERS shape, matched exactly): era is the OUTERMOST
 *     veto — freeze tapes → perspective gate → era gate — chaining, never
 *     clobbering (`eraVerdict ?? inner(query)`); a zero-gate plan grows NO
 *     canExecute key (the zero-ban rule), so every untouched field rides by
 *     identity and eraless runs take the EXACT byte path.
 *  2. PRE-PAYMENT IDENTITY: an era refusal pays nothing — hands untouched,
 *     state identity across a refused-only pass (L-CE posture @a828379).
 *  3. NEVER-INVENTS at the door: the gate denies only what the line NAMES
 *     (buildables vocabulary + line id tail); the resolver's permissive
 *     bundle-level delegation is restricted HERE, in the composer — a tech
 *     no dated line claims stays free, and gating the probe wire's
 *     deviceKind "shared-web" against the COLO bundle changes nothing
 *     (the cross-line witness).
 *  4. HOST VOCABULARY, census-invisible: the two era phrases are
 *     host strings at the general gate; intent-door.ts mints ZERO new codes
 *     (the 46-census rides unedited). Policy-card greying returns null and
 *     rides the door's existing `unknown-card-hash` grammar.
 *  5. SHELL ERA ≠ PLAY ERA (conflation guard): apps/proto's eraState is a
 *     reactive COSMETIC token for chrome; eraYear here is RUN-FROZEN host
 *     config — scenario sources provably never touch the shell.
 *
 * Retirement (`to`) legs ship ZERO content rows: the §1.6 "modem bank
 * becomes scrap" law is machinery pinned by FORGED fixtures only (R66).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PlayerVerb, asRunSeed } from "../../types.ts";
import type { ExternalIntent, GameState, PolicyCard, TickContext } from "../../types.ts";
import type { ExecuteQuery } from "../../pipeline/index.ts";
import { applyIntentDoor, createBoardState, createInitialState } from "../../pipeline/index.ts";
import { MICROS_PER_MIN, initialClocks } from "../../kernel/time.ts";
import { loadTypeBundle } from "../../loader/bundle.ts";
import type { LoadedTypeBundle } from "../../loader/bundle.ts";
import { runScenario, shippedScenario, SHIPPED_SCENARIO_WIRES } from "../index.ts";
import { parseScenarioDoc } from "../doc.ts";
import { applyPerspectiveToDoorConfig, PERSPECTIVE_V0 } from "../perspective.ts";
import { applyEraAvailabilityToDoorConfig, composeEraPlan, eraRefusalReason } from "../eraAvailability.ts";
import type { EraPlan } from "../eraAvailability.ts";

// vitest roots at packages/sim-core (era-dating.test.ts law).
const CONTENT = join(process.cwd(), "..", "content");

function readTypeWire(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(CONTENT, "types", `${name}.json`), "utf8")) as Record<string, unknown>;
}

const SHARED_WEB: LoadedTypeBundle = loadTypeBundle(readTypeWire("shared-web"));
const COLO: LoadedTypeBundle = loadTypeBundle(readTypeWire("colo"));

const BASE_SEED = asRunSeed(904n);

/* ─────────────────────── door-level scaffolding (perspective.test twin) ─────────────────────── */

function ctx(tick: bigint): TickContext {
  return Object.freeze({ tick, minute: Number(tick), clocks: initialClocks() });
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
    engineVersion: "test-era-pilot",
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

function queryFor(verb: string, args: Record<string, unknown> = {}, carrier: string | null = null): ExecuteQuery {
  return { verb, args, carrier, state: {}, context: { tick: 1n } } as unknown as ExecuteQuery;
}

/* ─────────────────────────── 1. composeEraPlan ─────────────────────────── */

describe("composeEraPlan — the run-frozen verdict over one line", () => {
  it("1998 shared-web: the dated LINE gates its whole named vocabulary (source bundle), zero rows shipped", () => {
    const plan = composeEraPlan(SHARED_WEB, 1998);
    expect(plan.bundleId).toBe("official:shared-web");
    expect(plan.eraYear).toBe(1998);
    const gated = plan.gate.get("shared-web");
    expect(gated).toMatchObject({ status: "pre-introduction", source: "bundle", availableFrom: "2009" });
    // every named buildable of the line greys too…
    for (const techId of SHARED_WEB.buildables.distinct) {
      expect(plan.gate.has(techId), techId).toBe(true);
    }
    for (const techId of SHARED_WEB.buildables.nonPhysical) {
      expect(plan.gate.has(techId), techId).toBe(true);
    }
    // …but NOTHING else exists to gate.
    expect(plan.gate.has("generic")).toBe(false);
  });

  it("2026 shared-web: the gate is EMPTY — every tech on the dated line lives", () => {
    expect(composeEraPlan(SHARED_WEB, 2026).gate.size).toBe(0);
  });

  it("colo 1998: the ONE shipped row resolves through the row source; every other named tech through the line", () => {
    const plan = composeEraPlan(COLO, 1998);
    expect(plan.gate.get("cross-connect-faucet")).toMatchObject({ status: "pre-introduction", source: "row" });
    expect(plan.gate.get("cabinet-power-ledger")).toMatchObject({ status: "pre-introduction", source: "bundle" });
    expect(composeEraPlan(COLO, 2001).gate.size).toBe(0);
  });

  it("FORGED retirement fixture (§1.6 modem-bank leg): a from+to pair retires at the exclusive `to`", () => {
    // Zero shipped content carries a `to` leg (era-availability.test.ts
    // census); the machinery rides this fixture ONLY.
    const raw = JSON.parse(JSON.stringify(readTypeWire("shared-web"))) as Record<string, unknown>;
    (raw.eras as Record<string, unknown>).availability = { "modem-bank-pilot": { from: "1994", to: "2008" } };
    const forged = loadTypeBundle(raw);
    const plan = composeEraPlan(forged, 2016);
    expect(plan.gate.get("modem-bank-pilot")).toMatchObject({ status: "obsolete", source: "row", obsoleteBy: "2008" });
    // the line itself lives in 2016 — only the retired tech greys:
    expect(plan.gate.size).toBe(1);
    expect(plan.gate.has("shared-web")).toBe(false);
  });

  it("eraYearAt is RUN-FROZEN (v0 constant; the era-transition seam for later)", () => {
    const plan = composeEraPlan(SHARED_WEB, 1998);
    expect(plan.eraYearAt({ tick: 0n })).toBe(1998);
    expect(plan.eraYearAt({ tick: 99_999n })).toBe(1998);
  });

  it("policy-card greying rides the host-supplied card→tech map (v0 ships none)", () => {
    const bare = composeEraPlan(SHARED_WEB, 1998);
    expect(bare.greyedPolicyCardIds.size).toBe(0);
    const armed = composeEraPlan(SHARED_WEB, 1998, {
      policyCards: new Map([["card-cpanel", "shared-web"], ["card-dialup", "generic"]]),
    });
    expect([...armed.greyedPolicyCardIds]).toEqual(["card-cpanel"]);
    // and NOTHING greys in the living era:
    expect(composeEraPlan(SHARED_WEB, 2026, { policyCards: new Map([["card-cpanel", "shared-web"]]) }).greyedPolicyCardIds.size).toBe(0);
  });
});

/* ─────────────────── 2. applyEraAvailabilityToDoorConfig (composition law) ─────────────────── */

describe("the door-config composition (zero-gate grows no key; fields ride by identity)", () => {
  const attentionCost = Object.freeze({ [PlayerVerb.Communicate]: 1 as const });

  it("a zero-gate, zero-grey plan returns a structurally identical frozen clone — NO canExecute key", () => {
    const config = Object.freeze({ handCapacity: 2, attentionCost });
    const result = applyEraAvailabilityToDoorConfig(config, composeEraPlan(SHARED_WEB, 2026));
    expect(Object.prototype.hasOwnProperty.call(result, "canExecute")).toBe(false);
    expect(result.handCapacity).toBe(2);
    expect(result.attentionCost).toBe(attentionCost); // identity, not a rebuild
  });

  it("a gating plan adds canExecute ONLY; a greyed card set adds lookupPolicyCard ONLY when the host wired a book", () => {
    const base = Object.freeze({ handCapacity: 2 });
    const gated = applyEraAvailabilityToDoorConfig(base, composeEraPlan(SHARED_WEB, 1998));
    expect(typeof gated.canExecute).toBe("function");
    expect(gated.lookupPolicyCard).toBeUndefined(); // no cards map → no book wrap

    const plan = composeEraPlan(SHARED_WEB, 1998, { policyCards: new Map([["card-cpanel", "shared-web"]]) });
    const noBook = applyEraAvailabilityToDoorConfig(base, plan);
    expect(noBook.lookupPolicyCard).toBeUndefined(); // era never FABRICATES a book
    const book = new Map<string, PolicyCard>([["h1", { id: "card-cpanel" } as PolicyCard], ["h2", { id: "card-open" } as PolicyCard]]);
    const withBook = applyEraAvailabilityToDoorConfig(
      Object.freeze({ handCapacity: 2, lookupPolicyCard: (hash: string) => book.get(hash) ?? null }),
      plan,
    );
    const greyed = withBook.lookupPolicyCard?.("h1");
    const kept = withBook.lookupPolicyCard?.("h2");
    expect(greyed ?? null).toBeNull(); // greyed → null → door's own unknown-card-hash grammar
    expect((kept as { id: string } | null)?.id).toBe("card-open");
  });

  it("the refusal phrases are EXACTLY the two host strings (census-46-invisible)", () => {
    const plan = composeEraPlan(SHARED_WEB, 1998);
    const config = applyEraAvailabilityToDoorConfig(Object.freeze({ handCapacity: 2 }), plan);
    expect(eraRefusalReason(plan.gate.get("shared-web")!)).toBe(
      'era: "shared-web" not available in 1998 (available from 2009)',
    );
    const raw = JSON.parse(JSON.stringify(readTypeWire("shared-web"))) as Record<string, unknown>;
    (raw.eras as Record<string, unknown>).availability = { "modem-bank-pilot": { from: "1994", to: "2008" } };
    const retired = composeEraPlan(loadTypeBundle(raw), 2016);
    expect(eraRefusalReason(retired.gate.get("modem-bank-pilot")!)).toBe(
      'era: "modem-bank-pilot" obsolete since 2008 (retired at era transition)',
    );
    // the composed hook answers with the same string:
    const rejection = config.canExecute?.(queryFor("place-device", placeArgs("shared-web")));
    expect(rejection?.reason).toBe('era: "shared-web" not available in 1998 (available from 2009)');
  });

  it("era gate fires on EVERY rail — carrier law: the tech does not exist, whoever waves the hand", () => {
    const config = applyEraAvailabilityToDoorConfig(Object.freeze({ handCapacity: 2 }), composeEraPlan(SHARED_WEB, 1998));
    for (const carrier of [null, "place-device", "some-rule-verb"]) {
      expect(config.canExecute?.(queryFor("place-device", placeArgs("shared-web"), carrier))?.reason, String(carrier)).toContain("not available");
    }
    // an ungated tech still delegates DOWN to the chained hook (never shadows):
    let priorCalls = 0;
    const chained = applyEraAvailabilityToDoorConfig(
      Object.freeze({
        handCapacity: 2,
        canExecute: () => {
          priorCalls += 1;
          return null;
        },
      }),
      composeEraPlan(SHARED_WEB, 1998),
    );
    expect(chained.canExecute?.(queryFor("place-device", placeArgs("generic")))).toBeNull();
    expect(priorCalls).toBe(1);
  });
});

/* ─────────────────── 3. the REAL door: pre-payment + ordering ─────────────────── */

describe("the intent door under the era gate", () => {
  it("a refused-only pass leaves state IDENTITY and pays nothing (L-CE posture)", () => {
    const state0 = sweepState();
    const config = applyEraAvailabilityToDoorConfig(
      Object.freeze({ handCapacity: 2 }),
      composeEraPlan(SHARED_WEB, 1998),
    );
    const res = applyIntentDoor(state0, ctx(5n), [forgedExt(5n, 0, placeArgs("shared-web"))] as unknown as ExternalIntent[], config);
    expect(res.receipts.length).toBe(1);
    expect(res.receipts[0]?.outcome).toBe("refused");
    expect(res.receipts[0]?.reason).toBe('era: "shared-web" not available in 1998 (available from 2009)');
    expect(res.state).toBe(state0); // unpaid: hands free, board untouched, zero events beyond the refusal
  });

  it("mixed pass: the gated placement refuses unpaid while the safe kind executes (per-verb split at the rail)", () => {
    const state0 = sweepState();
    const config = applyEraAvailabilityToDoorConfig(
      Object.freeze({ handCapacity: 2 }),
      composeEraPlan(SHARED_WEB, 1998),
    );
    const res = applyIntentDoor(
      state0,
      ctx(5n),
      [
        forgedExt(5n, 0, placeArgs("shared-web", "web-2")),
        forgedExt(5n, 1, placeArgs("generic", "web-3")),
      ] as unknown as ExternalIntent[],
      config,
    );
    expect(res.receipts[0]?.outcome).toBe("refused");
    expect(res.receipts[1]?.outcome).toBe("executed");
    // web-3 exists on the board, web-2 never does:
    const nodeIds = [...(res.state.nodes.keys() as Iterable<string>)];
    expect(nodeIds).toContain("web-3");
    expect(nodeIds).not.toContain("web-2");
    // ONE hand spent, not two: the refusal paid nothing.
    const busy = (res.state.hands?.tokens ?? []).filter((t) => t.busyUntilTick > 5n).length;
    expect(busy).toBe(1);
  });

  it("era OUTRANKS the freeze validator: the canExecute layer answers before the per-verb tape is consulted", () => {
    const state0 = sweepState();
    let validatorCalls = 0;
    const config = applyEraAvailabilityToDoorConfig(
      Object.freeze({
        handCapacity: 2,
        canPlaceDevice: () => {
          validatorCalls += 1;
          return { reason: "placement-rejected: change-freeze" };
        },
      }),
      composeEraPlan(SHARED_WEB, 1998),
    );
    const res = applyIntentDoor(state0, ctx(5n), [forgedExt(5n, 0, placeArgs("shared-web"))] as unknown as ExternalIntent[], config);
    expect(res.receipts[0]?.reason).toContain("era:");
    expect(res.receipts[0]?.reason).not.toContain("change-freeze");
    expect(validatorCalls).toBe(0); // never even consulted — subsumption, not replacement
  });

  it("chain order freeze→perspective→era: era vetoes its techs, perspective vetoes its verbs, both delegate the rest", () => {
    const state0 = sweepState();
    const seat = PERSPECTIVE_V0["datacenter-tech"]; // place-device ALLOWED, adjust-price BANNED (:1211 roster)
    const chained = applyEraAvailabilityToDoorConfig(
      applyPerspectiveToDoorConfig(Object.freeze({ handCapacity: 2 }), seat),
      composeEraPlan(SHARED_WEB, 1998),
    );
    const eraRejection = chained.canExecute?.(queryFor("place-device", placeArgs("shared-web")));
    const seatRejection = chained.canExecute?.(queryFor("adjust-price", {
      targetKind: "plan", targetId: "basic", newPriceMicroUsd: 5_000_000n, effectiveAtBusinessMinute: null,
    }));
    const freeRejection = chained.canExecute?.(queryFor("place-device", placeArgs("generic")));
    expect(eraRejection?.reason).toContain("not available in 1998");
    expect(seatRejection?.reason).toContain("perspective-forbids");
    expect(freeRejection).toBeNull();
  });

  it("a 2026-armed door executes the SAME script the eraless door does — allow-all twin, receipt-for-receipt", () => {
    const state0 = sweepState();
    const feed = [
      forgedExt(5n, 0, placeArgs("shared-web", "web-2")),
      forgedExt(5n, 1, placeArgs("generic", "web-3")),
    ] as unknown as ExternalIntent[];
    const eraless = applyIntentDoor(state0, ctx(5n), feed, Object.freeze({ handCapacity: 2 }));
    const armed = applyIntentDoor(
      state0,
      ctx(5n),
      feed,
      applyEraAvailabilityToDoorConfig(Object.freeze({ handCapacity: 2 }), composeEraPlan(SHARED_WEB, 2026)),
    );
    expect(armed.receipts.map((r) => `${r.verb}:${r.outcome}`)).toEqual(eraless.receipts.map((r) => `${r.verb}:${r.outcome}`));
    expect(armed.state).not.toBe(state0); // both executed
  });
});

/* ─────────────────── 4. the run-level pilot (probe wire #31) ─────────────────── */

describe("runScenario under a frozen play-era — the 31st wire", () => {
  const wireId = "the-not-invented-yet";

  it("eraless (the shipped default): won, and the report grows NO era key", () => {
    const report = runScenario(shippedScenario(wireId), BASE_SEED, {});
    expect(report.outcome).toBe("won");
    expect(report).not.toHaveProperty("era");
  });

  it("every OTHER shipped wire never grows the era key eraless (sparse-key law, 30 siblings)", () => {
    for (const id of ["the-long-weekend", "the-change-freeze", "free-tier-flood-mix", "the-covenant"]) {
      expect(runScenario(shippedScenario(id), BASE_SEED, { tickCap: 12 }), id).not.toHaveProperty("era");
    }
  });

  it("1998: the door refuses the cPanel-era placements at the exact tick — lose witness ×5 seed offsets", () => {
    for (const seedOffset of [0, 1, 2, 3, 4]) {
      const report = runScenario(shippedScenario(wireId), BASE_SEED, { seedOffset, eraYear: 1998, eraBundle: SHARED_WEB });
      expect(report.outcome, `@${seedOffset}`).toBe("lost");
      expect(report.stopReason, `@${seedOffset}`).toMatch(/^lose:intents-refused-above:place-device:0@\d+$/);
      expect(report.endMinute, `@${seedOffset}`).toBe(20); // the first gated intent is t20
      expect(report.era).toEqual({ eraYear: 1998, bundleId: "official:shared-web" });
      // the safe kind is NOT collateral damage — by the stop, zero places yet (t20 refused, t30 never reached);
      // the per-verb census carries the refusal under its verb dimension:
      expect(report.observation.intentsRefusedByVerb["place-device"]).toBe(1);
      expect(report.observation.intentsExecutedByVerb["place-device"] ?? 0).toBe(0);
    }
  });

  it("1998 mid-run: the generic kind still PLACES (t30 after the t20 refusal) — never-invents at run scale", () => {
    // The shipped lose line stops the run at the FIRST refusal (t20), so the
    // safe-kind witness needs the ceiling loosened to two: clone the wire,
    // raise the lose count, cap the clock at 40. One refusal stands (t20
    // gated), the safe place still executes at t30, timeout closes the run.
    const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES[wireId])) as Record<string, unknown>;
    (wire.objectives as Record<string, unknown>).lose = [{ kind: "intents-refused-above", verb: "place-device", count: 1 }];
    const report = runScenario(parseScenarioDoc(wire as never), BASE_SEED, { tickCap: 40, eraYear: 1998, eraBundle: SHARED_WEB });
    expect(report.outcome).toBe("timeout");
    expect(report.observation.intentsRefusedByVerb["place-device"]).toBe(1);
    // …while the SAFE placement executed at t30, proving the gate denies only what the line names:
    expect(report.observation.intentsExecutedByVerb["place-device"]).toBe(1);
  });

  it("2026: the allow-all twin is BYTE-IDENTICAL to eraless (identical script, identical folds)", () => {
    const eraless = runScenario(shippedScenario(wireId), BASE_SEED, {});
    const armed = runScenario(shippedScenario(wireId), BASE_SEED, { eraYear: 2026, eraBundle: SHARED_WEB });
    expect(armed.outcome).toBe("won");
    expect(armed.endDigest).toBe(eraless.endDigest);
    expect(armed.endMinute).toBe(eraless.endMinute);
    expect(armed.era).toEqual({ eraYear: 2026, bundleId: "official:shared-web" });
  });

  it("cross-line witness: arming 1998 with the COLO bundle gates nothing this wire touches — byte-stand", () => {
    const eraless = runScenario(shippedScenario(wireId), BASE_SEED, {});
    const armed = runScenario(shippedScenario(wireId), BASE_SEED, { eraYear: 1998, eraBundle: COLO });
    expect(armed.endDigest).toBe(eraless.endDigest); // "shared-web" is unnamed by official:colo
  });

  it("the pairing wall: a bare year invents nothing, a bare line has no world (fail loud, BAD_ERA/BAD_INT)", () => {
    expect(() => runScenario(shippedScenario(wireId), BASE_SEED, { eraYear: 1998 })).toThrow(/BAD_ERA/);
    expect(() => runScenario(shippedScenario(wireId), BASE_SEED, { eraBundle: SHARED_WEB })).toThrow(/BAD_ERA/);
    expect(() => runScenario(shippedScenario(wireId), BASE_SEED, { eraYear: 19.5, eraBundle: SHARED_WEB })).toThrow(/BAD_INT/);
    expect(() => runScenario(shippedScenario(wireId), BASE_SEED, { eraYear: -1, eraBundle: SHARED_WEB })).toThrow(/BAD_INT/);
  });
});

/* ─────────────────── 5. shell era ≠ play era (conflation guard) ─────────────────── */

describe("the two era authorities stay separate (shell cosmetic vs play run-frozen)", () => {
  // Comment-stripped scan (house law-scan pattern, A1 family): the module's
  // OWN docblock deliberately NAMES the shell singleton to forbid it — the
  // pin is about code, not prose.
  const stripComments = (src: string): string => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
  const own = stripComments(readFileSync(join(process.cwd(), "src", "scenario", "eraAvailability.ts"), "utf8"));
  const ownRaw = readFileSync(join(process.cwd(), "src", "scenario", "eraAvailability.ts"), "utf8");
  const runnerSrc = stripComments(readFileSync(join(process.cwd(), "src", "scenario", "runner.ts"), "utf8"));
  const shell = readFileSync(join(process.cwd(), "..", "..", "apps", "proto", "src", "i18n", "eraState.ts"), "utf8");

  it("scenario NEVER imports the shell's reactive era singleton", () => {
    expect(own).not.toMatch(/eraState|getEra\(|apps\/proto/);
    expect(runnerSrc).not.toMatch(/eraState|apps\/proto/);
  });

  it("the SHELL authority is reactive chrome cosmetics (shallowRef); the PLAY authority is RUN-FROZEN config", () => {
    expect(shell).toMatch(/shallowRef/); // eraState.ts is a reactive ref — flip-able chrome (§8.10 skins)
    expect(ownRaw).toMatch(/RUN-FROZEN/); // the docblock law is ON the page, pinned
  });
});
