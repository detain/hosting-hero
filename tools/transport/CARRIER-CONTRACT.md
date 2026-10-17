# CARRIER-CONTRACT — the PHP/Workerman production co-op carrier's complete obligation

**Doc status: authoritative contract, zero code.** Owner MP-path ruling: the co-op
transport lives in-repo *to the frame* (ADR-0016 transport session; ADR-0017 #4 —
"production PHP carrier decision UNCHANGED"); the carrier itself is built
**out-of-repo**. This document is that build's obligation: every byte-shape,
error string, law, and conformance rung a production hub must honor. It is
written disk-first — every claim here cites the TypeScript it was verified
against (paths relative to the repo root at commit `529dc91`-era tree;
`tools/transport`, `tools/relay`, `tools/host`, `packages/sim-core/src/save`).
Where this doc and the code ever disagree, the code is authority — file an issue
against this doc.

Reading order: a carrier implementer needs §1–§4. A reviewer needs §2 and §7.

---

## 1. Protocol identity

### 1.1 Name, version, kinds

- Protocol name `hh-coop-transport`, version `1` — literals
  `TRANSPORT_PROTOCOL` / `TRANSPORT_PROTOCOL_VERSION`,
  `tools/transport/src/envelope.ts:36,40`. Every frame carries
  `"protocol":"hh-coop-transport","version":1` as its **first two keys**
  (key order is by construction — see §1.3).
- `TRANSPORT_FRAME_KINDS` is **exactly 8** (`envelope.ts:43-52`), split by
  direction (`envelope.ts:56-57`):

| direction | kinds |
|---|---|
| client → hub | `join`, `leave`, `submit`, `catchup-request` |
| hub → client | `broadcast`, `catchup-page`, `seat-state`, `fault` |

A hub-to-client kind arriving on the hub channel is a `transport[bad-frame]`
fault against the kind (§2.7), never a crash. An unknown kind is refused at
`transport[bad-kind]`; unknown *fields* inside a known kind are **tolerated**
(additive-wire precedent: `boot.corpus`), so a v1 peer and a v1.x peer interop.

### 1.2 Scalar wire laws

| type | wire shape | law |
|---|---|---|
| `WireUs` | decimal **string** (`"65536"`) | bigint has no JSON shape; the encode side runs a `bigintReplacer` (every bigint leaf → decimal string, `codec.ts:185`), the decode side revives bigints at exactly **one** site — `decodeRecordWire` delegating to replay's strict `parseCoopTimelineRecord` (`codec.ts:313`) — and refuses negatives for ticks (`codec.ts` INT_RE wall). |
| `StampWire` | `{"tick": WireUs, "seq": number}` (`envelope.ts:81-84`) | `seq` is a safe non-negative integer; the pair is the timeline's identity. |
| `int` (safe) | JSON number | `limit` etc.: safe-integer ≥ 1 or `transport[bad-limit]`; `seq` ≥ 0. |
| `bool` | JSON boolean | `hasMore`. |
| object | plain JSON object | `payload` is **opaque** (§2.2). Unsafe keys `__proto__` / `constructor` / `prototype` are refused at **any depth** with `transport[unsafe-key]` (`codec.ts:91,155-172`). |
| `null` vs absent | — | **omit-when-unset law:** optional fields are *absent keys*, never null-keys: `clientTickHint`, `limit`, `leftAtTick` (seated), `view`. The decoder absorbs a legacy `leftAtTick: null` into absence (S-12) but encoders must omit. Fields that are *semantically* nullable carry an explicit `null` (`after: null` = from the beginning; `lastStamp: null` = empty log; `from/to: null` on empty pages). |

### 1.3 Canonical bytes

`encodeFrame` builds the wire object as a **literal in fixed key order** —
`protocol`, `version`, `kind`, then the kind's fields in the order tabled below
(`codec.ts:237-279`) — and `JSON.stringify`s it. Consequences for a PHP carrier:

- The reference trace (§4) is recorded in canonical order. For **byte-for-byte**
  trace diffing you must emit the same order; if you compare parsed structures
  instead (digest-per-frame), that also conforms — but then compare per-frame
  canonical-JSON digests plus the terminal `end` witness, not raw text.
- Every decoded frame is deep-frozen; the TS side cannot mutate a frame after
  verdict. Mirror that discipline internally (verdicts, then read-only).

### 1.4 Per-kind field tables (transcribed from `envelope.ts:144-215`)

Key order = the encode order. "req" = required by the decoder.

**`join`** (client → hub) — opens a tenure at the hub's current tick.

| key | type | presence |
|---|---|---|
| `participantId` | string, non-empty | req |
| `clientTickHint` | WireUs | omit-when-unset — **telemetry only, never stamps** (§2.1) |

**`leave`** (client → hub) — closes the seat's open tenure at the current tick.

| key | type | presence |
|---|---|---|
| `participantId` | string | req |

**`submit`** (client → hub) — the only log-growing frame.

| key | type | presence |
|---|---|---|
| `participantId` | string | req |
| `recordKind` | `action` \| `sightline` \| `note` | req |
| `payload` | object | req — opaque (§2.2); an `action`'s payload is the door-intent shape `{args:{verb ∈ PLAYER_VERBS, …}}` |

**`catchup-request`** (client → hub) — pure read; pages the stamped log.

| key | type | presence |
|---|---|---|
| `participantId` | string | req — must have a seat-ledger **row** (open or departed tenure) else `transport[unknown-participant]` |
| `after` | StampWire \| null | req — `null` = from the beginning |
| `limit` | int | omit-when-unset; ≥ 1 or `transport[bad-limit]`; clamped to `maxPageSize` |

**`broadcast`** (hub → client) — one stamped record, fanned to live seats.

| key | type | presence |
|---|---|---|
| `record` | CoopRecordWire | req — `{participantId, tick: WireUs, seq, kind, payload}` in exactly that key order (`envelope.ts:90-96`) |

**`catchup-page`** (hub → client) — one page of the ordered log.

