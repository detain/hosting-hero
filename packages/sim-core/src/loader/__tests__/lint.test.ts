/**
 * Ruleset Diff Linter tests: the fixture twin passes every rule; each rule
 * is then violated by exactly one crafted mutation and the report must carry
 * EXACTLY that code. Cross-ref and wave-structure legs get their own cases.
 */

import { describe, expect, test } from "vitest";
import {
  lintRulesetCorpus,
  waveRefKey,
  type LintConfig,
  type LintFinding,
  type LintReport,
  type RulesetCorpus,
} from "../lint";
import type { LoadedTypeBundle } from "../bundle";
import { parseThreatRegistry, parseVisitorArchetypeRegistry } from "../registries";
import {
  ALPHA,
  BETA,
  cloneJson,
  miniCorpus,
  miniWaves,
  mutatedBundle,
  readFixture,
  sparseHooksBundle,
} from "./helpers";

const codesOf = (report: LintReport): string[] => report.findings.map((f) => f.code);

const hookFindings = (report: LintReport): readonly LintFinding[] =>
  report.findings.filter((f) => f.code === "CHANGED_HOOKS");

/** Corpus carrying an explicit `config`, bypassing miniCorpus' pinned baseline. */
function corpusWithConfig(
  bundles: readonly LoadedTypeBundle[],
  config: LintConfig,
  waves: Map<string, unknown> = miniWaves(),
): RulesetCorpus {
  return miniCorpus({ bundles, config, waves });
}

describe("clean corpus passes", () => {
  test("the crafted twin pair violates nothing", () => {
    const report = lintRulesetCorpus(miniCorpus());
    expect(report.findings).toEqual([]);
    expect(report.pass).toBe(true);
  });

  test("a single-bundle corpus never invents pairwise findings", () => {
    const report = lintRulesetCorpus(miniCorpus({ bundles: [ALPHA()] }));
    expect(report.pass).toBe(true);
  });

  test("waveRefKey strips the file: scheme only", () => {
    expect(waveRefKey("file:waves/x.json")).toBe("waves/x.json");
    expect(waveRefKey("waves://x")).toBeNull();
  });
});

describe("THREE_CHANGE — scarce + fatal + customer must ALL differ", () => {
  test("same scarce resource fails the gate and names the stays", () => {
    const report = lintRulesetCorpus(
      miniCorpus({
        bundles: [
          ALPHA(),
          mutatedBundle("minimal-beta.json", (raw) => {
            (raw.scarce as Record<string, unknown>)["resourceId"] = "cpu-slice";
          }),
        ],
      }),
    );
    expect(codesOf(report)).toEqual(["THREE_CHANGE"]);
    expect(report.findings[0]?.detail).toContain("scarce resource stays 'cpu-slice'");
    expect(report.findings[0]?.cite).toContain("§0.2");
    expect(report.pass).toBe(false);
  });

  test("same fatal failure + same customer identity stacks into one finding", () => {
    const report = lintRulesetCorpus(
      miniCorpus({
        bundles: [
          ALPHA(),
          mutatedBundle("minimal-beta.json", (raw) => {
            (raw.goal as Record<string, unknown>)["loseCondition"] = { kind: "queue-collapse-spiral" };
            (raw.visitor as Record<string, unknown>)["unitTerm"] = "page-visit";
            (raw.economy as Record<string, unknown>)["unitOfSale"] = "account";
          }),
        ],
      }),
    );
    expect(codesOf(report)).toEqual(["THREE_CHANGE"]);
    expect(report.findings[0]?.detail).toContain("fatal failure stays");
    expect(report.findings[0]?.detail).toContain("customer identity stays");
  });

  test("customer identity counts as changed if EITHER unitTerm or unitOfSale moves", () => {
    const report = lintRulesetCorpus(
      miniCorpus({
        bundles: [
          ALPHA(),
          mutatedBundle("minimal-beta.json", (raw) => {
            (raw.visitor as Record<string, unknown>)["unitTerm"] = "page-visit"; // keeps unitOfSale distinct
          }),
        ],
      }),
    );
    expect(codesOf(report)).toEqual([]);
  });
});

