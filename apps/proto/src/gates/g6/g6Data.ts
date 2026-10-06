/**
 * gates/g6 — the TYPE DATA door for the generality gate (§9.13 #6).
 *
 * Everything the runner needs arrives from the shipped corpus through the
 * loader boundary: patience budget, wave slice, invitation graph, diurnal
 * rhythm selector, tempo flag, palette, and the scarce-resource meter name.
 * There is NO bundle-id switch in the run path — the same loader output feeds
 * the same class of profile for any type. Two fail-loud lookup tables cover
 * the data-named UI seams (diurnal curve, meter face): an unknown id is an
 * authoring bug, surfaced immediately, never papered over.
 *
 * Read-only consumer law: content is parsed, never edited; drift lands here
 * as a loud throw at boot, not silent adaptation.
 */
import sharedWebRaw from "../../../../../packages/content/types/shared-web.json?raw";
import gameServersRaw from "../../../../../packages/content/types/game-servers.json?raw";
import webWaveRaw from "../../../../../packages/content/waves/g1-shared-web-first-quarter.json?raw";
import gameWaveRaw from "../../../../../packages/content/waves/g1-game-servers-first-quarter.json?raw";
import threatRegistryRaw from "../../../../../packages/content/threats/registry-core.json?raw";
import { loadTypeBundle, type LoadedTypeBundle } from "@hh/sim-core/loader";
import {
  buildInvitations,
  parseDiurnalCurve,
  parseWaveTable,
  type DiurnalCurveTable,
  type ThreatInvitations,
  type WaveTable,
} from "@hh/sim-core/waves";
import type { FaceKind } from "../../chrome/instruments/faces";
import type { SimTimeUs } from "@hh/sim-core/types";

/* ═══════════════════════════ bundle parsing ═══════════════════════════════ */

export type G6TypeId = "official:shared-web" | "official:game-servers";

const BUNDLE_RAW: Readonly<Record<G6TypeId, string>> = Object.freeze({
  "official:shared-web": sharedWebRaw,
  "official:game-servers": gameServersRaw,
});

/** Wave slice files are referenced by the bundle ("file:waves/…"); the raw
 *  imports are keyed by that same relative path so the reference is honored,
 *  not hardcoded. */
const WAVE_RAW: Readonly<Record<string, string>> = Object.freeze({
  "waves/g1-shared-web-first-quarter.json": webWaveRaw,
  "waves/g1-game-servers-first-quarter.json": gameWaveRaw,
});

interface RegistryThreat {
  readonly id: string;
  readonly family: string;
  readonly band: string;
  readonly denomination: string;
}

function threatIndex(): ReadonlyMap<string, RegistryThreat> {
  const parsed = JSON.parse(threatRegistryRaw) as { threats: RegistryThreat[] };
  return new Map(parsed.threats.map((t) => [t.id, t]));
}

const WAVE_WINDOW_MINUTES = 12;

/** Foreign g1 slice schema (threat/role/pressurePct) → parseWaveTable input.
 *  The exact adapter the headless gate uses (existence data verbatim,
 *  geometry authored — headline law: identical geometry BOTH types). */
function adaptWaveSlice(raw: unknown, typeBundleId: string): WaveTable {
  const slice = raw as {
    id: string;
    waves: ReadonlyArray<{
      n: number;
      parPct: number;
      trough?: boolean;
      entries: ReadonlyArray<{ threat: string; role: string; pressurePct: number; band: string }>;
    }>;
  };
  const index = threatIndex();
  return parseWaveTable({
    id: slice.id,
    typeBundleId,
    tuningSheet: "B",
    unitsPerPressurePoint: 1,
    waves: slice.waves.map((w) => ({
      n: w.n,
      windowMinutes: WAVE_WINDOW_MINUTES,
      rampMin: 3,
      plateauMin: 3,
      decayMin: 2,
      parPct: w.parPct,
      hard: w.trough !== true,
      entries: w.entries.map((e) => {
        const meta = index.get(e.threat);
        if (meta === undefined) {
          throw new Error(`g6Data: slice threat "${e.threat}" absent from registry-core`);
        }
        const role = e.role.split("/")[0]!.toLowerCase();
        return {
          threatId: e.threat,
          role: role === "healer" ? "healer" : role,
          family: meta.family,
          band: e.band,
          sharePct: e.pressurePct,
          denominations: [meta.denomination],
          targets: ["origin"],
        };
      }),
    })),
  });
}

/* ═══════════════════ diurnal curve library (data-keyed) ═══════════════════
 * The same 90-sim-minute shapes the headless gate proved emergence with —
 * one normalization, different SHAPES, keyed by tempo.diurnalBaseline. */

const MICROS_PER_MIN = 60_000_000n;
const SIM_DAY_US: SimTimeUs = 90n * MICROS_PER_MIN;

function point(minutes: number, ratePerMin: number): { atUs: SimTimeUs; valueMicro: bigint } {
  return Object.freeze({
    atUs: BigInt(Math.round(minutes)) * MICROS_PER_MIN,
    valueMicro: BigInt(Math.round(ratePerMin * 1_000_000)),
  });
}

