/**
 * PERF LANE (audit rec #4) — versus runner checkpoint memoization.
 *
 * createVersusRunner now advances ONE resumable engine and serves dense
 * per-tick snapshots (see the VersusEngine docblock in match.ts). The whole
 * point of the memo is that it must be INVISIBLE: every answer byte-identical
 * to the naive mint-per-call runner, at every tick, in any request order the
 * replay harness (captureRun ascending ring, verifyReplay bisection probes)
 * can produce.
 *
 * Pins here:
 *  1. DIFFERENTIAL — identical request sequences (ascending capture walk AND
 *     arbitrary-order bisection probes) with memo ON vs OFF produce the same
 *     digestState + totals + ruleFirings per response.
 *  2. THE MEMO IS REAL — same request twice on the default runner returns
 *     the SAME frozen snapshot object; memoize:false mints a fresh one.
 *  3. DEGRADE PATHS — a late intent reveal rebuilds (answers like naive);
 *     a rival prefix switches the instance to naive-for-life (answers like
 *     naive). Same request ⇒ same answer survives both.
 *  4. CROSS-GENERATION — a bundle captured through the naive runner verifies
 *     under a fresh memoized runner, and vice versa (verifyReplay hits every
 *     ring point — the exact O(n²)→O(n) path the memo replaces).
 *  5. ×100 HARNESS GATE at the full 280-tick match stays green, cross-seam
 *     equal to the monolithic resolveVersusMatch digest.
 *  6. BENCH — measured naive vs memoized capture+verify wall time with a
 *     contention-adaptive ≥2× floor (repo pattern, policy/perf-hotpath).
 *  7. MEMORY — measured retained-snapshot cost (the trade the memo buys).
 */
import { describe, expect, it } from "vitest";
import type { ExternalIntent, ReplayContentHashes } from "../../types.ts";
import { digestState } from "../../pipeline/index.ts";
import { captureRun, createHarness, verifyReplay, type SimRunnerRequest, type StampedIntent } from "../../replay/index.ts";
import { encodeTaggedTree } from "../../internal/canonical.ts";
import {
  createVersusRunner,
  initialVersusRunState,
  resolveVersusMatch,
  stampReserveIntents,
  type VersusMatchConfig,
  type VersusRunState,
} from "../match.ts";
import { GAUGE_CARD, matchConfig, RAW_DECK_MAIN, parseDeck } from "./fixtures.ts";

/* ═══════════════════════ the 280-tick scenario ═══════════════════════ */

const TICKS = 280;

const CONFIG: VersusMatchConfig = matchConfig({
  deck: parseDeck(RAW_DECK_MAIN),
  matchTicks: TICKS,
});

const REPLAY_HASHES: ReplayContentHashes = Object.freeze({
  rulesetCardHashes: Object.freeze({}),
  sheetsHash: CONFIG.defender.sheetsHash,
  ruleBookHash: "hh-versus-memo-test",
});

/** The stamped reserve log, typed as the bundle's StampedIntent wire shape.
 *  `filter` preserves ELEMENT identity, so every tick-prefix of this array
 *  satisfies the memo's one-log law exactly like the harness does. */
const LOG: readonly StampedIntent[] =
  stampReserveIntents(CONFIG.defender.reserveIntents ?? []) as readonly unknown[] as readonly StampedIntent[];

const INITIAL = initialVersusRunState(CONFIG);

/** Bench-report logger — type-only ambient (lib ES2022 has no DOM `console`;
 *  the emit-free `declare` resolves to the realm global vitest provides).
 *  Intentional perf reporting, not debug residue. */
declare const console: { log(...data: unknown[]): void };
const report = (line: string): void => {
  console.log(line);
};

function requestAt(tick: number, intents: readonly StampedIntent[] = LOG.filter((e) => e.tick <= BigInt(tick))): SimRunnerRequest<VersusRunState> {
  return {
    initialState: INITIAL,
    runSeed: CONFIG.seed,
    targetTick: BigInt(tick),
    intentsUpToTick: intents,
  };
}

const runDigest = (runner: (request: SimRunnerRequest<VersusRunState>) => VersusRunState, tick: number, intents?: readonly StampedIntent[]): string =>
  digestState(runner(requestAt(tick, intents)).game);

