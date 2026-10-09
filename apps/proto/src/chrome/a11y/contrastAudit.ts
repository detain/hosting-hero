/**
 * Contrast Audit (§8.14 "The Two-Channel Law, enforced" + PHASE1-PLAN:165
 * acceptance harness row) — the CI half of the greyscale pass.
 *
 * The spec promotes Contrast Audit Mode from a nice-to-have to a production
 * gate: "it is the mechanism by which the law is checked". The runtime
 * luminance-only RENDER mode (§8.14 heading "Contrast Audit Mode") is still
 * unbuilt — this module ships the PROGRAMMATIC gate: pure WCAG 2.x sRGB
 * relative-luminance math (no deps, no DOM) over a declarative census of
 * every colour pairing chrome actually ships. A pairing that cannot survive
 * here cannot survive greyscale, because WCAG contrast IS a luminance-only
 * measure.
 *
 * Laws this module lives by:
 *  1. PARSE, DON'T VALIDATE — hex strings, roles, weights and era tokens are
 *     parsed at the boundary into frozen trusted shapes; the math never
 *     re-checks.
 *  2. EVERY PAIRING DECLARES ITS ROLE. text ≥ 4.5:1, ui ≥ 3:1 (WCAG AA).
 *     "decorative" is exempt from the floor but must carry a rationale —
 *     an undocumented exemption is exactly how the law rots.
 *  3. FAIL LOUD — an unknown role, unknown ledger hue, malformed hex, bad
 *     weight or duplicate id throws `contrast[CODE]: detail` at parse time.
 *  4. The census is the contract — chrome/__tests__/contrastAudit.test.ts
 *     pins its size, proves every hue used as `color:` text in chrome styles
 *     appears here, and arms a planted failure through the same scanner the
 *     live walk uses. Silence is not a pass.
 *
 * Opacity is modelled honestly: `mix(fg, bg, o)` composited over the same bg
 * reproduces CSS opacity fading text toward its backdrop (sRGB gamma-space
 * blending, matching how browsers composite).
 */
import { HUE_LEDGER } from "../../render/hues";

/* ------------------------------------------------------------------ errors */

export class ContrastAuditError extends Error {
  constructor(code: string, detail: string) {
    super(`contrast[${code}]: ${detail}`);
    this.name = "ContrastAuditError";
  }
}

/* ------------------------------------------------------------- color math */

export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** WCAG 2.x relative-luminance threshold + weights (sRGB, gamma-encoded). */
const SRGB_LINEARIZE_CUTOFF = 0.03928;
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;

/** "#rgb" / "#rrggbb" (any case) → Rgb. Anything else fails loud. */
export function parseHexColor(input: string): Rgb {
  const match = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(input);
  if (match === null) {
    throw new ContrastAuditError("bad-hex", `"${input}" is not #rgb or #rrggbb`);
  }
  const digits = (match[1] ?? "").length === 3 ? (match[1] ?? "").split("").map((d) => d + d).join("") : (match[1] ?? "");
  return Object.freeze({
    r: Number.parseInt(digits.slice(0, 2), 16),
    g: Number.parseInt(digits.slice(2, 4), 16),
    b: Number.parseInt(digits.slice(4, 6), 16),
  });
}

