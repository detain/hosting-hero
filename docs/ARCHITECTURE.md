# ARCHITECTURE — Hosting Company Tower Defense

**Source of truth:** `reports/MASTER_REPORT.md` (2026-10-06). Every claim below carries a `§` citation into that report.
**Citation convention:** `§N.M` = a section of `MASTER_REPORT.md`. `hosting_game.md §x.y` = the original design doc heading. Underlying specialist requirement IDs (R-, DR-, Q-, etc.) are preserved where they add traceability.
**Status:** the ratified stack is owner-decided 2026-10-06 (§2.1) and settled; the items marked OPEN/PENDING in §6 of the report remain open and are *not* resolved here.

---

## 1. The system in one paragraph

A single **deterministic TypeScript simulation core** is the whole game's engine and the *only* holder of ground truth; it runs authoritative **in a browser Web Worker** for single-player (§3.1). A **PixiJS v8 2.5D multi-layer compositor** draws the world by reading *observed projections* of that core at ≤10 Hz and interpolating, with **zero sim authority** (§3.1). A **Vue-DOM Chrome/Annotation layer** sits above the canvas and is the home of all text, HUD, and accessibility (§3.1, §4.7). **PHP + Workerman** provide macro-tick services, persistence, the canonical-ledger *notary*, and transport/relay — never the tick loop (§3.1, §3.2). **MySQL** is system-of-record + notary; **Dragonfly/Redis** is relay cache + observed-series mirror + hot sets (§3.1). The Company save is a **lineage tree** written through one API by every mode (§2.1 R-3). Everything is seeded, integer-timed, and replayable; determinism is a load-bearing product feature, not a QA nicety (§3.4, §8 RISK-1).

---

## 2. Layer stack

The stack is described top-down as drawn in §3.1. Each layer's authority and boundary is law.

| Layer | Technology | Holds | Boundary law |
|---|---|---|---|
| **Chrome / Annotation** | Vue 3 + DOM (separate compositor tier) | All Policy Book, Triage Board, The-Book board, Inspector, Readout-Mode UI | **Never blended into the world**; HUD text never scales (`hosting_game.md §7.16`); real DOM is legally required by screen-reader/ARIA mandates (§4.7) |
| **Render (world)** | **PixiJS v8** 2.5D multi-layer compositor | Substrate → Flow/Signal + Attachment → Intent → Annotation (draw tiers) | Five layers have **hard non-blending boundaries**; "never let a concept live in two layers" (§3.1, §4.7 item 1.1) |
| **Sim core** | **TypeScript**, authoritative, in-browser **Web Worker** (SP) | The 12-step pipeline, ground truth, observed twins, policy interpreter, ledger | **Only writer of ground truth.** Renderer never writes back except via input events (§3.1) |
| **Macro / services** | **PHP + Workerman** | Macro-tick input composition, persistence/notary, transport/relay, bundle distribution, accounts, cross-save canonical state | Services/transport/persistence **only** — never executes the 12-step tick (§2.2 R-2, §3.1) |
| **Node port of sim core** | Same TS package on Node | MP session host, Async-Versus, Long Weekend, Analyst forward-sims, Ratchet-Audit counterfactuals, CI dual-runtime gate, replay-verify executor | **Conditional on OD-5=(b)**; required by approved features regardless of OD-5 (§3.4) |
| **Persistence** | **MySQL** (+ **IndexedDB** client-local) | Canonical lineage save, append-only receipts, rule-book versions + audit, replay-bundle index | The *number that loads next session* is client-sim-derived; the server guarantees it by notarized replay (§3.2, §4.4 correction) |

### 2.1 The PixiJS render layers in detail (§4.7 item 1.1)

