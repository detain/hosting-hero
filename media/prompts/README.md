# Image-Generation Prompt Library — Hosting Company Tower Defense

Ready-to-use prompts for the game's art, grounded in the spec:
`hosting_game.md` §8.1–§8.18, `reports/MASTER_REPORT.md` §4.7, `docs/GLOSSARY.md`,
and the shipped palette code `apps/proto/src/render/hues.ts` + `apps/proto/src/chrome/styles/era-tokens.css`.

You are not locked to one model. Every block is written in **model-portable English phrases**
that work in Flux, Midjourney, and SDXL-class models. See SETTINGS below for how to translate.

---

## How to use

1. Open a category file (e.g. `rack-elevations-back.md`).
2. Copy one **variation block**'s POSITIVE paragraph into your model. Each category ships
   3–4 variations = deliberately different phrasings/seed strategies. Generate them, pick the
   winner per the category's **PICK CRITERIA** line, discard the rest.
3. Copy the NEGATIVE line into your model's negative-prompt field (SDXL, most WebUIs).
   Flux has no negative field — every block already repeats the critical bans ("no text, no
   letters, no watermark") inside the positive, so it degrades safely.
   Midjourney: append `--no text, letters, watermark` and use `--ar` from the SETTINGS line,
   plus `--style raw` for pixel/vector categories (fights the model's painterly defaults).
4. Settings vocabulary used in every block:
   - `size:` — pixel dimensions to request (or nearest supported bucket).
   - `aspect:` — geometry ratio; drives composition (2:1 iso floor ≠ 2:3 rack elevation).
   - `style:` — one of `pixel-art` | `vector` | `editorial-illustration` (the three registers, below).
   - `background:` — `magenta-key` (sprite destined for alpha extraction) or `scene`
     (full composited illustration; keep it).
   - `variations:` — seed/repeat advice: which seeds to try, how many to generate, what to cull.
5. `CATALOG.json` is the machine-readable index of every file (for coverage diffs by other lanes).

## The transparency strategy (read this before generating any sprite)

Image models do not emit clean alpha channels. So:

- **Sprite-class assets** (anything that becomes an in-engine sprite/icon/glyph) are generated
  on a **flat solid magenta #FF00FF background** — pure, evenly-lit, no gradient, no shadow on the
  floor — and the magenta is keyed out later in the atlas pipeline (colour-distance key + despill).
  Note: the keying magenta #FF00FF is a *technical* color and is deliberately distinct from the
  semantic threat-magenta of the Hue Ledger (#E04FD8) — never key on #E04FD8.
- **Doc-illustration-class assets** get full scenes instead. Don't fight for alpha you don't need.
- If the model keeps "helpfully" adding floor shadows despite the prompt, generate anyway and crop
  — a soft contact shadow on magenta keys acceptably with tolerance tuning. If it adds a drop
  shadow onto a *wall*, retry with a different seed.

## GLOBAL STYLE LAWS — every prompt must obey these (spec-cited)

These are baked into every block; they come from the Style Allocation Table and rendering laws
(hosting_game.md §8.1, §8.2, §8.16; MASTER_REPORT §4.7):

- **Three registers, never blended** (§8.1 "Iso Pixel World, Vector Signal, Terminal Chrome"):
  - **WORLD items** = isometric pixel-art diorama: fixed 2:1 iso, ~32-bit era pixel discipline,
    limited **desaturated material palette** (concrete grey, steel, beige plastic, rust, black
    plastic), matte with one gloss accent, hard readable silhouettes, tiny saturated LED points
    only. **No photorealism. Must survive greyscale.**
  - **SIGNAL items** = crisp flat vector: solid saturated semantic hues, uniform stroke weights,
    no texture, no lighting, no gradient.
  - **CHROME items** = diegetic terminal/instrument: monospace readouts aesthetic, bezel hardware,
    era-skinned (below), flat, crisp, unlit.
- **State is colour, identity is silhouette** (§8.1): what something *is* must read with colour
  drained; how it's *doing* must read with shapes blurred. Test every pick: black-on-white
  silhouette at 24px must be unconfusable (Silhouette Sheet gate, §8.16).
- **Two-Palette Discipline** (§8.1): world objects are muted materials only; saturated hue is
  *reserved for state* — decoration in saturated colour is a spec violation, so prompts say
  "desaturated" for every world asset.
- **The Hue Ledger** (§8.2 + `apps/proto/src/render/hues.ts` — one hue, one job):
  | Hue | Hex | Job |
  |---|---|---|
  | cyan | `#35E0E6` | legitimate traffic, data in motion |
  | magenta | `#E04FD8` | hostile traffic, always |
  | violet | `#8F5FE8` | unidentified / pre-classification ONLY |
  | gold | `#E8B23C` | money, only money |
  | copper | `#C97A45` | power, amps, electrical |
  | orange | `#F0862E` | heat, thermal lens |
  | red | `#E23B3B` | failure, final state — reserved |
  | green | `#4FC46A` | verified, served-ok, healthy |
  | white | `#FFFFFF` | player intent ink, control plane |
  | ink-blue | `#14202E` | chrome structure, blueprint linework |
  | warm grey-amber | `#9B8A6F` | wear, aging, degraded-but-serving |
  | grey | `#8A929C` | inert, unpowered, abandoned |
  | amber | `#F2B133` | alert fill, your-own-defenses-harming-you |
  Form law: **"gold moves, amber fills, orange is a lens, red is final"** (§8.2).
- **Era = exactly 4 tokens** (§8.10 + `era-tokens.css`): **1998** = VT323/IBM-Plex-Mono terminal
  typeface, corner-radius 0px, surface `#171D24`, accent amber `#F2B133`.
  **2026** = Space Grotesk grotesk sans, radius 12px, surface `#0D131C`, accent cyan `#35E0E6`.
  Layout/hierarchy/iconography never change with era — prompts vary only face, radius, surface, accent.
- **ALWAYS in negatives:** no text, no letters, no numbers as glyphs, no watermark, no UI captions,
  no logos, no signatures. Every in-game label (Dymo tape, rack IDs, hostnames) is added
  **in-engine** as its own layer (§8.4 Label Plate Aesthetic) — never baked by the image model,
  because models render garbled text and in-game labels are a mechanic (MTTR modifier).
- **Greyscale-survivable** (sign-off gate, §8.14/§8.16): if a pick only reads because of colour,
  it fails; prefer poses/silhouettes that survive a black-and-white dump.

## Master inventory

| File | Register | Covers | Vars | Transparent key needed |
|---|---|---|---|---|
| `world/iso-floor-tiles.md` | WORLD | cold/hot aisle tiles, containment, zones, zero-state floor | 4 | yes (seamable tiles) |
| `world/rack-elevations-front.md` | WORLD | front faceplates, LEDs, blanking panels, empty-U invitation | 4 | yes |
| `world/rack-elevations-back.md` | WORLD | two-face law back view: dual-cord, cable arms, dust filters | 4 | yes |
| `world/server-blades-formfactors.md` | WORLD | 1U/2U/4U/blade/appliance/GPU-node form factors | 4 | yes |
| `world/network-switches-routers.md` | WORLD | switches, routers, optics, port LED strips | 3 | yes |
| `world/power-chain-objects.md` | WORLD | PDU, UPS, ATS, genset, busway, battery room | 4 | yes |
| `world/cable-trays-and-cords.md` | WORLD | trays, sheath-band cord colours, link ribbons, archaeology | 3 | yes |
| `world/cooling-hvac-and-airflow.md` | WORLD | CRAC/CRAH, perforated tiles, containment, chillers | 4 | yes |
| `world/facility-rooms-interiors.md` | WORLD | NOC/dock/meet-me/office in 1998 vs 2026 era variants | 4 | no (room dioramas) |
| `world/hero-objects.md` | WORLD | per-line signature objects (tape library, GPU monolith…) | 4 | yes |
| `world/defense-objects.md` | WORLD | gates, sieves, valves, tarpits — interception-not-projectile | 3 | yes |
| `world/business-machine-props.md` | WORLD/diegetic | price book, AR spindle, reserve cage, backlog crates | 3 | yes |
| `identity/visitor-costume-hulls.md` | IDENTITY | duration-class hulls, props, ornaments, livery, whale | 4 | yes |
| `identity/threat-silhouettes-malicious.md` | IDENTITY | swarm/siege/stealth: tide, darts, clingers, crystallize | 4 | yes |
| `identity/threat-silhouettes-entropic-systemic-human.md` | IDENTITY | heat/decay/systemic/insider silhouettes | 3 | yes |
| `identity/threat-mimic-and-classification.md` | IDENTITY | violet unknown-form blob, resolve-to-class beats | 3 | yes |
| `identity/business-threats.md` | IDENTITY | chargeback coins, whale pillar, regulator, churn ripple | 4 | yes |
| `signal/gauge-face-set.md` | CHROME | 1 bezel × 5 faces × 2 eras = 20-combo sheets | 4 | mixed (V4 bare-face sheet keyed) |
| `signal/shape-token-sheets.md` | SIGNAL | status chips + notch glyphs, ring taxonomy, class marks | 3 | no (plates on ink/paper grounds) |
| `signal/policy-bead-icon-sheet.md` | SIGNAL | padlock/valve/fuse/hourglass/fan-out/loop/gate/cone beads | 3 | yes |
| `signal/port-glyph-set.md` | SIGNAL | RJ45 trapezoid, SFP slot, kettle plug, console circle | 3 | yes |
| `signal/alert-klaxon-and-rose.md` | SIGNAL | alert ladder pips, klaxon set, attack-surface rose, company marks | 4 | no (reference plates) |
| `fx/catastrophe-fx-lines.md` | FX | per-line disasters: rubber-band, flood tide, dark cascade | 4 | yes |
| `fx/feedback-fx-bounce-haze-heartbeat.md` | FX | bounce puff, amber FP haze, heartbeat glow language | 3 | yes |
| `docs-hero/*.md` (13 files) | EDITORIAL | large 16:9/3:2 section-header art per major concept | 3 each | no (full scenes) |

(Per-concept file list: the-bounce-loop, hockey-stick-landscape, drag-a-cable, two-boards,
blast-radius-flood, retry-storm-collapse, long-save-museum, policy-book-ghost-hands,
four-topologies, suspicion-dial-roc, economy-quarter-close, era-crossfade.)

## Picking discipline (from the acceptance roster, §8.16)

Every generated pick must pass the applicable test before it enters the atlas:
**Silhouette Sheet** (no confusable pair at 24px black-on-white) · **greyscale pass** ·
**Thumbnail Test** (readable at 128px) · **Quiet Frame Test** (healthy = calm; no decorative motion
baked into stills) · **Two-Screenshot Test** for per-line identity assets. The PICK CRITERIA line
in each category names the binding test for that class.
