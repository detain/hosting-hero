# tools/relay — co-op node relay SPIKE (ADR-0014 #D6)

**Status: spike. Not the transport.** This package proves the ADR-0013 co-op
contracts survive a Node-side host relay; the shipped network layer remains
PHP/Workerman per OD-5(b), and the MODULE-STATUS transport row (future) is
deliberately untouched. Adoption is a separate, owner-gated decision.

## What the spike is

- `src/relay.ts` — an **in-process** hub that is the single stamping authority:
  it keeps the save/coop seat ledger (join/leave at its own monotonic clock,
  1–4 concurrent writers, half-open `[joined,left)` tenures), stamps every
  timeline record with a globally-unique `(tick, seq)` pair, self-checks every
  append with `assertCoopTimelineAppendOrder`, broadcasts to per-seat inboxes,
  and re-exports the action arm as the exact `ExternalIntent[]` shape the
  intent door eats — normalized via `orderCoopTimeline`, so arrival order
  cannot matter downstream.
- `src/runner.ts` — a client half: independent `GameState` driven through the
  real `applyIntentDoor`, hashing every frame with the pipeline's `digestState`.
- `test/relay.law.test.ts` — 16 law tests (ledger, stamping, dup-position
  throws, interleaving-invariant digest, ruling-2 attribution guard incl.
  forgery/ghost/off-roster-facet refusals, and the v0 re-join refusal pinned
  as friction).
- `test/relay.runners.test.ts` — 6 convergence tests, incl. the headline
  **two-runners-one-digest** claim (seed 904n, 12 ticks, per-frame AND
  terminal `digestState` equality across hostile arrival permutations), a
  seq-swap falsifier, a door-M4 can't-happen pin, and a ×100 rebuild gate.

Run: `pnpm -F relay-tools test` (vitest) · `pnpm -F relay-tools typecheck`.
Sim usage is exclusively via `@hh/sim-core` subpath exports (`./types`,
`./kernel`, `./pipeline`, `./replay`, `./save`) — zero deep imports, zero
sim-core edits.

## What it PROVED

1. **Server-side stamping is sufficient.** One authority assigning
   `(tick, seq)` per coopTimeline's law makes the door's M4 dup-throw
   unreachable-by-construction and makes every seat converge after
   `orderCoopTimeline` normalization — clients never need to agree, only to
   receive the log.
2. **The sim is portable under this feed** (mp-topology decision (b)
   evidence): two independent runners, same stamped feed, different delivery
   order ⇒ byte-equal frames to the terminal digest, deterministically across
   100 rebuilds, and seed-divergent under a different run seed.
3. **`digestCoopTimeline` behaves as the OD-17 contract says**: invariant
   under cross-seat/action/sightline/note interleaving, sensitive to payload.
4. **The ruling-2 attribution guard is host-ready**: seat-ledger-backed
   batches commit through `commitCoopAttribution` on a real lineage node;
   ghosts, forgeries, off-roster facets, empty batches, and sub-minimum
   companies all refuse with ruling-quoting messages.

## What it left OPEN for the transport lane (law frictions)

- **Same-tick joins are impossible** under `validateCoopSeatLedger`'s
  strictly-ascending `joinedAtTick` rule. A real relay batching two joins in
  one tick must stagger or the law needs a tie-breaker. (Pinned as a test.)
- **Re-join is refused**: v0 allows one tenure row per participant — the
  ADR's "re-join=new row" aspiration has **no ledger representation yet**.
  The transport lane needs an owner ruling (extend rows vs. tenure counter).
- **Broadcast fan-out is over current seats only** — a seat that joins
  mid-run receives no history here. Catch-up delivery (snapshot + tail, the
  Long-Save law) is transport-side work this spike does not model.
- **Seq-per-tick resets to 0 on advance**: fine for the door (M4 is per-feed),
  but a wide-relay monotonic global seq might prefer gap-free ordering across
  ticks; either satisfies the law — transport lane should pick one.
- **departed-rows-still-count** quirk found while testing: the attribution
  guard's MIN_WRITERS check reads ledger rows ever recorded, not currently
  seated writers — a 2-seat company where one left still passes as
  "multi-writer". Probably intended (history law); flagging for ratification.
- **Action payloads are opaque dicts** on the timeline; the relay re-checks
  only `args.verb` shape. The door remains the deep authority — the transport
  must not trust anything between (per coop.ts scope note @8c0ff88).
- **Submit-time self-check is O(n²) per run**: `assertCoopTimelineAppendOrder` re-scans the whole log on every submit — the transport lane should replace it with an incremental (last-record) check.

## Hard boundaries honored

- Zero edits to `packages/**`, `apps/**`, `docs/**` (the only root touch is
  the `pnpm-lock.yaml` importer entry created by `pnpm install`).
- No network layer. In-process transport only — stated honestly because the
  Workerman lane will own latency, reconnection, and per-seat fog.
- Canary note: the canary's default scan target is `packages/sim-core/src`,
  so it does not newly cover this directory; the code still honors every
  forbidden-API law (no `Math.random`/`Date.now`/`new Date`/`Intl`/
  `performance`/float literals — all time and stamps are bigint).
