# VIDEO PROMPT LIBRARY — LTX-Video & Wan 2.2

Text-to-video prompt library for the game's showcase families, tuned to the two local
video models the owner runs: **LTX-Video (ltxv, 0.9.x class)** and **Wan 2.2**
(TI2V-5B / T2V-A14B). Every shot ships **two model tracks per variation** — the same
beats, phrased in each model's prompting dialect. Do not copy-paste one track into the
other model; the conventions genuinely differ (see "Why two tracks" below).

Companion machine-readable files (this directory):

| File | Purpose |
|------|---------|
| `manifest.json` | Every variation block mirrored 1:1 as JSON — feed your generation script from here. |
| `MODELS.json` | Per-model presets: resolution/fps/duration grids, negative starters, camera vocab — for BOTH video models and the four image models (sd3.5-large, flux.1-dev, flux.2-dev, qwen-image). |
| `check_parity.py` | Verifies `manifest.json` entries == `### V` blocks in `concepts/*.md` and that the JSON parses. Run: `python3 check_parity.py`. |

## How to use

1. Pick a concept file in `concepts/` (family = showcase theme; each cites its spec §).
2. Each file has 3–5 **shots** (`## SHOT XX-n — Title`), each shot has **4 variations**
   (`### V1…V4`) with different phrasing/composition/energy — same subject.
3. Inside each variation, one fenced block holds three sections:
   - `META` — camera, loopable, seed-suggestion, text_zones (model-agnostic).
   - `LTX-VIDEO` — prompt + params in LTX dialect (chronological, action-first).
   - `WAN 2.2` — prompt + params in Wan dialect (cast-counted, cinematography terms,
     lighting/atmosphere clause, motion boundaries).
4. Generate both tracks for a variation at the same seed-suggestion when you want a
   fair model A/B; generate at your own seed for variety discovery.

## Why two tracks (the convention differences)

- **LTX-Video** wants a *chronological shot-list paragraph*: start directly with the
  main action, then movements, appearances, background, camera move, lighting. Literal,
  precise, ≤200 words. T5 encoder — plain English, no tag soup. (LTX-Video official
  Model User Guide.)
- **Wan 2.2** wants an *over-specified cinematography brief*: subject + explicit counts
  ("exactly one figure, seen from behind"), then action, then **named camera move**
  (static camera / slow push-in / left-to-right pan / no cuts), then scene + lighting +
  atmosphere, then **motion boundaries** ("nothing else moves"). Vague Wan prompts
  collapse into "cinematic chaos" — the model invents kissing couples if you let it.
  One camera move per clip; it rewards lighting/composition/color-tone vocabulary.
  (Wan 2.2 prompting guides — see SOURCES.)

## Shared parameter conventions in these files

