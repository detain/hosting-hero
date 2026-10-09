# ADR-0009 — Owner ratifications of 2026-10-09: the calibration decision batch as law

## Title

Freeze the policy-card grammar, keep the threat census wide, resolve every calibration knob, and record the deferred lanes — the owner decision session of 2026-10-09 becomes standing law.

## Status

**Accepted 2026-10-09.** This ADR is the permanent record of the owner decision session of 2026-10-09 (the calibration session). Every row below is decided law, not a recommendation; none is re-openable without a new owner decision event (§0 legend).

The working ledger — decisions mapped to remaining build — lives in `docs/PHASE1-PLAN.md` §"RATIFIED 2026-10-09 (owner decision session) — ledger & execution queue". That ledger is canonical for *sequencing*; this ADR is canonical for *meaning*.

## Context

Phase 1 shipped its six gates against a deliberate blank: every value a slice touched but nobody may hard-code was rendered a named config knob whose default **fails loudly** rather than pretending to be settled — `resolveActiveSheet()`, `getActiveScorecard()`, and `writeGuard()` all throw by design. That machinery protected the repo while the open-decision register (§6, OD-1 through OD-20) waited for its single answer session.

Three forces made 2026-10-09 the moment:

1. **Calibration was the last gate.** The engine lanes had finished everything not owner-blocked: goldens captured, provisional values tagged, fail-loud pins armed and tested. The remaining work — sheet activation, scorecard default, save-matrix flip — is mechanical once the values exist.
2. **The lanes had accumulated micro-decisions needing blessing.** T-9 blast semantics, F-2 shed termination, pack over-cap, Versus owner questions, economy performance floors, the substrate budget cap — each a ratified-in-spirit row awaiting the record.
3. **One question split the fleet.** OD-3 (≈200 mechanical threats vs the §9.6 pruning path toward ≈45 visitors) had a fleet recommendation *and* a standing design-doc law in tension. The owner decided against the recommendation, and that override carries the heaviest consequence load in this record.

## Decision

### 1. OD-4 batch — the attention grammar and the card vocabulary

The centerpiece: four interlocking rulings about what the game's rule vocabulary *is* and what it may never become.

**4a — Triage Window + Attention Grace RATIFIED, focus hand as BOUNDED LOAN.**
When the player enters the triage window, the game extends a special focus hand; that extension is neither free nor invisible.

- **Attention debt is repaid in the next window.** The loan comes back out of the player's attention economy on the following window — which is what makes the grace a *decision* rather than a perk.
- **The loan is the ONLY hand-creation event in the system, and it is ledgered.** Hand count changes only through the ledger, never by implicit spawn, so every hand in play at any tick is attributable to either the standing allocation or a recorded loan entry.
- **Implementation of the engine slice is a later design lane, NOT this wave.** The law is ratified; the code waits (see "Still OPEN").

