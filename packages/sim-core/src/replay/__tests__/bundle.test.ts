/**
 * ReplayBundle codec tests (§3.3 canonical artifact): round-trip ×1000
 * seeded fixtures through BOTH variants, unknown-key preservation
 * (forward-compat), and fail-loud validation at the boundary.
 */

import { describe, expect, it } from "vitest";
import {
  REPLAY_SCHEMA_VERSION,
  decodeReplayBundle,
  decodeReplayBundleBinary,
  decodeReplayBundleJson,
  encodeReplayBundleBinary,
  encodeReplayBundleJson,
  parseReplayBundleWire,
  replayBundleDocToWire,
  stampIntents,
  toReplayBundle,
  type ReplayBundleDoc,
  type StampedIntent,
} from "../bundle";
import { digestCanonicalValue } from "../canonical";
import { asRuleId, asRunSeed } from "../../types";
import { SeedRng, minimalDoc, normalizeSignedZeros, randomCanonicalValue, stampedIntents } from "./helpers";

function seededDoc(rng: SeedRng, index: number): ReplayBundleDoc {
  const ring0 = rng.word(); // checkpoint hashes — shared with same-tick snapshots (R3)
  const ring9 = rng.word();
  const intentExtras = index % 2 === 0 ? { extras: { futureIntentField: randomCanonicalValue(rng, 2) } } : {};
  const docExtras = index % 3 === 0 ? { extras: { addedByNewerWriter: randomCanonicalValue(rng, 2) } } : {};
  const stamped: StampedIntent = {
    tick: 3n,
    intent: {
      seq: 1,
      clock: "business",
      atUs: rng.bigDecimal(3),
      origin: "rule",
      ruleId: asRuleId(`rule-${index % 5}`),
      payload: { kind: "slider", control: rng.word(), value: 7n },
    },
    ...intentExtras,
  };
  return {
    schemaVersion: REPLAY_SCHEMA_VERSION,
    runSeed: asRunSeed(rng.bigDecimal(4)),
    engineVersion: `engine-${index}-${rng.word()}`,
    contentHashes: {
      rulesetCardHashes: { [rng.word()]: rng.word(), "official:vps": rng.word() },
      sheetsHash: rng.word(),
      ruleBookHash: rng.word(),
    },
    snapshotEveryTicks: BigInt(1 + rng.int(20)),
    intentLog: [
      {
        tick: 1n,
        intent: { seq: 0, clock: "sim", atUs: 60_000_000n, origin: "player", payload: { kind: "verb", verb: rng.word(), target: null, value: null } },
      },
      stamped,
    ],
    directorDraws: [{ atTick: BigInt(rng.int(10)), subject: "entropy-budget", value: rng.bigDecimal(2) }],
    // R3 parse law: snapshots land ON ring ticks with the SAME hash — the
    // ring draws are hoisted to locals and reused by the snapshot records.
    checkpoints: [
      { tick: 0n, stateHash: ring0 },
      { tick: 9n, stateHash: ring9 },
    ],
    snapshots: [
      { tick: 0n, stateHash: ring0, state: randomCanonicalValue(rng, 3), stateEncoding: "canonical-json" },
      { tick: 9n, stateHash: ring9 },
    ],
    lineage: { nodeId: rng.word(), manifest: randomCanonicalValue(rng, 2), facets: { write: [rng.word()] } },
    ...docExtras,
  };
}

describe("ReplayBundle codec round-trip (JSON + binary)", () => {
  it("static fixture round-trips through both variants", () => {
    const doc = minimalDoc();
    expect(decodeReplayBundleJson(encodeReplayBundleJson(doc))).toEqual(doc);
    expect(decodeReplayBundleBinary(encodeReplayBundleBinary(doc))).toEqual(doc);
    expect(decodeReplayBundle(encodeReplayBundleBinary(doc))).toEqual(doc);
    expect(decodeReplayBundle(encodeReplayBundleJson(doc))).toEqual(doc);
  });

  it("×1000 seeded fixture fuzz: decode(encode(doc)) ≡ doc, digest-stable", () => {
    const rng = new SeedRng(0x8eedf00d1n, "replay-fuzz-bundle");
    for (let i = 0; i < 1000; i += 1) {
      const doc = seededDoc(rng, i);
      const jsonBack = decodeReplayBundleJson(encodeReplayBundleJson(doc));
      const binaryBack = decodeReplayBundleBinary(encodeReplayBundleBinary(doc));
      // seeded states carry −0 leaves (R2): codecs normalise them at encode.
      const expected = normalizeSignedZeros(doc);
      expect(jsonBack).toEqual(expected);
      expect(binaryBack).toEqual(expected);
      // canonical form of the wire doc is variant-independent
      expect(digestCanonicalValue(replayBundleDocToWire(jsonBack))).toBe(digestCanonicalValue(replayBundleDocToWire(doc)));
    }
  });
});

