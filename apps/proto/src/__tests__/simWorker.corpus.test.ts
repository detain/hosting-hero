/**
 * WORKER-CORPUS leg — the boot wire cites shipped slice waves and the
 * worker-loop hosts (real `sim.worker.ts` + in-process `fakeWorker.ts`
 * mirror) boot `SimCoreRunner` in corpus drive mode through the ONE shared
 * builder (`shared/corpusHost.ts`). Protocol stays v1: `corpus` is an
 * additive-optional boot rider (notice.causeId / attention precedent
 * @0b35b15) — absent ⇒ the legacy wire byte-ident.
 *
 * Witnesses (brief-shaped):
 *  · codec: closed enum + field-path refusals; key absence on both the
 *    parsed record and the posted wire (legacy boot byte-ident).
 *  · drift pin: the wire enum re-derived from packages/content/waves/ on
 *    disk via each slice's own `type` (era-census pattern) + every cited
 *    table's bundle law exists non-empty.
 *  · behavior: a wire boot with corpus [1] shared-web answers the EXACT
 *    schedule a direct `resolveCorpusWindows` call computes (fake seed 1,
 *    default waveStartMinute 2, law-off authority) — and a FULLY-BUILT
 *    authority replays the law-off windows byte-ident, so the law-off boot
 *    default loses no information (corpus.test.ts promise, worker side).
 *  · back-compat: a no-corpus sim-core boot is a digest twin of the plain
 *    runner across 100 frames and a frozen pre-change digest stands as the
 *    byte-identity record; the money goldens (25_005_307_300n /
 *    25_109_732_500n, seed 42) live untouched in simCoreRunner.test.ts and
 *    the gates re-run them. Boot domain walls (mock+corpus, un-shipped wave,
 *    non-ascending citation) FAULT the boot — never a silent no-op.
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { asRunSeed } from "@hh/sim-core";
import { resolveCorpusWindows } from "@hh/sim-core/scenario";
import type { ScenarioCorpusTraffic } from "@hh/sim-core/scenario";
import { canonicalDigest } from "@hh/sim-core/replay";
import {
  assertToWorker,
  encodeProjection,
  CORPUS_WIRE_TABLE_IDS,
  ProtocolError,
  type SimProjection,
} from "../shared/protocol";
import {
  workerCorpusAuthority,
  workerCorpusFullBuildLog,
  workerCorpusInvitations,
} from "../shared/corpusHost";
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
  return { fake, client, received, faults, readyInfo: () => ready };
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

const SHARED_WEB_STEM = "g1-shared-web-first-quarter";

/** The traffic the runner RESOLVES for a [1] boot (fake seed 1, the runner's
 *  default waveStartMinute 2, v0 storms-only baseline). */
function trafficOf(waves: readonly number[]): ScenarioCorpusTraffic {
  return {
    profile: "corpus",
    tableId: SHARED_WEB_STEM,
    waves,
    waveStartMinute: 2,
    baselineRatePerMin: 0,
  };
}

/* ───────────────────────────── codec ───────────────────────────── */

describe("boot.corpus codec (additive protocol-v1 rider)", () => {
  it("absent key ⇒ legacy boot parsed AND posted without a corpus key at all", () => {
    const parsed = assertToWorker({ kind: "boot", protocol: 1, seed: "abc", speedX: 2 });
    expect(Object.keys(parsed).sort()).toEqual(["kind", "protocol", "runnerKind", "seed", "speedX"]);
    expect(parsed).toEqual({ kind: "boot", protocol: 1, seed: "abc", speedX: 2, runnerKind: "mock" });
    const r = recorder();
    r.client.boot("abc");
    expect(Object.keys(r.posted[0]!).sort()).toEqual(["kind", "protocol", "runnerKind", "seed", "speedX"]);
  });

  it("parses a citation and tolerates unknown keys inside the record (envelope precedent)", () => {
    const parsed = assertToWorker({
      kind: "boot",
      protocol: 1,
      seed: "abc",
      speedX: 1,
      runnerKind: "sim-core",
      corpus: { tableId: "serverless", waves: [1, 5], _experimental: "ignored by the codec" },
    });
    if (parsed.kind !== "boot") throw new Error("expected boot");
    expect(parsed.corpus).toEqual({ tableId: "serverless", waves: [1, 5] });
    const r = recorder();
    r.client.boot("abc", 1, "sim-core", { tableId: "dedicated", waves: [2] });
    expect(r.posted[0]!["corpus"]).toEqual({ tableId: "dedicated", waves: [2] });
  });

  it("refuses malformed citations loud with exact field paths (house grammar)", () => {
    const boot = (corpus: unknown) => ({ kind: "boot", protocol: 1, seed: "s", speedX: 1, runnerKind: "sim-core", corpus });
    expect(() => assertToWorker(boot({ tableId: "gaming-cafe", waves: [1] }))).toThrow(/boot\.corpus\.tableId/);
    expect(() => assertToWorker(boot({ tableId: "shared-web", waves: "1" }))).toThrow(/boot\.corpus\.waves/);
    expect(() => assertToWorker(boot({ tableId: "shared-web", waves: ["1"] }))).toThrow(/waves\[0\]/);
    expect(() => assertToWorker(boot({ tableId: "shared-web", waves: [1.5] }))).toThrow(/waves\[0\]/);
    expect(() => assertToWorker(boot("now with feeling"))).toThrow(ProtocolError);
    expect(() => assertToWorker(boot("now with feeling"))).toThrow(/boot\.corpus/);
  });
});

