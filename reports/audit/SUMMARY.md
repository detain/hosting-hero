# AUDIT SUMMARY — heading status roll-up (markup applied 2026-10-09, re-markup post-fix-wave 2026-10-09, session-2 rulings re-markup 2026-10-09b, wave-3 batch-1 closeout 2026-10-10, wave-3 batch-2 closeout 2026-10-10b, wave-5 closeout re-markup 2026-10-13, wave-6 closeout re-markup 2026-10-13b, wave-7 closeout re-markup 2026-10-13c)

Source: 25 group manifests (reports/audit/group-01..25.md) against outline.md Tables 2+3, then **updated in place on disk after the 2026-10-09 fix wave** (16 commits d8fc8ec..a98fd55; per-row dispositions in the hosting_game.md Appendix), then re-markuped for the **2026-10-09b session-2 owner rulings** (see SESSION-2 RE-MARKUP below + `docs/adr/0010-taxonomy-and-stacking-contradictions.md` Accepted), then flipped again for the **wave-3 batch-1 closeout** (0032a21..2ef5cae; see WAVE-3 BATCH-1 below), then for the **wave-3 batch-2 closeout** (a79402c..05ecf97; see WAVE-3 BATCH-2 below). The tallies below are computed from the **current marked hosting_game.md**, not the original manifests — they include the 23 fix-wave flips, the session-2 flips, the batch-1 flips, and the small set of marker/manifest drift realignments disclosed in the Appendix.

> Line numbers throughout are ORIGINAL (pre-legend) positions matching reports/audit/outline.md and the group manifests. In the marked hosting_game.md, add **+12** to any line > 43 (the 12-line legend block inserted above the ToC). **Session-2 adds three more law-note lines (see SESSION-2 RE-MARKUP → Insert offsets): cumulative offset is +12 through original 15178, +13 from original 15179, +14 from original 16292, +15 from original 16332. outline.md is NOT renumbered (too risky) — apply the offset table when citing it below line 15190.**

## GLOBAL TALLIES (disk truth, post wave-3 batch-2 closeout)

| STATUS | marked headings on disk |
|---|---|
| DONE ✅ | 290 |
| PARTIAL 🔧 | 997 |
| PROBLEM ⚠️ | 1 |
| MISSING ❌ | 2271 |
| NA 📝 | 30 |
| **total marked** | **3589** (+2 unmarked out-of-scope headings) |

Batch-1 delta from the session-2 tallies (✅285 🔧998 ⚠️1 ❌2275 📝30): four 🔧→✅ flips — The oversell ratio, The Second Incident multiplier, The Copycat reserve, Mode tiering. The Feint budget gained an inline scope note only (stays 🔧, not a count move).

Batch-2 delta (see WAVE-3 BATCH-2): one 🔧→✅ (The Second Incident rule §2.12 twin) + four ❌→🔧 (price slider; three DNS type rows). Section deltas: §1 🔧86→88 ❌316→314 · §2 ✅52→53 ❌446→445 · §6 🔧102→103 ❌250→249.

## PER-SECTION ROLL-UP (marked headings by level-1 section — disk truth)

| section | ✅ DONE | 🔧 PARTIAL | ⚠️ PROBLEM | ❌ MISSING | 📝 NA | total |
|---|---|---|---|---|---|---|
| preamble | 0 | 0 | 0 | 0 | 0 | 0 |
| 0. Foundations | 20 | 10 | 0 | 10 | 9 | 49 |
| 1. Levels, scenarios, and progression | 16 | 88 | 0 | 314 | 2 | 420 |
| 2. Threats | 53 | 96 | 0 | 445 | 1 | 595 |
| 3. Visitors, traffic, and clients | 30 | 80 | 0 | 303 | 0 | 413 |
| 4. Buildables: services and infrastructure | 22 | 121 | 0 | 338 | 0 | 481 |
| 5. Unlocks and discovery | 1 | 115 | 0 | 182 | 1 | 299 |
| 6. Economy, money, and scoring | 37 | 103 | 0 | 249 | 1 | 390 |
| 7. Core gameplay mechanics | 68 | 125 | 0 | 107 | 2 | 302 |
| 8. Visuals and presentation | 23 | 171 | 1 | 155 | 7 | 357 |
| 9. Anything else | 20 | 88 | 0 | 168 | 7 | 283 |
| **TOTAL** | **290** | **997** | **1** | **2271** | **30** | **3589** |

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
| 11385 | 2. Threats | Matrix C — which threat families dominate which type | g10 | activeFamilies + qualitative _todo ship but familyWeights are null with stale _todo prose awaiting the ratified tuning sheet (OD-2) — OD-2 was ratified sheet B at 24dfcfe yet the weights were never re-authored; owner-gated content debt | ✅ RESOLVED @4856a42 (weights filled in both bundles, parseFamilyWeightsTable + weightedFamilyOf/familyMix consumers live)  + **2026-10-09b: OD-21(a) — lane-authored weights RATIFIED AS PROVISIONAL; re-taste after G1 playtests, no owner sweep owed** |
| 14424 | 3. Visitors, traffic, and clients | The attention budget | g12 | door hands live but support-hands unimplemented, OD-6 two-denomination ruling decided 2026-10-09 with implementation deferred (MODULE-STATUS gap row) | ⚠️ HELD — OD-6 deferral unchanged by the fix wave. **2026-10-09b: 🔧 — OD-23(a): implementation lane SCHEDULED NOW, paired with OD-4a loan ledger (heading now 14436). **2026-10-10 batch-2: 🔧 UNCHANGED marker, machinery LANDED @eff5694 — bounded window entry, loan ledger + month-roll repayment seam, per-verb door cost, digest absorb; host month-roll forwarding + HUD owed (🔧 rows carry no inline hashes — appendix + MODULE-STATUS gap row record the SHA)** |
| 15178 | 4. Buildables: services and infrastructure | The Build Role Taxonomy (nine roles) | g13 | The nine build roles are tagged nowhere; coverage/defenseRoles.ts ships the DIFFERENT nine defense roles sharing only four words (Classify/Contain/Detect/Recover) - the spec's shared-tag promise between palette and Coverage Grid is broken | ⚠️ HELD — contradiction recorded in ADR-0010 (proposed) @d8fc8ec; owner ratification owed before either taxonomy moves. **2026-10-09b: 🔧 — ADR-0010(a)=i RULED: shipped §2.1 nine = law; build-role tagging → Phase-2 gap register; law-note under heading (now 15190)** |
| 16291 | 4. Buildables: services and infrastructure | The Nine Defense Roles | g14 | shipped taxonomy follows the §2.1 list (absent Block, added Negotiate) — contradicts this heading's enumeration | ⚠️ HELD — same ADR-0010 pending record @d8fc8ec. **2026-10-09b: ✅ e24e1bb — ADR-0010(a)=i RULED: heading now names the shipped nine as law (corrected-list note, now 16304)** |
| 16331 | 4. Buildables: services and infrastructure | Defense-in-Depth stacking rules | g14 | matrix.ts combine law is MAX never multiplicative (deliberate, docblock cites §2.1 ratification), no latency-additive/diminishing/synergy/Waste-Indicator | ⚠️ HELD — same ADR-0010 pending record @d8fc8ec. **2026-10-09b: 🔧 — ADR-0010(b)=i RULED: MAX law RETAINED, prose superseded-by-implementation (note now 16345); refinement clauses gap-registered, NO unify lane** |
| 22940 | 6. Economy, money, and scoring | 6.5 Pricing as a mechanic | g18 | Pricing is engine-side data (MRC/cliff/escalator/MFN/grandfather) with NO player pricing verb among the 8 door verbs; 21 of 29 dials unbuilt; oversell slider declared-dead (22992) | ⚠️ HELD — no player pricing verb shipped; door verb set closed at 8. **2026-10-09b: 🔧 — OD-24(a) OWNER OVERRIDE: FULL pricing surface approved — door pricing verb(s) + ~21 dial consumers + elasticity model (provisional, ratify-on-playtest) + oversell host knob; 8:1 PROPOSED shared-web start; BUILD WAVE QUEUED (heading now 22952). **2026-10-10 batch-1: heading STAYS 🔧 — part 1 landed @0032a21 (AdjustPrice door verb + state-neutral overrides book are verb-live); elasticity model + ~21 dial consumers owed by batch-2. **2026-10-10 batch-2: 🔧 HOLDS — parts 1+2 landed @5781335 (overrides consumed at churn/retention/dunning-recovery/invoice sites, PROVISIONAL bps); the section stays 🔧 because ~20 dial consumers remain — of the 4 shipped commercialSliders only oversell-ratio is live, ddos-tier/ip-pool/query-allowance are CODEX-only** |
| 22992 | 6. Economy, money, and scoring | The oversell ratio | g18 | shared-web.json:84 commercialSlider "oversell-ratio" + rosetta card parsed (loader/bundle.ts:112,616; R16 lint hook) but ZERO engine consumers — dead slider; P(contention)=ratio^2.2 x homogeneity never computed | 🔧 PARTIAL @4856a42 — contentionProbabilityMicro(r,h)=f(r)×h ships in waves/contention.ts + planWave oversell input; host-side wiring (bundle slider value → planWave oversell) still owed. **2026-10-09b: OD-24(a) — that wiring + the 8:1 starting ratio ride the queued pricing wave (marker stays 🔧, heading now 23004). 2026-10-10 batch-1: 🔧→✅ 4856a42 2ef5cae — host wiring landed: OVERSELL_RATIO_MICRO (8:1 PROVISIONAL) + homogeneity fold feed planWave's oversell input on the mainline proto runner, gated on the bundle declaring the slider. SCOPE: proto-only host input — sim-core ships no default ratio** |
| 31543 | 8. Visuals and presentation | The readability targets | g23 | perf grid harness exists but 2k/20k figures are OD-10/OD-12 unratified and unmeasured | ⚠️ HELD — OD-10/OD-12 unratified. **2026-10-09b: ⚠️ UNCHANGED — OD-10/OD-12 expressly NOT decided in session 2 (heading now 31558)** |
| 31810 | 8. Visuals and presentation | Era presentation shifts | g23 | era-tokens.css ships 1998/2026 only; MODULE-STATUS era-count row awaits owner era grid | ⚠️ HELD — owner era grid not provided. **2026-10-09b: 🔧 — OD-22(c) RULED: v1 canon = 1998+2026; 4-era plan (~1998/~2008/~2016/2026) ratified as campaign-phase plan (heading now 31822)** |
| 31837 | 8. Visuals and presentation | Era UI skins, enumerated | g23 | 2 of 5 enumerated skins; owner-gated per MODULE-STATUS era row (same as above) | ⚠️ HELD — owner-gated. **2026-10-09b: 🔧 — same OD-22(c) ruling (heading now 31849)** |
| 32326 | 8. Visuals and presentation | The full accessibility affordance list | g23 | plan promised a11y CI harness "from day one"; PHASE1-PLAN:165 admits only Shape-First+Readout shipped | 🔧 PARTIAL @9b32cc5 + 942834f — roster ledger (chrome/a11y/roster.ts, 11 rows) + contrast-audit + motion-audit acceptance gates; 4 of 11 rows live |
| 32366 | 8. Visuals and presentation | Era display faces | g23 | only 2 era faces via era tokens; same owner-gated era grid (MODULE-STATUS era row) | ⚠️ HELD — owner-gated. **2026-10-09b: 🔧 — same OD-22(c) ruling (heading now 32378)** |
| 32505 | 8. Visuals and presentation | The acceptance-test roster | g23 | 1 of 11 gates (Chroma Meter) shipped; PHASE1-PLAN:165 records the harness as partial | 🔧 PARTIAL — 4 of 11 gates live after 9b32cc5/942834f (greyscale-pass, chroma-meter, strobe-budget-check, contrast-audit-mode) |
| 32694 | 9. Anything else | Endless / Survival ("The NOC" / "The Long Haul" / "Keep It Running") | g24 | endless rows held PENDING_OD8 (32 rows contested) per DECISIONS-PENDING OD-8, no loop shipped | ⚠️ HELD — OD-8 rows still contested. **2026-10-09b: 🔧 — OD-16(a): endless-32 STAY `PENDING_OD8` until an endless loop is scoped — deferral RATIFIED (heading now 32706)** |
| 33137 | 9. Anything else | ⚔️ Mode tiering — twenty-six modes is too many, and none of them are prioritised | g24 | OD-16 open in DECISIONS-PENDING (ratify ~15 orphan re-tierings), tiering adopted-as-law nowhere | ⚠️ HELD — OD-16 open. **2026-10-09b: 🔧 — OD-16(a): ~15-mode tiering ADOPTED AS LAW; mode-table encode = queued content/save-surface lane (heading now 33149). 2026-10-10 batch-1: 🔧→✅ 42fbbd2 (law enacted: Core/Extended/Deferred census in save/modes; 10a83df docs row) — the tier LIST itself stays owner-ratify-on-read** |

11 rows HELD at ⚠️ (all owner-gated or OD-deferred), 4 rows uplifted (1→✅, 3→🔧).
**Session-2 roll-up (2026-10-09b):** of the 11 HELD rows, 10 re-markuped by the rulings (9 ⚠️→🔧, 1 ⚠️→✅ via ADR-0010(a)=i); only 31543/31558 (readability targets, OD-10/OD-12) stays ⚠️ — expressly NOT decided in session 2, alongside OD-7/9/11/12/15/17/18/19/20 and the taste-row pile (ratify-on-playtest posture stands).

## SESSION-2 RE-MARKUP (2026-10-09b owner rulings)

Rulings encoded (canonical records: `docs/adr/0010-taxonomy-and-stacking-contradictions.md` **Accepted** (a)=(i)/(b)=(i); `docs/DECISIONS-PENDING.md` session-2 block; per-row dispositions above):

| original line → current | heading | flip | ruling |
|---|---|---|---|
| 14424 → 14436 | The attention budget | ⚠️→🔧 | OD-23(a) design lane opened NOW (paired OD-4a loan ledger) |
| 15178 → 15190 | The Build Role Taxonomy (nine roles) | ⚠️→🔧 | ADR-0010(a)=i — build-role tagging Phase-2 |
| 16291 → 16304 | The Nine Defense Roles | ⚠️→✅ `e24e1bb` | ADR-0010(a)=i — shipped nine = law |
| 16331 → 16345 | Defense-in-Depth stacking rules | ⚠️→🔧 | ADR-0010(b)=i — MAX retained, prose superseded |
| 22940 → 22952 | 6.5 Pricing as a mechanic | ⚠️→🔧 | OD-24(a) FULL pricing surface — build wave queued |
| 31810 → 31822 | Era presentation shifts | ⚠️→🔧 | OD-22(c) — 2-era v1 canon / 4-era campaign plan |
| 31837 → 31849 | Era UI skins, enumerated | ⚠️→🔧 | same |
| 32366 → 32378 | Era display faces | ⚠️→🔧 | same |
| 32694 → 32706 | Endless / Survival | ⚠️→🔧 | OD-16(a) — endless-32 stay PENDING_OD8 (deferral ratified) |
| 33137 → 33149 | ⚔️ Mode tiering | ⚠️→🔧 | OD-16(a) — ~15-mode tiering adopted as law |

