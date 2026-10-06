# CONVENTIONS — Repository Layout, Ownership, Tests, and Sim-Code Law

**Source of truth:** `reports/MASTER_REPORT.md` (2026-10-06). Citations: `§N.M` = `MASTER_REPORT.md`; `hosting_game.md §x.y` = design doc. This file turns the ratified architecture (§3) into repo rules. It does **not** decide anything in §6 of the report.

---

## 1. Monorepo layout (pnpm workspaces)

```
hosting-hero/
├── docs/                    # this directory — design docs (owned by the documentation workstream)
├── reports/                 # MASTER_REPORT.md — canonical design research (read-only here)
├── hosting_game.md          # original spec-only design doc (§-numbered, ~35.5k lines) — immutable reference
├── package.json             # pnpm workspace root
├── pnpm-workspace.yaml
├── packages/
│   ├── sim-core/            # THE deterministic engine — one TS package, runtime-neutral (§3.4)
│   │   └── src/
│   │       ├── kernel/      # Q16.16 fixed-point, integer-µs event keys, RNG streams, three clocks
│   │       ├── pipeline/    # 12-step tick shell; step-12 single writer; step-12.5 rule slot
│   │       ├── observed/    # ground/observed twins; observed_view(consumer); ObservedCell
│   │       ├── policy/      # closed-enum Policy interpreter (Appendix B grammar) — pure, enqueue-only
│   │       ├── economy/     # ledger/money (step 12), cause_id attribution
│   │       ├── topology/    # Board: logical graph + physical embedding + FailureDomain + LinkObject
│   │       ├── waves/       # wave envelopes, director draws, attack-surface deck derivation
│   │       ├── replay/      # ReplayLog, checkpoint ring, state-hash tripwire, replay bundle
│   │       ├── save/        # THE LONG SAVE — envelopes, lineage, write-guard matrix (OD-8), modes
│   │       └── loader/      # strict hand-rolled type-bundle parser (no zod dep), grammar-pack registry (Appendix A/B enums)
│   └── content/             # DATA ONLY — hosting-type bundles, wave tables, packs. No .ts logic (§4.3)
├── apps/
│   └── proto/               # Vite + Vue + TS + PixiJS v8 — Phase-1 prototype app (§2.1 R-1, §4.7)
└── tools/
    └── headless/            # Node port harness of sim-core (§3.4) — MP-host/headless/CI executor
```

### 1.1 Module ↔ design-concept map

| `sim-core/src/` module | Concept it implements | Report source |
|---|---|---|
| `kernel` | Q16.16 fixed-point + integer-µs DES keys; seeded RNG streams `(run_seed, domain, sim_minute, entity_id)`; three-clock model (`simUs` / `businessMin` / `wallMs`) | §3.4, §4.1 (R-16, R-20…R-31), §7.0 |
| `pipeline` | the 12-step tick shell; **step 12 = the ONLY observed-layer writer**; **step 12.5 = rule phase** | §4.1 (`hosting_game.md §7.13`), §4.5, §7.0 |
| `observed` | ground/observed twins; `observed_view(consumer)`; the `ObservedCell` binding contract | §3.1 (laws 1–3), §4.1 (R-66…R-72), §4.7 |
| `policy` | the closed-enum `when/for/then/unless` interpreter — deterministic, no RNG, evaluate-and-enqueue only | §2.2 R-2, C1, §4.5, Appendix B |
| `economy` | double-entry ledger as sim state (step 12) — **C5 restatement**; `cause_id` stamped at creation | §2.3 C5, §3.2, §4.4 (R4) |
| `topology` | one versioned `Board` = logical graph + physical embedding + `FailureDomain` hyperedges; polymorphic `LinkObject` (technical + commercial); blast radius = flood over `TopologyGraph` + `DomainSet` (the TWO-LAYER LAW meeting in `blast.ts`) | §4.2 (architecture contributions), §1 |
| `waves` | wave envelopes (ramp/plateau/decay/composition/telegraph); seeded director draws logged in `director` domain; attack-surface deck derived from the construction log | §4.1, §4.8 (deck legality = `hosting_game.md §2.24` constraints), §7.2 |
| `replay` | append-only `ReplayLog`, checkpoint ring, state-hash CI tripwire, replay bundle (§3.3 rule) | §3.3, §4.1 (replay artifact) |
| `loader` | strict hand-rolled type-bundle parser against the authored Appendix A v0 JSON contract — **no zod dependency** (fail-loud `UNKNOWN_FIELD`); grammar-pack registry (closed enums) | §7.0, Appendix A, Appendix B |
| `save` | THE LONG SAVE — save envelopes + lineage, `WRITE_ACCESS_MATRIX` write-guard (OD-8 pending), modes, migration planner | §3.3, §4.1 (replay artifact), DECISIONS-PENDING OD-8 |

