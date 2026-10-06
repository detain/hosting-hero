# PHASE 1 PLAN — The Six Prototype Gates

**Mirror of:** `reports/MASTER_REPORT.md §7` (RATIFIED scope, `hosting_game.md §9.13`, owner decision R-7). This file expands §7 into working-plan shape; the report remains canonical.
**Citation convention:** a bare `§N.M` = a section of `reports/MASTER_REPORT.md`; any reference to the original design doc is always written `hosting_game.md §x.y`.

## Governing law (§7)

Each gate is a **design question answered by a playable/runnable artifact in programmer art**; modes and structure are decided **by prototype, not by argument**. Phase 1 produces **zero shipped content, zero campaign authoring, zero render polish beyond the test itself** (§2.2 R-7). Open owner decisions gate *calibration*, never *kickoff* — noted per gate (§7).

## Provisional slots — PENDING OWNER, must not be silently resolved

Four values every slice *touches* but nobody may hard-code. Each is rendered as a named config knob with a default that **fails loudly** rather than pretending to be settled. A slice reading any of these must resolve it from config at runtime; silently committing a literal is a review block.

| Knob (config key) | Backing decision | Value | Status | What it gates |
|---|---|---|---|---|
| `scorecard.weights` | **OD-1** uptime-first vs conversion-first (report §6.1) | **UNSET** — G5 must run **both forks over the same save**; hosting_game.md §9.13's own text leans conversion-first, WS-4 offers the "score availability against *commitment*, not raw uptime" convergence candidate | **PENDING OWNER** | Which counter "wins"; the build order itself (report: needed *before WS-1/WS-7 freeze their build order*); G5 score screen; meta rewards |
| `tuning.sheet` | **OD-2** canonical sheet A / B / C (report §6.1; conflict table verbatim in report Appendix D) | **UNSET** — sheet A/B/C choice picks *which constants are load-bearing law*; G1 starts fine (bounce LUT `10@0.6 / 50@1.0 / 95@1.6` is sheet-stable) but feel calibration waits; G5 may only pick **one** start position | **PENDING OWNER** | G1/G5 numeric acceptance thresholds (ρ-knee session design, sawtooth `P(n)` tables), Ruleset Card baselines, tuning-harness CI, WS-3 bundle defaults; leaks into the bundle schema + policy upkeep field |
| `tuning.monthLengthRealMin` | OD-2 ride-along fix | **UNSET between 7 and 4** — `hosting_game.md §7.13` says ~7 real-minutes/month; Sheet B says 4. **G5 deliberately runs the hosting_game.md §7.13 ratio and refuses to silently choose** (explicit §7.5 flag) | **PENDING OWNER** | Business-clock pacing in G5; any month-boundary arithmetic |
| `content.threatVisitorCensus` | **OD-3** ~200 threats vs ~45 visitors (report §6.1) | **UNSET** — WS-3's third path (mechanically-distinct threats survive; the rest become **Codex-only**, citable, never spawned) is the specialist recommendation but unratified | **PENDING OWNER** | G2's v0 deck-family count, WS-3 production plan, fairness-validator scope, Versus draft-pool width, Campaign scar table |
| `mp.topology` | **OD-5** MP host under browser-authoritative sim (report §2.2 / §6.1) | **UNSET — repo scaffolded per recommendation (b) "TS sim as portable library"**, marked as such in `docs/ARCHITECTURE.md §10`; slice (d) doubles as proof-of-(b) but remains runnable under (a) if owner flips | **PENDING OWNER (recommendation issued)** | Slices (d)/(e) ops shape, co-op pause authority (host-vote vs server-vote), save-trust variant OD-13. **Does not block G1–G6** |

## P0 — Sim-core skeleton (§7.0)

Not a gate; the ~3–4 week substrate every slice consumes. Build-order directive: **the sim core comes first because everything needs `observed_view` + RNG discipline** (§7.0).

