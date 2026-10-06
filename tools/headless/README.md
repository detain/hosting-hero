# headless-tools — Node-port harness for `@hh/sim-core`

The CI-proof for **RISK-1** (MASTER_REPORT §8; docs/ARCHITECTURE.md §6): the
ratified stack is *one engine, two runtimes* — a browser Web-Worker build and
a Node port — and silent divergence between them is the project's most
expensive possible failure. This package made that risk testable from the
stub era, and is the live gate for the real pipeline composition.

Everything here lives in `tools/headless/` and imports sim-core **source
files directly** (see Adapter Design). Nothing outside this package may import
it; it imports nothing from sibling apps.

**Status 2026-10-06 — the swap happened.** The ACTIVE composition is now
`real-v1` (`pipeline/defaults.ts#createDefaultSlots`); the stub stays alive as
the selectable `stub-v1` regression arm (`--flavor stub-v1`) and its pinned
engine bytes still prove the harness threading itself never drifted.

---

## Commands

All commands run through plain Node — no build step (see Toolchain below):

```bash
pnpm -F headless-tools test          # full vitest suite (parity, canary, CLI, digests)
pnpm -F headless-tools typecheck     # tsc (strict) over src+test
pnpm -F headless-tools cli -- <cmd>  # or: node --experimental-transform-types src/cli.ts <cmd>
```

| Command | What it does | Exit codes |
|---|---|---|
| `run <bundleDir> --seed N --ticks N [--snapshot-every K] [--out FILE] [--flavor F]` | Executes the composed sim (flavor `stub-v1`\|`real-v1`, default `real-v1`) for N ticks off `<bundleDir>/bundle.json`. Prints stats (`landed` counts adversarial breaches — real composition only), per-tick **chain digest**, **final-state digest**, checkpoint list. `--out` writes a self-contained replay artifact (bundle JSON embedded, flavor stamped). | 0 ok · 2 usage |
| `replay-verify <artifact.json>` | Re-executes the run captured by `--out` **at the flavor stamped into the artifact** and compares **every checkpoint hash + the chain digest + final state byte-identically**. Stub-era artifacts therefore still replay stub-exactly. This is the LONG-SAVE / MP-resync primitive in miniature. | 0 pass · 1 divergence · 2 usage |
| `digest <state.json>` | Canonical (bigint-tagged, insertion-order) digest of a state tree — accepts a standalone state file or a full run artifact (hashes its `finalState`). Includes a decode→re-encode stability self-check. | 0 ok · 1 unstable/garbage |
| `canary [dir]` | Forbidden-API scan (default target `packages/sim-core/src`). | 0 clean · 1 violations |
| `parity [--seed N] [--ticks N] [--flavor F]` | Runs the dual-runtime parity fixture in this runtime; prints the flavor-stamped JSON report. | 0 |
| `bench [--seed N] [--ticks N] [--target TPS] [--flavor F]` | Kernel micro-rates + engine ticks/sec vs the PROVISIONAL budget. | 0 met · 1 missed |

---

## Toolchain choice: plain Node type-stripping (no tsx)

Node ≥ 22.18 strips TypeScript natively; sim-core's `types.ts` uses
`export enum`, so the CLI runs with **`--experimental-transform-types`**
(bare stripping rejects enums; `transform-types` erases them correctly —
verified empirically on Node v24). Chosen because:

1. **Zero extra deps** — no tsx/esbuild register hooks to drift from CI;
2. **It is the point** — the parity arm must run through a *different* TS→JS
   pipeline than vitest's esbuild transform: V8/amaro transform vs esbuild.
   tsx would collapse that difference into the same bundler family;
