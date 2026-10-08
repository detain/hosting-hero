/**
 * Post-chain admission law — ADR-0008's pixi-filters wrapper law in code
 * (lane 2, 2026-10-08).
 *
 * The render post-chain is the ONLY place full-screen filter effects may
 * exist, and this module is the only place their LEGAL SHAPE is decided.
 * It is pure TypeScript — no pixi import, node-env testable, exactly like
 * budget.ts. Materialising real Filter instances is writer.ts's job (the
 * single `.filters =` writer in the repo); this file never touches pixels.
 *
 * The laws encoded here (each pinned by tests in __tests__/):
 *
 * 1. CLOSED VOCABULARY. Only the four ADR-0008 admitted effects exist, and
 *    each names the job it was admitted for (§4.7 Atmosphere):
 *      haze              — AdjustmentFilter, atmosphere (gamma/contrast/
 *                          brightness ONLY; see the two-channel law)
 *      confidence-blur   — KawaseBlurFilter, Confidence Blur: the legibility
 *                          dial for observed truth, fed per §4.7 item 4
 *      grain             — SimplexNoiseFilter, film grain. NOTE the vendor
 *                          README still lists a `NoiseFilter` that is NOT
 *                          shipped in 6.1.5 (a version mirage of the same
 *                          family the ADR flags for particle-emitter) —
 *                          SimplexNoiseFilter is the shipped noise carrier.
 *      vignette          — ColorOverlayFilter, focus framing behind the
 *                          modal budget category.
 *
 * 2. BUDGET. Every effect claims renderer admission through admit() under
 *    its declared category (overlay: 1 / modal: 1 — the ADR wiring). Because
 *    BUDGET_CAPS.overlay is ONE, the three atmospheric effects compete by
 *    design: haze, confidence-blur and grain never coexist; the vignette
 *    coexists with at most one of them. Refusal keeps the PREVIOUS chain
 *    untouched and is reported — never silent (the refused result carries
 *    the refusal reason, and the budget clusters it as "+N visible").
 *
 * 3. HUE HONESTY. A vignette names a Hue Ledger entry — never a hex, never
 *    an invented color. admit() already throws off-ledger alertHues; this
 *    parse extends the same honesty to the post-chain's own hue channel.
 *
 * 4. TWO-CHANNEL SURVIVAL. haze must never become a luma-desaturation
 *    shortcut (ADR-0008: "Every effect must survive the Two-Channel
 *    greyscale sign-off"). The parsed haze shape structurally lacks
 *    saturation/channel keys; requesting one throws naming the law.
 *
 * 5. OUR FRAME LOOP ONLY. Nothing here subscribes to anything. The
 *    compositor's frame loop calls tick(wallMs); effects with time-varying
 *    state (grain shimmer) advance off that single shared heartbeat —
 *    no addon ever calls ticker.add (wrapper law 1).
 *
 * 6. PER-OBJECT PASSES REFUSED AS A CLASS. There is deliberately no API
 *    surface for filtering one display object. The only write target is
 *    the marked post root created by createPostRoot() in writer.ts;
 *    anything else throws (assertPostRoot).
 */
import { HUE_LEDGER, type LedgerHue } from "../hues";
import {
  globalBudget,
  type BudgetCategory,
  type BudgetManager,
  type RefusalReason,
} from "../budget";

/** The admitted effects, IN CHAIN ORDER: atmosphere first, legibility dial
 *  next, texture over the result, focus framing last (the vignette frames
 *  everything before it). Fixed order = deterministic rebuilds. */
export const POST_EFFECT_KINDS = ["haze", "confidence-blur", "grain", "vignette"] as const;
export type PostEffectKind = (typeof POST_EFFECT_KINDS)[number];

const KIND_SET: ReadonlySet<string> = new Set<string>(POST_EFFECT_KINDS);

/** Budget category per effect — the ADR-0008 wiring (overlay: 1 / modal: 1). */
export const POST_BUDGET_CATEGORY: Readonly<Record<PostEffectKind, BudgetCategory>> =
  Object.freeze({
    haze: "overlay",
    "confidence-blur": "overlay",
    grain: "overlay",
    vignette: "modal",
  } as const satisfies Record<PostEffectKind, BudgetCategory>);

/** Admission priority per effect. ALL below KLAXON_PRIORITY on purpose:
 *  post-chain effects are atmosphere, not alarm — an atmosphere effect that
 *  preempts is itself a design violation. Refusal-keeps-previous is
 *  therefore the only contention outcome (pinned by tests). */
export const POST_PRIORITY: Readonly<Record<PostEffectKind, number>> = Object.freeze({
  "confidence-blur": 45, // legibility of observed truth beats mood
  haze: 40,
  vignette: 50,
  grain: 30, // the nicest thing to lose
} as const satisfies Record<PostEffectKind, number>);

