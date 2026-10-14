# ADR-0013 — Owner session-3 rulings (2026-10-14): adopt-all over the decision brief — OD-7/9/10/11/12/15/17/18/19/20 decided, the ratify-on-read pile confirmed-provisional, per-verb attention cost decided, D-7 storm cap adopted BOUNDED, canSettle stays host-forwarded, verb-exhaustion extends within ADR-0005

## Status
**Accepted (2026-10-14)** — owner ruling, session 3, verbatim: "go with recomendations for alll those and
keep drving this to compoletion when its all done include coop and all that and really drive it all the
way you can". Every orchestrator recommendation in the session-3 decision brief is ADOPTED as written
except where this ADR records a disk-truth correction. This lane encodes the rulings into docs only;
the build lanes enumerated under Consequences follow.

## Context

The calibration wave (ADR-0009, `ea7acee`/`58f5186`) and session 2 (ADR-0010/0011/0012) left a tail of
OPEN owner decisions — OD-7, OD-9, OD-10, OD-11, OD-12, OD-15, OD-17, OD-18, OD-19, OD-20 (per
DECISIONS-PENDING.md line 23) — plus a "ratify-on-read" pile of PROVISIONAL constants (familyWeights,
death thresholds, elasticity coefficients, recovery knobs, oversell proposal) and three named mechanical
asks (D-7 storm-severity cap, per-verb attention costs, verb-exhaustion for types 6+). The owner issued
a blanket adopt-all ruling over the decision brief rather than deciding rows one by one, and explicitly
pulled co-op into scope ("include coop and all that").

Where the brief's wording and the on-disk record diverge, **disk truth wins and is recorded here**:
the per-verb attention-cost default quoted in the brief ({Communicate:1, ticket-class handling:1,
others:0}) does **not** exist in DECISIONS-PENDING/OD-6 or OD-23 text — the register leaves verb
selection as "owner taste" and the door's `attentionCost` config ships DEFAULT-EMPTY. The owner's
adopt-all covers it: the brief's set is ratified as the OPENING default (ruling 12), flagged as a
new decision rather than a pre-existing recommendation.

## Decision

1. **OD-7 — accounting depth: v1 line BLESSED.** Cash buckets + invoices/AR-aging + deferred revenue +
   dunning are v1 law (already shipped in `economy/`); accrual accounting and consolidation are Tier-4+
   unlocks. **Record-only** — no code owed.
2. **OD-9 — co-op save ownership: SHARED BRANCH NODE (design law).** One Company, 2–4 writers. The
   branch node holds museum artifacts + scars per participant and **never** customers or cash — the
   ledger stays single-authored, mirroring the ratified Matrix-B shadow-instance law (OD-8/`74f157b`).
   Implementation queued: the co-op save slice lane follows this encoding.
3. **OD-10 — clock instruments: ONE unified time-service presentation.** The Clock Ribbon is the
   primary surface; the dials are instruments of the *same* service, not rivals (no dual authority over
   "what time is it"). **Max LEGIBLE speed = 2× until G1 playtest data** — the SpeedX door's 1|2|4
   ladder stays as shipped law (MODULE-STATUS:178 deviation row untouched): 4× is the authored-art
   exception, 3× is and remains never-legal. Hardware target = current dev-box floor.
4. **OD-11 — launch order: Consultant first, Bootstrapped as its mirror.** Recorded in
   DECISIONS-PENDING + a MODULE-STATUS forward note as the v1.1 campaign plan.
5. **OD-12 — render-surface bits: all adopted.** (a) Violet trust ports — **disk truth:** this already
   ships; `apps/proto/src/gates/g4/portShapes.ts:11,63-70` gives trust an SFP slot in teal-violet
   (`--g4-hue-trust`). The ruling CONFIRMS shipped design, it does not open work. (b) Confidence Blur
   renders **attachment-crispness** where both exist — the §8.9 blur-vs-crispness tension is resolved in
   favor of composure, not competition. (c) Hands Dock placement **bottom-left** (the rail-below-body
   peg-rail reading is now law). (d) The visual-coverage audit (§8.18) becomes a **manifest-lint CI
   rule**: every shipped buildable/threat/visitor must carry a visual or an explicit codex-only tag —
   encoded as a MODULE-STATUS gap row (build item, lane follows). (e) l10n budgets and keymap/focus
   order deferred.
