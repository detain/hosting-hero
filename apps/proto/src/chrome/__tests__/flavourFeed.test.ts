/**
 * Front-of-House flavour feed — pure law pins.
 *
 * Proves the four header laws: the pool is CLOSED to slot-free flavour keys
 * of the registered packs (decision keys unreachable, the root wall
 * drift-pinned against the loader's private FLAVOUR_ROOTS literal, recoveryWatch's
 * RECOVERY_WATCH_KINDS precedent); order is code-unit stable; selection is
 * deterministic per (seed, tick) with an adjacent-distinctness law; the era
 * seam moves ONLY the three era-variant flavour keys the packs actually
 * author. No DOM, no timers, no fs beyond the one drift-pin source read.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { asRunSeed } from "@hh/sim-core/types";
import { packOf, t } from "../../i18n/packStore";
import type { PackId } from "../../i18n/packStore";
import { compareCodeUnits } from "../textLaw";
import {
  buildFlavourPool,
  defaultFlavourPool,
  flavourLineAt,
  flavourLineAtSeed,
  flavourPoolForRoots,
  flavourRootCounts,
  FLAVOUR_CHIP_ROOTS,
  pickFlavourIndex,
} from "../flavourFeed";

const SEED = asRunSeed(904n);
const POOL = buildFlavourPool();

/* ───────────────────────── the pool is closed by law ───────────────────────── */

describe("flavourFeed · pool closure", () => {
  it("the FLAVOUR_ROOTS mirror drift-pins against the loader's private wall", () => {
    // Same discipline as recoveryWatch's RECOVERY_WATCH_KINDS mirror: the
    // authority lives elsewhere; this file quotes it or goes red.
    const loaderSrc = readFileSync(
      join(process.cwd(), "..", "..", "packages/sim-core/src/loader/packs.ts"),
      "utf8",
    );
    const match = /const FLAVOUR_ROOTS: readonly string\[\] = \[([\s\S]*?)\]/.exec(loaderSrc);
    expect(match, "loader/packs.ts no longer spells FLAVOUR_ROOTS as a literal").toBeTruthy();
    const roots = [...(match![1] ?? "").matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]!);
    for (const entry of POOL) {
      expect(roots, `pool root '${entry.root}' escaped the loader wall`).toContain(entry.root);
    }
    // every chip root the panel offers must exist inside the wall too
    for (const chip of FLAVOUR_CHIP_ROOTS) expect(roots).toContain(chip);
  });

  it("no decision key can EVER appear — the pool is flavour-map-only", () => {
    const decisionKeys = new Set<string>([
      ...packOf("shared-web").decision.keys(),
      ...packOf("game").decision.keys(),
    ]);
    for (const entry of POOL) {
      expect(decisionKeys.has(entry.key), `decision key '${entry.key}' in the feed`).toBe(false);
    }
    // anti-vacuity: the decision maps are real, this test has teeth
    expect(decisionKeys.size).toBeGreaterThan(50);
  });

  it("slot-free law: every line renders with an EMPTY slot map", () => {
    for (const entry of POOL) {
      expect(t(entry.packId, entry.key, {}, 2026)).not.toContain("{");
    }
    // falsifiable: the packs DO hold slotted flavour keys, and they are out
    const slottedFlavour = [...packOf("shared-web").flavour.values()].filter(
      (tpl) => tpl.slots.length > 0,
    );
    expect(slottedFlavour.length).toBeGreaterThan(0);
    const poolKeys = new Set(POOL.map((e) => `${e.packId}|${e.key}`));
    for (const tpl of slottedFlavour) {
      expect(poolKeys.has(`shared-web|${tpl.key}`), tpl.key).toBe(false);
    }
  });

  it("order law: code-unit by key, ties by packId — stable across rebuilds", () => {
    const rebuilt = buildFlavourPool();
    expect(rebuilt).toStrictEqual(POOL);
    const sorted = [...POOL].sort(
      (a, b) => compareCodeUnits(a.key, b.key) || compareCodeUnits(a.packId, b.packId),
    );
    expect(sorted).toStrictEqual([...POOL]);
    // the (key,packId) pair is a genuine total order: cross-pack twins coexist
    // (vendor.reply.firmware ships slot-free in BOTH registered packs)
    const twins = POOL.filter((e) => e.key === "vendor.reply.firmware");
    expect(twins.length).toBe(2);
    expect(twins.map((e) => e.packId)).toStrictEqual(["game", "shared-web"]);
    // and abuse.canon.upstream — the one cross-pack twin whose TEXT differs —
    // is slot-bearing, hence absent; the slot-free law quietly de-risks it
    expect(POOL.some((e) => e.key === "abuse.canon.upstream")).toBe(false);
  });

  it("boundary guards fail loud", () => {
    expect(() => buildFlavourPool([] as PackId[])).toThrow(/empty-packs/);
    expect(() => buildFlavourPool(["shared-web", "shared-web"] as PackId[])).toThrow(
      /duplicate-pack/,
    );
    expect(() => buildFlavourPool(["mail-hosting"] as unknown as PackId[])).toThrow(
      /unknown-pack/,
    );
    expect(() => flavourPoolForRoots(["no-such-voice"])).toThrow(/no-such-root/);
    expect(() => flavourLineAt(SEED, -1, 2026)).toThrow(/bad-tick/);
    expect(() => flavourLineAt(SEED, 1.5, 2026)).toThrow(/bad-tick/);
    // an empty roots list is honest passthrough, not a filter-out-everything
    expect(flavourPoolForRoots([])).toBe(defaultFlavourPool());
  });
});

