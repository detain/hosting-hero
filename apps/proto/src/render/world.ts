/**
 * WorldView — the controller joining compositor + camera rig + G1 scene +
 * observed store. All authority-free: it READS the latest projection each
 * frame and interpolates presentation; the only writes leaving this side of
 * the seam are discrete intents via `onIntent` (§3.1 renderer law) —
 * LANDED by L-B: the board-intent machine (render/boardIntent.ts +
 * chrome/BoardIntentHud.vue) mints door-shaped PlayerVerbs and hands every
 * one to the host through this exact hook.
 */
import { projection as projectionRef } from "../state/observedStore";
import { createCompositor, type Compositor } from "./compositor";
import { CameraRig, type Altitude } from "./camera";
import { BudgetManager, globalBudget } from "./budget";
import { G1Scene } from "./g1/g1Scene";
import { BoardIntentLayer } from "./boardPick";
import type { BoardIntentMachine, MintArgs } from "./boardIntent";
import type { ClockKind } from "@hh/sim-core/types";

export class WorldView {
  private compositor: Compositor | null = null;
  readonly rig: CameraRig;
  private scene: G1Scene | null = null;
  private boardLayer: BoardIntentLayer | null = null;
  private lastFrameAt = 0;
  private disposed = false;

  /** §3.1 renderer law, the one write seam: the bound client sends every
   *  minted PlayerVerb through here (SimClient.sendPlayerVerb shape); a
   *  null hook keeps the board a dark desk (nothing mints, honestly). */
  onIntent: ((args: MintArgs, clock: ClockKind) => void) | null = null;

  constructor(
    viewport: { width: number; height: number },
    private readonly budget: BudgetManager = globalBudget,
    private readonly board: BoardIntentMachine | null = null,
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
    if (this.board !== null) {
      this.board.setSink((args, clock) => this.onIntent?.(args, clock));
      this.boardLayer = new BoardIntentLayer(compositor, this.board);
    }
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
    this.boardLayer?.frame(cameraFrame.transform);

    const current = projectionRef.value;
    if (current !== null) scene.render(current, cameraFrame, dtMs, now);
    if (current !== null && this.board !== null) this.board.ingest(current);
    this.boardLayer?.render();
  }

  destroy(): void {
    this.disposed = true;
    this.boardLayer?.destroy();
    this.boardLayer = null;
    this.compositor?.destroy();
    this.compositor = null;
    this.scene = null;
  }
}
