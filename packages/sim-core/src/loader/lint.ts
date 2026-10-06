/**
 * THE RULESET DIFF LINTER — content-CI gate (MASTER_REPORT §4.3 tooling
 * demand + §3 table "Ruleset Diff Linter CI"; docs/CONVENTIONS.md §3; the
 * linter IS the missing enforcement clause hosting_game.md §9.6 names).
 * It diffs BEHAVIOUR, not fields.
 *
 * Rule families (one code each; severity error fails the report, warn
 * rides along):
 *  THREE_CHANGE  §0.2 + §9.6 — scarce + fatal + customer identity ALL differ
 *                per pair, else the type does not ship.
 *  VERB_SHIFT    §0.2 R4 + §1.9 Invariant Core — dominant verb differs, else
 *                VERDICT: MERGE; a 7th verb is also a VERB_SHIFT failure.
 *  ROSETTA       §9.6 R5 + §1.9 Handover Note — the note's 3 slots distinct
 *                and every Rosetta card a complete canonical/alias/line trio.
 *  CHANGED_HOOKS §7.8 "The Three-to-Five Change Rule" — count of changed
 *                per-type mechanical hooks ∈ [3,5]: "change two and it is a
 *                reskin; change eight and it is a different game". §7.8 is a
 *                PER-TYPE law ("a hosting type must change 3–5 of the items"),
 *                so every distance is measured against ONE designated baseline
 *                (LintConfig.baselineId), never pairwise across the corpus:
 *                34 roadmap types would make a pairwise 3–5 budget unsatisfiable.
 *                Unknown slots are invisible to the diff, so a pair jointly
 *                declaring ≤2 of the 16 hook slots earns a minor warn ("distance
 *                unmeasurable") instead of a verdict — sparse types cannot coast.
 *  PALETTE_20    §0.2 corollary R7 — the 20% palette rule: a shared palette
 *                ref and non-disjoint buildable-archetype composition (the
 *                machine-readable form of "80% must be objects the player
 *                already knows"; content README §20% enforcement practice).
 *  BESPOKE_TALLY §8.10 R48/R49/R8 — Five-Asset Skin Kit: ≤5 bespoke asset
 *                refs (asset:/fx: schemes) per skin, materials preset-only
 *                ("five assets plus eight parameter values").
 *  CROSS_REF     schema §threats — every signatureThreat id resolves in the
 *                threat registry, every archetypeRef in the archetype
 *                registry, every waveTable is a resolvable file: ref whose doc
 *                declares a 'type' back-link equal to this bundle id.
 *  WAVE_STRUCTURE wavestruct.ts S1–S3 — the three structural shapes only;
 *                wave LAWS (§1.7/§2.24) belong to the waves module.
 *
 * Pure and deterministic (Law 3): bundles are sorted by id, pair order is
 * (i<j), the fallback baseline is the first sorted id, findings are emitted
 * rule-pass by rule-pass — stable for CI diff.
 * No fs, no Date, no Math.random (CONVENTIONS §4) — the corpus is injected.
 */

import type { LoadedTypeBundle } from "./bundle.ts";
import type { ThreatRegistryIndex, VisitorArchetypeIndex } from "./registries.ts";
import { inspectWaveTableStructure } from "./wavestruct.ts";

export type LintCode =
  | "THREE_CHANGE"
  | "VERB_SHIFT"
  | "ROSETTA"
  | "CHANGED_HOOKS"
  | "PALETTE_20"
  | "BESPOKE_TALLY"
  | "CROSS_REF"
  | "WAVE_STRUCTURE";

export type LintSeverity = "error" | "warn";

export interface LintFinding {
  readonly code: LintCode;
  readonly severity: LintSeverity;
  /** Bundle ids involved — length 1 for per-bundle rules (including a §7.8
   *  distance verdict, whose baseline is named in `detail`), 2 for pairwise. */
  readonly bundles: readonly string[];
  readonly detail: string;
  /** Design-law citation for the violated rule. */
  readonly cite: string;
}

export interface LintReport {
  /** True when no error-severity finding exists (warnings ride along). */
  readonly pass: boolean;
  readonly findings: readonly LintFinding[];
}

/** One structural wave-doc complaint (produced by wavestruct.ts). */
export interface WaveStructureIssue {
  readonly ref: string;
  readonly shape: "WAVE_LIST" | "BAND_VOCAB" | "ENVELOPES";
  readonly detail: string;
}

