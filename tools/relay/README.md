# tools/relay — co-op node relay SPIKE (ADR-0014 #D6)

**Status: spike, HARDENED 2026-10-16 (lane L-RH), WIRE MECHANICS LANDED
2026-10-16 (lane T-R, owner session-6 ruling). Not the transport.** This
package proves the ADR-0013 co-op contracts survive a Node-side host relay;
the shipped network layer remains PHP/Workerman per OD-5(b), and the
MODULE-STATUS transport row (future) is deliberately untouched. Adoption is a
separate, owner-gated decision. The four LAW FRICTIONS the spike declared open
were resolved in-repo under the owner's session-5 agenda (e) delegation —
see "Frictions: RESOLVED" below; the four WIRE-MECHANICS debts (seq policy,
payload opacity, O(n²) self-check, paged catch-up) landed in-repo under the
session-6 ruling — see "Wire mechanics: RESOLVED" below.

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
- `test/relay.law.test.ts` — 34 law tests (ledger incl. same-tick canonical
  joins / re-join tenure cycle / relay-side catch-up / joined-scoped freeze,
  stamping incl. the R1 stream law, dup-position throws, interleaving-
  invariant digest, ruling-2 attribution guard incl. forgery/ghost/off-roster-
  facet refusals and the RATIFIED MIN_WRITERS history posture, plus the
  wire-mechanics suites R2 opacity / R3 step-check / R4 paging).
- `test/relay.runners.test.ts` — 8 convergence tests, incl. the headline
  **two-runners-one-digest** claim (seed 904n, 12 ticks, per-frame AND
  terminal `digestState` equality across hostile arrival permutations), a
  seq-swap falsifier, a door-M4 can't-happen pin, a ×100 rebuild gate, and
  the R2 witnesses (opaque verbs converge; deep type-garbage dies at the
  door, not the hub).

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

## Frictions: RESOLVED in-repo @500c134+6d0bc1e (lane L-RH; owner agenda (e) delegation 2026-10-16)

The four law frictions the D6 spike (@9a3d508) declared open for rulings are
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
   through `orderCoopTimeline`, so the tail is canonical; `feedFor` re-normalizes. The
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

## Wire mechanics: RESOLVED in-repo 2026-10-16 (lane T-R; owner session-6 ruling)

The four WIRE-MECHANICS debts this section carried are implemented (R1–R4
below, named in `src/relay.ts`). What remains genuinely out-of-repo is the
PHP/Workerman side: sockets, latency, per-seat fog, and paging policy — the
LAWS the transport must obey, including the page-window contract, are now
pinned here.

1. **Per-seat seq streams — LAW (R1):** every seat owns a strictly-increasing
   seq stream; the hub realizes the streams through a SINGLE LIFETIME-
   MONOTONIC NUMBERING (the per-tick reset is retired — `advanceTo` consumes
   nothing). A seat's stream is the subsequence of stamps bearing its
   `participantId`: strictly increasing, submission-ordered, gap-free (a
   refused submit consumes no stamp). **Why not seat-independent counters?**
   The upstream laws key on `(tick, seq)` IGNORING participantId —
   `orderCoopTimeline` ("claimed by two records") and the door's M4
   ("duplicate (tick, seq) stamp") both refuse the first same-tick cross-seat
   pair — so the SHARED LOG's global `(tick, seq)` uniqueness is PRESERVED,
   tie-free BY CONSTRUCTION: seq values never repeat anywhere, and within a
   tick the stamp order IS submission order (the hand-contention law is
   unchanged; the t8/t10 witnesses moved only their numerals, disclosed
   re-pins, digests never touched). **Falsifier:** re-introducing the reset
   reddens 12 tests (stamp pins, R1 stream law, M4 message, swap falsifier).
2. **Payload opacity until the door — LAW (R2):** the relay's entire say about
   an action is its structural boundary: `payload.args` is a plain object and
   `args.verb` is a string inside the closed `PLAYER_VERBS` enum (./types).
   Nothing deeper is inspected — any door-shaped intent (all ten verbs,
   unknown extra fields included) is stamped, ordered, broadcast and
   re-exported BYTE-IDENTICAL (the feed's `args` is the submitted reference);
   the door's `parseEntry` (M2 `VERB_ARG_SHAPES`) is the sole arg-parsing
   authority — deep type garbage passes the hub and dies at the door's own
   throw, and value-domain problems arrive as refusal RECEIPTS, never relay
   throws. `RELAY_ACTION_BUILDERS` survives as the exported seat-side
   convenience API, decoupled from feed composition. **Falsifier:** removing
   the verb-enum wall reddens the boundary test; copying args in the feed
   (breaking identity) reddens the passthrough test.
3. **One-pass append self-check — LAW (R3):** `submit` validates the append
   with `assertRelayAppendStep` — previous-vs-next ONLY, mirroring the
   upstream message grammar verbatim (M4 dup names both positions) — replacing
   the O(n)-per-append whole-log scan (O(n²) per run) with O(1). The whole-log
   audit (`assertCoopTimelineAppendOrder`) remains the boundary equivalence
   check, pinned in tests over a busy run. Under R1's monotonic stream the
   refusal is unreachable-by-construction — it is the tripwire against relay
   stamping bugs, and falsifiable directly (no-op check reddens it).
4. **Paged catch-up — LAW (R4):** joiner history flows through `pageCoopLog`,
   a PURE function of the log over stamp range (from, →] — strictly-after the
   seat's lastSeen (L-RH law 3 cursor unchanged: dup-never-twice), canonical
   via `orderCoopTimeline`, bounded by a parsed page limit. Because R1's seqs
   never repeat, later growth can only sort AFTER a delivered window: re-pages
   are byte-stable and a resume mid-page-set ends with the identical inbox and
   the identical door feed (pinned twin test). `joinSeat` loops the SAME pages
   to completion (`autoCatchUpOnJoin: true` default — L-RH law 3 stands); wire
   transports may set it false and pump `catchUpPage` at their own latency —
   the page path REQUIRES an open tenure (a departed seat pages nothing: the
   @24426ec freeze holds on this channel too, falsifier-pinned).
   `pendingCatchUp` is the unguarded progress view.

Earlier section, preserved as history: the four LAW frictions (same-tick
joins, re-join-as-new-row, joiner catch-up, MIN_WRITERS posture) were resolved
@500c134+6d0bc1e (lane L-RH) — see "Frictions: RESOLVED" above.

## Test census

42 tests (was 21 law + 6 runners = 27 @`6d0bc1e`): 34 law (21 existing with
the R1 re-pins + R1 streams 2, R2 opacity 3, R3 step-check 2, R4 paging 6) +
8 runners (6 existing + 2 R2 door-authority witnesses: opaque verbs converge,
type-garbage dies at the door).

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