export function toHex(color: Rgb): string {
  return `#${[color.r, color.g, color.b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= SRGB_LINEARIZE_CUTOFF ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG 2.x relative luminance in [0,1]. */
export function relativeLuminance(color: Rgb): number {
  return LUMA_R * linearize(color.r) + LUMA_G * linearize(color.g) + LUMA_B * linearize(color.b);
}

/** WCAG contrast ratio, symmetric, in [1,21]. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** sRGB gamma-space blend, matching `color-mix(in srgb, A w%, B)`. */
export function mixSrgb(a: Rgb, b: Rgb, weightOfA: number): Rgb {
  if (!(weightOfA >= 0 && weightOfA <= 1)) {
    throw new ContrastAuditError("bad-weight", `mix weight ${weightOfA} is outside [0,1]`);
  }
  const chan = (ca: number, cb: number): number => Math.round(weightOfA * ca + (1 - weightOfA) * cb);
  return Object.freeze({ r: chan(a.r, b.r), g: chan(a.g, b.g), b: chan(a.b, b.b) });
}

/* --------------------------------------------------------------- color refs */

/** Declarative color reference — resolved per era by {@link resolveColor}. */
export type ColorRef =
  | { readonly kind: "hex"; readonly value: string }
  | { readonly kind: "era"; readonly token: "surface" | "accent" }
  | { readonly kind: "hue"; readonly name: string }
  | { readonly kind: "mix"; readonly a: ColorRef; readonly b: ColorRef; readonly weight: number };

const MAX_COLOR_DEPTH = 8;

/** Era-resolved pair side: which era tokens a spec needs, plus hex cache. */
export interface EraTokens {
  readonly era: string;
  readonly surface: string;
  readonly accent: string;
}

export function parseEraTokens(input: EraTokens): EraTokens {
  parseHexColor(input.surface);
  parseHexColor(input.accent);
  if (input.era.trim() === "") {
    throw new ContrastAuditError("bad-era", "era label must be a non-empty string");
  }
  return Object.freeze({ era: input.era, surface: input.surface, accent: input.accent });
}

function requireLedgerHue(name: string): Rgb {
  const entry: { readonly job: string; readonly hex: number } | undefined = (
    HUE_LEDGER as Record<string, { readonly job: string; readonly hex: number }>
  )[name];
  if (entry === undefined) {
    throw new ContrastAuditError(
      "unknown-hue",
      `"${name}" is not in HUE_LEDGER — spell it in the ledger first, then audit it here`,
    );
  }
  return parseHexColor(`#${entry.hex.toString(16).padStart(6, "0")}`);
}

export function resolveColor(ref: ColorRef, era: EraTokens, depth = 0): Rgb {
  if (depth > MAX_COLOR_DEPTH) {
    throw new ContrastAuditError("bad-ref", `color ref nests deeper than ${MAX_COLOR_DEPTH}`);
  }
  switch (ref.kind) {
    case "hex":
      return parseHexColor(ref.value);
    case "era":
      return parseHexColor(ref.token === "surface" ? era.surface : era.accent);
    case "hue":
      return requireLedgerHue(ref.name);
    case "mix":
      return mixSrgb(resolveColor(ref.a, era, depth + 1), resolveColor(ref.b, era, depth + 1), ref.weight);
  }
}

/* --------------------------------------------------------------- the roles */

export const AA_MINIMUM_RATIO = { text: 4.5, ui: 3 } as const;
export type AuditRole = keyof typeof AA_MINIMUM_RATIO | "decorative";

const AUDIT_ROLES: readonly string[] = ["text", "ui", "decorative"];

export interface ContrastPairSpec {
  readonly id: string;
  /** file + selector of the shipped pairing this row records. */
  readonly where: string;
  readonly role: AuditRole;
  readonly fg: ColorRef;
  readonly bg: ColorRef;
  /** REQUIRED for decorative rows — why the pairing carries no information. */
  readonly rationale?: string;
}

export interface ResolvedPair {
  readonly id: string;
  readonly era: string;
  readonly where: string;
  readonly role: AuditRole;
  readonly fgHex: string;
  readonly bgHex: string;
  readonly minRatio: number | null;
  readonly ratio: number;
  readonly passes: boolean;
}

export function parseContrastPairSpec(spec: ContrastPairSpec): ContrastPairSpec {
  if (!AUDIT_ROLES.includes(spec.role)) {
    throw new ContrastAuditError("unknown-role", `"${spec.role}" is not one of ${AUDIT_ROLES.join("|")} (${spec.id})`);
  }
  if (spec.role === "decorative" && (spec.rationale === undefined || spec.rationale.trim() === "")) {
    throw new ContrastAuditError("unearned-exemption", `decorative row "${spec.id}" has no rationale`);
  }
  return Object.freeze(spec);
}

