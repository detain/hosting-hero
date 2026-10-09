# Group g13 audit — §4 Buildables: design rules, compute, storage, network-and-edge — lines 14859-16284

## MANIFEST

14875|2|4.1 Design rules for buildables|PARTIAL|e2f69d3 8fd409a 0a2f1ca 47b2c33|Buildable machinery (socket grammar, door place/connect, terms card, invitation ledger) shipped; most rules in this subsection are prose-only
14877|3|The Three-Column Law|PARTIAL|0a2f1ca b7e262c 47b2c33|Gives (g4 terms card), Cost (economy opex), Opens (waves/ledger invite gating) each mechanized; no Closes column, hygiene-cap ~12 is a review law with no enforcement point
14914|3|The Build Card|PARTIAL|0a2f1ca|g4 terms card ships Bandwidth/Monthly-cost/Latency/SLA rows plus attack-surface shim; Closes, lead time, blast radius, removal cost, lifetime cost, Tradeoff Bar, 3:4 layout all absent
14942|3|"What does this let me charge for?"|MISSING|-|unlisted: tooltip-copy law; loader buildables plan parses only paletteRef/archetypeInstances/distinct/nonPhysical - no revenue tag field anywhere
14948|3|Every buildable is a toy first, a stat block second|MISSING|-|deferred: ADR-0008 render lanes shipped atlas/filters/audio/substrate scaffolding only; no silhouette, idle, placement-anim or five-artifact production gate in any plan row
14961|3|Universal visual grammar for buildables|MISSING|-|deferred: ADR-0008 object visuals unstarted; nearest analog is g4 DOM port studs with free-vs-used state (0a2f1ca)
14978|3|The Exposure Chevron Count|PARTIAL|0a2f1ca 47b2c33|Surface is countable numerically via g2 surfaceCost/newlySpawnable and the ledger invitation map; chevron glyphs on the model and overlay brightness absent
14986|3|The Exposure Ring|MISSING|-|deferred: signal-layer floor visuals outside PHASE1-PLAN; no ring render code exists
14994|3|The Attack Surface Rose|MISSING|-|deferred: inspector visuals unstarted; per-object vulnerability petals have no data model (threat family metadata is per-threat only)
15002|3|The Upkeep Drip|PARTIAL|b7e262c 4389737|Upkeep is real recurring money (economy invoicing, unattended opex rows, terms-card Monthly row); droplet motion and earns-toward-you direction absent
15009|3|The Truth/Face Pair Law|PARTIAL|55a6086 08d4fe2|Face-vs-truth mechanized centrally by the observed layer (stale/unknown fog cells); two-face-rack archetype instance shipped in content data; the F flip gesture is absent
15021|3|The Idle Animation Catalogue|MISSING|-|deferred: ADR-0008 render work; no idle field in any shipped buildable data or ComponentTemplate shape
15031|3|The Wear Channel Triad|MISSING|-|deferred: shader/maintenance-debt visuals unscheduled; no dust/heat-stain/hand-wear state exists
15039|3|The Faceplate Contract|MISSING|-|deferred: render zones (identity/LED/capacity/ports) unstarted; no faceplate data model
15046|3|LED Grammar|MISSING|-|deferred: object LED rendering absent; chrome StatusChip 12-vocab (1e6b306) is HUD vocabulary not object LEDs
15054|3|The Locate Beacon|MISSING|-|deferred: locate/strobe render absent; no locate action exists among the eight door verbs
15061|3|U-Height Silhouettes|PARTIAL|e2f69d3|U-height is enforced data: rack grid with capacityU and Placement uStart/uHeight consumed by slot rules at the door; silhouette readability layer absent
15068|3|Cable Colour Code|MISSING|-|deferred: cable rendering unstarted; g4 portShapes hues encode the four relations not media classes (0a2f1ca)
15075|3|Cable Physics|MISSING|-|deferred: render physics unstarted; cables are straight SVG lines in g4
15082|3|The Vendor House Styles|MISSING|-|deferred: art-direction law; no vendor-dialect field exists in any shipped schema
15092|3|The Golden Image Tint|MISSING|-|deferred: render tint unstarted; only concept-adjacent shipped item is the homogeneous-cpanel-image invitation entry (08d4fe2)
15099|3|Build Ghost|PARTIAL|0a2f1ca e2f69d3|g4 live previewCable during drag filters ports by validity (a placement ghost in miniature) and sockets.ts reserves ghost-check semantics; hologram with footprint/power/heat numbers absent
15106|3|The Placement Refusal Icon Set|PARTIAL|8fd409a|The refusal set is enforced as machine-checked text reasons (power, slot, kind via canPlaceDevice, self-edge, cycle); icon glyphs drawn on the offending rack absent
15114|3|The Rack Elevation as a Buy Screen|PARTIAL|e2f69d3|Elevation data model shipped (floor/row/rack/U grid, amp headroomMw, thermal); wired to no purchase UI - topology/physical.ts has zero non-test consumers
15122|3|Construction Animation|MISSING|-|deferred: birth animation render work unscheduled; no build-queue conveyor exists
15130|3|Decommission Animation|MISSING|-|deferred: reverse animation absent; the underlying pull is real as disconnect plus opt-in drain (c253643) but e-waste pallet debt is not
15137|3|Build time and cold start|PARTIAL|8fd409a b1f757e|Hand occupancy (place 3 ticks) makes builds non-instant and drain adds delayed pulls; the days/weeks/months lead-time tiers, boot sequences and expedite-for-cash option are absent
15157|3|The Surface Budget|PARTIAL|47b2c33 a864061|The one-way valve ships: invitation ledger gates the spawnable pool by existing buildables; no Surface 1-10 stat, total meter, surface-weighted generator composition, or Decommission/Narrow/Wrap verbs (whatIf removeNode/disableDefense are analysis-only)
15178|3|The Build Role Taxonomy (nine roles)|PROBLEM|e24e1bb|The nine build roles are tagged nowhere; coverage/defenseRoles.ts ships the DIFFERENT nine defense roles sharing only four words (Classify/Contain/Detect/Recover) - the spec's shared-tag promise between palette and Coverage Grid is broken
15191|3|The Platform Chassis|MISSING|-|deferred: chassis/module composition not in PHASE1-PLAN; palette:shared-80 stays a dangling ref that only lint shape-checks
15204|3|The Instance-Size Slider|MISSING|-|deferred: no purchase flow; no small-vs-large-node parameter in any state or config
15213|3|The Two Jobs Rule|MISSING|-|unlisted: authoring-review law; loader lint has no capability-count-per-buildable rule
15225|3|Warm-up and wind-down curves|MISSING|-|deferred: value-ramp states (training, warming, ramping, rot) unscheduled; no decay channel exists on buildable data
15238|3|The Warm Bench|MISSING|-|deferred: cold/warm/hot-standby capacity classes not in PHASE1-PLAN; door reservation vocabulary is drain-hand bookkeeping not spare capacity
15254|3|Headroom as an explicit, purchasable, visible stat|PARTIAL|e2f69d3 b7e262c 24dfcfe|Headroom lives internally (circuit headroomMw, error-budget risky-action headroom) but not as a named, tracked, scored top-level stat; the ratified OD-1 scorecard (commitment-convergence) does not consume it
15264|3|The Capacity Reservation (for yourself)|MISSING|-|deferred: sold-vs-reserved split unmodeled; the Yield Manager counterpart is likewise unbuilt
15275|3|Policies as a buildable class|PARTIAL|1fb4fc6 b1f757e d076ad5|Policy is a first-class system (cards, interpreter, door Commit on card-hash with ruleBookHash, versus content fingerprint) but not a palette class: no hands-per-month upkeep, no suspend-for-one-incident action
15287|3|The Standard Build (templates with a doctrine bonus)|MISSING|-|deferred: saved-template conformance economy unscheduled; no template concept in save or state
15300|3|The Dependency Contract|PARTIAL|e2f69d3 0a2f1ca|Edges carry service/bandwidth facts and g4 computes per-hop latency deltas against them (latency ladder); no declared latency/error-rate/availability band per link and no out-of-contract flag; economy contracts are customer SLAs not link promises
15314|2|4.2 Compute and application tier|PARTIAL|8fd409a 0a2f1ca|Engine nodes with slots, queues and rho ARE the compute archetype and g4 ships web/switch fixture devices; no tier buildable exists in shipped palette data
15316|3|Web Server (the 1U pizza box)|PARTIAL|8fd409a 0a2f1ca|The serving model is shipped core: 12-step pipeline with per-node slots, queue, rho, plus web-1 in g4 and simCoreRunner boards; utilization-vs-concurrency two-annulus widget and all visuals absent
15334|3|The Monolith (scale-up server)|MISSING|-|deferred: no instance-size classes in shipped data (palette unscheduled); the scale-up-vs-scale-out fork is unmodeled
15341|3|App Server / Worker Pool|PARTIAL|8fd409a 41fcdd2|Queue/worker-slot separation with retry-storm containment is the engine spine; no purchasable app-server object, framework-badge targeting, or job-token visual
15350|3|Shared Web Node (control-panel style)|MISSING|-|deferred: oversell dial is grep-zero across the repo; cpanel appears only as an archetype skin label in the shared-web bundle (08d4fe2)
15360|3|VPS / KVM Node (hypervisor)|MISSING|-|deferred: no hypervisor entity; CPU-ready-time, ballooning, noisy-neighbour-per-guest mechanics absent
15379|3|Dedicated Server|MISSING|-|deferred: no dedicated product buildable; lease/depreciation and customer-root liability arcs absent
15389|3|Bare-Metal-as-a-Service / Provisioning System (PXE/iPXE/Foreman-alike)|MISSING|-|deferred: no provisioning subsystem; PXE/iPXE grep-zero
15398|3|Container Host / Orchestrator (Kubernetes-alike)|MISSING|-|deferred: no orchestrator entity; etcd-quorum, CNI, cert-expiry failure modes all absent
15414|3|Hypervisor Host - "The Tray"|MISSING|-|deferred: migration verb unimplemented; licensing-repricing disaster event absent
15425|3|Serverless / Edge Function Tier|MISSING|-|deferred: serverless survives only as a schema enum value; Denial-of-Wallet and recursion loops unmodeled
15435|3|Warm Pool / Chrysalis Pool *(serverless)*|MISSING|-|deferred: unbuilt sibling of the unbuilt Warm Bench; no cold-start cost model
15441|3|Worker / Queue Pool|PARTIAL|8fd409a 41fcdd2|Bounded queues with worker slots and queue-ghost suppression (99 percent entry reduction proven) are engine behavior; no pool object to buy, no dead-letter bucket
15452|3|Cron / Scheduler Node|MISSING|-|deferred: the 00:00 stampede exists threat-side only (i18n keys, wave narrative); no scheduler buildable
15459|3|Batch / HPC Job Scheduler (Slurm-alike)|MISSING|-|deferred: preemption/spot/fairness-policy economy out of Phase-1 scope
15467|3|Bare-Metal Build Box / CI Runner|MISSING|-|deferred: CI-as-product absent; pipeline-compromise appears only in the threat registry
15473|3|Staging Environment|MISSING|-|deferred: no environment-tier entity or staging-parity drift mechanic
15487|3|Connection Pooler (pgbouncer-alike)|MISSING|-|deferred: connection exhaustion rides the generic queue; no pooler buildable
15494|3|Keepalived / VRRP Floating IP|MISSING|-|deferred: VIP and split-brain machinery absent (pairs with the unbuilt Witness row)
15500|3|Bare-Metal Beast (GPU box)|MISSING|-|deferred: no accelerator class and no buy-what-you-cannot-power gating rule; generic rack power/thermal limits do exist (e2f69d3)
15513|3|FPGA / ASIC Shelf|MISSING|-|deferred: era-locked purchase enforcement itself is absent (door accepts all shipped kinds)
15519|3|The Legacy Box You Can't Turn Off|MISSING|-|deferred: acquisition/inherited-estate content out of Phase-1 scope; the Surface-Budget Decommission boss it anchors is itself unbuilt (15157)
15527|3|Cell-Based Architecture / Shuffle Sharding|MISSING|-|deferred: cells and shuffle-sharding grep-zero; blast-radius ANALYSIS exists (blast.ts) but the purchasable strategy does not
15549|3|The Bulkhead / Resource Pool Partition|MISSING|-|deferred: per-dependency/per-class pool partitioning absent; only per-node queues ship
15560|2|4.3 Data and storage tier|PARTIAL|e2f69d3 0a2f1ca|Sql socket grammar, g4 db-node fixtures and the replay snapshot/restore substrate carry mechanism credit; zero storage buildables in shipped data
15562|3|Database Primary (the Vault / "The Drum")|PARTIAL|e2f69d3 0a2f1ca 47b2c33|Sql grammar is enforced at connect and g4 boards ship db-out/sql-in fixture sockets with the sql-out-into-silence refusal golden; connection exhaustion and lock contention are only generic queue saturation; no confidentiality-catastrophe tier
15582|3|Read Replica|MISSING|-|deferred: no replication entity; replication-lag correctness bugs unmodeled (redundancy.ts replica vocabulary is blast-group analysis)
15594|3|Automatic Failover / Cluster Manager|MISSING|-|deferred: failover, fencing/STONITH and quorum machinery all absent
15602|3|Cache Layer (Redis / Memcached / Varnish) - "The Coil"|MISSING|-|deferred: no cache-hit simulation or hit-rate gauge; cache-warm and cold-start appear only in wave-slice narrative text
15627|3|Local Disk|MISSING|-|deferred: no storage-tier object classes at all in shipped data
15633|3|RAID Array|MISSING|-|deferred: rebuild-window mechanics absent
15640|3|Erasure-Coded Pool / Erasure Coding Policy|MISSING|-|deferred: erasure-coding durability slider unscheduled
15650|3|NVMe Cache Tier|MISSING|-|deferred: storage tiering and write-cache-loss failure absent
15657|3|Object / Blob Storage - "The Comb Cell Block"|MISSING|-|deferred: no object-storage product; public-breach-classic and egress-moat economics absent
15670|3|NFS / SAN / Shared Storage|MISSING|-|deferred: shared-storage correlated failure domain unmodeled as a purchase (the concept itself is analyzed in blast tooling)
15680|3|Search Index / Search Cluster - "The Card Index Whirl"|MISSING|-|deferred: no search entity; expensive-query-as-L7-flood unmodeled
15688|3|Snapshot Layer / Snapshot Scheduler|MISSING|-|deferred: replay/checkpoint snapshots are state-capture machinery, not the storage product; no scheduler
15696|3|Immutable / WORM Storage|MISSING|-|deferred: retention-lock semantics absent
15703|3|Backup System / Backup Vault|MISSING|-|deferred: backup/restore product line unscheduled; measured-RTO and 3-2-1 pips have no engine hook (save lane covers lineage not restores)
15750|3|Backup Agent - "The Little Robot"|MISSING|-|deferred: no agent entity or coverage-shrug visual
15757|3|Restore Drill / Restore Test Runner / Restore Test Harness|MISSING|-|deferred: virtue-action unbuilt; replay/verify is a determinism harness not a storage drill
15769|3|Data Warehouse / Analytics Store|MISSING|-|deferred: no analytics entity; information-as-resource buildables unscheduled
15776|3|Log Aggregator / SIEM|MISSING|-|deferred: the fog-of-war remover is not a purchase; the observed/fog layer ships the problem not the cure (55a6086)
15790|3|Tape Library / Robot - "The Vault Wall + Arm"|MISSING|-|deferred: tape mechanics (arm travel time as level clock) unstarted
15801|3|Cold Archive Vault (offsite)|MISSING|-|deferred: second-site storage entity absent
15807|3|Secrets Manager / Vault - "The Safe"|MISSING|-|deferred: no secrets subsystem; keys-in-config visualization absent
15816|3|The Read-Only Mode Switch|MISSING|-|deferred: §7.7 degraded-mode family unbuilt; load-shed is the only degrade lever that ships
15827|2|4.4 Network and edge|PARTIAL|e2f69d3 5a10383 0a2f1ca|Network SUBSTRATE is the best-shipped tier: four-relation graph, closed socket grammar, physical latency geometry, powerFeeds chain with direct-supplier head; named carrier products nearly all absent
15829|3|Reverse Proxy / Edge Tier - "The Mirror" / "The Gatehouse"|MISSING|-|deferred: no proxy entity; TLS-key custody, rule-mess growth, request smuggling absent
15842|3|Load Balancer (L4 and L7 as separate builds) - "The Prism"|MISSING|-|deferred: no LB buildable; check-depth/interval/slow-start/outlier-ejection dials absent; generic per-node fan-out is the pipeline itself not a purchase
15873|3|LB Pair (HA)|MISSING|-|deferred: paired purchase and its VRRP dependency absent
15879|3|Firewall - "The Portcullis"|PARTIAL|e2f69d3 08d4fe2 4389737|Firewall-ish machinery exists: g1 defense toggle through the real intent door, whatIf disableDefense, default-deny-firewall and fail2ban ids in shipped buildables plans; stateful-table exhaustion, rule-count debt meter, arrow-slit visual absent
15898|3|Switch (top-of-rack) - "The Comb"|PARTIAL|0a2f1ca 8fd409a|sw-1 fixture switch ships in g4 with uplink/panel ports; slot-occupied, one-supplier-per-socket and self-edge rules enforce finite-port physics at the door; oversubscription, LACP/MLAG, broadcast storms absent
15914|3|Core / Aggregation Switch + Router - "The Junction" / "The Roundabout"|MISSING|-|deferred: no router entity; BGP surfaces only in the threat registry (misconfig threat side)
15924|3|Redundant Pair + VRRP / MLAG|MISSING|-|deferred: no HA-pair primitive; heartbeat-link failure mode unmodeled
15930|3|The Witness / Tiebreaker Node|MISSING|-|deferred: quorum-node entity and its third-failure-domain placement trap absent
15940|3|Transit Link / Transit Contract - "The Big Ribbon"|MISSING|-|deferred: 95th-percentile billing, commit/overage cliffs unmodeled; economy contracts are customer-side only
15951|3|Second Transit Provider (multihoming)|MISSING|-|deferred: ASN/IRR/RPKI/full-table-router prerequisite chain unscheduled
15962|3|IX / Peering Port - "The Handshake Bridge"|MISSING|-|deferred: no peering entity or de-peer dispute events
15974|3|BGP Speaker + RPKI / "The Lighthouse"|MISSING|-|deferred: no routing control plane; route-leak/hijack failure modes absent
15984|3|IRR / RPKI Publication and Peering Hygiene|MISSING|-|deferred: reputation-as-configuration layer unscheduled
15993|3|Anycast Network / Anycast Constellation - "The Tuning Fork"|PARTIAL|08d4fe2|The anycast id ships in game-servers buildables.distinct (parsed by the loader, zero behavior); nearest-PoP snapping and global-mistake dynamics absent
16004|3|Anycast Health Withdrawal Controller + Withdrawal Policy|MISSING|-|deferred: withdrawal cascade and hysteresis floor unstarted
16014|3|Private Interconnect / Dark Fiber|MISSING|-|deferred: no inter-site link product class
16019|3|Cross-Connect - "The Violet Run"|MISSING|-|deferred: per-cable recurring revenue, tray capacity, as-built-record debt all absent
16038|3|CDN Contract / Edge PoP - "The Star"|MISSING|-|deferred: no CDN entity; mechanism credit only via unattended whatIf disableDefense/removeNode toggles (a864061)
16053|3|DDoS Scrubbing Service - "The Comb"|PARTIAL|08d4fe2 a864061 4389737|scrubbing-retainer (shared-web) and ddos-scrubbing-retainer (game-servers) ids ship as nonPhysical names, absorb role lives in the coverage grid, disableDefense toggles defenses; detour latency, delay-fuse activation, percentage-of-peak pricing absent
16079|3|Upstream Blackhole Signalling (RTBH) + Flowspec|MISSING|-|deferred: no upstream-signalling primitive anywhere
16095|3|Network Segmentation / VLANs - "The Coloured Floor Paint"|MISSING|-|deferred: edge relations are typed data/power/control/trust (e2f69d3) which is not VLAN segmentation; lateral-movement gating absent
16109|3|Microsegmentation - "The Grid Lines"|MISSING|-|deferred: unbuilt sibling of the VLAN row
16115|3|Egress Filtering|PARTIAL|08d4fe2 47b2c33|The egress-filtering id ships in shared-web buildables.distinct (parsed, name-only); the ledger enforces the invitation-gating rule-class it belongs to; no outbound policy behavior modeled
16123|3|VPN / Bastion / Jump Host / Zero-Trust Access - "The Gatehouse" / "The Tunnel Mouth"|MISSING|-|deferred: admin-path surface and concentrator-capacity limits unmodeled
16135|3|Out-of-Band Management (IPMI/iDRAC/iLO) + Console Server - "The Grey Shadow Network"|MISSING|-|deferred: no shadow network; the three-tier reboot/BMC/outlet recovery ladder is absent
16155|3|Out-of-Band LTE/5G Modem (per site)|MISSING|-|deferred: per-site OOB entity absent
16162|3|IPv6 Deployment|MISSING|-|deferred: dual-stack config surface and the forgotten-second-ruleset trap absent
16169|3|IP Space (owned vs leased)|MISSING|-|deferred: address-block asset, blacklist-inheritance and rehab verbs unscheduled
16183|3|Flow Telemetry (NetFlow / sFlow / IPFIX)|MISSING|-|deferred: per-customer traffic attribution unstarted; observed-layer metric cells are the game's generic instrument substrate, mechanism credit only
16193|3|Network Config Backup + Diff|MISSING|-|deferred: per-device config state is not modeled; replay/diff compares sim state not device configs
16203|3|Tap / Port Mirror - "The Periscope"|MISSING|-|deferred: visibility-placement puzzle absent
16209|3|Patch Panel - "The Jack Field"|PARTIAL|0a2f1ca 8fd409a|A patch-panel fixture node ships in g4 (layer-7 panel providing http-in AND sql-in) and exercises socket-fit refusals and the latency ladder; double-port consumption and documented-change discipline absent
16220|3|Looking Glass / Public Route Server / Public Speed Test|MISSING|-|deferred: marketing-tool builds unscheduled; Engineer Reputation feed absent
16228|3|QoS / Traffic Shaping Policy|MISSING|-|deferred: no prioritization mechanic at all - the shared-pipe pillar currently degrades all classes uniformly, exactly the tower the spec calls missing
16244|3|Load Shedding by Priority|PARTIAL|8fd409a 2eaf830|Hard-ceiling shedding runs in step 5 with a door-configurable shed-order and candidates now terminate instead of leaking (golden-pinned); the free-tier-to-low-tier peacetime class ladder and its unlock moment are absent
16253|3|Admission Control and Bounded Queues|PARTIAL|8fd409a 41fcdd2|Bounded queues that reject at the front are engine law (hockey-stick queue model, fast-bounce-over-slow-timeout behavior, queue-ghost dedup); no purchasable/edge-configurable instance of it
16261|3|The Queue Dial|PARTIAL|8fd409a 55a6086|Queue depth, patience drain and stale-work are live per-node engine state surfaced through observed cells; no player-settable 0-to-deep slider on capacity nodes
16277|3|Structured Cabling Tray / Overhead Ladder Racking|MISSING|-|deferred: tidiness economy and Rat's Nest visuals (§4.7 dependency) unscheduled

