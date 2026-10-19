/**
 * L-G7D — the WIRE WITNESS for the G7 content-deck program: the shipped
 * deck JSON on disk plays ITSELF end-to-end through the real boundary.
 *
 *   decks/*.json → parsePolicyDeck → bootRulesFromDeck → SimClient.boot(rules)
 *   → encodeBootRules over the wire → assertToWorker parse → workerRulesLookup
 *   revival → mainline runner ARMS THE BOOK → rule fires EXECUTED.
 *
 * Everything before this lane proved the machinery on TS-authored constants
 * (wave-25 @9748ee4 runner option, wave-26 @9653a96 boot.rules rider,
 * a757f6c envelope symmetry). This file closes the loop with the THREE
 * SHIPPED CONTENT DECKS (9948681) as the only source of cards — the raw
 * JSON is parsed at first use through the loader boundary (parse-don't-
 * validate, Law 2) and the boot books it yields are what every witness runs.
 *
 * Witnesses (all frame numbers probe-derived at THIS lane, never guessed):
 *  · PARSE+HASH WALK: 14 cards across three decks, authoring order intact,
 *    every entry.hash === deckCardHash(card) (self-consistency), dup-hash
 *    refusals last-word at BOTH the loader builder (hand-built deck) and the
 *    wire parse (forged duplicated entry).
 *  · THE HEADLINE: watch-the-door booted through SimClient/fakeWorker (the
 *    fake's fixed seed 1) crosses the quarter-load wall at frame 6; the
 *    mapped carriers re-feed and EXECUTE at frame 7 (configure-node +
 *    communicate, shed-class loses the two-hand race) — the @9653a96 firing
 *    shape achieved FROM DISK JSON. At frame 21 the origin crosses with the
 *    edge again: the escape-hatch wall card fires and its failover meets the
 *    unsupported-carrier refusal at frame 22; the-underwriter INFORMS and
 *    mints nothing.
 *  · CAUSALITY: booting the book is invisible (100 no-commit wire frames
 *    replay the frozen legacy hexes ca8863849cb3db32 / 780b1cbc61dff760; the
 *    direct seed-42 armed-uncommitted arm digests byte-equal to a plain
 *    runner and holds money 25_005_307_300n / 25_109_732_500n byte-stand);
 *    the plain runner fires nothing while the armed storm does, the shared
 *    prefix ends at the first landing commit, and two fresh wire-booted runs
 *    are per-frame byte-identical.
 *  · HONESTY WALKS: cold-aisle is five advisory cards that talk and never
 *    move the board — zero door receipts in 40 frames — and its
 *    queue-etiquette lane card HONESTLY NEVER FIRES (the deck's _todo
 *    declared that crossing INFERRED-not-witnessed; this pin says so
 *    falsifiably while four siblings do fire). sleepless:second-wind and
 *    panic-failover cross at the origin wall (inform silent, failover
 *    refused); cold-thought-count is the same declared-absent witness.
 *    No card ever EXECUTES a failover or a scale-out — the bought-verb wall
 *    is CONTENT, honored.
 *  · WIRE SYMMETRY over the FULL 14-card content surface: encode → parse
 *    keeps the WIRE form (decimal strings), workerRulesLookup revives the
 *    branded bigints, every revived card deep-equals its trusted loader
 *    twin (a757f6c's boundary law, now exercised with shipped content).
 *    Wave-30 content retune: the upkeep literals these walks speak moved 0 →
 *    the small PROVISIONAL ladder (5k/10k/25k/40k per band, wall-card above)
 *    — the ladder map below is the test-side authority; dormant/no-commit and
 *    money witnesses are UNTOUCHED by design (no commit ⇒ no ruleBook ⇒ no
 *    upkeep anywhere in the digest).
 *
 * Hash literals are pinned only STRUCTURALLY (16-hex, set-unique,
 * self-consistent): the deckCardHash LAW values belong to the loader's own
 * suites — no permanent digest re-pin is minted here. The fakeWorker arm
 * runs the fake's fixed seed 1 (fakeWorker.ts law); the direct arms run
 * seed 42, the @9653a96 rules-test seed whose crossings this file restates
 * with DISK-sourced cards.
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "@hh/sim-core/replay";
import {
  bootRulesFromDeck,
  deckCardHash,
  parsePolicyDeck,
  type LoadedBootRules,
  type LoadedPolicyDeck,
} from "@hh/sim-core/loader";
import { asEntityId, type PlayerIntent, type PlayerVerbArgs } from "@hh/sim-core/types";
import {
  assertToWorker,
  encodeBootRules,
  encodeProjection,
  workerRulesLookup,
  type SimProjection,
} from "../shared/protocol";
import { SimCoreRunner } from "../runner/simCoreRunner";
import { FakeWorkerLike } from "../bridge/fakeWorker";
import { SimClient } from "../bridge/simClient";
import watchTheDoorRaw from "../../../../packages/content/decks/watch-the-door.json?raw";
import coldAisleRaw from "../../../../packages/content/decks/cold-aisle.json?raw";
import sleeplessRaw from "../../../../packages/content/decks/sleepless.json?raw";

const EDGE = asEntityId("edge");

/* ═══════════════ the SHIPPED decks, parsed at the loader boundary ═══════════════ */