export function resolvePair(spec: ContrastPairSpec, era: EraTokens): ResolvedPair {
  const fg = resolveColor(spec.fg, era);
  const bg = resolveColor(spec.bg, era);
  const ratio = contrastRatio(fg, bg);
  const minRatio = spec.role === "decorative" ? null : AA_MINIMUM_RATIO[spec.role as "text" | "ui"];
  const passes = minRatio === null || ratio >= minRatio;
  return Object.freeze({
    id: spec.id,
    era: era.era,
    where: spec.where,
    role: spec.role,
    fgHex: toHex(fg),
    bgHex: toHex(bg),
    minRatio,
    ratio: Math.round(ratio * 100) / 100,
    passes,
  });
}

export function formatPairFailure(pair: ResolvedPair): string {
  return `${pair.id} (${pair.era}) ${pair.role}: ${pair.fgHex} on ${pair.bgHex} = ${pair.ratio.toFixed(2)} < ${
    pair.minRatio
  } — ${pair.where}`;
}

/* ------------------------------------------------- the shipped chrome census */

const hexRef = (value: string): ColorRef => ({ kind: "hex", value });
const eraRef = (token: "surface" | "accent"): ColorRef => ({ kind: "era", token });
const hueRef = (name: string): ColorRef => ({ kind: "hue", name });
const mixRef = (a: ColorRef, b: ColorRef, weightOfA: number): ColorRef => ({ kind: "mix", a, b, weight: weightOfA });

/** hueLaw allowlist neutral — chrome body ink. Keep in sync with
 *  chrome/__tests__/hueLaw.test.ts NEUTRAL_ALLOWLIST (the test proves this
 *  census covers every hex on that allowlist). */
const CHROME_INK = hexRef("#d7e3ea");
const SCREEN_BLACK = hexRef("#05080c"); // ScopeFace CRT black (allowlist twin)
const BLACK = hexRef("#000000");
const WHITE = hexRef("#ffffff");

/** Panel backgrounds are literal color-mix(surface X%, #000) blends. */
const panel = (surfacePercent: number): ColorRef => mixRef(eraRef("surface"), BLACK, surfacePercent);
const panelLightened = (surfacePercent: number): ColorRef => mixRef(eraRef("surface"), WHITE, surfacePercent);
const brightenAccent = (accentPercent: number): ColorRef => mixRef(eraRef("accent"), WHITE, accentPercent);
/** body gradient's LIGHTEST reachable stop: surface + 9% accent radial wash. */
const BODY_WASH: ColorRef = mixRef(eraRef("accent"), eraRef("surface"), 0.09);
/** ChromaMeter's rgba(4,8,12,.88) composited over the era surface. */
const CHROMA_PANEL: ColorRef = mixRef(hexRef("#04080c"), eraRef("surface"), 0.88);

const spec = (
  id: string,
  where: string,
  role: AuditRole,
  fg: ColorRef,
  bg: ColorRef,
  rationale?: string,
): ContrastPairSpec =>
  role === "decorative" && rationale !== undefined
    ? { id, where, role, fg, bg, rationale }
    : { id, where, role, fg, bg };

/**
 * Every colour pairing chrome ships, one row per (usage site, semantic fg/bg
 * relation) that the eye must actually separate. Era-parametric rows (accent
 * text, surface-on-accent) resolve per era in buildChromeInventory.
 */