6. **OD-15 — engine-doctrine bless bundle: §1.7 wording BLESSED + D-7 cap ADOPTED BOUNDED.**
   The wave-envelope law stands; "waves vs continuous" resolves as the **both-are-waves** doctrine;
   mazing stands as **never-maze expressibility**; bottleneck-highlight is a **purchased probe**;
   auto-pause-on-severity is a **rule-card**, not an engine reflex. The emergent-storm severity cap is
   adopted **BOUNDED**: an engine-enforced ceiling on emergent storms — a hard rate ceiling plus a
   stacked-envelope cap expressed in the band ladder. **Build-lane brief:** `waves/bands.ts`
   `TELEGRAPH_BANDS` ships only visibility booleans (weather/storm/hunter/entropy — no numeric
   ceilings), so the lane must verify exact numbers against the existing tuned constants and prefer a
   ratified-adjacent number over inventing one. Candidate anchors already on disk: the pressure-budget
   authoring law (≤4 distinct threat entries/wave, first wave ≤40% par — `47b2c33`), §2.24
   stacked-envelope composition cap 4, the 30:1 oversell-detent ceiling
   (`apps/proto/src/runner/contention.ts`), and Q16.16 gauge saturation (32767.0). The "128/8" pair from
   the brief is explicitly NOT blessed.
7. **OD-16 — mode tiering STANDS as adopted** (core 3 / extended 20 / deferred 9 @`42fbbd2`,
   `save/modes.ts:274,327`); the 5-band→3-tier fold is hereby **owner-ratified** (was
   ratify-on-read). **OD-8's endless-32 save rows STAY contested — explicitly NOT ratified this
   session.** The recommendation was "don't force it"; the owner adopted the recommendation, so the
   `PENDING_OD8` carve-out stands until an endless loop is scoped.
8. **OD-17 — co-op ICS coordination: option A, recorded as law.** A **shared incident timeline** —
   one event stream, both seats read the same ordered log (consistent with OD-5(b) portable-sim + the
   single-event-log determinism law). Option C (duplicate-action interference) is noted as a future
   opt-in twist, not built.
9. **OD-18 — rule-masking: adopted as an AUTHORING law** (the WS-3 pruning-law family). Appendix A
   gains an optional `lookalikeOf` reference on threats; **one mimic-seed per shipped type bundle** —
   the 5 shipped bundles: shared-web, game-servers, mail, dns, dedicated. Build gap row added; schema
   field + seed content ride the content/schema lane.
10. **OD-19 — mastery budget: WS-6 25 h arc schedule adopted AS PROPOSAL.** It enters the campaign act
    table when campaign authoring starts. **Record-only.**
11. **OD-20 — micro-confirms ratified as listed.** Scar-cap wording = **active modifier slots capped,
    history immortal** — this MATCHES shipped save law (`save/node.ts:144` CAP = 3 active, overflow
    retires; `save/faces.ts:45` "Immortal history: retired scars stay readable"); HUD-slot, MRR
    exemption, and sacrifice-ladder confirms likewise stand. The hosting_game.md §1.6 "Scars" heading
    already carries ✅ `9e701a0` — no spec flip needed.