/* ───────────────────────── drift pins on disk ───────────────────────── */

describe("wire enum drift pin (era-census pattern, content is authority)", () => {
  it("re-derives CORPUS_WIRE_TABLE_IDS from packages/content/waves/ slice types", () => {
    const dir = join(process.cwd(), "..", "..", "packages", "content", "waves");
    const files = readdirSync(dir)
      .filter((name) => name.endsWith(".json"))
      .sort();
    const ids = files
      .map((name) => (JSON.parse(readFileSync(join(dir, name), "utf8")) as { type: string }).type)
      .map((type) => {
        expect(type).toMatch(/^official:/);
        return type.slice("official:".length);
      })
      .sort();
    // A 9th slice on disk without joining the wire (or vice versa) reddens here.
    expect(ids).toEqual([...CORPUS_WIRE_TABLE_IDS].sort());
    expect(new Set(CORPUS_WIRE_TABLE_IDS).size).toBe(CORPUS_WIRE_TABLE_IDS.length);
  });

  it("every cited table has its type bundle and a non-empty invitation law", () => {
    for (const tableId of CORPUS_WIRE_TABLE_IDS) {
      expect(
        existsSync(join(process.cwd(), "..", "..", "packages", "content", "types", `${tableId}.json`)),
        `types/${tableId}.json must ship for wire table "${tableId}"`,
      ).toBe(true);
      expect(workerCorpusInvitations(tableId).size, `bundle "${tableId}" law must not be empty`).toBeGreaterThan(0);
    }
  });
});

/* ───────────────────── worker-loop corpus boot ───────────────────── */

describe("worker-loop corpus boot (fakeWorker mirrors sim.worker.ts)", () => {
  it("boot wire with corpus [1] answers the DIRECT seam witness (seed-pinned, law-off)", () => {
    const h = harness();
    h.client.boot("worker-corpus-pin", 1, "sim-core", { tableId: "shared-web", waves: [1] });
    h.fake.pump(0);
    expect(h.readyInfo()).not.toBeNull();
    expect(h.fake.lastRunner).toBeInstanceOf(SimCoreRunner);
    const runner = h.fake.lastRunner as SimCoreRunner;
    const traffic = trafficOf([1]);
    const authority = workerCorpusAuthority("shared-web");
    const [cited] = resolveCorpusWindows(traffic, asRunSeed(1n), authority);
    expect(cited).toBeDefined();
    expect(runner.corpusTraffic()).toEqual(traffic);
    // The envelope the arrivals will ride IS the seam's own minted envelope.
    expect(runner.waveEnvelopes().get(1)).toEqual(cited!.envelope);
    expect(runner.corpusPlan()![0]).toEqual({
      wave: 1,
      judgedAtMinute: 2,
      scheduled: true,
      startMinute: cited!.startMinute,
      windowMinutes: cited!.windowMinutes,
      excluded: [], // law-off: nothing gated, nothing deferred
    });
  });

  it("pump drives the cited storm to real terminals", () => {
    const h = harness();
    h.client.boot("worker-corpus-drive", 1, "sim-core", { tableId: "shared-web", waves: [1] });
    h.fake.pump(60, 10);
    expect(h.received.length).toBe(60);
    const last = h.received[h.received.length - 1]!;
    const { served, bounced, blockedFalsePositive, landed } = last.counters;
    expect(served + bounced + blockedFalsePositive + landed).toBeGreaterThan(0);
  });

  it("a fully-built surface replays the law-off boot windows byte-ident (boot default loses nothing)", () => {
    const base = workerCorpusAuthority("shared-web");
    const seeded = Object.freeze({
      ...base,
      invitations: workerCorpusInvitations("shared-web"),
      buildLog: workerCorpusFullBuildLog("shared-web"),
    });
    const shape = (windows: ReturnType<typeof resolveCorpusWindows>) =>
      windows.map((w) => ({ waveN: w.waveN, startMinute: w.startMinute, windowMinutes: w.windowMinutes, envelope: w.envelope }));
    // [1, 5] exercises the packed-cursor law: any shift between the two
    // authorities would move wave 5's placement dice.
    expect(shape(resolveCorpusWindows(trafficOf([1, 5]), asRunSeed(1n), seeded))).toEqual(
      shape(resolveCorpusWindows(trafficOf([1, 5]), asRunSeed(1n), base)),
    );
  });
});

