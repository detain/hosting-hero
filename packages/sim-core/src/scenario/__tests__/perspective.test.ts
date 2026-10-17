/** perspective.test.ts — §1.2 perspective levels v0 (L-CP2).
 *
 *  The three laws this suite exists to hold:
 *  1. SPARSE-KEY: an unarmed doc never grows a key — all thirty shipped
 *     wires parse, run, and report byte-stand (the roster loops in
 *     runner.test.ts green UNAIDED are the standing falsifier; the parse
 *     group below re-proves it at the wall).
 *  2. SEEING IS NOT BEING: hide is a report-side projection, never a sim
 *     input — the same seed with and without a hide folds an IDENTICAL
 *     observation and digest (pinned below).
 *  3. THE CEILING IS WRITTEN DOWN: PERSPECTIVE_EXPRESSIBILITY is pinned
 *     EXACTLY, verb by verb — five bannable seams, fourteen
 *     not-coverable-v0 (the canExecute owner wall, ADR-0018 remit).
 */

import { describe, expect, it } from "vitest";
import { asEntityId, asRunSeed, observedKey } from "../../types.ts";
import type { ObservedKey } from "../../types.ts";
import type { IntentDoorConfig } from "../../pipeline/index.ts";
import { encodeTaggedTree } from "../../internal/canonical.ts";
import {
  PERSPECTIVE_BANNABLE_VERBS,
  PERSPECTIVE_EXPRESSIBILITY,
  PERSPECTIVE_IDS,
  PERSPECTIVE_V0,
  SHIPPED_SCENARIO_IDS,
  SHIPPED_SCENARIO_WIRES,
  applyPerspectiveToDoorConfig,
  isCellHidden,
  parseScenarioDoc,
  perspectiveReportFor,
  projectPerspectiveView,
  runScenario,
  shippedScenario,
} from "../index.ts";
import type { PerspectiveSpec, ScenarioPerspectiveReport, ScenarioReport, ScenarioWire } from "../index.ts";

const BASE_SEED = asRunSeed(904n);

/** Wire surgery (the runner.test.ts flip() idiom): deep-clone a shipped
 *  JSON, mount a perspective + rail, re-cross the wall. */
type MutableWire = {
  intents?: Record<string, unknown>[];
  perspective?: unknown;
  limits: Record<string, unknown>;
  objectives?: { win: unknown[]; lose: unknown[] };
};

function reauthored(
  id: string,
  mutate: (wire: MutableWire) => void,
) {
  const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES[id])) as MutableWire;
  mutate(wire);
  return parseScenarioDoc(wire as unknown as ScenarioWire);
}

function reportIdentity(report: ScenarioReport): string {
  return JSON.stringify(
    encodeTaggedTree(report as unknown as Record<string, unknown>, (problem) => {
      throw new Error(`scenario report not canonical: ${String(problem.kind)}`);
    }),
    (_k, v) => (typeof v === "bigint" ? `${String(v)}n` : v),
  );
}

/** bigint-safe plain stringify for sub-report slices (observation/trace). */
function stable(v: unknown): string {
  return JSON.stringify(v, (_k, val) => (typeof val === "bigint" ? `${String(val)}n` : val));
}

/* Minimal forged door queries — every tape the composition hangs ignores
 * its argument (an unconditional ban), and the preserved-validator tests
 * only ever check IDENTITY, never invoke the freeze tape. */
const ANY_QUERY = { args: {}, state: {}, context: { tick: 1n } } as never;

/* ─────────────────────────── 1. the parse wall ─────────────────────────── */

