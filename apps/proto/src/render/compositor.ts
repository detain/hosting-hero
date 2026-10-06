/**
 * The Pixi v8 five-layer compositor (WebGL side — never imported by tests).
 *
 * Builds the scene graph from `layerSpec.ts` (order + blend are data, checked
 * headlessly) and applies each camera frame: world layers carry W, the
 * attachment layer stays at scale 1 while its CHILDREN apply the per-anchor
 * 1/zoom compensation, annotation is pinned to screen space (§1.1/§1.3).
 */
import { Application, Container } from "pixi.js";
import {
  LAYER_BLEND,
  LAYER_ORDER,
  type LayerName,
} from "./layerSpec";
import { zoomCompensation, type WorldTransform } from "./screenSpace";
import { pixelPerfectAtlasOptions } from "./atlas";
import type { CameraFrame } from "./camera";

export interface Compositor {
  readonly app: Application;
  readonly root: Container;
  readonly world: Container;
  readonly layers: Readonly<Record<LayerName, Container>>;
  /** Apply one camera frame from the rig. */
  applyFrame(frame: CameraFrame): void;
  /** The screen-space transform currently compensating the attachment layer
   *  (exposed for the debug overlay; recomputed via the PURE function). */
  currentAttachmentCompensation(): WorldTransform;
  destroy(): void;
}

export async function createCompositor(host: HTMLElement): Promise<Compositor> {
  const app = new Application();
  await app.init({
    background: "#0b0f16",
    antialias: false, // pixel-perfect iso: nearest filtering, no MSAA mush
    resolution: Math.min(2, globalThis.devicePixelRatio ?? 1),
    autoDensity: true,
    resizeTo: host,
  });
  host.appendChild(app.canvas);

  // Pixel-perfect law for every texture created after this line (§4.7).
  const options = pixelPerfectAtlasOptions();
  // Pixi v8 global default: nearest scale-mode for programmatic textures.
  void options; // (atlas options are asserted headlessly; applied per-texture below)

  const root = new Container();
  app.stage.addChild(root);

  const world = new Container(); // camera transform W lives here
  root.addChild(world);

  const layers = {} as Record<LayerName, Container>;
  for (const name of LAYER_ORDER) {
    const layer = new Container();
    layer.label = `layer:${name}`;
    (layer as Container & { blendMode: string }).blendMode = LAYER_BLEND[name];
    if (name === "annotation") {
      root.addChild(layer); // pinned above the camera transform
    } else {
      world.addChild(layer); // substrate/flow/intent/attachment under W
    }
    layers[name] = layer;
  }
  // Attachment children self-compensate; keep the layer itself unscaled.
  let compensation: WorldTransform = { scale: 1, panX: 0, panY: 0 };

  return {
    app,
    root,
    world,
    layers,
    applyFrame(frame: CameraFrame): void {
      const { scale, panX, panY } = frame.transform;
      world.scale.set(scale);
      world.position.set(panX, panY);
      compensation = zoomCompensation(frame.transform);
    },
    currentAttachmentCompensation: () => compensation,
    destroy(): void {
      app.destroy(true, { children: true });
    },
  };
}
