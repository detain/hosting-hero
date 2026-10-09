# AUDIT-BRIEF — canonical instruction sheet for the 25 parallel audit agents

Written 2026-10-09 against master tip `58f5186` (104 commits). Every repo fact below was
verified on disk at write time. If your read of the repo disagrees with this brief, trust the
disk and say so in your report.

## 1. Mission

Each agent audits ONE assigned line-range of `hosting_game.md` (35,507 lines; 150 `##` headings;
3,440 `###` idea headings; blob `0ac10cd3` @ HEAD `58f5186`) and classifies **every** `##` and
`###` heading in its range by implementation status in **this repo's source + git history**.

Reference outline: `reports/audit/outline.md` (3,624 lines).
- **Table 2** = all 150 `##` headings with `in section | heading | start | end | lines | ### count`.
- **Table 3** = all 3,440 `###` headings with their parent subsection (`in subsection | heading | start | end | lines`).

Your range boundaries (section 7) were spot-checked: each starts on a `#`/`##` heading line
(g01 starts at line 216 = `# 0. Foundations`; g25 ends at file end).

You are READ-ONLY on everything except your own output file `reports/audit/group-NN.md`.
Do not stage, commit, or modify any other file (the `media/prompts/*` modifications in
`git status` belong to a sibling lane — leave them alone).

## 2. Where the truth lives (repo map — verified)

- `packages/sim-core/src/` — deterministic simulation core (`@hh/sim-core`):
  `types.ts` (THE shared contract), `kernel/`, `pipeline/` (incl. `intent-door.ts`, `driver.ts`,
  `queue.ts`, `slots` via `defaults.ts`, `digest.ts`), `policy/`, `economy/`, `observed/`,
  `topology/`, `waves/`, `replay/`, `loader/`, `save/`, `coverage/`, `versus/`, `unattended/`,
  `internal/` (barrel-invisible shared home), `index.ts` (root barrel).
  Every module dir has `__tests__/` **except `internal/`**.
- `apps/proto/src/` — Vue 3 + PixiJS v8 prototype (`proto`):
  `gates/g1..g6/` (the six Phase-1 prototype gates), `chrome/` (HUD; includes
  `chrome/instruments/` — instruments live **under** chrome, not at src root),
  `render/` (`atlas.ts`, `compositor.ts`, `budget.ts`, `camera.ts`, `hues.ts`, `post/`, `substrate/`),
  `audio/`, `i18n/`, `lab/`, `runner/` (incl. `simCoreRunner.ts`), `bridge/`, `worker/`,
  `state/observedStore.ts`, `shared/protocol.ts`, `App.vue`, `main.ts`.
- `tools/headless/` (parity + canary), `tools/perf/` (bench grids, A/B, profilers),
  `tools/assetpack/` (`@hh/assetpack` skin-kit compiler), `packages/content/`
  (g1 wave corpus `waves/g1-shared-web-first-quarter.json` + `g1-game-servers-first-quarter.json`,
  i18n packs `packs/{shared-web,game}.i18n.json`, `schema/`, `script/validate.mjs`,
  plus `threats/`, `visitors/`, `types/` registries).
- **THE PLAN:** `docs/PHASE1-PLAN.md` (216 ln, 11 ordered items; ✅ marks carry commit SHAs).
  Disk truth: items 1–9 are ✅ with SHAs (`ea7acee`→`779dea9`), item 10 is marked ⏳ and item 11
  (tag `v0.3.0`) ⬜ in the plan text — but git shows the full 8-commit series **landed** on master
  (`ea7acee`→`58f5186`, pushed) and **tag `v0.3.0` in fact points at `58f5186`** (verified).
  The plan prose simply predates its own closeout. Treat the whole calibration wave as landed.
  Supporting docs: `docs/MODULE-STATUS.md` (186 ln gap ledger), `docs/DECISIONS-PENDING.md`
  (110 ln, OD-1..OD-20 owner-gated decisions), `docs/adr/0001`–`0009`,
  `docs/API-REFERENCE.md` (1,476 ln shipped surface), `reports/MASTER_REPORT.md`
  (1,158 ln; §6 open decisions register, §7 ratified Phase-1 scope = the six gates of §9.13
  + P0 sim skeleton).
- Releases (verified via `git tag`): `v0.1.0-phase1` @ `589b41b`, `v0.2.0` @ `ee36e78`,
  `v0.3.0` @ `58f5186` (master tip, 104 commits).

## 3. Status vocabulary (exactly these five)

- **DONE ✅** — implemented in source, verifiable (file/test evidence) AND at least one real commit hash.
- **PARTIAL 🔧** — mechanism exists but the heading's spec is not fully covered; note what's missing.
- **PROBLEM ⚠️** — implemented but broken/contradicts spec/flagged as a known gap (cite MODULE-STATUS
  gap row, DECISIONS-PENDING OD-n, or failing behavior).
- **MISSING ❌** — nothing in source. MUST prefix the note with `deferred:` when the plan/ADR/
  MASTER_REPORT explicitly keeps it out of Phase-1 scope (cite where, e.g.
  "deferred: PHASE1-PLAN §scope / MASTER_REPORT §7 / PENDING_OD8") or `unlisted:` when nothing mentions it.
- **NA 📝** — editorial/non-code headings with no implementation surface (title candidates, tone
  notes, navigation maps, pure discussion). Use sparingly and justify in note.

## 4. Evidence rules (anti-fabrication)