function loadDeckBook(raw: string): LoadedBootRules {
  return bootRulesFromDeck(parsePolicyDeck(JSON.parse(raw)));
}

const WATCH = loadDeckBook(watchTheDoorRaw);
const COLD = loadDeckBook(coldAisleRaw);
const SLEEPLESS = loadDeckBook(sleeplessRaw);

/** Authoring order is the firing order at every crossing (law witnessed in
 *  the waves before this one) — the ids carry the deck-slug namespace. */
const WATCH_IDS = [
  "watch-the-door:watch-the-door",
  "watch-the-door:page-the-founder",
  "watch-the-door:shed-the-small",
  "watch-the-door:escape-hatch",
  "watch-the-door:the-underwriter",
  "watch-the-door:ask-the-senior",
] as const;
const COLD_IDS = [
  "cold-aisle:murmur-the-bell",
  "cold-aisle:ask-the-senior-again",
  "cold-aisle:quarter-watch",
  "cold-aisle:queue-etiquette",
  "cold-aisle:health-ribbon",
] as const;
const SLEEPLESS_IDS = [
  "sleepless:cold-thought-count",
  "sleepless:second-wind",
  "sleepless:panic-failover",
] as const;

const hashFor = (book: LoadedBootRules, id: string): string => {
  const found = book.entries.find((entry) => String(entry.card.id) === id);
  if (found === undefined) throw new Error(`shipped deck has no card "${id}"`);
  return found.hash;
};

/* The wave-30 content retune: the shipped decks carry the small PROVISIONAL
 * ladder (inform 5,000 / consult 10,000 / execute 25,000 µ$ per sim-minute,
 * and the execute WALL card — failover, the bought-verb refusal — 40,000).
 * This map is the TEST-SIDE authority: a JSON drift off the ladder reddens
 * every upkeep witness below (loader-side shipDecks.test.ts pins the law and
 * the 14 hash goldens; here we exercise the wire with the real values). */
const UPKEEP_BY_ID: Readonly<Record<string, bigint>> = Object.freeze({
  "watch-the-door:watch-the-door": 25_000n,
  "watch-the-door:page-the-founder": 25_000n,
  "watch-the-door:shed-the-small": 25_000n,
  "watch-the-door:escape-hatch": 40_000n,
  "watch-the-door:the-underwriter": 5_000n,
  "watch-the-door:ask-the-senior": 10_000n,
  "cold-aisle:murmur-the-bell": 5_000n,
  "cold-aisle:ask-the-senior-again": 10_000n,
  "cold-aisle:quarter-watch": 5_000n,
  "cold-aisle:queue-etiquette": 5_000n,
  "cold-aisle:health-ribbon": 10_000n,
  "sleepless:cold-thought-count": 5_000n,
  "sleepless:second-wind": 5_000n,
  "sleepless:panic-failover": 40_000n,
});

/** THE one wire path every direct arm boots through: the trusted book goes
 *  out as BootRulesWire (encodeBootRules), comes back through the envelope
 *  parse (shape walls only) and revives at workerRulesLookup — exactly the
 *  builder the worker hosts call (E2b anti-drift law). */
