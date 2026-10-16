# tools/relay — co-op node relay SPIKE (ADR-0014 #D6)

**Status: spike, HARDENED 2026-10-16 (lane L-RH). Not the transport.** This
package proves the ADR-0013 co-op contracts survive a Node-side host relay;
the shipped network layer remains PHP/Workerman per OD-5(b), and the
MODULE-STATUS transport row (future) is deliberately untouched. Adoption is a
separate, owner-gated decision. The four LAW FRICTIONS the spike declared open
were resolved in-repo under the owner's session-5 agenda (e) delegation —
see "Frictions: RESOLVED" below; items that are genuinely wire-mechanics stay
listed for the transport lane.

## What the spike is

- `src/relay.ts` — an **in-process** hub that is the single stamping authority:
  it keeps the save/coop seat ledger (join/leave at its own monotonic clock,
  1–4 concurrent writers, half-open `[joined,left)` tenures — same-tick joins
  land in canonical participantId order, re-handoffs append new tenure rows),
  stamps every timeline record with a globally-unique `(tick, seq)` pair,
  self-checks every append with `assertCoopTimelineAppendOrder`, broadcasts to
  per-seat inboxes, delivers relay-side **catch-up** to joiners and re-joiners,
  and re-exports the action arm as the exact `ExternalIntent[]` shape the
  intent door eats — normalized via `orderCoopTimeline`, so arrival order
  cannot matter downstream.
- `src/runner.ts` — a client half: independent `GameState` driven through the
  real `applyIntentDoor`, hashing every frame with the pipeline's `digestState`.
- `test/relay.law.test.ts` — 21 law tests (ledger incl. same-tick canonical
  joins / re-join tenure cycle / relay-side catch-up / joined-scoped freeze,
  stamping, dup-position throws, interleaving-invariant digest, ruling-2
  attribution guard incl. forgery/ghost/off-roster-facet refusals and the
  RATIFIED MIN_WRITERS history posture).
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

## Frictions: RESOLVED in-repo (lane L-RH, owner session-5 agenda (e) delegation 2026-10-16)

The four law frictions the D6 spike declared open for rulings are decided and
implemented. The transport lane (PHP/Workerman, out of repo) now CONSUMES
these laws instead of waiting on them.

1. **Same-tick joins — LAW:** the seat ledger is canonically ordered by
   `(joinedAtTick asc, participantId code-unit)`; multiple seats MAY join at
   one instant. `joinedAtTick` never decreases across rows; the ≤4 concurrent
   half-open cap still holds at every join instant (a same-tick crowd of five
   refuses). **Rationale:** the strictly-ascending rule made a real relay
   batching joins in one tick impossible; any tie-breaker works, and choosing
   a total order that is a FUNCTION OF THE ROW SET (code-unit, the same
   comparison the canonical wire sorts use) makes two hosts applying the same
   joins in any arrival order converge to byte-equal ledgers — save-wire
   determinism, not just playability. **Implementation:** `validateCoopSeatLedger`
   + `seatParticipant` (canonical insertion) in `save/coop.ts`. **Falsifier:**
   relay joins bob-then-alice vs alice-then-bob at tick 0 ⇒ identical ledgers;
   a mis-ordered hand-built same-tick ledger refuses; the 5-at-one-tick crowd
   throws `seats at most 4`.
2. **Re-join = new row — LAW:** a participant may hold MULTIPLE tenure rows iff
   the half-open windows are pairwise disjoint and chronologically ordered
   (a re-join may touch the previous `leftAtTick` — `[a,b)` then `[b,c)` is
   disjoint); an open tenure refuses any second row; `participantSeatedAt`
   resolves PER TENURE (seated iff any row encloses the tick), which is exactly
   the ghost-author leg of `guardCoopAttributionBatch` checking against the
   tenure enclosing the stamped tick; `vacateSeat` closes the participant's
   OPEN row. **Rationale:** ADR-0014 #D6 names "re-join-as-new-row" as part of
   the relay contract; the `SeatHolder` docblock already read "a re-handoff to
   the same participant is a NEW row" — only the v0 validator lagged. **Implementation:**
   `save/coop.ts` (disjointness loop in `validateCoopSeatLedger`, per-tenure
   `participantSeatedAt`, open-tenure `vacateSeat`). **Falsifier:** the full
   leave→re-join→submit cycle runs through the relay; committing at a tick in
   the GAP between tenures refuses `/not seated at tick/`; re-joining while
   seated refuses `/one tenure at a time/`; a re-handoff ledger round-trips
   the canonical save wire byte-identically.
