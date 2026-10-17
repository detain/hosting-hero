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

- **Loopback bind only (`127.0.0.1`), NO AUTH.** The join frame carries a
  bare `participantId`; anyone who can open the socket owns that seat name
  (last-claim routing). This is a dev prototype.
- **NEVER expose this carrier to the internet** or bind it to a public
  interface. Auth, rooms, and presence are the PHP/Workerman room layer's
  deferred rung (tools/transport README §Deferred rungs) — this package
  deliberately invents none.
- The frame cap is single-sourced: `MAX_FRAME_BYTES` (65_536, PROVISIONAL)
  imported from transport-tools and enforced twice — carrier-close (ws 1009)
  on the wire, codec refusal behind any wider carrier.

## Laws — this file points, it does not restate

The eight transport laws, the R1–R4 wire-mechanics rulings, and the server
contract table all live in **`tools/transport/README.md`** (cited, not
copied). What THIS package adds is carrier behavior only:

| Concern | Where it lives |
|---|---|
| Stamping, seq streams, ledger tenures, dup self-check, paging | `tools/relay` (`createCoopRelay`) |
| Codec, frame kinds, hub verdict grammar, log budget, page clamp, `publish()` fan seam | `tools/transport` (`attachRelayHub`) |
| FIFO arrival → hubInbox, seat→socket route learning (participantId peek), counted carrier loss | `src/wsHubPort.ts` |
| The wall clock (`setInterval`) + deterministic `pump()`/`pumpTo()` seam | `src/server.ts` |
| Topology (a): the host-owned tick — door-feed cursor, driver advance, observed merge (simCoreRunner twin), fogged `viewFor(seat)` | `src/simLoop.ts` |

`client(seat).poll()` returns empty host-side BY CONTRACT (the host never
reads a seat mailbox — the browser half drains its own socket); the exact
resolved `TransportPort` shapes for BOTH sides of the wire, stated against
`port.ts` (frames in objects, raw JSON bytes out of `poll()`), are pinned in
`test/wsConformance.test.ts` and `test/hostHarness.ts` — that is the
integration contract lane L-WS-B mirrors in the browser.

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
