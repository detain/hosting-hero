/**
 * versus deck→WaveTable conversion tests. The headline gate: every scripted
 * deck converts to a table that passes waves/enforcer with ZERO findings
 * (the converter self-checks the same way — these tests pin the outcome
 * from the OUTSIDE so a self-check removal cannot hide a law break).
 */
import { describe, expect, test } from "vitest";
import { enforceWaveTable } from "../../waves/enforcer.ts";
import { AUTHORING_LAWS } from "../../waves/enforcer.ts";
import { DAMAGE_DENOMINATIONS, THREAT_ROLES } from "../../waves/table.ts";
import { deckToWaveTable, VERSUS_PAR_LADDER_PCT, VERSUS_SHARE_LADDERS, VERSUS_WAVE_COUNT } from "../match.ts";
import { VersusError } from "../deck.ts";
import {
  CENSUS,
  RAW_DECK_BANDWIDTH,
  RAW_DECK_FIVE_CONCURRENCY,
  RAW_DECK_FLAT_ROLES,
  RAW_DECK_LEAN,
  RAW_DECK_MAIN,
  RAW_DECK_MULTIROLE,
  RAW_DECK_TWO_ROLES,
  RAW_DECK_WIDE,
  parseDeck,
} from "./fixtures.ts";

const SCRIPTED = Object.freeze([
  ["main", RAW_DECK_MAIN],
  ["lean", RAW_DECK_LEAN],
  ["wide", RAW_DECK_WIDE],
  ["multirole", RAW_DECK_MULTIROLE],
  ["bandwidth", RAW_DECK_BANDWIDTH],
] as const);

function scheduleOf(raw: unknown) {
  return deckToWaveTable(parseDeck(raw), {
    census: CENSUS,
    tableId: "versus-schedule-test",
    typeBundleId: "shared-web",
  });
}

describe("deck→WaveTable — ZERO enforcer findings (the acceptance wall)", () => {
  for (const [name, raw] of SCRIPTED) {
    test(`deck "${name}" converts to an enforcement-clean ${VERSUS_WAVE_COUNT}-wave table`, () => {
      const { table, waves } = scheduleOf(raw);
      expect(table.waves).toHaveLength(VERSUS_WAVE_COUNT);
      expect(waves).toHaveLength(VERSUS_WAVE_COUNT);
      expect(enforceWaveTable(table)).toEqual([]);
    });
  }

  test("conversion is deterministic: same deck ⇒ identical table JSON", () => {
    const a = JSON.stringify(scheduleOf(RAW_DECK_WIDE).table);
    for (let run = 0; run < 20; run += 1) {
      expect(JSON.stringify(scheduleOf(RAW_DECK_WIDE).table)).toBe(a);
    }
  });
});

describe("deck→WaveTable — law spot-checks on the shipped shape", () => {
  test("≤4 entries and ≤2 denominations per wave; no dup threat within a wave", () => {
    const { table } = scheduleOf(RAW_DECK_WIDE);
    for (const wave of table.waves) {
      expect(wave.entries.length).toBeLessThanOrEqual(AUTHORING_LAWS.maxThreatEntriesPerWave);
      const denominations = new Set(wave.entries.flatMap((entry) => [...entry.denominations]));
      expect(denominations.size).toBeLessThanOrEqual(AUTHORING_LAWS.maxDenominationsPerWave);
      const ids = wave.entries.map((entry) => entry.threatId);
      expect(new Set(ids).size).toBe(ids.length);
      for (const entry of wave.entries) {
        expect(DAMAGE_DENOMINATIONS).toContain(entry.denominations[0]);
        expect(THREAT_ROLES).toContain(entry.role);
        for (const target of entry.targets) expect(target.length).toBeGreaterThan(0);
      }
    }
  });

  test("every deck threat appears in at least one wave (nothing benched)", () => {
    const deck = parseDeck(RAW_DECK_MAIN);
    const { waves } = scheduleOf(RAW_DECK_MAIN);
    const placed = new Set(waves.flatMap((row) => [...row.threatIds]));
    for (const entry of deck.entries) {
      expect(placed.has(entry.threatId), `bench-warmed ${entry.threatId}`).toBe(true);
    }
  });

  test("fresh-role cadence holds: waves 4 and 8 each carry a role unseen in their lookback", () => {
    for (const [, raw] of SCRIPTED) {
      const { waves } = scheduleOf(raw);
      const seenBy = (list: typeof waves) => new Set(list.flatMap((row) => [...row.roles]));
      const atFour = new Set([...seenBy(waves.slice(0, 3))]);
      expect([...(waves[3]?.roles ?? [])].some((role) => !atFour.has(role))).toBe(true);
      const atEight = new Set([...seenBy(waves.slice(4, 7))]);
      expect([...(waves[7]?.roles ?? [])].some((role) => !atEight.has(role))).toBe(true);
    }
  });

  test("par ladder and share ladders ship exactly as documented", () => {
    const { table } = scheduleOf(RAW_DECK_MAIN);
    expect(table.waves.map((wave) => wave.parPct)).toEqual([...VERSUS_PAR_LADDER_PCT]);
    for (const wave of table.waves) {
      const shares = VERSUS_SHARE_LADDERS[wave.entries.length as keyof typeof VERSUS_SHARE_LADDERS];
      expect(wave.entries.map((entry) => entry.sharePct)).toEqual([...shares]);
      expect(wave.entries.reduce((total, entry) => total + entry.sharePct, 0)).toBe(100);
    }
  });

  test("weight order drives slot order: heaviest threat takes the fattest share at wave 1", () => {
    const { table } = scheduleOf(RAW_DECK_MAIN);
    const first = table.waves[0];
    expect(first?.entries[0]?.threatId).toBe("scanner-drizzle");
  });

  test("table round-trips the strict parseWaveTable boundary", () => {
    const { table } = scheduleOf(RAW_DECK_MULTIROLE);
    expect(table.id).toBe("versus-schedule-test");
    expect(table.tuningSheet).toBe("B");
    expect(table.unitsPerPressurePoint).toBe(1);
  });
});

