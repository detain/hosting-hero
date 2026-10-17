# ADR-0015 — Owner session-6 rulings (2026-10-16): the named PROVISIONAL numerics set is RATIFIED, every tier-extension verb gets a real door mechanic (Scale / Maintain + Schedule / Sell / Negotiate), the verb roster extends with Isolate for the twelfth type (`official:dbaas` "The Cellar") — the door verb lands WITH its engine consumer the same wave — and the co-op relay's four wire-mechanics (R1–R4) land in-repo

## Status
**Accepted (2026-10-16)** — owner ruling, session 6, answering the wave-20 program (twelfth-type
law call + door mechanics for all tier verbs + in-repo relay wire-mechanics + ratify-the-numerics
without a playtest gate) with "do them all". This record is authored at closeout AFTER the build
lanes landed — every decision below is cited to its commit, and all numbers are disk-verified
(`4c6f827` flipped **73** label sites across 30 files, +180/−149; the `PlayerVerb` enum carries
**16** values at `86cff89`). Cross-references: ADR-0013 (session 3), ADR-0014 (session 4 —
#D1/#D2/#D4/#D6 are what this ADR extends, amends, or discharges), ADR-0005 (the per-tier-verb
frame everything rides without reopening), ADR-0009 (the calibration wave).

## Context

