/** perspective.ts — §1.2 perspective levels v0: the Invariant-Core filter
 *  composed from seams the engine ALREADY has.
 *
 *  The law, verbatim from hosting_game.md:1202-1203:
 *  "A perspective level may change **which of the six verbs dominates** and
 *  **what you can see** — and nothing else."
 *
 *  That sentence is a COMPOSITION contract, not a new engine. Every mechanic
 *  here rides an existing seam — the Change Freeze (rung 8) is the direct
 *  precedent: `limits.freeze` wires the door's EXISTING host validators with
 *  zero new authority, and an unarmed doc never grows a key. A perspective
 *  is the same trick made data:
 *  - "which verbs dominate"  → refusal tapes hung on the validator-covered
 *    door seams (canPlaceDevice / canAdjustPrice / canSellOffer /
 *    canNegotiateTerms), the policy-book strip (lookupPolicyCard → () =>
 *    null, the door's own `unknown-card-hash` grammar), a handCapacity
 *    override at the mint, and an attention tax on existing verbs.
 *  - "what you can see"      → a pure sight filter over ScopedReadView-shaped
 *    cell maps (observed/view.ts key grammar `entity::property`). Seeing is
 *    NOT being: the projection never touches the simulation — hide changes
 *    what a report SHOWS, never what the engine FOLDS (pinned by the
 *    whole-truth test: same seed, hidden and unhid runs fold identical
 *    observations).
 *  - goal inversion          → doc DATA. `Red Team Friday` is "the same six
 *    verbs with the goal node inverted" (:1209): the row ships metadata only
 *    and an author re-authors objectives around it (test-demonstrated).
 *
 *  THE HONEST CEILING (pinned by PERSPECTIVE_EXPRESSIBILITY): only FIVE of
 *  the nineteen door verbs have a host seam a perspective can tape today.
 *  connect-ports, configure-node, disconnect-drain, shed-load, toggle-speed
 *  and the whole tier-extension set have NO validator — banning them needs a
 *  `canExecute` door hook, which is a FLAGGED OWNER WALL (ADR-0018 remit),
 *  not this lane's to build. Rows record the doc-wish in comments; the
 *  census table states what v0 can actually express, verb by verb.
 *
 *  Zero GameState/ digest changes. Zero new door refusal PHRASES (the tape
 *  supplies a host reason string through the door's existing prefixed
 *  grammar). Import law: ../types.ts + ../pipeline/index.ts TYPES only —
 *  this module is pure data and pure functions, no engine imports beyond
 *  the door's config surface.
 */

import type { ObservedKey, PlayerVerb } from "../types.ts";
import { PLAYER_VERBS, PlayerVerb as Verb } from "../types.ts";
import type {
  AdjustPriceQuery,
  IntentDoorConfig,
  NegotiateQuery,
  PlaceDeviceQuery,
  SellOfferQuery,
} from "../pipeline/index.ts";

/* ─────────────────────────── the sight grammar ─────────────────────────── */

/** The cell-key split (types.ts:185-189 `observedKey` law): every observed
 *  cell key is `${entityId}::${property}`. Split on the FIRST separator —
 *  entity ids themselves never contain "::". */
function splitCellKey(key: string): { entity: string; property: string } {
  const at = key.indexOf("::");
  return at < 0
    ? { entity: key, property: "" }
    : { entity: key.slice(0, at), property: key.slice(at + 2) };
}

function startsWithAny(haystack: string, prefixes: readonly string[]): boolean {
  for (const prefix of prefixes) {
    if (haystack.startsWith(prefix)) return true;
  }
  return false;
}

/** The v0 sight law (closed, string-only, no globs beyond the `"*"` word):
 *  an entry is matched as a prefix of EITHER the whole key (so a namespace
 *  entry like `"company::"` or `"node/"` lands on the entity side) OR the
 *  property segment (so a denomination entry like `"queue"` reveals
 *  `queueDepth` on any entity). A cell is HIDDEN when `"*"` is in the hide
 *  list or any hide entry matches — UNLESS a show entry (the exemption list
 *  that makes "everything but tickets" expressible) matches the same way. */
export function isCellHidden(key: ObservedKey, hide: readonly string[], show: readonly string[]): boolean {
  const { property } = splitCellKey(key);
  const hidden = hide.includes("*") || startsWithAny(key, hide) || startsWithAny(property, hide);
  if (!hidden) return false;
  return !(startsWithAny(key, show) || startsWithAny(property, show));
}