function wireLookup(book: LoadedBootRules): ReturnType<typeof workerRulesLookup> {
  const parsed = assertToWorker({
    kind: "boot", protocol: 1, seed: "deck-boot", speedX: 1, runnerKind: "sim-core",
    rules: encodeBootRules(book),
  });
  if (parsed.kind !== "boot" || parsed.rules === undefined) throw new Error("expected booted rules");
  return workerRulesLookup(parsed.rules);
}

/* ═══════════════════════════════ harness helpers ═══════════════════════════════ */

function commitIntent(seq: number, cardHash: string): PlayerIntent {
  return {
    seq,
    clock: "sim",
    atUs: 0n,
    origin: "player",
    payload: { kind: "player-verb", args: { verb: "policy-card-commit", cardHash } as unknown as PlayerVerbArgs },
  };
}

const firedIds = (frame: SimProjection): string[] =>
  frame.notices.filter((n) => n.kind === "rule-fired").map((n) => n.detail ?? "");
const doorDetails = (frame: SimProjection): string[] =>
  frame.notices
    .filter((n) => n.kind === "intent-executed" || n.kind === "intent-refused")
    .map((n) => n.detail ?? n.kind)
    .filter((d) => !d.startsWith("policy-card-commit")); // commit-rail receipts are not rule motion

const frameDigests = (frames: readonly SimProjection[]): string[] =>
  frames.map((f) => canonicalDigest(encodeProjection(f)));

interface DeckRun {
  readonly frames: readonly SimProjection[];
  readonly edgeDepth: string;
  readonly bookSize: number;
}

/** Commit the book two hands per door pass (§7.5 rail — the SAME budget the
 *  player pays): six cards land by f2, five by f2, three by f1. */
function directRun(book: LoadedBootRules, seed: number, ticks: number, commit: boolean): DeckRun {
  const runner = new SimCoreRunner({ seed, rules: wireLookup(book) });
  const frames: SimProjection[] = [];
  for (let i = 0; i < ticks; i += 1) {
    if (commit) {
      const start = i * 2;
      for (let j = 0; j < 2 && start + j < book.entries.length; j += 1) {
        runner.submit(commitIntent(start + j + 1, book.entries[start + j]!.hash));
      }
    }
    frames.push(runner.headlessStep(10));
  }
  const game = runner.lastTickFacts().game;
  runner.stop();
  return Object.freeze({
    frames: Object.freeze(frames),
    edgeDepth: String(game.nodes.get(EDGE)?.inspectionDepth),
    bookSize: game.ruleBook.length,
  });
}

interface WireLoopRun {
  readonly received: readonly SimProjection[];
  readonly ruleBookSize: () => number;
  readonly edgeDepth: () => string;
}

/** The fakeWorker full loop: SimClient.boot POSTS the boot envelope (its
 *  encodeBootRules runs for real), the fake's handleInbound parses it with
 *  assertToWorker and arms with workerRulesLookup VERBATIM as the browser
 *  worker does, and frames pump back as decoded projections. Seed is the
 *  fake's fixed 1 (fakeWorker.ts law — pump()-driven determinism). */
function wireLoop(book: LoadedBootRules, framesToRun: number, commit: boolean): WireLoopRun {
  const fake = new FakeWorkerLike();
  const received: SimProjection[] = [];
  const client = new SimClient(fake, { onProjection: (p) => received.push(p) });
  client.boot("deck-loop", 1, "sim-core", undefined, undefined, book);
  for (let i = 0; i < framesToRun; i += 1) {
    if (commit) {
      const start = i * 2;
      for (let j = 0; j < 2 && start + j < book.entries.length; j += 1) {
        client.sendPlayerVerb({ verb: "policy-card-commit", cardHash: book.entries[start + j]!.hash });
      }
    }
    fake.pump(1, 10);
  }
  const game = () => (fake.lastRunner as SimCoreRunner).lastTickFacts().game;
  return {
    received: Object.freeze(received),
    ruleBookSize: () => game().ruleBook.length,
    edgeDepth: () => String(game().nodes.get(EDGE)?.inspectionDepth),
  };
}

