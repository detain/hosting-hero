# @hh perf-tools (`perf-tools`)

Permanent home for the 2026-10-07 perf-audit harness (`/tmp/opencode/perf/` +
`/tmp/opencode/perf6/` scratch: grid harness, segment instrumentation,
CPU-profile pair + summarizer, A/B trees). Everything measures the **real**
`@hh/sim-core` pipeline composition (`createDefaultSlots` + `createTickDriver`)
loaded by absolute path from whichever tree you point it at — so it can bench
a worktree, a ref, or a scratch copy without any build step.

Plain-Node toolchain (same law as `tools/headless`): `--experimental-transform-types`
(node >= 22.18) because `types.ts` carries `export enum`. No dependencies.

## ⚠ Contention caveat — read this before quoting a number

This dev box and the CI runners are **shared**: the GPU media sweep, vitest
workers, and sibling agents all run concurrently. A single sample is noise.

* every cell is **best-of-N** (grid `--reps`, default 3) and also reports the
  **median**;
* A/B arms are **interleaved** (A,B,A,B) so load drift hits both equally;
* every JSON report embeds `meta.loadAvg1` / `cpuCount` / `measuredAt` —
  **quote numbers together with their load average**, and re-run rather than
  trust a cell whose samples disagree by > ~15 %.

## Commands

All runnable as `pnpm -F perf-tools <script> -- <flags>` or directly with
`node --experimental-transform-types src/<tool>.ts <flags>`.

### 1. `src/grid.ts` — throughput grid (board size × arrival rate)

| flag | meaning |
|---|---|
| `--arms advance,digest` | `advance` = `driver.advance` only (engine floor). `digest` = advance + `digestState` **every tick** — what the real host loops (unattended `fastForward`, proto runner, replay harness) actually pay. Default: both. |
| `--nodes 2,10,50,200` / `--rates 6,50,200` | the audit grid: two routable path nodes (edge→origin) idle-padded to the size point — per-tick board walks (`serve`/`purgeTerminals`/`sortedIds`) touch **every** node, so padding is what a "200-node board" costs. |
| `--ticks N` | default auto: 2000 on `n<100`, 1000 on `n≥100`. |
| `--reps N` | best-of-N per cell (1 = quick look). |
| `--only n2@6,n200@200` | subset of cells. |
| `--sim-root PATH` | bench another tree. |
| `--json PATH\|-` | machine-readable report (+ `meta`, per-rep samples, queue/ghost census). |
| `--dry-run` | planned-cell census as JSON, zero execution. |

```bash
node --experimental-transform-types src/grid.ts --only n2@6 --arms advance --reps 1 --json -
```

### 2. `src/ab.ts` — two-tree A/B (paths **or** git refs)

Default suite = the FIX-8 reproduction shape: `congested` (1-slot path,
hours-long services, patience > run → pure waiter backlog where queue-ghosts
are guaranteed) plus `control-n2` / `control-n200` (grid cells a
behaviour-preserving fix must show as **~1.00x no-ops**). `--cells n50@6`
appends grid-shaped cells; `--digest` adds per-tick `digestState`.

```bash
# path variant (scratch copy, prepared tree) — speedup is B/A:
node --experimental-transform-types src/ab.ts --variant-a repo --variant-b /tmp/opencode/perf6/fix/src

# git-ref variant: detached worktree under /tmp, removed on exit
node --experimental-transform-types src/ab.ts --variant-a HEAD~1 --variant-b HEAD --reps 3 --json /tmp/ab.json
```

**The law (why you can trust this near a dirty tree):** perf-tools is
READ-ONLY against the repo. `src/tree.ts#assertGitCommandSafe` whitelists
exactly `worktree add --detach` / `remove` / `prune` and `rev-parse`;
`checkout`/`switch`/`reset`/`clean`/`stash`/`merge`/`rebase`/`commit`/`push`
throw before any spawn, worktree targets must live under `/tmp`, and
`--dry-run` proves the plan without touching git at all. A sibling lane once
lost uncommitted work to an in-tree `git checkout -- .` — that can never come
from this tool.

