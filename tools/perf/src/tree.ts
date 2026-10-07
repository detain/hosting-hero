/** Sim-tree loading + the repo read-only law.
 *
 *  A "tree" is one checkout of packages/sim-core/src — the working tree,
 *  another worktree, or any scratch copy. Every bench/profiling tool loads a
 *  tree by ABSOLUTE PATH with dynamic imports (the scratch-audit pattern from
 *  /tmp/opencode/perf6/p6-ab.ts), never via bare specifiers: a variant tree has
 *  no node_modules of its own, and `@hh/sim-core` would always resolve to the
 *  working checkout — silently defeating A/B.
 *
 *  Boundary contract (Parse, Don't Validate): loadModule() verifies every
 *  required export exists BEFORE returning, so all downstream bench code
 *  trusts its facade types; a mid-edit sibling tree fails fast here with the
 *  missing-export list instead of mid-run.
 *
 *  READ-ONLY LAW: the only git commands this package may ever spawn are
 *  `worktree add --detach` (target path must live under /tmp), `worktree
 *  remove`, `worktree prune`, and `rev-parse`. checkout/switch/reset/clean/
 *  stash/merge/rebase/commit/push are rejected in code — a sibling lane once
 *  lost uncommitted work to `git checkout -- .`; never again via this tool.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { PerfError, UsageError } from "./flags.ts";

/* ─────────────────────────── locations ─────────────────────────── */

export const PACKAGE_ROOT = fileURLToPath(new URL("../", import.meta.url)); // tools/perf/
export const REPO_ROOT = fileURLToPath(new URL("../../../", import.meta.url)); // monorepo root
export const DEFAULT_SIM_SRC = join(REPO_ROOT, "packages", "sim-core", "src");

/** Worktrees are parked under /tmp — NEVER inside the repo (law). */
export const DEFAULT_WORKTREE_ROOT = "/tmp/hh-perf-worktrees";

/** Normalise a user-supplied variant locator (repo root, package dir, or src
 *  dir — any of the three) to the tree's `packages/sim-core/src` directory. */
export function resolveSimSrcRoot(input: string): string {
  const p = resolve(input);
  if (existsSync(join(p, "pipeline", "index.ts"))) return p;
  const viaPackage = join(p, "src", "pipeline", "index.ts");
  if (existsSync(viaPackage)) return resolve(join(p, "src"));
  const viaRepo = join(p, "packages", "sim-core", "src", "pipeline", "index.ts");
  if (existsSync(viaRepo)) return resolve(join(p, "packages", "sim-core", "src"));
  throw new UsageError(
    `no sim-core source tree found at "${input}" (expected …/sim-core/src, …/packages/sim-core, a repo root, or a git ref)`,
  );
}

/** Repo root for a loaded tree (…/packages/sim-core/src → repo root); null for
 *  bare scratch copies that carry no repo skeleton. */
export function repoRootOfSimSrcRoot(simSrcRoot: string): string | null {
  const pkg = resolve(simSrcRoot, "..", "..");
  return existsSync(join(pkg, "sim-core", "src", "pipeline", "index.ts")) ? resolve(pkg, "..") : null;
}

/* ─────────────────────────── git guard ─────────────────────────── */

const GIT_ALLOWED_COMMANDS = new Set(["worktree", "rev-parse"]);
const GIT_WORKTREE_SUBCOMMANDS = new Set(["add", "remove", "prune"]);

/** Throws unless the argv is a command this read-only tool may run. Exposed
 *  for unit testing; runGit() is the only spawn site that uses it. */
export function assertGitCommandSafe(args: readonly string[]): void {
  const command = args[0];
  if (command === undefined || command.startsWith("-")) {
    throw new PerfError(`perf-tools is READ-ONLY against the repo: refusing \`git ${args.join(" ")}\``);
  }
  if (!GIT_ALLOWED_COMMANDS.has(command)) {
    throw new PerfError(`perf-tools is READ-ONLY against the repo: refusing \`git ${command}\` (allowed: worktree add/remove/prune, rev-parse)`);
  }
  if (command === "worktree") {
    const sub = args[1];
    if (sub === undefined || !GIT_WORKTREE_SUBCOMMANDS.has(sub)) {
      throw new PerfError(`git worktree subcommand must be add/remove/prune, got "${sub ?? ""}"`);
    }
  }
}

