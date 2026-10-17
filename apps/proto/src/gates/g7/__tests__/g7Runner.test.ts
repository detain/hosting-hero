// g7Runner — the loop, pinned. Seeds and tick offsets below are OBSERVED on
// this runner (probe-derived), never guessed: commit lands and the Book
// adjudicates in the SAME advance; its stamped intent re-feeds the NEXT tick
// (the gate-g7.test.ts host law); half-open releases; the once-claim law
// (a fired card stays quiet while its predicate stays true).
import { describe, expect, it } from "vitest";
import { asEntityId } from "@hh/sim-core/types";
import { G7Session } from "../g7Runner.ts";
import { G7_EDGE, G7_ORIGIN } from "../g7Deck.ts";

type CardView = ReturnType<G7Session["snapshot"]>["book"][number];
const book = (s: G7Session, id: string): CardView => {
  const c = s.snapshot().book.find((x) => x.id === id);
  if (c === undefined) throw new Error(`no card ${id}`);
  return c;
};
const edgeDepth = (s: G7Session): string =>
  s.snapshot().nodes.find((n) => n.id === G7_EDGE)?.inspectionDepth ?? "";
const ruleReceipts = (s: G7Session) => s.snapshot().receipts.filter((r) => r.origin === "rule");

describe("g7Runner — attention: the human pays, the Book does not (§7.12/D4)", () => {
  it("with an empty focus pool the commit refuses with attention-debt; the window then mints the hand", () => {
    const s = new G7Session(904);
    s.commitCard("watch-the-door");
    const snap = s.step();
    const refused = snap.receipts.find((r) => r.outcome === "refused");
    expect(refused?.reason).toMatch(/attention-debt/);
    // Fail-loud refusal did not burn the chance: window, re-commit, land.
    expect(s.openAttentionWindow("grace").opened).toBe(true);
    s.commitCard("watch-the-door");
    expect(s.step().receipts.at(-1)?.outcome).toBe("executed");
    expect(book(s, "watch-the-door").committed).toBe(true);
  });

  it("a rule carrier executes with the focus hand UNTOUCHED — the Book works nights", () => {
    const s = new G7Session(904);
    s.openAttentionWindow("grace");
    s.commitCard("watch-the-door");
    s.step(); // t1: commit lands, fires
    const after = s.step(); // t2: rule config executes
    const exec = after.receipts.find((r) => r.verb === "raise-inspection-depth→configure-node");
    expect(exec?.outcome).toBe("executed");
    expect(after.attention.freePips).toBe(1); // NOT spent by the carrier
    expect(after.attention.busyPips).toBe(0);
  });

  it("a player communicate spends the focus hand; a rule page does not (same verb, two ledgers)", () => {
    const s = new G7Session(913);
    s.openAttentionWindow("grace");
    s.postNote();
    const held = s.step(); // t1: communicate executes, focus token held (2-tick verb)
    expect(held.attention.busyPips).toBe(1);
    const page = new G7Session(913);
    page.openAttentionWindow("grace");
    page.commitCard("page-the-founder");
    page.step();
    const fired = page.step(); // t2: rule page→communicate executes
    expect(fired.receipts.some((r) => r.origin === "rule" && r.verb === "page→communicate" && r.outcome === "executed")).toBe(true);
    expect(fired.attention.busyPips).toBe(0); // the Book paid NOTHING in focus
  });
});

