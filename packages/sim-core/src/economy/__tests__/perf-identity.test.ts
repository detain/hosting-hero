/**
 * Perf-lane pin tests (audit fixes #2/#3):
 *  - invoice ARRAY ORDER is content: the tick-local position index must
 *    preserve it and never move a record (digest/save surfaces read order);
 *  - renewal-cliff twins behave byte-identically to the old find()/findIndex()
 *    pass (first-twin binding, zombie twin and all — the index must not
 *    "accidentally fix" semantics in a perf lane);
 *  - the chunked journal is digest-invisible: digestState of the mirrored
 *    GameState AND the full JSON view of EconomyState are byte-identical to
 *    a flat-array reconstruction;
 *  - OPT-IN settled-invoice pruning (default OFF) touches neither the
 *    journal, the cash, nor nextSeq, and preserves survivor order.
 */

import { describe, expect, it } from "vitest";

import {
  asCauseId,
  asEntityId,
  asMoney,
  type Contract,
  type EntityId,
  type MoneyBuckets,
  type SimMinute,
} from "../../types.ts";
import { createInitialState } from "../../pipeline/driver.ts";
import { digestState } from "../../pipeline/digest.ts";
import type { InvoiceTerms } from "../billing.ts";
import { partitionPrunableInvoices } from "../billing.ts";
import { defaultEconomyConfig, type EconomyConfig } from "../config.ts";
import { journalFromEntries, type Journal } from "../ledger.ts";
import { emptyEconomyState, registerContractEconomy, sortedById, type EconomyState } from "../state.ts";
import { pruneResolvedInvoices, runEconomyTick, type EconomyTickIn, type EconomyTickOut } from "../tick.ts";
import { DAY, digest, MONTH, SEED, TAGS, contractOf, ctxAt, makeInvoice, stateWithCash } from "./helpers.js";

const cfg: EconomyConfig = (() => {
  const d = defaultEconomyConfig();
  return {
    ...d,
    churn: { ...d.churn, monthlyLogoChurnBpsByBundle: {}, fallbackMonthlyBps: 0n },
    dunning: { ...d.dunning, cardFailureBps: 0n },
  };
})();

function harness(contracts: readonly Contract[], start: MoneyBuckets): EconomyState {
  let s = stateWithCash(0n, {});
  s = { ...s, cash: start, freeAtMonthStart: start.free };
  for (const c of contracts) {
    s = registerContractEconomy(
      s,
      { contract: c, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS, commitmentBps: 9990n },
      cfg,
    );
  }
  return s;
}

function tick(
  prior: EconomyState,
  minute: SimMinute,
  contracts: ReadonlyMap<EntityId, Contract>,
  over: Partial<Pick<EconomyTickIn, "pruneSettledInvoices" | "renewalDecisions">> = {},
): EconomyTickOut {
  return runEconomyTick({
    context: ctxAt(minute, BigInt(Math.floor(minute / MONTH))),
    runSeed: SEED,
    contracts,
    prior,
    cfg,
    ...over,
  });
}

const CASH0: MoneyBuckets = {
  free: asMoney(5_000_000_000_000n),
  restricted: asMoney(0n),
  deferred: asMoney(0n),
  accountsReceivable: asMoney(0n),
  backlog: asMoney(0n),
  committedOut: asMoney(0n),
};

function roster(...ids: string[]): { map: Map<EntityId, Contract>; contracts: Contract[] } {
  const contracts = ids.map((id) => contractOf(id, { termEndMin: 60 * MONTH }));
  return { map: new Map(contracts.map((c) => [c.id, c])), contracts };
}