### 1.2 Package rules

- **`packages/content` is data-only.** Official hosting types are authored as mod-format JSON with **no privileged code path** (§4.3 R77, `hosting_game.md §9.11`). Adding a type must never require a code branch in `sim-core` — grep law: `rg "business.?type" packages/sim-core/` returns formatting-only hits (§7.6 G6).
- **`apps/proto` is the Phase-1 prototype** (Vite + Vue + TS + PixiJS v8) — programmer art, not polish (§2.2 R-7). Vue stays **behind the observed-layer boundary**: hot sim state never enters `reactive()` proxies; step-12 snapshots/deltas feed shallow refs (§4.2).
- **`tools/headless` is the Node port of `sim-core`** (§3.4). Required by approved features regardless of OD-5 (Async-Versus, Long Weekend, Analyst forward-sims, Ratchet-Audit, CI determinism gates); its *role as MP session host* is conditional on OD-5. WS-8 slice (d) deliberately hosts the sim on Node inside a browser app as the proof-of-recommendation-(b) (§2.2, §7.7d).
- **The `sim-core` package is imported unchanged** by browser (Web Worker, SP), `tools/headless` (Node), and `apps/proto`'s worker — **one codebase everywhere** (§2.2 R-2, recommendation OD-5(b)).

---

## 2. Directory-ownership rule — one writer per directory

**Each directory in the monorepo has exactly one writing workstream; other workstreams propose changes via the owning workstream.** This mirrors the engine's own single-writer law — step 12 is the *only* writer of the observed layer (§4.1) — and is how the concurrent fleet stayed non-conflicting (this `docs/` tree is owned exclusively by the documentation workstream; root configs and code by others).

Two related invariants reinforce it:
- **Single source per concept.** "Never let a concept live in two layers" (§4.7 item 1.1) and the WS-5 editor-redundancy warning: five surfaces writing "standing behavior" give *player and engine* divergent truth — unify on one store (§8 RISK-14).
- **Shared constants are generated, not copied.** Hue Ledger / Ring Taxonomy / Status Chips come from **one TS module**; "a violation is a compile error, not a QA find" (§4.7 component architecture).

---

## 3. Test rules (vitest)

Framework: **vitest** for TS/JS across `sim-core`, `content` validation, `apps/proto`, and `tools/headless`.

