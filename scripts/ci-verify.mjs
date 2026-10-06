#!/usr/bin/env node
/**
 * ci-verify.mjs — pre-push mirror of the CI contract gates.
 *
 * Runs, in order, the same four gates the `verify` job executes on its Node
 * 22.x arm (.github/workflows/ci.yml → "Contract: …" steps):
 *
 *   1. docs/api-verify.test.mjs        — API-REFERENCE.md vs shipped exports
 *   2. packages/content/script/validate.mjs — content corpus schema/refs
 *   3. headless-tools canary           — sim-core runtime-neutrality scan
 *   4. pnpm -F proto build             — web bundling proof
 *
 * Every gate's own output is streamed live; each gets a PASS/FAIL verdict;
 * a final summary lists them all. All gates run even after a failure so one
 * pass shows the complete picture. Exit code: 0 all green · 1 any failure.
 *
 * Usage:  node scripts/ci-verify.mjs        (zero deps, any cwd)
 * Not covered here (fast locally, mirrored in CI): pnpm -r typecheck &&
 * pnpm -r test, and the determinism subset
 * `pnpm -F @hh/sim-core exec vitest run src/kernel src/pipeline src/replay`.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [NODE_MAJOR, NODE_MINOR] = process.versions.node.split(".").map(Number);

const isNodeAtLeast = (major, minor) =>
  NODE_MAJOR > major || (NODE_MAJOR === major && NODE_MINOR >= minor);

/** One entry per CI "Contract:" step — data first, logic stays flat below. */
const GATES = [
  {
    id: "api-verify",
    title: "API-reference drift tripwire (docs/API-REFERENCE.md vs sim-core barrels)",
    entryFile: "docs/api-verify.test.mjs",
    command: process.execPath,
    args: ["docs/api-verify.test.mjs"],
    cwd: REPO_ROOT,
  },
  {
    id: "content-validate",
    title: "Content corpus validator (packages/content JSON gates)",
    entryFile: "packages/content/script/validate.mjs",
    command: process.execPath,
    args: ["packages/content/script/validate.mjs"],
    cwd: REPO_ROOT,
  },
  {
    id: "canary",
    title: "Forbidden-API canary (packages/sim-core/src runtime neutrality, RISK-1)",
    entryFile: "tools/headless/src/cli.ts",
    minNode: [22, 18], // headless-tools engines; --experimental-transform-types
    command: process.execPath,
    args: ["--experimental-transform-types", "src/cli.ts", "canary"],
    cwd: join(REPO_ROOT, "tools/headless"),
  },
  {
    id: "proto-build",
    title: "Proto web build (typecheck + vite bundling)",
    entryFile: "apps/proto/package.json",
    command: "pnpm",
    args: ["-F", "proto", "build"],
    cwd: REPO_ROOT,
  },
];

/** Returns a human reason when the gate cannot start yet, else null. */
function findUnmetPrerequisite(gate) {
  if (!existsSync(join(REPO_ROOT, gate.entryFile))) {
    return `${gate.entryFile} not found — it may be mid-edit by its owning lane`;
  }
  if (gate.minNode && !isNodeAtLeast(...gate.minNode)) {
    const [major, minor] = gate.minNode;
    return `requires Node >=${major}.${minor} (running ${process.versions.node})`;
  }
  return null;
}

/** Runs one gate to completion with live output; never throws. */
function runGate(gate) {
  const outcome = spawnSync(gate.command, gate.args, {
    cwd: gate.cwd,
    stdio: "inherit",
  });
  if (outcome.error) return { ok: false, detail: outcome.error.message };
  if (outcome.signal) return { ok: false, detail: `killed by ${outcome.signal}` };
  if (outcome.status !== 0) return { ok: false, detail: `exit ${String(outcome.status)}` };
  return { ok: true, detail: "" };
}

function runAll() {
  const results = [];
  GATES.forEach((gate, index) => {
    const heading = `[${String(index + 1)}/${String(GATES.length)}] ${gate.id} — ${gate.title}`;
    console.log(`\n${"=".repeat(78)}\n${heading}\n${"=".repeat(78)}`);

    const unmet = findUnmetPrerequisite(gate);
    if (unmet !== null) {
      console.log(`FAIL (prerequisite): ${unmet}`);
      results.push({ gate, ok: false, detail: unmet });
      return;
    }

    const { ok, detail } = runGate(gate);
    console.log(ok ? `PASS: ${gate.id}` : `FAIL: ${gate.id} — ${detail}`);
    results.push({ gate, ok, detail });
  });
  return results;
}

function printSummary(results) {
  console.log(`\n${"=".repeat(78)}\nci-verify summary\n${"=".repeat(78)}`);
  for (const { gate, ok, detail } of results) {
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${gate.id}${ok ? "" : `  (${detail})`}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(
    failed === 0
      ? "\nAll contract gates green — safe to push; CI mirrors these exactly."
      : `\n${String(failed)} gate(s) failed — fix or coordinate with the owning lane before pushing.`,
  );
  process.exitCode = failed === 0 ? 0 : 1;
}

printSummary(runAll());