describe("perspective parse wall (§1.2 closed roster on the doc wire)", () => {
  it("every shipped wire parses WITHOUT growing a perspective key", () => {
    for (const id of SHIPPED_SCENARIO_IDS) {
      expect(shippedScenario(id), id).not.toHaveProperty("perspective");
    }
  });

  it("an unknown id is BAD_ENUM and names the whole closed roster", () => {
    let caught: unknown = null;
    try {
      reauthored("the-long-weekend", (w) => {
        w.perspective = { id: "gpu-farm-manager" };
      });
    } catch (err) {
      caught = err;
    }
    const err = caught as { code?: string; message: string };
    expect(err.code).toBe("BAD_ENUM");
    for (const id of PERSPECTIVE_IDS) expect(err.message).toContain(id);
  });

  it("a roster id parses to a frozen {id} row", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "noc-shift" };
    });
    expect(doc.perspective).toEqual({ id: "noc-shift" });
    expect(Object.isFrozen(doc.perspective)).toBe(true);
  });

  it("null is the honest absence — the key never materializes", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = null;
    });
    expect(doc).not.toHaveProperty("perspective");
  });

  it("extra keys on the row are refused (mechanics are the roster's, not the wire's)", () => {
    expect(() =>
      reauthored("the-long-weekend", (w) => {
        w.perspective = { id: "apprentice", handCapacity: 9 };
      }),
    ).toThrowError(/BAD_RECORD/);
  });

  it("a non-string id refuses through the same grammar", () => {
    expect(() =>
      reauthored("the-long-weekend", (w) => {
        w.perspective = { id: 7 };
      }),
    ).toThrowError(/BAD_ENUM/);
  });
});

/* ─────────────────────────── 2. the census ─────────────────────────── */

describe("PERSPECTIVE_EXPRESSIBILITY — the honest ceiling, pinned exactly", () => {
  it("the roster is the five §1.2 exemplars, code-unit sorted", () => {
    expect(PERSPECTIVE_IDS).toEqual([
      "apprentice",
      "datacenter-tech",
      "noc-shift",
      "red-team-friday",
      "support-queue",
    ]);
  });

  it("the bannable set is the five validator-covered verbs", () => {
    expect(PERSPECTIVE_BANNABLE_VERBS).toEqual([
      "place-device",
      "policy-card-commit",
      "adjust-price",
      "sell-offer",
      "negotiate-terms",
    ]);
  });

  /* The whole table, hand-written as the authority's LITERAL (the module
   * derives it; this pin is what forces a future seam to be a DELIBERATE
   * census rewrite, never a quiet drift). "not-coverable-v0" on
   * connect-ports is the doc-wish the NOC Shift and Apprentice rows
   * inherit uncashed — that debt is owned by the canExecute wall. */
  const COVERED_UNBANNED = {
    "place-device": "allowed",
    "policy-card-commit": "allowed",
    "adjust-price": "allowed",
    "sell-offer": "allowed",
    "negotiate-terms": "allowed",
  };
  const NOT_COVERABLE = {
    "connect-ports": "not-coverable-v0",
    "disconnect-drain": "not-coverable-v0",
    "configure-node": "not-coverable-v0",
    "shed-load": "not-coverable-v0",
    communicate: "not-coverable-v0",
    "toggle-speed": "not-coverable-v0",
    "shield-node": "not-coverable-v0",
    "scale-node": "not-coverable-v0",
    "maintain-node": "not-coverable-v0",
    "schedule-window": "not-coverable-v0",
    "isolate-node": "not-coverable-v0",
    "throttle-node": "not-coverable-v0",
    "restart-node": "not-coverable-v0",
    "reclaim-node": "not-coverable-v0",
  };
  const EXPECTED_TABLE: Readonly<Record<string, Record<string, string>>> = {
    apprentice: { ...COVERED_UNBANNED, ...NOT_COVERABLE, "place-device": "banned" },
    "datacenter-tech": { ...COVERED_UNBANNED, ...NOT_COVERABLE, "policy-card-commit": "banned" },
    "noc-shift": { ...COVERED_UNBANNED, ...NOT_COVERABLE, "place-device": "banned" },
    "red-team-friday": { ...COVERED_UNBANNED, ...NOT_COVERABLE },
    "support-queue": { ...COVERED_UNBANNED, ...NOT_COVERABLE, "place-device": "banned", "policy-card-commit": "banned", "adjust-price": "banned", "sell-offer": "banned", "negotiate-terms": "banned" },
  };

  it("every roster row × every verb reads exactly the pinned fate table", () => {
    expect(PERSPECTIVE_EXPRESSIBILITY).toEqual(EXPECTED_TABLE);
  });

  it("the census agrees with its rows (banned ⇔ tape authored)", () => {
    for (const id of PERSPECTIVE_IDS) {
      const spec = PERSPECTIVE_V0[id];
      const banned = Object.entries(PERSPECTIVE_EXPRESSIBILITY[id])
        .filter(([, fate]) => fate === "banned")
        .map(([verb]) => verb);
      const wanted: string[] = [...spec.refuse.verbs];
      if (!spec.lookupPolicyCards) wanted.push("policy-card-commit");
      expect(banned.sort(), id).toEqual([...wanted].sort());
    }
  });

  it("the module refuses an inexpressible ban by construction (row law, :317-327)", () => {
    // Falsifiable by reading: every authored ban sits inside the covered
    // set, and the census column count is 19 on every row.
    for (const id of PERSPECTIVE_IDS) {
      expect(Object.keys(PERSPECTIVE_EXPRESSIBILITY[id]).length).toBe(19);
    }
  });
});

