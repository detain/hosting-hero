/**
 * Type-Bundle loader: JSON (authoring wire format) → trusted `LoadedTypeBundle`.
 *
 * Parse, don't validate (code-philosophy Law 2): the wire format carries plain
 * JSON numbers "for authoring convenience" (types.ts §Type-bundle contract
 * note); THIS file is the boundary where every declared numeric physics field
 * is converted to Fixed / SimTimeUs / verified-safe-int and no float survives.
 * The result is deep-frozen, key-ordered by this spec (stable for digesting),
 * and every field is present-with-explicit-null unless marked otherwise —
 * downstream modules never re-check shapes.
 *
 * Unknown-field policy (owner directive): any key not declared here — nor a
 * convention metadata key (`_todo`, `tuningSheet`; schema header
 * PLACEHOLDER/PROVISIONAL conventions, harvested by todo.ts instead) — fails
 * loud with an `UNKNOWN_FIELD` LoaderError naming the full dotted path.
 * The two documented blessed extensions under `economy` (chargebackRate,
 * hypeCycle — README "Never invent numbers", authored §-cited values awaiting
 * the schema v1 freeze, MASTER_REPORT §4.3 risk 3) are declared explicitly.
 */

import type { BundleTimeScale, DurationClass, Fixed, PatienceMode, SimTimeUs, ThreatFamily } from "../types.ts";
import { LoaderError } from "./boundary.ts";
import { dollarsToMoney, fixedInDomain, msToUs, toFixed, toFixedUnit, toSafeInt } from "./boundary.ts";

/* ═════════════════════ loaded (trusted) shapes ═════════════════════ */

export type YearString = string; // /^\d{4}$/, validated at the boundary
export type EraAltitude = "Z1" | "Z2" | "Z3" | "Z4";
export type TwoFrontDenomination =
  | "bandwidth"
  | "concurrency"
  | "hands"
  | "cash"
  | "reputation"
  | "data-integrity";
export type ScenarioArchetype =
  | "Endure"
  | "Convert"
  | "Reach-State"
  | "Escort"
  | "Diagnose"
  | "Build-to-Spec"
  | "Shrink"
  | "Schedule"
  | "Negotiate"
  | "Hold-Without-Hands"
  | "Inherit";
export type WinConditionKind =
  | "survive"
  | "hold-metric"
  | "grow-to-N"
  | "cash-intact"
  | "audit-pass"
  | "convert-%";

/** Float-free JSON subset kept opaque (eraOverrides forward-compat surface):
 *  strings, booleans, null, integer numbers, arrays and objects only. */
export type OpaqueJsonValue = string | boolean | null | number | readonly OpaqueJsonValue[] | OpaqueJsonRecord;
export interface OpaqueJsonRecord {
  readonly [key: string]: OpaqueJsonValue;
}

export interface LoadedVisitorStats {
  readonly patience: Fixed | null;
  readonly value: Fixed | null;
  readonly weight: Fixed | null;
  readonly loyalty: Fixed | null;
  readonly fragility: Fixed | null;
}

export interface LoadedPatienceParams {
  /** Authoring unit is ms; loaded unit is integer sim µs (bigint) — R-32. */
  readonly budgetUs: SimTimeUs | null;
  /** Bounce LUT anchors [x@10%, x@50%, x@95%] of budget (R-60), as Fixed. */
  readonly bounceSigmoid: readonly [Fixed, Fixed, Fixed] | null;
}

export interface LoadedVisitor {
  readonly nullable: boolean;
  readonly unitTerm: string;
  readonly durationClass: DurationClass;
  readonly stats: LoadedVisitorStats;
  readonly patienceMode: PatienceMode;
  readonly patienceParams: LoadedPatienceParams;
  readonly partyAllOrNothing: boolean;
  readonly partySize: readonly [number, number] | null;
  readonly herdingEnabled: boolean;
  readonly herdingCoefficient: Fixed | null;
  readonly populationEffect: boolean;
  readonly retryAmplifies: boolean;
  readonly cohortFromCustomerCard: boolean;
  readonly cohortTier: number;
  readonly costPerInvocation: string;
  readonly trustReadable: boolean;
  readonly archetypeRefs: readonly string[];
}

export interface LoadedGoal {
  readonly nodeType: string;
  readonly winKind: WinConditionKind;
  readonly winMetric: string | null;
  readonly winThreshold: Fixed | null;
  readonly loseKind: string;
  readonly minWarningMinutes: number | null;
  readonly bindingConstraintLine: string;
}

export interface LoadedScarce {
  readonly resourceId: string;
  readonly meterWidget: string;
  readonly meterBoundStat: string;
  readonly commercialSlider: string;
  readonly operationalDials: readonly string[];
  readonly windowGrows: boolean;
  readonly shedOrder: string;
  readonly qosAnswer: string;
}

export interface LoadedTempo {
  readonly simTimeScale: BundleTimeScale;
  readonly permanentIncidentClock: boolean;
  readonly contractDefault: string;
  readonly contractEscalator: boolean;
  readonly contractGrandfathering: boolean;
  readonly seasonality: readonly string[];
  readonly diurnalBaseline: string;
}

export interface LoadedFamilyWeights {
  readonly malicious: Fixed | null;
  readonly human: Fixed | null;
  readonly entropic: Fixed | null;
  readonly systemic: Fixed | null;
  readonly customerAsThreat: Fixed | null;
}

