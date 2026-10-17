/**
 * `test/auth.host.test.ts` — the OPT-IN token gate (lane L-AUTH) at the
 * carrier layer, over real loopback sockets + a pure-function block.
 *
 * The posture under test: default OFF must be byte-for-byte the standing
 * localhost-no-auth ruling; ON must refuse at the connection boundary BEFORE
 * the hub can see a byte (no listener attached ⇒ no inbox, no route, no
 * fault — the counters below are the proof, not a vibe).
 */

import { afterEach, describe, expect, it } from "vitest";
import { AUTH_FAILURE_REASONS, createTokenGate, parseTokenParam, verifyToken } from "../src/auth.ts";
import { closeSeat, connectRejected, openSeat, settle, startTestHost } from "./hostHarness.ts";
import type { HostHandle, TestSeat } from "./hostHarness.ts";

const SECRET = "dev-secret-42";

const live: { handle: HostHandle; seats: TestSeat[] }[] = [];

async function host(options: Parameters<typeof startTestHost>[0] = {}): Promise<HostHandle> {
  const handle = await startTestHost(options);
  live.push({ handle, seats: [] });
  return handle;
}

async function seat(handle: HostHandle, id: string, query = ""): Promise<TestSeat> {
  const opened = await openSeat(handle, id, query);
  const entry = live.find((l) => l.handle === handle);
  entry?.seats.push(opened);
  return opened;
}

afterEach(async () => {
  for (const { handle, seats } of live) {
    for (const s of seats) await closeSeat(s);
    await handle.stop();
  }
  live.length = 0;
});

describe("token auth at the carrier layer (opt-in)", () => {
  it("wrong or missing token: close 1008 'policy violation' BEFORE route learning; hub sees zero bytes", async () => {
    const h = await host({ auth: { secret: SECRET } });
    expect(await connectRejected(h, "/?token=nu-uh")).toEqual([1008, "policy violation"]);
    expect(h.port.rejectedSockets()).toBe(1);
    expect(await connectRejected(h, "/")).toEqual([1008, "policy violation"]);
    expect(h.port.rejectedSockets()).toBe(2);
    expect(h.port.queued()).toBe(0); // refused sockets never got a message listener
    expect(h.port.routes()).toBe(0);
    expect(h.hub.drain()).toBe(0);
    expect(h.hub.faults()).toHaveLength(0); // refusal is carrier-layer; the hub never had a verdict to make
  });

  it("right token: the full join → submit → broadcast loop works unchanged", async () => {
    const h = await host({ auth: { secret: SECRET } });
    const alice = await seat(h, "alice", `/?token=${SECRET}`);
    const bob = await seat(h, "bob", `/?token=${SECRET}`);
    alice.client.join();
    bob.client.join();
    await settle(h, alice, bob);
    h.pumpTo(2n);
    bob.client.submit("action", { args: { verb: "communicate", target: null, note: "authed" } });
    await settle(h, alice, bob);
    expect(h.relay.sharedLog()).toHaveLength(1);
    expect(alice.client.records()).toHaveLength(1);
    expect(h.port.rejectedSockets()).toBe(0);
    expect(h.hub.faults()).toHaveLength(0);
  });

  it("ambiguous token (repeated key): refused — the gate never picks a winner", async () => {
    const h = await host({ auth: { secret: SECRET } });
    const [code] = await connectRejected(h, `/?token=${SECRET}&token=other`);
    expect(code).toBe(1008);
    expect(h.port.rejectedSockets()).toBe(1);
  });

  it("DEFAULT OFF is byte-for-byte the legacy posture: no-token accepted, token query ignored", async () => {
    const h = await host(); // no auth option — the standing ruling
    const plain = await seat(h, "alice"); // legacy: bare connect, exactly as before
    const curious = await seat(h, "bob", "/?token=whatever"); // a query means nothing here
    plain.client.join();
    curious.client.join();
    await settle(h, plain, curious);
    expect(h.relay.ledger().seatHolders.map((s) => s.participantId)).toEqual(["alice", "bob"]);
    expect(h.port.rejectedSockets()).toBe(0);
    expect(h.hub.faults()).toHaveLength(0);
  });

  it("empty secret fails loud at boot (never a silent accept-everything gate, no leaked listening port)", async () => {
    const { startHost } = await import("../src/server.ts");
    // The gate is built BEFORE the WebSocketServer literal is bound (see
    // server.ts ordering comment): a RangeError with the named code is the
    // proof there was never a port to leak.
    await expect(startHost({ tickMs: 0, auth: { secret: "" } })).rejects.toThrow(/host\[auth-secret\]/);
    await expect(startHost({ tickMs: 0, auth: { secret: "" } })).rejects.toBeInstanceOf(RangeError);
  });
});

describe("auth.ts — pure parse/verify helpers (closed reasons)", () => {
  it("parseTokenParam reads every query shape", () => {
    expect(parseTokenParam("/")).toEqual({ present: false });
    expect(parseTokenParam("/?x=1")).toEqual({ present: false });
    expect(parseTokenParam("ws://h/p?token=abc")).toEqual({ present: true, value: "abc" }); // lenient by design: any URL shape whose query carries token arms yields them (ws hands origin-form; parsing cares not)
    expect(parseTokenParam("/p?token=abc")).toEqual({ present: true, value: "abc" });
    expect(parseTokenParam("/?token=")).toEqual({ present: true, value: "" });
    expect(parseTokenParam("/?token=a&token=b").present).toBe("ambiguous");
  });

  it("verifyToken + createTokenGate: the three closed reasons, the pass, the frozen vocabulary, fail-loud boot", () => {
    expect(verifyToken("s", { present: false })).toBe("missing-token");
    expect(verifyToken("s", { present: "ambiguous" })).toBe("ambiguous-token");
    expect(verifyToken("s", { present: true, value: "S" })).toBe("bad-token"); // case is load-bearing
    expect(verifyToken("s", { present: true, value: "" })).toBe("bad-token"); // tried-and-failed, not missing
    expect(verifyToken("s", { present: true, value: "s" })).toBeNull();
    const gate = createTokenGate("ok");
    expect(gate("/?token=ok")).toBeNull();
    expect(gate("/?token=no")).toBe("bad-token");
    expect(gate("/")).toBe("missing-token");
    expect(() => createTokenGate("")).toThrow(RangeError);
    expect(AUTH_FAILURE_REASONS).toEqual(["missing-token", "ambiguous-token", "bad-token"]);
    expect(Object.isFrozen(AUTH_FAILURE_REASONS)).toBe(true);
  });
});
