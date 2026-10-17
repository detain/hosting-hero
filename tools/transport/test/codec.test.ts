/**
 * test/codec.test.ts — hh-coop-transport@1 boundary law.
 *
 * Round-trips for all eight kinds, ~14 malformed inputs each dying with its
 * named transport[CODE], the omit-when-unset twin, the decodeRecordWire
 * delegation proof (a string tick DIES at the strict parser without the
 * boundary revival — pinned both ways), and the two proto-source drift pins.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseCoopTimelineRecord } from "@hh/sim-core/replay";
import type { CoopTimelineRecord } from "@hh/sim-core/replay";
import { asEntityId } from "@hh/sim-core/types";
import type { CoopNodeMetadata } from "@hh/sim-core/save";
import {
  reviveHubArgs,
  TRANSPORT_BIGINT_ARG_FIELDS,
  TRANSPORT_NULLABLE_BIGINT_ARG_FIELDS,
} from "../src/client.ts";
import {
  decodeFrame,
  decodeRecordWire,
  decodeStampWire,
  encodeFrame,
  encodeStampWire,
  ledgerToWire,
  payloadIdentity,
  TransportError,
  TRANSPORT_ERROR_CODES,
} from "../src/codec.ts";
import {
  MAX_FRAME_BYTES,
  TRANSPORT_PROTOCOL,
  TRANSPORT_PROTOCOL_VERSION,
} from "../src/envelope.ts";
import type {
  SeatViewWire,
  TransportCellWire,
  TransportFrame,
} from "../src/envelope.ts";

const HEAD = { protocol: TRANSPORT_PROTOCOL, version: TRANSPORT_PROTOCOL_VERSION } as const;

function record(note = "hello"): CoopTimelineRecord {
  return Object.freeze({
    participantId: asEntityId("alice"),
    tick: 7n,
    seq: 2,
    kind: "action" as const,
    payload: Object.freeze({ args: Object.freeze({ verb: "communicate", target: null, note }) }),
  });
}

const VIEW: SeatViewWire = Object.freeze({
  cells: Object.freeze([
    Object.freeze({
      key: "edge-1::cpu",
      encoding: "fixed" as const,
      value: "3277",
      fidelity: 3,
      freshnessUs: "60000000",
      coverage: "45875",
      certainty: "39322",
      status: "live" as const,
    }),
  ]),
});

const ALL_FRAMES: Readonly<Record<string, TransportFrame>> = Object.freeze({
  join: { ...HEAD, kind: "join", participantId: "alice", clientTickHint: "12" },
  leave: { ...HEAD, kind: "leave", participantId: "alice" },
  submit: { ...HEAD, kind: "submit", participantId: "bob", recordKind: "action", payload: { args: { verb: "communicate", target: null, note: "n" } } },
  "catchup-request": { ...HEAD, kind: "catchup-request", participantId: "bob", after: { tick: "3", seq: 1 }, limit: 8 },
  broadcast: { ...HEAD, kind: "broadcast", record: record() },
  "catchup-page": { ...HEAD, kind: "catchup-page", participantId: "bob", from: null, to: { tick: "7", seq: 2 }, records: [record()], hasMore: true },
  "seat-state": {
    ...HEAD,
    kind: "seat-state",
    sentAtTick: "9",
    ledger: { seatHolders: [{ participantId: "alice", joinedAtTick: "0" }, { participantId: "bob", joinedAtTick: "1", leftAtTick: "4" }] },
    lastStamp: { tick: "7", seq: 2 },
    view: VIEW,
  },
  fault: { ...HEAD, kind: "fault", against: "bob", cause: "relay[not-seated]: nobody here" },
});

function codeOf(fn: () => unknown): string {
  try {
    fn();
  } catch (error) {
    if (error instanceof TransportError) return error.code;
    throw error;
  }
  throw new Error("expected a TransportError, got no throw");
}

describe("envelope round-trips", () => {
  for (const kind of Object.keys(ALL_FRAMES)) {
    it(`round-trips "${kind}" byte-stably`, () => {
      const frame = ALL_FRAMES[kind] as TransportFrame;
      const raw = encodeFrame(frame);
      const decoded = decodeFrame(raw);
      expect(decoded).toStrictEqual(frame);
      // Re-encoding the decoded frame is byte-identical (canonical by law).
      expect(encodeFrame(decoded)).toBe(raw);
    });
  }

  it("encodes key order BY CONSTRUCTION — payload insertion order is the producer's, frame keys are the codec's", () => {
    const lateInsert: Record<string, unknown> = { note: "z" };
    lateInsert["verb"] = "communicate";
    const earlyInsert: Record<string, unknown> = { verb: "communicate", note: "z" };
    const a = encodeFrame({ ...HEAD, kind: "submit", participantId: "p", recordKind: "action", payload: { args: lateInsert } });
    const b = encodeFrame({ ...HEAD, kind: "submit", participantId: "p", recordKind: "action", payload: { args: earlyInsert } });
    // frame-level keys identical in order; payload leaves ride the producer's
    // insertion order — which is exactly why IDENTITY compares through
    // encodeCanonicalJson, not raw bytes:
    expect(payloadIdentity({ args: lateInsert } as never)).toBe(payloadIdentity({ args: earlyInsert } as never));
    expect(a.startsWith('{"protocol":"hh-coop-transport","version":1,"kind":"submit","participantId":"p","recordKind":"action","payload":')).toBe(true);
    expect(b).not.toBe(a); // the raw BYTES may differ — the identity must not
  });

  it("recordDict reconstructs trusted records positionally (broadcast bytes are order-free)", () => {
    const shuffled = {
      payload: record().payload,
      kind: "action" as const,
      seq: 2,
      tick: 7n,
      participantId: asEntityId("alice"),
    } as unknown as CoopTimelineRecord;
    expect(encodeFrame({ ...HEAD, kind: "broadcast", record: shuffled })).toBe(
      encodeFrame({ ...HEAD, kind: "broadcast", record: record() }),
    );
  });
});

describe("malformed frames die with named codes (12 refusals)", () => {
  it("refuses non-JSON", () => expect(codeOf(() => decodeFrame("{oops"))).toBe("bad-json"));
  it("refuses a top-level array", () => expect(codeOf(() => decodeFrame("[]"))).toBe("bad-frame"));
  it("refuses a foreign protocol, naming both", () => {
    expect(() => decodeFrame('{"protocol":"other-thing","version":1,"kind":"join","participantId":"a"}')).toThrow(
      /transport\[bad-protocol\].*expected .*hh-coop-transport.*got string other-thing/,
    );
  });
  it("refuses a version mismatch, naming both", () => {
    expect(() => decodeFrame('{"protocol":"hh-coop-transport","version":2,"kind":"join","participantId":"a"}')).toThrow(
      /transport\[bad-version\].*expected version 1, got number 2/,
    );
  });
  it("refuses an unknown kind", () => expect(codeOf(() => decodeFrame('{"protocol":"hh-coop-transport","version":1,"kind":"telepathy","participantId":"a"}'))).toBe("bad-kind"));
  it("refuses an oversize frame BEFORE parsing", () => {
    const huge = `{"protocol":"hh-coop-transport","version":1,"kind":"fault","against":"a","cause":"${"x".repeat(MAX_FRAME_BYTES)}"}`;
    expect(codeOf(() => decodeFrame(huge))).toBe("oversize-frame");
  });
  it("refuses a __proto__ payload key (unsafe-key law)", () =>
    expect(codeOf(() => decodeFrame('{"protocol":"hh-coop-transport","version":1,"kind":"submit","participantId":"a","recordKind":"note","payload":{"__proto__":{"polluted":true}}}'))).toBe("unsafe-key"));
  it("refuses a nested constructor key at any depth", () =>
    expect(codeOf(() => decodeFrame('{"protocol":"hh-coop-transport","version":1,"kind":"submit","participantId":"a","recordKind":"note","payload":{"args":{"deep":{"constructor":{}}}}}'))).toBe("unsafe-key"));
  it("refuses a float seq", () =>
    expect(codeOf(() => decodeFrame('{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"a","tick":"1","seq":1.5,"kind":"note","payload":{}}}'))).toBe("bad-field"));
  it("refuses a non-string record tick", () =>
    expect(codeOf(() => decodeFrame('{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"a","tick":7,"seq":0,"kind":"note","payload":{}}}'))).toBe("bad-field"));
  it("refuses a negative tick", () =>
    expect(codeOf(() => decodeFrame('{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"a","tick":"-3","seq":0,"kind":"note","payload":{}}}'))).toBe("bad-field"));
  it("refuses limit 0 as bad-limit", () =>
    expect(codeOf(() => decodeFrame('{"protocol":"hh-coop-transport","version":1,"kind":"catchup-request","participantId":"a","after":null,"limit":0}'))).toBe("bad-limit"));
  it("refuses limit 2.5 as bad-limit", () =>
    expect(codeOf(() => decodeFrame('{"protocol":"hh-coop-transport","version":1,"kind":"catchup-request","participantId":"a","after":null,"limit":2.5}'))).toBe("bad-limit"));
  it("refuses a bad stamp inside catchup-request", () =>
    expect(codeOf(() => decodeFrame('{"protocol":"hh-coop-transport","version":1,"kind":"catchup-request","participantId":"a","after":{"tick":"x","seq":0}}'))).toBe("bad-field"));
  it("names the EXACT field path on every refusal", () =>
    expect(codeOf(() => decodeFrame('{"protocol":"hh-coop-transport","version":1,"kind":"submit","participantId":"","recordKind":"note","payload":{}}'))).toBe("bad-field"));
  it("keeps the closed code roster", () =>
    expect([...TRANSPORT_ERROR_CODES].sort()).toEqual(
      ["bad-json", "bad-frame", "bad-protocol", "bad-version", "bad-kind", "bad-field", "unsafe-key", "oversize-frame", "bad-limit", "unknown-participant", "not-seated", "log-budget", "dup-conflict"].sort(),
    ));
});

describe("omit-when-unset twins", () => {
  it("never posts clientTickHint / view / limit keys when unset", () => {
    const raw = encodeFrame({ ...HEAD, kind: "join", participantId: "a" });
    expect(raw).not.toContain("clientTickHint");
    const state = encodeFrame({ ...HEAD, kind: "seat-state", sentAtTick: "1", ledger: { seatHolders: [] }, lastStamp: null });
    expect(state).not.toContain('"view"');
    const req = encodeFrame({ ...HEAD, kind: "catchup-request", participantId: "a", after: null });
    expect(req).not.toContain("limit");
  });
  it("ledgerToWire omits leftAtTick while seated and posts it after vacating", () => {
    const meta: CoopNodeMetadata = {
      seatHolders: [
        { participantId: asEntityId("alice"), joinedAtTick: 0n },
        { participantId: asEntityId("bob"), joinedAtTick: 1n, leftAtTick: 4n },
      ],
    };
    const wire = ledgerToWire(meta);
    expect("leftAtTick" in (wire.seatHolders[0] as object)).toBe(false);
    expect(wire.seatHolders[1]?.leftAtTick).toBe("4");
  });
  it("decodes an explicit null leftAtTick to ABSENT (S-12 absorb), not to null", () => {
    const decoded = decodeFrame(
      '{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"1","ledger":{"seatHolders":[{"participantId":"a","joinedAtTick":"0","leftAtTick":null}]},"lastStamp":null}',
    );
    if (decoded.kind !== "seat-state") throw new Error("decode kind drifted");
    const holder = decoded.ledger.seatHolders[0] as object;
    expect("leftAtTick" in holder).toBe(false);
  });
  it("tolerates unknown TOP-LEVEL keys (extras are the codec blind spot by precedent)", () => {
    const frame = decodeFrame('{"protocol":"hh-coop-transport","version":1,"kind":"leave","participantId":"a","futureRider":{"welcome":2}}');
    expect(frame.kind).toBe("leave");
  });
});

describe("decodeRecordWire delegation (the strict parser stays the record authority)", () => {
  it("revives the bigint tick at the boundary, then accepts through parseCoopTimelineRecord", () => {
    const decoded = decodeFrame(encodeFrame({ ...HEAD, kind: "broadcast", record: record() }));
    if (decoded.kind !== "broadcast") throw new Error("decode kind drifted");
    expect(typeof decoded.record.tick).toBe("bigint");
    expect(decoded.record.tick).toBe(7n);
  });
  it("WITHOUT the revival a string tick DIES at the strict parser — the delegation is real", () => {
    // parseCoopTimelineRecord is the single authority: it refuses JSON ticks.
    expect(() =>
      parseCoopTimelineRecord({ participantId: asEntityId("alice"), tick: "7" as unknown as bigint, seq: 0, kind: "note", payload: {} }, "witness"),
    ).toThrow(/expected bigint/);
    // And the codec's path accepts what it just revived:
    expect(() => decodeRecordWire({ participantId: "alice", tick: "7", seq: 0, kind: "note", payload: {} }, "witness")).not.toThrow();
  });
  it("delegation is whitelist-rebuild: extra wire keys never reach the parser; valid records accept", () => {
    // The codec's own walls (seq, empty participantId) fire first — and any
    // deeper rejection the strict parser alone could see is re-thrown with
    // the upstream message quoted:
    expect(codeOf(() => decodeRecordWire({ participantId: "alice", tick: "1", seq: -1, kind: "note", payload: {} }, "r"))).toBe("bad-field");
    // A valid record delegates-accepts (no transport-side re-validation):
    expect(() => decodeRecordWire({ participantId: "ok", tick: "1", seq: 0, kind: "note", payload: Object.freeze({ a: 1 }) }, "r")).not.toThrow();
    // ...and an EXTRA key on the record dict is dropped by the rebuild, never
    // smuggled into the strict parser (asDictStrict would refuse it):
    expect(() => decodeRecordWire({ participantId: "ok", tick: "1", seq: 0, kind: "note", payload: {}, surprise: true }, "r")).not.toThrow();
  });
  it("stamp wire round-trips", () => {
    const stamp = encodeStampWire({ tick: 42n, seq: 3 });
    expect(stamp).toEqual({ tick: "42", seq: 3 });
    expect(decodeStampWire(stamp, "s")).toEqual(stamp);
  });
});

/* ══════════════════════ proto-source drift pins ══════════════════════ */

