/**
 * Pressure law (MASTER_REPORT §4.1 R-61 / hosting_game.md line 25564):
 *
 *   P(n) = 100 × 1.115^n × S(n)        S = sawtooth series
 *
 * All values live in a BIGINT MICRO domain (1 pressure point = 1_000_000n)
 * because Q16.16 Fixed overflows long before late-game pressure does.
 * Growth 1.115 is kept exact as the rational 223/200 — no floats in logic.
 *
 * Tuning sheets A | B | C are PROVISIONAL parameter sets. The owner has not
 * picked one (open decision, MASTER_REPORT §6), so NONE is active and
 * resolveActiveSheet() fails loud until that ratification lands.
 */

export const PRESSURE_MICRO: bigint = 1_000_000n;

export type TuningSheetId = "A" | "B" | "C";

export interface PressureParams {
  /** Base pressure at wave 0, micro-units (100 points → 100_000_000n). */
  readonly baseMicro: bigint;
  /** Exact growth rational, 1.115 = 223/200. */
  readonly growthNum: bigint;
  readonly growthDen: bigint;
  /** Sawtooth multipliers S(i), micro-units; S(n) uses n mod period. */
  readonly sawtoothMicro: readonly bigint[];
}

export interface TuningSheet {
  readonly id: TuningSheetId;
  readonly status: "PROVISIONAL";
  readonly params: PressureParams;
  readonly note: string;
}

/** Round-half-up exact bigint division for positive denominators.
 *  Module convention for EVERY bigint ratio in waves/ (generate.ts par%
 *  spend uses it — truncating `/` biased late-game budgets low). */
export function mulDivRound(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) throw new Error(`pressure mulDiv: non-positive denominator ${denominator}`);
  const doubled = 2n * numerator + denominator;
  return doubled / (2n * denominator);
}

/**
 * P(n) exactly: base × growthNum^n × S(n mod len) ÷ (growthDen^n × 1e6).
 * n is bounded to keep bigint exponentiation sane for CI.
 */
export function parPressureMicro(params: PressureParams, n: number): bigint {
  if (!Number.isSafeInteger(n) || n < 0) throw new Error(`pressure: wave index must be int ≥ 0, got ${String(n)}`);
  if (n > 4096) throw new Error(`pressure: wave index ${n} exceeds 4096 bound`);
  if (params.sawtoothMicro.length === 0) throw new Error("pressure: empty sawtooth series");
  const saw = params.sawtoothMicro[n % params.sawtoothMicro.length]!;
  if (saw <= 0n) throw new Error(`pressure: sawtooth entry must be positive, got ${saw}`);
  let num = params.baseMicro;
  let den = PRESSURE_MICRO;
  for (let i = 0; i < n; i += 1) {
    num *= params.growthNum;
    den *= params.growthDen;
  }
  return mulDivRound(num * saw, den);
}

const GROWTH_NUM = 223n;
const GROWTH_DEN = 200n;

/** Sheet B — the series authored in hosting_game.md line 25564. */
const SAWTOOTH_B: readonly bigint[] = [
  1_000_000n, 550_000n, 1_300_000n, 700_000n, 1_550_000n, 600_000n, 1_750_000n, 650_000n,
];

/** Sheet A — gentler floor, shallower spikes (PROVISIONAL guess-shape). */
const SAWTOOTH_A: readonly bigint[] = [
  1_000_000n, 700_000n, 1_150_000n, 800_000n, 1_250_000n, 750_000n, 1_350_000n, 800_000n,
];

/** Sheet C — punishing valleys, higher crests (PROVISIONAL guess-shape). */
const SAWTOOTH_C: readonly bigint[] = [
  1_000_000n, 400_000n, 1_500_000n, 500_000n, 1_900_000n, 450_000n, 2_200_000n, 500_000n,
];

export const TUNING_SHEETS: Readonly<Record<TuningSheetId, TuningSheet>> = {
  A: {
    id: "A",
    status: "PROVISIONAL",
    params: { baseMicro: 100n * PRESSURE_MICRO, growthNum: GROWTH_NUM, growthDen: GROWTH_DEN, sawtoothMicro: SAWTOOTH_A },
    note: "PROVISIONAL — comfort-leaning curve; owner has NOT ratified (MASTER_REPORT §6 open decision).",
  },
  B: {
    id: "B",
    status: "PROVISIONAL",
    params: { baseMicro: 100n * PRESSURE_MICRO, growthNum: GROWTH_NUM, growthDen: GROWTH_DEN, sawtoothMicro: SAWTOOTH_B },
    note: "PROVISIONAL — the documented rising-floor sawtooth from hosting_game.md L25564; owner has NOT ratified.",
  },
  C: {
    id: "C",
    status: "PROVISIONAL",
    params: { baseMicro: 100n * PRESSURE_MICRO, growthNum: GROWTH_NUM, growthDen: GROWTH_DEN, sawtoothMicro: SAWTOOTH_C },
    note: "PROVISIONAL — hardcore curve; owner has NOT ratified.",
  },
};

/** The owner hasn't picked a sheet; nothing is active. */
export const ACTIVE_TUNING_SHEET: TuningSheetId | null = null;

/** Fail-fast accessor: throws until ratification flips ACTIVE_TUNING_SHEET. */
export function resolveActiveSheet(): TuningSheet {
  if (ACTIVE_TUNING_SHEET === null) {
    throw new Error(
      "tuning sheet: no ACTIVE_TUNING_SHEET — sheets A|B|C are all PROVISIONAL and the owner has not picked one (MASTER_REPORT §6).",
    );
  }
  return TUNING_SHEETS[ACTIVE_TUNING_SHEET];
}