export interface RulesetCorpus {
  readonly bundles: readonly LoadedTypeBundle[];
  readonly threats: ThreatRegistryIndex;
  readonly visitors: VisitorArchetypeIndex;
  /** Resolved wave docs keyed by the bundle ref minus its "file:" prefix
   *  (e.g. "waves/g1-shared-web-first-quarter.json"). Loaded by the CALLER —
   *  sim-core never touches storage (CONVENTIONS §4). */
  readonly waves: ReadonlyMap<string, unknown>;
  /** Lint knobs, anchored by the corpus itself (see `LintConfig`). */
  readonly config?: LintConfig;
}

/** The type every §7.8 hook distance is measured FROM (§7.8 is a per-type law
 *  and needs one yardstick, not N−1). Resolution order:
 *  1. `baselineId` when supplied — an id missing from the corpus fails loud.
 *  2. otherwise `official:shared-web`, the shipped first ruleset, when present.
 *  3. otherwise the first-sorted bundle id, announced with a warn finding so a
 *     corpus never silently re-anchors the variety budget. */
export interface LintConfig {
  readonly baselineId?: string;
}

/** Default §7.8 anchor: the first ruleset the player ever learns. */
const HOOK_BASELINE_ANCHOR_ID = "official:shared-web";

/** Below this many jointly-declared hook slots the 3–5 verdict is fiction. */
const MIN_MEASURABLE_HOOK_SLOTS = 2;

const CITE_78 = "hosting_game.md §7.8 The Three-to-Five Change Rule (R6)";

/** §1.9 six invariant verbs — the Invariant Core law ("it may never
 *  introduce a seventh verb"); supersedes the §7.8 eight-verb sketch. */
export const INVARIANT_VERBS = [
  "observe",
  "diagnose",
  "place & connect",
  "tune",
  "triage",
  "commit",
] as const;

/* ═════════════════════ hook registry (§7.8 items, R15–R23) ═════════════════════
 * "A hosting type must change 3–5 of the items in this section" (§7.8).
 * Each hook reads the bundle's machine fields; a slot is UNKNOWN when null
 * (unauthored placeholders never count as a change — an unauthored slot is
 * invisible to the diff, and the _todo report owns that debt). */

const UNKNOWN = "\u0000unknown";

function knownSlot(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return UNKNOWN;
  return String(value);
}

/** List-valued slots compare as SETS (toggle order is not semantics). */
function setSignature(values: readonly string[]): string {
  if (values.length === 0) return UNKNOWN;
  return [...values].sort().join("|");
}

interface Hook {
  readonly name: string;
  readonly slots: (bundle: LoadedTypeBundle) => readonly string[];
}

const PER_TYPE_HOOKS: readonly Hook[] = [
  {
    name: "scarce-meter-swap(R15)",
    slots: (b) => [knownSlot(b.scarce.meterWidget), knownSlot(b.scarce.meterBoundStat), knownSlot(b.skin.meterFace)],
  },
  { name: "commercial-slider-swap(R16)", slots: (b) => [knownSlot(b.scarce.commercialSlider)] },
  {
    name: "operational-dials(R17)",
    slots: (b) => [setSignature(b.scarce.operationalDials)],
  },
  {
    name: "time-granularity(R18)",
    slots: (b) => [knownSlot(b.tempo.simTimeScale), knownSlot(b.tempo.permanentIncidentClock)],
  },
  { name: "pathing-semantics(R19)", slots: (b) => [knownSlot(b.scarce.windowGrows)] },
  {
    name: "control-granularity(R20)",
    slots: (b) => [
      knownSlot(b.control.pipsHardware),
      knownSlot(b.control.pipsSoftware),
      knownSlot(b.control.pipsNetwork),
      knownSlot(b.control.pipsData),
    ],
  },
  {
    name: "keyhole-mode(R21)",
    slots: (b) => [knownSlot(b.control.keyhole), knownSlot(b.control.unclickableObjects)],
  },
  { name: "module-toggles(R22)", slots: (b) => [setSignature(b.mechanics)] },
  { name: "qos-shed-ladder(R23)", slots: (b) => [knownSlot(b.scarce.shedOrder)] },
];

function hookDiffers(a: LoadedTypeBundle, b: LoadedTypeBundle, hook: Hook): boolean {
  const slotsA = hook.slots(a);
  const slotsB = hook.slots(b);
  for (let i = 0; i < slotsA.length; i += 1) {
    const slotA = slotsA[i]!;
    const slotB = slotsB[i]!;
    if (slotA !== UNKNOWN && slotB !== UNKNOWN && slotA !== slotB) return true;
  }
  return false;
}

