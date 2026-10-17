/**
 * E2b seam 1 — the bigint wire. A price is a MoneyUnit bigint; JSON cannot
 * carry one. The law mirrors the projection direction (WireUs/WireFixed):
 * stringify at SEND (SimClient), revive at the WORKER boundary
 * (wireIntentToPlayerIntent), fail loud on a non-integer shape. Both runner
 * hosts (sim.worker.ts, fakeWorker.ts) share the ONE materialization, and
 * the BIGINT_ARG_FIELDS mirror is drift-pinned against the door's private
 * VERB_ARG_SHAPES table below. ADR-0015 5/5 (Negotiate) added the SECOND
 * arm — `bigint-or-null` (concessionMicroUsd): same revival law, plus the
 * explicit null sentinel crosses as real null and STAYS null (0-vs-null is
 * load-bearing at the cliff: "we will not move on price" vs "no money in
 * the talk"). The NULLABLE_BIGINT_ARG_FIELDS mirror carries that arm and is
 * drift-pinned against the same engine table.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  BIGINT_ARG_FIELDS,
  NULLABLE_BIGINT_ARG_FIELDS,
  ProtocolError,
  assertToWorker,
  wireIntentToPlayerIntent,
  type SimProjection,
  type WireIntentEnvelope,
} from "../../shared/protocol";
import { FakeWorkerLike } from "../../bridge/fakeWorker";
import { SimClient } from "../../bridge/simClient";

/** Wire envelope builder — the exact shape `assertToWorker` releases. */
function envelope(args: Record<string, string | number | null>): WireIntentEnvelope {
  const parsed = assertToWorker({
    kind: "intent",
    protocol: 1,
    seq: 1,
    clock: "business",
    atUs: "0",
    origin: "player",
    payload: { kind: "player-verb", args },
  });
  if (parsed.kind !== "intent") throw new Error("unreachable");
  return parsed;
}

const ADJUST_ARGS = {
  verb: "adjust-price",
  targetKind: "sku",
  targetId: "hourly-smb",
  newPriceMicroUsd: "19800000",
  effectiveAtBusinessMinute: null,
};

// ADR-0015 3/5 (Sell) — the SECOND bigint carrier on this wire. The sell
// offer books onto GameState.sell; the runner needs no node resolution
// (targetKind/targetId resolve host-side), so the bridge witness below
// executes exactly like the adjust-price twin.
const SELL_ARGS = {
  verb: "sell-offer",
  targetKind: "plan",
  targetId: "cathedral-1u",
  offerPriceMicroUsd: "250000000",
  termMonths: 12,
  effectiveAtBusinessMinute: null,
};

// ADR-0015 5/5 (Negotiate) — the FIRST `bigint-or-null` carrier on this
// wire. The concession books onto GameState.negotiate; null means "no money
// in the talk" and MUST survive the JSON hop as null (the 0n-vs-null
// distinction is load-bearing at the cliff — stance vs silence).
const NEGOTIATE_ARGS = {
  verb: "negotiate-terms",
  targetKind: "plan",
  targetId: "cage-7",
  tone: "rapport",
  concessionMicroUsd: "250000000",
  termMonthsExtension: null,
  effectiveAtBusinessMinute: null,
};

describe("BIGINT_ARG_FIELDS mirror vs the ENGINE (drift pin)", () => {
  it("every VERB_ARG_SHAPES bigint field is covered; the mirror adds none", () => {
    const door = readFileSync(
      fileURLToPath(new URL("../../../../../packages/sim-core/src/pipeline/intent-door.ts", import.meta.url)),
      "utf8",
    );
    const types = readFileSync(
      fileURLToPath(new URL("../../../../../packages/sim-core/src/types.ts", import.meta.url)),
      "utf8",
    );
    // Enum member → wire label (PlayerVerb.AdjustPrice = "adjust-price").
    const labelOf = new Map<string, string>();
    for (const m of types.matchAll(/^\s{2}(\w+) = "([a-z0-9-]+)",$/gm)) {
      labelOf.set(m[1]!, m[2]!);
    }
    const enginePairs: string[] = [];
    const table = /const VERB_ARG_SHAPES[\s\S]*?\n\}\);/.exec(door);
    expect(table).not.toBeNull();
    for (const row of table![0]!.matchAll(/\[PlayerVerb\.(\w+)\]: Object\.freeze\(\{([^}]*)\}\)/g)) {
      const verb = labelOf.get(row[1]!);
      expect(verb, `unknown PlayerVerb member ${row[1]}`).toBeTruthy();
      for (const field of row[2]!.matchAll(/(\w+): "bigint"/g)) {
        enginePairs.push(`${verb}#${field[1]}`);
      }
    }
    const mirrorPairs = Object.entries(BIGINT_ARG_FIELDS).flatMap(([verb, fields]) =>
      fields.map((f) => `${verb}#${f}`),
    );
    expect(enginePairs.sort()).toEqual(mirrorPairs.sort());
    expect(enginePairs.length).toBeGreaterThanOrEqual(1); // the pin itself must not rot empty
  });
});

