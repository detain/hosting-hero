/**
 * Front-of-House flavour feed — pure law pins.
 *
 * Proves the four header laws: the pool is CLOSED to slot-free flavour keys
 * of ALL FOURTEEN registered packs since ADR-0014 #D5 (the roster grew pack by
 * pack with the type cards — ci-build-farm's 20 slot-free lines are the fourteenth-pack re-roll; decision keys unreachable,
 * the root wall drift-pinned against the loader's private FLAVOUR_ROOTS
 * literal, recoveryWatch's RECOVERY_WATCH_KINDS precedent); order is code-unit
 * stable; selection is deterministic per (seed, tick) with an
 * adjacent-distinctness law; the era seam moves ONLY the five era-variant
 * flavour keys in the pool — shared-web's three plus game's two, all quad-rung
 * since L-ER-B (the other twelve packs still ship zero era objects).
 * No DOM, no timers, no fs beyond the one drift-pin
 * source read.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { asRunSeed } from "@hh/sim-core/types";
import { PACK_IDS, packOf, t } from "../../i18n/packStore";
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
    const decisionKeys = new Set<string>();
    for (const id of PACK_IDS) for (const key of packOf(id).decision.keys()) decisionKeys.add(key);
    for (const entry of POOL) {
      // a key may be flavour here AND decision in ANOTHER pack — the feed is
      // keyed (packId, key), so the guard is per-entry, not global-keyed
      expect(packOf(entry.packId).decision.has(entry.key), `decision key '${entry.key}' in the feed`).toBe(false);
    }
    // anti-vacuity: the fourteen decision maps are real, this test has teeth
    expect(decisionKeys.size).toBeGreaterThan(150);
  });

  it("the #D5 pool census: 272 entries / 218 distinct keys (disk truth)", () => {
    // re-derived empirically from the fourteen registered packs — entries count
    // the (packId, key) pairs, distinct keys collapse the byte-ident twins
    // (218 since the ci-build-farm firstday→board rename split the one
    // pack-ambiguous key into two distinct ones; entries unchanged at 272)
    expect(POOL.length).toBe(272);
    expect(new Set(POOL.map((e) => e.key)).size).toBe(218);
    // the widening moved every entry count EXCEPT the trio of baseline-only
    // loading tips: slot-free flavour per pack (sorted code-unit by packId)
    const perPack = new Map<PackId, number>();
    for (const entry of POOL) perPack.set(entry.packId, (perPack.get(entry.packId) ?? 0) + 1);
    expect([...perPack.entries()].sort((a, b) => compareCodeUnits(a[0], b[0]))).toEqual([
      ["backup-archival", 15],
      ["ci-build-farm", 20],
      ["colo", 17],
      ["dbaas", 14],
      ["dedicated", 21],
      ["dns-hosting", 17],
      ["exchange-colo", 15],
      ["game", 22],
      ["mail-hosting", 20],
      ["object-storage", 18],
      ["observability", 19],
      ["serverless", 17],
      ["shared-web", 38],
      ["trunk-group-voip", 19],
    ]);
  });

  it("slot-free law: every line renders with an EMPTY slot map", () => {
    for (const entry of POOL) {
      expect(t(entry.packId, entry.key, {}, 2026)).not.toContain("{");
    }
    // falsifiable: EVERY registered pack holds slotted flavour keys, and they
    // are all out
    for (const id of PACK_IDS) {
      const slottedFlavour = [...packOf(id).flavour.values()].filter(
        (tpl) => tpl.slots.length > 0,
      );
      expect(slottedFlavour.length, id).toBeGreaterThan(0);
      const poolKeys = new Set(POOL.filter((e) => e.packId === id).map((e) => e.key));
      for (const tpl of slottedFlavour) {
        expect(poolKeys.has(tpl.key), `${id}/${tpl.key}`).toBe(false);
      }
    }
  });

  it("order law: code-unit by key, ties by packId — stable across rebuilds", () => {
    const rebuilt = buildFlavourPool();
    expect(rebuilt).toStrictEqual(POOL);
    const sorted = [...POOL].sort(
      (a, b) => compareCodeUnits(a.key, b.key) || compareCodeUnits(a.packId, b.packId),
    );
    expect(sorted).toStrictEqual([...POOL]);
    // the (key,packId) pair is a genuine total order: since #D5 the four
    // vendor replies ship slot-free in ALL FOURTEEN packs byte-identical, and the
    // two loading tips coexist as game+shared-web twins
    const firmware = POOL.filter((e) => e.key === "vendor.reply.firmware");
    expect(firmware.length).toBe(14);
    expect(firmware.map((e) => e.packId)).toEqual(
      [...firmware.map((e) => e.packId)].sort(compareCodeUnits),
    );
    // the keyed law keeps multi-pack slot-free twins byte-identical across
    // all fourteen packs — the divergent-text SET is EMPTY and pinned so.
    // It earned that emptiness: the fourteenth pack authored
    // intern.entry.firstday slot-free in BOTH observability and ci-build-farm
    // with divergent texts (collision @a47a9b5, disclosed @27281fa); the
    // content lane resolved it by renaming the ci side to intern.entry.board.
    // Pinned as the exact EMPTY set, not merely asserted small — no
    // pack-ambiguous line can join the pool by silence.
    const byKey = new Map<string, string[]>();
    for (const entry of POOL) {
      const texts = byKey.get(entry.key) ?? [];
      texts.push(t(entry.packId, entry.key, {}, 2026));
      byKey.set(entry.key, texts);
    }
    const divergent: string[] = [];
    for (const [key, texts] of [...byKey.entries()].sort((a, b) => compareCodeUnits(a[0], b[0]))) {
      if (texts.length < 2) continue;
      if (new Set(texts).size > 1) divergent.push(key);
    }
    expect(divergent).toStrictEqual([]);
    // the text-divergent cross-pack keys (abuse.canon.upstream,
    // abuse.canon.customer-dispute, intern.entry.bill, chatter.desk.stack)
    // are slot-bearing wherever they would double-enter: chatter.desk.stack
    // goes slot-free ONLY in mail-hosting (dns-hosting's copy takes
    // {complaintCount}), so it rides the pool exactly once
    expect(POOL.filter((e) => e.key === "chatter.desk.stack").map((e) => e.packId)).toEqual([
      "mail-hosting",
    ]);
    expect(POOL.some((e) => e.key === "abuse.canon.upstream")).toBe(false);
  });

  it("boundary guards fail loud", () => {
    expect(() => buildFlavourPool([] as PackId[])).toThrow(/empty-packs/);
    expect(() => buildFlavourPool(["shared-web", "shared-web"] as PackId[])).toThrow(
      /duplicate-pack/,
    );
    // every shipped pack is now registered (#D5) — the unknown-pack probe
    // must be a pack that does not exist at all
    expect(() => buildFlavourPool(["gpu-farm"] as unknown as PackId[])).toThrow(/unknown-pack/);
    // a single type pack builds a legal pool on its own
    expect(() => buildFlavourPool(["exchange-colo"])).not.toThrow();
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
    // L-ER-B widened the changed set from the shared-web trio to five: game's
    // two pack-unique flavour keys (griefed, naming) joined the four-rung axis.
    // The other twelve packs author zero era objects, so the pool widening
    // stays era-safe; the flip test probes 1998 vs 2026, so the set pins the
    // whole era-variant roster, not just the years compared.
    expect([...changed].sort(compareCodeUnits)).toStrictEqual([
      "chatter.quiet.naming",
      "loading.tip.cold-aisle",
      "ticket.subject.cron",
      "ticket.subject.dev-left",
      "ticket.subject.griefed",
    ]);
    expect(POOL.filter((e) => e.kind === "era-variant").map((e) => e.packId)).toStrictEqual([
      "game",
      "shared-web",
      "shared-web",
      "shared-web",
      "game",
    ]);
  });

  it("the feed honors the year it was handed", () => {
    // solo-pool pin (the idle law): the cron entry alone, every tick lands on
    // it, and the TEXT follows the year — pool-size-independent proof that
    // flavourLineAt threads eraYear through to t()
    const cron = POOL.filter((e) => e.key === "ticket.subject.cron");
    expect(cron.length).toBe(1);
    const solo = Object.freeze(cron);
    expect(flavourLineAt(SEED, 3, 1998, solo).text).toBe("my hit counter doesnt go up");
    expect(flavourLineAt(SEED, 3, 2026, solo).text).toBe("my cron didnt run");
    // L-ER-B quad-rung: the middle rungs speak too — 2008/2016 bodies land
    // exactly on their years (the earlier-rung degradation law lives in
    // packs.test.ts's LADDER; this pins the observable new copy)
    expect(flavourLineAt(SEED, 3, 2008, solo).text).toBe("my stats havent updated in two days");
    expect(flavourLineAt(SEED, 3, 2016, solo).text).toBe("my scheduled post never went live");
    // and on the full #D5 pool the line still surfaces within 400 ticks at
    // seed 904 (deterministic, era-independent selection — same tick both years)
    const tickCronSurfaces = (() => {
      for (let tick = 0; tick < 400; tick++) {
        if (flavourLineAt(SEED, tick, 2026).key === "ticket.subject.cron") return tick;
      }
      return -1;
    })();
    expect(tickCronSurfaces).toBeGreaterThanOrEqual(0);
    expect(flavourLineAt(SEED, tickCronSurfaces, 1998).text).toBe("my hit counter doesnt go up");
    expect(flavourLineAt(SEED, tickCronSurfaces, 2026).text).toBe("my cron didnt run");
  });
});

/* ──────────────────────────── chip-filter honesty ─────────────────────────── */