`Substrate` (muted materials only, practical lighting, dead rack = dark rack) → `Flow`+`Signal` (+`Attachment` sub-layer riding units at screen-space scale) → `Intent` (white/near-white, dashed, never lit, never occludes) → `Annotation`/`Chrome` (flat, crisp, unlit, always top). The **Hue Ledger** is a compile-time registry; **Two-Channel Law** — every state is encoded ≥2 ways so the greyscale pass survives as a sign-off gate (§4.7 item 1.2). **BudgetManager** is the singleton admission authority: the renderer **REFUSES over-budget draws** (Icon Budget "enforced by the renderer, not by authoring discipline") (§3.1, §4.7 item 1.9).

The **Fold** (Iron Board ↔ The Book transition) is a **shader crossfade + layout morph**, not a camera flight (§2.2 R-1).

---

## 3. Client/server authority contract (§3.2)

The new contract demanded by ratification R-2. The authoritative home of each artifact, who else may hold it, and how it is enforced:

| State / artifact | Authoritative home | Others hold | Enforcement |
|---|---|---|---|
| Ground-truth world | Sim core (SP: player worker; MP: session host — browser under (a), **Node under recommended (b)**) | nobody | projection-only API (§3.1 law 1) |
| Observed twins / projections | Sim core (deterministic per-consumer fn) | renderer, HUD, rules, seats | derived, never writable; replay-recomputable |
| Player inputs | Sim **input log** (clock-typed) | Workerman stamps arrival order for MP | canonical order = what the host fed the core |
| Ledger / money | Sim core (step 12) — **C5 restatement** | MySQL notary: append-only receipts + bucket-sum snapshots | notarized replay-verify diff (Node port) |
| Long Save (lineage tree) | Client writes (IndexedDB first) **and** server canonical copy (MySQL) | both | write facets (Appendix C); signed, hash-chained settlement batches |
| Replay artifacts | Produced by core (see §4.3) | SP local + optional upload; Versus/async bundles **always** server-stored (they referee) | "anything not referenced by hash is non-canonical" |
| Rule book | Sim state **by hash**; version history + audit rows MySQL (**C1**) | Policy UI reads live | append-only; conflict lint at save |
| Director draws / market events | Generated server-side (Workerman macro) with seed commitment | core consumes as timestamped inputs | determinism extends to market events (`hosting_game.md §1.13`) |
| Hosting-type bundles | Distribution + integrity server-side; content authority = bundle hash pinned in save/replay | zod-validated schema, TS types generated | Ruleset Diff Linter CI (WS-3) |
| Cross-save state (streak, leaderboards, deck exchange) | MySQL canonical (server mints from verified receipts) | clients cache | hash-chained batches (WS-6 R5) |
| Anti-cheat posture | **Trust policy = OD-13** | — | replay-verify is async/batch, not hot-path |

**Player-verb *validity* never needs the server** — it is established by seed + input replay (§2.2 R-2). **Failure model:** SP tab death = ordinary LONG SAVE checkpoint + input tail; MP session-host death is topology-dependent — (a) needs a new volunteer browser + survivor intent-log, (b) re-sims on any Node in seconds-to-a-minute. That asymmetry is the strongest operational argument in OD-5 (§3.2).

---

## 4. observed_view(seat) — the projection laws (§3.1)

```
observed_view(consumer) = project(ground_truth, instrumentation_state, consumer_scope)
consumer ∈ {seat-1…seat-n, local-player, renderer, policy-interpreter, headless-analyst}
```

First-class **from day 1**, not a netcode bolt-on (§2.2 R-4, §4.8). Three laws:

1. **Everything visible is projection.** Renderer, HUD, Policy-interpreter conditions (rules read the observed layer — fog degrades automation, by design), and every remote seat consume *only* their projection. **Ground truth has exactly one consumer in the whole system: the 12-step pipeline itself** (§3.1).
2. **Projections are deterministic functions of sim state.** The aggregate/salience/fog computation lives *inside the core* (C10), so a projection is re-derivable from replay and per-seat scoping is a pure function, not a network-filtering afterthought. This makes leak auditing *testable*: the property "for all projections to seat s, no ground-truth property outside scope" runs on the function itself, in CI, forever (§3.1, §8 RISK-9).
3. **The `ObservedCell` shape is the binding contract** (§3.1, §4.7). Same cell shape flows worker→main→Pixi adapter, server→relay→remote seats, and save→restore.