STAY untouched: 31543→31558 ⚠️ (OD-10/OD-12 OPEN); 22992→23004 🔧, 32326 🔧, 32505 🔧 (already uplifted by the fix wave). Every flip asserted its ⚠️ old marker fail-loud before writing.

**Insert offsets (prose law-notes added — outline.md deliberately NOT renumbered):** three `> *[2026-10-09b ruling …]*` lines inserted directly UNDER the ruled headings; each shifts every line below it by +1:

| insertion sits at (current) | directly under (current heading) | original line | effect |
|---|---|---|---|
| 15191 | 15190 Build Role Taxonomy | 15178 | lines below: +1 |
| 16305 | 16304 Nine Defense Roles | 16291 | lines below: +1 (cumulative +2 below 15178-zone) |
| 16346 | 16345 stacking rules | 16331 | lines below: +1 (cumulative +3) |

Original→current citation bands: **+12** through orig 15178 · **+13** orig 15179–16291 · **+14** orig 16292–16331 · **+15** orig ≥16332.

Disk verify at this tip: 35,519 → … → 35,554 → **35,557** lines (+3 notes) · `^# `=11 · `^## `=152 · `^### `=3,441 (fix-wave heading census unchanged) · marked headings 3,589 = ✅285 + 🔧998 + ⚠️1 + ❌2275 + 📝30 · `docs/api-verify.test.mjs` PASS (names only — inert to these edits).

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

## WAVE-3 BATCH-1 (closeout re-markup 2026-10-10, commits 0032a21..2ef5cae atop 8a674f0)

Batch-1 shipped four lanes: `0032a21` door AdjustPrice (OD-24(a) part 1), `ab0bf5c` economy deaths (OD-25(a)), `2ef5cae` proto rules-live host inputs (B4, disclosed golden moves), `42fbbd2`+`10a83df` save mode tiering (OD-16(a)). Heading flips located by TEXT on the current file; markers flipped fail-loud (asserted current marker before writing):

| heading (located by text) | flip | hashes | disposition note |
|---|---|---|---|
| ⚔️ Mode tiering — twenty-six modes… | 🔧→✅ | 42fbbd2 | tiering LAW enacted (Core/Extended/Deferred census); the tier list itself stays owner-ratify-on-read (flag recorded here, not on the marker) |
| The oversell ratio | 🔧→✅ | 4856a42 2ef5cae | P(contention) computed from a host-supplied ratio on the mainline runner (OVERSELL_RATIO_MICRO 8:1 PROVISIONAL → planWave input.oversell, gated on bundle slider declaration). SCOPE: wiring is proto-only; sim-core ships no default ratio |
| The Second Incident multiplier (§2.24) | 🔧→✅ | 4856a42 c9c0433 2ef5cae | liveness proven on shipped g1 data: seed-42 wave-4 plan carries 10 arrivals vs the 6 par alone (×1.8 follow-ons) — waveRules.test.ts |
| The Copycat reserve (§2.24) | 🔧→✅ | 4856a42 c9c0433 2ef5cae | liveness proven: seed-42 wave-5 rescales to 3/3/3 against dominant human defense; seed-33 no-match twin keeps authored 4/3/3 |
| The Feint budget (§2.24) | 🔧 + note | — | marker-inert — no shipped author: consumer structurally live (planted-marker test re-parks the first quarter), shipped slices author no feint marker |
| 6.5 Pricing as a mechanic | stays 🔧 | 0032a21 (note) | part 1 landed: AdjustPrice verb + state-neutral overrides book are verb-live; elasticity model + ~21 dial consumers = batch-2 |

Also flipped this closeout: the in-file Appendix "now" cells stopped lying — corrected for all 10 lane-R (8a674f0) flips the table never absorbed (14424, 15178, 22940, 31810, 31837, 32366, 32694, 33137 → 🔧; 16291 → ✅; 31543 stays ⚠️), the two batch-1 second-hop flips riding that correction (22992 🔧→✅, 33137 🔧→✅), and the 22940 "what remains" (door no longer closed at 8 verbs).

**Disclosed proto runner golden moves (2ef5cae, simCoreRunner.test.ts — first product host for the §2.24 rules reshapes the arrival stream):** firstDeep tick 7→41; split arms 8/1→32/8 @100 ticks; disarm arms express 9→44, lenient 9→44, strict 9→41 (lane choice feeds back into bounce/re-entry maturity); storm first pure re-entry minute → 62; mixed frame moved to seed 7 minute 54. HELD: LEDGER_TICK1_FREE + frame-1 money pins, legacy-fixture tick-2 equivalence, determinism pairs, seed-42 zero-reentry census, FAMILY_MIX census. **Zero sim-core goldens moved; headless parity b0162ab5/a9b4b7b8 held.**

**Marker census after batch-1 flips (recomputed from disk):** ✅289 🔧994 ⚠️1 ❌2275 📝30 = **3,589** (was ✅285 🔧998 ⚠️1 ❌2275 📝30). hosting_game.md line count unchanged at 35,557 — all closeout edits in-place, zero insertions.

**Closeout battery (serial, @2ef5cae+markup):** sim-core 1,750/123 files exit 0 · api-verify PASS 1,399 names · content validate PASS · canary 115 files PASS · ci-verify 5/5 (incl g5-mirror-diff) · typecheck 5/5 · proto 776/71 · proto build OK · headless 53/5 parity literals green.

## WAVE-3 BATCH-2 (closeout re-markup 2026-10-10, commits a79402c eff5694 984759b 5781335 05ecf97 atop 692b507)

Batch-2 shipped five lanes: `a79402c` OD-14(a) type-4 DNS Ruleset Card (data-only: types/dns-hosting.json + g1-dns wave slice + dns-hosting.i18n pack), `eff5694` OD-6/23/4a attention denominations + bounded loan ledger (default-off), `984759b` L4 death wiring (host refuse-settlement forwarding + canonical-death i18n voices + `deathHaltsRun` opt-in), `5781335` OD-24(a) part 2 (price overrides consumed + elasticity model, PROVISIONAL), `05ecf97` review fix-lane (typecheck + witness docs + pack pins). Headings located by TEXT; every marker flip asserted its current marker fail-loud before writing (exact full-line match, uniqueness-checked):

| heading | flip | hashes | disposition |
|---|---|---|---|
| The price slider (difficulty as a dial the player sets) | ❌→🔧 | — (0032a21 + 5781335 recorded here; 🔧 markers carry no inline hashes) | per-line price moves now reshape churn/retention/dunning/invoice arithmetic in the engine; live elasticity readout, demand-ghost preview and the hard-to-undo re-anchoring asymmetry remain unimplemented |
| The Second Incident rule (§2.12 twin of the batch-1 ✅ §2.24 multiplier) | 🔧→✅ | 4856a42 c9c0433 2ef5cae | it held 🔧 ONLY on the owed-host-input ground the fix-wave recorded; the runner now feeds incidentState and the 1.8×/2.5× follow-on multipliers fire on shipped g1 data |
| "Authoritative" / "NXDOMAIN" / "Root Zone" — Anycast DNS hosting | ❌→🔧 | — (a79402c) | the loader-parsed Ruleset Card verbatim-authors the type: dominant verb Commit, anycast-PoP scarce resource, zone-ttl-band/negative-cache/dnssec-rotation dials, free-tier-query-allowance slider, dnssec-signer/RRL/anycast-pop-map buildables |
| `The Registrar` / `NXDOMAIN` | ❌→🔧 | — (a79402c) | the chair's boss threat is authored in the g1-dns wave slice (udp-amplification-barrage + open-resolver-reflection) which the waves inspector parses; playable-level framing still owed |
| DNS: NXDOMAIN Flood and Free-Tier COGS Leak | ❌→🔧 | — (a79402c) | free-tier slider + negative-cache-tuner/aggressiveness machinery authored as parsed data; the water-torture leg remains a scenario-key hook only |

SKIPPED — already moved (current markers asserted on disk per protocol): `## 6.5 Pricing as a mechanic` already 🔧 (holds — see PROBLEMS row); the canonical-death rows Bankruptcy/cash-zero, Covenant Default, Churn Spiral and `## 6.10 Win and lose conditions` were ALL already 🔧 since the audit — `ab0bf5c` + `984759b` strengthen them (warning→notice→dissolution state machine live, both hosts forward refused settlements into the death watch, halt-on-death opt-in, pack voices shipped) but win/lose screens + narration keep 🔧; §2.24 twins Copycat reserve + Second Incident multiplier already ✅ (batch-1); Feint budget holds 🔧 marker-inert (batch-1 ruling). The attention-budget row (orig 14424, disk 14436): NO file change — 🔧 markers carry no inline hashes; `eff5694` recorded in the PROBLEMS disposition above, the in-file appendix cell and the MODULE-STATUS OD-6 gap row.