export interface LoadedSignatureThreat {
  readonly id: string;
  readonly mechanical: boolean;
  readonly codexOnly: boolean;
}

export interface LoadedThreats {
  readonly familyWeights: LoadedFamilyWeights;
  readonly activeFamilies: readonly string[];
  readonly signatureThreats: readonly LoadedSignatureThreat[];
  /** buildable id → threat ids (tech-tree-is-bestiary, P2/§2.1). */
  readonly unlockedByBuildables: Readonly<Record<string, readonly string[]>>;
  readonly twoFrontDraw: readonly TwoFrontDenomination[];
  readonly waveTable: string;
}

export interface LoadedLodContract {
  readonly full: string;
  readonly icon16: string;
  readonly pip: string;
  readonly aggregate: string;
  readonly inspector: string;
}

export interface LoadedSkin {
  readonly dominant: string;
  readonly accent: string;
  readonly chord: readonly [string, string, string, string, string];
  readonly materialPreset: string;
  readonly costumeHull: string;
  readonly costumePropSlot: string;
  readonly heroSilhouette: string;
  readonly heroObject: string;
  readonly meterFace: string;
  readonly catastropheFx: string;
  readonly ambientSoundPack: string;
  readonly densityMultiplier: Fixed | null;
  readonly arrivalRhythm: string;
  readonly homeAltitude: EraAltitude | null;
  readonly detailAltitude: EraAltitude | null;
  readonly commercialArtifactIcon: string;
  readonly signatureMotion: string;
  readonly signatureFrame: string;
  readonly lodContract: LoadedLodContract;
}

export interface LoadedEras {
  readonly availableFrom: YearString | null;
  readonly obsoleteBy: YearString | null;
  readonly eraOverrides: Readonly<Record<string, OpaqueJsonRecord>>;
}

/** §1.3 authored chargeback extension (README "Never invent numbers").
 *  pctOfRevenue is PERCENT-scale (pairs with the doc'd "2-4" range), so plain
 *  Fixed — not a [0,1] fraction. */
export interface LoadedChargebackRate {
  readonly pctOfRevenue: Fixed | null;
  readonly range: string | null;
}

/** §1.3 authored hype-cycle extension. Percent/count axes stay whole-scale. */
export interface LoadedHypeCycle {
  readonly launchMultiplier: Fixed | null;
  readonly launchWeeks: Fixed | null;
  readonly evaporationPct: Fixed | null;
}

export interface LoadedEconomy {
  readonly unitOfSale: string;
  readonly revenueShape: string;
  readonly marginProfile: string;
  readonly cashTiming: string;
  readonly termTypical: string;
  readonly termChurn: string;
  readonly cacProfile: string;
  readonly ticketsPerCustomer: Fixed | null;
  readonly signatureCost: string;
  readonly badMonth: string;
  readonly fifthAxisMetric: string;
  readonly fifthAxisWeight: Fixed | null;
  readonly p95billing: boolean;
  readonly demandCharges: boolean;
  readonly chargebackRate?: LoadedChargebackRate;
  readonly hypeCycle?: LoadedHypeCycle;
}

export interface LoadedArchetypeInstance {
  readonly archetype: string;
  readonly skin: string | null;
}

export interface LoadedBuildables {
  readonly paletteRef: string;
  readonly archetypeInstances: readonly LoadedArchetypeInstance[];
  readonly distinct: readonly string[];
  readonly nonPhysical: readonly string[];
}

export interface LoadedControl {
  readonly pipsHardware: number | null;
  readonly pipsSoftware: number | null;
  readonly pipsNetwork: number | null;
  readonly pipsData: number | null;
  readonly keyhole: boolean;
  readonly unclickableObjects: boolean;
}

export interface LoadedVerbs {
  readonly dominant: string;
  readonly transfers: readonly string[];
}

export interface LoadedSynergy {
  readonly with: string;
  readonly kind: string;
  readonly numbers: Readonly<Record<string, Fixed | null>> | null;
}

export interface LoadedAntagonism {
  readonly with: string;
  readonly resource: string | null;
  readonly kind: string | null;
  readonly render: string | null;
}

export interface LoadedPrereqSet {
  readonly tech: readonly string[] | null;
  readonly commercial: readonly string[] | null;
  readonly alt: string | null;
}

export interface LoadedPivot {
  readonly customerOverlap: Fixed | null;
  readonly hardwareReuse: Fixed | null;
  readonly skillTransfer: Fixed | null;
  readonly regulatoryDelta: Fixed | null;
}

export interface LoadedRelations {
  readonly synergies: readonly LoadedSynergy[];
  readonly antagonisms: readonly LoadedAntagonism[];
  readonly prereqSets: readonly LoadedPrereqSet[];
  /** target bundle id → pivot numbers (R65 four axes). */
  readonly pivots: Readonly<Record<string, LoadedPivot>>;
  readonly masteryBuff: string;
  readonly distillate: string;
}

export interface LoadedHandoverNote {
  readonly runsOut: string;
  readonly killsYou: string;
  readonly customerWants: string;
}

export interface LoadedRosettaCard {
  readonly canonical: string;
  readonly alias: string;
  readonly line: string;
}

export interface LoadedScenarios {
  readonly archetypeApplicability: readonly ScenarioArchetype[];
  readonly analogues: Readonly<Record<string, string>>;
}

