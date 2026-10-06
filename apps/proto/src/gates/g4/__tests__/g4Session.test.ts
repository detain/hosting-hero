/**
 * g4Session · the door-wired cable session. The laws under test:
 *  - previews are pure (no intent, no hand, no receipt on the way out);
 *  - the host preflight bounces illegal sockets BEFORE the door;
 *  - the door's own guards (slot-occupied, power-cycle) still get the last
 *    word for issued intents and name themselves in receipts;
 *  - drag ≡ click (accessibility law): one mint point ⇒ identical cable;
 *  - the whole script replays to identical digests (determinism).
 */
import { describe, expect, it } from "vitest";
import { G4Session, powerEdgeId, profileFor } from "../g4Session.ts";

/** Advance to the (inclusive) end of tick `n` (session starts at tick 0). */
function toTick(session: G4Session, n: number): void {
  while (Number(session.snapshot().tick) < n) session.step();
}

function open(session: G4Session): void {
  session.placeDevice("web-1", "server");
  session.placeDevice("sw-1", "switch");
  session.step(); // tick 1: both EXECUTE, both hands busy until tick 4
}

const lastReceipt = (session: G4Session) => session.snapshot().receipts.at(-1);

describe("G4Session · placement through the validator callback", () => {
  it("forbidden kinds and a full rack are refused BY THE DOOR, verbatim", () => {
    const s = new G4Session(904);
    open(s);
    toTick(s, 4); // hands free again at tick 4
    s.placeDevice("web-2", "server");
    s.placeDevice("jakal-1", "forbidden"); // validator rejects the kind
    s.step();
    const receipts = s.snapshot().receipts.slice(-2);
    expect(receipts[0]?.outcome).toBe("executed");
    expect(receipts[1]?.outcome).toBe("refused");
    expect(receipts[1]?.reason).toBe('placement-rejected: rack profile forbids device kind "forbidden"');
    expect(s.snapshot().nodes.some((n) => n.id === "jakal-1")).toBe(false);

    toTick(s, 5);
    s.placeDevice("sw-2", "switch"); // 4th device, rack now full
    s.step();
    expect(lastReceipt(s)?.outcome).toBe("executed");

    toTick(s, 8); // t5's place held a token until 8 — free again
    s.placeDevice("web-3", "server");
    s.step();
    expect(lastReceipt(s)?.reason).toBe("placement-rejected: rack holds 4 devices — retire one before adding");
  });

  it("hands-exhausted is its own named refusal while both hands carry cables", () => {
    const s = new G4Session(904);
    open(s);
    s.placeDevice("web-2", "server"); // tick 2: both tokens busy until 4
    s.step();
    expect(lastReceipt(s)?.reason).toBe("hands-exhausted: need 1, free 0 of 2");
    toTick(s, 4);
    s.placeDevice("web-2", "server");
    s.step();
    expect(lastReceipt(s)?.outcome).toBe("executed"); // the retry lands
  });
});

