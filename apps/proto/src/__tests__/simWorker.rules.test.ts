/**
 * boot.rules rider (ADR-0019 program 5 follow-on @ this lane) — the mainline
 * WORKER can arm the Book. Wave-25 (@9748ee4) landed the runner option and
 * explicitly left the wire for a later additive rider; this is that rider:
 * `boot.rules.entries` carries {host hash → PolicyCard document} pairs,
 * PROTOCOL_VERSION stays 1, absent ⇒ the legacy wire is byte-ident (key
 * never posted, never parsed), malformed SHAPE ⇒ ProtocolError at the codec,
 * the engine's grammar wall stays the engine's (evaluator re-validates the
 * book every fold). Option B (hashes only) was probed and DEGENERATED:
 * packages/content carries zero PolicyCard documents (the loader parses
 * ruleset cards, not policy cards) and g7Deck is gates/-side app data the
 * worker graph cannot reach — so the cards themselves must cross.
 *
 * Witnesses (brief-shaped):
 *  · codec: closed vocabularies + OneTwoThree arity + set-uniqueness with
 *    exact field paths; trusted↔wire revival round-trip over the REAL g7
 *    deck (parse(encode(cards)) deep-equals the originals, bigints intact);
 *    key absence pinned BOTH parsed and posted; JSON hop; unknown inner
 *    keys tolerated (envelope precedent).
 *  · drift pins: every wire vocabulary re-derived from types.ts source;
 *    both worker hosts forward `message.rules` (source scan).
 *  · byte-identity: no rider / empty book / booted-but-uncommitted g7 book
 *    are 100-frame digest twins of the frozen legacy hexes
 *    (ca8863849cb3db32 / 780b1cbc61dff760, simWorker.corpus.test.ts).
 *  · FULL LOOP (brief letter): fakeWorker boots the GENUINE g7Deck; commits
 *    land through the door (receipts frame-visible, book grows). Honest
 *    scope witness: the g7 cards' `node/edge` refs do not exist on the
 *    mainline board, so nothing FIRES there — content is not protocol, and
 *    the pin says so falsifiably.
 *  · FULL LOOP (brief intent): a MAINLINE-scoped book (edge ids, the
 *    probe-pinned 16_384 quarter-load wall) EXECUTES over the wire —
 *    rule-fired notices and mapped-carrier door receipts, two-runner
 *    byte-identical determinism twin, dormant-control divergence.
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalDigest } from "@hh/sim-core/replay";
import { FIXED_ONE } from "@hh/sim-core/kernel";
import { validatePolicyCard } from "@hh/sim-core/policy";
import {
  asEntityId,
  asMoney,
  asRuleId,
  type PlayerIntent,
  type PlayerVerbArgs,
  type PolicyActionId,
  type PolicyCard,
  type RuleId,
} from "@hh/sim-core/types";
import {
  METRIC_UNIT_WIRE_IDS,
  POLICY_ACTION_ID_WIRE_IDS,
  POLICY_BAND_WIRE_IDS,
  POLICY_COMPARATOR_WIRE_IDS,
  POLICY_ESCALATION_TARGET_WIRE_IDS,
  POLICY_SCOPE_KIND_WIRE_IDS,
  ProtocolError,
  assertToWorker,
  encodeBootRules,
  encodeProjection,
  workerRulesLookup,
  type BootRules,
  type SimProjection,
} from "../shared/protocol";
import { SimCoreRunner } from "../runner/index";
import { FakeWorkerLike } from "../bridge/fakeWorker";
import { SimClient } from "../bridge/simClient";
import { G7_CARDS, g7CardHash } from "../gates/g7/g7Deck";

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
  return {
    fake,
    client,
    received,
    faults,
    readyInfo: () => ready,
    runner: () => fake.lastRunner as SimCoreRunner,
  };
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

function noticeDetails(received: readonly SimProjection[]): string[] {
  return received.flatMap((frame) => frame.notices.map((n) => n.detail ?? ""));
}
function firedDetails(received: readonly SimProjection[]): string[] {
  return received.flatMap((frame) =>
    frame.notices.filter((n) => n.kind === "rule-fired").map((n) => n.detail ?? ""),
  );
}

/* ─────────────── the GENUINE g7 deck, in boot-book form ─────────────── */

