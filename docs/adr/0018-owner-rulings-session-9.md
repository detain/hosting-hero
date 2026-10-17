# ADR-0018 — Owner session-9 rulings (2026-10-18): the wave-24 depth program — the era axis is BLESSED to a four-rung canon {1998, 2008, 2016, 2026} with all fourteen packs speaking it, the campaign v0 lands as writer-owned settlement + barrel-less linear chapters + perspectives-on-existing-seams (the 14-verb `canExecute` ceiling named as the owner wall), Gate-7 "Two Boards, One Pool" is COMMISSIONED as the seventh prototype gate with the rule-carrier rail shipped behind a DEFAULT-OFF seam (refusal census rode UNPAID at 46), and the MP production path is authored as a CONTRACT (CARRIER-CONTRACT.md) with dev-carrier auth OPT-IN and the auto-leave bug-cure ratified

## Status
**Accepted (2026-10-18).** Owner ruling, verbatim: **"1c 1d 1b 1a"** —
commissioning all four depth threads the session-8 closeout named as the
standing direction ("depth-work (eras/campaign/adoption) is the standing
direction", ADR-0017 #8 ruling 1a ceased the TYPE program; this wave is what
replacing it looks like). The letters decode, in the owner's given order:
**1c = Gate-7**, **1d = the multiplayer production path**, **1b = the
campaign**, **1a = the eras**. Like its siblings this record was authored at
CLOSEOUT, after the build landed; every number quoted below was verified
against disk at tip `949ebd1` (16-commit chain atop `4afcfa5`). Cited in
source as bare `ADR-0018`, as `ADR-0018 program 1a/1b` (era/campaign code
sites), and as `ADR-0018 remit` (the perspective canExecute WALL notes);
the door/proto/commit-message sites cite the ADR without a letter — this
document's four numbered programs are what every such citation resolves
against. There are NO `#N` citations on disk and none are introduced here:
the bullets are PROGRAM-LETTERED to match the ruling letters.

