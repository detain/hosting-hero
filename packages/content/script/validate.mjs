#!/usr/bin/env node
// Structural validator for packages/content — Node stdlib only (no npm deps).
// Gates: parse, schema-required keys (via a JSON-Schema-subset interpreter),
// id uniqueness, cross-registry reference resolution, PALETTE ANCHOR RESOLUTION
// (every bundle buildables.paletteRef must equal an authored palettes/*.json id
// and every archetypeInstances name must live in that palette — audit group-13),
// R61 verb-changer reserve budget, Second-Answer counters,
// VISUAL-COVERAGE MANIFEST-LINT (§8.18 / OD-12(d) / ADR-0013 ruling 5d: every
// threat, visitor archetype, and palette archetype carries a `visual` slug or an
// explicit codexOnly tag — undrawn shipped content fails red), and the LOOKALIKE
// LAW (§2.4 / OD-18 / ADR-0013 ruling 9: threat.lookalikeOf names the visitor
// archetype it masks; direction checked, ids resolved, >=1 mimic-seed per shipped
// bundle),
// null=>_todo discipline, (PROVISIONAL|RATIFIED)-[ABC] tuningSheet markers, §1.7 wave
// authoring rules, and i18n ticket-pack conformance: packs exist for every
// file:packs/ ref, cover every bundle-referenced key, obey the decision/flavour
// namespace wall (§9.3 clause 2), keep README §Key literals verbatim-synced,
// declare every {slot} they use, and carry zero §9.11 technique vocabulary,
// and POLICY DECK books (schema/policy-deck.schema.json + hand-enforced
// validatePolicyCard grammar walls, dup card ids, appliesTo resolution,
// §9.11 scans over every deck string, door-carrier coverage warnings).
// Exit non-zero on any failure; prints the _todo inventory (packs and decks get
// their own separate counters so the bundle inventory stays the number
// downstream lanes pin).
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];
const todos = [];
const packTodos = []; // pack _todo markers counted separately: the bundle inventory is a pinned number
const deckTodos = []; // deck _todo markers counted separately, same law (structural card nulls are NOT never-invent nulls)

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
// Tuning-sheet wire stamp grammar — BOTH ratification forms accepted.
// ADR-0009 (OD-2, 2026-10-09) ratified sheet B; the owner re-author sweep
// (2026-10-17, closes the ADR-0015 #1 NOT-in-set ledger) flipped the twelve
// type bundles' `"tuningSheet"` fields from PROVISIONAL-B to RATIFIED-B.
// Legacy PROVISIONAL-[ABC] stays VALID (tolerance law, mirroring the
// boot.build unknown-key rule): waves/ slices and the threat registry still
// carry the pre-sweep form, and any fixture authored before the sweep must
// keep parsing. HONESTY LAW (comment-level, not machine-policed): only sheet
// B was ratified, so RATIFIED-B is the sole truthful RATIFIED pairing — a
// hypothetical A/C card must keep its PROVISIONAL tag (OD-2 kept A/C honestly
// tagged in the engine: waves/pressure.ts TUNING_SHEETS A/C status stays
// PROVISIONAL). The letter suffix is the only part the engine ever reads —
// and only via host-passed options (bare "A"|"B"|"C" into waves/foreign.ts /
// versus/match.ts); the stamp string itself is a loader convention key,
// stripped at parse and never resolved.
const TUNING_RE = /^(PROVISIONAL|RATIFIED)-[ABC]$/;
const ID_RE = /^([a-z0-9][a-z0-9-]*:)?[a-z0-9][a-z0-9-]*$/;
const VISUAL_SLUG_RE = /^[a-z][a-z0-9-]*$/; // §8.18 manifest slug: lowercase-hyphenated render name
const JSON_SCHEMA_DRAFT = "https://json-schema.org/draft/2020-12/schema";

// ---------- i18n pack vocabulary (detailed at the packs section) ----------
// The wall §9.3 clause 2 demands, made machine-checkable: every namespace root is
// either decision-surface (read while deciding or losing — written SOBER, never
// funny at the moment of loss) or flavour (quiet surfaces — recognition comedy).
// A bundle-referenced key may only ever live in `decision` of ITS OWN pack.
const DECISION_ROOTS = new Set(["type","visitor","goal","scarce","skin","economy","cac","verbs","relations","scenarios","handover","rosetta","terms","refusal","alert","status","wave"]);
const FLAVOUR_ROOTS = new Set(["ticket","press","forum","chatter","loading","abuse","canary","intern","sticky","vendor","achievement","codex"]);
const PACK_KEY_RE = /^[a-z][a-z0-9]*(\.[a-z0-9][a-z0-9-]*)+$/;
const SLOT_TOKEN_RE = /\{([^{}]*)\}/g;
const SLOT_NAME_RE = /^[a-z][A-Za-z0-9]*$/;
const MIN_TEMPLATES = 25; // quality floor (~25-40 per brief)
const MAX_TEMPLATE_CHARS = 600;
// §9.11: depict the business, never the technique. Ban-list lint over every template body.
const TECHNIQUE_BANS = [
  [/\brm\s+-[rf]{1,2}\b/i, "shell delete command"],
  [/\b(chmod|chown)\s+[0-7]{3,4}\b/i, "shell permission invocation"],
  [/\b(curl|wget|nc)\b/i, "command-line fetch/tunnel tool"],
  [/\bsudo\b/i, "privilege-escalation command"],
  [/\bbash\s+-c\b/i, "shell invocation"],
  [/\bDROP\s+(TABLE|DATABASE)\b/i, "SQL DDL statement"],
  [/\bSELECT\b[\s\S]{0,80}?\bFROM\b/, "SQL statement shape"],
  [/\/etc\/(passwd|shadow|hosts|crontab)\b/, "system path disclosure"],
  [/\bCVE-\d{4}-\d{4,}\b/i, "CVE identifier"],
  [/:\(\)\s*\{[^}]*\|[^}]*\}/, "fork-bomb shape"],
  [/\bbase64\s+(-d|--decode)\b/i, "payload-decoding command"],
];

