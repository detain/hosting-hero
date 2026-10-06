# MODULE STATUS — sim-core build lines, current green counts, known gaps

**Snapshot date:** 2026-10-06. Test counts are LIVE numbers obtained by running
`npx vitest run src/<module>` per directory in `packages/sim-core` (plus
`vitest run` in `tools/headless`) on this date — not copied from workstream reports.
Gaps are harvested from the code itself: `grep` for `PROVISIONAL`, `TODO`, `OD-<n>`,
`PENDING`, `FOLLOW-UP`, `_todo` in non-test sources. Citations: `§` =
`reports/MASTER_REPORT.md`; `hosting_game.md §` = design doc; OD-n =
`docs/DECISIONS-PENDING.md`.

| Lane | Module (path) | src files | test files | Tests (2026-10-06) | Status |
|---|---|---|---|---|---|
| kernel | `src/kernel/` (5: fixed, limbs, rng, rng-reference, time) | 5 | 6 | **60 passed** | GREEN — limb-split splitmix64 rng + oracle/golden tests landed (55→60) |
| pipeline | `src/pipeline/` (8 incl. barrel + `intent-door.ts`; `internal.ts` private) | 8 | 11 | **87 passed** | GREEN — INTENT-DOOR contract landed 2026-10-06 (door + hands/board slices, digest-composite absorption, ×100 schedule determinism); see API-REFERENCE contract #10 |
| observed | `src/observed/` (4 incl. barrel) | 4 | 5 | **113 passed** | GREEN — FIX-4 composite-cell fold shipped (CANONICAL_CELL_PREFIX family) |
| policy | `src/policy/` (7 incl. barrel) | 7 | 6 | **54 passed** | GREEN — P1/P3/P4/P7 fixer-lane additions landed (FireLog cons-journal, deferred consults, bounded cycle scan, strict key parse) |
| economy | `src/economy/` (15 incl. barrel) | 15 | 10 | **134 passed** | GREEN — E-9 WeekRefund anchoring landed |
| topology | `src/topology/` (9 incl. barrel) | 9 | 1 | **45 passed** | GREEN (thin test-file count vs 99-export surface; `projectionVersion` T-1 stamp landed; round-2 fixes: total-order feeds, path caps, sorted MIS) |
| waves | `src/waves/` (11 incl. barrel) | 11 | 9 | **110 passed** | GREEN — fix wave landed (duplicate-threatId parse pin, `mulDivRound` par% spend, exact zero-findings pins on g1 slices) |
| replay | `src/replay/` (8 incl. barrel) | 8 | 6 | **69 passed** | GREEN — fix wave landed (canonical depth cap 512, −0 normalization at encode, snapshot⊆ring hash inclusion, stateEncoding preservation) |
| loader | `src/loader/` (8 incl. barrel) | 8 | 6 | **83 passed** | GREEN — round-2 landed (per-type CHANGED_HOOKS baseline vs anchor, sparse-slot tripwire, wave `type` back-link check, corpus determinism ×100 arm) |
| save | `src/save/` (10 incl. barrel) | 10 | 3 | **102 passed** | GREEN — shipped via `@hh/sim-core/save` + root barrel (landed mid-audit 2026-10-06); test fan-out 1→3 files since |
| integrator | `src/__tests__/integration-smoke.test.ts` (G1 seed) | 1 | 1 | **5 passed** | GREEN |
| content | `packages/content/` (data-only JSON) | 7 JSON files | — (validated through `loader` `real-content.test.ts` + `waves` `content.test.ts` inspector) | included in the two rows above | GREEN |
| headless | `tools/headless/` (`headless-tools`) | 11 src | 4 (`test/`) | **38 passed** | GREEN — RISK-1 dual-runtime parity gate |

