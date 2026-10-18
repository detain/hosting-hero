/** perspective.ts — §1.2 perspective levels: the Invariant-Core filter at
 *  FULL POWER, composed through the door's general `canExecute` gate.
 *
 *  The law, verbatim from hosting_game.md:1206-1207:
 *  "A perspective level may change **which of the six verbs dominates** and
 *  **what you can see** — and nothing else."
 *
 *  That sentence is a COMPOSITION contract, not a new engine. Every mechanic
 *  here rides an existing seam — the Change Freeze (rung 8) is the direct
 *  precedent: `limits.freeze` wires the door's EXISTING host validators with
 *  zero new authority, and an unarmed doc never grows a key. A perspective
 *  is the same trick made data:
 *  - "which verbs dominate"  → ONE general veto: `canExecute` (ADR-0019
 *    program 1 · lane L-CE, owner ruling 2026-10-18) composed onto the door
 *    config. The gate runs resolve-carrier → canExecute → hands → attention
 *    → handler, so a banned verb spends NOTHING: no hands, no occupancy, no
 *    attention token, no handler, no per-verb validator. This replaced the
 *    v0 per-validator tapes (canPlaceDevice wrappers etc., ceiling five of
 *    nineteen verbs) — the single-authority shape is why the census below
 *    now reads full-power: ALL 19 verbs are bannable.
 *  - "what you can see"      → the book strip (`lookupPolicyCard → () =>
 *    null`) and the pure sight filter over ScopedReadView-shaped cell maps
 *    (observed/view.ts key grammar `entity::property`). These stay SEPARATE
 *    axes from verb-bans on purpose: `lookupPolicyCards: false` says the
 *    seat cannot see the card book (a visibility fact — commits then refuse
 *    through the door's own `unknown-card-hash` grammar on hosts that DO
 *    wire a book); naming `policy-card-commit` in a ban list says the seat
 *    may not fire the verb even with a book present (a dominance fact,
 *    refused pre-payment like every other ban). A row may set both — the
 *    Datacenter Tech and the Support Queue do, because the doc's "only"
 *    readings forbid the Commit verb AND blind the seat to the book — and
 *    the difference is legible in the refusal reason, never invented.
 *    Seeing is NOT being: the projection never touches the simulation —
 *    hide changes what a report SHOWS, never what the engine FOLDS (pinned
 *    by the whole-truth test: same seed, hidden and unhid runs fold
 *    identical observations).
 *  - dominance pressure      → a handCapacity override at the mint, and an
 *    attention tax on existing verbs (rung-6 double-denomination law — the
 *    tax is not a ban: a taxed verb stays live, it just pays twice).
 *  - goal inversion          → doc DATA. `Red Team Friday` is "the same six
 *    verbs with the goal node inverted" (:1213): the row ships metadata only
 *    and an author re-authors objectives around it (test-demonstrated).
 *
 *  THE BAN IS THE SEAT'S OWN RAIL (carrier law). `ExecuteQuery.carrier` is
 *  G7 attribution: null for a human-fed intent, the rule's legacy verb for a
 *  translated Book intent. A perspective bans the VERB on the human rail; a
 *  translated carrier passes to the chained hook underneath. This is not the
 *  doc leaving a loophole — it is the Apprentice's own thesis: "You cannot
 *  act. You can only author policies… and an AI junior executes them"
 *  (:1479). If bans rode carriers, "may author policy and nothing else"
 *  would be unplayable: every policy the junior fired would break on the
 *  author's own tape. A seat that must ALSO close the Book hides it via
 *  `lookupPolicyCards: false` (no cards resolve, so no carrier ever exists).
 *
 *  HOST VOCABULARY (the door mints no code for a general gate): the refusal
 *  reason is `perspective-forbids: "<row id>" does not execute "<verb>"` —
 *  house `code: detail` grammar, the host's promise, deterministic from
 *  (row, verb). Zero new door refusal PHRASES: the census over
 *  intent-door.ts stays at 46 UNAIDED because the string is host-supplied.
 *
 *  THE CHAINING LAW. The perspective composes LAST after the freeze band
 *  (runner.ts wires {freeze tapes} → applyPerspectiveToDoorConfig): a banned
 *  verb subsumes the freeze because the gate fires before the per-verb
 *  validator could; an unbanned verb's freeze tape rides on UNTOUCHED, by
 *  identity. If a host hook already answers `canExecute`, the perspective's
 *  closure vets first (it is the outer, last-composed layer) and DELEGATES
 *  to it for every verb it does not ban — the same query object passed
 *  through, so no state or context re-derivation. The era filter (lane L-EM,
 *  scenario/eraAvailability.ts @LANDED ADR-0019 program 4) chains AFTER
 *  perspective: `applyEraAvailabilityToDoorConfig(applyPerspectiveToDoorConfig(cfg, seat),
 *  era)`; the composition signature `(config, plan|spec)` is deliberately the
 *  shape every further filter layer reuses, each one wrapping the hook below.
 *
 *  Zero GameState/digest changes. Import law: ../types.ts +
 *  ../pipeline/index.ts TYPES only — this module is pure data and pure
 *  functions, no engine imports beyond the door's config surface.
 */