describe("G4Session · preflight is pure and bounces before the door", () => {
  it("a grammar-mismatched pair mints NOTHING: no receipt, no hand spent", () => {
    const s = new G4Session(904);
    open(s);
    const before = s.snapshot();
    const verdict = s.previewCable("web-1:data:db-out", "sw-1:data:panel-in");
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) expect(verdict.reason).toContain("sql-out into silence");
    const after = s.snapshot();
    expect(after.receipts.length).toBe(before.receipts.length); // nothing hit the door
    expect(after.hands).toStrictEqual(before.hands); // no hand moved
    expect(after.digest).toBe(before.digest); // state untouched — pure preflight
    // the same pair through the legal port fits:
    expect(s.previewCable("web-1:data:eth0", "sw-1:data:panel-in").ok).toBe(true);
  });

  it("duplicate previews refuse at preflight once the cable is seated", () => {
    const s = new G4Session(904);
    open(s);
    toTick(s, 4);
    const first = s.previewCable("web-1:data:eth0", "sw-1:data:panel-in");
    expect(first.ok).toBe(true);
    if (first.ok) s.commitCable(first.preview, "drag");
    s.step(); // tick 5 EXECUTES the cable
    expect(s.snapshot().boardVersion).toBe(1);
    const again = s.previewCable("web-1:data:eth0", "sw-1:data:panel-in");
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.reason).toBe("cable already seated: edge:data:web-1->sw-1");
  });

  it("shape mismatch and self-edge bounce with R32 words", () => {
    const s = new G4Session(904);
    open(s);
    const cross = s.previewCable("web-1:data:eth0", "sw-1:power:psu1");
    expect(cross.ok).toBe(false);
    if (!cross.ok) expect(cross.reason).toContain("shape mismatch");
    const self = s.previewCable("web-1:data:eth0", "web-1:data:db-out");
    expect(self.ok).toBe(false);
    if (!self.ok) expect(self.reason).toContain("cannot cable itself");
  });

  it("the preview card prices the dependency the door will actually charge", () => {
    const s = new G4Session(904);
    open(s);
    const verdict = s.previewCable("web-1:data:eth0", "sw-1:data:panel-in");
    if (!verdict.ok) throw new Error("expected a fit");
    expect(verdict.preview.card.edgeId).toBe("edge:data:web-1->sw-1");
    expect(verdict.preview.delta.deltaUs).toBeGreaterThan(0n); // 20ms switch hop, queue-adjusted
    expect(verdict.preview.card.attackSurface.map((a) => a.family)).toStrictEqual(["network", "software"]);
    // power cables carry the slot in the edge id — door-identical mint
    const power = s.previewCable("web-1:power:psu1", "sw-1:power:psu1");
    if (!power.ok) throw new Error("power should seat");
    expect(power.preview.card.edgeId).toBe(powerEdgeId("power", "web-1", "sw-1", "psu1"));
  });
});

describe("G4Session · accessibility law, drag ≡ click", () => {
  const script = (origin: "drag" | "click") => {
    const s = new G4Session(904);
    open(s);
    toTick(s, 4);
    const verdict = s.previewCable("web-1:data:eth0", "sw-1:data:panel-in");
    if (!verdict.ok) throw new Error("expected a fit");
    s.commitCable(verdict.preview, origin);
    s.step();
    return s;
  };

  it("both gestures mint the SAME args — the sim cannot tell them apart", () => {
    const s = new G4Session(904);
    open(s);
    const a = s.previewCable("web-1:data:eth0", "sw-1:data:panel-in");
    const b = s.previewCable("web-1:data:eth0", "sw-1:data:panel-in");
    expect(a.ok && b.ok ? a.preview.args : null).toStrictEqual(b.ok && a.ok ? b.preview.args : null);
    expect(a.ok ? canonicalArgs(a.preview) : "").toBe(b.ok ? canonicalArgs(b.preview) : "");
  });

  it("both gestures land an identical cable: same version bump, same edge, same digests", () => {
    const drag = script("drag");
    const click = script("click");
    expect(click.snapshot().boardVersion).toBe(1);
    expect(click.snapshot().edges.map((e) => e.id)).toStrictEqual(["edge:data:web-1->sw-1"]);
    expect(click.snapshot().digest).toBe(drag.snapshot().digest);
    expect(click.receiptsDigest()).toBe(drag.receiptsDigest()); // client labels EXCLUDED by design
  });

  function canonicalArgs(preview: { args: unknown }): string {
    return JSON.stringify(preview.args, (_k, v) => (typeof v === "bigint" ? v.toString() : v));
  }
});