**sim-core total: 862 tests green** (857 module + 5 integration smoke — live
per-directory re-count 2026-10-06, DOCS-SYNC-2 pass; sums verified against the
full package run) · headless: 38 · proto: 187.
The waves/replay fix waves and the loader round-2 fixes have LANDED — the
counts above are current, no longer provisional.
Scoped typecheck (`tsc -p src/<mod>/tsconfig.check.json`) exists for kernel,
pipeline, replay, loader, save, waves; the other lanes typecheck via
`pnpm -r typecheck` (CI: `pnpm -r typecheck` + `pnpm -r test`).

---

## Known gaps per module (from the module's own NOTES/comments) — and who owns the follow-up

| Module | Gap (as the code states it) | Marker in source | Follow-up owner |
|---|---|---|---|
| kernel | `BUSINESS_SCALE_DEFAULT` ratio pending **OD-2/D-1** ("flip this ONE constant when the owner settles it"; the Sheet-B 4-min contradiction is OD-2's) | `time.ts:66`, `fixed.ts:12` (OD-5(b) dual-runtime parity) | **Owner** (OD-2) → kernel lane flips |
| kernel | No barrel inside `kernel/` — root entry `src/kernel.ts` is integrator-owned; if kernel grows its own `index.ts`, repoint `./kernel` and delete `kernel.ts` | `src/kernel.ts` header | kernel lane (barrel), integrator (repoint) |
| pipeline | Driver cross-tick memory (re-entry schedule, mint counter, retry depths) lives OUTSIDE `GameState`; export/import hooks are a stopgap "until types.ts grows a GameState slot for it (friction reported)" | `driver.ts:19-20` | integrator / types.ts lane |
| pipeline | Queue knee `DEFAULT_KNEE_RHO = 0.7` is R-07 default; final knee value belongs to **OD-2** tuning sheet (callers can pass `kneeRho`) | `queue.ts:8,25`, `driver.ts:93` | Owner (OD-2) |
| pipeline | Contract deviations worked around in defaults (each documented): `PatienceCheckIn` has no rng; `ServeOut` has no units; `BackpressureIn` gets driver-attached extension fields; step 5→8 hold uses the `UNIT_HOLD` mutable side-table (cleared every tick) | `defaults.ts:11-22` | pipeline lane; contract change would need types.ts (integrator) |
| observed | Day-1 stub discipline: ONE `observedView` code path for every consumer kind; per-seat salience/aggregate pruning (wire granularity, §8 RISK-6) layers later without signature change | `view.ts:18-21` | observed lane; MP relevance gated on **OD-5** |
| policy | Grammar is a frozen spec artifact pending **OD-4d** ratification batch; temporal-semantics interpretations "logged as decision requests" in evaluator header | evaluator.ts header; CONVENTIONS §4 | Owner (OD-4 batch) + policy lane |
| economy | **OD-1 OPEN**: no scorecard selected — `getActiveScorecard` THROWS until the owner picks; conversion/convergent weights are PROVISIONAL mirrors (`scoring.ts:107,120`) | `scoring.ts` | **Owner** (OD-1) |
| economy | ~40 `PROVISIONAL` config constants (`config.ts:250-323` inventory: dunning day-splits, churn bps, error-budget action costs, AR tray midpoints, spiral streaks…) — "no doc figure; placeholder that must be tuned (OD list)" | `config.ts:10-13` | Owner tuning pass (OD-2 family) → economy lane |
| economy | `TuningSheet` union-name clash with waves' `TuningSheet` interface; root alias `EconomyTuningSheetId` is temporary: "FOLLOW-UP for the economy owner: rename its type to `TuningSheetId` and this alias dies" | `src/index.ts:38-46` | **economy lane** |
| economy | Barrel comment claims root `src/index.ts` "deliberately does NOT re-export this module" — the root barrel DOES star-export it (see Drift report in API-REFERENCE). **Code-side comment — docs lane flags, does not edit** | `economy/index.ts:4-6` | integrator/docs lanes |
| topology | Only marker is the T-9 owner-decision block (row above). Audit risk: one 45-test file covers a 99-export surface; consider test fan-out | — (audit observation) | topology lane |
| waves | Tuning sheets A/B/C are **all PROVISIONAL** (`status:"PROVISIONAL"` on each); `ACTIVE_TUNING_SHEET: TuningSheetId \| null = null` — `resolveActiveSheet()` fail-fast throws until the owner ratifies (**OD-2**) | `pressure.ts:10,31,83-108` | **Owner** (OD-2) |
| waves | `content/waves/g1-shared-web-first-quarter.json` is foreign-authored; `inspectOfficialWaveJson` findings tracked read-only (never edit content from code lanes) | content.test.ts comments | content authoring lane |
| replay | No markers. SimRunner stays structurally injected; lane never imports siblings by law | `index.ts:8-10` | — |
| loader | Schema v1 not frozen — unknown-field policy is strict `UNKNOWN_FIELD` fail-loud; two blessed `economy` extensions declared explicitly pending freeze ("README 'Never invent numbers'", §4.3 risk 3) | `bundle.ts:15-18` | loader lane + content owners (v1 freeze) |
| loader | `_todo` collector reports content placeholders with criticality (14 `_todo` keys in g1 slices; 79 raw `"_todo"` occurrences across the 7 corpus JSON files) — backlog belongs to content authoring, engine-critical ones block gate slices | `todo.ts`, `loader/index.ts:3` | content authoring lane (critical-first triage) |
| save | SHIPPED as of mid-audit landing: `./save` in package exports + root star re-export; save's codec quartet (`compareCodeUnits`/`fail`/`fnv1a64Hex`/`requireDefined`) rides root aliases `save*` — FOLLOW-UP: shared canonical codec retires 4 aliases ("save-agent design call, not mechanical") | `src/index.ts` disambiguation header | save + replay lanes jointly |
| save | **OD-8 PENDING**: `WRITE_ACCESS_MATRIX` rows carry `status:"PENDING_OD8"` — **160 pending rows live in `save/modes.ts`** (5 non-campaign modes × 32 facets, built by `buildMatrix()`); `writeGuard()` THROWS naming OD-8 for every mode×facet except the LIVE carve-outs; rows hold the Option-B recommendation as data only | `modes.ts:2-18,145-152,163-185` | **Owner** (OD-8, "MOST URGENT" per register) |
| save | Runbook MTTR bonus is pure DATA — decay formula is OD-2 tuning, intentionally not computed here | `node.ts:398-400` | Owner (OD-2) + save lane |
| save | `Dict` (wire record type) is module-private yet appears in public signatures (`saveFileToWire`, `planSaveMigration`, `commitAtomicWrite`, `readSave`); structurally usable, nominally unnameable by consumers | envelope/lineage/node `type Dict` | save lane |
| save | Single monolithic test file (`save.test.ts`) for a 10-file module | — (audit observation) | save lane |
| content | Data-only by law (§4.3 R77). 7 JSON files; `schema/type-bundle.schema.json` is the authored contract the loader parses against (hand-rolled parser — NOT zod, see drift note) | — | content authoring lane |
| headless | CLI requires `node --experimental-transform-types` (enum in types.ts forces the flag); swap points `src/sim-core.ts` (relative `.ts` imports until subpath exports land) and `src/slots.ts` (stub-v1 → `createDefaultSlots`) | headless headers | headless lane + integrator |
| policy | **Q-P3-1 OWNER QUESTION**: Kill Switch (R18) freezing behaviour is a P3 *defensive reading* — the shipped code PRESERVES pending consults and STOPS their TTL clock while frozen (verdicts mid-freeze recorded, intents held). The rejected alternative reading (expiry keeps running ⇒ frozen consults die unanswered) throws away player agency. Awaiting owner ratification of which reading is law | `evaluator.ts:243,539` | **Owner** (Q-P3-1) → policy lane |
| topology | **T-9 OWNER QUESTION** (formally logged in code as `OWNER-DECISION REQUESTED (T-9)`): `rackDomains` ships `deathModel: "kill-all"` (option a) although this file's header exemplar for shared capacity ("the rack's cooling sags ⇒ members wobble, they don't die") describes DEGRADE_ALL (option b). Sub-question the decision must answer: rack ANCHORS are not members (placements only), so directly killing a rack node currently enumerates no rack domain under either option. Pinned by test "PINS rack deathModel = kill-all and its exact blast reading today" — "Do not silently flip" | `domains.ts:93-113`; `GLOSSARY.md:13` (third model `SHARED_CAPACITY` unimplemented) | **Owner** (T-9) → topology lane |
| pipeline / intent-door | **Proto adoption pending (old friction #1, contract gap RESOLVED):** the door itself landed 2026-10-06 — `TickInputs.externalIntents` + `applyIntentDoor` + `TickDriverOptions.intents` are live (API-REFERENCE contract #10) — but `apps/proto/src/runner/simCoreRunner.ts` still buffers player verbs and comments "no legal input door"; its `submit()` should feed `externalIntents` per tick | `apps/proto/src/runner/simCoreRunner.ts:356-361` | proto lane (rewire) |
| pipeline / intent-door | **Drain choreography seam:** `disconnect-drain` v0 is a PLAIN PULL — graceful drain (evacuate in-flight before unlink) binds to the serve step's slot ledger, which the door deliberately does not own ("never implicit") | `intent-door.ts:450-451` | pipeline + integrator (drain scheduler) |
| pipeline / intent-door | **Shed-load / toggle-speed are ADVISORY-ONLY:** the door records the directive as an `intent-executed` event; actual shedding is step-5 discipline logic and speed gating is host clock-scaling (observation, never physics, §7.5) | `intent-door.ts:502-504,518-524` | step-5 consumers / host lane wiring |
| pipeline / intent-door | **Rule-carrier verbs refused:** `policy/evaluator.ts` mints `{kind:"verb", PolicyActionId\|"run-runbook:NAME"}` intents the door refuses with `unsupported-verb-carrier` until the policy lane maps rule actions onto door handlers (the ten PolicyActionIds are deliberately outside the closed `PlayerVerb` enum) | `types.ts:1166-1173`, `intent-door.ts:577-579` | policy lane |
| pipeline / intent-door | **Hands-vs-executive-attention (OD-6)** still owner-open: the door implements §7.5 hands as capacity+tokens (default `handCapacity` 1; hosts SHOULD seed via `createInitialState`); the Two-Denominations recommendation would land as door/host config, not a rewrite. Related v0 collapse: "duration vs attendance" is ONE occupancy window (unattended jobs, e.g. RAID 19 h / 0 hands, need the receipt-engine scheduler the door doesn't own) | `intent-door.ts:105-107,126-130`; `DECISIONS-PENDING.md:53` | **Owner** (OD-6) → pipeline/host lanes |
| CI | **Node 20.x matrix tension:** root `engines ">=22"` + `headless-tools ">=22.18"` conflict with the `verify` matrix's 20.x arm; headless tests run 22.x-only (20.x uses `--filter '!headless-tools'`), and the canary contract-step gate is pinned `matrix.node == '22.x'`. True 20.x support would need owners to change engines/guards | `.github/workflows/ci.yml:47,66,74`; `.github/workflows/README.md:16,20` | **Owner** (engines policy) → CI lane |

---

## Gate-slice readiness (per §7.13 / §9.13 prototype gates)

- **G1 seed exists**: `src/__tests__/integration-smoke.test.ts` interlocks
  waves → pipeline → observed → policy → economy → replay under
  `replay.createHarness` with ×100 digest identity + seed sensitivity. Copy
  its composition pattern (documented in `docs/API-REFERENCE.md` §"How to
  build a gate slice").
- **Blockers for full G1 calibration**: OD-2 (tuning sheet — `resolveActiveSheet()`
  throws; smoke sidesteps legally via `WavePlanInput.pressureParams`),
  OD-1 (score screen; G5), OD-8 (mode writes; WS-6/WS-8 saves).
- **save is now package-visible** (`@hh/sim-core/save` + root barrel, landed
  2026-10-06 mid-audit) — gate builders may compose lineage/Long-Save slices
  from the barrel; remember root renames save's codec quartet to `save*`.