| key | type | presence |
|---|---|---|
| `participantId` | string | req — addressed |
| `from` | StampWire \| null | req |
| `to` | StampWire \| null | req — last record in page; **echoes `after` when empty**; `hasMore` is then the client's continue-cue |
| `records` | CoopRecordWire[] | req |
| `hasMore` | bool | req — hub probes one record past the page; client chains the next request (§2.9) |

**`seat-state`** (hub → client) — the presence/authority snapshot.

| key | type | presence |
|---|---|---|
| `sentAtTick` | WireUs | req — `relay.tick()` at fan time |
| `ledger` | `{seatHolders: [{participantId, joinedAtTick, leftAtTick?}]}` | req — array in **canonical ledger order** (`envelope.ts:101-107`); `leftAtTick` omitted while seated |
| `lastStamp` | StampWire \| null | req |
| `view` | `{cells: TransportCellWire[]}` | omit-when-unset — present **only** for the addressed seat when the hub's `projectionSource` returned a view (§2.10) |

`TransportCellWire` (`envelope.ts:117-126`) is field-isomorphic with the proto
`ObservedCellWire` (drift-pinned): `key`, `encoding ∈ fixed|int|text`,
`value: number|string|null` (**null = "nothing", not zero** — R-66),
`fidelity: 0..4`, `freshnessUs: WireUs`, `coverage`/`certainty: signed WireUs`,
`status ∈ live|stale|unknown`. Cells are code-unit-sorted by `key` —
**Map insertion order is not a wire fact** (`fog.ts`).

**`fault`** (hub → client) — the only verdict frame.

| key | type | presence |
|---|---|---|
| `against` | string | req — the offender token: a `participantId`, or `"frame"` (undecodable bytes — recorded hub-side only, undeliverable), or the offending kind name (wrong-direction), or `"hub"` (client-side) |
| `cause` | string | req — the `transport[…]` / `relay[…]` text **verbatim**; relay-owned refusals carry the relay's own grammar (§2.3) |

### 1.5 The thirteen error codes (verbatim, `codec.ts:50-64`)

`bad-json`, `bad-frame`, `bad-protocol`, `bad-version`, `bad-kind`,
`bad-field`, `unsafe-key`, `oversize-frame`, `bad-limit`,
`unknown-participant`, `not-seated`, `log-budget`, `dup-conflict`.

Grammar (single-sourced, `codec.ts:75`):

```text
transport[CODE] at 'path': expected {expectation}, got {description}
```

`{description}` renders `null` as `"null"`, arrays as `"array"`, strings as
`"string <first 40 chars>"`. Live renderings (all probe-captured, Appendix A):

```text
transport[bad-json] at 'frame': expected JSON object, got string Expected property name or '}' in JSON at
transport[unknown-participant] at 'catchup-request.participantId': expected a participant with a seat-ledger row (open or departed tenure), got string dave
transport[log-budget] at 'submit': expected shared log shorter than the budget (2 records), got string log holds 2
transport[bad-frame] at 'frame.kind': expected a client-to-hub frame, got hub-to-client kind "seat-state" on the hub channel
transport[dup-conflict] at 'inbox(2:0)': expected an identical re-send (at-least-once delivery), got string a divergent payload claiming the same (t
```

The relay keeps its **own** grammar `relay[CODE]: detail` with codes (from disk:
`new RelayError(...)` sites in `tools/relay/src/relay.ts`): `not-seated`,
`bad-action`, `bad-kind`, `bad-page-size`, `clock-went-back`, `no-seats`. The
hub forwards these verbatim inside `fault.cause` (ghost-submit probe, Appendix
A): a PHP hub must mirror relay-owned wording, not re-word it — the TS tests
pin phrases.

### 1.6 The three caps — PROVISIONAL, and this carrier is their ratification path

| cap | value | enforced at | status |
|---|---|---|---|
| frame size | `MAX_FRAME_BYTES = 65_536` | codec, **before** `JSON.parse` (raw length + UTF-8 bytes, `codec.ts:436`) **and** by the host carrier as `maxPayload` → close 1009 (`tools/host/src/wsHubPort.ts`) | PROVISIONAL |
| shared log length | `DEFAULT_LOG_BUDGET = 10_000` | hub pre-check at `handleSubmit` (`server.ts:109,235-243`) | PROVISIONAL |
| catch-up page clamp | `DEFAULT_MAX_PAGE_SIZE = 64` | hub clamps `min(frame.limit ?? pageSize, maxPageSize)` (`server.ts:108,300`) | PROVISIONAL |

Page **default** when a request omits `limit` is the relay's
`DEFAULT_CATCH_UP_PAGE_SIZE = 8` (`tools/relay/src/relay.ts:133`) — distinct
from the 64 clamp; both knobs pass through `attachRelayHub` options.