const CURVE_LIBRARY: Readonly<Record<string, DiurnalCurveTable>> = Object.freeze({
  "web-midday": parseDiurnalCurve({
    id: "web-midday",
    periodUs: SIM_DAY_US,
    points: Object.freeze([
      point(0, 2),
      point(20, 6),
      point(40, 11),
      point(60, 11),
      point(75, 5),
      point(85, 2.5),
    ]),
  }),
  "evening-peak-18-24-local": parseDiurnalCurve({
    id: "evening-peak-18-24-local",
    periodUs: SIM_DAY_US,
    points: Object.freeze([
      point(0, 2.2),
      point(50, 2.5),
      point(58, 6),
      point(64, 12),
      point(72, 12),
      point(80, 3),
      point(86, 2.2),
    ]),
  }),
});

function curveFor(key: string): DiurnalCurveTable {
  const hit = CURVE_LIBRARY[key];
  if (hit === undefined) {
    throw new Error(`g6Data: no diurnal curve for tempo.diurnalBaseline "${key}" (library: ${Object.keys(CURVE_LIBRARY).join("|")})`);
  }
  return hit;
}

/* ═══════════════════ meter widget → instrument face (data-keyed) ══════════
 * The scarce-resource meter's NAME comes from the bundle; the UI binds it to
 * one of the five bezel faces. "density-comb" reads as a waterline column
 * (load donut: packed density vs the breach line); "tick-rate-metronome"
 * reads as an oscilloscope trace (the tick pulse train itself). Unknown name
 * fails loud — the bezel must never paint an empty dial. */

const METER_FACES: Readonly<Record<string, { face: FaceKind; label: string; unit: string }>> = Object.freeze({
  "density-comb": { face: "waterline", label: "Tenant density", unit: "ρ" },
  "tick-rate-metronome": { face: "scope", label: "Tick rate", unit: "ρ·trace" },
});

export function meterFace(widget: string): { face: FaceKind; label: string; unit: string } {
  const hit = METER_FACES[widget];
  if (hit === undefined) {
    throw new Error(`g6Data: meterWidget "${widget}" has no bound face (known: ${Object.keys(METER_FACES).join("|")})`);
  }
  return hit;
}

/* ═══════════════════════════ the loaded profile ══════════════════════════ */

export interface G6Profile {
  readonly typeId: G6TypeId;
  /** UI label derived from the i18n key tail — display-side only. */
  readonly label: string;
  readonly bundle: LoadedTypeBundle;
  readonly patienceUs: SimTimeUs;
  readonly table: WaveTable;
  readonly invitations: ThreatInvitations;
  readonly curve: DiurnalCurveTable;
  readonly incident: boolean;
  /** scarce.meterWidget verbatim — the UI must resolve it or die trying. */
  readonly meterWidget: string;
  readonly palette: {
    readonly dominant: string;
    readonly accent: string;
    readonly chord: readonly [string, string, string, string, string];
  };
  readonly arrivalRhythm: string;
}

function displayLabel(nameKey: string): string {
  // i18n keys are "type.<slug>.name" — the slug segment carries the human id.
  const parts = nameKey.split(".");
  const tail = (parts.length >= 3 ? parts[1] : parts[parts.length - 1]) ?? nameKey;
  return tail
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function loadG6Profile(typeId: G6TypeId): G6Profile {
  const bundle = loadTypeBundle(JSON.parse(BUNDLE_RAW[typeId]) as unknown);
  if (bundle.id !== typeId) {
    throw new Error(`g6Data: bundle at "${typeId}" reports id "${bundle.id}" — corpus drift`);
  }
  const budget = bundle.visitor.patienceParams.budgetUs;
  if (budget === null) {
    throw new Error(`g6Data: bundle "${bundle.id}" ships a null patience budget`);
  }
  const ref = bundle.threats.waveTable;
  if (!ref.startsWith("file:")) {
    throw new Error(`g6Data: unsupported waveTable reference "${ref}"`);
  }
  const wavePath = ref.slice("file:".length);
  const waveRaw = WAVE_RAW[wavePath];
  if (waveRaw === undefined) {
    throw new Error(`g6Data: wave slice "${wavePath}" referenced by "${typeId}" is not wired into this gate`);
  }
  return Object.freeze({
    typeId,
    label: displayLabel(bundle.meta.name),
    bundle,
    patienceUs: budget,
    table: adaptWaveSlice(JSON.parse(waveRaw) as unknown, bundle.id),
    invitations: buildInvitations(bundle.threats.unlockedByBuildables),
    curve: curveFor(bundle.tempo.diurnalBaseline),
    incident: bundle.tempo.permanentIncidentClock,
    meterWidget: bundle.scarce.meterWidget,
    palette: Object.freeze({
      dominant: bundle.skin.dominant,
      accent: bundle.skin.accent,
      chord: bundle.skin.chord,
    }),
    arrivalRhythm: bundle.skin.arrivalRhythm,
  });
}

export const G6_PROFILES: readonly G6Profile[] = Object.freeze([
  loadG6Profile("official:shared-web"),
  loadG6Profile("official:game-servers"),
]);

export const G6_DEFAULT_SEED = 42;