describe("invoice array order is content (perf audit #2 pin)", () => {
  it("id sequence across six monthly ticks is pure issue order; replaces never move slots", () => {
    const { map, contracts } = roster("K1", "K2", "K3");
    let s = harness(contracts, CASH0);
    const issued: EntityId[] = [];
    for (let m = 0; m < 6; m += 1) {
      const before = s.invoices.map((i) => i.id);
      const r = tick(s, m * MONTH, map);
      s = r.state;
      const after = s.invoices.map((i) => i.id);
      // survivors keep relative order (prefix property), new issues append
      expect(after.slice(0, before.length)).toEqual(before);
      issued.push(...after.slice(before.length));
    }
    // cycle grid: contract-major issue order each month, monotonic overall
    expect(issued).toEqual([
      "inv:K1:0", "inv:K2:0", "inv:K3:0",
      "inv:K1:1", "inv:K2:1", "inv:K3:1",
      "inv:K1:2", "inv:K2:2", "inv:K3:2",
      "inv:K1:3", "inv:K2:3", "inv:K3:3",
      "inv:K1:4", "inv:K2:4", "inv:K3:4",
      "inv:K1:5", "inv:K2:5", "inv:K3:5",
    ].map((id) => asEntityId(id)));
    // in-place replacement: all settled, order still exactly the issue order
    expect(s.invoices.map((i) => i.state)).toEqual(s.invoices.map(() => "paid"));
  });

  it("renewal twins keep first-twin binding — old find()/findIndex() semantics reproduced", () => {
    const R = contractOf("R", { termEndMin: 2 * MONTH });
    const map = new Map<EntityId, Contract>([[R.id, R]]);
    let s = harness([R], CASH0);
    s = tick(s, 0, map).state; // cycle 0 paid
    s = tick(s, MONTH, map).state; // cycle 1 paid
    // cliff at 2×MONTH: renew resets invoicedCycles=0 → cycle 0 re-mints a TWIN
    const r = tick(s, 2 * MONTH, map, {
      renewalDecisions: [{ contractId: R.id, decision: { choice: "renew", causeId: asCauseId("economy:test:renew"), escalatedMrc: null } }],
    });
    const ids = r.state.invoices.map((i) => i.id);
    expect(ids.filter((id) => id === asEntityId("inv:R:0")).length).toBe(2); // legitimate twin
    // byte-faithful to the old sweep: the FIRST twin is the paid record and
    // the re-minted twin stays visible at its own (later) slot.
    const first = r.state.invoices[ids.indexOf(asEntityId("inv:R:0"))]!;
    expect(first.state).toBe("paid");
    const twin = r.state.invoices[ids.lastIndexOf(asEntityId("inv:R:0"))]!;
    // LATENT BUG, PRESERVED ON PURPOSE: first-twin binding shadows the
    // re-minted record — its step-7 visits resolve to the paid first twin,
    // so the twin stays "issued" (its AR posted at issue, never collected).
    // The old find() pass did exactly this; a perf lane reports, it does not
    // silently re-semantize. OWNER-QUESTION filed in the lane report.
    expect(twin.state).toBe("issued");
    // and it stays shadowed on the next tick (new issues still append cleanly)
    const again = tick(r.state, 3 * MONTH, map);
    expect(again.state.invoices.length).toBe(r.state.invoices.length + 1);
    expect(again.state.invoices[ids.lastIndexOf(asEntityId("inv:R:0"))]!.state).toBe("issued");
  });
});

describe("chunked journal is digest-invisible (perf audit #3 pin)", () => {
  function mirror(state: EconomyState, seed: bigint): ReturnType<typeof createInitialState> {
    const base = createInitialState({
      runSeed: seed as never,
      engineVersion: "economy-perf-pin",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: { realUs: 0n, simUs: 0n, businessUs: 0n, wallUs: 0n },
    });
    return { ...base, cash: state.cash, ledgerSeq: state.journal.nextSeq };
  }

  it("digestState of chunked vs flat-reconstructed economy output is byte-identical", () => {
    const { map, contracts } = roster("D1", "D2");
    let s = harness(contracts, CASH0);
    for (const m of [0, 1, 2]) s = tick(s, m * MONTH, map).state;
    // flat reconstruction: JSON round-trip strips the spine to a bare literal
    const flatState = JSON.parse(digest(s), (_k, x: unknown) =>
      typeof x === "string" && /^\d+n$/.test(x) ? BigInt(x.slice(0, -1)) : x,
    ) as EconomyState;
    const flatJournal: Journal = { nextSeq: s.journal.nextSeq, entries: [...s.journal.entries] };
    const normalized: EconomyState = {
      ...flatState,
      journal: journalFromEntries(flatJournal.entries, flatJournal.nextSeq),
    };
    expect(digestState(mirror(s, 7n))).toBe(digestState(mirror(normalized, 7n)));
    // and the FULL visible shape matches too (canonical walks see only {nextSeq, entries})
    expect(digest(s.journal)).toBe(digest(flatJournal));
    // the chunked view materializes in identical oldest→newest order
    expect(digest(normalized.journal.entries)).toBe(digest(flatJournal.entries));
  });
});