import type { ObservedKey, PlayerVerb } from "../types.ts";
import { PLAYER_VERBS, PlayerVerb as Verb } from "../types.ts";
import type {
  ExecuteQuery,
  ExecuteRejection,
  IntentDoorConfig,
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

/* ─────────────────────────── the verb gate (full power) ─────────────────── */

/** Every verb a perspective can ban. With the general `canExecute` gate
 *  landed (L-CE), this is the WHOLE door rail — nineteen of nineteen. The
 *  list is kept as its own exported name (rather than aliasing PLAYER_VERBS)
 *  because it is the census's stated ceiling: if the door ever GROWS a verb
 *  past the roster below, an author reading this list sees immediately that
 *  the new verb is bannable, and the init law guards forged rows against
 *  off-rail strings the same way the v0 ceiling guarded against wishes. */
export const PERSPECTIVE_BANNABLE_VERBS: readonly PlayerVerb[] = Object.freeze([...PLAYER_VERBS]);

/** What the expressibility census can say about one verb under one row.
 *  v0 carried a third arm, "not-coverable-v0", for the fourteen verbs no
 *  per-verb validator reached (the canExecute owner wall, ADR-0018 remit).
 *  The wall is BUILT (ADR-0019 program 1) and the arm retired with it:
 *  every cell is now an actionable decision, never a documented ceiling.
 *  - "banned":   canExecute refuses the verb on the seat's own rail —
 *                pre-payment, reason `perspective-forbids: …`.
 *  - "allowed":  the verb stays playable (and the row COULD have banned
 *                it — it simply doesn't). */
export type PerspectiveVerbFate = "banned" | "allowed";

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
  /** Dominance: verbs the seat may not fire on its own rail. Every entry
   *  MUST be a door verb — the module asserts it at init, so a forged or
   *  off-rail slug fails loud HERE, not quiet at the door. */
  readonly refuse: { readonly verbs: readonly PlayerVerb[] };
  /** Dominance pressure: the mint's hand capacity while seated here
   *  (NOC Shift's "you have three hands", :1269). Hosts mint hands from
   *  this; the door's fallback capacity mirrors it. */
  readonly handCapacity?: number;
  /** Double-denomination tax on EXISTING verbs (rung-6 door seam, absent
   *  map values untouched). A taxed verb on a pool-less state refuses
   *  `attention-debt` — the door's own law, reused, never re-invented. The
   *  tax is dominance PRESSURE, not a ban — the verb stays live. */
  readonly attentionCostOverride?: Partial<Record<PlayerVerb, 0 | 1>>;
  /** The policy book VISION (not a verb ban — see the header axes). FALSE
   *  strips the card lookup: commits refuse through the door's existing
   *  `unknown-card-hash` grammar even on hosts that DO have a book wired.
   *  TRUE means "this seat may see the book" — subject to the host actually
   *  wiring a lookup (the scenario lane never has v0 cards, so commits
   *  refuse `no-card-lookup` there under BOTH settings; the flag is the
   *  honest statement of intent for card-bearing hosts). To forbid the
   *  COMMIT VERB itself (book or no book), name it in `refuse.verbs`. */
  readonly lookupPolicyCards: boolean;
  /** Doc DATA only (goal inversion): a label the authoring layer reads to
   *  re-author objectives around the inverted goal node. NO engine consumes
   *  it — "the same six verbs with the goal node inverted" (:1213) is an
   *  objectives rewrite, not a mechanic. */
  readonly goalInversion?: string;
}

