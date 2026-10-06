/**
 * topology/ barrel — the Board: logical graph + physical embedding +
 * failure domains + link objects (docs/CONVENTIONS.md §4.2).
 *
 * THE TWO-LAYER LAW, restated for consumers:
 *  - ./graph.ts + ./link.ts + ./contract.ts + ./sockets.ts = what CAN happen
 *    (dependencies, wires, clauses, plugs);
 *  - ./physical.ts + ./domains.ts = what happens TOGETHER
 *    (co-location, shared circuits, shared templates);
 *  - ./blast.ts is where the two layers MEET: a flood over the logical
 *    graph, expanded through materialized domains. Geography never gates
 *    the flood; adjacency never fakes a dependency.
 */

export * from "./graph.ts";
export * from "./physical.ts";
export * from "./domains.ts";
export * from "./blast.ts";
export * from "./link.ts";
export * from "./redundancy.ts";
export * from "./contract.ts";
export * from "./sockets.ts";
