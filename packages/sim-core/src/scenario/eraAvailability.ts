/** eraAvailability.ts — §0.4 mechanics-on-era pilot (ADR-0019 program 4,
 *  lane L-EM): "Whole branches of the tech tree are greyed out with 'not
 *  invented yet.'" (hosting_game.md §0.4, :656) becomes an ENGINE FACT.
 *
 *  THE COMMISSIONED LEG IS ONLY "available tech" (§0.4 :651-656 changes
 *  costs, available tech, threat sophistication, customer base, palette —
 *  the other legs have NO engine law yet and are RECORD-NOT-BUILD per the
 *  ADR-0019 program-4 commission; §5.6's unlock lattice likewise). The §1.6
 *  Era Track sentence "retires some buildables (your modem bank becomes
 *  scrap)" (:4577) grounds the OBSOLETE leg, which ships as machinery only:
 *  retirement rows are pinned by FORGED fixtures, never by content dates
 *  (R66 — lanes do not forge histories the doc never names).
 *
 *  THE COMPOSITION LAW (mirrors L-PERS's general-gate shape EXACTLY): the
 *  era composes LAST after perspective — freeze tapes → perspective gate →
 *  era gate (runner.ts). As the outer layer the era gate is consulted
 *  FIRST on every entry and DELEGATES for every tech it does not refuse
 *  (`eraVerdict ?? inner?.canExecute?.(q)`), chaining never clobbering. A
 *  refused entry pays NOTHING — canExecute fires after carrier translation
 *  but before hands/attention/handler (L-CE @a828379), so a "not invented
 *  yet" refusal leaves state IDENTITY. A plan that gates nothing grows NO
 *  canExecute key (the zero-ban perspective rule): an era-armed run whose
 *  windows all say "available" produces the pre-era door behavior by
 *  value, so every shipped wire rides byte-stand.
 *
 *  CARRIER LAW DIVERGES FROM PERSPECTIVE ON PURPOSE. A perspective bans
 *  VERBS on the human rail and lets translated rule carriers through (the
 *  Apprentice's author-and-delegate thesis, :1479). The era is not about
 *  WHO acts — the tech does not EXIST: a Book rule cannot place a
 *  cross-connect faucet in a 1998 world either, so the era gate fires on
 *  every carrier. Grounded: §0.4 is a content-grid fact, §1.6 a progression
 *  fact; neither sentence admits an executor exemption.
 *
 *  HOST VOCABULARY (the door mints no code for a general gate — same
 *  posture as perspective-forbids): the refusal reasons are
 *  `era: "<techId>" not available in <YYYY> (available from <YYYY>)` and
 *  `era: "<techId>" obsolete since <YYYY> (retired at era transition)` —
 *  house `code: detail` grammar, deterministic from (row, year). ZERO new
 *  door refusal PHRASES: the census over intent-door.ts stays at 46 UNAIDED.
 *  Policy-card greying rides the door's existing `unknown-card-hash`
 *  grammar (the wrap returns null; no shipped content greys cards yet —
 *  cards carry no tech field, so the map is host-supplied and the machinery
 *  is fixture-pinned).
 *
 *  SHELL ERA ≠ PLAY ERA (conflation guard, pinned by test): apps/proto's
 *  eraState.getEra() is a REACTIVE cosmetic token for chrome (§8.10 skins —
 *  the SHELL's era, flippable mid-session). eraYear here is RUN-FROZEN
 *  world truth supplied by the host at mint — the engine never reads the
 *  shell, never re-derives a calendar (ADR-0018 1a: no engine behavior was
 *  keyed to a rung until this pilot), and eraYearAt(context) is the seam a
 *  future era-TRANSITION mechanic would widen — v0 ignores context and
 *  returns the frozen year.
 *
 *  Import law: ../types.ts (verb identity), ../pipeline/index.ts TYPES only,
 *  ../loader/eras.ts for the SINGLE resolution authority (deviation from the
 *  "type-only vs loader" brief letter, disclosed: composing windows HERE
 *  without resolveTechAvailability would fork the four-status law into a
 *  second authority — disk-wins honesty; bundle.ts itself stays type-only,
 *  so no parser runtime rides scenario).
 */

import { PlayerVerb as Verb } from "../types.ts";
import type { PolicyCard } from "../types.ts";
import type {
  ExecuteQuery,
  ExecuteRejection,
  IntentDoorConfig,
} from "../pipeline/index.ts";
import type { LoadedTypeBundle } from "../loader/bundle.ts";
import { resolveTechAvailability, type TechAvailability } from "../loader/eras.ts";

/** A run-frozen era verdict over ONE type line: the door-side read surface
 *  of the grid. `gate` holds ONLY the techs the era refuses (pre-introduction
 *  or obsolete) — an absent tech is allowed, which is how the undocumented
 *  "neither grant nor deny" law lands at the door. */
export interface EraPlan {
  readonly bundleId: string;
  /** The frozen world year of this run. */
  readonly eraYear: number;
  /** The transition seam (v0 constant): a future §1.6 era-advance mechanic
   *  would read the tick context here; today every query answers eraYear. */
  readonly eraYearAt: (context: unknown) => number;
  /** techId → the refusal-bearing verdict (status ∈ pre-introduction|obsolete). */
  readonly gate: ReadonlyMap<string, TechAvailability>;
  /** Policy-card ids the era greys (host-supplied card→tech map ∩ gate). */
  readonly greyedPolicyCardIds: ReadonlySet<string>;
}