/** The closed roster: the five 🔧-marked exemplars of §1.2 that the seat
 *  machinery can honestly serve. The Auditor (:1299) and the New Hire
 *  (:1280) stay out for their OWN reasons — the Auditor's "no Triage"
 *  (:1210) is now bannable (shed-load/communicate both reached by the gate)
 *  but its "Observe + Commit dominant" half needs INVESTIGATION mechanics a
 *  perspective may not add ("and nothing else", :1207), and the New Hire's
 *  fogged "investigate" actions are a seventh verb in disguise (:1215).
 *  Roster growth is a fresh authoring decision with the owner, not a seam
 *  consequence — the expressibility table no longer caps it, the doc does.
 *  The Support Queue section itself is still ❌ (:1376); its row anchors on
 *  the law block's own example line :1212 — disclosed, not hidden. */
export type PerspectiveId =
  | "apprentice"
  | "datacenter-tech"
  | "noc-shift"
  | "red-team-friday"
  | "support-queue";

export const PERSPECTIVE_IDS: readonly PerspectiveId[] = Object.freeze(
  ["apprentice", "datacenter-tech", "noc-shift", "red-team-friday", "support-queue"] as const,
);

/* The six-verb families (§1.9 :4989-4991, verbatim): Observe (open an
 * overlay / read a graph), Diagnose (narrow symptom to cause), Place &
 * Connect (add a node, draw a link), Tune (move a slider, set a policy),
 * Triage (assign a hand / choose what burns), Commit (schedule a change
 * into a window). The family→door-verb readings each ban-set below cites
 * are the mapping discipline: a ban must be named by the doc's own words. */