Prior records: `ADR-0014` (session-4), `ADR-0015` (session-6), `ADR-0016`
(session-7 + #11), `ADR-0017` (session-8 + follow-ons #6–#8). The OD row for
the era question is OD-22(c) (DECISIONS-PENDING); the gate program is
hosting_game.md §9.13; the campaign law is §9.1/§2.5; perspective levels are
§1.2; the resource law the seventh gate exercises is §7.12; the Act row is
§7.16; the co-op contracts are §7.15/§7.5 and ADR-0013.

## Context

The type program stopped at fourteen cards with the verb roster exhausted and
the fifteenth ask CEASED (ADR-0017 #8). The engine had therefore outrun its
own breadth: 19 door verbs, 14 shipped hosting types, a 46-phrase refusal
census, and no PLAY SHAPE that uses them as a game — no era ladder to age
them through (chrome shipped two token sets while §0.4 always assumed more),
no campaign to sequence them (the Long Save existed as save law but not as a
chapter program), no seventh gate to prove the two-board/one-pool claim the
Policy Book has made since wave one (the bought-verb wall — rule carriers
refusing at the door — left "the Book plays the game" untestable), and a
co-op stack whose production half was prose (the PHP/Workerman carrier lived
only in a gap row). Session-9 answered all four at once, by letter.

## Decision

**1a — The era axis is BLESSED to a four-rung canon: {1998, 2008, 2016,
2026}.** OD-22(c)'s "v1 canon = EXACTLY the shipped 1998 + 2026" is
superseded: the campaign-phase plan named by that ruling HAS ARRIVED and the
plan's four rungs become canon. `ERA_YEARS` lands as the closed tuple,
`nextEra` wraps it, the chrome ships FOUR skin-token sets (the two added CSS
blocks AA-passed), and every one of the FOURTEEN i18n packs speaks all four
(42 era keys; the 2026 text is the fallback rung by law — `2026 ≡ fallback`,
so an un-aged key is an honest voice, never a hole). The shared-register
shield holds: era keys are pack-UNIQUE keys, so a fan never overwrites
another pack's voice. Two law-riders: (i) **mechanics-on-era is
UNCOMMISSIONED** — the ruling buys copy and skin, not engine behavior keyed
to a rung (that is a separate design program, recorded as a fresh ask);
(ii) the §0.4 era-grid R66 **bundle-dating** question (which bundles are
"from" 2008) stays owner input — lanes must not forge `availableFrom`
histories the doc does not name. Landed L-ER-A @`9018305` (canon+CSS+test),
L-ER-B @`529dc91` (shared-web quad + game; sim-core era pins 7→12 LADDER,
changed-set trio→FIVE), fans C–F @`8ef4f6b` `7aedcfc` `6d06176` `7766eee`
(twelve packs; serverless is the honest two-voice starved case {16,26}-only;
object-storage 1998-degrades-by-design), L-ER-G @`949ebd1` (collector census
14/14 packs: 42 era keys / 29 pool / 18 flip — probe-derived, fan
overcount adjudicated; README era clauses; the two stale era comments cured).

**1b — The campaign v0 program: settlement law writer-owned, linear
chapter chains, perspectives on existing seams only.** Three legs:
- **The settlement executor** lands as `save/settle.ts` — 32 writer-owned
  facets, composition owned by the SAVE lane, consumed by the campaign's
  chain law; a chapter closes by settling, not by a bespoke fold.
  @`e1ada9d` (L-CP1), which also opened `campaign/` (carry/chain/doc +
  barrel, 25 exports) and the `perspective` RESERVED wall in the campaign
  doc.
- **Chapters are BARREL-LESS by law:** `campaign/chapters.ts` ships
  Prologue (3) + Act I (8) as zero-export data files — a chapter roster is
  content, not API surface; the 9 authored archetypes pin Endure at 27%,
  the Act-I ledger is 8/8 win-as-authored with the cashFloor 1e15 / 300M
  bridge witness, and two chapters ride the perspective seam through the
  UNREGISTERED `runScenario` path. Self-derived goldens named:
  `28df3ca4e6c90977`, `6df9dedc702c2657`, `352_164_000n`. @`5d0577b`
  (L-CP3). Branching stays DEFERRED — chains are linear, not a Pivot-Map;
  the succession manifest re-spend refusal is record-not-queue, and
  succession is unexercised by an in-shape death doc yet (fresh ask).
- **Perspective-shift levels (§1.2) get v0 ON EXISTING SEAMS ONLY:**
  `scenario/perspective.ts` (barrel 51→64 exports) composes the shipped
  freeze/door/report seams — a FROZEN 5-roster (apprentice, datacenter-tech,
  noc-shift, red-team-friday, support-queue), a ban set that can only cover
  the FIVE validator-covered verbs, a sight filter that is report projection
  NEVER state (seeing-is-not-being: fold identity under hide-only is
  pinned), and the falsifiable `PERSPECTIVE_EXPRESSIBILITY` 5×19 table that
  states the CEILING honestly: **14 of 19 verbs are not coverable in v0
  because no per-verb `canExecute` hook exists — building that hook is the
  OWNER WALL (ADR-0018 remit), named unbuilt, not silently widened.**
  @`9a4d796` (L-CP2). The §1.2 heading flips ❌→🔧 at this closeout — the
  ONE marker wave-24 moves.

**1c — Gate-7 is COMMISSIONED as the SEVENTH prototype gate: two boards, one
pool.** The §9.13 rail grows 6→7 (superseding wave-23's "the six gates stay
SIX" only for the prototype gate set; HUD-LAB and COOP remain NON-gate rail
stages — that ruling stands). Two ratified readings under the commission:
- **O1 (rider):** "§9.13 six gates + new seventh" — the seventh gate is
  `Two Boards, One Pool`: the §4.2 Iron Board and the Book adjudicating
  through the SAME hands rail, staged by (tick, seq), origin never.
- **O2:** the rules-pay-hands posture is RATIFIED as gate semantics per the
  §7.12 scarcity law and the ADR-0009 4d ratification — a rule carrier that
  executes pays the SAME tokens as the player verb it maps to; rule carriers
  are attention-EXEMPT (ADR-0013 ruling posture preserved).
Engine: `IntentDoorConfig.ruleCarriers?: "off" | "mapped"` — DEFAULT `off` is
byte-identical to today (the `unsupported-verb-carrier` refusal stays law),
`mapped` translates a re-fed `kind:"verb"` intent whose action is one of SIX
mapped keys into its FIVE player-verb twins and runs the ordinary rail; the
map is FILE-LOCAL private grammar (never exported), every translated refusal
reuses an existing phrase so the refusal census rode UNPAID at EXACTLY 46,
and the receipt label shows the translation (`raise-inspection-depth→
configure-node`) while the executed event keeps the plain PlayerVerb type.
Unmapped rule verbs (failover, dispatch-remote-hands, queue-change,
run-runbook) keep refusing — the bought-verb wall stands; engine breadth
stays a CONTENT decision. NEW goldens, self-derived and disclosed:
receipts `d727cdda5fde0250`, fire-log `1622412ac78d585a`. @`7bc1b9d`
(engine+41 tests), typing rider @`b750945`. Panel: `gates/g7/` — 6-card deck
(one failover card is the WALL made visible), the 654-line g7Runner
(g4Session architecture), split-screen ONE-rail panel, watch-toggle, a
DRY-RUN mode built on the shadow seam, and a grace leg; +38 tests; the
worker chunk stayed SHA-identical (panel-side only). @`0e41e64`.
**F-4 disposition:** the panel's two ghost hues (`#b49ce8`, `#9aa7b8`) are
NOT ratified by this ADR — they enter the ratify-on-playtest register as
"panel hues pending owner ratify" (DECISIONS-PENDING, wave-24 asks).

**1d — The MP production path: contract-first, in-repo dev posture cured.**
The production carrier is not built here (it stays the owner-box PHP/
Workerman lane) but its OBLIGATION is authored and the dev carrier's sharp
edges are cured:
- **CARRIER-CONTRACT.md** (@`b830aee`, ~700 lines, `tools/transport/`) is
  THE PHP/Workerman obligation doc: 8 frame kinds, 13 error codes verbatim,
  the three PROVISIONAL caps with their ratification path, the eight laws a
  carrier must never re-invent plus §2.11 hub behavior and §2.12
  connection-layer truths, the MySQL-notary/Dragonfly storage roles, the
  two conformance rungs (RUNG-1 CI-safe canonical JSONL frame-trace replay
  with the 57-line embedded witness digest `de1d4c0f941333eb` proven
  4-run byte-identical; RUNG-2 owner-box live bridge), the migration guide
  off `tools/host`, and the refusal-probe corpus appendix.
- **L-AUTH @`2b0a882`:** OPT-IN dev token auth — `startHost({auth:{secret}})`
  / `dev -- --token SECRET`; the token rides the connect URL (browser
  sockets cannot set headers, the subprotocol slot belongs to version
  negotiation), verified `timingSafeEqual` over sha256 digests BEFORE any
  listener attaches, refusal closes **1008**, default OFF is byte-for-byte
  the legacy posture. Host suite 19→36.
- **Auto-leave on disconnect is DEFAULT ON** — the synthesized
  leave-on-close is ratified as a BUG-CURE (an open tenure poisoned
  re-join), with carrier-local gates (last-claim / join-visible /
  suppression ⇒ exactly ONE vacate) and the honest TICK-LAW disclosure:
  a leave drained without a clock advance after its join is a named ledger
  refusal (the half-open tenure law is not bent).
- **SaveError-through-drain VERDICT SPLIT (L-CONTRACT §2.11–§2.12 truth):**
  double-open now THROWS `SaveError` through the drain — it does NOT ride as
  a fault frame (the stale coopRoomWire header clause is cured at this
  closeout); auth refusals DO ride the fault frame lane. The trace's
  player-follow-on leg is named in the contract as the expected next
  witness (fresh ask).
- **L-THIN @`5e87477`:** wave-23's named-owed thin-client rung is PAID —
  `coopSeatView`/`wireView` + CoopRoom's third fog column consume the rider
  (existence-absent/honest-null witnesses; disclosed deviation:
  `wireViewSeenAt` measures the LOCAL pump, not carrier arrival).

## Consequences

- **Landed (16 commits `4afcfa5..949ebd1`):** era canon + 14/14 pack fans +
  collector (9018305, 529dc91, 8ef4f6b, 7aedcfc, 6d06176, 7766eee, 949ebd1);
  campaign v0 + perspectives + chapters (e1ada9d, 9a4d796, 5d0577b);
  Gate-7 engine + panel + rider (7bc1b9d, 0e41e64, b750945); MP path
  (b830aee, 2b0a882, 5e87477). Battery at tip: sim-core serial 178f/3,368 ·
  proto 106f/1,188 · api-verify PASS 1,740 · host 36 · transport 91 ·
  relay 42 · typecheck 8/8 · ci-verify 5/5 · canary 149 · validate
  14 bundles/412/16 · parity b0162ab5/a9b4b7b8 HELD.
- **Zero-golden law HELD:** no pre-existing digest golden moved. The only
  new goldens are the SELF-DERIVED, DISCLOSED ones named in this record
  (gate-g7 pair, chapters pair + cashFloor, contract-trace witness).
- **Census discipline:** wave-24 moved ZERO markers until this closeout's
  single §1.2 ❌→🔧 flip; the G7 commission consumed no phrases (46 unmoved).
- **Owed / fresh asks (register in DECISIONS-PENDING, wave-24 block):**
  the `canExecute` per-verb door hook (the 14-verb perspective ceiling);
  mechanics-on-era DESIGN program (copy/skin landed, behavior did not —
  per ruling 1a's UNCOMMISSIONED rider); era bundle-dating owner input
  (R66); succession death-in-shape doc for Act II; composeSignalRows
  RangeError guard TICKET (thresholds/chargeback shelf); G7-mainline
  runner adoption (g7Runner proves the loop; SimCoreRunner does not yet
  mount it by default); G7 panel ghost-hues ratify (F-4); the
  contract-trace player-follow-on witness.
- **Kept unchanged:** the bought-verb wall for unmapped rule verbs; the
  refusal census at 46; `ruleCarriers` DEFAULT off (every pre-wave-24 host
  digests byte-identical); the non-gate posture of HUD-LAB/COOP; `expire`
  off-roster; the fifteenth-card CEASED ask; topology (b) default; the
  out-of-repo PHP carrier BUILD mandate (this wave authored its contract
  only); MySQL/Dragonfly stay runtime-out-of-repo.

## Source

- Owner ruling 2026-10-18 (session-9), verbatim: "1c 1d 1b 1a" — mapped in
  the Status block to Gate-7 / MP path / campaign / eras.
- Build lanes by program: 1a = L-ER-A/L-ER-B/fans C–F/L-ER-G; 1b = L-CP1/
  L-CP2/L-CP3; 1c = G7-ENGINE/G7-PROTO/typing rider; 1d = L-CONTRACT/
  L-AUTH/L-THIN.
- Registers: `docs/DECISIONS-PENDING.md` (session-9 blockquote + wave-24
  fresh asks); `docs/MODULE-STATUS.md` (campaign/perspective/ruleCarriers/
  gates-G7/era-quad rows re-pinned); `docs/API-REFERENCE.md`
  (IntentDoorConfig `ruleCarriers`, carrier-refusal prose amended at the
  three named sites); `hosting_game.md` (:55 status, §9.13 seventh-gate
  rider, §1.2 flip, §0.4/§7.12/§7.15/§7.16/§9.1-Campaign/§9.1-Succession/
  §9.4 riders, appendix, WAVE-24 tail).
- Review: joint read-only review PROCEED, zero critical / zero major;
  findings F-1/F-2 (attribution riders) land as the closeout's second
  commit; F-4 recorded above; F-7 (bare root `npx vitest` resolves vitest
  5.0.5, not the workspace 4.x — run via `pnpm -F <pkg>` or inside the
  package dir) is recorded in reports/audit/SUMMARY.md for future lanes.
- Spec headings: hosting_game.md §0.4, §1.2, §2.5 (MASTER_REPORT numbering;
  the Long Save law-note lives at §9.4 and Succession at §9.1 of the spec),
  §4.2, §7.12, §7.15, §7.16, §9.1, §9.13.
