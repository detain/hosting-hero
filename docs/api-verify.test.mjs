#!/usr/bin/env node
/**
 * api-verify.test.mjs — docs gate for docs/API-REFERENCE.md.
 *
 * Greps the ACTUAL exported names from the sim-core barrel files on disk
 * (package.json exports map + each dir's index.ts, star-resolution included)
 * and compares them against the "Export" first-column backtick names in the
 * markdown's per-module API tables. Fails (exit 1) on ANY mismatch, both
 * directions:
 *   - UNKNOWN  : a name documented but not actually shipped (signature lie)
 *   - MISSING  : a name shipped but not documented (reference incomplete)
 * Also cross-checks the "Import surface that ships" table against the real
 * package.json exports keys (the `save` row must stay ❌ until an entry lands).
 *
 * Run: node docs/api-verify.test.mjs   (plain Node, zero deps — docs/ lane)
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, "../packages/sim-core/src");
const PKG = resolve(HERE, "../packages/sim-core/package.json");
const DOC = resolve(HERE, "API-REFERENCE.md");

/* ───────────────────────── real export extraction ───────────────────────── */

const DECL_RE =
  /export\s+(?:declare\s+)?(?:default\s+)?(?:async\s+)?(?:function\*?|class|const|let|var|interface|type|enum)\s+([A-Za-z0-9_]+)/g;
const REEXPORT_RE = /export\s+(?:type\s+)?\{([^}]*)\}(?:\s+from\s+["'][^"']+["'])?\s*$/gm;
const STAR_RE = /export\s+\*\s+from\s+["']([^"']+)["']/g;
const NAMED_FROM_RE = /export\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']([^"']+)["']/g;

function fileExportsOf(path) {
  const src = readFileSync(path, "utf8");
  const names = new Set();
  for (const m of src.matchAll(DECL_RE)) names.add(m[1]);
  // in-file `export { a, b as c } from "…"` → the PUBLIC name is the alias/target
  for (const m of src.matchAll(NAMED_FROM_RE)) {
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const as = t.split(/\s+as\s+/);
      names.add((as[1] ?? as[0]).replace(/^type\s+/, "").trim());
    }
  }
  // plain `export { … }` blocks WITHOUT a from-clause (grouped declarations)
  const withoutFrom = src.replace(/export\s+(?:type\s+)?\{[^}]*\}\s+from\s+["'][^"']+["']/g, "");
  for (const m of withoutFrom.matchAll(REEXPORT_RE)) {
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const as = t.split(/\s+as\s+/);
      names.add((as[1] ?? as[0]).replace(/^type\s+/, "").trim());
    }
  }
  return names;
}

function resolveBarrel(barrelPath) {
  const src = readFileSync(barrelPath, "utf8");
  const names = new Set();
  const dir = dirname(barrelPath);
  const load = (spec) => {
    let p = join(dir, spec);
    if (!p.endsWith(".ts")) p += ".ts";
    if (!existsSync(p)) throw new Error(`barrel points at missing file: ${p}`);
    for (const n of fileExportsOf(p)) names.add(n);
  };
  for (const m of src.matchAll(STAR_RE)) load(m[1]);
  for (const m of src.matchAll(NAMED_FROM_RE)) {
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const as = t.split(/\s+as\s+/);
      names.add((as[1] ?? as[0]).replace(/^type\s+/, "").trim());
    }
  }
  return names;
}

const real = {
  types: fileExportsOf(join(SRC, "types.ts")),
  kernel: resolveBarrel(join(SRC, "kernel.ts")),
  pipeline: resolveBarrel(join(SRC, "pipeline/index.ts")),
  observed: resolveBarrel(join(SRC, "observed/index.ts")),
  policy: resolveBarrel(join(SRC, "policy/index.ts")),
  economy: resolveBarrel(join(SRC, "economy/index.ts")),
  topology: resolveBarrel(join(SRC, "topology/index.ts")),
  waves: resolveBarrel(join(SRC, "waves/index.ts")),
  replay: resolveBarrel(join(SRC, "replay/index.ts")),
  loader: resolveBarrel(join(SRC, "loader/index.ts")),
  save: resolveBarrel(join(SRC, "save/index.ts")),
  versus: resolveBarrel(join(SRC, "versus/index.ts")),
  coverage: resolveBarrel(join(SRC, "coverage/index.ts")),
  unattended: resolveBarrel(join(SRC, "unattended/index.ts")),
  unlocks: resolveBarrel(join(SRC, "unlocks/index.ts")),
};

