# Hosting Hero — Hosting Company Tower Defense

Greenfield implementation of the design consolidated in
[`reports/MASTER_REPORT.md`](reports/MASTER_REPORT.md) (spec source:
`hosting_game.md`). The authoritative sim is a deterministic, runtime-neutral
TypeScript core (Q16.16 fixed-point + integer-µs time + counter-based seeded
RNG streams); browser Web Worker for single-player, Node port for MP/headless.
Macro/services live in PHP + Workerman (later phase, outside this repo's
Phase-1 packages).

## Layout

```
packages/
  sim-core/      @hh/sim-core — the whole deterministic engine, one package,
                 one directory per module (14: the 13 below + internal/),
                 each consumed via subpath exports:
                   ./types      shared contract (branded ids, GameState, slots)
                   ./kernel     Q16.16 fixed-point · three clocks · counter RNG
                   ./pipeline   13-slot tick (slots not HP, bounce, retry storms)
                   ./policy     closed-enum Policy-Card interpreter (step 12.5)
                   ./economy    ledger · contracts · billing · dunning · churn
                   ./observed   ground/observed twins, step-12 single writer
                   ./topology   the Board: logical graph + physical embedding
                   ./waves      envelopes · pressure law · director (G2 ledger)
                   ./replay     canonical digests · bundle codec · harness
                   ./loader     JSON→typed boundary · content-CI linters · i18n packs
                   ./save       THE LONG SAVE: lineage graph · facets · migrations
                   ./coverage   12×9 threat×defense grid · dark-cell teaching
                   ./versus     ADR-0004 async Red-vs-Blue decks · draft · match
                   ./unattended Long-Weekend fast-forward · guardrails · what-if
                 `internal/` (canonical-codec home) is barrel-invisible by
                 design. Root "." barrel re-exports everything flat.
                 Resolution law: all runtime imports carry explicit `.ts`
                 specifiers so the SAME sources load under vitest/Vite, tsc
                 (allowImportingTsExtensions), and plain Node
                 `--experimental-transform-types` (Node-port parity, RISK-1).
  content/       authored g1 content corpus (schema + waves/threats/visitors
                 registries + wave slices + 2 i18n packs + validators).
apps/
  proto/         Phase-1 prototype app (Vite + Vue 3 + PixiJS v8): worker
                 protocol, Pixi world + budget/hue law, chrome HUD, the six
                 §9.13 gate panels, the Sim Lab rail, and i18n pack copy.
tools/
  headless/      Node-port harness: CLI, dual-runtime parity gate (RISK-1),
                 forbidden-API canary, perf bench floor.
  perf/          perf-tools: permanent throughput grid (board × rate),
                 two-tree A/B (paths or git refs, worktrees strictly under
                 /tmp), CPU-profile pair + summarizer. Plain Node, zero deps.
                 READ-ONLY against the repo; its contention law lives in
                 tools/perf/README.md — quote any number WITH its load avg.
```

## Commands

```bash
pnpm install                      # workspace install
pnpm -r typecheck                 # tsc --noEmit in every package (4)
pnpm -r test                      # vitest in every package
pnpm -F @hh/sim-core test         # single package (add -- --no-file-parallelism
                                  # when timing gates matter — contention law)
node scripts/ci-verify.mjs        # the 5 CI contract gates, locally, in order
node docs/api-verify.test.mjs     # export-name ↔ docs/API-REFERENCE.md tripwire
pnpm -F headless-tools canary     # forbidden-API scan of sim-core sources
pnpm -F perf-tools grid -- --reps 3            # board×rate throughput grid
pnpm -F perf-tools ab -- --variant-a HEAD~1 --variant-b HEAD   # A/B bench
pnpm -F perf-tools profile -- --area engine    # CPU-profile pair (+ summarize)
```

## Determinism laws (bind every package)

- Integer µs time (`SimTimeUs`, bigint) and Q16.16 fixed-point (`Fixed`) only in
  kernel math paths. Floats are display-only and may never touch replay state.
- No `Math.random`, no `Date.now`, no `Intl`, no locale-dependent sorting,
  Map-insertion-order iteration only (MASTER_REPORT §3.4).
- All randomness via keyed counter-based streams `(runSeed, domain, simMinute,
  entityId)` — MASTER_REPORT §4.1 R-16.
- CI (`.github/workflows/ci.yml`) runs typecheck + tests across the workspace
  plus the five contract gates (api-verify, content validate, canary, proto
  build, g5 mirror-sync) on the 22.x arm.

## Where the build stands (2026-10-08, tip `b6b03b0`)

All six §9.13 Phase-1 prototype gates are GREEN headless and mounted in the
proto app; the sim core ships fourteen module directories (1,420 tests /
98 files in one serial battery — pipeline 189 incl. the FIX-8 ghost-dedup,
serve COW and the rec#5 targeted-purge graduation pin, versus 116 incl. the
observable memo-degradation stats, unattended 108 with its review closeout);
the chrome HUD, Sim Lab bench rail, and i18n pack voices (door refusals and
quarter copy speak the content packs, era-tracked end-to-end) are live; the
2026-10-07 perf audit is institutionalized as `tools/perf`. Battery:
sim-core 1,420/98 · proto 431/49 · headless 53/5 · perf-tools 20/1 · api-verify PASS 1,270 names · canary PASS
105 files · ci-verify 5/5 · typecheck 4/4. What remains is owner decisions,
not engine work: the gap register in `docs/MODULE-STATUS.md` and
`docs/DECISIONS-PENDING.md` list them (OD-1/OD-2/OD-8, T-9, Q-P3-1, coverage
taste rows, the ratification batch, ADR-0008 — proposed, nothing installed).