/** The techs a bundle NAMES — the only ids the line's own date may gate.
 *  Restriction law (never-invents): a tech no row and no naming relation
 *  covers is UNDOCUMENTED at the door = allowed, even when the line itself
 *  is pre-introduction — the gate denies only what the line claims. The
 *  naming relation is the bundle's own buildables vocabulary plus the line
 *  name (id tail after ":", e.g. "shared-web" from "official:shared-web" —
 *  the §0.4 exemplar: a 1998 run refuses deviceKind "shared-web" through
 *  the dated line itself, with ZERO availability rows on disk). */
function namedTechs(bundle: LoadedTypeBundle): readonly string[] {
  const line = bundle.id.slice(bundle.id.indexOf(":") + 1);
  const names = new Set<string>([
    line,
    ...bundle.buildables.distinct,
    ...bundle.buildables.nonPhysical,
  ]);
  for (const instance of bundle.buildables.archetypeInstances) {
    names.add(instance.archetype);
    if (instance.skin !== null) names.add(instance.skin);
  }
  for (const techId of Object.keys(bundle.eras.availability)) names.add(techId);
  return [...names].sort();
}

/** Compose the door-side verdicts for one line at one frozen year.
 *  `opts.policyCards` maps a policy-card id to the tech it presumes; a card
 *  whose tech the gate refuses becomes greyed — v0 ships no such content,
 *  hosts pass the map (forged fixtures pin the machinery). */
export function composeEraPlan(
  bundle: LoadedTypeBundle,
  runEraYear: number,
  opts: { readonly policyCards?: ReadonlyMap<string, string> } = {},
): EraPlan {
  const gate = new Map<string, TechAvailability>();
  for (const techId of namedTechs(bundle)) {
    const verdict = resolveTechAvailability(bundle, techId, runEraYear);
    if (verdict.status === "pre-introduction" || verdict.status === "obsolete") gate.set(techId, verdict);
  }
  const greyedPolicyCardIds = new Set<string>();
  if (opts.policyCards !== undefined) {
    for (const [cardId, techId] of opts.policyCards) {
      if (gate.has(techId)) greyedPolicyCardIds.add(cardId);
    }
  }
  return Object.freeze({
    bundleId: bundle.id,
    eraYear: runEraYear,
    eraYearAt: () => runEraYear,
    gate: gate as ReadonlyMap<string, TechAvailability>,
    greyedPolicyCardIds: greyedPolicyCardIds as ReadonlySet<string>,
  });
}

/** The two host phrases (design item 5). Verbatim, deterministic, census
 *  invisible (the door never sees these strings in its own source). */
export function eraRefusalReason(av: TechAvailability): string {
  return av.status === "pre-introduction"
    ? `era: "${av.techId}" not available in ${av.eraYear} (available from ${av.availableFrom})`
    : `era: "${av.techId}" obsolete since ${av.obsoleteBy} (retired at era transition)`;
}

function eraGate(plan: EraPlan, prior: IntentDoorConfig["canExecute"]): (query: ExecuteQuery) => ExecuteRejection | null {
  return (query: ExecuteQuery): ExecuteRejection | null => {
    if (query.verb === Verb.PlaceDevice && plan.gate.size > 0) {
      const deviceKind = (query.args as { readonly deviceKind?: unknown }).deviceKind;
      if (typeof deviceKind === "string") {
        const av = plan.gate.get(deviceKind);
        if (av !== undefined) return Object.freeze({ reason: eraRefusalReason(av) });
      }
    }
    return prior ? prior(query) : null;
  };
}

function eraCardLookup(
  plan: EraPlan,
  prior: NonNullable<IntentDoorConfig["lookupPolicyCard"]>,
): (cardHash: string) => PolicyCard | null {
  return (cardHash: string): PolicyCard | null => {
    const card = prior(cardHash);
    if (card !== undefined && card !== null && plan.greyedPolicyCardIds.has(card.id)) return null;
    // undefined (host "not found") normalizes to null — the door's own
    // unknown-card-hash grammar treats both alike, so the passthrough is
    // semantically invisible and the seam stays total.
    return card ?? null;
  };
}

/** The freeze/perspective composition pattern, one rung further: an unarmed
 *  (zero-gate, zero-grey) plan returns a structurally identical frozen
 *  clone — no canExecute, no lookupPolicyCard key grown; untouched config
 *  fields ride the spread verbatim. */
export function applyEraAvailabilityToDoorConfig(config: IntentDoorConfig, plan: EraPlan): IntentDoorConfig {
  const gates = plan.gate.size > 0;
  const greysCards = plan.greyedPolicyCardIds.size > 0 && config.lookupPolicyCard !== undefined;
  return Object.freeze({
    ...config,
    ...(gates ? { canExecute: eraGate(plan, config.canExecute) } : {}),
    ...(greysCards ? { lookupPolicyCard: eraCardLookup(plan, config.lookupPolicyCard as NonNullable<IntentDoorConfig["lookupPolicyCard"]>) } : {}),
  });
}
