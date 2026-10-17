/**
 * versus/affixes.ts — the §2.13 affix MIX-INS made mechanical (I-P V-2,
 * owner ruling 2026-10-17: "max features"). Until now an affix rode the
 * wire, moved the draft cost, and changed nothing in the sim — this table
 * is the single authority for what each of the sixteen slugs DOES to a
 * converted wave.
 *
 * Shape of the law: an `AffixWaveDelta` is a pure DATA record. The
 * converter (match.ts deckToWaveTable) reads it AFTER binning and applies
 * it INLINE on entries and FOLDED per wave. No delta here touches parPct,
 * entry counts, denominations, or role anchors — the enforceWaveTable legs
 * stay structurally unreachable by affixes, so the self-check remains a
 * backstop, never an affix casualty. If a delta-composed table breaches a
 * waves/parse DOOR (storm ceiling, share sum, window sum), the parse Error
 * PROPAGATES UNCHANGED — an affix that breaks the cap is refused exactly
 * like an authored wave that breaks the cap (D-7 law, ADR-0013 #6).
 *
 * Byte-identity discipline: a deck with NO affixes, or one whose affixes
 * are `live: false`, produces a table identical field-for-field to the
 * pre-V-2 converter. The fold helpers below are inert when their
 * contributor lists are empty, and wave-level `feint`/`secondIncident`
 * keys (and the `rules` block) are OMITTED — not set false — when no flag
 * is raised, so `JSON.stringify` of a no-affix table is byte-stable.
 *
 * Import rule: ../waves/bands + ../waves/table types + ./deck types only.
 */
import type { TelegraphBand } from "../waves/bands.ts";
import type { ThreatAffix } from "./deck.ts";

/**
 * What one §2.13 slug does to the waves that carry it. Every optional
 * field is a CONTRIBUTOR to a per-wave fold (see the fold laws at the
 * bottom of this file); absence means the slug does not touch that leg.
 */
export interface AffixWaveDelta {
  /** false = data-only: rides the wire, pays the cost premium, changes
   *  NOTHING in the sim (slug 12 — see its table row for the reason and
   *  the future-consumer spec). */
  readonly live: boolean;
  /** Wave window scaled by this percent, floor-rounded, per contributor
   *  in slot order, then clamped to [1, 96] minutes. */
  readonly windowScalePct?: number;
  /** [ramp, plateau, decay] share of the effective window (normalized to
   *  their own sum). Collision fold: element-wise MAX, remainder → plateau. */
  readonly shapePermille?: readonly [number, number, number];
  /** Entry-level band override — one affix per entry, so overrides never
   *  collide with each other inside an entry. */
  readonly bandOverride?: TelegraphBand;
  /** Entry-level targets fold: "all" = the full committed targets pool,
   *  "first" = the head of that pool. With the default one-target pool
   *  both folds are structurally inert (which is why the V1 goldens held). */
  readonly targetsOverride?: "all" | "first";
  /** Entry-level share := max(5, floor(ladder × this pct / 100)); the
   *  surplus is renormalized +1-per-point to the NON-cut entries in
   *  code-unit threatId order, Σ100 preserved. All-cut waves stay inert. */
  readonly shareCutPct?: number;
  /** Wave-level flag: authors `secondIncident: true` and (iff raised)
   *  the table `rules` follow-on multipliers. */
  readonly setsSecondIncident?: boolean;
  /** Wave-level flag: authors `feint: true` and (iff raised) the table
   *  `rules.feints` block. Subject to the deck feint-budget law —
   *  see deck.ts feintBudgetViolations. */
  readonly setsFeint?: boolean;
}

/** The ratified §4.13 audit-fix-4 follow-on multipliers the pipeline
 *  already consumes for the SHIPPED slices (ADR-0015 #1 ratification
 *  sweep, 2026-10-16): ×1.8 during the incident window, ×2.5 during
 *  recovery. The persistent mix-in authors the SAME numbers — versus
 *  reuses the singleplayer law, it does not invent a parallel taste.
 *  INTEGER per-mille homes (canary forbids float literals in engine
 *  source); the IEEE division 1800/1000 rounds to exactly the double
 *  the wire literal `1.8` parses to — values are byte-ident, the table
 *  field type is a plain number (waves/table.ts parse door: finite > 1). */
const SI_PER_MILLE_INCIDENT = 1_800;
const SI_PER_MILLE_RECOVERY = 2_500;

export const VERSUS_AFFIX_SI_MULTIPLIERS = Object.freeze({
  secondIncidentMultiplierDuringIncident: SI_PER_MILLE_INCIDENT / 1_000,
  secondIncidentMultiplierDuringRecovery: SI_PER_MILLE_RECOVERY / 1_000,
});

/** The rules block the two-stage feint authors. `maxPerLevel: 1` +
 *  `neverTwoLevelsInRow: true` together with the deck feint-budget law
 *  (deck.ts) keep the waves/parse adjacency door unreachable by a legal
 *  versus deck: one decoy per wave, never two waves in a row. */