function runGit(args: readonly string[], cwd: string = REPO_ROOT): string {
  assertGitCommandSafe(args);
  const r = spawnSync("git", [...args], { cwd, encoding: "utf8" });
  if (r.status !== 0) {
    throw new PerfError(`git ${args.join(" ")} failed (${r.status}): ${(r.stderr ?? r.stdout ?? "").trim()}`);
  }
  return (r.stdout ?? "").trim();
}

/* ─────────────────────────── worktrees ─────────────────────────── */

export interface WorktreeHandle {
  readonly ref: string;
  readonly dir: string;
  readonly simSrcRoot: string;
}

function slugify(ref: string): string {
  return ref.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "ref";
}

/** Detached worktree of `ref` under worktreeRoot (default /tmp). add only —
 *  the working tree and HEAD of the main checkout are never touched. */
export function addWorktree(ref: string, worktreeRoot: string = DEFAULT_WORKTREE_ROOT): WorktreeHandle {
  if (!worktreeRoot.startsWith("/tmp/") || worktreeRoot.includes("..")) {
    throw new PerfError(`worktree root must be an absolute path under /tmp (law), got "${worktreeRoot}"`);
  }
  const dir = join(worktreeRoot, `${slugify(ref)}-${Date.now().toString(36)}`);
  mkdirSync(worktreeRoot, { recursive: true });
  runGit(["worktree", "add", "--detach", dir, ref]);
  const simSrcRoot = resolveSimSrcRoot(join(dir, "packages", "sim-core", "src"));
  return { ref, dir, simSrcRoot };
}

export function removeWorktree(handle: WorktreeHandle): string {
  try {
    runGit(["worktree", "remove", handle.dir]);
    return `worktree removed: ${handle.dir}`;
  } catch (error) {
    // Fail soft ON PURPOSE: a leftover /tmp worktree is disk noise, not repo
    // damage — the message tells the human exactly what to prune.
    return `WARNING: could not remove worktree ${handle.dir} (${String(error)}); run \`git worktree prune\` later`;
  }
}

/** Is `raw` a filesystem path (→ variant tree) or a git ref (→ worktree)?
 *  The sentinels "repo" and "@" always mean the working checkout's tree. */
export function classifyVariant(raw: string): { readonly kind: "path"; readonly simSrcRoot: string } | { readonly kind: "ref"; readonly ref: string } {
  if (raw === "repo" || raw === "@") return { kind: "path", simSrcRoot: DEFAULT_SIM_SRC };
  const looksLikePath = raw === "." || raw === ".." || raw.startsWith("/") || raw.startsWith("./") || raw.startsWith("../") || existsSync(raw);
  if (looksLikePath) return { kind: "path", simSrcRoot: resolveSimSrcRoot(raw) };
  return { kind: "ref", ref: raw };
}

/* ─────────────────────── module loading boundary ─────────────────── */

type Mod = Record<string, unknown>;

/** Dynamic import at absolute path + fail-loud export census. */
export async function loadModule(simSrcRoot: string, rel: string, required: readonly string[]): Promise<Mod> {
  if (!isAbsolute(simSrcRoot)) throw new PerfError(`loadModule needs an absolute sim-src root, got "${simSrcRoot}"`);
  const url = pathToFileURL(join(simSrcRoot, rel)).href;
  let mod: Mod;
  try {
    mod = (await import(url)) as Mod;
  } catch (error) {
    throw new PerfError(`cannot import ${rel} from tree ${simSrcRoot}: ${String(error instanceof Error ? error.message : error)}`);
  }
  const missing = required.filter((name) => !(name in mod));
  if (missing.length > 0) {
    throw new PerfError(`tree ${simSrcRoot}: ${rel} is missing export(s): ${missing.join(", ")} — the tree is mid-edit or drifted from what perf-tools expects`);
  }
  return mod;
}

