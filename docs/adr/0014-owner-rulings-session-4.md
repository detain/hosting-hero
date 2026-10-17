# ADR-0014 — Owner session-4 rulings (2026-10-16): verb roster amended (Negotiate + Schedule, Diagnose blessable, MERGE stays forbidden), tier verbs become real PlayerVerbs Shield-first, readability becomes a relative law, the named PROVISIONAL constant sets are FULLY RATIFIED with grandfather-WINS as billing law, PackId widens to all type packs, co-op gets an in-repo Node relay spike, `boot.build?` lands, the endless-32 save slice is queued LIVE, `metricNamespaceTier` joins the next loader lane

## Status
**Accepted (2026-10-16)** — owner ruling, session 4, verbatim: "go w/ recomendations for d1, d2, d3,
d6, d9  for D4: a, D5: a and defer d, D7: a, d8: queue the endless save slice,". This lane encodes the
rulings into docs only; the build lanes enumerated under Consequences follow. The sibling R3b lane
sweeps the corresponding `PROVISIONAL` comment labels in `packages/sim-core/src/**` — no code file is
touched by this encoding.

## Context

Session 3 (ADR-0013, `8c0ff88` era) decided every open OD row but left named tails: OD-8's endless-32
save rows stayed contested, and the ratify-on-read pile was confirmed-provisional rather than
ratified. The content waves since then produced the type-9 exchange-colo card (`d4e7863`) and exposed
the **VERB-ROSTER WALL** (all four tier-extension verbs claimed; **Diagnose** is the sole unclaimed
invariant yet no §1.3 card names it; the remaining strong candidates name verbs OFF both rosters —
Negotiate, Schedule — or re-name claimed dominants), and the **no-door-mechanic** gap for tier verbs
(`scale/shield/maintain/sell` are card identity only, absent from the closed eight-verb `PlayerVerb`
enum). Open leftovers on the other side of the tree: the readability ⚠️ (the 2k/20k figures unratified
and unmeasurable on today's perf grid), the closed `PackId` union that keeps nine type packs out of
the flavour pool, the co-op transport leg (relay "stays PHP-side out of repo"), the worker-corpus
row's "no build state rides the wire yet" leftover, and OD-4b's owed `metricNamespaceTier` field.
Session 4 answers all of it in one ruling sweep.

## Decision

**D1 — Tenth-type verb law: ROSTER AMENDMENT.** (ii) `negotiate` + `schedule` are added to
`TIER_EXTENDED_VERBS` in the loader lint — a law change **inside** ADR-0005's already-ratified
per-tier-verb-sets frame (no ADR-0005 reopen, extending ADR-0013 #14's route). Once amended, content
lanes may ship generic colo founded on **Negotiate** and backup/GPU/HPC/satellite founded on
**Schedule**. (i) **Diagnose** may be blessed onto a card whose §1.3 prose implies it (the managed-WP
"read the patient" candidate is the named example) — a card-identity bless, still owner-confirmed at
authoring time. (iii) **re-claim/MERGE stays FORBIDDEN** — a card naming a verb another card holds as
dominant remains a Verb-Shift merge candidate, never a type.
>
> **SPENT 2026-10-16 (session-5 closeout):** both blessed roster verbs now carry cards — **Negotiate**
> on `official:colo` "Amps and Aisles" @`9bb86f4` + **Schedule** on `official:backup-archival`
> "Restore Point" @`6c0e074` (first Schedule-founded card). **Diagnose** remains the sole unclaimed
> invariant with still no §1.3 card naming it — a twelfth type card is a fresh owner law call. Per
> agenda item (c) no tier-verb door mechanics are authorized: Schedule joins Scale/Maintain/Sell/
> Negotiate as card identity only (Shield @`d3b1db3` stays the only built door leg).

**D2 — Tier-extension door mechanic: (c) full `PlayerVerb` enum extension.** One verb per paired
mechanic, taken in mechanics order: **Shield ↔ corruption first** (pre-arm a node against the
corrupts-channel data rot), **Scale ↔ reserved warmth next** (the serverless warm-capacity buy),
Maintain/Sell door mechanics follow their own mechanic designs. **No mapping-table compromise** —
tier verbs do NOT ride existing carriers under a lookup; they enter the closed door enum as their own
verbs, with the usual arg-shape parsing, handler, refusal vocabulary, and hands/board costs the
existing eight carry.

**D3 — Readability: (c) RELATIVE LAW as the standing law.** The unratified absolute figures (2,000
discrete objects / 20,000 in-flight entities at Z3) are **replaced as law** by the relative reading —
legibility is held against the densities the ratified hardware target's measured perf-grid baseline
actually produces — and the absolute figures are **demoted to an aspiration note** in the spec. A
measured perf-grid baseline **must be appended** to this record when the grid is run (build lane
follows; `tools/perf` is the carrier). The ⚠️ marker on the spec heading stays until that measurement
lands — law-note added, marker not flipped, by this encoding.

**D4 — FULL RATIFY NOW of every named PROVISIONAL tuning constant**, superseding session 3's
confirmed-provisional posture (ADR-0013 ruling 12):
- **Death** (`economy/config.ts`): churnFloor **1**, churn-collapse **3 d**, float-insolvency **3 d
  + refused settles**, grace **10 d**.
- **Elasticity** (`economy/elasticity.ts` + config): churn **150 %** / retention **80 %** / recovery
  **50 %** coefficients, **±10 %** dead-band, churn clamp **[0.5×, 3×]**, retention floor **0.1×** —
  the retention-vs-churn **asymmetry is RATIFIED AS DELIBERATE** (cuts buy no certainty; a price drop
  never purchases churn immunity past 0.1×).
- **Recovery** (`pipeline/recovery.ts`): window **12**, ramp **4**, floor **1**, struggle **2**, quiet
  **1**.
- **Attention costs** (`pipeline/attention.ts` `ATTENTION_DEFAULT_COSTS`): Communicate **1**,
  PolicyCardCommit **1** (the shipped opening tax — "ticket-class handling" read onto the deal/commit
  verb per §7.5).
- **Oversell-ratio 8:1** (`OVERSELL_RATIO_MICRO = 8_000_000n`, `apps/proto/src/runner/waveRules.ts`).
- **familyWeights shipped sets** (both bundles; the micro-exact sums as authored).
- **GRANDFATHER-WINS billing order — explicitly RATIFIED AS LAW**: in the invoice base-resolution
  chain (price-override dial → escalator compounding → grandfathered concession → MFN last), a
  **written contract concession outranks the dial** — §6.12 beats §6.5 when they disagree.
Precision: D4 covers the named sets above (the session-3 confirmed-provisional class). The broader
OD-2-family economy taste pile (dunning day-splits, AR-tray midpoints, spiral streaks — MODULE-STATUS
"~40 PROVISIONAL" row) is NOT in the named list and stays its own tuning-pass row.

**D5 — PackId widened NOW.** All **nine type packs** are registered in `apps/proto` `packStore`; the
`PackId` union widens accordingly. The deterministic flavour-feed **re-roll and the pool/era pin
re-cuts are ACCEPTED** — seeded feed sequences re-roll by construction on registration and that is
paid-for, **no pool-version migration rider**. The contextual slot-filling consumer is **DEFERRED BY
OWNER** (ruling "defer d") — the zero-slot law stands until its own lane; the forum-chip honest
disable and the dead-slot law ride unchanged.

**D6 — Co-op transport: in-repo Node relay SPIKE authorized** (tools/-adjacent), riding the landed
`replay/coopTimeline` `(tick, seq)` law and the `save/coop` seat ledger — server-side stamping, seat
join/leave delivery, re-join-as-new-row, per-seat projection. **PHP/Workerman stays the
service-transport choice per OD-5(b) — the spike does not reopen it**; it is a portable-library proof
of the relay contract, not the shipped transport.
>
> **HARDENED 2026-10-16 (session-5 owner ruling, agenda item (e)):** spike → in-repo laws — the
> spike's four law frictions were resolved IN-REPO per owner delegation: same-tick joins legal under
> canonical `(joinedAtTick asc, participantId code-unit)` ledger order (byte-equal ledgers under any
> submission order), re-join-as-new-row with per-tenure seat resolution (disjoint chronological
> half-open tenures; gap = ghost author), joiner catch-up relay-side with ZERO save writes
> (dup-never-twice through `orderCoopTimeline`), and MIN_WRITERS RATIFIED as recorded-writers history
> law (distinct participants ever seated, not live seats) @`500c134`+@`6d0bc1e`; departed-seat
> broadcast (current seats only) stands from @`24426ec`. Transport (PHP/Workerman) remains OPEN —
> the wire mechanics the transport lane owes (seq policy, payload opacity until the door, the O(n²)
> append self-check, paged catch-up) are untouched by this hardening.

**D7 — Build-state wire: (a) additive `boot.build?` lands NOW.** The worker-corpus leftover ("no build
state rides the wire yet") resolves as an **additive-optional boot field**; PROTOCOL_VERSION stays 1
under the additive-only law, absent ⇒ byte-identical (the `boot.corpus` precedent @`1165368`,
causeId/attention riders @`0b35b15`).

**D8 — Endless save slice: QUEUED.** "Queue the endless save slice" ends the OD-8 contested posture:
the **32 `PENDING_OD8` endless rows get a build lane to flip LIVE** — `writeGuard`'s throw-on-pending
retired for those rows, the `WRITE_ACCESS_MATRIX`/mode-matrix pins re-cut, `pendingOd8Rows()`
converging to empty. OD-8's endless carve-out is ruled **build it**. (Queue, not build — on disk the
rows stay `PENDING_OD8` until the lane lands.)
>
> **AMENDED 2026-10-16 (session-5 owner ruling, agenda item (a)):** the posture condition recorded at
> landing — re-raising beyond the ledger four would need a fresh owner ruling, not an inference from
> the mirror — **met the same day**: endless is re-raised to the **campaign-mirror full-carry**
> @`c9e34c7` (`CAMPAIGN_MIRROR_MODES`; row kinds derived from `campaignRow` — 20 append / 12 instance
> / 0 deny; matrix census 192 LIVE / 0 pending UNCHANGED; deny census 140→112; flip-back probe reddens
> exactly 4 witnesses — falsifiable). The flip + every #D8 mechanism stand. **Ledger-four survives as
> recorded law for the ADR-0009 cohort only** (scenario/daily/consultant/blitz — 112 standing deny
> rows); it governed the endless 32 for ~1 day and that interim stays in the record, not erased. The
> endless **LOOP**/mode-tier scoping stays DEFERRED per OD-16(a) — save-slice posture only.

**D9 — `metricNamespaceTier` (OD-4b residual): QUEUED into the next loader lane.** The schema field +
loader parse + lint-leg fold is housekeeping — bundle data, never engine branching (the ratified 4b
residual reading stands).

## Consequences

- **Build lanes queued** (this ADR is their authority; each gets its own lane):
  1. **Loader-lint amendment lane** — add `negotiate` + `schedule` to `TIER_EXTENDED_VERBS` per D1(ii),
     keeping the invariant six intact and the pairwise MERGE law untouched.
  2. **Shield door-verb lane** — first `PlayerVerb` extension per D2 (corruption pre-arm mechanic).
  3. **Pack-widening lane** — register the nine type packs in `packStore`, widen `PackId`, re-cut the
     flavour-feed pool/era pins per D5.
  4. **`boot.build?` lane** — additive wire field per D7, byte-identity twins when absent.
  5. **Endless save-slice lane** — flip the 32 `PENDING_OD8` rows LIVE with matrix-pin re-cuts per D8.
     **LANDED @`1660fd2`; posture superseded @`c9e34c7` (see the D8 amendment — session-5 re-raise to
     campaign-mirror full-carry).**
  6. **Type-10 content lane** — generic colo founded on Negotiate (post-lint-amendment) per D1; the
     Diagnose-bless card route per D1(i) waits on its authoring-time owner confirm.
  7. **Node relay spike lane** — in-repo co-op relay proof per D6.
  8. **`metricNamespaceTier` loader leg** — schema + parse + lint fold into the next loader lane per D9.
  9. **Perf-grid baseline run** — append the measured readability baseline per D3.
- **Ratifications move zero code today** — D4 retires the PROVISIONAL tags in comments (sibling R3b
  sweep) and pins the values as law; any lane that later changes one of these numbers is now a law
  change requiring an owner decision event, not a tuning tweak. Digest goldens are untouched by this
  encoding (docs-only).
- **What became harder:** re-gridding constants (D4 locks the numbers); claiming roster verbs by
  merge (D1(iii) stays forbidden); bypassing `admit()`-style closed vocabularies when adding door
  verbs (D2 rides the existing door grammar, refusals and all).
- **What became easier:** the tenth and later types have a legal path (D1); tier cards can grow real
  mechanics (D2); the flavour pool can reach every type voice (D5); co-op has an authorized in-repo
  proving ground (D6); endless-mode save rows have a queue ticket (D8).
- **Kept unchanged:** ADR-0005 (no reopen — D1 works inside its per-tier frame); ADR-0009's Sheet-B
  flip; ADR-0013 rulings except where D4 explicitly supersedes the confirmed-provisional posture;
  OD-5(b)'s Workerman transport law (D6 is a spike, not a re-litigation); protocol v1's additive-only
  law; the zero-slot flavour law (D5 defers its consumer); the ⚠️/🔧 spec markers (this lane writes
  law notes only; the closeout owns marker moves).

## Source

Owner ruling m-lane session 4, 2026-10-16 (verbatim in Status). Register rows:
`docs/DECISIONS-PENDING.md` OD-4(4b), OD-6, OD-8, OD-10, OD-12, OD-21, OD-23, OD-24, OD-25 + session-3
micro ledger. Gap rows: `docs/MODULE-STATUS.md` VERB-ROSTER WALL / TIER-EXTENSION NO DOOR MECHANIC /
FLAVOUR POOL / CO-OP INCIDENT ROOM / worker-corpus build-state leftover / save OD-8 row. Prior
records: `docs/adr/0013-owner-rulings-session-3.md`, `docs/adr/0009-owner-ratifications-calibration.md`,
`docs/adr/0005-one-engine-seven-tiers.md`. Spec headings: `hosting_game.md` "The readability targets",
"Endless / Survival", "Grandfathering" (§6.5). Code anchors: `loader/lint.ts` `TIER_EXTENDED_VERBS`;
`types.ts` `PLAYER_VERBS`; `economy/config.ts` death block; `economy/elasticity.ts`;
`pipeline/attention.ts` `ATTENTION_DEFAULT_COSTS`; `pipeline/recovery.ts`;
`apps/proto/src/runner/waveRules.ts`; `apps/proto/src/i18n/packStore.ts`; `save/modes.ts`
`pendingOd8Rows`; `apps/proto/src/shared/corpusHost.ts` boot wire.
