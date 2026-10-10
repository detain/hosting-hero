/**
 * i18n corpus drift pins — the §9.11 contract in test form.
 *
 * If content renames a pack key, if the door renames a refusal code, if an
 * author adds a `refusal.<code>` template the UI never wired (or vice versa),
 * a test here goes RED and names the offender. Same spirit as the g2 corpus
 * pins: sources are re-read through the SAME `?raw` wires the UI imports, so
 * the assertions ride bytes, not a second parse path.
 */
import { describe, expect, it } from "vitest";
import sharedWebRaw from "../../../../../packages/content/packs/shared-web.i18n.json?raw";
import gameRaw from "../../../../../packages/content/packs/game.i18n.json?raw";
import intentDoorRaw from "../../../../../packages/sim-core/src/pipeline/intent-door.ts?raw";
import { STATUS_VALUES } from "../../chrome/statusChip.ts";
import { hasKey, packOf, t, templateOf } from "../packStore.ts";
import { describeRefusal } from "../refusalCopy.ts";

/* The door's emitted codes, re-derived from its OWN source: `reason: "code…"`
 * assignments and `reject(label, "code…")` calls (args carry no quotes). */
function doorEmittedCodes(source: string): Set<string> {
  const codes = new Set<string>();
  for (const m of source.matchAll(/reason:\s*["`]([a-z0-9-]+)/g)) codes.add(m[1] as string);
  for (const m of source.matchAll(/reject\(\s*[^;"`]*["`]([a-z0-9-]+)/g)) codes.add(m[1] as string);
  codes.delete("");
  return codes;
}

const DOOR_CODES = doorEmittedCodes(intentDoorRaw);

/** The codes this lane voices, with a canonical detail each extractor parses. */
const VOICED: readonly (readonly [string, string, Record<string, string>])[] = Object.freeze([
  ["unknown-node", 'unknown-node: "db-1"', { nodeId: "db-1" }],
  ["edge-exists", 'edge-exists: "edge:data:web-1->sw-1"', { relationKind: "data", nodeId: "web-1" }],
  ["slot-occupied", 'slot-occupied: "psu1" on "web-1" fed by "sw-1" — one supplier per socket', { slotName: "psu1", nodeId: "web-1" }],
  ["stamped-in-future", "stamped-in-future: entry tick 9 > current 2", { verb: "v", availableAtTick: "9" }],
  ["hands-exhausted", "hands-exhausted: need 1, free 0 of 2", { verb: "v", availableAtTick: "4" }],
] as const);

const VOICED_CODES = VOICED.map(([code]) => code).sort();

function packRefusalCodes(raw: string): string[] {
  const doc = JSON.parse(raw) as { decision: Record<string, unknown>; flavour: Record<string, unknown> };
  return [...Object.keys(doc.decision), ...Object.keys(doc.flavour)]
    .filter((k) => k.startsWith("refusal."))
    .map((k) => k.slice("refusal.".length))
    .sort();
}

describe("i18n/corpusDrift · door codes ↔ pack refusal keys, both directions", () => {
  it("the door source still emits every voiced code", () => {
    for (const code of VOICED_CODES) {
      expect(DOOR_CODES.has(code), `door no longer emits '${code}' — rename it in i18n/refusalCopy.ts or drop the key`).toBe(true);
    }
  });

  it("each pack carries EXACTLY the voiced five under refusal.*", () => {
    expect(packRefusalCodes(sharedWebRaw)).toEqual(VOICED_CODES);
    expect(packRefusalCodes(gameRaw)).toEqual(VOICED_CODES);
    // same count through the parsed store (loader split agrees with raw JSON):
    const parsed = [...packOf("shared-web").decision.keys()]
      .filter((k) => k.startsWith("refusal."))
      .map((k) => k.slice("refusal.".length));
    expect(parsed.sort()).toEqual(VOICED_CODES);
  });

  it("the two packs voice the five with byte-identical bodies", () => {
    for (const code of VOICED_CODES) {
      const key = `refusal.${code}`;
      expect(templateOf("game", key)).toEqual(templateOf("shared-web", key));
    }
  });

  it("every voiced code renders FROM the pack, every other door code falls back raw", () => {
    for (const [code, reason, slots] of VOICED) {
      const line = describeRefusal(reason, { verb: "v", tick: "2", hands: [{ busyUntilTick: "4", busyCauseId: null }] });
      expect(line.fromPack, `refusal.${code} stopped voicing`).toBe(true);
      expect(line.text).toBe(t("shared-web", `refusal.${code}`, slots));
    }
    for (const code of DOOR_CODES) {
      if (VOICED_CODES.includes(code)) continue;
      const line = describeRefusal(`${code}: detail`, { verb: "v", tick: "2", hands: [] });
      expect(line.fromPack, `code '${code}' has NO pack key — raw fallback must stay visible`).toBe(false);
      expect(line.text).toBe(`${code}: detail`);
    }
  });
});

describe("i18n/corpusDrift · G5 seam slot-sets pinned against the pack JSON", () => {
  const slotsOf = (raw: string, key: string): string[] => {
    const doc = JSON.parse(raw) as { decision: Record<string, string> };
    const body = doc.decision[key];
    if (body === undefined) throw new Error(`pack JSON no longer carries decision '${key}'`);
    return [...body.matchAll(/\{([a-zA-Z]+)\}/g)].map((m) => m[1] as string).sort();
  };

  it("alert.churn-fuse {customer} — shared-web only", () => {
    expect(slotsOf(sharedWebRaw, "alert.churn-fuse")).toEqual(["customer"]);
    expect(hasKey("game", "alert.churn-fuse")).toBe(false);
  });

  it("terms.prepay-lock {introPrice}{termMonths} — shared-web only", () => {
    expect(slotsOf(sharedWebRaw, "terms.prepay-lock")).toEqual(["introPrice", "termMonths"]);
    expect(hasKey("game", "terms.prepay-lock")).toBe(false);
  });

  it("alert.death-imminent / alert.company-dissolved are ZERO-SLOT — shared-web only (OD-25(a))", () => {
    // The SLOT_FREE_DECISION_KEYS seam in noticeCopy.ts resolves these with
    // customerLabel null; a slot appearing here would silently re-break the
    // death-voice seam (the row's data path has no label to fill it), so the
    // raw pack JSON — not the parsed store — is pinned empty.
    expect(slotsOf(sharedWebRaw, "alert.death-imminent")).toEqual([]);
    expect(slotsOf(sharedWebRaw, "alert.company-dissolved")).toEqual([]);
    expect(hasKey("game", "alert.death-imminent")).toBe(false);
    expect(hasKey("game", "alert.company-dissolved")).toBe(false);
  });
});

describe("i18n/corpusDrift · the declined chrome consumer, on the record", () => {
  it("status.rung-* are statuspage sentences, NOT the 12-value chip vocabulary — zero 1:1 replacements exist", () => {
    // The chrome contract: chips report OBJECT STATE (HEALTHY…UNVERIFIED);
    // the pack's five rungs are outward statuspage prose. They share no
    // string, so wiring one onto the other would be a forced fit — DECLINED
    // per the ticket's escape hatch. AlertStack group labels are wire
    // NoticeKind literals + fatigue-mechanic copy ("N suppressed by fatigue /
    // overflow"), likewise without any pack analogue in either vocabulary.
    const rungs = [1, 2, 3, 4, 5].map((n) => t("shared-web", `status.rung-${n}`));
    const vocab: readonly string[] = STATUS_VALUES;
    for (const rung of rungs) {
      for (const value of vocab) {
        // 1:1 replacement law: a chip label is a single state word; a rung is
        // a sentence. No rung ever EQUALS a vocab value (even where one, like
        // "Degraded performance", SHARES a word with DEGRADED — a partial
        // overlap is exactly the forced fit the contract refuses).
        expect(rung).not.toBe(value);
      }
    }
    expect(rungs).toEqual([
      "Investigating elevated error rates",
      "Degraded performance",
      "Partial outage",
      "Major outage",
      "We are aware of the fire.",
    ]);
  });
});