/* The `bigint-or-null` arm gets its OWN exact-quote extraction — the strict
 * pin's regex `"bigint"` (closing quote included) structurally cannot see
 * `"bigint-or-null"`, which is exactly why this second pin exists: without
 * it the nullable arm crosses the wire UNPINNED. */
function engineArgShapePairs(arm: "bigint" | "bigint-or-null"): string[] {
  const door = readFileSync(
    fileURLToPath(new URL("../../../../../packages/sim-core/src/pipeline/intent-door.ts", import.meta.url)),
    "utf8",
  );
  const types = readFileSync(
    fileURLToPath(new URL("../../../../../packages/sim-core/src/types.ts", import.meta.url)),
    "utf8",
  );
  const labelOf = new Map<string, string>();
  for (const m of types.matchAll(/^\s{2}(\w+) = "([a-z0-9-]+)",$/gm)) {
    labelOf.set(m[1]!, m[2]!);
  }
  const pairs: string[] = [];
  const table = /const VERB_ARG_SHAPES[\s\S]*?\n\}\);/.exec(door);
  expect(table).not.toBeNull();
  for (const row of table![0]!.matchAll(/\[PlayerVerb\.(\w+)\]: Object\.freeze\(\{([^}]*)\}\)/g)) {
    const verb = labelOf.get(row[1]!);
    expect(verb, `unknown PlayerVerb member ${row[1]}`).toBeTruthy();
    for (const field of row[2]!.matchAll(new RegExp(`(\\w+): "${arm}"`, "g"))) {
      pairs.push(`${verb}#${field[1]}`);
    }
  }
  return pairs;
}

describe("NULLABLE_BIGINT_ARG_FIELDS mirror vs the ENGINE (drift pin)", () => {
  it("every VERB_ARG_SHAPES bigint-or-null field is covered; the mirror adds none", () => {
    const enginePairs = engineArgShapePairs("bigint-or-null");
    const mirrorPairs = Object.entries(NULLABLE_BIGINT_ARG_FIELDS).flatMap(([verb, fields]) =>
      fields.map((f) => `${verb}#${f}`),
    );
    expect(enginePairs.sort()).toEqual(mirrorPairs.sort());
    expect(enginePairs.length).toBeGreaterThanOrEqual(1); // the pin itself must not rot empty
  });

  it("the two arms are DISJOINT at the engine — a strict field never migrated to the nullable table", () => {
    const strict = engineArgShapePairs("bigint");
    const nullable = engineArgShapePairs("bigint-or-null");
    for (const pair of nullable) {
      expect(strict, `${pair} rides BOTH arms — the tables would double-revive`).not.toContain(pair);
    }
    // and the strict mirror stays strict-only (the sell/adjust pair):
    expect(Object.keys(NULLABLE_BIGINT_ARG_FIELDS)).not.toContain("adjust-price");
    expect(Object.keys(NULLABLE_BIGINT_ARG_FIELDS)).not.toContain("sell-offer");
  });
});