/* ───────────────────────── markdown extraction ───────────────────────── */

const doc = readFileSync(DOC, "utf8");
const lines = doc.split("\n");

/** Split a markdown table row on UNESCAPED pipes. */
function cells(line) {
  return line.split(/(?<!\\)\|/).map((c) => c.trim());
}

const MODS = Object.keys(real);
// section name in doc -> module key
function moduleOfHeading(h) {
  if (/^##\s+contract types/.test(h)) return "types";
  const m = /^##\s+([a-z]+)\s*$/m.exec(h);
  return m && MODS.includes(m[1]) ? m[1] : null;
}

const documented = new Map(MODS.map((m) => [m, new Set()]));
const NAME_RE = /`([A-Za-z_][A-Za-z0-9_]*)`/g;
let currentModule = null;
let inApiTable = false;

for (const line of lines) {
  if (line.startsWith("## ")) {
    currentModule = moduleOfHeading(line);
    inApiTable = false;
    continue;
  }
  if (currentModule === null) {
    inApiTable = false;
    continue;
  }
  if (/^\|\s*Export\s*\|/.test(line)) {
    inApiTable = true;
    continue;
  }
  if (!inApiTable) continue;
  if (!line.startsWith("|")) {
    inApiTable = false; // table ended on any non-table line
    continue;
  }
  if (/^\|\s*:?-+/.test(line)) continue; // separator row
  const first = cells(line)[1] ?? "";
  for (const m of first.matchAll(NAME_RE)) documented.get(currentModule).add(m[1]);
}

/* ───────────────────────── import-map cross-check ───────────────────────── */

const pkg = JSON.parse(readFileSync(PKG, "utf8"));
const exportsKeys = new Set(Object.keys(pkg.exports));
const importIssues = [];
let section = null;
for (const line of lines) {
  if (line.startsWith("## ")) section = line;
  if (section && /Import surface that actually ships/.test(section) && line.startsWith("|")) {
    const c = cells(line);
    const spec = /`@hh\/sim-core(\/[a-z-]*)?`/.exec(c[1] ?? "");
    if (!spec) continue;
    const key = spec[1] ? "." + spec[1] : ".";
    const claimed = /✅/.test(c[3] ?? "") ? true : /❌/.test(c[3] ?? "") ? false : null;
    if (claimed === null) continue;
    const actual = exportsKeys.has(key);
    if (claimed !== actual) {
      importIssues.push(`import-map: \`${key}\` doc claims ships=${claimed}, package.json says ${actual}`);
    }
  }
}
// every real exports key must be CLAIMED ✅ somewhere in that table
for (const key of exportsKeys) {
  const specTok = key === "." ? "`@hh/sim-core`" : `\`@hh/sim-core${key.slice(1)}\``;
  if (!doc.includes(specTok)) importIssues.push(`import-map: package.json exports key ${key} not documented`);
}

/* ───────────────────────── compare + report ───────────────────────── */

let problems = 0;
const report = [];
for (const mod of MODS) {
  const r = real[mod];
  const d = documented.get(mod);
  const unknown = [...d].filter((n) => !r.has(n)).sort();
  const missing = [...r].filter((n) => !d.has(n)).sort();
  problems += unknown.length + missing.length;
  report.push(
    `${mod.padEnd(10)} shipped=${String(r.size).padStart(3)} documented=${String(d.size).padStart(3)}` +
      (unknown.length ? `  UNKNOWN: ${unknown.join(", ")}` : "") +
      (missing.length ? `  MISSING: ${missing.join(", ")}` : ""),
  );
}
problems += importIssues.length;

console.log("api-verify — docs/API-REFERENCE.md vs shipped sim-core surface");
for (const r of report) console.log("  " + r);
for (const i of importIssues) console.log("  " + i);
if (problems > 0) {
  console.error(`\napi-verify FAILED: ${problems} mismatch(es)`);
  process.exit(1);
}
console.log(`\napi-verify PASS: ${MODS.length} modules + types, ${Object.values(real).reduce((a, s) => a + s.size, 0)} names, import map consistent.`);
