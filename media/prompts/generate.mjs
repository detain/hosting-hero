#!/usr/bin/env node
/**
 * generate.mjs — batch image/video generation driver for the hosting-hero
 * prompt library (media/prompts/) against an SGLang Diffusion OpenAI-compatible
 * server (default host: skynet2.interserver.net).
 *
 * Zero npm dependencies. Requires Node >= 20 (global fetch, ESM).
 *
 * ---------------------------------------------------------------------------
 * TWO PROMPT SOURCES (owner directive 2026-10-07 v3 — source split by kind)
 * ---------------------------------------------------------------------------
 *   IMAGE groups (flux1/flux2/sd35/qwenvl) parse ONLY the category .md dirs:
 *   media/prompts/<category>/… (RECURSIVE walk, any depth; category =
 *   top-level dir). Categories are discovered dynamically (spec listed
 *   world,identity,signal,fx,docs-hero,promo; disk also carries branding/
 *   = same format — included, per "parse the directory, don't trust the
 *   catalog"). README.md / _TEMPLATE.md / CATALOG.json are skipped on
 *   purpose, and the videos/ subtree is EXCLUDED from the image walk —
 *   video prompts come from the manifest below, never from markdown.
 *   Image census (re-verified 2026-10-07): 47 files → 189 valid variation
 *   blocks, all complete, zero warnings.
 *
 *   A markdown block = heading `### V<n> — <title>` (em-dash U+2014, plain
 *   hyphen tolerated) followed by one fenced ``` code block with
 *   soft-wrapped fields: POSITIVE: / NEGATIVE: / size: / aspect: / style: /
 *   background: / variations:. Continuation lines join the current field
 *   until the next known key. `generate N` inside variations yields suggestedN.
 *
 *   VIDEO groups (ltxvideo/ltx25/wan22) load media/prompts/videos/manifest.json
 *   INSTEAD of markdown (the owner's canonical feed: "Every variation block
 *   mirrored 1:1 as JSON — feed your generation script from here"). 120
 *   entries × 2 tracks (model.ltx + model.wan, all 120 carry both — parity:
 *   python3 videos/check_parity.py). Each entry ships prompt/negative/
 *   resolution/fps/duration_s/aspect/camera/motion_strength/cfg/steps_hint
 *   per track plus picker metadata (shot, variation_name, loopable,
 *   text_zones, seed_hint, optional i2v_note). Track selection:
 *       wan22 → model.wan · ltxvideo → model.ltx · ltx25 → model.ltx
 *   (ltx25 rides the same LTX dialect family — per videos/README.md the
 *   8n+1 frame law and shot-list prompting carry across LTX 0.9.x/2.5;
 *   force either dialect anywhere with --track ltx|wan for A/B servers).
 *   Manifest laws honored (from videos/README.md + MODELS.json):
 *   - seed: --seed flag > manifest seed_hint (fixed seed per variation is
 *     the stated reproducibility contract).
 *   - frames: num_frames = duration_s×fps rounded to nearest LEGAL count
 *     (LTX 8n+1 @25fps, Wan 4n+1 @24fps). --video-seconds re-derives frames
 *     for every manifest task; --video-fps overrides the track fps.
 *   - resolution: used AS-GIVEN (already model-legal: LTX ÷32, Wan ÷16);
 *     image size-snapping/bucketing is BYPASSED for manifest tasks, with a
 *     divisibility guard that warns + snaps if a future entry violates it.
 *   - cfg: leading float parsed ("3.0 (official range…)" → 3.0) → sent as
 *     guidance_scale (a real /v1/videos field — schema verified). --guidance
 *     overrides. steps_hint is ADVISORY: nothing parsed from it; --steps
 *     when given, else omitted; the string rides the sidecar verbatim.
 *   - negatives: BOTH tracks honor negative_prompt, so manifest tasks always
 *     send the track's `negative` in --negative-mode field (default)
 *     regardless of group.supportsNegative. Caveat from the README: on
 *     distilled 4–8-step CFG=1 setups the negative is IGNORED server-side —
 *     bans are baked into the positives anyway.
 *   - n: one request per manifest entry by default; --auto-n is a documented
 *     NO-OP for manifest tasks (entries carry no "generate N" suggestion) —
 *     use --n <k> for k same-prompt samples (video: k separate jobs).
 *   - i2v_note entries print [i2v-recommended] in the queue listing but are
 *     still generated as t2v fallbacks (the blocks exist for that).
 *   - outputs: <out>/<group>/videos/<concept>/<id>-<track>[-i<k>].mp4 +
 *     sidecar .json (entry + payload + timing) + manifest.jsonl rows.
 *
 * ---------------------------------------------------------------------------
 * SGLANG DIFFUSION API (schemas read from sglang main branch, 2026-10-07:
 * python/sglang/multimodal_gen/runtime/entrypoints/openai/*.py and
 * docs.sglang.io/docs/sglang-diffusion/api/openai_api.md)
 * ---------------------------------------------------------------------------
 *   IMAGES  POST /v1/images/generations  — SYNCHRONOUS.
 *     Request: {model, prompt, size:"WxH", n, response_format:"b64_json",
 *               negative_prompt?, seed?, num_inference_steps?,
 *               guidance_scale?}  (extra top-level keys are tolerated).
 *     Response: {id, created, data:[{b64_json?|url?}], inference_time_s?}.
 *     With response_format:"url" the url is relative (/v1/images/<id>/content)
 *     — this client requests b64_json and also handles url fallback.
 *
 *   VIDEOS  POST /v1/videos  — ASYNC JOB.
 *     Request: {model, prompt, size, seconds:int, fps?, num_frames?,
 *               n, negative_prompt?, seed?, num_inference_steps?,
 *               guidance_scale?}. Server uses num_frames when set, else
 *               computes fps*seconds — manifest tasks always send
 *               num_frames + fps (the 8n+1/4n+1 frame laws), legacy tasks
 *               send seconds.
 *     Response: VideoResponse {id, status:"queued"|..., progress, url?,
 *               file_paths?, error?}.
 *     Poll GET /v1/videos/{id} until status "completed"/"failed", then
 *     download GET /v1/videos/{id}/content (binary mp4). If the completed
 *     job carries a cloud `url` instead, that URL is downloaded directly.
 *     n>1 for videos is split into n separate single-output jobs (seed+i
 *     when --seed is given) — simpler, per-job error isolation.
 *
 *   TRANSPORT / MODEL-ID RESOLUTION (owner directive 2026-10-07 v2):
 *     DEFAULT origin is  http://skynet2.interserver.net:30001  — plain HTTP
 *     on port 30001, treated as the SINGLE-MODEL proxy entry: it fronts
 *     whichever ONE model is loaded. The group flag still decides request
 *     SHAPE (image vs video endpoint, negative_prompt support, size
 *     buckets, fps). The owner chose 30001 deliberately — NOTE the
 *     launcher truth below binds 30001 to the FLUX.2-dev script, so unless
 *     a proxy is repointed there, hitting the default with a different
 *     group means the auto-adopt below renames the payload id to whatever
 *     IS served while the shape stays whatever --model selected.
 *     Payload model-id precedence:
 *       --served-model <id>  >  single-model auto-adopt (when /v1/models
 *       at the default origin reports exactly ONE entry, that id is
 *       adopted into the payload)  >  the group's default id.
 *     URL precedence: --base-url > --port (=> http://<host>:<port> on the
 *     default host) > the http://…:30001 default.
 *     Other origins keep their prior policies: an https-on-443 SHARED
 *     multi-model proxy probe is informational-only (mismatch = warning,
 *     never adopt); LEGACY direct endpoints auto-adopt only a single
 *     diffusion-MARKED entry (plain-LLM listings are refused).
 *     Reference port map — verified against the seven
 *     /root/run_sglang_images_*-1.sh launchers (read-only cat,
 *     2026-10-07); matches the owner's stated map one-for-one:
 *       flux1dev              30000  black-forest-labs/FLUX.1-dev   image, no negatives
 *       flux2dev              30001  black-forest-labs/FLUX.2-dev   image, no negatives
 *       stablediffusion35large 30002 stabilityai/stable-diffusion-3.5-large  image, negatives ok
 *       qwenimage             30003  Qwen/Qwen-Image                image, negatives ok
 *       ltx25                 30004  Lightricks/LTX-2.5             video
 *       wan22                 30005  Wan-AI/Wan2.2-T2V-A14B-Diffusers video, negatives ok
 *       ltxvideo              30006  Lightricks/LTX-Video           video
 *     All seven pin CUDA_VISIBLE_DEVICES=0,1 --num-gpus 2 → they cannot
 *     coexist; exactly one model is up at a time (use sweep-models.sh).
 *
 *   GROUP DEFAULTS are the served ids above (SGLang serves the --model-path
 *   string as the id; one nuance: flux2's extra --transformer-path
 *   lmsys/flux2-dev-modelopt-nvfp4-sglang-transformer does not change the
 *   served id; ltx25 has NO "-Diffusers" suffix, wan22 does).
 *
 * ---------------------------------------------------------------------------
 * LIVE PROBES (read-only, from the build machine, 2026-10-07)
 * ---------------------------------------------------------------------------
 *   http://skynet2.interserver.net:30001/v1/models  →  connection REFUSED
 *               (curl -m 8, read-only, 2026-10-07 — the only probe taken
 *               after the default moved to :30001). Nothing is bound there
 *               from this vantage yet; once the owner's proxy/model answers
 *               there, the single-model auto-adopt engages.
 *   https://skynet2.interserver.net/v1/models  →  HTTP 200, exactly ONE
 *               entry: id "Qwen/Qwen3.8-Flash-Next-FP8" (max_model_len
 *               1000000, owned_by "sglang", NO diffusion markers). This is
 *               the single "IDF" deployment currently up on the 443 proxy —
 *               a DIFFERENT model than any group default; that origin keeps
 *               the informational-only (never-adopt) policy.
 *   :30000 (legacy http)  →  same plain-LLM entry; direct-mode adoption
 *               refuses it (no diffusion markers).
 *   :30002 … :30006  →  connection refused from the build machine.
 *   No diffusion model was running at probe time; generation requests
 *   naming a model the endpoint does not serve fail with the server's own
 *   message.
 *
 * ---------------------------------------------------------------------------
 * USAGE EXAMPLES (default origin http://skynet2.interserver.net:30001 — no
 * URL flags needed for the owner's standard single-model entry point)
 * ---------------------------------------------------------------------------
 *   node generate.mjs --list
 *   node generate.mjs --model qwenvl --filter id=rack-elevations-front-V1    # smoke: one image
 *   node generate.mjs --model flux1 --auto-n --parallel 2                    # full image run, zero URL flags
 *   node generate.mjs --model flux1 --port 30000 --filter id=title-screens-V1  # legacy direct launcher port
 *   node generate.mjs --model wan22 --filter id=gl-1-v1                     # video smoke: one manifest entry (wan track)
 *   node generate.mjs --model ltxvideo --filter concept=title-teasers        # i2v-flagged teasers as t2v fallbacks
 *   node generate.mjs --model ltx25 --track ltx --filter concept=gameplay-loop  # force a dialect on another server
 *   node generate.mjs --model sd35 --dry-run --filter category=world
 *   node generate.mjs --model flux1 --negative-mode append --filter id=rack-elevations-front-V1
 *   # single-model proxy currently fronts only the IDF deployment:
 *   node generate.mjs --model qwenvl --served-model Qwen/Qwen3.8-Flash-Next-FP8 --dry-run --filter id=rack-elevations-front-V1
 *   SKYNET_API_KEY=*** node generate.mjs --model qwenvl --seed 1234
 */

import { promises as fs } from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Model groups
// ---------------------------------------------------------------------------

