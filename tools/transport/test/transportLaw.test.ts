/**
 * test/transportLaw.test.ts — the source-level gates (audioLaw pattern).
 *
 * Comment-stripped scans over tools/transport/src/**.ts for the forbidden
 * nondeterminism/escape vocabulary, the exact file roster, an ARMED planted
 * violation caught on every run (the scan that never fires is a scan that
 * cannot fire), the single TRANSPORT_PROTOCOL literal, the PROVISIONAL
 * labels the owner still owes ratification on, the relay→transport reverse
 * edge (cycle gate), and the barrel discipline (no export-star, no app
 * imports from src).
 */

import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));
const RELAY_SRC = fileURLToPath(new URL("../../relay/src/", import.meta.url));

/** Crude but honest comment stripper: block, then line. Good enough because
 *  no string literal in src/ ever contains "//" or "/*". */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
}

function sources(dir: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of readdirSync(dir).sort()) {
    if (file.endsWith(".ts")) map.set(file, stripComments(readFileSync(dir + file, "utf8")));
  }
  return map;
}

const BANNED = [
  "Date.now",
  "new Date",
  "Math.random",
  "performance.",
  "setTimeout",
  "setInterval",
  "requestAnimationFrame",
  "fetch(",
  "WebSocket",
  "node:net",
  "node:http",
  "node:fs",
] as const;

describe("transport law scans", () => {
  it("src/ roster is EXACTLY the eight designed files", () => {
    expect([...sources(SRC).keys()].sort()).toEqual(
      ["client.ts", "codec.ts", "envelope.ts", "fog.ts", "inMemory.ts", "index.ts", "port.ts", "server.ts"],
    );
  });

  it("ZERO forbidden nondeterminism/escape tokens across all of src/ (comment-stripped)", () => {
    const hits: string[] = [];
    for (const [file, code] of sources(SRC)) {
      for (const token of BANNED) {
        if (code.includes(token)) hits.push(`${file}: ${token}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("the ARMED probe fires every run: a planted setTimeout is caught by name", () => {
    const probe = `${SRC}__scan_probe_tmp.ts`;
    writeFileSync(probe, 'export const armed = setTimeout(() => console.log("nope"), 1);\n');
    try {
      const code = stripComments(readFileSync(probe, "utf8"));
      expect(code.includes("setTimeout")).toBe(true);
      // re-run the FULL scan and prove it reports the planted file:
      const hits: string[] = [];
      for (const [file, body] of sources(SRC)) {
        for (const token of BANNED) if (body.includes(token)) hits.push(`${file}: ${token}`);
      }
      expect(hits).toContain("__scan_probe_tmp.ts: setTimeout");
    } finally {
      rmSync(probe);
    }
    // and the tree is clean again for the next test:
    expect(readdirSync(SRC)).not.toContain("__scan_probe_tmp.ts");
  });

  it('the wire-protocol literal "hh-coop-transport" lives in EXACTLY one file', () => {
    const owners = [...sources(SRC).entries()].filter(([, code]) => code.includes('"hh-coop-transport"')).map(([f]) => f);
    expect(owners).toEqual(["envelope.ts"]);
  });

  it("the three PROVISIONAL taste rows stay labeled until owner ratification", () => {
    const envelope = readFileSync(`${SRC}envelope.ts`, "utf8");
    const server = readFileSync(`${SRC}server.ts`, "utf8");
    expect(envelope).toMatch(/MAX_FRAME_BYTES\s*=\s*65_536; \/\/ PROVISIONAL/);
    expect(server).toMatch(/maxPageSize\??: number; \/\/ PROVISIONAL/);
    expect(server).toMatch(/logBudget\??: number; \/\/ PROVISIONAL/);
    expect(server).toMatch(/DEFAULT_MAX_PAGE_SIZE = 64; \/\/ PROVISIONAL/);
    expect(server).toMatch(/DEFAULT_LOG_BUDGET = 10_000; \/\/ PROVISIONAL/);
  });

  it("cycle gate: relay src/ never names transport-tools, transport paths, or the wire protocol", () => {
    const hits: string[] = [];
    for (const [file, code] of sources(RELAY_SRC)) {
      if (/transport-tools|from\s+["'][^"']*\.\.\/\.\.\/transport["']|hh-coop-transport/.test(code)) hits.push(file);
    }
    expect(hits).toEqual([]);
  });

  it("src/ imports sim-core subpaths + relay-tools + local files only — never the app", () => {
    const hits: string[] = [];
    for (const [file, code] of sources(SRC)) {
      for (const m of code.matchAll(/from\s+["']([^"']+)["']/g)) {
        const spec = m[1] as string;
        const ok =
          spec.startsWith("@hh/sim-core/") ||
          spec === "relay-tools" ||
          spec.startsWith("./") ||
          spec.startsWith("../src/");
        if (!ok) hits.push(`${file}: ${spec}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("the barrel is explicit: no export-star anywhere in src/", () => {
    for (const [file, code] of sources(SRC)) {
      expect(code, file).not.toMatch(/export\s+\*\s+from/);
    }
    // sanity: the barrel DOES re-export the law surfaces (named form)
    expect(sources(SRC).get("index.ts")).toMatch(/export \{[^}]*attachRelayHub/s);
  });
});

afterAll(() => {
  // Belt: the armed probe must never survive its own test.
  try {
    rmSync(`${SRC}__scan_probe_tmp.ts`);
  } catch {
    /* already gone — correct */
  }
});
