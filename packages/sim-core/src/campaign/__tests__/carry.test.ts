/**
 * carry.test.ts — deterministic carry projection (L-CP1, §2.5 thin law).
 */
import { describe, expect, it } from "vitest";
import { asEntityId, asMoney, asRunSeed } from "../../types";
import type { CustomerBookRecord } from "../../save/index";
import { newCompanyNode } from "../../save/index";
import { theLongWeekendDoc } from "../../scenario/index";
import type { ScenarioDoc } from "../../scenario/index";
import { applyCarryToDoc, projectChapterCarry, parseCampaignDoc } from "../index";
import type { CampaignCarryRules } from "../index";

const rules = parseCampaignDoc({
  schema: "hh-campaign@1", id: "t", name: "T",
  chapters: [{ chapterId: "one", scenarioId: "s" }],
  carry: { cashFloor: { thresholdMicroUsd: 100n, bridgeMicroUsd: 40n }, scarCapRide: true },
}).carry;

function book(id: string, mrr: bigint, status: CustomerBookRecord["status"]): CustomerBookRecord {
  return {
    id: asEntityId(id), name: id, plan: "pro", mrrMicroUsd: asMoney(mrr), tenureMin: 1, termEndMin: 100,
    cohortId: "c", treatmentLog: [], grudgeScore: 0n, referenceEligible: true, status, whaleShare: 0n,
  };
}

function nodeWith(overrides: Partial<ReturnType<typeof newCompanyNode>>): ReturnType<typeof newCompanyNode> {
  const founder = newCompanyNode({ id: "co", parentId: null, name: "Co", eraOrigin: "2026", foundedAtTick: 0n, successionType: "found" });
  return { ...founder, ...overrides };
}

describe("projectChapterCarry — the bridge law", () => {
  it("opens on the BRIDGE strictly below the floor (poorer, not paid)", () => {
    const node = nodeWith({ finances: { cashCapped: false, cashMicroUsd: asMoney(99n), mrrMicroUsd: asMoney(0n), deferredRevenueMicroUsd: asMoney(0n), runwayMin: 0, debt: [] } });
    expect(projectChapterCarry(node, rules).openingCashMicroUsd).toBe(40n);
  });

  it("carries OWN cash at or above the floor", () => {
    const node = nodeWith({ finances: { cashCapped: false, cashMicroUsd: asMoney(100n), mrrMicroUsd: asMoney(0n), deferredRevenueMicroUsd: asMoney(0n), runwayMin: 0, debt: [] } });
    expect(projectChapterCarry(node, rules).openingCashMicroUsd).toBe(100n);
  });
});

describe("projectChapterCarry — cast law", () => {
  const node = nodeWith({
    finances: { cashCapped: false, cashMicroUsd: asMoney(1_000n), mrrMicroUsd: asMoney(0n), deferredRevenueMicroUsd: asMoney(0n), runwayMin: 0, debt: [] },
    customerBooks: [book("cust-z", 300n, "active"), book("cust-a", 100n, "active"), book("cust-m", 50n, "churned"), book("cust-b", 0n, "active")],
  });

  it("rides ACTIVE PAYING books, code-unit sorted, churned and zero-mrr stay dead", () => {
    const projection = projectChapterCarry(node, rules);
    expect(projection.contractCasts.map((spec) => spec.id)).toEqual(["cast-cust-a", "cast-cust-z"]);
    expect(projection.contractCasts[0]?.contract.customerEntityId).toBe(asEntityId("cust-a"));
    expect(projection.contractCasts[1]?.contract.mrcMicroUsd).toBe(300n);
  });

  it("mints the full contract leg the scenario parser expects", () => {
    const spec = projectChapterCarry(node, rules).contractCasts[0];
    expect(spec?.termMonths).toBe(12);
    expect(spec?.commitmentBps).toBe(10_000n);
    expect(spec?.contract.tcvMicroUsd).toBe(1_200n);
    expect(spec?.contract.billingCycle).toBe("monthly");
    expect(spec?.contract.sla.autoRenew).toBe(false);
    expect(spec?.contract.allocations).toEqual([]);
  });

  it("caps casts at rules.castCap and staff facts at rules.staffCap", () => {
    const many = nodeWith({
      finances: node.finances,
      customerBooks: Array.from({ length: 15 }, (_, i) => book(`cust-${String(i).padStart(2, "0")}`, 10n, "active")),
    });
    const wide = { ...rules, castCap: 12 } as CampaignCarryRules;
    expect(projectChapterCarry(many, wide).contractCasts.length).toBe(12);
    expect(projectChapterCarry(many, { ...wide, castCap: 2 }).contractCasts.length).toBe(2);
  });

  it("rides staff facts thin (ledger data only — no engine consumer in v0)", () => {
    const staffRows = Array.from({ length: 5 }, (_, i) => ({
      id: `st-${i}`, name: `S${i}`, role: "ops", arcStage: "act-1", skillNodesHeld: [],
    })) as unknown as ReturnType<typeof newCompanyNode>["staff"];
    const node = nodeWith({ staff: staffRows });
    const projection = projectChapterCarry(node, { ...rules, staffCap: 3 });
    expect(projection.staffCast.map((row) => row.id)).toEqual(["st-0", "st-1", "st-2"]);
  });

  it("counts scars but never mints them — addScar owns the cap downstream", () => {
    const scarred = nodeWith({ scars: [{ id: asEntityId("scar-1") }] as unknown as ReturnType<typeof newCompanyNode>["scars"] });
    expect(projectChapterCarry(scarred, rules).scarCount).toBe(1);
  });
});

