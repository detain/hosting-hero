# ADR-0002 — Sim core: TypeScript, authoritative in-browser via Web Worker

## Status
**Accepted 2026-10-06.** Ratified owner decision R-2 (the report's "option A"). Not re-openable without owner action (§0 legend). Creates one PENDING sub-decision (MP topology, OD-5) recorded in §2.2 and `docs/DECISIONS-PENDING.md`.

## Context
The engine's truth is a **12-step deterministic queueing simulation** running on integer-µs discrete-event time — the workload the source doc demands, at µs/permanent incident-clock scale (§4.1). WS-1's original stack verdict held that multiplayer would make "PHP server-authoritative mandatory," and several specialist reports (WS-1, WS-4, WS-5, WS-8) placed the authoritative tick, ledger, and policy interpreter in PHP+Workerman (§2.3 C1/C2/C5/C6/C11). Two pressures forced a re-settlement: (i) WS-2's **interaction-latency law** — the board demands *sub-frame synchronous answers* (latency delta while dragging, eligible cells on pick-up, blast flood on hover), which any server round-trip destroys (§4.2); and (ii) the LONG SAVE / replay / postmortem promises require the entire sim to be seeded and bit-reproducible (§4.1, §4.6). WS-1's own **Option-A proposal** — one TS core; PHP/Workerman host sessions, relays, persistence — is what was ratified, extended to browser authority for single-player.

## Decision
The deterministic simulation — **12-step pipeline, Q16.16 fixed-point integer time, seeded RNG streams, ground/observed twins, and the embedded closed-enum Policy interpreter — is a single TypeScript core, authoritative in-browser via a Web Worker** for single-player. **PHP + Workerman own macro-tick services, persistence, transport, and the canonical-ledger notary**; **MySQL + Dragonfly/Redis** are system-of-record and hot-set mirror (§2.1 R-2, §3.1). The client worker **is** the simulator; the renderer is a terminal of the in-process observed layer (C10).

**The core must be runtime-neutral** (§3.4): integer-only arithmetic, no wall-clock (`Date.now`), no `Math.random`, no `Intl`, no locale-dependent sorting, stable iteration order (Map insertion order only), all platform affordances injected. CI runs the same golden-replay fixtures on **both runtimes** (browser + Node); **divergence is a build break** (§8 RISK-1).

## Consequences

**Ends one risk, creates another.** One sim implementation eliminates WS-1's risk #1 (PHP↔second-implementation divergence) *by construction* — but replaces it with **browser-V8 vs Node parity** risk. Mitigations: integer-only core, no `Date.now`/`Math.random`/`Intl` in sim code, CI dual-runtime fixture gate (§2.2 R-2, §8 RISK-1).

**Policy interpreter moves into the TS sim core** (VOIDing WS-5's "non-negotiable PHP," C1). It stays deterministic: fixed rule order, lowest-rule-id tiebreak, **no RNG**, rule phase at **step 12.5** after the observed-layer write. Rule-book **version history + audit rows stay MySQL**; the sim carries only the active book *by hash* as state. One interpreter everywhere now *strengthens* the never-a-scripting-language law (grammar creep would break exactly one host — the player's browser — so the frozen-grammar spec matters more, feeding OD-4d) (§2.2 R-2, C1, §4.5).

**PHP + Workerman keep** (§2.2 R-2, §3.1): macro-tick services (settlement batches, email/inbox composition, market-director *generation* hand-offs delivered as **timestamped deterministic input messages**), persistence/notarization (§3.2), transport/relay for MP and async modes, bundle/mod distribution + integrity, accounts/session. The PHP macro-tick harness is **demoted from authority to benchmark/cross-check** (C2).

**Ledger/money becomes sim state computed in-core** (step 12) — the C5 restatement. MySQL is canonical persistence + notary (append-only receipts: seed + checkpoints + ledger snapshots + input logs); the server guarantees integrity by **notarized replay-verify run on the Node port**, diffing bucket sums — not a PHP reimplementation. The server mints value only out-of-band (purchases, workshop, cross-save wallet) (§2.3 C5, §3.2, §4.4 correction).

**Both clocks live in-core** (WS-1 dual accumulator, C6): Workerman delivers timestamped inputs and handles persistence/transport; the "Workerman is the natural home of the Business Clock" claim survives only in the service-delivery sense (§2.3 C6, §4.4).

**Still needs server-side authority** (§2.2 R-2): save trust & anti-cheat (notarized replay-verify, §3.3), canonical ledger storage, bundle/mod distribution & integrity, MP session relay (moot under recommended topology (b)), cross-save shared state (uptime streak, leaderboards, Versus deck exchange). **Player-verb *validity* never needs the server** — established by seed+input replay.

**Forces the Node port.** Async-Versus, Long Weekend, Analyst forward-sims, Ratchet-Audit counterfactuals, and postmortem replays all require running the sim headless without a browser — that is what forces the portable Node port (§3.4) and it is the technical heart of OD-5. The Node port exists regardless of OD-5; only its *role* (MP session host) is conditional (§2.2 R-2, §2.2 sub-decision).

**Creates the MP-topology sub-decision (OD-5, PENDING).** With the sim authoritative in a browser, who hosts a session's ground truth? (a) host-authoritative browser + Workerman relay of per-seat projections, vs (b) **TS sim as portable library (fleet recommendation)** — same core on Node for MP sessions and all headless needs. None of Phase 1 (§7) is blocked by it; every gate slice runs under either option, and WS-8 slice A hosts the sim on Node inside a browser app, doubling as proof-of-(b) (§2.2 sub-decision, §6.1 OD-5).

## Source
`MASTER_REPORT.md` §2.1 (R-2), §2.2 R-2 (consequences + MP-topology sub-decision), §2.3 C1/C2/C3/C5/C6/C7/C8/C9/C10/C11/C12, §3.1 (layer stack), §3.2 (authority contract), §3.4 (Node port), §4.1 (WS-1 determinism verdicts), §4.2 (interaction-latency law), §4.5 (interpreter-in-core), §8 RISK-1.
