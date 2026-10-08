# @hh/assetpack — AssetPack pipeline contract (ADR-0008, lane 1)

Build-time skin-kit compiler wiring for Hosting Hero. This lane ships the
**pipeline contract**, not real atlases: the game has no authored pixel art
yet (`media/prompts/media/output/*` are concept renders for external
generation, not sprite sheets), so the deliverable is the format AssetPack
will compile, the manifest our runtime consumes, and the sampler-law layer
that retires the old `void options` headless-assertion wart in
`apps/proto/src/render/compositor.ts`.

## What is here

| Path | Role |
|------|------|
| `src/sampler.ts` | The §4.7 pixel-perfect law as data: `SamplerLaw` + materializers to pixi v8 shapes (`TextureStyleArgs`, renderer-init extras). Pixi-free by design; the proto side is the compile-time proof the shapes land. |
| `src/manifest.ts` | `hh-assetpack-manifest@1` — the law wrapper AssetPack itself does **not** produce (core 1.7.0 manifests carry no sampler flags). Fail-loud boundary parser (`parseHhAssetManifest`), deep-frozen output, byte-stable serializer. |
| `src/kit.ts` | Five-Asset Skin Kit (§0.2/§8.10): `hh-skin-kit@1` kit.json parser, layout validation (exactly five bespoke files — a sixth fails as "the wrong shape of game"), bleed-corner probe, placeholder generator. |
| `src/png.ts` | Dependency-free deterministic PNG codec (RGBA, filter 0, CRC-checked) — placeholder writing + pixel-level conformance reads without sharp in the test path. |
| `src/kits.ts` | `KitBuildSpec` data registry — the single source for hand-emitter, vendor runner, and generated vendor config. |
| `src/emit.ts` | Hand-emitted PASSAGE: manifest + `.assetpack.mjs` config generation (generated from the spec, so the vendor path can't drift). |
| `src/build.ts` | Vendor runner: `resolveVendorCore()` (null when absent, never throws) → `buildKit()` runs real `@assetpack/core` + `pixiPipes` when present and law-wraps its output; falls back to the passage otherwise, stating which path produced the artifact. |
| `src/cli.ts` | `make-kit` / `emit` / `build` / `verify` (`pnpm -F @hh/assetpack <script>`; plain-Node TS via `--experimental-transform-types`, headless-tools pattern). |
| `schema/*.schema.json` | JSON Schema mirrors of the two parsers. **The parsers are the enforcement authority**; the schemas are for humans/interop. |
| `configs/seed-shared-web.assetpack.mjs` | GENERATED vendor-CLI config — do not hand-edit; edit `src/kits.ts` and re-emit. |

## The sampler law mapping (why the manifest carries more than AssetPack does)

- `scaleMode: "nearest"` — closed enum; `"linear"` is unrepresentable in the
  parsed type and rejected at the boundary.
- `mipmapFilter: "nearest-noip"` — the §4.7 law label. pixi v8 has no "noip"
  constant: it MATERIALIZES as SCALE_MODE `"nearest"` for mag/min/mipmap on
  `TextureStyle`. The "no mip chain at all" half is packer-side:
  `buildMipmaps: false` ⇒ the `'nomip'` AssetPack tag in the embedded pixi
  layer. `buildMipmaps: true` + `"nearest-noip"` is a contradiction the parser
  refuses.
- `roundPixels` — renderer-level in v8 (`app.init` option), never per-texture;
  it rides `rendererInitExtrasFor` into `app.init`.
- Global install point: `TextureStyle.defaultOptions` is spread by every
  `TextureStyle` constructor (verified in `pixi.js@8.22.0`
  `rendering/renderers/shared/texture/TextureStyle.mjs`), so
  `installSamplerLaw(TextureStyle.defaultOptions, …)` in
  `compositor.ts` before `app.init` makes the law a fact for every texture
  created afterwards. Per-asset `data: {…styleArgs}` (pixi v8 loadTextures
  spreads `asset.data` into the source ctor) is the belt-and-braces passthrough.

## Consumer integration (apps/proto)

`apps/proto/src/render/atlas.ts` gained `atlasOptionsFromManifest`,
`samplerLawFromAtlasOptions`, `textureStyleOptionsFor`, `installSamplerLaw`,
`atlasRendererInitExtras` (imports only `@hh/assetpack/sampler` values +
`@hh/assetpack/manifest` types — the barrel, which touches `node:fs` via
`kit.ts`, is deliberately NOT imported so nothing node-side enters the web
bundle). `compositor.ts` replaced `void options;` with the real install +
init spread; `src/render/__tests__/atlasManifest.test.ts` pins the whole
chain without WebGL, including a source tripwire that the wart stays retired.

## Vendor CLI status (honest ledger)

- `@assetpack/core@1.7.0` is a devDependency of this package and **runs for
  real in this repo** (verified 2026-10-08): `pnpm -F @hh/assetpack build-kit`
  compiles the seed kit end-to-end (sharp transcodes to webp, manifest
  emitted, law-wrap lands, ~50 ms). The test suite exercises this path too.
- Install notes: pnpm skips the postinstall scripts of
  `@ffmpeg-installer/linux-x64`, `cpu-features`, `sharp` (not in
  `pnpm-workspace.yaml` allowBuilds — esbuild only) and prints
  `ERR_PNPM_IGNORED_BUILDS` when ADDING via `pnpm add` (it exits non-zero but
  records the deps); plain `pnpm install --frozen-lockfile` exits 0 with
  warnings — which is all CI runs. The prebuilt platform packages
  (`@img/sharp-*`) carry the working binaries; nothing needed approving.
- `@assetpack/core` ships its own CLI (`bin/index.js` → `dist/cli/index.js`);
  the standalone `assetpack` / `@assetpack/plugins` npm names are dead — that
  is the "stale at 0.8.0" line in ADR-0008. The CLI's `--version` banner lies
  (`0.2.0` even on core 1.7.0); ignore it.
- Config loading: `-c <path>` or find-up `.assetpack.js` (dist/cli/index.js).
  `assetSettings` shape is `{files: glob[], metaData: {tag: true}}` (verified
  live, not from stale docs).
- `compression: false` in the pixi pipes config dodges `gpu-tex-enc` native
  binaries; the ffmpeg/webfont/spine pipes never see matching files in a
  skin-kit build, so their blocked postinstalls stay harmless.

## Running the real compile

```bash
# core is already a devDependency here — from tools/assetpack (paths in the
# generated config resolve relative to the CONFIG FILE, so any cwd works):
pnpm -F @hh/assetpack build-kit      # programmatic AssetPack run → law-wrapped hh manifest
# or via the vendor CLI directly:
node_modules/.bin/assetpack -c configs/seed-shared-web.assetpack.mjs
```

`build-kit` overwrites the committed manifest with the `assetpack-core`
emitter variant once real art lands; until then `pnpm -F @hh/assetpack emit`
keeps the hand-emitted canonical in place, and the consumer path is identical
for both (the `emitter` field is the only difference — both wrappings ride
the same parser and the same tests). To probe a vendor build WITHOUT touching
the committed manifest: `pnpm -F @hh/assetpack build-kit -- --out /tmp/x.json`
(or `node --experimental-transform-types src/cli.ts build --out /tmp/x.json`).

## The seed kit (PLACEHOLDERS)

`assets/skin-kits/seed-shared-web/` — five solid-hue 64×64 RGBA textures +
kit.json, generated by `pnpm -F @hh/assetpack make-kit` from `src/seed.ts`
(regenerating is byte-identical; the PNGs are committed so downstream lanes
can consume them without running tooling). Every texture carries four fixed
corner markers — `#ff00ff` TL, `#00ffff` TR, `#ffff00` BL, `#000000` BR: any
marker color appearing away from its corners after packing proves frame
bleed. `manifest/hh-assetpack-manifest.json` is the committed
contract artifact the proto test consumes. The hues in kit.json are
provisional ARTWORK values, not Hue Ledger entries.
