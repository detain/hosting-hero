/**
 * L-SMR (wave-27, ADR-0016 mechanic B host leg) — the sellMarketRates CATALOG
 * option on the mainline SimCoreRunner.
 *
 * The catalog is a WORLD FACT the host hands the runner (era posture,
 * ADR-0019 program 4): it rides the money fold as `EconomyTickIn
 * .sellMarketRates`, outranking the installed-base anchor for the sell
 * acceptance dice (economy/tick.ts step 5.5). Two laws this file pins, both
 * sides of the seam:
 *
 *  OFF-PATH (byte-identity, the load-bearing half):
 *   - a runner CONSTRUCTED through the catalog-capable class with no catalog
 *     replays the shipped 100-frame digests byte-for-byte — the legacy boot
 *     goldens ca8863849cb3db32 / 780b1cbc61dff760 (seed 1) and the money
 *     goldens 25_005_307_300n / 25_109_732_500n (seed 42);
 *   - a catalog armed WITHOUT any sell book is inert by the fold's own gate
 *     (nothing adjudicates), digests equal; an EMPTY option equals OFF.
 *
 *  ON-PATH (the leg is real) — seed 42, probe-pinned at this lane:
 *   - a sell-offer through the door books in both arms (f2 receipt identical);
 *     ONLY the catalog arm rolls a verdict — `economy-notice sell-accepted:
 *     plan:smr-drill` on the SAME frame the fold sees the book (f2);
 *   - verdicts are market OPINION: every frame's freeCash byte-equal across
 *     arms, the digests first diverge at f2 by the notice alone;
 *   - determinism: two fresh armed-catalog runners match per-frame ×100.
 *
 * ZERO boot/protocol change (PROTOCOL_VERSION stays 1): the catalog never
 * crosses the worker wire v0 — a future `boot.catalog` rider is the named
 * candidate, deliberately NOT taken here (boot.rules @9653a96 precedent for
 * how such a rider WOULD land).
 */
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "@hh/sim-core/replay";
import { asMoney, type MoneyUnit, type PlayerIntent, type PlayerVerbArgs } from "@hh/sim-core/types";
import { encodeProjection, type SimProjection } from "../shared/protocol";
import { SimCoreRunner } from "../runner/simCoreRunner";

const TICKS = 100;

/* The host's market reading (world fact): plan:smr-drill trades at 400µ$.
 * The scripted offer below prices it at 100µ$ — a bargain against THIS
 * catalog, which the probe run confirms ACCEPTS (seed 42; direction pinned
 * from the engine, never guessed). Bare, the same offer is unadjudicated:
 * the default runner keys no contract, so the installed base has nothing
 * to anchor on (the honest anti-lie posture of wave 26). */
const CATALOG: ReadonlyMap<string, MoneyUnit> = Object.freeze(
  new Map<string, MoneyUnit>([["plan:smr-drill", asMoney(400_000_000n)]]),
);

function verbIntent(seq: number, args: Readonly<Record<string, string | number | bigint | null>>): PlayerIntent {
  return {
    seq,
    clock: "sim",
    atUs: 0n,
    origin: "player",
    payload: { kind: "player-verb", args: args as unknown as PlayerVerbArgs },
  };
}

const sellOffer = verbIntent(1, {
  verb: "sell-offer",
  targetKind: "plan",
  targetId: "smr-drill",
  offerPriceMicroUsd: 100_000_000n,
  termMonths: 12,
  effectiveAtBusinessMinute: null,
});

/** Submit the sell-offer ahead of frame 2 (stamped tick 3 — the door pass of
 *  that headlessStep books the offer and the SAME tick's money fold feeds
 *  step 5.5: verdict on f2, probe-pinned). */
function sellScript(tick: number, runner: SimCoreRunner): void {
  if (tick === 2) runner.submit(sellOffer);
}

function runFrames(
  runner: SimCoreRunner,
  ticks: number,
  before?: (tick: number, runner: SimCoreRunner) => void,
): SimProjection[] {
  const frames: SimProjection[] = [];
  for (let i = 0; i < ticks; i += 1) {
    before?.(i, runner);
    frames.push(runner.headlessStep(10));
  }
  runner.stop();
  return frames;
}

function frameDigests(
  runner: SimCoreRunner,
  before?: (tick: number, runner: SimCoreRunner) => void,
): string[] {
  return runFrames(runner, TICKS, before).map((f) => canonicalDigest(encodeProjection(f)));
}

const plainRunner = (seed: number): SimCoreRunner => new SimCoreRunner({ seed });
const catalogRunner = (seed: number): SimCoreRunner =>
  new SimCoreRunner({ seed, sellMarketRates: CATALOG });

