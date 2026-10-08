# `render/substrate/` — @pixi/tilemap substrate SPIKE (ADR-0008 step 3)

**Status: law-shaped seam, tested, UNMOUNTED.** Nothing imports this
directory (substrateLaw.test.ts pins that as a machine-checked law, not a
promise). The deliverable of a spike is a verdict with receipts — this file
is the verdict; the three test files beside it are the receipts.

**PASSAGE:** read top-to-bottom once before the first-mount commit. Sections:
what was measured → the numbers → the zoom-budget arithmetic → the four
spike findings → verdict → what the first mount must own.

---

## What this seam is

- `substrateField.ts` — the pure law (no pixi import, node-testable):
  closed mount enum (`substrate` only; `flow`/`intent`/`attachment`/
  `annotation` rejected by name quoting "never let a concept live in two
  layers"), whole-layer holder accounting (`tilemap:substrate:<region>`,
  ONE holder per region, never per tile), quad caps metered to the label
  budget, palette-slot addressing of the seed kit's authored sheet.
- `tileField.ts` — the repo's ONLY `@pixi/tilemap` import: CompositeTilemap
  materialization, the real sampler-law guard, mount proof, lifecycle, and
  two headless measurement seams (`substrateBatches`, `substrateQuadsHeld`).
- Admission model: parse → quad-cap meter (refusal, live set untouched) →
  **category probe** → whole-layer claim. The probe
  (`substrateCategoryMetered`) asks the wired BudgetManager's live caps
  table for a `substrate` entry. Today budget.ts has none — every claim
  throws `substrate[category-pending]` BY DESIGN, including a ledger wired
  straight to `globalBudget`. The seam self-activates the day the owner
  widens BUDGET_CAPS: no flag to flip, no silent cap-widening by this lane.

## The numbers (measured, node env, no renderer)

| fixture | quads held (vendor `pointsBuf`/14) | batches (`children.length`) | draw-instruction surrogate |
|---|---|---|---|
| 6-quad authored patch | 6 | 1 | 1 render instruction |
| full seed palette 4×4 field | 16 | 1 | 1 |
| Z3 cap field (30×40 = 1200) | 1200 | **1** | **1** |
| redraw 6 → 4 quads | 4 | 1 | 1 (cleared, not appended) |

One internal Tilemap child = one render instruction (`renderPipeId
"tilemap"`). With ≤ 16 distinct texture sources (`settings.
TEXTURES_PER_TILEMAP` default) a region NEVER splits batches. The seed
palette is exactly 64×64 ÷ 16×16 = **16 slots = the batch limit** — a whole
palette's worth of authored tile variety fits ONE tilemap child, hence one
draw instruction per region per frame. That is the ADR's promise measured:
200–1200 quads for one draw call, vs the same floor authored as Sprites at
≥ one draw per texture-batch-break.

