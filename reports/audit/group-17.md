# Group g17 audit — §5.5–5.12 Unlocks and discovery — lines 20543-21843

## MANIFEST
line|level|heading|STATUS|hash(es)|note
20543|2|5.5 Tech tree branches and shapes|PARTIAL|9e701a0 ef8f35e|unlock-record + era-retirement facets exist, no tree-shape engine
20545|3|The six-branch spine (Serve / Shield / Scale / Sustain / Sell / Sense)|MISSING|-|deferred: MASTER_REPORT §7 - branch taxonomy absent, nearest is attack-surface ledger
20572|3|The shared tree, the per-type Loadout|PARTIAL|2421257|versus DefenseDeck buildables + card-hashes = declared pre-run loadout, shared-tree half absent
20581|3|Crossover Nodes ("Transferred Knowledge")|MISSING|-|deferred: MASTER_REPORT §7 - no cross-type transfer nodes, staff skill-carry is the 5.11 half
20590|3|The CEO branches|MISSING|-|deferred: MASTER_REPORT §7 - no business tree gated on data
20612|3|Branch ladders (the concrete step sequences)|MISSING|-|deferred: content ladders unauthored, NodeUnlockRecord only stores the unlocked set
20659|3|Cross-Branch Synergy Nodes|MISSING|-|deferred: MASTER_REPORT §7 - no synergy-edge machinery
20670|3|Mutually Exclusive Forks|MISSING|-|deferred: MASTER_REPORT §7 - no fork state anywhere
20679|3|Mutually Exclusive Doctrines (one per campaign act)|PARTIAL|9e701a0|DoctrineEntry.perAct + U27 exactly-one-carried persisted, mutual-exclusion enforcement absent
20687|3|The Doctrine card (a loadout you declare before a level)|PARTIAL|9e701a0 2421257 b1f757e|versus doctrineRef + doctrineGauge autopilot + commit-verb ruleBookHash, campaign-level card absent, textRefs unauthored
20703|3|Regret Nodes|PARTIAL|9e701a0|unlockDraftsPassed (U8 roads-not-taken) persisted, zero presentation or engine consumers
20719|3|Certification Gates|PARTIAL|9e701a0|breachHistoryTicks + honestHostFloor + uptime/no_data_loss streak ledger persisted, gates consuming it absent
20727|3|Rival Tech / Espionage|MISSING|-|deferred: MASTER_REPORT §7 - rival exists only as SpineCast npcKind enum
20733|3|Rediscovery / Prestige|PARTIAL|9e701a0|lineage succession found/failure_restart + keep-3 + doctrine + playbook + D12 failureOnlyUnlock = prestige carry persisted, replay loop unwired
20740|3|Retired Tech (the tree keeps moving)|PARTIAL|ef8f35e 9e701a0|eras obsolete status + museum deprecated flag + faded persisted, retire-blocks-dependents loop absent
20747|3|The Whiteboard Tree (the tree is a diegetic object)|MISSING|-|deferred: MASTER_REPORT §7 - no whiteboard surface in chrome or render
20756|2|5.6 Unlocking whole lines of hosting business|PARTIAL|4ce67fc ef8f35e|2 of ~34 line bundles shipped via loader, no prerequisite or gate engine
20762|3|The prerequisite lattice|MISSING|-|deferred: MASTER_REPORT §7 - grep prerequisite hits only retry-storm comments
20789|3|The commercial prerequisites|MISSING|-|deferred: MASTER_REPORT §7 - no commercial gating of lines
20808|3|Alternative prerequisite sets (two or three routes into every line)|MISSING|-|deferred: MASTER_REPORT §7
20819|3|The visible lattice, with readable locks|MISSING|-|deferred: MASTER_REPORT §7 - g2 shows threat locks not line locks
20828|3|The playable 12 months (making the best gate interactive)|MISSING|-|deferred: MASTER_REPORT §7 - reputation meter cannot yet move (see 20994)
20837|3|The Pivot Lattice (what a pivot actually costs)|MISSING|-|deferred: MASTER_REPORT §7 - pivot only as npc_pivot succession edge type
20853|3|The line catalogue (every pivot, its gate, and what it does to you)|PARTIAL|4ce67fc ef8f35e|shared-web + game-servers official type bundles shipped (2 of ~34), pivot gates unauthored
20918|3|The Adjacent Opportunity|MISSING|-|deferred: MASTER_REPORT §7 - no offer-event machinery
20925|3|Discovery by Customer Request (the customer is the tech tree)|MISSING|-|deferred: MASTER_REPORT §7 - customerBooks and ghosts persist customers not requests
20932|3|Repurposing|MISSING|-|deferred: MASTER_REPORT §7 - DeadDrive and museum data exist, no retire-to-cheap-line path
20944|3|Type Mastery / cross-line buffs|PARTIAL|0a2f1ca 9e701a0|codex stage seen-to-mastered + g2 mastered-badge live, cross-line buff absent
20952|3|Retiring a line, and the knowledge you keep (the distillate)|PARTIAL|9e701a0|InheritanceManifest keep-3 + doctrine + playbook = distillate shape, per-line retiring absent
20963|3|The Certification Ladder|PARTIAL|9e701a0|credential kind enum (SOC2_I PCI HIPAA FedRAMP) + playbook rung persisted, ladder ordering absent
20971|3|Carrier & Peering unlocks|MISSING|-|deferred: MASTER_REPORT §7 - peering is vocabulary only, no ladder
20979|3|The Era Unlock|PARTIAL|ef8f35e 17f3c8b|resolveEraAvailability + 2 shipped era token sets (1998/2026), era SET owner-gated per MODULE-STATUS gap row
20987|3|Geography unlocks|MISSING|-|deferred: MASTER_REPORT §7 - blast.ts comment declares model geography-blind
20994|3|The Reputation Gate (both directions)|PARTIAL|9e701a0 faf81a7|ReputationState ledger + chrome company::reputation read-row, zero producers, no gate
21002|3|Portfolio unlocks|MISSING|-|deferred: MASTER_REPORT §7 - no multi-line portfolio state
21010|2|5.7 Anti-unlocks, deprecation, and rot|PARTIAL|ef8f35e 9e701a0|rot vocabulary persisted (obsolete faded dusty stale), zero enforcement
21012|3|The Deprecation Mechanic|PARTIAL|ef8f35e 9e701a0|era obsolete status + deprecated museum flag + faded persisted, generation-band yellow-to-red and dependency blocking absent
21037|3|Concerns ratchet, implementations rot, eras gate|PARTIAL|ef8f35e 9e701a0|ruleset-diff linter CHANGED_HOOKS and THREE_CHANGE enforce the hook-budget law at authoring, runtime ratchet absent
21046|3|Product rot (commercial deprecation, which is worse)|MISSING|-|deferred: MASTER_REPORT §7 - no product sunset state or letters
21056|3|The accreditation-loss rule|PARTIAL|9e701a0|frameState dusty and crooked persist the tell, stops-next-not-current rule absent
21065|3|Lapsed certification|PARTIAL|9e701a0|credential kinds + breachHistoryTicks persisted, lapse clock absent
21073|3|Losing insurability|MISSING|-|deferred: MASTER_REPORT §7 - insurance appears only as a coverage defense-role example
21080|3|Losing peering|MISSING|-|deferred: MASTER_REPORT §7
21086|3|Losing a brand|MISSING|-|deferred: MASTER_REPORT §7
21092|3|Losing the recommended-host slot|MISSING|-|deferred: MASTER_REPORT §7
21098|3|Losing your acquirer relationship|MISSING|-|deferred: MASTER_REPORT §7 - gpu_alloc and utility_kw kinds exist without acquirer counterpart
21105|3|The commission residual you can never stop paying|MISSING|-|unlisted: no affiliate commission concept in economy ledger
21113|3|Three SLA breaches|PARTIAL|9e701a0|breachHistoryTicks U22 clean-day ledger persists breach counts, count-to-effect absent
21119|3|Burned affiliate relationships|MISSING|-|deferred: MASTER_REPORT §7
21125|3|Fired the CSM / cut the content team|MISSING|-|deferred: MASTER_REPORT §7 - 90-day-lag consequences unmodeled
21133|3|Knowledge decay|PARTIAL|9e701a0|faded (pin max 0.4) + wiki fogState forgotten + playbook stale persisted, zero producers
21142|3|The Abandoned Wing|PARTIAL|9e701a0|globalRecords linesNeverPlayed + scarsRetired memorial persist the dark, diegetic wing display absent
21152|3|The Rot Materials|PARTIAL|9e701a0|crisp dusty crooked + fog + faded = four-state material language in data, render side absent (assetpack placeholders b3a149d)
21164|2|5.8 Unlock presentation and payoff|PARTIAL|0a2f1ca faf81a7|bestiary new-chip payoff + stroke law + camera tiers vs ~35 unauthored presentation beats
21169|3|The Unlock Ceremony Tiers|MISSING|-|deferred: MASTER_REPORT §7 - alertStack is generic severity not ceremony
21182|3|The Whiteboard Tree / The Tech Wall|MISSING|-|deferred: MASTER_REPORT §7
21192|3|The Marker Colour Code|MISSING|-|deferred: MASTER_REPORT §7 - Hue Ledger (1e6b306) is color SSOT with no marker mapping
21200|3|The Whiteboard at Scale|MISSING|-|deferred: MASTER_REPORT §7
21210|3|Blueprint Export as a Reward|MISSING|-|deferred: MASTER_REPORT §7
21217|3|The Blueprint Tube|MISSING|-|deferred: MASTER_REPORT §7
21224|3|Rack Elevation Catalog|MISSING|-|deferred: MASTER_REPORT §7 - topology rack grid (e2f69d3) is available data, no catalog view
21232|3|Rack Mail — "The Catalog"|MISSING|-|unlisted: no mail surface, i18n roots have press forum chatter but no mail
21238|3|The Trade Show Floor|MISSING|-|deferred: MASTER_REPORT §7
21245|3|The Lab Bench / Research Bench|MISSING|-|deferred: MASTER_REPORT §7 - Sim Lab panel (e1190d1) is a dev bench not diegetic
21253|3|Floorplan Blueprint|MISSING|-|deferred: MASTER_REPORT §7
21260|3|The Pegboard (specified)|MISSING|-|deferred: MASTER_REPORT §7
21268|3|The PCB Trace Tree (alternate unlock skin)|MISSING|-|deferred: MASTER_REPORT §7
21276|3|Censored Silhouettes|PARTIAL|9e701a0 0a2f1ca|CodexEntry silhouettesUnlocked persisted + g2 new-vs-at-risk chips show the frontier, no silhouette render
21282|3|The Confidence Stroke Law|PARTIAL|faf81a7|instrumentReading maps certainty to stroke on chrome instruments, law not applied across objects
21294|3|Certification Wall / Trophy Rack / The Seal Wall|PARTIAL|9e701a0|credential frameState crooked tell + MedalRecord persist wall contents, diegesis absent
21302|3|The Sticker Progression|MISSING|-|unlisted: MedalRecord is nearest and does not carry it
21309|3|The Patch Jacket|MISSING|-|unlisted: no patch or jacket surface
21317|3|The Dead Drive Shelf (prestige)|PARTIAL|9e701a0|DeadDriveRecord + museum run/seed provenance law persisted, shelf display absent
21323|3|The Hiring Board|MISSING|-|deferred: MASTER_REPORT §7 - StaffRecord covers hired staff not the board
21329|3|The Vendor Rolodex|MISSING|-|deferred: MASTER_REPORT §7 - upstreamTrust domain is nearest data
21336|3|The Delivery|MISSING|-|deferred: MASTER_REPORT §7
21344|3|Faceplate Reveal / Blueprint Stamp|MISSING|-|deferred: MASTER_REPORT §7
21351|3|The Lights Come On|MISSING|-|deferred: MASTER_REPORT §7
21358|3|Zoom Tier as an Unlock|PARTIAL|faf81a7|ALTITUDE_TABLE Z1-Z4 + LOD swap shipped in camera rig, tiers are free and ungated
21364|3|Tier-Up Title Card|MISSING|-|deferred: MASTER_REPORT §7
21370|3|The Overlay Reveal|MISSING|-|deferred: MASTER_REPORT §7
21375|3|Business License Board / Pivot Blueprint / The Sign-Bolt|PARTIAL|9e701a0|credentials + npc_pivot succession persist board items, board display absent
21387|3|The Wing Build-Out|MISSING|-|deferred: MASTER_REPORT §7
21393|3|The Business Licence Wall (with a lifecycle)|PARTIAL|9e701a0|frameState crisp-dusty-crooked is the lifecycle in data, wall absent
21401|3|Cross-Line Synergy Glyphs|MISSING|-|deferred: MASTER_REPORT §7
21407|3|Whiteboard Redraw|MISSING|-|deferred: MASTER_REPORT §7
21413|3|The Runbook Binder Tabs|PARTIAL|9e701a0|PlaybookSlot rung + sealState + documented binder-maker flag persisted, tabs absent
21419|3|The Post-Mortem Polaroid wall|PARTIAL|9e701a0|PostmortemRecord polaroidRef + published + unlocks persisted (exhibit-first-polaroid example), wall display absent
21427|3|The Conference Talk (as a presentation beat)|MISSING|-|deferred: MASTER_REPORT §7 - journalist and rival npcKinds are nearest
21432|2|5.9 Credentials, permissions, and accreditation (the unlocks you cannot buy)|PARTIAL|9e701a0|credential kind enum maps most spec categories, all persistence-only
21438|3|Capability vs Permission (the shape)|PARTIAL|9e701a0|CredentialRecord is a distinct unbought facet + ruleBookHash separation, runtime permission checks absent
21449|3|Payment and processing unlocks|PARTIAL|9e701a0 b7e262c|merchant credential kind persisted, economy billing (contract ladder) has no acquirer gating
21460|3|Working-capital unlocks|PARTIAL|9e701a0|StreakEligibilityHook documents the financing contract (needs N of streak), consumers absent
21479|3|Vendor and supply-chain unlocks|PARTIAL|9e701a0|upstreamTrust domain + gpu_alloc kind persisted, partner tiers absent
21490|3|Network and numbering unlocks|PARTIAL|9e701a0|ASN + ICANN kinds persisted, allocation mechanics absent
21505|3|Compliance and audit unlocks|PARTIAL|9e701a0|SOC2_I PCI HIPAA FedRAMP kinds + breach history persisted, audit-cycle stages absent
21524|3|Facility and jurisdiction unlocks|PARTIAL|9e701a0|TierIII + utility_kw kinds persisted, permits and jurisdiction state absent
21535|3|Channel and marketplace unlocks|MISSING|-|deferred: MASTER_REPORT §7 - no marketplace or affiliate state
21550|2|5.10 Reputation and social-proof unlocks|PARTIAL|9e701a0 faf81a7|reputation ledger + streaks + customer book persisted, zero producers
21555|3|First Case Study|PARTIAL|9e701a0|customerBooks facet with NAMED_CUSTOMER_CAP persisted, case-study artifact absent
21561|3|Three Logos|PARTIAL|9e701a0|named-customer book is the logo-wall data, display absent
21568|3|Community Standing|PARTIAL|9e701a0|industry trust domain persisted, standing mechanics absent
21574|3|Analyst Coverage|MISSING|-|deferred: MASTER_REPORT §7 - SpineCast journalist npcKind is nearest
21580|3|Uptime Streak|PARTIAL|9e701a0|uptime streak kind + advance/break + longestStreakAcrossCompanies persisted, no engine producer, SKU gate absent
21587|3|Published Post-Mortem Credibility|PARTIAL|9e701a0|honestHostFloor + postmortem published flag and unlocks list persisted, credibility conversion absent
21594|3|Open-Source Sponsorship|MISSING|-|unlisted: no OSS mechanic anywhere in repo
21601|3|Conference Speaking Slot|MISSING|-|deferred: MASTER_REPORT §7
21607|3|The "we've been through it" modifier|PARTIAL|9e701a0|scars with typed modifierPayload (mttrMultiplier golden) persisted, no producer applies scars from events
21616|2|5.11 Staff, organizational, and knowledge unlocks|PARTIAL|9e701a0|StaffRecord + culture + orgDrag + alumni skeleton, zero engine consumers (g14-consistent)
21621|3|First Hire|PARTIAL|9e701a0|StaffRecord + append-only career log persisted, hire shifts nothing in the engine
21627|3|The First Salesperson|MISSING|-|deferred: MASTER_REPORT §7 - no named-role mechanics or goal-misalignment sim
21634|3|The First Accountant / Controller|MISSING|-|deferred: MASTER_REPORT §7 - finance visibility is ungated
21641|3|A Real CTO|MISSING|-|deferred: MASTER_REPORT §7
21647|3|A COO|MISSING|-|deferred: MASTER_REPORT §7
21653|3|An Abuse / Trust & Safety Lead|MISSING|-|deferred: MASTER_REPORT §7 - abuse vocabulary only in i18n pack roots
21659|3|A CFO|MISSING|-|deferred: MASTER_REPORT §7
21662|3|A Board|MISSING|-|deferred: MASTER_REPORT §7 - ConstraintCardRecord is the T6 legacy liability card not a board
21666|3|On-Call Rotation|PARTIAL|9e701a0|StaffRecord onCallTurn persisted, rotation engine absent
21672|3|Runbook Library (as an org unlock)|PARTIAL|9e701a0|playbook rung + sealState + documented flag persist the library, library behavior absent
21675|3|The Apprenticeship (growing your own)|PARTIAL|9e701a0|apprenticeshipRemaining persisted, growth tick absent
21684|3|Knowledge as a transferable asset (the staff carry the tree)|PARTIAL|9e701a0|skillNodesHeld + faces skillHolders + handwritingOwnerStaffId + alumni = carrier shape, departure and bus-factor mechanics absent
21698|3|The Wiki|PARTIAL|9e701a0|WikiEntryRecord fogState clear-hazy-forgotten persisted, onboarding-speed effect absent
21705|3|The Mentor relationship (NPC)|MISSING|-|deferred: MASTER_REPORT §7 - no mentor kind in SpineCast enum
21709|3|The Conference / Community channel|MISSING|-|deferred: MASTER_REPORT §7
21715|2|5.12 The research economy and unlock pacing|PARTIAL|9e701a0|ResearchQueueRecord + sealed/debt flags persisted, no research economy
21720|3|The Research Queue (how research actually happens)|PARTIAL|9e701a0|ResearchQueueRecord progress paused slotsUsed + AnticipationState persisted, money and engineer-week and risk pricing absent
21730|3|The Spike|MISSING|-|deferred: MASTER_REPORT §7 - no three-answers spike mechanic
21739|3|Negative Discovery (learning what you don't need)|MISSING|-|deferred: MASTER_REPORT §7 - no intel refund or greyed-branch loop
21747|3|The Debt Unlock (borrow a capability now, pay interest)|PARTIAL|9e701a0|debtFinanced flag on research records persisted, 1.4x cost and repayment absent
21757|3|Sealed Capability (you own it, but it doesn't work until you drill it)|PARTIAL|9e701a0|sealState hollow-drilled-stale is the seal-and-drill in data, enforcement absent
21771|3|Unlock cadence spec (how often, and what kind)|MISSING|-|deferred: MASTER_REPORT §7 - pacing rule unenforced
21785|3|Unlock Rationing (the hard cap)|MISSING|-|deferred: MASTER_REPORT §7
21798|3|Hardware Generation Unlocks (time, not achievement)|PARTIAL|ef8f35e|era-year availability gates by time, hardware generation calendar absent
21808|3|The Debt-to-Capability Conversion (refactoring as research)|MISSING|-|deferred: MASTER_REPORT §7
21816|3|Unlock by Decommission|MISSING|-|deferred: MASTER_REPORT §7 - DeadDrive data exists, no retire-to-tooling unlock
21825|3|The Deprecation Notice You Wrote|PARTIAL|9e701a0|constraintCards DO-NOT-DECOM liability cards + museum deprecated retention persist the artifact, notice-to-tooling reward absent
21833|3|Intel as a spendable currency|MISSING|-|unlisted: intel is only a confidence evidence input (g3 scenario), no spend or sink

## SUMMARY
DONE: 0
PARTIAL: 62
PROBLEM: 0
MISSING: 75
NA: 0
TOTAL: 137

## TOP-PROBLEMS
1. **The whole unlock system is a persistence skeleton, not a game system.** save/ (9e701a0) ships extraordinarily faithful record shapes — NodeUnlockRecord with 7 via-channels, CredentialRecord kinds mapping most of 5.9, PlaybookSlot sealState, ResearchQueueRecord debtFinanced, WikiEntryRecord fogState — but per-symbol greps prove ZERO consumers outside src/save/. Nothing in pipeline/economy/waves reads or writes these facets during play. Every PARTIAL above is "data shape done, behavior absent."
2. **company::reputation is a dead dashboard cell.** chrome/metrics.ts (faf81a7) ships it as a PERMANENT TopBar row reading observed cells, and save/ persists ReputationState + breachHistoryTicks (U22 clean-day ladder, 9e701a0), but no engine producer emits the cell (it renders '?'), and no gate consumes reputation — the 5.6 "Reputation Gate (both directions)" and "playable 12 months" are fully disconnected on both ends.
3. **5.6 prerequisite lattice has literally no machinery.** The only unlock-adjacent runtime system shipped is the attack-surface ledger (buildInvitations/isThreatSpawnable, 47b2c33 + ff3249f unlockedByBuildables) and g2's newlySpawnable/mastered payoff (0a2f1ca) — which realizes the tech-tree-is-bestiary half of 5.5/5.8 but never gates lines. 12 of 18 headings in 5.6 are MISSING.
4. **The ruleset-diff linter is the accidental home of 5.7.** loader lint.ts (ef8f35e) enforces §7.8 CHANGED_HOOKS/THREE_CHANGE/PALETTE_20 at authoring time — the closest real implementation of "concerns ratchet, implementations rot" — but the runtime deprecation mechanic (generation-band yellow→red, blocks dependents) has no code; only era obsolescence resolution exists.
5. **5.8 is ~26 of 35 beats unauthored.** Real shipped payoff surface: g2 'new'/'at-risk' chips + mastered-badge, instruments certainty-to-stroke (partial Confidence Stroke Law), ungated Z1-Z4 zoom tiers (faf81a7 camera rig), and i18n pack roots (press/forum/chatter, 08d4fe2 via 354261d) that could carry diegetic mail/talk beats. Ceremony tiers, whiteboard, marker code, sticker/patch/rolodex/delivery beats: nothing.
6. **5.11 named exec roles (Salesperson/CTO/COO/CFO/Board) are MISSING while the generic staff substrate is PARTIAL** — consistent with g14's StaffRecord finding; culture/orgDrag/alumni/skillHolders fields exist but no role instances, no hiring economy, no departure effects. MODULE-STATUS carries NO gap rows for reputation/staff/research at all — the ledger understates this hole.
7. **5.12 research economy exists only as record flags.** ResearchQueueRecord{progress,paused,debtFinanced} and AnticipationState (9e701a0) anticipate the 5.12 design, but queue slots, three-cost pricing, spike, rationing, and intel-as-currency are unmodeled; the spendable-intel idea is unlisted in any plan document.
