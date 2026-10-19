# ADR-0019 — Owner session-9 second ruling (2026-10-18): the wave-25 depth program on the settled surface — the general `canExecute` door hook is BUILT and perspectives go FULL-POWER (19/19 bannable, roster spec-complete), the chargeback-shape funding bug is fixed by REUSING the opex refuse-not-overdraft law, Act II lands with the campaign's FIRST authored company death narrated on the real succession ledger, the era axis gets its mechanics PILOT (available-tech gates the door; `eraYearAt` is the named transition seam), the G7 rule phase rides the MAINLINE runner as an opt-in seam, the G7 panel hues are RATIFIED onto the ledger (rule-ink joins; plate grey honors it), the CARRIER-CONTRACT trace becomes an EXECUTABLE gate (TS trace-player, doc=fixture, zero drift), and era bundle-dating is ruled QUOTE-ONLY (colo 2001 is the only date the doc verbatim-grounds; every other null carries its verdict)

## Status
**Accepted (2026-10-18); ridden 2026-10-18 by the wave-26 closeout (programs 4/5 follow-ons + the second-session rider below).** Owner ruling, verbatim: **"go with recomendations"**
(owner's spelling preserved) — the standing eight-item wave-25 agenda, executed
ENTIRELY per the closeout's recommendations, letter-for-letter:
**1 = BUILD the general `canExecute` door hook** (then generalize the
perspective bans onto it), **2 = FIX the `composeSignalRows` funding bug**
(reusing the landed money-lane law, not inventing a new guard), **3 =
COMMISSION Act II** — and it must contain a REAL authored death, **4 = era
mechanics as a PILOT**, available-tech leg only, **5 = ADOPT the G7 rule
phase into the mainline runner**, opt-in, **6 = RATIFY the G7 panel hues**
onto the ledger, **7 = BUILD the TS trace-player** so CARRIER-CONTRACT §4.1
runs as a gate, **8 = era dating QUOTE-ONLY** — a bundle may carry a date
only where the spec sentences name one.

This record was authored at CLOSEOUT, after the build landed — and, for the
FIRST time in the program, AFTER the chain was also pushed (Consequences
carries the incident-#6 record). Every number quoted below was verified
against disk at tip `22717d2` (nine-commit chain atop `7c2a13e`).

**Citation form.** Code sites cite this record as `ADR-0019 program N` with
N ∈ 1..8 — the grep-able census on tracked files at this closeout:
program 1 ×14 · program 2 ×5 · program 3 ×3 · program 4 ×17 (sixteen as
cited by the lanes, plus ONE hyphen-form `program-4` normalized to the spaced
form by this closeout — comment-only, in `scenario/eraAvailability.ts`) ·
program 5 ×12 · program 6 ×11 · program 7 ×1 (line-wrapped in
`tools/transport/test/carrierTrace.test.ts` — `ADR-0019` on one line,
`program 7)` on the next) · program 8 ×10. Bare `ADR-0019` tokens with no
program number occur ONLY as the head lines of those wraps (perspective.ts →
program 1, chapters.ts → program 3, carrierTrace → program 7). There are NO
numbered `#N` citations and no letters — this ADR's bullet headings below
match the spaced forms one-for-one.

**Prior records:** `ADR-0013` (session-3), `ADR-0014` (session-4),
`ADR-0015` (session-6), `ADR-0016` (session-7), `ADR-0017` (session-8),
`ADR-0018` (session-9 FIRST ruling, "1c 1d 1b 1a"). This is the SAME owner
session's SECOND ruling — the filename shares the `owner-rulings-session-9`
suffix with 0018 by design; ADR-0018 is the depth wave's COMMISSIONING, this
record is its first FULL CONSUMPTION (every program here answers one of the
eight fresh asks the wave-24 closeout registered).

**Registers:** `docs/DECISIONS-PENDING.md` (the eight asks CLOSED; six fresh
asks raised) · `docs/MODULE-STATUS.md` (rows + footer battery) ·
`docs/API-REFERENCE.md` (perspective rows re-worded to full power;
chargebackFeeRefusals report field; G7M rules-option) ·
`reports/audit/SUMMARY.md` (WAVE-25 ledger) · `hosting_game.md` :55 status
block + riders (ZERO heading markers moved this wave).

## Context

Wave-24 settled the surface: the type program stands CEASED at fourteen, the
era canon is BLESSED, campaign v0 + perspectives v0 + Gate-7 landed, and the
transport contract was authored. What wave-24 DELIBERATELY did not do was
leave eight owner-shaped holes where a lane could have bolted machinery: a
perspective could ban only the five validator-covered verbs (fourteen verbs
doc-wished but uncoverable), a chargeback fee could crash a thin-funded
fold, no campaign chapter had ever DIED so the succession ledger rode tests
only, "eras change mechanics" was still a sentence, the G7 engine lived in a
gate-panel harness, two off-ledger panel hues shipped as placeholders, the
carrier contract's trace was a recipe rather than a gate, and R66 bundle
dating waited on the owner. The owner's answer to all eight was one sentence:
"go with recomendations" — and every recommendation followed the program's
deepest habit: reuse the law that is already on the books (the door's own
pre-pay gate ordering, the money lane's refuse-not-overdraft posture, the
doc's verbatim words) rather than invent a parallel mechanism.

## Decision

**Program 1 — the general `canExecute` door hook, and perspectives at full
power on top of it.** The named owner wall is BUILT @`a828379`:
`IntentDoorConfig.canExecute?: (query: ExecuteQuery) => ExecuteRejection | null`.
- Gate order FIXED at resolve-carrier → **canExecute** → hands → attention →
  handler: a banned verb pays NOTHING, reaches no handler and no per-verb
  validator, and the refused entry keeps the state object by IDENTITY;
- consulted for EVERY verb-carrier entry — player-verb carriers AND the G7
  translated rule-carriers alike — with `carrier` named on the query so
  hosts may gate the Book apart from the human;
- the host's `reason` lands in the `intent-refused` event VERBATIM (host
  `code: detail` grammar; the door mints no code — the 46-phrase refusal
  census rode UNPAID), a non-string reason throws `IntentDoorError`, and a
  THROWING hook propagates (host bug = crash, never silent permit); absent
  hook = byte-identical default; `ExecuteQuery`/`ExecuteRejection` +2 names.
The generalization LANDED the same program @`817c82c`: perspective verb bans
now ride the gate as an OUTER veto. The v0 tape machinery is DELETED —
`canPlaceDevice`/`canAdjustPrice`/`canSellOffer`/`canNegotiateTerms` wrappers
and the `PERSPECTIVE_REJECTION` constant are gone; banned verbs get a frozen
reason `perspective-forbids: "<id>" does not execute "<verb>"`; a zero-ban
row grows NO `canExecute` key (a host hook rides through by identity) and a
prior gate is CHAINED for unbanned verbs; `lookupPolicyCards: false` stays
as the SEPARATE book-visibility axis (visibility ≠ dominance). The ceiling
retired: `PERSPECTIVE_BANNABLE_VERBS` is all nineteen of `PLAYER_VERBS`, the
`"not-coverable-v0"` fate arm is DEAD, and the 5×19 expressibility table is
re-pinned to all-decision. The roster is now SPEC-COMPLETE: noc-shift 3 bans
(place/connect/disconnect — :1209/:1267, communicate taxed-not-banned :1271),
datacenter-tech 15 (:1211), support-queue 17 (:1212/:1379 — communicate is
the dispatch), apprentice 16 (:1214/:1478-79), red-team-friday 0 (pure
goal-inversion data). Ban arithmetic: 19×5 minus allows — every allow is the
doc's own verb family, never a lane's taste.

**Program 2 — the chargeback-shape funding bug, fixed by REUSING the money
lane's law.** The Act-I thresholds/chargeback probe doc crashed real bridge
seeds at sim-minute 140 (`economy/buckets: chargeback cw-04: −20000000 µ$ on
free (had 993070 µ$) would go negative`). Root cause established by
bisection @`075a840`: the scenario mirror's step-8.5 cash leg posts OUTSIDE
both insolvency guards the engine's fold enforces (catch-and-void settle +
opex pre-check). Fix = the SAME refuse-not-overdraft law with the SAME `<`
boundary (free == fee pays — not a clamp, not a rounding room): an
unfundable chargeback fee REFUSES with the engine's own semantics, the
`intents`/`signals` event legs stay VERBATIM (the trace never drops a wave;
notice census, the $2.10 rating math, `chargebacksApplied` all pinned), and
the report grows the SPARSE `chargebackFeeRefusals` witness (funded runs
never grow the key — authored-opening end digest `8bc901aa8a17facc3b1dc90bbbdf0b03`
equals the pre-fix worktree capture; the unfunded 10 Mµ$ arm refuses 4 and
the rating lands 5000−4×400 = 3400 bps with 4/4 notices). The bridge doc
converts crash→win@200 with one refusal at cw-04@14400, both directions
falsifier-proven. The bankroll-row hypothesis was REFUTED before the fix
(rows are doc-authored, the fee is cfg-owned). The probe doc stays TEST-ONLY
— campaign adoption was an Act decision, and Act II cashed it (program 3).

**Program 3 — Act II: seven chapters, and the campaign's FIRST authored
death.** Act II (Tiers 3–4, "Process to Prevention") landed @`e060e97` on the
§1.9 twelve-level shape AS A PROPORTIONAL 7-of-12 SLICE (the tour law extends
tier-crossing to T4; seat-gap 6/6; Endure stays 2 < 30%; the §1.9 per-act seat
floor (2) vs every-5 global cadence tension is a RECORDED owner taste row —
resolve at full-12 expansion). **The hardest lesson** (:3825-era line b-4)
DIES in-run as authored — a zero-MRC live customer floats the company into
`lose:death-by-cause:any@73`, the falsifier (bridge-600M) survives with NO
edge taken — and **succession is LIVE**: the `failure_restart` edge consumes
the inheritance manifest EXACTLY ONCE (a null-cash slice, the waf-tier 4th
node, the museum marker re-spend THROWS) through the real
`save/settle.ts` + `campaign/chain.ts` ledger, narrated on the §9.9 ending
shape, not punished on it. The **noc-shift** seat wins @30 through a REAL
perspective seat with its full-power bans enforced through the canExecute
gate (program 1 end-to-end in campaign shape), and the **chargeback-wave**
chapter is RE-HOMED as b-7 and REHABBED: win@200, one refusal, zero crash —
program 2's guard discharged by the campaign itself. PERMANENT WALLS
RECORDED, never worked around: the covenant and review-bomb missions
CANNOT-DIE-ON-WIRE (their floats outlive the clock), change-freeze and
threshold-day are UNDEAD-WINS, the ransom corpus wall stays a re-ride gate.
Self-derived digests `d31af220a83033ce` / `86595ae9b21853b3` /
`18ef1b5675d0ea27`; Act I's `6df9dedc702c2657` UNMOVED; campaign 53→63 tests.

**Program 4 — era mechanics PILOT: the available-tech leg gates the door.**
"Whole branches of the tech tree are greyed out with 'not invented yet'"
becomes an ENGINE FACT @`22717d2`, scoped to the ONE leg §0.4 grounds:
- typed bundle `eras.availability {techId: {from?, to?}}` parsed through
  `TECH_WINDOW_PLAN` in `loader/eras.ts` — same `YearString` closed-set law
  as the era canon, provenance per row; fallback order
  row → bundle date → **undocumented = allowed** (absence is neither grant
  nor deny — R66 discipline preserved: ONE shipped row on the whole disk,
  colo's cross-connect faucet from-2001, the §0.4 grid's own sentence);
- `scenario/eraAvailability.ts` composes the verdict as the OUTERMOST door
  veto: `eraVerdict ?? inner` — zero-gate plans grow NO `canExecute` key;
  greyed policy cards return null BEFORE the host book → the door's own
  `unknown-card-hash` grammar; refusal phrases are host-grammar strings, the
  46-census UNMOVED;
- era is a WORLD fact, not a seat fact: it gates EVERY carrier (the
  :1479 apprentice author-and-delegate exemption is perspective law ONLY —
  a rulebook cannot build a machine not invented yet; the asymmetry against
  program 1's carrier delegation is BY DESIGN and pinned);
- the run CONFIG (not the doc) arms `eraYear` + `eraBundle` TOGETHER
  (`scenario[BAD_ERA]`/`scenario[BAD_INT]` walls), composition order
  freeze → perspective → **era LAST**, the report grows sparse `era{}` only
  when armed, eraless wires byte-stand EXACTLY; `eraYearAt(context)` is the
  NAMED transition seam (v0-constant — the seam exists so mid-run era
  transitions are an authoring change, not a rewrite);
- the probe wire `the-not-invented-yet` (31st shipped) flips its arm in the
  RUN CONFIG: eraless win@240, 1998 loses `intents-refused-above:
  place-device:0@20` ×5, 2026 is a byte-identical twin of eraless, a
  mid-run clone executes one and refuses one;
- `tools/host --era [--era-bundle]` rides the same composition (byte-ident
  when absent); packs.ts touched TYPE-ANNOTATION-ONLY. API-verify +7 names
  (343→...1,749 total). Threats/costs/customers-base/§5.6-lattice legs stay
  UNCOMMISSIONED — pilot means one leg proven, not the axis built.

*Rider (2026-10-18, wave-26 closeout): the named seam became a function. Era*
***TRANSITIONS are BUILT @`58fddc3`*** *— `composeEraPlan` opts take frozen, strictly*
*ascending `EraTransition {atBusinessMinute, eraYear}` entries and `eraYearAt` STEPS*
*over the host business clock, inclusive at the step minute (walls: minute ≥1,*
*ascending, else `scenario[BAD_ERA]`/`[BAD_INT]`); gates arm from t0 (`gatesAnyYear`*
*— mid-run key growth would be a state event), card greying stays OPENING-FROZEN*
*(the policy-lookup seam carries no run context — named limit, pinned both ways),*
*and absent ≡ empty ≡ pilot byte-stand. Retirement `to`-legs remain forged-fixture*
*truth (R66): transitions move the calendar, no lane authors hardware deaths.*
**Fresh ask (4) CLOSED.**

**Program 5 — the G7 rule phase joins the MAINLINE runner, opt-in.**
`SimCoreRunnerOptions.rules {lookupPolicyCard}` lands @`9748ee4` as a RUNNER
OPTION ONLY — the boot wire keeps PROTOCOL_VERSION 1 UNTOUCHED (no new field;
the future `boot.rules` rider is the named proto arm, fresh ask). Armed =
`ruleCarriers: "mapped"` + the rule phase + re-feed at tick+1 with
player-first sequencing (`RUNNER_PLAYER_SEQ_FLOOR = 1000`, the M4 band);
firings surface through the EXISTING notice wire with `detail = ruleId` —
zero new NoticeKind, zero wire widening. OFF-PATH IS THE LAW: the frozen boot
goldens `ca8863849cb3db32`/`780b1cbc61dff760` and the money goldens
`25_005_307_300n`/`25_109_732_500n` hold byte-ident with the seam ARMED;
on-path witnesses run frame-7 fire → frame-8 execute, the hands-exhausted
shared-pool collision, the failover wall crossing, ×2 twin determinism.
The mainline app is UN-ARMED in production (no shipped panel passes `rules`
yet — the seam exists, the adoption is a product decision); shadow/kill-switch
legs stay g7-exclusive. The honest cost: worker chunk +12.68 kB (the rule
phase enters the worker graph). canExecute now ALSO gates translated rule
carriers (program 1's law, stated and tested from this side).

*Rider (2026-10-18, wave-26 closeout): the named proto arm is LANDED. boot.rules*
*rides protocol* ***v1*** *as an OPTIONAL boot field — Option A, full PolicyCard*
*documents over the wire (@`9653a96`): encode OMITS when unset (key-free absence,*
*5-positional callers unchanged; `simClient.boot` gains a 6th param), parse*
*TOLERATES unknown inner keys (corpus precedent), dup-hash refusals name both*
*positions, bigints revive decimal-string-safe. Seven frozen vocab tables ride the*
*codec (the seventh, `POLICY_THRESHOLD_KIND_WIRE_IDS`, joined the source-read drift*
*pins at this closeout — the docblock's seven-table claim is now machine-true),*
*determinism + causality + fake-vs-direct twins pinned, the armed goldens*
*byte-stand. ONE `workerRulesLookup` boundary builder feeds both worker hosts*
*(E2b anti-drift law).*
**Fresh ask (5) CLOSED as ARMED-ABLE** — a shipped panel passing `rules` in
production stays owner adoption, not mechanics.

**Program 6 — the G7 panel hues ratified onto the ledger; the plate honors
it.** @`7fed0c4` discharges the wave-24 F-4 ask per recommendation:
- `rule-ink 0xb49ce8` joins `render/hues.ts` as a ledger JOB (ledger 15→16),
  NOT in `ALERT_HUES` (it is DOM identity, not a canvas alert — the §7.14
  Ghost-Hands near-miss on the violet is what kept the pool honest);
  `--hh-hue-rule-ink` projects automatically through `hueVars`;
- the plate grey `#9aa7b8` RETIRES inside G7 to `var(--hh-hue-grey)` at 88%
  (AA math re-run: the retired literal was a 4.20 PRE-EXISTING UNAUDITED
  FAIL; 88% lands 4.92–9.87 across the pairs, floors NEVER moved);
- green FILL wash (3.36/4.02 fails) becomes a green STROKE frame (6.18);
  the Ghost-Hands idle step's trough rises `.62 → .68` (the rendered dip
  failed 4.45 in 2008 — trough law is the floor, not the number); tape dim
  .92 composite 5.29+; `prefers-reduced-motion` guard added (disclosed
  judgment call); `g7Hues.test.ts` 23 its live-parse the pct/trough/tape
  literals so the law outranks any single number;
- the `DECISION_*` playtest consts in `decision/annotate.ts` flip to
  `RATIFIED 2026-10-18 (ADR-0019 program 6)` at three sites, values
  byte-ident, `decisionLaw.test.ts` pins the grammar.
DISCLOSED: `G4GatePanel.vue:602/:617` keeps its OWN documented `#9aa7b8`
plate-mix (a gate-local material predating this ledger entry — wave-24's F-4
named only the G7 pair); unifying it onto rule-ink-grey is a FRESH ASK, not
silent folding.

**Program 7 — the TS trace-player: CARRIER-CONTRACT becomes an executable
gate.** @`df05b7c` builds EXACTLY the follow-on lane §4.1 named by
filename-and-LOC (~150 ln law, file ships 496 with witnesses — disclosed
overshoot): the test PARSES the 57-line §4.1 JSONL trace out of
CARRIER-CONTRACT.md AT TEST TIME (fail-loud on any doc edit that breaks the
table), drives the REAL relay hub over the synchronous `TransportPort`, and
asserts all 27 out-frames byte-equal in global fan order, the
`synth:auto-leave-on-close` marker, the resend-never-seen-by-hub law, §4.3's
witnesses (log=4, lastStamp (7,3), ledger bytes omit-when-unset), timeline
digest `de1d4c0f941333eb`, and two-run determinism. ZERO drift: `src/`'s
8-file roster untouched, the doc restored byte-identical after THREE reverted
doc-mutation probes proved the gate falsifiable. transport 91→100 (+9). The
player is the polyglot-CI authority witness the contract promised: any PHP
carrier that reads the same table replays to the same frames.

**Program 8 — era bundle-dating QUOTE-ONLY.** The R66 leg answers the
doc's own words, never a lane's inference @`f5faced`: **colo 2001 is the ONLY
date that lands** — grounded VERBATIM in the §0.4 grid sentence "2001 dot-com
colo" (:653; the pack's 1998 rung already denies a pre-2001 world).
shared-web KEEPS 2009 (same grid sentence is the sketch precedent) and its
`_todo` now QUOTES the grid verbatim while RECORDING — not resolving — the
§9.1 "shared hosting (2005)" divergence (:32959): the grid is the shelf
authority. Four verdict-appended nulls (object-storage, serverless,
ci-build-farm, exchange-colo — each names WHY no quote exists: the serverless
"first-visit joke" date is undated fiction, the ci 2016 sketch has no grid
row, exchange-colo's rungs date the FAMILY not the HFT variant); eight nulls
stand untouched (reasoning unchanged). `loader/__tests__/era-dating.test.ts`
(12 its) is a REAL consumer over the shipped corpus: dated-without-a-shelf-
citation THROWS (anti-forgery `SHELF_CITES` map — regex prose-pairing was
ABANDONED for apostrophe mispairs, disclosed), the walk at 1998 names NOTHING
except declarations, 2008 sees ONLY colo, `DECLARED_ABSENT` frozen cites +
in-memory forgeries + a vacuity probe keep the pin falsifiable; the
real-content `live2010` documented-only pin re-cuts [shared-web] →
[colo, shared-web] as a disclosed DATA-STATE pin.

## Consequences

**Landed (9 commits atop `7c2a13e`; disk-verified battery at tip):**

| Lane | Program | SHA | Delta |
|---|---|---|---|
| L-CE canExecute hook | 1 | `a828379` | sim-core +30/+1f · api +2 |
| L-GUARD chargeback-shape fix | 2 | `075a840` | sim-core +5/+1f (scenario 472→477) |
| L-TP trace-player | 7 | `df05b7c` | transport 91→100 |
| L-DATES quote-only dating | 8 | `f5faced` | sim-core +12/+1f · 1 date landed |
| L-RATIFY hues + DECISION_* | 6 | `7fed0c4` | proto +24/+1f · ledger 15→16 |
| L-PERS full-power generalization | 1 (rides) | `817c82c` | sim-core +10 (perspective 42→52) · api INERT |
| L-G7M mainline rules seam | 5 | `9748ee4` | proto +14/+1f · worker +12.68 kB · PROTOCOL v1 untouched |
| L-CP-A2 Act II + first death | 3 | `e060e97` | sim-core +10 (campaign 53→63) · 3 self-derived digests |
| L-EM era pilot | 4 | `22717d2` | sim-core +45/+2f · api +7 · wire #31 |

**Battery at `22717d2` (review re-ran EXACT; closeout re-verified):**
sim-core serial **183f/3,480** (+112/+5 files — per-lane components sum
EXACTLY) · proto **108f/1,226** (+38/+2) · transport **100** · host **36**
(count-neutral; `--era` rides existing surfaces) · relay **42** · headless
**53/5 parity `b0162ab5`/`a9b4b7b8` HELD** · api-verify **PASS 1,749**
(+7+2+... names, zero closeout delta) · validate **14 bundles / 413 `_todo` /
16 pack markers** (Key-literals 123 rows UNCHANGED) · ci-verify **5/5** ·
`pnpm -r typecheck` **8/8**.

**ZERO pre-existing digest goldens moved.** The shed trio, drain 78dc6556,
g4 13ba145f, g5 quarter, canonical-parity, the money pair, boot 100-frame
pair, `cd1296c54df0e9c6`, negotiate-era digests and every ×100 chain green
unaided across all nine commits. New self-derived witnesses (Act II ×3,
succession, era probes, guard pair) are disclosed per lane; the two
era-probe trail hexes `6aecd417c317a910`/`38e72c42b0f0e20b2077885c35e5f4f0`
appear ONLY in the L-EM commit body — they are NOT on disk; the shipped era
probe asserts RELATIVELY (2026 ≡ eraless byte-identity, ×5 loss-time pins),
which is the falsifiable form anyway (review F-note; kept by design).

**Census discipline:** hosting_game.md moves ZERO heading markers this wave —
every wave-25 landing is a rider on settled law text (the §1.2 note carries a
SUPERSEDED rider rather than a heading re-flip; the §0.4 pilot, §1.6
retirement-machinery, §1.9 Act-II, §9.9 succession, §7.14 rule-ink and §1.4
b-7 riders are body text). Final census ✅321 🔧1,012 ⚠️0 ❌2,226 📝30 =
3,589 — UNCHANGED from wave-24.

**Incident record (program discipline, #6 overall):** an EXTERNAL process
pushed the whole wave-25 chain to origin `7c2a13e`→`22717d2` DURING the joint
review — fast-forward-valid, our exact content, no damage; prior instances
waves 20 (×2), 22, 24. Consequence: ADR-0019 is the FIRST program record
authored POST-PUSH — the 76 dangling `ADR-0019` cites that rode origin for
the review window are cured by THIS file. The ls-remote-before-push law holds
unchanged for the ceremony.

**Interpretive readings recorded (owner may overrule; both are pinned in
code):** the apprentice's communicate KEPT — the strict §1.21 "cannot
execute" reading vs the campaign author-and-delegate law (chapters.ts
asserts the desk-shift executes communicate ×4) resolved TOWARD the shipped
campaign authority (fresh ask §below); toggle-speed is never bannable — it
maps to no §1.9 verb family (presentation rail, per the roster-head
family→verb mapping discipline). The era/perspective carrier asymmetry
(program 1 delegates carriers to the host's hook; program 4's era gates
carriers absolutely) is BY DESIGN: a seat limits a person, a year limits
the world.

**Fresh asks raised by this wave (register: `docs/DECISIONS-PENDING.md`):**
(1) G4GatePanel's own `#9aa7b8` plate-mix — unify onto the grey ledger entry
or keep as a documented gate material; (2) apprentice×communicate
strict-reading alternative if the owner prefers §1.21's literal wall;
(3) Act II's 7-of-12 proportional slice vs the §1.9 twelve-level shape —
seat-floor cadence resolves only at full-12 expansion (taste row lives in
chapters.ts:475); (4) era TRANSITIONS mid-run — `eraYearAt` seam named, the
campaign-phase authoring that moves it is unbuilt; (5) `boot.rules` proto
arm — the runner seam is live but no shipped panel passes `rules`; the boot
wire rider is additive-protocol future work; (6) the era-probe trail hexes —
kept relative-by-design (see above), re-pin only under objection.

**Kept unchanged:** the type program's CEASE (ADR-0017 #8), the refusal
census at 46 (THREE programs rode it unpaid: 1, 4, and 6's zero-new-voice
posture), PROTOCOL_VERSION 1, all six+seven prototype gates, the door's
per-verb validators (still live for hosts; perspectives just no longer use
them), the 2026 ≡ era-fallback law, `save/settle.ts` writer-ownership, the
§9.13 gate count, and every PROVISIONAL label outside the program-6 set.

## Wave-26 owner ruling (session-9 second rider, 2026-10-18)

Owner ruling, verbatim: **"go with recomendations , keep driving to completion"**
(owner's spelling preserved) — the standing wave-26 agenda, executed entirely per
the closeout's recommendations. Six lanes rode atop `0c2549e`:

| Lane | What landed | SHA |
| --- | --- | --- |
| L-G4P | G4 plate unifies on the ledger grey — zero bespoke plate hexes repo-wide, fade 0.7→0.95, g4Hues AA suite 16 its | `d197917` |
| L-BR1 | boot.rules — Option-A full-card codec on v1, omit-when-unset, armed goldens byte-stand (program-5 rider above) | `9653a96` |
| L-ER-T | era transitions — the step-function seam the pilot named, door-clean (program-4 rider above) | `58fddc3` |
| AC-E | endings v0 — obituary / exit / quiet-handoff as PURE read-projections; exit is verdict-observed (`^win:sell-accepted-above:` grammar), money-untouched; records stay immutable (digest-prefix law) | `61a1c3b` |
| AC-S | sell-verdict predicates — `sell-accepted-above`/`sell-refused-above` over the SPARSE `sellVerdicts` observation; verdict notices, not door receipts (executed ≠ accepted pinned anti-lie) | `c6b69a4` |
| AC-B | Act Three — 9 chapters, tour 27; first LIVE perspective seats (c-4/c-9); the ratchet audit played zero-intent (c-2); the sell run-up (c-7); nine-beat supersession arithmetic disclosed under §1.9 | `5e9be02` |

**Corpse-audit law-honesty precedent (AC-B).** The brief's Act III re-ride
candidates were tested on disk and REFUTED as content: the metastable/DDoS/
free-tier §1.5 missions run `contracts: []` and churn to corpse by ~t44 on the
ratified death law; the covenant/review-bomb/sev-0 books open 100B/1B/500M —
ABOVE the authored 300M carry bridge, so the never-poorer cash-floor law
forbids the thin-ride. Rather than forge histories, c-1/c-6/c-8 ride as
AUTHORED HOMAGES citing the same §1.5 specLines, and only c-3 true-re-rides
(win@40, under its t44 wall). Recorded here as PRECEDENT: a lane that catches
its brief's own plan contradicting disk-state reports the corpse and authors
honestly around it.

**Closeout code-cures (comment/pin-only, review minors 1–3):**
`POLICY_THRESHOLD_KIND_WIRE_IDS` joins `_policyVocabDrift` and the source-read
drift pins (six its → seven its' claims, test title six→seven — count-neutral,
inside the existing it); `ENDING_KINDS`' docblock no longer mislabels roster
order as selection precedence (precedence lives in `selectKind`). Minor 2
(BootRules envelope-type symmetry vs Wire) and minor 4 (sellMarketRates
catalog leg) recorded on `docs/DECISIONS-PENDING.md` as hygiene candidates.

**Battery at the wave-26 tip:** sim-core serial 186f/3,551 · proto 110f/1,263 ·
api-verify PASS 1,756 · host 36 · transport 100 · relay 42 · typecheck 8/8 ·
ci-verify 5/5 · canary PASS 151 files · validate 14 bundles / 413 `_todo` /
16 pack markers · headless 53/5 parity `b0162ab5`/`a9b4b7b8` HELD · ZERO
pre-existing digest goldens moved (new witnesses self-derived: `7f085357…`
solo-ActIII, `bd36d3be…` four-arc; prior arc digests UNMOVED). Joint review:
PROCEED, zero critical/major. The refusal census held 46 UNPAID;
PROTOCOL_VERSION held 1; the type program stays CEASED.

## Wave-27 owner ruling (session-10, 2026-10-18)

Owner ruling, verbatim: **"go with recomendations , keep driving to completion"**
(owner's spelling preserved) — the same standing word that drove wave-26 drove
wave-27: the wave-26 closeout's four drivables, executed to completion without
check-ins, all CLOSED. No new laws were needed; nothing here re-opens a
ratified decision.

**ADR census decision (author-before-write, the 0015/0018/0019 law honored
literally):** every wave-27 citation form was greped BEFORE authoring —
`git log a8b7eae..HEAD -p` shows `ADR-0019` ×18, `ADR-0016` ×8, `ADR-0012` ×1,
`ADR-0018` ×1, and `ADR-0020` occurs ZERO times in wave code (the repo's single
`ADR-0020` string is this file's own predecessor record in
`reports/audit/SUMMARY.md` describing its zero-occurrence). The wave-27 record
therefore rides **ADR-0019 as this dated rider section — NOT a new ADR.**

| Lane | What landed | SHA |
| --- | --- | --- |
| L-TRACE | carrier-contract §4.1 trace REPRO SCRIPT — 453-line standalone (`node --experimental-transform-types test/carrierTrace.repro.ts`, rc 0, 27 frames byte-equal, digest `de1d4c0f941333eb`); a human replays the reference trace WITHOUT vitest; fence stays the fixture, zero authority added; vitest surface UNCHANGED (8f/100 count-exact — script uncollected); falsified by three armed doc-mutation probes | `db64667` |
| L-ENV | BootRules envelope-TYPE symmetry (wave-26 review minor #1 CLOSED) — `ToWorker.boot.rules` becomes `BootRulesWire`, symmetric with corpus/build riders; every shape wall field-path-for-field-path; revival moves to `workerRulesLookup` (E2b single-builder for both workers); POSTED JSON byte-identical (2,124-byte cmp proof vs `a8b7eae`); boot goldens `ca8863849cb3db32`/`780b1cbc61dff760` + money goldens BYTE-STAND | `a757f6c` |
| L-SMR | `sellMarketRates` catalog HOST legs (wave-26 review minor #4 CLOSED as commissioned) — `ScenarioRunConfig.sellMarketRates` + `SimCoreRunnerOptions.sellMarketRates`, config-only: NO boot field, NO doc field — the world fact rides the run-config (era posture) and the runner's self-grading refusal law survives relocated; pre-tick-1 `scenario[BAD_MONEY]` seam wall; 31 shipped wires digest-equal armed-vs-bare; c-7 STAYS catalog-LESS (never-certain witness untouched) | `adc8b64` |
| L-A2 | Act II completes at TWELVE beats (V2) — b-8/b-9/b-10 ride their shipped §1.5 registry docs (thin-ride exceptions 1→4), b-11 the-prevention-shift REUSES the noc-shift seat (campaign FIRST reuse), b-12 the-cert-cliff AUTHORED (§1.5 :3275, opens ON the bridge); seats {4,10,16,21,26,31} gaps {6,6,5,5,5} — every act at §1.9's per-act floor of TWO for the first time in campaign history; the standing DP:293 seat-floor tension RESOLVED, not recorded | `b6187c4` |

**Three adjudicated judgment calls.** (1) **The noc-shift seat REUSE** — the
per-act floor of two across five acts left no arithmetic path that avoided
repeating a perspective before tour index 31; the V1 honeymoon alternative was
probed and SUPERSEDED. §1.9's lint is roster membership + cadence + cap-1, and
`PERSPECTIVE_EXPRESSIBILITY` is per-perspective — reuse is LAWFUL; the choice
was made against the standing owner-taste row (ratify-or-cure ask below).
(2) **Disk-wins regrade (b-12):** the first cut graded `churn-above:2` and LOST
3 of 5 seeds on disk; the lose line was re-graded to `churn-above:3` and every
seed won — verified twice. Recon's stale digest hints (`381b5439`/`047c8728`)
were similarly SUPERSEDED by self-derived disk truth (`cd82b8b88a125e66`,
`5f79eb776a0bafaf`, `739d411cd5329eb1`). (3) **Flip direction is ENGINE truth
(L-SMR):** the catalog ABOVE the offer buys ACCEPTANCE, below buys refusal
(sell.ts deviation math) — the commission's parenthetical read inverted; the
lane pinned from the engine at both altitudes rather than guessing
(pin-from-engine, never guess).

**Closeout code-cures (comment-only, review minors):** **F6** — the wave-26
Act-III header digest bullet in `campaign/chapters.ts` still asserted the
four-arc tail `bd36d3be169cf130` and 3-arc `18ef1b5675d0ea27 RE-PROVEN
UNMOVED`; `b6187c4` moved both downstream digests — prose now states the
current truth (tail `739d411cd5329eb1`, 3-arc `5f79eb776a0bafaf`, wave-27 move
noted inline; prologue `28df3ca4e6c90977` and Act-I `86595ae9b21853b3`
re-proven UNMOVED). **F3** — the `sellMarketRates` runner docblock gained the
empty-case sentence (present-but-EMPTY Map spreads through and is behaviorally
identical — sell.ts anchor-miss + money-fold identity, pinned
`simCoreRunner.catalog.test.ts:125-128`; the scenario leg collapses
empty⇒omission). Both cures rode `b0c2571`.

**Battery at the wave-27 tip:** sim-core serial 187f/3,567 · proto 111f/1,272
· transport 100 (repro rc 0 alongside, uncollected) · relay 42 · host 36 ·
typecheck 8/8 · ci-verify 5/5 · canary PASS 151 files · api-verify PASS 1,756
(ZERO export delta — the legs are config fields, not new names) · validate
14 bundles / 413 `_todo` / 16 pack markers · headless 53/5 parity
`b0162ab554c4665a18892f2139d7fee8`/`a9b4b7b81c2fbedd7d50246936a458d1` HELD ·
build 954.75/547.42/1673.64/103.08 kB. ZERO pre-existing digest goldens moved
outside the disclosed campaign self-derived trio (L-A2's own Act-II/3-arc/4-arc
witnesses GREW with the act — the move was the lane's commission); every boot/
money/shed/drain/g4/g5 golden BYTE-STOOD. Joint review: PROCEED, zero
critical/major. Nineteen door verbs UNCHANGED; the refusal census held 46
UNPAID; PROTOCOL_VERSION held 1; the type program stays CEASED (fifteenth-card
CEASE restated).


## Wave-28 owner ruling (2026-10-19 session-10b)

The owner returned on 2026-10-18 (ruling 2026-10-18b, session-10b): **RATIFIED
ALL RECOMMENDATIONS — WAVE-28 opens.** The batch carried build-asks,
ratify-records and defer-records; dispositions as executed:

**BUILT:**

| Lane | What landed | SHA |
|---|---|---|
| L-ENV (hygiene 1) | proto `sellMarketRates` empty-map collapse — presence-spread omits the empty map, mirroring the scenario @`984759b` law; `?raw` source-pin + collapse/absence twins; boot goldens `ca8863849cb3db32`/`780b1cbc61dff760` and money `25_005_307_300n`/`25_109_732_500n` byte-stand | @`7357b85` |
| L-TRACE (hygiene 2) | transport repro synth-marker validation — the synthetic-outage marker is validated against the real causeId grammar before the trace is trusted; player untouched; digest `de1d4c0f941333eb` + 27-frame census UNMOVED; vitest surface 100/8 UNCHANGED | @`04c0d7e` |
| L-V1 (money-at-the-end 1/3) | `economy/valuation.ts` PURE leaf — `VALUATION_EXIT_KINDS` (the seven §1.6 kinds in doc order @hg:4502-4514), acquiror bands 10-18× monthly revenue (hg:24372-24382; the colo NOI floor-map is an honest partial), `warctMonths`, `tenantWholeLeaseValueMicroUsd` (the WARCT leg — DEFER-recorded in the wave-27 register, UN-FROZEN and BUILT here), `exitCashSliceMicroUsd` — slice = headline × Π(diligence) clamped [floor, headline] THEN the exit-kind factor; wind-down is EXACT 0; 20 PROVISIONAL consts machine-pinned 20/0; zero-rolls; fold byte-identity twin `4cf033f0e8d27621` (the 72,223-char walk INDEPENDENTLY reproduced by the reviewer cross-tree) | @`980ab58` |
| L-V2 (money-at-the-end 2/3) | ExitKind bridge — `CAMPAIGN_EXIT_KINDS` seven in doc order drift-pinned against valuation's copy; ipo/management-buyout/wind-down RESERVED (the trio is refused at campaign parse — the documented division of labor vs valuation carrying wind-down at factor 0); `DOC_LIE` code; `endCampaign` gained its third optional arg (2-arg calls byte-stand); scenario `exitDeclaration` pays the PRE-TICK-1 `BAD_ENUM` wall; `report.exitPayout` SPARSE engine-truth: headline = Σ accepted PERSISTED verdicts (the 30M-not-120M amendment law, `exitPayout.test.ts:124`), the TRUST ledger is NOT consulted | @`ce2ec1c` |
| L-V3 (money-at-the-end 3/3) | chain exit-edges + `exitFunded` carry + the `CAMPAIGN_EXIT` arc — won+exitPayout edges spawn the heir PLAYING ON with the manifest `cashSlice` riding and `failureOnlyUnlock` forced null; the CAMPAIGN_EXIT x-1/x-2 chapter pair (`the-long-sale` strategic-acquisition host-armed catalog 40M/24M; `the-quarter-that-ran-itself`); witnesses census [4,0]×4+[3,1]@off2 (never-certain survives), slice 24M/15M, cashStart===slice, arm==unarmed digest-IDENTICAL ×5 (the 9,500-ceiling clamp disclosed as a non-over-claim test); x-2 archetype Inherit; Endure 5/34 = 14.7%; seats byte-stand | @`2c69d77` |
| L-G7A (content-decks 1/4) | `policy-deck.schema.json` + validate.mjs deck leg — 21/21 probes; interpreter caps recorded honestly (minItems/maxItems work; boolean `additionalProperties` does NOT; enums strings-only); carriers disk-truth ACTION_IDS drain/shed-class, the four unmapped (failover/dispatch-remote-hands/queue-change/run-runbook) named | @`a498a49` |
| L-G7B (content-decks 2/4) | `loader/decks.ts` + `deckCardHash` (`hh-deck-card-hash-v1` — fnv1a64 over the decimal-text fold ⇒ boot.rules wire-form-IDENTICAL, pinned) + `bootRulesFromDeck`; boundary codes ONLY, zero-new; the 4-way vocab drift pin types↔loader↔schema↔protocol live-mutation-verified by the reviewer; pairing split loader-shape/evaluator-meaning | @`2cdf014` |
| L-G7C (content-decks 3/4) | FIRST DECKS `decks/{watch-the-door,cold-aisle,sleepless}.json` — 14 cards, ids `{slug}:{name}`; watch-the-door is the g7Deck's six re-targeted (BUSY 40960→16384); cold-aisle's five are all-advisory (§7.14 band semantics); sleepless authors the panic-failover WALL card as content. HONESTY LAWS shipped: `queueDepth` EXCLUDED (JS-number publish — firing it would be a lie), `company::mrrMicroUsd` has no engine publisher (omitted-not-faked), lane-cell crossings are INFERRED with per-card `_todo` machine-walked, upkeep `0n` PROVISIONAL. validate decks=3 WARNINGS 16=14+2 authored, DECK-TODO 3 | @`9948681` |
| L-G7D (content-decks 4/4) | full-loop witness deck-JSON→boot→worker→ARMED MAINLINE→rule-fired f7 configure-node+communicate EXECUTED, shed-class pays hands, f22 failover refusal; DORMANT[0]==`ca8863849cb3db32`; cold-aisle zero door receipts + the queue-etiquette never-fires falsifier; proto +19 exact | @`34bb32e` |
| tools/perf A/B re-baseline (hygiene 3) | MEASURED db64667→04c0d7e: worker 953.40→954.78 kB, index 1,671.91→1,673.67 kB, fakeWorker and CSS flat (the L-ENV relocation delta). No commit (measurement record); W28-03 NIT recorded — the A/B was not re-measured at the final tip, end-state exact |

**RATIFY-RECORDED:** the noc-shift seat-reuse as a standing device (the V1
honeymoon variant stays on record) · author-and-delegate as an operating law ·
the relative era hexes · the playtest posture (the ratify-on-playtest queue
stands and grows — W28-04 joins it) · the era-mechanics freeze.

**DEFER-RECORDED:** boot.catalog · linear-branching (campaign stays LINEAR —
RE-RATIFIED) · goal-card sugar until a HUD exists · corpus-in-campaign · the
canvas inspector · the PHP/Workerman carrier (Node-sidecar-only-if-MP) ·
in-flight-kill (keep-defer; bounced-and-attributed when built) · slug-12 ·
the render harness · deck-preview · c-7 stays catalog-less (the catalog-armed
sibling chapter was a BUILD item the standing never-certain census converted
to a defer — the chapter was NOT re-authored) · sell-acceptance dice
VERIFIED-SHIPPED @`24f90bc` (record, not new work). The one UN-FREEZE: the
WARCT leg moved from DEFER to BUILT inside the money-at-the-end program
@`980ab58`, as listed above.

**Fifteenth-card CEASE (ADR-0017 #8): restated untouched** — the type program
stays ceased; wave-28 added ZERO hosting types.

Two law-changes rode the money program and are recorded here because they
amend ratified posture, not merely add to it:

1. **The exitFunded carry is a LAW CHANGE (L-V3 @`2c69d77`).** The §2.5 Long
   Save succession law reads "failure is poorer, not paid" — the pre-exit
   chain therefore carried the fixed 300M bridge to every heir. That was
   right for failure and WRONG for a paid exit: an heir whose predecessor
   SOLD THE COMPANY WAS PAID; giving that heir the bridge instead of the
   proceeds would be §2.5's own sentence inverted into a lie. The chain now
   carries `exitFunded`: a paid-exit heir opens on its manifest `cashSlice`
   (proceeds), a failed run still opens on the bridge. The law is
   reverse-honored — the amendment preserves the sentence's intent by
   dividing on the one fact the sentence never contemplated (being paid) —
   and it was falsified BOTH directions (bridge-for-paid reddens,
   proceeds-for-failed reddens). Reviewer-proven; disclosed in the commit
   body.
2. **The §E amendment superseded itself inside one wave (L-V2→L-V3).** L-V2
   @`ce2ec1c` shipped the §E exit-timing law as a `BAD_RANGE` position wall
   (a declaration in a chapter the run never reaches would not throw —
   out-of-window stamps only). L-V3 @`2c69d77` superseded that with the
   per-declaring-chapter `DOC_LIE` walk: every declaration is checked
   against the chapter that declared it, so a post-timeline timeout now
   THROWS and the early-halt silent-hole is closed. Reviewer verdict:
   STRICTER where it matters; only the false-negative position proxy
   loosened. Supersession inside one wave is recorded as one amendment,
   not two regimes.

**NEW OWNER WALL named by the program: the upkeep BILLING fold.** The decks
ship `upkeepMicroUsd: 0n` PROVISIONAL because an upkeep BILLING fold would be
a money-ledger fold — golden-moving by construction — and the standing
discipline says that is its own owner-commissioned program, not a closeout
rider. Named, unbuilt, first item on the wave-28 register
(`docs/DECISIONS-PENDING.md`).

**ADR census for the record (wave-26/27 discipline re-run):**
`git log 52e199f..HEAD -p | grep -oE 'ADR-00[0-9]{2}' | sort | uniq -c` →
ADR-0013 ×1 · ADR-0014 ×8 · ADR-0015 ×4 · ADR-0016 ×51 · ADR-0017 ×3 ·
ADR-0018 ×4 · ADR-0019 ×6 — **zero ADR-0020 forms in the wave's code**: no
such file exists, the only `ADR-0020` strings in the repo are the wave-26/27
census meta-statements themselves. The 51 ADR-0016 cites are POINTER cites
into its pre-existing numbered register (#10 carries the
PROVISIONAL/ratify-on-playtest posture the valuation ladder rides; #8 is the
deferred relationship ask @`relationship.ts:19-22` whose meter-side the
diligence posture partially discharges; the mechanics B/C host-seam labels
and #11's sell ratifications ride their lanes); the ATTRIBUTIVE program
lettering (L-V2 "ADR-0016 #10 program, ADR-0019"; "ADR-0019 program 3" in
the chapters tests) lands on THIS record. WAVE-28 therefore rides ADR-0019
as this dated rider.

Battery at the pre-closeout tip @`2c69d77` (reviewer-measured, re-verified by
this closeout at the final tip): sim-core 192 files / 3,741 tests exit 0 ·
proto 112/1,291 · transport 100/8 + repro rc0 · relay 42 · host 36 · headless
53/5 parity `b0162ab5…`/`a9b4b7b8…` HELD · api-verify PASS 1,785
(1,756+19+3+7 EXACT — the export ledger reconciles: +19 economy valuation,
+7 loader decks, +2 campaign bridge names, +1 scenario payout type) ·
validate exit0 bundles=14 decks=3 WARN 16 413/16 · canary 153
(151+valuation.ts+decks.ts, fully attributed) · typecheck 8/8 · build
worker 955.45/fakeWorker 547.42/index 1,678.88/CSS 103.08 kB · ci-verify 5/5
· dist zero deck-JSON leaks. The seven tour hexes, the c-7 census, the
failure-edge nulls and the boot/money goldens ALL byte-stand. Self-derived
digests NEW this wave (disclosed permanently): the five exit-arc hexes
`b4f7777519ebc0a8`/`41109fcf67c40ec3`/`fb7ab9bd3bfac7ca`/`6598a67ebcf6cb9d`/
`88dbd147c1d13d41`, the fourteen deck card-hash goldens, and the valuation
fold twin `4cf033f0e8d27621`.

## Wave-29 owner ruling (2026-10-19 session-10c)

The owner batch of 2026-10-19 commissioned the wave-28 register: asks
**(i) (ii) (iii) (iv) (v) (vi) — RATIFIED**; (vii) family-targeted cards
stays a NAMED GAP (the per-family observed cells still do not exist) and
(viii) the `exitKindFactorBps` ladder stays on the ratify-on-playtest
queue. Five lanes ran atop `98edaee`; the whole wave moved ZERO pre-existing
goldens. Dispositions as executed:

| Lane | What landed | SHA |
|---|---|---|
| L-VD (iii) | `deckCardHash` declared THE versus doctrine hash law (ruling verbatim: "kills the three-local-hash-laws drift risk permanently") — `DefenseDeck.policyCardsByHash` binds `hh-deck-card-hash-v1` keys; the deck.ts FINGERPRINT LAW became the DOCTRINE BINDING LAW, adjudicating the older local hash laws (two proto gate fictions stay gate fictions per the G7B posture; the door's `cardFingerprint` stays M3 whole-book identity; versus `hh-card-v1` stays the DEFAULT in-match ruleBook index — the 2026-10-09 ratification split accordingly, ruleBook-index half stands, deck-ref half superseded). `versus/__tests__/doctrineDecks.test.ts` 13 its: LIVE deck→DefenseDeck→door-commit witness, wire-vs-revived BYTE-IDENTICAL doctrine commit, key-space disjointness BOTH directions (a `hh-card-v1` fingerprint bounces `unknown-card-hash` off a booted book; a deck hash misses `defaultPolicyCardIndex`), embedded-cards smuggling refused, falsifiable source-read pin; loader/decks.ts header now records the adoption | @`fc18f2e` |
| L-PA (ii) | Production arming of the G7 seam — the ONE `SimClient.boot` call site in the repo (App.vue `bootClient()`, previously the mock-default 2-positional call — deviation disclosed: the brief assumed it was sim-core) now boots the sim-core runner carrying `deck:watch-the-door` through the existing `boot.rules` wire rider: `src/runner/productionRules.ts` parses `?raw` at MAIN-thread module load (`parsePolicyDeck → bootRulesFromDeck`, fail-loud at module scope) and the worker revives via the one shared `workerRulesLookup`; PROTOCOL_VERSION stays 1. cold-aisle/sleepless NOT armed — the ruling arms watch-the-door on the mainline boot only; panel-local `SimCoreRunner` constructions are direct engine seams, not boot sites, and stay unarmed per scope discipline | @`7510bac` |
| L-RDR (v)+(vi) | The campaign epilogue bank — `packs/campaign.i18n.json`: packId `pack:campaign.i18n`, appliesTo `core:campaign`, decision 0 / flavour 37 / slots 0 (7 exit kinds × {headline, body1..3, profile} + 2 prestige framing), era axis DECLARED on the OD-22(c) four-rung canon with every body era-flat (2026 fallback voice — "an un-aged key is an honest voice, never a hole"), provenance 32 doc-anchored cites + 5 honest nulls. (vi) content half: the seven `codex.exit.<kind>.profile` lines ARE the meta-currency NARRATIVE; the MECHANICS stay walled (cash/reputation/scars remain kind-blind — owner wall stands) | @`ed5bfa8` |
| L-U1 (i) | The upkeep BILLING fold — the DP wall becomes an engine leg: `deriveUpkeepDraft` reads the FULL card docs already persisted in `GameState.ruleBook` (no new state, no forwarding leg, no digest-schema change — the book already lives inside the state digest, so digests move exactly when the ledger does); ONE `rule-upkeep:mN` draft per business-month roll riding the ORDINARY opex loop — floor-first refuse-not-overdraft (bounced bill ⇒ `refusedBurnsThisTick++` ⇒ the freeCashDepleted guard, the OPEX-REFUSED ×N census and the L4 death-forwarding chain ride FREE; `NEGATIVE_BUCKET_LAW` catch-and-void stays last resort); the calendar is the fold's OWN 43,200-business-minute floor (shared warmth helpers renamed `BUSINESS_MONTH_MINUTES`/`businessMonthOf` — both legs one grid; NOT `econ.monthIndex`, which freezes at terminal death — the @`eff5694` attention-seam falsifier pinned); compose order FIXED law `[warmth?, upkeep?, ...authored]` (source- AND behavior-pinned); `createUpkeepCursor` minted UNCONDITIONALLY at both fold hosts (ruleBook is REQUIRED state that grows mid-run — the warmth presence-gate shape would strand every mid-run book); retroactive accrual v0 | @`b59dbeb` |
| L-U2 (iv) | The scenario deck seam — `ScenarioRunConfig.rules?: LoadedBootRules` (`bootRulesFromDeck` output verbatim — WORLD FACT NOT DOC DATA: a doc may never select its own book, the era/sellMarketRates self-grading posture); PRE-TICK-1 `BAD_RULES` plain-Error walls (empty entries REFUSED as host bug; dup hash names BOTH positions per L-BR1; every card through `validatePolicyCard`) — `ScenarioErrorCode` union untouched; the book rides the BASE door as a conditional `lookupPolicyCard` spread, the standing perspective-strip→era-grey chain layering over it unchanged; sparse `report.rulesArmed` echo (the ARMED book in host order, never the committed subset). First upkeep bite ON-SCENE: a forged edge-object card at 25,000 µ$/sim-min bills EXACTLY 10,500,000 µ$ at the t420 roll, card SILENT (billing is roster law, not fire law); floor-first twin 5M bounces the bill with cash untouched and `guard:freeCashDepleted` halting, card STAYS committed. `scenario/__tests__/deckRules.test.ts` 13 its | @`304c9d0` |

**The zero-golden law held because it was PROVED, not assumed.** L-U1's own
words, recorded verbatim as the program's headline:

> zero-golden holds because every shipped run satisfies dormant-book ∧
> ends-before-t420 ∧ non-fold-host; the promised motion lands with the
> content retune, not here.

Witnessed, not recalled: full sim-core serial 194f/3,776 green with ZERO
pre-existing test edits; the two shipped fastForward witnesses replay
byte-ident at their pre-lane values (drip `406c3770ba0f867c490d068e1be54a30`,
funded `f131fba4d09883f83911c031dcf40b2f`); a booked-vs-upkeep-omitted
1,300-fold twin is digest-equal while the book is empty; headless 53 parity
`b0162ab5`/`a9b4b7b8` HELD (pipeline-only — the fold is host-side, immune by
construction); proto 113f/1,303 (L-PA's post-arming baseline, zero re-pins);
`apps/proto/src/runner` has zero tickFold reach — immunity by IMPORT
DIRECTION, pinned by the census test (the same law makes g5 and versus
immune). Non-vacuity PROVEN, not argued: the reviewer ran a live red-probe —
5 exact reddens when the floor-guard is removed.

**The era-grey DEAD PATH, found and closed (L-U2).**
`applyEraAvailabilityToDoorConfig` grows the greyed-lookup only when
`plan.greyedPolicyCardIds` is non-empty — and the scenario runner NEVER
passed `composeEraPlan` its policyCards map. Era grey-out of policy cards was
therefore DEAD at scenario altitude even for a door carrying a book, ever
since the grey law shipped; the discovery lands as the `eraPolicyCards`
config leg (cardId→techId, host-resolved content knowledge; rides the era
pair, bare throws `BAD_ERA`). The lane additionally REFUSED the brief's
"refused pre-grey, executed post-step" wording — it CONFLICTS with the L-ER-T
OPENING-FROZEN law (the grey never steps) — and pinned the opening-frozen law
BOTH directions instead, disclosed. Seeing the book grey is a presentation
fact frozen at opening; committing from it is the door's business.

**The reserved-pack carve-out law (L-RDR).** `pack:campaign.i18n` +
`core:campaign` is a CLOSED reserved identity with exactly two named
exceptions in `loader/packs.ts`, each placed BEFORE an untouched strict wall:
an empty DECISION namespace is legal only under the exact parsed packId +
appliesTo PAIR (half-match stays refused), and an empty slot glossary is
legal for the same identity (the validator's dead-slot law forbids a dummy
entry as workaround). Empty FLAVOUR is never carved out — a voice bank with
no voice is a bug. The validator mirrors the identity law: the reserved claim
is exclusive and fail-loud BEFORE the orphan guard (the G7A mirror law
@`a498a49` onto the pack-claim side), the ≥5 decision floor INVERTS to
must-be-0 for the reserved line, and the fourteen line packs ride identical
code paths (`deepCheckPack` extraction preserved their messages byte-for-
message).

**The panel-arming posture (L-PA).** Arming is ADOPTION, not mechanism — the
seam was proven end-to-end @`34bb32e`; wave-29 flips the one boot site. The
posture is pinned BOTH directions: a dormant boot is byte-identical to the
pre-adoption wire (omit-when-unset @`a757f6c`; `ca8863849cb3db32`/
`780b1cbc61dff760` + money `25_005_307_300n`/`25_109_732_500n` UNMOVED), and
armed-but-uncommitted is state-INERT through the production module (same
legacy hexes). The opt-out switch `productionRulesArmed()/
setProductionRulesArmed()` is a TESTS-ONLY lever, not a user-facing dial; the
rail entry retitled "Sandbox — mainline stepper" honestly.

**PROVISIONAL upkeep semantics and the promised motion.** Cadence monthly /
retroactive accrual / no-lapse are PROVISIONAL readings of §7.14 ("each
carries a small upkeep", disk :28536) and §1.6's "first upkeep bill" (:845) —
neither numerically specifies cadence. Named deferrals, one docblock line
each: card-shed-on-nonpayment (the lapse fiction — layer inversion, own
commission), forward-charging refinement, per-minute droplets (the §4.1
"Upkeep Drip" @hg:15066 is presentation fiction; a journal line per minute
per card is spam), suspension-aware accrual (the D-2 suspension concept does
not exist on the door book yet), dunning-cascade upkeep (category error —
dunning is customer money; the Book is player opex). THE CONTENT RETUNE IS
THE PROMISED-MOTION EVENT: decks ship `upkeepMicroUsd: 0n` PROVISIONAL, and
commissioning "small" numerics WILL re-derive the fourteen deckCardHash
goldens and the boot.rules wire witnesses — that motion is deferred BY
DISCIPLINE, not by omission.

**Ledger.** api-verify PASS 1,785 across the whole wave, ZERO export delta
(L-U1's cursor lives in `internal/tickFold.ts` — internal is api-verify-blind
by construction). Serial ladder attributed per-commit: 192f/3,741 (@`98edaee`)
→ +1f/+13t L-VD → 193f/3,754 → +0f/+2t L-RDR falsifiers → 193f/3,756 →
+1f/+20t L-U1 → 194f/3,776 → +1f/+13t L-U2 → **195f/3,789** at @`304c9d0`.
Proto 112f/1,291 → 113f/1,303 (+12 L-PA, zero re-pins). Versus dir 6f/191 →
7f/204 (the brief-era 189 was stale — disk truth 191 pre-lane). Loader dir
14f/257 → 14f/259. Scenario dir 14f/581 → 15f/594. **NEW self-derived
digests, disclosed permanently:** the armed production-boot 100-frame pair
`2a7a977a541b08a9`/`6a314d31f2f2f889` (stated as NEW at @`7510bac`, never
presented as moved), and the dormant upkeep-doc scenario digest
`8aca5ba270e51597bece5fafca361122` (pre-seam literals captured at @`b59dbeb`
in a detached worktree — shipped wires `6aecd417c317a910c75e37f4da14b272`,
the-long-weekend `ee277ee1b9719a1ce412fd0a3564eebb`, understaffed-sunday
`df1538b3baabe2e93fa79799a6830230` all byte-stand, the first cross-agreeing
with the standing eraTransitions pin). Review: joint review PROCEED, zero
critical / zero major; W29-01/03/05 not carried to closeout; W29-02 (loose
:5633 pack anchor) cured in the closeout re-anchor sweep; W29-04 APPLIED —
the closeout build ledger reads worker 955.45 / fakeWorker 547.42 / index
1,696.35 / CSS 103.08 at final tip — W29-04's 1,696.28 held at the wave tip;
the +0.07 kB is this closeout's deck/pack `_todo` cure growing the bundled
`?raw` bank (worker/fakeWorker/CSS byte-flat, disclosed) — and L-PA's
1,694.85 was true only at its own commit:
L-U1's tickFold +143 lines ride the main chunk via the PRE-EXISTING
App.vue→unattendedLab→`@hh/sim-core/unattended`→fastForward→internal/tickFold
edge — a graph-hygiene note, not introduced this wave); W29-06 (ENV,
owner-side, REPORT only): a stray `/home/my/vitest.config.ts` hijacks vitest
upward-discovery for worktrees outside the workspace — recommend the owner
retire or rename it.

**ADR census for the record (wave-26/27/28 discipline re-run):**
`git diff 98edaee..HEAD | grep -oE 'ADR-00[0-9]{2}' | sort | uniq -c` →
ADR-0009 ×1 · ADR-0014 ×1 (#D9) · ADR-0016 ×7 (register pointers) ·
ADR-0018 ×5 (era register — the campaign bank's OD-22(c) canon + §0.4 rider
cites) · ADR-0019 ×1 (L-U2's attributive "ADR-0019 (iv)") — **zero ADR-0020
forms in the wave's code**. Wave-29 therefore rides ADR-0019 as this dated
rider. The fifteenth-card CEASE (ADR-0017 #8) is restated untouched:
wave-29 added ZERO hosting types.

## Source

- Owner ruling: session-9 second ruling, verbatim **"go with recomendations"**
  (2026-10-18), the eight-item agenda as recommended.
- Build lanes: `a828379` (L-CE) · `075a840` (L-GUARD) · `df05b7c` (L-TP) ·
  `f5faced` (L-DATES) · `7fed0c4` (L-RATIFY) · `817c82c` (L-PERS) ·
  `9748ee4` (L-G7M) · `e060e97` (L-CP-A2) · `22717d2` (L-EM).
  Disclosed: `e060e97` and `9748ee4` shipped WITHOUT commit-body narrative
  (trail lives in code + `reports/audit/SUMMARY.md` WAVE-25 ledger).
- Registers: `docs/DECISIONS-PENDING.md` (wave-24 asks 1–8 dispositioned;
  session-9-second blockquote; six fresh asks) · `docs/MODULE-STATUS.md`
  (door/perspective/era/campaign/host/transport/proto/hues rows + footer) ·
  `docs/API-REFERENCE.md` (perspective full-power re-wording, report field,
  runner option) · `reports/audit/SUMMARY.md` (WAVE-25).
- Review: joint reviewer `ses_eb3382ec0ffecng0ThJEHPYcss` — PROCEED, 9/9
  lanes PASS, zero critical/major; minors dispositioned in the closeout
  (this file's hyphen normalization + the two dangling-comment cures in
  `perspective.ts` included).
- Spec headings: hosting_game.md :55 (status), §0.4 (era axis + dating law),
  §1.2 (perspectives), §1.4 (CI card b-7), §1.6 (Era Track retirement), §1.9
  (Act II), §7.14 (Ghost Hands / rule-ink), §9.9 (endings/succession),
  appendix + WAVE-25 tail.
