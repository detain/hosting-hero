/**
 * i18n pack consumption contract (R46; §9.3/§9.11) — strict boundary parse,
 * root wall, resolution, era picking, deterministic fill, ×100 determinism.
 *
 * REAL packs are read from disk (read-only, same node:fs pattern as
 * real-content.test.ts); every wall/shape rejection is exercised on FORGED
 * clones — the shipped packs are never edited here.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { LoaderError, type LoaderErrorCode } from "../boundary";
import {
  fillTemplate,
  fillTemplateBody,
  loadI18nPack,
  pickEraText,
  resolveTemplate,
  stableSerializePackKeys,
  type I18nTemplate,
  type LoadedI18nPack,
} from "../packs";
import { cloneJson } from "./helpers";

const PACKS_DIR = join(process.cwd(), "..", "content", "packs");

function packText(name: string): string {
  return readFileSync(join(PACKS_DIR, name), "utf8");
}

/** The fourteen disk packs (code-unit by file name) — the era-pin collector
 *  (L-ER-G) widened this suite's real-corpus arms from the two baseline packs
 *  to the whole bank so no type pack's era copy is policed only by the proto
 *  flavour-feed pins. ADR-0018 program 1a landed era bodies in all of them. */
const DISK_PACK_FILES: readonly string[] = readdirSync(PACKS_DIR)
  .filter((name) => name.endsWith(".i18n.json"))
  .sort();

function packStem(file: string): string {
  return file.replace(/\.i18n\.json$/, "");
}

function parsePackText(name: string): LoadedI18nPack {
  return loadI18nPack(JSON.parse(packText(name)) as unknown);
}

const SHARED = parsePackText("shared-web.i18n.json");
const GAME = parsePackText("game.i18n.json");

function forge(name: "shared-web" | "game"): Record<string, unknown> {
  return cloneJson(JSON.parse(packText(`${name}.i18n.json`)) as Record<string, unknown>);
}

function expectPackError(fn: () => unknown, code: LoaderErrorCode, fragment: string): void {
  let thrown: unknown = null;
  try {
    fn();
  } catch (err) {
    thrown = err;
  }
  expect(thrown, `expected LoaderError ${code}, nothing was thrown`).toBeInstanceOf(LoaderError);
  const err = thrown as LoaderError;
  expect(err.code).toBe(code);
  expect(err.message).toContain(fragment);
}

/* The four era-variant keys the shared-web pack actually ships (§9.3 era anchors),
   each quad-rung across the OD-22(c) canon since L-ER-B. */
const ERA_KEYS: readonly string[] = [
  "scenarios.shared-web.slashdot",
  "ticket.subject.dev-left",
  "ticket.subject.cron",
  "loading.tip.cold-aisle",
];

function variantOf(pack: LoadedI18nPack, key: string): Extract<I18nTemplate, { kind: "era-variant" }> {
  const t = resolveTemplate(pack, key);
  if (t.kind !== "era-variant") throw new Error(`${key} is not era-variant in this fixture`);
  return t;
}

