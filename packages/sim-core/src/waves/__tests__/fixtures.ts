/** Shared crafted tables for waves tests (not a test file itself). */
import type { CompositionEntry, DamageDenomination, ThreatRole, WaveDefinition, WaveTable } from "../table.js";
import type { ThreatFamily } from "../../types.js";
import type { TelegraphBand } from "../bands.js";

/** Fully-mutable CompositionEntry — assignable to both the readonly contract
 *  type and the DeepMutable views used by crafted-violation tests. */
export interface MutableCompositionEntry {
  threatId: string;
  role: ThreatRole;
  family: ThreatFamily;
  band: TelegraphBand;
  sharePct: number;
  denominations: DamageDenomination[];
  targets: string[];
}

export function entry(partial: {
  threatId: string;
  role: ThreatRole;
  family: ThreatFamily;
  band: TelegraphBand;
  sharePct: number;
  denominations: readonly DamageDenomination[];
  targets?: readonly string[];
}): MutableCompositionEntry {
  return {
    threatId: partial.threatId,
    role: partial.role,
    family: partial.family,
    band: partial.band,
    sharePct: partial.sharePct,
    denominations: [...partial.denominations],
    targets: [...(partial.targets ?? [`target-of-${partial.threatId}`])],
  };
}

function wave(partial: Omit<Partial<WaveDefinition>, "n"> & { n: number }): WaveDefinition {
  return {
    windowMinutes: partial.windowMinutes ?? 30,
    rampMin: partial.rampMin ?? 5,
    plateauMin: partial.plateauMin ?? 10,
    decayMin: partial.decayMin ?? 5,
    parPct: partial.parPct ?? 50,
    hard: partial.hard ?? false,
    entries: partial.entries ?? [
      entry({ threatId: "x", role: "swarm", family: "human", band: "weather", sharePct: 100, denominations: ["bandwidth"] }),
    ],
    n: partial.n,
  };
}

/** A 4-wave table that obeys EVERY authoring law (the CI-clean baseline). */
export function cleanTable(): WaveTable {
  return {
    id: "test-clean",
    typeBundleId: "shared-web",
    tuningSheet: "B",
    unitsPerPressurePoint: 1,
    waves: [
      wave({
        n: 1,
        parPct: 40,
        entries: [
          entry({ threatId: "scanner-drizzle", role: "stealth", family: "malicious", band: "storm", sharePct: 60, denominations: ["concurrency"], targets: ["edge-a", "edge-b"] }),
          entry({ threatId: "trial-swarm", role: "swarm", family: "human", band: "weather", sharePct: 40, denominations: ["bandwidth"] }),
        ],
      }),
      wave({
        n: 2,
        parPct: 100,
        hard: true,
        entries: [
          entry({ threatId: "brute-squad", role: "tank", family: "malicious", band: "storm", sharePct: 55, denominations: ["concurrency"] }),
          entry({ threatId: "cash-burner", role: "siege", family: "systemic", band: "entropy", sharePct: 45, denominations: ["cash"] }),
        ],
      }),
      wave({
        n: 3,
        parPct: 50,
        entries: [
          entry({ threatId: "slowloris", role: "swarm", family: "malicious", band: "storm", sharePct: 60, denominations: ["hands"] }),
          entry({ threatId: "disk-rot", role: "sapper", family: "entropic", band: "entropy", sharePct: 40, denominations: ["data-integrity"] }),
        ],
      }),
      wave({
        n: 4,
        parPct: 75,
        entries: [
          entry({ threatId: "layer7-mimic", role: "mimic", family: "malicious", band: "hunter", sharePct: 55, denominations: ["bandwidth"], targets: ["web-1", "web-2", "web-3"] }),
          entry({ threatId: "bot-farm", role: "swarm", family: "human", band: "weather", sharePct: 45, denominations: ["bandwidth"] }),
        ],
      }),
    ],
  };
}

/** Deep-writable clone so crafted-violation tests can mutate table data
 *  without fighting the readonly contract types. */
export type DeepMutable<T> = T extends ReadonlyArray<infer U>
  ? DeepMutable<U>[]
  : T extends object
    ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
    : T;

export function mutableClone(table: WaveTable): DeepMutable<WaveTable> {
  return structuredClone(table) as DeepMutable<WaveTable>;
}
