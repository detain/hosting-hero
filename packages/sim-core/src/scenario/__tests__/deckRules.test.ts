/**
 * deckRules.test.ts — L-U2 (owner ruling 2026-10-19 (iv), RATIFIED): the
 * SCENARIO DECK SEAM. `ScenarioRunConfig.rules` carries host-resolved
 * `boot.rules` entries (bootRulesFromDeck output verbatim) into the door as
 * `lookupPolicyCard`, so a scenario can finally arm a policy book — and,
 * per the owner's own sentence, "this is where upkeep first bites": a card
 * committed through the seam lands in `state.ruleBook` and the L-U1 fold
 * bills its upkeepMicroUsd on the business-month roll.
 *
 * Laws pinned here:
 *  1. THE BOOK IS HOST CONFIG, NEVER DOC DATA (era/sellMarketRates world-fact
 *     posture) — the leg rides ScenarioRunConfig; the PRE-TICK-1 BAD_RULES
 *     walls (empty book / duplicate hash naming BOTH positions / a card
 *     failing validatePolicyCard) all speak the plain-Error config grammar.
 *  2. UNARMED ≡ THE OLD WORLD (byte-stand law): the door key is a CONDITIONAL
 *     spread, so an unarmed run grows nothing. The pre-seam literals were
 *     captured at b59dbeb in a detached worktree (temporary probe, disclosed
 *     method): three shipped wires AND the dormant twin of this file's forged
 *     upkeep doc — the base probe even fed the OLD runner a `rules` leg and
 *     proved it was ignored (d1.digest === d0.digest there). All prior-arc
 *     campaign digests (b4f7777519ebc0a8 in chapters.test.ts) ride unarmed
 *     by construction and stand in their own files; the eraless shipped wire
 *     here re-pins eraTransitions.test.ts's 6aecd417… literal to the hex.
 *  3. COMMIT SEMANTICS UNCHANGED: 1 hand / 1 tick, door-maintained whole-book
 *     hash — the M3 fold is COPY-vs-REFERENCE here: this file transcribes the
 *     documented algorithm (fingerprint walk + code-unit-sorted fold) and
 *     pins the door-maintained state.ruleBookHash against it.
 *  4. THE COMPOSITION CHAIN HOLDS OVER THE BOOK: perspective
 *     `lookupPolicyCards: false` STRIPS the armed book (seat beats host;
 *     door-altitude forged spec — every v0 roster seat that strips ALSO
 *     verb-bans commit, pinned scenario-side as support-queue), and an era
 *     plan greying a card id answers `unknown-card-hash` — the activation
 *     disclosure: before this seam composeEraPlan never received
 *     `policyCards` from the runner, so era grey-out of cards was DEAD in
 *     scenarios; `eraPolicyCards` + `rules` light it end-to-end. Grey is
 *     OPENING-year frozen (L-ER-T law, both directions re-pinned at the door).
 *  5. THE FIRST BITE: committed 25,000 µ$/sim-min ⇒ EXACTLY ONE bill of
 *     10,500,000 µ$ at the t420 month roll (retroactive accrual window
 *     420 − 0; causeId `scenario:opex:420:rule-upkeep:m1` — the string
 *     itself is pinned fold-side in unattended/upkeep-fold.test.ts). The
 *     card never FIRES (threshold 10000× the reachable ρ) — billing is
 *     roster law, not fire law (arrival census byte-equal across arms).
 *     Floor-first (L-U1 law): a clipped opening BOUNCES the bill — money
 *     never moves, the OPEX-REFUSED census counts it, the card never sheds.
 *  6. THE ECHO IS THE ARMED BOOK: `rulesArmed` lists host entries verbatim
 *     in host order; it survives a strip (it reports the seam, not the
 *     seat's verdict) and is ABSENT for every unarmed run (sparse-key law).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { asMetricId, asMoney, asRuleId, asRunSeed } from "../../types.ts";
import type { ExternalIntent, GameState, PolicyCard, TickContext } from "../../types.ts";
import { applyIntentDoor, createBoardState, createInitialState } from "../../pipeline/index.ts";
import type { IntentDoorConfig } from "../../pipeline/index.ts";
import { MICROS_PER_MIN, initialClocks } from "../../kernel/time.ts";
import { compareCodeUnits, fnv1a64OverCodePoints } from "../../internal/canonical.ts";
import { loadTypeBundle } from "../../loader/bundle.ts";
import type { LoadedTypeBundle } from "../../loader/bundle.ts";
import type { LoadedBootRules } from "../../loader/decks.ts";
import { runScenario, SHIPPED_SCENARIO_WIRES, shippedScenario } from "../index.ts";
import { parseScenarioDoc } from "../doc.ts";
import { applyPerspectiveToDoorConfig, PERSPECTIVE_V0 } from "../perspective.ts";
import { applyEraAvailabilityToDoorConfig, composeEraPlan } from "../eraAvailability.ts";

// vitest roots at packages/sim-core (era-dating.test.ts law).
const CONTENT = join(process.cwd(), "..", "content");
const BASE_SEED = asRunSeed(904n);

function readTypeWire(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(CONTENT, "types", name + ".json"), "utf8")) as Record<string, unknown>;
}

const SHARED_WEB: LoadedTypeBundle = loadTypeBundle(readTypeWire("shared-web"));

/* ─────────────────────────── the forged book ───────────────────────────
 * A HOST-OWNED hash literal, never a shipped deck's deckCardHash (brief law:
 * real deck hashes are not imported as authority here). The card mirrors the
 * shipped watch-the-door edge-object scope (read-only cite of the content
 * shape, packages/content/decks/watch-the-door.json) with upkeep 25_000 µ$
 * per sim-minute and a 10000×-unreachable ρ threshold: committed, billed,
 * SILENT — upkeep is roster law, not fire law. */