describe("loadI18nPack — the two REAL packs parse through the strict boundary", () => {
  test("all fourteen disk packs load through the strict boundary with zero errors (L-ER-G widening)", () => {
    // the two baseline packs parse at module top (SHARED/GAME) — this arm
    // proves the twelve type packs the era fans touched still parse too
    expect(DISK_PACK_FILES.length).toBe(14);
    for (const file of DISK_PACK_FILES) {
      expect(() => parsePackText(file), file).not.toThrow();
    }
  });

  test("header fields land as parsed strings", () => {
    expect(SHARED.schemaVersion).toBe(1);
    expect(SHARED.packId).toBe("pack:shared-web.i18n");
    expect(SHARED.appliesTo).toBe("official:shared-web");
    expect(SHARED.locale).toBe("en");
    expect(GAME.packId).toBe("pack:game-servers.i18n");
    expect(GAME.appliesTo).toBe("official:game-servers");
    expect(typeof SHARED.note).toBe("string");
    expect(typeof SHARED.todo).toBe("string");
  });

  test("namespace key counts are pinned (42/61 shared-web, 34/41 game)", () => {
    expect(SHARED.decision.size).toBe(42);
    expect(SHARED.flavour.size).toBe(61);
    expect(stableSerializePackKeys(SHARED).length).toBe(103);
    expect(GAME.decision.size).toBe(34);
    expect(GAME.flavour.size).toBe(41);
    expect(stableSerializePackKeys(GAME).length).toBe(75);
  });

  test("canonical-death alert keys parse era-flat with zero slots (L4 voice seam)", () => {
    /* The runner/ticker data path carries no company label (covenant-breached
       precedent, a98fd55), so the two OD-25(a) decision keys must stay
       plain-string templates with no {slots} — flat across eras by design:
       the end of a company is not an era-flavored joke. */
    for (const key of ["alert.death-imminent", "alert.company-dissolved"]) {
      const template = resolveTemplate(SHARED, key);
      expect(template.kind).toBe("plain"); // era-flat: no variant object
      expect([...template.slots]).toEqual([]); // zero-slot: fills with {} alone
    }
  });

  test("era axis: shared-web declares the four-rung canon ascending; game declares the same canon", () => {
    expect([...SHARED.eraCodes.keys()]).toEqual([1998, 2008, 2016, 2026]);
    expect(SHARED.eraCodes.get(1998)).toContain("founding era");
    expect([...GAME.eraCodes.keys()]).toEqual([1998, 2008, 2016, 2026]);
  });

  test("slot glossaries parse with kinds + descs (47 shared-web, 46 game)", () => {
    expect(SHARED.slots.size).toBe(47);
    expect(GAME.slots.size).toBe(46);
    const nodeId = SHARED.slots.get("nodeId");
    expect(nodeId?.kind).toBe("entity");
    expect(typeof nodeId?.desc).toBe("string");
    expect(SHARED.slots.get("arrivalCount")?.kind).toBe("number");
    expect(GAME.slots.get("populationPct")?.kind).toBe("pct");
  });

  test("provenance is total: every template key carries a cite string or null", () => {
    for (const key of stableSerializePackKeys(SHARED)) {
      expect(SHARED.provenance.has(key), `provenance for ${key}`).toBe(true);
    }
    expect(SHARED.provenance.get("scarce.shared-web.qos")).toBeNull();
    expect(SHARED.provenance.get("status.rung-1")).toContain("§9.3");
    expect(SHARED.provenance.get("_todo")).toContain("Never invent law-numbers");
  });

  test("era-variant roster: exactly shared-web's four + game's two, all quad-rung {eras, fallback} maps", () => {
    const found: string[] = [];
    for (const map of [SHARED.decision, SHARED.flavour]) {
      for (const [key, template] of map) if (template.kind === "era-variant") found.push(key);
    }
    expect(found.sort((a, b) => (a < b ? -1 : 1))).toEqual([...ERA_KEYS].sort((a, b) => (a < b ? -1 : 1)));
    for (const key of ERA_KEYS) {
      const t = variantOf(SHARED, key);
      expect([...t.eras.keys()]).toEqual([1998, 2008, 2016, 2026]);
      expect(typeof t.fallback).toBe("string");
    }
    // game pack (L-ER-B): era-variants on two pack-unique FLAVOUR keys only —
    // the decision namespace and every other key stay plain (its _todo pins this state)
    const gameEraFound: string[] = [];
    for (const map of [GAME.decision, GAME.flavour]) {
      for (const [key, template] of map) {
        if (template.kind === "era-variant") gameEraFound.push(key);
        else expect(template.kind).toBe("plain");
      }
    }
    expect(gameEraFound.sort((a, b) => (a < b ? -1 : 1))).toEqual(["chatter.quiet.naming", "ticket.subject.griefed"]);
    for (const key of gameEraFound) {
      const t = variantOf(GAME, key);
      expect([...t.eras.keys()]).toEqual([1998, 2008, 2016, 2026]);
      expect(typeof t.fallback).toBe("string");
    }
  });

  test("era-variant roster across ALL FOURTEEN disk packs — the L-ER-G collector census, parsed through the strict boundary", () => {
    // Same 42-key truth era-canon.test.ts counts on raw JSON, re-derived here
    // through loadI18nPack: every one of the fourteen packs parses at the
    // boundary AND its era-variant roster (key → ascending rungs actually
    // authored) matches the disk table. Re-pinned from disk probes 2026-10-17;
    // the rung SETS differ per key on purpose — packs whose product class was
    // born mid-canon (object-storage, ci/colo/dbaas post-1998 copy, the
    // cloud-native sketches in observability/serverless) author the LATER
    // rungs and let the exact>earlier>fallback ladder degrade honestly.
    // The shared registers (refusal.*/status.rung-*/vendor.reply.*) are plain
    // everywhere — no era body was smuggled into a cross-pack twin line.
    const expectRoster = new Map<string, ReadonlyMap<string, readonly number[]>>([
      ["backup-archival", new Map([
        ["forum.thread.rategb", [2008, 2016, 2026]],
        ["loading.tip.rto", [1998, 2008, 2016, 2026]],
        ["ticket.subject.hollow", [2008, 2016, 2026]],
      ])],
      ["ci-build-farm", new Map([
        ["chatter.desk.wall", [2008, 2016, 2026]],
        ["chatter.runner.hum", [2008, 2016, 2026]],
        ["forum.thread.matrix", [2008, 2016, 2026]],
      ])],
      ["colo", new Map([
        ["chatter.desk.aisle", [2008, 2016, 2026]],
        ["forum.thread.clamp", [2008, 2016, 2026]],
        ["ticket.subject.reboot7", [2008, 2016, 2026]],
      ])],
      ["dbaas", new Map([
        ["chatter.cellar.static", [2008, 2016, 2026]],
        ["ticket.subject.pool", [2008, 2016, 2026]],
        ["ticket.subject.upgrade", [2008, 2016, 2026]],
      ])],
      ["dedicated", new Map([
        ["chatter.stable.smell", [1998, 2008, 2016, 2026]],
        ["forum.thread.four-hours", [1998, 2008, 2016, 2026]],
        ["ticket.subject.leds-mean", [1998, 2008, 2016, 2026]],
      ])],
      ["dns-hosting", new Map([
        ["codex.free-tier", [1998, 2008, 2026]], // the 2016 rung is not authored — the ladder covers it
        ["loading.tip.throttle", [1998, 2008, 2016, 2026]],
        ["ticket.subject.zone-lockout", [1998, 2008, 2026]],
      ])],
      ["exchange-colo", new Map([
        ["chatter.desk.equal", [1998, 2008, 2016, 2026]],
        ["chatter.desk.eye", [1998, 2008, 2016, 2026]],
        ["forum.thread.tier", [1998, 2008, 2016, 2026]],
      ])],
      ["game", new Map([
        ["chatter.quiet.naming", [1998, 2008, 2016, 2026]],
        ["ticket.subject.griefed", [1998, 2008, 2016, 2026]],
      ])],
      ["mail-hosting", new Map([
        ["abuse.canon.postmaster", [1998, 2008, 2016, 2026]],
        ["ticket.body.list-bought", [1998, 2008, 2016, 2026]],
        ["ticket.subject.list-bought", [1998, 2008, 2016, 2026]],
      ])],
      ["object-storage", new Map([
        ["chatter.desk.invisible", [2008, 2016, 2026]], // S3-alike: born after the 1998 rung
        ["forum.thread.nines-promise", [2008, 2016, 2026]],
        ["ticket.subject.where-my-data", [2008, 2016, 2026]],
      ])],
      ["observability", new Map([
        ["chatter.wall.hum", [2008, 2016, 2026]],
        ["codex.cardinality", [2016, 2026]], // cloud-native sketch: two rungs only
        ["loading.tip.fan", [2008, 2016, 2026]],
      ])],
      ["serverless", new Map([
        ["loading.tip.zero", [1998, 2008, 2016, 2026]],
        ["ticket.subject.first-visit", [1998, 2008, 2016, 2026]],
        ["ticket.subject.starved", [2016, 2026]], // true opening rung per §5.6's gate
      ])],
      ["shared-web", new Map([
        ["loading.tip.cold-aisle", [1998, 2008, 2016, 2026]],
        ["scenarios.shared-web.slashdot", [1998, 2008, 2016, 2026]],
        ["ticket.subject.cron", [1998, 2008, 2016, 2026]],
        ["ticket.subject.dev-left", [1998, 2008, 2016, 2026]],
      ])],
      ["trunk-group-voip", new Map([
        ["ticket.body.monday-bill", [1998, 2008, 2016, 2026]],
        ["ticket.subject.e911", [1998, 2008, 2016, 2026]],
        ["ticket.subject.nine-am", [1998, 2008, 2016, 2026]],
      ])],
    ]);
    expect([...expectRoster.keys()].sort()).toEqual(DISK_PACK_FILES.map(packStem).sort());
    let totalKeys = 0;
    for (const file of DISK_PACK_FILES) {
      const pack = parsePackText(file);
      const found = new Map<string, readonly number[]>();
      for (const map of [pack.decision, pack.flavour]) {
        for (const [key, template] of map) {
          if (template.kind === "era-variant") found.set(key, [...template.eras.keys()].sort((a, b) => a - b));
        }
      }
      const expected = expectRoster.get(packStem(file))!;
      totalKeys += found.size;
      expect([...found.keys()].sort(), file).toEqual([...expected.keys()].sort());
      for (const [key, rungs] of found) {
        expect([...rungs], `${file} ${key}`).toEqual([...expected.get(key)!]);
      }
      // every authored rung must be DECLARED in the pack's eraCodes (the
      // loader refuses the reverse direction; this pins the canon's own)
      for (const rung of [...found.values()].flat()) {
        expect(pack.eraCodes.has(rung), `${file} rung ${rung}`).toBe(true);
      }
    }
    expect(totalKeys).toBe(42);
  });

  test("the result is deep-frozen and the maps are sealed (no .set surface)", () => {
    expect(Object.isFrozen(SHARED)).toBe(true);
    expect(Object.isFrozen(SHARED.decision)).toBe(true);
    const template = resolveTemplate(SHARED, "ticket.subject.fwd");
    expect(Object.isFrozen(template)).toBe(true);
    expect(Object.isFrozen(template.slots)).toBe(true);
    expect((SHARED.decision as unknown as { set?: unknown }).set).toBeUndefined();
    expect(() => {
      (SHARED as { packId: string }).packId = "mutated";
    }).toThrow(TypeError);
  });

  test("stableSerializePackKeys is code-unit sorted (independently checked) and boundary-pinned", () => {
    for (const pack of [SHARED, GAME]) {
      const keys = stableSerializePackKeys(pack);
      const resorted = [...keys].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
      expect(keys).toEqual(resorted);
    }
    expect(stableSerializePackKeys(SHARED).slice(0, 3)).toEqual([
      "abuse.canon.null-route",
      "abuse.canon.relay",
      "abuse.canon.upstream",
    ]);
    expect(stableSerializePackKeys(SHARED).at(-1)).toBe("visitor.unit.page-load");
    expect(stableSerializePackKeys(GAME).at(-1)).toBe("visitor.unit.player-session");
  });
});

