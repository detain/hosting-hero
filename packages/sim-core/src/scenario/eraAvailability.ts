/** eraAvailability.ts — §0.4 mechanics-on-era pilot (ADR-0019 program 4,
 *  lane L-EM): "Whole branches of the tech tree are greyed out with 'not
 *  invented yet.'" (hosting_game.md §0.4, :656) becomes an ENGINE FACT.
 *
 *  THE COMMISSIONED LEG IS ONLY "available tech" (§0.4 :651-656 changes
 *  costs, available tech, threat sophistication, customer base, palette —
 *  the other legs have NO engine law yet and are RECORD-NOT-BUILD per the
 *  ADR-0019 program 4 commission; §5.6's unlock lattice likewise). The §1.6
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
 *  ERA TRANSITIONS (L-ER-T, wave-26 owner ruling): the pilot's named future
 *  seam is BUILT. A host may arm `transitions` — an ascending list of
 *  {atBusinessMinute, eraYear} steps beside the opening `runEraYear` — and
 *  `eraYearAt(context)` becomes a STEP FUNCTION over the sim business clock:
 *  pure floor division of `context.clocks.businessUs` by the µs-per-minute
 *  constant (the shieldBusinessMinuteOf law at pipeline/corruption.ts:81,
 *  replicated as a scenario-local private twin per the twin-name law —
 *  scenario's import discipline keeps pipeline type-only), minute EXACTLY on
 *  a step lands in the NEW year (inclusive), one minute before stays in the
 *  old. NO wall clock, NO GameState read, NO digest input: the step lives
 *  inside the door-config closure, consulted per intent with the as-of year,
 *  so a tech introduced mid-run flips refused→allowed WITHOUT any state
 *  change, and a retired tech flips the other way. Absent (or empty) steps
 *  keep `eraYearAt` the EXACT run-frozen constant — every shipped era arm
 *  byte-stands, digest-pinned against the pre-transition tree. Card greying
 *  is the honest exception and stays OPENING-year frozen: the door's
 *  lookupPolicyCard seam carries no context (its signature is a bare
 *  cardHash), and the door is out of scope — a stepping plan greys cards by
 *  the year it OPENS in, pinned, never silently per-year.
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
 *  the SHELL's era, flippable mid-session). eraYear here is RUN-SCOPED
 *  world truth supplied by the host at mint — the engine never reads the
 *  shell; with transitions armed the year STEPS on the engine's own business
 *  clock (deterministic from the run), never on a wall, a shell, or an
 *  injected mutable (ADR-0018 1a: this pilot + its transition seam remain
 *  the only engine behavior keyed to a rung).
 *
 *  Import law: ../types.ts (verb identity), ../pipeline/index.ts TYPES only,
 *  ../loader/eras.ts for the SINGLE resolution authority (deviation from the
 *  "type-only vs loader" brief letter, disclosed: composing windows HERE
 *  without resolveTechAvailability would fork the four-status law into a
 *  second authority — disk-wins honesty; bundle.ts itself stays type-only,
 *  so no parser runtime rides scenario).
 */

import { PlayerVerb as Verb } from "../types.ts";
import type { ClockState, PolicyCard } from "../types.ts";
import type {
  ExecuteQuery,
  ExecuteRejection,
  IntentDoorConfig,
} from "../pipeline/index.ts";
import type { LoadedTypeBundle } from "../loader/bundle.ts";
import { resolveTechAvailability, type TechAvailability } from "../loader/eras.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";

/** One era-TRANSITION step (L-ER-T): FROM business minute `atBusinessMinute`
 *  (inclusive — a query landing exactly on the step reads the NEW year) the
 *  world year becomes `eraYear`. The opening `runEraYear` owns minute 0:
 *  steps must be strictly ascending and `atBusinessMinute > 0`, walls pinned
 *  in `parseEraTransitions`. A step may name the year it already lives in
 *  (no-op echo) — the law is the calendar, not an authoring game. */
export interface EraTransition {
  readonly atBusinessMinute: number;
  readonly eraYear: number;
}

/** The door's own business-minute law (pipeline/corruption.ts
 *  shieldBusinessMinuteOf, :81) as a scenario-local PRIVATE TWIN: the
 *  twin-name precedent is corruption.ts's own docblock (economy/state.ts
 *  keeps a twin for the same import-direction reason), and eraAvailability's
 *  header law keeps pipeline type-only — importing the shield-named runtime
 *  helper here would fork the file's discipline AND borrow a door book's
 *  identity. Same floor division, same safe-integer guard, same failure to
 *  invent a clock. */
function eraBusinessMinuteOf(context: unknown): number {
  const clocks = (context as { readonly clocks?: ClockState } | null | undefined)?.clocks;
  if (clocks === undefined) {
    throw new Error(
      "scenario[BAD_ERA] at 'eraYearAt': a transitioning era plan reads context.clocks.businessUs — the query context carried no clocks",
    );
  }
  const minute = Number(clocks.businessUs / MICROS_PER_MIN);
  if (!Number.isSafeInteger(minute)) {
    throw new RangeError(
      `scenario[BAD_ERA] at 'eraYearAt': business minute from ${String(clocks.businessUs)}µs exceeds the safe-integer range`,
    );
  }
  return minute;
}