/** Run-once memo: the heavy arms are shared falsifiably across their its. */
function once<T>(make: () => T): () => T {
  let value: T | undefined;
  let done = false;
  return () => {
    if (!done) {
      value = make();
      done = true;
    }
    return value as T;
  };
}

/* ═══════════════ 1. parse + hash walk over the shipped surface ═══════════════ */

describe("shipped decks at the loader boundary (JSON → trusted boot book)", () => {
  it("all 14 shipped cards parse, authoring order and band census intact", () => {
    expect(WATCH.entries.map((e) => String(e.card.id))).toEqual([...WATCH_IDS]);
    expect(COLD.entries.map((e) => String(e.card.id))).toEqual([...COLD_IDS]);
    expect(SLEEPLESS.entries.map((e) => String(e.card.id))).toEqual([...SLEEPLESS_IDS]);
    expect(WATCH.entries.map((e) => e.card.band)).toEqual([
      "execute", "execute", "execute", "execute", "inform", "consult",
    ]);
    expect(COLD.entries.map((e) => e.card.band)).toEqual(["inform", "consult", "inform", "inform", "consult"]);
    expect(SLEEPLESS.entries.map((e) => e.card.band)).toEqual(["inform", "inform", "execute"]);
    const decks = [WATCH, COLD, SLEEPLESS];
    expect(decks.reduce((n, b) => n + b.entries.length, 0)).toBe(14);
    // Trusted bigints survived the decimal-string law: thresholds revived.
    const first = WATCH.entries[0]!.card.when[0]!.threshold;
    if (first.kind !== "value") throw new Error("expected a value threshold");
    expect(first.amount).toBe(16_384n);
    for (const deck of decks)
      for (const entry of deck.entries) expect(entry.card.upkeepMicroUsd).toBe(UPKEEP_BY_ID[String(entry.card.id)]);
  });

  it("every book entry is keyed by deckCardHash(card) — 16-hex, set-unique across all 14", () => {
    const all = [...WATCH.entries, ...COLD.entries, ...SLEEPLESS.entries];
    for (const entry of all) {
      expect(entry.hash).toMatch(/^[0-9a-f]{16}$/);
      expect(entry.hash).toBe(deckCardHash(entry.card)); // self-consistency (no literal re-pin here)
    }
    expect(new Set(all.map((e) => e.hash)).size).toBe(14);
  });

  it("bootRulesFromDeck refuses a hand-built duplicate hash naming both positions", () => {
    // LoadedPolicyDeck is a PUBLIC interface a host could hand-build past
    // the parse — the guard's stated reason. The same card twice collides by
    // construction (fnv1a64 is a fingerprint, not a promise of distinctness).
    const card = WATCH.entries[0]!.card;
    const forged: LoadedPolicyDeck = Object.freeze({
      schemaVersion: 1, deckId: null, appliesTo: null, note: null, cards: Object.freeze([card, card]), todo: null,
    });
    expect(() => bootRulesFromDeck(forged)).toThrow(/collision between cards\[0\][\s\S]*cards\[1\]/);
  });

  it("the wire parse refuses a duplicated hash too — /duplicates entries[0]/ last word", () => {
    const wire = encodeBootRules({
      entries: [
        { hash: "dup", card: WATCH.entries[0]!.card },
        { hash: "dup", card: WATCH.entries[1]!.card },
      ],
    });
    expect(() =>
      assertToWorker({ kind: "boot", protocol: 1, seed: "dup", speedX: 1, runnerKind: "sim-core", rules: wire }),
    ).toThrow(/duplicates entries\[0\]/);
  });
});

/* ═══════════ 2. wire symmetry: revival deep-equals the trusted content ═══════════ */

