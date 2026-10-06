#!/usr/bin/env node
/**
 * ci-verify.mjs — pre-push mirror of the CI contract gates.
 *
 * Runs, in order, the same five gates the `verify` job executes on its Node
 * 22.x arm (.github/workflows/ci.yml → "Contract: …" steps):
 *
 *   1. docs/api-verify.test.mjs        — API-REFERENCE.md vs shipped exports
 *   2. packages/content/script/validate.mjs — content corpus schema/refs
 *   3. headless-tools canary           — sim-core runtime-neutrality scan
 *   4. pnpm -F proto build             — web bundling proof
 *   5. g5-mirror-diff                  — G5 fixture ≡ upstream below SYNC LAW header
 *
 * Every gate's own output is streamed live; each gets a PASS/FAIL verdict;
 * a final summary lists them all. All gates run even after a failure so one
 * pass shows the complete picture. Exit code: 0 all green · 1 any failure.
 *
 * Usage:  node scripts/ci-verify.mjs [gate-id …]  (zero deps, any cwd)
 * Passing gate ids runs only those gates — CI invokes the mirror gate
 * standalone this way (`node scripts/ci-verify.mjs g5-mirror-diff`).
 * Not covered here (fast locally, mirrored in CI): pnpm -r typecheck &&
 * pnpm -r test, and the determinism subset
 * `pnpm -F @hh/sim-core exec vitest run src/kernel src/pipeline src/replay`.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [NODE_MAJOR, NODE_MINOR] = process.versions.node.split(".").map(Number);

const isNodeAtLeast = (major, minor) =>
  NODE_MAJOR > major || (NODE_MAJOR === major && NODE_MINOR >= minor);

/* ── Gate 5: G5 fixture mirror diff (the only gate whose logic lives here) ──
 * packages/sim-core/src/__tests__/g5-quarter-fixture.ts is a rootDir-law-forced
 * (TS6059) mirror of apps/proto/src/gates/g5/quarter.ts. Its header states the
 * SYNC LAW: edit quarter.ts upstream FIRST, then re-copy it over the fixture —
 * everything below the header must stay byte-identical. The header is the
 * fixture's leading /** … *\/ doc block (carrying the TEST FIXTURE MIRROR
 * marker) up to and including its closing `*\/` line plus the blank line(s)
 * that follow it; nothing else is normalized before the byte comparison.     */

const MIRROR_HEADER_MARKER = "TEST FIXTURE MIRROR";

const G5_MIRROR = {
  fixture: "packages/sim-core/src/__tests__/g5-quarter-fixture.ts",
  upstream: "apps/proto/src/gates/g5/quarter.ts",
  syncLaw:
    "SYNC LAW: edit apps/proto/src/gates/g5/quarter.ts upstream FIRST, then " +
    "re-copy it over packages/sim-core/src/__tests__/g5-quarter-fixture.ts — " +
    "everything below the TEST FIXTURE MIRROR header must stay byte-identical.",
};

const countNewlines = (text) => text.split("\n").length - 1;

/**
 * Splits a mirror fixture into { headerLineCount, body }. Throws a descriptive
 * Error when the declared header cannot be located — the header itself moving
 * is as much a SYNC LAW breach as body drift, so we fail loud, never guess.
 */
export function parseMirrorFixture(fixtureText) {
  if (!fixtureText.startsWith("/**")) {
    throw new Error("fixture does not open with the /** */ TEST FIXTURE MIRROR header");
  }
  const close = fixtureText.indexOf("*/");
  if (close === -1) throw new Error("fixture header comment never closes");
  if (!fixtureText.slice(0, close).includes(MIRROR_HEADER_MARKER)) {
    throw new Error(
      `fixture header lost its "${MIRROR_HEADER_MARKER}" marker — ` +
        "if the header was intentionally rewritten, update this gate deliberately",
    );
  }
  let bodyStart = close + "*/".length;
  if (fixtureText[bodyStart] !== "\n") {
    throw new Error("fixture header closing */ must end its line");
  }
  bodyStart += 1;
  while (fixtureText[bodyStart] === "\n") bodyStart += 1;
  return {
    headerLineCount: countNewlines(fixtureText.slice(0, bodyStart)),
    body: fixtureText.slice(bodyStart),
  };
}

const lineOf = (text, index) => 1 + countNewlines(text.slice(0, index));

const excerptAt = (text, index) => {
  if (index >= text.length) return "<end of file>";
  const nl = text.indexOf("\n", index);
  const line = text.slice(index, nl === -1 ? text.length : nl);
  return line.length > 60 ? `${line.slice(0, 60)}…` : line;
};

