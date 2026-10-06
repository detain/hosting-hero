# packages/content — Type Bundles & Registries (CONTENT agent)

Data-only hosting-type definitions for the hosting-hero sim. Source of truth:
`reports/MASTER_REPORT.md` Appendix A (verbatim type-bundle schema) +
`hosting_game.md` §0.2/§0.3/§1.3/§1.7/§1.9/§2.1/§2.12/§2.24/§2.26/§2.27/§3.1/§3.2/§3.3/§6.6/§8.10.

**No code lives here.** Engine-hook fields are closed enums / strings / numbers —
lookup keys into registries the engine (sim-core, a sibling workstream) owns.
The TypeScript types are GENERATED from `schema/type-bundle.schema.json`; this
directory ships JSON.

## Layout

```
schema/type-bundle.schema.json      JSON Schema draft 2020-12, faithful to Appendix A (21 required keys)
types/shared-web.json               anchor type 1 ("The Mass Host" / Cabinet 14) — density game
types/game-servers.json             anchor type 2 ("Prime Time") — G6 co-anchor: ms scale + permanent incident clock
waves/g1-shared-web-first-quarter.json  seeded wave slice for gates G1/G5
waves/g1-game-servers-first-quarter.json  seeded wave slice for gate G6 (same law set, type-specific DATA only)
threats/registry-core.json          16 mechanical threat entries (exactly the ids the two bundles reference)
visitors/archetypes-core.json       9 visitor archetypes (exactly the ids the two bundles reference)
script/validate.mjs                 Node-stdlib structural validator (no npm deps)
```

## Validate

```bash
node packages/content/script/validate.mjs   # exit 0 = green; prints _todo inventory
```

Checks: every JSON parses · bundles carry all 21 schema-required keys · ids unique
· every `signatureThreats`/`unlockedByBuildables` threat ref resolves in
`threats/registry-core.json` · every `visitor.archetypeRefs` resolves in
`visitors/archetypes-core.json` · every threat has ≥2 counters (§5.1 Second
Answer) drawn from the 9 defense roles · every object containing a `null` carries
a non-empty `"_todo"` (two declared exemptions below) · every `tuningSheet` value
matches `PROVISIONAL-[ABC]` · wave files re-check §1.7 authoring rules (≤4
entries/wave, first wave ≤40% par, trough ≥45% below peak, ≤2 primary roles
>30%, fresh role every 4th wave, hard waves draw ≥2 denominations, entries sum
to 100%, envelope `overWaves` resolve) · bundle `waveTable` file refs resolve on
disk (missing file = warning).

## The authoring laws this directory obeys

| Law | Source | In practice here |
|---|---|---|
| **Three-Change** | §0.2 | A type ships only if ≥3 of the six Ruleset-Card slots change vs existing types. shared-web and game-servers differ on Unit, Scarce, Patience-Analog, Threat-Mix, Look (5 of 6). |
| **Verb-Shift** | R4, §0.2 | A type ships only if the MOST-PERFORMED verb shifts: shared-web = **Triage**, game-servers = **Place & Connect** (one of the six invariant verbs, never a 7th, §1.9). |
| **Rosetta Card** | R11 | One canonical engine metric + one player-language alias + one joining line. Both anchors carry doc-verbatim lines (table below). |
| **3–5 budget** (handover) | R10, §1.9 | `handoverNote` is EXACTLY 3 keys: runsOut / killsYou / customerWants, diegetic sheet-on-desk voice. Schema enforces maxProperties 3. |
| **20% palette** | §1.9 | New type ≤20% replacement of the build palette; 80% known objects (`buildables.paletteRef: "palette:shared-80"`). Both anchors compose from the shared `concurrency-pool` + `two-face-rack` archetypes in two costumes (G6). |
| **Five-Asset Skin Kit** | R48/R49/R53, §8.10 | Exactly: 1 palette (accent+secondary) · 2 visitor costume (hull+prop) · 3 ONE hero silhouette · 4 bespoke meter face · 5 bespoke catastrophe FX (+ ambient sound swap). Everything else = parameters of shared systems ("five assets plus eight parameter values"). Author order: METER FIRST. |
| **Localisation law** | R46 + owner directive | **ALL human strings are i18n keys** resolved through the bundle's `ticketPack` file. No literal prose, no joke text in bundles. Keys below carry the authored English until `packs/*.i18n.json` exists. |
| **Pruning rule R36** | WS-3, §2.12 | A threat earns a mechanical slot (stats + counters) only if it CHANGES THE PLAYER'S VERB, not just the noun. Everything else is Codex flavour attached to a mechanical entry. |
| **Second Answer** | §5.1 | Every registry threat has ≥2 viable counters at DIFFERENT prices (cheap / expensive / lateral triad). Validator enforces. |
| **Wave rules** | §1.7/§2.24 | Baseline continuous-diurnal-never-zero; events are shaped envelopes over it; ≤4 threat entries/wave; first wave ≤40% par ALWAYS; troughs ≥45% below preceding peak; ≤2 roles >30% per wave; new role every 4th wave; hard waves draw TWO denominations; entropy budget peaks in troughs = f(estate age × size × (1−maintenance spend)); second-incident ×1.8 (incident) / ×2.5 (recovery). |
| **Hue ledger** | §1.3/§8.10 | MAGENTA is reserved for hostile traffic; no décor may use it — game-servers' palette explicitly excludes the magenta band; flow layer stays globally neutral cyan/magenta/violet. |

