/**
 * a11y audit surface (§8.14/§8.16) — explicit barrel, house pattern:
 * contrastAudit (WCAG AA census), motionAudit (strobe budget + reduced-motion
 * scanner), roster (the honest §8.16 ledger). Pure law modules: no DOM, no
 * fs — the tests in chrome/__tests__ feed them parsed reality.
 */
export {
  AA_MINIMUM_RATIO,
  buildChromeInventory,
  CHROME_CONTRAST_SPECS,
  ContrastAuditError,
  contrastRatio,
  findAaViolations,
  formatPairFailure,
  mixSrgb,
  parseContrastPairSpec,
  parseEraTokens,
  parseHexColor,
  relativeLuminance,
  resolveColor,
  resolvePair,
  toHex,
} from "./contrastAudit";
export type { AuditRole, ColorRef, ContrastPairSpec, EraTokens, ResolvedPair, Rgb } from "./contrastAudit";

export {
  CHROME_MOTION_SPECS,
  findReducedMotionGaps,
  findStrobeViolations,
  formatMotionGap,
  heartbeatTransitionsPerSecond,
  isStrobeViolation,
  MotionAuditError,
  parseCssBlocks,
  parseMotionSpec,
  scanStyleMotion,
  STROBE_LIMIT_COVERAGE_FRACTION,
  STROBE_LIMIT_TRANSITIONS_PER_SEC,
  stripCssComments,
  transitionsPerSecond,
} from "./motionAudit";
export type { CssBlock, MotionGap, MotionKind, MotionScan, MotionSpec } from "./motionAudit";

export {
  ABSENT_GATE_PROBES,
  ACCEPTANCE_ROSTER,
  liveGateCount,
  rosterRow,
  SHIPPED_A11Y_SURFACES,
} from "./roster";
export type { AcceptanceGateRow, RosterStatus, ShippedA11ySurface } from "./roster";
