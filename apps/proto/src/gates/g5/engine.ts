/**
 * GATE-G5 · UI-side engine wrapper. The headless gate calls runQuarter DIRECTLY
 * and wants throws; a mounted component wants a legible failure instead of a
 * white screen — so the boundary here converts failure into a rendered message
 * (fail LOUD, but on-screen). businessMinuteLabel is the shared "D12 07:30"
 * readout law for the scrubber.
 */

import { MINUTES_PER_DAY, runQuarter, type QuarterResult, type RunQuarterOptions } from "./quarter.ts";

export type RunAttempt =
  | { readonly ok: true; readonly result: QuarterResult }
  | { readonly ok: false; readonly message: string };

export function runQuarterSafe(options: RunQuarterOptions): RunAttempt {
  try {
    return { ok: true, result: runQuarter(options) };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      message:
        `GATE-G5 refused to run the quarter — the ledger would not certify itself.\n${reason}`,
    };
  }
}

export function businessMinuteLabel(minute: number): string {
  const day = Math.floor(minute / MINUTES_PER_DAY);
  const hh = String(Math.floor((minute % MINUTES_PER_DAY) / 60)).padStart(2, "0");
  const mm = String(minute % 60).padStart(2, "0");
  return `D${day} ${hh}:${mm} · m${minute}`;
}