## Never invent numbers — the placeholder convention

Where the doc states no value, the field is `null` and the **nearest enclosing
object** carries `"_todo": "<§-cite>"` so the loader lint (sibling workstream)
flags it. Two declared exemptions where `null` means "subsystem off", not "TODO":

- `visitor.party.size` may be null when `allOrNothing === false`
- `visitor.herding.coefficient` may be null when `enabled === false`

Doc'd numbers are copied verbatim with their §-cite in the neighbouring
`_todo`/`facts` (e.g. bounce sigmoid anchors [0.6, 1.0, 1.6] per WS-1 R-60;
chargebacks 2–4% §1.3; 50× amplification §2.3; churn 3–6%/mo web, 6–12% seasonal
game §6.6). Values that exist ONLY to make a tuning decision visible are marked:

### PROVISIONAL marking convention

Owner has NOT picked the canonical tuning sheet (A/B/C — MASTER_REPORT OD-2).
Until they do, every object holding tuning-derived numbers carries
`"tuningSheet": "PROVISIONAL-B"` (B = the sheet the wave formula P(n)=100×1.115ⁿ×S(n)
was drafted against; the marker, not the pick). The validator rejects any
`tuningSheet` value not matching `PROVISIONAL-[ABC]`. When the owner ratifies a
sheet, sweep the marker to `"RATIFIED-<letter>"` in one commit — loader lint
treats unmarked tuning numerics as errors.

## Key literals (ticketPack seeds)

The English these bundle keys must resolve to (authored from the cited §; the
game handover trio is Appendix A verbatim):

| Key | Literal | Cite |
|---|---|---|
| `handover.game-servers.runs-out` | "Your tick budget. Every instance gets X ms per tick and the box does not care about your roadmap." | Appendix A |
| `handover.game-servers.kills-you` | "A Friday patch, prime time." | Appendix A |
| `handover.game-servers.customer-wants` | "Their clan never sees lag." | Appendix A |
| `handover.shared-web.runs-out` | "Slots run out before disk, and your hands run out before either." | §1.3 |
| `handover.shared-web.kills-you` | "One root on the control panel roots two hundred boxes. The enemy is sometimes a client." | §0.3/§1.3 |
| `handover.shared-web.customer-wants` | "Nobody must ever notice them." | §1.3 |
| `rosetta.game-servers.tick-budget` | "Tick budget is your density dial, spent in milliseconds." | G6/§1.3 |
| `rosetta.game-servers.harder-cliff` | "Tick budget is your latency budget with a harder cliff." | §1.9 |
| `verbs.shared-web.transfer.1` | "Density vs blast radius; one tenant is everyone's problem." | §1.9 Portable Skills |
| `verbs.game-servers.transfer.1` | "p99 is the product; geography is latency." | §1.9 Portable Skills |
| `economy.shared-web.bad-month` | "A slow churn bleed nobody can point at." | §6.6 Companion C |
| `economy.game-servers.bad-month` | "A title dies, or a launch you weren't ready for." | §6.6 Companion C |
| `goal.shared-web.binding` | "One box. Two hundred sites. You cannot evict the customer who is on fire." | §1.3 tutorial twist |
| `goal.game-servers.binding` | "A server 'up' at 140ms is dead." | §1.3 |
| `type.shared-web.name` | "The Mass Host" (codename "Cabinet 14") | §1.3 |
| `type.game-servers.name` | "Prime Time" | §1.3 |

## How to add a type

1. Copy `types/shared-web.json` as the skeleton — keep all 21 required keys.
2. Fill the six Ruleset-Card slots first (§0.2): Unit · Goal Node · Scarce
   Resource · Patience Analog · Threat Mix · The Look. If fewer than 3 change vs
   existing bundles, STOP — the type doesn't ship (Three-Change).
3. Prove the Verb-Shift: name the single most-performed invariant verb
   (Observe · Diagnose · Place & Connect · Tune · Triage · Commit) that this type
   makes dominant. If it's not a new dominant verb, merge it as a scenario, not a type.
4. Budget the skin at exactly FIVE bespoke assets + eight parameter values
   (§8.10). Author the METER FIRST. Check the hue ledger (magenta is taken).
   New palette must reuse ≥80% of the build objects (20% rule).
5. Reference threats/visitors ONLY by registry ids. New threat ⇒ add it to a
   registry file first, with ≥2 counters at different prices and a §-cite for
   every stat, or mark stats null + `_todo`. New threat must pass pruning rule
   R36 (changes the verb, not just the noun) or it is Codex flavour.
6. Every number the doc doesn't give: `null` + `"_todo": "§-cite"`. Every number
   that exists only for tuning: `"tuningSheet": "PROVISIONAL-B"`.
7. Every human string: an i18n key. Add the literal to the pack file (or the
   table above until packs exist).
8. Write the handover note — exactly 3 diegetic lines.
9. Run `node packages/content/script/validate.mjs`. Green, or it doesn't land.
10. Register the bundle with the loader (sibling workstream owns
    `packages/sim-core` — do NOT touch it from here; add only files inside
    `packages/content/`).

## Codex-only flavour held out of the registry (R36 demotions)

stream-sniper / ghost-server, competitor-sponsored attack, and
hype-cycle-collapse-as-text attach as Codex entries to `grudge-booter`,
`mod-update-day`, and the game wave table respectively — no stats, no slots.
