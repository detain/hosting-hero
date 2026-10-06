# ADR-0004 — Async-Versus synthesis + co-op scenario design law

## Status
**Accepted 2026-10-06.** Ratified owner decision R-4 ("decision #4"): WS-8's **Async-Versus synthesis APPROVED** as a v-someday mode, and the **co-op scenario design law ADOPTED** as day-1 authoring law. Not re-openable without owner action (§0 legend).

## Context
The doc splits its cheapest PvP idea ("Attack My Network" — commit a board, have others attack it) from its best PvP structure (drafted decks, hosting_game.md §2.13 affixes, hosting_game.md §7.14 autopilot) and never notices they are the same system (§4.8 B″). Live drafted Versus is expensive: it needs session transport *and* per-seat projection (attacker picks targets through recon fog, defender sees only their board), so live Versus isn't netcode-free; and it inherits an eternal balance live-ops duty (ratings, meta patches, banlist) the doc never priced (§4.8 Versus cost audit, §8 RISK-20). Separately, co-op's defining hard rule is "no player may ever see the whole board" (hosting_game.md §9.1) — which means a co-op win condition that one player could solve alone is not a co-op win condition (§4.8).

## Decision

**(1) Async-Versus ("Deck Duel, Deferred", option B″) is approved as a v-someday mode.** The defender commits board + doctrine (Policy Book autopilot plays their "live reserve"); the attacker runs their committed deck **offline** against it; results are post-matched. Cost ≈ **0.15–0.25 B with zero session code** (B = one complete SP level vertical slice). It loses live bluffing/reading and inherits async dead-time, but is "the real answer to 'MP appetite without netcode'" (§4.8 table B″).

**(2) The co-op scenario design law is authoring law from day 1:** *every win condition must require cross-seat information — information one seat holds and another lacks* (§2.1 R-4, §4.8).

## Consequences

**The deck/defense format becomes a day-1 serializable artifact even though the mode ships later** (§2.2 R-4): `deck schema = Wave Envelope` (ramp, plateau, decay, composition, telegraph — `hosting_game.md §7.13`); `legality = hosting_game.md §2.24 generator constraints re-expressed as a validator` (active-family pool cap 8–10, denomination quota ≤4, Two-Front requirement, feint budget, attack/entropy pressure budgets); **`Second Answer` = the deck-design invariant** (no threat has exactly one counter) (§4.8 Versus cost audit, §2.2 R-4).

**The co-op law becomes a lint-able authoring rule for all level content from day 1.** It is also what makes co-op cheap later: scenarios authored to the law never need re-writing for seats (§2.2 R-4). The slice that first exercises it is Phase-1 §7.7 slice (d) "Two Seats, One Outage" — one authored 10-minute scenario *provably requiring* cross-seat info (cause only on the network overlay; urgency/patience only in tickets; a hidden circular dependency as the twist) (§7.7d).

**`observed_view(seat)` becomes first-class interface from day 1, not a netcode bolt-on** (§2.2 R-4, §3.1). This is the same projection machinery that enforces the co-op hard rule as a *protocol invariant* rather than an honor-system UI convention, and it is what rules out deterministic lockstep PvP *on principle*: lockstep by definition makes every client compute full ground truth, which is incompatible with asymmetric-info co-op (per-seat lockstep is impossible because step-8 dependency blocking means one seat's view requires another's ground truth) (§4.8, §3.1).

**The R-4 artifact format is proven before the mode exists.** Phase-1 §7.7 slice (e) "Deck Duel, Deferred" validates the async duel with zero session code: wave-envelope legality validator catches planted degenerates, 25 async duels with no dominant pairing, deck is pure bundle data, <45 s CPU/duel headless (§7.7e).

**Versus live-ops remains deferred** (§8 RISK-20): R-4 approves only *async*. Format policy (frozen/vintage "formats-as-data" vs live ratings/meta-patches/banlist) is an open owner decision (OD-16 Q3) to decide *before* building rating infra (§6.2 OD-16, §8 RISK-20).

## Source
`MASTER_REPORT.md` §2.1 (R-4), §2.2 R-4, §3.1 (`observed_view` day-1), §4.8 (WS-8 B″ synthesis, co-op law, Versus cost audit, lockstep exclusion), §6.1 OD-5, §6.2 OD-16, §7.7 slices d/e, §8 RISK-20.
