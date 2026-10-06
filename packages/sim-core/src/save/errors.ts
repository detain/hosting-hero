/**
 * Fail-loud error type shared by the save module (code-philosophy Law 4:
 * "halt immediately with a descriptive error"). Mirrors the replay module's
 * ReplayError pattern; kept local because save/ imports ONLY ../types +
 * ../kernel/* (workstream boundary, ARCHITECTURE §7).
 */

export class SaveError extends Error {
  constructor(message: string) {
    super(`save: ${message}`);
    this.name = "SaveError";
  }
}

/** Throw with a descriptive message — used where TS needs `never`. */
export function fail(what: string): never {
  throw new SaveError(what);
}

/** Boundary guard: a required field arrived undefined/missing. */
export function requireDefined<T>(value: T | undefined, what: string): T {
  if (value === undefined) fail(`${what} is required but missing`);
  return value;
}