const G7_BOOT: BootRules = Object.freeze({
  entries: Object.freeze(G7_CARDS.map((card) => Object.freeze({ hash: g7CardHash(card.id), card }))),
});

/* ─────────── a MAINLINE-scoped book (the full-loop intent arm) ───────────
 * Scope refs are the runner's own node identities ("edge"/"origin" — the
 * micro-board's "node/edge" refs would never see a cell, which the g7-deck
 * describe pins as a NON-firing witness). Threshold: the quarter-load wall
 * 16_384 = 0.25 × 65536, the probe-pinned mainline truth (same law the
 * wave-25 runner test authored against). Hash grammar stays host-owned and
 * test-local — the wire treats it as an opaque key either way. */

function card(
  id: string,
  scopeRef: ReturnType<typeof asEntityId>,
  actionId: PolicyActionId,
  value: bigint | null,
  band: PolicyCard["band"],
  amount: bigint,
): PolicyCard {
  return Object.freeze({
    id: asRuleId(id),
    scope: Object.freeze({ kind: "object" as const, ref: scopeRef }),
    when: Object.freeze([
      Object.freeze({
        metric: "utilizationRho",
        comparator: ">" as const,
        threshold: Object.freeze({ kind: "value" as const, amount, unit: "count" as const }),
      }),
    ]) as PolicyCard["when"],
    then: Object.freeze([
      Object.freeze({ id: actionId, runbookName: null, value }),
    ]) as PolicyCard["then"],
    band,
    upkeepMicroUsd: asMoney(0n),
  });
}

const EDGE = asEntityId("edge");
const LIVE_DECK: readonly PolicyCard[] = Object.freeze([
  card("watch-the-door", EDGE, "raise-inspection-depth", 2n * FIXED_ONE, "execute", 16_384n),
  card("page-the-founder", EDGE, "page", null, "execute", 16_384n),
] as const);
for (const c of LIVE_DECK) validatePolicyCard(c);
/** The NEVER-fires control: same ids, same carriers — only the threshold is
 *  unreachable (rho caps below FIXED_UNIT; `>` 65_536 is law-true never).
 *  Commit receipts are byte-equal to the live book; the ONLY divergence the
 *  two runs can ever show is the rule phase itself. */
const CONTROL_DECK: readonly PolicyCard[] = Object.freeze([
  card("watch-the-door", EDGE, "raise-inspection-depth", 2n * FIXED_ONE, "execute", 65_536n),
  card("page-the-founder", EDGE, "page", null, "execute", 65_536n),
] as const);
for (const c of CONTROL_DECK) validatePolicyCard(c);

function summary(c: PolicyCard): string {
  const when = c.when
    .map((p) => `${p.metric}${p.comparator}${p.threshold.kind === "value" ? p.threshold.amount : "—"}`)
    .join("&");
  const then = c.then
    .map((a) => `${a.id}:${a.value === null ? "—" : a.value.toString()}`)
    .join("&");
  return `boot-rules-lane-card|${c.id}|${c.scope.kind}:${c.scope.ref ?? ""}|${c.band}|${when}|${then}`;
}
const hashOf = (deck: readonly PolicyCard[], id: string): string => {
  const found = deck.find((c) => String(c.id) === id);
  if (found === undefined) throw new Error(`no card "${id}"`);
  return canonicalDigest(summary(found));
};
const LIVE_BOOT: BootRules = Object.freeze({
  entries: Object.freeze(LIVE_DECK.map((c) => Object.freeze({ hash: hashOf(LIVE_DECK, String(c.id)), card: c }))),
});
const CONTROL_BOOT: BootRules = Object.freeze({
  entries: Object.freeze(CONTROL_DECK.map((c) => Object.freeze({ hash: hashOf(CONTROL_DECK, String(c.id)), card: c }))),
});

const commit = (client: SimClient, hash: string): void =>
  client.sendPlayerVerb({ verb: "policy-card-commit", cardHash: hash });

