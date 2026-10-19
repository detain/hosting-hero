# DECISIONS PENDING — Open-Decisions Register (OD-1 … OD-25)

> **2026-10-09 calibration session:** most rows below are now **DECIDED** — the
> canonical record is `docs/adr/0009-owner-ratifications-calibration.md`
> (ADR-0009, `ea7acee`); execution landed on the calibration wave (tip `779dea9`,
> SHAs cited per row). History is preserved in place: options, contexts, and
> blocks stay as the record of what was asked.
> **Legend extension:** **DECIDED** = owner ratified 2026-10-09 (execution SHA
> cited); **RECORDED** = decided, implementation deliberately deferred to a
> later lane (record-only, `ea7acee`).
>
> **2026-10-09b session-2 rulings:** OD-14, OD-16, OD-21, OD-22, OD-23, OD-24,
> OD-25 are now **DECIDED 2026-10-09b** (owner rulings; ADR-0010 **Accepted** with
> (a)=(i)/(b)=(i) — canonical record `docs/adr/0010-taxonomy-and-stacking-contradictions.md`;
> dispositions mirrored in `reports/audit/SUMMARY.md` PROBLEMS + `hosting_game.md`
> law-notes). Where code has not yet landed the execution status reads
> **design/build lane queued**. OD-7/9/10/11/12/15/17/18/19/20 and the taste-row
> pile stay **OPEN untouched** — ratify-on-playtest posture stands.
>
> **2026-10-14 session-3 rulings (adopt-all):** owner ruling, verbatim — "go with
> recomendations for alll those and keep drving this to compoletion when its all done
> include coop and all that and really drive it all the way you can". Every
> orchestrator recommendation in the session-3 decision brief is ADOPTED. All rows
> that session-2 left OPEN (OD-7, OD-9, OD-10, OD-11, OD-12, OD-15, OD-17, OD-18,
> OD-19, OD-20) are **DECIDED 2026-10-14**; the ratify-on-read pile is
> **confirmed-provisional** (it keeps returning on the playtest lever by owner
> blessing); per-verb attention cost is promoted OUT of ratify-on-read to a decided
> default; canSettle stays host-forwarded (no economy veto); verb-exhaustion extends
> within ADR-0005 without amendment. Canonical record
> `docs/adr/0013-owner-rulings-session-3.md`; build lanes queued per its Consequences.
> History clause style preserved: original option text stays as the record of what
> was asked.
>
> **2026-10-16 session-4 rulings (ADR-0014):** owner ruling, verbatim — "go w/
> recomendations for d1, d2, d3, d6, d9  for D4: a, D5: a and defer d, D7: a, d8:
> queue the endless save slice,". Nine rulings D1–D9 encoded in
> `docs/adr/0014-owner-rulings-session-4.md`: the verb roster is AMENDED
> (`negotiate` + `schedule` join the tier set; Diagnose blessable per-card;
> MERGE stays forbidden — D1), tier verbs become real `PlayerVerb` door verbs
> Shield-first (D2), readability is now a RELATIVE law with the 2k/20k figures
> demoted to aspiration (D3), every named session-3 confirmed-provisional
> constant set is **FULLY RATIFIED** — death, elasticity, recovery, attention
> costs, oversell 8:1, familyWeights — plus grandfather-WINS billing order as
> LAW (D4, superseding the ratify-on-playtest posture for those sets), `PackId`
> widens to all nine type packs with the flavour re-roll accepted and the
> contextual slot-filler deferred (D5), a co-op Node relay SPIKE is authorized
> in-repo without reopening OD-5(b) (D6), additive `boot.build?` lands (D7), the
> **endless-32 save rows are QUEUED FOR LIVE** (D8 — the contested posture ends),
> and `metricNamespaceTier` is queued into the next loader lane (D9). Build
> lanes per the ADR's Consequences; decisions+queues encoded here, nothing
> built by this pass.
>
> **2026-10-16 session-5 rulings (agenda (a)–(f)), executed as ADR-0014
> amendments:** (a) the endless save posture is **RE-RAISED to campaign-mirror
> FULL-CARRY** @`c9e34c7` — the fresh-owner-ruling condition #D8's landing
> recorded is met; the ledger-four interim stands in the record (it governed
> ~1 day; it survives today for the ADR-0009 cohort's 112 deny rows); the
> endless LOOP/tier scoping stays DEFERRED per OD-16(a). (b) the eleventh card
> question is answered — type-11 `official:backup-archival` "Restore Point"
> ships on **Schedule** @`6c0e074`; the #D1 blessing pair (Negotiate +
> Schedule) is now FULLY SPENT, Diagnose remains the sole unclaimed invariant,
> and a twelfth card is a fresh owner law call. (c) **NO tier-verb door
> mechanics authorized** — Scale/Maintain/Sell/Negotiate/Schedule stay
> card-identity-only (Shield @`d3b1db3` remains the only built door leg). (d)
> `MetricNamespaceTier` **KEPT PRIVATE** (off-barrel, api-verify-blind). (e) the
> ADR-0014 #D6 relay frictions are **resolved in-repo as save/relay law**
> @`500c134`+@`6d0bc1e` (same-tick joins canonical-ordered, re-join-as-new-row,
> joiner catch-up relay-side, MIN_WRITERS ratified); PHP/Workerman transport +
> wire mechanics stay open. (f) **OD-7 / OD-9 / OD-15 + the OD-11
> Consultant/Bootstrapped mirror detail are CONFIRMED CLOSED** per their
> ADR-0013 rulings — no reopening.
>
> **2026-10-16 session-6 rulings (wave-20 program), executed as ADR-0015 #1–#4:** the owner
> answered the standing law-call with "do them all" — (agenda) **extend the verb roster with a
> new verb, build the door mechanics, land the relay wire-mechanics in-repo, ratify the
> numerics without waiting for playtest.** #1 RATIFIES the remaining PROVISIONAL taste-numerics
> set — 73 label sites swept @`4c6f827` (economy config pile incl. `maxAttributableChanges`,
> recovery observers, unattended thresholds, tickFold/corruption twins, proto scenario numerics,
> lab legends); the `PROVISIONAL-B` wire stamps, versus-deck design laws, and the readability
> ABSOLUTE numerics are the recorded NOT-in-set ledger. #2 AUTHORIZES real door mechanics for
> the five tier-extension verbs — Scale @`8037a4f`, Maintain+Schedule @`5987ef1`, Sell
> @`a760771`, Negotiate @`b70900e` — superseding session-5 agenda item (c) one day after it
> ruled. #3 EXTENDS the roster with **Isolate** @`7f47563` (grounded VERBATIM in the §1.3 DBaaS
> "isolate and throttle" card and the §7.16 Act row) and the twelfth type `official:dbaas`
> claims it — the door verb `isolate-node` (16th) landed WITH its step-5 admission-block fence
> consumer the same wave @`86cff89`; Diagnose stays the sole unclaimed invariant and a
> thirteenth card is a fresh owner law call. #4 LANDED the four relay wire-mechanics R1–R4
> in-repo @`5b0d401` (relay 27→42 tests); the PHP/Workerman transport leg stays out-of-repo.
>
> **2026-10-17 session-7 rulings (wave-21 program), executed as ADR-0016 #1–#10:** the owner answered
> the wave-20 fresh-ask register with "keep going with all of this, go with recommendations, MAX
> feature" across all five standing threads. **The thirteenth card:** ADR-0014 #D1(i)'s Diagnose bless
> is spent — `official:observability` "Who Watches" / "Cardinality" @`9e9f377`, the invariant six
> untouched (prose-implication bless, owner authoring-time confirm); **the roster is EXHAUSTED** — 6
> invariant + 7 extended verbs all claimed, the FOURTEENTH card is a fresh OWNER LAW CALL. **Negotiate
> depth:** mechanics A+B+C — relationship ledger @`5e8ce75` (per-tenant trust, table-first materialization,
> R9 double-charge IS the law), warmth COST @`1efe12a` ($25/slot-mo month-cursor host seam), sell ACCEPTANCE
> DICE @`24f90bc` (step 5.5, never-certain ceiling 9_500 two-domain law) — all three supersede the wave-20
> fresh asks one day after they were raised. **Versus design laws:** RESOLVED max-feature (superseding the
> ADR-0015 #1 NOT-in-set exclusion) — decisions 1–6 @`0ae760b`+`eb4b86a`: costBps split, affixes LIVE
> (16-slug table, slug-12 data-only), pool-band = draftable-pool reading with `POOL_BAND_NARROW` advisory,
> tie law `pickDecisiveWave` ratified, unattributed mint-tick floor KEPT grammar-forced (cross-lane driver
> attribution ticket opened), three-tag key-space pin. **Transport:** in-repo as far as it goes @`0da14b8`
> (`tools/transport` 84 tests, `hh-coop-transport@1`, client idempotence, replica witness, conformance
> harness) — the PHP/Workerman PRODUCTION carrier plugs into `TransportPort` and passes the conformance
> run. **Successors:** `throttle-node` (17th) @`81b0589` capacity-as-CLAMP and `restart-node` (18th)
> @`fd91138` bounded-fence+queue-flush — the §7.16 Act-row ALL-FOUR live, refusal census 46 MACHINE-PINNED;
> kill-in-flight DEFERRED (wedge-state). **Residues:** wire stamps RE-AUTHORED `RATIFIED-B` @`caa4d17`
> (39 sites; validator tolerance law; waves/registry `PROVISIONAL-B` residue stays honestly tagged per
> ruling) and copy-voice RATIFIED @`18c3f6a`. **#10 opens the NEW PROVISIONAL register** — sell 5 numerics,
> warmth rate, relationship 11 deltas, transport taste rows, throttle/restart occupancy 1/1 —
> ratify-on-playtest class, awaiting G1 playtests.
>
> **2026-10-17 session-8 rulings (wave-22 program), executed as ADR-0017 #1–#5 + ADR-0016 #11:** the owner
> answered the wave-21 fresh-ask register (eleven items) with "go with recommendations on each of those …
> max feature/functionality". **Fourteenth card:** the law call ANSWERED via the ROSTER route again —
> `reclaim` joins `TIER_EXTENDED_VERBS` as the EIGHTH extended verb (fifth amendment @`ff8615c`), grounded
> VERBATIM in the third word of the §1.4 CI/build-farm card's own verb line; type-14
> `official:ci-build-farm` "Green Light" / "Untrusted Code, By Design" @`a47a9b5` — the FIRST §1.4-founded
> card (§0.3/§6.6 row absences RECORDED, never forged) and the first DOOR-BEFORE-CARD landing (`reclaim-node`
> spine @`c8b92a2` predates its card). `expire` is ruled OFF-roster expressly — the read-time expiry law
> already auto-lapses bookings, a verb would double-name a mechanic. **The roster stands at 6 invariant +
> 8 extended, ALL claimed; the FIFTEENTH card is a fresh OWNER LAW CALL.** **Transport ADOPTED** (ADR-0017
> #4): browser seat client @`96bd238` + `tools/host` thin dev carrier @`af55b61` — the portable-lib
> topology (b) holds: the hub RELAYS only, seats run local converging sims, real latency enters only as
> hub-acceptance ticks; the PRODUCTION PHP/Workerman carrier stays out-of-repo. **Attribution** (ADR-0017
> #5): the driver re-mint ticket CLOSED with `reentry` events @`cbf53a4` — zero state bytes, every digest
> immune by construction, the versus unattributed floor collapsed to ZERO. **Coverage affix leg**
> (ADR-0017 #2): §2.13's second leg BUILT @`2b63795` (five grid-column nullifications, eleven honest
> nulls, drift-pinned versus mirror). **Split ratify:** the game-balance half of the #10 register is
> RATIFIED as ADR-0016 #11 @`e2a1bba` (49 flips); transport caps + the PROVISIONAL-B-style residue STAND;
> wave-22 additions (reclaim occupancy/hand 1/1, restart window 5, lift-at-boundary ergonomics) JOIN the
> register. **HUD:** the §7.16 Act row is player-facing in the prototype @`a28e764` (canvas inspector still
> open). **Data hygiene:** the L-PW riders found the first pack-ambiguous flavour key —
> `intern.entry.firstday` shipped slot-free in BOTH observability and ci-build-farm with divergent texts —
> CURED @`c317efd` by renaming the ci key to `intern.entry.board` (values byte-ident); every slot-free twin
> is byte-ident across all fourteen packs and the divergent-set pin flipped to falsifiable empty.
>
> **2026-10-18 session-8 follow-on rulings (wave-23 program), executed as ADR-0017 #6–#8:** the owner answered the wave-22 residual agenda by letter. **1a — the TYPE PROGRAM CEASES at fourteen:** roster exhaustion stays LAW but the fifteenth-card ask is CLOSED BY STOP; no fifteenth lanes are commissioned; depth-work (eras/campaign/adoption) is the standing direction. **2a — chrome adoption** @`945fba6`: HUD-LAB + COOP ride the rail as NON-gate stages (the six §9.13 gates stay six), the §7.16 Act row mounts on the G4 board through the real door; review F-1 (barrel unmounted) DISCHARGED; build ledger independently RE-MEASURED (worker hash-identical 900.25 kB; index +163.34 kB entry-side = the intended cost; fakeWorker 544.10; proto 100f/1,121). **3b — topology (a) CLOSED IN-REPO** @`61efe31` (ADR-0017 #7): `publish()` seat-state re-fan (laws inherited, timer-free, idempotent) + `tools/host --sim` host-owned engine with per-seat fog; topology (b) default byte-ident; production PHP/Workerman UNCHANGED; browser view-rider thin client NAMED-owed. **4a — game-feel ratify** @`f6f1d4b`: the register's game-feel half flips to `RATIFIED 2026-10-17 (ADR-0017 #6)` (30 source sites/7 files, values byte-zero, 4 test literals). **6b — pack-JSON prose STANDS:** `_todo`/provenance texts are provenance DEBTS, not lying labels; copy-voice scope unchanged.

> **2026-10-18 session-9 rulings (wave-24 depth program), executed as ADR-0018 programs 1a–1d:** the owner ruled by letter — verbatim "1c 1d 1b 1a" = commission Gate-7 / MP production path / campaign v0 / era canon. **1a — ERA QUAD-CANON BLESSED** {1998,2008,2016,2026}: OD-22(c) four skin-token sets SHIPPED @`9018305` (added blocks AA-passed; `ERA_YEARS` closed + `nextEra` wrap), anchor bundles quad-era-ized @`529dc91`, fans C–F made ALL FOURTEEN packs speak four eras @`8ef4f6b`/`7aedcfc`/`6d06176`/`7766eee` under the 2026≡fallback law, collector census probe-derived @`949ebd1` (42 era keys / 29 pool / 18 flip / 976 roster frozen). Mechanics-on-era stays UNCOMMISSIONED (design program — fresh ask); R66 bundle-dating stays owner input. **1b — CAMPAIGN v0 + PERSPECTIVES** @`e1ada9d`+`9a4d796`+`5d0577b`: `save/settle.ts` 32-facet settlement executor WRITER-OWNED (the campaign chain is its only caller); `src/campaign/` LINEAR chains — branching deferred by ruling (Prologue 3 + Act I 8, BARREL-LESS; Act-I ledger 8/8 win-as-authored); §1.2 perspectives v0 composed from EXISTING door seams ONLY — the 14-verb `canExecute` ceiling NAMED as the owner wall (fresh ask). **1c — GATE 7 COMMISSIONED** as the SEVENTH prototype gate (dated rider on ADR-0017 #8's stay-SIX line): rules-pay-hands RATIFIED per §7.12/ADR-0009 4d; engine @`7bc1b9d` — opt-in `IntentDoorConfig.ruleCarriers: "mapped"`, SIX-of-ten translation, DEFAULT-off byte-identity, refusal census 46 UNPAID; panel @`0e41e64` + typing rider @`b750945`. Panel ghost-hues #b49ce8/#9aa7b8 NOT ratified (review F-4 — fresh ask). **1d — MP PRODUCTION PATH** @`b830aee`+`2b0a882`+`5e87477`: `tools/transport/CARRIER-CONTRACT.md` = THE PHP/Workerman obligation doc (~700 ln, two conformance rungs); dev-grade auth LANDED (opt-in token `?query` 1008 refusal DEFAULT-OFF; auto-leave-on-disconnect DEFAULT-ON ratified as bug-cure; SaveError-through-drain verdict-split: double-open THROWS, not a fault frame); browser thin-client view-rider PAID. The fifteenth-card STOP (session-8 ruling 1a) STANDS — wave-24 moved ZERO type markers.
>
> **2026-10-18 session-9 SECOND ruling (wave-25 full-power program), executed as ADR-0019 programs 1–8:** the owner answered the eight-item wave-24 register verbatim — "go with recomendations" = ALL eight per recommendation. **P1 — the `canExecute` door hook is BUILT** @`a828379` (general verb gate after carrier resolution, before payment; refusal = state identity; host reason verbatim) **and perspectives ride it to FULL POWER the same wave** @`817c82c` (all 19 verbs bannable; the v0 tape machinery deleted; the five-seat roster spec-complete; `perspective-forbids` stays a HOST string — the 46-census rode UNPAID). **P2 — the `composeSignalRows` guard ticket is CURED AT THE CAUSE** @`075a840` (the step-8.5 mirror cash leg bypassed both insolvency guards; refuse-not-overdraft, the opex law reused verbatim; `chargebackFeeRefusals` rides reports SPARSE) **and adopted LIVE** by Act II's `b-7` re-home. **P3 — CAMPAIGN ACT II is COMMISSIONED and authored** @`e060e97` as the 7-of-12 PROPORTIONAL slice: the FIRST authored company DEATH in-run (`b-4` dies on the real ledger @73; falsifier survives on a 600 Mµ$ bridge) and SUCCESSION LIVE on the settlement executor; `b-6` seats the full-power perspective in campaign; permanent walls RECORDED (covenant/review-bomb can't-die-on-wire; change-freeze/threshold-day UNDEAD-WINS). **P4 — the era-mechanics PILOT runs** @`22717d2`: typed `eras.availability` windows (row → bundle-date → undocumented-allowed), the run-frozen verdict as the OUTERMOST door veto (carrier-asymmetry vs perspective law ARGUED: world-fact vs seat-law), `eraYearAt` the NAMED transitions seam, wire #31 the probe. The remaining era legs (threats/costs/customers/lattice) stay UNCOMMISSIONED. **P5 — GATE 7 rides the MAINLINE runner** @`9748ee4`: opt-in `rules` seam, PROTOCOL v1 untouched, off-path byte-stand pinned, production UN-ARMED by decision. **P6 — the hue/ratify batch lands** @`7fed0c4`: `rule-ink` ledgered (16), G7 plate AA-cured (`#9aa7b8` retired there; the 0.62 ghost-dip fixed), `DECISION_*` RATIFIED. **P7 — the CARRIER-CONTRACT trace is EXECUTABLE** @`df05b7c`: the §4.1 witness replays through the real hub every run (the doc is the fixture; falsifiability proven by three reverted mutations). **P8 — bundle dating is QUOTE-ONLY** @`f5faced`: exactly ONE date landed (colo 2001); the 2009-vs-2003 shared-web divergence RECORDED-not-resolved. Review: joint PROCEED 9/9 PASS. Incident #6 (program record): an external process pushed the whole chain `7c2a13e`→`22717d2` mid-review — ff-valid, our content; ADR-0019 is the program's first record authored POST-push. Zero pre-existing digest goldens moved; hosting_game markers MOVED ZERO (all ten riders are body text; census ✅321 🔧1,012 ⚠️0 ❌2,226 📝30). **The live register is now SIX fresh asks (below); the fifteenth-card STOP (session-8 1a) STANDS.**
> 
> **2026-10-18 session-9 SECOND rider (wave-26 depth chain), executed as ADR-0019's
> wave-26 rider section:** the owner's standing word — verbatim **"go with
> recomendations , keep driving to completion"** — rode six lanes atop `0c2549e`:
> plate unify `d197917` · boot.rules `9653a96` · era TRANSITIONS `58fddc3` ·
> endings v0 `61a1c3b` · sell-verdict predicates `c6b69a4` · Act III `5e9be02`.
> Battery: sim-core serial 186f/3,551 · proto 110f/1,263 · api-verify PASS 1,756 ·
> canary 151 · ZERO pre-existing goldens moved; joint review PROCEED (zero
> critical/major). Two review minors cured in the closeout (the
> `POLICY_THRESHOLD_KIND_WIRE_IDS` drift pin — protocol's seven-table docblock is
> now machine-TRUE — and the `ENDING_KINDS` roster-order-vs-precedence comment);
> the wave-25 six-ask register is ANSWERED (three CLOSED, three STAND); the live
> register is the wave-26 section below.
>
> **2026-10-18 session-10 rider (wave-27 depth chain), executed as ADR-0019's
> wave-27 rider section:** the owner's standing word — verbatim **"go with
> recomendations , keep driving to completion"** — drove wave-27 too: the
> wave-26 closeout's four drivables, all CLOSED without check-ins. Carrier-trace
> repro script `db64667` (the §4.1 trace replays OUTSIDE vitest; the fence is the
> fixture; transport vitest surface 100/8 UNCHANGED) · BootRules envelope
> symmetry `a757f6c` (wave-26 minor #1 CLOSED; POSTED JSON byte-identical, boot
> goldens BYTE-STAND) · sellMarketRates host legs `adc8b64` (wave-26 minor #4
> CLOSED as commissioned; config-only — NO boot field, NO doc field; c-7
> deliberately catalog-less) · Act II at TWELVE beats `b6187c4` (V2: the tour's
> FIRST perspective reuse — noc-shift seats a second time; seats
> {4,10,16,21,26,31} gaps {6,6,5,5,5}, every act at §1.9's per-act floor of two
> — the standing seat-floor tension RESOLVED, not recorded). Battery: sim-core
> serial 187f/3,567 · proto 111f/1,272 · api-verify PASS 1,756 (ZERO export
> delta) · canary 151 · ZERO pre-existing goldens moved (campaign self-derived
> trio disclosed). Joint review PROCEED (zero critical/major); review F6+F3
> cured comment-only at `b0c2571`. The wave-26 register's two build-asks are
> CLOSED; the live register is the wave-27 section below.
> **2026-10-19 session-10b ruling (wave-28: money-at-the-end + content-decks + hygiene), executed as a dated rider inside ADR-0019:** the owner ratified the whole wave-27 recommendation set — "RATIFIED ALL RECOMMENDATIONS — WAVE-28 opens." **MONEY-AT-THE-END BUILT as ONE program:** @`980ab58` `economy/valuation.ts` pure leaf (the seven §1.6 kinds in doc order, 10-18× revenue bands hg:24372-24382, the WARCT leg UN-FROZEN from the wave-27 defer, `exitCashSliceMicroUsd` = headline × Π(diligence) clamped [floor,headline] THEN the exit-kind factor — wind-down EXACT 0 — twenty PROVISIONAL consts machine-pinned 20/0, zero-rolls, fold twin `4cf033f0e8d27621` reproduced cross-tree by the reviewer) · @`ce2ec1c` the campaign/scenario bridge (`CAMPAIGN_EXIT_KINDS` seven drift-pinned; ipo/management-buyout/wind-down RESERVED — refused at parse; `endCampaign` 3rd optional arg, 2-arg byte-stand; `report.exitPayout` SPARSE engine-truth: headline = Σ ACCEPTED PERSISTED verdicts — the 30M-not-120M law — TRUST ledger not consulted) · @`2c69d77` chain exit-edges (heir plays ON with manifest `cashSlice`; `failureOnlyUnlock` forced null) **with one LAW CHANGE on record**: the `exitFunded` carry — a PAID-exit heir opens on PROCEEDS, not the 300M bridge; §2.5's "failure is poorer, not paid" reverse-honored, falsified BOTH directions — **and one self-superseding amendment inside the wave (§E)**: the V2 `BAD_RANGE` position wall → the V3 per-declaring-chapter `DOC_LIE` walk (post-timeline timeout now THROWS; the early-halt silent-hole closed; reviewer: stricter where it matters, only the false-negative position proxy loosened). **G7 CONTENT-DECKS BUILT as a four-lane program:** schema + validate.mjs deck leg @`a498a49` (21/21 probes; interpreter caps recorded honestly — minItems/maxItems work, boolean `additionalProperties` does NOT, enums strings-only) · `loader/decks.ts` + `deckCardHash` `hh-deck-card-hash-v1` wire-form-IDENTICAL to the boot.rules fold @`2cdf014` (4-way vocab drift pin types↔loader↔schema↔protocol, live-mutation-verified by the reviewer) · THREE decks / 14 cards @`9948681` (watch-the-door = the g7Deck six re-targeted BUSY 40960→16384; cold-aisle five all-advisory; sleepless authors the panic-failover WALL card as content; HONESTY LAWS shipped: `queueDepth` excluded — JS-number publish would fire a lie, `company::mrrMicroUsd` omitted-not-faked, lane-cell crossings INFERRED with per-card `_todo`, upkeep `0n` PROVISIONAL — **the upkeep BILLING fold is the NEW named owner wall**) · full-loop witness deck-JSON→boot→worker→ARMED MAINLINE @`34bb32e` (rule-fired f7 configure-node+communicate EXECUTED, shed-class pays hands, f22 failover refusal; DORMANT[0]==`ca8863849cb3db32` goldens byte-stand; cold-aisle zero door receipts + queue-etiquette never-fires falsifier). **HYGIENE CLOSED:** proto empty-map collapse @`7357b85` · repro synth-marker validation @`04c0d7e` (player untouched; digest `de1d4c0f941333eb` + 27 census UNMOVED) · tools/perf A/B MEASURED (worker 953.40→954.78 · index 1,671.91→1,673.67 · fakeWorker/CSS flat vs `db64667`; W28-03 NIT: end-state exact, not re-measured at final tip). **RATIFY-RECORDED:** noc-shift seat-reuse as a standing device (V1 honeymoon variant stays on record) · author-and-delegate · the relative era hexes · the playtest posture · the era-mechanics freeze. **DEFER-RECORDED:** boot.catalog · linear-branching (campaign stays LINEAR — RE-RATIFIED) · goal-card sugar until a HUD · corpus-in-campaign · canvas inspector · PHP carrier (Node-sidecar-only-if-MP) · in-flight-kill · slug-12 · render harness · deck-preview · c-7 STAYS catalog-less (never-certain census [4,0]×4+[3,1]@off2 survives as witness @`2c69d77`); sell-acceptance dice VERIFIED-SHIPPED @`24f90bc` (record, not new work). The fifteenth-card CEASE (ADR-0017 #8) RESTATED UNTOUCHED — zero types added. Battery: sim-core serial 192f/3,741 · proto 112f/1,291 · transport 100/8 + repro rc0 · relay 42 · host 36 · headless 53/5 parity HELD · api-verify PASS 1,785 (1,756+19+3+7 EXACT) · validate decks=3 WARN 16 413/16 · canary 153 · typecheck 8/8 · ci-verify 5/5. Joint review PROCEED zero critical/major; W28-01..03 NITs + W28-04 MINOR (the exitKindFactorBps ladder + slice-order join the ratify-on-playtest queue). The wave-27 register is dispositioned; the live register is the wave-28 section below.

**Source of truth:** `reports/MASTER_REPORT.md §6`. Citations: a bare `§N.M` = a section of `MASTER_REPORT.md`; source-doc headings are always written `hosting_game.md §x.y`.
**Rule for implementers:** none of these may be resolved silently in code. Each maps to a named config knob in `docs/PHASE1-PLAN.md` / `docs/CONVENTIONS.md §5`. **§0 legend:** OPEN = owner decision requested; PENDING = sub-decision created *by* a ratified decision, recommendation given, owner sign-off outstanding.

The **five primary items (OD-1 … OD-5)** led because they gated build order and scope — **all five DECIDED 2026-10-09.** Of OD-6 … OD-20: OD-6, OD-8, OD-13, OD-14, OD-16 decided/recorded (last two 2026-10-09b); the rest ~~stay OPEN (see the register)~~ **are DECIDED 2026-10-14 (session-3 adopt-all — ADR-0013; OD-8's endless-32 carve-out explicitly stays contested).** **Spec-audit additions (2026-10-09, from `reports/audit/SUMMARY.md`):** OD-21 … OD-25 opened below for owner-gated findings that had no OD row — **all five DECIDED 2026-10-09b (session-2 rulings)**; the OD-6/8/10/12/14/16 rows carry `(spec-audit: …)` annotations where the audit confirms an open gap.

---

## Primary owner decisions (§6.1)

### OD-1 — Scorecard: uptime-first vs conversion-first — **DECIDED 2026-10-09 (option c) — live at `24dfcfe`**
- **Decision.** **(c) commitment-convergence is ACTIVE** — availability is scored against the SLA **sold**, not a generic uptime target; the conversion-funnel axis is **displayed leading**; G5 keeps grading **both forks** over the same save as comparison data, but the active weight set is the C-set (`economy/scoring.ts` `defaultScorecardConfig.active = "commitment-convergence"`). ADR-0009 §3 rec #1.
- **One-line context.** The five-axis Quarterly Review grade needs a default weighting philosophy; `hosting_game.md §9.13` leans conversion-first **twice** ("the premise says you win by *letting the right things through*, not stopping things"), and a convergence candidate both camps accept is "score availability against *commitment*, not raw uptime." Raised independently by WS-1/WS-4/WS-6/WS-8.
- **Options.** (a) uptime-first; (b) conversion-first; (c) score against commitment (reconciliation). **(c) chosen.**
- **Blocks. (historical)** **The build order itself** — needed *before WS-1/WS-7 freeze their build order* (§6.1). Also WS-3 content budget (→OD-3), gate-G5 slice scoring (G5 runs both forks over one save), meta rewards (WS-6 L9–L12), and *which counter "wins" G1*.
- **Knob.** `scorecard.weights` = **"commitment-convergence" ACTIVE** (`24dfcfe`); `getActiveScorecard` throws only for configs explicitly passing `active: null` (fail-loud law kept).

### OD-2 — Canonical tuning sheet A / B / C — **DECIDED 2026-10-09 (Sheet B) — live at `24dfcfe`**
- **Decision.** **Sheet B canonical**; `waves/pressure.ts` `ACTIVE_TUNING_SHEET = "B"` with B `status:"RATIFIED"`. The month **stays 7 real-min** — `BUSINESS_SCALE_DEFAULT {43200n, 7n}` kept, the 4-min flip **DECLINED** (§7.13 doctrine wins over Sheet B's own row). Sheet A becomes a landlord-convention derivation later; Sheet C becomes realism-toggle data later — both keep honest `PROVISIONAL` tags. The ~40 economy PROVISIONAL value-constants await a later tuning pass (the SHEET question is settled; the values are not). ADR-0009 §3 rec #2.
- **One-line context.** Three tuning sheets coexist (A ≈ physics/queue curves, B ≈ service/price tables, C ≈ progression/economy pacing); the choice is not balance but **which constants are load-bearing law** — the "upkeep semantics" war is *schema-visible* and leaks into the type-bundle schema and the policy-card upkeep field. Full conflict table verbatim in report Appendix D.
- **Options. (historical)** (a)/(b)/(c) plus ride-along fixes that ship with whichever is picked: **month length** (hosting_game.md §7.13 ~7 real-min vs Sheet B's 4), **game-slot price** $3–15 vs $0.85, **backup-storage bands ~3× apart**, per-rule upkeep convention.
- **Blocks. (historical)** Gate-1/Gate-5 numeric acceptance thresholds (ρ-knee session design, sawtooth `P(n)` tables), Ruleset Card baseline fields, tuning-harness CI, WS-3 bundle defaults. G1 *starts* fine (bounce LUT is sheet-stable) but its feel calibration waits.
- **Knobs.** `tuning.sheet` = **"B" ACTIVE** (`24dfcfe`); `tuning.monthLengthRealMin` = **7 KEPT** (4-min declined; zero code change — shipped default was already correct). Content-side wire markers `"tuningSheet": "PROVISIONAL-B"` stay pre-ratification until the owner re-author sweep — see MODULE-STATUS gap row. **OD-2 RESIDUE CLOSED 2026-10-17 (ADR-0015 #1): the ~40-constant economy-taste pile and the unattended thresholds this tail tracked are RATIFIED @`4c6f827` (73 label sites); the `PROVISIONAL-B` wire stamps are EXPRESSLY NOT in the set — disk truth at closeout: 39 field sites across ALL 12 type bundles (not 4 sites/shared-web — the marker rode every bundle authored since) **RE-AUTHORED `RATIFIED-B` 2026-10-17 (ADR-0016 #1) @`caa4d17`** — validator `TUNING_RE` widened with the legacy PROVISIONAL arm kept VALID (tolerance law); the 27 waves-slice + 16 registry-core residue sites stay HONESTLY `PROVISIONAL-B` by ruling (the stamp law fences the bundle wire marker). Coverage-row taste, audio audition, and era expansion stay open; the NEW ratify-on-playtest register (ADR-0016 #10) opened alongside.**

### OD-3 — Content rebalance: ~200 threats vs ~45 visitors — **DECIDED 2026-10-09 (option a, owner override) — recorded `ea7acee`, no engine code**
- **Decision.** **(a) KEEP ~200 MECHANICAL THREATS** — the owner **overrode the fleet recommendation (c)**; the §9.6 pruning path toward ≈45 visitors is REJECTED. Consequences as binding law (ADR-0009 §2): fairness-validator scope grows to EVERY registry threat's counter (Second-Answer invariant, all-registry); §9.6 "every new threat creates a visitor/conversion reason" becomes the pacing-valve authoring law; Versus draft pools stay wide; art FX-pairing budget scales to ≈200. Content-plan consequence — zero engine flip in code, hence the record SHA is the ADR commit.
- **One-line context.** The doc's census carries ~200 threats against ~45 visitors (hosting_game.md §9.6 "threat mass vs service mass"); if the scorecard leads with conversion the funnel is under-supplied, if uptime then threat breadth outpaces counter-authoring.
- **Options. (historical)** (a) keep ~200; (b) prune toward parity; (c) **WS-3's third path** — threats survive only if *mechanically distinct* in the 12-step pipeline, else become **Codex-only** entries (real, citable, deposit-able, never spawned). **(a) chosen over WS-3's rec of (c).**
- **Blocks. (historical)** WS-3 content-production plan, WS-1 fairness-validator scope, Versus draft-pool design (R-4), Campaign scar table, art budget.
- **Knob.** `content.threatVisitorCensus` = **~200 mechanical threats (option a)**.

### OD-4 — Ratification batch (four pre-named items) — **RATIFIED 2026-10-09 — recorded `ea7acee` (ADR-0009 §1)**
- **One-line context.** Resolutions already drafted and defended in the fleet; the ask was *ratifying wording*. **Granted 2026-10-09**, with two honest coverage notes: the 4a engine slice and the 4b schema field are owed by FUTURE lanes, not this wave.
  - **4a. Triage Window + Attention Grace — RATIFIED, focus hand as BOUNDED LOAN.** The special focus hand is extended on window entry; **attention debt is repaid in the next window**; the loan is the ONLY hand-creation event and it is **ledgered**. The engine slice is a later design lane. *Historical residual:* Attention Grace's "free focus hand" was the only hand-creation event (violated hands-as-physics) → resolved as bounded loan, not suppression-only. Blocks (historical): WS-1 arrival/routing guards, WS-7 Panic Layout, WS-6 sawtooth trough depth, WS-8 slice A beats.
  - **4b. Telegraph bands — CANONICAL NOW; `metricNamespaceTier` ratified as a FUTURE bundle field.** The four-band law (Weather always visible / Storms telegraphed / Hunters symptom-only / Entropy "foresight is a purchase") is law and the shipped data already honors it (`waves/bands.ts`, loader `WAVE_BAND_VOCAB`, registry `bandsVocabulary`). **Honest ledger: the field does not exist on disk** — `type-bundle.schema.json` / `bundle.ts` carry zero occurrences and the parser rejects unknown keys, so the schema+loader lane that adds it is OWED by this ratification. *Historical residual:* entropy purchases were to grow the policy grammar's metric namespace per tier — now bundle data, never engine branching. **2026-10-16 session-4 (ADR-0014 #D9): LANDED @65ac92f — the owed schema field + optional loader parse shipped: `type-bundle.schema.json` declares `metricNamespaceTier` (closed four-rung enum mirroring `waves/bands.ts TELEGRAPH_BANDS` — weather/storm/hunter/entropy; absent in every shipped bundle; off-ladder value fails `BAD_ENUM`; `LoadedTypeBundle` embeds it frozen). Still bundle data, never engine branching — zero engine consumers branch on the rung today. Honest carve-out: the lint-leg fold is NOT built (no threat-registry membership data exists to lint against — the leg lands with real membership). `MetricNamespaceTier` stays deliberately module-private, off every barrel (api-verify blind) — export decision recorded: PRIVATE.**
  - **4c. Batch-rung-4 reconciler card type — SEPARATE card type, deferred unlock.** It is neither a clause bolted onto existing cards nor a v1 reflex: **v1 stays reflex-only**; a future unlock event grants the type; until then no bundle may reference it.
  - **4d. Policy-grammar freeze — FROZEN as a spec artifact.** This freezes the **policy-card EBNF grammar** (the `when/for/then/unless` composer vocabulary of WS-5; **Appendix B verbatim** is the grammar) — *not* the GLOSSARY's Level Grammar (scenario-shape columns, untouched). Extensions only by owner decision event; a lane adding a grammar construct is a law breach. **The G7 cooldown lands as a BOUGHT VERB, never a clause** (the verb's engine slice is not yet built or queued).
- **Knob.** (historical — interpreter/scope flags behind A/B in slice (a); `grammarVersion` pin) → grammar version is now frozen law; A/B/C slice flags remain tuning taste.

### OD-5 — MP topology under browser-authoritative sim — **DECIDED 2026-10-09 (option b) — recorded `ea7acee`; ARCHITECTURE §10 flipped (docs queue 9)**
- **Decision.** **(b) TS-sim-as-portable-library** — one TypeScript sim runs as a library in the browser (single-player) and under Node (MP sessions + all headless needs); PHP/Workerman stays services/transport/notary. The repo's existing scaffold **is the ratified shape** — no code owed beyond the §10 wording flip. ADR-0009 §3 rec #5.
- **One-line context.** Created *by* R-2 + R-6: with the sim authoritative in a browser worker, who hosts a multiplayer session's ground truth? (§2.2, §6.1.)
- **Options. (historical)** (a) host-authoritative browser: a seat's worker runs the session; Workerman relays per-seat **observed projections only** (never ground truth). (b) **TS sim as portable library:** same core on **Node** for MP sessions + all headless needs (Async-Versus R-4, Long Weekend, Analyst forward-sims — already forced), browser for SP; Workerman stays services/transport/notary. **(b) chosen — fleet recommendation adopted.**
- **Fleet recommendation was (b); now ratified law.** (a)'s only edge: no Node process class to operate. The repo was already scaffolded per (b) (`tools/headless` Node port exists; slice (d) runs on it as the proof) — that scaffolding is now the decision's shape, not a placeholder (§2.2 sub-decision, `docs/ARCHITECTURE.md §10`, `docs/CONVENTIONS.md §1.2`).
- **Blocks. (historical)** Co-op session ops plan; WS-6 D-6.6 save-trust variant (resolves under b — OD-13 likewise recorded); co-op pause authority (a Node host turns host-vote into **server-vote**); prototype-A final scope; WS-4 Decision-Audit placement (background worker vs Node).
- **Did NOT block Phase 1** — every gate slice ran identically under either option (§6.1 OD-5).
- **Knob.** `mp.topology` = **(b) RATIFIED — TS-portable-library**.

---

## Secondary open decisions (§6.2)

| # | Decision | One-line context | Lean | Blocks |
|---|---|---|---|---|
| **OD-6** | Hands vs executive attention — **RECORDED DECIDED 2026-10-09 (`ea7acee`, ADR-0009 rec #22): Two-Denominations — one pool, attention = the special hand, monthly replenish; implementation is a LATER DESIGN LANE (interacts with OD-4a's loan ledger)** — **2026-10-14 session-3 addendum: per-verb attention COST DECIDED (promoted out of ratify-on-read). Opening default `{Communicate: 1, ticket-class handling: 1, all other verbs: 0}` passed to the door's `attentionCost` config. Disk truth: the config ships DEFAULT-EMPTY and no numeric per-verb recommendation existed anywhere in this register before today — this is the owner's session-3 decision, not a prior fleet recommendation (divergence recorded, ADR-0013 ruling 12(v)). Build lane RAN 2026-10-14 (lane ATTENTION-UI): `ATTENTION_DEFAULT_COSTS` = `{communicate: 1, policy-card-commit: 1}` (ticket-class handling read onto the deal/commit verb per §7.5 CEO-Override; door default stays EMPTY, proto runner + fastForward opt in on a planted pool — byte-identity twins pinned); OD-12c Hands Dock bottom-left shipped as the AttentionCard re-badge. Attention-RAIL TopBar surfacing stays blocked by the §1.4 four-id law by design**. **2026-10-16 session-4 (ADR-0014 #D4): the shipped tax `{Communicate: 1, PolicyCardCommit: 1}` is FULLY RATIFIED — the ratify-on-playtest/confirmed-provisional posture is RETIRED for it; changing a cost is now a law change, not a tuning tweak** | Sequential (hands T0–4, attention replaces at T5+) vs **Two-Denominations** (one pool, attention = your special hand, monthly replenish) | **chosen** (was the lean: "strictly simpler for determinism") | Delegation-bands modeling, rule-cost accounting, attendance math, The Bridge tempo, WS-7 Hands Dock. *(spec-audit 2026-10-09: heading 14424 ⚠️ — attention budget ships door-hands only; support-hands unimplemented, implementation lane unscheduled → OD-23. 2026-10-09b: heading 14424→14436 re-markuped 🔧 — implementation lane SCHEDULED per OD-23(a): design lane opened NOW, paired with OD-4a's focus-hand loan ledger.)* |
| **OD-7** | Accounting-depth menu (i)–(vii) — **DECIDED 2026-10-14: v1 line BLESSED — (i) cash buckets + (ii) invoices/AR-aging + (v) deferred revenue + (vi) dunning are v1 LAW (already shipped in `economy/`); (iii) reduced to a visual; (iv) accrual + (vii) consolidation are Tier-4+ unlocks. Record-only, zero code owed (ADR-0013 ruling 1)** | Recommended v1 line: (i) cash buckets + (ii) invoices/aging + (v) deferred revenue + (vi) dunning; (iii) reduced to a visual; (iv)/(vii) Tier-4+ unlocks | **adopted as listed (2026-10-14)** — **CONFIRMED CLOSED 2026-10-16 (session-5, agenda item (f)): v1 accounting line stands as ADR-0013 ruling 1 records — record-only, nothing owed** | Gate-5 slice scope, Book-board UI budget, C5-restated ledger fields |
| **OD-8** | Mode write-access matrix A/B/C — **DECIDED 2026-10-09: Matrix B — LIVE at `74f157b`** (scenario/daily/consultant/blitz flip pending→LIVE: **160 of 192 rows LIVE / 32 endless rows stay `PENDING_OD8`, contested**; `guardBatch` deny-facet writes now THROW and abort the settlement, §2.4 atomicity; ADR-0009 §3) | Which modes write what to the lineage tree: A full / **B ledger-only** (sandbox/Incident/Analyst write medals & streaks, zero scars/rep/cash) / C bespoke | **B — chosen** (was "MOST URGENT (WS-6)") | WS-8 mode contracts + co-op save ownership; WS-4 revenue isolation. (*§2.2 R-3 prose labels this "OD-9"; the authoritative §6.2 register numbers it OD-8.*) *(spec-audit 2026-10-09: heading 32694 ⚠️ — the endless mode stays PENDING_OD8/32 contested rows, no loop shipped.)* **2026-10-14 session-3: the endless-32 rows STAY contested — explicitly NOT ratified this session (the recommendation was "don't force it"; owner adopted the recommendation). Deferral re-confirmed (ADR-0013 ruling 7). 2026-10-16 session-4 (ADR-0014 #D8): the deferral ENDS — owner verbatim "queue the endless save slice" — the 32 `PENDING_OD8` endless rows got their build lane. **LANDED @1660fd2: the 32 rows FLIPPED LIVE under the ledger-four posture (append `records`/`medals`/`streaksShared`/`codex`; deny the other 28 facets — byte-identical facet permissions to the scenario/daily/consultant/blitz cohort); matrix census 192 LIVE / 0 pending, pins re-cut. Data flip, NOT law removal — `writeGuard`'s pending-throw branch and `pendingOd8Rows()` stay on disk, now unreachable-by-construction (zero pending rows to fence); the `guardBatch` deny-abort falsifier moved onto the standing endless deny rows. POSTURE LEDGER: the pending rows carried the campaign-mirror (full-carry) recommendation as data; the ruling commanded ledger-four — the mirror is RETIRED and re-raising full-carry needs a FRESH owner ruling. Endless LOOP/mode-tier scoping stays DEFERRED per OD-16(a) (save slice ≠ mode tiering).** **2026-10-16 session-5 fresh ruling (agenda item (a)): EXECUTED — the re-raise condition the posture ledger named is MET: endless re-raised to campaign-mirror FULL-CARRY @`c9e34c7` (`CAMPAIGN_MIRROR_MODES`; the 32 endless rows derive campaign's exact facet map — 20 append / 12 instance / 0 deny, kinds derived from `campaignRow`, zero hand-authored rows; §2.5 "the Long Save continuing in place" now rides as LAW not data; matrix census 192 LIVE / 0 pending UNCHANGED; deny census 140→112; flip-back probe reddens exactly 4 witnesses in save.test.ts — falsifiable). The ledger-four interim is preserved as the record of what governed for ~1 day; it survives today only for the ADR-0009 cohort (scenario/daily/consultant/blitz). Endless LOOP/tier scoping STILL DEFERRED per OD-16(a).** |
| **OD-9** | Co-op save ownership — **DECIDED 2026-10-14 (design law): SHARED BRANCH NODE — one Company, 2–4 writers; the branch node holds museum artifacts + scars per participant, NEVER customers or cash (ledger stays single-authored, mirroring the ratified Matrix-B shadow-instance law). Implementation queued: co-op save slice lane follows (ADR-0013 ruling 2; owner pulled co-op explicitly into completion scope.** **CONTRACT LANDED 2026-10-14: `save/coop.ts` branch-node law + `CompanyNode.coop` seat ledger — validator law, not runtime; Workerman relay transport lane stays PHP-side out of repo.** **2026-10-16 session-5 (agenda item (e)): the four in-repo LAW frictions left by the #D6 relay spike are RESOLVED @`500c134`+@`6d0bc1e` — same-tick joins legal under canonical `(joinedAtTick asc, participantId code-unit)` order, re-join = new tenure row (disjoint chronological half-open tenures, per-tenure seat resolution, gap = ghost author), joiner catch-up relay-side with zero save writes, MIN_WRITERS ratified as recorded-writers history law (distinct participants ever seated, not live seats); the @`24426ec` current-seats-only broadcast law stands. NOTE: the session-5 endless posture re-raise (agenda (a), @`c9e34c7`) touched save MODES law only — OD-9 co-op branch-node law UNTOUCHED.** | One Company, 2–4 writers: shared "branch" node writing museum artifacts + scars to each participant but not customers/cash? Deepest WS-6↔WS-8 interface question | **branch node — adopted (2026-10-14)** — **CONFIRMED CLOSED 2026-10-16 (session-5, agenda item (f)): branch-node design law stands per ADR-0013 ruling 2; the remaining transport leg (below) is a separate lane, not a reopening** | Co-op v1 scope; depends on OD-8 + OD-5. **Still open out-of-repo: PHP/Workerman transport + wire mechanics (seq policy, payload opacity until the door, O(n²) append self-check, paged catch-up)** |
| **OD-10** | Clock instruments (Ribbon vs dials) + max-legibility speed 3× vs 2× — **DECIDED 2026-10-14: ONE unified time-service presentation — ribbon primary, dials are instruments of the SAME service, not rivals (no dual authority over "what time is it"). Max LEGIBLE speed = 2× until G1 playtest data; the SpeedX door ladder 1\|2\|4 stays as shipped (MODULE-STATUS:178 deviation row untouched) — 4× = authored art exception, 3× never legal. Hardware target = current dev-box floor (ADR-0013 ruling 3)** | Both fed by one clock service (dials-in-bezel glance + ribbon-on-demand scrub); P5's 3× vs hosting_game.md §8.9's 2× — stale number or deliberate? | **ribbon+dials unified service; speed 2× until G1 playtests — adopted (2026-10-14)** | WS-7 HUD v1 shortlist #1, Bezel contract; WS-1 `simUs` speed param. *(spec-audit 2026-10-09: heading 31543 ⚠️ — the 2k/20k readability targets cite OD-10/OD-12 figures that are unratified and unmeasurable on today's 200-node perf grid.)* **2026-10-16 session-4 (ADR-0014 #D3): readability RULED (option c) — the RELATIVE law replaces the unratified absolute 2k/20k figures as STANDING LAW (legibility held against the densities the measured perf-grid baseline on the ratified hardware target actually produces); the absolutes are demoted to an aspiration note; a measured `tools/perf` grid baseline must be appended when run — build lane follows. The 2× max-legible ruling and the 1\|2\|4 SpeedX ladder stand unchanged.** **2026-10-16 (wave-18): measurement RUN** — the #D3 clause is DISCHARGED: the measured `tools/perf` grid baseline is recorded as a dated law-note under "The readability targets" (hosting_game.md §8.9 "Readability at scale", :31574; tail rows' "§8.18" label corrected there): digest arm 70 t/s at n2,000@200 (7.0× a 10 Hz host at 1×, 3.5× at the 2× ruling) and 27 t/s at the 1,024 STORM_CAP ceiling; the in-flight roster census plateaus at 192 units — the 20k absolute is measured UNREACHABLE on shipped plateau boards, which is the evidence for the relative law. Heading moved ⚠️→🔧. Numerics stay UNRATIFIED — the 2× ruling and the 1\|2\|4 ladder untouched. **2026-10-17 amendment (ADR-0015 #1): the ratify sweep ratified the RELATIVE-law clauses and left this row's ABSOLUTE numerics in the recorded NOT-IN-SET ledger — pixel-legibility / 60-seconds-unread stay deferred pending a measurement harness (no 40-per-glyph constant exists to ratify); the row stays OPEN for numerics only.** |
| **OD-11** | Ship order: Consultant vs Bootstrapped — **DECIDED 2026-10-14 (record-only): Consultant first, Bootstrapped ships as its mirror — v1.1 campaign plan; forward note in MODULE-STATUS (ADR-0013 ruling 4)** | Two run structures over the same systems; "ship one first, the other as its mirror" | **Consultant (highest-return single addition) — adopted (2026-10-14)** — **CONFIRMED CLOSED 2026-10-16 (session-5, agenda item (f)): the Consultant-first / Bootstrapped-as-its-mirror launch-order detail stands as recorded (ADR-0013 ruling 4) — v1.1 campaign plan, record-only** | v1.1 plan; WS-6 endings-suite ordering |
| **OD-12** | Render-surface bits (WS-7 Q4–Q7 + gaps) — **DECIDED 2026-10-14: ALL items adopted as recommended. (a) violet trust-auth ports — DISK TRUTH: already shipped, `apps/proto/src/gates/g4/portShapes.ts:11,63-70` gives trust an SFP slot in teal-violet (`--g4-hue-trust`); the ruling CONFIRMS, opens no work. (b) Confidence Blur renders attachment-crispness where both exist — the §8.9 blur-vs-crispness ⚔️ resolves to composure, not competition. (c) Hands Dock placement RULED bottom-left — BUILT 2026-10-14: `chrome/AttentionCard.vue` IS the dock (`data-hud-dock="hands"`, `data-dock-anchor="bottom-left"`, `.hands-dock` grid self-align + lab host `data-dock-host`). (d) visual-coverage audit becomes a MANIFEST-LINT CI rule — every shipped buildable/threat/visitor must have a visual or an explicit codex-only tag (BUILD ITEM, gap row added, lane follows). (e) hardware target = current dev-box floor; l10n budgets + keymap/focus order DEFERRED (ADR-0013 ruling 5)** | (a) violet trust-auth ports vs white+keyed; (b) Confidence-Blur vs Attachment-crispness; (c) Hands Dock placement; (d) who audits visual coverage (hosting_game.md §8.18) — proposed **manifest-lint CI rule**; (e) hardware target, atlas pipeline, iso picking, keymap/focus order, l10n budgets | **as proposed — adopted (2026-10-14)** | WS-7 shader tables, content-build CI (manifest-lint lane), a11y sprint timing (interlocks OD-16). *(spec-audit 2026-10-09: headings 31543 / 32326 / 32505 ⚠️ — a11y harness promised "day one" ships 2 of 11 roster gates; the §8.18 visual-coverage audit role this row proposes is exactly what remains unbuilt — RULED to ship as CI lint 2026-10-14.)* **2026-10-16 session-4 (ADR-0014 #D3): the shared readability heading 31543 resolves RELATIVE — the 2k/20k absolutes (this row's OD-12 side included) are demoted to an aspiration note and the measured-perf-grid relative law is STANDING LAW; perf-grid baseline append rides the same build lane as OD-10.** **2026-10-16 (wave-18): measurement RUN** — the perf-grid baseline this side owed is RUN and recorded in the "The readability targets" law-note (hosting_game.md §8.9, :31574); heading ⚠️→🔧. Honesty split stated there: the ENGINE is measured at the targets' board densities; the render-legibility clauses remain STRUCTURAL — `LABEL_CAP_BY_ALTITUDE.Z3 = 30` verified on disk matching the spec (no divergence), and no 40-entities-per-glyph constant exists at all (aggregation ships as budget "+N" refusal clusters + the Z3 LOD2-aggregates tier). OD-12 numerics stay unratified. **2026-10-17 amendment (ADR-0015 #1): same reading as OD-10 — the sweep's NOT-in-set ledger keeps the render-legibility NUMERICS (pixel/60s/40-glyph) deferred pending a harness; structural-code-law clauses ratified, numerics OPEN.** |
| **OD-13** | Save trust policy (re-scoped by C9; depends on OD-5) — **RECORDED DECIDED 2026-10-09 (`ea7acee`, ADR-0009 rec #21): option (1) — SP saves client-authoritative with periodic notarization; server re-sims only where the save carries cross-player value (versus/co-op/notary). Implementation is a LATER SAVE LANE** | (1) client-authoritative + periodic notarization (fits ratified SP contract) vs (2)′ server-authoritative re-sim via **Node port**; Ironman/cloud-sync collision | **(1) — chosen** | WS-6 sync UX, leaderboard integrity; OD-5 interaction (resolved: (b)) |
| **OD-14** | Canonical type count — **DECIDED 2026-10-09b (option a): 34 line entries / 20 launch bundles — audit merge proposals (~7 doc-merges + ~6 rec-merges) ADOPTED as the canon; per-type content authoring waits on nothing else — content lane queued against this canon** | Doc drifts 20 / 30 / 32 / 34 / 61; audit proposes ~7 doc-merges + ~6 rec-merges | merge proposals → ~34 line entries / 20 launch-bundle — **chosen** | WS-3 production plan, hum/era token coverage, marketing copy. *(spec-audit 2026-10-09: g01#5 / g02#2 / g07#4 — the variety engine is proven at exactly 2 of ~34 types and `applyFifthAxis` is live with zero configured fifth axes; per-type content waits on this canon — CANON SET 2026-10-09b.)* |
| **OD-15** | Engine-doctrine bless bundle — **DECIDED 2026-10-14: §1.7 wording BLESSED — wave-envelope law stands; "waves vs continuous" resolved as BOTH-ARE-WAVES doctrine; mazing = never-maze expressibility; bottleneck-highlight = purchased probe; auto-pause = rule-card. D-7 storm-severity cap ADOPTED BOUNDED: engine-enforced ceiling on emergent storms = hard rate ceiling + stacked-envelope cap expressed in the band ladder. BUILD-LANE BRIEF: `waves/bands.ts` `TELEGRAPH_BANDS` ships visibility booleans only (no numeric ceilings) — the lane verifies exact numbers against existing tuned constants (pressure-budget ≤4-entries/wave law `47b2c33`; §2.24 composition cap 4; 30:1 oversell-detent ceiling `runner/contention.ts`; Q16.16 saturation 32767.0) and PREFERS a ratified-adjacent number over inventing one — the brief's "128/8" pair is explicitly NOT blessed (ADR-0013 ruling 6)** | Ratify doc-⚔️ resolutions (waves-vs-continuous envelope; mazing "never maze the express lane"; bottleneck-highlight as purchased probe; fast-forward-during-alerts auto-pause-as-rule-card; **emergent-storm severity cap** — doc silent, needs a new decision before G3 calibration) | **blessed + D-7 bounded — adopted (2026-10-14)** — **CONFIRMED CLOSED 2026-10-16 (session-5, agenda item (f)): blessed §1.7 doctrine + the BOUNDED D-7 cap stand (cap BUILT-BOUNDED @`502ca3f`: 1,024 rate-units/min × 4 stacked envelopes, `waves/bands.ts` `STORM_CAP`)** | WS-1 core-loop guards, WS-2 routing verbs, WS-5 auto-pause merge, gates G1/G3 tuning ceilings (storm-cap lane queued → **BUILT @502ca3f**) |
| **OD-16** | Mode-list amendments — **DECIDED 2026-10-09b (option a): ~15-MODE TIERING ADOPTED AS LAW; the endless-32 save rows STAY `PENDING_OD8` until an endless loop is scoped (deferral ratified, not a gap)** | Ratify ~15 orphan re-tierings; build Minimalist glyph ⇄ Shape-First a11y skin **once**; ethics standing author law; SP-Handover ships regardless; Versus transport policy **and live-ops appetite** (frozen formats-as-data vs live ratings/meta/banlist); co-op pause gap | adopt tiering — **chosen (a)**; frozen-format *before* live Versus | v1 feature list, a11y sprint plan, Versus scheduling. *(spec-audit 2026-10-09: heading 33137 ⚠️ + g24#2 / g25#5 — tiering adopted-as-law nowhere; one-hand/sonified modes and the Minimalist⇄Shape-First skin all queue behind this row. 2026-10-09b: heading 33137→33149 re-markuped 🔧 — tiering RATIFIED; the mode-table encode itself is a queued content/save-surface lane; endless carve-out per row 32694→32706 🔧. **EXECUTION-LANDED 2026-10-10 `42fbbd2`** — `MODE_TIERING` (save/modes.ts) encodes the RECORDED triage at heading/cluster granularity, core 3 · extended 20 · deferred 9; the 5-band→3-tier fold is lane-authored, owner-ratify-on-read. **2026-10-14 session-3: tiering STANDS as adopted and the 5-band→3-tier fold is now owner-RATIFIED (ratify-on-read lever closed); OD-8's endless-32 rows explicitly NOT ratified this session — stay contested (ADR-0013 ruling 7).**)* |
| **OD-17** | ICS coordination model — **DECIDED 2026-10-14 (option A, recorded as LAW): SHARED INCIDENT TIMELINE — one event stream, both seats read the same ordered log (consistent with OD-5(b) portable-sim and the single-event-log determinism law). Option C (duplicate-action interference) noted as a FUTURE OPT-IN twist, not built (ADR-0013 ruling 8).** **CONTRACT LANDED 2026-10-14: `replay/coopTimeline.ts` — one `(tick, seq)`-ordered shared log, `digestCoopTimeline` interleaving-invariant through the replay canonical machinery.** | Roles are multiplier badges — "attention modeled beautifully, coordination not at all" (hosting_game.md §9.13 #10); options A shared-incident-timeline dual-use / B info-partitioned + huddle / C duplicate-action interference / D comms fidelity / E coordination-tax in co-op only | **A — adopted as law (2026-10-14)**, C kept as future opt-in | Incident Command screens (R39), WS-8 shared timeline (slice A), WS-7 Timeline Ribbon |
| **OD-18** | Rule-masking content mandate — **DECIDED 2026-10-14: ADOPTED as AUTHORING law (WS-3 pruning-law family). Appendix A gains an OPTIONAL `lookalikeOf` reference on threats; ONE mimic-seed per shipped type bundle — the 5 shipped bundles (shared-web, game-servers, mail, dns, dedicated). Build gap row added; schema field + seed content ride the content/schema lane (ADR-0013 ruling 9)** | "A rule can mask its root cause" needs threats authored to *look like* the condition a rule was written for — a WS-3 authoring-law obligation nothing currently guarantees | **authoring law + one seed per shipped bundle — adopted (2026-10-14)** | Appendix A `lookalikeOf` field, WS-3 authoring QA (want answered before G6 schema freeze) |
| **OD-19** | Mastery-budget collision — **DECIDED 2026-10-14 (record-only): WS-6 25 h arc schedule ADOPTED AS PROPOSAL — enters the campaign act table when campaign authoring starts (ADR-0013 ruling 10)** | WS-6's proposed 25 h arc schedule (Prologue / Act I downshift-as-mastery / Act II Hardest Lesson after demonstrated churn / Act III Ratchet Audits-as-mastery) — needs tuning-owner sign-off once OD-2 lands | **adopted as proposal (2026-10-14)** — OD-2 has long landed | Campaign act table |
| **OD-20** | Misc confirms (low-risk paper) — **DECIDED 2026-10-14: CONFIRMED as listed. Scar-cap wording = active-modifier slots capped, history immortal — MATCHES shipped save law (`save/node.ts:144` CAP = 3 active, overflow retires; `save/faces.ts:45` "Immortal history: retired scars stay readable"); spec §1.6 "Scars" heading already ✅ `9e701a0`, no flip needed. HUD-slot, MRR exemption, sacrifice-ladder confirms likewise ratified (ADR-0013 ruling 11)** | WS-4 HUD-slot/MRR-exemption/sacrifice-ladder/resolved-on-paper list + WS-6 scar-cap wording (cap = *active modifier slots*, history immortal) — **confirm no re-litigation** | **adopt as listed — confirmed (2026-10-14)** | HUD budget rows, postmortem scoring text |

---

## Spec-audit additions (2026-10-09) — owner-gated findings opened as OD rows

Source: `reports/audit/SUMMARY.md` PROBLEMS + group TOP-PROBLEMS (audit commit `ef74a2f`). Each row lacked an OD entry despite gating named content/build lanes.

| # | Decision | One-line context | Lean | Blocks |
|---|---|---|---|---|
| **OD-21** | Threat familyWeights re-author per ratified Sheet B — **DECIDED 2026-10-09b (option a): the LANE-AUTHORED Sheet-B familyWeights (`4856a42`, both bundles + `parseFamilyWeightsTable`/`weightedFamilyOf` consumers, host mix wired `cf7a696`) are RATIFIED AS PROVISIONAL — re-taste after G1 playtests; owner sweep no longer owed** | `waves` Matrix C (heading 11385, now ✅ `4856a42`/`cf7a696`): weights shipped per the fix-pipeline lane after OD-2 ratified Sheet B at `24dfcfe` | ratified provisional — **chosen (a)**; **2026-10-14 session-3: owner BLESSES playing with the provisional set — stays PROVISIONAL, re-taste after G1 playtests (ADR-0013 ruling 12(i))**; **2026-10-16 session-4 (ADR-0014 #D4): the shipped sets FULLY RATIFIED — the provisional/re-taste posture is RETIRED for familyWeights; changing a weight is now a law change** | Matrix C draws, per-family pressure calibration, wave-table composition taste (playtest-pass only) |
| **OD-22** | Era grid — which eras are playable — **DECIDED 2026-10-09b (option c): ERA CANON = 1998 + 2026 FOR v1 (what ships today); the 4-era plan (~1998 / ~2008 / ~2016 / 2026) is RATIFIED AS THE CAMPAIGN-PHASE PLAN — the era-count ⚠️s resolve as ruled law, further token sets land with the campaign lane, not before** | Headings 31810 / 31837 / 32366 (now 🔧, ruled): era-tokens.css ships exactly 1998/2026; the spec corpus assumed 5–6 playable eras (§0.4 era grid, "30 lines × 5 eras"); packs ship 2 era-codes — MATCHES the ratified v1 canon | 2-era v1 / 4-era plan — **chosen (c)** | proto skin lanes (campaign-phase token sets), content era-varied copy, media/prompts era-cross material, §8.10 hero rows |
| **OD-23** | Support-hands / two-denominations IMPLEMENTATION scheduling — **DECIDED 2026-10-09b (option a): DESIGN LANE OPENS NOW, paired with OD-4a's focus-hand loan ledger (one attention-denomination design covering both)** | OD-6 is RECORDED DECIDED (`ea7acee`); heading 14424→14436 re-markuped 🔧 at this ruling — the scheduling question the row posed is answered | design lane opened 2026-10-09b, paired with OD-4a ledger — **chosen (a)**; execution status: ~~design lane queued~~ machinery SHIPPED (`eff5694` pool/loans + `179861d` `ATTENTION_DEFAULT_COSTS`); **2026-10-16 session-4 (ADR-0014 #D4): the per-verb tax {Communicate 1, PolicyCardCommit 1} is FULLY RATIFIED — this row's question is CLOSED** | Hands Dock, The Bridge tempo, support-tax doom-loop (§2.12), business-threat hand competition (§2.9 8504) |
| **OD-24** | Pricing as a mechanic — player pricing verbs + dead dials — **DECIDED 2026-10-09b (option a) — OWNER OVERRIDE of the fleet/lane recommendation (c): FULL PRICING SURFACE WILL BE BUILT — player pricing verb(s) through the intent door, the ~21 unbuilt dial consumers, an elasticity model (provisional tuning, ratify-on-playtest), and the oversell-ratio host knob. 8:1 recorded as the PROPOSED shared-web starting ratio (pending taste). Execution status: build wave queued. **2026-10-14 session-3: elasticity coefficients 150/80/50 bps, ±10% dead band, [0.5×,3×] clamps CONFIRMED-PROVISIONAL; oversell-ratio 8:1 proposal ~~CONFIRMED-PROVISIONAL~~ — `OVERSELL_RATIO_MICRO = 8_000_000n` shipped `2ef5cae` at `apps/proto/src/runner/waveRules.ts:124` (ADR-0013 ruling 12(iii)/(vi)). **2026-10-16 session-4 (ADR-0014 #D4): FULL RATIFY NOW — elasticity set {churn 150 %, retention 80 %, recovery 50 % coefficients, ±10 % dead-band, churn clamp [0.5×,3×], retention floor 0.1× — the retention-vs-churn ASYMMETRY ratified DELIBERATE}, oversell 8:1, and the GRANDFATHER-WINS-over-price-override billing order are RATIFIED AS LAW (written §6.12 concessions outrank the §6.5 dial in the invoice base chain); confirmed-provisional superseded for these sets** | Headings 22940→22952 (now 🔧) / 22992→23004 (🔧 — engine seam live `4856a42`, host wiring rides the queued wave): pricing was engine-side data only, no pricing verb among the 8 door verbs, 21 of 29 declared dials unbuilt, `oversell-ratio` parsed with zero host-side consumers | full surface (a) — **chosen by owner override** | economy pricing lane, proto door-verb extension (9th+ verb), elasticity model tuning pass, gap-register clusters 3/13/14, commercialSliders dead-config cleanup |
| **OD-25** | Endgame / insolvency posture (how the company can die) — **DECIDED 2026-10-09b (option a): THREE CANONICAL DEATHS — float-insolvency, covenant-default, churn-collapse — ARE THE DEATH TAXONOMY; the endings lane builds on them (the MODULE-STATUS:101 host-fund-vs-settle-side call resolves inside float-insolvency design). 2026-10-14 session-3: death thresholds {churnFloor 1, churn 3 d, float 3 d, grace 10 d} ~~PROVISIONAL-CONFIRMED~~ (`economy/config.ts` death block — PROVISIONAL tags swept by the session-4 ratification, R3b lane) — ratify-on-playtest ~~continues~~ (ADR-0013 ruling 12(ii))**; **2026-10-16 session-4 (ADR-0014 #D4): FULL RATIFIED — {churnFloor 1, churn-collapse 3 d, float-insolvency 3 d + refused settles, grace 10 d} are LAW; the ratify-on-playtest lever CLOSES for them; changing a threshold is now a law change** | MODULE-STATUS:101 owner call + heading 24433 PARTIAL / §6.10's 13 unlisted failure modes (cluster 19): death today = freeCash throw + guardrail halts only; covenant machinery shipped `57ea80e` (breach notices + OD-25 silent-pin); churn primitives ship | three-death taxonomy — **chosen (a)**; execution status: endings design lane queued | campaign/endings lane, §6.10 catalogue mapping onto the three canonical deaths, unattended halt semantics, lose-slowly pin (34691) | — **RIDDEN 2026-10-18 (wave-26): endings v0 LANDED @`61a1c3b` — obituary / exit / quiet-handoff as pure read-projections off the terminal chapter record (money-untouched, records immutable); the exit-EDGE valuation/cashSlice stays the named owner wall.** |

---

## Ratified micro-decision ledger (2026-10-09 session — non-OD rows, ADR-0009 §3)

| Row | Decision | Execution |
|---|---|---|
| **Q-P3-1** | Kill-Switch freeze: **defensive reading CONFIRMED** — a freeze preserves and defers pending consults (verdicts recorded mid-freeze, TTL clock stops); shipped code already implements it — **record-only, zero code change** | `ea7acee` (record) |
| **T-9** | **Racks DEGRADE-ALL + anchor joins `members`**; two-color law is code: power kills RED, rack degrades AMBER; blast goldens + rack-pin tests re-cut DELIBERATELY (audited event) | `8a5f413` |
| **F-2** | Shed-terminates **CONFIRMED KEEP** — hard-ceiling shedding terminates the unit (patience-bounce cause taxonomy stands as landed) | shipped `2eaf830`; ratified `ea7acee` |
| **Pack volume** | i18n over-cap (98 shared-web / 75 game vs ≤60 task-line) **RATIFIED — do not trim** (§9.3 verbatim doc seeds mandated it) | `ea7acee` (record) + content README note (docs wave) |
| **Versus rows** | weightBps=cost keep · affixes inert keep · pool 10 keep · tie law keep · unattributed mint-tick floor accepted · **FLIP: `lookupPolicyCard` keys by CONTENT fingerprint (`hh-card-v1`), not card ids** | `d076ad5` |
| **Economy rows** | ~25 ms steady floor **ACCEPTED** · register batch-API **APPROVED** (`registerContractsEconomy`) · prune stays **OFF** · persist-index declined · snapshots-reshape DEFERRED · rec#4 deferred · `scaleEvent` declined | `d076ad5` (batch API) |
| **Substrate** | **`BUDGET_CAPS.substrate = 1200` SIGNED** + authored-patches law + 4 taste rows ratified; seam self-activated; first-mount stays paired with real atlases | `27f2856` |
| **CI matrix** | **Drop Node 20.x → `["22.x","24.x"]`**; 20.x `--filter` hack deleted; engines prose honest | `779dea9` |
| **Tag policy** | Next tag **v0.3.0 at the end of this calibration wave** (green tip; existing tag history untouched) | record (cut = wave closeout) |
| **Devtools / @pixi/node** | `pixijs/devtools` = **doc-only row**, never a dependency decision; `@pixi/node` pixel-audit CI arm **DEFERRAL CONFIRMED until real sprite atlases exist** | `ea7acee` (record) + ADR-0008 annotation (docs wave) |

## Ratified session-3 micro ledger (2026-10-14 — ADR-0013, owner adopt-all ruling)

| Row | Decision | Execution |
|---|---|---|
| **Recovery knobs** | The 5 recovery knobs (`pipeline/recovery.ts:75-76`, windowMinutes 12 / rampMinutes 4 / floorSlots / struggle / quiet) + the 7 pricing/elasticity constants — ~~**CONFIRMED-PROVISIONAL** (ratify-on-playtest class continues, owner blesses the posture)~~ **RATIFIED 2026-10-16 (ADR-0014 #D4) — recovery {12, 4, 1, 2, 1} + the elasticity set (150/80/50 %, ±10 % dead-band, [0.5×,3×] churn clamp, 0.1× retention floor, asymmetry deliberate) are LAW; the broader ~40-constant OD-2 economy-taste pile is NOT in the named sets and keeps its own row** | `ADR-0013` ruling 12(iv) (record) → **`ADR-0014` #D4 (ratify)** |
| **5-band→3-tier fold** | **RATIFIED** — the lane-authored fold inside `MODE_TIERING` @`42fbbd2` closes its ratify-on-read lever | `ADR-0013` ruling 12(vii) (record) |
| **ADR-0012 authority** | Recovery ENGINE-canonical / observer-advisory **RATIFIED** | `ADR-0013` ruling 12(viii) (record) |
| **canSettle** | **CLOSED — recommend-adopted: v0 law stays host-forwarded refusals** (`fastForward.ts` catch-and-void). No economy-side `canSettle()` veto is added; the MODULE-STATUS:164 owner ask is answered | `ADR-0013` ruling 13 (record) |
| **Verb-exhaustion (types 6+)** | **ADOPTED — extend within ADR-0005's already-ratified per-tier verb sets; NO ADR amendment needed.** Trunk Group / Eleven Nines Observe-collision cards unblock via per-tier verb sets or newly authored cards — content lane decides which; `THREE_CHANGE`/`VERB_SHIFT` ruleset linters must stay clean through whichever route is picked — **2026-10-16 update: the roster WAS amended (ADR-0014 #D1 @fb18c05): `negotiate` + `schedule` join `TIER_EXTENDED_VERBS` (six members; Diagnose blessable onto an implying card; re-claim/MERGE stays FORBIDDEN). First blessed use: type-10 `official:colo` "Amps and Aisles" founded on Negotiate LANDED @9bb86f4 — **2026-10-16 session-5: SECOND blessed use LANDED @`6c0e074`, type-11 `official:backup-archival` "Restore Point" founded on Schedule (first Schedule card; the #D1 blessing pair Negotiate+Schedule now FULLY SPENT). Diagnose is the SOLE unclaimed invariant (still no §1.3 card names it verbatim); the twelfth card is an OWNER LAW CALL**. **2026-10-16 session-6 (ADR-0015 #3): the law call ANSWERED — the owner ruled to EXTEND: `isolate` joins `TIER_EXTENDED_VERBS` as the SEVENTH extended verb @`7f47563`, grounded VERBATIM in the §1.3 DBaaS card ("Verb: isolate and throttle. The boss is a split brain.") + the §7.16 Act row; type-12 `official:dbaas` "The Cellar" LANDED @`5956b8f` claiming it, and `isolate-node` entered the closed door enum (16th verb) WITH its engine consumer the same wave @`86cff89` — every extended verb is now BUILT with mechanics (ADR-0015 #2), the card-identity-only era is over for tier verbs. The invariant six are UNTOUCHED; **Diagnose is the sole unclaimed invariant (still no §1.3 card names it); a thirteenth card is again an OWNER LAW CALL.** Named successors throttle/restart/expire/reclaim stay off-roster until blessed one at a time. **2026-10-17 session-7 (ADR-0016 #7/#5): the law call ANSWERED for the thirteenth card — Diagnose BLESSED (D1(i) route, no lint change) onto type-13 `official:observability` @`9e9f377`; ROSTER EXHAUSTED (6+7 all claimed), the FOURTEENTH = fresh law call. Door-side the successors landed WITHOUT roster entries: `throttle-node` (17th) @`81b0589` + `restart-node` (18th) @`fd91138` are door verbs, not card-identity roster verbs — expire/reclaim stay off-roster. **2026-10-17 session-8 (ADR-0017 #1): the law call ANSWERED for the fourteenth card — `reclaim` BLESSED as the EIGHTH extended verb (fifth roster amendment @`ff8615c`), grounded VERBATIM in the §1.4 CI/build-farm card's own verb line third word; type-14 `official:ci-build-farm` "Green Light" @`a47a9b5` — FIRST §1.4-founded card (§0.3/§6.6 absences RECORDED) and FIRST door-before-card landing (spine @`c8b92a2`, refusal census UNMOVED at 46 — first zero-new-phrase verb). `expire` stays OFF-roster BY RULING — the read-time expiry law already lapses bookings (double-naming argument). Roster: 6 invariant + 8 extended, ALL claimed — the FIFTEENTH card is a fresh OWNER LAW CALL** | `ADR-0013` ruling 14 → **`ADR-0014` #D1 (roster amendment; pair spent @6c0e074) → `ADR-0015` #3 (roster extension — Isolate) → `ADR-0016` #7 (Diagnose bless) + #5 (successor door verbs) → **`ADR-0017` #1 (Reclaim bless — eighth roster verb; first §1.4-founded type; `expire` ruled off-roster)**; content gap row (MODULE-STATUS) |
| **Attention per-verb cost** | **DECIDED (promoted out of ratify-on-read): opening default `{Communicate: 1, ticket-class handling: 1, other verbs: 0}`** — diverges from disk (config ships default-EMPTY, no prior recommendation existed in this register); owner session-3 decision, build lane ~~queued~~ **RAN 2026-10-14 (`179861d` — `ATTENTION_DEFAULT_COSTS` = {communicate 1, policy-card-commit 1}; door default stays EMPTY, hosts opt in, byte-identity twins pinned)**; **RATIFIED 2026-10-16 (ADR-0014 #D4) as LAW** | `ADR-0013` ruling 12(v); OD-6 row addendum → **`ADR-0014` #D4 (ratify)** |

---

## Fresh owner asks (2026-10-19, wave-30 closeout — the wave-29 register dispositioned below where still standing; the type-program CEASE (ADR-0017 #8) and every standing STOP still standing)

**The 2026-10-19d owner batch (verbatim "go / recomendations and kep
going") opened register gate (a) — the CONTENT RETUNE — with the lane
recommendations standing: (b)-(e) named deferrals stay named, (f)
epilogue-UI stays walled (the proto has NO campaign host surface to
consume it), (viii) the valuation ladder stays gated behind the playtest
not yet run. A mid-wave stop was honored and "go" resumed. One lane +
three review cures executed atop `ca9f7bb`:**

- **(a) Content retune — upkeep "small" numerics — CLOSED @`3dd65cf`
  (cures @`0e6847b`).** THE promised motion of the upkeep fold is now
  CONTENT: the PROVISIONAL ladder inform 5,000 / consult 10,000 /
  execute 25,000 / failover-wall execute 40,000 µ$/sim-min rides all
  fourteen shipped deck cards (Σ watch-the-door 130,000 ⇒ t420 bill
  54,600,000 µ$; cold-aisle 35,000 ⇒ 14,700,000; sleepless 50,000 ⇒
  21,000,000). ALL 14 deckCardHash goldens re-derived (old→new table in
  the commit body — named, not hidden). The live first-bill witness
  `scenario/__tests__/deckUpkeepLive.test.ts` 7 its (t420 EXACT; the
  floor-first bounce twin lands cashEnd EXACTLY 5,000,000n with the
  cards STAYING committed; ×100 determinism; dormant roster
  byte-stand). The g7Deck.ts 0n gate fiction deliberately NOT retuned
  (the commission names shipped decks only) — the machine-pinned
  UPKEEP_DIVERGENCE list + the NEW proto-side drift pin (W30-01) close
  the enforcement loop BOTH directions. **The upkeep ladder JOINS THE
  RATIFY-ON-PLAYTEST SET** alongside the wave-28 valuation ladder
  (W28-04) and the wave-29 upkeep semantics. Engine truths pinned this
  wave: the armed-COMMITTED proto pair `2a7a977a541b08a9`/
  `6a314d31f2f2f889` is ZERO-MOTION **BY LAW** (the frame digest is the
  PROJECTION; ruleBook content never crosses that wire — upkeep motion
  lives in the STATE digest, witnessed scenario-side, review
  re-proved); a t419 unarmed digest twin is IMPOSSIBLE by construction
  and the claim was discharged on the money channel instead, disclosed
  in-test.

**Still standing from the wave-29 register (posture unchanged):**
(b) card-shed-on-nonpayment wall · (c) forward-charging · (d) droplet
fidelity · (e) suspension-aware accrual · (f) endings-UI epilogue
consumption — WALL: the proto has no campaign host surface; the 37
voice lines ship and nothing renders them — **(i) NEW: epilogue-UI
consumption is the only obvious next BUILD if commissioned** (the
endings evidence keys are live engine output; rendering them is a proto
feature, owner call) · (g) panel deck-picker beyond watch-the-door ·
(h) G7 wire-graph hygiene. The standing walls restated WHOLE under the
wave-29 header below stay WHOLE.

## Fresh owner asks (2026-10-19, wave-29 closeout — SUPERSEDED AS THE LIVE REGISTER by the wave-30 section above; the wave-28 eight asks dispositioned below; the type-program CEASE (ADR-0017 #8) and every standing STOP still standing)

**Dispositioned by the 2026-10-19 owner batch — register asks (i)-(vi)
COMMISSIONED and BUILT this wave, (vii)-(viii) explicitly NOT commissioned
(the wave-28 eight asks stay intact as history below):**

- **(i) Upkeep BILLING fold — CLOSED (BUILT).** @`b59dbeb`: the DP wall
  becomes an engine leg — `deriveUpkeepDraft` reads the FULL card docs
  already persisted in `GameState.ruleBook` (no new state, no forwarding leg,
  no digest-schema change — the book lives inside the state digest, so
  digests move exactly when the ledger does); ONE `rule-upkeep:mN` draft per
  business-month roll on the shared `BUSINESS_MONTH_MINUTES`/`businessMonthOf`
  grid (the fold's OWN 43,200-floor, NOT `econ.monthIndex` — the frozen-at-
  death falsifier pinned); floor-first refuse-not-overdraft through the
  ORDINARY opex loop (memo `<topic>:opex:rule-upkeep:mN`; the guard, the
  OPEX-REFUSED ×N census and the L4 death-forwarding chain ride FREE);
  unconditional cursor mint at BOTH fold hosts; retroactive accrual v0.
  PROVISIONS: cadence / retroactive / no-lapse are PROVISIONAL readings of
  §7.14 and §1.6's "first upkeep bill" — neither numerically specifies
  cadence. Named deferrals: card-shed-on-nonpayment, forward-charging,
  per-minute droplets (hg:15066), suspension-aware accrual, dunning-cascade
  (category error — the Book is player opex). **THE CONTENT-RETUNE RIDER:**
  the decks ship upkeep "0" PROVISIONAL — commissioning "small" numerics
  WILL re-derive the fourteen deckCardHash goldens and the boot.rules wire
  witnesses; that is the PROMISED-MOTION event, deferred BY DISCIPLINE, not
  by omission. ZERO shipped goldens moved (dormant-book ∧ ends-before-t420 ∧
  non-fold-host — immunity by import direction; reviewer PROVED non-vacuity
  with a live red-probe: 5 exact reddens).
- **(ii) Panel PRODUCTION arming — CLOSED (BUILT).** @`7510bac`: App.vue
  `bootClient()` — the repo's ONE `.boot` call site — boots the sim-core
  runner carrying `deck:watch-the-door` through the existing `boot.rules`
  wire rider, parsed at MAIN-thread module load (`runner/productionRules.ts`:
  ?raw → `parsePolicyDeck` → `bootRulesFromDeck`, fail-loud at module scope);
  opt-out switch `productionRulesArmed()/setProductionRulesArmed()` is a
  TESTS-ONLY lever; dormant twins `ca8863849cb3db32`/`780b1cbc61dff760` +
  money `25_005_307_300n`/`25_109_732_500n` BYTE-STAND; NEW armed pair
  `2a7a977a541b08a9`/`6a314d31f2f2f889` self-derived and disclosed;
  cold-aisle/sleepless NOT armed — the ruling arms the one mainline boot.
- **(iii) Versus doctrine adoption via content decks — CLOSED (BUILT).**
  @`fc18f2e`: `deckCardHash` is THE doctrine hash law (owner ruling verbatim:
  "kills the three-local-hash-laws drift risk permanently") — versus
  docblock-law + `doctrineDecks.test.ts` 13 its (LIVE deck→DefenseDeck→door-
  commit witness; wire-vs-revived BYTE-IDENTICAL doctrine commit; key-space
  disjointness BOTH directions; falsifiable source-read pin);
  `cd1296c54df0e9c6` UNMOVED; api-verify zero delta; the loader/decks.ts
  header adoption sentence lands with this closeout (lane-owed).
- **(iv) Scenario-run deck seam — CLOSED (BUILT).** @`304c9d0`:
  `ScenarioRunConfig.rules?: LoadedBootRules` (TYPE-only import precedent
  :136 — WORLD FACT NOT DOC DATA: a doc may never select its own book, the
  era/sellMarketRates posture); PRE-tick-1 `BAD_RULES` plain-Error walls
  (dup hash names BOTH positions; `ScenarioErrorCode` union untouched); the
  book rides the BASE door as a conditional `lookupPolicyCard` spread — the
  unarmed object is IDENTICAL (dormant byte-stand
  `8aca5ba270e51597bece5fafca361122`, re-derived by the reviewer at
  @`b59dbeb`); sparse `report.rulesArmed` echo; first upkeep bite ON-SCENE
  t420 −10_500_000n exact + floor-first 5M twin (card STAYS committed) +
  `freeCashDepleted` halt. The lane ALSO closed the era-grey DEAD PATH (new
  `eraPolicyCards` leg — grey-out had NEVER reached `composeEraPlan` at
  scenario altitude) and REFUSED the brief's "executed post-step" wording,
  pinning the opening-frozen law BOTH directions instead, disclosed.
- **(v) §1.6 epilogue prose — CLOSED (BUILT, content).** @`ed5bfa8`: the
  `pack:campaign.i18n` epilogue bank — 37 flavour lines: seven
  `codex.exit.<kind>` documents × {headline, body1-3, profile} + 2 framing;
  decision-0 / slots-0 under the new reserved-pack identity law (validator
  reserved-claim extension + TWO loader carve-outs placed BEFORE untouched
  throws; the fourteen line packs' messages byte-ident); provenance 32
  doc-anchored cites + 5 honest nulls; packs 14→15; loader falsifiers +2
  (`packs.test.ts` 14f/257→14f/259); validate TODO 413 UNMOVED / pack-markers
  16→18 / Key-literals 123 UNMOVED.
- **(vi) Exit meta-currencies — CONTENT CLOSED, MECHANICS WALLED.**
  @`ed5bfa8`: the seven `codex.exit.<kind>.profile` lines ARE the
  meta-currency NARRATIVE; engine meta-currencies stay a NAMED WALL —
  cash/reputation/scars remain kind-blind by design.
- **(vii) Family-targeted cards — NOT COMMISSIONED; stays a NAMED GAP.**
  Per-family observed cells still do not exist; cold-aisle's
  inferred-crossings workaround stands.
- **(viii) W28-04 exit-ladder taste rows — NOT COMMISSIONED; queue
  unchanged.** `exitKindFactorBps` + the slice-ORDER law stay PROVISIONAL,
  machine-pinned, ratified only by playtest.

**NEW asks (raised by the wave-29 lanes and this closeout's disclosures):**

- **(a) Content retune — upkeep "small" numerics. CLOSED @`3dd65cf`
  (wave-30) — see the live register above.** Was THE disclosed
  golden-mover: authoring deck upkeep moves the fourteen deckCardHash
  goldens, the boot.rules wire witnesses and the L-PA armed pairs
  automatically (hostile drift pins). Owner commission, content lane.
- **(b) Card-shed-on-nonpayment.** §7.14's lapse fiction is an ENGINE DESIGN
  wall: cards are rule-carriers with no ownership state — bolting lapse to
  the fold is a layer inversion. Own commission.
- **(c) Forward-charging refinement.** v0 bills only accrued-to-date at the
  roll; billing forward into the entering month is a design choice, not a
  bug.
- **(d) Per-minute droplet fidelity.** §4.1's "Upkeep Drip" (hg:15066) is
  presentation fiction over a monthly ledger; true per-minute journal lines
  per card are spam by construction. Ratify monthly or fund the drip fold.
- **(e) Suspension-aware accrual.** If a door-book suspend state ever lands,
  upkeep should pause under suspension — one docblock line until then.
- **(f) Endings-UI consumption of the epilogue bank.** The 37 voice lines
  ship; no proto/HUD lane renders them yet. Proto lane.
- **(g) Panel deck-picker beyond watch-the-door.** The armed mainline boot is
  hard-wired to `deck:watch-the-door`; a selector (cold-aisle/sleepless/
  user decks) is a UI adoption call — engine-ready.
- **(h) G7 wire-graph hygiene.** The proto index chunk carries the upkeep
  fold via the PRE-EXISTING App.vue→unattendedLab→`@hh/sim-core/unattended`
  →fastForward→`internal/tickFold` edge (W29-04 note — NOT introduced this
  wave; a lazy-boundary refactor only if size matters).

**Remaining owner walls (standing, restated whole, wave-29 posture):**
linear-branching RE-RATIFIED (campaign stays LINEAR) · the goal-card doc
field until a HUD exists · **ExitKind half-B — the cashSlice ARRIVAL math
stays deferred PER DESIGN** (the exit-edge slice + heir
`cashStart === slice` shipped wave-28; arrival-side recomputation at
inheritance is a named future leg) · tier-real mechanics beyond the door
verbs for the card-identity legs · corpus-in-campaign · the canvas inspector
· the PHP production carrier for co-op (Node-sidecar-only-if-MP) · the
render-harness numerics (OD-10/12) · slug-12 (data-only affix) · the
coverage deck-preview · the playtest mandate (ratify-on-playtest set stands,
W28-04 ladder included) · the in-flight-kill wedge (keep-defer;
bounced-and-attributed when built) · **boot.catalog stays named-not-taken**
(the wave-27 DEFER-RECORD unchanged; `SellCatalog` is still the only boot
catalog) · **c-7 STAYS catalog-less** per its own wave-27 disposition — its
armed sibling is the x-1 exit run-up (host catalog 40M/24M) CLOSED with the
exit program @`2c69d77`, do not re-raise · apprentice×communicate RATIFIED
2026-10-18b · era-probe RELATIVE RATIFIED · **credential audit CLOSED
2026-10-19 owner-side** (the owner is the second writer; the
ls-remote-before-push discipline stands as working practice) · **the
fifteenth-card CEASE (ADR-0017 #8) — RESTATED UNTOUCHED: wave-29 added ZERO
hosting types.**

## Fresh owner asks (2026-10-19, wave-28 closeout — the wave-27 six asks + walls dispositioned below; the eight NEW asks DISPOSITIONED 2026-10-19 by the wave-29 batch above ((i)-(vi) BUILT, (vii)-(viii) stand — (vii) named-gap, (viii) playtest queue); the live register is the section above; the type-program CEASE (ADR-0017 #8) and every standing STOP still standing)

**Dispositioned by the 2026-10-18b owner batch (wave-27 register kept intact
as history below):**

- **ExitKind bridge — CLOSED (BUILT).** @`ce2ec1c` + @`2c69d77`: campaign
  `exitKind` parse surface, scenario declaration + payout report, chain
  exit-edges. Seven kinds ship in doc order; ipo/management-buyout/wind-down
  are RESERVED (refused at campaign parse — the documented division vs
  valuation carrying wind-down at factor 0).
- **exit-EDGE cashSlice + valuation — CLOSED (BUILT).** @`980ab58`..@`2c69d77`
  as one money-at-the-end program; the heir's `cashStart === slice` witness and
  the arm==unarmed digest-IDENTICAL ×5 clamp test are on disk.
- **WARCT leg — CLOSED (BUILT).** @`980ab58` `tenantWholeLeaseValueMicroUsd` —
  the wave-27 DEFER was UN-FROZEN by the same batch. The reserved-vs-spot
  eviction discount stays a NAMED-FUTURE leg (hg:24894-24896) — recorded,
  not forced.
- **sell-acceptance dice — CLOSED as VERIFIED-SHIPPED @`24f90bc` (record).**
  The engine's acceptance roll already existed; the wave verified, added no
  code.
- **G7 content-decks program — CLOSED (BUILT).** @`a498a49`·@`2cdf014`·
  @`9948681`·@`34bb32e`; the investigate-first recon converged into four
  non-overlapping lanes exactly as the program's protocol demands.
- **proto empty-map collapse — CLOSED.** @`7357b85` (`?raw` source-pin +
  twin; boot/money goldens byte-stand; the scenario `984759b` law mirrored).
- **repro synth-marker cure — CLOSED.** @`04c0d7e` (player untouched; the
  repro digest `de1d4c0f941333eb` + 27-frame census UNMOVED; vitest surface
  100/8 UNCHANGED — the clone owns zero new authority).
- **tools/perf A/B re-baseline — MEASURED (no commit).** db64667→04c0d7e:
  worker 953.40→954.78 kB · index 1,671.91→1,673.67 kB · fakeWorker + CSS
  flat (W28-03 NIT on record: the A/B was measured at 04c0d7e, not re-measured
  at the final tip; end-state numbers are exact).
- **noc-shift seat REUSE — RATIFIED** as a standing tour device (the V1
  honeymoon alternative stays on record, probed and superseded).
  **author-and-delegate — RATIFIED.** **Relative era hexes — CONFIRMED.**
  **Playtest posture + era-mechanics freeze — RATIFY-RECORDED.**
- **boot.catalog — DEFER-RECORDED** (the exact boot.corpus/boot.rules shape
  stays the named-not-taken candidate).
- **c-7 catalog-armed variant — DEFER-RECORDED: c-7 STAYS catalog-less.**
  The never-certain census [4,0]×4+[3,1]@off2 SURVIVES the exit program
  untouched @`2c69d77` — the witness holds.
- **Fifteenth-card CEASE — RESTATED UNTOUCHED.** Wave-28 added ZERO hosting
  types.

**NEW asks (raised by the wave-28 lanes and this closeout's disclosures):**

- **(i) Upkeep BILLING fold — NEW NAMED OWNER WALL.** The decks ship
  `upkeepMicroUsd: 0n` PROVISIONAL; a real upkeep fold would be a
  money-ledger fold ⇒ golden-moving by construction ⇒ its own
  owner-commissioned program. Named, unbuilt, deliberately not smuggled into
  the content-decks wave.
- **(ii) Panel PRODUCTION arming of decks.** The seam is fully live —
  schema→loader→`bootRulesFromDeck`→`boot.rules`→worker→armed rule phase is
  PROVEN end-to-end @`34bb32e` — but production stays UN-ARMED BY DECISION
  (no panel passes rules). Successor to the wave-25 "G7-mainline adoption"
  ask: the mechanism is done, the adoption is the owner call.
- **(iii) Versus doctrine adoption via content decks.** The shared hash law
  now exists (`deckCardHash` is boot.rules wire-form-identical, pinned
  @`2cdf014`); a versus `DefenseDeck` could pin content-deck cards by the
  same hash. Design call — deck-vs-book authority — owner's.
- **(iv) Scenario-run deck seam.** `runScenario` still takes host-supplied
  policy books; a `deckId` host seam (loader-parsed → `bootRulesFromDeck` →
  the existing `rules` door config) would let scenarios ship WITH decks.
  Named, not taken — zero engine change needed beyond host plumbing.
- **(v) §1.6 epilogue prose per exit kind.** The engine now returns
  `exitKind` + `exitPayout` truth; the SEVEN epilogues are content
  (pack/HUD authoring). Writer commission, not an engine gap.
- **(vi) Exit meta-currencies.** §1.6 promises "a different meta-currency
  profile" per exit kind; the engine has none (cash/reputation/scars are
  kind-blind). Design ask — could ride (v) or stand alone.
- **(vii) Family-targeted cards.** Rule cards match lane/metric keys;
  family-targeted triggers need per-family observed cells that do not
  exist in the engine. Named gap — the cold-aisle advisory deck had to work
  around it via inferred lane crossings (per-card `_todo`).
- **(viii) W28-04 — the exitKindFactorBps ladder joins the
  ratify-on-playtest queue.** `economy/config.ts` exit ladder
  (10000/10000/9000/8000/7000/5000/0 bps across the seven kinds) + the
  slice-ORDER law (Π(diligence) → clamp → kind-factor) are PROVISIONAL
  taste rows — correctly labeled, machine-pinned in the 20/0 census —
  ratified only by playtest per standing posture.

**Remaining owner walls (standing, restated whole, wave-28 posture):**
linear-branching RE-RATIFIED (campaign stays LINEAR; the Pivot-Map
supersession stays shelved) · the goal-card doc field until a HUD exists ·
corpus-in-campaign · tier-real-mechanics beyond the door verbs for the
card-identity legs · the PHP production carrier for co-op
(Node-sidecar-only-if-MP) · the canvas inspector · the render-harness
numerics (OD-10/12) · slug-12 (data-only affix, zero live consumers) · the
coverage deck-preview · the playtest mandate (ratify-on-playtest set stands
and GREW by the W28-04 block) · the in-flight-kill wedge (keep-defer;
bounced-and-attributed when built) · **credential audit — URGENT
(standing)** · **the fifteenth-card CEASE (ADR-0017 #8) — RESTATED**.

## Fresh owner asks (2026-10-18, wave-27 closeout — raised by the wave-27 lanes and this closeout's disclosures; DISPOSITIONED 2026-10-19 by the wave-28 batch above — the three hygiene asks CLOSED (@`7357b85`/@`04c0d7e`/A/B MEASURED), noc-shift RATIFIED, boot.catalog + c-7 DEFER-RECORDED, the money walls BUILT or dispositioned; the live register is the section above; the type-program CEASE (ADR-0017 #8) and every standing STOP still standing)

- **The noc-shift seat REUSE — ratify-or-cure.** L-A2 closed Act II at twelve
  beats by seating the tour's FIRST perspective reuse (`b6187c4`): lawful under
  §1.9 (lint = roster membership + cadence + cap-1; `PERSPECTIVE_EXPRESSIBILITY`
  is per-perspective), and the ONLY arithmetic path to every act at the per-act
  floor of two. The V1 honeymoon alternative was probed and SUPERSEDED — both
  recorded in ADR-0019's wave-27 rider. Ratify reuse as a standing tour device,
  or commission a cure chapter; this was the standing owner-taste row the
  orchestrator ruled on, disclosed here rather than buried.
- **`boot.catalog` rider.** `adc8b64` names the exact candidate: if the owner
  wants market catalogs ACROSS the worker wire, the boot.corpus (`1165368`) /
  boot.rules (`9653a96`) shape is the precedent — additive-optional,
  omit-when-unset, PROTOCOL_VERSION stays 1. v0 deliberately keeps the catalog
  host-side; the runner option never crosses the wire.
- **c-7 catalog-armed variant.** The sell run-up chapter STAYS catalog-less by
  the never-certain law — its verdict census [[4,0],[4,0],[4,0],[3,1],[4,0]] is
  the witness; arming a catalog into it would MOVE that census. Owner commission
  required, not silently available.
- **proto empty-map collapse symmetry (cosmetic).** The scenario leg collapses an
  EMPTY `sellMarketRates` map to key-free absence (the `984759b` law); the proto
  runner spreads presence-only, so an empty Map rides through but is
  behaviorally identical (pinned `simCoreRunner.catalog.test.ts:125-128`).
  A symmetric collapse would be tidier; nothing depends on it.
- **repro-script synth-marker validation gap (F1 NIT hygiene).** The CI player
  parses and counts the `synth` carrier-authorship markers (§2.12) on `in`
  lines; the `db64667` repro clone routes the same fence WITHOUT validating the
  marker. A cure touches the edit-together pair (repro router + player), so it
  rides here as a hygiene commission — the pair's falsifiability is already
  pinned by the doc-mutation probes.
- **tools/perf A/B re-baseline of the proto build vs `db64667`.** The L-ENV A/B
  ran against `a8b7eae`; the wave chain since relocated ≈+1.22 kB of worker
  bytes (per-lane disclosures: 953.40→954.62 at `a757f6c`, →954.75 at
  `adc8b64`). One `tools/perf ab` pass keeps the build ledger current —
  measurement hygiene, no code change.
- **Remaining owner walls (standing, restated whole):** branching campaign /
  Pivot-Map ADR supersession · the goal-card doc field · the seven §1.6 ExitKind
  bridge (endings v0 @`61a1c3b` deliberately never reads it; exit-EDGE cashSlice/
  valuation math stays a wall) · tier-real-mechanics beyond the door verbs for the
  card-identity legs · corpus-in-campaign · the PHP production carrier for co-op ·
  the canvas inspector · the apprentice×communicate author-and-delegate reading
  (wave-25 register — STANDS) · the era-probe witness hexes staying RELATIVE
  (wave-25 register — STANDS) · **credential audit — URGENT (standing)**.

---

## Fresh owner asks (2026-10-18, wave-26 closeout — the two build-asks CLOSED 2026-10-18 by wave-27 above; the walls bullet now rides the wave-27 restatement; the live register is the section above)

- **BootRules envelope-type symmetry (hygiene).** boot.rules ships full `PolicyCard`
  documents over the wire (Option A) while other boot riders keep dedicated
  `*Wire` mirror types; a symmetric `BootRulesWire` envelope is a typing tidy-up —
  the mechanics are DONE and pinned, nothing here re-opens `9653a96`.
  **CLOSED 2026-10-18 @`a757f6c` — `ToWorker.boot.rules` is now `BootRulesWire`
  (symmetric with corpus/build); revival moved to `workerRulesLookup` (E2b
  single-builder for sim.worker + fakeWorker); every shape wall preserved
  field-path-for-field-path; POSTED JSON byte-identical (2,124-byte cmp proof vs
  `a8b7eae`); boot goldens `ca8863849cb3db32`/`780b1cbc61dff760` BYTE-STAND;
  `SimClient.boot` still takes trusted `BootRules` — encode-at-send-boundary.**
- **`sellMarketRates` catalog leg.** The sell-verdict predicates (`c6b69a4`)
  adjudicate against the host threshold alone; the §1.5 diligence-era market-rate
  catalog is unbuilt content+economy work awaiting owner commission.
  **CLOSED 2026-10-18 @`adc8b64` as HOST LEGS (wave-26 minor #4 as commissioned):
  `ScenarioRunConfig.sellMarketRates` + `SimCoreRunnerOptions.sellMarketRates`,
  config-only — NO boot field, NO doc field (the runner's self-grading refusal
  law survives RELOCATED: the doc may never carry a market feed, the host may
  read one; era precedent); pre-tick-1 `scenario[BAD_MONEY]` seam wall; flip
  direction pinned from ENGINE truth (catalog ABOVE offer ⇒ accepted). c-7
  deliberately catalog-less (never-certain witness UNTOUCHED); the content-side
  §1.5 market-rate catalog COPY stays owner-future, and the `boot.catalog`
  wire rider is the named candidate in the live register above — not taken.**
- **Remaining owner walls (standing, restated whole):** branching campaign /
  Pivot-Map ADR supersession · the goal-card doc field · the seven §1.6 ExitKind
  bridge (endings v0 @`61a1c3b` deliberately never reads it; exit-EDGE cashSlice/
  valuation math stays a wall) · tier-real-mechanics beyond the door verbs for the
  card-identity legs · corpus-in-campaign · the PHP production carrier for co-op ·
  the canvas inspector · **credential audit — URGENT (standing)**.

---

## Fresh owner asks (2026-10-18, wave-25 closeout — ALL SIX ANSWERED 2026-10-18 by the wave-26 owner ruling; dispositions inline; the live register is the section above)

- **G4GatePanel `#9aa7b8` plate-mix unification.** L-RATIFY retired the literal from G7 (now `var(--hh-hue-grey)`@88%, AA-passed) but G4's documented gate-local plate-mix (:602/:617) keeps its own copy — wave-24 F-4 named only the G7 pair. One ledger consumption point or a sanctioned second site: owner taste. **CLOSED @`d197917` — unified onto the ledger grey (fade 0.7→0.95); zero bespoke plate hexes repo-wide, one consumption point.**
- **Apprentice×communicate strict-alternative.** The seat KEEPS communicate on the campaign's author-and-delegate reading (§1.2 :1479 "junior team members execute actions under supervision"; chapters.ts asserts communicate executes x4). A strict "apprentice decides nothing" reading bans it (ban would be 17) — flipping requires re-authoring the apprentice chapters. Ruling only if the reading is contested. **STANDS — Act III rode the seat as authored; no ruling sought.**
- **Act II→full-12 seat-floor cadence.** 7-of-12 authored per the proportionality law; the §1.9 per-act floor (2) vs every-5 global cadence tension is recorded (ADR-0019 program 3 note; chapters.ts:475). Resolve when the act completes. **STANDS for Act II — and Act III resolved its OWN arithmetic at nine beats (§1.9 rider @`5e9be02`: 8 beats force a seat-gap of 4 under the every-5/cadence law; 9 land idx 21/26 with gaps 5/5, the first act honoring the per-act floor of two). CLOSED 2026-10-18 @`b6187c4` (V2): Act II completed at twelve beats — b-11 the-prevention-shift REUSES the noc-shift seat, the tour's first perspective reuse and the ONLY arithmetic path to every act at the per-act floor of two; seats {4,10,16,21,26,31} gaps {6,6,5,5,5}. The reuse was an orchestrator ruling on this standing owner-taste row — disclosed as the live register's ratify-or-cure ask; the V1 honeymoon alternative is on record, probed and superseded.**
- **Era TRANSITION mechanics.** `eraYearAt` is a v0-constant seam BY RULING (R66); mid-run era flips — and the greyed-card question "do already-built nodes with the retired tech degrade?" — are the named follow-on when the owner commissions transitions. **CLOSED @`58fddc3` — transitions BUILT: host-forwarded step function over the business clock, inclusive at the step minute, gates armed from t0, card-grey OPENING-FROZEN as a named limit; the degrade question stays doc-side (retirement `to`-legs fixture-only, R66 holds).**
- **`boot.rules` proto arm.** L-G7M shipped the runner seam with production UN-ARMED by decision; arming a panel (G7-on-mainline or the Act row) is the owner's adoption call. **CLOSED @`9653a96` as ARMED-ABLE: Option-A full-card codec on protocol v1, omit-when-unset, armed goldens byte-stand; a production panel passing `rules` remains owner ADOPTION, not mechanics.**
- **Era-probe witness hexes stay RELATIVE.** `6aecd417…`/`38e72c42…` appear only in test TRAIL lines (self-derived witnesses, relative-by-design like the Act-II trio) — they are NOT pinned authority; record before anyone "verifies" them against disk. **STANDS — and wave-26 added its own self-derived trail hexes the same way (era-transitions pristine trio `6aecd417…`/`38e72c42…`/`7688b0ee…`, probe method disclosed); relative-by-design now covers the era-transitions twins too.**

## Fresh owner asks (2026-10-18, wave-24 closeout — ALL EIGHT ANSWERED 2026-10-18 by the session-9 SECOND ruling (ADR-0019); dispositions inline; the live register is the section above)

- **`canExecute` door-hook wall (perspective ceiling).** §1.2 perspectives v0 ban ONLY what existing seams cover — the 5 validator-guarded verbs via `can*` callbacks + policy-card commits via `lookupPolicyCard: () => null`. Fourteen verbs (connect/disconnect/configure/shed/communicate/toggle/shield/scale/maintain/schedule/isolate/throttle/restart/reclaim) have NO refusal hook today; a true "you cannot do this" perspective needs a `canExecute`-style door predicate — engine design, owner ruling before a lane builds it (ADR-0018 remit). **CLOSED 2026-10-18 (ADR-0019 program 1): the hook is BUILT @`a828379` (consulted on every verb-carrier AFTER resolution and BEFORE payment; refusal = state IDENTITY; host reason VERBATIM) and rode through wave-25 twice — perspectives FULL POWER @`817c82c` (all 19 bannable, the v0 ceiling retired, ban arithmetic noc 3 / datacenter 15 / support-queue 17 / apprentice 16 / red-team 0) and the era veto @`22717d2`. The 46-phrase refusal census rode UNPAID through programs 1/4/5.**
- **`composeSignalRows` RangeError guard TICKET.** L-CP3 hit it while authoring the Act-I thresholds/chargeback shelf; the leg was DEFERRED rather than forcing a fix into a content lane (chapters.ts comment names it). Small pipeline/scenario hygiene ticket — buildable without a ruling, unqueued. **CLOSED 2026-10-18 (ADR-0019 program 2, L-GUARD @`075a840`): the true cause was the step-8.5 mirror cash leg postEntry bypassing BOTH insolvency guards — fixed refuse-not-overdraft (the tickFold opex law reused verbatim, same `<` boundary: free == fee pays); `chargebackFeeRefusals` rides ScenarioReport SPARSE; falsifiers both directions (bridge seeds crash→win@200 1-refusal; authored-opening end digest EQUALS the pre-fix capture). Campaign adoption additionally PAID by Act II's `b-7` re-home @`e060e97` (the flip arm is a LIVE chapter winning @200 with the refusal on the rail).**
- **Succession needs a death-in-shape doc for Act II.** The chain law + `applyInheritanceManifest` re-spend refusal are LIVE @`5d0577b`, but NO chapter doc dies in-run yet (campaign win-ledger is 8/8 win-as-authored), so the manifest+museum flow rides tests only. Act II commissioning = owner call. **CLOSED 2026-10-18 (ADR-0019 program 3, L-CP-A2 @`e060e97`): Act II authored as the 7-of-12 proportional slice; `b-4` DIES in-run on the real ledger (mrc-0 float death @73; falsifier survives on a 600 Mµ$ bridge — the death is ENGINE truth) and SUCCESSION walks settle → null-cash slice → waf-tier-4th-node → museum, re-spend THROWS. Permanent walls recorded: covenant/review-bomb cannot-die-on-wire, change-freeze/threshold-day win UNDEAD, ransom corpus-wall a re-ride gate.**
- **Mechanics-on-era DESIGN program.** Ruling 1a bought COPY + SKIN at four rungs; the spec's promise that eras change MECHANICS (R66 bundle-dating, era-gated verbs/sliders) remains unbuilt and unscoped. **PILOT-CLOSED 2026-10-18 (ADR-0019 program 4, L-EM @`22717d2`): the available-tech leg is LIVE — typed `eras.availability` windows resolving row → bundle-date → undocumented-allowed, the run-frozen verdict as the OUTERMOST door veto (zero-gate-no-key byte-stand), card-grey via the wrapped `lookupPolicyCard` seam, wire #31 proves the arc, host `--era` exposes it. `eraYearAt` is the NAMED transitions seam (v0 constant BY RULING). Threats/costs/customer-base/the §5.6 lattice stay UNCOMMISSIONED — design asks, not gaps.**
- **G7-mainline-runner adoption.** The G7 engine slice ships as door config + panel; `SimCoreRunner`'s default loop does NOT re-feed rule carriers — mainline adoption (vs the gate-panel harness) is a posture ask. **CLOSED 2026-10-18 (ADR-0019 program 5, L-G7M @`9748ee4`): the rule phase rides `SimCoreRunner` as an opt-in `rules` runner-option (PROTOCOL v1 untouched; off-path boot/money goldens hold ARMED; 4 frames byte-equal off≡on; worker +12.68 kB disclosed honestly). Production stays UN-ARMED BY DECISION — no panel passes `rules` yet; `boot.rules` is the deferred arm (live register above).**
- **G7 panel ghost-hues #b49ce8/#9aa7b8 ratify (review F-4).** Two off-ledger panel tones shipped inside @`0e41e64` as PLACEHOLDER veil/silence tints for the hidden-board and no-rule-fired rails; the hue ledger has no jobs for them. Ratify onto the ledger or re-skin — owner taste, NOT silently folded. **CLOSED 2026-10-18 (ADR-0019 program 6, L-RATIFY @`7fed0c4`): `rule-ink` 0xb49ce8 joins the ledger (16 jobs, NOT alert-pool — DOM identity); `#9aa7b8` retired from G7 to `var(--hh-hue-grey)`@88% with AA math done (4.20→4.92), ghost trough .62→.68 (the 4.45 blink dip cured), green wash→stroke frame, prefers-reduced-motion guard added; `DECISION_*` consts RATIFIED (values byte-ident). G4's OWN `#9aa7b8` plate-mix survives — unification is a live ask above.**
- **Contract-trace player-follow-on witness.** CARRIER-CONTRACT §2 RUNG-1's 57-line witness exercises host+relay ordering; a PLAYER-origin follow-on leg (intent executed, then same-seat action) is recorded as owed — the current trace stays relay-fed. **CLOSED 2026-10-18 (ADR-0019 program 7, L-TP @`df05b7c`): the named follow-on lane is DELIVERED — `tools/transport/test/carrierTrace.test.ts` parses the 57-line §4.1 fence AT TEST TIME and drives the real hub over the synchronous TransportPort (the doc IS the fixture); the trace's post-catch-up same-seat legs (alice/bob/carol each act again after their join/execute) replay every CI run: 27 out-frames byte-equal in GLOBAL fan order, the `end` witness, `timelineDigest` de1d4c0f941333eb pinned. Falsifiable: three doc-mutation probes fired red and the doc was restored byte-identical; the src/ 8-file roster stayed untouched.**
- **Era bundle-dating (R66) owner input.** Bundles still carry zero era-membership metadata; the 2026≡fallback law makes every line speak every era. Whether bundles should DATE themselves (availableFrom/obsoleteBy at bundle grain) is R66 — owner input, not engine branching. **CLOSED 2026-10-18 (ADR-0019 program 8, L-DATES @`f5faced`): the dating law is QUOTE-ONLY — a date lands ONLY where a dated doc sentence is quoted verbatim in the consuming `_todo`; exactly ONE date landed (colo 2001, the §0.4 grid sentence), four verdict-appended nulls, eight untouched; the shared-web 2009-grid vs §9.1-2003-genre divergence RECORDED-not-resolved (shelf-vs-genre authority — still owner's if contested). The era pilot @`22717d2` then consumed the dated shelf for the availability leg — R66 discharged as a LAW plus one quote-derived date, not a forge-fest.**

## Fresh owner asks (2026-10-17, wave-21 closeout — raised by the wave-21 lanes, none is a reopening)

- **FIFTEENTH type card — OWNER LAW CALL — CEASED 2026-10-17 (owner ruling 1a, ADR-0017 #8): the TYPE PROGRAM STOPS at fourteen; no fifteenth lanes unless the owner re-arms; exhaustion stays LAW for any future card. The candidates below stand as RECORD, not queue.** ANSWERED for the fourteenth: `official:ci-build-farm`
  "Green Light" claimed **Reclaim** @`a47a9b5` (eighth extended verb / fifth amendment @`ff8615c`; first
  §1.4-founded card, first door-before-card landing — ADR-0017 #1; the CI/build-farm→Isolate MERGE
  question was mooted by claiming the card's THIRD word instead). The roster is EXHAUSTED at six
  invariant + eight extended, ALL claimed. Candidates for the fifteenth: repeat-law MERGEs
  (GPU/HPC/satellite→Schedule), throttle-claimant cards (the door mechanic exists, off-roster), §7.5
  incident-vocabulary cards (failover/roll-back/escalate — design-space, none rostered), or STOPPING at
  fourteen. `expire` was ruled off-roster WITH the fourteenth (read-time expiry double-naming argument);
  any named successor still needs its own owner bless.
- **HUD affordances ×3 (door verbs without faces).** `isolate-node`/`throttle-node`/`restart-node` ship
  with no inspector surface: (1) Act-row chips on the node inspector (the §7.16 Act-row is now ALL-FOUR
  live in the door but only isolate/throttle have a spec sentence to render against); (2) the dbaas
  utilization-donut needs fence (solid ring) vs clamp (ghost ring) render states per the throttle
  legibility law; (3) the serverless warmth METER (the cost seam @`1efe12a` now bills — the card promises
  "you are buying the absence of a stutter", the HUD shows nothing). **PARTIALLY CLOSED 2026-10-17
  (ADR-0017 #3, lane L-HUD @`a28e764`): the Act row is PLAYER-FACING in the prototype — ACT chips
  drain/restart/isolate/shed + DESK readouts throttle/reclaim/warmth/shield on the lab stepper, one
  mint site through the door grammar alone (+33 its). The WORLD-CANVAS inspector and the donut
  fence/clamp ring renders stay OPEN — WAVE-23 @`945fba6` additionally rode the Act row onto the G4 drag-a-cable board (DOM panel) through the real door, and ratified the desk numerics (ADR-0017 #6).**
- **Per-tenant WARCT valuation leg DEFERRED.** The relationship ledger @`5e8ce75` landed the trust meter;
  §1.3 "Amps and Aisles"'s "what is this tenant worth across the whole lease" (WARCT) valuation leg is an
  owner-recorded DEFERRAL (ADR-0016 #8), not a gap.
- **In-flight-kill DEFERRED (restart).** `restart-node`'s fence+flush shipped; killing a request already
  mid-service wedges step-5 attribution (wedge-state analysis pinned in `pipeline/restart.ts`);
  needs a design ruling before a lane builds it (ADR-0016 #5).
- **Coverage-strength affix leg.** **CLOSED @`2b63795`** (ADR-0017 #2). Original ask: §2.13 mix-ins parse-inert
  in the Coverage Grid. Resolution: `coverage/affixLegs.ts` `AFFIX_COVERAGE_NULLIFIES` — five doc-named
  grid columns nullify per the section's OWN rows (distributed→Meter, encrypted→Classify, low-slow→Detect,
  adaptive→Deter, piggyback→Absorb), eleven HONEST nulls (three doc rows name non-grid defenses incl. the
  RECORDED rate-shaped contradiction; eight slugs unmapped), drift-pinned mirror of versus `AFFIX_VOCABULARY`,
  zero import edge. The coverage-preview proto leg stays deferred (fresh ask above).
- **Driver re-mint attribution (cross-lane ticket).** **CLOSED @`cbf53a4`** (ADR-0017 #5). Original gap:
  `re<mint>@<tick>` arrivals wore no lineage label and scored `unattributed` — grammar-forced. Resolution
  is NOT wider labeling: the driver mints `reentry` SimEvents at maturity (child/retryOf/lineageRoot/
  retryDepth; union 11→12; ZERO state bytes so every digest is immune by construction) and the versus
  fold labels from them — floor 1,040×3-seed saturation → ZERO (three floor pins flipped disclosed;
  conservation invariants unmoved; viral deaths stay unattributed BY DESIGN).
- **Slug-12 maintenance-window consumer.** `piggybacked-on-a-maintenance-window` ships DATA-ONLY
  (`live:false` in `AFFIX_WAVE_DELTAS`) with a written future spec (`DefenderCommit.maintenanceWindows`);
  activation needs its own ADR item (ADR-0016 #2).
- **PHP/Workerman production carrier (co-op).** The in-repo transport v0 @`0da14b8` proves the wire;
  the production socket carrier, latency modelling, per-seat fog POLICY, and page-size policy are
  out-of-repo until the owner opens the lane (ADR-0016 #3). **PARTIALLY LANDED 2026-10-17 (ADR-0017 #4):
  the BROWSER seat client @`96bd238` (seven interface truths honored, idempotence proven over real sockets)
  + `tools/host` thin Node DEV carrier @`af55b61` (ws 8.22.0, maxPayload carrier-close 1009, localhost-no-auth
  by ruling) landed in-repo; the PRODUCTION PHP/Workerman carrier, per-seat fog and paging policy stay
  out-of-repo.** **WAVE-23 (ruling 3b, ADR-0017 #7 @`61efe31`): topology (a) CLOSED IN-REPO — `tools/host --sim` runs the host-owned engine + fog over the `publish()` seam; production carrier/auth/paging POLICY stay the out-of-repo ask; the browser thin-client view-rider is NAMED-owed (bullet below).** **WAVE-24 (ADR-0018 1d): dev-grade auth LANDED @`2b0a882` (opt-in token, 1008 refusal, auto-leave default-ON) and the production CARRIER OBLIGATION is AUTHORED — `tools/transport/CARRIER-CONTRACT.md` @`b830aee`; the PHP BUILD itself stays out-of-repo.**
- **Browser thin-client view-rider consumption (topology (a)).** The per-seat fogged rider fans host-side via `hub.publish()` @`61efe31` (ADR-0017 #7) and the browser half of the wire exists @`96bd238`+`945fba6`; what no browser yet does is mount the RIDER's projected cells into its HUD in place of the local sim — the named next rung, awaits a proto seam. **PAID 2026-10-18 (ADR-0018 1d @`5e87477`): `coopSeatView`/`wireView` + the CoopRoom THIRD fog column mount the rider read-only (existence-absent/honest-null witnesses; deviation disclosed: `wireViewSeenAt` measures the LOCAL pump).**
- **PROVISIONAL register (ADR-0016 #10, SPLIT 2026-10-17 by ADR-0016 #11 @`e2a1bba`):** the game-balance
  half — sell acceptance dice ×5, warmth rate $25/slot-mo, relationship ×11 trust deltas, door occupancy/
  hand rows across the eight verbs — is **RATIFIED 2026-10-17**; the transport taste caps (frame 65_536 /
  log 10_000 / page 64) + PROVISIONAL-B-style residue **STAND PROVISIONAL** by ruling. Wave-22 additions
  JOINING the register (ADR-0017 #3): reclaim-node occupancy/hand 1/1 (the #11 register CLOSED before the
  verb existed), `RESTART_WINDOW_MINUTES = 5`, lift-at-next-boundary desk ergonomics — ratify-on-playtest. → **DISCHARGED 2026-10-18 by ADR-0017 #6 @`f6f1d4b`: the game-feel half of the register (affix costs, Negotiation bumps, coverage mid-band, reclaim door rows, Act-row desk numerics, family-law sweep) is RATIFIED 2026-10-17 — values byte-zero; the transport-caps opt-in note STANDS.**

### Wave-21 asks — disposition (answered by session-8 / wave 22; preserved as record)

- FOURTEENTH type card → **LAW CALLED + BUILT** — `official:ci-build-farm` on Reclaim @`a47a9b5`
  (ADR-0017 #1; roster fifth amendment `ff8615c`, spine `c8b92a2`); FIFTEENTH = fresh law call (row above).
- HUD affordances ×3 → **PARTIALLY CLOSED @`a28e764`** (Act row player-facing on the lab stepper, ADR-0017 #3;
  world-canvas inspector + donut rings + warmth meter render still open).
- WARCT valuation leg → **DEFER STANDS** (ADR-0016 #8; not built this wave).
- In-flight-kill (wedge) → **DEFER STANDS** (ADR-0016 #5 wedge-state rationale governs).
- Coverage affix leg → **CLOSED @`2b63795`** (ADR-0017 #2).
- Driver re-mint attribution → **CLOSED @`cbf53a4`** (ADR-0017 #5).
- Slug-12 consumer → **DEFER STANDS** (data-only; activation needs its own ADR item).
- PHP/Workerman production carrier → **PARTIALLY LANDED** (ADR-0017 #4: browser client `96bd238` + dev
  carrier `af55b61` in-repo; production carrier/fog/paging out-of-repo).
- PROVISIONAL register → **SPLIT-RATIFIED** (ADR-0016 #11 @`e2a1bba`: balance half RATIFIED, transport caps
  STAND) + wave-22 additions joined (ADR-0017 #3).

### Wave-20 asks — disposition (all five answered by session-7; preserved as record)

- Per-tenant relationship meter → **CLOSED @`5e8ce75`** (mechanic A, ADR-0016 #8).
- Warmth COST host-seam → **CLOSED @`1efe12a`** (mechanic C, ADR-0016 #4; disclosed gap: no ship host
  mints a Scale book at run-start yet — the seam is future-ready).
- Offer ACCEPTANCE dice → **CLOSED @`24f90bc`** (mechanic B, ADR-0016 #9; door still moves no money).
- Versus-deck design laws → **RESOLVED max-feature** (ADR-0016 #2 @`0ae760b`+`eb4b86a`).
- Co-op transport → **LANDED in-repo to its frame @`0da14b8`** (ADR-0016 #3); production carrier stays
  the out-of-repo ask (row above).

## Config-knob summary (what must fail loudly, not default silently)

| Knob | OD | Default |
|---|---|---|
| `scorecard.weights` | OD-1 | **"commitment-convergence" ACTIVE (`24dfcfe`)** |
| `tuning.sheet` | OD-2 | **"B" ACTIVE (`24dfcfe`)** |
| `tuning.monthLengthRealMin` | OD-2 | **7 KEPT — 4-min flip declined (shipped default was already correct)** |
| `content.threatVisitorCensus` | OD-3 | **~200 mechanical threats — option (a) (`ea7acee`)** |
| `mp.topology` | OD-5 | **(b) TS-portable-library RATIFIED (`ea7acee`)** |

**Owner-decision checkpoints from the build order (§7.8 step 9):** OD-2 before G1 calibration ends · OD-1 before the G5 score-screen build · the OD-4 batch before G3 wording and before interpreter freeze · OD-5 anytime before slice (d) hardens — nothing in gates 1–7 waits on it. ← **ALL MET 2026-10-09**: the OD-1/OD-2 flips landed `24dfcfe`, the OD-4 batch recorded `ea7acee`, OD-5 ratified `ea7acee` (queue item 9 flips ARCHITECTURE §10). Remaining knob-less tuning taste (the UNNAMED PROVISIONAL constants — the ~40-constant OD-2 economy pile, unattended thresholds, coverage rows, audio audition, era expansion — stays open; the NAMED session-3 sets are RATIFIED 2026-10-16, ADR-0014 #D4; **the remaining OD-2 economy pile + unattended thresholds joined the RATIFIED set 2026-10-17 per ADR-0015 #1 @`4c6f827` — what is left of this residue is coverage-row taste, audio audition, and era expansion — the `PROVISIONAL-B` re-author CLOSED 2026-10-17 @`caa4d17` (ADR-0016 #1), while the NEW ratify-on-playtest register (ADR-0016 #10: sell 5, warmth 1, relationship 11, transport taste, throttle/restart 1/1) joined it**) — see PHASE1-PLAN "Still OPEN".
