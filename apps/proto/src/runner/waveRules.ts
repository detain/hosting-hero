/**
 * waveRules — the §2.24 WAVE-RULES HOST INPUTS (B4): the adapter that puts the
 * shipped g1 shared-web slice on the product runner's arrival stream, plus the
 * pure derivations that feed the engine's three rule consumers (audit @4856a42,
 * adapter @c9c0433) with REAL host signals instead of nothing:
 *
 *  · `oversell`            — OD-24 record (docs/DECISIONS-PENDING.md:100)
 *    proposes an 8:1 starting oversell ratio for shared-web; the bundle
 *    DECLARES the slider (`scarce.commercialSlider === "oversell-ratio"`),
 *    so the host must supply the value or the contention law stays inert.
 *    Supplied only when the declaration holds; homogeneity is read from the
 *    live QoS class mix (identical tenants on one pipe = correlated pain,
 *    hosting_game.md §23034).
 *  · `incidentState`       — a minute-fold incident clock over the driver's
 *    own terminal outcomes: a landed breach (any) or a bounce burst inside
 *    the window flips the host to "active", then "recovering", then quiet.
 *    This is what makes the wave-4 `secondIncident` marker fire on g1 data.
 *  · `dominantDefenseFamily` — census of the families the DEEP lane actually
 *    engaged (units are tallied by hidden true intent at routing time —
 *    host-side ground truth, never an observed cell). Feeds the copycat
 *    rescale: threats copy what defends them (waves/generate.ts 4c).
 *
 * All thresholds here are PROVISIONAL scenario rows (owner ratify-on-playtest
 * posture) and every one is a named const so the pin travels with the number.
 * The feint consumer is structurally wired but MARKER-INERT on shipped data:
 * no g1 wave authors a `feint` marker — buildSharedWebG1Table() therefore
 * accepts injected slice JSON so a test can plant one and prove the fold.
 */
import type { Fixed, SimMinute, ThreatFamily, UnitIntent } from "@hh/sim-core/types";
import {
  parseForeignWaveSlice,
  type DamageDenomination,
  type ForeignThreatMeta,
  type WaveTable,
} from "@hh/sim-core/waves";
// SSOT law: shipped corpus text, parsed at module load — drift fails boot LOUD.
import g1SliceRaw from "../../../../packages/content/waves/g1-shared-web-first-quarter.json?raw";
import registryCoreRaw from "../../../../packages/content/threats/registry-core.json?raw";

/* ═══════════════════ adapter: shipped slice → engine table ═══════════════════
 * Geometry mirrors the sanctioned gate precedent (sim-core waves foreign.test
 * @c9c0433): the slices author EXISTENCE, the geometry is the house envelope. */

export const G1_GEOMETRY = Object.freeze({
  windowMinutes: 12,
  rampMin: 3,
  plateauMin: 3,
  decayMin: 2,
});

const G1_TYPE_BUNDLE_ID = "official:shared-web";

interface RegistryThreatRecord {
  readonly id: string;
  readonly family: ThreatFamily;
  readonly denomination: DamageDenomination;
}

function registryThreatIndex(): ReadonlyMap<string, ForeignThreatMeta> {
  const doc = JSON.parse(registryCoreRaw) as { threats?: unknown };
  const threats = doc.threats;
  if (!Array.isArray(threats)) {
    throw new Error("waveRules: registry-core.json#threats is not an array — census metadata unavailable");
  }
  const index = new Map<string, ForeignThreatMeta>();
  for (const raw of threats as readonly Partial<RegistryThreatRecord>[]) {
    if (typeof raw.id !== "string" || typeof raw.family !== "string" || typeof raw.denomination !== "string") {
      throw new Error(`waveRules: registry-core threat record missing id/family/denomination: ${JSON.stringify(raw).slice(0, 80)}`);
    }
    index.set(raw.id, Object.freeze({ family: raw.family, denomination: raw.denomination }));
  }
  return Object.freeze(index);
}

const REGISTRY = registryThreatIndex();

