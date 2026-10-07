/**
 * DIGEST GOLDEN — the byte-identity tripwire for the `digestState` limbs
 * fast-path port (perf audit rec #1), and for every future edit of the sink.
 *
 * `digest-golden.json` holds the 16-hex digests captured from the ORIGINAL
 * bigint sink over the `goldenCases()` battery (thin/fat engine runs, door
 * sessions, composite folds, limb-extreme bigints, astral text, hands/board).
 * The protocol that produced it: capture BEFORE the port, re-run AFTER, and
 * every hex must match. If a hex here mismatches, the PORT is wrong — never
 * regenerate the fixture to accommodate a change.
 *
 * Capture mode (ONLY for the deliberate, owner-approved case where the
 * digest function itself changes domain): `HH_GOLDEN_CAPTURE=1 vitest run
 * src/pipeline/__tests__/digest-golden.test.ts` rewrites the JSON from the
 * live implementation and fails the run (rewriting during a green run would
 * smuggle a digest change past the tripwire).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { digestState } from "../digest";
import { goldenCases } from "./digest-golden-states";

const GOLDEN_PATH = fileURLToPath(new URL("./digest-golden.json", import.meta.url));

// Node ambient is deliberately NOT declared globally (four sibling stubs own
// `process` with narrower types) — probe it once through globalThis instead.
const nodeProcess = (globalThis as {
  process?: { readonly env: Record<string, string | undefined> };
}).process;
if (nodeProcess === undefined) throw new Error("digest goldens require the Node process global");

interface GoldenDoc {
  readonly capturedFrom: string;
  readonly cases: Readonly<Record<string, readonly string[]>>;
}

/** Shape pins so a silent builder drift reads as itself, not as a mystery hex. */
const EXPECTED_STATE_COUNTS: Readonly<Record<string, number>> = Object.freeze({
  empty: 1,
  "lanes-cards": 1,
  "observed-composites": 1,
  "bigint-extremes": 2,
  "astral-text": 1,
  "hands-board": 4,
  "door-run-off": 8,
  "door-run-drain": 8,
  "queue-active": 1,
  "thin-run": 1,
  "fat-run": 1,
});

describe("digestState golden battery (limb-port byte-identity)", () => {
  const cases = goldenCases();
  const actual: Record<string, string[]> = {};
  for (const entry of cases) {
    expect(EXPECTED_STATE_COUNTS[entry.name], `case count pin for ${entry.name}`).toBe(entry.states.length);
    actual[entry.name] = entry.states.map((state) => digestState(state));
  }

  if (nodeProcess.env.HH_GOLDEN_CAPTURE === "1") {
    it("CAPTURE MODE: rewrite the fixture and fail (deliberate-domain-change lever)", () => {
      const doc: GoldenDoc = { capturedFrom: "HH_GOLDEN_CAPTURE=1", cases: actual };
      writeFileSync(GOLDEN_PATH, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
      throw new Error("capture mode ran — fixture rewritten from the LIVE implementation; unset the env var to verify");
    });
    return;
  }

  it("the fat recipe still has the audited shape (192/200/901/1000)", () => {
    const fat = cases.find((entry) => entry.name === "fat-run");
    if (fat === undefined || fat.states[0] === undefined) throw new Error("fat-run missing");
    const state = fat.states[0];
    expect(state.units.size).toBe(192);
    expect(state.nodes.size).toBe(200);
    expect(state.observed.size).toBe(901);
    expect(state.contracts.size).toBe(1000);
  });

  it("every state's digest equals the pre-port golden (byte-identical hexes)", () => {
    const doc = JSON.parse(readFileSync(GOLDEN_PATH, "utf8")) as GoldenDoc;
    const goldenNames = Object.keys(doc.cases).sort();
    const actualNames = Object.keys(actual).sort();
    expect(actualNames).toStrictEqual(goldenNames); // no silent case add/drop
    const mismatches: string[] = [];
    for (const name of goldenNames) {
      const golden = doc.cases[name] as readonly string[];
      const live = actual[name] as readonly string[];
      golden.forEach((hex, i) => {
        if (live[i] !== hex) mismatches.push(`${name}[${i}]: golden ${hex} ≠ live ${String(live[i])}`);
      });
    }
    expect(mismatches, `digest drift — the port (or the engine) changed output:\n${mismatches.join("\n")}`).toStrictEqual([]);
  });

  it("golden hexes all parse as 32 lowercase hex (fixture self-sanity)", () => {
    const doc = JSON.parse(readFileSync(GOLDEN_PATH, "utf8")) as GoldenDoc;
    for (const [name, hexes] of Object.entries(doc.cases)) {
      for (const hex of hexes) expect(hex, name).toMatch(/^[0-9a-f]{32}$/);
    }
  });
});
