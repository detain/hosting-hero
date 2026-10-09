# DECISIONS PENDING — Open-Decisions Register (OD-1 … OD-20)

> **2026-10-09 calibration session:** most rows below are now **DECIDED** — the
> canonical record is `docs/adr/0009-owner-ratifications-calibration.md`
> (ADR-0009, `ea7acee`); execution landed on the calibration wave (tip `779dea9`,
> SHAs cited per row). History is preserved in place: options, contexts, and
> blocks stay as the record of what was asked.
> **Legend extension:** **DECIDED** = owner ratified 2026-10-09 (execution SHA
> cited); **RECORDED** = decided, implementation deliberately deferred to a
> later lane (record-only, `ea7acee`).

**Source of truth:** `reports/MASTER_REPORT.md §6`. Citations: a bare `§N.M` = a section of `MASTER_REPORT.md`; source-doc headings are always written `hosting_game.md §x.y`.
**Rule for implementers:** none of these may be resolved silently in code. Each maps to a named config knob in `docs/PHASE1-PLAN.md` / `docs/CONVENTIONS.md §5`. **§0 legend:** OPEN = owner decision requested; PENDING = sub-decision created *by* a ratified decision, recommendation given, owner sign-off outstanding.

The **five primary items (OD-1 … OD-5)** led because they gated build order and scope — **all five DECIDED 2026-10-09.** Of OD-6 … OD-20: OD-6, OD-8, OD-13 decided/recorded; the rest stay OPEN (see the register).

---

## Primary owner decisions (§6.1)

### OD-1 — Scorecard: uptime-first vs conversion-first — **DECIDED 2026-10-09 (option c) — live at `24dfcfe`**
- **Decision.** **(c) commitment-convergence is ACTIVE** — availability is scored against the SLA **sold**, not a generic uptime target; the conversion-funnel axis is **displayed leading**; G5 keeps grading **both forks** over the same save as comparison data, but the active weight set is the C-set (`economy/scoring.ts` `defaultScorecardConfig.active = "commitment-convergence"`). ADR-0009 §3 rec #1.
- **One-line context.** The five-axis Quarterly Review grade needs a default weighting philosophy; `hosting_game.md §9.13` leans conversion-first **twice** ("the premise says you win by *letting the right things through*, not stopping things"), and a convergence candidate both camps accept is "score availability against *commitment*, not raw uptime." Raised independently by WS-1/WS-4/WS-6/WS-8.
- **Options.** (a) uptime-first; (b) conversion-first; (c) score against commitment (reconciliation). **(c) chosen.**
- **Blocks. (historical)** **The build order itself** — needed *before WS-1/WS-7 freeze their build order* (§6.1). Also WS-3 content budget (→OD-3), gate-G5 slice scoring (G5 runs both forks over one save), meta rewards (WS-6 L9–L12), and *which counter "wins" G1*.
- **Knob.** `scorecard.weights` = **"commitment-convergence" ACTIVE** (`24dfcfe`); `getActiveScorecard` throws only for configs explicitly passing `active: null` (fail-loud law kept).

