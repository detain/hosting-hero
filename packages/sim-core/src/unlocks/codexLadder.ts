/**
 * unlocks/codexLadder.ts — THE codex stage advancer (hg §5.4 "The Threat
 * Codex / Bestiary", audit g16 TOP-PROBLEMS #3: "Codex stages never
 * advance — the only runtime mastery mechanic is waves/ledger's
 * weather-band demotion at 5 counters; a threat-composition behavior,
 * not a codex progression writer").
 *
 * STAGE VOCABULARY — matched, never invented: `save/node.ts:291`
 * `CodexEntry.stage` is the closed ladder "seen" → "analyzed" →
 * "countered" → "mastered" (its parser, save/node.ts:1074, is the wall).
 * This file re-declares the same union structurally (VOCABULARY MIRROR
 * law, see triggers.ts header) and WRITES it: `codexStageFor` is the
 * advancer the save record was waiting for.
 *
 * DEMOTION ALIGNMENT: waves/ledger.ts:127 `bandAfterMastery` demotes a
 * threat whose counter count reaches `masteryDemotionAfter` (default 5,
 * waves/ledger.ts:30-36) to the "weather" telegraph band. The ladder's
 * top rung uses the SAME threshold and exposes the SAME fact as a codex
 * statement — mastered ⇔ played-as-weather — so the two systems can
 * never disagree about what "mastered" costs (`isDemotedToWeather`
 * mirrors the ledger rule with the ledger default pinned in config).
 *
 * COUNTER SOURCE (v0 honesty): pipeline SimEvents do not carry threatIds
 * (arrival unitIds are table-ordinal grammar), so sighting/counter
 * evidence arrives structurally — the host feeds counts from the wave
 * plan / defense resolutions (same numbers ledger's masteryCounts map
 * holds). No invented event channel.
 */

import { UnlocksError } from "./triggers.ts";

/** Mirror of save/node.ts:291 `CodexEntry["stage"]` (do not rename here —
 *  the save parser is the wall). */
export type CodexStage = "seen" | "analyzed" | "countered" | "mastered";

export const CODEX_STAGES: readonly CodexStage[] = Object.freeze([
  "seen",
  "analyzed",
  "countered",
  "mastered",
] as const);

/** The band a mastered threat plays at — waves/bands.ts:14 vocabulary
 *  ("weather: fully visible at all times, the honest background"). */
export const WEATHER_DEMOTION_BAND = "weather" as const;
export type WeatherDemotionBand = typeof WEATHER_DEMOTION_BAND;

/** Repeat-observation evidence for ONE threat (structural: hosts fold
 *  wave plans and defense resolutions into these two counts). */
export interface CodexCounters {
  /** Times the threat showed itself (spawned/arrived visibly). */
  readonly sightings: number;
  /** Times the player countered it (resolved against a defense). */
  readonly counters: number;
}

export interface CodexLadderConfig {
  /** Sightings needed to move seen → analyzed (study-by-repetition). */
  readonly analyzeAfterSightings: number;
  /** Counters needed to move countered → mastered. ALIGNED by default
   *  with waves/ledger.ts DEFAULT_LEDGER_CONFIG.masteryDemotionAfter = 5
   *  (changing one without the other splits "mastered" in two — the
   *  integration test pins the defaults equal). */
  readonly masterAfterCounters: number;
}

export const CODEX_LADDER_DEFAULTS: CodexLadderConfig = Object.freeze({
  analyzeAfterSightings: 3,
  masterAfterCounters: 5,
});

function assertCounters(counters: CodexCounters, where: string): void {
  for (const key of ["sightings", "counters"] as const) {
    const value = counters[key];
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
      throw new UnlocksError("bad-value", `${where}.${key}`, `expected a non-negative safe integer, got ${String(value)}`);
    }
  }
}

/** The ladder's rung a counter pair currently earns — null = unrecorded
 *  (zero sightings: the codex card has never been drawn). Monotone in
 *  both inputs; the highest satisfied rung wins. */
export function codexStageFor(
  counters: CodexCounters,
  cfg: CodexLadderConfig = CODEX_LADDER_DEFAULTS,
): CodexStage | null {
  assertCounters(counters, "codexStageFor");
  if (counters.sightings <= 0) return null;
  if (counters.counters >= cfg.masterAfterCounters) return "mastered";
  if (counters.counters >= 1) return "countered";
  if (counters.sightings >= cfg.analyzeAfterSightings) return "analyzed";
  return "seen";
}

export interface CodexGap {
  /** The next rung to climb, or null when already mastered (or when the
   *  card has never been drawn and the FIRST rung is all that's ahead —
   *  callers get "seen" for that from the unseen branch). */
  readonly next: CodexStage | null;
  /** How many more of WHICH evidence (`sightings` or `counters`) the
   *  next rung needs — the readable progress bar (hg §5.4
   *  "fill-in-the-blank"). */
  readonly remaining: number;
  /** Which evidence the gap counts; null only at the ladder's top. */
  readonly evidence: "sightings" | "counters" | null;
}

/** Explanation row for the HUD: what is still owed for the next rung.
 *  Takes the SAME counter pair as `codexStageFor` — the stage is
 *  DERIVED, never passed in, so a caller can never hand a stage its
 *  counters disagree with (make illegal states unrepresentable). */
export function nextCodexGap(
  counters: CodexCounters,
  cfg: CodexLadderConfig = CODEX_LADDER_DEFAULTS,
): CodexGap {
  assertCounters(counters, "nextCodexGap");
  const stage = codexStageFor(counters, cfg);
  if (stage === null) {
    return Object.freeze({ next: "seen" as const, remaining: 1, evidence: "sightings" as const });
  }
  if (stage === "mastered") {
    return Object.freeze({ next: null, remaining: 0, evidence: null });
  }
  if (stage === "countered") {
    return Object.freeze({
      next: "mastered" as const,
      remaining: Math.max(0, cfg.masterAfterCounters - counters.counters),
      evidence: "counters" as const,
    });
  }
  if (stage === "analyzed") {
    return Object.freeze({ next: "countered" as const, remaining: 1, evidence: "counters" as const });
  }
  // "seen": studied by repetition. counters === 0 here by construction
  // (any counter would have moved the rung), so sightings carry the gap.
  return Object.freeze({
    next: "analyzed" as const,
    remaining: cfg.analyzeAfterSightings - counters.sightings,
    evidence: "sightings" as const,
  });
}

/** The codex-side twin of waves/ledger.ts `bandAfterMastery` (:127-136):
 *  counters ≥ threshold ⇔ the threat now PLAYS at the weather band.
 *  Composition/existence stay the ledger's; this answers only the codex
 *  question "is this mastery settled?" with the settled default. Takes
 *  the raw counter count — the same number the ledger counts. */
export function isDemotedToWeather(
  counterCount: number,
  cfg: CodexLadderConfig = CODEX_LADDER_DEFAULTS,
): boolean {
  if (typeof counterCount !== "number" || !Number.isSafeInteger(counterCount) || counterCount < 0) {
    throw new UnlocksError(
      "bad-value",
      "isDemotedToWeather.counterCount",
      `expected a non-negative safe integer, got ${String(counterCount)}`,
    );
  }
  return counterCount >= cfg.masterAfterCounters;
}