These stay PROVISIONAL **by owner ruling, precisely because real measurement
gates them** (ADR-0017 #6 "STANDS" list names all three: `real-carrier gate`).
This document **is** that gate: the production carrier's job includes running
frame-size, log-length, and page-throughput measurement against real Workerman
traffic and returning the numbers for ratification. Until then, honor the
TS defaults exactly as configured values, not as guesses.

---

## 2. The laws a carrier must never re-invent

The hub (your PHP process) welds a `CoopRelay` (stamp authority,
`tools/relay/src/relay.ts`) to a port by draining raw bytes, decoding via the
codec rules above, and dispatching. Its shape is `attachRelayHub(relay, port,
{projectionSource?, pageSize?, maxPageSize?, logBudget?})`
(`tools/transport/src/server.ts:54-70`) — reproduce these behaviors. The eight
laws below are transcribed from `tools/transport/README.md` §"The eight laws";
each carries its code cite.

**2.1 Hub stamps only (R1).** `(tick, seq)` is assigned by the single authority
at acceptance. `join`/`submit` stamp at `relay.tick()`; `clientTickHint` is
ignored on the wire (`relay.ts:409-412,493-505` — lifetime-monotonic `seq`:
never resets, and a **refused** submit consumes no seq). Workerman's arrival
order *selects* the acceptance tick; you never relay a client-provided stamp
into the log. Global `(tick, seq)` uniqueness holds across seats —
`orderCoopTimeline` and the door's M4 wall key the pair **ignoring**
participantId; per-seat streams are subsequences by `participantId`.

**2.2 Payload opacity until the door.** The hub validates structure only: plain
object, and for `action` records `payload.args` a plain object with
`args.verb ∈ PLAYER_VERBS` (string) — **nothing deeper**
(`relay.ts:355-372`). Semantic refusal belongs to `applyIntentDoor` in the
sim-core; whatever the door says comes back as a receipt/fault translated
through the existing vocab. A carrier that parses `args.target` to make policy
has broken v0's iron law (zero-protocol-change on verb growth).

**2.3 Client idempotence — dup absorb, divergent FATAL.** At-least-once
delivery is the carrier's *privilege*; the client's gate is the law
(`client.ts:231-246`). Identity = `participantId + tick + seq + kind +
encodeCanonicalJson(payload)`. Identical re-send → absorbed,
`duplicatesDropped + 1`, never silent, never thrown. Same `(tick, seq)` with a
**divergent** payload → `transport[dup-conflict]` **throws** — fatal by design:
the collision law from `save/coop`/`replay` pulled forward to the wire, so the
door's M4 throw is unreachable-by-wire-dup. The hub never dedupes (its log
can't contain two stamps alike — R1 guarantees it); the **client** absorbs.
Relay-owned refusals keep relay wording (§1.5).

**2.4 Refuse new, never drop old.** The hub checks `logBudget` **before**
touching the relay (`server.ts:235-243`): at capacity, a `submit` answers
`transport[log-budget]` to the submitter and the shared log is **untouched**.
No eviction, no truncation anywhere in the stamped log — v0 refuses
(`README` §the budget; probe P8).

**2.5 Departed freeze.** Broadcast fan-out and seat-state fan reach **live**
seats only (`relay.ts:433-443`, ruled @`24426ec`): a departed tenure is frozen
at its last moment — it keeps its inbox, receives nothing new, and its ledger
**row remains** (history law). Trace legs (6)–(7) witness `bob` missing the
post-departure broadcast.

**2.6 Re-join is a new tenure.** L-RH law 2 (`packages/sim-core/src/save/coop.ts`):
the ledger is append-only rows `[joinedAtTick, leftAtTick)`; a re-handoff
starts a fresh row with strictly-later `joinedAtTick` (boundary-touch legal:
`[0,1)+[1,∞)`); overlapping or reopening-over-an-open-row is a **`SaveError`**
throw (§2.7), never a silent merge. A departed seat's `catchup-request` is
refused `relay[not-seated]` (`catch-up pages flow only while a tenure is open`);
a never-seated one is refused `transport[unknown-participant]` — the two
grammars name the two layers that decided.

**2.7 Transport writes no save.** The hub mirrors the relay's **in-memory**
seat ledger; nothing on this path writes a save file (§9.1's postmortem
materialization is the save lane's job — see §3). The per-record validation
boundary sits in the transport codec by co-op-lane ruling m2 @`8c0ff88`.

**2.8 `clock:"sim"` only.** A wire action becomes the door intent
`ExternalIntent{tick, intent:{seq, clock:"sim", atUs: minutesToSimUs(tick),
origin:"player", payload:{kind:"player-verb", args}}}` (`client.ts feedToDoor`)
— the relay-side twin is `feedFrom`. Business-clock intents are a named
deferred rung (§6); until that ruling exists, the carrier transports **no**
wall-clock semantics: latency enters the sim only as hub-acceptance ticks
(ADR-0017 #4).

**2.9 Pure-read paging (R4).** `pageCoopLog(records, after, limit)` is a pure
read of the canonically ordered log (`relay.ts:252-262`): strictly-after
cursor, byte-stable windows, safe-int limit. Empty page echoes `to = after`;
`hasMore` is decided by probing one past the page (`server.ts:256`). The
**client cursor is truth**: `runCatchUp()` then auto-chains while `hasMore`,
one frame type carrying the whole reconnect story (`client.ts:319`).

**2.10 The fog is the engine's, the seam is yours.** A seat receives a
PROJECTION, never the store (`packages/sim-core/src/observed/view.ts
projectSeat`; `fog.ts`). The hub's `projectionSource(seat)` is the one place
the host decides per-seat views; riders attach to `seat-state` for the
addressed seat only, and are **omitted** (key absent, not null) when no view
is wired — trace legs (1)–(2) show `alice` riding `view` while `bob`/`carol`
don't. The v0 host wires this only in mode (a) (host-sim, `tools/host/README.md`
F-3) — a production carrier for relay-only rooms must wire its own
projectionSource per §5.

### 2.11 Hub behavior the carrier must reproduce (beyond the eight)

- **Dry tenure on join.** The wire stack builds the relay with
  `autoCatchUpOnJoin: false` (`server.ts:222-227`): `join` opens the tenure and
  the hub sends `seat-state` — the client then pumps `catchup-request` itself.
- **Fan order.** After every mutation the hub re-fans the full ledger to live
  seats **in ledger order** (`server.ts:163-183`); after a submit it broadcasts
  first, then fans seat-state — the trace shows this order per drain batch.
  Presence IS the re-fanned ledger (no second room table).
- **`publish()`.** A timer-free, idempotent-per-call re-fan seam
  (`server.ts:321-325`): stamps nothing, advances nothing; a host clock that
  wants fresh riders between mutations calls it.
- **Verdict split — THE most PHP-relevant law.** `hub.drain()` **never throws
  on wire verdicts**: every `TransportError`/`RelayError` becomes a `fault`
  frame to the offender; undecodable bytes fault `against:"frame"` recorded
  hub-side only (undeliverable — you cannot address a frame you can't parse;
  `server.ts:274-287`). But **any other throw propagates** (`server.ts:311`):
  ledger-law refusals are `SaveError`s and they crash the drain on purpose —
  "refusals have names, real bugs stay crashes." A PHP hub that catches
  `SaveError` and folds it into a fault frame **violates this contract**: the
  double-open / same-tick-leave / re-handoff-overlap family must surface as an
  exceptional room-teardown (or retry) path, with the **state-safe** guarantee
  honored — a refused batch leaves the ledger byte-unchanged (disk-proven:
  `tools/host/test/rooms.host.test.ts` double-open; probes P1/P2 verbatim).
- **Pump law.** Zero timers, zero self-scheduling, zero wall-clock reads inside
  transport/relay; time moves only when the host drains and advances. A
  Workerman timer may *schedule* drains; it must never feed timestamps the core
  consumes.
- **Hub inbound is FIFO in carrier arrival order — ON PURPOSE**
  (`port.ts:44-51,67-72`): arrival order selects the acceptance tick (§2.1).
  Reorder/delay/permutation knobs belong **only** to client-facing delivery
  (the inMemory carrier's `permutationSeed` is a test instrument; a production
  carrier may reorder/drop client channels freely — the laws above make that
  safe).

### 2.12 Connection-layer truths (L-AUTH, `tools/host/src/{auth,wsHubPort}.ts` @`2b0a882`)

- **Token rides the connect URL** (`?token=`) — browser WebSocket cannot set
  headers; the `Sec-WebSocket-Protocol` slot is **reserved** for wire-version
  negotiation and unused today. Auth is a **connection gate, not an identity
  binding**: anyone holding the token may claim any seat name (seat-name
  ownership binding is a named deferred rung, §6). Comparison is
  sha256-then-`timingSafeEqual` (length-blind); failure reasons are the closed
  set `missing-token | ambiguous-token | bad-token`. An empty configured secret
  **throws at boot** (`host[auth-secret]: auth.secret must be a non-empty
  string — omit the auth option entirely for the standing localhost-no-auth
  posture`) — fail-loud; never boot an auth gate that admits everything.
- **Rejected connection = close `1008` ("policy violation") from the connect
  handler, BEFORE any message listener attaches** — the hub never sees a byte
  (proven: `tools/host/test/auth.host.test.ts`).
- **Oversize inbound = close `1009`** with `maxPayload = MAX_FRAME_BYTES`
  (single source — import the constant's value, don't re-type it); the codec's
  `oversize-frame` wall stays behind it as defense-in-depth.
- **Connection close ⇒ the carrier AUTHORS THE LEAVE FRAME.** A dead socket
  cannot send; if the carrier stays silent the tenure strands open forever
  (and the MIN_WRITERS history law miscounts — it counts **recorded** writers
  across the ledger's life, RATIFIED @`24446fc`). The host cure (`wsHubPort.ts`,
  default ON, `autoLeaveOnDisconnect:false` opts to the v0 open-forever
  posture): the close handler queues a plain `leave` frame into the hub inbox
  — the carrier's only authority channel — so it stamps through the **same**
  `handleLeave` path. Three gates, each mandatory: **last-claim** (route still
  points at the dying socket), **join-visible** (that socket delivered this
  pid's `join`), **suppression** (the socket delivered its own `leave` →
  exactly one vacate). Either re-synthesizing the frame OR relaying an explicit
  leave is conformant — what must land is the hub's leave path. Shutdown
  ceases synthesis (a planned stop must not resurrect leave storms).
- **FIFO consequence:** submits already queued ahead of a close stamp **before**
  the synthesized leave — arrival order is semantics, not incident (§2.11).
- **Same-tick leave-after-join is ledger-illegal** (strict-after, §2.6 + probe
  P2): the host ritual is **advance-then-drain**, which guarantees synthesis
  stamps later. A PHP carrier must not schedule a leave at the join tick — or
  it surfaces as a propagated `SaveError`, §2.11.
- **Send to unknown/closed seat = counted carrier loss, never a throw**
  (`wsHubPort dropped()`); a decode-just-to-route carrier peeks only
  `participantId` + `kind` and still rides undecodable bytes to the hub for the
  codec verdict.

---

## 3. Storage roles — MySQL notary, Dragonfly mirror (ratified architecture)

Per the ratified split (R-2, `reports/MASTER_REPORT.md:42`; restatements C1/C5/C7
at `:63,:88,:92,:94`; §3 table `:164`): the TS sim core is authority;
PHP/Workerman own transport, persistence services, and the **notary**. For the
co-op carrier that means:

- **MySQL = append-only notary + ledger mirror — NEVER a live read path.**
  Persist the stamped timeline as it arrives: the relay's log **is** the input
  record (C5: "append-only receipts: seed + checkpoints + ledger snapshots +
  input logs"). Store run identity (boot seed `904n`-style conventions are data,
  not protocol — ADR-0017 #4), seat ledger snapshots (the re-fanned `ledger`
  objects are already the canonical shape), and terminal witnesses
  (`lastStamp`, `timelineDigest`) so a **notarized replay-verify** can diff the
  reconstruction (Node port) against what the hub stamped. Rule-book version
  history + audit rows likewise stay MySQL-side (C1). The §9.1 promise that the
  shared incident timeline "produces a postmortem automatically" is discharged
  by the save/replay lanes reading this notarized timeline (facets: `scars` +
  `museum` only — `packages/sim-core/src/save/coop.ts` `COOP_BRANCH_FACETS`;
  customers/cash stay company-level); the carrier **never interprets records**
  and never writes save files (§2.7). **The relay in RAM is the sole authority
  for live reads** — catch-up pages, submit verdicts, seat-state — MySQL lag
  must never block or bend a `submit`.
- **Dragonfly = cross-process fan-out + hot mirror.** Relay caches and cloud
  read-models (C7): presence caches, seat-state read-throughs for reconnecting
  browsers, cross-process notification. It must never answer a
  `catchup-request` from cache — pages read the authority's RAM log (R4 pure
  read). **v0 constraint stated plainly: one authority process per room.** The
  in-repo hub holds a single `CoopRelay`; horizontal room-sharding and
  authority handover are the deferred failover election (§6) — Dragonfly may
  accelerate fan-out toward seats the authority process doesn't own, but until
  an election law exists, a room has exactly one stamper.

---

## 4. Conformance — the two rungs

### 4.1 RUNG 1 (mandatory, CI-safe): canonical JSONL frame-trace replay

A conformant carrier is proven by **replaying a frame trace** and matching,
frame-for-frame and witness-for-witness. No sockets, no timers — a pure
stdin/stdout harness; safe for any CI.

**Trace format** — one JSON object per line, in this closed line-kind set:

| line | fields | replay action |
|---|---|---|
| `{"c":"in", "s":seat, "f":frame}` | `s` = the seat whose socket carried the bytes | append canonical bytes of `f` to the hub inbox (in line order) |
| `{"c":"in", "s":seat, "synth":what, "f":frame}` | marker only — e.g. `auto-leave-on-close` | as above; the marker documents the carrier authored it (§2.12) |
| `{"c":"tick", "t":n}` | `n` = sim minute, decimal string | `relay.advanceTo(BigInt(n))` |
| `{"c":"drain"}` | — | `hub.drain()` |
| `{"c":"out", "s":seat, "f":frame}` | hub-authored bytes toward `s` | assert the hub's next emission toward `s` in fan order equals canonical bytes of `f` (or its per-frame canonical digest, §1.3) |
| `{"c":"resend", "s":seat, "f":frame}` | carrier-side re-delivery of bytes already sent | deliver `f` to that seat's mailbox WITHOUT a hub drain — the client (TS) must absorb it, the hub must never see it |
| `{"c":"end", …}` | terminal witness | compare all fields (§4.3) |

**The scripted scenario** (9 legs; every leg witnesses a §2 law):
(1) `alice` joins, drain; `bob` joins, drain — same-tick joins converge to
canonical `participantId` order in the ledger, and `alice`'s join CARRIES
`"clientTickHint":"999"` at hub-tick 0 while the ledger still opens her at `"0"`
(R1 telemetry-only witness — the hint never reaches the stamped log: the terminal
digest is identical to a hint-less run); `alice`'s seat-state carries the
`view` rider (projectionSource wired for `alice` ONLY), `bob`'s omits the key.
(2) advance to tick 2; `bob` submits an `action`; drain — hub stamps `(2,0)`.
(3) the carrier re-delivers the same `broadcast` bytes to `alice` (`resend`) —
absorbed, `duplicatesDropped = 1`, inbox unchanged. (4) tick 3 `alice` submits
`(3,1)`; tick 4 `bob` submits `(4,2)`. (5) tick 5 `carol` joins — **dry
tenure** (§2.11) — then `catchup-request after:null` → page 1 `[(2,0),(3,1)]`
`hasMore:true` → client auto-chains `after:{3,1}` → page 2 `[(4,2)]`
`hasMore:false` (hub `pageSize: 2` forces the two-page shape). (6) tick 6
`bob.leave()` — `leftAtTick:"6"` rides every subsequent ledger. (7) tick 7
`alice` submits `(7,3)` — fan reaches `alice` + `carol` only; `bob`'s inbox is
frozen at 3 records (§2.5). (8) `carol`'s socket closes **without a leave** —
the carrier synthesizes the `leave` frame (§2.12), drained at tick 7 > joined
5 (strict-after satisfied). (9) terminal `end` line.

**Generation recipe** (deterministic — two independent runs of the recording
carrier produced byte-identical files): relay `createCoopRelay({autoCatchUpOnJoin:
false})`; hub `attachRelayHub(relay, port, {pageSize: 2, projectionSource:
alice → [lane/ingress-1::routedExpress int 7 …]})`; clients drive only through
`createTransportClient(port, seat)` calls in the order above; the recording
carrier stamps no bytes and reads no clock. Payload notes are the fixed strings
`hello-from-bob` / `note-from-alice` / `third-from-bob` / `post-departure`, all
via `{args:{verb:"communicate", target:null, note}}`.

**Reference trace** — 57 lines; every `f` object below round-trips through the
real codec (`encodeFrame(decodeFrame(JSON.stringify(f))) === JSON.stringify(f)`,
verification ritual output in §4.5):

```jsonl
{"c":"in","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"join","participantId":"alice","clientTickHint":"999"}}
{"c":"drain"}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"0","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"}]},"lastStamp":null,"view":{"cells":[{"key":"lane/ingress-1::routedExpress","encoding":"int","value":7,"fidelity":0,"freshnessUs":"0","coverage":"65536","certainty":"65536","status":"live"}]}}}
{"c":"in","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"join","participantId":"bob"}}
{"c":"drain"}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"0","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0"}]},"lastStamp":null,"view":{"cells":[{"key":"lane/ingress-1::routedExpress","encoding":"int","value":7,"fidelity":0,"freshnessUs":"0","coverage":"65536","certainty":"65536","status":"live"}]}}}
{"c":"out","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"0","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0"}]},"lastStamp":null}}
{"c":"tick","t":"2"}
{"c":"in","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"submit","participantId":"bob","recordKind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"hello-from-bob"}}}}
{"c":"drain"}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"bob","tick":"2","seq":0,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"hello-from-bob"}}}}}
{"c":"out","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"bob","tick":"2","seq":0,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"hello-from-bob"}}}}}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"2","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0"}]},"lastStamp":{"tick":"2","seq":0},"view":{"cells":[{"key":"lane/ingress-1::routedExpress","encoding":"int","value":7,"fidelity":0,"freshnessUs":"0","coverage":"65536","certainty":"65536","status":"live"}]}}}
{"c":"out","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"2","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0"}]},"lastStamp":{"tick":"2","seq":0}}}
{"c":"resend","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"bob","tick":"2","seq":0,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"hello-from-bob"}}}}}
{"c":"tick","t":"3"}
{"c":"in","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"submit","participantId":"alice","recordKind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"note-from-alice"}}}}
{"c":"drain"}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"alice","tick":"3","seq":1,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"note-from-alice"}}}}}
{"c":"out","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"alice","tick":"3","seq":1,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"note-from-alice"}}}}}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"3","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0"}]},"lastStamp":{"tick":"3","seq":1},"view":{"cells":[{"key":"lane/ingress-1::routedExpress","encoding":"int","value":7,"fidelity":0,"freshnessUs":"0","coverage":"65536","certainty":"65536","status":"live"}]}}}
{"c":"out","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"3","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0"}]},"lastStamp":{"tick":"3","seq":1}}}
{"c":"tick","t":"4"}
{"c":"in","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"submit","participantId":"bob","recordKind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"third-from-bob"}}}}
{"c":"drain"}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"bob","tick":"4","seq":2,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"third-from-bob"}}}}}
{"c":"out","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"bob","tick":"4","seq":2,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"third-from-bob"}}}}}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"4","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0"}]},"lastStamp":{"tick":"4","seq":2},"view":{"cells":[{"key":"lane/ingress-1::routedExpress","encoding":"int","value":7,"fidelity":0,"freshnessUs":"0","coverage":"65536","certainty":"65536","status":"live"}]}}}
{"c":"out","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"4","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0"}]},"lastStamp":{"tick":"4","seq":2}}}
{"c":"tick","t":"5"}
{"c":"in","s":"carol","f":{"protocol":"hh-coop-transport","version":1,"kind":"join","participantId":"carol"}}
{"c":"drain"}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"5","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0"},{"participantId":"carol","joinedAtTick":"5"}]},"lastStamp":{"tick":"4","seq":2},"view":{"cells":[{"key":"lane/ingress-1::routedExpress","encoding":"int","value":7,"fidelity":0,"freshnessUs":"0","coverage":"65536","certainty":"65536","status":"live"}]}}}
{"c":"out","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"5","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0"},{"participantId":"carol","joinedAtTick":"5"}]},"lastStamp":{"tick":"4","seq":2}}}
{"c":"out","s":"carol","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"5","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0"},{"participantId":"carol","joinedAtTick":"5"}]},"lastStamp":{"tick":"4","seq":2}}}
{"c":"in","s":"carol","f":{"protocol":"hh-coop-transport","version":1,"kind":"catchup-request","participantId":"carol","after":null}}
{"c":"drain"}
{"c":"out","s":"carol","f":{"protocol":"hh-coop-transport","version":1,"kind":"catchup-page","participantId":"carol","from":null,"to":{"tick":"3","seq":1},"records":[{"participantId":"bob","tick":"2","seq":0,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"hello-from-bob"}}},{"participantId":"alice","tick":"3","seq":1,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"note-from-alice"}}}],"hasMore":true}}
{"c":"in","s":"carol","f":{"protocol":"hh-coop-transport","version":1,"kind":"catchup-request","participantId":"carol","after":{"tick":"3","seq":1}}}
{"c":"drain"}
{"c":"out","s":"carol","f":{"protocol":"hh-coop-transport","version":1,"kind":"catchup-page","participantId":"carol","from":{"tick":"3","seq":1},"to":{"tick":"4","seq":2},"records":[{"participantId":"bob","tick":"4","seq":2,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"third-from-bob"}}}],"hasMore":false}}
{"c":"tick","t":"6"}
{"c":"in","s":"bob","f":{"protocol":"hh-coop-transport","version":1,"kind":"leave","participantId":"bob"}}
{"c":"drain"}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"6","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0","leftAtTick":"6"},{"participantId":"carol","joinedAtTick":"5"}]},"lastStamp":{"tick":"4","seq":2},"view":{"cells":[{"key":"lane/ingress-1::routedExpress","encoding":"int","value":7,"fidelity":0,"freshnessUs":"0","coverage":"65536","certainty":"65536","status":"live"}]}}}
{"c":"out","s":"carol","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"6","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0","leftAtTick":"6"},{"participantId":"carol","joinedAtTick":"5"}]},"lastStamp":{"tick":"4","seq":2}}}
{"c":"tick","t":"7"}
{"c":"in","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"submit","participantId":"alice","recordKind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"post-departure"}}}}
{"c":"drain"}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"alice","tick":"7","seq":3,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"post-departure"}}}}}
{"c":"out","s":"carol","f":{"protocol":"hh-coop-transport","version":1,"kind":"broadcast","record":{"participantId":"alice","tick":"7","seq":3,"kind":"action","payload":{"args":{"verb":"communicate","target":null,"note":"post-departure"}}}}}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"7","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0","leftAtTick":"6"},{"participantId":"carol","joinedAtTick":"5"}]},"lastStamp":{"tick":"7","seq":3},"view":{"cells":[{"key":"lane/ingress-1::routedExpress","encoding":"int","value":7,"fidelity":0,"freshnessUs":"0","coverage":"65536","certainty":"65536","status":"live"}]}}}
{"c":"out","s":"carol","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"7","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0","leftAtTick":"6"},{"participantId":"carol","joinedAtTick":"5"}]},"lastStamp":{"tick":"7","seq":3}}}
{"c":"in","s":"carol","synth":"auto-leave-on-close","f":{"protocol":"hh-coop-transport","version":1,"kind":"leave","participantId":"carol"}}
{"c":"drain"}
{"c":"out","s":"alice","f":{"protocol":"hh-coop-transport","version":1,"kind":"seat-state","sentAtTick":"7","ledger":{"seatHolders":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0","leftAtTick":"6"},{"participantId":"carol","joinedAtTick":"5","leftAtTick":"7"}]},"lastStamp":{"tick":"7","seq":3},"view":{"cells":[{"key":"lane/ingress-1::routedExpress","encoding":"int","value":7,"fidelity":0,"freshnessUs":"0","coverage":"65536","certainty":"65536","status":"live"}]}}}
{"c":"end","logLen":4,"lastStamp":{"tick":"7","seq":3},"ledger":[{"participantId":"alice","joinedAtTick":"0"},{"participantId":"bob","joinedAtTick":"0","leftAtTick":"6"},{"participantId":"carol","joinedAtTick":"5","leftAtTick":"7"}],"timelineDigest":"de1d4c0f941333eb"}
```

**The PHP obligation:** replay the trace through your hub + a TS-client twin of
the recording carrier and produce:

1. **per-frame equality** — the byte sequence your hub emits toward each seat,
   line-matched against every `out`/`resend`-absent position (canonical order,
   §1.3);
2. **terminal `end` equality** — `logLen = 4`, `lastStamp = {tick:"7", seq:3}`,
   the full `ledger` (including the **absence** of `leftAtTick` on `alice` —
   omit-when-unset is a wire fact, and order `alice, bob, carol` is the
   canonical same-tick-join shape), and **`timelineDigest =
   "de1d4c0f941333eb"`** — 16 hex, computed by `digestCoopTimeline` over
   `orderCoopTimeline`'s canonical form (replay module); this digest is the
   implementation-independent authority witness — same records in, same digest
   out, in any language that honors R1–R4;
3. **client-side witnesses** (TS side, informational): `alice` absorbs the
   resend (`duplicatesDropped = 1`, inbox 4), `carol` catches up to `caughtUp`,
   `bob`'s inbox freezes at 3.

**Follow-on lane (named):** a TS **trace-player** in
`tools/transport/test/` (~150 LOC; the `src/` 8-file roster stays untouched) —
reads this JSONL, drives the real hub, asserts the embedded `out` lines and the
`end` witness; that player IS the executable spec PHP diffs against in any
polyglot CI, and turns §4.1 from a recipe into a gate. Interface: line-kind
router over `{c,s,f,t,synth}` exactly as tabled.

### 4.2 RUNG 2 (owner-box only, not CI): live loopback bridge

Rung 1 proves the frame semantics. Rung 2 proves YOUR socket layer: bind a real
Workerman listener on loopback and run the proven real-socket subset —
`tools/host/test/wsConformance.test.ts` is exactly that subset (8 its): full
join→submit→broadcast→feedToDoor loop over `ws`; R1 hint ignored
(`joinedAtTick:"0"` despite a `999` hint); identical dup absorbed
(counter 1, inbox 1); divergent resend throws `TransportError`/`dup-conflict`
and never enters the inbox; a ghost submit faults `relay[not-seated]` **on her
own socket** (verdict privacy); `bad-json` faults `against:"frame"`, room
survives; oversize inbound closes **1009** (not a fault frame); log-budget
faults with the room intact and the verdict delivered **to the submitter
only**. Re-run those eight against the PHP listener.

Why not the whole body here, out of the repo's own words:
*"the full `runTransportConformance` body remains transport's (it drives the
inMemory carrier's dup/suspend/permutation knobs a real loopback socket cannot
deterministically express)"*. Rung 1 carries the frame semantics into CI; the
20-its conformance body stays the in-repo contract the TS reference carrier
passes — a production carrier may adopt more of it at its owner's option, but
only the 8-socket subset and the §4.1 trace are the **obligation**.