- **duration_s / fps**: LTX track at **25 fps** with frame counts of the form 8n+1
  (121→4.8 s, 161→6.4 s, 193→7.7 s; stay ≤257 frames). If your ltxv build defaults to
  30 fps (0.9.6+ shipped configs), keep 8n+1 frames and let duration scale; re-check
  your config yaml. Wan track at **24 fps** with 4n+1 frame counts (121→5.0 s at
  1216x704 on TI2V-5B is the consumer sweet spot; ~193→8.0 s on A14B is "longer,
  slower").
- **resolution**: both models share a landscape grid point — **1216x704** — so A/B
  comparisons line up. LTX also uses 704x1216 / 512x512; Wan 5B uses 704x1216 /
  1024x1024. All values are already divisible per each model's constraints
  (LTX:32, Wan:16/VAE-aligned presets).
- **cfg**: LTX track ships **3.0** (official recommendation 3.0–3.5; distilled
  checkpoints run ~8 steps with CFG/STG disabled — N/A there). Wan track ships a dev
  range **3.0–5.0**; ⚠️ at CFG=1 (4–8-step Lightning-style distilled setups) **the
  negative prompt is effectively ignored** — bake your bans into the positive or raise
  CFG. Tune per model card.
- **steps_hint**: advisory only ("20-30 draft / 40 final" for LTX dev; "20-40" for Wan
  dev; distilled checkpoints 4–8).
- **motion-strength**: neither model has an official global knob. These files use a
  1–5 advisory tier — 1 = held, 2 = gentle drift, 3 = moderate flow, 4 = lively,
  5 = storm — realized *through prompt energy words* ("nearly still", "slow steady",
  "rapid churning") and, if your node set exposes one (LTXV community samplers /
  Wan wrappers), matched on the slider. Tune per model card.
- **seed-suggestion**: deterministic so reruns reproduce — `familycode*1000 +
  shot*10 + variation`, with family codes GL=11, TP=12, HT=13, NA=14, IC=15, EB=16,
  TT=17. Example: `11023` = gameplay-loop, shot 2, variation 3. Fixed seed per
  variation is the reproducibility contract; change seed, never change the prompt,
  when exploring luck.

## The no-text law, applied to video

Video models garble glyphs far worse than image models. **Every prompt here renders
zero text**: no signage lettering, no terminal output characters, no score digits, no
watermarks. Acceptance/rejection is a lamp gesture (green/amber/red), money is a coin
arc, status is a color. `text_zones` in each block records where a **typeset title or
HUD readout gets composited in post** — add titles in software (editor/motion graphics),
never in-model. Every negative carries `text, letters, numbers, captions, watermark`.

## Register discipline (this must look like THIS game)

Per the global style laws in `../README.md` — isometric **pixel-art diorama WORLD**
(2:1 iso, desaturated materials, tiny saturated LEDs), **flat-vector SIGNAL** layer
(beads on clean lines, solid semantic hues), **diegetic CHROME** (bezel gauges, CRT
glow, era-skinned). The three registers never blend in one frame unless a variation
is doing a deliberate register cut. Hue Ledger meanings are baked into prompts by
color, not by name: cyan #35E0E6 legit traffic, magenta #E04FD8 hostile, gold #E8B23C
money, copper #C97A45 power, amber #F2B133 alert, green #4FC46A healthy, red #E23B3B
failure-final, violet #8F5FE8 unidentified.

**One labeled exception family:** variations tagged **[CINEMATIC-REALISM]** (found in
`concepts/title-teasers.md` and one arm of incident-cinema) drop pixel rendering for
photoreal marketing footage per the §8.17 money-shot brief. They are explicitly the
exception — never treat an untagged block as realism.

## Loop-ability

`loopable: yes` marks seamless-loop candidates for idle/Aquarium screens (lobby
monitors, website backgrounds). The recipe: held or cyclic camera (static tripod or a
single slow drift that you cross-dissolve at midpoint), symmetric or continuous motion
(bead stream, fan rotation, tape arm), no narrative completion inside the clip. Easiest
honest loop in post: cut clip in half, cross-dissolve the seam (or mirror-boomerang for
oscillating motion). Shots that END on a state change (outage, cliff walk-off) are
never loopable.

## Post-production notes (house rules)

- **Speed-ramp liberally**: a 4.8 s LTX take at gentle motion reads great as a 2.5 s
  UI sting at 1.8×; ramp, don't hard-cut speed.
- **Splice pairs**: generate the same shot twice with camera held (V-static) and
  moving (V-push) — cut static→moving on the action to hide model seams.
- **Grain + scanline pass** over CHROME-register clips sells the diegetic CRT skin
  better than asking the model for it.
- **Never upscale-and-crop text out**: if a take grows pseudo-glyphs on a rack label,
  reject the take — don't blur it (reads as fake).
- **Titles/HUD**: composited in software at the `text_zones` position only.

## Image-to-video-only flags (hard camera moves — do not brute-force text2video)

- `concepts/title-teasers.md` **TT-2 "The Pullback"** (§8.17 money shot: aisle →
  containment glass → out the door → over campus → sign lights up) is a continuous
  multi-scale camera move both models will break. Recommended route: generate the
  **first frame as a still** (recipe ships in-file, phrased for FLUX.1-dev /
  SD3.5-Large), then image-to-video with a *partial* pullback; stitch arms on the
  doorframe. The text2video blocks exist as fallback only.
- **TT-1 "Era Crossfade"** works best as **Wan 2.2 FLF2V** (first-frame 1998 desk /
  last-frame 2026 desk stills — the stills recipe exists at
  `../docs-hero/era-crossfade.md`), not pure text2video; the text2video block is a
  rough-idea sketch.

## manifest.json schema

One entry per `### V` block, in file/shot/variation order:

```json
{
  "id": "gl-1-v1",
  "file": "concepts/gameplay-loop.md",
  "concept": "gameplay-loop",
  "shot": "GL-1 — Traffic arrives",
  "variation": 1,
  "variation_name": "Morning commuter",
  "camera": "static tripod",
  "loopable": true,
  "seed_hint": 11011,
  "text_zones": "none",
  "model": {
    "ltx":  {"prompt": "…", "negative": "…", "resolution": "1216x704", "fps": 25,
             "duration_s": 4.8, "aspect": "16:9", "motion_strength": "3/5 …",
             "cfg": "3.0 …", "steps_hint": "…"},
    "wan":  {"prompt": "…", "negative": "…", "resolution": "1216x704", "fps": 24,
             "duration_s": 5.0, "aspect": "16:9", "motion_strength": "…",
             "cfg": "…", "steps_hint": "…"}
  }
}
```

Entries carrying i2v advice add an optional top-level `"i2v_note"` string.
If you edit a .md block, regenerate the manifest (or hand-edit to match) and run
`python3 check_parity.py` — it must print matching counts and exit 0.

## SOURCES (research pass, 2026-10-07)

- LTX-Video repo README "Model User Guide" — prompting style, params (divisible-by-32
  res, 8n+1 frames, guidance 3–3.5, steps, seed saving):
  https://github.com/Lightricks/LTX-Video
- LTXV ComfyUI guide (negative starter "worst quality, inconsistent motion, blurry,
  jittery, distorted", workflow params):
  https://comfyanonymous.github.io/ComfyUI_examples/ltxv/ and
  https://docs.comfy.org/tutorials/video/ltx/ltx-video-13b
- Wan 2.2 repo README (TI2V-5B 720P@24fps consumer target, MoE experts, official
  sizes/prompt-extension note): https://github.com/Wan-Video/Wan2.2
- ComfyUI Wan 2.2 tutorial (native positive/negative CLIP Text Encode, FLF2V
  workflow): https://docs.comfy.org/tutorials/video/wan/wan2-2
- Wan prompting frameworks: Hugging Face discuss thread "Wan prompting guide"
  (cast-count + motion-boundary method, negative template):
  https://discuss.huggingface.co/t/170354 ; Wan 2.2 prompt structure guide:
  https://wan27.org/blog/wan-2-2-prompt-guide ; Segmind "Writing prompts for Wan
  2.2" (one camera move per clip, cinematography terms):
  https://blog.segmind.com/writing-prompts-for-wan-2-2/ ; Scenario "Wan 2.2
  Essentials": https://help.scenario.com/articles/wan-2-2-essentials
- Distilled-CFG caveat (negatives ignored at CFG=1 on 4–8-step Lightning/Rapid
  setups): https://github.com/kijai/ComfyUI-WanVideoWrapper README/discussions.
- Image-model presets (MODELS.json): FLUX.1-dev guide
  https://github.com/black-forest-labs/flux ; FLUX.2 notes
  https://andreaskuhr.com/en/blog/flux-2-comfyui-guide/ and
  https://www.botmonster.com/blog/flux-2 ; SD3.5 large guidance/encoders
  https://stabilityengine--encoderblog.hf.space/ and
  https://huggingface.co/stabilityai/stable-diffusion-3.5-large ; Qwen-Image
  prompting/CFG https://qwenlm.github.io/blog/qwen-image/ and
  https://civitai.com/articles/ (Qwen-Image prompting guide).