describe("g7Runner — the unwatched board runs on its standing policies", () => {
  it("after ONE committed card, sixteen click-free ticks show the depth change held and no re-fire spam", () => {
    const s = new G7Session(904);
    s.openAttentionWindow("grace");
    s.commitCard("watch-the-door");
    let snap = s.step(); // t1 commit + fire
    snap = s.step(); // t2 rule executes depth=inspect
    expect(edgeDepth(s)).toBe("inspect");
    for (let i = 0; i < 14; i += 1) snap = s.step(); // ZERO player intents, t3..t16
    expect(edgeDepth(s)).toBe("inspect"); // the change HOLDS — no hands needed
    expect(book(s, "watch-the-door").firings).toBe(1); // once-claim law: predicate
    // stays true, the Book does not scream twice (§7.14 quiet-on-effect)
    expect(snap.tick).toBe("16");
    const rho = snap.nodes.find((n) => n.id === G7_ORIGIN)?.rho ?? 0n;
    expect(rho > 40_960n).toBe(true); // ρ≈99% — the pressure the card watches is permanent
  });

  it("receipts show BOTH boards on one rail: rule origin labeled from attribution, player seqs live in 1000+", () => {
    const s = new G7Session(904);
    s.openAttentionWindow("grace");
    s.commitCard("watch-the-door");
    s.step();
    s.step();
    const rule = ruleReceipts(s);
    expect(rule.map((r) => r.seq)).toEqual([1]); // the driver's own counter — never the player space
    for (const r of s.snapshot().receipts.filter((x) => x.origin === "player")) {
      expect(r.seq).toBeGreaterThanOrEqual(1001);
    }
  });
});

describe("g7Runner — ONE pool: the rail cannot tell who you are", () => {
  it("same frame: place+cable drain BOTH hands, the third claim (commit) refuses hands-exhausted", () => {
    const s = new G7Session(914);
    s.openAttentionWindow("grace");
    s.placeDevice();
    s.connectData(G7_EDGE, asEntityId("node/db"));
    s.commitCard("watch-the-door"); // third claimant on a two-hand rail
    const snap = s.step();
    const refuses = snap.receipts.filter((r) => r.outcome === "refused");
    expect(refuses).toHaveLength(1);
    expect(refuses[0]?.verb).toBe("policy-card-commit");
    expect(refuses[0]?.reason).toBe("hands-exhausted: need 1, free 0 of 2"); // PLAYER vocab — no carrier suffix
    expect(snap.hands.filter((h) => h.origin === "player")).toHaveLength(2);
    expect(snap.receipts.some((r) => r.verb === "connect-ports" && r.outcome === "executed")).toBe(true); // place landed FIRST in the same feed — sequential draft
  });

  it("race: a rule intent and a player note reach one free hand — the rule's lower seq wins, the human is refused", () => {
    const s = new G7Session(913);
    s.openAttentionWindow("grace");
    s.commitCard("page-the-founder"); // t1: commit (token0→t2) + fire
    s.step();
    s.commitCard("shed-the-small"); // queued for t2: lands on the freed commit token, fires at t2
    s.step(); // t2: rule page takes token0 → t4; shed commit takes token1 → t3
    s.postNote(); // queued for t3
    const t3 = s.step(); // t3: rule shed #2 (seq 2) beats the note (seq 1003) to the last free hand
    expect(t3.tick).toBe("3");
    const refused = t3.receipts.filter((r) => r.outcome === "refused");
    // the note lands after BOTH rails are rule-held: shed #2 executes on the
    // half-open-released token1 (busyUntil t3 → free at t3) while page holds
    // token0 to t4; the note then finds token1 gone to shed (lower seq!) —
    // the Book beat the human to the last hand.
    expect(refused.some((r) => r.reason === "hands-exhausted: need 1, free 0 of 2")).toBe(true);
    expect(refused.every((r) => r.origin === "player")).toBe(true);
    const hands = s.snapshot().hands;
    expect(hands.map((h) => h.origin)).toEqual(["rule", "rule"]); // the rail is fully BOOK-held at t3
  });

  it("the rail labels holds by ORIGIN — Book holds render rule, human holds render player", () => {
    const s = new G7Session(909);
    s.openAttentionWindow("grace");
    s.commitCard("page-the-founder");
    s.placeDevice();
    s.step(); // t1: two player holds (commit token0→t2, place token1→t4)
    expect(s.snapshot().hands.map((h) => h.origin)).toEqual(["player", "player"]);
    s.step(); // t2: commit token freed; the Book's page→communicate takes token0 → t4
    const held = s.snapshot().hands;
    expect(held[0]?.origin).toBe("rule");
    expect(held[0]?.busyUntilTick).toBe("4"); // communicate = 2 ticks, same rail, same math
    expect(held[1]?.origin).toBe("player");
  });
});