/** Project a ScopedReadView-shaped cell map (observed/view.ts contract,
 *  taken structurally — scenario never imports the store) through a
 *  perspective's sight. Pure: input untouched, outputs sorted code-unit.
 *  This is a PRESENTATION projection: it answers "what would this seat see
 *  hidden?", and nothing in the sim consumes its result. */
export interface PerspectiveViewProjection {
  /** Keys the seat may read, sorted by code-unit. */
  readonly visibleKeys: readonly string[];
  /** Keys the sight filters out, sorted by code-unit. */
  readonly hiddenKeys: readonly string[];
}

export function projectPerspectiveView(
  view: ReadonlyMap<ObservedKey, unknown>,
  hide: readonly string[],
  show: readonly string[],
): PerspectiveViewProjection {
  const visible: string[] = [];
  const hidden: string[] = [];
  for (const key of view.keys()) {
    (isCellHidden(key, hide, show) ? hidden : visible).push(key);
  }
  visible.sort();
  hidden.sort();
  return Object.freeze({
    visibleKeys: Object.freeze(visible),
    hiddenKeys: Object.freeze(hidden),
  });
}

/* ─────────────────────────── the verb ceiling ─────────────────────────── */

/** The validator-covered set: the ONLY verbs a perspective can ban in v0.
 *  Four ride host-rejection validators (the tape answer is unconditional);
 *  policy-card-commit rides a fifth mechanism — stripping the card lookup
 *  makes every commit refuse (the door's `unknown-card-hash` grammar). */
export const PERSPECTIVE_BANNABLE_VERBS: readonly PlayerVerb[] = Object.freeze([
  Verb.PlaceDevice,
  Verb.PolicyCardCommit,
  Verb.AdjustPrice,
  Verb.SellOffer,
  Verb.NegotiateTerms,
] as const);

/** What the expressibility census can say about one verb under one row.
 *  - "banned":             a tape lands — the door refuses the fed intent.
 *  - "allowed":            the verb stays playable (and v0 COULD have
 *                          banned it — the row simply doesn't).
 *  - "not-coverable-v0":   NO seam exists to ban this verb; whichever way
 *                          the card's verb-dominance reads, v0 cannot act
 *                          on it. This is the owner-wall column. */
export type PerspectiveVerbFate = "banned" | "allowed" | "not-coverable-v0";

/* ─────────────────────────── the roster ─────────────────────────── */

/** One §1.2 perspective row. Every field is pure data; the composition
 *  functions below are the only consumers besides hosts reading the table. */
export interface PerspectiveSpec {
  /** Slug id, the wire value on a scenario doc's `perspective.id`. */
  readonly id: string;
  /** The doc's name for the level, kept close to the anchor line. */
  readonly name: string;
  /** Informational hosting_game.md line (never load-bearing, house law). */
  readonly specLine: number;
  /** Sight: hide prefixes (`"*"` = everything) — see the sight grammar. */
  readonly hide: readonly string[];
  /** Sight: exemptions that survive `hide` (the "everything but" list). */
  readonly show: readonly string[];
  /** Dominance: verbs to tape off. Every entry MUST be inside
   *  PERSPECTIVE_BANNABLE_VERBS — the module asserts it at init, so a
   *  future row that wishes an uncoverable ban fails loud HERE, not quiet
   *  at the door. */
  readonly refuse: { readonly verbs: readonly PlayerVerb[] };
  /** Dominance pressure: the mint's hand capacity while seated here
   *  (NOC Shift's "you have three hands", :1266). Hosts mint hands from
   *  this; the door's fallback capacity mirrors it. */
  readonly handCapacity?: number;
  /** Double-denomination tax on EXISTING verbs (rung-6 door seam, absent
   *  map values untouched). A taxed verb on a pool-less state refuses
   *  `attention-debt` — the door's own law, reused, never re-invented. */
  readonly attentionCostOverride?: Partial<Record<PlayerVerb, 0 | 1>>;
  /** The policy book. FALSE strips the card lookup: commits refuse through
   *  the door's existing `unknown-card-hash` grammar even on hosts that DO
   *  have a book wired. TRUE means "this seat may author" — subject to the
   *  host actually wiring a lookup (the scenario lane never has v0 cards,
   *  so commits refuse `no-card-lookup` there under BOTH settings; the
   *  flag is the honest statement of intent for card-bearing hosts). */
  readonly lookupPolicyCards: boolean;
  /** Doc DATA only (goal inversion): a label the authoring layer reads to
   *  re-author objectives around the inverted goal node. NO engine consumes
   *  it — "the same six verbs with the goal node inverted" (:1209) is an
   *  objectives rewrite, not a mechanic. */
  readonly goalInversion?: string;
}

