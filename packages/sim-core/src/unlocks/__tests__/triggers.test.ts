/**
 * triggers unit tests — vocabulary, config wall, fold purity, each
 * predicate, and the observer's once-per-target law.
 */

import { describe, expect, it } from "vitest";
import type { CauseId, EntityId, SimEvent, SimTimeUs } from "../../types";
import { asCauseId, asEntityId } from "../../types";
import {
  createUnlockObserver,
  declaredTrigger,
  eraTrigger,
  evaluateUnlockTriggers,
  milestoneTrigger,
  observeUnlockWindow,
  parseUnlockObserverConfig,
  scarTrigger,
  UNATTRIBUTED_NODE,
  UNLOCK_DECLARED_KINDS,
  UNLOCK_TRIGGER_KINDS,
  UnlocksError,
  DEFAULT_UNLOCK_OBSERVER_CONFIG,
  type UnlockDeclaration,
  type UnlockObservation,
  type UnlockProposal,
  type UnlockTickInput,
} from "../triggers";

const MIN: SimTimeUs = 60_000_000n;

function bounced(node: string | null, cause: string): SimEvent {
  return {
    kind: "bounced",
    atUs: 0n,
    tick: 1n,
    causeId: asCauseId(cause),
    unitId: asEntityId("u1"),
    nodeId: node === null ? null : asEntityId(node),
  } satisfies SimEvent;
}

function fp(node: string, cause: string): SimEvent {
  return {
    kind: "blocked-false-positive",
    atUs: 0n,
    tick: 1n,
    causeId: asCauseId(cause),
    unitId: asEntityId("u2"),
    nodeId: asEntityId(node),
  } satisfies SimEvent;
}

function landed(target: string, cause: string): SimEvent {
  return {
    kind: "landed",
    atUs: 0n,
    tick: 1n,
    causeId: asCauseId(cause),
    unitId: asEntityId("u3"),
    targetId: asEntityId(target),
  } satisfies SimEvent;
}

function input(partial: Partial<UnlockTickInput> & { tick?: bigint } = {}): UnlockTickInput {
  return { tick: partial.tick ?? 10n, minute: partial.minute ?? 0, ...partial };
}

function foldAll(...windows: readonly UnlockTickInput[]): UnlockObservation {
  let obs: UnlockObservation | null = null;
  for (const w of windows) obs = observeUnlockWindow(obs, w);
  if (obs === null) throw new Error("foldAll needs at least one window");
  return obs;
}

/* ═══════════════════ vocabulary ═══════════════════ */

describe("vocabulary (§5.1)", () => {
  it("ships the seven save/ UnlockVia values verbatim, in order", () => {
    expect(UNLOCK_TRIGGER_KINDS).toStrictEqual([
      "scar",
      "foresight",
      "testimony",
      "anticipation",
      "milestone",
      "era",
      "acquisition",
    ]);
  });

  it("declared kinds are exactly the four non-computable channels", () => {
    expect(UNLOCK_DECLARED_KINDS).toStrictEqual(["foresight", "testimony", "anticipation", "acquisition"]);
  });
});

/* ═══════════════════ config wall ═══════════════════ */

