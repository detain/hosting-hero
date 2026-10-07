/**
 * Text Law — the display-domain twin of Number Law (§8.15).
 *
 * Chrome sorts and formats for the screen; the screen must print the SAME
 * string on every host, so the display domain keeps the engine's own law:
 * no locale collation (`localeCompare`), no ICU formatting (`Intl` /
 * `toLocaleString`) — the sim-core canary enforces this on the SIM side
 * (packages/sim-core/src); chrome carries it here by convention + the
 * hueLaw/displayLaw pin tests.
 */

/** Code-UNIT comparator — the repo's canonical string order (UTF-16 code
 *  units, `<` semantics), locale-independent and stable across engines.
 *  Same law as the replay canonical key sort on the sim side. */
export function compareCodeUnits(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}
