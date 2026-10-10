/**
 * `@hh/sim-core/src/pipeline` barrel — the §7.13 twelve-step tick shell
 * (MASTER_REPORT §4.1; hosting_game.md §7.13). Gate assembly wires:
 *
 *   const slots = createDefaultSlots(config);        // swap any slot freely
 *   const driver = createTickDriver(slots, rootRng, clocks);
 *   const state0 = createInitialState({...});
 *   const { state, events, ... } = driver.advance(state0, tickInputs);
 *
 * Kernel/contract re-exports stay in src/index.ts — this barrel adds only
 * pipeline-owned surface.
 */

export * from "./driver.ts";
export * from "./defaults.ts";
export * from "./bounce.ts";
export * from "./queue.ts";
export * from "./intent-door.ts";
export * from "./attention.ts";
export { digestState } from "./digest.ts";