/** Parse the shipped g1 slice (or injected slice JSON — TEST SEAM for the
 *  feint marker) into an engine WaveTable. Fail-loud via the canonical
 *  adapter + parseWaveTable inside it. */
export function buildSharedWebG1Table(sliceRaw: unknown = JSON.parse(g1SliceRaw)): WaveTable {
  return parseForeignWaveSlice(sliceRaw, {
    typeBundleId: G1_TYPE_BUNDLE_ID,
    geometry: G1_GEOMETRY,
    threatMeta: (threatId: string): ForeignThreatMeta | undefined => REGISTRY.get(threatId),
  });
}

/** The shipped table, adapted once (module-load authority — the same
 *  parse-and-freeze posture as FAMILY_MIX in simCoreRunner). */
export const SHARED_WEB_G1_TABLE: WaveTable = buildSharedWebG1Table();

/* ─────────────────────────── window schedule ───────────────────────────
 * Back-to-back authored windows from the opening minute (the fastForward
 * cursor law); plans are minted LAZILY at entry so host signals can shape
 * each wave. RNG is keyed by (seed, n, cursor) only, so a lazy plan equals
 * an eager one bit-for-bit — deferral changes WHEN it is drawn, never WHAT. */

export interface WaveWindowSpec {
  readonly index: number;
  readonly n: number;
  readonly cursor: SimMinute;
  readonly windowMinutes: number;
}

export function planWaveWindowSchedule(
  table: WaveTable,
  startMinute: SimMinute,
): readonly WaveWindowSpec[] {
  const windows: WaveWindowSpec[] = [];
  let cursor = startMinute;
  for (const [index, wave] of table.waves.entries()) {
    windows.push(Object.freeze({ index, n: wave.n, cursor, windowMinutes: wave.windowMinutes }));
    cursor += wave.windowMinutes;
  }
  return Object.freeze(windows);
}

/* ═══════════════════════════ oversell (OD-24) ═══════════════════════════ */

/** OD-24 record: 8:1 PROPOSED as the shared-web starting oversell ratio
 *  (taste pending — docs/DECISIONS-PENDING.md:100). 1.0 = 1_000_000n, and
 *  waves/contention.ts proves ratio ≤ 1 ⇒ exactly 0n probability, so this
 *  row is the difference between "law present" and "law firing". */
export const OVERSELL_RATIO_MICRO: bigint = 8_000_000n;

/** Does the bundle declare the oversell slider as its commercial knob?
 *  Only shared-web-shaped scenarios may supply the value (B4 scope). */
export function bundleDeclaresOversellSlider(bundle: unknown): boolean {
  const scarce = (bundle as { scarce?: { commercialSlider?: unknown } })?.scarce;
  return scarce?.commercialSlider === "oversell-ratio";
}

const FIXED_SCALE = 65_536n; // Q16.16
const MICRO = 1_000_000n;

/** Homogeneity = the dominant QoS class's share of the live traffic, in
 *  micro-units. Empty mix (no units yet) reads as FULLY homogeneous — the
 *  conservative shared-pipe posture: an unrated tenant pool is exactly the
 *  "identical racks" danger the spec calls out (PROVISIONAL scenario row). */
export function homogeneityMicroFromClassMix(mix: Readonly<Record<string, Fixed>>): bigint {
  const shares = Object.values(mix);
  if (shares.length === 0) return MICRO;
  let dominant = 0n;
  for (const share of shares) {
    if (share > dominant) dominant = share;
  }
  const micro = (dominant * MICRO + FIXED_SCALE / 2n) / FIXED_SCALE;
  return micro > MICRO ? MICRO : micro;
}

/* ══════════════════════ incident clock (§2.24) ══════════════════════ */

export type IncidentState = "quiet" | "active" | "recovering";

