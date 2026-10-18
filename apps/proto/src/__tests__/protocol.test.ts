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
  encodeBootRules,
  decodeProjection,
  displayToFixed,
  encodeProjection,
  fixedToDisplay,
  requireFixed,
  type SimProjection,
} from "../shared/protocol";
import { MockSimRunner } from "../runner/mockSimRunner";
import { noticeWireCopy } from "../i18n/noticeCopy";

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

  it("economy-notice roll-ups round-trip (kind, null lane, colon detail)", () => {
    // Money-lane wire shape (REST-PROTO-FINAL): laneId is always null and the
    // detail carries `<economyKind>:<contractId>` — the codec must preserve
    // both exactly so chrome can split on the first colon.
    const base = sampleProjection();
    const withMoney: SimProjection = {
      ...base,
      notices: [
        ...base.notices,
        { kind: "economy-notice", laneId: null, atUs: 9n, detail: "invoice-paid:ctr-hourly-1" },
        { kind: "economy-notice", laneId: null, atUs: 9n, detail: "contract-activated:ctr-pending-1" },
        // OD-25(a) canonical deaths ride the SAME roll-up (lane L4): the
        // engine mints them with contractId "company", so the colon split
        // yields (kind, "company") and the zero-slot pack voice resolves.
        { kind: "economy-notice", laneId: null, atUs: 9n, detail: "death-imminent:company" },
        { kind: "economy-notice", laneId: null, atUs: 9n, detail: "company-dissolved:company" },
      ],
    };
    const decoded = decodeProjection(throughJson(encodeProjection(withMoney)));
    const money = decoded.notices.filter((n) => n.kind === "economy-notice");
    expect(money.map((n) => [n.detail, n.laneId, n.atUs])).toEqual([
      ["invoice-paid:ctr-hourly-1", null, 9n],
      ["contract-activated:ctr-pending-1", null, 9n],
      ["death-imminent:company", null, 9n],
      ["company-dissolved:company", null, 9n],
    ]);
    for (const row of money.slice(2)) {
      const [engineKind, contractId] = (row.detail ?? "").split(/:(.+)/);
      expect(contractId).toBe("company");
      expect(noticeWireCopy(engineKind as string, null)).toBeTypeOf("string");
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

/* ------------------------------------------------------------------ *
 * E2b seam 2+3: additive-optional wire fields (notice causeId,
 * attention roll-up) with PROTOCOL_VERSION still 1 — proved by
 * legacy-frame tolerance in BOTH directions.
 * ------------------------------------------------------------------ */

describe("E2b additive wire fields (causeId, attention) — version stays 1", () => {
  it("encode OMITS causeId/attention when unset; set values round-trip", () => {
    const base = sampleProjection();
    const withExtras: SimProjection = {
      ...base,
      attention: { capacity: 2, debt: 1, window: 2, loanCount: 2 },
      notices: [
        ...base.notices,
        {
          kind: "economy-notice",
          laneId: null,
          atUs: 12n,
          detail: "company-dissolved:company",
          causeId: "economy:death:dissolved:churn-collapse:5760",
        },
      ],
    };
    const wire = encodeProjection(withExtras);
    const decoded = decodeProjection(throughJson(wire));
    expect(decoded.attention).toEqual({ capacity: 2, debt: 1, window: 2, loanCount: 2 });
    const rider = decoded.notices[decoded.notices.length - 1]!;
    expect(rider.causeId).toBe("economy:death:dissolved:churn-collapse:5760");
    // The pre-E2b sample carries neither key on the wire at all.
    const plainWire = JSON.parse(JSON.stringify(encodeProjection(base))) as {
      notices: Record<string, unknown>[];
      attention?: unknown;
    };
    expect("attention" in plainWire).toBe(false);
    for (const row of plainWire.notices) expect("causeId" in row).toBe(false);
  });

  it("LEGACY frame (no causeId, no attention keys) decodes unchanged — back-compat", () => {
    const modern = encodeProjection({
      ...sampleProjection(),
      attention: { capacity: 3, debt: 0, window: 1, loanCount: 0 },
    });
    // Hand-strip every E2b addition to rebuild a v1-pre-E2b frame.
    const legacyWire = JSON.parse(JSON.stringify(modern)) as {
      attention?: unknown;
      notices: Record<string, unknown>[];
    };
    delete legacyWire.attention;
    for (const row of legacyWire.notices) delete row.causeId;
    const decoded = decodeProjection(legacyWire);
    expect("attention" in decoded).toBe(false);
    for (const notice of decoded.notices) expect(notice.causeId).toBeUndefined();
  });

  it("unknown extra keys on a notice and on the projection are TOLERATED (forward-compat)", () => {
    const wire = JSON.parse(JSON.stringify(encodeProjection(sampleProjection()))) as {
      notices: Record<string, unknown>[];
      [extra: string]: unknown;
    };
    wire.notices[0]!["tomorrowField"] = { nested: true };
    wire["futureRollup"] = "whatever";
    const decoded = decodeProjection(wire);
    expect(decoded.notices.length).toBeGreaterThan(0);
    expect("futureRollup" in decoded).toBe(false);
  });

  it("attention decode is fail-loud per field, like every other boundary", () => {
    const wire = encodeProjection({
      ...sampleProjection(),
      attention: { capacity: 2, debt: 1, window: 2, loanCount: 2 },
    }) as unknown as Record<string, unknown>;
    expect(() => decodeProjection({ ...wire, attention: { capacity: "x", debt: 1, window: 2, loanCount: 2 } })).toThrow(
      /attention\.capacity/,
    );
    expect(() => decodeProjection({ ...wire, attention: { capacity: 2 } })).toThrow(/attention\.debt/);
  });

  it("a non-string causeId on the wire dies with its field path", () => {
    const wire = JSON.parse(JSON.stringify(encodeProjection(sampleProjection()))) as {
      notices: Record<string, unknown>[];
    };
    wire.notices[0]!["causeId"] = 42;
    expect(() => decodeProjection(wire)).toThrow(/notices\[0\]\.causeId/);
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

describe("boot.rules round-trip (ADR-0019 program 5 follow-on rider)", () => {
  it("the REAL g7 deck revives deep-equal through the worst transport", async () => {
    const { G7_CARDS, g7CardHash } = await import("../gates/g7/g7Deck");
    const envelope = {
      kind: "boot",
      protocol: 1,
      seed: "g7",
      speedX: 1,
      runnerKind: "sim-core",
      rules: encodeBootRules({
        entries: G7_CARDS.map((card) => ({ hash: g7CardHash(card.id), card })),
      }),
    };
    const decoded = assertToWorker(throughJson(envelope));
    if (decoded.kind !== "boot" || decoded.rules === undefined) throw new Error("expected booted rules");
    expect(decoded.rules.entries.length).toBe(G7_CARDS.length);
    for (let i = 0; i < G7_CARDS.length; i += 1) {
      expect(decoded.rules.entries[i]!.card).toEqual(G7_CARDS[i]);
    }
  });

  it("boot without the rider parses key-free (additive-optional law)", () => {
    const decoded = assertToWorker({ kind: "boot", protocol: 1, seed: "x", speedX: 1, runnerKind: "sim-core" });
    expect("rules" in decoded).toBe(false);
  });
});
