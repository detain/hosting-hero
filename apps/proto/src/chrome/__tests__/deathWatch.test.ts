/**
 * deathWatch (batch-E v0) — the wire-rider reader for the OD-25(a) ladder.
 * Parsing, monotone phase extraction, the cause mirror's drift pin against
 * the ENGINE source, and the sober §9.9 provisional voices.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { EventNotice, NoticeKind } from "../../shared/protocol";
import {
  ADJUST_PRICE_VERB,
  CAUSAL_EPILOGUE,
  CAUSE_UNKNOWN_EPILOGUE,
  COMPANY_DEATH_CAUSES,
  DEATH_ENGINE_KINDS,
  DEATH_WATCH_VOICE,
  DISSOLVED_HEADLINE,
  extractDeathCause,
  extractDeathPhase,
  isPricingReceipt,
  parseDeathRider,
} from "../deathWatch";

function rider(kind: NoticeKind, detail?: string): EventNotice {
  return { kind, laneId: null, atUs: 1000n, ...(detail === undefined ? {} : { detail }) };
}

describe("parseDeathRider", () => {
  it("only economy-notice death riders parse; everything else is null", () => {
    expect(parseDeathRider(rider("bounce", "death-imminent:company"))).toBeNull();
    expect(parseDeathRider(rider("economy-notice"))).toBeNull();
    expect(parseDeathRider(rider("economy-notice", "no-colon"))).toBeNull();
    expect(parseDeathRider(rider("economy-notice", "dunning-stage:c-9"))).toBeNull();
    expect(parseDeathRider(rider("economy-notice", "late-payment:company"))).toBeNull();
  });

  it("the two-segment wire shape (today's runner) parses with cause null", () => {
    const imminent = parseDeathRider(rider("economy-notice", "death-imminent:company"));
    expect(imminent).not.toBeNull();
    expect(imminent!.phase).toBe("notice");
    expect(imminent!.contractId).toBe("company");
    expect(imminent!.cause).toBeNull();
    const dead = parseDeathRider(rider("economy-notice", "company-dissolved:company"));
    expect(dead!.phase).toBe("dissolved");
    expect(dead!.contractId).toBe("company");
  });

  it("forward-compat: a widened detail names the cause with NO chrome change", () => {
    // three-segment kind:contract:cause …
    expect(
      parseDeathRider(rider("economy-notice", "death-imminent:company:float-insolvency"))!.cause,
    ).toBe("float-insolvency");
    // … or the full engine causeId riding any later segment (a causeId field
    // concatenated into the detail by a future runner build).
    expect(
      parseDeathRider(
        rider("economy-notice", "company-dissolved:company:economy:death:dissolved:churn-collapse:5760"),
      )!.cause,
    ).toBe("churn-collapse");
    // a non-cause token after the contract stays honest: null, never guessed.
    expect(
      parseDeathRider(rider("economy-notice", "death-imminent:company:whatever"))!.cause,
    ).toBeNull();
  });
});

describe("extractDeathPhase / extractDeathCause", () => {
  const others = [rider("economy-notice", "late-payment:c-1"), rider("bounce")];

  it("quiet frames are quiet", () => {
    expect(extractDeathPhase(others)).toBeNull();
    expect(extractDeathCause(others)).toBeNull();
  });

  it("dissolved wins regardless of notice order (the ladder cannot un-die)", () => {
    const both = [
      rider("economy-notice", "company-dissolved:company"),
      ...others,
      rider("economy-notice", "death-imminent:company"),
    ];
    expect(extractDeathPhase(both)).toBe("dissolved");
    const reversed = [...both].reverse();
    expect(extractDeathPhase(reversed)).toBe("dissolved");
  });

  it("imminent alone reads as the notice rung", () => {
    expect(extractDeathPhase([rider("economy-notice", "death-imminent:company")])).toBe("notice");
  });
});

describe("cause mirror vs the ENGINE (drift pin)", () => {
  it("chrome's mirror equals economy/death.ts COMPANY_DEATH_CAUSES verbatim", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../../../../../packages/sim-core/src/economy/death.ts", import.meta.url)),
      "utf8",
    );
    const match = /COMPANY_DEATH_CAUSES[\s\S]*?Object\.freeze\(\[([^\]]*)\]/.exec(source);
    expect(match).not.toBeNull();
    const engine = [...match![1]!.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]);
    expect(engine.length).toBeGreaterThanOrEqual(3);
    expect([...COMPANY_DEATH_CAUSES]).toEqual(engine);
  });

  it("the phase ladder mirror matches the two engine notice kinds", () => {
    const source = readFileSync(
      fileURLToPath(new URL("../../../../../packages/sim-core/src/economy/tick.ts", import.meta.url)),
      "utf8",
    );
    expect(source).toContain('"death-imminent"');
    expect(source).toContain('"company-dissolved"');
    expect(DEATH_ENGINE_KINDS["death-imminent"]).toBe("notice");
    expect(DEATH_ENGINE_KINDS["company-dissolved"]).toBe("dissolved");
    expect(Object.keys(DEATH_ENGINE_KINDS)).toHaveLength(2);
  });
});

describe("provisional voices (§9.9 sober, §9.3 no comedy at loss)", () => {
  it("every cause has an epilogue; keys are exactly the closed mirror", () => {
    expect(Object.keys(CAUSAL_EPILOGUE).sort()).toEqual([...COMPANY_DEATH_CAUSES].sort());
    for (const line of Object.values(CAUSAL_EPILOGUE)) {
      expect(line.length).toBeGreaterThan(60);
      expect(line).not.toMatch(/[!]/); // dry statements, never exclamations
    }
  });

  it("the unknown-cause line admits the seam instead of inventing a cause", () => {
    expect(CAUSE_UNKNOWN_EPILOGUE).toContain("does not name its cause");
    expect(DISSOLVED_HEADLINE).toBe("The company is dissolved.");
    expect(DEATH_WATCH_VOICE.headline).toBe("Death watch armed");
  });
});

describe("isPricingReceipt", () => {
  it("reads the door's pricing verdicts off the notice stream", () => {
    expect(isPricingReceipt(rider("intent-executed", ADJUST_PRICE_VERB))).toBe(true);
    expect(isPricingReceipt(rider("intent-refused", `${ADJUST_PRICE_VERB}: invalid-price`))).toBe(true);
    expect(isPricingReceipt(rider("intent-executed", "connect-ports"))).toBe(false);
    expect(isPricingReceipt(rider("intent-executed"))).toBe(false);
    expect(isPricingReceipt(rider("economy-notice", ADJUST_PRICE_VERB))).toBe(false);
  });
});
