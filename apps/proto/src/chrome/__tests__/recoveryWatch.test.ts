/**
 * RecoveryWatch law tests (node env): the chrome mirror drift-pins against
 * the engine source, the cause parser is strict at the boundary, the ramp
 * arithmetic fails loud on corrupt records, the voices stand behind a pack
 * that provably has no key today, and the whole five-kind episode plays out
 * on a real armed SimCoreRunner — structural sequence pins, so a sibling
 * timing shift re-audits loudly instead of passing silently.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { asCauseId, asEntityId } from "@hh/sim-core";
import { defaultRecoveryConfig } from "@hh/sim-core/pipeline";
import type { RecoveryNotice } from "@hh/sim-core/pipeline";
import type { RecoveryState, RecoveryWindowPhase, RecoveryWindowRecord } from "@hh/sim-core/types";
import { SimCoreRunner } from "../../runner/simCoreRunner";
import { hasKey } from "../../i18n/packStore";
import {
  RECOVERY_PHASE_VIEWS,
  RECOVERY_WATCH_KINDS,
  RECOVERY_WATCH_PHASES,
  RECOVERY_WATCH_VOICES,
  buildRecoveryRows,
  buildRecoveryTape,
  minutesInWindow,
  parseRecoveryCause,
  phaseView,
  rampFloorPct,
  recoveryVoice,
} from "../recoveryWatch";

const engineRecovery = readFileSync(
  fileURLToPath(new URL("../../../../../packages/sim-core/src/pipeline/recovery.ts", import.meta.url)),
  "utf8",
);
const engineTypes = readFileSync(
  fileURLToPath(new URL("../../../../../packages/sim-core/src/types.ts", import.meta.url)),
  "utf8",
);

type RecordSeed = {
  nodeId: string;
  phase?: RecoveryWindowPhase;
  openedAtMinute?: number;
  closesAtMinute?: number;
  lockUntilMinute?: number;
  strikes?: number;
  fullSlots?: number;
  effectiveSlots?: number;
};

const record = (over: RecordSeed): RecoveryWindowRecord =>
  Object.freeze({
    nodeId: asEntityId(over.nodeId),
    phase: over.phase ?? "window",
    openedAtMinute: over.openedAtMinute ?? 10,
    closesAtMinute: over.closesAtMinute ?? 22,
    lockUntilMinute: over.lockUntilMinute ?? 0,
    strikes: over.strikes ?? 0,
    fullSlots: over.fullSlots ?? 2,
    effectiveSlots: over.effectiveSlots ?? 1,
  });

type NoticeSeed = {
  kind: string;
  nodeId: string;
  atMinute: number;
  strikes?: number;
  effectiveSlots?: number;
  causeId?: string;
};

const notice = (over: NoticeSeed): RecoveryNotice =>
  Object.freeze({
    kind: over.kind as RecoveryNotice["kind"],
    nodeId: asEntityId(over.nodeId),
    atMinute: over.atMinute,
    strikes: over.strikes ?? 0,
    effectiveSlots: over.effectiveSlots ?? 1,
    causeId: asCauseId(over.causeId ?? `recovery:${over.kind}:${over.nodeId}:${over.atMinute}`),
  });

/* ─────────────────────────── mirror drift pins ─────────────────────────── */

describe("recoveryWatch mirrors the engine (drift pins)", () => {
  it("the five kinds equal the engine's frozen literal", () => {
    const m = engineRecovery.match(
      /RECOVERY_NOTICE_KINDS[^=]*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/,
    );
    if (m === null || m[1] === undefined) throw new Error("engine RECOVERY_NOTICE_KINDS literal lost");
    const engine = [...m[1].matchAll(/"([^"]+)"/g)].map((s) => s[1]!);
    expect(RECOVERY_WATCH_KINDS).toStrictEqual(engine);
  });

  it("the phase mirror equals the types.ts union", () => {
    const line = engineTypes.match(/export type RecoveryWindowPhase = ([^;]+);/);
    if (line === null || line[1] === undefined) throw new Error("engine RecoveryWindowPhase union lost");
    const engine = [...line[1].matchAll(/"([^"]+)"/g)].map((s) => s[1]!);
    expect(RECOVERY_WATCH_PHASES).toStrictEqual(engine);
  });

  it("the phase views cover exactly the mirrored phases", () => {
    expect(Object.keys(RECOVERY_PHASE_VIEWS)).toStrictEqual([...RECOVERY_WATCH_PHASES]);
  });

  it("the voice table keys are exactly the five kinds (no orphan, no gap)", () => {
    expect(Object.keys(RECOVERY_WATCH_VOICES)).toStrictEqual([...RECOVERY_WATCH_KINDS]);
  });
});

/* ─────────────────────────── boundary parsing ─────────────────────────── */