describe("the roster rows (§1.2 anchors and defaults)", () => {
  it("noc-shift: three hands (the doc's own number), phone taxed, no building", () => {
    const spec = PERSPECTIVE_V0["noc-shift"];
    expect(spec.specLine).toBe(1262);
    expect(spec.handCapacity).toBe(3);
    expect(spec.attentionCostOverride).toEqual({ communicate: 1 });
    expect([...spec.refuse.verbs]).toEqual(["place-device"]);
    expect(spec.lookupPolicyCards).toBe(true);
  });

  it("datacenter-tech: upstairs telemetry out of sight, book closed", () => {
    const spec = PERSPECTIVE_V0["datacenter-tech"];
    expect(spec.specLine).toBe(1320);
    expect([...spec.hide]).toEqual(["company::"]);
    expect(spec.refuse.verbs.length).toBe(0);
    expect(spec.lookupPolicyCards).toBe(false);
    expect(spec).not.toHaveProperty("goalInversion");
  });

  it("support-queue: everything hidden except the complaint stream, Diagnose-only bans", () => {
    const spec = PERSPECTIVE_V0["support-queue"];
    expect([...spec.hide]).toEqual(["*"]);
    expect([...spec.show]).toEqual(["company::", "support", "ticket", "queue"]);
    expect([...spec.refuse.verbs]).toEqual([
      "place-device",
      "adjust-price",
      "sell-offer",
      "negotiate-terms",
    ]);
    expect(spec.lookupPolicyCards).toBe(false);
  });

  it("apprentice: cannot act, book open (the one fully-served card wish)", () => {
    const spec = PERSPECTIVE_V0["apprentice"];
    expect(spec.specLine).toBe(1474);
    expect([...spec.refuse.verbs]).toEqual(["place-device"]);
    expect(spec.lookupPolicyCards).toBe(true);
    expect(spec.hide.length).toBe(0);
  });

  it("red-team-friday: zero mechanics, goalInversion metadata only", () => {
    const spec = PERSPECTIVE_V0["red-team-friday"];
    expect(spec.hide.length).toBe(0);
    expect(spec.show.length).toBe(0);
    expect(spec.refuse.verbs.length).toBe(0);
    expect(spec.lookupPolicyCards).toBe(true);
    expect(spec).not.toHaveProperty("handCapacity");
    expect(spec).not.toHaveProperty("attentionCostOverride");
    expect(spec.goalInversion).toContain("goal node inverted");
  });

  it("every shipped row is deep-frozen data", () => {
    for (const id of PERSPECTIVE_IDS) {
      const spec = PERSPECTIVE_V0[id];
      expect(Object.isFrozen(spec), id).toBe(true);
      expect(Object.isFrozen(spec.refuse), id).toBe(true);
      expect(Object.isFrozen(spec.refuse.verbs), id).toBe(true);
      expect(Object.isFrozen(spec.hide), id).toBe(true);
      expect(Object.isFrozen(spec.show), id).toBe(true);
    }
  });
});

/* ─────────────────────── 3. the door composition ─────────────────────── */