// Default origin (owner directive 2026-10-07 v2): plain HTTP on port 30001 —
// the single-model entry point fronting whichever one model is loaded.
// GROUPS[*].port below is REFERENCE-ONLY documentation of which launcher
// binds which port; it never overrides this default.
const HOST = "skynet2.interserver.net";
const DEFAULT_PORT = 30001;
const DEFAULT_BASE_URL = `http://${HOST}:${DEFAULT_PORT}`;

/**
 * supportsNegative: true when the served pipeline honors negative_prompt
 * (FLUX guidance-distilled pipelines do not — positives embed the bans).
 * maxPixels: pre-scale ceiling. defaults: images ~2MP, video 1280x720.
 * port: REFERENCE ONLY (which launcher script binds which port on the host).
 * The default transport ignores it — see DEFAULT_BASE_URL above.
 */
const GROUPS = {
  flux1: {
    kind: "image", port: 30000,
    model: "black-forest-labs/FLUX.1-dev",
    supportsNegative: false, maxPixels: 2_097_152,
  },
  flux2: {
    kind: "image", port: 30001,
    model: "black-forest-labs/FLUX.2-dev",
    supportsNegative: false, maxPixels: 2_097_152,
  },
  sd35: {
    kind: "image", port: 30002,
    model: "stabilityai/stable-diffusion-3.5-large",
    supportsNegative: true, maxPixels: 2_097_152,
  },
  qwenvl: {
    kind: "image", port: 30003,
    model: "Qwen/Qwen-Image",
    supportsNegative: true, maxPixels: 2_097_152,
  },
  ltx25: {
    kind: "video", port: 30004,
    model: "Lightricks/LTX-2.5", // launcher-verified: run_sglang_images_ltx25-1.sh --model-path (docs' "-Diffusers" suffix is NOT what is served)
    supportsNegative: false, maxPixels: 1_280 * 720, defaultFps: 24,
  },
  wan22: {
    kind: "video", port: 30005,
    model: "Wan-AI/Wan2.2-T2V-A14B-Diffusers", // launcher-verified exact model-path string
    supportsNegative: true, maxPixels: 1_280 * 720, defaultFps: 24,
  },
  ltxvideo: {
    kind: "video", port: 30006,
    model: "Lightricks/LTX-Video",
    supportsNegative: false, maxPixels: 1_280 * 720, defaultFps: 25,
  },
};
const GROUP_ALIASES = { qwen: "qwenvl" };

// The videos/ subtree is the MANIFEST source (canonical video feed); it is
// excluded from the image markdown walk (owner directive 2026-10-07 v3).
const VIDEO_SOURCE_DIR = "videos";
const MANIFEST_FILE = "manifest.json";

// Per-track generation laws from videos/README.md + MODELS.json:
// frame counts snap to (frameStep)n+1; resolutions must be divisible by
// `divisor` (LTX:32, Wan:16); `fps` is the library default for the dialect.
const TRACKS = {
  ltx: { frameStep: 8, divisor: 32, fps: 25 },
  wan: { frameStep: 4, divisor: 16, fps: 24 },
};

// Which dialect each video group speaks by default (ltx25 shares the LTX
// family: 8n+1 frames + shot-list prompting per the README). Overridable
// with --track ltx|wan.
const GROUP_TRACK = { ltxvideo: "ltx", ltx25: "ltx", wan22: "wan" };

// Standard video buckets (aspect ratio → size). Portrait aspects mirror.
// Legacy markdown video path only — manifest tasks ship exact resolutions.
const VIDEO_BUCKETS = [
  { ar: 16 / 9, w: 1280, h: 720 },
  { ar: 2 / 1, w: 1408, h: 704 },
  { ar: 4 / 3, w: 1024, h: 768 },
  { ar: 3 / 2, w: 1024, h: 682 }, // snapped to /16 downstream → 1024x672
  { ar: 1, w: 768, h: 768 },
];

// ---------------------------------------------------------------------------
// Prompt-library parser
// ---------------------------------------------------------------------------

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_SKIPLIST = new Set(["README.md", "_TEMPLATE.md", "CATALOG.json"]);

// V-headings: `### V12 — title`, and letter-suffixed variants `### V1-A — title`
// (found in branding/game-logos.md). Em-dash U+2014 required by spec, plain
// hyphen tolerated.
const HEADING_RE = /^###\s+V(\d+)(-[A-Za-z])?\s+[—-]\s+(.*)$/;
const NEAR_MISS_RE = /^###\s+V\S*\s/;
const FIELD_KEYS = ["POSITIVE", "NEGATIVE", "size", "aspect", "style", "background", "variations"];
const SIZE_RE = /^(\d+)\s*[xX]\s*(\d+)$/;

/** Collapse a list of lines into one whitespace-normalized string. */
function joinLines(lines) {
  return lines.join(" ").replace(/\s+/g, " ").trim();
}

/** Which known field key (if any) starts this line? Returns null otherwise. */
function fieldKeyOf(line) {
  for (const key of FIELD_KEYS) {
    if (line.startsWith(`${key}:`)) return key;
  }
  return null;
}

/**
 * Parse one fenced variation body into {fields}. Pure; throws nothing —
 * callers validate.
 */
function parseFenceBody(bodyLines) {
  const fields = {};
  let current = null;
  for (const raw of bodyLines) {
    const line = raw.trimEnd();
    const key = fieldKeyOf(line);
    if (key) {
      current = key;
      fields[key] = [line.slice(key.length + 1).trim()];
      continue;
    }
    if (current) fields[current].push(line.trim());
  }
  const out = {};
  for (const [k, parts] of Object.entries(fields)) out[k] = joinLines(parts);
  return out;
}

/**
 * Parse one .md file into {blocks, warnings}.
 * blocks: [{category,fileStem,id,variantNum,title,positive,negative,
 *           size{w,h},aspect,style,background,suggestedN}]
 */
function parseMarkdownFile(text, category, fileStem) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  const warnings = [];

  for (let i = 0; i < lines.length; i++) {
    const m = HEADING_RE.exec(lines[i]);
    if (!m) {
      if (NEAR_MISS_RE.test(lines[i])) {
        warnings.push(`${fileStem}: heading not in "### V<n>[ -tag] — title" form, skipped: "${lines[i]}"`);
      }
      continue;
    }
    const variantNum = Number(m[1]);
    const variantTag = m[2] ? m[2].slice(1) : null; // "A" for V1-A
    const title = m[3].trim();
    const id = `${fileStem}-V${variantNum}${m[2] ?? ""}`;

    // Find the first fenced block before the next heading.
    let j = i + 1;
    let open = -1;
    while (j < lines.length && !/^###\s/.test(lines[j])) {
      if (/^\s*```/.test(lines[j])) { open = j; break; }
      j++;
    }
    if (open === -1) {
      warnings.push(`${id}: heading found but no fenced code block before next heading — skipped`);
      continue;
    }
    let k = open + 1;
    const body = [];
    let closed = false;
    while (k < lines.length) {
      if (/^\s*```/.test(lines[k])) { closed = true; break; }
      body.push(lines[k]);
      k++;
    }
    if (!closed) {
      warnings.push(`${id}: unterminated fenced block — skipped`);
      continue;
    }

    const f = parseFenceBody(body);
    const missing = ["POSITIVE", "NEGATIVE", "size"].filter((key) => !f[key]);
    if (missing.length) {
      warnings.push(`${id}: missing required field(s) ${missing.join(", ")} — skipped`);
      continue;
    }
    const sm = SIZE_RE.exec(f.size);
    if (!sm) {
      warnings.push(`${id}: size "${f.size}" is not WxH — skipped`);
      continue;
    }

    const gen = /generate\s+(\d+)/i.exec(f.variations ?? "");
    blocks.push({
      category,
      fileStem,
      id,
      variantNum,
      variantTag,
      title,
      positive: f.POSITIVE,
      negative: f.NEGATIVE,
      size: { w: Number(sm[1]), h: Number(sm[2]) },
      aspect: f.aspect ?? null,
      style: f.style ?? null,
      background: f.background ?? null,
      suggestedN: gen ? Number(gen[1]) : null,
    });
  }
  return { blocks, warnings };
}

/** Collect *.md paths under dir recursively (skips hidden dirs and root-skip names). */
async function collectMdFiles(dir) {
  const found = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) found.push(...await collectMdFiles(full));
    else if (e.name.endsWith(".md") && !ROOT_SKIPLIST.has(e.name)) found.push(full);
  }
  return found;
}

/**
 * Parse the whole IMAGE library. Categories are discovered dynamically:
 * every subdirectory of promptsDir that contains .md files AT ANY DEPTH
 * (branding/ included — "parse the directory, don't trust the catalog"),
 * EXCEPT the videos/ subtree: video prompts come from videos/manifest.json
 * (see loadVideoTasks), never from markdown, so the draft-schema
 * concepts/*.md files cannot leak into image runs. Category = top-level dir.
 * Returns {blocks, warnings, filesParsed, categories}.
 */
async function loadLibrary(promptsDir) {
  const blocks = [];
  const warnings = [];
  let filesParsed = 0;

  let dirents;
  try {
    dirents = await fs.readdir(promptsDir, { withFileTypes: true });
  } catch (err) {
    warnings.push(`prompts dir "${promptsDir}" unreadable: ${err.message}`);
    return { blocks, warnings, filesParsed, categories: [] };
  }
  const categories = [];
  for (const d of dirents) {
    if (!d.isDirectory()) continue;
    if (d.name === VIDEO_SOURCE_DIR || d.name.startsWith(".")) continue;
    categories.push(d.name);
  }
  categories.sort();
  if (!categories.length) warnings.push(`no category subdirectories under ${promptsDir}`);

  for (const category of categories) {
    const mdPaths = await collectMdFiles(path.join(promptsDir, category));
    if (!mdPaths.length) {
      warnings.push(`category dir "${category}" has no .md files — skipped`);
      continue;
    }
    mdPaths.sort();
    for (const full of mdPaths) {
      const fileStem = path.basename(full).replace(/\.md$/, "");
      const text = await fs.readFile(full, "utf8");
      const parsed = parseMarkdownFile(text, category, fileStem);
      filesParsed++;
      blocks.push(...parsed.blocks);
      warnings.push(...parsed.warnings);
    }
  }
  return { blocks, warnings, filesParsed, categories };
}

// ---------------------------------------------------------------------------
// Video manifest loader (videos/manifest.json — canonical feed for video groups)
// ---------------------------------------------------------------------------

/** Leading float of a cfg string/number: "3.0 (official range …)" → 3.0; null if none. */
function parseCfgLeadingFloat(cfg) {
  if (typeof cfg === "number") return Number.isFinite(cfg) ? cfg : null;
  if (typeof cfg !== "string") return null;
  const m = /^\s*(\d+(?:\.\d+)?)/.exec(cfg);
  return m ? Number(m[1]) : null;
}

/** Nearest legal frame count of the form k*step+1 (k>=1) to `target`. */
function snapFrames(target, step) {
  const k = Math.max(1, Math.round((target - 1) / step));
  return k * step + 1;
}

/**
 * Validate a manifest resolution against the track divisor (LTX %32, Wan %16).
 * Violations warn + snap to the nearest legal multiple (fail-soft guard for
 * future manifest entries; today's 120×2 are all clean).
 */
function validateTrackSize(w, h, divisor, label, warnings) {
  const fix = (n) => {
    const snapped = Math.max(divisor, Math.round(n / divisor) * divisor);
    return snapped === n ? n : snapped;
  };
  const sw = fix(w);
  const sh = fix(h);
  if (sw !== w || sh !== h) {
    warnings.push(`${label}: resolution ${w}x${h} not divisible by ${divisor} — snapped to ${sw}x${sh}`);
  }
  return { w: sw, h: sh };
}

