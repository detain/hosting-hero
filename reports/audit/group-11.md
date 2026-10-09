# GROUP g11 audit — hosting_game.md 11398–13067 (§3 visitors: model / archetypes / per-type / bounce)

Scope: §3 head + 3.1 (43 ###) + 3.2 (64 ###) + 3.3 (44 ###) + 3.4 (35 ###) = 186 ### + 4 ## + 1 section head = 191 MANIFEST rows. Ground truth: sim-core pipeline (12-step, patience LUT, hockey-stick queue, backpressure retries), content corpus (2 bundles + visitors registry 9 archetypes + 2 i18n packs + 2 wave slices), proto gates G1–G6 + chrome. All cited hashes `git cat-file -e` verified @master tip 58f5186.

Key shipped facts used repeatedly: pipeline Unit carries patienceUs / sizeCost / retryOf / accumulatedLatencyUs / inspectionCostUs / confidence / qosClassId / routeHops / waitingOn (packages/sim-core/src/types.ts, 8fd409a). Bounce = integer LUT through R-60 anchors 10%@0.6x / 50%@1.0x / 95%@1.6x (pipeline/bounce.ts, 8fd409a). Queue = serviceTime x ρ/(1−ρ) above 0.7 knee, ρ clamp 0.99, dependency-shadow effectiveRho (pipeline/queue.ts queueWait step, 8fd409a). Scoring step = C = 1 − Π(1−cᵢ) canonical-order fold (defaults.ts step 2, 8fd409a, order law 6e1503e). Route step = express/deep split by confidence (8fd409a). Inspect step = depth stamps + challenge-only benign FP roll (8fd409a). Backpressure step = retry drafts (retryOf lineage, maxRetries, backoff, stormFactor, retryPressure metastability cell) + referral + return-visit probability drafts (8fd409a). Shed = hard-ceiling discipline terminal shed (2eaf830) + qos-weighted ShedOrder + ShedLoad verb (b1f757e). Visitors registry: 9 archetypes / 6 families (packages/content/visitors/archetypes-core.json, 4ce67fc). Loader parses party/herding/populationEffect/retryAmplifies/cohortSpawn + 7 patience modes + durationClass (loader/bundle.ts, ef8f35e) — engine consumes NONE of party/herding/populationEffect/retryAmplifies and only sigmoid-budget patience.

## MANIFEST

11398|1|# 3. Visitors / traffic / and clients|PARTIAL|8fd409a b7e262c|Two-population split shipped (traffic Units in pipeline, clients as economy contracts/churn); funnel spine only partially countable (served/bounced/FP/landed + referral/return rolls; no impression/exit stages). Listed at level 1 per outline Table 2.
11422|2|## 3.1 The visitor model|PARTIAL|8fd409a ef8f35e 4ce67fc|Engine spine (patience/slots/queue/retry/shed/QoS) strong; cohort-stats, funnel, geo/time-of-day economy mostly contract-level or absent. 11 DONE / 17 PARTIAL / 15 MISSING among its 43 ###.
11424|3|Patience as HP|DONE|8fd409a|patienceUs budget per unit; sigmoid bounce probability on budget consumed (bounce.ts LUT hits the three ratified anchors exactly).
11444|3|Five-stat visitor profile|PARTIAL|4ce67fc ef8f35e|Patience shipped as engine scalar; Value/Weight/Loyalty/Fragility exist only as registry/bundle fields with null + _todo awaiting tuning sheet — no engine consumers.
11455|3|Damage from the stack|DONE|8fd409a|accumulatedLatencyUs + inspectionCostUs + queueWait prediction all drain the one budget at patienceCheck (step 9, elapsed+predicted vs LUT).
11462|3|Closed loop / feedback law|PARTIAL|8fd409a|queue_wait = base*(ρ/(1−ρ)) exactly as pseudocode (hockeyStickWaitUs, knee 0.7, clamp 0.99); the "drop past queue_max" overflow eject is unmodeled — queues unbounded.
11492|3|Latency Ladder|DONE|8fd409a 0a2f1ca|Per-hop accumulation on the unit (not a global constant); express/deep lane split; G4 latencyDelta ladder renders effectiveHopUs = service*65536/(65536−ρ).
11539|3|Millisecond Budget|DONE|8fd409a|budget in SimTimeUs per population, bundle-authored (shared-web 3000ms, game 90ms ping), jitter ±% at arrival.
11564|3|Suspicion Routing|DONE|8fd409a 6f5da38 0a2f1ca|Step-2 confidence fold, step-4 expressMaxConfidence split, depth slider + ROC gating; GATE-G3 is the dial's playable proof (dial .4 vs .9 splits lanes; upgrade via real intent door).
11586|3|Friction Gates|PARTIAL|8fd409a|Inspection-depth latency stamps + challenge-only false-positive bounces quantify defense friction; per-cohort friction matrix (CAPTCHA 22% vs 12%), compounding multipliers and fixed −% subtractions unmodeled.
11630|3|Duration-Class Classification|PARTIAL|ef8f35e 4ce67fc|Loader closes a 7-mode patience enum (sigmoid-budget/window/value-decay/resident/binary/corrupts/none) + durationClass on every archetype; engine implements only sigmoid-budget, drafts are all instant motes.
11642|3|Value as Bounty|MISSING|—|unlisted: no visitor-level conversion payout anywhere; value is customer-level MRR/contract economics only (b7e262c covers clients, not requests).
11653|3|Conversion Node|MISSING|—|unlisted: outcome terminals are served/bounced/blocked-FP/landed — no "goal reached with budget left -> convert" terminal.
11659|3|Session Depth|PARTIAL|4ce67fc|Session class authored (game-player-joining, durationClass Session, 45-min session implied by doc); engine slot occupancy is serviceTimeUs only — no time-degrading resident session.
11666|3|Duration classes shapes|PARTIAL|4ce67fc|Instant/Session/BatchJob/Resident vocab + render-shape mapping documented in registry; zero engine branches on class.
11687|3|Patience to Trust to Tenure|MISSING|—|unlisted: no per-identity state between visits; desktop-regular trustBufferMs=1000 is corpus data only; return rolls do not read history.
11694|3|Priority Classes / Shed Ladder|PARTIAL|8fd409a 2eaf830 b1f757e|QoS weight-ladder classifier (step 3), qos-weighted/FIFO/LIFO/lowest-value ShedOrder, ShedLoad verb + hard-ceiling terminal shed; the spec's 80/88/94/98% rung ladder and P0–P3 class semantics are unimplemented (knee is 70%, shed is ceiling-only or player-verb).
11707|3|Visitor Trust|PARTIAL|8fd409a|SourceRef.reputation rides the unit (0..1 Fixed, inherited through referral lineage) but no engine consumer turns it into outcomes.
11717|3|Return Cadence|PARTIAL|8fd409a|Flat returnProbability roll mints return drafts at step 11; P(base*(1+0.6*budget_remaining/budget)) service-sensitivity formula unimplemented.
11727|3|Returners and Referrers|PARTIAL|8fd409a|Referral drafts (new identity ref:*, prospect intent, reputation inherited) shipped; no saturation curve — wom_spawn = base*(1−reached/addressable) unlisted.
11733|3|Word of Mouth|PARTIAL|8fd409a|Compounding spawn loop exists as the referral roll; the balance-fix saturation, grey-suppression tokens and negative-reputation spawns are absent.
11741|3|Satisfaction Bank|MISSING|—|unlisted: no goodwill pool, cap ~2wk, 5%/mo decay — nothing in pipeline or economy.
11751|3|Party Arrival|MISSING|—|unlisted: party.allOrNothing/[5,5] parsed by loader (game-servers bundle) with zero engine consumers — spawns are per-unit.
11765|3|Capacity as Slots|DONE|8fd409a|"Slots not HP": NodeRecord capacity, weighted sizeCost occupancy, occupied/capacity ρ, slot waitingOn introspection; Little's-Law framing is the serve/queue machinery itself.
11772|3|Queue Death Spiral|DONE|8fd409a 41fcdd2|Retry storm prerequisite: slot STAYS occupied at release for the storm window, backoff-matured re-entries, retryDepth census, estate retryPressure metastability cell, queue-ghost dedup keeps it honest.
11781|3|Cache Hit Ratio|MISSING|—|unlisted: no cache node, no hit/miss split, no origin-fetch second visitor anywhere in engine or corpus.
11786|3|Keepalive|MISSING|—|unlisted: no connection-reuse model; every unit pays per-hop service independently.
11791|3|Geographic origin|MISSING|—|unlisted: SourceRef has identity but no origin region; no RTT-from-distance cost; CDN PoP selection absent.
11796|3|Diurnal rhythm|DONE|47b2c33 4ce67fc 0a2f1ca|parseDiurnalCurve + continuous never-zero baseline (web-midday, evening-peak-18-24-local), envelope layering, G6 harness curves; headless slots injects organic/probe mix.
11804|3|Seasonality|PARTIAL|4ce67fc b7e262c|Bundle tempo lists seasonality tokens (renewal-cliff, launch-window, title-death, tournament-weekend, school-calendar) — only renewal-cliff is realized, as economy contract cliffs proven in G5; spawn-rate seasons unimplemented.
11809|3|Flash crowd|DONE|47b2c33 4ce67fc|Spike/wave envelopes with burst shapes + stepped ramps in both g1 slices, telegraph bands, planWave placement RNG — the flash-crowd pattern is the wave director's bread and butter.
11814|3|Bot fraction disguised|PARTIAL|8fd409a|UnitIntent taxonomy (automaton/malicious/customer/prospect/abuser...) + suspicion/FP mechanics ship; a benign-disguised bot share of the arrival stream is not authored in either slice, and the crawler-is-not-a-threat identification minigame is absent.
11822|3|Retry amplification|DONE|8fd409a|Bounced non-adversarial units re-enter carrying retryOf, depth-capped, synchronized backoff — the self-inflicted-DDoS loop is the backpressure step's core.
11826|3|Visitor weight|DONE|8fd409a|sizeCost consumes multiple slots ("slots not HP" R-32); 99/1 weight-class scalars await the tuning sheet in corpus nulls.
11830|3|Herding|MISSING|—|unlisted: bundle field parsed (game-servers enabled), zero engine consumers — no population-dependent spawn.
11837|3|Sticky vs fluid routing|MISSING|—|unlisted: in-flight units keep assigned path (route step) is the only stickiness; no sticky-session/cache-affinity routing decision layer.
11842|3|Demand Elasticity|MISSING|—|unlisted: no price/quality -> arrival-rate curve anywhere; arrivals are envelope-driven only.
11851|3|Latency-Blind cohorts|PARTIAL|4ce67fc|crawler registered with patienceMode value-decay (crawl-budget semantics as data); engine ignores the mode — no value-decay outcome path exists.
11859|3|Traffic Not For You (transit)|MISSING|—|unlisted: no Tier-5+ transit carve-out; every unit is addressed to the player's board.
11868|3|Bounce Ticker ($/60s by cause)|MISSING|—|unlisted: chrome shows counters + clock ribbon (faf81a7); no money-rate ticker segmented by bounce cause exists.
11875|3|Live Bounce-Reason Strip|PARTIAL|8fd409a faf81a7 0a2f1ca|Four-way terminal census (served/bounced/blocked-FP/landed) + alertStack severity classes + G1 triad tooltips exist; a top-3 bounce-cause strip is not built (causes ride event causeIds but are not aggregated for the HUD).
11884|3|Conversion Funnel geometry|PARTIAL|24dfcfe|OD-1 scorecard ships the conversion axis as displayed-leading company metric (economy/scoring.ts, active commitment-convergence); the lane-side Arrive->Reach->Served->Satisfied->Return->Refer stage funnel is not modeled.
11890|3|Visitor-Build counter-matrix|PARTIAL|0a2f1ca 4ce67fc|The inverse half ships as GATE-G2 (build -> threat invitations + attack-surface ledger from real bundles); visitor-favoring-build codex exists only as 2 flavour i18n keys (codex.* game pack, 08d4fe2).
11902|3|Cohort as a unit|MISSING|—|unlisted: cohortSpawn parsed; no cohort grouping view in observed/HUD — observed cells are per-node/key.
11913|3|Declining-demand verb ("we're full")|MISSING|—|unlisted: PlayerVerbs closed at 8 (place/connect/disconnect/configure/commit/shed/communicate/toggleSpeed); no turn-away/waiting-room verb.
11926|2|## 3.2 Visitor archetypes|PARTIAL|4ce67fc|9 of 57 archetypes in the shipped registry (skimmer, mobile-commuter, desktop-regular, deep-reader, impulse-buyer, power-shopper, api-client, crawler, game-player-joining); familiesVocabulary = the spec's 6 legibility families; all scalars bounty=null pending tuning sheet.
11956|3|Family I — Browsers|PARTIAL|4ce67fc|4 of 12 members authored in registry (skimmer/mobile/desktop/deep-reader) + game-player-joining filed under Browsers; family field drives the closed vocabulary.
11958|3|The Skimmer / Casual Browser|DONE|4ce67fc|skimmer-casual: budget 800–1500ms, Instant, referenced by shared-web bundle; facts quote the doc's 500ms–3s + rain-on-window read.
11965|3|The Mobile Commuter|DONE|4ce67fc|mobile-commuter: budget 1000ms with preDamagedMs=300 exactly as the spine table.
11976|3|The Desktop Regular|DONE|4ce67fc|desktop-regular: 3000ms + trustBufferMs=1000 authored (buffer not yet engine-consumed, cf. 11687).
11988|3|The Deep Reader|DONE|4ce67fc|deep-reader: perHop=true 4000ms/hop — the tail-compounding exemplar.
11994|3|The Deep-Link Visitor|MISSING|—|deferred: not in registry; per-path latency only exists implicitly via routeHops, no archetype identity.
12000|3|The Power User|MISSING|—|deferred: not in registry; 5x-load multiplier unmodeled.
12006|3|The Logged-In User|MISSING|—|deferred: not in registry; cache-bypass economics absent (no cache at all, cf. 11781).
12013|3|The Night Owl|MISSING|—|deferred: maintenance-window placement play needs the diurnal-variant cohort; nothing authored.
12017|3|The Ghost Visitor (adblocked/no-JS)|MISSING|—|deferred: monetization-friction cohort absent; JS-challenge 100%-bounce cohort unmodeled.
12023|3|The Accessibility Visitor|MISSING|—|deferred: not in registry.
12029|3|The Geo-Distant Visitor|MISSING|—|deferred: RTT-count > milliseconds cohort needs geo (cf. 11791).
12035|3|The Regional Wave|MISSING|—|deferred: world-scale sun-following tides unmodeled (single-lane arrivals only).
12042|3|Family II — Buyers|PARTIAL|4ce67fc|2 of 8 members (impulse-buyer, power-shopper); checkout-whale folded into power-shopper per registry notes.
12044|3|The Buyer / Power Shopper|DONE|4ce67fc|power-shopper: 6000ms full-funnel, dies of accumulated hops (as data); DB-gated existence rule not enforced.
12053|3|The Impulse Buyer|DONE|4ce67fc|impulse-buyer: 1200ms high-value tension unit shipped in registry + shared-web archetypeRefs.
12059|3|The Comparison Shopper|MISSING|—|deferred: delayed-return loop only exists as the generic flat return roll.
12065|3|The Returning Cart-Abandoner|MISSING|—|deferred: session-state-survival coupling to Redis eviction unmodeled (no cache layer).
12071|3|The Refund Hunter|MISSING|—|deferred: negative-EV conversion + cohort refund rates absent from economy.
12078|3|The Tire-Kicker|MISSING|—|deferred: trial-conversion wobble cohort absent.
12086|3|The Migrating Customer|MISSING|—|deferred: escort-convoy migration unmodeled.
12100|3|The Repatriator|MISSING|—|deferred: hyperscaler-exodus wave cohort absent.
12112|3|Family III — Machines|PARTIAL|4ce67fc|2 of 8 members (api-client, crawler) with the doc's distinct patienceModes recorded as data (binary, value-decay).
12114|3|The API Client / API Consumer|DONE|4ce67fc|api-client: patienceMode binary + 10s budget authored; engine still bounces probabilistically — binary hard-fail not wired (note rides the archetype).
12135|3|The Integration Partner|MISSING|—|deferred: unmanageable third-party caller cohort absent.
12143|3|Googlebot / The Crawler|DONE|4ce67fc|crawler: 8000ms value-decay authored (the identification-minigame half — Scraper Locust lookalike — stays unmodeled, cf. 11814).
12157|3|The Uptime Monitor|MISSING|—|deferred: tattle-publishing checker + N-of-M vantage epistemics absent.
12167|3|The Customer Who Monitors You Better|MISSING|—|deferred: p99-vs-p50 complainer cohort absent.
12176|3|The Authorized Attacker|MISSING|—|deferred: contractual pentester window absent from threats registry too.
12187|3|IoT — the device fleet|MISSING|—|deferred: mass-synchronized device population unmodeled.
12193|3|Bot Traffic That Isn't Malicious|PARTIAL|8fd409a|automaton UnitIntent class + crawler archetype exist; the "blocking has side effects" category law (crawl-budget feedback) has no engine loop.
12202|3|Family IV — Amplifiers|PARTIAL|8fd409a 08d4fe2|0 of 7 in registry; the family's core function (success spawning future traffic) ships generically as referral/return drafts; press/forum/chatter copy voices outcomes (08d4fe2, 40faf58).
12204|3|The Advocate / Word-of-Mouth Visitor|PARTIAL|8fd409a|referral drafts = advocate function without archetype identity; saturation curve + negative-reputation spawn both absent (cf. 11733).
12221|3|The Reviewer|MISSING|—|deferred: mini-boss VIP moving reputation permanently absent.
12232|3|The Influencer / The Press|MISSING|—|deferred: loudly-telegraphed crowd-spawn escort absent (press.headline.* i18n is flavor only).
12240|3|The Streamer / Sponsored Creator|MISSING|—|deferred: demand-multiplier customer unmodeled (codex.stream-sniper is 1 flavour key, 08d4fe2).
12248|3|The Journalist|MISSING|—|deferred: incident-caused visitor absent.
12254|3|The Community|MISSING|—|deferred: churn-contagion amplifier absent.
12261|3|The Referrer You Didn't Ask For|MISSING|—|deferred: unattributed acquisition channel absent.
12271|3|Family V — Costs|PARTIAL|08d4fe2|0 of 8 in registry; the ticket-consumption half of this family lands as type mechanics ("ticket-queue", "attention-grace" in shared-web mechanics list) + 36 ticket/abuse pack keys voiced in proto (40faf58).
12273|3|The Freeloader / Free Tier Tourist|MISSING|—|deferred: free-tier conversion slider cohort absent (free bucket exists customer-side, b7e262c).
12283|3|The Hotlinker / Bandwidth Parasite|MISSING|—|deferred: referer-rule threat/visitor hybrid absent.
12287|3|The Support Seeker|MISSING|—|deferred: staff-hand-attacking visitor absent; ticket lane is customer-level only.
12294|3|The Customer Who Locked Themselves Out|MISSING|—|deferred: IPMI/console-payoff ticket archetype absent.
12303|3|The Repeat Bouncer|MISSING|—|deferred: per-identity trust decay unmodeled (cf. 11687).
12307|3|The Upload Visitor|MISSING|—|deferred: POST-body failure-to-ticket path absent.
12314|3|The Sanctioned Entity / Fraud Signup|MISSING|—|deferred: fraud screening decision unit absent.
12320|3|Family VI — Evaluators|PARTIAL|b7e262c 9e701a0|0 of 10 visitor-side; the "grades your build/book" idea lands elsewhere: save matrix tier ladder + audited ledger rows are evaluator analogs at company level — no inspecting walking unit exists.
12322|3|The Enterprise Buyer / Evaluator|MISSING|—|deferred: architecture-grading visitor absent (build quality reaches scorecard, not spawn).
12332|3|The Evaluator's synthetic test|MISSING|—|deferred: scheduled-exam window absent.
12340|3|The Procurement Delegation|MISSING|—|deferred: multi-headed all-must-satisfy unit absent.
12354|3|The Column-Fodder Prospect|MISSING|—|deferred: mimic-of-the-funnel absent.
12364|3|The Incumbent-Locked Lead|MISSING|—|deferred: nurture-until-renewal-date lead timer absent.
12374|3|The Auditor (regulated)|MISSING|—|deferred: evidence-walking checklist visitor absent.
12379|3|The Compliance Visitor|MISSING|—|deferred: 340-row questionnaire inbox card absent.
12388|3|The Banker|MISSING|—|deferred: lender-review visitor absent.
12396|3|The Buyer's Analyst|MISSING|—|deferred: documentation-walk due-diligence visitor absent.
12400|3|The Distributor Rep|MISSING|—|deferred: quarter-end discount supply visitor absent.
12409|3|Cross-family specials|MISSING|—|deferred: not one of the six shipped families (familiesVocabulary, 4ce67fc); 0 of 5 members authored.
12411|3|The Whale|MISSING|—|deferred: visitor-lane whale absent; a whale CONTRACT exists G5-side (c01 $2500/mo cliff, gate-g5 fixture) but that is the 3.5 customer population, not this unit.
12427|3|The Media Streamer / Streaming Viewer|MISSING|—|deferred: jitter/rebuffer second quality axis absent.
12436|3|The Ghost (dormant payer)|MISSING|—|deferred: dormant-account audit fork absent.
12449|3|The Reseller|MISSING|—|deferred: flock-in-one-card cohort absent.
12454|3|The Lurker|MISSING|—|deferred: community-slot comedy unit absent.
12460|2|## 3.3 What "a visitor" is per hosting type|PARTIAL|4ce67fc ef8f35e 0a2f1ca|Variety engine PROVEN at 2 of 44 types: two full bundles with distinct visitor sections (patience 3000ms/90ms, Instant/Session, party off/on, herding off/on, retryAmplifies off/on, archetypeRefs, tempo/seasonality/skin) driving ONE pipeline with zero bundle-id branches (G6 grep-audited, gate-g6.test.ts). Remaining 42 types deferred with the rest of the 34-type catalog.
12490|3|Web host — a page load|DONE|4ce67fc|shared-web.json ships it: unitTerm visitor.unit.page-load, patience 3000ms sigmoid anchors, Sparks cyan-dart skin note in facts, cohortSpawn tier 3, archetypeRefs x8.
12497|3|Managed WordPress|MISSING|—|deferred: no bundle; plugin-update-event-visitor + ticket-ratio law unlisted in gap register.
12502|3|VPS / cloud — provisioning request|MISSING|—|deferred: customer-as-unit line absent; provisioning flow unmodeled.
12509|3|Dedicated / bare metal — sales inquiry|MISSING|—|deferred: type not authored; no engine or corpus surface.
12512|3|Game host — a player joining a server|PARTIAL|4ce67fc 0a2f1ca|game-servers.json: Session class, 90ms ping budget, party [5,5] all-or-nothing, herding enabled, populationEffect, retryAmplifies TRUE, ping-chip skin — all as bundle DATA; engine spawns generic units with patienceUs but consumes none of the party/herding/session-decay fields (cf. 11751/11830). The G6 two-type proof runs this type end-to-end.
12526|3|Game host — the Tournament|MISSING|—|deferred: "tournament-weekend" exists only as a seasonality token in the bundle (data label, no event).
12530|3|VoIP / SIP — a call|MISSING|—|deferred: MOS/jitter/frayed-ribbon binary call model absent.
12541|3|Email host — a message|MISSING|—|deferred: bidirectional reputation-gate journey absent.
12552|3|DNS host — a query|MISSING|—|deferred: TTL-throttle absent (route step's dnsNodeId pre-board hop is the only nod).
12562|3|CDN — a request at a PoP|MISSING|—|deferred: hit/miss gameplay absent (no cache, cf. 11781).
12569|3|Object storage — a GET/PUT|MISSING|—|deferred: opposite-economics pair absent.
12578|3|Backup host — a backup job|MISSING|—|deferred: window patienceMode exists in the loader enum but no window unit; scheduled convoy unmodeled.
12593|3|Backup / DR — restore request / declaration|MISSING|—|deferred: Red Case unit absent.
12603|3|Tape vault — courier / recall|MISSING|—|deferred: type not authored; no engine or corpus surface.
12607|3|Video / streaming — a viewer|MISSING|—|deferred: correlated-tides concurrency absent.
12617|3|Playout / broadcast — the schedule|MISSING|—|deferred: type not authored; no engine or corpus surface.
12621|3|GPU / AI host — inference or training|MISSING|—|deferred: reserve-as-building placement absent.
12636|3|HPC / render — job submission|MISSING|—|deferred: fair-share queues absent.
12640|3|CI host — a build job|MISSING|—|deferred: value-decays-with-queue curve absent (mode parsed, not consumed).
12648|3|Kubernetes / PaaS — a deployment|MISSING|—|deferred: board-rearranging visitor absent.
12658|3|Serverless — an invocation|MISSING|—|deferred: arrival-history-dependent patience absent.
12664|3|DBaaS — a query|MISSING|—|deferred: noisy-query exists as a THREAT (registry roles incl slow-query trio) but not as this product line's visitor model.
12668|3|Observability host — a metric series|MISSING|—|deferred: permanent-arrival cardinality unit absent.
12675|3|Colo — tenant touring|MISSING|—|deferred: tour-as-level / rubric / rail-cam absent.
12718|3|Colo — tenant engineer badging in|MISSING|—|deferred: type not authored; no engine or corpus surface.
12727|3|Wholesale / build-to-suit|MISSING|—|deferred: type not authored; no engine or corpus surface.
12733|3|Colo / wholesale — The Broker|MISSING|—|deferred: type not authored; no engine or corpus surface.
12737|3|Regulated — an auditor|MISSING|—|deferred: type not authored; no engine or corpus surface.
12741|3|IX operator — a peering session|MISSING|—|deferred: resident relationship unit absent.
12749|3|Registrar — registration/renewal/transfer|MISSING|—|deferred: type not authored; no engine or corpus surface.
12756|3|CA — CSR with validation challenge|MISSING|—|deferred: type not authored; no engine or corpus surface.
12761|3|PACS / medical imaging|MISSING|—|deferred: type not authored; no engine or corpus surface.
12764|3|POS / payments — an authorization|MISSING|—|deferred: 2s hard timeout cliff absent.
12767|3|WISP — subscriber CPE|MISSING|—|deferred: type not authored; no engine or corpus surface.
12771|3|Time service (NTP)|MISSING|—|deferred: silent-corruption failure mode absent.
12775|3|Legacy / mainframe — batch window|MISSING|—|deferred: type not authored; no engine or corpus surface.
12779|3|Dial-up — dialling subscriber|MISSING|—|deferred: busy-wall capacity read absent (slot exhaustion is the analog but no port-bank reject).
12790|3|BBS / shell / Usenet — user session|MISSING|—|deferred: type not authored; no engine or corpus surface.
12795|3|Seedbox — occupancy not traffic|MISSING|—|deferred: type not authored; no engine or corpus surface.
12800|3|IoT — a device check-in|MISSING|—|deferred: type not authored; no engine or corpus surface.
12805|3|Satellite ground station — a pass|MISSING|—|deferred: appointment-deadline unit absent.
12809|3|Mining hosting — no visitors|MISSING|—|deferred: visitorless scenario unbuildable while arrival is mandatory-ish (no lane-off switch authored).
12814|3|Bulletproof — no-questions client|MISSING|—|deferred: type not authored; no engine or corpus surface.
12818|3|Ad-tech / RTB — a bid request|MISSING|—|deferred: 100ms hard cliff absent (bounce LUT is gradual by design here).
12823|2|## 3.4 Why visitors bounce|PARTIAL|8fd409a|The three-shape classification (ms costs / fixed subtractions / hard cliffs) is only half-wired: ms costs are the whole engine; fixed −% subtractions and most hard cliffs have no implementation; 1 error-taxonomy exists (challenge FP + shed terminal) but the authored bounce-cause catalog (35 rows) is not a modeled enum.
12837|3|Latency drain / TTFB over budget|DONE|8fd409a|The master drain: per-hop service + hockey-stick queue wait accumulate into the budget check; emergent from load, exactly per the spec's warning.
12841|3|Path Ugliness (too many hops)|DONE|8fd409a|routeHops length literally multiplies cost — deep lane vs express lane is the shipped counter; inspection stamps compound per hop.
12847|3|Redirect chains|MISSING|—|unlisted: no extra-path-segment modeling of redirects.
12853|3|TLS handshake cost|MISSING|—|unlisted: first-visit-vs-resumption asymmetry absent (no connection identity).
12859|3|The Error cliff|MISSING|—|unlisted: 5xx does not end visitors; no 5xx/4xx distinction, no branded-maintenance-page politeness, no two-in-a-row churn flag.
12867|3|The Scary-warning cliff|MISSING|—|unlisted: cert-interstitial 100%-bounce + zero-return rule unmodeled.
12873|3|The browser warning that isn't yours|MISSING|—|unlisted: neighbor-site blast-radius bounce absent (blast radius exists for POWER domains, topology/blast.ts, not reputation).
12881|3|The Captcha tax / your own defenses|PARTIAL|8fd409a 0a2f1ca 6f5da38|Real FP economy: benign units blocked ONLY at challenge depth, aggression-scaled FP ratio, blocked-false-positive terminal counted + wasted-cost fee (G1 proves waste == fp*20M), amber notice hue in the ledger (1e6b306); the accumulating amber pile, per-faceplate counters and cohort-specific friction rates are absent.
12893|3|The defense invisible before your logs|MISSING|—|unlisted: FP under-reporting blind spot not modeled; observed/ fog covers staleness of what IS measured, not systematically missing measurement.
12902|3|The Phantom Funnel|MISSING|—|unlisted: the biggest self-declared gap in the spec itself — no invisible non-arriving demand stream anywhere.
12915|3|Protocol Compatibility as Visitor Filter|MISSING|—|deferred: compat matrix belongs to era work; nothing shipped.
12923|3|Happy Eyeballs failure|MISSING|—|unlisted: nothing modeled anywhere in repo.
12930|3|The cert chain that only fails on old clients|MISSING|—|unlisted: nothing modeled anywhere in repo.
12936|3|The visitor's ISP is the problem|MISSING|—|unlisted: "not everything is your fault" cohort-loss unmodeled.
12944|3|The mobile-carrier NAT block|MISSING|—|unlisted: rate limits are per-unit-intent rolls, not per-IP/ASN buckets — the collective-punishment failure cannot happen.
12951|3|Geo-IP misclassification|MISSING|—|unlisted: no geo at all (cf. 11791).
12955|3|Cold start|MISSING|—|unlisted: new nodes serve identically from tick 1; scaling-not-instantly-good unmodeled.
12959|3|Cold cache after a deploy|MISSING|—|unlisted: deploys (policy commits) have no cache-busting latency window.
12964|3|Queue Despair (the visible queue)|PARTIAL|8fd409a|Queue time genuinely drains patience (elapsed+predicted check, silent-bounce R-10) and G1 renders beads pacing the lane; waiting-room slower-drain + conversion −15% trade absent.
12969|3|Queue-time value decay|MISSING|—|unlisted: no depreciating-on-success outcome — served is always full value; the CI "succeed and still lose" case cannot occur (every bounce counter for it is different, spec says model separately).
12975|3|Ugly / degraded layout|MISSING|—|unlisted: no presentation-quality patience subtraction; Site Preview window (§8.8) has no degradation feed.
12983|3|Third-party drag|MISSING|—|unlisted: no revenue-vs-conversion third-party script decision.
12987|3|Search ranking decay|MISSING|—|unlisted: chronic slowness -> spawn rate has no loop (crawler value-decay is data-only, cf. 11851).
12993|3|Mail deliverability|MISSING|—|deferred: mail line itself absent.
12999|3|Reputation Bounce (email)|MISSING|—|deferred: off-board deny-by-third-party absent.
13003|3|The Slow Landing Page (business recursion)|MISSING|—|unlisted: own-marketing-site coupling absent.
13010|3|The Trust Gap (doorstep check)|MISSING|—|unlisted: pre-entry trust-signal checklist absent (source.reputation rides units inert, cf. 11707).
13022|3|Price Shock at Checkout|MISSING|—|deferred: no checkout funnel; renewal shock exists customer-side (G5 whale cliff) but not as visitor bounce.
13029|3|Form Friction|MISSING|—|unlisted: signup-field slider absent.
13034|3|Payment declined|MISSING|—|unlisted: order-analytics leak absent.
13038|3|Fraud check false positive|MISSING|—|unlisted: fraud screening absent entirely.
13042|3|No Instant Provisioning|MISSING|—|deferred: provisioning flow absent.
13048|3|The Missing Feature Filter|MISSING|—|unlisted: checklist-icon turn-arounds absent.
13055|3|Pre-sales response time (lead decay)|MISSING|—|unlisted: lead objects with decay timers absent.
13062|3|Contract-end bounce (colo/enterprise)|PARTIAL|b7e262c 6f5da38 24dfcfe|Customer-level analog shipped and gate-proven: contract term end -> lapse/renew cliff + dunning + churn (G5 whale cliff-lapse + c12 cliff-renew exactly); the colo/enterprise 35-month invisible variant rides those same primitives, no separate visitor exists.

## SUMMARY

- Rows: 191 (1 section head + 4 ## + 186 ###) — matches assignment count (43+64+44+35 ###).
- DONE: 22 — §3.1 engine spine (patience-as-HP, stack damage, latency ladder, ms budget, suspicion routing, capacity slots, queue death spiral, diurnal, flash crowd, retry amplification, visitor weight = 11), 8 §3.2 archetype rows (skimmer/mobile/desktop/deep-reader/impulse/power-shopper/api-client/crawler), 1 §3.3 type row (web host), 2 §3.4 bounce rows (latency drain, path ugliness).
- PARTIAL: 34 — incl. §3 head, all 4 ## section rows, 4 family headers + Amplifiers/Costs/Evaluators/cross-family-adjacent rows, shed ladder, captcha tax, queue despair, conversion funnel, counter-matrix, contract-end bounce, game-host type row.
- PROBLEM: 0 — no shipped-claim-vs-code contradiction found; every partial's gap is stated in its own note.
- MISSING: 135 — 95 tagged `deferred:` (48 archetype rows incl. cross-family specials + 42 per-type rows + 5 mail/protocol/checkout/provisioning bounce rows — the 44-type variety engine is proven at 2, G6-audited), 40 tagged `unlisted:` (cohort mechanics, cache/keepalive/geo/elasticity/goodwill/party/herding consumers, error cliffs, phantom funnel, value axis, ticker, value-decay, "we're full") — none of the `unlisted:` rows appears in docs/MODULE-STATUS.md's gap ledger.
- Section shape: §3.1 11/17/15 (DONE/PARTIAL/MISSING) — the 12-step sim genuinely IS the visitor model; §3.2 8/8/48 — catalog correctly Phase-1-deferred at 9/57 registry coverage; §3.3 1/1/42 — variety engine proof at 2/44 types; §3.4 2/3/30 — the real unlisted debt: 30 of 35 authored bounce causes have no modeling path, and the classification rule's hard-cliff and fixed-subtraction shapes are unimplemented as first-class mechanics.

## TOP-PROBLEMS

1. 13062/12823 §3.4's classification rule promises three mechanical shapes (ms cost / fixed −% subtraction / hard cliff); the engine implements only ms drain + a gradual LUT. Every hard-cliff bounce (error page, scary warning, busy signal, payment decline, fraud FP) has no representation — and the LUT's 2x-budget saturation anchor actively contradicts "100ms, hard" RTB-style units.
2. 12902 The Phantom Funnel is called out BY THE SPEC as "the biggest single gap in the visitor model as originally written" — shipped code inherits that gap verbatim: HUD counters cannot miss demand that never arrives; no observability purchase reveals it.
3. 11642/11653/11868 The entire value axis (bounty, conversion node, $-per-cause bounce ticker) is missing from the traffic lane: visitors serve/bounce/land with zero money semantics, so §3.1's "bounce costs dollars" legibility layer does not exist anywhere in chrome (faf81a7 counters are unit-counts only).
4. 11781/11786/12562/12959 Cache/keepalive/cold-cache — the CDN line's "hit/miss IS the gameplay" and the deploy-vulnerability loop — are wholly absent (repo-wide grep zero), which also blocks 6 dependent archetypes (logged-in, cart-abandoner, deep-link).
5. 11751/11830/11842 Loader parses party.allOrNothing, herding, populationEffect, retryAmplifies, cohortSpawn as REQUIRED bundle fields (ef8f35e) yet NO engine step consumes any of them — the game-servers bundle asserts party-of-5 + herding law as data the sim provably ignores (G6 passes because it never tests those effects). Contract-vs-capacity gap that should ride the gap ledger; currently unlisted.
6. 11462 "Drop past queue_max" (the spec's own closed-loop pseudocode) is unimplemented: queues are unbounded with ρ clamped at 0.99, so the documented queue-overflow eject and its interaction with queue despair cannot occur.
7. 11694 Shed ladder rungs (80/88/94/98% P0–P3) vs shipped: shed only fires at hard-ceiling discipline or as a player ShedLoad verb; no utilization-rung auto-shed cascade exists, so the spec's escalating-tragedy curve is flattened.
8. 11875 No bounce CAUSE taxonomy: outcomes carry causeIds (retry:<id>, outcome:<id>, drain:<id>) but there is no enumerated bounce-reason set to aggregate for the top-3 strip, the $/60s ticker, or the FP-pile visualization — prerequisite gap for three §3.1 HUD rows.
9. 12969 Queue-time value decay: engine's binary served/bounced terminal pair cannot express "succeeded and still lost" — the CI/HPC/transcode cohort family (plus crawler crawl-budget) all route through this unimplemented mode though the 7-mode patience enum already reserves `value-decay` (loader parses it, defaults.ts never reads a mode).
10. 12202/12320 Families IV+VI (Amplifiers, Evaluators — 17 archetypes) have near-zero shipping surface: only the generic referral roll represents 3.2's compounding story; the reputation -> spawn-rate feedback that powers Reviewer/Influencer/Community/Advocate-saturation is absent, so word-of-mouth is one-directional (returns/referrals happen regardless of bad service quality beyond bounce).
11. 12814/12809 Mining-hosting's "no visitor lane" scenario and dial-up's busy-wall both need an arrival-layer switch (lane-off, per-port reject) that the arrival step does not offer — worth pinning before the type catalog expands.
