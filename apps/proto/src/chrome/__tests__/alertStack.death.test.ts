/**
 * Alert stack × death riders (batch-E v0) — the pinning law: terminal states
 * get severity-1 rows that triage cannot touch, fatigue cannot shrink, and
 * the SNR denominator cannot dilute.
 */
import { describe, expect, it } from "vitest";
import { asEntityId } from "@hh/sim-core";
import type { EventNotice, NoticeKind } from "../../shared/protocol";
import {
  EMPTY_STACK,
  ackAlert,
  ingestNotices,
  layoutStack,
  reopenAlert,
  signalToNoise,
  silenceAlert,
  snoozeAlert,
} from "../alertStack";

const death = (detail: string, atUs: number | bigint = 100n): EventNotice => ({
  kind: "economy-notice",
  laneId: null,
  atUs: BigInt(atUs),
  detail,
});
const noisy = (n: number): EventNotice[] =>
  Array.from({ length: n }, (_, i) => ({
    kind: "bounce" as NoticeKind,
    laneId: asEntityId(`lane/noisy-${i}`),
    atUs: BigInt(50 + i),
  }));

describe("ingest — death riders get their own pinned row", () => {
  it("parses into death:<phase>@company, severity 1, pinned, label company", () => {
    const s = ingestNotices(EMPTY_STACK, [death("death-imminent:company")]);
    expect(s.alerts).toHaveLength(1);
    const row = s.alerts[0]!;
    expect(row.key).toBe("death:notice@company");
    expect(row.severity).toBe(1);
    expect(row.pinned).toBe(true);
    expect(row.label).toBe("company");
    expect(row.sampleDetail).toBe("death-imminent:company");
  });

  it("outside the fatigue denominator: raised count stays 0, SNR stays 1", () => {
    const s = ingestNotices(EMPTY_STACK, [death("company-dissolved:company")]);
    expect(s.totalRaised).toBe(0);
    expect(signalToNoise(s)).toBe(1);
  });

  it("the two rungs are two rows; repeats of one rung fold, never duplicate", () => {
    let s = ingestNotices(EMPTY_STACK, [death("death-imminent:company", 100)]);
    s = ingestNotices(s, [death("death-imminent:company", 100)]); // idempotent same frame
    expect(s.alerts).toHaveLength(1);
    expect(s.alerts[0]!.occurrences).toBe(1);
    s = ingestNotices(s, [death("death-imminent:company", 400)]); // re-warn
    expect(s.alerts[0]!.occurrences).toBe(2);
    s = ingestNotices(s, [death("company-dissolved:company", 900)]);
    expect(s.alerts.map((a) => a.key).sort()).toEqual(["death:dissolved@company", "death:notice@company"]);
  });

  it("regular economy riders keep the old shared lane-row behaviour (no drift)", () => {
    const s = ingestNotices(EMPTY_STACK, [death("late-payment:c-1"), death("dunning-stage:c-1")]);
    expect(s.alerts).toHaveLength(1); // same alertKey(kind, null) group as before
    expect(s.alerts[0]!.pinned).toBeUndefined();
    expect(s.totalRaised).toBe(1);
  });
});

describe("triage — pinned riders throw", () => {
  const s = ingestNotices(EMPTY_STACK, [death("death-imminent:company")]);
  const key = "death:notice@company";

  it.each([
    ["ack", ackAlert],
    ["silence", silenceAlert],
    ["reopen", reopenAlert],
  ] as const)("%s on a pinned row throws", (_name, op) => {
    expect(() => op(s, key)).toThrow(/is pinned/);
  });

  it("snooze on a pinned row throws; unknown keys still throw the old way", () => {
    expect(() => snoozeAlert(s, key, 99)).toThrow(/is pinned/);
    expect(() => ackAlert(s, "ghost@nowhere")).toThrow(/unknown key/);
  });
});

describe("layout — the cap shrinks noise, never the funeral", () => {
  it("even at maxVisible 1, the pinned death row renders and the cap still bounds free rows", () => {
    // 4 unactioned bounce groups + 1 death: SNR = 0/4 = 0 → cap 1.
    const s = ingestNotices(EMPTY_STACK, [...noisy(4), death("company-dissolved:company", 9_999)]);
    const layout = layoutStack(s);
    expect(layout.maxVisible).toBe(1);
    expect(layout.rows.some((r) => r.pinned === true)).toBe(true);
    expect(layout.rows.filter((r) => r.pinned !== true)).toHaveLength(1);
    expect(layout.suppressed.filter((r) => r.pinned === true)).toHaveLength(0);
    expect(layout.suppressed).toHaveLength(3);
    expect(layout.rows[0]!.pinned).toBe(true); // severity 1 + freshest: top
  });

  it("pinned rows never grey: their status stays new by construction", () => {
    const s = ingestNotices(EMPTY_STACK, [death("company-dissolved:company")]);
    const layout = layoutStack(s);
    expect(layout.greyedCount).toBe(0);
    expect(layout.rows[0]!.status).toBe("new");
  });
});
