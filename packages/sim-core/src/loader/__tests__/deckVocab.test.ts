/**
 * R3 enum-fission cure — the four-way vocabulary drift pin.
 *
 * Every closed policy-card vocabulary exists at FOUR sites that must move
 * together: the `../types.ts` unions (the engine contract), this loader's
 * re-declared parse tables (`decks.ts`, packs.ts BAD_ENUM posture: closed
 * sets re-declared, no cross-module import), the proto wire codec's
 * `POLICY_*_WIRE_IDS` tables (apps/proto/src/shared/protocol.ts), and the
 * content schema's `enum` arrays (packages/content/schema/
 * policy-deck.schema.json — the G7A content leg; the pin degrades to the
 * three always-live sites while that file has not landed, and the
 * presence/absence itself is pinned so the deferred leg cannot be
 * silently forgotten).
 *
 * Mechanism is the sanctioned source-grep drift-pin family
 * (apps/proto/src/__tests__/simWorker.rules.test.ts posture): readFileSync
 * + regex over SOURCE TEXT — no engine imports, no fixtures to go stale.
 * Any enum edited at one site without the others reddens here by name.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/* ═══════════════════════ extraction helpers ═══════════════════════ */

function read(...segments: readonly string[]): string {
  return readFileSync(join(process.cwd(), ...segments), "utf8");
}

/** Every double-quoted string in `text`, in order. */
function quoted(text: string): string[] {
  return [...text.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
}

/** The body of `export type NAME = ...;` (first match; fails loud absent). */
function unionBody(source: string, name: string): string {
  const match = new RegExp(`export type ${name} =([\\s\\S]*?);\\n`).exec(source);
  if (!match) throw new Error(`deckVocab: types.ts declares no 'export type ${name}' — the pin's anchor moved`);
  return match[1]!;
}

/** The string members of `const NAME ... = [ ... ];` in a source file. */
function arrayMembers(source: string, name: string): string[] {
  const match = new RegExp(`const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\]`).exec(source);
  if (!match) throw new Error(`deckVocab: no literal array for '${name}' — the loader table's declaration shape moved`);
  return quoted(match[1]!);
}

/** Every `kind: "..."` literal inside the PolicyThreshold union arms. */
function literalsFor(source: string, name: string, field: string): string[] {
  return [...unionBody(source, name).matchAll(new RegExp(`${field}:\\s*"([^"]+)"`, "g"))].map((m) => m[1]!);
}

/** The `POLICY_X_WIRE_IDS = Object.freeze([...])` tables of the codec. */
function wireMembers(source: string, name: string): string[] {
  const match = new RegExp(`export const ${name}[\\s\\S]*?=\\s*Object\\.freeze\\(\\[([\\s\\S]*?)\\]`).exec(source);
  if (!match) throw new Error(`deckVocab: protocol.ts declares no '${name}' wire table — the codec's anchor moved`);
  return quoted(match[1]!);
}

/** Every `enum: [...]` array anywhere inside a parsed JSON schema. */
function schemaEnums(node: unknown, sink: string[][] = []): string[][] {
  if (Array.isArray(node)) {
    for (const item of node) schemaEnums(item, sink);
    return sink;
  }
  if (typeof node === "object" && node !== null) {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === "enum" && Array.isArray(value) && value.every((v) => typeof v === "string")) {
        sink.push(value as string[]);
      }
      schemaEnums(value, sink);
    }
  }
  return sink;
}

/* ═══════════════════════ the four sites ═══════════════════════ */

const typesSource = read("src", "types.ts");
const loaderSource = read("src", "loader", "decks.ts");
const protocolSource = read("..", "..", "apps", "proto", "src", "shared", "protocol.ts");
const schemaPath = join(process.cwd(), "..", "content", "schema", "policy-deck.schema.json");

type Vocab = {
  readonly name: string;
  readonly types: readonly string[];
  readonly loader: readonly string[];
  readonly wire: readonly string[];
};

