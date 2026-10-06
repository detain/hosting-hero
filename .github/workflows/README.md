# CI Workflows

One workflow, `ci.yml`, triggered on push, pull_request, and `workflow_dispatch`
(manual runs). PR runs cancel superseded commits (`cancel-in-progress` on
pull_request only — main pushes always complete). Two jobs: `determinism` (fast
pre-merge signal) and `verify` (Node 20.x + 22.x matrix + contract gates).

## Gates and the contract each one proves

**determinism job — `vitest run src/kernel src/pipeline src/replay` (sim-core, Node 22.x).**
Contract: the sim core is bit-reproducible. Kernel oracle/golden tests pin
fixed-point and RNG streams; the pipeline suite pins the 13-step deterministic
queueing loop; the replay harness re-runs captured states ×100 and requires
byte-identical canonical digests. Runs alone, no builds — the earliest red flag.

**verify matrix — install → `pnpm -r typecheck` → tests (Node 20.x + 22.x).**
Contract: every workspace package compiles under strict TS on both matrix
runtimes. Tests run fully on 22.x; the 20.x arm certifies the portability
claim that matters — `@hh/sim-core` (the library the Node port embeds) — by
running its complete deterministic suite (`--filter '@hh/sim-core'`). The
apps stay off 20.x by their own contracts: `headless-tools` declares
`engines.node >=22.18` and spawns `--experimental-transform-types`
sub-processes (Node ≥22.7), and `proto`'s jsdom component tests need the
structuredClone `markAsUncloneable` hook (Node ≥22). Root `engines.node`
remains `>=22`; if the owner ever ratifies true 20.x support, widen this arm.

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