describe("g7Runner — the bought-verb wall: ticker-yes, board-no", () => {
  it("escape-hatch FIRES (tape) and is REFUSED at the door (no execution, state inert)", () => {
    const s = new G7Session(906);
    s.openAttentionWindow("grace");
    s.commitCard("escape-hatch");
    // The origin's ρ crosses the wall a hop later than the edge's: fire t3, refusal t4.
    for (let i = 0; i < 4; i += 1) s.step();
    const wall = book(s, "escape-hatch");
    expect(wall.firings).toBe(1); // the ticker said yes
    expect(wall.refusals).toBe(1); // the board said no
    expect(wall.executions).toBe(0); // never anything else
    const refusal = s.snapshot().receipts.find((r) => r.origin === "rule" && r.outcome === "refused");
    expect(refusal?.verb).toBe("verb:failover"); // no arrow: nothing was translated
    expect(refusal?.reason).toMatch(/unsupported-verb-carrier/);
    expect(edgeDepth(s)).toBe("pass-through"); // the micro-board is UNTOUCHED
    expect(s.snapshot().nodes.find((n) => n.id === G7_ORIGIN)?.rho).toBeGreaterThan(0n); // (pressure was real)
  });

  it("the wall does not spam: one fire, one refusal, quiet after while the predicate stands", () => {
    const s = new G7Session(906);
    s.openAttentionWindow("grace");
    s.commitCard("escape-hatch");
    for (let i = 0; i < 8; i += 1) s.step();
    const wall = book(s, "escape-hatch");
    expect(wall.firings).toBe(1);
    expect(wall.refusals).toBe(1);
  });
});

describe("g7Runner — the Kill Switch dial (§7.14)", () => {
  it("a suppressed card leaves NO adjudication row; resuming re-arms the fire", () => {
    const armed = new G7Session(904);
    armed.openAttentionWindow("grace");
    armed.commitCard("watch-the-door");
    armed.step(); // fires t1 — control

    const s = new G7Session(904);
    s.openAttentionWindow("grace");
    s.commitCard("watch-the-door");
    s.suspendRule("watch-the-door"); // host dial before the adjudicating step
    const suppressed = s.step(); // t1: commit executes, NO firing row
    expect(book(s, "watch-the-door").firings).toBe(0);
    expect(suppressed.firings.filter((f) => f.rule === "watch-the-door")).toHaveLength(0);
    expect(edgeDepth(s)).toBe("pass-through");

    s.resumeRule("watch-the-door"); // the dial leaves no trace; the claim was never spent
    const t2 = s.step();
    expect(book(s, "watch-the-door").firings).toBe(1);
    expect(t2.firings.some((f) => f.rule === "watch-the-door" && f.mode === "live")).toBe(true);
    s.step();
    expect(edgeDepth(s)).toBe("inspect"); // the un-fired book still does its job
  });

  it("suspending and resuming costs no tick and mints no receipt (it is a dial, not a door verb)", () => {
    const s = new G7Session(904);
    s.openAttentionWindow("grace");
    s.commitCard("watch-the-door");
    s.step();
    const before = s.snapshot();
    s.suspendRule("watch-the-door");
    s.resumeRule("watch-the-door");
    const after = s.snapshot();
    expect(after.tick).toBe(before.tick);
    expect(after.receipts).toHaveLength(before.receipts.length);
  });

  it("suspending an unknown card id fails loud host-side", () => {
    const s = new G7Session(904);
    expect(() => s.suspendRule("ghost-card")).toThrow(/g7\[no-such-card\]/);
  });
});

