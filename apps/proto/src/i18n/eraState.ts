/**
 * i18n · era state — the shell's era toggle, LIFTED out of App.vue's local
 * ref into a module singleton, following the observedStore pattern
 * (state/observedStore.ts): one `shallowRef`, free functions as the read/
 * write surface, no Pinia, no provide/inject.
 *
 * Why it lives here (i18n/): the era's consumer half is COPY — the packs
 * carry era-variant templates and every resolution path (`t()`,
 * `describeRefusal`, the notice helpers) reads this ref to pick the year —
 * AND the ratified campaign-phase skin axis. The shell keeps the VISUAL half
 * of the toggle (data-era on <html>, the 4-token re-skin) by importing the
 * same ref.
 *
 * Reactivity law: readers call `getEra()` (or omit the `eraYear` argument,
 * whose default resolves through it) INSIDE their computed/render effect, so
 * Vue tracks the ref and copy re-derives on a flip; writers call `setEra()`.
 * Plain (non-era-variant) templates resolve byte-identically at every year —
 * flipping the era never churns their words, only their re-evaluation.
 *
 * Law 2 (rewritten per OD-22(c), 2026-10-09b ratified): `EraYear` is the
 * CLOSED era canon — exactly {1998, 2008, 2016, 2026}, the four campaign
 * phases §8.10's corner-radius/surface ladder enumerates. The canon is the
 * LAW axis; the copy has since caught up with it: ADR-0018 program 1a (the
 * L-ER canon quad-rung + the four era-copy fans) landed FOUR-RUNG eraCodes
 * in all fourteen packs and era-variant bodies corpus-wide (42 keys — the
 * per-pack census is machine-pinned by loader/__tests__/era-canon.test.ts
 * and the pack-side roster by packs.test.ts). Inter-rung years (1999, 2011,
 * 2025 …) and per-key unauthored rungs (object-storage's keys speak from
 * 2008; codex.cardinality from 2016) still ride `pickEraText`'s
 * earlier/fallback ladder — the skin changes, the words ride the ladder —
 * so a rung a key never authored is a ratified DEGRADATION, never a caller
 * typo: values outside the canon remain unrepresentable at this boundary,
 * machine-pinned pack-side by loader/__tests__/era-canon.test.ts.
 */
import { shallowRef, type Ref } from "vue";

/** The ratified OD-22(c) era canon, ascending — the single source of both
 *  the `EraYear` union and the shell's toggle cycle order. */
export const ERA_YEARS = [1998, 2008, 2016, 2026] as const;

/** The closed era canon (§8.10 four-phase plan, OD-22 option (c) ratified). */
export type EraYear = (typeof ERA_YEARS)[number];

/** The era the toggle starts on — the former packStore.DEFAULT_ERA_YEAR,
 *  kept exact so pinning tests and the initial render never move. */
export const DEFAULT_ERA_YEAR: EraYear = 2026;

/** The single shared toggle. Write ONLY through setEra(). */
export const era: Ref<EraYear> = shallowRef<EraYear>(DEFAULT_ERA_YEAR);

/** The one write path — the shell toggle and the flavour-feed mirror call
 *  this (directly, or through nextEra()'s cycle). */
export function setEra(next: EraYear): void {
  era.value = next;
}

/** Read surface for copy resolvers: the CURRENT era year as a plain int. */
export function getEra(): EraYear {
  return era.value;
}

/** The cycle law: advance to the NEXT canon year, wrapping 2026 → 1998.
 *  Pure so both mirrors (App.vue's button, FlavourFeed's flip) and the test
 *  share ONE authority — a divergent cycle in either mirror is untypable. */
export function nextEra(current: EraYear): EraYear {
  const index = ERA_YEARS.indexOf(current);
  if (index === -1) {
    throw new Error(`era canon: ${String(current)} is not a ratified era`);
  }
  const next = ERA_YEARS[(index + 1) % ERA_YEARS.length];
  // Unreachable for a valid index over a non-empty tuple — the guard exists
  // because noUncheckedIndexedAccess will not prove modular positions total.
  if (next === undefined) {
    throw new Error(`era canon: no rung after ${String(current)}`);
  }
  return next;
}