/** Confidence Blur mapping — the CORRECTNESS NOTE ADR-0008 demands, as code.
 *
 * The blur radius MUST arrive as a uniform fed from `ObservedCell.confidence`
 * (§4.7 item 4: the screen blurs with what we actually know), NEVER as a
 * per-unit filter chain. One shared KawaseBlurFilter instance covers the
 * whole screen; this pure map turns a coverage value into its strength:
 *   confidence 1 (we know it) → CONFIDENCE_BLUR_MIN_STRENGTH (barely there)
 *   confidence 0 (fog)        → CONFIDENCE_BLUR_MAX_STRENGTH
 * monotone decreasing, clamped domains enforced at parse.
 *
 * HONEST GAP (release lane, 2026-10-08): no consumer feeds this yet —
 * ObservedCell.confidence exists in sim-core, but nothing wires the observed
 * store into PostChain.apply({kind:"confidence-blur", ...}). The seam is
 * `apply()` itself; the first real consumer owns the wiring. */
export const CONFIDENCE_BLUR_MIN_STRENGTH = 0.5;
export const CONFIDENCE_BLUR_MAX_STRENGTH = 8.5;

export function confidenceBlurStrength(confidence: number): number {
  const coverage = requireUnitInterval(confidence, "confidence");
  return (
    CONFIDENCE_BLUR_MIN_STRENGTH +
    (1 - coverage) * (CONFIDENCE_BLUR_MAX_STRENGTH - CONFIDENCE_BLUR_MIN_STRENGTH)
  );
}

/** Stable budget claim id per effect kind — one slot per kind. */
export function postId(kind: PostEffectKind): string {
  return `post:${kind}`;
}

/** Reverse of postId; null for ids this chain does not own. */
function kindFromPostId(id: string): PostEffectKind | null {
  if (!id.startsWith("post:")) return null;
  const kind = id.slice("post:".length);
  return KIND_SET.has(kind) ? (kind as PostEffectKind) : null;
}

// ── requests (wire shapes) ─────────────────────────────────────────────────

export interface HazeRequest {
  readonly kind: "haze";
  readonly gamma?: number;
  readonly contrast?: number;
  readonly brightness?: number;
}
export interface ConfidenceBlurRequest {
  readonly kind: "confidence-blur";
  /** Observed coverage 0..1 — future feed MUST be ObservedCell.confidence. */
  readonly confidence: number;
}
export interface GrainRequest {
  readonly kind: "grain";
  readonly strength?: number;
  readonly noiseScale?: number;
}
export interface VignetteRequest {
  readonly kind: "vignette";
  /** A Hue Ledger job-name, never a hex (law 3). */
  readonly hue: LedgerHue;
  readonly alpha?: number;
}
export type PostEffectRequest =
  | HazeRequest
  | ConfidenceBlurRequest
  | GrainRequest
  | VignetteRequest;

// ── parsed (trusted internal shapes) ───────────────────────────────────────

export interface ParsedHaze {
  readonly kind: "haze";
  readonly gamma: number;
  readonly contrast: number;
  readonly brightness: number;
}
export interface ParsedConfidenceBlur {
  readonly kind: "confidence-blur";
  readonly confidence: number;
}
export interface ParsedGrain {
  readonly kind: "grain";
  readonly strength: number;
  readonly noiseScale: number;
}
export interface ParsedVignette {
  readonly kind: "vignette";
  readonly hue: LedgerHue;
  readonly alpha: number;
}
export type ParsedPostEffect =
  | ParsedHaze
  | ParsedConfidenceBlur
  | ParsedGrain
  | ParsedVignette;

/** Identity defaults — deliberately zero-taste: nothing is ratified yet, so
 *  the law bakes in NO look. Consumer lanes pass explicit parameters. */
const HAZE_IDENTITY = Object.freeze({ gamma: 1, contrast: 1, brightness: 1 });
const GRAIN_VENDOR_DEFAULT = Object.freeze({ strength: 0.5, noiseScale: 10 });
const VIGNETTE_FULL_ALPHA = 1;

export class PostChainError extends Error {
  constructor(code: string, detail: string) {
    super(`post[${code}]: ${detail}`);
    this.name = "PostChainError";
  }
}

function requireFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new PostChainError("bad-value", `${label} must be a finite number, got ${String(value)}`);
  }
  return value;
}

function requireUnitInterval(value: unknown, label: string): number {
  const n = requireFiniteNumber(value, label);
  if (n < 0 || n > 1) {
    throw new PostChainError("domain", `${label} must be within [0, 1], got ${String(n)}`);
  }
  return n;
}

