# tools/host — localhost co-op carrier: relay (b) + host-sim (a) (dev, ADR-0017)

**Status: in-repo DEV carrier over real sockets.** Owner ruling 2026-10-17
(transport adoption, playable prototype): the co-op hub runs on a real
loopback WebSocket server so two browser seats can actually play together.
In the default posture this is the thin carrier + tick pump only — the
stamp/ledger authority stays `tools/relay`, the frame laws stay
`tools/transport`, and the **production carrier is unchanged: PHP/Workerman
remains the out-of-repo posture** (OD-5(b)); its acceptance gate is
re-running the transport conformance body over its own port. The `--sim`
posture (wave-23 ruling 3b) additionally lets this dev host OWN the engine —
see the topology table below; it changes where the sim runs, never who holds
the frame laws.

Topology — TWO postures, side by side (wave-23 ruling 3b, I-TA):

| Topology | What the host does | How | Status |
|---|---|---|---|
| (b) portable-lib — **default** | **stamps and relays, runs NO sim**; browser seats hold their local sims and feed them from the relay-stamped log | `startHost({})` / plain `dev` | playable two-browser demo posture (client side lives in `apps/proto` — lane L-WS-B) |
| (a) host-sim-authoritative | **owns the engine**: one `createTickDriver` world on a fixed boot seed; the host is the ONLY door feeder; per-seat fog (`projectSeat`) is applied host-side and `hub.publish()` fans fresh `seat-state` riders on the host's clock | `startHost({ sim })` / `dev -- --sim [--scope seat:csv]` | the variant-(a) topology question, closed in-repo (see below) |

Both run simultaneously on different ports; the frame protocol is identical —
variant (a) only decides WHERE the sim lives, never WHAT rides the wire
(`publish()` reuses `seat-state`; zero envelope-schema change).

## PASSAGE (run it)

```bash
export PATH="/home/my/.nvm/versions/node/v24.21.0/bin:$PATH"   # pinned pnpm 12.3.4
pnpm install                                                   # once, on a fresh clone
pnpm -F host-tools dev            # topology (b): prints ws://127.0.0.1:<port> (ephemeral by default)
pnpm -F host-tools dev -- --port 9210
pnpm -F host-tools dev -- --sim   # topology (a): the host runs the engine + fog
pnpm -F host-tools dev -- --sim --scope alice:edge --scope bob:all   # per-seat fog table
pnpm -F host-tools dev -- --token SECRET   # OPT-IN dev token auth (seats connect with ?token=SECRET)
```

`--sim` honesty: v0 host-sim runs the PIPELINE physics + observed merge only —
no economy/money lane (the proto runner owns that; the topology-(a) claim
needs no cash, and double-authoring the money fold was refused). `--scope`
narrows one seat's projection; unlisted seats fall back to the estate ("all")
under `--sim` — a shared-world dev demo, fog ISOLATION itself is pinned in
`test/simLoop.host.test.ts`, not demo-guaranteed. The known consumer gap is
named at the bottom of this file.

Two-browser demo — **depends on the L-WS-B client lane landing the browser
WebSocketTransport in `apps/proto`; until that mounts, the dev server speaks
to test harnesses only, not to the game.** When it lands: open the proto
twice with the co-op room pointed at the printed URL, join as two seats,
and watch both doors fold the same stamped log (the relay's
two-runners-one-digest claim, playable).

Tests: `pnpm -F host-tools test` (vitest serial — the ONE timer-bearing
suite in the tools family; the transport/relay packages stay timer-free by
law, and no frame assertion here is timed — see the test headers).

## SECURITY — read this

- **Loopback bind only (`127.0.0.1`), NO AUTH by default — BY RULING**
  (DECISIONS-PENDING records it @af55b61 / ADR-0017; hardening here is
  OPT-IN or a bug-cure, never a reversal). The join frame carries a
  bare `participantId`; anyone who can open the socket owns that seat name
  (last-claim routing). This is a dev prototype.
- **OPT-IN dev token auth (lane L-AUTH):** `startHost({ auth: { secret } })`
  or `dev -- --token SECRET`. Browser WebSockets cannot set headers, and the
  subprotocol slot belongs to the wire-version negotiation, so the token
  rides the connect URL: `ws://127.0.0.1:<port>/?token=SECRET`. The gate
  verifies with `node:crypto.timingSafeEqual` over sha256 digests (length-
  blind) inside the connection handler BEFORE any message listener attaches
  — a refusal closes **1008 "policy violation"** and the hub never sees a
  byte from that socket. Ambiguous `token` arms and absent tokens are their
  own closed reasons (`src/auth.ts`); an empty secret throws at boot. Default
  OFF is byte-for-byte the legacy posture. Still not TLS, not identity, not
  the PHP/Workerman room layer.
- **NEVER expose this carrier to the internet** or bind it to a public
  interface. Rooms and real auth remain the PHP/Workerman room layer's
  deferred rung (tools/transport README §Deferred rungs).
