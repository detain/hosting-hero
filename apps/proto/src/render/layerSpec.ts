/**
 * Layer & compositing spec — the five-layer law as DATA (§4.7 item 1.1:
 * "hard non-blending boundaries … never let a concept live in two layers").
 * The Pixi compositor builds containers from this table; the test asserts the
 * order and blend contract without WebGL.
 */

export const LAYER_ORDER = ["substrate", "flow", "intent", "attachment", "annotation"] as const;
export type LayerName = (typeof LAYER_ORDER)[number];

/** Pixi v8 blend-mode name per layer, matching the multi-pass contract:
 *  Substrate normal (+practical lighting later) · Flow additive-emissive ·
 *  Intent plain alpha (white-only dashes) · Attachment overlay pass that
 *  carries the zoom-compensation matrix · Annotation flat screen-space top. */
export const LAYER_BLEND: Readonly<Record<LayerName, "normal" | "add">> = {
  substrate: "normal",
  flow: "add",
  intent: "normal",
  attachment: "normal",
  annotation: "normal",
};

/** Which layers live under the camera transform (world-space) vs pinned to
 *  screen space. Attachment is special: its CHILDREN are positioned in world
 *  space but the layer re-applies W⁻¹ so authored px stay px (screenSpace.ts). */
export const WORLD_TRANSFORMED_LAYERS: readonly LayerName[] = ["substrate", "flow", "intent"];
export const SCREEN_PINNED_LAYERS: readonly LayerName[] = ["annotation"];

/** Emissive allowance per layer (§1.1: Intent/Annotation never emit; Flow
 *  emits as volume; Substrate points+rims ≤2% screen). */
export const LAYER_EMISSIVE: Readonly<Record<LayerName, "volume" | "capped-2pct" | "never">> = {
  substrate: "capped-2pct",
  flow: "volume",
  intent: "never",
  attachment: "never",
  annotation: "never",
};

export function layerIndex(layer: LayerName): number {
  return LAYER_ORDER.indexOf(layer);
}
