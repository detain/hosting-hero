/**
 * L-PA · panel PRODUCTION arming (owner ruling 2026-10-19: "(ii) Panel
 * production arming — yes, watch-the-door on the mainline stepper" — RATIFIED).
 *
 * The deck→wire→fire loop was PROVEN headless @`34bb32e` (deckBoot.rules.test.ts).
 * This file pins what that proof left for the owner's call: the REAL app's
 * boot path now carries the shipped book.
 *
 *  (a) the production module IS the shipped deck — roster derived from the
 *      on-disk JSON (structural, no law-literal duplication), hash-keyed,
 *      deep-frozen, armed by owner-ratified default;
 *  (b) the production boot MESSAGE rides the real wire — six entries,
 *      decimal-string upkeep, accepted by the real `assertToWorker` parser,
 *      revived by the ONE `workerRulesLookup` builder; dormant ⇒ the `rules`
 *      key is never posted at all (the pre-adoption wire, byte-for-byte);
 *  (c) end-to-end fakeWorker: booted via the production module the book
 *      LANDS (ruleBook 6 — every hash resolved through the wire-revived
 *      lookup) and FIRES: f6 crossing, f7 the mapped pair EXECUTES and the
 *      shed carrier loses the two-hand rail (the §7.5 hands law);
 *  (d) the dormant twins keep EVERY shipped golden byte-standing: the legacy
 *      100-frame pair ca8863849cb3db32 / 780b1cbc61dff760 and the money
 *      literals 25_005_307_300n / 25_109_732_500n (seed 42). Nothing moved;
 *      the armed-but-uncommitted module run proves the same invisibility;
 *  (e) the FIRST armed committed production 100-frame digest pair — NEW,
 *      self-derived at this lane (disclosed: these hexes never existed
 *      before the adoption; the legacy pair stays pinned on the dormant
 *      twin above, NOT re-presented here), plus its determinism twin.
 *      WAVE-30 RETUNE: re-derived from the engine and BYTE-STANDING — the
 *      projection wire carries no ruleBook content, so upkeep ladder motion
 *      is invisible at this altitude (disclosed zero-motion, see section (e)).
 *
 * Posture pins: mock + production book REFUSES the boot (the wiring-bug
 * fault channel, step-5 honesty walk); App.vue's single production `.boot(`
 * line is source-pinned on the flipped shape; `productionRules` never
 * enters the worker graph (sim.worker / fakeWorker / the runner barrel).
 *
 * Seed honesty: FakeWorkerLike pins its runner to the fixed seed 1
 * (fakeWorker.ts law — pump()-driven determinism, share codes are the real
 * worker's concern), so the fake-side witnesses speak seed 1; the money
 * witness is a DIRECT seed-42 run, mirroring the rules-test home.
 */
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import watchTheDoorRaw from "../../../../packages/content/decks/watch-the-door.json?raw";
import { deckCardHash } from "@hh/sim-core/loader";
import { canonicalDigest } from "@hh/sim-core/replay";
import {
  assertToWorker,
  encodeBootRules,
  encodeProjection,
  workerRulesLookup,
  type BootRulesWire,
  type SimProjection,
} from "../shared/protocol";
import { SimClient, type SimClientEvents, type WorkerLike } from "../bridge/simClient";
import { FakeWorkerLike } from "../bridge/fakeWorker";
import { SimCoreRunner } from "../runner/simCoreRunner";
import { asEntityId } from "@hh/sim-core/types";
import {
  PRODUCTION_DECK_BOOK,
  PRODUCTION_DECK_ID,
  PRODUCTION_DECK_SOURCE,
  productionBootRules,
  productionRulesArmed,
  setProductionRulesArmed,
} from "../runner/productionRules";

/* The shipped deck, re-derived from the SAME ?raw string the module parsed —
   every roster expectation below reads from this, never from a hand-copied
   literal list (G7D deviation 3: structural pins over law-literal copies). */
const shipped = JSON.parse(watchTheDoorRaw) as { deckId: string; cards: readonly { id: string }[] };
const shippedIds = shipped.cards.map((card) => card.id);

/* ═══════════════════════════ harness helpers ═══════════════════════════ */

class RecordingWorker implements WorkerLike {
  readonly posted: unknown[] = [];
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { message?: string }) => void) | null = null;
  postMessage(message: unknown): void {
    this.posted.push(message);
  }
}

/** The EXACT production boot call (App.vue:115 shape): same seed string,
 *  same six positional arguments, the book answering through the module's
 *  own switch. A flip at either site reddens the source pin below AND any
 *  witness here that depends on the wire shape. */