- The frame cap is single-sourced: `MAX_FRAME_BYTES` (65_536, PROVISIONAL)
  imported from transport-tools and enforced twice — carrier-close (ws 1009)
  on the wire, codec refusal behind any wider carrier.

## Carrier laws added here (L-AUTH)

- **Auto-leave on disconnect (default ON, `autoLeaveOnDisconnect: false`
  opts out).** The v0 bug: a socket dropped without a `leave` frame left its
  tenure OPEN forever, poisoning re-join. The cure queues a `leave` FRAME on
  the carrier's only authority channel (the same inbox a browser writes;
  handleLeave stamps it through the same `relay.leaveSeat` law; the hub
  already authors frames it never received — fault frames). Three
  carrier-local gates: last-claim (only routes this socket still owns),
  join-visible (a never-joined socket close queues nothing), suppression
  (this socket already delivered that pid's own leave → exactly ONE vacate,
  zero faults). FIFO ⇒ submits already queued stamp BEFORE the leave. TICK
  LAW DISCLOSURE: the ledger requires `leftAtTick > joinedAtTick`, so a leave
  drained without a clock advance after its join is a named ledger refusal —
  the host's advance-then-drain rituals (pump/pumpTo/interval/step) guarantee
  the synthesized leave always stamps later; raw double-drains ride the same
  law an explicit leave rides. `stop()` shuts synthesis down first (a
  tearing-down carrier answers nobody).
- **The ledger IS the room registry** (v0: one relay per process). There is
  no second room table; a seat-collision over the wire (same participantId
  joins while its tenure is open) is refused by the save/coop double-open-row
  law itself. Disk-verified (test/rooms.host.test.ts): the refusal surfaces
  as a NAMED `SaveError` thrown at the `hub.drain()`/pump boundary with the
  batch's refused mutation state-safe (ledger unchanged) — NOT as a fault
  frame (the coopRoomWire header's v0 phrasing was aspirational; its owning
  lane/closeout owns that text). Presence is ledger state re-fanned: join/
  leave/submit (and `publish()`, @61efe31) push fresh `seat-state` ledgers;
  the open-row count is the room's occupant list.

| Concern | Where it lives |
|---|---|
| Stamping, seq streams, ledger tenures, dup self-check, paging | `tools/relay` (`createCoopRelay`) |
| Codec, frame kinds, hub verdict grammar, log budget, page clamp, `publish()` fan seam | `tools/transport` (`attachRelayHub`) |
| FIFO arrival → hubInbox, seat→socket route learning (participantId + kind peek), counted carrier loss, auto-leave synthesis, auth refusal wiring (1008) | `src/wsHubPort.ts` |
| Token parse + constant-time verify (closed reasons, fail-loud boot) | `src/auth.ts` |
| The wall clock (`setInterval`) + deterministic `pump()`/`pumpTo()` seam + option welding | `src/server.ts` |
| Topology (a): the host-owned tick — door-feed cursor, driver advance, observed merge (simCoreRunner twin), fogged `viewFor(seat)` | `src/simLoop.ts` |

`client(seat).poll()` returns empty host-side BY CONTRACT (the host never
reads a seat mailbox — the browser half drains its own socket); the exact
resolved `TransportPort` shapes for BOTH sides of the wire, stated against
`port.ts` (frames in objects, raw JSON bytes out of `poll()`), are pinned in
`test/wsConformance.test.ts` and `test/hostHarness.ts` — that is the
integration contract lane L-WS-B mirrors in the browser.

**pump()/pumpTo() ritual disclosure (wave-23 review F-3):** in mode (b) the
pumps run ONLY the two-line relay ritual (`advanceTo` + `drain`) and NEVER
call `hub.publish()` — timer-free by law, so a mode-(b) host that wants a
fresh seat-state re-fan between membership events must invoke
`hub.publish()` itself as an explicit ritual step; in mode (a) `sim.step()`
publishes on the host clock.

## Topology (a) — what is proven, what is owed

Pinned in `test/simLoop.host.test.ts` (loopback sockets, manual clock, real
`decodeFrame` consumers): two fresh host sims on the same boot seed produce
**byte-equal engine-digest trails AND byte-equal seat-state transcripts**;
a submitted door intent executes host-side and the materialized device's
cells appear in the SCOPED seat's rider while the narrow seat never sees the
key **including its existence** (fog isolation end-to-end over the wire);
departure freezes a seat's wire across publishes on the host clock; the auto
interval runs mode (a) with zero manual pumps.

Owed, named not hidden:
- **The browser half of (a) is NOT built** — proto mounts its local sim today;
  a thin client that renders the `view` rider instead of a local store awaits
  a proto-side seam (`createTransportClient().observed()` is the read door).
- **No economy/money lane** in host-sim v0 (pipeline physics + observed only).
- **Fog table is host-config, not protocol**: `--scope` is dev ergonomics; a
  production server-owns-sim design must author the seat→scope authority.