/** The no-transition sentinel — the pilot path shares ONE frozen empty list
 *  (a stepping plan's parsed list is freshly frozen per compose). */
const EMPTY_TRANSITIONS: readonly EraTransition[] = Object.freeze([]);

/** Boundary-parse the host's step list (fail loud, name the position).
 *  Returns a frozen ascending list; the EMPTY list is legal and means
 *  "no transitions" — byte-ident to the run-frozen pilot, never a
 *  half-armed calendar. Values are safe integers ≥ 0 (`atBusinessMinute`
 *  STRICTLY > 0 — the opening eraYear owns minute 0; a step at 0 would
 *  silently override it and is refused by name). */
function parseEraTransitions(transitions: readonly unknown[]): readonly EraTransition[] {
  const parsed: EraTransition[] = [];
  let previous = 0;
  for (const [index, entry] of transitions.entries()) {
    const at = `eraTransition[${String(index)}]`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(
        `scenario[BAD_ERA] at '${at}': expected {atBusinessMinute, eraYear}, got ${String(entry)}`,
      );
    }
    const row = entry as { readonly atBusinessMinute?: unknown; readonly eraYear?: unknown };
    const minute = row.atBusinessMinute;
    if (typeof minute !== "number" || !Number.isSafeInteger(minute)) {
      throw new Error(`scenario[BAD_INT] at '${at}.atBusinessMinute': expected a safe integer, got ${String(minute)}`);
    }
    if (minute <= 0) {
      throw new Error(
        `scenario[BAD_ERA] at '${at}.atBusinessMinute': the opening eraYear owns minute 0 — a step must land STRICTLY after it, got ${String(minute)}`,
      );
    }
    if (minute <= previous) {
      throw new Error(
        `scenario[BAD_ERA] at '${at}.atBusinessMinute': steps ascend STRICTLY — expected > ${String(previous)} (the previous step or the opening floor), got ${String(minute)}`,
      );
    }
    const year = row.eraYear;
    if (typeof year !== "number" || !Number.isSafeInteger(year) || year < 0) {
      throw new Error(`scenario[BAD_INT] at '${at}.eraYear': expected a safe integer ≥ 0, got ${String(year)}`);
    }
    parsed.push(Object.freeze({ atBusinessMinute: minute, eraYear: year }));
    previous = minute;
  }
  return Object.freeze(parsed);
}

/** A run-scoped era verdict over ONE type line: the door-side read surface
 *  of the grid. `gate` holds ONLY the techs the era refuses (pre-introduction
 *  or obsolete) — an absent tech is allowed, which is how the undocumented
 *  "neither grant nor deny" law lands at the door. With transitions armed
 *  the refusals are YEAR-SPECIFIC: `gatesByYear` carries one map per
 *  composed year (opening + every step's eraYear), `gate` is the OPENING
 *  year's entry, and the door consults `gatesByYear.get(eraYearAt(ctx))`
 *  per intent. */