export interface LoadedGuardrails {
  readonly depiction: string;
  readonly arcMustEnd: boolean;
}

export interface LoadedMeta {
  readonly name: string;
  readonly codexSummary: string;
  readonly tone: "comedy" | "straight";
  readonly official: boolean;
  readonly publishedAsEditableCard: boolean;
}

/** The TRUSTED, float-free ruleset card. Everything downstream of the loader
 *  consumes this, never raw JSON. Deep-frozen; key order = spec order. */
export interface LoadedTypeBundle {
  readonly schemaVersion: string;
  readonly id: string;
  readonly meta: LoadedMeta;
  readonly visitor: LoadedVisitor;
  readonly goal: LoadedGoal;
  readonly scarce: LoadedScarce;
  readonly tempo: LoadedTempo;
  readonly threats: LoadedThreats;
  readonly skin: LoadedSkin;
  readonly eras: LoadedEras;
  readonly economy: LoadedEconomy;
  readonly buildables: LoadedBuildables;
  readonly control: LoadedControl;
  readonly mechanics: readonly string[];
  readonly verbs: LoadedVerbs;
  readonly relations: LoadedRelations;
  readonly ticketPack: string;
  readonly handoverNote: LoadedHandoverNote;
  readonly rosettaCards: readonly LoadedRosettaCard[];
  readonly scenarios: LoadedScenarios;
  readonly guardrails: LoadedGuardrails;
}

/* ═════════════════════ parsing machinery ═════════════════════ */

type JsonRecord = Record<string, unknown>;

interface Entry {
  readonly parse: (value: unknown, path: string) => unknown;
  /** null = required; a value (incl. null) is returned when the key is absent. */
  readonly absent: { readonly value: unknown } | null;
}

interface Plan {
  readonly [key: string]: Entry;
}

function req(parse: (value: unknown, path: string) => unknown): Entry {
  return { parse, absent: null };
}

function opt(parse: (value: unknown, path: string) => unknown, absentValue: unknown): Entry {
  return { parse, absent: { value: absentValue } };
}

/** Convention metadata keys — stripped from loaded state, harvested by todo.ts. */
const CONVENTION_KEYS: readonly string[] = ["_todo", "tuningSheet"];

function wrongType(value: unknown, path: string, expected: string): never {
  const got = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  throw new LoaderError("WRONG_TYPE", path, `expected ${expected}, got ${got}`);
}

function asObject(value: unknown, path: string): JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    wrongType(value, path, "object");
  }
  return value as JsonRecord;
}

/** Apply a Plan to a JSON object: missing-required fails, unknown keys fail
 *  (UNKNOWN_FIELD naming the path), declared keys parse in plan order so the
 *  output's key insertion order — and any stable serialization of it — is
 *  determined by THIS file, not by author file key order. */
function parseObject(value: unknown, path: string, plan: Plan): JsonRecord {
  const source = asObject(value, path);
  for (const key of Object.keys(source)) {
    if (CONVENTION_KEYS.includes(key)) continue;
    if (plan[key] === undefined) {
      const where = path.length === 0 ? key : `${path}.${key}`;
      throw new LoaderError(
        "UNKNOWN_FIELD",
        where,
        `field '${key}' is not declared by the type-bundle schema`,
      );
    }
  }
  const out: JsonRecord = {};
  for (const [key, entry] of Object.entries(plan)) {
    const where = path.length === 0 ? key : `${path}.${key}`;
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      out[key] = entry.parse(source[key], where);
    } else if (entry.absent !== null) {
      out[key] = entry.absent.value;
    } else {
      throw new LoaderError("MISSING_FIELD", where, `required field '${key}' is absent`);
    }
  }
  return out;
}

/* Scalar / structural leaf parsers */

const str = (value: unknown, path: string): string => {
  if (typeof value !== "string") wrongType(value, path, "non-empty string");
  if (value.length === 0) {
    throw new LoaderError("WRONG_TYPE", path, "empty string is not an authored value");
  }
  return value;
};

const bool = (value: unknown, path: string): boolean => {
  if (typeof value !== "boolean") wrongType(value, path, "boolean");
  return value;
};

const nullable =
  <T>(inner: (value: unknown, path: string) => T) =>
  (value: unknown, path: string): T | null =>
    value === null ? null : inner(value, path);

const numeric = (value: unknown, path: string): number => {
  if (typeof value !== "number") wrongType(value, path, "number");
  return value;
};

const fixed = (value: unknown, path: string): Fixed => toFixed(numeric(value, path), path);
const fixedUnit = (value: unknown, path: string): Fixed => toFixedUnit(numeric(value, path), path);
const usFromMs = (value: unknown, path: string): SimTimeUs => msToUs(numeric(value, path), path);
const intLeaf = (min: number, max: number) => (value: unknown, path: string): number =>
  toSafeInt(numeric(value, path), path, min, max);

const enumOf =
  <C extends readonly string[]>(choices: C, label: string) =>
  (value: unknown, path: string): C[number] => {
    const text = str(value, path);
    if (!(choices as readonly string[]).includes(text)) {
      throw new LoaderError("BAD_ENUM", path, `'${text}' is not one of ${label} [${choices.join(", ")}]`);
    }
    return text as C[number];
  };

const pattern = (re: RegExp, describe: string) => (value: unknown, path: string): string => {
  const text = str(value, path);
  if (!re.test(text)) {
    throw new LoaderError("BAD_PATTERN", path, `'${text}' fails ${describe}`);
  }
  return text;
};

