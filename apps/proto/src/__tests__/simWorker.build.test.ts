/**
 * D7 build rider (ADR-0014 #D7) — the boot may seed the intent door's two
 * ground-truth embeds over the wire: `boot.build.hands` (the §7.5 rail) and
 * `boot.build.board` (structural edges between the runner's code-defined
 * maze nodes). Exact `boot.corpus` precedent (@1165368): PROTOCOL_VERSION
 * stays 1, the rider is additive-optional, absent ⇒ the legacy wire is
 * byte-ident (key never posted, never parsed), malformed SHAPE ⇒
 * ProtocolError at the codec, malformed MEANING ⇒ the boot faults through
 * the worker hosts' shared try/catch (lastRunner witness), never a crash.
 *
 * Witnesses (brief-shaped):
 *  · codec: closed relation vocab + the door's socket laws + exact field
 *    paths; key absence pinned BOTH parsed and posted; JSON round-trip.
 *  · drift pins: the mirror of the door's PRIVATE `defaultEdgeId` convention
 *    re-derived from pipeline/intent-door.ts source (BIGINT_ARG_FIELDS
 *    pattern); both worker hosts forward `message.build` (source scan).
 *  · liveness: a seeded edge proves ITSELF through the engine's own
 *    `edge-exists` refusal on the matching connect-verb (derived-id law);
 *    an explicit id proves itself through `disconnect-drain → pulled`;
 *    `hands:1` refuses the second same-pass connect with `free 0 of 1`.
 *  · byte-identity: no rider / empty rider / default-valued rider are
 *    100-frame digest twins of each other AND of the frozen legacy hexes
 *    (ca8863849cb3db32 / 780b1cbc61dff760, simWorker.corpus.test.ts).
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalDigest } from "@hh/sim-core/replay";
import { asEntityId } from "@hh/sim-core";
import {
  assertToWorker,
  encodeProjection,
  ProtocolError,
  type BootBuildWire,
  type SimProjection,
} from "../shared/protocol";
import { SimCoreRunner } from "../runner/index";
import { FakeWorkerLike } from "../bridge/fakeWorker";
import { SimClient } from "../bridge/simClient";

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
  return {
    fake,
    client,
    received,
    faults,
    readyInfo: () => ready,
    runner: () => fake.lastRunner as SimCoreRunner,
  };
}

/** Recording WorkerLike — inspects the EXACT posted boot envelope shape. */
function recorder() {
  const posted: Record<string, unknown>[] = [];
  const worker = {
    postMessage: (message: unknown) => {
      posted.push(message as Record<string, unknown>);
    },
    set onmessage(_handler: ((event: { data: unknown }) => void) | null) {
      /* not driven — this pin inspects outbound shape only */
    },
    set onerror(_handler: ((event: { message?: string }) => void) | null) {
      /* not driven — outbound shape only */
    },
  };
  return { posted, client: new SimClient(worker, {}) };
}

/** All notice details across every frame (door receipts land as notices). */
function noticeDetails(received: readonly SimProjection[]): string[] {
  return received.flatMap((frame) => frame.notices.map((n) => n.detail ?? ""));
}

/* ───────────────────────────── codec ───────────────────────────── */