// ---------- policy-deck vocabulary (hand-copied EXACT member lists, this file's
// BANDS/FAMILIES posture) — sources of truth: policy/grammar.ts:35-74 closed
// sets + types.ts PolicyCard. Drift here reddens the forged-deck probes below. ----------
const POLICY_COMPARATORS = [">", "<", "changed", "fails", "completes"];
const POLICY_METRIC_UNITS = ["percent", "us", "ms", "count", "micro-usd", "ratio", "minutes"];
const POLICY_ACTION_IDS = ["scale-out", "shed-class", "page", "open-ticket", "dispatch-remote-hands", "raise-inspection-depth", "failover", "run-runbook", "drain", "queue-change"];
const POLICY_BANDS = ["inform", "consult", "execute"];
const POLICY_SCOPE_KINDS = ["object", "role", "query", "class", "estate"];
const POLICY_THRESHOLD_KINDS = ["value", "class-ref", "event-name"];
const POLICY_ELSE_TARGETS = ["band", "role", "runbook"];
// The six PolicyActionIds the door translates into player verbs
// (intent-door.ts RULE_CARRIER_MAP). Anything else — failover,
// dispatch-remote-hands, queue-change, run-runbook — is the bought-verb wall
// (:795-799): legal content, refuses at the door. Deck cards that can ONLY do
// that get a WARN (confirm-authored-as-wall-content), never a fail.
const RULE_MAPPED_CARRIERS = new Set(["raise-inspection-depth", "drain", "shed-class", "scale-out", "page", "open-ticket"]);
const BIGINT_STR_RE = /^-?\d+$/;
const NON_NEG_BIGINT_STR_RE = /^\d+$/;
// Exact-key fences. Declared as additionalProperties:false in the schema, but
// the interpreter only polices OBJECT-form additionalProperties (:148-151) —
// boolean false is silently permissive — so the fence is hand-rolled here.
const DECK_KEYS = ["schemaVersion", "deckId", "name", "appliesTo", "cards", "_provenance", "_todo"];
const CARD_KEYS = ["id", "scope", "when", "for", "then", "unless", "else", "band", "upkeepMicroUsd"];

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
const scanNulls = (node, where, sink = todos) => {
  if (Array.isArray(node)) { node.forEach((el, i) => scanNulls(el, `${where}[${i}]`, sink)); return; }
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
    fail(`${where}.tuningSheet`, `'${node.tuningSheet}' must match (PROVISIONAL|RATIFIED)-[ABC]`);
  }
  if (typeof node._todo === "string" && node._todo.trim()) sink.push([where, node._todo]);
  Object.entries(node).forEach(([k, v]) => { if (k !== "_todo") scanNulls(v, `${where}.${k}`, sink); });
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
if (schema.$schema !== JSON_SCHEMA_DRAFT) fail(schemaRel, "not draft 2020-12");

// Registry schemas: the structural shell for the §8.18 visual / OD-18 lookalike
// fields. The deep laws (coverage OR-tag, id resolution, seed quotas) are hand-
// rolled below; these catch malformed shapes at the same boundary the interpreter
// enforces for bundles, palettes, and packs.
const threatRegistrySchemaRel = "schema/threat-registry.schema.json";
const threatRegistrySchema = readJson(threatRegistrySchemaRel);
if (!threatRegistrySchema) { console.error("threat registry schema unreadable; aborting"); process.exit(1); }
if (threatRegistrySchema.$schema !== JSON_SCHEMA_DRAFT) fail(threatRegistrySchemaRel, "not draft 2020-12");

const visitorRegistrySchemaRel = "schema/visitor-registry.schema.json";
const visitorRegistrySchema = readJson(visitorRegistrySchemaRel);
if (!visitorRegistrySchema) { console.error("visitor registry schema unreadable; aborting"); process.exit(1); }
if (visitorRegistrySchema.$schema !== JSON_SCHEMA_DRAFT) fail(visitorRegistrySchemaRel, "not draft 2020-12");

const registry = readJson("threats/registry-core.json");
const archetypes = readJson("visitors/archetypes-core.json");
const bundlesRel = dataFiles.filter((f) => f.startsWith("types"));
const wavesRel = dataFiles.filter((f) => f.startsWith("waves"));

// Parsed bundles + the dotted i18n keys each references anywhere (strings and
// array elements alike) — the pinned key contract its ticketPack must satisfy.
const bundles = [];
const bundleKeyRefs = new Map();

const threatIds = new Set();
const archetypeIds = new Set();
const threatLookalikes = new Map(); // threat id -> visitor archetype id (§2.4 costume)
let bundlesWithLookalikeSeed = 0;

// ---------- registry checks ----------
if (registry) {
  validateAgainst(threatRegistrySchema, registry, "threats/registry-core.json");
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
    if (typeof t.lookalikeOf === "string") {
      if (!VISUAL_SLUG_RE.test(t.lookalikeOf)) fail(`${w}.lookalikeOf`, `'${t.lookalikeOf}' is not a lowercase-hyphenated archetype id`);
      threatLookalikes.set(t.id, t.lookalikeOf);
    } else if (t.lookalikeOf !== undefined) {
      fail(`${w}.lookalikeOf`, `must be a visitor archetype id string when present (§2.4)`);
    }
  });
  scanNulls(registry, "threats/registry-core.json");
}

// ---------- archetypes checks ----------
if (archetypes) {
  validateAgainst(visitorRegistrySchema, archetypes, "visitors/archetypes-core.json");
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
    if ("lookalikeOf" in a) fail(`${w}.lookalikeOf`, `direction law (§2.4/OD-18): a THREAT masks a visitor, never the reverse — lookalikeOf belongs on threats/registry entries only`);
  });
  scanNulls(archetypes, "visitors/archetypes-core.json");
}

