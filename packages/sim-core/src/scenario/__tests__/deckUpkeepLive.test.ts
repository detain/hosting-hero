/**
 * deckUpkeepLive.test.ts — L-RT (wave-30 content retune, owner-commissioned):
 * THE LIVE FIRST-BILL WITNESS. The shipped deck JSON on disk — the REAL
 * watch-the-door book with its retuned small PROVISIONAL upkeep ladder —
 * rides the L-U2 scenario seam (@304c9d0) into runScenario, six cards commit
 * through the ordinary door rail, and the L-U1 fold (@b59dbeb) bills the
 * whole book at the t420 business-month roll. This is §1.6's beat :845 —
 * "the first upkeep bill" — told end-to-end FROM CONTENT, not from a forged
 * witness card (deckRules.test.ts owns the forged-card chamber; this file
 * owns the shipped-numerics consequence).
 *
 * Witness channels (ScenarioReport exposes NO raw journal — the exact
 * causeId string `scenario:opex:<min>:rule-upkeep:mN` is fold-side authority,
 * pinned in unattended/upkeep-fold.test.ts and cited by deckRules law 5;
 * the money-exactness channels below are the house pattern):
 *  · cashStart − cashEnd EQUALS Σ(deck upkeep from disk) × 420 exactly —
 *    one bill, whole book, funded (contracts/opex are stripped, so no other
 *    money can move; economyRefusals 0 proves nothing bounced);
 *  · the t419 boundary: armed AND unarmed cash are BYTE-IDENTICAL to their
 *    openings before the roll — "no bill before the roll" is a MONEY truth;
 *    the armed-vs-unarmed DIGEST twin the brief phrased is impossible by
 *    construction (ruleBook is state-digest content — deckRules pins armed
 *    ≠ dormant at t1), so this file discharges the intent on the money
 *    channel and pins run-vs-run digest determinism instead (disclosed);
 *  · floor-first (L-U1 law): a clipped opening bounces the bill — refuse,
 *    never overdraft, cards STAY committed;
 *  · the ladder generalizes: cold-aisle (five advisory cards, Σ 35,000)
 *    bills 14,700,000 µ$ with the same harness;
 *  · the dormant world is byte-for-byte untouched: three shipped scenario
 *    wires re-derive their pre-retune b59dbeb-era digests (the literals
 *    deckRules.test.ts's roster loop pins — they arm no rules, so the
 *    retune CANNOT reach them; re-run here as the harness sanity + the
 *    31-wire/campaign byte-stand citation);
 *  · ×100 armed determinism Set.size 1 (the seam rolls no extra die; the
 *    retune changed state CONTENT, not any RNG consumption).
 *
 * All money literals below are PIN-FROM-ENGINE (probe-derived at this commit,
 * never guessed): the Σ rows are additionally derived live from the disk
 * books so a deck-value drift moves BOTH sides of every equality together
 * and the disclosed literals in this header are the falsifiable half.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { asRunSeed } from "../../types.ts";
import { bootRulesFromDeck, parsePolicyDeck, type LoadedBootRules } from "../../loader/decks.ts";
import { runScenario, SHIPPED_SCENARIO_WIRES, shippedScenario } from "../index.ts";
import { parseScenarioDoc } from "../doc.ts";

// vitest roots at packages/sim-core (era-dating.test.ts law).
const CONTENT = join(process.cwd(), "..", "content");
const BASE_SEED = asRunSeed(904n);

function readDeckBook(name: string): LoadedBootRules {
  const raw = JSON.parse(readFileSync(join(CONTENT, "decks", name), "utf8")) as unknown;
  return bootRulesFromDeck(parsePolicyDeck(raw));
}

const WATCH = readDeckBook("watch-the-door.json");
const COLD = readDeckBook("cold-aisle.json");

/** Σ upkeep derived FROM DISK — the same cards the door will commit. */
function bookSum(book: LoadedBootRules): bigint {
  let sum = 0n;
  for (const entry of book.entries) sum += entry.card.upkeepMicroUsd;
  return sum;
}

const WATCH_SUM = bookSum(WATCH); // ladder: 3×25k execute + 40k wall + 5k inform + 10k consult
const COLD_SUM = bookSum(COLD); // 3×5k inform + 2×10k consult — all advisory
const ROLL_MINUTE = 420;

