import { describe, expect, it } from "vitest";

import {
  MAX_ESCALATION_HOPS,
  destinationLabel,
  findRoutingCycles,
  projectEscalationChain,
  routeAlert,
  severityFromPageValue,
  validateRoutingTable,
  RoutingError,
  type AlertRoutingTable,
} from "../routing";
import { F } from "./fixtures";

const MIN = 60_000_000n;

const cleanTable: AlertRoutingTable = {
  entries: [
    { id: "e1", severity: "sev-1", destination: { kind: "role", ref: "ic" }, escalateAfterUs: 5n * MIN, escalation: { kind: "role", ref: "cto" } },
    { id: "e2", severity: "sev-1", destination: { kind: "role", ref: "cto" }, escalateAfterUs: 0n, escalation: null },
    { id: "e3", severity: "sev-2", destination: { kind: "runbook", ref: "page-junior" }, escalateAfterUs: 0n, escalation: null },
    { id: "e4", severity: "sev-3", destination: { kind: "ticket-queue", ref: "triage" }, escalateAfterUs: 0n, escalation: null },
    { id: "e5", severity: "sev-4", destination: { kind: "log", ref: "noise" }, escalateAfterUs: 0n, escalation: null },
  ],
};

const selfPageTable: AlertRoutingTable = {
  entries: [
    { id: "s1", severity: "sev-1", destination: { kind: "role", ref: "nina" }, escalateAfterUs: 1n * MIN, escalation: { kind: "role", ref: "nina" } },
  ],
};

const roundTripTable: AlertRoutingTable = {
  entries: [
    { id: "a1", severity: "sev-1", destination: { kind: "role", ref: "oncall" }, escalateAfterUs: 2n * MIN, escalation: { kind: "runbook", ref: "escalate-l2" } },
    { id: "a2", severity: "sev-4", destination: { kind: "runbook", ref: "escalate-l2" }, escalateAfterUs: 9n * MIN, escalation: { kind: "role", ref: "oncall" } },
  ],
};

describe("alert routing table (R30) + self-page safety (G12)", () => {
  it("validates at load, fail loud on nonsense", () => {
    expect(validateRoutingTable(cleanTable)).toBe(cleanTable);
    expect(() =>
      validateRoutingTable({
        entries: [...cleanTable.entries, cleanTable.entries[0] as (typeof cleanTable.entries)[0]],
      }),
    ).toThrow(RoutingError);
    expect(() =>
      validateRoutingTable({
        entries: [
          { id: "bad", severity: "sev-2", destination: { kind: "log", ref: "x" }, escalateAfterUs: 0n, escalation: { kind: "log", ref: "y" } },
        ],
      }),
    ).toThrow(/escalateAfterUs/);
  });

  it("routes by severity in table order with an escalation deadline", () => {
    const dispatch = routeAlert(cleanTable, "sev-1", 100n);
    expect(dispatch.entryId).toBe("e1");
    expect(destinationLabel(dispatch.destination)).toBe("role:ic");
    expect(dispatch.escalateDueAtUs).toBe(100n + 5n * MIN);
    const terminal = routeAlert(cleanTable, "sev-4", 0n);
    expect(terminal.escalateDueAtUs).toBeNull();
    expect(() => routeAlert({ entries: [] }, "sev-1", 0n)).toThrow(/no routing entry/);
  });

  it("detects a direct self-page loop (pages-that-page-yourself)", () => {
    expect(findRoutingCycles(selfPageTable)).toEqual([["role:nina"]]);
    expect(findRoutingCycles(cleanTable)).toEqual([]);
  });

  it("detects a multi-hop escalation cycle via the SAME cycle detector as rule conflicts", () => {
    expect(findRoutingCycles(roundTripTable)).toEqual([["role:oncall", "runbook:escalate-l2"]]);
  });

  it("projects the chain and marks the revisit instead of looping forever", () => {
    expect(projectEscalationChain(cleanTable, "sev-1")).toEqual(["role:ic", "role:cto"]);
    const looped = projectEscalationChain(roundTripTable, "sev-1");
    expect(looped[looped.length - 1]).toBe("role:oncall!");
    expect(looped.length).toBeLessThanOrEqual(MAX_ESCALATION_HOPS + 2);
  });

  it("maps page-action values to the closed severity enum", () => {
    expect(severityFromPageValue(null)).toBe("sev-3");
    expect(severityFromPageValue(F(1))).toBe("sev-1");
    expect(severityFromPageValue(F(2))).toBe("sev-2");
    expect(severityFromPageValue(F(4))).toBe("sev-4");
    expect(severityFromPageValue(F(9))).toBe("sev-4");
  });
});