describe("the deck book crosses the wire whole (a757f6c symmetry, shipped content)", () => {
  it("encode keeps WIRE decimal strings; parse keeps them; revival makes bigints — deep-equal for all 14", () => {
    for (const book of [WATCH, COLD, SLEEPLESS]) {
      const wire = encodeBootRules(book);
      const parsed = assertToWorker({
        kind: "boot", protocol: 1, seed: "sym", speedX: 1, runnerKind: "sim-core", rules: wire,
      });
      if (parsed.kind !== "boot" || parsed.rules === undefined) throw new Error("expected booted rules");
      // Envelope-type symmetry: the parsed arm is the WIRE record, unchanged.
      expect(parsed.rules.entries.length).toBe(book.entries.length);
      for (let i = 0; i < book.entries.length; i += 1) {
        expect(parsed.rules.entries[i]!.card).toEqual(wire.entries[i]!.card);
        expect(parsed.rules.entries[i]!.card.upkeepMicroUsd).toBe(String(UPKEEP_BY_ID[String(book.entries[i]!.card.id)])); // decimal-string boundary, retuned values
      }
      const { lookupPolicyCard } = workerRulesLookup(parsed.rules);
      for (const entry of book.entries) {
        const revived = lookupPolicyCard(entry.hash);
        expect(revived).toEqual(entry.card); // the trusted loader card, whole
        if (revived === null) throw new Error("expected the revived card");
        expect(revived.upkeepMicroUsd).toBe(UPKEEP_BY_ID[String(entry.card.id)]); // branded bigint at the boundary
        const threshold = revived.when[0]!.threshold;
        if (threshold.kind !== "value") throw new Error("expected a value threshold");
        expect(typeof threshold.amount).toBe("bigint");
      }
    }
  });

  it("the revived lookup is instance-stable per hash and answers null to the void", () => {
    const { lookupPolicyCard } = wireLookup(WATCH);
    for (const id of WATCH_IDS) {
      const card = lookupPolicyCard(hashFor(WATCH, id));
      expect(card).toBe(lookupPolicyCard(hashFor(WATCH, id))); // one Map, built once
      expect(card).not.toBeNull();
    }
    expect(lookupPolicyCard("deadbeefdeadbeef")).toBeNull();
    expect(lookupPolicyCard("")).toBeNull();
  });
});

/* ══════════ 3. HEADLINE: watch-the-door over the real fakeWorker wire ══════════ */

describe("watch-the-door boots over the wire and plays itself (fakeWorker, fixed seed 1)", () => {
  const storm = once(() => wireLoop(WATCH, 30, true));

  it("the shipped book crosses the quarter-load wall at f6; f7 EXECUTES the mapped pair and the third carrier loses the race", () => {
    const run = storm();
    expect(doorDetails(run.received[6]!)).toEqual([]); // one-tick reaction lag stays law
    expect(firedIds(run.received[6]!)).toEqual([
      "watch-the-door:watch-the-door",
      "watch-the-door:page-the-founder",
      "watch-the-door:shed-the-small",
      "watch-the-door:ask-the-senior", // the CONSULT card fires too — pending, silent (band semantics)
    ]);
    expect(doorDetails(run.received[7]!)).toEqual([
      "raise-inspection-depth→configure-node: depth=inspect",
      'page→communicate: node=edge:"the Book opened a ticket"',
      'shed-class→shed-load: hands-exhausted: need 1, free 0 of 2 — rule carrier "shed-class" pays the same hands as the player',
    ]);
    expect(run.edgeDepth()).toBe("inspect");
    expect(run.ruleBookSize()).toBe(6); // every hash resolved through the WIRE-REVIVED lookup
  });

  it("the origin crossing brings the wall card: escape-hatch FIRES, failover is REFUSED at the ordinary door; the underwriter INFORMS, mints nothing", () => {
    const run = storm();
    expect(firedIds(run.received[21]!)).toEqual([...WATCH_IDS]); // both boards cross together at f21
    expect(doorDetails(run.received[22]!)).toContain(
      'verb:failover: unsupported-verb-carrier: the door executes only kind="player-verb" intents',
    );
    // The bought-verb wall is CONTENT — nothing ever EXECUTED a failover/scale-out through the door:
    const all = run.received.flatMap(doorDetails);
    expect(all.some((d) => d.startsWith("failover→") || d.startsWith("scale-out→") || d.startsWith("open-ticket→"))).toBe(false);
    expect(all.some((d) => d.startsWith("raise-inspection-depth→configure-node"))).toBe(true);
  });

  it("booting the deck alone is INVISIBLE: 100 no-commit wire frames replay the frozen legacy hexes", () => {
    const bare = wireLoop(WATCH, 100, false);
    expect(bare.received.length).toBe(100);
    const digests = frameDigests(bare.received);
    expect(digests[0]).toBe("ca8863849cb3db32");
    expect(digests[99]).toBe("780b1cbc61dff760");
  });

  it("determinism twin: two fresh wire-booted deck runs are per-frame byte-identical (no frozen frames)", () => {
    const a = frameDigests(wireLoop(WATCH, 30, true).received);
    const b = frameDigests(wireLoop(WATCH, 30, true).received);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(30);
  });
});

