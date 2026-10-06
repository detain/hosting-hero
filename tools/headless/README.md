# headless-tools — Node-port harness for `@hh/sim-core`

The CI-proof for **RISK-1** (MASTER_REPORT §8; docs/ARCHITECTURE.md §6): the
ratified stack is *one engine, two runtimes* — a browser Web-Worker build and
a Node port — and silent divergence between them is the project's most
expensive possible failure. This package makes that risk **testable today**,
before the real pipeline modules are wired together, and stays the gate as
they land.

Everything here lives in `tools/headless/` and imports sim-core **source
files directly** (see Adapter Design). Nothing outside this package may import
it; it imports nothing from sibling apps.

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
| `run <bundleDir> --seed N --ticks N [--snapshot-every K] [--out FILE]` | Executes the stub-composition sim for N ticks off `<bundleDir>/bundle.json`. Prints stats, per-tick **chain digest**, **final-state digest**, checkpoint list. `--out` writes a self-contained replay artifact (bundle JSON embedded). | 0 ok · 2 usage |
| `replay-verify <artifact.json>` | Re-executes the run captured by `--out` and compares **every checkpoint hash + the chain digest + final state byte-identically**. This is the LONG-SAVE / MP-resync primitive in miniature. | 0 pass · 1 divergence · 2 usage |
| `digest <state.json>` | Canonical (bigint-tagged, insertion-order) digest of a state tree — accepts a standalone state file or a full run artifact (hashes its `finalState`). Includes a decode→re-encode stability self-check. | 0 ok · 1 unstable/garbage |
| `canary [dir]` | Forbidden-API scan (default target `packages/sim-core/src`). | 0 clean · 1 violations |
| `parity [--seed N] [--ticks N]` | Runs the dual-runtime parity fixture in this runtime; prints the JSON report. | 0 |
| `bench [--seed N] [--ticks N] [--target TPS]` | Kernel micro-rates + engine ticks/sec vs the PROVISIONAL budget. | 0 met · 1 missed |

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

`src/harness.ts::runParityFixture(seed, ticks=1000)` is a pure, I/O-free
scripted workout of exactly the kernel surfaces where engines diverge:

- **Arm A — fixed-point:** Q16.16 `fromRatio/mul/div/add/sub/clamp/compare`
  chains, incl. *counted overflow throws* (the exception paths are parity
  surface too) and `inRange` boundaries;
- **Arm B — RNG:** all six step domains per minute via `streamFor`,
  rejection-sampled `range`, `fork` child paths, counter-based **re-open
  position stability** (`first === reopened` is itself hashed);
- **Arm C — clocks:** `advanceClocks` under speed 1/2/4 + incident flips
  (`PARITY_CLOCK`), `scaleUs` floors on `BUSINESS_SCALE_DEFAULT`/`WALL_SCALE`,
  `tickOf`/`simMinuteOf`, counted `subUs` negative-guard throws;
- **Arm D — engine:** the full 13-step stub composition for 1 000 ticks with
  canonical **state digests every 100 ticks** and the rolling chain digest.

Every arm reduces through `src/canonical.ts` — a deterministic JSON form
(sorted object keys, **insertion-ordered** `{"#map":…}`, exact `{"#bi":…}`
bigints, floats *rejected on sight*) — hashed by a **double FNV-1a/64** (no
platform crypto, so no encoding/Endian questions in the thing we're certifying).

`test/parity.test.ts` runs the fixture **×10 inside vitest** (byte-stability),
spawns the **plain-Node arm ×2**, and requires all three byte-identical.
That is the RISK-1 tripwire: divergence here = build break.

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
run): 65 files scanned, 0 violations, 0 advisories — sim-core is
runtime-neutral as promised.** The planted-violation fixture
(`test/fixtures/canary/violations.ts`) locks detection of every rule at exact
lines, with comment/string decoys that must NOT fire.

## Bench + the PROVISIONAL budget