/** Rolling burst window (sim-minutes) the trigger looks back over. */
export const INCIDENT_BURST_WINDOW_MIN = 5;
/** Bounces+landings inside the window that constitute an incident. */
export const INCIDENT_TRIGGER_BURST = 2; // PROVISIONAL scenario row
/** Minutes the incident stays "active" after its last trigger minute. */
export const INCIDENT_ACTIVE_MINUTES = 6; // PROVISIONAL scenario row
/** Minutes of "recovering" tail after active expires. */
export const INCIDENT_RECOVERING_MINUTES = 12; // PROVISIONAL scenario row

export interface IncidentClock {
  /** Per-minute bounce+land counts, oldest first, exactly WINDOW long. */
  readonly window: readonly number[];
  readonly activeLeft: number;
  readonly recoveringLeft: number;
}

export const INITIAL_INCIDENT_CLOCK: IncidentClock = Object.freeze({
  window: Object.freeze(new Array<number>(INCIDENT_BURST_WINDOW_MIN).fill(0)),
  activeLeft: 0,
  recoveringLeft: 0,
});

/**
 * Fold one sim-minute of terminal outcomes. A LANDED breach alone is an
 * incident (the money lane already books landings as outage seconds — the
 * wave host must see the same event the CFO sees); otherwise a burst of
 * `INCIDENT_TRIGGER_BURST` losses inside the rolling window triggers.
 * Triggers extend life (re-trigger law like the duck envelope, §7 bus
 * precedent); expiry walks active → recovering → quiet. Pure fold.
 */
export function stepIncidentClock(
  clock: IncidentClock,
  burst: { readonly bounced: number; readonly landed: number },
): IncidentClock {
  const minute = burst.bounced + burst.landed;
  const window = Object.freeze([...clock.window.slice(1), minute]);
  const sum = window.reduce((a, b) => a + b, 0);
  const triggered = burst.landed >= 1 || sum >= INCIDENT_TRIGGER_BURST;
  if (triggered) {
    return Object.freeze({ window, activeLeft: INCIDENT_ACTIVE_MINUTES, recoveringLeft: 0 });
  }
  if (clock.activeLeft > 0) {
    const activeLeft = clock.activeLeft - 1;
    return Object.freeze({
      window,
      activeLeft,
      recoveringLeft: activeLeft === 0 ? INCIDENT_RECOVERING_MINUTES : 0,
    });
  }
  return Object.freeze({
    window,
    activeLeft: 0,
    recoveringLeft: Math.max(0, clock.recoveringLeft - 1),
  });
}

export function incidentStateOf(clock: IncidentClock): IncidentState {
  if (clock.activeLeft > 0) return "active";
  if (clock.recoveringLeft > 0) return "recovering";
  return "quiet";
}

/* ══════════════════ defense census (copycat input) ══════════════════ */

/**
 * Hidden-truth reverse map: the pipeline families the arrival dice via
 * `familyToIntent` (internal); the host reads the intent back off each unit
 * it routes. `customer`/`prospect`/`automaton` are not threat families —
 * defending benign traffic is not "concentrating a defense" (§2.24).
 * Exhaustive switch on purpose: a new UnitIntent must not fold silently.
 */
export function threatFamilyOfIntent(intent: UnitIntent): ThreatFamily | null {
  switch (intent) {
    case "abuser":
      return "customerAsThreat";
    case "malicious":
      return "malicious";
    case "human-error":
      return "human";
    case "entropic":
      return "entropic";
    case "systemic":
      return "systemic";
    case "customer":
    case "prospect":
    case "automaton":
      return null;
  }
}

export type FamilyCensus = Readonly<Partial<Record<ThreatFamily, number>>>;

/** The family the defense concentrated on hardest; ties break by threatId-
 *  style code-unit order for determinism; an empty census reports NOTHING
 *  (copycat then falls back to the authored shares, byte-identical). */
export function dominantFamilyOfCensus(census: FamilyCensus): ThreatFamily | undefined {
  let best: ThreatFamily | undefined;
  let bestCount = 0;
  for (const [family, count] of Object.entries(census) as [ThreatFamily, number][]) {
    if (count > bestCount || (count === bestCount && best !== undefined && family < best)) {
      best = family;
      bestCount = count;
    }
  }
  return bestCount > 0 ? best : undefined;
}