## SUMMARY

- Rows: 125 (4 level-2 + 121 level-3), matching hosting_game.md lines 14875-16284 exactly.
- DONE 0 | PARTIAL 31 | PROBLEM 1 | MISSING 93 | NA 0.
- Note on expectation: the orchestrator brief said "5 ## + 121 ### = 126 rows"; the file disagrees — line 14859 is the level-1 `# 4. Buildables…` chapter head (Table 1 of outline.md), and only four `##` headings (14875, 15314, 15560, 15827) live in range. Per the brief's MANIFEST rule (one row per ## and ###) the correct count is 125.
- Structural finding: §4 is the buildable CATALOG chapter, and Phase-1 deliberately shipped the engine and gates rather than the catalog. The palette anchor (`paletteRef: "palette:shared-80"`) is referenced by both shipped type bundles but defined nowhere; loader lint (ef8f35e) only verifies the ref's SHAPE. That single absence explains nearly every MISSING below 4.1.

## TOP-PROBLEMS

1. **Role-taxonomy collision (15178, PROBLEM).** The spec's nine BUILD roles (Capacity/Throughput/Latency/Classify/Contain/Detect/Recover/Revenue/Policy) exist nowhere as tags, while coverage/defenseRoles.ts (e24e1bb) ships the nine DEFENSE roles sharing only four words. The spec explicitly promises the Coverage Grid "reads from the same tags" — today it reads from a different vocabulary, and no ComponentTemplate or buildable-plan entry carries any role field.
2. **Dangling palette anchor (root cause of ~85 MISSING rows).** Both packages/content type bundles point buildables at `palette:shared-80`; the palette itself is not shipped data. Every named per-tier buildable in 4.2-4.4 therefore has no possible home, while the ledger/vessel machinery is fully ready to consume it — the chapter is blocked on one content artifact, not on code.
3. **The Surface Budget valve is one-way (15157).** waves/ledger.ts enforces "threats unspawnable until invited" but there is no Surface number, total meter, surface-weighted composition draw, and no Decommission/Narrow/Wrap verbs — the spec's core claim that P2 "currently has no player agency inside it" remains TRUE of the implementation.
4. **topology/physical.ts is built-but-dead (15114).** The full rack-elevation/floor-load/thermal/adjacency model is shipped and tested (e2f69d3) yet has ZERO non-test consumers; g4's placement refusals run through host-supplied validators instead. Buy-screen U-Tetris, thermal circuit rows and the tipping-rack trap will rot if no lane wires this in.
5. **Build Card omits the decision-bearing rows (14914).** The g4 terms card ships infrastructure stats (Bandwidth/Monthly/Latency/SLA) but NOT the spec's "Closes:", lead time, blast radius, or removal cost — precisely the rows the spec calls "the single most useful number for a placement decision" and "exit cost at the entrance".
6. **No time dimension for procurement (15137/15191-15238 cluster).** Lead times spanning days-to-months, the "panic-building doesn't save you" law, and its Warm-Bench/Rentals partner are all absent; hand-occupancy of 3 ticks is the entire build-latency model.
7. **QoS absence undermines the central pillar (16228).** The game's thesis is a shared pipe, yet congestion degrades every class uniformly by design — the spec flags prioritization as "the most obviously correct missing feature", and nothing in the pipeline reserves shares per class.
8. **Headroom is invisible to scoring (15254).** Circuit headroomMw and error-budget headroom exist internally, but the ratified OD-1 scorecard (24dfcfe) does not consume a Headroom stat, so over-building is still "an accident" rather than the legible strategy the rule demands.
