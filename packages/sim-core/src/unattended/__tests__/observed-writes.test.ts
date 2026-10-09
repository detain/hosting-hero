/**
 * unattended/fastForward.ts — economy OBSERVATION forwarding (rest-host-
 * wiring lane, fix-economy handoff 2026-10-09): the money lane's
 * `out.observedWrites` (today: `company::reputation`, publish-on-change)
 * must reach the observed store and the tick-final `game.observed` map,
 * mirrored into `report.finalObserved` so hosts read cells without
 * re-running the store.
 *
 * Arms:
 *  - QUIET: no money lane at all → zero company cells.
 *  - DRIP: money lane without contracts → the economy advances but the
 *    ledger never moves → publish-on-change keeps the wire EMPTY (an
 *    absent cell is the honest witness, not a bug).
 *  - LOUD: funded hourly contracts + landing traffic → the dunning ladder
 *    runs its full course → `dunning-recovered` +150 bps ×10 and
 *    `written-off` −600 bps ×1 fold the score to 5,900 bps, published as
 *    the exact Q16.16 cell. Census arithmetic + cell value are pinned TO
 *    GETHER, so the test names its own drift if economy defaults move.
 */
import { describe, expect, it } from "vitest";
import { observedKey, asEntityId, type ObservedKey } from "../../types.ts";
import { runUnattended } from "../index.ts";
import { DRIP_MONEY, smallContract, uaConfig } from "./fixtures.ts";

const REPUTATION_KEY: ObservedKey = observedKey(asEntityId("company"), "reputation");
const OPENING_BPS = 5_000; // REPUTATION_INITIAL_BPS (economy/reputation.ts)

/** Fixed Q16.16 → whole bps (exact inverse of fromRatio(bps, 10_000n)). */
function fixedToBps(fixed: bigint): number {
  return Number((fixed * 10_000n + 32_768n) / 65_536n);
}

/** One loud 480-minute weekend: ladder completes, score moves twice. */
function loudRun() {
  return runUnattended(uaConfig({
    ticks: 480n,
    money: {
      contracts: [smallContract("c-rep", 100_000_000n, 100_000)],
      initialFreeMicroUsd: 50_000_000_000n,
    },
  }));
}

describe("fastForward economy-observation forwarding", () => {
  it("quiet run (no money lane) publishes NO company cells", () => {
    const report = runUnattended(uaConfig({ ticks: 40n }));
    expect(report.finalObserved.has(REPUTATION_KEY)).toBe(false);
    for (const key of report.finalObserved.keys()) {
      expect(String(key).startsWith("company::")).toBe(false);
    }
  });

  it("money lane without contracts keeps the reputation wire empty (publish-on-change)", () => {
    const report = runUnattended(uaConfig({ ticks: 60n, money: DRIP_MONEY }));
    expect(report.finalObserved.has(REPUTATION_KEY)).toBe(false);
  });

  it("loud run forwards company::reputation with the exact bps fold", () => {
    const report = loudRun();
    const recovered = report.summary.invoiceEvents.get("dunning-recovered") ?? 0;
    const writtenOff = report.summary.invoiceEvents.get("written-off") ?? 0;
    expect(recovered).toBe(10);
    expect(writtenOff).toBe(1);

    const cell = report.finalObserved.get(REPUTATION_KEY);
    expect(cell).toBeDefined();
    if (cell === undefined) return; // narrowing for the reads below
    // The published reading must equal the census arithmetic (signals ×
    // the PROVISIONAL bps deltas) — two independent authorities agreeing.
    const expectedBps = OPENING_BPS + recovered * 150 - writtenOff * 600;
    expect(typeof cell.value).toBe("bigint");
    if (typeof cell.value !== "bigint") return;
    expect(fixedToBps(cell.value)).toBe(expectedBps);
    expect(expectedBps).toBe(5_900);
    expect(cell.value).toBe(38_666n); // round(5900 × 65536 / 10000), half-away
    expect(cell.status).toBe("live");
    expect(cell.freshnessUs).toBe(0n);
  });

  it("forwarding is deterministic: two loud runs end on identical cells", () => {
    const a = loudRun().finalObserved.get(REPUTATION_KEY);
    const b = loudRun().finalObserved.get(REPUTATION_KEY);
    expect(a?.value).toBe(b?.value);
    expect(a?.status).toBe(b?.status);
  });
});
