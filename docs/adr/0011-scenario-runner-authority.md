# ADR-0011 — The committed inline-TS scenario API is the single scenario authority; the paused JSON-schema lane's debris is removed and its two seed scenarios are salvaged inline

## Status
**Accepted (2026-10-13)** — owner instruction after the two-lane collision:
adjudicate and complete, not rewrite. The committed API (10f1d36) stands as
canonical; the untracked debris is deleted; the seeds are salvaged.

## Context

Two lanes were dispatched against `packages/sim-core/src/scenario/` in the same
window (2026-10-11/13):

1. **The committed lane** shipped at 10f1d36 — `scenario/{doc,objectives,runner,
   scenarios,index}.ts`, 39 exports, 73 tests, three inline §1.5 scenarios
   (`The Long Weekend` :3646 win@240, `Deadbeat Quarter` :3790 win@300,
   `The Angry Whale` :3408 win@200), each proven losable by flipping ONE wire
   field, ×100 byte-identical determinism, full battery green (serial
   1,965 · api-verify 1,529 · ci-verify 5/5).
2. **A paused lane** (halted by the owner mid-collision) left untracked debris:
   `scenario/parse.ts` (a JSON-schema data-driven parser, 2 TypeScript errors),
   `scenario/vocab.ts` (its predicate/guard/traffic vocabularies), and two seed
   mission files `packages/content/scenarios/{collections-week,metastable}.scenario.json`.
   The committed `tsconfig.check.json` excludes the two orphan sources, but the
   package-wide `tsc --noEmit` sweep does not — `pnpm -r typecheck` was RED
   (rc=1, both errors in parse.ts) purely because of this debris.

**Letter-of-mission deviation (recorded honestly):** the committed brief asked
for a runner that COMPOSES `runUnattended`; the shipped `runner.ts` instead
carries its own driver loop with a money lane that mirrors `fastForward.ts`
(settle-refusal law duplicated, source-pinned by test against the original).
Its substance is richer where it counts — mid-tick objective evaluation with
Q16.16 progress, µ$ on the wire as strings, a closed 10-predicate vocabulary,
terminal-order guard→lose→win — and it is battery-green. The deviation is
therefore kept as a gap row (MODULE-STATUS "scenario-runner-consolidation"),
not undone.

## Decision

1. **Canonical:** the committed inline-TS API (`hh-scenario@1` wire objects in
   `scenarios.ts`, parsed through `parseScenarioDoc` at import). Scenario data
   that ships is TypeScript; external JSON authors cross the same wall later.
2. **Deleted (untracked, superseded):**
   - `scenario/parse.ts` — its role (validate foreign JSON) is fully covered by
     `doc.ts`'s closed-record wall (`scenario[CODE] at 'path'` grammar, unknown
     key = refusal). The 2 type errors were repo-wide blockers.
   - `scenario/vocab.ts` — its guard vocabulary survived INTO the committed API
     (`limits.guardrails` → the unattended 6-kind/5-metric closed passthrough);
     its notice-mirror and traffic-profile concepts are covered by the 10
     objective predicates + segments. Nothing unique remains.
   - `scenario/schema/scenario.schema.json` — referenced by the collision
     report; it was destroyed in the clobber war before this adjudication ever
     saw it (verified: never present at 10f1d36, absent from disk). Nothing to
     salvage.
   - The two seed JSONs (verbatim below) after salvage into inline scenarios.
3. **Salvaged:** both seed missions ship as inline scenarios —
   `collections-week` (§1.5 :3778) and `metastable` (§1.5 :4076) — see
   "Salvage outcomes".
4. **Rejected (deferred, not discarded):** JSON-schema data-driven scenarios
   (`hh-scenario-file@1` loading from `packages/content/scenarios/`) are
   deferred to the content lane. If/when external authors need file-based
   missions, `parseScenarioDoc` already accepts exactly the wire shape
   `scenarios.ts` uses — a loader is additive, and the seeds below are its
   first test corpus.

## Salvage outcomes (probed against the committed engine, not assumed)

### Collections Week — SHIPPED (`collectionsWeekDoc`, id `collections-week`)

Seed design: six hourly accounts, two auto-renew anchors; win = survive +
first invoice settled; lose = churn-collapse after the ~tick-252 cliffs;
horizon 520. Probe truths that forced honest re-tuning:

- The committed engine settles **hourly** invoices from t≈1 (~1,500 settled by
  t240), not "first settle ~214" (that was a 15-day-net-terms assumption the
  engine does not implement).
