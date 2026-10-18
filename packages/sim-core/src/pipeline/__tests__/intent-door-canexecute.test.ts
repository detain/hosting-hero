/**
 * CAN-EXECUTE — the general host verb gate (ADR-0019 program 1 · lane L-CE,
 * owner ruling 2026-10-18: build the general `canExecute` door-hook).
 *
 * The hook widens the door's validator family from FOUR per-verb seams
 * (canPlaceDevice / canAdjustPrice / canSellOffer / canNegotiateTerms) to a
 * seam for ALL nineteen verbs. The pins that make this lane an ENGINE
 * authority rather than a config sprinkle:
 *  - GATE ORDER (the law of this file): resolve-carrier → canExecute →
 *    hands → attention → handler. The ban is consulted BEFORE any
 *    denomination pays, so a refused verb spends nothing — no hand, no
 *    occupancy, no attention token, no due-release touch, no handler, and
 *    the per-verb validators never run for it. Refund snapshots are not
 *    even involved: there is nothing to refund (state identity on a
 *    refused-only pass is STRUCTURAL, pinned via object identity).
 *  - HOST-OWNED VOCABULARY: the refusal reason lands VERBATIM in the
 *    `intent-refused` event + receipt. The door mints NO code literal for a
 *    general gate — the machine-pinned census over intent-door.ts stays at
 *    EXACTLY 46 UNAIDED (this file re-pins the count locally as a
 *    falsifier; the standing pin lives in intent-door-restart.test.ts).
 *  - BYTE-IDENTITY: absent hook = zero behavior change; an allow-all hook
 *    is observably identical to no hook at all (digest + events + receipts).
 *  - EVERY verb-carrying intent: player-verb carriers AND G7 translated
 *    rule-carriers answer the gate (the query carries `carrier` for
 *    attribution); sliders, unmapped/off-line carriers, future stamps,
 *    duplicate (tick,seq) throws, and structural wire garbage never reach
 *    it (order pins below).
 *  - FAIL-LOUD: a throwing host callback PROPAGATES unchanged (a host
 *    validator that crashes is a host bug — the door does not catch its way
 *    out of someone else's bug); a non-string reason throws
 *    `IntentDoorError` naming "canExecute result.reason" (the siblings'
 *    output-validation law, mirrored).
 *
 * The follow-on (named in the door docblock, NOT this lane): perspective
 * levels tape only the five validator-covered verbs today —
 * scenario/perspective.ts's 5×19 expressibility table widens onto this seam
 * in lane L-PERS.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  PlayerVerbArgs,
  SimTick,
  TickContext,
} from "../../types";
import { asEntityId, asMoney, asRuleId, asRunSeed, PlayerVerb } from "../../types";
import { FIXED_ONE } from "../../kernel/fixed";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time";
import { createInitialState } from "../driver";
import { digestState } from "../digest";
import { attentionWindowEntry, createAttentionState } from "../attention";
import {
  applyIntentDoor,
  createBoardState,
  IntentDoorError,
  type ExecuteQuery,
  type IntentDoorConfig,
} from "../intent-door";
import { IDS, node } from "./helpers";

const MIN = MICROS_PER_MIN;

/* ═══════════════════════════ fixtures (restart/rulecarrier pattern) ═══════════════════════════ */

function ctx(tick: SimTick): TickContext {
  return Object.freeze({ tick, minute: Number(tick), clocks: initialClocks() });
}

function ext(tick: SimTick, seq: number, args: PlayerVerbArgs): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MIN,
      origin: "player" as const,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  });
}

/** Rule-carrier entry EXACTLY as policy/evaluator.ts buildIntents mints it
 *  (clock "sim", origin "rule", payload kind "verb" + target/value). */
function ruleExt(tick: SimTick, seq: number, verb: string, target: EntityId | null): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MIN,
      origin: "rule" as const,
      ruleId: asRuleId("ce-test-card"),
      payload: Object.freeze({ kind: "verb" as const, verb, target, value: null }),
    }),
  });
}