/** Direct-runner commit mirroring SimClient.sendPlayerVerb's flat string args. */
function submitCommit(runner: SimCoreRunner, seq: number, hash: string): void {
  runner.submit({
    seq,
    clock: "sim",
    atUs: 0n,
    origin: "player",
    payload: { kind: "player-verb", args: { verb: "policy-card-commit", cardHash: hash } as unknown as PlayerVerbArgs },
  } as PlayerIntent);
}

/** Boot a direct runner through the SAME boundary builder the worker hosts
 *  call: encode → assertToWorker → workerRulesLookup. No second
 *  implementation exists to drift (the hosts' anti-drift law, reused). */
function lookupThroughWire(rules: BootRules): ReturnType<typeof workerRulesLookup> {
  const parsed = assertToWorker({
    kind: "boot", protocol: 1, seed: "twin", speedX: 1, runnerKind: "sim-core", rules: encodeBootRules(rules),
  });
  if (parsed.kind !== "boot" || parsed.rules === undefined) throw new Error("expected booted rules");
  return workerRulesLookup(parsed.rules);
}

/* ───────────────────────────── codec ───────────────────────────── */

describe("boot.rules codec (additive protocol-v1 rider, ADR-0019 program 5 follow-on)", () => {
  it("absent key ⇒ legacy boot parsed AND posted without a rules key at all", () => {
    const parsed = assertToWorker({ kind: "boot", protocol: 1, seed: "abc", speedX: 2 });
    expect(Object.keys(parsed).sort()).toEqual(["kind", "protocol", "runnerKind", "seed", "speedX"]);
    const r = recorder();
    r.client.boot("abc");
    expect(Object.keys(r.posted[0]!).sort()).toEqual(["kind", "protocol", "runnerKind", "seed", "speedX"]);
    // The 5-positional build call stays key-free too (positions 1–4 law).
    r.client.boot("abc", 1, "sim-core", undefined, { hands: 2 });
    expect(Object.keys(r.posted[1]!).sort()).toEqual(["build", "kind", "protocol", "runnerKind", "seed", "speedX"]);
  });

  it("trusted → wire → parse REVIVES the real g7 deck byte-for-byte (bigint law)", () => {
    const wire = encodeBootRules(G7_BOOT);
    const parsed = assertToWorker({
      kind: "boot", protocol: 1, seed: "g7", speedX: 1, runnerKind: "sim-core", rules: wire,
    });
    if (parsed.kind !== "boot" || parsed.rules === undefined) throw new Error("expected booted rules");
    expect(parsed.rules.entries.length).toBe(6);
    for (let i = 0; i < G7_CARDS.length; i += 1) {
      expect(parsed.rules.entries[i]!.card).toEqual(G7_CARDS[i]);
      expect(parsed.rules.entries[i]!.hash).toBe(g7CardHash(G7_CARDS[i]!.id));
    }
    // Spot the revival itself: these are bigints again, not strings.
    const door = parsed.rules.entries[0]!.card;
    expect(door.then[0]!.value).toBe(2n * FIXED_ONE);
    expect(door.upkeepMicroUsd).toBe(0n);
    const threshold = door.when[0]!.threshold;
    if (threshold.kind !== "value") throw new Error("expected value threshold");
    expect(threshold.amount).toBe(40_960n);
  });

  it("wire form is JSON-safe AND survives the hop (structuredClone-free law)", () => {
    const wire = encodeBootRules(G7_BOOT) as unknown as Record<string, unknown>;
    const seen: string[] = [];
    const walk = (value: unknown, path: string): void => {
      if (typeof value === "bigint") seen.push(path);
      if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`));
      else if (typeof value === "object" && value !== null) {
        for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
      }
    };
    walk(wire, "rules");
    expect(seen).toEqual([]);
    const envelope = { kind: "boot", protocol: 1, seed: "g7", speedX: 1, runnerKind: "sim-core", rules: wire };
    const direct = assertToWorker(envelope);
    const viaJson = assertToWorker(JSON.parse(JSON.stringify(envelope)));
    expect(viaJson).toEqual(direct);
  });

  it("encode OMITS for/unless/else when unset; parse accepts the full card", () => {
    const plain = encodeBootRules({ entries: [{ hash: "h", card: LIVE_DECK[0]! }] });
    expect(Object.keys(plain.entries[0]!.card).sort()).toEqual([
      "band", "id", "scope", "then", "upkeepMicroUsd", "when",
    ]);
    const rich: PolicyCard = Object.freeze({
      ...LIVE_DECK[0]!,
      for: Object.freeze({ durationUs: 90_000_000n }),
      unless: LIVE_DECK[1]!.when,
      else: Object.freeze({ to: "band" as const, ref: "consult" as const }),
    });
    const parsed = assertToWorker({
      kind: "boot", protocol: 1, seed: "r", speedX: 1, runnerKind: "sim-core",
      rules: encodeBootRules({ entries: [{ hash: "rich", card: rich }] }),
    });
    if (parsed.kind !== "boot") throw new Error("expected boot");
    expect(parsed.rules!.entries[0]!.card).toEqual(rich);
  });

  it("refuses malformed riders loud with exact field paths (house grammar)", () => {
    const boot = (rules: unknown) => ({
      kind: "boot", protocol: 1, seed: "s", speedX: 1, runnerKind: "sim-core", rules,
    });
    expect(() => assertToWorker(boot("the book of doubts"))).toThrow(/boot\.rules/);
    expect(() => assertToWorker(boot({ entries: "watch-the-door" }))).toThrow(/boot\.rules\.entries/);
    expect(() => assertToWorker(boot({ entries: [{ hash: "", card: LIVE_DECK[0] }] }))).toThrow(/entries\[0\]\.hash/);
    expect(() => assertToWorker(boot(encodeBootRules({ entries: [
      { hash: "dup", card: LIVE_DECK[0]! },
      { hash: "dup", card: LIVE_DECK[1]! },
    ] })))).toThrow(/duplicates entries\[0\]/);
    const mutateWire = (mutate: (wire: Record<string, any>) => void): unknown => {
      const wire = structuredClone(encodeBootRules(LIVE_BOOT)) as Record<string, any>;
      mutate(wire);
      return wire;
    };
    expect(() => assertToWorker(boot(mutateWire((w) => { w.entries[0].card.band = "yolo"; })))).toThrow(/\.card\.band/);
    expect(() => assertToWorker(boot(mutateWire((w) => { w.entries[0].card.when[0].comparator = "≥"; })))).toThrow(
      /\.when\[0\]\.comparator/,
    );
    expect(() => assertToWorker(boot(mutateWire((w) => { w.entries[0].card.when[0].threshold.amount = 40960; })))).toThrow(
      /threshold\.amount.*decimal-string/,
    );
    expect(() => assertToWorker(boot(mutateWire((w) => { w.entries[0].card.when[0].threshold.unit = "furlongs"; })))).toThrow(
      /threshold\.unit/,
    );
    expect(() => assertToWorker(boot(mutateWire((w) => { w.entries[0].card.then[0].id = "launch-missiles"; })))).toThrow(
      /\.then\[0\]\.id/,
    );
    expect(() => assertToWorker(boot(mutateWire((w) => { w.entries[0].card.then[0].value = 131072; })))).toThrow(
      /then\[0\]\.value/,
    );
    expect(() => assertToWorker(boot(mutateWire((w) => { w.entries[0].card.when = []; })))).toThrow(/1\.\.3 predicates/);
    expect(() => assertToWorker(boot(mutateWire((w) => {
      const a = w.entries[0].card.then[0];
      w.entries[0].card.then = [a, a, a, a];
    })))).toThrow(/1\.\.3 actions/);
    expect(() => assertToWorker(boot(mutateWire((w) => { w.entries[0].card.scope.kind = "vibe"; })))).toThrow(/scope\.kind/);
    expect(() => assertToWorker(boot(mutateWire((w) => { delete w.entries[0].card.upkeepMicroUsd; })))).toThrow(
      /upkeepMicroUsd/,
    );
    // Envelope tolerance: unknown INNER keys are ignored, both levels.
    const tolerant = mutateWire((w) => {
      w.entries[0].card._experimental = "ignored by the codec (envelope precedent)";
      w._future = true;
    });
    const parsed = assertToWorker(boot(tolerant));
    if (parsed.kind !== "boot") throw new Error("expected boot");
    expect(parsed.rules!.entries[0]!.card).toEqual(LIVE_DECK[0]);
  });

  it("shape garbage escapes as an envelope reject, NOT a boot (corpus/build precedent)", () => {
    const h = harness();
    h.fake.postMessage({
      kind: "boot", protocol: 1, seed: "s", speedX: 1, runnerKind: "sim-core",
      rules: { entries: [{ hash: "h", card: "not-a-card" }] },
    });
    expect(() => h.fake.pump(0)).toThrow(ProtocolError);
    expect(h.fake.lastRunner).toBeNull();
    expect(h.received.length).toBe(0);
  });
});

/* ───────────────────────── book builder ───────────────────────── */

describe("workerRulesLookup — the book the door gets", () => {
  it("hit resolves the deck card deep-equal AND same instance every call; miss is null", () => {
    const parsed = assertToWorker({
      kind: "boot", protocol: 1, seed: "g7", speedX: 1, runnerKind: "sim-core", rules: encodeBootRules(G7_BOOT),
    });
    if (parsed.kind !== "boot" || parsed.rules === undefined) throw new Error("expected booted rules");
    const { lookupPolicyCard } = workerRulesLookup(parsed.rules);
    for (const card of G7_CARDS) {
      // Deep-equal the deck document (the boundary parse built a fresh frozen
      // record); instance-stable across calls (the Map is built once).
      expect(lookupPolicyCard(g7CardHash(card.id))).toEqual(card);
      expect(lookupPolicyCard(g7CardHash(card.id))).toBe(lookupPolicyCard(g7CardHash(card.id)));
    }
    expect(lookupPolicyCard("deadbeefdeadbeef")).toBeNull();
    expect(lookupPolicyCard("")).toBeNull();
  });

  it("an empty book is a legal armed-but-silent lookup", () => {
    const { lookupPolicyCard } = workerRulesLookup({ entries: [] });
    expect(lookupPolicyCard("anything")).toBeNull();
  });
});

/* ─────────────────────────── drift pins ─────────────────────────── */

describe("drift pins (engine grammar unions + host forwards)", () => {
  const typesSource = readFileSync(
    join(process.cwd(), "..", "..", "packages", "sim-core", "src", "types.ts"),
    "utf8",
  );
  const quoted = (body: string): string[] => [...body.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
  const unionOf = (name: string): string[] => {
    const match = typesSource.match(new RegExp(`export type ${name} =([\\s\\S]*?);\\n`));
    if (match === null) throw new Error(`types.ts: union "${name}" not found — the drift pin needs re-anchoring`);
    return quoted(match[1]!);
  };

  it("the six wire vocabularies still match the sim-core grammar unions", () => {
    expect([...POLICY_COMPARATOR_WIRE_IDS].sort()).toEqual(unionOf("Comparator").sort());
    expect([...METRIC_UNIT_WIRE_IDS].sort()).toEqual(unionOf("MetricUnit").sort());
    expect([...POLICY_ACTION_ID_WIRE_IDS].sort()).toEqual(unionOf("PolicyActionId").sort());
    expect([...POLICY_BAND_WIRE_IDS].sort()).toEqual(unionOf("DelegationBand").sort());
    expect([...POLICY_ESCALATION_TARGET_WIRE_IDS].sort()).toEqual(unionOf("PolicyEscalation").sort());
    const scopeKind = typesSource.match(/export interface ScopeSelector \{[\s\S]*?kind: ([^;]+);/);
    if (scopeKind === null) throw new Error("types.ts: ScopeSelector.kind not found");
    expect([...POLICY_SCOPE_KIND_WIRE_IDS].sort()).toEqual(quoted(scopeKind[1]!).sort());
  });

  it("both worker hosts forward message.rules into the ONE createRunner seam", () => {
    for (const rel of [join("src", "worker", "sim.worker.ts"), join("src", "bridge", "fakeWorker.ts")]) {
      const source = readFileSync(join(process.cwd(), rel), "utf8");
      const forwards = source.match(/workerRulesLookup\(message\.rules\)/g) ?? [];
      expect(forwards.length, `${rel} must arm from message.rules exactly once`).toBe(1);
    }
    const factory = readFileSync(join(process.cwd(), "src", "runner", "index.ts"), "utf8");
    expect(factory).toContain('createRunner: rules rider requires runnerKind "sim-core"');
  });
});

/* ─────────────── legacy byte-identity (absent + silent law) ─────────────── */

describe("legacy boot byte-identity (additive-only protocol law)", () => {
  function bootDigests(rules: BootRules | undefined): string[] {
    const h = harness();
    h.client.boot("legacy", 1, "sim-core", undefined, undefined, rules);
    h.fake.pump(100, 10);
    expect(h.received.length).toBe(100);
    return h.received.map((f) => canonicalDigest(encodeProjection(f)));
  }

  it("no rider / empty book / booted-uncommitted g7 book replay the frozen legacy hexes", () => {
    const bare = bootDigests(undefined);
    expect(bare[0]).toBe("ca8863849cb3db32");
    expect(bare[99]).toBe("780b1cbc61dff760");
    expect(bootDigests({ entries: [] })).toEqual(bare);
    // A boot carrying the WHOLE g7 deck but committing nothing is the wire
    // form of the wave-25 OFF-PATH proof: the Book is armed, silent, invisible.
    expect(bootDigests(G7_BOOT)).toEqual(bare);
  });
});

/* ──────── full loop, brief letter: the GENUINE g7 deck crosses ──────── */

describe("worker-loop rules boot — g7Deck boots, books, and stays honest about scope", () => {
  it("commit through the door lands the REAL g7 card (receipt + book + hash fold)", () => {
    const h = harness();
    h.client.boot("g7-book", 1, "sim-core", undefined, undefined, G7_BOOT);
    commit(h.client, g7CardHash("watch-the-door" as RuleId));
    h.fake.pump(4, 10);
    expect(noticeDetails(h.received)).toContain("policy-card-commit: rule=watch-the-door");
    const game = h.runner().lastTickFacts().game;
    expect(game.ruleBook.map((c) => String(c.id))).toEqual(["watch-the-door"]);
    expect(game.ruleBookHash.length).toBeGreaterThan(0);
  });

  it("re-committing refuses card-id-collision; an unknown hash refuses loud", () => {
    const h = harness();
    h.client.boot("g7-dupe", 1, "sim-core", undefined, undefined, G7_BOOT);
    commit(h.client, g7CardHash("page-the-founder" as RuleId));
    commit(h.client, g7CardHash("page-the-founder" as RuleId));
    commit(h.client, "ffffffffffffffff");
    h.fake.pump(4, 10);
    const details = noticeDetails(h.received);
    expect(details).toContain('policy-card-commit: card-id-collision: "page-the-founder" already committed');
    expect(details.some((d) => d.includes('unknown-card-hash: "ffffffffffffffff"'))).toBe(true);
  });

  it("HONEST SCOPE WITNESS: g7 refs (node/edge) never fire on the MAINLINE board", () => {
    const h = harness();
    h.client.boot("g7-scope", 1, "sim-core", undefined, undefined, G7_BOOT);
    commit(h.client, g7CardHash("watch-the-door" as RuleId));
    h.fake.pump(100, 10);
    // The cards' scope refs address the gate micro-board ("node/edge"); the
    // mainline publishes "edge::utilizationRho". The wire carried these exact
    // documents faithfully (codec round-trip above) — silence here is
    // CONTENT, not a broken arm. Falsifiable: if a future runner ever
    // publishes node/edge cells, this reddens and the comment retires.
    expect(firedDetails(h.received)).toEqual([]);
    expect(h.runner().lastTickFacts().game.ruleBook.length).toBe(1);
  });

  it("mock + rules is a wiring bug: faulted, no ready frame, no crash", () => {
    const h = harness();
    h.client.boot("wrong-kind", 1, "mock", undefined, undefined, G7_BOOT);
    expect(() => h.fake.pump(0)).not.toThrow();
    expect(h.readyInfo()).toBeNull();
    expect(h.received.length).toBe(0);
    expect(h.faults.some((f) => f.includes('rules rider requires runnerKind "sim-core"'))).toBe(true);
  });
});

/* ──── full loop, brief intent: a MAINLINE-scoped book EXECUTES ──── */

describe("worker-loop rules boot — the booted Book plays itself (frame-visible)", () => {
  /** Probe-pinned seed-1 law (fakeWorker's fixed seed): both commits ride
   *  the first door pass, the quarter-load wall crosses inside the first
   *  six frames (f6 staggered-commits witness), and the mapped carriers
   *  execute through the SAME two-hand rail the player pays. */
  function stormRun(rules: BootRules): { digests: string[]; fired: string[]; details: string[] } {
    const h = harness();
    h.client.boot("storm", 1, "sim-core", undefined, undefined, rules);
    const deck = rules === CONTROL_BOOT ? CONTROL_DECK : LIVE_DECK;
    for (const id of ["watch-the-door", "page-the-founder"] as const) commit(h.client, hashOf(deck, id));
    h.fake.pump(24, 10);
    return {
      digests: h.received.map((f) => canonicalDigest(encodeProjection(f))),
      fired: firedDetails(h.received),
      details: noticeDetails(h.received),
    };
  }

  it("rule-fired notices and mapped-carrier executions reach the projection", () => {
    const run = stormRun(LIVE_BOOT);
    expect(run.details).toContain("policy-card-commit: rule=watch-the-door");
    expect(run.fired).toContain("watch-the-door");
    expect(run.fired).toContain("page-the-founder");
    expect(run.details).toContain("raise-inspection-depth→configure-node: depth=inspect");
    expect(run.details.some((d) => d.startsWith("page→communicate"))).toBe(true);
  });

  it("two wire-booted runners are per-frame byte-identical (determinism twin)", () => {
    const a = stormRun(LIVE_BOOT).digests;
    const b = stormRun(LIVE_BOOT).digests;
    expect(a.length).toBe(24);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(a.length); // no frozen frames masking drift
  });

  it("the dormant control books byte-equal receipts and NEVER fires (causality twin)", () => {
    const live = stormRun(LIVE_BOOT);
    const control = stormRun(CONTROL_BOOT);
    expect(control.fired).toEqual([]);
    // The commit phase is indistinguishable (same ids → same receipts)…
    expect(control.details.filter((d) => d.startsWith("policy-card-commit"))).toEqual(
      live.details.filter((d) => d.startsWith("policy-card-commit")),
    );
    // …the ONLY divergence is the rule phase, it MUST show, and the prefix
    // before the first firing is shared (the rule arm casts no shadow early).
    const firstDivergence = control.digests.findIndex((d, i) => d !== live.digests[i]);
    expect(firstDivergence).toBeGreaterThanOrEqual(0);
    expect(firstDivergence).toBeLessThan(24);
    expect(control.digests.slice(0, firstDivergence)).toEqual(live.digests.slice(0, firstDivergence));
  });

  it("the fake-host boot equals a direct SimCoreRunner armed through the wire codec", () => {
    const h = harness();
    h.client.boot("twin", 1, "sim-core", undefined, undefined, LIVE_BOOT);
    commit(h.client, hashOf(LIVE_DECK, "watch-the-door"));
    h.fake.pump(10, 10);
    const direct = new SimCoreRunner({ seed: 1, rules: lookupThroughWire(LIVE_BOOT) });
    submitCommit(direct, 1, hashOf(LIVE_DECK, "watch-the-door"));
    for (let i = 0; i < 10; i += 1) {
      expect(canonicalDigest(encodeProjection(h.received[i]!))).toBe(
        canonicalDigest(encodeProjection(direct.headlessStep(10))),
      );
    }
    direct.stop();
  });
});