describe("boot.build codec (additive protocol-v1 rider, ADR-0014 #D7)", () => {
  it("absent key ⇒ legacy boot parsed AND posted without a build key at all", () => {
    const parsed = assertToWorker({ kind: "boot", protocol: 1, seed: "abc", speedX: 2 });
    expect(Object.keys(parsed).sort()).toEqual(["kind", "protocol", "runnerKind", "seed", "speedX"]);
    const r = recorder();
    r.client.boot("abc");
    expect(Object.keys(r.posted[0]!).sort()).toEqual(["kind", "protocol", "runnerKind", "seed", "speedX"]);
  });

  it("parses the full rider into trusted wire form (slot default + optional id)", () => {
    const parsed = assertToWorker({
      kind: "boot",
      protocol: 1,
      seed: "abc",
      speedX: 1,
      runnerKind: "sim-core",
      build: {
        hands: 1,
        board: [
          { relation: "data", from: "edge", to: "waf" },
          { relation: "power", from: "edge", to: "waf", slot: "psu1", id: "edge:custom-1" },
        ],
        _experimental: "ignored by the codec (envelope precedent)",
      },
    });
    if (parsed.kind !== "boot") throw new Error("expected boot");
    expect(parsed.build).toEqual({
      hands: 1,
      board: [
        { relation: "data", from: "edge", to: "waf", slot: null },
        { relation: "power", from: "edge", to: "waf", slot: "psu1", id: "edge:custom-1" },
      ],
    });
    const r = recorder();
    const rider: BootBuildWire = { hands: 2, board: [{ relation: "trust", from: "waf", to: "origin", slot: null }] };
    r.client.boot("abc", 1, "sim-core", undefined, rider);
    expect(r.posted[0]!["build"]).toEqual(rider);
  });

  it("survives the JSON hop byte-ident (structuredClone-free Workerman law)", () => {
    const r = recorder();
    r.client.boot("abc", 2, "sim-core", undefined, {
      hands: 1,
      board: [{ relation: "power", from: "edge", to: "waf", slot: "psu1" }],
    });
    const parsedDirect = assertToWorker(r.posted[0]!);
    const viaJson = assertToWorker(JSON.parse(JSON.stringify(r.posted[0]!)));
    expect(viaJson).toEqual(parsedDirect);
    if (viaJson.kind !== "boot") throw new Error("expected boot");
    expect(viaJson.build).toEqual({
      hands: 1,
      board: [{ relation: "power", from: "edge", to: "waf", slot: "psu1" }],
    });
  });

  it("refuses malformed riders loud with exact field paths (house grammar)", () => {
    const boot = (build: unknown) => ({
      kind: "boot",
      protocol: 1,
      seed: "s",
      speedX: 1,
      runnerKind: "sim-core",
      build,
    });
    expect(() => assertToWorker(boot("now with feeling"))).toThrow(/boot\.build/);
    expect(() => assertToWorker(boot({ hands: -1 }))).toThrow(/boot\.build\.hands/);
    expect(() => assertToWorker(boot({ hands: 1.5 }))).toThrow(/boot\.build\.hands/);
    expect(() => assertToWorker(boot({ hands: "2" }))).toThrow(/boot\.build\.hands/);
    expect(() => assertToWorker(boot({ board: "edge->waf" }))).toThrow(/boot\.build\.board/);
    expect(() => assertToWorker(boot({ board: [{ relation: "quantum", from: "a", to: "b" }] }))).toThrow(
      /board\[0\]\.relation/,
    );
    expect(() => assertToWorker(boot({ board: [{ relation: "data", from: "", to: "b" }] }))).toThrow(
      /board\[0\]\.from/,
    );
    expect(() => assertToWorker(boot({ board: [{ relation: "data", from: "a", to: "b", id: 42 }] }))).toThrow(
      /board\[0\]\.id/,
    );
    // The door's own socket law, enforced on pre-seeded records:
    expect(() => assertToWorker(boot({ board: [{ relation: "power", from: "a", to: "b" }] }))).toThrow(
      /board\[0\]\.slot.*socket name/,
    );
    expect(() => assertToWorker(boot({ board: [{ relation: "data", from: "a", to: "b", slot: "psu1" }] }))).toThrow(
      /board\[0\]\.slot.*only for power/,
    );
  });

  it("shape garbage escapes as an envelope reject, NOT a boot (corpus precedent)", () => {
    const h = harness();
    h.fake.postMessage({ kind: "boot", protocol: 1, seed: "s", speedX: 1, runnerKind: "sim-core", build: { hands: "many" } });
    expect(() => h.fake.pump(0)).toThrow(ProtocolError);
    expect(h.fake.lastRunner).toBeNull();
    expect(h.received.length).toBe(0);
  });
});

/* ─────────────────────────── drift pins ─────────────────────────── */

describe("derived-id mirror + host forward drift pins", () => {
  it("the door's private defaultEdgeId convention still matches our mirror", () => {
    const source = readFileSync(
      join(process.cwd(), "..", "..", "packages", "sim-core", "src", "pipeline", "intent-door.ts"),
      "utf8",
    );
    // simCoreRunner.deriveBoardEdgeId copies these two lines verbatim; if the
    // engine grammar ever moves, this reddens BEFORE the edge-exists witness
    // silently stops matching.
    expect(source).toContain("const base = `edge:${relation}:${from}->${to}`;");
    expect(source).toContain('return (relation === "power" && slot !== null ? `${base}:${slot}` : base) as EntityId;');
  });

  it("both worker hosts forward message.build into the ONE createRunner seam", () => {
    for (const rel of [
      join("src", "worker", "sim.worker.ts"),
      join("src", "bridge", "fakeWorker.ts"),
    ]) {
      const source = readFileSync(join(process.cwd(), rel), "utf8");
      const forwards = source.match(/message\.build/g) ?? [];
      expect(forwards.length, `${rel} must forward message.build exactly once`).toBe(1);
    }
  });
});