describe("wireIntentToPlayerIntent — boundary revival", () => {
  it("revives the decimal string into a REAL bigint and keeps the rest verbatim", () => {
    const intent = wireIntentToPlayerIntent(envelope(ADJUST_ARGS));
    if (intent.payload.kind !== "player-verb") throw new Error("unreachable");
    const args = intent.payload.args;
    if (args.verb !== "adjust-price") throw new Error("unreachable");
    expect(typeof args.newPriceMicroUsd).toBe("bigint");
    expect(args.newPriceMicroUsd).toBe(19_800_000n);
    expect(args.targetId).toBe("hourly-smb");
    expect(args.effectiveAtBusinessMinute).toBeNull();
  });

  it("a fractional string on a bigint field dies at the boundary, not in the door", () => {
    expect(() => wireIntentToPlayerIntent(envelope({ ...ADJUST_ARGS, newPriceMicroUsd: "9.25" }))).toThrow(
      ProtocolError,
    );
    expect(() => wireIntentToPlayerIntent(envelope({ ...ADJUST_ARGS, newPriceMicroUsd: "9.25" }))).toThrow(
      /args\.newPriceMicroUsd/,
    );
    // A raw JSON number is equally structural garbage (wire law: strings).
    expect(() => wireIntentToPlayerIntent(envelope({ ...ADJUST_ARGS, newPriceMicroUsd: 9.25 }))).toThrow(
      /args\.newPriceMicroUsd/,
    );
  });

  it("the sell-offer carrier revives too: bigint price revived, termMonths a plain number, null stamp verbatim", () => {
    const intent = wireIntentToPlayerIntent(envelope(SELL_ARGS));
    if (intent.payload.kind !== "player-verb") throw new Error("unreachable");
    const args = intent.payload.args as unknown as Record<string, unknown>;
    expect(args["offerPriceMicroUsd"]).toBe(250_000_000n);
    expect(args["termMonths"]).toBe(12); // number passes through untouched
    expect(args["targetKind"]).toBe("plan");
    expect(args["effectiveAtBusinessMinute"]).toBeNull();
  });

  it("a fractional string on the sell-offer carrier dies at the boundary too", () => {
    expect(() => wireIntentToPlayerIntent(envelope({ ...SELL_ARGS, offerPriceMicroUsd: "9.25" }))).toThrow(
      ProtocolError,
    );
    expect(() => wireIntentToPlayerIntent(envelope({ ...SELL_ARGS, offerPriceMicroUsd: "9.25" }))).toThrow(
      /args\.offerPriceMicroUsd/,
    );
  });

  it("the negotiate-terms carrier revives: decimal string ⇒ bigint, siblings verbatim", () => {
    const intent = wireIntentToPlayerIntent(envelope(NEGOTIATE_ARGS));
    if (intent.payload.kind !== "player-verb") throw new Error("unreachable");
    const args = intent.payload.args as unknown as Record<string, unknown>;
    expect(typeof args["concessionMicroUsd"]).toBe("bigint");
    expect(args["concessionMicroUsd"]).toBe(250_000_000n);
    expect(args["tone"]).toBe("rapport");
    expect(args["termMonthsExtension"]).toBeNull(); // the OTHER nullable passes through
    expect(args["effectiveAtBusinessMinute"]).toBeNull();
  });

  it("the explicit null concession crosses as REAL null and stays null (0-vs-null is load-bearing)", () => {
    const intent = wireIntentToPlayerIntent(envelope({ ...NEGOTIATE_ARGS, concessionMicroUsd: null }));
    if (intent.payload.kind !== "player-verb") throw new Error("unreachable");
    const args = intent.payload.args as unknown as Record<string, unknown>;
    expect(args["concessionMicroUsd"]).toBeNull();
    expect("concessionMicroUsd" in args).toBe(true);
    // and the JSON round-trip cannot forge the distinction: 0n crosses as
    // the string "0" and revives to ZERO — never to null:
    const stance = wireIntentToPlayerIntent(envelope({ ...NEGOTIATE_ARGS, concessionMicroUsd: "0" }));
    if (stance.payload.kind !== "player-verb") throw new Error("unreachable");
    expect((stance.payload.args as unknown as Record<string, unknown>)["concessionMicroUsd"]).toBe(0n);
  });

  it("garbage on the nullable carrier dies at the boundary (float string, number, absent key — null is the ONLY non-string form)", () => {
    expect(() => wireIntentToPlayerIntent(envelope({ ...NEGOTIATE_ARGS, concessionMicroUsd: "9.25" }))).toThrow(
      /args\.concessionMicroUsd/,
    );
    expect(() => wireIntentToPlayerIntent(envelope({ ...NEGOTIATE_ARGS, concessionMicroUsd: 9.25 }))).toThrow(
      ProtocolError,
    );
    const { concessionMicroUsd: _dropped, ...noConcession } = NEGOTIATE_ARGS;
    void _dropped; // pin: an ABSENT carrier is boundary garbage too — null must be EXPLICIT
    expect(() => wireIntentToPlayerIntent(envelope(noConcession))).toThrow(/args\.concessionMicroUsd/);
  });

  it("verbs without bigint fields pass through untouched", () => {
    const intent = wireIntentToPlayerIntent(envelope({ verb: "communicate", note: "hi", target: null }));
    if (intent.payload.kind !== "player-verb") throw new Error("unreachable");
    expect(intent.payload.args).toEqual({ verb: "communicate", note: "hi", target: null });
  });

  it("slider and legacy-verb arms BigInt() their string values too", () => {
    const slider = assertToWorker({
      kind: "intent",
      protocol: 1,
      seq: 2,
      clock: "sim",
      atUs: "5000000",
      origin: "player",
      payload: { kind: "slider", control: "defense.aggression", value: "32768" },
    });
    if (slider.kind !== "intent") throw new Error("unreachable");
    const materialized = wireIntentToPlayerIntent(slider);
    expect(materialized.atUs).toBe(5_000_000n);
    if (materialized.payload.kind !== "slider") throw new Error("unreachable");
    expect(materialized.payload.value).toBe(32_768n);
  });
});

