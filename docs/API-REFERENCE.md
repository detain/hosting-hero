# API REFERENCE — `@hh/sim-core` (as actually shipped)

**Compiled 2026-10-06 by the API-docs lane; DOCS-SYNC-2 pass same day
(intent-door contract + sibling export-count refresh); VERSUS-LANE pass
2026-10-07 (`## versus` section + import row, +69 names); COVERAGE-LANE pass
2026-10-07 (`## coverage` section + import row, +28 names); ECONOMY-PERF-LANE
pass 2026-10-07 (chunked journal + settled-invoice retention rows, +13 names;
pipeline digest sink port shipped ZERO surface change — `digest-limbs.ts` is
internal, not barrel-exported); UNATTENDED-LANE pass 2026-10-07
(`## unattended` section + import row, +69 names); CALIBRATION-WAVE
docs-currency pass 2026-10-09 (api-verify 1,270 → 1,273 names — versus
fingerprint pair + `registerContractsEconomy`; OD-1/OD-2/OD-8/OD-4d row
flips to the ratified truth, `docs/adr/0009-owner-ratifications-calibration.md`); UNLOCKS-LANE pass
2026-10-09 (`## unlocks` section + import row, +43 names — hg §5 unlock-trigger
engine v0, digest-neutral observer, unwired by design).** Ground truth = source
on disk, this commit.** Every name below was verified against the module files
and the package `exports` map, and is machine-policed by
`docs/api-verify.test.mjs` (run `node docs/api-verify.test.mjs` — it fails if
any documented export name drifts from, or a shipped export name is missing
from, the tables below). Citations:
`§N` = `reports/MASTER_REPORT.md`; `hg §N` = `hosting_game.md`; `OD-n` =
`docs/DECISIONS-PENDING.md`; Appendix letters = MASTER_REPORT appendices.

**Determinism vocabulary used in the notes column** (docs/CONVENTIONS.md §4):
*pure* = data-in→data-out, no hidden state · *total-throwing* = fail-fast on
invalid input (Law 4) · *no clock* = never reads wall time · *no RNG* = no
randomness at all · *seeded* = randomness only via explicitly injected
`RngStream`/`RunSeed` · *order-pinned* = iteration order is code-unit sorted or
Map-insertion-pinned · *deep-frozen* = result frozen recursively at the boundary.

---

## Import surface that actually ships

Parsed from `packages/sim-core/package.json` (on disk, 2026-10-06):