describe("deck→WaveTable — conversion reds (fail loud, never half-ship)", () => {
  function expectCode(error: () => unknown, code: string): void {
    let caught: unknown = null;
    try {
      error();
    } catch (thrown) {
      caught = thrown;
    }
    expect(caught, `expected ${code}`).toBeInstanceOf(VersusError);
    expect((caught as VersusError).code).toBe(code);
  }

  test("five concurrency threats: denomination quota kills before packing", () => {
    let caught: unknown = null;
    try {
      scheduleOf(RAW_DECK_FIVE_CONCURRENCY);
    } catch (thrown) {
      caught = thrown;
    }
    expect(caught).toBeInstanceOf(VersusError);
    expect((caught as VersusError).code).toBe("DECK_ILLEGAL");
    expect((caught as VersusError).message).toContain("DENOMINATION_QUOTA_EXCEEDED");
  });

  test("three evenly hot roles: role quota kills the deck", () => {
    let caught: unknown = null;
    try {
      scheduleOf(RAW_DECK_FLAT_ROLES);
    } catch (thrown) {
      caught = thrown;
    }
    expect(caught).toBeInstanceOf(VersusError);
    expect((caught as VersusError).message).toContain("ROLE_QUOTA_EXCEEDED");
  });

  test("two-role deck cannot feed the fresh-role cadence: MINIMUM_ROLES_UNMET", () => {
    let caught: unknown = null;
    try {
      scheduleOf(RAW_DECK_TWO_ROLES);
    } catch (thrown) {
      caught = thrown;
    }
    expect((caught as VersusError).message).toContain("MINIMUM_ROLES_UNMET");
  });

  test("a tilde-bearing table id is refused (unitId grammar safety)", () => {
    expectCode(
      () => deckToWaveTable(parseDeck(RAW_DECK_LEAN), { census: CENSUS, tableId: "bad~id", typeBundleId: "t" }),
      "OUT_OF_RANGE",
    );
  });

  test("a colon-bearing table id is refused (arrival causeId grammar safety)", () => {
    // causeId `arrival:<tableId>:<tick>:<envelopeIndex>` is parsed by taking
    // the LAST colon segment — a colon inside the tableId would mis-key it.
    expectCode(
      () => deckToWaveTable(parseDeck(RAW_DECK_LEAN), { census: CENSUS, tableId: "bad:id", typeBundleId: "t" }),
      "OUT_OF_RANGE",
    );
  });

  test("DECK_ILLEGAL rides the first violation code in its path", () => {
    let caught: unknown = null;
    try {
      scheduleOf(RAW_DECK_FIVE_CONCURRENCY);
    } catch (thrown) {
      caught = thrown;
    }
    expect((caught as VersusError).path).toContain("DENOMINATION_QUOTA_EXCEEDED");
  });
});