const WITNESS_HASH = "lu2-witness-hash-0001";
const WITNESS_CARD: PolicyCard = {
  id: asRuleId("rule-upkeep-witness"),
  scope: { kind: "object", ref: "edge" },
  when: [
    {
      metric: asMetricId("rho-edge"),
      comparator: ">",
      threshold: { kind: "value", amount: 9_999_999_999n, unit: "percent" },
    },
  ],
  then: [{ id: "page", runbookName: null, value: null }],
  band: "inform",
  upkeepMicroUsd: asMoney(25_000n),
};
const BOOK: LoadedBootRules = Object.freeze({
  entries: Object.freeze([Object.freeze({ hash: WITNESS_HASH, card: WITNESS_CARD })]),
});

/* ───────────────────────── the doc forge (host-side) ─────────────────────────
 * long-weekend rebased into a clean upkeep chamber: NO contracts, NO authored
 * opex, NO guards (test 4 arms one), a clock past the first business-month
 * roll (t420), and a single rail line committing the witness card at tick 1.
 * The win line is survive-2880 — unreachable under the 430 clock, so the
 * armed/dormant arms always time out at the boundary (no objective dice). */

const UPKEEP_OPENING_MICRO_USD = 20_000_000;
const UPKEEP_WINDOW_MINUTES = 420;
const UPKEEP_AMOUNT_MICRO_USD = 10_500_000n; // 25_000n × 420 — exact

function upkeepDoc(
  initialFree: number,
  opts: { guards?: boolean; perspective?: string } = {},
): ReturnType<typeof parseScenarioDoc> {
  const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES["the-long-weekend"])) as Record<string, unknown>;
  wire.contracts = [];
  wire.objectives = { win: [{ kind: "survive-minutes", minutes: 2880 }], lose: [] };
  const limits = wire.limits as Record<string, unknown>;
  limits.opex = [];
  limits.initialFreeMicroUsd = initialFree;
  limits.maxSimMinutes = 430;
  limits.guardrails = opts.guards === true ? [{ type: "freeCashDepleted", sustainedMin: 1 }] : [];
  wire.intents = [{ atTick: 1, verb: "policy-card-commit", args: { cardHash: WITNESS_HASH } }];
  if (opts.perspective !== undefined) wire.perspective = { id: opts.perspective };
  return parseScenarioDoc(wire as never);
}