- Cliff dice cannot be forced to walk the whole book out: `autoRenew: false`
  rolls the retention matrix (55–85 %); best-case all-lapse probability per run
  is ~45 % — a deterministic "lose at the cliffs" is not expressible.
- The dunning ladder writes failing accounts off by ~t312; churn-collapse via
  the cliffs lands at t351–379 **seed-dependently** — not one-flip probeable.

Shipped shape: 240-min clock; win = survive-minutes 240 + invoices-settled 1 +
no-death-cause any (PROVEN `win@240` on seed offsets 0/1/2); the dice drama
(0/2/1 small-account walk-outs per offset) rides `observation.churnedCustomers`
and the notice trace. Lose flip = `contracts: []` →
`lose:death-by-cause:churn-collapse@44` on every offset (clock-bound sustain
wall, 42 sim-min ≈ 3 business days). Falsifiable pins: `settledInvoices ≥
1000` kills the net-terms assumption; exact churn counts `[0, 2, 1]`.

### Metastable — SHIPPED (`metastableDoc`, id `metastable`)

Seed design: 8 slots / 20 s service / ρ .83 baseline with a 4× surge at
minutes 30–36; win = survive 240; lose = `cascadeCollapse` guard
(degradedPct>50 sustained 10); seed-divergent fates. Probe truth:

- **Slots are per-minute admission counts** (≤1 unit per slot per tick), so 8
  slots cap throughput at 8/min regardless of serviceTimeUs — and an offered
  load of 6.64/min (ρ .83) pins occupancy near 100 % in the CALM minutes too,
  so the literal seed shape loses the calm control at guard-10 as well.
- Recalibrated honestly: baseline 4/min (ρ .50), segments
  `{0→4},{30→16},{33→4}` — a ×4 surge for three minutes. The traffic
  **segments seam was enough**: an open-and-close storm window needs no
  waves-corpus `tableId` (that seam remains owed only for ramp shapes,
  telegraphs, and dominant-family labels from a shipped table file).

Shipped shape: win = survive-minutes 240 (PROVEN `win@240` on offsets 0–14);
lose flip = ONE field, `segments[2].fromMinute 33→36` (surge runs three minutes
longer) → `guard:cascadeCollapse@39` on offsets 0–14 (backlog + retries lock
ρ = 1.0 past the sustained wall; bounce/retry accumulation ≥ 10 vs ≤ 5 in the
win arm — the §1.5 "retries sustain it" premise, pinned as a discriminating
pair). The metastable BAND itself is pinned too: an intermediate arm
(5 base / 10 surge / 6 min) is genuinely seed-divergent — 9 wins, 6 cascades
across offsets 0–14 — "some nights drain, some nights lock in" is engine truth,
not flavor text. The §1.5 ANSWER (shed below the recovery threshold) needs the
player door seam the seed itself deferred to v1.

## Consequences

- `pnpm -r typecheck` returns to 5/5 (rc=0): the two orphan sources are gone.
- The scenario library is five missions, 41 exports; api-verify rows updated.
- Gap rows recorded in MODULE-STATUS: **scenario-runner-consolidation**
  (runner.ts duplicates the fastForward money-lane loop behind a source-pinned
  mirror — a shared home is the consolidation candidate; owner-aware) and
  **waves-tableId corpus seam** (traffic segments ship surge windows; named
  corpus tables with ramps/telegraphs/families remain un-consumed by scenario).
- The seed JSONs (Appendix A) are the content lane's first corpus when a file
  loader is authorized; nothing is lost by the deletion.

## Appendix A — the seed files, verbatim (deleted from disk; preserved here)

### `packages/content/scenarios/collections-week.scenario.json`