describe("VERB_SHIFT — dominant verb differs, else MERGE verdict", () => {
  test("shared dominant verb yields the merge verdict", () => {
    const report = lintRulesetCorpus(
      miniCorpus({
        bundles: [
          ALPHA(),
          mutatedBundle("minimal-beta.json", (raw) => {
            (raw.verbs as Record<string, unknown>)["dominant"] = "Triage";
          }),
        ],
      }),
    );
    expect(codesOf(report)).toEqual(["VERB_SHIFT"]);
    expect(report.findings[0]?.detail).toContain("MERGE");
  });

  test("a seventh verb is rejected per bundle", () => {
    const report = lintRulesetCorpus(
      miniCorpus({
        bundles: [
          ALPHA(),
          mutatedBundle("minimal-beta.json", (raw) => {
            (raw.verbs as Record<string, unknown>)["dominant"] = "Fly";
          }),
        ],
      }),
    );
    expect(codesOf(report)).toEqual(["VERB_SHIFT"]);
    expect(report.findings[0]?.bundles).toEqual(["test:min-beta"]);
    expect(report.findings[0]?.detail).toContain("seventh");
  });
});

describe("ROSETTA — handover note three distinct slots", () => {
  test("a repeated handover line fails", () => {
    const report = lintRulesetCorpus(
      miniCorpus({
        bundles: [
          ALPHA(),
          mutatedBundle("minimal-beta.json", (raw) => {
            (raw.handoverNote as Record<string, unknown>)["killsYou"] =
              (raw.handoverNote as Record<string, unknown>)["runsOut"];
          }),
        ],
      }),
    );
    expect(codesOf(report)).toEqual(["ROSETTA"]);
    expect(report.findings[0]?.detail).toContain("handoverNote.killsYou repeats");
  });

  test("duplicate rosetta cards fail", () => {
    const report = lintRulesetCorpus(
      miniCorpus({
        bundles: [
          ALPHA(),
          mutatedBundle("minimal-beta.json", (raw) => {
            raw["rosettaCards"] = [
              { canonical: "meter-needle", alias: "teeth-spacing", line: "rosetta.dup.1" },
              { canonical: "meter-needle", alias: "teeth-spacing", line: "rosetta.dup.2" },
            ];
          }),
        ],
      }),
    );
    expect(codesOf(report)).toEqual(["ROSETTA"]);
  });
});

describe("CHANGED_HOOKS — §7.8 Three-to-Five Change budget", () => {
  test("baseline pair changes exactly three hooks (meter/slider/modules)", () => {
    // proven by the clean pass: shrinking below 3 or above 5 fails below.
    expect(lintRulesetCorpus(miniCorpus()).pass).toBe(true);
  });

  test("below the 3-hook budget = reskin verdict", () => {
    const beta = mutatedBundle("minimal-beta.json", (raw) => {
      const scarce = raw.scarce as Record<string, unknown>;
      scarce["meterWidget"] = "needle-comb";
      scarce["meterBoundStat"] = "requests-in-flight";
      scarce["commercialSlider"] = "oversell-ratio";
      (raw.skin as Record<string, unknown>)["meterFace"] = "comb-dial";
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [ALPHA(), beta] }));
    expect(codesOf(report)).toEqual(["CHANGED_HOOKS"]);
    expect(report.findings[0]?.detail).toContain("1 of the nine");
    expect(report.findings[0]?.detail).toContain("reskin");
    expect(report.findings[0]?.cite).toContain("§7.8");
  });

  test("more than five changed hooks = different-game verdict", () => {
    const beta = mutatedBundle("minimal-beta.json", (raw) => {
      (raw.tempo as Record<string, unknown>)["simTimeScale"] = "s";
      raw.scarce = {
        ...(raw.scarce as Record<string, unknown>),
        windowGrows: true,
        operationalDials: ["panic-threshold", "rebalancer", "cache-ratio"],
        shedOrder: "value-descending",
      };
      raw.control = {
        ...(raw.control as Record<string, unknown>),
        pips: { hardware: 1, software: 1, network: 1, data: 1 },
        keyhole: true,
      };
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [ALPHA(), beta] }));
    const hooks = report.findings.find((f) => f.code === "CHANGED_HOOKS");
    expect(hooks?.detail).toContain("different game");
  });

  test("unknown-vs-known slots never count as changes (placeholders are invisible to the diff)", () => {
    const alphaNullPips = mutatedBundle("minimal-alpha.json", (raw) => {
      raw.control = {
        ...(raw.control as Record<string, unknown>),
        pips: { hardware: null, software: null, network: null, data: null },
      };
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [alphaNullPips, BETA()] }));
    // baseline three changes still hold; no spurious hook from null-vs-1 pips
    expect(report.pass).toBe(true);
  });
});

