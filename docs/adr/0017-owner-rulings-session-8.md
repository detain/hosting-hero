# ADR-0017 — Owner session-8 rulings (2026-10-17): the fourteenth type claims the eighth extended word — `official:ci-build-farm` on **Reclaim**, the first card founded on §1.4 — the co-op transport is ADOPTED in-repo (browser client + dev carrier host, production PHP carrier unchanged), the driver's re-mint attribution gap closes with `reentry` events collapsing the versus floor to zero, the coverage affix-leg ships as §2.13's second leg, and the reclaim door-spine lands with the refusal census UNMOVED at 46 — the first tier verb to add zero new refusal phrases

## Status
**Accepted (2026-10-17)** — owner ruling, session 8, answering the wave-21 fresh-ask register
(eleven items) with "go with recommendations on each of those … max feature/functionality."
This record is authored at closeout AFTER the build lanes landed — every decision below is
cited to its commit and all numbers are disk-verified (the `PlayerVerb` enum carries **19**
values at `c317efd`; the refusal census is **46**, machine-pinned and UNMOVED by the newest
verb; api-verify PASSes at **1,693** names; the full serial battery stands at **169 files /
3,199 tests**). The split ratify that rode this wave — game-balance numerics RATIFIED,
transport caps STAND — is recorded in its natural home, **ADR-0016 #11** (amended in-place by
`e2a1bba`), and deliberately has NO bullet here. Cross-references: ADR-0016 (session 7 — #11
is this wave's ratify, its #10 register is what #3 below GROWS, its transport frame is what
#4 adopts, its attribution ticket is what #5 closes), ADR-0015 (session 6 — the door-mechanics
frame #3 continues, the Act-row pricing #3 rides), ADR-0014 (session 4 — #D1(iii) repeat/merge
law, #D2 door-extension route), ADR-0013 (session 3 — the read-time expiry law #1 leans on).

## Context

Session 7 (ADR-0016) exhausted the verb roster at thirteen types and closed with a wall of
eleven fresh owner asks: the fourteenth-card law call, per-tenant relationship/Sell/warmth
follow-ups, the co-op transport carrier decision, versus deck design-law residues, the
coverage-strength affix leg, the driver re-mint attribution ticket, HUD affordances for the
new books, the deferred mechanics (WARCT, in-flight-kill, slug-12 consumer), and the
render-harness readability numerics. The owner's session-8 answer was a blanket
max-feature recommendation approval. Five of the eleven items required a LAW decision —
they are the five bullets below. The rest were mechanically drivable and shipped as riders
inside those lanes (the §7.16 Act-row HUD at `a28e764` rides #3's register; the flavour-pool
collision fix at `c317efd` rode #1's card riders). One item — the absolute readability
numerics — stays explicitly deferred: it needs a render harness that does not exist yet.

Two firsts define this wave's shape, both blessed by #1's convention leg: the fourteenth
card is founded directly on a **§1.4** card ("Green Light" / "Untrusted Code, By Design")
because no §1.3 hosting-type table hosts it — and its door mechanic (`reclaim-node`,
`c8b92a2`) shipped BEFORE its content card (`a47a9b5`), the first door-before-card landing in
the program. The order was a scheduling accident the review upheld: the lint roster amendment
(`ff8615c`) is what makes the card legal, so spine-then-card is the dependency-correct flow.

## Decision

**#1 — The verb roster takes an EIGHTH extended word: `reclaim` (fifth amendment), and the
§1.4-as-card-home convention is blessed with recorded absences; `expire` stays off-roster.**
The CI/build-farm card's verb line (§1.4, `hosting_game.md` "Green Light") reads "Verb:
isolate, expire, reclaim." — `isolate` was spent on `official:dbaas` at `5956b8f`, and the
owner blesses its third word, `reclaim`, VERBATIM, as the card's dominant verb. The second
word, `expire`, is expressly NOT blessed: the engine's read-time expiry law (ADR-0013 #14 —
every as-of fold already auto-lapses bookings whose effective minute has passed, for free)
means a door verb named "expire" would double-name an existing mechanic rather than express
a missing one. Reclaim is distinct: collecting a live booking early is an action the engine
could not express at all.
> The §1.4 convention leg: a type may be founded on a §1.4 idea-card when no §1.3 card
> hosts it, and the recording duties follow the card's actual shape — the §0.3 type-table
> row and the §6.6 lattice row are ABSENT from the document for this type, and that absence
> is RECORDED (in `packages/content/README.md` and the card's `_todo`), never forged.
> Landed by `ff8615c` (lint `TIER_EXTENDED_VERBS` + machine pins) and `a47a9b5` (the bundle).

**#2 — The coverage affix-leg ships: §2.13's "each mix-in invalidates exactly one defense
role" gets its second engine leg** — the first was the versus wave-semantics leg
(`versus/affixes.ts` @`eb4b86a`), this is the defense-GRID leg. Five column affixes
nullify exactly one grid column each, per the doc's own rows: `distributed`→**Meter**,
`encrypted`→**Classify**, `low-slow`→**Detect**, `adaptive`→**Deter**, `piggyback`→
**Absorb**. The remaining eleven of the sixteen slugs are HONEST NULLS, not filler: three
doc rows name defenses outside the grid (`timed`→staffed response, `rate-shaped`→any fixed
threshold — the doc CONTRADICTS a grid column here, recorded not papered — and `two-stage`
→**Hands**, an attention concept the coverage grid does not own), and eight slugs have no
mapping line in the doc at all. The table is `AFFIX_COVERAGE_NULLIFIES` in
`packages/sim-core/src/coverage/affixLegs.ts`, drift-pinned as a mirror of versus
`AFFIX_VOCABULARY` by source-read — zero import edge from `coverage/` to `versus/`, the
categorical column pin-ZERO contributors kept byte-faithful. +53 tests. Landed by `2b63795`.

**#3 — The reclaim door-spine lands with the refusal census UNMOVED at 46 — the first tier
verb to add ZERO new refusal phrases — and the PROVISIONAL taste register grows.**
`reclaim-node` is the 19th `PlayerVerb` (COMMIT class, one hand/tick). The engine law: a
booked reclaim tombstones the node's booking book, and EVERY downstream read voids bookings
whose `shippedAtTick <=` the tombstone — six sites (scale warmth, isolate fence, throttle
cut, restart window, maintain band, schedule band). The tombstone never expires; amendments
are its only motion. Three exclusions are PINNED as law, not oversight: `shield` (protection
is not capacity — a shielded node's bookings are nobody's stale debt), `recovery` (the engine
owns its own window authority), and the `priceKey` books (spot-eviction of price overrides is
the NAMED FUTURE that needs a contract→capacity bridge before it can mean anything — the
do-not-force note is verbatim in code). The guard trio is the shield trio reused verbatim,
which is why the census stands at 46.
> The #10-register GROWS (this is the ruling's ledger half): reclaim occupancy/hand costs
> **1/1 PROVISIONAL** — the wave-21 balance register CLOSED at `e2a1bba` BEFORE this verb
> existed, so its numerics re-enter as PROVISIONAL honestly; plus the §7.16 Act-row rider
> `a28e764`: `RESTART_WINDOW_MINUTES = 5` PROVISIONAL, the lift-at-next-boundary desk
> ergonomics PROVISIONAL, and the row's honesty gaps (warmth readout is a view not a meter;
> canvas inspector deferred — the row is player-facing in the LAB stepper, not the world
> canvas). Landed by `c8b92a2` (67 tests) + `a28e764` (33 its).

**#4 — The co-op transport is ADOPTED in-repo: a browser seat client plus a thin Node dev
carrier over the wave-21 frame — the production PHP/Workerman carrier decision is UNCHANGED.**
The topology is the ratified portable-lib option (b): the hub RELAYS the stamped intent log
only — every seat runs its own local sim from that log and they converge; there is no
authoritative server sim. `tools/host` (ws 8.22.0, pure JS, 14 tests) closes the carrier at
`maxPayload = MAX_FRAME_BYTES` with WebSocket close code 1009 rather than buffering a giant
frame; the browser `wsClientPort` honors all seven interface truths the transport conformance
suite defines (including CLIENT-APPLIES-ONLY-ON-DRAIN), real network latency enters the sim
ONLY as hub-acceptance tick stamps (never as wall-clock), and client idempotence —
absorb-identical, fatal-divergent — is proven over REAL sockets, not stubs. The boot seed
`904n` is a CONVENTION shared by hub and seats for local-spike determinism, not a protocol
field. The dev carrier is localhost-no-auth by ruling; production authentication belongs to
the out-of-repo PHP lane.
> F-1 adoption honesty (review finding, carried so the docs never over-claim): the chrome
> barrel carrying `CoopRoom`/`coopRoomWire` has ZERO app-graph importers yet — the pre-
> adoption posture stands, so "two-browser co-op playable" means the dev host + jsdom
> mount tests, NOT the built app surface. `96bd238`'s commit-body index-size ledger was
> also MISATTRIBUTED (+2.97 kB was actually +2.79 kB of L-DM5 door strings arriving
> earlier via the unattendedLab graph); the true browser-side delta ≈ 0. Landed by
> `af55b61` + `96bd238`.

**#5 — The driver's re-mint attribution gap closes with `reentry` events: the versus
unattributed floor collapses from 1,040×3-seed saturation to ZERO, and every existing digest
stays immune by construction.**
Option D of the attribution ticket: when a retry matures, the driver mints a NEW `SimEvent`
kind — `reentry` (union 11→12) — carrying `{child, retryOf, lineageRoot, retryDepth}` in the
event stream, ordered door < reentry < arrival. It writes ZERO state bytes, so the checkpoint
digests, the replay codecs and the money lane are immune not by argument but by
construction — this wave moved no digest hex anywhere. The versus fold labels matured
re-entries from the new events, collapsing the `unattributed` row to zero across the
three-seed saturation probes; the three floor pins flipped are disclosed, the conservation
invariants are unmoved, and causality's `eventSubject` gained the `reentry` case — storm
lineage tracing came free.
> Deviation recorded honestly: the design's preference law keyed on the `~`-grammar unit id,
> but those ids never reach event streams (the pipeline mints `<tableId>@…` arrival ids); the
> falsification probe caught the vacuous predicate and the landed law prefers
> `direct := <tableId>@` prefix. Truly-viral deaths stay `unattributed` BY DESIGN — the floor
> is gone, not the concept. Landed by `cbf53a4`.

**#6 — GAME-FEEL NUMERICS RATIFIED (owner follow-on ruling 2026-10-17, wave-23 item 4a).** The
owner batch-ratifies the game-feel subset of the standing taste registers NOW; the engineering
caps are not game feel and STAND PROVISIONAL pending real-carrier data — the #11 split posture
survives verbatim. Every ratified site flips its comment label to the one grep-able literal
`RATIFIED 2026-10-17 (ADR-0017 #6)` — a comment/text sweep; machine values are byte-identical
(string-aware strip-comment token diff proves zero code change, the two disclosed test-title
flips excluded by ledger; the full battery re-runs green on the flipped labels alone). The
enumeration, in the registers' own terms:

- **Affix cost multipliers ×18** (`versus/deck.ts` `AFFIX_COST_MULTIPLIER_BPS`): the 17 values
  plus their table umbrella — the `PROVISIONAL (2026-10-17, owner ratify-on-playtest)` grammar
  that #11's STANDS list named by its own exception, retired here.
- **Affix wave deltas ×1 (umbrella)** (`versus/affixes.ts` `AFFIX_WAVE_DELTAS` @`eb4b86a`): the
  shape permilles, window scales, share cut and fold clamps. On-disk honesty: the table shipped
  with NO taste tag on its rows — the I-P V-2 spec values were law from landing — so the
  ratification is stamped once on the table umbrella, not onto fifteen unlabeled rows.
- **Negotiation bumps ×4** (`economy/config.ts` `NegotiationConfig` interface + defaults block):
  rapport 300 · firm 100 · legal 0 · concessionPresence 300 bps — the #11-named survivor
  (`PROVISIONAL (ADR-0015 taste numeric)` grammar, four sites).
- **Coverage mid-band ×1** (`coverage/matrix.ts` `DEFAULT_UNCALIBRATED_STRENGTH` 0.5): the
  "Taste call, OWNER" gate — #11's coverage-row survivor. The 12×9 grid count and the
  6554/26214/55706 ladder are LAWS and were not touched by this bullet.
- **Reclaim door rows ×2** (`pipeline/intent-door.ts`): occupancy 1 / handCost 1 — the pair
  this ADR's #3 registered as post-ratify PROVISIONAL because the #11 sweep (`e2a1bba`) closed
  before the 19th verb existed. Their test header re-pins to the new label (count-neutral).
- **Act-row desk numerics ×2** (`apps/proto/src/chrome/actRow.ts` @`a28e764`):
  `RESTART_WINDOW_MINUTES = 5` (labeled on disk) and the `LIFT_AT_NEXT_MINUTE` boundary
  ergonomics — #3's register names the lift choice PROVISIONAL while its docblock carried no
  tag; the stamp discharges it from register authority, disclosed.
- **Family-law sweep ×2** (`pipeline/defaults.ts`): the Schedule band→sim-time conversion law
  (`jobBandDistanceUs`) and the Maintain absorb-not-prevent choice — the same post-ratify
  grammar as the reclaim pair, found by grep (this is the register law, not just the list).

Total: **30 source sites across 7 files + 4 test sites across 3 files** (two block-comment
headers, two `it()` titles — the wave-20 pricingDial / wave-21 sell-accept precedent for
title flips, disclosed in the commit body). **What STANDS PROVISIONAL (explicit):** the
`tools/transport` caps (`MAX_FRAME_BYTES` 65_536, `DEFAULT_LOG_BUDGET` 10_000, `maxPageSize` 64 —
real-carrier gate), the tuning-sheet A/C letters and their status enum (`waves/pressure.ts` —
OD-2 ratified B, ADR-0009), the legacy `PROVISIONAL-B` content residue (27 waves-slice + 16
registry-core sites — the validator-tolerance law), the audio ducking envelope (audition gate),
the substrate spike taste rows (first-mount gate), the 7,000 t/s bench budget, the motionAudit
programmer-art coverage estimates and the absolute readability numerics (render-harness gate),
the g5 fixture-local money/wave text and `noticeSurface` provisional voices (copy-voice batch),
the decision-rail `DECISION_*` taste consts (outside this sweep's file scope — same playtest
set), `economy/config.ts`'s label-vocabulary legend, and test titles that merely describe
numerics without owning a ratification label (the wave-20/21 skip discipline).
**Label-grammar discharge:** with #6 the ADR-0016 #10/#11 survivor lists are fully
dispositioned — Sell/Warmth/Relationship/door-rows by #11; affix costs, wave deltas,
Negotiation bumps, coverage mid-band, the reclaim pair, the Act-row numerics and the family-law
sweep by this bullet; everything else STANDS under the named gates above. Changing a value
ratified here is a law-change event, never a tuning tweak — the ADR-0015 #1 discipline, unbroken.

## Consequences

- **Landed (wave-22 chain atop `e7d9150`):** `2b63795` #2 · `e2a1bba` ADR-0016 #11 split
  ratify (49 flips, no ADR-0017 bullet) · `ff8615c` + `a47a9b5` #1 · `af55b61` + `96bd238`
  #4 · `c8b92a2` + `a28e764` #3 · `cbf53a4` #5 · `27281fa` + `c317efd` card riders (proto
  corpus/pack registration; the `intern.entry.firstday` divergent-twin collision fixed by
  rename to `intern.entry.board`, values byte-ident — every slot-free flavour twin is
  byte-ident across all fourteen packs again, the divergent-set pin flipped to falsifiable
  empty). The fifteen-card law call, the fifteenth card itself, and the deferred mechanics
  register all stay OPEN — this wave spends nothing that was not named.