export const CHROME_CONTRAST_SPECS: readonly ContrastPairSpec[] = Object.freeze(
  [
    // ---- body text -------------------------------------------------------
    spec("ink-on-body", "styles/chrome.css:9 body color over the accent-wash gradient stop", "text", CHROME_INK, BODY_WASH),
    spec("ink-on-topbar", "chrome/TopBar.vue:86 .top-bar text (inherited ink)", "text", CHROME_INK, panel(0.92)),
    spec("ink-on-alert-panel", "chrome/AlertStack.vue:117-118 card ink text", "text", CHROME_INK, panel(0.9)),
    spec("ink-on-popover", "chrome/ExplainPopover.vue:118 body ink text", "text", CHROME_INK, panelLightened(0.94)),
    spec("ink-on-chroma-panel", "chrome/ChromaMeter.vue:46-50 body text", "text", CHROME_INK, CHROMA_PANEL),
    spec("faded-ink-on-alert-panel", "chrome/AlertStack.vue:145 .suppressed ink @ opacity .65", "text", mixRef(CHROME_INK, panel(0.9), 0.65), panel(0.9)),
    // ---- era-accent text --------------------------------------------------
    spec("accent-on-button-wash", "styles/chrome.css:40-41 .hud-buttons button", "text", eraRef("accent"), mixRef(eraRef("accent"), eraRef("surface"), 0.1)),
    spec("accent-on-bezel-panel", "chrome/instruments/InstrumentBezel.vue:70-79 value + readout", "text", eraRef("accent"), panel(0.88)),
    spec("accent-on-counter-bg", "chrome/instruments/CounterFace.vue:23 .digit", "text", eraRef("accent"), panel(0.7)),
    spec("accent-on-clock-ribbon", "chrome/ClockRibbon.vue:185 .scrub button", "text", eraRef("accent"), panel(0.88)),
    spec("accent-on-drawer", "chrome/Drawer.vue:38-39 drawer text", "text", eraRef("accent"), panel(0.9)),
    // ---- accent lightened toward white (heading/permanent rows) -----------
    spec("accent70-on-alert-panel", "chrome/AlertStack.vue:117 .head", "text", brightenAccent(0.7), panel(0.9)),
    spec("accent70-on-popover", "chrome/ExplainPopover.vue:122 header", "text", brightenAccent(0.7), panelLightened(0.94)),
    spec("accent80-on-topbar", "chrome/TopBar.vue:103 .permanent-row chips", "text", brightenAccent(0.8), panel(0.92)),
    spec("accent65-on-clock-ribbon", "chrome/ClockRibbon.vue:178 .head", "text", brightenAccent(0.65), panel(0.88)),
    spec("accent85-on-rail-panel", "chrome/GateRail.vue:153 label", "text", brightenAccent(0.85), panel(0.7)),
    spec("accent45-on-rail-panel", "chrome/GateRail.vue:158 subtitle (weakest accent mix)", "text", brightenAccent(0.45), panel(0.7)),
    spec("accent70-on-lab-panel", "chrome/HudLabPanel.vue:267 .mono/.demo", "text", brightenAccent(0.7), panel(0.92)),
    // ---- inverted active state --------------------------------------------
    spec("surface-on-accent-active", "chrome/GateRail.vue:141-142 selected badge", "text", eraRef("surface"), eraRef("accent")),
    // ---- ledger-hue text ----------------------------------------------------
    spec("alarm-on-alert-panel", "chrome/AlertStack.vue:134 .sev-1 .sev", "text", hueRef("alarm"), panel(0.9)),
    spec("gold-on-alert-panel", "chrome/AlertStack.vue:135,140 .sev-2/.count", "text", hueRef("gold"), panel(0.9)),
    spec("azure-on-alert-panel", "chrome/AlertStack.vue:136 .sev-3 .sev", "text", hueRef("azure"), panel(0.9)),
    spec("alarm-on-body-wash", "chrome/PanicLayout.vue:75,80 .headline--incident", "text", hueRef("alarm"), BODY_WASH),
    spec("amber-on-counter-bg", "chrome/instruments/CounterFace.vue:24 .state-warn .digit", "text", hueRef("amber"), panel(0.7)),
    spec("alarm-on-counter-bg", "chrome/instruments/CounterFace.vue:25 .state-alarm .digit", "text", hueRef("alarm"), panel(0.7)),
    spec("green-on-chroma-panel", "chrome/ChromaMeter.vue:55 h3", "text", hueRef("green"), CHROMA_PANEL),
    spec("alarm-on-chroma-panel", "chrome/ChromaMeter.vue:56 .breach h3", "text", hueRef("alarm"), CHROMA_PANEL),
    spec("fog-grey-amber-on-bezel", "chrome/instruments/InstrumentBezel.vue:82 .fog", "text", hueRef("warm-grey-amber"), panel(0.88)),
    spec("faded-grey-on-topbar", "chrome/StatusChip.vue:56 .tone-faded (TopBar-hosted)", "text", hueRef("grey"), panel(0.92)),
    spec("gold-on-popover", "chrome/ExplainPopover.vue:148 .refusal", "text", hueRef("gold"), panelLightened(0.94)),
    spec("green-on-clock-ribbon", "chrome/ClockRibbon.vue:230 .tone-good", "text", hueRef("green"), panel(0.88)),
    spec("gold-on-clock-ribbon", "chrome/ClockRibbon.vue:231 .tone-warn", "text", hueRef("gold"), panel(0.88)),
    spec("alarm-on-clock-ribbon", "chrome/ClockRibbon.vue:232 .tone-bad", "text", hueRef("alarm"), panel(0.88)),
    spec("azure-on-bezel-panel", "chrome/StatusChip.vue:54 .tone-info (bezel-hosted)", "text", hueRef("azure"), panel(0.88)),
    // ---- UI components (3:1) --------------------------------------------------
    spec("scope-trace-on-screen", "chrome/instruments/ScopeFace.vue:31-32 accent trace on CRT black", "ui", eraRef("accent"), SCREEN_BLACK),
    spec("chroma-border-on-panel", "chrome/ChromaMeter.vue:45 green frame", "ui", hueRef("green"), CHROMA_PANEL),
    spec("alarm-ring-on-bezel", "chrome/instruments/InstrumentBezel.vue:83 .state-alarm ring", "ui", hueRef("alarm"), panel(0.88)),
    spec("snr-fill-on-track", "chrome/AlertStack.vue:126-127 green fill vs grey track", "ui", hueRef("green"), mixRef(hueRef("grey"), panel(0.9), 0.25)),
    // ---- decorative (exempt, but each row EARNED its exemption) --------------
    spec(
      "accent-hairline-frame",
      "many .vue: color-mix(accent 22-40%, transparent) borders",
      "decorative",
      mixRef(eraRef("accent"), panel(0.9), 0.4),
      panel(0.9),
      "framing hairline only — every framed component also carries AA-passing text or an admitted state ring; the border is never the sole identifier",
    ),
    spec(
      "neutral-axis-tick",
      "chrome/ClockRibbon.vue:220,237 pip--tick.tone-neutral grey tick",
      "decorative",
      mixRef(hueRef("grey"), panel(0.88), 0.6),
      panel(0.88),
      "axis tick for the NO-tone case — obligations that DO carry a tone render green/gold/alarm (audited above) and enlarged clocks carry text labels",
    ),
  ].map(parseContrastPairSpec),
);

