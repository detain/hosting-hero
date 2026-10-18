/**
 * `src/loader` barrel — the JSON→typed boundary for type-bundles and i18n
 * grammar packs (R46; §9.3 root wall), policy content-decks (G7 program:
 * strict card parse + deckCardHash v1 + the trusted boot.rules book), the
 * _todo placeholder report, the Ruleset Diff Linter (content-CI gate), era
 * availability, and structural wave-table checks.
 *
 * Imports only ../types and ../kernel (owner directive; the ../internal
 * canonical primitive is the sanctioned shared home); the corpus is
 * injected by callers — this module never touches the filesystem (no direct
 * platform access, docs/CONVENTIONS.md §4).
 */

export * from "./boundary.ts";
export * from "./bundle.ts";
export * from "./todo.ts";
export * from "./registries.ts";
export * from "./wavestruct.ts";
export * from "./lint.ts";
export * from "./eras.ts";
export * from "./packs.ts";
export * from "./decks.ts";
