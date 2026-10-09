# AUDIT SUMMARY — heading status roll-up (markup applied 2026-10-09, re-markup post-fix-wave 2026-10-09)

Source: 25 group manifests (reports/audit/group-01..25.md) against outline.md Tables 2+3, then **updated in place on disk after the 2026-10-09 fix wave** (16 commits d8fc8ec..a98fd55; per-row dispositions in the hosting_game.md Appendix). The tallies below are computed from the **current marked hosting_game.md**, not the original manifests — they include the 23 fix-wave flips and the small set of marker/manifest drift realignments disclosed in the Appendix.

> Line numbers throughout are ORIGINAL (pre-legend) positions matching reports/audit/outline.md and the group manifests. In the marked hosting_game.md, add **+12** to any line > 43 (the 12-line legend block inserted above the ToC).

## GLOBAL TALLIES (disk truth, post-fix-wave)

| STATUS | marked headings on disk |
|---|---|
| DONE ✅ | 284 |
| PARTIAL 🔧 | 989 |
| PROBLEM ⚠️ | 11 |
| MISSING ❌ | 2275 |
| NA 📝 | 30 |
| **total marked** | **3589** (+2 unmarked out-of-scope headings) |

## PER-SECTION ROLL-UP (marked headings by level-1 section — disk truth)

| section | ✅ DONE | 🔧 PARTIAL | ⚠️ PROBLEM | ❌ MISSING | 📝 NA | total |
|---|---|---|---|---|---|---|
| preamble | 0 | 0 | 0 | 0 | 0 | 0 |
| 0. Foundations | 20 | 10 | 0 | 10 | 9 | 49 |
| 1. Levels, scenarios, and progression | 16 | 86 | 0 | 316 | 2 | 420 |
| 2. Threats | 50 | 98 | 0 | 446 | 1 | 595 |
| 3. Visitors, traffic, and clients | 30 | 79 | 1 | 303 | 0 | 413 |
| 4. Buildables: services and infrastructure | 21 | 119 | 3 | 338 | 0 | 481 |
| 5. Unlocks and discovery | 1 | 115 | 0 | 182 | 1 | 299 |
| 6. Economy, money, and scoring | 36 | 102 | 1 | 250 | 1 | 390 |
| 7. Core gameplay mechanics | 68 | 125 | 0 | 107 | 2 | 302 |
| 8. Visuals and presentation | 23 | 168 | 4 | 155 | 7 | 357 |
| 9. Anything else | 19 | 87 | 2 | 168 | 7 | 283 |
| **TOTAL** | **284** | **989** | **11** | **2275** | **30** | **3589** |

## FIX-WAVE UPLIFT (what moved since the original markup)

