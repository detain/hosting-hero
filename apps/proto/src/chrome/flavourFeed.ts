/**
 * Front of House · flavour feed (chrome consumer, v0) — the copy bank gets a
 * mouth. Spec-audit finding g24: packages/content ships hundreds of FLAVOUR
 * templates (press/forum/chatter/ticket/intern/sticky/abuse/canary/loading/
 * vendor) and NOTHING in the UI ever spoke one — only decision-root `alert.*`
 * keys had consumers. This module is the deterministic mouth.
 *
 * Pool law (CLOSED by construction, two deliberate scopes — the first widened
 * by ADR-0014 #D5):
 *  1. PACK SCOPE: the pool draws from EVERY pack `i18n/packStore.ts`
 *     registers — all eleven shipped packs (baseline shared-web + game plus the
 *     nine type packs: backup-archival, colo, dedicated, dns-hosting, exchange-colo,
 *     mail-hosting, object-storage, serverless, trunk-group-voip). The registry widening is
 *     the i18n lane's call and it landed; this feed stays inside the
 *     registration law and inherits the full corpus automatically.
 *  2. SLOT-FREE TEMPLATES ONLY: `fillTemplateBody` takes an EXACT slot set,
 *     and a standing feed has no honest context to fill `{ticket}`/`{node}`
 *     with — inventing filler would be a lie printed in the pack's voice.
 *     Keys with slots stay silent until a contextual consumer arrives.
 *  Eligible = every zero-slot entry of `pack.flavour` — the loader ALREADY
 *  partitioned roots through the §9.3 decision/flavour wall, so a decision
 *  key is unreachable here BY CONSTRUCTION, not by a filter this file trusts.
 *  Cross-pack twins are distinct pool entries keyed (packId, key) — never
 *  deduped by key. Census over the full eleven-pack pool: the four vendor.reply
 *  lines ship slot-free in ALL ELEVEN packs byte-identical, loading.tip.failover
 *  /two-is-one in both baseline packs byte-identical; every cross-pack twin
 *  whose TEXT diverges per pack (abuse.canon.upstream, abuse.canon.customer-
 *  dispute, intern.entry.bill, chatter.desk.stack) is slot-bearing wherever
 *  the pool would double-count it — chatter.desk.stack goes slot-free in
 *  mail-hosting only, so it enters exactly once. No key ever surfaces with
 *  two different texts: the feed never prints a pack-ambiguous line.
 *
 * Order law: the pool is sorted code-unit by key, ties broken by packId
 * (`compareCodeUnits`, the chrome text law) — one stable, locale-free order
 * the pick index can safely count against.
 *
 * Selection law (deterministic, adjacent-distinct): `streamFor(seed,
 * "chrome/flavour-feed", tick)` from the kernel RNG — the SAME seeded stream
 * the sim itself rolls on (proto precedent: g4Session/g1Runner import from
 * `@hh/sim-core/kernel`), so (seed, tick) answers the same line in any
 * runtime, at any point of a replay, with zero module state. The draw is
 * rejection-sampled via `range(n)`. One extra law the panel needs: a tick may
 * never repeat its own previous line — the pick re-draws (same stream, so
 * still pure) until it differs from the previous tick's index over the same
 * pool. A pool of ONE has nothing to be distinct from and idles on it.
 *
 * Era seam: the text resolves through `packStore.t(packId, key, {}, eraYear)`
 * — the era-variant flavour keys (shared-web ships exactly three: the two
 * ticket subjects + the cold-aisle tip; every type pack ships zero) re-word
 * on a flip; every flat key re-derives byte-identically, per the eraState
 * law.
 */
import { asRunSeed, type RunSeed, type SimMinute } from "@hh/sim-core/types";
import { streamFor } from "@hh/sim-core/kernel";
import type { I18nTemplate } from "@hh/sim-core/loader";
import { packOf, PACK_IDS, t, type PackId } from "../i18n/packStore";
import { compareCodeUnits } from "./textLaw";

/* ─────────────────────────────── vocabularies ─────────────────────────────── */

/** The RNG domain literal — stable by kernel law; renaming it re-rolls every
 *  feed sequence on disk, so it is a pin, not a string. */