const wireDetails = (frame: SimProjection): string[] =>
  frame.notices
    .filter((n) => (n.detail ?? "").includes("sell") || (n.detail ?? "").includes("smr"))
    .map((n) => `${n.kind}:${n.detail}`);

/* ══════════════════════ OFF-PATH: the byte-identity law ══════════════════════ */

describe("catalog seam OFF-path (option available, unarmed = dead weight, byte-for-byte)", () => {
  it("a catalog-armed runner with no sell rail digests EQUAL the default runner's (seed 42)", () => {
    expect(frameDigests(catalogRunner(42))).toEqual(frameDigests(plainRunner(42)));
  });

  it("the frozen legacy boot goldens stand through the catalog-capable class (seed 1)", () => {
    const digests = frameDigests(catalogRunner(1));
    expect(digests[0]).toBe("ca8863849cb3db32");
    expect(digests[99]).toBe("780b1cbc61dff760");
  });

  it("money goldens untouched by the arm (seed 42: 25_005_307_300n / 25_109_732_500n)", () => {
    const frames = runFrames(catalogRunner(42), TICKS);
    expect(frames[0]?.freeCashMicroUsd).toBe(25_005_307_300n);
    expect(frames[TICKS - 1]?.freeCashMicroUsd).toBe(25_109_732_500n);
  });

  it("an EMPTY catalog option equals OFF: 100-frame digests byte-equal", () => {
    const runner = new SimCoreRunner({ seed: 42, sellMarketRates: new Map<string, MoneyUnit>() });
    expect(frameDigests(runner)).toEqual(frameDigests(plainRunner(42)));
  });
});

/* ══════════════════════ ON-PATH: the leg is real ══════════════════════ */

describe("catalog seam ON-path (door-booked offer, host rate anchors the dice)", () => {
  it("BARE door arm: the offer books at f2 and rolls NO verdict — no anchor, honest unadjudicated", () => {
    const frames = runFrames(plainRunner(42), TICKS, sellScript);
    expect(wireDetails(frames[2] as SimProjection)).toEqual([
      "intent-executed:sell-offer: target=plan:smr-drill,price=100000000,term=12",
    ]);
    const all = frames.flatMap(wireDetails);
    expect(all.filter((d) => d.startsWith("economy-notice:sell-"))).toEqual([]);
  });

  it("ARMED door arm: the SAME script mints exactly one catalog-anchored verdict, same frame", () => {
    const frames = runFrames(catalogRunner(42), TICKS, sellScript);
    // Probe-pinned direction: 100µ$ against a 400µ$ host rate is a bargain →
    // acceptance. If the stream domain or the clamp law ever moves, THIS
    // literal reddens — never silently re-pin, re-probe.
    expect(wireDetails(frames[2] as SimProjection)).toEqual([
      "intent-executed:sell-offer: target=plan:smr-drill,price=100000000,term=12",
      "economy-notice:sell-accepted:plan:smr-drill",
    ]);
    const verdicts = frames.flatMap((f) => wireDetails(f)).filter((d) => d.startsWith("economy-notice:sell-"));
    expect(verdicts).toHaveLength(1); // one offer, one fingerprint, one roll
  });

  it("verdicts are OPINION: freeCash byte-equal across arms every frame; digests diverge at f2 by the notice ALONE", () => {
    const bare = runFrames(plainRunner(42), TICKS, sellScript);
    const armed = runFrames(catalogRunner(42), TICKS, sellScript);
    for (let i = 0; i < TICKS; i += 1) {
      expect(String(armed[i]?.freeCashMicroUsd), `frame ${i}`).toBe(String(bare[i]?.freeCashMicroUsd));
    }
    const bareD = bare.map((f) => canonicalDigest(encodeProjection(f)));
    const armedD = armed.map((f) => canonicalDigest(encodeProjection(f)));
    let first = 0;
    while (first < TICKS && bareD[first] === armedD[first]) first += 1;
    expect(first).toBe(2); // the verdict frame — money never moved, the tape did
    // …and both arms carry the money goldens (the zero-gross law, host level):
    expect(bare[0]?.freeCashMicroUsd).toBe(25_005_307_300n);
    expect(armed[TICKS - 1]?.freeCashMicroUsd).toBe(25_109_732_500n);
  });

  it("determinism: two fresh catalog runners, one 100-tick sell script, per-frame byte-equal", () => {
    expect(frameDigests(catalogRunner(42), sellScript)).toEqual(frameDigests(catalogRunner(42), sellScript));
  });
});
