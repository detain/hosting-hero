# CI Workflows

One workflow, `ci.yml`, triggered on push, pull_request, and `workflow_dispatch`
(manual runs). PR runs cancel superseded commits (`cancel-in-progress` on
pull_request only — main pushes always complete). Two jobs: `determinism` (fast
pre-merge signal) and `verify` (Node 22.x + 24.x matrix + contract gates).

## Gates and the contract each one proves

**determinism job — one `vitest run` over every deterministic sim-core dir (Node 22.x).**
Contract: the sim core is bit-reproducible. The command lists, explicitly and
in one invocation: `src/kernel` (oracle/golden fixed-point + RNG streams),
`src/pipeline` (13-step queueing loop, intent-door ×100, serve-bench shapes),
`src/replay` (harness re-runs captured states ×100 → byte-identical canonical
digests), then the module dirs that grew their own ×100 gates — `src/policy`,
`src/economy`, `src/observed`, `src/topology`, `src/save`, `src/coverage`,
`src/versus`, `src/unattended`, `src/loader` — plus `src/waves` (unit-level
seed-stability: same seed ⇒ same director draw / deferral — not a ×100 digest
loop, but the layer every replay gate rides on; 1.2 s) and `src/__tests__`
(the G1–G6 acceptance gates, each re-simulating its scenario ×100 through
`replay.createHarness`). `src/internal/` is excluded: zero test files.
Budget: worst-case fully-serial ceiling ≈3 min (measured 3m03s serial;
file-parallel ≈40 s; 98 files / 1420 tests; dominated serially by versus 34 s,
policy 30 s, unattended 23 s) sits far under the ~5 min pre-merge target, so
nothing was pruned by risk-weight.
Timing-test decision: the contention-adaptive floors (fastForward 2000-tick
calibrated wall, perf-hotpath paired ≥2× ratio, serve-bench clamped tps floor)
are deliberately INCLUDED here, not left to the matrix Test step alone — each
self-calibrates against in-test machine speed, so a loaded runner scales the
budget with the measurement instead of going falsely red, and their subject
matter is determinism-adjacent (queue-ghost regression shapes, memo-vs-naive
digest twins). They also run in the matrix; failure output names the file.
Asymmetry note: `scripts/ci-verify.mjs` stays at its five contract gates. The
determinism set is a strict subset of `pnpm -r test`, which the pre-push
workflow already prescribes for everyone, and duplicating the dir enumeration
in a sixth gate would create two drift-prone sources of truth for one command
(CI owns the list). To mirror this job locally:
`pnpm -F @hh/sim-core exec vitest run src` (or copy the exact step below).

**verify matrix — install → `pnpm -r typecheck` → `pnpm -r test` (Node 22.x + 24.x).**
Contract: every workspace package compiles under strict TS and passes its full
test suite on both matrix runtimes — no per-arm filtering on either. `22.x` is
the baseline arm: it matches the root `engines.node` floor (`>=22`) and also
runs the five contract gates below. `24.x` is the next-LTS forward-compat probe:
it certifies the toolchain (vitest, vite, jsdom, and headless-tools'
`--experimental-transform-types` sub-processes — a Node ≥22.7 flag, hence that
package's `engines.node >=22.18`) holds on the newer major. Both arms satisfy
every package's engines contract, which is exactly why the old carve-outs are
gone: Node 20.x was dropped by owner ratification 2026-10-09 (ADR-0009) — it
never certified a real support claim, only a `--filter '@hh/sim-core'` test
subset while root engines already demanded `>=22`. If true 20.x support were
ever re-ratified, that would be an engines change first and a matrix change
second.

**Contract: API-reference drift — `node docs/api-verify.test.mjs`.**
Contract: `docs/API-REFERENCE.md` lists exactly the names `@hh/sim-core`
actually ships — UNKNOWN (documented but not exported) and MISSING (exported but
undocumented) both fail, in both directions, plus the exports-map/import-table
cross-check. Zero-dep plain Node.

**Contract: content corpus — `node packages/content/script/validate.mjs`.**
Contract: every JSON file under `packages/content/` parses, satisfies its schema
subset, has unique ids and resolvable cross-registry references, keeps the
`null → _todo` discipline and the `PROVISIONAL-[ABC]` tuning-sheet markers, and
obeys §1.7 wave-authoring rules. Zero-dep plain Node.

**Contract: forbidden-API canary — `pnpm -F headless-tools canary`.**
Contract: `packages/sim-core/src` stays runtime-neutral for the one-engine/
two-runtimes stack (RISK-1): no `Math.random`, `Date.now`/`new Date`,
`performance.now`, `Intl`, or float literals in logic paths; Node-only APIs are
advisories. Violations exit 1. (The scan target defaults to sim-core via the
CLI's own path resolution — no flags to invent.)

**Contract: web build — `pnpm -F proto build`.**
Contract: the Phase-1 prototype bundles — vue-tsc + worker tsconfig pass, and
Vite emits the browser build incl. the sim.worker chunk, proving every subpath
import in `apps/proto` resolves in a real bundler.

**Contract: G5 fixture mirror diff — `node scripts/ci-verify.mjs g5-mirror-diff`.**
Contract: `packages/sim-core/src/__tests__/g5-quarter-fixture.ts` — a mirror
forced by sim-core's tsconfig rootDir law (TS6059 forbids the test importing
across packages) — stays a byte-identical copy of
`apps/proto/src/gates/g5/quarter.ts` below its TEST FIXTURE MIRROR header. The
gate strips exactly that header (leading `/** */` block through its closing
`*/` plus the blank line(s) after it), compares the rest with zero
normalization, and on drift fails naming the SYNC LAW (edit upstream first,
then re-copy). A missing file on either side is reported as the owning lane's
mid-edit. The comparison lives in the pre-push mirror script below, invoked
standalone via its gate id.

## Pre-push mirror: `scripts/ci-verify.mjs`

Run the contract gates locally, in CI order, before pushing:

```bash
node scripts/ci-verify.mjs
```

It executes the five contract steps above sequentially (api-verify, content
validate, canary, proto build, g5 mirror diff), streams each tool's own
output, prints a per-gate PASS/FAIL verdict plus a final summary, and exits
non-zero if any gate failed. Pass gate ids to run a subset
(`node scripts/ci-verify.mjs g5-mirror-diff` — what the CI step uses).
Prerequisite files are checked first (loud failure naming the exact
missing path), and the canary gate fails fast with a clear message on Node
<22.18 rather than skipping. It does not replace the matrix jobs — typecheck/
test stay on `pnpm -r typecheck && pnpm -r test`.
