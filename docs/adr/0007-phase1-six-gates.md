# ADR-0007 — Phase 1 scope = the 6 prototype gates (hosting_game.md §9.13)

## Status
**Accepted 2026-10-06.** Ratified owner decision R-7 ("decision #7"): Phase 1 scope is the six prototype gates from `hosting_game.md §9.13`, in doc order. Not re-openable without owner action (§0 legend).

## Context
The doc's own gates (hosting_game.md §9.13) decide whether this design is a game, and each is a *design* question answered by a playable/runnable artifact in programmer art — "if it's not fun in 90 seconds, nothing else matters" (G1), and modes/structure are decided **by prototype, not by argument** (hosting_game.md §9.13, §7 governing law). The doc pre-scopes a concrete slice for each gate; the specialists carried those forward (§4.1, §4.2, §4.3, §4.4, §4.5). The whole design carries a large unpriced surface (§8 risk register: readability-at-scale, hook-surface, tuning ambiguity), so the cheapest possible kill-shots must run before any art/money/policy production commits.

## Decision
**Phase 1 produces exactly the six prototype gates, nothing else**, in doc order (§2.1 R-7):

`G1 bounce loop → G2 attack-surface ledger → G3 suspicion dial → G4 drag-a-cable → G5 one quarter → G6 two types on one engine`

Preceded by a non-gate substrate **P0 — sim-core skeleton** ("everything downstream consumes `observed_view` + the RNG/replay discipline") (§7.0). Full scope, slice detail, and acceptance criteria live in `docs/PHASE1-PLAN.md`; the canonical statement is `MASTER_REPORT.md §7`.

## Consequences

**Zero shipped content, zero campaign authoring, zero render polish beyond programmer-art-plus until gates pass** (§2.2 R-7). The WS-5 headless rule slice rides alongside G1 on the same sim-core skeleton (§2.2 R-7, §7.7a).

**P0 comes first, non-negotiably:** `observed_view` + RNG streams + fixed-point + `cause_id` + replay/checkpoint + worker channel + zod/grammar registries + dual-runtime CI — every other row consumes all of it. Rows #1, #4, #6 of the risk register are *P0 acceptance criteria, not warnings* — "they are done when the CI says so" (§7.8 step 1, §8 register cadence).

**Gate failure routes are pre-decided by the doc** (§2.2 R-7):
- **G1:** "if it's not fun in 90 s nothing else matters" — if the slider isn't agonizing, the core-loop premise is wrong before any art/money/policy exists: the cheapest possible kill-shot (§7.1).
- **G6:** "if two types don't diverge from data, cut types and go deeper [on fewer]" (§7.6).

**Open owner decisions gate *calibration*, never *kickoff*** (§7 governing law). Noted per gate in `docs/PHASE1-PLAN.md`: OD-1 (scorecard) gates G5's score-screen build and which counter "wins" G1; OD-2 (tuning sheet) gates G1/G5 feel/numeric calibration and G5's start position; OD-4b/OD-15 gate G3 wording; OD-14/OD-18 want answers before G6's schema freeze. **Nothing in Phase 1 is blocked by OD-5** — every gate slice runs identically under either MP topology (§6.1 OD-5, §2.2 sub-decision).

**Build order is dependency-honest** (§7.8): P0 → G1 → G3 → G4 → G2 (ledger seeds ride G1's board) → G5 → (c) Book round-trip; the (a) rule slice runs headless in parallel with G1; the (b) Fogged NOC co-builds on G4's board; (d) two-seats and (e) deck-duel are last and optional-within-Phase-1. Decision checkpoints are wired into the sequence (§7.8 step 9).

## Source
`MASTER_REPORT.md` §2.1 (R-7), §2.2 R-7, §7 (governing law, §7.0 P0, §7.1–§7.6 gates, §7.7 cross-cutting slices, §7.8 build order + decision checkpoints), §8 (register cadence; risk rows #1/#4/#6 as P0 criteria), §6.1 (OD-1/OD-2/OD-5 calibration-vs-kickoff).