// ---------- visual-coverage + lookalike lint (§8.18 OD-12(d) / OD-18, ADR-0013 rulings 5d+9) ----------
// Coverage leg: every shipped entity the screen must draw — threat (§2), visitor
// archetype (§3.2), palette archetype (§4.10; the buildables leg resolves through
// the existing archetypeInstances->palette check in the bundle loop below) —
// carries a `visual` slug grounded in the design-doc prose, or an explicit
// codexOnly:true tag declaring "no silhouette; codex flavour only". R36 keeps
// registry-core mechanical, so shipped content needs zero codexOnly tags today —
// the hatch exists for future demotions. Absence fails red: silent invisibility
// is exactly the drift this manifest-lint was ratified to catch.
let codexOnlyTags = 0;
const lintVisualCoverage = (e, where) => {
  if (e?.codexOnly === true) { codexOnlyTags++; return true; }
  if (typeof e?.visual !== "string") {
    fail(where, `visual-coverage (§8.18/OD-12(d)): needs a 'visual' slug or an explicit codexOnly:true tag — every shipped entry is either drawable or declares itself codex-only`);
    return false;
  }
  if (!VISUAL_SLUG_RE.test(e.visual)) {
    fail(`${where}.visual`, `'${e.visual}' is not a lowercase-hyphenated slug (^[a-z][a-z0-9-]*$)`);
    return false;
  }
  return true;
};
let threatsVisual = 0, threatsVisualTotal = 0;
(registry?.threats ?? []).forEach((t) => {
  threatsVisualTotal++;
  if (lintVisualCoverage(t, `threats(${t.id})`)) threatsVisual++;
});
let archetypesVisual = 0, archetypesVisualTotal = 0;
(archetypes?.archetypes ?? []).forEach((a) => {
  archetypesVisualTotal++;
  if (lintVisualCoverage(a, `archetypes(${a.id})`)) archetypesVisual++;
});
// Resolution leg: a mask must be an authored visitor (collected above; ids exist
// only after the archetype pass ran).
for (const [tid, arc] of threatLookalikes) {
  if (!archetypeIds.has(arc)) fail(`threats(${tid}).lookalikeOf`, `'${arc}' not a visitors/archetypes-core.json id — the costume must be an authored visitor (§2.4/OD-18)`);
}

// ---------- palette checks (§0.2 R7 / §4.10-R61 anchor resolution) ----------
// A bundle's buildables.paletteRef must resolve to an authored palette here, and
// every archetype its buildables.archetypeInstances names must be defined in that
// palette. Before audit group-13 the shipped "palette:shared-80" resolved nowhere.
const paletteSchemaRel = "schema/palette.schema.json";
const paletteSchema = readJson(paletteSchemaRel);
if (!paletteSchema) { console.error("palette schema unreadable; aborting"); process.exit(1); }
if (paletteSchema.$schema !== "https://json-schema.org/draft/2020-12/schema") fail(paletteSchemaRel, "not draft 2020-12");

const palettesRel = dataFiles.filter((f) => f.startsWith("palettes") && f.endsWith(".json"));
const paletteArchetypes = new Map(); // palette id -> Set<archetype id>
const paletteIdToRel = new Map(); // palette id -> rel (orphan guard)
let paletteArchVisual = 0, paletteArchVisualTotal = 0; // §8.18 buildables leg
for (const rel of palettesRel) {
  const p = readJson(rel);
  if (!p) continue;
  validateAgainst(paletteSchema, p, rel);
  scanNulls(p, rel);
  if (!ID_RE.test(p.id ?? "")) fail(rel, `palette id '${p.id}' bad`);
  if (paletteArchetypes.has(p.id)) { fail(rel, `duplicate palette id '${p.id}'`); continue; }
  if (typeof p.id === "string") paletteIdToRel.set(p.id, rel);
  const archSet = new Set();
  const verbSet = new Set();
  (p.archetypes ?? []).forEach((a, i) => {
    const w = `${rel}.archetypes[${i}](${a.id ?? "???"})`;
    if (!ID_RE.test(a.id ?? "")) fail(w, `bad archetype id '${a.id}'`);
    if (archSet.has(a.id)) fail(w, `duplicate archetype id '${a.id}'`);
    archSet.add(a.id);
    if (a.verbChanger === true) verbSet.add(a.id);
    paletteArchVisualTotal++;
    if (lintVisualCoverage(a, w)) paletteArchVisual++;
  });
  const reserve = p.verbChangerReserve ?? {};
  const reserveNames = new Set();
  (reserve.items ?? []).forEach((it, i) => {
    const w = `${rel}.verbChangerReserve.items[${i}](${it?.name ?? "???"})`;
    if (reserveNames.has(it?.name)) fail(w, `duplicate reserve item '${it?.name}'`);
    reserveNames.add(it?.name);
  });
  if ((reserve.items ?? []).length > (reserve.max ?? 0))
    fail(rel, `verbChangerReserve holds ${(reserve.items ?? []).length} items over max ${reserve.max} (R61 budget)`);
  verbSet.forEach((id) => {
    if (!reserveNames.has(id)) fail(rel, `archetype '${id}' is verbChanger:true but absent from verbChangerReserve — the R61 reserve is the only place a verb-changer may live`);
  });
  paletteArchetypes.set(p.id, archSet);
}

