/**
 * codexLadder unit tests — the save/ CodexEntry stage vocabulary driven by
 * repeat-observation counters, with the waves/ledger weather alignment.
 */

import { describe, expect, it } from "vitest";
import { DEFAULT_LEDGER_CONFIG } from "../../waves/ledger";
import {
  CODEX_LADDER_DEFAULTS,
  CODEX_STAGES,
  codexStageFor,
  isDemotedToWeather,
  nextCodexGap,
  WEATHER_DEMOTION_BAND,
} from "../codexLadder";
import { UnlocksError } from "../triggers";

describe("stage vocabulary (§5.4)", () => {
  it("mirrors save/ CodexEntry's four stages in ladder order", () => {
    expect(CODEX_STAGES).toStrictEqual(["seen", "analyzed", "countered", "mastered"]);
  });

  it("mastery threshold equals waves/ledger's masteryDemotionAfter (one number, one law)", () => {
    expect(CODEX_LADDER_DEFAULTS.masterAfterCounters).toBe(DEFAULT_LEDGER_CONFIG.masteryDemotionAfter);
    expect(WEATHER_DEMOTION_BAND).toBe("weather");
  });
});

describe("codexStageFor", () => {
  it("no sightings → not on the ladder at all", () => {
    expect(codexStageFor({ sightings: 0, counters: 0 })).toBeNull();
  });

  it("one sighting is 'seen'", () => {
    expect(codexStageFor({ sightings: 1, counters: 0 })).toBe("seen");
    expect(codexStageFor({ sightings: CODEX_LADDER_DEFAULTS.analyzeAfterSightings - 1, counters: 0 })).toBe("seen");
  });

  it("enough repeat observation without a counter reaches 'analyzed'", () => {
    expect(codexStageFor({ sightings: CODEX_LADDER_DEFAULTS.analyzeAfterSightings, counters: 0 })).toBe("analyzed");
  });

  it("any counter at least partially studied it: 'countered'", () => {
    expect(codexStageFor({ sightings: 3, counters: 1 })).toBe("countered");
    expect(codexStageFor({ sightings: 1, counters: 1 })).toBe("countered");
  });

  it("counters at the ledger threshold → 'mastered'", () => {
    expect(codexStageFor({ sightings: 9, counters: CODEX_LADDER_DEFAULTS.masterAfterCounters })).toBe("mastered");
  });

  it("counters dominate sightings at every rung (monotone ladder probe)", () => {
    let previousRank = -1;
    for (const stage of CODEX_STAGES) {
      const rank = CODEX_STAGES.indexOf(stage);
      expect(rank).toBeGreaterThan(previousRank);
      previousRank = rank;
    }
    // A counters-only path still walks seen→countered→mastered.
    expect(codexStageFor({ sightings: 1, counters: 0 })).toBe("seen");
    expect(codexStageFor({ sightings: 1, counters: 1 })).toBe("countered");
    expect(codexStageFor({ sightings: 1, counters: 5 })).toBe("mastered");
  });

  it("rejects negative or fractional counts loudly", () => {
    expect(() => codexStageFor({ sightings: -1, counters: 0 })).toThrow(UnlocksError);
    expect(() => codexStageFor({ sightings: 0, counters: -2 })).toThrow(/non-negative/);
    expect(() => codexStageFor({ sightings: 1.5, counters: 0 })).toThrow(/safe integer/);
  });

  it("config overrides move the rungs", () => {
    const cfg = { analyzeAfterSightings: 10, masterAfterCounters: 20 };
    expect(codexStageFor({ sightings: 3, counters: 0 }, cfg)).toBe("seen");
    expect(codexStageFor({ sightings: 10, counters: 0 }, cfg)).toBe("analyzed");
    expect(codexStageFor({ sightings: 10, counters: 20 }, cfg)).toBe("mastered");
  });
});

describe("nextCodexGap — the readable distance to the next rung", () => {
  it("unseen entry says 'seen' is next and needs one sighting", () => {
    expect(nextCodexGap({ sightings: 0, counters: 0 })).toStrictEqual({
      next: "seen",
      remaining: 1,
      evidence: "sightings",
    });
  });

  it("seen → analyzed gap counts remaining sightings", () => {
    const gap = nextCodexGap({ sightings: 1, counters: 0 });
    expect(gap.next).toBe("analyzed");
    expect(gap.remaining).toBe(CODEX_LADDER_DEFAULTS.analyzeAfterSightings - 1);
    expect(gap.evidence).toBe("sightings");
  });

  it("analyzed → countered needs its first counter", () => {
    expect(nextCodexGap({ sightings: 3, counters: 0 })).toStrictEqual({
      next: "countered",
      remaining: 1,
      evidence: "counters",
    });
  });

  it("countered → mastered counts remaining counters", () => {
    const gap = nextCodexGap({ sightings: 8, counters: 2 });
    expect(gap.next).toBe("mastered");
    expect(gap.remaining).toBe(CODEX_LADDER_DEFAULTS.masterAfterCounters - 2);
    expect(gap.evidence).toBe("counters");
  });

  it("mastered has no next rung — the ladder tops out", () => {
    expect(nextCodexGap({ sightings: 50, counters: 50 })).toStrictEqual({
      next: null,
      remaining: 0,
      evidence: null,
    });
  });
});

describe("isDemotedToWeather — the §5.4 retirement echo of waves/ledger", () => {
  it("matches bandAfterMastery's threshold exactly", () => {
    expect(isDemotedToWeather(4)).toBe(false);
    expect(isDemotedToWeather(5)).toBe(true);
    expect(isDemotedToWeather(99)).toBe(true);
  });

  it("rejects nonsense counts", () => {
    expect(() => isDemotedToWeather(-1)).toThrow(UnlocksError);
    expect(() => isDemotedToWeather(2.5)).toThrow(UnlocksError);
  });
});
