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
import { createRecoveryTracker, declareRecoveryFailure, defaultRecoveryConfig, defaultRecoveryTuning } from "@hh/sim-core/pipeline";
import type { RecoveryNotice, RecoveryTrackerState } from "@hh/sim-core/pipeline";
import type { GameState, RecoveryState, RecoveryWindowPhase, RecoveryWindowRecord } from "@hh/sim-core/types";
import { SimCoreRunner } from "../../runner/simCoreRunner";
import { hasKey } from "../../i18n/packStore";
import {
  ADVISORY_PHASE_VIEWS,
  ADVISORY_TUNING,
  RECOVERY_PHASE_VIEWS,
  RECOVERY_WATCH_KINDS,
  RECOVERY_WATCH_PHASES,
  RECOVERY_WATCH_VOICES,
  advisoryPhaseView,
  advisoryTotals,
  buildAdvisoryRows,
  buildRecoveryRows,
  buildRecoveryTape,
  minutesInWindow,
  observeAdvisoryTick,
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
const trackerSource = readFileSync(
  fileURLToPath(new URL("../../../../../packages/sim-core/src/pipeline/recovery/tracker.ts", import.meta.url)),
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

/* ══════════════════ ADVISORY arm (observer composition) ══════════════════ */

/** An engine snapshot whose `recovery` slice holds ONE live window on `db`
 *  (opened 30, closes 50) — the ADR-0012 authority shape the observer reads
 *  for second-failure escalation. Structurally typed cast: the observer
 *  touches nothing but `recovery.windows`. */
const engineWithWindowOn = (nodeId: string, closesAtMinute = 50): GameState =>
  ({
    recovery: {
      windows: new Map([
        [
          asEntityId(nodeId),
          Object.freeze({
            nodeId: asEntityId(nodeId),
            phase: "window" as const,
            openedAtMinute: 30,
            closesAtMinute,
            lockUntilMinute: 0,
            strikes: 0,
            fullSlots: 2,
            effectiveSlots: 2,
          }),
        ],
      ]),
      lastStruggleMinute: new Map(),
    },
  }) as unknown as GameState;

/* ───────────────────── advisory mirror drift pins ───────────────────── */

describe("advisory mirrors the observer (drift pins)", () => {
  it("the advisory phase views equal the tracker's RECOVERY_PHASES literal", () => {
    const m = trackerSource.match(/RECOVERY_PHASES\s*=\s*\[([\s\S]*?)\]/);
    if (m === null || m[1] === undefined) throw new Error("tracker RECOVERY_PHASES literal lost");
    const phases = [...m[1].matchAll(/"([^"]+)"/g)].map((s) => s[1]!);
    expect(Object.keys(ADVISORY_PHASE_VIEWS)).toStrictEqual(phases);
  });

  it("the crew-queue mirror cites the tracker's private order law verbatim", () => {
    // buildAdvisoryRows re-implements allocateCrew's comparator for display;
    // if the engine order moves, this pin goes red in the SAME commit's gate.
    expect(trackerSource).toContain("b.priority - a.priority ||");
    expect(trackerSource).toContain("compareIds(a.nodeId, b.nodeId)");
    expect(trackerSource).toContain('r.phase === "failed" &&');
    expect(trackerSource).toContain("minute - r.failedAtMinute >= cfg.autoRecoverDelayMinutes");
  });

  it("the advisory threshold is a DELIBERATE host choice, not an accident of defaults", () => {
    expect(ADVISORY_TUNING.failureBounceThreshold).toBe(2);
    // the observer's own default still answers 4 in engine source (unchanged);
    // every other knob the advisory wears stays at the engine default.
    expect(trackerSource).toContain("failureBounceThreshold: 4");
    const { failureBounceThreshold: engineDefault, ...baseRest } = defaultRecoveryTuning();
    const { failureBounceThreshold, ...rest } = ADVISORY_TUNING;
    void failureBounceThreshold;
    expect(engineDefault).toBe(4);
    expect(ADVISORY_TUNING.failureBounceThreshold).toBe(2);
    expect(rest).toStrictEqual(baseRest);
  });

  it("advisoryPhaseView throws LOUD on an off-vocabulary phase (never a guess)", () => {
    expect(advisoryPhaseView("healthy").tone).toBe("grey");
    expect(() => advisoryPhaseView("meltdown" as never)).toThrow(/bad-advisory-phase/);
  });
});

/* ───────────────────── advisory rows (synthetic witnesses) ───────────────────── */

describe("buildAdvisoryRows", () => {
  const E = (id: string) => asEntityId(id);

  it("crew queue: earlier failure ramps first, later one waits its turn", () => {
    const cfg = defaultRecoveryTuning();
    const opened = declareRecoveryFailure(createRecoveryTracker(), E("edge"), 10, cfg).state;
    const two = declareRecoveryFailure(opened, E("origin"), 12, cfg).state;
    const stepped = observeAdvisoryTick(two, { minute: 20, events: [] }, cfg).state;
    const rows = buildAdvisoryRows(stepped, 20, cfg);
    expect(rows.map((r) => r.nodeId)).toStrictEqual(["edge", "origin"]); // code-unit sort
    const edge = rows[0]!;
    expect(edge.phase).toBe("recovering");
    expect(edge.crew).toBe("ramping");
    expect(edge.queuePosition).toBe(1);
    expect(edge.capacityBps).toBe(2500); // safe-mode floor at the ramp's first minute
    expect(edge.capacityPct).toBe(25);
    expect(edge.degradedMinutes).toBe(8); // origin's declare moved the clock to 12; 12→20 accrues 8
    const origin = rows[1]!;
    expect(origin.phase).toBe("failed");
    expect(origin.crew).toBe("waiting");
    expect(origin.queuePosition).toBe(2);
    expect(origin.capacityBps).toBe(0);
    expect(origin.degradedMinutes).toBe(8);
    expect(advisoryTotals(rows)).toStrictEqual({ tracked: 2, openIncidents: 2, degradedMinutes: 16 });
  });

  it("a node inside its dispatch delay reads standby, counting down", () => {
    const cfg = defaultRecoveryTuning();
    const opened = declareRecoveryFailure(createRecoveryTracker(), E("edge"), 10, cfg).state;
    const rows = buildAdvisoryRows(opened, 12, cfg); // only 2 of the 5 delay minutes gone
    expect(rows[0]!.crew).toBe("standby");
    expect(rows[0]!.minutesToDispatch).toBe(3);
    expect(rows[0]!.queuePosition).toBe(1); // same total order, wider window
  });

  it("declaration against a LIVE engine window escalates as a second failure (double ramp)", () => {
    const cfg = defaultRecoveryTuning();
    const res = declareRecoveryFailure(createRecoveryTracker(), E("db"), 36, cfg, engineWithWindowOn("db"));
    expect(res.transitions.map((t) => t.kind)).toStrictEqual(["node-failed", "second-failure"]);
    expect(res.transitions[0]!.detail).toBe("ramp=60"); // 30 base × 2.0 bps escalation
    const rows = buildAdvisoryRows(res.state, 36, cfg);
    expect(rows[0]!.secondFailure).toBe(true);
    expect(rows[0]!.phaseLabel).toBe("Down · crew queue");
    expect(rows[0]!.tone).toBe("alarm");
  });

  it("no engine snapshot ⇒ no escalation — the observer defers degraded truth to the authority", () => {
    const cfg = defaultRecoveryTuning();
    const res = declareRecoveryFailure(createRecoveryTracker(), E("db"), 36, cfg);
    expect(res.transitions.map((t) => t.kind)).toStrictEqual(["node-failed"]);
    expect(res.transitions[0]!.detail).toBe("ramp=30");
  });

  it("failback flips exactly at the hold's end, and rows linger after recovery", () => {
    const cfg = defaultRecoveryTuning();
    // edge: fail @10, crew starts @20 (delay 5... needs minute >= 15; use real flow)
    const opened = declareRecoveryFailure(createRecoveryTracker(), E("edge"), 10, cfg).state;
    const stepped = observeAdvisoryTick(opened, { minute: 20, events: [] }, cfg).state;
    const done = observeAdvisoryTick(stepped, { minute: 60, events: [] }, cfg).state; // 20+30 ramp
    const atDone = buildAdvisoryRows(done, 60, cfg)[0]!;
    expect(atDone.phase).toBe("recovered");
    expect(atDone.phaseLabel).toBe("Recovered · failback hold");
    expect(atDone.capacityPct).toBe(100);
    expect(atDone.acceptsFailback).toBe(false); // hold runs 50→65 (exact completion + 15)
    expect(atDone.crew).toBeNull();
    expect(atDone.queuePosition).toBeNull();
    const atHold = buildAdvisoryRows(done, 65, cfg)[0]!;
    expect(atHold.acceptsFailback).toBe(true); // exact endpoint: inclusive
    expect(buildAdvisoryRows(done, 64, cfg)[0]!.acceptsFailback).toBe(false); // falsifiable edge
    // the memory row lingers while the incident ledger cools — open 0, not empty
    expect(advisoryTotals(buildAdvisoryRows(done, 75, cfg))).toStrictEqual({
      tracked: 1,
      openIncidents: 0,
      degradedMinutes: 40, // failed 10→20 (10m) + ramping 20→50 exact-completion cap (30m)
    });
  });

  it("a pristine tracker answers zero rows and a zero meter", () => {
    const rows = buildAdvisoryRows(createRecoveryTracker(), 0);
    expect(rows).toStrictEqual([]);
    expect(advisoryTotals(rows)).toStrictEqual({ tracked: 0, openIncidents: 0, degradedMinutes: 0 });
  });
});

/* ─────────────── the LIVE advisory arc on the seed-905 story ─────────────── */

describe("advisory arc on the live runner (seed 905, tick-facts seam)", () => {
  it("lastTickFacts before the first step answers the tick-0 world", () => {
    const runner = new SimCoreRunner({ seed: 905, recovery: defaultRecoveryConfig() });
    const facts = runner.lastTickFacts();
    expect(facts.events).toStrictEqual([]);
    expect(facts.game.context.minute).toBe(0);
    expect(Object.isFrozen(facts)).toBe(true);
    runner.stop();
  });

  it("the seam is a frozen single slot: stable between steps, replaced by the next", () => {
    const runner = new SimCoreRunner({ seed: 905, recovery: defaultRecoveryConfig() });
    runner.headlessStep(1000);
    const facts = runner.lastTickFacts();
    expect(Object.isFrozen(facts)).toBe(true);
    expect(Object.isFrozen(facts.events)).toBe(true); // the driver's own frozen stream
    expect(facts.game.context.tick).toBe(1n);
    expect(runner.lastTickFacts()).toBe(facts); // same slot object until the next step
    runner.headlessStep(1000);
    const next = runner.lastTickFacts();
    expect(next).not.toBe(facts);
    expect(next.game).not.toBe(facts.game);
    expect(next.game.context.tick).toBe(2n);
    runner.stop();
  });

  it("full story: episode-minute open, mid-window dip, failback at the hold, honest divergence", () => {
    const runner = new SimCoreRunner({ seed: 905, recovery: defaultRecoveryConfig() });
    let tracker: RecoveryTrackerState = createRecoveryTracker();
    const transitions: string[] = [];
    const byMinute = new Map<number, RecoveryTrackerState>();
    for (let i = 0; i < 100; i++) {
      const frame = runner.headlessStep(1000);
      const facts = runner.lastTickFacts();
      const res = observeAdvisoryTick(tracker, {
        minute: frame.minute,
        events: facts.events,
        engine: facts.game,
      });
      tracker = res.state;
      byMinute.set(frame.minute, tracker);
      for (const t of res.transitions) transitions.push(`${t.kind}:${String(t.nodeId)}@${t.atMinute}`);
    }
    // PROVISIONAL witnesses (probe-derived 2026-10-13): the advisory opens the
    // SAME minute the engine speaks its episode, because the pair of bounced
    // units that matured the episode is the very cluster the observer reads.
    expect(transitions).toContain("node-failed:edge@45");
    expect(byMinute.get(44)!.nodes.size).toBe(0); // falsifiable: silent the minute before
    const mid = buildAdvisoryRows(byMinute.get(53)!, 53)[0]!; // engine LOCK minute
    expect(mid.nodeId).toBe("edge");
    expect(mid.phase).toBe("recovering");
    expect(mid.degradedMinutes).toBe(8); // failed 45→50, ramping 50→53
    expect(mid.capacityBps).toBe(3250); // capacity DIPS to the ramp mid-window...
    expect(mid.crew).toBe("ramping");
    // ...while the engine's own authority has escalated PAST the advisory's
    // calm picture (second-failure + lock at 53): the two voices genuinely
    // diverge on this seed, which is exactly why the section is labelled
    // advisory and the clamp above it stays authoritative (ADR-0012).
    expect(runner.recoveryNotices().some((n) => n.kind === "second-failure")).toBe(true);
    expect(mid.secondFailure).toBe(false);
    const done = buildAdvisoryRows(byMinute.get(80)!, 80)[0]!;
    expect(done.phase).toBe("recovered");
    expect(transitions).toContain("recovery-started:edge@50"); // delay 5 from open
    expect(transitions).toContain("recovery-completed:edge@80"); // 50 + 30 base ramp
    expect(done.acceptsFailback).toBe(false); // hold armed at +15m
    const failback = buildAdvisoryRows(byMinute.get(95)!, 95)[0]!;
    expect(failback.acceptsFailback).toBe(true); // probe witness: flips exactly @95
    expect(failback.capacityPct).toBe(100);
    expect(failback.degradedMinutes).toBe(35); // meter froze at recovery, engine cleared at 78
    // the engine's lifetime meter never crosses into the slice rows by accident
    expect(buildRecoveryRows(runner.recoveryState(), 95)).toStrictEqual([]);
    runner.stop();
  });
});
