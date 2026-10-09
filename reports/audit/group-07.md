# Group g07 audit — 2.6 Credential/access/human + 2.7 Infrastructure/network + 2.8 Entropy/physics — lines 7152-8016

## MANIFEST
line|level|heading|STATUS|hash(es)|note
7152|2|2.6 Credential, access, and human threats|MISSING|4ce67fc|deferred: Phase-1 shipped g1 slice only — 1 of 17 named units has a shipped analog (Brute Force row) rest out of PHASE1-PLAN scope
7154|3|Brute Force Drip|PARTIAL|4ce67fc 8fd409a|shipped live in g1 slice as wp-login-brute-squad (registry-core + waves json) with rate-limit bounce mechanics; log-volume/CPU true-cost framing unbuilt
7159|3|Credential Stuffing Tide / Keyring Hail|MISSING|-|deferred: Phase-1 scope; no MFA conversion-churn or per-account economics in economy/ or waves/
7179|3|Phishing Campaign / Phishing Kite|MISSING|-|deferred: no staff/training model — morale grep in sim-core hits only save/lineage naming
7188|3|The Insider / Insider Badge / The Flickering Badge|MISSING|-|deferred: staff NPCs unbuilt; policy/store.ts journal is rule-audit not access-log overlay
7222|3|The Disgruntled Admin|MISSING|-|deferred: morale/turnover stats absent from engine
7229|3|The Ex-Employee / Forgotten Key|MISSING|-|deferred: offboarding/access-review business decisions not modeled
7240|3|Social Engineering Call / Vishing the Support Desk|MISSING|-|deferred: support-ticket dialogue lane not built (i18n packs author ticket copy only)
7253|3|The Friendly Face (badge tailgating, presentation)|MISSING|-|deferred: no badge/physical-access layer; camera-cone §2.26 also unbuilt
7264|3|Registrar / DNS Hijack / Domain Takeover|MISSING|-|deferred: no DNS or registrar objects in sim-core or content
7272|3|Exposed Management Interface|MISSING|-|deferred: OOB/IPMI management plane absent; attack-surface scanner buildable unbuilt
7282|3|Living Off The Control Panel|MISSING|-|deferred: behavioural admin analysis absent; policy/ rules evaluate observed metrics not admin actions (1fb4fc6)
7296|3|The Leaked Key In The Public Repo|MISSING|-|deferred: secret-scanning service and spend-anomaly alerting unbuilt
7306|3|The Canary That Nobody Watched|MISSING|e24e1bb|deferred: honeypot appears only as a defenseRoles example string in the coverage grid; alerting-path failure mode unmodeled
7314|3|Supply Chain Vendor|MISSING|e2f69d3|deferred: shared-fate primitives live (redundancy findCorrelations) but vendor-compromise event never fires
7321|3|Control Panel Exploit|PARTIAL|e2f69d3|templateDomains kill-all monoculture failure domain is live engine (domains.ts:143 + blast.ts) exactly modelling fleet-wide simultaneous death; no exploit event authoring
7328|3|Tailgating / The Unescorted Visitor / The Evil Maid|MISSING|-|deferred: physical intrusion sprites/doors absent
7338|3|The Guy In A Hi-Vis Vest With A Clipboard / Sneakernet Intrusion|MISSING|-|deferred: building-scale physical units deferred with colo facility content
7347|2|2.7 Infrastructure and network threats|MISSING|e2f69d3|deferred: no provider/routing threat class authored; four-relation graph and link registry are the shipped substrate riding sub-rows
7349|3|BGP Prefix Hijack *(Siege role)*|MISSING|-|deferred: no routing plane; Trust-with-upstreams fifth currency never modeled (economy buckets free-only)
7372|3|BGP Leak / The Spill|MISSING|-|deferred: BGP announcements unmodeled
7380|3|The Downstream Route Leak|MISSING|-|deferred: customer re-advertisement/prefix filters absent
7389|3|The Max-Prefix Shutdown|MISSING|-|deferred: peer-session config limits not modeled
7397|3|BGP Dampening — the punishment that outlasts the fault|MISSING|-|deferred: suppression timers absent; nothing flaps yet
7407|3|The RPKI Self-Inflicted Blackhole|MISSING|-|deferred: ROA validation unmodeled
7416|3|DNS Poisoner / Cache Poisoning|MISSING|-|deferred: resolution path before the lane not simulated; shipped open-resolver-reflection is an amplification unit not DNS infra
7423|3|Subdomain Takeover|MISSING|-|deferred: DNS record objects absent
7431|3|Transit Flap|MISSING|-|deferred: link state is static telemetry in topology/link.ts; no up-down generator
7438|3|Upstream Transit / Fiber Cut / The Backhoe|PARTIAL|e2f69d3 a864061|mechanisms live: unattended whatIf removeNode counterfactual + effective-vs-nominal redundancy verdicts; diverse-path audit buildable and conduit modeling absent
7454|3|Upstream Carrier Outage / The Grey Ribbon|MISSING|-|deferred: carrier entities unmodeled
7462|3|Peering Dispute / De-peering|MISSING|-|deferred: IX/peering objects absent; latency geometry table covers adjacency not provider relations
7470|3|The Blended Transit Downgrade|MISSING|-|deferred: transit quality-vs-quantity not modeled; link speeds are capacity not path quality
7480|3|Asymmetric Routing After Failover|MISSING|-|deferred: stateful per-path routing absent
7486|3|The Half-Dead Link (unidirectional failure)|MISSING|e2f69d3|deferred: unidirectional failure unmodeled; egress bead in POLICY_BEADS is nearest grammar
7496|3|The Microburst|MISSING|55a6086|deferred: telemetry-resolution dial unbuilt; observed/ confidence+fog is visibility law not buffer sampling
7509|3|Spanning Tree Loop / Broadcast Storm / MAC Flood|MISSING|b1f757e|deferred: data-plane loop catastrophe unmodeled; intent-door refuses power cycles only (connect handler)
7516|3|Rogue DHCP / Rogue AP|MISSING|-|deferred: addressing services absent
7522|3|The PXE Reimage Incident|MISSING|-|deferred: provisioning network/automation absent
7532|3|Duplex/Speed Mismatch, Bad Optics, and the Dirty Connector|PARTIAL|e2f69d3|link.ts negotiateDown silent-negotiate-down finding is live engine with tests; dirty-connector/CRC optics event class absent
7548|3|NIC / Optic / Cable Gray Failure|MISSING|-|deferred: partial-failure gray generator absent (repo grep zero for gray-failure)
7556|3|MTU Mismatch / PMTUD Blackhole|MISSING|-|deferred: MTU appears nowhere in sim-core/apps/proto (grep zero hits)
7562|3|The Asymmetric MTU Path|MISSING|-|deferred: MTU absent — same gap as row above
7569|3|Switch Firmware Bug / Stack Master Failover|MISSING|e2f69d3|deferred: switch failure domain live but HA-mechanism-causes-outage events unimplemented
7575|3|The Firmware Flash That Didn't Finish|MISSING|-|deferred: firmware state machines absent
7584|3|The Config Nobody Backed Up|MISSING|-|deferred: network config management not modeled
7593|3|The Management Network That Rode The Production Switch|MISSING|e2f69d3|deferred: shared-domain correlation can express the trap; OOB recovery path unmodeled
7601|3|Clock Drift / NTP Failure — split into two failures|MISSING|-|deferred: SimTimeUs kernel is exact; no drift/slew/step failure surface
7613|3|Conntrack Table Full / Ephemeral Port Exhaustion / File Descriptor Limit|MISSING|8fd409a|deferred: slots+queue model service capacity and rho not kernel table limits
7620|3|The Loose Cable|MISSING|-|deferred: cosmetic precursor units absent
7627|3|Rodents, Wildlife, and the Literal Bug|MISSING|-|deferred: fauna events + chew-damage precursor state unbuilt
7641|2|2.8 Entropy: hardware, power, cooling, and physics|PARTIAL|47b2c33 e2f69d3|entropy telegraph band + entropyForecastPurchased instrument law live (waves/bands.ts); entropic ThreatFamily enumerated with ZERO shipped members; no event generator
7649|3|The entropy rate cap and aggregation rule|MISSING|47b2c33|deferred: band-visibility half shipped (telegraphVisible); 90s alert-stack cap + maintenance-debt overlay unimplemented
7658|3|The Entropy Pressure Budget (a second, quieter generator)|MISSING|-|deferred: waves/director.ts runs the attack budget only; estate-age × size × (1−maintenance) generator nowhere
7668|3|The stated entropy budget (numbers)|MISSING|-|deferred: no annualised-failure-rate fields exist in any shipped record shape
7680|3|Disk Failure / Click Death|MISSING|-|deferred: hidden drive wear stat + SMART foresight unbuilt
7696|3|Rebuild Storm / The Double Failure|MISSING|-|deferred: arrays/RAID/rebuild windows not modeled
7715|3|Correlated Batch Failure / The Bad Batch|PARTIAL|e2f69d3 5a10383|environmental-correlation half live engine: redundancy findCorrelations + maxIndependentSet + blast domains detect shared rack/PDU fate; lot/firmware correlation + Mixed-Vendor Procurement absent
7734|3|RAID Controller BBU Death|MISSING|-|deferred: write-back cache tier absent
7740|3|Silent Bit Rot / The Fade|MISSING|-|deferred: scrub/checksum verification events unimplemented
7753|3|RAM / ECC Error Cascade / Bad RAM / Static Fleck|MISSING|-|deferred: memory state absent from topology node records
7764|3|PSU Pop / The Pop|PARTIAL|e2f69d3 5a10383|the spec's exact trap (redundant PSUs same feed are decorative) is the live Broken-N+1 verdict via powerFeeds + assessRedundancy; the pop event itself never fires
7778|3|Fan Failure → Thermal Throttle / The Wobble|MISSING|e2f69d3|deferred: thermalCouplingFixed geometry exists in physical.ts; no capacity-decay chain in pipeline
7789|3|Backplane / Controller / Motherboard Failure|MISSING|-|deferred: chassis-level unit absent (rack domain is nearest)
7792|3|Switch Failure|PARTIAL|e2f69d3 8a5f413|switch domains degrade-amber per ratified two-color law (T-9 era); firmware-upgrade longer-outage variant unmodeled
7795|3|PDU Overload / Breaker Trip|PARTIAL|e2f69d3|the 80%-continuous-load arithmetic constraint with overCap red-bar headroom is live engine (physical.ts derate80/circuitBudget) tested; trip-cascade event fires zero sim ticks (PDU kill-all domain unwired)
7804|3|Phase Imbalance|MISSING|-|deferred: three-phase distribution not modeled
7810|3|Power Loss / Brownout / The Power Event Ladder|MISSING|-|deferred: utility→UPS→generator chain absent
7829|3|UPS Battery End-of-Life|MISSING|-|deferred: UPS objects/capacity testing unimplemented
7838|3|Generator Fails to Start|MISSING|-|deferred: maintenance rituals (load-bank tests) absent
7849|3|Fuel Runs Out|MISSING|-|deferred: fuel logistics unmodeled
7858|3|CRAC / Chiller / Cooling Failure|MISSING|e2f69d3|deferred: thermalNeighbors row-distance geometry exists; heat-field spread and time-to-shutdown countdown unbuilt
7877|3|Blanking Panel Neglect / Hot Aisle Recirculation|MISSING|-|deferred: airflow containment absent
7884|3|Water Leak / Condensation / Puddle Creep|MISSING|-|deferred: region-damage random events unimplemented
7901|3|Fire, Fire Precursor, and Suppression Discharge|MISSING|-|deferred: VESDA/suppression model absent
7917|3|Humidity / Static / Dust / The Grime Layer|MISSING|-|deferred: accumulation-tax maintenance system unbuilt
7931|3|Seismic / The Tremor|MISSING|e2f69d3|deferred: RackDraft carries ratedFloorLoadGrams only — no anchoring field or regional disaster event
7938|3|Weather, Storm, Flood, Lightning|MISSING|-|deferred: weather system absent; Facility.region is a label not a hazard surface
7950|3|Kernel Panic / OOM Killer|MISSING|-|deferred: no per-machine memory pressure or swapping entity (alive-and-useless law unbuilt)
7964|3|Inode Exhaustion|MISSING|-|deferred: lying-dashboard disk states absent
7970|3|Log Partition Full|MISSING|-|deferred: self-amplifying logging spiral unimplemented
7978|3|Weight Limits on Raised Floor|PARTIAL|e2f69d3|floorLoadVerdict with over-flag + per-rack ratedFloorLoadGrams is live tested engine; the one-real-job consequence (battery/storage forced off-compute spatial law) unwired
7986|3|The Hardware Lottery|MISSING|-|deferred: hidden machine quality + burn-in/warranty counterplay absent
7999|3|Physical: Someone Unplugs The Wrong Thing|MISSING|c253643|deferred: disconnect verb and opt-in drain ship but no wrong-thing blunder actor or labelling buildable
8007|3|Tape Library Robot Jam / Media Failure / The Arm Jam|MISSING|-|deferred: archival subsystem absent

