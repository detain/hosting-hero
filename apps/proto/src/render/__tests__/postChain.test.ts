/**
 * ADR-0008 post-chain admission law — node-env, pixi-free (the codebase
 * pattern: logic modules test without WebGL; writer.jsdom.test.ts covers
 * the real instances).
 *
 * Covers every branch of the wrapper law: closed vocabulary, budget
 * admit/refuse/keep-previous, hue honesty, two-channel survival, the
 * frame-loop tick fan, and the confidence-uniform mapping.
 */
import { describe, expect, it } from "vitest";
import { BudgetManager, KLAXON_PRIORITY } from "../budget";
import {
  confidenceBlurStrength,
  CONFIDENCE_BLUR_MAX_STRENGTH,
  CONFIDENCE_BLUR_MIN_STRENGTH,
  parsePostEffect,
  POST_BUDGET_CATEGORY,
  POST_EFFECT_KINDS,
  POST_PRIORITY,
  PostChain,
  postId,
  type ParsedPostEffect,
  type PostEffectRequest,
  type PostFilterHandle,
  type PostHost,
} from "../post/postChain";

interface FakeWrite {
  readonly kinds: readonly string[];
}

function makeHarness() {
  const writes: FakeWrite[] = [];
  const built: ParsedPostEffect[] = [];
  const updated: number[] = [];
  const host: PostHost = {
    setPostFilters(handles) {
      writes.push({ kinds: handles.map((h) => (h.instance as { kind: string }).kind) });
    },
  };
  const chain = new PostChain({
    host,
    budget: new BudgetManager(),
    factory(effect) {
      built.push(effect);
      const handle: PostFilterHandle = {
        instance: { kind: effect.kind, effect },
        ...(effect.kind === "grain"
          ? {
              update: (wallMs: number) => {
                updated.push(wallMs);
              },
            }
          : {}),
      };
      return handle;
    },
  });
  return { chain, writes, built, updated };
}

const forge = (request: unknown): PostEffectRequest => request as PostEffectRequest;

describe("parsePostEffect — the closed vocabulary", () => {
  it("fills identity defaults (zero-taste law: nothing ratified)", () => {
    expect(parsePostEffect({ kind: "haze" })).toEqual({
      kind: "haze",
      gamma: 1,
      contrast: 1,
      brightness: 1,
    });
    expect(parsePostEffect({ kind: "grain" })).toEqual({ kind: "grain", strength: 0.5, noiseScale: 10 });
    expect(parsePostEffect({ kind: "vignette", hue: "red" })).toEqual({
      kind: "vignette",
      hue: "red",
      alpha: 1,
    });
  });

  it("rejects effects outside the admitted set, naming the vocabulary", () => {
    expect(() => parsePostEffect(forge({ kind: "chromatic-aberration" }))).toThrow(
      /post\[unknown-kind\].*haze, confidence-blur, grain, vignette/,
    );
  });

  it("rejects unknown keys per kind grammar", () => {
    expect(() => parsePostEffect(forge({ kind: "grain", radius: 3 }))).toThrow(
      /post\[unknown-key\].*radius/,
    );
  });

  it("haze channel keys hit the TWO-CHANNEL law before the generic wall", () => {
    for (const key of ["saturation", "red", "green", "blue", "alpha"] as const) {
      expect(() => parsePostEffect(forge({ kind: "haze", [key]: 0.2 }))).toThrow(
        /post\[two-channel\].*luma-desaturation shortcut/,
      );
    }
  });

  it("vignette hues come ONLY from the ledger (admit()'s honesty, extended)", () => {
    expect(() => parsePostEffect(forge({ kind: "vignette", hue: "hot-pink" }))).toThrow(
      /post\[ledger-hue\].*Hue Ledger/,
    );
    expect(() => parsePostEffect(forge({ kind: "vignette", hue: 0xff0055 }))).toThrow(
      /post\[ledger-hue\]/,
    );
  });

  it("value domains fail fast with named codes", () => {
    expect(() => parsePostEffect(forge({ kind: "confidence-blur", confidence: 1.5 }))).toThrow(
      /post\[domain\].*\[0, 1\]/,
    );
    expect(() => parsePostEffect(forge({ kind: "confidence-blur", confidence: Number.NaN }))).toThrow(
      /post\[bad-value\]/,
    );
    expect(() => parsePostEffect(forge({ kind: "haze", gamma: Number.POSITIVE_INFINITY }))).toThrow(
      /post\[bad-value\].*haze\.gamma/,
    );
  });
});

describe("confidenceBlurStrength — the uniform mapping (correctness note as code)", () => {
  it("full confidence is barely-there, zero confidence is max blur", () => {
    expect(confidenceBlurStrength(1)).toBe(CONFIDENCE_BLUR_MIN_STRENGTH);
    expect(confidenceBlurStrength(0)).toBe(CONFIDENCE_BLUR_MAX_STRENGTH);
  });

  it("monotone decreasing in confidence", () => {
    expect(confidenceBlurStrength(0.25)).toBeGreaterThan(confidenceBlurStrength(0.5));
    expect(confidenceBlurStrength(0.5)).toBeGreaterThan(confidenceBlurStrength(0.75));
  });

  it("out-of-domain coverage throws before any mapping", () => {
    expect(() => confidenceBlurStrength(-0.001)).toThrow(/post\[domain\]/);
  });
});