/* ═══════ 4. causality + goldens on the direct seed-42 arm (rules-test seed) ═══════ */

describe("the @9653a96 firing shape achieved FROM DISK JSON (direct seed 42, wire-revived lookup)", () => {
  const armed = once(() => directRun(WATCH, 42, 40, true));
  const dormant = once(() => directRun(WATCH, 42, 40, false));
  const plain = once((): readonly SimProjection[] => {
    const runner = new SimCoreRunner({ seed: 42 });
    const frames: SimProjection[] = [];
    for (let i = 0; i < 40; i += 1) frames.push(runner.headlessStep(10));
    runner.stop();
    return frames;
  });

  it("edge f7 fires the four-card crossing; f8 executes the mapped pair and the third carrier loses the two-hand race", () => {
    const run = armed();
    expect(firedIds(run.frames[7]!)).toEqual([
      "watch-the-door:watch-the-door",
      "watch-the-door:page-the-founder",
      "watch-the-door:shed-the-small",
      "watch-the-door:ask-the-senior",
    ]);
    expect(doorDetails(run.frames[8]!)).toEqual([
      "raise-inspection-depth→configure-node: depth=inspect",
      'page→communicate: node=edge:"the Book opened a ticket"',
      'shed-class→shed-load: hands-exhausted: need 1, free 0 of 2 — rule carrier "shed-class" pays the same hands as the player',
    ]);
    expect(run.edgeDepth).toBe("inspect");
    expect(run.bookSize).toBe(6);
  });

  it("origin f11 fires the wall pair; f12 refuses failover; inform mints zero; the rule-fired wire shape is exact", () => {
    const run = armed();
    expect(firedIds(run.frames[11]!)).toEqual(["watch-the-door:escape-hatch", "watch-the-door:the-underwriter"]);
    expect(doorDetails(run.frames[12]!)).toEqual([
      'verb:failover: unsupported-verb-carrier: the door executes only kind="player-verb" intents',
    ]);
    const all = run.frames.flatMap(doorDetails);
    expect(all.some((d) => d.startsWith("scale-out→") || d.startsWith("open-ticket→"))).toBe(false);
    for (const frame of run.frames) {
      for (const notice of frame.notices.filter((n) => n.kind === "rule-fired")) {
        expect(notice.laneId).toBeNull();
        expect(WATCH_IDS as readonly string[]).toContain(notice.detail);
      }
    }
  });

  it("causality: the wire-armed UNCOMMITTED arm digests byte-equal to plain and fires nothing; the storm diverges at the first landing commit, not before", () => {
    const armedRun = armed();
    const dormantRun = dormant();
    expect(dormantRun.frames.flatMap(firedIds)).toEqual([]);
    expect(plain().flatMap(firedIds)).toEqual([]);
    expect(frameDigests(dormantRun.frames)).toEqual(frameDigests(plain())); // the wire-armed book is state-inert until a commit lands
    expect(armedRun.frames.flatMap(firedIds).length).toBeGreaterThan(0);
    const armedD = frameDigests(armedRun.frames);
    const dormantD = frameDigests(dormantRun.frames);
    let first = 0;
    while (first < armedD.length && armedD[first] === dormantD[first]) first += 1;
    // Commits ride the door pass of the VERY frame they precede, so the
    // armed storm diverges at f0 (first landing commit) — while the rule
    // phase's own first mark stays the f7 crossing (f6 is edge-fire, never
    // earlier). No frame of the dormant twin ever carries a firing:
    expect(first).toBe(0);
    expect(armedRun.frames.slice(0, 7).flatMap(firedIds)).toEqual([]); // rule phase silent until the wall
    expect(firedIds(armedRun.frames[6]!)).toEqual([]);
    expect(firedIds(dormantRun.frames[7]!)).toEqual([]);
  });

  it("money goldens byte-stand with the deck book armed through the wire (seed 42: 25_005_307_300n / 25_109_732_500n)", () => {
    const held = directRun(WATCH, 42, 100, false);
    expect(held.frames[0]!.freeCashMicroUsd).toBe(25_005_307_300n);
    expect(held.frames[99]!.freeCashMicroUsd).toBe(25_109_732_500n);
  });

  it("seed divergence control: the deck world is seed-sensitive, not constant", () => {
    expect(frameDigests(directRun(WATCH, 43, 40, true).frames)[39]).not.toBe(frameDigests(armed().frames)[39]);
  });
});

