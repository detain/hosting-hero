/** pricingRung.test.ts — rung 7 (price elasticity on the scenario wire).
 *  Two cheap law units; the END-TO-END elasticity witness rides with the
 *  copycat mission in runner.test.ts (the whale's invoices and churn dice
 *  are the authority, not a mock). */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  emptyEconomyState,
  registerContractsEconomy,
  defaultEconomyConfig,
} from "../../economy/index.ts";
import { parseScenarioDoc } from "../index.ts";
import { asEntityId, asMoney, type Contract, type SlaTerms } from "../../types.ts";

function sourceOf(rel: string): string {
  return readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
}

/** Pull the members of a `const NAME = Object.freeze([...] as const)` (or a
 *  plain array literal) out of a source file — mirror of the
 *  intentGrammar.test.ts door-source law: the wall mirrors vocabularies it
 *  cannot import, so the mirror is pinned by reading the authority's TEXT. */
function readStringArrayLiteral(src: string, name: string): readonly string[] {
  const match = new RegExp(`${name}[^=]*=\\s*(?:Object\\.freeze\\(\\s*)?\\[([^\\]]*)\\]`).exec(src);
  if (match === null || match[1] === undefined) {
    throw new Error(`pricingRung: no array literal for ${name} found in source`);
  }
  return [...match[1].matchAll(/"([^"]+)"|'([^']+)'/g)].map((m) => m[1] ?? m[2] ?? "");
}

describe("rung 7 — the priceKey vocabularies are mirrors, not drift", () => {
  it("doc.ts PRICE_KEY_KINDS equals economy/elasticity.ts PRICE_KEY_KINDS", () => {
    const authority = readStringArrayLiteral(sourceOf("../../economy/elasticity.ts"), "PRICE_KEY_KINDS");
    const mirror = readStringArrayLiteral(sourceOf("../doc.ts"), "PRICE_KEY_KINDS");
    expect(authority.length).toBeGreaterThan(0);
    expect(mirror).toEqual([...authority]);
  });

  it("doc.ts parsePriceKeyWire splits at the FIRST colon like the door's parsePriceOverrideKey", () => {
    const docSrc = sourceOf("../doc.ts");
    const doorSrc = sourceOf("../../pipeline/intent-door.ts");
    expect(docSrc).toContain("raw.indexOf(\":\")");
    expect(doorSrc).toMatch(/key\.indexOf\(":"\)|indexOf\(":"\)/);
  });
});

describe("rung 7 — the runner's sparse pass-through reaches the lane", () => {
  function parsedPair(): { keyed: Contract; plain: Contract } {
    const wire = JSON.parse(
      JSON.stringify({
        schema: "hh-scenario@1",
        id: "pk-sparse",
        name: "PK Sparse",
        brief: "A two-contract wall check for the sparse rung-7 field.",
        specRef: "§1.5 The Copycat",
        specLine: 3429,
        board: { nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2_000_000 }], edges: [] },
        contracts: [
          { id: "pk-1", mrcMicroUsd: 100_000_000, billingCycle: "monthly", termEndMin: 43_200, priceKey: "plan:shield" },
          { id: "pk-2", mrcMicroUsd: 100_000_000, billingCycle: "monthly", termEndMin: 43_200 },
        ],
        traffic: { tableId: "t", segments: [{ fromMinute: 0, ratePerMin: 1 }] },
        objectives: { win: [{ kind: "survive-minutes", minutes: 60 }], lose: [] },
        limits: { maxSimMinutes: 420, initialFreeMicroUsd: 0, opex: [] },
      }),
    ) as never;
    const doc = parseScenarioDoc(wire);
    return { keyed: doc.contracts[0]!.contract, plain: doc.contracts[1]!.contract };
  }

  it("a declared priceKey lands on the record; absent keeps the key off", () => {
    const { keyed, plain } = parsedPair();
    const econ = registerContractsEconomy(emptyEconomyState(), [
      Object.freeze({ contract: keyed, atBusinessMin: 0, clauseRefs: Object.freeze(["auto-renew"]) as readonly string[], grandfather: null, revenueTags: Object.freeze([]) as readonly string[], commitmentBps: 9_990n, priceKey: "plan:shield" }),
      Object.freeze({ contract: plain, atBusinessMin: 0, clauseRefs: Object.freeze(["auto-renew"]) as readonly string[], grandfather: null, revenueTags: Object.freeze([]) as readonly string[], commitmentBps: 9_990n }),
    ] as never, defaultEconomyConfig());
    const one = econ.contractEconomy.get(keyed.id) as { priceKey?: string };
    const two = econ.contractEconomy.get(plain.id) as { priceKey?: string };
    expect(one.priceKey).toBe("plan:shield");
    expect("priceKey" in (two as object)).toBe(false);
  });

  it("the parsed spec carries priceKey verbatim only when authored", () => {
    const base = JSON.parse(
      JSON.stringify({
        schema: "hh-scenario@1",
        id: "pk-sparse",
        name: "PK Sparse",
        brief: "A one-contract wall check for the sparse rung-7 field.",
        specRef: "§1.5 The Copycat",
        specLine: 3429,
        board: { nodes: [{ id: "web-1", slots: 40, serviceTimeUs: 2_000_000 }], edges: [] },
        contracts: [{ id: "pk-1", mrcMicroUsd: 100_000_000, billingCycle: "monthly", termEndMin: 43_200 }],
        traffic: { tableId: "t", segments: [{ fromMinute: 0, ratePerMin: 1 }] },
        objectives: { win: [{ kind: "survive-minutes", minutes: 60 }], lose: [] },
        limits: { maxSimMinutes: 420, initialFreeMicroUsd: 0, opex: [] },
      }),
    );
    expect(parseScenarioDoc(base).contracts[0]?.priceKey).toBeUndefined();
    base.contracts[0].priceKey = "sku:basic";
    expect(parseScenarioDoc(base).contracts[0]?.priceKey).toBe("sku:basic");
  });
});