/** The v0 closed roster: the five 🔧-marked exemplars of §1.2 that today's
 *  seams can honestly serve. The Auditor (:1294) and the New Hire (:1283)
 *  stay out — "no Triage" needs a communicate/shed ban (no seam) and
 *  investigation actions need mechanics perspectives cannot add. The
 *  Support Queue section itself is still ❌ (:1372); its row anchors on the
 *  law block's own example line :1212 — disclosed, not hidden. */
export type PerspectiveId =
  | "apprentice"
  | "datacenter-tech"
  | "noc-shift"
  | "red-team-friday"
  | "support-queue";

export const PERSPECTIVE_IDS: readonly PerspectiveId[] = Object.freeze(
  ["apprentice", "datacenter-tech", "noc-shift", "red-team-friday", "support-queue"] as const,
);

export const PERSPECTIVE_V0: Readonly<Record<PerspectiveId, PerspectiveSpec>> = Object.freeze({
  /* "A pure reactive level: no building allowed, only triage… Six things
     break in twenty minutes; you have three hands." (:1266-1270)
     Expressed: place-device taped, hands minted at three, and the purest
     variant's phone is taxed — "you have only dashboards and a phone, and
     you can only route information to the right people" (:1268-1270):
     communicate pays attention, so escalation without a Triage Window loan
     refuses through the rung-6 law. The doc ALSO wants no Connect
     (:1205) — connect-ports has no seam (census column). */
  "noc-shift": Object.freeze({
    id: "noc-shift",
    name: "The NOC Shift / On-Call Night",
    specLine: 1266,
    hide: Object.freeze([]),
    show: Object.freeze([]),
    refuse: Object.freeze({ verbs: Object.freeze([Verb.PlaceDevice] as const satisfies readonly PlayerVerb[]) }),
    handCapacity: 3,
    attentionCostOverride: Object.freeze({ communicate: 1 } as const),
    lookupPolicyCards: true,
  }),
  /* "You are the hands… the upstairs 'player' (the NOC) sends you
     instructions that are sometimes wrong." (:1324-1328)
     Expressed: the upstairs telemetry (company:: namespace) is out of sight
     and the policy book is closed (lookupPolicyCards false). The doc's
     "Place/Connect only, no Observe" is carried by that pair — an honest
     v0 FLAVOUR: the price/talk verbs stay bannable-but-unbanned because the
     card's lesson is blindness, not restriction, and every ban costs the
     expressibility census a row readers may not want spent. Board namespaces
     stay VISIBLE — the tech is literally at the board. */
  "datacenter-tech": Object.freeze({
    id: "datacenter-tech",
    name: "The Datacenter Tech / Remote Hands",
    specLine: 1324,
    hide: Object.freeze(["company::"] as const),
    show: Object.freeze([]),
    refuse: Object.freeze({ verbs: Object.freeze([]) as readonly PlayerVerb[] }),
    lookupPolicyCards: false,
  }),
  /* "You see only tickets, not the board… you must infer the outage from
     customer complaints and dispatch fixes blind." (:1376-1378, law line
     :1212). Diagnose-only: every bannable non-diagnose verb is taped and
     the book is closed; the sight hides EVERYTHING except ticket/queue-
     denominated cells (queueDepth-style properties, company telemetry —
     the churn signal is the complaint stream) and the frosted pane clears
     only in the report projection, exactly like the doc's end-of-level
     reveal. The board namespaces (node/, lane/, edge/, rack/) are the
     blinded objects under the `"*"`. */
  "support-queue": Object.freeze({
    id: "support-queue",
    name: "The Support Queue",
    specLine: 1212,
    hide: Object.freeze(["*"] as const),
    show: Object.freeze(["company::", "support", "ticket", "queue"] as const),
    refuse: Object.freeze({
      verbs: Object.freeze([Verb.PlaceDevice, Verb.AdjustPrice, Verb.SellOffer, Verb.NegotiateTerms] as const satisfies readonly PlayerVerb[]),
    }),
    lookupPolicyCards: false,
  }),
  /* "You cannot act. You can only author policies — if/then rules with a
     priority order." (:1478-1475, law line :1210 "Tune-only (you may
     author policy and nothing else)"). Expressed v0: place-device taped
     (the doc's "cannot act" made mechanical) while the book stays OPEN —
     the one perspective whose card WISH is fully served by a seam, because
     authoring was already the door's `lookupPolicyCard` contract. Price
     tuning stays allowed (it IS the Tune family). Connect/configure/shed/
     all-uncovered: the census carries the debt. */
  apprentice: Object.freeze({
    id: "apprentice",
    name: "The Apprentice",
    specLine: 1478,
    hide: Object.freeze([]),
    show: Object.freeze([]),
    refuse: Object.freeze({ verbs: Object.freeze([Verb.PlaceDevice] as const satisfies readonly PlayerVerb[]) }),
    lookupPolicyCards: true,
  }),
  /* "You play the attacker for one level… the same six verbs with the goal
     node inverted." (:1246-1248, law line :1209)
     ZERO mechanics — hide/refuse/hand all default to untouched, the row is
     the goalInversion label alone. That IS the §1.2 filter working: an
     author re-authors the objectives (win becomes what the defender
     feared, lose becomes the attacker's stall) and the perspective id
     records WHY the doc reads inverted. See the test's re-author example. */
  "red-team-friday": Object.freeze({
    id: "red-team-friday",
    name: "Red Team Friday",
    specLine: 1250,
    hide: Object.freeze([]),
    show: Object.freeze([]),
    refuse: Object.freeze({ verbs: Object.freeze([]) as readonly PlayerVerb[] }),
    lookupPolicyCards: true,
    goalInversion: "Play the attacker: same verbs, goal node inverted (:1209). Re-author objectives, not mechanics.",
  }),
});

