// @vitest-environment jsdom
/**
 * ADR-0008 post-chain WRITER tests — jsdom per-file opt-in (the pixi module
 * eval needs a document; construction works headless, no WebGL, no App).
 *
 * This is the vertical slice proof: real pixi-filters instances, real
 * Container, real BudgetManager — yet NOTHING renders. The post root never
 * joins an app.stage, so existing screens carry zero runtime delta.
 */
import { describe, expect, it } from "vitest";
import { Container } from "pixi.js";
import {
  AdjustmentFilter,
  ColorOverlayFilter,
  KawaseBlurFilter,
  SimplexNoiseFilter,
} from "pixi-filters";
import { BudgetManager } from "../budget";
import { hueHex } from "../hues";
import { heartbeatCount } from "../heartbeat";
import { confidenceBlurStrength, parsePostEffect, PostChain } from "../post/postChain";
import {
  assertPostRoot,
  createPixiFilterFactory,
  createPixiPostHost,
  createPostRoot,
  POST_ROOT_LABEL,
  writePostFilters,
} from "../post/writer";

const parsed = (request: Parameters<typeof parsePostEffect>[0]) => parsePostEffect(request);

describe("post root — the class refusal (wrapper law)", () => {
  it("createPostRoot marks and stacks the single legal write target", () => {
    const stage = new Container();
    const plain = new Container();
    stage.addChild(plain);
    const root = createPostRoot(stage);
    expect(root.label).toBe(POST_ROOT_LABEL);
    expect(stage.children[stage.children.length - 1]).toBe(root);
  });

  it("per-object filter passes REFUSE as a class — naming the law", () => {
    const sprite = new Container();
    sprite.label = "unit-sprite";
    expect(() => assertPostRoot(sprite)).toThrow(/post\[per-object-refused\]/);
    expect(() => assertPostRoot(sprite)).toThrow(/refused as a CLASS/);
    expect(() => assertPostRoot(sprite)).toThrow(/unit-sprite/); // the offender is named
  });

  it("writePostFilters writes to the root and refuses everywhere else", () => {
    const stage = new Container();
    const root = createPostRoot(stage);
    const intruder = new Container();
    const filter = new AdjustmentFilter({ gamma: 1 });
    writePostFilters(root, [filter]);
    expect(root.filters).toEqual([filter]);
    expect(() => writePostFilters(intruder, [filter])).toThrow(/post\[per-object-refused\]/);
    expect(intruder.filters ?? null).toBeNull(); // the illegal write never happened
  });

  it("createPixiPostHost fails FAST at wiring, not at first paint", () => {
    expect(() => createPixiPostHost(new Container())).toThrow(/post\[per-object-refused\]/);
  });
});

describe("createPixiFilterFactory — the closed vocabulary, materialised", () => {
  const factory = createPixiFilterFactory();

  it("haze = AdjustmentFilter with the Two-Channel sign-off intact by construction", () => {
    const { instance } = factory(parsed({ kind: "haze", contrast: 1.08 }));
    const filter = instance as AdjustmentFilter;
    expect(filter).toBeInstanceOf(AdjustmentFilter);
    expect(filter.contrast).toBe(1.08);
    // Saturation & channel multipliers were NEVER writable from the seam:
    expect(filter.saturation).toBe(1);
    expect(filter.red).toBe(1);
    expect(filter.green).toBe(1);
    expect(filter.blue).toBe(1);
    expect(filter.alpha).toBe(1);
  });

  it("confidence-blur = ONE whole-screen KawaseBlur, strength via the uniform law", () => {
    const { instance } = factory(parsed({ kind: "confidence-blur", confidence: 0.4 }));
    const filter = instance as KawaseBlurFilter;
    expect(filter).toBeInstanceOf(KawaseBlurFilter);
    expect(filter.strength).toBe(confidenceBlurStrength(0.4));
    expect(filter.clamp).toBe(true); // fullscreen dark-edge rule, vendor docs
  });

  it("grain = SimplexNoiseFilter shimmering on the SHARED heartbeat, never its own clock", () => {
    const handle = factory(parsed({ kind: "grain", strength: 0.12 }));
    const filter = handle.instance as SimplexNoiseFilter;
    expect(filter).toBeInstanceOf(SimplexNoiseFilter);
    expect(filter.strength).toBe(0.12);
    expect(handle.update).toBeDefined();
    handle.update?.(5000);
    expect(filter.offsetZ).toBe(heartbeatCount(5000)); // = floor(5000/2000) = 2
    handle.update?.(5999);
    expect(filter.offsetZ).toBe(2); // phase, not velocity — pure clock function
  });

  it("vignette = ColorOverlayFilter whose color can only be a ledger hex", () => {
    const { instance } = factory(parsed({ kind: "vignette", hue: "red", alpha: 0.35 }));
    const filter = instance as ColorOverlayFilter;
    expect(filter).toBeInstanceOf(ColorOverlayFilter);
    expect(Number(filter.color)).toBe(hueHex("red"));
    expect(filter.alpha).toBe(0.35);
  });
});

describe("vertical slice — law + writer together on one unmounted root", () => {
  it("real chain, real instances, refusal keeps the previous real chain", () => {
    const stage = new Container();
    const root = createPostRoot(stage);
    const chain = new PostChain({
      host: createPixiPostHost(root),
      factory: createPixiFilterFactory(),
      budget: new BudgetManager(),
    });

    expect(chain.apply({ kind: "confidence-blur", confidence: 0.5 }).applied).toBe(true);
    expect(root.filters?.[0]).toBeInstanceOf(KawaseBlurFilter);

    // Grain fights the same single overlay slot and loses — politely.
    const refused = chain.apply({ kind: "grain" });
    expect(refused.applied).toBe(false);
    expect(root.filters).toHaveLength(1); // previous chain KEPT
    expect(root.filters?.[0]).toBeInstanceOf(KawaseBlurFilter);

    // Vignette rides modal and stacks after the blur (fixed chain order).
    chain.apply({ kind: "vignette", hue: "gold" });
    const chain2 = root.filters ?? [];
    expect(chain2).toHaveLength(2);
    expect(chain2[0]).toBeInstanceOf(KawaseBlurFilter); // blur first …
    expect(chain2[1]).toBeInstanceOf(ColorOverlayFilter); // … vignette frames it

    chain.dispose();
    expect(root.filters).toEqual([]); // the screen is clean again
  });
});
