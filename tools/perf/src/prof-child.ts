/** perf-tools prof-child — the PROCESS THAT GETS CPU-PROFILLED.
 *
 *  Spawned by profile-pair.ts with node --cpu-prof --cpu-prof-dir=<dir>; can
 *  also be run by hand:
 *    node --experimental-transform-types --cpu-prof --cpu-prof-dir=out src/prof-child.ts --workload engine --nodes 200 --rate 6
 *
 *  Workloads (ported from the audit's p8-profile.ts / p6-prof.ts):
 *    engine  — long advance loop at a grid point (optional --digest per tick)
 *    digest  — warm a 200-node roster, then digestState in a tight loop
 *    versus  — repeated resolveVersusMatch (needs a FULL tree: cwd must be a
 *              packages/sim-core dir whose ../content holds the threat registry)
 *    economy — 1000-contract runEconomyTick loop with fast-rolling business clock
 *    policy  — 200-rule / 5000-tick runRulePhase loop
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { buildCase, gridSpec, runBench } from "./board.ts";
import { parseFlags, parsePositiveInt, UsageError } from "./flags.ts";
import { DEFAULT_SIM_SRC, loadModule, loadTree, type SimTree } from "./tree.ts";

const WORKLOADS = ["engine", "versus", "economy", "digest", "policy"] as const;
type Workload = (typeof WORKLOADS)[number];

function require_(cond: unknown, message: string): asserts cond {
  if (!cond) throw new UsageError(message);
}

async function loadVersus(tree: SimTree) {
  require_(
    existsSync(join(process.cwd(), "..", "content", "threats", "registry-core.json")),
    `versus workload needs cwd = a packages/sim-core dir of a FULL tree (../content/threats/registry-core.json missing from ${process.cwd()}); profile a worktree/repo variant or use another workload`,
  );
  const match = await loadModule(tree.srcRoot, "versus/match.ts", ["resolveVersusMatch"]);
  const fixtures = await loadModule(tree.srcRoot, "versus/__tests__/fixtures.ts", ["matchConfig"]);
  return {
    resolveVersusMatch: match["resolveVersusMatch"] as (config: unknown) => unknown,
    matchConfig: fixtures["matchConfig"] as (overrides: { matchTicks?: number }) => unknown,
  };
}

async function runEngine(tree: SimTree, opts: { nodes: number; rate: number; ticks: number; digest: boolean }): Promise<string> {
  const spec = { ...gridSpec(opts.nodes, opts.rate, opts.digest), ticks: opts.ticks, label: `prof-n${String(opts.nodes)}@${String(opts.rate)}` };
  const r = runBench(tree, spec);
  return `engine n${String(opts.nodes)}@${String(opts.rate)}${opts.digest ? "+digest" : ""}: ${String(opts.ticks)} ticks ${r.ms.toFixed(0)}ms → ${String(Math.round(r.tps))} t/s roster=${String(r.unitsLast)}`;
}

async function runDigestWorkload(tree: SimTree): Promise<string> {
  const { driver, game0, inputs } = buildCase(tree, gridSpec(200, 6, false), "perf-prof");
  let game = game0;
  for (let t = 0; t < 2000; t += 1) game = driver.advance(game, inputs()).state;
  const s = process.hrtime.bigint();
  for (let i = 0; i < 2000; i += 1) tree.pipeline.digestState(game);
  const ms = Number(process.hrtime.bigint() - s) / 1e6;
  return `digest: 2000× digestState over 200-node roster ${ms.toFixed(0)}ms → ${(2000 / (ms / 1000)).toFixed(0)} digests/s`;
}

async function runVersus(tree: SimTree): Promise<string> {
  const { resolveVersusMatch, matchConfig } = await loadVersus(tree);
  const s = process.hrtime.bigint();
  for (let i = 0; i < 8; i += 1) resolveVersusMatch(matchConfig({ matchTicks: 280 }));
  const ms = Number(process.hrtime.bigint() - s) / 1e6;
  return `versus: 8× resolveVersusMatch@280ticks ${ms.toFixed(0)}ms`;
}

async function runEconomy(tree: SimTree): Promise<string> {
  const tick = await loadModule(tree.srcRoot, "economy/tick.ts", ["runEconomyTick"]);
  const config = await loadModule(tree.srcRoot, "economy/config.ts", ["defaultEconomyConfig"]);
  const state = await loadModule(tree.srcRoot, "economy/state.ts", ["emptyEconomyState"]);
  const runEconomyTick = tick["runEconomyTick"] as (input: unknown) => { state: { invoices: unknown[] } };
  const defaultEconomyConfig = config["defaultEconomyConfig"] as () => unknown;
  const emptyEconomyState = state["emptyEconomyState"] as () => unknown;

  const seed = tree.types.asRunSeed(7n);
  const contracts = new Map<unknown, unknown>();
  for (let i = 0; i < 1000; i += 1) {
    const id = tree.types.asEntityId(`c${String(i).padStart(4, "0")}`);
    contracts.set(id, {
      id,
      customerEntityId: tree.types.asEntityId(`cust:${String(i)}`),
      bundleId: "shared",
      mrcMicroUsd: 100_000_000n,
      tcvMicroUsd: 0n,
      acvMicroUsd: 0n,
      termStartMin: 0,
      termEndMin: 2 * 43_200,
      billingCycle: "monthly",
      sla: { uptimeTarget: tree.fixed.fromRatio(999n, 1000n), responseBudgetUs: 0n, creditRate: 0n, creditCap: 0n, claimWindowUs: 0n, autoRenew: false, noticePeriodMin: 0, threeBreachExitRight: false },
      routingLocks: [],
      shedImmunityClassId: null,
      allocations: [],
    });
  }
  let clocks = tree.time.initialClocks();
  let prior = emptyEconomyState() as { invoices: unknown[] };
  const cfg = defaultEconomyConfig();
  let tickNo = 0n;
  for (let t = 0; t < 40; t += 1) {
    // jump the business clock fast so months roll often — max catch-up pressure
    clocks = tree.time.advanceClocks(clocks, { realElapsedUs: 3_000_000_000n, speed: 1, incident: false });
    const out = runEconomyTick({
      context: Object.freeze({ tick: tickNo, minute: tree.time.simMinuteOf(clocks), clocks }),
      runSeed: seed,
      contracts,
      prior,
      cfg,
    });
    prior = out.state;
    tickNo += 1n;
  }
  return `economy: 40 ticks × 1000 contracts, invoices=${String(prior.invoices.length)}`;
}

async function runPolicy(tree: SimTree): Promise<string> {
  const evaluator = await loadModule(tree.srcRoot, "policy/evaluator.ts", ["createRuntimeState", "defaultEvaluationConfig", "runRulePhase"]);
  const typesMod = await loadModule(tree.srcRoot, "types.ts", ["observedKey", "asMetricId", "asMoney", "asRuleId", "asEntityId"]);
  const createRuntimeState = evaluator["createRuntimeState"] as () => unknown;
  const defaultEvaluationConfig = evaluator["defaultEvaluationConfig"] as unknown;
  const runRulePhase = evaluator["runRulePhase"] as (st: unknown, ctx: unknown, cfg: unknown) => { state: { fireLog: { total: number } } };
  const observedKey = typesMod["observedKey"] as (e: unknown, m: unknown) => string;
  const asMetricId = typesMod["asMetricId"] as (s: string) => unknown;
  const asMoney = typesMod["asMoney"] as (b: bigint) => unknown;
  const asRuleId = typesMod["asRuleId"] as (s: string) => unknown;

  const seed = tree.types.asRunSeed(7n);
  const cards: unknown[] = [];
  for (let i = 0; i < 200; i += 1) {
    cards.push(Object.freeze({
      id: asRuleId(`r-${String(i).padStart(3, "0")}`),
      scope: Object.freeze(i % 4 === 3 ? { kind: "estate" as const, ref: null } : { kind: "object" as const, ref: `obj-${String(i % 25)}` }),
      when: Object.freeze([Object.freeze({ metric: asMetricId(`m${String(i % 20)}`), comparator: ">" as const, threshold: Object.freeze({ kind: "value" as const, amount: tree.fixed.fromInt(i % 500), unit: "count" as const }) })]),
      then: Object.freeze([Object.freeze({ id: "scale-out", runbookName: null, value: tree.fixed.fromInt(1) })]),
      band: "execute" as const,
      upkeepMicroUsd: asMoney(1n),
    }));
  }
  const observed = new Map<string, unknown>();
  for (let e = 0; e < 25; e += 1) {
    for (let m = 0; m < 20; m += 1) {
      observed.set(observedKey(tree.types.asEntityId(`obj-${String(e)}`), asMetricId(`m${String(m)}`)), Object.freeze({
        value: BigInt((e * 20 + m) * 37) % 1000n,
        fidelity: 4,
        freshnessUs: 0n,
        coverage: tree.fixed.FIXED_ONE,
        certainty: tree.fixed.FIXED_ONE,
        status: "live" as const,
      }));
    }
  }
  let st = createRuntimeState();
  let clocks = tree.time.initialClocks();
  for (let t = 1; t <= 5000; t += 1) {
    clocks = tree.time.advanceClocks(clocks, { realElapsedUs: 1_000_000n, speed: 1, incident: false });
    const minute = tree.time.simMinuteOf(clocks);
    const r = runRulePhase(st, Object.freeze({
      context: Object.freeze({ tick: BigInt(t), minute, clocks }),
      observed,
      book: cards,
      suppressed: Object.freeze([]),
      rng: tree.rng.streamFor(seed, "rules", minute),
    }), defaultEvaluationConfig);
    st = r.state;
  }
  return `policy: 5000 ticks × 200 rules, fired=${String((st as { fireLog: { total: number } }).fireLog.total)}`;
}

export async function main(argv: readonly string[]): Promise<number> {
  const { flags } = parseFlags(argv);
  if (flags.has("help")) {
    process.stdout.write(`prof-child --workload ${WORKLOADS.join("|")} [--sim-root PATH] [--nodes N] [--rate R] [--ticks N] [--digest]\n(usually spawned by profile-pair.ts with --cpu-prof)\n`);
    return 0;
  }
  const workload = flags.get("workload");
  if (workload === undefined || !(WORKLOADS as readonly string[]).includes(workload)) {
    throw new UsageError(`--workload must be one of ${WORKLOADS.join(", ")}, got "${workload ?? ""}"`);
  }
  const nodes = parsePositiveInt(flags.get("nodes") ?? "200", "nodes");
  const rate = parsePositiveInt(flags.get("rate") ?? "6", "rate");
  const ticks = parsePositiveInt(flags.get("ticks") ?? "4000", "ticks");
  const tree = await loadTree(flags.get("sim-root") ?? DEFAULT_SIM_SRC);
  const out = await ({
    engine: () => runEngine(tree, { nodes, rate, ticks, digest: flags.has("digest") }),
    digest: () => runDigestWorkload(tree),
    versus: () => runVersus(tree),
    economy: () => runEconomy(tree),
    policy: () => runPolicy(tree),
  } as Record<Workload, () => Promise<string>>)[workload as Workload]();
  process.stdout.write(`${out}\n`);
  return 0;
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  return pathToFileURL(entry).href === import.meta.url;
}

if (isDirectRun()) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error: unknown) => {
      process.stderr.write(`prof-child error: ${String(error instanceof Error ? error.message : error)}\n`);
      process.exitCode = error instanceof UsageError ? 2 : 1;
    },
  );
}