Session 4 (ADR-0014) ratified the named constant sets (#D4), authorized the Shield-first door
extension (#D2), hardened the co-op relay seat-laws (#D6 rider), and left three honest tails:
the **broader OD-2 economy-taste pile** — plus a few observers #D4's precision clause never
reached — stayed `PROVISIONAL` by design; the **tier-extension verbs had no mechanics** —
Scale/Maintain/Schedule/Sell/Negotiate were card identity and design posture only, `shield-node`
the lone built door leg; and the relay owed its **four wire-mechanics debts** (seq policy,
payload opacity until the door, the O(n²) append self-check, paged catch-up) to its transport
lane. Session 5 closed the tenth and eleventh types (colo/Negotiate @`9bb86f4`,
backup-archival/Schedule @`6c0e074`), fully spending the #D1 blessed pair, and stopped at the wall
#D1 predicted: a twelfth type needs a card grounding a claimable verb **or a fresh owner law
call**. The §1.3 DBaaS card "The Cellar" grounds one — "Verb: isolate and throttle. The boss is a
split brain." — but `isolate` is on neither roster: §1.9's six invariant verbs are untouched
territory ("never a seventh verb") and the loader's extended set stopped at six. Session 6 rules
on all of it at once: extend the roster, build every mechanic, land the wire-mechanics, ratify
the numerics.

## Decision

**#1 — RATIFY THE NUMERICS SET** (extends ADR-0014 #D4 to the pile it deliberately left out).
The sweep @`4c6f827` relabels **73** `PROVISIONAL` taste markers
`RATIFIED 2026-10-16 (ADR-0015 #1)` — comment/JSON-copy only, zero machine values moved — across
the named families: the **economy config pile** (`economy/config.ts` and its consumers — calendar
roll, dunning ladder shapes, churn floors, error-budget midpoints, AR-tray, runway, reputation
deltas, postmortem incl. `maxAttributableChanges`, which #D4's precision clause excluded), the
**§7.7 recovery observers** (`economy/recovery.ts`, `pipeline/recovery/tracker.ts` — the
advisory-half #D4's named list missed), **unattended** guardrails/fast-forward halt thresholds,
the `internal/tickFold` money fold and its `pipeline/corruption.ts` twins, the **proto scenario
numerics** (`waveRules.ts` incident-side umbrellas — the ratified 8:1 oversell row itself was
already #D4 — `simCoreRunner.ts`, the pricing-dial legends, `recoveryWatch.ts`, `alertStack.ts`),
the **lab legends**, and the g5-quarter mirror-fixture riders. Any lane that later changes one of
these numbers is making a law change requiring an owner decision event, not a tuning tweak.
Grandfather-WINS billing order, the retention-floor 0.1× asymmetry, and the oversell-ratio 8:1
were #D4 law already — this bullet does not re-ratify them, it retires the labels #D4 left.
>
> **EXPRESSLY NOT in the set** (each stays PROVISIONAL/gated by its own row): the
> `PROVISIONAL-B` **wire stamps** — 39 `"tuningSheet": "PROVISIONAL-B"` field sites across ALL
> TWELVE bundles (the MODULE-STATUS row said 4 sites/shared-web; disk truth at closeout: the
> stamp rode every type bundle authored since) — owed an owner re-author that must move the
> validator enum in the same commit; the **copy-voice batch** (notice/pack prose); **audio
> envelope audition** (owner-audition taste); **substrate taste rows ×4**; the **7,000 t/s**
> headless bench budget target; **tuning sheets A and C** (B remains the ACTIVE sheet); the
> **versus-deck design laws** (weightBps==cost, affix inertness, deck-pool size — a SEPARATE
> owner ask, not swept); and the **readability pixel-legibility / 60-seconds-unread / 40-per-glyph
> NUMERICS** — #D3's RELATIVE law stands ratified, the absolute figures stay deferred pending a
> measurement harness (OD-10/OD-12).

**#2 — DOOR MECHANICS AUTHORIZED: the five tier-extension verbs get real mechanics.** Each enters
the closed `PlayerVerb` enum with full door grammar (per-verb arg-shape parsing, refusal
vocabulary, hands/occupancy the existing eight carry) and one engine consumer; the door writes a
BOOK, an engine fold reads it, and absent books are byte-identical (the Shield precedent @`d3b1db3`
is the template). All four mechanic lanes landed inside wave 20:

- **Scale ↔ reserved warmth** — `scale-node` (11th verb) @`8037a4f`: books `GameState.scale`
  pre-arm roster anchors (4-field entry; the `baseRosterSlots` anchor chain-inherits across
  amendments); warmth materializes at the step-5/6 SERVE-INPUT capacity read, chained AFTER the
  recovery throttle, `max(baseRosterSlots + reservedSlots, occupiedFloor)`; a booking made during
  an open recovery window is DEFERRED until the window closes (the board-drift law). The warmth
  COST stays host-side — the door only writes the book.
- **Maintain ↔ attendance / Schedule ↔ deadline** — `maintain-node` (12th) + `schedule-window`
  (13th) @`5987ef1`: step-9 folds — a booked attendance vetoes the abandonment-die roll for the
  node (all patience modes), an armed job-window band REPLACES the deadline law inside its band;
  precedence is attendance > calendar. Maintain pays the ATTENDANCE class (2 ticks), Schedule the
  TAP class (1 tick) — the 26-hour-disaster law demands cheap re-arm.
- **Sell ↔ offer book** — `sell-offer` (14th) @`a760771`: part-1 posture, the adjust-price
  precedent verbatim — the door writes `GameState.sell` keyed through the EXISTING
  `priceOverrideKey` codec (reused by identity, drift-pinned against both the door's
  `PRICE_TARGET_KINDS` and economy `PRICE_KEY_KINDS`); NO new fold — the sale closes host-side
  through the ratified economy priceKey seam; the LIVE driver witness pins cash buckets byte-
  identical armed vs unarmed.
- **Negotiate ↔ tone/concession/term-extension** — `negotiate-terms` (15th) @`b70900e`: books
  `GameState.negotiate`, consumed at the renewal CLIFF by `economy/negotiate.ts` — tone+concession
  retention bumps tilt the cliff's EXISTING single draw (ZERO new rolls), clamped ≤ 1.0: the talk
  restores goodwill your own pricing took, never lifts authored retention; concessions discount the
  billed base at the override-chain head — grandfather still WINS (#D4); `termMonthsExtension`
  rolls the renewed term; the gives-the-cycle-away ledger guard (a zero-gross invoice skips the
  post and advances the cycle). Forwarding rides `EconomyTickIn.negotiations` through the
  single-home `tickFold`. The bigint-or-null wire arm landed here (door M2 parser + proto
  `NULLABLE_BIGINT_ARG_FIELDS` revival + scenario mirror, three-way pinned).

All post-ratify new numerics (the six verbs' occupancy/hand-cost rows) carry the `PROVISIONAL
taste (post-ratify new numeric, 2026-10-16)` tag — the closeout unified the scale/maintain/
schedule rows that shipped untagged (wave-20 review MINOR). Refusal census: 42 official after
`b70900e`; the Isolate door @`86cff89` takes the final state to 44 (40 grep-unique).

**#3 — ROSTER EXTENSION: Isolate (the twelfth type).**

- **`isolate` joins `TIER_EXTENDED_VERBS`** (7th extended verb) @`7f47563`, grounded VERBATIM in
  the §1.3 DBaaS card — "Verb: isolate and throttle. The boss is a split brain." — and the §7.16
  Act-row law ("an 'Act' row of at most four one-click emergency verbs… drain, restart, isolate,
  shed"). This AMENDS the §1.9 "never a seventh verb" line and the §7.8 eight-verb corollary in
  the same motion ADR-0014 #D1 amended the roster inside ADR-0005's already-ratified per-tier
  frame — no ADR-0005 reopen, the invariant six untouched, pairwise MERGE (D1(iii)) untouched.
- **`official:dbaas` is the 12th type** @`5956b8f` (census pins + README ledger @`2b216b0`; proto
  riders — packStore registration, corpus wire-join, flavour pool re-roll @`732fb66`;
  PROTOCOL_VERSION stays 1 under the additive-only law).
- **`isolate-node` (16th verb) @`86cff89` is the first tier-extension verb to land WITH its
  engine consumer the same wave**: the step-5 ADMISSION-BLOCK fence — an isolated node admits
  zero new work while in-flight/queued/shed state is untouched; the FENCE BEATS WARMTH (booked
  reserved slots answer zero while fenced); with the recovery throttle it composes as
  min-of-clamps; half-open `[effectiveAt, releasedAt)` as-of law. (Review deviation disclosed at
  landing: the fence blocks at R1 admission, not as a capacity derate — verified the 0-new-slots
  law.) "throttle", the card's own paired verb, stays OFF the roster per #D2's one-verb-per-
  mechanic law and rides the engine's automatic recovery clamp / shed ladder as a named successor.
- After this ruling the extended roster is Shield/Scale/Maintain/Schedule/Sell/Negotiate/Isolate —
  all seven BUILT as door verbs with mechanics. **Diagnose remains the sole unclaimed invariant**
  with no §1.3 card naming it; a thirteenth type is a fresh owner law call (MODULE-STATUS
  verb-wall row).

**#4 — CO-OP RELAY WIRE-MECHANICS LAND IN-REPO.** @`5b0d401` discharges the four debts ADR-0014
#D6's rider recorded as the transport lane's opening bill, under the owner's delegation to
resolve them in-repo first: **R1** lifetime-monotonic seq numbering — the hub stamps one global
strictly-increasing stream, per-seat streams are its participantId subsequences (refused submits
consume nothing), so cross-seat `(tick, seq)` tie-free-ness is BY CONSTRUCTION and the door's M4
dup-throw stays unreachable; **R2** payload opacity until the door — the hub parses only
structure + the closed `PLAYER_VERBS` enum, `args` passes byte-identical (submitted reference),
the door's `parseEntry` (M2) is the SOLE arg-parsing authority; **R3** O(1) append self-check —
`assertRelayAppendStep` validates previous-vs-next only (whole-log scan kept as the ×100 tripwire),
retiring the O(n²)-per-run scan; **R4** paged catch-up — pure `pageCoopLog` window +
`autoCatchUpOnJoin`, dup-never-twice through `orderCoopTimeline`, ZERO save writes. Relay suite
27 → **42 tests**. What remains out-of-repo is the PHP/Workerman transport itself (sockets,
latency, per-seat fog, paging POLICY) — unchanged by OD-5(b); the transport now inherits LAWS
pinned here instead of inventing them.

## Consequences

- **What became law:** the 73 swept numerics (changing one = owner decision event); the six tier
  mechanics' door vocabulary, arg shapes, and refusal grammar; the fence-beats-warmth and
  min-of-clamps composition laws; the R1–R4 wire laws.
- **What became easier:** the twelfth type shipped end-to-end (card → lint → door → consumer →
  proto wire) in ONE wave; the transport lane has a pinned contract; the readability ⚠️ needed
  nothing here (#D3's relative law stands; only its absolute NUMERICS remain deferred).
- **What stays hard:** Diagnose unclaimed (thirteenth type = owner call); throttle/restart/
  expire/reclaim off-roster until blessed one at a time; the `PROVISIONAL-B` wire markers until
  the owner re-author sweep; versus-deck design laws as their own ask; #D1(iii) MERGE stays
  forbidden.
- **Kept unchanged:** ADR-0005 (no reopen — #3 works inside its frame); ADR-0014 #D1(i)
  Diagnose-bless route (still open); ADR-0013 rulings except where #1 supersedes the remaining
  confirmed-provisional posture; OD-5(b) Workerman transport law; protocol-v1 additive-only law;
  the zero-golden battery (wave 20 moved NO digest hex — every chain re-ran green at `86cff89`).

## Source

Owner ruling m-lane session 6, 2026-10-16 (wave-20 program ratified: roster extension + door
mechanics + relay wire-mechanics + ratify-numerics, no playtest gate). Build lanes: `5b0d401`
(relay R1–R4) · `7f47563` (loader lint) · `4c6f827` (#1 sweep) · `5956b8f`+`2b216b0` (DBaaS
card + pins) · `8037a4f` (Scale) · `732fb66` (proto riders) · `5987ef1` (Maintain+Schedule) ·
`a760771` (Sell) · `b70900e` (Negotiate) · `86cff89` (Isolate + consumer). Registers:
`docs/DECISIONS-PENDING.md` (session-6 block, OD-2 residue CLOSED, OD-10/OD-12 amendment,
verb-wall row); `docs/MODULE-STATUS.md` (verb-wall / mechanics / ratify-sweep / wire-stamp /
relay rows). Prior records: `docs/adr/0013-owner-rulings-session-3.md`,
`docs/adr/0014-owner-rulings-session-4.md`, `docs/adr/0005-one-engine-seven-tiers.md`,
`docs/adr/0009-owner-ratifications-calibration.md`. Spec headings: `hosting_game.md` §1.3
"The Cellar" / "Cold Start" / "Trunk Group" / "Microsecond Cathedral" / "Amps and Aisles" /
"Restore Point"; §1.9 invariant verbs; §7.8 hooks + incident-mode vocabulary; §7.16 two-action
rule. Code anchors: `types.ts` `PlayerVerb` (16) / `GameState.{scale,maintain,schedule,sell,
negotiate,isolation}?`; `pipeline/intent-door.ts` occupancy+cost tables; `pipeline/defaults.ts`
(warmth/attendance/deadline folds); `pipeline/isolation.ts` (fence); `pipeline/driver.ts`
(presence gates); `economy/negotiate.ts` + `economy/tick.ts` (cliff fold); `loader/lint.ts`
`TIER_EXTENDED_VERBS` (7); `tools/relay/src/relay.ts` (R1–R4); `apps/proto/src/i18n/packStore.ts`
(12 packs, 844 templates).
