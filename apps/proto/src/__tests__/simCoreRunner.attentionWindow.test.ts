/**
 * apps/proto/src/runner/simCoreRunner.ts — the MID-RUN attention window-entry
 * seam (E2a seam (a), closing the AttentionCard gap-note @5b19a04):
 * `enterAttentionWindow(kind)` forwards the pipeline's ONLY hand-creation
 * event as an action-on-state between ticks — the same prerogative the
 * month-roll forward already exercises (@eff5694 docblock).
 *
 * Laws pinned here:
 *  · absent pool ⇒ mint-or-refuse through the public pipeline functions ONLY
 *    (createAttentionState default, then attentionWindowEntry) — the mint
 *    comes into play at the call, never before;
 *  · present pool ⇒ the entry rides it; the bounded refusal answers the
 *    pipeline's verbatim text with the state's IDENTITY (this.game untouched);
 *  · the row's createdAtMinute is the HOST business clock at the call — a
 *    mid-run loan carries a mid-run stamp, not minute 0;
 *  · opened pools surface on the frozen SimProjection wire through the
 *    EXISTING conditional AttentionSummary block (protocol-v1 shape @0b35b15
 *    — no field added, presence is the runner's planted-pool law);
 *  · a serviced mid-run loan is repaid by the SAME month-roll forward as a
 *    planted one (the seam writes no separate repayment authority).
 */
import { describe, expect, it } from "vitest";
import { MICROS_PER_MIN } from "@hh/sim-core/kernel";
import {
  createAttentionState,
  attentionWindowEntry,
} from "@hh/sim-core/pipeline";
import type { AttentionState } from "@hh/sim-core/types";
import { SimCoreRunner } from "../runner/index";

/* Business clock (kernel/time.ts, mirrors the forwarding suite): tick 2
   sits at business-minute 205 (720/7 biz-min per tick, floor), the month
   crosses at tick 420 (minute 43,200). Probe-derived literals — if the
   clock math drifts, this suite goes red BEFORE the cards do. */
const BUSINESS_MINUTE_AT_TICK_2 = 205;
const POST_ROLL_STEPS = 421;

function plantLoans(count: number): AttentionState {
  let state = createAttentionState(2);
  for (let i = 0; i < count; i += 1) {
    state = attentionWindowEntry(state, "triage-window", 0).state;
  }
  return state;
}

describe("runner.enterAttentionWindow — mid-run host seam (E2a (a) closed)", () => {
  it("absent pool: the first entry MINTS the default pool and opens", () => {
    const runner = new SimCoreRunner({ seed: 42 });
    expect(runner.attentionState()).toBeUndefined(); // default runners mint nothing
    const result = runner.enterAttentionWindow("triage-window");
    expect(result.opened).toBe(true);
    expect(result.refusal).toBeNull();
    expect(runner.attentionState()).toBe(result.state); // the write twin of attentionState()
    expect(result.state.capacity).toBe(1); // createAttentionState's OWN default
    expect(result.state.debt).toBe(1);
    expect(result.state.window).toBe(1);
    expect(result.state.loanLedger[0]?.kind).toBe("triage-window");
    runner.stop();
  });

  it("minted pool: the second entry hits the bounded refusal — state identity", () => {
    const runner = new SimCoreRunner({ seed: 42 });
    const first = runner.enterAttentionWindow("triage-window");
    const second = runner.enterAttentionWindow("grace");
    expect(second.opened).toBe(false);
    expect(second.refusal).toContain(
      "attention-debt: 1 unrepaid focus-hand loan(s) of capacity 1",
    );
    expect(second.state).toBe(first.state); // pipeline identity on refusal
    expect(runner.attentionState()).toBe(first.state); // this.game untouched
    expect(runner.attentionState()?.window).toBe(1); // no forged window
    runner.stop();
  });

  it("a mid-run loan stamps the HOST business minute, not minute 0", () => {
    const runner = new SimCoreRunner({ seed: 42, attention: plantLoans(0) });
    runner.headlessStep(10);
    runner.headlessStep(10);
    const result = runner.enterAttentionWindow("grace");
    expect(result.opened).toBe(true);
    expect(result.state.loanLedger[0]).toEqual({
      createdAtMinute: BUSINESS_MINUTE_AT_TICK_2,
      kind: "grace",
      repayAtWindow: 1,
      repaid: false,
    });
    runner.stop();
  });

  it("opened entries reach the wire through the EXISTING AttentionSummary block", () => {
    const runner = new SimCoreRunner({ seed: 42 }); // unplanted: key absent…
    expect(runner.headlessStep(10).attention).toBeUndefined();
    runner.enterAttentionWindow("triage-window"); // …until the seam mints…
    const frame = runner.headlessStep(10);
    expect(frame.attention).toEqual({ capacity: 1, debt: 1, window: 1, loanCount: 1 });
    // …and the shape stays the four frozen fields (protocol-v1, no widening)
    expect(Object.keys(frame.attention ?? {}).sort()).toEqual([
      "capacity",
      "debt",
      "loanCount",
      "window",
    ]);
    runner.stop();
  });

  it("a refusal frame-for-frame changes nothing: the bounded arm's next wire equals the twin's", () => {
    const twin = new SimCoreRunner({ seed: 7, attention: plantLoans(2) });
    const twinFrame = twin.headlessStep(10);
    const armed = new SimCoreRunner({ seed: 7, attention: plantLoans(2) });
    const refused = armed.enterAttentionWindow("triage-window"); // debt 2 = capacity 2
    expect(refused.opened).toBe(false);
    const armedFrame = armed.headlessStep(10);
    expect(armedFrame.attention).toEqual(twinFrame.attention);
    expect(armed.attentionState()).toEqual(twin.attentionState());
    twin.stop();
    armed.stop();
  });

  it("end-to-end: mid-run borrow 0→1, the month roll services it — one runner, clock never resets", () => {
    const runner = new SimCoreRunner({ seed: 42, attention: plantLoans(0) });
    expect(runner.attentionState()?.debt).toBe(0);
    runner.headlessStep(10);
    const borrow = runner.enterAttentionWindow("triage-window");
    expect(borrow.opened).toBe(true);
    expect(runner.attentionState()?.debt).toBe(1);
    for (let i = 2; i <= POST_ROLL_STEPS; i += 1) runner.headlessStep(10);
    const settled = runner.attentionState();
    expect(settled?.debt).toBe(0); // serviced by the SAME forward as planted loans
    expect(settled?.loanLedger[0]?.repaid).toBe(true);
    expect(settled?.lastReplenishBusinessMinute).toBe(43_200);
    expect(runner.lastTickFacts().game.context.minute).toBe(POST_ROLL_STEPS);
    runner.stop();
  });
});
