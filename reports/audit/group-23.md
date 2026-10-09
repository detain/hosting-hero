# Group g23 audit — 8.8–8.18 UI/HUD, readability, identity, audio, motion, a11y, type, asset spec, photo mode — lines 30889-32667

## MANIFEST
line|level|heading|STATUS|hash(es)|note
30889|2|8.8 UI and HUD|PARTIAL|faf81a7|chrome lane shipped the HUD core; most named widgets unbuilt
30891|3|The HUD skeleton|PARTIAL|faf81a7|top bar+alert stack+drawer+bezel+clock ribbon shipped; no build palette or inspector in shell
30906|3|The Screen Budget|PARTIAL|4ff4a4f|TopBar.vue pins 48px strip; no 66%/220px/120px allocation or responsive rules anywhere
30920|3|The Bezel HUD / the Instrument Bezel|DONE|faf81a7|BezelHud.vue tint+worst-severity rule+pressure lip; instruments/ 5 faces behind InstrumentBezel.vue
30931|3|The Panic Layout|DONE|faf81a7|chrome/panic.ts derivePanic+bigNumberDecision+dimsNonEssential + PanicLayout.vue data-hud-optional
30940|3|The Top Bar — the Vitals|PARTIAL|faf81a7|4 permanent rows+threshold promotion+user pins (metrics.ts/promotion.ts); Threat Mass Bar + nines waterline absent
30958|3|The Bottom Dock — the build bar|PARTIAL|0a2f1ca|G2 palette tiles carry price+surface icons+build btn; no radial/search/censored silhouettes/ghost
30968|3|The Tradeoff Bar on every build card|PARTIAL|0a2f1ca|g2/index names capability-surface tradeoff on tiles; not the two-sided cyan-amber bar on all cards
30974|3|The Cost Ghost (lifetime cost, not sticker price)|MISSING|-|unlisted: no lifetime-cost hover computation or widget in apps/proto
30980|3|The Compare Tray|MISSING|-|unlisted: nothing resembles a multi-card comparison tray
30985|3|The Right Panel — the Inspector Faceplate|MISSING|-|unlisted: no right-panel inspector and no Face/Truth tab split
30997|3|The Left Rail — the Alert Stack|DONE|faf81a7|alertStack.ts grouping+severity+SNR-driven dim+snooze/silence-still-visible + AlertStack.vue
31011|3|The Bottom Strip — the Rack Ribbon and the Ledger Tape|PARTIAL|0a2f1ca|Gate5InvoiceTape.vue is a receipt tape inside the G5 gate; Rack Ribbon absent
31016|3|The Site Preview Window|MISSING|-|deferred: PHASE1-PLAN:165 keeps scope to gate panels; widget unlisted in plan
31050|3|The Pulse Strip|MISSING|-|unlisted: pulseStrip is only an observed fairness-channel name in sim-core
31060|3|The Hum Bar|MISSING|-|deferred: audio/README gap ledger — bus seam shipped, no visual strip
31072|3|The overlay wheel and its discipline|PARTIAL|4ff4a4f|budget.ts overlay category cap 1 + orange lens-hue job; zero of the 15 overlays exist
31095|3|The Policy Layer view|MISSING|-|unlisted: intent layer slot exists in render/layerSpec.ts but paints nothing
31104|3|Visual grammar for "not built"|MISSING|-|unlisted: no construction-line ghost rendering
31113|3|The incident ticker|PARTIAL|0a2f1ca|Gate5Ticker.vue scrolls event one-liners; no camera Snap-to-subject
31118|3|The Unified Clock Ribbon (Timeline + Obligation Rail, merged)|DONE|faf81a7|clockRibbon.ts buildRibbonModel two tracks + top-3 urgency×consequence enlargement + scrub
31139|3|The graph drawer and the Graph Specification|PARTIAL|4ff4a4f|Drawer.vue opens a skeleton slot; house-style percentile bands absent
31154|3|The Telemetry Resolution zoom|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31163|3|The Demand Ratchet marker|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31168|3|"Explain This Number"|DONE|faf81a7|explainRegistry.ts inputRefs walk + ExplainValue/ExplainPopover.vue step-into-trail
31177|3|The Diff View|PARTIAL|b9295b5|replay/diff.ts snapshot-diff engine shipped; no diff UI panel
31187|3|The dependency map|PARTIAL|e2f69d3|topology four-relation multigraph + blast radius shipped; no generated map view
31192|3|Sparklines everywhere|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31196|3|Group / meta-nodes|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31200|3|Growing tooltips|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31210|3|The hover-card contract|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31219|3|The "Why Did I Lose Money" button|MISSING|-|unlisted: what-if forward sim (a864061) is a different lens
31224|3|The minimap, the NOC wall, and the Money Minimap|MISSING|-|deferred: PHASE1-PLAN:165 full iso scene mount pending
31237|3|The Ledger Drawer|MISSING|-|unlisted: Drawer.vue comment defers Ledger Tape to later waves
31241|3|The Drawer System|PARTIAL|4ff4a4f|single Drawer.vue skeleton; no Sales/Support/Finance department drawers
31246|3|The MRR Waterfall Widget|MISSING|-|unlisted: MRR is a permanent top-bar row only; zero waterfall hits
31251|3|The Cash Calendar|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31256|3|The Runway Bar|PARTIAL|b7e262c|economy/runway.ts observeRunway+death-spiral shipped; no draining HUD bar
31262|3|The Funnel Column|PARTIAL|55a6086|observed deriveCell funnel exists; no particle-spilling column widget
31267|3|The Cohort Wall / Cohort Grid|MISSING|-|unlisted: churn cohorts exist in economy only
31272|3|The Contract Gantt|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31277|3|The Renewal Calendar|PARTIAL|0a2f1ca|Gate5RenewalStrip.vue + kanban renewal column prove the row; not a business-lens forecast
31281|3|The SLA Meter|PARTIAL|b7e262c|sla-credit-due notices + G5 error-budget panel; no per-contract climbing meter
31291|3|The Concentration Donut|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31297|3|The Obligation Rail / the Commit Ledger|DONE|faf81a7|merged into ClockRibbon per the heading's own clause; obligations render as pips
31303|3|View filters: Money / Risk / Customer|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31310|3|The ticket queue panel|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31314|3|The DR Declaration board|MISSING|-|deferred: DRaaS line out of Phase-1 (only g1 slices shipped 4ce67fc)
31319|3|Dead Air|MISSING|-|deferred: streaming line out of Phase-1 scope
31325|3|Time-of-day lighting and the Diegetic Clock|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31331|3|Diegetic meters|PARTIAL|faf81a7|five instrument faces render as DOM bezels with Readout Mode; nothing world-mounted
31340|3|Notification discipline|PARTIAL|faf81a7|alert-stack caps+SNR dim shipped; three-channel spec + sev-1-modal rule not enforced
31349|3|Tutorial-free onboarding|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31359|3|The Attention Heatmap|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31367|3|The Regret Marker|MISSING|-|unlisted: replay causality exists in sim-core, no marker UI
31373|3|The Scale Bar and the Unit Stamp|PARTIAL|faf81a7|numberLaw StampedValue carries ms-units; no familiar-comparison ticks
31381|3|Quiet Mode and Packet Mode|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31388|3|The Player Character Question|PARTIAL|0a2f1ca|G4 hands-rail renders hand tokens; desk/mug/pager fantasy absent
31398|3|Diagram export|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31402|3|The Two-Second Rule for Every Screen|MISSING|-|deferred: PHASE1-PLAN:165 acceptance harness row still 🚧
31412|2|8.9 Readability at scale|PARTIAL|4ff4a4f|LOD+budget+label machinery shipped; drawing-side mostly absent
31414|3|Aggregate, don't shrink|PARTIAL|4ff4a4f|camera.ts declares LOD1-racks/LOD2-aggregates; no aggregate glyph rendering
31430|3|The Aggregate Glyph|MISSING|-|unlisted: the 5-field aggregate contract has no code shape
31437|3|Heat Tiles over Sprites|PARTIAL|0acf46e|substrate tileField law + quad caps (27f2856); mount HOLD until real atlases
31443|3|The Fleet Sparkline Wall|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31449|3|Anomaly highlighting, not status highlighting|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31458|3|Roll-Up Rendering|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31463|3|Aggregation badges|PARTIAL|4ff4a4f|+N collapse shipped in budget.ts refusal clusters + TopBar/alertStack
31466|3|The colour budget|DONE|4ff4a4f|budget.ts enforces alertHue cap 3 across pool; ALERT_HUES closed in hues.ts (1e6b306)
31470|3|Alarm propagation and worst-state-wins|PARTIAL|faf81a7|BezelHud takes worst instrument state up; no per-container worst-wins propagation
31473|3|Row rhythm and floor signage|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31480|3|Tenant tinting|MISSING|-|deferred: colo line out of Phase-1 (g1 slices only)
31493|3|The Heartbeat Sync|DONE|4ff4a4f|heartbeat.ts HEARTBEAT_HZ 0.5 drives g1Scene motes + grain filter phase (c503d2d)
31502|3|The Cadence — rendering "nothing is happening" as an achievement|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31513|3|The Quiet Frame Test|MISSING|-|deferred: PHASE1-PLAN:165 acceptance harness not built
31520|3|The Loud Frame Test|MISSING|-|deferred: same harness row as Quiet Frame
31529|3|The Thumbnail Test|MISSING|-|deferred: same harness row (128px variant)
31536|3|Auto-LOD collapse and label culling|PARTIAL|4ff4a4f|LABEL_CAP_BY_ALTITUDE Z1-Z4 + discrete LOD table; no importance-ranked culling pass
31543|3|The readability targets|PROBLEM|40a036e|perf grid harness exists but 2k/20k figures are OD-10/OD-12 unratified and unmeasured
31552|3|Zoom tiers change the metaphor|PARTIAL|4ff4a4f|ALTITUDE_TABLE + selection-screen-invariant go(); tier-specific visual languages undrawn
31561|2|8.10 Per-type and per-era visual identity|PARTIAL|b3a149d|skin-kit + era-token machinery; per-type identity content absent
31566|3|The Business-Line Skin System — the Five-Asset Skin Kit|PARTIAL|b3a149d|hh-skin-kit@1 five-slot contract + sampler-law manifest; seed kit is PLACEHOLDER art
31616|3|The required five-field catalogue format|PARTIAL|b3a149d|kit.json carries the five assets; density/arrival-rhythm parameter fields not in schema
31627|3|The Hero Object Rule|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31632|3|The HUD Swap Per Type|PARTIAL|0a2f1ca|G6 meterFace-binds-instrument-face data seam (g6Data.ts); TopBar gauge slot never shipped
31644|3|The Cross-Business Facility|MISSING|-|deferred: multi-line play out of Phase-1 (g1 slices only 4ce67fc)
31651|3|Multi-line districts|MISSING|-|deferred: same multi-line scope gate
31656|3|The Business Line Placard|MISSING|-|deferred: same multi-line scope gate
31660|3|Cross-line collision control|MISSING|-|deferred: same multi-line scope gate
31670|3|Density signature|PARTIAL|47b2c33|waves ratePerMin envelopes are the density knob in data; nothing renders it
31677|3|Visitor rhythm signature|PARTIAL|47b2c33|per-line arrival curves shipped in g1 wave slices (G6 proves); visual tempo unbound
31685|3|Material and lighting language per line|MISSING|-|deferred: ADR-0008 step-5 pixel audits deferred until real atlases
31697|3|Per-line visual identities — the catalogue|MISSING|-|deferred: only shared-web + game-server slices exist (4ce67fc)
31810|3|Era presentation shifts|PROBLEM|4ff4a4f|era-tokens.css ships 1998/2026 only; MODULE-STATUS era-count row awaits owner era grid
31820|3|The Chrome Skin Token Set|DONE|4ff4a4f|exactly 4 tokens × 2 themes (era-tokens.css); era lift 17f3c8b wires toggle end-to-end
31837|3|Era UI skins, enumerated|PROBLEM|4ff4a4f|2 of 5 enumerated skins; owner-gated per MODULE-STATUS era row (same as above)
31842|3|The era kits (art bible notes)|MISSING|-|deferred: no real pixel art exists (assetpack README passage)
31867|3|The Era Transition Animation|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31875|3|The signature-motion set|MISSING|-|unlisted: 13 named motions have zero implementations
31886|3|The Skin Preview Room|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31891|3|The Signature Frame|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
31896|3|Weather and place at Z4|MISSING|-|deferred: Z4 map render awaits mount (PHASE1-PLAN:165)
31902|3|The Two-Screenshot Test|MISSING|-|deferred: awaits real skin kits; harness unbuilt per PHASE1-PLAN:165
31913|2|8.11 Audio|PARTIAL|28f638e|bus graph + façade + pack law shipped; zero samples and nothing mounted
31918|3|The three-bus rule|DONE|28f638e|busGraph AUDIO_BUSES ambience/signals/score + duckUnderSignals + signals-never-ducks triply enforced
31931|3|The datacenter hum|PARTIAL|28f638e|HUM_VOICE_TELEMETRY five-voice binding is a parse wall; no samples exist to play
31945|3|The fan-row unison ramp|MISSING|-|deferred: audio/README gap ledger — no samples shipped
31954|3|The silence of power loss|MISSING|-|deferred: same audio samples gap
31961|3|Fan spin-up and thermal audio|MISSING|-|deferred: same audio samples gap
31965|3|The drive click of death|MISSING|-|deferred: drive-io voice slot bound in pack schema only
31973|3|The beep|MISSING|-|deferred: same audio samples gap
31978|3|The breaker snap|MISSING|-|deferred: same audio samples gap
31982|3|The relay clack and the genset|MISSING|-|deferred: same audio samples gap
31987|3|Drive seek chatter|MISSING|-|deferred: same audio samples gap
31991|3|Pager tones and severity|MISSING|-|deferred: same audio samples gap
31998|3|The noise problem|MISSING|-|deferred: mechanic needs staff audio masking, neither exists
32006|3|The cash register rhythm|MISSING|-|deferred: same audio samples gap
32015|3|Threat audio signatures|MISSING|-|deferred: same audio samples gap
32024|3|Per-line sound palettes|PARTIAL|28f638e|hh-audio-pack ambientSampleSet + REQUIRED alertBandReservationHz band-budget; zero packs on disk
32035|3|The other named sounds|MISSING|-|deferred: same audio samples gap
32041|3|Audio as visual redundancy, and visual as audio redundancy|MISSING|-|deferred: Hum Bar/visual EQ/caption counterparts unbuilt
32053|2|8.12 Presentation moments and the effects catalogue|PARTIAL|c503d2d|post-chain plumbing + alert moments exist; FX catalogue unbuilt
32055|3|The Cold Open|MISSING|-|deferred: awaits iso scene mount (PHASE1-PLAN:165)
32064|3|The Wave Telegraph|PARTIAL|47b2c33|telegraphed field + waves/bands.ts TELEGRAPH_BANDS ratified (24dfcfe); no dread-beat rendering
32071|3|The Save|MISSING|-|unlisted: trigger law (<8% + 6s action) has no detector
32082|3|The 100% Uptime Stamp|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32090|3|The Night Shot|MISSING|-|deferred: ADR-0001 Cinema module post-launch
32096|3|Loading screens as rack diagrams|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32105|3|The Credits Rack|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32109|3|Transition wipes by meaning|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32115|3|The juice moments worth budgeting for|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32124|3|The particle vocabulary|PARTIAL|4ff4a4f|SmokeField motes (render/g1/smokeField.ts) are one of the twelve named systems
32132|3|The FX catalogue|MISSING|-|unlisted: zero FX_ symbols anywhere in the repo
32170|2|8.13 Animation and motion language|PARTIAL|4ff4a4f|heartbeat motion rides g1Scene + post grain; rest of language unbuilt
32175|3|The Breathing LED|PARTIAL|4ff4a4f|g1Scene mote alpha rides heartbeatPulse with fixed per-unit phase (id%8/8); rack LEDs not drawn
32186|3|Fan Blur Ramp|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32191|3|Idle Fidgets|MISSING|-|deferred: staff sprites/people out of Phase-1 content
32200|3|The Anticipation Budget|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32207|3|Screen Shake Budget|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32214|3|The Flash Language|PARTIAL|4ff4a4f|eventFx budget + amber-403 flash noted in g1Scene docblock; three-meaning grammar absent
32222|3|Motion identity beats colour identity|NA|-|design principle; its density/rhythm knobs ride waves and are audited above
32229|3|The de-escalation language|MISSING|-|unlisted: full entry lives in §8.7 (g22 range)
32233|3|Animation as the explanation|NA|-|editorial house rule with no direct implementation surface
32242|2|8.14 Accessibility, colour-blind safety, and redundant encoding|PARTIAL|1e6b306|two-channel law real in chips/pips/hue ledger; audit modes unbuilt
32247|3|The Two-Channel Law, enforced|PARTIAL|faf81a7|12 distinct StatusChip notches + Shape-First pips; greyscale sign-off gate not built (PHASE1-PLAN:165)
32255|3|Contrast Audit Mode|MISSING|-|deferred: PHASE1-PLAN:165 greyscale dumps explicitly "not" shipped
32260|3|Three colour-blind palettes, named|MISSING|-|unlisted: no deuteranopia/tritanopia/mono palette exists
32272|3|Colour-blind-safe money|MISSING|-|unlisted: money is $-text via numberLaw without shape channel
32277|3|The Strobe Budget|MISSING|-|deferred: PHASE1-PLAN:165 strobe clamp explicitly "not" shipped
32287|3|Reduced Motion mode|PARTIAL|faf81a7|prefers-reduced-motion CSS in AlertStack/BezelHud/PanicLayout; no global mode or translation table
32297|3|The Hum Bar|MISSING|-|deferred: audio/README gap ledger (spec lives in §8.8 too)
32301|3|The visual EQ strip|MISSING|-|deferred: five voices bound in packs.ts but no visual strip
32306|3|Diagnostic audio captions, with location|MISSING|-|deferred: captions unbuilt; sim already knows positions
32316|3|Readout Mode|DONE|faf81a7|InstrumentBezel swaps diegetic face for formatReadout numbers; Drawer toggle (registry.ts)
32321|3|UI scale and the collapse behaviours|PARTIAL|faf81a7|data-collapse chips + panic dim shipped; no 200% UI-scale pass or stated collapse matrix
32326|3|The full accessibility affordance list|PROBLEM|1e6b306|plan promised a11y CI harness "from day one"; PHASE1-PLAN:165 admits only Shape-First+Readout shipped
32337|3|The mimic exemption, written down|PARTIAL|c503d2d|both channels live (violet pre-classification hue + confidence-blur post kind); exemption text not in repo docs
32346|2|8.15 Typography, numbers, and iconography|PARTIAL|faf81a7|Number Law + Status Chips done; type families and icon tiers partial
32351|3|The Type System|PARTIAL|4ff4a4f|--hh-typeface swaps the Chrome face per era; Signage/Doc/Marker families absent
32366|3|Era display faces|PROBLEM|4ff4a4f|only 2 era faces via era tokens; same owner-gated era grid (MODULE-STATUS era row)
32374|3|The Number Law|DONE|faf81a7|numberLaw.ts: tabular fields, no $ abbrev under 10k, percent-decimal rule, ms-only, nines+minutes
32390|3|The Big Number Rule|DONE|faf81a7|panic.ts bigNumberDecision moves the one large number (cash→incident cost)
32396|3|Three icon tiers|PARTIAL|faf81a7|StatusChip SVG notch glyphs (Tier-B-ish) + g3 pips 4-6px (Tier-C); Tier-A world glyphs absent
32403|3|The icon family rules|PARTIAL|faf81a7|notch vocabulary reuses chevron/wrench/seal/clock primitives; composition law unenforced
32414|3|Status Chips|DONE|faf81a7|statusChip.ts exactly the 12-word vocabulary + per-state notch + off-vocab UNVERIFIED
32419|3|The Label Plate Aesthetic|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32424|3|The Player Company Mark Generator|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32442|3|The Company Letterhead|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32449|2|8.16 The production asset spec, acceptance tests, and style guide|PARTIAL|b3a149d|kit/manifest authoring wall shipped; gates and roster unbuilt
32454|3|The LOD Contract — every entity declares five things|PARTIAL|b3a149d|camera declares LOD contract; assetpack five-asset parse wall; no per-entity 5-part tooling
32468|3|The Silhouette Sheet (production gate)|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32478|3|The silhouette-first authoring test|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32487|3|The Salience Score|PARTIAL|faf81a7|salience-lite shipped: urgency×consequence ribbon enlargement + KLAXON>=90 preemption (budget.ts:251)
32496|3|The Zoom Budget|PARTIAL|27f2856|label cap + BUDGET_CAPS + motionBudget per LOD + substrate 1200-quad cap; not the Z0-Z5 entity counts
32505|3|The acceptance-test roster|PROBLEM|40a036e|1 of 11 gates (Chroma Meter) shipped; PHASE1-PLAN:165 records the harness as partial
32522|3|The one-page style guide|PARTIAL|e33e5e7|laws distributed in docs/CONVENTIONS+ADR; the one-page wall card artifact does not exist
32557|2|8.17 Photo mode, key art, and shareable artifacts|MISSING|-|deferred: ADR-0001 Cinema-module clause keeps the camera tool post-launch
32563|3|Photo Mode|MISSING|-|deferred: ADR-0001 cinema deferred clause (no free camera in engine)
32573|3|Key Art Direction|PARTIAL|95b5e35|media/prompts identity + docs-hero collections author the shot in concept; in-engine art unbuilt
32581|3|The Money Shot|MISSING|-|deferred: ADR-0001 names the money-shot as Cinema-module scope
32589|3|The Rack Portrait|MISSING|-|deferred: needs §8.4 auto-elevations + cinema tool, neither shipped
32594|3|The Before/After Slider|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32598|3|The Incident Poster|MISSING|-|unlisted: replay/polaroid inputs exist in sim-core, composer does not
32612|3|The Screenshot Watermark and the share frame|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32618|3|The scrapbook wall|MISSING|-|unlisted: no matching symbol or gap row anywhere in repo
32625|2|8.18 The visual-coverage audit — systems that had no picture|NA|-|meta-audit of the spec document itself; no code surface assigned
32631|3|The audit finding|NA|-|table records where spec-side gaps were filled in other sections
32642|3|The hand-wave detector|MISSING|-|unlisted: no tool scans the corpus for hand-wave phrases
32652|3|The systems still thin, flagged for wave 3|NA|-|spec gap register; none of the nine named instruments gained a code surface either