/* ─────────────── copy-vs-reference: the M3 fold, transcribed ───────────────
 * A transcription of the documented door fold (intent-door.ts M3 header),
 * NOT a reference to it — the door keeps the only authority; this is the
 * falsifier that reddens if its walk drifts. */

function testCardFingerprint(card: PolicyCard): string {
  const parts: string[] = [card.id, card.scope.kind, card.scope.ref ?? "∅", card.band, String(card.upkeepMicroUsd)];
  for (const predicate of card.when) {
    const t = predicate.threshold;
    parts.push(predicate.metric, predicate.comparator, t.kind);
    if (t.kind === "value") parts.push(String(t.amount), t.unit);
    else if (t.kind === "class-ref") parts.push(t.classId);
    else parts.push(t.name);
  }
  for (const action of card.then) {
    parts.push(action.id, action.runbookName ?? "∅", String(action.value ?? -1n));
  }
  return fnv1a64OverCodePoints(parts.join("\u0000"));
}

function testFoldRuleBookHash(book: readonly PolicyCard[]): string {
  const sorted = [...book].sort((a, b) => compareCodeUnits(a.id, b.id));
  return fnv1a64OverCodePoints(sorted.map((card) => `${card.id}\u0000${testCardFingerprint(card)}`).join("\u0001"));
}

/* ─────────────────────────── door-altitude twin ─────────────────────────── */

function ctxAtBusinessMinute(tick: bigint, businessMinute: number): TickContext {
  return Object.freeze({
    tick,
    minute: Number(tick),
    clocks: Object.freeze({ ...initialClocks(), businessUs: BigInt(businessMinute) * MICROS_PER_MIN }),
  });
}

function commitIntent(tick: bigint, seq: number): unknown {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MICROS_PER_MIN,
      origin: "player" as const,
      payload: Object.freeze({
        kind: "player-verb" as const,
        args: Object.freeze({ verb: "policy-card-commit", cardHash: WITNESS_HASH }),
      }),
    }),
  });
}

function sweepState(): GameState {
  return createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "test-deck-rules",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [],
    handCapacity: 2,
    board: createBoardState(),
  });
}

const BASE_LOOKUP = (hash: string) => (hash === WITNESS_HASH ? WITNESS_CARD : null);
const COMMITTED_BASE: IntentDoorConfig = Object.freeze({ handCapacity: 2, lookupPolicyCard: BASE_LOOKUP });

/** §1.6-style forged availability row (eraTransitions.test.ts pattern):
 *  a tech that OPENS in 2026 — greyed under an eraYear-1998 opening. */
function forgedPolicyTechBundle(): LoadedTypeBundle {
  const raw = JSON.parse(JSON.stringify(readTypeWire("shared-web"))) as Record<string, unknown>;
  (raw.eras as Record<string, unknown>).availability = { "policy-target-tech": { from: "2026" } };
  return loadTypeBundle(raw);
}
const CARD_TO_TECH = new Map<string, string>([["rule-upkeep-witness", "policy-target-tech"]]);

function receiptReason(result: ReturnType<typeof applyIntentDoor>): string {
  const receipt = result.receipts.find((r) => r.seq === 0);
  if (receipt === undefined) throw new Error("expected a door receipt");
  return receipt.outcome === "refused" ? String(receipt.reason) : `EXECUTED detail=${String(receipt.detail)}`;
}

/* ─────────────────────────────── the suite ─────────────────────────────── */

