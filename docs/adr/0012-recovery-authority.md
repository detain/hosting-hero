# ADR-0012 — The stateful recovery ENGINE is the single §7.7 authority; the pure OBSERVER is demoted to advisory/opex on top of it; both shipped hosts wire the engine behind optional config

## Status
**Accepted (2026-10-13)** — reconciliation lane at cdb2bc5. The tracker's own
docblock had already declared this intent ("reconciliation @60e464b — ADR-0012")
while the ADR file did not exist and the promised reader did not exist either;
this lane makes the declaration true in code, tests, hosts, and docs.

## Context

Two §7.7 recovery-half designs shipped in the same window, both green, with
zero export-name collisions:

- **(A) @6867f74 — PURE OBSERVER.** `pipeline/recovery/tracker.ts` +
  `economy/recovery.ts`. Digest-neutral by design: it watches SimEvents and
  keeps its OWN minute-keyed incident memory (phases failed→recovering→
  recovered, ramp scheduling, a `secondFailureWindowMinutes` amber tail after
  recovery, failback hold, crew/priority queue, `degradedMinutes` meter). Its
  OUTs (`recoveryCapacityBps`, `acceptsFailback`, `secondFailureWindowActive`,
  `restoreOptions`, the `RECOVERY_ACTIONS` opex menu) were consumed by nobody.
- **(B) @60e464b — STATEFUL ENGINE.** `pipeline/recovery.ts` +
  `GameState.recovery?` digest slice + `TickDriverOptions.recovery`. Windows
  open on sustained struggle, strikes inside a window LOCK the node at the
  safe-mode floor, restoration ramps one arm per `rampMinutes`, records drop
  when cleared. `throttleServeNodes` moves REAL serves. The engine was wired
  into the driver but into NEITHER shipped host.

The hazard the recovery lane recorded at landing: **two authorities for "is a
node in a second-failure window"**. (A) computed it from its own
`recoveredAtMinute + secondFailureWindowMinutes` arithmetic; (B) owns it as
`GameState.recovery.windows` membership — and the two DISAGREE by design,
because (A) kept a 60-minute post-recovery amber tail that (B) never had (B
drops the record the moment the window clears).

## Decision

1. **Engine canonical.** (B) `pipeline/recovery.ts` is THE §7.7 sim authority:
   state, digest, and serve clamps all live there. Nothing in (A) may move
   ground truth. `recoveryCapacityBps` is explicitly demoted to a
   presentation advisory — applying it to serves would double-derate against
   `throttleServeNodes` and was ruled out on zero-golden grounds.
2. **Observer demoted to advisory/opex, keeping its export names.** (A) still
   owns the phases/ramp/crew/priority/failback/`degradedMinutes`/postmortem-
   credit narrative and the opex decision-support reads
   (`RECOVERY_ACTIONS`, `restoreOptions`) — all DIGEST-NEUTRAL advice.
3. **Single window authority, code-enforced.** New pure reader
   `deriveDurableImpressions(game)` + rewritten
   `secondFailureWindowActive(game, nodeId)` read
   `GameState.recovery.windows` membership (signature deliberately changed —
   the name survives for api-verify, the dual clock-math dies). `escalateIncident`
   no longer computes a window at all: escalation fires iff the engine had a
   live window/lock for the node at failure time, threaded via the optional
   `engine?: GameState` on `RecoveryObservation` / `declareRecoveryFailure`.
   An observation WITHOUT the engine never escalates ("a drill run without the
   sim is a calm drill"). The 8th tuning knob `secondFailureWindowMinutes` is
   DELETED (now refused as unknown-key); `recoveredAtMinute` survives strictly
   as the failback anchor (failback is (A)-unique law).
4. **The amber bar no longer has a post-recovery tail.** This is the one
   honest SEMANTIC change (A)-internally: §7.7:27513's "cannot survive another
   failure" is true exactly while the engine says a window is live. Re-cutting
   (B) to add a tail would move digest on wired runs and re-red (B)'s 26
   pinned-fold tests for a presentation nicety; ruled not cheap, not adopted.
5. **Post-mortem credit is single-sourced.** (B)'s `economy/postmortem.ts`
   fold is the ONLY consumer of `cfg.reputation.honestPostmortemBps`; (A)'s
   `markBlamelessPostmortem` sets an advisory tracker flag that only halves
   (A)'s own escalation excess and NEVER mints reputation or money (verified —
   structurally impossible, the observer directory imports only types).
6. **Both hosts wire the engine** behind optional config, following the
   @8994f96 attention/pricing pattern — default absent = byte-identical:
   - `RunUnattendedConfig.recovery?: RecoveryConfig` → driver option + sparse
     `UnattendedReport.recoveryNotices?` witness (key rides the WIRED flag,
     not the self-clearing slice, so armed-but-quiet weekends still show `[]`).
   - `SimCoreRunnerOptions.recovery?: RecoveryConfig` → driver option +
     `recoveryState()` / `recoveryNotices()` accessor witnesses (the frozen
     SimProjection wire is NOT widened — zero protocol/golden churn).
   Proofs: `unattended/__tests__/recovery-forwarding.test.ts` (pinned
   episode→window-opened→second-failure→lock-engaged→window-cleared sequence,
   checkpoint-digest divergence WHILE the slice is live that washes out after
   clearing, and the in-window-strike vs post-clear-episode discrimination)
   and `apps/proto/src/__tests__/simCoreRunner.recovery.test.ts` (15-notice
   pinned multi-node story, live locked-state accessor read, frame-level digest
   divergence where clamps actually move serves, default-off frame identity).

## Consequences

- The observer READS GameState (new import edge `recovery/` → `../../types.ts`
  types only). Its old "nothing enters GameState" neutrality claim is refined
  to "nothing LEAVES into GameState": feeding engine snapshots into the
  observer changes zero digests — pinned falsifiably.
- (A)'s standalone escalation tests must thread a synthetic engine state; the
  old self-computed tail tests are deleted, not ported.
- HUD chrome may now consume `secondFailureWindowActive(state, node)`,
  `recoveryCapacityBps`, `restoreOptions` as pure reads with one authority
  behind them; that surfacing is E2b's lane, gap-registered in MODULE-STATUS.
- hosting_game.md markup closeout stays with the closeout lane; this ADR's
  heading-status table lives in `reports/audit/SUMMARY.md` WAVE-3 ADDENDUM.