/**
 * Inventory the manifest (structural probe, no track expansion).
 * Returns {entries, problems[]}; entries stays [] on unreadable/invalid JSON.
 */
async function loadVideoManifest(promptsDir) {
  const file = path.join(promptsDir, VIDEO_SOURCE_DIR, MANIFEST_FILE);
  let raw;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch (err) {
    return { entries: [], problems: [`video manifest "${file}" unreadable: ${err.message}`] };
  }
  let entries;
  try {
    entries = JSON.parse(raw);
  } catch (err) {
    return { entries: [], problems: [`video manifest "${file}" is not valid JSON: ${err.message}`] };
  }
  if (!Array.isArray(entries)) {
    return { entries: [], problems: [`video manifest "${file}" top level is not an array`] };
  }
  const problems = [];
  for (const e of entries) {
    if (!e || typeof e.id !== "string") { problems.push("manifest entry without string id"); continue; }
    for (const t of Object.keys(TRACKS)) {
      if (!e.model || !e.model[t] || typeof e.model[t].prompt !== "string" || !e.model[t].prompt) {
        problems.push(`${e.id}: missing model.${t}.prompt`);
      }
    }
  }
  return { entries, problems };
}

/**
 * Expand manifest entries into planner-ready blocks for ONE track.
 * Block shape mirrors the markdown parser's output plus manifest metadata,
 * so planTasks/sidecar/summary code stays source-agnostic.
 */
async function loadVideoTasks(promptsDir, track, opts) {
  const law = TRACKS[track];
  const { entries, problems } = await loadVideoManifest(promptsDir);
  const warnings = problems.slice();
  const blocks = [];
  for (const e of entries) {
    if (!e || typeof e.id !== "string") continue;
    const t = e.model?.[track];
    if (!t || typeof t.prompt !== "string" || !t.prompt) continue; // already warned

    const label = `${e.id}/${track}`;
    const rm = SIZE_RE.exec(String(t.resolution ?? "").trim());
    if (!rm) { warnings.push(`${label}: resolution "${t.resolution}" is not WxH — entry skipped`); continue; }
    const size = validateTrackSize(Number(rm[1]), Number(rm[2]), law.divisor, label, warnings);

    const fps = Number.isFinite(t.fps) && t.fps > 0 ? t.fps : law.fps;
    const durationS = Number.isFinite(t.duration_s) && t.duration_s > 0 ? t.duration_s : 5;
    const effSeconds = opts.videoSeconds ?? durationS; // --video-seconds overrides every manifest task
    const effFps = opts.videoFps ?? fps;               // --video-fps overrides the track fps
    const numFrames = snapFrames(effSeconds * effFps, law.frameStep);

    blocks.push({
      source: "manifest",
      track,
      category: VIDEO_SOURCE_DIR,
      concept: e.concept ?? path.basename(String(e.file ?? "")).replace(/\.md$/, "") ?? "misc",
      fileStem: e.concept ?? "misc",
      id: e.id,
      variantNum: e.variation ?? 1,
      variantTag: null,
      title: `${e.shot ?? ""} — ${e.variation_name ?? ""}`.trim().replace(/^—\s*|\s*—$/g, ""),
      positive: t.prompt,
      negative: typeof t.negative === "string" ? t.negative : "",
      size,
      aspect: t.aspect ?? null,
      style: null,
      background: null,
      suggestedN: null, // --auto-n is a documented no-op for manifest tasks
      // manifest-specific payload + picker metadata:
      durationS,
      effSeconds,
      fps: effFps,
      numFrames,
      cfgRaw: t.cfg ?? null,
      guidance: parseCfgLeadingFloat(t.cfg),
      stepsHint: t.steps_hint ?? null,
      motionStrength: t.motion_strength ?? null,
      camera: t.camera ?? e.camera ?? null,
      loopable: e.loopable ?? null,
      textZones: e.text_zones ?? null,
      shot: e.shot ?? null,
      variationName: e.variation_name ?? null,
      seedHint: Number.isInteger(e.seed_hint) ? e.seed_hint : null,
      i2vNote: typeof e.i2v_note === "string" && e.i2v_note ? e.i2v_note : null,
    });
  }
  return { blocks, warnings, entriesParsed: entries.length };
}

// ---------------------------------------------------------------------------
// Size handling
// ---------------------------------------------------------------------------

/** Floor to multiple of 16, minimum 256. */
function snap16(n) {
  return Math.max(256, Math.floor(n / 16) * 16);
}

function parseAspectRatio(aspect) {
  if (!aspect) return null;
  const m = /^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/.exec(aspect.trim());
  if (!m) return null;
  const num = Number(m[1]);
  const den = Number(m[2]);
  if (!num || !den) return null;
  return num / den;
}

/** Bucket the aspect to the nearest standard video size (landscape or mirrored portrait). */
function videoBucketSize(aspect) {
  const ar = parseAspectRatio(aspect);
  if (!ar) return null;
  const portrait = ar < 1;
  const probe = portrait ? 1 / ar : ar;
  let best = VIDEO_BUCKETS[0];
  for (const b of VIDEO_BUCKETS) {
    if (Math.abs(b.ar - probe) < Math.abs(best.ar - probe)) best = b;
  }
  return portrait ? { w: best.h, h: best.w } : { w: best.w, h: best.h };
}

// ---------------------------------------------------------------------------
// Wan2.2 trained-size buckets (feature 2026-10-08)
//
// Wan2.2 is trained on exactly four resolutions — the server logs
// "Unsupported resolution: 1216x704 ... Supported: 1280x720, 720x1280,
// 832x480, 480x832" for anything else. We snap the (already ÷16-validated,
// at load, against the REQUESTED size) wan-track resolution to the nearest
// trained bucket so every payload is bucket-native. LTX paths are NOT
// touched — that server honors its ÷32 sizes fine.
//
// Deterministic nearest-neighbor rule:
//   1. Orientation first: W/H >= 1.0 → landscape pair {1280x720, 832x480};
//      < 1.0 → portrait {720x1280, 480x832}. Square (ratio exactly 1.0)
//      takes the landscape side.
//   2. Within the pair, pick by log-aspect distance |ln(req) − ln(bucket)|.
//   3. If the two distances are within WAN_SNAP_TIE_EPS of each other,
//      pixel AREA decides (smaller |ln(area_req/area_bucket)| wins). The
//      epsilon is deliberate: it pulls 1216x704 (99 of the 120 live wan
//      manifest entries; aspect 1.727 — only 0.025 log-aspect from BOTH
//      landscape buckets) to HD 1280x720 instead of the aspect-marginally-
//      closer 832x480, and lands square 1024x1024 on 1280x720 (area 0.129
//      vs 0.964) — quality-first, owner call, PINNED by test. 512x512 by
//      the same area law falls to 832x480 (0.420 vs 1.253). Exact ties
//      resolve to the HD bucket (pair order).
// Opt out entirely with --no-wan-snap (verbatim PASS-THROUGH of the sent
// size, restored pre-feature behavior).
// ---------------------------------------------------------------------------
const WAN_BUCKETS = Object.freeze([
  { label: "1280x720", w: 1280, h: 720 },
  { label: "720x1280", w: 720, h: 1280 },
  { label: "832x480", w: 832, h: 480 },
  { label: "480x832", w: 480, h: 832 },
]);
const WAN_SNAP_TIE_EPS = 0.05;

/** Nearest trained wan bucket for a size. Pure; returns a WAN_BUCKETS entry. */
function snapToWanBucket(w, h) {
  const landscape = w / h >= 1;
  const pair = landscape ? [WAN_BUCKETS[0], WAN_BUCKETS[2]] : [WAN_BUCKETS[1], WAN_BUCKETS[3]];
  const lnReq = Math.log(w / h);
  const dAspect = pair.map((b) => Math.abs(lnReq - Math.log(b.w / b.h)));
  if (Math.abs(dAspect[0] - dAspect[1]) >= WAN_SNAP_TIE_EPS) {
    return dAspect[0] <= dAspect[1] ? pair[0] : pair[1];
  }
  const lnArea = Math.log(w * h);
  const dArea = pair.map((b) => Math.abs(lnArea - Math.log(b.w * b.h)));
  return dArea[0] <= dArea[1] ? pair[0] : pair[1];
}

/**
 * Resolve the wire size from the library size + group limits.
 * Manifest tasks bypass the image bucketing (their resolutions are
 * model-legal as given — validated per track at load); only an explicit
 * --max-pixels trims them. Wan-track manifest tasks then snap to the four
 * trained buckets (see WAN_BUCKETS above).
 * Returns {sent:{w,h}, original:{w,h}, method, size_snapped?}.
 */
function resolveSize(block, group, opts) {
  const original = { ...block.size };
  const maxPixels = opts.maxPixels ?? group.maxPixels;

  if (block.source === "manifest") {
    let result;
    if (opts.maxPixels && original.w * original.h > maxPixels) {
      const scale = Math.sqrt(maxPixels / (original.w * original.h));
      result = {
        sent: { w: snap16(original.w * scale), h: snap16(original.h * scale) },
        original,
        method: "manifest-max-pixels-scale",
      };
    } else {
      result = { sent: { ...original }, original, method: "manifest-resolution" };
    }
    // Wan2.2 bucket snap — applied AFTER validation/scale of the REQUESTED
    // size; on the rare --max-pixels + wan combo the bucket wins and the
    // scale method is superseded (the pair never coexists in practice).
    if (block.track === "wan" && !opts.noWanSnap) {
      const b = snapToWanBucket(result.sent.w, result.sent.h);
      if (b.w !== result.sent.w || b.h !== result.sent.h) {
        result = { sent: { w: b.w, h: b.h }, original, method: `wan-bucket-snap(${b.label})`, size_snapped: true };
      }
    }
    return result;
  }

  let w = Math.floor(original.w / 16) * 16;
  let h = Math.floor(original.h / 16) * 16;
  let method = "snap16";

  if (group.kind === "video" && !opts.maxPixels) {
    const bucket = videoBucketSize(block.aspect);
    if (bucket) {
      w = Math.floor(bucket.w / 16) * 16;
      h = Math.floor(bucket.h / 16) * 16;
      method = `video-bucket(${block.aspect})`;
      return { sent: { w: Math.max(256, w), h: Math.max(256, h) }, original, method };
    }
  }

  if (w * h > maxPixels) {
    const scale = Math.sqrt(maxPixels / (w * h));
    w = Math.floor((w * scale) / 16) * 16;
    h = Math.floor((h * scale) / 16) * 16;
    method = "max-pixels-scale";
  }
  return { sent: { w: Math.max(256, w), h: Math.max(256, h) }, original, method };
}

// ---------------------------------------------------------------------------
// Payload construction
// ---------------------------------------------------------------------------

/** Fold the negative list into the prompt for models with no negative field. */
function appendNegative(prompt, negative) {
  const bans = negative.replace(/\s*,\s*/g, ", ").trim().replace(/[,.\s]+$/, "");
  if (!bans) return prompt;
  return `${prompt}\n\navoid: ${bans}`;
}

/**
 * LTX-Video text-encoder budget (feature 2026-10-08). The LTX-Video server
 * caps prompt tokens at 128 ("max seq length 128" errors on long prompts);
 * the diffusers pipeline honors `max_sequence_length` via diffusers_kwargs.
 * SCOPE GATE: ONLY the ltxvideo group (exact model Lightricks/LTX-Video) —
 * NEVER wan22/wan-track, NEVER ltx25 (different encoder, not verified to
 * accept the kwarg). --ltx-max-seq 0 omits diffusers_kwargs entirely
 * (pre-change wire shape). Merge-not-clobber is defensive: as of 2026-10-08
 * NO code path sets diffusers_kwargs anywhere (grep-verified zero), so the
 * spread only future-proofs the shape.
 */