**Stale-worktree note:** an interrupted `ab.ts` run (Ctrl-C, crash, timeout)
can die before its exit cleanup and leave its detached worktrees registered
under `/tmp/hh-perf-worktrees/` (default; `--worktree-root` relocates them).
This is harmless bookkeeping — later runs proceed normally — but to reclaim
the disk and clear the registrations run `git worktree prune` (whitelisted;
same remedy `removeWorktree` prints when a removal itself fails).

Instrumented trees: if the loaded tree's pipeline barrel exports an `ACC`
Map (the segment-instrumentation pattern, see §Techniques), the A/B and grid
runners print its µs/tick breakdown per scenario automatically.

### 3. `src/profile-pair.ts` + `src/summarize.mjs` — CPU-profile pair

Folds the audit's p8/p10 pattern: each workload runs in a child spawned with
`--cpu-prof --cpu-prof-dir=<out>/<arm>`; pass `--variant` twice to profile
baseline vs candidate under an identical workload (sequential — the box's CPUs
are shared with model servers).

```bash
# one-shot: profile the engine at a grid point and print the summary
node --experimental-transform-types src/profile-pair.ts --workload engine --nodes 200 --rate 6 --summarize

# pair: HEAD vs a fix tree, both summarized
node --experimental-transform-types src/profile-pair.ts --workload engine --digest \
  --variant repo --variant /tmp/opencode/perf6/fix/src --summarize --out /tmp/prof-run
```

Workloads: `engine` (advance loop, `--digest` optional), `digest` (warm a
200-node roster then tight `digestState` loop), `versus` (needs a full repo
layout — its fixture reads `../content` relative to CWD), `economy`
(1000 contracts × 40 fast-rolling-month ticks), `policy` (200 rules × 5000
rule-phase ticks).

`summarize.mjs` is standalone too (no transform flag needed):

```bash
node src/summarize.mjs <dir-or-.cpuprofile>            # ## AREAS + ## TOP
node src/summarize.mjs /tmp/prof-run/1-repo --function advance   # + line:col split
node src/summarize.mjs /tmp/prof-run/1-repo --json     # machine-readable
```

`--function` reproduces the trick that decomposed driver `advance`
self-time: cpuprofile samples carry line+column, so a single inlined
function's cost splits by `line:col`.

## Techniques proven in the audit, kept reproducible

* **Ghost census** — `runBench` counts per-node queue duplicates every 20
  ticks (Set-size delta; Set-sizing per tick would skew the bench itself) and
  reports `finalQueue/finalDuplicates/maxDuplicates`. This is how FIX-8's
  99.1 %-ghosts finding was measured.
* **Segment instrumentation** — copy `packages/sim-core/src` to a scratch
  tree, wrap the driver's internal phases with `performance.now()` folds into
  an exported `ACC = new Map<string,{ns:bigint,n:number}>`, then
  `ab --variant-b <scratch>/src` prints µs/tick per segment. The tool never
  edits a tree — the copy is yours (the audit's lived at
  `/tmp/opencode/perf6/instr/`).

## History (baselines the audit pinned)

2026-10-07 pre-FIX-8 @stub-era boxes: congested 300t ≈ 53 t/s head → ~1178
t/s fixed; `grid200` ≈ 886 → 1175; idle ≈ 1374 → 2258 t/s. Post-landing
numbers move with each lane — always compare **arms in one run**, never
against yesterday's absolute (contention caveat above).

## Tests

`pnpm -F perf-tools test` runs **smoke only** — `--help`, `--dry-run` and the
pure guards (git-command whitelist, `/tmp`-worktree rule, summarize over a
synthetic profile). Long benches are manual by policy: a perf suite in the
shared `pnpm -r test` roster would only manufacture flakes.