describe("parseRecoveryCause", () => {
  it("parses the engine grammar", () => {
    expect(parseRecoveryCause("recovery:second-failure:edge:53")).toStrictEqual({
      kind: "second-failure",
      nodeId: "edge",
      minute: 53,
    });
  });

  it("refuses off-grammar and off-vocabulary causes", () => {
    expect(parseRecoveryCause("economy:death:imminent:x:1")).toBeNull(); // wrong prefix/segments
    expect(parseRecoveryCause("recovery:episode:edge")).toBeNull(); // short
    expect(parseRecoveryCause("recovery:episode:edge:5:extra")).toBeNull(); // long
    expect(parseRecoveryCause("recovery:meltdown:edge:5")).toBeNull(); // unknown kind
    expect(parseRecoveryCause("recovery:episode::5")).toBeNull(); // empty node
    expect(parseRecoveryCause("recovery:episode:edge:-3")).toBeNull(); // negative minute
    expect(parseRecoveryCause("recovery:episode:edge:5.5")).toBeNull(); // fractional minute
  });

  it("the parsed answer is frozen", () => {
    expect(Object.isFrozen(parseRecoveryCause("recovery:episode:edge:5"))).toBe(true);
  });
});

/* ─────────────────────────── ramp arithmetic ─────────────────────────── */

describe("rampFloorPct / minutesInWindow", () => {
  it("reads the engine's arms as a percent", () => {
    expect(rampFloorPct(record({ nodeId: "edge", effectiveSlots: 1, fullSlots: 2 }))).toBe(50);
    expect(rampFloorPct(record({ nodeId: "edge", effectiveSlots: 2, fullSlots: 2 }))).toBe(100);
    expect(rampFloorPct(record({ nodeId: "edge", effectiveSlots: 1, fullSlots: 3 }))).toBe(33);
  });

  it("a zero fullSlots record is corrupt state and THROWS", () => {
    expect(() => rampFloorPct(record({ nodeId: "edge", fullSlots: 0 }))).toThrowError(
      /recovery-watch\[bad-record\]/,
    );
  });

  it("minutes never run negative against the open anchor", () => {
    expect(minutesInWindow(record({ nodeId: "edge", openedAtMinute: 40 }), 12)).toBe(0);
    expect(minutesInWindow(record({ nodeId: "edge", openedAtMinute: 40 }), 55)).toBe(15);
  });
});

describe("phaseView", () => {
  it("both engine phases render, an invented one throws", () => {
    expect(phaseView("window").tone).toBe("amber");
    expect(phaseView("locked").tone).toBe("alarm");
    expect(() => phaseView("melted" as RecoveryWindowPhase)).toThrowError(/recovery-watch\[bad-phase\]/);
  });
});

/* ─────────────────────────── row projection ─────────────────────────── */

describe("buildRecoveryRows", () => {
  const state = (records: readonly RecoveryWindowRecord[]): RecoveryState => ({
    windows: new Map(records.map((r) => [r.nodeId, r])),
    lastStruggleMinute: new Map(),
  });

  it("undefined slice → zero rows (unarmed AND self-cleared both read empty)", () => {
    expect(buildRecoveryRows(undefined, 30)).toStrictEqual([]);
  });

  it("rows sort code-unit by node id and carry every projected field", () => {
    const rows = buildRecoveryRows(
      state([
        record({ nodeId: "waf", openedAtMinute: 20, closesAtMinute: 40, effectiveSlots: 4, fullSlots: 4 }),
        record({ nodeId: "edge", phase: "locked", openedAtMinute: 25, closesAtMinute: 60, lockUntilMinute: 60, strikes: 1 }),
      ]),
      45,
    );
    expect(rows.map((r) => r.nodeId)).toStrictEqual(["edge", "waf"]);
    const edge = rows[0]!;
    expect(edge.phaseLabel).toBe("Locked · safe mode");
    expect(edge.tone).toBe("alarm");
    expect(edge.arms).toBe("1/2");
    expect(edge.rampPct).toBe(50);
    expect(edge.minutesInWindow).toBe(20);
    expect(edge.minutesToClose).toBe(15);
    expect(edge.lockUntilMinute).toBe(60);
    expect(rows[1]!.minutesToClose).toBe(0); // countdown already past → clamps, never negative
    expect(Object.isFrozen(rows)).toBe(true);
    expect(Object.isFrozen(rows[0])).toBe(true);
  });
});

/* ─────────────────────────── voices ─────────────────────────── */

describe("recoveryVoice", () => {
  it("NO alert.recovery-* key ships today — the provisional genuinely answers", () => {
    for (const kind of RECOVERY_WATCH_KINDS) {
      expect(hasKey("shared-web", `alert.recovery-${kind}`)).toBe(false);
      expect(recoveryVoice(kind)).toBe(RECOVERY_WATCH_VOICES[kind]);
    }
  });

  it("an off-mirror kind surfaces the visible UNRECOGNISED row, never a crash", () => {
    expect(recoveryVoice("meltdown").headline).toBe("Unrecognised recovery event");
  });
});

