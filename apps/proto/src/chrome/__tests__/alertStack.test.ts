/**
 * Alert Stack (§8.8) — grouping, triage statuses, fatigue math, and the
 * fairness law: suppressed rows stay reachable, never vanish.
 */
import { describe, expect, it } from "vitest";
import { asEntityId } from "@hh/sim-core";
import type { EntityId } from "@hh/sim-core";
import type { EventNotice, NoticeKind } from "../../shared/protocol";
import {
  EMPTY_STACK,
  MAX_VISIBLE_ALERTS,
  ackAlert,
  alertKey,
  effectiveVisibleCount,
  ingestNotices,
  layoutStack,
  releaseExpiredSnoozes,
  reopenAlert,
  signalToNoise,
  silenceAlert,
  snoozeAlert,
} from "../alertStack";

function notice(kind: NoticeKind, atUs: bigint, laneId: EntityId | null = asEntityId("lane/ingress-1")): EventNotice {
  return { kind, laneId, atUs };
}

describe("ingest + grouping", () => {
  it("groups by object AND cause: kind+lane fold into one row with occurrence count", () => {
    let s = ingestNotices(EMPTY_STACK, [notice("bounce", 100n), notice("bounce", 300n)]);
    expect(s.alerts.length).toBe(1);
    expect(s.alerts[0]?.occurrences).toBe(2);
    expect(s.alerts[0]?.firstAtUs).toBe(100n);
    expect(s.alerts[0]?.lastAtUs).toBe(300n);
    expect(s.alerts[0]?.key).toBe(alertKey("bounce", "lane/ingress-1"));
  });

  it("different lanes are different objects — separate rows", () => {
    const s = ingestNotices(EMPTY_STACK, [notice("landed", 1n, asEntityId("lane/a")), notice("landed", 2n, asEntityId("lane/b"))]);
    expect(s.alerts.length).toBe(2);
  });

  it("re-ingesting the same frame is idempotent (no double-count)", () => {
    const frame = [notice("false-positive", 50n)];
    const once = ingestNotices(EMPTY_STACK, frame);
    const twice = ingestNotices(once, frame);
    expect(twice.alerts[0]?.occurrences).toBe(1);
    expect(twice.totalRaised).toBe(once.totalRaised);
  });

  it("global notices key without a lane", () => {
    const s = ingestNotices(EMPTY_STACK, [notice("rule-fired", 1n, null)]);
    expect(s.alerts[0]?.key).toBe("rule-fired@global");
  });
});

describe("triage statuses", () => {
  const base = ingestNotices(EMPTY_STACK, [notice("bounce", 10n)]);
  const key = base.alerts[0]!.key;

  it("ack / silence mark actioned; the row STAYS in the layout (visible greyed)", () => {
    const acked = ackAlert(base, key);
    const silenced = silenceAlert(base, key);
    expect(layoutStack(acked).rows.length).toBe(1);
    expect(layoutStack(acked).greyedCount).toBe(1);
    expect(layoutStack(silenced).rows[0]?.status).toBe("silenced");
  });

  it("reopen returns a triaged row to fresh attention", () => {
    expect(reopenAlert(silenceAlert(base, key), key).alerts[0]?.status).toBe("new");
  });

  it("triaging an unknown key fails loud", () => {
    expect(() => ackAlert(base, "nope@global")).toThrow(/unknown key/);
  });

  it("snooze hides until expiry, then the alert comes BACK as new news", () => {
    const snoozed = snoozeAlert(base, key, 40);
    expect(layoutStack(snoozed).rows.length).toBe(0);
    expect(layoutStack(snoozed).suppressed.length).toBe(1); // still reachable
    expect(releaseExpiredSnoozes(snoozed, 39).alerts[0]?.status).toBe("snoozed");
    expect(releaseExpiredSnoozes(snoozed, 40).alerts[0]?.status).toBe("new");
  });

  it("a flaring group re-opens triaged status by itself (§8.8 kill-by-silence law)", () => {
    const triaged = silenceAlert(base, key);
    const flared = ingestNotices(triaged, [notice("bounce", 11n)]);
    expect(flared.alerts[0]?.status).toBe("new");
  });
});

describe("signal-to-noise fatigue law", () => {
  it("empty stack is full signal (1), not zero", () => {
    expect(signalToNoise(EMPTY_STACK)).toBe(1);
  });

  it("actioned fraction drives the visible cap 4→3→2→1, never 0", () => {
    expect(effectiveVisibleCount(1)).toBe(MAX_VISIBLE_ALERTS);
    expect(effectiveVisibleCount(0.7)).toBe(4);
    expect(effectiveVisibleCount(0.55)).toBe(3);
    expect(effectiveVisibleCount(0.3)).toBe(2);
    expect(effectiveVisibleCount(0)).toBe(1);
    expect(() => effectiveVisibleCount(1.2)).toThrow(RangeError);
  });

  it("a fully-ignored stack is pure noise: dimmed to the floor of 1 row, rest EXPANDABLE", () => {
    const many = ingestNotices(
      EMPTY_STACK,
      Array.from({ length: 8 }, (_, i) => notice("arrival-surge", BigInt(i + 1), asEntityId(`lane/${i}`))),
    );
    const ignored = layoutStack(many); // snr 0 — nothing acted on yet
    expect(ignored.dimmed).toBe(true);
    expect(ignored.rows.length).toBe(1); // the floor — never zero
    expect(ignored.suppressed.length).toBe(7);
  });

  it("triage buys back the strip: acking toward full SNR walks rows 1→4, cap holds", () => {
    let many = ingestNotices(
      EMPTY_STACK,
      Array.from({ length: 8 }, (_, i) => notice("arrival-surge", BigInt(i + 1), asEntityId(`lane/${i}`))),
    );
    const order = many.alerts.map((a) => a.key);
    const caps: number[] = [];
    for (const key of order) {
      many = ackAlert(many, key);
      caps.push(layoutStack(many).rows.length);
    }
    // k/8 actioned: <.2 → 1, ≥.2 → 2, ≥.4 → 3, ≥.7 → 4
    expect(caps).toEqual([1, 2, 2, 3, 3, 4, 4, 4]);
    const final = layoutStack(many);
    expect(final.suppressed.length).toBe(4); // still capped at 4 visible (§8.8)
    expect(final.dimmed).toBe(false);
  });
});