| Rule | Detail | Source |
|---|---|---|
| **Every `sim-core` module ships deterministic-replay tests** | run the same seed → assert byte-identical state hashes; the checkpoint ring doubles as the tripwire | §7.0 (replay/checkpoint row), §8 RISK-1 |
| **×100 byte-identical replay is a hard gate** | G1 (a): identical across ≥2 runs and 1×/4×; G2 (b): ×100 replays; G3 (c): FP set ×100; slice (a): fire-log ×100 | §7.1, §7.2, §7.3, §7.7a |
| **Dual-runtime golden-replay fixtures** | CI runs the same fixtures on **browser and Node**; divergence = build break | §3.4, §8 RISK-1 |
| **Leak property tests** | "for all projections to seat s, no ground-truth property outside scope" — property-test infra in CI from P0, run forever | §3.1 law 2, §8 RISK-9, §7.7d (1,000 seeded runs) |
| **Ruleset Diff Linter in CI** | pairwise-diffs every bundle; errors when changed-hook-count ∉ [3,5], dominant verb doesn't shift, bespoke tally > 5 + 8 params, palette > 20% new; diffs *behavior*, not fields | §4.3, §8 RISK-2, §7.6 |
| **CI runs typecheck + test on every change** | the app stack is TS end-to-end (§4.7); schema validation is the loader's hand-rolled strict parser (no zod) at editor-save and CI | §4.3, §4.7 |
| **Fairness-validator** | every threat card has a pre-purchasable counter pair (`counteredBy`) validated in CI | §8 RISK-10, §4.1 (R-14…R-19) |

Readability/a11y acceptance harness (Quiet/Loud/Thumbnail-128px/greyscale/strobe/keyboard-only + Readout + Shape-First) runs in CI from day one (§7.7b, §4.7 item 1.9).

---

## 4. Hard sim-code prohibitions

The following are **build-breaking in `packages/sim-core/` and `tools/headless/`**. They are the runtime-neutral determinism discipline from §3.4, restated as lint rules. Violations silently destroy MP *and* the fairness promise "the systems-literate audience tests for in the first two hours and never forgives" (§8 RISK-1, §4.8 R2).

| Prohibition | Scope | Why | Escape hatch |
|---|---|---|---|
| **No floats in logic paths** | classification, bounce, queue, economics, any value that reaches state/replay | float/env drift desyncs replays | **Q16.16 fixed-point integers**; floats allowed **only in display-only math that cannot touch replay** (§4.1, §3.4) |
| **No wall-clock** (`Date.now`, `performance.now`) | sim code | nondeterministic time | `simUs` / `businessMin` from the kernel's injected monotonic driver (§4.1) |
| **No unseeded RNG** (`Math.random`) | sim code | unreproducible runs | kernel counter-based seeded streams keyed `(run_seed, domain, sim_minute, entity_id)` (§4.1 R-16) |
| **No `Intl` / locale-dependent sorting** | sim code | locale changes order | explicit comparator on stable keys; Map insertion-order iteration only (§3.4) |
| **No unordered iteration** (`Object.keys` order reliance, `Set`/`Map` order assumptions not pinned) | sim code | engine-dependent order | iterate sorted-by-id or Map-insertion-order; both pinned (§3.4) |
| **No direct platform access** (storage, audio, network, DOM) | sim code | breaks Node/browser parity | platform affordances **injected** into the core (§3.4) |
| **No `eval` / dynamic code in policy** | `policy` module | "a card composer, never a scripting language" | closed-enum interpreter over grammar-validated cards (hand-rolled validator, no zod); **grammar is a frozen spec artifact** (OD-4d) (§4.5, C1, Appendix B) |

**Renderer carve-out:** Pixi/Vue code MAY use floats, wall-clock, and `Math.random` for pure presentation (interpolation, mote jitter, particles) **as long as it never writes back to the sim** — the renderer holds **zero sim authority** and writes only via input events; gestures never reach the sim, only discrete timestamped actions enter the input log (§3.1, §4.2 determinism seam).

---

## 5. What conventions this deliberately does *not* fix

`docs/DECISIONS-PENDING.md` owns the open items. In particular: **`scorecard.weights` (OD-1), `tuning.sheet` + `monthLengthRealMin` (OD-2), `content.threatVisitorCensus` (OD-3), and `mp.topology` (OD-5)** are config knobs, **not** conventions — do not resolve them in code review. The repo is scaffolded *per recommendation (b)* for OD-5, which is a scaffolding choice, not a decision (§2.2, §6.1).
