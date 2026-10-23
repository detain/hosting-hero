/**
 * unlockModel unit law — pure projection over @hh/sim-core/unlocks:
 * bands, gap sentences, lock lines, firing-order record, census, freeze.
 * Fixtures are plain data (no stores, no engine runs); every verdict the
 * model prints was computed by the library, and these tests re-derive a
 * few of them through the library directly to prove no smearing.
 */
import { describe, expect, it } from "vitest";
import { codexStageFor, CODEX_LADDER_DEFAULTS, nextCodexGap } from "@hh/sim-core/unlocks";
import type { UnlockProposal } from "@hh/sim-core/unlocks";
import { buildUnlockLedger } from "../unlockModel";
import type { UnlockLedgerCard } from "../unlockModel";

function card(id: string, sightings: number, counters: number, label?: string): UnlockLedgerCard {
  return { id, sightings, counters, ...(label === undefined ? {} : { label }) };
}

function proposal(via: UnlockProposal["via"], targetRef: string, atTick: bigint, causeId: string): UnlockProposal {
  return { via, targetRef, atTick, causeId } as UnlockProposal;
}

describe("buildUnlockLedger — codex card bands", () => {
  it("places a never-drawn card in locked with the library's own gap", () => {
    const view = buildUnlockLedger({ cards: [card("hydra", 0, 0)] });
    expect(view.locked).toHaveLength(1);
    expect(view.locked[0]?.gap).toBe("1 more sighting → seen");
    const gap = nextCodexGap({ sightings: 0, counters: 0 }, CODEX_LADDER_DEFAULTS);
    expect(gap.next).toBe("seen");
    expect(view.next).toHaveLength(0);
    expect(view.earned).toHaveLength(0);
  });

  it("mid-ladder cards ride 'next' with stage and honest gap", () => {
    const view = buildUnlockLedger({
      cards: [card("hydra", 1, 0), card("booter", 3, 0), card("slow-query", 5, 4)],
    });
    expect(view.locked).toHaveLength(0);
    expect(view.next.map((row) => row.id)).toEqual(["booter", "hydra", "slow-query"]);
    expect(view.next[1]?.stage).toBe("seen");
    expect(view.next[1]?.gap).toBe("2 more sightings → analyzed");
    expect(view.next[0]?.gap).toBe("1 more counter → countered");
    expect(view.next[2]?.gap).toBe("1 more counter → mastered");
  });

  it("mastered cards are earned and print the weather law", () => {
    const view = buildUnlockLedger({ cards: [card("hydra", 9, 5)] });
    expect(view.earned).toHaveLength(1);
    expect(view.earned[0]?.note).toBe("mastered — the weather plays by itself now");
    expect(view.earned[0]?.stage).toBe(codexStageFor({ sightings: 9, counters: 5 }));
  });

  it("honors a host-supplied ladder config, not only the defaults", () => {
    const view = buildUnlockLedger({
      cards: [card("hydra", 2, 0)],
      ladder: { analyzeAfterSightings: 5, masterAfterCounters: 8 },
    });
    expect(view.next[0]?.gap).toBe("3 more sightings → analyzed");
  });

  it("uses the label when authored, the id when not", () => {
    const view = buildUnlockLedger({ cards: [card("hydra", 1, 0, "Hydra Attack"), card("booter", 2, 0)] });
    expect(view.next[0]?.label).toBe("booter");
    expect(view.next[1]?.label).toBe("Hydra Attack");
  });
});

describe("buildUnlockLedger — prereq line lattice", () => {
  it("opens an authored-ungated line as earned, saying so", () => {
    const view = buildUnlockLedger({ lines: [{ id: "cdn", sets: [] }] });
    expect(view.earned[0]?.note).toBe("authored-ungated — the line declares no lock");
  });

  it("opens a line once any declared route is satisfied", () => {
    const view = buildUnlockLedger({
      lines: [{ id: "cdn", sets: [{ tech: ["waf"] }, { alt: "budget-route" }] }],
      satisfied: ["budget-route"],
    });
    expect(view.earned[0]?.note).toBe("a declared route is satisfied");
    expect(view.locked).toHaveLength(0);
  });

  it("prints one readable lock per blocked route", () => {
    const view = buildUnlockLedger({
      lines: [{ id: "dbaas", sets: [{ tech: ["replicas", "backups"], commercial: ["sla-uplift"], alt: "pilot" }] }],
      satisfied: ["replicas"],
    });
    expect(view.locked[0]?.locks).toEqual([
      "route 0 — tech: backups · commercial: sla-uplift · alt route: pilot",
    ]);
  });

  it("hides an open route's lock even when a sibling route is blocked", () => {
    const view = buildUnlockLedger({
      lines: [{ id: "mix", sets: [{ tech: ["gone"] }, { alt: "held" }] }],
      satisfied: ["held"],
    });
    expect(view.earned).toHaveLength(1);
    expect(view.locked).toHaveLength(0);
  });
});

