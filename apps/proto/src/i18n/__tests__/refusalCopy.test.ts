/**
 * i18n refusalCopy — the door's wire reasons rendered as pack prose, and the
 * raw fallback kept VISIBLE when the pack (or the detail grammar) doesn't
 * cover a code. Canonical reason strings mirror intent-door.ts emission
 * sites byte-for-byte (the corpusDrift test re-derives the code census from
 * the door's own source).
 */
import { describe, expect, it } from "vitest";
import { describeRefusal, doorCode } from "../refusalCopy.ts";

const ctx = (over: Record<string, unknown> = {}) => ({
  verb: "connect-ports",
  tick: "2",
  hands: [
    { busyUntilTick: "4", busyCauseId: "intent:1" },
    { busyUntilTick: "5", busyCauseId: "intent:2" },
  ],
  ...over,
});

describe("i18n/refusalCopy · the five voiced codes render pack prose", () => {
  it("unknown-node", () => {
    const line = describeRefusal('unknown-node: "db-1"', ctx());
    expect(line).toEqual({
      code: "unknown-node",
      fromPack: true,
      text: "No board object named db-1 exists at the current tick. Nothing was changed.",
    });
  });

  it("edge-exists (data relation)", () => {
    const line = describeRefusal('edge-exists: "edge:data:web-1->sw-1"', ctx());
    expect(line.fromPack).toBe(true);
    expect(line.text).toBe(
      "A data cable already links web-1 to those endpoints. The existing edge was left as it is.",
    );
  });

  it("edge-exists (power edge keeps its slot suffix out of the prose)", () => {
    const line = describeRefusal('edge-exists: "edge:power:sw-1->web-1:psu1"', ctx());
    expect(line.fromPack).toBe(true);
    expect(line.text).toBe(
      "A power cable already links sw-1 to those endpoints. The existing edge was left as it is.",
    );
  });

  it("slot-occupied", () => {
    const reason =
      'slot-occupied: "psu1" on "web-1" fed by "sw-1" — one supplier per socket';
    const line = describeRefusal(reason, ctx());
    expect(line.fromPack).toBe(true);
    expect(line.text).toBe(
      "psu1 on web-1 is occupied. One supplier per socket; disconnect before you reconnect.",
    );
  });

  it("stamped-in-future (verb from the receipt, target tick from the detail)", () => {
    const line = describeRefusal("stamped-in-future: entry tick 9 > current 2", ctx());
    expect(line.fromPack).toBe(true);
    expect(line.text).toBe(
      "The connect-ports intent is stamped for tick 9, ahead of the current minute. Nothing was spent.",
    );
  });

  it("hands-exhausted (the presents-at tick is the earliest busy hand)", () => {
    const line = describeRefusal(
      "hands-exhausted: need 1, free 0 of 2",
      ctx({ verb: "place-device" }),
    );
    expect(line.fromPack).toBe(true);
    expect(line.text).toBe(
      "Both hands are committed. The place-device intent is queued and presents when a hand frees at tick 4.",
    );
  });

  it("hands-exhausted with no hand in flight promises one tick out", () => {
    const line = describeRefusal(
      "hands-exhausted: need 1, free 0 of 2",
      ctx({ hands: [{ busyUntilTick: "1", busyCauseId: null }, { busyUntilTick: "2", busyCauseId: null }] }),
    );
    expect(line.text).toContain("frees at tick 3.");
  });
});

describe("i18n/refusalCopy · the raw fallback stays visible", () => {
  it("unvoiced code → raw reason verbatim, fromPack false", () => {
    const line = describeRefusal("empty-note", ctx());
    expect(line).toEqual({ code: "empty-note", text: "empty-note", fromPack: false });
  });

  it("unvoiced code WITH detail → the full wire string survives", () => {
    const line = describeRefusal("placement-rejected: rack profile forbids device kind \"forbidden\"", ctx());
    expect(line.fromPack).toBe(false);
    expect(line.text).toContain("rack profile forbids");
  });

  it("voiced code whose DETAIL no longer parses → raw (never a half-filled lie)", () => {
    const line = describeRefusal("unknown-node", ctx()); // colon-detail missing
    expect(line.fromPack).toBe(false);
    expect(line.text).toBe("unknown-node");
  });

  it("doorCode splits at the first colon, tolerates bare codes", () => {
    expect(doorCode('edge-exists: "edge:data:a->b"')).toBe("edge-exists");
    expect(doorCode("self-edge")).toBe("self-edge");
    expect(doorCode("")).toBe("");
  });

  it("both packs voice the five codes with identical prose", () => {
    for (const [reason, over] of [
      ['unknown-node: "db-1"', {}],
      ['edge-exists: "edge:data:web-1->sw-1"', {}],
      ["hands-exhausted: need 1, free 0 of 2", { verb: "place-device" }],
    ] as const) {
      const sw = describeRefusal(reason, { ...ctx(over), packId: "shared-web" });
      const game = describeRefusal(reason, { ...ctx(over), packId: "game" });
      expect(sw.fromPack).toBe(true);
      expect(game.text).toBe(sw.text);
    }
  });
});