/* Structural read-only views of sim state the benches need. The REAL types
 * live in the loaded tree (packages/sim-core/src/types.ts); we deliberately do
 * NOT typecheck against them statically so this package stays green while
 * sibling lanes edit sim-core. */

export interface BoardNodeView {
  readonly queue: readonly unknown[];
}

export interface GameStateView {
  readonly units: { readonly size: number };
  readonly nodes: { readonly size: number; values(): IterableIterator<BoardNodeView> };
  readonly observed: { readonly size: number };
  readonly context: { readonly tick: bigint };
}

export interface TickDriver {
  advance(state: unknown, input: unknown): { readonly state: unknown };
}

export interface SimTree {
  readonly srcRoot: string;
  readonly pipeline: {
    createDefaultSlots: (config: unknown) => unknown;
    createTickDriver: (slots: unknown, rng: unknown, clocks: unknown) => TickDriver;
    createInitialState: (input: unknown) => unknown;
    makeSlots: (slots: number) => unknown;
    digestState: (state: unknown) => string;
    /** Present only in instrumented scratch trees (segment timing technique,
     *  README §Segment instrumentation) — bench loops surface it when set. */
    readonly ACC?: Map<string, { ns: bigint; n: number }>;
  };
  readonly fixed: {
    readonly FIXED_ONE: unknown;
    readonly FIXED_ZERO: unknown;
    fromInt: (n: number) => unknown;
    fromRatio: (num: bigint, den: bigint) => unknown;
  };
  readonly time: {
    initialClocks: () => unknown;
    advanceClocks: (clocks: unknown, opts: unknown) => unknown;
    simMinuteOf: (clocks: unknown) => number;
  };
  readonly rng: {
    streamFor: (seed: unknown, domain: string, minute: number, entity?: unknown) => unknown;
  };
  readonly types: {
    asEntityId: (s: string) => unknown;
    asRunSeed: (b: bigint) => unknown;
    asMetricId?: (s: string) => unknown;
    asRuleId?: (s: string) => unknown;
    asMoney?: (b: bigint) => unknown;
    observedKey?: (entityId: unknown, metricId: string) => string;
  };
}

const PIPELINE_EXPORTS = ["createDefaultSlots", "createTickDriver", "createInitialState", "makeSlots", "digestState"] as const;
const FIXED_EXPORTS = ["FIXED_ONE", "FIXED_ZERO", "fromInt", "fromRatio"] as const;
const TIME_EXPORTS = ["initialClocks", "advanceClocks", "simMinuteOf"] as const;
const RNG_EXPORTS = ["streamFor"] as const;
const TYPES_EXPORTS = ["asEntityId", "asRunSeed"] as const;

/** Load the five base modules every bench needs, verified at the boundary. */
export async function loadTree(simSrcRoot: string = DEFAULT_SIM_SRC): Promise<SimTree> {
  const root = resolveSimSrcRoot(simSrcRoot);
  const [pipeline, fixed, time, rng, types] = await Promise.all([
    loadModule(root, "pipeline/index.ts", PIPELINE_EXPORTS),
    loadModule(root, "kernel/fixed.ts", FIXED_EXPORTS),
    loadModule(root, "kernel/time.ts", TIME_EXPORTS),
    loadModule(root, "kernel/rng.ts", RNG_EXPORTS),
    loadModule(root, "types.ts", TYPES_EXPORTS),
  ]);
  return {
    srcRoot: root,
    pipeline: pipeline as unknown as SimTree["pipeline"],
    fixed: fixed as unknown as SimTree["fixed"],
    time: time as unknown as SimTree["time"],
    rng: rng as unknown as SimTree["rng"],
    types: types as unknown as SimTree["types"],
  };
}