## SUMMARY
DONE: 0
PARTIAL: 10
PROBLEM: 0
MISSING: 74
NA: 0
TOTAL ROWS: 84 (3 `##` + 81 `###` — matches outline.md Tables 2-3 for 2.6/17, 2.7/31, 2.8/33)

## TOP-PROBLEMS
1. The entire 2.7 network-provider class (BGP/DNS/transit — 27 of 31 rows) is MISSING: nothing in the engine announces routes, resolves names, or models carriers. The shipped 16-threat registry-core census contains zero 2.7 threats; only the structural substrate (four-relation MultiGraph e2f69d3, first-class link objects with negotiateDown/timeout-monotonicity law) exists as future wiring points.
2. 2.8 has no generator at all, but three real live-grammar pieces exist and should be recorded as the adoption points: the `entropy` TelegraphBand with `entropyForecastPurchased` lever (47b2c33 waves/bands.ts), the `"entropic"` ThreatFamily enum (types.ts:882) which has ZERO shipped members, and physical.ts arithmetic primitives (derate80/circuitBudget, floorLoadVerdict, thermalCouplingFixed). An entire half of the spec's "estate is always quietly rotting" loop (rate cap, entropy pressure budget, annualised failure numbers) awaits a content+engine lane.
3. The five PARTIALs (7321 Control Panel Exploit, 7438 Fiber Cut, 7532 Duplex Mismatch, 7715/7764/7792/7795/7978 cluster) are all the same shape: failure-domain arithmetic is live engine while the triggering event never fires. T-9 ratification (8a5f413) settled the two-color kill law (power RED / racks AMBER), so blast.ts is ready to host entropy events.
4. Fifth-axis dependency noted per orchestrator brief: 2.8 items are affected by the same gap g01 flagged at line 620 — economy/scoring.ts `applyFifthAxis` is LIVE (24dfcfe) but shipped type bundles configure no fifth axis, and OD-14 (canonical type count, DECISIONS-PENDING.md:73) remains OPEN, so per-type entropy scoring (e.g. archival hosting's bit-rot weight, GPU theft stakes) has no ratified canon to ride.
5. Brute Force Drip (7154) is the only 2.6 concept with shipped existence — as `wp-login-brute-squad` in registry-core.json + the g1-shared-web slice. The doc's distinct credential-theft taxonomy (stuffing, insider, ex-employee, vishing, control-panel living-off) has no staff, credential, or account entity in the engine to hang on; the whole human-threat layer needs a staff/HIM model that Phase-1 never scoped.
6. "Trust-with-upstreams" (7349) is called out in-spec as "the hidden fifth currency §6.1 invents and never uses anywhere else" — audit confirms it is still used nowhere: economy ships six money buckets + reputation only, so the BGP phone-tree minigame has no state to read.