const listOf =
  (item: (value: unknown, path: string) => unknown, minItems = 0, maxItems = Number.MAX_SAFE_INTEGER) =>
  (value: unknown, path: string): readonly unknown[] => {
    if (!Array.isArray(value)) wrongType(value, path, `array[${minItems}..${maxItems}]`);
    if (value.length < minItems || value.length > maxItems) {
      throw new LoaderError("OUT_OF_RANGE", path, `array length ${value.length} outside [${minItems}, ${maxItems}]`);
    }
    return value.map((element, index) => item(element, `${path}[${index}]`));
  };

const stringList = (minItems = 0, maxItems = Number.MAX_SAFE_INTEGER) =>
  (value: unknown, path: string): readonly string[] => listOf(str, minItems, maxItems)(value, path) as readonly string[];

/** Dynamic-key map: keys sorted (digest-stable), convention metadata keys
 *  (_todo cites living INSIDE a map, e.g. synergy numbers) stripped. */
const keyMap =
  (valueParser: (value: unknown, path: string) => unknown) =>
  (value: unknown, path: string): Readonly<Record<string, unknown>> => {
    const source = asObject(value, path);
    const out: JsonRecord = {};
    for (const key of Object.keys(source).sort()) {
      if (CONVENTION_KEYS.includes(key)) continue;
      out[key] = valueParser(source[key], `${path}.${key}`);
    }
    return out;
  };

/* Era-override opaque surface: any keys, but no floats ever. */
function opaqueJson(value: unknown, path: string): OpaqueJsonValue {
  if (value === null) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new LoaderError(
        "NOT_A_SAFE_INTEGER",
        path,
        `${value} is fractional inside eraOverrides — floats never enter loaded state; express ratios as strings or await schema v1 numerics`,
      );
    }
    return value;
  }
  if (Array.isArray(value)) {
    return listOf(opaqueJson, 0)(value, path) as readonly OpaqueJsonValue[];
  }
  if (typeof value === "object") {
    const parsed = keyMap(opaqueJson)(value, path) as OpaqueJsonRecord;
    return parsed;
  }
  wrongType(value, path, "JSON value (string|boolean|null|int|array|object)");
}

const opaqueRecord = (value: unknown, path: string): OpaqueJsonRecord =>
  keyMap(opaqueJson)(value, path) as OpaqueJsonRecord;

/* ═════════════════════ section plans ═════════════════════ */

const DURATION_CLASSES = ["Instant", "Session", "BatchJob", "Resident"] as const;
const PATIENCE_MODES = ["sigmoid-budget", "window", "value-decay", "resident", "binary", "corrupts", "none"] as const;
const SIM_TIME_SCALES = ["ms", "µs", "s", "hours", "years"] as const;
const THREAT_FAMILIES = ["malicious", "human", "entropic", "systemic", "customerAsThreat"] as const;
const ALTITUDES = ["Z1", "Z2", "Z3", "Z4"] as const;
const DENOMINATIONS = ["bandwidth", "concurrency", "hands", "cash", "reputation", "data-integrity"] as const;
const WIN_KINDS = ["survive", "hold-metric", "grow-to-N", "cash-intact", "audit-pass", "convert-%"] as const;
const SCENARIO_ARCHETYPES = [
  "Endure",
  "Convert",
  "Reach-State",
  "Escort",
  "Diagnose",
  "Build-to-Spec",
  "Shrink",
  "Schedule",
  "Negotiate",
  "Hold-Without-Hands",
  "Inherit",
] as const;

const bounceSigmoidLeaf = (value: unknown, path: string): readonly [Fixed, Fixed, Fixed] | null => {
  if (value === null) return null;
  const items = listOf(fixed, 3, 3)(value, path) as readonly [Fixed, Fixed, Fixed];
  return items;
};

const VISITOR_PLAN: Plan = {
  nullable: req(bool),
  unitTerm: req(str),
  durationClass: req(enumOf(DURATION_CLASSES, "duration classes (§3.1 R26)")),
  stats: req((v, p) =>
    parseObject(v, p, {
      patience: req(nullable(fixed)),
      value: req(nullable(fixed)),
      weight: req(nullable(fixed)),
      loyalty: req(nullable(fixed)),
      fragility: req(nullable(fixed)),
    }),
  ),
  patienceModel: req((v, p) =>
    parseObject(v, p, {
      mode: req(enumOf(PATIENCE_MODES, "patience modes (§3.1 R25)")),
      params: req((pv, pp) =>
        parseObject(pv, pp, {
          budgetMs: opt(nullable(usFromMs), null),
          bounceSigmoid: opt(bounceSigmoidLeaf, null),
        }),
      ),
    }),
  ),
  party: req((v, p) =>
    parseObject(v, p, {
      allOrNothing: req(bool),
      size: req(nullable((sv, sp) => {
        const pair = listOf(intLeaf(1, Number.MAX_SAFE_INTEGER), 2, 2)(sv, sp) as readonly [number, number];
        if (pair[0] > pair[1]) {
          throw new LoaderError("OUT_OF_RANGE", sp, `party size [${pair[0]}, ${pair[1]}] has min > max`);
        }
        return pair;
      })),
    }),
  ),
  herding: req((v, p) =>
    parseObject(v, p, {
      enabled: req(bool),
      coefficient: req(nullable(fixed)),
    }),
  ),
  populationEffect: req(bool),
  retryAmplifies: req(bool),
  cohortSpawn: req((v, p) =>
    parseObject(v, p, {
      fromCustomerCard: req(bool),
      tier: req(intLeaf(0, 7)),
    }),
  ),
  costPerInvocation: req(str),
  trustReadable: req(bool),
  archetypeRefs: opt(stringList(), []),
};