### 4.1 ObservedCell (the data/binding contract) (§4.7 fidelity-scaled widget system)

```ts
type ObservedCell = {
  value:        number | null          // null = NO DATA (≠ 0)
  fidelity:     { coverage: 0|1,        // per-PROPERTY not per-object
                  freshness: Duration,  // observation latency 30–60 s default
                  resolution: Res }     // 5m/30s/1s/per-packet
  certainty:    'inferred'|'measured'|'verified'   // → stroke weight
  confidence:   0..1                   // → blur radius px
  status:       StatusChip             // 12-value vocab
  unknownExists: boolean               // "?" badge = known-unknown, always visible
}
```

**Degradation is a property of the binding layer, not of 200 components** — "any architecture where widgets themselves handle fog has already failed the law of one structural decision" (§4.7).

---

## 5. The 12-step deterministic pipeline (§4.1, `hosting_game.md §7.13`)

Every mechanic is a modifier on exactly **one of twelve steps**; the pipeline *is* the extension-point architecture:

`Arrival → Scoring → QoS classification → Routing → Per-hop service → Queue wait (service_time × ρ/(1−ρ)) → Inspection cost → Dependency blocking → Patience check → Outcome (Served/Bounced/Blocked-FP/Landed) → Backpressure & retry re-entry → State & economics step + observed-layer write`.

Two slots are architecturally special:
- **Step 12 is the ONLY writer of the observed layer** (steps 1–11 run ground truth; HUD reads observed only) (§4.1).
- **Step 12.5 rule phase** (empty interpreter at P0): rules run at fixed order, lowest-rule-id tiebreak, **no RNG**, after the observed-layer write, enqueuing hand-intents adjudicated next tick (§2.2 R-2, §4.5, C1).

**Slots, not HP, are life**: capacity = slots; "100% and healthy, or 60% and dying of a slow dependency"; failure at ~150% is a state *with a duration*, not death (§4.1). **Retry storms emerge, unscripted** (§1, §4.1).

---

## 6. Determinism contract (§3.4, §2.2 R-2)

The single TS core removed cross-*language* divergence by construction (C2/C3) but created the **replacement risk: browser-V8 vs Node parity** (§8 RISK-1). The discipline that holds it:

| Law | Meaning |
|---|---|
| **Integer µs time** | discrete-event traversal on integer-µs event keys inside a fixed macro tick; tick boundary = deterministic checkpoint boundary (§4.1) |
| **Fixed-point core** | Q16.16 fixed-point inside classification/bounce/queue math; bounce sigmoid = 64-entry fixed-point LUT; **floats only in display math that cannot touch replay** (§4.1) |
| **Seeded RNG streams** | counter-based, keyed `(run_seed, domain, sim_minute, entity_id)` so one domain's consumption can't perturb another; director draws logged in a `director` domain (§4.1) |
| **No wall-clock / env in sim code** | **no `Math.random`, no `Date.now`, no `Intl`, no locale-dependent sorting**; stable iteration order (Map insertion order only); all platform affordances (storage, audio, network) injected (§3.4) |
| **engineVersion gates replay** | per-§ replay pinning (frozen-replay policy) (§3.4) |
| **Seeded replay** | a replay reproduces every checkpoint hash; state-hash checkpoints double as the CI determinism tripwire (§4.1) |
| **Dual-runtime CI gate** | the same golden-replay fixtures run on browser and Node; **divergence is a build break** (§3.4, §8 RISK-1) |