- **Owed:** the fifteenth card is a fresh OWNER LAW CALL (all six invariant verbs + all eight
  extended roster words claimed; the named successors that remain off-roster are `expire` —
  ruled against in #1's double-naming argument — throttle/restart, which are door-side
  mechanics off-roster, and failover/roll-back/escalate, which are §7.5 incident-vocabulary
  design-space, not roster candidates); production transport carrier (PHP/Workerman,
  authentication, per-seat fog, paging); chrome barrel app-mount (F-1); warmth-as-meter and
  price-override spot-eviction (#3's named futures); coverage-preview proto leg; OD-10/OD-12
  absolute numerics (render harness owed); WARCT; in-flight-kill wedge; slug-12 consumer.
- **Kept unchanged:** the zero-golden battery (wave 22 moved NO digest hex — parity
  `b0162ab5`/`a9b4b7b8` HELD, money goldens byte-safe); ADR-0016 #11's standing transport
  caps (`65_536` / `10_000` / page `64` stay PROVISIONAL); the §1.9 six-invariant-verb line
  (reclaim is an EXTENDED word — the invariant register is untouched at six); the
  additive-only protocol-v1 law (PROTOCOL_VERSION stayed 1 through the ci-build-farm
  wire-join); #D1(iii) MERGE law (dbaas `isolate` and the ci card's isolate-word were
  analyzed as a merge candidate and NOT merged — reclaim was claimed instead); the proto's
  door-decoupling laws (actRow mints intents through the door grammar only).

