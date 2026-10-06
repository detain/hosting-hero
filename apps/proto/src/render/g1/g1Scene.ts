/**
 * G1 scene on the Pixi side (WebGL; excluded from headless tests).
 *
 * The one-lane smoke canvas: a dashed Intent outline marks the lane promise,
 * the Flow layer carries the mote field ADDITIVELY (spawned by the pure
 * `SmokeField` from LaneStats), the Substrate holds the muted rack plate +
 * node door, Attachments (patience rings on leading motes) ride at constant
 * px via `attachmentChildTransform`, and every ambient glow breathes on the
 * shared 0.5 Hz heartbeat. Event FX (bounce burst, amber-403 flash) must pass
 * the BudgetManager gate — refused FX collapse into a "+N" pip instead.
 */
import { Container, Graphics, Text } from "pixi.js";
import type { SimProjection } from "../../shared/protocol";
import { fixedToDisplay } from "../../shared/protocol";
import { asEntityId, observedKey, type ObservedKey } from "@hh/sim-core";
import type { Compositor } from "../compositor";
import type { CameraFrame } from "../camera";
import { attachmentChildTransform } from "../screenSpace";
import { heartbeatPulse, HEARTBEAT_PERIOD_MS } from "../heartbeat";
import { SmokeField, type Mote } from "./smokeField";
import { BudgetManager } from "../budget";
import { hueHex } from "../hues";

/** Lane geometry in WORLD units (the iso floor line ingress → node door). */
export const LANE_START = { x: -320, y: 40 } as const;
export const LANE_END = { x: 300, y: -30 } as const;

const LANE_ID = "lane/ingress-1";
const P99_KEY = observedKey(asEntityId("node/app-1"), "p99LatencyUs") as ObservedKey;

export class G1Scene {
  private readonly field = new SmokeField(0xc0ffee);
  private readonly moteLayer = new Graphics();
  private readonly fxLayer = new Graphics();
  private readonly dashLayer = new Graphics();
  private readonly plateLayer = new Graphics();
  private readonly attachmentLayer = new Container();
  private readonly clusterText: Text;
  private bouncePressure = 0.08;
  private lastNotices = 0;

  constructor(
    private readonly compositor: Compositor,
    private readonly budget: BudgetManager,
  ) {
    const { layers } = compositor;
    layers.substrate.addChild(this.plateLayer);
    layers.flow.addChild(this.moteLayer);
    layers.flow.addChild(this.fxLayer);
    layers.intent.addChild(this.dashLayer);
    layers.attachment.addChild(this.attachmentLayer);
    this.clusterText = new Text({
      text: "",
      style: { fontFamily: "monospace", fontSize: 14, fill: 0xffffff },
    });
    layers.annotation.addChild(this.clusterText);
    this.drawStatic();
  }

  /** One render frame. `wallMs` is presentation wall time (renderer carve-out). */
  render(projection: SimProjection, frame: CameraFrame, dtMs: number, wallMs: number): void {
    const lane = projection.lanes.find((l) => l.laneId === LANE_ID) ?? projection.lanes[0];
    if (lane === undefined) return;

    // Bounce pressure = 1 − health, read from the observed cell, not computed.
    const health = Math.max(0, Math.min(1, fixedToDisplay(lane.health)));
    this.bouncePressure = 0.04 + (1 - health) * 0.85;
    const smoke = this.field.step(dtMs, lane, this.bouncePressure);

    this.paintMotes(smoke.motes, health, wallMs);
    this.paintAttachments(smoke.motes, frame);
    this.paintFx(projection, smoke, wallMs);
    this.paintClusters();
  }

  /* ─────────────────────────── painting internals ─────────────────────────── */

  private drawStatic(): void {
    // Substrate: dead-dark plate under the lane + the node door block.
    this.plateLayer.rect(LANE_START.x - 40, LANE_START.y - 26, 720, 76).fill({ color: 0x10161f });
    this.plateLayer.rect(LANE_END.x - 10, LANE_END.y - 46, 96, 110).fill({ color: 0x151d29 });
    // Intent: white dashed lane promise — white/near-white ONLY, never lit.
    this.dashLane();
  }

