/**
 * render · boardPick — the Pixi hands of the board-intent law (L-B).
 *
 * All DOM-free pointer machinery lives on this thin side of the seam: plates
 * and ports are labeled Containers whose pointer events feed the PURE
 * BoardIntentMachine (boardIntent.ts owns every decision), and each frame
 * the layer re-reads the machine's snapshot version and redraws the wire
 * ledger. The board is code-drawn vector Graphics, so hit-testing rides the
 * containers' own hitAreas — never a pixel lookup — and the screen→world
 * math is the law-tested screenToWorld, fed by the live camera transform.
 *
 * Grammar (mirrors gates/g4, the proven UI):
 *  · non-wiring: plate pointerdown opens the configure menu.
 *  · wiring (W or the HUD button): port pointerdown DRAGS a cable; release
 *    over a port attempts the connect, release over nothing cancels and
 *    mints nothing. Click-to-link lives on the keyboard rail (g4 chose W +
 *    button over TAB for mode entry so TAB stays focus navigation — same
 *    reasoning here: ports are reached by TAB through the HUD rail, not by
 *    TAB through the canvas).
 *
 * Canvas colors: relation hues come from the ledger (hueHex); the structural
 * plate fill is a raw neutral exactly as g1Scene's motes are (canvas pool,
 * no semantic job). DOM chrome (BoardIntentHud) carries the var(--hh-hue-*)
 * discipline.
 */
import { Circle, Container, Graphics, Rectangle, type FederatedPointerEvent } from "pixi.js";
import type { Compositor } from "./compositor";
import { screenToWorld, type WorldTransform } from "./screenSpace";
import { hueHex } from "./hues";
import {
  BOARD_PORTS,
  BOARD_PLATES,
  PLATE_H,
  PLATE_W,
  PORT_R,
  RELATION_HUES,
  benchPlate,
  type BoardIntentMachine,
} from "./boardIntent";

const PLATE_FILL = 0x161d28; // raw neutral canvas structural fill (no ledger job)
const LEDGER_REFRESH = 0x1f2a3a;

export class BoardIntentLayer {
  private readonly plateRoot = new Container();
  private readonly cableRoot = new Graphics();
  private readonly portRoot = new Container();
  private readonly previewRoot = new Graphics();
  private readonly plates: { node: Container; g: Graphics; nodeId: string }[] = [];
  private readonly portNodes: { node: Container; g: Graphics; portId: string }[] = [];
  private transform: WorldTransform | null = null;
  private lastVersion = -1;
  private lastRosterSize = -1;
  private destroyed = false;

  constructor(
    private readonly compositor: Compositor,
    private readonly machine: BoardIntentMachine,
  ) {
    const { layers, app } = compositor;
    layers.substrate.addChild(this.plateRoot);
    layers.flow.addChild(this.cableRoot);
    layers.intent.addChild(this.previewRoot, this.portRoot);

    for (const plate of BOARD_PLATES) {
      const g = new Graphics();
      const node = new Container();
      node.position.set(plate.cx, plate.cy);
      node.addChild(g);
      node.eventMode = "static";
      node.cursor = "pointer";
      node.hitArea = new Rectangle(-plate.w / 2, -plate.h / 2, plate.w, plate.h);
      node.on("pointerdown", () => {
        if (!this.machine.wiring) this.machine.tapNode(plate.nodeId);
      });
      this.plateRoot.addChild(node);
      this.plates.push({ node, g, nodeId: plate.nodeId });
    }

    for (const port of BOARD_PORTS) {
      const g = new Graphics();
      const node = new Container();
      node.position.set(port.x, port.y);
      node.addChild(g);
      node.eventMode = "static";
      node.cursor = "crosshair";
      node.hitArea = new Circle(0, 0, PORT_R);
      node.on("pointerdown", () => this.machine.dragStart(port.portId));
      node.on("pointerup", () => this.machine.dragEnd(port.portId));
      this.portRoot.addChild(node);
      this.portNodes.push({ node, g, portId: port.portId });
    }

    app.stage.eventMode = "static";
    app.stage.hitArea = app.screen;
    app.stage.on("pointermove", this.onStageMove);
    app.stage.on("pointerup", this.onStageUp);
  }

  /** The frame's world transform (the rig's, applied this frame) so pointer
   *  coordinates can cross into world space through the law-tested math. */
  frame(transform: WorldTransform): void {
    this.transform = transform;
  }

  private onStageMove = (event: FederatedPointerEvent): void => {
    const world = this.toWorld(event);
    if (world !== null) this.machine.dragMove(world);
  };

  private onStageUp = (): void => {
    // Bubbles after a port's own pointerup (Pixi dispatches target→stage);
    // dragEnd is self-guarded, so a cable drop never double-resolves.
    this.machine.dragEnd(null);
  };

