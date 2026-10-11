/**
 * `@hh/sim-core/src/pipeline/recovery` — the §7.7 recovery-half observer
 * (pure, digest-neutral, NEVER touches GameState). The host folds each tick's
 * TickResult.events through `observeRecoveryTick` and reads the derived
 * capacity/failback/window predicates OUT. See tracker.ts for the laws.
 */

export * from "./tracker.ts";