function attachLtxKwargs(payload, group, opts) {
  if (group.kind === "video" && group.key === "ltxvideo" && opts.ltxMaxSeq > 0) {
    payload.diffusers_kwargs = { ...(payload.diffusers_kwargs ?? {}), max_sequence_length: opts.ltxMaxSeq };
  }
  return payload;
}

/**
 * Build the wire payload for one task.
 * Pure: block + group + opts → {endpoint, payload, perSeed[]}.
 */
function buildPayload(task, group, opts) {
  const { block, size, n, seedBase } = task;
  const perSeed = [];
  for (let i = 0; i < n; i++) perSeed.push(seedBase === null ? null : seedBase + i);

  let prompt = block.positive;
  let negative = null;
  if (opts.negativeMode === "append") {
    prompt = appendNegative(prompt, block.negative);
  } else if (opts.negativeMode === "field" && group.supportsNegative) {
    negative = block.negative;
  } // "drop" (and "field" on non-supporting groups) ignore negatives

  const sizeStr = `${size.sent.w}x${size.sent.h}`;

  if (group.kind === "image") {
    const payload = {
      model: group.model,
      prompt,
      size: sizeStr,
      n,
      response_format: "b64_json",
    };
    if (negative !== null) payload.negative_prompt = negative;
    // SGLang accepts seed as int OR [int] — per-output seeds when --seed given.
    if (perSeed.every((s) => s !== null)) payload.seed = n === 1 ? perSeed[0] : perSeed;
    if (opts.steps !== null) payload.num_inference_steps = opts.steps;
    if (opts.guidance !== null) payload.guidance_scale = opts.guidance;
    return { path: "/v1/images/generations", payload, perSeed };
  }

  // video: caller splits n into separate jobs; this builds ONE job shape.
  // No response_format field on /v1/videos — bytes always arrive via GET /v1/videos/{id}/content.

  if (block.source === "manifest") {
    // Frame-law shape: num_frames + fps replace seconds (server honors
    // num_frames when set — schema verified against video_api.py).
    const payload = {
      model: group.model,
      prompt,
      size: sizeStr,
      num_frames: block.numFrames,
      fps: block.fps,
    };
    if (perSeed[0] !== null) payload.seed = perSeed[0]; // jobs 1..n use seed+i
    // Both manifest tracks honor negative_prompt — always carried in `field`
    // mode regardless of group.supportsNegative (that gate is for the legacy
    // markdown path). `append` folded it into the prompt above; `drop` omits.
    const neg = opts.negativeMode === "field" ? block.negative : null;
    if (neg) payload.negative_prompt = neg;
    const guidance = opts.guidance !== null ? opts.guidance : block.guidance;
    if (guidance !== null && guidance !== undefined) payload.guidance_scale = guidance;
    // steps_hint is ADVISORY (README): never parsed — --steps only.
    if (opts.steps !== null) payload.num_inference_steps = opts.steps;
    return { path: "/v1/videos", payload: attachLtxKwargs(payload, group, opts), perSeed };
  }

  const payload = {
    model: group.model,
    prompt,
    size: sizeStr,
    seconds: opts.videoSeconds ?? 5, // legacy markdown path default
  };
  if (perSeed[0] !== null) payload.seed = perSeed[0]; // jobs 1..n use seed+i
  if (opts.videoFps !== null) payload.fps = opts.videoFps;
  else if (group.defaultFps) payload.fps = group.defaultFps;
  if (negative !== null) payload.negative_prompt = negative;
  if (opts.steps !== null) payload.num_inference_steps = opts.steps;
  if (opts.guidance !== null) payload.guidance_scale = opts.guidance;
  return { path: "/v1/videos", payload: attachLtxKwargs(payload, group, opts), perSeed };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const USAGE = `usage: node generate.mjs [options]

  --model <group>       ${Object.keys(GROUPS).join("|")} (alias qwen=qwenvl). default flux1
                        image groups parse category .md dirs; video groups
                        parse videos/manifest.json (track per group, see --track)
  --list                parse both sources, print counts, exit
  --dry-run             print payload + equivalent curl per task, write nothing
  --filter k=v          repeatable; k in {category,file,id,concept}; v comma-list
                        (concept= matches manifest concepts, e.g. title-teasers;
                         id= matches manifest ids like gl-1-v1)
  --track <ltx|wan>     force a manifest dialect regardless of group (A/B the
                        same track on a different server); video groups only
  --no-wan-snap         wan groups: send the manifest resolution VERBATIM
                        (default: snap to the nearest of the four trained
                        Wan2.2 buckets 1280x720/720x1280/832x480/480x832)
  --ltx-max-seq <N>     ltxvideo group only: diffusers_kwargs
                        max_sequence_length sent to the text encoder
                        (default 256; 0 = omit diffusers_kwargs entirely —
                        pre-fix wire shape). Never applied to wan/ltx25.
  --out <dir>           output dir (default ../output relative to this script)
  --parallel <n>        concurrent requests (default 2)
  --n <n>               outputs per variation block (default 1)
  --auto-n              use the block's suggestedN ("generate N") when set
  --seed <n>            base seed; task i gets seed n+i
  --steps <n>           num_inference_steps
  --guidance <f>        guidance_scale
  --negative-mode <m>   field (default) | append | drop
  --base-url <url>      full endpoint override; wins over --port and the
                        default http://${HOST}:${DEFAULT_PORT}
  --port <n>            use http://${HOST}:<n> on the default host
                        (reference launcher ports: 30000-30006)
  --served-model <id>   payload model id, independent of --model group;
                        always beats single-model auto-adopt
                        (alias --model-id; skips the /v1/models probe)
  --api-key <k>         Bearer token (or env SKYNET_API_KEY)
  --timeout <ms>        per-task wall clock incl. retries/polling (default 600000)
  --retries <n>         retries on 5xx/429/network (default 4, exp backoff)
  --max-pixels <n>      override the group's pixel ceiling
  --video-seconds <s>   video duration; overrides manifest duration_s for
                        every task (legacy markdown default 5)
  --video-fps <n>       video fps; overrides the track fps (ltx 25 / wan 24)
  --force               regenerate even if output files exist
  --prompts-dir <dir>   prompt library dir (default: this script's directory)
  --repair              maintenance pass over --out tree (no network): relabel
                        files whose extension contradicts magic bytes, pair
                        sidecars, plan manifest updates. DRY BY DEFAULT.
  --apply               with --repair: perform renames/deletes/rewrites
  --help                show this help`;

function fail(message) {
  console.error(`error: ${message}\n\n${USAGE}`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = {
    model: "flux1", list: false, dryRun: false, filters: [], out: null,
    parallel: 2, n: 1, autoN: false, seed: null, steps: null, guidance: null,
    negativeMode: "field", baseUrl: null, port: null, modelId: null, track: null,
    apiKey: process.env.SKYNET_API_KEY ?? null, timeout: 12000_000, retries: 4,
    maxPixels: null, videoSeconds: null, videoFps: null, force: false,
    noWanSnap: false, ltxMaxSeq: 256,
    repair: false, apply: false,
    promptsDir: SCRIPT_DIR, help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) fail(`unexpected positional argument "${arg}"`);
    const name = arg.slice(2);
    const takesValue = !["list", "dry-run", "auto-n", "force", "help", "no-wan-snap", "repair", "apply"].includes(name);

    let value = null;
    if (takesValue) {
      const next = argv[i + 1];
      if (next === undefined || (next.startsWith("--") && !/^-?\d/.test(next))) {
        fail(`--${name} requires a value`);
      }
      value = next;
      i++;
    }

    switch (name) {
      case "list": opts.list = true; break;
      case "dry-run": opts.dryRun = true; break;
      case "auto-n": opts.autoN = true; break;
      case "force": opts.force = true; break;
      case "no-wan-snap": opts.noWanSnap = true; break;
      case "ltx-max-seq": {
        const v = Number(value);
        if (!Number.isInteger(v) || v < 0) fail(`--ltx-max-seq needs an integer >= 0 (got "${value}")`);
        opts.ltxMaxSeq = v;
        break;
      }
      case "repair": opts.repair = true; break;
      case "apply": opts.apply = true; break;
      case "help": opts.help = true; break;
      case "filter": {
        const m = /^(category|file|id|concept)=(.*)$/.exec(value);
        if (!m) fail(`--filter expects category=…, file=…, id=… or concept=… (got "${value}")`);
        opts.filters.push({ key: m[1], values: m[2].split(",").map((s) => s.trim()).filter(Boolean) });
        break;
      }
      case "track":
        if (!["ltx", "wan"].includes(value)) fail(`--track must be ltx|wan (got "${value}")`);
        opts.track = value;
        break;
      case "negative-mode":
        if (!["field", "append", "drop"].includes(value)) fail(`--negative-mode must be field|append|drop (got "${value}")`);
        opts.negativeMode = value;
        break;
      case "model": {
        const g = GROUP_ALIASES[value] ?? value;
        if (!GROUPS[g]) fail(`unknown --model "${value}" (known: ${Object.keys(GROUPS).join(", ")}, qwen)`);
        opts.model = g;
        break;
      }
      default: {
        switch (name) {
          case "parallel": opts.parallel = assertInt(name, value); break;
          case "n": opts.n = assertInt(name, value); break;
          case "seed": opts.seed = assertInt(name, value); break;
          case "steps": opts.steps = assertInt(name, value); break;
          case "guidance": opts.guidance = assertNumeric(name, value); break;
          case "port": opts.port = assertInt(name, value); break;
          case "timeout": opts.timeout = assertInt(name, value); break;
          case "retries": opts.retries = assertInt(name, value); break;
          case "max-pixels": opts.maxPixels = assertInt(name, value); break;
          case "video-seconds": opts.videoSeconds = assertNumeric(name, value); break;
          case "video-fps": opts.videoFps = assertInt(name, value); break;
          case "out": opts.out = value; break;
          case "base-url": {
            try { new URL(value); } catch { fail(`--base-url is not a valid URL: "${value}"`); }
            opts.baseUrl = value.replace(/\/+$/, "");
            break;
          }
          case "model-id":
          case "served-model": opts.modelId = value; break;
          case "api-key": opts.apiKey = value; break;
          case "prompts-dir": opts.promptsDir = path.resolve(value); break;
          default: fail(`unknown flag --${name}`);
        }
      }
    }
  }

  if (opts.parallel < 1) fail("--parallel must be >= 1");
  if (opts.n < 1) fail("--n must be >= 1");
  if (opts.retries < 0) fail("--retries must be >= 0");
  return opts;
}

function assertNumeric(name, value) {
  const n = Number(value);
  if (!Number.isFinite(n)) fail(`--${name} expects a number, got "${value}"`);
  return n;
}

function assertInt(name, value) {
  const n = Number(value);
  if (!Number.isInteger(n)) fail(`--${name} expects an integer, got "${value}"`);
  return n;
}

function applyFilters(blocks, filters) {
  if (!filters.length) return blocks;
  return blocks.filter((b) =>
    filters.every(({ key, values }) => {
      const subject =
        key === "category" ? b.category :
        key === "file" ? b.fileStem :
        key === "concept" ? b.concept : b.id; // manifest blocks carry .concept
      return values.includes(subject);
    }),
  );
}

// ---------------------------------------------------------------------------
// Task planning
// ---------------------------------------------------------------------------

function planTasks(blocks, group, opts) {
  return blocks.map((block, index) => {
    let n = opts.n;
    if (opts.autoN && block.suggestedN) n = block.suggestedN; // no-op for manifest (suggestedN null)
    // Seed precedence: --seed flag > manifest seed_hint > none (markdown path unchanged).
    const seedBase = opts.seed ?? block.seedHint ?? null;
    const size = resolveSize(block, group, opts);
    if (size.size_snapped === true) {
      console.error(`  [size-snap] ${size.original.w}x${size.original.h} -> ${size.sent.w}x${size.sent.h} (wan22 bucket)`);
    }
    const { path: apiPath, payload, perSeed } = buildPayload({ block, size, n, seedBase }, group, opts);
    const ext = group.kind === "image" ? "png" : "mp4";
    let dir;
    let stem;
    if (block.source === "manifest") {
      dir = path.join(opts.out, opts.model, VIDEO_SOURCE_DIR, block.concept);
      stem = `${block.id}-${block.track}`;
    } else {
      dir = path.join(opts.out, opts.model, block.category);
      const tag = block.variantTag ? `-${block.variantTag}` : "";
      stem = `${block.fileStem}-V${block.variantNum}${tag}`;
    }
    const files = [];
    for (let i = 0; i < n; i++) {
      const suffix = n > 1 ? `-i${i + 1}` : "";
      files.push(path.join(dir, `${stem}${suffix}.${ext}`));
    }
    return { index, block, size, n, payload, perSeed, apiPath, files, seed: perSeed[0] ?? null };
  });
}

function tasksToCurl(task, baseUrl, opts) {
  const headers = ["-H 'Content-Type: application/json'"];
  if (opts.apiKey) headers.push(`-H 'Authorization: Bearer $SKYNET_API_KEY'`);
  return `curl -sS -X POST '${baseUrl}${task.apiPath}' ${headers.join(" ")} -d '${JSON.stringify(task.payload)}'`;
}

// ---------------------------------------------------------------------------
// HTTP plumbing
// ---------------------------------------------------------------------------

function httpHeaders(opts) {
  const h = { "Content-Type": "application/json" };
  if (opts.apiKey) h.Authorization = `Bearer ${opts.apiKey}`;
  return h;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class HttpError extends Error {
  constructor(status, bodyText, url) {
    super(`HTTP ${status} from ${url}: ${bodyText.slice(0, 400)}`);
    this.status = status;
    this.retryable = status >= 500 || status === 429;
  }
}

/**
 * POST safety law: generation requests cost GPU time. A POST may only be
 * re-sent when it provably never reached the server (connection-phase
 * failures). Timeouts, aborts, and mid-flight resets leave the server-side
 * state UNKNOWN — re-sending risks duplicate paid work, so we fail loud
 * and let the human verify before retrying.
 */
const PRE_CONNECT_CODES = new Set(["ECONNREFUSED", "EAI_AGAIN", "ENOTFOUND", "ENETUNREACH", "EHOSTUNREACH"]);

function isProvablyNotDelivered(err) {
  if (err?.name === "TimeoutError" || err?.name === "AbortError") return false;
  return PRE_CONNECT_CODES.has(err?.cause?.code ?? err?.code ?? "");
}

/**
 * Wall-clock transport replacing global fetch (bug fix 2026-10-07).
 *
 * Why: undici-backed `fetch()` enforces a hardcoded ~300s headersTimeout
 * while waiting for response headers. SGLang's synchronous
 * /v1/images/generations holds the response open for the whole generation
 * (flux2 images routinely exceed 5 minutes under --parallel), so fetch()
 * killed healthy connections at ~5 min; the caller saw
 * "TypeError: fetch failed" — delivery state unknown under the M2 law —
 * and marked the task FAILED even though the server finished the image.
 *
 * Contract with the M2 law (a POST may only be re-sent when provably
 * not delivered):
 *  - The ONLY timer is the caller's wall deadline. When it fires the
 *    request bytes were already written, so we reject with
 *    name "TimeoutError" → isProvablyNotDelivered() stays false →
 *    no POST retry. Exactly the classification AbortSignal.timeout gave,
 *    just at the right duration.
 *  - Connection-phase socket errors (ECONNREFUSED, ENOTFOUND, EAI_AGAIN,
 *    ENETUNREACH, EHOSTUNREACH) propagate with `.code` intact — all of
 *    them can only occur before the request is flushed, so POSTs still
 *    retry on them and GETs still retry on them.
 *  - Mid-flight breaks after flush (ECONNRESET, EPIPE, aborted response)
 *    carry no PRE_CONNECT code → POST = unknown → no retry; GET retries.
 *    Same semantics as the old fetch path.
 *
 * Redirect policy: GET follows up to 3 Location hops (fetch did this;
 * keeps /v1/models behavior); POST never auto-follows — re-issuing a
 * generation POST at a redirect target would double-spend GPU.
 *
 * The body is fully buffered (what res.arrayBuffer() did anyway; video
 * downloads of tens of MB are fine). No size cap is imposed. Resolved
 * object exposes exactly the accessors callers use: ok, status,
 * headers.get("location"), text(), json(), arrayBuffer().
 */
const MAX_GET_REDIRECTS = 3;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function wallDeadlineError(url) {
  const err = new Error(`wall-clock deadline reached during request to ${url}`);
  err.name = "TimeoutError"; // M2: POST delivery state unknown → never retried
  return err;
}

function requestOnce(url, init, deadlineMs) {
  return new Promise((resolve, reject) => {
    let target;
    try { target = new URL(url); } catch { reject(new TypeError(`invalid URL: ${url}`)); return; }
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      reject(new TypeError(`unsupported protocol ${target.protocol} in ${url}`));
      return;
    }
    const remainingMs = deadlineMs - Date.now();
    if (remainingMs <= 0) { reject(wallDeadlineError(url)); return; }
    const transport = target.protocol === "https:" ? https : http;
    let deadlineTimer = null; // armed right after req exists; handlers guard for null
    const clearDeadline = () => { if (deadlineTimer) clearTimeout(deadlineTimer); };
    const req = transport.request(
      target,
      { method: init.method ?? "GET", headers: { ...(init.headers ?? {}) } },
      (incoming) => {
        const chunks = [];
        incoming.on("data", (chunk) => chunks.push(chunk));
        incoming.on("aborted", () => {
          clearDeadline();
          reject(new Error(`connection aborted mid-response from ${url}`));
        });
        incoming.on("error", (err) => {
          clearDeadline();
          reject(err);
        });
        incoming.on("end", () => {
          clearDeadline();
          const body = Buffer.concat(chunks);
          const status = incoming.statusCode ?? 0;
          const location = typeof incoming.headers.location === "string" ? incoming.headers.location : null;
          resolve({
            ok: status >= 200 && status < 300,
            status,
            headers: { get: (name) => (name.toLowerCase() === "location" ? location : null) },
            text: async () => body.toString("utf8"),
            json: async () => JSON.parse(body.toString("utf8")),
            arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
          });
        });
      }
    );
    // Single absolute wall timer — no per-header-read timeout exists here.
    deadlineTimer = setTimeout(() => req.destroy(wallDeadlineError(url)), remainingMs);
    req.on("error", (err) => {
      clearDeadline();
      reject(err);
    });
    req.end(init.body ?? undefined);
  });
}

async function rawRequest(url, init, deadlineMs, redirectsLeft = MAX_GET_REDIRECTS) {
  const res = await requestOnce(url, init, deadlineMs);
  const isGet = (init.method ?? "GET").toUpperCase() === "GET";
  if (!isGet || !REDIRECT_STATUSES.has(res.status) || redirectsLeft <= 0) return res;
  const location = res.headers.get("location");
  if (!location) return res;
  return rawRequest(new URL(location, url).href, init, deadlineMs, redirectsLeft - 1);
}

async function fetchWithRetry(url, init, opts, deadline) {
  const isPost = (init.method ?? "GET").toUpperCase() === "POST";
  let attempt = 0;
  for (;;) {
    if (Date.now() > deadline) throw new Error(`timeout after ${opts.timeout}ms: ${url}`);
    try {
      const res = await rawRequest(url, init, deadline);
      if (res.ok || res.status === 404 || (!res.ok && res.status < 500 && res.status !== 429)) return res;
      if (attempt >= opts.retries) {
        throw new HttpError(res.status, await safeText(res), url);
      }
    } catch (err) {
      if (err instanceof HttpError) throw err;
      if (isPost && !isProvablyNotDelivered(err)) {
        throw new Error(`POST ${url} failed with delivery state unknown (${err.name}: ${err.message}) — NOT retrying to avoid duplicate GPU work; check the server/manifest before re-running this task`);
      }
      if (attempt >= opts.retries) throw err; // network error, retries exhausted
    }
    const backoff = 2000 * 2 ** attempt;
    attempt++;
    console.error(`  retry ${attempt}/${opts.retries} for ${url} in ${backoff}ms`);
    await sleep(Math.min(backoff, Math.max(0, deadline - Date.now())));
  }
}

async function safeText(res) {
  try { return await res.text(); } catch { return "<unreadable body>"; }
}

async function postJson(baseUrl, apiPath, payload, opts, deadline) {
  const res = await fetchWithRetry(`${baseUrl}${apiPath}`, {
    method: "POST",
    headers: httpHeaders(opts),
    body: JSON.stringify(payload),
  }, opts, deadline);
  const text = await safeText(res);
  if (!res.ok) throw new HttpError(res.status, text, `${baseUrl}${apiPath}`);
  try { return JSON.parse(text); } catch { throw new Error(`server returned non-JSON on ${apiPath}: ${text.slice(0, 200)}`); }
}

async function getBinary(url, opts, deadline) {
  const res = await fetchWithRetry(url, { method: "GET", headers: httpHeaders(opts) }, opts, deadline);
  if (!res.ok) throw new HttpError(res.status, await safeText(res), url);
  return Buffer.from(await res.arrayBuffer());
}

async function getJson(url, opts, deadline) {
  const res = await fetchWithRetry(url, { method: "GET", headers: httpHeaders(opts) }, opts, deadline);
  const text = await safeText(res);
  if (!res.ok) throw new HttpError(res.status, text, url);
  try { return JSON.parse(text); } catch { throw new Error(`non-JSON from ${url}: ${text.slice(0, 200)}`); }
}

// ---------------------------------------------------------------------------
// Transport resolution
// ---------------------------------------------------------------------------

/**
 * Endpoint precedence: --base-url > --port (http on the default host) >
 * http://skynet2.interserver.net:30001 (single-model proxy default).
 */
function resolveBaseUrl(opts) {
  if (opts.baseUrl) return opts.baseUrl;
  if (opts.port !== null) return `http://${HOST}:${opts.port}`;
  return DEFAULT_BASE_URL;
}

/**
 * True for the owner's chosen SINGLE-MODEL proxy default — exactly the
 * DEFAULT_BASE_URL (http on :30001 at the skynet2 host). That endpoint
 * fronts one model at a time, so when /v1/models reports exactly one entry,
 * that served id IS the payload target: auto-adopt it while the request
 * SHAPE keeps following the selected --model group. Note `--port 30001`
 * resolves to the same URL string, so it gets the same treatment by design.
 */
function isSingleModelProxyOrigin(baseUrl) {
  return baseUrl === DEFAULT_BASE_URL;
}

/**
 * True when the endpoint is a SHARED multi-model reverse proxy: https on the
 * default port (443) at a non-local host. It lists every routable model, so
 * an id mismatch must be a warning, never an auto-adopted payload and never
 * a fail-fast.
 */
function isSharedProxyOrigin(baseUrl) {
  let u;
  try { u = new URL(baseUrl); } catch { return false; }
  if (u.protocol !== "https:") return false;
  if (u.port !== "" && u.port !== "443") return false;
  return u.hostname !== "localhost" && u.hostname !== "127.0.0.1";
}

// ---------------------------------------------------------------------------
// Model auto-detection (read-only probe)
// ---------------------------------------------------------------------------

function isDiffusionEntry(entry) {
  return Boolean(entry && (entry.task_type || entry.pipeline_name || entry.pipeline_class));
}

async function probeModels(baseUrl, opts) {
  const res = await fetchWithRetry(`${baseUrl}/v1/models`, { method: "GET", headers: httpHeaders(opts) }, { ...opts, retries: 0 }, Date.now() + 15_000);
  if (!res.ok) throw new HttpError(res.status, await safeText(res), `${baseUrl}/v1/models`);
  return res.json();
}

/**
 * Decide the payload model id before a real run.
 * Precedence: --served-model > single-model auto-adopt > group default id.
 * - --served-model/--model-id set: never probe, trust the user (enforced by
 *   the caller gate in cmdRun — this function is not even reached).
 * - SINGLE-MODEL proxy default (http://skynet2.interserver.net:30001): if
 *   /v1/models reports exactly one entry, adopt that served id; request
 *   shape still follows the group. With 0 or >1 entries, fall through to
 *   the conservative direct rules.
 * - SHARED https:443 multi-model proxy: probe is informational only —
 *   confirm/warn, do NOT adopt whatever else the proxy currently fronts.
 * - LEGACY direct endpoint: conservative auto-adopt of a single diffusion-
 *   marked served id (never plain-LLM entries — :30000 was seen serving
 *   Qwen/Qwen3.8-Flash-Next-FP8, a DIFFERENT deployment).
 */
async function detectModelId(baseUrl, group, opts) {
  const singleProxy = isSingleModelProxyOrigin(baseUrl);
  const sharedProxy = !singleProxy && isSharedProxyOrigin(baseUrl);
  let data;
  try {
    data = await probeModels(baseUrl, opts);
  } catch (err) {
    console.error(`note: /v1/models probe failed (${err.message}) — keeping configured model "${group.model}"`);
    return group.model;
  }
  const entries = Array.isArray(data?.data) ? data.data : [];
  const ids = entries.map((e) => e?.id).filter(Boolean);

  if (singleProxy && ids.length === 1) {
    const served = ids[0];
    if (served !== group.model) {
      console.error(`note: single-model proxy at ${baseUrl} serves "${served}" — adopting it as the payload id (${group.kind} request shape for group kept)`);
      return served;
    }
    return served; // proxy confirms the configured id
  }
  // A single-model origin listing 0 or >1 entries is ambiguous — treat it
  // like a direct endpoint below rather than guessing.

  if (sharedProxy) {
    if (ids.includes(group.model)) return group.model; // proxy confirms it
    if (ids.length === 0) return group.model;
    console.error(`warning: shared proxy at ${baseUrl} currently lists [${ids.join(", ").slice(0, 160)}] — NOT "${group.model}". A single-model proxy fronts only the loaded model; trusting the configured id (pass --served-model to target the listed one). Requests will error until "${group.model}" is fronted.`);
    return group.model;
  }

  const diffusion = entries.filter(isDiffusionEntry);
  if (diffusion.length === 1) {
    const served = diffusion[0].id;
    if (served !== group.model) {
      console.error(`note: adopting served model id "${served}" (configured default was "${group.model}"; task_type=${diffusion[0].task_type ?? "?"})`);
      return served;
    }
    return served;
  }
  if (diffusion.length === 0 && entries.length > 0) {
    console.error(`warning: ${baseUrl}/v1/models lists ${entries.length} entr(ies) with NO diffusion markers (ids: ${ids.join(", ").slice(0, 160)}) — this endpoint may be a plain-LLM server, not SGLang Diffusion. Keeping "${group.model}"; requests will likely fail with the server's own error.`);
    return group.model;
  }
  if (diffusion.length > 1) {
    console.error(`note: ${diffusion.length} diffusion-marked entries on ${baseUrl}; keeping configured "${group.model}" — pass --served-model to pick another.`);
  }
  return group.model;
}

// ---------------------------------------------------------------------------
// Media format sniffing (bug fix 2026-10-07, PART A)
//
// Why: the planner names image outputs ".png" before the response exists,
// but SGLang pipelines return whichever container the scheduler encodes —
// FLUX/SD3.5 commonly emit JPEG bytes under a .png name. File extensions
// lie; magic bytes don't. At save time we sniff the buffer and write under
// the detected extension, recording the truth in sidecar + manifest.
// ---------------------------------------------------------------------------

const DETECTABLE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "mp4"]);