describe("unknown-key preservation (forward compatibility)", () => {
  it("extra keys at every level survive encode→decode→encode byte-identically", () => {
    const foreignWire = {
      ...replayBundleDocToWire(minimalDoc()),
      futureArtifact: { hashes: { grammarPack: "gp-1" }, twistList: ["noir", 42n] },
      engineBuildStamp: "node-v22",
      snapshots: [
        { tick: 0n, stateHash: "0".repeat(16), state: { a: 1n }, stateEncoding: "canonical-json", merkleLeaf: "ml-0" },
        { tick: 5n, stateHash: "1".repeat(16), provenance: "relay-a" },
        { tick: 10n, stateHash: "2".repeat(16) },
      ],
      intentLog: [
        { tick: 3n, intent: { seq: 0, clock: "sim", atUs: 1n, origin: "player", payload: { kind: "verb" }, latencyHintMs: 12n } },
      ],
    };
    const doc = parseReplayBundleWire(decodeCanonicalJsonText(foreignWire));
    expect(doc.extras?.futureArtifact).toBeDefined();
    expect(doc.extras?.engineBuildStamp).toBe("node-v22");
    expect(doc.snapshots[0]?.extras?.merkleLeaf).toBe("ml-0");
    expect(doc.snapshots[1]?.extras?.provenance).toBe("relay-a");
    expect(doc.intentLog[0]?.extras?.latencyHintMs).toBe(12n);
    // Re-encoding a parsed foreign bundle yields the identical canonical digest.
    const reEncodedWire = replayBundleDocToWire(doc);
    expect(digestCanonicalValue(reEncodedWire)).toBe(digestCanonicalValue(decodeCanonicalJsonText(foreignWire)));
  });
});

/** foreign object literals hold live bigints — pass them through the
 *  canonical JSON cycle to get an `unknown` wire value like a decode would. */
function decodeCanonicalJsonText(wire: unknown): unknown {
  return JSON.parse(
    JSON.stringify(wire, (_k, v) => (typeof v === "bigint" ? { __bi: v.toString(10) } : v)),
    (_k, v) => (v !== null && typeof v === "object" && "__bi" in (v as object) ? BigInt((v as { __bi: string }).__bi) : v),
  );
}

