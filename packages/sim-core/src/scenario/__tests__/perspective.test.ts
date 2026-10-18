/** perspective.test.ts — §1.2 perspective levels at FULL POWER (L-CP2 → L-PERS).
 *
 *  The three laws this suite exists to hold:
 *  1. SPARSE-KEY: an unarmed doc never grows a key — all thirty shipped
 *     wires parse, run, and report byte-stand (the roster loops in
 *     runner.test.ts green UNAIDED are the standing falsifier; the parse
 *     group below re-proves it at the wall).
 *  2. SEEING IS NOT BEING: hide is a report-side projection, never a sim
 *     input — the same seed with and without a hide folds an IDENTICAL
 *     observation and digest (pinned below). A ban changes the sim only
 *     when the rail feeds it; a seat at rest consults nothing.
 *  3. FULL POWER IS WRITTEN DOWN: PERSPECTIVE_EXPRESSIBILITY is pinned
 *     EXACTLY, verb by verb — nineteen of nineteen bannable through the
 *     door's general canExecute gate (ADR-0019 program 1 · L-CE), every
 *     cell a decision, no cell a ceiling. The v0 arm "not-coverable-v0"
 *     is retired with the wall that caused it; a door-level sweep proves
 *     every verb actually REFUSES pre-payment through the composed gate,
 *     and the roster rows carry the doc's COMPLETE ban readings.
 */

import { describe, expect, it } from "vitest";
import { PLAYER_VERBS, PlayerVerb, asEntityId, asRunSeed, observedKey } from "../../types.ts";
import type { ExternalIntent, GameState, ObservedKey, TickContext } from "../../types.ts";
import type { ExecuteQuery, IntentDoorConfig } from "../../pipeline/index.ts";
import { applyIntentDoor, createBoardState, createInitialState } from "../../pipeline/index.ts";
import { MICROS_PER_MIN, initialClocks } from "../../kernel/time.ts";
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

/* Minimal forged door queries — the composed gate reads ONLY verb + carrier
 * from its query; the chained-host tests check delegation, never state. */
function queryFor(verb: string, carrier: string | null = null): ExecuteQuery {
  return { verb, args: {}, carrier, state: {}, context: { tick: 1n } } as unknown as ExecuteQuery;
}

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