describe("applyCarryToDoc — clone-project, never mutate", () => {
  const doc: ScenarioDoc = theLongWeekendDoc;

  it("returns the SAME doc object when the projection changes nothing", () => {
    const identity = projectChapterCarry(
      nodeWith({ finances: { cashCapped: false, cashMicroUsd: asMoney(doc.limits.initialFreeMicroUsd), mrrMicroUsd: asMoney(0n), deferredRevenueMicroUsd: asMoney(0n), runwayMin: 0, debt: [] } }),
      rules,
    );
    // cash exactly at the doc's authored opening + zero books ⇒ identity exit
    const projected = applyCarryToDoc(doc, { ...identity, contractCasts: [] });
    expect(projected).toBe(doc);
  });

  it("layers cash into limits.initialFreeMicroUsd and appends casts WITHOUT touching the input", () => {
    const contractsBefore = doc.contracts.length;
    const cashBefore = doc.limits.initialFreeMicroUsd;
    const projection = projectChapterCarry(
      nodeWith({
        finances: { cashCapped: false, cashMicroUsd: asMoney(500n), mrrMicroUsd: asMoney(0n), deferredRevenueMicroUsd: asMoney(0n), runwayMin: 0, debt: [] },
        customerBooks: [book("cust-1", 250n, "active")],
      }),
      rules,
    );
    const projected = applyCarryToDoc(doc, projection);
    expect(projected).not.toBe(doc);
    expect(projected.limits.initialFreeMicroUsd).toBe(500n);
    expect(projected.contracts.length).toBe(contractsBefore + 1);
    expect(projected.contracts[contractsBefore]?.id).toBe("cast-cust-1");
    // input untouched — the doc is frozen authored data
    expect(doc.limits.initialFreeMicroUsd).toBe(cashBefore);
    expect(doc.contracts.length).toBe(contractsBefore);
  });
});

describe("projectChapterCarry — grudge-cast law", () => {
  it("a grudge-bearing customer claims the cast slot over the code-unit ladder", () => {
    const grudge: CustomerBookRecord = {
      ...book("cust-z", 10n, "active"),
      grudgeScore: 2_000n,
      treatmentLog: [
        {
          seq: 0, atTick: 5n, causeId: "run:x", subject: asEntityId("cust-z"), dimension: "incident",
          valence: -4_000n, summary: "the outage nobody explained",
          provenance: { runId: asEntityId("run:x"), runSeed: asRunSeed(7n) },
        },
      ],
    };
    const plain = book("cust-a", 10n, "active");
    const node = nodeWith({
      finances: { cashCapped: false, cashMicroUsd: asMoney(1_000n), mrrMicroUsd: asMoney(0n), deferredRevenueMicroUsd: asMoney(0n), runwayMin: 0, debt: [] },
      customerBooks: [plain, grudge],
    });
    const tight = parseCampaignDoc({
      schema: "hh-campaign@1", id: "t2", name: "T2",
      chapters: [{ chapterId: "one", scenarioId: "s" }],
      carry: { cashFloor: { thresholdMicroUsd: 100n, bridgeMicroUsd: 40n }, castCap: 1, scarCapRide: true },
    }).carry;
    // One slot only: the hurt customer takes it — id-sort alone would have kept cust-a.
    expect(projectChapterCarry(node, tight).contractCasts.map((spec) => spec.id)).toEqual(["cast-cust-z"]);
    // With room for both, the code-unit ladder orders the rest.
    expect(projectChapterCarry(node, rules).contractCasts.map((spec) => spec.id)).toEqual(["cast-cust-z", "cast-cust-a"]);
  });
});