const GOAL_PLAN: Plan = {
  nodeType: req(str),
  winCondition: req((v, p) =>
    parseObject(v, p, {
      kind: req(enumOf(WIN_KINDS, "win-condition kinds (§6.10 R43)")),
      metric: opt(str, null),
      threshold: opt(nullable(fixed), null),
    }),
  ),
  loseCondition: req((v, p) => parseObject(v, p, { kind: req(str) })),
  loseSlowlyGuard: req((v, p) =>
    parseObject(v, p, { minWarningMinutes: req(nullable(intLeaf(0, 100_000_000))) }),
  ),
  bindingConstraintLine: req(str),
};

const SCARCE_PLAN: Plan = {
  resourceId: req(str),
  meterWidget: req(str),
  meterBoundStat: req(str),
  commercialSlider: req(str),
  operationalDials: req(stringList()),
  windowGrows: req(bool),
  shedOrder: req(str),
  qosAnswer: req(str),
};

const TEMPO_PLAN: Plan = {
  simTimeScale: req(enumOf(SIM_TIME_SCALES, "time scales (§7.8d R18)")),
  permanentIncidentClock: req(bool),
  contractTerms: req((v, p) =>
    parseObject(v, p, {
      default: req(str),
      escalator: req(bool),
      grandfathering: req(bool),
    }),
  ),
  seasonality: req(stringList()),
  diurnalBaseline: req(str),
};

const THREATS_PLAN: Plan = {
  familyWeights: req((v, p) =>
    parseObject(v, p, {
      malicious: req(nullable(fixedUnit)),
      human: req(nullable(fixedUnit)),
      entropic: req(nullable(fixedUnit)),
      systemic: req(nullable(fixedUnit)),
      customerAsThreat: req(nullable(fixedUnit)),
    }),
  ),
  activeFamilies: req(stringList(1, 10)),
  signatureThreats: req((v, p) =>
    listOf((iv, ip) =>
      parseObject(iv, ip, {
        id: req(str),
        mechanical: req(bool),
        codexOnly: opt(bool, false),
      }),
      1,
    )(v, p),
  ),
  unlockedByBuildables: req((v, p) => keyMap(stringList())(v, p)),
  twoFrontDraw: req((v, p) => listOf(enumOf(DENOMINATIONS, "two-front denominations (§2.24 R39)"), 2)(v, p)),
  waveTable: req(str),
};

const SKIN_PLAN: Plan = {
  palette: req((v, p) =>
    parseObject(v, p, {
      dominant: req(str),
      accent: req(str),
      chord: req((cv, cp) => listOf(str, 5, 5)(cv, cp) as readonly [string, string, string, string, string]),
    }),
  ),
  materialPreset: req(str),
  visitorCostume: req((v, p) => parseObject(v, p, { hull: req(str), propSlot: req(str) })),
  heroSilhouette: req(str),
  heroObject: req(str),
  meterFace: req(str),
  catastropheFx: req(str),
  ambientSoundPack: req(str),
  densityMultiplier: req(nullable(fixed)),
  arrivalRhythm: req(str),
  homeAltitude: req(nullable(enumOf(ALTITUDES, "altitude ladder (WS-7)"))),
  detailAltitude: req(nullable(enumOf(ALTITUDES, "altitude ladder (WS-7)"))),
  commercialArtifactIcon: req(str),
  signatureMotion: req(str),
  signatureFrame: req(str),
  lodContract: req((v, p) =>
    parseObject(v, p, {
      full: req(str),
      icon16: req(str),
      pip: req(str),
      aggregate: req(str),
      inspector: req(str),
    }),
  ),
};

const ERAS_PLAN: Plan = {
  availableFrom: req(nullable(pattern(/^\d{4}$/, "a 4-digit era year (§0.4 R66)"))),
  obsoleteBy: req(nullable(pattern(/^\d{4}$/, "a 4-digit era year (§0.4 R66)"))),
  eraOverrides: req((v, p) => keyMap(opaqueRecord)(v, p)),
};

const ECONOMY_PLAN: Plan = {
  unitOfSale: req(str),
  revenueShape: req(str),
  marginProfile: req(str),
  cashTiming: req(str),
  termStructure: req((v, p) => parseObject(v, p, { typical: req(str), churn: req(str) })),
  cacProfile: req(str),
  ticketsPerCustomer: req(nullable(fixed)),
  signatureCost: req(str),
  badMonth: req(str),
  fifthAxisScore: req((v, p) =>
    parseObject(v, p, { metric: req(str), weight: req(nullable(fixedUnit)) }),
  ),
  realismToggles: req((v, p) => parseObject(v, p, { p95billing: req(bool), demandCharges: req(bool) })),
  /* ── Blessed extensions: authored §-cited numbers carried in the real
     bundles while Appendix A freezes to v1 (README §Never-invent-numbers;
     §4.3 risk 3). Parsed (never floated); nothing else is admitted. */
  chargebackRate: opt((v, p) =>
    parseObject(v, p, {
      pctOfRevenue: req(nullable(fixed)),
      range: req(nullable(str)),
    }), null),
  hypeCycle: opt((v, p) =>
    parseObject(v, p, {
      launchMultiplier: req(nullable(fixed)),
      launchWeeks: req(nullable(fixed)),
      evaporationPct: req(nullable(fixed)),
    }), null),
};

