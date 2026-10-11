/**
 * scenario/index.ts — explicit barrel for the §1.5 scenario library runner:
 * declarative mission documents (strict-JSON, closed vocabularies), the
 * pure objective evaluator, and runScenario composing the existing engine.
 *
 * Explicit names only (versus/coverage/unattended precedent — the
 * api-verify gate reads this file and every row of
 * docs/API-REFERENCE.md ## scenario).
 */

export {
  SCENARIO_BRIEF_MAX_CHARS,
  SCENARIO_MAX_MINUTES_CAP,
  SCENARIO_PREDICATE_KINDS,
  SCENARIO_SCHEMA,
  ScenarioError,
  parseMoneyWire,
  parseScenarioDoc,
  scenarioContractId,
  scenarioSeed,
} from "./doc.ts";
export type {
  ObjectivePredicate,
  ScenarioContractSpec,
  ScenarioDeathCause,
  ScenarioDoc,
  ScenarioErrorCode,
  ScenarioLimits,
  ScenarioPredicateKind,
  ScenarioTraffic,
} from "./doc.ts";

export {
  EMPTY_OBSERVATION,
  objectiveHolds,
  objectiveLine,
  objectiveProgress,
  progressAll,
} from "./objectives.ts";
export type { ObjectiveProgress, ScenarioObservation } from "./objectives.ts";

export {
  SCENARIO_ENGINE_VERSION,
  SCENARIO_OUTCOMES,
  runScenario,
} from "./runner.ts";
export type {
  ScenarioOutcome,
  ScenarioReport,
  ScenarioRunConfig,
  ScenarioTrace,
} from "./runner.ts";

export {
  SHIPPED_SCENARIO_IDS,
  SHIPPED_SCENARIO_WIRES,
  SHIPPED_SCENARIOS,
  deadbeatQuarterDoc,
  shippedScenario,
  theAngryWhaleDoc,
  theLongWeekendDoc,
} from "./scenarios.ts";
export type { ScenarioWire } from "./scenarios.ts";
