/**
 * Status Chip vocabulary (§8.2, §8.15) — pure.
 *
 * The HUD speaks EXACTLY these twelve states; there is no thirteenth and
 * components may not improvise labels. Each chip carries TWO independent
 * channels — semantic colour AND a shape notch — so the vocabulary survives
 * greyscale, colour-blindness, and a 1998 monochrome CRT (§8.15 Two-Channel
 * Law). All twelve notches are distinct glyphs drawn from the icon-primitive
 * family (circle/triangle/hexagon/chevron/shield/seal/wrench/clock/receipt).
 *
 * Shapes are returned as SVG `d` path strings on a 10×10 viewBox so tests
 * can assert distinctness without a renderer, and the Vue chip just paints
 * whatever the vocabulary says.
 */

export const STATUS_VALUES = [
  "HEALTHY",
  "DEGRADED",
  "DOWN",
  "DRAINING",
  "PATCHING",
  "COMPROMISED",
  "SEALED",
  "EXPIRED",
  "OVERDUE",
  "AT RISK",
  "PENDING",
  "UNVERIFIED",
] as const;

export type StatusValue = (typeof STATUS_VALUES)[number];

export function isStatusValue(candidate: string): candidate is StatusValue {
  return (STATUS_VALUES as readonly string[]).includes(candidate);
}

/** Semantic colour channel — theme-resolved in CSS, vocabulary-fixed here. */
export type StatusTone = "ok" | "warn" | "danger" | "info" | "accent" | "faded";

/** Shape notch channel — one glyph per state, never reused. */
export type StatusNotch =
  | "circle"
  | "triangle"
  | "cross"
  | "chevron-down"
  | "wrench"
  | "bolt"
  | "seal"
  | "hourglass"
  | "flag"
  | "diamond"
  | "clock"
  | "dashed-ring";

export interface StatusChipSpec {
  readonly value: StatusValue;
  readonly notch: StatusNotch;
  readonly tone: StatusTone;
  /** One-line tooltip for the chip's title attribute. */
  readonly meaning: string;
}

const VOCABULARY: Readonly<Record<StatusValue, StatusChipSpec>> = Object.freeze({
  HEALTHY: { value: "HEALTHY", notch: "circle", tone: "ok", meaning: "everything it promises, right now" },
  DEGRADED: { value: "DEGRADED", notch: "triangle", tone: "warn", meaning: "serving, but off its nominals" },
  DOWN: { value: "DOWN", notch: "cross", tone: "danger", meaning: "not serving at all" },
  DRAINING: { value: "DRAINING", notch: "chevron-down", tone: "info", meaning: "taking no new work, finishing old" },
  PATCHING: { value: "PATCHING", notch: "wrench", tone: "accent", meaning: "under maintenance surgery" },
  COMPROMISED: { value: "COMPROMISED", notch: "bolt", tone: "danger", meaning: "hostile access — incident ground truth" },
  SEALED: { value: "SEALED", notch: "seal", tone: "ok", meaning: "compliance locked; changes need a key" },
  EXPIRED: { value: "EXPIRED", notch: "hourglass", tone: "faded", meaning: "its validity window has passed" },
  OVERDUE: { value: "OVERDUE", notch: "flag", tone: "warn", meaning: "a commitment missed its date" },
  "AT RISK": { value: "AT RISK", notch: "diamond", tone: "warn", meaning: "projected breach if nothing changes" },
  PENDING: { value: "PENDING", notch: "clock", tone: "info", meaning: "scheduled, not yet true" },
  UNVERIFIED: { value: "UNVERIFIED", notch: "dashed-ring", tone: "faded", meaning: "fog — observed claim, unconfirmed" },
});

/** The lookups components use. Off-vocabulary strings fail loudly — the
 *  renderer must never silently invent a thirteenth state. */
export function statusChipFor(value: StatusValue): StatusChipSpec {
  const spec: StatusChipSpec | undefined = VOCABULARY[value];
  if (spec === undefined) {
    throw new Error(`statusChipFor: "${value}" is not in the 12-value vocabulary`);
  }
  return spec;
}

export function allStatusChips(): readonly StatusChipSpec[] {
  return STATUS_VALUES.map((v) => VOCABULARY[v]);
}

/* Notch geometry — 10×10 viewBox, stroked not filled where openness matters. */
const NOTCH_PATHS: Readonly<Record<StatusNotch, string>> = Object.freeze({
  circle: "M5 1.6a3.4 3.4 0 1 1 0 6.8a3.4 3.4 0 1 1 0-6.8Z",
  triangle: "M5 1.4 L8.8 8.4 L1.2 8.4 Z",
  cross: "M2.2 2.2 L7.8 7.8 M7.8 2.2 L2.2 7.8",
  "chevron-down": "M1.8 3.4 L5 6.8 L8.2 3.4",
  wrench: "M2.2 7.8 L5.6 4.4 M5.6 4.4 a2 2 0 1 0 2.2-2.2 l-1.2 1.2 l-1 -1 l-1.2 1.2 a2 2 0 0 0 -1 0.8Z M4.6 5.4 l-2.4 2.4",
  bolt: "M5.8 1.2 L2.8 5.6 L4.8 5.6 L4 8.8 L7.4 4.2 L5.3 4.2 Z",
  seal: "M5 1.2 L6.4 2.4 L8.2 2.2 L8.4 4 L9.6 5 L8.4 6 L8.2 7.8 L6.4 7.6 L5 8.8 L3.6 7.6 L1.8 7.8 L1.6 6 L0.4 5 L1.6 4 L1.8 2.2 L3.6 2.4 Z",
  hourglass: "M2 1.4 L8 1.4 L2 8.6 L8 8.6 M2 1.4 L8 8.6",
  flag: "M2.6 8.8 L2.6 1.4 L8 2.6 L5.4 4.2 L8 5.8 L2.6 5",
  diamond: "M5 1.2 L8.6 5 L5 8.8 L1.4 5 Z",
  clock: "M5 1.6a3.4 3.4 0 1 1 0 6.8a3.4 3.4 0 1 1 0-6.8Z M5 3.4 L5 5 L6.6 5.9",
  "dashed-ring": "M5 1.6a3.4 3.4 0 1 1 0 6.8a3.4 3.4 0 1 1 0-6.8Z",
});

/** SVG path data for a notch. `dashed-ring` additionally needs
 *  stroke-dasharray — see NOTCH_DASH for per-notch paint hints. */
export function notchPath(notch: StatusNotch): string {
  const path: string | undefined = NOTCH_PATHS[notch];
  if (path === undefined) throw new Error(`notchPath: unknown notch "${notch}"`);
  return path;
}

const NOTCH_DASH: Partial<Record<StatusNotch, string>> = Object.freeze({
  "dashed-ring": "1.6 1.2",
  wrench: "0",
});

export function notchDash(notch: StatusNotch): string | undefined {
  return NOTCH_DASH[notch];
}
