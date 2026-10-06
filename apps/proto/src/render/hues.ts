/**
 * Hue Ledger — the compile-time registry (§4.7 item 1.2: "each one job";
 * "a violation is a compile error, not a QA find", CONVENTIONS §2).
 *
 * This module is the ONLY place a semantic hue may be spelled. Renderers and
 * chrome import names from here; the BudgetManager admits alert draws by hue
 * identity; the ChromaMeter counts distinct hues in play. Adding a hue with a
 * second job requires editing this file — which is the point.
 */

/** The ledger: hue → its one job. Names are the ledger's, values are display
 *  constants (0xRRGGBB) for the Pixi side and CSS strings for the DOM side. */
export const HUE_LEDGER = {
  cyan: { job: "classification-snap", hex: 0x35e0e6 },
  magenta: { job: "threat-mark", hex: 0xe04fd8 },
  violet: { job: "pre-classification", hex: 0x8f5fe8 },
  gold: { job: "money-moves", hex: 0xe8b23c },
  copper: { job: "power-tree", hex: 0xc97a45 },
  orange: { job: "lens-overlay", hex: 0xf0862e },
  red: { job: "final-state", hex: 0xe23b3b },
  green: { job: "served-ok", hex: 0x4fc46a },
  white: { job: "intent-ink", hex: 0xffffff },
  "ink-blue": { job: "chrome-structure", hex: 0x14202e },
  "warm-grey-amber": { job: "wear-aging", hex: 0x9b8a6f },
  grey: { job: "neutral-aggregate", hex: 0x8a929c },
  amber: { job: "alert-fill", hex: 0xf2b133 },
} as const satisfies Record<string, { readonly job: string; readonly hex: number }>;

export type LedgerHue = keyof typeof HUE_LEDGER;

export function hueHex(hue: LedgerHue): number {
  return HUE_LEDGER[hue].hex;
}

/** The subset whose job is alerting — the Alert Triad draws from this pool.
 *  (Severity vocabulary; non-alert hues can never occupy alert budget.) */
export const ALERT_HUES = ["red", "amber", "orange", "cyan", "magenta"] as const satisfies readonly LedgerHue[];
export type AlertHue = (typeof ALERT_HUES)[number];

export function isAlertHue(hue: string): hue is AlertHue {
  return (ALERT_HUES as readonly string[]).includes(hue);
}