- **§5 unlocks (71b8960 engine + d8e5986 driver seam):** 9 rows ❌→🔧 — scar/milestone/era triggers, prereqSets consumer (canUnlock/whatBlocks), codex ladder; observer seam default-off, host wiring owed.
- **§2.24 rules blocks (4856a42 + c9c0433):** Second Incident row ❌→🔧 — feint/secondIncident/copycat consumers exist in planWave; foreign-slice adapter carries the g1 rules block; host inputs (dominantDefenseFamily) still owed.
- **Mail bundle (4c28169):** Postmaster §1.3 + Sorting Table §5.5 rows ❌→🔧 — mail-hosting.json authors the hero, defense, and §5.6 email-gate prereqSets verbatim.
- **§7.10 mazing (cf7a696 + 8fd409a):** two-lane routing rows →✅ (mainline product runner routes deep vs express through the intent door); millisecond-budget row stays 🔧 (served-by-QoS-weight owed).
- **§7.6 decision highlight (50a936a):** producer exists (apps/proto/src/decision/); seam row already 🔧 — no flip needed; Attention Heatmap corrected ✅→❌ (false marker, no telemetry consumer).
- **§6.10 reputation (57ea80e + 45f0edf + a98fd55):** publisher live; the already-🔧 §2.10/§5.10 rows stay 🔧 (gates/scorecard consumption unwired).
- **12846 '### Redirect chains'** — the one unmarked in-scope heading (ANOMALIES #2) — now carries ❌.
- **Palette anchor (0e0d7e1):** palettes/shared-80.json resolves the phantom anchor at DATA level; §4.2–4.4 rows citing it stay ❌ (zero engine consumers of palette slots).

## PROBLEMS (⚠️) — original 15 rows with post-wave disposition

| line | section | heading | group | original note | disposition (2026-10-09 fix wave) |
|---|---|---|---|---|---|
| 11385 | 2. Threats | Matrix C — which threat families dominate which type | g10 | activeFamilies + qualitative _todo ship but familyWeights are null with stale _todo prose awaiting the ratified tuning sheet (OD-2) — OD-2 was ratified sheet B at 24dfcfe yet the weights were never re-authored; owner-gated content debt | ✅ RESOLVED @4856a42 (weights filled in both bundles, parseFamilyWeightsTable + weightedFamilyOf/familyMix consumers live) + cf7a696 (host FAMILY_MIX wired in product runner) |
| 14424 | 3. Visitors, traffic, and clients | The attention budget | g12 | door hands live but support-hands unimplemented, OD-6 two-denomination ruling decided 2026-10-09 with implementation deferred (MODULE-STATUS gap row) | ⚠️ HELD — OD-6 deferral unchanged by the fix wave |
| 15178 | 4. Buildables: services and infrastructure | The Build Role Taxonomy (nine roles) | g13 | The nine build roles are tagged nowhere; coverage/defenseRoles.ts ships the DIFFERENT nine defense roles sharing only four words (Classify/Contain/Detect/Recover) - the spec's shared-tag promise between palette and Coverage Grid is broken | ⚠️ HELD — contradiction recorded in ADR-0010 (proposed) @d8fc8ec; owner ratification owed before either taxonomy moves |
| 16291 | 4. Buildables: services and infrastructure | The Nine Defense Roles | g14 | shipped taxonomy follows the §2.1 list (absent Block, added Negotiate) — contradicts this heading's enumeration | ⚠️ HELD — same ADR-0010 pending record @d8fc8ec |
| 16331 | 4. Buildables: services and infrastructure | Defense-in-Depth stacking rules | g14 | matrix.ts combine law is MAX never multiplicative (deliberate, docblock cites §2.1 ratification), no latency-additive/diminishing/synergy/Waste-Indicator | ⚠️ HELD — same ADR-0010 pending record @d8fc8ec |
| 22940 | 6. Economy, money, and scoring | 6.5 Pricing as a mechanic | g18 | Pricing is engine-side data (MRC/cliff/escalator/MFN/grandfather) with NO player pricing verb among the 8 door verbs; 21 of 29 dials unbuilt; oversell slider declared-dead (22992) | ⚠️ HELD — no player pricing verb shipped; door verb set closed at 8 |
| 22992 | 6. Economy, money, and scoring | The oversell ratio | g18 | shared-web.json:84 commercialSlider "oversell-ratio" + rosetta card parsed (loader/bundle.ts:112,616; R16 lint hook) but ZERO engine consumers — dead slider; P(contention)=ratio^2.2 x homogeneity never computed | 🔧 PARTIAL @4856a42 — contentionProbabilityMicro(r,h)=f(r)×h ships in waves/contention.ts + planWave oversell input; host-side wiring (bundle slider value → planWave oversell) still owed |
| 31543 | 8. Visuals and presentation | The readability targets | g23 | perf grid harness exists but 2k/20k figures are OD-10/OD-12 unratified and unmeasured | ⚠️ HELD — OD-10/OD-12 unratified |
| 31810 | 8. Visuals and presentation | Era presentation shifts | g23 | era-tokens.css ships 1998/2026 only; MODULE-STATUS era-count row awaits owner era grid | ⚠️ HELD — owner era grid not provided |
| 31837 | 8. Visuals and presentation | Era UI skins, enumerated | g23 | 2 of 5 enumerated skins; owner-gated per MODULE-STATUS era row (same as above) | ⚠️ HELD — owner-gated |
| 32326 | 8. Visuals and presentation | The full accessibility affordance list | g23 | plan promised a11y CI harness "from day one"; PHASE1-PLAN:165 admits only Shape-First+Readout shipped | 🔧 PARTIAL @9b32cc5 + 942834f — roster ledger (chrome/a11y/roster.ts, 11 rows) + contrast-audit + motion-audit acceptance gates; 4 of 11 rows live |
| 32366 | 8. Visuals and presentation | Era display faces | g23 | only 2 era faces via era tokens; same owner-gated era grid (MODULE-STATUS era row) | ⚠️ HELD — owner-gated |
| 32505 | 8. Visuals and presentation | The acceptance-test roster | g23 | 1 of 11 gates (Chroma Meter) shipped; PHASE1-PLAN:165 records the harness as partial | 🔧 PARTIAL — 4 of 11 gates live after 9b32cc5/942834f (greyscale-pass, chroma-meter, strobe-budget-check, contrast-audit-mode) |
| 32694 | 9. Anything else | Endless / Survival ("The NOC" / "The Long Haul" / "Keep It Running") | g24 | endless rows held PENDING_OD8 (32 rows contested) per DECISIONS-PENDING OD-8, no loop shipped | ⚠️ HELD — OD-8 rows still contested |
| 33137 | 9. Anything else | ⚔️ Mode tiering — twenty-six modes is too many, and none of them are prioritised | g24 | OD-16 open in DECISIONS-PENDING (ratify ~15 orphan re-tierings), tiering adopted-as-law nowhere | ⚠️ HELD — OD-16 open |

11 rows HELD at ⚠️ (all owner-gated or OD-deferred), 4 rows uplifted (1→✅, 3→🔧).

## NOTABLE PARTIALS (🔧)

Every heading cited in a group's TOP-PROBLEMS that is a PARTIAL row (69 of the 5–15 per group; PROBLEM/MISSING citations appear in their own sections).

### 1. Levels, scenarios, and progression

- **1137 — The business difficulty curve** (g01): Business difficulty axis 4 (decision time-constants lengthening per rung) has no representation; the ladder rows (1075/1137/1156) are all PARTIAL/MISSING because campaign gating does not exist even though every underlying money primitive does.
- **1510 — Authoring requirements for every hosting-type entry (design law)** (g02): **Returning-visit hook is not in the bundle schema (line 1510).** The design law calls field 3 the difference between mastery content and one-off novelty, yet type-bundle.schema.json `required[]` carries verbs.dominant, verbs.transfers and handoverNote but no second-visit field — 2 of the 3 mandated per-entry fields are machine-enforceable, the campaign rhythm is not.
- **1742 — "The Launch Window" — Game hosting, scenario variant** (g02): **Scenario analogues are named but hollow (lines 1742, 1750).** launch-window / private-shard exist only as data hooks + i18n copy lines; a consumer reading game-servers.json scenarios could mistake the references for implemented level variants.
- **3766 — `Collections Week`** (g03): **Economy machinery quietly covers three collection/renewal scenarios at mechanism level**: dunning.ts FSM + six-bucket cash divergence (Collections Week, Deadbeat Quarter) and contract.ts renewal cliff/pulse (Contract Recompete). The player-facing decision layers (per-account cards, negotiation minigames) are the gap.
- **4336 — The difficulty dials, assigned to layers (contradiction resolution)** (g04): Difficulty selector stack unresolved in code (4336/4354/4362/4371): only the SLA-as-contract layer ships; the faction selector, price dial and operator modifiers named in the contradiction-resolution stay prose — Pressure Estimate has no emitter.
- **4382 — Authentic difficulty knobs (rather than arbitrary multipliers)** (g04): Anti-Turtle (4662) and authentic knobs (4382): three of five named difficulty axes (oversubscription ratio, lead time, config drift) have no state anywhere; only fog-as-observability and hands-as-scarcity are real systems.
- **4628 — Grace Windows → the Triage Window / the Attention Grace** (g04): Triage Window / Attention Grace (4628) is ratified (OD-4a, ADR-0009 `ea7acee`, bounded attention loan) yet its engine slice is explicitly deferred — the one anti-death-spiral mechanic players will hit first in any loss run.
- **5880 — `Observability Debt`** (g05): **Engine enablers deserve promotion notes**: unattended/fastForward (`a864061`) is effectively the Ratchet-Audit and Dry-Run simulator; `replay/causality.ts` (`b9295b5`) is the Postmortem's multi-factor cause tracer; ObservedStore fog (`55a6086`) is Blind Mode/Observability Debt. Three of §1.12's most distinctive level types and three §1.13 mutators are therefore closer than the MISSING count suggests.
### 2. Threats

- **6214 — The Second Incident rule** (g06): 6214/6225/6249 Second Incident, Feint, Copycat — declared as data in g1 slice rules blocks but no engine consumes them; risk of these silently becoming dead config.
- **6622 — Connection Exhaustion** (g06): 6622 Connection Exhaustion — engine models it as core law while it is absent from the threat registry; role-registry vs engine-capability coverage gap worth reconciling in Phase 2 catalog work.
- **6819 — The Mimic Tell (design law)** (g06): 6819 Mimic Tell — the perceptual law (four non-colour channels, greyscale survival) is the game's "deepest skill" per spec, yet only the abstraction-level substrates (heartbeat, altitude ladder, confidence pips) exist; no tell rendering or training exists.
- **7154 — Brute Force Drip** (g07): Brute Force Drip (7154) is the only 2.6 concept with shipped existence — as `wp-login-brute-squad` in registry-core.json + the g1-shared-web slice. The doc's distinct credential-theft taxonomy (stuffing, insider, ex-employee, vishing, control-panel living-off) has no staff, credential, or account entity in the engine to hang on; the whole human-threat layer needs a staff/HIM model that Phase-1 never scoped.
- **7321 — Control Panel Exploit** (g07): The five PARTIALs (7321 Control Panel Exploit, 7438 Fiber Cut, 7532 Duplex Mismatch, 7715/7764/7792/7795/7978 cluster) are all the same shape: failure-domain arithmetic is live engine while the triggering event never fires. T-9 ratification (8a5f413) settled the two-color kill law (power RED / racks AMBER), so blast.ts is ready to host entropy events.
- **8086 — Bad Deploy / The Wrong Commit** (g08): **Deploy-as-threat exists only as a budget line** — `risky-deploy` is a config-provisional errorBudget spend action with exhaustion lock (economy/config.ts:296-300), but Bad Deploy (8086)'s defect probability, rollback cooldown, cache-bust window, and the fail-at-scale shape are unmodeled; the visual language (crates/flags) is likewise unbuilt.
- **8294 — The Ticket Avalanche / The Ticket Hydra** (g08): **Ticket avalanche models the consequence, not the cause** — the 7.15 GhostedForecast fuse (tickets to churn, 30-60d seeded lag, `churn.ts`/`tick.ts` step 10, plus churn-fuse copy @40faf58) is shipped, but ticket volume generation (severity x customers x comms-quality) and staff-capacity consumption are unbuilt, so the 2.9 doom-loop headline (8294/8313) is half-modeled.
- **8489 — The SLA credit magnitude correction (read this before pricing any outage)** (g08): **SLA credits are a readout, not a settlement** — `errorBudget.ts` defines the negative-remaining "SLA-credit-owed zone" and `tick.ts` emits `sla-credit-due` notices, but the 100%-of-MRC cap, claim-window expiry, and most-players-dont-file dynamics from the magnitude correction (8489/9051) are clause-id stubs; legal semantics are explicitly delegated to ruleset cards that do not consume them yet.
- **8504 — Business threats must consume a hand** (g08): **Business threats do not yet compete for hands** — the coupling rule at 8504 ("the single biggest missed opportunity in the design") is architecturally ready (door hands + occupancy cost @b1f757e, communicate/commit verbs) but no business threat arrives as a hand-costing inbox card; ops-vs-business competition for attention remains unproven in any test.
- **8544 — Rolling Reserve Imposition** (g08): **The chargeback pipeline is staged data without economics** — chargeback-swarm ships as registry threat + wave entries + `chargebackRate` type field (4ce67fc), but the registry `_todo` says fraud-mix scalars untuned and no fee/ratio-tick posting exists, so Processor Termination (8529) and Rolling Reserve imposition triggers (8544) have cause-without-mechanism; the schedule machinery exists, its invocation does not.
- **8581 — Bad Debt Creep / The Deadbeat Cohort** (g08): **AR aging is fed by a known latent bug** — the renewal-twin zombie invoice (MODULE-STATUS gap row, `tick.ts:244-260` + `billing.ts:158`, found-preserved by `perf-identity.test.ts`, owner-semantics call) keeps an `issued` twin aging in a tray, so Bad Debt Creep (8581) and DSO (8589) measurements can silently overstate receivables until the owner rules on cycle-unique invoice ids.
- **8655 — The Reddit Thread / The Viral Post / The Review Bomb** (g08): **Reputation is a ledger without events** — `save/node.ts` carries full ReputationState (domains, honestHostFloor, breachHistoryTicks U22 ladder, 9e701a0) and chrome reads `company::reputation`, but no sim-core module publishes that cell — every 2.10 reputation threat (8655/9097 family) reduces to substrate-without-publisher; the whole Reddit/review-bomb family waits on a reputation emitter.
- **9410 — Entropy (the unattributed director)** (g09): Entropy director reads like DONE but is not (9410): the slot ships as entropy-budget multiplier with replay-logged draws (47b2c33), yet it never spawns hardware/environment events from fleet age/density/maintenance-backlog as the archetype specifies.
- **10950 — The Support Tax** (g10): Support Tax / fail2ban self-DoS (10950/10956) ride generic FP machinery without the doom-loop feedback (tickets→engineer time→slower→more tickets) the spec makes the point of — credit given as PARTIAL, but the distinctive loop is the missing piece.
- **10986 — The active-family pool cap** (g10): Pool-cap delegation hole (10986): ledger.ts delegates the 8-10 active-family cap to content-CI by comment, but contentInspector.ts implements no such check — the law exists only in prose (grep poolCap zero code hits).
### 3. Visitors, traffic, and clients

- **11462 — The closed loop — patience, latency, queueing, and slots, written out once** (g11): 11462 "Drop past queue_max" (the spec's own closed-loop pseudocode) is unimplemented: queues are unbounded with ρ clamped at 0.99, so the documented queue-overflow eject and its interaction with queue despair cannot occur.
- **11694 — Priority Classes and the Shed Ladder (pre-configured triage)** (g11): 11694 Shed ladder rungs (80/88/94/98% P0–P3) vs shipped: shed only fires at hard-ceiling discipline or as a player ShedLoad verb; no utilization-rung auto-shed cascade exists, so the spec's escalating-tragedy curve is flattened.
- **11875 — The Live Bounce-Reason Strip** (g11): 11875 No bounce CAUSE taxonomy: outcomes carry causeIds (retry:<id>, outcome:<id>, drain:<id>) but there is no enumerated bounce-reason set to aggregate for the top-3 strip, the $/60s ticker, or the FP-pile visualization — prerequisite gap for three §3.1 HUD rows.
- **12202 — Family IV — Amplifiers** (g11): 12202/12320 Families IV+VI (Amplifiers, Evaluators — 17 archetypes) have near-zero shipping surface: only the generic referral roll represents 3.2's compounding story; the reputation -> spawn-rate feedback that powers Reviewer/Influencer/Community/Advocate-saturation is absent, so word-of-mouth is one-directional (returns/referrals happen regardless of bad service quality beyond bounce).
- **13062 — Contract-end bounce (colo and enterprise)** (g11): 13062/12823 §3.4's classification rule promises three mechanical shapes (ms cost / fixed −% subtraction / hard cliff); the engine implements only ms drain + a gradual LUT. Every hard-cliff bounce (error page, scary warning, busy signal, payment decline, fraud FP) has no representation — and the LUT's 2x-budget saturation anchor actively contradicts "100ms, hard" RTB-style units.
- **14477 — The customer who files better tickets than your staff** (g12): **`sophistication` is null + `_todo` on all 16 shipped registry threats** (registry-core.json) — the §3.10 avalanche-slope formula and the better-ticket-customer archetype (14477) both hang on this unauthored scalar.
- **14611 — The Patience Ring, with a three-stage LOD** (g12): **The Patience Ring renders as a uniform white circle** (g1Scene paintAttachments, 4ff4a4f) — the spec calls it "the single most important visitor visual" and none of the deplete/three-state/crowd-LOD degradation is built (14611 PARTIAL).
### 4. Buildables: services and infrastructure

- **14914 — The Build Card** (g13): **Build Card omits the decision-bearing rows (14914).** The g4 terms card ships infrastructure stats (Bandwidth/Monthly/Latency/SLA) but NOT the spec's "Closes:", lead time, blast radius, or removal cost — precisely the rows the spec calls "the single most useful number for a placement decision" and "exit cost at the entrance".
- **15114 — The Rack Elevation as a Buy Screen** (g13): **topology/physical.ts is built-but-dead (15114).** The full rack-elevation/floor-load/thermal/adjacency model is shipped and tested (e2f69d3) yet has ZERO non-test consumers; g4's placement refusals run through host-supplied validators instead. Buy-screen U-Tetris, thermal circuit rows and the tipping-rack trap will rot if no lane wires this in.
- **15137 — Build time and cold start** (g13): **No time dimension for procurement (15137/15191-15238 cluster).** Lead times spanning days-to-months, the "panic-building doesn't save you" law, and its Warm-Bench/Rentals partner are all absent; hand-occupancy of 3 ticks is the entire build-latency model.
- **15157 — The Surface Budget** (g13): **The Surface Budget valve is one-way (15157).** waves/ledger.ts enforces "threats unspawnable until invited" but there is no Surface number, total meter, surface-weighted composition draw, and no Decommission/Narrow/Wrap verbs — the spec's core claim that P2 "currently has no player agency inside it" remains TRUE of the implementation.
- **15254 — Headroom as an explicit, purchasable, visible stat** (g13): **Headroom is invisible to scoring (15254).** Circuit headroomMw and error-budget headroom exist internally, but the ratified OD-1 scorecard (24dfcfe) does not consume a Headroom stat, so over-building is still "an accident" rather than the legible strategy the rule demands.
- **16350 — Defenses live on edges, not on the board** (g14): **16350/16362 defense-placement laws diverge.** Spec puts defenses on edges with a per-object aggression slider and a log-only third position; shipped model is node-level inspectionDepth (4 enum depths) plus ONE run-level aggression Fixed.
- **16373 — The Defense Off-State and the Mis-Tune State** (g14): **Mis-tune/off-state visual (16373) awaits render mount.** The amber-haze over-tuned-WAF readout is designed into the Fogged-NOC variant but panels remain DOM/SVG programmer art (PHASE1-PLAN:165), and the substrate section-cut seam (0acf46e/27f2856) is on mount HOLD.
- **16802 — Status Page** (g14): **Status page (16802) shipped as a verb, not an object.** Communicate's status-page line law + a catalog counter exist; the off-infrastructure, graph-independent page (the spec's core question) is absent.
- **16828 — Runbook Library / Documentation** (g14): **Runbook ladder (16828/16853) is data + one action.** 6-rung PlaybookSlotRecord with hollow/drilled/stale seals and run-runbook policy action ship, but the "3+ manual uses → rule" promotion law and incident drag-to-execute UI do not — the automation mechanic the heading is named after.
- **17953 — Reveal schedule: nothing appears before its tier** (g15): **Reveal/tier gating exists only for eras.** loader/eras.ts gates TYPE lines by availableFrom year; there is no tier-based unlock schedule for the ~40 business objects (17953), so a future business-machine palette must add second gating axis rather than reuse era gating alone.
- **18072 — Dunning Engine** (g15): **Dunning recovery ladder is one-way.** dunning.ts models the suspend→terminate slide with recovery rolls, but the spec's *upgrade* ladder (smart retries, decline-code handling, card updater) and its downside realism (fatigue, dunning false-positive suspensions of good customers) are absent (18072). The g5 gate exercises the dark path well (c05/c06 → written-off) but not the salvation path beyond E-2.
- **18590 — The Backlog Board** (g15): **Two money buckets are declared but never filled.** buckets.ts ships all six §6.13 buckets, but `backlog` and `committedOut` have no writer anywhere (grep-verified) — Backlog Board (18590) and Reserved-Capacity (18572) rows are PARTIAL on the strength of the declaration alone. The signed-vs-billed MRR tension the spec calls "one of the best slow-burn pressures" is absent.
- **18669 — The Contract Clause Library — the legal tower tree** (g15): **Clause library is 13/16 and friction-free.** contract.ts SLA_CLAUSE_IDS omits force-majeure, take-or-pay, data-retention-on-term; and clauses are id-tags, not the "each clause is a tuning knob with friction cost" objects the spec demands (18669).
### 5. Unlocks and discovery

- **19805 — Failure-Only Nodes** (g16): **Failure-Only Nodes tension (§5.2 vs Near-Miss clause)** is resolved in spec prose but the resolution machinery (near-miss fires first AND node stays locked) requires both a near-miss detector and an unlock lock state — neither exists; only the payoffGrant.failureOnly field hints at it.
### 6. Economy, money, and scoring

- **22346 — SLA credits (negative revenue)** (g18): **SLA credits never post** — exposure is computed live (drainOutage + sla-credit-due notice) but the credit is never a negative-revenue ledger entry, and the four priced properties from §6.5 (percentage-of-fee, cap, claim window, unclaimed windfall) are unmodelled (22346/23604).
- **22670 — Transit commits and take-or-pay** (g18): **backlog / committedOut buckets never written** — buckets.ts:35-36 declares all six and netPosition() honors them, but no tick path credits backlog (signed-not-installed whale work) or committedOut (take-or-pay promises): §6.13's most novel money states are type-level only (corroborates g15 finding; affects 22670, 23581).
- **23077 — Intro pricing and the renewal cliff** (g18): **Renewal-twin zombie invoice (latent)** — MODULE-STATUS:97: `inv:<contract>:<cycle>` re-mints after cycle-counter reset, shadowing AR aging — a correctness hazard sitting directly under the renewal-cliff headings (23077/22833); preserved deliberately pending owner semantics call.
- **24433 — Bankruptcy / cash zero (Insolvency)** (g19): Insolvency is an open owner decision (MODULE-STATUS:101): death-on-free spend law + freeCashDepleted guardrail halt + OPEX-REFUSED refuses are LIVE, but the settle-side negative-bucket path throws and there is no bankruptcy state machine or cascade ending (§6.10:24433 PARTIAL, §6.15:25446 MISSING).
- **24526 — Covenant Default** (g19): covenantBreaches evaluator (economy/runway.ts, b7e262c) has ZERO consumers repo-wide — the §6.10:24526 Covenant Default lose path and §6.11:24713 breach consequences are both wired to an orphaned function.
### 7. Core gameplay mechanics

- **26389 — The Fit Check (why the thing didn't go in the rack)** (g20): Fit Check delta (§7.3:26389): spec demands mis-placement wastes time but never hard-rejects; the door's canPlaceDevice HARD-refuses with placement-rejected — inverted acceptance model, deliberate and documented but a true spec-vs-impl divergence.
- **26702 — Actions cost time, not mana — split into duration and attendance** (g20): Duration-vs-attendance collapse (§7.5:26702) acknowledged in intent-door.ts:177 as needing a scheduler — unattended jobs (RAID 19h/0-hands), the spec's headline tempo example, cannot be expressed today.
- **27339 — The Decision Highlight (making the board's *choices* legible)** (g20): Decision Highlight (§7.6:27339) is a reserved-but-empty seam: BudgetManager DECISIONS cap ships with zero producers repo-wide — the "choices legible" loop is scaffolded, never fed.
- **28067 — Suspicion Routing — the Two Lanes** (g21): **Mazing exists only inside the G3 gate (28067)** — createRouteStep genuinely splits express/deep by confidence, but the product runner wires expressPath == deepPath (simCoreRunner.ts:215-216), so the shipped mainline never routes anything down a hostile lane; the strategic core §7.10 calls "the mechanic wave 1 was missing" is demonstrable but not playable in the default board.
- **28134 — Threat units: Volume, Sophistication, Signature, Persistence** (g21): **Threat four-stats are null-valued scaffolding (28134)** — registry-core.json ships sophistication/volume/signature/persistence keys with every value null and _todo pending the tuning sheet; OD-2 sheet B went live at 24dfcfe but the content values were never filled, so the three-counter-axis defensive meta (28144 aggro-shaping also absent) cannot resolve.
- **28186 — QoS Classes and the Priority Ladder** (g21): **QoS is a label, not a behavior (27186/28186)** — QosClassDef carries weight/shedPriority/budgetUs and step-3 classifies stickily, but the hard-ceiling shed path iterates the queue in FIFO order ignoring shedPriority and the queue never serves by weight; congestion degrades all classes uniformly, which is exactly the opposite of §7.11's promise. (defaults.ts:525-529)
- **28371 — The Time Model (one coherent clock scheme)** (g21): **Incident-time 0.25× clock (28371) never lands** — tempo data declares permanentIncidentClock for game-servers and kernel/time.ts pins business scale, but SpeedX only admits 1|2|4, so §7.13's "millisecond types run permanently slow-scale" is a declared-but-dead field.
- **28595 — The Pipeline Board** (g21): **Commercial board ships as ledger, not as board (28595-28750)** — the economic engine (contracts/cliffs/renewals/dunning/churn-fuses/ghosted forecasts) is genuinely DONE, but the physical-board framing — sales-pipeline kanban with decay, deal-sheet trading, quarter-close choices, board meetings, org chart, pricing console — is one MISSING/PARTIAL row after another; only the renewal kanban and g5 quarter view gesture at it.
- **28679 — The Oversell Dial** (g15): **Metering & Rating (18048) missing undermines "the machine prices usage".** All revenue is fixed MRC + prepay. Egress metering, per-unit rating, and the oversell dial (content declares `commercialSlider oversell-ratio` with ZERO engine consumers — grep `oversell` in sim-core hits nothing) mean the spec's usage-economy loop is not yet wired even in the shipped types.
### 8. Visuals and presentation

- **29172 — The Emissive Allowance** (g22): **Three shipped render laws are enforced, one is decorative.** Hue Ledger (1e6b306), Layer Law + Readability Budget (4ff4a4f, 28d8b6b) are pinned by tests; but the Emissive Allowance's 2% number and the per-Altitude Motion Budget are data with zero consumers — the @pixi/node pixel-audit arm that would enforce emissive is explicitly deferred until real atlases (ADR-0008 step 5).
- **29327 — The Ring Taxonomy** (g22): **The Ring Taxonomy and shape-token tables are only 2/5 and 3/9 implemented.** Pips and the attachment patience-ring exist; Donut, Halo, Arc, and six of nine shape tokens have no glyph anywhere — a future designer adding a load-donut today has no sanctioned form to ride.
- **29460 — Motion language** (g23): **8.12/8.13 effects and motion language barely started:** the 24-entry FX catalogue has zero FX_ symbols anywhere, particle vocabulary is SmokeField only, and Save/Cold Open/shake/anticipation grammars are unbuilt — the moment-layer depends on the same unmounted iso-scene render (PHASE1-PLAN:165).
- **31931 — The datacenter hum** (g23): **8.11 audio is law-complete but sound-empty (31931–32041):** the three-bus graph, ducking law and hh-audio-pack band budget shipped at 28f638e, yet zero samples, zero audio-pack JSONs on disk, and nothing mounts — 15 of 17 audio headings are MISSING behind the seam.
### 9. Anything else

- **32828 — Versus / Red vs Blue (and the drafted-deck version)** (g24): **Versus is a headless engine, not a game mode (32828)** — deck/draft/commit/match + memoization shipped (2421257, 7607361) including the eight timed-wave anchor law, but there is no transport, opponent, or shell; the mode-tiering note "ship the draft version first because it costs almost no new simulation" is half-true: the simulation cost is paid, the 95% around it is not.
- **34260 — 9.4 Meta systems** (g24): **9.4 meta systems are face-reads over empty drawers** — the architecture is DONE (four faces, Long Save, streaks, treatment ledger — 9e701a0/74f157b), but no simulation-to-save bridge exists: nothing in pipeline/economy appends a scar, record, postmortem, or treatment event yet, so all thirteen PARTIAL sub-systems are storage contracts awaiting their first writer.
- **34672 — No optimal build order** (g25): **Anticipation Track is a type, not a mechanic (34672)** — the no-optimal-build-order guardrail requires three fixes to land; two shipped (seeded orders, Second-Answer obligation per ADR-0009 §2), but buy-ahead anticipation exists only as one enum value in the save `UnlockVia` union.
- **34683 — Lose slowly — with an operational definition** (g25): **Lose-slowly's operational definition has no pin (34683)** — the three-minutes-of-warning-while-top-three-promoted testable law is exactly the kind of rule this repo proves with tests, yet promotedClock=3 is the only half that is enforced; the warning-to-loss interval is unpinned and untestable until campaign runs exist.
- **34712 — Every irreversible action is marked before it is taken, not after** (g25): **The one-way-door law is unenforced (34712, 35341)** — "every irreversible action marked before it is taken" is a §9.6 guardrail with only incidental coverage (G4 terms card, prepay-lock notice); no marking primitive or lint exists, and the Rollback-That-Isn't content class is absent.
- **35031 — 9.9 Endings and the shape of a finish** (g25): **Endings are data-shaped only (35031 group)** — save succession kinds and the uptime/erase streak ledger prove the engine knows an ending exists, but every narrated ending (acquisition epilogue, exit interview, quiet handoff) waits on the campaign lane, and insolvency — the failure gate itself — remains an OPEN owner call (MODULE-STATUS.md:101, cross-cited from group g19).
- **35273 — Real-World-Shaped Data Mode** (g25): **Realism toggles are silent no-ops (35273)** — `realismToggles {p95billing, demandCharges}` parse strictly and freeze in the loader (types.ts:1046, bundle.ts:715) but zero economy/pipeline code reads them; a bundle author flipping them today gets no behavior change and no warning. Worth a fail-loud or a documented stub status.

## MISSING-BY-PLAN (❌ deferred: 1892)

Counts per parent subsection (level-2 § or section for level-2 rows). Full row detail stays in the group manifests.

| parent | deferred ❌ |
|---|---|
| 0.1 | 1 |
| 0.2 | 7 |
| 0.4 | 2 |
| 1 | 7 |
| 1.1 | 10 |
| 1.10 | 9 |
| 1.11 | 13 |
| 1.12 | 32 |
| 1.13 | 23 |
| 1.14 | 11 |
| 1.15 | 5 |
| 1.2 | 16 |
| 1.3 | 59 |
| 1.4 | 9 |
| 1.5 | 95 |
| 1.6 | 10 |
| 1.7 | 4 |
| 1.8 | 12 |
| 1.9 | 4 |
| 2 | 10 |
| 2.1 | 1 |
| 2.10 | 57 |
| 2.11 | 18 |
| 2.12 | 85 |
| 2.13 | 4 |
| 2.14 | 18 |
| 2.15 | 14 |
| 2.16 | 9 |
| 2.17 | 7 |
| 2.18 | 9 |
| 2.19 | 5 |
| 2.2 | 10 |
| 2.20 | 10 |
| 2.21 | 4 |
| 2.22 | 3 |
| 2.23 | 4 |
| 2.24 | 5 |
| 2.25 | 5 |
| 2.26 | 15 |
| 2.3 | 16 |
| 2.4 | 7 |
| 2.5 | 20 |
| 2.6 | 15 |
| 2.7 | 29 |
| 2.8 | 28 |
| 2.9 | 39 |
| 3 | 2 |
| 3.10 | 3 |
| 3.11 | 10 |
| 3.12 | 31 |
| 3.2 | 48 |
| 3.3 | 42 |
| 3.4 | 5 |
| 3.5 | 34 |
| 3.6 | 48 |
| 3.7 | 19 |
| 3.8 | 4 |
| 3.9 | 7 |
| 4 | 2 |
| 4.1 | 21 |
| 4.10 | 53 |
| 4.11 | 8 |
| 4.12 | 12 |
| 4.13 | 4 |
| 4.2 | 20 |
| 4.3 | 21 |
| 4.4 | 29 |
| 4.5 | 3 |
| 4.6 | 3 |
| 4.7 | 10 |
| 4.8 | 24 |
| 4.9 | 54 |
| 5.1 | 4 |
| 5.10 | 2 |
| 5.11 | 9 |
| 5.12 | 6 |
| 5.2 | 52 |
| 5.3 | 4 |
| 5.4 | 54 |
| 5.5 | 8 |
| 5.6 | 12 |
| 5.7 | 8 |
| 5.8 | 23 |
| 5.9 | 1 |
| 6 | 2 |
| 6.1 | 5 |
| 6.10 | 3 |
| 6.11 | 11 |
| 6.12 | 2 |
| 6.14 | 3 |
| 6.15 | 38 |
| 6.2 | 28 |
| 6.3 | 22 |
| 6.4 | 4 |
| 6.5 | 13 |
| 6.6 | 16 |
| 6.7 | 13 |
| 6.9 | 1 |
| 7.1 | 5 |
| 7.14 | 4 |
| 7.15 | 8 |
| 7.2 | 16 |
| 7.3 | 6 |
| 7.4 | 11 |
| 7.5 | 18 |
| 7.6 | 9 |
| 7.7 | 13 |
| 7.8 | 7 |
| 7.9 | 1 |
| 8 | 1 |
| 8.1 | 1 |
| 8.10 | 9 |
| 8.11 | 14 |
| 8.12 | 2 |
| 8.13 | 1 |
| 8.14 | 5 |
| 8.17 | 3 |
| 8.2 | 1 |
| 8.3 | 1 |
| 8.5 | 1 |
| 8.6 | 2 |
| 8.7 | 4 |
| 8.8 | 6 |
| 8.9 | 4 |
| 9 | 1 |
| 9.1 | 30 |
| 9.10 | 10 |
| 9.13 | 1 |
| 9.2 | 30 |
| 9.3 | 3 |
| 9.4 | 2 |
| 9.5 | 7 |
| 9.6 | 1 |
| 9.7 | 7 |
| 9.8 | 5 |
| 9.9 | 5 |

## MISSING-UNLISTED (❌ unlisted: 388) — gap-register candidates

Counts per parent subsection:

| parent | unlisted ❌ |
|---|---|
| 3.1 | 15 |
| 3.4 | 24 |
| 4 | 1 |
| 4.1 | 2 |
| 4.14 | 2 |
| 4.5 | 11 |
| 4.6 | 7 |
| 4.7 | 37 |
| 4.8 | 8 |
| 5.10 | 1 |
| 5.12 | 1 |
| 5.7 | 1 |
| 5.8 | 3 |
| 6.10 | 13 |
| 6.12 | 4 |
| 6.13 | 8 |
| 6.14 | 6 |
| 6.15 | 3 |
| 6.2 | 4 |
| 6.3 | 3 |
| 6.4 | 1 |
| 6.5 | 8 |
| 6.7 | 1 |
| 6.8 | 8 |
| 6.9 | 33 |
| 7.10 | 1 |
| 7.11 | 1 |
| 7.16 | 1 |
| 7.7 | 3 |
| 8.1 | 6 |
| 8.10 | 5 |
| 8.12 | 7 |
| 8.13 | 4 |
| 8.14 | 2 |
| 8.15 | 3 |
| 8.16 | 2 |
| 8.17 | 4 |
| 8.18 | 1 |
| 8.2 | 7 |
| 8.3 | 9 |
| 8.4 | 7 |
| 8.7 | 13 |
| 8.8 | 27 |
| 8.9 | 6 |
| 9.1 | 2 |
| 9.10 | 5 |
| 9.12 | 13 |
| 9.2 | 28 |
| 9.3 | 17 |
| 9.4 | 5 |
| 9.6 | 4 |

All unlisted rows (line | heading):

| line | parent | heading | group |
|---|---|---|---|
| 11642 | 3.1 | Value as Bounty — and value accrues per hop | g11 |
| 11653 | 3.1 | The Conversion Node | g11 |
| 11687 | 3.1 | Patience → Trust → Tenure (three timescales) | g11 |
| 11741 | 3.1 | The Satisfaction Bank (goodwill as a spendable buffer) | g11 |
| 11751 | 3.1 | Party Arrival, generalised (all-or-nothing units) | g11 |
| 11781 | 3.1 | Cache Hit Ratio as a visible visitor path | g11 |
| 11786 | 3.1 | Keepalive and Connection Reuse | g11 |
| 11791 | 3.1 | Geographic origin (speed of light is a hard game constant) | g11 |
| 11830 | 3.1 | Herding (visitors follow other visitors) | g11 |
| 11837 | 3.1 | Sticky vs. fluid traffic | g11 |
| 11842 | 3.1 | Demand Elasticity by Latency (the visible curve) | g11 |
| 11859 | 3.1 | Traffic That Is Not For You | g11 |
| 11868 | 3.1 | The Bounce Ticker | g11 |
| 11902 | 3.1 | The Cohort as a unit (customers own their traffic) | g11 |
| 11913 | 3.1 | Declining demand as a verb (the "we're full" sign) | g11 |
| 12853 | 3.4 | TLS handshake cost | g11 |
| 12859 | 3.4 | The Error cliff | g11 |
| 12867 | 3.4 | The Scary-warning cliff | g11 |
| 12873 | 3.4 | The browser warning that isn't yours | g11 |
| 12893 | 3.4 | The defense that is invisible to you because it works before your logs | g11 |
| 12902 | 3.4 | The Phantom Funnel (demand you cannot see) | g11 |
| 12923 | 3.4 | Happy Eyeballs failure | g11 |
| 12930 | 3.4 | The cert chain that only fails on old clients | g11 |
| 12936 | 3.4 | The visitor's ISP is the problem | g11 |
| 12944 | 3.4 | The mobile-carrier NAT block | g11 |
| 12951 | 3.4 | Geo-IP misclassification | g11 |
| 12955 | 3.4 | Cold start | g11 |
| 12959 | 3.4 | Cold cache after a deploy | g11 |
| 12969 | 3.4 | Queue-time value decay (the patience model that depreciates instead of bouncing) | g11 |
| 12975 | 3.4 | Ugly / broken / degraded layout | g11 |
| 12983 | 3.4 | Third-party drag | g11 |
| 12987 | 3.4 | Search ranking decay | g11 |
| 13003 | 3.4 | The Slow Landing Page (business recursion) | g11 |
| 13010 | 3.4 | The Trust Gap | g11 |
| 13029 | 3.4 | Form Friction | g11 |
| 13034 | 3.4 | Payment declined | g11 |
| 13038 | 3.4 | Fraud check false positive | g11 |
| 13048 | 3.4 | The Missing Feature Filter | g11 |
| 13055 | 3.4 | Pre-sales response time (the lead decay timer) | g11 |
| 14942 | 4.1 | "What does this let me charge for?" | g13 |
| 15213 | 4.1 | The Two Jobs Rule | g13 |
| 16500 | 4.5 | Honeypot | g14 |
| 16516 | 4.5 | The Decoy and the Sacrificial Service (the Divert family) | g14 |
| 16532 | 4.5 | The Tarpit | g14 |
| 16544 | 4.5 | The Canary | g14 |
| 16556 | 4.5 | Canary Credentials / Honeytokens | g14 |
| 16568 | 4.5 | File Integrity Monitoring | g14 |
| 16574 | 4.5 | SBOM / Software Inventory | g14 |
| 16596 | 4.5 | Golden Image Bakery | g14 |
| 16608 | 4.5 | Immutable Rebuild Pipeline | g14 |
| 16614 | 4.5 | Circuit Breaker | g14 |
| 16668 | 4.5 | The Break-Glass Safe | g14 |
| 16759 | 4.6 | External Vantage Fleet | g14 |
| 16770 | 4.6 | The Synthetic Customer | g14 |
| 16910 | 4.6 | Auto-Scaler / Auto-Scaling Policy | g14 |
| 16918 | 4.6 | Config Management (Ansible/Puppet-alike) — "The Stencil" | g14 |
| 16935 | 4.6 | Container Registry / Package Mirror | g14 |
| 16941 | 4.6 | Certificate Automation (ACME) | g14 |
| 16962 | 4.6 | Capacity Planning / Forecasting Model | g14 |
| 17012 | 4.7 | The Tool Crib and the Torque Standard | g14 |
| 17031 | 4.7 | Switched PDU (per-outlet power control) | g14 |
| 17047 | 4.7 | The Circuit Colour Band | g14 |
| 17072 | 4.7 | UPS — "The Battery Ziggurat" | g14 |
| 17094 | 4.7 | Flywheel UPS — "The Spinner" | g14 |
| 17100 | 4.7 | Generator + Fuel Contract — "The Barn" | g14 |
| 17140 | 4.7 | Diesel Tank + Fuel Delivery Contract | g14 |
| 17154 | 4.7 | Load Bank | g14 |
| 17160 | 4.7 | Battery Capacity Tester | g14 |
| 17163 | 4.7 | Utility Feed / Service Entrance | g14 |
| 17177 | 4.7 | Substation / Utility Yard — "The Yard" | g14 |
| 17180 | 4.7 | On-Site Generation and Storage (solar, BESS, fuel cell, microgrid) | g14 |
| 17270 | 4.7 | The Spill Kit, the Drip Tray and the Isolation Valve | g14 |
| 17288 | 4.7 | Airflow Streamers | g14 |
| 17294 | 4.7 | Environmental Sensor Mesh | g14 |
| 17303 | 4.7 | DCIM (the facility's monitoring stack) | g14 |
| 17313 | 4.7 | BMS / SCADA and OT Security | g14 |
| 17325 | 4.7 | Fire Detection (VESDA) — "The Sniffers" | g14 |
| 17331 | 4.7 | Fire Suppression | g14 |
| 17348 | 4.7 | The EPO Guard | g14 |
| 17352 | 4.7 | Water Leak Detection Cable / Thermal Imaging Survey | g14 |
| 17358 | 4.7 | Physical Security: Fence, Bollards, Gate, Mantrap, Badge, Biometrics, Cameras, Guard Post | g14 |
| 17395 | 4.7 | Cable Label Printer | g14 |
| 17404 | 4.7 | Spare Parts Inventory / Spares Bin / Crash Cart | g14 |
| 17416 | 4.7 | The Crash Cart (and the Crash Cart as Console) | g14 |
| 17428 | 4.7 | Loading Dock / Staging Area / Freight Elevator | g14 |
| 17443 | 4.7 | The Anteroom / Dust Lock | g14 |
| 17450 | 4.7 | The Burn-In Bench | g14 |
| 17460 | 4.7 | The Lab Rack / Reference Rack | g14 |
| 17473 | 4.7 | Diverse Fiber Entry | g14 |
| 17479 | 4.7 | Meet-Me Room — "The Cathedral" | g14 |
| 17489 | 4.7 | Carrier Diversity | g14 |
| 17498 | 4.7 | Building Shell Expansion / Build-to-Suit / Build-Out Shell Space | g14 |
| 17509 | 4.7 | Waste Heat Recovery | g14 |
| 17517 | 4.7 | Seismic Bracing / Raised Floor vs Slab / Roof Condition / Overhead Tray | g14 |
| 17524 | 4.7 | The Office | g14 |
| 17536 | 4.7 | NOC / Operations Floor | g14 |
| 17591 | 4.8 | Staff as Rendering Modifiers | g14 |
| 17611 | 4.8 | The Staff Silhouette Set | g14 |
| 17661 | 4.8 | The Pager (as an object) | g14 |
| 17667 | 4.8 | The Follow-the-Sun Band | g14 |
| 17694 | 4.8 | The Legend | g14 |
| 17843 | 4.8 | The Contractor's Contractor | g14 |
| 17887 | 4.8 | Background-Checked Staff Pool | g14 |
| 17894 | 4.8 | The Distributed-Team Toggle | g14 |
| 19250 | 4 | 4.14 Where the business machine lives: the mezzanine and the desk grammar | g15 |
| 19255 | 4.14 | The Back Office Mezzanine | g15 |
| 19272 | 4.14 | The Desk Grammar | g15 |
| 21105 | 5.7 | The commission residual you can never stop paying | g17 |
| 21232 | 5.8 | Rack Mail — "The Catalog" | g17 |
| 21302 | 5.8 | The Sticker Progression | g17 |
| 21309 | 5.8 | The Patch Jacket | g17 |
| 21594 | 5.10 | Open-Source Sponsorship | g17 |
| 21833 | 5.12 | Intel as a spendable currency | g17 |
| 22300 | 6.2 | Heat reuse | g18 |
| 22312 | 6.2 | MDF and vendor co-op marketing | g18 |
| 22339 | 6.2 | Sale-leaseback | g18 |
| 22366 | 6.2 | Margin ranking (the honest hierarchy) | g18 |
| 22497 | 6.3 | Power purchase structures | g18 |
| 22526 | 6.3 | The true-up | g18 |
| 22610 | 6.3 | Insurance, legal, and the SLA reserve | g18 |
| 22922 | 6.4 | The cash conversion cycle | g18 |
| 23096 | 6.5 | Volume and committed-use discounts | g18 |
| 23113 | 6.5 | Cost-plus vs value pricing | g18 |
| 23175 | 6.5 | Yield management | g18 |
| 23182 | 6.5 | Regional pricing / PPP | g18 |
| 23188 | 6.5 | Bundling | g18 |
| 23218 | 6.5 | The discounting spiral and discount authority | g18 |
| 23225 | 6.5 | Elasticity testing | g18 |
| 23251 | 6.5 | The Margin Tint (pricing made ambient) | g18 |
| 23638 | 6.7 | The true-up | g18 |
| 23794 | 6.8 | The margin block | g19 |
| 23800 | 6.8 | The acquisition block | g19 |
| 23811 | 6.8 | The risk block | g19 |
| 23824 | 6.8 | The operations block | g19 |
| 23838 | 6.8 | The satisfaction block | g19 |
| 23858 | 6.8 | The Concentration Donut (and its agreement with the floor) | g19 |
| 23866 | 6.8 | The Cohort Wall | g19 |
| 23874 | 6.8 | The Obligation Rail | g19 |
| 23949 | 6.9 | Detection quality | g19 |
| 23956 | 6.9 | The Uptime Ribbon | g19 |
| 23965 | 6.9 | The Incident Timeline Strip | g19 |
| 23971 | 6.9 | The Traffic Sankey | g19 |
| 23995 | 6.9 | Money Left On The Table (three columns, not one number) | g19 |
| 24012 | 6.9 | The Leak Report | g19 |
| 24036 | 6.9 | Preparedness score | g19 |
| 24044 | 6.9 | Rebuildability index | g19 |
| 24050 | 6.9 | Near-miss ledger | g19 |
| 24058 | 6.9 | Toil hours | g19 |
| 24062 | 6.9 | Par time to detect / par time to repair | g19 |
| 24069 | 6.9 | Cost per served unit | g19 |
| 24075 | 6.9 | Revenue per kW, per rack unit, and per engineer | g19 |
| 24085 | 6.9 | The Externality Score | g19 |
| 24093 | 6.9 | The Decision Audit | g19 |
| 24132 | 6.9 | The Report Card | g19 |
| 24184 | 6.9 | The postmortem screen | g19 |
| 24193 | 6.9 | The Efficiency Frontier | g19 |
| 24221 | 6.9 | Scored Retreats | g19 |
| 24238 | 6.9 | The Customer's Scorecard | g19 |
| 24246 | 6.9 | Star ratings as real reviews | g19 |
| 24257 | 6.9 | The Wall of Ghosts | g19 |
| 24265 | 6.9 | The Blueprint Card | g19 |
| 24271 | 6.9 | The Grade Curve Portrait | g19 |
| 24278 | 6.9 | The Sankey Payoff | g19 |
| 24282 | 6.9 | The Trophy Shelf | g19 |
| 24303 | 6.9 | Per-line valuation bases (because real buyers don't use one multiple) | g19 |
| 24320 | 6.9 | The valuation modifiers that actually move a hosting price | g19 |
| 24333 | 6.9 | Adjusted EBITDA and the addback game | g19 |
| 24343 | 6.9 | Escrow, holdback, and the working-capital adjustment | g19 |
| 24352 | 6.9 | The diligence report / The Diligence Memo | g19 |
| 24364 | 6.9 | Concentration Risk Penalty | g19 |
| 24372 | 6.9 | Scoring additions worth calling out separately | g19 |
| 24440 | 6.10 | Growth Death | g19 |
| 24447 | 6.10 | Concentration Collapse | g19 |
| 24463 | 6.10 | Reputation Collapse / the empty lane | g19 |
| 24472 | 6.10 | Total / partial data loss | g19 |
| 24488 | 6.10 | Upstream termination | g19 |
| 24495 | 6.10 | Payment processor termination | g19 |
| 24509 | 6.10 | Regulatory shutdown | g19 |
| 24516 | 6.10 | Deplatforming | g19 |
| 24519 | 6.10 | Uninsurable (new) | g19 |
| 24533 | 6.10 | Team collapse / total staff burnout | g19 |
| 24547 | 6.10 | Obsolescence | g19 |
| 24553 | 6.10 | The Zombie Host (a soft fail you inhabit) | g19 |
| 24565 | 6.10 | Acquisition at a bad multiple (a soft loss/win) | g19 |
| 24841 | 6.12 | Circuit and cross-connect contract liabilities (NRC, MRC, term, ETL) | g19 |
| 24876 | 6.12 | Contract assignability (consent to assignment) | g19 |
| 24885 | 6.12 | WARCT and contracted revenue % (the two numbers that make revenue an asset) | g19 |
| 24893 | 6.12 | The Contract Term Ribbon (visual) | g19 |
| 24927 | 6.13 | The Balance Sheet (assets, liabilities, equity) | g19 |
| 24953 | 6.13 | Escrow holdbacks and the working-capital adjustment | g19 |
| 24957 | 6.13 | Security deposits and letters of credit (both directions) | g19 |
| 24997 | 6.13 | Revenue leakage and Revenue Assurance | g19 |
| 25016 | 6.13 | AP as a lever (and a trap) | g19 |
| 25027 | 6.13 | Capitalized fit-out | g19 |
| 25035 | 6.13 | The decommissioning obligation | g19 |
| 25043 | 6.13 | The cash conversion cycle (as a balance-sheet readout) | g19 |
| 25088 | 6.14 | The dual-run cost | g19 |
| 25099 | 6.14 | Internal transfer pricing | g19 |
| 25110 | 6.14 | Revenue per rack unit, per kW, and per engineer | g19 |
| 25128 | 6.14 | Portfolio synergies that pay actual bills | g19 |
| 25140 | 6.14 | Carbon and water accounting | g19 |
| 25151 | 6.14 | Insurance vs redundancy as an explicit decision curve | g19 |
| 25431 | 6.15 | The Report Card, the Grade Stamp, and the Diligence Memo | g19 |
| 25435 | 6.15 | The Sankey Payoff and Money Left On The Table as negative space | g19 |
| 25439 | 6.15 | The Trophy Shelf and the Grade Curve Portrait | g19 |
| 27562 | 7.7 | Degradation Debt | g21 |
| 27614 | 7.7 | The Reboot Roulette (state you didn't know you had) | g21 |
| 27672 | 7.7 | Root cause vs band-aid | g21 |
| 28144 | 7.10 | Aggro shaping (the player's control over threat pathing) | g21 |
| 28239 | 7.11 | Fairness vs value (the visible, uncomfortable dial) | g21 |
| 28868 | 7.16 | The Rack Ribbon | g21 |
| 28977 | 8.1 | D. Cozy Miniature / Tilt-Shift | g22 |
| 28986 | 8.1 | E. Gritty Industrial Realism | g22 |
| 29078 | 8.1 | Utilization Glow | g22 |
| 29098 | 8.1 | The Lighting Model | g22 |
| 29107 | 8.1 | The Practical Lights List | g22 |
| 29115 | 8.1 | Depth of Field, Sparingly | g22 |
| 29248 | 8.2 | Saturation, value, and temperature — the three state axes, reconciled | g22 |
| 29270 | 8.2 | Self-inflicted failure: white-cored red | g22 |
| 29447 | 8.2 | Player-authored vs system-default rendering | g22 |
| 29509 | 8.2 | Per-line tint vs alert colour arbitration | g22 |
| 29519 | 8.2 | The Foreignness Budget | g22 |
| 29543 | 8.2 | The Handmade Layer | g22 |
| 29555 | 8.2 | Zero-State Art | g22 |
| 29664 | 8.3 | Camera bookmarks | g22 |
| 29670 | 8.3 | Smart Focus | g22 |
| 29695 | 8.3 | The Establishing Shot | g22 |
| 29699 | 8.3 | The Tour Camera / The Tenant's-Eye Walkthrough | g22 |
| 29709 | 8.3 | The Ceiling Cam | g22 |
| 29714 | 8.3 | The Security Camera Feed | g22 |
| 29719 | 8.3 | The Ghost Facility | g22 |
| 29726 | 8.3 | The Nobody-Is-Watching Frame | g22 |
| 29735 | 8.3 | Sort-by-Risk Camera | g22 |
| 29746 | 8.4 | The universal object grammar | g22 |
| 29990 | 8.4 | The Window | g22 |
| 29997 | 8.4 | The internet cloud / spawn edge | g22 |
| 30061 | 8.4 | The elevation-vs-reality diff | g22 |
| 30067 | 8.4 | The cage nut | g22 |
| 30093 | 8.4 | The phantom cabinet | g22 |
| 30097 | 8.4 | The Fresnel zone | g22 |
| 30533 | 8.7 | The queue as physical stacking | g22 |
| 30540 | 8.7 | The red tide / backpressure | g22 |
| 30544 | 8.7 | Health as colour temperature | g22 |
| 30602 | 8.7 | Depreciation fade | g22 |
| 30609 | 8.7 | Upsell pop | g22 |
| 30614 | 8.7 | SLA credit | g22 |
| 30619 | 8.7 | Price increase ripple | g22 |
| 30696 | 8.7 | Upgrades visible on the object | g22 |
| 30782 | 8.7 | Damage feedback on infrastructure | g22 |
| 30824 | 8.7 | The "It Was Fine" replay stamp | g22 |
| 30849 | 8.7 | The de-escalation animation | g22 |
| 30866 | 8.7 | The empty lane | g22 |
| 30873 | 8.7 | Build satisfaction and the boot sequence | g22 |
| 30974 | 8.8 | The Cost Ghost (lifetime cost, not sticker price) | g23 |
| 30980 | 8.8 | The Compare Tray | g23 |
| 30985 | 8.8 | The Right Panel — the Inspector Faceplate | g23 |
| 31050 | 8.8 | The Pulse Strip | g23 |
| 31095 | 8.8 | The Policy Layer view | g23 |
| 31104 | 8.8 | Visual grammar for "not built" | g23 |
| 31154 | 8.8 | The Telemetry Resolution zoom | g23 |
| 31163 | 8.8 | The Demand Ratchet marker | g23 |
| 31192 | 8.8 | Sparklines everywhere | g23 |
| 31196 | 8.8 | Group / meta-nodes | g23 |
| 31200 | 8.8 | Growing tooltips | g23 |
| 31210 | 8.8 | The hover-card contract | g23 |
| 31219 | 8.8 | The "Why Did I Lose Money" button | g23 |
| 31237 | 8.8 | The Ledger Drawer | g23 |
| 31246 | 8.8 | The MRR Waterfall Widget | g23 |
| 31251 | 8.8 | The Cash Calendar | g23 |
| 31267 | 8.8 | The Cohort Wall / Cohort Grid | g23 |
| 31272 | 8.8 | The Contract Gantt | g23 |
| 31291 | 8.8 | The Concentration Donut | g23 |
| 31303 | 8.8 | View filters: Money / Risk / Customer | g23 |
| 31310 | 8.8 | The ticket queue panel | g23 |
| 31325 | 8.8 | Time-of-day lighting and the Diegetic Clock | g23 |
| 31349 | 8.8 | Tutorial-free onboarding | g23 |
| 31359 | 8.8 | The Attention Heatmap | g23 |
| 31367 | 8.8 | The Regret Marker | g23 |
| 31381 | 8.8 | Quiet Mode and Packet Mode | g23 |
| 31398 | 8.8 | Diagram export | g23 |
| 31430 | 8.9 | The Aggregate Glyph | g23 |
| 31443 | 8.9 | The Fleet Sparkline Wall | g23 |
| 31449 | 8.9 | Anomaly highlighting, not status highlighting | g23 |
| 31458 | 8.9 | Roll-Up Rendering | g23 |
| 31473 | 8.9 | Row rhythm and floor signage | g23 |
| 31502 | 8.9 | The Cadence — rendering "nothing is happening" as an achievement | g23 |
| 31627 | 8.10 | The Hero Object Rule | g23 |
| 31867 | 8.10 | The Era Transition Animation | g23 |
| 31875 | 8.10 | The signature-motion set | g23 |
| 31886 | 8.10 | The Skin Preview Room | g23 |
| 31891 | 8.10 | The Signature Frame | g23 |
| 32071 | 8.12 | The Save | g23 |
| 32082 | 8.12 | The 100% Uptime Stamp | g23 |
| 32096 | 8.12 | Loading screens as rack diagrams | g23 |
| 32105 | 8.12 | The Credits Rack | g23 |
| 32109 | 8.12 | Transition wipes by meaning | g23 |
| 32115 | 8.12 | The juice moments worth budgeting for | g23 |
| 32132 | 8.12 | The FX catalogue | g23 |
| 32186 | 8.13 | Fan Blur Ramp | g23 |
| 32200 | 8.13 | The Anticipation Budget | g23 |
| 32207 | 8.13 | Screen Shake Budget | g23 |
| 32229 | 8.13 | The de-escalation language | g23 |
| 32260 | 8.14 | Three colour-blind palettes, named | g23 |
| 32272 | 8.14 | Colour-blind-safe money | g23 |
| 32419 | 8.15 | The Label Plate Aesthetic | g23 |
| 32424 | 8.15 | The Player Company Mark Generator | g23 |
| 32442 | 8.15 | The Company Letterhead | g23 |
| 32468 | 8.16 | The Silhouette Sheet (production gate) | g23 |
| 32478 | 8.16 | The silhouette-first authoring test | g23 |
| 32594 | 8.17 | The Before/After Slider | g23 |
| 32598 | 8.17 | The Incident Poster | g23 |
| 32612 | 8.17 | The Screenshot Watermark and the share frame | g23 |
| 32618 | 8.17 | The scrapbook wall | g23 |
| 32642 | 8.18 | The hand-wave detector | g23 |
| 33097 | 9.1 | The Pager Simulator | g24 |
| 33128 | 9.1 | Photo Contest / Rack Gallery | g24 |
| 33216 | 9.2 | The Legacy Box / "The Do Not Reboot Machine" | g24 |
| 33267 | 9.2 | The Slow Boss | g24 |
| 33356 | 9.2 | The vendor prices to your switching cost | g24 |
| 33367 | 9.2 | You become the vendor squeezing someone else | g24 |
| 33382 | 9.2 | The founders' agreement | g24 |
| 33389 | 9.2 | The Personal Guarantee | g24 |
| 33573 | 9.2 | The One Customer Who Is Always Right / The Unremovable Customer | g24 |
| 33581 | 9.2 | The "Unlimited" Trap | g24 |
| 33588 | 9.2 | The Legacy Plan | g24 |
| 33594 | 9.2 | The Handshake Deal | g24 |
| 33662 | 9.2 | The Compliance Theater Meter | g24 |
| 33676 | 9.2 | The RFP Minigame | g24 |
| 33685 | 9.2 | The Migration Weekend | g24 |
| 33692 | 9.2 | Named Disasters | g24 |
| 33700 | 9.2 | The Green Dilemma | g24 |
| 33740 | 9.2 | The Conference Talk | g24 |
| 33747 | 9.2 | The marketing site on your own infra | g24 |
| 33754 | 9.2 | The customer who becomes a competitor | g24 |
| 33762 | 9.2 | The acquisition offer you should refuse | g24 |
| 33768 | 9.2 | Weather Affects Everything — scoped | g24 |
| 33784 | 9.2 | The Hardware Lottery and the Uptime Superstition | g24 |
| 33800 | 9.2 | Reputation Has a Face | g24 |
| 33834 | 9.2 | Reverse Colo | g24 |
| 33841 | 9.2 | "Works On My Machine" (the card, and the customer) | g24 |
| 33852 | 9.2 | The Missing Screw | g24 |
| 33863 | 9.2 | The Beeping Server | g24 |
| 33916 | 9.2 | The "It's Fine" counter | g24 |
| 33922 | 9.2 | The Hardest Lesson, Delivered Once | g24 |
| 34002 | 9.3 | The label maker that ran out of tape | g24 |
| 34008 | 9.3 | The cable colour war | g24 |
| 34069 | 9.3 | Outage Bingo | g24 |
| 34097 | 9.3 | The Trade Radio | g24 |
| 34136 | 9.3 | The office set dressing | g24 |
| 34154 | 9.3 | The Office Cat | g24 |
| 34161 | 9.3 | The Legacy Server With a Name | g24 |
| 34168 | 9.3 | The certificate whose CN is `localhost` | g24 |
| 34171 | 9.3 | "Restart it." | g24 |
| 34174 | 9.3 | The on-call handoff note that says only "quiet night" | g24 |
| 34177 | 9.3 | The Advisor Voicemail | g24 |
| 34184 | 9.3 | The corporate comedy set | g24 |
| 34205 | 9.3 | The Post-It with the root password | g24 |
| 34208 | 9.3 | The RFC 2324 easter egg | g24 |
| 34211 | 9.3 | The Cursed Basement | g24 |
| 34227 | 9.3 | The Ops Diary Comic | g24 |
| 34249 | 9.3 | The rm -rf moment | g24 |
| 34339 | 9.4 | The Anniversary | g24 |
| 34354 | 9.4 | Industry Benchmarks | g24 |
| 34417 | 9.4 | Business Mix Panel | g24 |
| 34425 | 9.4 | Procedural label text | g24 |
| 34443 | 9.4 | Screenshot watermark | g24 |
| 34655 | 9.6 | Every tower has a downside — except a small curated set | g25 |
| 34701 | 9.6 | The player must always be able to answer "what is the worst thing that could happen right now" | g25 |
| 34724 | 9.6 | Make the boring thing beautiful — with a budget mechanism | g25 |
| 34817 | 9.6 | Line synergy and antagonism, with numbers (belongs with §0.2) | g25 |
| 35131 | 9.10 | The Logo Generator | g25 |
| 35140 | 9.10 | The Customer Logo Generator | g25 |
| 35162 | 9.10 | The Seasonal Decoration Pack | g25 |
| 35167 | 9.10 | Rack Cards (collectibles) | g25 |
| 35174 | 9.10 | The Hall of Fame Drive | g25 |
| 35290 | 9.12 | The Crash Cart | g25 |
| 35296 | 9.12 | The Blanking Panel | g25 |
| 35302 | 9.12 | The Grounding / Bonding check | g25 |
| 35308 | 9.12 | The ESD strap | g25 |
| 35314 | 9.12 | Spare Parts Cannibalization | g25 |
| 35326 | 9.12 | Patch Debt | g25 |
| 35332 | 9.12 | The Maintenance Window Negotiation | g25 |
| 35341 | 9.12 | The Rollback That Isn't | g25 |
| 35348 | 9.12 | The Runbook You Wrote At 4am | g25 |
| 35355 | 9.12 | IP Reputation as an inherited property of address space | g25 |
| 35365 | 9.12 | Latency as a physical constraint on the world map | g25 |
| 35375 | 9.12 | The Broker Lunch | g25 |
| 35381 | 9.12 | Conference Booth Builder | g25 |

## ANOMALIES

Manifest/format deviations encountered by the markup script (none blocked the run; line numbers are authoritative, text fields were cosmetic):

1. **Level-1 umbrella rows dropped (3):** g06 line 5996 (`# 2. Threats`), g11 line 11398 (`# 3. …`), g22 line 28897 (`# 8. …`) — level-1 headings are not status rows per AUDIT-BRIEF §5; not marked.
2. **Off-by-one (1):** g11 cited `Redirect chains` at line 12847; the heading is at 12846 on disk (12847 is prose). Per contract no guess-fill: **line 12846 remains unmarked** (the only gap — 1 of 3,589 in-scope). MISSING/unlisted per that row.
3. **Level field written literally (156 rows):** `##`/`###` instead of `2`/`3` (g09, g10, g14, g15, g23, g24 lanes) — normalized; all agreed with disk heading level.
4. **Marker-in-hash-column (65 rows, all g20):** `deferred:`/`unlisted:` written into the hash field with an extra `-` column (7-field rows) — fields re-joined; MISSING classification used the recovered marker.
5. **Terse MISSING notes (275 rows across groups):** note column contains only the word `unlisted` (no detail) — classified as unlisted; evidence detail remains in the group body/TOP-PROBLEMS.
6. **Heading text drift (132 rows):** manifest headings paraphrased (commas/asterisks dropped, occasional `## ` prefix, short renames). Line numbers matched disk in every case; SUMMARY/roll-up use the outline/file heading text.
7. **DONE-without-hash:** 0 — all 284 DONE rows carried ≥1 valid short hash after separator normalization (`;` and `,` variants in g06/g10/g25).
8. **Table of Contents (line 43):** correctly un-audited by all groups; left unmarked (now sits below the inserted legend).

## MARKUP MECHANICS

- Script: /tmp/opencode/markup/markup.mjs (throwaway). Idempotent: strips trailing ` (✅|🔧|⚠️|❌|📝)…` from `## `/`### ` lines before re-appending; legend guarded by heading presence.
- Verify: 35,507 → 35,519 lines (+12 legend) · `^# `=11 · `^## `=150+1 legend=151 · `^### `=3,440 · 3,588 heading lines carry markers, 1 in-scope heading unmarked (12846), zero other lines touched.