/* -------------------------------------------------------------------- audit */

function requireUniqueIds(specs: readonly ContrastPairSpec[]): void {
  const seen = new Set<string>();
  for (const s of specs) {
    if (seen.has(s.id)) {
      throw new ContrastAuditError("duplicate-id", `"${s.id}" appears twice in the census`);
    }
    seen.add(s.id);
  }
}

/** Resolve every spec against every era → the full shipped pairing grid. */
export function buildChromeInventory(
  eras: readonly EraTokens[],
  specs: readonly ContrastPairSpec[] = CHROME_CONTRAST_SPECS,
): readonly ResolvedPair[] {
  if (eras.length === 0) {
    throw new ContrastAuditError("bad-era", "inventory needs at least one era token set");
  }
  requireUniqueIds(specs);
  const parsed = specs.map(parseContrastPairSpec);
  const rows: ResolvedPair[] = [];
  for (const era of eras.map(parseEraTokens)) {
    for (const row of parsed) {
      rows.push(resolvePair(row, era));
    }
  }
  return Object.freeze(rows);
}

/** AA violations across the whole grid — empty array means the gate passes. */
export function findAaViolations(pairs: readonly ResolvedPair[]): readonly ResolvedPair[] {
  return Object.freeze(pairs.filter((p) => !p.passes));
}