function changedHooks(a: LoadedTypeBundle, b: LoadedTypeBundle): readonly string[] {
  return PER_TYPE_HOOKS.filter((hook) => hookDiffers(a, b, hook)).map((hook) => hook.name);
}

/** How many hook slots BOTH bundles declare (unknowns are invisible to the
 *  diff, so a sparse bundle shrinks the honest measurement surface). */
function comparableHookSlots(
  a: LoadedTypeBundle,
  b: LoadedTypeBundle,
): { readonly comparable: number; readonly total: number } {
  let comparable = 0;
  let total = 0;
  for (const hook of PER_TYPE_HOOKS) {
    const slotsA = hook.slots(a);
    const slotsB = hook.slots(b);
    for (let i = 0; i < slotsA.length; i += 1) {
      total += 1;
      if (slotsA[i] !== UNKNOWN && slotsB[i] !== UNKNOWN) comparable += 1;
    }
  }
  return { comparable, total };
}

interface BaselineChoice {
  /** Null when the anchor could not be resolved — the budget leg then stays
   *  silent because the finding it would emit is the reason why. */
  readonly bundle: LoadedTypeBundle | null;
  /** Announcement finding (fallback / misconfiguration), emitted once. */
  readonly notice: LintFinding | null;
}

function pickById(
  bundles: readonly LoadedTypeBundle[],
  id: string,
): LoadedTypeBundle | undefined {
  return bundles.find((bundle) => bundle.id === id);
}

function selectBaseline(
  bundles: readonly LoadedTypeBundle[],
  config: LintConfig,
): BaselineChoice {
  const requested = config.baselineId;
  if (requested !== undefined) {
    const designated = pickById(bundles, requested);
    if (designated !== undefined) return { bundle: designated, notice: null };
    return {
      bundle: null,
      notice: {
        code: "CHANGED_HOOKS",
        severity: "error",
        bundles: [requested],
        detail: `configured baselineId '${requested}' is not in the corpus — the §7.8 budget cannot be measured against an absent type`,
        cite: CITE_78,
      },
    };
  }

  const anchor = pickById(bundles, HOOK_BASELINE_ANCHOR_ID);
  if (anchor !== undefined) return { bundle: anchor, notice: null };

  const first = bundles[0];
  if (first === undefined) return { bundle: null, notice: null };
  // A lone type has no distance to anyone; nothing can coast on it.
  if (bundles.length < 2) return { bundle: first, notice: null };

  return {
    bundle: first,
    notice: {
      code: "CHANGED_HOOKS",
      severity: "warn",
      bundles: [first.id],
      detail: `no baseline designated and the anchor '${HOOK_BASELINE_ANCHOR_ID}' is absent — falling back to the first-sorted id '${first.id}'; set LintConfig.baselineId to pin the variety budget`,
      cite: CITE_78,
    },
  };
}

/** §7.8 verdict for ONE type against the designated baseline. */
function hookBudgetFinding(
  baseline: LoadedTypeBundle,
  bundle: LoadedTypeBundle,
): LintFinding | null {
  if (bundle.id === baseline.id) return null; // the yardstick does not measure itself

  const { comparable, total } = comparableHookSlots(baseline, bundle);
  if (comparable <= MIN_MEASURABLE_HOOK_SLOTS) {
    return {
      code: "CHANGED_HOOKS",
      severity: "warn",
      bundles: [bundle.id],
      detail: `minor: only ${comparable} of ${total} §7.8 hook slots are declared by both '${baseline.id}' and this bundle — distance unmeasurable, budget not judged; author the slots (the _todo report owns that debt)`,
      cite: CITE_78,
    };
  }

  const changed = changedHooks(baseline, bundle);
  if (changed.length >= 3 && changed.length <= 5) return null;
  const side =
    changed.length < 3
      ? "reskin (change 2 and it is a reskin)"
      : "different game (change 8 and the player relearns everything)";
  return {
    code: "CHANGED_HOOKS",
    severity: "error",
    bundles: [bundle.id],
    detail: `${changed.length} of the nine §7.8 hooks changed vs baseline '${baseline.id}' [${changed.join(", ")}] — outside the 3–5 budget: ${side}`,
    cite: CITE_78,
  };
}

/* ═════════════════════ bespoke asset tally helpers (R48/R49) ═════════════════════ */

const BESPOKE_REF = /^(asset|fx):/;