/* ─────────────────────────── notice tape ─────────────────────────── */

describe("buildRecoveryTape", () => {
  it("newest first, capped, engine log in order", () => {
    const tape = buildRecoveryTape(
      [
        notice({ kind: "episode", nodeId: "edge", atMinute: 45, effectiveSlots: 2 }),
        notice({ kind: "window-opened", nodeId: "edge", atMinute: 49 }),
        notice({ kind: "window-cleared", nodeId: "edge", atMinute: 78, strikes: 0, effectiveSlots: 2 }),
      ],
      2,
    );
    expect(tape.map((t) => t.kind)).toStrictEqual(["window-cleared", "window-opened"]);
    expect(tape[0]!.headline).toBe("Window cleared");
    expect(tape[0]!.recognised).toBe(true);
    expect(Object.isFrozen(tape)).toBe(true);
  });

  it("a causeId that drifts from the payload twin surfaces UNRECOGNISED (wire is the boundary authority)", () => {
    const tape = buildRecoveryTape(
      [notice({ kind: "episode", nodeId: "edge", atMinute: 45, causeId: "recovery:meltdown:edge:45" })],
      6,
    );
    expect(tape[0]!.recognised).toBe(false);
    expect(tape[0]!.headline).toBe("Unrecognised recovery event");
    // the twin fields still ride for the human row — visible drift, blank never
    expect(tape[0]!.nodeId).toBe("edge");
  });

  it("empty log → empty tape", () => {
    expect(buildRecoveryTape([], 6)).toStrictEqual([]);
  });
});

/* ─────────────────── the live engine arc (runner-driven) ─────────────────── */

describe("SimCoreRunner recovery arc (seed 905, defaultRecoveryConfig)", () => {
  const STEP_CAP = 240;

  function stepUntil(runner: SimCoreRunner, stop: (r: SimCoreRunner) => boolean, cap = STEP_CAP): number {
    let steps = 0;
    while (!stop(runner) && steps < cap) {
      runner.headlessStep(1000);
      steps += 1;
    }
    if (!stop(runner)) throw new Error(`step cap ${cap} hit before the stop condition`);
    return steps;
  }

  it("the unarmed control stays honest-offline for the whole weekend", () => {
    const runner = new SimCoreRunner({ seed: 905 });
    for (let i = 0; i < 120; i++) runner.headlessStep(1000);
    expect(runner.recoveryState()).toBeUndefined();
    expect(runner.recoveryNotices()).toStrictEqual([]);
    runner.stop();
  });

  it("the armed run plays ALL FIVE kinds, in engine order, on node edge", () => {
    const runner = new SimCoreRunner({ seed: 905, recovery: defaultRecoveryConfig() });
    stepUntil(runner, (r) => r.recoveryNotices().length > 0);
    const arc = stepUntil(runner, (r) => r.recoveryNotices().some((n) => n.kind === "window-cleared"));
    expect(arc).toBeLessThan(STEP_CAP);
    const notices = runner.recoveryNotices();
    expect(notices.map((n) => n.kind)).toStrictEqual([...RECOVERY_WATCH_KINDS]);
    for (const n of notices) {
      expect(n.nodeId).toBe(asEntityId("edge"));
      expect(n.causeId).toBe(`recovery:${n.kind}:${n.nodeId}:${n.atMinute}`);
    }
    const minutes = notices.map((n) => n.atMinute);
    expect([...minutes].sort((a, b) => a - b)).toStrictEqual(minutes); // monotonic story
    // the second failure carries the strike and the locked floor posture
    const second = notices[2]!;
    expect(second.strikes).toBe(1);
    expect(second.effectiveSlots).toBe(defaultRecoveryConfig().floorSlots);
    // after clearing, rows empty out while the memory may linger — absent-or-idle slice
    expect(buildRecoveryRows(runner.recoveryState(), 240)).toStrictEqual([]);
    runner.stop();
  });

  it("mid-window the rows render the engine truth: locked edge at the ramp floor", () => {
    const runner = new SimCoreRunner({ seed: 905, recovery: defaultRecoveryConfig() });
    stepUntil(runner, (r) => r.recoveryNotices().some((n) => n.kind === "lock-engaged"));
    const frame = runner.headlessStep(1000);
    const rows = buildRecoveryRows(runner.recoveryState(), frame.minute);
    expect(rows.length).toBe(1);
    const edge = rows[0]!;
    expect(edge.nodeId).toBe("edge");
    expect(edge.phase).toBe("locked");
    expect(edge.strikes).toBe(1);
    expect(edge.rampPct).toBe(50); // floor 1 of the 2 arms captured at open
    expect(edge.arms).toBe("1/2");
    const tape = buildRecoveryTape(runner.recoveryNotices(), 6);
    expect(tape[0]!.headline).toBe("Safe mode engaged"); // lock-engaged is the freshest word
    expect(tape.map((t) => t.recognised).every(Boolean)).toBe(true);
    runner.stop();
  });
});