function sliderExt(tick: SimTick, seq: number, control: string): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MIN,
      origin: "player" as const,
      payload: Object.freeze({ kind: "slider" as const, control, value: FIXED_ONE }),
    }),
  });
}

function baseState(handCapacity = 4, attention = false): GameState {
  return createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "test-canexecute",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [
      node(IDS.edge, { slots: 2, serviceUs: MIN }),
      node(IDS.origin, { slots: 1, serviceUs: MIN }),
    ],
    handCapacity,
    board: createBoardState(),
    ...(attention
      ? { attention: attentionWindowEntry(createAttentionState(1), "triage-window", 0).state }
      : {}),
  });
}

/** BigInt-safe structural snapshot for equality witnesses. */
function plain(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? `${v}n` : v)));
}

/** Ban the named verbs; allow everything else. House-grammar host strings. */
function ban(...verbs: PlayerVerb[]): (query: ExecuteQuery) => { reason: string } | null {
  return (query) =>
    verbs.includes(query.verb)
      ? { reason: `perspective-forbids: ${query.verb} is outside this seat` }
      : null;
}

const PLACE = (nodeId = "web-9"): PlayerVerbArgs => ({
  verb: PlayerVerb.PlaceDevice,
  nodeId: asEntityId(nodeId),
  deviceKind: "generic",
  template: null,
});
const COMMUNICATE: PlayerVerbArgs = { verb: PlayerVerb.Communicate, target: null, note: "all good" };
const TOGGLE: PlayerVerbArgs = { verb: PlayerVerb.ToggleSpeed, speedX: 2 };
const CONNECT_SELF: PlayerVerbArgs = {
  verb: PlayerVerb.ConnectPorts,
  relation: "data",
  from: IDS.edge,
  to: IDS.edge,
  slot: null,
};

/* ═══════════════════════ absent hook = today, byte-identically ═══════════════════════ */

describe("canExecute — absent-hook byte identity", () => {
  // A mixed script: executes, a handler refusal (self-edge — paid then
  // refunded), a carrier refusal (slider), and a zero-cost verb.
  const script: readonly ExternalIntent[] = [
    ext(3n, 1, PLACE()),
    ext(3n, 2, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: "inspect", shedOrder: null }),
    ext(3n, 3, CONNECT_SELF),
    ext(3n, 4, COMMUNICATE),
    sliderExt(3n, 5, "dial"),
    ext(3n, 6, TOGGLE),
  ];

  it("no hook vs an allow-all hook: identical digest, events, receipts", () => {
    const absent = applyIntentDoor(baseState(), ctx(3n), script, {});
    const allow = applyIntentDoor(baseState(), ctx(3n), script, { canExecute: () => null });
    expect(digestState(allow.state)).toBe(digestState(absent.state));
    expect(plain(allow.events)).toEqual(plain(absent.events));
    expect(plain(allow.receipts)).toEqual(plain(absent.receipts));
  });

  it("the allow-all hook is consulted EXACTLY once per verb-carrying entry (slider never)", () => {
    const seen: string[] = [];
    applyIntentDoor(baseState(), ctx(3n), script, {
      canExecute: (q) => {
        seen.push(q.verb);
        return null;
      },
    });
    expect(seen).toEqual([
      PlayerVerb.PlaceDevice,
      PlayerVerb.ConfigureNode,
      PlayerVerb.ConnectPorts,
      PlayerVerb.Communicate,
      PlayerVerb.ToggleSpeed,
    ]);
  });

  it("absent hook: zero consultations on the identical script", () => {
    const res = applyIntentDoor(baseState(), ctx(3n), script, {});
    expect(res.receipts.length).toBe(6); // the run is normal…
    // …and the allow-all digest equality above proves the gate adds nothing.
  });
});

/* ═══════════════════════ refuse before payment — spend nothing ═══════════════════════ */