/* ───────────────────────── the doc forge (host-side chamber) ─────────────────────────
 * long-weekend rebased into a clean live-deck chamber (deckRules.test.ts's
 * precedent, widened to the six-card book): NO contracts, NO authored opex,
 * no guards unless an arm names one, a clock past the first roll, and a rail
 * committing EVERY shipped card of the book at ticks 1..6 (1 hand / 1 tick
 * commit law; one per tick so even a capacity of 1 drains the rail cleanly
 * before any rule crossing can compete for hands). Win is survive-2880 —
 * unreachable under the clock, so both arms time out at the boundary:
 * no objective dice. */

function liveDoc(
  book: LoadedBootRules,
  initialFreeMicroUsd: number,
  maxSimMinutes: number,
  opts: { guards?: boolean } = {},
): ReturnType<typeof parseScenarioDoc> {
  const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES["the-long-weekend"])) as Record<string, unknown>;
  wire.contracts = [];
  wire.objectives = { win: [{ kind: "survive-minutes", minutes: 2880 }], lose: [] };
  const limits = wire.limits as Record<string, unknown>;
  limits.opex = [];
  limits.initialFreeMicroUsd = initialFreeMicroUsd;
  limits.maxSimMinutes = maxSimMinutes;
  limits.guardrails = opts.guards === true ? [{ type: "freeCashDepleted", sustainedMin: 1 }] : [];
  wire.intents = book.entries.map((entry, index) => ({
    atTick: index + 1,
    verb: "policy-card-commit",
    args: { cardHash: entry.hash },
  }));
  return parseScenarioDoc(wire as never);
}

/* ─────────────────────────────── the suite ─────────────────────────────── */