3. **Joiner catch-up — LAW:** on `joinSeat`, the seat's inbox is caught up
   relay-side: a first joiner receives the shared log as of the join tick; a
   re-joiner whose inbox froze at vacate receives only the tail strictly after
   the last stamp they hold — never a record twice (a double stamp would trip
   `orderCoopTimeline`'s collision law at the first `feedFor`). Delivery passes
   through `orderCoopTimeline`, so inboxes start canonically ordered. The
   @24426ec broadcast law STANDS unchanged: fan-out remains current seats only.
   **Rationale:** the v0 incident-room law (@10f05fb) keeps the relay out of
   save state — catch-up is timeline-record delivery, not a Long-Save
   snapshot; snapshot+tail over the wire remains transport work. **Implementation:**
   `deliverCatchUp` in `src/relay.ts` (join path only — never re-broadcasts to
   departed seats). **Falsifier:** mid-run joiner inboxes equal the ordered
   log; the re-join tail test pins `["1:0","5:0","6:0"]` with no duplicate;
   a never-reopened seat's inbox stays frozen as the log grows.
4. **MIN_WRITERS departed-counting — RATIFIED (option a): recorded writers,
   not live seats.** **Rationale:** ruling 2's "One Company, 2–4 writers"
   describes the branch node's lifetime shape; the ledger is append-only
   history by its own law; safety is NOT weakened because the per-write
   seating check still refuses every departed/ghost author its own writes.
   Live-seat counting would couple attribution settlement to who happens to be
   online — transport state — precisely the runtime enforcement this
   validator-not-runtime contract (ADR-0013 ruling 2 status note) refuses.
   **Implementation:** `guardCoopAttributionBatch` docblock names the ratified
   posture; behavior pinned unchanged. **Falsifier:** a 2-recorded/1-live
   company commits for the seated author and refuses the departed one's own
   write; a literally-solo ledger still throws `/at least 2 recorded writers/`.

## Still open for the transport lane (wire mechanics, not law)

- **Seq-per-tick resets to 0 on advance**: fine for the door (M4 is per-feed),
  but a wide-relay monotonic global seq might prefer gap-free ordering across
  ticks; either satisfies the law — transport lane should pick one.
- **Action payloads are opaque dicts** on the timeline; the relay re-checks
  only `args.verb` shape. The door remains the deep authority — the transport
  must not trust anything between (per coop.ts scope note @8c0ff88).
- **Submit-time self-check is O(n²) per run**: `assertCoopTimelineAppendOrder`
  re-scans the whole log on every submit — the transport lane should replace
  it with an incremental (last-record) check.
- **Catch-up is whole-log in-process**: the wire version needs chunked/paged
  delivery and reconnection semantics — latency, resume, per-seat fog all
  belong to the Workerman lane.

## Hard boundaries honored

- The spike itself edited zero files outside `tools/relay/` (the only root
  touch is the `pnpm-lock.yaml` importer entry created by `pnpm install`).
  The L-RH hardening DELIBERATELY landed the ledger laws inside
  `packages/sim-core/src/save/coop.ts` (the file the mission assigns this
  lane; comment-only honesty fix in `save/node.ts`) — zero export-name delta,
  so `docs/api-verify.test.mjs` is unmoved.
- No network layer. In-process transport only — stated honestly because the
  Workerman lane will own latency, reconnection, and per-seat fog.
- Canary note: the canary's default scan target is `packages/sim-core/src`,
  so it does not newly cover this directory; the code still honors every
  forbidden-API law (no `Math.random`/`Date.now`/`new Date`/`Intl`/
  `performance`/float literals — all time and stamps are bigint).