const memoRunner = () => createVersusRunner(CONFIG);
const naiveRunner = () => createVersusRunner(CONFIG, { memoize: false });

/* ═══════════════════════ 2. the memo is actually serving ═══════════════════════ */

describe("versus memo — the memo is real (and the default)", () => {
  it("default runner answers the same request with the SAME frozen snapshot object", () => {
    const runner = memoRunner();
    runner(requestAt(0)); // prime the ascending pass like capture does
    runner(requestAt(200));
    const a = runner(requestAt(140));
    const b = runner(requestAt(140));
    expect(a).toBe(b); // identity ⇒ snapshot hit, no re-sim, no re-clone
    expect(Object.isFrozen(a)).toBe(true);
  });

  it("memoize:false mints a fresh object per call (the naive contract)", () => {
    const runner = naiveRunner();
    const a = runner(requestAt(140));
    const b = runner(requestAt(140));
    expect(a).not.toBe(b);
    expect(digestState(a.game)).toBe(digestState(b.game)); // pure, just not shared
  });

  it("initialVersusRunState (naive tick-0) and the memoized tick-0 snapshot byte-match", () => {
    const state = memoRunner()(requestAt(0));
    expect(digestState(state.game)).toBe(digestState(INITIAL.game));
    expect(state.totals).toEqual(INITIAL.totals);
    expect(state.ruleFirings).toBe(INITIAL.ruleFirings);
  });
});

/* ═══════════════════════ 1. differential byte-identity ═══════════════════════ */

describe("versus memo — differential: memo ON ≡ memo OFF per response", () => {
  it(
    "ascending capture walk (every tick, stride 4) digests identically on both paths",
    () => {
      const memo = memoRunner();
      const naive = naiveRunner();
      for (let tick = 0; tick <= TICKS; tick += 4) {
        const memoState = memo(requestAt(tick));
        const naiveState = naive(requestAt(tick));
        expect(digestState(memoState.game), `digest @ tick ${tick}`).toBe(digestState(naiveState.game));
        expect(memoState.totals, `totals @ tick ${tick}`).toEqual(naiveState.totals);
        expect(memoState.ruleFirings, `ruleFirings @ tick ${tick}`).toBe(naiveState.ruleFirings);
      }
    },
    180_000,
  );

  it(
    "bisection-style arbitrary order: identical answers AND order-invariance",
    () => {
      const probes = [200, 47, 280, 12, 151, 0, 233, 90, 12, 280, 279, 3];
      const memo = memoRunner();
      const naive = naiveRunner();
      const memoDigests: string[] = [];
      for (const tick of probes) {
        const memoState = memo(requestAt(tick));
        const naiveState = naive(requestAt(tick));
        const expected = digestState(naiveState.game);
        expect(digestState(memoState.game), `digest @ probe ${tick}`).toBe(expected);
        memoDigests.push(digestState(memoState.game));
      }
      // A FRESH memoized runner fed a shuffled order must produce the SAME
      // answers: request order is invisible through the memo (the purity
      // property the verifyReplay bisection walk leans on).
      const shuffled = [3, 280, 90, 0, 12, 233, 279, 151, 47, 280, 200, 12];
      const other = memoRunner();
      const otherByTick = new Map<number, string>();
      const naiveByTick = new Map<number, string>();
      const naive2 = naiveRunner();
      for (const tick of shuffled) {
        otherByTick.set(tick, runDigest(other, tick));
        naiveByTick.set(tick, runDigest(naive2, tick));
      }
      for (const [tick, digest] of otherByTick) {
        expect(digest, `order-invariant digest @ ${tick}`).toBe(naiveByTick.get(tick));
      }
    },
    180_000,
  );

  it("an EMPTY intent log stream and the full stream both stay memo-consistent", () => {
    const memo = memoRunner();
    const naive = naiveRunner();
    for (const tick of [0, 30, 90, 280]) {
      expect(digestState(memo(requestAt(tick, [])).game)).toBe(digestState(naive(requestAt(tick, [])).game));
    }
  });
});