describe("L-U2 armed seam — the deck lights the door lookup (door altitude, copy-vs-reference)", () => {
  it("an armed lookup executes the commit and the door maintains the M3 whole-book fold", () => {
    const state0 = sweepState();
    // Dormant door first: today's exact refusal phrase (the pre-seam world).
    const dormant = applyIntentDoor(
      state0,
      ctxAtBusinessMinute(1n, 0),
      [commitIntent(1n, 0)] as unknown as ExternalIntent[],
      Object.freeze({ handCapacity: 2 }),
    );
    expect(dormant.receipts[0]?.outcome).toBe("refused");
    expect(String(dormant.receipts[0]?.reason)).toBe("no-card-lookup: host wired no lookupPolicyCard");
    // Armed door: the same rail line EXECUTES through the host book.
    const armed = applyIntentDoor(
      state0,
      ctxAtBusinessMinute(1n, 0),
      [commitIntent(1n, 0)] as unknown as ExternalIntent[],
      COMMITTED_BASE,
    );
    const receipt = armed.receipts[0];
    expect(receipt?.outcome).toBe("executed");
    expect(receipt?.detail).toBe("rule=rule-upkeep-witness");
    const book = armed.state.ruleBook ?? [];
    expect(book.length).toBe(1);
    expect(book[0]?.id).toBe("rule-upkeep-witness");
    // COPY-VS-REFERENCE: the transcribed M3 fold equals the door's own.
    expect(armed.state.ruleBookHash).toBe(testFoldRuleBookHash(book));
    expect(armed.state.ruleBookHash).not.toBeNull();
    // A hash the book does not hold answers the door's unknown-card-hash.
    const ghost = applyIntentDoor(
      state0,
      ctxAtBusinessMinute(1n, 0),
      [
        {
          tick: 1n,
          intent: {
            seq: 0,
            clock: "sim",
            atUs: MICROS_PER_MIN,
            origin: "player",
            payload: { kind: "player-verb", args: { verb: "policy-card-commit", cardHash: "not-in-the-book" } },
          },
        },
      ] as unknown as ExternalIntent[],
      COMMITTED_BASE,
    );
    expect(String(ghost.receipts[0]?.reason)).toBe('unknown-card-hash: "not-in-the-book"');
  });
});

describe("L-U2 runScenario — armed, dormant, and the first upkeep bite", () => {
  it("armed executes at t1, echoes the book, and the digest moves vs dormant", () => {
    const doc = upkeepDoc(UPKEEP_OPENING_MICRO_USD);
    const armed = runScenario(doc, BASE_SEED, { rules: BOOK });
    expect(armed.stopReason).toBe("timeout@430");
    expect(armed.observation.intentsExecutedByVerb["policy-card-commit"]).toBe(1);
    expect(armed.rulesArmed).toEqual([{ hash: WITNESS_HASH, cardId: "rule-upkeep-witness" }]);
    const dormant = runScenario(doc, BASE_SEED, {});
    expect(dormant.rulesArmed).toBeUndefined();
    expect(Object.hasOwn(dormant, "rulesArmed")).toBe(false);
    expect(armed.endDigest).not.toBe(dormant.endDigest);
  });

  it("THE FIRST BITE: one committed 25,000 µ$/min card bills exactly 10,500,000 µ$ at the t420 roll", () => {
    const doc = upkeepDoc(UPKEEP_OPENING_MICRO_USD);
    const armed = runScenario(doc, BASE_SEED, { rules: BOOK });
    const dormant = runScenario(doc, BASE_SEED, {});
    // The bill is the ONLY money move (no contracts, no authored opex):
    // dormant cash stands, armed cash drops by the exact retroactive accrual
    // 25_000 µ$/min × (420 − 0) min = 10_500_000 µ$, causeId
    // `scenario:opex:420:rule-upkeep:m1` (string authority: tickFold +
    // unattended/upkeep-fold.test.ts).
    expect(dormant.cashStartMicroUsd).toBe(BigInt(UPKEEP_OPENING_MICRO_USD));
    expect(dormant.cashEndMicroUsd).toBe(BigInt(UPKEEP_OPENING_MICRO_USD));
    expect(armed.cashEndMicroUsd).toBe(BigInt(UPKEEP_OPENING_MICRO_USD) - UPKEEP_AMOUNT_MICRO_USD);
    expect(dormant.cashEndMicroUsd - armed.cashEndMicroUsd).toBe(UPKEEP_AMOUNT_MICRO_USD);
    expect(dormant.trace.economyRefusals).toBe(0);
    expect(armed.trace.economyRefusals).toBe(0); // funded — nothing bounced
    // SILENT book: the card never fires (upkeep is roster law, not fire law),
    // so the traffic census is byte-equal across the arms.
    expect(armed.trace.arrivals).toBe(dormant.trace.arrivals);
    expect(armed.trace.served).toBe(dormant.trace.served);
  });

  it("floor-first on-scene: a clipped opening bounces the bill — money stands, the refusal is counted", () => {
    // 5,000,000 µ$ free < the 10,500,000 µ$ bill: the L-U1 fold REFUSES the
    // draft (never clamps, never overdrafts, never sheds the card). The
    // freeCashDepleted guard (sustainedMin 1) then halts the run the moment
    // the refusal arms it.
    const doc = upkeepDoc(5_000_000, { guards: true });
    const armed = runScenario(doc, BASE_SEED, { rules: BOOK });
    expect(armed.outcome).toBe("lost");
    expect(armed.stopReason).toMatch(/^guard:freeCashDepleted@4(2[0-9]|30)$/);
    expect(armed.cashEndMicroUsd).toBe(5_000_000n); // refuse-not-clamp: the ledger is UNTOUCHED
    expect(armed.trace.economyRefusals).toBe(1); // ×1-from-m420 OPEX-REFUSED census
    expect(armed.observation.intentsExecutedByVerb["policy-card-commit"]).toBe(1); // the card STAYS committed
    // The dormant twin never bounces (no bill exists to bounce) and the
    // guard never arms: money-only, it rides to the clock boundary intact.
    const dormant = runScenario(doc, BASE_SEED, {});
    expect(dormant.trace.economyRefusals).toBe(0);
    expect(dormant.cashEndMicroUsd).toBe(5_000_000n);
  });

  it("dormant byte-stand: the pre-seam b59dbeb digest holds to the hex (worktree-captured literal)", () => {
    // Captured at b59dbeb in a detached worktree BEFORE any seam edit — the
    // base probe additionally fed the OLD runner a `rules` leg and got the
    // IDENTICAL digest (the leg was unknown config there, proving exactly
    // what the conditional spread promises today).
    const PRE_SEAM_DORMANT = "8aca5ba270e51597bece5fafca361122";
    const report = runScenario(upkeepDoc(UPKEEP_OPENING_MICRO_USD), BASE_SEED, {});
    expect(report.endDigest).toBe(PRE_SEAM_DORMANT);
    expect(report.observation.intentsRefusedByVerb["policy-card-commit"]).toBe(1);
  });

  it("the armed wire is ×100 byte-deterministic (the seam rolls no extra die)", () => {
    const doc = upkeepDoc(UPKEEP_OPENING_MICRO_USD);
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      digests.add(runScenario(doc, BASE_SEED, { rules: BOOK }).endDigest);
    }
    expect(digests.size).toBe(1);
  }, 120_000);
});