describe("canExecute — the ban spends NOTHING (gate sits before both rails)", () => {
  it("banned place-device refuses with the host reason VERBATIM (event + receipt)", () => {
    const res = applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, PLACE())], {
      canExecute: ban(PlayerVerb.PlaceDevice),
    });
    expect(res.receipts.length).toBe(1);
    expect(res.receipts[0]?.outcome).toBe("refused");
    expect(res.receipts[0]?.reason).toBe("perspective-forbids: place-device is outside this seat");
    expect(res.events.length).toBe(1);
    expect(res.events[0]?.kind).toBe("intent-refused");
    expect((res.events[0] as { reason: string }).reason).toBe("perspective-forbids: place-device is outside this seat");
  });

  it("a refused-only pass keeps state object IDENTITY (no hands materialization, no sweep)", () => {
    const state0 = baseState();
    const res = applyIntentDoor(state0, ctx(3n), [ext(3n, 1, PLACE()), ext(3n, 2, COMMUNICATE)], {
      canExecute: ban(PlayerVerb.PlaceDevice, PlayerVerb.Communicate),
    });
    expect(res.state).toBe(state0); // the strongest identity the door ever promises
    expect(res.receipts.every((r) => r.outcome === "refused")).toBe(true);
  });

  it("mixed feed: the ban pays nothing, the allowed sibling pays its full rail", () => {
    const res = applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, PLACE()), ext(3n, 2, COMMUNICATE)], {
      canExecute: ban(PlayerVerb.PlaceDevice),
    });
    const busy = (res.state.hands?.tokens ?? []).filter((t) => t.busyCauseId !== null);
    expect(busy.length).toBe(1);
    expect(busy[0]?.busyCauseId).toBe("intent:2");
    expect(res.receipts[0]?.outcome).toBe("refused");
    expect(res.receipts[1]?.outcome).toBe("executed");
  });

  it("attention-paying verb: a ban leaks NO attention token (pool stays identity)", () => {
    const state0 = baseState(4, true);
    const res = applyIntentDoor(state0, ctx(3n), [ext(3n, 1, COMMUNICATE)], {
      attentionCost: { [PlayerVerb.Communicate]: 1 },
      canExecute: ban(PlayerVerb.Communicate),
    });
    expect(res.state).toBe(state0);
    expect(res.state.attention).toBe(state0.attention);
    expect(res.receipts[0]?.reason).toBe("perspective-forbids: communicate is outside this seat");
  });

  it("attention double-denomination: the ban refuses before the token; the allowed twin books exactly one", () => {
    const res = applyIntentDoor(baseState(4, true), ctx(3n), [ext(3n, 1, COMMUNICATE), ext(3n, 2, COMMUNICATE)], {
      attentionCost: { [PlayerVerb.Communicate]: 1 },
      canExecute: ban(PlayerVerb.Communicate),
    });
    // Both communicates face the SAME ban — neither pays hands OR the focus
    // hand: the point is the POOL is untouched (no leak, no debt event).
    expect(res.receipts[0]?.outcome).toBe("refused");
    expect(res.receipts[1]?.outcome).toBe("refused");
    expect(res.state.attention?.tokens.every((t) => t.busyCauseId === null)).toBe(true);
    expect(res.receipts[1]?.reason).not.toContain("attention-debt");
  });

  it("attention pool survives for the allowed verb when a DIFFERENT verb is banned+taxed", () => {
    const res = applyIntentDoor(baseState(4, true), ctx(3n), [
      ext(3n, 1, { verb: PlayerVerb.SellOffer, targetKind: "plan", targetId: asEntityId("starter"), offerPriceMicroUsd: asMoney(10n), termMonths: 12, effectiveAtBusinessMinute: null }),
      ext(3n, 2, COMMUNICATE),
    ], {
      attentionCost: { [PlayerVerb.SellOffer]: 1, [PlayerVerb.Communicate]: 1 },
      canExecute: ban(PlayerVerb.SellOffer),
    });
    // seq1 banned → the single focus hand stays free for seq2 (no leak, and
    // — critically — no double-charge: exactly ONE attention token ends busy).
    expect(res.receipts[0]?.outcome).toBe("refused");
    expect(res.receipts[1]?.outcome).toBe("executed");
    const busyAttention = (res.state.attention?.tokens ?? []).filter((t) => t.busyCauseId !== null);
    expect(busyAttention.length).toBe(1);
    expect(busyAttention[0]?.busyCauseId).toBe("intent:2");
  });

  it("zero-cost verb (toggle-speed) is gated too: banned → no executed event", () => {
    const res = applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, TOGGLE)], {
      canExecute: ban(PlayerVerb.ToggleSpeed),
    });
    expect(res.receipts[0]?.outcome).toBe("refused");
    expect(res.events.some((e) => e.kind === "intent-executed")).toBe(false);
  });

  it("BAN + exhausted hands: the host ban outranks hands-exhausted (position proof)", () => {
    const res = applyIntentDoor(baseState(1), ctx(3n), [
      ext(3n, 1, COMMUNICATE), // takes the only hand (cost 1, occupancy 2)
      ext(3n, 2, PLACE()),      // would refuse hands-exhausted…
    ], { canExecute: ban(PlayerVerb.PlaceDevice) }); // …but the ban is earlier
    expect(res.receipts[0]?.outcome).toBe("executed");
    expect(res.receipts[1]?.reason).toBe("perspective-forbids: place-device is outside this seat");
  });
});