describe("buildUnlockLedger — proposals keep firing order", () => {
  it("records proposals as earned rows in the order they fired", () => {
    const view = buildUnlockLedger({
      proposals: [
        proposal("scar", "practice:postmortem", 42n, "economy:death:dissolved:churn:10"),
        proposal("milestone", "line:cdn", 7n, "unattended:milestone:medals:3"),
      ],
    });
    expect(view.earned.map((row) => row.id)).toEqual(["practice:postmortem", "line:cdn"]);
    expect(view.earned[0]?.note).toBe(
      "fired via scar at tick 42 — economy:death:dissolved:churn:10",
    );
    expect(view.earned[1]?.via).toBe("milestone");
  });

  it("proposals never sort into the data families", () => {
    const view = buildUnlockLedger({
      proposals: [proposal("era", "line:aaa", 1n, "era:2001")],
      cards: [card("zzz", 0, 0)],
    });
    expect(view.earned[0]?.shape).toBe("proposal");
    expect(view.locked[0]?.shape).toBe("card");
  });
});

describe("buildUnlockLedger — ordering, refusal, census, freeze", () => {
  it("sorts each data family by code-unit id", () => {
    const view = buildUnlockLedger({
      cards: [card("b-hydra", 1, 0), card("A-booter", 1, 0), card("a-slow", 1, 0)],
    });
    // Code-unit order: uppercase 'A' (0x41) before lowercase 'a' (0x61).
    expect(view.next.map((row) => row.id)).toEqual(["A-booter", "a-slow", "b-hydra"]);
  });

  it("refuses duplicate ids in either family with the library's error", () => {
    expect(() => buildUnlockLedger({ cards: [card("hydra", 1, 0), card("hydra", 2, 0)] })).toThrowError(
      /unlocks\[bad-value\] at 'cards'.*duplicate cards id "hydra"/,
    );
    expect(() =>
      buildUnlockLedger({ lines: [{ id: "cdn", sets: [] }, { id: "cdn", sets: [] }] }),
    ).toThrowError(/duplicate lines id "cdn"/);
  });

  it("lets malformed lattice entries fail loud from the parser", () => {
    // A vacuous route is the library's own wall — the model must not swallow it.
    expect(() =>
      buildUnlockLedger({ lines: [{ id: "cdn", sets: [{} as never] }] }),
    ).toThrowError(/unlocks\[bad-value\]/);
  });

  it("reports a census that matches the bands", () => {
    const view = buildUnlockLedger({
      cards: [card("hydra", 0, 0), card("booter", 9, 6)],
      lines: [{ id: "cdn", sets: [] }],
    });
    expect(view.census).toEqual({ earned: 2, next: 0, locked: 1 });
  });

  it("starts empty and stays empty with nothing authored", () => {
    const view = buildUnlockLedger({});
    expect(view.census).toEqual({ earned: 0, next: 0, locked: 0 });
  });

  it("freezes the view, bands, rows and census", () => {
    const view = buildUnlockLedger({ cards: [card("hydra", 1, 0)], lines: [{ id: "cdn", sets: [] }] });
    expect(Object.isFrozen(view)).toBe(true);
    expect(Object.isFrozen(view.earned)).toBe(true);
    expect(Object.isFrozen(view.next[0])).toBe(true);
    expect(Object.isFrozen(view.census)).toBe(true);
  });

  it("is deterministic: twin builds are deep-equal", () => {
    const input = {
      cards: [card("hydra", 1, 0), card("booter", 9, 6)],
      lines: [{ id: "dbaas", sets: [{ tech: ["replicas"] }] }],
      satisfied: ["replicas"],
      proposals: [proposal("scar", "line:x", 3n, "unlocks:line:x")],
    };
    expect(buildUnlockLedger(input)).toEqual(buildUnlockLedger(input));
  });
});