describe("PostChain — budget admission, refusal keeps previous (never silent)", () => {
  it("admits the first overlay effect and writes the chain once", () => {
    const { chain, writes } = makeHarness();
    const result = chain.apply({ kind: "haze", contrast: 1.1 });
    expect(result.applied).toBe(true);
    expect(writes).toEqual([{ kinds: ["haze"] }]);
  });

  it("atmospheric effects compete for the ONE overlay slot; refusal keeps the chain", () => {
    const { chain, writes } = makeHarness();
    chain.apply({ kind: "haze" });
    const refused = chain.apply({ kind: "grain" });
    expect(refused).toEqual({
      applied: false,
      reason: "budget-refused",
      refusal: "category-budget",
      clusterId: "overlay:global",
      kept: ["haze"],
    });
    // Previous chain untouched — the host saw exactly ONE write ever.
    expect(writes).toEqual([{ kinds: ["haze"] }]);
    // And the refusal is VISIBLE: the budget clusters it as "+N".
    if (refused.applied === false) {
      expect(refused.clusterId).toBe("overlay:global");
    }
  });

  it("the vignette lives in modal and coexists with one overlay effect", () => {
    const { chain, writes } = makeHarness();
    chain.apply({ kind: "haze" });
    expect(chain.apply({ kind: "vignette", hue: "gold" }).applied).toBe(true);
    expect(writes[writes.length - 1]).toEqual({ kinds: ["haze", "vignette"] });
    expect(chain.chainKinds()).toEqual(["haze", "vignette"]);
  });

  it("re-applying a live kind refreshes its params without double-claiming", () => {
    const { chain, built, writes } = makeHarness();
    chain.apply({ kind: "haze", contrast: 1.1 });
    chain.apply({ kind: "haze", contrast: 1.4 });
    expect(writes.length).toBe(2); // chain rebuilt…
    const effects = chain.chainEffects();
    expect(effects).toHaveLength(1); // …but only one slot held
    expect(effects[0]).toMatchObject({ kind: "haze", contrast: 1.4 });
    expect(built.length).toBe(2); // fresh instance per rebuild (replace-not-mutate)
  });

  it("release frees the slot for the next atmosphere effect", () => {
    const { chain, writes } = makeHarness();
    chain.apply({ kind: "haze" });
    expect(chain.release("haze")).toBe(true);
    expect(chain.release("haze")).toBe(false); // idempotent teardown, no throw
    expect(chain.apply({ kind: "grain" }).applied).toBe(true);
    expect(writes[writes.length - 1]).toEqual({ kinds: ["grain"] });
  });

  it("chain order is the fixed POST_EFFECT_KINDS order, not insertion order", () => {
    const { chain } = makeHarness();
    chain.apply({ kind: "vignette", hue: "azure" });
    chain.apply({ kind: "confidence-blur", confidence: 0.4 });
    expect(chain.chainKinds()).toEqual(["confidence-blur", "vignette"]);
    expect([...chain.chainKinds()]).toEqual(
      POST_EFFECT_KINDS.filter((k) => k === "confidence-blur" || k === "vignette"),
    );
  });

  it("a parse failure claims NOTHING (no leaked budget on bad requests)", () => {
    const { chain, writes } = makeHarness();
    expect(() => chain.apply(forge({ kind: "vignette", hue: "chartreuse" }))).toThrow(
      /post\[ledger-hue\]/,
    );
    expect(writes.length).toBe(0);
    expect(chain.apply({ kind: "haze" }).applied).toBe(true); // slot was never eaten
  });

  it("dispose releases every claim, clears the screen, and closes the chain", () => {
    const { chain, writes } = makeHarness();
    chain.apply({ kind: "haze" });
    chain.apply({ kind: "vignette", hue: "red" });
    chain.dispose();
    expect(writes[writes.length - 1]).toEqual({ kinds: [] });
    expect(chain.chainKinds()).toEqual([]);
    expect(() => chain.apply({ kind: "grain" })).toThrow(/post\[disposed\]/);
    // Claims are truly gone: a fresh chain reclaims the same ids cleanly.
    const fresh = makeHarness();
    expect(fresh.chain.apply({ kind: "haze" }).applied).toBe(true);
  });

  it("budget claims use the documented category table", () => {
    const { chain } = makeHarness();
    chain.apply({ kind: "confidence-blur", confidence: 0.9 });
    chain.apply({ kind: "vignette", hue: "grey" });
    // Two kinds from different categories, both live, caps respected:
    expect(POST_BUDGET_CATEGORY["confidence-blur"]).toBe("overlay");
    expect(POST_BUDGET_CATEGORY["vignette"]).toBe("modal");
    expect(chain.chainKinds()).toEqual(["confidence-blur", "vignette"]);
  });
});

describe("post priorities — atmosphere never screams (wrapper law consequence)", () => {
  it("every effect priority is below KLAXON_PRIORITY, so refusal is the only contention", () => {
    for (const kind of POST_EFFECT_KINDS) {
      expect(POST_PRIORITY[kind]).toBeLessThan(KLAXON_PRIORITY);
      expect(POST_PRIORITY[kind]).toBeGreaterThan(0);
      expect(postId(kind)).toBe(`post:${kind}`);
    }
  });
});

describe("PostChain.tick — the compositor frame loop is the ONLY clock", () => {
  it("fans wallMs to handles that update (grain), skips the rest", () => {
    const { chain, updated } = makeHarness();
    chain.apply({ kind: "haze" }); // no update seam on haze
    chain.tick(1234);
    expect(updated).toEqual([]);
    chain.release("haze");
    chain.apply({ kind: "grain" });
    chain.tick(2500);
    chain.tick(5000);
    expect(updated).toEqual([2500, 5000]);
  });

  it("a bad clock throws, it never silently animates", () => {
    const { chain } = makeHarness();
    chain.apply({ kind: "grain" });
    expect(() => chain.tick(Number.NaN)).toThrow(/post\[bad-clock\]/);
    expect(() => chain.tick(-1)).toThrow(/post\[bad-clock\]/);
  });
});