// ---------- bundle checks ----------
const bundleIds = new Set();
for (const rel of bundlesRel) {
  const b = readJson(rel);
  if (!b) continue;
  bundles.push({ rel, b });
  validateAgainst(schema, b, rel);
  scanNulls(b, rel);
  if (!ID_RE.test(b.id ?? "")) fail(rel, `bundle id '${b.id}' bad`);
  if (bundleIds.has(b.id)) fail(rel, `duplicate bundle id '${b.id}'`);
  bundleIds.add(b.id);
  if (Object.keys(b.handoverNote ?? {}).length !== 3) fail(rel, `handoverNote must be exactly 3 lines (R10)`);
  if (typeof b.ticketPack !== "string" || !b.ticketPack.startsWith("file:packs/")) fail(rel, `ticketPack must be a 'file:packs/…' ref (R46)`);
  const keyRefs = new Set();
  collectBundleKeys(b, keyRefs);
  bundleKeyRefs.set(rel, keyRefs);
  (b.threats?.signatureThreats ?? []).forEach((s, i) => {
    if (!threatIds.has(s.id)) fail(`${rel}.threats.signatureThreats[${i}]`, `'${s.id}' not in threats/registry-core.json`);
  });
  // Lookalike seed law (OD-18/ADR-0013 ruling 9): every shipped type bundle seeds
  // >=1 mimic — a signature threat whose registry entry declares lookalikeOf.
  // "Exactly one" is NOT lintable: bundles legitimately share signature ids, and
  // masks ride the registry entry, so reuse inherits the law by design.
  if ((b.threats?.signatureThreats ?? []).some((s) => threatLookalikes.has(s.id))) bundlesWithLookalikeSeed++;
  else fail(`${rel}.threats.signatureThreats`, `lookalike seed (§2.4/OD-18): no signature threat carries lookalikeOf — every shipped bundle must seed at least one mimic of one of its own visitors`);
  Object.entries(b.threats?.unlockedByBuildables ?? {}).forEach(([bk, ids]) => {
    ids.forEach((id) => { if (!threatIds.has(id)) fail(`${rel}.unlockedByBuildables.${bk}`, `'${id}' not in registry`); });
  });
  (b.visitor?.archetypeRefs ?? []).forEach((id) => {
    if (!archetypeIds.has(id)) fail(`${rel}.visitor.archetypeRefs`, `'${id}' not in visitors/archetypes-core.json`);
  });
  const paletteRef = b.buildables?.paletteRef;
  if (typeof paletteRef !== "string" || !paletteRef.startsWith("palette:")) {
    fail(`${rel}.buildables.paletteRef`, `must be a 'palette:<id>' ref, got ${JSON.stringify(paletteRef)}`);
  } else if (!paletteArchetypes.has(paletteRef)) {
    fail(`${rel}.buildables.paletteRef`, `'${paletteRef}' matches no authored palette (known: [${[...paletteArchetypes.keys()].join(", ") || "none"}])`);
  } else {
    (b.buildables?.archetypeInstances ?? []).forEach((ai, i) => {
      if (!paletteArchetypes.get(paletteRef).has(ai?.archetype))
        fail(`${rel}.buildables.archetypeInstances[${i}]`, `archetype '${ai?.archetype}' not defined in palette '${paletteRef}'`);
    });
  }
  (b.skin?.palette?.chord ?? []).forEach((c) => {
    if (/magenta/i.test(c)) fail(`${rel}.skin.palette.chord`, `magenta band excluded — hue ledger reserves magenta for hostile traffic (§1.3/§8.10)`);
  });
  const waveRef = b.threats?.waveTable;
  if (typeof waveRef === "string" && waveRef.startsWith("file:")) {
    const target = waveRef.slice("file:".length);
    if (!existsSync(join(ROOT, target))) warn(rel, `waveTable ref '${target}' not on disk yet (authored next slice)`);
  }
}

// Orphan guard: a palette no bundle points at is drift waiting to happen.
{
  const paletteUsed = new Set();
  for (const { b } of bundles) if (typeof b.buildables?.paletteRef === "string") paletteUsed.add(b.buildables.paletteRef);
  for (const [id, rel] of paletteIdToRel) if (!paletteUsed.has(id)) warn(rel, `palette '${id}' referenced by no bundle (orphan)`);
}

// ---------- i18n ticket packs (R46; README §Key literals; §9.3/§9.11 laws) ----------
const packSchemaRel = "schema/i18n-pack.schema.json";
const packSchema = readJson(packSchemaRel);
if (!packSchema) { console.error("pack schema unreadable; aborting"); process.exit(1); }
if (packSchema.$schema !== "https://json-schema.org/draft/2020-12/schema") fail(packSchemaRel, "not draft 2020-12");

DECISION_ROOTS.forEach((r) => { if (FLAVOUR_ROOTS.has(r)) fail(packSchemaRel, `namespace root '${r}' declared in BOTH vocabularies`); });

function collectBundleKeys(node, out) {
  if (typeof node === "string") { if (PACK_KEY_RE.test(node)) out.add(node); return; }
  if (Array.isArray(node)) { node.forEach((el) => collectBundleKeys(el, out)); return; }
  if (node && typeof node === "object") Object.values(node).forEach((v) => collectBundleKeys(v, out));
}

const templateBodies = (tpl) =>
  typeof tpl === "string" ? [tpl]
  : tpl && typeof tpl === "object" && typeof tpl.fallback === "string"
    ? [tpl.fallback, ...Object.values(tpl.eras ?? {}).filter((v) => typeof v === "string")]
    : null;

const slotsOf = (body) => new Set([...body.matchAll(SLOT_TOKEN_RE)].map((m) => m[1]));