describe("applyPerspectiveToDoorConfig — the freeze-row composition", () => {
  const bare = Object.freeze({ handCapacity: 2 });

  it("unbanned seams ride through untouched (identity-pinned prior validator)", () => {
    const prior = Object.freeze({
      ...bare,
      canPlaceDevice: () => null,
      canAdjustPrice: () => null,
    });
    const composed = applyPerspectiveToDoorConfig(prior, PERSPECTIVE_V0["datacenter-tech"]);
    expect(composed.canPlaceDevice).toBe(prior.canPlaceDevice);
    expect(composed.canAdjustPrice).toBe(prior.canAdjustPrice);
    expect(composed.handCapacity).toBe(2);
  });

  it("a banned verb's tape is unconditional — it subsumes a freeze band", () => {
    const frozen = Object.freeze({
      ...bare,
      canPlaceDevice: (q: { context: { tick: bigint } }) =>
        q.context.tick <= 10n ? { reason: "change-freeze" } : null,
    });
    const composed = applyPerspectiveToDoorConfig(frozen, PERSPECTIVE_V0["noc-shift"]);
    expect(composed.canPlaceDevice).not.toBe(frozen.canPlaceDevice);
    // OUTSIDE the freeze band the prior validator would have said null:
    expect(composed.canPlaceDevice?.(ANY_QUERY)).toEqual({ reason: "perspective-forbids" });
  });

  it("noc-shift: three hands at the door fallback + the phone pays attention", () => {
    const composed = applyPerspectiveToDoorConfig(bare, PERSPECTIVE_V0["noc-shift"]);
    expect(composed.handCapacity).toBe(3);
    expect(composed.attentionCost).toEqual({ communicate: 1 });
    expect(composed.canPlaceDevice?.(ANY_QUERY)).toEqual({ reason: "perspective-forbids" });
  });

  it("the tax MERGES — the doc's own attention costs survive, the seat wins named keys", () => {
    const taxed = Object.freeze({
      ...bare,
      attentionCost: Object.freeze({ communicate: 0 as const, "shed-load": 1 as const }),
    });
    const composed = applyPerspectiveToDoorConfig(taxed, PERSPECTIVE_V0["noc-shift"]);
    expect(composed.attentionCost).toEqual({ communicate: 1, "shed-load": 1 });
  });

  it("lookupPolicyCards false strips ANY host book to () => null (door grammar: unknown-card-hash)", () => {
    const hostBook = Object.freeze({
      ...bare,
      lookupPolicyCard: () => ({ id: "card-1" }),
    }) as unknown as IntentDoorConfig;
    const composed = applyPerspectiveToDoorConfig(hostBook, PERSPECTIVE_V0["datacenter-tech"]);
    expect(composed.lookupPolicyCard?.("any-hash")).toBeNull();
    // The untouched host config keeps its book:
    expect(applyPerspectiveToDoorConfig(hostBook, PERSPECTIVE_V0["apprentice"]).lookupPolicyCard)
      .toBe(hostBook.lookupPolicyCard);
  });

  it("support-queue tapes all four covered validator seams", () => {
    const composed = applyPerspectiveToDoorConfig(bare, PERSPECTIVE_V0["support-queue"]);
    for (const validator of [
      composed.canPlaceDevice,
      composed.canAdjustPrice,
      composed.canSellOffer,
      composed.canNegotiateTerms,
    ]) {
      expect(validator?.(ANY_QUERY)).toEqual({ reason: "perspective-forbids" });
    }
  });

  it("the composed config is frozen", () => {
    expect(Object.isFrozen(applyPerspectiveToDoorConfig(bare, PERSPECTIVE_V0["apprentice"]))).toBe(true);
  });
});

/* ── helpers ── */
const key = (entity: string, property: string) => observedKey(asEntityId(entity), property);

/* ─────────────────────────── 4. the sight ─────────────────────────── */

describe("the sight grammar (hide/show over the `entity::property` law)", () => {
  const hideAll = ["*"];
  const complaints = ["company::", "support", "ticket", "queue"];

  it("'*' hides the board; the exemption list reveals queue-denominated cells", () => {
    expect(isCellHidden(key("node/edge", "health"), hideAll, complaints)).toBe(true);
    expect(isCellHidden(key("lane/ingress-1", "ratePerMin"), hideAll, complaints)).toBe(true);
    expect(isCellHidden(key("lane/ingress-1", "queueDepth"), hideAll, complaints)).toBe(false);
    expect(isCellHidden(key("company", "reputation"), hideAll, complaints)).toBe(false);
    expect(isCellHidden(key("support", "openTickets"), hideAll, complaints)).toBe(false);
  });

  it("a namespace hide matches the entity segment as a key prefix", () => {
    expect(isCellHidden(key("company", "mrrMicroUsd"), ["company::"], [])).toBe(true);
    expect(isCellHidden(key("lane/ingress-1", "ratePerMin"), ["company::"], [])).toBe(false);
  });

  it("an empty hide never hides", () => {
    expect(isCellHidden(key("node/edge", "health"), [], [])).toBe(false);
  });

  it("a key without the separator degrades to entity-only matching", () => {
    expect(isCellHidden("bare-thing" as ObservedKey, ["bare"], [])).toBe(true);
    expect(isCellHidden("bare-thing" as ObservedKey, ["lanes"], [])).toBe(false);
  });

  it("projectPerspectiveView splits the census sorted code-unit, input untouched", () => {
    const view = new Map([
      [key("node/origin", "health"), {}],
      [key("company", "reputation"), {}],
      [key("lane/ingress-1", "queueDepth"), {}],
      [key("edge/rack-7", "temperature"), {}],
    ]);
    const projection = projectPerspectiveView(view, hideAll, complaints);
    expect(projection.visibleKeys).toEqual(["company::reputation", "lane/ingress-1::queueDepth"]);
    expect(projection.hiddenKeys).toEqual(["edge/rack-7::temperature", "node/origin::health"]);
    expect(view.size).toBe(4);
  });
});