describe("CHANGED_HOOKS — one designated baseline, not pairwise", () => {
  test("identical non-baseline twins escape the reskin verdict (pairwise would convict)", () => {
    const gamma = mutatedBundle("minimal-beta.json", (raw) => {
      raw["id"] = "test:min-gamma";
      (raw.threats as Record<string, unknown>)["waveTable"] = "file:waves-gamma.json";
    });
    const gammaWave = cloneJson(readFixture("waves-beta.json") as Record<string, unknown>);
    gammaWave["type"] = "test:min-gamma";
    const report = lintRulesetCorpus(
      miniCorpus({
        bundles: [ALPHA(), BETA(), gamma],
        waves: new Map([
          ["waves-alpha.json", readFixture("waves-alpha.json")],
          ["waves-beta.json", readFixture("waves-beta.json")],
          ["waves-gamma.json", gammaWave],
        ]),
      }),
    );
    // BETA ⇄ GAMMA are twins: §7.8 measures each against the baseline (3 hooks),
    // so no hook finding — while the genuinely pairwise laws still convict.
    expect(hookFindings(report)).toEqual([]);
    expect(codesOf(report)).toContain("THREE_CHANGE");
    expect(codesOf(report)).toContain("VERB_SHIFT");
  });

  test("the baseline is exempt from its own budget (self-distance is not a reskin)", () => {
    const report = lintRulesetCorpus(corpusWithConfig([ALPHA()], { baselineId: "test:min-alpha" }));
    expect(report.findings).toEqual([]);
  });

  test("default anchor: 'official:shared-web' is the baseline when present", () => {
    const anchor = mutatedBundle("minimal-alpha.json", (raw) => {
      raw["id"] = "official:shared-web";
    });
    const anchorWave = cloneJson(readFixture("waves-alpha.json") as Record<string, unknown>);
    anchorWave["type"] = "official:shared-web";
    const report = lintRulesetCorpus(
      corpusWithConfig(
        [anchor, BETA()],
        {},
        new Map([
          ["waves-alpha.json", anchorWave],
          ["waves-beta.json", readFixture("waves-beta.json")],
        ]),
      ),
    );
    expect(report.findings).toEqual([]);
  });

  test("no anchor in the corpus → falls back to the first-sorted id, loudly", () => {
    const report = lintRulesetCorpus(corpusWithConfig([ALPHA(), BETA()], {}));
    const notices = hookFindings(report);
    expect(notices.length).toBe(1);
    expect(notices[0]?.severity).toBe("warn");
    expect(notices[0]?.detail).toContain("falling back to the first-sorted id 'test:min-alpha'");
    expect(notices[0]?.detail).toContain("official:shared-web");
    expect(report.pass).toBe(true); // a warn rides along, it does not fail CI
  });

  test("a configured baseline absent from the corpus fails loud and skips the leg", () => {
    const report = lintRulesetCorpus(corpusWithConfig([ALPHA(), BETA()], { baselineId: "official:vps" }));
    const notices = hookFindings(report);
    expect(notices.length).toBe(1);
    expect(notices[0]?.severity).toBe("error");
    expect(notices[0]?.detail).toContain("'official:vps' is not in the corpus");
    expect(report.pass).toBe(false);
  });

  test("minor: ≤2 jointly-declared slots → distance unmeasurable, never a false reskin", () => {
    const sparse = sparseHooksBundle(BETA());
    const report = lintRulesetCorpus(miniCorpus({ bundles: [ALPHA(), sparse] }));
    const verdicts = hookFindings(report);
    expect(verdicts.length).toBe(1);
    expect(verdicts[0]?.severity).toBe("warn");
    expect(verdicts[0]?.detail).toContain("0 of 16");
    expect(verdicts[0]?.detail).toContain("distance unmeasurable");
    expect(verdicts.some((f) => f.detail.includes("reskin"))).toBe(false);
    expect(report.pass).toBe(true);
  });
});

