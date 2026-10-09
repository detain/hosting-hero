/**
 * prereqs unit tests — the §5.6 lattice consumer, including the real
 * shipped content lattices read through the loader (the orphan contract
 * finally exercised end-to-end).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadTypeBundle } from "../../loader/index";
import { canUnlock, parsePrereqSets, whatBlocks } from "../prereqs";
import { UnlocksError } from "../triggers";

const S = (ids: readonly string[]) => new Set(ids);

describe("parsePrereqSets boundary", () => {
  it("parses the loader-shaped full record", () => {
    const sets = parsePrereqSets([{ tech: ["a"], commercial: ["b"], alt: "c" }]);
    expect(sets).toStrictEqual([{ tech: ["a"], commercial: ["b"], alt: "c" }]);
    expect(Object.isFrozen(sets[0])).toBe(true);
    expect(Object.isFrozen(sets[0]?.tech)).toBe(true);
  });

  it("omitted channels parse to empty lists, missing alt to null", () => {
    expect(parsePrereqSets([{ tech: ["a"] }])).toStrictEqual([{ tech: ["a"], commercial: [], alt: null }]);
  });

  it("rejects non-arrays, non-objects, empty/duplicate ids", () => {
    expect(() => parsePrereqSets("nope" as unknown as unknown[])).toThrow(/must be an array/);
    expect(() => parsePrereqSets([null])).toThrow(/must be an object/);
    expect(() => parsePrereqSets([{ tech: [""] }])).toThrow(/non-empty string/);
    expect(() => parsePrereqSets([{ tech: ["a", "a"] }])).toThrow(/duplicate prereq id/);
    expect(() => parsePrereqSets([{ tech: "a" as unknown as string[] }])).toThrow(/array of ids or null/);
  });

  it("an all-empty route is a vacuous lock — rejected", () => {
    expect(() => parsePrereqSets([{ tech: [], commercial: null, alt: null }])).toThrow(/vacuous lock/);
  });

  it("a single-channel route (alt only) parses and opens only via its alt", () => {
    const sets = parsePrereqSets([{ alt: "purchase-paper" }]);
    expect(canUnlock(sets, S([]))).toBe(false);
    expect(canUnlock(sets, S(["purchase-paper"]))).toBe(true);
  });
});

describe("canUnlock — route semantics (§5.6)", () => {
  const oneRoute = parsePrereqSets([{ tech: ["cpanel-class-control-plane"], commercial: ["mass-signup-affiliate-channel"] }]);

  it("empty lattice opens trivially (authored-ungated, waves/ledger idiom)", () => {
    expect(canUnlock([], S([]))).toBe(true);
    expect(whatBlocks([], S([]))).toStrictEqual([]);
  });

  it("tech AND commercial inside one route", () => {
    expect(canUnlock(oneRoute, S(["cpanel-class-control-plane"]))).toBe(false);
    expect(canUnlock(oneRoute, S(["mass-signup-affiliate-channel"]))).toBe(false);
    expect(canUnlock(oneRoute, S(["cpanel-class-control-plane", "mass-signup-affiliate-channel"]))).toBe(true);
  });

  it("alt satisfies the WHOLE route alone", () => {
    const sets = parsePrereqSets([{ tech: ["t"], commercial: ["c"], alt: "celebrity-hire" }]);
    expect(canUnlock(sets, S(["celebrity-hire"]))).toBe(true);
    expect(canUnlock(sets, S(["t"]))).toBe(false);
  });

  it("multiple routes: ANY satisfied route opens the line", () => {
    const twoRoutes = parsePrereqSets([
      { tech: ["route-a-1", "route-a-2"] },
      { tech: ["route-b-1"], commercial: ["route-b-2"] },
    ]);
    expect(canUnlock(twoRoutes, S(["route-a-1", "route-a-2"]))).toBe(true);
    expect(canUnlock(twoRoutes, S(["route-b-1", "route-b-2"]))).toBe(true);
    expect(canUnlock(twoRoutes, S(["route-a-1"]))).toBe(false);
  });
});

describe("whatBlocks — readable locks", () => {
  it("names per-route missing channels, including the unmet alt", () => {
    const sets = parsePrereqSets([{ tech: ["t1", "t2"], commercial: ["c1"], alt: "buy-it" }]);
    const blocks = whatBlocks(sets, S(["t1"]));
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toStrictEqual({
      setIndex: 0,
      missingTech: ["t2"],
      missingCommercial: ["c1"],
      missingAlt: "buy-it",
    });
  });

  it("a route opened via alt produces NO blocker even with groups missing", () => {
    const sets = parsePrereqSets([{ tech: ["t"], alt: "a" }]);
    expect(whatBlocks(sets, S(["a"]))).toStrictEqual([]);
  });

  it("mixed routes: only the still-locked ones are reported", () => {
    const sets = parsePrereqSets([{ tech: ["open-road"] }, { tech: ["dark-road"] }]);
    const blocks = whatBlocks(sets, S(["open-road"]));
    expect(blocks).toHaveLength(0); // ANY-route law: the line is open
    const closed = whatBlocks(sets, S([]));
    expect(closed.map((b) => b.setIndex)).toStrictEqual([0, 1]);
  });
});

describe("fail-loud on an unsatisfiable lattice", () => {
  it("ids outside the known universe throw with the unknown-prereq code", () => {
    const sets = parsePrereqSets([{ tech: ["ghost-route"] }]);
    expect(() => canUnlock(sets, S([]), S(["real-route"]))).toThrow(UnlocksError);
    try {
      canUnlock(sets, S([]), S(["real-route"]));
    } catch (error) {
      expect((error as UnlocksError).code).toBe("unknown-prereq");
      expect((error as UnlocksError).message).toMatch(/ghost-route/);
    }
  });

  it("an id satisfied but not declared known still throws (evidence cannot whitelist a typo)", () => {
    const sets = parsePrereqSets([{ tech: ["typo"] }]);
    expect(() => canUnlock(sets, S(["typo"]), S(["real"]))).toThrow(/unknown-prereq|typo/);
  });

  it("no universe supplied → evaluation proceeds (id space owned by content)", () => {
    const sets = parsePrereqSets([{ tech: ["whatever"] }]);
    expect(canUnlock(sets, S(["whatever"]))).toBe(true);
  });
});

describe("the shipped g1 lattices (loader-consumed, orphan no more)", () => {
  it("both official bundles' prereqSets parse and block honestly", () => {
    // LoadedPrereqSet feeds parsePrereqSets directly — the structural
    // mirror contract, proven against the real loader's output.
    for (const file of ["shared-web", "game-servers"]) {
      const path = join(process.cwd(), "../../packages/content/types", `${file}.json`);
      const bundle = loadTypeBundle(JSON.parse(readFileSync(path, "utf8")));
      const sets = parsePrereqSets(bundle.relations.prereqSets, `${file}.prereqSets`);
      expect(sets.length).toBeGreaterThan(0);
      // Nothing is satisfied at tick 0 → every route must produce a readable lock.
      const blocks = whatBlocks(sets, S([]));
      expect(blocks).toHaveLength(sets.length);
      for (const block of blocks) {
        const missing = block.missingTech.length + block.missingCommercial.length + (block.missingAlt === null ? 0 : 1);
        expect(missing).toBeGreaterThan(0);
      }
      // Satisfying every named id opens the line.
      const all = new Set<string>();
      for (const set of sets) {
        for (const id of [...set.tech, ...set.commercial]) all.add(id);
        if (set.alt !== null) all.add(set.alt);
      }
      expect(canUnlock(sets, all)).toBe(true);
    }
  });
});