❌ HOLDS with reason: Elasticity testing orig 23225 (A/B research action unbuilt — shipped curve is static config), The Price Dial + Demand Ghost orig 25388 (visual row), Whois/Redemption Grace orig 2540 (no registrar card exists — the DNS bundle's registrar-account-lock is a buildable, not the business), The Copycat Wave orig 6249 (miss-list-driven draw ≠ the shipped dominant-defense-family reserve), Zero Downtime Migration + The Lame Delegation orig 3180/3700 (hollow scenario-key hooks — launch-window precedent), all narrated endings (§6.15/§9.9 group incl. Bankruptcy Cascade — need HUD/narration).

DISCLOSED OWNER FLAGS (ratify-on-playtest posture; markers hold no such notes): (1) billing override order is GRANDFATHER-WINS (override → escalator → grandfather → MFN last); (2) retention-floor asymmetry — price cuts buy NO certainty (cap ≤1.0 mirrors down to the floors); (3) every constant shipped PROVISIONAL: death (float 3d, churn 3d sustained, grace 10d, collapse floor 1), elasticity (150/80/50% coefficients, ±10% dead band, 0.5×/3× clamps), attention (per-verb costs 0|1, capacity default).

REVIEW OUTCOME: nine commits (batch-2 lanes + fix lane) — zero critical/major findings at 5781335; the one typecheck MAJOR (unattended death-forwarding.test.ts under exactOptionalPropertyTypes) fixed @05ecf97 with FULL serial re-proof **1,803 tests / 126 files exit 0** (api-verify PASS 1,426 · ci-verify 5/5 · headless parity b0162ab5/a9b4b7b8 held · zero goldens moved by the fix).

**Marker census before→after batch-2 (recomputed from disk):**

| bucket | before | after |
|---|---|---|
| ✅ DONE | 289 | **290** |
| 🔧 PARTIAL | 994 | **997** |
| ⚠️ PROBLEM | 1 | 1 |
| ❌ MISSING | 2275 | **2271** |
| 📝 NA | 30 | 30 |
| **total marked** | **3,589** | **3,589** |

hosting_game.md line count unchanged at 35,557 — all edits in-place (5 heading lines + appendix prose), zero insertions.

## WAVE-3 ADDENDUM — recovery reconciliation (2026-10-13, ADR-0012, this lane; APPLIED by CLOSEOUT-3 — dispositions below are now disk truth, with the two deviations noted)

The §7.7 recovery half shipped as two coexisting designs — the pure OBSERVER (`6867f74`) and the stateful ENGINE (`60e464b`) — with a dual second-failure-window authority between them. ADR-0012 makes the ENGINE canonical and demotes the OBSERVER to digest-neutral advisory/opex; both shipped hosts now wire the engine behind optional config (absent = byte-identical). Deviations applied at closeout: "The Second Failure Window" advanced ❌→✅ (not 🔧 — single reconciled authority + live strike/lock folding is the heading's whole demand); "Partial restore and prioritised recovery" held ❌ (not 🔧 — engine floor→full is recorded on the ✅ window row, but no player-facing prioritisation shipped, conservative posture per closeout instruction).

| heading (disk line) | flip | disposition after ADR-0012 |
|---|---|---|
| The Second Failure Window (27513) | ❌→**✅** `60e464b 31b5a1c` | engine windows/strikes/locks are the single authority (`GameState.recovery.windows`); the amber bar `secondFailureWindowActive` is now a pure READ of it; strikes re-anchor and lock at the floor and hold the window |
| Recovery is gameplay (and recovery order matters) (27530) | ❌→🔧 | ramp-back one arm per `rampMinutes` moves REAL serves via `throttleServeNodes`; observer crew allocation orders by priority/fail-time as advisory queue; player-chosen recovery order (verbs/HUD) unowned |
| Restore service or restore redundancy? (the recovery decision nobody states) (27561) | ❌→🔧 | `restoreOptions` decision table + `RECOVERY_ACTIONS` opex menu shipped as advisory decision-support reads; nothing states the choice in HUD/play flow yet (E2b) |
| The cold-cache thundering herd (27569) | 🔧 holds | strengthens: slow-start admission is now LIVE ground truth (`effectiveSlots` climbing = cold-cache ramp on the engine's clamped board); the cache tier itself remains absent |
| Degradation Debt (27577) | ❌→🔧 | `degradedMinutes` accrual meter shipped observer-side; strike memory (`strikesByNode`) is engine state; catch-up-overload repayment remains unimplemented |
| Partial restore and prioritised recovery (27612) | ❌ holds | partial restore is engine law (floor→full arm-by-arm, occupied arms never evicted — recorded on the ✅ window row); `setRecoveryPriority` queue override advisory-only; player-facing prioritisation UI unowned → demeral not earned |
| The Failback Problem (27620) | ❌→🔧 | `acceptsFailback` hold predicate (completion + failback delay) shipped advisory on the observer's `recoveredAtMinute` anchor; secondary-site failback authority absent |
| The Post-Mortem (screen, sheet, and progression hook) (27674) | 🔧 holds | strengthens: filing fold + single-source reputation credit (`economy/postmortem.ts`, `cfg.reputation.honestPostmortemBps` — ADR-0012 verified the observer's `markBlamelessPostmortem` mints NO money/reputation, only halves its own advisory escalation excess) — screen/progression-hook half still absent |
| Root cause vs band-aid (27687) | ❌ holds | band-aid-vs-root tracking not implemented by either design; unchanged |

UNCHANGED honestly ❌ in the same section: The Failover Handoff (27523), The cold-start dependency cycle (27549), Data loss is permanent (27596), The Corruption Horizon (27604), The Reboot Roulette (27629), The rollback one-way doors (27643), Salvage and the rebuild (27667).

Adopted at closeout with the noted deviations — full register in CLOSEOUT-3 below.

## CLOSEOUT-3 — re-markup applied (2026-10-13, tip 31b5a1c, lane commits 6867f74..31b5a1c)

Battery before markup (serial, unloaded, all green): sim-core 136 files / 1,984 tests exit 0 · `pnpm -r typecheck` 5/5 rc 0 · proto 79 files / 847 tests exit 0 + typecheck + build · headless 53/5 **parity b0162ab5/a9b4b7b8 held** · api-verify PASS 16 modules / 1,533 names · content validate PASS · canary PASS 127 files · ci-verify 5/5.

**Flips applied (17 heading lines, in-place, zero insertions):**

| heading | flip | cite |
|---|---|---|
| The Second Failure Window | ❌→✅ | `60e464b 31b5a1c` |
| Recovery is gameplay (and recovery order matters) | ❌→🔧 | ramp live both hosts, order not a verb |
| Restore service or restore redundancy? | ❌→🔧 | observer decision-table only |
| Degradation Debt | ❌→🔧 | meter accrues, nothing charges repayment |
| The Failback Problem | ❌→🔧 | `acceptsFailback` advisory, hosts silent |
| Published Post-Mortem Credibility | 🔧→✅ | `57ea80e 60e464b 31b5a1c` |
| Bankruptcy / cash zero (Insolvency) | 🔧→✅ | `ab0bf5c 984759b f9ea470 0b35b15` |
| Churn Spiral / Mass churn cascade | 🔧→✅ | same cites — batch-2 hold cleared |
| Covenant Default | 🔧→✅ | same cites |
| `The Angry Whale` / Concentration Crisis | ❌→✅ | `10f1d36` |
| `Deadbeat Quarter` (§1.5) | ❌→✅ | `10f1d36` |
| `The Long Weekend` / No Hands | 🔧→✅ | `10f1d36` |
| `Collections Week` | 🔧→✅ | `cdb2bc5` |
| `Metastable` | 🔧→✅ | `cdb2bc5` |
| 1.5 Scenario library (section) | ❌→🔧 | 5 of ~25–30 headlines runnable |
| The Price Dial + Demand Ghost | ❌→🔧 | billing moves end-to-end; ghost preview unbuilt |
| Grace Windows → Triage Window / Attention Grace | 🔧→✅ | `eff5694 8994f96 0b35b15` |

**Holds recorded (no marker move):** price slider (22957) + "Difficulty Dial the Player Turns" (4657) stay 🔧 — new-vs-renewal two-number display / 12-month renewal lag unmodeled, PricingDial confirms before commit (no ghost); "Price Increase" (23079) 🔧 (size param only of four); per-verb attention-cost selection rows 🔧 (host-chosen config, owner taste owed); postmortem screen (24199/27674), spiral diagram (23863), CEO Override (27023), XP writeup (20221) hold; no "Safe mode"/"Gradual restoration" headings exist; data-loss/cold-start/corruption/partial-restore/blast-door/herd rows unchanged.

**Marker census before→after (recomputed from disk):**

| bucket | before | after |
|---|---|---|
| ✅ DONE | 290 | **301** |
| 🔧 PARTIAL | 997 | **995** |
| ⚠️ PROBLEM | 1 | **1** (unchanged: 31543 readability — OD-10/12 open) |
| ❌ MISSING | 2,271 | **2,262** |
| 📝 NA | 30 | 30 |
| **total marked** | **3,589** | **3,589** |

hosting_game.md stays 35,557 lines — 17 heading lines edited in place + one appendix paragraph appended before "Historical record:".

## WAVE-5 (closeout re-markup 2026-10-13, seven commits 7afa038..c082a64 atop 1a1d15a)

| Commit | Headline |
|---|---|
| `7afa038` | feat(content): hosting type 5 — Root Is Theirs (official:dedicated bundle + g1-dedicated wave slice + 66-template pack; 5/9 §7.8 hooks; data-only, zero src/ engine change) |
| `80e7473` | feat(scenario): five more §1.5 missions — Launch Day, DDoS Season, Runway: 6 Weeks, The Price Hike, The Quiet Month (each won-as-authored + lost-by-ONE-wire-flip, ×100 byte-identity legs; scenario suite 85→120) |
| `dce511b` | feat(proto): chrome/RecoveryWatch — the §7.7 engine slice gets a HUD (default-off honest + armed five-kind demo; proto-only, sim-core untouched) |
| `09d6adc` | feat(pipeline): populationEffect attract half — signed coefficient completes the §2.13 curve (above-floor cohort gravity mints one bonus arrival per hit; repel draw byte-stable; config-absent byte-identity re-pinned) |
| `9bb6329` | refactor(sim-core): shared tick fold — internal/tickFold.ts is the ONE money-fold home consumed by fastForward + scenario runner (ledger topic parameterized; every shipped digest byte-ident) |
| `5df5586` | feat(scenario): corpus `{tableId, waves:[N]}` traffic seam — resolveCorpusWindows replays the fastForward director/planWave cursor law over host-injected slice JSON; 11th mission `metastable-corpus` re-storms §1.5 Metastable from shipped g1 data |
| `c082a64` | docs(scenario): stamp the corpus-seam SHA in the MODULE-STATUS gap row |

**Marker flips (this wave):** `Launch Day`, `DDoS Season`, `Runway: 6 Weeks`, `The Price Hike`, `The Quiet Month` ❌→✅ `80e7473` · "Root Is Theirs — Dedicated servers / bare metal" ❌→🔧 `7afa038` (data-shipped, mail/DNS clone precedent) · "The Population Effect" 🔧→✅ `626d2a7 09d6adc` (both halves of the curve live; g09 notes "zero consumers"/"floor-inversion unmodeled" retired) · §0.3 scarcity table row carries no marker (review-minor #4 precedent) — data fact noted in the hosting_game.md appendix · `Metastable` ✅ marker UNCHANGED, corpus twin recorded in the appendix · §7.7 recovery: NO heading moved (RecoveryWatch renders the engine slice; ordering-puzzle + advisory-OUT rows stay 🔧) · §1.5 umbrella: no count row exists on disk — appendix reflects 5→11 runnable missions.

**Zero-golden proofs:** 7afa038 disclosed "136 files/1,986 exit 0, zero goldens moved, parity b0162ab5/a9b4b7b8 held" · 09d6adc "serial 2,031/136 exit 0, ZERO goldens moved, parity HELD" · 9bb6329 "136/2,031 exit 0, zero golden/digest moves (×100 determinism, drain 78dc6556, g4 13ba145f …), parity held, canary 129" · 5df5586 "FULL SERIAL 137/2,049 exit 0, api-verify 1,541, parity held, content validate PASS" · 80e7473/dce511b added tests only (suite counts rode the footer re-pins above; dce511b is proto-chrome, structurally sim-core-golden-inert) · **this closeout re-verified the FULL battery on the final tree** (sim-core serial 137 files/2,049 exit 0 — the exact footer pin — plus typecheck/api-verify/ci-verify/proto/headless; see the wave-5 commit note).

**Verb-exhaustion finding (`7afa038`, gap row added to docs/MODULE-STATUS.md):** `official:dedicated` takes `Observe` as dominant verb — THIRD card naming it (VoIP + object-storage also do; pairwise VERB_SHIFT blocks those two) — and NO card names `Diagnose`. Hosting types 6+ are blocked on ADR-0005 per-tier verb extension or new-card authoring within the existing vocabulary. **Owner.**

**Marker census before→after (recomputed from disk, heading lines only):**

| bucket | before | after |
|---|---|---|
| ✅ DONE | 301 | **307** |
| 🔧 PARTIAL | 995 | **995** (Root Is Theirs in, Population Effect out) |
| ⚠️ PROBLEM | 1 | **1** (unchanged: 31543 readability — OD-10/12 open) |
| ❌ MISSING | 2,262 | **2,256** |
| 📝 NA | 30 | 30 |
| **total marked** | **3,589** | **3,589** |

hosting_game.md grows by the appendix paragraph only (7 heading lines edited in place); "Historical record:" footer kept last.

---

## WAVE-6 closeout — four wave-three missions marked, dial billing-truth, attention card seams (2026-10-13b)

Lanes under markup (both already on master; this wave only marks and records):

| Commit | Lane | Shipped |
|---|---|---|
| `b5017df` | scenario predicate ladder | Rungs 1–3 consumed — `written-off-below/above`, `metric-delta-over-window`, `family-arrivals-below/above` (ZERO new export names; 15-predicate vocab) + four §1.5 wave-three missions: post-breach-aftermath :3213, contract-recompete :3839, free-tier-flood :3574, the-sev-0 :3240 PARTIAL. Scenario suite 138→192 tests. |
| `5b19a04` | proto surfaces | PricingDial moves REAL billing — control/treated twin on the @`8994f96` forwarding pattern, −$28.49 grouped-cash pin (`pricingDial.mount.test.ts:72`); AttentionCard (E2a denominations surface at chrome level, pool planted via PUBLIC pipeline API); CorpusMissionCard — proto host leg of @`5df5586`, win@240 digests byte-match the sim-core suite pins, missing authority fails loud `CORPUS_UNRESOLVED`. Proto 890/81→928/85. |

### Marker flips applied (all four asserted against pre-write markers; `Contract Recompete` was 🔧, not ❌, as the brief assumed — audit had already flipped it PARTIAL)

| Spec line | Heading | Before | After | Witness (seed 904..908, ×100 byte-identity) |
|---|---|---|---|---|
| 3213 | `Post-Breach` / `The Breach` / `The Suspicious Login` | ❌ | ✅ `b5017df` | win@320 ×5; one-flip loses `written-off-above:6` @[301,313,311,307,297]; stretched-clock falsifier proves survive:320 load-bearing (death@358) |
| 3839 | `Contract Recompete` / `The Renewal` | 🔧 | ✅ `b5017df` | metric-delta witness served 840/600 (+40% vs the asked +25%); one-flip 14→28 loses `bounces-above:25` @[200,199,202,198,202] |
| 3574 | `Free Tier Flood` / `Free Tier Abuse` / `Free Tier Invaded` | ❌ | ✅ `b5017df` | dice-free family census 1672 organic / 3146 malicious; one-flip 26→40 breaches the 3200 ceiling at EXACT tick t200 on all five seeds |
| 3240 | `The Sev-0` | ❌ | 🔧 | PARTIAL — mission runs and wins (crater-recovery delta 840/480; one-flip 14→60 loses @[162,163,162,163,160]); the spec's restraint sequence is non-expressible (no decision door on the wire) |

### Held rows — appendix-noted, no marker move

- 14436 "The attention budget" + 27023 "Executive attention as a tiny pool, and the CEO Override" stay 🔧: `5b19a04` shipped the AttentionCard surface (wire `AttentionSummary` per step, loan ledger + repaid chips, month-roll services oldest loan at tick 420, bounded window-entry refusal visible) but there is **NO mid-run window-entry seam and NO borrowing verb** (borrow rebuilds at minute 0 — RecoveryWatch arm law). 26656 "Pause with orders" already ✅ — unchanged.
- 22957 "The price slider (difficulty as a dial the player sets)" stays 🔧: the dial now moves real billing (−$28.49 twin pin), but the demand-ghost preview, live elasticity readout and cohort-lag asymmetry remain unmodeled.
- Umbrella 3135 "§1.5 Scenario library" stays 🔧 — no inline count exists on disk; appendix tally: **15 missions / 14 distinct headings** (`metastable-corpus` twins `Metastable`).

### Predicate ladder remaining

Rung 4 `covenant-inputs` → `Covenant` :3772 ❌ · Rung 5 `reputation` → `Review Bomb` / `The Viral Competitor Smear` / `Media Attention` :3870 ❌.

### Closeout battery — COMBINED tree (coexistence proven; proto lane had only run isolated pre-merge)

| Gate | Result |
|---|---|
| sim-core serial (`--no-file-parallelism`) | **137 files / 2,103 tests, exit 0** (237s) |
| proto `vitest run` | **85 / 928, exit 0** — first post-battery run showed 2 load flakes at hand-off; three subsequent runs green |
| `pnpm -r typecheck` | **5/5 Done** |
| `docs/api-verify.test.mjs` | **PASS — 1,541 names**, import map consistent |
| `scripts/ci-verify.mjs` | **5/5 PASS** (api-verify, content-validate, canary, proto-build, g5-mirror-diff) |
| headless `vitest run` | **53/53, exit 0** — parity REAL `b0162ab5` / STUB `a9b4b7b8` held |

### Census (recomputed from disk, heading lines only)

| Class | Before | After |
|---|---|---|
| ✅ DONE | 307 | **310** |
| 🔧 PARTIAL | 995 | **995** (Sev-0 in, Contract Recompete out) |
| ⚠️ PROBLEM | 1 | **1** (unchanged: 31543 readability — OD-10/12 open) |
| ❌ MISSING | 2,256 | **2,253** |
| 📝 NA | 30 | 30 |
| **total marked** | **3,589** | **3,589** |

Missing-seams register (recorded, not queued): mid-run attention window-entry · attention borrowing verb · Sev-0 restraint decision door · pricing demand-ghost preview.

hosting_game.md grows by the appendix paragraph only (4 heading lines edited in place); "Historical record:" footer kept last.

---

## WAVE-7 closeout — covenant + review-bomb missions marked, attention borrow seam landed (2026-10-13c)

Lanes under markup (both already on master; this wave only marks and records):

| Commit | Lane | Shipped |
|---|---|---|
| `e1786fc` | proto attention seam | `SimCoreRunner.enterAttentionWindow(kind)` — the WRITE twin of the @`8994f96` `attentionState()` readback; mints-or-refuses through the PUBLIC pipeline functions only, host business-minute stamp, protocol-v1 `SimProjection` shape untouched. `AttentionCard.vue` borrow is now LIVE: empty planted pool → borrow mid-run → month roll services it on ONE continuous runner, clock never resets. Closes both wave-6 held gaps (mid-run window-entry + borrowing verb). Door and TopBar untouched. |
| `957ffcf` | scenario predicate ladder | Rungs 4–5 CONSUMED — `covenant-breached-count-below/above` (reads `EconomyState.covenantBreachLog`) + `reputation-below/above` (reads `EconomyState.reputation.overallBps`); first wire the parser can even CARRY covenant terms (`limits.covenants` closed rows `{id, metricId ∈ {runwayMonthsBps, errorBudgetHealthBps}, floorBps, direction}`, dup refused); `COVENANT_METRICS` wall refuses EBITDA until a producer exists. Two §1.5 wave-four missions: `the-covenant` :3772, `review-bomb` :3870. Runner re-anchors covenant `freeAtMonthStart` to the opening bankroll (else month-1 burn closes 0 → null runway → every min-covenant silently met; 15 pre-wave-4 docs `covenants:[]` byte-ident). 19-predicate vocab. Scenario suite 192→228 tests. |

### Marker flips applied (both asserted against pre-write `❌` markers; rungs 4–5 were the last two on the ladder)

| Spec line | Heading | Before | After | Witness (seed 904..908, ×100 byte-identity) |
|---|---|---|---|---|
| 3772 | `Covenant` | ❌ | ✅ `957ffcf` | clean win@480, zero breach rows, five offsets byte-ident stop line; ONE-FLIP lose = the single 70B µ$ growth-buildout opex row @min 100 breaches `runwayMonthsBps ≥ 60_000` at EXACTLY tick 420 (the one month-roll review inside the 480-clock), all five offsets |
| 3870 | `Review Bomb` / `The Viral Competitor Smear` / `Media Attention` | ❌ | ✅ `957ffcf` | rating is the lives counter — win@320 rating 6,550–7,750 bps never touching the 1,500 floor; ONE-FLIP lose = the six-account book doubles to eighteen delinquent hourly accounts, write-offs stack 15–17, crater crosses 1,500 bps at t[310,300,292,299,292]; board is a red herring BY DESIGN (`bounced=0` both arms — "damage regardless of actual uptime" made mechanical) |

### Held rows — appendix-noted, no marker move

- 14436 "The attention budget" stays 🔧: `e1786fc` **LANDS the borrow seam** (window-entry + live AttentionCard borrow), clearing the two wave-6 held gaps. What keeps it 🔧 now: **per-verb door cost selection is owner taste** — the door carries an `attentionCost` config but no shipped verb opts in (the intent door still has no borrowing), and the **TopBar four-id law** pin. The host seam is now complete end-to-end; the mechanic simply has no player-facing verb that spends a hand yet.
- Umbrella "§1.5 Scenario library" stays 🔧 — no inline count exists on disk; appendix tally now **17 missions / 16 distinct headings** (`metastable-corpus` twins `Metastable`; the-sev-0 holds 🔧 separately).

### Predicate ladder — EXHAUSTED

All five rungs consumed (1 `written-off`, 2 `metric-delta`, 3 `family-arrivals`, 4 `covenant-inputs`, 5 `reputation`) on a **19-predicate vocab ceiling**. Remaining §1.5 headline conversions are NOT vocab gaps — they need new INPUT channels: **door-intents** (a spending verb that consumes an attention hand), **routing alternates**, and the **`majorIncidents` / `postMortems` / `chargeback` INPUTS** the scenario money lane does not yet forward (`foldMoneyLaneTick` feeds only outage seconds, price overrides and refused settlements). Recorded as next-ladder candidates.

### Closeout battery — COMBINED tree (re-verified on final master tip `957ffcf`, serial/unloaded)

| Gate | Result |
|---|---|
| sim-core serial (`--no-file-parallelism`) | **137 files / 2,139 tests, exit 0** (244s) |
| proto `vitest run` | **86 / 935, exit 0** |
| `pnpm -r typecheck` | **5/5 Done** |
| `docs/api-verify.test.mjs` | **PASS — 1,541 names**, import map consistent |
| `scripts/ci-verify.mjs` | **5/5 PASS** (api-verify, content-validate, canary, proto-build, g5-mirror-diff) |
| headless `vitest run` | **53/53, exit 0** — parity REAL `b0162ab5` / STUB `a9b4b7b8` held |

### Census (recomputed from disk, heading lines only)

| Class | Before | After |
|---|---|---|
| ✅ DONE | 310 | **312** |
| 🔧 PARTIAL | 995 | **995** (unchanged — attention seam landed, marker held) |
| ⚠️ PROBLEM | 1 | **1** (unchanged: 31543 readability — OD-10/12 open) |
| ❌ MISSING | 2,253 | **2,251** |
| 📝 NA | 30 | 30 |
| **total marked** | **3,589** | **3,589** |

Missing-seams register (recorded, not queued): ~~mid-run attention window-entry~~ ~~attention borrowing verb~~ (both CLEARED by `e1786fc`) · Sev-0 restraint decision door · pricing demand-ghost preview · per-verb attention door cost (owner taste) · door-intent / routing-alternate / `majorIncidents`·`postMortems`·`chargeback` INPUT channels for the next ladder.

hosting_game.md grows by the appendix paragraph only (2 heading lines edited in place); "Historical record:" footer kept last.

## WAVE-8 closeout — five channel missions marked, corrupts engine-live, review GO recorded (2026-10-14)

Lanes under markup (all four already on master; this wave marks and records):

| Commit | Lane | Shipped |
|---|---|---|
| `110f516` | scenario input channels + pilots | **door-intents** and **economy-signals** channels wired into the scenario runner (the two next-ladder candidates wave-7 recorded): door verbs can spend hands mid-mission; host-signals forward the money-lane inputs the wave-7 register named. Three §1.5 pilot missions: `understaffed-sunday` :3657, `chargeback-wave` :3721, `the-slow-week-after` :4025. |
| `16c6add` | corrupts patience mode v0 | `limits.corrupts` arm — `patienceModeByType` / `corruptionProbability` spread into serve slots, `defaultPatienceMin` pinned ONLY when armed; silent-corruption damage channel is engine-live, DEFAULT-OFF (byte-ident when absent); `corruptions` observation field + `corruption-above/below` predicates. |
| `bc11697` | corpus invitations gate | `CorpusAuthority {invitations?, buildLog?}` — whole storms gate through exported pure `gateCorpusWave` BEFORE dice roll; excluded waves leave no cursor hole; fully-invited ⇒ authored envelope byte-ident; default-off pinned byte-ident incl literal-pinned pre-gate window JSONs. INVITATIONS leg of the wave-3 corpus seam CLOSED; packages/content untouched. |
| `6f92836` | wave-five conversions | Three §1.5 missions on the new channels: `someone-elses-outage` :4047 (door communicate interlude, green-site `bounces=0`, packed-burst flip lose@26 ×5), `the-rfo` :4034 (`style-blame` one-field flip 4750n→4000n → lose@60 ×5 via the `honestPostmortems` assertion channel), `the-threshold-day` :4086 (`limits.corrupts` arm, dice-free 105 census ×5, flip = 7th-arrival cross@153; SLA-money leg NON-expressible — `tick.ts:1266/1287`). Vocab now **29 predicate kinds**, 23 mission wires. |

**Read-only review verdict:** ALL FOUR COMMITS CLEAN — **PUSH-GO**. 1 minor + 2 nits, none blocking. Minor recorded as a debt row (not a fix-in-wave): **`corruptionOutageSecs` consumer census = zero production callers** — the engine emits it, no host consumes it yet; carried into the hosts-lane batch-E debt register below (same forwarding class as the `observedWrites` seam history).

### Marker flips applied (each asserted against its pre-write `❌` on disk before the write)

| Spec line | Heading | Before | After | Witness / note |
|---|---|---|---|---|
| 3657 | `The Understaffed Sunday` | ❌ | ✅ `110f516` | pilot on the door-intents channel — quarter-hands triage mission runs the real rail |
| 3721 | `The Chargeback Wave` / `Processor Freeze` / `Rolling Reserve` | ❌ | ✅ `110f516` | single manifest row (group-03 :65); `chargeback-wave` ships via the economy-signals chargeback INPUT; Processor Freeze / Rolling Reserve stage naming rides the same row — content-side staging remains unbuilt, row-level flip per closeout authority, recorded here |
| 4025 | `The Slow Week After` | ❌ | ✅ `110f516` | pilot on the same channels — social-pressure level expressible end-to-end |
| 4034 | `The RFO` | ❌ | ✅ `6f92836` | post-mortem `style-blame` one-field flip, lose@60 ×5 seeds; document-assembly minigame stays content, engine-side evidence + obligation leg now playable |
| 4047 | `Someone Else's Outage` | ❌ | ✅ `6f92836` | door-communicate interlude, green-site bounced=0 witness, packed-burst flip lose@26 ×5 |
| 4086 | `The Threshold Day` (the "nothing changed" level) | ❌ | 🔧 | **no inline hash** — corrupts arm fully live (dice-free census ×5, flip cross@153) but the heading's hard-limit SLA-money leg is non-expressible (`tick.ts:1266/1287`); **Sev-0 :3240 partial-🔧 precedent** |

### Held / skipped rows — appendix-noted, no marker move

- 11436 **"Patience as HP" stays ✅ `8fd409a`** (already done): appendix note — the corrupts arm went ENGINE-LIVE @`16c6add` (default-off); the errorBudget fan-out awaits the hosts lane (consumer side of the corruption signal).
- **No distinct "corrupts"/"corruption" sub-heading exists inside §3.1 or §2.13** — §3.1 scan (11434–11937) and §2.13 scan (10067–11433) find corruption only in body prose (:11269, :11341). The corruption-flavoured headings at :8157 / :9670 / :27604 / :30808 belong to other sections and stay ❌ — outside this ticket's stated scope, skip-with-note per instruction 4.
- Umbrella "§1.5 Scenario library" stays 🔧 — appendix tally now **23 missions / 22 distinct headings** (`metastable-corpus` twins `Metastable`; threshold-day holds 🔧 separately alongside the-sev-0).

### Predicate ladder — next rungs

Vocab 19→**29 kinds**. The wave-7 "channels not vocab" thesis held: door-intents, `majorIncidents`-class economy signals, post-mortems and chargebacks all converted this wave. Remaining next-rungs: **routing alternates** (Suspicion-Routing lane-choice predicates), **invitations breadth** (more §1.5 storm headings converted onto the now-closed corpus invitations gate — `free-tier-flood` :3574 and `the-sev-0` :3240 are the named candidates), and **per-verb attention door cost** (owner taste; engine seam shipped @`eff5694`).

### Hosts-lane batch-E debt register (carried, not queued)

- **`corruptionOutageSecs` — zero production consumers** (wave-8 review minor): engine emits, hosts must forward/consume the same way `EconomyTickOut.observedWrites` required runner + fastForward + g5 forwarding @`45f0edf`. Sibling rows unchanged: proto runner price-override forwarding, corpus config.corpus injection, metricNamespaceTier schema.

### Closeout battery — marked tree, serial/unloaded

| Gate | Result |
|---|---|
| sim-core serial (`--no-file-parallelism`) | **139 files / 2,276 tests, exit 0** (251.5 s) |
| proto `vitest run` | **86 / 935, exit 0** |
| `pnpm -r typecheck` | **5/5 Done** |
| `docs/api-verify.test.mjs` | **PASS — 1,554 names**, import map consistent |
| `scripts/ci-verify.mjs` | **5/5 PASS** (api-verify, content-validate, canary, proto-build, g5-mirror-diff) |
| headless `vitest run` | **53/53, exit 0** — parity REAL `b0162ab5` / STUB `a9b4b7b8` held |

### Census (recomputed from disk, heading lines only)

| Class | Before | After |
|---|---|---|
| ✅ DONE | 312 | **317** |
| 🔧 PARTIAL | 995 | **996** (Threshold Day ❌→🔧) |
| ⚠️ PROBLEM | 1 | **1** (unchanged: 31543 readability — OD-10/12 open) |
| ❌ MISSING | 2,251 | **2,245** (six heading lines flipped) |
| 📝 NA | 30 | 30 |
| **total marked** | **3,589** | **3,589** |

hosting_game.md line count UNCHANGED (35,565 on disk, pre==post) — all six flips are in-place marker swaps, zero insertions; this SUMMARY section is the only file that grew. "Historical record:" footer kept last.

---

## WAVE-9 closeout — session-3 rulings encoded, storm cap + visual coverage live, co-op contract + type-6 anchors (2026-10-14)

Lanes under markup (all eight commits on master, `48cf8c6..2fefc60` atop `1ab2738`; this wave marks and records):

| Commit | Lane | Shipped |
|---|---|---|
| `48cf8c6` | session-3 encoding | **ADR-0013 — fourteen rulings, adopt-all** over the decision brief: OD-7/9/10/11/12/15/17/18/19/20 DECIDED, the ratify-on-read pile confirmed-provisional, canSettle stays host-forwarded, verb-exhaustion extends within ADR-0005, D-7 cap adopted **BOUNDED** (128/8 explicitly NOT blessed). Docs-only; three in-file law-notes planted (§4.8 Hands Dock :17616 bottom-left placement RULED, §8.9 Confidence Blur :29316 attachment-crispness composition, §8.18 readability :31561 2× max-legibility law + "⚠️ marker kept"). |
| `502ca3f` | storm cap (ruling 6) | D-7 engine ceiling `STORM_CAP {≤1024 units/min, ≤4 stacked envelopes/wave}` — TWO doors: parse-time refusal naming table+wave, plus deterministic director clamp (`scaleStormCounts` floor-per-entry, no redistribution, counts clamped BEFORE mint ⇒ RNG streams byte-ident; `WavePlan.stormClamped?` presence-only). Shipped-slice census ≤25.8% of cap, clamp inert on every authored wave — **late-game sheet-B crest pins now BOUNDED** (100%-par crest crosses 1024 ~wave 17–18 and must par down). |
| `179861d` | attention costs + Hands Dock (rulings 12(v) + 5(c)) | `ATTENTION_DEFAULT_COSTS` — the owner cost map {Communicate 1, ticket-class 1, else 0} is LAW, host opt-in into the door; fastForward forwarding twin; AttentionCard docked **bottom-left** with data-stamps; OD-10 speed-legibility source pins. |
| `54510b1` | manifest-lint + lookalike law (rulings 5(d) + 9) | §8.18 audit becomes a CI rule: `validate.mjs` fails RED on any shipped threat/visitor/palette archetype lacking a doc-grounded `visual` slug or explicit `codexOnly:true` — **29/29 tagged** (16+9+4), five red-proofs (missing-visual / bad slug / unknown mask / archetype-carried mask / stripped seed). OD-18: registry-side `lookalikeOf` + FIVE mimic seeds (one per shipped bundle) + direction lint. |
| `e27787c` | stamp | docs-only MODULE-STATUS gap-row closure stamps for rulings #5(d)/#9 @`54510b1`. |
| `8c0ff88` | co-op contract v0 (rulings 2 + 8) | `save/coop.ts` shared branch node — seat ledger (2–4 writers, strictly ascending joins, overlap-capped), per-participant `attributedParticipantId` on the EXISTING scar/museum records (museum reused, never forked), `guardCoopAttributionBatch` refusing non-branch facets BY NAME ("customers/cash stay company-level"). `replay/coopTimeline.ts` — the OD-17 **shared incident timeline**: one `(tick, seq)`-ordered log, kinds action\|sightline\|note, dup stamp throws naming both positions, `digestCoopTimeline` interleaving-invariant through the replay canonical machinery. SP wires byte-ident (additive-optional). Validator, not runtime — Workerman relay stays out-of-repo. |
| `1d7736f` + `2fefc60` | verb-unblock (ruling 14) | loader per-tier dominant-verb extension frees the type-6+ card pipeline; `official:object-storage` — the FIRST card freed: dominant verb **Shield** breaks the §7.8 Observe collision; ships as DATA (bundle + first-quarter slice + pack) per the Root-Is-Theirs mail/DNS clone precedent; THREE_CHANGE/VERB_SHIFT lints clean through the route chosen. |

**Read-only review verdict:** ALL EIGHT COMMITS CLEAN — **PUSH GO**, zero critical, zero major. 3 minors + 2 nits recorded (none blocking, none fixed-in-wave):

| # | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | `STORM_CAP` derivation docblock over-claims (headroom framing vs what the constants actually prove) | minor | docs-sweep |
| 2 | co-op `commitCoopAttribution` record-shape note — relay-side shape expectations should be pinned when the transport lane lands | minor | transport-lane |
| 3 | `2fefc60` commit-message "malicious omitted" wording vs the shipped roster data disagrees | minor | docs-sweep |
| 4 | schema `visual`/id pattern inconsistency: digit-leading ids accepted differently across the two new registry schema shells | nit | docs-sweep |
| 5 | DECISIONS-PENDING OD-9/OD-17 rows carry bold-nesting markdown artifacts (`**…**…**`) | nit | **CLOSED 2026-10-14 (closeout-7 follow-up docs commit)** — both cells re-nested as two sequential bolds, markdown-only |

Post-closeout addendum (closeout-7): the brief's "m3" ask — a MODULE-STATUS gap row for tier-extension verbs having no door mechanic — was **verified already live** at `docs/MODULE-STATUS.md:174` ("TIER-EXTENSION VERBS HAVE NO DOOR MECHANIC", opened by VERB-UNBLOCK), so no row was added; nit #5 was fixed in the same follow-up commit. Minors #1–#3 and nit #4 keep their recorded dispositions.

### Marker flips applied (five, each asserted against its exact pre-write on-disk line before the write)

| Spec line | Heading | Before | After | Witness / note |
|---|---|---|---|---|
| 1907 | §1.3 `"Eleven Nines" / "Bucket" / "The Honeycomb" — Object storage` | ❌ | 🔧 `2fefc60` | first card freed by ruling 14; data-shipped via the DNS/Root clone pattern; **Shield-door mechanic gap keeps it off ✅** (mirror of the Root-Is-Theirs hold) |
| 14694 | §3.12 `The Lookalike Test` | ❌ | 🔧 `54510b1 e27787c` | authoring side live (registry field + 5 mimic seeds + direction lint); runtime tell-mechanics (shared silhouettes, IDS-outline analog) absent — that is why 🔧 not ✅; e27787c's own gap-row "stays ❌ until the spec is authored" named exactly this runtime leg |
| 32660 | §8.18 `The hand-wave detector` | ❌ | ✅ `54510b1` | ruling 5(d) re-creates the audit AS the manifest-lint — enforceable presence rule shipped, 29/29 tagged, red-proofs; honest scope note: the lint scans the CONTENT manifest, not spec prose |
| 32815 | §9.1 `Co-op NOC (asymmetric information)` | ❌ | 🔧 `8c0ff88` | seat ledger + shared incident timeline contract v0; transport/per-seat projection/shift-handoff UX deferred — honest 🔧 |
| 32836 | §9.1 `Co-op: Ops and Commercial ("Two Departments" / "Two-Person On-Call")` | ❌ | 🔧 `8c0ff88` | same contract base (2–4 seats); the department-partitioned views remain runtime-absent |

### Held / skipped rows — appendix-noted, no marker move

- **No "Emergent storms need a severity cap" heading exists** anywhere in the corpus (D-7 lived only in the decision register) — the cap shipped engine-live @`502ca3f`; recorded in the hosting_game.md appendix instead. Same for **"The Archivist"** — zero matches file-wide.
- **§8.18 PARENT stays 📝**: the brief asserted ❌/🔧, but disk + manifest g23 (:32625, "meta-audit of the spec document itself; no code surface assigned") carry 📝 — the fail-loud law stopped the parent write; the ✅ rides the concrete child row that actually carried the MISSING verdict.
- **`The Hands Dock` (:17615) already 🔧** since the audit sweep `ef74a2f` — the brief's ❌ premise predates the sweep; already at the target state, `179861d` strengthens it (ruled bottom-left placement + data-stamps), no move.
- **`The attention budget` (:14436) stays 🔧**: owner cost map law + host opt-in @`179861d`, mid-run borrow seam @`e1786fc` — what remains: a player-facing verb that spends a hand (owner taste) + TopBar four-id pin.
- **`The readability targets` (:31560) stays ⚠️** by its own session-3 law-note ("figures are now blessed as targets, measurement still owed") — conservative default honored; OD-10/12 numerics (2k/20k) unratified by measurement.
- **"The Co-op" (:2890) untouched** — non-profit hosting-TYPE level, not a multiplayer mode. **"The Incident Timeline Strip" (:23981) untouched** — single-player replay UI, not the OD-17 shared log; no standalone "shared incident timeline" heading exists (the concept is body prose inside Co-op NOC). **CEO rows**: :27024 stays 🔧 (appendix note only per brief). **§0.3 scarcity table rows carry no marker** (email precedent) — data fact: the Object storage row is now bundle-backed @`2fefc60`.

### Closeout battery — marked tree, serial/unloaded (fresh re-run on the FINAL tree, all six green, harness exit 0)

| Gate | Result |
|---|---|
| sim-core serial (`--no-file-parallelism`) | **142 files / 2,347 tests, exit 0** (267.3 s) — zero goldens moved |
| `pnpm -r typecheck` | **5/5 Done** |
| `docs/api-verify.test.mjs` | **PASS — 1,594 names**, import map consistent (scenario 51/51 legible in tail) |
| `scripts/ci-verify.mjs` | **5/5 PASS** (api-verify, content-validate, canary, proto-build, g5-mirror-diff) |
| proto `vitest run` | **87 files / 947, exit 0** |
| headless `vitest run` | **53/53, exit 0** — parity REAL `b0162ab5` / STUB `a9b4b7b8` held |

### Census (recomputed from disk, heading lines only)

| Class | Before | After |
|---|---|---|
| ✅ DONE | 317 | **318** (hand-wave detector) |
| 🔧 PARTIAL | 996 | **1,000** (Eleven Nines + Lookalike + both co-op rows in) |
| ⚠️ PROBLEM | 1 | **1** (unchanged: readability — OD-10/12 measurement owed) |
| ❌ MISSING | 2,245 | **2,240** (five heading lines flipped) |
| 📝 NA | 30 | 30 (parent §8.18 held NA — fail-loud respected) |
| **total marked** | **3,589** | **3,589** |

hosting_game.md 35,568 → **35,572** (two appendix paragraphs inserted above the "Historical record:" footer, which stays last; the five flips themselves are in-place marker swaps). This SUMMARY section is the other and only other file in the closeout commit.

## WAVE-10 closeout — attention/freeze/elasticity missions live, severity dial + invitations demo, four markers moved (2026-10-14b)

### The six commits (stack aba8b79..1b718fb, direct-master, unpushed at closeout start)

| SHA | Role | What landed |
|---|---|---|
| `aba8b79` | H1 race-fix | proto a11yRoster live probe relocated into `__tests__` with carve-in — the audioLaw/substrateLaw file-parallel race class CLOSED at the pin level |
| `2d2cfca` | E2 invitations demo | proto CorpusMissionCard gains the corpus invitations authority — law-join against the sim-core twin (@bc11697 seam consumed host-side) |
| `7d34bed` | E1 severity dial | pipeline corruption-outage severity dial, host-configurable, default = PROVISIONAL 60s (`corruptionOutageSecs` forwarded to host wiring @aa87329-era gap row) |
| `2eeff85` | S1 rungs 6+8 | scenario: The Founder Bus Factor :3880 (`limits.attention` taxed rail), The Change Freeze :3625 (door-band refusal validators), Free Tier Flood corpus twin :3574 — three §1.5 missions, +30 scenario tests |
| `77936e4` | H2 unlocks row | docs: unlocks module inventory row added (closes the c72aa86 observation) |
| `1b718fb` | S2 rung 7 | scenario: price-elasticity rung 7 — The Ransom Customer :3984 (✅) and The Copycat :3429 (🔧 HONEST PARTIAL per wire docblock — 60M slug brute found no five-seed pure band crossing at 34 bps; win arm on offsets 0–2, seeds 907–908 churn under even the deep cut) |

### Reviews

All six lanes reviewed — **every verdict PUSH-GO, zero critical, zero major**. Four findings total; the two docs-minors are fixed in this closeout commit:
- **F1**: `docs/MODULE-STATUS.md` footer cited `pipeline/__tests__/corruption-forwarding.test.ts` — real path is `unattended/__tests__/corruption-forwarding.test.ts` (disk-verified). Corrected.
- **F2**: footer attribution split was `+13 / describes ×6 / +31` — executed truth `+14` (doc +3, pricingRung +4, wave-seven describe +5, win-side loop +2) `/ describes ×5 + loop / +30 @2eeff85`. The 14+30+19 arithmetic re-verifies against the 348→392 scenario-dir re-pin; aggregate `+63 / 392` and total `2,406 / 144` unchanged and correct. The scenario table row (the same stale split) was synced for internal consistency.
The remaining two findings were non-blocking and are not docs wording.

### hosting_game.md marker flips (fail-loud: each asserted heading-text + marker on disk before write)

| Line | Heading | Before | After | Witness |
|---|---|---|---|---|
| 3880 | §1.5 `The Founder Bus Factor` / `Key Person` / `The Bus Factor` / `Two Weeks' Notice` | ❌ | ✅ `2eeff85` | intents + attention rails live on the mission wire (limits.attention taxed rail, door communicate rows) |
| 3625 | §1.5 `The Change Freeze` / `Frozen Change` / `Read-Only Friday` | ❌ | ✅ `2eeff85` | `limits.freeze` validator seam — door-band refusal validators on the wire |
| 3574 | §1.5 `Free Tier Flood` / `Free Tier Abuse` / `Free Tier Invaded` | ✅ `b5017df` | **SKIP — no write** | precondition check found the heading already ✅ (segments twin flipped in the wave-three/b5017df era); the `2eeff85` corpus twin adds coverage under the same ✅ — recorded here instead of double-stamping |
| 3429 | §1.5 `The Copycat` / `The Price War` | ❌ | 🔧 `1b718fb` | PARTIAL per the wire docblock — cliff/retention-clamp 1.0 leg proven, band-crossing witness only on 3/5 standard seeds; honest 🔧, not ✅ |
| 3984 | §1.5 `The Ransom Customer` / `Ransom DDoS` / `Extortion` | ❌ | ✅ `1b718fb` | ransom-as-opex-row mission, paid arm holds the corridor, unpaid flip crosses the 167 Mµ$ ceiling [180,185,184,182,180] ×5, arm-blind bounce control |

Four writes, one precondition-skip; hosting_game.md stays **35,572 lines** (all flips in-place marker swaps, zero line delta).

### Census (recomputed from disk after this closeout, `^##`/`^###` heading lines)

| Class | Count |
|---|---|
| ✅ DONE | **321** |
| 🔧 PARTIAL | **1,001** |
| ⚠️ PROBLEM | **1** (unchanged: readability — OD-10/12 measurement owed) |
| ❌ MISSING | **2,236** |
| 📝 NA | **30** |
| **total marked** | **3,589** |

Delta vs the b69ce76-era census (318/1,000/1/2,240/30): +3 ✅, +1 🔧, −4 ❌ — exactly the four executed flips; the skipped Free Tier Flood row moved nothing.

### Closeout battery — final tree (docs edits in-tree, zero code delta), serial/unloaded, one process at a time

| Gate | Result |
|---|---|
| sim-core serial (`--no-file-parallelism`) | **144 files / 2,406 tests, exit 0** (291.2 s) — zero digest goldens moved |
| proto serial (`--no-file-parallelism`) | **88 files / 968 tests, exit 0** (104.8 s) — NOTE: the closeout brief expected 951; disk truth at `1b718fb` re-verified 968 on a stashed clean HEAD (my docs edits touch zero proto files) — +21 rode the wave stack (a11yRoster relocation carve-in, CorpusMissionCard invitations demo, severity-dial twin pins); green at the true count, no reds |
| `pnpm -r typecheck` | **5/5 Done** |
| `docs/api-verify.test.mjs` | **PASS — 1,594 names** (scenario 51/51), import map consistent |
| `scripts/ci-verify.mjs` | **5/5 PASS** (api-verify, content-validate, canary, proto-build, g5-mirror-diff) |
| headless (`pnpm -F headless-tools test`) | **53/53, exit 0** — parity REAL `b0162ab5` / STUB `a9b4b7b8` literals held |

Box load at battery start ~7.7 (shared 48-core) — all runs serial anyway, no flakes. This closeout touches exactly three files: `docs/MODULE-STATUS.md`, `hosting_game.md`, `reports/audit/SUMMARY.md`. media/prompts never staged.

## WAVE-11 closeout — VoIP card marked, rung-9 ledger, review-minor cures (2026-10-15)

### The two commits (stack fb781ae..e30b75b, direct-master, unpushed at closeout start)

| SHA | Role | What landed |
|---|---|---|
| `fb781ae` | VoIP content card | §1.3 "Trunk Group / The Switchboard" as `official:trunk-group-voip` — the SECOND card on the ADR-0013 #14 tier-extension route, re-founded on **Maintain** (Observe held by dedicated; Shield taken by object-storage @2fefc60). Type bundle + 69-template pack (38 decision / 31 flavour) + rules-free first-quarter slice; first corpus use of `visitor.patienceModel {mode:"binary"}` (§3.2 "no partial credit"); the corpus's only non-null `peakHourLocal: 9`. Content census moves bundles 6→7, waves 6→7, packs 6→7, JSON 26→29, `_todo` 159→186 (pack markers 8→9) |
| `e30b75b` | scenario rung 9 | per-verb intent census — optional `verb` key on the intents predicates reads the new always-present `intents*ByVerb` observation maps off the door's OWN receipt stream (zero dice; absent verb = exact whole-rail total; BAD_ENUM at the wall; vocab stays 29 — a dimension, not a kind). Twin mission `understaffed-sunday-triage` :3657: refused TOTAL identically 1 in both arms — only the per-verb census separates a dropped call from a dropped runbook (win @12, one-tick flip dies @8, witnesses EXACT ×5). scenario dir 392→408, 51 exports zero delta |

### Review

Closeout review verdict **PUSH-GO — 0 critical / 0 major / 1 minor / 1 nit**. Both cured in this closeout commit:
- **Minor** (comment honesty): `scenario/objectives.ts` rung-9 docblock + the `runner.test.ts` sparse-leg comment claimed "the (exact) pre-rung-9 **byte shape** holds" — imprecise: the two census maps are always-present fields, so the observation KEY SET did grow at rung 9. Reworded to "predicate **EVALUATION** shape holds" with the honest note that no digest covers the observation — which is exactly why the rung moved zero goldens. Comment-only; scenario suite re-run 408 green.
- **Nit** (host compat): hosts consuming `runScenario` reports saw the extra observation keys with no compat note. One-line **HOST-COMPAT** note added at the restmazing handoff comment in `apps/proto/src/runner/simCoreRunner.ts` (the money-lane roster block — the single most natural host-facing site; fastForward.ts carries no scenario observation): the observation is an APPEND-ONLY record, read by name, never pin the shape.

### hosting_game.md marker flips (fail-loud: asserted heading-text + current marker on disk before write; no remembered line numbers)

| Line | Heading | Before | After | Witness |
|---|---|---|---|---|
| 1768 | §1.3 `"Trunk Group" / "The Switchboard" — VoIP / SIP trunking` | ❌ | 🔧 `fb781ae` | Eleven Nines precedent (@1907, 🔧 2fefc60): card DATA shipped (bundle + pack + slice), no door mechanic — Maintain stays card identity (tier-extension door-gap row stands) |
| ~606 | §0.3 Scarcity Table Voice/VoIP/SIP row | — | **SKIP — no write** | the row is a table row inside the already-🔧 `## 0.3` heading; §0.3 rows carry NO markers per precedent — honestly skipped |
| 3657 | §1.5 `The Understaffed Sunday` | ✅ `110f516` | **SKIP — no write** | precondition found it already ✅; the rung-9 triage twin rides the same ✅ — appendix note here instead of double-stamping |

One write, two precondition-skips; hosting_game.md stays **35,572 lines** (flip is an in-place marker swap, zero line delta).

### Census (recomputed from disk after this closeout, `^##`/`^###` heading lines)

| Class | Before | After |
|---|---|---|
| ✅ DONE | 321 | **321** |
| 🔧 PARTIAL | 1,001 | **1,002** |
| ⚠️ PROBLEM | 1 | **1** |
| ❌ MISSING | 2,236 | **2,235** |
| 📝 NA | 30 | **30** |
| **total marked** | **3,589** | **3,589** (3,593 heading lines, 4 unmarked table-style rows per precedent) |

Delta = exactly the one executed flip (❌→🔧); the two skips moved nothing.

### Closeout battery — final tree (minor/nit comment edits + docs in-tree), serial/unloaded, one process at a time

| Gate | Result |
|---|---|
| sim-core serial (`--no-file-parallelism`) | **144 files / 2,425 tests, exit 0** (298.7 s) — the lane's 2,422 expectation retired; serial truth is 2,425 — +19 over the 2,406 wave-ten floor (the rung-9 dir view +16 plus 3 per-id loop legs), zero digest goldens moved |
| proto serial (`--no-file-parallelism`) | **88 files / 968 tests, exit 0** (96.3 s) — 968 era count HELD (this closeout's one proto-file edit is the simCoreRunner.ts comment note; zero test delta) |
| `pnpm -r typecheck` | **5/5 Done** |
| `docs/api-verify.test.mjs` | **PASS — 1,594 names** (scenario 51/51), import map consistent |
| `scripts/ci-verify.mjs` | **5/5 PASS** (api-verify, content-validate, canary, proto-build, g5-mirror-diff) |
| headless (`pnpm -F headless-tools test`) | **53/53, exit 0** — parity REAL `b0162ab5` / STUB `a9b4b7b8` literals held |

Targeted pre-check: `npx vitest run src/scenario --no-file-parallelism` **408/408** after the comment cures. This closeout touches six files: `packages/sim-core/src/scenario/objectives.ts`, `packages/sim-core/src/scenario/__tests__/runner.test.ts`, `apps/proto/src/runner/simCoreRunner.ts` (all three comment-only), `docs/MODULE-STATUS.md`, `hosting_game.md`, `reports/audit/SUMMARY.md`. media/prompts never staged.

## WAVE-12 closeout — corpus-mainline adoption (2026-10-15)

### The commit (stack `e30b75b..007a15d` — one commit, direct-master, unpushed at closeout start)

| SHA | Role | What landed |
|---|---|---|
| `007a15d` | proto corpus-mainline | `SimCoreRunner` gains an optional `corpus:{authority, waves}` option that routes the mainline drive through the PUBLIC scenario seam (`resolveCorpusWindows`) — null-gated default-off with byte-identity pinned as a **60-frame per-frame digest twin** vs the uncorpus'd run; the money goldens re-run untouched; the plan surfaces through LOCAL `corpusPlan()`/`corpusTraffic()` accessors, honoring the protocol-v1 **zero-wire-field law** (the wire stays v1 by design); `simCoreRunner.corpus.test.ts` 9 tests (envelope byte-identity vs a direct seam call, empty-surface no-hole exclusion pair vs seeded-surface packing, fully-starved ctor throw). Remaining owed: the worker-loop injection leg (`MODULE-STATUS:190` — protocol adoption of the citation). 4 files +413/−6, zero sim-core delta |

### Review

Closeout review verdict **PUSH-GO — 0 critical / 0 major / 0 minor / 3 nit**. All three accepted-adequate, no fix commits:
- **Nit** (win-arm comment-vs-assertion strength): the win-arm test's comment claims storms "really arrive" while the assertions pin frame-advance/terminal-count — adequate: arrival truth is carried by the envelope byte-identity and exclusion-pair tests beside it.
- **Nit** (seeded-pair `toMatchObject`): the empty/seeded exclusion pair asserts with `toMatchObject` rather than exact equality — adequate: `excluded: []` is the load-bearing key and the surrounding fields ride the seam's own pinned window shape.
- **Nit** (unpinned ctor canary throw): the fully-starved ctor test asserts a throw without pinning the message literal — adequate: fail-loud existence is the contract; the message grammar lives scenario-side where it is pinned.

### Census (unchanged this wave, `^##`/`^###` heading lines)

| Class | Before | After |
|---|---|---|
| ✅ DONE | 321 | **321** |
| 🔧 PARTIAL | 1,002 | **1,002** |
| ⚠️ PROBLEM | 1 | **1** |
| ❌ MISSING | 2,235 | **2,235** |
| 📝 NA | 30 | **30** |
| **total marked** | **3,589** | **3,589** |

Zero `hosting_game.md` flips this wave by design: the corpus seam rides already-✅ scenario headings (the §1.5 corpus-cited missions were marked when the seam landed) and `007a15d` is host adoption only — no new spec ground opens until the worker-loop leg ships.

### Gates (targeted — `007a15d` already review-passed; no full serial re-run this closeout)

| Gate | Result |
|---|---|
| `docs/api-verify.test.mjs` | **PASS — 1,594 names**, import map consistent |
| `scripts/ci-verify.mjs` | **5/5 PASS** (api-verify, content-validate, canary, proto-build, g5-mirror-diff) |
| `pnpm -r typecheck` | **5/5 Done** |

This closeout touches exactly one file: `reports/audit/SUMMARY.md`. media/prompts never staged.

## WAVE-13 closeout — rung-10 familyMix dial cured, ladder rung 10 consumed, battery recorded (2026-10-15)

### The commit (lane `295b095` already on master at closeout start; closeout adds one docs-only commit)

| SHA | Role | What landed |
|---|---|---|
| `295b095` | scenario rung 10 | the composition dial on the wire — `limits.familyMix {weights}` closed row carries the bundle's five-key familyWeights table as INTEGER µ-shares (no floats, canary law) through the waves authority `parseFamilyWeightsTable` REUSED WHOLE (Fixed Q16.16 conversion, sum ±1%, renormalised, zero buckets dropped as authored absences, `BAD_LIMITS` on every refusal). Armed: `createArrivalStep` rolls identity per mint (defaults.ts:286) and the runner counts the family census at the ROLL via a pure pass-through observer on the sanctioned arrival-slot override (defaults.ts:1354) — the one place the rolled family is legible before the same-tick terminal purge (driver.ts:957). Honest v0 at the wall: all five families adversarial — the dial steers WHICH flavor dominates, never benign traffic. 30th wire `free-tier-flood-mix` (:3574 mix twin): win @240 conserving the exact 4,818 mints ×5 with abuse census ≈4,336; the one-field certainty flip is dice-FROZEN — census equals arrivals and crosses the 4,700 ceiling at EXACTLY t236 (census 4,714) on all five offsets; the delete-dial control reverts to organic labels {organic: 4,818} and dies timeout@240 — the composition story is untellable without the dial. Sparse law: the 29 pre-rung wires byte-stand (label twin still 1,672/3,146, pinned). scenario dir 408→418, 51 exports zero delta. 7 files +398/−20 |
| closeout | docs-only review cures | the five findings below, applied across `scenarios.ts`/`doc.ts`/`runner.test.ts`/`scenarios.test.ts`/`MODULE-STATUS.md`/`API-REFERENCE.md` — zero test semantics moved (418/418 re-proved post-cure, no source-scan pin reddened) |

### Review

Closeout review verdict **PUSH-GO — 0 critical / 0 major / 2 minor / 3 nit**. All five applied as doc/comment-line cures:
- **Minor-1** (wrong Binomial sd): the wire docblock + API-REFERENCE row claimed sd ≈ 6.4 for Binomial(4818, 0.9); truth is √(4818·0.9·0.1) ≈ 20.8 — both corrected; the correct sibling "human sd ≈ 15" left standing.
- **Minor-2** (off-by-one title census): "27 mission titles"/"twenty-seven missions" → **26** distinct §1.5 headings at 30 wires (Metastable ×2, Sunday ×2, Free Tier Flood ×3) — fixed in the roster test title, MODULE-STATUS scenario row, and API-REFERENCE `SHIPPED_SCENARIO_WIRES` row.
- **Nit-1**: collapsed `familyMix?: {…};  };` line in the runner.test surgery mirror split one-key-per-line.
- **Nit-2**: per-mint roll cited defaults.ts:284 (the comment above the line); the roll is :286 — both disk sites corrected (:284 survives only in the immutable commit message).
- **Nit-3**: the familyMix wall docblock now states the sub-granularity edge — an authored µ-share <8 µ rounds to Fixed 0 and is silently dropped from the roll by the armed filter; its sliver renormalises into the survivors, bounding census drift under one mint on any shipped wire.

### Markers / appendix

| Line | Heading | State | Disposition | Note |
|---|---|---|---|---|
| 3574 | §1.5 `Free Tier Flood` | ✅ | **SKIP — no write** | precondition found it already ✅ from the rung-3 wire; the rung-10 mix twin rides the same heading — appendix note here instead of double-stamping (the rung-9 triage-twin precedent) |

No `hosting_game.md` writes at all this closeout (the rung-9 precedent's appendix note lived in this SUMMARY; the Matrix-C register row :35533 already credits the familyMix consumers).

### Census (unchanged this wave, `^##`/`^###` heading lines — grep -c verified on the closeout tree)

| Class | Before | After |
|---|---|---|
| ✅ DONE | 321 | **321** |
| 🔧 PARTIAL | 1,002 | **1,002** |
| ⚠️ PROBLEM | 1 | **1** |
| ❌ MISSING | 2,235 | **2,235** |
| 📝 NA | 30 | **30** |
| **total marked** | **3,589** | **3,589** |

rung-10 rides already-✅ scenario headings — no new spec ground; dial is a wire-shape addition to a marked-live library.

### Battery (full, serial, one process at a time, Node 24, box under light sibling media load)

| Gate | Result | Wall |
|---|---|---|
| sim-core `npx vitest run --no-file-parallelism` | **144 files / 2,435 tests passed, exit 0** — zero goldens moved | 167s |
| scenario dir scoped (post-cure re-proof) | **418/418** | 33s |
| `pnpm -r typecheck` | **5/5 Done** | 16s |
| `node docs/api-verify.test.mjs` | **PASS — 1,594 names** (rung-10 added zero export names), import map consistent | <10s |
| `tools/headless` | **53/5** — parity b0162ab5/a9b4b7b8 **HELD** | 6s |
| `node scripts/ci-verify.mjs` | **5/5 PASS** (api-verify, content-validate, canary, proto-build, g5-mirror-diff) | 18s |
| proto suite | **SKIPPED per end-of-program directive** — rung-10 touched zero `apps/` files; build integrity still proven by the ci-verify proto-build gate | — |

Ladder status: **rungs 1–10 CONSUMED**. The vocabulary covers every shipped-seam heading class probed so far; further §1.5 conversions are wire authoring, not engine work.

This closeout touches six files: `packages/sim-core/src/scenario/{scenarios.ts,doc.ts}`, `packages/sim-core/src/scenario/__tests__/{scenarios.test.ts,runner.test.ts}`, `docs/MODULE-STATUS.md`, `docs/API-REFERENCE.md`, plus this `reports/audit/SUMMARY.md`. media/prompts never staged; hosting_game.md markers untouched.


## WAVE-14 closeout — type-8 spec shipped with citation re-grounding, worker-corpus leg recorded, battery re-pinned (2026-10-15)

### The commits (both already on master at closeout start; closeout adds one docs/test-hygiene commit)

| SHA | Role | What landed |
|---|---|---|
| `bfd8e1e` | content type-8 | **The Mayfly Field** ruleset card — 8th hosting type via the Scale tier-extension: first card shipping NO dominant-verb line, claims Scale verbatim-grounded on "scale to zero"; scarce warm-capacity / fatal multi-tenant blast radius; threats reuse 6 registry ids, zero additions; 68-template i18n pack; g1 wave slice at the standard par ladder (storm census UNMOVED at 240) |
| `1165368` | proto worker-corpus | the WORKER LOOP cites the waves corpus — additive-optional `boot.corpus:{tableId,waves}` (PROTOCOL_VERSION stays 1), `shared/corpusHost.ts` the ONE builder both worker hosts share (E2b anti-drift), mirrors over ?raw content for ALL EIGHT shipped slices incl. the real `unlockedByBuildables` invitations law; law-off boot default byte-pinned, 100-frame digest twins frozen (ca8863849cb3db32 / 780b1cbc61dff760) |
| closeout | docs + test hygiene | the two review cures below + ledger — zero machine values moved, zero test semantics moved |

### Review

Closeout review verdict **PUSH-GO — 0 critical / 0 major / 4 minor / 4 nit** (N1: a brief-premise correction noted for the record — the review's fix-list citations were themselves verified against `hosting_game.md` headings before applying, per the never-trust-the-brief-blindly rule). Two cheap cures applied here; m3/m4 filed as hygiene gap rows:
- **m1 fresh mis-citations (content lane, TEXT-ONLY):** the type-8 wave had quoted `## 4.2` tier items as "§4.9", the `## 6.6` economics row as "§6.15", and the `## 3.1` LATENCY-LADDER row as "§3.4" — each re-grounded by reading the actual heading above the quote: tier quotes §4.9→**§4.2** (`### Serverless / Edge Function Tier` @15437), ladder §3.4→**§3.1** (@11434; `## 3.4` is the bounce-reasons prose that merely echoes the ladder), unit-entry §3.1→**§3.3** (`### Serverless — an invocation` @12670), one-object law §2.10→**§4.10** (ONE-OBJECT LAW @18731), economics §6.15→**§6.6** (@23277), CDN p95 §6.6→**§2.12**'s 95th-Percentile Blowout card (@9660 — no p95 exists in §6.6). Applied across `types/serverless.json` (13 sites), `packs/serverless.i18n.json` (24 sites), content `README.md` Type-8 notes (6), this file's Type-8 row; `docs/MODULE-STATUS.md` L264/265 (§3.4 bounce-shape) and L285 (§6.15 ending visuals) VERIFIED LEGIT and left standing. validate.mjs re-PASS exit 0.
- **m2 half-lying test title:** `families.test.ts` "SHIPPED BUNDLES: both g1 type bundles…" looped a hardcoded 2-file list while 8 bundles ship. Now `readdirSync`s `packages/content/types` — every bundle auto-joins the law loop (parse through the shipped `parseFamilyWeightsTable` wall, exact-1,000,000 µ-sum, all five buckets present, no dead family), with an 8-file census pin so a new bundle forces a conscious count edit alongside its free law-check. Count-neutral: still one test, the full serial proves the widened loop green on all 8.
- **m3 filed (gap row):** proto chunk-size strategy — ~526 KB worker / ~226 KB fakeWorker payload / ~1 MB index fine under placeholder art; decide the split before the first real atlas mounts.
- **m4 filed (gap row):** `threatMeta` triple-copy (`chrome/corpusMission.ts` / `shared/corpusHost.ts` / `scenario/__tests__/corpusFixtures.ts`) — dedup candidate needing proto+scenario joint sign-off.

### Markers / appendix

| Line | Heading | State | Disposition | Note |
|---|---|---|---|---|
| 2223 | §1.3 `"Cold Start" / "The Mayfly Field" / "The Popcorn Pan" — Serverless / functions` | ❌ → **🔧 bfd8e1e** | flipped (fail-loud assert ❌ first) | card-identity + data shipped; the Scale door-verb gap and engine consumers of the bundle's knobs keep it off ✅ — the object-storage precedent; `bfd8e1e` stamps the data commit (stack-tip 1165368 carries no serverless content) |

Worker-corpus (`1165368`): **no dedicated spec heading exists to flip** — the boot-wire corpus citation rides already-✅ scenario/runner seams; appendix note here only (rung-9 triage-twin precedent for appendix-only waves).

### Census (`^##`/`^###` marked heading lines, disk recount on the closeout tree)

| Class | Before | After |
|---|---|---|
| ✅ DONE | 321 | **321** |
| 🔧 PARTIAL | 1,002 | **1,003** |
| ⚠️ PROBLEM | 1 | **1** |
| ❌ MISSING | 2,235 | **2,234** |
| 📝 NA | 30 | **30** |
| **total marked** | **3,589** | **3,589** |

Exactly one ❌→🔧 move this wave (the Mayfly card); recount on disk wins and matches.

### Battery (full, serial, one process at a time, Node 24)

| Gate | Result | Wall |
|---|---|---|
| sim-core `npx vitest run --no-file-parallelism` | **144 files / 2,438 tests passed, exit 0** — +3 vs the wave-13 pin are `bfd8e1e`'s disk-loop auto-joins (storm-cap per-slice +1, real-content per-bundle +2), ZERO digest goldens moved; m2's widened loop count-neutral | 168s |
| `pnpm -r typecheck` | **5/5 Done** | — |
| `node docs/api-verify.test.mjs` | **PASS — 1,594 names**, import map consistent | <10s |
| `node scripts/ci-verify.mjs` | **5/5 PASS** (api-verify, content-validate, canary, proto-build, g5-mirror-diff) | ~45s |
| `tools/headless` | **53/5** — parity b0162ab5/a9b4b7b8 **HELD** | 6s |
| proto `npx vitest run --no-file-parallelism` | **90 files / 990 tests passed** (matches the pinned ledger — quick re-run to be safe) | 50s |
| `node packages/content/script/validate.mjs` | **exit 0** (bundles=8 waves=8 packs=8; 212 inventory + 10 pack markers) | <5s |

Loader+waves (the m1 blast radius, 332-file pin from `bfd8e1e`'s own gate record) rode green inside the full serial — no file in either dir moved count-wise by the citation cures (text-only JSON strings).

### Ledger

`docs/MODULE-STATUS.md`: footer re-pinned 2,435→**2,438**/144 with the auto-join attribution; Type-8 row carries the citation re-grounding echo; worker-loop gap row stamped **@1165368**; m3/m4 added as two new gap rows.

This closeout touches seven files: `packages/content/types/serverless.json`, `packages/content/packs/serverless.i18n.json`, `packages/content/README.md`, `packages/sim-core/src/waves/__tests__/families.test.ts`, `docs/MODULE-STATUS.md`, `hosting_game.md`, plus this `reports/audit/SUMMARY.md`. media/prompts never staged.

## WAVE-15 closeout — type-9 marked, flavour mouth + co-op room recorded, wire join green, battery re-pinned (2026-10-16)

### The commits (four already on master at closeout start; closeout adds one docs commit)

| SHA | Role | What landed |
|---|---|---|
| `d4e7863` | content type-9 | **The Microsecond Cathedral** ruleset card — 9th OD-14(a) hosting type via the SELL tier-extension: card ships NO dominant-verb line (second such case), Sell grounded twice in-card ("microseconds are what you sell" / "you sell *equal* latency") + the Colo verb-shift row; §0.3 scarcity row EXISTS (unequal latency between tenants) so the Three-Change table survives; firsts — µs `simTimeScale`, resident patience mode, escalator-TRUE terms, all-or-nothing party at null win-threshold; threats reuse 8 registry ids, both lookalike seeds re-worn, ZERO registry edits; 68-template pack (37/31), RULES-FREE wave slice at par 25/60/30/75/100 (census maxAuthored UNMOVED 240); hooks 5/9 vs anchor (R23 shed ladder rides deliberately). VERB-ROSTER WALL: all four tier slots claimed, Diagnose unclaimed — tenth card is an OWNER law call. 9 files +798/−17 |
| `73cccc4` | proto flavour | Front-of-House **flavour feed** — g24's mouth: deterministic per-(seed,tick) line via kernel `streamFor(seed,"chrome/flavour-feed",tick)` + adjacent-DISTINCT re-draw law; pool = ZERO-SLOT flavour templates of the two packStore-registered packs (60 entries, 54 distinct keys; cross-pack twins coexist keyed (packId,key)); era-aware through `t(...,eraYear)`; forum chip honestly DISABLED at 0 lines; HudLabPanel card; zero timers. 6 files +758 |
| `10f05fb` | proto co-op | **Incident Room** — co-op seat ledger + shared timeline laws made playable in ONE tab: `validateCoopSeatLedger` / `guardCoopAttributionBatch`→`commitCoopAttribution` (ruling-2 scars/museum-only wall) / (tick,seq) append order + interleaving-invariant `digestCoopTimeline`; transport leg owed (ADR-0013 ruling 8). 6 files +1,154 |
| `95fc86e` | proto wire join | exchange-colo joined the corpus wire enum (`protocol.ts` + `corpusHost.ts` mirror) — the `simWorker.corpus.test.ts` drift pin (9 slices on disk vs 8-entry table) flipped GREEN unaided; count-neutral; worker/fakeWorker chunks each +~48 KB |
| closeout | docs | the n1 cure below + ledgers — zero machine values moved, zero test semantics moved |

### Review

Both reviews returned **PUSH-GO**. `d4e7863`: **0 critical / 0 major / 0 minor / 2 nit** — one raised point (the widened count-neutral pins) re-verified here as genuinely count-neutral: the per-file law loops auto-join by disk census, and a detached-`91c45b5` worktree A/B measures the whole delta at loader+waves 332→335 / full serial 2,438→2,441 with files UNMOVED (storm-cap per-slice `it` +1, real-content per-bundle loops +2 — the type-8 pattern verbatim); no cure. Proto-stack (`73cccc4`+`10f05fb`+`95fc86e`): **0C / 0M / 0m / 1 nit** —
- **n1 cured (comment-only):** `chrome/flavourFeed.ts` pool-law docblock cited `abuse.canon.upstream` inside the "distinct pool entries … never deduped" example, but that twin is EXCLUDED from the pool — it is slot-bearing in BOTH packs (verified by reading both JSONs: `{upstreamDomain}`/`{prefix}`), so the slot law never lets it in (its text also diverges per pack, which is exactly why the law matters). The sentence now names genuine in-pool twins (`vendor.reply.firmware` / `loading.tip.failover`, byte-ident both packs — verified) and states the upstream twin's true status: excluded BY the slot law, the divergence the law quietly de-risks. The pool test already asserted `POOL.some(e => e.key === "abuse.canon.upstream") === false` — the docblock was the lie, the code never was.

### Markers / appendix

| Line | Heading | State | Disposition | Note |
|---|---|---|---|---|
| 2361 | §1.3 `"Exchange Colo" / "The Microsecond Cathedral" / "The Meter Stick" — Financial low-latency colocation` | ❌ → **🔧 d4e7863** | flipped (fail-loud assert ❌ on disk first) | card-identity + data shipped; the Sell door-verb gap and engine consumers of the bundle's knobs keep it off ✅ — the serverless/object-storage precedent; `d4e7863` stamps the data commit |

Skips and appendix notes:
- **§0.3 scarcity row**: table rows carry no markers — SKIPPED per the Trunk Group/serverless precedent.
- **Flavour feed (`73cccc4`): NO heading flipped — appendix note.** The §9.3 sweep looked for a heading whose claim a zero-slot deterministic ticker actually SATISFIES. The three loud candidates stay ❌ for honest reasons: `### The Trade Radio` requires an ambient AUDIO channel reporting world events before mechanical consequence; `### Outage Bingo` requires the 5×5 grid minigame + cosmetic line-fill; `### Server naming and the label maker` requires the name generator + MTTR/morale mechanics + label-tape rendering. The feed's real consumers (ticket generator, vendor comedy channel, loading tips, staff chatter, press, forum threads, sticky notes, intern's log) are ALREADY 🔧 from pack authorship (`08d4fe2`/`354261d` era) — the mouth widens them below the marker, not past it; partial-pool status is ledgered in three new MODULE-STATUS gap rows instead (pool scope 2/11 + zero-slot law, forum-chip honest disable).
- **Co-op room (`10f05fb`): NO marker moved — appendix note.** The multiplayer rows are already 🔧 since `8c0ff88` (e.g. `### Co-op NOC (asymmetric information)` 🔧 8c0ff88 — left standing per brief); the room is the DEMO leg of that shipped contract, and timeline-side-only-v0 + transport-owed is a new gap row. (Name-collision checked: `### "The Co-op" — Non-profit / member-owned hosting` ❌ is the unshipped TYPE-4 ruleset CARD, not multiplayer — untouched.)

### Census (`^#` marked heading lines, disk recount on the closeout tree)

| Class | Before | After |
|---|---|---|
| ✅ DONE | 321 | **321** |
| 🔧 PARTIAL | 1,003 | **1,004** |
| ⚠️ PROBLEM | 1 | **1** |
| ❌ MISSING | 2,234 | **2,233** |
| 📝 NA | 30 | **30** |
| **total marked** | **3,589** | **3,589** |

Exactly one ❌→🔧 move this wave (the Cathedral card); recount on disk wins and matches.

### Battery (full, serial, one process at a time, unloaded box, Node 24)

| Gate | Result | Wall |
|---|---|---|
| sim-core `npx vitest run --no-file-parallelism` | **144 files / 2,441 tests passed, exit 0** — +3 vs the wave-14 pin are `d4e7863`'s disk-loop auto-joins (worktree A/B: loader+waves 332→335, files UNMOVED), ZERO digest goldens moved | 168.6s |
| proto `npx vitest run --no-file-parallelism` | **94 files / 1,029 tests passed** — ALL GREEN on the post-n1 tree (matches the review's truth; n1 docblock shifts nothing — minified chunks byte-stable at the recorded sizes) | 53.5s |
| `pnpm -r typecheck` | **5/5 Done** | — |
| `node docs/api-verify.test.mjs` | **PASS — 1,594 names**, import map consistent (the stack ships zero new export names) | <10s |
| `node scripts/ci-verify.mjs` | **5/5 PASS** (api-verify, content-validate, canary, proto-build, g5-mirror-diff) — fresh build: worker 574.30 kB / fakeWorker 274.10 kB / index 1,027.50 kB, re-read into the m3 row | ~45s |
| `tools/headless` | **53/5** — parity b0162ab5/a9b4b7b8 **HELD** | 9.5s |
| `node packages/content/script/validate.mjs` | **exit 0** — nine bundles/waves/packs, 245 inventory + 11 pack markers | <5s |

### Ledger

`docs/MODULE-STATUS.md`: proto row 977→**1,029**/94 with the full chain note (→990 @1165368 →1,008 @73cccc4 →1,029 @10f05fb; 95fc86e count-neutral drift-pin closure) + GREEN narrative for both new panels; footer re-pinned 2,438→**2,441**/144 with the worktree-measured attribution; m3 row sizes re-read honestly (fakeWorker 226→274 added — the brief only named the worker half, the line is a size ledger); THREE new gap rows (flavour pool scope packs-2/11 + zero-slot law, co-op room timeline-side-only v0, forum chip 0-lines honest disable); type-9 content row stamped **@d4e7863**.

This closeout touches four files: `apps/proto/src/chrome/flavourFeed.ts` (comment-only), `hosting_game.md`, `docs/MODULE-STATUS.md`, plus this `reports/audit/SUMMARY.md`. media/prompts never staged.

## WAVE-16 closeout — m4 threatMeta fold + freeze micro-fold: the last drivable item (2026-10-16b)

**Context.** The audit's drivable-now list named one residual engineering item: m4 threatMeta triple-copy dedup. The lane folded it to a single authority @216106e; review verdict PUSH-GO — 0 Critical / 0 Major / 0 minor / 1 info (confidence 97%). The info item (authority records were unfrozen shared objects) is executed here as a separate micro-fold with attempt-once/cheap-exit protocol.

### The fold (216106e)

| Leg | Detail |
|---|---|
| 4→1 authority | `buildThreatMetaLookup(registry, where)` in `waves/foreign.ts` is now THE registry→threatMeta law. Folded copies: `chrome/corpusMission.ts`, `shared/corpusHost.ts` (cross-table closure memo KEPT at host), `scenario/__tests__/corpusFixtures.ts`, `runner/waveRules.ts` (non-array census pre-guard KEPT explicitly at the call site — the divergent edge stays named) |
| Placement rationale | Exactly the home the gap row predicted — `ForeignThreatMeta` + the fail-loud throw family already live in `waves/foreign.ts`; hosts already value-import `@hh/sim-core/waves`, so no cross-package mirror remains and no drift-pin was needed (the sim-core fixture consumes the barrel directly — legal under the import-direction law) |
| Byte-verbatim throw law | The `where` label carries each host's module name so every historical throw string stands verbatim — zero witnesses moved. Authority unit-tested in `foreign.test.ts` (+5, incl. a shipped-registry agreement pin vs the loose reader) |
| NOT folded | Loose full-record gate/lab readers (`g6Data.threatIndex`, gate-g2/g6 fixtures) — different contract (band included, no per-record fail-loud), named in the authority docblock |

### Freeze micro-fold (de6f401) — LANDED

`Object.freeze({family, denomination})` per record at map-build time + one-line rationale. Targeted proofs on the fold: sim-core waves serial **14f/212 GREEN** and proto corpus trio (`simWorker.corpus`/`corpusMission`/`simCoreRunner.corpus`) **3f/47 GREEN** — no witness objected (the fold added zero `isFrozen` pins; all consumers copy values out).

### Battery

| Gate | Result |
|---|---|
| sim-core full serial | **144 files / 2,446 tests, exit 0, ZERO goldens** — discharged by the review lane on the 216106e tree; the lane's 2,441+5 prediction hit exactly |
| waves targeted + proto corpus trio (closeout, post-freeze) | **14f/212** + **3f/47** GREEN — the freeze touched nothing witnessed |
| proto full | **94 files / 1,029 UNMOVED** (review truth; freeze is sim-core-side) |
| `node docs/api-verify.test.mjs` | **PASS — 1,595 names** (+1 `buildThreatMetaLookup` vs the wave-15 1,594 pin) |
| `node scripts/ci-verify.mjs` | **5/5 PASS** |
| `pnpm -r typecheck` | **5/5 Done** |

### Census — UNCHANGED, zero flips — stated loudly

✅321 · 🔧1,004 · ⚠️1 · ❌2,233 · 📝30 = 3,589. **WAVE-16 moves NO marker.** The dedup is pure code hygiene: it ships no spec surface, satisfies no heading, and touches `hosting_game.md` not at all. `hosting_game.md` on disk is byte-identical to the wave-15 closeout.

### Ledger

`docs/MODULE-STATUS.md`: waves row carries the 195→212 re-pin (m4 +5 tests, +12 absorbed sibling row-lag); m4 CLOSED gap row @261 SHA-stamped (@216106e fold + @de6f401 freeze, stamp @2446f08). `docs/API-REFERENCE.md` waves table carries the authority row (lane @216106e). This closeout stages three files total: `packages/sim-core/src/waves/foreign.ts` (freeze), `docs/MODULE-STATUS.md` (stamp), this `reports/audit/SUMMARY.md`. media/prompts never staged.

### Program status

**All non-owner-gated work from the 2026-10-09 audit is landed.** Residual menu = OWNER QUEUE in memory/DECISIONS-PENDING: OD-10/OD-12 numerics, the tenth-type verb-law call (verb roster exhausted — Diagnose sole unclaimed invariant, zero §1.3 card names it), the ratify-on-playtest PROVISIONAL const set (death/elasticity/recovery/attention/oversell/familyWeights), co-op transport (PHP Workerman, out-of-repo), PackId widening.

## WAVE-17 closeout — ADR-0014 implementation wave D1–D9: full landing, docs collected, stack pushed (2026-10-16c)

**Context.** The owner's session-4 rulings (ADR-0014 #D1–#D9, `docs/adr/0014*`) were recorded at @7d77ebf; the wave-16 owner queue dissolved into a full implementation stack of fourteen commits plus two review riders. Joint review verdict on 4bcf910..tip: **zero Critical, one Major + one minor — both fixed in riders** (@24426ec: relay broadcast must fan out to CURRENT seats only, departed inboxes freeze at vacate; @7fdb143: eraState header count nine→ten-registered). This closeout collects every owed doc row, moves the markers, runs the full battery once, and pushes the unpushed stack.

### The stack — per-leg one-liners

| Commit | Leg |
|---|---|
| `7d77ebf` | ADR-0014 recorded — owner session-4 rulings D1–D9 as written law |
| `de5cec7` | #D4 ratification sweep — PROVISIONAL labels retired on the NAMED sets only (economy 23 + pricing defaults + death 1 + elasticity 2 + recovery 7 + waveRules 2 + runner 1 + mail familyWeights reword); values byte-ident; unnamed ~40 pile untouched |
| `fb18c05` | #D1 roster amendment — `negotiate` + `schedule` join `TIER_EXTENDED_VERBS` (six members; Diagnose blessable; re-claim/MERGE forbidden) |
| `d3b1db3` | #D2 Shield leg — `shield-node` is the 9th `PlayerVerb` (commit-class, 1 hand/1 tick); optional `GameState.shield` pre-arm book; step-9 patience fold vetoes the exhaustion die via `nodeShielded`; +2 door suites; digest sparse-embed, byte-ident absent |
| `4bcf910` | Shield follow-up — root-barrel TS2308 rename to `shieldBusinessMinuteOf` + 6 API-REFERENCE rows |
| `d24071b` | #D5 pack widening — packStore registers all nine then-shipped packs; flavour pool 60→187/153; era trio strict-unchanged; proto +3 |
| `921ca7b` | #D7 boot.build rider — additive `boot.build?:{hands?,board?}`, PROTOCOL_VERSION stays 1; SHAPE walls at the codec, MEANING walls fault the boot; default riders are 100-frame digest twins of the frozen hexes; proto +19/+1 |
| `65ac92f` | #D9 metricNamespaceTier — optional schema field + boundary parse (band-ladder enum, drift-pinned); NO lint leg (zero membership data); type kept module-private off-barrel |
| `1660fd2` | #D8 endless — 32 rows LIVE under **ledger-four** (append records/medals/streaksShared/codex, deny 28); 192/0 census; writeGuard throw kept unreachable-by-construction; campaign-mirror posture RETIRED; mode-tiering stays deferred OD-16(a) |
| `9bb86f4` | #D1 follow-through — type-10 `official:colo` "Amps and Aisles" founded on **Negotiate** (first blessed-roster-verb card): bundle + rules-free slice + 68-template pack + first colo CAC; hooks 5/9 vs anchor; serial +3; 278/12 census |
| `286b406` | colo wire-join rider — exchange-colo-style enum + corpusHost CORPUS_TABLES; drift pin flipped green unaided |
| `5faeb28` | packStore registers colo — tenth bank speaks; pool re-roll 187/153→204/166 (#D5 cost accepted), roster 10, twins byte-ident |
| `9a3d508` | #D6 relay SPIKE — `tools/relay` (22 tests): hub stamps per-seat inboxes through the coopTimeline (tick,seq) law + save/coop ledger; TWO-RUNNERS-ONE-DIGEST seed 904n ×100 with hostile-permutation normalization and a heterogeneous-occupancy falsifier. SPIKE ≠ adoption |
| `24426ec` | review MAJOR — departed-seat inboxes freeze at vacate (broadcast current-seats-only) + serial script + O(n²) handoff note |
| `7fdb143` | review minor — eraState header count nine→ten |

### Battery (ONE authoritative run at this tree, this closeout)

| Gate | Result |
|---|---|
| sim-core full serial | **147 files / 2,487 tests, exit 0, ZERO goldens moved** |
| proto full serial | **95 files / 1,051 passed** |
| tools/relay | **22/22** |
| headless | **53/5 — parity real `b0162ab5` / stub `a9b4b7b8` HELD** |
| api-verify | **PASS — 1,601 names, ZERO delta** (MetricNamespaceTier deliberately off-barrel) |
| ci-verify | **5/5 PASS** |
| content validate | **exit 0 — 10 bundles / 278 `_todo` / 12 pack** |
| `pnpm -r typecheck` | **6/6 Done** (relay joins the workspace count) |
| canary | **PASS — 133 files** |
| proto build | OK — worker **632.70 kB** / fakeWorker **329.02 kB** / index **1,226.55 kB** (the ten-pack ?raw bank rides both worker arms — m3 row updated) |

### Census — ONE marker moved

✅321 · 🔧1,005 · ⚠️1 · ❌2,232 · 📝30 = 3,589 (heading-level recount, method-pinned). The move: §1.3 Colocation landlord ❌→🔧 `9bb86f4` (card ships as data; Negotiate door-mechanic gap holds it partial — law note added under the heading). Deliberate holds: "The readability targets" STAYS ⚠️ per #D3's own letter (relative law is standing law, but the measured `tools/perf` grid baseline has not run); §0.3 Colocation row carries no marker (table-row precedent) — data fact recorded in the tail note; "Endless / Survival" keeps 🔧, its #D8 ruling note amended QUEUED→LANDED. Tail WAVE-17 re-markup note appended.

### Ledger (this closeout collected)

`docs/DECISIONS-PENDING.md`: OD-4b→LANDED (#D9), OD-8→LANDED + posture ledger (#D8), verb-exhaustion row→#D1 amendment + type-10. `docs/MODULE-STATUS.md`: content + loader-`_todo` rows re-cut (10 bundles/38 JSON/278/12/307), save row 192/0 + endless closure, D7 row SHA-stamped @921ca7b, NEW #D9 loader row, verb-wall row LANDED (Schedule + Diagnose remain unclaimed), door row Shield BUILT, flavour row widening LANDED, co-op/relay row SPIKE CLOSED (transport row stays OPEN — not flipped), proto row chain →1,051/95, m3 sizes re-read, footer re-pinned 2,487/147 (wave-16's 2,446 drift noted honestly). `docs/API-REFERENCE.md`: `TIER_EXTENDED_VERBS` row six members + #D1 provenance, loader prose NOTE for metricNamespaceTier (private-by-decision). `hosting_game.md`: the flip + law note, endless note amendment, tail re-markup. This closeout stages five files total (the four docs + `hosting_game.md` + this SUMMARY). media/prompts never staged.

### Owner asks (fresh/standing after this wave)

1. **Endless campaign-mirror re-raise?** The full-carry option rode the pending rows as data; #D8 ruled ledger-four and the mirror is RETIRED — re-raising needs a fresh ruling.
2. **Eleventh card law call**: Schedule (blessed, unclaimed — backup/GPU/HPC/satellite family) vs a Diagnose bless card — which, or neither yet?
3. **MetricNamespaceTier export**: kept PRIVATE (off-barrel, api-verify blind) — flip when a consumer names it.
4. **Relay transport frictions left open by the spike** (pinned in `tools/relay/README.md` + tests): same-tick joins impossible, re-join has no ledger rep (one-tenure-row v0), mid-run joiners get no history, MIN_WRITERS counts departed rows — the PHP/Workerman transport lane owes rulings; the :216 transport gap row stays OPEN.
5. **Readability measurement**: running the `tools/perf` grid baseline on the ratified hardware target is the last gate on the program's sole ⚠️.

### Program status

**ADR-0014 D1–D9: FULLY LANDED** (D6 as authorized spike; D9 lint-leg honestly awaits membership data). The unpushed stack rides this push; after it, master == origin.


## WAVE-18 measurement lane — readability targets: measured tools/perf grid baseline lands; the program's sole ⚠️ moves to 🔧 (2026-10-16d)

**Context.** ADR-0014 #D3's final clause made the relative readability law standing but deferred the marker until "a measured `tools/perf` grid baseline … is appended when run". Lane R-18 runs it. Zero code shipped: the existing grid answered every question (no harness additions — the brief's optional-one-script hatch stayed holstered).

### Measurement (hardware target = ratified dev-box floor: 64-core Linux, 257 GB, Node v24.21.0, sim-core @`49a4620`)

Full grid 7 sizes (2/10/50/200/500/1000/2000) × 3 rates (6/50/200 per min) × 2 arms, best-of-3, auto-ticks — **no tick trims**; max sample spread across all 42 cells 14.4 % (under the 15 % re-run law — zero re-runs). Load: shell 11.69 at start; grid meta.loadAvg1 **10.77**; headline deep-look **4.57**; storm bisection **3.84**.

| Cell (best/median t/s) | advance | digest | digest:advance |
|---|---|---|---|
| n2@6 | 8,314 / 7,996 | 4,678 / 4,639 | 1.8× |
| n200@6 | 2,709 / 2,691 | 840 / 839 | 3.2× |
| n200@200 | 255 / 253 | 202 / 201 | 1.3× |
| n1,000@200 | 200 / 199 | 110 / 108 | 1.8× |
| **n2,000@6** | 356 / 356 | **100 / 99** | 3.6× |
| n2,000@50 | 286 / 285 | 90 / 89 | 3.2× |
| **n2,000@200** | 150 / 149 | **70 / 68** (best-of-5 deep-look [65,69,67,68,70]) | 2.1× |

Storm bisection at n2,000 (digest): @100 → 83 · @400 → 54 · **@1,024 (the shipped D-7 STORM_CAP ceiling) → 27 t/s**. The n2,000@200 terminal digest `7cd5e135a8d438681fb1217e3190bfdd` reproduced byte-equal across two independent runs — determinism holds under the meter.

**Verdicts written to the §8.9 law-note.** (1) *2,000 discrete objects:* REACHED — `nodesLast = 2,000` on every big cell, `maxDuplicates = 0` everywhere (FIX-8 ghost law at 10× the audit grid). (2) *Frame budget:* at a 10 Hz host, n2,000@200 digest keeps 7.0× real-time headroom at 1× and **3.5× at the ratified 2× max-legible speed**; 2.7×/1.35× at the 1,024 storm cap. (3) *20,000 in-flight entities:* **UNREACHABLE on shipped plateau boards — stated with numbers:** the roster census plateaus at **192 live units with terminal queue 0 at every rate ≥100/min** (service+patience laws prune faster than plateaus mint; the 64-slot × 20 s origin path caps throughput ≈192/min — beyond it, rate multiplies bounces, not backlog). The measurement itself is the evidence #D3's relative law was written for; absolutes stand as the demoted aspiration note. (4) *Honesty split:* engine MEASURED at the densities; 1080p pixel legibility / 60s-unread / "40 entities per glyph" remain STRUCTURAL-or-unenforced — no 40/glyph constant exists (aggregation = budget "+N" refusal clusters + Z3 `LOD2-aggregates` tier); `LABEL_CAP_BY_ALTITUDE.Z3 = 30` verified on disk — **spec and code AGREE** (no divergence to report). Law suites (hueLaw/contrast/motion/a11yRoster) are audits, not measurements.

### Ledger (this lane)

`hosting_game.md`: dated law-note under "The readability targets" + heading **⚠️→🔧** (the program's LAST ⚠️ discharged); line-55 status block reworded (no ⚠️ headings remain, census ✅321 🔧1,006 ⚠️0 ❌2,232 📝30 = 3,589 — disk recount, method-pinned); appendix row 31543 ⚠️→🔧; tail WAVE-18 re-markup note (SHA stamp rides the follow-up one-liner per precedent; section-label correction: the region is **§8.9 Readability at scale**, the WAVE-9/17 tails' "§8.18" was a mislabel — in-file §8.18 is the visual-coverage audit). `docs/DECISIONS-PENDING.md`: OD-10 + OD-12 rows carry dated **measurement RUN** amendments (numerics stay unratified). `docs/MODULE-STATUS.md`: perf row gained the baseline-run clause (zero harness changes). Raw reports: `/tmp/opencode/grid-w18{,-headline,-twin,-storm}.json` (transient run artifacts).

### Gates (targeted — full battery belongs to closeout)

- proto full serial (--no-file-parallelism): **95 files / 1,051 tests PASS** — a11yRoster parses §8.16 by TEXT and rode green; zero pin moves.
- sim-core targeted serial (`scenarios` + `gate-g1` + `gate-g3` + `corruption`): **PASS** — all line-cites in code are ≤28,660 (< the 31,566 insertion point), no drift casualty possible; scenarios.test.ts ±12-line specRef windows verified against §1.5 lines (max 4,086).
- `node scripts/ci-verify.mjs`: **5/5 PASS** (zero export names moved).
- `pnpm -F perf-tools test`: **20 passed** (grid.ts/board.ts untouched).
- Heading-marker disk recount: ✅321 🔧1,006 ⚠️0 ❌2,232 📝30 = 3,589 — matches the line-55 census.

### Owner state after this wave

**OD-10/OD-12 numerics REMAIN UNRATIFIED** — this lane discharged the measurement clause only. The ⚠️→🔧 flip says "measured, partial": what is left inside the row is the ratified-hardware *playtest* leg (2× max-legible stands until G1 data) and any pixel-legibility harness (deferred-until-atlases @pixi/node arm, ADR-0008). No fresh rulings asked; the standing queue (endless mirror re-raise, eleventh-card law call, MetricNamespaceTier export, relay transport rulings) is unchanged from wave-17.
