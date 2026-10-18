# AUDIT SUMMARY — heading status roll-up (markup applied 2026-10-09, re-markup post-fix-wave 2026-10-09, session-2 rulings re-markup 2026-10-09b, wave-3 batch-1 closeout 2026-10-10, wave-3 batch-2 closeout 2026-10-10b, wave-5 closeout re-markup 2026-10-13, wave-6 closeout re-markup 2026-10-13b, wave-7 closeout re-markup 2026-10-13c, wave-25 closeout re-markup 2026-10-18)

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

> *Superseded per-wave — current disk truth (wave-18): ✅321 · 🔧1,006 · ⚠️0 · ❌2,232 · 📝30 = 3,589; see the per-wave re-markup notes in hosting_game.md's tail and hosting_game.md:55.*

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
| **n2,000@6** | 356 / 356 | **98 / 97** | 3.6× |
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

### Census — ONE marker moved

✅321 · 🔧1,006 · ⚠️0 · ❌2,232 · 📝30 = 3,589 (heading-level recount, method-pinned — matches the line-55 census; the program's LAST ⚠️ discharged, zero ⚠️ headings remain on disk). The move: §8.9 "The readability targets" ⚠️→🔧 `ceb9332` (ADR-0014 #D3 measurement clause). Holds — zero other moves: OD-10/OD-12 numerics stay UNRATIFIED (the flip is measurement, not ratification); pixel-legibility / 60s-unread / "40 entities per glyph" clauses stay structural law-suite audits, not measurements. Tail WAVE-18 re-markup note appended (stamp `8223117`).

### Owner state after this wave

**OD-10/OD-12 numerics REMAIN UNRATIFIED** — this lane discharged the measurement clause only. The ⚠️→🔧 flip says "measured, partial": what is left inside the row is the ratified-hardware *playtest* leg (2× max-legible stands until G1 data) and any pixel-legibility harness (deferred-until-atlases @pixi/node arm, ADR-0008). No fresh rulings asked; the standing queue (endless mirror re-raise, eleventh-card law call, MetricNamespaceTier export, relay transport rulings) is unchanged from wave-17.

### Program status

**ADR-0014 D1–D9 landed and, with this wave, measured** — the audit→completion program carries zero ⚠️ headings. Remaining drives are owner-gated (eleventh-card law call, tier-verb door mechanics for Negotiate/Schedule, OD-10/OD-12 playtest numerics) or BLOCKED-BY-PLAN (types 11+, campaign/perspective content, era expansion). Full battery belongs to the wave-18 closeout.

## WAVE-19 closeout — session-5 rulings land: endless full-carry re-raise, relay frictions become in-repo law, the 11th card on Schedule (2026-10-16e)

**Context.** Session-5's owner agenda met the standing queue wave-17 left open. Six rulings, all executed as ADR-0014 amendments: (a) the endless save posture re-raise the #D8 landing demanded was GRANTED — full-carry campaign mirror; (b) the eleventh-card law call was ANSWERED — the Schedule card ships; (c) NO tier-verb door mechanics authorized — card-identity-only stands; (d) `MetricNamespaceTier` KEPT PRIVATE; (e) the ADR-0014 #D6 relay spike's four law frictions resolved IN-REPO per delegation — transport stays open; (f) OD-7/OD-9/OD-15 + the OD-11 mirror detail CONFIRMED CLOSED per ADR-0013. Joint review verdict on the stack: PROCEED, zero critical / zero major (one stale-comment MINOR + 3 nits rode the witness commit).

### Ledger (by lane)

- **L-E @`c9e34c7`** — endless re-raised to **campaign-mirror FULL-CARRY**: `save/modes.ts` gains `CAMPAIGN_MIRROR_MODES = [endless]` + `campaignMirrorRow()` whose kind is DERIVED from `campaignRow` (20 append / 12 instance / 0 deny — zero hand-authored rows, no drift seam); endless leaves the Matrix-B cohort; all @1660fd2 machinery stands (writeGuard throw-on-pending unreachable-by-construction, `pendingOd8Rows()`→`[]`, guardBatch atomicity, buildMatrix fail-loud); matrix census 192 LIVE / 0 pending UNCHANGED; deny census 140→112 (four shadow modes only); flip-back probe reddens exactly 4 witnesses — falsifiable re-pins. §2.5 "the Long Save continuing in place" rides as LAW not data; the ledger-four interim is preserved as the record of what governed ~1 day. Endless LOOP/tier scoping stays DEFERRED per OD-16(a).
- **L-RH @`500c134`+@`6d0bc1e`** — ADR-0014 #D6 spike frictions hardened into law per agenda item (e): (1) same-tick joins legal, ledger canonically ordered `(joinedAtTick asc, participantId code-unit)` — hosts applying the same joins in any order converge byte-equal; (2) re-join = NEW TENURE ROW (disjoint chronological half-open tenures; `participantSeatedAt` resolves per tenure; gap = ghost author; open tenure refuses a second row); (3) joiner catch-up relay-side, ZERO save writes, dup-never-twice through `orderCoopTimeline` (a first joiner gets the log as-of join; a re-joiner only the tail past their frozen inbox); (4) MIN_WRITERS RATIFIED as recorded-writers history law (distinct participants ever seated, not live seats). @`24426ec` current-seats-only broadcast stands. Relay tests 22→27 (refusal pins → positive law pins); save dir 147→158. **L-W @`16e3137`** re-cut the two proto coopRoom witnesses + stale docblock (comment-only) to the hardened laws. Transport (PHP/Workerman) + wire mechanics (seq policy, payload opacity until the door, O(n²) append self-check, paged catch-up) remain OPEN out-of-repo.
- **L-T11 @`6c0e074`** — 11th OD-14(a) type `official:backup-archival`: §1.3 "Restore Point" / "The Vault" / "Bit Rot", dominant verb **Schedule VERBATIM** — first Schedule-founded card; the #D1 blessing pair (Negotiate+Schedule) FULLY SPENT. Hooks 5/9 vs anchor (R15 restore-test-freshness triplet, R16 restore-SLA-tier slider, R17 three dials, R18 simTimeScale HOURS — first corpus use of the `window` patience vocab, with the years-vs-ms honest tension authored into `_todo`, R22 ten mechanics); rides R19/R20/R21/R23 with the R21 HONEST INVERSION (keyhole/unclickable FALSE/FALSE vs colo's TRUE/TRUE — the wall is proof-cost). familyWeights entropic .30 / customerAsThreat .25 / malicious .15 / human .15 / systemic .15 = 1e6 micro-exact — entropic-dominant FIRST in the corpus. Rules-free wave slice (par 100/1.115/S, max 240 w5 UNMOVED), 8 registry threat reuses, zero registry edits, both lookalike seeds re-worn. Pack 66 templates (37/29), zero era objects, refusal/status/vendor byte-ident, first backup CAC priced (`cac.backup-archival.protection-cycle`, Companion B "spiking on restore"). Pins 5 files/6 sites count-neutral re-cuts (determinism 10→11, real-content roster, metric-namespace-tier ten→eleven, families 10→11, storm-cap 10→11); content README 311 `_todo`/13 census, 96 Key-literals rows, Verb-Shift row flipped.
- **L-i18n @`51f1020`** — packStore registers the 11th pack; flavour pool 204/166→**219/177 SELF-DERIVED** (the #D5 accepted-cost law), roster total 712→778; roots ticket 52 / ach 33 / chatter 19 / codex 18 / loading 30 / sticky 11 / vendor 44, forum 8 / press 3 / abuse 1 unchanged; era trio strict-unchanged; firmware twins 11 byte-ident. Boot.corpus wire-join rider (CORPUS_WIRE_TABLE_IDS + CORPUS_TABLES additive — the @`286b406` precedent shape).

### Battery (ONE authoritative run at this tree, this closeout)

| Gate | Result |
|---|---|
| sim-core full serial | **147 files / 2,501 tests, exit 0, ZERO goldens moved** (+14 = L-RH +11, type-11 data loops +3; files UNMOVED) |
| proto full serial | **95 files / 1,051 passed, ALL GREEN** — pool re-roll + coop witnesses count-neutral self-derived re-pins |
| tools/relay | **27/27** |
| headless | **53/5 — parity real `b0162ab5` / stub `a9b4b7b8` HELD** |
| api-verify | **PASS — 1,601 names, ZERO export delta** |
| ci-verify | **5/5 PASS** |
| `pnpm -r typecheck` | **6/6 Done** |
| canary | **PASS — 133 files** |
| content validate | **exit 0 — bundles=11 / waves=11 / packs=11 · 311 `_todo` + 13 pack markers · 41 JSON files** |

### Census — ONE marker moved (g)

✅321 · 🔧1,007 · ⚠️0 · ❌2,231 · 📝30 = 3,589 (heading-level recount, method-pinned — the ❌2,232→2,231 / 🔧1,006→1,007 pair IS the delta). The move: §1.3 Backup/archival ❌→🔧 `6c0e074` (card ships as data; holds 🔧 not ✅ because Schedule has no door mechanic — agenda item (c)). Holds — zero other moves: Endless / Survival keeps 🔧 (LOOP unscoped); the transport leg carries no marker (out-of-repo lane).

### Owner state after this wave

The session-5 agenda is SPENT: (a) executed @c9e34c7, (b) answered @6c0e074, (c)/(d) recorded no-ops, (e) hardened in-repo @500c134+@6d0bc1e, (f) confirmations recorded (OD-7/9/15 + OD-11 mirror). What remains owner-gated: the **twelfth card** law call (Diagnose bless vs a further roster amendment — D1(iii) MERGE stays forbidden), tier-verb door mechanics IF ever wanted (Scale/Maintain/Sell/Negotiate/Schedule — item (c) declined for now), OD-10/OD-12 playtest numerics, the ~40 unnamed OD-2 taste constants, and the **co-op transport lane** (PHP/Workerman, out-of-repo; the in-repo law surface it needed is now closed). BLOCKED-BY-PLAN stands for types 12+, campaign/perspective content, era expansion.

### Program status

**Session-5 rulings: fully executed.** Eleven hosting types as data, the blessed verb pair spent, endless full-carry as law, relay laws hardened from spike to save — the repo-side co-op ledger has no open questions left for the transport lane to answer with rulings. Waves 1–19 landed; this closeout's doc rows ride the stack and the closeout SHA stamp rides the follow-up one-liner on hosting_game.md's status block per precedent.


## WAVE-20 closeout — session-6 "do them all": all five tier-verb door mechanics BUILT, the 12th card on Isolate with its consumer in the same wave, the ratify-the-numerics set CLOSED, relay wire-mechanics landed in-repo (2026-10-17)

**Context.** Session-5 ended at the owner wall; session-6's answer was "do them all": extend the roster with a new verb (twelfth card), authorize door mechanics for all five tier-extension verbs, land the relay wire-mechanics in-repo, and ratify the PROVISIONAL numerics without waiting for playtest. Isolate was chosen for the new verb, grounded verbatim in the §1.3 DBaaS card ("Verb: isolate and throttle. The boss is a split brain.") plus the §7.16 Act-row; throttle/restart stay OFF roster as named successors (one verb per mechanic). The joint review of the 11-commit chain returned PROCEED conditional: zero criticals on the lanes, 11/11 PASS on the law matrix (zero-golden independently re-verified, money goldens and parity hexes confirmed unmoved), and two closeout-mandated items — author `docs/adr/0015-*.md` BEFORE push (245 lines already cite it; review MAJOR) and unify the post-ratify occupancy tags (review MINOR). Both discharge in this closeout. One discipline anomaly, disclosed: 10 commits (`24446fc`→`b70900e`) were pushed to origin by an unidentified process during the L-V window ("update by push" — fast-forward-valid, no force, content verified identical); `86cff89` and this closeout ride unpushed for the ceremony lane.

### Ledger (by lane)

- **L-RELAY @`5b0d401`** — ADR-0015 #4, wire-mechanics in `tools/relay`: (R1) hub lifetime-monotonic seq numbering (per-tick counters retired — stamps never collide across pause/resume); (R2) payload opacity until the door (the hub forwards opaque `args`; the door is the sole parser — no duplicated wire grammar); (R3) O(1) append-check `assertRelayAppendStep` replacing the O(n²) self-check; (R4) paged catch-up `pageCoopLog`/`autoCatchUpOnJoin` — joiner history replayed relay-side, ZERO save writes, dup-never-twice through `orderCoopTimeline`. Relay tests 27→42; two-runners-one-digest (seed 904n, 12 ticks, ×100, hostile-permutation-normalized) re-pinned UNMOVED. Remaining transport leg stays out-of-repo (PHP/Workerman, latency, per-seat fog, page policy).
- **L-A2 @`7f47563`** — loader lint `TIER_EXTENDED_VERBS` gains `isolate` as the SEVENTH (ADR-0015 #3): a law change INSIDE ADR-0005's ratified per-tier frame (no reopen — the #D1 precedent), overriding §1.9 "never a seventh verb" AS AMENDED; the invariant six untouched.
- **RS @`4c6f827`** — ADR-0015 #1 ratify-the-numerics sweep: 73 `PROVISIONAL`→`RATIFIED 2026-10-16 (ADR-0015 #1)` label flips across 30 files (+180/−149, comment/JSON-text ONLY — machine values byte-ident, zero tests re-pinned, zero goldens). Families: economy config pile (calendar/dunning/churn/error-budget/AR/runway/reputation/postmortem incl. maxAttributableChanges), the recovery observer pair, unattended guardrails/fastForward, tickFold + corruption twins, proto scenario numerics (waveRules 8:1, simCoreRunner header, pricing dial, recoveryWatch, alertStack), lab legends, g5 fixture riders. NOT-in-set ledger (stays PROVISIONAL/gated): PROVISIONAL-B wire stamps (39 sites — RE-AUTHOR owed), copy-voice batch, audio audition, substrate taste rows, bench 7,000 t/s, sheets A/C, versus-deck design-laws (SEPARATE ASK), OD-10/OD-12 pixel/60s/40-glyph numerics (law ratified, number deferred — no harness).
- **L-T12 @`5956b8f`+@`2b216b0`** — 12th OD-14(a) type `official:dbaas`: §1.3 "The Cellar" / "The Managed Database", dominant verb **Isolate VERBATIM** — first roster-extension card since #D1 and the last until a further law call; hooks 5/9 vs anchor (R15/R16/R17/R22/R23), customerAsThreat .30-led weights, Debuffer+Splitter debuts, rules-free wave slice w5 ≤ 240, pack 66 tpl; pins 11→12 (5 files/6 sites); census 311→343 `_todo` + 14 pack markers, Key-literals 105 rows.
- **L-DM1 @`8037a4f`** — Scale door+fold (mechanic 1/5): `scale-node` (11th verb, COMMIT class 1 hand/1 tick); `GameState.scale` reserved-warmth book (4-field entries — `baseRosterSlots` authored-anchor, falsified with planted anchors); warmth materialized at the step-5/6 serve input, chained AFTER the recovery throttle (recovery-window deferral law; occupied floor never evicts; whole-map identity when inert); warmth COST stays a host-side seam. +37 tests; api-verify +6 exact; money goldens untouched.
- **L-W @`732fb66`** — proto dbaas riders: `CORPUS_WIRE_TABLE_IDS` += dbaas (the standing corpus drift pin flipped red→green UNAIDED), `corpusHost` CORPUS_TABLES, packStore registers the 12th pack (844 templates); flavour pool 219→**233 entries / 187 distinct keys** (vendor twins collapse; era trio strict-unchanged); PROTOCOL_VERSION stays 1; proto serial 1,051→exact-plateau rides per-leg below.
- **L-DM2 @`5987ef1`** — Maintain+Schedule doors (mechanics 2/5+3/5 in code-tag ordinals): `maintain-node` (12th, ATTENDANCE class 2/1) + `schedule-window` (13th, 1/1); step-9 abandonment-die veto with the attendance > calendar precedence law; window-mode band-deadline replaces the flat budget; +61 tests.
- **L-DM3 @`a760771`** — Sell door (part-1 posture, adjust-price sibling): `sell-offer` (14th, COMMIT 1/1); `GameState.sell` book REUSES `priceOverrideKey`/`parsePriceOverrideKey` by identity (drift-pinned against both sources) — NO new fold, cash-untouched (armed-vs-unarmed same-seed witness: every bucket identical, events+hands only deltas); the door's first `bigint` ArgWireType arm made LIVE with the proto revival witness; +30 door tests, proto +4.
- **L-DM4 @`b70900e`** — Negotiate door (mechanics 5/5): `negotiate-terms` (15th, 2/1 — the conversation IS the level's combat, communicate-sibling); tone/concession/term-extension book consumed at the renewal-cliff fold with ZERO new rolls (retention clamp ≤1.0 — goodwill-recovery-ONLY: a HIKE-nevers-lifts falsifier at 7176/7391/7391/7607; the zero-gross case guards "gives the cycle away"); concession lands at the `billedMrc` chain-head UNDER grandfather-WINS; `EconomyTickIn.negotiations` forwarded through the tickFold single home + fastForward/runner; +66 tests.
- **L-V @`86cff89`** — Isolate capstone (door + consumer IN ONE WAVE — the #D2 shield lesson applied): `isolate-node` (16th, COMMIT 1/1); step-5 admission-block fence — an isolated node admits ZERO new work while in-flight/queued/shed stay untouched; FENCE BEATS WARMTH; min-of-clamps with recovery; half-open `[eff, rel)`; refusal census 44 official / 40 grep-unique (census comment amended in lane); +54 tests.
- **Closeout @this commit** — `docs/adr/0015-owner-rulings-session-6.md` AUTHORED (cited forms bare×191 / `#1`×119 / `#2`×3 all land on authored bullets #1–#4; no `#3`/`#4` existed in citations — the ADR adds them as the record completes); review MINOR discharged (occupancy/hand-cost PROVISIONAL tags unified on scale/maintain/schedule rows, comment-only); hosting_game.md DBaaS ❌→🔧 + five card-mechanic law-notes + §1.9/§7.8/§7.16/§1.4 riders + pricing appendix row extension + status-block rewrite + WAVE-20 tail; MODULE-STATUS verb-wall/mechanics/ratify/relay/flavour/wire-stamp/content/proto rows + footer re-pin 2,752/157; DECISIONS-PENDING session-6 block, OD-2 residue CLOSED, OD-10/OD-12 amendments, fresh-ask register; API-REFERENCE `TIER_EXTENDED_VERBS` row current (seven members, ALL BUILT).

### Battery (ONE authoritative run at `86cff89` — review battery, re-confirmed at closeout where targeted gates overlap; the push ceremony re-runs the full set)

| Gate | Result |
|---|---|
| sim-core full serial | **157 files / 2,752 tests, exit 0, ZERO goldens moved** (shed trio, drain 78dc6556, g4 13ba145f, g5, canonical-parity, money 25_005_307_300n/25_109_732_500n, parity hexes, ×100 chains — all green unaided) |
| proto full serial | **95 files / 1,064 passed, ALL GREEN** (+13 wire-grammar/twin legs over 1,051) |
| tools/relay | **42/42** |
| headless | **53/5 — parity real `b0162ab5` / stub `a9b4b7b8` HELD** |
| api-verify | **PASS — 1,643 names** (+42 over 1,601: +6 scale, +11 maintain/schedule, +6 sell, +12 negotiate, +7 isolate) |
| ci-verify | **5/5 PASS** (g5-mirror untouched all wave — green at closeout) |
| `pnpm -r typecheck` | **6/6 Done** |
| canary | **PASS — 135 files** (closeout recount; 133 at wave-19) |
| content validate | **exit 0 — bundles=12 / waves=12 / packs=12 · 343 `_todo` + 14 pack markers · 44 JSON files** |

### Census — ONE marker moved

✅321 · 🔧1,008 · ⚠️0 · ❌2,230 · 📝30 = 3,589 (heading-level recount, method-pinned — the ❌2,231→2,230 / 🔧1,007→1,008 pair IS the delta). The move: §1.3 DBaaS ❌→🔧 `86cff89` — moved because the door mechanic AND its consumer shipped in the same wave; holds 🔧 not ✅ (the engine slice plays; HUD surfacing and proto verb-availability riders are unpaid). Zero other moves: the five mechanics amendments and the §1.9/§7.8/§7.16/§1.4 riders land INSIDE already-🔧 sections as dated blockquotes, not markers.

### Owner state after this wave

The session-6 agenda is SPENT: roster extended (#3 @7f47563+@86cff89), all five mechanics built (#2 @8037a4f..@b70900e), Isolate's consumer same-wave (capstone @86cff89), wire-mechanics landed (#4 @5b0d401), numerics ratified (#1 @4c6f827 + this ADR). What remains owner-gated: the **thirteenth card** law call (Diagnose is the SOLE unclaimed invariant verb — bless vs a fourth roster amendment), the fresh-ask register raised by the mechanics lanes (per-tenant relationship meter for Negotiate, Scale's warmth-COST host seam, Sell's acceptance dice — v0 has none, versus-deck design-laws SEPARATE ASK, the co-op transport lane), the PROVISIONAL-B wire re-author (39 sites), OD-10/OD-12 numerics (no harness), and the honest caveat recorded in ADR-0015: #1 ratified by fiat — playtest may re-open numbers. Types 13–34, campaign/perspective content, and era expansion stay BLOCKED-BY-PLAN.

### Program status

**Session-6 rulings: fully executed.** Twelve hosting types as data; the tier-extension roster is SEVEN verbs deep and EVERY member is a live door mechanic — the card-identity-only era is over; the intent door speaks 16 verbs; the co-op relay has no in-repo law question left for the transport lane; the PROVISIONAL taste pile is ratified record. Waves 1–20 landed; this closeout's doc rows ride the stack and the closeout SHA stamp rides the follow-up one-liner on hosting_game.md's status block per precedent.

---

## WAVE-21 closeout — session-7 "max feature on all five threads": the 13th type on Diagnose (roster EXHAUSTED), the §7.16 Act-row ALL-FOUR live, versus design-laws resolved, transport in-repo to its frame, mechanics A/B/C landed, wire-stamp + copy-voice residues CLOSED (2026-10-17)

**Context.** Session-6 ended at the owner wall with a fresh-ask register (thirteenth card, negotiate depth, versus laws, transport, copy residue). Session-7's answer, verbatim: "keep going with all of this, go with recommendations, MAX feature" — every thread taken to its fullest authorized shape, executed as ADR-0016 #1–#10. Joint review: PROCEED, zero critical / zero major, minors folded.

### Ledger (by lane)

- **L-WS @`caa4d17`** — ADR-0016 #1: 39 bundle `PROVISIONAL-B` field sites → `RATIFIED-B`; `script/validate.mjs` `TUNING_RE` widened `/^(PROVISIONAL|RATIFIED)-[ABC]$/` (legacy arm stays VALID — tolerance law); loader `stamp.test.ts` (6) pins the parse; residue ruling: the 27 waves-slice + 16 registry-core sites stay honestly PROVISIONAL-tagged — the stamp law fences the bundle wire marker. Runtime sheet UNCHANGED (engine truth was ratified B @`24dfcfe`).
- **L-V1 @`0ae760b`** — versus deck-v2 (ADR-0016 #2 decisions 1–2): `costBps` split — Σcost==budget with `AFFIX_COST_MULTIPLIER_BPS` premiums (17 keys PROVISIONAL ratify-on-playtest); `hh-versus-deck-v2` hash-domain + reveal-side domain guard (`COMMIT_MISMATCH` names found-vs-spoken); affordability-downgrade + exact-sum compensation walk; `AFFIX_COST_UNFEASIBLE` (15th code).
- **L-RB @`88f9c30`** — relay barrel rider (16 names) count-neutral.
- **L-TP @`0da14b8`** — ADR-0016 #3: NEW workspace `tools/transport` (`transport-tools`, 8 src / 6 test / `conformance.ts`) — `hh-coop-transport@1` strict envelope (13 `transport[CODE]` walls), pump-driven `TransportPort` (zero-timers law-scan), in-memory carrier (kernel-RNG dup/drop/delay), client idempotence (absorb-identical / FATAL-divergent), fog serializer drift-pinned to `ObservedCellWire`, replica witness never re-stamps, refuse-new-never-drop-old log budget, `runTransportConformance` 15-it harness — **84 tests**; typecheck 7/7 from here.
- **L-N3 @`1efe12a`** — mechanic C (ADR-0016 #4): warmth COST — `WarmthConfig.rateMicroUsdPerSlotMonth` 25_000_000n ($25/slot-mo PROVISIONAL), month-cursor identity law (the attention floor-division copied), `scale-warmth:mN` opex drafts post-or-BOUNCE via OPEX-REFUSED, zero dice; drift-pinned `scaleWarmInForce` twin; disclosed gap: no ship host mints a Scale book at run-start yet — the seam is future-ready. Money goldens UNMOVED.
- **L-TR @`81b0589`** — `throttle-node` 17th verb (ADR-0016 #5): capacity-as-CLAMP §(c) — roster NEVER written (the materialized-shrink and bps-probability shapes REJECTED with proof; the donut-partial is the legibility win); `bad-cut-slots` refusal points at `isolate-node`; occupancy 1/handCost 1 COMMIT PROVISIONAL; census 45.
- **L-CV @`18c3f6a`** — copy-voice batch (ADR-0016 #6): `PROVISIONAL_FALLBACK_VOICES`→`RATIFIED_FALLBACK_VOICES`, `PROVISIONAL_NOTE`→`RATIFIED_NOTE` + `ratifiedNote()` — the last label-bearing voice comments (strings themselves RATIFIED since @`4c6f827`).
- **L-T13 @`9e9f377`** — ADR-0016 #7: THIRTEENTH type `official:observability` — §1.3 "Who Watches" / "Cardinality" on **Diagnose** via the D1(i) prose-implication bless (four anchors: §5.7 :27179, §1.3 :2653-2654/:2657, :5059; owner authoring-time confirm 2026-10-17). FIRST shipped type with NO §0.3 row — RECORDED absence, never forged; 2nd Resident-patience visitor after exchange-colo; hooks 5/9 (R15/16/17/22/23 — the dbaas set exactly; R23 honest engine-gap: card drops DATA, engine sheds requests); familyWeights .35/.30/.15/.10/.10; pack 66 templates 37/29 zero-era; pins 12→13. **The roster is EXHAUSTED — 6 invariant + 7 extended all claimed; the fourteenth card is a fresh OWNER LAW CALL.**
- **L-N1 @`5e8ce75`** — mechanic A (ADR-0016 #8): relationship ledger — per-tenant trust on the priceKey `<kind>:<id>` space; TABLE-FIRST materialization (the meter opens at the negotiation table; no-file tenants move the COMPANY pool only); R9 double-charge IS the law; clamp ≤1.0 goodwill-recovery survives + the DOWNWARD leg (signed trust); `negotiationRetentionFactorBps` optional 4th arg (3-arm EXACT byte-identity — negotiate-era digests survived unaided); 11 config fields PROVISIONAL; WARCT valuation leg DEFERRED; zero new rolls (source-grep pinned).
- **L-W2 @`bf45f03`** — proto riders: `CORPUS_WIRE_TABLE_IDS` + observability (drift pin cured unaided), `packStore` 13th pack — pool 233/187 → **252 entries / 202 distinct** (910 templates); PROTOCOL_VERSION stays 1.
- **L-RS @`fd91138`** — `restart-node` 18th verb (ADR-0016 #5): bounded fence (release REQUIRED, null=garbage); `dropQueued` "drop"|"keep" ("drop"-verb naming law — stored boolean renamed from dropInFlight); §(c′) queue-flush rides the R8 F-2 shed PRESET — zero dice; §(b) releases FIRST, completion-before-purge; kill-in-flight DEFERRED (wedge-state, `pipeline/restart.ts`); legibility ladder throttle-partial < keep-fence < drop-flush ≤ isolate; **refusal census 45→46 MACHINE-PINNED** (source-regex ==46, the discipline flip); unknown-node verb family now ELEVEN.
- **L-V2b @`eb4b86a`** — versus affixes LIVE (ADR-0016 #2 decisions 2–6): `versus/affixes.ts` 16-slug `AFFIX_WAVE_DELTAS` (window fold / shape MAX / band+targets override / share cuts Σ100 / secondIncident+feint flags; SI ×1.8/×2.5 as integer per-mille reusing the ratified §4.13 multipliers; slug-12 `live:false` DATA-ONLY with a written future spec); converter applies AFTER binning, rules keys OMITTED when unraised (no-affix byte-identity); `FEINT_BUDGET_EXCEEDED` + `POOL_BAND_NARROW` (advisory); `MAX_FEINT_WAVES_PER_DECK=1`; `pickDecisiveWave` tie law extracted VERBATIM (decision 5); three-tag key-space pin + unattributed mint-tick floor KEPT grammar-forced with the cross-lane driver ticket (decision 6); golden `cd1296c54df0e9c6` STANDS; versus 144→189.
- **L-N2 @`24f90bc`** — mechanic B (ADR-0016 #9): sell acceptance dice — economy step 5.5 BETWEEN cliffs and the invoice calendar; anchor authority host-catalog → lowest-key-MRC → unadjudicated NO-ROLL; one roll per fresh adjudication on the NEW `economy/sell` stream domain; persisted fingerprint replays-never-rerolls (amended re-rolls at a new minute); `sell-accepted`/`sell-refused` notices — union 29→31 MACHINE-census'd; REPUTATION-NEUTRAL (explicit null arms at 12.5); 5 PROVISIONAL numerics — base 7_500 / coefficient 150% leverage / dead-band 1_000 / floor 1_000 never-hopeless / **ceiling 9_500 NEVER certain (two-domain law mirroring ADR-0014 #D4)**; verdicts book moves NO money — cash/entries/events/observedWrites byte-equal both arms; the door still moves no money.
- **Closeout @this commit** — `docs/adr/0016-owner-rulings-session-7.md` AUTHORED (10 bullets, one per named theme; zero numbered `#N` citations existed in code at start — the ~80 free-form citation forms all map onto #1–#10); API-REFERENCE owed rows collected (versus +6 → 78, census prose 17→18 verbs, refusal 46); hosting_game.md: §1.3 Who Watches ❌→🔧 `9e9f377` + law-note, four card-mechanics riders (serverless warmth / dbaas throttle / colo meter+WARCT-deferral / exchange-colo dice), §7.16 Act-row rider ALL-FOUR, §7.5 incident-verb-set rider, appendix row-extension, status block wave-21, WAVE-21 tail; MODULE-STATUS 15 row edits incl. NEW tools/transport inventory row; DECISIONS-PENDING session-7 blockquote + asks register swapped.

### Battery (ONE authoritative run at `24f90bc` — review battery, re-confirmed at closeout where targeted gates overlap; the push ceremony re-runs the full set)

| Gate | Result |
|---|---|
| sim-core full serial | **165 files / 3,055 tests, exit 0, ZERO goldens moved** (shed trio, drain 78dc6556, g4 13ba145f, g5, canonical-parity, money 25_005_307_300n/25_109_732_500n, negotiate-era digests, parity hexes, ×100 chains) |
| proto full serial | **95 files / 1,066 passed, ALL GREEN** (+2 aggregate over 1,064: 13-pack roster pins + restart wire leg) |
| tools/relay | **42/42** |
| tools/transport | **84/84 NEW workspace** |
| headless | **53/5 — parity real `b0162ab5` / stub `a9b4b7b8` HELD** |
| api-verify | **PASS — 1,682 names, 16 modules + types** (+39 over 1,643 across the chain; per-lane legs in each commit; closeout collected the final 6 versus rows) |
| ci-verify | **5/5 PASS** (g5-mirror untouched all wave) |
| `pnpm -r typecheck` | **7/7 Done** (transport joins) |
| canary | **PASS — 140 files** (135 at wave-20) |
| content validate | **exit 0 — bundles=13 / waves=13 / packs=13 · 377 `_todo` + 15 pack markers · 47 JSON files** |

### Census — ONE marker moved

✅321 · 🔧1,009 · ⚠️0 · ❌2,229 · 📝30 = 3,589 (heading-level recount, method-pinned — the ❌2,230→2,229 / 🔧1,008→1,009 pair IS the delta). The move: §1.3 "Who Watches" / "Cardinality" ❌→🔧 `9e9f377` (the thirteenth type; law-note records the D1(i) bless route and the honest §0.3 absence).

### Owner state after this wave

The session-7 agenda is SPENT: thirteenth card shipped (roster EXHAUSTED — fourteenth = fresh law call), mechanics A/B/C landed, versus laws resolved, transport in-repo to its frame, successors built (Act-row ALL-FOUR), residues closed. NEW wall items: fourteenth-card law call; HUD affordances ×3; WARCT valuation + in-flight-kill deferrals; coverage-strength affix leg; driver re-mint attribution ticket; slug-12 consumer; PHP/Workerman production carrier; ADR-0016 #10 ratify-on-playtest register.

### Program status

**Session-7 rulings: fully executed.** Thirteen hosting types as data; eighteen door verbs (refusal census 46, machine-pinned); the tier-extension era CLOSED with its capstone bless — every roster verb now stands claimed; versus, transport, and the economy's negotiate-depth trinity moved from fresh asks to shipped law. DISCIPLINE ANOMALIES DISCLOSED: the L-TR lane's ghost-SHA stdout (objects 9673053/32d38b7 nonexistent, reflog clean — no damage) and an EXTERNAL unattributed fast-forward of origin `70b16b4→eb4b86a` mid-wave (our own objects, ff-valid — third twin-process anomaly of the program; `ls-remote`-before-push law held). Zero-golden law HELD across all thirteen commits. Next drivable work: none without an owner ruling — the program stands at the fourteenth-card wall.
## WAVE-22 closeout — session-8 "go with recommendations, max feature": the fourteenth type via a BLESSED reclaim (first §1.4-founded card, first door-before-card), the reclaim spine as 19th verb with its consumer in the same wave, two-browser co-op adopted on the portable-lib topology, the attribution floor collapsed to zero, the §2.13 coverage affix-leg built, the split-ratify landed (2026-10-17/18)

**Context.** Session-7 ended at the fourteenth-card wall with an 11-item recommendations agenda. Session-8's answer, verbatim gist: "go with recommendations on each of those … max feature/functionality." Every recommendation taken to its fullest authorized shape, executed as ADR-0017 #1–#5 (the fifteenth item — browser-WSS transport — was ruled as #4's adoption; the fourth, force-variant wedge, was ruled DEFER). Joint review: PROCEED, zero critical / zero major; minors F-1…F-4 folded into this closeout's records. TWO structural firsts rode the wave: a hosting type founded on a §1.4 card (§1.3 having run dry at thirteen), and a door mechanic whose spine LANDED BEFORE its card (reclaim-node @`c8b92a2` predates ci-build-farm @`a47a9b5` — the inverse of the blessed lint-then-verb order, ruled legal because the bless #1 and the spine #3 shipped in one wave; recorded as law-note on the card).

### Ledger (by lane)

- **L-CA @`2b63795`** — ADR-0017 #2: §2.13 coverage affix-leg — `coverage/affixLegs.ts` `AFFIX_COVERAGE_NULLIFIES` drift-pinned to versus `AFFIX_VOCABULARY` (source-read mirror, ZERO import edge — module-boundary law held); five doc-named column legs live (distributed→Meter, encrypted→Classify, low-slow→Detect, adaptive→Deter, piggyback→Absorb) as grid-column nullification; eleven honest nulls — the Rate-shaped row names a NON-column (doc contradiction RECORDED not forged), Timed/Two-stage likewise, eight slugs unmapped; categorical column pin-ZERO contributors kept; +53 tests. Two legs, one law: the wave-semantics half shipped earlier @`eb4b86a`.
- **L-CV2 @`e2a1bba`** — split ratify (ADR-0016 #11 section authored — the ratify rides 0016, deliberately NO ADR-0017 bullet): 49 label flips `RATIFIED 2026-10-17 (ADR-0016 #11)` — economy Sell 5 + Warmth 1 + Relationship 11 + door occupancy/handCost across 8 verbs; transport caps (65_536 / 10_000 / 64) + AFFIX bps + PROVISIONAL-B wave-slice residue STAND PROVISIONAL by ruling — the split is the decision.
- **L-RL @`ff8615c`** — ADR-0017 #1 leg one: `TIER_EXTENDED_VERBS` += `reclaim` — EIGHTH extended verb, FIFTH owner roster amendment (ADR-0014 #D1 line); lint.test 142.
- **L-HOST @`af55b61`** — ADR-0017 #4 leg one: NEW workspace `tools/host` (`host-tools`, ws 8.22.0 pure-JS) — `wsHubPort` (the transport port's real-socket twin; `maxPayload=MAX_FRAME_BYTES` ⇒ carrier close 1009 IS the frame-wall law), relay hub, server, cli; 14 tests; seven interface truths incl. CLIENT-APPLIES-ONLY-ON-DRAIN; typecheck 7→8 members from here.
- **L-DM5 @`c8b92a2`** — ADR-0017 #3: `reclaim-node` 19th door verb + CONSUMER same wave (the isolate law): tombstone book `GameState.reclaim` LAST, voids bookings `shippedAtTick <=` tombstone at SIX read sites (scale warmth / isolate fence / throttle cut / restart window / maintain band / schedule window); EXCLUSIONS pinned with reasons — shield (protection ≠ capacity), recovery (engine authority), priceKey books (spot-eviction needs a contract→capacity bridge, NAMED future); CENSUS 46 UNMOVED — FIRST tier verb with ZERO new refusal phrases; Shield arg-shape verbatim (zero new ArgWireType arms); occupancy/hand 1/1 PROVISIONAL (#11 register closed before this verb existed); 67 tests (26 door + 41 consume) + intentGrammar self-extension; the warmth-check ORDER fix protected the drift-pin (no re-pin).
- **L-WS-B @`96bd238`** — ADR-0017 #4 leg two: browser co-op client — `transport/wsClientPort.ts` (seven interface truths honored) + `chrome/coopRoomWire.ts` (local spike-runner seat, boot-seed 904n CONVENTION — determinism lives in the stamped log, real RTT enters only as the hub's acceptance tick) + CoopRoom Wire toggle default-local; +13 tests; two-browser demo playable via `pnpm -F host-tools dev` + jsdom (F-1 honesty below).
- **L-RA @`cbf53a4`** — ADR-0017 #5: attribution floor — driver mints NEW `SimEvent` kind `reentry` at maturity (child/retryOf/lineageRoot/retryDepth; order door < reentry < arrival; union 11→12) carrying ZERO state bytes ⇒ ALL digests immune BY CONSTRUCTION (full serial unaided); versus fold labels from it ⇒ the unattributed floor COLLAPSED TO ZERO (1,040 × 3-seed saturation redistributed; three floor pins flipped — disclosed; conservation invariants unmoved); `pickEffectCause` preference law — DEVIATION recorded: the design's `~-grammar` predicate was VACUOUS (those ids never reach event streams), the landed preference is the `<tableId>@` arrival prefix, caught by falsification; causality `eventSubject` +case reentry (free storm lineage); api +1 name → 1,693.
- **L-C14 @`a47a9b5`** — ADR-0017 #1 leg two: FOURTEENTH type `official:ci-build-farm` "Green Light" / "Untrusted Code, By Design" — FIRST §1.4-founded card (:2677), verb **Reclaim** VERBATIM (card verb-line third word); recorded absences: NO §0.3 row, NO §6.6 row (never forged); FIRST value-decay patience consumer (§3.3 CI-build-job commands it; bundle.ts enum already accepted); hooks 5/9 (R15/16/17/22/23), R18 rides ms with the seconds-tension authored; cust.30/mal.25/sys.20/hum.15/ent.10 = 1e6; 8 registry reuses ZERO edits; pack 66 = 37/29 zero-era; CAC platform-slot channel; debts honestly `_todo`-ed (Runner-Hygiene meter has no engine state yet, Monday-Wall seasonality not forged, credential-boundary-breach registry proposal). Door-before-card recorded as law-note.
- **L-PW @`27281fa`** — proto riders: `CORPUS_WIRE_TABLE_IDS` += ci-build-farm (append-last; drift pin CURED UNAIDED), `packStore` 14th pack — roster 976 templates, flavour pool 252/202 → **272/217** (probe-derived twice, python + vitest agreement); PROTOCOL_VERSION stays 1. FOUND the first pack-ambiguous key ever: `intern.entry.firstday` slot-free in observability AND ci-build-farm with DIVERGENT texts.
- **L-HUD @`a28e764`** — §7.16 Act row player-facing: `chrome/actRow.ts` pure law (`mintActIntent` sole mint site + door `VERB_ARG_SHAPES` source-drift-pin, 7 verbs) + `NodeActRow.vue` (ACT chips drain/restart/isolate/shed + reclaim; DESK readouts throttle/warmth/shield/reclaim books) + HudLabPanel card; +33 tests (proto 99 files / 1,112); zero runner/protocol seam needed (pending-door-intents path pre-existing); `RESTART_WINDOW_MINUTES = 5` + lift-at-next-boundary ergonomics PROVISIONAL into the ADR-0017 #3 register; worker grep-clean.
- **L-IX @`c317efd`** — collision cure: ci-build-farm `intern.entry.firstday` → `intern.entry.board` (values byte-ident, flavour + `_provenance`); divergent-set pin flipped to falsifiable EMPTY — every slot-free twin byte-ident across fourteen packs AGAIN; pool 272 entries / 218 distinct.
- **Closeout @this commit** — `docs/adr/0017-owner-rulings-session-8.md` AUTHORED (five bullets matched to the on-disk citation inventory: #1 ×16 lines, #3 ×34 lines, #2/#4/#5 bare — zero #6 invented); hosting_game.md: §1.4 Green Light ❌→🔧 `a47a9b5` + law-note, §2.13 mix-ins ❌→🔧 `2b63795` + law-note, four rider amendments (§1.4 verb bless discharge / §1.9 five-amendment census / §7.8 four-amendment-waves / §7.16 Act-row player-facing), status block wave-22, appendix row-extension, WAVE-22 tail; MODULE-STATUS 14-row sweep incl. NEW tools/host inventory row + m3 chunk-row WAVE-22 re-measure; DECISIONS-PENDING session-8 blockquote + mega-row fifth amendment + asks swapped. API-REFERENCE needed NOTHING (lanes updated it in-commit all wave — PlayerVerb 19, census 46, reentry rows already live; api-verify PASS 1,693 unchanged by this closeout).

### Battery (ONE authoritative run at this closeout tree — the push ceremony re-runs the full set)

| Gate | Result |
|---|---|
| sim-core full serial | **169 files / 3,199 tests, exit 0, ZERO goldens moved** (shed trio, drain 78dc6556, g4 13ba145f, g5, canonical-parity, money 25_005_307_300n/25_109_732_500n, `cd1296c54df0e9c6`, negotiate-era digests, parity hexes, every ×100 chain — reentry events carry zero state bytes, immunity by construction) |
| proto full serial | **99 files / 1,112 passed, ALL GREEN** (1,066 → 1,079 with @96bd238's +13 while L-PW's corpus drift pin cured UNAIDED → 1,112 with @a28e764's +33) |
| per-directory re-pin | pipeline 834/47 · waves 233/15 · scenario 430/7 · loader 142/8 · coverage 109/6 · versus 191/6 · replay 81/7 — scenario GREEN UNAIDED after the hosting_game flips (the specLine drift-hazard did NOT fire: zero re-pins needed) |
| tools/relay / transport / host | **42/42 · 84/84 · 14/14** (host NEW workspace) |
| headless | **53/5 — parity real `b0162ab5` / stub `a9b4b7b8` HELD** |
| api-verify | **PASS — 1,693 names, 16 modules + types** (+11 over 1,682 across the chain: reclaim trio + reentry name legs; closeout docs-only, zero delta) |
| ci-verify | **5/5 PASS** |
| `pnpm -r typecheck` | **8/8 Done** |
| canary | **PASS — 140 files** |
| content validate | **exit 0 — bundles=14 / waves=14 / packs=14 · 412 `_todo` + 16 pack markers · 50 JSON files** |
| vite build | **worker 900.25 / fakeWorker 568.28 / index 1,385.72 kB** (m3 chunk row re-measured; chrome co-op legs add ~0 to index — F-1) |

### Census — TWO markers moved

✅321 · 🔧1,011 · ⚠️0 · ❌2,227 · 📝30 = 3,589 (heading-level recount, method-pinned — the ❌2,229→2,227 / 🔧1,009→1,011 pair IS the delta). The moves: §1.4 "Green Light" / "Untrusted Code, By Design" ❌→🔧 `a47a9b5` (the fourteenth type; law-note records the §1.4-home convention bless, the door-before-card first, the value-decay first consumer, and the recorded §0.3/§6.6 absences) and §2.13 "Each mix-in invalidates exactly one defense role" ❌→🔧 `2b63795` (the coverage affix-leg; law-note records five column legs, the honest nulls, and the two-legs-one-law pairing with `eb4b86a`).

### Owner state after this wave

The session-8 agenda is SPENT. The wall has MOVED but stands: **the fifteenth card is a fresh OWNER LAW CALL** — 6 invariant + 8 extended verbs ALL claimed (Diagnose `9e9f377`, Reclaim `a47a9b5` the last two). Named successors still off-roster: `expire` (RULED off — the read-time expiry law already lapses stale books without a door verb; blessing it double-names a mechanic), throttle/restart (BUILT door-side, off-roster — capacity-verbs of the fence family), failover/roll-back/escalate (§7.5 incident vocabulary = design-space, unbuilt). Deferred register STANDS: WARCT valuation, in-flight-kill wedge, slug-12 consumer, render-harness numerics (OD-10/12), coverage-preview proto leg; the co-op PRODUCTION carrier (PHP/Workerman) remains out-of-repo by ruling — the in-repo dev carrier + conformance harness are the contract its host must meet.

### Program status

**Session-8 rulings: fully executed.** Fourteen hosting types as data (six sections' worth of card homes — §1.4 cracked open); nineteen door verbs (refusal census 46 — and for the first time a tier verb shipped WITHOUT touching it); co-op crossed from relay-spike to playable two-browser session on the portable-lib topology; the versus unattributed floor — three waves old, grammar-locked, the ugliest honest row in the deck — collapsed to zero without moving one digest byte; §2.13's second leg closed the affix story. DISCLOSURES: **F-1** — the L-WS-B commit-body's index ledger misattributed +2.97 kB to the browser client: the true delta is ~0; the +2.79 kB rode in earlier with L-DM5 door strings, and the chrome co-op barrel has ZERO app-graph importers today (pre-adoption posture by design — "demo playable" = jsdom tests + the dev host, not the built app surface; history is immutable, this record is the correction). **Gates truth** — F-2: validate pack-markers are 16 not 15 (ci pack +1, legitimate); F-3/F-4: the §2.13 flip and the host package.json exports row are landed here. ORIGIN STILL CLEAN: `ls-remote` verified `e7d9150` at this closeout — NO sixth external push this wave (all five prior anomalies stayed ff-valid, ours). Zero-golden law HELD across all eleven commits plus closeout. Next drivable work: none without an owner ruling — the program stands at the fifteenth-card wall.
## WAVE-23 closeout — session-8 follow-on rulings 1a/2a/3b/4a/6b: the type program CEASES at fourteen, chrome is ADOPTED into the app graph (F-1 discharged), topology (a) closes in-repo, and the game-feel register discharges with values byte-zero (2026-10-18)

**Context.** Wave-22 ended at a wall of fresh asks; the owner answered by letter: 1a STOP the type program at fourteen (exhaustion stays LAW; depth-work is the direction), 2a adopt the chrome into the app graph, 3b close the topology-(a) question in-repo, 4a ratify the game-feel numerics, 6b let the pack-JSON prose stand as provenance debts. Three build lanes landed and reviewed (joint review PROCEED, zero critical/major); this closeout carries the doc sweep, the two ADR prose corrections the review found, and the census recount.

### Ledger (by lane)

- **L-RS3 @`f6f1d4b`** — ADR-0017 #6 (ruling 4a): game-feel batch-ratify — **30 source sites across 7 files** (versus/deck.ts ×18, versus/affixes.ts ×1 umbrella, economy/config.ts ×4, coverage/matrix.ts ×1, chrome/actRow.ts ×2, pipeline/intent-door.ts ×2, pipeline/defaults.ts ×2) + **4 test literals**; every flip is the grep-able literal `RATIFIED 2026-10-17 (ADR-0017 #6)`; machine values byte-zero (string-aware token diff); transport caps + the named playtest gates STAND.
- **L-ADP @`945fba6`** — ruling 2a: chrome ADOPTED — `ALL_GATE_MOUNTS` spreads CHROME (HUD-LAB + COOP as NON-gate rail stages, sandbox/sim-lab precedent — the six §9.13 gates stay six); the §7.16 Act row mounts on the G4 board through the REAL door (`submitActIntent` on the session's own stamp-authority queue; G4Snapshot untouched); review F-1 DISCHARGED; proto 99f/1,112 → **100f/1,121** (`appAdoption.test.ts` 5 incl. the full DOM→door→receipt loop, `g4Session.test.ts` +4, one disclosed count-neutral length-pin re-cut).
- **L-TRN @`61efe31`** — ADR-0017 #7 (ruling 3b): topology (a) closed in-repo — `RelayHubHandle.publish(): number` re-fans the existing seat-state (ledger+lastStamp+optional per-seat rider) timer-free/idempotent with every law inherited (@`24426ec` departed-freeze, per-seat-only view, omit-when-unset, V1 envelope); `tools/host simLoop.ts` 325 ln: one `createTickDriver` world, SOLE door feeder, per-seat `projectSeat` fog, absent-keys-including-existence proven at `decodeFrame` over loopback; topology (b) default byte-ident; transport 84→**91**, host 14→**19**; named limits: no economy lane v0, browser view-rider thin client owed, seat→scope host config.
- **Closeout @this commit** — ADR-0017 gains #7/#8 + the status amendment and carries the review's two prose corrections: (F-1) the #6 STANDS list dropped its stale `noticeSurface` voices claim (ratified @`18c3f6a`); (F-2) the inherited PROVISIONAL-B waves-slice count re-derived **27→31** by pin-exact grep (dated append on the ADR-0016 #1 record; #11's restatement points at #1 and reads through it). hosting_game.md: status block → wave-23, §7.16 rider (G4 mount + numerics discharged), §9.13 six-gates rider, §1.4 CEASED law-note, appendix rows, WAVE-23 tail — ZERO heading markers moved. MODULE-STATUS 14-leg sweep; DECISIONS-PENDING blockquote + fresh-ask updates; API-REFERENCE ratify-lag corrections (the #D4/#6 labels were on disk, the doc rows lagged); tools/transport + tools/host README rungs (incl. the F-3 pumpTo mode-(b) ritual disclosure).

### Battery (ONE authoritative set at this closeout tree — the push ceremony re-runs the full set)

| Gate | Result |
|---|---|
| sim-core full serial | **169 files / 3,199 tests, exit 0, ZERO goldens moved** — UNMOVED from wave-22: the whole chain touched zero packages/sim-core files (f6f1d4b comment/label text + 4 count-neutral test literals) |
| proto full serial | **100 files / 1,121 passed, ALL GREEN** (99/1,112 +1f/+9t @`945fba6`) |
| relay / transport / host | **42/42 · 91/91 · 19/19** (transport +`publish.test.ts`; host +`simLoop.host.test.ts`) |
| headless | **53/5 — parity real `b0162ab5` / stub `a9b4b7b8` HELD** |
| api-verify | **PASS — 1,693 names, INERT across the whole wave** (zero export names moved) |
| ci-verify | **5/5 PASS** |
| `pnpm -r typecheck` | **8/8 Done** |
| canary | **PASS — 140-era** |
| content validate | **exit 0 — bundles=14 / waves=14 / packs=14 · 412 `_todo` + 16 pack markers** |
| vite build | **worker 900.25 kB (IDENTICAL content hash vs pre-adoption) / fakeWorker 544.10 / index 1,549.06 kB** @`945fba6` — re-measured independently at review; +163.34 entry-side = the intended adoption cost |
| scenario specLine guard | **7 files / 430 GREEN** (hosting_game insertions verified non-§1.5; zero specLine re-pins needed) |

### Census — ZERO markers moved

✅321 · 🔧1,011 · ⚠️0 · ❌2,227 · 📝30 = 3,589 — UNCHANGED from wave-22, disk-confirmed at this closeout by the code-unit heading-scan method (`^#{1,4} ` lines, both ⚠ variants). A ratify-labels/adoption/transport wave: the §7.16 and §9.13 riders and the §1.4 stop law-note are blockquote text, not heading markers; the #6 sweep flips comment labels, not headings.

### Owner state after this wave

The TYPE PROGRAM is CEASED (1a) — fourteen shipped, roster exhaustion stays LAW, the fifteenth ask is closed by stop, re-arming is owner-only. Adoption (2a) and topology (a) (3b) landed; the game-feel register (4a) discharged with values byte-zero; pack prose (6b) stands. Standing defers, named: WARCT valuation leg, in-flight-kill wedge, slug-12 consumer, render-harness readability numerics (OD-10/12), coverage deck-preview proto leg, `DECISION_*` playtest consts flag, PHP/Workerman production carrier, browser view-rider thin client, audio audition, substrate taste rows, bench 7k budget, tuning-sheet A/C letters, PROVISIONAL-B residue (31+16 sites — re-author targets the bundles).

### Program status

**Session-8 is fully spent, both halves.** The program now holds a BUILT app surface for the chrome it authored (F-1 closed — the barrel's mounts are runtime entries, the Act row plays through the real door on the G4 board), a two-topology co-op carrier with the engine-authoritative variant playable in-repo behind `--sim`, and a CLOSED game-feel register whose engineering half stands by design. The notable meta-fact: the review INDEPENDENTLY RE-MEASURED the wave-22 F-1 build ledger and the wave-23 adoption ledger — the "+163.34 index, worker hash-identical" figures are instrument readings, and the stale 27-site residue count was caught and corrected by dated append rather than rewrite. Origin unmoved all wave — no external-push incident. Phase-1 gates: six stay six. Next: owner wall again — depth-work agenda (eras/campaign/adoption rungs), the transport next rung, and whatever 1a re-arm decision may someday come.

## WAVE-24 closeout — session-9 rulings "1c 1d 1b 1a": the DEPTH wave — era quad-canon BLESSED and all fourteen packs speak it, campaign v0 LIVE (linear; settlement executor writer-owned), GATE 7 COMMISSIONED as the seventh prototype gate (rules pay hands), and the MP production path gets its CARRIER CONTRACT + dev-grade auth + paid thin-client (2026-10-18)

**Context.** Session-8 spent the type program at fourteen and pointed at depth-work. The owner's session-9 answer, verbatim — "1c 1d 1b 1a": commission Gate-7 (1c), land the MP production path (1d), build campaign v0 (1b), bless the era canon (1a). Sixteen lanes ran atop `4afcfa5` (9018305 era canon · 5e87477 L-THIN · 2b0a882 L-AUTH · e1ada9d L-CP1 · 7bc1b9d G7-ENGINE · 9a4d796 L-CP2 · 0e41e64 G7-PROTO · b750945 G7 typing rider · 529dc91 L-ER-B · b830aee L-CONTRACT · 8ef4f6b/7aedcfc/6d06176/7766eee era fans C–F · 5d0577b L-CP3 · 949ebd1 L-ER-G) to a build-complete tip; the joint review returned PROCEED, zero critical/major, findings F-1..F-7 all dispositioned below. NO new hosting type, NO new door verb, ZERO pre-existing digest goldens moved — wave-24 is depth on a settled surface. (Anomaly logged: origin was externally advanced `4afcfa5`→`e1ada9d` mid-wave — the FIFTH such event; our first four commits, ff-valid, no damage; ls-remote-before-push law held.)

### Ledger (by lane)

- **L-ER-A @`9018305`** — ADR-0018 1a: era canon BLESSED {1998,2008,2016,2026} — `ERA_YEARS` closed + `nextEra` wrap; TWO new skin-token blocks AA-passed (OD-22c four-set law finally paid); `era-canon.test.ts` (+6/+1 file) the census pin.
- **L-THIN @`5e87477`** — ADR-0018 1d: browser thin-client view-rider PAID — `coopSeatView`/`wireView` + the CoopRoom THIRD fog column mount the rider read-only; existence-absent/honest-null witnesses; deviation disclosed: `wireViewSeenAt` measures the LOCAL pump; +25 proto tests.
- **L-AUTH @`2b0a882`** — ADR-0018 1d: OPT-IN token auth (token rides `?query` — browser sockets cannot set headers; timingSafeEqual over sha256 BEFORE the listener; refusal closes 1008; DEFAULT-OFF = byte-for-byte legacy posture) + AUTO-LEAVE ON DISCONNECT DEFAULT-ON (synthesized leave via the authority inbox cures the open-tenure re-join poison); host 19→36 (`auth`/`autoLeave`/`rooms` test files); the SaveError-through-drain truth recorded (double-open THROWS, not a fault frame).
- **L-CP1 @`e1ada9d`** — ADR-0018 1b: `save/settle.ts` 32-facet settlement executor, WRITER-OWNED (+27 `settle.test.ts`; save exports +9 → 218) + `src/campaign/` 25 exports (14v+11t) with the `perspective` RESERVED wall; api-verify 1,727 mid-wave.
- **G7-ENGINE @`7bc1b9d`** — ADR-0018 1c: `IntentDoorConfig.ruleCarriers?: "off" | "mapped"` — DEFAULT off ≡ TODAY (IDLE sentinel byte-identity); `mapped` translates a re-fed `kind:"verb"` intent through the FILE-LOCAL SIX-keys→FIVE-player-verb-twins map onto the ordinary rail; D4 attention-exempt; +41 (acceptance `gate-g7.test.ts` 20 w/ self-derived goldens `d727cdda5fde0250`/`1622412ac78d585a` + `intent-door-rulecarrier.test.ts` 21); refusal census 46 rode UNPAID.
- **L-CP2 @`9a4d796`** — ADR-0018 1b: §1.2 perspectives v0 `scenario/perspective.ts` — frozen 5-roster composed from EXISTING seams ONLY (validator `can*` ×4 + `lookupPolicyCard` strip); 5×19 `PERSPECTIVE_EXPRESSIBILITY` falsifiable table; the 14-verb `canExecute` ceiling NAMED-UNBUILT (owner wall); doc.ts sparse `perspective?` row — all 30 standing wires byte-stand; barrel 51→64.
- **G7-PROTO @`0e41e64`** — ADR-0018 1c: `gates/g7/` — 6-card deck (the 1 failover = the bought-verb wall VISIBLE), 654-ln `g7Runner` on the g4Session architecture, split-screen ONE-rail panel + watch-toggle + dry-run shadow seam + grace leg; +38; worker chunk SHA-IDENTICAL.
- **G7 rider @`b750945`** — typing rider (`asMoney`/`RuleFiring`/`asRunSeed`); typecheck 8/8.
- **L-ER-B @`529dc91`** — anchor packs: shared-web QUAD-era, game-servers +2 era keys; owns the sim-core era pins 7→12 LADDER + trio→FIVE changed-set.
- **L-CONTRACT @`b830aee`** — ADR-0018 1d: `tools/transport/CARRIER-CONTRACT.md` ~700 ln = THE PHP/Workerman obligation doc — 8 wire kinds / 13 codes / 3 PROVISIONAL caps with ratification path / eight never-re-invent laws; §2.11 hub behavior + §2.12 connection-layer truths; TWO conformance rungs — RUNG-1 CI-safe JSONL frame-trace (57-line embedded witness `de1d4c0f941333eb`, 4-run byte-identical; player-follow-on leg recorded owed), RUNG-2 owner-box live bridge.
- **Era fans C–F @`8ef4f6b`+@`7aedcfc`+@`6d06176`+@`7766eee`** — twelve packs speak four rungs under the 2026 ≡ fallback law (byte-identity of the fallback text pinned per pack; serverless two-voice {16,26}-only starved at the middle rungs — disclosed; object-storage 1998 degrades BY DESIGN).
- **L-CP3 @`5d0577b`** — ADR-0018 1b: `campaign/chapters.ts` BARREL-LESS (zero export names) Prologue 3 + Act I 8; 2 chapters ride the §1.2 perspective seam via UNregistered `runScenario`; 9 archetypes Endure 27%; cashFloor 1e15 / 300Mµ$ bridge; Act-I ledger 8/8 win-as-authored; +17t; self-derived goldens `28df3ca4e6c90977`/`6df9dedc702c2657` + `352_164_000n`; DEFERS named: succession UNEXERCISED (no in-shape death doc), `composeSignalRows` RangeError GUARD TICKET, `-above` predicates strictly-greater (pinned).
- **L-ER-G @`949ebd1`** — collector: 14/14 packs census PROBE-DERIVED — 42 era keys / 29 pool / 18 flip (fan E overcount adjudicated); `packs.test.ts` widened; README era clauses; `flavourFeed.ts`/`eraState.ts` stale comments cured.
- **Closeout @this commit** — `docs/adr/0018-owner-rulings-session-9.md` AUTHORED (program-lettered bullets 1a–1d matched to the on-disk citation inventory — zero numbered #N existed to honor); hosting_game.md twelve edits (ONE marker: §1.2 ❌→🔧 + dated v0 law-note; :55 wave-24 rewrite; §9.13 seventh-gate rider; §0.4/§7.12/§7.15/§7.16/§9.1×2/§9.4 riders; appendix uplift; WAVE-24 tail); MODULE-STATUS full sweep incl. NEW campaign row + gate-slice G7 + era/host/proto re-pins + footer WAVE-24 block; DECISIONS-PENDING session-9 blockquote + 8 fresh asks + two PAID dispositions; API-REFERENCE ruleCarriers legs ×6; comment-only cures (`coopRoomWire.ts` stale no-auth/fault-frame header, `tools/host/README.md` carrier-pointer, `tools/transport/README.md` auth rung update); specLine re-anchor (see Findings).

### Battery (ONE authoritative set at the wave-24 tip `949ebd1` — the push ceremony re-runs the full set)

| Gate | Result |
|---|---|
| sim-core full serial | **178 files / 3,368 tests, exit 0, ZERO pre-existing goldens moved** (+169/+9 files across the chain: G7 41, campaign 53, perspective 42, settle 27, era-canon 6 — components sum EXACTLY) |
| proto full serial | **106 files / 1,188 tests ALL GREEN** (1,121→1,150 L-THIN +25 + era pins +4 →1,188 G7 panel +38; worker SHA-IDENTICAL) |
| per-directory re-pin | pipeline 855/48 · waves 233/15 · scenario 472/8 · campaign 53/4 · save 185/7 · loader 148/9 |
| relay / transport / host | **42/42 · 91/91 · 36/36** (host 19→36 L-AUTH) |
| headless | **53/5 — parity real `b0162ab5` / stub `a9b4b7b8` HELD** |
| api-verify | **PASS — 1,740 names, 17 modules + types** (campaign +25 leg @`e1ada9d` → 1,727, perspective +13 @`9a4d796`; zero closeout delta) |
| ci-verify | **5/5 PASS** |
| `pnpm -r typecheck` | **8/8 Done** |
| canary | **PASS — 149 files** |
| content validate | **exit 0 — bundles=14 / waves=14 / packs=14 · 412 `_todo` + 16 pack markers** |
| vite build | **sim.worker 931.60 / fakeWorker 544.10 / index 1,657.34 / CSS 102.99 kB** |

### Census — ONE marker moved

✅321 · 🔧1,012 · ⚠️0 · ❌2,226 · 📝30 = 3,589 — the wave moved ZERO type/feature markers until this closeout flipped §1.2 "Perspective-shift levels" ❌→🔧 (perspectives v0 LIVE as a constrained composition; the flip is honest ONLY with the 14-verb ceiling + canExecute wall in the same law-note — they are). Disk-confirmed by the code-unit heading-scan method at this commit.

### Findings disposition (joint review F-1..F-7 — zero critical, zero major)

- **F-1/F-2 (attribution riders)** — LAND in this closeout: the proto-row chain and the footer now attribute per-leg (L-THIN +25 / era pins +4 / G7 +38; era-canon +6; per-leg attribution in each commit body), and the hosting_game WAVE-24 tail records the process disclosure — mid-wave registers had aggregated attributions the review wanted split.
- **F-3/F-5/F-6 (doc-currency legs)** — CARRIED by this sweep: MODULE-STATUS re-pin (host 19→36, scenario 430→472, save 158→185, loader 142→148, pipeline 834→855, proto 1,121→1,188, era gap row SUPERSEDED, gate-slice six→seven), API-REFERENCE ruleCarriers legs, and the three stale comment headers (`coopRoomWire.ts` double-open/no-auth clauses, `tools/host/README.md` auth-by-omission pointer, `tools/transport/README.md` deferred-auth rung).
- **F-4 (G7 ghost-hues #b49ce8/#9aa7b8)** — NOT ratified by this closeout: recorded in ADR-0018 1c and the fresh-ask register as "panel hues pending owner ratify"; the two tones stay PLACEHOLDER veil/silence tints, off the Hue Ledger, awaiting owner taste. (Precedent: hue law allows NO unlisted literal — these are panel-local CSS vars the law scan tolerates only because they are off-canvas; a ledger job must be authored or they get re-skinned.)
- **F-7 (root-npx vitest gotcha)** — RECORDED for future lanes: bare `npx vitest` at the repo root resolves a stray **vitest 5.0.5**, not the workspace 4.x — run via `pnpm -F <pkg>` or from the package dir (also in ADR-0018 Source).
- **SpecLine drift (closeout-emergent)** — the hosting_game §0.4/§1.2 insertions shifted the file +4 above §1.5 while cited headings already sat +12 off (pre-existing slow drift); the [c−12, c+12) windows tipped and 31 scenario/campaign witnesses reddened. CURE: all 26 §1.5 heading citations re-anchored to TRUE current lines (+16) across `scenarios.ts` (30 specLine + comment cites), `chapters.ts` (13 + 2), `perspective.ts` (5), + 5 test literal pins — sanctioned ±12-exceeded cure, every touch reported; `src/scenario` + `src/campaign` = **525 passed** green again, and the MODULE-STATUS scenario-row cites bumped in the same pass.

### Owner state after this wave

The session-9 agenda (1a–1d) is SPENT. The wall is now a FRESH-ASKS register of eight (canExecute hook, composeSignalRows guard ticket, succession death-doc, mechanics-on-era program, G7 mainline-runner adoption, G7 ghost-hues, trace player-follow-on, R66 bundle-dating). The fifteenth-card STOP holds; co-op transport production build stays out-of-repo (the contract is written — that is the in-repo obligation discharged).

### Program status

**Wave-24 is the DEPTH wave the type-program stop pointed at: eras, campaign, a seventh gate, and the multiplayer production path all advanced WITHOUT touching the settled surface** — zero new verbs paid at the door (census 46 stands), zero digest goldens moved, one marker flipped. The program now plays: four eras speak through fourteen packs, nine chapters walk an Act-I campaign through settlement and succession law, rule carriers pay hands beside player verbs under an opt-in rail, and the PHP carrier owns a contract it can be audited against. Next walls are owner-shaped: Act II commissioning, canExecute design, mechanics-on-era design, and the playtest backlog (G1 numerics still unratified).

## WAVE-25 closeout — session-9 SECOND ruling "go with recomendations": the FULL-POWER wave — the canExecute door hook BUILT and perspectives rode it to 19/19 the same wave, the first authored company death + succession LIVE, era mechanics PILOT (the available-tech leg), Gate 7 on the mainline runner, the CARRIER-CONTRACT turned EXECUTABLE, the hue/ratify batch landed, and bundle dating became a QUOTE-ONLY law (2026-10-18)

**Context.** Wave-24 ended at a fresh-ask register of eight. The owner's second session-9 ruling — verbatim "go with recomendations" — consumed ALL EIGHT per recommendation. Nine build lanes ran atop `7c2a13e` to tip `22717d2` (a828379 L-CE · 075a840 L-GUARD · df05b7c L-TP · f5faced L-DATES · 7fed0c4 L-RATIFY · 817c82c L-PERS · 9748ee4 L-G7M · e060e97 L-CP-A2 · 22717d2 L-EM); the joint review returned PROCEED 9/9 PASS and the battery re-ran EXACT. NO new hosting type (the fifteenth-card STOP holds), NO new door verb (nineteen stands), ZERO pre-existing digest goldens moved. **Incident #6 (program record):** mid-review an EXTERNAL process pushed the entire chain `7c2a13e`→`22717d2` to origin — fast-forward-valid, our exact content, the sixth such anomaly in the program record; ADR-0019 is consequently the program's FIRST ruling record authored POST-push, the ls-remote-before-push law held throughout, nothing was clobbered, and the ceremony proceeds against origin already at the build tip.

### Ledger (by lane)

- **L-CE @`a828379`** — ADR-0019 program 1: the `canExecute` host hook BUILT — a general verb gate consulted on EVERY verb-carrier entry (G7 translated carriers included, with carrier attribution) AFTER resolution and BEFORE hands pay; refusal keeps state object IDENTITY (unpaid, untouched rails); the host's reason lands VERBATIM (the door mints no code — the 46-phrase census rode UNPAID); a throwing hook propagates fail-loud; absent hook = byte-identical door. +30/+1 file; api-verify +2 (`ExecuteQuery`/`ExecuteRejection`); the seam three later programs immediately rode.
- **L-GUARD @`075a840`** — ADR-0019 program 2: the `composeSignalRows` chargeback crash CURED AT THE CAUSE — the step-8.5 mirror cash leg postEntry'd OUTSIDE both insolvency guards (the fold's catch-and-void and the opex pre-check), so an hourly-dunning dice roll into `[0, fee)` crashed bridge seeds verbatim `economy/buckets: chargeback cw-04: -20000000 µ$ on free (had 993070 µ$) would go negative`; the bankroll-row hypothesis was REFUTED first (rows doc-authored, fee cfg-owned). Fix = refuse-not-overdraft, the tickFold opex law reused VERBATIM (same `<` boundary — free == fee pays); `chargebackFeeRefusals` rides ScenarioReport SPARSE (absent ⇒ old report shape byte-stands); falsifiers BOTH directions (bridge 5-offsets crash→win@200 with EXACTLY 1 truthful refusal cw-04@14400; authored-opening inert — end digest `8bc901aa8a17facc` EQUALS the pre-fix worktree capture); event legs stay truthful (notice census, $2.10 rating, chargebacksApplied — the trace drops no wave); NOT a clamp (free == cashEnd pinned), NOT guardrail-arming; +5/+1 file; scenario 472→477.
- **L-TP @`df05b7c`** — ADR-0019 program 7: CARRIER-CONTRACT §4.1 turned into an EXECUTABLE GATE — the TS trace-player parses the doc's 57-line JSONL fence AT TEST TIME (fail-loud on fence drift; the block, not prose, is the complete authority) and drives the REAL relay hub over the synchronous TransportPort — no delay model, no pump ceremony the trace never had; 27 out-frames byte-equal in GLOBAL fan order (§4.4 law); `synth:auto-leave-on-close` owned (a resend the hub must never see); the §4.3 witnesses verified (log=4, lastStamp(7,3), ledger bytes omit-when-unset); `timelineDigest` `de1d4c0f941333eb` pinned; two-run determinism; the Alice view-rider leg self-derived (prose ellipsis is not authority); falsifiability proven by THREE reverted doc-mutation probes (each fired red; doc restored byte-identical); the src/ 8-file roster untouched; transport 91→100.
- **L-DATES @`f5faced`** — ADR-0019 program 8: era dating as QUOTE-ONLY LAW — a bundle date lands ONLY where a dated doc sentence is quoted verbatim in the consuming `_todo`: exactly ONE date moved (colo null→'2001', the §0.4 grid sentence '2001 dot-com colo'); shared-web KEEPS 2009 and its `_todo` now records the §9.1 'shared hosting (2003)' divergence RECORDED-not-resolved (shelf-vs-genre authority); four verdict-appended nulls (object-storage/serverless/ci-build-farm/exchange-colo — each verdict explains why NO date is quotable), eight untouched nulls; `era-dating.test.ts` 12 its = the REAL eras.ts consumer over the shipped corpus — explicit SHELF_CITES anti-forgery map (a dated bundle without its quoted sentence THROWS; regex prose-pairing was ABANDONED for apostrophe mispair), walk laws 1998=[]/2008=[colo] ONLY (pre-introduction EXCLUDES even opt-in), DECLARED_ABSENT frozen cites + cite-verbatim-in-pack-on-disk drift check + in-memory forgeries + vacuity probe; the real-content live2010 pin RE-CUT [shared-web]→[colo,shared-web] (data-state pin, disclosed); +12/+1 file.
- **L-RATIFY @`7fed0c4`** — ADR-0019 program 6: the hue-ledger + ratify batch — `rule-ink` 0xb49ce8 becomes the ledger's SIXTEENTH job (NOT in ALERT_HUES — DOM identity per §7.14 Ghost Hands; hueVars projection auto-emits `--hh-hue-rule-ink`); G7's off-ledger plate `#9aa7b8` RETIRED to `var(--hh-hue-grey)`@88% — the retired literal had shipped an UN-AUDITED 4.20 contrast FAIL, @88% lands 4.92+ (82% would fail the acc-label at 4.45; the floor never moved); the spare plate's green FILL wash (3.36/4.02) became a green STROKE frame (6.18); the ghost-curve trough .62→.68 (quantized steps(2,end) rendered a 4.45 dip — now 4.65 min); tape .92 composite 5.29+; a prefers-reduced-motion guard was ADDED (disclosed judgment call); the `DECISION_*` playtest consts RATIFIED at 3 sites (values byte-ident, e2a1bba label grammar); `g7Hues.test.ts` 23 its live-PARSES pct/trough/tape-dim from source (the law is a FLOOR, not a number) + era-tokens drift-pin + armed literal-probes + legacy-0.62 falsifier; decisionLaw +1 source-pin; DISCLOSED: G4GatePanel keeps its OWN `#9aa7b8` plate-mix (wave-24 F-4 named only the G7 pair) — unification is a fresh ask; proto +24/+1 file; `pnpm -r typecheck` 8/8 (test-file typing fixes: cwd-based readFileSync, noUncheckedIndexedAccess guards — proto has no @types/node).
- **L-PERS @`817c82c`** — ADR-0019 program 1 (the generalization): perspectives at FULL POWER — the v0 tape machinery DELETED (`canPlaceDevice`/`canAdjustPrice`/`canSellOffer`/`canNegotiateTerms` wrappers + `PERSPECTIVE_REJECTION` each rode the seam they were invented for; the 5-verb ceiling is history); bans now grow the general `canExecute` gate as an OUTER veto with frozen reason `perspective-forbids: "<id>" does not execute "<verb>"` (a HOST string — the 46-census rode UNPAID); zero-ban rows grow NO key (host hooks ride by identity); non-banned verbs CHAIN the prior handler; `carrier ≠ null` always DELEGATES (the Apprentice author-and-delegate law §1.2 :1482 keeps junior execution alive); `lookupPolicyCard: null` KEPT as the separate SIGHT axis (visibility ≠ dominance — argued in the header, bannedVerbs never leaks it, pinned); the five-seat roster is now SPEC-COMPLETE with doc grounds — noc-shift 3 [place/connect/disconnect] :1209/:1267 (communicate taxed-not-banned :1271, shed=triage lives), datacenter-tech 15 :1211 (allowed place/connect/disconnect/toggle), support-queue 17 :1212/:1379 (allowed communicate=dispatch, toggle), apprentice 16 :1214/:1478 (allowed policy-card-commit/communicate/toggle — communicate KEPT against the campaign's x4 assert-executes authority, tension disclosed IN the row), red-team-friday 0 (goal-inversion is data); `PERSPECTIVE_BANNABLE_VERBS` = all 19 = `PLAYER_VERBS`, the `not-coverable-v0` fate arm RETIRED, the 5×19 `PERSPECTIVE_EXPRESSIBILITY` re-pinned all-decision; perspective.test 42→52 its (LIVE door sweep: forged all-19 ban → exact reasons + state IDENTITY + prior-zero-calls; ban-outranks-tax arm — `perspective-forbids` not `attention-debt`, no pool touched; noc/datacenter/apprentice/support LIVE seat witnesses); era availability chains AFTER us (composition law in the docblock); api-verify INERT (zero export-name delta).
- **L-G7M @`9748ee4`** — ADR-0019 program 5: Gate 7 rides the MAINLINE runner — `SimCoreRunnerOptions.rules {lookupPolicyCard}` is a RUNNER OPTION ONLY (no boot field — PROTOCOL v1 untouched; the `boot.rules` arm RECORDED owed — production stays UN-ARMED by decision, no panel passes rules yet); armed = `ruleCarriers: "mapped"` + rule phase + re-feed tick+1 player-first (`RUNNER_PLAYER_SEQ_FLOOR = 1000` rides the M4 band); rule-fired detail = ruleId — ZERO new NoticeKind/wire; OFF-PATH PROVEN: boot goldens `ca8863849cb3db32`/`780b1cbc61dff760` + money `25_005_307_300n`/`25_109_732_500n` HOLD ARMED, 4 frames byte-equal off≡on; on-path frame-7 fire → frame-8 execute, hands-exhausted shared-pool witness, the failover wall crosses, ×2 twins determinism; worker chunk +12.68 kB HONEST (the rule phase enters the worker graph); proto +14/+1 file (`simCoreRunner.rules.test.ts`). (Commit body EMPTY — reviewer F: the gate/probe trail lives in code + this ledger.)
- **L-CP-A2 @`e060e97`** — ADR-0019 program 3: CAMPAIGN ACT II authored (7 chapters, tiers 3–4, "process to prevention") — the program's FIRST COMPANY DEATH in-run: `b-4 the-hardest-lesson` loses via `death-by-cause:any@73` on an mrc-0-live-customer FLOAT death (the death is ENGINE truth — the falsifier bridge survives on a 600 Mµ$ bankroll); SUCCESSION LIVE through a real settlement ledger: the failure_restart edge carries a NULL-CASH slice, the manifest spends at b-5 (a museum-marker RE-SPEND THROWS); `b-6 noc-shift` wins @30 with the full-power perspective seat banning through the REAL door; `b-7 chargeback-wave` RE-HOMED from the deferred guard wire and wins @200 with EXACTLY 1 refusal (the L-GUARD guard discharged in campaign); the 18-chapter tour laws extended (tier law NEW, seat gaps 6/6, Endure 2<30%, 7-of-12 proportionality + the §1.9 per-act-floor vs every-5-cadence tension recorded as an owner-taste row chapters.ts:475); PERMANENT WALLS recorded as re-ride gates (covenant/review-bomb cannot die on their wires; change-freeze/threshold-day win UNDEAD; the ransom corpus-wall); campaign 53→63 its, Act-I ledger 8/8 UNMOVED; three self-derived digests `d31af220a83033ce`/`86595ae9b21853b3`/`18ef1b5675d0ea27` (witnesses are RELATIVE — trail lines, not pinned authority). (Commit body EMPTY — reviewer F; trail lives in code + this ledger.)
- **L-EM @`22717d2`** — ADR-0019 program 4: the era-mechanics PILOT — typed `eras.availability {techId: {from?, to?}}` authored in bundle JSON (YearString law mirrored, per-row source provenance), resolution ladder row → bundle-date → undocumented-allowed (the NEVER-GUESSES law); `scenario/eraAvailability.ts` is the OUTERMOST chain (`eraVerdict ?? inner` — zero-gate-no-key byte-stand); card-grey via the WRAPPED `lookupPolicyCard` (`unknown-card-hash` refusal); the carrier law DIVERGES from perspective law BY DESIGN (era is a WORLD FACT — it fires on rule carriers; the apprentice exemption is a seat law — pinned as designed asymmetry); runner `eraYear` + `eraBundle` PAIRED (`BAD_ERA`/`BAD_INT` walls), run-frozen, composition order freeze → perspective → **ERA-LAST**, report grows sparse `era{}`; `eraYearAt` named as the v0-constant TRANSITIONS seam (R66); ONE shipped availability row colo from-2001, ZERO `to` legs anywhere (retirement = forged fixtures only — the never-invents discipline); wire #31 `the-not-invented-yet` (specRef law widened to §1.6/§0.4): eraless wins @240, the 1998 arm refuses BOTH shared-web placements PRE-PAYMENT from @20 ×5 while the generic box still slides in, the 2026 arm byte-identical to eraless, a mid-run clone shows executed1/refused1, the cross-line colo-1998 arm untouched; host `--era [--era-bundle]` arms the plan (count-neutral; absent ⇒ byte-identical); `packs.ts` touched TYPE-ANNOTATION-only (runtime zero-delta verified); loader +16/+1 file (`era-availability.test.ts`) + scenario +29/+1 file (`eraAvailability.test.ts`); api-verify +7 (loader 3: `LoadedTechWindow`/`TechAvailability`/`resolveTechAvailability`; scenario 4: `EraPlan`/`composeEraPlan`/`applyEraAvailabilityToDoorConfig`/`eraRefusalReason`); content `_todo` 412→413.
- **Closeout @this commit** — `docs/adr/0019-owner-rulings-session-9.md` AUTHORED (programs 1–8 matched to the on-disk citation inventory — post-authoring re-grep: EVERY cited form lands on a Decision bullet); hosting_game.md TEN edits ALL body text (:55 wave-25 status rewrite + §1.2 SUPERSEDED full-power rider + §0.4 available-tech-leg rider + §1.6 retirement-machinery rider + §1.9 Act-II proportional-slice rider + §9.9 succession-LIVE rider + §7.14 rule-ink/ghost-plate rider + §1.4 CI-card b-7 re-home rider + appendix uplift para + WAVE-25 re-markup tail) — **markers MOVED ZERO**; MODULE-STATUS full sweep (pipeline 885/49 · loader 176/11 · scenario 516/10 + ceiling-RETIRED clause + wire #31 · campaign 63/4 + Act-II tail · content 413 · transport 100/8 · host `--era` · proto 1,226/108 chain · door row canExecute append · NEW canExecute + era-pilot gap rows · footer WAVE-25 block PREPENDED); DECISIONS-PENDING session-9-SECOND blockquote + all EIGHT wave-24 asks flipped CLOSED with SHA cites + the SIX fresh-ask register; API-REFERENCE perspective section rewritten to the full-power gate semantics + banned-verb table + `ScenarioReport` `era?`/`chargebackFeeRefusals?` sparse keys + contract-#2 G7M re-feed clause; comment-only riders (perspective.ts's two dangling "shared HUD-utility law" pointers CURED to name the actual roster-head family→verb mapping law; eraAvailability.ts:8 `program-4` hyphen normalized to the house `program 4` cite grammar); the five TEXT-true absolute anchor pins in `chapters.test.ts` re-cut to measured shifts (+4/+4/+4/+14/+8) — the sanctioned wave-24 cure.

### Battery (ONE authoritative set at the wave-25 tip `22717d2` — re-verified after this closeout's doc edits; the push ceremony re-runs the full set)

| Gate | Result |
|---|---|
| sim-core full serial | **183 files / 3,480 tests, exit 0, ZERO pre-existing goldens moved** (+112/+5 files over wave-24: L-CE +30/+1, L-GUARD +5/+1, L-DATES +12/+1, L-PERS +10/+0 (perspective 42→52), L-CP-A2 +10/+0 (campaign 53→63), L-EM +45/+2 — components sum EXACTLY) |
| proto full serial | **108 files / 1,226 tests ALL GREEN** (1,188→1,212 L-RATIFY g7Hues 23 + decisionLaw 1 →1,226 L-G7M rules 14; worker +12.68 kB the honest rule-phase leg) |
| per-directory re-pin | pipeline 885/49 · loader 176/11 · scenario 516/10 · campaign 63/4 · transport 100/8 |
| relay / transport / host | **42/42 · 100/100 (+9 L-TP) · 36/36 (--era arms, count-neutral)** |
| headless | **53/5 — parity real `b0162ab5` / stub `a9b4b7b8` HELD** |
| api-verify | **PASS — 1,749 names, 17 modules + types** (+2 pipeline L-CE → +7 loader+scenario L-EM; L-PERS INERT; zero closeout delta) |
| ci-verify | **5/5 PASS** (api-verify · content-validate · canary · proto-build · g5-mirror-diff) |
| `pnpm -r typecheck` | **8/8 Done** |
| canary | **PASS — 150 files** (149→150: `scenario/eraAvailability.ts`) |
| content validate | **exit 0 — bundles=14 / waves=14 / packs=14 · 413 `_todo` + 16 pack markers** (README Key-literals 123 UNCHANGED) |
| vite build | **sim.worker 949.91 / fakeWorker 547.26 / index 1,664.68 / CSS 103.06 kB** (vs wave-24's 931.60/544.10/1,657.34/102.99 — the rule phase + era seam ride the worker; L-RATIFY's +0.55/+0.50 CSS legs included) |

### Census — ZERO markers moved

✅321 · 🔧1,012 · ⚠️0 · ❌2,226 · 📝30 = 3,589 — nine build lanes touched no heading markers and all ten closeout riders are BODY TEXT (insertions verified off heading lines; heading-scan recount on the final tree). The §1.2 "Perspective-shift levels" 🔧 earned at wave-24 now carries FULL-POWER copy (the v0 law-note rides under a dated supersession rider; the heading law itself stands — perspectives have been mechanics since `9a4d796`).

### Findings disposition (joint review — PROCEED 9/9 PASS, zero critical, zero major)

- **Hygiene minors LAND in this closeout:** the `program-4` hyphen normalization (eraAvailability.ts:8), the two dangling "HUD-utility law" pointers (perspective.ts :294/:335 — they named a law that does not exist; cured to the actual roster-head family→mapping discipline), and the wire-#31 prose line cite corrected :4588→:4572 in the MODULE-STATUS scenario row (matches the `specLine` constant in scenarios.ts; the ±12 window holds either way).
- **Empty-commit-body disclosure (reviewer F):** `e060e97` + `9748ee4` landed with EMPTY commit bodies — their gate/probe trails exist in code + this ledger + ADR-0019 only; this closeout read both full diffs to write the record.
- **Phantom-hex note:** `6aecd417c317a910` / `38e72c42b0f0e20b` (era-probe digests) appear ONLY in runner.test trail lines — self-derived witnesses relative-by-design, kept, and recorded here so no future reader hunts them on disk.
- **specLine audit (closeout-emergent, NO wave-24 repeat):** hosting_game insertions land +6 net inside the cited ±12 windows → ZERO doc-cite re-anchors; only the five absolute TEXT-true pins in `chapters.test.ts` moved (+4/+4/+4/+14/+8, empirically measured) — cured, scenario+campaign+loader serials green again (516/63/176).
- **Incident #6** — recorded in Context above and in ADR-0019 Consequences: the program's first post-push ADR; discipline laws held (ff-valid content, ls-remote verified, ceremony resumes from origin==tip).

### Owner state after this wave

The session-9 SECOND ruling is SPENT eight-for-eight; the wave-24 register is fully dispositioned (CLOSED ×7, PILOT-CLOSED ×1). The live wall is the SIX fresh asks (G4 plate-mix unification · apprentice×communicate strict-alternative · Act-II→full-12 seat-floor cadence · era TRANSITION mechanics at the `eraYearAt` seam · `boot.rules` proto arm · era-probe relative witnesses recorded). The fifteenth-card STOP holds; three era legs (threats/costs/customer-base/lattice) stay UNCOMMISSIONED design; the playtest backlog (G1 numerics, OD-10/12 pixel/60s/40-glyph) stands.

### Program status

**Wave-25 is the FULL-POWER wave: every v0 ceiling wave-24 named is now broken or has a seam.** Perspectives ban all nineteen verbs through a general gate the same wave built; the campaign has its first real death and its first real succession; era mechanics crossed from copy into the door on the available-tech leg; the rule automation rides the mainline runner; the PHP carrier's contract answers to CI; and dating is a law with one quoted date. Zero new verbs at the door, zero pre-existing goldens moved, zero markers moved — depth again, on a surface the program refuses to widen without a ruling. Next walls are owner-shaped: era transitions, act completion, the playtest backlog, and the G4 grey.