describe("decision/flavour root wall (§9.3 separation law)", () => {
  test("a flavour root forged into decision fails loud with BAD_ENUM", () => {
    const raw = forge("shared-web");
    (raw.decision as Record<string, unknown>)["ticket.misuse"] = "joke hidden in a crisis prompt";
    expectPackError(() => loadI18nPack(raw), "BAD_ENUM", "root 'ticket' is not in the decision vocabulary");
  });

  test("a decision root forged into flavour fails loud with BAD_ENUM", () => {
    const raw = forge("game");
    (raw.flavour as Record<string, unknown>)["terms.misuse"] = "a warning smuggled into comedy";
    expectPackError(() => loadI18nPack(raw), "BAD_ENUM", "root 'terms' is not in the flavour vocabulary");
  });

  test("a root in NEITHER vocabulary fails loud, naming both closed sets", () => {
    const raw = forge("shared-web");
    (raw.decision as Record<string, unknown>)["zeta.thing"] = "undeclared vocabulary";
    expectPackError(() => loadI18nPack(raw), "BAD_ENUM", "root 'zeta'");
    expectPackError(() => loadI18nPack(raw), "BAD_ENUM", "decision roots [type, visitor, goal, scarce");
  });

  test("the same key in BOTH namespaces fails loud (parse-time global uniqueness)", () => {
    const raw = forge("shared-web");
    (raw.flavour as Record<string, unknown>)["status.rung-1"] = "duplicated status line";
    expectPackError(() => loadI18nPack(raw), "UNKNOWN_FIELD", "key present in BOTH decision and flavour");
  });
});