## Source

Owner ruling, session 8, 2026-10-17 — "go with recommendations on each of those",
max feature/functionality, across the eleven-item wave-21 fresh-ask register. Build lanes:
`ff8615c` + `a47a9b5` (#1) · `2b63795` (#2) · `c8b92a2` + `a28e764` (#3) · `af55b61` +
`96bd238` (#4) · `cbf53a4` (#5) · `e2a1bba` (ADR-0016 #11 rider) · `27281fa` + `c317efd`
(proto riders + collision cure). Registers: `docs/DECISIONS-PENDING.md` (session-8 block,
verb-wall rows, fresh-ask dispositions); `docs/MODULE-STATUS.md` (door/verb-wall/content/
flavour/coverage/versus rows, new tools/host row, wave-22 footer); `docs/API-REFERENCE.md`
(kept current per-lane; api-verify 1,693 at closeout). Prior records:
`docs/adr/0016-owner-rulings-session-7.md`, `docs/adr/0015-owner-rulings-session-6.md`,
`docs/adr/0014-owner-rulings-session-4.md`, `docs/adr/0013-owner-rulings-session-3.md`.
Spec headings: `hosting_game.md` §1.4 "Green Light" / "Untrusted Code, By Design";
§2.13 mix-ins × defense roles; §1.9 invariant verbs; §7.8 door grammar; §7.16 Act row;
§3.3 patience modes (value-decay first consumer). Code anchors: `loader/lint.ts`
(`TIER_EXTENDED_VERBS`, eight); `types.ts` `PlayerVerb` (19); `pipeline/intent-door.ts`
(census 46, `reclaim` book); `pipeline/reclaim.ts`; `pipeline/defaults.ts` (six void sites);
`coverage/affixLegs.ts`; `versus/{affixes,match}.ts`; `pipeline/driver.ts` (`reentry`);
`tools/host/src/`; `apps/proto/src/transport/wsClientPort.ts`; `apps/proto/src/chrome/
{coopRoomWire,actRow}.ts`; `packages/content/types/ci-build-farm.json`.
