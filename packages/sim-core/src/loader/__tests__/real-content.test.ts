/**
 * REAL-CONTENT run (read-only!): load the shipped packages/content bundles,
 * collect their _todo debt, and run the Ruleset Diff Linter against the real
 * registries + every wave file on disk. Verdicts are PRINTED for the
 * orchestrator report; nothing here edits content.
 *
 * Known state at time of writing (owner note): the waves lane is mid-flight
 * fixing the real g1 wave file's ROLE/TWO-FRONT LAW failures — those are
 * §1.7/§2.24 laws owned by src/waves, OUT OF SCOPE for this linter's three
 * structural shapes; if future law-gates are ever wired in here they must be
 * reported as expected-until-fixed, never block on them.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { loadTypeBundle } from "../bundle";
import { formatLintReport, lintRulesetCorpus, type LintReport } from "../lint";
import { parseThreatRegistry, parseVisitorArchetypeRegistry } from "../registries";
import { collectTodos } from "../todo";
import { bundlesLiveInEra } from "../eras";

const CONTENT = join(process.cwd(), "..", "content");

function readJson(...parts: string[]): unknown {
  return JSON.parse(readFileSync(join(CONTENT, ...parts), "utf8")) as unknown;
}

const typeFiles = readdirSync(join(CONTENT, "types"))
  .filter((name) => name.endsWith(".json"))
  .sort();

describe("real packages/content loads through the strict boundary", () => {
  test("every shipped type-bundle loads with zero errors", () => {
    expect(typeFiles).toEqual(["dns-hosting.json", "game-servers.json", "mail-hosting.json", "shared-web.json"]);
    for (const name of typeFiles) {
      expect(() => loadTypeBundle(readJson("types", name))).not.toThrow();
    }
  });

  test("blessed extensions land as exact whole-scale Fixed (20× → 1310720n; 85 pct → 5570560n)", () => {
    const game = loadTypeBundle(readJson("types", "game-servers.json"));
    expect(game.economy.hypeCycle?.launchMultiplier).toBe(1_310_720n);
    expect(game.economy.hypeCycle?.launchWeeks).toBe(393_216n);
    expect(game.economy.hypeCycle?.evaporationPct).toBe(5_570_560n);
    expect(game.economy.chargebackRate?.pctOfRevenue).toBeNull();
    expect(game.economy.chargebackRate?.range).toBe("2-4");
    const shared = loadTypeBundle(readJson("types", "shared-web.json"));
    expect(shared.economy.chargebackRate).toBeUndefined();
    expect(shared.economy.hypeCycle).toBeUndefined();
  });

  test("_todo debt inventory is reported per bundle (warn, never throw)", () => {
    for (const name of typeFiles) {
      const report = collectTodos(readJson("types", name), `types/${name}`);
      const line = `  ${name}: ${report.entries.length} placeholders → critical=${report.counts.critical} cosmetic=${report.counts.cosmetic} standard=${report.counts.standard} exempt=${report.counts.exempt}`;
      console.log(line);
      expect(report.entries.length).toBeGreaterThan(0);
      expect(report.entries.every((e) => e.field.length > 0)).toBe(true);
    }
  });
});

describe("real-content Ruleset Diff Lint verdict", () => {
  function realReport(): LintReport {
    const bundles = typeFiles.map((name) => loadTypeBundle(readJson("types", name)));
    const threats = parseThreatRegistry(readJson("threats", "registry-core.json"));
    const visitors = parseVisitorArchetypeRegistry(readJson("visitors", "archetypes-core.json"));
    const wavesDir = join(CONTENT, "waves");
    const waves = new Map<string, unknown>();
    if (existsSync(wavesDir)) {
      for (const name of readdirSync(wavesDir).sort()) {
        if (!name.endsWith(".json")) continue;
        waves.set(`waves/${name}`, readJson("waves", name));
      }
    }
    console.log(`  wave docs present: [${[...waves.keys()].join(", ")}]`);
    return lintRulesetCorpus({ bundles, threats, visitors, waves });
  }

  test("verdict printed; the shipped corpus passes the diff-lint gate", () => {
    const report = realReport();
    for (const line of formatLintReport(report)) console.log(line);
    const errors = report.findings.filter((f) => f.severity === "error");
    // Missing wave slices ride as CROSS_REF warns (README: authored later) and a
    // sparse pair may ride as a CHANGED_HOOKS "distance unmeasurable" minor.
    const allowedWarns = [/not present in the corpus/, /distance unmeasurable/];
    for (const warn of report.findings.filter((f) => f.severity === "warn")) {
      expect(allowedWarns.some((re) => re.test(warn.detail))).toBe(true);
    }
    // The shipped anchor resolves, so the §7.8 budget is measured for real.
    expect(report.findings.some((f) => f.detail.includes("falling back to the first-sorted id"))).toBe(false);
    // Today the shipped corpus is literally clean: all three g1 slices on disk and
    // every type well-declared against the anchor. A new benign warn must be
    // re-authorized in `allowedWarns` AND here.
    expect(report.findings).toEqual([]);
    expect(errors).toEqual([]);
    expect(report.pass).toBe(true);
  });

  test("era roster on real content: 2010 lists every official line", () => {
    const bundles = typeFiles.map((name) => loadTypeBundle(readJson("types", name)));
    const live2010 = bundlesLiveInEra(bundles, 2010, { includeUndocumented: true });
    expect(live2010).toEqual(["official:dns-hosting", "official:game-servers", "official:mail-hosting", "official:shared-web"]);
    // dns-hosting, game-servers and mail-hosting eras.availableFrom are unauthored placeholders
    // (§0.4 R66): without the undocumented opt-in they must NOT be silently granted.
    expect(bundlesLiveInEra(bundles, 2010)).toEqual(["official:shared-web"]);
  });
});