function bespokeSkinRefs(bundle: LoadedTypeBundle): readonly string[] {
  const skinValues: readonly (string | null)[] = [
    bundle.skin.heroSilhouette,
    bundle.skin.heroObject,
    bundle.skin.meterFace,
    bundle.skin.catastropheFx,
    bundle.skin.ambientSoundPack,
    bundle.skin.commercialArtifactIcon,
    bundle.skin.signatureMotion,
    bundle.skin.signatureFrame,
    bundle.skin.materialPreset,
    bundle.skin.costumeHull,
    bundle.skin.costumePropSlot,
    bundle.skin.lodContract.full,
    bundle.skin.lodContract.icon16,
    bundle.skin.lodContract.pip,
    bundle.skin.lodContract.aggregate,
    bundle.skin.lodContract.inspector,
  ];
  return skinValues.filter((value): value is string => value !== null && BESPOKE_REF.test(value));
}

/* ═════════════════════ wave ref helpers ═════════════════════ */

export function waveRefKey(waveTable: string): string | null {
  return waveTable.startsWith("file:") ? waveTable.slice("file:".length) : null;
}

/** Read one top-level field of an injected JSON doc, tolerating any shape. */
function docField(doc: unknown, field: string): unknown {
  if (doc === null || typeof doc !== "object" || Array.isArray(doc)) return undefined;
  return (doc as Record<string, unknown>)[field];
}

/** §7.13: a wave table belongs to exactly one ruleset and must SAY so. A doc
 *  with no `type` field is an unclaimed table — it can be re-pointed at a
 *  sibling bundle later without tripping the back-link check, so the link must
 *  be authored, never inferred from the filename. */
function waveBackLinkFinding(
  bundle: LoadedTypeBundle,
  waveKey: string,
  doc: unknown,
): LintFinding | null {
  const cite = "hosting_game.md §7.13 (tables are per-ruleset)";
  const declared = docField(doc, "type");
  if (typeof declared !== "string" || declared.length === 0) {
    return {
      code: "CROSS_REF",
      severity: "error",
      bundles: [bundle.id],
      detail: `waveTable '${waveKey}' declares no 'type' back-link — an unclaimed table cannot be traced to '${bundle.id}' (add a top-level type equal to the bundle id)`,
      cite,
    };
  }
  if (declared === bundle.id) return null;
  return {
    code: "CROSS_REF",
    severity: "error",
    bundles: [bundle.id],
    detail: `waveTable '${waveKey}' back-links type '${declared}', not this bundle`,
    cite,
  };
}

/* ═════════════════════ the linter ═════════════════════ */

