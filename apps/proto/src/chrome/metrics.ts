/**
 * Chrome metrics adapter — the ONLY place observed-store cells become
 * top-bar/promotion candidates and HUD labels. Pure over (projection) inputs,
 * so promotion behavior is testable without mounting anything.
 */
import type { SimProjection } from "../shared/protocol";
import type { MetricCandidate } from "./promotion";
import { G1_INSTRUMENTS, instrumentReading, type InstrumentReading, type InstrumentDef } from "./instruments/registry";
import { observedKey, asEntityId, type ObservedKey } from "@hh/sim-core";
import { fixedToDisplay } from "../shared/protocol";

function lookup(projection: SimProjection, entity: string, property: string) {
  return projection.observed.get(observedKey(asEntityId(entity), property) as ObservedKey);
}

/** Candidates for threshold promotion: instrument defs with numeric readings,
 *  null-valued (fogged) metrics included — `planPromotion` itself refuses to
 *  promote Infinity-distance, keeping "no data ≠ dial" honest. */
export function buildCandidates(projection: SimProjection): MetricCandidate[] {
  return G1_INSTRUMENTS.map((def) => {
    const reading = instrumentReading(def, lookup(projection, def.entity, def.property));
    return {
      id: def.id,
      label: def.label,
      kind: "promotable" as const,
      value: reading.value,
      threshold: def.threshold,
      direction: def.direction,
      span: def.fullScale,
    };
  });
}

export function readingsFor(projection: SimProjection): Map<string, InstrumentReading> {
  const out = new Map<string, InstrumentReading>();
  for (const def of G1_INSTRUMENTS) {
    out.set(def.id, instrumentReading(def, lookup(projection, def.entity, def.property)));
  }
  return out;
}

const SEVERITY_RANK: Readonly<Record<InstrumentReading["state"], number>> = {
  nominal: 0,
  "no-data": 1,
  warn: 2,
  alarm: 3,
};

/** Bezel top rule + Panic trigger both read THIS ("worst state wins", §1.3). */
export function worstState(projection: SimProjection): InstrumentReading["state"] {
  let worst: InstrumentReading["state"] = "nominal";
  for (const reading of readingsFor(projection).values()) {
    if (SEVERITY_RANK[reading.state] > SEVERITY_RANK[worst]) worst = reading.state;
  }
  return worst;
}

/* ═══════════════════════════ labels ═══════════════════════════ */

/** Money never abbreviated below $10k (Number Law §1.8); tabular display. */
export function formatMicroUsd(microUsd: bigint): string {
  const negative = microUsd < 0n;
  const abs = negative ? -microUsd : microUsd;
  const dollars = Number(abs / 10_000n) / 100; // µ$ → $ at cent precision
  const body =
    abs >= 10_000_000_000n // $10k floor for abbreviation
      ? `${(dollars / 1000).toFixed(1)}k`
      : dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${negative ? "−" : ""}$${body}`;
}

/** Run clock on the SIM clock, formatted "T+3h12m" (integer display math). */
export function formatRunClock(simUs: bigint): string {
  const totalMin = Number(simUs / 60_000_000n);
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  return `T+${hours}h${String(minutes).padStart(2, "0")}m`;
}

export function isSpiking(projection: SimProjection): boolean {
  return projection.notices.some((n) => n.kind === "arrival-surge");
}

/** ρ display for the ticker (§4.1 knee marker context). */
export function rhoDisplayOf(projection: SimProjection): number | null {
  const cell = lookup(projection, "node/app-1", "utilizationRho");
  return cell === undefined || cell.value === null || typeof cell.value !== "bigint"
    ? null
    : fixedToDisplay(cell.value);
}

export type { InstrumentDef };