export const VERSUS_AFFIX_FEINT_RULES = Object.freeze({
  maxPerLevel: 1,
  neverTwoLevelsInRow: true,
  namedInPostmortem: true,
});

/** The storm stack factor the SI follow-on carries (waves/storm.ts
 *  stormStackFactorMicro(2.5) = 1.5e6): the plan door scales a flagged
 *  wave's budget to floor(1024 × 1e6 / 1.5e6) = 682 units, so a body
 *  ≤682/min is the storm-safe envelope for a persistent wave. */
export const VERSUS_AFFIX_SI_STACK_FACTOR_MICRO = 1_500_000;

/**
 * The 16-slug conversion table (I-P V-2 spec, verbatim per-slug). Order
 * mirrors §2.13 / AFFIX_VOCABULARY. Every row's comment is the record of
 * what the doc promises vs. what v0 delivers — the gap-notes are honest
 * approximations, each one also listed in the lane report.
 */
export const AFFIX_WAVE_DELTAS: Readonly<Record<ThreatAffix, AffixWaveDelta>> = Object.freeze({
  /* 1 — "1/10th rate, 10× duration". v0 approximates as window ×2: */
  "low-slow": Object.freeze({
    live: true,
    windowScalePct: 200,
  }),
  /* 2 — hits every target at once: full pool per entry. */
  "distributed": Object.freeze({
    live: true,
    targetsOverride: "all",
  }),
  /* 3 — invisible until it lands: hunter band. */
  "encrypted": Object.freeze({
    live: true,
    bandOverride: "hunter",
  }),
  /* 4 — reshapes as you adapt: entropy band (the director's
   *  entropyBudgetFactor then scales its count at plan time). */
  "adaptive": Object.freeze({
    live: true,
    bandOverride: "entropy",
  }),
  /* 5 — arrives at a set hour: tail-lean profile (92/4/4). */
  "timed": Object.freeze({
    live: true,
    shapePermille: [92, 4, 4] as const,
  }),
  /* 6 — rides another event's coattails: weather band, mid-heaviest. */
  "piggyback": Object.freeze({
    live: true,
    bandOverride: "weather",
    shapePermille: [17, 66, 17] as const,
  }),
  /* 7 — copies your defenses onto everyone: weather band, full pool.
   *  Distinct tuple from piggyback (targets vs shape differ). */
  "mimic": Object.freeze({
    live: true,
    bandOverride: "weather",
    targetsOverride: "all",
  }),
  /* 8 — won't go away: authors the wave's secondIncident leg; the
   *  converter also authors rules{1.8, 2.5} (ratified singleplayer
   *  numbers — ADR-0015 #1). Storm stack 1.5e6 prices body ≤682/min. */
  "persistent": Object.freeze({
    live: true,
    setsSecondIncident: true,
  }),
  /* 9 — "only when staff are asleep": same tail-lean fold as timed.
   *  The staff-roster half is §4.7 unbuilt (gap-note, report). */
  "off-hours-only": Object.freeze({
    live: true,
    shapePermille: [92, 4, 4] as const,
  }),
  /* 10 — starts small, grows: pure rising ramp (100/0/0). */
  "ramped": Object.freeze({
    live: true,
    shapePermille: [100, 0, 0] as const,
  }),
  /* 11 — one customer's private hell: head of the targets pool.
   *  The Designator law (per-customer identity) is unbuilt (gap-note). */
  "targeted-at-one-customer": Object.freeze({
    live: true,
    targetsOverride: "first",
  }),
  /* 12 — DATA-ONLY. DefenderCommit carries no maintenance-window/SLA-
   *  suspension input, and a wave table cannot express per-entry minute
   *  offsets (one window per wave is the grammar). v0: rides the wire,
   *  pays the 2.0× cost premium, converts as plain. Future consumer
   *  spec: a DefenderCommit.maintenanceWindows input gating service-time
   *  credits for the flagged entries' waves — needs its own ADR item. */
  "piggybacked-on-a-maintenance-window": Object.freeze({
    live: false,
  }),
  /* 13 — decoy then real: wave feint flag + rules.feints block; the
   *  deck feint-budget law (deck.ts) refuses two of these on DIFFERENT
   *  waves (same-wave pair legal — one flag). */
  "two-stage": Object.freeze({
    live: true,
    setsFeint: true,
  }),
  /* 14 — proportion shifts with load: entry share := max(5, 75% of the
   *  ladder), surplus renormalized to the non-cut entries. The load-
   *  feedback half (true threshold readback) is unbuilt (gap-note). */
  "rate-shaped": Object.freeze({
    live: true,
    shareCutPct: 75,
  }),
  /* 15 — follows the business day: bell shape 25/50/25. The peak-
   *  tracking half (reading the observed diurnal curve) is unbuilt
   *  (gap-note). */
  "diurnal": Object.freeze({
    live: true,
    shapePermille: [25, 50, 25] as const,
  }),
  /* 16 — shorter, sharper: window ×50 (the rate doubles because the
   *  wave's unit mass arrives in half the minutes; Σ-counts unchanged,
   *  storm-safe). */
  "bounded": Object.freeze({
    live: true,
    windowScalePct: 50,
  }),
});

