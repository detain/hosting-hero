# DECISIONS PENDING — Open-Decisions Register (OD-1 … OD-20)

**Source of truth:** `reports/MASTER_REPORT.md §6`. Citations: a bare `§N.M` = a section of `MASTER_REPORT.md`; source-doc headings are always written `hosting_game.md §x.y`.
**Rule for implementers:** none of these may be resolved silently in code. Each maps to a named config knob in `docs/PHASE1-PLAN.md` / `docs/CONVENTIONS.md §5`. **§0 legend:** OPEN = owner decision requested; PENDING = sub-decision created *by* a ratified decision, recommendation given, owner sign-off outstanding.

The **five primary items (OD-1 … OD-5)** lead because they gate build order and scope. OD-6 … OD-20 are secondary but traceable.

---

## Primary owner decisions (§6.1)

### OD-1 — Scorecard: uptime-first vs conversion-first — **OPEN, owner-level**
- **One-line context.** The five-axis Quarterly Review grade needs a default weighting philosophy; `hosting_game.md §9.13` leans conversion-first **twice** ("the premise says you win by *letting the right things through*, not stopping things"), and a convergence candidate both camps accept is "score availability against *commitment*, not raw uptime." Raised independently by WS-1/WS-4/WS-6/WS-8.
- **Options.** (a) uptime-first; (b) conversion-first; (c) score against commitment (reconciliation).
- **Blocks.** **The build order itself** — needed *before WS-1/WS-7 freeze their build order* (§6.1). Also WS-3 content budget (→OD-3), gate-G5 slice scoring (G5 runs both forks over one save), meta rewards (WS-6 L9–L12), and *which counter "wins" G1*.
- **Knob.** `scorecard.weights` = **UNSET** (G5 must grade both forks).

