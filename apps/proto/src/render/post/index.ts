/**
 * render/post/ — the ADR-0008 post-chain seam (lane 2).
 *
 * Two homes, one law:
 *  - postChain.ts: the pure admission law (vocabulary, budget, hue honesty,
 *    two-channel survival, frame-loop-only clock). Pixi-free, node-testable.
 *  - writer.ts: the repo's only `.filters =` writer + real filter
 *    materialisation. Pixi-heavy; jsdom tests opt in per-file.
 *
 * Consumers: construct a PostChain with the pixi host + factory, call
 * apply()/release()/tick(wallMs) from the compositor frame loop. Nothing
 * mounts a chain yet — the seam is law-first (release lane owns the first
 * consumer + the ObservedCell.confidence wiring gap).
 */
export {
  CONFIDENCE_BLUR_MAX_STRENGTH,
  CONFIDENCE_BLUR_MIN_STRENGTH,
  POST_BUDGET_CATEGORY,
  POST_EFFECT_KINDS,
  POST_PRIORITY,
  parsePostEffect,
  PostChain,
  PostChainError,
  confidenceBlurStrength,
  postId,
  type ConfidenceBlurRequest,
  type GrainRequest,
  type HazeRequest,
  type ParsedConfidenceBlur,
  type ParsedGrain,
  type ParsedHaze,
  type ParsedPostEffect,
  type ParsedVignette,
  type PostApplyResult,
  type PostChainDeps,
  type PostEffectKind,
  type PostEffectRequest,
  type PostFilterFactory,
  type PostFilterHandle,
  type PostHost,
  type VignetteRequest,
} from "./postChain";
export {
  assertPostRoot,
  createPixiFilterFactory,
  createPixiPostHost,
  createPostRoot,
  POST_ROOT_LABEL,
  writePostFilters,
} from "./writer";
