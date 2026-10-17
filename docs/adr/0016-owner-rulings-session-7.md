# ADR-0016 — Owner session-7 rulings (2026-10-17): the wire stamps are re-authored to RATIFIED-B, the versus design laws are resolved MAX-FEATURE (deck-v2 cost split + affix semantics live + ratified tie law), the co-op transport lands IN-REPO to its frame (`tools/transport`, `hh-coop-transport@1`), all three deferred mechanics ship (relationship ledger / sell acceptance dice / warmth cost), the Act-row successor verbs close it (throttle-node + restart-node — 18 verbs, census 46), and the thirteenth type claims the last invariant — `official:observability` on **Diagnose** via the ADR-0014 #D1(i) bless, exhausting the roster

## Status
**Accepted (2026-10-17)** — owner ruling, session 7, answering the wave-21 agenda (five open
threads, "keep going with all of this, go with recommendations, MAX feature") with a blanket
max-feature approval on every thread. This record is authored at closeout AFTER the build lanes
landed — every decision below is cited to its commit, and all numbers are disk-verified (the
`PlayerVerb` enum carries **18** values at `24f90bc`; the refusal census is **46**, machine-pinned;
api-verify PASSes at **1,682** names after this record's docs pass). Cross-references: ADR-0009
(the calibration wave — its "keeps" list is what #2 below supersedes), ADR-0013 (session 3),
ADR-0014 (session 4 — #D1(i) is the bless route #7 consumes; #D4's ceiling asymmetry is the law
#9 mirrors), ADR-0015 (session 6 — #1's residue is #1 below, its follow-up taste-numeric grammar
is collected by #10, its door-mechanics frame is what #4/#5/#8/#9 continue).

## Context

Session 6 (ADR-0015) closed the biggest program of its day — seven tier verbs with real mechanics,
the twelfth type, the relay wire-mechanics, 73 numerics ratified — but deliberately left **five
tails**, and the wave-20 closeout filed them as the fresh-owner-ask register: (1) the
`PROVISIONAL-B` **wire stamps**, the one ratify-sweep residue whose flip required moving the
content validator in the same commit; (2) the **versus deck design laws**, ADR-0015 #1 EXPRESSLY
"not swept" because they are design posture, not tuning constants (weightBps==cost, affix
inertness, the 8–10 pool-band ambiguity, the tie law, the unattributed floor, the key spaces);
(3) the **co-op transport**, ADR-0014 #D6/ADR-0015 #4 leaving the socket side out-of-repo — the
codec/port/idempotence frame had no owner decision yet; (4) the three deferred **mechanics**:
the colo card's relationship METER (the Negotiate book had tone but no memory), the Sell verb's
acceptance question (part-1 posture: the executed intent simply WAS the close), and the Scale
warmth COST (the door books warmth free; nobody billed it); (5) the **Act-row successors** —
§7.16's "drain, restart, isolate, shed" row had isolate door-but-no-successor and throttle named
in the same card line but unbuilt — plus the thirteenth-type law call: the six invariant verbs
plus seven extended verbs were ALL claimed except **Diagnose**, and no §1.3 card names the word.
Session 7 rules on every thread at once, max-feature.

## Decision

**#1 — WIRE STAMPS RE-AUTHORED: `RATIFIED-B` rides the ratified sheet.** @`caa4d17` flips the
**39** `"tuningSheet": "PROVISIONAL-B"` field sites across the twelve type bundles then live to
`"RATIFIED-B"` — the label grammar now tells the runtime truth: `waves/pressure.ts` has run
**sheet B** since ADR-0009 (`ACTIVE_TUNING_SHEET="B"`, RATIFIED) — the wire literal simply
pretended otherwise. The validator enum moved in the SAME commit, widened to
`/^(PROVISIONAL|RATIFIED)-[ABC]$/` — the legacy `PROVISIONAL` arm stays VALID by a deliberate
**tolerance law** (a stamp is an authoring claim, not a runtime selector), and
`loader/__tests__/stamp.test.ts` (6 its) pins both the flip and the grammar.
>
> **The residue ruling (recorded as the gap it is):** the **27** `PROVISIONAL-B` sites in the
> waves slices and the **16** in `threats/registry-core.json` STAY honestly PROVISIONAL — the
> re-author targets the TYPE BUNDLES (the cards own sheet posture); a slice or registry row
> claiming RATIFIED would assert an authoring review that never happened. The tolerance grammar
> is exactly what lets the corpus stand half-converted without a lie. Disk truth at closeout:
> **42** RATIFIED-B sites across all thirteen bundles (the 13th card @`9e9f377` was AUTHORED
> straight into the ratified grammar — the flip now guides new authoring, not just old).

**#2 — VERSUS DESIGN LAWS RESOLVED MAX-FEATURE** (I-P design-lane decisions 1–6, superseding the
ADR-0009 keeps and ADR-0015 #1's "separate ask" posture — the asks are answered, the fingerprints
stand). Numbering follows the code's own `I-P decision N` labels (match.ts/draft.ts/tests); the
feint budget fills the unlabeled 4-slot between code-pinned 3 and 5.

- **Decision 1 — the cost split + domain guard** @`0ae760b`: `ThreatDeckEntry`/`DraftCandidate`
  gained a REQUIRED `costBps` (missing = `MISSING_FIELD`, no silent default) — the exact-sum law
  `ΣcostBps == budgetBps` moved OFF `weightBps` onto cost; weight stays the DRAFT weight
  (placement + role-quota share). This retires the versus-lane's original `weightBps==cost`
  owner-question. `VERSUS_HASH_DOMAIN` := **`hh-versus-deck-v2`** with a REVEAL-SIDE domain guard:
  an envelope not wearing the tag dies `COMMIT_MISMATCH` naming found-vs-spoken — the canonical
  fold is shape-agnostic, so without the guard a self-consistent v1 envelope would bind forever
  (the silent rebind the tag exists to prevent). No persisted decks exist in-repo, so the tag IS
  the version record.
- **Decision 2 — affix semantics LIVE** @`eb4b86a`: `versus/affixes.ts` ships
  `AFFIX_WAVE_DELTAS`, the 16-slug conversion table the converter applies AFTER binning (window ×
  pct clamp [1,96]; shape element-wise MAX, remainder→plateau; band/targets/share folds —
  `max(5, ladder×75/100)` with surplus +1-per-point code-unit, Σ100 preserved). The SI follow-on
  reuses the ratified §4.13 ×1.8/×2.5 (integer per-mille homes, IEEE-exact — versus reuses the
  singleplayer law, it invents no parallel taste). **Slug 12**
  (`piggybacked-on-a-maintenance-window`) is `live: false` DATA-ONLY: rides the wire, pays its
  2.0× cost premium, changes NOTHING in the sim — its future-consumer spec
  (`DefenderCommit.maintenanceWindows` gating service-time credits) needs its OWN ADR item. Five
  §2.13 doc promises (roster-adaptation, Designator law, load-feedback readback, peak-tracking,
  staff-asleep) ride as recorded DATA-ONLY halves with per-slug gap-notes — honest approximations,
  never silent claims. Byte-identity discipline: a no-affix deck produces a table identical
  field-for-field to the pre-V-2 converter (`feint`/`secondIncident`/`rules` keys OMITTED when
  unraised).
- **Decision 3 — the pool band read**: §2.24's "8–10" is the **DRAFTABLE POOL** band — the deck
  CEILING stays `MAX_DECK_THREATS` 10; a drafted deck spanning fewer than 8 distinct threats is
  the reported ADVISORY `POOL_BAND_NARROW` (validateDraftedDeck reports, never throws). The
  ambiguity the versus lane asked about is resolved as authoring advice, not legality.
- **Decision 4 — the deck feint budget**: `MAX_FEINT_WAVES_PER_DECK = 1` — a deck arming two live
  two-stage entries on DIFFERENT waves is refused (same-wave pair LEGAL, one flag); the converter
  surfaces it as `DECK_ILLEGAL schedule.FEINT_BUDGET_EXCEEDED`, legality-as-Data first, and a
  delta-composed table that breaches a waves/parse DOOR propagates the parse Error UNCHANGED
  (D-7 law, ADR-0013 #6 — an affix that breaks the cap is refused exactly like an authored wave
  that breaks the cap).
- **Decision 5 — the tie law ratified**: the decisive-wave rule (heaviest landed → most blocked →
  LOWEST wave number; baseline/unattributed rows never decisive; all-zero ⇒ wave 1, the opener is
  the default face of the story, never a null verdict) is now `pickDecisiveWave`, extracted
  VERBATIM, truth-tabled in the tests.
- **Decision 6 — the key spaces**: three-tag pairwise-disjointness pinned
  (`hh-versus-deck-v2` ≠ `hh-versus-book-v1` ≠ `hh-card-v1`, every hash carries its own tag);
  `versusRuleBookHash` absorbs `card.id` DELIBERATELY (a doctrine commit snapshots the exact cards,
  labels included) precisely where `cardContentFingerprint` strips it — the divergence is the
  point, and the `hh-card-v1` fingerprint golden from @`d076ad5` STANDS untouched. The
  **unattributed mint-tick floor is KEPT** — re-mint ids (`re<mint>@<tick>`) wear no
  `${tableId}~n~threat~ordinal` grammar, so the floor is FORCED BY GRAMMAR, not a label-map
  accident; widening attribution (re-mint stamps on the arrival lineage) is recorded as a
  **cross-lane pipeline ticket** (MODULE-STATUS gap row), explicitly NOT a versus-side patch.

**#3 — CO-OP TRANSPORT LANDS IN-REPO TO ITS FRAME.** @`0da14b8` creates `tools/transport`
(`transport-tools`, 84 tests / 6 files; @`88f9c30` adds the relay barrel rider, 16 names) under the
ruling "in-repo as far as it goes": **`hh-coop-transport@1`** frame envelope + boundary-parse codec
(13 `transport[CODE]` walls, unsafe-key law, record revival delegating to
`parseCoopTimelineRecord`); pump-driven `TransportPort` (ZERO timers/wall-clock — law-scanned AND
vi-spied); a deterministic in-memory carrier (kernel-RNG permutation, dup/drop/delay knobs); the
relay-hub adapter (every refusal becomes a fault verdict; departed-freeze, log-budget, pure-read
paging); the **client-side idempotence gate** — identical re-send ABSORBED with an observable
counter, divergent same-stamp payload FATAL (the hub's (tick,seq) authority is never re-negotiated:
the relay stays the SOLE stamp authority per ADR-0015 #4 R1); a fog serializer field-isomorphic to
the proto `ObservedCellWire` (drift-pinned); the **replica witness** — proves digest equality,
NEVER re-stamps, witness not election; and **`runTransportConformance`**, the 15-it law body a
future socket twin reruns verbatim. What REMAINS out-of-repo is the production carrier itself
(PHP/Workerman sockets, latency, per-seat fog, paging POLICY — OD-5(b) unchanged): the carrier's
contract is now "implement `TransportPort`, pass `runTransportConformance`" — it inherits LAWS
pinned here instead of inventing them.

**#4 — MECHANIC C: WARMTH GETS A PRICE (host seam).** @`1efe12a` bills what @`8037a4f` booked:
the door books reserved warmth for FREE (its law — the door never touches cash), and the money fold
now derives the cost. `WarmthConfig.rateMicroUsdPerSlotMonth` **25 Mµ$ ($25/slot/month,
PROVISIONAL** — register #10); the month-cursor identity law — the fold's cursor rides the SAME
calendar authority as the attention replenish (the floor-division law COPIED, not imported, module
boundary honored), a month consumes its identity exactly ONCE, a mid-month LWW re-price bills at
the NEXT roll only; ONE derived `scale-warmth:mN` draft per roll rides the ORDINARY opex loop —
posts or BOUNCES (the `:opex:scale-warmth:mN` witness identity carries through the existing
OPEX-REFUSED ×N census), never throws, ZERO dice. `scaleWarmInForce`'s as-of twin is drift-pinned
source-identical to the door's (elasticity readFileSync pattern). **Disclosed gap:** no shipped
host mints a Scale book at run-start yet (the door writes it mid-run), so every shipped witness is
byte-ident today — the seam is ready, unused, and tested as such. The proto runner and g5 quarter
money goldens (`25_005_307_300n`/`25_109_732_500n`) prove untouched.

**#5 — SUCCESSOR DOOR VERBS: `throttle-node` + `restart-node` CLOSE THE ACT ROW.** The §7.16
one-click row "drain, restart, isolate, shed" is now FULLY live (drain rides `disconnect-drain`,
shed rides `shed-load`, isolate @`86cff89`, and session 7 lands the last two):

- **`throttle-node` (17th) @`81b0589`** — the dbaas card's OWN second verb ("Verb: isolate AND
  THROTTLE"): a player-authored PARTIAL capacity cut, capacity-as-CLAMP at `defaultServeStep` §(c)
  — the roster is NEVER written. The **materialized-shrink** shape was REJECTED WITH PROOF (it
  would poison recovery's `fullSlots` capture) as was the **bps-probability** shape (the cut is a
  deterministic ceiling, not a dice roll). Over-cap admits nothing until work walks off (never-evict
  honored); the door's `[0, roster)` range makes `bad-cut-slots` POINT THE PLAYER at
  `isolate-node` — the total case stays the fence's.
- **`restart-node` (18th) @`fd91138`** — a BOUNDED reboot: half-open `[effective, release)` fence
  with the release leg REQUIRED (a null release is M2 structural garbage — an unbounded restart
  would BE `isolate-node` under another name, and the door refuses to fork the fence).
  `dropQueued: "drop" | "keep"` (closed-vocab STRING on the wire — no boolean ArgWireType arm —
  stored boolean in the book): `drop` walks the node's ENTIRE waiting queue (including this tick's
  joins) through the EXISTED hard-ceiling shed channel every in-window tick via new
  `defaultServeStep` §(c′) — byte-for-byte the §(d) shape, so flushed units ride the R8 F-2
  terminal PRESET branch (`outcome:<unitId>`, kind bounced) — ZERO new event kinds, ZERO dice;
  `keep` is the pure fence (the legibility ladder: throttle-partial < keep-fence < drop-flush ≤
  isolate). §(b) releases run FIRST — completion-before-purge; occupied arms are never evicted;
  **true kill-in-flight is DEFERRED** (wedge-state rationale docblocked in `pipeline/restart.ts`).
  The field is NAMED `dropQueued`, not the brief's `dropInFlight`, per the intentional-naming law:
  in-flight is exactly the work this verb does NOT evict.
- Both verbs: occupancy **1** / handCost **1**, COMMIT class (Act-row one-click; §7.5's "restart a
  service **20s**" prices the tap) — PROVISIONAL taste (post-ratify new numeric, 2026-10-17),
  register #10. Refusal census **44 → 45 → 46** (`bad-cut-slots`, `bad-drop-mode` — `unknown-node`
  is now an ELEVEN-verb code), the door suite MACHINE-PINS the count: a source-regex census over
  `intent-door.ts` == 46, red on drift. GameState gains `throttle?`/`restart?` tail books,
  digest blocks chained after isolate's (sparse-embed law), driver presence-gated — off-path hosts
  byte-ident.

**#6 — COPY-VOICE RATIFICATION BATCH.** @`18c3f6a` retires the last label-bearing identifiers in
the proto: `PROVISIONAL_FALLBACK_VOICES` → **`RATIFIED_FALLBACK_VOICES`** (`gates/g5/noticeSurface.ts`)
and `PROVISIONAL_NOTE` → **`RATIFIED_NOTE`** + `ratifiedNote()` (`lab/unattendedLab.ts`) — the
STRINGS themselves have read RATIFIED since @`4c6f827`; only the identifiers still wore the retired
label. Zero value changes; proto re-pinned count-exact. This discharges the copy-voice residue that
ADR-0015 #1 EXPRESSLY excluded from its sweep.

**#7 — THE THIRTEENTH TYPE: `official:observability` CLAIMS DIAGNOSE.** @`9e9f377` ships the
"Who Watches" / "Cardinality" card on **Diagnose** through the **ADR-0014 #D1(i)
prose-implication bless** — the first card claiming an ORIGINAL invariant verb that way (owner
authoring-time confirm 2026-10-17; no §1.3 card spells the word; grounding rides four verbatim
anchors: :27179 diagnosis-is-gameplay, :2653-2654 the flatline riddle, :2657 the fog vendor, :5059
Portable Skill). The invariant-six law is UNTOUCHED (Diagnose was always one of the six — this is a
CLAIM, not a roster event; no loader lint amendment; #D1(i) consumed, not extended). Notable
firsts: the **first shipped type with NO §0.3 scarcity row** — the card's own four-axis lines carry
unit/scarce/fatal/customer and no table row is forged (recorded absence; the MODULE-STATUS verb
wall carries the ledger); the **second Resident visitor** (after exchange-colo); hooks 5/9 exactly
the dbaas set (R15/R16/R17/R22/R23), R23 shipping an honest engine-gap note (this card drops
DATA; the engine sheds requests). After it the roster is **EXHAUSTED at thirteen**: 6 invariant +
7 extended verbs ALL claimed — a fourteenth type is a FRESH OWNER LAW CALL (verb-merge candidates
remain; §1.9 "never a seventh verb" and #D1(iii) MERGE untouched).

**#8 — MECHANIC A: THE RELATIONSHIP LEDGER (negotiation depth with memory).** @`5e8ce75` makes the
colo card's "tone options and a relationship meter" real (`economy/relationship.ts`): per-tenant
signed trust on the priceKey grammar `<kind>:<id>` — the SAME key the cliff resolves through —
never the company pool. **Table-first law** (what keeps no-book hosts byte-identical): the meter
OPENS at the negotiation table (a booked encounter or a prior row); cliff/dunning/payment/churn
facts thereafter MAINTAIN the file that exists; a tenant never talked to has no file — its renewals
and write-offs move the COMPANY pool but never materialize this key. **R9 double-charge is the
law, not an accident:** for an engaged tenant a write-off costs the pool AND the row. The trust leg
composes at the cliff through the existing consumption clamp: the goodwill-recovery posture HOLDS
(≤ 1.0 — a rapport buys leverage, never certainty; the elasticity ceiling mirrored) AND the ledger
adds the DOWNWARD leg (trust is signed — a burned tenant sinks BELOW the bare arm). 11 config
deltas (§1.3-cited: rapport +25 / firm +10 / legal −15 / renewed +50 / lapsed −80 / dunning-stage
−100 / recovered +50 / written-off −400 / voluntary-churn −200 bps, band ±1_000) PROVISIONAL,
register #10; zero new RNG streams (the source-grep no-dice pin), the single cliff draw UNTOUCHED
in count; `negotiationRetentionFactorBps`'s 3-arg behavior EXACT (its unit goldens never move —
the negotiate-era digest identities SURVIVED unaided, table-first proven). The WARCT valuation leg
the card ALSO names stays a DEFERRED owner ask (fresh-ask register), and the Enforce-ladder rungs
reserve their `RelationshipEventKind` slots rather than inventing placeholders for facts the engine
cannot yet see.

**#9 — MECHANIC B: SELL ACCEPTANCE DICE.** @`24f90bc` answers the question @`a760771` deferred
("the executed intent IS the close — the refusal grammar is the counterparty"): the counterparty
now has an OPINION. New fold step **5.5** (between the cliffs and the invoice calendar) adjudicates
the forwarded `GameState.sell` book (`economy/sell.ts`): market rate resolves by ANCHOR AUTHORITY
— host catalog → the key's own lowest-MRC contract → unadjudicated-NO-ROLL (never an invented
rate); ONE roll per fresh adjudication on the NEW `economy/sell` stream domain (no existing
stream's slot sequence moves); a persisted FINGERPRINT means replays never re-roll and an AMENDED
offer re-rolls at the new minute. Verdicts book **NO money**: cash, entries, events and
observedWrites are byte-equal under BOTH arms (the door's cash-untouched law survives the fold).
Notices `sell-accepted`/`sell-refused` join the union (29 → **31**, machine-census'd),
REPUTATION-NEUTRAL by explicit null arms at 12.5 — the v0 posture until a market-trust model
exists. `acceptCeilingBps` **9_500 < BPS_DEN makes "a sale is never certain" a TWO-DOMAIN law**
(the ADR-0014 #D4 retention asymmetry, mirrored); `acceptFloorBps` makes it never hopeless; the
five sell numerics PROVISIONAL, register #10. The door still moves no money and the part-1 host-
signs-through-priceKey path stands — the dice decide WHETHER the market takes the offer, closing
only host-side.

**#10 — THE NEW PROVISIONAL REGISTER** (this ADR discharges the "PROVISIONAL (ADR-0015 follow-up
taste numeric)" label grammar the session-7 lanes used for post-ratify numerics; all listed sites
carry that exact label; ratify-on-playtest is the default disposition):

- **Sell acceptance ×5** (`economy/config.ts` `DEFAULT_SELL_CONFIG`): `acceptBaseBps` 7_500 ·
  `acceptCoefficientBps` 15_000 (150 % out-of-band leverage — harsher than the 150/80/50 family
  because the counterparty walks away WHOLE) · `acceptDeadBandBps` 1_000 · `acceptFloorBps` 1_000
  · `acceptCeilingBps` 9_500 — @`24f90bc`.
- **Warmth rate ×1** (`DEFAULT_WARMTH_CONFIG`): 25 Mµ$/slot/month — @`1efe12a`.
- **Relationship deltas ×11** (`DEFAULT_RELATIONSHIP_CONFIG`): the nine §1.3-cited bps deltas +
  the ±1_000 trust band — @`5e8ce75`.
- **Throttle/Restart door rows** (`intent-door.ts`): occupancy 1 / handCost 1 each, COMMIT class —
  @`81b0589`/`fd91138` (the isolate/shield siblings already carry the same tag).
- **Transport taste rows** (`tools/transport`): log-budget ceilings, delay/permutation knob ranges,
  catch-up page size — @`0da14b8`.
- (Adjacent, its OWN grammar: `AFFIX_COST_MULTIPLIER_BPS`'s 17 values — `PROVISIONAL (2026-10-17,
  owner ratify-on-playtest)`, pinned in the API-REFERENCE versus row.)

Changing any register value is an owner decision event, not a tuning tweak — the ADR-0015 #1
discipline, extended to the wave-21 additions.

## Consequences

- **What became law:** the RATIFIED-B stamp grammar + validator tolerance law; the six versus
  design resolutions (deck-v2 wire shape, affix fold semantics, pool-band-as-advisory, feint
  budget, tie law, key-space/attribution floors); the transport frame's idempotence/authority/
  zero-timer laws + the conformance body every carrier must pass; the warmth month-cursor identity
  law; the throttle-is-a-clamp and restart-is-bounded door laws (fence-not-forked, completion-
  before-purge, dropQueued naming); the table-first + R9 relationship laws; the sell anchor-
  authority + never-certain two-domain laws; the 18-verb enum and the machine-pinned census 46.
- **What became easier:** a future transport lane plugs in rather than designs — socket twin =
  `TransportPort` + conformance run; decks with affixes now MEAN something, and a broken-feint
  deck dies at draft legality, not mid-match; the thirteenth type proved #D1(i) is a real route —
  an invariant verb can be claimed from card prose with an authoring-time confirm, no roster
  surgery; the Act row is whole, so §7.16 needs no more successors.
- **What stays hard:** the FOURTEENTH type (roster EXHAUSTED — fresh law call; repeat-law cards
  GPU/HPC/satellite→Schedule and CI/build-farm→isolate-merge remain the named candidates); the
  production transport carrier (PHP/Workerman, latency, per-seat fog, paging policy); the HUD
  affordances for the three new books (isolate/throttle/restart Act-row chips, utilization-donut
  fence/clamp render, warmth meter); WARCT valuation; kill-in-flight (wedge-state); slug-12's
  maintenance-window consumer; the coverage-strength affix leg; the driver re-mint attribution
  ticket; OD-10/OD-12 absolute readability numerics (harness owed).
- **Kept unchanged:** ADR-0005 (per-tier frame — the 13-verb claim ledger rides it); the zero-
  golden battery (wave 21 moved NO digest hex — `b0162ab5`/`a9b4b7b8` parity HELD, money goldens
  byte-safe, every chain re-ran green at `24f90bc`); the §1.9 six-verb line; the additive-only
  protocol-v1 law (PROTOCOL_VERSION stays 1 through the observability rider); #D1(iii) MERGE
  forbidden; the proto's door-decoupling laws.

## Source

Owner ruling m-lane session 7, 2026-10-17 ("keep going with all of this, go with recommendations,
MAX feature" across all five agenda threads). Build lanes: `caa4d17` (#1 stamps) · `0ae760b`
(#2 decisions 1/2-prep) · `eb4b86a` (#2 decisions 2–6) · `0da14b8`+`88f9c30` (#3 transport +
relay rider) · `1efe12a` (#4 warmth) · `81b0589`+`fd91138` (#5 successors) · `18c3f6a` (#6
copy-voice) · `9e9f377`+`bf45f03` (#7 type-13 + proto riders) · `5e8ce75` (#8 relationship) ·
`24f90bc` (#9 sell). Registers: `docs/DECISIONS-PENDING.md` (session-7 block, verb-wall row →
roster EXHAUSTED, fresh-ask register); `docs/MODULE-STATUS.md` (verb/transport/versus/stamp
rows); `docs/API-REFERENCE.md` (CLOSEOUT-WAVE-21 pass, api-verify 1,682). Prior records:
`docs/adr/0015-owner-rulings-session-6.md`, `docs/adr/0014-owner-rulings-session-4.md`,
`docs/adr/0013-owner-rulings-session-3.md`, `docs/adr/0009-owner-ratifications-calibration.md`,
`docs/adr/0004-async-versus-and-coop-law.md`. Spec headings: `hosting_game.md` §1.3 "Who Watches" /
"The Cellar" / "Amps and Aisles" / "Cold Start" / "Microsecond Cathedral"; §1.9 invariant verbs;
§7.16 Act row; §2.13 affixes; §2.24 pool band. Code anchors: `types.ts` `PlayerVerb` (18);
`pipeline/intent-door.ts` (census 46, `throttle`/`restart` books); `pipeline/{throttle,restart}.ts`;
`pipeline/defaults.ts` §(c)/§(c′); `economy/{relationship,sell}.ts`; `economy/config.ts`
(`DEFAULT_{SELL,WARMTH,RELATIONSHIP}_CONFIG`); `versus/affixes.ts`; `tools/transport/src/`;
`packages/content/script/validate.mjs` (`TUNING_RE`).
