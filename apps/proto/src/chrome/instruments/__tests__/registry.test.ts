/**
 * The five faces × the binding law. Instrument logic is where "no data ≠ 0",
 * "at nominal instruments are still", and stroke-weight-as-certainty get
 * decided — all headless.
 */
import { describe, expect, it } from "vitest";
import {
  FACE_KINDS,
  G1_INSTRUMENTS,
  assertInstrumentComplete,
  formatReadout,
  instrumentReading,
  type InstrumentDef,
} from "../registry";
import type { ProtoCell } from "../../../shared/protocol";
import { displayToFixed } from "../../../shared/protocol";

const base: InstrumentDef = {
  id: "t",
  label: "Test",
  entity: "node/x",
  property: "p",
  scale: "fixed",
  face: "needle",
  unit: "u",
  nominal: [0.2, 0.8],
  threshold: 0.9,
  direction: "up",
  fullScale: 1,
};

const fixedCell = (v: number, over: Partial<ProtoCell> = {}): ProtoCell => ({
  value: displayToFixed(v),
  fidelity: 2,
  freshnessUs: 1_000_000n,
  coverage: displayToFixed(0.9),
  certainty: displayToFixed(0.8),
  status: "live",
  ...over,
});

describe("the five faces", () => {
  it("exactly five, named per spec", () => {
    expect(FACE_KINDS).toEqual(["needle", "bar", "waterline", "scope", "counter"]);
  });

  it("the G1 demo roster uses ALL FIVE faces, one each", () => {
    const used = G1_INSTRUMENTS.map((d) => d.face).sort();
    expect(used).toEqual([...FACE_KINDS].sort());
  });

  it("every demo instrument passes the hand-wave detector", () => {
    for (const def of G1_INSTRUMENTS) expect(() => assertInstrumentComplete(def)).not.toThrow();
  });
});

describe("instrumentReading — the fog binding (one decision, every widget)", () => {
  it("missing cell → no-data, and NO zero", () => {
    const r = instrumentReading(base, undefined);
    expect(r.state).toBe("no-data");
    expect(r.value).toBeNull();
    expect(r.ratio).toBeNull();
    expect(r.isStill).toBe(true);
    expect(formatReadout(base, r)).toBe("?");
  });

  it("explicit null cell value → no-data as well (nothing, not zero)", () => {
    const r = instrumentReading(base, { ...fixedCell(0), value: null });
    expect(r.state).toBe("no-data");
  });

  it("nominal band → still at nominal (motion reserved for departure)", () => {
    const r = instrumentReading(base, fixedCell(0.5));
    expect(r.state).toBe("nominal");
    expect(r.isStill).toBe(true);
  });

  it("outside nominal but under threshold → warn, moving", () => {
    const r = instrumentReading(base, fixedCell(0.85));
    expect(r.state).toBe("warn");
    expect(r.isStill).toBe(false);
  });

  it("at/past threshold in the breach direction → alarm", () => {
    expect(instrumentReading(base, fixedCell(0.95)).state).toBe("alarm");
    const down = { ...base, nominal: [0.55, 1] as const, threshold: 0.35, direction: "down" as const };
    expect(instrumentReading(down, fixedCell(0.3)).state).toBe("alarm");
  });

  it("ratio clamps into 0..1 across fullScale", () => {
    expect(instrumentReading(base, fixedCell(3)).ratio).toBe(1);
    expect(instrumentReading(base, fixedCell(-1)).ratio).toBe(0);
  });

  it("certainty flows through for stroke-weight mapping", () => {
    const r = instrumentReading(base, fixedCell(0.5, { certainty: displayToFixed(0.25) }));
    expect(r.certainty).toBeCloseTo(0.25, 5);
  });

  it("scale discipline: fixed binding + int cell is a producer bug, thrown", () => {
    expect(() => instrumentReading(base, { ...fixedCell(1), value: 7 })).toThrow(/expected fixed/);
    const rawDef = { ...base, scale: "raw" as const };
    expect(() => instrumentReading(rawDef, fixedCell(1))).toThrow(/expected int/);
  });

  it("raw counter reads its int cell and formats with unit stamp", () => {
    const def = { ...base, scale: "raw" as const, nominal: [0, 40] as const, threshold: 120, fullScale: 1000 };
    const r = instrumentReading(def, { ...fixedCell(0), value: 121 });
    expect(r.state).toBe("alarm");
    expect(formatReadout(def, r)).toBe("Test 121 u — breach");
  });
});

describe("assertInstrumentComplete", () => {
  it("rejects a face outside the five", () => {
    expect(() => assertInstrumentComplete({ ...base, face: "pie" as never })).toThrow(/not one of the five/);
  });
  it("rejects an inverted nominal band", () => {
    expect(() => assertInstrumentComplete({ ...base, nominal: [1, 0] })).toThrow(/inverted/);
  });
});
