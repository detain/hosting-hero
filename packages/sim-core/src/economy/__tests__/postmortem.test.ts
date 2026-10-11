/**
 * §7.7 BLAMELESS POSTMORTEM — the engine-side filing card
 * (economy/postmortem.ts; audit g21's PARTIAL post-mortem rows).
 *
 * Pins:
 *  - PRESENCE-GATE (sacred): no `postMortems` input ⇒ identical state,
 *    identical notices, `postMortemLog` key ABSENT (absent-while-idle —
 *    the OD-25 death-key law);
 *  - the §7.7 attribution gate: two changes in flight ⇒ the card cannot
 *    attribute ⇒ `postmortem-unattributed`, zero credit, and the log keeps
 *    the attempt so a RE-file after the ambiguity clears CAN earn (the
 *    lifetime guard only blocks already-CREDITED incidents);
 *  - `style: "blame"` is a values-with-mechanical-consequences branch:
 *    filed and logged, ZERO credit, NO honestHostFloor;
 *  - a credited blameless card rides the SAME `honest-postmortem` signal
 *    as @57ea80e's host-assert path — bps AND the permanent transparency
 *    floor (§5.10), never a forked ledger;
 *  - one incident, one channel: the same cause via BOTH inputs in the same
 *    tick throws (double credit is authoring poison);
 *  - host list order never leaks: filings adjudicate sorted by cause.
 */

import { describe, expect, it } from "vitest";
import { asCauseId, asEntityId, type CauseId, type EntityId } from "../../types.js";
import { defaultEconomyConfig } from "../config.js";
import { emptyEconomyState } from "../state.js";
import {
  foldPostMortemFilings,
  parsePostMortemFilings,
  POST_MORTEM_ENTITY,
  POST_MORTEM_STYLES,
  postMortemNoticeCauseId,
  postMortemReputationSignals,
  type PostMortemFiling,
  type PostMortemRecord,
} from "../postmortem.js";
import { runEconomyTick, type EconomyTickIn, type EconomyNotice } from "../tick.js";
import { SEED, contractOf, ctxAt, stateWithCash } from "./helpers.js";

const cfg = defaultEconomyConfig();
const CREDIT = cfg.reputation.honestPostmortemBps;

const filing = (
  incident: string,
  style: "blameless" | "blame" = "blameless",
  changes = 1,
): PostMortemFiling => ({
  incidentCauseId: asCauseId(incident),
  style,
  changesInFlight: changes,
});

/* ────────────────────────── boundary parse ──────────────────────────── */

describe("parsePostMortemFilings — fail-loud, order-normalizing", () => {
  it("rejects junk shapes, bad styles, and change counts under one — naming the index", () => {
    expect(() => parsePostMortemFilings([null])).toThrow(/postMortems\[0\] must be a filing object/);
    expect(() => parsePostMortemFilings([{ incidentCauseId: "", style: "blameless", changesInFlight: 1 }])).toThrow(
      /incidentCauseId must be a non-empty string/,
    );
    expect(() => parsePostMortemFilings([{ incidentCauseId: "a", style: "no-blame-culture", changesInFlight: 1 }])).toThrow(
      /style must be blameless \| blame/,
    );
    expect(() => parsePostMortemFilings([{ incidentCauseId: "a", style: "blameless", changesInFlight: 0 }])).toThrow(
      /changesInFlight must be a safe integer >= 1/,
    );
    expect(() => parsePostMortemFilings([{ incidentCauseId: "a", style: "blameless", changesInFlight: 1.5 }])).toThrow(
      TypeError,
    );
    expect(POST_MORTEM_STYLES).toEqual(["blameless", "blame"]); // closed, exactly two
  });

  it("sorts by incident cause — host list order can never leak into verdicts", () => {
    const parsed = parsePostMortemFilings([filing("wave:zzz"), filing("wave:aaa")]);
    expect(parsed.map((f) => f.incidentCauseId)).toEqual(["wave:aaa", "wave:zzz"]);
  });
});

/* ────────────────────────── the adjudication fold ───────────────────── */