const TWO_CHANNEL_KEYS = ["saturation", "red", "green", "blue", "alpha"] as const;

/** One allowed-key table per kind — the closed grammar of the vocabulary. */
const ALLOWED_KEYS: Readonly<Record<PostEffectKind, readonly string[]>> = Object.freeze({
  haze: ["kind", "gamma", "contrast", "brightness"],
  "confidence-blur": ["kind", "confidence"],
  grain: ["kind", "strength", "noiseScale"],
  vignette: ["kind", "hue", "alpha"],
});

function rejectUnknownKeys(kind: PostEffectKind, request: Readonly<Record<string, unknown>>): void {
  const allowed = new Set<string>(ALLOWED_KEYS[kind]);
  for (const key of Object.keys(request)) {
    if (allowed.has(key)) continue;
    // The two-channel law names its own violation before the generic wall.
    if (kind === "haze" && (TWO_CHANNEL_KEYS as readonly string[]).includes(key)) {
      throw new PostChainError(
        "two-channel",
        `haze must never become a luma-desaturation shortcut — '${key}' is not writable ` +
          "from the haze seam; every effect must survive the Two-Channel greyscale " +
          "sign-off (ADR-0008)",
      );
    }
    throw new PostChainError(
      "unknown-key",
      `key '${key}' is not part of the '${kind}' effect grammar (${ALLOWED_KEYS[kind].join(", ")})`,
    );
  }
}

/** Parse a request into a trusted effect. Throws PostChainError naming the
 *  broken law on ANY deviation — silent coercion is forbidden. */
export function parsePostEffect(request: PostEffectRequest): ParsedPostEffect {
  const raw = request as unknown as Readonly<Record<string, unknown>>;
  const kind = raw["kind"];
  if (typeof kind !== "string" || !KIND_SET.has(kind)) {
    throw new PostChainError(
      "unknown-kind",
      `'${String(kind)}' is not an admitted post effect — the closed vocabulary is ` +
        `${POST_EFFECT_KINDS.join(", ")} (ADR-0008 §pixi-filters verdict)`,
    );
  }
  const parsed = kind as PostEffectKind;
  rejectUnknownKeys(parsed, raw);

  switch (parsed) {
    case "haze":
      return Object.freeze({
        kind: "haze",
        gamma: raw["gamma"] === undefined ? HAZE_IDENTITY.gamma : requireFiniteNumber(raw["gamma"], "haze.gamma"),
        contrast: raw["contrast"] === undefined ? HAZE_IDENTITY.contrast : requireFiniteNumber(raw["contrast"], "haze.contrast"),
        brightness: raw["brightness"] === undefined ? HAZE_IDENTITY.brightness : requireFiniteNumber(raw["brightness"], "haze.brightness"),
      });
    case "confidence-blur":
      // requireUnitInterval gates the coverage; confidenceBlurStrength maps it.
      return Object.freeze({
        kind: "confidence-blur",
        confidence: requireUnitInterval(raw["confidence"], "confidence"),
      });
    case "grain":
      return Object.freeze({
        kind: "grain",
        strength: raw["strength"] === undefined ? GRAIN_VENDOR_DEFAULT.strength : requireFiniteNumber(raw["strength"], "grain.strength"),
        noiseScale: raw["noiseScale"] === undefined ? GRAIN_VENDOR_DEFAULT.noiseScale : requireFiniteNumber(raw["noiseScale"], "grain.noiseScale"),
      });
    case "vignette": {
      const hue = raw["hue"];
      if (typeof hue !== "string" || !(hue in HUE_LEDGER)) {
        // The same honesty admit() gives the alertHue category, extended to
        // the post chain's only color channel (wrapper law 2).
        throw new PostChainError(
          "ledger-hue",
          `vignette hue '${String(hue)}' is not in the Hue Ledger — every hue that ` +
            "reaches a pixel is injected from hues.ts; there are no default hexes in this file",
        );
      }
      return Object.freeze({
        kind: "vignette",
        hue: hue as LedgerHue,
        alpha: raw["alpha"] === undefined ? VIGNETTE_FULL_ALPHA : requireUnitInterval(raw["alpha"], "vignette.alpha"),
      });
    }
  }
}

// ── the chain manager ──────────────────────────────────────────────────────

/** Opaque carrier for a materialised filter (writer.ts binds the real pixi
 *  Filter as `instance`). `update` is the compositor-driven clock seam —
 *  effects never self-subscribe. */
export interface PostFilterHandle {
  readonly instance: object;
  update?(wallMs: number): void;
}

export type PostFilterFactory = (effect: ParsedPostEffect) => PostFilterHandle;