/* ═══════════════════════ 3. law-breach degrade paths ═══════════════════════ */

describe("versus memo — degrade paths answer exactly like naive", () => {
  it(
    "late reveal (unseen intent stamped ≤ cursor) rebuilds the engine honestly",
    () => {
      const memo = memoRunner();
      const naive = naiveRunner();
      // Pass 1: the log is invisible — cursor advances to 100 WITHOUT e5.
      const noLog = [] as readonly StampedIntent[];
      expect(digestState(memo(requestAt(100, noLog)).game)).toBe(digestState(naive(requestAt(100, noLog)).game));
      // Pass 2: e5 (tick 5 ≤ cursor 100) appears late → rebuild, re-sim from 0.
      const e5 = [LOG[0] as StampedIntent];
      expect(digestState(memo(requestAt(150, e5)).game)).toBe(digestState(naive(requestAt(150, e5)).game));
      // Pass 3: the REBUILT engine now serves the old tick with the new truth;
      // a re-request with the same (tick, intents) must repeat byte-identically.
      expect(digestState(memo(requestAt(150, e5)).game)).toBe(digestState(naive(requestAt(150, e5)).game));
      // Pass 4: a rival prefix (100 WITHOUT the e5 the engine already consumed)
      // → naive-for-life degrade, still answering exactly like naive, and the
      // SAME answer pass 1 gave (same request ⇒ same response across degrades).
      expect(digestState(memo(requestAt(100, noLog)).game)).toBe(digestState(naive(requestAt(100, noLog)).game));
      expect(digestState(memo(requestAt(100, noLog)).game)).toBe(digestState(memo(requestAt(100, noLog)).game));
    },
    180_000,
  );

  it("a swapped log (same length, different entry) degrades to naive, never lies", () => {
    // A rival that GENUINELY changes digested state: with a policyCardsByHash
    // lookup holding a card absent from the ruleBook, the swapped tick-7 slot
    // commits the decoy (EXECUTES → ruleBook grows to 2) while the base
    // commits its own book card (card-id-collision refusal). Refusals refund
    // and expire, so only this executed-append kind of swap can witness a
    // memoized lie — a place-device or timing swap digests identically here.
    const decoy = { ...GAUGE_CARD, id: "r-versus-decoy" as typeof GAUGE_CARD["id"] };
    const defender2 = {
      ...CONFIG.defender,
      policyCardsByHash: new Map([
        [GAUGE_CARD.id as string, GAUGE_CARD],
        [decoy.id as string, decoy],
      ]),
    };
    const config2 = { ...CONFIG, defender: defender2 };
    const log2 = stampReserveIntents(defender2.reserveIntents ?? []) as readonly unknown[] as readonly StampedIntent[];
    const initial2 = initialVersusRunState(config2);
    const request2 = (tick: number, intents: readonly StampedIntent[]): SimRunnerRequest<VersusRunState> => ({
      initialState: initial2,
      runSeed: config2.seed,
      targetTick: BigInt(tick),
      intentsUpToTick: intents,
    });
    const memo = createVersusRunner(config2);
    const naive = createVersusRunner(config2, { memoize: false });
    const full = log2;
    expect(digestState(memo(request2(200, full)).game)).toBe(digestState(naive(request2(200, full)).game));
    const base = full[1] as ExternalIntent;
    const rival = {
      ...base,
      intent: {
        ...base.intent,
        payload: {
          kind: "player-verb" as const,
          args: { ...(base.intent.payload as unknown as { args: Record<string, unknown> }).args, cardHash: "r-versus-decoy" },
        },
      },
    } as unknown as StampedIntent;
    const swapped = [...full.slice(0, 1), rival, ...full.slice(2)];
    expect(digestState(naive(request2(200, swapped)).game)).not.toBe(digestState(naive(request2(200, full)).game));
    const memoAfter = digestState(memo(request2(200, swapped)).game);
    expect(memoAfter).toBe(digestState(naive(request2(200, swapped)).game));
    // Degrade is permanent: repeat requests keep matching naive.
    expect(digestState(memo(request2(280, full)).game)).toBe(digestState(naive(request2(280, full)).game));
  });
});