`bench` measures kernel op-rates (fixed-point, rng draws, clock advances) and
full stub-composition ticks/sec, vs **≥ 10 000 ticks/s** by default
(`--target` overrides). The budget is **PROVISIONAL, not ratified** — it was
re-derived from measurement + a CPU profile (2026-10-06, derivation recorded
in `src/bench.ts`): empty-estate floor ≈ 27k t/s, loaded stub ≈ 14.5k t/s on
the dev box. The profile's headline finding: the hot path is **sim-core
kernel bigint math** (`mix64`/splitmix per rng draw, Q16.16 ops) — a kernel
property shared with the real modules, so the 10k floor is set ~30% under the
measured rate as a pure catastrophe detector (accidental O(n²), allocator
churn), not a gameplay performance contract. Current box comfortably passes;
`--target` is honored both directions and exits non-zero when missed.

## Adapter design (the swap, in one move each)

Real modules (pipeline/economy/policy/observed, owned by sibling agents) land
concurrently. Two files isolate every coupling point:

1. **`src/sim-core.ts`** — the *only* file with sim-core paths. Today it
   re-exports `../../../packages/sim-core/src/{types,kernel/*}.ts` because
   the package's `exports` map exposes only `"."` → `src/index.ts`, and
   `index.ts`'s extensionless re-exports break plain-Node resolution. When
   sim-core adds subpath exports, this file's 4 lines become bare specifiers.
2. **`src/slots.ts`** — the *only* composition adapter. `createSlots(cfg)`
   returns `{ slots: PipelineSlots, flavor }`; today flavor `stub-v1`. When
   `pipeline/defaults.ts#createDefaultSlots` (with economy/policy/observed
   steps) is ready, this file changes one import + one call — **and the
   parity harness, CLI, bench and every test automatically certify the real
   composition across both runtimes with zero further edits.**

The stub (`src/stub-slots.ts`) is deliberately complete against the contract:
all 13 steps type-check against the real In/Out shapes, use kernel `fx`/
`streamFor`/clock math only, keep steps pure (Law 3), and thread cause-stamped
events. Documented stub omissions (real modules own these): dependency
blocking, shed, retry re-entries (step 11's input carries no unit bodies),
empty rule interpreter (a legal implementation per `types.ts` step 12.5).

## Determinism notes for artifact readers

- Time in state = integer µs bigints (`{"#bi":…}`), Q16.16 Fixed likewise;
- Money = integer µ$ bigint, never Fixed (contract decision);
- Map iteration = insertion order (the canonicalizer preserves it; object
  keys are sorted — the two rules are explicit, not accidents);
- `timing`/bench numbers are measured with wall clocks **outside** sim state
  and never enter a digest;
- `engineVersion` + `slotsComposition` are stamped into every artifact —
  replaying across a composition flip must fail loudly (it will).

## Lane report (things outside this package, for the orchestrator)

- **Edited one file outside `tools/headless/`:** root `pnpm-workspace.yaml`
  (+1 line `- "tools/*"`) — required for `pnpm -F headless-tools` to resolve
  this package at all. Flagging per the hard rule; trivially revertible.
- **sim-core audit:** zero Node-only APIs in `src/` (grep + canary agree);
  zero fixes needed. One runtime-loading wart for whoever owns sim-core:
  `index.ts`'s extensionless re-exports make the barrel unusable from plain
  Node ESM (`ERR_MODULE_NOT_FOUND`); the kernel files themselves are clean
  (`import type` only).
- **kernel perf finding (report-only):** under the parity/bench workloads the
  hottest sim-core function is `rng.ts#mix64` (bigint splitmix64) — a
  32-bit-limb `Math.imul` rewrite (exactly what `canonical.ts::fnv1a64Hex`
  does against a bigint oracle) would likely double engine throughput if the
  kernel owner chooses it. Behavior must stay bit-identical; the parity
  harness here would certify the swap for free.