describe("foldPostMortemFilings — §7.7 attribution gates", () => {
  it("the first blameless single-change card is CREDITED with the shared bps", () => {
    const out = foldPostMortemFilings({ priorLog: [], filings: [filing("incident:db")], now: 100, cfg });
    expect(out.length).toBe(1);
    expect(out[0]?.credited).toBe(true);
    expect(out[0]?.ambiguous).toBe(false);
    expect(out[0]?.record.creditedBps).toBe(CREDIT);
    expect(out[0]?.record.atBusinessMin).toBe(100);
    const signals = postMortemReputationSignals(out, (c) => postMortemNoticeCauseId("filed", c, 100));
    expect(signals).toEqual([{ kind: "honest-postmortem", causeId: "economy:postmortem:filed:incident:db:100" }]);
  });

  it("TWO changes in flight ⇒ unattributable: zero credit, but re-filing later CAN earn", () => {
    const ambiguous = foldPostMortemFilings({ priorLog: [], filings: [filing("incident:cache", "blameless", 2)], now: 10, cfg });
    expect(ambiguous[0]?.ambiguous).toBe(true);
    expect(ambiguous[0]?.credited).toBe(false);
    expect(ambiguous[0]?.record.creditedBps).toBe(0n);
    // the attempt is the log row; the ambiguity clearing changes the verdict:
    const refile = foldPostMortemFilings({
      priorLog: ambiguous.map((o) => o.record),
      filings: [filing("incident:cache", "blameless", 1)],
      now: 20,
      cfg,
    });
    expect(refile[0]?.credited).toBe(true);
  });

  it("blame-style cards file honestly and earn NOTHING (values have mechanical consequences)", () => {
    const out = foldPostMortemFilings({ priorLog: [], filings: [filing("incident:deploys", "blame", 1)], now: 5, cfg });
    expect(out[0]?.credited).toBe(false);
    expect(out[0]?.ambiguous).toBe(false);
    expect(out[0]?.record.style).toBe("blame");
    expect(postMortemReputationSignals(out, (c) => c)).toEqual([]);
  });

  it("the lifetime guard: a credited incident re-filed earns zero again — even blameless", () => {
    const first = foldPostMortemFilings({ priorLog: [], filings: [filing("incident:db")], now: 1, cfg });
    const second = foldPostMortemFilings({
      priorLog: first.map((o) => o.record),
      filings: [filing("incident:db")],
      now: 2,
      cfg,
    });
    expect(second[0]?.credited).toBe(false);
    expect(second[0]?.record.creditedBps).toBe(0n);
    // and within ONE fold, the sorted-first duplicate takes the single credit:
    const sameTick = foldPostMortemFilings({
      priorLog: [],
      filings: parsePostMortemFilings([filing("incident:x"), filing("incident:x")]),
      now: 3,
      cfg,
    });
    expect(sameTick.map((o) => o.credited)).toEqual([true, false]);
  });

  it("cfg.postMortem absent ⇒ the shipped default (1 change attributable); custom limit honors the book", () => {
    const custom = { ...cfg, postMortem: { maxAttributableChanges: 3 } };
    expect(foldPostMortemFilings({ priorLog: [], filings: [filing("i", "blameless", 3)], now: 0, cfg: custom })[0]?.credited).toBe(true);
    expect(foldPostMortemFilings({ priorLog: [], filings: [filing("i", "blameless", 4)], now: 0, cfg: custom })[0]?.ambiguous).toBe(true);
    // DEFAULT_POST_MORTEM_CONFIG twin (no section at all on the cfg object):
    const { postMortem: _gone, ...bare } = cfg;
    void _gone;
    expect(foldPostMortemFilings({ priorLog: [], filings: [filing("i", "blameless", 2)], now: 0, cfg: bare })[0]?.ambiguous).toBe(true);
  });

  it("the notice cause grammar is the exported one", () => {
    expect(postMortemNoticeCauseId("unattributed", asCauseId("incident:db"), 42)).toBe(
      "economy:postmortem:unattributed:incident:db:42",
    );
  });

  it("empty filings ⇒ EMPTY outcomes (the tick spread keeps the key absent)", () => {
    expect(foldPostMortemFilings({ priorLog: [], filings: [], now: 0, cfg })).toEqual([]);
  });
});

/* ─────────────────────────── tick integration ────────────────────────── */

function tickIn(over: Partial<EconomyTickIn> = {}): EconomyTickIn {
  const contract = contractOf("c-rep");
  return {
    context: ctxAt(60),
    runSeed: SEED,
    contracts: new Map([[asEntityId("c-rep"), contract]]),
    prior: stateWithCash(500_000_000n),
    cfg,
    ...over,
  };
}

function noticesOf(out: ReturnType<typeof runEconomyTick>, kind: EconomyNotice["kind"]): EconomyNotice[] {
  return out.notices.filter((n) => n.kind === kind);
}