/* ─────────────────────── 5. LIVE witnesses (Long Weekend) ─────────────────────── */

/* The rails speak three vocab verbs (door-shaped args per doc.ts
 * SCENARIO_INTENT_ARG_SHAPES): communicate routes a ticket, place-device
 * tries to build web-new-1, policy-card-commit names a hash. Cheap ticks,
 * tickCap-shortened runs; the win/lose clocks never matter here — the
 * refusal/executed censuses are the instruments. */
function rail(verb: string, args: Record<string, unknown>, ticks: number[]): Record<string, unknown>[] {
  return ticks.map((atTick) => ({ atTick, verb, args }));
}

const WEEKEND_TICK_CAP = 40;

describe("LIVE witnesses — the tapes bite at the door", () => {
  it("communicate on a pool-less state refuses under noc-shift (rung-6 law, reused)", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "noc-shift" };
      w.intents = rail("communicate", { target: null, note: "escalate-page-1" }, [5, 7, 9]);
    });
    const report = runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(report.observation.intentsExecutedByVerb?.communicate ?? 0).toBe(0);
    expect(report.observation.intentsRefusedByVerb?.communicate ?? 0).toBe(3);
  });

  it("the same rail executes WITHOUT the seat — the contrast is the witness", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      w.intents = rail("communicate", { target: null, note: "escalate-page-1" }, [5, 7, 9]);
    });
    const report = runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(report.observation.intentsExecutedByVerb?.communicate ?? 0).toBe(3);
    expect(report.observation.intentsRefusedByVerb?.communicate ?? 0).toBe(0);
  });

  it("place-device refuses under apprentice and executes unseated", () => {
    const args = { nodeId: "web-new-1", deviceKind: "web", template: null };
    const seated = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "apprentice" };
      w.intents = rail("place-device", args, [6]);
    });
    const report = runScenario(seated, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(report.observation.intentsRefusedByVerb?.["place-device"] ?? 0).toBe(1);
    expect(report.observation.intentsExecutedByVerb?.["place-device"] ?? 0).toBe(0);

    const unseated = reauthored("the-long-weekend", (w) => {
      w.intents = rail("place-device", args, [6]);
    });
    const baseline = runScenario(unseated, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(baseline.observation.intentsExecutedByVerb?.["place-device"] ?? 0).toBe(1);
  });

  it("support-queue tapes place + price on one rail (four covered verbs, two shown)", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "support-queue" };
      w.intents = [
        ...rail("place-device", { nodeId: "web-new-1", deviceKind: "web", template: null }, [6]),
        ...rail("adjust-price", { targetKind: "plan", targetId: "basic", newPriceMicroUsd: "5000000", effectiveAtBusinessMinute: null }, [8]),
      ];
    });
    const report = runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(report.observation.intentsRefusedByVerb?.["place-device"] ?? 0).toBe(1);
    expect(report.observation.intentsRefusedByVerb?.["adjust-price"] ?? 0).toBe(1);
    expect(report.observation.intentsRefused).toBe(2);
    expect(report.observation.intentsExecuted).toBe(0);
  });

  it("noc-shift's three hands are a MINT fact — the seated digest moves", () => {
    const seated = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "noc-shift" };
    });
    const unseated = shippedScenario("the-long-weekend");
    const a = runScenario(seated, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    const b = runScenario(unseated, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(a.endDigest).not.toBe(b.endDigest);
  });

  it("red-team-friday is ZERO mechanics — the run matches the unseated baseline exactly", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "red-team-friday" };
    });
    const seated = runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    const baseline = runScenario(shippedScenario("the-long-weekend"), BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(seated.endDigest).toBe(baseline.endDigest);
    expect(stable(seated.observation)).toBe(stable(baseline.observation));
    expect(seated.perspective?.goalInversion).toContain("goal node inverted");
  });

  it("goal inversion as doc DATA: flipped objectives on a red-team re-author play inverted", () => {
    // The attacker's doc: the SAME board and traffic, the defender's calm
    // becomes the failure — "survive 5 clean minutes" is what the red seat
    // must PREVENT, so its win column reads the bounce census the weekend
    // never produces. Zero mechanics moved: this proves only that the
    // perspective id labels a data rewrite, nothing else.
    const inverted = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "red-team-friday" };
      w.objectives = {
        win: [{ kind: "bounces-above", count: 50 }],
        lose: [{ kind: "survive-minutes", minutes: 38 }],
      };
    });
    const report = runScenario(inverted, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(report.outcome).toBe("lost"); // the calm weekend defeats the attacker's win
  });
});

