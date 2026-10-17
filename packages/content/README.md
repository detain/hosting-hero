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
types/exchange-colo.json            type 9 ("The Microsecond Cathedral") — cable-length scarcity, fairness-breach fatality, dominant verb Sell (fourth card on the original tier-extension roster, second with NO dominant-verb line; the tenth type shipped only after ADR-0014 #D1 blessed Negotiate onto the roster — see Type 9 notes)
types/colo.json                     type 10 ("Amps and Aisles") — power-and-cooling scarcity, facility-power-event fatality, dominant verb Negotiate (first card founded on an ADR-0014 #D1 blessed verb the §1.3 card itself names verbatim; see Type 10 notes)
types/backup-archival.json    type 11 ("Restore Point") — restore-time scarcity, unrestorable-backup fatality, dominant verb Schedule (first card founded on a roster verb that had ZERO claiming cards; second and final ADR-0014 #D1 blessing consumed verbatim by the card's own line; see Type 11 notes)
types/dbaas.json              type 12 ("The Cellar") — iops-and-durability scarcity, data-corruption fatality, dominant verb Isolate (the first card grounding a verb that required a fresh owner law call — session-6 ruling, ADR-0015 route; lint roster carried `isolate` @7f47563 before the bundle existed; see Type 12 notes)
types/observability.json         type 13 ("Who Watches" / "Cardinality") — write-throughput-and-series-cardinality scarcity, blind-flatline fatality, dominant verb Diagnose (the FIRST card claiming an original invariant verb through a bless route — ADR-0014 #D1(i) prose-implication, owner-confirmed at authoring 2026-10-17, ADR-0016 at closeout; also the first shipped type with NO §0.3 scarcity row — the card's own four axes carry unit/scarce/fatal/customer and no row is forged; see Type 13 notes)
palettes/shared-80.json             the named home of buildables.paletteRef — 4 engine-backed shared archetypes (concurrency-pool, two-face-rack, control-plane, matchmaker) + the R61 ~15-slot verb-changer reserve accounting
waves/g1-shared-web-first-quarter.json  seeded wave slice for gates G1/G5
waves/g1-game-servers-first-quarter.json  seeded wave slice for gate G6 (same law set, type-specific DATA only)
waves/g1-mail-hosting-first-quarter.json  type-3 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-dns-hosting-first-quarter.json  type-4 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-dedicated-first-quarter.json  type-5 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-object-storage-first-quarter.json  type-6 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-trunk-group-first-quarter.json  type-7 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-serverless-first-quarter.json  type-8 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-exchange-colo-first-quarter.json  type-9 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-colo-first-quarter.json  type-10 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-backup-archival-first-quarter.json  type-11 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-dbaas-first-quarter.json  type-12 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
waves/g1-observability-first-quarter.json  type-13 first-quarter slice — same law set, DELIBERATELY RULES-FREE (no rules block) until the batch-D rule-adapter pass
threats/registry-core.json          16 mechanical threat entries (mail-hosting, dns-hosting, dedicated, object-storage, trunk-group-voip, serverless, exchange-colo, colo, backup-archival, dbaas and observability each reuse 8 or fewer existing ids; native threat rosters await the registry-owner pass — the census pins live in sibling tests, see Type 3/4/5/6/7/8/9/10/11/12/13 notes)
visitors/archetypes-core.json       9 visitor archetypes (mail-hosting, dns-hosting, dedicated, object-storage, trunk-group-voip, serverless, exchange-colo, colo, backup-archival and dbaas reference NONE — their visitors are the message / the query / the sales inquiry / the PUT-GET / the call / the invocation / the cabinet lease itself / the cabinet-and-amps lease / the nightly job chain itself / the query slip itself / the never-ending metric stream itself; see Type 3/4/5/6/7/8/9/10/11/12/13 notes)
packs/shared-web.i18n.json          ticket pack for official:shared-web — 103 grammar templates, decision 42 / flavour 61
packs/game.i18n.json                ticket pack for official:game-servers — 75 grammar templates, decision 34 / flavour 41
packs/mail-hosting.i18n.json        ticket pack for official:mail-hosting — 63 grammar templates, decision 32 / flavour 31
packs/dns-hosting.i18n.json         ticket pack for official:dns-hosting — 65 grammar templates, decision 33 / flavour 32
packs/dedicated.i18n.json           ticket pack for official:dedicated — 66 grammar templates, decision 34 / flavour 32
packs/object-storage.i18n.json      ticket pack for official:object-storage — 67 grammar templates, decision 36 / flavour 31
packs/trunk-group-voip.i18n.json    ticket pack for official:trunk-group-voip — 69 grammar templates, decision 38 / flavour 31
packs/serverless.i18n.json          ticket pack for official:serverless — 68 grammar templates, decision 37 / flavour 31
packs/exchange-colo.i18n.json       ticket pack for official:exchange-colo — 68 grammar templates, decision 37 / flavour 31
packs/colo.i18n.json                ticket pack for official:colo — 68 grammar templates, decision 37 / flavour 31
packs/backup-archival.i18n.json     ticket pack for official:backup-archival — 66 grammar templates, decision 37 / flavour 29
packs/dbaas.i18n.json               ticket pack for official:dbaas — 66 grammar templates, decision 37 / flavour 29
packs/observability.i18n.json     ticket pack for official:observability — 66 grammar templates, decision 37 / flavour 29
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

### Type 9 notes (official:exchange-colo, 2026-10-16)

Chosen for **Sell**, the last unclaimed slot on the ratified per-tier roster. The §1.3
financial-exchange-colo card ("The Microsecond Cathedral" / "The Meter Stick") ships
NO dominant-verb line — second such case after serverless: nothing is claimed and
nothing is displaced. Sell is verbatim-grounded twice in the card body ("microseconds
are what you sell", "you sell *equal* latency as a product") and once in the Verb Shift
Rule family row ("Colo: *sell space and police power*"). The §0.3 scarcity row the
registrar card lacked DOES exist here ("Financial exchange colo | Microseconds / cable
length | Unequal latency between tenants | A cabinet three metres closer"), so the
Three-Change table survives. Scarce = cable-length (meter = nanosecond-skew readout,
§8.x financial-colo face); fatal = fairness breach ("one tenant gets a 40ns advantage
and the others riot"); unit = cabinet lease (§6.6 revenue-shape row "Colocation |
U / kW / cross-connect | 3–5 year leases"); win = hold-metric latency-skew with the
threshold null — the card promises *equal*, never "≤N ns", so no number is invented.
Door-gap honesty repeats from Types 6/7/8: Sell is not a `PLAYER_VERBS` door member and
no sell/gate mechanic ships — identity, not capability; the MODULE-STATUS gap row now
covers all four tier cards. `visitor.patienceModel` ships `mode: "resident"` — the FIRST
corpus use, claimed straight from §3.2's unit section ("a colo lease" as the Resident
exemplar; the engine's `PATIENCE_MODE_VOCAB` names the arm: a joined unit holds capacity
rather than abandoning it), and the party is all-or-nothing with size null (§3.2 "seven
cabinets, or they go elsewhere" — a law of seven, not an N); populationEffect is true
per §2.12's meet-me threshold clause. Loader lint: 5 of 9 §7.8 hooks changed vs the
anchor (R15 meter widget/stat/face, R16 commercial-slider to meet-me-access-tier —
unique across all nine bundles, R17 dial roster, R18 time granularity — the corpus's
FIRST µs `simTimeScale`, the card's whole premise measured in nanoseconds, R22 mechanics
set). **R23's shed-ladder leg deliberately rides the anchor**: a resident lease is
unshedable by the §3.2 wait-law and no doc names a colo ladder — inventing one would
break "never invent numbers" harder than leaving the hook unchanged.
THREE_CHANGE/VERB_SHIFT clean against all eight siblings, waves contentInspector zero
findings, corpus lint findings `[]` with nine bundles. Threats reuse 8 of the 16
registry ids (layer7-mimic, cheat-client-griefer, mod-update-day, ticket-avalanche-hydra,
empty-server-spiral, chargeback-swarm, open-resolver-reflection, scanner-drizzle) with
the colo framing in `_todo` cites — zero registry additions; both mimic seeds are
re-worn, no sixth seed. Economy is family-transfer: the §6.6 Colocation correction row
(escalator/deposit/NRC) lands as the corpus's FIRST `contractTerms.escalator: true` —
generic-colo terms ported to the exchange variant, flagged; Companion B prices only
generic colocation ($2,000–15,000 / 12–30 mo) with no financial-latency row, so
cacProfile stays `cac.exchange-colo.todo`, and bad-month is the Companion C colo quote
("a single tenant not renewing") verbatim. `demandCharges: true` — the amps are the
product (§5.6's power-headroom unlock gate). Honest gaps recorded: the regulator audit
and the fairness attestation have no registry mechanic; they ride the goal/meter/
scenarios until the registry-owner pass — same "bigger scaffold of nulls" verdict as
Types 7/8. The slice ships WITHOUT a rules block, same law as Types 3/4/5/6/7/8.

### Type 10 notes (official:colo, 2026-10-16)

The tenth hosting type, founded on the §1.3 GENERIC colo card ("Amps and Aisles" /
"Cage 7" / "The Landlord's Grid") — not a sibling of the exchange-colo variant. This is
the first card whose dominant verb needed neither re-authorsing (Types 6/7) nor
inference (Types 8/9): the card itself carries "Dominant verb: Negotiate" verbatim, and
that is the blessed route — ADR-0014 #D1 extended `TIER_EXTENDED_VERBS` in loader lint
with `negotiate` (and `schedule`), its consequence naming "Type-10 content lane —
generic colo founded on Negotiate." The verb claim needs no displacement argument: the
§0.3 scarcity row's columns ARE the card's law — scarce = power-and-cooling, fatality =
facility-level power event (the tenant that trips a shared breaker; "the cascade of
darkness goes through other people's racks" verbatim), unit = "A cabinet + amps" (§6.6's
"U / kW / cross-connect" cited-not-reconciled per owner law in economy._todo). The card's
Instrument/Negotiate/Enforce triad is the level's whole posture: the meter is the
clamp-attached cabinet power ledger with SOLD / USABLE / DRAWN readouts and a built-in
dispute event ("metering a tenant IS an act, not a given"), the combat is the ticket and
conversation system with tone options and a relationship meter (visitor.trustReadable
TRUE — the meter's verbatim home), and enforcement is the five-rung ladder (notice,
warning, billed overage, circuit cap, port disable) each rung priced in legal and
reputational cost. Hooks 5 of 9 vs the baseline anchor: R15 (meter triplet
cabinet-power-ledger / shortest-bar-margin), R16 (slider = power-billing-model —
"committed vs metered vs flat-per-cabinet ... **the** colo pricing decision, perfect
slider" verbatim), R17 (badge-policy-strictness / enforcement-ladder-setting /
remote-hands-tariff dials), R21 (keyhole + unclickableObjects TRUE/TRUE — the §0.2
control-granularity law, "objects simply cannot be clicked," the exact inverse of
exchange-colo's glass-house visibility and dedicated's door-level keyhole), R22 (8 new
mechanics + 2 riding). RIDE rows by design: R18 ms + no permanent clock — the honest
tension is ON RECORD in tempo._todo: the §"Time granularity changes" roster says verbatim
"Colo runs in **years** (the lease)"; the lease clock is authored where it fits without
falsifying a card-forced slot (multi-year contractTerms + escalator TRUE, 3–5-year
termStructure, the lease-calendar mechanics, §3.1's "loyalty 5 years"), while the tick
clock of the playable quarter is meter samples and ticket traffic — and claiming "years"
in simTimeScale would be a SIXTH changed hook, over the 3–5 budget with every other slot
card-verbatim-forced; R19 windowGrows false; R20 pips null — §0.2's two control sentences
name a landlord's pip CEILING without a spread and the pip row awaits its ruleset-card
pass (control._todo); R23 standard shed — the §3.2 resident law ("a colo
lease ... cannot be shed at all") leaves this line with nothing to re-order.
familyWeights customerAsThreat .35 / entropic .2 / systemic .2 / human .15 / malicious .1
— grounded in the doc's tenant-as-adversary sentences (§Tier-4 'abuse handling (your own
customers are now a threat vector)'; the §1.3 threat sentence is ten tenants long) with
the malicious share at the floor (tailgating and the drive-swap pretext ONLY, depicted as
consequences per §9.11 — no physical-security technique detail anywhere in pack or bundle).
Resident patience + all-or-nothing party ride the §3.2 exemplars and the seven-cabinets
party line; first-use credit stays type-9's. CAC is AUTHORED from the §6.6 Companion B
Colocation row ($2,000–15,000 sales cycle / 12–30 months fit-out / 0.05–0.2 payback +
remote hands) — the first colo card to price its funnel instead of placeholdering it.
scenarios.archetypeApplicability [Convert, Negotiate] — the FIRST corpus use of the
Negotiate scenario archetype, with §1.5 "The Landlord Renewal / Landlord Squeeze" (+60%
quote, three doors: negotiate / sign longer / full physical migration) as its verbatim
exemplar. The slice ships WITHOUT a rules block, same law as Types 3/4/5/6/7/8/9/10.

### Type 11 notes (official:backup-archival, 2026-10-16)

The eleventh hosting type, founded on the §1.3 backup/archival card ("Restore Point" /
"The Vault" / "Bit Rot") — the colocation-lineage card the corpus passed over twice on
verb grounds: the Type-3 note records "Chosen over Backup/Storage because the §1.3 backup
card's dominant verb is Schedule — not one of the six invariant verbs (§1.9), so it would
ship on a VERB_SHIFT violation". The violation was the missing blessing; ADR-0014 #D1
blessed `schedule` onto `TIER_EXTENDED_VERBS`; the card now ships founded on its own line,
"Dominant verb: Schedule." verbatim — the second and final member of the #D1 pair consumed,
and the first time ANY shipped card claims a verb that had zero claiming cards before the
blessing. This is explicitly NOT the DRaaS card: the §1.3 split note ("wave-1 conflated
backup with DR... This entry is backup/archival (window, verification, bit rot, restore
time); DRaaS is separate — see 'Declaration Day'") keeps the standby-oversubscription level
unbundled. The §0.3 row's columns ARE the card's law — scarce = "Restore time, not storage",
fatality = "An unrestorable backup", unit = "A GB + an RTO" (§6.6's "TB protected + restore
SLA" cited-not-reconciled per the gb-vs-TB owner law). The engine seam for the verb predates
the card: the pipeline's patience vocabulary has carried mode "window" documented as
"hard cutoff (backup's 'window module')" since the audit fixes, and this bundle is its FIRST
corpus use — 'patience is the wrong model; use the window' (§3.2) is the doc commanding the
mode by name; party allOrNothing rides the doc's own chain exemplar ("an incremental is
worthless without its full") and durationClass BatchJob — "square = batch/job" — is worn for
the first time on the first card the class names as its exemplar. Hooks 5 of 9 vs the
baseline anchor: R15 (meter = durability-and-restore-freshness triplet — "backup shows
durability and restore-test freshness" verbatim, the paper-tag bound stat, the RTO-hourglass
face), R16 (slider = restore-SLA-tier-pricing — "Backup = restore-SLA tier pricing"
verbatim), R17 (durability-level / scrub-io-allocation / key-custody-stance dials — all
three card-named, the custody dial made a product decision by the §2.x trilemma "at the
Pricing Engine"), R18 (simTimeScale "hours" — "Backup runs in **hours** (the window)"
verbatim, and unlike type-10's years-tension this clock is PLAYABLE: the quarter is measured
in window-counts; permanentIncidentClock false — the hourglass appears once, judged, alone),
R22 (10 mechanics — backup-window-fit, hidden-durability-stat, restore-drill-cost-center,
bit-rot-decay, dedup-ratio-margin, egress-gravity-moat, ransomware-dwell-window,
key-custody-trilemma + triage-window/attention-grace riding their engine homes). RIDE rows:
R19 windowGrows false — the band grows only as catastrophe (the 26-hour overlap, the DST
shift), which is a threat not an economy; R20 pips null — the pip roster still names no
backup row (§0.2 R66); R21 keyhole/unclickable FALSE/FALSE — the HONEST INVERSION of
type-10 recorded on purpose: the landlord's wall is a locked door, the vault-keeper's wall
is a proof cost — every object is clickable and the one fact that matters is invisible
through all of them, which is what the fill-vs-stroke hollow checkmark teaches (you CAN
inspect; the inspection still lies until you buy the drill); R23 standard shed — the packing
optimisation §7.8 names as this level's gameplay is a player verb, not an authored ladder.
familyWeights entropic .30 / customerAsThreat .25 / malicious .15 / human .15 / systemic
.15 — the FIRST entropic-led book in the corpus, grounded in the card's closing thesis
("the enemy is entropy and the weapon is a maintenance schedule" verbatim) with the
customer share second (the threat sentence is customer-shaped from its first clause: the
silent stop, the day-400 request, the wrong volume) and the dwell holding the malicious
share at mid-field — consequence-only, dates and copies, never method (§9.11). CAC is
AUTHORED from §6.6 Companion B's backup row ("$400–1,500 | 6–12 months | 0.1–0.3, spiking
on restore") — the family row this card IS, priced for the first time by a backup card.
scenarios.archetypeApplicability [Escort, Schedule] — the FIRST corpus use of the Schedule
scenario archetype, which the §1.9 table itself pairs with this line first ("fit work into
windows (backup, HPC queue, satellite passes, change freeze)"), plus Escort whose exemplar
names "a restore". The goal threshold is deliberately null: the doc forbids the authored
scalar ("Make RTO a computed value from real measured throughput rather than a promise the
player types in"). Threat ids reuse eight registry entries with zero edits (mimic = the
zero-byte success, drizzle = bit-rot's speckle, hoarder = the 26-hour band, hydra = the 4am
desk, spiral = the silent-stop trust leg, tank = the restore surge running OUTBOUND,
table-scan = the window that spilled into the business day, plugin-compromise = the dwell
inside the retention); Debuffer debuts wave 4 per the every-4th role law. The slice ships
WITHOUT a rules block, same law as Types 3/4/5/6/7/8/9/10/11.

### Type 12 notes (official:dbaas, 2026-10-16)

The twelfth hosting type, founded on the §1.3 database card ("The Managed Database" /
"DBaaS" / "The Cellar" / "Read Replica") — and the first card in the corpus whose dominant
verb required a fresh owner law call. Every predecessor either named an invariant verb or
landed on an existing blessing (#D1's negotiate/schedule pair); the Cellar's card line reads
"Verb: isolate and throttle. The boss is a split brain." (§1.3 :2249 verbatim), and `isolate`
sat unblest on no roster until the session-6 owner ruling extended `TIER_EXTENDED_VERBS`
onto it (ADR-0015 route — the lint roster carried the member @7f47563 before this bundle did,
and the door member itself lands in sibling lane L-V: content identity first, per the Shield
precedent, mechanics second). **Throttle is the card's named successor and stays OFF the
roster** — it survives honestly as mechanics (noisy-tenant-starvation + the shed ladder),
recording the tension exactly as type-11 recorded its window: the doc gives this line TWO
verbs and the law blesses one. The §0.3 row's columns ARE the card's law — scarce =
"IOPS + durability", fatality = "Data corruption", customer = "App teams", unit =
"An instance + IOPS" — and the card's first sentence is the threat book: "You run the thing
that cannot lose data, for people who will write terrible queries against it."

**The differentiation row this card exists to write:** DBaaS and object-storage share a
fatal family and diverge on tense. Object-storage's "Silent data loss" is rot in STORED
data — a bit that went bad in the archive, discovered later, Shield's channel; dbaas's
"Data corruption" is divergence in LIVE state — two primaries both accepting writes NOW,
each looking healthy, reconciled by hand later, Isolate's channel. One breaks history; the
other breaks the now. The lookalike law (§1.5/§3.12) makes near-synonymous fatalities a
ship-blocker, so both bundles carry the sentence that separates them.

Visitor: the query itself (§3 "DBaaS — a query": "Small, chatty, millisecond-scale… one
unindexed full scan (400–4,000ms) can eat every slot you have. The Noisy Query's actual
weapon") — durationClass Session (the §3.3 "Query / connection" row holds a slot for its
connection, the class law), costPerInvocation "Per-instance-hour" (§3.3 verbatim),
retryAmplifies TRUE (§1.4 "every integration breaks at once and retries hammer you"),
patience sigmoid-budget with the ms band riding `_todo` PROVISIONAL-B (the binary
API-client alternative recorded-and-declined: this visitor IS the chatty query, and §1.4
proves it retries — unlike every predecessor, this line's patience claim is grounded in TWO
doc rows, neither of which is an authored scalar). trustReadable TRUE — the deliberate
inversion of type-11's hidden durability completes the trust triad: the colo tenant CANNOT
see in (door), the backup keeper sees the thing that cannot look back (proof cost), the dba
sees EVERYTHING — well-lit casks, stretching lag ribbons, stalled lock pulses (§8.10/§4.3
verbatim) — and the divergence hides anyway. Legibility is not truth.

Hooks 5 of 9 vs the anchor: R15 (meter = replication-lag-rubber-band triplet — "DBaaS shows
*replication lag*" §8.x verbatim, the rubber-band face §8.10 names), R16 (slider =
iops-tier-pricing, from the §6.6 unit column "instance + storage + IOPS"), R17
(connection-pool-ceiling / failover-aggressiveness / noisy-tenant-isolation-stance dials —
§3.3's exhaustion patience, §4.3's flapping failover, §2.5's per-tenant throttling), R22
(mechanics book — the doc's rosters carry no dbaas meter/slider/dial rows, so every dial is
card-grounded prose, honestly recorded), R23 (shedOrder = noisy-tenant-throttle-ladder —
"isolate and THROTTLE" plus §2.5's counter list verbatim: "per-tenant throttling and
isolation"). RIDES: R18 (ms — §3.3's "ms" column; §7.8e's time-granularity prose names
game/web/backup/colo cadences and NO dbaas row, so no scale claim is invented — contrast
type-11 which authored hours from "Backup runs in hours"), R19, R20 (pip spread unauthored —
§0.2 authors it for five wholesale-style lines only), R21 (false/false — the well-lit law).

familyWeights customerAsThreat .30 / systemic .25 / human .20 / entropic .15 /
malicious .10 (sum 1e6 micro-exact): the third customer-led book after colo/exchange-colo's
.35, but this one's lead threat ships with a HOME — §2.5's Full Table Scan entry is marked
✅ and names "(DBaaS, shared hosting)" outright; systemic at .25 is the §2.11 signature
cluster's own legs (Replication Lag, Split Brain, Long-Query Starvation, Backup Locks) plus
the Tier-3 lesson verbatim ("HA introduces its own failure class — split-brain, failover
storms and stampedes exist *because* you added redundancy"); entropic .15 is the durability
HALF of §0.3's pair — the other half is the entropic .35 book object-storage already keeps
(store-side); malicious .10 weather only, the card names no adversary. Eight signature
reuses, ZERO registry edits — the split-brain BOSS the card itself names has no registry id
(the §2.11 cluster names it, the registry lacks it), so it ships as envelope composition
(`melt-and-seam`) + mechanics + the `split-brain-divergence-state` nonPhysical buildable,
with the registry proposal riding `_todo` per the toll-fraud precedent.

Authored absences on record (§9.11 honesty): §7.8e time-granularity row, §7.8's meter/slider/
dial rosters, §5.6's mastery table, §1.9's Portable-Skill table (24 rows — backup's R18
precedent), §6.6 Companion B's cycle price (cac.dbaas.gravity-adoption-cycle authored
Companion-B-STYLE from the §6.6 row's own columns, no dollars invented — the doc carries
none), §6.6 Companion C's bad-month row, §0.x's fifth-axis roster (goal metric
replication-lag-and-zero-divergence authored per object-storage's precedent, threshold null
because §8.x forbids forging the scalar), and the doc's §2.11 "Split Brain" threat id.
Economy is the corpus's first verbatim-"high" margin row in §6.6 — placed in the GOLD band
("colo cross-connects, colo cabinets, backup/DR, DBaaS") — with the Lock-In dark twin cited
as the churn law ("gravity is retention until the day it is resentment"). Scenarios
[Convert, Diagnose] — Convert repeats lawfully (exchange-colo precedent); Diagnose stays the
SOLE unclaimed invariant verb while its scenario archetype gets this line's split-brain
reconciliation play, the closest the corpus has come to grounding the last slot without a
law call. Wave slice w5 carries the boss beat at par 100 (240-unit scale, clamp-inert under
D-7); Debuffer+Splitter debut at w4 per the every-4th role law; three lookalike seeds
re-worn, no sixth invented.

### Type 13 notes (official:observability, 2026-10-17)

The thirteenth hosting type, founded on the §1.3 monitoring card ("Who Watches" /
"Cardinality", :2622-2657) — and the first card in the corpus to claim one of the ORIGINAL
SIX invariant verbs through a bless route instead of a naming. No §1.3 card ever wrote the
word "Diagnose" as a dominant verb; ADR-0014 #D1(i) anticipated exactly this card by
allowing Diagnose to be "blessed onto a card whose §1.3 prose implies it", and the prose
passes that door four times over: "Diagnosis is the actual gameplay" (:27179 verbatim, the
Symptom-vs-cause section the card feeds), the flatline riddle "every customer's graph going
to zero simultaneously, and you cannot tell whether the internet died or you did"
(:2653-2654 verbatim — the fatality IS a diagnosis problem), "§7.6 (you are the fog
vendor)" (:2657 — the card names its own gameplay loop), and the §1.9 Portable-Skills row
"Your customer's carelessness is your capacity plan" (:5059, quoted verbatim as the line
that transfers). The owner authoring-time confirm #D1(i) demands landed 2026-10-17;
ADR-0016 records the route at closeout (this lane reports, does not author). Unlike every
tier-extension predecessor, Diagnose needed no roster extension — `INVARIANT_VERBS` has
carried it since the lint existed — so this bundle consumes no #D1 blessing and adds no
member. It completes the set: SIX invariant + SEVEN extended verbs ALL claimed, the roster
EXHAUSTED at thirteen. The door-mechanic gap rides unchanged (content identity first, per
the Shield precedent); #D1(i) is a card-identity bless only.

**The honest absence that ships first:** observability is the FIRST shipped type with NO
§0.3 scarcity row — the table ends at satellite-ground, and the doc carries no
monitoring/observability line there. The law said never forge a row; the card's own
four-axis block does the work instead, verbatim: unit = "an ingested metric, log line or
trace span" (:2625), scarce = "write throughput and series cardinality — *the number of
unique metric streams, not the volume of data*" (:2625-2626), fatal = "being down during
everyone else's outage" (:2626), customer = "every other ops team, the most demanding and
most technical buyers alive" (:2627-2628). Companion B prices no revenue cycle for this
line either (no observability row beside the DBaaS one), so
`cac.observability.cost-attribution-adoption-cycle` is authored Companion-B-STYLE from the
card's own support-tools row ("a cost-attribution dashboard you give the customer so they
police themselves", :2635-2636), no dollars invented — the dbaas/serverless absence
precedent, disclosed in `_provenance`.

Visitor: the metric series itself (§3 "Observability host — a metric series": "**The only
visitor whose arrival is permanent.**" :12690-12695 — "Not a request — a *stream that
never ends*. Its cost is its cardinality rather than its volume"). That row is what makes
the visitor RESIDENT, the corpus's second after exchange-colo's cabinet lease:
durationClass Resident, patienceModel mode "resident" with null params riding `_todo` (the
PATIENCE_MODE_VOCAB precedent), stats.patience null — you cannot time-out something that
never leaves. Its cost law is §3's own sentence: one label, forty million streams, no
extra traffic at all. retryAmplifies TRUE (§1.3 :2649-2650 — "the 'everyone's agent
reconnects at once' storm after your own blip"); trustReadable TRUE (the wall shows
everything and the flatline hides anyway — the dbaas legibility-is-not-truth inversion,
now with the HUD literally being the world); cohortSpawn tier 3 (every other ops team runs
an agent); costPerInvocation per-series-month, the card's unit sentence wearing a bill.

Hooks 5 of 9 vs the anchor — the dbaas changed set exactly (R15, R16, R17, R22, R23):
R15 (meter = cardinality-gauge-fan triplet, meterFace paired — "the **Cardinality Gauge**,
drawn as a fan of threads that visibly splays" :2652 verbatim, bound stat series-cardinality
:2625-2626), R16 (slider = layer-tier-pricing, grounded in §6.6 A's own upkeep row
"Monitoring (per layer) — $80 / $150 / $400 / $700 / $1,100" :25537 and Sheet B's stack row
:25573 — layers priced by the doc, dollars quoted not invented), R17
(resolution-vs-retention-dial / alert-path-priority / sampling-rate — "you can keep a year
at 5 minutes or a week at one second, not both" :27167-27169 verbatim, "prioritise the
alert path over the data path — a visible, buildable split" :2640-2641, and §4.6's
"cheaper, blinder upgrade that is realistic and tempting: sampling" :16765), R22 (mechanics
book: cardinality-bomb, series-drop-ledger, alert-path-split, dumb-canary-watchdog,
correlated-demand, retention-cost-spiral, dead-man-switch, the reused triage-window, plus
card-grounded log-loop-feedback ("the log line that is itself a log line", :2645-2646) and
sampling-resolution-trade), R23 (shedOrder = cardinality-drop-ladder — the corpus's first
card where shedding drops DATA, not requests; HONEST ENGINE GAP in `_todo`: the engine
sheds requests, this ladder sheds series, mechanics-level only until an engine lane grows
the verb). RIDES: R18 (ms tick stays — claiming hours/years would be a sixth changed hook
over the 3-5 budget; the retention-MONTHS money clock rides as contract law exactly as the
colo lease-years tension rode, disclosed in `tempo._todo`), R19 (false), R20 (pips null —
the pip spread is unauthored for this line), R21 (FALSE/FALSE — the deliberate ANTI-keyhole
pair: "wall-to-wall graphs — **the only line where the HUD and the world are the same
thing**" :2651; a card that literally IS the dashboard does not get fogged glass).

familyWeights customerAsThreat .35 / systemic .30 / human .15 / malicious .10 / entropic
.10 (sum 1e6 micro-exact, each cited from card prose): the customer lead is the whole
thesis ("Their carelessness is your capacity plan" :2623 + the UUID-label bomb :2630-2632)
— the corpus's purest customer-as-threat book, tied with exchange-colo's .35, but here the
threat's weapon is competence-free authoring rather than greed; systemic .30 is correlated
demand ("your capacity planning is **anti-correlated with your own reliability**"
:2637-2638) + the reconnect storm :2649-2650 + monitoring-as-dependency ("the monitoring
system itself as a dependency that can die and leave everything green forever"
:16761-16762); human .15 is the log loop :2645-2646 and the 400GB/day debug plan :2649;
malicious .10 weather only — the card names no adversary, the scanner arrives as someone
else's bad day; entropic .10 the retention spiral ("a promise you make at signup and a
bill you pay forever" :2647-2648). Eight signature reuses, ZERO registry edits —
noisy-query-table-scan (the year-long scan :2649), hoarder-noisy-neighbor (the label hoard
:2630-2632), ticket-avalanche-hydra (the reconnect storm :2650), mod-update-day (the agent
fleet's own upgrade day), scanner-drizzle (wave-1 recon), layer7-mimic (the silent-drop
window :2633-2634), empty-server-spiral (the retention spiral wearing its cost costume
:2647-2648), grudge-booter (the alert-path pile-on :2639-2641); the FLATLINE and the
LOG-LOOP carry registry proposals in `threats._todo` per the toll-fraud and split-brain
precedents rather than minting ids unilaterally.

Authored absences on record (§9.11 honesty): the §0.3 row (first type to ship without one
— above), the Companion B/C rows, §7.8's meter/dial rosters (no observability entries —
every dial is card-grounded prose, the dbaas posture), §5.6's mastery table (the unlock
authors from §5.6's own Sense branch instead: the Availability ladder's "Monitoring →
Alerting" rungs :20642-20643 become prereqSets tech [monitoring, alerting]), and the doc's
flatline/log-loop threat ids. Goal threshold null per the object-storage→dbaas→backup
chain; loseCondition kind "blind-flatline" is a free string per schema (siblings:
data-corruption / unrestorable-backup / toll-fraud) — the fatality is epistemic, not
electrical: "you cannot tell whether the internet died or you did". Scenarios [Diagnose,
Endure] — the FIRST shipped use of the Diagnose scenario archetype the dbaas notes recorded
as "the closest the corpus has come" while that lane stayed honest; now the real one rides.
Wave slice RULES-FREE, par 25/60/30/75/100, w5 at the 240 authored scale (clamp-inert under
D-7; max authored across the thirteen), hard waves ≤2 denominations, fresh Debuffer+Splitter
debut at w4 per the every-4th role law, w5 finale draws {bandwidth, hands} (the alert path
needs hands; the ingest needs pipe), and the flatline ships as envelope composition
(`flatline-finale`) + the `blind-flatline` fatality — the doc gives this catastrophe NO
threat id and none is forged. Two lookalike seeds re-worn (`scanner-drizzle`→`crawler`,
`layer7-mimic`→`power-shopper`), no sixth invented. Pack: 66 templates, decision 37 /
flavour 29, zero era objects (bundle eras null/null — the era grid dates no hosted-
observability cell; the era-owner pass decides the 2016-cloud sketch), refusal×5 /
status.rung×5 / vendor×4 byte-identical to siblings. `type.observability.name` pins the
heading's FIRST segment ("Who Watches") because the §Key literals sync extracts the first
double-quoted span per row; the codename "Cardinality" rides `type.observability.codex`.

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
matches `PROVISIONAL-[ABC]` or `RATIFIED-[ABC]` (the RATIFIED arm arrived with the ADR-0014 #D4 label sweep @caa4d17) · wave files re-check §1.7 authoring rules (≤4
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
(377 since the type-13 observability authoring pass 2026-10-17; 343 at type-12, 311 at type-11, 278 at type-10, 245 at type-9, 212 at type-8, 186 at type-7, 159 at type-6, 133 at type-5, 108 at type-4, 84 at type-3, 63 at wave-1) is untouched by
pack authoring — no test pins the printed number, though sibling lane memory
quotes the wave-1 figure.

## The authoring laws this directory obeys

| Law | Source | In practice here |
|---|---|---|
| **Three-Change** | §0.2 | A type ships only if ≥3 of the six Ruleset-Card slots change vs existing types. shared-web and game-servers differ on Unit, Scarce, Patience-Analog, Threat-Mix, Look (5 of 6). mail-hosting differs on Unit (message), Scarce (ip-reputation), Goal (recipient-inbox), Threat-Mix and Look — loader lint reports 5 of 9 §7.8 hooks changed vs the anchor (within the 3–5 budget). dns-hosting differs on Unit (query), Scarce (anycast-pop-capacity), Goal (authoritative-answer), Threat-Mix and Look — likewise 5 of 9 hooks changed vs the anchor, clean pairwise against all three siblings. dedicated differs on Unit (inquiry), Scarce (rack-space), Goal (server-delivery), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor, clean pairwise against all four siblings. object-storage differs on Unit (object request), Scarce (durability-nines), Goal (stored-object integrity), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor, clean pairwise against all five siblings. trunk-group-voip differs on Unit (call), Scarce (jitter-and-packet-loss), Goal (toll-fraud fatality), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor, clean pairwise against all six siblings. serverless differs on Unit (invocation), Scarce (warm-capacity), Goal (warm-execution / blast-radius fatality), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor, clean pairwise against all seven siblings. exchange-colo differs on Unit (cabinet lease), Scarce (cable-length), Goal (equalized-floor / fairness-breach fatality), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor (R15, R16, R17, R18, R22), clean pairwise against all eight siblings. colo differs on Unit (cabinet + amps), Scarce (power-and-cooling), Goal (shortest-bar hold / facility-power-event fatality), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor (R15, R16, R17, R21, R22), clean pairwise against all nine siblings. backup-archival differs on Unit (job chain), Scarce (restore-time), Goal (rpo-rto-restore-success hold / unrestorable-backup fatality), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor (R15, R16, R17, R18, R22), clean pairwise against all ten siblings. dbaas differs on Unit (query / connection), Scarce (iops-and-durability), Goal (replication-lag-and-zero-divergence hold / data-corruption fatality), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor (R15, R16, R17, R22, R23), clean pairwise against all eleven siblings. observability differs on Unit (the metric series — the stream that never ends), Scarce (write-throughput-and-series-cardinality), Goal (series-completeness-and-alert-delivery hold / blind-flatline fatality), Threat-Mix and Look — 5 of 9 hooks changed vs the anchor (R15, R16, R17, R22, R23), clean pairwise against all twelve siblings. |
| **Verb-Shift** | R4, §0.2, ADR-0013 #14 | A type ships only if the MOST-PERFORMED verb shifts: shared-web = **Triage**, game-servers = **Place & Connect**, mail-hosting = **Tune**, dns-hosting = **Commit**, dedicated = **Observe** (§1.3 card verbatim; one of the six invariant verbs, never a 7th, §1.9). object-storage = **Shield** — the first card grounded on ADR-0005's ratified per-tier roster via loader `TIER_EXTENDED_VERBS` (ADR-0013 decision 14); the card's §1.3 line named Observe, held by dedicated, so it re-authored onto Shield (see Type 6 notes). Shield is content identity, not a door `PLAYER_VERBS` member — the door-mechanic gap ships as a MODULE-STATUS gap row. trunk-group-voip = **Maintain** — the route's second card (see Type 7 notes), likewise content identity without door support. serverless = **Scale** — the route's third card (see Type 8 notes), and the first case with no dominant-verb line on the card at all to overwrite or displace; Scale is verbatim-grounded in "scale to zero" (§1.3 + §4.2). exchange-colo = **Sell** — the route's fourth and FINAL tier-extension card (see Type 9 notes), second with no dominant-verb line on the card to overwrite or displace; Sell is verbatim-grounded in "microseconds are what you sell" / "you sell *equal* latency as a product" (§1.3) plus the Verb Shift Rule family row "Colo: sell space and police power". The original tier roster is exhausted (Scale · Shield · Maintain · Sell all claimed) and Diagnose remains the sole unclaimed invariant slot — but the owner law call a tenth type needed arrived as ADR-0014 #D1: it blessed negotiate (and schedule) onto `TIER_EXTENDED_VERBS` precisely so the §1.3 generic-colo card could ship founded on its OWN verbatim line "Dominant verb: Negotiate". colo = **Negotiate** — the first card needing neither re-authorsing nor inference: no displacement argument, no grounding gap. Negotiate is likewise content identity, not a door `PLAYER_VERBS` member — the door-mechanic gap row rides unchanged. backup-archival = **Schedule** — the FIRST card founded on a roster verb that had zero claiming cards: the §1.3 card names "Dominant verb: Schedule." verbatim, consuming the second and final ADR-0014 #D1 blessing; the blessing pair (negotiate/schedule) is fully spent and the roster census now runs Triage · Place&Connect · Tune · Commit · Observe · Shield · Maintain · Scale · Sell · Negotiate · Schedule with **Diagnose the sole unclaimed invariant slot** — a twelfth type needs a card that grounds a claimable verb or a fresh owner law call. Schedule is likewise content identity, not a door `PLAYER_VERBS` member — the door-mechanic gap row rides unchanged, with one honest difference recorded in the bundle: the patience window module (mode "window") is a real engine seam built and named for this line, first used here. dbaas = **Isolate** — the TWELFTH card and the seventh verb outside the original invariant six, the FIRST whose grounding required a fresh owner law call rather than an existing blessing: the §1.3 card line "Verb: isolate and throttle. The boss is a split brain." (:2249 verbatim) names Isolate outright, and the session-6 owner ruling extended the roster onto it (ADR-0015 route; loader `TIER_EXTENDED_VERBS` carries `isolate` @7f47563, predating this bundle). Throttle is the card's named successor and stays OFF the roster (it survives as mechanics, per ADR-0014 #D2 posture); the door member itself lands in sibling lane L-V. The roster census now runs Triage · Place&Connect · Tune · Commit · Observe · Shield · Maintain · Scale · Sell · Negotiate · Schedule · Isolate with **Diagnose the SOLE unclaimed invariant slot** — no §1.3 card names it, so a thirteenth type needs either that bless-card or another owner law call. One lawful collision is recorded rather than hidden: the §1.3 CI/build-farm card (:2679) also names "Verb: isolate, expire, reclaim" — a second card claiming Isolate is VERB_SHIFT-legal (two lines may share a verb; dedicated/serverless set the repeat precedent), and the doc's own Incident Mode verb sets (:26759 "isolate / failover / roll back / shed / communicate / escalate", :28826 "restart, isolate, shed") corroborate the word's engine grounding. observability = **Diagnose** — the THIRTEENTH card and the first claiming one of the original invariant six through a blessing rather than a naming: no §1.3 card ever wrote the word, and none needed to, because ADR-0014 #D1(i) blesses Diagnose "onto a card whose §1.3 prose implies it" — the "Who Watches" / "Cardinality" card passes that door on four independent prose anchors ("Diagnosis is the actual gameplay" §Symptom-vs-cause :27179 verbatim; the flatline riddle "and you cannot tell whether the internet died or you did" :2653-2654; "§7.6 (you are the fog vendor)" :2657; and the §1.9 Portable-Skills row "Your customer's carelessness is your capacity plan" :5059). The owner authoring-time confirm the clause demands landed 2026-10-17; ADR-0016 records the route at closeout. Unlike the seven tier-extension verbs, Diagnose sat on the lint roster from day one (`INVARIANT_VERBS`), so this card consumes NO #D1 blessing and adds NO roster member — and it never claims the §1.3 generic-monitoring card by renaming: the bless route is the card's own prose. The roster census now runs Triage · Place&Connect · Tune · Commit · Observe · Shield · Maintain · Scale · Sell · Negotiate · Schedule · Isolate · Diagnose — SIX invariant and SEVEN extended verbs ALL claimed: **the roster is exhausted at thirteen**, and a fourteenth type needs a fresh owner law call (a new verb, a merge, or a re-claim law). Diagnose is likewise content identity, not a door `PLAYER_VERBS` member — the door-mechanic gap row rides unchanged. |
| **Rosetta Card** | R11 | One canonical engine metric + one player-language alias + one joining line. Both anchors carry doc-verbatim lines (table below). |
| **3–5 budget** (handover) | R10, §1.9 | `handoverNote` is EXACTLY 3 keys: runsOut / killsYou / customerWants, diegetic sheet-on-desk voice. Schema enforces maxProperties 3. |
| **20% palette** | §1.9 | New type ≤20% replacement of the build palette; 80% known objects (`buildables.paletteRef: "palette:shared-80"` — authored in `palettes/shared-80.json`, validator-enforced). All shipped types compose from the shared `concurrency-pool` + `two-face-rack` archetypes (plus `control-plane` in twelve skins, web's cPanel, mail's webmail, dedicated's ipmi-console, dns's zone-editor, object-storage's bucket-policy, trunk-group-voip's fraud-desk, serverless's metering-plan, exchange-colo's audit-desk, colo's noc-desk, backup-archival's vault-desk, dbaas's cellar-desk and observability's watch-desk); the `matchmaker` archetype is the R61 reserve's first shipped verb-changer (14 of 15 slots remain unbuilt). |
| **Five-Asset Skin Kit** | R48/R49/R53, §8.10 | Exactly: 1 palette (accent+secondary) · 2 visitor costume (hull+prop) · 3 ONE hero silhouette · 4 bespoke meter face · 5 bespoke catastrophe FX (+ ambient sound swap). Everything else = parameters of shared systems ("five assets plus eight parameter values"). Author order: METER FIRST. |
| **Localisation law** | R46 + owner directive | **ALL human strings are i18n keys** resolved through the bundle's `ticketPack` file. No literal prose, no joke text in bundles. The packs ARE the authored English: `packs/*.i18n.json` carry every string, split into a sober `decision` namespace (shown while deciding or losing — §9.3 clauses 2–3) and a comedic `flavour` namespace (quiet surfaces only); the validator enforces the wall by root vocabulary and refuses any bundle-referenced key that strays into flavour. |
| **Pruning rule R36** | WS-3, §2.12 | A threat earns a mechanical slot (stats + counters) only if it CHANGES THE PLAYER'S VERB, not just the noun. Everything else is Codex flavour attached to a mechanical entry. |
| **Second Answer** | §5.1 | Every registry threat has ≥2 viable counters at DIFFERENT prices (cheap / expensive / lateral triad). Validator enforces. |
| **Visual Coverage** | §8.18, OD-12(d), ADR-0013 ruling 5(d) | The screen must be able to draw every shipped entity, or the content must say otherwise: every threat, visitor archetype, and palette archetype carries a `visual` slug grounded in the design-doc prose (`the-elbow` §2.10, `slow-wall` §2.3, the §3.1 duration-class primitives) or an explicit `codexOnly: true` tag. The validator fails absence and malformed slugs red. All 16 shipped threats are mechanical (R36) and every slug is doc-grounded, so zero codexOnly tags ship today — the hatch exists for future demotions. |
| **Lookalike (rule-masking)** | §2.4, OD-18, ADR-0013 ruling 9 | A mimic threat may declare `lookalikeOf`: the visitor archetype it masquerades as — a costume on the visitor roster, never a new entity. Direction is one-way (an archetype carrying `lookalikeOf` fails red); the id must resolve in the visitors registry. Five mimic seeds ship across the thirteen bundles: shared-web `layer7-mimic`→`power-shopper` · game-servers `cheat-client-griefer`→`game-player-joining` · mail-hosting `xmlrpc-pingback-amplifier`→`api-client` · dns-hosting `slowloris-sipper`→`deep-reader` · dedicated `scanner-drizzle`→`crawler` — object-storage and trunk-group-voip each carry TWO of these seeds (`slowloris-sipper`, `scanner-drizzle`) by reuse rather than adding a sixth, and serverless carries two (`xmlrpc-pingback-amplifier`, `slowloris-sipper`) — the amplifier seed crossing lines for the first time, the recursion wearing the pingback swarm's costume (§1.3's self-invoking function re-framed onto the registry's one amplification engine), and exchange-colo carries two more (`layer7-mimic`, `cheat-client-griefer`) — the anchor's own seed re-worn on the ninth line and the griefer seed crossing over — and colo carries the crawler seed (`scanner-drizzle`) as the tenth line's lookalike carrier; backup-archival carries two (`layer7-mimic`, `scanner-drizzle`) — the anchor's own seed re-worn on the eleventh line for the checkmark that masquerades as a completion, and the crawler seed worn again for bit-rot's first speckle — and dbaas carries THREE of the five by pure reuse (`slowloris-sipper`→`deep-reader` as the connection-holding crowd that exhausts the pool, `layer7-mimic`→`power-shopper` as the replica "serving stale data with a straight face" (§4.3 verbatim lineage), `scanner-drizzle`→`crawler` as wave-1's recon weather) — and observability carries two (`scanner-drizzle`→`crawler` as wave-1's recon drizzle, the probe finding which wall is watching, and `layer7-mimic`→`power-shopper` as the silent-drop window: the tenant whose shed series fall with a straight face, "a perfect Friction tower" (:2633-2634 verbatim)) — still no sixth seed. Bundles legitimately reuse signature ids, so the lint enforces ≥1 seed per bundle rather than exactly-one — the mask rides the registry entry, so reuse inherits the law by design. |
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
| `handover.exchange-colo.runs-out` | "Your metres and your hands. A floor with no survey cadence is a promise you cannot attest; a NOC that spends its hands on the rewrap has none left for the regulator, and the audit window does not re-schedule for your staffing." | §0.3/§1.3 |
| `handover.exchange-colo.kills-you` | "The 40ns advantage: one tenant measurably closer than the others — 'and the others riot (angry client sprites with lawyers)' — the breach that never breaks uptime, spends the building's word instead, and arrives already written in arithmetic no apology can round." | §1.3/§0.3 |
| `handover.exchange-colo.customer-wants` | "The cabinet three metres closer — and they want it at the same latency as everyone else's contract says they should: 'you sell *equal* latency as a product' (§1.3), which is the one thing on this floor they cannot buy twice." | §1.3 |
| `rosetta.exchange-colo.equalization` | "Cable-spool equalization is the cgroup cage pointed at photons: the same bet that a bounded neighbour is cheaper than an unbounded one, enforced now in metres instead of memory — shared-web cages what a tenant runs, this line cages how far their light travels." | §1.9 |
| `rosetta.exchange-colo.renewal` | "The multi-year lease cliff is the renewal cliff measured in years: shared-web's cohort leaves at the promo rate's end because renewals are cheap; a colo tenant leaves when the 3–5 year term ends because everything else is — the cliff shape is the same and the unit is a signature." | §1.9 |
| `verbs.exchange-colo.transfer.1` | "Geometric-fairness discipline transfers everywhere: any line that sells sameness now asks you the same question — what does it cost to prove the promise, who audits your units, and what happens the day one customer measurably gets more of the equal thing than another?" | §1.9 Portable Skill idiom + §1.3 cable-spool law (authored — see Type 9 notes) |
| `economy.exchange-colo.bad-month` | "A single tenant, not renewing: a 3–5 year cliff arriving as one signature, and the amps it held suddenly worth a competitor's tour group." | §6.6 Companion C (Colocation row) |
| `goal.exchange-colo.binding` | "Metres and hands, not cores: the floor's whole promise is a skew that stays at zero, the promise is audited by someone else's calendar, and the hands that re-spool a coil are the same hands that answer the regulator — the product is equal latency and it is enforced by you, live, on every rack at once." | §1.3 |
| `type.exchange-colo.name` | "The Microsecond Cathedral" | §1.3 |
| `handover.colo.runs-out` | "Your headroom and your hands. A floor sold against derated amps has no room for someone's bad Tuesday, and a desk whose hands are all walking aisles has none left for the tickets multiplying behind them — the meter does not care which obligations you chose." | §0.3/§1.3 |
| `handover.colo.kills-you` | "The facility power event: a tenant trips a shared breaker and the cascade of darkness goes through other people's racks — the failure you did not touch, did not see and did not sell, arriving as the building's own physics through cabinets you cannot legally open." | §1.3/§0.3 |
| `handover.colo.customer-wants` | "The gear they are not allowed to fix: 'reboot rack 7', tonight — a request that means something different to everyone involved, answered through a door you cannot open, at an hour the dock stopped counting as business." | §1.3 |
| `rosetta.colo.amp-caging` | "Committed-amp caging is the cgroup cage pointed at the breaker panel: the same bet that a bounded neighbour is cheaper than an unbounded one, enforced now in derated circuits instead of memory — shared-web cages what a tenant runs, this line cages what their wall outlet can give them." | §1.9 |
| `rosetta.colo.renewal` | "The renewal lever is the renewal cliff with the landlord's handwriting on it: shared-web's cohort leaves at the promo rate's end because renewals are cheap; a colo tenant leaves at the 3–5 year boundary because the fit-out does — and here the cliff is not weather, it is a date you can move with a signature." | §1.9 |
| `verbs.colo.transfer.1` | "Negotiation-with-a-ladder-behind-it transfers everywhere: any line that sells shared capacity now asks you the same question — what do you meter when you cannot inspect, what does enforcement cost you in relationship, and what is your answer at 2am when the person at the door has a work order and no cabinet number?" | §1.9 Portable Skill idiom + §1.3 negotiation-ladder law (authored — see Type 10 notes) |
| `economy.colo.bad-month` | "A single tenant, not renewing: the 3–5 year cliff arriving as one signature at the renewal table, and the amps it held suddenly worth a competitor's tour group walking past your dark row." | §6.6 Companion C (Colocation row) |
| `goal.colo.binding` | "Amps and hands, not cores: the shortest of the space, power and cooling bars decides what you may sell, the gear you must keep happy is behind doors you cannot open, and the same hands that walk the aisle answer the ticket that means something different to everyone involved — the product is capacity you are not allowed to verify." | §1.3 |
| `type.colo.name` | "Amps and Aisles" | §1.3 |
| `handover.backup-archival.runs-out` | "The night. You never run out of disk — you run out of night; jobs that don't finish by {closeHour} didn't happen, and the band will not widen for anybody's feelings (§1.9's own backup handover, verbatim in shape)." | §0.3/§1.9 |
| `handover.backup-archival.kills-you` | "An unrestorable backup (§0.3 failure column verbatim): not an outage, not a storm — a readout showing static where a year of green checkmarks promised a file, discovered at restore time, in public, on the only metric that was ever being graded." | §0.3/§1.3 |
| `handover.backup-archival.customer-wants` | "Tuesday's file: nobody cares how fast you are, they care whether it comes back — one crate, one chain, one red seal, one hourglass; the whole product is the answer to a phone call you hope never arrives (§1.9's own customerWants line, verbatim in shape)." | §1.9 |
| `rosetta.backup-archival.window` | "The backup window is your maintenance window with the calendar weaponized (§1.9 Rosetta law, different ink): shared-web freezes the business day to touch the live floor; this line IS the frozen window — a Gantt-like bar every job on every board eventually learns it cannot overrun, because here the maintenance window does not protect the work from the customers, it protects the customers from the work." | §1.9 |
| `rosetta.backup-archival.gravity` | "The gravity lock is the renewal cliff with its polarity reversed: shared-web's cohort leaves at the cliff because renewal is cheap, and this line's cohort stays because leaving is the bill — 'the switching cost is the egress bill' (CEO truth §1.3) — so the date that renews the account is the date the customer last priced their own data going home." | §1.9 |
| `verbs.backup-archival.transfer.1` | "Window-thinking transfers everywhere: any line that fits work into a finite box now asks you the same question the band asks at dusk — what finishes tonight, what is deliberately left outside with a red seal, and what do you tell the person who discovers the schedule moved without telling them? The maintenance window was always a backup window with the paperwork filed under someone else's name (§1.9 Rosetta, different ink)." | §1.9 Portable Skill idiom + §1.3 window/night handover (authored — see Type 11 notes) |
| `economy.backup-archival.bad-month` | "A restore that fails in public (§6.6 Companion C, verbatim): one declared disaster, one hourglass, one console showing static where a customer expected Tuesday — and the quiet six-month arithmetic of every drill you skipped arriving in the forty seconds it takes to find out whether the last year of green checkmarks meant anything." | §6.6 Companion C (Backup / DR row) |
| `goal.backup-archival.binding` | "Night and proof, not cores and uptime: the band that closes at {closeHour} decides what you may promise, the durability that decides everything is hidden until you pay to see it, and the hands that walk the aisle at dusk are the same hands that answer the phone at four — the product is a Tuesday's file and the only instrument is yesterday's drill." | §1.3 |
| `type.backup-archival.name` | "Restore Point" | §1.3 |
| `handover.dbaas.runs-out` | "The pool. Every connection held is a slot sold twice in someone's imagination; when the ceiling lands the door stops opening for new queries — 'Connection pool exhausted' (§3.3's patience column, verbatim), the number-one real cause of the site being down (§4.3, verbatim lineage)." | §3.3 |
| `handover.dbaas.kills-you` | "Data corruption (§0.3 failure column verbatim): not an outage, not a storm — two primaries both accepting writes and one honest question with two true-looking answers, discovered when the ledgers are compared by hand, in public, on the metric the whole line exists to hold." | §0.3 |
| `handover.dbaas.customer-wants` | "To place an order and see it: one write, one read, one truth, in that order, at millisecond scale — 'I placed my order and it's gone' (§4.3 verbatim) is the only sentence on this floor that has ever ended a contract; the replica may lag, the answer may not." | §4.3 |
| `rosetta.dbaas.window` | "The major-version window is the maintenance window with the landlord switched: shared-web freezes the business day to touch the live floor; here the calendar belongs to a dependency you don't own, arriving at a time chosen by someone else, and the card itself prices the politics — 'a maintenance window your customers will not accept' (§1.3 verbatim). The upgrade is the same cable, walked from the wrong end." | §1.9 |
| `rosetta.dbaas.gravity` | "The gravity tether is the renewal cliff read from the cellar: shared-web's cohort leaves at the cliff because switching is cheap, and this line's cohort stays because the data physically cannot afford the trip — 'very sticky (data gravity)' (§6.6 verbatim) — but the doc wrote the dark twin into the same law: gravity is retention until the day it is resentment, and a cohort that cannot leave starts architecting away." | §6.6 |
| `verbs.dbaas.transfer.1` | "Isolation-thinking transfers everywhere: any line that lets tenants touch one shared thing now asks the question the drum asks at peak — which workload do you clamp so the others can breathe, who answers for the divergence between two true-looking copies, and when did 'both are up' stop meaning 'both agree'? The incident room said it first (the §7.8 set names isolate outright); the Cellar just sells it monthly." | §1.9 |
| `economy.dbaas.bad-month` | "The corrupt commit every replica copied (§0.3's failure word 'Data corruption' wearing the level's own physics): one write forked in a quiet second, two ledgers each looking fine, and the discovery that the thing that cannot lose data lost the same minute twice — high margin, very sticky, and gravity only holds what was never diverged. Companion C prices no row for this line; the bad month is composed from its columns, and the absence is on record." | §0.3/§4.3 |
| `goal.dbaas.binding` | "Slots and truth, not storage and hours: the pool that exhausts at {hour} decides what the day may promise, the lag ribbon stretched between two casks decides who is reading yesterday, and the witness in a third failure domain is the only object that makes a second primary illegal — the product is the write both ledgers agree on and the only instrument is the quorum you paid for." | §1.3 |
| `type.dbaas.name` | "The Cellar" | §1.3 |
| `handover.observability.runs-out` | "Series headroom and the alert path. Their carelessness is your capacity plan: one label containing a UUID, one deploy at 3am, four thousand streams into forty million — 'instantaneous, customer-triggered, and invisible until it lands' (§1.3 verbatim) — and the limiter that saves the floor eats the data they are paying you to keep, a Friction tower by design." | §1.3 |
| `handover.observability.kills-you` | "The flatline (§1.3 verbatim catastrophe): every customer's graph going to zero simultaneously, 'and you cannot tell whether the internet died or you did' — the line where the HUD and the world are the same thing dying together. Second act of the same sentence: you drop everyone's telemetry, every customer is blind during an incident, and some of those incidents are yours." | §1.3 |
| `handover.observability.customer-wants` | "To be told they're down before their own users are — and to be told the truth: 'a dropped alert is worse than a dropped metric' (§1.3 verbatim). The ops team that buys this floor buys priority for its pager over the tenant's own graph, retention that survives the company's bad quarter, and a canary too stupid to lie to itself about the wall." | §1.3 |
| `rosetta.observability.cardinality` | "Cardinality is the oversell ratio re-taught by physics: shared-web sells slots against a bet that tenants under-use them; this line sells unique streams against a bet that labels stay small — and §1.9 says it outright ('Cardinality is your concurrency limit, set by your customer', :5015). The cabling is identical to cgroup-caging: one tenant's silent excess is everyone's queue, the meter is the fan, the shed drops their newest series first." | §1.9 |
| `rosetta.observability.forever-bill` | "The forever-retention-bill is the renewal cliff with the polarity reversed: at shared-web the cohort leaves at the cliff because switching is cheap; here the cohort stays and the bill climbs anyway — 'keep everything for 13 months is a promise you make at signup and a bill you pay forever' (:2647-2648 verbatim) — gravity holding your own balance sheet to the floor. The cliff arrives not when they cancel, but when you cannot afford what you promised to remember." | §1.3 |
| `verbs.observability.transfer.1` | "Your customer's carelessness is your capacity plan." | §1.9 (:5059) |
| `economy.observability.bad-month` | "The blind quarter: your ingest queue backs up, you drop everyone's telemetry at once, and every customer is blind during an incident — and some of those incidents are yours. Being down during everyone else's outage is the fatality with no row in the bad-month table, so the table learned a new column: nobody renews with a vendor whose wall went dark mid-sentence." | §1.3 |
| `goal.observability.binding` | "You are the thing that tells everyone else they're down, and you are contractually the pager — so the quarter is held on two promises at once: every series kept, every alert delivered, at whatever the internet is doing somewhere else right now. The fan of threads that visibly splays is the scoreboard; the wall's fullness is the score." | §1.3 |
| `type.observability.name` | "Who Watches" | §1.3 |

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
