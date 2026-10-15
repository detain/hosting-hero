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
schema/threat-registry.schema.json  threat registry shape (draft 2020-12 subset — §8.18 `visual` / OD-18 `lookalikeOf` field shapes; deep laws live in the validator)
schema/visitor-registry.schema.json visitor archetype registry shape (draft 2020-12 subset — §8.18 `visual` field; the direction law lives in the validator)
types/shared-web.json               anchor type 1 ("The Mass Host" / Cabinet 14) — density game
types/game-servers.json             anchor type 2 ("Prime Time") — G6 co-anchor: ms scale + permanent incident clock
types/mail-hosting.json             type 3 ("The Post Office") — variety-engine proof: outbound defense, reputation scarcity, dominant verb Tune
types/dns-hosting.json              type 4 ("The Signpost Network") — variety-engine proof: correctness scarcity, anycast-PoP capacity, dominant verb Commit
types/dedicated.json                type 5 ("Root Is Theirs") — variety-engine proof: keyhole agency, rack-space scarcity, dominant verb Observe
types/object-storage.json           type 6 ("Eleven Nines") — durability scarcity, accretive data, dominant verb Shield (first tier-extension verb freed by ADR-0013 #14; see Type 6 notes)
types/trunk-group-voip.json         type 7 ("The Switchboard") — jitter scarcity, toll-fraud fatality, dominant verb Maintain (second tier-extension card via ADR-0013 #14; see Type 7 notes)
types/serverless.json               type 8 ("The Mayfly Field") — warm-capacity scarcity, blast-radius fatality, dominant verb Scale (third tier-extension card, first with NO dominant-verb line on the card at all; see Type 8 notes)
palettes/shared-80.json             the named home of buildables.paletteRef — 4 engine-backed shared archetypes (concurrency-pool, two-face-rack, control-plane, matchmaker) + the R61 ~15-slot verb-changer reserve accounting
waves/g1-shared-web-first-quarter.json  seeded wave slice for gates G1/G5
waves/g1-game-servers-first-quarter.json  seeded wave slice for gate G6 (same law set, type-specific DATA only)
waves/g1-mail-hosting-first-quarter.json  type-3 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-dns-hosting-first-quarter.json  type-4 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-dedicated-first-quarter.json  type-5 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-object-storage-first-quarter.json  type-6 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-trunk-group-first-quarter.json  type-7 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-serverless-first-quarter.json  type-8 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
threats/registry-core.json          16 mechanical threat entries (mail-hosting, dns-hosting, dedicated, object-storage, trunk-group-voip and serverless each reuse 8 or fewer existing ids; native threat rosters await the registry-owner pass — the census pins live in sibling tests, see Type 3/4/5/6/7/8 notes)
visitors/archetypes-core.json       9 visitor archetypes (mail-hosting, dns-hosting, dedicated, object-storage, trunk-group-voip and serverless reference NONE — their visitors are the message / the query / the sales inquiry / the PUT-GET / the call / the invocation itself; see Type 3/4/5/6/7/8 notes)
packs/shared-web.i18n.json          ticket pack for official:shared-web — 103 grammar templates, decision 42 / flavour 61
packs/game.i18n.json                ticket pack for official:game-servers — 75 grammar templates, decision 34 / flavour 41
packs/mail-hosting.i18n.json        ticket pack for official:mail-hosting — 63 grammar templates, decision 32 / flavour 31
packs/dns-hosting.i18n.json         ticket pack for official:dns-hosting — 65 grammar templates, decision 33 / flavour 32
packs/dedicated.i18n.json           ticket pack for official:dedicated — 66 grammar templates, decision 34 / flavour 32
packs/object-storage.i18n.json      ticket pack for official:object-storage — 67 grammar templates, decision 36 / flavour 31
packs/trunk-group-voip.i18n.json    ticket pack for official:trunk-group-voip — 69 grammar templates, decision 38 / flavour 31
packs/serverless.i18n.json          ticket pack for official:serverless — 68 grammar templates, decision 37 / flavour 31
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

### Type 5 notes (official:dedicated, 2026-10-13)

Chosen over VoIP/object-storage because the §1.3 "Root Is Theirs" dedicated card
is the only remaining candidate whose Ruleset-Card line names an unclaimed
invariant verb verbatim: **Observe** (distinct from Triage / Place & Connect /
Tune / Commit). This exhausts the six-verb census for card-grounded authoring:
the Trunk Group (VoIP) and Eleven Nines (object storage) cards ALSO name
Observe — shipping either after dedicated would trip the pairwise VERB_SHIFT
error ("merge it as a scenario, not a type"), and no §1.3 card names **Diagnose**
as a dominant verb. So the launch canon's type 6+ is owner-gapped behind
ADR-0005 per-tier verb extensions (or new authored cards), not behind this
lane. *(Superseded 2026-10-14: ADR-0013 decision 14 ruled the per-tier route —
see Type 6 notes.)* Scarce = rack space + provisioning time (§0.3 verbatim pair); fatal =
"Capex stranded" (§2.27 Matrix A dedicated row); customer = "Technical customers
with root"; unit = server (§6.6 Dedicated row, the only sibling with a PRICED
CAC band — Companion B $300-900/3-6mo ships as a real cacProfile, no
`cac.*.todo` placeholder). Win = hold rack utilization (§15395 "Utilization is
the whole game"; threshold null — Matrix A names breakeven, prices none).
Same two honest limits as Types 3/4: `visitor.archetypeRefs` `[]` (the visitor
is the sales/support inquiry itself) and `signatureThreats` reuses 8 of the 16
registry ids with the dedicated framing in `_todo` cites — zero registry
additions. Additionally `verbs.transfers` ships `[]`: the §1.9 Portable Skill
table carries no dedicated row and attributing a neighbour's row would be
invention (bundle `verbs._todo`). Loader lint: 5 of 9 §7.8 hooks changed vs the
anchor (R15 meter-swap, R16 commercial-slider, R20 control-granularity — the
doc's only authored non-shared pip row, §7.8f "Dedicated = hardware and
network" — R21 keyhole-mode verbatim, R22 mechanics), THREE_CHANGE/VERB_SHIFT
clean against all four siblings, waves contentInspector zero findings. The
slice ships WITHOUT a rules block, same law as Types 3/4.

### Type 6 notes (official:object-storage, 2026-10-14)

The first card freed by **ADR-0013 decision 14**: the type-5 notes above recorded
the six-verb census as exhausted, with VoIP and object-storage both blocked
behind dedicated's verbatim claim on **Observe**. Ruling 14 adopts ADR-0005's
already-ratified per-tier core-verb roster (PLACE·LINK·TUNE·SCALE·SHIELD·
INVESTIGATE·MAINTAIN·SELL) as the grounding set for a new card's dominant verb —
no ADR amendment — so the loader lint gained `TIER_EXTENDED_VERBS`
(scale/shield/maintain/sell; investigate folds into Diagnose, place/link fold
into Place & Connect, tune folds into Tune) and the VERB_SHIFT canon leg now
accepts INVARIANT ∪ EXTENDED. Object storage was chosen over Trunk Group (VoIP)
on footprint: the storage card cites shippable verbatim rows (§0.3 unit
gb-month and the silent-data-loss failure column, §3.2's PUT/GET ledger row,
§2.x Egress Bill Shock economics) while VoIP's toll-fraud mechanic, jitter/MOS
scarcity and §6.6 row have no registry or dial home at all — VoIP would ship as
a bigger scaffold of nulls. Dominant verb = **Shield**: the card's own §1.3
posture ("durability versus entropy… you never notice you until the day they
do") is protection-of-stored-truth, and Shield is the roster verb that names
it; Observe stays with dedicated (pairwise MERGE law untouched). Shield is NOT
a member of the closed 8-verb `PLAYER_VERBS` door enum, so it ships as the
card's declared identity + a MODULE-STATUS gap row ("tier-extension verbs have
no door mechanic", the g16 finding generalized) — every mechanic the quarter
slice exercises (configure-node dial steps, inspect, connect/place buildables,
sell-route sliders) rides door-supported verbs, exactly the precedent the
keyhole-verbs gap row set. Scarce = the durability nines dial + comb fullness
(§0.3; "the only probability you can actually compute and price", §2.x);
fatal = silent-data-loss; win = hold verified-object fraction, threshold null
— eleven nines is a promise the engine must not forge; unit = gb-month (§0.3
verbatim; §6.6's TB-month magnitude conflict is cited in economy._todo, not
resolved here). Same honest limits as Types 3/4/5: `visitor.archetypeRefs`
`[]` (the visitor is the PUT/GET itself) and `signatureThreats` reuses 6 of
the 16 registry ids (slowloris-sipper, mod-update-day, hoarder-noisy-neighbor,
noisy-query-table-scan, vulnerable-plugin-compromise, scanner-drizzle) with the
storage framing in `_todo` cites — zero registry additions; egress bill shock
is deliberately NOT fabricated as an attacker (it is an economics failure,
carried by demandCharges). Loader lint: 5 of 9 §7.8 hooks changed vs the
anchor (R15 meter-swap to the durability face, R16 commercial-slider to the
egress rate card, R17 dial roster, R18 tempo ms→hours, R22 mechanics set;
R23 shedOrder and the §7.8d register rows UNCHANGED), THREE_CHANGE/VERB_SHIFT
clean against all five siblings, waves contentInspector zero findings, corpus
lint findings `[]` with six bundles. The slice ships WITHOUT a rules block,
same law as Types 3/4/5.

### Type 7 notes (official:trunk-group-voip, 2026-10-14)

The SECOND card on the ADR-0013 decision 14 route, exactly as the type-6 notes
scheduled it: "VoIP (Trunk Group) is now unblocked by the same route
(Shield/Maintain available)". The §1.3 "Trunk Group / The Switchboard" card
names **Observe** verbatim as dominant — held by dedicated since 7afa038 — so
the card re-authored onto **Maintain** (loader lint `TIER_EXTENDED_VERBS`;
Shield taken by object-storage at 2fefc60). Grounding: the level is continuous
upkeep against a stateful threat — the §2.24 hygiene-win law ("the best
purchase in the VoIP ruleset, and the player who skips it will only skip it
once"), the stateful SBC, E911 address re-registration, codec-ladder keeping;
the card's Observe posture survives honestly as the meter pair (busy-wall ×
mos-score) and §2.12's day/night detection band. Door gap unchanged: Maintain
is content identity, not a `PLAYER_VERBS` door member (MODULE-STATUS gap row).
Scarce = jitter + packet loss (§0.3 verbatim); fatal = toll-fraud (§0.3
failure column verbatim); win = null threshold — the card ships NO Win clause
and the cord-state MOS boundaries (3.5/4.0, §1.3) are DISPLAY, not a win line.
Unit = channel (§0.3 "A channel / a DID"); §6.6's "channel / minute"
second-dimension and the DID-as-add-on question are CITED in economy._todo,
not resolved (object-storage's gb-vs-TB precedent). `visitor.patienceModel`
ships `mode: "binary"` — the FIRST corpus use, claimed straight from §3.2's
unit section ("Binary: it either connects with good audio or it doesn't. No
partial credit."), patience scalar null with the 'Instant' cite. The slice
authors the ONLY non-null peak hour in the corpus: `peakHourLocal: 9`, the
card's verbatim "hard 9am spike". Loader lint: 5 of 9 §7.8 hooks changed vs
the anchor (R15 meter-swap to the busy-wall/cord-trio face, R16
commercial-slider to trunk-capacity-tier — unique across all seven bundles,
R17 dial roster, R22 mechanics set, R23 shed ladder in-call-first),
THREE_CHANGE/VERB_SHIFT clean against all six siblings, waves contentInspector
zero findings, corpus lint findings `[]` with seven bundles. Threats reuse 6
of the 16 registry ids (wp-login-brute-squad, slowloris-sipper,
scanner-drizzle, vulnerable-plugin-compromise, hoarder-noisy-neighbor,
ticket-avalanche-hydra) with the VoIP framing in `_todo` cites — zero registry
additions. Honest gaps recorded: toll fraud's money-bleed, one-way audio, the
jitter storm and the 911 obligation have NO registry mechanic; they ride the
goal/meter/economy/scenarios until the registry-owner pass — the type-6 notes'
"bigger scaffold of nulls" verdict on this line is true and shipped as such.
The slice ships WITHOUT a rules block, same law as Types 3/4/5/6.

### Type 8 notes (official:serverless, 2026-10-15)

Chosen for the Scale slot of the ratified per-tier roster. The §1.3 card
("Cold Start" / "The Mayfly Field" / "The Popcorn Pan") ships NO dominant-verb
line at all — the first such case in the corpus: Types 6 and 7 each had to
OVERWRITE a verbatim "Dominant verb: Observe" that belonged to dedicated; here
nothing is claimed and nothing is displaced. The card's whole identity block is
two sentences — "Scarce: warm capacity. Teaches: cost can be attacked without
touching availability." — and the level's first noun is verbatim "scale to zero"
(§1.3 "The tension between cost (scale to zero) and latency (cold starts)" +
§4.2 "Infinite instant burst capacity, pay-per-invoke, no upkeep, scale to
zero"), so the card claims the roster's third free slot: **Scale** (loader lint
`TIER_EXTENDED_VERBS`). Door-gap honesty repeats verbatim from Type 6: Scale is
NOT a `PLAYER_VERBS` door enum member and no acquisition mechanic ships —
identity, not capability; the MODULE-STATUS gap row covers all three
tier-extension cards. What remains: **Sell** is the roster's only unclaimed
tier-extension slot and the next-in-queue candidate is the registrar card
("Whois/Redemption Grace", "Registry Lock as a premium product you sell") — it
fails the rule-1 probe because the §0.3 scarcity table ships NO registrar row,
so no Three-Change table exists to survive (colo's "sell space and police
power" is likewise blocked: its own card line reads "Dominant verb: Negotiate",
off both rosters, overridden per the mail/Dedicated precedent — a card's named
verb outranks a prose fragment elsewhere). **Diagnose** remains the sole
unclaimed invariant slot; the wave-5 card census records that NO §1.3 card
names Diagnose verbatim as a dominant verb — held, never forged.
Loader lint: 5 of 9 §7.8 hooks changed vs the anchor (R15 meter widget/stat,
R16 commercial-slider to reserved-warmth-level — unique across all eight
bundles, R17 dial roster, R22 mechanics set, R23 shed ladder starved-first),
THREE_CHANGE/VERB_SHIFT clean against all seven siblings, waves
contentInspector zero findings, corpus lint findings `[]` with eight bundles.
Threats reuse 6 of the 16 registry ids (xmlrpc-pingback-amplifier,
hoarder-noisy-neighbor, noisy-query-table-scan, scanner-drizzle,
slowloris-sipper, mod-update-day) with the serverless framing in `_todo` cites
— zero registry additions; the amplifier→api-client mimic seed is the first to
cross lines (mail's seed re-worn as the recursion), slowloris→deep-reader
rides along. Honest gaps recorded: the cold-start tax has no attacker id (it is
physics the line charges — carried by the patience budget and the meter pair),
the $40,000 bill has no wallet-blast mechanic in the registry (carried by
`economy.realismToggles.demandCharges`, the alert stream and scenarios),
and §6.6 Companions B and C price no serverless row — cacProfile is a
placeholder and bad-month is AUTHORED from §2.12, both flagged. §4.10's
one-object law names this skin explicitly ("the serverless warm pool … one
object — 'a countable concurrency pool' — with five costumes"), so
`concurrency-pool` re-worn as a skin is the palette rule's doc-named exemplar.
The slice ships WITHOUT a rules block, same law as Types 3/4/5/6/7.

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
every `verbChanger:true` archetype appears in the reserve · **visual-coverage
manifest-lint** (§8.18/OD-12(d), ADR-0013 ruling 5d): every threat, visitor
archetype, and palette archetype carries a `visual` slug (`^[a-z][a-z0-9-]*$`)
or an explicit `codexOnly: true` tag — missing = fail, malformed slug = fail
(the buildables leg of the law is the existing
`archetypeInstances`→palette resolution) · **lookalike law** (§2.4/OD-18,
ADR-0013 ruling 9): a threat's optional `lookalikeOf` must resolve to a
`visitors/archetypes-core.json` id, archetypes carrying `lookalikeOf` fail the
direction law, and every shipped bundle's `signatureThreats` must include ≥1
lookalike-tagged threat (its mimic seed) · every threat has ≥2 counters (§5.1 Second
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
the shipped counts — shared-web 98 (103 since the batch-E +3 and OD-25(a) death
+2 notice-voice passes 2026-10-09/10: +5 decision `alert.*` economy voices) /
game-servers 75 templates —
are approved, superseding the ≤60-per-pack task-line guidance (the validator keeps its ≥25
floor and sets no ceiling; most provenance cites are §9.3 verbatim doc seeds, so
trimming would delete doc-mandated content). Pack `_todo` markers
print under a **separate** `PACK TODO INVENTORY` counter; the bundle inventory
(212 since the type-8 serverless authoring pass 2026-10-15; 186 at type-7, 159 at type-6, 133 at type-5, 108 at type-4, 84 at type-3, 63 at wave-1) is untouched by
pack authoring — no test pins the printed number, though sibling lane memory
quotes the wave-1 figure.

## The authoring laws this directory obeys

| Law | Source | In practice here |
|---|---|---|
| **Three-Change** | §0.2 | A type ships only if ≥3 of the six Ruleset-Card slots change vs existing types. shared-web and game-servers differ on Unit, Scarce, Patience-Analog, Threat-Mix, Look (5 of 6). mail-hosting differs on Unit (message), Scarce (ip-reputation), Goal (recipient-inbox), Threat-Mix and Look — loader lint reports 5 of 9 §7.8 hooks changed vs the anchor (within the 3–5 budget). dns-hosting differs on Unit (query), Scarce (anycast-pop-capacity), Goal (authoritative-answer), Threat-Mix and Look — likewise 5 of 9 hooks changed vs the anchor, clean pairwise against all three siblings. dedicated differs on Unit (inquiry), Scarce (rack-space), Goal (server-delivery), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor, clean pairwise against all four siblings. object-storage differs on Unit (object request), Scarce (durability-nines), Goal (stored-object integrity), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor, clean pairwise against all five siblings. trunk-group-voip differs on Unit (call), Scarce (jitter-and-packet-loss), Goal (toll-fraud fatality), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor, clean pairwise against all six siblings. serverless differs on Unit (invocation), Scarce (warm-capacity), Goal (warm-execution / blast-radius fatality), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor, clean pairwise against all seven siblings. |
| **Verb-Shift** | R4, §0.2, ADR-0013 #14 | A type ships only if the MOST-PERFORMED verb shifts: shared-web = **Triage**, game-servers = **Place & Connect**, mail-hosting = **Tune**, dns-hosting = **Commit**, dedicated = **Observe** (§1.3 card verbatim; one of the six invariant verbs, never a 7th, §1.9). object-storage = **Shield** — the first card grounded on ADR-0005's ratified per-tier roster via loader `TIER_EXTENDED_VERBS` (ADR-0013 decision 14); the card's §1.3 line named Observe, held by dedicated, so it re-authored onto Shield (see Type 6 notes). Shield is content identity, not a door `PLAYER_VERBS` member — the door-mechanic gap ships as a MODULE-STATUS gap row. trunk-group-voip = **Maintain** — the route's second card (see Type 7 notes), likewise content identity without door support. serverless = **Scale** — the route's third card (see Type 8 notes), and the first case with no dominant-verb line on the card at all to overwrite or displace; Scale is verbatim-grounded in "scale to zero" (§1.3 + §4.2). Diagnose remains the sole unclaimed invariant slot (the wave-5 card census records no §1.3 card naming it verbatim); Sell remains the sole unclaimed tier-extension slot. |
| **Rosetta Card** | R11 | One canonical engine metric + one player-language alias + one joining line. Both anchors carry doc-verbatim lines (table below). |
| **3–5 budget** (handover) | R10, §1.9 | `handoverNote` is EXACTLY 3 keys: runsOut / killsYou / customerWants, diegetic sheet-on-desk voice. Schema enforces maxProperties 3. |
| **20% palette** | §1.9 | New type ≤20% replacement of the build palette; 80% known objects (`buildables.paletteRef: "palette:shared-80"` — authored in `palettes/shared-80.json`, validator-enforced). All shipped types compose from the shared `concurrency-pool` + `two-face-rack` archetypes (plus `control-plane` in seven skins, web's cPanel, mail's webmail, dedicated's ipmi-console, dns's zone-editor, object-storage's bucket-policy, trunk-group-voip's fraud-desk and serverless's metering-plan); the `matchmaker` archetype is the R61 reserve's first shipped verb-changer (14 of 15 slots remain unbuilt). |
| **Five-Asset Skin Kit** | R48/R49/R53, §8.10 | Exactly: 1 palette (accent+secondary) · 2 visitor costume (hull+prop) · 3 ONE hero silhouette · 4 bespoke meter face · 5 bespoke catastrophe FX (+ ambient sound swap). Everything else = parameters of shared systems ("five assets plus eight parameter values"). Author order: METER FIRST. |
| **Localisation law** | R46 + owner directive | **ALL human strings are i18n keys** resolved through the bundle's `ticketPack` file. No literal prose, no joke text in bundles. The packs ARE the authored English: `packs/*.i18n.json` carry every string, split into a sober `decision` namespace (shown while deciding or losing — §9.3 clauses 2–3) and a comedic `flavour` namespace (quiet surfaces only); the validator enforces the wall by root vocabulary and refuses any bundle-referenced key that strays into flavour. |
| **Pruning rule R36** | WS-3, §2.12 | A threat earns a mechanical slot (stats + counters) only if it CHANGES THE PLAYER'S VERB, not just the noun. Everything else is Codex flavour attached to a mechanical entry. |
| **Second Answer** | §5.1 | Every registry threat has ≥2 viable counters at DIFFERENT prices (cheap / expensive / lateral triad). Validator enforces. |
| **Visual Coverage** | §8.18, OD-12(d), ADR-0013 ruling 5(d) | The screen must be able to draw every shipped entity, or the content must say otherwise: every threat, visitor archetype, and palette archetype carries a `visual` slug grounded in the design-doc prose (`the-elbow` §2.10, `slow-wall` §2.3, the §3.1 duration-class primitives) or an explicit `codexOnly: true` tag. The validator fails absence and malformed slugs red. All 16 shipped threats are mechanical (R36) and every slug is doc-grounded, so zero codexOnly tags ship today — the hatch exists for future demotions. |
| **Lookalike (rule-masking)** | §2.4, OD-18, ADR-0013 ruling 9 | A mimic threat may declare `lookalikeOf`: the visitor archetype it masquerades as — a costume on the visitor roster, never a new entity. Direction is one-way (an archetype carrying `lookalikeOf` fails red); the id must resolve in the visitors registry. Five mimic seeds ship across the eight bundles: shared-web `layer7-mimic`→`power-shopper` · game-servers `cheat-client-griefer`→`game-player-joining` · mail-hosting `xmlrpc-pingback-amplifier`→`api-client` · dns-hosting `slowloris-sipper`→`deep-reader` · dedicated `scanner-drizzle`→`crawler` — object-storage and trunk-group-voip each carry TWO of these seeds (`slowloris-sipper`, `scanner-drizzle`) by reuse rather than adding a sixth, and serverless carries two (`xmlrpc-pingback-amplifier`, `slowloris-sipper`) — the amplifier seed crossing lines for the first time, the recursion wearing the pingback swarm's costume (§1.3's self-invoking function re-framed onto the registry's one amplification engine). Bundles legitimately reuse signature ids, so the lint enforces ≥1 seed per bundle rather than exactly-one — the mask rides the registry entry, so reuse inherits the law by design. |
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
| `handover.dedicated.runs-out` | "Your rack space and your provisioning time. Sold-out is a door you can price; a dead box on a three-hour install path is a countdown you cannot." | §0.3 |
| `handover.dedicated.kills-you` | "Capex stranded in dark rows: the batch you bought together failing apart, and utilization that never crossed breakeven while the lease depreciated underneath." | §2.27 Matrix A/§6.6 Companion C |
| `handover.dedicated.customer-wants` | "Root, and the four-hour promise. They came for the whole box; they stay for the van that actually shows up." | §0.3/§1.3 |
| `rosetta.dedicated.occupancy` | "Rack occupancy is the oversell ratio seen from the empty side: capacity already paid for and sold to nobody, depreciating in the dark." | §15395/§1.9 |
| `rosetta.dedicated.keyhole` | "The IPMI power-cycle is the triage window aimed at a machine instead of a queue — every unit of agency you remove must be replaced with two units of visibility." | §7.8f/§1.9 |
| `economy.dedicated.bad-month` | "A hardware batch failure across gear you bought together." | §6.6 Companion C |
| `goal.dedicated.binding` | "An empty dedicated server is pure loss every month, and the only hands that can fill a rack are the same hands that answer for the abuse it commits." | §15395/§15399 |
| `type.dedicated.name` | "Root Is Theirs" | §1.3 |
| `handover.object-storage.runs-out` | "Your rebuild bandwidth and your scrub clock. An empty comb is a bill you can pay down; a degraded stripe during a storm is a countdown you cannot." | §0.3/§1.3 |
| `handover.object-storage.kills-you` | "Silent data loss: the corruption that copied itself into every replica, or the two simultaneous failures during a rebuild — the probability you could have computed and priced, and did not." | §1.3/§2.x |
| `handover.object-storage.customer-wants` | "The nines they were sold and never asked you to show. They never noticed you for months; the day they do, they will want the object." | §1.3 |
| `rosetta.object-storage.scrub` | "The scrub bandwidth share is the cgroup cage aimed at entropy instead of tenants: the same bet that background verification is work, and work competes for the same hands and the same drives." | §1.9 |
| `rosetta.object-storage.egress` | "The replication mix is the oversell ratio spent the other way: capacity you buy and bill to nobody, because the copies are priced in safety, not in seats." | §1.9 |
| `verbs.object-storage.transfer.1` | "Durability arithmetic transfers everywhere: any line where you promised more than one copy of something now asks you the same question — can I finish verifying everything before it changes?" | §1.9 Portable Skill idiom + §1.3 verbatim question (authored — see Type 6 notes) |
| `economy.object-storage.bad-month` | "An egress bill the customer disputes." | §2.x Egress Bill Shock |
| `goal.object-storage.binding` | "Durability is arithmetic, not vibes: the scrub must complete faster than the failure rate, and the hands that audit placement are the same hands that answer the day customers finally notice." | §1.3 |
| `type.object-storage.name` | "Eleven Nines" | §1.3 |
| `handover.trunk-group-voip.runs-out` | "Your channels and your vigilance. An empty wall is a bill you can postpone paying; a Fraying cord during the cliff is a conversation ending in real time, and a busy wall with no eyes on it is a meter running." | §0.3/§1.3 |
| `handover.trunk-group-voip.kills-you` | "Toll fraud: the magenta cord that plugs itself in at 3am and dials premium destinations all weekend — the attack that costs money directly and instantly, arriving as Monday's carrier bill (§1.3's $60,000)." | §0.3/§1.3 |
| `handover.trunk-group-voip.customer-wants` | "Published MOS and a channel-capacity guarantee — the two numbers on the page they signed. They will notice you exactly once per incident, by which ear the audio came from." | §13849 |
| `rosetta.trunk-group-voip.spendcap` | "The spend cap is the cgroup cage aimed at dollars instead of tenants: the same bet that a bounded runaway is cheaper than an unbounded one, and the same admission that something will eventually run." | §1.9 |
| `rosetta.trunk-group-voip.trunkmix` | "The trunk capacity tier is the oversell ratio spent against an honest wall: channels sold past headroom come back at nine o'clock as visible fast-busy, not as a degraded read nobody scheduled." | §1.9 |
| `verbs.trunk-group-voip.transfer.1` | "Upkeep discipline transfers everywhere: any line where safety is a setting rather than a purchase now asks you the same question — who re-checks the cap, the cage, the registry, the whitelist, when nobody is on fire?" | §1.9 Portable Skill idiom + §2.24 upkeep law (authored — see Type 7 notes) |
| `economy.trunk-group-voip.bad-month` | "Toll fraud on a weekend." | §6.6 |
| `goal.trunk-group-voip.binding` | "Jitter and packet loss, not throughput: a dropped call is a total loss, not a slow bounce, and the hands that widen the trunk before nine are the same hands that read the settlement statement on Monday." | §1.3 |
| `type.trunk-group-voip.name` | "The Switchboard" | §1.3 |
| `handover.serverless.runs-out` | "Your warm capacity and your attention to the meter. An empty pool is a stutter you will pay for later in other people's first visitors; a full pool nobody sized is idle money burning while the field pops for free." | §0.3/§4.2 |
| `handover.serverless.kills-you` | "The blast radius: one tenant's burst starving the field, or one function invoking itself and billing $40,000 in nine minutes while every availability lamp stays green — the attack that spends the company without breaking the service." | §1.3/§0.3 |
| `handover.serverless.customer-wants` | "The pan already hot: sub-second pops for their first visitor, and a bill that scales with their success instead of a stranger's storm. They experience your queue only as their own latency." | §3.1/§0.3 |
| `rosetta.serverless.shares` | "Concurrency shares are the cgroup cage spent against mayflies: the same bet that a bounded neighbor is cheaper than an unbounded one, sold now in units of warmth instead of memory." | §1.9 |
| `rosetta.serverless.warmth` | "The reserved-warmth level is the oversell ratio pointed at frost: shells sold past the pool's ability to keep them warm come back as visible stutters on the first arrival after quiet, not as a degraded read nobody scheduled." | §1.3/§1.9 |
| `verbs.serverless.transfer.1` | "Metered-exposure discipline transfers everywhere: any line whose product is an act rather than a rental now asks you the same question — what does the runaway cost before anyone reaches for the cap, and who is watching a meter that can bleed you while every uptime lamp stays green?" | §1.9 Portable Skill idiom + §4.2 risk/reward clause (authored — see Type 8 notes) |
| `economy.serverless.bad-month` | "A function that invokes itself: nine minutes, $40,000." | §2.12 (authored — Companion C prices no serverless row) |
| `goal.serverless.binding` | "Warmth, not throughput: the visitor's experience depends on whether another visitor came recently, and a runaway spends money without touching availability — the hands that pre-warm the pool are the same hands that read the nine-minute invoice." | §1.3 |
| `type.serverless.name` | "The Mayfly Field" | §1.3 |

## How to add a type

1. Copy `types/shared-web.json` as the skeleton — keep all 21 required keys.
2. Fill the six Ruleset-Card slots first (§0.2): Unit · Goal Node · Scarce
   Resource · Patience Analog · Threat Mix · The Look. If fewer than 3 change vs
   existing bundles, STOP — the type doesn't ship (Three-Change).
3. Prove the Verb-Shift: name the single most-performed verb the card makes
   dominant — one of the six invariant verbs (Observe · Diagnose · Place &
   Connect · Tune · Triage · Commit, §1.9) or, when the invariant six are
   pairwise-claimed, one of ADR-0005's ratified per-tier roster verbs the loader
   accepts via `TIER_EXTENDED_VERBS` (Scale · Shield · Maintain · Sell — ADR-0013
   decision 14; content identity only, door support is a separate gap row).
   If it's not a new dominant verb, merge it as a scenario, not a type.
4. Budget the skin at exactly FIVE bespoke assets + eight parameter values
   (§8.10). Author the METER FIRST. Check the hue ledger (magenta is taken).
   New palette must reuse ≥80% of the build objects (20% rule).
5. Reference threats/visitors ONLY by registry ids. New threat ⇒ add it to a
   registry file first, with ≥2 counters at different prices and a §-cite for
   every stat, or mark stats null + `_todo`. New threat must pass pruning rule
   R36 (changes the verb, not just the noun) or it is Codex flavour. Every new
   registry entry needs a §8.18 `visual` slug (doc-grounded) or a `codexOnly:
   true` tag, and a threat that wears a crowd of normal traffic as camouflage
   should carry `lookalikeOf` naming the visitor archetype it mimics
   (§2.4/OD-18) — if it is the bundle's only mimic, the seed lint also wants a
   `signatureThreats` entry for it.
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