describe("L-U2 BAD_RULES — the pre-tick-1 walls die before the first die", () => {
  const doc = upkeepDoc(UPKEEP_OPENING_MICRO_USD);
  const run = (rules: unknown) => runScenario(doc, BASE_SEED, { rules } as never);

  it("an empty book is refused as a host bug", () => {
    expect(() => run({ entries: [] })).toThrow(
      /scenario\[BAD_RULES\] at 'runScenario\.rules': an empty book is a host bug/,
    );
  });

  it("a duplicate hash throws naming BOTH positions (L-BR1 codec posture)", () => {
    const dup = {
      entries: [
        { hash: "same-hash", card: WITNESS_CARD },
        { hash: "other-hash", card: { ...WITNESS_CARD, id: asRuleId("rule-mid") } },
        { hash: "same-hash", card: { ...WITNESS_CARD, id: asRuleId("rule-late") } },
      ],
    };
    expect(() => run(dup)).toThrow(
      /scenario\[BAD_RULES\] at 'runScenario\.rules\.entries\[2\]': duplicate card hash "same-hash" at entries\[0\] and entries\[2\]/,
    );
  });

  it("a card failing validatePolicyCard throws naming the position, grammar message and all", () => {
    const broken = { ...WITNESS_CARD, scope: { kind: "nowhere" as never, ref: null as never } };
    expect(() => run({ entries: [{ hash: "ok-hash", card: broken }] })).toThrow(
      /scenario\[BAD_RULES\] at 'runScenario\.rules\.entries\[0\]\.card': .* is not in the closed enum/s,
    );
    // And the walls are PRE-dice: nothing ran (the doc still times out clean
    // once the book is legal — the execute arm above is that witness).
  });
});