3. Sim-core's `index.ts` uses extensionless re-exports which Node ESM rejects
   at runtime regardless of loader, so barrel imports are not an option yet
   anyway (see Adapter Design → swap point #1).

If a future runtime forbids the flag, the fallback is `tsx src/cli.ts` —
every source file is loader-agnostic.

## Dual-runtime parity harness

`src/harness.ts::runParityFixture(seed, ticks=1000, flavor=ACTIVE_COMPOSITION)`
is a pure, I/O-free scripted workout of exactly the kernel surfaces where
engines diverge:

- **Arm A — fixed-point:** Q16.16 `fromRatio/mul/div/add/sub/clamp/compare`
  chains, incl. *counted overflow throws* (the exception paths are parity
  surface too) and `inRange` boundaries;
- **Arm B — RNG:** all six step domains per minute via `streamFor`,
  rejection-sampled `range`, `fork` child paths, counter-based **re-open
  position stability** (`first === reopened` is itself hashed);
- **Arm C — clocks:** `advanceClocks` under speed 1/2/4 + incident flips
  (`PARITY_CLOCK`), `scaleUs` floors on `BUSINESS_SCALE_DEFAULT`/`WALL_SCALE`,
  `tickOf`/`simMinuteOf`, counted `subUs` negative-guard throws;
- **Arm D — engine:** the full 13-step **real-v1** composition
  (`pipeline/defaults.ts#createDefaultSlots` + the adapter's synthetic-baseline
  envelopes) for 1 000 ticks with canonical **state digests every 100 ticks**
  and the rolling chain digest. The report stamps `slotsFlavor`; the
  `stub-v1` arm is selectable for regression and its engineRun digests are
  pinned byte-identical to the stub era (fixture `hh-parity-v2`).

Every arm reduces through `src/canonical.ts` — a deterministic JSON form
(sorted object keys, **insertion-ordered** `{"#map":…}`, exact `{"#bi":…}`
bigints, floats *rejected on sight*) — hashed by a **double FNV-1a/64** (no
platform crypto, so no encoding/Endian questions in the thing we're certifying).

`test/parity.test.ts` runs the fixture **×10 inside vitest** (byte-stability),
spawns the **plain-Node arm ×2**, and requires all three byte-identical — for
the default real-v1 arm **and** the stub-v1 regression arm. Pinned goldens:
real-v1 combined `b0162ab554c4665a18892f2139d7fee8`, stub-v1 combined
`a9b4b7b81c2fbedd7d50246936a458d1` (stub-era engine bytes
`f753121d…`/`be86ce13…` unchanged; the combined moved only because the v2
report shape stamps the flavor), kernel arms A/B/C identical across both
flavors and both eras. That is the RISK-1 tripwire: divergence here = build
break.

## Forbidden-API canary (`src/canary.ts`)

Scans `packages/sim-core/src/**/*.ts` — excluding `__tests__/` — after masking
comments, string- and template-literals (length-preserving, so file:line:col
stay true):

| Rule | Why it's forbidden |
|---|---|
| `Math.random` | unseeded randomness = divergence |
| `Date.now` / `new Date` | wall-clock in sim = divergence |
| `performance.now` | monotonic-but-host clock = divergence |
| `Intl` | locale-dependent formatting = divergence |
| float literals in code | only display-only; a literal in a logic path is the leak vector CONVENTIONS §4 bans |

Advisories (reported, never failed — sim-core fixes are not this package's
lane): `node:`-prefixed imports, `process.`, `require(`, `__dirname`,
`Buffer.*` = **Node-only APIs** that would strand the browser build.

Known limitation (documented in code): regex literals are not parsed.

**Current verdict on the tree (re-checked by `test/canary.test.ts` on every
run): 88 files scanned, 0 violations, 0 advisories — including the REAL slots
code paths (`pipeline/defaults.ts` and friends), which is the point: the
engine directories stay runtime-neutral as promised.** The planted-violation
fixture (`test/fixtures/canary/violations.ts`) locks detection of every rule
at exact lines, with comment/string decoys that must NOT fire.

## Bench + the PROVISIONAL budget

`bench` measures kernel op-rates (fixed-point, rng draws, clock advances) and
full-composition ticks/sec, vs **≥ 7 000 ticks/s** by default (`--target`
overrides, `--flavor` selects). The budget is **PROVISIONAL, not ratified** —
re-derived from measurement on 2026-10-06 (derivation recorded in
`src/bench.ts`): real-v1 9,175–11,711 t/s; stub-v1 18,833–20,942 t/s on the
dev box — the real steps cost ≈ 2× the stub (per-unit rng forks, frozen-record
allocation, Map copies, observed cells). The 7k floor sits ~30 % under the
measured real floor as a pure catastrophe detector (accidental O(n²),
allocator churn), not a gameplay performance contract; the old 10k stub-era
number MISSED the real composition's worst sample, so keeping it would have
manufactured red CI instead of measuring regressions. Current box passes with
headroom; `--target` is honored both directions and exits non-zero when missed.

## Adapter design (the swap, in one move each)

Two files isolate every coupling point — and the flip they were built for
landed 2026-10-06 without touching the harness:

1. **`src/sim-core.ts`** — the *only* file with sim-core paths. Today it
   re-exports `../../../packages/sim-core/src/{types,kernel/*}.ts` **plus
   `pipeline/defaults.ts`** (five lines) because the package's `exports` map
   exposes only `"."` → `src/index.ts`, and `index.ts`'s extensionless
   re-exports break plain-Node resolution. `pipeline/defaults.ts` and its
   siblings import each other with explicit `.ts` specifiers, so they are
   plain-Node-safe. When sim-core adds subpath exports, these five lines
   become bare specifiers.
2. **`src/slots.ts`** — the *only* composition adapter. `createSlots(cfg)`
   returns `{ slots: PipelineSlots, flavor }`; **ACTIVE_COMPOSITION is now
   `real-v1`** (`createDefaultSlots`), with the stub preserved as the
   selectable `stub-v1` regression flavor (`{ flavor }` in code, `--flavor`
   on the CLI). The real flavor adds exactly two adapter duties, documented
   inline: (a) the default arrival step has no synthetic-traffic fallback, so
   the wrapper injects the world baseline (organic ¾ + probe ¼ envelopes
   summing *exactly* to `cfg.baselineRatePerMin`; external envelopes always
   win verbatim); (b) `DefaultPipelineConfig` fields with no harness knob are
   pinned to documented v0 readings (stub-era patience default, R-08 stamps
   at stub scale, `detectionRatio = 1.0` so the aggression slider moves the
   real ROC exactly as it moved the stub's, zero viral loop, etc.).

The stub (`src/stub-slots.ts`) remains byte-frozen as that regression arm: its
parity engineRun digests are pinned to the stub-era goldens, so the engine
threading (extension inputs, `UNIT_HOLD` clearing, retry-depth side table) is
proven inert to foreign slots. Documented stub omissions — dependency
blocking, shed, retry re-entries, empty rule interpreter — are exercised by
the real-v1 arm instead; that was always their purpose.

## Determinism notes for artifact readers

- Time in state = integer µs bigints (`{"#bi":…}`), Q16.16 Fixed likewise;
- Money = integer µ$ bigint, never Fixed (contract decision);
- Map iteration = insertion order (the canonicalizer preserves it; object
  keys are sorted — the two rules are explicit, not accidents);
- `timing`/bench numbers are measured with wall clocks **outside** sim state
  and never enter a digest;
- `engineVersion` + `slotsComposition` are stamped into every artifact and
  `replay-verify` re-executes **at the stamped flavor** — a stub-era artifact
  replays stub-exactly even though the live default is real-v1 (proven in
  `test/cli.test.ts`). An unknown flavor string in an artifact fails loudly
  at parse time.

## Lane report (things outside this package, for the orchestrator)

- **Edited one file outside `tools/headless/`:** root `pnpm-workspace.yaml`
  (+1 line `- "tools/*"`) — required for `pnpm -F headless-tools` to resolve
  this package at all. Flagging per the hard rule; trivially revertible.
- **sim-core audit:** zero Node-only APIs in `src/` (grep + canary agree);
  zero fixes needed. One runtime-loading wart for whoever owns sim-core:
  `index.ts`'s extensionless re-exports make the barrel unusable from plain
  Node ESM (`ERR_MODULE_NOT_FOUND`); the kernel files themselves are clean
  (`import type` only).
- **kernel perf finding (RESOLVED 2026-10-06):** the `rng.ts#mix64` bigint
  splitmix64 → 32-bit-limb `Math.imul` rewrite this lane proposed (against a
  bigint oracle, bit-identical behavior) was adopted by the kernel lane. The
  post-swap numbers above (stub-v1 18.8–20.9k t/s) already include it. New
  measurement from the composition swap: **real-v1 costs ≈ 2× the stub**
  (9.2–11.7k t/s) — the cost centers are the defaults' per-unit `rng.fork`
  per hop, frozen-record allocation, and Map copies. If more throughput is
  wanted, profile there next; this harness certifies any such swap for free.