const checkTemplate = (tpl, where, pack, usedSlots) => {
  const bodies = templateBodies(tpl);
  if (!bodies) { fail(where, "template must be a string or an {eras, fallback} object"); return; }
  for (const [i, body] of bodies.entries()) {
    if (body.length === 0) fail(`${where}[${i}]`, "empty template body");
    if (body.length > MAX_TEMPLATE_CHARS) fail(`${where}[${i}]`, `template body ${body.length} chars > ${MAX_TEMPLATE_CHARS}`);
    const tokens = [...body.matchAll(SLOT_TOKEN_RE)];
    const opens = (body.match(/\{/g) ?? []).length;
    const closes = (body.match(/\}/g) ?? []).length;
    if (opens !== tokens.length || closes !== tokens.length) fail(`${where}[${i}]`, "unbalanced braces — slot syntax is {name} only");
    for (const t of tokens) {
      if (!SLOT_NAME_RE.test(t[1])) { fail(`${where}[${i}]`, `bad slot token '{${t[1]}}' (lowerCamel identifier, no nesting)`); continue; }
      if (!pack.slots?.[t[1]]) fail(`${where}[${i}]`, `slot '{${t[1]}}' missing from the pack slots glossary`);
      else usedSlots.add(t[1]);
    }
    for (const [re, what] of TECHNIQUE_BANS) {
      const hit = body.match(re);
      if (hit) fail(`${where}[${i}]`, `§9.11 technique ban-list: contains ${what} ('${hit[0]}')`);
    }
  }
  if (typeof tpl === "object" && tpl !== null) {
    const eraKeys = Object.keys(tpl.eras ?? {});
    if (eraKeys.length === 0) fail(where, "era variant object needs >=1 era entry and a fallback");
    for (const ek of eraKeys) {
      if (!/^\d{4}$/.test(ek)) fail(`${where}.eras.${ek}`, "era code must be a 4-digit year");
      else if (!(ek in (pack.eraCodes ?? {}))) fail(`${where}.eras.${ek}`, `era '${ek}' not declared in pack eraCodes [${Object.keys(pack.eraCodes ?? {}).join(", ") || "none declared"}]`);
      if (typeof tpl.eras[ek] !== "string") fail(`${where}.eras.${ek}`, "era variant must be a string");
    }
    const extras = Object.keys(tpl).filter((k) => k !== "eras" && k !== "fallback");
    if (extras.length) fail(where, `unexpected keys in era object [${extras.join(", ")}]`);
    const base = [...slotsOf(tpl.fallback)].sort().join(",");
    eraKeys.forEach((ek) => {
      if (typeof tpl.eras[ek] === "string" && [...slotsOf(tpl.eras[ek])].sort().join(",") !== base)
        fail(`${where}.eras.${ek}`, "era variant slot set differs from fallback — every variant takes the same {slots}");
    });
  }
};

const packsClaimed = new Set();
const parsedPacks = []; // { rel, pack }
for (const { rel, b } of bundles) {
  if (typeof b.ticketPack !== "string" || !b.ticketPack.startsWith("file:packs/")) continue; // already failed above
  const packRel = b.ticketPack.slice("file:".length);
  if (!existsSync(join(ROOT, packRel))) { fail(rel, `ticketPack '${packRel}' does not exist on disk (R46)`); continue; }
  if (packsClaimed.has(packRel)) { fail(rel, `ticketPack '${packRel}' already claimed by another bundle`); continue; }
  packsClaimed.add(packRel);
  const pack = readJson(packRel);
  if (!pack) continue;
  validateAgainst(packSchema, pack, packRel);
  scanNulls(pack, packRel, packTodos);
  parsedPacks.push({ rel: packRel, pack });
  if (pack.appliesTo !== undefined && pack.appliesTo !== b.id) fail(packRel, `appliesTo '${pack.appliesTo}' != bundle id '${b.id}'`);
  for (const ek of Object.keys(pack.eraCodes ?? {})) if (!/^\d{4}$/.test(ek)) fail(`${packRel}.eraCodes.${ek}`, "era code must be a 4-digit year");
  const decision = pack.decision ?? {};
  const flavour = pack.flavour ?? {};
  if (Object.keys(decision).length < 5) fail(packRel, "decision namespace under-populated (<5 templates)");
  if (Object.keys(flavour).length < 5) fail(packRel, "flavour namespace under-populated (<5 templates)");
  const usedSlots = new Set();
  for (const [mapName, map, roots] of [["decision", decision, DECISION_ROOTS], ["flavour", flavour, FLAVOUR_ROOTS]]) {
    for (const [key, tpl] of Object.entries(map)) {
      const where = `${packRel}.${mapName}.${key}`;
      if (!PACK_KEY_RE.test(key)) { fail(where, "not a dotted lower-case key"); continue; }
      const root = key.split(".")[0];
      if (!roots.has(root)) fail(where, `root '${root}' is not in the ${mapName} vocabulary — decision/flavour namespaces are partitioned by root (§9.3 separation law)`);
      if (key in (mapName === "decision" ? flavour : decision)) fail(where, "key present in BOTH decision and flavour");
      checkTemplate(tpl, where, pack, usedSlots);
    }
  }
  const total = Object.keys(decision).length + Object.keys(flavour).length;
  if (total < MIN_TEMPLATES) fail(packRel, `only ${total} templates; quality floor is ${MIN_TEMPLATES}`);
  for (const slot of Object.keys(pack.slots ?? {}))
    if (!usedSlots.has(slot)) fail(`${packRel}.slots.${slot}`, "glossary slot never used by any template (dead slot)");
  // Provenance coverage: every template carries a cite (or null + _provenance._todo).
  const prov = pack._provenance ?? {};
  for (const key of [...Object.keys(decision), ...Object.keys(flavour)]) {
    if (!(key in prov)) fail(`${packRel}._provenance`, `no provenance entry for '${key}'`);
    else if (prov[key] !== null && typeof prov[key] !== "string") fail(`${packRel}._provenance.${key}`, "provenance must be a cite string or null");
  }
  for (const pk of Object.keys(prov)) {
    if (pk === "_todo") continue;
    if (!(pk in decision) && !(pk in flavour)) fail(`${packRel}._provenance.${pk}`, "provenance entry with no matching template key");
  }
}

// Orphan guard: a pack file no bundle claims is drift waiting to happen.
for (const f of dataFiles.filter((x) => x.startsWith("packs") && x.endsWith(".i18n.json")))
  if (!packsClaimed.has(f)) fail(f, "pack file referenced by no bundle (orphan)");