/* ─────────────────────────── deterministic picking ─────────────────────────── */

describe("flavourFeed · determinism", () => {
  it("same seed + tick + era ⇒ the SAME line ×100 (pure recomputation)", () => {
    const first = flavourLineAt(SEED, 7, 2026);
    for (let run = 0; run < 100; run++) {
      expect(flavourLineAt(SEED, 7, 2026)).toStrictEqual(first);
    }
    // the bigint convenience twin agrees byte-for-byte
    expect(flavourLineAtSeed(904n, 7, 2026)).toStrictEqual(first);
  });

  it("adjacent ticks never repeat a line (the draw-until-distinct law)", () => {
    for (const seed of [904n, 905n, 33n]) {
      let previous = "";
      for (let tick = 0; tick < 40; tick++) {
        const line = flavourLineAtSeed(seed, tick, 2026);
        const id = `${line.packId}|${line.key}`;
        expect(id === previous, `seed ${seed} repeated '${id}' at tick ${tick}`).toBe(false);
        previous = id;
      }
    }
    // a pool of ONE has nothing to be distinct from — it idles, it does not
    // throw the draw-chain in an infinite loop
    const solo = Object.freeze([POOL[0]!] as const);
    for (let tick = 0; tick < 5; tick++) {
      expect(flavourLineAt(SEED, tick, 2026, solo).key).toBe(POOL[0]!.key);
    }
  });

  it("different seeds diverge; the index stays inside the pool", () => {
    const seq = (raw: bigint) =>
      Array.from({ length: 12 }, (_, tick) => flavourLineAtSeed(raw, tick, 2026).key);
    expect(seq(904n)).not.toStrictEqual(seq(905n));
    for (let tick = 0; tick < 60; tick++) {
      const index = pickFlavourIndex(SEED, tick, POOL.length);
      expect(Number.isInteger(index)).toBe(true);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(POOL.length);
    }
    expect(() => pickFlavourIndex(SEED, 0, 0)).toThrow(/bad-pool/);
  });
});

/* ─────────────────────────────── era seam ─────────────────────────────────── */

describe("flavourFeed · era law", () => {
  it("a flip moves EXACTLY the era-variant keys and nothing else", () => {
    const changed = new Set<string>();
    for (const entry of POOL) {
      const before = t(entry.packId, entry.key, {}, 1998);
      const after = t(entry.packId, entry.key, {}, 2026);
      if (before !== after) changed.add(entry.key);
    }
    expect([...changed].sort(compareCodeUnits)).toStrictEqual([
      "loading.tip.cold-aisle",
      "ticket.subject.cron",
      "ticket.subject.dev-left",
    ]);
    // and the feed honors the year it was handed
    const cronIndex = POOL.findIndex((e) => e.key === "ticket.subject.cron");
    const cronEntry = POOL[cronIndex];
    expect(cronEntry).toBeDefined();
    const eraOfLine = (year: number) => {
      for (let tick = 0; tick < 200; tick++) {
        const line = flavourLineAt(SEED, tick, year);
        if (line.key === "ticket.subject.cron") return line;
      }
      throw new Error("ticket.subject.cron never surfaced in 200 ticks");
    };
    expect(eraOfLine(1998).text).toBe("my hit counter doesnt go up");
    expect(eraOfLine(2026).text).toBe("my cron didnt run");
  });
});

/* ──────────────────────────── chip-filter honesty ─────────────────────────── */

describe("flavourFeed · root filter", () => {
  it("a filtered pool is an honest subset — same roots in, nothing else out", () => {
    for (const chip of FLAVOUR_CHIP_ROOTS) {
      if (chip === "forum") continue; // forum has no slot-free line (next test)
      const filtered = flavourPoolForRoots([chip]);
      expect(filtered.length).toBeGreaterThan(0);
      for (const entry of filtered) expect(entry.root).toBe(chip);
      // honest subset: every filtered entry exists in the full pool, order kept
      const full = POOL.filter((e) => e.root === chip);
      expect(filtered).toStrictEqual(full);
      // and lines drawn from it can only ever wear that root
      for (let tick = 0; tick < 8; tick++) {
        expect(flavourLineAt(SEED, tick, 2026, filtered).root).toBe(chip);
      }
    }
    // the chips are NOT the whole bank — filtering must actually narrow
    const chipRoots = new Set<string>(FLAVOUR_CHIP_ROOTS);
    expect(POOL.filter((e) => !chipRoots.has(e.root)).length).toBeGreaterThan(0);
  });

  it("forum is honestly SILENT in v0: every forum thread carries slots", () => {
    expect(() => flavourPoolForRoots(["forum"])).toThrow(/no-such-root/);
    const forumFlavour = [...packOf("shared-web").flavour.values(), ...packOf("game").flavour.values()].filter(
      (tpl) => tpl.key.startsWith("forum."),
    );
    expect(forumFlavour.length).toBeGreaterThan(0); // the bank HAS forum copy…
    for (const tpl of forumFlavour) expect(tpl.slots.length).toBeGreaterThan(0); // …all slotted
  });

  it("flavourRootCounts answers the chip rail before it is clicked", () => {
    const counts = flavourRootCounts();
    let total = 0;
    for (const [, n] of counts) total += n;
    expect(total).toBe(POOL.length); // every line owned by exactly one root
    expect(counts.get("forum")).toBeUndefined(); // absent = zero = disabled chip
    expect(counts.get("ticket")).toBeGreaterThanOrEqual(16);
    expect(counts.get("press")).toBe(2);
    const names = [...counts.keys()];
    expect(names).toStrictEqual([...names].sort(compareCodeUnits));
  });
});
