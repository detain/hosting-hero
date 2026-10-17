# tools/host — localhost WebSocket relay carrier (dev, ADR-0017)

**Status: in-repo DEV carrier over real sockets.** Owner ruling 2026-10-17
(transport adoption, playable prototype): the co-op hub runs on a real
loopback WebSocket server so two browser seats can actually play together.
This is the thin carrier + tick pump only — the stamp/ledger authority stays
`tools/relay`, the frame laws stay `tools/transport`, and the **production
carrier is unchanged: PHP/Workerman remains the out-of-repo posture**
(OD-5(b)); its acceptance gate is re-running the transport conformance body
over its own port.

Topology (b) — portable-lib: the host **stamps and relays, runs NO sim**.
Browser seats hold their local sims and feed them from the relay-stamped
log (the client side lives in `apps/proto` — lane L-WS-B).

## PASSAGE (run it)

```bash
export PATH="/home/my/.nvm/versions/node/v24.21.0/bin:$PATH"   # pinned pnpm 12.3.4
pnpm install                                                   # once, on a fresh clone
pnpm -F host-tools dev            # prints ws://127.0.0.1:<port> (ephemeral by default)
pnpm -F host-tools dev -- --port 9210
```

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
| Codec, frame kinds, hub verdict grammar, log budget, page clamp | `tools/transport` (`attachRelayHub`) |
| FIFO arrival → hubInbox, seat→socket route learning (participantId peek), counted carrier loss | `src/wsHubPort.ts` |
| The wall clock (`setInterval`) + deterministic `pump()`/`pumpTo()` seam | `src/server.ts` |

`client(seat).poll()` returns empty host-side BY CONTRACT (the host never
reads a seat mailbox — the browser half drains its own socket); the exact
resolved `TransportPort` shapes for BOTH sides of the wire, stated against
`port.ts` (frames in objects, raw JSON bytes out of `poll()`), are pinned in
`test/wsConformance.test.ts` and `test/hostHarness.ts` — that is the
integration contract lane L-WS-B mirrors in the browser.