describe("L-U2 composition — the seat and the world answer over the armed book", () => {
  it("a stripping seat beats the host book (door twin) and the roster's stripping seats ban the verb outright (scenario twin)", () => {
    // DOOR ALTITUDE: the honest strip witness needs a ZERO-BAN spec that
    // strips — no v0 roster seat is that (support-queue/datacenter-tech ban
    // the commit VERB itself, refuse.verbs outranking the lookup axis), so
    // the strip law is forged from the apprentice row: see-the-book TRUE
    // flipped to FALSE with no verb bans. The armed book is REPLACED, and
    // the refusal speaks the lookup grammar, not perspective-forbids.
    const stripSpec = { ...PERSPECTIVE_V0["apprentice"], refuse: Object.freeze({ verbs: [] as never[] }), lookupPolicyCards: false };
    const stripped = applyPerspectiveToDoorConfig(COMMITTED_BASE, stripSpec);
    const result = applyIntentDoor(
      sweepState(),
      ctxAtBusinessMinute(1n, 0),
      [commitIntent(1n, 0)] as unknown as ExternalIntent[],
      stripped,
    );
    expect(receiptReason(result)).toBe('unknown-card-hash: "lu2-witness-hash-0001"');
    // And a NON-stripping seat (apprentice TRUE) leaves the armed book intact:
    const sees = applyPerspectiveToDoorConfig(COMMITTED_BASE, { ...PERSPECTIVE_V0["apprentice"], refuse: Object.freeze({ verbs: [] as never[] }) });
    const seesResult = applyIntentDoor(
      sweepState(),
      ctxAtBusinessMinute(1n, 0),
      [commitIntent(1n, 0)] as unknown as ExternalIntent[],
      sees,
    );
    expect(seesResult.receipts[0]?.outcome).toBe("executed");
    // SCENARIO ALTITUDE: under support-queue the commit refuses DESPITE the
    // armed book — its 17-verb ban set names policy-card-commit (L-PERS),
    // so the ban outranks the seam before the lookup is ever consulted. The
    // echo still reports the host posture: armed. Stripped, not silent.
    const doc = upkeepDoc(UPKEEP_OPENING_MICRO_USD, { perspective: "support-queue" });
    const report = runScenario(doc, BASE_SEED, { rules: BOOK });
    expect(report.observation.intentsRefusedByVerb["policy-card-commit"]).toBe(1);
    expect(report.observation.intentsExecutedByVerb["policy-card-commit"]).toBeUndefined();
    expect(report.rulesArmed).toEqual([{ hash: WITNESS_HASH, cardId: "rule-upkeep-witness" }]);
    expect(report.cashEndMicroUsd).toBe(BigInt(UPKEEP_OPENING_MICRO_USD)); // refused ⇒ never committed ⇒ never billed
  });

  it("era grey ACTIVATES through the seam: a greyed card refuses on-scene, the same card at its own year executes and bills", () => {
    const cards = new Map(CARD_TO_TECH);
    const doc = upkeepDoc(UPKEEP_OPENING_MICRO_USD);
    // 1998 opening + host card→tech map: the witness id is greyed → refused.
    const greyed = runScenario(doc, BASE_SEED, {
      rules: BOOK,
      eraYear: 1998,
      eraBundle: forgedPolicyTechBundle(),
      eraPolicyCards: cards,
    });
    expect(greyed.observation.intentsRefusedByVerb["policy-card-commit"]).toBe(1);
    expect(greyed.cashEndMicroUsd).toBe(BigInt(UPKEEP_OPENING_MICRO_USD)); // grey ⇒ no commit ⇒ no bill
    // 2026 opening: the same map greys nothing ⇒ executes AND bills.
    const open = runScenario(doc, BASE_SEED, {
      rules: BOOK,
      eraYear: 2026,
      eraBundle: forgedPolicyTechBundle(),
      eraPolicyCards: cards,
    });
    expect(open.observation.intentsExecutedByVerb["policy-card-commit"]).toBe(1);
    expect(open.cashEndMicroUsd).toBe(BigInt(UPKEEP_OPENING_MICRO_USD) - UPKEEP_AMOUNT_MICRO_USD);
    // Both era arms grow the sparse era echo + the rules echo together.
    expect(greyed.era).toEqual({ eraYear: 1998, bundleId: "official:shared-web" });
    expect(open.rulesArmed).toEqual(greyed.rulesArmed);
    // DOOR-ALTITUDE PHRASE + OPENING-FROZEN both directions (the grey never
    // steps — the L-ER-T seam limit, re-pinned for cards):
    const planGrey = composeEraPlan(forgedPolicyTechBundle(), 1998, { policyCards: cards });
    expect(planGrey.greyedPolicyCardIds.has("rule-upkeep-witness")).toBe(true);
    const stepped = composeEraPlan(forgedPolicyTechBundle(), 1998, {
      policyCards: cards,
      transitions: [Object.freeze({ atBusinessMinute: 10000, eraYear: 2026 })],
    });
    expect(stepped.greyedPolicyCardIds.has("rule-upkeep-witness")).toBe(true); // opening-frozen
    const greyDoor = applyEraAvailabilityToDoorConfig(COMMITTED_BASE, stepped);
    expect(
      applyIntentDoor(sweepState(), ctxAtBusinessMinute(11n, 10001), [commitIntent(11n, 0)] as unknown as ExternalIntent[], greyDoor)
        .receipts[0]?.outcome,
    ).toBe("refused"); // post-step minute still greyed — the freeze holds
    const planOpen = composeEraPlan(forgedPolicyTechBundle(), 2026, {
      policyCards: cards,
      transitions: [Object.freeze({ atBusinessMinute: 10000, eraYear: 1998 })],
    });
    expect(planOpen.greyedPolicyCardIds.size).toBe(0); // frozen in BOTH directions
    expect(
      applyIntentDoor(sweepState(), ctxAtBusinessMinute(11n, 10001), [commitIntent(11n, 0)] as unknown as ExternalIntent[], applyEraAvailabilityToDoorConfig(COMMITTED_BASE, planOpen))
        .receipts[0]?.outcome,
    ).toBe("executed");
  });

  it("eraPolicyCards rides the era pair — a bare map throws BAD_ERA by name", () => {
    const doc = upkeepDoc(UPKEEP_OPENING_MICRO_USD);
    expect(() => runScenario(doc, BASE_SEED, { eraPolicyCards: new Map(CARD_TO_TECH) })).toThrow(
      /scenario\[BAD_ERA\] at 'runScenario\.eraPolicyCards'/,
    );
  });
});