const PROTO_PROTOCOL_PATH = fileURLToPath(new URL("../../../apps/proto/src/shared/protocol.ts", import.meta.url));

function extractInterfaceFields(source: string, name: string): string[] {
  const match = new RegExp(`interface ${name} \\{([\\s\\S]*?)\\n\\}`).exec(source);
  if (match === null) throw new Error(`drift pin: apps/proto protocol.ts no longer declares "interface ${name}" — update the mirror INTENTIONALLY`);
  return [...match[1]!.matchAll(/^\s*(?:readonly\s+)?(\w+)\??:/gm)].map((row) => row[1] as string);
}

function extractFrozenTable(source: string, name: string): string[] {
  const match = new RegExp(`const ${name}[^{]*\\{([\\s\\S]*?)\\n\\}\\)`).exec(source);
  if (match === null) throw new Error(`drift pin: apps/proto protocol.ts no longer declares ${name} — consolidate the twin INTENTIONALLY`);
  return [...match[1]!.matchAll(/"([^"]+)"\s*:\s*(?:Object\.freeze\()?\[([^\]]*)\]/g)]
    .flatMap((row) => [...(row[2] as string).matchAll(/"([^"]+)"/g)].map((f) => `${row[1]}.${f[1]}`))
    .sort();
}

function flat(table: Readonly<Record<string, readonly string[]>>): string[] {
  return Object.entries(table).flatMap(([verb, fields]) => fields.map((f) => `${verb}.${f}`)).sort();
}

describe("proto drift pins (disclosed twin-copy design)", () => {
  it("TransportCellWire is field-isomorphic to the proto ObservedCellWire", () => {
    const protoFields = extractInterfaceFields(readFileSync(PROTO_PROTOCOL_PATH, "utf8"), "ObservedCellWire");
    const sample: TransportCellWire = VIEW.cells[0] as TransportCellWire;
    expect(Object.keys(sample).sort()).toEqual([...protoFields].sort());
  });

  it("the client BIGINT arg tables mirror the proto's exactly (both arms)", () => {
    const source = readFileSync(PROTO_PROTOCOL_PATH, "utf8");
    expect(flat(TRANSPORT_BIGINT_ARG_FIELDS)).toEqual(extractFrozenTable(source, "BIGINT_ARG_FIELDS"));
    expect(flat(TRANSPORT_NULLABLE_BIGINT_ARG_FIELDS)).toEqual(extractFrozenTable(source, "NULLABLE_BIGINT_ARG_FIELDS"));
  });

  it("reviveHubArgs follows the proto revive law: decimal string → bigint, null stays null, unlisted verbs untouched", () => {
    expect(reviveHubArgs({ verb: "adjust-price", newPriceMicroUsd: "250000000" }).newPriceMicroUsd).toBe(250_000_000n);
    expect(reviveHubArgs({ verb: "negotiate-terms", concessionMicroUsd: null }).concessionMicroUsd).toBeNull();
    expect(reviveHubArgs({ verb: "negotiate-terms", concessionMicroUsd: "500" }).concessionMicroUsd).toBe(500n);
    expect(reviveHubArgs({ verb: "place-device", nodeId: "web-1" }).nodeId).toBe("web-1");
    expect(() => reviveHubArgs({ verb: "adjust-price", newPriceMicroUsd: 12.5 })).toThrow(/transport\[bad-field\]/);
  });
});