const BUILDABLES_PLAN: Plan = {
  paletteRef: req(str),
  archetypeInstances: req((v, p) =>
    listOf((iv, ip) => parseObject(iv, ip, { archetype: req(str), skin: opt(str, null) }), 0)(v, p),
  ),
  distinct: req(stringList()),
  nonPhysical: req(stringList()),
};

const CONTROL_PLAN: Plan = {
  pips: req((v, p) =>
    parseObject(v, p, {
      hardware: req(nullable(intLeaf(0, 1))),
      software: req(nullable(intLeaf(0, 1))),
      network: req(nullable(intLeaf(0, 1))),
      data: req(nullable(intLeaf(0, 1))),
    }),
  ),
  keyhole: req(bool),
  unclickableObjects: req(bool),
};

const VERBS_PLAN: Plan = {
  dominant: req(str),
  transfers: req(stringList()),
};

const RELATIONS_PLAN: Plan = {
  synergies: req((v, p) =>
    listOf((iv, ip) =>
      parseObject(iv, ip, {
        with: req(str),
        kind: req(str),
        numbers: opt(nullable((nv, np) => keyMap(nullable(fixed))(nv, np)), null),
      }),
      0,
    )(v, p),
  ),
  antagonisms: req((v, p) =>
    listOf((iv, ip) =>
      parseObject(iv, ip, {
        with: req(str),
        resource: opt(str, null),
        kind: opt(str, null),
        render: opt(str, null),
      }),
      0,
    )(v, p),
  ),
  unlocks: req((v, p) =>
    parseObject(v, p, {
      prereqSets: req((pv, pp) =>
        listOf((iv, ip) =>
          parseObject(iv, ip, {
            tech: opt(stringList(), null),
            commercial: opt(stringList(), null),
            alt: opt(str, null),
          }),
          0,
        )(pv, pp),
      ),
    }),
  ),
  pivots: req((v, p) =>
    parseObject(v, p, {
      to: req((tv, tp) =>
        keyMap((iv, ip) =>
          parseObject(iv, ip, {
            customerOverlap: req(nullable(fixedUnit)),
            hardwareReuse: req(nullable(fixedUnit)),
            skillTransfer: req(nullable(fixedUnit)),
            regulatoryDelta: req(nullable(fixedUnit)),
          }),
        )(tv, tp),
      ),
    }),
  ),
  masteryBuff: req(str),
  distillate: req(str),
};

const HANDOVER_PLAN: Plan = {
  runsOut: req(str),
  killsYou: req(str),
  customerWants: req(str),
};

const SCENARIOS_PLAN: Plan = {
  archetypeApplicability: req((v, p) => listOf(enumOf(SCENARIO_ARCHETYPES, "scenario archetypes (§1.9 R14)"), 0)(v, p)),
  analogues: req((v, p) => keyMap(str)(v, p)),
};

const GUARDRAILS_PLAN: Plan = {
  depiction: req(str),
  arcMustEnd: req(bool),
};

const META_PLAN: Plan = {
  name: req(str),
  codexSummary: req(str),
  tone: req(enumOf(["comedy", "straight"] as const, "tones (R80)")),
  official: req(bool),
  publishedAsEditableCard: req(bool),
};

const ROOT_PLAN: Plan = {
  schemaVersion: req(str),
  id: req(pattern(/^([a-z0-9][a-z0-9-]*:)?[a-z0-9][a-z0-9-]*$/, "the mod-safe namespaced id pattern (Appendix A)")),
  meta: req((v, p) => parseObject(v, p, META_PLAN)),
  visitor: req((v, p) => parseObject(v, p, VISITOR_PLAN)),
  goal: req((v, p) => parseObject(v, p, GOAL_PLAN)),
  scarce: req((v, p) => parseObject(v, p, SCARCE_PLAN)),
  tempo: req((v, p) => parseObject(v, p, TEMPO_PLAN)),
  threats: req((v, p) => parseObject(v, p, THREATS_PLAN)),
  skin: req((v, p) => parseObject(v, p, SKIN_PLAN)),
  eras: req((v, p) => parseObject(v, p, ERAS_PLAN)),
  economy: req((v, p) => parseObject(v, p, ECONOMY_PLAN)),
  buildables: req((v, p) => parseObject(v, p, BUILDABLES_PLAN)),
  control: req((v, p) => parseObject(v, p, CONTROL_PLAN)),
  mechanics: req(stringList()),
  verbs: req((v, p) => parseObject(v, p, VERBS_PLAN)),
  relations: req((v, p) => parseObject(v, p, RELATIONS_PLAN)),
  ticketPack: req(str),
  handoverNote: req((v, p) => parseObject(v, p, HANDOVER_PLAN)),
  rosettaCards: req((v, p) =>
    listOf((iv, ip) =>
      parseObject(iv, ip, { canonical: req(str), alias: req(str), line: req(str) }),
      1,
    )(v, p),
  ),
  scenarios: req((v, p) => parseObject(v, p, SCENARIOS_PLAN)),
  guardrails: req((v, p) => parseObject(v, p, GUARDRAILS_PLAN)),
};