  private dashLane(): void {
    const gapPx = 6;
    this.dashLayer.clear();
    const steps = 26;
    for (let i = 0; i < steps; i += 2) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      this.dashLayer.moveTo(LANE_START.x + (LANE_END.x - LANE_START.x) * t0, LANE_START.y + (LANE_END.y - LANE_START.y) * t0);
      this.dashLayer.lineTo(LANE_START.x + (LANE_END.x - LANE_START.x) * t1, LANE_START.y + (LANE_END.y - LANE_START.y) * t1);
    }
    this.dashLayer.stroke({ width: gapPx / 3, color: 0xffffff, alpha: 0.5 });
  }

  private paintMotes(motes: readonly Mote[], health: number, wallMs: number): void {
    const g = this.moteLayer;
    g.clear();
    for (const mote of motes) {
      const x = LANE_START.x + (LANE_END.x - LANE_START.x) * mote.t;
      const y = LANE_START.y + (LANE_END.y - LANE_START.y) * mote.t + mote.band * 18;
      // Flow emits as volume; hue stays neutral per district law — class is
      // the two-channel pair (speed already differs, tint reinforces).
      const color = mote.classOf === "express" ? 0x35e0e6 : 0x9fd8e8;
      const alpha = mote.state === "bouncing" ? 0.35 : 0.75 + heartbeatPulse(wallMs, mote.id % 8 / 8) * 0.2;
      g.circle(x, y, 2 + (1 - health) * 1.5).fill({ color, alpha });
    }
  }

  private paintAttachments(motes: readonly Mote[], frame: CameraFrame): void {
    // Patience rings only on the leading few motes (Z2+ rule: attachments are
    // sparse by budget, not by taste). Constant px via the per-anchor law.
    const leading = motes.filter((m) => m.state === "flowing" && m.t > 0.75).slice(0, 6);
    this.attachmentLayer.removeChildren().forEach((c) => c.destroy());
    for (const mote of leading) {
      const worldPos = {
        x: LANE_START.x + (LANE_END.x - LANE_START.x) * mote.t,
        y: LANE_START.y + (LANE_END.y - LANE_START.y) * mote.t,
      };
      const ring = new Graphics();
      const c = attachmentChildTransform(worldPos, frame.transform);
      ring.circle(0, 0, 7).stroke({ width: 1.5, color: 0xffffff, alpha: 0.85 });
      ring.position.set(c.x, c.y);
      ring.scale.set(c.scale);
      this.attachmentLayer.addChild(ring);
    }
  }

  private paintFx(projection: SimProjection, smoke: { bouncedAway: number }, wallMs: number): void {
    if (projection.seq === this.lastNotices) return;
    this.lastNotices = projection.seq;
    const fxWanted = smoke.bouncedAway > 0 ? "bounce" : projection.notices.some((n) => n.kind === "false-positive") ? "false-positive" : null;
    if (fxWanted === null) return;
    const verdict = this.budget.admit({
      id: `fx:${fxWanted}:${Math.floor(wallMs / HEARTBEAT_PERIOD_MS)}`,
      category: "eventFx",
      priority: fxWanted === "bounce" ? 60 : 45,
      region: "lane-1",
    });
    if (!verdict.admitted) return; // refusal already clustered
    const g = this.fxLayer;
    if (fxWanted === "bounce") {
      g.circle(LANE_END.x - 30, LANE_END.y, 18).fill({ color: 0xffffff, alpha: 0.12 });
    } else {
      g.rect(LANE_END.x - 12, LANE_END.y - 40, 24, 12).fill({ color: hueHex("amber"), alpha: 0.3 });
    }
  }

  private paintClusters(): void {
    const snap = this.budget.snapshot();
    const parts: string[] = [];
    for (const [clusterId, count] of Object.entries(snap.clusters)) {
      if (count > 0) parts.push(`${clusterId.split(":")[0]} +${count}`);
    }
    this.clusterText.text = parts.join("   ");
    this.clusterText.position.set(16, 16); // annotation layer is screen space
  }

  /** Fog demo: expose whether the p99 cell is unknown (chrome reads this too —
   *  ONE source for canvas and DOM). */
  p99Unknown(projection: SimProjection): boolean {
    return projection.observed.get(P99_KEY)?.value === null;
  }
}