/** Human-readable first-divergence report between two already-parsed bodies. */
function describeDrift(body, upstreamText, headerLineCount) {
  const limit = Math.min(body.length, upstreamText.length);
  let i = 0;
  while (i < limit && body[i] === upstreamText[i]) i += 1;
  const fixtureLine = i < body.length ? headerLineCount + lineOf(body, i) : headerLineCount + lineOf(body, body.length);
  const upstreamLine = i < upstreamText.length ? lineOf(upstreamText, i) : lineOf(upstreamText, upstreamText.length);
  return (
    `mirror body diverges at char ${String(i)} ` +
    `(fixture line ${String(fixtureLine)} / upstream line ${String(upstreamLine)}): ` +
    `mirror has ${JSON.stringify(excerptAt(body, i))} ` +
    `vs upstream ${JSON.stringify(excerptAt(upstreamText, i))}`
  );
}

/** Pure SYNC-LAW comparator: null while the mirror holds, else a violation message. */
export function findMirrorDrift(fixtureText, upstreamText) {
  let fixture;
  try {
    fixture = parseMirrorFixture(fixtureText);
  } catch (error) {
    return error.message;
  }
  return fixture.body === upstreamText ? null : describeDrift(fixture.body, upstreamText, fixture.headerLineCount);
}

function checkG5Mirror() {
  const fixtureText = readFileSync(join(REPO_ROOT, G5_MIRROR.fixture), "utf8");
  const upstreamText = readFileSync(join(REPO_ROOT, G5_MIRROR.upstream), "utf8");
  const violation = findMirrorDrift(fixtureText, upstreamText);
  if (violation !== null) {
    console.log(`DRIFT DETECTED: ${violation}`);
    console.log(G5_MIRROR.syncLaw);
    return { ok: false, detail: "mirror drift — SYNC LAW violated (see above)" };
  }
  const { headerLineCount, body } = parseMirrorFixture(fixtureText);
  console.log(
    `mirror holds — ${String(headerLineCount)}-line header stripped, ` +
      `${String(body.length)} body chars identical to upstream ` +
      "(utf8-text equality ≡ byte equality for these valid-utf8 sources)",
  );
  return { ok: true, detail: "" };
}

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
  {
    id: "g5-mirror-diff",
    title: "G5 fixture mirror diff (SYNC LAW: g5-quarter-fixture.ts ≡ quarter.ts below header)",
    files: [G5_MIRROR.fixture, G5_MIRROR.upstream],
    check: checkG5Mirror,
  },
];

/** Returns a human reason when the gate cannot start yet, else null. */
function findUnmetPrerequisite(gate) {
  for (const file of gate.files ?? [gate.entryFile]) {
    if (!existsSync(join(REPO_ROOT, file))) {
      return `${file} not found — it may be mid-edit by its owning lane`;
    }
  }
  if (gate.minNode && !isNodeAtLeast(...gate.minNode)) {
    const [major, minor] = gate.minNode;
    return `requires Node >=${major}.${minor} (running ${process.versions.node})`;
  }
  return null;
}

/** Runs one gate to completion with live output; never throws. */
function runGate(gate) {
  if (gate.check !== undefined) return gate.check();
  const outcome = spawnSync(gate.command, gate.args, {
    cwd: gate.cwd,
    stdio: "inherit",
  });
  if (outcome.error) return { ok: false, detail: outcome.error.message };
  if (outcome.signal) return { ok: false, detail: `killed by ${outcome.signal}` };
  if (outcome.status !== 0) return { ok: false, detail: `exit ${String(outcome.status)}` };
  return { ok: true, detail: "" };
}

/** Zero ids → all gates; unknown id → fail fast listing the known ones. */
function selectGates(ids) {
  if (ids.length === 0) return GATES;
  const unknown = ids.filter((id) => !GATES.some((gate) => gate.id === id));
  if (unknown.length > 0) {
    console.error(
      `unknown gate id(s): ${unknown.join(", ")} — known gates: ${GATES.map((gate) => gate.id).join(", ")}`,
    );
    process.exit(1);
  }
  return GATES.filter((gate) => ids.includes(gate.id));
}

function runAll(gates) {
  const results = [];
  gates.forEach((gate, index) => {
    const heading = `[${String(index + 1)}/${String(gates.length)}] ${gate.id} — ${gate.title}`;
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

// Run only when invoked directly — importing findMirrorDrift (tests, negative
// controls) must not fire the whole gate suite.
const invokedPath = process.argv[1];
if (invokedPath !== undefined && resolve(invokedPath) === fileURLToPath(import.meta.url)) {
  printSummary(runAll(selectGates(process.argv.slice(2))));
}