describe("forged packs fail loud at the boundary", () => {
  test("template body that is not a string fails with WRONG_TYPE", () => {
    const raw = forge("shared-web");
    (raw.decision as Record<string, unknown>)["terms.numeric"] = 42;
    expectPackError(() => loadI18nPack(raw), "WRONG_TYPE", "expected string or {eras, fallback}");
  });

  test("era object missing fallback fails with MISSING_FIELD", () => {
    const raw = forge("shared-web");
    (raw.decision as Record<string, unknown>)["scenarios.shared-web.halfera"] = {
      eras: { "1998": "only eras" },
    };
    expectPackError(() => loadI18nPack(raw), "MISSING_FIELD", "required field 'fallback' is absent");
  });

  test("era object with an unexpected key fails with UNKNOWN_FIELD", () => {
    const raw = forge("shared-web");
    (raw.decision as Record<string, unknown>)["scenarios.shared-web.bonus"] = {
      eras: { "1998": "a", "2026": "b" },
      fallback: "a",
      bonus: "sneak",
    };
    expectPackError(() => loadI18nPack(raw), "UNKNOWN_FIELD", "field 'bonus' is not declared");
  });

  test("unbalanced braces fail with BAD_PATTERN (slot syntax is {name} only)", () => {
    const raw = forge("shared-web");
    (raw.flavour as Record<string, unknown>)["ticket.subject.oops"] = "oops {unclosed";
    expectPackError(() => loadI18nPack(raw), "BAD_PATTERN", "unbalanced braces");
  });

  test("a bad slot token name fails with BAD_PATTERN", () => {
    const raw = forge("shared-web");
    (raw.flavour as Record<string, unknown>)["ticket.subject.badslot"] = "value {Bad-Slot} here";
    expectPackError(() => loadI18nPack(raw), "BAD_PATTERN", "bad slot token '{Bad-Slot}'");
  });

  test("era code that is not a 4-digit year fails with BAD_PATTERN", () => {
    const raw = forge("shared-web");
    (raw.flavour as Record<string, unknown>)["loading.tip.shortera"] = {
      eras: { "99": "two-digit" },
      fallback: "body",
    };
    expectPackError(() => loadI18nPack(raw), "BAD_PATTERN", "era code must be a 4-digit year");
  });

  test("an era variant referencing an UNDECLARED era fails with BAD_ENUM", () => {
    const raw = forge("shared-web");
    (raw.flavour as Record<string, unknown>)["loading.tip.futuretip"] = {
      eras: { "2031": "not on the declared axis" },
      fallback: "body",
    };
    expectPackError(() => loadI18nPack(raw), "BAD_ENUM", "era '2031' not declared in pack eraCodes [1998, 2008, 2016, 2026]");
  });

  test("era variant whose slot set differs from fallback fails loud", () => {
    const raw = forge("shared-web");
    (raw.flavour as Record<string, unknown>)["loading.tip.drift"] = {
      eras: { "1998": "needs {siteCount} only" },
      fallback: "needs nothing",
    };
    expectPackError(() => loadI18nPack(raw), "WRONG_TYPE", "differs from fallback");
  });

  test("schemaVersion other than 1 fails with BAD_ENUM (never half-consumed)", () => {
    const raw = forge("shared-web");
    raw.schemaVersion = 2;
    expectPackError(() => loadI18nPack(raw), "BAD_ENUM", "only i18n pack schemaVersion 1 is consumed");
  });

  test("bad locale / bad packId / unknown top-level field all fail loud", () => {
    const badLocale = forge("shared-web");
    badLocale.locale = "EN";
    expectPackError(() => loadI18nPack(badLocale), "BAD_PATTERN", "fails the BCP-47-lite locale pattern");

    const badId = forge("shared-web");
    badId.packId = "shared-web";
    expectPackError(() => loadI18nPack(badId), "BAD_PATTERN", "fails the pack id pattern");

    const bonus = forge("shared-web");
    bonus.extras = { any: "thing" };
    expectPackError(() => loadI18nPack(bonus), "UNKNOWN_FIELD", "field 'extras' is not declared");
  });

  test("provenance holes and orphans both fail loud", () => {
    const hole = forge("game");
    delete (hole._provenance as Record<string, unknown>)["achievement.five-nines"];
    expectPackError(() => loadI18nPack(hole), "MISSING_FIELD", "no provenance entry for template key 'achievement.five-nines'");

    const orphan = forge("game");
    (orphan._provenance as Record<string, unknown>)["ghost.key"] = "cites a template that never existed";
    expectPackError(() => loadI18nPack(orphan), "UNKNOWN_FIELD", "provenance entry with no matching template key");
  });

  test("an empty decision namespace fails with OUT_OF_RANGE", () => {
    const raw = forge("game");
    raw.decision = {};
    expectPackError(() => loadI18nPack(raw), "OUT_OF_RANGE", "the decision namespace is empty");
  });

  test("a slot glossary entry with an unknown kind fails with BAD_ENUM", () => {
    const raw = forge("game");
    (raw.slots as Record<string, unknown>)["vibes"] = { kind: "feelings", desc: "not a kind" };
    expectPackError(() => loadI18nPack(raw), "BAD_ENUM", "'feelings' is not a slot kind");
  });
});