describe("PERSPECTIVE_EXPRESSIBILITY — full power, pinned exactly", () => {
  it("the roster is the five §1.2 exemplars, code-unit sorted", () => {
    expect(PERSPECTIVE_IDS).toEqual([
      "apprentice",
      "datacenter-tech",
      "noc-shift",
      "red-team-friday",
      "support-queue",
    ]);
  });

  /* THE L-CE LIFT: the bannable rail IS the door rail. This pin is the
   * falsifier for door growth — when a 20th verb lands in PLAYER_VERBS,
   * the perspective side must be a DELIBERATE reading (which seats refuse
   * it), never a silent 19-cell assumption. */
  it("the bannable set is the WHOLE door rail — nineteen verbs, PLAYER_VERBS order", () => {
    expect(PERSPECTIVE_BANNABLE_VERBS).toEqual([
      "place-device",
      "connect-ports",
      "disconnect-drain",
      "configure-node",
      "policy-card-commit",
      "shed-load",
      "communicate",
      "toggle-speed",
      "adjust-price",
      "shield-node",
      "scale-node",
      "maintain-node",
      "schedule-window",
      "sell-offer",
      "negotiate-terms",
      "isolate-node",
      "throttle-node",
      "restart-node",
      "reclaim-node",
    ]);
    expect(PERSPECTIVE_BANNABLE_VERBS).toEqual([...PLAYER_VERBS]);
  });

  /* The whole table, hand-written as the authority's LITERAL (the module
   * derives it; this pin is what forces a future retune to be a
   * DELIBERATE census rewrite, never a quiet drift). POST-L-PERS
   * SEMANTICS: every cell is a decision — "banned" where the row's
   * ban-list names the verb, "allowed" where it holds. The v0 table's
   * fourteen "not-coverable-v0" cells (the canExecute ceiling, ADR-0018
   * remit) are gone because the wall is BUILT: the NOC Shift's no-Connect
   * wish, the Datacenter Tech's no-Observe law, and the Support Queue's
   * Diagnose-only sentence are all CASHED bans now. */
  const ALL_ALLOWED: Record<string, string> = Object.fromEntries(
    PLAYER_VERBS.map((verb) => [verb, "allowed"]),
  );
  const EXPECTED_TABLE: Readonly<Record<string, Record<string, string>>> = {
    apprentice: {
      ...ALL_ALLOWED,
      "place-device": "banned",
      "connect-ports": "banned",
      "disconnect-drain": "banned",
      "configure-node": "banned",
      "shed-load": "banned",
      "adjust-price": "banned",
      "shield-node": "banned",
      "scale-node": "banned",
      "maintain-node": "banned",
      "schedule-window": "banned",
      "sell-offer": "banned",
      "negotiate-terms": "banned",
      "isolate-node": "banned",
      "throttle-node": "banned",
      "restart-node": "banned",
      "reclaim-node": "banned",
    },
    "datacenter-tech": {
      ...ALL_ALLOWED,
      "configure-node": "banned",
      "policy-card-commit": "banned",
      "shed-load": "banned",
      communicate: "banned",
      "adjust-price": "banned",
      "shield-node": "banned",
      "scale-node": "banned",
      "maintain-node": "banned",
      "schedule-window": "banned",
      "sell-offer": "banned",
      "negotiate-terms": "banned",
      "isolate-node": "banned",
      "throttle-node": "banned",
      "restart-node": "banned",
      "reclaim-node": "banned",
    },
    "noc-shift": {
      ...ALL_ALLOWED,
      "place-device": "banned",
      "connect-ports": "banned",
      "disconnect-drain": "banned",
    },
    "red-team-friday": { ...ALL_ALLOWED },
    "support-queue": {
      ...ALL_ALLOWED,
      "place-device": "banned",
      "connect-ports": "banned",
      "disconnect-drain": "banned",
      "configure-node": "banned",
      "policy-card-commit": "banned",
      "shed-load": "banned",
      "adjust-price": "banned",
      "shield-node": "banned",
      "scale-node": "banned",
      "maintain-node": "banned",
      "schedule-window": "banned",
      "sell-offer": "banned",
      "negotiate-terms": "banned",
      "isolate-node": "banned",
      "throttle-node": "banned",
      "restart-node": "banned",
      "reclaim-node": "banned",
    },
  };

  it("every roster row × every verb reads exactly the pinned fate table", () => {
    expect(PERSPECTIVE_EXPRESSIBILITY).toEqual(EXPECTED_TABLE);
  });

  it("no cell is a ceiling — every fate is an actionable decision", () => {
    const seen = new Set<string>();
    for (const id of PERSPECTIVE_IDS) {
      for (const verb of PLAYER_VERBS) {
        const fate = PERSPECTIVE_EXPRESSIBILITY[id][verb];
        if (fate === undefined) throw new Error(`census missing cell ${id}:${verb}`);
        seen.add(fate);
      }
    }
    expect([...seen].sort()).toEqual(["allowed", "banned"]);
  });

  it("the census agrees with its rows (banned ⇔ the row NAMED the ban)", () => {
    for (const id of PERSPECTIVE_IDS) {
      const spec = PERSPECTIVE_V0[id];
      const banned = Object.entries(PERSPECTIVE_EXPRESSIBILITY[id])
        .filter(([, fate]) => fate === "banned")
        .map(([verb]) => verb);
      // Post-L-PERS the census has ONE authority: the named ban list. The
      // book strip is a SEPARATE sight axis and must NOT leak in — a row
      // that hides the book but does not name policy-card-commit reads
      // "allowed" here (support-queue/datacenter name it; they hide it too).
      expect(banned.sort(), id).toEqual([...spec.refuse.verbs].sort());
    }
  });

  it("the module asserts ban-on-rail by construction (row law, module init)", () => {
    // Falsifiable by reading: every authored ban sits inside the rail, and
    // the census column count is 19 on every row. A forged off-rail slug
    // throws at import (PERSPECTIVE_UNEXPRESSIBLE names ADR-0019 program 1).
    for (const id of PERSPECTIVE_IDS) {
      expect(Object.keys(PERSPECTIVE_EXPRESSIBILITY[id]).length).toBe(19);
      for (const verb of PERSPECTIVE_V0[id].refuse.verbs) {
        expect(PLAYER_VERBS, `${id}:${verb}`).toContain(verb);
      }
    }
  });
});