/* ─────────────────── legacy byte-identity (absent law) ─────────────────── */

describe("legacy boot byte-identity (additive-only protocol law)", () => {
  function bootDigests(build: BootBuildWire | undefined): string[] {
    const h = harness();
    h.client.boot("legacy", 1, "sim-core", undefined, build);
    h.fake.pump(100, 10);
    expect(h.received.length).toBe(100);
    return h.received.map((f) => canonicalDigest(encodeProjection(f)));
  }

  it("no rider / empty rider / default-valued rider all replay the frozen legacy hexes", () => {
    const bare = bootDigests(undefined);
    expect(bare[0]).toBe("ca8863849cb3db32");
    expect(bare[99]).toBe("780b1cbc61dff760");
    expect(bootDigests({})).toEqual(bare);
    // A rider naming the DEFAULTS (2 hands, no board) is today's state — the
    // `?? 2` law makes it byte-ident, not merely equivalent-by-luck.
    expect(bootDigests({ hands: 2 })).toEqual(bare);
  });
});

/* ───────────────────── seeded board/hands reach the driver ───────────────────── */

describe("worker-loop build boot — the seed is LIVE (door verdicts as witness)", () => {
  it("seeded board + hands land on the minted state (tick-0 facts witness)", () => {
    const h = harness();
    h.client.boot("seed-witness", 1, "sim-core", undefined, {
      hands: 1,
      board: [
        { relation: "data", from: "edge", to: "waf" },
        { relation: "power", from: "edge", to: "waf", slot: "psu1", id: "edge:custom-1" },
      ],
    });
    h.fake.pump(0);
    const game = h.runner().lastTickFacts().game;
    expect(game.hands?.capacity).toBe(1);
    expect(game.board?.version).toBe(0);
    expect([...game.board!.edges.keys()]).toEqual([
      // createBoardState sorts by id — insertion order never leaks.
      "edge:custom-1",
      "edge:data:edge->waf",
    ]);
    expect(game.board!.edges.get(asEntityId("edge:data:edge->waf"))?.slot).toBeNull();
  });

  it("a seeded edge refuses the matching connect-verb edge-exists (derived-id liveness)", () => {
    const h = harness();
    h.client.boot("edge-exists", 1, "sim-core", undefined, {
      board: [{ relation: "data", from: "edge", to: "waf" }],
    });
    h.client.sendPlayerVerb({ verb: "connect-ports", relation: "data", from: "edge", to: "waf", slot: null });
    h.fake.pump(2, 10);
    expect(noticeDetails(h.received)).toContainEqual(
      'connect-ports: edge-exists: "edge:data:edge->waf"',
    );
  });

  it("a fresh connect executes and grows the seeded board (version bump witness)", () => {
    const h = harness();
    h.client.boot("connect-exec", 1, "sim-core", undefined, {
      board: [{ relation: "data", from: "edge", to: "waf" }],
    });
    h.client.sendPlayerVerb({ verb: "connect-ports", relation: "data", from: "waf", to: "origin", slot: null });
    h.fake.pump(2, 10);
    expect(noticeDetails(h.received)).toContainEqual("connect-ports: data:waf->origin");
    const board = h.runner().lastTickFacts().game.board!;
    expect(board.version).toBe(1);
    expect([...board.edges.keys()]).toEqual(["edge:data:edge->waf", "edge:data:waf->origin"]);
  });

  it("an explicit rider id disconnects by that id (custom-key liveness)", () => {
    const h = harness();
    h.client.boot("custom-id", 1, "sim-core", undefined, {
      board: [{ relation: "trust", from: "waf", to: "origin", id: "edge:custom-1" }],
    });
    h.client.sendPlayerVerb({ verb: "disconnect-drain", edgeId: "edge:custom-1" });
    h.fake.pump(2, 10);
    expect(noticeDetails(h.received)).toContainEqual("disconnect-drain: pulled:edge:custom-1");
    expect(h.runner().lastTickFacts().game.board!.edges.size).toBe(0);
  });

  it("hands:1 pays the rail once — the second same-pass verb refuses hands-exhausted of 1", () => {
    const h = harness();
    h.client.boot("hands-one", 1, "sim-core", undefined, { hands: 1 });
    // Both stamped for tick 1 before the first step — ONE door pass, ONE hand.
    h.client.sendPlayerVerb({ verb: "connect-ports", relation: "data", from: "edge", to: "waf", slot: null });
    h.client.sendPlayerVerb({ verb: "connect-ports", relation: "data", from: "waf", to: "origin", slot: null });
    h.fake.pump(2, 10);
    const details = noticeDetails(h.received);
    expect(details).toContainEqual("connect-ports: data:edge->waf");
    expect(details.some((d) => /connect-ports: hands-exhausted.*free 0 of 1/.test(d))).toBe(true);
  });

  it("the fake-host boot equals a direct SimCoreRunner seed (hosts cannot drift)", () => {
    const rider: BootBuildWire = {
      hands: 3,
      board: [{ relation: "power", from: "edge", to: "waf", slot: "psu1" }],
    };
    const h = harness();
    h.client.boot("twin", 1, "sim-core", undefined, rider);
    h.fake.pump(0);
    const direct = new SimCoreRunner({ seed: 1, build: rider });
    const a = h.runner().lastTickFacts().game;
    const b = direct.lastTickFacts().game;
    expect([...a.board!.edges.keys()]).toEqual([...b.board!.edges.keys()]);
    expect(a.hands?.capacity).toBe(b.hands?.capacity);
    direct.stop();
  });
});

