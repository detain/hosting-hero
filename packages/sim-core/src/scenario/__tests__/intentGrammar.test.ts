/** intentGrammar.test.ts — the channels-ladder drift pin.
 *
 *  The scenario wall (doc.ts SCENARIO_INTENT_ARG_SHAPES) is a MIRROR of the
 *  door's own VERB_ARG_SHAPES (pipeline/intent-door.ts). This test reads the
 *  DOOR's source with node:fs, extracts the authoritative table, and refuses
 *  drift in either direction — field sets, per-field wire types, and the
 *  closed verb roster. If the door's grammar ever changes, this file goes
 *  red before any authored mission can drift.
 *
 *  The second half exercises the wall behaviorally: every verb parses with
 *  a minimal honest wire, and each door-throw shape (missing field, wrong
 *  type, unknown verb, silent null instead of explicit null) is refused at
 *  parse time with the `scenario[CODE] at 'path'` grammar. */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { PlayerVerb } from "../../types.ts";
import { SCENARIO_INTENT_ARG_SHAPES, ScenarioError, parseScenarioDoc } from "../doc.ts";

/* ─────────────── the door's authoritative table, extracted ─────────────── */

/** Map the door's wire-type spellings onto the scenario wall's. The one
 *  legal translation is `bigint` → "money": the wire is JSON, so a money
 *  arg arrives as a digit string and the wall parses it to bigint. */
const DOOR_TO_WIRE: Readonly<Record<string, string>> = {
  string: "string",
  "string-or-null": "null|string",
  number: "number",
  "number-or-null": "null|number",
  bigint: "money",
};

function doorShapes(): Record<string, Record<string, string>> {
  const source = readFileSync(fileURLToPath(new URL("../../pipeline/intent-door.ts", import.meta.url)), "utf8");
  const block = /const VERB_ARG_SHAPES[^=]+=\s*Object\.freeze\(\{([\s\S]*?)\n\}\);/.exec(source);
  if (block === null || block[1] === undefined) {
    throw new Error("VERB_ARG_SHAPES block not found in intent-door.ts — the extractor is stale");
  }
  const shapes: Record<string, Record<string, string>> = {};
  for (const line of block[1].split("\n")) {
    const row = /\[PlayerVerb\.(\w+)\]:\s*Object\.freeze\(\{([^}]*)\}\)/.exec(line);
    if (row === null || row[1] === undefined || row[2] === undefined) continue;
    const member = row[1];
    const verb = (PlayerVerb as unknown as Record<string, string>)[member];
    if (verb === undefined) throw new Error(`door names enum member ${member} that types.ts does not define`);
    const fields: Record<string, string> = {};
    for (const pair of row[2].matchAll(/(\w+):\s*"([\w-]+)"/g)) {
      const field = pair[1];
      const wireType = pair[2];
      if (field === undefined || wireType === undefined) continue;
      const mapped = DOOR_TO_WIRE[wireType];
      if (mapped === undefined) throw new Error(`door wire type "${wireType}" unknown to the mirror map`);
      fields[field] = mapped;
    }
    shapes[verb] = fields;
  }
  return shapes;
}

describe("SCENARIO_INTENT_ARG_SHAPES — falsifiable mirror of the door", () => {
  it("covers exactly the door's verb roster", () => {
    expect(Object.keys(SCENARIO_INTENT_ARG_SHAPES).sort()).toEqual(Object.keys(doorShapes()).sort());
  });

  it("copies the door's per-verb field sets and wire types verbatim", () => {
    const door = doorShapes();
    for (const [verb, fields] of Object.entries(door)) {
      const mine = (SCENARIO_INTENT_ARG_SHAPES as unknown as Record<string, Record<string, string>>)[verb];
      expect(mine, `verb ${verb} missing from the wall mirror`).toBeDefined();
      expect(Object.keys(mine ?? {}).sort(), `verb ${verb} field set`).toEqual(Object.keys(fields).sort());
      for (const [field, wireType] of Object.entries(fields)) {
        expect(mine?.[field], `verb ${verb}.${field} wire type`).toBe(wireType);
      }
    }
  });

  it("the money carrier is the ONLY translation, and it appears once", () => {
    const moneyFields = Object.entries(SCENARIO_INTENT_ARG_SHAPES).flatMap(([verb, fields]) =>
      Object.entries(fields)
        .filter(([_f, wireType]) => wireType === "money")
        .map(([field]) => `${verb}.${field}`),
    );
    expect(moneyFields).toEqual(["adjust-price.newPriceMicroUsd"]);
  });
});

/* ────────────────────── the wall, exercised per verb ───────────────────── */

type Mutable = {
  intents?: unknown[];
  limits: { maxSimMinutes: number };
  [key: string]: unknown;
};

function base(): Mutable {
  return JSON.parse(
    JSON.stringify({
      schema: "hh-scenario@1",
      id: "grammar-drill",
      name: "Grammar Drill",
      brief: "One row per verb, parsed through the wall.",
      specRef: "§1.5 Grammar Drill",
      board: { nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2000000 }], edges: [] },
      contracts: [],
      traffic: { tableId: "drill", segments: [{ fromMinute: 0, ratePerMin: 10 }] },
      objectives: { win: [{ kind: "survive-minutes", minutes: 60 }], lose: [] },
      limits: { maxSimMinutes: 120, initialFreeMicroUsd: 0, opex: [] },
    }),
  ) as Mutable;
}