/** What the chain hands the screen: the ordered, live effect list. */
export interface PostHost {
  setPostFilters(handles: readonly PostFilterHandle[]): void;
}

export interface PostChainDeps {
  readonly host: PostHost;
  readonly factory: PostFilterFactory;
  readonly budget?: BudgetManager;
}

export type PostApplyResult =
  | {
      readonly applied: true;
      readonly chain: readonly PostEffectKind[];
      readonly evicted: readonly PostEffectKind[];
    }
  | {
      readonly applied: false;
      readonly reason: "budget-refused";
      readonly refusal: RefusalReason;
      readonly clusterId: string;
      readonly kept: readonly PostEffectKind[];
    };

export class PostChain {
  private readonly deps: PostChainDeps;
  private readonly budget: BudgetManager;
  private readonly live = new Map<PostEffectKind, ParsedPostEffect>();
  private handles: readonly PostFilterHandle[] = [];
  private disposed = false;

  constructor(deps: PostChainDeps) {
    this.deps = deps;
    this.budget = deps.budget ?? globalBudget;
  }

  /** Live effects in chain order (not insertion order — deterministic). */
  chainKinds(): readonly PostEffectKind[] {
    return POST_EFFECT_KINDS.filter((kind) => this.live.has(kind));
  }

  /** The parsed (trusted) effects currently in the chain, chain order. */
  chainEffects(): readonly ParsedPostEffect[] {
    return POST_EFFECT_KINDS.flatMap((kind) => {
      const effect = this.live.get(kind);
      return effect === undefined ? [] : [effect];
    });
  }

  /**
   * Request one effect into the chain. The request is PARSED first (illegal
   * shapes throw naming their law — before any budget claim is touched),
   * then admitted through the budget. A refusal keeps the previous chain
   * byte-for-byte and reports the refusal; it is never silent.
   */
  apply(request: PostEffectRequest): PostApplyResult {
    if (this.disposed) {
      throw new PostChainError("disposed", "this PostChain has been disposed");
    }
    const effect = parsePostEffect(request);
    const admission = this.budget.admit({
      id: postId(effect.kind),
      category: POST_BUDGET_CATEGORY[effect.kind],
      priority: POST_PRIORITY[effect.kind],
    });

    if (!admission.admitted) {
      // Previous chain kept — host was not touched, refusal is reported.
      return {
        applied: false,
        reason: "budget-refused",
        refusal: admission.reason,
        clusterId: admission.clusterId,
        kept: this.chainKinds(),
      };
    }

    const evicted: PostEffectKind[] = [];
    for (const evictedId of admission.evicted) {
      const kind = kindFromPostId(evictedId);
      if (kind === null) continue; // another subsystem's claim — not ours to keep
      this.live.delete(kind);
      evicted.push(kind);
    }

    this.live.set(effect.kind, effect);
    this.rebuild();
    return { applied: true, chain: this.chainKinds(), evicted };
  }

  /** Release one effect. Returns whether it was live (no throw on teardown
   *  races — atomic predictability). */
  release(kind: PostEffectKind): boolean {
    if (this.disposed) return false;
    const wasLive = this.live.delete(kind);
    this.budget.release(postId(kind));
    if (wasLive) this.rebuild();
    return wasLive;
  }

  /** Release every claim and clear the screen-side chain. */
  dispose(): void {
    if (this.disposed) return;
    for (const kind of this.live.keys()) {
      this.budget.release(postId(kind));
    }
    this.live.clear();
    this.handles = [];
    this.deps.host.setPostFilters([]);
    this.disposed = true;
  }

  /**
   * The frame-loop seam — THE clock this chain is allowed to know about
   * (wrapper law 1). The compositor's existing ticker calls this once per
   * frame with wallMs; effects with time-varying state advance off the
   * shared heartbeat. This module never subscribes to anything itself.
   */
  tick(wallMs: number): void {
    if (this.disposed) return;
    if (!Number.isFinite(wallMs) || wallMs < 0) {
      throw new PostChainError(
        "bad-clock",
        `tick(wallMs) needs a finite non-negative ms clock, got ${String(wallMs)}`,
      );
    }
    for (const handle of this.handles) {
      handle.update?.(wallMs);
    }
  }

  /** Rebuild handles + push to host. Fixed-order, replace-not-mutate: the
   *  screen always sees a complete, consistent chain snapshot. */
  private rebuild(): void {
    const handles: PostFilterHandle[] = [];
    for (const kind of POST_EFFECT_KINDS) {
      const effect = this.live.get(kind);
      if (effect === undefined) continue;
      handles.push(this.deps.factory(effect));
    }
    this.handles = handles;
    this.deps.host.setPostFilters(handles);
  }
}