/* ─────────────────────── back-compat byte identity ─────────────────────── */

describe("legacy boot byte-identity (additive-only protocol law)", () => {
  /** 100 frames of seed-1 sim-core through the fake's boot path, digested. */
  function fakeBootDigests(): string[] {
    const h = harness();
    h.client.boot("legacy", 1, "sim-core");
    h.fake.pump(100, 10);
    expect(h.received.length).toBe(100);
    return h.received.map((f) => canonicalDigest(encodeProjection(f)));
  }

  it("a no-corpus boot through the fake is a digest twin of the plain runner ×100", () => {
    const runner = new SimCoreRunner({ seed: 1 });
    const direct: string[] = [];
    for (let i = 0; i < 100; i += 1) direct.push(canonicalDigest(encodeProjection(runner.headlessStep(10))));
    runner.stop();
    const viaFake = fakeBootDigests();
    expect(viaFake).toEqual(direct);
    // Fresh second boot: the wire path itself is replay-stable (two fakes).
    expect(fakeBootDigests()).toEqual(viaFake);
    // Frame 1 carries the ledger priming witness on the WIRE (decoded side),
    // proving the money lane still flows through the boot change untouched.
    const h = harness();
    h.client.boot("legacy-cash", 1, "sim-core");
    h.fake.pump(1, 10);
    expect(h.received[0]!.freeCashMicroUsd).toBeGreaterThan(25_000_000_000n);
  });

  it("frozen pre-change digest stands — the 100-frame seed-1 terminal digests are the record", () => {
    const digests = fakeBootDigests();
    // Captured @ this lane (pre-change code path == post-change default path:
    // the corpus rider is dead weight when absent). Frame-0 and terminal
    // digests pinned; a movement here means the boot wire changed behavior.
    expect(digests[0]).toBe("ca8863849cb3db32");
    expect(digests[99]).toBe("780b1cbc61dff760");
  });
});

/* ─────────────────────────── boot fault walls ─────────────────────────── */

describe("boot domain walls fault loud (never a quiet season, never a crash)", () => {
  it('mock + corpus is a wiring bug: faulted, no ready frame, no crash', () => {
    const h = harness();
    h.client.boot("wrong-kind", 1, "mock", { tableId: "dedicated", waves: [1] });
    expect(() => h.fake.pump(0)).not.toThrow();
    expect(h.readyInfo()).toBeNull();
    expect(h.received.length).toBe(0);
    expect(h.faults.some((f) => f.includes('requires runnerKind "sim-core"'))).toBe(true);
  });

  it("an un-shipped wave citation faults CORPUS_UNRESOLVED at the boot (before tick 1)", () => {
    const h = harness();
    h.client.boot("starved", 1, "sim-core", { tableId: "shared-web", waves: [9] });
    h.fake.pump(0);
    expect(h.faults.some((f) => f.includes("CORPUS_UNRESOLVED"))).toBe(true);
    expect(h.fake.lastRunner).toBeNull();
  });

  it("a non-ascending citation faults at the boot (runner domain wall, forwarded verbatim)", () => {
    const h = harness();
    h.client.boot("unordered", 1, "sim-core", { tableId: "shared-web", waves: [5, 1] });
    h.fake.pump(0);
    expect(h.faults.some((f) => f.includes("strictly ascending"))).toBe(true);
    expect(h.readyInfo()).toBeNull();
  });
});