// Global flavour wall: no bundle-referenced key may live in ANY pack's flavour map.
const allBundleKeys = new Set();
bundleKeyRefs.forEach((set) => set.forEach((k) => allBundleKeys.add(k)));
for (const { rel: packRel, pack } of parsedPacks)
  for (const key of Object.keys(pack.flavour ?? {}))
    if (allBundleKeys.has(key)) fail(`${packRel}.flavour.${key}`, "decision-surface key (referenced by a bundle) found in flavour namespace");

// Pinned ⊇ contract: every key a bundle references resolves in THAT bundle's pack decision map.
for (const { rel, b } of bundles) {
  const refs = bundleKeyRefs.get(rel);
  if (!refs) continue;
  const packRel = typeof b.ticketPack === "string" && b.ticketPack.startsWith("file:packs/") ? b.ticketPack.slice("file:".length) : null;
  const pack = packRel ? parsedPacks.find((p) => p.rel === packRel)?.pack : null;
  if (!pack) continue; // missing pack already failed above
  for (const key of [...refs].sort()) {
    if (key in (pack.decision ?? {})) continue;
    if (key in (pack.flavour ?? {})) fail(`${rel} -> ${packRel}`, `bundle-referenced key '${key}' sits in flavour; decision-surface keys belong in decision (§9.3)`);
    else fail(`${rel} -> ${packRel}`, `bundle-referenced key '${key}' missing from the pack`);
  }
}

// README §Key literals verbatim sync: the table is the pinned seed; the pack must agree.
let readmeRows = 0;
{
  let readme;
  try {
    readme = readFileSync(join(ROOT, "README.md"), "utf8");
  } catch {
    fail("README.md", "unreadable — literal-sync check inert");
  }
  if (readme) {
    const rowRe = /^\|\s*`([a-z][a-z0-9.-]*)`\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/gm;
    let m;
    while ((m = rowRe.exec(readme))) {
      const [, key, cell] = m;
      const lit = cell.match(/"([^"]+)"/);
      if (!lit) { fail(`README.md §Key literals`, `row '${key}': no double-quoted literal to sync against`); continue; }
      readmeRows++;
      const owner = parsedPacks.find((p) => p.pack.decision?.[key] !== undefined);
      const squatter = parsedPacks.find((p) => p.pack.flavour?.[key] !== undefined);
      if (!owner) {
        fail(`README.md §Key literals`, `'${key}' pinned by README not found in any pack's decision namespace${squatter ? ` (found in ${squatter.rel} flavour — decision keys may not live in flavour)` : ""}`);
        continue;
      }
      const tpl = owner.pack.decision[key];
      if (typeof tpl !== "string") { fail(`README.md §Key literals`, `'${key}' is era-varied in ${owner.rel} but README pins a single literal`); continue; }
      if (tpl !== lit[1]) fail(`README.md §Key literals`, `'${key}' diverged: README says "${lit[1]}" / pack ${owner.rel} says "${tpl}"`);
    }
    if (readmeRows === 0) fail("README.md", "§Key literals table parsed to zero rows — sync check inert (liveness guard)");
  }
}