describe("opt-in settled-invoice pruning (perf audit #3 retention)", () => {
  function sixMonthRun(prune: boolean | undefined): EconomyTickOut[] {
    const { map, contracts } = roster("P1", "P2");
    let s = harness(contracts, CASH0);
    const out: EconomyTickOut[] = [];
    for (let m = 0; m <= 6; m += 1) {
      const r = tick(s, m * MONTH, map, { pruneSettledInvoices: prune });
      out.push(r);
      s = r.state;
    }
    return out;
  }

  it("default OFF keeps every historical invoice byte-identical to the pre-flag behavior", () => {
    const a = sixMonthRun(undefined);
    const b = sixMonthRun(false);
    for (let i = 0; i < a.length; i += 1) {
      expect(digest(a[i]!.state)).toBe(digest(b[i]!.state));
    }
    // nothing was ever pruned by default: 7 ticks × 2 contracts issued
    expect(a[a.length - 1]!.state.invoices.length).toBe(14);
  });

  it("ON drops settled history once schedules resolve, journal + cash + nextSeq untouched", () => {
    const off = sixMonthRun(undefined);
    const on = sixMonthRun(true);
    const lastOff = off[off.length - 1]!;
    const lastOn = on[on.length - 1]!;
    // reserves hold 180 d = 6 business months: at m6 the FIRST invoices'
    // schedules release (m6 tick releases what is due), so early settled
    // invoices may drop while recent ones stay pinned by live schedules.
    expect(lastOn.state.invoices.length).toBeLessThanOrEqual(lastOff.state.invoices.length);
    // the money truth never moved:
    expect(digest(lastOn.state.cash)).toBe(digest(lastOff.state.cash));
    expect(lastOn.state.journal.nextSeq).toBe(lastOff.state.journal.nextSeq);
    expect(digest([...lastOn.state.journal.entries])).toBe(digest([...lastOff.state.journal.entries]));
    expect(lastOn.entries.map((e) => e.seq)).toEqual(lastOff.entries.map((e) => e.seq));
    // survivors keep relative order of the off-run survivors
    const offIds = lastOff.state.invoices.map((i) => i.id);
    const onIds = lastOn.state.invoices.map((i) => i.id);
    let at = 0;
    for (const id of offIds) {
      if (at < onIds.length && onIds[at] === id) at += 1;
    }
    expect(at).toBe(onIds.length); // subsequence in order
    // every dropped record was paid/written-off AND schedule-free
    const liveRefs = new Set(
      lastOn.state.unlockSchedules
        .map((s) => (/:(reserve|recognition)$/.test(s.id) ? s.id.replace(/:(reserve|recognition)$/, "") : null))
        .filter((x): x is EntityId => x !== null),
    );
    for (const inv of lastOff.state.invoices) {
      if (onIds.includes(inv.id)) continue;
      expect(["paid", "written-off"]).toContain(inv.state);
      expect(liveRefs.has(inv.id)).toBe(false);
    }
  });

  it("pruneResolvedInvoices (standalone) agrees with the tick-end step", () => {
    const off = sixMonthRun(undefined);
    const on = sixMonthRun(true);
    const standalone = pruneResolvedInvoices(off[off.length - 1]!.state);
    expect(digest(standalone.state)).toBe(digest(on[on.length - 1]!.state));
  });

  it("partition keeps issued/failed and schedule-pinned settled records; order preserved", () => {
    const inv = (n: number, state: "issued" | "paid" | "failed" | "written-off"): import("../billing.ts").Invoice =>
      makeInvoice({
        id: asEntityId(`inv:Q:${n}`),
        contractId: asEntityId("Q"),
        state,
        settledAtMin: state === "paid" || state === "written-off" ? 10 : null,
        terms: { netTermsDays: 30, annualPrepay: false } as InvoiceTerms,
      });
    const invoices = [inv(0, "paid"), inv(1, "issued"), inv(2, "paid"), inv(3, "failed"), inv(4, "written-off")];
    const pinned = makeInvoice({ id: asEntityId("inv:Q:PIN"), contractId: asEntityId("Q"), state: "paid", settledAtMin: 1 });
    const withPin = [...invoices.slice(0, 2), pinned, ...invoices.slice(2)];
    const schedules = [
      {
        id: asEntityId("inv:Q:PIN:reserve"),
        contractId: asEntityId("Q"),
        total: asMoney(1n),
        released: asMoney(0n),
        sliceNum: 1n,
        sliceDen: 1n,
        periodMinutes: DAY,
        nextReleaseAtMin: 10_000,
        reason: "rolling-reserve" as const,
      },
    ];
    const { keep, pruned } = partitionPrunableInvoices(withPin, schedules);
    expect(keep.map((i) => i.id)).toEqual(["inv:Q:1", "inv:Q:PIN", "inv:Q:3"].map((x) => asEntityId(x)));
    expect(pruned.map((i) => i.id)).toEqual(["inv:Q:0", "inv:Q:2", "inv:Q:4"].map((x) => asEntityId(x)));
  });
});

