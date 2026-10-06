/**
 * Protocol round-trip law: SimProjection → wire → JSON (worst transport) →
 * decode → identical trusted projection. Bigint survives every hop; malformed
 * frames name their field path and die loudly.
 */
import { describe, expect, it } from "vitest";
import {
  ProtocolError,
  assertFromWorker,
  assertToWorker,
  decodeProjection,
  displayToFixed,
  encodeProjection,
  fixedToDisplay,
  requireFixed,
  type SimProjection,
} from "../shared/protocol";
import { MockSimRunner } from "../runner/mockSimRunner";

function sampleProjection(): SimProjection {
  return new MockSimRunner(42).headlessStep(100);
}

function throughJson(wire: unknown): unknown {
  return JSON.parse(JSON.stringify(wire));
}

describe("encode/decode round-trip", () => {
  it("preserves a real mock projection exactly, including bigint cells", () => {
    const original = sampleProjection();
    const decoded = decodeProjection(throughJson(encodeProjection(original)));

    expect(decoded.seq).toBe(original.seq);
    expect(decoded.tick).toBe(original.tick);
    expect(Object.is(decoded.freeCashMicroUsd, original.freeCashMicroUsd)).toBe(true);
    expect(decoded.clocks).toEqual(original.clocks);
    expect(decoded.counters).toEqual(original.counters);
    expect(decoded.lanes.length).toBe(original.lanes.length);
    expect(decoded.lanes[0]?.ratePerMin).toBe(original.lanes[0]?.ratePerMin);
    expect(decoded.lanes[0]?.classMix).toEqual(original.lanes[0]?.classMix);
    expect(decoded.observed.size).toBe(original.observed.size);

    for (const [key, cell] of original.observed) {
      const back = decoded.observed.get(key);
      expect(back, `cell ${key}`).toBeDefined();
      expect(back?.value).toBe(cell.value); // Object.is semantics via toBe on bigint
      expect(back?.status).toBe(cell.status);
      expect(back?.coverage).toBe(cell.coverage);
    }
  });

  it("wire form is JSON-safe: no bigint anywhere", () => {
    const wire = encodeProjection(sampleProjection()) as unknown as Record<string, unknown>;
    const seen: string[] = [];
    const walk = (value: unknown, path: string): void => {
      if (typeof value === "bigint") seen.push(path);
      if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`));
      else if (typeof value === "object" && value !== null) {
        for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
      }
    };
    walk(wire, "wire");
    expect(seen).toEqual([]);
  });

  it("null cell values survive as NO DATA, not zero", () => {
    const original = sampleProjection();
    const decoded = decodeProjection(throughJson(encodeProjection(original)));
    const p99 = [...decoded.observed.entries()].find(([key]) => key.endsWith("p99LatencyUs"));
    expect(p99).toBeDefined();
    expect(p99?.[1].value).toBeNull();
    expect(p99?.[1].status).toBe("unknown");
  });

  it("notices decode with lane ids and kinds", () => {
    const original = sampleProjection();
    const decoded = decodeProjection(throughJson(encodeProjection(original)));
    expect(decoded.notices.length).toBeGreaterThan(0);
    for (const notice of decoded.notices) {
      expect(typeof notice.atUs).toBe("bigint");
    }
  });

  it("door receipts round-trip with their detail rider; unset details stay off the wire", () => {
    const base = sampleProjection();
    const withReceipts: SimProjection = {
      ...base,
      notices: [
        ...base.notices,
        { kind: "intent-executed", laneId: null, atUs: 7n, detail: "communicate" },
        { kind: "intent-refused", laneId: null, atUs: 8n, detail: "connect-edge: hands-exhausted" },
      ],
    };
    const wire = encodeProjection(withReceipts);
    // Pre-door notices must not sprout an empty `detail` key (wire-compat).
    const raw = JSON.parse(JSON.stringify(wire)) as { notices: Record<string, unknown>[] };
    expect(raw.notices[0] && "detail" in raw.notices[0]).toBe(false);
    const decoded = decodeProjection(throughJson(wire));
    const receipts = decoded.notices.slice(-2);
    expect(receipts[0]?.kind).toBe("intent-executed");
    expect(receipts[0]?.detail).toBe("communicate");
    expect(receipts[1]?.atUs).toBe(8n);
    expect(receipts[1]?.detail).toBe("connect-edge: hands-exhausted");
  });

  it("main→worker intent frame accepts the player-verb door arm", () => {
    const parsed = assertToWorker({
      kind: "intent",
      protocol: 1,
      seq: 7,
      clock: "sim",
      atUs: "0",
      origin: "player",
      payload: { kind: "player-verb", args: { verb: "communicate", note: "hi", target: null } },
    });
    if (parsed.kind !== "intent" || parsed.payload.kind !== "player-verb") {
      throw new Error("player-verb arm rejected");
    }
    expect(parsed.payload.args["note"]).toBe("hi");
  });

  it("player-verb args must be flat scalars with a closed verb", () => {
    const frame = (args: Record<string, unknown>) => ({
      kind: "intent" as const,
      protocol: 1 as const,
      seq: 1,
      clock: "sim" as const,
      atUs: "0",
      origin: "player" as const,
      payload: { kind: "player-verb" as const, args },
    });
    expect(() => assertToWorker(frame({ verb: "teleport" }))).toThrow(/args\.verb/);
    expect(() => assertToWorker(frame({ verb: "communicate", note: { nested: 1 } }))).toThrow(ProtocolError);
    expect(() => assertToWorker(frame({ verb: "communicate", note: { nested: 1 } }))).toThrow(/args\.note/);
  });
});

describe("boundary parse fails loud with field paths", () => {
  it("rejects a fractional µs string", () => {
    const wire = encodeProjection(sampleProjection());
    const bad = { ...wire, tick: "12.5" };
    expect(() => decodeProjection(bad)).toThrow(/tick/);
  });

  it("rejects an unknown protocol version", () => {
    const wire = encodeProjection(sampleProjection());
    expect(() => decodeProjection({ ...wire, protocol: 999 })).toThrow(ProtocolError);
  });

  it("rejects a non-array lanes field", () => {
    const wire = encodeProjection(sampleProjection());
    expect(() => decodeProjection({ ...wire, lanes: {} })).toThrow(/lanes/);
  });

  it("rejects a status outside the closed enum", () => {
    const wire = encodeProjection(sampleProjection());
    const bad = { ...wire, observed: [{ ...wire.observed[0]!, status: "melting" }] };
    expect(() => decodeProjection(bad)).toThrow(/status/);
  });
});

describe("envelope assertions", () => {
  it("parses a boot message", () => {
    const msg = assertToWorker({ kind: "boot", protocol: 1, seed: "abc", speedX: 2 });
    expect(msg).toEqual({ kind: "boot", protocol: 1, seed: "abc", speedX: 2, runnerKind: "mock" });
  });

  it("honours an explicit runnerKind on boot (sim-core selectable through the wire)", () => {
    const msg = assertToWorker({ kind: "boot", protocol: 1, seed: "abc", speedX: 1, runnerKind: "sim-core" });
    expect(msg.kind === "boot" && msg.runnerKind).toBe("sim-core");
    expect(() => assertToWorker({ kind: "boot", protocol: 1, seed: "abc", speedX: 1, runnerKind: "nope" })).toThrow(
      /runnerKind/,
    );
  });

  it("rejects illegal speed", () => {
    expect(() => assertToWorker({ kind: "speed", protocol: 1, speedX: 3 })).toThrow(/speedX/);
  });

  it("parses a slider intent with string fixed value", () => {
    const msg = assertToWorker({
      kind: "intent",
      protocol: 1,
      seq: 7,
      clock: "sim",
      atUs: "0",
      origin: "player",
      payload: { kind: "slider", control: "defense.aggression", value: "32768" },
    });
    if (msg.kind !== "intent") throw new Error("expected intent");
    expect(msg.payload).toEqual({ kind: "slider", control: "defense.aggression", value: "32768" });
  });

  it("rejects a forged fromWorker frame", () => {
    expect(() => assertFromWorker({ kind: "ready", protocol: 1 })).toThrow(ProtocolError);
  });
});

describe("display helpers", () => {
  it("fixed ↔ display round-trips at cent precision", () => {
    const value = displayToFixed(0.7);
    expect(value).toBe(45875n); // 0.7×65536 = 45875.2 → 45875
    expect(fixedToDisplay(value)).toBeCloseTo(0.69999, 4);
  });

  it("requireFixed refuses to guess across encodings", () => {
    const original = sampleProjection();
    const intCell = [...original.observed.values()].find((c) => typeof c.value === "number");
    expect(intCell).toBeDefined();
    expect(() => requireFixed(intCell, "queueDepth")).toThrow(/fixed encoding/);
  });
});