describe("resolveTemplate", () => {
  test("hits report their parsed namespace and key", () => {
    const decision = resolveTemplate(SHARED, "status.rung-5");
    expect(decision.namespace).toBe("decision");
    expect(decision.key).toBe("status.rung-5");
    const flavour = resolveTemplate(GAME, "achievement.five-nines");
    expect(flavour.namespace).toBe("flavour");
    expect([...flavour.slots]).toEqual([]);
  });

  test("a miss fails loud naming the key and the pack", () => {
    expectPackError(
      () => resolveTemplate(SHARED, "ticket.subject.never-authored"),
      "MISSING_FIELD",
      "no template 'ticket.subject.never-authored' in pack 'pack:shared-web.i18n'",
    );
  });
});

describe("fillTemplate / fillTemplateBody — exact-set deterministic substitution", () => {
  test("happy path renders literal output", () => {
    expect(fillTemplate(SHARED, "ticket.subject.fwd", { site: "example.com", replyCount: 14 })).toBe(
      "Fwd: Fwd: Fwd: RE: example.com (14 replies)",
    );
    expect(fillTemplate(GAME, "achievement.five-nines", {})).toBe("Five Nines, Zero Sleep.");
  });

  test("missing slots fail loud listing EVERY absent name, sorted", () => {
    expectPackError(
      () => fillTemplate(SHARED, "ticket.subject.fwd", { replyCount: 14 }),
      "MISSING_FIELD",
      "slots [site] are required but were not provided",
    );
  });

  test("the abuse upstream key lists its five slots when none are provided", () => {
    expectPackError(
      () => fillTemplate(SHARED, "abuse.canon.upstream", {}),
      "MISSING_FIELD",
      "slots [caseId, prefix, responseHours, upstreamDomain, victimDomain] are required but were not provided",
    );
  });

  test("extra slots fail loud listing them", () => {
    expectPackError(
      () => fillTemplate(SHARED, "ticket.subject.fwd", { site: "a.com", replyCount: 3, nope: 1, alsoNope: 2 }),
      "UNKNOWN_FIELD",
      "slots [alsoNope, nope] are not used by this template",
    );
  });

  test("substituted braces stay inert — no recursive expansion", () => {
    const out = fillTemplate(SHARED, "ticket.subject.fwd", { site: "{replyCount} down", replyCount: 14 });
    expect(out).toBe("Fwd: Fwd: Fwd: RE: {replyCount} down (14 replies)");
    expect(out).not.toContain("14 down");
  });

  test("a non-integer numeric slot value fails loud", () => {
    expectPackError(
      () => fillTemplate(SHARED, "ticket.subject.fwd", { site: "a.com", replyCount: 0.5 }),
      "WRONG_TYPE",
      "neither a string nor a safe integer",
    );
  });

  test("fillTemplate on an era-variant key fails loud pointing at pickEraText", () => {
    expectPackError(
      () => fillTemplate(SHARED, "ticket.subject.dev-left", {}),
      "WRONG_TYPE",
      "pickEraText(pack, 'ticket.subject.dev-left', eraYear)",
    );
  });

  test("fillTemplateBody is the composition partner for picked era text", () => {
    const body = pickEraText(SHARED, "scenarios.shared-web.slashdot", 1998);
    expect(body).toContain("front page");
    expect(fillTemplateBody(body, { arrivalCount: 900 })).toContain("900 strangers arrive inside the hour");
  });
});