describe("sortedById perf-lane rewrite: result identity for every input class", () => {
  const legacySort = (rows: Iterable<readonly [EntityId, number]>): EntityId[] =>
    [...rows]
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .map(([id]) => id);

  it("merge-insert matches full-sort on ascending, descending and mid-range keys", () => {
    let map: ReadonlyMap<EntityId, number> = new Map();
    const seen = new Map<EntityId, number>();
    for (const [i, id] of (["c-005", "c-001", "c-009", "c-001", "c-000", "c-010", "c-004"] as EntityId[]).entries()) {
      // c-001 twice = overwrite arm (position-preserving)
      map = sortedById(map, { contractId: id }, i);
      seen.set(id, i);
      expect([...map.keys()]).toEqual(legacySort(seen));
      expect([...map.values()]).toEqual(legacySort(seen).map((k) => seen.get(k)!));
    }
  });

  it("falls back to the full sort when handed an unsorted source", () => {
    const unsorted: Map<EntityId, number> = new Map([
      ["z" as EntityId, 1],
      ["a" as EntityId, 2],
      ["m" as EntityId, 3],
    ]);
    expect([...sortedById(unsorted, { contractId: "b" as EntityId }, 4).keys()]).toEqual(["a", "b", "m", "z"]);
    expect([...sortedById(unsorted, null).keys()]).toEqual(["a", "m", "z"]);
    expect([...sortedById(unsorted, null).entries()]).toEqual([
      ["a", 2],
      ["m", 3],
      ["z", 1],
    ]);
  });

  it("clone arm on a sorted source with replace=null preserves order and values", () => {
    const sorted: Map<EntityId, number> = new Map([
      ["a" as EntityId, 1],
      ["z" as EntityId, 2],
    ]);
    expect([...sortedById(sorted, null).entries()]).toEqual([
      ["a", 1],
      ["z", 2],
    ]);
  });

  it("keeps the fail-loud guard for a replace without a value (both arms)", () => {
    expect(() => sortedById(new Map(), { contractId: "a" as EntityId })).toThrow(RangeError);
    const unsorted: Map<EntityId, number> = new Map([
      ["z" as EntityId, 1],
      ["a" as EntityId, 2],
    ]);
    expect(() => sortedById(unsorted, { contractId: "b" as EntityId })).toThrow(RangeError);
  });

  it("registerContractEconomy chains: shuffled registration == sorted key order in state", () => {
    const contracts = (["K3", "K1", "K0", "K2"] as EntityId[]).map((n) => contractOf(n));
    const s = harness(contracts, CASH0);
    expect([...s.contractEconomy.keys()]).toEqual(["K0", "K1", "K2", "K3"].map((x) => asEntityId(x)));
    expect([...s.errorBudgets.keys()]).toEqual(["K0", "K1", "K2", "K3"].map((x) => asEntityId(x)));
  });
});