/* Init-time module law: every named ban MUST sit inside the covered set.
 * A row that wishes an uncoverable ban is an authoring bug against the
 * ceiling — fail loud at import, the scenarios.ts precedent (:17-19
 * "authored drift fails loud, it never ships quiet"). */
for (const id of PERSPECTIVE_IDS) {
  for (const verb of PERSPECTIVE_V0[id].refuse.verbs) {
    if (!PERSPECTIVE_BANNABLE_VERBS.includes(verb)) {
      throw new Error(
        `scenario[PERSPECTIVE_UNEXPRESSIBLE] at 'perspective:${id}.refuse.verbs': "${verb}" has no door seam to tape — design the seam first or leave the ban to the owner wall`,
      );
    }
  }
}

/** The frozen census: roster row × all nineteen verbs → fate. Derived at
 *  module init from the rows + the covered set (one authority, no
 *  hand-maintained table to drift), and pinned EXACTLY by the test suite —
 *  if a future door seam lands, the pin reddens and the census is updated
 *  deliberately, with its owner. */
export const PERSPECTIVE_EXPRESSIBILITY: Readonly<Record<PerspectiveId, Readonly<Record<string, PerspectiveVerbFate>>>> =
  (() => {
    const table: Record<string, Record<string, PerspectiveVerbFate>> = {};
    for (const id of PERSPECTIVE_IDS) {
      const spec = PERSPECTIVE_V0[id];
      const row: Record<string, PerspectiveVerbFate> = {};
      for (const verb of PLAYER_VERBS) {
        if (spec.refuse.verbs.includes(verb)) row[verb] = "banned";
        else if (verb === Verb.PolicyCardCommit && !spec.lookupPolicyCards) row[verb] = "banned";
        else if (!PERSPECTIVE_BANNABLE_VERBS.includes(verb)) row[verb] = "not-coverable-v0";
        else row[verb] = "allowed";
      }
      table[id] = row;
    }
    return Object.freeze(table) as Readonly<Record<PerspectiveId, Readonly<Record<string, PerspectiveVerbFate>>>>;
  })();

/* ─────────────────────────── the composition ─────────────────────────── */

/* One shared refusal answer for every taped validator — the door supplies
 * the per-seam prefix (`placement-rejected:` / `unknown-plan:` /
 * `unknown-target:`), the FREEZE_REJECTION pattern (runner.ts:741) verbatim.
 * No new refusal PHRASE enters the door's census: this string is host
 * detail, exactly like "change-freeze" is. */