export const FLAVOUR_FEED_RNG_DOMAIN = "chrome/flavour-feed";

/** The four voice roots the panel wears as filter chips (g24's loudest
 *  mouths). A closed chip vocabulary — the pool may hold more roots than
 *  have chips, never the reverse surprise of a chip with no lines. */
export const FLAVOUR_CHIP_ROOTS: readonly string[] = Object.freeze([
  "press",
  "forum",
  "chatter",
  "ticket",
] as const);

/** Cap on re-draws while seeking a line distinct from the previous tick's.
 *  (1/60)^64 is the practical absurdity; the throw makes the absurd LOUD. */
const MAX_DRAW_CHAIN = 64;

/* ──────────────────────────────── pool shapes ─────────────────────────────── */

export interface FlavourPoolEntry {
  readonly packId: PackId;
  readonly key: string;
  /** First dotted segment — the voice root (press/forum/ticket/…). */
  readonly root: string;
  /** "plain" | "era-variant" — mirrors I18nTemplate.kind for the panel. */
  readonly kind: I18nTemplate["kind"];
}

export interface FlavourLine {
  readonly tick: SimMinute;
  readonly eraYear: number;
  readonly packId: PackId;
  readonly key: string;
  readonly root: string;
  /** The rendered prose, era-resolved, slot-free. */
  readonly text: string;
}

function rootOf(key: string): string {
  const dot = key.indexOf(".");
  return dot < 0 ? key : key.slice(0, dot);
}

function fail(code: string, detail: string): never {
  throw new RangeError(`flavour-feed[${code}]: ${detail}`);
}

/* ────────────────────────────────── the pool ───────────────────────────────── */

function validatePackIds(packIds: readonly PackId[]): void {
  if (packIds.length === 0) {
    fail("empty-packs", "the feed needs at least one registered pack");
  }
  for (const id of packIds) {
    if (!PACK_IDS.includes(id)) {
      fail("unknown-pack", `'${id}' is not registered in packStore [${PACK_IDS.join(", ")}]`);
    }
  }
  const seen = new Set<PackId>();
  for (const id of packIds) {
    if (seen.has(id)) fail("duplicate-pack", `'${id}' listed twice — the pool would double-count it`);
    seen.add(id);
  }
}

/**
 * The CLOSED eligible pool: every zero-slot flavour template of the given
 * registered packs, sorted code-unit by key then packId. Pure over the
 * frozen pack store — same packs in ⇒ same pool out, byte for byte.
 */
export function buildFlavourPool(packIds: readonly PackId[] = PACK_IDS): readonly FlavourPoolEntry[] {
  validatePackIds(packIds);
  const entries: FlavourPoolEntry[] = [];
  for (const packId of packIds) {
    for (const template of packOf(packId).flavour.values()) {
      if (template.slots.length > 0) continue; // slot-free law (header)
      entries.push(
        Object.freeze({
          packId,
          key: template.key,
          root: rootOf(template.key),
          kind: template.kind,
        }),
      );
    }
  }
  if (entries.length === 0) {
    fail("empty-pool", `no slot-free flavour keys in [${packIds.join(", ")}]`);
  }
  entries.sort(
    (a, b) => compareCodeUnits(a.key, b.key) || compareCodeUnits(a.packId, b.packId),
  );
  return Object.freeze(entries);
}

/** The default pool over every registered pack, built once, frozen. */
const DEFAULT_POOL: readonly FlavourPoolEntry[] = buildFlavourPool();

export function defaultFlavourPool(): readonly FlavourPoolEntry[] {
  return DEFAULT_POOL;
}

/** How many pool lines each voice root owns (code-unit sorted). The chip
 *  rail asks BEFORE offering a root: a root with lines is a button, a root
 *  with none is a visibly DISABLED button (a future bank could ship a root
 *  whose every line carries slots — the locked-button law stays). Since the
 *  #D5 widening every chip root speaks: forum's threads finally shed their
 *  slots (eight lines across the type packs). Strictly better than
 *  flavourPoolForRoots throwing at the click. */
