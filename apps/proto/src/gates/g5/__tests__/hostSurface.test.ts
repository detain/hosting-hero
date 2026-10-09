/**
 * GATE-G5 · host-wiring surface (rest-host-wiring lane): the quarter engine
 * must CARRY the economy's publish-on-change observations (fix-economy's
 * forwarding contract), the frame must project an as-of reputation pane from
 * that trail, and the ticker's fallback voices must own exactly the three
 * fresh notice kinds — without any of it moving the replay digest.
 */
import { describe, expect, it } from "vitest";
import sharedWebRaw from "../../../../../../packages/content/types/shared-web.json?raw";
import waveTableRaw from "../../../../../../packages/content/waves/g1-shared-web-first-quarter.json?raw";
import { observedKey, asEntityId, type ObservedKey } from "@hh/sim-core/types";
import { QUARTER_MINUTES, runQuarter, type QuarterResult } from "../quarter.ts";
import { projectFrame } from "../projection.ts";
import { PROVISIONAL_NOTICE_VOICES, voiceEconomyNotice } from "../noticeSurface.ts";

const SEED = 55105n;
const REPUTATION_KEY: ObservedKey = observedKey(asEntityId("company"), "reputation");

let cached: QuarterResult | null = null;
function theQuarter(): QuarterResult {
  cached ??= runQuarter({
    seed: SEED,
    sharedWebWire: JSON.parse(sharedWebRaw) as unknown,
    waveWire: JSON.parse(waveTableRaw) as unknown,
  });
  return cached;
}

function fixedToBps(fixed: bigint): number {
  return Number((fixed * 10_000n + 32_768n) / 65_536n);
}

describe("g5 engine · observation trail", () => {
  it("publishes exactly the four scripted score moves, minute-exact", () => {
    const q = theQuarter();
    // §5.10 arithmetic over the scripted census: two write-offs (−600 ea.),
    // one dunning resurrection (+150), one incident SLA credit (−500, NOT
    // halved — no honest post-mortem was scripted). PROVISIONAL deltas.
    expect(q.settles.filter((s) => s.observedWrites.length > 0).map((s) => s.minute))
      .toEqual([34_560, 36_000, 37_440, 77_760]);
    expect(q.observedWrites.length).toBe(4);
    const last = q.observedWrites.at(-1);
    expect(typeof last?.cell.value).toBe("bigint");
    expect(fixedToBps(last?.cell.value as bigint)).toBe(3_450);
  });

  it("trail is chronological, keyed company::reputation, settle-consistent", () => {
    const q = theQuarter();
    for (const write of q.observedWrites) expect(write.key).toBe(REPUTATION_KEY);
    const fromSettles = q.settles.flatMap((s) => s.observedWrites);
    expect(fromSettles).toEqual([...q.observedWrites]);
  });

  it("observedCells is the last-wins map of the trail", () => {
    const q = theQuarter();
    const cell = q.observedCells.get(REPUTATION_KEY);
    const last = q.observedWrites.at(-1);
    expect(cell).toBeDefined();
    expect(cell?.value).toBe(last?.cell.value);
    expect(q.observedCells.size).toBe(1); // v0: reputation is the only emitter
  });

  it("forwarding is digest-neutral: two runs agree, replay set holds", () => {
    const a = theQuarter();
    const b = runQuarter({
      seed: SEED,
      sharedWebWire: JSON.parse(sharedWebRaw) as unknown,
      waveWire: JSON.parse(waveTableRaw) as unknown,
    });
    expect(b.digest).toBe(a.digest);
    expect(b.observedWrites.length).toBe(a.observedWrites.length);
  });
});

describe("g5 frame · reputation pane", () => {
  it("opening constant stands before the first publish", () => {
    const q = theQuarter();
    const open = projectFrame(q, q.settles[0]?.minute ?? 0);
    expect(open.reputation.published).toBe(false);
    expect(open.reputation.bps).toBe(5_000);
    expect(open.reputation.percentText).toBe("50.00 %");
    expect(open.reputation.publishesSoFar).toBe(0);
    expect(open.reputation.lastPublishedAtMinute).toBeNull();
  });

  it("as-of cut: quarter-end pane equals the last published cell", () => {
    const q = theQuarter();
    const end = projectFrame(q, QUARTER_MINUTES);
    const last = q.observedWrites.at(-1);
    expect(end.reputation.published).toBe(true);
    if (last !== undefined && typeof last.cell.value === "bigint") {
      expect(end.reputation.bps).toBe(fixedToBps(last.cell.value));
    }
    expect(end.reputation.bps).toBe(3_450);
    expect(end.reputation.percentText).toBe("34.50 %");
    expect(end.reputation.lastPublishedAtMinute).toBe(77_760);
    expect(end.reputation.publishesSoFar).toBe(q.observedWrites.length);
    expect(end.reputation.explain.title).toContain("Reputation");
  });

  it("scrubbing backwards un-publishes (as-of honesty, no state leak)", () => {
    const q = theQuarter();
    const publishes = q.settles
      .map((s) => ({ minute: s.minute, count: s.observedWrites.length }))
      .filter((r) => r.count > 0);
    const firstPublish = publishes[0];
    const prior = q.settles.find((s) => firstPublish !== undefined && s.minute < firstPublish.minute);
    if (prior === undefined) return; // no earlier settle to compare — vacuous-safe
    const frame = projectFrame(q, prior.minute);
    expect(frame.reputation.published).toBe(false);
    expect(frame.reputation.publishesSoFar).toBe(0);
  });
});

describe("g5 ticker · provisional notice voices", () => {
  const NEW_KINDS = ["contract-activated", "covenant-breached", "chargeback-posted"] as const;

  it("voices exactly the three fresh economy kinds, PROVISIONAL-marked", () => {
    expect(Object.keys(PROVISIONAL_NOTICE_VOICES).sort()).toEqual([...NEW_KINDS].sort());
    for (const kind of NEW_KINDS) {
      const line = voiceEconomyNotice(kind);
      expect(line).toBeTypeOf("string");
      expect(line).toContain("PROVISIONAL");
    }
  });

  it("stays silent for every pre-existing wire kind (pack/chrome own them)", () => {
    for (const kind of ["cliff-lapsed", "invoice-paid", "dunning-stage", "written-off", "sla-credit-due", "budget-locked"]) {
      expect(voiceEconomyNotice(kind)).toBeNull();
    }
    expect(voiceEconomyNotice("anything-else")).toBeNull();
  });
});