```json
{
  "schemaVersion": 1,
  "id": "scenario:collections-week",
  "title": "Collections Week",
  "archetype": "Negotiate",
  "specRef": "Collections Week",
  "era": 2026,
  "hostingType": "shared-web",
  "brief": "Six figures of aged receivables and a decision tree per account. Suspend a big delinquent customer and you will never be paid; keep them alive and the dunning ladder does its quiet work.",
  "initial": {
    "board": {
      "nodes": [
        { "id": "web-1", "slots": 400, "serviceTimeUs": 2000000 }
      ]
    },
    "cash": { "freeMicroUsd": 5000000000 },
    "contracts": [
      { "id": "c-01", "bundleId": "shared-web", "mrcMicroUsd": 250000000, "billingCycle": "hourly", "termEndMin": 25920, "sla": { "uptimeTargetPct": 99.9, "autoRenew": true } },
      { "id": "c-02", "bundleId": "shared-web", "mrcMicroUsd": 120000000, "billingCycle": "hourly", "termEndMin": 28080, "sla": { "uptimeTargetPct": 99.9, "autoRenew": true } },
      { "id": "c-03", "bundleId": "shared-web", "mrcMicroUsd": 60000000, "billingCycle": "hourly", "termEndMin": 25920, "sla": { "uptimeTargetPct": 99.5, "autoRenew": false } },
      { "id": "c-04", "bundleId": "shared-web", "mrcMicroUsd": 45000000, "billingCycle": "hourly", "termEndMin": 25920, "sla": { "uptimeTargetPct": 99.5, "autoRenew": false } },
      { "id": "c-05", "bundleId": "shared-web", "mrcMicroUsd": 30000000, "billingCycle": "hourly", "termEndMin": 25920, "sla": { "uptimeTargetPct": 99, "autoRenew": false } },
      { "id": "c-06", "bundleId": "shared-web", "mrcMicroUsd": 10000000, "billingCycle": "hourly", "termEndMin": 25920, "sla": { "uptimeTargetPct": 99, "autoRenew": false } }
    ]
  },
  "traffic": { "profile": "diurnal", "levelPerMin": 8 },
  "seedPolicy": { "mode": "host" },
  "objectives": {
    "win": [
      { "via": "survive" },
      { "via": "notice", "kind": "invoice-paid", "gte": 1 }
    ],
    "lose": [
      { "via": "death", "cause": "churn-collapse" },
      { "via": "guard", "guard": { "type": "totalOutage", "sustainedMin": 30 } }
    ]
  },
  "duration": { "maxSimMinutes": 520, "businessMinutes": 25920 },
  "modifiers": [],
  "_provenance": {
    "specRef": "hosting_game.md §1.5 'Collections Week'",
    "engine": "v0 lowering onto runUnattended: hourly billing + seeded payment-failure dice + the dunning ladder's invoice-paid stream; the cliff renewals are the only decision the seeded dice make. The §1.5 per-account decision tree (payment plans, calls, suspension choices) is player input and NOT wired in v0 — no hands/door seam in the weekend runner; win/lose arms ride the seeded cliff of the two auto-renew accounts.",
    "notes": "termEndMin 25920 = 18 business days (1440 biz-min/day); churn-collapse needs the book under the floor (1) sustained three business days — horizon 520 ticks ≈ 53k biz-min ≈ 37 days leaves that margin after the ~tick-252 cliffs. First invoice settles ~tick 214 (15-day net terms on the hourly cycle)."
  }
}
```

### `packages/content/scenarios/metastable.scenario.json`

```json
{
  "schemaVersion": 1,
  "id": "scenario:metastable",
  "title": "Metastable",
  "archetype": "Diagnose",
  "specRef": "Metastable",
  "era": 2026,
  "hostingType": "shared-web",
  "brief": "The trigger went away and the system is still broken. A six-minute surge leaves a backlog whose own retries re-stoke it — some nights the queue drains itself, some nights the degradation locks in and never lets go.",
  "initial": {
    "board": {
      "nodes": [
        { "id": "web-1", "slots": 8, "serviceTimeUs": 20000000 }
      ]
    }
  },
  "traffic": {
    "profile": "storm",
    "levelPerMin": 20,
    "surge": { "fromMinute": 30, "minutes": 6, "multiplierPct": 400 }
  },
  "seedPolicy": { "mode": "host" },
  "objectives": {
    "win": [
      { "via": "survive" }
    ],
    "lose": [
      { "via": "guard", "guard": { "type": "cascadeCollapse", "degradedPctGt": 50, "sustainedMin": 10 } }
    ]
  },
  "duration": { "maxSimMinutes": 240 },
  "modifiers": [],
  "_provenance": {
    "specRef": "hosting_game.md §1.5 'Metastable'",
    "engine": "v0 lowering onto runUnattendedWithSurge: baseline 20/min vs 24/min capacity (rho .83), a 4x six-minute trigger REMOVED at minute 36, and the engine's default retry posture (120-min patience, bounded retries). Whether the surge decays or the retries self-stoke is pure seeded dice — the metastable question, asked of the real queueing engine. cascadeCollapse (node rho past the degradation floor, sustained) is the locked-in state; surviving to the horizon is the decay.",
    "notes": "The §1.5 answer — deliberately shedding load BELOW the recovery threshold — needs the player's shed verb (hands + door), unwired in the weekend runner (v1). v0 proves the PHENOMENON is expressible and seed-divergent, both arms."
  }
}
```