describe("g7Runner — the Dry-Run Toggle (§7.14)", () => {
  it("shadow mode: the fire is logged as would-fire, zero intents mint, the board never moves", () => {
    const s = new G7Session(910);
    s.openAttentionWindow("grace");
    s.setShadow(true);
    s.commitCard("watch-the-door");
    s.step(); // t1: adjudicates in shadow
    s.step(); // t2
    s.step(); // t3
    expect(book(s, "watch-the-door").shadowFirings).toBe(1);
    expect(book(s, "watch-the-door").firings).toBe(0);
    expect(edgeDepth(s)).toBe("pass-through"); // the board never saw it
    expect(ruleReceipts(s)).toHaveLength(0); // ZERO intents minted in shadow
  });

  it("live twin of the same seed/script DOES move the board — the toggle is the only delta", () => {
    const run = (shadow: boolean): G7Session => {
      const s = new G7Session(910);
      if (shadow) s.setShadow(true);
      s.openAttentionWindow("grace");
      s.commitCard("watch-the-door");
      for (let i = 0; i < 3; i += 1) s.step();
      return s;
    };
    expect(edgeDepth(run(false))).toBe("inspect");
    expect(edgeDepth(run(true))).toBe("pass-through");
  });
});

describe("g7Runner — the advisory bands (§7.14)", () => {
  it("a CONSULT card fires as a row for the human — zero intents, zero executions", () => {
    const s = new G7Session(907);
    s.openAttentionWindow("grace");
    s.commitCard("ask-the-senior");
    s.step();
    s.step();
    s.step();
    const ask = book(s, "ask-the-senior");
    expect(ask.firings).toBe(1); // adjudicated live — the ticker shows the ask
    expect(ask.executions).toBe(0); // a consult mints intents for NOBODY
    expect(ask.advisory).toBe(true);
    expect(ruleReceipts(s)).toHaveLength(0); // nothing reached the board
    expect(edgeDepth(s)).toBe("pass-through");
  });

  it("the INFORM card fires only at the deeper threshold and stays stage-only", () => {
    const s = new G7Session(907);
    s.openAttentionWindow("grace");
    s.commitCard("the-underwriter");
    for (let i = 0; i < 4; i += 1) s.step(); // origin ρ crosses 75 % a hop later
    expect(book(s, "the-underwriter").firings).toBe(1); // SWAMPED fired once
    expect(book(s, "the-underwriter").advisory).toBe(true);
    expect(ruleReceipts(s)).toHaveLength(0);
  });
});

describe("g7Runner — determinism (the gate's own replay law)", () => {
  const script = (s: G7Session): void => {
    s.openAttentionWindow("grace");
    s.commitCard("watch-the-door");
    s.step();
    s.placeDevice();
    s.step();
    s.commitCard("page-the-founder");
    s.postNote();
    for (let i = 0; i < 6; i += 1) s.step();
    s.suspendRule("watch-the-door");
    s.step();
    s.resumeRule("watch-the-door");
    s.commitCard("escape-hatch");
    for (let i = 0; i < 4; i += 1) s.step();
  };

  it("two runners, same seed, same script: receipts, firings, terminal state — byte-equal", () => {
    const a = new G7Session(915);
    const b = new G7Session(915);
    script(a);
    script(b);
    expect(a.receiptsDigest()).toBe(b.receiptsDigest());
    expect(a.firingsDigest()).toBe(b.firingsDigest());
    expect(a.terminalDigest()).toBe(b.terminalDigest());
  });

  it("a different seed digests differently (the rail is not a canned animation)", () => {
    const a = new G7Session(915);
    const b = new G7Session(916);
    script(a);
    script(b);
    expect(a.terminalDigest()).not.toBe(b.terminalDigest());
  });

  it("the door never touches money: cash stays at the minted zero across a full session", () => {
    const s = new G7Session(904);
    script(s);
    expect(s.snapshot().cashFree).toBe(0n);
  });
});