/* ─────────────────── 6. seeing is not being (whole truth) ─────────────────── */

describe("the observation stays whole truth under every seat", () => {
  it("a hide-only seat (no rail, no hand override) folds an IDENTICAL run — sight never reaches the sim", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "datacenter-tech" }; // hides company::, closes the (unwired) book
    });
    const seated = runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    const baseline = runScenario(shippedScenario("the-long-weekend"), BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(seated.endDigest).toBe(baseline.endDigest);
    expect(stable(seated.observation)).toBe(stable(baseline.observation));
    expect(stable(seated.trace)).toBe(stable(baseline.trace));
    // …while the report DOES record the seat's blindness:
    expect(seated.perspective?.hide).toEqual(["company::"]);
  });

  it("the report carries perspective ONLY on armed docs (sparse-key law)", () => {
    const baseline = runScenario(shippedScenario("the-long-weekend"), BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(baseline).not.toHaveProperty("perspective");
    for (const id of SHIPPED_SCENARIO_IDS) {
      expect(shippedScenario(id), id).not.toHaveProperty("perspective");
    }
  });

  it("a supplied view projects into the report (hidden cells named; the sim unchanged)", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "support-queue" };
    });
    const view = new Map([
      [key("node/origin", "health"), {}],
      [key("company", "reputation"), {}],
      [key("lane/ingress-1", "queueDepth"), {}],
    ]);
    const report = runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP, perspectiveView: view });
    expect(report.perspective?.hiddenCells).toEqual(["node/origin::health"]);
    expect(report.perspective?.visibleCells).toEqual(["company::reputation", "lane/ingress-1::queueDepth"]);
  });

  it("without a supplied view the projection keys never materialize", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "support-queue" };
    });
    const report = runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(report.perspective).not.toHaveProperty("hiddenCells");
    expect(report.perspective).not.toHaveProperty("visibleCells");
    expect([...(report.perspective as ScenarioPerspectiveReport).bannedVerbs]).toEqual([
      "place-device",
      "policy-card-commit",
      "adjust-price",
      "sell-offer",
      "negotiate-terms",
    ]);
  });

  it("perspectiveReportFor on a hide-empty seat reads {} ban set for red-team", () => {
    const report = perspectiveReportFor(PERSPECTIVE_V0["red-team-friday"] as PerspectiveSpec);
    expect(report.bannedVerbs.length).toBe(0);
    expect(report.hide.length).toBe(0);
    expect(report.goalInversion).toBeDefined();
  });
});

/* ─────────────────────── 7. determinism twin ─────────────────────── */

describe("determinism", () => {
  it("a perspective-fed run is byte-identical across fresh runners (×2)", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "support-queue" };
      w.intents = [
        ...rail("communicate", { target: null, note: "blind-ticket" }, [5, 7, 9]),
        ...rail("place-device", { nodeId: "web-new-1", deviceKind: "web", template: null }, [6]),
      ];
    });
    const a = reportIdentity(runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP }));
    const b = reportIdentity(runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP }));
    expect(a).toBe(b);
  });
});
