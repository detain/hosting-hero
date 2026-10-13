/**
 * ADR-0012 proto host-wiring proof: the SimCoreRunner's optional `recovery`
 * option arms the SAME engine the unattended weekend arms, and the story
 * reaches chrome through the witness accessors (recoveryState() /
 * recoveryNotices()) — deliberately NOT through the frozen SimProjection
 * wire, so zero protocol and zero golden churn either way.
 *
 * Seed 5 on the maze board is the pinned narrative (probe @cdb2bc5 tree):
 * the 1-slot origin struggles at m19 (EPISODE — no window yet), the shadow
 * window opens at m20, and the next struggle at m27 is INSIDE it, minting
 * the second-failure + safe-mode lock (§7.7's whole point). Origin's floor
 * equals its full posture (1 slot), so a lock there changes no serve view;
 * the edge (2 arms) and deep lane (4 arms) DO clamp when their windows open
 * — that is why the digests below diverge only after m45.
 */

import { describe, expect, it } from "vitest";
import { canonicalDigest } from "@hh/sim-core/replay";
import { defaultRecoveryConfig } from "@hh/sim-core/pipeline";
import { encodeProjection } from "../shared/protocol";
import { SimCoreRunner } from "../runner/index";

const RECOVERY = Object.freeze({ ...defaultRecoveryConfig(), struggleBounceThreshold: 1 });

/** Step a runner headlessly for n ticks, returning its final projection. */
function step(runner: SimCoreRunner, ticks: number) {
  let projection = runner.headlessStep(10);
  for (let i = 1; i < ticks; i += 1) projection = runner.headlessStep(10);
  return projection;
}

describe("SimCoreRunner recovery seam (ADR-0012)", () => {
  it("default OFF: no state slice, empty notice witness, frames byte-identical to the pre-recovery runner", () => {
    const plain = new SimCoreRunner({ seed: 5 });
    const plainDigests = stepAll(plain, 60);
    const unarmed = new SimCoreRunner({ seed: 5 }); // recovery key OMITTED (exactOptionalPropertyTypes) — second instance doubles as the cross-instance determinism arm
    const unarmedDigests = stepAll(unarmed, 60);
    expect(unarmedDigests).toEqual(plainDigests);
    expect(unarmed.recoveryState()).toBeUndefined();
    expect(unarmed.recoveryNotices()).toEqual([]);
  });

  it("armed seed 5: the episode→window→strike→lock→cleared story rides recoveryNotices()", () => {
    const runner = new SimCoreRunner({ seed: 5, recovery: RECOVERY });
    step(runner, 300);
    const notices = runner.recoveryNotices();
    expect(notices.map((n) => `${n.kind}:${n.nodeId}@${n.atMinute}`)).toEqual([
      "episode:origin@19",
      "window-opened:origin@20",
      "second-failure:origin@27",
      "lock-engaged:origin@27",
      "second-failure:origin@43",
      "lock-engaged:origin@43",
      "episode:deep@44",
      "episode:edge@44",
      "window-opened:deep@45",
      "window-opened:edge@47",
      "second-failure:edge@50",
      "lock-engaged:edge@50",
      "window-cleared:deep@58",
      "window-cleared:origin@68",
      "window-cleared:edge@75",
    ]);
    // Strike accounting: origin struck TWICE (m27, m43); the second-failure
    // notices carry strikes 1 then 2 (the same engine law the pipeline unit
    // suite pins at fold level — here proven THROUGH the host).
    const originStrikes = notices
      .filter((n) => n.kind === "second-failure" && n.nodeId === "origin")
      .map((n) => n.strikes);
    expect(originStrikes).toEqual([1, 2]);
    // Discrimination witness: the m19 struggle (no window) was an EPISODE;
    // the identical struggle at m27 (window live) was a SECOND-FAILURE.
    expect(notices[0]!.kind).toBe("episode");
    expect(notices[2]!.kind).toBe("second-failure");
    // Closed vocabulary + cause grammar on EVERY notice (host-side contract).
    for (const n of notices) {
      expect(n.causeId).toBe(`recovery:${n.kind}:${n.nodeId}:${n.atMinute}` as never);
      expect(["episode", "window-opened", "second-failure", "lock-engaged", "window-cleared"]).toContain(n.kind);
    }
  });

  it("recoveryState() shows the live window mid-run, then self-clears to undefined", () => {
    const runner = new SimCoreRunner({ seed: 5, recovery: RECOVERY });
    step(runner, 30); // inside origin's locked window (m27 lock, 12-min hold)
    const live = runner.recoveryState();
    expect(live).toBeDefined();
    const origin = live!.windows.get("origin" as never);
    expect(origin?.phase).toBe("locked");
    expect(origin?.strikes).toBe(1);
    expect(origin?.effectiveSlots).toBe(1);
    step(runner, 270); // m300: every window cleared by m75
    expect(runner.recoveryState()).toBeUndefined();
  });

  it("clamped arms are ground truth: armed frames diverge from unarmed after the multi-arm windows open", () => {
    const armed = new SimCoreRunner({ seed: 5, recovery: RECOVERY });
    const plain = new SimCoreRunner({ seed: 5 });
    const armedDigests = stepAll(armed, 90);
    const plainDigests = stepAll(plain, 90);
    // Pre-window (m1–18) identical; by m90 the deep/edge clamps have moved
    // real serves — the digest proves the throttle is not a printout.
    expect(armedDigests[10]).toBe(plainDigests[10]);
    expect(armedDigests[89]).not.toBe(plainDigests[89]);
  });
});

/** Step n ticks, collecting each frame's wire-surface digest (the same
 *  encodeProjection → canonicalDigest witness the determinism gate uses). */
function stepAll(runner: SimCoreRunner, ticks: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < ticks; i += 1) {
    out.push(canonicalDigest(encodeProjection(runner.headlessStep(10))));
  }
  return out;
}