export function flavourRootCounts(
  pool: readonly FlavourPoolEntry[] = DEFAULT_POOL,
): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const entry of pool) counts.set(entry.root, (counts.get(entry.root) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => compareCodeUnits(a[0], b[0]));
  return new Map(sorted);
}

/** Narrow a pool to the given voice roots (chip filter). An honest subset —
 *  order preserved, nothing invented; selecting a root with no lines throws
 *  LOUD rather than rendering a dead chip. */
export function flavourPoolForRoots(
  roots: readonly string[],
  pool: readonly FlavourPoolEntry[] = DEFAULT_POOL,
): readonly FlavourPoolEntry[] {
  if (roots.length === 0) return pool;
  const wanted = new Set(roots);
  const filtered = pool.filter((entry) => wanted.has(entry.root));
  if (filtered.length === 0) {
    fail("no-such-root", `roots [${roots.join(", ")}] match no pool line — the chip must never die silent`);
  }
  return Object.freeze(filtered);
}

/* ─────────────────────────────── tick arithmetic ───────────────────────────── */

function validateTick(tick: SimMinute): void {
  if (!Number.isSafeInteger(tick) || tick < 0) {
    fail("bad-tick", `tick must be a non-negative safe integer, got ${String(tick)}`);
  }
}

/**
 * The pool index for `tick` under the adjacent-distinctness law. A pure walk
 * of ticks 0..tick over the SAME pool: each tick opens its own kernel stream
 * (minute-mixed seed ⇒ independent draws per tick) and takes the first
 * `range` draw that differs from the previous tick's index. Same inputs ⇒
 * same index in every runtime; consecutive ticks never repeat a line when
 * the pool has ≥ 2 entries.
 */
export function pickFlavourIndex(seed: RunSeed, tick: SimMinute, poolLength: number): number {
  if (!Number.isSafeInteger(poolLength) || poolLength < 1) {
    fail("bad-pool", `poolLength must be a safe integer ≥ 1, got ${String(poolLength)}`);
  }
  validateTick(tick);
  if (poolLength === 1) return 0; // nothing to be distinct from — idle law
  let previous = -1;
  for (let m = 0; m <= tick; m++) {
    const stream = streamFor(seed, FLAVOUR_FEED_RNG_DOMAIN, m);
    let index = -1;
    for (let draw = 0; draw <= MAX_DRAW_CHAIN; draw++) {
      index = stream.range(poolLength);
      if (index !== previous) break;
      index = -1;
    }
    if (index === -1) {
      fail(
        "draw-chain",
        `${MAX_DRAW_CHAIN + 1} consecutive draws at tick ${m} all repeated the previous line — the stream is not a stream`,
      );
    }
    previous = index;
  }
  return previous;
}

/* ─────────────────────────────── the feed line ─────────────────────────────── */

/**
 * One Front-of-House line: (seed, tick, era) over a pool ⇒ the same prose
 * forever. Era defaults to the CURRENT shared era at CALL time (read it
 * inside your computed and the line re-derives on a flip, eraState law).
 */
export function flavourLineAt(
  seed: RunSeed,
  tick: SimMinute,
  eraYear: number,
  pool: readonly FlavourPoolEntry[] = DEFAULT_POOL,
): FlavourLine {
  const index = pickFlavourIndex(seed, tick, pool.length);
  const entry = pool[index];
  if (entry === undefined) {
    fail("index-out-of-pool", `index ${index} escaped a pool of ${pool.length}`);
  }
  return Object.freeze({
    tick,
    eraYear,
    packId: entry.packId,
    key: entry.key,
    root: entry.root,
    text: t(entry.packId, entry.key, {}, eraYear),
  });
}

/** Convenience for consumers holding a PLAIN seed (the lab's seed prop):
 *  brand it the kernel way — asRunSeed is a cast, so this stays pure. */
export function flavourLineAtSeed(
  rawSeed: bigint,
  tick: SimMinute,
  eraYear: number,
  pool: readonly FlavourPoolEntry[] = DEFAULT_POOL,
): FlavourLine {
  return flavourLineAt(asRunSeed(rawSeed), tick, eraYear, pool);
}