12. **Ratify-on-read set — CONFIRMED.** (i) `familyWeights` provisional set **stays PROVISIONAL** —
    owner blesses *playing with it*; re-taste after G1 playtests. (ii) Death thresholds
    {churnFloor 1, churn 3 d, float 3 d, grace 10 d} **PROVISIONAL-CONFIRMED** (ratify-on-playtest
    continues; `economy/config.ts:451-453`). (iii) Elasticity coefficients 150/80/50 bps, ±10% dead
    band, [0.5×,3×] clamps **confirmed-provisional**. (iv) Recovery's 5 knobs + the 7 pricing/elasticity
    constants **confirmed-provisional** (`pipeline/recovery.ts:75-76` docblock already declares the
    class). (v) **Per-verb attention cost — DECIDED (promoted out of ratify-on-read):** opening default
    `{Communicate: 1, ticket-class handling: 1, all other verbs: 0}` passed to the door's
    `attentionCost` config. **Divergence note:** no such recommendation existed on disk (OD-6/OD-23
    leave verb selection as owner taste, config ships empty) — this is the owner's session-3 decision,
    not a prior fleet recommendation. Build lane: wire the default + surface the attention rail per the
    §1.4 four-id TopBar law. (vi) Oversell-ratio 8:1 proposal **confirmed-provisional** —
    `OVERSELL_RATIO_MICRO = 8_000_000n` shipped `2ef5cae` at
    `apps/proto/src/runner/waveRules.ts:124`. (vii) 5-band→3-tier fold **ratified** (see ruling 7).
    (viii) ADR-0012 engine-canonical recovery authority **ratified**.
13. **canSettle — recommend-adopted: v0 law stays.** Host-forwarded refusals remain the mechanism
    (`fastForward.ts` catch-and-void); **no economy-side `canSettle()` veto** is added. The
    MODULE-STATUS:164 owner ask is CLOSED with that answer.
14. **Verb-exhaustion (types 6+): ADOPTED — extend within ADR-0005's already-ratified per-tier verb
    sets. No ADR amendment needed.** The Trunk Group / Eleven Nines Observe-collision cards unblock via
    per-tier verb sets or newly authored cards; the content lane decides which. The
    `THREE_CHANGE`/`VERB_SHIFT` ruleset linters must stay clean through whichever route content picks.

## Consequences

- **Build lanes queued** (each gets its own lane; this ADR is their authority):
  1. **Storm-cap lane** — engine-enforced bounded ceiling per ruling 6 (hard rate ceiling +
     stacked-envelope cap in the band ladder; verify against existing constants first).
  2. **Manifest-lint lane** — §8.18 visual-coverage CI rule per ruling 5(d).
  3. **Lookalike seeds lane** — `lookalikeOf` optional schema field + one mimic seed per shipped bundle
     per ruling 9.
  4. **Attention-cost lane** — door `attentionCost` opening default + HUD attention-rail surfacing per
     ruling 12(v).
  5. **Co-op slice lane** — shared branch node (OD-9) + shared incident timeline (OD-17) follow
     immediately; the owner's ruling names co-op as in-scope for completion.
  6. **Verb-unblock content lane** — per-tier verb-set card authoring per ruling 14.
- **Nothing digest-pinned moves** from this encoding — it is docs-only; goldens re-verified by the
  build lanes that actually touch code.
- **Still contested after this session:** OD-8 endless-32 rows (explicitly re-confirmed as NOT
  ratified), all PROVISIONAL constants that the owner re-blessed as provisional (they return on the
  ratify-on-playtest lever), OD-15's exact ceiling numbers (delegated to the storm-cap lane against
  constants on disk), and the open OD-7/…/OD-20 rows' implementation tails.
- **Kept unchanged:** the SpeedX 1|2|4 door ladder and its MODULE-STATUS deviation row; the observer
  advisory status under ADR-0012; the host-forwarded refusal plumbing under ruling 13; the pressure-
  budget authoring law that predates and informs (but does not set) the storm cap.

## Source

Owner ruling m-lane session 3, 2026-10-14 (verbatim in Status). Register rows:
`docs/DECISIONS-PENDING.md` OD-6…OD-25 + ratified micro ledger. Fleet recommendations:
`reports/MASTER_REPORT.md §6`, `reports/audit/SUMMARY.md` PROBLEMS, ADR-0009 §3, ADR-0010, ADR-0012.
Spec headings: `hosting_game.md` §1.7 (bless bundle), §8.9 (clock instruments), §8.18 (visual coverage),
§1.6 Scars, §2.24 (composition cap). Code anchors as cited inline above.