describe("G4Session · the door keeps the last word on issued cables", () => {
  it("slot-occupied and power-cycle refusals name themselves from the session path", () => {
    const s = new G4Session(904);
    open(s);
    toTick(s, 4);
    s.placeDevice("web-2", "server");
    s.step(); // tick 4: place pays t0 (busy→7)
    const feed = s.previewCable("web-1:power:psu1", "sw-1:power:psu1");
    if (!feed.ok) throw new Error("psu1 should seat");
    s.commitCable(feed.preview, "drag"); // pays t1 at tick 5 (busy→8)
    s.step();
    expect(lastReceipt(s)?.outcome).toBe("executed"); // the feed is v1

    toTick(s, 8); // web-2's server card has psu1 too; hands free again at 8
    const steal = s.previewCable("web-2:power:psu1", "sw-1:power:psu1");
    if (steal.ok) s.commitCable(steal.preview, "click");
    const backfeed = s.previewCable("sw-1:power:psu2", "web-1:power:psu2");
    if (backfeed.ok) s.commitCable(backfeed.preview, "click");
    s.step(); // tick 9: both REFUSED by the door, hands restored
    const receipts = s.snapshot().receipts.slice(-2);
    expect(receipts[0]?.reason).toContain("one supplier per socket");
    expect(receipts[1]?.reason).toContain("the feed graph is a tree");
    expect(s.snapshot().boardVersion).toBe(1); // refusals bumped nothing
  });

  it("disconnect-drain is a plain pull: version bumps, edge disappears, receipt executes", () => {
    const s = new G4Session(904);
    open(s);
    toTick(s, 4);
    const cable = s.previewCable("web-1:data:eth0", "sw-1:data:panel-in");
    if (!cable.ok) throw new Error("expected a fit");
    s.commitCable(cable.preview, "drag");
    s.step(); // tick 5 EXECUTES the cable (t0→8)
    toTick(s, 8);
    s.pullCable("edge:data:web-1->sw-1");
    s.step(); // disconnect pays a hand (2 ticks)
    expect(lastReceipt(s)?.outcome).toBe("executed");
    expect(lastReceipt(s)?.verb).toBe("disconnect-drain");
    expect(s.snapshot().boardVersion).toBe(2);
    expect(s.snapshot().edges).toHaveLength(0);
  });

  it("pulling a cable that is not there bounces at the door (unknown edge)", () => {
    const s = new G4Session(904);
    open(s);
    toTick(s, 5); // the places' hands release at 4/5 — payment must not mask the law
    s.pullCable("edge:data:ghost->nowhere"); // v0 session routes straight to the door
    s.step();
    expect(lastReceipt(s)?.outcome).toBe("refused");
    expect(lastReceipt(s)?.reason).toContain("unknown-edge");
  });

  it("Shift-memo: a remembered action class never sees a card again", () => {
    const s = new G4Session(904);
    open(s);
    const cable = s.previewCable("web-1:data:eth0", "sw-1:data:panel-in");
    if (!cable.ok) throw new Error("expected a fit");
    expect(s.isMemoized(cable.preview.memoKey)).toBe(false);
    s.commitCable(cable.preview, "click", { remember: true });
    expect(s.isMemoized(cable.preview.memoKey)).toBe(true);
  });
});

describe("G4Session · determinism over identical scripts", () => {
  const run = () => {
    const s = new G4Session(777);
    open(s);
    const bad = s.previewCable("web-1:data:db-out", "sw-1:data:panel-in"); // preflight bounce
    expect(bad.ok).toBe(false);
    toTick(s, 4);
    const cable = s.previewCable("web-1:data:eth0", "sw-1:data:panel-in");
    if (cable.ok) s.commitCable(cable.preview, "drag");
    s.step();
    toTick(s, 8);
    s.placeDevice("web-2", "server");
    s.step();
    toTick(s, 12);
    const steal = s.previewCable("web-2:power:psu1", "sw-1:power:psu1");
    if (steal.ok) s.commitCable(steal.preview, "click");
    s.step(); // refused slot-occupied
    toTick(s, 14);
    s.pullCable("edge:data:web-1->sw-1");
    s.step();
    toTick(s, 18);
    return {
      receiptsDigest: s.receiptsDigest(),
      digest: s.snapshot().digest,
      versions: s.snapshot().boardVersion,
    };
  };

  it("two fresh sessions, same script ⇒ identical receipts and final digests", () => {
    expect(run()).toStrictEqual(run());
  });

  it("profiles are deterministic per kind+id (the host table is data, not state)", () => {
    expect(JSON.stringify(profileFor("switch", "sw-9"), (_k, v) => (typeof v === "bigint" ? v.toString() : v))).toBe(
      JSON.stringify(profileFor("switch", "sw-9"), (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
    );
  });
});
