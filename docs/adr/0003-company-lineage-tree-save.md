# ADR-0003 — Company save: WS-6 lineage-tree schema

## Status
**Accepted 2026-10-06.** Ratified owner decision R-3 (adopting WS-6's lineage-tree schema; the report's "decision #3"). Not re-openable without owner action (§0 legend). The **mode write-access matrix remains OPEN (OD-8)** — see Consequences and `docs/DECISIONS-PENDING.md`.

## Context
The source doc says progression is **THE LONG SAVE: one Company object** (hosting_game.md §9.4, hosting_game.md §9.13 fix #3). But the same doc describes Prestige/The Exit restarting at Tier 0 while keeping "exactly 3 nodes of ~120 + one Doctrine + your Playbook," with kept nodes appearing "in the previous company's handwriting" (hosting_game.md §1.6); the Almanac records the costliest threat "across every company you have ever run" (hosting_game.md §9.4); *Two Companies One You* keeps the first company alive as an NPC-run successor (hosting_game.md §9.9). These are **generational edges, not overwrites** (§4.6 thesis 1). Separately, the doc's "four faces" (Wall / Scrapbook / Almanac / People) are a *screen budget* — but Playbook slots, the Wiki, and Anticipation Tokens are player-**writable** state, not projections (§4.6 thesis 2). The Long Save is a **load-bearing wall** for three flagship features that don't exist without it: *Your Past Self Is The Boss*, the Attribution Ledger, and cross-level cast callbacks (§4.6 thesis 3, §1).

## Decision
Model the Company as a node in a **lineage tree**: **one save root**, generational `CompanyNode[]` + `InheritanceEdge[]` with an **inheritance manifest** (assets, scars, doctrines, obligations, cast). This satisfies "one object" in storage terms (one save, one root) while permitting exits / prestige / failure-restarts without destroying the museum (§2.1 R-3, §4.6).

**~20 first-class write facets sit behind 4 read faces.** The faces (Wall / Scrapbook / Almanac / People) are **READ-views only** — UI may never invent a fifth face or write through a read view (§2.2 R-3, §4.6 thesis 2). **Every mode writes one Long Save through one Company API** (WS-8: "all modes write one Long Save — needs the WS-6 write facets day 1, not per-mode save formats") (§2.1 R-3, §2.2 R-3).

Canonical schema text is preserved verbatim in **Appendix C**.

## Consequences

**MySQL system-of-record, relational not blob** — "the killer queries are relational by nature" (level-3→level-9 reference joins, attribution walks, lineage edges, museum joins); per-facet JSON leaf blobs are never query surface (§4.6 stack verdict). **Events-first storage** rule: storing aggregates instead of events silently kills Past-Self, obituaries, depositions, docent tours — "the game's most distinctive content class" (§8 RISK-8, §4.6 R1).

**Modes never mutate Company mid-run.** Settlement commits a `writes[]` batch (atomicity, Ironman integrity, museum provenance "every exhibit names its run + seed") (Appendix C write protocol, §4.6).

**Schema versioning + one-way-door migrations are first-class features** (~300 h migration policy): "the Long Save is THE product"; migrations must be exercised in every CI run; migration against a 300-hour save is "the project's most user-hostile possible failure" (§2.2 R-3, §8 RISK-8). A **v1→v2 mid-save migration dry-run** is a Phase-1 acceptance artifact (§7.7 slice c).

**The save format is coupled to determinism** (WS-1 R-F): run state compresses to `seed + input_log + periodic checkpoints`; **WS-6 must adopt the engine's checkpoint format, never invent its own** (§3.3, §4.1, §4.6, §8 RISK-8).

**Retention policy is a real TODO before v1** — three unbounded append-only streams (`attribution_events`, `treatment_log`, `input_log`) over hundreds of hours (§4.6 L-size discipline, §8 RISK-8).

**Local-first for SP:** IndexedDB durable write-behind; sync = pushing signed settlement batches; the hot working set lives in the browser worker's memory, Dragonfly for relay/streak/leaderboard atomics (§4.6 stack verdict).

**OPEN — mode write-access matrix (A/B/C), register ID OD-8.** Which modes may write what to the lineage tree: A full writes / **B ledger-only** (sandbox/Incident/Analyst write medals & streaks but zero scars/rep/cash — Bulletproof precedent + L8 wording; specialist lean, flagged MOST URGENT by WS-6) / C per-mode bespoke. It is **the contract between every mode and the Long Save**; blocks WS-8 co-op scope + WS-4 prestige tuning. Option B is asserted cheaply by the Phase-1 Consultant shadow-instance test (§6.2 OD-8, §7.7 slice c). *Traceability note: §2.2 R-3's prose refers to this same item as "OD-9"; the authoritative Open Decisions register (§6.2) numbers it **OD-8** (with co-op save ownership as OD-9). The §6 register numbering is used throughout these docs.*

## Source
`MASTER_REPORT.md` §2.1 (R-3), §2.2 R-3, §3.2 (Long Save row), §3.3 (CompanyNode artifact), §4.6 (WS-6 theses, catalogue, stack verdicts, R1/R3/R4), §5/Appendix C (canonical schema), §6.2 OD-8 (mode write-access matrix OPEN), §7.7 slice c, §8 RISK-8.