describe("PALETTE_20 — the 20% palette rule", () => {
  test("disjoint archetype composition fails the pair", () => {
    const beta = mutatedBundle("minimal-beta.json", (raw) => {
      (raw.buildables as Record<string, unknown>)["archetypeInstances"] = [
        { archetype: "lonely-monolith", skin: "beta-skin" },
      ];
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [ALPHA(), beta] }));
    expect(codesOf(report)).toEqual(["PALETTE_20"]);
    expect(report.findings[0]?.detail).toContain("disjoint");
  });

  test("differing palette bases fail the pair", () => {
    const beta = mutatedBundle("minimal-beta.json", (raw) => {
      (raw.buildables as Record<string, unknown>)["paletteRef"] = "palette:solo-90";
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [ALPHA(), beta] }));
    expect(codesOf(report)).toEqual(["PALETTE_20"]);
  });

  test("non-palette: ref fails the bundle AND diverges from its twin (two legs)", () => {
    const beta = mutatedBundle("minimal-beta.json", (raw) => {
      (raw.buildables as Record<string, unknown>)["paletteRef"] = "one-off-look";
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [ALPHA(), beta] }));
    expect(codesOf(report)).toEqual(["PALETTE_20", "PALETTE_20"]);
    const solo = report.findings.find((f) => f.bundles.join() === "test:min-beta");
    expect(solo?.detail).toContain("not a 'palette:' registry ref");
    const pair = report.findings.find((f) => f.bundles.length === 2);
    expect(pair?.detail).toContain("palette bases differ");
  });

  test("empty composition fails the bundle alone", () => {
    const beta = mutatedBundle("minimal-beta.json", (raw) => {
      (raw.buildables as Record<string, unknown>)["archetypeInstances"] = [];
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [BETA(), beta] }));
    const codes = codesOf(report).filter((c) => c === "PALETTE_20");
    expect(codes.length).toBeGreaterThan(0);
  });
});

describe("BESPOKE_TALLY — Five-Asset Skin Kit", () => {
  test("a sixth bespoke asset/fx ref fails", () => {
    const beta = mutatedBundle("minimal-beta.json", (raw) => {
      (raw.skin as Record<string, unknown>)["ambientSoundPack"] = "fx:screaming-crowd";
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [ALPHA(), beta] }));
    expect(codesOf(report)).toEqual(["BESPOKE_TALLY"]);
    expect(report.findings[0]?.detail).toContain("6 bespoke");
    expect(report.findings[0]?.cite).toContain("§8.10");
  });

  test("a bespoke (non-preset) material fails twice over: tally AND preset law", () => {
    const beta = mutatedBundle("minimal-beta.json", (raw) => {
      (raw.skin as Record<string, unknown>)["materialPreset"] = "asset:hand-melted-brass";
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [ALPHA(), beta] }));
    // an 'asset:' material is a 6th bespoke ref AND a non-preset material
    expect(codesOf(report)).toEqual(["BESPOKE_TALLY", "BESPOKE_TALLY"]);
    expect(report.findings.some((f) => f.detail.includes("materialPreset"))).toBe(true);
    expect(report.findings.some((f) => f.detail.includes("6 bespoke"))).toBe(true);
  });
});