describe("pickEraText — exact year > nearest EARLIER year > fallback (table-driven)", () => {
  // Shared-web declares the four-rung OD-22(c) canon {1998, 2008, 2016, 2026};
  // the ladder pins every rung and every inter-rung gap (L-ER-B).
  const LADDER: readonly (readonly [number, "fallback" | 1998 | 2008 | 2016 | 2026])[] = [
    [1997, "fallback"], // before every era → fallback speaks
    [1998, 1998], // exact hit at the first rung
    [1999, 1998], // nearest earlier, strictly not later
    [2007, 1998], // one tick before 2008 → still the founding era
    [2008, 2008], // exact hit
    [2011, 2008], // mid-gap stays with the earlier era
    [2015, 2008], // one tick before 2016 → still the gloss era
    [2016, 2016], // exact hit
    [2017, 2016], // nearest earlier after the flat rung arrives
    [2025, 2016], // one tick before 2026 → still the earlier era
    [2026, 2026], // exact hit at the late boundary
    [2027, 2026], // after every era → latest entry (which is earlier)
  ];

  for (const key of ERA_KEYS) {
    test(`ladder on '${key}'`, () => {
      const t = variantOf(SHARED, key);
      for (const [year, expected] of LADDER) {
        const got = pickEraText(SHARED, key, year);
        expect(got, `era ${year}`).toBe(expected === "fallback" ? t.fallback : t.eras.get(expected));
      }
    });
  }

  test("plain keys return their body unchanged (eraYear inert)", () => {
    expect(pickEraText(SHARED, "status.rung-5", 1997)).toBe("We are aware of the fire.");
    expect(pickEraText(GAME, "status.rung-1", 2050)).toBe("Investigating elevated error rates");
  });

  test("non-integer era years fail loud (plain-number law, no Date)", () => {
    expectPackError(() => pickEraText(SHARED, "status.rung-5", 1998.5), "NOT_A_SAFE_INTEGER", "not a plain integer year");
  });
});

