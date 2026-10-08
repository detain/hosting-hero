/**
 * i18n · era state — the shell's era toggle, LIFTED out of App.vue's local
 * ref into a module singleton, following the observedStore pattern
 * (state/observedStore.ts): one `shallowRef`, free functions as the read/
 * write surface, no Pinia, no provide/inject.
 *
 * Why it lives here (i18n/): the era's only consumer today is COPY — the
 * packs carry era-variant templates and every resolution path (`t()`,
 * `describeRefusal`, the notice helpers) reads this ref to pick the year.
 * The shell keeps the VISUAL half of the toggle (data-era on <html>, the
 * 4-token re-skin) by importing the same ref.
 *
 * Reactivity law: readers call `getEra()` (or omit the `eraYear` argument,
 * whose default resolves through it) INSIDE their computed/render effect, so
 * Vue tracks the ref and copy re-derives on a flip; writers call `setEra()`.
 * Plain (non-era-variant) templates resolve byte-identically at every year —
 * flipping the era never churns their words, only their re-evaluation.
 *
 * Law 2: `EraYear` is the closed set of eras the packs actually author
 * (eraCodes 1998/2026 in shared-web; game ships zero era objects) — an
 * unauthored year is unrepresentable at this boundary, so `pickEraText`'s
 * earlier/fallback ladder never sees a caller typo.
 */
import { shallowRef, type Ref } from "vue";

/** The two eras the shipped packs author (shared-web `eraCodes`). */
export type EraYear = 1998 | 2026;

/** The era the toggle starts on — the former packStore.DEFAULT_ERA_YEAR,
 *  kept exact so pinning tests and the initial render never move. */
export const DEFAULT_ERA_YEAR: EraYear = 2026;

/** The single shared toggle. Write ONLY through setEra(). */
export const era: Ref<EraYear> = shallowRef<EraYear>(DEFAULT_ERA_YEAR);

/** The one write path — App.vue's toggle button calls this. */
export function setEra(next: EraYear): void {
  era.value = next;
}

/** Read surface for copy resolvers: the CURRENT era year as a plain int. */
export function getEra(): EraYear {
  return era.value;
}