**4b — Telegraph bands canonical now; `metricNamespaceTier` ratified as a FUTURE bundle field.**
The four-band telegraph law — **Weather always visible / Storms telegraphed / Hunters symptom-only / Entropy "foresight is a purchase"**, with the horizon "next envelope visible, one after a silhouette, two after a question mark" (`hosting_game.md` §1.7 "Telegraph Depth, and the information-design law", ~4598–4620; echoed by §2.24's Wave Composition Bar, ~11022) — is **canonical now**, and the shipped wording and data already honor it: `waves/bands.ts` `TELEGRAPH_BANDS`, the loader's `WAVE_BAND_VOCAB`, and the threats registry's `bandsVocabulary` all carry the four bands. The play target is the G2 gate's acceptance sentence — a first-time player "predicts the next wave from the Ledger alone" (report §7.2 G2 acceptance (a), `MASTER_REPORT.md:1052`, restated in `docs/PHASE1-PLAN.md:112`).

The second half is a **future** addition, not a shipped one: **`metricNamespaceTier` is RATIFIED AS A FUTURE type-bundle schema field** — which metrics are nameable in policy rules at Tier N becomes bundle data, never engine branching (consistent with G6's zero-type-specific-branches grep proof). Honest ledger: the field **does not exist on disk yet** — zero occurrences in `packages/content/schema/type-bundle.schema.json` or `packages/sim-core/src/loader/bundle.ts`, whose parser rejects unknown keys by design (`UNKNOWN_FIELD`, bundle.ts ~378), so a bundle carrying it today would fail to parse. The schema+loader lane that adds it is **owed by this ratification and is not in this wave's queue** (see Consequences, "Ground-truth anchors").

**4c — Reconciler becomes a SEPARATE card type, deferred unlock.**
It is not a clause bolted onto existing cards and it is not a v1 reflex: **v1 stays reflex-only**. A future unlock event grants the reconciler type; until then no bundle may reference it.

**4d — The Policy-Card Grammar is FROZEN as a spec artifact.**
This freezes the **policy-card EBNF grammar** — the `when/for/then/unless` composer vocabulary of WS-5 — and nothing else. Report **Appendix B, "Policy-Card Grammar + Conflict-Detection Sketch (WS-5, verbatim)" (`MASTER_REPORT.md:708`), is the grammar**, verbatim and closed, from this date. Disambiguation: this is **not** the GLOSSARY's *Level Grammar* (the six scenario-shape columns, §4.3 R13) — a different artifact that this freeze neither covers nor touches; its own standing is unaltered by this record.

- Extensions are made **only by an owner decision event**. A lane adding a grammar construct is a law breach, not a feature.
- **The G7 cooldown lands as a BOUGHT VERB, never a clause.** Temporal relief is purchased through the verb economy — hand, cost, door receipt — exactly like every other power. This fixes the pattern: any future temporal mechanic follows the same door, forever.

### 2. OD-3 = option (a): KEEP ~200 mechanical threats

The owner **overrode the fleet recommendation**: the `hosting_game.md` §9.6 pruning-rule path (cut threats toward a ≈45-visitor census) was **REJECTED**. The registry keeps its ≈200 mechanical threats. The consequences are binding law, not cost notes:

- **Fairness-validator scope grows to EVERY registry threat's counter** — the Second-Answer invariant (no threat with exactly one counter) is now an all-registry obligation, not a sampled one.
- **`hosting_game.md` §9.6 "every new threat creates a visitor/conversion reason" becomes the pacing-valve authoring law** — threat volume is bounded not by deletion but by conversion-reason accounting at authoring time.
- **Versus draft pools stay wide** — deck variety rides the full registry (the pool-cap-10 row below stands unchanged).
- **Art FX-pairing budget scales** with the kept census; asset lanes plan against ≈200, not ≈45.

### 3. All other ratified rows (exact decided values)

| Row | Decision as law |
|---|---|
| **OD-1 scorecard** | **(c) commitment-convergence default**: availability is scored against the SLA **sold**, not a generic uptime target. The conversion-funnel axis is **displayed leading**. G5 keeps **grading BOTH forks** over the same save as comparison data, but the **active weights are the C-set** — `getActiveScorecard()` resolves to C. |
| **OD-2 tuning sheet** | **Sheet B canonical.** The month **stays 7 real-min** — `BUSINESS_SCALE_DEFAULT {43200n, 7n}` is kept; the 4-min flip is **DECLINED** (`hosting_game.md` §7.13 doctrine wins over Sheet B's own row). Sheet A becomes a landlord-convention derivation later; Sheet C becomes realism-toggle data later. |
| **OD-5 MP topology** | **(b) TS-sim-as-portable-library** — one TypeScript sim runs as a library in the browser (single-player) and under Node (sessions + headless); PHP/Workerman stays services/transport/notary. The repo's existing scaffold is the ratified shape; `ARCHITECTURE.md` §10 wording follows in queue item 9. |
| **OD-8 save-mode matrix** | **Matrix B**: the matrix is 192 rows (6 modes × 32 facets); the scenario / daily / consultant / blitz rows — 128 of them — **flip pending→LIVE** per B's pattern, joining campaign's 32 already-LIVE rows, for a final standing of **160 LIVE / 32 `PENDING_OD8`**; the endless mode's 32 rows **STAY PENDING** — contested, so `PENDING_OD8` stays armed there. |
| **Q-P3-1** | The **defensive reading is CONFIRMED**: a freeze **preserves and defers** pending consults; it neither drops nor executes them. Shipped code already implements it — record only. |
| **T-9 rack blast** | **Racks DEGRADE-ALL, and the anchor joins `members`.** The two-color split stands: a power-domain kill is **red** (kills residents), a rack domain is **amber** (degrades residents). Blast goldens and the rack-pin tests are **re-cut deliberately** — the anchor-inclusion change moves digests by design, so every re-pin is an audited event, never a casual one. |
| **F-2 shed termination** | **CONFIRMED keep** — hard-ceiling shedding terminates the unit (shipped `2eaf830`); the patience-bounce cause taxonomy stays as landed. |
| **Pack volume** | The i18n pack over-cap (**98 shared-web / 75 game templates** vs the ≤60 task line) is **RATIFIED — do not trim**; `hosting_game.md` §9.3 verbatim doc seeds mandated the volume. |
| **Versus rows** | `weightBps = cost` **keep**; affixes parsed-but-**inert keep**; draft pool **10 keep**; decisive-wave **tie law keep**; the **unattributed mint-tick floor accepted** as honest data. One **FLIP**: `lookupPolicyCard` moves from card-id keying to a **content fingerprint** (ruleBookHash-style fold of the card payload) — identity travels with content, not labels. |
| **Economy rows** | The **≈25 ms steady-state floor is ACCEPTED**; the persist-index is **declined for now**; the invoice-prune stays **OFF** by default; the **register batch-API is APPROVED** (a small lane making 1k-contract setup O(n log n)); snapshots-reshape **DEFERRED**; perf rec#4 **deferred**; `scaleEvent` stays **declined**. |
| **Substrate** | **`BUDGET_CAPS.substrate = 1200` SIGNED**, with the **authored-patches law** (substrate paint arrives as authored patches, not procedural fill — the spike's Z3 paint-fill ≈46k-quads witness is the reason) and the **4 taste rows ratified** (quad caps per altitude). The tilemap seam self-activates when the category arrives; **first-mount stays paired with real atlases** (tripwire flips red→green in this wave). |
| **CI matrix** | **Drop Node 20.x** → the matrix is **22.x + 24.x**; the engines prose becomes honest about it (the 20.x `--filter` scoping hack is deleted). |
| **Tag policy** | The next tag is **v0.3.0, cut at the end of this calibration wave** (green tip; existing tag history untouched). |
| **Devtools / pixel audit** | `pixijs/devtools` is a **doc-only row** (never a dependency decision); the `@pixi/node` pixel-audit CI arm **deferral CONFIRMED until real sprite atlases exist** — honest: there are no pixels to audit yet. |
| **OD-13 save trust** | **RECORDED as decided**: single-player saves are **client-authoritative with periodic notarization**; the server re-sims only when the save carries **cross-player value** (versus/co-op/notary contexts). Implementation is a **later save lane**. |
| **OD-6 hands** | **RECORDED as decided**: **one pool, two denominations** — ordinary hands and the special **attention hand**, which replenishes monthly. Implementation is a **later design lane** (it interacts with 4a's loan ledger). |

## Consequences

**What becomes easy.** The fail-loud pins resolve: the calibration flips (queue items 2–8) are mechanical work now that a ratified answer stands behind each throw — Sheet B goes active, the C-set scorecard resolves, the save matrix lights its 128 held non-campaign rows (final standing 160 LIVE of 192), the substrate cap arrives, the CI matrix simplifies. Content planning gets a firm census (≈200 threats) and a firm pacing valve (§9.6 conversion-reason law) instead of a contested pruning rule. Future arguments about grammar are cheap: the artifact is frozen and the answer to "can we add X?" is always "owner decision event."

**What becomes hard (deliberately).**

- The fairness validator now owes a counter check for **every** registry threat — a permanent content-lane duty the pruning path would have dodged.
- The grammar freeze funnels all new expressiveness through the only doors left open: **bought verbs** (G7 cooldown first — the law stands today; the verb's engine slice is not yet built or queued) and **bundle fields** (first ratified row: `metricNamespaceTier` — law today, schema field owed by a future schema+loader lane, per 4b's honest ledger). A mechanic that is statable as neither does not ship.
- The T-9 re-cut makes blast semantics a two-color discipline (kill-red / degrade-amber) whose goldens must each move by named audit.
- The focus-hand loan is the one borrowing mechanism in a scarcity system — the ledger must never lie about it, and every future hand-economy feature must account for the outstanding debt.

**Kept unchanged vs replaced by.** Kept: `BUSINESS_SCALE_DEFAULT`, the C-set alongside A/B in scoring data (only the *active* default changes), Versus weight/affix/pool/tie rows, prune-off, `scaleEvent` rejection, all shipped tag history. Replaced by: card-id policy lookup → content fingerprint; Node 20.x CI arm → 24.x; OD-3 fleet recommendation → owner override; A-first scorecard question → C-set active.

**Sequenced later, not now.** Four ratified decisions carry zero code in this wave by design: the Triage-Window/focus-hand **engine slice** (design lane), OD-13 save-trust **implementation** (save lane), OD-6 two-denomination execution detail (design lane), and the reconciler **unlock event** (v1 stays reflex-only). Sheet A's landlord-derivation and Sheet C's realism-toggle are likewise future data work, not open questions.

**Ground-truth anchors.** `docs/PHASE1-PLAN.md` §EXECUTION QUEUE items **1–11** carry the queued implementation work for these decisions in this wave; this ADR is item 1. Coverage honesty: two ratified rows have **no queue item yet** — the `metricNamespaceTier` schema+loader field (4b) and the G7 cooldown's **bought-verb engine slice** (4d) — they stand as law ahead of code, owed by future lanes, alongside the four deferrals listed under "Sequenced later, not now". Battery baseline at **`f41e20f`**: sim-core 1434/100 serial · proto 614/60 · headless 53/5 (parity `b0162ab5`/`a9b4b7b8`) · assetpack 48/5 · perf 20 · api-verify 1270 · canary 105 · ci-verify 5/5. Config flips must not move digest goldens; if one moves, STOP and re-audit, never casually re-pin — the T-9 row is the single licensed exception, and only for the blast-family goldens it names.

### Still OPEN (deliberately not decided 2026-10-09)

- OD-7 accounting menu · OD-9 co-op save ownership · OD-10 clock instruments / speed target · OD-11 ship order · OD-12 render bits
- **OD-14 canon count** — noted tension: OD-3-(a) keeps the *threat* census wide, but the *hosting-type* count is still un-settled
- **OD-15 incl. D-7 storm-cap** — the one engine answer still owed
- OD-16 mode-tiering batch · OD-17 ICS model · OD-18 lookalike mandate · OD-19 mastery arc · OD-20 misc wording
- Coverage taste rows (incl. the `CoverageSummary` rename) · unattended thresholds + `canSettle()` · audio envelope audition · era expansion
- **Triage-Window / focus-hand IMPLEMENTATION** — ratified as law above (4a); the engine slice is a design lane, not this wave

## Source

`docs/PHASE1-PLAN.md` §"RATIFIED 2026-10-09 (owner decision session) — ledger & execution queue" — the canonical session ledger.

`reports/MASTER_REPORT.md` §6 (open-decision register OD-1…OD-20), §6.9, §6.16 (calibration decision rows), **Appendix B — "Policy-Card Grammar + Conflict-Detection Sketch (WS-5, verbatim)"** (the policy-card grammar spec artifact frozen by 4d), **Appendix C §2.5**.

`hosting_game.md` §9.6 (the conversion-reason pacing-valve law ratified by OD-3-(a); the pruning path it rejects), §7.13 (month-ratio doctrine behind OD-2).

Register IDs: **OD-1…OD-8** (the session's register range; OD-7 itself was deliberately left open), **OD-13, Q-P3-1, T-9, F-2, D-7**.

Code/SHA anchors as cited in-text: `2eaf830` (F-2), `kernel/time.ts:75` `BUSINESS_SCALE_DEFAULT`, `apps/proto/src/render/budget.ts` `BUDGET_CAPS`, `versus/match.ts` `lookupPolicyCard`, baseline `f41e20f`.
