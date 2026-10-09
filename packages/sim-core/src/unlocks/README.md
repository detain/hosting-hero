# unlocks/ — the §5 unlock-trigger engine (v0, unwired by design)

## PASSAGE — how data flows through this module

1. A host ticker (Phase-2 wiring; today: tests) observes one tick of the
   running sim and forwards the OBSERVABLES it already has:
   `{ tick, minute, events (SimEvent[]), notices (EconomyNotice-shaped),
   eraYear, declarations }` into `createUnlockObserver().observe(...)`
   (the `UnlockTickInput` seam).
2. `observeUnlockWindow` folds that window into an immutable
   `UnlockObservation` — lifetime counters per node/notice-kind plus the
   most-recent causeId per counter key. GameState is NEVER an input and
   NEVER an output: this is the digest-neutrality law, pinned
   falsifiably by `__tests__/integration.test.ts` (identical digest
   chain with and without the observer fed).
3. The four predicates read the snapshot: `scarTrigger` (repeated
   bounces / false-positives / landings / business-pain notices),
   `milestoneTrigger` (sim-minute thresholds), `eraTrigger` (an
   `loader/eras.ts`-style year flip), `declaredTrigger` (the four
   channels the engine cannot observe yet). `evaluateUnlockTriggers`
   runs them in canonical order.
4. The observer dedups once-per-`targetRef` and returns the NEW
   `UnlockProposal` rows `{via, targetRef, atTick, causeId}`. `via` is
   save/'s seven-value `UnlockVia` vocabulary verbatim (structural
   mirror, see triggers.ts header) — a proposal is exactly the shape
   `NodeUnlockRecord` wants to be written from.
5. Satisfied unlocks accumulate into a `SatisfiedSet` of route ids;
   `prereqs.ts` consumes the loader-parsed `relations.unlocks.prereqSets`
   (`parsePrereqSets` accepts `LoadedTypeBundle.relations.prereqSets`
   directly) and answers `canUnlock(...)` / `whatBlocks(...)` — the
   §5.6 lattice finally has a reader. Fail-loud: any prereq id outside
   the supplied `knownIds` universe throws `unlocks[unknown-prereq]`.
6. `codexLadder.ts` turns repeat-observation counts into the
   `CodexEntry.stage` ladder (seen→analyzed→countered→mastered,
   save/node.ts:291 vocabulary) with the mastered rung pinned equal to
   waves/ledger's `masteryDemotionAfter` weather demotion.

## What is intentionally UNWIRED (honest v0 ledger)

- **Nothing mounts this.** No driver, gate, proto panel, or save writer
  imports unlocks/. That is the phase contract: §5's persistence
  skeleton (9e701a0) gets its mechanic first, its wiring second.
- **foresight / testimony / anticipation / acquisition** are
  declaration pass-throughs — the engine has no forecast feed (§5.1
  half-cost Called-It), no reading screen (§5.4 Reading Room), no
  AnticipationState token-spend logic, and no succession runner.
  Each predicate that computes is documented as computed; none of
  these four pretend to.
- **Per-metric milestone thresholds** (§5.3 scale/commercial ladders)
  are config rows, not code; v0 ships the three time-survived defaults.
- **Codex evidence feed**: SimEvents carry no threatId, so
  `CodexCounters` is fed structurally by the host (from the wave plan /
  ledger masteryCounts), not from the event stream.
- **Verb unlocks** (Scream Test / Bisection / Depth Test, §5.4) collide
  with the door's closed 8-verb enum — deliberately out of v0 scope
  (door lane owns PLAYER_VERBS).
- **prereqSets semantics** (array = alternative routes, ANY opens) is
  this lane's interpretation of the §5.6 heading; both shipped bundles
  have one set, where every reading collapses to the same answer. If
  content ever authors multi-route lattices, the owner should ratify
  the reading (README + prereqs.ts header carry the claim together).

## Phase-2 hooks (the seams already cut)

- `UnlockObserver.observe(input)` — the ONE integration seam: a driver
  wrapper feeds `TickResult.events` + economy notices + era each tick;
  proposals route to the save writer's `nodesUnlocked` facet
  (`NodeUnlockRecord` fields map 1:1: via→via, targetRef→node/scarRef,
  atTick→stampAtTick, causeId→incidentRef).
- `whatBlocks` rows are the §5.6 "readable locks" UI payload verbatim.
- `nextCodexGap` is the §5.4 fill-in-the-blank progress payload.
- `noticeScarAfter` is a config record — business-scar rows (§5.2's 14
  business unlocks) become content, not code.
