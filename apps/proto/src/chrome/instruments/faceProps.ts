/**
 * Shared face props contract — faces are dumb geometry; the bezel binds.
 * Plain TS (no components) so it stays importable from headless logic.
 */
import type { InstrumentState } from "./registry";

export interface FaceProps {
  /** 0..1 across full scale; null = no-data (draw the "?" skeleton). */
  ratio: number | null;
  /** 0..1 threshold mark position. */
  thresholdRatio: number;
  state: InstrumentState;
  /** At nominal, instruments are still (§1.8). */
  isStill: boolean;
  /** Rolling samples for trace faces (scope). */
  samples?: readonly number[];
}