describe("runEconomyTick × postMortems — presence-gate + credit path", () => {
  it("absent input ⇒ byte-identity: state digests the same, key never appears", () => {
    const quiet = runEconomyTick(tickIn());
    const twin = runEconomyTick(tickIn());
    expect(quiet.state).toEqual(twin.state);
    expect("postMortemLog" in quiet.state).toBe(false);
    expect(noticesOf(quiet, "postmortem-filed")).toEqual([]);
    expect(noticesOf(quiet, "postmortem-unattributed")).toEqual([]);
    // and the prior quiet state IS what a filings-then-quiet fold carries:
    const filed = runEconomyTick(tickIn({ postMortems: [filing("incident:db")] }));
    const after = runEconomyTick(tickIn({ prior: filed.state }));
    expect(after.state.postMortemLog).toEqual(filed.state.postMortemLog); // carried, not re-folded
    expect(after.notices.filter((n) => n.kind.startsWith("postmortem-"))).toEqual([]);
  });

  it("a credited card moves reputation via the SHARED honest-postmortem signal — and sets the §5.10 floor", () => {
    const before = runEconomyTick(tickIn());
    const out = runEconomyTick(tickIn({ postMortems: [filing("incident:storm")] }));
    expect(out.state.reputation.overallBps).toBe(before.state.reputation.overallBps + CREDIT);
    expect(out.state.reputation.honestHostFloor).toBe(true); // transparency insurance, permanent
    const filed = noticesOf(out, "postmortem-filed");
    expect(filed.length).toBe(1);
    expect(filed[0]?.contractId).toBe(POST_MORTEM_ENTITY);
    expect(filed[0]?.causeId).toBe("economy:postmortem:filed:incident:storm:60");
    // publish-on-change covered the credit (one reputation write this tick):
    expect(out.observedWrites.some((w) => w.key.includes("reputation"))).toBe(true);
    // the log row materialized:
    const log: readonly PostMortemRecord[] = out.state.postMortemLog ?? [];
    expect(log.length).toBe(1);
    expect(log[0]?.creditedBps).toBe(CREDIT);
  });

  it("ambiguous filing ⇒ postmortem-unattributed notice, ledger NEUTRAL (no bps, no floor, no write)", () => {
    const before = runEconomyTick(tickIn());
    const out = runEconomyTick(tickIn({ postMortems: [filing("incident:two-changes", "blameless", 2)] }));
    expect(out.state.reputation).toEqual(before.state.reputation); // BY value: nothing moved
    expect(noticesOf(out, "postmortem-unattributed").length).toBe(1);
    expect("postMortemLog" in out.state).toBe(true); // the attempt is still the record
    expect(out.state.postMortemLog?.[0]?.creditedBps).toBe(0n);
    expect(out.state.reputation.honestHostFloor).toBe(false);
  });

  it("blame filing ⇒ filed notice, zero credit, zero floor — and the later blameless twin still earns", () => {
    const blamed = runEconomyTick(tickIn({ postMortems: [filing("incident:deploys", "blame")] }));
    expect(blamed.state.reputation.lifetimeEvents).toBe(0);
    expect(noticesOf(blamed, "postmortem-filed").length).toBe(1);
    const redemption = runEconomyTick(tickIn({ prior: blamed.state, postMortems: [filing("incident:deploys", "blameless")] }));
    expect(redemption.state.reputation.overallBps).toBe(blamed.state.reputation.overallBps + CREDIT);
    expect(redemption.state.reputation.honestHostFloor).toBe(true);
  });

  it("one incident, one channel: the same cause via honestPostmortems AND postMortems throws", () => {
    const cause: CauseId = asCauseId("incident:both");
    expect(() =>
      runEconomyTick(tickIn({ honestPostmortems: [cause], postMortems: [filing("incident:both")] })),
    ).toThrow(/double credit is authoring poison/);
  });

  it("determinism: the same filings script folds to identical states twice", () => {
    const a = runEconomyTick(tickIn({ postMortems: [filing("incident:b"), filing("incident:a", "blame", 2)] }));
    const b = runEconomyTick(tickIn({ postMortems: [filing("incident:b"), filing("incident:a", "blame", 2)] }));
    expect(a.state).toEqual(b.state);
    expect(a.notices).toEqual(b.notices);
    // and the log/notice order follows the SORTED causes, not the host list:
    expect(a.state.postMortemLog?.map((r) => r.incidentCauseId)).toEqual(["incident:a", "incident:b"]);
  });
});