// ---------- wave checks (§1.7/§2.24 authoring rules) ----------
for (const rel of wavesRel) {
  const wf = readJson(rel);
  if (!wf) continue;
  scanNulls(wf, rel);
  if (wf.par?.growthPerWave !== 1.115) fail(rel, `par growth must be the doc'd 1.115 (WS-1)`);
  const waves = wf.waves ?? [];
  const unresolvedTitles = waves
    .map((wv) => wv.title)
    .filter((t) => typeof t === "string" && PACK_KEY_RE.test(t) && !parsedPacks.some((p) => p.pack.decision?.[t] !== undefined || p.pack.flavour?.[t] !== undefined));
  if (unresolvedTitles.length)
    warn(rel, `wave title keys unresolved in any pack [${unresolvedTitles.join(", ")}] — placeholder names awaiting a waves-lane rename (pack contract delta reported; 'wave' root reserved in the decision vocabulary)`);
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

// ---------- policy decks (schema/policy-deck.schema.json; §7.14/§B policy cards) ----------
// G7 content-decks 1/4: the FILE leg for JSON book files later lanes author into
// packages/content/decks/. Zero decks ship today — an absent/empty dir is vacuously
// green. Every wall below mirrors `validatePolicyCard` clause-for-clause
// (packages/sim-core/src/policy/grammar.ts:217-272); bigint fields ride the house
// decimal-string form (WireFixed/WireUs law — revival into bigints is the
// boot.rules rider's job, not the file's). No embedded hashes: the door keys cards
// by a HOST-OWNED opaque hash (protocol.ts:355-362), so a deck that shipped one
// would be a lie the fence here keeps out (unknown-field deny).
const deckSchemaRel = "schema/policy-deck.schema.json";
const deckSchema = readJson(deckSchemaRel);
if (!deckSchema) { console.error("deck schema unreadable; aborting"); process.exit(1); }
if (deckSchema.$schema !== "https://json-schema.org/draft/2020-12/schema") fail(deckSchemaRel, "not draft 2020-12");

const decksRel = dataFiles.filter((f) => f.startsWith("decks") && f.endsWith(".json"));

const denyExtras = (where, node, allowed) => {
  for (const k of Object.keys(node))
    if (!allowed.includes(k)) fail(where, `unknown field '${k}' — the deck-file fence (strict loader UNKNOWN_FIELD posture; schema declares additionalProperties:false, this allow-list is the enforcement the interpreter cannot do)`);
};

const isStr = (v) => typeof v === "string" && v.length > 0;
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// predicate := metric, comparator, threshold (grammar.ts checkPredicate/checkThreshold).
const checkDeckPredicate = (p, where) => {
  if (!isObj(p)) { fail(where, "predicate must be an object"); return; }
  denyExtras(where, p, ["metric", "comparator", "threshold"]);
  ["metric", "comparator", "threshold"].forEach((k) => { if (!(k in p)) fail(where, `missing required key '${k}'`); });
  const t = p.threshold;
  if (!isObj(t)) { fail(`${where}.threshold`, "threshold must be an object"); return; }
  if (!POLICY_THRESHOLD_KINDS.includes(t.kind)) return; // schema string-enum already reddened it
  if (t.kind === "value") {
    if (!isObj(t) || !("amount" in t) || typeof t.amount !== "string" || !BIGINT_STR_RE.test(t.amount)) fail(`${where}.threshold`, "value threshold needs 'amount' as a decimal string (Fixed bigint form)");
    if (!POLICY_METRIC_UNITS.includes(t.unit)) fail(`${where}.threshold`, `unit "${t.unit}" is not in the closed enum`); // grammar.ts:178-182
    denyExtras(`${where}.threshold`, t, ["kind", "amount", "unit"]);
  } else {
    // ">"/"<" need a numeric threshold; class-ref/event-name pair only with
    // changed/fails/completes (grammar.ts:188-194).
    if (p.comparator === ">" || p.comparator === "<")
      fail(`${where}.comparator`, `comparator "${p.comparator}" requires a value threshold, got ${t.kind}`);
    if (t.kind === "class-ref") {
      if (!isStr(t.classId)) fail(`${where}.threshold`, "class-ref threshold needs a non-empty classId");
      denyExtras(`${where}.threshold`, t, ["kind", "classId"]);
    } else {
      if (!isStr(t.name)) fail(`${where}.threshold`, "event-name threshold needs a non-empty name");
      denyExtras(`${where}.threshold`, t, ["kind", "name"]);
    }
  }
};

const checkDeckAction = (a, where) => {
  if (!isObj(a)) { fail(where, "action must be an object"); return; }
  denyExtras(where, a, ["id", "runbookName", "value"]);
  ["id", "runbookName", "value"].forEach((k) => { if (!(k in a)) fail(where, `missing required key '${k}'`); }); // PolicyActionWire presence law
  if (a.id === "run-runbook") {
    if (!isStr(a.runbookName)) fail(where, "run-runbook requires a non-empty runbookName"); // grammar.ts:201-203
  } else if (a.runbookName !== null) {
    fail(where, "runbookName is only legal on run-runbook"); // grammar.ts:204-206
  }
  if ("value" in a && a.value !== null && !BIGINT_STR_RE.test(String(a.value))) fail(`${where}.value`, "action value must be a decimal string or null");
};

const checkDeckCard = (card, where, seenIds) => {
  if (!isObj(card)) { fail(where, "card must be an object"); return; }
  denyExtras(where, card, CARD_KEYS);
  ["id", "scope", "when", "then", "band", "upkeepMicroUsd"].forEach((k) => { if (!(k in card)) fail(where, `missing required key '${k}'`); });
  if (isStr(card.id)) {
    if (seenIds.has(card.id)) fail(where, `duplicate card id '${card.id}' within this deck (door card-id-collision law: handlePolicyCardCommit refuses a book holding the id twice)`);
    else seenIds.add(card.id);
  }
  const s = card.scope;
  if (!isObj(s)) fail(`${where}.scope`, "scope must be an object");
  else {
    denyExtras(`${where}.scope`, s, ["kind", "ref"]);
    if (!POLICY_SCOPE_KINDS.includes(s.kind)) fail(`${where}.scope`, `scope kind "${s.kind}" is not in the closed enum`); // grammar.ts:222-225
    else if (s.kind !== "estate" && !isStr(s.ref)) fail(where, "non-estate scope requires a non-empty ref"); // grammar.ts:226-228
    else if (s.kind === "estate" && s.ref !== null) fail(where, "estate scope ref must be null"); // grammar.ts:229-231
  }
  if (Array.isArray(card.when)) card.when.forEach((p, i) => checkDeckPredicate(p, `${where}.when[${i}]`)); // 1..3 arity: interpreter minItems/maxItems (probe-verified)
  if (card.for !== undefined) {
    const w4 = `${where}.for`;
    if (!isObj(card.for)) fail(w4, "for must be an object");
    else {
      denyExtras(w4, card.for, ["durationUs"]);
      if (typeof card.for.durationUs !== "string" || !BIGINT_STR_RE.test(card.for.durationUs) || BigInt(card.for.durationUs) <= 0n)
        fail(w4, "FOR durationUs must be a positive bigint of µs (decimal string)"); // grammar.ts:244-248
    }
  }
  if (Array.isArray(card.then)) {
    card.then.forEach((a, i) => checkDeckAction(a, `${where}.then[${i}]`));
    if (card.then.length > 0 && card.then.every((a) => isObj(a) && !RULE_MAPPED_CARRIERS.has(a.id)))
      warn(`${where}.then`, `[${card.then.map((a) => a.id).join(", ")}] cannot execute through the door (outside the six RULE_CARRIER_MAP verbs — the bought-verb wall, intent-door.ts:795-799); confirm authored as wall-content`);
  }
  if (Array.isArray(card.unless)) card.unless.forEach((p, i) => checkDeckPredicate(p, `${where}.unless[${i}]`));
  if (card.else !== undefined) {
    const wE = `${where}.else`;
    if (!isObj(card.else)) fail(wE, "else must be an object");
    else {
      denyExtras(wE, card.else, ["to", "ref"]);
      if (!POLICY_ELSE_TARGETS.includes(card.else.to)) fail(wE, `ELSE target "${card.else.to}" is not band|role|runbook`); // grammar.ts:253-255
      if (!isStr(card.else.ref)) fail(wE, "ELSE ref must be a non-empty string"); // grammar.ts:256-258
      else if (card.else.to === "band" && !POLICY_BANDS.includes(card.else.ref)) fail(wE, `ELSE band "${card.else.ref}" is not inform|consult|execute`); // grammar.ts:259-261
    }
  }
  if (typeof card.upkeepMicroUsd === "string" && !NON_NEG_BIGINT_STR_RE.test(card.upkeepMicroUsd))
    fail(`${where}.upkeepMicroUsd`, "upkeepMicroUsd must be a non-negative bigint of µ$ (decimal string)"); // grammar.ts:266-268
};

// §9.11 over EVERY deck string — ids, refs, names, runbook names, cites alike.
const scanDeckStrings = (node, where) => {
  if (typeof node === "string") {
    for (const [re, what] of TECHNIQUE_BANS) { const hit = node.match(re); if (hit) fail(where, `§9.11 technique ban-list: contains ${what} ('${hit[0]}')`); }
    return;
  }
  if (Array.isArray(node)) { node.forEach((el, i) => scanDeckStrings(el, `${where}[${i}]`)); return; }
  if (isObj(node)) for (const [k, v] of Object.entries(node)) scanDeckStrings(v, `${where}.${k}`);
};

const deckFirstSeen = new Map(); // card id -> rel of first deck shipping it (cross-deck dup = WARN)
for (const rel of decksRel) {
  const deck = readJson(rel);
  if (!deck) continue;
  validateAgainst(deckSchema, deck, rel);
  if (deck.schemaVersion !== 1) fail(rel, `schemaVersion ${JSON.stringify(deck.schemaVersion)} — the deck file version space has exactly one member: 1 (interpreter polices string enums only; hand wall)`);
  denyExtras(rel, deck, DECK_KEYS);
  // null=>_todo discipline on the HOUSE objects only — scope.ref/runbookName/value
  // nulls are STRUCTURAL grammar (types.ts:721-746), never never-invent placeholders.
  if (isObj(deck._provenance)) scanNulls(deck._provenance, `${rel}._provenance`, deckTodos);
  if (typeof deck._todo === "string" && deck._todo.trim()) deckTodos.push([rel, deck._todo]);
  if (isStr(deck.appliesTo) && !(bundleIds.has(deck.appliesTo) || /^core:[a-z0-9][a-z0-9-]*$/.test(deck.appliesTo)))
    fail(`${rel}.appliesTo`, `'${deck.appliesTo}' resolves to no shipped bundle id and is not reserved core:* (honest law: v0 decks have no bundle claimant — no reverse orphan law is invented)`);
  scanDeckStrings(deck, rel);
  const seenIds = new Set();
  (Array.isArray(deck.cards) ? deck.cards : []).forEach((card, i) => {
    const w = `${rel}.cards[${i}](${card?.id ?? "???"})`;
    checkDeckCard(card, w, seenIds);
    if (isStr(card?.id)) {
      const first = deckFirstSeen.get(card.id);
      if (first !== undefined && first !== rel) warn(w, `card id '${card.id}' also ships in ${first} — duplicate across co-shipped decks (hosts keying lookup by id must adjudicate)`);
      else if (first === undefined) deckFirstSeen.set(card.id, rel);
    }
  });
}

// ---------- report ----------
console.log(`checked: ${[schemaRel, threatRegistrySchemaRel, visitorRegistrySchemaRel, packSchemaRel, paletteSchemaRel, deckSchemaRel, "threats/registry-core.json", "visitors/archetypes-core.json", ...bundlesRel, ...wavesRel, ...palettesRel, ...packsClaimed, ...decksRel].length} files`);
console.log(`bundles=${bundlesRel.length} threats=${threatIds.size} archetypes=${archetypeIds.size} palettes=${paletteArchetypes.size} waves=${wavesRel.length} packs=${parsedPacks.length} decks=${decksRel.length}`);
for (const { rel, pack } of parsedPacks) {
  const d = Object.keys(pack.decision ?? {}).length;
  const f = Object.keys(pack.flavour ?? {}).length;
  const ownerRel = bundles.find(({ b }) => b.ticketPack === `file:${rel}`)?.rel;
  const pinned = ownerRel ? (bundleKeyRefs.get(ownerRel)?.size ?? 0) : 0;
  console.log(`pack ${rel}: templates=${d + f} decision=${d} flavour=${f} slots=${Object.keys(pack.slots ?? {}).length} pinned-by-bundle=${pinned}`);
}
console.log(`README §Key literals: ${readmeRows} rows verbatim-synced against pack decision namespaces`);
console.log(`visual-coverage (§8.18): threats=${threatsVisual}/${threatsVisualTotal} archetypes=${archetypesVisual}/${archetypesVisualTotal} palette-archetypes=${paletteArchVisual}/${paletteArchVisualTotal} codexOnly-tags=${codexOnlyTags} · lookalike seeds (§2.4/OD-18): tagged=${threatLookalikes.size} bundles-covered=${bundlesWithLookalikeSeed}/${bundlesRel.length}`);
if (warnings.length) { console.log(`\nWARNINGS (${warnings.length}):`); warnings.forEach((x) => console.log(`  ~ ${x}`)); }
if (todos.length) {
  console.log(`\nTODO INVENTORY (${todos.length} _todo markers — loader-lint fodder):`);
  todos.forEach(([where, note]) => console.log(`  * ${where}\n      ${note}`));
}
if (packTodos.length) {
  console.log(`\nPACK TODO INVENTORY (${packTodos.length} _todo markers — separate counter; bundle inventory above is untouched):`);
  packTodos.forEach(([where, note]) => console.log(`  # ${where}\n      ${note}`));
}
if (deckTodos.length) {
  console.log(`\nDECK TODO INVENTORY (${deckTodos.length} _todo markers — separate counter; bundle inventory above is untouched):`);
  deckTodos.forEach(([where, note]) => console.log(`  $ ${where}\n      ${note}`));
}
if (errors.length) {
  console.error(`\nFAIL — ${errors.length} error(s):`);
  errors.forEach((x) => console.error(`  x ${x}`));
  process.exit(1);
}
console.log("\nPASS — packages/content is structurally green.");
