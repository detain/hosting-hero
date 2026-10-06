/**
 * CLI smoke tests — every subcommand exercised through child_process,
 * exactly as CI/user invokes it (plain Node + transform-types).
 */

import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

const run = promisify(execFile);
const CLI = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
const PKG_ROOT = fileURLToPath(new URL("..", import.meta.url));
const BUNDLE_DIR = fileURLToPath(new URL("./fixtures/bundles/demo", import.meta.url));

let workDir = "";

beforeAll(() => {
  workDir = mkdtempSync(join(tmpdir(), "hh-cli-"));
});

afterAll(() => {
  rmSync(workDir, { recursive: true, force: true });
});

interface CliResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}

async function cli(...args: string[]): Promise<CliResult> {
  try {
    const { stdout, stderr } = await run(process.execPath, ["--experimental-transform-types", CLI, ...args], {
      cwd: PKG_ROOT,
      maxBuffer: 32 * 1024 * 1024,
    });
    return { code: 0, stdout, stderr };
  } catch (error) {
    const e = error as { code?: number; stdout?: string; stderr?: string };
    return { code: e.code ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

describe("cli: run + replay-verify + digest", () => {
  const artifactPath = () => join(workDir, "run-50.json");

  it("run writes a self-contained artifact and stable digests", async () => {
    const first = await cli("run", BUNDLE_DIR, "--seed", "42", "--ticks", "50", "--snapshot-every", "25", "--out", artifactPath());
    expect(first.stderr.toLowerCase()).not.toContain("error");
    expect(first.stdout).toContain("chain:");
    expect(first.stdout).toMatch(/stats: arrived=\d+ served=\d+/);
    expect(first.stdout).toContain("slots=real-v1"); // ACTIVE_COMPOSITION is the CLI default

    const second = await cli("run", BUNDLE_DIR, "--seed", "42", "--ticks", "50", "--snapshot-every", "25");
    const chainOf = (out: string): string => /chain: ([0-9a-f]{32})/.exec(out)?.[1] ?? "";
    expect(chainOf(second.stdout)).toBe(chainOf(first.stdout)); // determinism ACROSS processes

    const third = await cli("run", BUNDLE_DIR, "--seed", "43", "--ticks", "50", "--snapshot-every", "25");
    expect(chainOf(third.stdout)).not.toBe(chainOf(first.stdout)); // seed-sensitive

    // Real composition produces the defense dynamics the stub approximated:
    // hostiles land (breach) AND get neutralized (blocked) — both nonzero.
    expect(first.stdout).toMatch(/landed=[1-9]\d*/);
    expect(first.stdout).toMatch(/blocked=[1-9]\d*/);
  }, 120_000);

  it("run --flavor stub-v1 reproduces the FROZEN stub-era bytes exactly", async () => {
    const stubArtifactPath = join(workDir, "run-50-stub.json");
    const result = await cli(
      "run", BUNDLE_DIR, "--seed", "42", "--ticks", "50", "--snapshot-every", "25",
      "--flavor", "stub-v1", "--out", stubArtifactPath,
    );
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("slots=stub-v1");
    // Every number below is the pre-swap baseline capture (stub era, v1 CLI):
    expect(result.stdout).toContain("stats: arrived=211 served=190 landed=0 bounced=0 blocked=17 events=418");
    expect(result.stdout).toContain("chain: 5522f344d6bbb83718dfd72a2153524f");
    expect(result.stdout).toContain("final: 3d4b9bef635615b145f51b0121e3c11b");

    // A stub-stamped artifact replays at its stamped flavor — never the live default.
    const verify = await cli("replay-verify", stubArtifactPath);
    expect(verify.code).toBe(0);
    expect(verify.stdout).toContain("PASS");
  }, 120_000);

  it("run rejects an unknown --flavor with usage exit 2", async () => {
    const result = await cli("run", BUNDLE_DIR, "--seed", "1", "--ticks", "5", "--flavor", "quantum-v9");
    expect(result.code).toBe(2);
    expect(result.stderr).toContain('--flavor must be "stub-v1" or "real-v1"');
  }, 120_000);

  it("replay-verify PASSES on a fresh artifact", async () => {
    const result = await cli("replay-verify", artifactPath());
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("PASS");
  }, 120_000);

  it("replay-verify FAILS (exit 1, names the checkpoint) on a tampered hash", async () => {
    const artifact = JSON.parse(readFileSync(artifactPath(), "utf8")) as {
      checkpoints: { tick: string; stateHash: string }[];
    };
    const tampered = structuredClone(artifact);
    const target = tampered.checkpoints[0];
    if (target === undefined) throw new Error("fixture must have checkpoints");
    target.stateHash = target.stateHash.replace(/^./, target.stateHash.startsWith("a") ? "b" : "a");
    const tamperedPath = join(workDir, "tampered.json");
    writeFileSync(tamperedPath, JSON.stringify(tampered), "utf8");

    const result = await cli("replay-verify", tamperedPath);
    expect(result.code).toBe(1);
    expect(result.stdout).toContain("FAIL");
    expect(result.stdout).toContain(`tick ${target.tick}`);
  }, 120_000);

  it("digest prints the same final-state hash for the artifact and a state-only file", async () => {
    const artifactDigest = await cli("digest", artifactPath());
    expect(artifactDigest.code).toBe(0);
    const hash = artifactDigest.stdout.trim();
    expect(hash).toMatch(/^[0-9a-f]{32}$/);

    const stateOnlyPath = join(workDir, "state.json");
    const artifact = JSON.parse(readFileSync(artifactPath(), "utf8")) as { finalState: unknown };
    writeFileSync(stateOnlyPath, JSON.stringify(artifact.finalState), "utf8");
    const stateDigestResult = await cli("digest", stateOnlyPath);
    expect(stateDigestResult.stdout.trim()).toBe(hash);
  }, 120_000);

  it("digest rejects a non-canonical-stable tree is not possible via CLI — but rejects garbage", async () => {
    const badPath = join(workDir, "bad.json");
    writeFileSync(badPath, "{not json", "utf8");
    const result = await cli("digest", badPath);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("error:");
  });
});

describe("cli: canary / parity / bench / usage", () => {
  it("canary passes on sim-core, fails (exit 1) on the planted fixtures", async () => {
    const good = await cli("canary");
    expect(good.code).toBe(0);
    expect(good.stdout).toContain("PASS");

    const fixtures = fileURLToPath(new URL("./fixtures/canary", import.meta.url));
    const bad = await cli("canary", fixtures);
    expect(bad.code).toBe(1);
    expect(bad.stdout).toContain("VIOLATION");
    expect(bad.stdout).toContain("forbidden:Math.random");
  }, 120_000);

  it("parity prints a parsable report with the fixture id + stamped flavor", async () => {
    const result = await cli("parity", "--seed", "11", "--ticks", "60");
    expect(result.code).toBe(0);
    const report = JSON.parse(result.stdout.trim()) as {
      fixture: string;
      ticks: number;
      combined: string;
      arms: { engineRun: { slotsFlavor: string } };
    };
    expect(report.fixture).toBe("hh-parity-v2");
    expect(report.ticks).toBe(60);
    expect(report.arms.engineRun.slotsFlavor).toBe("real-v1");

    const stub = await cli("parity", "--seed", "11", "--ticks", "60", "--flavor", "stub-v1");
    const stubReport = JSON.parse(stub.stdout.trim()) as {
      combined: string;
      arms: { engineRun: { slotsFlavor: string } };
    };
    expect(stubReport.arms.engineRun.slotsFlavor).toBe("stub-v1");
    expect(stubReport.combined).not.toBe(report.combined); // flavors diverge in Arm D
  }, 120_000);

  it("bench reports rates and honors --target both ways", async () => {
    const easy = await cli("bench", "--ticks", "500", "--target", "1");
    expect(easy.code).toBe(0);
    expect(easy.stdout).toMatch(/engine ticks.*\/s/);
    expect(easy.stdout).toContain("MET");

    const impossible = await cli("bench", "--ticks", "100", "--target", "999999999");
    expect(impossible.code).toBe(1);
    expect(impossible.stdout).toContain("MISSED");
  }, 180_000);

  it("usage errors exit 2; help exits 0", async () => {
    expect((await cli()).code).toBe(2);
    expect((await cli("help")).code).toBe(0);
    expect((await cli("run", BUNDLE_DIR, "--ticks", "5")).code).toBe(2); // missing --seed
    expect((await cli("frobnicate")).code).toBe(2);
    expect((await cli("run", BUNDLE_DIR, "--seed", "1.5", "--ticks", "5")).code).toBe(2); // bad seed
  }, 120_000);
});