function bootAsAppDoes(worker: WorkerLike, events: SimClientEvents = {}): SimClient {
  const client = new SimClient(worker, events ?? {});
  client.boot("g1-smoke-001", 1, "sim-core", undefined, undefined, productionBootRules());
  return client;
}

interface ProductionRun {
  readonly received: readonly SimProjection[];
  readonly fake: FakeWorkerLike;
}

/** fakeWorker full loop driven purely through the production module: the
 *  boot rides `bootAsAppDoes`, commits ride the same 2-hands-per-door-pass
 *  rail budget the deckBoot witness used. */
function productionWireLoop(framesToRun: number, commit: boolean): ProductionRun {
  const fake = new FakeWorkerLike();
  const received: SimProjection[] = [];
  const client = new SimClient(fake, { onProjection: (p) => received.push(p) });
  client.boot("g1-smoke-001", 1, "sim-core", undefined, undefined, productionBootRules());
  for (let i = 0; i < framesToRun; i += 1) {
    if (commit) {
      const start = i * 2;
      for (let j = 0; j < 2 && start + j < PRODUCTION_DECK_BOOK.entries.length; j += 1) {
        client.sendPlayerVerb({
          verb: "policy-card-commit",
          cardHash: PRODUCTION_DECK_BOOK.entries[start + j]!.hash,
        });
      }
    }
    fake.pump(1, 10);
  }
  return Object.freeze({ received: Object.freeze(received), fake });
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

afterEach(() => {
  // The owner-ratified default survives every test — a leaked dormant flag
  // would silently disarm the shipped-app witnesses below.
  setProductionRulesArmed(true);
});

/* ═════════════════ (a) the module ships the watch-the-door deck ═════════════════ */

describe("productionRules · the shipped deck is the production book", () => {
  it("six entries; roster derived from the shipped JSON; hash-keyed; deep-frozen", () => {
    expect(PRODUCTION_DECK_ID).toBe(shipped.deckId); // the named provenance is the deck's own id
    expect(PRODUCTION_DECK_SOURCE).toBe("packages/content/decks/watch-the-door.json");
    expect(PRODUCTION_DECK_BOOK.entries.map((e) => String(e.card.id))).toEqual(shippedIds);
    expect(PRODUCTION_DECK_BOOK.entries.length).toBe(6); // the owner named ONE deck; watch-the-door ships six
    for (const entry of PRODUCTION_DECK_BOOK.entries) {
      expect(entry.hash).toMatch(/^[0-9a-f]{16}$/);
      expect(entry.hash).toBe(deckCardHash(entry.card)); // keyed by the shared hash law, not by id
    }
    expect(new Set(PRODUCTION_DECK_BOOK.entries.map((e) => e.hash)).size).toBe(6);
    expect(Object.isFrozen(PRODUCTION_DECK_BOOK)).toBe(true);
    expect(Object.isFrozen(PRODUCTION_DECK_BOOK.entries)).toBe(true);
    for (const entry of PRODUCTION_DECK_BOOK.entries) {
      expect(Object.isFrozen(entry)).toBe(true);
      expect(Object.isFrozen(entry.card)).toBe(true);
    }
  });

  it("owner-ratified default: production ships ARMED and the helper answers the book by identity", () => {
    expect(productionRulesArmed()).toBe(true);
    expect(productionBootRules()).toBe(PRODUCTION_DECK_BOOK); // identity, not a copy
  });
});

/* ═════════════════ (b) the boot message rides the real wire ═════════════════ */

describe("the production boot message · boot.rules crosses the real parser", () => {
  it("armed: six wire entries, decimal-string upkeep, assertToWorker accepts, workerRulesLookup revives", () => {
    const worker = new RecordingWorker();
    bootAsAppDoes(worker);
    expect(worker.posted.length).toBe(1);
    const raw = worker.posted[0] as Record<string, unknown>;
    expect(raw["kind"]).toBe("boot");
    expect(raw["protocol"]).toBe(1);
    expect(raw["seed"]).toBe("g1-smoke-001");
    expect(raw["speedX"]).toBe(1);
    expect(raw["runnerKind"]).toBe("sim-core"); // the flip: the production boot cites the mainline stepper
    const wire = raw["rules"] as BootRulesWire;
    expect(wire.entries.length).toBe(6);
    for (let i = 0; i < 6; i += 1) {
      expect(wire.entries[i]!.hash).toBe(PRODUCTION_DECK_BOOK.entries[i]!.hash);
      // The decimal-string boundary, unbroken — wave-30 retune moved the VALUES
      // (small PROVISIONAL ladder: execute 25k×3, escape-hatch wall 40k, the-underwriter
      // inform 5k, ask-the-senior consult 10k, in authoring order), not the grammar.
      expect(wire.entries[i]!.card.upkeepMicroUsd).toBe(["25000", "25000", "25000", "40000", "5000", "10000"][i]);
    }
    // The REAL envelope parser — shape walls included — takes what the app posts:
    const parsed = assertToWorker(worker.posted[0]!);
    if (parsed.kind !== "boot" || parsed.rules === undefined) throw new Error("expected booted rules");
    expect(parsed.rules).toEqual(wire); // parsed arm keeps the WIRE form (a757f6c symmetry)
    const { lookupPolicyCard } = workerRulesLookup(parsed.rules);
    for (const entry of PRODUCTION_DECK_BOOK.entries) {
      expect(lookupPolicyCard(entry.hash)).toEqual(entry.card); // revived whole, bigint upkeep
    }
    expect(lookupPolicyCard("deadbeefdeadbeef")).toBeNull(); // the void stays the door's `unknown-card-hash` word
  });

  it("dormant: the rules key is NEVER posted — the message is the pre-adoption wire exactly", () => {
    setProductionRulesArmed(false);
    expect(productionBootRules()).toBeUndefined();
    const worker = new RecordingWorker();
    bootAsAppDoes(worker);
    const raw = worker.posted[0] as Record<string, unknown>;
    expect("rules" in raw).toBe(false);
    expect(Object.keys(raw).sort()).toEqual(["kind", "protocol", "runnerKind", "seed", "speedX"]);
    expect(() => assertToWorker(worker.posted[0]!)).not.toThrow();
  });
});

/* ═════════════════ (c) end-to-end fakeWorker: arms AND fires ═════════════════ */

describe("end-to-end fakeWorker · the production book arms and plays itself", () => {
  it("booted via the production module: ruleBook lands 6; f6 fires the crossing; f7 EXECUTES the mapped pair", () => {
    const run = productionWireLoop(8, true);
    expect(run.fake.lastRunner).not.toBeNull(); // the boot was ACCEPTED (mock would fault; this is the sim-core arm)
    expect(run.received.length).toBe(8);
    // Every hash resolved through the WIRE-REVIVED lookup — the book is on the rail:
    const game = (run.fake.lastRunner as SimCoreRunner).lastTickFacts().game;
    expect(game.ruleBook.length).toBe(6);
    // The f6 crossing fires the edge trio plus the consult card (ids derived from the shipped deck):
    expect(firedIds(run.received[6]!)).toEqual([
      shippedIds[0],
      shippedIds[1],
      shippedIds[2],
      shippedIds[5],
    ]);
    // f7: the mapped pair executes; the shed carrier pays the SAME hands rail as the player and loses it.
    expect(doorDetails(run.received[7]!)).toEqual([
      "raise-inspection-depth→configure-node: depth=inspect",
      'page→communicate: node=edge:"the Book opened a ticket"',
      'shed-class→shed-load: hands-exhausted: need 1, free 0 of 2 — rule carrier "shed-class" pays the same hands as the player',
    ]);
    expect(String(game.nodes.get(asEntityId("edge"))?.inspectionDepth)).toBe("inspect");
  }, 20_000);

  it("mock + production book: the boot REFUSES over the fault channel — the wiring-bug posture stays honest", () => {
    const fake = new FakeWorkerLike();
    const faults: string[] = [];
    const client = new SimClient(fake, { onFault: (m) => faults.push(m) });
    client.boot("g1-smoke-001", 1, "mock", undefined, undefined, productionBootRules());
    fake.pump(1, 10);
    expect(fake.lastRunner).toBeNull();
    expect(faults.length).toBe(1);
    expect(faults[0]).toMatch(/boot failed: createRunner: rules rider requires runnerKind "sim-core"/);
  });
});

/* ═════════════════ (d) dormant twins: every golden byte-stands ═════════════════ */

describe("dormant twins · the un-armed path keeps every shipped golden", () => {
  it("dormant 100-frame wire boot replays the frozen legacy hexes (nothing moved, nothing re-presented)", () => {
    setProductionRulesArmed(false);
    const run = productionWireLoop(100, false);
    expect(run.received.length).toBe(100);
    const digests = frameDigests(run.received);
    expect(digests[0]).toBe("ca8863849cb3db32");
    expect(digests[99]).toBe("780b1cbc61dff760");
  }, 30_000);

  it("dormant money twin (direct seed 42, 100 ticks): 25_005_307_300n / 25_109_732_500n byte-stand", () => {
    setProductionRulesArmed(false);
    const rules = productionBootRules();
    expect(rules).toBeUndefined(); // the dormant arm never reaches the ctor — the key is never spread
    const runner = new SimCoreRunner({
      seed: 42,
      ...(rules === undefined ? {} : { rules: workerRulesLookup(encodeBootRules(rules)) }),
    });
    const frames: SimProjection[] = [];
    for (let i = 0; i < 100; i += 1) frames.push(runner.headlessStep(10));
    runner.stop();
    expect(frames[0]!.freeCashMicroUsd).toBe(25_005_307_300n);
    expect(frames[99]!.freeCashMicroUsd).toBe(25_109_732_500n);
  }, 30_000);

  it("armed-but-UNCOMMITTED through the production module is state-inert too: the same frozen hexes stand", () => {
    const run = productionWireLoop(100, false); // default ARMED — boot carries the book, nobody commits
    const digests = frameDigests(run.received);
    expect(digests[0]).toBe("ca8863849cb3db32");
    expect(digests[99]).toBe("780b1cbc61dff760");
    expect(run.received.flatMap(firedIds)).toEqual([]); // firing needs a commit; arming alone moves nothing
  }, 30_000);
});

/* ═════════════════ (e) the FIRST armed committed production digests (NEW) ═════════════════ */

describe("armed committed production run · the first 100-frame digest pair (NEW, self-derived)", () => {
  /* DISCLOSED: the two hexes pinned below were captured by THIS lane's probe
     run @L-PA. They are NEW — they never existed before the production arming
     shipped. The legacy pair ca8863849cb3db32 / 780b1cbc61dff760 stays pinned
     UNMOVED on the dormant twins above; re-presenting those here would be a
     golden move, and this is not one. The commit rail diverges the run at f0
     (first landing commit — the deckBoot causality law), so even frame 0 of
     the armed production run is not the legacy boot frame.
     WAVE-30 CONTENT RETUNE: the pair below was RE-DERIVED FROM THE ENGINE and
     stands BYTE-IDENTICAL — the assumed motion does not exist at this altitude.
     cardFingerprint (which absorbs String(upkeepMicroUsd)) lives in the STATE
     digest (pipeline/digest.ts ruleBook block) and the scenario endDigest
     channel; the proto projection wire never carries ruleBook content, so a
     100-frame armed-committed run with upkeep 25k/40k/5k/10k projects the same
     frames as with upkeep 0 (no money moves before the t420 roll either). The
     pair therefore stays a 0-motion pin at this altitude — the retune's
     hash-level motion (deckCardHash goldens, ruleBookHash) is pinned
     loader-side, and the STATE-digest consequence is witnessed scenario-side
     in scenario/__tests__/deckUpkeepLive.test.ts. */
  let armed: readonly string[] | null = null;
  function armedDigests(): readonly string[] {
    if (armed === null) armed = Object.freeze(frameDigests(productionWireLoop(100, true).received));
    return armed;
  }

  it("the armed production pair is pinned, is NOT the legacy pair, and twin-runs byte-identical", () => {
    const digests = armedDigests();
    expect(digests[0]).toBe("2a7a977a541b08a9");
    expect(digests[99]).toBe("6a314d31f2f2f889");
    expect(digests[0]).not.toBe("ca8863849cb3db32");
    expect(digests[99]).not.toBe("780b1cbc61dff760");
    const twin = frameDigests(productionWireLoop(100, true).received);
    expect(twin).toEqual([...digests]); // determinism twin: no frozen frames, no drift
    expect(new Set(digests).size).toBe(100);
  }, 60_000);
});

/* ═════════════════ wiring + worker-graph law (source pins) ═════════════════ */

describe("the production wiring · source-pinned, worker-graph-clean", () => {
  it("App.vue's ONE production boot flips to the mainline stepper with the production book", () => {
    const app = readFileSync(join(process.cwd(), "src", "App.vue"), "utf8");
    const boots = app.match(/client\.boot\(/g) ?? [];
    expect(boots.length).toBe(1); // the census: exactly one production boot site
    expect(app).toMatch(
      /client\.boot\("g1-smoke-001", 1, "sim-core", undefined, undefined, productionBootRules\(\)\);/,
    );
    expect(app).toMatch(/import \{ productionBootRules \} from "\.\/runner\/productionRules"/);
  });

  it("productionRules stays OUT of the worker graph — and the deck name never crosses worker-side", () => {
    for (const rel of [
      ["src", "worker", "sim.worker.ts"],
      ["src", "bridge", "fakeWorker.ts"],
      ["src", "runner", "index.ts"],
    ] as const) {
      const source = readFileSync(join(process.cwd(), ...rel), "utf8");
      expect(source, rel.join("/")).not.toContain("productionRules");
      expect(source, rel.join("/")).not.toContain("watch-the-door");
    }
  });
});
