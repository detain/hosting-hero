/**
 * `@hh/sim-core/src/pipeline/recovery` — the §7.7 recovery-half observer
 * (pure, digest-neutral, NEVER WRITES GameState — since ADR-0012 it READS
 * the sim authority's `GameState.recovery` slice through
 * `deriveDurableImpressions` for the window/strike truth). The host folds
 * each tick's TickResult.events (plus the post-advance GameState as
 * `observation.engine`) through `observeRecoveryTick` and reads the derived
 * capacity/failback/window predicates OUT. See tracker.ts for the laws.
 */

export * from "./tracker.ts";
