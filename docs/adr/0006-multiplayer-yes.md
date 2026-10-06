# ADR-0006 — Multiplayer: yes

## Status
**Accepted 2026-10-06.** Ratified owner decision R-6 ("decision #6"). Not re-openable without owner action (§0 legend). Depends on PENDING sub-decision **OD-5 (MP topology)** and OPEN co-op save-ownership **OD-9** — recorded, not resolved here.

## Context
WS-8 established the report's cleanest technical finding: the spec already contains the netcode architecture — as a single-player rule. `hosting_game.md §7.13` step 12 ("every UI reads the observed layer, not the truth") plus `hosting_game.md §7.6` ("the player may only act on observed truth") mean co-op's hard rule — "no player may ever see the whole board" (hosting_game.md §9.1) — is **exactly per-seat projection of the observed layer**: `observed_view(seat)` (§4.8). The single-player game needs one observer; co-op needs the same code path with a **perceiver parameter**. Hosting cost is small and bounded: 2–4 sockets/session, 4–8 Hz authoritative tick, aggregate-per-class work O(objects × QoS-classes), and P10 ("almost nothing you do has an immediate result") is a **latency mask** — 50–200 ms RTT sits inside the fiction, so "real-time-action multiplayer's hardest problems (input latency feel) are designed out of this game" (§4.8 WS-8 hosting analysis, §1).

## Decision
**Multiplayer ships** (§2.1 R-6). The MP shape is **server-authoritative per-seat projection of the observed layer**, not lockstep and not client-authoritative — this is the *only* option that can enforce the co-op defining law by construction (§4.8). All modes write one Long Save through one API (see ADR-0003). **Async-Versus** and the **co-op scenario law** are the first concrete modes under this umbrella (ADR-0004).

## Consequences

**Determinism becomes load-bearing for netcode, not just QA.** Every MP feature (reconnect, async Versus, Long Weekend, Daily, replays, postmortems) is downstream of the seed + intent-log contract; wall-clock reads, unordered iteration, or float/env drift silently destroy MP *and* the fairness promise "the systems-literate audience tests for in the first two hours and never forgives" (§2.2 R-6, §8 RISK-1, §4.8 R2).

**The leak-QA property runs forever in CI**: "for all messages to seat s: no ground-truth property outside seat scope" — property-test infra, not vigilance, because the violation surface is every renderer, tooltip, log line, shareable artifact, whiteboard note, and leaks are *silent* bugs (§2.2 R-6, §8 RISK-9, §3.1 law 2).

**Co-op architecture is delegation-bands-as-permission-system — no new authority machinery.** Seat authority reuses `hosting_game.md §7.14` Delegation Bands ("who may do what without asking"); shared-resource conflicts (two seats spending one hand/cash) resolve first-in-tick, the loser sees the ghost hand already occupied (§2.2 R-6, §4.8).

**Reconnect/recovery = re-sim from seed + intent-log.** "Determinism converts the hardest MP problem (state reconciliation) into a batch job": 20 sim-hours ≈ seconds-to-a-minute CPU behind a "the NOC is re-syncing boards" beat; one machinery yields replays, postmortem generation, async Versus, Failure-Hall uploads, and the Long Weekend (§4.8, §3.2 failure model). Late join/handoff is a **named mode** ("you play the second half of an incident someone else started"), not error handling — "design them as product" (§4.8).

**MP topology sub-decision (OD-5) becomes the next required owner call** (§2.2 R-6, §6.1): who hosts a session's ground truth — (a) host-authoritative browser + Workerman relay of per-seat projections only, vs (b) **TS sim as portable library on Node for MP sessions** (fleet recommendation). This repo is scaffolded per (b) but the owner sign-off is PENDING. The recovery asymmetry (a: re-host needs a new volunteer browser; b: re-sim on any Node) is the strongest operational argument (§3.2).

**Interacts with co-op pause (OD-16 Q4):** "full pause, always" is the a11y floor, but any-seat-freezes-all invites griefing; host-vote is the likely compromise, and a **Node host changes "host-vote" into "server-vote"** — needed before prototype A finalizes scope (§6.2 OD-16, §6.1 OD-5 blocks list).

**Day-1 data-model insurance is committed:** the perceiver parameter must land in the sim data model before step 12 is written — "both shapes are cheap at design time and wildly asymmetric at retrofit time (1 field vs rewriting every consumer of a global shadow-state)" (§4.8 consistency pass, §3.1).

## Source
`MASTER_REPORT.md` §2.1 (R-6), §2.2 R-6 (+ MP-topology sub-decision), §3.1 (`observed_view` laws), §3.2 (failure model), §4.8 (WS-8 finding, hosting analysis, lockstep exclusion, reconnect semantics), §6.1 OD-5, §6.2 OD-9/OD-16, §8 RISK-1/RISK-9.