/* ═══════════════════════ 4. cross-generation bundle verify ═══════════════════════ */

describe("versus memo — bundles cross-verify between the two runner generations", () => {
  const capture = (runner: ReturnType<typeof memoRunner>) =>
    captureRun<VersusRunState>({
      runner,
      initialState: INITIAL,
      runSeed: CONFIG.seed,
      engineVersion: CONFIG.defender.engineVersion,
      contentHashes: REPLAY_HASHES,
      totalTicks: BigInt(TICKS),
      snapshotEveryTicks: 12n,
      checkpointEveryTicks: 4n,
      embedState: false,
      digest: (state) => digestState(state.game),
      intents: LOG,
    });

  it(
    "a doc captured through the NAIVE runner verifies under a fresh MEMOIZED runner (and reverse)",
    () => {
      const naiveDoc = capture(naiveRunner());
      const viaMemo = verifyReplay({
        doc: naiveDoc,
        initialState: INITIAL,
        runner: memoRunner(),
        digest: (state) => digestState(state.game),
      });
      expect(viaMemo.ok, `memoized verify of naive doc: ${JSON.stringify(viaMemo.failures[0] ?? "ok")}`).toBe(true);
      expect(viaMemo.checkedHashPoints).toBeGreaterThan(60);

      const memoDoc = capture(memoRunner());
      const viaNaive = verifyReplay({
        doc: memoDoc,
        initialState: INITIAL,
        runner: naiveRunner(),
        digest: (state) => digestState(state.game),
      });
      expect(viaNaive.ok, "naive verify of memoized doc").toBe(true);
      // The rings themselves must be identical: the memo changed speed, not truth.
      const ring = (doc: typeof memoDoc) => doc.checkpoints.map((c) => `${String(c.tick)}:${c.stateHash}`).join("|");
      expect(ring(memoDoc)).toBe(ring(naiveDoc));
    },
    300_000,
  );
});

/* ═══════════════════════ 5. ×100 gate at full length ═══════════════════════ */

describe("versus memo — ×100 harness gate survives at 280 ticks", () => {
  it(
    "capture + replayDigests(×100) land on ONE digest, equal to the live naive resolution",
    () => {
      const harness = createHarness<VersusRunState>({
        runner: memoRunner(),
        initialState: INITIAL,
        runSeed: CONFIG.seed,
        engineVersion: CONFIG.defender.engineVersion,
        contentHashes: REPLAY_HASHES,
        totalTicks: BigInt(TICKS),
        snapshotEveryTicks: 24n,
        checkpointEveryTicks: 6n,
        embedState: false,
        digest: (state) => digestState(state.game),
        intents: LOG,
      });
      const doc = harness.capture();
      const digests = harness.replayDigests(100, doc);
      expect(new Set(digests).size).toBe(1);
      // Cross-seam: memoized runner (default) vs monolithic re-simulation —
      // the strongest independent byte-identity witness in the lane.
      expect(digests[0]).toBe(resolveVersusMatch(CONFIG).finalDigest);
    },
    300_000,
  );
});

/* ═══════════════════════ 6+7. measured cost (reported, floored) ═══════════════════════ */

/** Contention calibration spin (repo pattern, economy/journal + policy/perf):
 *  measures machine load so bench floors scale with it. Date.now (not
 *  performance.now) — the workspace ships no DOM/node type libs. */
function contentionFactor(): number {
  let spin = 0;
  const t0 = Date.now();
  for (let i = 0; i < 2e7; i += 1) spin += i & 7;
  const calMs = Math.max(1, Date.now() - t0);
  if (spin < 0) throw new Error("unreachable");
  return Math.min(4, Math.max(1, calMs / 9));
}

