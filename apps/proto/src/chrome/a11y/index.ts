/**
 * a11y audit surface (§8.14/§8.16) — explicit barrel, house pattern:
 * contrastAudit (WCAG AA census), motionAudit (strobe budget + reduced-motion
 * scanner), roster (the honest §8.16 ledger), contrastAuditMode (the RUNTIME
 * Contrast Audit Mode — 'a' key: luminance-only render + live re-check; the
 * DOM half, deliberately the barrel's only impure export).
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

export {
  applyDomMarkers,
  auditDomPairings,
  AUDIT_EXEMPT_ATTR,
  AUDIT_FAIL_ATTR,
  buildReportNodes,
  compositeOver,
  CONTRAST_AUDIT_REPORT_ID,
  CONTRAST_AUDIT_SCREEN_ID,
  CONTRAST_AUDIT_STYLE_ID,
  ContrastAuditModeError,
  installModeStyle,
  isContrastAuditModeActive,
  LARGE_TEXT_FLOOR_RATIO,
  modeStyleHueVars,
  MODE_STYLE_CSS,
  mountContrastAuditMode,
  ownVisibleText,
  parseComputedColor,
  pairVerdict,
  readEraTokens,
  readReducedMotion,
  resolvePaintStack,
  TEXT_FLOOR_RATIO,
  textFloorFor,
  toggleContrastAuditMode,
} from "./contrastAuditMode";
export type {
  ContrastAuditModeHandle,
  DomAuditReport,
  DomPairing,
  ModeReport,
  ParsedColor,
  PairVerdict,
  UnresolvedPairing,
} from "./contrastAuditMode";
