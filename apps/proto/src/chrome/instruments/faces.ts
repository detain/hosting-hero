/**
 * Face component registry — the five SVG faces (§1.8). `FaceKind` lives HERE
 * (the runtime side); `registry.ts` type-imports it for the binding layer so
 * pure logic never pulls Vue components into headless graphs.
 */
import type { Component } from "vue";
import NeedleFace from "./NeedleFace.vue";
import BarFace from "./BarFace.vue";
import WaterlineFace from "./WaterlineFace.vue";
import ScopeFace from "./ScopeFace.vue";
import CounterFace from "./CounterFace.vue";

export type FaceKind = "needle" | "bar" | "waterline" | "scope" | "counter";

export const FACE_COMPONENTS: Readonly<Record<FaceKind, Component>> = {
  needle: NeedleFace,
  bar: BarFace,
  waterline: WaterlineFace,
  scope: ScopeFace,
  counter: CounterFace,
};

/** Resolution with the closed-enum guard: an unknown face is an authoring
 *  bug, fail loud at first paint rather than draw a blank bezel. */
export function faceComponent(kind: string): Component {
  const hit = (FACE_COMPONENTS as Record<string, Component | undefined>)[kind];
  if (hit === undefined) {
    throw new Error(`faceComponent: "${kind}" is not one of the five faces (${Object.keys(FACE_COMPONENTS).join("|")})`);
  }
  return hit;
}