| Subpath specifier | Resolves to | Ships |
|---|---|---|
| `@hh/sim-core` | `src/index.ts` (root barrel) | ✅ types + kernel + all 13 module barrels **incl. `save` (2026-10-06), `versus` + `coverage` + `unattended` (2026-10-07), `unlocks` (2026-10-09), zero name collisions — native names ride the star** |
| `@hh/sim-core/types` | `src/types.ts` | ✅ shared contract (171 exports; intent-door arm landed 2026-10-06, +20; OD-24(a) pricing arm 2026-10-09, +4) |
| `@hh/sim-core/kernel` | `src/kernel.ts` — integrator file aggregating `kernel/{fixed,time,rng}.ts` | ✅ 44 exports (NOT `limbs.ts`, NOT `rng-reference.ts` — kernel-internal/oracle only) |
| `@hh/sim-core/pipeline` | `src/pipeline/index.ts` | ✅ (60 exports incl. the intent-door surface + the OD-24(a) adjust-price additions, +5; `internal.ts` private) |
| `@hh/sim-core/policy` | `src/policy/index.ts` | ✅ 90 exports (P1/P3/P4/P7 fixer-lane additions) |
| `@hh/sim-core/economy` | `src/economy/index.ts` | ✅ 196 exports (journal chunking + invoice retention landed 2026-10-07, +13; `registerContractsEconomy` batch API landed 2026-10-09, +1) |
| `@hh/sim-core/observed` | `src/observed/index.ts` | ✅ 49 exports (composite-cell fold family) |
| `@hh/sim-core/topology` | `src/topology/index.ts` | ✅ 99 exports (round-2 fixes incl. `domains.projectionVersion`) |
| `@hh/sim-core/waves` | `src/waves/index.ts` | ✅ 74 exports |
| `@hh/sim-core/replay` | `src/replay/index.ts` | ✅ 59 exports (barrel is an EXPLICIT name list) |
| `@hh/sim-core/loader` | `src/loader/index.ts` | ✅ 89 exports |
| `@hh/sim-core/save` | `src/save/index.ts` | ✅ 183 exports — **landed mid-audit (2026-10-06)**; root barrel carries it with 4 `save*` aliases (see disambiguation below) |
| `@hh/sim-core/versus` | `src/versus/index.ts` | ✅ 71 exports — async-Versus deck law (ADR-0004); EXPLICIT barrel, root star-collides with zero names (count re-pinned for the fingerprint-flip lane's `cardContentFingerprint` + the versus-pin-fix lane's `defaultPolicyCardIndex`, 2026-10-09) |
| `@hh/sim-core/coverage` | `src/coverage/index.ts` | ✅ 28 exports — Coverage Grid (hg §2.1 / P17): 12×9 dark-cell teaching matrix, MAX-combine cells, G2/P2 invitation bridge; EXPLICIT barrel, zero root collisions (summary type named `CoverageGridSummary` to avoid observed's `CoverageSummary`) |
| `@hh/sim-core/unattended` | `src/unattended/index.ts` | ✅ 69 exports — The Long Weekend fast-forward + What-Would-Break forward sim (hg §9.2, WS-8); EXPLICIT barrel, zero root collisions |
| `@hh/sim-core/unlocks` | `src/unlocks/index.ts` | ✅ 43 exports — hg §5 unlock-trigger engine v0 (scar/milestone/era/declared triggers + prereqSets consumer + codex ladder); observer-only, DIGEST-NEUTRAL, unwired in v0; EXPLICIT barrel, zero root collisions |

Resolution law (root barrel header): every re-export uses **explicit `.ts`
specifiers** so the same sources load under vitest/Vite, `tsc
(allowImportingTsExtensions)`, and plain Node
`--experimental-transform-types`. All barrels honor this today, including
`save/index.ts` (its extensionless specifiers were fixed at landing).

Root-barrel disambiguation renames (what `@hh/sim-core` flat-names look like):

| Root name | Comes from | Why |
|---|---|---|
| `stableSerialize` | `loader/index.ts` (1-arg, content-bundle hashing) | explicit re-export beats star ambiguity |
| `observedStableSerialize` | `observed/index.ts` (2-arg, depth-guarded step-12 digest gate) | same clash, renamed |
| `TuningSheet` (type) | `waves/index.ts` (sheet DATA interface) | economy's same-named `"A"\|"B"\|"C"` union rides as `EconomyTuningSheetId` (alias dies when economy renames to `TuningSheetId` — FOLLOW-UP in `src/index.ts`) |
| `economyArAging`, `errorBudgetRemainingSec` | `economy/tick.ts` convenience aliases | HUD per-frame reads without deep reaches |
| `saveCompareCodeUnits` `saveFail` `saveFnv1a64Hex` `saveRequireDefined` | `save/{canonical,errors}.ts` | save ships a private canonical-codec fork clashing with replay's family; flat names stay with replay (the digest authority) — FOLLOW-UP for both owners: one shared codec retires these four aliases |

`tools/headless` currently imports sim-core via **relative paths**, not the
package specifier (its `src/sim-core.ts` swap point — rewires when subpath
exports stabilize).

---

## contract types (types.ts)

Purpose: THE shared contract — one file every lane imports and none may fork
(§3.4 runtime-neutral core; §7.0 P0 "frozen step shapes"). Contains: branded
id primitives, the Fixed/bigint time–money algebra types, the RNG stream
interface, the 13-slot pipeline I/O shapes (`TickStep`, `PipelineSlots`,
`TICK_STEP_ORDER`), the Policy-Card grammar (Appendix B), money/contract
shapes (§4.4), the Appendix-A type-bundle mirror, replay/event shapes (§3.3),
the INTENT-DOOR contract (player verbs, args union, `ExternalIntent`,
board/hands/pricing slices — §4.2/§7.5/§7.13, executed by
`pipeline/intent-door.ts`),
and `GameState` (§4.1). Data + one law each; zero behavior. Import:
`@hh/sim-core/types` or `@hh/sim-core`.

| Export | Signature (condensed) | Meaning | Determinism notes |
|---|---|---|---|
| `Branded` | `type Branded<T, Tag extends string>` | nominal-tag helper behind every id type | type-level |
| `EntityId` `CauseId` `MetricId` `RuleId` | `type = Branded<string, "…">` | stable entity / attribution / metric-noun / rule-card ids — opaque strings, never parsed structurally | order = code-unit compare |
| `asEntityId` `asCauseId` `asMetricId` `asRuleId` | `(raw: string) => X` | boundary parses from external strings (Law 2) | total |
| `RunSeed` `asRunSeed` | `Branded<bigint,"RunSeed">`; `(raw: bigint)` | whole-run seed; every RNG stream derives from it (R-14) | — |
| `HashHex` | `type = string` | lowercase-hex digest convention | — |
| `SimTimeUs` | `bigint` | absolute sim microseconds (event key algebra) | integer-only |
| `SimMinute` | `number` | whole-minute clock index (RNG key component; range-safe) | integer |
| `SimTick` | `bigint` | macro-tick index (projection/checkpoint boundary) | integer |
| `MoneyUnit` `asMoney` | `Branded<bigint,"MicroUsd">`; `(raw)` | signed micro-dollars (§4.4 six-bucket cash) | integer µ$ |
| `Fixed` | `bigint` | plain Q16.16 fixed-point (§3.4) — no wrapper | ±32768 range; overflow throws |
| `Tier` | `enum` | the ONE engine's seven board tiers (ratified #6) | — |
| `RngKey` `RngStream` | `interface` | stream identity `(seed,domain,minute,entity?)` + counter-based stream API | position = (key, counter) |
| `ResolutionBand` | `enum` | telemetry resolution bands (§7.6) | ordinal |
| `ObservedCell` | `interface { value; fidelity; freshnessUs; coverage; certainty; status }` | the ONLY observable unit (§3.1) — fog is cell metadata, not absence | all numbers int/Fixed |
| `ObservedKey` `observedKey` | `Branded<string,"ObservedKey">`; `(entity, property)` | flat key `` `${entityId}::${property}` `` | code-unit sort |
| `ObservedWrite` | `interface { key; cell; causeId }` | one step-12 write (single-writer guarantee, §7.13) | cause-stamped |
| `ClockKind` | `"sim" \| "business" \| "wall"` | dual-clock rule: every action names exactly one (§4.1) | — |
| `ClockState` | `interface { simUs; businessUs; wallEqUs?; minute; tick }` | three integer-µs clocks from one monotonic driver (§3.4) | bigint |
| `TickContext` | `interface { tick; minute; simUs; causeNamespace… }` | per-tick identity bundle handed to every step | — |
| `UnitIntent` | union incl. adversarial intents | hidden purpose of a unit — NEVER copied into any ObservedCell | — |
| `SourceRef` | `interface` | origin reputation of a source (granularity open G-6) | — |
| `Unit` `UnitDraft` | `interface` | traffic unit (patience, sizeCost, class, retries, lineage) / step-1+11 draft shape | ids minted monotonic |
| `InspectionDepth` | `"pass-through"\|"sample-1-in-20"\|"inspect"\|"challenge"` | R-08 depth slider | closed enum |
| `ShedOrder` | `"first-in-first-out"\|…\|"qos-weighted"` | queue discipline at capacity | closed enum |
| `NodeDiscipline` | `"hockey-stick" \| "hard-ceiling"` | per-node queue discipline (R-81…85 — the ONE exception to shared laws) | closed enum |
| `NodeSlotRecord` | `interface` | one physical slot; occupied-but-blocked is first-class (retry storms) | — |
| `NodeRecord` | `interface` | service node — SLOTS not HP (R-32), ρ, discipline, dependency | frozen-on-write |
| `QosClassDef` | `interface` | player-defined QoS class (3–5, R-55): weight, shedPriority, budget, depth | — |
| `LaneStats` | `interface { laneId; ratePerMin; latencyDistributionRef; classMix; health }` | **stats-not-entities** lane aggregate (§7.7b) — renderer draws motes FROM it | Fixed ratios |
| `WaveEnvelope` | `interface { tableId; role; shape; ratePerMin; telegraphed; dominantFamily }` | authored wave/spawn envelope handed to slot 1 (director never touches telegraphed composition, R-31) | logged in replay |
| `RetryPolicy` | `interface { maxRetries; backoffBaseUs; jitterPurchased }` | purchasable retry counterability (§4.1 Q4) | — |
| `ArrivalIn` `ArrivalOut` `ScoringIn` `ScoringOut` `QosClassifyIn` `QosClassifyOut` `RouteIn` `RouteOut` `ServeIn` `ServeOut` `QueueWaitIn` `QueueWait` `QueueWaitOut` `InspectIn` `InspectOut` `DependencyBlockIn` `DependencyBlockOut` `PatienceCheckIn` `PatienceCheckOut` `OutcomeIn` `OutcomeOut` `BackpressureIn` `BackpressureOut` `StateEconomicsIn` `StateEconomicsOut` `RulePhaseIn` `RulePhaseOut` | `interface`s | frozen I/O shapes of the 13 pipeline steps (§7.13 / §4.1) — the modifier extension points | pure data |
| `ConfidenceContribution` `SlotAssignment` `InspectionVerdict` `DependencyEdge` `SlotBlock` `OutcomeCandidate` `Outcome` `QueueWait` | `interface`s | step sub-records (routing confidence ledger, serve assignment, verdicts…) | — |
| `OutcomeTerminal` | `"served"\|"bounced"\|"blocked-false-positive"\|"landed"` | the four terminals (R-11) | closed |
| `RuleFiring` | `interface { ruleId; tick; mode; band; actions; causeId }` | one policy fire (live or shadow) | deterministic |
| `TickStep` | `type (input: In) => Out` | function contract for one pipeline slot | PURE mandated |
| `PipelineSlots` | `interface` — 13 named `TickStep` fields incl. `rulePhase` | the slot registry; a mod binds to exactly ONE slot | swap-in legal w/ extension fields |
| `TICK_STEP_ORDER` `StepId` | `as const` 1…12 then `rulePhase` | canonical step order; events concatenated in it | pinned order |
| `OneTwoThree` | `type [T] \| [T,T] \| [T,T,T]` | "one rule = one story" AND-only ≤3 (§B 2.3.5) | — |
| `Comparator` `MetricUnit` `PolicyThreshold` `Predicate` `ScopeSelector` `PolicyActionId` `PolicyAction` `PolicyEscalation` `DelegationBand` `SustainedWindow` `PolicyCard` | closed unions/interfaces | the ENTIRE policy grammar — rows not code, no player variables ever (§B 2.2) | eval = no RNG |
| `BucketId` `MoneyBuckets` `emptyMoneyBuckets` | six cash buckets (§4.4) + ctor | free / restricted / deferred / AR / backlog / committedOut | invariants asserted |
| `RevenueQualityBand` | `"gold"\|"green"\|"blue"\|"amber"\|"red"` | colour tag on every dollar (§4.4) | closed |
| `LedgerEntry` `RoutingLock` `Allocation` `SlaTerms` `Contract` | `interface`s | append-only cause-stamped ledger row; clause-driven routing locks; Bridge allocations; v0 SLA subset; contract-as-tower (§4.4 WS-4) | seq monotonic |
| `ThreatFamily` `DurationClass` `PatienceMode` `BundleTimeScale` | closed unions | Appendix A vocab (§2.24 families etc.) | closed |
| `BundleMeta` `VisitorStats` `PatienceModelParams` `PatienceModel` `BundleVisitor` `GoalCondition` `BundleGoal` `BundleScarce` `BundleTempo` `SignatureThreat` `BundleThreats` `BundleSkin` `BundleEras` `BundleEconomy` `BundleBuildables` `BundleControl` `BundleVerbs` `BundleRelations` `HandoverNote` `RosettaCard` `BundleScenarios` `BundleGuardrails` `TypeBundle` | `interface`s | hosting-type Ruleset Card as DATA (§4.3 R77: adding a type never touches code); wire numbers are JSON `number`s — the LOADER lane converts to Fixed/bigint at the boundary | frozen after parse |
| `PlayerIntent` `IntentPayload` | `interface`/union | clock-typed input-log entry — the ONLY way anything reaches the sim (§3.1 seam); `IntentPayload` has three arms: legacy `verb` (rule-carrier `PolicyActionId`/`run-runbook:NAME` strings from `policy/evaluator.ts` — the door REFUSES this carrier), `slider` (host-fed control), and `player-verb` (the door's executed arm) | append-order; replay-bundle parses payloads OPAQUELY so new arms survive the wire untouched |
| `PlayerVerb` | `enum`, 9 string values `"place-device"`…`"toggle-speed"`, `"adjust-price"` | the CLOSED player-verb set the intent door executes (§4.2 economy, §7.5 hands, §7.13 tick-inserted intents); `adjust-price` is the 9th — OD-24(a) FULL PRICING SURFACE part 1 (owner ruling 2026-10-09b, verb-set amendment recorded in the landing commit; ADR-0005 carries only the WS-2 coarse per-tier sets); the ten rule-carrier `PolicyActionId` verbs are deliberately NOT in it | closed enum; wire value = enum string |
| `PLAYER_VERBS` | `readonly PlayerVerb[]` (frozen, 9) | enumeration of the closed set — door guard + host introspection | deep-frozen const |
| `PlayerVerbPayload` | `interface { kind: "player-verb"; args: PlayerVerbArgs }` | the `IntentPayload` arm the door executes — the only carrier `applyIntentDoor` runs | — |
| `PlayerVerbArgs` | `union` of the 9 per-verb arg records below | the discriminated half of the door payload (discriminant `verb`) | ids/strings/numbers/bigint-money ONLY, never embedded objects — a wire round-trip cannot smuggle structure into the sim (Law 2) |
| `PlaceDeviceArgs` | `{ verb; nodeId: EntityId; deviceKind: string; template: string \| null }` | mint a skeleton node — host-minted unique id; `deviceKind` is a bundle archetype string the door NEVER branches on (the host validator interprets it = module decoupling); `template` null = ad-hoc | no RNG |
| `ConnectPortsArgs` | `{ verb; relation: BoardRelation; from: EntityId; to: EntityId; slot: string \| null }` | the cable verb — topology's relation reading: data = from DEPENDS ON to · power = from FEEDS to · control = from GOVERNS to · trust = from AUTHENTICATES AGAINST to; `slot` is the power-only consumer socket ("psu1"), null for the others | no RNG |
| `DisconnectDrainArgs` | `{ verb; edgeId: EntityId }` | pull a board edge by id — v0 default remains a plain pull; `drainPolicy.enabled` on the door config opts into the two-phase drained-disconnect choreography — see contract #10 | no RNG |
| `ConfigureNodeArgs` | `{ verb; nodeId: EntityId; inspectionDepth: InspectionDepth \| null; shedOrder: ShedOrder \| null }` | writes EXACTLY those two `NodeRecord` fields — null field = untouched, at least one must be set | no RNG |
| `PolicyCardCommitArgs` | `{ verb; cardHash: HashHex }` | commit a Policy Book card BY HASH — resolved through the host-wired `lookupPolicyCard`; an unknown hash is a refusal event, never a crash (the card itself is never smuggled in) | no RNG; host lookup must be deterministic |
| `ShedLoadArgs` | `{ verb; nodeId: EntityId; qosClassId: string \| null }` | records the player shed DIRECTIVE only — sold-class-shed immunity (R-55…R-58) is enforced where shedding actually happens (step 5), not here | events-only verb |
| `CommunicateArgs` | `{ verb; target: EntityId \| null; note: string }` | status-page line — target null = estate-wide post; reputation accounting is the economy lane's read of the emitted event, not the door's job | events-only verb |
| `ToggleSpeedArgs` | `{ verb; speedX: 1 \| 2 \| 4 }` | speed gates OBSERVATION, never physics (§7.5) — no hand cost by default; the door records the request for HUD/projection (host clock-scaling seam) | events-only verb |
| `PriceTargetKind` | `"plan" \| "contract-class" \| "sku"` | closed `adjust-price` target vocabulary (OD-24(a)); the door never interprets the namespaces — the host `canAdjustPrice` callback resolves ids inside whichever kind is named | closed union; value law in `intent-door.ts` `PRICE_TARGET_KINDS` |
| `AdjustPriceArgs` | `{ verb; targetKind: PriceTargetKind; targetId: EntityId; newPriceMicroUsd: MoneyUnit; effectiveAtBusinessMinute: SimMinute \| null }` | the 9th door verb (OD-24(a) part 1) — records a price ORDER into the OPTIONAL `GameState.pricing` book; NO revenue/elasticity/invoice math in the door (parts 2/3 read the book); `effectiveAtBusinessMinute` null = effective at the executing tick (business clock, Dual-Clock law) | no RNG; bigint money makes fractional prices UNREPRESENTABLE at the wire (M2 throw), ≤0 refuses `invalid-price` |
| `ExternalIntent` | `interface { tick: SimTick; intent: PlayerIntent }` | a player intent stamped with the macro tick the host submitted it — the door's feed unit; structurally twin-compatible with replay/bundle `StampedIntent` (its optional `extras` sidecar is tolerated) so any fed schedule survives `stampIntents` unchanged — types.ts must not import replay, hence the narrower twin | canonical order (tick, seq); pause-with-orders: a PAUSED-tick stamp applies at the first unfrozen advance |
| `BoardRelation` | `"data" \| "power" \| "control" \| "trust"` | id-space twin of topology's `EdgeKind` — mirror, NO import (decoupling law) | closed |
| `IntentExecutedEvent` | `interface { …base; kind: "intent-executed"; verb: PlayerVerb; intentSeq: number; handIndexes: readonly number[]; busyUntilTick: SimTick; detail: string \| null }` | the door executed an intent and its handler mutated state (or an event-only verb recorded its directive): tokens occupied (`handIndexes` empty = free verb), occupancy end exclusive, canonical short rendering ("speed=2", "qos=bronze", "depth=inspect"); disconnect details: `pulled:<edge>` (v0 plain pull), `drain-started:<edge>` / `drained:<edge>` (drain mode, contract #10) | `causeId` is `intent:<seq>` — replay-visible attribution for every applied order (§7.0); drain continuations carry causeId `drain:<edge>` with sentinel `intentSeq` −1 (never a fed intent, never receipted) |
| `IntentRefusedEvent` | `interface { …base; kind: "intent-refused"; verb: string; intentSeq: number; reason: string }` | the door REFUSED — machine-prefixed `"<code>: <detail>"` (e.g. `"hands-exhausted: need 1, free 0 of 2"`); `verb` is the PlayerVerb string or a legacy carrier label ("verb:scale-out") | nothing consumed, RNG never consulted; refusals replay identically — as replay-logged as executions |
| `DirectorDraw` | `interface { atTick; subject; value }` | seeded difficulty-director draw, replay-logged (§4.1) | logged input |
| `Checkpoint` `ReplayContentHashes` `ReplayBundle` | `interface`s | ring checkpoint, content-hash identity triple, replay artifact (§3.3) | — |
| `ArrivalEvent` `ServedEvent` `BouncedEvent` `BlockedFalsePositiveEvent` `LandedEvent` `RetryEvent` `RuleFiredEvent` `InvoiceSettledEvent` `CheckpointEvent` `IntentExecutedEvent` `IntentRefusedEvent` `SimEvent` | `interface`/discriminated union | the canonical event spine (R-11 terminals + rule/invoice/checkpoint + the door's executed/refused pair) | cause-stamped |
| `BoardEdgeRecord` | `interface { id: EntityId; relation: BoardRelation; from: EntityId; to: EntityId; slot: string \| null }` | one frozen edge of the pipeline-local board slice — the frozen mirror of topology/graph `Edge` (NO import; topology keeps its mutable MultiGraph for blast/domain math); ids mint with topology's `defaultEdgeId` convention so hosts correlate the two views | frozen record |
| `BoardState` | `interface { version: number; edges: ReadonlyMap<EntityId, BoardEdgeRecord> }` | OPTIONAL GameState embed — the pipeline-local "what CAN happen" structural slice (§4.2 graph-is-map) that connect/disconnect mutate; `version` bumps on every mutation (topology's memoization convention); pre-door hosts compile and digest unchanged | Map iteration NEVER defines order — the digest sorts edges by id; lazy-materialized |
| `HandToken` | `interface { index: number; busyUntilTick: SimTick; busyCauseId: CauseId \| null }` | one hand — free iff `busyUntilTick <= current tick` (occupancy is half-open `[start, busyUntilTick)`); `busyCauseId` names the intent event that took it | stable 0-based index = insertion order; §7.0 attribution |
| `HandState` | `interface { capacity: number; tokens: readonly HandToken[] }` | OPTIONAL GameState embed — the Hands action economy (§7.5): capacity is staff hands (T0–1: 1 · T2: 2 · …), tokens are concurrent actions; per-verb occupancy duration is door CONFIG, not stored here (v0 collapses §7.5 "duration vs attendance" into one window) | frozen array; refusal never spends |
| `PriceOverrideRecord` | `interface { targetKind; targetId; newPriceMicroUsd: MoneyUnit; effectiveAtBusinessMinute: SimMinute \| null; setAtTick: SimTick }` | one executed `adjust-price` order frozen into the book — the ENTIRE part-1 side effect (attribution `intent:<seq>` rides the minting event, not the record) | frozen record |
| `PriceOverrideBook` | `interface { version: number; overrides: ReadonlyMap<string, PriceOverrideRecord> }` | OPTIONAL GameState embed (OD-24(a) part 1) — composite key `<targetKind>:<targetId>` (kind is colon-free so the first-colon split is exact; codec `priceOverrideKey`/`parsePriceOverrideKey` in the door); `version` bumps per materialized write; last-write-wins per key | digest-switch law: `pipeline/digest.ts` absorbs ONLY when present (pre-pricing digests byte-identical); keys sort code-unit — Map insertion order NEVER read |
| `GameState` | `interface { runSeed; engineVersion; contentHashes; context; units; nodes; lanes; observed; cash; ledgerSeq; contracts; ruleBook; ruleBookHash; board?; hands?; pricing? }` | THE sim state (§4.1); `observed` written ONLY by step 12; map insertion order part of identity; `board`/`hands` are the INTENT-DOOR embeds and `pricing` the OD-24(a) part-1 price-override book — all OPTIONAL, digest-switch law: `pipeline/digest.ts` absorbs each WHEN PRESENT (pre-door/pre-pricing digests byte-identical) | order-pinned, frozen per tick |

---

## kernel

Purpose: the arithmetic and clock substrate every lane stands on — Q16.16
plain-bigint fixed point, integer-µs three-clock model, and counter-based
seeded RNG streams keyed `(run_seed, domain, sim_minute, entity?)` (§3.4,
§4.1 R-16…R-31). Splitmix64 core implemented with 32-bit `Math.imul` limbs so
browser-JS and Node produce byte-identical draws (OD-5(b) dual-runtime parity
gate; golden fixtures in `tools/headless`). Import: `@hh/sim-core/kernel`
(resolves to the integrator file `src/kernel.ts` which stars
`fixed.ts + time.ts + rng.ts`). **Not shipped:** `limbs.ts` (mul32 internals)
and `rng-reference.ts` (bigint oracle used only by tests).

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `FRACTIONAL_BITS` | `16` | Q16.16 fractional width | const |
| `FIXED_SCALE` `FIXED_ZERO` `FIXED_ONE` `FIXED_UNIT` | `Fixed` | 1.0 raw (`65536n`), 0, 1 aliases | const |
| `FIXED_RAW_MAX` `FIXED_RAW_MIN` | `bigint` | ±32768 guard-rail raws (overflow = throw) | const |
| `fromInt` | `(whole: number) => Fixed` | exact integer → Fixed (rejects fraction/unsafe) | total-throwing |
| `fromRatio` | `(num: bigint, den: bigint) => Fixed` | rational → Fixed, round-half-away-from-zero | pure, range-checked |
| `add` `sub` | `(a: Fixed, b: Fixed) => Fixed` | exact ±, range-checked | pure, throws on overflow |
| `mul` `div` | `(a: Fixed, b: Fixed) => Fixed` | Q16.16 ×/÷ with rounding | pure; div-by-0 throws |
| `compare` | `(a: Fixed, b: Fixed) => -1\|0\|1` | total order (never `<` on raws across lanes) | pure |
| `toNumber` | `(value: Fixed) => number` | display-only escape hatch | NOT for logic paths |
| `clampUnit` | `(value: Fixed) => Fixed` | clamp to [0,1] (health/coverage) | pure |
| `inRange` | `(raw: bigint) => boolean` | Q16.16 representability probe | pure |
| `MICROS_PER_MS` `MICROS_PER_SEC` `MICROS_PER_MIN` `MICROS_PER_HOUR` `MICROS_PER_DAY` `SIM_US_PER_SIM_MINUTE` | `SimTimeUs` | integer-µs unit constants | const |
| `DEFAULT_TICK_US` | `= SIM_US_PER_SIM_MINUTE` | one macro-tick ≡ one sim-minute (§7.13) | const |
| `ClockScale` | `interface { num: bigint; den: bigint }` | rational clock ratio | — |
| `SpeedFactor` | `1 \| 2 \| 4` | ratified speed set | closed |
| `simScale` `incidentScale` | `(speed: SpeedFactor) => ClockScale` | sim/incident clock ratios per speed | pure |
| `BUSINESS_SCALE_DEFAULT` | `ClockScale = 43200/7` | business-minutes-per-real-day ratio — **OD-2 RATIFIED 2026-10-09 (ADR-0009 rec #2): month stays 7 real-min, the 4-min flip DECLINED (§7.13 doctrine); constant is ratified law as-shipped** (the code docblock's pre-ratification "pending" wording is owed a hygiene pass) | const |
| `WALL_SCALE` | `ClockScale` | 1:1 reference wall mapping | const |
| `scaleUs` | `(durationUs: SimTimeUs, scale: ClockScale) => SimTimeUs` | exact rational time rescale | pure bigint |
| `us` | `(value: bigint \| number) => SimTimeUs` | parse boundary → µs | total-throwing |
| `addUs` `subUs` `minUs` `maxUs` | `(a, b) => SimTimeUs` | µs algebra | pure |
| `minutesToSimUs` | `(minutes: number \| bigint) => SimTimeUs` | minute → µs lift | pure |
| `simMinuteOf` | `(clocks: ClockState) => SimMinute` | current whole-minute index (RNG key) | pure |
| `tickOf` | `(clocks: ClockState, tickUs?: SimTimeUs) => SimTick` | current macro-tick index | pure |
| `initialClocks` | `() => ClockState` | all-zero three-clock origin | seeded-by-0 |
| `ClockAdvance` | `interface { simDelta?; businessDelta?; speed? }` | INJECTED fixed delta for one advance — the no-wall-clock seam | — |
| `advanceClocks` | `(clocks: ClockState, advance: ClockAdvance) => ClockState` | move the three clocks by injected deltas only | pure, no clock |
| `openStream` | `(key: RngKey) => RngStream` | materialize the counter stream at (key, counter 0) | deterministic given key |
| `streamFor` | `(runSeed: RunSeed, domain: string, simMinute: SimMinute, entityId?: EntityId \| null) => RngStream` | THE stream accessor — per-key reopening means step-local consumption order can't perturb anything else (§4.1 R-16) | seeded, isolated |

**Stream discipline** (rng.ts header): `domain` forks extend the parent name
but the counter restarts — per-unit forks repeat, so use ONE forked stream per
sequence; `range(n)` is rejection-sampled (no modulo bias).

---

## pipeline

Purpose: the twelve-step tick shell plus the 12.5 rule phase —
`hosting_game.md §7.13` via §4.1. The driver advances `GameState` through
`TICK_STEP_ORDER`, threads step outputs into inputs, owns cross-tick memory
(retry re-entries, id mint, retry depths), and stamps every terminal event.
`defaults.ts` provides the reference pure `TickStep` for all 13 slots;
`createDefaultSlots(config)` assembles them and **any single slot may be
swapped by a modifier card** (the extension-point architecture).
`intent-door.ts` is the external-intent entry (see contract #10 below): the
driver calls `applyIntentDoor` BEFORE step 1 every tick. Import:
`@hh/sim-core/pipeline`. `internal.ts` (TICK_US, comparison/slot helpers,
`rollUnder`) is deliberately NOT exported; only `digestState` comes out of
`digest.ts`.

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `TickInputs` | `interface { envelopes; evidence; classes; dependencyEdges; retryPolicy; aggression; expressMaxConfidence; kneeRho?; routingLocks?; valueByUnit?; stormFactor?; suppressedRuleIds?; lanes?; externalIntents? }` | everything the steps need that `GameState` doesn't carry — host assembles per tick; replay-log fodder; `externalIntents` (readonly `ExternalIntent[]`) feeds the intent door — each entry EXACTLY ONCE (ambient-input contract, same as envelopes/evidence) | frozen data-in |
| `TickResult` | `interface { state; events; outcomes; ruleFirings; intents; pressure; pendingReentries; doorReceipts }` | one tick's complete answer; events concatenated in canonical step order — door events LEAD (the door runs before step 1); `doorReceipts` = per-intent door verdicts in (tick, seq) application order | order-pinned |
| `PendingReentry` | `interface { draft; readyAtTick; retryDepth; lineageRoot }` | checkpointable cross-tick driver memory (replay hand-off §3.3) | — |
| `TickDriverOptions` | `interface { tickAdvance?; tickUs?; intents?; purgeProbeCap?; purgeVerifyTicks?; purgeTargetedMinNodes?; unlocks?: UnlockDriverWiring }` | fixed per-advance delta (default 1 real s @1× ⇒ exactly 1 tick); `intents` wires the door (hand costs/occupancy, placement validator, card lookup) — omitted = defaults, door still runs for any fed schedule; rec#5 knobs size the queue-attribution probe (probe cap 64 default, verify cadence 8, index floor 8 nodes); `unlocks` wires the §5 Phase-2 observer seam (see `UnlockDriverWiring` below) — omitted ⇒ `TickResult` carries no `unlockProposals` key at all | no wall clock |
| `TickDriver` | `interface { advance(state, inputs): TickResult; exportPending(): { readonly pending: readonly PendingReentry[]; readonly depths: readonly (readonly [EntityId, number])[] } (frozen; `depths` carries the LIVE roster units' retry depths sorted byId — pre-F6 checkpoints dropped them and restored runs silently re-fuelled storm budgets); importPending(checkpoint, mintCounter): void; currentMintCounter(): number }` | the stateful scheduler object around pure steps — advance is pure w.r.t. GameState (the door runs FIRST inside every advance) | same (state,inputs) ⇒ same result |
| `createInitialState` | `(options: { runSeed; engineVersion; contentHashes; clocks; nodes?; lanes?; contracts?; ruleBook?; ruleBookHash?; hands?; handCapacity?; board? }) => GameState` | mint state 0 — pass nodes/lanes/contracts SORTED: Map insertion order is part of deterministic identity (§3.4); `hands` (a `mintHandState` product) or `handCapacity` to mint a full hand, `board` to seed edges — all OPTIONAL, pre-door callers digest byte-identically | order-pinned |
| `createTickDriver` | `(steps: PipelineSlots, rng: RngStream, clocks: ClockState, options?: TickDriverOptions) => TickDriver` | wire the 13 slots + root stream into the shell | seeded |
| `DefaultPipelineConfig` | `interface { runSeed; dnsNodeId; expressPath; deepPath; defaultPatienceUs; defaultSizeCost; patienceJitterPct; inspectionCostUs; detectionRatio; falsePositiveRatio; referralProbability; returnProbability }` | closed-over-run config for every default step | — |
| `createDefaultSlots` | `(config: DefaultPipelineConfig) => PipelineSlots` | all 13 default slots in one object — spread-overwrite any slot to mod the sim | seeded via config |
| `createArrivalStep` | `(config: Pick<DefaultPipelineConfig, "defaultPatienceUs"\|"defaultSizeCost"\|"patienceJitterPct"\|"familyMix"\|"populationEffects">) => TickStep<ArrivalIn, ArrivalOut>` | step 1: envelopes → Unit drafts at placed minutes; optional `familyMix` die (the waves-parser feed — rolled only when the bundle authored weights) and the §2.13 population repel loop (see `ArrivalInExt`) — both presence-gated, absent ⇒ byte-identical pre-fix step | seeded (per-minute stream) |
| `defaultScoringStep` | `TickStep<ScoringIn, ScoringOut>` | step 2: evidence → confidence per unit | pure |
| `defaultQosClassifyStep` | `TickStep<QosClassifyIn, QosClassifyOut>` | step 3: class assignment from weights | pure |
| `createRouteStep` | `(config: Pick<DefaultPipelineConfig, "dnsNodeId"\|"expressPath"\|"deepPath">) => TickStep<RouteIn, RouteOut>` | step 4: express-vs-deep path by ρ/confidence, consults RoutingLocks | seeded jitter, pure path math |
| `defaultServeStep` | `TickStep<ServeIn, ServeOut>` | step 5: slot occupancy, service times; writes UNIT_HOLD for step 8 | pure + in-tick side-table |
| `defaultQueueWaitStep` | `TickStep<QueueWaitIn, QueueWaitOut>` | step 6: hockey-stick ρ/(1−ρ) wait accrual | pure |
| `createInspectStep` | `(config: Pick<DefaultPipelineConfig, "inspectionCostUs"\|"detectionRatio"\|"falsePositiveRatio">) => TickStep<InspectIn, InspectOut>` | step 7: depth-slider verdicts (R-08) | seeded |
| `defaultDependencyBlockStep` | `TickStep<DependencyBlockIn, DependencyBlockOut>` | step 8: dependency blocking; occupied-but-blocked slots stay held | pure + in-tick side-table |
| `createPatienceCheckStep` | `(config: Pick<DefaultPipelineConfig, "runSeed"\|"patienceModeByType">) => TickStep<PatienceCheckIn, PatienceCheckOut>` | step 9: elapsed + predicted hockey-stick wait vs patience budget (+jitter) under each unit type's R25 MODE (see `PATIENCE_MODE_VOCAB`); `patienceModeByType` unset ⇒ every unit resolves sigmoid-budget, byte-identical to the pre-mode step (presence gate, pinned) | seeded (contract lacks rng on this In — deviation documented) |
| `PATIENCE_MODE_VOCAB` | `readonly PatienceMode[]` (frozen 7: `sigmoid-budget`, `window`, `value-decay`, `binary`, `none`, `resident`, `corrupts`) | the R25 closed vocabulary mirrored at runtime (same boundary-parse shape as the loader's private list) — a typo'd authored mode in `patienceModeByType` throws at STEP CREATION naming the vocab, never mid-run; `sigmoid-budget` is today's law and the default for unlisted types; `corrupts` is the p=0 placeholder whose damage-channel half the frozen 4-terminal Outcome set cannot carry (reported, never invented); `resident` holds capacity instead of abandoning | closed set; fail-loud parse |
| `defaultOutcomeStep` | `TickStep<OutcomeIn, OutcomeOut>` | step 10: the four terminals (R-11) | pure |
| `createBackpressureStep` | `(config: Pick<DefaultPipelineConfig, "referralProbability"\|"returnProbability">) => TickStep<BackpressureIn, BackpressureOut>` | step 11: retry/referral/return re-entry scheduling — emergent retry storms | seeded |
| `createStateEconomicsStep` | `(estateAnchor: EntityId) => TickStep<StateEconomicsIn, StateEconomicsOut>` | step 12: ground-truth → observed/money surface for the driver | pure |
| `emptyRulePhaseStep` | `TickStep<RulePhaseIn, RulePhaseOut>` | legal no-op 12.5 (empty interpreter) | pure |
| `BackpressureInExt` `OutcomeInExt` | `interface extends …` | driver-passed structurally-richer inputs (extension fields invisible to foreign steps) | — |
| `ArrivalInExt` | `interface extends ArrivalIn { inFlightUnits?: number }` | the driver-stamped arrival input (audit g09 population channel): `createTickDriver` ALWAYS stamps `inFlightUnits` = last tick's roster + this tick's matured re-entries so the §2.13 herding repel loop can judge the herd BEFORE arrivals; the default step reads it ONLY when the host authored `populationEffects` (presence gate keeps every golden; configured-but-unstamped input throws at the step call, naming the driver as the stamping host) | invisible to foreign steps |
| `UNIT_HOLD` | `Map<EntityId, EntityId>` | MUTABLE in-tick side-table bridging step 5→8 (frozen shapes leave no in-band channel) — driver clears before every tick | never crosses a tick |
| `BOUNCE_GRID_BPS` | `50` | bounce-LUT resolution (0.5 % steps) | const |
| `BOUNCE_MAX_RATIO_BPS` | `25_000` | LUT ceiling 250 % elapsed/patience | const |
| `bounceProbability` | `(ratioBps: number) => Fixed` | P(bounce) from patience-ratio via quantized LUT | pure table read |
| `patienceRatioBps` | `(elapsedUs: SimTimeUs, patienceUs: SimTimeUs) => number` | integer ratio → bps | pure |
| `bounceLutEntry` | `(index: number) => Fixed` | single LUT cell | pure |
| `BOUNCE_LUT_LENGTH` | `number` | LUT size (pre-allocated at module load) | const |
| `DEFAULT_KNEE_RHO` | `Fixed (0.7)` | hockey-stick knee default (R-07; OD-2 ratified 2026-10-09 — the knee is NOT sheet data, the shipped 0.7 stays law until a later calibration pass; pass `kneeRho` to override) | const |
| `RHO_CEILING` | `Fixed (0.99)` | utilization clamp | const |
| `MAX_WAIT_MULTIPLIER` | `Fixed` | ρ/(1−ρ) at the ceiling | const |
| `occupiedSlots` | `(node: NodeRecord) => number` | busy-slot count | pure |
| `utilization` | `(node: NodeRecord) => Fixed` | ρ = busy/total | pure |
| `freeSlotIndices` | `(node: NodeRecord) => number[]` | assignable free slots, index order | pinned order |
| `hockeyStickMultiplier` | `(rho: Fixed, kneeRho: Fixed) => Fixed` | the "most important curve in the game": 1 below knee, ρ/(1−ρ) blow-up above | pure |
| `hockeyStickWaitUs` | `(serviceTimeUs: SimTimeUs, rho: Fixed, kneeRho: Fixed) => SimTimeUs` | expected queue wait under the curve | pure |
| `BACKPRESSURE_QUEUE_DEPTH_TRIGGER` | `1` | queue depth that starts storm pressure | const |
| `effectiveRho` | `(node: NodeRecord, downstreamQueueDepth: number) => Fixed` | ρ adjusted by downstream backlog | pure |
| `makeSlots` | `(count: number) => NodeRecord["slots"]` | mint an empty slot array | pure |
| `ONE_SLOT` | `Fixed` | one-slot cost unit | const |
| `digestState` | `(state: GameState) => HashHex` | the state-hash tripwire over GameState (feeds replay ring); absorbs `hands` (capacity + per-token occupancy), `board` (version + edges sorted by id) and `pricing` (version + overrides keyed-sorted, `-1` sentinel for null effective minutes) ONLY WHEN PRESENT — pre-door / pre-pricing digests byte-identical | own double-FNV-1a over a sorted-key canonical sink ("hh-state-v1" tag) — pluggable as replay's `StateDigest` override, NOT the replay codec |
| `applyIntentDoor` | `(state: GameState, context: TickContext, externalIntents: readonly ExternalIntent[], config?: IntentDoorConfig) => IntentDoorResult` | THE intent door (§4.2/§7.5/§7.13, contract #10 below): apply the fed schedule BEFORE step 1 — entries stamped at or before the current tick sort by (tick, seq), future stamps refuse after the due pass in input order; pure over GameState | no RNG, no clock reads, no platform APIs; same schedule ⇒ identical digest chain (×100-gated) |
| `IntentDoorError` | `class extends Error` | STRUCTURAL wire garbage at the boundary throws (Law 2 parse-don't-validate + Law 4 fail-fast) — ANY primitive TYPE mismatch on the feed: stamp fields AND every per-verb arg shape parsed in `parseEntry` (M2: one type law, not per-handler checks), plus a repeated `(tick, seq)` stamp within one schedule (M4: two entries claiming one attribution identity — offenders' input positions named). A host feeding malformed wire data has a bug to find, not a game state to fork; VALUE-domain violations (out-of-set values, empty strings, unknown ids) stay semantic refusals (event-logged, nothing thrown) | total-throwing at parse |
| `IntentDoorConfig` | `interface { handCapacity?; handCost?; occupancyTicks?; canPlaceDevice?; canAdjustPrice?; lookupPolicyCard?; deviceSlots?; deviceServiceTimeUs?; deviceInspectionDepth?; deviceShedOrder?; deviceDiscipline?; drainPolicy? }` | door tuning: per-verb cost/occupancy overrides + the three host callbacks (placement validator, price-target validator, policy-card resolver) + skeleton `NodeRecord` knobs for placed devices + `drainPolicy?: { enabled?: boolean (DEFAULT false — v0 plain pull stays law); drainTicks?: number (default 2) }` opting `disconnect-drain` into the two-phase drain choreography (contract #10); cost>0 paired with occupancy 0 is a LEGAL override — the half-open window `[tick, tick+0)` releases the token at the next door pass (the token still counts busy within the submitting pass; no default verb pairs the two) | data-in; callbacks must be deterministic; a malformed `drainPolicy` (non-boolean `enabled`, non-safe-int/`<1` `drainTicks`, or `enabled` paired with `handCost[disconnect-drain]` 0 — the reservation record would be uncarriable) throws `IntentDoorError` at the boundary |
| `PlaceDeviceQuery` | `interface { args: PlaceDeviceArgs; state: GameState; context: TickContext }` | what the host's `canPlaceDevice` validator sees — parsed args plus a READ-ONLY view of the draft (devices placed EARLIER in the same tick are visible, never a stale board); needs/provides, palette membership, U-space, power fit stay HOST-side | read-only snapshot |
| `PlacementRejection` | `interface { reason: string }` | the validator's "no" — null means accept; the reason lands VERBATIM in the refusal event as `placement-rejected: <reason>` | — |
| `AdjustPriceQuery` | `interface { args: AdjustPriceArgs; state: GameState; context: TickContext }` | what the host's `canAdjustPrice` validator sees (OD-24(a) part 1) — parsed args plus a READ-ONLY view of the draft (earlier same-tick writes visible, W1 snapshot law); plan/catalog existence, ownership shape, price floors stay HOST-side | read-only snapshot |
| `PriceTargetRejection` | `interface { reason: string }` | the price validator's "no" — null means accept; the reason lands VERBATIM in the refusal event as `unknown-plan: <reason>` | — |
| `IntentReceipt` | `interface { submittedTick: SimTick; seq: number; verb: string; outcome: "executed" \| "refused"; reason: string \| null }` | one per FED intent — the door's verdict roll-up (host HUD ticker / test assertion sugar; the events array is the replay-grade record); door-internal drain continuations (contract #10) NEVER mint receipts — they are not fed inputs, their record is the event alone | canonical application order |
| `IntentDoorResult` | `interface { state: GameState; events: readonly SimEvent[]; receipts: readonly IntentReceipt[] }` | the door's answer — SAME state object identity when nothing applied (no intents / all refused) AND no hand token was due for release (a refused pass that still touches the rail materializes the released-hands slice — a state change, not an identity violation); executed + refused events in canonical order (future-stamp refusals trail, in input order) | frozen; identity-preserving |
| `mintHandState` | `(capacity: number) => HandState` | mint all-free hand tokens (indices 0…capacity−1, `busyUntilTick` 0n) — §7.5 T0/T2 default is 1 | deep-frozen; total-throwing unless safe integer ≥ 1 |
| `createBoardState` | `(edges?: readonly BoardEdgeRecord[]) => BoardState` | empty (or seeded) board slice — edges stored sorted by `EntityId` and each record frozen | order-pinned on insertion; records deep-frozen (`edges` ReadonlyMap is a TYPE-level guarantee — `Object.freeze` on a Map cannot seal its contents; writers replace the Map) |
| `createPriceOverrideBook` | `() => PriceOverrideBook` | empty (version 0) pricing slice — the OD-24(a) part-1 mirror of the board constructor | deep-frozen |
| `priceOverrideKey` | `(targetKind: PriceTargetKind, targetId: EntityId) => string` | composite book key `` `<targetKind>:<targetId>` `` — kinds are colon-free by vocabulary law, so the FIRST-colon split is exact even for colon-carrying ids | total |
| `parsePriceOverrideKey` | `(key: string) => { targetKind: PriceTargetKind; targetId: EntityId } \| null` | the codec's inverse for part 2/3 readers — null on unknown kind or empty id (never throws on hostile strings) | null-on-garbage |
| `DEFAULT_INTENT_HAND_COST` | `Readonly<Record<PlayerVerb, number>>` (frozen table) | hand tokens per verb: 1 for every verb EXCEPT toggle-speed = 0 (speed gates observation, never physics); adjust-price = 1 (OD-24(a)) | const table |
| `DEFAULT_INTENT_OCCUPANCY_TICKS` | `Readonly<Record<PlayerVerb, number>>` (frozen table) | §7.5 reference durations rounded UP to whole sim-minute ticks: place/connect 3 · disconnect/shed/communicate 2 · configure/commit/adjust-price 1 (price change is a COMMIT-class decision, OD-24(a)) · toggle 0 (config change 40 s→1, failover 90 s→2, cable trace 3 min→3); "duration vs attendance" COLLAPSED to one window in v0 | const table |
| `UnlockNoticeView` `UnlockObservationWindow` `UnlockProposalView` | structural mirrors of the unlocks/ engine's `UnlockNoticeLike` / `UnlockTickInput` / `UnlockProposal` (the `via` widens to string; the engine's union stays a closed subset) | the §5 Phase-2 observer seam mirrored DRIVER-side — pipeline never imports unlocks/ or economy/ (same decoupling pattern as the embedded board slice vs importing topology/): `createUnlockObserver()` satisfies the mirror BY SHAPE and tsc refuses drift between the two. The window is the ONE thing forwarded per advance: `tick`/`minute`/`events` always, `notices`/`eraYear` only through the host's callbacks (economy ticks run beside the pipeline; the loader/eras vocabulary is host-held) — no GameState, ever | read-only view; proposals deterministic from (event stream, feed order) |
| `UnlockDriverObserver` `UnlockDriverWiring` | `interface { observe(window): readonly UnlockProposalView[] }`; `interface { observer; noticesOf?: () => readonly UnlockNoticeView[]; eraYearOf?: () => number \| null }` | `TickDriverOptions.unlocks` payload: the observer plus the two host feeds the driver cannot produce itself, both read FRESH every advance. Returned proposals ride `TickResult.unlockProposals` ONLY when wired — unwired TickResults serialize exactly as before (the seam's digest-neutrality: nothing enters GameState, events, or any digest; pinned in pipeline `__tests__/driver-unlocks.test.ts`) | default OFF; replay the same inputs ⇒ same proposals |

---

## observed

Purpose: ground/observed twins and the fog machinery (§3.1 laws 1–3, §4.1
R-66…R-72, hg §7.6). `ObservedStore` holds per-property dual state — a
HARD-private ground registry and the observed cell layer — and enforces the
**step-12 single-writer law** mechanically (one write path, tick watermark,
digestible values). The instrumentation model routes ground→observed through
`InstrumentBinding`s so "degradation is a property of the binding layer, not
of 200 components"; wrong-probe bindings (`source ≠ target`) report the wrong
fact faithfully, flagged for audit. Per-consumer projections (`observedView`)
make leaks structurally impossible. Import: `@hh/sim-core/observed`.

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `InstrumentClass` | `interface { id; label; lagUs; staleAfterUs; band; certaintyCeiling }` | named instrumentation tier (latency/staleness/resolution/certainty) | — |
| `CLASS_GRAPHS_5MIN` `CLASS_GRAPHS_30S` `CLASS_TRACING` `CLASS_PACKET_TAP` `CLASS_HEALTHCHECK` | `InstrumentClass` | the five authored instrument classes (§7.6 ladder) | const |
| `InstrumentBinding` | `interface { instrumentId; source; target; klass; … }` | routes ONE ground property through ONE class onto ONE observed property | — |
| `reportsWrongThing` | `(binding: InstrumentBinding) => boolean` | the mis-bound probe predicate ("health check checking the wrong thing") | pure |
| `validateBinding` | `(binding: InstrumentBinding) => void` | fail-fast binding check | total-throwing |
| `statusFor` | `(opts: { hasValue; ageUs; staleAfterUs }) => "live"\|"stale"\|"unknown"` | cell freshness verdict | pure |
| `unknownCell` `unknownCellWithCoverage` | `() => ObservedCell<unknown>`; `(coverage: Fixed)` | the known-unknown cell the HUD draws | pure |
| `GroundSample` | `interface { atUs; value }` | one ground-truth observation point | — |
| `deriveCell` | `(binding, sample: GroundSample \| null, tickUs: SimTimeUs) => ObservedCell<unknown>` | the fog funnel: ground sample → degraded observed cell per binding class | pure integer/Fixed |
| `BandSpec` `RESOLUTION_LADDER` `LadderPoint` | `interface`s + ladder table | retained-history resolution bands (§7.6) | — |
| `PointRing` `ResolutionLadder` `GroundHistory` | `class` | insertion-ordered ring buffers, flushed by window index | pure function of (value,tickUs) sequences |
| `HandDiagnosisFactor` `byHandDiagnosisUs` | `4 \| 8`; `(baseProbeUs, factor) => SimTimeUs` | on-hands diagnosis probe cost multiplier | pure |
| `validateCell` | `(cell: ObservedCell<unknown>, context: CauseId \| string) => void` | cell-shape gate on every write | total-throwing |
| `coverageRatio` | `(instrumented: number, total: number) => Fixed` | coverage fraction for cells | pure |
| `FairnessChannel` | `"site-preview" \| "pulse-strip"` | the §7.6 bounded-fog exception ("never lied to") | closed |
| `GroundPatch` | `interface { key; value; changedAtUs; fairnessChannel? }` | ground registry write inside the step-12 batch | watermark-checked |
| `InstrumentPatch` | `interface { binding }` | instrumentation registration inside the same batch | — |
| `ObservedRecord` | `ObservedWrite \| GroundPatch \| InstrumentPatch` | the step-12 batch record union | — |
| `CoverageSummary` | `interface` | aggregate coverage stats for the HUD | — |
| `ObservedStore` | `class` — public methods: `applyObservedWrites(writes, tickUs)`, `read<T>(key)`, `hasKey`, `knownEntities()`, `propertiesOf(entity)`, `unknownKeys()`, `coverageSummary()`, `history(key, band)`, `bindingFor(target)`, `causeOf(key)`, `fairnessChannelOf(key)`, `sitePreview(key)`, `pulseStrip(key)`, `toObservedMap()`, `digest()` | THE single-writer store: only `applyObservedWrites` mutates; batches older than the watermark throw; ground values escape ONLY through the two fairness channels | machine-enforced single writer |
| `parseKeyEntity` `parseKeyProperty` | `(key: ObservedKey) => EntityId / string` | split the flat `entity::property` key | pure |
| `CANONICAL_CELL_PREFIX` | `"hh-canon-v1:"` | the marker prefix on a composite cell value folded to canonical hash text at the write gate (FIX-4) | const |
| `isCompositeCellValue` | `(value: unknown) => boolean` | plain-object/array cell values are "composite" (undigestible as-is) | pure |
| `foldCompositeCellValue` | `(value: unknown) => unknown` | fold a composite to `hh-canon-v1:<fnv1aHex>` of its `stableSerialize` text BEFORE it enters store state, so digest consumers never go "unsupported"-blind on aggregate cells; key-permuted composites fold identically (serializer sorts keys) | deterministic hash; distinct composites → distinct folds |
| `stableSerialize` | `(value: unknown, depth: number) => string` | digestible-value serializer guarding what may enter state (depth-limited) | order-pinned; throws on undigestible |
| `DEFAULT_HAND_PROBE_US` | `SimTimeUs (1 min)` | base on-hands probe period | const |
| `SeatId` `asSeatId` | `Branded<string,"SeatId">`; `(raw)` | consumer seat identity | — |
| `SeatScope` | `interface` | what one seat may see (estate / entity list / property list) | — |
| `estateScope` `entityScope` `propertyScope` | `(seat, …) => SeatScope` | the three scope mints | pure |
| `isPropertyInScope` `isKeyInScope` | `(scope, …) => boolean` | leak-gate predicates | pure |
| `ObserverKind` | `"seat" \| "local-player" \| "renderer" \| "policy-interpreter" \| "headless-analyst"` | consumer taxonomy — one code path for all (OD-5(b) portable-lib alignment) | — |
| `Consumer` | `interface { kind; seat; scope }` | a projection request | — |
| `projectSeat` | `(store: ObservedStore, scope: SeatScope) => ReadonlyMap<ObservedKey, ObservedCell<unknown>>` | fog-filtered seat map (the leak property test target) | order-pinned |
| `observedView` | `(store: ObservedStore, consumer: Consumer) => ReadonlyMap<ObservedKey, ObservedCell<unknown>>` | THE `observed_view(consumer)` (§3.1) | order-pinned |

---

## policy

Purpose: the closed-enum Policy-Card interpreter occupying pipeline slot
12.5 — "rows, not code" (§4.5, Appendix B). Reads ONLY the observed map it is
handed (fog degrades automation, by design); **evaluation touches no RNG at
all** (the `rng` field of `RulePhaseIn` is deliberately never read); emits
`RuleFiring`s + `PlayerIntent`s for NEXT-tick adjudication and never mutates
world state. Store = versioned, ordered, suspendable book with per-version
audit history. Conflicts detector proves oscillation cycles, contradictory
actions, order-shadowing and resource contention BEFORE install. Routing =
alert escalation graph (sev-1…4, roles/runbooks). Import:
`@hh/sim-core/policy`.

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `PolicyGrammarError` | `class extends Error` | grammar-violation throw | — |
| `COMPARATORS` `METRIC_UNITS` `ACTION_IDS` `BANDS` `SCOPE_KINDS` | `ReadonlySet<string>` | the closed vocabularies of Appendix B (§B 2.2) | frozen sets |
| `EffectToken` `ResourcePool` | closed unions | action→effect surface area / pool accounting nouns | — |
| `ACTION_EFFECTS` `ACTION_POOLS` | `Readonly<Record<PolicyActionId, …>>` | the ONE action→effect table (§B 2.4) | const |
| `CONTRADICTORY_PAIRS` | `readonly [PolicyActionId, PolicyActionId][]` | scale-out×drain, failover×drain | const |
| `DEFAULT_METRIC_TOKENS` | `Readonly<Record<string, readonly EffectToken[]>>` | metric→effect defaults | const |
| `validatePolicyCard` | `(card: PolicyCard) => PolicyCard` | parse-don't-validate grammar gate at the boundary (returns frozen card) | total-throwing |
| `thresholdAmountToCellRaw` | `(unit: MetricUnit, amount: Fixed) => bigint` | threshold normalization into cell-compare space | pure |
| `observedValueToCellRaw` | `(value: unknown, ruleId: string, metric: string) => bigint` | coerce an observed cell value into compare space | total-throwing |
| `DirectedGraph` `GraphError` `detectDirectedCycles` | `interface`; `class`; `(graph, includeSelfLoops) => string[][]` | tiny deterministic digraph + cycle finder (shared shape for routing/conflicts) | sorted-node order |
| `CycleScanOptions` `CycleScanResult` `DEFAULT_CYCLE_SCAN` | `interface { maxCycleLength; workBudget }`; `interface { cycles; truncated; steps }`; `{3, 100_000}` | bounds for the P7 scan: longest cycle reported (self-loop = 1; save-lint archetype A⇒B⇒A so 2–3 suffice; `Infinity` = complete) and a hard cap on neighbor-expansion steps | `truncated: true` means the report is INCOMPLETE — callers must surface it (save-lint emits `CYCLE_SCAN_BUDGET_EXCEEDED`) |
| `detectDirectedCyclesBounded` | `(graph, includeSelfLoops, opts?) => CycleScanResult` | length- + work-bounded cycle scan (dense-graph safe variant of `detectDirectedCycles`) | sorted-node order; halts at budget instead of hanging on K_n |
| `PolicyStoreError` | `class extends Error` | store mutation throw | — |
| `RuleVersionRecord` | `interface` | one audited version of a rule (rev, card, hash, installedAtTick) | — |
| `PolicyStore` | `interface` | ordered book + per-rule version history + suspension + freeze flag | — |
| `createPolicyStore` | `() => PolicyStore` | empty store | pure |
| `liveRecord` `isSuspended` `activeBook` `suspendedRuleIds` `upkeepPerMinute` | `(store, …) => …` | current-version reads; upkeep = Σ live-card cost | order-pinned |
| `insertCard` | `(store, card, position, tick) => PolicyStore` | insert at position (new store — immutable lineage) | versioned, tick-stamped |
| `reviseCard` | `(store, card, tick) => PolicyStore` | same ruleId, new version | versioned |
| `moveCard` | `(store, ruleId, toPosition) => PolicyStore` | reorder = re-prioritize (canonical eval order) | order-pinned |
| `setSuspended` `setFrozen` | `(store, …) => PolicyStore` | per-rule kill switch / whole-book freeze (R18) | — |
| `ruleHistory` | `(store, ruleId) => readonly RuleVersionRecord[]` | full audit trail | insertion order |
| `PolicyEvalError` | `class extends Error` | interpreter throw | — |
| `ScopeResolver` | `(scope: ScopeSelector, allEntities: readonly EntityId[]) => readonly EntityId[]` | injectable scope expansion (editor hosts resolve queries; engine default doesn't) | default pure |
| `ActionFeasibility` | `(ruleId, actions, tick) => …` | injectable feasibility probe | pure by contract |
| `defaultScopeResolver` | `(scope, allEntities) => readonly EntityId[]` | engine built-in resolution | order-pinned |
| `PendingConsultation` | `interface` | consult-band rule awaiting human approval | — |
| `PolicyFireStage` | 12-member union (`execute`…`escalation-runbook`) | why/where a card stopped or passed | closed |
| `PolicyFireEntry` | `interface` | fire-journal row (rule, tick, stage, actions) | append order |
| `PolicyRuntimeState` | `interface` | FOR-debounce latches, edge latches, value snapshots, pending consults, deferred consult resolutions (P3), intent seq, journal (`FireLog`) — ALL threaded explicitly in→out (Law 3) | pure state chain |
| `createRuntimeState` | `() => PolicyRuntimeState` | empty runtime | pure |
| `PolicyEvaluationConfig` | `interface` | shadow-mode, consult expiry, escalation table, hooks | — |
| `DEFAULT_CONSULT_EXPIRY_US` | `SimTimeUs (30 min)` | consult TTL | const |
| `defaultEvaluationConfig` `shadowEvaluationConfig` | `PolicyEvaluationConfig` | live book / dry-run book (shadow log feeds oscillation detection, §B 2.4) | const |
| `RulePhaseResult` | `interface { state; out: RulePhaseOut }` | next runtime + slot output | pure |
| `runRulePhase` | `(state, input: RulePhaseIn, config?) => RulePhaseResult` | ONE evaluation pass — pure function of (state, book, observed, tick) | **no RNG** (input.rng untouched) |
| `firingCauseId` | `(ruleId, tick, mode) => CauseId` | stable cause mint `rule:<ruleId>:<tick>:<mode>` | deterministic |
| `ConsultResolution` `resolveConsultation` | `interface`; `(state, pendingId, approve, decidedAtUs) => ConsultResolution` | settle a consult band card (player clicked Approve/Deny) | tick-stamped |
| `DeferredConsultationResolution` | `interface { pendingId; ruleId; actions; target; raisedAtTick; decidedAtUs; approve }` | P3: the player's verdict recorded WHILE the kill switch stood — logged, pending consumed, intents held — then dispatched in arrival order on the first unfrozen run (`PolicyRuntimeState.deferredResolutions`) | deterministic: held rows replay in stored order |
| `parseKeyEntityStrict` | `(key: ObservedKey) => EntityId` | P1 strict inverse of the flat `entity::property` split — accepts ONLY exactly-one-separator keys, fails loud on zero/multi-separator (ambiguous until foundation adds key escaping; see docblock contract request) | total-throwing, pure |
| `FireLogChunk` | `interface { entries; count; previous }` | one immutable batch of journal rows (chunk = one run's entries), cons-linked | append-only |
| `FireLog` | `interface { newest; total; compactedCount }` | P4 THE LONG SAVE fire journal: O(1) cons-chunk append (the old flat-array spread was O(entries²)) | serialization walks oldest→newest — retained spans byte-identical to the pre-P4 flat journal |
| `emptyFireLog` | `() => FireLog` | `{newest: null, total: 0, compactedCount: 0}` | pure |
| `appendFireLog` | `(log, entries: readonly PolicyFireEntry[]) => FireLog` | O(1) chunk cons (empty entries returns same log) | order-pinned |
| `fireLogEntries` | `(log) => PolicyFireEntry[]` | journal view oldest→newest — the exact order `serializeFireLog` emits | order-pinned |
| `compactFireLog` | `(log, keepLast: number) => FireLog` | ring/compaction hook mirroring replay `keepLastSnapshots`: drops head rows but raises `compactedCount` — truncation is never silent | throws on non-safe-int/negative `keepLast`; no-op (same log) when `total <= keepLast` |
| `serializeFireLog` | `(source: readonly PolicyFireEntry[] \| FireLog) => string` | journal → wire (save/replay hook); accepts flat rows or the chunked log | order-pinned |
| `RuntimeStateSnapshot` `serializeState` `restoreState` | `interface`; `(state) => …`; `(snapshot, fireLog?: readonly PolicyFireEntry[] \| FireLog) => PolicyRuntimeState` | THE LONG SAVE hook pair for slot 12.5 (replay also rehydrates from these) | canonical order |
| `createRulePhaseStep` | `(getConfig?: () => PolicyEvaluationConfig) => { step: TickStep<RulePhaseIn, RulePhaseOut>; getState: () => PolicyRuntimeState; setState: (s) => void }` | adapter turning the pure interpreter into a swappable 12.5 slot; getState/setState are the checkpoint seam (mint INSIDE each SimRunner for purity — see gate-slice law) | stateful closure = per-run |
| `ConflictKind` | `"oscillation-cycle"\|"contradictory-actions"\|"order-shadowing"\|"resource-contention"` | the four proven pathologies (§B 2.4) | closed |
| `ConflictFinding` `ConflictOptions` | `interface` | finding + host-provided resolutions for detection | — |
| `compileRuleSets` | `(card: PolicyCard, opts?) => Omit<CompiledRule, "index">[]` | card → flat rule set | pure |
| `detectConflicts` | `(book: readonly PolicyCard[], opts?) => readonly ConflictFinding[]` | static analysis of the whole book (editor install gate) | order-pinned |
| `AlertSeverity` `ALERT_SEVERITIES` | `"sev-1"…"sev-4"`; `ReadonlySet` | page severity ladder | closed |
| `DestinationKind` `DESTINATION_KINDS` `AlertDestination` `RoutingEntry` `AlertRoutingTable` | unions/interfaces | where pages go (role/runbook/ticket-queue/log/console) | — |
| `RoutingError` | `class extends Error` | table validation throw | — |
| `destinationLabel` `validateRoutingTable` | `(…) => string / AlertRoutingTable` | display label; boundary validator | total-throwing |
| `severityFromPageValue` | `(value: Fixed \| null) => AlertSeverity` | page-value → severity bucket | pure |
| `AlertDispatch` `routeAlert` | `interface`; `(table, severity, atUs) => AlertDispatch` | resolve one dispatch (targets + cause) | tick-stamped |
| `MAX_ESCALATION_HOPS` | `16` | escalation chain cap | const |
| `projectEscalationChain` | `(table, severity) => readonly string[]` | "who gets paged next" preview | pinned order |
| `buildRoutingGraph` `findRoutingCycles` | `(table) => DirectedGraph / string[][]` | escalation-cycle proof | sorted |

---

## economy

Purpose: the step-12 economic settlement (§3.2/§4.4 C5 — "the ledger is SIM
STATE computed in-core; MySQL is the notary"). Double-entry six-bucket cash,
contract-as-tower lifecycle (MRC/escalators/MFN/renewal cliff §7.15),
invoicing + AR aging + deferred-revenue schedules, the dunning ladder, churn
with ghosted "fuse" forecasts, error budgets with exhaustion locks, runway /
death-spiral / lose-slowly guards, the THREE CANONICAL COMPANY DEATHS
(OD-25(a) owner-ratified: float-insolvency / covenant-default / churn-collapse,
warning→notice→dissolution at tick step 12.6 — economy/death.ts), and the
scorecard aggregation (**OD-1
RATIFIED 2026-10-09, ADR-0009 — `defaultScorecardConfig.active` resolves to
"commitment-convergence"**; `getActiveScorecard` still fails loud for configs
that explicitly pass `active: null`). Every money move REQUIRES a `CauseId` (P10 attribution structurally
mandatory). Import: `@hh/sim-core/economy`. ~40 config constants are marked
PROVISIONAL in `config.ts` pending the post-ratification tuning pass (the
OD-2 SHEET question itself settled 2026-10-09; value calibration did not).

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `MICRO_USD_PER_USD` `BPS_DEN` | `bigint` | unit constants (1e6 µ$; 1e4 bps) | const |
| `MoneyRatio` `ratioFromBps` | `interface { num; den }`; `(bps) => MoneyRatio` | exact rational money multiplier | pure |
| `usd` `micro` | `(bigint) => MoneyUnit` | $ / µ$ lifts | pure |
| `addMoney` `subMoney` `negateMoney` `sumMoney` | MoneyUnit algebra | exact ±Σ µ$ | pure |
| `isPositiveMoney` `isNegativeMoney` `isBigintMoney` | predicates (incl. unknown-narrowing) | boundary type guards | pure |
| `requirePositive` `requireNonNegative` | `(amount, context) => void` | fail-loud money gates (Law 4) | total-throwing |
| `scaleMoney` | `(amount, ratio, context) => MoneyUnit` | exact rational scaling, round-half-away | pure |
| `bpsOf` | `(amount, bps, context) => MoneyUnit` | bps slice of money | pure |
| `BUCKET_IDS` | `readonly BucketId[]` | the six buckets, canonical order | pinned |
| `isSpendableBucket` | `(bucket) => boolean` | only `free` spends | pure |
| `bucketBalance` `bankBalance` `netPosition` | `(cash, …) => MoneyUnit` | reads | pure |
| `assertBucketInvariants` | `(cash, context) => void` | no negative buckets, ever | total-throwing |
| `initialCash` | `(free) => MoneyBuckets` | money-in from nowhere (run start) | pure |
| `BucketDelta` `applyBucketDelta` | `interface`; `(cash, delta, context) => MoneyBuckets` | generic multi-bucket move, invariant-checked | pure |
| `spendFree` `transferBetween` `creditBucket` | `(cash, …, context) => MoneyBuckets` | the three everyday cash verbs | pure, fail loud |
| `Journal` `emptyJournal` | `interface`/const | append-only entry ledger (sim state) | seq monotonic |
| `EntryDraft` `PostedEntry` `postEntry` | `interface`s; `(journal, cash, draft) => PostedEntry` | THE money mutation: draft + cash ⇒ posted, cause-stamped, invariants asserted | cause REQUIRED (P10) |
| `entriesWithoutCause` | `(journal) => readonly LedgerEntry[]` | attribution audit probe | pure |
| `lastEntry` | `(journal) => LedgerEntry \| null` | tip read | pure |
| `JournalChunk` `JOURNAL_CHUNK_ROWS` | interface `{ rows; count; previous }`; `16` | sealed batch node of the journal spine (mirror of FireLogChunk's shape law) — O(1) amortized appends push into a shared bounded tail accumulator, zero row copies on the linear path; 16 bounds every fallback at a 16-element slice | value immutability kept (branched siblings bounded by their own `openCount`) |
| `journalFromEntries` | `(entries, nextSeq?) => Journal` | boundary constructor: re-chunk a plain row list (JSON round-trips, fixtures) into a spined journal; `nextSeq` defaults to `entries.length` | total-throwing on bad nextSeq |
| `draftEntry` | `(cash, draft, seq) => { cash; entry }` | THE shared validation core of `postEntry` AND the tick's batch lane: sanitize + apply-fuse + stamp the row without touching any journal — every guard, message and check ORDER lives here so both lanes fail identically | pure; cause REQUIRED (P10) |
| `appendJournal` | `(journal, rows: readonly LedgerEntry[]) => Journal` | batch lane: append an ordered run of already-`draftEntry`'d rows in ONE journal construction — a batched tick and a sequential `postEntry` tick are byte-identical in `entries`, `nextSeq` and every cash mirror at ~1/4 the cost | boundary-validated: seq-gap/minute throws; order pinned |
| `JournalCompaction` `compactJournal` `journalCompactedCount` | `{ journal; archived }`; `(journal, keepLast) => JournalCompaction`; `(journal) => number` | ring/compaction hook mirroring `compactFireLog`/`dropSupersededStates`: keep the LAST `keepLast` rows, dropped rows come back as `archived` (never silent) and count toward `journalCompactedCount`; `nextSeq` PRESERVED — the monotonic-seq law keeps the counter past the working set | pure, total-throwing on bad keepLast |
| `InvoiceState` `InvoiceTerms` `Invoice` | union/interfaces | issued/paid/failed/written-off lifecycle + terms | — |
| `daysPastDue` | `(invoice, atBusinessMin, cfg) => number` | dunning clock | business-minute only |
| `cyclePeriodMinutes` `invoiceDueAtMin` `cyclePeriodStart` | cycle math | calendar arithmetic through BusinessCalendarConfig | pure int |
| `cycleGross` `issueInvoice` | `(contract, econ, cycleIndex…, mfnDiscountBps, cfg) => …` | invoice mint incl. escalator + MFN discount | seeded-free, pure |
| `UnlockSchedule` `openRecognitionSchedule` `openReserveSchedule` `UnlockRelease` `nextUnlockAt` | deferred-revenue engine | straight-line recognition + parked reserves (§6.4) | pure int |
| `planRefund` | `(schedule, refundAmount) => { fromDeferred; fromFree }` | refund waterfall: unreleased first, cash after | pure, throws on negative |
| `ArAging` `arAgingTrays` | `(invoices, atBusinessMin, cfg) => ArAging` | 0-30/31-60/61-90/90+ trays + DSO approximation (midpoints PROVISIONAL) | pure |
| `SETTLEMENT_SCHEDULE_SUFFIXES` | `readonly [":reserve", ":recognition"]` | the settlement-schedule id law (Invoice.unlockScheduleId): a settle mints `invoice.id + suffix` for exactly these — a live schedule naming an invoice means money is still moving | closed |
| `liveScheduleInvoiceRefs` | `(schedules) => ReadonlySet<EntityId>` | invoice ids still owning a settlement schedule — one pass, keeps the prune sweep O(invoices + schedules) | pure |
| `isPrunableInvoice` | `(invoice, liveRefs) => boolean` | terminal-and-settled probe: written-off is terminal at transition; paid must carry its settlement minute; either way no live schedule may reference it | pure |
| `partitionPrunableInvoices` | `(invoices, schedules) => { keep; pruned }` | split the live list into survivors and prunable settled history, PRESERVING array order (order is digest- and save-visible content) | pure, order-pinned |
| `economyArAging` | alias of `arAgingTrays` | HUD per-frame convenience (tick.ts re-export) | — |
| `TuningSheet` | `"A" \| "B" \| "C"` union | sheet SELECTOR (clashes with waves' `TuningSheet` DATA type — root ships this as `EconomyTuningSheetId`; economy lane to rename) | type |
| `BusinessCalendarConfig` `TransactionFeeConfig` `BillingConfig` `DunningConfig` `ChurnConfig` `BudgetSpendAction` `ErrorBudgetConfig` `ContractEconomyConfig` `ArAgingConfig` `DeferredRevenueConfig` `RunwayConfig` `ReputationConfig` `DeathConfig` `EconomyConfig` | interfaces | the whole tuning surface — LIVE doc figures vs PROVISIONAL placeholders annotated per-field in config.ts (`ReputationConfig` §2.10/§5.10 deltas: fully PROVISIONAL; `DeathConfig` OD-25(a) thresholds: churnFloor 1 / churn 3d / float 3d / covenant grace 10d — ALL PROVISIONAL ratify-on-playtest) | — |
| `defaultEconomyConfig` | `() => EconomyConfig` | the shipped config (many fields explicitly `// PROVISIONAL`) | const-shaped |
| `minutesPerWeek` `minutesPerYear` `daysToMinutes` `secondsPerBusinessMonth` | calendar helpers through cfg | month = 43200 min LIVE; OD-2 flags month-length debate | pure |
| `SLA_CLAUSE_IDS` `SlaClauseId` `parseClauseRefs` | 13-clause table (§4.4 WS-4) | the commercial clause vocabulary | closed |
| `Escalator` `GrandfatherLock` `RevenueColourTags` | interfaces | annual bumps, legacy freezes, gold…red tags | — |
| `revenueBar` `bandFromBps` `bandFromTermMonths` | tag/edge → RevenueQualityBand | colour dial (edges PROVISIONAL) | pure |
| `ContractPhase` `ContractEconomy` `OpenContractInput` `openContractEconomy` | lifecycle + per-contract econ state | the economic twin of types.ts Contract | pure |
| `hasClause` `setPhase` `termYearsElapsed` `billedMrc` | clause/phase/MRC reads+updates | MRC incl. escalator compounding | pure |
| `renewalPulseOpenMin` `RenewalCliffOutcome` `RenewalDecision` `resolveRenewalCliff` `renewedContractGeometry` | renewal cliff (§6.4 90-day pulse) | renew/lapse/downsize settle | decision-in, pure-out |
| `MfnRepriceEvent` `queueMfnReprice` `dueMfnReprices` `markMfnFired` | MFN lag queue (§7.15) | most-favored-customer repricing delayed by level×month | pure schedule |
| `DunningStage` `DUNNING_STAGE_ORDER` | six-stage ladder union + order | failed→retry→reminder→warning→suspend→terminate | pinned |
| `assertDunningLadder` | `(cfg) => void` | ladder day-config sanity gate | total-throwing |
| `stageForDaysPastDue` | `(days, cfg) => DunningStage` | ladder position | pure |
| `DunningAdvance` `advanceDunning` | `(invoice, atBusinessMin, runSeed, cfg, engineBonusBps) => DunningAdvance` | one dunning step incl. seeded recovery rolls | seeded (invoice-due-keyed stream) |
| `ERROR_BUDGET_DOMAIN` `BUSINESS_MONTH_MINUTES` | consts | stream domain; 43 200 | const |
| `budgetSecondsFor` `budgetMinutesFixed` | `(commitmentBps, cfg) => bigint / Fixed` | seconds-per-month budget from SLA commitment | pure |
| `ErrorBudgetState` `initBudget` | interface; `(contractId, commitmentBps, monthIndex, atBusinessMin, cfg)` | per-contract budget bank | — |
| `weekIndexOf` `commitmentBpsOf` `remainingSec` `errorBudgetRemainingSec` | reads | week/month positions; `errorBudgetRemainingSec` is the tick.ts HUD alias | pure |
| `exhaustionLockActive` `RiskyActionLockedError` | `(state) => boolean`; error class | budget hit ⇒ risky actions locked (§6.1) | pure |
| `spend` | `(state, action: BudgetSpendAction, seconds, cfg, causeId) => ErrorBudgetState` | deliberate mitigation spend (costs PROVISIONAL per action) | cause-stamped |
| `drainOutage` | `(state, seconds, causeId) => ErrorBudgetState` | outage drain | pure |
| `WeekRollResult` `rollWeek` `MonthRollResult` `rollMonth` `slaCreditOwedSec` | calendar rolls | clean-week refund, carry cap, SLA credit owed | pure int |
| `WeekRefund` | `interface { closedWeekIndex; seconds: bigint; causeId }` | E-9: one granted clean-week refund, anchored to the week it pays for — emitted by `rollWeek` (`refunds: readonly WeekRefund[]` in `WeekRollResult`), one per closed week and only when the whole window had zero consumption (§6.1) | causeId pins the CLOSED week index so catch-up-loop grants stay individually attributable and replay-stable |
| `CHURN_DOMAIN` `CHURN_SIGNAL_DOMAIN` | stream domain consts | — | const |
| `ChurnRoll` | `"retained" \| "churned"` | the verdict | closed |
| `effectiveMonthlyChurnBps` | `(bundleId, contractId, forecasts, atBusinessMin, cfg) => bigint` | term-retention base + ghosted-fuse add-on | pure |
| `churnRoll` | `(contractId, effectiveBps, businessMonthIndex, runSeed) => ChurnRoll` | THE monthly churn draw — same month replays same verdict | seeded, month-keyed |
| `paymentFailureRoll` | `(invoiceDueAtMin, contractId, runSeed, cfg) => boolean` | invoice payment success roll | seeded |
| `GhostedForecast` `addChurnSignal` `forecastChurnBpsAt` `defuseForecasts` `pruneForecasts` `ghostedForecastTable` | the ghosted-fuse model (§7.15) | unanswered escalations light fuses; save-the-account defuses | deterministic decay |
| `AXIS` | const record of axis ids | the five score axes | — |
| `ScoreAxisId` `ScoreWeights` `ScorecardCandidate` `SCORECARD_CANDIDATES` | types + 3 authored cards (uptime-first A / conversion-first B / convergent C) | the OD-1 candidates — **C ("commitment-convergence") ACTIVE per the 2026-10-09 ratification** (`24dfcfe`); all three sets still ride side-by-side as G5's both-fork comparison data; weights remain doc-figure mirrors | const |
| `ScorecardConfig` `defaultScorecardConfig` | interface + default `active: "commitment-convergence"` | **OD-1 ratified (ADR-0009 rec #1)** — the default resolves; explicit `active: null` remains the fail-loud opt-out | fail-fast on null |
| `getActiveScorecard` | `(config) => ScorecardCandidate` | resolve the chosen card — throws ONLY for configs explicitly passing `active: null` | total-throwing |
| `FIFTH_AXIS_POINTS` `applyFifthAxis` | `20`; `(base, fifthAxisId, fifthPoints?) => ScoreWeights` | the promised fifth axis grafted on | pure |
| `compositeScore` | `(weights, axisScores: ReadonlyMap<ScoreAxisId, Fixed>) => Fixed` | weighted Σ | pure Fixed |
| `Grade` `GRADE_BANDS_BPS` `gradeFor` | S…F bands ≥9200/8200/7000/5800/4500 bps | the end-of-run letter | pure |
| `RunwayTone` `runwayMonths` `runwayTone` | months of free cash / tone dial | burn math on MoneyUnits | Fixed ratio |
| `RunwayMetrics` `DeathSpiralState` `initialDeathSpiralState` `observeRunway` | spiral streaks (§6.13, PROVISIONAL streak lengths) | borrow-under-runway streak detector | pure state chain |
| `Covenant` `covenantBreaches` | lender covenants vs readout bps | debt covenant trip list — LIVE consumer: the month roll in `runEconomyTick` (audit g19 #2); a metric with no readout throws fail-loud | pure |
| `COVENANT_METRIC_RUNWAY_MONTHS_BPS` `COVENANT_METRIC_ERROR_BUDGET_HEALTH_BPS` | `"runwayMonthsBps"` / `"errorBudgetHealthBps"` | the two canonical readout metrics a bank card may name (bps OF MONTHS for runway: "min 6 months" ⇒ floorBps 60_000n) | const |
| `COVENANT_UNBOUNDED_RUNWAY_BPS` `COVENANT_FULL_HEALTH_BPS` | `1_000_000_000_000n` / `10_000n` | not-burning reads comfortably MET; no-commitments fleet reads fully healthy | const |
| `errorBudgetHealthBps` | `(remainingSec, budgetSec) => bigint` | one contract's remaining grant as bps (overrun clamps to 0 — "nothing left", not negative theatre) | pure |
| `buildCovenantReadoutsBps` | `(spiralRunwayMonths: Fixed \| null, budgetHealthBps: readonly bigint[]) => Map<string, bigint>` | the sanctioned readout assembler beside the evaluator (Law 2: the evaluator never invents values); fleet health = min | pure |
| `CovenantBreachRecord` | `{ covenantId; atBusinessMin; monthIndex; causeId }` | one latched breach — appended to `EconomyState.covenantBreachLog`, notice `covenant-breached`; OD-25(a) since 2026-10-10: the breach fold itself stays record + notice ONLY — death arms only via the 12.6 covenant-default lane once the cure grace lapses on a STILL-latched covenant | edge-triggered per roll (recovery clears the latch) |
| `REPUTATION_BPS_SCALE` `REPUTATION_INITIAL_BPS` `REPUTATION_ENTITY` `REPUTATION_PROPERTY` | `10_000n` / `5_000n` / `company` / `"reputation"` | the `company::reputation` observed cell's address + neutral open (§2.10 "scored not judged"; open PROVISIONAL) | const |
| `ReputationLedger` | `{ overallBps: 0..10_000; honestHostFloor; lifetimeEvents }` | the score's authoritative integer-bps home inside `EconomyState` (Fixed only at the observed boundary) | exact int fold |
| `ReputationSignalKind` `ReputationSignal` | closed 6-kind union + `{ kind; causeId; contractId? }` | what moves the score: written-off / voluntary-churn / dunning-recovered / chargeback / major-incident / honest-postmortem | closed |
| `initialReputationLedger` | `(initialBps = REPUTATION_INITIAL_BPS) => ReputationLedger` | guarded ctor — out-of-range seeds throw | total-throwing |
| `reputationDeltaBps` | `(kind, cfg) => bigint` | one config-cited delta per kind (exhaustive switch — an unmapped kind cannot exist) | pure |
| `applyReputationSignals` | `(ledger, signals, cfg) => ReputationLedger` | ordered fold; EMPTY signals return the ledger BY IDENTITY (the zero-publish pin); §5.10 honestHostFloor halves only major-incident damage, permanently; clamped to [0, 10_000] | pure, replay-stable |
| `reputationFixed` | `(ledger) => Fixed` | bps→0..1 boundary parse (`fromRatio(bps, 10_000)`) | pure |
| `reputationObservedWrite` | `(ledger, causeId?) => ObservedWrite` | the house exactCell write for `company::reputation` — what chrome's HUD_PERMANENT_METRICS read forever showed '?' for want of (audit g17 #2) | frozen |
| `VendorCommitment` | `{ id; monthlyMicroUsd; termEndMin }` | one take-or-pay promise behind `committedOut` (§6.12, audit g15 #2) — the host re-declares the whole book per tick; bucket = Σ monthly × whole months left (ceiling), so it burns down by itself; parse-boundary throws | declarative, zero input ⇒ zero writes |
| `CompanyDeathCause` `COMPANY_DEATH_CAUSES` `DeathPhase` | `"float-insolvency" \| "covenant-default" \| "churn-collapse"` + frozen array + `"live" \| "notice" \| "dissolved"` | the THREE CANONICAL DEATHS (OD-25(a) owner-ratified 2026-10-09b, §6.10; economy/death.ts, folded at tick step 12.6) — canonical array order is also the fold priority when several arm on one tick | const |
| `RefusedSettlement` | `{ contractId; amountMicroUsd }` | one host-forwarded settlement that could NOT be paid out of free cash (`EconomyTickIn.refusedSettlements`) — the evidentiary stream of the float-insolvency death; the witness lane for the class unattended/fastForward today handles by catch-and-void (that file untouched) | boundary-validated, garbage throws `economy/death:` |
| `FloatInsolvencyEvidence` `CovenantDefaultEvidence` `ChurnCollapseEvidence` `DeathEvidence` | per-cause snapshots | evidence embedded in both records: float `{freeCash, refusedSettles, refusedMicroUsd, watchSinceBusinessMin, sustainedBusinessMin}`; covenant `{covenantId, breachCauseId, breachAtBusinessMin, graceBusinessMin}`; churn `{activeCustomers, churnFloor, watchSinceBusinessMin, sustainedBusinessMin}` | pure |
| `DeathWarningRecord` `CompanyDeathRecord` | DEATH NOTICE + DISSOLVED records | the `EconomyState.deathWarning` / `EconomyState.companyDeath` values; the terminal record's `warnedAtBusinessMin` is the §9.6 "Lose slowly" ordering PROOF (strictly before `atBusinessMinute`); evidence re-snapshots FRESH at the dissolve fold | value types |
| `DeathWatch` `emptyDeathWatch` `isIdleDeathWatch` | spell counters | float zero-cash spell (refusal counters reset at spell break — a bad day is not a death) + churn below-floor spell; the covenant lane needs no watch (its clock is the breach record) | state key ABSENT while idle ⇒ existing hosts serialize byte-identically |
| `DeathFoldSample` `advanceDeathWatch` | `(watch, {now, freeCash, activeCustomers, refusedSettlements}, cfg) => DeathWatch` | the one pure spell advance per fold: continue/start on the offending reading, wipe on recovery | pure |
| `CovenantBreachLike` `DeathEvidenceInput` | structural reader types | the covenant gate never imports the runway breach-record shape (leaf law); the ordered input bag of `deathEvidenceFor` | — |
| `floatInsolvencyEvidence` `covenantDefaultEvidence` `churnCollapseEvidence` `deathEvidenceFor` | gated evidence builders | each returns null until trigger AND sustained threshold hold (float: free==0 ∧ ≥1 refusal ∧ floatInsolvencySustainedDays; covenant: EARLIEST still-latched breach surviving covenantCureGraceDays, log-order independent — a recovered covenant's old row can never arm; churn: active < churnFloor sustained churnCollapseSustainedDays); `deathEvidenceFor` = first armed in canonical order, never two stories on one fold | pure |
| `deathPhaseOf` | `(stateLike) => DeathPhase` | the phase read for the endings/HUD projection lane | pure |
| `LoseSlowlyVerdict` `businessMinutesForReal` `meetsLoseSlowlyGuard` | warn-before-death guard | death must be foreshadowed in business time (scale = BUSINESS_SCALE_DEFAULT → OD-2) | pure |
| `isBeyondRunway` | `(months: Fixed \| null, wholeMonths) => boolean` | dead-line probe | pure |
| `EconomyState` `emptyEconomyState` | interface + ctor | all per-contract econ twins, budgets, invoices, schedules, queues; + the three OPTIONAL OD-25(a) death fields `deathWatch?` / `deathWarning?` / `companyDeath?` — keys ABSENT while idle, so `emptyEconomyState()` and every existing host's serialization never change | map order sorted |
| `businessMinuteOf` `monthIndexOf` | clock lifts | business-minute index | pure |
| `NEUTRAL_REVENUE_TAGS` | const | untagged revenue | const |
| `RegisterContractInput` `registerContractEconomy` | `(state, input, cfg) => EconomyState` | prime a contract (MUST before first tick; auto-priming guard exists) | pure |
| `registerContractsEconomy` | `(state, inputs, cfg) => EconomyState` | batch prime — BYTE-IDENTICAL to chained `registerContractEconomy` over the same sequence (atomic validate-then-merge; dup ids throw the single path's error; empty batch returns `state` by identity) | O(n + m log m) setup |
| `pulseOpenMinFor` `defaultTermsFor` | `(termEndMin, cfg) => SimMinute`; `(contract, cfg) => InvoiceTerms` | renewal pulse open minute (90-day cliff window) / default net terms (PROVISIONAL 30d) | pure |
| `sortedById` `sortedEntityIds` | map/id sort utilities | the sorted-insertion idiom every lane shares | pinned |
| `SpendRequest` `MfnTrigger` `RenewalDecisionInput` `EconomyTickIn` | interfaces | the settlement input bag (contracts map + prior + cfg + optional outage/spend/cliff/MFN/signal inputs); `EconomyTickIn.pruneSettledInvoices?: boolean` is the step-13 retention opt-in — DEFAULT OFF (unset/false never touches the working set; g5's digestQuarter reads the un-pruned shape); dead-ledger inputs LIVE (2026-10-09 fix-economy): `chargebacks?: EntityId[]` (posts the §6.13 fee from free + docks reputation — consumes `fees.chargebackFeeMicroUsd`), `majorIncidents?: CauseId[]` / `honestPostmortems?: CauseId[]` (reputation-only signals the economy cannot see), `covenants?: Covenant[]` (whole-book REPLACE; state-carried when absent), `vendorCommits?: VendorCommitment[]` (whole-book REPLACE drives `committedOut`), `refusedSettlements?: RefusedSettlement[]` (OD-25(a) 2026-10-10: host-forwarded float-insolvency witness feeding the 12.6 death fold) | every new input UNSET ⇒ zero writes (byte-identity for existing hosts) |
| `EconomyNoticeKind` `EconomyNotice` | 27-kind union + interface | human-readable settlement notices (HUD toast fodder); +`contract-activated` / `covenant-breached` / `chargeback-posted` (fix-economy 2026-10-09); +`death-imminent` (DEATH NOTICE, §9.6 visible warning, `contractId: "company"`) / `company-dissolved` (terminal, ledger closed) — OD-25(a) 2026-10-10 | deterministic |
| `EconomyTickOut` | `interface { state; entries; events; notices; observedWrites }` | the settlement answer — caller mirrors cash/seq into GameState AND feeds `observedWrites` into the ObservedStore (batch-D host adoption: fastForward/g5/runner pass-through; the list is EMPTY unless the reputation score moved — publish-on-change) | seq order |
| `runEconomyTick` | `(input: EconomyTickIn) => EconomyTickOut` | THE slot-12 settlement: committedOut mirror (0.5) → auto-prime → backlog sign-post + pending→active (1.5) → month rolls (incl. covenant bank review before the budget re-grant) → MFN → pulses → cliffs (lapse unwinds backlog) → billing (invoice issue MOVES backlog→AR) → dunning (write-off unwinds) → chargeback fees (8.5) → budgets → fuses → unlocks → lose-slowly → reputation fold + publish-on-change (12.5) → company-death fold (12.6, OD-25(a): watch advance → evidence gate → LIVE→DEATH NOTICE→DISSOLVED; a prior with `companyDeath` set short-circuits the WHOLE tick to a clean no-op-preserve — same state identity, zero entries/notices/events/observedWrites, no throw) → step-13 opt-in settled-invoice prune when `pruneSettledInvoices === true`, contracts in EntityId-sorted order | seeded draws keyed (seed, domain, business-min, contractId); no floats, no wall clock, ×100-stable |
| `pruneResolvedInvoices` | `(state: EconomyState) => { state; pruned }` | standalone LONG-SAVE retention pass for hosts holding a finished EconomyState — identical predicate to the tick's opt-in step 13: settled-and-fully-resolved invoices leave the working set, survivors keep relative order, journal and every cash bucket untouched (money truth lives in the cause-stamped ledger; dropped records returned for caller archiving) | pure |

---

## topology

Purpose: the Board — "graph-is-map" (§4.2, WS-2 R1–R25). One node registry,
four typed edge relations (`data` drawn dependencies = the attack surface,
`power` assigned tree, `control` admin paint, `trust` derived from grants),
the physical co-location embedding (facilities → rooms → racks → placements,
adjacency latency, thermal coupling), polymorphic link objects (technical +
commercial with policy beads), failure domains (PDU/rack/switch/template),
redundancy correlation assessment (power/path/software/human/time), socket
plug-compatibility for drag-a-cable, and blast radius — ONE flood algorithm
meeting the two layers. The TWO-LAYER LAW: graph files = what CAN happen;
physical/domains = what happens TOGETHER; `blast.ts` is where they meet.
Import: `@hh/sim-core/topology`.

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `EdgeId` `EdgeKind` `EDGE_KINDS` | `= EntityId`; `"data"\|"power"\|"control"\|"trust"` + array | the four relations | closed |
| `TopoNode` `NodeDraft` | interfaces | versioned node (id, kind, tags) / input shape | version counter per mutation |
| `Edge` `EdgeDraft` | discriminated unions per kind | typed edges (data carries dependency semantics; trust is DERIVED-only) | — |
| `TopologyGraph` | interface (opaque-ish record of maps) | the whole Board state — every mutation bumps one `version` | all iterations sorted |
| `compareIds` `sortedIds` | `(a,b) => -1\|0\|1`; `(iterable) => readonly EntityId[]` | the code-unit sort idiom | locale-free |
| `createGraph` | `() => TopologyGraph` | empty board | pure |
| `PowerFeed` `powerFeeds` `feedAncestorOfKind` | interface; `(graph, device) => readonly PowerFeed[]`; `(graph, device, kind) => readonly EntityId[]` | the power tree walk — each chain starts at the device's DIRECT supplier and climbs to a root (outlet→PDU→room→facility, T-b pin); ancestry by ancestor kind reads that chain head-first | pinned |
| `dataAncestors` `dataDescendants` | `(graph, id) => readonly EntityId[]` | dependency flood rails (what CAN cascade) | BFS sorted |
| `controlAncestors` `governedBy` `powerConsumers` `governorsOf` | `(graph, …) => readonly EntityId[]` | control-domain and power-direction reads | sorted |
| `TrustGrant` `paintTrust` `isTrustedTo` `trustAnchors` | interface; `(graph, grants) => void`; `(graph, principal, target) => boolean`; `(graph, id) => readonly EntityId[]` | trust is regenerated wholesale from grants — never hand-painted | sorted regeneration |
| `FacilityDraft` `FacilityRecord` `RackDraft` `RackRecord` `PlacementDraft` `PlacementRecord` `CircuitDraft` | interfaces | physical embedding: facility (MW budget) → room → rack (kW/U) → placement; shared circuits | — |
| `AdjacencyClass` | enum | same-slot/same-rack/same-row/same-room/same-circuit/same-facility/remote tiers | ordinal |
| `AdjacencyLatencyRow` `ADJACENCY_LATENCY_TABLE` `adjacencyTypicalUs` | table + `(adjacency) => SimTimeUs` | one generated latency truth-table (shared constants law) | const |
| `PowerBudget` `derate80` | interface; `(ratedMw: bigint) => bigint` | NEC 80 % derate arithmetic | pure bigint |
| `FloorLoadVerdict` `ThermalNeighbor` `thermalCouplingFixed` | interfaces; `(distance) => Fixed` | floor-load + heat coupling reads | pure |
| `classifyPlacement` | `(a, b, rackOf, facilityOf) => AdjacencyClass` | where two placements sit on the adjacency ladder | pure |
| `PhysicalIndex` `createPhysicalIndex` | interface + ctor | rack/facility lookup index fed to blast/domains | sorted keys |
| `DomainKind` `DeathModel` `FailureDomain` | `"pdu"\|"rack"\|"switch"\|"template"`; `"kill-all"\|"degrade-all"`; interface | what fails together (§4.2 hyperedges); **T-9 two-color law RATIFIED 2026-10-09 (`8a5f413`): power-domain events KILL (red), rack/switch domains DEGRADE (amber), and `members` always includes the anchor** | closed |
| `domainId` | `(kind, anchor) => EntityId` | stable domain identity | pure |
| `pduDomains` `rackDomains` `switchDomains` `templateDomains` `buildDomainSet` `DomainSet` | `(graph, [index]) => readonly FailureDomain[]` / set | the four materializers + aggregate set | sorted enumeration |
| `projectionVersion` | `(graph: TopologyGraph, index: PhysicalIndex) => string` | T-1 dual-version stamp of the joint graph+index projection — the exact pair key `` `${graph.version}:${index.version}` `` (T-a: the old `× 1_000_003` fold collided at index.version ≥ 1_000_003, e.g. (1, 1000003) ≡ (2, 0)): any cache over a graph+index view (blast radius!) MUST key on THIS, never `graph.version` alone, or a placement with an untouched graph serves a stale result | pure; injective over both version counters |
| `BlastRadius` `PersonBlast` `BlastComputer` | interfaces | the ONE flood answer: affected (dead) / degraded (amber) sets; person variant; reusable computer bound to graph+index | `computeBlast(graph, domains, anchor)` — deterministic BFS+union |
| `computeBlast` | `(graph: TopologyGraph, domains: DomainSet, anchor: EntityId) => BlastRadius` | flood rides DATA edges, geography never gates it; kill-all domains whose anchor died explode wholly; degrade-all domains NEVER explode — the anchor dies, co-residents shade degraded/amber (T-9 ratified) | pinned order |
| `computePersonBlast` | `(graph, person) => PersonBlast` | runbook/credential holder reach | pinned |
| `createBlastComputer` | `(graph, index) => BlastComputer` | pre-indexed repeated queries (hover UI) | pure results |
| `POLICY_BEADS` `PolicyBead` `isPolicyBead` | 8 beads (tls/rateLimit/breaker/timeout/pool/retry/firewall/egress) | the bead-on-a-wire vocabulary | closed |
| `LinkDraft` `LinkRecord` `parseLink` | interfaces; `(draft) => LinkRecord` | polymorphic LinkObject (technical + commercial clauses) parsed at boundary | total-throwing |
| `SpeedFinding` `negotiateDown` | `(link) => SpeedFinding \| null` | speed-mismatch renegotiation probe | pure |
| `TimeoutViolation` `findTimeoutViolations` | `(graph, links) => readonly TimeoutViolation[]` | per-hop budget-clamp contradictions | sorted |
| `LinkRegistry` `createLinkRegistry` | interface + ctor | link store keyed by id | sorted |
| `CORRELATION_TYPES` `CorrelationType` | power/path/software/human/time | the redundancy-correlation vocab (§4.2 "two redundant, one circuit") | closed |
| `ReplicasDraft` `CorrelationHit` `RedundancyVerdict` | interfaces | candidate replica sets and the verdict | — |
| `findCorrelations` | `(graph, draft) => readonly CorrelationHit[]` | shared fate detection | sorted |
| `maxIndependentSet` | `(members, collided) => readonly EntityId[]` | largest genuinely-independent survivor set | deterministic greedy, sorted |
| `assessRedundancy` | `(graph, draft) => RedundancyVerdict` | the lie-detector for "HA" claims | pure |
| `RoutingContract` `LegalityVerdict` `EdgeRef` | interfaces; `= EntityId` | commercial routing locks as graph-side legality | — |
| `linkIsLegalFor` `pathLegality` `illegalHops` | `(contract, link/path) => LegalityVerdict / { legal; verdicts } / readonly LegalityVerdict[]` | clause-gated hop legality (step-4 consults these) | pure |
| `SOCKET_PROTOCOLS` `SocketProtocol` `SocketDirection` | http/sql/ssh/dns/smtp/ntp/tcp/rdma; `"in"\|"out"` | the drag-a-cable plug vocabulary | closed |
| `Socket` `parseSocket` `socketName` `mirror` | `{protocol,direction}`; `(name) => Socket`; `(socket) => string`; `(name) => string` | plug naming `http:in` ↔ mirror | total-throwing |
| `socketsFit` `socketCompatibility` `refusalReason` | `(needs, provides) => boolean / ReadonlyMap / string \| null` | connection fit + human-readable refusal | pure |
| `SocketEndpoints` `canConnect` | interface; `(consumer, provider) => boolean` | two-sided socket check | pure |
| `validateConnections` | `(edges, endpoints) => readonly { from; to; reason }[]` | whole-board plug audit | sorted |

---

## waves

Purpose: everything that decides WHEN trouble arrives (hg §1.7 telegraph-band
law, §2.24 deck legality, §4.1/§4.8, G2 gate). Diurnal baseline + authored
event envelopes (ramp/plateau/decay) composed to per-wave arrival plans; the
pressure law `P(n) = 100 × growth^n × sawtooth(n)` in micro-units; the
attack-surface LEDGER ("threats are unspawnable until you build their
invitation", retirement-with-lag, mastery→weather demotion); the difficulty
DIRECTOR (trough-depth/entropy draws ONLY, never mid-incident, never touching
telegraphed composition — draws replay-logged); the authoring-CI ENFORCER
(eight named violation codes) and official-content inspector. Sheet **B is
canonical and ACTIVE** (`ACTIVE_TUNING_SHEET = "B"`, OD-2 ratified 2026-10-09,
`24dfcfe`; A/C carry honest `status:"PROVISIONAL"` for their future-derivation
rows — landlord convention / realism toggle). Import: `@hh/sim-core/waves`.

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `TelegraphBand` `TELEGRAPH_BANDS` `isTelegraphBand` `telegraphVisible` | `"weather"\|"storm"\|"hunter"\|"entropy"` + guards | the four telegraph bands; entropy band visible only with forecast purchased (§1.7) | closed/pure |
| `DiurnalCurvePoint` `DiurnalCurveTable` `parseDiurnalCurve` `sampleCurveMicro` `FLAT_BASELINE` | interfaces; `(raw) => table`; `(curve, atUs) => bigint` | human-traffic daily curve, micro-rate samples | pure int |
| `EventEnvelope` `EnvelopePhase` `EnvelopeCompositionEntry` `EnvelopeState` | interfaces/union | authored spike/wave shape (pre/ramp/plateau/decay/post) | — |
| `envelopeEndUs` `envelopeLengthUs` `phaseAt` `minuteWeights` `phaseProgressNumber` | `(env, …) => SimTimeUs / EnvelopeState / readonly number[] / number` | envelope arithmetic + per-minute weight profile | pure |
| `drawPlacementMinute` | `(rng: { range(n: number): number }, windowMinutes, envelopeMinutes) => number` | where inside the window the wave lands | seeded (injected rng) |
| `toWaveEnvelope` | `(env, opts: { role; unitsTotal; dominantFamily; entropyForecastPurchased; atUs }) => WaveEnvelope` | bridge from authored envelope to the types.ts arrival contract | pure |
| `THREAT_ROLES` `ThreatRole` | 12 roles swarm…boss | the role vocabulary (§2.24 quotas) | closed |
| `DAMAGE_DENOMINATIONS` `DamageDenomination` | bandwidth/concurrency/hands/cash/reputation/data-integrity | the six damage currencies | closed |
| `CompositionEntry` `WaveDefinition` `WaveTable` `WaveRules` `WaveFeintRule` `parseWaveTable` | interfaces; `(raw) => WaveTable` | an authored wave table parsed fail-loud at the boundary; `WaveDefinition` carries optional `feint`/`secondIncident` flags (secondIncident also accepts a non-empty prose marker) and `WaveTable.rules?` the §2.24 closed-vocabulary knobs (feints, secondIncident multipliers >1, copycatReservePct band) — unknown rule keys throw | total-throwing |
| `WAVE_RULE_KEYS` | `["feints", "secondIncidentMultiplierDuringIncident", "secondIncidentMultiplierDuringRecovery", "copycatReservePct"] as const` | the CLOSED §2.24 engine vocabulary — the only rules keys `parseRules` accepts (the three dead-data families: feints, second-incident multipliers, copycat reserve); exported so the foreign adapter projects onto EXACTLY this set — one source of truth for "what the engine consumes" (structural authoring gates stay content-CI-side) | closed tuple |
| `ForeignThreatMeta` `ForeignWaveSliceOptions` | `interface { family: ThreatFamily; denomination: DamageDenomination }`; `interface { typeBundleId; geometry: { windowMinutes; rampMin; plateauMin; decayMin }; threatMeta: (threatId) => ForeignThreatMeta \| undefined; tuningSheet?; unitsPerPressurePoint? }` | what the shipped `packages/content/waves/` slices do NOT carry themselves: per-threat registry metadata (a `threatMeta` lookup miss fails the parse loudly) and the envelope geometry (the slices author existence, not shape); `tuningSheet` defaults "B", `unitsPerPressurePoint` defaults 1 | data-in |
| `projectForeignRules` `parseForeignWaveSlice` | `(rawRules: unknown, where: string) => WaveRules \| undefined`; `(raw: unknown, options: ForeignWaveSliceOptions) => WaveTable` | THE canonical foreign-slice → engine adapter (audit REST-RULES-ADAPTER, §2.24): entries `threat`/`role`/`pressurePct` → engine fields with the `THREAT_ROLES` head lower-cased as role, `trough` → inverted `hard`, per-wave `feint`/`secondIncident` markers CARRIED (every old hand-rolled copy dropped them plus the `rules` block — structurally disabling the @4856a42 rules consumers on shipped content); `projectForeignRules` keeps only `WAVE_RULE_KEYS`, content-CI-only keys dropped; dead-neutral contract: a rules-free slice yields `rules: undefined` (NOT `{}`) so presence-gated plans stay byte-identical (falsified in `__tests__/foreign.test.ts`); `parseWaveTable` stays the single parse authority — a malformed projection throws at the boundary | pure; total-throwing |
| `OversellPressure` `OVERSELL_RATIO_MAX_MICRO` `contentionProbabilityMicro` `fifthRootNearest` | `{ratioMicro, homogeneityMicro: bigint}`; `30_000_000n`; `(pressure) => 0…1_000_000n`; `(n: bigint) => bigint` | §4.8 oversell contention curve P(contention) = ((r−1)/29)^2.2 × homogeneity in bigint micro-units; ratio ≤ 1.0 ⇒ EXACTLY 0n (digest-neutral default); detents 5:1≈1.3% 12:1≈11.9% 20:1≈39.4%; `fifthRootNearest` is the exact-Newton bigint 5th root the fractional exponent rides | pure; RangeError on negative/non-bigint ratio |
| `THREAT_FAMILIES` `FamilyShare` `parseFamilyWeightsTable` | frozen `[customerAsThreat, entropic, human, malicious, systemic]`; `{family, shareMicro: bigint}`; `(weights, sourcePath?) => readonly FamilyShare[]` | the five-family closed set and the loader-side parser for a type bundle's `threats.familyWeights` — all five keys must be non-null, sum within ±1% of 1.0, renormalised to EXACTLY 1_000_000 micro by largest remainder, code-unit sorted for deterministic cumulative rolls (feeds the pipeline's `familyMix` arrival config) | pure; throws naming the offending key |
| `PRESSURE_MICRO` `TuningSheetId` `PressureParams` `TuningSheet` | `1_000_000n`; `"A"\|"B"\|"C"`; interfaces | pressure-law units; the sheet DATA shape (root ships waves' `TuningSheet`) | — |
| `mulDivRound` | `(numerator: bigint, denominator: bigint) => bigint` | round-half-up exact bigint division (positive denominators) — the module convention for EVERY bigint ratio in waves/ (truncating `/` biased late-game budgets low) | pure; throws on non-positive denominator |
| `parPressureMicro` | `(params, n: number) => bigint` | P(n) = 100 pts × growth^n × sawtooth(n), micro-bigint domain (never through Fixed — ±32768 overflow) | pure bigint |
| `TUNING_SHEETS` `ACTIVE_TUNING_SHEET` `resolveActiveSheet` | record A/B/C (B `status:"RATIFIED"`, A/C `"PROVISIONAL"`); `TuningSheetId \| null = "B"`; `() => TuningSheet` | the OD-2 knob — RATIFIED 2026-10-09, resolves sheet B; the null-guard throw stays armed as a hand-null protection (fail-loud law) | fail-fast guard, now-resolving |
| `BuildOp` `LedgerConfig` `DEFAULT_LEDGER_CONFIG` `ThreatInvitations` `LedgerSnapshot` | interfaces/const | append-only build log → spawnable-at-tick snapshot; retirement lag + mastery thresholds | asOfTick determinism |
| `buildInvitations` | `(unlockedByBuildables: Record<string, readonly string[]>) => ThreatInvitations` | invert the buildables' `unlocksThreats` map | sorted |
| `ledgerSnapshot` | `(ops, asOfTick, cfg?) => LedgerSnapshot` | replay the build log to a tick | pinned order |
| `isThreatSpawnable` `spawnableThreatIds` | `(threatId/all, snapshot, invitations) => boolean / readonly string[]` | G2 gate answer: built-your-invitation? | pure |
| `bandAfterMastery` | `(threatId, authoredBand, masteryCounts, cfg?) => TelegraphBand` | countered ≥N ⇒ demote to WEATHER (visible, never deleted) | pure |
| `GatedComposition` `gateComposition` | interface; `(entries, snapshot, invitations) => GatedComposition` | filter a wave's entries down to spawnable set (deterministic, not RNG) | sorted |
| `DIRECTOR_RNG_DOMAIN` | `"director"` | the logged-draw stream domain | const |
| `DirectorState` `INITIAL_DIRECTOR_STATE` | interface + const | sawtooth history + entropy budget state | — |
| `DirectorConfig` `DEFAULT_DIRECTOR_CONFIG` | interface + const | nudge bounds (trough depth, entropy unit budget) | — |
| `DirectorRefusal` `DirectorOutcome` | `"incident-active" \| null`; `interface { next; draw?; refusal }` | the two forbidden moments: never mid-incident, never composition | — |
| `directorPropose` | `(state, atTick, rng, cfg?) => DirectorOutcome` | the ONLY director power: deepen troughs / spend entropy — result's `draw` is replay-logged | seeded, subject sawtooth-trough-depth\|entropy-budget |
| `setIncidentActive` | `(state, active) => DirectorState` | incident gate (draws blocked while true) | pure |
| `SAWTOOTH_FLOOR_MICRO` `applyTroughDepthFactor` `applyEntropyBudgetFactor` | `1_000_000n`; `(sawtoothMicro, factor) => readonly bigint[]`; `(unitCount, factor) => number` | the arithmetic of a nudge | pure |
| `VIOLATION_CODES` `ViolationCode` | 8 codes (MAX_THREAT_ENTRIES_EXCEEDED…DENOMINATION_QUOTA_PER_LEVEL_EXCEEDED) | authoring-CI gate names | closed |
| `WaveViolation` `AUTHORING_LAWS` | interface + law texts | finding + the quoted law it breaks | — |
| `enforceWaveTable` | `(table: WaveTable) => readonly WaveViolation[]` | run all eight laws over a table (quota, ≤40 % first wave, trough depth, new role every 4th, two-front ≤2 denominations…) | pure |
| `ContentInspectionFinding` `inspectOfficialWaveJson` | interface; `(raw: unknown) => readonly ContentInspectionFinding[]` | read-only audit of shipped packages/content wave JSON | pure |
| `PlannedArrival` `WavePlan` `WavePlanInput` | interfaces | one wave fully pre-planned: startMinute, envelope, pressure budget, arrivals sorted by (atUs, threatId, unitOrdinal), withheld-by-ledger list, the `waveEnvelope` for slot 1 | deterministic replay order |
| `dominantFamilyOf` | `(entries) => ThreatFamily \| "organic"` | majority family for telegraph honesty | pure |
| `planWave` | `(table, waveN, input: WavePlanInput) => WavePlan` | compose baseline+table+ledger+director into this wave's plan | seeded via input.rng (`waveStream`) |
| `waveStream` | `(runSeed, waveN, simMinute) => RngStream` | the canonical per-wave stream key | seeded |

---

## replay

Purpose: the determinism substrate itself (§3.3 replay artifacts, §3.4 Node
port, §7.0 P0 ReplayLog/checkpoint-ring/state-hash-tripwire row). Canonical
serialization (code-unit sorted keys, exact-bigint, insertion-order
Maps/Sets, tagged-JSON + `HHC1` binary frames, one FNV-1a-64 + splitmix
avalanche digest), the `ReplayBundleDoc` codec (intent log, director draws,
dense checkpoint ring, optional snapshots, OPAQUE lineage passthrough),
verification with first-divergence bisection, state diffing, causality traces
with red-herring lanes, safe compaction, and the test harness that owns the
**×100 byte-identical replay gate**. Dependency law (hard): `../types` +
`../kernel` only — `SimRunner` is INJECTED structurally so this lane never
imports a sibling. Import: `@hh/sim-core/replay` (barrel is an explicit name
list — everything below is exactly what ships).

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `ReplayError` | `class extends Error` | every fail-loud in this lane | — |
| `requireDefined` `fail` | `<T>(v: T\|undefined, what) => T`; `(what) => never` | internal guards, public for host reuse | total-throwing |
| `compareCodeUnits` | `(a: string, b: string) => number` | THE string order (locale-free) | pinned |
| `JsonValue` | type | canonical-encodable JSON superset (bigint/Map/Set tagged) | — |
| `utf8Encode` `utf8Decode` | `(text) => number[]`; `(bytes, start, length) => string` | hand-rolled UTF-8 (no platform TextEncoder variance) | byte-exact |
| `encodeCanonicalBinary` `decodeCanonicalBinary` | `(value) => Uint8Array`; `(bytes) => unknown` | `HHC1` binary frame round-trip | order-pinned, bigint exact |
| `encodeCanonicalJson` `decodeCanonicalJson` | `(value) => string`; `(text) => unknown` | tagged-JSON variant (`$i/$u/$m/$s`, per-key `$`-escape) — cross-decodable with binary | order-pinned |
| `fnv1a64Hex` `fnv1a64Text` | `(bytes\|text) => HashHex` | double FNV-1a/64 core (Math.imul limbs; bigint oracle-tested) | byte-exact |
| `digestCanonicalValue` | `(value: unknown) => HashHex` | canonical binary → FNV + avalanche = THE 16-hex digest | ×100-stable |
| `MAX_CANONICAL_DEPTH` | `512` | parse-side nesting cap (both codec variants + the diff walk): replay files are UNTRUSTED input, and unbounded recursion turns a crafted 60 KB buffer into a RangeError stack-overflow — violating the "every rejection throws ReplayError" law; legit sim state nests in the tens | const |
| `REPLAY_SCHEMA_VERSION` | `1` | bundle doc version | const |
| `BundleExtras` | `Readonly<Record<string, unknown>>` | forward-compat unknown-key preservation | preserved through codec |
| `StampedIntent` | `interface { tick; intent; extras? }` | one clock-typed input (strict-increasing ticks enforced) | — |
| `SnapshotRecord` | `interface` | dense ring checkpoint + optional embedded state + encoding | hash-checked |
| `ReplayBundleDoc` | `interface` | the full artifact: runSeed, engineVersion, contentHashes, snapshotEveryTicks, intentLog, directorDraws, checkpoints, snapshots, OPAQUE lineage | — |
| `parseReplayBundleWire` `replayBundleDocToWire` | `(unknown) => doc`; `(doc) => Record` | boundary parse / wire project | total-throwing |
| `encodeReplayBundleJson` `encodeReplayBundleBinary` `decodeReplayBundleJson` `decodeReplayBundleBinary` `decodeReplayBundle` | codec quartet + auto-detect | save-file ↔ bytes | byte-exact |
| `toReplayBundle` | `(doc) => ReplayBundle` | project to the types.ts contract shape | pure |
| `stampIntents` | `(intents, tickOf) => StampedIntent[]` | attach ticks via host clock function | order-pinned |
| `DiffKind` `PathDiff` `DiffResult` `DiffOptions` `diffStates` | union/interfaces; `(expected, actual, opts?) => DiffResult` | path-wise state diff (changed / missing / extra) for bisection output | canonical key order |
| `SimRunnerRequest` | `interface { initialState; runSeed; targetTick; intentsUpToTick }` | what a runner gets | — |
| `SimRunner` | `type <S> (request: SimRunnerRequest<S>) => S` | **the injection contract**: any pure same-request⇒same-answer function replays, engine-agnostic | purity REQUIRED |
| `StateDigest` | `type <S> (state: S) => HashHex` | digest plug-in point | — |
| `canonicalDigest` | `StateDigest<unknown>` | default = digestCanonicalValue | — |
| `VerifyRequest` `SnapshotFailure` `VerifyResult` | interfaces | verify options + first-failure detail (bisection tick, diff) | — |
| `verifyReplay` | `<S>(request: VerifyRequest<S>) => VerifyResult` | re-sim every ring+snapshot hash point, stop at first divergence, bisect to `firstDivergentTick` | ×N identical by construction |
| `assertReplayVerifiable` | `<S>(request) => VerifyResult` | throw-on-failure wrapper (CI gate) | total-throwing |
| `CauseRecord` `causeRecordsFromEvents` | interface; `(events, parents?, summarize?) => CauseRecord[]` | parent-linked attribution spine from the event stream | event order |
| `CauseIndex` `buildCauseIndex` | interface; `(records) => CauseIndex` | indexed cause DAG — cycles/missing-parents fail loud | total-throwing |
| `CausalTrace` `traceContributingFactors` | interface; `(index, effectCauseId, options?) => CausalTrace` | root→effect factor chain + red-herring lanes (same-tick window, same-subject) | deterministic lanes |
| `oneSentenceExplanation` `redHerringLane` | `(trace, joiner?) => string`; `(trace) => readonly string[]` | postmortem sentences ("db was down → …"); "looked causal, wasn't" list | pure |
| `CompactionOptions` `CompactionResult` | interfaces | keep-every-Nth + tail snapshot policy | — |
| `compactBundle` | `(doc, options) => CompactionResult` | drop superseded snapshot states ONLY — never touches intentLog/checkpoints/lineage | byte-safe |
| `assertCompactionSafe` | `(original, compacted) => void` | post-compaction ring-equality gate | total-throwing |
| `CaptureOptions` `Harness` | interfaces | runner + strides + seeds bundle | — |
| `captureRun` | `<S>(options: CaptureOptions<S>) => ReplayBundleDoc` | run once, capture ticks = ring ∪ snapshot ∪ {0, terminal}, embed states at snapshots | — |
| `createHarness` | `<S>(options: CaptureOptions<S>) => Harness<S>` | memoized capture + `replayFinalDigest`, `replayDigests(n)` (the ×100 gate), `verify`, `compactAndVerify` | same options ⇒ same digests |

---

## loader

Purpose: the JSON→typed boundary for type-bundles (Appendix A §7.0) plus the
content-CI toolchain: strict hand-rolled parser (parse-don't-validate —
every physics number becomes Fixed/SimTimeUs/verified-safe-int; NO float
survives; unknown field = `UNKNOWN_FIELD` throw naming the dotted path;
result deep-frozen and key-ordered for digesting), the `_todo` placeholder
collector with criticality, the Ruleset Diff Linter (eight codes enforcing
§4.3 authoring law), era availability resolution, threat/visitor registry
indexes, 3-shape wave-table structural checks (laws stay in waves/), and the
i18n grammar-pack consumption contract (R46; §9.3/§9.11): strict pack boundary
parse enforcing the decision/flavour root wall at parse (the closed root sets
are re-declared loader-side; `packages/content/script/validate.mjs` stays the
LAW SOURCE for the authoring gates — verbatim-sync, technique ban-list,
dead-slot — which the parser deliberately does NOT duplicate), globally
unique keys, era objects reduced to {eras ascending, fallback} sharing one
slot set, plus key resolution, plain-number era picking (exact > nearest
earlier > fallback) and single-pass inert-brace slot filling.
Never touches the filesystem — the corpus is injected (CONVENTIONS §4 no
platform access). Import: `@hh/sim-core/loader`. NOTE: CONVENTIONS formerly
called this "zod" — FIXED 2026-10-06: §1/§1.1/§3/§4 now describe the
hand-rolled strict parser accurately (no zod dependency has ever existed in
the package).

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `LoaderErrorCode` | 11-code union | MISSING_FIELD…NON_FINITE_NUMBER | closed |
| `LoaderError` | `class extends Error` | every boundary throw (carries code + dotted path) | — |
| `DecimalRatio` `decimalRatioFromText` | interface; `(text, path) => DecimalRatio` | exact decimal capture before Fixed conversion | pure |
| `toFixed` `toFixedUnit` | `(value: number, path) => Fixed` | float→Q16.16 at the boundary ONLY, rejects unrepresentable | total-throwing |
| `msToUs` | `(value: number, path) => SimTimeUs` | ms→µs, sub-µs resolution rejected | total-throwing |
| `dollarsToMoney` | `(value: number, path) => MoneyUnit` | $→µ$, sub-µ$ rejected | total-throwing |
| `toSafeInt` | `(value, path, min, max) => number` | safe-integer window check | total-throwing |
| `fixedInDomain` | `(raw: bigint) => boolean` | Q16.16 representability probe | pure |
| `YearString` `EraAltitude` `TwoFrontDenomination` `ScenarioArchetype` `WinConditionKind` `OpaqueJsonValue` `OpaqueJsonRecord` | type layer | bundle vocabularies (11 archetypes Endure…Inherit; 6 win kinds; Z1–Z4 altitudes) | closed |
| `LoadedVisitorStats` `LoadedPatienceParams` `LoadedVisitor` `LoadedGoal` `LoadedScarce` `LoadedTempo` `LoadedFamilyWeights` `LoadedSignatureThreat` `LoadedThreats` `LoadedLodContract` `LoadedSkin` `LoadedEras` `LoadedChargebackRate` `LoadedHypeCycle` `LoadedEconomy` `LoadedArchetypeInstance` `LoadedBuildables` `LoadedControl` `LoadedVerbs` `LoadedSynergy` `LoadedAntagonism` `LoadedPrereqSet` `LoadedPivot` `LoadedRelations` `LoadedHandoverNote` `LoadedRosettaCard` `LoadedScenarios` `LoadedGuardrails` `LoadedMeta` `LoadedTypeBundle` | interfaces | the TRUSTED twin of every `Bundle*` wire shape — all numbers already int/Fixed/bigint, deep-frozen, key-ordered | post-parse immutable |
| `loadTypeBundle` | `(raw: unknown) => LoadedTypeBundle` | THE boundary parse (plan-driven; unknown-key fail-loud; `_todo`/`tuningSheet` are the two blessed convention keys) | deterministic, deep-frozen |
| `stableSerialize` | `(value: unknown) => string` | canonical key-ordered serialization for content hashing (1-arg; root renames observed's to `observedStableSerialize`) | order-pinned |
| `EraStatus` `EraResolution` `resolveEraAvailability` | `"available"\|"pre-introduction"\|"obsolete"\|"undocumented"`; interfaces; `(bundle, eraYear) => EraResolution` | is this type live in era Y? (undocumented line = neither granted nor denied) | pure |
| `bundlesLiveInEra` | `(bundles, eraYear, opts?) => readonly string[]` | era filter over a corpus | sorted ids |
| `eraOverrideFor` | `(bundle, eraKey) => bundle["eras"]["eraOverrides"][key] \| undefined` | per-era patch read | pure |
| `ThreatRegistryIndex` `VisitorArchetypeIndex` `parseThreatRegistry` `parseVisitorArchetypeRegistry` | interfaces; `(raw, source?) => index` | core registry boundary parses (default source names cited in errors) | total-throwing |
| `TodoCriticality` `TodoEntry` `TodoReport` `collectTodos` | `"critical"\|"cosmetic"\|"standard"\|"exempt"`; interfaces; `(raw, source) => TodoReport` | harvest every null + nearest `_todo` §-cite, criticality-sorted backlog | pure |
| `LintCode` `LintSeverity` `LintFinding` `LintReport` `WaveStructureIssue` `RulesetCorpus` | types | eight linter codes THREE_CHANGE / VERB_SHIFT / ROSETTA / CHANGED_HOOKS / PALETTE_20 / BESPOKE_TALLY / CROSS_REF / WAVE_STRUCTURE (§4.3/§8 RISK-2) | closed |
| `INVARIANT_VERBS` | `readonly ["observe","diagnose","place & connect","tune","triage","commit"]` | the six verbs EVERY type shares (dominant verb must SHIFT across eras) | const |
| `waveRefKey` | `(waveTable: string) => string \| null` | bundle→wave-table reference normalization | pure |
| `LintConfig` | `interface { baselineId?: string }` | pins the ONE yardstick every §7.8 hook-distance is measured FROM (the 3–5 change rule is per-type, not pairwise): resolution order = supplied `baselineId` (missing id fails loud) → `official:shared-web` when present → first-sorted bundle id announced with a warn finding (a corpus never silently re-anchors the variety budget) | deterministic anchor pick |
| `lintRulesetCorpus` | `(corpus: RulesetCorpus) => LintReport` | corpus diff against the anchored baseline (`RulesetCorpus.config?: LintConfig`) — content-CI gate | sorted pairs |
| `formatLintReport` | `(report) => readonly string[]` | human lines for CI log | pinned |
| `WAVE_BAND_VOCAB` `ENVELOPE_SHAPE_PHASES` | const arrays | the shared vocab checks (bands §1.7 / ramp-plateau-decay) | closed |
| `inspectWaveTableStructure` | `(raw: unknown, ref: string) => WaveStructureIssue[]` | STRUCTURE-only wave-table check (3-shape law); semantic laws live in waves/enforcer | pure |
| `I18nSlotKind` `I18nNamespace` | `"entity"\|"number"\|"money"\|"duration"\|"tick"\|"pct"\|"time"\|"text"`; `"decision"\|"flavour"` | pack vocabularies (slot-glossary kinds per schema/i18n-pack.schema.json; §9.3 namespace pair) | closed |
| `LoadedI18nSlot` | `interface { kind; desc: string \| null }` | one slot-glossary entry | post-parse immutable |
| `PlainI18nTemplate` `EraVariantI18nTemplate` `I18nTemplate` | interfaces; union discriminated by `kind: "plain" \| "era-variant"` | parsed template: single body, or `{eras year→body ascending, fallback}`; every template carries namespace, key and its sorted distinct slot set | frozen; eras iterate ascending by year |
| `LoadedI18nPack` | interface | the frozen pack: header fields + eraCodes/slots/decision/flavour/provenance as sealed ReadonlyMaps (insertion pinned at parse) | deep-frozen; every map code-unit (era: numeric-year) sorted |
| `loadI18nPack` | `(raw: unknown) => LoadedI18nPack` | THE pack boundary parse — §9.3 root wall (root outside the closed re-declared vocabularies fails loud, BAD_ENUM), global key uniqueness asserted at parse, era objects {eras, fallback} one-slot-set law, {slot} token syntax; authoring gates stay in validate.mjs (law source) | deterministic, deep-frozen |
| `resolveTemplate` | `(pack, key) => I18nTemplate` | lookup by globally-unique key (both namespaces searched; parse-time uniqueness makes it unambiguous); miss fails loud naming key + pack | pure |
| `pickEraText` | `(pack, key, eraYear: number) => string` | era selection: exact year > nearest EARLIER year > fallback (a later era's copy never leaks into the past); plain keys return their body, year inert | plain-integer year compare — no Date/Intl |
| `fillTemplate` | `(pack, key, slots: Readonly<Record<string, string \| number>>) => string` | fill a PLAIN template by key; exact-set law (missing → MISSING_FIELD listing them, extra → UNKNOWN_FIELD listing them); era-variant keys fail loud pointing at pickEraText — no silent era guess | single-pass left-to-right; substituted braces stay inert (no recursive expansion) |
| `fillTemplateBody` | `(body, slots, where?) => string` | the same substitution over any slot-syntax-valid body (composition partner of pickEraText); slot values are string or safe integer only | single-pass; substituted braces inert |
| `stableSerializePackKeys` | `(pack) => string[]` | every template key across both namespaces, code-unit sorted — content-hash / corpus-diff surface | order-pinned |

---

## save

Purpose: THE LONG SAVE — company-lineage persistence across generations
(§4.6 WS-6, Appendix C, RATIFIED R-3 "company LINEAGE TREE schema"). Encodes
the write-facet vs read-face separation (faces.ts is views; ~27 write facets
are gated by the OD-8 mode matrix), the `CompanyNode` generational vertex
with size discipline (scar cap 3, playbook ≤8, named customers 12 — Long
Save stays low-MB), append-only event spines (attribution, treatment logs,
careers) with materialized projections, sim-time-stamped everything,
cross-mode shared streaks at SaveFile ROOT, canonical JSON + FNV digests,
versioned migratable envelope (FILE_SCHEMA_VERSION 2), and the atomic-write
contract (serialize→hash→tmp→verify-parse→replace; last step only destructive
= crash-safety). **Shipping status (2026-10-06): `./save` is in the package
exports map and star-exported by the root barrel** (landed mid-audit) with
`save*` aliases for its codec-cloning quartet. Import law
honored: `../types` + `../kernel` exclusively; the replay bundle is composed
as OPAQUE data.

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `SaveError` `fail` `requireDefined` | error class; `(what) => never`; guard | every fail-loud here | total-throwing |
| `compareCodeUnits` | `(a, b) => number` | LOCAL DUPLICATE of replay's canonical ordering (lane-boundary law — save must not import replay) | pinned |
| `canonicalJson` `fromCanonicalJson` | `(value) => string`; `(text) => unknown` | deterministic save-file JSON (sorted keys, bigint exact) | order-pinned |
| `utf8Bytes` `fnv1a64Hex` `digestSaveValue` | byte helpers + `(value) => string` | file digest | byte-exact |
| `canonicalClone` | `<T>(value: T) => T` | freeze-clean deep clone through canonical round-trip | pure |
| `FILE_SCHEMA_VERSION` `SaveSchemaVersion` `LONG_SAVE_SCHEMA_VERSION` | `2`; interfaces; `1` | file version triple (file/engine/simContract gates replay) | const |
| `GlobalRecords` `SaveSettings` `emptyGlobalRecords` | interfaces + ctor | cross-company records + hardcore-ironman settings | — |
| `SaveFile` | `interface { schemaVersion; saveId; createdAtTick; lineage; globalRecords; streaksShared; settings }` | THE Long Save envelope | — |
| `NewSaveOptions` `newSaveFile` | interface; `(options) => SaveFile` | mint an empty save (saveId, engineVersion, simContract triple) | pure |
| `saveFileToWire` `parseSaveWire` | `(save) => Dict`; `(value) => SaveFile` | round-trip (NOTE: `Dict` is module-private — consumers hold structural `Record<string, unknown>`) | canonical |
| `SaveMigration` `MigrationRegistry` `createMigrationRegistry` `registerMigration` `planMigrationChain` `MigrationPlan` `planSaveMigration` `migrateSaveWire` `SAVE_MIGRATIONS` | interfaces + chain machinery + the shipped 1→2 migration (adds `reputation.breachHistoryTicks`) | pure wire→wire migrations; downgradability = keep pre-migration backup | deterministic chains |
| `SaveStorePort` | `interface { read(key); writeTmp(key,text); replace(key); deleteTmp(key) }` | INJECTED storage port (browser FSAL / Node fs) — no platform access in-lane | host-boundary |
| `PreparedAtomicWrite` `prepareAtomicWrite` `commitAtomicWrite` | interface; `(save, key?) => …`; `(port, save, key?) => { digest; previousBackup }` | the atomic contract: serialize→hash→tmp→verify-parse→replace | crash-safe ordering |
| `readSave` | `(port, key, opts?: { expectDigest?: string }) => SaveFile` | read + reparse + optional digest verify (tamper tripwire) | total-throwing |
| `LongSaveRunRef` `LongSaveDoc` `composeLongSave` `longSaveToWire` `parseLongSaveWire` `serializeLongSave` `digestLongSave` `parseLongSave` | doc + codec | SaveFile envelope ∪ replay-run refs (the one file that IS the campaign memory) | canonical |
| `NodeStatus` `SuccessionType` `ExitKind` `NodeIdentity` `Succession` | unions/interfaces | active/retired/retired_npc; found/exit/failure_restart/npc_pivot | closed |
| `GoalCardState` `DoctrineEntry` `DoctrineState` `NodeCalendar` | interfaces | standing goals, doctrine lines, sim calendar | sim-time |
| `StaffCareerStop` `StaffRecord` `AlumniRecord` `SpineCastRecord` | interfaces | staff careers across nodes (append-only logs) | append order |
| `ScarRecord` `CauseRef` `RetiredScarRecord` `PostmortemRecord` `GhostRecord` `HabitCounters` `DeadDriveRecord` | interfaces | scars (cap 3), retired variants, postmortems, ghosts, habits, dead drives | bounded by design |
| `HardwareBiography` `PassedUnlockDraft` `UnlockVia` `NodeUnlockRecord` | interfaces/union | hardware lifespan story; unlock drafts; via = scar/foresight/testimony/anticipation/milestone/era/acquisition | — |
| `CredentialKind` `CredentialRecord` `MedalRecord` `LineEverRunRecord` `CodexEntry` | union + interfaces | ASN/ICANN/SOC2_I/PCI/HIPAA/FedRAMP/TierIII/merchant/utility_kw/gpu_alloc; medals; lines-ever-run; codex | closed kinds |
| `TreatmentDimension` `TreatmentEvent` `CustomerBookRecord` `ReputationState` `CreditGradeState` `TheMultipleState` `AttributionEvent` | interfaces | service/pricing/support/incident/honesty treatment spine; named-customer books; reputation + breach ledger; credit grade; The Multiple | append-only + projections |
| `NodeRecords` `AnnualReportRef` `FinancesSlice` `PlaybookSlotRecord` `WikiEntryRecord` `AnticipationState` `ResearchQueueRecord` `ConstraintCardRecord` `MuseumExhibitRecord` `PolicyBookSnapshotRef` | interfaces | the remaining write facets (records, annual reports, finances, playbook carry ≤8, wiki, anticipation, research queue, constraint cards, museum exhibits, rule-book snapshots) | bounded/sim-time |
| `CompanyNode` | interface (the vertex; ~45 facets) | one generation of the company lineage tree (Appendix C §2.2 verbatim) | canonical order |
| `SCAR_ACTIVE_CAP` `PLAYBOOK_CARRY_CAP` `NAMED_CUSTOMER_CAP` `RUNG_MIN` `RUNG_MAX` | `3` `8` `12` `1` `6` | the size-discipline caps + rung ladder | const |
| `UNIT_FRACTION_MIN` `UNIT_FRACTION_MAX` `CREDIT_SCORE_MIN` `CREDIT_SCORE_MAX` | `0` `1` `0` `850` | round-2 S-4 display-domain bounds — the ONLY legal plain-number domains (`scars[].clearance.progress`, `nodesUnlocked[].faded` ∈ [0,1]; `creditGrade.score` 0 = unrated … 850 = perfect, FICO-anchored) | const |
| `emptyHabits` `emptyReputation` `emptyCreditGrade` `emptyMultiple` `emptyRecords` `emptyFinances` `emptyAnticipation` | ctors | zeroed facets | pure |
| `NewNodeOptions` `newCompanyNode` | interface; `(options) => CompanyNode` | mint a generation vertex | pure |
| `addScar` | `(node, scar) => CompanyNode` | append scar (cap-enforced, fail loud past 3) | total-throwing |
| `appendAttribution` | `(node, effect, magnitude: Fixed, createdAtTick, causeEventRef) => CompanyNode` | the attribution spine (P10 end-to-end) | append-only |
| `parseDoctrine` `parsePlaybookSlot` `parseCompanyNode` | `(value, where?) => …` | boundary parses | total-throwing |
| `TreatmentEventDraft` `appendTreatment` | interface; `(node, subject, draft) => { customerBooks }` | treatment event onto a named book (books attach to named entities only) | seq-stamped |
| `TreatmentQuery` `queryTreatment` | interface; `(node, query) => readonly TreatmentEvent[]` | dimension/tick-window reads | sorted |
| `ReferenceCriteria` `ReferenceCandidate` `findReferenceCandidates` | interfaces; `(node, criteria) => readonly ReferenceCandidate[]` | "who will vouch for you" (U-facet) | deterministic order |
| `findDepositions` | `(node, { dimension; asOfTick; olderThanTicks }) => readonly TreatmentEvent[]` | aged events usable in postmortem/deposition | sorted |
| `projectBook` | `(book) => book` | recompute materialized projections from spine | pure |
| `parseTreatmentSubject` | `(raw: string) => EntityId` | subject-string boundary parse | total-throwing |
| `reputationStateFromLedger` | `(ledger, breaches?) => ReputationState` | the fix-economy handoff projection (2026-10-09): economy's bps ledger → the save-file Fixed snapshot — `overall` = `fromRatio(overallBps, 10_000n)`, byte-identical to the observed `reputationFixed` publisher's fold so HUD cell and save row can never disagree; the four-way `domains` split ALIASES `overall` until the economy grows per-domain ledgers (v0 shape law, disclosed in the file header — honest single-domain reading, not an authored lie); `honestHostFloor` rides through verbatim (§5.10 permanence); `breachHistoryTicks` maps `CovenantBreachRecord.atBusinessMin` (v2 facet on the time channel the economy speaks). Ledger/breach params are STRUCTURAL mirrors — save imports only `../types` + `../kernel`, never `../economy` | pure; SaveError on non-bigint or out-of-[0, 10000] bps |
| `StreakKind` `STREAK_KINDS` | uptime/no_data_loss/no_security/no_missed_backup | the four cross-mode streaks | closed |
| `StreakCounter` `SharedStreaks` `emptyStreaks` | interfaces + ctor | counters living at SaveFile ROOT only | — |
| `StreakDataRef` `streakDataRef` `readStreak` | ref types; `(kind) => ref`; `(streaks, ref) => StreakCounter` | nodes consume streaks as DATA refs, never copies | pure |
| `StreakEligibilityHook` `hookSatisfied` | interface; `(streaks, hook) => boolean` | unlock-hook probe over streak state | pure |
| `advanceStreak` `breakStreak` | `(streaks, kind, …) => SharedStreaks` | the two mutations (break stamps atTick + cause) | append history |
| `InheritanceManifest` `InheritanceEdge` `LineageGraph` `emptyLineageGraph` | interfaces | the tree: roots, nodes, edges with what-inherits-what manifests | — |
| `FoundOptions` `foundCompany` | interface; `(graph, options) => { graph; node }` | generation 0 (or a fresh founding) | pure chain |
| `SpawnChildOptions` `spawnChildFromParent` | interface; `(graph, parentId, options) => { graph; child; edge }` | succession spawn — foundedAtTick ≥ parent's enforced | fail-loud order |
| `applyInheritanceManifest` | `(childNode: CompanyNode, manifest: InheritanceManifest) => CompanyNode` | round-2 S-14: the seam campaign bootstrapping MUST call at the child's first run — materializes the T7 "carry-over-but-thin" capped cash slice into `finances.cashMicroUsd` (`spawnChildFromParent` RECORDS the manifest; bootstrapping SPENDS it, so an un-bootstrapped child provably starts at zero) | pure (new node); throws (fail-loud) on founder targets, non-`exit`-edge children with a non-null slice (present-on-exit-only law D12/T8 — failure is poorer, not paid), or negative slices (debts ride the debt rail) |
| `parseInheritanceEdge` `parseLineageWireGraph` | `(value, where?) => …` | wire parses | total-throwing |
| `getNode` `childrenOf` `ancestryChain` `queryNodes` `NodeFilter` | graph reads | the four traversal queries | sorted results |
| `generationOf` `countMuseumExhibits` `assertLineageIntegrity` | `(graph, id?) => number / void` | depth, exhibit census, cycle/orphan integrity gate | pure / total-throwing |
| `SaveMode` `SAVE_MODES` | campaign/scenario/endless/daily/consultant/blitz | the six modes | closed |
| `ModeTier` `GameModeBand` `GameModeRow` | `"core"\|"extended"\|"deferred"`; five recorded band labels; interface | **OD-16(a) mode-tiering law** types — the ~15-mode tiering adopted as law (owner ruling 2026-10-09b); band rides each row so the 3-tier fold stays auditable vs reports/MASTER_REPORT.md "Modes triage (§9.1)" | closed |
| `MODE_TIERING` | 32-row frozen registry | §9.1 heading/cluster-granularity tiering: **core 3 (campaign, incident, sandbox) · extended 20 · deferred 9**; band→tier fold lane-authored (owner-ratify-on-read), ONE ratified override — `endless` keeps its SHIP-4 design band but tiers `deferred` ("deferral ratified, not a gap"); load-time `assertModeTiering` fails loud on duplicate slugs, fold violations, or a SaveMode claimed ≠1× | const |
| `SAVE_MODE_TIER` `saveModeTier` `modeRowsIn` | derived projection; `(mode) => ModeTier`; `(tier) => rows` | ledger-mode tiers DERIVED from MODE_TIERING's saveMode back-links (single source, no second bookkeeping); sandbox is the only core row with `saveMode: null` — its settlement door is the shell's Company-write-API task, deliberately NOT a new SaveMode (matrix stays 192 rows, wire format unchanged) | — |
| `WriteKind` `RowStatus` | `"append"\|"instance"\|"deny"`; `"LIVE"\|"PENDING_OD8"` | the matrix value/risk cells | — |
| `WRITE_FACETS` `WriteFacet` | ~27 facet names | every writable facet of a CompanyNode | closed |
| `WriteAccessRow` `WRITE_ACCESS_MATRIX` | interface + generated table | mode × facet access grid — **OD-8 Matrix B RATIFIED 2026-10-09 (`74f157b`): 160 rows LIVE (campaign 32 + scenario/daily/consultant/blitz 128), the 32 endless rows stay `PENDING_OD8` (contested)**; Matrix-B semantics are encoded data (ledger four `records/medals/streaksShared/codex` append, every other facet denies) | const |
| `writeGuard` | `(mode, facet) => WriteKind` | LIVE rows ANSWER — deny-as-data included (probe facets return `"deny"`, they do not throw); **only the 32 held endless rows still THROW naming OD-8** | fail-fast on pending rows |
| `writeAccessOf` `pendingOd8Rows` `liveRows` | reads over the matrix | audit helpers (`pendingOd8Rows()` now returns exactly the endless 32) | pinned |
| `SettlementWrite` `SettlementBatch` `guardBatch` | interfaces; `(batch) => void` | end-of-settlement write gate: an EMPTY batch throws ("every run commits facts or nothing"); **a ratified-mode batch touching any DENIED facet THROWS and aborts the whole settlement (§2.4 atomicity) — the shadow-instance law is enforced, not advisory** | total-throwing |
| `ReadFace` | `"wall"\|"scrapbook"\|"almanac"\|"people"` | the four faces — READ views, never storage (§4.6) | closed |
| `WallView` `readWall` `ScrapbookView` `readScrapbook` `AlmanacView` `readAlmanac` `PeopleView` `readPeople` | view interfaces + readers `(node, [streaks/globalRecords]) => view` | each face rendered from node facts | pure projections |
| `FaceView` `FaceReadContext` `readFace` | union; interface; `(nodeId, graph, face, ctx) => FaceView` | one entry point for all faces | pure |
| `MuseumTourView` `readMuseum` | interface; `(node, ctx) => MuseumTourView` | exhibit-guided tour read | pure |

---

## versus

Purpose: the ratified async Red-vs-Blue deck format (docs/adr/0004 —
defender commits board + doctrine, attacker runs a committed deck offline
against it; the defender's live reserve is played by small hands through
the real intent door and the Policy-Book autopilot). Pure data + pure
logic: no UI, no netcode, no economy import — OD-1/OD-2 ratified
2026-10-09, yet versus still never resolves them by law: match score folds
ONLY caller-supplied weights-as-data (`getActiveScorecard`
/ `resolveActiveSheet` are never called; pinned absent by test). Boundary
parsers mirror `loader/boundary.ts` style with a local `VersusError`. The
deck→WaveTable converter honors the §2.24 authoring laws by construction
and self-checks against `waves/enforcer` (a non-empty verdict throws
`DECK_UNPACKABLE`, it never ships). Census/counter data enters as
parameters — this module never reads `packages/content` itself.
Import: `@hh/sim-core/versus`.

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `VersusError` | `class extends Error { code: VersusErrorCode; path: string }` | Boundary error for every versus parser/verdict; message grammar `versus[CODE] at 'path': detail` | pure · total-throwing by design |
| `VersusErrorCode` | `"MISSING_FIELD" \| "UNKNOWN_FIELD" \| ... \| "DUPLICATE_ENTRY" \| "DECK_UNPACKABLE"` (14 codes) | Machine-readable versus failure classes (mirrors LoaderErrorCode + deck/commit codes); `DUPLICATE_ENTRY` fires on repeated buildables/policy-card hashes in a defense deck | closed union |
| `AFFIX_VOCABULARY` | `readonly ThreatAffix[]` (16) | §2.13 affix mix-in slugs (core eight + second eight) | frozen |
| `ThreatAffix` | `"low-slow" \| "distributed" \| ... \| "bounded"` | One affix slug (closed enum — v0 deck law) | closed union |
| `MAX_DECK_THREATS` | `10` | §2.24 active-family pool cap ceiling for decks | constant |
| `MAX_DECK_ENTRIES` | `32` | Structural entries-per-deck cap (wire-garbage guard) | constant |
| `MIN_DISTINCT_ROLES` | `3` | Converter floor: under this the wave-4/8 fresh-role cadence is unsatisfiable | constant |
| `MAX_THREATS_PER_DENOMINATION` | `4` | Deck-side re-anchor of the waves per-denomination quota (law sources kept equal by value) | constant |
| `ThreatCensusEntry` | `interface { roles, denomination, family, band }` | What deck machinery needs about one threat id — supplied as DATA (no fs reads) | deep-frozen values |
| `buildRegistryCensus` | `(raw: unknown) => Map<string, ThreatCensusEntry>` | Parse a registry-core-shaped doc into the census map (roles normalized: `Healer/Spawner`→healer, `Bypass/Flyer`→bypass; `customerAsThreat:true` flips family) | pure · order-pinned (threats array order) · total-throwing |
| `buildCounterMap` | `(raw: unknown) => Map<string, readonly string[]>` | threatId → counter names from the same registry shape (R-15 fairness input) | pure · order-pinned · total-throwing |
| `ThreatDeckEntry` | `interface { threatId; weightBps: number; affix?: ThreatAffix }` | One deck slot; weightBps is BOTH weight and cost (exact-int bps) | — |
| `ThreatDeck` | `interface { kind:"threat"; id; budgetBps; entries }` | The attacker's committed draft | deep-frozen at parse |
| `ThreatDeckParseOptions` | `interface { census: ReadonlyMap<string, ThreatCensusEntry> }` | Threat universe for the parse gate | — |
| `parseThreatDeck` | `(raw: unknown, options) => ThreatDeck` | Strict boundary parse: floats/booleans die (`NOT_A_SAFE_INTEGER`), unknown threats die (`UNKNOWN_THREAT`), budget must sum EXACTLY (`BUDGET_MISMATCH`), ids colon-free | pure · total-throwing · no clock |
| `DefenseDeck` | `interface { kind:"defense"; id; buildables; policyCardHashes; doctrineRef; handCapacity }` | The defender's committed build (`policyCardHashes` are CONTENT FINGERPRINTS — `hh-card-v1` folds via `cardContentFingerprint`, never card ids; owner-ratified 2026-10-09; the cards themselves ride the ruleBook, never the deck) | deep-frozen at parse |
| `DefenseDeckParseOptions` | `interface { buildableUniverse: ReadonlySet<string> }` | Palette universe (door `canPlaceDevice` decoupling pattern) | — |
| `parseDefenseDeck` | `(raw: unknown, options) => DefenseDeck` | Strict parse; unknown buildable → `UNKNOWN_BUILDABLE`; duplicate buildable/policy-card hash → `DUPLICATE_ENTRY`; handCapacity 1..8 | pure · total-throwing |
| `DECK_LEGALITY_CODES` | `readonly ["POOL_CAP_EXCEEDED", ...]` (5) | Closed code list for deck-legality rows | frozen |
| `DeckLegalityCode` | union of the five | One legality code | closed union |
| `DeckLegalityViolation` | `interface { code; detail }` | One legality finding (data, not exception) | — |
| `deckLegalityViolations` | `(deck, census) => readonly DeckLegalityViolation[]` | Pure §2.24-style census: pool cap, ≤4/denomination, ≥3 roles, ≤2 roles >30% weight (hot = weight×100 > 30×budget, integer-exact) | pure · order-pinned (code-unit) · never throws |
| `VERSUS_HASH_DOMAIN` | `"hh-versus-deck-v1"` | Commit-hash version tag (format change = new tag, never silent rebinding) | constant |
| `CommittableDeck` | `ThreatDeck \| DefenseDeck` | Anything the commit envelope binds | — |
| `DeckCommitment` | `interface { kind; deckHash; canonicalJson }` | Blind-commit envelope: hash + the exact canonical bytes it bound | frozen |
| `deckCanonicalJson` | `(deck: unknown) => string` | Canonical JSON (sorted keys, tagged bigints) via the shared `internal/canonical` encoder — reveal/audit material | pure · order-pinned |
| `commitDeck` | `(deck: CommittableDeck) => DeckCommitment` | `hh-versus-deck-v1:<16hex>` FNV-1a-64 avalanche fold over the canonical bytes (whole-doc fold family of the door's M3 ruleBookHash, canonical-JSON construction) | pure · no RNG · no clock |
| `RevealVerdict` | `interface { ok: true; deckHash }` | Typed pass of reveal-verify | — |
| `revealAndVerify` | `(envelope: DeckCommitment, revealed: unknown) => RevealVerdict` | Re-hash the revealed doc; mismatch THROWS `COMMIT_MISMATCH` naming the first diverging canonical path (`$.entries[0].weightBps` style). Reveal binds BYTES, not legality — the verified document is returned unparsed; callers must run `parseThreatDeck`/`parseDefenseDeck` on it for the legality gate | pure · total-throwing |
| `DraftCandidate` | `interface { threatId; weightBps; affix? }` | One offered card | frozen |
| `DraftPresentation` | `interface { pickIndex; slotWeightBps; candidates; taken }` | One 1-of-N stop: offers + the pick | frozen |
| `DraftOptions` | `interface { seed; deckId; budgetBps; pool; slotWeightBps; affixPool?; affixChanceBps?; offerSize?; census?; scriptedPicks? }` | Draft request; last slot absorbs the budget remainder (sum law by construction); `census` validates pool ids at DRAFT time (unknown → `UNKNOWN_THREAT`); `scriptedPicks` scripts each choice — dice still roll, stream positions unchanged | — |
| `DraftOutcome` | `interface { deck: ThreatDeck; presentations }` | The drafted deck + the full audit trail of presentations | frozen |
| `draftThreatDeck` | `(options: DraftOptions) => DraftOutcome` | Deterministic 1-of-3 draft on `streamFor(seed, "versus/draft", 0)` forks; randomness decides WHICH cards/affixes, NEVER legality | seeded · pure-per-seed · order-pinned |
| `DRAFT_VIOLATION_CODES` | `readonly string[]` (6) | Closed code list incl. `COUNTER_ABSENT` | frozen |
| `DraftViolationCode` | union | One draft-violation code | closed union |
| `DraftViolation` | `interface { code; threatId?; detail }` | One validation finding | — |
| `DraftValidationInput` | `interface { census; counters }` | Legality universe + R-15 counter map (data) | — |
| `validateDraftedDeck` | `(deck, input) => readonly DraftViolation[]` | Deck legality + every drafted threat has ≥1 counter (Second Answer); reports, never throws | pure · order-pinned |
| `VERSUS_WAVE_COUNT` | `8` | §9.x versus round length | constant |
| `VERSUS_PAR_LADDER_PCT` | `readonly [40,22,52,28,62,34,70,38]` | Sawtooth par ladder — every trough ≥45% below running peak, integer-exact | frozen |
| `VERSUS_SHARE_LADDERS` | `readonly { 1:[100]; 2:[60,40]; 3:[50,30,20]; 4:[40,30,20,10] }` | Share split by wave size; role >30% quota unreachable inside a wave | frozen |
| `VERSUS_DEFAULT_WINDOW_MINUTES` | `12` | Default wave window | constant |
| `VERSUS_DEFAULT_RAMP_MINUTES` | `4` | Default envelope ramp | constant |
| `VERSUS_DEFAULT_PLATEAU_MINUTES` | `4` | Default envelope plateau | constant |
| `VERSUS_DEFAULT_DECAY_MINUTES` | `4` | Default envelope decay | constant |
| `DeckScheduleOptions` | `interface { census; tableId; typeBundleId; tuningSheet?; unitsPerPressurePoint?; windowMinutes?; ramp/plateau/decayMinutes?; targets? }` | Conversion inputs; tableId colon-free AND `~`-free (unitId grammar) | — |
| `ScheduledWaveRow` | `interface { n; threatIds; roles }` | Per-wave placement record | frozen |
| `DeckSchedule` | `interface { table: WaveTable; waves }` | Law-clean table + placement audit | frozen |
| `deckToWaveTable` | `(deck: ThreatDeck, options) => DeckSchedule` | Deck → 8-wave WaveTable: weight-ordered first-fit with forced role anchors (w1 heaviest/ρ0, w4 ρ1, w8 ρ2; ρ1 barred from 1–3, ρ2 from 5–7); self-check via `parseWaveTable` + `enforceWaveTable` — violations throw, never ship | pure · no RNG · deterministic DFS |
| `VersusNodeCommit` | `interface { id; slots; serviceTimeUs; inspectionDepth; dependencyId }` | Node blueprint minted into NodeRecords per run | — |
| `VersusEdgeCommit` | `interface { relation; from; to; slot? }` | Initial board edge (door-grammar id derived) | — |
| `ReserveIntentCommit` | union of 4 verb commits | One defender reserve order (place-device / connect-ports / policy-card-commit / configure-node) | closed union |
| `VersusReserveIntent` | `interface { tick: number; intent: ReserveIntentCommit }` | Reserve order + execution tick (pause-with-orders; fed exactly once) | — |
| `DefenderCommit` | `interface { engineVersion; sheetsHash; ruleBook; policyCardsByHash?; nodes; edges?; routing; buildables; handCapacity; reserveIntents?; detectionRatio?; falsePositiveRatio?; doctrineGauge? }` | The committed board + doctrine (autopilot ruleBook, canPlaceDevice universe, small hands); `policyCardsByHash` keys are `hh-card-v1` content fingerprints — the default index folds the ruleBook through `cardContentFingerprint` (card.id is display metadata only) | — |
| `stampReserveIntents` | `(intents: readonly VersusReserveIntent[]) => readonly ExternalIntent[]` | Reserve → door wire (seq = queue order, atUs = tick×minute); pass as harness `intents` option | pure · order-pinned |
| `versusRuleBookHash` | `(ruleBook: readonly PolicyCard[]) => string` | `hh-versus-book-v1:` canonical fold of the doctrine (same family as deck commit) | pure · order-pinned |
| `cardContentFingerprint` | `(card: PolicyCard) => string` | `hh-card-v1:<16hex>` CONTENT fingerprint of one policy card — canonical tagged-JSON fold (id stripped: identity is bytes of content, `card.id` stays display metadata) + FNV-1a-64 avalanche, same family as `commitDeck`/`versusRuleBookHash`. The keying law for `policyCardHashes`/`policyCardsByHash` (owner-ratified 2026-10-09): a re-authored card is a different key, an old hash never resolves to new bytes (reveal-binds-bytes) | pure · key-order-independent (sorted by construction) · no RNG · no clock |
| `defaultPolicyCardIndex` | `(cards: readonly PolicyCard[]) => ReadonlyMap<string, PolicyCard>` | Build the DEFAULT `policyCardsByHash` index the door consults for `policy-card-commit` — keyed by `cardContentFingerprint(card)`, NEVER `card.id` (owner-ratified 2026-10-09; `createVersusEngine` falls back here only when the host wires no explicit map). Two content-identical cards under different ids collapse to ONE entry (the fold drops id; last-write wins the shared slot) — the key space is a named, testable law, pinned by the `defaultPolicyCardIndex` revert guard in match.test.ts | pure · order-pinned (later card wins a fingerprint collision) · no RNG · no clock |
| `MatchScoringWeights` | `interface { landedValue; blockedValue; servedValue; falsePositivePenalty: bigint }` | Weights-as-DATA (OD-1/OD-2 ratified 2026-10-09; versus law keeps the module never resolving a scorecard) | — |
| `DEFAULT_MATCH_WEIGHTS` | frozen `MatchScoringWeights` | Neutral-money defaults (−50M landed, +2M blocked, +1M served, −20M FP µ$) — pure data, replaceable | frozen |
| `OutcomeCounters` | `interface { served; blocked; falsePositive; landed: number }` | Harvested terminals for one label (from REAL outcome events) | — |
| `PerWaveOutcome` | `interface OutcomeCounters + { label: "wave-n"|"baseline"|"unattributed"; waveN: number|null }` | One results row; baseline row when enabled, unattributed only when >0 | frozen |
| `OutcomeTotals` | `= OutcomeCounters` | Whole-match sum | — |
| `VersusMatchConfig` | `interface { seed; deck; census; tableId; typeBundleId; defender; scoring?; pressure; unitsPerPressurePoint?; tuningSheet?; matchTicks; waveStartMinute?; waveWindowMinutes?; customerBaseline?; aggression?; expressMaxConfidence?; patienceMinutes? }` | Full async-match inputs — everything the resolution needs is committed data | — |
| `VersusRunState` | `interface { game: GameState; totals; ruleFirings: number }` | Harness-visible run state (digest is `digestState(state.game)`) | deep-frozen |
| `initialVersusRunState` | `(config: VersusMatchConfig) => VersusRunState` | Legal tick-0 run state for `createHarness` (pure tick-0 fold of the config) | pure |
| `createVersusRunner` | `(config: VersusMatchConfig, options?: { memoize?: boolean }) => SimRunner<VersusRunState> & { memoStats(): VersusMemoStats }` | Harness runner: ONE resumable engine advanced monotonically with dense per-tick snapshot serving (default; `{memoize:false}` = naive mint-per-call re-sim); `memoStats()` snapshots the memo observably — enabled/ticksAdvanced/snapshotCount/rebuilds/degraded, so every degrade path is loud | pure-per-request · ×100 replay byte-ident |
| `resolveVersusMatch` | `(config: VersusMatchConfig) => MatchResult` | Full resolution: compose 8 timed waves + baseline, run ticks (planWave → driver.advance, gate-G1 recipe), harvest counters, score, attribute the decisive wave via replay/causality over real events | seeded · no clock · deterministic |
| `MatchResult` | `interface { tableId; deckId; seed; schedule; perWaveOutcomes; totals; ruleFirings; finalDigest; matchScore: bigint; decisiveWaveN; attribution; attributionCauseId }` | The verdict: per-wave counters, 32-hex `digestState` final digest, weights-folded µ$ score, one-sentence causal attribution (decisive = most landed → most blocked → lowest n) | frozen |
| `scoreVersusMatch` | `(totals: OutcomeTotals, weights: MatchScoringWeights) => bigint` | Pure Σ counters × weights in µ-units — re-price any result | pure |

---

## coverage

Purpose: the Coverage Grid (hg §2.1 "The Nine Defense Roles and the Coverage
Grid", P17) — a 12-threat-role × 9-defense-role matrix that makes DARK CELLS
(constraints you lack) visible before they hurt you. Threat roles are REUSED
from `waves/THREAT_ROLES` (never re-invented); defense roles ship verbatim
against `packages/content/threats/registry-core.json` `defenseRolesVocabulary`
(pinned by test). Pure data + pure logic: buildables, spawnable pools and role
censuses arrive as PLAIN DATA (door `canPlaceDevice` decoupling — no economy /
policy / topology imports, grep-pinned; no ledger import — the G2 bridge takes
`spawnableThreatIds` from the caller). Cell combine law: MAX, not sum (two
WAFs do not double-cover everything one covers; Second Answer depth is
per-ROW via `secondAnswerGaps`, §2.1). Import: `@hh/sim-core/coverage`.

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `DEFENSE_ROLES` | `readonly DefenseRole[]` (9) | The §2.1 defense-role table: id, display label, "what it acts on", examples | deep-frozen · table order |
| `DefenseRole` | `interface { id; label; actsOn; examples }` | One defense role as data (plain-language tooltip text) | — |
| `DefenseRoleId` | `"absorb" \| "classify" \| ... \| "negotiate"` (9 slugs) | Closed defense-column vocabulary | closed union |
| `DEFENSE_ROLE_IDS` | `readonly DefenseRoleId[]` (9) | Column order for the grid (§2.1 table order) | frozen |
| `isDefenseRoleId` | `(value: string) => value is DefenseRoleId` | Boundary guard for role tags in content data | pure |
| `CoverageError` | `class extends Error { code: CoverageErrorCode; path: string }` | Boundary error; message grammar `coverage[CODE] at 'path': detail` | pure · total-throwing by design |
| `CoverageErrorCode` | `"BAD_THREAT_ROLE" \| "BAD_DEFENSE_ROLE" \| "BAD_STRENGTH" \| "OUT_OF_RANGE" \| "EMPTY_ROLES" \| "UNKNOWN_THREAT"` | Machine-readable coverage failure classes | closed union |
| `CoverageCellState` | `"dark" \| "thin" \| "ok" \| "strong"` | The four teaching rungs (P17: lit cells vs conspicuous holes) | closed union |
| `COVERAGE_LADDER` | `Readonly<{ darkBelow; thinBelow; okBelow: Fixed }>` | Fixed-exact rung thresholds 6554n/26214n/55706n (≈0.1/0.4/0.85, half-away rounding); a cell sits in the first rung its strength is strictly below | frozen · raw values pinned by test |
| `coverageCellState` | `(strength: Fixed) => CoverageCellState` | Ladder classifier (non-bigint dies `BAD_STRENGTH`) | pure · total-throwing |
| `DEFAULT_UNCALIBRATED_STRENGTH` | `Fixed` (0.5 = 32768n) | What a buildable without per-role calibration contributes — "ok", never "strong": kind-of-answer reads as a real answer, perfection needs calibration | constant |
| `COVERAGE_CELL_COUNT` | `108` | Grid size law 12×9, recomputed from the vocabularies | constant |
| `BuildableCoverage` | `interface { roles: readonly DefenseRoleId[]; strengths?: Partial<Record<ThreatRole, Fixed>> }` | What ONE buildable brings: its columns + optional per-threat-role calibration | — |
| `CoverageProfile` | `ReadonlyMap<string, BuildableCoverage>` | buildableId → coverage; the player's build as plain data (content packs / versus DefenseDeck feed this) | — |
| `ResolvedBuildable` | `interface { buildableId; roles; strengths: ReadonlyMap }` | Parsed+validated buildable (obtain via `resolveCoverageProfile`) | deep-frozen |
| `resolveCoverageProfile` | `(profile: CoverageProfile) => readonly ResolvedBuildable[]` | Boundary parse (Law 2/4): empty id/roles, unknown roles, non-Fixed or out-of-range strengths all throw; result sorted code-unit by id | pure · total-throwing · order-pinned |
| `combineCoverageStrength` | `(current: Fixed, contribution: Fixed) => Fixed` | THE combine law: max, never sum (docblock notes where redundancy revisits) | pure |
| `deriveCoverageCell` | `(resolved, threatRole, defenseRole) => CoverageCell` | One cell: max over contributors declaring the column (calibrated value or generic default), with sorted contributor list | pure · order-pinned |
| `CoverageCell` | `interface { threatRole; defenseRole; strength: Fixed; state; contributors }` | The answer to "how much does what I built blunt THIS role via THIS kind of defense" | deep-frozen |
| `coverageCellKey` | `(threatRole, defenseRole) => string` | Cell key grammar `<threatRole>\|<defenseRole>` (slugs are pipe-free by vocabulary) | pure |
| `CoverageGrid` | `interface { rows; cols; cells: ReadonlyMap<string, CoverageCell>; summary }` | The whole render-agnostic 12×9 projection; cells inserted code-unit-sorted so canonical Map walks digest byte-stably | deep-frozen · order-pinned |
| `CoverageGridInput` | `interface { profile: CoverageProfile }` | Grid build input | — |
| `CoverageGridSummary` | `interface { darkCount; thinCount; okCount; strongCount; bestCoverage: Fixed; holePairs }` | Panel header: hole census + `holePairs` = dark-cell keys sorted code-unit (named like the §2.1 plain-language row) | frozen |
| `buildCoverageGrid` | `(input: CoverageGridInput) => CoverageGrid` | Full matrix computation (empty board ⇒ 108 dark cells, bestCoverage 0) | pure · no rng/clock · digest-stable (encodeTaggedTree ×100 pinned) |
| `secondAnswerGaps` | `(grid: CoverageGrid) => readonly ThreatRole[]` | §2.1 Second Answer law: rows with <2 columns at "ok"-or-better ("a tax, not a decision") | pure · vocabulary order |
| `ThreatRoleCensus` | `ReadonlyMap<string, readonly ThreatRole[]>` | threatId → roles (ARRAY values: the real registry is multi-role — one threat teaches every role it plays) | — |
| `DarkCellRow` | `interface { threatRole; state; weakestDefenses; sampleThreatIds; invitedThreatIds }` | One teaching row: exposure state = row's BEST cell; weakest-first columns (Fixed, ties code-unit); spawnable samples; P2 invite flags | frozen |
| `darkCellReport` | `(profile, spawnableThreatIds, threatRoleOf, recentInvites?) => readonly DarkCellRow[]` | THE teaching payload: which unblocked threats exploit which dark/thin rows; covered rows and unhurt holes are omitted; unknown threats/invites fail loud | pure · order-pinned · total-throwing |

---

## unattended

Purpose: the **unattended-sim engine service** — hg §9.2 "The Long Weekend"
(WS-8's second highest-leverage service): the company runs on YOUR policies for
≤48h while you are offline, and the HARD RULE is that nothing catastrophic may
happen (a lot may drift). This module is that law made executable: a
deterministic fast-forward of the full pipeline + policy autopilot + economy,
watched by a CLOSED vocabulary of declarative catastrophe guards that HALT the
run between ticks (never mid-tick) and hand back a digest-stable report. Same
engine powers the What-Would-Break forward sim (hg §9.2:33875 — kill any object,
watch the consequence, rewind: a thought experiment, not a chaos monkey — the
delta is applied to a COPY, the live world is untouched), the Analyst's
3-minute-post-close sim, Succession's 90-days-without-you, and async-Versus
defender autopilot seeding. Guards are ROWS NOT CODE (hg §7.14:2187
"automation executes your mistakes at machine speed" is exactly what
`ruleRunaway` watches): config accepts no functions, metric names come from a
closed vocabulary, and every threshold omitted falls back to a PROVISIONAL
§-grounded builtin (owner taste pending). Running with `guards: []` is legal —
the report then carries the honest `NO-GUARDS` warning (honesty, not
enforcement). Composition mirrors `versus/match.ts` (REUSE of that recipe, zero
imports from it): wave traffic via `planWave` + `directorPropose`, rule phase
via `createRulePhaseStep`, gauge via `ObservedStore`, optional money lane via
`runEconomyTick`. What-Would-Break divergence uses the replay bisection pattern
(`replay/verify.ts`) over checkpoint digests. Import: `@hh/sim-core/unattended`.

### Guardrail model (rows-not-code catastrophes)

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `GUARD_METRICS` | `readonly GuardMetric[]` (5) | CLOSED observation vocabulary: `cash.free`, `servedRate`, `nodesDegradedPct`, `ruleFiringsPerMin`, `errorBudgetSec` — custom guards may ride these names only | frozen · order-pinned |
| `GuardMetric` | `"cash.free" \| "servedRate" \| "nodesDegradedPct" \| "ruleFiringsPerMin" \| "errorBudgetSec"` | Metric-name type (derived from `GUARD_METRICS`) | closed union |
| `GUARD_KINDS` | `readonly GuardKind[]` (6) | The catastrophe census: 5 builtins + `threshold` | frozen · order-pinned |
| `GuardKind` | `"freeCashDepleted" \| "totalOutage" \| "cascadeCollapse" \| "ruleRunaway" \| "errorBudgetGone" \| "threshold"` | Guard predicate family | closed union |
| `GUARD_COMPARATORS` | `readonly GuardComparator[]` (4) | `lt`/`lte`/`gt`/`gte` — the only verdict arithmetic custom guards may ask for | frozen |
| `GuardComparator` | `"lt" \| "lte" \| "gt" \| "gte"` | Comparator type | closed union |
| `FreeCashDepletedDef` | `interface { type: "freeCashDepleted"; sustainedMin? }` | cash.free ≤ 0 sustained N min (hg §9.2 bankruptcy = catastrophic) — OR any ledger refusal on the tick arms the chain: `refusedBurns > 0` reads as inability-to-pay even while cash rides a small positive (review F5, one chain step per tick) | — |
| `TotalOutageDef` | `interface { type: "totalOutage"; sustainedMin? }` | servedRate == 0 across the fleet sustained N min, **under demand** — zero arrivals in the window CLEAR the chain (idle ≠ dead, review F2: the guard fires on catastrophes, not quiet weekends) | — |
| `CascadeCollapseDef` | `interface { type: "cascadeCollapse"; degradedPctGt?; sustainedMin? }` | >X% nodes at ρ ≥ NODE_DEGRADED_RHO_GTE simultaneously (degradedPctGt is a PERCENT number, `50` or `50n` both parse) | — |
| `RuleRunawayDef` | `interface { type: "ruleRunaway"; firingsPerMinGt?; sustainedMin? }` | rule firings/min > threshold — the machine-speed mistake (§7.14:2187) | — |
| `ErrorBudgetGoneDef` | `interface { type: "errorBudgetGone"; remainingSecLte?; sustainedMin? }` | min remaining SLA error budget ≤ N seconds sustained (needs the money lane) | — |
| `ThresholdGuardDef` | `interface { type: "threshold"; metric: GuardMetric; comparator: GuardComparator; value: Fixed; sustainedMin? }` | The custom-guard escape hatch — still rows: closed metric, four comparators, Fixed value | — |
| `CatastropheDef` | `FreeCashDepletedDef \| … \| ThresholdGuardDef` (6-arm union) | The whole declarative guard vocabulary | closed union |
| `BUILTIN_CATASTROPHE_DEFS` | `Readonly<Record<builtin GuardKind, CatastropheDef>>` | The PROVISIONAL §-grounded defaults: freeCashDepleted sustain 10, totalOutage 30, cascadeCollapse 50%/10, ruleRunaway 30/min/5, errorBudgetGone ≤0s/10 — omitted def fields fall back to these | deep-frozen |
| `UnattendedErrorCode` | `"GUARD_PARSE" \| "CONFIG_PARSE" \| "TICK_BOUNDS" \| "BOARD_EMPTY" \| "WHATIF_PATCH" \| "CHECKPOINT_CADENCE"` | Machine-readable failure classes — every code has a live throw site (the review sweep pruned never-minted `REPLAY_STATE` and renamed `NO_TRAFFIC` → `BOARD_EMPTY`: the site refuses an empty *board*, while traffic-emptiness is the `NO-TRAFFIC` warn's job) | closed union |
| `UnattendedError` | `class extends Error { code: UnattendedErrorCode; path: string }` | Boundary error; message grammar `unattended[CODE] at 'path': detail` | pure · total-throwing by design |
| `guardFixedFromInt` | `(whole: number) => Fixed` | Whole-number → Fixed for guard values (safe-int range checked both ends — fail loud before Q16.16 wrap). LEGAL only for authoring THRESHOLD constants; run-time sums/aggregates ride the raw bigint domain and a single `fromRatio` (review F1) | pure · total-throwing |
| `ParsedGuard` | `interface { def; kind; reason; sustainedMin }` | Trusted post-parse guard (`reason` == `guardReasonCode(kind)`; the HALT reason string) | deep-frozen |
| `parseCatastropheDef` | `(raw: unknown, path?: string) => ParsedGuard` | THE parse-don't-validate boundary (Laws 2/4): unknown type/metric/comparator, non-integer sustainedMin, out-of-range values, NaN/Infinity, arrays and ANY function value all throw `GUARD_PARSE`; bigint-or-number percents normalise through `percentToFixed` | pure · total-throwing |
| `guardReasonCode` | `(kind: GuardKind) => string` | Halt-reason grammar `guard:<kind>` | pure |
| `parseGuardList` | `(raw: readonly unknown[]) => readonly ParsedGuard[]` | List boundary: duplicates (same encoded fingerprint) throw; CALLER ORDER is KEPT — the first-listed trigger wins the stop reason | pure · order-pinned · total-throwing |
| `percentToFixed` | `(pct: number) => Fixed` | Percent-as-Fixed carrier conversion (50 → 50×65536 = 3276800n; rounds hundredths exactly) | pure |
| `GuardrailSample` | `interface { tick; minute; clocks; businessMinute; metrics: ReadonlyMap<GuardMetric, Fixed>; economyAvailable; errorBudgetAvailable; windowArrivals; refusedBurns }` | One tick's closed-vocabulary readings + availability flags (unknown metric = ABSENT from the map, never 0 — the never-fires-on-ignorance law). `windowArrivals` is the totalOutage demand evidence, `refusedBurns` the freeCashDepleted inability-to-pay evidence — both REQUIRED on host-side constructors (review F2/F5) | — |
| `GuardVerdict` | `"ok" \| "armed" \| "triggered" \| "unavailable"` | Four-rung verdict ladder; `armed` = breach running, under the sustained floor | closed union |
| `GuardEvaluation` | `interface { reason; verdict; runMin }` | Verdict row (what `UnattendedStop.triggered` carries) | frozen |
| `evaluateGuardrail` | `(guard: ParsedGuard, sample: GuardrailSample, priorRun: number) => { evaluation: GuardEvaluation; nextRun: number }` | Atomic sustained-run counter fold (Law 3): breach → run+1, trigger at `>= sustainedMin`; clear/unavailable RESET the chain — the predicate, never the clock, decides | pure · total on parsed input |
| `guardKindCensus` | `(guards: readonly ParsedGuard[]) => ReadonlyMap<GuardKind, number>` | Kind → count, sorted for digest-stable reporting | pure · order-pinned |
| `ruleRunawayDefaultPerMin` | `() => number` | The PROVISIONAL machine-speed default (30 firings/min) as a plain readout | pure |

### Fast-forward runner (the Long Weekend engine)

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `DEFAULT_CHECKPOINT_EVERY` | `60` | Digest cadence default (perf-lane guidance: one `digestState` per simulated hour) | constant |
| `LONG_WEEKEND_MAX_TICKS` | `2880` | 48h in 1-min ticks (hg §9.2); beyond it the report warns `LONG-WEEKEND-EXCEEDED` | constant |
| `GUARD_TRAILING_WINDOW_MIN` | `5` | Rate metrics (servedRate, ruleFiringsPerMin) are exact means over the trailing 5 sim-minutes — a single quiet tick can't fake an outage | constant |
| `UNATTENDED_CLASSES` | `readonly QosClassDef[]` (gold+bronze) | The versus traffic-shape pair (60/40 weight, inspect vs pass-through) | deep-frozen |
| `UNATTENDED_RETRY` | `RetryPolicy` | maxRetries 2, backoff 2 min, no jitter purchase (versus twin) | frozen |
| `UNATTENDED_BASELINE_RATE_PER_MIN` | `40` | Default organic plateau rate when no wave table is configured | constant |
| `UNATTENDED_AGGRESSION` | `Fixed` (0.7) | Default wave aggression knob (versus twin) | constant |
| `UNATTENDED_EXPRESS_MAX_CONFIDENCE` | `Fixed` (0.6) | Default express-triage confidence (versus twin) | constant |
| `NODE_DEGRADED_RHO_GTE` | `Fixed` (0.9) | A node at ρ ≥ 0.9 counts "degraded" for `cascadeCollapse` | constant |
| `UNATTENDED_DEFAULT_PATIENCE_MIN` | `120` | Default queue patience in sim-minutes | constant |
| `budgetMinRemainingSec` | `(econ: EconomyState) => bigint` | WORST remaining error-budget seconds across all budgeted contracts (the `errorBudgetGone` carrier) | pure · sorted contract order fold |
| `mintNodeRecords` | `(cast: readonly UnattendedNodeSpec[]) => readonly NodeRecord[]` | Board cast → fresh NodeRecords (versus mkNode shape: slots-not-HP, hockey-stick, qos-weighted) | pure · cast order |
| `mintBoardEdges` | `(edges: readonly UnattendedEdgeSpec[] \| undefined) => readonly BoardEdgeRecord[]` | Edge specs → fresh BoardEdgeRecords | pure |
| `mintInitialState` | `(config, nodes, edges) => GameState` | Fresh `createInitialState` with unattended content-hash envelope (`sheetsHash: "unattended-sheets-v0"`) + hands/board — every run mints ALL mutable state inside the call (replay-state purity) | pure per call · seeded |
| `buildPipelineConfig` | `(config, nodes) => DefaultPipelineConfig` | Steps 1–11 config (versus twin): 9/10 detection, 1/10 FP, no referral/return; an empty board (no express path and no dnsNodeId) throws `BOARD_EMPTY` — a board verdict, not a traffic one (review F10) | pure · total-throwing |
| `runUnattended` | `(config: RunUnattendedConfig) => UnattendedReport` | THE engine: per tick planWave-window envelopes (or baseline plateau, plus whatIf surge) → driver.advance with rulePhase wired → gauge fold → optional money lane (contracts/opex/outage-drain) → checkpoints at cadence → guard evaluation → HALT between ticks on first trigger. Warnings (sorted, deduped): `NO-GUARDS`, `LONG-WEEKEND-EXCEEDED`, `MONEY-GUARD-WITHOUT-ECONOMY`, `BUDGET-GUARD-NO-CONTRACTS` (empty roster ⇒ budget guards can never fire), `NO-TRAFFIC`, `OPEX-REFUSED ×N from mK` (a scheduled burn bounced off the negative-bucket law), `INVOICE-UNCOVERABLE ×N from mK` (an insolvent settle voided that tick's economy progress — prior state kept, host must fund the roster; review F4/F5) | deterministic ×100-pinned · seeded · order-pinned report |

### Report records

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `RunUnattendedConfig` | `interface { runSeed; ticks?; maxSimMinutes?; board; ruleBook; ruleBookHash; guards; traffic?; money?; checkpointEvery?; door?; handCapacity?; expressPath?; deepPath?; expressMaxConfidence?; aggression?; defaultPatienceMin?; gaugeMetric?; engineVersion? }` | The full weekend setup as data (guards arrive RAW and are parsed at the boundary) | — |
| `UnattendedTrafficConfig` | `interface { tableId?; baselineRatePerMin?; table?; waveStartMinute?; pressureParams? }` | Traffic: flat plateau and/or a waves-corpus table replayed via the versus offline planWave recipe | — |
| `UnattendedMoneyConfig` | `interface { contracts; initialFreeMicroUsd?; opex?; cfg?; commitmentBps?; dunningEngineOwned?; revenueTags? }` | Money lane wiring (absent ⇒ cash guards stay `unavailable`, honestly) | — |
| `UnattendedOpexDraft` | `interface { atMinute; amountMicroUsd; memo }` | One host-scheduled burn posted through the ledger at its sim-minute (payroll-like; refused, not overdrafted, when cash is short) | — |
| `UnattendedNodeSpec` | `interface { id; kind?; slots; serviceTimeUs; dependencyNodeId?; inspectionDepth? }` | Board cast member — slots are capacity (R-32); `disableDefense` what-ifs patch inspectionDepth to `pass-through` | — |
| `UnattendedEdgeSpec` | `interface { id; relation; from; to; slot? }` | Board cable spec | — |
| `UnattendedBoardCast` | `interface { nodes; edges? }` | The whole topology as plain data | — |
| `UnattendedStop` | `interface { reason; atTick; atMinute; snapshotDigest; triggered: readonly GuardEvaluation[] }` | The halt witness: `snapshotDigest` is byte-equal to the finalDigest a clean run ending at `atTick` would print (never-mid-tick law, pinned) | — |
| `UnattendedCheckpoint` | `interface { tick; digest }` | One cadence digest row (bisection fuel for whatIf) | — |
| `UnattendedSummary` | `interface { served; blocked; falsePositive; landed; ruleFirings; intentsExecuted; intentsRefused; cashDeltaMicroUsd; cashStartMicroUsd; cashEndMicroUsd; invoiceEvents }` | The Monday-morning totals (µ$ stays in the bigint domain; `invoiceEvents` is the economy-notice census sorted by kind) | — |
| `UnattendedHourBucket` | `interface { hour; startMinute; endMinuteExclusive; served; blocked; landed; falsePositive; ruleFirings; arrivals; meanArrivalRatePerMin; meanRho; peakRho; degradedTicks; meanFreeCashMicroUsd }` | Per-sim-hour Fixed/bigint aggregates (floor((minute+1)/60) buckets; rate means — `meanArrivalRatePerMin` included — fold as raw-bigint sums over one `fromRatio` divide, so a busy weekend's 60 000-arrivals-per-hour totals never hit the Q16.16 input wall, review F1) | — |
| `UnattendedReport` | `interface { runSeed; ticksRun; stop; finalDigest; perCheckpoint; summary; hourlyBuckets; warns; guardsParsed }` | THE deliverable — digest-stable end-to-end (encodeTaggedTree over the whole report is what the ×100 gate pins) | deep-referenced state |

### What-Would-Break forward sim

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `WHATIF_DELTA_KINDS` | `readonly WhatIfDeltaKind[]` (3) | The enumerable experiment vocabulary (scaleEvent DECLINED for v0 — trafficSurge is its inverse; owner question logged) | frozen |
| `WhatIfDeltaKind` | `"removeNode" \| "disableDefense" \| "trafficSurge"` | Delta family type | closed union |
| `RemoveNodeDelta` | `interface { type: "removeNode"; id: string }` | Kill any object (hg §9.2 thought experiment): node + touching cables dropped; dangling deps/express/deep refs patched as DATA; removing the last express carrier fail-louds `WHATIF_PATCH` via the runner | — |
| `DisableDefenseDelta` | `interface { type: "disableDefense"; id: string }` | One node's inspectionDepth → `pass-through` (defense is per-node in v0; whole-venue death is `removeNode`) | — |
| `TrafficSurgeDelta` | `interface { type: "trafficSurge"; multiplier: Fixed; minutes; startMinute? }` | Every envelope's ratePerMin × multiplier inside the window (baseline AND wave plans) | — |
| `WhatIfDelta` | `RemoveNodeDelta \| DisableDefenseDelta \| TrafficSurgeDelta` | The closed delta union | closed union |
| `RunWhatIfConfig` | `interface { config; delta; horizon?; checkpointEvery? }` | Experiment wiring: one config + one data delta + a horizon. Default `min(config.ticks, config.maxSimMinutes)` (either alone when the other is absent; neither throws `WHATIF_PATCH`). An EXPLICIT horizon OVERRIDES the config's `maxSimMinutes` cap — the cap is stripped for both worlds so the bisection replays consistently (review F7); both worlds always run the same horizon | — |
| `applyWhatIfDelta` | `(config: RunUnattendedConfig, delta: WhatIfDelta) => { config: RunUnattendedConfig; applied: readonly string[]; surge: SurgeWindow \| null }` | Pure structural patch (Laws 2/3): frozen copies, never mutation; unknown ids throw; `applied` narrates every edit for the report | pure · total-throwing |
| `runWhatIf` | `(input: RunWhatIfConfig) => WhatIfResult` | THE experiment: baseline and variant fast-forwarded IDENTICALLY (same seeds, same cadence), checkpoint rows aligned, first divergent checkpoint window then tick-by-tick refine (replay bisection pattern) | deterministic ×100 · seeded |
| `WhatIfDeltaSummary` | `interface { deltaType; applied; baselineTicksRun; variantTicksRun; baselineStop; variantStop; horizon }` | What the delta did (stops included — a variant that HALTS is the most legible divergence of all) | — |
| `WhatIfResult` | `interface { divergent; firstDivergentTick; divergentWindow; deltaSummary; baseline: UnattendedReport; variant: UnattendedReport }` | The rewindable answer: both full reports + first-divergence tick (`null` when the worlds never split — ×1 surge genuinely proves it) | — |
| `DEFAULT_WHATIF_CHECKPOINT_EVERY` | `60` | Experiment cadence default (coarse pass), refine always runs cadence 1 inside the winning window | constant |
| `guardsInConfig` | `(config: RunUnattendedConfig) => readonly ParsedGuard[]` | Boundary passthrough so hosts can preview which guards a weekend will carry | pure |

---

## unlocks

Purpose: the unlock-DISCOVERY engine (hg §5, audit g16/g17 TOP-PROBLEMS #1–#3:
save/ persisted the unlock VOCABULARY since 9e701a0 but nothing EMITTED a scar,
consumed `relations.unlocks.prereqSets`, or advanced codex mastery). v0 is an
OBSERVER, never a mutator: it consumes event windows fed from OUTSIDE GameState
(pipeline `TickResult.events`, economy notices, era state, host declarations)
and emits `UnlockProposal` rows into its own store — every digest golden stays
byte-identical (pinned by `src/unlocks/__tests__/integration.test.ts`). NOT
wired into any driver in v0; `observe(tickInput)` is the documented seam
(Phase-2 maps proposals onto `save/node.ts` `NodeUnlockRecord` fields). The
seven `via` channels and the four codex stages are VOCABULARY MIRRORS of
`save/node.ts:231/:291` (structural re-declaration, no import — leaf law).
Pure: no RNG, no wall-clock, no Date; every output is a deterministic fold of
its inputs, deep-frozen. Import: `@hh/sim-core/unlocks`.

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `UnlockTriggerKind` | `"scar" \| "foresight" \| "testimony" \| "anticipation" \| "milestone" \| "era" \| "acquisition"` | The §5.1 taxonomy = save/ `UnlockVia` verbatim | closed union |
| `UNLOCK_TRIGGER_KINDS` | `readonly UnlockTriggerKind[]` (7) | Ordered vocabulary table (§5.1 reading order) | frozen |
| `UnlockDeclaredKind` | `"foresight" \| "testimony" \| "anticipation" \| "acquisition"` | The four channels NOT computable from sim events — host-declared | closed union |
| `UNLOCK_DECLARED_KINDS` | `readonly UnlockDeclaredKind[]` (4) | Ordered declared-channel table | frozen |
| `UnlockProposal` | `interface { via; targetRef: EntityId; atTick: SimTick; causeId: CauseId }` | One earned unlock, Phase-2 raw material for a `NodeUnlockRecord`; `targetRef` is the stable id (`scar:bounce:<node>`, `milestone:<label>`, `era:<year>`, or a node id) | frozen per proposal |
| `UnlocksErrorCode` | `"bad-config" \| "bad-clock" \| "bad-value" \| "unknown-prereq"` | Closed error vocabulary | closed union |
| `UnlocksError` | `class extends Error { code; path }` | Grammar `unlocks[CODE] at 'path': detail` (versus-family pattern) | — |
| `MilestoneThreshold` | `interface { atMinute: number; label: string }` | One time milestone row (`atMinute` is a SimMinute; label is a `:`-free slug feeding `milestone:<label>`) | — |
| `UnlockObserverConfig` | `interface { bounceScarAfter; falsePositiveScarAfter; landedScarAfter; noticeScarAfter; milestoneMinutes }` | The typed thresholds the §5.3 "explicit numeric values" spec awaits; notice census + milestone ladder are config, not code | — |
| `DEFAULT_UNLOCK_OBSERVER_CONFIG` | `UnlockObserverConfig` | v0 defaults: scar at 5 bounces / 3 FPs / 1 landing; business-pain notices (written-off, churned-voluntary, suspended, spiral-flagged) at 1; day/week/month milestones | frozen constant |
| `parseUnlockObserverConfig` | `(overrides?: Partial<UnlockObserverConfig>) => UnlockObserverConfig` | Boundary wall (Laws 2/4): positive safe ints, unique `:`-free labels, strictly ascending minutes; empty milestone list legal; frozen output | pure · total-throwing |
| `UnlockNoticeLike` | `interface { kind: string; causeId: string }` | Structural reader for economy `EconomyNotice` (leaf law: no economy import) | — |
| `UnlockDeclaration` | `interface { via: UnlockDeclaredKind; targetRef: EntityId; causeId?: CauseId }` | Host-side declaration for the four non-computable channels (diagrams, testimonies, acquisitions) | — |
| `UnlockTickInput` | `interface { tick; minute; events?; notices?; eraYear?; declarations? }` | THE integration seam payload: one between-ticks window. Deliberately carries NO GameState — the observer cannot reach mutable state even by accident | — |
| `UnlockCounters` | `interface { bounceCountByNode; falsePositiveCountByNode; landedCount; noticeCountByKind }` | Lifetime evidence census the fold accumulates (Maps frozen per snapshot) | — |
| `UnlockObservation` | `interface { tick; minute; counters; causes; eraYear; eraChanged; declarations }` | One fold result: trusted snapshot; `causes` maps counter key → LATEST crossing event's cause | frozen snapshot |
| `UNATTRIBUTED_NODE` | `"_unattributed"` | Bucket key for bounces with `nodeId === null` (queue-less sheds) | constant |
| `observeUnlockWindow` | `(prev: UnlockObservation \| null, window: UnlockTickInput) => UnlockObservation` | PURE fold of one window into the next snapshot (Law 3): prev untouched; era flips only between two KNOWN years (null re-baselines); declarations window-scoped | pure · deterministic |
| `scarTrigger` | `(obs, cfg?) => readonly UnlockProposal[]` | §5.2 scars: per-node bounce/FP counts, total landings, configured notice kinds, all ≥ thresholds; sorted iteration | pure · sorted order |
| `milestoneTrigger` | `(obs, cfg?) => readonly UnlockProposal[]` | §5.3 clock milestones (business-minute ladder, authored order) | pure |
| `eraTrigger` | `(obs, cfg?) => readonly UnlockProposal[]` | §5.1 era-flip unlock (the only channel with a content resolver — loader/eras.ts — this consumes the FACT, not the resolver) | pure |
| `declaredTrigger` | `(obs, cfg?) => readonly UnlockProposal[]` | Pass-through for host declarations, stamped with the window tick; host causeId wins, else minted | pure |
| `evaluateUnlockTriggers` | `(obs, cfg) => readonly UnlockProposal[]` | Canonical trigger order: scar → milestone → era → declared | pure · fixed order |
| `UnlockObserver` | `interface { observe; proposals; lastObservation; config }` | The stateful shell: folds windows, fires each targetRef ONCE per run | — |
| `createUnlockObserver` | `(overrides?: Partial<UnlockObserverConfig>) => UnlockObserver` | Constructor; invalid config throws HERE, not at observe time (Fail Fast); proposals() returns a copy | frozen shell |

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `PrereqSetLike` | `interface { tech?; commercial?; alt? }` | Structural mirror of loader `LoadedPrereqSet` (bundle.ts:262) — a parsed bundle's `relations.prereqSets` feeds `parsePrereqSets` directly | — |
| `ParsedPrereqSet` | `interface { tech: readonly string[]; commercial: readonly string[]; alt: string \| null }` | Trusted route record (omitted channels parse to empty) | deep-frozen |
| `PrereqBlocker` | `interface { setIndex; missingTech; missingCommercial; missingAlt }` | One still-locked route's readable lock (§5.6 "readable locks") — the explanation IS the lock label | frozen row |
| `SatisfiedSet` | `ReadonlySet<string>` | Evidence alias: every prereq id already earned | — |
| `parsePrereqSets` | `(raw: readonly unknown[], where?: string) => readonly ParsedPrereqSet[]` | Boundary wall: rejects non-objects, empty/duplicate ids, non-string alt, and vacuous all-empty routes ("vacuous lock") | pure · total-throwing |
| `canUnlock` | `(sets, satisfied, knownIds?) => boolean` | ANY-route law (§5.6 alternative routes): route opens when every NAMED channel is met OR its alt is met; empty lattice opens trivially (authored-ungated, waves/ledger idiom); optional known-id universe fail-louds unsatisfiable authoring | pure |
| `whatBlocks` | `(sets, satisfied, knownIds?) => readonly PrereqBlocker[]` | Per-route missing ids while locked; EMPTY once any route opens (a lock nobody stands behind prints nothing) | pure · route order |

| Export | Signature (as shipped) | Meaning | Determinism notes |
|---|---|---|---|
| `CodexStage` | `"seen" \| "analyzed" \| "countered" \| "mastered"` | save/ `CodexEntry["stage"]` mirror (§5.4 ladder; save parser is the wall) | closed union |
| `CODEX_STAGES` | `readonly CodexStage[]` (4) | Ladder order | frozen |
| `WEATHER_DEMOTION_BAND` | `"weather"` | The waves/bands.ts band a mastered threat plays at — same word, same meaning | constant |
| `WeatherDemotionBand` | `typeof WEATHER_DEMOTION_BAND` | Literal type of the band name | — |
| `CodexCounters` | `interface { sightings: number; counters: number }` | Repeat-observation evidence for ONE threat (host folds wave plans / defense resolutions in — v0 counter source is structural, pipeline events carry no threatIds) | — |
| `CodexLadderConfig` | `interface { analyzeAfterSightings; masterAfterCounters }` | Rung thresholds | — |
| `CODEX_LADDER_DEFAULTS` | `CodexLadderConfig` (3, 5) | `masterAfterCounters` ALIGNED with waves/ledger `DEFAULT_LEDGER_CONFIG.masteryDemotionAfter` — one number, one law (pinned by test) | frozen constant |
| `codexStageFor` | `(counters, cfg?) => CodexStage \| null` | The advancer save/ was waiting for: null = never sighted; highest satisfied rung wins (counters dominate sightings) | pure |
| `CodexGap` | `interface { next: CodexStage \| null; remaining: number; evidence: "sightings" \| "counters" \| null }` | Readable distance to the next rung (§5.4 fill-in-the-blank progress) | frozen row |
| `nextCodexGap` | `(counters, cfg?) => CodexGap` | Stage is DERIVED from the counters — a caller cannot hand a stage its counters disagree with; null/null at the mastered ceiling | pure |
| `isDemotedToWeather` | `(counterCount: number, cfg?) => boolean` | Codex-side twin of `bandAfterMastery`: counters ≥ threshold ⇔ mastery settled | pure |

---

## Inter-module contracts (the handshakes lanes must honor)

These are the load-bearing seams, verified against the code on disk:

1. **`PipelineSlots` + `TickStep<In, Out>` (types.ts, frozen §7.13 shapes).**
   Every mechanic is a modifier bound to exactly ONE named slot. Swapping is
   legal via spread (`{ ...createDefaultSlots(cfg), inspect: myMod })`. Where
   the frozen shape is thinner than a mechanic needs, the driver passes
   *structurally-richer* inputs (`BackpressureInExt`, `OutcomeInExt`) — extra
   fields are invisible to foreign steps, so any `PipelineSlots` remains a
   valid drop-in. Steps MUST be pure: data-in → data-out; RNG arrives only as
   an explicit `RngStream` field (or derived from a passed `runSeed`, as the
   documented patience deviation does). Canonical execution order =
   `TICK_STEP_ORDER` (1…12, then `rulePhase`).

2. **Rule phase = slot 12.5.** `RulePhaseIn{ context, observed, book,
   suppressed, rng }` → `RulePhaseOut{ firings, intents }`. The interpreter
   reads ONLY the observed map (ground truth structurally unreachable — fog
   degrades automation, WS-5 G1 ratified), touches NO RNG (the `rng` field is
   deliberately never read), and emits `PlayerIntent`s onto `TickResult.intents`
   as CANDIDATES the host may re-feed — evaluate-and-enqueue, never mutate
   (`policy/evaluator.ts` header; CONVENTIONS §1.1). Round-3 correction (was
   overclaimed as "for NEXT-tick adjudication"): NO engine-side loop adjudicates
   these in v0 — the driver never re-feeds them, and the shipped `kind:"verb"`
   carrier is REFUSED by the intent door (`unsupported-verb-carrier`, contract
   #10) until the policy lane maps rule actions onto `player-verb` args
   (MODULE-STATUS gap row "Rule-carrier verbs refused").

3. **Step-12 single writer (observed).** `ObservedStore.applyObservedWrites
   (records, tickUs)` is the ONLY mutation path in the lane — three machine
   enforcements: no other public mutator exists; a batch stamped older than
   the internal watermark throws; every value must pass
   `stableSerialize(value, 0)` before entering state. Steps 1–11 run ground
   truth; step 12 derives observed cells through `InstrumentBinding`s
   (`deriveCell`) and merges explicit writes; ground escapes only through the
   two authored fairness channels (`sitePreview`, `pulseStrip`). Integration
   composes: driver output → per-tick `ObservedWrite[]` → store → merge into
   `GameState.observed` (see gate slice below).

4. **`SimRunner<S>` structural injection (replay).**
   `(request: { initialState: S; runSeed; targetTick; intentsUpToTick }) => S`
   — replay never imports an engine module; YOUR state type, YOUR runner. The
   single law: **same request ⇒ same answer**. All per-run mutable objects
   (drivers, stores, runtime states, closures like `createRulePhaseStep`)
   must be minted INSIDE the runner body. Digest override: harness defaults
   to `canonicalDigest`; pass `pipeline/digestState` (or your own
   `StateDigest<S>`) to pin the tripwire to the engine's hash.

5. **Stats-not-entities (lanes).** `GameState.lanes: ReadonlyMap<EntityId,
   LaneStats>` holds aggregates ONLY (§7.7b) — rate, distribution REF, class
   mix, health. Lanes never hold units; the renderer draws mote fields from
   the aggregates. Nothing in any lane may unit-list a lane.

6. **`WaveEnvelope` handoff (waves → pipeline step 1).** `planWave(...)`
   returns a `WavePlan` whose `.waveEnvelope` (via `toWaveEnvelope`) is fed
   verbatim into `TickInputs.envelopes` for the wave's minutes. The envelope
   carries `tableId/role/shape/ratePerMin/telegraphed/dominantFamily`;
   director nudges may deepen troughs but never alter telegraphed composition
   (R-31), and every draw lands in `DirectorDraw` for the replay log.

7. **Attribution law (all lanes).** Every state mutation is cause-stamped:
   `LedgerEntry`/`ObservedWrite` carry `CauseId`s; economy `postEntry` makes
   it structurally mandatory (P10); policy mints `rule:<ruleId>:<tick>:<mode>`;
   save appends `appendAttribution`; replay's `CauseIndex` stitches the spine.

8. **Canonical-serialization map (three copies, one law).** Key-order law is
   code-unit sort + exact bigint decimals + insertion-order Maps/Sets,
implemented at THREE boundaries BY DESIGN (lane isolation forbids the
imports): `replay/canonical` (tagged JSON + HHC1 binary + FNV digest),
`save/canonical` (local duplicate for file digests), `observed/store`'s
`stableSerialize(value, depth)` (digestibility gate). Root barrel renames
observed's to `observedStableSerialize` to break the loader clash, and keeps
the flat `compareCodeUnits/fail/fnv1a64Hex/requireDefined` with replay while
save's quartet rides `save*` aliases (FOLLOW-UP: a shared codec retires all
of it). waves'
`TuningSheet` (data) beats economy's same-name union at root
(`EconomyTuningSheetId` alias — dies on the economy rename).

9. **Clock model.** Three bigint-µs clocks in `ClockState`, advanced only via
   `advanceClocks(clocks, injectedDelta)`. Slots take `simMinute` (RNG key)
   or `businessMin` (economy calendar) explicitly; `ClockKind` names which
   clock every action owns (dual-clock rule, §4.1). Wall time exists for
   display only.

10. **Intent Door (pipeline ↔ host ↔ replay) — `pipeline/intent-door.ts`.**
    The ONLY legal door through which external (player or re-fed rule) intents
    enter the deterministic sim (§4.2 action economy + Hands, §7.5
    hands-as-action-slots, §7.13 tick-inserted intents / pause-with-orders).
    The driver calls `applyIntentDoor(state, context, externalIntents, config)`
    BEFORE step 1 of every tick; due entries (stamp ≤ current tick) apply in
    `(tick, seq)` order, future stamps refuse LOUDLY after the due pass, in
    input order — so "the whole schedule at once" host patterns fail visible
    instead of smearing across ticks. Each entry is fed EXACTLY ONCE (ambient-
    input contract; M4 — a schedule repeating one `(tick, seq)` stamp is
    structural garbage: `IntentDoorError` naming both offending positions,
    never a silent double-fire). Laws:
    - **Execute-or-refuse, never crash-but-also-never-silent** — VALUE-domain
      violations (out-of-set values, empty-after-parse strings, unknown ids)
      become deterministic `intent-refused` events (no RNG consulted anywhere
      in the door, no state change, nothing consumed); STRUCTURAL wire garbage
      — any primitive TYPE mismatch on the entry, stamp fields AND the
      per-verb arg shapes parsed in `parseEntry` (M2: the type law lives ONLY
      at the boundary; handlers trust their args and own the refusal space
      alone) — throws `IntentDoorError` at the parse boundary (Laws 2+4): a
      host bug to find, not a game state to fork.
    - **Hands are physics (§7.5)** — every executed intent pays its verb's
      `handCost` tokens for `occupancyTicks` from `GameState.hands`; a verb
      whose cost is 0 (toggle-speed by default, or any host override) books
      nothing at all — the rail is never touched (half-open occupancy
      `[start, busyUntilTick)`, tokens released on each door pass that
      touches the rail, before any allocation); a refusal spends nothing —
      the reservation is snapshot-
      undone, which even keeps a refused-only pass `hands`-identity-stable.
      Payment order is canonical: HANDS first (an unaffordable action refuses
      before its payload is interpreted), then handler semantics.
    - **Scope discipline** — handlers mutate ONLY their named slice;
      units/lanes/observed/cash/ledger/contracts are never reachable from the
      door (audit-tested by object reference identity); unchanged sections
      keep the ORIGIN state's identity in the returned value. `context` is the
      one stamped field (W1): every state the door hands out — validator
      snapshots and final result alike — carries THIS pass's `TickContext`
      (single fresh source; `query.state.context.tick === query.context.tick`
      is pinned), never the prior tick's. The driver still assembles its own
      when building the next state.

    Verb → handler → hand-cost table (verified against
    `DEFAULT_INTENT_HAND_COST` / `DEFAULT_INTENT_OCCUPANCY_TICKS`,
    `intent-door.ts` — frozen tables; 1 tick = 1 sim-minute; §7.5 durations rounded UP):

    | Verb (`PlayerVerb`) | Handler | Mutates | Cost | Occupancy |
    |---|---|---|---|---|
    | `place-device` | `handlePlaceDevice` | `nodes` (skeleton `NodeRecord`) | 1 | 3 ticks |
    | `connect-ports` | `handleConnectPorts` | `board` (edge add, version++) | 1 | 3 ticks |
    | `disconnect-drain` | `handleDisconnectDrain` | `board` (edge delete, version++) — OR, under `drainPolicy.enabled`, a deferred delete by the continuation (below) | 1 | 2 ticks (drain mode: `drainTicks` supersedes) |
    | `configure-node` | `handleConfigureNode` | `nodes` (inspectionDepth / shedOrder) | 1 | 1 tick |
    | `policy-card-commit` | `handlePolicyCardCommit` | `ruleBook` + `ruleBookHash` | 1 | 1 tick |
    | `shed-load` | `handleShedLoad` | events-only (DIRECTIVE) | 1 | 2 ticks |
    | `communicate` | `handleCommunicate` | events-only | 1 | 2 ticks |
    | `toggle-speed` | `handleToggleSpeed` | events-only | 0 | 0 ticks |
    | `adjust-price` | `handleAdjustPrice` | `pricing` (override record, version++) | 1 | 1 tick (commit class, OD-24(a)) |

    `ruleBookHash` after a commit (M3): a deterministic FNV-1a-64 fold (the
    kernel's hash family) over the WHOLE book — cards code-unit-sorted by id,
    each contributing `id␀fingerprint` joined by ␁, the per-card fingerprint
    mirroring `digest.ts`'s absorb walk. It therefore describes the book, not
    the last payment: ≠ any single card's payload hash, and identical for the
    same book committed in any insertion order. `digestState` absorbs
    `ruleBookHash` (digest.ts), so every post-commit state hash moves with the
    fold — within a run only (chains never cross runs).

    **Drain before disconnect (§7.2 R54 — `config.drainPolicy`, opt-in).**
    Yanking a live link drops in-flight; draining means stop-new, let-finish,
    then safe-to-touch. OFF (the DEFAULT — plain pull stays law unless a host
    opts in, and policy-off runs digest byte-identically to the pre-drain
    engine, pinned by a 17-intent golden chain in
    `pipeline/__tests__/intent-door-drain.test.ts`) `disconnect-drain` deletes
    immediately, detail `pulled:<edge>`. ON, the verb executes in TWO phases
    with ZERO new state fields: phase 1 books the wire through the EXISTING
    occupancy law — the HAND TOKEN IS the pending-disconnect record
    (`busyCauseId` `drain:<edgeId>`, `busyUntilTick` = start + `drainTicks`,
    default 2; the BoardState/HandState wire shapes are a ratified contract and
    `digestState` already absorbs cause + stamp, so the promise is
    replay-visible for free); the edge stays PRESENT and routable mid-drain
    (in-flight is not dropped), the phase-1 event carries detail
    `drain-started:<edge>`, and re-use of the existing codes covers
    point-of-use collision: a second disconnect on the same cable refuses
    `edge-draining`, while re-plugs hit the ordinary `edge-exists` /
    `slot-occupied` law (a draining cable is NOT safe-to-touch until the pull
    lands). Phase 2 is a DOOR-INTERNAL continuation, never a fed input: at the
    top of every pass — BEFORE the entry schedule and BEFORE the release sweep
    that would erase the evidence — matured `drain:*` reservations pull their
    edge (board version++ per removal), emit an `intent-executed` event with
    causeId `drain:<edgeId>`, sentinel `intentSeq` −1 and detail
    `drained:<edgeId>`, and mint NO receipt; continuations therefore precede
    that tick's external intents in the due order (a same-tick re-connect sees
    the cable already free; a same-tick duplicate disconnect sees
    `unknown-edge`, not `edge-draining`). The scan reads STATE, not config: a
    drain that was started always completes even if the host flips the policy
    off mid-flight (the reservation is the promise). `occupancyTicks` for the
    verb is SUPERSEDED by `drainTicks` in drain mode; the hand frees exactly
    as the pull lands (no double hold).

    Refusal-reason census — 32 distinct machine codes, every one refusal-pinned
    in tests (`pipeline/__tests__/intent-door.test.ts` +
    `pipeline/__tests__/intent-door-drain.test.ts` +
    `pipeline/__tests__/intent-door-adjust-price.test.ts` + `src/__tests__/gate-g4.test.ts`;
    the four formerly-unpinned guards — `empty-node-id`, `empty-slot`,
    `bad-shed-order`, `empty-card-hash` — closed by the round-3 "census
    completeness" test). An `intent-refused` event carries the code with a
    `": <detail>"` rider EXCEPT the seven bare-code guards (`empty-node-id`,
    `empty-device-kind`, `empty-slot`, `power-needs-slot`, `empty-card-hash`,
    `empty-note`, `empty-target-id`), which emit the code alone (enumerated from
    `intent-door.ts` source); door-level `unsupported-verb-carrier` (legacy
    `verb`/`slider` carriers — until the policy lane maps rule actions onto
    door handlers), `hands-exhausted`, `stamped-in-future`; place-device
    `empty-node-id`, `node-exists`, `empty-device-kind`, `placement-rejected`
    (validator's reason verbatim); connect-ports `bad-relation`, `empty-slot`,
    `power-needs-slot`, `slot-only-for-power`, `unknown-node`, `self-edge`,
    `edge-exists`, `slot-occupied` (one supplier per socket), `power-cycle`
    (upstream-supplier walk — the feed graph is a TREE; a different-slot feed
    the other way is legal multi-PSU, never a cycle); disconnect-drain
    `unknown-edge`, `edge-draining` (drain mode — the cable already carries a
    live `drain:<edge>` reservation, §7.2 R54 above); configure-node `no-fields`, `bad-inspection-depth`,
    `bad-shed-order`, `unknown-node`; policy-card-commit `empty-card-hash`,
    `no-card-lookup`, `unknown-card-hash`, `card-id-collision`; shed-load
    `unknown-node`; communicate `empty-note`, `unknown-node` (target);
    toggle-speed `bad-speed` (must be 1|2|4); adjust-price `bad-target-kind`,
    `empty-target-id`, `invalid-price` (≤ 0 µ$ — fractional prices are
    unrepresentable: the bigint wire type THROWS structural garbage, Law 2),
    `bad-effective-minute`, `unknown-plan` (the `canAdjustPrice` host
    callback's reason verbatim — absent callback = structural sanity only).
    `unknown-node` is one code shared
    by four verbs.

    BoardState / HandState / PriceOverrideBook slices (types.ts, door-owned
    semantics): `board` is
    the pipeline-local structural embed of "what CAN happen" (§4.2 graph-is-map)
    — `{ version; edges: ReadonlyMap<EntityId, BoardEdgeRecord> }`, version
    bumps on every mutation (topology's memoization convention), digest sorts
    edges by id (Map insertion order NEVER read); `edges` read-onlyness is a
    TYPE-level guarantee — `Object.freeze` on a Map seals its properties, not
    its contents, and `ReadonlyMap` exists only at compile time; the runtime
    deep-freeze applies to the RECORDS, not Map contents, so writers replace
    the Map (the door never mutates it in place — pinned by the refusal-pass
    identity test, which is why there is no defensive copy either); `hands` is
    the action-economy
    ledger `{ capacity; tokens: readonly HandToken[] }` (§7.5: T0–1 staff = 1
    hand, T2 = 2 …); `pricing` is the OD-24(a) part-1 price-override book
    `{ version; overrides: ReadonlyMap<`<kind>:<id>`, PriceOverrideRecord> }` —
    state-neutral by design (nothing reads it yet; parts 2/3 of the pricing
    surface will). All three are OPTIONAL `GameState` fields: pre-door hosts
    compile and digest byte-identically (digest-switch law — `digest.ts`
    absorbs each only WHEN PRESENT); the door materializes `hands` lazily from
    `config.handCapacity ?? 1` and `pricing` lazily on the first executing
    adjust-price.

    Decoupling law: the pipeline NEVER imports `topology/`. connect/disconnect
    re-enforce topology's structural invariants (self-edge, slot double-feed,
    power-tree cycle) WITHOUT the dependency, mirroring `defaultEdgeId` so
    hosts correlate the two views; `BoardRelation` is the id-space twin of
    topology's `EdgeKind`. Host-side knowledge (palette membership,
    needs/provides, U-space, power fit) enters ONLY through the
    `canPlaceDevice` callback (`PlaceDeviceQuery` in → `PlacementRejection |
    null` out); price-target resolution (plan/catalog existence, ownership
    shape, floors) enters ONLY through the OD-24(a) twin `canAdjustPrice`
    (`AdjustPriceQuery` in → `PriceTargetRejection |
    null` out); Policy Book cards enter ONLY through `lookupPolicyCard(hash)`
    — payloads reference ids and plain strings, embedded objects are illegal
    (Law 2).

    v0 seams (reported, deliberate): `disconnect-drain`'s PLAIN PULL remains the
    DEFAULT law — graceful drain (§7.2 R54) now SHIPS as the opt-in
    `config.drainPolicy` two-phase choreography above (stop-new via the hand
    reservation, safe-to-touch pull via the door-internal continuation), still
    without touching the serve step's slot ledger, which the door does not own;
    the full in-flight evacuation of live requests awaits that ledger's seam.
    shed-load and
    toggle-speed are ADVISORY-ONLY (the door records the directive as an
    `intent-executed` event — step 5's shed logic and the host clock scaler
    are the actors); §7.5 "duration vs attendance" is COLLAPSED to one
    occupancy window (the unattended-job split, e.g. RAID 19 h / 0 hands,
    awaits the receipt-engine twist). adjust-price is
    PART 1 of the OD-24(a) FULL PRICING SURFACE (owner ruling 2026-10-09b):
    the door validates the order and writes the `pricing` book — STATE-NEUTRAL,
    nothing consumes it yet; revenue math, elasticity response and the pricing
    dials/HUD are the queued parts 2/3, which read `GameState.pricing` (codec
    `parsePriceOverrideKey`) and consume `intent-executed` events with verb
    `adjust-price`, and may widen `canAdjustPrice` hosts — never the door's job.

---

## How to build a gate slice (§9.13 / §7.13 G1 seed pattern)

The composition recipe is `src/__tests__/integration-smoke.test.ts` (5 tests
green). Gate builders SHOULD copy this skeleton verbatim-structurally and
swap in their own scenario. Rules extracted from the working file:

1. **Import from the barrel only.** `from "../index.ts"` — no deep imports,
   no test-private helpers from other lanes. (`save/` now ships through both
   the root barrel and `@hh/sim-core/save` — prefer the subpath for lineage
   slices; note the root renames save's codec quartet to `save*` aliases.)
2. **Your state is a composite.** Wrap what the lanes give you:
   `interface RunState { game: GameState; econ: EconomyState;
   observedDigest: string; … }` — anything you need byte-reproducible goes in
   (note: the observed store's `digest()` rides INSIDE the digested composite
   so observed truth replays too, not just ground truth).
3. **Mint every mutable thing inside `simulate(seed, initial, targetTick)`:**
   `createDefaultSlots(config)` (+ slot swap via spread —
   `{ ...createDefaultSlots(config), rulePhase: createRulePhaseStep().step }`),
   `createTickDriver(slots, streamFor(seed, "root", 0), clocks)`,
   `new ObservedStore()`. This is what makes the SimRunner purity law hold
   *by construction*.
4. **Waves first, then ticks.** `parseWaveTable(raw)` → `planWave(table, n, {
   startMinute, tick, rng: waveStream(seed, n, m), director,
   ledger: ledgerSnapshot([], 0n), invitations: buildInvitations({}),
    entropyForecastPurchased, pressureParams })`. `resolveActiveSheet()`
    resolves to ratified sheet B since OD-2 settled (2026-10-09) — explicit
    `pressureParams` (legal per `WavePlanInput`) remain the override for
    A/B/C fork experiments. Apply the director's
   `directorPropose` draw BEFORE planning (it's a logged input, not a
   mid-wave surprise).
5. **Per-tick loop:** assemble `TickInputs` (frozen envelopes slice while the
   wave window is open), `driver.advance(game, inputs)` → new `game` +
   `events`/`ruleFirings`/`intents`/`pressure`. Then the step-12 handshake:
   derive `ObservedWrite[]` FROM REAL driver output (arrival counts, terminal
   outcomes — never synthetic constants if a real signal exists), push through
   `store.applyObservedWrites(writes, game.context.clocks.simUs)`, and merge
   `store.toObservedMap()` into `game.observed`. Then `runEconomyTick({
   context, runSeed, contracts: game.contracts, prior: econ, cfg })`.
6. **Prime economy explicitly:** `registerContractEconomy(emptyEconomyState(),
   { contract, atBusinessMin: 0, clauseRefs: [], grandfather: null,
   revenueTags: NEUTRAL_REVENUE_TAGS, commitmentBps }, cfg)` — the tick has an
   auto-priming guard, but prime on purpose.
7. **Prove interlock, not wiring.** The smoke asserts: units arrived (waves →
   arrival slot), the rule ACTUALLY FIRED off observed cells written via the
   store (`firings > 0` — the CPU threshold crossing is caused by cumulative
   real arrivals), digests moved from origin.
8. **Close with the harness gates:**
   `createHarness({ runner, initialState, runSeed, engineVersion,
   contentHashes, totalTicks, snapshotEveryTicks, checkpointEveryTicks,
   directorDraws })` then assert `verify().ok`, `replayDigests(100)` collapses
   to ONE digest equal to `canonicalDigest(reference)`, an independent second
   harness (fresh closures) agrees, and a different `asRunSeed` DIVERGES the
   final digest while the same seed reproduces it (seed sensitivity).
9. **Freeze everything you pass in** (`Object.freeze` ids, cells, configs) —
   the lanes trust frozen data; extension objects ride on the documented
   `*Ext` inputs.

```
waves.planWave ─► TickInputs.envelopes ─► pipeline.createTickDriver ─► TickResult
        ▲ (director draw = logged input)          │ events / firings / intents
        │                                         ▼
   ledgerSnapshot ◄─ build log        observed.ObservedStore.applyObservedWrites  (step-12 gate)
                                                  │ toObservedMap() merged into GameState.observed
                                                  ▼
                            policy.createRulePhaseStep (slot 12.5, reads observed only)
                                                  ▼
                            economy.runEconomyTick (slot 12 settlement, sorted contracts)
                                                  ▼
                            replay.createHarness { runner, digest }  ─► ×100 gate + verify + seed sensitivity
```

---

## Drift log — `docs/CONVENTIONS.md` (and lane comments) vs reality

Found while verifying this reference on 2026-10-06. Items 1–3 were FIXED the
same day by the docs-sync lane (CONVENTIONS.md is in its remit); items 4–6
remain reported-only — hand to the owning lanes:

1. ~~**`save/` absent from the module map.**~~ — FIXED 2026-10-06 (docs-sync):
   CONVENTIONS §1 tree and §1.1 table gained the `save` row (THE LONG SAVE —
   envelopes, lineage, write-guard matrix, modes). (Was: `src/save/` is the
   tenth SHIPPED lane — exports entry + root re-export landed 2026-10-06,
   mid-audit.)
2. ~~**"zod" is not what the loader is.**~~ — FIXED 2026-10-06 (docs-sync):
   all four stale "zod" mentions in CONVENTIONS (§1 tree, §1.1 loader row, §3
   CI row, §4 policy-card row) now say hand-rolled strict parser, no zod
   dependency. (`zod` appears in NO package.json — re-verified this pass;
   behavior always matched the intent, only the tool name was stale.)
3. ~~**"blast radius = BFS over the *observed* graph" (§1.1 topology row).**~~
   — FIXED 2026-10-06 (docs-sync): the row now reads "flood over
   `TopologyGraph` + `DomainSet` (the TWO-LAYER LAW meeting in `blast.ts`)",
   matching `topology/blast.ts`, which never references the observed layer.
4. **economy barrel comment is stale.** `economy/index.ts` says the package
   root "deliberately does NOT re-export this module", but `src/index.ts`
   DOES star-export `./economy/index.ts` (and disambiguates its
   `TuningSheet`). Comment vs code — integrator lane's call which way to fix.
5. ~~**`save/index.ts` breaks the resolution law**~~ — RESOLVED at landing:
   the barrel now uses explicit `.ts` specifiers like every other lane.
   Residual rename to watch: root ships save's codec quartet only as
   `saveCompareCodeUnits/saveFail/saveFnv1a64Hex/saveRequireDefined`; the
   flat names are replay's.
6. **Headless CLI needs a flag the root README flow doesn't mention:** `node
   --experimental-transform-types` (enum in `types.ts` forces it) — matches
   its own package scripts; just be aware when copying commands.
 7. ~~**Proto friction #1 is CLOSED but the proto comment is stale (DOCS-SYNC-2
    pass).**~~ — SUPERSEDED (round-3): the rewire LANDED @1b9b3ba —
    `simCoreRunner.submit()` now feeds `TickInputs.externalIntents` (verbs
    stamped `tick+1`, fed exactly once) and folds `doorReceipts` into notices;
    the "no legal input door" comment is gone from the file. Pinned by
    `src/__tests__/simCoreRunner.test.ts` ("intent-door wiring" block). See
    MODULE-STATUS "Proto adoption LANDED" row. The intent door
    (`TickInputs.externalIntents` + `applyIntentDoor`) had landed 2026-10-06;
    the then-stale buffer-and-comment state this item recorded no longer
    exists. Also
    residual stale wording OUTSIDE editable remit here: `docs/GLOSSARY.md`
   "blast radius / Big Red Button" row still says "BFS over the *observed*
   graph" (item 3 fixed CONVENTIONS only; GLOSSARY is additive-rows-only for
   this lane — hand to its owner).

All other CONVENTIONS claims checked today — CI runs `pnpm -r typecheck` +
`pnpm -r test` (§3 ✅), vitest-only tests (§3 ✅), policy no-RNG law (§4 ✅,
enforced by the evaluator itself), determinism prohibitions (§4) hold in
every lane header reviewed.