const PERSPECTIVE_REJECTION = Object.freeze({ reason: "perspective-forbids" });

function tapeOff<TQuery>(_query: TQuery): typeof PERSPECTIVE_REJECTION {
  return PERSPECTIVE_REJECTION;
}

/** Compose a perspective onto an already-assembled door config (the
 *  freeze-taped one included). Law mirror of the freeze block: the unarmed
 *  CALLER never invokes this, so unarmed door configs stay the exact
 *  pre-rung object. Composition is additive-and-precedence-clear:
 *  - a banned verb's validator becomes the unconditional tape (a freeze
 *    tape underneath is subsumed — the perspective never lets the verb
 *    through at any minute);
 * - an unbanned verb's existing validator is PRESERVED untouched (the
 *    freeze band still answers under the tape exactly as before);
 *  - lookupPolicyCards false replaces any host lookup with `() => null` —
 *    the door's existing `unknown-card-hash` refusal grammar, no new phrase;
 *  - handCapacity overrides the door's fallback mint capacity;
 *  - attentionCostOverride merges onto the doc's attention cost map, the
 *    perspective's keys winning (rung-6 double-denomination law).
 *  Everything else rides through by spread — new fields the door grows are
 *  the door's business, not this file's. */
export function applyPerspectiveToDoorConfig(config: IntentDoorConfig, spec: PerspectiveSpec): IntentDoorConfig {
  const banPlace = spec.refuse.verbs.includes(Verb.PlaceDevice);
  const banAdjust = spec.refuse.verbs.includes(Verb.AdjustPrice);
  const banSell = spec.refuse.verbs.includes(Verb.SellOffer);
  const banNegotiate = spec.refuse.verbs.includes(Verb.NegotiateTerms);
  return Object.freeze({
    ...config,
    ...(spec.handCapacity === undefined ? {} : { handCapacity: spec.handCapacity }),
    ...(banPlace ? { canPlaceDevice: (_q: PlaceDeviceQuery) => tapeOff(_q) } : {}),
    ...(banAdjust ? { canAdjustPrice: (_q: AdjustPriceQuery) => tapeOff(_q) } : {}),
    ...(banSell ? { canSellOffer: (_q: SellOfferQuery) => tapeOff(_q) } : {}),
    ...(banNegotiate ? { canNegotiateTerms: (_q: NegotiateQuery) => tapeOff(_q) } : {}),
    ...(spec.lookupPolicyCards ? {} : { lookupPolicyCard: () => null }),
    ...(spec.attentionCostOverride === undefined
      ? {}
      : {
          attentionCost: Object.freeze({
            ...config.attentionCost,
            ...spec.attentionCostOverride,
          }),
        }),
  });
}

/** The report-side record of a perspective-armed run. `observation` stays
 *  WHOLE TRUTH regardless of this projection — seeing is not being (pinned
 *  law). The cell census appears ONLY when a host supplied a view to
 *  project; the scenario lane itself mints no cells. */
export interface ScenarioPerspectiveReport {
  readonly id: PerspectiveId;
  readonly hide: readonly string[];
  readonly show: readonly string[];
  /** Verbs the tapes land on (census "banned", both mechanisms). */
  readonly bannedVerbs: readonly PlayerVerb[];
  readonly goalInversion?: string;
  readonly visibleCells?: readonly string[];
  readonly hiddenCells?: readonly string[];
}

export function perspectiveReportFor(
  spec: PerspectiveSpec,
  view?: ReadonlyMap<ObservedKey, unknown>,
): ScenarioPerspectiveReport {
  const banned = PLAYER_VERBS.filter(
    (verb) => spec.refuse.verbs.includes(verb) || (verb === Verb.PolicyCardCommit && !spec.lookupPolicyCards),
  );
  const projection = view === undefined ? undefined : projectPerspectiveView(view, spec.hide, spec.show);
  return Object.freeze({
    id: spec.id as PerspectiveId,
    hide: spec.hide,
    show: spec.show,
    bannedVerbs: Object.freeze(banned),
    ...(spec.goalInversion === undefined ? {} : { goalInversion: spec.goalInversion }),
    ...(projection === undefined
      ? {}
      : { visibleCells: projection.visibleKeys, hiddenCells: projection.hiddenKeys }),
  });
}
