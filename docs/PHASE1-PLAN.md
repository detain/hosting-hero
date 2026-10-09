# PHASE 1 PLAN — The Six Prototype Gates

**Mirror of:** `reports/MASTER_REPORT.md §7` (RATIFIED scope, `hosting_game.md §9.13`, owner decision R-7). This file expands §7 into working-plan shape; the report remains canonical.
**Citation convention:** a bare `§N.M` = a section of `reports/MASTER_REPORT.md`; any reference to the original design doc is always written `hosting_game.md §x.y`.

**Progress legend (updated 2026-10-09):** ✅ = completed & CI-green (annotated commits on `master`; tip `f41e20f`, release tag `v0.2.0` @ `ee36e78`, phase-1 tag `v0.1.0-phase1` @ `589b41b`). ⏳ = built but awaiting owner decisions/first-mount. 🚧 = not yet built. Full post-plan wave ledger at the bottom.

## RATIFIED 2026-10-09 (owner decision session) — ledger & execution queue

The owner ratified the decision ledger (memory block `hosting-game-ratifications-oct9` is the authoritative copy). **Decisions are law now; the execution below is the remaining build.**

### Decided & recorded (no code owed beyond the queue)

- ✅ **OD-1** scorecard = commitment-convergence (C-set active, conversion axis displayed leading) — *code flip is queue item 2*
- ✅ **OD-2** Sheet **B** canonical; **month stays 7 real-min** (the 4-min flip declined; shipped default already correct — ✅ resolved, no code)
- ✅ **OD-3 = option (a): KEEP ~200 MECHANICAL THREATS** *(owner override of the fleet rec — the Codex-pruning path was rejected)*. Consequences as binding law: fairness-validator scope = every registry threat gets a counter; §9.6 "every new threat creates a visitor/conversion reason" is the pacing valve; Versus draft pools stay wide; art FX-pairing budget scales.
- ✅ **OD-4 batch**: 4a Triage Window + Attention Grace ratified, focus-hand as **bounded loan**; 4b telegraph bands canonical **+ `metricNamespaceTier` bundle field**; 4c reconciler = **separate card type, deferred unlock** (v1 reflex-only); 4d **grammar FROZEN** as spec artifact — extensions only by owner decision event; G7 cooldown lands as a **bought verb, never a clause**. → all four recorded in queue item 1 (ADR-0009).
- ✅ **OD-5** = (b) TS-portable-library (queue item 9: ARCHITECTURE §10 flip)
- ✅ **OD-8** = Matrix **B** — scenario/daily/consultant/blitz flip LIVE; **endless's 32 rows stay PENDING** (contested) — queue item 3
- ✅ **Q-P3-1** defensive reading confirmed (shipped code already correct — ✅ done, record only)
- ✅ **F-2** shed-terminates confirmed keep (shipped `2eaf830` — ✅ done, record only)
- ✅ Pack volume over-cap (98/75) ratified (content-packs README note — queue item 9)
- ✅ **T-9** racks = **degrade-all + anchor joins members** (queue item 5 — behavior change, goldens re-cut deliberately)
- ✅ **Versus** rows: card lookup **flips to content fingerprint** (queue item 6); weightBps=cost / affixes inert / pool 10 / tie law all keep (record)
- ✅ **Economy**: ~25 ms steady floor accepted; prune stays OFF; **register batch-API APPROVED** (queue item 7); snapshots-reshape + rec#4 deferred; scaleEvent stays declined
- ✅ **Substrate** `BUDGET_CAPS.substrate: 1200` SIGNED + authored-patches law + 4 taste rows (queue item 4 — tripwire flips red→green)
- ✅ **CI** matrix: drop Node 20.x → **22.x + 24.x** (queue item 8)
- ✅ **Tag policy**: next tag **v0.3.0 = end of this calibration wave** (queue item 11)
- ✅ **ADR-0008 residue**: devtools doc-only row; `@pixi/node` pixel-audit deferral CONFIRMED until real atlases (queue item 9)
- ✅ **OD-13** save-trust = client-authoritative + periodic notarization (SP) — RECORDED; implementation is a later save lane
- ✅ **OD-6** hands = one pool, **two denominations** — RECORDED; implementation is a later design lane

### Still OPEN (deliberately not decided today)

