/**
 * Unified Clock Ribbon (§7.9, §8.8) — pure model, no Vue.
 *
 * "ALL timers live on one ribbon… the interface promotes exactly three."
 * One strip, `now` CENTERED, history to the LEFT, obligations to the RIGHT,
 * scrubbable in both directions. TWO TRACKS stacked: ops-clock items above
 * (axis = sim clock), business-clock items below (axis = business clock).
 * The tracks deliberately do NOT share an axis scale — the business clock
 * runs ~6,171× realtime (BUSINESS_SCALE_DEFAULT) and the ops clock depends
 * on speed/incident, so any cross-track alignment drawn here would be a lie;
 * what they share is the now-line at 0.5.
 *
 * The three nearest/most-consequential future pips come back ENLARGED
 * (urgency × consequence, ties → sooner then id); everything else is a
 * small grey tick. Past entries are history: colour-coded by tone, never
 * enlarged. Off-window entries are counted (`offscreenCount`), never
 * silently dropped (fatness contract §8.8 — the suppressed stay reachable).
 */
import type { ClockState, SimTimeUs } from "@hh/sim-core/types";
import { compareCodeUnits } from "./textLaw";

export type RibbonTrack = "ops" | "business";

/** Colour channel for history pips (§8.8: history colour-coded by health,
 *  incident/deploy markers). */
export type RibbonTone = "good" | "warn" | "bad" | "neutral";

export interface RibbonEntry {
  readonly id: string;
  readonly label: string;
  /** Which clock the entry is due on — decides its track and axis. */
  readonly track: RibbonTrack;
  /** Absolute due time on its own track's clock (simUs / businessUs µs). */
  readonly dueUs: SimTimeUs;
  /** 0–1 stakes if missed. Urgency is derived from proximity unless given. */
  readonly consequence: number;
  /** Urgency ramp window on the track axis; defaults to the track window. */
  readonly horizonUs?: SimTimeUs;
  /** Past event (history side) instead of an obligation (future side). */
  readonly history?: boolean;
  readonly tone?: RibbonTone;
}

export interface RibbonWindows {
  /** Half-window length per track (from now to each strip end). */
  readonly ops: SimTimeUs;
  readonly business: SimTimeUs;
}

export interface PipPlacement {
  readonly entry: RibbonEntry;
  /** "past" = left of the now-line, "future" = right. */
  readonly side: "past" | "future";
  /** 0 at the now-line → 1 at the strip edge (clamped; scrub can exceed). */
  readonly offset: number;
  /** Derived 0–1: 1 at due, 0 at/beyond the horizon. History reads 0. */
  readonly urgency: number;
  /** urgency × consequence — the §7.9 promotion score. */
  readonly score: number;
}

export interface RibbonModel {
  readonly nowUs: Readonly<Record<RibbonTrack, SimTimeUs>>;
  readonly positions: readonly PipPlacement[];
  /** ≤3 promoted pips (§7.9 three-clock guarantee). */
  readonly enlarged: readonly string[];
  readonly greyTicks: readonly string[];
  /** Wanted the strip but fell outside the window — counted, never hidden. */
  readonly offscreenCount: number;
}

export interface RibbonOptions {
  readonly windows: RibbonWindows;
  /** Scrub shift along each track axis (positive = look further ahead). */
  readonly scrubUs?: Partial<Record<RibbonTrack, SimTimeUs>>;
  /** Promotion capacity; the ribbon law is 3 (§7.9). */
  readonly enlargedMax?: number;
}

const DEFAULT_ENLARGED_MAX = 3;

function trackNow(clocks: ClockState, track: RibbonTrack): SimTimeUs {
  return track === "ops" ? clocks.simUs : clocks.businessUs;
}

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Validate at the boundary — a malformed ribbon entry is a programmer bug,
 *  and it should say so the moment the model is built (Fail Fast law). */
function assertEntries(entries: readonly RibbonEntry[]): void {
  const seen = new Set<string>();
  for (const entry of entries) {
    if (entry.id.length === 0) throw new Error("buildRibbonModel: entry with empty id");
    if (seen.has(entry.id)) throw new Error(`buildRibbonModel: duplicate entry id "${entry.id}"`);
    seen.add(entry.id);
    if (entry.track !== "ops" && entry.track !== "business") {
      throw new Error(`buildRibbonModel: entry "${entry.id}" on unknown track "${entry.track}"`);
    }
    if (!(entry.consequence >= 0 && entry.consequence <= 1)) {
      throw new Error(`buildRibbonModel: entry "${entry.id}" consequence must be 0–1, got ${entry.consequence}`);
    }
    if (entry.dueUs < 0n) throw new Error(`buildRibbonModel: entry "${entry.id}" dueUs negative`);
  }
}

/**
 * The one pure pass: entries + clocks → positioned, promoted, honest.
 * Deterministic: identical inputs give identical output arrays in identical
 * order (positions sorted by track, side, then proximity to now).
 */