/* ═════════════════════ flattening + freeze ═════════════════════ */

/** Flatten the nested-but-plan-shaped parse result into the public
 *  LoadedTypeBundle. Data-movement only — every value is already trusted. */
function toLoadedBundle(parsed: JsonRecord): LoadedTypeBundle {
  const visitor = parsed.visitor as JsonRecord;
  const patienceModel = visitor.patienceModel as JsonRecord;
  const party = visitor.party as JsonRecord;
  const herding = visitor.herding as JsonRecord;
  const cohortSpawn = visitor.cohortSpawn as JsonRecord;
  const goal = parsed.goal as JsonRecord;
  const winCondition = goal.winCondition as JsonRecord;
  const loseCondition = goal.loseCondition as JsonRecord;
  const guard = goal.loseSlowlyGuard as JsonRecord;
  const tempo = parsed.tempo as JsonRecord;
  const contractTerms = tempo.contractTerms as JsonRecord;
  const threats = parsed.threats as JsonRecord;
  const skin = parsed.skin as JsonRecord;
  const palette = skin.palette as JsonRecord;
  const costume = skin.visitorCostume as JsonRecord;
  const eras = parsed.eras as JsonRecord;
  const economy = parsed.economy as JsonRecord;
  const termStructure = economy.termStructure as JsonRecord;
  const fifthAxis = economy.fifthAxisScore as JsonRecord;
  const realism = economy.realismToggles as JsonRecord;
  const control = parsed.control as JsonRecord;
  const pips = control.pips as JsonRecord;
  const verbs = parsed.verbs as JsonRecord;
  const relations = parsed.relations as JsonRecord;
  const unlocks = relations.unlocks as JsonRecord;
  const pivots = relations.pivots as JsonRecord;
  const scenarios = parsed.scenarios as JsonRecord;

  const loaded: LoadedTypeBundle = {
    schemaVersion: parsed.schemaVersion as string,
    id: parsed.id as string,
    meta: parsed.meta as LoadedMeta,
    visitor: {
      nullable: visitor.nullable as boolean,
      unitTerm: visitor.unitTerm as string,
      durationClass: visitor.durationClass as DurationClass,
      stats: visitor.stats as LoadedVisitorStats,
      patienceMode: patienceModel.mode as PatienceMode,
      // wire key budgetMs → loaded key budgetUs (unit changed at the boundary)
      patienceParams: {
        budgetUs: (patienceModel.params as JsonRecord).budgetMs as SimTimeUs | null,
        bounceSigmoid: (patienceModel.params as JsonRecord).bounceSigmoid as readonly [
          Fixed,
          Fixed,
          Fixed,
        ] | null,
      } satisfies LoadedPatienceParams,
      partyAllOrNothing: party.allOrNothing as boolean,
      partySize: party.size as readonly [number, number] | null,
      herdingEnabled: herding.enabled as boolean,
      herdingCoefficient: herding.coefficient as Fixed | null,
      populationEffect: visitor.populationEffect as boolean,
      retryAmplifies: visitor.retryAmplifies as boolean,
      cohortFromCustomerCard: cohortSpawn.fromCustomerCard as boolean,
      cohortTier: cohortSpawn.tier as number,
      costPerInvocation: visitor.costPerInvocation as string,
      trustReadable: visitor.trustReadable as boolean,
      archetypeRefs: visitor.archetypeRefs as readonly string[],
    },
    goal: {
      nodeType: goal.nodeType as string,
      winKind: winCondition.kind as WinConditionKind,
      winMetric: winCondition.metric as string | null,
      winThreshold: winCondition.threshold as Fixed | null,
      loseKind: loseCondition.kind as string,
      minWarningMinutes: guard.minWarningMinutes as number | null,
      bindingConstraintLine: goal.bindingConstraintLine as string,
    },
    scarce: parsed.scarce as LoadedScarce,
    tempo: {
      simTimeScale: tempo.simTimeScale as BundleTimeScale,
      permanentIncidentClock: tempo.permanentIncidentClock as boolean,
      contractDefault: contractTerms.default as string,
      contractEscalator: contractTerms.escalator as boolean,
      contractGrandfathering: contractTerms.grandfathering as boolean,
      seasonality: tempo.seasonality as readonly string[],
      diurnalBaseline: tempo.diurnalBaseline as string,
    },
    threats: {
      familyWeights: threats.familyWeights as LoadedFamilyWeights,
      activeFamilies: threats.activeFamilies as readonly string[],
      signatureThreats: threats.signatureThreats as readonly LoadedSignatureThreat[],
      unlockedByBuildables: threats.unlockedByBuildables as Readonly<Record<string, readonly string[]>>,
      twoFrontDraw: threats.twoFrontDraw as readonly TwoFrontDenomination[],
      waveTable: threats.waveTable as string,
    },
    skin: {
      dominant: palette.dominant as string,
      accent: palette.accent as string,
      chord: palette.chord as LoadedSkin["chord"],
      materialPreset: skin.materialPreset as string,
      costumeHull: costume.hull as string,
      costumePropSlot: costume.propSlot as string,
      heroSilhouette: skin.heroSilhouette as string,
      heroObject: skin.heroObject as string,
      meterFace: skin.meterFace as string,
      catastropheFx: skin.catastropheFx as string,
      ambientSoundPack: skin.ambientSoundPack as string,
      densityMultiplier: skin.densityMultiplier as Fixed | null,
      arrivalRhythm: skin.arrivalRhythm as string,
      homeAltitude: skin.homeAltitude as EraAltitude | null,
      detailAltitude: skin.detailAltitude as EraAltitude | null,
      commercialArtifactIcon: skin.commercialArtifactIcon as string,
      signatureMotion: skin.signatureMotion as string,
      signatureFrame: skin.signatureFrame as string,
      lodContract: skin.lodContract as LoadedLodContract,
    },
    eras: {
      availableFrom: eras.availableFrom as YearString | null,
      obsoleteBy: eras.obsoleteBy as YearString | null,
      eraOverrides: eras.eraOverrides as LoadedEras["eraOverrides"],
    },
    economy: {
      unitOfSale: economy.unitOfSale as string,
      revenueShape: economy.revenueShape as string,
      marginProfile: economy.marginProfile as string,
      cashTiming: economy.cashTiming as string,
      termTypical: termStructure.typical as string,
      termChurn: termStructure.churn as string,
      cacProfile: economy.cacProfile as string,
      ticketsPerCustomer: economy.ticketsPerCustomer as Fixed | null,
      signatureCost: economy.signatureCost as string,
      badMonth: economy.badMonth as string,
      fifthAxisMetric: fifthAxis.metric as string,
      fifthAxisWeight: fifthAxis.weight as Fixed | null,
      p95billing: realism.p95billing as boolean,
      demandCharges: realism.demandCharges as boolean,
      ...(economy.chargebackRate === null
        ? {}
        : { chargebackRate: economy.chargebackRate as LoadedChargebackRate }),
      ...(economy.hypeCycle === null ? {} : { hypeCycle: economy.hypeCycle as LoadedHypeCycle }),
    },
    buildables: parsed.buildables as LoadedBuildables,
    control: {
      pipsHardware: pips.hardware as number | null,
      pipsSoftware: pips.software as number | null,
      pipsNetwork: pips.network as number | null,
      pipsData: pips.data as number | null,
      keyhole: control.keyhole as boolean,
      unclickableObjects: control.unclickableObjects as boolean,
    },
    mechanics: parsed.mechanics as readonly string[],
    verbs: {
      dominant: verbs.dominant as string,
      transfers: verbs.transfers as readonly string[],
    },
    relations: {
      synergies: relations.synergies as readonly LoadedSynergy[],
      antagonisms: relations.antagonisms as readonly LoadedAntagonism[],
      prereqSets: unlocks.prereqSets as readonly LoadedPrereqSet[],
      pivots: pivots.to as Readonly<Record<string, LoadedPivot>>,
      masteryBuff: relations.masteryBuff as string,
      distillate: relations.distillate as string,
    },
    ticketPack: parsed.ticketPack as string,
    handoverNote: parsed.handoverNote as LoadedHandoverNote,
    rosettaCards: parsed.rosettaCards as readonly LoadedRosettaCard[],
    scenarios: {
      archetypeApplicability: scenarios.archetypeApplicability as readonly ScenarioArchetype[],
      analogues: scenarios.analogues as Readonly<Record<string, string>>,
    },
    guardrails: parsed.guardrails as LoadedGuardrails,
  };
  return loaded;
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value as Record<string, unknown>)) deepFreeze(inner);
  }
  return value;
}