/** JPEG FFD8FF, PNG 89504E47, GIF 474946, WEBP RIFF....WEBP, MP4 ftyp@4. */
function detectImageFormat(buffer) {
  const b = buffer;
  if (!Buffer.isBuffer(b)) throw new TypeError("detectImageFormat expects a Buffer");
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b.length >= 3 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "gif";
  if (b.length >= 12 && b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return "webp";
  if (b.length >= 12 && b.subarray(4, 8).toString("latin1") === "ftyp") return "mp4";
  return "bin";
}

/** Replace a media file's extension with the detected one (".png" → ".jpg"). */
function withExtension(file, ext) {
  const cur = path.extname(file).replace(/^\./, "").toLowerCase();
  if (cur === ext) return file;
  const jpegAlias = ext === "jpg" && cur === "jpeg" ? "jpeg" : ext;
  if (jpegAlias === cur) return file;
  return `${file.slice(0, file.length - path.extname(file).length)}.${ext}`;
}

// ---------------------------------------------------------------------------
// Execution: images (sync) and videos (async job + poll)
// ---------------------------------------------------------------------------

async function runImageTask(baseUrl, task, opts, deadline) {
  const resp = await postJson(baseUrl, "/v1/images/generations", task.payload, opts, deadline);
  const meta = { request_n: task.n, response: summarizeImageResponse(resp) };
  const items = Array.isArray(resp?.data) ? resp.data : [];
  if (!items.length) throw new Error(`image response had no data[]: ${JSON.stringify(resp).slice(0, 200)}`);
  if (items.length < task.n) meta.short_count = items.length;

  const written = [];
  for (let i = 0; i < Math.min(items.length, task.n); i++) {
    const item = items[i];
    let bytes;
    if (item.b64_json) bytes = Buffer.from(item.b64_json, "base64");
    else if (item.url) {
      const abs = item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`;
      bytes = await getBinary(abs, opts, deadline);
    } else throw new Error(`image data[${i}] had neither b64_json nor url`);
    const detected = detectImageFormat(bytes);
    let file = task.files[i];
    if (detected === "bin") {
      console.error(`    warn: ${path.basename(file)}: unrecognized magic bytes — keeping planned name`);
    } else {
      file = withExtension(file, detected); // derive name from CONTENT, not plan
    }
    meta.format = detected;
    await fs.mkdir(path.dirname(file), { recursive: true });
    await writeFileAtomic(file, bytes);
    written.push({ file, format: detected });
  }
  return { meta, written };
}

function summarizeImageResponse(resp) {
  return {
    id: resp?.id ?? null,
    created: resp?.created ?? null,
    count: resp?.data?.length ?? 0,
    revised_prompt: resp?.data?.[0]?.revised_prompt ?? null,
    inference_time_s: resp?.inference_time_s ?? null,
    peak_memory_mb: resp?.peak_memory_mb ?? null,
  };
}

async function runVideoJob(baseUrl, task, variantIndex, opts, deadline) {
  const payload = { ...task.payload };
  const seed = task.perSeed[variantIndex];
  if (seed !== null && seed !== undefined) payload.seed = seed;

  const job = await postJson(baseUrl, "/v1/videos", payload, opts, deadline);
  const jobId = job?.id;
  if (!jobId) throw new Error(`video submit returned no job id: ${JSON.stringify(job).slice(0, 200)}`);

  let status = job.status ?? "queued";
  let last = job;
  const pollUrl = `${baseUrl}/v1/videos/${encodeURIComponent(jobId)}`;
  while (status !== "completed" && status !== "failed") {
    if (Date.now() > deadline) throw new Error(`video job ${jobId} did not finish before timeout (last status: ${status})`);
    await sleep(5000);
    last = await getJson(pollUrl, opts, deadline);
    status = last?.status ?? status;
  }
  if (status === "failed") {
    const msg = typeof last.error === "string" ? last.error : JSON.stringify(last.error ?? last).slice(0, 300);
    throw new Error(`video job ${jobId} failed server-side: ${msg}`);
  }

  let bytes;
  if (last.url) bytes = await getBinary(last.url, opts, deadline);
  else {
    const variant = task.n > 1 || last.num_outputs > 1 ? `?variant=${variantIndex}` : "";
    bytes = await getBinary(`${baseUrl}/v1/videos/${encodeURIComponent(jobId)}/content${variant}`, opts, deadline);
  }

  const meta = {
    job_id: jobId,
    payload,
    final_status: { status: last.status, progress: last.progress ?? null, inference_time_s: last.inference_time_s ?? null },
  };
  return { meta, bytes };
}

async function runVideoTask(baseUrl, task, opts, deadline) {
  const meta = { jobs: [] };
  const written = [];
  for (let i = 0; i < task.n; i++) {
    const { meta: jobMeta, bytes } = await runVideoJob(baseUrl, task, i, opts, deadline);
    meta.jobs.push(jobMeta);
    const detected = detectImageFormat(bytes);
    let file = task.files[i];
    if (detected !== "mp4") {
      // Video keeps its .mp4 name (players/pollers assume it); the mismatch
      // is surfaced, not silently relabelled — PART A law.
      console.error(`    warn: ${path.basename(file)}: expected mp4 magic, detected "${detected}" — keeping .mp4`);
    }
    meta.format = detected;
    await fs.mkdir(path.dirname(file), { recursive: true });
    await writeFileAtomic(file, bytes);
    written.push({ file, format: detected });
  }
  return { meta, written };
}

// ---------------------------------------------------------------------------
// Manifest + sidecars + pool
// ---------------------------------------------------------------------------

async function appendManifest(manifestPath, row) {
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.appendFile(manifestPath, `${JSON.stringify(row)}\n`, "utf8");
}

async function writeSidecar(mediaFile, task, group, opts, meta, ok, errorText, format = null) {
  const sidecar = {
    generated_at: new Date().toISOString(),
    model_group: opts.model,
    served_model: group.model,
    endpoint: `${group.baseUrl}${task.apiPath}`,
    negative_mode: opts.negativeMode,
    // Negative evidence trail (PART B, 2026-10-07): what the library defined
    // vs what the wire payload actually carried. `negative_defined` set +
    // `negative_sent` null + group supportsNegative=false is the BY-DESIGN
    // FLUX case (guidance-distilled pipeline ignores negative_prompt).
    negative_defined: task.block.negative || null,
    negative_sent: task.payload?.negative_prompt ?? null,
    // LTX-Video encoder budget actually sent (feature 2026-10-08); null for
    // every other group / --ltx-max-seq 0.
    diffusers_kwargs: task.payload?.diffusers_kwargs ?? null,
    block: task.block,
    size_original: task.size.original,
    size_sent: task.size.sent,
    size_method: task.size.method,
    // Wan2.2 bucket-snap evidence (feature 2026-10-08): the library asked
    // for requested_size; size_snapped true means the wire size is a
    // trained bucket the library did NOT state (see size_method).
    requested_size: `${task.size.original.w}x${task.size.original.h}`,
    size_snapped: task.size.size_snapped === true,
    requested_n: task.n,
    media_file: path.basename(mediaFile),
    media_format: format ?? meta?.format ?? null,
    status: ok ? "ok" : "failed",
    error: errorText ?? null,
    response_meta: meta ?? null,
  };
  await writeFileAtomic(`${mediaFile}.json`, JSON.stringify(sidecar, null, 2), "utf8");
}

async function existsOne(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

/**
 * Skip-existing check aware of content-derived names (PART A): a task
 * planned as ".png" also counts as done when a repaired/regenerated
 * sibling with the same stem but true image extension exists — so relabel
 * passes never cause paid re-generation.
 */
async function resolveExistingVariants(files) {
  const resolved = [];
  for (const f of files) {
    if (await existsOne(f)) { resolved.push(f); continue; }
    const stem = f.slice(0, f.length - path.extname(f).length);
    let hit = null;
    for (const e of ["png", "jpg", "jpeg", "webp", "gif"]) {
      const cand = `${stem}.${e}`;
      if (cand !== f && (await existsOne(cand))) { hit = cand; break; }
    }
    if (!hit) return null;
    resolved.push(hit);
  }
  return resolved.length ? resolved : null;
}

/** Atomic media write: a killed process must never leave a truncated file
 *  that skip-existing would later accept as complete. */
async function writeFileAtomic(file, data) {
  const tmp = `${file}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file);
}

async function runPool(tasks, worker, parallel) {
  const results = new Array(tasks.length);
  let cursor = 0;
  async function lane(laneId) {
    for (;;) {
      const i = cursor++;
      if (i >= tasks.length) return;
      results[i] = await worker(tasks[i], i, laneId);
    }
  }
  await Promise.all(Array.from({ length: Math.min(parallel, tasks.length) }, (_, l) => lane(l)));
  return results;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/** Which manifest track a video group speaks (--track wins). */
function selectTrack(groupName, opts) {
  if (opts.track !== null) return opts.track;
  const t = GROUP_TRACK[groupName];
  if (!t) fail(`group "${groupName}" has no default manifest track — pass --track ltx|wan`);
  return t;
}

async function cmdList(opts) {
  const { blocks, warnings, filesParsed } = await loadLibrary(opts.promptsDir);
  const byCategory = {};
  for (const b of blocks) (byCategory[b.category] ??= []).push(b);
  console.log(`prompt library: ${opts.promptsDir}`);
  console.log(`IMAGE source (category .md dirs; videos/ excluded):`);
  for (const cat of Object.keys(byCategory)) {
    const files = new Set(byCategory[cat].map((b) => b.fileStem));
    console.log(`  ${cat.padEnd(10)} ${String(files.size).padStart(3)} files  ${String(byCategory[cat].length).padStart(4)} variations`);
  }
  console.log(`totals: ${filesParsed} files parsed, ${blocks.length} variation blocks, ${warnings.length} warnings`);
  for (const w of warnings) console.error(`  warn: ${w}`);

  const sizes = {};
  for (const b of blocks) sizes[`${b.size.w}x${b.size.h}`] = (sizes[`${b.size.w}x${b.size.h}`] ?? 0) + 1;
  const overMp = blocks.filter((b) => b.size.w * b.size.h > GROUPS[opts.model].maxPixels).length;
  console.log(`distinct sizes: ${Object.keys(sizes).length}; blocks over ${opts.model} max-pixels (${GROUPS[opts.model].maxPixels}): ${overMp}`);

  console.log(`\nVIDEO source (videos/manifest.json — canonical feed):`);
  const { entries, problems } = await loadVideoManifest(opts.promptsDir);
  if (!entries.length) {
    for (const p of problems) console.error(`  warn: ${p}`);
  } else {
    const perConcept = {};
    let ltx = 0; let wan = 0; let i2v = 0;
    const incomplete = [];
    for (const e of entries) {
      perConcept[e.concept ?? "?"] = (perConcept[e.concept ?? "?"] ?? 0) + 1;
      if (e.model?.ltx?.prompt) ltx++;
      if (e.model?.wan?.prompt) wan++;
      if (e.i2v_note) i2v++;
      if (!e.model?.ltx?.prompt || !e.model?.wan?.prompt) incomplete.push(e.id);
    }
    for (const c of Object.keys(perConcept).sort()) {
      console.log(`  ${c.padEnd(16)} ${String(perConcept[c]).padStart(3)} entries`);
    }
    console.log(`totals: ${entries.length} entries (ltx track ${ltx}, wan track ${wan}; i2v-recommended ${i2v})`);
    for (const id of incomplete) console.error(`  warn: entry ${id} lacks a complete model.ltx/model.wan pair`);
    for (const p of problems) console.error(`  warn: ${p}`);
  }
}

async function cmdDryRun(tasks, group, opts) {
  const baseUrl = group.baseUrl;
  for (const task of tasks) {
    const i2v = task.block.i2vNote ? "  [i2v-recommended]" : "";
    console.log(`\n=== [${task.index + 1}/${tasks.length}] ${task.block.category}/${task.block.id}${task.block.track ? ` (${task.block.track} track)` : ""}  (${task.n} output${task.n > 1 ? "s" : ""})${i2v}`);
    if (task.block.i2vNote) console.log(`    i2v: ${task.block.i2vNote}`);
    console.log(`    size ${task.size.original.w}x${task.size.original.h} -> ${task.size.sent.w}x${task.size.sent.h} via ${task.size.method}`);
    if (task.block.source === "manifest") {
      console.log(`    frames ${task.payload.num_frames} @ ${task.payload.fps}fps ≈ ${task.block.effSeconds}s (hint ${task.block.durationS}s, seed_hint ${task.block.seedHint ?? "none"})`);
    }
    console.log(`    files: ${task.files.map((f) => path.relative(process.cwd(), f)).join(", ")}`);
    if (group.kind === "video" && task.n > 1) console.log(`    note: ${task.n} separate single-output video jobs (seed+i)`);
    console.log(JSON.stringify(task.payload, null, 2));
    console.log(`curl: ${tasksToCurl(task, baseUrl, opts)}`);
  }
  console.log(`\ndry-run: ${tasks.length} task(s), ${tasks.reduce((a, t) => a + t.n, 0)} output(s) — nothing sent, nothing written.`);
}

async function cmdRun(tasks, group, opts) {
  const baseUrl = group.baseUrl;
  const manifestPath = path.join(opts.out, opts.model, "manifest.jsonl");

  if (!opts.modelId) {
    group.model = await detectModelId(baseUrl, group, opts);
    // Adoption must reach the wire: payloads were built during planning with
    // the configured id — re-stamp them with the resolved/served id.
    for (const t of tasks) t.payload.model = group.model;
  }

  let sent = 0, saved = 0, failed = 0, skipped = 0;
  const failures = [];

  const started = Date.now();
  await runPool(tasks, async (task, i) => {
    const isManifest = task.block.source === "manifest";
    const label = isManifest
      ? `${VIDEO_SOURCE_DIR}/${task.block.concept}/${task.block.id}-${task.block.track}`
      : `${task.block.category}/${task.block.id}`;
    const row = { ts: new Date().toISOString(), index: task.index, id: task.block.id, category: task.block.category, file: task.block.fileStem, variant: task.block.variantNum, model: group.model, kind: group.kind, n: task.n, size_original: task.size.original, size_sent: task.size.sent, requested_size: `${task.size.original.w}x${task.size.original.h}`, size_snapped: task.size.size_snapped === true, diffusers_kwargs: task.payload?.diffusers_kwargs ?? null, files: task.files.map((f) => path.relative(opts.out, f)) };
    if (isManifest) {
      row.track = task.block.track;
      row.concept = task.block.concept;
      row.num_frames = task.payload.num_frames;
      row.fps = task.payload.fps;
      row.seed_hint = task.block.seedHint;
      if (task.block.i2vNote) row.i2v_recommended = true;
    }

    const existing = opts.force ? null : await resolveExistingVariants(task.files);
    if (existing) {
      skipped++;
      row.status = "skipped-existing";
      row.files = existing.map((f) => path.relative(opts.out, f)); // actual on-disk names
      await appendManifest(manifestPath, row);
      return;
    }

    sent++;
    const taskStart = Date.now();
    const deadline = taskStart + opts.timeout;
    const durNote = group.kind === "video"
      ? ` ${isManifest ? `${task.payload.num_frames}f@${task.payload.fps}fps` : `${task.payload.seconds}s`}`
      : "";
    const i2vNote = task.block.i2vNote ? " [i2v-recommended]" : "";
    console.error(`[${i + 1}/${tasks.length}] ${label}${i2vNote} → ${task.size.sent.w}x${task.size.sent.h} n=${task.n}${durNote}`);
    try {
      const { meta, written } = group.kind === "image"
        ? await runImageTask(baseUrl, task, opts, deadline)
        : await runVideoTask(baseUrl, task, opts, deadline);
      for (const w of written) await writeSidecar(w.file, task, group, opts, meta, true, null, w.format);
      saved++;
      row.status = "ok";
      row.files = written.map((w) => path.relative(opts.out, w.file)); // truth: actual names written
      row.format = written[0]?.format ?? null;
      row.negative_sent = task.payload?.negative_prompt ?? null;
      row.wall_ms = Date.now() - taskStart;
      row.response_meta = meta;
      await appendManifest(manifestPath, row);
    } catch (err) {
      failed++;
      row.status = "failed";
      row.error = err.message;
      row.wall_ms = Date.now() - taskStart;
      await appendManifest(manifestPath, row);
      const sidecarTarget = task.files[0];
      try {
        await fs.mkdir(path.dirname(sidecarTarget), { recursive: true });
        await writeSidecar(sidecarTarget, task, group, opts, null, false, err.message);
      } catch { /* sidecar write is best-effort */ }
      failures.push({ label, error: err.message });
      console.error(`    FAILED ${label}: ${err.message}`);
    }
  }, opts.parallel);

  const totalOutputs = tasks.reduce((a, t) => a + t.n, 0);
  console.log(`\nsummary (${((Date.now() - started) / 1000).toFixed(1)}s)`);
  console.log(`  queued  ${tasks.length} task(s) / ${totalOutputs} output(s)`);
  console.log(`  sent    ${sent}`);
  console.log(`  saved   ${saved} task(s) ok`);
  console.log(`  skipped ${skipped} (outputs already exist; --force to redo)`);
  console.log(`  failed  ${failed}`);
  if (failures.length) {
    console.log(`\nfailures:`);
    for (const f of failures) console.log(`  ${f.label}: ${f.error}`);
  }
  console.log(`\nmanifest: ${manifestPath}`);
  process.exitCode = failed ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Repair mode (PART C) — offline maintenance of the --out tree. NO network.
//
// Conventions it repairs to:
//   - media file extension == magic-byte truth (detectImageFormat)
//   - sidecar at `<media>.json` naming the SAME basename as the media file
//   - manifest.jsonl `files` entries pointing at names that exist
// Victim deletion (C2) requires POSITIVE evidence that a supported negative
// was NOT sent: a new-format sidecar with negative_sent:null while the block
// defines one, or a legacy video sidecar whose job payloads lack
// negative_prompt. Legacy IMAGE sidecars without payload evidence are NEVER
// deleted (conservative law — "unknown" is not "guilty").
// ---------------------------------------------------------------------------

const LIVE_WINDOW_MS = 5 * 60 * 1000; // fresher writes belong to the LIVE sweep — hands off

function isLiveFresh(statMs) {
  return Date.now() - statMs < LIVE_WINDOW_MS;
}

function groupSupportsNegative(groupName) {
  const g = GROUPS[groupName];
  if (!g) return null; // unknown group dir — classify, never act
  if (g.kind === "video") return true; // manifest law: both tracks honor negative_prompt
  return Boolean(g.supportsNegative);
}

/** Recursively collect media files (extension in DETECTABLE_EXTS) under dir. */
async function collectMediaFiles(dir, acc) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { await collectMediaFiles(full, acc); continue; }
    const ext = path.extname(e.name).replace(/^\./, "").toLowerCase();
    if (!DETECTABLE_EXTS.has(ext)) continue;
    if (/\.tmp-/.test(e.name)) continue; // mid-write atomics are not outputs
    acc.push(full);
  }
  return acc;
}

async function readMagicHead(file, bytes = 16) {
  let fh;
  try {
    fh = await fs.open(file, "r");
    const buf = Buffer.alloc(bytes);
    const { bytesRead } = await fh.read(buf, 0, bytes, 0);
    return buf.subarray(0, bytesRead);
  } catch {
    return Buffer.alloc(0);
  } finally {
    await fh?.close();
  }
}

function sameImageExt(a, b) {
  const n = (x) => (x === "jpeg" ? "jpg" : x);
  return n(a) === n(b);
}

/** Was this output's negative governed? Returns {verdict, reason}. */
function classifyNegativeEvidence(sidecar, groupName) {
  const supports = groupSupportsNegative(groupName);
  if (supports === null) return { verdict: "unknown-group", reason: `group "${groupName}" not in GROUPS` };
  const defined = sidecar?.block?.negative || null;
  if (!defined) return { verdict: "no-negative-in-library", reason: "entry defines no negative" };
  if (!supports) return { verdict: "kept-by-design", reason: `${groupName}: pipeline ignores negative_prompt (FLUX law)` };
  if (sidecar?.status !== "ok") return { verdict: "not-ok-status", reason: `status=${sidecar?.status}` };
  if (sidecar.negative_mode === "append") return { verdict: "kept-by-design", reason: "negative folded into positive (append mode)" };
  if (sidecar.negative_mode === "drop") return { verdict: "kept-by-design", reason: "user --negative-mode drop" };
  if ("negative_sent" in sidecar) {
    return sidecar.negative_sent
      ? { verdict: "sent", reason: "negative_sent recorded" }
      : { verdict: "victim", reason: "field mode + group supports but negative_sent null (explicit record)" };
  }
  // Legacy video sidecars embed each job payload — positive evidence possible.
  const jobs = sidecar?.response_meta?.jobs;
  if (Array.isArray(jobs) && jobs.length) {
    const anySent = jobs.some((j) => j?.payload && "negative_prompt" in j.payload);
    return anySent
      ? { verdict: "sent", reason: "job payloads carry negative_prompt" }
      : { verdict: "victim", reason: "legacy video sidecar: no job payload carries negative_prompt" };
  }
  // Legacy image sidecar: no payload evidence exists → conservative keep.
  return { verdict: "unknown-record-kept", reason: "legacy sidecar without negative evidence" };
}

async function readSidecar(mediaFile) {
  try {
    return JSON.parse(await fs.readFile(`${mediaFile}.json`, "utf8"));
  } catch {
    return null;
  }
}

async function cmdRepair(opts) {
  const out = opts.out;
  let dirents;
  try {
    dirents = await fs.readdir(out, { withFileTypes: true });
  } catch (err) {
    fail(`--repair: output tree "${out}" unreadable: ${err.message}`);
  }
  const groupDirs = dirents.filter((d) => d.isDirectory() && !d.name.startsWith(".")).map((d) => d.name);
  if (!groupDirs.length) {
    console.log(`repair: no group dirs under ${out} — nothing to do.`);
    return;
  }
  console.log(`repair ${opts.apply ? "--apply (MUTATING)" : "(dry-run, no changes)"} — root ${out}`);

  const manifestRewrites = []; // {path, lines} — collected during planning

  const totals = { media: 0, relabels: 0, victims: 0, keptByDesign: 0, mtimeSkipped: 0, unknownKept: 0, noSidecar: 0, sentOk: 0, manifestRewrites: 0, manifestSkipped: 0, videoWarnings: 0 };
  const relabelPlan = []; // {group, from, to}
  const victimPlan = []; // {group, file, reason}

  for (const g of groupDirs) {
    const media = [];
    await collectMediaFiles(path.join(out, g), media);
    const actions = []; // relabels in THIS group (for manifest patching)
    for (const file of media) {
      totals.media++;
      const st = await fs.stat(file);
      if (isLiveFresh(st.mtimeMs)) { totals.mtimeSkipped++; continue; }
      const ext = path.extname(file).replace(/^\./, "").toLowerCase();
      const detected = detectImageFormat(await readMagicHead(file));
      const sidecar = await readSidecar(file);
      if (!sidecar) totals.noSidecar++;

      // C1 — extension vs magic truth
      if (ext === "mp4" || detected === "mp4") {
        if (detected !== "mp4" && ext === "mp4") {
          totals.videoWarnings++;
          console.error(`  warn[${g}]: ${path.relative(out, file)} — mp4 name holds "${detected}" bytes (kept, video names stay .mp4)`);
        }
      } else if (detected === "bin") {
        totals.unknownKept++;
        console.error(`  warn[${g}]: ${path.relative(out, file)} — unrecognized magic (kept unchanged)`);
      } else if (!sameImageExt(ext, detected)) {
        const to = withExtension(file, detected);
        let clash = false;
        try { await fs.access(to); clash = true; } catch { /* free */ }
        if (clash) {
          totals.unknownKept++;
          console.error(`  warn[${g}]: ${path.relative(out, file)} — relabel target ${path.basename(to)} already exists, skipped`);
          continue;
        }
        totals.relabels++;
        actions.push({ from: file, to });
        relabelPlan.push({ group: g, from: file, to });
      }

      // C2 — missing-negative victims (delete so the next run regenerates)
      if (sidecar) {
        const { verdict, reason } = classifyNegativeEvidence(sidecar, g);
        if (verdict === "victim") { totals.victims++; victimPlan.push({ group: g, file, reason }); }
        else if (verdict === "kept-by-design") totals.keptByDesign++;
        else if (verdict === "unknown-record-kept") totals.unknownKept++;
        else if (verdict === "sent") totals.sentOk++;
      }
    }

    // Manifest patch plan for this group (file relabels only; rows are history)
    const manifestPath = path.join(out, g, "manifest.jsonl");
    if (actions.length) {
      let mstat = null;
      try { mstat = await fs.stat(manifestPath); } catch { /* no manifest */ }
      if (mstat && isLiveFresh(mstat.mtimeMs)) {
        totals.manifestSkipped++;
        console.error(`  warn[${g}]: manifest.jsonl written <5min ago (LIVE sweep?) — rewrite SKIPPED; relabels apply, rows will be stale`);
      } else if (mstat) {
        const raw = await fs.readFile(manifestPath, "utf8");
        const lines = raw.split("\n");
        const byOld = new Map(actions.map((a) => [path.relative(out, a.from).split(path.sep).join("/"), path.relative(out, a.to).split(path.sep).join("/")]));
        let touched = false;
        const patched = lines.map((line) => {
          if (!line.trim()) return line;
          let row;
          try { row = JSON.parse(line); } catch { return line; }
          if (!Array.isArray(row.files)) return line;
          const nextFiles = row.files.map((f) => byOld.get(f) ?? f);
          if (nextFiles.some((f, i) => f !== row.files[i])) {
            touched = true;
            return JSON.stringify({ ...row, files: nextFiles });
          }
          return line;
        });
        if (touched) {
          totals.manifestRewrites++;
          manifestRewrites.push({ path: manifestPath, lines: patched });
        }
      }
    }
    // per-group report
    const gRel = actions.length;
    const gVict = victimPlan.filter((v) => v.group === g).length;
    console.log(`  ${g.padEnd(8)} media=${media.length} relabel=${gRel} victims=${gVict}`);
  }

  console.log(`\nrelabels (${relabelPlan.length}):`);
  for (const r of relabelPlan.slice(0, 400)) console.log(`  ${path.relative(out, r.from)} -> ${path.basename(r.to)}`);
  if (relabelPlan.length > 400) console.log(`  … +${relabelPlan.length - 400} more`);
  console.log(`\nvictims (${victimPlan.length}):`);
  for (const v of victimPlan.slice(0, 200)) console.log(`  ${v.group}/${path.basename(v.file)}  [${v.reason}]`);
  console.log(`\ntotals: ${JSON.stringify(totals, null, 0)}`);

  if (!opts.apply) {
    console.log(`\ndry-run complete — nothing mutated. Re-run with --apply to execute.`);
    return;
  }

  // Apply: sidecars first (derive .json rename), then media rename, then victims, then manifests.
  for (const r of relabelPlan) {
    const scOld = `${r.from}.json`;
    const scNew = `${r.to}.json`;
    try {
      const sc = JSON.parse(await fs.readFile(scOld, "utf8"));
      sc.media_file = path.basename(r.to);
      sc.media_format = detectImageFormat(await readMagicHead(r.from));
      await writeFileAtomic(scNew, JSON.stringify(sc, null, 2), "utf8");
      await fs.unlink(scOld);
    } catch { /* sidecar absent/unparseable — media rename still proceeds */ }
    await fs.rename(r.from, r.to);
  }
  for (const v of victimPlan) {
    await fs.unlink(v.file);
    try { await fs.unlink(`${v.file}.json`); } catch { /* sidecar may be absent */ }
  }
  for (const m of manifestRewrites) {
    await writeFileAtomic(m.path, `${m.lines.join("\n")}`, "utf8");
  }
  console.log(`\napplied: ${relabelPlan.length} relabels, ${victimPlan.length} victim deletions, ${manifestRewrites.length} manifest rewrites.`);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { console.log(USAGE); return; }
  if (opts.apply && !opts.repair) fail("--apply only operates together with --repair");
  if (opts.repair) {
    // Repair is strictly offline: no endpoint resolution, no probes, no POSTs.
    opts.out = opts.out === null ? path.resolve(SCRIPT_DIR, "..", "output") : path.resolve(opts.out);
    return cmdRepair(opts);
  }
  if (opts.track !== null && GROUPS[opts.model].kind !== "video") {
    fail(`--track ${opts.track} applies to video groups only (${opts.model} is ${GROUPS[opts.model].kind})`);
  }

  const group = { ...GROUPS[opts.model], key: opts.model }; // key = stable group identity (served-model may rewrite .model)
  group.baseUrl = resolveBaseUrl(opts);
  if (opts.modelId) group.model = opts.modelId; // --served-model: honored by dry-run and real runs alike

  if (opts.list) return cmdList(opts);

  // Source split (owner directive v3): image groups walk the category .md
  // dirs; video groups expand videos/manifest.json for their track.
  let blocks;
  let sourceLabel;
  if (group.kind === "video") {
    group.track = selectTrack(opts.model, opts);
    const loaded = await loadVideoTasks(opts.promptsDir, group.track, opts);
    for (const w of loaded.warnings) console.error(`warn: ${w}`);
    if (!loaded.blocks.length) {
      fail(`no usable "${group.track}"-track entries in ${path.join(opts.promptsDir, VIDEO_SOURCE_DIR, MANIFEST_FILE)} — cannot serve video group "${opts.model}"`);
    }
    blocks = loaded.blocks;
    sourceLabel = `${VIDEO_SOURCE_DIR}/${MANIFEST_FILE} track=${group.track} (${loaded.entriesParsed} entries)`;
  } else {
    const loaded = await loadLibrary(opts.promptsDir);
    for (const w of loaded.warnings) console.error(`warn: ${w}`);
    blocks = loaded.blocks;
    sourceLabel = `${loaded.filesParsed} markdown files`;
  }

  const selected = applyFilters(blocks, opts.filters);
  if (!selected.length) {
    console.error(`no variation blocks matched filters (source: ${sourceLabel}, ${blocks.length} blocks). Use --list to inspect.`);
    process.exitCode = 1;
    return;
  }

  if (opts.out === null) opts.out = path.resolve(SCRIPT_DIR, "..", "output");
  opts.out = path.resolve(opts.out);

  const tasks = planTasks(selected, group, opts);

  if (opts.dryRun) return cmdDryRun(tasks, group, opts);
  return cmdRun(tasks, group, opts);
}

// CLI guard: importing this module (tests/tooling) must NOT execute main —
// an accidental default-args run spends real GPU money against the live server.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`fatal: ${err.stack ?? err.message}`);
    process.exit(1);
  });
}