/* ───────────────── construction-domain walls fault the boot ───────────────── */

describe("build domain walls fault loud (never a quiet boot, never a crash)", () => {
  it("mock + build is a wiring bug: faulted, no ready frame, no crash", () => {
    const h = harness();
    h.client.boot("wrong-kind", 1, "mock", undefined, { hands: 1 });
    expect(() => h.fake.pump(0)).not.toThrow();
    expect(h.readyInfo()).toBeNull();
    expect(h.received.length).toBe(0);
    expect(h.faults.some((f) => f.includes('build rider requires runnerKind "sim-core"'))).toBe(true);
  });

  it("hands:0 faults through mintHandState's engine law VERBATIM (forwarded wall)", () => {
    const h = harness();
    h.client.boot("zero-rail", 1, "sim-core", undefined, { hands: 0 });
    h.fake.pump(0);
    expect(h.faults.some((f) => f.includes("mintHandState") && f.includes("capacity must be a safe integer >= 1"))).toBe(
      true,
    );
    expect(h.fake.lastRunner).toBeNull();
    expect(h.readyInfo()).toBeNull();
  });

  it("an off-roster endpoint faults at the boot (nodes are not wire-seedable)", () => {
    const h = harness();
    h.client.boot("dangling", 1, "sim-core", undefined, {
      board: [{ relation: "data", from: "rack-9", to: "waf" }],
    });
    h.fake.pump(0);
    expect(h.faults.some((f) => f.includes('names unknown node "rack-9"'))).toBe(true);
    expect(h.fake.lastRunner).toBeNull();
  });

  it("duplicate edge ids fault loud — derived collisions included (no silent overwrite)", () => {
    const h = harness();
    h.client.boot("dupe", 1, "sim-core", undefined, {
      board: [
        { relation: "data", from: "edge", to: "waf" },
        { relation: "data", from: "edge", to: "waf", id: "edge:data:edge->waf" },
      ],
    });
    h.fake.pump(0);
    expect(h.faults.some((f) => f.includes('duplicates id "edge:data:edge->waf"'))).toBe(true);
    // Direct ctor shares the wall (no worker needed to prove it).
    expect(() => new SimCoreRunner({ seed: 1, build: { hands: 0 } })).toThrow(/mintHandState/);
  });

  it("a faulted rider boot leaves NO half state — the NEXT clean boot runs", () => {
    const h = harness();
    h.client.boot("recover", 1, "sim-core", undefined, { board: [{ relation: "data", from: "nope", to: "waf" }] });
    h.fake.pump(0);
    expect(h.faults.length).toBe(1);
    h.client.boot("recover", 1, "sim-core");
    h.fake.pump(1, 10);
    expect(h.fake.lastRunner).toBeInstanceOf(SimCoreRunner);
    expect(h.received.length).toBe(1);
    expect(h.faults.length).toBe(1); // no new fault
  });
});