/**
 * THE boundary parse (Law 2). Input: JSON-parsed wire value. Output: frozen,
 * typed, float-free LoadedTypeBundle. Throws LoaderError (named code + dotted
 * path) on any missing / unknown / mistyped / out-of-range field.
 */
export function loadTypeBundle(raw: unknown): LoadedTypeBundle {
  const parsed = parseObject(raw, "", ROOT_PLAN);
  const bundle = toLoadedBundle(parsed);
  assertFixedDomain(bundle);
  return deepFreeze(bundle);
}

/** Last-line range guard: every Fixed that came from a plain int path is
 *  already checked by fromRatio; this catches whole-dollar-style overflows
 *  with a bundle-aware message before freeze. */
function assertFixedDomain(bundle: LoadedTypeBundle): void {
  const probe: Readonly<Record<string, Fixed | null>> = {
    patience: bundle.visitor.stats.patience,
    coefficient: bundle.visitor.herdingCoefficient,
    density: bundle.skin.densityMultiplier,
    tickets: bundle.economy.ticketsPerCustomer,
    threshold: bundle.goal.winThreshold,
  };
  for (const [name, raw] of Object.entries(probe)) {
    if (raw !== null && !fixedInDomain(raw)) {
      throw new LoaderError("OUT_OF_RANGE", name, `value ${raw} escapes the Q16.16 domain`);
    }
  }
}

/**
 * Stable serialization of loaded state (bigint-safe, key order = plan order).
 * Used by the ×100 load-determinism gate; NOT a replay hash — the replay
 * module owns canonical digests. Same bundle ⇒ same string, always.
 */
export function stableSerialize(value: unknown): string {
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean" || value === null) return String(value);
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) {
      throw new LoaderError("NOT_A_SAFE_INTEGER", "stableSerialize", "float escaped the boundary");
    }
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, inner]) => `${JSON.stringify(key)}:${stableSerialize(inner)}`,
    );
    return `{${entries.join(",")}}`;
  }
  throw new LoaderError("WRONG_TYPE", "stableSerialize", `cannot serialize ${typeof value}`);
}