describe("L-RT the first REAL bill — shipped watch-the-door books itself at t420", () => {
  const FUNDED = 75_000_000; // $75 in µ$ — comfortably above the $54.60 bill
  const doc = liveDoc(WATCH, FUNDED, 430);

  it("the disk book sums to the disclosed ladder: Σ 130,000 µ$/sim-min", () => {
    expect(WATCH_SUM).toBe(130_000n);
    expect(COLD_SUM).toBe(35_000n);
    // The bill the roll must print, derived from disk × the accrual window:
    expect(WATCH_SUM * BigInt(ROLL_MINUTE)).toBe(54_600_000n);
  });

  it("armed: six commits land by t6, and t420 prints EXACTLY one bill of 54,600,000 µ$", () => {
    const armed = runScenario(doc, BASE_SEED, { rules: WATCH });
    expect(armed.stopReason).toBe("timeout@430");
    expect(armed.rulesArmed).toHaveLength(6);
    expect(armed.observation.intentsExecutedByVerb["policy-card-commit"]).toBe(6);
    expect(armed.cashStartMicroUsd).toBe(BigInt(FUNDED));
    expect(armed.cashEndMicroUsd).toBe(BigInt(FUNDED) - 54_600_000n);
    expect(armed.trace.economyRefusals).toBe(0); // funded — nothing bounced
    // The dormant twin never bills (no book ⇒ Σ = 0 ⇒ deriveUpkeepDraft null):
    const dormant = runScenario(doc, BASE_SEED, {});
    expect(dormant.cashEndMicroUsd).toBe(BigInt(FUNDED));
    expect(dormant.trace.economyRefusals).toBe(0);
    expect(dormant.observation.intentsRefusedByVerb["policy-card-commit"]).toBe(6); // the no-lookup word
    // STATE-digest consequence (the motion the proto projection wire cannot see):
    expect(armed.endDigest).not.toBe(dormant.endDigest);
  });

  it("the t419 boundary: NO bill before the roll — armed and unarmed cash byte-identical to opening", () => {
    // Money-channel discharge of "no bill before the roll" (the digest-level
    // unarmed-vs-armed twin is impossible BY CONSTRUCTION — ruleBook is
    // state-digest content and deckRules pins armed ≠ dormant from t1; the
    // determinism half is pinned here and in the ×100 leg).
    const before = liveDoc(WATCH, FUNDED, 419);
    const armed = runScenario(before, BASE_SEED, { rules: WATCH });
    const dormant = runScenario(before, BASE_SEED, {});
    expect(armed.stopReason).toBe("timeout@419");
    expect(armed.cashEndMicroUsd).toBe(BigInt(FUNDED));
    expect(dormant.cashEndMicroUsd).toBe(BigInt(FUNDED));
    expect(armed.cashEndMicroUsd).toBe(dormant.cashEndMicroUsd); // the byte-equal money twin
    expect(armed.trace.economyRefusals).toBe(0);
    // Run-vs-run digest determinism on the pre-roll boundary arm:
    expect(runScenario(before, BASE_SEED, { rules: WATCH }).endDigest).toBe(armed.endDigest);
  });

  it("floor-first on-scene with REAL content: a clipped bankroll bounces the bill — money stands, cards stay", () => {
    // 5,000,000 µ$ ($5) < the 54,600,000 µ$ bill: the fold REFUSES the draft
    // (never clamps, never overdrafts, never sheds a card — L-U1 law). The
    // freeCashDepleted guard (sustainedMin 1) then halts the run at the roll.
    const clipped = liveDoc(WATCH, 5_000_000, 430, { guards: true });
    const armed = runScenario(clipped, BASE_SEED, { rules: WATCH });
    expect(armed.outcome).toBe("lost");
    expect(armed.stopReason).toMatch(/^guard:freeCashDepleted@4(2[0-9]|30)$/);
    expect(armed.cashEndMicroUsd).toBe(5_000_000n); // refuse-not-clamp: ledger UNTOUCHED
    expect(armed.trace.economyRefusals).toBe(1); // exactly the one bounced bill
    expect(armed.observation.intentsExecutedByVerb["policy-card-commit"]).toBe(6); // the book STAYS committed
    // The dormant twin never bounces and rides the clock out:
    const dormant = runScenario(clipped, BASE_SEED, {});
    expect(dormant.trace.economyRefusals).toBe(0);
    expect(dormant.cashEndMicroUsd).toBe(5_000_000n);
  });

  it("the ladder generalizes: cold-aisle (all-advisory, Σ 35,000) bills 14,700,000 µ$", () => {
    const cold = liveDoc(COLD, 20_000_000, 430);
    const armed = runScenario(cold, BASE_SEED, { rules: COLD });
    expect(armed.rulesArmed).toHaveLength(5);
    expect(armed.observation.intentsExecutedByVerb["policy-card-commit"]).toBe(5);
    expect(armed.cashEndMicroUsd).toBe(20_000_000n - 14_700_000n);
    expect(armed.trace.economyRefusals).toBe(0);
    // Advisory bands mint no intents — the bill is ROSTER law, not fire law:
    const dormant = runScenario(cold, BASE_SEED, {});
    expect(armed.trace.arrivals).toBe(dormant.trace.arrivals);
    expect(armed.trace.served).toBe(dormant.trace.served);
  });

  it("armed run is ×100 byte-deterministic (the retune moved state CONTENT, no RNG)", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) digests.add(runScenario(doc, BASE_SEED, { rules: WATCH }).endDigest);
    expect(digests.size).toBe(1);
  }, 180_000);
});

describe("L-RT the dormant world is untouched — shipped wires re-derive their pre-retune digests", () => {
  it("three shipped wires (rules-UNARMED by construction) byte-stand at their standing literals", () => {
    // The literals are deckRules.test.ts's roster byte-stand set (b59dbeb-era,
    // worktree-captured there). No shipped scenario wire or campaign chapter
    // arms a rules leg (config.rules is a host seam; the 31 shipped wires +
    // the campaign arcs mint no policy-card-commit rails and pass no book —
    // the deck values CANNOT reach them by construction), and this re-run is
    // the harness sanity the brief demands. All 31 + the arc hexes stand in
    // their own standing files; deckRules.test.ts:468-486 is THE roster loop.
    expect(runScenario(shippedScenario("the-not-invented-yet"), BASE_SEED, {}).endDigest).toBe(
      "6aecd417c317a910c75e37f4da14b272",
    );
    const weekend = runScenario(shippedScenario("the-long-weekend"), BASE_SEED, {});
    expect(weekend.endDigest).toBe("ee277ee1b9719a1ce412fd0a3564eebb");
    expect(weekend.stopReason).toBe("win@240");
    const sunday = runScenario(shippedScenario("understaffed-sunday"), BASE_SEED, {});
    expect(sunday.endDigest).toBe("df1538b3baabe2e93fa79799a6830230");
    expect(sunday.stopReason).toBe("win@40");
    for (const report of [weekend, sunday]) expect(report.rulesArmed).toBeUndefined();
  });
});