**Measurement gap, stated honestly:** these are batching-STRUCTURE numbers
(vendor's own buffers), not GPU counters. A real `renderer.render()` draw-call
census needs a GL context; pixi's GL adaptor on CI is exactly the deferred
`@pixi/node` arm (ADR step 5). The claim above needs no GPU: batch COUNT is
decided at write time by source accounting, and both seams are pinned
falsifiably in `tileField.test.ts`.

## Zoom-budget arithmetic — does the estate floor fit?

Cap model (law 4): `QUAD_CAP_BY_ALTITUDE[a] = LABEL_CAP_BY_ALTITUDE[a] ×
SUBSTRATE_QUADS_PER_LABEL_SLOT(40)` → **{Z1: 1920, Z2: 1440, Z3: 1200, Z4:
480}**. The multiplier 40 is the spike anchor that makes Z3 land on the
brief's ≤ 1200 target — a PROVISIONAL taste row (owner question #2).

The "200-rack floor × 40U" thought experiment, at 1 quad per tile edge:

- **Per-U authoring** (16-unit tiles, one per rack unit-face): 200 × 40 =
  **8,000 quads**. Against every cap: 8000 > 1920 (Z1), > 1200 (Z3), > 480
  (Z4). **Breaches at ALL altitudes** — the ledger refuses it before any
  budget claim (quad-budget refusal is arithmetic, not opinion).
- **Per-rack authoring** (one composite tile per rack face — the
  intended idiom at estate zoom): 200 × 1 = **200 quads ≤ 480 (Z4, the
  tightest cap)**. **Fits at every altitude**, one region, one batch, one
  draw instruction.
- **Screen-fill check at Z3** (nominalZoom 0.42, 1920×1080 px viewport):
  visible world ≈ 4571 × 2571 units → at 16-unit tiles that is ≈ 286 × 161
  ≈ 46,000 quads for a fully painted screen. The 1200 cap covers ≈ 2.6 % of
  paint-fill. **The cap is teaching us something:** substrate must be
  AUTHORED patches (material: concrete runs, cable trays, hot-aisle
  matting), not flood-filled pixel arithmetic — which is precisely the ADR
  sentence "tilemap owns material … never per-tile Intent/Attachment/
  Annotation concepts", now backed by a refused acquire().

So: per-rack/region authoring fits; naive per-U or per-texel authoring does
not. That is a content-authoring law for the skin kits, and the ledger
enforces it at admission, per altitude, with a named refusal.

## Spike findings (all disk-verified against 5.0.2; ADR traps section said versions lie — one of them did)

1. **Peer truth: no divergence.** npm registry: `@pixi/tilemap@5.0.2`
   peerDepends `pixi.js >=8.5.0`, zero runtime deps, MIT. ADR note holds.
   proto runs pixi.js 8.22.0 → satisfied. Lock delta: **exactly +1 package**
   (no transitive adds, no duplicate pixi) — see release notes / `git diff
   pnpm-lock.yaml` audit in the lane report.
2. **`settings.TEXTILE_SCALE_MODE` is a PHANTOM.** Declared `'linear'`,
   documented "do not change after initialization" — and consumed by
   NOTHING in the shipped lib (falsifiable scan pinned in
   `tileField.test.ts`). If we had obeyed the docs' sampler story we would
   have shipped mushed texels: fresh pixi `TextureSource`s default to
   `linear` too. The real guard is `assertPaletteSamplerLaw` on the source
   handed to `materializeRegion` (§4.7 nearest, lane-1 law). **This finding
   amends the ADR's step-3 technique sentence ("… with nearest/noip atlas
   flags set at texture creation via atlas.ts"): atlas.ts flags ride the
   TextureStyle of the sources we hand the tilemap; tilemap itself offers
   no sampler surface.**
3. **`BudgetManager.admit()` fails OPEN on unknown categories at runtime.**
   `BUDGET_CAPS[unknown]` → `undefined` → the cap check can't fire →
   admitted uncapped, and `snapshot().used` grows a `NaN` slot invisible to
   `breach`. The closed `BudgetCategory` union is the only guard today.
   Pinned as-is in `substrateField.test.ts` (deliberate cast) because our
   seam must never ride the hole — and because it is a HARDENING OPTION for
   the owner in budget.ts itself (fail-loud unknown-category throw; owner
   question #4).
4. **Import side effects are real.** `@pixi/tilemap` calls
   `extensions.add(TilemapPipe)` + the GL and GPU adaptors AT MODULE SCOPE.
   Merely importing registers three renderer extensions globally and pulls
   both adaptors into the bundle. This is why the sole-import-site law is a
   scan, not a convention. (Consequence for the unmounted spike: nothing in
   `dist/` may contain tilemap symbols — build + grep gate below.)
 5. **Version mirage re-confirmed:** the `Tilemap.addRectTile` family from
    the 0.x docs is deprecated on `CompositeTilemap` and ABSENT from
    `Tilemap`. The live rect path is `.tile(textureIndex, x, y, {u, v,
    tileWidth, tileHeight})` — which is what `writeRegionTiles` writes. Two
    checks stand behind it: a parse-side write-drift self-check inside the
    loop, then a post-write vendor-truth verification — `materializeRegion`
    and `redrawRegion` re-count the quads the vendor's own `pointsBuf` holds
    (`substrateQuadsHeld` math) and throw `substrate[vendor-drop]` on any
    disagreement before the map is handed out (a vendor-dropped quad becomes
    a crash at materialization, never a half-painted floor on screen).

## Verdict — RECOMMEND (adoption), HOLD (mount) — three owner decisions are load-bearing

**Adopt the seam; recommend @pixi/tilemap 5.0.2 for substrate material.**
The measured property the ADR promised is real: whole authored regions
batch to one render instruction, the vendor's write surface is usable under
our sampler law, and every ADR wrapper law is structurally enforced
(sole-site, zero-clock, zero-color, closed mount enum). The ADR's
ADOPT-WITH-CAUTION survives this spike intact — the caution now has teeth
written as tests, not prose.

**HOLD on mounting** until (and this is the whole distance between spike and
shipping):

1. **Owner decision — the category + cap.** `budget.ts` gains
   `substrate: N` to `BudgetCategory` + `BUDGET_CAPS` (N = max concurrently
   live regions; the spike's accounting is ready and self-activating via
   `substrateCategoryMetered`). This tripwire is already coded:
   `substrateField.test.ts` fails RED the day the cap appears, telling the
   lane to wire `globalBudget` and update this README.
2. **Owner decision — the taste rows.** `SUBSTRATE_QUADS_PER_LABEL_SLOT =
   40` (anchor: Z3 = 30×40 = 1200), `tileWorldSize` default 16,
   `SUBSTRATE_PRIORITY = 0`, and the cluster-by-altitude convention. All
   four are defensible defaults, none is data-backed yet.
3. **The first-mount commit must own:**
   - wiring: `SubstrateLedger({ budget: globalBudget })` + mount into
     `compositor` `layers.substrate` (the label assertion already matches
     its `layer:${name}` construction — pinned by substrateLaw);
   - palette plumbing: the skin-kit texture loaded through the assetpack
     lane with the lane-1 sampler law (nearest/noip) — `materializeRegion`
     refuses it otherwise;
   - region authoring in skin kits: `kit.json`-adjacent region files
     (id / mount must be substrate / cell grid of palette indices /
     altitude) — the parse laws here are the schema the content lane codes
     against; the per-rack idiom (see arithmetic) is the authoring guidance;
   - flipping law #2 of `substrateLaw.test.ts` (zero outside imports) in
     the SAME commit that adds the first outside import — the law inverts
     from "unmounted" to "mount-target-only" with an explicit edit, never
     by drift.

## Non-goals (spike honesty)

No `app.init`, no WebGL context, no real frame loop, no LRU culling across
altitudes, no region-splitting for >cap fields (authoring splits regions;
the ledger refuses over-cap wholes — a split-by-quads convenience can land
with real content). The `@pixi/node` draw-call census remains ADR step 5's
job. sim-core was not touched; nothing in this lane changes a wire type.
