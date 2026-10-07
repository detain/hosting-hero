#!/usr/bin/env node
/** perf-tools summarize — human report over a --cpu-prof directory
 *  (or a single .cpuprofile file). Folds the audit's p10/p6-summarize +
 *  p6-columns pattern into one script:
 *
 *    node src/summarize.mjs <dir|file.cpuprofile> [--top N] [--function NAME] [--json]
 *
 *  Output:
 *    ## AREAS   — % of samples per sim-core area (driver/defaults/digest/kernel/…)
 *    ## TOP     — % per self-time frame (function @ file:line)
 *    ## LINE:COLUMN — with --function NAME: self-sample breakdown per
 *                    line:column inside that function (the audit used this to
 *                    decompose driver `advance` self-time)
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const argv = process.argv.slice(2);
const target = argv.find((a) => !a.startsWith("--"));
function flagValue(name, fallback) {
  const inline = argv.find((a) => a.startsWith(`--${name}=`));
  if (inline !== undefined) return inline.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
}
const TOP = Number(flagValue("top", "20"));
const WANT_FN = flagValue("function", null);
const AS_JSON = argv.includes("--json");

if (target === undefined) {
  console.error("usage: node summarize.mjs <dir|file.cpuprofile> [--top N] [--function NAME] [--json]");
  process.exit(2);
}

const dir = target.endsWith(".cpuprofile") ? null : target;
const file = dir === null ? target : readdirSync(dir).find((f) => f.endsWith(".cpuprofile"));
if (file === undefined || file === false) {
  console.error(`no .cpuprofile found in ${target}`);
  process.exit(1);
}
const profilePath = dir === null ? target : join(dir, file);
const prof = JSON.parse(readFileSync(profilePath, "utf8"));

/** Repo-relative display path: cut at packages/ when present, else basename. */
function prettyUrl(raw) {
  const url = (raw ?? "").replace(/^file:\/\//, "");
  const cut = url.indexOf("packages/");
  if (cut !== -1) return url.slice(cut);
  if (url.includes("/node_modules/")) return url.slice(url.lastIndexOf("/node_modules/") + 1);
  const segs = url.split("/");
  return segs.length > 2 ? segs.slice(-2).join("/") : (url || "(empty)");
}

function areaOf(cf) {
  const url = prettyUrl(cf.url);
  const fn = cf.functionName || "(anon)";
  if (url.includes("pipeline/driver.ts")) {
    if (fn.includes("purgeTerminals") || fn.includes("releaseHolds")) return "driver.ts board-walk (purge/release)";
    if (fn.includes("advance")) return "driver.ts advance (rest)";
    return "driver.ts other";
  }
  if (url.includes("pipeline/defaults.ts")) {
    if (fn.includes("Serve") || fn.includes("serve")) return "defaults.ts serve";
    if (fn.includes("Economics") || fn.includes("economics")) return "defaults.ts economics";
    if (fn.includes("Arrival") || fn.includes("arrival")) return "defaults.ts arrival";
    return "defaults.ts other steps";
  }
  if (url.includes("pipeline/digest")) return "digest (limbs/sink)";
  if (url.includes("pipeline/internal.ts")) return "internal.ts (sortedIds etc)";
  if (url.includes("pipeline/queue.ts")) return "queue.ts (utilization)";
  if (url.includes("pipeline/intent-door")) return "intent-door";
  if (url.includes("kernel/")) return "kernel (rng/fixed/time)";
  if (url.includes("observed/")) return "observed store";
  if (url.includes("economy/")) return "economy";
  if (url.includes("policy/")) return "policy";
  if (url.includes("versus/")) return "versus";
  if (url.includes("replay/")) return "replay";
  if (url === "" || url.startsWith("node:")) return "native/v8";
  return `other:${url.split("/").pop()}`;
}

const byId = new Map(prof.nodes.map((n) => [n.id, n]));
const selfCount = new Map();
const areaCount = new Map();
const columnCount = new Map();
for (const sId of prof.samples) {
  const n = byId.get(sId);
  if (n === undefined) continue;
  const cf = n.callFrame;
  const key = `${cf.functionName || "(anon)"} @ ${prettyUrl(cf.url)}:${String(cf.lineNumber + 1)}`;
  selfCount.set(key, (selfCount.get(key) ?? 0) + 1);
  const area = areaOf(cf);
  areaCount.set(area, (areaCount.get(area) ?? 0) + 1);
  if (WANT_FN !== null && cf.functionName === WANT_FN) {
    const ck = `${String(cf.lineNumber + 1)}:${String(cf.columnNumber + 1)}`;
    columnCount.set(ck, (columnCount.get(ck) ?? 0) + 1);
  }
}
const nSamples = prof.samples.length;
const pct = (c) => ((c / nSamples) * 100).toFixed(1).padStart(5);

if (AS_JSON) {
  const payload = {
    profile: profilePath,
    samples: nSamples,
    areas: Object.fromEntries(areaCount),
    top: [...selfCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP),
  };
  if (WANT_FN !== null) payload.columns = Object.fromEntries(columnCount);
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log(`# ${profilePath} — ${String(nSamples)} samples`);
  console.log("## AREAS");
  for (const [k, c] of [...areaCount.entries()].sort((a, b) => b[1] - a[1])) console.log(`${pct(c)}%  ${k}`);
  console.log(`## TOP ${String(TOP)}`);
  for (const [k, c] of [...selfCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP)) console.log(`${pct(c)}%  ${k}`);
  if (WANT_FN !== null) {
    const total = [...columnCount.values()].reduce((a, b) => a + b, 0);
    console.log(`## LINE:COLUMN — self samples in "${WANT_FN}": ${String(total)}`);
    for (const [k, c] of [...columnCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) {
      console.log(`${((c / Math.max(total, 1)) * 100).toFixed(1).padStart(5)}%  line:col ${k}`);
    }
  }
}