## SUMMARY
DONE: 14
PARTIAL: 58
PROBLEM: 6
MISSING: 106
NA: 5
TOTAL: 189 (11 `##` + 178 `###`; disk count — the dispatch brief's "198 ###" is wrong, outline.md agrees with disk)

## TOP-PROBLEMS
1. **8.14 accessibility over-promise (PROBLEM, 32326/32505):** docs/CONVENTIONS.md and PHASE1-PLAN claim the a11y/acceptance harness "runs in CI from day one"; PHASE1-PLAN:165 itself now admits only Shape-First pips + Readout Mode shipped — Contrast Audit, greyscale dumps, strobe clamp, three CB palettes and the full 11-gate roster are unbuilt. Docs-to-reality gap worth a sweep.
2. **8.10 era grid is owner-blocked and docs disagree (31810/31837/32366):** era-tokens.css ships exactly 2 skins (1998/2026) against a spec corpus assuming 5–6 eras; MODULE-STATUS carries the era-count-mismatch row awaiting owner ratification. The 4-token mechanism itself is DONE.
3. **8.11 audio is law-complete but sound-empty (31931–32041):** the three-bus graph, ducking law and hh-audio-pack band budget shipped at 28f638e, yet zero samples, zero audio-pack JSONs on disk, and nothing mounts — 15 of 17 audio headings are MISSING behind the seam.
4. **8.12/8.13 effects and motion language barely started:** the 24-entry FX catalogue has zero FX_ symbols anywhere, particle vocabulary is SmokeField only, and Save/Cold Open/shake/anticipation grammars are unbuilt — the moment-layer depends on the same unmounted iso-scene render (PHASE1-PLAN:165).
5. **8.8 business-HUD cluster is a single-gate demo:** MRR waterfall, cash calendar, concentration donut, cohort wall, contract Gantt, inspector faceplate and Site Preview have no code; what exists (renewal strip, invoice tape, SLA budget) lives inside the G5 gate rather than the shell.
6. **8.9 readability targets unfalsifiable (31543):** the 2,000-object/20,000-entity Z3 figure is OD-10/OD-12 unratified and the perf grid tops out at 200-node boards, so the headline spec number cannot currently be proven or disproven.