describe("parseUnlockObserverConfig", () => {
  it("defaults pass through frozen", () => {
    const cfg = parseUnlockObserverConfig();
    expect(cfg.bounceScarAfter).toBe(DEFAULT_UNLOCK_OBSERVER_CONFIG.bounceScarAfter);
    expect(Object.isFrozen(cfg)).toBe(true);
    expect(Object.isFrozen(cfg.noticeScarAfter)).toBe(true);
  });

  it("rejects zero / fractional / non-integer thresholds", () => {
    expect(() => parseUnlockObserverConfig({ bounceScarAfter: 0 })).toThrow(/bounceScarAfter/);
    expect(() => parseUnlockObserverConfig({ landedScarAfter: 1.5 })).toThrow(UnlocksError);
    expect(() => parseUnlockObserverConfig({ falsePositiveScarAfter: Number.NaN })).toThrow(/positive safe integer/);
  });

  it("rejects empty notice kinds and non-positive notice counts", () => {
    expect(() => parseUnlockObserverConfig({ noticeScarAfter: { "": 1 } })).toThrow(/empty notice kind/);
    expect(() => parseUnlockObserverConfig({ noticeScarAfter: { "written-off": 0 } })).toThrow(/written-off/);
  });

  it("milestone rows must be positive-integer, ascending, unique, ':'-free", () => {
    const bad = (label: string, atMinute: number) => ({ atMinute, label });
    expect(() => parseUnlockObserverConfig({ milestoneMinutes: [bad("a", 0)] })).toThrow(/atMinute/);
    expect(() => parseUnlockObserverConfig({ milestoneMinutes: [bad("a", 10), bad("b", 5)] })).toThrow(/ascend/);
    expect(() => parseUnlockObserverConfig({ milestoneMinutes: [bad("a", 10), bad("a", 20)] })).toThrow(/duplicate label/);
    expect(() => parseUnlockObserverConfig({ milestoneMinutes: [bad("a", 10), bad("b", 10)] })).toThrow(/duplicate minute/);
    expect(() => parseUnlockObserverConfig({ milestoneMinutes: [bad("a:b", 10)] })).toThrow(/'-free slug/);
  });

  it("an empty milestone list is legal (no time milestones this run)", () => {
    expect(parseUnlockObserverConfig({ milestoneMinutes: [] }).milestoneMinutes).toStrictEqual([]);
  });
});

/* ═══════════════════ fold ═══════════════════ */

describe("observeUnlockWindow", () => {
  it("counts bounces per node, FPs per node, landings total, notices per kind", () => {
    const obs = foldAll(
      input({
        events: [bounced("edge", "outcome:a"), bounced("edge", "outcome:b"), bounced(null, "outcome:c"), fp("waf", "outcome:d"), landed("origin", "outcome:e")],
        notices: [
          { kind: "written-off", causeId: "economy:wo" },
          { kind: "written-off", causeId: "economy:wo2" },
        ],
      }),
    );
    expect(obs.counters.bounceCountByNode.get("edge")).toBe(2);
    expect(obs.counters.bounceCountByNode.get(UNATTRIBUTED_NODE)).toBe(1);
    expect(obs.counters.falsePositiveCountByNode.get("waf")).toBe(1);
    expect(obs.counters.landedCount).toBe(1);
    expect(obs.counters.noticeCountByKind.get("written-off")).toBe(2);
  });

  it("carries the LATEST cause per counter key (feed order wins)", () => {
    let obs: UnlockObservation | null = null;
    obs = observeUnlockWindow(obs, input({ events: [bounced("edge", "cause:first")] }));
    obs = observeUnlockWindow(obs, input({ events: [bounced("edge", "cause:second")] }));
    expect(obs?.causes.get("bounce:edge")).toBe(asCauseId("cause:second"));
  });

  it("is pure — the previous snapshot is untouched by a later fold", () => {
    const first = observeUnlockWindow(null, input({ events: [bounced("edge", "c1")] }));
    const before = first.counters.bounceCountByNode.get("edge");
    observeUnlockWindow(first, input({ events: [bounced("edge", "c2"), landed("x", "c3")] }));
    expect(first.counters.bounceCountByNode.get("edge")).toBe(before);
    expect(first.counters.landedCount).toBe(0);
  });

  it("rejects negative or non-bigint ticks and fractional minutes", () => {
    expect(() => observeUnlockWindow(null, input({ tick: -1n }))).toThrow(/bad-clock|non-negative bigint/);
    expect(() => observeUnlockWindow(null, { tick: 1 as unknown as bigint, minute: 0 })).toThrow(/non-negative bigint/);
    expect(() => observeUnlockWindow(null, input({ minute: 2.5 }))).toThrow(/safe integer/);
  });

  it("era baseline is silent; only a flip between two KNOWN years changes it", () => {
    const baseline = observeUnlockWindow(null, input({ eraYear: 1998 }));
    expect(baseline.eraChanged).toBe(false);
    expect(observeUnlockWindow(baseline, input({ eraYear: 1998 })).eraChanged).toBe(false);
    expect(observeUnlockWindow(baseline, input({ eraYear: 2026 })).eraChanged).toBe(true);
    expect(observeUnlockWindow(baseline, input({ eraYear: null })).eraChanged).toBe(false);
    // a null era gap re-baselines instead of flipping against stale memory
    const afterNull = observeUnlockWindow(baseline, input({ eraYear: null }));
    expect(observeUnlockWindow(afterNull, input({ eraYear: 2026 })).eraChanged).toBe(false);
  });

  it("declarations are window-scoped (never accumulated into the snapshot)", () => {
    const decl: UnlockDeclaration = { via: "testimony", targetRef: asEntityId("node:runbook-library") };
    const first = observeUnlockWindow(null, input({ declarations: [decl] }));
    expect(first.declarations).toHaveLength(1);
    expect(observeUnlockWindow(first, input({})).declarations).toHaveLength(0);
  });
});

/* ═══════════════════ scar predicate ═══════════════════ */

describe("scarTrigger (§5.1/§5.2)", () => {
  const cfg = parseUnlockObserverConfig({ bounceScarAfter: 3, falsePositiveScarAfter: 2 });

  it("fires nothing below threshold", () => {
    const obs = foldAll(input({ events: [bounced("edge", "o1"), bounced("edge", "o2")] }));
    expect(scarTrigger(obs, cfg)).toHaveLength(0);
  });

  it("fires at threshold with the crossing event's cause and deterministic id", () => {
    const obs = foldAll(input({ events: [bounced("edge", "o1"), bounced("edge", "o2"), bounced("edge", "o3")] }));
    const props = scarTrigger(obs, cfg);
    expect(props.map((p) => p.targetRef)).toStrictEqual(["scar:bounce:edge"]);
    expect(props[0]?.via).toBe("scar");
    expect(props[0]?.causeId).toBe(asCauseId("o3"));
  });

  it("FP scar keys on the inspecting node; null-node bounces land on _unattributed", () => {
    const obs = foldAll(
      input({ events: [fp("waf", "f1"), fp("waf", "f2"), bounced(null, "n1"), bounced(null, "n2"), bounced(null, "n3")] }),
    );
    const refs = scarTrigger(obs, cfg).map((p) => p.targetRef as string).sort();
    expect(refs).toStrictEqual([`scar:bounce:${UNATTRIBUTED_NODE}`, "scar:false-positive:waf"]);
  });

  it("first landing scars immediately (landedAfter default 1)", () => {
    const obs = foldAll(input({ events: [landed("origin", "breach:1")] }));
    const props = scarTrigger(obs);
    expect(props).toHaveLength(1);
    expect(props[0]?.targetRef).toBe(asEntityId("scar:landed"));
  });

  it("business-pain notices scar through config", () => {
    const obs = foldAll(input({ notices: [{ kind: "spiral-flagged", causeId: "economy:spiral" }] }));
    const props = scarTrigger(obs, parseUnlockObserverConfig({ bounceScarAfter: 999 }));
    expect(props.map((p) => p.targetRef as string)).toContain("scar:notice:spiral-flagged");
  });

  it("multiple scarred nodes iterate in sorted order (deterministic stream)", () => {
    const heavy = Array.from({ length: 4 }, (_, i) => bounced(i === 0 ? "zeta" : "alpha", `h${i}`));
    const obs = foldAll(input({ events: heavy }));
    expect(scarTrigger(obs, parseUnlockObserverConfig({ bounceScarAfter: 1 })).map((p) => p.targetRef)).toStrictEqual([
      asEntityId("scar:bounce:alpha"),
      asEntityId("scar:bounce:zeta"),
    ]);
  });
});

/* ═══════════════════ milestone / era / declared ═══════════════════ */

describe("milestoneTrigger (§5.3)", () => {
  it("below every threshold: silent", () => {
    expect(milestoneTrigger(foldAll(input({ minute: 1439 })))).toHaveLength(0);
  });

  it("crossing minute 1440 fires exactly first-day-survived", () => {
    const props = milestoneTrigger(foldAll(input({ minute: 1440 })));
    expect(props).toHaveLength(1);
    expect(props[0]?.via).toBe("milestone");
    expect(props[0]?.targetRef).toBe(asEntityId("milestone:first-day-survived"));
  });

  it("minute 50000 fires all three in ascending authored order", () => {
    expect(milestoneTrigger(foldAll(input({ minute: 50000 }))).map((p) => p.targetRef)).toStrictEqual([
      asEntityId("milestone:first-day-survived"),
      asEntityId("milestone:first-week-survived"),
      asEntityId("milestone:first-month-survived"),
    ]);
  });
});

describe("eraTrigger (§5.1)", () => {
  it("silent without a flip", () => {
    expect(eraTrigger(foldAll(input({ eraYear: 2026 })))).toHaveLength(0);
  });
  it("a 1998→2026 flip proposes via era with a minted era cause", () => {
    const first = observeUnlockWindow(null, input({ eraYear: 1998 }));
    const flipped = observeUnlockWindow(first, input({ eraYear: 2026 }));
    const props = eraTrigger(flipped);
    expect(props).toHaveLength(1);
    expect(props[0]?.via).toBe("era");
    expect(props[0]?.targetRef).toBe(asEntityId("era:2026"));
    expect(props[0]?.causeId).toBe(asCauseId("unlocks:era:2026"));
  });
});

describe("declaredTrigger (§5.1 non-computable channels)", () => {
  it("stamps host declarations with this tick and default minted cause", () => {
    const decl: UnlockDeclaration = { via: "foresight", targetRef: asEntityId("node:capacity-forecast") };
    const props = declaredTrigger(foldAll(input({ tick: 77n, declarations: [decl] })));
    expect(props).toHaveLength(1);
    expect(props[0]?.atTick).toBe(77n);
    expect(props[0]?.via).toBe("foresight");
    expect((props[0] as UnlockProposal).causeId).toBe(asCauseId("unlocks:declared:foresight:node:capacity-forecast"));
  });

  it("honours a supplied causeId (host attribution wins)", () => {
    const cause: CauseId = asCauseId("economy:token-spend");
    const props = declaredTrigger(
      foldAll(input({ declarations: [{ via: "anticipation", targetRef: asEntityId("node:forecast"), causeId: cause }] })),
    );
    expect(props[0]?.causeId).toBe(cause);
  });
});

/* ═══════════════════ observer ═══════════════════ */

describe("createUnlockObserver", () => {
  it("proposals fire ONCE per targetRef across the whole run", () => {
    const obs = createUnlockObserver({ bounceScarAfter: 2, milestoneMinutes: [] });
    const first = obs.observe(input({ events: [bounced("edge", "a"), bounced("edge", "b")] }));
    const second = obs.observe(input({ events: [bounced("edge", "c")] }));
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(0);
    expect(obs.proposals()).toHaveLength(1);
  });

  it("evaluateUnlockTriggers canonical order: scars, milestones, era, declared", () => {
    const window = observeUnlockWindow(null, input({ minute: 2000, eraYear: 2026, events: [landed("o", "x")] }));
    const order = evaluateUnlockTriggers(
      { ...window, eraChanged: true, declarations: [{ via: "acquisition", targetRef: asEntityId("node:kept") }] },
      parseUnlockObserverConfig(),
    ).map((p) => p.via);
    expect(order).toStrictEqual(["scar", "milestone", "era", "acquisition"]);
  });

  it("proposals() and lastObservation() are side-effect-free reads", () => {
    const obs = createUnlockObserver({ milestoneMinutes: [] });
    expect(obs.proposals()).toHaveLength(0);
    expect(obs.lastObservation()).toBeNull();
    obs.observe(input({ minute: 3 }));
    const seen = obs.lastObservation();
    expect(seen?.minute).toBe(3);
    expect(obs.lastObservation()).toBe(seen);
  });

  it("an invalid config throws at construction, not at observe time", () => {
    expect(() => createUnlockObserver({ bounceScarAfter: -2 })).toThrow(/bounceScarAfter/);
  });
});
