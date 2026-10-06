/**
 * Shared test helpers: fixture IO (readFileSync + JSON.parse — never import
 * .json, the workspace has no resolveJsonModule) + corpus builders.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadTypeBundle, type LoadedTypeBundle } from "../bundle";
import {
  parseThreatRegistry,
  parseVisitorArchetypeRegistry,
  type ThreatRegistryIndex,
  type VisitorArchetypeIndex,
} from "../registries";
import type { LintConfig, RulesetCorpus } from "../lint";

export const FIXTURES = join(process.cwd(), "src", "loader", "__tests__", "fixtures");

export function readFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES, name), "utf8")) as unknown;
}

/** Fresh mutable deep clone of a JSON doc (for crafted mutations). */
export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function fixtureRaw(name: string): Record<string, unknown> {
  return readFixture(name) as Record<string, unknown>;
}

export function loadFixture(name: string): LoadedTypeBundle {
  return loadTypeBundle(readFixture(name));
}

export const ALPHA = () => loadFixture("minimal-alpha.json");
export const BETA = () => loadFixture("minimal-beta.json");

export function miniThreats(): ThreatRegistryIndex {
  return parseThreatRegistry(readFixture("threats-mini.json"), "threats-mini.json");
}

export function miniVisitors(): VisitorArchetypeIndex {
  return parseVisitorArchetypeRegistry(readFixture("visitors-mini.json"), "visitors-mini.json");
}

export function miniWaves(): Map<string, unknown> {
  return new Map<string, unknown>([
    ["waves-alpha.json", readFixture("waves-alpha.json")],
    ["waves-beta.json", readFixture("waves-beta.json")],
  ]);
}

/** Fixtures ship no 'official:shared-web' anchor, so the crafted corpus pins
 *  its own baseline (lowest-sorted id present) instead of falling back — the
 *  fallback path gets its own dedicated tests. */
export function miniBaseline(bundles: readonly LoadedTypeBundle[]): LintConfig {
  const [firstId] = [...new Set(bundles.map((bundle) => bundle.id))].sort();
  return firstId === undefined ? {} : { baselineId: firstId };
}

export function miniCorpus(overrides: Partial<RulesetCorpus> = {}): RulesetCorpus {
  const corpus: RulesetCorpus = {
    bundles: [ALPHA(), BETA()],
    threats: miniThreats(),
    visitors: miniVisitors(),
    waves: miniWaves(),
    ...overrides,
  };
  return { ...corpus, config: overrides.config ?? miniBaseline(corpus.bundles) };
}

/** Reload a mutated bundle: clone → mutate → re-parse through the boundary. */
export function mutatedBundle(
  fixture: "minimal-alpha.json" | "minimal-beta.json",
  mutate: (raw: Record<string, unknown>) => void,
): LoadedTypeBundle {
  const raw = cloneJson(fixtureRaw(fixture));
  mutate(raw);
  return loadTypeBundle(raw);
}

/**
 * Forge a bundle whose §7.8 hook slots are UNDECLARED (null / empty).
 * The strict boundary rejects nulls in most of these slots today, so the
 * "distance unmeasurable" tripwire would otherwise be unreachable dead code —
 * this keeps it testable if the schema ever loosens toward placeholders.
 */
export function sparseHooksBundle(bundle: LoadedTypeBundle): LoadedTypeBundle {
  return {
    ...bundle,
    scarce: {
      ...bundle.scarce,
      meterWidget: null,
      meterBoundStat: null,
      commercialSlider: null,
      operationalDials: [],
      windowGrows: null,
      shedOrder: null,
    },
    skin: { ...bundle.skin, meterFace: null },
    tempo: { ...bundle.tempo, simTimeScale: null, permanentIncidentClock: null },
    control: {
      ...bundle.control,
      pipsHardware: null,
      pipsSoftware: null,
      pipsNetwork: null,
      pipsData: null,
      keyhole: null,
      unclickableObjects: null,
    },
    mechanics: [],
  } as unknown as LoadedTypeBundle;
}


