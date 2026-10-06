/**
 * Full bridge loop, headless: SimClient ↔ FakeWorkerLike speaks the byte
 * protocol end to end — boot handshake, parsed projections into the store
 * shape, intent parsing on the worker side, and the fault path.
 */
import { describe, expect, it } from "vitest";
import { SimClient } from "../bridge/simClient";
import { FakeWorkerLike } from "../bridge/fakeWorker";
import type { SimProjection } from "../shared/protocol";
import { observedKey, asEntityId } from "@hh/sim-core";

function harness() {
  const fake = new FakeWorkerLike();
  const received: SimProjection[] = [];
  const faults: string[] = [];
  let ready: { engineVersion: string; runnerId: string } | null = null;
  const client = new SimClient(fake, {
    onReady: (info) => {
      ready = info;
    },
    onProjection: (p) => received.push(p),
    onFault: (m) => faults.push(m),
  });
  return { fake, client, received, faults, readyInfo: () => ready };
}

describe("bridge handshake", () => {
  it("boot → ready with runner identity", () => {
    const h = harness();
    h.client.boot("g1-smoke-001");
    h.fake.pump(0);
    expect(h.readyInfo()).toEqual({ engineVersion: "proto-mock-0.1.0", runnerId: "mock" });
  });

  it("pump delivers decoded, trusted projections", () => {
    const h = harness();
    h.client.boot("seed-a", 1);
    h.fake.pump(3);
    expect(h.received.length).toBe(3);
    const first = h.received[0];
    expect(first?.observed.get(observedKey(asEntityId("node/app-1"), "queueDepth"))).toBeDefined();
    expect(typeof first?.freeCashMicroUsd).toBe("bigint");
    expect(first?.seq).toBe(1);
  });

  it("worker-side fault surfaces through onFault", () => {
    const h = harness();
    h.fake.emitFault("sim exploded");
    expect(h.faults).toEqual(["sim exploded"]);
  });

  it("intent before boot is refused with a fault, not a crash", () => {
    const h = harness();
    h.client.sendSlider("defense.aggression", 32768n);
    expect(() => h.fake.pump(0)).not.toThrow();
    expect(h.faults.some((f) => f.includes("boot"))).toBe(true);
  });
});

describe("intent path", () => {
  it("slider intent arrives worker-side as a parsed PlayerIntent with bigint", () => {
    const h = harness();
    h.client.boot("seed-b");
    h.fake.pump(1);
    h.client.sendSlider("defense.aggression", 45875n, "sim");
    h.fake.pump(1);
    const intent = h.fake.lastIntent;
    expect(intent?.payload.kind).toBe("slider");
    if (intent?.payload.kind === "slider") {
      expect(intent.payload.value).toBe(45875n);
    }
  });

  it("verb intent carries a null-safe target", () => {
    const h = harness();
    h.client.boot("seed-c");
    h.fake.pump(1);
    h.client.sendVerb("scale-out", null, null);
    h.fake.pump(1);
    const intent = h.fake.lastIntent;
    if (intent?.payload.kind !== "verb") throw new Error("expected verb");
    expect(intent.payload.verb).toBe("scale-out");
    expect(intent.payload.target).toBeNull();
  });

  it("player-verb intent arrives worker-side with its flat args (door arm)", () => {
    const h = harness();
    h.client.boot("seed-ev");
    h.fake.pump(1);
    h.client.sendPlayerVerb({ verb: "communicate", note: "estate-wide", target: null });
    h.fake.pump(1);
    const intent = h.fake.lastIntent;
    if (intent?.payload.kind !== "player-verb") throw new Error("expected player-verb");
    const args = intent.payload.args as unknown as Readonly<Record<string, string | number | null>>;
    expect(args["note"]).toBe("estate-wide");
  });

  it("halt stops the runner: further pumps deliver nothing", () => {
    const h = harness();
    h.client.boot("seed-d");
    h.fake.pump(1);
    h.client.halt();
    h.fake.pump(3);
    expect(h.received.length).toBe(1);
  });
});