OD-7 accounting menu · OD-9 co-op save ownership · OD-10 clock instruments/speed target · OD-11 ship order · OD-12 render bits · **OD-14 canon count** (tension: OD-3-(a) keeps threats wide; type-count still un-settled) · **OD-15 incl. D-7 storm-cap** (the one engine answer still owed) · OD-16 mode-tiering batch · OD-17 ICS model · OD-18 lookalike mandate · OD-19 mastery arc · OD-20 misc wording · coverage taste rows (#12 incl. `CoverageSummary` rename) · unattended thresholds + `canSettle()` (#13) · audio envelope audition (#15) · era expansion (#17) · Triage-Window/focus-hand *implementation* (ratified as law; the engine slice is a design lane, not this wave).

### EXECUTION QUEUE (this wave — remaining build, ordered)

1. ⬜ **ADR-0009** — `docs/adr/0009-owner-ratifications-calibration.md`: record OD-4 (a–d) + freeze law + G7-as-verb + OD-3(a) consequences + all §"RATIFIED" rows above, ADR house format (Status/Context/Decision/Consequences/Source), Accepted 2026-10-09.
2. ⬜ **Calibration flips** — `waves/pressure.ts:104` `ACTIVE_TUNING_SHEET = "B"` (+ sweep B-is-law PROVISIONAL tags, keep genuinely-silent ones) · `economy/scoring.ts` `defaultScorecardConfig.active` → the C candidate + conversion-axis display note · re-pin every test that pins the throws (`waves/pressure*`, `economy/scoring*`, `gate-g5` OD-1 pins — keep both-fork grading as data, add the now-resolvable default) · confirm no digest-golden depends on either (config resolution is not sim state).
3. ⬜ **OD-8 flip** — `save/modes.ts`: 128 rows (scenario/daily/consultant/blitz) → LIVE per matrix B; endless 32 stay `PENDING_OD8`; re-pin `save.test.ts` OD-8 group (currently asserts 160 pending + throws naming OD-8).
4. ⬜ **Substrate cap** — `render/budget.ts`: widen `BudgetCategory` += `substrate`, `BUDGET_CAPS.substrate: 1200`; the seam self-activates (`substrateCategoryMetered` flips true); flip the `substrate[category-pending]` pins to admit-path expectations; substrate README + MODULE-STATUS gap row → SIGNED; authored-patches law sentence lands in README+GLOSSARY.
5. ⬜ **T-9 degrade-all** — `topology/domains.ts`: rack domains `deathModel: "degrade-all"` + rack anchor joins `members`; blast semantics follow (§7.12 language: power=red kill, rack=amber degrade); re-cut the rack-pin tests (`PINS rack deathModel = kill-all` test flips deliberately) + any blast ×100 digest pins in `topology.test.ts`; sweep consumers (`redundancy.ts`, G4 panel badges) for rack-death assumptions; full battery — this is the highest-blast item.
6. ⬜ **Versus card-hash** — `versus/match.ts` `lookupPolicyCard` default keying → content fingerprint (ruleBookHash-style fold of card payload; `DefenseDeck.policyCardHashes` semantics doc), test + API-REFERENCE row.
7. ⬜ **Economy batch-register** — small API making 1k-contract setup O(n log n) (the `sortedById` merge-insert already lands half of it); new export ⇒ API-REFERENCE rows + api-verify count grows (1270 → 1270+N) + barrel/root re-export + collision check.
8. ⬜ **CI matrix** — `.github/workflows/ci.yml`: `node: ["22.x", "24.x"]`, delete the 20.x `--filter` scoping hack, update `workflows/README.md` + root `README.md` engines prose honestly.
9. ⬜ **Docs currency** — `DECISIONS-PENDING.md` flip OD-1/2/3/4/5/6/8/13 records (+Q-P3-1/T-9/F-2/packs/versus/economy/substrate/CI/tag rows) with this wave's SHAs; MODULE-STATUS close landed gap rows + re-pin ALL counts (docs-currency discipline: serial vitest, never paste); this PHASE1-PLAN §Provisional-slots table → execution-complete marks; content-packs README volume-ratify sentence; ADR-0008 devtools doc-only row; ARCHITECTURE §10 OD-5(b) ACCEPTED.
10. ⬜ **Full battery + commit series + push + CI 3/3** (serial vitest; known fastForward wall-flake = re-run once, never edit the floor; goldens: config flips must not move digest pins — if one moves, STOP and re-audit, never casually re-pin).
11. ⬜ **Tag v0.3.0** at the green tip (annotated; peel==prep verify; codeload 200; tag-refire CI 3/3; v0.1.0-phase1/v0.2.0 history untouched except v0.2.0 stays @`ee36e78`).

### Ground rules for the executor (violating any = review block)

- Lanes must never commit; orchestrator/release lanes commit. `media/prompts/generate.mjs` + `sweep-models.sh` are a SIBLING SESSION's dirty files — **never stage/restore/revert**; NEVER `git checkout -- .`/`restore`/`clean`/`stash` (a lane once destroyed work this way).
- Blank/no-response agent lane = dead → resume same `task_id` with literally `continue`, 10× before anything else. An agent that repeats real content = alive/finished — give it the next instruction or close it.
- Battery commands + baseline: see memory `hosting-game-build-wave2`/`hosting-game-ci-lane`; @`f41e20f`: sim-core 1434/100 · proto 614/60 · headless 53/5 (parity `b0162ab5`/`a9b4b7b8`) · assetpack 48/5 · perf 20 · api-verify 1270 · canary 105 · ci-verify 5/5.
- Vitest 4: no `--reporter=basic`; timing tests contention-adaptive — "widen the clamp, not the floor".

## Governing law (§7)

Each gate is a **design question answered by a playable/runnable artifact in programmer art**; modes and structure are decided **by prototype, not by argument**. Phase 1 produces **zero shipped content, zero campaign authoring, zero render polish beyond the test itself** (§2.2 R-7). Open owner decisions gate *calibration*, never *kickoff* — noted per gate (§7).

## Provisional slots — RATIFIED 2026-10-09, execution in flight (queue above; this table was the fail-loud law's registry)

Four values every slice *touches* but nobody may hard-code. Each is rendered as a named config knob with a default that **fails loudly** rather than pretending to be settled. A slice reading any of these must resolve it from config at runtime; silently committing a literal is a review block. ✅ the fail-loud machinery itself shipped (`resolveActiveSheet()` / `getActiveScorecard()` / `writeGuard()` throw by design — `b7e262c`, `9e701a0`). **Owner has now resolved every row below — the flips are execution-queue items 2–3, not open questions.**

| Knob (config key) | Backing decision | Value | Status | What it gates |
|---|---|---|---|---|
| `scorecard.weights` | **OD-1** uptime-first vs conversion-first (report §6.1) | **RATIFIED: (c) commitment-convergence active** — availability scored against *sold* SLA; conversion-funnel axis displayed leading; G5 keeps both-fork grading as comparison data | ✅ decided → queue 2 | Which counter "wins"; the build order itself (report: needed *before WS-1/WS-7 freeze their build order*); G5 score screen; meta rewards |
| `tuning.sheet` | **OD-2** canonical sheet A / B / C (report §6.1; conflict table verbatim in report Appendix D) | **RATIFIED: Sheet B canonical** (sawtooth/wave laws already embed it); A → landlord-convention derivation later; C → realism-toggle data later | ✅ decided → queue 2 | G1/G5 numeric acceptance thresholds (ρ-knee session design, sawtooth `P(n)` tables), Ruleset Card baselines, tuning-harness CI, WS-3 bundle defaults; leaks into the bundle schema + policy upkeep field |
| `tuning.monthLengthRealMin` | OD-2 ride-along fix | **RATIFIED: keep 7 real-min** (`hosting_game.md §7.13` doctrine — the shipped `BUSINESS_SCALE_DEFAULT {43200n, 7n}` already implements it; Sheet B's 4-min value explicitly declined) | ✅ RESOLVED — zero code owed | Business-clock pacing in G5; any month-boundary arithmetic |
| `content.threatVisitorCensus` | **OD-3** ~200 threats vs ~45 visitors (report §6.1) | **RATIFIED: option (a) — keep ~200 mechanical threats** (owner override of the WS-3 pruning-rule rec); fairness-validator scope + counter authoring + art FX-pairing scale accordingly; §9.6 conversion-reason law is the pacing valve | ✅ decided (content-plan consequence, no engine flip) | G2's v0 deck-family count, WS-3 production plan, fairness-validator scope, Versus draft-pool width, Campaign scar table |
| `mp.topology` | **OD-5** MP host under browser-authoritative sim (report §2.2 / §6.1) | **RATIFIED: option (b) TS-sim-as-portable-library** (what the repo already scaffolds); Workerman stays services/transport/notary; co-op pause = server-vote | ✅ decided → queue 9 (ARCHITECTURE §10 wording) | Slices (d)/(e) ops shape, co-op pause authority, save-trust variant OD-13 (also ratified: client-authoritative + notarization for SP — recorded, later lane). **Did not block G1–G6** |

## P0 — Sim-core skeleton (§7.0) ✅ `2bc7e5e`→`9e701a0` (shipped in the v0.1.0-phase1 tag era, CI 3/3)

Not a gate; the ~3–4 week substrate every slice consumes. Build-order directive: **the sim core comes first because everything needs `observed_view` + RNG discipline** (§7.0).

| Piece | Source | Note | Status |
|---|---|---|---|
| Q16.16 fixed-point math + integer-µs event keys | WS-1 verdict Q1 (§4.1) | floats confined to display-only math that cannot touch replay | ✅ `ff3249f` (+ limb speed port `3466bdc`) |
| Counter-based RNG streams `(run_seed, domain, sim_minute, entity_id)` | WS-1 R-16 (§4.1) | director domain included (draws logged) | ✅ `ff3249f` (+ limbs `0e69e16` era `rng` rewrite, byte-ident oracle-pinned) |
| 12-step pipeline shell: named slots + **step-12 observed-layer single-writer** + **step-12.5 rule-phase slot** (empty interpreter OK) | §4.1 + WS-5 (§4.5) | the slot registry *is* the extension-point architecture | ✅ `8fd409a` |
| Ground/observed twin store + degenerate `observed_view(consumer)` projection fn | WS-1 R-66…R-72 (§4.1) + WS-8 day-one trio #1 (§4.8) | per-consumer param from day 1; ObservedCell as data type (§3.1); leak property-test hook stubbed | ✅ `55a6086` (60-seed leak property test real) |
| ReplayLog (append-only) + checkpoint ring + state-hash tripwire | §3.3, §4.1 | THE LONG SAVE = checkpoint + input tail — format adopted engine-side first | ✅ `b9295b5` (+ depth-cap/−0 fixes review-wave) |
| Input-log ingestion (clock-typed; pause-with-orders; arrival-order stamping) | WS-1 R-24…R-28 (§4.1) | Workerman input-message contract | ✅ intent door `8fd409a` + amendments `b1f757e` + drain `c253643` |
| `cause_id` on **every** state mutation incl. economic | WS-4 R4 (§4.4) | **unretrofittable** — enforced in the mutation API, not by convention | ✅ `ff3249f`/`b7e262c` (fuzz-pinned) |
| Web-Worker packaging + worker→main observed-delta channel (10 Hz batched) | §3.1 | renderer holds zero authority | ✅ `4ff4a4f` + real-runner adoption `1b9b3ba` |
| Runtime-neutral discipline + Node harness | WS-6 R2-restated (§3.4) | **dual-runtime CI gate lives from P0** — also the OD-5(b) demo | ✅ `48b56f2` (parity hh-parity-v2 `b0162ab5`/`a9b4b7b8`; real-slot swap `b4481b5`) |
| zod type-bundle loader + Ruleset Diff Linter skeleton; grammar-pack registry | WS-3 (Appendix A) + WS-5 (Appendix B) | schema freeze starts here (Appendix A is v0) — NOTE: hand-rolled strict parser shipped, not zod (`ef8f35e`) | ✅ `ef8f35e` (real corpus lint 0 findings `1553702`) |

Risk-register rows #1 (determinism), #4 (attribution `cause_id`), #6 (observed retrofit) are **P0 acceptance criteria, not warnings — done when the CI says so** (§8 register cadence). ✅ all three CI-enforced (determinism job `f870150`, expanded ×100 14-dir `cf7c7b0`).

## The gates

### G1 — Bounce loop: "The Agonizing Slider" (§7.1, WS-1 slice §4.1) ✅ `6f5da38` + panel `0a2f1ca`

- **Question:** is the ρ/(1−ρ) knee + bounce cliff *felt as a decision* when dragging one aggression slider? (hosting_game.md §9.13: one server, one defense, one slider; fun in 90 s or nothing matters.)
- **Scope:** one ingress (diurnal envelope + one scripted spike), one app node (S=8, 120 ms service), one stub DB (proves dependency blocking R-09), one defense with aggression slider (simplified ROC pair), bounce LUT `10@0.6 / 50@1.0 / 95@1.6`, integer-time DES + macro-tick hybrid, seeded 2-stream RNG, *degenerate* observed projection with one 30 s stale probe (**the seam exists day one**), replay log w/ checkpoint hashes, three outcome counters (served / bounced / false-positive-403). Est. ~2,500 LOC TS.
- **Acceptance:**
  - (a) ✅ **byte-identical state hashes across ≥2 runs AND across 1×/4×** (speed gates observation, never physics);
  - (b) ✅ never-touch vs max-slider lose **differently**, both legible (paranoia ladder monotone ×5 seeds);
  - (c) ✅ the ρ≈0.7 knee bend visible within a 90-second session (queue-curve suite + LUT anchors);
  - (d) ✅ dragging aggression trades amber-403 ghosts for catches **live on one screen** (panel; waste ≡ FP × 20 s fee pinned).
- **Calibration pending:** `tuning.sheet` (OD-2) for feel numbers only; `scorecard.weights` (OD-1) for which counter "wins" — the outcome counters exist regardless.
- **Failure branch (doc):** if the slider isn't agonizing, the core-loop premise is wrong before any art/money/policy exists — the cheapest possible kill-shot (§7.1). *Human playtest verdict still pending (engine-side answers 6/6).*

### G2 — Attack Surface Ledger (§7.2) ✅ `47b2c33` (ledger) + `6f5da38` + panel `0a2f1ca`

- **Question (hosting_game.md §9.13):** does *building* something visibly change what attacks you — is construction an attack-surface decision, not a stat bump? (P2: threats unspawnable until you build their invitation.)
- **Scope** (synthesized from WS-1 R-45…R-54 + WS-2 ledger/board primitives + WS-3 family-weight data; rides G1's board): shared-web line, one rack, ~6 buildables (web, DB, cache, auth, backup-agent, admin-port); the **Ledger view** = live diff of the threat deck (family weights from bundle data, WS-3 R34) derived from the player's construction log — adding the DB lights up SQLi/brute/vacuum-storm rows *before* the next envelope silhouette (telegraph bands, OD-4b wording, visible); removals decay entries toward grey "dormant" rather than deleting (history honest). Threat generation stays seeded: wave-table ids in ReplayLog. Minimal board actions (place/remove = WS-2's placement loop minus physical layer). ✅ 13/13 headless acceptance; ghost/haunting rows + retirement lag live.
- **Acceptance:**
  - (a) a first-time player **predicts the next wave from the Ledger alone** (no tutorial text; think-aloud test) — ⏳ human playtest;
  - (b) ✅ building/removing the DB changes the deck within one tick, provably deterministic — **same build sequence + seed → same deck diff ×100 replays**;
  - (c) ✅ every deck entry names its *invitation* (hover → the object you built) — the ledger is derived, not authored;
  - (d) honeypot case: apparent ≠ actual hardening shows in the Ledger as *apparent* — verified by two seeded runs differing only in deception — ✅ engine-side (deferred, zero-RNG demotion).
- **Pending:** OD-1 decides whether the "right" ledger play is leaving a door open for conversion vs closing everything (the ledger itself is fork-neutral); OD-3 bounds v0 deck-family count.

### G3 — Suspicion Dial, with visible false positives (§7.3) ✅ `6f5da38` + panel `0a2f1ca`

- **Question (hosting_game.md §9.13):** do players *agonize* over the inspection/aggression trade when the cost (amber-403s = paying customers bounced) is on screen?
- **Scope** (extends G1's board; WS-1 R-45…R-54 classification math + WS-7 amber form-law): per-node **Inspection Depth** slider (pass-through / sample 1-in-20 at 5% cost / inspect / challenge); sticky suspicion decay ~10 min; confidence composition `C = 1 − Π(1−cᵢ)`; `L = Σ lᵢ` contributions *never boolean*; aggression slider genuinely **moves the ROC curve, never a damage number**; false positives rendered as amber-403 ghosts *in the traffic lane itself* with a running "revenue bounced by mistake" ticker (the first HUD number); one tight-patience cohort (60 ms game-class guest) so FPs hurt cohorts differently; blind-spot honesty — upstream FP invisible until edge-logging purchase, one seeded run proves the blind spot is *learnable*.
- **Acceptance:**
  - (a) playtesters verbalize a *policy* ("I only challenge at peak") unprompted — ⏳ human playtest;
  - (b) the FP ticker is cited unprompted when asked "how's business?" — ⏳ human playtest;
  - (c) ✅ determinism: **identical slider-input trace → identical FP set ×100**;
  - (d) ✅ both failure shapes reachable and *feel different* (dial .4 vs .9: ≥40 deep-routed vs 0, equal damage arms — engine witness);
  - (e) ✅ **fog-automation teaser:** canonical-fold + sticky/decay lanes pinned through observed cells (S4).
- **Pending:** OD-15 D-7 (emergent-storm cap) constrains how hot G3's tail may get; OD-2 supplies final patience/cost tables.

### G4 — Drag-a-cable: board tactility (§7.4, WS-2 slice §4.2) ✅ door `8fd409a`/`b1f757e` + acceptance `6f5da38` + panel `0a2f1ca` (+ drain choreography opt-in `c253643`)

- **Question (hosting_game.md §9.13):** is the physical layer (rack ⇄ topology dual view + wiring) *tactile* rather than a menu?
- **Scope** (~2–3 eng-weeks TS, programmer art): one room, 2 racks × 42U, ToR each, A/B PDUs with **one shared-circuit trap seeded** ✅ (two-PSU-one-PDU modeled + tested `e2f69d3`); LB/web×2/DB/cache/storage populated; Rack⇄Topology views joined by **one morph transition** (Pixi-adapted: authored second face per R-1 consequence #2) — ⏳ morph is DOM/SVG panels today, true Fold animation awaits render mount; **drag-a-cable AND keyboard click-to-link producing bit-identical LinkObjects** (WS-2 R30 equality law, asserted by hash) ✅ engine-level digest+receipts equality; DATA ports + POWER assign-menu ✅ (kettle/psu slots, `slot-only-for-power` refusals); preflight refusals WRONG_SPEED/NO_FREE_PORT/trust-lite ✅ (26-code refusal census, socket grammar `e2f69d3`); magnetic snap + bounce-reject + physical Terms Card with live latency delta + attack-surface line (couples back to G2's ledger) ✅ terms card + live ladder per pointer-move; timeout bead carrying a **pre-seeded monotonicity violation** ✅ (`findTimeoutViolations`); placement loop with per-rack refusal icons + live amp bar + Broken-N+1 badge ✅ (topology + panel); miswiring allowed and hover-findable ✅ (blast flood); blast hover (flat flood + count + amber degraded + red ghost delta — flood over `TopologyGraph` + `DomainSet` via `blast.ts`, never the observed layer, memoized by the joint projection stamp `projectionVersion(graph, index)`) ✅ (dual-version cache fix `5a10383`); pause-with-one-queued-numbered-intent ✅ (intent door + door receipts on wire `1b9b3ba`). Cut list honored: trunks/bulk/templates/thermal/bulk-Wiring/commercial board/declared-intent/drills.
- **Acceptance:**
  - (a) users call it **tactile unprompted** — ⏳ human playtest;
  - (b) ✅ refusal reason guessable **from the icon alone** (shape-coded ports + dash channels, refusal census voiced via i18n packs `40faf58`);
  - (c) ✅ the shared-PDU trap gets **found by eye** (blast amber/red semantics + power overlay data);
  - (d) ✅ cable/click equivalence proven by **LinkObject hash equality in CI** (receipts golden `13ba145f`);
  - (e) morph transition preserves identity — 🚧 awaits render-layer Fold (design pinned: same-object tracking law `§8.3`).
- **Rides along:** WS-7's **Fogged NOC** render slice builds on this board in the same window (slice b below) ✅ partially — see (b).

### G5 — One quarter + Quarterly Review (§7.5, WS-4 slice with WS-6 round-trip) ✅ `b7e262c` (economy) + `6f5da38` (27/27) + Book UI `0a2f1ca`

- **Question (hosting_game.md §9.13):** does the macro clock give a *pacing arc* — and does the five-axis grade + attribution story make a quarter feel like a *season of a business*, not a spreadsheet interlude?
- **Scope:** state = 1 line (shared web); start position from whichever sheet `tuning.sheet` picks (run A-start and B-start variants if undecided); 5–10 named customers, 2 buildables, 1 hand, HUD ≤5. ✅ scripted 12-cast quarter, SEED 55105n, every §7.13 ratio honored at 7 min/month (pending the month decision).
  - **Engine musts:** business clock with 3 month boundaries inside the ~20-min level — **hosting_game.md §7.13's ~7-min ratio, not Sheet B's 4** ✅; dual-clock enforcement ✅ (partition-invariance telescoping fix); one contract signed pre-level via **Signed-Contract four sliders** — ⏳ clause *data* (13-clause SLA refs live `b7e262c`), slider UI partial; Invoice Run with delayed landing + dunning touch + Recurring Pulse ✅ (full dunning ladder + E-2 recovery + E-9 refunds); error budget draining + **one deliberate spend** + risky actions locked at zero ✅ (43 m @99.9% exact, `RiskyActionLockedError`); one cohort renewal mid-quarter ✅ (cliff-renew + whale lapse at minute 86,400); **Quarter Close 30-second sequence** ⏳ UI-level (engine structs all exist); Forecast Commit — 🚧; upkeep per canonical sheet ⏳ OD-2; one payroll date that matters ✅ (the Month-1 profit-crater scripted); **attribution stamping from day one** ✅ (P10 one-sentence test on the whale trail).
  - **UI musts:** Ledger Tape + Gap Bar ✅; Three-Clock Cluster — exactly three rings ✅ (clockRibbon `faf81a7`); Obligation Rail stub ✅ (budget strips); score screen **grading BOTH scorecard forks over the same save** ⏳ — the code ships all three weight sets side-by-side and *throws* until OD-1 (`getActiveScorecard()` pin), OD-1's experiment is ready to run the day you pick.
- **Acceptance (falsifiable):** player names *why* cash ≠ profit without tutorial text — ⏳ human; the invoice run lands as an **event** ⏳ audio awaits lane; the pull-forward produces *visible dread* ⏳; the Forecast Commit reckoning cited unprompted ⏳; ✅ ≥1 Retro-Thread sentence reads as *cause* (engine-proven P10).
- **Doubles as** the **Hardest-Lesson prototype** ✅ in scripted form (whale price-increase refusal = the cliff).
- **Rides along:** WS-6's Book-of-Business Round-Trip runs in this window (slice c) ✅.

### G6 — Two hosting types, one engine (§7.6, WS-3 slice §4.3) ✅ content `4ce67fc` + loader `ef8f35e` + acceptance `6f5da38` + panel `0a2f1ca`

- **Question (hosting_game.md §9.13):** can shared-hosting and game-servers be *the same engine wearing different clothes* — Level Grammar producing different play from the same verbs — purely from bundle data?
- **Scope:** (1) ✅ bundle v0 in mod JSON (Appendix A IS the format; no code-privilege path); (2) ✅ two levels load with **zero type-specific engine branches** — grep-proof CI-pinned (`official:` scan offenders:[], `6f5da38`); (3) ✅ patience LUT shared + tempo/permanent-ms flags data-driven; customer-shield twist — ⏳ v0 board equivalence documented; (4) Skin Kits: ✅ **AssetPack pipeline shipped** (`b3a149d` — Five-Asset contract, manifest law, seed PLACEHOLDER kit) — real art pending; (5) ✅ Handover Notes ×2 + Rosetta Cards in packs (`08d4fe2`); (6) ✅ lint ruleset in CI both directions (`ef8f35e` + `1553702`); (7) Two-Screenshot Test — ⏳ measures need real art; (8) backup 3rd type — 🚧 (schema survives: lint budget checks generalize, 3rd bundle is authoring work).
- **Acceptance:** ✅ zero engine branches (grep proof in CI); ✅ two levels play *differently* from data (emergent: chronic-bounce web vs binary-loss game troughs, `6f5da38`); ✅ diff-linter green; backup-3rd 🚧 authoring.
- **Pending:** OD-4b (metric namespace per tier) and OD-18 (`lookalikeOf`) want answering *before* schema freeze; OD-14 settles the canon count.
- **Failure branch (doc):** "if two types don't diverge from data, cut types and go deeper [on fewer]" — **engine answer: they diverge** (§7.6 witness).

## Cross-cutting slices (not gates, but gate-cheap) (§7.7)

| Slice | Source | Window | One-line acceptance | Status |
|---|---|---|---|---|
| **(a) "The Rule That Fought Itself"** | WS-5; rides P0 immediately — headless, zero UI | after P0 | **byte-identical fire-log ×100 replays**; dry-run shadow ≥90% match post-arm; static detector catches planted scale-out/cost-cap oscillator, **0 false flags on 10 clean pairs**; Triage-Window A/B flag both live (feeds OD-4a empirically); kill-switch "ghost puts your fix back" scripted beat; one rule firing on stale observed data; playtest answer to *is reading your own machine's misbehavior fun?* | ✅ `1fb4fc6` + review rounds (conflict detector, bounded scan, cons-chunk journal, mixed-predicate differential pin `05345a4`); Triage-Window A/B ⏳ owner 4a; human playtest ⏳ |
| **(b) "The Fogged NOC"** | WS-7, Pixi-adapted; builds on G4's board | with G4→G3 | 12 racks (~240 units); 6k-mote lane field rendered **from lane statistics** (stats-not-entities); violet→cyan classification contacts; amber-haze over-tuned WAF; ObservedStore with 40% uninstrumented → all fog widgets render from the ObservedCell contract with **zero bespoke fog code**; BudgetManager forces 50 alerts → "+N" collapse, Chroma Meter breach visible; acceptance harness in CI from day one (Quiet/Loud/Thumbnail-128px/greyscale-dump/strobe-clamp/keyboard-only + Readout + Shape-First); worker→main observed-delta feed at 10 Hz with client interpolation; readability target attempt 2,000 objects / 20,000 in-flight @Z3, 1080p/60, 2×, player-blind 60 s (OD-10/OD-12 finalize numbers) | ✅ core: ObservedStore fog/coverage/wrongness `55a6086`, budget + chroma `4ff4a4f`, chrome instruments `faf81a7`, hue-ledger law enforcement `1e6b306`/`c8c5a41`, post-chain law `c503d2d`, substrate spike `0acf46e`. 🚧 full iso scene/mote field awaits render mount (panels are DOM/SVG programmer-art by design); a11y CI harness partial (Shape-First pips + readout shipped; strobe/greyscale dumps not) |
| **(c) "Book-of-Business Round-Trip"** | WS-6; with G5 | after first G5 pass | L1 serve-name 6 customers + price-hike shortcut; L2 data-loss → postmortem minigame → scar + Unlock-Draft 3-choose-1 → scar visibly active at L3; L3 **queries the ledger** (two L1 customers become references; the shortcut returns as a deposition "Source: pricing decision, day 41"; Past-Self board generated from habit counters); settlement + one screen per face from committed data only; kill-browser→month-checkpoint restore; prestige-exit → new node with exactly {3 nodes, playbook}; **v1→v2 mid-save migration dry-run** (adds `breach_history[]`) exercising the one-way-door law; Consultant shadow-instance assert (writes medals/streak, **zero** scars/rep/cash — validates OD-8 option B cheaply). Success = level-3→level-9 memory + Past-Self both run on **stored events only** | ✅ engine-level: lineage tree + exact-3 spawn + treatment→reference/deposition query + streaks + faces + migration ×50 + 160-row OD-8 guard `9e701a0` (+ inheritance-spend seam `1553702`). ⏳ the L1/L2/L3 *playable* loop is a mode-shell task, not sim-core |
| **(d) "Two Seats, One Outage"** | WS-8 A; late Phase 1 — after G4+G2 prove board + ledger primitives; **deliberately first use of the Node harness** (OD-5(b) demo; slice is optional-to-run under (a) if owner flips OD-5) | after G5 ideally | deterministic core over ~12 objects, aggregate-per-class; 2 Vue seat dashboards (≤6 widgets each) receiving **only** their projected observed layer + shared-timeline deltas; intents scoped per delegation-band table; one authored 10-min scenario **provably requiring cross-seat info** (cause only on network overlay; urgency/patience only in tickets; hidden circular edge as twist) — the adopted co-op authoring law exercised at first test; minute-6 drop/rejoin via handoff beat; voice-banned testers converge on timeline alone. **Pass: 0 ground-truth leaks across 1,000 seeded property-runs; rejoin <2 s, no divergence; bit-identical replay on two machines** | 🚧 awaits build (not sign-off anymore): the *substrates* exist (`observed_view(seat)` day-1 `55a6086`, 60-seed leak test, delegation bands `1fb4fc6`, Node port `48b56f2`) — **OD-5(b) + OD-8-B ratified 2026-10-09**, so the session transport + scenario build is now unblocked as a regular (large) build lane, owner-gating removed |
| **(e) "Deck Duel, Deferred"** + leak-audit CI fixture | WS-8 B/C; reuses (d)'s sim | optional, late | validator (wave-envelope legality = hosting_game.md §2.24 generator constraints incl. Second-Answer invariant) catches planted degenerates; 25 async duels with no dominant pairing; deck is pure bundle data; <45 s CPU/duel headless — the R-4 artifact format proven before the mode exists | ✅ format+duel engine `2421257` (deck/draft/commit/resolve, 5,175-deck packer totality, reveal-binds-bytes); memo ×28 `7607361`; observability `54c8cb1`. ⏳ the 25-duel balance sweep awaits versus taste rows |

## Dependency build order (§7.8)

```
P0 sim-core skeleton ──► G1 bounce loop ──► G3 suspicion dial ──┐
        │                    │                                  ├─► G4 drag-a-cable ──► G2 ledger
        │                    └── (G2 seeds ride G1's board)     │        │   (Fogged NOC renders
        └─► (a) rule slice, headless, parallel to G1            │        │    G4's board from day 1)
                                                                │        ▼
     schema freeze cadence: Appendix A v0 at P0 ─► G6 two-types │   G5 one quarter ──► (c) Book round-trip
     (run any time after (a) + G1 board stubs)                  │        │
                                                                ▼        ▼
                                                        (d) two seats ─► (e) deck duel / leak CI
```

1. ✅ **P0 first** (non-negotiable) — shipped `2bc7e5e`→`9e701a0`, CI-gated.
2. ✅ **G1 immediately on P0** — `6f5da38` (headless acceptance) + panel `0a2f1ca`.
3. ✅ **(a) rule slice parallel to G1** — `1fb4fc6` (+ four review-hardening rounds).
4. ✅ **G2 → G3 as G1 increments** — same board, same rig.
5. ✅ **G4** (door + tactility + panel) / **(b) Fogged NOC** core contracts shipped; 🚧 full Pixi scene mount + Fold await a render-mount wave.
6. ✅ **G5** then **(c)** — 27/27 quarter + Long-Save round-trip engine.
7. ✅ **G6** — data-only divergence grep-proven in CI; 🚧 backup-3rd type + Two-Screenshot await art/authoring.
8. 🚧 **(d)/(e)** — (e)'s *format* is fully built (`2421257`); (d) awaits OD-5/OD-8 sign-off before session ops are worth building.
9. **Decision checkpoints wired to the sequence:** OD-2 before G1 calibration ends; OD-1 before G5 score-screen build; the OD-4 batch before G3 (triage/telegraph wording) and before interpreter freeze (rung-4, grammar); OD-5 anytime before (d) hardens — **nothing in 1–7 waits on it.** ← **ALL RATIFIED 2026-10-09 — see the execution queue at the top of this file (queue items 1–11; the calibration flips are items 2–3).**

## Post-plan build waves — progress ledger (2026-10-07 → 10-09)

Everything below was *not* in the original §7 plan; built under the standing owner directive ("build everything not requiring owner approval, tests+docs, commit as we go"), each wave reviewed (R1–R13) before release, CI 3/3 at every tip.

| Area | Landed (annotated commits) |
|---|---|
| Content variety engine | ✅ i18n grammar packs `08d4fe2` + loader consumption `354261d` + proto pack wiring `40faf58` + era singleton lift `17f3c8b` |
| Door amendments + drain | ✅ `b1f757e`, opt-in drain-before-disconnect `c253643` (v0-off byte-identical goldens) |
| Topology hygiene | ✅ projectionVersion pair-key + powerFeeds chain head `5a10383` |
| Versus (async Red-vs-Blue, R-4 format) | ✅ `2421257` + runner memoization `7607361` + memoStats `54c8cb1` |
| Coverage Grid (P17 dark-cell teaching) | ✅ `e24e1bb` |
| Unattended sim (Long Weekend + What-If) | ✅ `a864061` + review closeout F1–F11 `4389737` |
| Determinism/digest perf | ✅ limb digest `3466bdc`; economy 256× `d29867f`; policy ×2.27 `734ea56`; queue-ghost FIX-8 ×22 `41fcdd2`; targeted purge `fca91f1` |
| Behavior fix: hard-ceiling shed terminates (R-06 law) | ✅ `2eaf830` (+ falsifiable twin `0e69e16`) — ratification noted in owner ledger |
| Chrome/HUD + legibility laws | ✅ `faf81a7`, hue-ledger enforcement `1e6b306` + `c8c5a41`, Sim Lab `e1190d1` |
| PixiJS addon program (ADR-0008, RATIFIED `5bbd442`) | ✅ lane 1 AssetPack pipeline `b3a149d` · ✅ lane 2 pixi-filters post-chain law `c503d2d` · ✅ lane 3 AudioBus façade (zero-dep) `28f638e` · ✅ lane 4 tilemap substrate SPIKE (recommend/hold-mount) `0acf46e` · ✅ budget fail-open hardened `28d8b6b` · ✅ error-family hygiene `e4558ff` |
| CI hardening | ✅ gate-5 mirror `26e2aaa`, determinism ×100 across 14 dirs `cf7c7b0`, timing gates contention-harded `ea1f6e3` |
| Media prompt library (owner-runs generation) | ✅ image `95b5e35`, promo/branding `e6da306`, video 2-track `68b2a40` |
| Audit infrastructure | ✅ perf-tools `40a036e`, comment-vs-code audit closures `6e1503e` |
| Repo hygiene | ✅ coverage/ ignore un-anchoring `751b9d3`, dependabot steady-state `3f47d0a` |

**Baseline @ `e4558ff`:** typecheck 5/5 · sim-core 1434/100 · proto 614/60 · headless 53/5 (parity literals) · assetpack 48/5 · perf 20 · api-verify 1270 · canary 105 · ci-verify 5/5 · content validate 63 `_todo`.
