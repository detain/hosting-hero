/**
 * sessionModel — the pure data leg of the slice-(d) SESSION rail entry.
 *
 * Witnesses: the boot riders parse through the REAL codec (assertToWorker),
 * the shape walls refuse malformed boards with boot.build.* paths, the
 * derived edge-id grammar the runner will mint is pinned as literals the
 * disconnect verbs target, every door-verb record is a COMPLETE flat wire
 * shape (VERB_ARG_SHAPES law: a missing key is a throw, not a default), and
 * the money/board readers obey the value-type law (fixed bigint → display,
 * metered number → as-is, text/absent → null).
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { asEntityId, observedKey } from "@hh/sim-core/types";
import {
  assertToWorker,
  fixedToDisplay,
  ProtocolError,
  type EventNotice,
  type SimProjection,
} from "../../shared/protocol";
import {
  SESSION_BUILD,
  SESSION_CORPUS,
  SESSION_EDGE_IDS,
  SESSION_ID,
  SESSION_SEED,
  SESSION_DOOR_VERBS,
  byCodeUnit,
  entryAttributionSum,
  outcomeAttributionSum,
  parseMoneyTape,
  parseReceipts,
  parseRuleFires,
  readBoardHealth,
  type BoardNodeView,
  type MoneyTapeRow,
} from "../sessionModel";

function sessionBootMessage(extra?: Record<string, unknown>) {
  return {
    kind: "boot",
    protocol: 1,
    seed: SESSION_SEED,
    speedX: 1,
    runnerKind: "sim-core",
    corpus: SESSION_CORPUS,
    build: SESSION_BUILD,
    ...extra,
  };
}

describe("session boot riders through the real codec", () => {
  it("the full session envelope parses (corpus + build riders in trusted form)", () => {
    const parsed = assertToWorker(sessionBootMessage());
    if (parsed.kind !== "boot") throw new Error("expected boot");
    expect(parsed.runnerKind).toBe("sim-core");
    expect(parsed.corpus).toEqual({ tableId: "colo", waves: [1, 2, 3, 4, 5] });
    expect(parsed.build?.hands).toBe(3);
    expect(parsed.build?.board).toEqual([
      { relation: "data", from: "edge", to: "waf", slot: null },
      { relation: "control", from: "waf", to: "deep", slot: null },
      { relation: "trust", from: "deep", to: "origin", slot: null },
      { relation: "power", from: "origin", to: "edge", slot: "psu-a" },
    ]);
  });

  it("JSON round-trip (structured-clone boundary) preserves the riders", () => {
    const clone = assertToWorker(JSON.parse(JSON.stringify(sessionBootMessage())));
    if (clone.kind !== "boot") throw new Error("expected boot");
    const direct = assertToWorker(sessionBootMessage());
    if (direct.kind !== "boot") throw new Error("expected boot");
    expect(clone.build).toEqual(direct.build);
    expect(clone.corpus).toEqual(direct.corpus);
  });

  it("shape walls: power loses its slot, data gains one, hands go negative — each refused by path", () => {
    const noSlot = {
      ...sessionBootMessage(),
      build: { hands: 3, board: [{ relation: "power", from: "origin", to: "edge" }] },
    };
    expect(() => assertToWorker(noSlot)).toThrow(ProtocolError);
    expect(() => assertToWorker(noSlot)).toThrow(/board\[0\]\.slot/);
    const badSlot = {
      ...sessionBootMessage(),
      build: { hands: 3, board: [{ relation: "data", from: "edge", to: "waf", slot: "x" }] },
    };
    expect(() => assertToWorker(badSlot)).toThrow(/board\[0\]\.slot/);
    const negHands = { ...sessionBootMessage(), build: { hands: -1 } };
    expect(() => assertToWorker(negHands)).toThrow(/hands/);
  });

  it("the seeded edge ids are the door's derived grammar, and the disconnect verb targets one", () => {
    expect(SESSION_EDGE_IDS).toEqual({
      dataEdgeWaf: "edge:data:edge->waf",
      controlWafDeep: "edge:control:waf->deep",
      trustDeepOrigin: "edge:trust:deep->origin",
      powerOriginEdge: "edge:power:origin->edge:psu-a",
    });
    const disconnect = SESSION_DOOR_VERBS.find((v) => v.id === "disconnect-trust");
    expect(disconnect?.args["edgeId"]).toBe(SESSION_EDGE_IDS.trustDeepOrigin);
    // the connect verb mints an edge that is NOT among the seeded four
    const connect = SESSION_DOOR_VERBS.find((v) => v.id === "connect-deep");
    const minted = `edge:${connect?.args["relation"]}:${connect?.args["from"]}->${connect?.args["to"]}`;
    expect(Object.values(SESSION_EDGE_IDS)).not.toContain(minted);
  });

  it("every door-verb record carries the COMPLETE flat arg set (VERB_ARG_SHAPES law)", () => {
    const required: Record<string, readonly string[]> = {
      communicate: ["verb", "target", "note"],
      "configure-node": ["verb", "nodeId", "inspectionDepth", "shedOrder"],
      "connect-ports": ["verb", "relation", "from", "to", "slot"],
      "disconnect-drain": ["verb", "edgeId"],
    };
    for (const row of SESSION_DOOR_VERBS) {
      const verb = String(row.args["verb"]);
      expect(required[verb], `verb ${verb} in vocab`).toBeDefined();
      expect(Object.keys(row.args).sort()).toEqual([...required[verb]!].sort());
      for (const value of Object.values(row.args)) {
        expect(["string", "number", "boolean", "object"].includes(typeof value) || value === null).toBe(true);
      }
    }
    expect(SESSION_ID).toBe("session");
  });
});

describe("money tape parser (economy-notice rider grammar)", () => {
  const n = (detail?: string, kind: EventNotice["kind"] = "economy-notice", causeId?: string): EventNotice =>
    ({ kind, laneId: null, atUs: 0n, ...(detail !== undefined ? { detail } : {}), ...(causeId !== undefined ? { causeId } : {}) }) as EventNotice;

  it("splits kind on the FIRST colon, keeps colonic contract ids, skips everything else", () => {
    const tape = parseMoneyTape([
      n("invoice-issued:ctr-gold-1"),
      n("sla-credit-due:plan:pro"),
      n(undefined),
      n("no-colon-here"),
      n("whatever:x", "bounce"),
      n("company-dissolved:company", "economy-notice", "economy:death:dissolved:churn-collapse:44"),
    ]);
    const rows: readonly MoneyTapeRow[] = tape.rows;
    expect(rows.map((r) => `${r.kind}/${r.contractId}`)).toEqual([
      "company-dissolved/company",
      "sla-credit-due/plan:pro",
      "invoice-issued/ctr-gold-1",
    ]); // newest-first
    expect(tape.counts).toEqual({ "company-dissolved": 1, "sla-credit-due": 1, "invoice-issued": 1 });
    expect(rows[0]!.causeId).toBe("economy:death:dissolved:churn-collapse:44");
  });

  it("folds across frames (lifetime counts) and caps the row view", () => {
    let tape = parseMoneyTape([n("invoice-issued:ctr-hourly-1"), n("invoice-paid:ctr-hourly-1")]);
    tape = parseMoneyTape([n("invoice-issued:ctr-hourly-1"), n("dunning-stage:ctr-gold-1")], tape);
    expect(tape.counts).toEqual({ "invoice-issued": 2, "invoice-paid": 1, "dunning-stage": 1 });
    expect(tape.rows.map((r) => r.kind)).toEqual(["dunning-stage", "invoice-issued", "invoice-paid", "invoice-issued"]);
    const big = parseMoneyTape(Array.from({ length: 30 }, (_, i) => n(`kind-${i}:c`)), null, 5);
    expect(big.rows).toHaveLength(5);
    expect(Object.keys(big.counts)).toHaveLength(30);
  });
});

describe("board readers", () => {
  type FakeCell = {
    value: bigint | number | string | null;
    fidelity: number;
    freshnessUs: bigint;
    coverage: number;
    certainty: number;
    status: string;
  };
  const cellF = (v: bigint): FakeCell => ({ value: v, fidelity: 1, freshnessUs: 0n, coverage: 1, certainty: 1, status: "known" });
  const cellN = (v: number): FakeCell => ({ value: v, fidelity: 1, freshnessUs: 0n, coverage: 1, certainty: 1, status: "known" });
  const cellT = (v: string): FakeCell => ({ value: v, fidelity: 1, freshnessUs: 0n, coverage: 1, certainty: 1, status: "known" });
  function fakeProjection(entries: ReadonlyMap<string, FakeCell>): SimProjection {
    return { observed: entries } as unknown as SimProjection;
  }

  it("null projection reads an empty board (pre-first-frame posture)", () => {
    expect(readBoardHealth(null)).toEqual([]);
  });

  it("value-type law: fixed → display, number → as-is, text/absent → null", () => {
    const map = new Map<string, FakeCell>([
      [observedKey(asEntityId("edge"), "utilizationRho"), cellF(41286n)], // 0.629974365234375
      [observedKey(asEntityId("edge"), "queueDepth"), cellN(7)],
      [observedKey(asEntityId("edge"), "entryArrivalsTotal"), cellN(12)],
      [observedKey(asEntityId("outcome/unattributed"), "outcomeBouncedTotal"), cellN(3)],
      [observedKey(asEntityId("waf"), "entryArrivalsTotal"), cellT("not a number")],
    ]);
    const rows = readBoardHealth(fakeProjection(map));
    expect(rows).toHaveLength(6); // four nodes + two unattributed buckets
    const edge = rows.find((r) => r.id === "edge")!;
    expect(edge.rho).toBe(fixedToDisplay(41286n));
    expect(edge.rho).toBe(41286 / 65536);
    expect(edge.queueDepth).toBe(7);
    expect(edge.entryArrivalsTotal).toBe(12);
    expect(edge.outcomeServedTotal).toBeNull();
    expect(rows.find((r) => r.id === "waf")!.entryArrivalsTotal).toBeNull(); // text cell refused
    expect(entryAttributionSum(rows)).toBe(12);
    expect(outcomeAttributionSum(rows)).toBe(3);
  });

  it("conservation sums walk every row including both unattributed buckets", () => {
    const row = (id: string, entry: number | null, out: readonly [number | null, number | null, number | null, number | null]): BoardNodeView =>
      ({
        id,
        rho: null,
        queueDepth: null,
        entryArrivalsTotal: entry,
        outcomeServedTotal: out[0],
        outcomeBouncedTotal: out[1],
        outcomeFalsePositiveTotal: out[2],
        outcomeLandedTotal: out[3],
      });
    const rows = [row("edge", 10, [1, 2, 0, 3]), row("waf", 5, [0, 0, 0, 0]), row("deep", 0, [0, 0, 0, 0]), row("origin", 0, [0, 0, 0, 0]), row("entry/unattributed", 2, [null, null, null, null]), row("outcome/unattributed", 0, [null, 4, null, null])];
    expect(entryAttributionSum(rows)).toBe(17);
    expect(outcomeAttributionSum(rows)).toBe(10); // 6 at the front door + 4 outcome-uncertain
  });

  it("byCodeUnit orders display lists under the code-unit law", () => {
    const ids = [{ id: "b" }, { id: "A" }, { id: "a" }].sort(byCodeUnit);
    expect(ids.map((x) => x.id)).toEqual(["A", "a", "b"]); // uppercase before lowercase, byte order
  });
});

describe("receipt + rule tapes", () => {
  const notice = (kind: EventNotice["kind"], detail?: string, causeId?: string): EventNotice =>
    ({ kind, laneId: null, atUs: 0n, ...(detail !== undefined ? { detail } : {}), ...(causeId !== undefined ? { causeId } : {}) }) as EventNotice;

  it("receipts keep only the door kinds, newest-first, capped; rules fall back causeId→kind", () => {
    const receipts = parseReceipts([
      notice("intent-executed", "communicate: estate:page"),
      notice("economy-notice", "invoice-issued:ctr-gold-1"),
      notice("intent-refused"),
      notice("intent-executed", "place-device: node=x"),
    ]);
    expect(receipts.map((r) => `${r.kind}:${r.detail}`)).toEqual([
      "intent-executed:place-device: node=x",
      "intent-refused:intent-refused",
      "intent-executed:communicate: estate:page",
    ]);
    expect(parseReceipts([notice("arrival-surge")])).toEqual([]);
    expect(parseRuleFires([notice("rule-fired", "raise-the-guard", "g7:rule:rg:7:inspect"), notice("bounce")], [], 8)).toEqual(["raise-the-guard"]);
    expect(parseRuleFires([notice("rule-fired", undefined, "g7:rule:x:1:mode")])).toEqual(["g7:rule:x:1:mode"]);
  });
});