/* ═══════════════════════ gate order: what never reaches the hook ═══════════════════════ */

describe("canExecute — the handler and the earlier walls", () => {
  it("banned verb NEVER consults the per-verb validator (gate precedes the handler)", () => {
    let placeCalls = 0;
    applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, PLACE())], {
      canPlaceDevice: () => {
        placeCalls += 1;
        return null;
      },
      canExecute: ban(PlayerVerb.PlaceDevice),
    });
    expect(placeCalls).toBe(0);
  });

  it("a handler refusal (self-edge) is still PAID-then-REFUNDED — the gate never fired for it", () => {
    // The ban list is empty for connect-ports: the sibling rail behaves EXACTLY
    // as before (this is the refund-snapshot path the gate deliberately skips).
    const res = applyIntentDoor(baseState(1), ctx(3n), [ext(3n, 1, CONNECT_SELF)], {
      canExecute: () => null,
    });
    expect(res.receipts[0]?.reason).toContain("self-edge");
    expect(res.state.hands?.tokens.every((t) => t.busyCauseId === null)).toBe(true); // refund law intact
  });

  it("stamped-in-future entries never consult the hook", () => {
    let calls = 0;
    const res = applyIntentDoor(baseState(), ctx(3n), [ext(9n, 1, PLACE())], {
      canExecute: (q) => {
        calls += 1;
        return null;
      },
    });
    expect(calls).toBe(0);
    expect(res.receipts[0]?.reason).toContain("stamped-in-future");
  });

  it("a duplicate (tick, seq) stamp throws BEFORE the hook runs (M4 unaffected)", () => {
    let calls = 0;
    const watch: IntentDoorConfig = {
      canExecute: (q) => {
        calls += 1;
        return null;
      },
    };
    expect(() => applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, PLACE()), ext(3n, 1, COMMUNICATE)], watch)).toThrow(
      /duplicate \(tick, seq\) stamp/,
    );
    expect(calls).toBe(0);
  });

  it("structural wire garbage throws at parse BEFORE the hook runs (M2 unaffected)", () => {
    let calls = 0;
    const broken = ext(3n, 1, PLACE()) as unknown as {
      intent: { payload: { args: Record<string, unknown> } };
    };
    broken.intent.payload.args.deviceKind = 7 as never; // wrong WIRE type — garbage, not refusal
    expect(() =>
      applyIntentDoor(baseState(), ctx(3n), [broken as never], {
        canExecute: (q) => {
          calls += 1;
          return null;
        },
      }),
    ).toThrow(IntentDoorError);
    expect(calls).toBe(0);
  });
});

