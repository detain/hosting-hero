# tools/transport — in-repo co-op transport layer (hh-coop-transport@1)

**Status: in-repo transport TO THE FRAME; the wire itself is the out-of-repo
carrier.** Owner ruling 2026-10-17 (ADR-0016 transport session, "in-repo as
far as it goes"): everything that can be decided and tested in TypeScript
without a network stack lives here — the frame codec, the port abstraction,
one deterministic in-memory carrier, the hub adapter that welds the relay to
a port, the idempotent client, the fog serializer, and the conformance law
body a future socket twin must pass. What does NOT live here: sockets,
rooms, auth, MySQL notary writes, Dragonfly fan-out. Those are Workerman's.

**PASSAGE (how a click becomes a co-op fact):** a player's door intent is
built client-side into a `submit` frame (`codec.encodeFrame`, key order by
construction) → it crosses a `TransportPort` (in-memory today; PHP/Workerman
tomorrow) → `attachRelayHub` drains it, `decodeFrame` parses at the boundary
(every wall in `transport[CODE]` grammar, record revival delegating to the
strict `parseCoopTimelineRecord`), and the trusted record goes to the
`CoopRelay`, the single stamping authority: **the hub stamps `(tick, seq)` —
client hints are telemetry, nothing more (R1)** → the stamped record
broadcasts to LIVE seats and answers every `catchup-request` page-by-page
(`pageCoopLog`, pure read, client cursor is truth) → each client's
idempotence gate absorbs at-least-once duplicates and faults FATAL on a
divergent payload claiming one stamp → `feedToDoor()` normalizes via
`orderCoopTimeline` and emits the exact `ExternalIntent[]` shape
`applyIntentDoor` eats, `clock:"sim"`, `atUs = minutesToSimUs(tick)` — so two
seats over hostile delivery orders still fold byte-equal `digestState` frames
(the permutation suite). The relay never imports transport (cycle-gated);
transport never writes the save ledger (zero save writes through the hub
path — the seat ledger it mirrors is the relay's in-memory copy).

## The eight laws (the PHP side must NEVER re-invent these)

1. **Hub stamps only.** `(tick, seq)` is assigned by the single authority at
   acceptance; Workerman's arrival order *selects* the acceptance tick but the
   hub does the stamping. Client tick hints are ignored on the wire.
2. **Payload opacity until the door.** The hub/relay validates structure
   (a plain-object payload, `args.verb ∈ PLAYER_VERBS`) and nothing deeper;
   semantic refusal belongs to `applyIntentDoor`, translated back as a fault.
3. **Dup absorb, divergent fault.** An identical re-send (same
   `participantId/tick/seq/kind` + `encodeCanonicalJson(payload)` equality)
   is dropped with an observable counter; a different payload claiming the
   same stamp is FATAL `transport[dup-conflict]` — the coopTimeline collision
   law stands; we absorb at-least-once, never split-brain.
4. **Refuse new, never drop old.** The log budget refuses the OVER-cap
   submit with a fault verdict; the standing log stays byte-stable across the
   storm.
5. **Departed freeze.** Broadcast fan-out is LIVE seats only; a departed
   inbox is frozen at departure; a departed seat's page request faults the
   relay's own `relay[not-seated]` grammar.
6. **Re-join is a new tenure.** Ledger rows are per-tenure (`leftAtTick`
   strictly after `joinedAtTick`); the wire adds nothing to this law — it
   mirrors the relay's ledger, absent-never-null-key.
7. **Zero save writes on the catch-up path.** Catch-up is a pure read of
   `sharedLog()` answering the CLIENT's cursor; nothing a joiner receives
   touches the save ledger.
8. **`clock:"sim"` stamping.** Feeds carry `atUs = minutesToSimUs(tick)`;
   business-clock intents are a named deferred rung, not a wire surprise.

## SERVER CONTRACT (I-T §9 — who owns what)

| Layer | Owner | Holds |
|---|---|---|
| Sockets (WebSocket/Workerman), rooms, auth, presence | **PHP/Workerman** | the bytes, the joins-by-permission, the reconnect storm |
| Notary + state: MySQL (ledger/coop rows), Dragonfly (fan-out, cursors) | **PHP/Workerman** | durability and horizontal fan-out |
| Hub LAWS: stamping, seq, dup self-check, paging, budget, ledger tenures | **TypeScript** — `tools/relay` (`CoopRelay`) | the single-authority semantics this package mirrors |
| Frames: codec, port abstraction, in-memory carrier, hub adapter, client idempotence, fog view | **TypeScript** — this package | `hh-coop-transport@1`, the frame contract the PHP side relays byte-opaque |

"One protocol, two carriers" (MASTER_REPORT): the same 8 kinds, the same
`transport[...]` refusals, over the in-memory port today and a Workerman
relay hop tomorrow. The PHP side treats frames as BYTE-OPAQUE envelopes:
forward, retry, page — never re-stamp, never re-interpret, never dedupe with
different semantics than law 3. Clients receive `observed_view(seat)` — the
projection, NEVER the store — and the fog serializer here is field-isomorphic
to the proto's `ObservedCellWire` (drift-pinned against
`apps/proto/src/shared/protocol.ts`).

## Files

- `src/envelope.ts` — protocol literal + version + the 8 frame kinds and
  their wire shapes (`WireUs` strings, omit-when-unset riders, the
  `MAX_FRAME_BYTES = 65_536` // PROVISIONAL cap).
- `src/codec.ts` — `encodeFrame`/`decodeFrame` (boundary parse; oversize
  check BEFORE `JSON.parse`; unknown top-level keys tolerated; unsafe-key
  wall `__proto__/constructor/prototype`; `TransportError` grammar
  `transport[CODE] at 'path': expected {e}, got {d}`, 13 closed codes) and
  the record revival that DELEGATES to `parseCoopTimelineRecord` — the strict
  parser stays the single record authority.
- `src/port.ts` — the carrier contract: `TransportPort` (hub endpoint +
  per-seat mailboxes), `TransportSchedule` (pump-driven law: zero
  self-scheduling, zero timers, zero wall-clock), `DeliveryPolicy` knobs.
- `src/inMemory.ts` — deterministic reference carrier: `delayByKind`,
  kernel-RNG `permutationSeed` (Fisher-Yates via `streamFor(seed,
  "transport/delivery", step)` — never `Math.random`), `duplicateFrameIds`
  byte-identical replays, `dropUntilResume`; hub inbound stays FIFO on
  purpose (acceptance-order law).
- `src/server.ts` — `attachRelayHub` (sync throw → async fault verdict for
  EVERY refusal, worker fault-channel precedent) and `createReplica` (the
  re-hosting witness: append-replay of STAMPED records, never re-stamps;
  writes to a replica fault `relay[replica-authority]`).
- `src/client.ts` — `createTransportClient`: idempotence gate (law 3),
  page-chained `runCatchUp`/`resume` (the whole reconnect story is ONE frame
  type), `feedToDoor()`, bigint revival with a disclosed closed mirror of
  the proto's `BIGINT_ARG_FIELDS`/`NULLABLE_BIGINT_ARG_FIELDS` (drift-pinned
  by source read; consolidation is a noted later call, not forced).
- `src/fog.ts` — `encodeScopedView`/`decodeScopedView` over
  `projectSeat(store, scope)` — truth-but-scope-filtered; out-of-scope keys
  are absent INCLUDING existence.
- `src/index.ts` — explicit barrel (no export-star).
- `test/conformance.ts` — `runTransportConformance(name, factory)`: THE law
  body (15 its). The socket twin reruns the same body; that is the carrier-
  swap acceptance gate.
- `test/{codec,inMemory,hub.conformance,permutations,fog,transportLaw}.test.ts`
  — 84 tests: round-trips + ~16 malformed refusals, determinism byte-traces,
  the R4 resume-paging twin THROUGH FRAMES, hostile-permutation convergence
  (per-frame `digestState` equality, ×100 rebuild, seed-33 control), fog
  A/B twins, the armed zero-timers/zero-escape law scan.

Run: `pnpm -F transport-tools test` (vitest serial) · `pnpm -F transport-tools typecheck`.
Sim usage is exclusively via `@hh/sim-core` subpath exports (`./types`,
`./kernel`, `./replay`, `./observed`); relay usage via the `relay-tools`
barrel. Zero sim-core edits.

## Deferred rungs (named, not silently open)

- **Auth** (who may hold seat "alice") — PHP/Workerman's room layer; the
  `join` frame deliberately carries only `participantId` + telemetry hint.
- **Failover authority** — `createReplica` is a WITNESS (shadow log, ledger
  copy, digest equality), not an implementation: election, fencing, and
  notary-backed handover belong to the carrier.
- **Per-seat salience** — the `view` rider ships whole projections; a
  per-seat filter/priority source is designed (fog.ts seam) but unauthored.
- **Business-clock intents** — every wire stamp is `clock:"sim"` today
  (law 8); a `clock:"business"` intent arm needs a door ruling first.
- **Snapshot + tail resume** — catch-up today is log pages; joining a
  long-running game at frame 400,000 needs the campaign-privilege snapshot
  seam (save lane), which the `seat-state.lastStamp` cursor already keys into.
- **Option-C interference** (ADR-0013 ruling 8 unmodeled) — seat-to-seat
  contention is still not in the sim; the transport neither models nor masks
  it.
- **Browser WebSocketTransport adoption** — a thin `TransportPort` over the
  real `WebSocket` in `apps/proto` (the inMemory twin is its test oracle);
  deliberately the first thing NOT built here.

## PROVISIONAL taste rows (owner ratification owed)

- `MAX_FRAME_BYTES = 65_536` (envelope.ts) — frame cap.
- `DEFAULT_MAX_PAGE_SIZE = 64` (server.ts) — page clamp.
- `DEFAULT_LOG_BUDGET = 10_000` (server.ts) — shared-log cap before
  `transport[log-budget]` refusals.
