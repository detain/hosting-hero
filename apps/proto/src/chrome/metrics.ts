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
import { formatMoney } from "./numberLaw";

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

/** Money law lives in numberLaw.ts now (§8.15 consolidation); this name is
 *  kept as the chrome-facing alias — App.vue and metrics.test.ts pin it. */
export { formatMoney as formatMicroUsd } from "./numberLaw";

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

/* ═══════════════════ top-bar threshold registry (§1.4) ═══════════════════ */

/**
 * The permanent four — cash / MRR / reputation / clock — are law, not
 * configuration (§1.4). Their extractors read ONLY SimProjection fields and
 * observed cells; a missing cell is NO DATA ("?"), never a zero (§4.1 R-66).
 */
export interface HudMetricDef {
  readonly id: "cash" | "mrr" | "reputation" | "clock";
  readonly label: string;
  /** µ$ money rows format via the money law; ratio rows are plain numbers. */
  readonly read: (projection: SimProjection) => { readonly dollars: number | null } | { readonly text: string };
}

function dollarsFrom(microUsd: bigint | null): number | null {
  return microUsd === null ? null : Number(microUsd / 100n) / 10_000; // µ$ → $ cents-safe
}

export const HUD_PERMANENT_METRICS: readonly HudMetricDef[] = Object.freeze([
  {
    id: "cash",
    label: "cash",
    read: (p) => ({ dollars: dollarsFrom(p.freeCashMicroUsd) }),
  },
  {
    id: "mrr",
    label: "MRR",
    read: (p) => {
      const cell = lookup(p, "company", "mrrMicroUsd");
      const raw = cell?.value;
      return { dollars: raw === null || raw === undefined || typeof raw !== "bigint" ? null : dollarsFrom(raw) };
    },
  },
  {
    id: "reputation",
    label: "reputation",
    read: (p) => {
      const cell = lookup(p, "company", "reputation");
      const raw = cell?.value;
      return { dollars: raw === null || raw === undefined || typeof raw !== "bigint" ? null : fixedToDisplay(raw) };
    },
  },
  {
    id: "clock",
    label: "run clock",
    read: (p) => ({ text: formatRunClock(p.clocks.simUs) }),
  },
]);

export interface HudPermanentRow {
  readonly id: string;
  readonly label: string;
  /** Pre-formatted display string (money law / plain / "?"). */
  readonly value: string;
  /** Raw display number for candidate wiring — null on NO DATA. */
  readonly numeric: number | null;
  readonly state: "live" | "no-data";
}

/** Rows for the permanent chips of the top bar (§8.8 HUD skeleton). */
export function hudPermanentRows(projection: SimProjection | null): readonly HudPermanentRow[] {
  if (projection === null) {
    return HUD_PERMANENT_METRICS.map((def) => ({
      id: def.id,
      label: def.label,
      value: "?",
      numeric: null,
      state: "no-data" as const,
    }));
  }
  return HUD_PERMANENT_METRICS.map((def) => {
    const reading = def.read(projection);
    if ("text" in reading) {
      return { id: def.id, label: def.label, value: reading.text, numeric: null, state: "live" as const };
    }
    if (reading.dollars === null) {
      return { id: def.id, label: def.label, value: "?", numeric: null, state: "no-data" as const };
    }
    const value =
      def.id === "cash" || def.id === "mrr"
        ? formatMoneyFromDollars(reading.dollars)
        : reading.dollars.toFixed(2);
    return { id: def.id, label: def.label, value, numeric: reading.dollars, state: "live" as const };
  });
}

/** Display dollars → money law. Goes back through µ$ to keep the $10k
 *  abbreviation floor EXACTLY where formatMoney defines it. */
function formatMoneyFromDollars(dollars: number): string {
  const safe = Number.isSafeInteger(Math.round(dollars * 100)) ? Math.round(dollars * 100) : 0;
  return formatMoney(BigInt(safe) * 10_000n);
}

/**
 * Full candidate list for the generalized top bar: the permanent four plus
 * the promotable instrument readings. Permanents carry threshold null —
 * informational, un-promotable, un-collapsible (§1.4 law).
 */
export function buildHudCandidates(projection: SimProjection): MetricCandidate[] {
  const permanents: MetricCandidate[] = hudPermanentRows(projection).map((row) => ({
    id: row.id,
    label: row.label,
    kind: "permanent" as const,
    value: row.numeric,
    threshold: null,
    direction: "up" as const,
    span: 1,
  }));
  return [...permanents, ...buildCandidates(projection)];
}

export type { InstrumentDef };
