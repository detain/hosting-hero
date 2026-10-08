/**
 * The post-chain WRITER — the only code in this repository that assigns
 * `.filters` on anything (pinned positively and negatively by
 * render/__tests__/filtersLaw.test.ts). ADR-0008 lane 2.
 *
 * Why this file exists separately from postChain.ts: the law module is pure
 * TypeScript and node-testable (the codebase pattern — only compositor.ts and
 * g1Scene.ts import pixi, and "never imported by tests" kept that promise);
 * the pixi-heavy write surface gets its own honest home. Tests that need real
 * instances opt into jsdom per-file, like the component tests do.
 *
 * Wrapper law encoded here (ADR-0008):
 *  - `.filters =` is compositor-only and lives behind render/post/ — THIS
 *    line is the whole of it (see writePostFilters).
 *  - Per-object filter passes are REFUSED AS A CLASS: the only accepted
 *    write target is the container createPostRoot() marked with
 *    POST_ROOT_LABEL. Anything else throws naming the law.
 *  - No addon self-subscribes the ticker: this file never imports
 *    Application and never touches `.ticker`. The compositor's frame loop
 *    drives PostChain.tick(); grain rides heartbeat.ts (0.5Hz).
 *  - No invented colors: the vignette takes its color from hueHex() of an
 *    already-ledger-validated hue (postChain.parsePostEffect law 3).
 */
import { Container, type Filter } from "pixi.js";
import {
  AdjustmentFilter,
  ColorOverlayFilter,
  KawaseBlurFilter,
  SimplexNoiseFilter,
} from "pixi-filters";
import { hueHex } from "../hues";
import { heartbeatCount } from "../heartbeat";
import {
  confidenceBlurStrength,
  type ParsedPostEffect,
  type PostFilterFactory,
  type PostHost,
} from "./postChain";

/** The single legal write target's mark. A label, not a WeakSet — visible in
 *  the pixi inspector so an accidental per-object graft is legible too. */
export const POST_ROOT_LABEL = "hh:post-chain-root";

/** Kawase quality 3 = vendor default; clamp true because this is a whole-
 *  screen filter (vendor docs: removes dark edges from fullscreen filters). */
const CONFIDENCE_BLUR_QUALITY = 3;

/** Create and mount the one post root, stacked last on the stage so it
 *  frames every world + annotation layer. Called by a consumer lane when a
 *  post chain first goes live — NOTHING calls it yet (zero runtime delta,
 *  by design; the release lane owns the first mount). */
export function createPostRoot(stage: Container): Container {
  const root = new Container();
  root.label = POST_ROOT_LABEL;
  stage.addChild(root); // top of the stage stack: post frames everything
  return root;
}

/** Wrapper-law gatekeeper: only the marked post root may carry filters. */
export function assertPostRoot(target: Container): void {
  if (target.label === POST_ROOT_LABEL) return;
  throw new Error(
    `post[per-object-refused]: container '${target.label || "(unlabelled)"}' is not the ` +
      "marked post-chain root. Per-object filter passes are refused as a CLASS " +
      "(ADR-0008 wrapper law): container.filters writes are compositor-only behind " +
      "render/post/, metered through admit() as whole-screen overlay/modal claims. " +
      "Mount one effect onto the createPostRoot() stage container instead.",
  );
}

/** THE write. Sole `.filters =` assignment in the repo — filtersLaw.test.ts
 *  pins this (positive control: exactly one; global scan: zero elsewhere). */
export function writePostFilters(root: Container, filters: readonly Filter[]): void {
  assertPostRoot(root);
  root.filters = [...filters];
}

/** Materialise the closed vocabulary into real pixi-filters instances.
 *  Construction-only: every parameter arrives pre-parsed and pre-validated
 *  by postChain.ts (parse, don't validate — nothing is re-checked here). */
export function createPixiFilterFactory(): PostFilterFactory {
  return (effect: ParsedPostEffect) => {
    switch (effect.kind) {
      case "haze": {
        // gamma/contrast/brightness only — the parsed shape structurally
        // lacks saturation and channel keys, so the Two-Channel greyscale
        // sign-off survives this effect by construction, not by discipline.
        const filter = new AdjustmentFilter({
          gamma: effect.gamma,
          contrast: effect.contrast,
          brightness: effect.brightness,
        });
        return { instance: filter };
      }
      case "confidence-blur": {
        // One shared whole-screen instance; confidence lands as strength,
        // which the vendor filter feeds into its uOffset kernel uniform.
        // Never per-unit chains (ADR-0008). See the honest-gap note on
        // confidenceBlurStrength() — no ObservedCell.confidence consumer yet.
        const filter = new KawaseBlurFilter({
          strength: confidenceBlurStrength(effect.confidence),
          quality: CONFIDENCE_BLUR_QUALITY,
          clamp: true,
        });
        return { instance: filter };
      }
      case "grain": {
        const filter = new SimplexNoiseFilter({
          strength: effect.strength,
          noiseScale: effect.noiseScale,
        });
        // Film grain shimmers on the SHARED heartbeat (0.5Hz), never on a
        // private clock: the compositor's frame loop calls update(wallMs)
        // and the phase is a pure function of wall time (no accumulator).
        return {
          instance: filter,
          update(wallMs: number): void {
            filter.offsetZ = heartbeatCount(wallMs);
          },
        };
      }
      case "vignette": {
        // Color ONLY from the Hue Ledger (parse law 3 already named the hue).
        const filter = new ColorOverlayFilter({
          color: hueHex(effect.hue),
          alpha: effect.alpha,
        });
        return { instance: filter };
      }
      default: {
        const unhandled: never = effect; // closed-union exhaustiveness
        throw new Error(`post[unknown-kind]: unhandled effect ${JSON.stringify(unhandled)}`);
      }
    }
  };
}

/** Bind a marked post root into the law module's PostHost seam. */
export function createPixiPostHost(root: Container): PostHost {
  assertPostRoot(root); // fail fast at wiring time, not at first write
  return {
    setPostFilters(handles: readonly { readonly instance: object }[]): void {
      writePostFilters(root, handles.map((handle) => handle.instance as Filter));
    },
  };
}