export const PERSPECTIVE_V0: Readonly<Record<PerspectiveId, PerspectiveSpec>> = Object.freeze({
  /* "The NOC Shift = Triage-dominant, no Place/Connect." (:1209)
     "A pure reactive level: no building allowed, only triage." (:1267)
     "Six things break in twenty minutes; you have three hands." (:1269)
     "In the purest variant you don't touch anything at all: you have only
     dashboards and a phone, and you can only route information to the right
     people" (:1271-1272).
     Expressed: the Place & Connect family (§1.9 "add a node, draw a link")
     is the whole ban — place-device ("no building"), connect-ports ("no
     …Connect"), and disconnect-drain, the same family's un-drawing half
     (pulling a cable IS touching the board the doc forbids). Hands mint at
     three (:1269), and the purest variant's phone is taxed — communicate
     pays attention, so escalation without a Triage Window loan refuses
     through the rung-6 law. Triage itself STAYS LIVE by name: shed-load is
     "choose what burns" — the dominant verb, never a ban. The "purest
     variant" sentence reads as a stricter variant of the level, not the
     row's canonical ban set; a variant row is future authoring, not v0. */
  "noc-shift": Object.freeze({
    id: "noc-shift",
    name: "The NOC Shift / On-Call Night",
    specLine: 1266,
    hide: Object.freeze([]),
    show: Object.freeze([]),
    refuse: Object.freeze({
      verbs: Object.freeze([
        Verb.PlaceDevice,
        Verb.ConnectPorts,
        Verb.DisconnectDrain,
      ] as const satisfies readonly PlayerVerb[]),
    }),
    handCapacity: 3,
    attentionCostOverride: Object.freeze({ communicate: 1 } as const),
    lookupPolicyCards: true,
  }),
  /* "The Datacenter Tech = Place/Connect only, no Observe (you're *told*
     what to do and it's wrong)." (:1211)
     "The upstairs 'player' (the NOC) sends you instructions that are
     sometimes wrong." (:1327-1328)
     "Only" is exclusive in the doc's own grammar: everything outside the
     Place & Connect family (§1.9 :4990 "add a node, draw a link") is
     banned — fifteen verbs: the named "no Observe" reads as configure-node
     (inspection depth IS opening the overlay, the door's only observing
     verb), plus the whole business/policy/commit set the cold-aisle seat
     cannot reach: policy-card-commit, shed-load, communicate (the upstairs
     talks DOWN; the hands-on deck RECEIVES — :1327), the three price-family
     dials, and every tier-extension verb. The book is ALSO hidden
     (`lookupPolicyCards: false`) — the tech authors nothing, sees nothing
     authored: blindness is the card's lesson (:1324 "Remote Hands"). The
     camera law "no altitudes… no zoom" (:1340) is presentation, not a verb.
     toggle-speed stays (see the shared HUD-utility law on the roster). */
  "datacenter-tech": Object.freeze({
    id: "datacenter-tech",
    name: "The Datacenter Tech / Remote Hands",
    specLine: 1324,
    hide: Object.freeze(["company::"] as const),
    show: Object.freeze([]),
    refuse: Object.freeze({
      verbs: Object.freeze([
        Verb.ConfigureNode,
        Verb.PolicyCardCommit,
        Verb.ShedLoad,
        Verb.Communicate,
        Verb.AdjustPrice,
        Verb.Shield,
        Verb.ScaleNode,
        Verb.MaintainNode,
        Verb.ScheduleWindow,
        Verb.SellOffer,
        Verb.NegotiateTerms,
        Verb.IsolateNode,
        Verb.ThrottleNode,
        Verb.RestartNode,
        Verb.ReclaimNode,
      ] as const satisfies readonly PlayerVerb[]),
    }),
    lookupPolicyCards: false,
  }),
  /* "The Support Queue = Diagnose-only, with the board hidden." (:1212)
     "You must infer the outage from customer complaints and dispatch fixes
     blind." (:1379)
     Diagnose-only now expresses COMPLETELY (v0 banned the four verbs seams
     reached and ate the rest as debt): the whole rail outside the seat's
     two live channels is banned — seventeen verbs. The channels: READING
     (sight keeps the complaint stream: hide "*" + show the ticket/queue
     denominations — "see only tickets, not the board", :1377) and
     DISPATCH ("dispatch fixes", :1379 — communicate is the fix walking to
     the board; the seat that may not even shed-load "blind" cannot touch
     the board itself). policy-card-commit is banned BY NAME (the board's
     book is someone else's religion) AND the lookup is stripped — both
     axes, per the header's argument for why they are different truths.
     toggle-speed stays (HUD-utility law). */
  "support-queue": Object.freeze({
    id: "support-queue",
    name: "The Support Queue",
    specLine: 1212,
    hide: Object.freeze(["*"] as const),
    show: Object.freeze(["company::", "support", "ticket", "queue"] as const),
    refuse: Object.freeze({
      verbs: Object.freeze([
        Verb.PlaceDevice,
        Verb.ConnectPorts,
        Verb.DisconnectDrain,
        Verb.ConfigureNode,
        Verb.PolicyCardCommit,
        Verb.ShedLoad,
        Verb.AdjustPrice,
        Verb.Shield,
        Verb.ScaleNode,
        Verb.MaintainNode,
        Verb.ScheduleWindow,
        Verb.SellOffer,
        Verb.NegotiateTerms,
        Verb.IsolateNode,
        Verb.ThrottleNode,
        Verb.RestartNode,
        Verb.ReclaimNode,
      ] as const satisfies readonly PlayerVerb[]),
    }),
    lookupPolicyCards: false,
  }),
  /* "The Apprentice = Tune-only (you may author policy and nothing else)."
     (:1214) — "### The Apprentice (you may only write rules)" (:1478),
     "You cannot act. You can only author policies — if/then rules with a
     priority order — and an AI junior executes them" (:1479).
     The line's "Tune-only" is glossed by its own parenthetical and by the
     section heading: POLICY, and NOTHING ELSE — "and nothing else" outranks
     the slider-reading of Tune (the v0 comment kept price/sell/negotiate
     allowed on "it IS the Tune family"; the doc's narrowing gloss retires
     that reading now the seam exists to obey it). "You cannot ACT" bans the
     whole world-touching rail — sixteen verbs. What stays: the authoring
     verb policy-card-commit (the seat's one door), communicate (the desk
     answers — the campaign's own apprentice doc dispatches it as legal
     work, chapters.ts "the queue still moves from below", and §1.2's NOC
     precedent treats routing information as non-acting), and the book
     OPEN: "this seat may author" is exactly the one card wish the seam
     exists to serve. */
  apprentice: Object.freeze({
    id: "apprentice",
    name: "The Apprentice",
    specLine: 1478,
    hide: Object.freeze([]),
    show: Object.freeze([]),
    refuse: Object.freeze({
      verbs: Object.freeze([
        Verb.PlaceDevice,
        Verb.ConnectPorts,
        Verb.DisconnectDrain,
        Verb.ConfigureNode,
        Verb.ShedLoad,
        Verb.AdjustPrice,
        Verb.Shield,
        Verb.ScaleNode,
        Verb.MaintainNode,
        Verb.ScheduleWindow,
        Verb.SellOffer,
        Verb.NegotiateTerms,
        Verb.IsolateNode,
        Verb.ThrottleNode,
        Verb.RestartNode,
        Verb.ReclaimNode,
      ] as const satisfies readonly PlayerVerb[]),
    }),
    lookupPolicyCards: true,
  }),
  /* "Red Team Friday = the same six verbs with the goal node inverted."
     (:1213) — "You play the attacker for one level" (:1251), "the same six
     verbs" (:1213) is the doc FORBIDDING mechanics here: an invented ban
     would be a perspective changing more than dominance-through-inversion.
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
    goalInversion: "Play the attacker: same verbs, goal node inverted (:1213). Re-author objectives, not mechanics.",
  }),
});

/* Init-time module law: every named ban MUST sit inside the bannable rail.
 * With canExecute the rail is all nineteen verbs, so this is the typo/
 * forged-row guard (off-rail slugs), not the v0 ceiling guard — the shape
 * stays because a future row that bans a NON-verb string is still an
 * authoring bug against the door: fail loud at import, the scenarios.ts
 * precedent (:17-19 "authored drift fails loud, it never ships quiet"). */
for (const id of PERSPECTIVE_IDS) {
  for (const verb of PERSPECTIVE_V0[id].refuse.verbs) {
    if (!PERSPECTIVE_BANNABLE_VERBS.includes(verb)) {
      throw new Error(
        `scenario[PERSPECTIVE_UNEXPRESSIBLE] at 'perspective:${id}.refuse.verbs': "${verb}" is not a door verb — the canExecute gate (ADR-0019 program 1) reaches the whole PLAYER_VERBS rail; a ban outside it is a typo, not a perspective`,
      );
    }
  }
}

/** The frozen census: roster row × all nineteen verbs → fate. Derived at
 *  module init from the rows + the bannable rail (one authority, no
 *  hand-maintained table to drift), and pinned EXACTLY by the test suite.
 *  POST-L-CE SEMANTICS: no cell may read a ceiling — every verb has a
 *  working ban seam, so every cell is the row's DECISION. The table's job
 *  is now the falsifiable reading of the exemplars: retune a row's ban list
 *  and the pin reddens with it, deliberately, in the owner's review. */
export const PERSPECTIVE_EXPRESSIBILITY: Readonly<Record<PerspectiveId, Readonly<Record<string, PerspectiveVerbFate>>>> =
  (() => {
    const table: Record<string, Record<string, PerspectiveVerbFate>> = {};
    for (const id of PERSPECTIVE_IDS) {
      const spec = PERSPECTIVE_V0[id];
      const row: Record<string, PerspectiveVerbFate> = {};
      for (const verb of PLAYER_VERBS) {
        row[verb] = spec.refuse.verbs.includes(verb) ? "banned" : "allowed";
      }
      table[id] = row;
    }
    return Object.freeze(table) as Readonly<Record<PerspectiveId, Readonly<Record<string, PerspectiveVerbFate>>>>;
  })();

/* ─────────────────────────── the composition ─────────────────────────── */

/** The general gate this module hangs (the SINGLE ban authority, post-L-CE).
 *  A seat with an empty ban list grows NO `canExecute` key at all — the
 *  composed config keeps the prior object's shape for zero-mechanics rows
 *  (red-team-friday's byte-stand law), so an unbanning row can never even
 *  accidentally consult-and-delegate. */
function perspectiveGate(
  spec: PerspectiveSpec,
  priorCanExecute: ((query: ExecuteQuery) => ExecuteRejection | null) | undefined,
): ((query: ExecuteQuery) => ExecuteRejection | null) | undefined {
  if (spec.refuse.verbs.length === 0) return undefined;
  const rejectionFor = new Map<PlayerVerb, ExecuteRejection>();
  for (const verb of spec.refuse.verbs) {
    rejectionFor.set(
      verb,
      Object.freeze({
        reason: `perspective-forbids: "${spec.id}" does not execute "${verb}"`,
      }),
    );
  }
  return (query: ExecuteQuery): ExecuteRejection | null => {
    // The seat's OWN rail answers to the seat (carrier law, header).
    if (query.carrier === null) {
      const rejection = rejectionFor.get(query.verb);
      if (rejection !== undefined) return rejection;
    }
    // Everything else delegates DOWN the chain — freeze-era or future
    // filters stay reachable through the perspective, never shadowed.
    return priorCanExecute ? priorCanExecute(query) : null;
  };
}

/** Compose a perspective onto an already-assembled door config (the
 *  freeze-taped one included — this is the LAST rung before the driver sees
 *  the config; the era filter chains AFTER this one, see the header). Law
 *  mirror of the freeze block: the unarmed CALLER never invokes this, so
 *  unarmed door configs stay the exact pre-rung object. Composition is
 *  additive-and-precedence-clear:
 *  - verb bans ride the general `canExecute` gate (ALL nineteen reachable);
 *    the gate fires BEFORE payment and before the per-verb validators, so a
 *    perspective ban SUBSUMES any freeze band on the same verb without
 *    touching it, while an unbanned verb's existing validator (freeze or
 *    host) rides through by IDENTITY — the per-verb seams are no longer
 *    composition inputs for bans (v0's tape shape, retired by L-PERS);
 *  - a prior `canExecute` (host policy layer under the seat) is CHAINED:
 *    the perspective vets first, delegates for every non-banned verb;
 *  - lookupPolicyCards false replaces any host lookup with `() => null` —
 *    the book-VISION axis, the door's existing `unknown-card-hash` refusal
 *    grammar, no new phrase (not a verb ban — see header);
 *  - handCapacity overrides the door's fallback mint capacity;
 *  - attentionCostOverride merges onto the doc's attention cost map, the
 *    perspective's keys winning (rung-6 double-denomination law).
 *  Everything else rides through by spread — new fields the door grows are
 *  the door's business, not this file's. */
export function applyPerspectiveToDoorConfig(config: IntentDoorConfig, spec: PerspectiveSpec): IntentDoorConfig {
  const gate = perspectiveGate(spec, config.canExecute);
  return Object.freeze({
    ...config,
    ...(spec.handCapacity === undefined ? {} : { handCapacity: spec.handCapacity }),
    ...(gate === undefined ? {} : { canExecute: gate }),
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
  /** The general gate's ban list (census "banned") — PLAYER_VERBS rail
   *  order. The book strip is NOT a verb ban and never appears here; a
   *  commit ban does, because the row NAMED the verb. */
  readonly bannedVerbs: readonly PlayerVerb[];
  readonly goalInversion?: string;
  readonly visibleCells?: readonly string[];
  readonly hiddenCells?: readonly string[];
}

export function perspectiveReportFor(
  spec: PerspectiveSpec,
  view?: ReadonlyMap<ObservedKey, unknown>,
): ScenarioPerspectiveReport {
  const banned = PLAYER_VERBS.filter((verb) => spec.refuse.verbs.includes(verb));
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