describe("CROSS_REF — registries and wave tables resolve", () => {
  test("unknown signature threat id is named", () => {
    const alpha = mutatedBundle("minimal-alpha.json", (raw) => {
      (raw.threats as Record<string, unknown>)["signatureThreats"] = [
        { id: "ghost-plague", mechanical: true },
      ];
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [alpha, BETA()] }));
    expect(codesOf(report)).toEqual(["CROSS_REF"]);
    expect(report.findings[0]?.detail).toContain("ghost-plague");
  });

  test("unknown archetypeRef is named", () => {
    const beta = mutatedBundle("minimal-beta.json", (raw) => {
      (raw.visitor as Record<string, unknown>)["archetypeRefs"] = ["phantom-pilgrim"];
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [ALPHA(), beta] }));
    expect(codesOf(report)).toEqual(["CROSS_REF"]);
    expect(report.findings[0]?.detail).toContain("phantom-pilgrim");
  });

  test("unlockedByBuildables threat values resolve too", () => {
    const alpha = mutatedBundle("minimal-alpha.json", (raw) => {
      (raw.threats as Record<string, unknown>)["unlockedByBuildables"] = { "buildable-a": ["not-a-real-threat"] };
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [alpha, BETA()] }));
    expect(report.findings.some((f) => f.code === "CROSS_REF" && f.detail.includes("not-a-real-threat"))).toBe(true);
  });

  test("missing wave slice is a warning and the report still passes", () => {
    const waves = new Map([["waves-alpha.json", readFixture("waves-alpha.json")]]);
    const report = lintRulesetCorpus(miniCorpus({ waves }));
    expect(report.pass).toBe(true);
    const warn = report.findings.find((f) => f.severity === "warn");
    expect(warn?.code).toBe("CROSS_REF");
    expect(warn?.detail).toContain("waves-beta.json");
  });

  test("non-file: waveTable ref fails outright", () => {
    const alpha = mutatedBundle("minimal-alpha.json", (raw) => {
      (raw.threats as Record<string, unknown>)["waveTable"] = "auto-generated";
    });
    const report = lintRulesetCorpus(miniCorpus({ bundles: [alpha, BETA()] }));
    expect(report.findings.some((f) => f.code === "CROSS_REF" && f.detail.includes("not a 'file:' ref"))).toBe(true);
  });

  test("wave doc back-linking a different type fails", () => {
    const mislinked = cloneJson(readFixture("waves-beta.json") as Record<string, unknown>);
    mislinked["type"] = "test:someone-else";
    const report = lintRulesetCorpus(miniCorpus({ waves: new Map([["waves-alpha.json", readFixture("waves-alpha.json")], ["waves-beta.json", mislinked]]) }));
    expect(report.pass).toBe(false);
    expect(report.findings.some((f) => f.code === "CROSS_REF" && f.detail.includes("back-links"))).toBe(true);
  });

  test("a type-less wave doc referencing a bundle is named (no silent back-link)", () => {
    const unclaimed = cloneJson(readFixture("waves-alpha.json") as Record<string, unknown>);
    delete unclaimed["type"];
    const report = lintRulesetCorpus(
      miniCorpus({
        waves: new Map([
          ["waves-alpha.json", unclaimed],
          ["waves-beta.json", readFixture("waves-beta.json")],
        ]),
      }),
    );
    const naming = report.findings.filter(
      (f) => f.code === "CROSS_REF" && f.detail.includes("declares no 'type' back-link"),
    );
    expect(naming.length).toBe(1);
    expect(naming[0]?.bundles).toEqual(["test:min-alpha"]);
    expect(naming[0]?.severity).toBe("error");
    expect(naming[0]?.detail).toContain("waves-alpha.json");
    expect(report.pass).toBe(false);
  });
});