/* ═════════════════ 5. honesty walks: advisory bands + declared-absent ═════════════════ */

describe("cold-aisle — the all-advisory book talks and never moves the board (seed 42)", () => {
  const run = once(() => directRun(COLD, 42, 40, true));

  it("four of five cards fire on their witnessed crossings; ZERO door receipts ever (inform/consult mint nothing)", () => {
    const r = run();
    expect(firedIds(r.frames[7]!)).toEqual(["cold-aisle:murmur-the-bell", "cold-aisle:ask-the-senior-again"]);
    expect(firedIds(r.frames[8]!)).toEqual(["cold-aisle:health-ribbon"]); // the `<` crossing IS witnessed
    expect(firedIds(r.frames[11]!)).toEqual(["cold-aisle:quarter-watch"]); // origin 75% line
    expect(r.frames.flatMap(doorDetails)).toEqual([]); // the board never moved — bands, not protocol
    expect(r.edgeDepth).toBe("sample-1-in-20");
    expect(r.bookSize).toBe(5);
  });

  it("queue-etiquette HONESTLY NEVER FIRES: the lane rate line was declared INFERRED-not-witnessed by the deck and the engine agrees", () => {
    // Declared-absent, falsifiable: the deck's _todo names this crossing as
    // inferred from shipped pressure, not rule-side witnessed — 40 frames
    // say the lane/ingress-1::ratePerMin cell never crossed its 196608 line.
    // If a future board makes it cross, this pin reddens and the disclosure flips.
    const fired = run().frames.flatMap(firedIds);
    expect(fired).not.toContain("cold-aisle:queue-etiquette");
    expect(fired.length).toBeGreaterThan(0); // the arm IS live — four siblings fire
  });
});

describe("sleepless — the serverless night watch keeps the wall (seed 42)", () => {
  const run = once(() => directRun(SLEEPLESS, 42, 40, true));

  it("origin crosses at f11: second-wind INFORMS (silent), panic-failover FIRES and meets the unsupported-carrier refusal at f12", () => {
    const r = run();
    expect(firedIds(r.frames[11]!)).toEqual(["sleepless:second-wind", "sleepless:panic-failover"]);
    expect(doorDetails(r.frames[12]!)).toEqual([
      'verb:failover: unsupported-verb-carrier: the door executes only kind="player-verb" intents',
    ]);
    const all = r.frames.flatMap(doorDetails);
    expect(all.every((d) => d.startsWith("verb:failover:"))).toBe(true); // the ONLY door motion is the wall
    expect(all.some((d) => d.startsWith("scale-out→"))).toBe(false);
    expect(r.bookSize).toBe(3);
  });

  it("cold-thought-count honestly never fires (lane rate line INFERRED per the deck's own disclosure); zero player-verb carriers executed", () => {
    const r = run();
    expect(r.frames.flatMap(firedIds)).not.toContain("sleepless:cold-thought-count");
    // Every 'intent-executed' notice on the whole run is a commit receipt —
    // no rule carrier ever rode an executed player-verb through the door:
    const executedNonCommit = r.frames.flatMap((f) =>
      f.notices.filter(
        (n) => n.kind === "intent-executed" && !(n.detail ?? "").startsWith("policy-card-commit"),
      ),
    );
    expect(executedNonCommit).toEqual([]);
  });
});