describe("versus memo — measured cost: speed + memory (audit rec #4 bench pin)", () => {
  const denseSequence = (runner: ReturnType<typeof memoRunner>): number => {
    const start = Date.now();
    for (let tick = 0; tick <= TICKS; tick += 4) runner(requestAt(tick));
    return Date.now() - start;
  };

  /** The realistic harness path the reviewer measured (capture's ascending
   *  ring walk + verifyReplay's point-by-point re-sim), stride 4. */
  const capturePlusVerify = (make: () => ReturnType<typeof memoRunner>): number => {
    const start = Date.now();
    const doc = captureRun<VersusRunState>({
      runner: make(),
      initialState: INITIAL,
      runSeed: CONFIG.seed,
      engineVersion: CONFIG.defender.engineVersion,
      contentHashes: REPLAY_HASHES,
      totalTicks: BigInt(TICKS),
      snapshotEveryTicks: 12n,
      checkpointEveryTicks: 4n,
      embedState: false,
      digest: (state) => digestState(state.game),
      intents: LOG,
    });
    const result = verifyReplay({
      doc,
      initialState: INITIAL,
      runner: make(),
      digest: (state) => digestState(state.game),
    });
    if (!result.ok) throw new Error("bench arm produced a failing verification");
    return Date.now() - start;
  };

  it(
    "memoized dense capture AND capture+verify are ≥2× faster than naive at 280 ticks (floor; expect ≫)",
    () => {
      const factor = contentionFactor();
      // warm both arms once (JIT parity)
      denseSequence(memoRunner());
      denseSequence(naiveRunner());
      capturePlusVerify(memoRunner);
      let bestNaive = Number.POSITIVE_INFINITY;
      let bestNaiveHarness = Number.POSITIVE_INFINITY;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        bestNaive = Math.min(bestNaive, denseSequence(naiveRunner()));
        bestNaiveHarness = Math.min(bestNaiveHarness, capturePlusVerify(naiveRunner));
      }
      let bestMemo = Number.POSITIVE_INFINITY;
      let bestMemoHarness = Number.POSITIVE_INFINITY;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        bestMemo = Math.min(bestMemo, denseSequence(memoRunner()));
        bestMemoHarness = Math.min(bestMemoHarness, capturePlusVerify(memoRunner));
      }
      const ratio = bestNaive / Math.max(1, bestMemo);
      const ratioHarness = bestNaiveHarness / Math.max(1, bestMemoHarness);
      report(
        `[versus-memo bench] ticks=${TICKS} contention=${factor.toFixed(2)} ` +
        `dense(probes=71): naive=${bestNaive}ms memoized=${bestMemo}ms speedup=${ratio.toFixed(1)}× | ` +
        `captureRun+verifyReplay: naive=${bestNaiveHarness}ms memoized=${bestMemoHarness}ms speedup=${ratioHarness.toFixed(1)}×`,
      );
      // Honest floors: ≥2× on BOTH arms' ratios (both arms contend the same
      // machine, so the ratio is contention-neutral). Expected ≫ — naive does
      // ~10k tick-sims across the 71 probes, the memoized path does 280.
      expect(ratio).toBeGreaterThanOrEqual(2);
      expect(ratioHarness).toBeGreaterThanOrEqual(2);
      expect(bestNaive).toBeGreaterThanOrEqual(50); // floors only measure real work
    },
    300_000,
  );

  it("retained-snapshot memory: per-tick state footprint under a generous ceiling", () => {
    // Deterministic proxy: canonical tagged-JSON bytes of the sampled tick
    // states (the real retained graph adds Map/BigInt header overhead — the
    // scratch-box heap delta measured 4.1MB total for 281 snapshots at this
    // scenario, ≈15KB/tick).
    const naive = naiveRunner();
    let totalBytes = 0;
    let samples = 0;
    for (let tick = 0; tick <= TICKS; tick += 28) {
      const json = JSON.stringify(encodeTaggedTree(naive(requestAt(tick)).game, (problem) => {
        throw new Error(`memo memory probe refused (${String(problem)})`);
      }));
      totalBytes += json.length;
      samples += 1;
    }
    const avgBytes = totalBytes / samples;
    const retainedCeilingBytes = avgBytes * (TICKS + 1);
    report(
      `[versus-memo memory] avg canonical state ≈ ${(avgBytes / 1024).toFixed(1)}KB × ${TICKS + 1} ` +
      `snapshots ≈ ${(retainedCeilingBytes / 1048576).toFixed(1)}MB retained per memoized runner (linear in ticks)`,
    );
    expect(retainedCeilingBytes).toBeLessThan(64 * 1048576);
  }, 180_000);
});
