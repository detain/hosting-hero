/**
 * Corpus mission wiring — the PROTO leg of the waves-tableId seam (@5df5586
 * `scenario/corpus.ts`). sim-core stays fs-free: `runScenario` takes a
 * host-injected `CorpusAuthority` and the scenario suite's own fixture host
 * (`corpusFixtures.ts`) reads content from disk with node:fs. This module is
 * what a BROWSER host does instead: the shipped g1 wave slice + the threat
 * registry arrive as `?raw` build-time strings (the lab coverage-grid
 * pattern), parse once, and seal into one memoized CorpusAuthority.
 *
 * The mission: `metastable-corpus`, the 11th §1.5 wire — the Metastable
 * heading's corpus twin, re-stormed from the REAL g1 wave table (wave 1 at
 * business-minute 30 over a 4/min floor) instead of hand-typed segments.
 * Witnesses are the scenario suite's own (base seed 904n, probe-derived
 * 2026-10-13): win arm offsets 0/1/2 stop at `win@240`; the ONE-field wire
 * flip `waves:[1] → [1,5]` stacks the corpus's 30/min wave 5 on top and the
 * run dies `guard:cascadeCollapse@80 / @81 / @85` by seed.
 *
 * Honest scope: invitations stay the empty authority here exactly as in the
 * sim-core suite (attack-surface-gated storms are host adoption owed — §7.4
 * MODULE-STATUS gap row); the board is the mission's own 8-slot web-1.
 */
import { asRunSeed } from "@hh/sim-core";
import sliceRaw from "../../../../packages/content/waves/g1-shared-web-first-quarter.json?raw";
import registryRaw from "../../../../packages/content/threats/registry-core.json?raw";
import {
  SHIPPED_SCENARIO_WIRES,
  ScenarioError,
  parseScenarioDoc,
  runScenario,
  shippedScenario,
} from "@hh/sim-core/scenario";
import type { CorpusAuthority, ScenarioDoc, ScenarioReport, ScenarioWire } from "@hh/sim-core/scenario";
import type { ForeignThreatMeta } from "@hh/sim-core/waves";

export const CORPUS_MISSION_ID = "metastable-corpus";
export const G1_SLICE_STEM = "g1-shared-web-first-quarter";
/** The mission's authored seed base — the scenario suite's own BASE_SEED. */
export const CORPUS_MISSION_SEED = asRunSeed(904n);

/** Registry metadata the foreign entries do not carry (family, denomination)
 *  — the browser twin of corpusFixtures.buildThreatMeta, over ?raw text. */
function buildThreatMeta(): (threatId: string) => ForeignThreatMeta | undefined {
  const registry = JSON.parse(registryRaw) as {
    threats?: { id?: string; family?: string; denomination?: string }[];
  };
  const map = new Map<string, ForeignThreatMeta>();
  for (const raw of registry.threats ?? []) {
    if (
      typeof raw.id !== "string" ||
      typeof raw.family !== "string" ||
      typeof raw.denomination !== "string"
    ) {
      throw new Error(
        `corpusMission: registry-core threat record missing id/family/denomination: ${JSON.stringify(raw).slice(0, 80)}`,
      );
    }
    map.set(raw.id, {
      family: raw.family as ForeignThreatMeta["family"],
      denomination: raw.denomination as ForeignThreatMeta["denomination"],
    });
  }
  return (threatId: string) => map.get(threatId);
}

let authority: CorpusAuthority | null = null;

/** The single authority for every proto corpus run (idempotent; the ?raw
 *  strings are build constants, parsed and frozen exactly once). */
export function protoCorpusAuthority(): CorpusAuthority {
  if (authority !== null) return authority;
  const slices = new Map<string, unknown>();
  slices.set(G1_SLICE_STEM, JSON.parse(sliceRaw) as unknown);
  authority = Object.freeze({ slices, threatMeta: buildThreatMeta() });
  return authority;
}

/** The shipped win doc (never mutated — the wall is re-crossed per arm). */
export function corpusMissionDoc(): ScenarioDoc {
  return shippedScenario(CORPUS_MISSION_ID) as ScenarioDoc;
}

/** LOSE arm: clone the SHIPPED WIRE JSON, flip ONE field (waves [1] → [1,5],
 *  stacking the corpus's 30/min wave 5), re-cross the parse wall. Same law
 *  as the scenario suite's twinWire — the wire literal, never the parsed doc
 *  (the parsed board carries bigints and JSON has no bigint). */
export function corpusMissionFlipDoc(): ScenarioDoc {
  const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES[CORPUS_MISSION_ID])) as ScenarioWire & {
    traffic: { tableId: string; waves?: number[] };
  };
  wire.traffic.waves = [1, 5];
  return parseScenarioDoc(wire);
}

export type CorpusMissionArm = "win" | "lose-flip" | "no-authority";

export interface CorpusMissionOutcome {
  readonly arm: CorpusMissionArm;
  readonly seedOffset: number;
  readonly report?: ScenarioReport;
  /** Set on the fail-loud arm: the ScenarioError message the wall answered. */
  readonly error?: string;
}

/** Run one arm. The "no-authority" arm demonstrates the fail-laws: a
 *  corpus-profile doc run WITHOUT config.corpus throws CORPUS_UNRESOLVED at
 *  'config.corpus' before tick 1 — the panel renders the refusal instead. */
export function runCorpusMission(arm: CorpusMissionArm, seedOffset = 0): CorpusMissionOutcome {
  if (arm === "no-authority") {
    try {
      const report = runScenario(corpusMissionDoc(), CORPUS_MISSION_SEED, { seedOffset });
      return Object.freeze({ arm, seedOffset, report }); // unreachable today — fail-loud law
    } catch (error) {
      const message = error instanceof ScenarioError ? `${error.code} at '${error.path}'` : String(error);
      return Object.freeze({ arm, seedOffset, error: message });
    }
  }
  const doc = arm === "win" ? corpusMissionDoc() : corpusMissionFlipDoc();
  const report = runScenario(doc, CORPUS_MISSION_SEED, { seedOffset, corpus: protoCorpusAuthority() });
  return Object.freeze({ arm, seedOffset, report });
}

/** Render lines for one finished run — outcome, stop witness, boundary,
 *  digest, and the raw trace census. No derived claims. */
export function missionRows(outcome: CorpusMissionOutcome): readonly string[] {
  if (outcome.report === undefined) {
    return Object.freeze([`offset ${outcome.seedOffset}: threw ${outcome.error ?? "(unknown)"}`]);
  }
  const r = outcome.report;
  const winLine = r.objectives.win[0];
  const winText = winLine === undefined ? "(no win objective)" : `${winLine.holds ? "held" : "open"} ${winLine.progress.toString()}/65536`;
  return Object.freeze([
    `offset ${outcome.seedOffset} · ${r.scenarioId} · seed ${r.runSeed.toString()}`,
    `outcome ${r.outcome} — stop ${r.stopReason} at m${r.endMinute} (tick ${r.endTick})`,
    `digest ${r.endDigest}`,
    `trace: arrivals ${r.trace.arrivals} · served ${r.trace.served} · bounced ${r.trace.bounced} · landed ${r.trace.landed} · FP ${r.trace.falsePositives}`,
    `economy: ${r.trace.economyRounds} folds · ${r.trace.economyRefusals} refusals · cash ${r.cashStartMicroUsd.toString()}→${r.cashEndMicroUsd.toString()} µ$`,
    `win objective: ${winText}`,
  ]);
}