describe("flavourFeed · root filter", () => {
  it("a filtered pool is an honest subset — same roots in, nothing else out", () => {
    for (const chip of FLAVOUR_CHIP_ROOTS) {
      const filtered = flavourPoolForRoots([chip]);
      expect(filtered.length, chip).toBeGreaterThan(0);
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

  it("forum SPEAKS since #D5 — its slot-free lines arrived with the type packs", () => {
    const forum = flavourPoolForRoots(["forum"]);
    expect(forum.length).toBe(11); // 11 of 11 forum lines ride the pool
    // none from the baseline packs — every shared-web/game forum thread still
    // carries slots; the type banks authored slot-free threads
    expect(new Set(forum.map((e) => e.packId))).toEqual(
      new Set(["dbaas", "dedicated", "dns-hosting", "exchange-colo", "object-storage", "observability", "serverless", "trunk-group-voip"]),
    );
    expect(forum.some((e) => e.packId === "shared-web" || e.packId === "game")).toBe(false);
    // falsifiable: the baseline banks DO hold forum copy — all slotted, all out
    for (const id of ["shared-web", "game"] as const) {
      const slottedForum = [...packOf(id).flavour.values()].filter((tpl) =>
        tpl.key.startsWith("forum."),
      );
      expect(slottedForum.length, id).toBeGreaterThan(0);
      for (const tpl of slottedForum) expect(tpl.slots.length).toBeGreaterThan(0);
    }
  });

  it("flavourRootCounts answers the chip rail before it is clicked", () => {
    const counts = flavourRootCounts();
    let total = 0;
    for (const [, n] of counts) total += n;
    expect(total).toBe(POOL.length); // every line owned by exactly one root
    // full root census over the fourteen-pack pool (disk truth, #D5 + colo + backup-archival + dbaas + observability + ci-build-farm re-roll)
    expect([...counts.entries()]).toEqual([
      ["abuse", 4],
      ["achievement", 42],
      ["canary", 2],
      ["chatter", 21],
      ["codex", 24],
      ["forum", 11],
      ["intern", 4],
      ["loading", 35],
      ["press", 6],
      ["sticky", 13],
      ["ticket", 54],
      ["vendor", 56],
    ]);
    const names = [...counts.keys()];
    expect(names).toStrictEqual([...names].sort(compareCodeUnits));
  });
});