const VOCABULARIES: readonly Vocab[] = [
  {
    name: "comparator",
    types: quoted(unionBody(typesSource, "Comparator")),
    loader: arrayMembers(loaderSource, "COMPARATORS"),
    wire: wireMembers(protocolSource, "POLICY_COMPARATOR_WIRE_IDS"),
  },
  {
    name: "metric unit",
    types: quoted(unionBody(typesSource, "MetricUnit")),
    loader: arrayMembers(loaderSource, "METRIC_UNITS"),
    wire: wireMembers(protocolSource, "METRIC_UNIT_WIRE_IDS"),
  },
  {
    name: "policy action",
    types: quoted(unionBody(typesSource, "PolicyActionId")),
    loader: arrayMembers(loaderSource, "ACTION_IDS"),
    wire: wireMembers(protocolSource, "POLICY_ACTION_ID_WIRE_IDS"),
  },
  {
    name: "delegation band",
    types: quoted(unionBody(typesSource, "DelegationBand")),
    loader: arrayMembers(loaderSource, "BANDS"),
    wire: wireMembers(protocolSource, "POLICY_BAND_WIRE_IDS"),
  },
  {
    name: "scope kind",
    types: [
      ...new Set([
        ...[...typesSource.matchAll(/export interface ScopeSelector \{[\s\S]*?kind: ([^;]+);/g)].flatMap((m) => quoted(m[1]!)),
      ]),
    ],
    loader: arrayMembers(loaderSource, "SCOPE_KINDS"),
    wire: wireMembers(protocolSource, "POLICY_SCOPE_KIND_WIRE_IDS"),
  },
  {
    name: "threshold kind",
    types: literalsFor(typesSource, "PolicyThreshold", "kind"),
    loader: arrayMembers(loaderSource, "THRESHOLD_KINDS"),
    wire: wireMembers(protocolSource, "POLICY_THRESHOLD_KIND_WIRE_IDS"),
  },
  {
    name: "escalation target",
    types: literalsFor(typesSource, "PolicyEscalation", "to"),
    loader: arrayMembers(loaderSource, "ESCALATION_TARGETS"),
    wire: wireMembers(protocolSource, "POLICY_ESCALATION_TARGET_WIRE_IDS"),
  },
];

const eq = (values: readonly string[]): string[] => [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

/* ═══════════════════════ the pins ═══════════════════════ */

describe("deckVocab — the three always-live sites agree", () => {
  it("every extraction is non-trivial (a moved anchor cannot silently vacuate the law)", () => {
    for (const vocab of VOCABULARIES) {
      expect(vocab.types.length, `${vocab.name}: types.ts union`).toBeGreaterThanOrEqual(2);
      expect(vocab.loader.length, `${vocab.name}: loader table`).toBeGreaterThanOrEqual(2);
      expect(vocab.wire.length, `${vocab.name}: wire table`).toBeGreaterThanOrEqual(2);
      expect(new Set(vocab.loader).size, `${vocab.name}: loader table has duplicate members`).toBe(vocab.loader.length);
    }
  });

  it("the scope-kind extraction anchors on the ScopeSelector interface itself", () => {
    expect(
      /export interface ScopeSelector \{[\s\S]*?kind: ([^;]+);/.test(typesSource),
      "types.ts ScopeSelector shape moved — update this pin's regex",
    ).toBe(true);
    expect(VOCABULARIES[4]!.types).toContain("estate");
  });

  for (const vocab of VOCABULARIES) {
    it(`types.ts ↔ loader/decks.ts agree on '${vocab.name}'`, () => {
      expect(eq(vocab.loader)).toEqual(eq(vocab.types));
    });
    it(`types.ts ↔ protocol.ts wire table agree on '${vocab.name}'`, () => {
      expect(eq(vocab.wire)).toEqual(eq(vocab.types));
    });
  }
});

describe("deckVocab — the content-schema leg (G7A)", () => {
  it("the schema either exists and agrees, or is honestly absent (never silently forgotten)", () => {
    if (!existsSync(schemaPath)) {
      // Deferred leg, on the record: the moment G7A's
      // policy-deck.schema.json lands, this branch flips and the
      // attribution law below activates. The absence itself is a pinned
      // state so nobody "assumes" four-way coverage.
      expect(schemaPath.endsWith(join("packages", "content", "schema", "policy-deck.schema.json"))).toBe(true);
      console.log(`deckVocab: content schema not on disk yet (${schemaPath}) — schema leg DEFERRED, 3-way pin active`);
      return;
    }
    const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as unknown;
    const enums = schemaEnums(schema);
    expect(enums.length, "policy-deck.schema.json declares no enum arrays").toBeGreaterThan(0);

    // Attribution law: a schema enum speaks vocabulary V when it contains a
    // word UNIQUE to V (a word no other table carries — "role" alone
    // belongs to two vocabularies legitimately, so shared words can never
    // attribute). An attributed enum must equal V exactly (the fission
    // cure); an enum that claims two vocabularies' uniques at once is a
    // mix and fails. Every vocabulary must be claimed by at least one enum
    // — the schema either declares the whole closed census or welds red.
    const uniques = new Map<string, Set<string>>();
    for (const vocab of VOCABULARIES) {
      const others = new Set(
        VOCABULARIES.filter((v) => v.name !== vocab.name).flatMap((v) => [...v.loader]),
      );
      uniques.set(vocab.name, new Set(vocab.loader.filter((m) => !others.has(m))));
    }
    const claimed = new Set<string>();
    for (const declaration of enums) {
      const owners = VOCABULARIES.filter((vocab) =>
        declaration.some((m) => uniques.get(vocab.name)!.has(m)),
      );
      expect(owners.length, `schema enum ${JSON.stringify(declaration)} mixes vocabularies`).toBeLessThanOrEqual(1);
      if (owners.length === 0) continue; // shared-only or foreign enum — not ours to police
      const vocab = owners[0]!;
      claimed.add(vocab.name);
      expect(eq(declaration), `schema enum for '${vocab.name}' diverges from the loader table`).toEqual(eq(vocab.loader));
    }
    for (const vocab of VOCABULARIES) {
      expect(claimed.has(vocab.name), `policy-deck.schema.json no longer declares the '${vocab.name}' enum`).toBe(true);
    }
  });

  it("the loader re-declares tables rather than importing the wire codec or the policy engine (import law)", () => {
    // comment prose MAY name the door/evaluator (it documents the
    // relationship); IMPORTS may not. Only from-clauses are scanned.
    const fromClauses = [...loaderSource.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]!);
    for (const spec of fromClauses) {
      expect(spec, `illegal loader import '${spec}'`).not.toMatch(/apps|intent-door|grammar|evaluator|protocol/);
    }
    expect(fromClauses.length).toBeGreaterThan(0);
  });
});