| Piece | Source | Note |
|---|---|---|
| Q16.16 fixed-point math + integer-µs event keys | WS-1 verdict Q1 (§4.1) | floats confined to display-only math that cannot touch replay |
| Counter-based RNG streams `(run_seed, domain, sim_minute, entity_id)` | WS-1 R-16 (§4.1) | director domain included (draws logged) |
| 12-step pipeline shell: named slots + **step-12 observed-layer single-writer** + **step-12.5 rule-phase slot** (empty interpreter OK) | §4.1 + WS-5 (§4.5) | the slot registry *is* the extension-point architecture |
| Ground/observed twin store + degenerate `observed_view(consumer)` projection fn | WS-1 R-66…R-72 (§4.1) + WS-8 day-one trio #1 (§4.8) | per-consumer param from day 1; ObservedCell as data type (§3.1); leak property-test hook stubbed |
| ReplayLog (append-only) + checkpoint ring + state-hash tripwire | §3.3, §4.1 | THE LONG SAVE = checkpoint + input tail — format adopted engine-side first |
| Input-log ingestion (clock-typed; pause-with-orders; arrival-order stamping) | WS-1 R-24…R-28 (§4.1) | Workerman input-message contract |
| `cause_id` on **every** state mutation incl. economic | WS-4 R4 (§4.4) | **unretrofittable** — enforced in the mutation API, not by convention |
| Web-Worker packaging + worker→main observed-delta channel (10 Hz batched) | §3.1 | renderer holds zero authority |
| Runtime-neutral discipline + Node harness | WS-6 R2-restated (§3.4) | **dual-runtime CI gate lives from P0** — also the OD-5(b) demo |
| zod type-bundle loader + Ruleset Diff Linter skeleton; grammar-pack registry | WS-3 (Appendix A) + WS-5 (Appendix B) | schema freeze starts here (Appendix A is v0) |

Risk-register rows #1 (determinism), #4 (attribution `cause_id`), #6 (observed retrofit) are **P0 acceptance criteria, not warnings — done when the CI says so** (§8 register cadence).

## The gates

### G1 — Bounce loop: "The Agonizing Slider" (§7.1, WS-1 slice §4.1)

- **Question:** is the ρ/(1−ρ) knee + bounce cliff *felt as a decision* when dragging one aggression slider? (hosting_game.md §9.13: one server, one defense, one slider; fun in 90 s or nothing matters.)
- **Scope:** one ingress (diurnal envelope + one scripted spike), one app node (S=8, 120 ms service), one stub DB (proves dependency blocking R-09), one defense with aggression slider (simplified ROC pair), bounce LUT `10@0.6 / 50@1.0 / 95@1.6`, integer-time DES + macro-tick hybrid, seeded 2-stream RNG, *degenerate* observed projection with one 30 s stale probe (**the seam exists day one**), replay log w/ checkpoint hashes, three outcome counters (served / bounced / false-positive-403). Est. ~2,500 LOC TS.
- **Acceptance:**
  - (a) **byte-identical state hashes across ≥2 runs AND across 1×/4×** (speed gates observation, never physics);
  - (b) never-touch vs max-slider lose **differently**, both legible;
  - (c) the ρ≈0.7 knee bend visible within a 90-second session;
  - (d) dragging aggression trades amber-403 ghosts for catches **live on one screen**.
- **Calibration pending:** `tuning.sheet` (OD-2) for feel numbers only; `scorecard.weights` (OD-1) for which counter "wins" — the outcome counters exist regardless.
- **Failure branch (doc):** if the slider isn't agonizing, the core-loop premise is wrong before any art/money/policy exists — the cheapest possible kill-shot (§7.1).

### G2 — Attack Surface Ledger (§7.2)

