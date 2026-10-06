#!/usr/bin/env node
// Structural validator for packages/content — Node stdlib only (no npm deps).
// Gates: parse, schema-required keys (via a JSON-Schema-subset interpreter),
// id uniqueness, cross-registry reference resolution, Second-Answer counters,
// null=>_todo discipline, PROVISIONAL-[ABC] tuningSheet markers, §1.7 wave
// authoring rules. Exit non-zero on any failure; prints the _todo inventory.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const todos = [];

const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const readJson = (rel) => {
  const path = join(ROOT, rel);
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    fail(rel, "file not found");
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    fail(rel, `JSON parse error: ${e.message}`);
    return null;
  }
};

// ---------- vocabulary (from hosting_game.md §2.1/§2.26/§2.27/§3.1/§3.2) ----------
const DEFENSE_ROLES = ["Absorb","Classify","Meter","Contain","Detect","Recover","Deter","Divert","Negotiate"];
const THREAT_ROLES = ["Swarm","Tank","Sapper","Stealth","Splitter","Healer/Spawner","Bypass/Flyer","Siege","Debuffer","Mimic","Parasite","Boss"];
const BANDS = ["weather","storm","hunter","entropy"];
const FAMILIES = ["malicious","entropic","human","systemic"];
const DENOMINATIONS = ["bandwidth","concurrency","hands","cash","reputation","data-integrity"];
const MOTIONS = ["advance","hold","sweep","boil","match","walk","crystallize","off-board"];
const DURATION_CLASSES = ["Instant","Session","BatchJob","Resident"];
const PATIENCE_MODES = ["sigmoid-budget","window","value-decay","resident","binary","corrupts","none"];
const VISITOR_FAMILIES = ["Browsers","Buyers","Machines","Amplifiers","Costs","Evaluators"];
const TUNING_RE = /^PROVISIONAL-[ABC]$/;
const ID_RE = /^([a-z0-9][a-z0-9-]*:)?[a-z0-9][a-z0-9-]*$/;

// ---------- minimal JSON Schema (draft 2020-12 subset) interpreter ----------
const typeOk = (v, t) =>
  (t === "object" && v !== null && typeof v === "object" && !Array.isArray(v)) ||
  (t === "array" && Array.isArray(v)) ||
  (t === "string" && typeof v === "string") ||
  (t === "number" && typeof v === "number") ||
  (t === "integer" && Number.isInteger(v)) ||
  (t === "boolean" && typeof v === "boolean") ||
  (t === "null" && v === null);