The **three-clock model**: `simUs` (ops, speed-scaled) + `businessMin` (never scaled/paused) + `wallMs` (drama rates). Speed 1×/2×/4× gates *observation* (log detail thins), **never physics** (§4.1). **Dual Clock rule:** an action belongs to exactly one clock; the business clock never pauses mid-incident (§4.1).

---

## 7. Save & replay artifacts (§3.3)

1. **RunInstance** (per playthrough): seed, engine version, all content hashes (Ruleset Cards, tuning sheets, rule book, grammar-pack refs, twist-list refs), input log, checkpoint ring (`stateHash` every N sim-minutes), attribution ledger stream (cause stamped at creation).
2. **CompanyNode** (lineage tree, Appendix C): generational node + inheritance manifest (assets, scars, doctrines, obligations, cast); four read-faces compiled from ~20 write facets; write-access governed by the still-OPEN mode matrix (OD-9).
3. **Replay bundle** — the unit of: postmortem playback, Decision-Audit counterfactuals, Ratchet Audit, Versus refereeing, leak-QA fixtures, and QA. **Rule: nothing may appear in a replay bundle's rendering path that is not re-derivable from it.**
4. **Settlement batch** (signed, hash-chained): monthly macro settlements — the SP↔server handshake surface and the only place MySQL *mints* canonical numbers.

Replay-bundle header (§3.2): `{seed, engineVersion, rulesetCardHash, sheetsHash, ruleBookHash, instrumentationState, inputs, directorDraws, checkpoints[stateHash]}`.

---

## 8. The two-face back-view law (§2.2 R-1 #2, C13)

Pixi substitution for true-3D rack rotation. The **authored two-face sprite sets (front/back) are CANONICAL** — not provisional — for the rack back-view verbs. The **three actions only doable from the back view** (WS-7 item 1.5, as cited in §2.2 R-1) ship on them; a **flip-key swap replaces the rotate gesture**. The mechanics are fully preserved; only the physical rotate gesture is replaced (§2.2 R-1). This is the ratified resolution of the renderer's one decision-defining 3D verb (§4.7 Q1, closed by C13).

---

## 9. Cinema module — deferred clause (2026-10-06, C13) (§2.2 R-1)

An **offline 3D photo-studio / cutscene renderer** (candidate libs: Three.js or Babylon), signed off as a *post-launch option* alongside the R-1 re-confirmation. It rebuilds the facility as a simplified 3D diorama from **observed-layer snapshot data + seeded replay**, and renders the Money-Shot pullback and free-camera photo mode as a **discrete, non-gameplay mode**.

Hard constraints (non-negotiable):
- **No shared live camera with the Pixi renderer** (no dual-context tax during gameplay).
- **No gameplay-critical rendering may ever depend on true 3D.**
- The module **consumes presentation data only** — the same observed-layer projections Pixi consumes (§3.1, §3.3 rule 3).
- Because runs are seeded + replayable, it can re-stage any past moment for posters/share artifacts.

Until and unless it ships, the 2D substitutions (§2.2 R-1: 2D photo mode + filter stack, 2D choreographed money-shot, Fold-as-morph) remain the shipped behavior.

**Four 3D verbs consciously traded away by R-1** (§2.2 R-1): orbit-selected-object → Z1–Z4 altitude ladder + authored second face; true-3D rack back-rotation → two-face law (§8 above); free-camera photo mode → 2D camera + filter stack; 3D cinematic money-shot → 2D choreographed camera/dolly/layer-isolation.

---

## 10. What is *not* decided here

This document states architecture, not open owner policy. Explicitly deferred to `docs/DECISIONS-PENDING.md`: **OD-5 MP topology** (this repo is scaffolded per recommendation (b) — TS sim as portable library — but the owner sign-off is PENDING, §2.2, §6.1); **OD-1 scorecard weights**, **OD-2 canonical tuning sheet**, **OD-3 content rebalance**, and the rest of the §6 register. The Node port's *existence* is committed (§3.4); its *role as MP session host* is conditional on OD-5 (§3.1, §3.2).