describe("boundary validation (fail loud, Law 4)", () => {
  const good = () => replayBundleDocToWire(minimalDoc());

  it("rejects unknown schemaVersion with the version named", () => {
    expect(() => parseReplayBundleWire({ ...good(), schemaVersion: 99 })).toThrow(/unsupported version 99/);
  });

  it("rejects non-bigint runSeed (float would silently round, §3.4)", () => {
    expect(() => parseReplayBundleWire({ ...good(), runSeed: 123 })).toThrow(/runSeed: expected bigint/);
  });

  it("rejects non-increasing checkpoint / snapshot / intent ticks", () => {
    expect(() => parseReplayBundleWire({ ...good(), checkpoints: [{ tick: 5n, stateHash: "h" }, { tick: 5n, stateHash: "h" }] })).toThrow(/checkpoints\.tick: ticks must strictly increase/);
    expect(() =>
      parseReplayBundleWire({
        ...good(),
        snapshots: [
          { tick: 5n, stateHash: "1".repeat(16) },
          { tick: 5n, stateHash: "1".repeat(16) },
          { tick: 10n, stateHash: "2".repeat(16) },
        ],
      }),
    ).toThrow(/snapshots\.tick: ticks must strictly increase/);
    const entry = { tick: 3n, intent: { seq: 0, clock: "sim", atUs: 1n, origin: "player", payload: { kind: "verb" } } };
    expect(() => parseReplayBundleWire({ ...good(), intentLog: [entry, entry] })).toThrow(/intentLog\.tick: ticks must strictly increase/);
  });

  it("rejects snapshots without ring coverage and stamped wrapper extensions", () => {
    const wire = good();
    expect(() => parseReplayBundleWire({ ...wire, checkpoints: [{ tick: 0n, stateHash: "0".repeat(16) }] })).toThrow(/snapshot tick 5 missing from checkpoints/);
    expect(() =>
      parseReplayBundleWire({ ...wire, intentLog: [{ tick: 3n, intent: { seq: 0, clock: "sim", atUs: 1n, origin: "player", payload: { kind: "verb" } }, sideBand: 1n }] }),
    ).toThrow(/unknown key\(s\) \[sideBand\]/);
  });

  it("R3: rejects a same-tick snapshot whose stateHash forks the ring hash", () => {
    // The pre-fix parser matched snapshots⊆checkpoints by TICK only, so a
    // crafted same-tick snapshot with a different hash silently OVERWROTE
    // the ring entry in collectHashPoints — skipping a check point and
    // breaking the bisection precondition.
    const wire = good();
    const forking = wire.snapshots as Record<string, unknown>[];
    expect(() =>
      parseReplayBundleWire({
        ...wire,
        snapshots: [{ ...forking[0]!, stateHash: "ee".repeat(8) }, forking[1], forking[2]],
      }),
    ).toThrow(/snapshot tick 0 stateHash ee.+ disagrees with checkpoint ring hash 0+/);
    // identical hash at the shared tick stays legal (that IS minimalDoc).
    expect(() => parseReplayBundleWire(wire)).not.toThrow();
  });

  it("N3: stateEncoding survives a round-trip on a hash-only snapshot (byte-stable re-encode)", () => {
    const wire = {
      ...good(),
      snapshots: [
        { tick: 0n, stateHash: "0".repeat(16), stateEncoding: "canonical-binary" }, // declared WITHOUT state
        { tick: 5n, stateHash: "1".repeat(16) },
        { tick: 10n, stateHash: "2".repeat(16) },
      ],
    };
    const doc = parseReplayBundleWire(decodeCanonicalJsonText(wire));
    expect(doc.snapshots[0]?.stateEncoding).toBe("canonical-binary");
    expect(doc.snapshots[0]?.state).toBeUndefined();
    // decode→encode→decode must be byte-stable (the pre-fix parser DROPPED
    // the declaration, making the second encoding differ from the first).
    const firstText = encodeReplayBundleJson(doc);
    const secondText = encodeReplayBundleJson(decodeReplayBundleJson(firstText));
    expect(secondText).toBe(firstText);
    const firstBytes = encodeReplayBundleBinary(doc);
    const secondBytes = encodeReplayBundleBinary(decodeReplayBundleBinary(firstBytes));
    expect([...secondBytes]).toEqual([...firstBytes]);
    // and the wire digest is preserved through the parse cycle, declaration included
    expect(digestCanonicalValue(replayBundleDocToWire(doc))).toBe(digestCanonicalValue(decodeCanonicalJsonText(wire)));
  });

  it("rejects malformed intents and director subjects", () => {
    const wire = good();
    expect(() => parseReplayBundleWire({ ...wire, intentLog: [{ tick: 1n, intent: { seq: 0, clock: "quantum", atUs: 1n, origin: "player", payload: { kind: "verb" } } }] })).toThrow(/clock: "quantum" not in/);
    expect(() => parseReplayBundleWire({ ...wire, directorDraws: [{ atTick: 1n, subject: "mid-run-world-edit", value: 1n }] })).toThrow(/subject: "mid-run-world-edit" not in/);
  });
});

describe("contract projection", () => {
  it("toReplayBundle flattens to the shared ReplayBundle type", () => {
    const doc = minimalDoc();
    const bundle = toReplayBundle(doc);
    expect(bundle.runSeed).toBe(doc.runSeed);
    expect(bundle.intentLog).toEqual(doc.intentLog.map((e) => e.intent));
    expect(bundle.snapshots).toEqual(doc.snapshots.map((s) => ({ tick: s.tick, stateHash: s.stateHash })));
    expect(bundle.snapshotEveryTicks).toBe(5n);
  });

  it("stampIntents keeps log order and applies tickOf", () => {
    const intents = stampedIntents(5, 2n).map((e) => e.intent);
    const stamped = stampIntents(intents, (intent) => BigInt(intent.seq));
    expect(stamped.map((e) => e.tick)).toEqual([0n, 1n, 2n, 3n, 4n]);
  });
});