export function buildRibbonModel(
  entries: readonly RibbonEntry[],
  clocks: ClockState,
  options: RibbonOptions,
): RibbonModel {
  assertEntries(entries);
  if (options.windows.ops <= 0n || options.windows.business <= 0n) {
    throw new Error("buildRibbonModel: window halves must be positive");
  }
  const enlargedMax = options.enlargedMax ?? DEFAULT_ENLARGED_MAX;
  if (enlargedMax < 0) throw new Error(`buildRibbonModel: enlargedMax must be ≥0, got ${enlargedMax}`);

  const nowUs: Record<RibbonTrack, SimTimeUs> = {
    ops: trackNow(clocks, "ops"),
    business: trackNow(clocks, "business"),
  };

  const positions: PipPlacement[] = [];
  let offscreenCount = 0;

  for (const entry of entries) {
    const window = options.windows[entry.track];
    const scrub = options.scrubUs?.[entry.track] ?? 0n;
    // Delta from the (scrubbed) now-line along the track axis.
    const signed = entry.dueUs - nowUs[entry.track] - scrub;
    const side: PipPlacement["side"] = entry.history === true || signed <= 0n ? "past" : "future";
    const magnitude = signed < 0n ? -signed : signed;
    if (magnitude > window) {
      offscreenCount += 1;
      continue;
    }
    const offset = clampUnit(Number(magnitude) / Number(window));
    const horizon = entry.horizonUs ?? window;
    if (horizon <= 0n) throw new Error(`buildRibbonModel: entry "${entry.id}" horizon must be positive`);
    const urgency =
      side === "future" ? clampUnit(1 - Number(signed) / Number(horizon)) : 0;
    positions.push({ entry, side, offset, urgency, score: urgency * entry.consequence });
  }

  positions.sort(
    (a, b) =>
      compareCodeUnits(a.entry.track, b.entry.track) ||
      (a.side === b.side ? 0 : a.side === "past" ? -1 : 1) ||
      a.offset - b.offset ||
      compareCodeUnits(a.entry.id, b.entry.id),
  );

  const byScore = positions
    .filter((p) => p.side === "future")
    .sort((a, b) => b.score - a.score || a.offset - b.offset || compareCodeUnits(a.entry.id, b.entry.id))
    .slice(0, enlargedMax);
  const enlarged = new Set(byScore.map((p) => p.entry.id));

  return {
    nowUs,
    positions,
    enlarged: byScore.map((p) => p.entry.id),
    greyTicks: positions.filter((p) => !enlarged.has(p.entry.id)).map((p) => p.entry.id),
    offscreenCount,
  };
}

/* ═══════════════════════ clock heads & calendars ═══════════════════════ */

export interface ClockHead {
  readonly kind: "ops" | "business" | "wall";
  readonly label: string;
  readonly display: string;
}

/** Wall clock = elapsed drama time hh:mm:ss (§3.3 three clocks). */
export function formatWallClock(wallUs: SimTimeUs): string {
  const totalSec = Number(wallUs / 1_000_000n);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Business calendar label: a 30-day month every 7 real minutes (§7.13);
 *  day 1 = Month 1 · Day 1. */
export function formatBusinessDate(businessUs: SimTimeUs): string {
  const MICROS_PER_DAY = 86_400_000_000n;
  const elapsedDays = Number(businessUs / MICROS_PER_DAY);
  const day = elapsedDays + 1;
  const month = Math.floor((day - 1) / 30) + 1;
  const dayOfMonth = ((day - 1) % 30) + 1;
  return `Month ${month} · Day ${dayOfMonth}`;
}

/** The three clock heads the ribbon wears above the strip (§7.9 guarantee
 *  that all three clocks are ALWAYS reachable from one place). */
export function clockHeads(clocks: ClockState): readonly ClockHead[] {
  return [
    { kind: "ops", label: "ops", display: `T+${formatOpsElapsed(clocks.simUs)}` },
    { kind: "business", label: "business", display: formatBusinessDate(clocks.businessUs) },
    { kind: "wall", label: "wall", display: formatWallClock(clocks.wallUs) },
  ];
}

function formatOpsElapsed(simUs: SimTimeUs): string {
  const totalMin = Number(simUs / 60_000_000n);
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  return `${hours}h${String(minutes).padStart(2, "0")}m`;
}

/** Whole business-days until a business-track due time (negative = overdue;
 *  fractional remainder counts as one more whole day, exact days stay exact). */
export function businessDaysUntil(businessUs: SimTimeUs, dueUs: SimTimeUs): number {
  const MICROS_PER_DAY = 86_400_000_000n;
  const delta = dueUs - businessUs;
  const sign = delta < 0n ? -1 : 1;
  const abs = delta < 0n ? -delta : delta;
  const whole = abs % MICROS_PER_DAY === 0n
    ? abs / MICROS_PER_DAY
    : abs / MICROS_PER_DAY + 1n;
  return sign * Number(whole);
}