describe("full bridge — a bigint price survives SimClient → wire → worker-host → door", () => {
  function bridge() {
    const fake = new FakeWorkerLike();
    const frames: SimProjection[] = [];
    const client = new SimClient(fake, { onProjection: (p) => frames.push(p) });
    client.boot("bridge-seed", 1, "sim-core");
    return { fake, client, frames };
  }

  it("sendPlayerVerb(bigint) EXECUTES over the worker path (the seam this lane closes)", () => {
    const { fake, client, frames } = bridge();
    client.sendPlayerVerb(
      {
        verb: "adjust-price",
        targetKind: "sku",
        targetId: "bridge-sku",
        newPriceMicroUsd: 19_800_000n, // a REAL bigint client-side
        effectiveAtBusinessMinute: null,
      },
      "business",
    );
    fake.pump(2);
    // Boundary proof: the worker host materialized a bigint BEFORE the door.
    const last = fake.lastIntent;
    expect(last).not.toBeNull();
    if (last === null || last.payload.kind !== "player-verb") throw new Error("worker never saw the intent");
    expect((last.payload.args as unknown as Record<string, unknown>)["newPriceMicroUsd"]).toBe(19_800_000n);
    // End-to-end proof off the DECODED projection wire (both directions):
    const receipts = frames
      .flatMap((f) => f.notices)
      .filter((n) => n.kind === "intent-executed" || n.kind === "intent-refused");
    expect(receipts).toHaveLength(1);
    expect(receipts[0]!.kind).toBe("intent-executed");
    expect(receipts[0]!.detail).toBe("adjust-price: target=sku:bridge-sku,price=19800000");
    client.destroy();
  });

  it("a revived 0 µ$ reaches the door's VALUE domain (refusal, not IntentDoorError)", () => {
    const { fake, client, frames } = bridge();
    client.sendPlayerVerb(
      {
        verb: "adjust-price",
        targetKind: "sku",
        targetId: "bridge-sku",
        newPriceMicroUsd: 0n,
        effectiveAtBusinessMinute: null,
      },
      "business",
    );
    fake.pump(2);
    const refused = frames.flatMap((f) => f.notices).filter((n) => n.kind === "intent-refused");
    expect(refused).toHaveLength(1);
    expect(refused[0]!.detail).toMatch(/^adjust-price: invalid-price/);
    client.destroy();
  });

  it("a non-decimal-string price is rejected LOUD at the worker boundary (pump throws)", () => {
    const fake = new FakeWorkerLike();
    const client = new SimClient(fake, {});
    client.boot("bridge-seed", 1, "sim-core");
    // Bypass the client's stringify law with a hand-forged wire frame:
    fake.postMessage({
      kind: "intent",
      protocol: 1,
      seq: 99,
      clock: "business",
      atUs: "0",
      origin: "player",
      payload: {
        kind: "player-verb",
        args: { ...ADJUST_ARGS, newPriceMicroUsd: "1e7" },
      },
    });
    expect(() => fake.pump(1)).toThrow(/args\.newPriceMicroUsd/);
    client.destroy();
  });

  it("sell-offer: sendPlayerVerb(bigint) EXECUTES over the worker path (ADR-0015 3/5)", () => {
    const { fake, client, frames } = bridge();
    client.sendPlayerVerb(
      {
        verb: "sell-offer",
        targetKind: "plan",
        targetId: "bridge-plan",
        offerPriceMicroUsd: 250_000_000n, // a REAL bigint client-side
        termMonths: 12,
        effectiveAtBusinessMinute: null,
      },
      "business",
    );
    fake.pump(2);
    const last = fake.lastIntent;
    expect(last).not.toBeNull();
    if (last === null || last.payload.kind !== "player-verb") throw new Error("worker never saw the intent");
    expect((last.payload.args as unknown as Record<string, unknown>)["offerPriceMicroUsd"]).toBe(250_000_000n);
    const receipts = frames
      .flatMap((f) => f.notices)
      .filter((n) => n.kind === "intent-executed" || n.kind === "intent-refused");
    expect(receipts).toHaveLength(1);
    expect(receipts[0]!.kind).toBe("intent-executed");
    expect(receipts[0]!.detail).toBe("sell-offer: target=plan:bridge-plan,price=250000000,term=12");
    client.destroy();
  });

  it("sell-offer: a revived 0 µ$ refuses bad-offer-price — the money stays UNTOUCHED either way", () => {
    const { fake, client, frames } = bridge();
    client.sendPlayerVerb(
      {
        verb: "sell-offer",
        targetKind: "plan",
        targetId: "bridge-plan",
        offerPriceMicroUsd: 0n,
        termMonths: 12,
        effectiveAtBusinessMinute: null,
      },
      "business",
    );
    fake.pump(2);
    const refused = frames.flatMap((f) => f.notices).filter((n) => n.kind === "intent-refused");
    expect(refused).toHaveLength(1);
    expect(refused[0]!.detail).toMatch(/^sell-offer: bad-offer-price/);
    client.destroy();
  });

  it("negotiate-terms: sendPlayerVerb(bigint concession) EXECUTES over the worker path (ADR-0015 5/5)", () => {
    const { fake, client, frames } = bridge();
    client.sendPlayerVerb(
      {
        verb: "negotiate-terms",
        targetKind: "plan",
        targetId: "bridge-cage",
        tone: "rapport",
        concessionMicroUsd: 250_000_000n, // a REAL bigint client-side
        termMonthsExtension: null,
        effectiveAtBusinessMinute: null,
      },
      "business",
    );
    fake.pump(2);
    const last = fake.lastIntent;
    expect(last).not.toBeNull();
    if (last === null || last.payload.kind !== "player-verb") throw new Error("worker never saw the intent");
    expect((last.payload.args as unknown as Record<string, unknown>)["concessionMicroUsd"]).toBe(250_000_000n);
    const receipts = frames
      .flatMap((f) => f.notices)
      .filter((n) => n.kind === "intent-executed" || n.kind === "intent-refused");
    expect(receipts).toHaveLength(1);
    expect(receipts[0]!.kind).toBe("intent-executed");
    expect(receipts[0]!.detail).toBe(
      "negotiate-terms: target=plan:bridge-cage,tone=rapport,concession=250000000,ext=none",
    );
    client.destroy();
  });

  it("negotiate-terms: a null concession crosses the hop as null and books the pure-talk stance", () => {
    const { fake, client, frames } = bridge();
    client.sendPlayerVerb(
      {
        verb: "negotiate-terms",
        targetKind: "plan",
        targetId: "bridge-cage",
        tone: "firm",
        concessionMicroUsd: null,
        termMonthsExtension: 12,
        effectiveAtBusinessMinute: null,
      },
      "business",
    );
    fake.pump(2);
    const last = fake.lastIntent;
    expect(last).not.toBeNull();
    if (last === null || last.payload.kind !== "player-verb") throw new Error("worker never saw the intent");
    expect((last.payload.args as unknown as Record<string, unknown>)["concessionMicroUsd"]).toBeNull();
    const receipts = frames.flatMap((f) => f.notices).filter((n) => n.kind === "intent-executed");
    expect(receipts).toHaveLength(1);
    expect(receipts[0]!.detail).toBe(
      "negotiate-terms: target=plan:bridge-cage,tone=firm,concession=none,ext=12",
    );
    client.destroy();
  });

  it("negotiate-terms: an off-vocab tone refuses at the door AFTER revival (bad-tone, not a throw)", () => {
    const { fake, client, frames } = bridge();
    client.sendPlayerVerb(
      {
        verb: "negotiate-terms",
        targetKind: "plan",
        targetId: "bridge-cage",
        tone: "plead",
        concessionMicroUsd: 0n,
        termMonthsExtension: null,
        effectiveAtBusinessMinute: null,
      },
      "business",
    );
    fake.pump(2);
    const refused = frames.flatMap((f) => f.notices).filter((n) => n.kind === "intent-refused");
    expect(refused).toHaveLength(1);
    expect(refused[0]!.detail).toMatch(/^negotiate-terms: bad-tone/);
    client.destroy();
  });
});