- **Question (hosting_game.md §9.13):** does *building* something visibly change what attacks you — is construction an attack-surface decision, not a stat bump? (P2: threats unspawnable until you build their invitation.)
- **Scope** (synthesized from WS-1 R-45…R-54 + WS-2 ledger/board primitives + WS-3 family-weight data; rides G1's board): shared-web line, one rack, ~6 buildables (web, DB, cache, auth, backup-agent, admin-port); the **Ledger view** = live diff of the threat deck (family weights from bundle data, WS-3 R34) derived from the player's construction log — adding the DB lights up SQLi/brute/vacuum-storm rows *before* the next envelope silhouette (telegraph bands, OD-4b wording, visible); removals decay entries toward grey "dormant" rather than deleting (history honest). Threat generation stays seeded: wave-table ids in ReplayLog. Minimal board actions (place/remove = WS-2's placement loop minus physical layer).
- **Acceptance:**
  - (a) a first-time player **predicts the next wave from the Ledger alone** (no tutorial text; think-aloud test);
  - (b) building/removing the DB changes the deck within one tick, provably deterministic — **same build sequence + seed → same deck diff ×100 replays**;
  - (c) every deck entry names its *invitation* (hover → the object you built) — the ledger is derived, not authored;
  - (d) honeypot case: apparent ≠ actual hardening shows in the Ledger as *apparent* — verified by two seeded runs differing only in deception.
- **Pending:** OD-1 decides whether the "right" ledger play is leaving a door open for conversion vs closing everything (the ledger itself is fork-neutral); OD-3 bounds v0 deck-family count.

### G3 — Suspicion Dial, with visible false positives (§7.3)

- **Question (hosting_game.md §9.13):** do players *agonize* over the inspection/aggression trade when the cost (amber-403s = paying customers bounced) is on screen?
- **Scope** (extends G1's board; WS-1 R-45…R-54 classification math + WS-7 amber form-law): per-node **Inspection Depth** slider (pass-through / sample 1-in-20 at 5% cost / inspect / challenge); sticky suspicion decay ~10 min; confidence composition `C = 1 − Π(1−cᵢ)`; `L = Σ lᵢ` contributions *never boolean*; aggression slider genuinely **moves the ROC curve, never a damage number**; false positives rendered as amber-403 ghosts *in the traffic lane itself* with a running "revenue bounced by mistake" ticker (the first HUD number); one tight-patience cohort (60 ms game-class guest) so FPs hurt cohorts differently; blind-spot honesty — upstream FP invisible until edge-logging purchase, one seeded run proves the blind spot is *learnable*.
- **Acceptance:**
  - (a) playtesters verbalize a *policy* ("I only challenge at peak") unprompted;
  - (b) the FP ticker is cited unprompted when asked "how's business?";
  - (c) determinism: **identical slider-input trace → identical FP set ×100**;
  - (d) both failure shapes reachable and *feel different* (over-trust → Landed breach; over-filter → starved funnel);
  - (e) **fog-automation teaser:** one rule firing on stale data (borrowed from WS-5's slice) shows observation quality changing protection — pre-validates OD-15/OD-4b consequences.
- **Pending:** OD-15 D-7 (emergent-storm cap) constrains how hot G3's tail may get; OD-2 supplies final patience/cost tables.

### G4 — Drag-a-cable: board tactility (§7.4, WS-2 slice §4.2)

- **Question (hosting_game.md §9.13):** is the physical layer (rack ⇄ topology dual view + wiring) *tactile* rather than a menu?
- **Scope** (~2–3 eng-weeks TS, programmer art): one room, 2 racks × 42U, ToR each, A/B PDUs with **one shared-circuit trap seeded**; LB/web×2/DB/cache/storage populated; Rack⇄Topology views joined by **one morph transition** (Pixi-adapted: authored second face per R-1 consequence #2); **drag-a-cable AND keyboard click-to-link producing bit-identical LinkObjects** (WS-2 R30 equality law, asserted by hash); DATA ports + POWER assign-menu; preflight refusals WRONG_SPEED/NO_FREE_PORT/trust-lite; magnetic snap + bounce-reject + physical Terms Card with live latency delta + attack-surface line (couples back to G2's ledger); timeout bead carrying a **pre-seeded monotonicity violation**; placement loop with per-rack refusal icons + live amp bar + Broken-N+1 badge; miswiring allowed and hover-findable; blast hover (flat flood + count + amber degraded + red ghost delta — BFS-on-observed, memoized by `board.version`); pause-with-one-queued-numbered-intent. Cut list honored: trunks/bulk/templates/thermal/bulk-Wiring/commercial board/declared-intent/drills.
- **Acceptance:**
  - (a) users call it **tactile unprompted**;
  - (b) refusal reason guessable **from the icon alone**;
  - (c) the shared-PDU trap gets **found by eye** (blast hover not required);
  - (d) cable/click equivalence proven by **LinkObject hash equality in CI**;
  - (e) morph transition preserves identity (the same object tracked across views — no re-creation).
- **Rides along:** WS-7's **Fogged NOC** render slice builds on this board in the same window (slice b below).

### G5 — One quarter + Quarterly Review (§7.5, WS-4 slice with WS-6 round-trip)

- **Question (hosting_game.md §9.13):** does the macro clock give a *pacing arc* — and does the five-axis grade + attribution story make a quarter feel like a *season of a business*, not a spreadsheet interlude?
- **Scope:** state = 1 line (shared web); start position from whichever sheet `tuning.sheet` picks (run A-start and B-start variants if undecided); 5–10 named customers, 2 buildables, 1 hand, HUD ≤5.
  - **Engine musts:** business clock with 3 month boundaries inside the ~20-min level — **hosting_game.md §7.13's ~7-min ratio, not Sheet B's 4** (`tuning.monthLengthRealMin` stays unset: the slice just refuses to silently choose); dual-clock enforcement (one action, one clock; business clock never pauses mid-incident); one contract signed pre-level via **Signed-Contract four sliders** with reward `base × (1 + 0.35·avail + 0.2·response + 0.15·scope)`; Invoice Run with delayed landing + one dunning touch + Recurring Pulse; error budget draining + **one deliberate spend** + risky actions locked at zero; one cohort renewal mid-quarter (renew/escalate/lapse) pulsing 90 days ahead; **Quarter Close 30-second sequence** (pull-forward showing next-quarter forecast dip, recognize-vs-defer, board-narrative line, consecutive-borrow counter visible); Forecast Commit stated at start, reckoned at end ("the dial you set with your own mouth"); upkeep per canonical sheet; one payroll date that matters; **attribution stamping from day one** (postmortem draws ≥1 Retro-Thread: "the churn spike you see is the SLA miss two months ago").
  - **UI musts:** Ledger Tape + Gap Bar; Three-Clock Cluster — exactly three rings (inner incident/wave, middle month+invoice ticks, outer the contract); Obligation Rail stub; score screen in resolved sequence dials → axis bars → **Grade Stamp on 5 axes — grading BOTH scorecard forks over the same save** (the slice *is* OD-1's experiment: player reaction to each fork's verdict is the data).
  - **Excluded v1:** full six-bucket (free+AR+deferred only), balance sheet, financing instruments, dunning detail, pipeline rail beyond stub, org chart, oversell.
- **Acceptance (falsifiable):** player names *why* cash ≠ profit without tutorial text; the invoice run lands as an **event** ("payday… you can hear it"); the pull-forward produces *visible dread*; the Forecast Commit reckoning is cited unprompted at score time; ≥1 Retro-Thread sentence reads as *cause*, not correlation.
- **Doubles as** the **Hardest-Lesson prototype** (raise a price, lose customers, survive it — hosting_game.md §9.13 business lens).
- **Rides along:** WS-6's Book-of-Business Round-Trip runs in this window (slice c).

### G6 — Two hosting types, one engine (§7.6, WS-3 slice §4.3)

- **Question (hosting_game.md §9.13):** can shared-hosting and game-servers be *the same engine wearing different clothes* — Level Grammar producing different play from the same verbs — purely from bundle data?
- **Scope:** (1) bundle v0 trimmed to shared-web + game-servers fields, authored entirely in the eventual mod JSON (proves hosting_game.md §9.11 on day one — Appendix A schema *is* the mod format); (2) bundle loader in-engine; two levels load with **zero type-specific engine branches** — grep proof: `rg "business.?type" engine/` returns formatting-only hits; (3) patience modes ×2 — sigmoid-budget (game, 90 ms) + soft-budget-with-customer-shield (shared's "you cannot evict this customer" twist) + Resident-class sticky sessions for game; (4) two **Skin Kits at exactly the law** (Five-Asset: accent hue pair / costume / hero silhouette / meter widget / catastrophe FX + 8 parameter values): shared = density-comb meter, Sparks costume, control-panel hero, amber-noise FX, cyan-putty; game = metronome meter, Pawn costume, tick-node hero, rubber-band FX, magenta-excluded; both composed from the shared concurrency-pool archetype in two costumes; (5) Handover Notes ×2 + one Rosetta Card ("Tick budget is your density dial, spent in milliseconds"); (6) zod schema + **Ruleset Diff Linter in CI on both bundles**; (7) the slice *measures* the Two-Screenshot Test; (8) recommended extra: **3rd type = backup** (window-packing patience, Gantt non-request flow variant) as the schema's generality check — it breaks any accidental ms-budget assumption the two-type test hides.
- **Acceptance:** zero engine branches (grep proof); two levels play *differently* per playtest think-aloud while using the identical verb set (WS-2 per-tier verb sets; R-5's per-type analog); diff-linter green; backup-3rd loads without schema surgery.
- **Pending:** OD-4b (metric namespace per tier) and OD-18 (`lookalikeOf` addendum) want answering *before* schema freeze — G6's output feeds them; OD-14 settles what the two here imply for the census count.
- **Failure branch (doc):** "if two types don't diverge from data, cut types and go deeper [on fewer]" (§2.2 R-7).

## Cross-cutting slices (not gates, but gate-cheap) (§7.7)

| Slice | Source | Window | One-line acceptance |
|---|---|---|---|
| **(a) "The Rule That Fought Itself"** | WS-5; rides P0 immediately — headless, zero UI | after P0 | **byte-identical fire-log ×100 replays**; dry-run shadow ≥90% match post-arm; static detector catches planted scale-out/cost-cap oscillator, **0 false flags on 10 clean pairs**; Triage-Window A/B flag both live (feeds OD-4a empirically); kill-switch "ghost puts your fix back" scripted beat; one rule firing on stale observed data; playtest answer to *is reading your own machine's misbehavior fun?* |
| **(b) "The Fogged NOC"** | WS-7, Pixi-adapted; builds on G4's board | with G4→G3 | 12 racks (~240 units); 6k-mote lane field rendered **from lane statistics** (stats-not-entities); violet→cyan classification contacts; amber-haze over-tuned WAF; ObservedStore with 40% uninstrumented → all fog widgets render from the ObservedCell contract with **zero bespoke fog code**; BudgetManager forces 50 alerts → "+N" collapse, Chroma Meter breach visible; acceptance harness in CI from day one (Quiet/Loud/Thumbnail-128px/greyscale-dump/strobe-clamp/keyboard-only + Readout + Shape-First); worker→main observed-delta feed at 10 Hz with client interpolation; readability target attempt 2,000 objects / 20,000 in-flight @Z3, 1080p/60, 2×, player-blind 60 s (OD-10/OD-12 finalize numbers) |
| **(c) "Book-of-Business Round-Trip"** | WS-6; with G5 | after first G5 pass | L1 serve-name 6 customers + price-hike shortcut; L2 data-loss → postmortem minigame → scar + Unlock-Draft 3-choose-1 → scar visibly active at L3; L3 **queries the ledger** (two L1 customers become references; the shortcut returns as a deposition "Source: pricing decision, day 41"; Past-Self board generated from habit counters); settlement + one screen per face from committed data only; kill-browser→month-checkpoint restore; prestige-exit → new node with exactly {3 nodes, playbook}; **v1→v2 mid-save migration dry-run** (adds `breach_history[]`) exercising the one-way-door law; Consultant shadow-instance assert (writes medals/streak, **zero** scars/rep/cash — validates OD-8 option B cheaply). Success = level-3→level-9 memory + Past-Self both run on **stored events only** |
| **(d) "Two Seats, One Outage"** | WS-8 A; late Phase 1 — after G4+G2 prove board + ledger primitives; **deliberately first use of the Node harness** (OD-5(b) demo; slice is optional-to-run under (a) if owner flips OD-5) | after G5 ideally | deterministic core over ~12 objects, aggregate-per-class; 2 Vue seat dashboards (≤6 widgets each) receiving **only** their projected observed layer + shared-timeline deltas; intents scoped per delegation-band table; one authored 10-min scenario **provably requiring cross-seat info** (cause only on network overlay; urgency/patience only in tickets; hidden circular edge as twist) — the adopted co-op authoring law exercised at first test; minute-6 drop/rejoin via handoff beat; voice-banned testers converge on timeline alone. **Pass: 0 ground-truth leaks across 1,000 seeded property-runs; rejoin <2 s, no divergence; bit-identical replay on two machines** |
| **(e) "Deck Duel, Deferred"** + leak-audit CI fixture | WS-8 B/C; reuses (d)'s sim | optional, late | validator (wave-envelope legality = hosting_game.md §2.24 generator constraints incl. Second-Answer invariant) catches planted degenerates; 25 async duels with no dominant pairing; deck is pure bundle data; <45 s CPU/duel headless — the R-4 artifact format proven before the mode exists |

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

1. **P0 first** (non-negotiable): `observed_view` + RNG streams + fixed-point + `cause_id` + replay/checkpoint + worker channel + zod/grammar registries + dual-runtime CI — every other row consumes all of it.
2. **G1 immediately on P0** — smallest slice, biggest kill-shot.
3. **(a) rule slice parallel to G1** (headless; no UI dep beyond a programmer-art ticker) — hardens the interpreter and the ×100 replay discipline while G1 settles feel.
4. **G2 → G3 are increments on G1's board** (ledger = construction log → deck; suspicion = classification sliders on the same traffic) — run in whichever order momentum wants; both inherit G1's acceptance rig.
5. **G4** is the interaction build-out (~2–3 wks, mostly independent of G2/G3 sim work — parallelizable); **Fogged NOC co-builds** on G4's board so the render contract, BudgetManager, and the CI readability/a11y harness all pre-date any art production.
6. **G5** after the business clock + attribution stamping have been exercised at G1 scale; **(c)** validates the Long Save faces/migrations on G5's data.
7. **G6** once Appendix A schema has survived G1/G3/G5 bundle-loads (it should — types are how those slices get their numbers); its output feeds OD-14/OD-18 and finalizes the schema v1 freeze.
8. **(d)/(e) last and *optional within Phase 1***: they consume P0's perceiver parameter + G4's board + G2's deck + G5's close machinery; running (d) on the Node harness is also the empirical input to OD-5.
9. **Decision checkpoints wired to the sequence:** OD-2 before G1 calibration ends; OD-1 before G5 score-screen build; the OD-4 batch before G3 (triage/telegraph wording) and before interpreter freeze (rung-4, grammar); OD-5 anytime before (d) hardens — **nothing in 1–7 waits on it**.
