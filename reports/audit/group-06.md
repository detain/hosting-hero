# GROUP g06 — hosting_game.md 5996-7151 (§2 Threats head, 2.1 taxonomy, 2.2 weather, 2.3 floods, 2.4 mimics, 2.5 app/data)

## MANIFEST

5996|1|2. Threats|PARTIAL|-|umbrella: role/family/band/denomination vocabularies + 16-threat registry shipped; most named threats are Phase-2 content
5998|2|2.1 Threat design principles and the role taxonomy|PARTIAL|-|strongest-shipped subsection: 9 of 23 rows DONE (vocabularies, laws, coverage grid), 15 PARTIAL, 1 MISSING
6000|3|The five axes of threat distinctiveness|PARTIAL|47b2c33|denomination quota shipped as AUTHORING_LAWS.maxThreatsPerDenominationPerLevel=4 + registry role/denomination fields; counter-shape via counters.defenseRole; full five-axis dedup audit not mechanized
6015|3|The four damage currencies|PARTIAL|b7e262c|Cash (economy money buckets), Churn (economy/churn.ts), Reputation (denomination vocab + pipeline state), Capacity (topology) all exist mechanically; the four-way HUD colour-code scheme itself not shipped
6028|3|Every threat is quoted in dollars and churn|PARTIAL|b7e262c|churn probability + money ledger machinery exists; per-threat $-exposure and churn-risk HUD display absent
6038|3|The four bands (weather / storms / hunters / entropy)|DONE|4ce67fc;47b2c33|bandsVocabulary weather-storm-hunter-entropy in threats/registry-core.json; band field per threat; waves/ledger.ts bandAfterMastery demotes to weather
6047|3|The four families (malicious / entropic / human / systemic)|DONE|ff3249f;4ce67fc|ThreatFamily union in types.ts:882; family field on all 16 registry threats; loader familyWeights contract
6056|3|The Threat Role Taxonomy (design-first, theme-second)|DONE|47b2c33;4ce67fc;d076ad5|THREAT_ROLES 12-role array waves/table.ts:18; rolesVocabulary verbatim match; versus/deck.ts ROLE_QUOTA draft law consumes roles
6079|3|The Nine Defense Roles and the Coverage Grid|DONE|1553702;4ce67fc|coverage/ module (defenseRoles 9 verbatim + matrix + grid + darkCellReport, 12x9); registry counters name defenseRoles
6105|3|Attacker budgets (making yourself expensive is the win condition)|MISSING|-|deferred: no attacker cost/return ledger, no archetype-stops-coming logic anywhere in waves/ or pipeline/; Deter role vocabulary only
6117|3|Every threat must be telegraphed, readable, and counterable by more than one build|DONE|47b2c33;1553702|WaveEnvelope.telegraphed + waves/bands.ts TELEGRAPH_BANDS; Second-Answer rule (>=2 counters at different prices) in registry + coverage second-answer gap analysis
6123|3|At least a third of all threats are non-attacks|PARTIAL|4ce67fc|data satisfies it (7 of 16 shipped threats non-malicious); no validator enforcing the one-third ratio
6130|3|The scariest threats look exactly like customers|DONE|4ce67fc;c8c5a41|Mimic role shipped; layer7-mimic registry threat; G3 suspicion-dial gate makes ambiguity playable
6133|3|Threats punish specific build choices (the wave deck is a mirror)|DONE|47b2c33;c8c5a41|waves/ledger.ts attack-surface ledger + mastery/pool hooks; types unlockedByBuildables; G2 gate deriveInvitations + retire (unspawnable-until-invited, retirement lag)
6154|3|Damage types should differ so defenses aren't interchangeable|PARTIAL|4ce67fc|five denominations incl hands + data-integrity in vocabulary; Attention damage rides hands (HandState ff3249f); no typed damage-classification model per se
6162|3|Nothing announces itself (presentation rule)|PARTIAL|55a6086;6e1503e|observed/ fog grades (live/stale/unknown) mean value-level silence DONE; symptom-not-label threat identification not wired for shipped threats; violet-until-classified palette unverified
6174|3|Damage is often delayed and off-screen|DONE|b9295b5|replay/causality.ts buildCauseIndex + traceContributingFactors + oneSentenceExplanation is the causal-chain postmortem machinery; delayed-demo content awaits Phase 2
6181|3|Threats path the dependency graph, not geometry|PARTIAL|8fd409a|lane/hop traversal through defense-node chains shipped (pipeline, G1/G3 scenarios); attractiveness targeting function not implemented
6203|3|The Two-Front Law (a wave design rule)|DONE|47b2c33|AUTHORING_LAWS.maxDenominationsPerWave=2 + contentInspector TWO_FRONT_DENOMINATIONS_EXCEEDED incl hard-wave must-have-2-fronts rule; six-resource vocabulary matches spec list
6214|3|The Second Incident rule|PARTIAL|4ce67fc|1.8x/2.5x multipliers declared in g1 slice rules block (data contract); no engine site consumes them
6225|3|The Feint (the telegraph as a weapon against you)|PARTIAL|4ce67fc|feints cap declared in g1 rules (maxPerLevel 1 etc.); generator does not implement over-telegraphed cover waves
6239|3|The Grudge system (attacker persistence with a visible state)|PARTIAL|4ce67fc|grudge-booter threat ships (Siege, aimed at one tenant); the 0-5 grudge-pips archetype system with counter-your-last-defense does not
6249|3|The Copycat Wave (the game remembers what beat you)|PARTIAL|4ce67fc|copycatReservePct [10,15] declared in g1 rules; no miss-list-driven generator draw yet
6259|3|Threat behaviours worth designing around (an authoring checklist)|PARTIAL|e2f69d3|Correlated shared-dependency failure DONE via topology blast domains; persistent/sleeper/attacks-the-defense/attacks-the-seam unshipped
6272|3|Threat delivery mechanics (how they "approach")|PARTIAL|8fd409a;e2f69d3|Lane Marching DONE (pipeline lanes), Pressure Threats DONE (heat coupling + queue depth); Rain/Sleeper/Correspondence/Compound/Telegraphed-Boss shapes unshipped
6286|2|2.2 Ambient weather (constant background noise)|PARTIAL|-|3 of 13 threat rows DONE; weather band + scanner mechanics are the spine
6288|3|Scanner Swarm / Masscan Gnats / The Scanner Drone|DONE|4ce67fc;c8c5a41|scanner-drizzle in threats/registry-core.json (violet render + 3-level advance telegraph in facts) + g2/corpus.ts mirror
6312|3|The `/wp-login.php` Brute Squad|DONE|4ce67fc;c8c5a41|wp-login-brute-squad shipped (CPU/log cost, fail2ban/rate-limit/2FA/move-URL counters incl cheesy-fix note)
6323|3|SSH Brute Force (the background radiation)|MISSING|-|deferred: catalog content; fail2ban exists only as a wp-login counter; placebo non-standard-port teaching beat unshipped
6332|3|`.env` / `.git` Crawlers|MISSING|-|deferred: catalog content; phpinfo-artifact "quick debug" action unshipped
6340|3|Comment / Form Spam Drones|MISSING|-|deferred: catalog content; CAPTCHA conversion-hit tradeoff unshipped
6347|3|Referrer / SEO Spam Ghosts|MISSING|-|deferred: catalog content; HUD-lying meta-threat unshipped
6355|3|Bad Bot Fleet (aggressive crawlers)|MISSING|-|deferred: catalog content; no cache-hit-rate modeling in sim
6364|3|AI Scraper Locusts|MISSING|-|deferred: catalog content; monetize-instead-of-kill option unshipped
6377|3|Scraper Locust (content theft variant)|MISSING|-|deferred: catalog content; dashed-vs-dotted silhouette law unshipped
6389|3|xmlrpc Pingback Amplifier|DONE|4ce67fc;c8c5a41|xmlrpc-pingback-amplifier shipped (Parasite, reputation denomination, abuse-notice chain in facts)
6397|3|Revenue Leakage (the business layer's weather)|MISSING|-|deferred: no revenue-assurance buildable or silent MRR drain in economy/
6407|3|The Commoditization Fog|MISSING|-|deferred: no differentiation/conversion-decay ambient threat
6414|3|Abuse Complaint Backlog (ambient form)|MISSING|-|deferred: abuse exists only as a revenue-quality tag (economy/contract.ts); no heat-tray/doom-clock mechanic (that is §2.20 territory)
6421|2|2.3 Volumetric and protocol floods|PARTIAL|-|6 of 23 DONE (the five shipped flood threats + Retry Storm as engine law)
6423|3|SYN Flood / The Half-Handshake Pile|MISSING|-|deferred: connection slots exist generically (pipeline slots, 8fd409a) but half-open state + SYN cookies conditional-defense unshipped
6455|3|UDP Amplification Barrage (DNS ANY / NTP monlist / memcached / SSDP / CLDAP)|DONE|4ce67fc;c8c5a41|udp-amplification-barrage shipped (Tank, pipe-is-victim, 10s telegraph, divert-not-kill facts incl RTBH cheap option)
6480|3|Reflection/Amplification where YOU are the reflector|DONE|4ce67fc;c8c5a41|open-resolver-reflection shipped (Parasite, reputation, abuse-complaint chain in facts)
6489|3|Reflection Aimed *Through* You|MISSING|-|deferred: catalog content; spoofed-source-reflection variant unshipped
6495|3|Slowloris / RUDY (slow POST) / "The Sipper" / "The Molasses Sloth"|DONE|4ce67fc;c8c5a41|slowloris-sipper shipped (Sapper, concurrency, graphs-look-fine-while-dead fact); concurrency-slot engine models the hold
6514|3|The Slow Read (reverse Slowloris)|MISSING|-|deferred: read-vs-write timeout distinction unmodeled
6522|3|HTTP/2 Rapid Reset|MISSING|-|deferred: stream-level concept absent from connection-slot model
6533|3|The Handshake Flood (asymmetric crypto cost)|MISSING|-|deferred: CPU-per-handshake resource unmodeled
6543|3|Layer-7 GET Flood on the Expensive Endpoint / "Refresh Rats"|DONE|4ce67fc;c8c5a41|layer7-mimic fact verbatim "Requests the most expensive page at human-plausible rates from thousands of residential IPs" — same creature dual-framed in §2.3/§2.4
6564|3|ReDoS — The Regex That Ate A Core|MISSING|-|deferred: no rule-cost/WAF-self-harm mechanic
6574|3|The Decompression Bomb|MISSING|-|deferred: no upload/decompression resource
6582|3|Cache-Buster Flood / Cache-Miss Storm|MISSING|-|deferred: sim has no CDN cache layer to defeat
6594|3|Mirai-Style IoT Botnet / The Murmuration|MISSING|-|deferred: catalog content + presentation law unshipped
6605|3|Pulse Wave|MISSING|-|deferred: spike envelopes exist (WaveEnvelope role spike) but autoscaler-reaction-window threat unshipped (no autoscaler)
6612|3|Carpet Bomb / Prefix Attack|MISSING|-|deferred: prefix-level aggregation detection unmodeled
6622|3|Connection Exhaustion|PARTIAL|8fd409a|this IS the shipped slot+queue+patience engine (lane slots fill, visitors queue, patience drains); not registered as a discrete threat entry
6628|3|Cache Stampede / Thundering Herd|MISSING|-|deferred: no cache/TTL subsystem; herd-family unmodeled
6647|3|Retry Storm|DONE|ff3249f;6e1503e|engine law, not just catalog: RetryEvent in types.ts:1398; defaults.ts retryShare x stormFactor pressure + slot-stays-occupied retry prerequisite + retryDepths bookkeeping (driver.ts:144 metastability read-out)
6660|3|TCP Incast|MISSING|-|deferred: fan-out switch-port model absent
6670|3|Packet Swarm (generic volumetric, presentation entry)|MISSING|-|deferred: presentation law (queue pile-up as universal render) unshipped in render/
6684|3|Booter / Stresser Kid|DONE|4ce67fc;c8c5a41|grudge-booter shipped (storm/Siege/bandwidth; aimed-at-one-tenant + counter-costs-latency facts); repeats/give-up cadence data-only
6701|3|Ransom DDoS (RDoS)|MISSING|-|deferred: pay-to-not-die choice unshipped; extort appears only as press flavour in game.i18n pack
6716|3|Bandwidth Bill Bomb|MISSING|-|deferred: 95th-percentile billing absent from economy (percentile hits are latency-only)
6731|2|2.4 Mimics: threats that look like visitors|PARTIAL|-|1 of 10 DONE + shared machinery strong (fog, confidence, G3); the ambiguity engine exists, most named mimics are content
6737|3|Layer-7 Mimic|DONE|4ce67fc;c8c5a41|layer7-mimic shipped (hunter/Mimic; indistinguishable-from-popularity fact); G3 gate exercises the counter-dilemma
6748|3|Card Tester|MISSING|-|deferred: chargeback-swarm ships adjacent fraud pressure with signup-fraud-scoring counter, but the auth-rate-vs-revenue information puzzle is unshipped
6761|3|Scraper Locust (the ambiguity case)|MISSING|-|deferred: catalog content; delayed organic-traffic punishment unmodeled
6771|3|The Fake Signup Wave|MISSING|-|deferred: no free-tier signup simulation
6778|3|Sybil Reviewers|MISSING|-|deferred: reputation exists as denomination but no review mechanics
6784|3|The Squatter (a threat that enters through your revenue funnel)|MISSING|-|deferred: fraud-scoring named as a counter in registry; the inside-perimeter spawn creature unshipped
6796|3|Slowloris Sloth (mimic framing)|PARTIAL|4ce67fc|slowloris-sipper ships the creature; the deliberate dual-listing as patient-customer mimic is spec framing only
6803|3|The Coat Thief (session hijack)|MISSING|-|deferred: no session/auth state in sim
6812|3|The Vending Machine Shaker (API abuse)|MISSING|-|deferred: free-tier mining unshipped
6819|3|The Mimic Tell (design law)|PARTIAL|c8c5a41|substrates exist (global heartbeat 0.5Hz, Z1-Z4 altitude ladder, G3 confidence pips); the four non-colour tell channels, Contrast Audit Mode and Tell Trainer unshipped
6860|2|2.5 Application, injection, and data threats|PARTIAL|-|2 of 22 DONE (both shipped entries) + errorBudget/bounce substrate; the injection family is Phase-2 catalog
6866|3|SQL Injection Serpent / The Ink Worm *(unlocked by: a database)*|MISSING|-|deferred: catalog content; link-attack visual + exfil-in-transit render unshipped
6891|3|Blind SQLi|MISSING|-|deferred: latency-anomaly-only detection unshipped
6897|3|The Dump (the consequence unit)|MISSING|-|deferred: delayed news-event consequence unshipped
6904|3|XSS Worm / XSS Marionette / The Mirror Moth *(unlocked by: user content)*|MISSING|-|deferred: Splitter role ships (mod-update-day) but user-graph infection unmodeled
6918|3|File Upload Backdoor / Webshell|MISSING|-|deferred: persistence/hunt loop unshipped
6935|3|Path Traversal Sneak / Directory Traversal Mole|MISSING|-|deferred: catalog content
6946|3|Deserialization Bomb *(unlocked by: app framework / a convenience plugin)*|MISSING|-|deferred: server-conversion payload unshipped
6953|3|SSRF Tunneler / SSRF Courier|MISSING|-|deferred: backward trust-boundary movement unshipped
6961|3|Cache Deception (the mirror of cache poisoning)|MISSING|-|deferred: no cache-key model in sim
6972|3|Dependency Poisoning / Typosquat / Supply-Chain Trojan / The Tainted Crate|MISSING|-|deferred: deploy-time spawn unshipped; Bypass/Flyer role vocabulary exists
6992|3|Log4Everything / The Zero-Day Drop / Exploit Kit (CVE Drop)|MISSING|-|deferred: global event + unknown-sprite state unshipped
7010|3|The Opportunist Sprayer (CVE spray)|MISSING|-|deferred: patch-debt stat absent
7016|3|Magecart Skimmer|MISSING|-|deferred: catalog content
7024|3|Vulnerable Plugin / The Bad CMS Update|DONE|4ce67fc;c8c5a41|vulnerable-plugin-compromise shipped (storm/Bypass-Flyer+Sapper/data-integrity; homogeneity-multiplier family)
7033|3|Cryptominer Squatter / Infestation *(Sapper role)*|MISSING|-|deferred: Sapper role ships on slowloris-sipper but the miner creature + three-overlay convergence puzzle unshipped
7061|3|Outbound Spam Cannon / Spam Relay|MISSING|-|deferred: IP-reputation degradation chain unshipped
7074|3|Backup Poisoner|MISSING|-|deferred: restore-testing mechanic unshipped
7082|3|Ransomware on the File Server / Ransomware Bloom / The Padlock Bloom|MISSING|-|deferred: dwell-time + double-extortion redesign unshipped (WORM/immutable vocabulary appears in defenseRoles examples only)
7115|3|The Hypervisor Ransomware|MISSING|-|deferred: catalog content
7126|3|Ransomware (customer-side)|MISSING|-|deferred: catalog content
7133|3|Hypervisor Escape / Container Breakout / Multi-Tenancy Escape|MISSING|-|deferred: side-channel-capacity dial unshipped; blast-domain Contain machinery exists adjacent
7144|3|The Full Table Scan / The Noisy Query|DONE|4ce67fc;c8c5a41|noisy-query-table-scan shipped (entropy/Debuffer/human, concurrency; threat-grows-with-success fact verbatim); hoarder-noisy-neighbor sibling ships the noisy-neighbour variant

## SUMMARY

- Rows: 97 (1 x level-1, 5 x level-2, 91 x level-3) — matches expected count.
- DONE: 21 | PARTIAL: 22 | MISSING: 54 (all prefixed deferred:) | PROBLEM: 0 | NA: 0
- Shipped threat evidence base: packages/content/threats/registry-core.json (16 mechanical threats, @4ce67fc) mirrored by apps/proto/src/gates/g2/corpus.ts THREAT_CATALOG (@c8c5a41); engine law rows backed by waves/table.ts + enforcer.ts + contentInspector.ts + ledger.ts + bands.ts (@47b2c33), coverage/ (@1553702), pipeline retry/storm (@ff3249f..6e1503e), observed fog (@55a6086/@6e1503e), G2/G3 gates (@c8c5a41), replay causality (@b9295b5), economy churn/errorBudget (@b7e262c).
- All cited hashes verified with git cat-file -e.

## TOP-PROBLEMS

1. 6105 Attacker budgets — the only §2.1 design-law row with zero implementation (no ledger, no stop-coming logic); Deter role is mechanically empty, exactly the gap the spec calls out.
2. 6214/6225/6249 Second Incident, Feint, Copycat — declared as data in g1 slice rules blocks but no engine consumes them; risk of these silently becoming dead config.
3. 6582/6628/6961 cache-related trio — sim has no cache/CDN subsystem at all, so three §2.3/§2.5 threats that "defeat your own optimization" have no substrate to plug into.
4. 6605/6660 autoscaler-adjacent threats (Pulse Wave, TCP Incast) — no autoscaling/fan-out modeling; both depend on capacity-response mechanics.
5. 6819 Mimic Tell — the perceptual law (four non-colour channels, greyscale survival) is the game's "deepest skill" per spec, yet only the abstraction-level substrates (heartbeat, altitude ladder, confidence pips) exist; no tell rendering or training exists.
6. 6288-6414 weather band coverage — only 3 of 13 weather threats shipped, and the "make zero-alerts impossible" ambient design goal cannot yet be exercised end-to-end.
7. 6748 Card Tester — closest shipped relative (chargeback-swarm) carries its counters but not its signature information puzzle (auth-rate stat next to revenue); G5 quarter HUD is the natural host.
8. 6992 Log4Everything — the spec's flagship shared-world event (fleet-wide flagged-vulnerable + patch-order triage) has no event system; interacts with whatIf removeNode/disableDefense seams already shipped.
9. Heading 6312/6288 facts cite §2.2 as telegraph/attack-surface teacher — the G2 ledger consumes invitation data but not the scanner recon-map advance-telegraph output described in the same registry facts.
10. 6622 Connection Exhaustion — engine models it as core law while it is absent from the threat registry; role-registry vs engine-capability coverage gap worth reconciling in Phase 2 catalog work.