  private toWorld(event: FederatedPointerEvent): { x: number; y: number } | null {
    if (this.transform === null) return null;
    return screenToWorld(this.transform, { x: event.global.x, y: event.global.y });
  }

  /** Redraw on the machine's version clock — the pure module is the single
   *  authority on WHAT moved; this side only decides how it looks. */
  render(): void {
    if (this.destroyed) return;
    const version = this.machine.version;
    if (version === this.lastVersion) return;
    this.lastVersion = version;
    this.drawPlates();
    this.drawPorts();
    this.drawCables();
    this.drawPreview();
  }

  private drawPlates(): void {
    // Placed devices join the roster: rebuild plate set when it grows.
    if (this.machine.roster.size !== this.lastRosterSize) {
      this.lastRosterSize = this.machine.roster.size;
      for (const nodeId of this.machine.sortedNodes()) {
        if (nodeId.startsWith("bench-") && !this.plates.some((p) => p.nodeId === nodeId)) {
          const plate = benchPlate(Number(nodeId.slice("bench-".length)));
          const g = new Graphics();
          const node = new Container();
          node.position.set(plate.cx, plate.cy);
          node.addChild(g);
          this.plateRoot.addChild(node);
          this.plates.push({ node, g, nodeId });
        }
      }
    }
    for (const { g, nodeId } of this.plates) {
      const authored = !nodeId.startsWith("bench-");
      const menu = this.machine.menuNode === nodeId;
      const armed = authored && this.machine.defenseOn(nodeId);
      g.clear()
        .rect(-PLATE_W / 2, -PLATE_H / 2, PLATE_W, PLATE_H)
        .fill({ color: PLATE_FILL })
        .stroke({
          width: menu ? 3 : 1.5,
          color: menu ? hueHex("gold") : armed ? hueHex("amber") : hueHex("grey"),
        });
    }
  }

  private drawPorts(): void {
    const port = PORT_R;
    for (const { g, portId } of this.portNodes) {
      const meta = BOARD_PORTS.find((p) => p.portId === portId);
      if (meta === undefined) continue;
      const color = hueHex(RELATION_HUES[meta.relation]);
      const armed = this.machine.armedPort === portId;
      const targetable = this.machine.wiring && this.machine.armedPort !== null && !armed;
      g.clear();
      // R32 shape-is-fact, canvas primitives (the DOM rail renders the
      // verbatim PORT_GLYPHS paths): data trapezoid, power square, control
      // circle, trust slot-rect.
      if (meta.relation === "data") {
        g.poly([-8, -6, 8, -6, 5, 6, -5, 6]).fill({ color });
      } else if (meta.relation === "power") {
        g.rect(-7, -7, 14, 14).fill({ color });
      } else if (meta.relation === "control") {
        g.circle(0, 0, 7).fill({ color });
      } else {
        g.rect(-9, -4, 18, 8).fill({ color });
      }
      if (armed) g.circle(0, 0, port).stroke({ width: 2, color: hueHex("white") });
      if (targetable) g.circle(0, 0, port).stroke({ width: 1.5, color: hueHex("green") });
    }
  }

  private drawCables(): void {
    const g = this.cableRoot;
    g.clear();
    for (const edge of this.machine.sortedEdges()) {
      const fromPort = BOARD_PORTS.find((p) => p.portId === `${edge.from}#${edge.relation}`);
      const toPort = BOARD_PORTS.find((p) => p.portId === `${edge.to}#${edge.relation}`);
      const color = hueHex(RELATION_HUES[edge.relation]);
      if (fromPort === undefined || toPort === undefined) continue; // fog: rule-cable between ghosts
      g.moveTo(fromPort.x, fromPort.y).lineTo(toPort.x, toPort.y).stroke({ width: 2, color });
    }
  }

  private drawPreview(): void {
    const g = this.previewRoot;
    g.clear();
    const armed = this.machine.armedPort;
    const point = this.machine.dragPoint;
    if (armed === null || point === null) return;
    const meta = BOARD_PORTS.find((p) => p.portId === armed);
    if (meta === undefined) return;
    g.moveTo(meta.x, meta.y).lineTo(point.x, point.y).stroke({ width: 1.5, color: hueHex("white") });
    g.circle(point.x, point.y, 4).stroke({ width: 1, color: LEDGER_REFRESH });
  }

  destroy(): void {
    this.destroyed = true;
    const app = this.compositor.app;
    app.stage.off("pointermove", this.onStageMove);
    app.stage.off("pointerup", this.onStageUp);
    this.plateRoot.destroy({ children: true });
    this.portRoot.destroy({ children: true });
    this.cableRoot.destroy();
    this.previewRoot.destroy();
  }
}