### 4.3 Terminal witness definition

The `end` line is compared field-by-field: `logLen` (stamped records),
`lastStamp` (highest accepted `(tick,seq)` — null on an empty log), `ledger`
(canonical seat rows, decimal-string ticks, `leftAtTick` omitted while seated),
`timelineDigest` (16-hex). A carrier that matches §4.3 and every frame line is
conformant; anything else it does additionally (compression, TLS, sticky
sessions) is outside this contract.

### 4.4 Determinism note

`timelineDigest` rides `orderCoopTimeline` (sort by tick, then seq — globally
unique under R1); the digest function is the replay module's canonical 16-hex
fold over the ordered records (`digestCoopTimeline`). Same log contents ⇒ same
digest in any language; carrier-level nondeterminism (thread interleaving) is
exposed precisely because the trace pins the **fan order** (ledger order,
broadcast-before-seat-state, §2.11).

### 4.5 Verification ritual (embedded frames)

Every one of the 39 embedded frames (11 `in`, 27 `out`, 1 `resend`) was piped
through the real codec at authoring time — `decodeFrame(JSON.stringify(f))`
accepts, and re-encoding reproduces the embedded bytes exactly. Final clean
ritual output (the command is a `node --experimental-transform-types
--input-type=module -e` one-liner importing `tools/transport/src/index.ts`):