describe("L-U2 roster byte-stand — the unarmed world is byte-for-byte yesterday's", () => {
  it("three shipped wires re-derive their pre-seam b59dbeb digests (worktree-captured literals)", () => {
    // Captured on the PRISTINE b59dbeb tree by the temporary probe disclosed
    // in the header. The first literal is eraTransitions.test.ts's standing
    // eraless pin — the cross-file agreement doubles as the probe-harness
    // sanity check. Campaign-altitude byte-stand (the x-1 exit arc
    // b4f7777519ebc0a8, chapters.test.ts:1150) is never re-run here: the arc
    // arms no rules leg by construction and its own standing pin guards it.
    expect(runScenario(shippedScenario("the-not-invented-yet"), BASE_SEED, {}).endDigest).toBe(
      "6aecd417c317a910c75e37f4da14b272",
    );
    const weekend = runScenario(shippedScenario("the-long-weekend"), BASE_SEED, {});
    expect(weekend.endDigest).toBe("ee277ee1b9719a1ce412fd0a3564eebb");
    expect(weekend.stopReason).toBe("win@240");
    const sunday = runScenario(shippedScenario("understaffed-sunday"), BASE_SEED, {});
    expect(sunday.endDigest).toBe("df1538b3baabe2e93fa79799a6830230");
    expect(sunday.stopReason).toBe("win@40");
    // …and NOT one of them grew the echo key (the falsifiable half).
    for (const report of [weekend, sunday]) expect(report.rulesArmed).toBeUndefined();
  });
});
