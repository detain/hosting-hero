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
schema/i18n-pack.schema.json        ticket-pack shape (draft 2020-12 subset — deep laws live in the validator)
schema/palette.schema.json          palette shape (draft 2020-12 subset — anchor resolution + R61 budget laws live in the validator)
types/shared-web.json               anchor type 1 ("The Mass Host" / Cabinet 14) — density game
types/game-servers.json             anchor type 2 ("Prime Time") — G6 co-anchor: ms scale + permanent incident clock
types/mail-hosting.json             type 3 ("The Post Office") — variety-engine proof: outbound defense, reputation scarcity, dominant verb Tune
types/dns-hosting.json              type 4 ("The Signpost Network") — variety-engine proof: correctness scarcity, anycast-PoP capacity, dominant verb Commit
palettes/shared-80.json             the named home of buildables.paletteRef — 4 engine-backed shared archetypes (concurrency-pool, two-face-rack, control-plane, matchmaker) + the R61 ~15-slot verb-changer reserve accounting
waves/g1-shared-web-first-quarter.json  seeded wave slice for gates G1/G5
waves/g1-game-servers-first-quarter.json  seeded wave slice for gate G6 (same law set, type-specific DATA only)
waves/g1-mail-hosting-first-quarter.json  type-3 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-dns-hosting-first-quarter.json  type-4 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
threats/registry-core.json          16 mechanical threat entries (mail-hosting and dns-hosting each reuse 8 existing ids; native threat rosters await the registry-owner pass — the census pins live in sibling tests, see Type 3/4 notes)
visitors/archetypes-core.json       9 visitor archetypes (mail-hosting and dns-hosting reference NONE — their visitors are the message / the query itself; see Type 3/4 notes)
packs/shared-web.i18n.json          ticket pack for official:shared-web — 101 grammar templates, decision 40 / flavour 61
packs/game.i18n.json                ticket pack for official:game-servers — 75 grammar templates, decision 34 / flavour 41
packs/mail-hosting.i18n.json        ticket pack for official:mail-hosting — 63 grammar templates, decision 32 / flavour 31
packs/dns-hosting.i18n.json         ticket pack for official:dns-hosting — 65 grammar templates, decision 33 / flavour 32
script/validate.mjs                 Node-stdlib structural validator (no npm deps)
```

### Type 3 notes (official:mail-hosting, 2026-10-09)

Chosen over Backup/Storage because the §1.3 backup card's dominant verb is
**Schedule** — not one of the six invariant verbs (§1.9), so it would ship on a
VERB_SHIFT violation; the mail card names **Tune** verbatim and carries a fully
authored Ruleset Card (scarce = IP reputation per §0.3, fatal = Blacklisting,
customer = "Everyone, cheaply", unit = mailbox §6.6, win = ">98% inbox placement
while still growing"). Two honest limits, both fenced by sibling-owned pins:
`visitor.archetypeRefs` is `[]` (all 9 registry archetypes are human/machine
visitors; a mail-native archetype would move the g2 corpus census) and
`threats.signatureThreats` reuses 8 of the 16 registry ids with the mail framing
carried in `_todo` cites (coverage `invitations.test.ts` pins threats=16). The
slice ships WITHOUT a rules block so batch-D's rule-adapter work stays optional.

### Type 4 notes (official:dns-hosting, 2026-10-10)

Chosen per owner ruling OD-14(a) (34 canon / 20 launch — DNS is the §5.6 gate's
"cheapest sticky product in hosting"). The §1.3 Anycast DNS card names
**Commit** verbatim as the dominant verb — inside the six invariant verbs, and
distinct from every sibling (Triage / Place & Connect / Tune). Scarce =
anycast-PoP capacity + the card's "— and correctness" tail (carried on the
data-integrity front); fatal = "Total resolution failure" (§0.3);
customer = "Domains by the million"; unit = zone / query (§6.6);
win = "convert 1.5% of free tier to paid" (§1.3). Same two honest limits as
Type 3, fenced by sibling pins: `visitor.archetypeRefs` is `[]` (the visitor is
the query itself) and `threats.signatureThreats` reuses 8 of the 16 registry
ids (open-resolver-reflection, udp-amplification-barrage, slowloris-sipper,
scanner-drizzle, noisy-query-table-scan, ticket-avalanche-hydra, mod-update-day,
empty-server-spiral) with the DNS framing carried in `_todo` cites — zero
registry additions, proto `THREAT_CATALOG` untouched. Loader lint: 5 of 9 §7.8
hooks changed vs the anchor (within the 3–5 budget), THREE_CHANGE/VERB_SHIFT
clean against all three siblings, waves contentInspector zero findings. The
slice ships WITHOUT a rules block, same law as Type 3.

## Validate

```bash
node packages/content/script/validate.mjs   # exit 0 = green; prints _todo inventory
```

Checks: every JSON parses · bundles carry all 21 schema-required keys · ids unique
· every `signatureThreats`/`unlockedByBuildables` threat ref resolves in
`threats/registry-core.json` · every `visitor.archetypeRefs` resolves in
`visitors/archetypes-core.json` · every `buildables.paletteRef` resolves to an
authored `palettes/*.json` id and every `buildables.archetypeInstances` name is
defined in that palette (audit group-13: the shipped `palette:shared-80` ref
formerly resolved nowhere) · palette R61 reserve accounting: items ≤ max and
every `verbChanger:true` archetype appears in the reserve · every threat has ≥2 counters (§5.1 Second
Answer) drawn from the 9 defense roles · every object containing a `null` carries
a non-empty `"_todo"` (two declared exemptions below) · every `tuningSheet` value
matches `PROVISIONAL-[ABC]` · wave files re-check §1.7 authoring rules (≤4
entries/wave, first wave ≤40% par, trough ≥45% below peak, ≤2 primary roles
>30%, fresh role every 4th wave, hard waves draw ≥2 denominations, entries sum
to 100%, envelope `overWaves` resolve) · bundle `waveTable` file refs resolve on
disk (missing file = warning) · **ticket packs**: every `file:packs/…` ref exists
and is claimed by exactly one bundle (no orphans) · pack validates against
`schema/i18n-pack.schema.json` · **every dotted key a bundle references resolves
in that pack's `decision` namespace** (missing = fail; found in `flavour` = fail)
· **decision/flavour root vocabularies are disjoint** — the §9.3 separation law is
machine-checked by namespace root · templates are strings or `{eras, fallback}`
era-variant objects over the pack's declared `eraCodes`, with identical slot sets
across variants · every `{slot}` is glossed and every glossary slot is used ≥1× ·
README §Key literals table is verbatim-synced against pack `decision` values ·
zero §9.11 technique vocabulary (shell/SQL/CVE/path ban-list over every template
body) · ≥25 templates per pack · provenance covers every key (cite string, or
null + `_provenance._todo` — never an invented law-number). VOLUME RATIFIED
2026-10-09 (owner decision, `docs/adr/0009-owner-ratifications-calibration.md`):
the shipped counts — shared-web 98 (101 since the batch-E notice-voice pass
2026-10-09: +3 decision `alert.*` economy voices) / game-servers 75 templates —
are approved, superseding the ≤60-per-pack task-line guidance (the validator keeps its ≥25
floor and sets no ceiling; most provenance cites are §9.3 verbatim doc seeds, so
trimming would delete doc-mandated content). Pack `_todo` markers
print under a **separate** `PACK TODO INVENTORY` counter; the bundle inventory
(108 since the type-4 dns-hosting authoring pass; 84 at type-3, 63 at wave-1) is untouched by
pack authoring — no test pins the printed number, though sibling lane memory
quotes the wave-1 figure.

## The authoring laws this directory obeys

| Law | Source | In practice here |
|---|---|---|
| **Three-Change** | §0.2 | A type ships only if ≥3 of the six Ruleset-Card slots change vs existing types. shared-web and game-servers differ on Unit, Scarce, Patience-Analog, Threat-Mix, Look (5 of 6). mail-hosting differs on Unit (message), Scarce (ip-reputation), Goal (recipient-inbox), Threat-Mix and Look — loader lint reports 5 of 9 §7.8 hooks changed vs the anchor (within the 3–5 budget). dns-hosting differs on Unit (query), Scarce (anycast-pop-capacity), Goal (authoritative-answer), Threat-Mix and Look — likewise 5 of 9 hooks changed vs the anchor, clean pairwise against all three siblings. |
| **Verb-Shift** | R4, §0.2 | A type ships only if the MOST-PERFORMED verb shifts: shared-web = **Triage**, game-servers = **Place & Connect**, mail-hosting = **Tune**, dns-hosting = **Commit** (§1.3 card verbatim; one of the six invariant verbs, never a 7th, §1.9). |
| **Rosetta Card** | R11 | One canonical engine metric + one player-language alias + one joining line. Both anchors carry doc-verbatim lines (table below). |
| **3–5 budget** (handover) | R10, §1.9 | `handoverNote` is EXACTLY 3 keys: runsOut / killsYou / customerWants, diegetic sheet-on-desk voice. Schema enforces maxProperties 3. |
| **20% palette** | §1.9 | New type ≤20% replacement of the build palette; 80% known objects (`buildables.paletteRef: "palette:shared-80"` — authored in `palettes/shared-80.json`, validator-enforced). All three shipped types compose from the shared `concurrency-pool` + `two-face-rack` archetypes (plus `control-plane` in two skins, web's cPanel and mail's webmail); the `matchmaker` archetype is the R61 reserve's first shipped verb-changer (14 of 15 slots remain unbuilt). |
| **Five-Asset Skin Kit** | R48/R49/R53, §8.10 | Exactly: 1 palette (accent+secondary) · 2 visitor costume (hull+prop) · 3 ONE hero silhouette · 4 bespoke meter face · 5 bespoke catastrophe FX (+ ambient sound swap). Everything else = parameters of shared systems ("five assets plus eight parameter values"). Author order: METER FIRST. |
| **Localisation law** | R46 + owner directive | **ALL human strings are i18n keys** resolved through the bundle's `ticketPack` file. No literal prose, no joke text in bundles. The packs ARE the authored English: `packs/*.i18n.json` carry every string, split into a sober `decision` namespace (shown while deciding or losing — §9.3 clauses 2–3) and a comedic `flavour` namespace (quiet surfaces only); the validator enforces the wall by root vocabulary and refuses any bundle-referenced key that strays into flavour. |
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

**UPDATE 2026-10-09:** the owner HAS picked the canonical sheet — **Sheet B,
RATIFIED** (`24dfcfe` flips the engine default; `docs/adr/0009` records it). The
wire markers below have NOT yet been swept: `packages/content/types/*.json`
still carry `"tuningSheet": "PROVISIONAL-B"`, and that is deliberate — the
re-author is an owner content commit, not an engine-lane edit. Two pins keep the
marker honest in the meantime: the validator still rejects any `tuningSheet`
value not matching `PROVISIONAL-[ABC]`, and
`packages/sim-core/src/__tests__/gate-g5.test.ts:96` (G5 group 0) pins the
quarter's wire marker to `/^PROVISIONAL/` — while group 0b's source scan keeps
G5's CODE calling neither resolver — so no lane can self-declare RATIFIED on the
wire before the owner sweeps. When that sweep
lands, move the marker to `"RATIFIED-<letter>"` in one commit and re-cut both
pins in the same change — loader lint treats unmarked tuning numerics as errors.

(Historical law, still the reason the markers exist: every object holding
tuning-derived numbers carries `"tuningSheet": "PROVISIONAL-B"` — B = the sheet
the wave formula P(n)=100×1.115ⁿ×S(n) was drafted against; the marker, not the
pick. The pick has now happened; the marker sweep is owed.)

## Key literals (ticketPack seeds)

The English these bundle keys must resolve to (authored from the cited §; the
game handover trio is Appendix A verbatim). The packs now exist — this table is
the pinned seed and `script/validate.mjs` fails on any divergence between a row
here and the pack's `decision` value.

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
| `handover.mail-hosting.runs-out` | "Your IP reputation. It appreciates over months and one customer can spend all of it in an hour." | §1.3 |
| `handover.mail-hosting.kills-you` | "A compromised mailbox at 2am, four hundred thousand messages, and a listing nobody will explain." | §1.3 |
| `handover.mail-hosting.customer-wants` | "Their mail reaches the inbox. Not the junk folder, not a bounce — the inbox." | §1.3 |
| `rosetta.mail-hosting.warmup` | "The IP warm-up ramp is the oversell ratio played backwards: volume is earned from the providers, not sold to the customers." | §1.3/§1.9 |
| `rosetta.mail-hosting.rates` | "Per-account outbound rate limits are cgroup caging pointed the other way — the same dial, now aimed at what leaves." | §1.9 |
| `verbs.mail-hosting.transfer.1` | "some resources are held by third parties and cannot be bought back." | §1.9 Portable Skills (§1.3 Teaches verbatim) |
| `economy.mail-hosting.bad-month` | "A blocklisting." | §6.6 Companion C |
| `goal.mail-hosting.binding` | "Your server accepted it. That is not the same sentence as 'they received it.'" | §1.3 |
| `type.mail-hosting.name` | "The Post Office" | §1.3 |
| `handover.dns-hosting.runs-out` | "Your propagation window. A low TTL is agility you pay for in volume forever; a high one is a mistake nobody can un-publish." | §1.3 |
| `handover.dns-hosting.kills-you` | "A missed key rollover at dusk: nothing is down, everything is unreachable, and your monitoring says green." | §1.3 |
| `handover.dns-hosting.customer-wants` | "Their domain resolves. Not eventually, not mostly — at every resolver on earth, right now." | §1.3 |
| `rosetta.dns-hosting.rrl` | "Response Rate Limiting is cgroup caging aimed at repeat sources — the same ladder, now counting packets per second." | §1.9 |
| `rosetta.dns-hosting.allowance` | "The free-tier query allowance is the oversell ratio in costume: capacity sold to tenants who will never pay, priced against the day they do." | §1.3/§1.9 |
| `verbs.dns-hosting.transfer.1` | "you are load-bearing for other people; TTL is a throttle you own." | §1.9 Portable Skills (§1.3 Teaches verbatim) |
| `economy.dns-hosting.bad-month` | "An amplification incident originating from you." | §6.6 Companion C |
| `goal.dns-hosting.binding` | "Every TTL choice is a bet: low buys agility and you pay for it in volume forever; high is a mistake that propagates for hours and you cannot take it back." | §1.3 |
| `type.dns-hosting.name` | "The Signpost Network" | §1.3 |

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
7. Every human string: an i18n key. Author it in the type's pack file under
   `decision` (sober: shown while deciding/losing) or `flavour` (comedy: quiet
   surfaces only) — never inline in the bundle — add its `_provenance` cite
   (string or null+`_todo`), and add the new pack to the Key literals table
   above when the literal needs pinning.
8. Write the handover note — exactly 3 diegetic lines.
9. Run `node packages/content/script/validate.mjs`. Green, or it doesn't land.
10. Register the bundle with the loader (sibling workstream owns
    `packages/sim-core` — do NOT touch it from here; add only files inside
    `packages/content/`).

## Codex-only flavour held out of the registry (R36 demotions)

stream-sniper / ghost-server, competitor-sponsored attack, and
hype-cycle-collapse-as-text attach as Codex entries to `grudge-booter`,
`mod-update-day`, and the game wave table respectively — no stats, no slots.