```text
RITUAL PASS lines=57 frames=39 (in=11 out=27 resend=1) tick/drain/end=18 —
every embedded frame decoded through the real codec and re-encoded
byte-identical
```

---

## 5. Migration from `tools/host`

**`tools/host` is not retired by this contract.** It is the **permanent
dev/CI carrier** — the reference implementation, the loopback proving ground,
and the browser-dev door (it stays green in-repo; §4.2's subset runs on it
today). The PHP carrier **replaces it in production only.**

Browser-side changes at cutover: **zero except the URL/token shape** — same
`wsClientPort`, same seven interface truths (ADR-0017 #4, incl.
client-applies-only-on-drain), same frames. Production adds `?token=` to the
connect URL (§2.12); dev keeps the standing localhost-no-auth posture (ruled).
The `Sec-WebSocket-Protocol` slot stays reserved (wire-version negotiation is
future, and `hh-coop-transport@1` pins v1 until a second version exists).

| what `tools/host` hardcodes today | production carrier obligation |
|---|---|
| boot seed `904n` world (mode (a)); seed is a **convention, not a protocol field** (ADR-0017 #4) | world/seed selection is deployment configuration; notarize the seed with the log (§3) |
| one relay per process — **the ledger IS the room registry** (v0: `server.ts startHost`, no second room table) | rooms as first-class routing: (room, seat) demux per connection; single-authority-per-room until §6's election lands |
| `--scope seat:csv` host-config fog; `projectionSource` wired only in mode (a); mode (b) never calls `publish()` (F-3 disclosure) | per-seat view authority for real rooms (§2.10) + an explicit publish ritual (or event-driven re-fan) on the host clock |
| tick cadence `tickMs 250`, `0 = manual` deterministic seam | Workerman timer may schedule drains — pump law §2.11 still forbids feeding the core wall-clock stamps |
| last-claim socket routing, token = connection gate, **no identity binding** | bind seat claims to authenticated connections (named deferred rung §6) — a token-holder may not hijack a live seat |
| send-to-unknown-seat = counted drop (`wsHubPort dropped()`) | same law; instrument the counter |
| localhost bind, ephemeral dev port | TLS, deployment policy — outside this contract |
| `autoLeaveOnDisconnect` default ON (synthesized `leave`) | §2.12's synthesis or explicit relay — **must** land on the leave path |

---

## 6. Deferred rungs — every one named

None of these is a v0 obligation; each is a hole the owner may later commission.
They are listed so a carrier implementer **doesn't** build them speculatively:

1. **Failover election.** `createReplica` is a **WITNESS ONLY**
   (`server.ts:349-398`): it mirrors stamped `broadcast`/`catchup-page` records
   into a shadow log and answers write kinds with the fault `relay[replica-authority]`.
   Nothing elects; two authorities must never coexist. Election law = its own
   ADR.
2. **Per-seat salience / view budget.** Today `view` is a full projection or
   absent; zoom/budget-tiered salience per seat is unmodeled.
3. **Business-clock intents.** Law §2.8 pins `clock:"sim"`; a business-clock
   intent class needs a door-admission ruling first (the door stamps
   `clock:"sim"` acceptance ticks) — do not invent `clock:"business"` frames.
4. **Snapshot + tail resume.** Catch-up from frame 400,000 pages the whole log;
   the answer is the campaign-snapshot seam keyed to `seat-state.lastStamp`
   (relay README's named gap). Paging works; it is not yet cheap.
5. **Option-C interference** — unmodeled by ruling (ADR-0013 ruling 8); the
   carrier must not model it either.
6. **Latency / RTT semantics.** Correctness already survives arbitrary delay
   (§2.11 knobs); UX-level latency modeling is future design.
7. **Multi-room scale** beyond (room, seat) demux: sharding, migration of room
   ownership.
8. **Re-join storms** (thundering herd after an authority bounce): pacing/backoff
   law — today every survivor just pages.
9. **Seat-name ownership binding** (§2.12's deferred half: token authenticates
   the connection; claim-authorization does not exist yet).
10. **Tuning the three caps** (§1.6) — the measurement this carrier owes.

---

## 7. Cross-carrier symmetry checklist (a diff-harness recipe PHP CI can run)

Against the §4.1 reference trace, in order:

1. Hub accepts `{"c":"in"}` bytes in line order; **zero faults** on the happy
   run (`hubFaults = 0` at `end`).
2. Fan order per drain batch: `broadcast` (if any) before `seat-state`;
   multiple seats fanned in **ledger order**.
3. Ledger array equals the embedded one after each of legs (1), (5), (6), (8) —
   including same-tick canonical order `[alice, bob]` and `leftAtTick` absence
   for the seated.
4. `view` key present on `alice`'s seat-state, **absent** (not null) on
   `bob`/`carol`'s.
5. Stamps equal the trace: `(2,0) (3,1) (4,2) (7,3)`; `alice`'s join lands
   `joinedAtTick:"0"` despite its carried `"clientTickHint":"999"` (§2.1).
6. Resend leg: your hub **never receives** the `resend` bytes; the client twin
   absorbs (duplicatesDropped +1, inbox unchanged).
7. Catch-up leg: exactly two pages, `[null → (3,1)] hasMore:true`,
   `[(3,1) → (4,2)] hasMore:false`; the second request's `after` is the first
   page's `to` (client cursor is truth, §2.9).
8. Departed fan: post-(6) traffic never reaches `bob`'s channel; his ledger row
   keeps `leftAtTick:"6"`.
9. Synthesized leave lands as an ordinary `leave` frame through the **same**
   handler; terminal ledger `carol [5,7)`; `end` witness matches §4.3 exactly,
   `timelineDigest = de1d4c0f941333eb`.
10. Refusal corpus (Appendix A): each trigger reproduces the cited string
    **verbatim** — including which of the two layers' grammar it carries
    (`transport[…]` vs `relay[…]`), and the `SaveError` family propagating as
    a throw (§2.11), not a fault frame.

---

## Appendix A — refusal probe corpus (verbatim, generated against the real hub)

Each row: trigger → observed, captured from the same recording-carrier stack as
§4.1 (fresh relay per probe; `…` elides nothing in the cited prefix).

| # | trigger | observed |
|---|---|---|
| P1 | re-`join` an open pid at its own joined tick | **THREW** `name=SaveError message=save: coop seat ledger row 1 shares tick 0 with row 0 but participant "alice" does not follow "alice" in code-unit order — same-tick seats ascend by participantId` (the canonical-order leg fires first for a same-pid re-claim; the still-open variant is `…opens a tenure at tick N while its earlier tenure from tick M is still open…` — both `validateCoopSeatLedger`) |
| P2 | `leave` in the same tick as `join` (no clock advance) | **THREW** `name=SaveError message=save: coop seat "alice" leftAtTick 0 is not after joinedAtTick 0` (strict-after) |
| P3 | departed seat's `catchup-request` | fault `against:"bob"` cause `relay[not-seated]: "bob" has no seat at tick 2 — ghost intents are refused at the relay` |
| P4 | never-seated pid's `catchup-request` | fault `against:"dave"` cause `transport[unknown-participant] at 'catchup-request.participantId': expected a participant with a seat-ledger row (open or departed tenure), got string dave` |
| P5 | never-seated pid's `submit` (ghost intent) | fault `against:"gast"` cause `relay[not-seated]: "gast" has no seat at tick 0 — ghost intents are refused at the relay` |
| P6 | hub-to-client kind injected up-pipe | fault `against:"seat-state"` cause `transport[bad-frame] at 'frame.kind': expected a client-to-hub frame, got hub-to-client kind "seat-state" on the hub channel` |
| P7 | undecodable bytes to the hub | fault `against:"frame"` cause `transport[bad-json] at 'frame': expected JSON object, got string Expected property name or '}' in JSON at` — recorded hub-side only (undeliverable), room survives |
| P8 | third `submit` at `logBudget: 2` | fault `against:"bob"` cause `transport[log-budget] at 'submit': expected shared log shorter than the budget (2 records), got string log holds 2`; shared log capped at 2 |
| P9 | re-delivered `(2,0)` with a divergent payload | client **THREW** `name=TransportError code=dup-conflict` message `transport[dup-conflict] at 'inbox(2:0)': expected an identical re-send (at-least-once delivery), got string a divergent payload claiming the same (t` — inbox unchanged (1); FATAL by law §2.3 |

P1/P2 are the two behaviors the brief warned PHP must not guess: the double-open
refusal is a **throw through the drain**, state-safe (ledger unchanged), not a
fault frame; and a leave scheduled at the join tick **throws** — the carrier
ritual is advance-then-drain.

---

*End of contract. The trace block in §4.1 is the executable heart: when in
doubt, replay it and diff.*