### OD-2 — Canonical tuning sheet A / B / C — **OPEN, owner-level**
- **One-line context.** Three tuning sheets coexist (A ≈ physics/queue curves, B ≈ service/price tables, C ≈ progression/economy pacing); the choice is not balance but **which constants are load-bearing law** — the "upkeep semantics" war is *schema-visible* and leaks into the type-bundle schema and the policy-card upkeep field. Full conflict table verbatim in report Appendix D.
- **Options.** (a)/(b)/(c) plus ride-along fixes that ship with whichever is picked: **month length** (hosting_game.md §7.13 ~7 real-min vs Sheet B's 4), **game-slot price** $3–15 vs $0.85, **backup-storage bands ~3× apart**, per-rule upkeep convention.
- **Blocks.** Gate-1/Gate-5 numeric acceptance thresholds (ρ-knee session design, sawtooth `P(n)` tables), Ruleset Card baseline fields, tuning-harness CI, WS-3 bundle defaults. G1 *starts* fine (bounce LUT is sheet-stable) but its feel calibration waits.
- **Knobs.** `tuning.sheet` = **UNSET**; `tuning.monthLengthRealMin` = **UNSET between 7 and 4** (G5 uses the hosting_game.md §7.13 ratio and refuses to silently choose).

### OD-3 — Content rebalance: ~200 threats vs ~45 visitors — **OPEN, owner-level**
- **One-line context.** The doc's census carries ~200 threats against ~45 visitors (hosting_game.md §9.6 "threat mass vs service mass"); if the scorecard leads with conversion the funnel is under-supplied, if uptime then threat breadth outpaces counter-authoring.
- **Options.** (a) keep ~200; (b) prune toward parity; (c) **WS-3's third path** — threats survive only if *mechanically distinct* in the 12-step pipeline, else become **Codex-only** entries (real, citable, deposit-able, never spawned).
- **Lean.** WS-3 recommends (c).
- **Blocks.** WS-3 content-production plan, WS-1 fairness-validator scope, Versus draft-pool design (R-4), Campaign scar table, art budget.
- **Knob.** `content.threatVisitorCensus` = **UNSET**.

### OD-4 — Ratification batch (four pre-named items) — **OPEN, batch sign-off requested**
- **One-line context.** Resolutions already drafted and defended in the fleet; the ask is *ratifying wording*, not new design (§6.1).
  - **4a. Triage Window + Attention Grace** — replace "site down ~30 s nobody arriving" with arrivals queuing *visibly outside* + auto-dedup/held pages; **residual sub-choice:** Attention Grace's "free focus hand" is the only hand-creation event (violates hands-as-physics) → ratify as **bounded loan** or strip to suppression-only. Blocks: WS-1 arrival/routing guards, WS-7 Panic Layout, WS-6 sawtooth trough depth, WS-8 slice A beats.
  - **4b. Telegraph bands** — four-band law (Weather always visible / Storms telegraphed / Hunters symptom-only / Entropy "foresight is a purchase"); **residual:** entropy purchases grow the policy grammar's metric namespace per tier. Blocks: WS-3 bundle addendum, WS-5 rule validation, WS-8 wave-envelope validator (G3 wording).
  - **4c. Batch-rung-4 reconciler card type** — "keep this true" is a reconciler paradigm ≠ reflex grammar → separate deferred card type (WS-5 lean) or v1 reflexes-only. Blocks: WS-3 rung-4 unlock row, WS-5 interpreter scope, WS-6 ladder rung 4 XP.
  - **4d. Policy-grammar freeze policy** — the grammar table becomes a **frozen spec artifact**; extensions require an owner decision event (G7 candidates pre-logged). Blocks: grammar-pack pipeline, Appendix A `grammarVersion`, Versus deck serialization stability.
- **Knob.** interpreter/scope flags behind A/B in slice (a); `grammarVersion` pin.

### OD-5 — MP topology under browser-authoritative sim — **PENDING (fleet recommendation: option b)**
- **One-line context.** Created *by* R-2 + R-6: with the sim authoritative in a browser worker, who hosts a multiplayer session's ground truth? (§2.2, §6.1.)
- **Options.** (a) host-authoritative browser: a seat's worker runs the session; Workerman relays per-seat **observed projections only** (never ground truth). (b) **TS sim as portable library:** same core on **Node** for MP sessions + all headless needs (Async-Versus R-4, Long Weekend, Analyst forward-sims — already forced), browser for SP; Workerman stays services/transport/notary.
- **Fleet recommendation: (b).** One codebase everywhere; determinism-as-crash-recovery becomes server-side (host crash → re-sim on another Node from seed+intent-log in seconds-to-a-minute); MP anti-cheat clean by physical seat placement; WS-8 slice A is pre-built as its feasibility demo. (a)'s only edge: no Node process class to operate. **The repo is scaffolded per (b)** (`tools/headless` Node port exists; slice (d) runs on it as the proof) — this is scaffolding, **not** a resolved decision (§2.2 sub-decision, `docs/ARCHITECTURE.md §10`, `docs/CONVENTIONS.md §1.2`).
- **Blocks.** Co-op session ops plan; WS-6 D-6.6 save-trust variant (resolves under b); co-op pause authority (a Node host turns host-vote into **server-vote**); prototype-A final scope; WS-4 Decision-Audit placement (background worker vs Node).
- **Does NOT block Phase 1** — every gate slice runs identically under either option (§6.1 OD-5).
- **Knob.** `mp.topology` = **UNSET (scaffolded to (b))**.

---

## Secondary open decisions (§6.2)

| # | Decision | One-line context | Lean | Blocks |
|---|---|---|---|---|
| **OD-6** | Hands vs executive attention | Sequential (hands T0–4, attention replaces at T5+) vs **Two-Denominations** (one pool, attention = your special hand, monthly replenish) | two-denominations ("strictly simpler for determinism") | Delegation-bands modeling, rule-cost accounting, attendance math, The Bridge tempo, WS-7 Hands Dock |
| **OD-7** | Accounting-depth menu (i)–(vii) | Recommended v1 line: (i) cash buckets + (ii) invoices/aging + (v) deferred revenue + (vi) dunning; (iii) reduced to a visual; (iv)/(vii) Tier-4+ unlocks | as listed | Gate-5 slice scope, Book-board UI budget, C5-restated ledger fields |
| **OD-8** | Mode write-access matrix A/B/C | Which modes write what to the lineage tree: A full / **B ledger-only** (sandbox/Incident/Analyst write medals & streaks, zero scars/rep/cash) / C bespoke | **B — MOST URGENT (WS-6)** | WS-8 mode contracts + co-op save ownership; WS-4 revenue isolation. (*§2.2 R-3 prose labels this "OD-9"; the authoritative §6.2 register numbers it OD-8.*) |
| **OD-9** | Co-op save ownership | One Company, 2–4 writers: shared "branch" node writing museum artifacts + scars to each participant but not customers/cash? Deepest WS-6↔WS-8 interface question | none stated | Co-op v1 scope; depends on OD-8 + OD-5 |
| **OD-10** | Clock instruments (Ribbon vs dials) + max-legibility speed 3× vs 2× | Both fed by one clock service (dials-in-bezel glance + ribbon-on-demand scrub); P5's 3× vs hosting_game.md §8.9's 2× — stale number or deliberate? | ribbon+dials unified service; speed 2× until G1 playtests | WS-7 HUD v1 shortlist #1, Bezel contract; WS-1 `simUs` speed param |
| **OD-11** | Ship order: Consultant vs Bootstrapped | Two run structures over the same systems; "ship one first, the other as its mirror" | Consultant (highest-return single addition) | v1.1 plan; WS-6 endings-suite ordering |
| **OD-12** | Render-surface bits (WS-7 Q4–Q7 + gaps) | (a) violet trust-auth ports vs white+keyed; (b) Confidence-Blur vs Attachment-crispness; (c) Hands Dock placement; (d) who audits visual coverage (hosting_game.md §8.18) — proposed **manifest-lint CI rule**; (e) hardware target, atlas pipeline, iso picking, keymap/focus order, l10n budgets | as proposed | WS-7 shader tables, content-build CI, a11y sprint timing (interlocks OD-16) |
| **OD-13** | Save trust policy (re-scoped by C9; depends on OD-5) | (1) client-authoritative + periodic notarization (fits ratified SP contract) vs (2)′ server-authoritative re-sim via **Node port**; Ironman/cloud-sync collision | (1) for SP; (2)′ only where value crosses players | WS-6 sync UX, leaderboard integrity; OD-5 interaction |
| **OD-14** | Canonical type count | Doc drifts 20 / 30 / 32 / 34 / 61; audit proposes ~7 doc-merges + ~6 rec-merges | merge proposals → ~34 line entries / 20 launch-bundle | WS-3 production plan, hum/era token coverage, marketing copy |
| **OD-15** | Engine-doctrine bless bundle | Ratify doc-⚔️ resolutions (waves-vs-continuous envelope; mazing "never maze the express lane"; bottleneck-highlight as purchased probe; fast-forward-during-alerts auto-pause-as-rule-card; **emergent-storm severity cap** — doc silent, needs a new decision before G3 calibration) | bless hosting_game.md §1.7 wording; D-7 recommend bounded storm severity | WS-1 core-loop guards, WS-2 routing verbs, WS-5 auto-pause merge, gates G1/G3 tuning ceilings |
| **OD-16** | Mode-list amendments | Ratify ~15 orphan re-tierings; build Minimalist glyph ⇄ Shape-First a11y skin **once**; ethics standing author law; SP-Handover ships regardless; Versus transport policy **and live-ops appetite** (frozen formats-as-data vs live ratings/meta/banlist); co-op pause gap | adopt tiering; frozen-format *before* live Versus | v1 feature list, a11y sprint plan, Versus scheduling |
| **OD-17** | ICS coordination model | Roles are multiplier badges — "attention modeled beautifully, coordination not at all" (hosting_game.md §9.13 #10); options A shared-incident-timeline dual-use / B info-partitioned + huddle / C duplicate-action interference / D comms fidelity / E coordination-tax in co-op only | **A**, optionally +C later | Incident Command screens (R39), WS-8 shared timeline (slice A), WS-7 Timeline Ribbon |
| **OD-18** | Rule-masking content mandate | "A rule can mask its root cause" needs threats authored to *look like* the condition a rule was written for — a WS-3 authoring-law obligation nothing currently guarantees | adopt as authoring law + one seed example per shipped type | Appendix A `lookalikeOf` field, WS-3 authoring QA (want answered before G6 schema freeze) |
| **OD-19** | Mastery-budget collision | WS-6's proposed 25 h arc schedule (Prologue / Act I downshift-as-mastery / Act II Hardest Lesson after demonstrated churn / Act III Ratchet Audits-as-mastery) — needs tuning-owner sign-off once OD-2 lands | adopt schedule as proposal | Campaign act table |
| **OD-20** | Misc confirms (low-risk paper) | WS-4 HUD-slot/MRR-exemption/sacrifice-ladder/resolved-on-paper list + WS-6 scar-cap wording (cap = *active modifier slots*, history immortal) — **confirm no re-litigation** | adopt as listed | HUD budget rows, postmortem scoring text |

---

## Config-knob summary (what must fail loudly, not default silently)

| Knob | OD | Default |
|---|---|---|
| `scorecard.weights` | OD-1 | UNSET |
| `tuning.sheet` | OD-2 | UNSET |
| `tuning.monthLengthRealMin` | OD-2 | UNSET (7 vs 4) |
| `content.threatVisitorCensus` | OD-3 | UNSET |
| `mp.topology` | OD-5 | UNSET (scaffolded to `(b)`) |

**Owner-decision checkpoints from the build order (§7.8 step 9):** OD-2 before G1 calibration ends · OD-1 before the G5 score-screen build · the OD-4 batch before G3 wording and before interpreter freeze · OD-5 anytime before slice (d) hardens — nothing in gates 1–7 waits on it.