describe("×100 load+consume determinism over the real packs", () => {
  /** Full scripted battery: serialize keys, resolve everything, fill every
   *  body (plain + each era rung + fallback) with name-as-value slots. */
  function runBattery(packName: "shared-web.i18n.json" | "game.i18n.json"): string {
    const pack = parsePackText(packName);
    const lines: string[] = [stableSerializePackKeys(pack).join("|")];
    for (const key of stableSerializePackKeys(pack)) {
      const template = resolveTemplate(pack, key);
      const slotValues: Record<string, string> = {};
      for (const slot of template.slots) slotValues[slot] = `<${slot}>`;
      if (template.kind === "plain") {
        lines.push(fillTemplateBody(template.body, slotValues, key));
      } else {
        for (const year of [1997, ...template.eras.keys(), 2027]) {
          lines.push(fillTemplateBody(pickEraText(pack, key, year), slotValues, `${key}@${year}`));
        }
      }
    }
    return lines.join("\n");
  }

  test("100 fresh parses agree on keys and on the scripted fill battery, byte-identical", () => {
    for (const packName of ["shared-web.i18n.json", "game.i18n.json"] as const) {
      const first = runBattery(packName);
      for (let i = 0; i < 99; i++) {
        expect(runBattery(packName), `${packName} battery drift at run ${i}`).toBe(first);
      }
    }
  });
});