function parseIntentRow(row: unknown): { verb: string; args: Record<string, unknown> } {
  const wire = base();
  wire.intents = [row];
  const doc = parseScenarioDoc(wire as never);
  const first = doc.intents[0];
  if (first === undefined) throw new Error("intent row vanished");
  return { verb: first.verb, args: first.args as unknown as Record<string, unknown> };
}

const HONEST_ROWS: Readonly<Record<string, Record<string, unknown>>> = {
  "place-device": { nodeId: "web-1", deviceKind: "psu", template: null },
  "connect-ports": { relation: "data", from: "a", to: "b", slot: null },
  "disconnect-drain": { edgeId: "edge-1" },
  "configure-node": { nodeId: "web-1", inspectionDepth: null, shedOrder: null },
  "policy-card-commit": { cardHash: "c".repeat(16) },
  "shed-load": { nodeId: "web-1", qosClassId: null },
  communicate: { target: null, note: "ticket 7 acknowledged" },
  "toggle-speed": { speedX: 2 },
  "adjust-price": {
    targetKind: "bundle",
    targetId: "shared-web",
    newPriceMicroUsd: "60000000",
    effectiveAtBusinessMinute: null,
  },
  "shield-node": { targetNodeId: "web-1", effectiveAtBusinessMinute: null },
  "scale-node": { targetNodeId: "web-1", reservedSlots: 2, effectiveAtBusinessMinute: null },
};

describe("the wall accepts one honest row per verb", () => {
  for (const [verb, args] of Object.entries(HONEST_ROWS)) {
    it(`${verb} parses with its full field set`, () => {
      const parsed = parseIntentRow({ atTick: 5, verb, args });
      expect(parsed.verb).toBe(verb);
      expect(Object.keys(parsed.args).sort()).toEqual(Object.keys(args).sort());
    });
  }

  it("the money carrier parses to bigint", () => {
    const parsed = parseIntentRow({ atTick: 5, verb: "adjust-price", args: HONEST_ROWS["adjust-price"] });
    expect(parsed.args["newPriceMicroUsd"]).toBe(60000000n);
  });

  it("null|string fields also accept a real string", () => {
    const parsed = parseIntentRow({
      atTick: 5,
      verb: "communicate",
      args: { target: "web-1", note: "standby" },
    });
    expect(parsed.args["target"]).toBe("web-1");
  });
});

describe("the wall refuses every door-throw shape at parse time", () => {
  function refuse(code: string, row: unknown): ScenarioError {
    try {
      parseIntentRow(row);
    } catch (e) {
      expect(e).toBeInstanceOf(ScenarioError);
      const err = e as ScenarioError;
      expect(err.code).toBe(code);
      return err;
    }
    throw new Error(`expected ${code}`);
  }

  it("an unknown verb is UNKNOWN_KIND", () => {
    expect(refuse("UNKNOWN_KIND", { atTick: 5, verb: "launch-missile", args: {} }).message).toContain(
      "place-device",
    );
  });

  it("a missing arg field is refused (the door THROWS on undefined)", () => {
    const err = refuse("BAD_INTENT", {
      atTick: 5,
      verb: "communicate",
      args: { note: "target silently omitted" },
    });
    expect(err.path).toContain("target");
  });

  it("an extra arg field is refused", () => {
    refuse("BAD_INTENT", {
      atTick: 5,
      verb: "toggle-speed",
      args: { speedX: 2, turbo: true },
    });
  });

  it("a wrong wire type is refused", () => {
    refuse("BAD_INTENT", { atTick: 5, verb: "toggle-speed", args: { speedX: "2" } });
  });

  it("a silent null where string is required is refused", () => {
    refuse("BAD_INTENT", { atTick: 5, verb: "disconnect-drain", args: { edgeId: null } });
  });

  it("a negative or fractional atTick is refused", () => {
    refuse("BAD_INTENT", { atTick: 0, verb: "communicate", args: { target: null, note: "n" } });
    refuse("BAD_INTENT", { atTick: 1.5, verb: "communicate", args: { target: null, note: "n" } });
  });

  it("an intent scheduled after the clock stops is refused (opex law)", () => {
    const wire = base();
    wire.intents = [{ atTick: 121, verb: "communicate", args: { target: null, note: "late" } }];
    try {
      parseScenarioDoc(wire as never);
    } catch (e) {
      const err = e as ScenarioError;
      expect(err.code).toBe("BAD_INTENT");
      expect(err.message).toContain("clock");
      return;
    }
    throw new Error("expected the clock law to refuse");
  });

  it("a missing args record is refused", () => {
    refuse("BAD_INTENT", { atTick: 5, verb: "shed-load" });
  });

  it("money as a non-digit string is refused (parseMoneyWire's own code)", () => {
    refuse("BAD_MONEY", {
      atTick: 5,
      verb: "adjust-price",
      args: { targetKind: "bundle", targetId: "x", newPriceMicroUsd: "sixty bucks", effectiveAtBusinessMinute: null },
    });
  });
});
