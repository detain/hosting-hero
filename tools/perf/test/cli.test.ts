/** CLI smoke tests — the ONLY perf tests allowed in `pnpm -r test`:
 *  --help, --dry-run and pure-guard surfaces. Real benches/grid/A-B/profile
 *  runs are manual by design (shared-box contention; see README §Contention). */

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

import { addWorktree, assertGitCommandSafe, classifyVariant, resolveSimSrcRoot } from "../src/tree.ts";

const PKG_ROOT = fileURLToPath(new URL("../", import.meta.url));
const SRC = join(PKG_ROOT, "src");

function runTool(script: string, args: readonly string[]): { status: number | null; stdout: string; stderr: string } {
  const r = spawnSync(process.execPath, ["--experimental-transform-types", join(SRC, script), ...args], {
    cwd: PKG_ROOT,
    encoding: "utf8",
    timeout: 120_000,
  });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

const tmpDirs: string[] = [];
function makeTmp(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tmpDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tmpDirs) rmSync(dir, { recursive: true, force: true });
});

describe("grid CLI surface", () => {
  it("--help exits 0 and documents the flags", () => {
    const r = runTool("grid.ts", ["--help"]);
    expect(r.status).toBe(0);
    for (const flag of ["--arms", "--nodes", "--rates", "--reps", "--only", "--json", "--dry-run"]) {
      expect(r.stdout).toContain(flag);
    }
  });

  it("--dry-run plans cells without executing a single tick", () => {
    const r = runTool("grid.ts", ["--dry-run", "--arms", "advance", "--nodes", "2,10", "--rates", "6", "--reps", "1"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('"dry_run"');
    expect(r.stdout).toContain("n2@6");
    expect(r.stdout).toContain("n10@6");
    expect(r.stdout).not.toContain(" t/s ");
    expect(r.stdout).not.toContain("SUMMARY {");
  });

  it("rejects an unknown arm with usage exit 2", () => {
    const r = runTool("grid.ts", ["--arms", "quantum"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("--arms");
  });
});

describe("ab CLI surface (read-only law)", () => {
  it("--help exits 0 and shows variants + the read-only promise", () => {
    const r = runTool("ab.ts", ["--help"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("--variant-a");
    expect(r.stdout).toContain("READ-ONLY");
  });

  it("requires both variants", () => {
    const r = runTool("ab.ts", []);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("--variant-a is required");
  });

  it("--dry-run with path variants resolves trees, loads nothing, spawns no git", () => {
    const r = runTool("ab.ts", ["--dry-run", "--variant-a", "repo", "--variant-b", "repo", "--scenarios", "congested"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('"dry_run": true');
    expect(r.stdout).toContain("congested");
    expect(r.stdout).toContain("no git spawned");
  });

  it("--dry-run with a ref variant names the worktree it WOULD create (still no git)", () => {
    const r = runTool("ab.ts", ["--dry-run", "--variant-a", "HEAD~1", "--variant-b", "repo"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("<worktree HEAD~1>");
  });

  it("unknown scenario fails with the vocabulary", () => {
    const r = runTool("ab.ts", ["--dry-run", "--variant-a", "repo", "--variant-b", "repo", "--scenarios", "warp-drive"]);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("congested");
  });
});

describe("git read-only guard (unit)", () => {
  it("allows worktree add/remove/prune and rev-parse", () => {
    expect(() => assertGitCommandSafe(["worktree", "add", "--detach", "/tmp/x", "HEAD"])).not.toThrow();
    expect(() => assertGitCommandSafe(["worktree", "remove", "/tmp/x"])).not.toThrow();
    expect(() => assertGitCommandSafe(["worktree", "prune"])).not.toThrow();
    expect(() => assertGitCommandSafe(["rev-parse", "--show-toplevel"])).not.toThrow();
  });

  it("refuses every working-tree-mutating verb", () => {
    for (const args of [["checkout", "master"], ["switch", "-c", "x"], ["reset", "--hard"], ["clean", "-fd"], ["stash"], ["merge", "x"], ["rebase", "x"], ["commit", "-m", "x"], ["push"]]) {
      expect(() => assertGitCommandSafe(args)).toThrow(/READ-ONLY/);
    }
    expect(() => assertGitCommandSafe(["worktree", "lock", "/tmp/x"])).toThrow(/add\/remove\/prune/);
  });

  it("worktrees must target /tmp (law), never the repo", () => {
    expect(() => addWorktree("HEAD", join(PKG_ROOT, "tmp-worktrees"))).toThrow(/under \/tmp/);
    expect(() => addWorktree("HEAD", "/tmp/../etc/hh-x")).toThrow(/under \/tmp/);
  });
});

describe("variant classification + tree resolution (unit)", () => {
  it("the repo sentinel resolves to this checkout's sim-core src", () => {
    const v = classifyVariant("repo");
    expect(v.kind).toBe("path");
    if (v.kind === "path") {
      expect(v.simSrcRoot.endsWith(join("packages", "sim-core", "src"))).toBe(true);
    }
  });

  it("accepts src dir, package dir, or repo root; rejects garbage", () => {
    const src = resolveSimSrcRoot(join(PKG_ROOT, "..", "..", "packages", "sim-core", "src"));
    expect(src).toContain("sim-core");
    expect(resolveSimSrcRoot(join(PKG_ROOT, "..", "..", "packages", "sim-core"))).toBe(src);
    expect(resolveSimSrcRoot(join(PKG_ROOT, "..", ".."))).toBe(src);
    expect(() => resolveSimSrcRoot("/definitely/not/a/tree")).toThrow(/no sim-core source tree/);
  });

  it("non-path strings classify as refs", () => {
    expect(classifyVariant("v0.1.0-phase1").kind).toBe("ref");
    expect(classifyVariant("origin/master").kind).toBe("ref");
  });
});

describe("profile-pair CLI surface", () => {
  it("--help exits 0", () => {
    const r = runTool("profile-pair.ts", ["--help"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("--workload");
  });

  it("requires a known workload", () => {
    const r = runTool("profile-pair.ts", []);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("--workload");
  });

  it("--dry-run prints the planned --cpu-prof spawns and starts nothing", () => {
    const out = makeTmp("hh-perf-dry-");
    const r = runTool("profile-pair.ts", ["--dry-run", "--workload", "engine", "--variant", "repo", "--out", out]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("--cpu-prof-dir=");
    expect(r.stdout).toContain("nothing spawned");
  });
});

describe("summarize.mjs", () => {
  function fakeProfile(): { dir: string; file: string } {
    const dir = makeTmp("hh-perf-prof-");
    const nodes = [
      { id: 1, callFrame: { functionName: "(root)", url: "", lineNumber: 0, columnNumber: 0 }, children: [2, 3, 4], parent: undefined },
      { id: 2, callFrame: { functionName: "advance", url: "file:///repo/packages/sim-core/src/pipeline/driver.ts", lineNumber: 99, columnNumber: 10 }, parent: 1 },
      { id: 3, callFrame: { functionName: "serveStep", url: "file:///repo/packages/sim-core/src/pipeline/defaults.ts", lineNumber: 41, columnNumber: 4 }, parent: 1 },
      { id: 4, callFrame: { functionName: "next", url: "file:///repo/packages/sim-core/src/kernel/rng.ts", lineNumber: 7, columnNumber: 2 }, parent: 1 },
    ];
    const samples = [2, 2, 2, 2, 3, 3, 4];
    const file = join(dir, "CPU.fake.cpuprofile");
    writeFileSync(file, JSON.stringify({ nodes, samples }), "utf8");
    return { dir, file };
  }

  it("prints AREAS + TOP with percentages over a synthetic profile", () => {
    const { dir } = fakeProfile();
    const r = spawnSync(process.execPath, [join(SRC, "summarize.mjs"), dir], { encoding: "utf8", timeout: 30_000 });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("## AREAS");
    expect(r.stdout).toContain("driver.ts advance (rest)");
    expect(r.stdout).toContain("defaults.ts serve");
    expect(r.stdout).toContain("kernel (rng/fixed/time)");
    expect(r.stdout).toContain("advance @ packages/sim-core/src/pipeline/driver.ts:100");
    expect(r.stdout).toContain("57.1%");
  });

  it("--function decomposes one function's self-time by line:column", () => {
    const { file } = fakeProfile();
    const r = spawnSync(process.execPath, [join(SRC, "summarize.mjs"), file, "--function", "advance"], { encoding: "utf8", timeout: 30_000 });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("LINE:COLUMN");
    expect(r.stdout).toContain("line:col 100:11");
  });

  it("missing profile in dir → exit 1", () => {
    const dir = makeTmp("hh-perf-empty-");
    const r = spawnSync(process.execPath, [join(SRC, "summarize.mjs"), dir], { encoding: "utf8", timeout: 30_000 });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("no .cpuprofile");
  });
});