export interface EraPlan {
  readonly bundleId: string;
  /** The RUN-FROZEN opening world year (owns business minute 0). */
  readonly eraYear: number;
  /** The transition steps, frozen and ascending (parsed at compose);
   *  EMPTY means the run-frozen pilot — `eraYearAt` never reads context. */
  readonly transitions: readonly EraTransition[];
  /** The transition seam, BUILT (L-ER-T): constant `eraYear` when no steps
   *  are armed (EXACT pilot behavior, context ignored); with steps, a pure
   *  STEP FUNCTION of `context.clocks.businessUs` (floor division — the
   *  door-book minute law, twin-pinned): minute exactly on a step reads the
   *  step's year (inclusive), the minute before reads the prior one. */
  readonly eraYearAt: (context: unknown) => number;
  /** techId → the OPENING-year refusal-bearing verdict (status ∈
   *  pre-introduction|obsolete) — equal to `gatesByYear.get(eraYear)`. */
  readonly gate: ReadonlyMap<string, TechAvailability>;
  /** year → that year's refusal map, composed at mint for exactly the
   *  calendar's years (opening ∪ step eraYears). `eraYearAt` can only name
   *  a composed year; an unknown year at the gate is a bug and throws. */
  readonly gatesByYear: ReadonlyMap<number, ReadonlyMap<string, TechAvailability>>;
  /** True when SOME composed year refuses at least one tech — the honest
   *  generalization of the zero-gate rule: a plan whose opening year is all
   *  available but whose LAST year retires a tech still gates (the flip
   *  direction must be armed from t0; growing canExecute mid-run would be a
   *  state event the door does not have). A plan gating NO year grows no
   *  canExecute key, exactly as the pilot. */
  readonly gatesAnyYear: boolean;
  /** Policy-card ids the era greys (host-supplied card→tech map ∩ gate).
   *  OPENING-year frozen under transitions — the door's lookupPolicyCard
   *  seam carries no context (bare cardHash), and the door is out of scope:
   *  pinned, documented, never silently per-year. */
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

/** Compose the door-side verdicts for one line over the calendar the host
 *  arms: one frozen OPENING year, optionally stepped at business minutes by
 *  `opts.transitions` (boundary-parsed HERE — this module is the authority
 *  both the scenario runner and tools/host ride). Every distinct year of the
 *  calendar gets its refusal map composed at mint; a query resolves its
 *  year through `eraYearAt` and reads that map — pure over the run's clock.
 *  `opts.policyCards` maps a policy-card id to the tech it presumes; a card
 *  whose OPENING-year tech the gate refuses becomes greyed — v0 ships no
 *  such content, hosts pass the map (forged fixtures pin the machinery);
 *  greying never steps (the lookup seam has no context — EraPlan docblock). */
export function composeEraPlan(
  bundle: LoadedTypeBundle,
  runEraYear: number,
  opts: {
    readonly policyCards?: ReadonlyMap<string, string>;
    readonly transitions?: readonly EraTransition[];
  } = {},
): EraPlan {
  const transitions = opts.transitions === undefined ? EMPTY_TRANSITIONS : parseEraTransitions(opts.transitions);
  const techs = namedTechs(bundle);
  const gatesByYear = new Map<number, ReadonlyMap<string, TechAvailability>>();
  for (const year of [runEraYear, ...transitions.map((step) => step.eraYear)]) {
    if (gatesByYear.has(year)) continue;
    const gate = new Map<string, TechAvailability>();
    for (const techId of techs) {
      const verdict = resolveTechAvailability(bundle, techId, year);
      if (verdict.status === "pre-introduction" || verdict.status === "obsolete") gate.set(techId, verdict);
    }
    gatesByYear.set(year, gate as ReadonlyMap<string, TechAvailability>);
  }
  const gate = gatesByYear.get(runEraYear) as ReadonlyMap<string, TechAvailability>;
  let gatesAnyYear = false;
  for (const yearGate of gatesByYear.values()) {
    if (yearGate.size > 0) {
      gatesAnyYear = true;
      break;
    }
  }
  const greyedPolicyCardIds = new Set<string>();
  if (opts.policyCards !== undefined) {
    for (const [cardId, techId] of opts.policyCards) {
      if (gate.has(techId)) greyedPolicyCardIds.add(cardId);
    }
  }
  const eraYearAt: (context: unknown) => number =
    transitions.length === 0
      ? () => runEraYear // the pilot path, byte-stand: context is NEVER read.
      : (context: unknown): number => {
          const minute = eraBusinessMinuteOf(context);
          let year = runEraYear;
          for (const step of transitions) {
            if (minute < step.atBusinessMinute) break;
            year = step.eraYear;
          }
          return year;
        };
  return Object.freeze({
    bundleId: bundle.id,
    eraYear: runEraYear,
    transitions,
    eraYearAt,
    gate,
    gatesByYear: gatesByYear as ReadonlyMap<number, ReadonlyMap<string, TechAvailability>>,
    gatesAnyYear,
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
    if (query.verb === Verb.PlaceDevice && plan.gatesAnyYear) {
      const deviceKind = (query.args as { readonly deviceKind?: unknown }).deviceKind;
      if (typeof deviceKind === "string") {
        // THE transition seam at work: the verdict is resolved AS OF this
        // query's business minute — pure over the injected context, no
        // state, no wall, no extra dice. A constant plan answers eraYear
        // without reading the context at all (the pilot path).
        const year = plan.eraYearAt(query.context);
        const yearGate = plan.gatesByYear.get(year);
        if (yearGate === undefined) {
          throw new Error(
            `scenario[BAD_ERA] at 'eraGate': eraYearAt answered ${String(year)} — a year composeEraPlan never gated (plan years: ${[...plan.gatesByYear.keys()].join(", ")})`,
          );
        }
        const av = yearGate.get(deviceKind);
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
 *  (gates-NO-year, zero-grey) plan returns a structurally identical frozen
 *  clone — no canExecute, no lookupPolicyCard key grown; untouched config
 *  fields ride the spread verbatim. A STEPPING plan is armed from t0 even if
 *  its opening gate is empty (the retirement flip must exist before it
 *  happens — EraPlan.gatesAnyYear). */
export function applyEraAvailabilityToDoorConfig(config: IntentDoorConfig, plan: EraPlan): IntentDoorConfig {
  const gates = plan.gatesAnyYear;
  const greysCards = plan.greyedPolicyCardIds.size > 0 && config.lookupPolicyCard !== undefined;
  return Object.freeze({
    ...config,
    ...(gates ? { canExecute: eraGate(plan, config.canExecute) } : {}),
    ...(greysCards ? { lookupPolicyCard: eraCardLookup(plan, config.lookupPolicyCard as NonNullable<IntentDoorConfig["lookupPolicyCard"]>) } : {}),
  });
}