- Every hash must pass `git cat-file -e <hash>` (7-char short form). Find introducing commits via
  `git log --oneline -- <path>`, `git log -S'<symbol>' --oneline`, `git log --grep=<keyword>`.
  For DONE cite 1–3 hashes most directly responsible. Never invent hashes; if you cannot find one,
  downgrade to PARTIAL/other and say so.
- For content catalogues (named threats/visitors/levels/buildables), the shipped census lives mainly
  in: `packages/content/` (g1 wave slices, registries), `apps/proto/src/gates/g2/corpus.ts`
  (THREAT_CATALOG — verified exactly 16 entries), i18n packs, and sim-core
  `waves/`/`policy/`/`economy/` modules. A named catalog item is DONE only if it exists in shipped
  data/code; otherwise MISSING (almost always `deferred:` — Phase-1 shipped only the g1-shared-web slice).
- Cross-check `docs/MODULE-STATUS.md` gap rows and `docs/DECISIONS-PENDING.md`: owner-gated items
  (OD-n, PENDING_OD8 rows) are at best PARTIAL/PROBLEM with the OD reference, never DONE.
  (Exception: OD rows ratified 2026-10-09 whose flips already landed — e.g. OD-1/OD-2 via `24dfcfe`,
  OD-8 via `74f157b` — the *engine* side is DONE; content gaps around them stay PARTIAL.)
- §7.8 hook list, §9.13 six gates, ADR-0009 ratifications (2026-10-09 calibration wave
  `ea7acee`..`58f5186`) are strong anchors — map headings onto them.

## 5. Output contract (machine-parsable — the markup agent depends on this EXACTLY)

Write `reports/audit/group-NN.md` (NN = your assigned group number). Structure:

```
# Group gNN audit — <title> — lines A-B
## MANIFEST
line|level|heading|STATUS|hash(es)|note
```

One row for EVERY `##` and `###` heading in the range, in line order. Fields:
- `line` = exact heading line number in `hosting_game.md` (must match `outline.md`; if they
  disagree, trust the file and say so in note).
- `level` = 2 or 3.
- `heading` = text after the hashes, verbatim, but REPLACE any `|` char with `/`.
- `STATUS` = DONE | PARTIAL | PROBLEM | MISSING | NA.
- `hash(es)` = space-separated short hashes or `-` when none.
- `note` = one short evidence phrase (file:dir, test name, OD ref, `deferred:`/`unlisted:` prefix
  for MISSING) — MUST contain no `|` chars.

No other lines in the MANIFEST section; no blank rows; the heading line itself counts as a row
(header `## ` counted once per heading). Then `## SUMMARY` (counts per status) and
`## TOP-PROBLEMS` (the 5–15 most important PARTIAL/PROBLEM/deferred-ambiguity findings, each
1–3 sentences with evidence).

Before finishing, self-verify: `awk` the MANIFEST row count == number of `##`+`###` headings in
your range per `outline.md`; fix discrepancies.

## 6. Final message back to orchestrator (ALL agents)

Max 25 lines: group id, row count vs expected, status counts (DONE/PARTIAL/PROBLEM/MISSING/NA),
report path, top 3–5 problems one-liners. All detail lives in the report file, not the message.

## 7. Group assignment table

| group | range | covers |
|---|---|---|
| g01 | 216-1501 | §0 Foundations (all) + 1.1 scale ladder + 1.2 perspective levels |
| g02 | 1502-3003 | 1.3 hosting-type levels |
| g03 | 3004-4231 | 1.4 cross-type + 1.5 scenario library |
| g04 | 4232-5094 | 1.6-1.9 |
| g05 | 5095-5995 | 1.10-1.15 |
| g06 | 5996-7151 | 2.1-2.5 |
| g07 | 7152-8016 | 2.6-2.8 |
| g08 | 8017-9152 | 2.9-2.10 |
| g09 | 9153-10157 | 2.11-2.13 |
| g10 | 10158-11397 | 2.14-2.27 |
| g11 | 11398-13067 | 3.1-3.4 |
| g12 | 13068-14858 | 3.5-3.12 |
| g13 | 14859-16284 | §4 head + 4.1-4.4 |
| g14 | 16285-17937 | 4.5-4.8 |
| g15 | 17938-19281 | 4.9-4.14 |
| g16 | 19282-20542 | §5 head + 5.1-5.4 |
| g17 | 20543-21843 | 5.5-5.12 |
| g18 | 21844-23751 | §6 head + 6.1-6.7 |
| g19 | 23752-25650 | 6.8-6.16 |
| g20 | 25651-27379 | §7 head + 7.1-7.6 |
| g21 | 27380-28896 | 7.7-7.16 |
| g22 | 28897-30888 | §8 head + 8.1-8.7 |
| g23 | 30889-32667 | 8.8-8.18 |
| g24 | 32668-34501 | §9 head + 9.1-9.4 |
| g25 | 34502-35507 | 9.5-9.13 |

## 8. Working style

Read your range in chunks (`read` tool with offset/limit). Spot-read the actual source files
before classifying — grep for the concept's symbols, read the module's index/barrel, check its
`__tests__`. 104 commits total means `git log --oneline` fits in context — read all of it once
and use it as your map. Be honest: a spec that exists only as design-law prose with a matching
test (e.g. determinism law) is DONE; a mechanism stubbed but owner-gated is PARTIAL/PROBLEM;
a cool idea nobody built is MISSING.