/* ═══════════════════════════ fold laws (internal home) ═══════════════════════════
 * Exported for ./match.ts and the versus tests (../affixes direct import,
 * barrel-invisible — same discipline as pipeline/internal.ts). All four
 * are PURE and INERT-WHEN-EMPTY: empty contributor lists reproduce the
 * inputs exactly, which is what makes a no-affix table byte-identical.
 */

/** Window clamp ceiling: 8 waves × the 12-minute default = the whole
 *  baseline horizon; a floor of 1 keeps every fold parse-legal. */
export const AFFIX_WINDOW_CLAMP_MIN = 1;
export const AFFIX_WINDOW_CLAMP_MAX = 96;

/** Multiply-fold: each contributor scales the running window by
 *  floor(window × pct / 100), in slot order (deterministic), then the
 *  result is clamped to [1, 96]. Empty list ⇒ identity. */
export function foldWindowMinutes(baseMinutes: number, scalePcts: readonly number[]): number {
  let window = baseMinutes;
  for (const pct of scalePcts) {
    window = Math.floor((window * pct) / 100);
  }
  return Math.min(AFFIX_WINDOW_CLAMP_MAX, Math.max(AFFIX_WINDOW_CLAMP_MIN, window));
}

/** MAX-fold: element-wise maximum across contributor triples.
 *  Empty list ⇒ null (no shape contributor). */
export function foldShapePermille(
  shapes: readonly (readonly [number, number, number])[],
): readonly [number, number, number] | null {
  if (shapes.length === 0) return null;
  const [a0, a1, a2] = shapes[0] as readonly [number, number, number];
  let t0 = a0;
  let t1 = a1;
  let t2 = a2;
  for (let i = 1; i < shapes.length; i += 1) {
    const shape = shapes[i] as readonly [number, number, number];
    if (shape[0] > t0) t0 = shape[0];
    if (shape[1] > t1) t1 = shape[1];
    if (shape[2] > t2) t2 = shape[2];
  }
  return Object.freeze([t0, t1, t2] as const);
}

/** Normalize a folded triple onto the effective window:
 *  ramp = floor(w × t0 / Σt), decay = floor(w × t2 / Σt),
 *  plateau = w − ramp − decay (the integer remainder goes to plateau).
 *  Σt ≤ 0 ⇒ null (degenerate contributor lists cannot shape a wave). */
export function applyShapeToWindow(
  windowMinutes: number,
  shape: readonly [number, number, number],
): { readonly rampMin: number; readonly plateauMin: number; readonly decayMin: number } | null {
  const total = shape[0] + shape[1] + shape[2];
  if (total <= 0) return null;
  const rampMin = Math.floor((windowMinutes * shape[0]) / total);
  const decayMin = Math.floor((windowMinutes * shape[2]) / total);
  return Object.freeze({ rampMin, plateauMin: windowMinutes - rampMin - decayMin, decayMin });
}

/** Share-cut fold: cut entries get max(5, floor(share × cutPct / 100));
 *  the surplus is handed out +1-per-point to the NON-cut entries in
 *  code-unit threatId order, cycling until exhausted — Σ preserved.
 *  If every entry is cut (nothing can receive the surplus) the fold is
 *  INERT and returns the input. Empty cutMask ⇒ identity. */
export function applyShareCuts(
  shares: readonly number[],
  threatIds: readonly string[],
  cutMask: readonly boolean[],
  cutPct: number,
): readonly number[] {
  if (cutMask.every((cut) => !cut)) return shares;
  const recipientOrder = threatIds
    .map((threatId, index) => ({ threatId, index }))
    .filter((cell) => !cutMask[cell.index])
    .sort((a, b) => (a.threatId < b.threatId ? -1 : a.threatId > b.threatId ? 1 : a.index - b.index));
  if (recipientOrder.length === 0) {
    // All-cut wave: the surplus has nowhere lawful to go (Σ100 is a parse
    // door), so the INERT law returns the untouched ladder.
    return shares;
  }
  const result = shares.slice();
  let surplus = 0;
  for (let i = 0; i < result.length; i += 1) {
    if (!cutMask[i]) continue;
    const cut = Math.max(5, Math.floor((result[i] as number) * cutPct / 100));
    surplus += (result[i] as number) - cut;
    result[i] = cut;
  }
  if (surplus === 0) {
    return Object.freeze(result);
  }
  for (let point = 0; point < surplus; point += 1) {
    const recipient = recipientOrder[point % recipientOrder.length] as { index: number };
    result[recipient.index] = (result[recipient.index] as number) + 1;
  }
  return Object.freeze(result);
}