export function lintRulesetCorpus(corpus: RulesetCorpus): LintReport {
  const findings: LintFinding[] = [];
  const bundles = [...corpus.bundles].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const baseline = selectBaseline(bundles, corpus.config ?? {});
  if (baseline.notice !== null) findings.push(baseline.notice);

  const push = (
    code: LintCode,
    severity: LintSeverity,
    bundles_: readonly string[],
    detail: string,
    cite: string,
  ): void => {
    findings.push({ code, severity, bundles: bundles_, detail, cite });
  };

  /* ── pairwise identity laws (THREE_CHANGE / VERB_SHIFT / PALETTE_20) ──
     These stay pairwise: they speak about two types meeting. CHANGED_HOOKS
     does NOT — §7.8 is per-type, so it lives in the baseline leg below. */
  for (let i = 0; i < bundles.length; i += 1) {
    for (let j = i + 1; j < bundles.length; j += 1) {
      const a = bundles[i]!;
      const b = bundles[j]!;
      const unchanged: string[] = [];
      if (a.scarce.resourceId === b.scarce.resourceId) {
        unchanged.push(`scarce resource stays '${a.scarce.resourceId}'`);
      }
      if (a.goal.loseKind === b.goal.loseKind) {
        unchanged.push(`fatal failure stays '${a.goal.loseKind}'`);
      }
      if (a.visitor.unitTerm === b.visitor.unitTerm && a.economy.unitOfSale === b.economy.unitOfSale) {
        unchanged.push(`customer identity stays '${a.visitor.unitTerm}' / '${a.economy.unitOfSale}'`);
      }
      if (unchanged.length > 0) {
        push(
          "THREE_CHANGE",
          "error",
          [a.id, b.id],
          `does not ship: ${unchanged.join("; ")}`,
          "hosting_game.md §0.2 Three-Change Rule (R3)",
        );
      }

      /* ── VERB_SHIFT (pairwise) ─────────────────────────────────── */
      if (a.verbs.dominant.trim().toLowerCase() === b.verbs.dominant.trim().toLowerCase()) {
        push(
          "VERB_SHIFT",
          "error",
          [a.id, b.id],
          `both dominated by '${a.verbs.dominant}' — VERDICT: MERGE (two types sharing a verb merge)`,
          "hosting_game.md §0.2 Verb Shift Rule (R4)",
        );
      }

      /* ── PALETTE_20 (pairwise legs) ────────────────────────────── */
      if (a.buildables.paletteRef !== b.buildables.paletteRef) {
        push(
          "PALETTE_20",
          "error",
          [a.id, b.id],
          `palette bases differ ('${a.buildables.paletteRef}' vs '${b.buildables.paletteRef}') — no shared 80% for the player to already know`,
          "hosting_game.md §0.2 20% palette rule (R7)",
        );
      }
      const archetypesA = new Set(a.buildables.archetypeInstances.map((entry) => entry.archetype));
      const archetypesB = new Set(b.buildables.archetypeInstances.map((entry) => entry.archetype));
      const sharesAny = [...archetypesA].some((name) => archetypesB.has(name));
      if (!sharesAny) {
        push(
          "PALETTE_20",
          "error",
          [a.id, b.id],
          `buildable-archetype sets are disjoint [${[...archetypesA].join(", ")}] vs [${[...archetypesB].join(", ")}] — the second type re-builds the palette instead of re-wearing it`,
          "hosting_game.md §0.2 20% palette rule (R7); content README §20% practice",
        );
      }
    }
  }

  for (const bundle of bundles) {
    /* ── CHANGED_HOOKS (per type vs the designated baseline) ─────────── */
    if (baseline.bundle !== null) {
      const budget = hookBudgetFinding(baseline.bundle, bundle);
      if (budget !== null) findings.push(budget);
    }

    /* ── VERB_SHIFT (canon leg, per bundle) ──────────────────────────── */
    if (!(INVARIANT_VERBS as readonly string[]).includes(bundle.verbs.dominant.trim().toLowerCase())) {
      push(
        "VERB_SHIFT",
        "error",
        [bundle.id],
        `dominant verb '${bundle.verbs.dominant}' is not one of the six invariant verbs — a type may never introduce a seventh`,
        "hosting_game.md §1.9 The Invariant Core (R4)",
      );
    }

    /* ── ROSETTA (per bundle) ────────────────────────────────────────── */
    const noteSlots: readonly [string, string][] = [
      ["runsOut", bundle.handoverNote.runsOut],
      ["killsYou", bundle.handoverNote.killsYou],
      ["customerWants", bundle.handoverNote.customerWants],
    ];
    const seenLine = new Map<string, string>();
    for (const [slot, line] of noteSlots) {
      const prior = seenLine.get(line);
      if (prior !== undefined) {
        push(
          "ROSETTA",
          "error",
          [bundle.id],
          `handoverNote.${slot} repeats ${prior} — the note must state three DISTINCT things (what runs out / what kills you / what the customer wants)`,
          "hosting_game.md §1.9 Handover Note (R10); §9.6 Rosetta Test (R5)",
        );
      }
      seenLine.set(line, slot);
    }
    const seenCardPair = new Set<string>();
    for (const card of bundle.rosettaCards) {
      const key = `${card.canonical}\u0000${card.alias}`;
      if (seenCardPair.has(key)) {
        push(
          "ROSETTA",
          "error",
          [bundle.id],
          `rosettaCard '${card.canonical}'/'${card.alias}' duplicated — one canonical may wear an alias once`,
          "hosting_game.md §0.2 Rosetta Card (R11)",
        );
      }
      seenCardPair.add(key);
    }

    /* ── PALETTE_20 (per-bundle leg) ─────────────────────────────────── */
    if (!bundle.buildables.paletteRef.startsWith("palette:")) {
      push(
        "PALETTE_20",
        "error",
        [bundle.id],
        `buildables.paletteRef '${bundle.buildables.paletteRef}' is not a 'palette:' registry ref — the 80% shared palette cannot be resolved`,
        "hosting_game.md §0.2 20% palette rule (R7)",
      );
    }
    if (bundle.buildables.archetypeInstances.length === 0) {
      push(
        "PALETTE_20",
        "error",
        [bundle.id],
        "no archetypeInstances composed — build from the engine registry (~15 verb-changers max), never a fresh palette",
        "hosting_game.md §4.10/R61; §0.2 20% palette rule (R7)",
      );
    }

    /* ── BESPOKE_TALLY (per bundle) ──────────────────────────────────── */
    const bespoke = bespokeSkinRefs(bundle);
    if (bespoke.length > 5) {
      push(
        "BESPOKE_TALLY",
        "error",
        [bundle.id],
        `${bespoke.length} bespoke skin refs [${bespoke.join(", ")}] exceed the Five-Asset Skin Kit (5 assets + 8 parameters) — justify or swap to shared presets`,
        "hosting_game.md §8.10 Five-Asset Skin Kit (R48/R49, asset-reuse law R8)",
      );
    }
    if (!bundle.skin.materialPreset.startsWith("preset:")) {
      push(
        "BESPOKE_TALLY",
        "error",
        [bundle.id],
        `materialPreset '${bundle.skin.materialPreset}' is not a 'preset:' lookup — no bespoke materials (Pixi preset/blend/tint law)`,
        "hosting_game.md §8.10 (R49); MASTER_REPORT Appendix A material note",
      );
    }

    /* ── CROSS_REF (per bundle) ──────────────────────────────────────── */
    for (const threat of bundle.threats.signatureThreats) {
      if (!corpus.threats.threatIds.has(threat.id)) {
        push(
          "CROSS_REF",
          "error",
          [bundle.id],
          `signatureThreat '${threat.id}' does not resolve in ${corpus.threats.source}`,
          "hosting_game.md §2.12 signature-threat registry (R35/R36)",
        );
      }
    }
    for (const [buildable, ids] of Object.entries(bundle.threats.unlockedByBuildables)) {
      for (const id of ids) {
        if (!corpus.threats.threatIds.has(id)) {
          push(
            "CROSS_REF",
            "error",
            [bundle.id],
            `unlockedByBuildables['${buildable}'] cites unknown threat '${id}'`,
            "hosting_game.md §2.1 tech-tree-is-bestiary (R37)",
          );
        }
      }
    }
    for (const ref of bundle.visitor.archetypeRefs) {
      if (!corpus.visitors.archetypeIds.has(ref)) {
        push(
          "CROSS_REF",
          "error",
          [bundle.id],
          `visitor.archetypeRefs '${ref}' does not resolve in ${corpus.visitors.source}`,
          "hosting_game.md §3.2 visitor spine (R24)",
        );
      }
    }

    /* wave table leg (missing target = warn: slices land after bundles per
       content README; junk/unlinked target = error) */
    const waveKey = waveRefKey(bundle.threats.waveTable);
    if (waveKey === null) {
      push(
        "CROSS_REF",
        "error",
        [bundle.id],
        `threats.waveTable '${bundle.threats.waveTable}' is not a 'file:' ref (§7.13 authored+seeded tables)`,
        "hosting_game.md §7.13 determinism (R35)",
      );
    } else if (!corpus.waves.has(waveKey)) {
      push(
        "CROSS_REF",
        "warn",
        [bundle.id],
        `waveTable '${waveKey}' not present in the corpus (slice not authored yet?)`,
        "content README (missing wave slice = warning)",
      );
    } else {
      const doc = corpus.waves.get(waveKey);
      for (const issue of inspectWaveTableStructure(doc, waveKey)) {
        push(
          "WAVE_STRUCTURE",
          "error",
          [bundle.id],
          `${issue.ref}: ${issue.shape} — ${issue.detail}`,
          "structural shapes only; §1.7/§2.24 wave laws belong to sim-core src/waves",
        );
      }
      const unclaimed = waveBackLinkFinding(bundle, waveKey, doc);
      if (unclaimed !== null) findings.push(unclaimed);
    }
  }

  return Object.freeze({
    pass: !findings.some((f) => f.severity === "error"),
    findings: Object.freeze(findings),
  });
}

/** Human-readable verdict lines (stable order) for CI logs / orchestrator
 *  reports. Machine consumers read `lintRulesetCorpus` output directly. */
export function formatLintReport(report: LintReport): readonly string[] {
  const lines: string[] = [`lint pass=${report.pass} findings=${report.findings.length}`];
  for (const finding of report.findings) {
    lines.push(
      `  ${finding.severity === "error" ? "x" : "~"} [${finding.code}] ${finding.bundles.join(" ⇄ ")}: ${finding.detail}  (§ ${finding.cite})`,
    );
  }
  return lines;
}
