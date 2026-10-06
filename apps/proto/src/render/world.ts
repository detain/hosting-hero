/**
 * WorldView — the controller joining compositor + camera rig + G1 scene +
 * observed store. All authority-free: it READS the latest projection each
 * frame and interpolates presentation; the only writes leaving this side of
 * the seam are discrete intents via `onIntent` (§3.1 renderer law).
 */
import { projection as projectionRef } from "../state/observedStore";
import { createCompositor, type Compositor } from "./compositor";
import { CameraRig, type Altitude } from "./camera";
import { BudgetManager, globalBudget } from "./budget";
import { G1Scene } from "./g1/g1Scene";

export class WorldView {
  private compositor: Compositor | null = null;
  readonly rig: CameraRig;
  private scene: G1Scene | null = null;
  private lastFrameAt = 0;
  private disposed = false;

  constructor(
    viewport: { width: number; height: number },
    private readonly budget: BudgetManager = globalBudget,
  ) {
    this.rig = new CameraRig(viewport);
  }

  async mount(host: HTMLElement): Promise<void> {
    const compositor = await createCompositor(host);
    if (this.disposed) {
      compositor.destroy();
      return;
    }
    this.compositor = compositor;
    this.scene = new G1Scene(compositor, this.budget);
    compositor.applyFrame(this.rig.frame);
    this.lastFrameAt = performance.now();
    compositor.app.ticker.add(() => this.frame());
  }

  goAltitude(altitude: Altitude): void {
    this.rig.go(altitude, performance.now());
  }

  /** Hover/select hand-off from the DOM layer: selection persists across the
   *  camera flight (law enforced inside CameraRig). */
  selectAt(worldX: number, worldY: number): void {
    this.rig.select({ x: worldX, y: worldY });
  }

  private frame(): void {
    const compositor = this.compositor;
    const scene = this.scene;
    if (compositor === null || scene === null) return;
    const now = performance.now(); // wall clock — display-only, renderer carve-out
    const dtMs = Math.min(100, now - this.lastFrameAt);
    this.lastFrameAt = now;

    const cameraFrame = this.rig.tick(now);
    compositor.applyFrame(cameraFrame);

    const current = projectionRef.value;
    if (current !== null) scene.render(current, cameraFrame, dtMs, now);
  }

  destroy(): void {
    this.disposed = true;
    this.compositor?.destroy();
    this.compositor = null;
    this.scene = null;
  }
}