describe("WAVE_STRUCTURE — three structural shapes only", () => {
  test("band outside the four-band vocabulary is flagged", () => {
    const doc = cloneJson(readFixture("waves-alpha.json") as Record<string, unknown>);
    const waves = doc["waves"] as Record<string, unknown>[];
    ((waves[0]?.["entries"] as Record<string, unknown>[])?.[0] as Record<string, unknown>)["band"] = "tsunami";
    const report = lintRulesetCorpus(
      miniCorpus({ waves: new Map([["waves-alpha.json", doc], ["waves-beta.json", readFixture("waves-beta.json")]]) }),
    );
    expect(report.findings.some((f) => f.code === "WAVE_STRUCTURE" && f.detail.includes("tsunami"))).toBe(true);
  });

  test("envelope shape phase outside ramp|plateau|decay is flagged", () => {
    const doc = cloneJson(readFixture("waves-alpha.json") as Record<string, unknown>);
    (doc["envelopes"] as Record<string, unknown>[])![0]!["shape"] = { surge: "fast" };
    const report = lintRulesetCorpus(
      miniCorpus({ waves: new Map([["waves-alpha.json", doc], ["waves-beta.json", readFixture("waves-beta.json")]]) }),
    );
    expect(report.findings.some((f) => f.code === "WAVE_STRUCTURE" && f.detail.includes("surge"))).toBe(true);
  });

  test("overWaves citing an undeclared wave n is flagged; empty waves[] is fatal-shaped", () => {
    const doc = cloneJson(readFixture("waves-alpha.json") as Record<string, unknown>);
    (doc["envelopes"] as Record<string, unknown>[])![0]!["overWaves"] = [99];
    const broken = cloneJson(doc);
    broken["waves"] = [];
    const report = lintRulesetCorpus(
      miniCorpus({
        waves: new Map([
          ["waves-alpha.json", doc],
          ["waves-beta.json", broken],
        ]),
      }),
    );
    expect(report.findings.some((f) => f.detail.includes("wave n=99"))).toBe(true);
    expect(report.findings.some((f) => f.detail.includes("non-empty"))).toBe(true);
  });

  test("structural checker does not police wave LAWS (role quotas / telegraph bands pass through)", () => {
    // an envelope with kind 'wave' + zero telegraph flag is a waves-module law
    // question, NOT structural — the loader lint must stay silent on it.
    const doc = cloneJson(readFixture("waves-beta.json") as Record<string, unknown>);
    (doc["envelopes"] as Record<string, unknown>[])![0]!["telegraphed"] = false;
    const report = lintRulesetCorpus(
      miniCorpus({
        bundles: [BETA()],
        waves: new Map([["waves-beta.json", doc]]),
      }),
    );
    expect(report.findings).toEqual([]);
  });
});

describe("report mechanics", () => {
  test("duplicate registry ids fail the index parse loudly", () => {
    expect(() => parseThreatRegistry({ threats: [{ id: "x" }, { id: "x" }] }, "inline")).toThrow(/duplicate id/);
    expect(() => parseThreatRegistry({ threats: "nope" }, "inline")).toThrow(/expected array/);
  });

  test("a non-string registry id fails with a message that matches the guard", () => {
    expect(() => parseThreatRegistry({ threats: [{ id: 42 }] }, "inline")).toThrow(/expected string id/);
    expect(() => parseThreatRegistry({ threats: [{ id: "" }] }, "inline")).toThrow(/expected string id/);
    expect(() => parseVisitorArchetypeRegistry({ archetypes: [{ id: null }] }, "inline")).toThrow(
      /expected string id/,
    );
  });

  test("findings are deterministic: same corpus, byte-identical report", () => {
    const a = lintRulesetCorpus(miniCorpus({ bundles: [BETA(), ALPHA()] })); // shuffled input
    const b = lintRulesetCorpus(miniCorpus());
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.findings).toEqual([]);
  });
});