### OD-2 — Canonical tuning sheet A / B / C — **DECIDED 2026-10-09 (Sheet B) — live at `24dfcfe`**
- **Decision.** **Sheet B canonical**; `waves/pressure.ts` `ACTIVE_TUNING_SHEET = "B"` with B `status:"RATIFIED"`. The month **stays 7 real-min** — `BUSINESS_SCALE_DEFAULT {43200n, 7n}` kept, the 4-min flip **DECLINED** (§7.13 doctrine wins over Sheet B's own row). Sheet A becomes a landlord-convention derivation later; Sheet C becomes realism-toggle data later — both keep honest `PROVISIONAL` tags. The ~40 economy PROVISIONAL value-constants await a later tuning pass (the SHEET question is settled; the values are not). ADR-0009 §3 rec #2.
- **One-line context.** Three tuning sheets coexist (A ≈ physics/queue curves, B ≈ service/price tables, C ≈ progression/economy pacing); the choice is not balance but **which constants are load-bearing law** — the "upkeep semantics" war is *schema-visible* and leaks into the type-bundle schema and the policy-card upkeep field. Full conflict table verbatim in report Appendix D.
- **Options. (historical)** (a)/(b)/(c) plus ride-along fixes that ship with whichever is picked: **month length** (hosting_game.md §7.13 ~7 real-min vs Sheet B's 4), **game-slot price** $3–15 vs $0.85, **backup-storage bands ~3× apart**, per-rule upkeep convention.
- **Blocks. (historical)** Gate-1/Gate-5 numeric acceptance thresholds (ρ-knee session design, sawtooth `P(n)` tables), Ruleset Card baseline fields, tuning-harness CI, WS-3 bundle defaults. G1 *starts* fine (bounce LUT is sheet-stable) but its feel calibration waits.
- **Knobs.** `tuning.sheet` = **"B" ACTIVE** (`24dfcfe`); `tuning.monthLengthRealMin` = **7 KEPT** (4-min declined; zero code change — shipped default was already correct). Content-side wire markers (`packages/content/types/shared-web.json` `"tuningSheet": "PROVISIONAL-B"`) stay pre-ratification until the owner re-author sweep — see MODULE-STATUS gap row.

### OD-3 — Content rebalance: ~200 threats vs ~45 visitors — **DECIDED 2026-10-09 (option a, owner override) — recorded `ea7acee`, no engine code**
- **Decision.** **(a) KEEP ~200 MECHANICAL THREATS** — the owner **overrode the fleet recommendation (c)**; the §9.6 pruning path toward ≈45 visitors is REJECTED. Consequences as binding law (ADR-0009 §2): fairness-validator scope grows to EVERY registry threat's counter (Second-Answer invariant, all-registry); §9.6 "every new threat creates a visitor/conversion reason" becomes the pacing-valve authoring law; Versus draft pools stay wide; art FX-pairing budget scales to ≈200. Content-plan consequence — zero engine flip in code, hence the record SHA is the ADR commit.
- **One-line context.** The doc's census carries ~200 threats against ~45 visitors (hosting_game.md §9.6 "threat mass vs service mass"); if the scorecard leads with conversion the funnel is under-supplied, if uptime then threat breadth outpaces counter-authoring.
- **Options. (historical)** (a) keep ~200; (b) prune toward parity; (c) **WS-3's third path** — threats survive only if *mechanically distinct* in the 12-step pipeline, else become **Codex-only** entries (real, citable, deposit-able, never spawned). **(a) chosen over WS-3's rec of (c).**
- **Blocks. (historical)** WS-3 content-production plan, WS-1 fairness-validator scope, Versus draft-pool design (R-4), Campaign scar table, art budget.
- **Knob.** `content.threatVisitorCensus` = **~200 mechanical threats (option a)**.

### OD-4 — Ratification batch (four pre-named items) — **RATIFIED 2026-10-09 — recorded `ea7acee` (ADR-0009 §1)**
- **One-line context.** Resolutions already drafted and defended in the fleet; the ask was *ratifying wording*. **Granted 2026-10-09**, with two honest coverage notes: the 4a engine slice and the 4b schema field are owed by FUTURE lanes, not this wave.
  - **4a. Triage Window + Attention Grace — RATIFIED, focus hand as BOUNDED LOAN.** The special focus hand is extended on window entry; **attention debt is repaid in the next window**; the loan is the ONLY hand-creation event and it is **ledgered**. The engine slice is a later design lane. *Historical residual:* Attention Grace's "free focus hand" was the only hand-creation event (violated hands-as-physics) → resolved as bounded loan, not suppression-only. Blocks (historical): WS-1 arrival/routing guards, WS-7 Panic Layout, WS-6 sawtooth trough depth, WS-8 slice A beats.
  - **4b. Telegraph bands — CANONICAL NOW; `metricNamespaceTier` ratified as a FUTURE bundle field.** The four-band law (Weather always visible / Storms telegraphed / Hunters symptom-only / Entropy "foresight is a purchase") is law and the shipped data already honors it (`waves/bands.ts`, loader `WAVE_BAND_VOCAB`, registry `bandsVocabulary`). **Honest ledger: the field does not exist on disk** — `type-bundle.schema.json` / `bundle.ts` carry zero occurrences and the parser rejects unknown keys, so the schema+loader lane that adds it is OWED by this ratification. *Historical residual:* entropy purchases were to grow the policy grammar's metric namespace per tier — now bundle data, never engine branching.
  - **4c. Batch-rung-4 reconciler card type — SEPARATE card type, deferred unlock.** It is neither a clause bolted onto existing cards nor a v1 reflex: **v1 stays reflex-only**; a future unlock event grants the type; until then no bundle may reference it.
  - **4d. Policy-grammar freeze — FROZEN as a spec artifact.** This freezes the **policy-card EBNF grammar** (the `when/for/then/unless` composer vocabulary of WS-5; **Appendix B verbatim** is the grammar) — *not* the GLOSSARY's Level Grammar (scenario-shape columns, untouched). Extensions only by owner decision event; a lane adding a grammar construct is a law breach. **The G7 cooldown lands as a BOUGHT VERB, never a clause** (the verb's engine slice is not yet built or queued).
- **Knob.** (historical — interpreter/scope flags behind A/B in slice (a); `grammarVersion` pin) → grammar version is now frozen law; A/B/C slice flags remain tuning taste.

### OD-5 — MP topology under browser-authoritative sim — **DECIDED 2026-10-09 (option b) — recorded `ea7acee`; ARCHITECTURE §10 flipped (docs queue 9)**
- **Decision.** **(b) TS-sim-as-portable-library** — one TypeScript sim runs as a library in the browser (single-player) and under Node (MP sessions + all headless needs); PHP/Workerman stays services/transport/notary. The repo's existing scaffold **is the ratified shape** — no code owed beyond the §10 wording flip. ADR-0009 §3 rec #5.
- **One-line context.** Created *by* R-2 + R-6: with the sim authoritative in a browser worker, who hosts a multiplayer session's ground truth? (§2.2, §6.1.)
- **Options. (historical)** (a) host-authoritative browser: a seat's worker runs the session; Workerman relays per-seat **observed projections only** (never ground truth). (b) **TS sim as portable library:** same core on **Node** for MP sessions + all headless needs (Async-Versus R-4, Long Weekend, Analyst forward-sims — already forced), browser for SP; Workerman stays services/transport/notary. **(b) chosen — fleet recommendation adopted.**
- **Fleet recommendation was (b); now ratified law.** (a)'s only edge: no Node process class to operate. The repo was already scaffolded per (b) (`tools/headless` Node port exists; slice (d) runs on it as the proof) — that scaffolding is now the decision's shape, not a placeholder (§2.2 sub-decision, `docs/ARCHITECTURE.md §10`, `docs/CONVENTIONS.md §1.2`).
- **Blocks. (historical)** Co-op session ops plan; WS-6 D-6.6 save-trust variant (resolves under b — OD-13 likewise recorded); co-op pause authority (a Node host turns host-vote into **server-vote**); prototype-A final scope; WS-4 Decision-Audit placement (background worker vs Node).
- **Did NOT block Phase 1** — every gate slice ran identically under either option (§6.1 OD-5).
- **Knob.** `mp.topology` = **(b) RATIFIED — TS-portable-library**.

---

## Secondary open decisions (§6.2)

| # | Decision | One-line context | Lean | Blocks |
|---|---|---|---|---|
| **OD-6** | Hands vs executive attention — **RECORDED DECIDED 2026-10-09 (`ea7acee`, ADR-0009 rec #22): Two-Denominations — one pool, attention = the special hand, monthly replenish; implementation is a LATER DESIGN LANE (interacts with OD-4a's loan ledger)** | Sequential (hands T0–4, attention replaces at T5+) vs **Two-Denominations** (one pool, attention = your special hand, monthly replenish) | **chosen** (was the lean: "strictly simpler for determinism") | Delegation-bands modeling, rule-cost accounting, attendance math, The Bridge tempo, WS-7 Hands Dock |
| **OD-7** | Accounting-depth menu (i)–(vii) | Recommended v1 line: (i) cash buckets + (ii) invoices/aging + (v) deferred revenue + (vi) dunning; (iii) reduced to a visual; (iv)/(vii) Tier-4+ unlocks | as listed | Gate-5 slice scope, Book-board UI budget, C5-restated ledger fields |
| **OD-8** | Mode write-access matrix A/B/C — **DECIDED 2026-10-09: Matrix B — LIVE at `74f157b`** (scenario/daily/consultant/blitz flip pending→LIVE: **160 of 192 rows LIVE / 32 endless rows stay `PENDING_OD8`, contested**; `guardBatch` deny-facet writes now THROW and abort the settlement, §2.4 atomicity; ADR-0009 §3) | Which modes write what to the lineage tree: A full / **B ledger-only** (sandbox/Incident/Analyst write medals & streaks, zero scars/rep/cash) / C bespoke | **B — chosen** (was "MOST URGENT (WS-6)") | WS-8 mode contracts + co-op save ownership; WS-4 revenue isolation. (*§2.2 R-3 prose labels this "OD-9"; the authoritative §6.2 register numbers it OD-8.*) |
| **OD-9** | Co-op save ownership | One Company, 2–4 writers: shared "branch" node writing museum artifacts + scars to each participant but not customers/cash? Deepest WS-6↔WS-8 interface question | none stated | Co-op v1 scope; depends on OD-8 + OD-5 |
| **OD-10** | Clock instruments (Ribbon vs dials) + max-legibility speed 3× vs 2× | Both fed by one clock service (dials-in-bezel glance + ribbon-on-demand scrub); P5's 3× vs hosting_game.md §8.9's 2× — stale number or deliberate? | ribbon+dials unified service; speed 2× until G1 playtests | WS-7 HUD v1 shortlist #1, Bezel contract; WS-1 `simUs` speed param |
| **OD-11** | Ship order: Consultant vs Bootstrapped | Two run structures over the same systems; "ship one first, the other as its mirror" | Consultant (highest-return single addition) | v1.1 plan; WS-6 endings-suite ordering |
| **OD-12** | Render-surface bits (WS-7 Q4–Q7 + gaps) | (a) violet trust-auth ports vs white+keyed; (b) Confidence-Blur vs Attachment-crispness; (c) Hands Dock placement; (d) who audits visual coverage (hosting_game.md §8.18) — proposed **manifest-lint CI rule**; (e) hardware target, atlas pipeline, iso picking, keymap/focus order, l10n budgets | as proposed | WS-7 shader tables, content-build CI, a11y sprint timing (interlocks OD-16) |
| **OD-13** | Save trust policy (re-scoped by C9; depends on OD-5) — **RECORDED DECIDED 2026-10-09 (`ea7acee`, ADR-0009 rec #21): option (1) — SP saves client-authoritative with periodic notarization; server re-sims only where the save carries cross-player value (versus/co-op/notary). Implementation is a LATER SAVE LANE** | (1) client-authoritative + periodic notarization (fits ratified SP contract) vs (2)′ server-authoritative re-sim via **Node port**; Ironman/cloud-sync collision | **(1) — chosen** | WS-6 sync UX, leaderboard integrity; OD-5 interaction (resolved: (b)) |
| **OD-14** | Canonical type count | Doc drifts 20 / 30 / 32 / 34 / 61; audit proposes ~7 doc-merges + ~6 rec-merges | merge proposals → ~34 line entries / 20 launch-bundle | WS-3 production plan, hum/era token coverage, marketing copy |
| **OD-15** | Engine-doctrine bless bundle | Ratify doc-⚔️ resolutions (waves-vs-continuous envelope; mazing "never maze the express lane"; bottleneck-highlight as purchased probe; fast-forward-during-alerts auto-pause-as-rule-card; **emergent-storm severity cap** — doc silent, needs a new decision before G3 calibration) | bless hosting_game.md §1.7 wording; D-7 recommend bounded storm severity | WS-1 core-loop guards, WS-2 routing verbs, WS-5 auto-pause merge, gates G1/G3 tuning ceilings |
| **OD-16** | Mode-list amendments | Ratify ~15 orphan re-tierings; build Minimalist glyph ⇄ Shape-First a11y skin **once**; ethics standing author law; SP-Handover ships regardless; Versus transport policy **and live-ops appetite** (frozen formats-as-data vs live ratings/meta/banlist); co-op pause gap | adopt tiering; frozen-format *before* live Versus | v1 feature list, a11y sprint plan, Versus scheduling |
| **OD-17** | ICS coordination model | Roles are multiplier badges — "attention modeled beautifully, coordination not at all" (hosting_game.md §9.13 #10); options A shared-incident-timeline dual-use / B info-partitioned + huddle / C duplicate-action interference / D comms fidelity / E coordination-tax in co-op only | **A**, optionally +C later | Incident Command screens (R39), WS-8 shared timeline (slice A), WS-7 Timeline Ribbon |
| **OD-18** | Rule-masking content mandate | "A rule can mask its root cause" needs threats authored to *look like* the condition a rule was written for — a WS-3 authoring-law obligation nothing currently guarantees | adopt as authoring law + one seed example per shipped type | Appendix A `lookalikeOf` field, WS-3 authoring QA (want answered before G6 schema freeze) |
| **OD-19** | Mastery-budget collision | WS-6's proposed 25 h arc schedule (Prologue / Act I downshift-as-mastery / Act II Hardest Lesson after demonstrated churn / Act III Ratchet Audits-as-mastery) — needs tuning-owner sign-off once OD-2 lands | adopt schedule as proposal | Campaign act table |
| **OD-20** | Misc confirms (low-risk paper) | WS-4 HUD-slot/MRR-exemption/sacrifice-ladder/resolved-on-paper list + WS-6 scar-cap wording (cap = *active modifier slots*, history immortal) — **confirm no re-litigation** | adopt as listed | HUD budget rows, postmortem scoring text |

---

## Ratified micro-decision ledger (2026-10-09 session — non-OD rows, ADR-0009 §3)

| Row | Decision | Execution |
|---|---|---|
| **Q-P3-1** | Kill-Switch freeze: **defensive reading CONFIRMED** — a freeze preserves and defers pending consults (verdicts recorded mid-freeze, TTL clock stops); shipped code already implements it — **record-only, zero code change** | `ea7acee` (record) |
| **T-9** | **Racks DEGRADE-ALL + anchor joins `members`**; two-color law is code: power kills RED, rack degrades AMBER; blast goldens + rack-pin tests re-cut DELIBERATELY (audited event) | `8a5f413` |
| **F-2** | Shed-terminates **CONFIRMED KEEP** — hard-ceiling shedding terminates the unit (patience-bounce cause taxonomy stands as landed) | shipped `2eaf830`; ratified `ea7acee` |
| **Pack volume** | i18n over-cap (98 shared-web / 75 game vs ≤60 task-line) **RATIFIED — do not trim** (§9.3 verbatim doc seeds mandated it) | `ea7acee` (record) + content README note (docs wave) |
| **Versus rows** | weightBps=cost keep · affixes inert keep · pool 10 keep · tie law keep · unattributed mint-tick floor accepted · **FLIP: `lookupPolicyCard` keys by CONTENT fingerprint (`hh-card-v1`), not card ids** | `d076ad5` |
| **Economy rows** | ~25 ms steady floor **ACCEPTED** · register batch-API **APPROVED** (`registerContractsEconomy`) · prune stays **OFF** · persist-index declined · snapshots-reshape DEFERRED · rec#4 deferred · `scaleEvent` declined | `d076ad5` (batch API) |
| **Substrate** | **`BUDGET_CAPS.substrate = 1200` SIGNED** + authored-patches law + 4 taste rows ratified; seam self-activated; first-mount stays paired with real atlases | `27f2856` |
| **CI matrix** | **Drop Node 20.x → `["22.x","24.x"]`**; 20.x `--filter` hack deleted; engines prose honest | `779dea9` |
| **Tag policy** | Next tag **v0.3.0 at the end of this calibration wave** (green tip; existing tag history untouched) | record (cut = wave closeout) |
| **Devtools / @pixi/node** | `pixijs/devtools` = **doc-only row**, never a dependency decision; `@pixi/node` pixel-audit CI arm **DEFERRAL CONFIRMED until real sprite atlases exist** | `ea7acee` (record) + ADR-0008 annotation (docs wave) |

---

## Config-knob summary (what must fail loudly, not default silently)

| Knob | OD | Default |
|---|---|---|
| `scorecard.weights` | OD-1 | **"commitment-convergence" ACTIVE (`24dfcfe`)** |
| `tuning.sheet` | OD-2 | **"B" ACTIVE (`24dfcfe`)** |
| `tuning.monthLengthRealMin` | OD-2 | **7 KEPT — 4-min flip declined (shipped default was already correct)** |
| `content.threatVisitorCensus` | OD-3 | **~200 mechanical threats — option (a) (`ea7acee`)** |
| `mp.topology` | OD-5 | **(b) TS-portable-library RATIFIED (`ea7acee`)** |

**Owner-decision checkpoints from the build order (§7.8 step 9):** OD-2 before G1 calibration ends · OD-1 before the G5 score-screen build · the OD-4 batch before G3 wording and before interpreter freeze · OD-5 anytime before slice (d) hardens — nothing in gates 1–7 waits on it. ← **ALL MET 2026-10-09**: the OD-1/OD-2 flips landed `24dfcfe`, the OD-4 batch recorded `ea7acee`, OD-5 ratified `ea7acee` (queue item 9 flips ARCHITECTURE §10). Remaining knob-less tuning taste (PROVISIONAL constants, unattended thresholds, coverage rows, audio audition, era expansion) stays open — see PHASE1-PLAN "Still OPEN".