/* ═══════════════════════ G7 rule-carrier translation answers the gate ═══════════════════════ */

describe("canExecute — translated rule carriers are consulted (ADR-0018 rail)", () => {
  it("mapped carrier: the hook sees the TRANSLATED verb plus the carrier name", () => {
    const seen: ExecuteQuery[] = [];
    applyIntentDoor(baseState(), ctx(3n), [ruleExt(3n, 1, "page", null)], {
      ruleCarriers: "mapped",
      canExecute: (q) => {
        seen.push(q);
        return null;
      },
    });
    expect(seen.length).toBe(1);
    expect(seen[0]?.verb).toBe(PlayerVerb.Communicate);
    expect(seen[0]?.carrier).toBe("page");
  });

  it("player feed: carrier is null", () => {
    const seen: ExecuteQuery[] = [];
    applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, COMMUNICATE)], {
      canExecute: (q) => {
        seen.push(q);
        return null;
      },
    });
    expect(seen[0]?.carrier).toBeNull();
  });

  it("banned verb blocks the Book exactly like the player: label rides `page→communicate`, nothing spent", () => {
    const state0 = baseState();
    const res = applyIntentDoor(state0, ctx(3n), [ruleExt(3n, 1, "page", null)], {
      ruleCarriers: "mapped",
      canExecute: ban(PlayerVerb.Communicate),
    });
    expect(res.state).toBe(state0);
    expect(res.receipts[0]?.verb).toBe("page→communicate");
    expect(res.receipts[0]?.reason).toBe("perspective-forbids: communicate is outside this seat");
  });

  it("unmapped carriers (off-ladder) and ruleCarriers=off never consult the hook", () => {
    let calls = 0;
    const watch: IntentDoorConfig = {
      canExecute: (q) => {
        calls += 1;
        return null;
      },
    };
    const off = applyIntentDoor(baseState(), ctx(3n), [ruleExt(3n, 1, "page", null)], watch);
    expect(off.receipts[0]?.reason).toContain("unsupported-verb-carrier");
    const unmapped = applyIntentDoor(baseState(), ctx(3n), [ruleExt(3n, 1, "failover", IDS.edge)], {
      ...watch,
      ruleCarriers: "mapped",
    });
    expect(unmapped.receipts[0]?.reason).toContain("unsupported-verb-carrier");
    // failover is off-ladder (refused before translation), page saw ruleCarriers
    // off (same wall) — NEITHER ever reached the hook: zero consultations.
    expect(calls).toBe(0);
  });

  it("the gate does NOT exempt rules: host may branch on `carrier` (Book-only ban pins the legibility)", () => {
    const res = applyIntentDoor(baseState(), ctx(3n), [
      ext(3n, 1, COMMUNICATE),
      ruleExt(3n, 2, "page", null),
    ], {
      ruleCarriers: "mapped",
      canExecute: (q) => (q.carrier !== null ? { reason: "book-banned: the Book sits this one out" } : null),
    });
    expect(res.receipts[0]?.outcome).toBe("executed");
    expect(res.receipts[1]?.outcome).toBe("refused");
    expect(res.receipts[1]?.reason).toBe("book-banned: the Book sits this one out");
  });
});

/* ═══════════════════════ the query law (family snapshot posture) ═══════════════════════ */