const validateAgainst = (schema, instance, where) => {
  if (!schema) return;
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeOk(instance, t))) {
      fail(where, `expected type ${types.join("|")}, got ${instance === null ? "null" : Array.isArray(instance) ? "array" : typeof instance}`);
      return;
    }
  }
  if (typeof instance === "string") {
    if (schema.enum && !schema.enum.includes(instance)) fail(where, `'${instance}' not in enum [${schema.enum.join(", ")}]`);
    if (schema.pattern && !new RegExp(schema.pattern).test(instance)) fail(where, `'${instance}' fails pattern ${schema.pattern}`);
  }
  if (typeof instance === "number") {
    if (schema.minimum !== undefined && instance < schema.minimum) fail(where, `${instance} < minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && instance > schema.maximum) fail(where, `${instance} > maximum ${schema.maximum}`);
  }
  if (Array.isArray(instance)) {
    if (schema.minItems !== undefined && instance.length < schema.minItems) fail(where, `minItems ${schema.minItems}, got ${instance.length}`);
    if (schema.maxItems !== undefined && instance.length > schema.maxItems) fail(where, `maxItems ${schema.maxItems}, got ${instance.length}`);
    if (schema.items) instance.forEach((el, i) => validateAgainst(schema.items, el, `${where}[${i}]`));
  }
  if (instance !== null && typeof instance === "object" && !Array.isArray(instance)) {
    (schema.required ?? []).forEach((k) => {
      if (!(k in instance)) fail(where, `missing required key '${k}'`);
    });
    if (schema.maxProperties !== undefined && Object.keys(instance).length > schema.maxProperties)
      fail(where, `maxProperties ${schema.maxProperties}, got ${Object.keys(instance).length}`);
    for (const [k, v] of Object.entries(instance)) {
      const propSchema = schema.properties?.[k];
      const ap = schema.additionalProperties;
      if (propSchema) validateAgainst(propSchema, v, `${where}.${k}`);
      else if (ap && typeof ap === "object") validateAgainst(ap, v, `${where}.${k}`);
    }
  }
};

// ---------- null => _todo discipline (README exemptions) ----------
const scanNulls = (node, where) => {
  if (Array.isArray(node)) { node.forEach((el, i) => scanNulls(el, `${where}[${i}]`)); return; }
  if (node === null || typeof node !== "object") return;
  const nullKeys = Object.entries(node).filter(([, v]) => v === null).map(([k]) => k);
  if (nullKeys.length > 0) {
    const exempt =
      (where.endsWith(".party") && nullKeys.every((k) => k === "size") && node.allOrNothing === false) ||
      (where.endsWith(".herding") && nullKeys.every((k) => k === "coefficient") && node.enabled === false);
    if (!exempt && !(typeof node._todo === "string" && node._todo.trim().length > 0)) {
      fail(where, `null value(s) [${nullKeys.join(", ")}] without a non-empty '_todo' (never-invent rule)`);
    }
  }
  if ("tuningSheet" in node && !TUNING_RE.test(node.tuningSheet)) {
    fail(`${where}.tuningSheet`, `'${node.tuningSheet}' must match PROVISIONAL-[ABC]`);
  }
  if (typeof node._todo === "string" && node._todo.trim()) todos.push([where, node._todo]);
  Object.entries(node).forEach(([k, v]) => { if (k !== "_todo") scanNulls(v, `${where}.${k}`); });
};

// ---------- load files ----------
const dataFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (entry.endsWith(".json")) dataFiles.push(relative(ROOT, p));
  }
};
walk(ROOT);

const schemaRel = "schema/type-bundle.schema.json";
const schema = readJson(schemaRel);
if (!schema) { console.error("schema unreadable; aborting"); process.exit(1); }
if (schema.$schema !== "https://json-schema.org/draft/2020-12/schema") fail(schemaRel, "not draft 2020-12");

const registry = readJson("threats/registry-core.json");
const archetypes = readJson("visitors/archetypes-core.json");
const bundlesRel = dataFiles.filter((f) => f.startsWith("types"));
const wavesRel = dataFiles.filter((f) => f.startsWith("waves"));

const threatIds = new Set();
const archetypeIds = new Set();

// ---------- registry checks ----------
if (registry) {
  (registry.threats ?? []).forEach((t, i) => {
    const w = `threats[${i}](${t.id ?? "???"})`;
    ["id","family","band","roles","motion","denomination","mechanical","stats","facts","counters"].forEach((k) => {
      if (!(k in t)) fail(w, `missing key '${k}'`);
    });
    if (!ID_RE.test(t.id ?? "")) fail(w, `bad id '${t.id}'`);
    if (threatIds.has(t.id)) fail(w, `duplicate threat id`);
    threatIds.add(t.id);
    if (!FAMILIES.includes(t.family)) fail(w, `family '${t.family}' unknown`);
    if (!BANDS.includes(t.band)) fail(w, `band '${t.band}' unknown`);
    if (!MOTIONS.includes(t.motion)) fail(w, `motion '${t.motion}' unknown`);
    if (!DENOMINATIONS.includes(t.denomination)) fail(w, `denomination '${t.denomination}' unknown`);
    if (!Array.isArray(t.roles) || t.roles.length === 0 || !t.roles.every((r) => THREAT_ROLES.includes(r))) fail(w, `roles not drawn from the 12 threat roles`);
    if (!Array.isArray(t.counters) || t.counters.length < 2) fail(w, `Second Answer rule (§5.1): needs >=2 counters, got ${(t.counters ?? []).length}`);
    const tiers = new Set((t.counters ?? []).map((c) => c.priceTier));
    if (tiers.size < 2) fail(w, `counters must sit at DIFFERENT prices, got tiers [${[...tiers].join(", ")}]`);
    (t.counters ?? []).forEach((c, j) => {
      if (!DEFENSE_ROLES.includes(c.defenseRole)) fail(`${w}.counters[${j}]`, `defenseRole '${c.defenseRole}' not one of the 9`);
    });
    if (t.mechanical !== true) warn(w, `codex-only entries do not belong in registry-core (R36) — demote to flavour`);
  });
  scanNulls(registry, "threats/registry-core.json");
}

// ---------- archetypes checks ----------
if (archetypes) {
  (archetypes.archetypes ?? []).forEach((a, i) => {
    const w = `archetypes[${i}](${a.id ?? "???"})`;
    ["id","family","durationClass","patienceMode","budgetMs","bounty","facts"].forEach((k) => {
      if (!(k in a)) fail(w, `missing key '${k}'`);
    });
    if (!ID_RE.test(a.id ?? "")) fail(w, `bad id`);
    if (archetypeIds.has(a.id)) fail(w, `duplicate archetype id`);
    archetypeIds.add(a.id);
    if (!VISITOR_FAMILIES.includes(a.family)) fail(w, `family '${a.family}' not one of the six legibility families`);
    if (!DURATION_CLASSES.includes(a.durationClass)) fail(w, `durationClass '${a.durationClass}' unknown`);
    if (!PATIENCE_MODES.includes(a.patienceMode)) fail(w, `patienceMode '${a.patienceMode}' unknown`);
    if (!(typeof a.bounty?.value === "number") && typeof a.bounty?._todo !== "string") fail(w, `bounty scalar null requires _todo cite`);
  });
  scanNulls(archetypes, "visitors/archetypes-core.json");
}

// ---------- bundle checks ----------
const bundleIds = new Set();
for (const rel of bundlesRel) {
  const b = readJson(rel);
  if (!b) continue;
  validateAgainst(schema, b, rel);
  scanNulls(b, rel);
  if (!ID_RE.test(b.id ?? "")) fail(rel, `bundle id '${b.id}' bad`);
  if (bundleIds.has(b.id)) fail(rel, `duplicate bundle id '${b.id}'`);
  bundleIds.add(b.id);
  if (Object.keys(b.handoverNote ?? {}).length !== 3) fail(rel, `handoverNote must be exactly 3 lines (R10)`);
  if (typeof b.ticketPack !== "string" || !b.ticketPack.startsWith("file:packs/")) fail(rel, `ticketPack must be a 'file:packs/…' ref (R46)`);
  (b.threats?.signatureThreats ?? []).forEach((s, i) => {
    if (!threatIds.has(s.id)) fail(`${rel}.threats.signatureThreats[${i}]`, `'${s.id}' not in threats/registry-core.json`);
  });
  Object.entries(b.threats?.unlockedByBuildables ?? {}).forEach(([bk, ids]) => {
    ids.forEach((id) => { if (!threatIds.has(id)) fail(`${rel}.unlockedByBuildables.${bk}`, `'${id}' not in registry`); });
  });
  (b.visitor?.archetypeRefs ?? []).forEach((id) => {
    if (!archetypeIds.has(id)) fail(`${rel}.visitor.archetypeRefs`, `'${id}' not in visitors/archetypes-core.json`);
  });
  (b.skin?.palette?.chord ?? []).forEach((c) => {
    if (/magenta/i.test(c)) fail(`${rel}.skin.palette.chord`, `magenta band excluded — hue ledger reserves magenta for hostile traffic (§1.3/§8.10)`);
  });
  const waveRef = b.threats?.waveTable;
  if (typeof waveRef === "string" && waveRef.startsWith("file:")) {
    const target = waveRef.slice("file:".length);
    if (!existsSync(join(ROOT, target))) warn(rel, `waveTable ref '${target}' not on disk yet (authored next slice)`);
  }
}

// ---------- wave checks (§1.7/§2.24 authoring rules) ----------
for (const rel of wavesRel) {
  const wf = readJson(rel);
  if (!wf) continue;
  scanNulls(wf, rel);
  if (wf.par?.growthPerWave !== 1.115) fail(rel, `par growth must be the doc'd 1.115 (WS-1)`);
  const waves = wf.waves ?? [];
  const seenRoles = new Set();
  let runningPeak = 0;
  for (const wv of waves) {
    const w = `${rel}.waves[n=${wv.n}]`;
    if ((wv.entries ?? []).length === 0) fail(w, "no entries");
    if ((wv.entries ?? []).length > 4) fail(w, `rule (a): max 4 threat entries per wave`);
    if ((wv.entries ?? []).some((e) => !threatIds.has(e.threat))) fail(w, "entry references unknown threat id");
    if (wv.n === 1 && wv.parPct > 40) fail(w, `rule (b): first wave must be <=40% of par, got ${wv.parPct}`);
    if (wv.trough === true && runningPeak > 0 && (runningPeak - wv.parPct) / runningPeak < 0.45)
      fail(w, `rule (c): trough must be >=45% below preceding peak (${wv.parPct} vs ${runningPeak})`);
    runningPeak = Math.max(runningPeak, wv.parPct);
    const primaryShare = new Map();
    for (const e of wv.entries ?? []) {
      if (!BANDS.includes(e.band)) fail(`${w}.entries(${e.threat})`, `band '${e.band}' unknown`);
      const t = (registry?.threats ?? []).find((x) => x.id === e.threat);
      const primary = t?.roles?.[0];
      if (primary) primaryShare.set(primary, (primaryShare.get(primary) ?? 0) + e.pressurePct);
    }
    const over = [...primaryShare.values()].filter((s) => s > 30).length;
    if (over > 2) fail(w, `role quota: ${over} primary roles hold >30% pressure (max 2)`);
    const fresh = [...primaryShare.keys()].filter((r) => !seenRoles.has(r));
    if (wv.n % 4 === 0 && fresh.length === 0) fail(w, `every 4th wave must introduce a new role (none fresh)`);
    [...primaryShare.keys()].forEach((r) => seenRoles.add(r));
    const hard = ["peak", "hard", "harder", "quarter-finale"].includes(wv.hardness);
    if (hard && (wv.denominations ?? []).length < 2) fail(w, `hard wave must draw TWO denominations (§2.24)`);
    (wv.denominations ?? []).forEach((d) => { if (!DENOMINATIONS.includes(d)) fail(w, `denomination '${d}' unknown`); });
    const sum = (wv.entries ?? []).reduce((acc, e) => acc + e.pressurePct, 0);
    if (sum !== 100) fail(w, `entry pressurePct must sum to 100, got ${sum}`);
  }
  (wf.envelopes ?? []).forEach((env, i) => {
    ["id","kind","overWaves","shape","source"].forEach((k) => { if (!(k in env)) fail(`${rel}.envelopes[${i}](${env.id ?? "?"})`, `missing '${k}'`); });
    (env.overWaves ?? []).forEach((n) => { if (!waves.some((wv) => wv.n === n)) fail(`${rel}.envelopes[${i}]`, `overWaves cites unknown n=${n}`); });
  });
}

// ---------- report ----------
console.log(`checked: ${[schemaRel, "threats/registry-core.json", "visitors/archetypes-core.json", ...bundlesRel, ...wavesRel].length} files`);
console.log(`bundles=${bundlesRel.length} threats=${threatIds.size} archetypes=${archetypeIds.size} waves=${wavesRel.length}`);
if (warnings.length) { console.log(`\nWARNINGS (${warnings.length}):`); warnings.forEach((x) => console.log(`  ~ ${x}`)); }
if (todos.length) {
  console.log(`\nTODO INVENTORY (${todos.length} _todo markers — loader-lint fodder):`);
  todos.forEach(([where, note]) => console.log(`  * ${where}\n      ${note}`));
}
if (errors.length) {
  console.error(`\nFAIL — ${errors.length} error(s):`);
  errors.forEach((x) => console.error(`  x ${x}`));
  process.exit(1);
}
console.log("\nPASS — packages/content is structurally green.");
