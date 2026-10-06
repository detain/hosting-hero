# ADR-0005 — One engine across all 7 scale tiers, per-tier verb sets

## Status
**Accepted 2026-10-06.** Ratified owner decision R-5 ("decision #5"). Not re-openable without owner action (§0 legend).

## Context
Scale is the board: T0→T6 (files → daemons/ports → server → rack → tiers-and-flows → facility → region → arbitration), and "each tier's map becomes one icon in the next" (§4.2 tiers R96–R105, `hosting_game.md §1.1`). WS-3 demands the **variety engine be data, not code**: 34 hosting types are Ruleset Cards × eras, and gate G6's failure branch is "cut the number of business types and go deeper on fewer" if two types don't diverge from data alone (§7.6, §1). WS-2's DR-10 fleet finding concluded that the evidence supports **one engine, no per-tier control-scheme forks** beyond unit-of-thought/LOD/board-substitution (§4.2 DR-10).

## Decision
**One engine serves all seven scale tiers, with per-tier verb sets** (§2.1 R-5). Tier behavior is produced by exactly three mechanisms — **never engine forks** (§2.2 R-5):

1. **Verb-set gating** — WS-2's per-tier verb sets (core verbs PLACE·LINK·TUNE·SCALE·SHIELD·INVESTIGATE·MAINTAIN·SELL, capped by the Three-to-Five Change Rule, with board substitution per tier) (§4.2 tiers).
2. **Ruleset Card rescale** — WS-1 R-81…R-83: one pipeline under a per-type time-unit scale (web seconds, game ms, ad-tech µs, backup hours, colo years); "the meter never swaps, only rescales." **Hard-ceiling exception** stays a per-node `discipline ∈ {hockey-stick, hard-ceiling}` flag, not a fork (§4.1).
3. **Contract-length tempo** — the T0–T5/T6 tempo personality of contract lengths (`hosting_game.md §6.6`: "the single stat that makes types feel different") (§2.2 R-5).

## Consequences

**Engine-hook surface is capped.** Adding content is only possible against a defined hook; the hook surface is bounded by WS-3's **15-item hook census** and the `hosting_game.md §9.6` three-step filter (real is source → role-coverage filter → playability veto). **Adding a hook is an engine change requiring the hook-surface review** (§2.2 R-5, §8 RISK-2). The 15-hook enumeration is WS-3's interface spec owed to WS-1 — "this defines what 'one invariant engine' must support to carry twenty rulesets" (§4.3).

**"No type-specific engine branches" becomes a grep-provable law.** Gate G6's pass criterion: `rg "business.?type" engine/` returns formatting-only hits (§7.6, §4.3 gate-6 slice).

**Content = data path is enforced.** Official types are authored in the same mod JSON with **no privileged code path** (hosting_game.md §9.11 owner directive R77), so the Ruleset Card is a data artifact and the bundle schema is the mod format (§4.3, Appendix A).

**Risk this decision surfaces — hook-surface explosion** (§8 RISK-2): if WS-1 builds the 12-step pipeline but not the hook *registry*, bundles degrade to stat-swaps and the Ruleset Diff Linter "passes" types that play identical — G6's failure branch then fires on a *build defect*, not a design truth. Mitigation: treat the hook census as WS-1's interface spec; the linter diffs **behavior, not fields**; G6 ships the backup 3rd-type generality check (§8 RISK-2, §7.6 item 8).

**Interlocks OD-16 (mode tiering) and OD-14 (canonical type count)** — the per-tier verb-set and Ruleset-rescale mechanisms are what keep 34 types (or the settled canon number) inside one engine rather than forking per type (§6.2).

## Source
`MASTER_REPORT.md` §2.1 (R-5), §2.2 R-5, §4.1 (per-type rescaling R-81…R-85), §4.2 (tiers R96–R105, DR-10), §4.3 (15-hook census, gate-6 slice), §7.6 (G6 grep-proof), §8 RISK-2.
