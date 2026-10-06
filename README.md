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
                 one directory per module, each consumed via subpath exports:
                   ./types      shared contract (branded ids, GameState, slots)
                   ./kernel     Q16.16 fixed-point · three clocks · counter RNG
                   ./pipeline   13-slot tick (slots not HP, bounce, retry storms)
                   ./policy     closed-enum Policy-Card interpreter (step 12.5)
                   ./economy    ledger · contracts · billing · dunning · churn
                   ./observed   ground/observed twins, step-12 single writer
                   ./topology   the Board: logical graph + physical embedding
                   ./waves      envelopes · pressure law · director (G2 ledger)
                   ./replay     canonical digests · bundle codec · harness
                   ./loader     JSON→typed boundary · content-CI linters
                   ./save       THE LONG SAVE: lineage graph · facets · migrations
                 Root "." barrel re-exports everything flat. Resolution law:
                 all runtime imports carry explicit `.ts` specifiers so the
                 SAME sources load under vitest/Vite, tsc
                 (allowImportingTsExtensions), and plain Node
                 `--experimental-transform-types` (Node-port parity, RISK-1).
  content/       authored g1 content corpus (schema + waves/threats/visitors).
apps/
  proto/         Phase-1 prototype app (Vite + Vue 3 + PixiJS v8) — WIP.
tools/
  headless/      Node-port harness: CLI, dual-runtime parity gate (RISK-1),
                 forbidden-API canary, perf bench floor.
```

## Commands

```bash
pnpm install                      # workspace install
pnpm -r typecheck                 # tsc --noEmit in every package
pnpm -r test                      # vitest in every package
pnpm -F @hh/sim-core typecheck    # single package
pnpm -F @hh/sim-core test         # single package
```

## Determinism laws (bind every package)

- Integer µs time (`SimTimeUs`, bigint) and Q16.16 fixed-point (`Fixed`) only in
  kernel math paths. Floats are display-only and may never touch replay state.
- No `Math.random`, no `Date.now`, no `Intl`, no locale-dependent sorting,
  Map-insertion-order iteration only (MASTER_REPORT §3.4).
- All randomness via keyed counter-based streams `(runSeed, domain, simMinute,
  entityId)` — MASTER_REPORT §4.1 R-16.
- CI (`.github/workflows/ci.yml`) runs typecheck + tests across the workspace.