describe("the roster rows (§1.2 anchors and spec-complete ban sets)", () => {
  it("noc-shift: no Place/Connect family, three hands, phone taxed-not-banned", () => {
    const spec = PERSPECTIVE_V0["noc-shift"];
    expect(spec.specLine).toBe(1266);
    expect(spec.handCapacity).toBe(3);
    expect(spec.attentionCostOverride).toEqual({ communicate: 1 });
    // :1209 "no Place/Connect" + :1267 "no building allowed, only triage" —
    // the family (§1.9 :4990 "add a node, draw a link") is place/connect/
    // disconnect. communicate stays a TAX (the purest variant's phone
    // :1271-1272 is escalation friction, not a prohibition); shed-load
    // stays: Triage is the dominant verb, never a ban.
    expect([...spec.refuse.verbs]).toEqual([
      "place-device",
      "connect-ports",
      "disconnect-drain",
    ]);
    expect(spec.lookupPolicyCards).toBe(true);
  });

  it("datacenter-tech: Place/Connect only, no Observe — the whole outside world banned", () => {
    const spec = PERSPECTIVE_V0["datacenter-tech"];
    expect(spec.specLine).toBe(1324);
    expect([...spec.hide]).toEqual(["company::"]);
    // :1211 "Place/Connect only, no Observe (you're *told* what to do)" —
    // fifteen bans: everything outside the family, incl. the named no-
    // Observe (configure-node) and the upstairs-down law's communicate
    // (:1327-1328 instructions ARRIVE, this seat never sends). Allowed
    // remainder: place/connect/disconnect + the advisory clock dial.
    expect([...spec.refuse.verbs]).toEqual([
      "configure-node",
      "policy-card-commit",
      "shed-load",
      "communicate",
      "adjust-price",
      "shield-node",
      "scale-node",
      "maintain-node",
      "schedule-window",
      "sell-offer",
      "negotiate-terms",
      "isolate-node",
      "throttle-node",
      "restart-node",
      "reclaim-node",
    ]);
    expect(spec.lookupPolicyCards).toBe(false);
  });

  it("support-queue: Diagnose-only with the board hidden — complete at seventeen bans", () => {
    const spec = PERSPECTIVE_V0["support-queue"];
    expect([...spec.hide]).toEqual(["*"]);
    expect([...spec.show]).toEqual(["company::", "support", "ticket", "queue"]);
    // :1212 "Diagnose-only, with the board hidden" + :1379 "infer the
    // outage from customer complaints and dispatch fixes blind" — the seat
    // keeps the complaint stream (sight) and DISPATCH (communicate); every
    // verb that touches the board, the price book, or the world is banned.
    // v0 ate thirteen of these as not-coverable debt; full power pays it.
    expect([...spec.refuse.verbs]).toEqual([
      "place-device",
      "connect-ports",
      "disconnect-drain",
      "configure-node",
      "policy-card-commit",
      "shed-load",
      "adjust-price",
      "shield-node",
      "scale-node",
      "maintain-node",
      "schedule-window",
      "sell-offer",
      "negotiate-terms",
      "isolate-node",
      "throttle-node",
      "restart-node",
      "reclaim-node",
    ]);
    expect(spec.lookupPolicyCards).toBe(false);
  });

  it("apprentice: 'author policy and nothing else' — sixteen bans, one authoring verb lives", () => {
    const spec = PERSPECTIVE_V0["apprentice"];
    expect(spec.specLine).toBe(1478);
    // :1214 "Tune-only (you may author policy and nothing else)" glossed by
    // :1478 "(you may only write rules)" and :1479 "You cannot act. You can
    // only author policies… and an AI junior executes them". "And nothing
    // else" + "cannot act" ban the world-touching rail COMPLETELY, the
    // business dials included (v0 kept them allowed on a slider-reading of
    // Tune; the doc's own narrowing gloss retires that reading now the seam
    // exists to obey it). Allowed: policy-card-commit (the authoring act),
    // communicate (the desk answers — the campaign's apprentice doc
    // dispatches it as legal work; disclosed interpretive reading), the
    // advisory clock dial, and the book OPEN.
    expect([...spec.refuse.verbs]).toEqual([
      "place-device",
      "connect-ports",
      "disconnect-drain",
      "configure-node",
      "shed-load",
      "adjust-price",
      "shield-node",
      "scale-node",
      "maintain-node",
      "schedule-window",
      "sell-offer",
      "negotiate-terms",
      "isolate-node",
      "throttle-node",
      "restart-node",
      "reclaim-node",
    ]);
    expect(spec.lookupPolicyCards).toBe(true);
    expect(spec.hide.length).toBe(0);
  });

  it("red-team-friday: ZERO mechanics, goalInversion metadata only", () => {
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

describe("applyPerspectiveToDoorConfig — the canExecute composition", () => {
  const bare = Object.freeze({ handCapacity: 2 });

  it("a zero-ban row grows NO canExecute key at all — and a host hook rides by identity", () => {
    // red-team-friday's byte-stand law, down to the config SHAPE: with no
    // bans the gate function is never created, so the composed object is
    // the prior plus nothing. Even a host's own canExecute rides THROUGH
    // unwrapped — the perspective does not consult-and-delegate what it
    // does not veto.
    const composed = applyPerspectiveToDoorConfig(bare, PERSPECTIVE_V0["red-team-friday"]);
    expect(composed).not.toHaveProperty("canExecute");
    const hostHook = () => null;
    const withHost = applyPerspectiveToDoorConfig(
      Object.freeze({ ...bare, canExecute: hostHook }),
      PERSPECTIVE_V0["red-team-friday"],
    );
    expect(withHost.canExecute).toBe(hostHook);
  });

  it("the gate answers the host string for banned verbs and DELEGATES for the rest", () => {
    const priorCalls: string[] = [];
    const prior = (q: ExecuteQuery) => {
      priorCalls.push(q.verb);
      return { reason: "host-says-no" };
    };
    const seat: PerspectiveSpec = Object.freeze({
      id: "half-seat",
      name: "Forged Half-Seat",
      specLine: 0,
      hide: Object.freeze([]),
      show: Object.freeze([]),
      refuse: Object.freeze({ verbs: Object.freeze([PlayerVerb.PlaceDevice] as const) }),
      lookupPolicyCards: true,
    });
    const composed = applyPerspectiveToDoorConfig(Object.freeze({ ...bare, canExecute: prior }), seat);
    expect(composed.canExecute?.(queryFor("place-device"))).toEqual({
      reason: `perspective-forbids: "half-seat" does not execute "place-device"`,
    });
    // The seat is the OUTER, last-composed veto: a non-banned query falls
    // THROUGH to the prior hook below, once, with the same query object —
    // no shadowing, no second consultation.
    expect(composed.canExecute?.(queryFor("communicate"))).toEqual({ reason: "host-says-no" });
    expect(priorCalls).toEqual(["communicate"]);
  });

  it("carrier law: a translated Book intent is NOT the seat's own rail", () => {
    const seat: PerspectiveSpec = Object.freeze({
      ...PERSPECTIVE_V0["apprentice"],
      id: "apprentice",
    });
    const composed = applyPerspectiveToDoorConfig(bare, seat);
    // The place-device ban answers the human rail…
    expect(composed.canExecute?.(queryFor("place-device"))?.reason).toContain("perspective-forbids");
    // …but the junior's carrier passes the seat through (the Apprentice
    // thesis: "an AI junior executes them", :1479 — bans on carriers would
    // make authoring-and-delegating unplayable).
    expect(composed.canExecute?.(queryFor("place-device", "place-server"))).toBeNull();
    expect(composed.canExecute?.(queryFor("place-device", "restart-service"))).toBeNull();
  });

  it("a banned verb subsumes a freeze band STRUCTURALLY — the prior validator is never consulted", () => {
    let freezeCalls = 0;
    const frozen = Object.freeze({
      ...bare,
      canPlaceDevice: () => {
        freezeCalls += 1;
        return null;
      },
      canExecute: () => {
        freezeCalls += 1;
        return null;
      },
    });
    const composed = applyPerspectiveToDoorConfig(frozen, PERSPECTIVE_V0["noc-shift"]);
    // The perspective gate is outer: the ban answers first, and neither
    // prior hook runs for the banned verb.
    expect(composed.canExecute?.(queryFor("place-device"))?.reason).toContain("perspective-forbids");
    expect(freezeCalls).toBe(0);
    // …and for a non-banned verb, the prior gate still rides (delegation):
    composed.canExecute?.(queryFor("communicate"));
    expect(freezeCalls).toBe(1);
    // The per-verb seams are NO LONGER composition inputs — the freeze
    // validator passes through BY IDENTITY, untouched:
    expect(composed.canPlaceDevice).toBe(frozen.canPlaceDevice);
  });

  it("noc-shift: three hands at the door fallback + the phone pays attention", () => {
    const composed = applyPerspectiveToDoorConfig(bare, PERSPECTIVE_V0["noc-shift"]);
    expect(composed.handCapacity).toBe(3);
    expect(composed.attentionCost).toEqual({ communicate: 1 });
    expect(composed.canExecute?.(queryFor("connect-ports"))?.reason).toContain("perspective-forbids");
  });

  it("the tax MERGES — the doc's own attention costs survive, the seat wins named keys", () => {
    const taxed = Object.freeze({
      ...bare,
      attentionCost: Object.freeze({ communicate: 0 as const, "shed-load": 1 as const }),
    });
    const composed = applyPerspectiveToDoorConfig(taxed, PERSPECTIVE_V0["noc-shift"]);
    expect(composed.attentionCost).toEqual({ communicate: 1, "shed-load": 1 });
  });

  it("lookupPolicyCards false strips ANY host book to () => null (the SIGHT axis, not a verb ban)", () => {
    const hostBook = Object.freeze({
      ...bare,
      lookupPolicyCard: () => ({ id: "card-1" }),
    }) as unknown as IntentDoorConfig;
    const composed = applyPerspectiveToDoorConfig(hostBook, PERSPECTIVE_V0["datacenter-tech"]);
    expect(composed.lookupPolicyCard?.("any-hash")).toBeNull();
    // The untouched host config keeps its book:
    expect(applyPerspectiveToDoorConfig(hostBook, PERSPECTIVE_V0["apprentice"]).lookupPolicyCard)
      .toBe(hostBook.lookupPolicyCard);
    // …and the strip NEVER fabricates a ban: a row that hides the book but
    // leaves policy-card-commit un-named keeps it "allowed" (commit would
    // then ride the door's own unknown-card-hash grammar on card-bearing
    // hosts — visibility truth, not dominance truth, two different reasons).
    expect(PERSPECTIVE_EXPRESSIBILITY["datacenter-tech"]["policy-card-commit"]).toBe("banned"); // named
    const sightOnly: PerspectiveSpec = Object.freeze({
      ...PERSPECTIVE_V0["red-team-friday"],
      lookupPolicyCards: false,
    });
    const composedSight = applyPerspectiveToDoorConfig(bare, sightOnly);
    expect(composedSight).not.toHaveProperty("canExecute"); // zero bans ⇒ zero gate
    expect(composedSight.lookupPolicyCard?.("hash")).toBeNull();
  });

  it("support-queue's gate bans seventeen verbs on one composed config", () => {
    const composed = applyPerspectiveToDoorConfig(bare, PERSPECTIVE_V0["support-queue"]);
    for (const verb of PLAYER_VERBS) {
      const rejection = composed.canExecute?.(queryFor(verb));
      if (PERSPECTIVE_V0["support-queue"].refuse.verbs.includes(verb)) {
        expect(rejection?.reason, verb).toBe(`perspective-forbids: "support-queue" does not execute "${verb}"`);
      } else {
        expect(rejection, verb).toBeNull(); // communicate + toggle-speed live
      }
    }
  });

  it("the composed config is frozen", () => {
    expect(Object.isFrozen(applyPerspectiveToDoorConfig(bare, PERSPECTIVE_V0["apprentice"]))).toBe(true);
  });
});

/* ─────────────── 3b. the full-power sweep (door level, pre-payment) ─────────────── */

/* L-CE proved the gate BEFORE the money rails at door level; these tests
 * prove the PERSPECTIVE's composed gate inherits that position: a banned
 * verb spends NOTHING — no hand, no occupancy, no attention token — and
 * the refusal reason is the seat's host string. The sweep state runs with
 * TWO free hands at every tick: if payment preceded the ban, the first
 * intent would take a token and the pass would mutate state. State object
 * identity across the whole refused feed is the unpaid witness (L-CE law,
 * reused at perspective level). */

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

function sweepState(handCapacity = 2): GameState {
  return createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "test-perspective-full-power",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [],
    handCapacity,
    board: createBoardState(),
  });
}

const FORGED_ALL_BAN: PerspectiveSpec = Object.freeze({
  id: "forged-seat",
  name: "Forged All-Ban Seat",
  specLine: 0,
  hide: Object.freeze([]),
  show: Object.freeze([]),
  refuse: Object.freeze({ verbs: Object.freeze([...PLAYER_VERBS]) }),
  lookupPolicyCards: true,
});

/* Structurally valid wire args per verb (door VERB_ARG_SHAPES, intent-door
 * .ts:1186-1217 — money legs are bigints at this boundary). The gate refuses
 * before any handler reads them; validity only proves the refusal is the
 * ban's doing, not parse garbage. */
const FORGED_ARGS: Readonly<Record<string, Record<string, unknown>>> = Object.freeze({
  "place-device": { verb: "place-device", nodeId: "web-9", deviceKind: "generic", template: null },
  "connect-ports": { verb: "connect-ports", relation: "data", from: "edge/origin", to: "web-9", slot: null },
  "disconnect-drain": { verb: "disconnect-drain", edgeId: "edge:x" },
  "configure-node": { verb: "configure-node", nodeId: "web-9", inspectionDepth: null, shedOrder: null },
  "policy-card-commit": { verb: "policy-card-commit", cardHash: "hash-1" },
  "shed-load": { verb: "shed-load", nodeId: "web-9", qosClassId: null },
  communicate: { verb: "communicate", target: null, note: "forged" },
  "toggle-speed": { verb: "toggle-speed", speedX: 2 },
  "adjust-price": { verb: "adjust-price", targetKind: "plan", targetId: "basic", newPriceMicroUsd: 5_000_000n, effectiveAtBusinessMinute: null },
  "shield-node": { verb: "shield-node", targetNodeId: "web-9", effectiveAtBusinessMinute: null },
  "scale-node": { verb: "scale-node", targetNodeId: "web-9", reservedSlots: 1, effectiveAtBusinessMinute: null },
  "maintain-node": { verb: "maintain-node", targetNodeId: "web-9", openAtBusinessMinute: null, closeAtBusinessMinute: 60 },
  "schedule-window": { verb: "schedule-window", targetNodeId: "web-9", openAtBusinessMinute: null, closeAtBusinessMinute: 60 },
  "sell-offer": { verb: "sell-offer", targetKind: "plan", targetId: "basic", offerPriceMicroUsd: 2_500_000_000n, termMonths: 12, effectiveAtBusinessMinute: null },
  "negotiate-terms": { verb: "negotiate-terms", targetKind: "contract", targetId: "c01", tone: "fair", concessionMicroUsd: null, termMonthsExtension: null, effectiveAtBusinessMinute: null },
  "isolate-node": { verb: "isolate-node", targetNodeId: "web-9", effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null },
  "throttle-node": { verb: "throttle-node", targetNodeId: "web-9", cutSlots: 1, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null },
  "restart-node": { verb: "restart-node", targetNodeId: "web-9", dropQueued: "keep", effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 60 },
  "reclaim-node": { verb: "reclaim-node", targetNodeId: "web-9", effectiveAtBusinessMinute: null },
});

/** Fail-loud lookup: a missing forged-args entry is a test-authoring bug
 *  (the sweep must speak EVERY rail verb), never a silent skip. */
function argsFor(verb: string): Record<string, unknown> {
  const args = FORGED_ARGS[verb];
  if (args === undefined) throw new Error(`forged args missing for ${verb}`);
  return args;
}

describe("the full-power sweep — nineteen of nineteen refuse pre-payment", () => {
  it("every door verb, banned by the forged seat, refuses with the host string and pays NOTHING", () => {
    const state0 = sweepState();
    let priorCalls = 0;
    const config = applyPerspectiveToDoorConfig(
      Object.freeze({
        handCapacity: 2,
        canExecute: () => {
          priorCalls += 1;
          return null;
        },
      }),
      FORGED_ALL_BAN,
    );
    const feed = PLAYER_VERBS.map((verb, seq) => forgedExt(5n, seq, argsFor(verb))) as unknown as ExternalIntent[];
    const res = applyIntentDoor(state0, ctx(5n), feed, config);
    expect(res.receipts.length).toBe(19);
    for (const receipt of res.receipts) {
      expect(receipt.outcome, receipt.verb).toBe("refused");
      expect(receipt.reason, receipt.verb).toBe(
        `perspective-forbids: "forged-seat" does not execute "${receipt.verb}"`,
      );
    }
    // Thirteen of these fourteen verbs were INEXPRESSIBLE as bans before
    // this lane (v0 ceiling: five validator seams). The sweep proves the
    // previously-unbannable ones land in exactly the same pre-payment
    // refusal position: connect-ports, communicate, reclaim-node by name.
    for (const verb of ["connect-ports", "communicate", "reclaim-node", "throttle-node"]) {
      expect(res.receipts.some((r) => r.verb === verb && r.outcome === "refused"), verb).toBe(true);
    }
    // UNPAID: object identity across an all-refused pass (L-CE structural
    // law) — both hands still free, no occupancy stamps, no events beyond
    // the refusals themselves, and the host hook under the seat NEVER ran.
    expect(res.state).toBe(state0);
    expect(res.events.length).toBe(19);
    expect(priorCalls).toBe(0);
    const freeBefore = (state0.hands?.tokens ?? []).filter((t) => t.busyCauseId === null).length;
    expect(freeBefore).toBe(2);
  });

  it("the ban outranks the attention tax — same verb, one refusal, the perspective's reason", () => {
    const seat: PerspectiveSpec = Object.freeze({
      ...FORGED_ALL_BAN,
      id: "taxed-and-banned",
      refuse: Object.freeze({ verbs: Object.freeze([PlayerVerb.Communicate] as const) }),
      attentionCostOverride: Object.freeze({ communicate: 1 as const }),
    });
    const state0 = sweepState(1);
    const config = applyPerspectiveToDoorConfig(Object.freeze({ handCapacity: 1 }), seat);
    const res = applyIntentDoor(state0, ctx(5n), [forgedExt(5n, 0, argsFor("communicate"))] as unknown as ExternalIntent[], config);
    // No attention pool exists on this state — if the TAX had run first the
    // reason would be the door's `attention-debt` phrase. It is not: the
    // BAN fired at the gate, before both payment legs.
    expect(res.receipts[0]?.reason).toBe(
      `perspective-forbids: "taxed-and-banned" does not execute "communicate"`,
    );
    expect(res.state).toBe(state0);
  });

  it("absent ban = the seat composes nothing it does not veto — prior host gate rules alone", () => {
    const state0 = sweepState();
    const config = applyPerspectiveToDoorConfig(
      Object.freeze({ handCapacity: 2, canExecute: () => ({ reason: "host-only-veto" }) }),
      PERSPECTIVE_V0["red-team-friday"],
    );
    const res = applyIntentDoor(state0, ctx(5n), [forgedExt(5n, 0, argsFor("communicate"))] as unknown as ExternalIntent[], config);
    expect(res.receipts[0]?.reason).toBe("host-only-veto");
    expect(res.state).toBe(state0);
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

/* The rails speak rail verbs (door-shaped args per doc.ts
 * SCENARIO_INTENT_ARG_SHAPES): communicate routes a ticket, place-device
 * tries to build web-new-1, connect-ports/canary-shed speak the new
 * full-power arms. Cheap ticks, tickCap-shortened runs; the win/lose
 * clocks never matter here — the refusal/executed censuses are the
 * instruments. */
function rail(verb: string, args: Record<string, unknown>, ticks: number[]): Record<string, unknown>[] {
  return ticks.map((atTick) => ({ atTick, verb, args }));
}

const WEEKEND_TICK_CAP = 40;

describe("LIVE witnesses — the gate bites at the door", () => {
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

  it("connect-ports — the v0 inexpressible half of noc-shift's sentence — now refuses live", () => {
    // :1209 "no Place/Connect". v0 could only tape place; Connect was a
    // documented wish ("not-coverable-v0"). Full power: the same rail verb
    // the board would otherwise accept is refused at the gate.
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "noc-shift" };
      w.intents = rail("connect-ports", { relation: "data", from: "lane/ingress-1", to: "edge/origin", slot: null }, [5, 7, 9]);
    });
    const report = runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(report.observation.intentsExecutedByVerb?.["connect-ports"] ?? 0).toBe(0);
    expect(report.observation.intentsRefusedByVerb?.["connect-ports"] ?? 0).toBe(3);
  });

  it("communicate under datacenter-tech refuses live — and executes unseated (contrast)", () => {
    // :1211's "you're *told* what to do and it's wrong" (:1327-1328): the
    // hands-on deck RECEIVES instructions, it does not send them.
    const unseated = runScenario(
      reauthored("the-long-weekend", (w) => {
        w.intents = rail("communicate", { target: null, note: "from-the-cold-aisle" }, [5, 7, 9]);
      }),
      BASE_SEED,
      { tickCap: WEEKEND_TICK_CAP },
    );
    expect(unseated.observation.intentsExecutedByVerb?.communicate ?? 0).toBe(3);
    const seated = runScenario(
      reauthored("the-long-weekend", (w) => {
        w.perspective = { id: "datacenter-tech" };
        w.intents = rail("communicate", { target: null, note: "from-the-cold-aisle" }, [5, 7, 9]);
      }),
      BASE_SEED,
      { tickCap: WEEKEND_TICK_CAP },
    );
    expect(seated.observation.intentsExecutedByVerb?.communicate ?? 0).toBe(0);
    expect(seated.observation.intentsRefusedByVerb?.communicate ?? 0).toBe(3);
  });

  it("the apprentice still ANSWERS: communicate executes under the seat (campaign-consistent reading)", () => {
    // The row keeps communicate LIVE (:1479 author-and-delegate is the seat;
    // the campaign's own apprentice chapter dispatches communicate as legal
    // work). If a future retune bans it, this witness reddens HERE, loudly,
    // in the same commit that must fix chapters.ts — the two apprentice
    // authorities can no longer drift silently.
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "apprentice" };
      w.intents = rail("communicate", { target: null, note: "desk-answer" }, [5, 7, 9]);
    });
    const report = runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(report.observation.intentsExecutedByVerb?.communicate ?? 0).toBe(3);
    expect(report.observation.intentsRefusedByVerb?.communicate ?? 0).toBe(0);
  });

  it("support-queue bans the board, the price, AND the shed on one rail (three shown of seventeen)", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      w.perspective = { id: "support-queue" };
      w.intents = [
        ...rail("place-device", { nodeId: "web-new-1", deviceKind: "web", template: null }, [6]),
        ...rail("adjust-price", { targetKind: "plan", targetId: "basic", newPriceMicroUsd: "5000000", effectiveAtBusinessMinute: null }, [8]),
        ...rail("shed-load", { nodeId: "edge/origin", qosClassId: null }, [10]),
      ];
    });
    const report = runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP });
    expect(report.observation.intentsRefusedByVerb?.["place-device"] ?? 0).toBe(1);
    expect(report.observation.intentsRefusedByVerb?.["adjust-price"] ?? 0).toBe(1);
    expect(report.observation.intentsRefusedByVerb?.["shed-load"] ?? 0).toBe(1);
    expect(report.observation.intentsRefused).toBe(3);
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
  it("a seat with no rail folds an IDENTICAL run — the gate is consulted only on fed intents", () => {
    const doc = reauthored("the-long-weekend", (w) => {
      // datacenter-tech now carries fifteen bans + the book strip, yet at
      // REST it is inert: no intent reaches the door, so no veto fires, so
      // the fold is the baseline fold. Ban-power without rail-feeding is
      // nothing — the same structural reason the sparse-key law holds.
      w.perspective = { id: "datacenter-tech" };
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
    // The complete Diagnose-only sentence, in PLAYER_VERBS rail order:
    expect([...(report.perspective as ScenarioPerspectiveReport).bannedVerbs]).toEqual([
      "place-device",
      "connect-ports",
      "disconnect-drain",
      "configure-node",
      "policy-card-commit",
      "shed-load",
      "adjust-price",
      "shield-node",
      "scale-node",
      "maintain-node",
      "schedule-window",
      "sell-offer",
      "negotiate-terms",
      "isolate-node",
      "throttle-node",
      "restart-node",
      "reclaim-node",
    ]);
  });

  it("perspectiveReportFor on a hide-empty seat reads {} ban set for red-team", () => {
    const report = perspectiveReportFor(PERSPECTIVE_V0["red-team-friday"] as PerspectiveSpec);
    expect(report.bannedVerbs.length).toBe(0);
    expect(report.hide.length).toBe(0);
    expect(report.goalInversion).toBeDefined();
  });

  it("the book strip NEVER leaks into bannedVerbs (the two axes stay distinct)", () => {
    // apprentice keeps the book open AND does not name policy-card-commit:
    // the commit verb is absent from its ban list on purpose. A row that
    // hid the book without naming the verb would report bannedVerbs without
    // it — visibility is not dominance (module header, the axes argument).
    const report = perspectiveReportFor(PERSPECTIVE_V0["apprentice"] as PerspectiveSpec);
    expect(report.bannedVerbs).not.toContain("policy-card-commit");
    expect(report.bannedVerbs.length).toBe(16);
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
        ...rail("reclaim-node", { targetNodeId: "edge/origin", effectiveAtBusinessMinute: null }, [11]),
      ];
    });
    const a = reportIdentity(runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP }));
    const b = reportIdentity(runScenario(doc, BASE_SEED, { tickCap: WEEKEND_TICK_CAP }));
    expect(a).toBe(b);
  });
});