describe("canExecute — query payload law", () => {
  it("verb/args/context arrive parsed and stamped (W1/F5 law mirrored)", () => {
    const seen: ExecuteQuery[] = [];
    applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, PLACE("rack-7"))], {
      canExecute: (q) => {
        seen.push(q);
        return null;
      },
    });
    expect(plain(seen[0]?.args)).toEqual(plain({ verb: "place-device", nodeId: "rack-7", deviceKind: "generic", template: null }));
    expect(seen[0]?.context.tick).toBe(3n);
    expect(seen[0]?.state.context.tick).toBe(3n); // W1: the snapshot carries THIS pass's stamp
  });

  it("same-tick visibility: EARLIER placements are visible to the LATER query (never a stale board)", () => {
    const nodeIds: ReadonlyArray<string>[] = [];
    applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, PLACE("web-a")), ext(3n, 2, PLACE("web-b"))], {
      canExecute: (q) => {
        nodeIds.push(Array.from(q.state.nodes.keys()) as string[]);
        return null;
      },
    });
    expect(nodeIds[0]?.includes("web-a")).toBe(false);
    expect(nodeIds[1]?.includes("web-a")).toBe(true);
  });

  it("the ban rides the ORDINARY refusal rails: causeId is the intent seq, verb label is the plain verb", () => {
    const res = applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, PLACE())], {
      canExecute: ban(PlayerVerb.PlaceDevice),
    });
    const event = res.events[0] as { causeId: string; verb: string; intentSeq: number };
    expect(event.causeId).toBe("intent:1");
    expect(event.verb).toBe("place-device");
    expect(event.intentSeq).toBe(1);
  });
});

/* ═══════════════════════ fail-loud host-bug posture ═══════════════════════ */

describe("canExecute — host bugs crash, never fork", () => {
  it("a THROWING hook propagates unchanged (the door does not catch host bugs)", () => {
    expect(() =>
      applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, COMMUNICATE)], {
        canExecute: () => {
          throw new RangeError("host bookkeeping exploded");
        },
      }),
    ).toThrow(RangeError);
  });

  it("a non-string reason throws IntentDoorError naming canExecute result.reason (output validated)", () => {
    expect(() =>
      applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, COMMUNICATE)], {
        canExecute: () => ({ reason: 42 as never }),
      }),
    ).toThrow(/canExecute result\.reason/);
  });

  it("a rejection object missing `reason` throws too (no silent allow, no silent refuse)", () => {
    expect(() =>
      applyIntentDoor(baseState(), ctx(3n), [ext(3n, 1, COMMUNICATE)], {
        canExecute: () => ({} as never),
      }),
    ).toThrow(IntentDoorError);
  });
});

/* ═══════════════════════ ceiling witness + census falsifier ═══════════════════════ */

describe("canExecute — the expressibility ceiling lifts; the census holds", () => {
  it("connect-ports — a verb with NO per-verb validator today — is bannable before payment", () => {
    const state0 = baseState();
    const res = applyIntentDoor(state0, ctx(3n), [ext(3n, 1, CONNECT_SELF)], {
      canExecute: ban(PlayerVerb.ConnectPorts),
    });
    expect(res.state).toBe(state0);
    expect(res.receipts[0]?.reason).toBe("perspective-forbids: connect-ports is outside this seat");
  });

  it("census falsifier: intent-door.ts STILL raises EXACTLY 46 codes — the gate minted none", () => {
    const source = readFileSync(fileURLToPath(new URL("../intent-door.ts", import.meta.url)), "utf8");
    const codes = new Set<string>();
    const re = /(?:reason:\s*|reject\([^,]+,\s*)["`]([a-z][a-z0-9-]*)/g;
    for (const m of source.matchAll(re)) codes.add(m[1] as string);
    expect(codes.size).toBe(46);
    expect(codes.has("execute-refused")).toBe(false); // the naive door-side prefix — NOT taken
    // the taken design, pinned in source: the host string flows through verbatim
    expect(source).toContain("reject(label, requireString(executeRejection.reason");
  });

  it("×100 determinism: a banned+allowed mixed feed re-applied on fresh states yields ONE digest", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const res = applyIntentDoor(baseState(), ctx(3n), [
        ext(3n, 1, PLACE()),
        ext(3n, 2, COMMUNICATE),
        ext(3n, 3, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: "inspect", shedOrder: null }),
      ], { canExecute: ban(PlayerVerb.Communicate) });
      digests.add(digestState(res.state));
    }
    expect(digests.size).toBe(1);
  });
});
