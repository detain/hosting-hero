# ADR-0010 — Record the §4.5 role-taxonomy split and the defense-stacking MAX law as spec contradictions pending owner ruling

## Status
**Accepted (2026-10-09b)** — owner ruled 2026-10-09 (session 2, following the
`reports/audit/` sweep): **(a) = option (i)** and **(b) = option (i)**, exactly as
the Decision section below proposed. Execution landed in the same wave: italic
law-notes inserted under the three cited headings in `hosting_game.md` (current
lines 15190 / 16304 / 16345 after the rulings insert), markers re-markuped —
"Nine Defense Roles" ⚠️→✅ `e24e1bb`, "Build Role Taxonomy" and "Defense-in-Depth
stacking rules" ⚠️→🔧 (ruled law; the residual work is gap-registered, not
contradicted) — and dispositions recorded across `docs/DECISIONS-PENDING.md`,
`docs/MODULE-STATUS.md` and `reports/audit/SUMMARY.md`.

## Context

The 2026-10-09 audit (`reports/audit/SUMMARY.md` PROBLEMS table; group manifests
g13/g14 TOP-PROBLEMS) surfaced two places where `hosting_game.md` contradicts the
shipped implementation — and, in the first case, contradicts itself:

**(a) Nine Build Roles vs Nine Defense Roles — a taxonomy split.**
- `hosting_game.md:15178` (§4.2 neighborhood, "The Build Role Taxonomy (nine roles)")
  enumerates **Capacity / Throughput / Latency / Classify / Contain / Detect /
  Recover / Revenue / Policy** and promises the Coverage Grid "reads from the same
  tags" as the build palette.
- `hosting_game.md:16291` (§4.5, "The Nine Defense Roles") enumerates a *third* list
  that includes **Block** and omits **Negotiate**.
- Shipped code — `packages/sim-core/src/coverage/defenseRoles.ts` (e24e1bb,
  ratified "verbatim against registry-core.json") — implements **nine defense roles
  per the §2.1 table**: Absorb / Classify / Meter / Contain / Detect / Recover /
  Deter / Divert / Negotiate. Only four words (Classify/Contain/Detect/Recover) are
  shared with the §4.2 build-role list; **Block does not exist** and **Negotiate is
  present**. No buildable, `ComponentTemplate`, or plan entry carries ANY role tag,
  so the §4.2 shared-tag promise between palette and Coverage Grid is broken in both
  directions: the build taxonomy is unimplemented and the defense taxonomy the grid
  actually reads differs from §4.5's own enumeration.
- Options: **(i)** amend the spec text at 15178/16291 at the next re-markup to name
  the shipped §2.1-derived set as the one defense vocabulary, and re-scope the nine
  build roles as a Phase-2 content-tagging task; **(ii)** extend code — add a
  build-role field and a Block column (changes the ratified 12×9 grid geometry and
  its goldens); **(iii)** unify both lists into a single nine-tag ontology every
  object carries (largest change; touches types.ts contract).

**(b) Defense-in-Depth stacking — MAX vs multiplicative.**
- `hosting_game.md:16331` (§4.5, "Defense-in-Depth stacking rules") gives a
  multiplicative worked example (two overlapping defenses ⇒ ~0.80 combined), plus
  latency-additive, diminishing-returns, and synergy clauses and a Waste-Indicator
  readout.
- Shipped code — `packages/sim-core/src/coverage/matrix.ts` (e24e1bb) — pins the
  **COMBINE LAW: MAX, never sum** ("Two WAFs do not make you two× covered"), per-cell
  across the 12×9 grid; the docblock cites the §2.1 ratification. The
  diminishing-returns curve, synergy bonuses, latency addition, and Waste Indicator
  are not implemented (`secondAnswerGaps` covers only the ≥2-different-roles
  per-row law).
- Options: **(i)** keep the code law and annotate the spec at 16331 as superseded-by-
  implementation with a ratified-law note; **(ii)** re-implement multiplicative
  stacking (would move every Coverage Grid golden and re-open the e24e1bb owner
  questions already answered into the shipped geometry).

## Decision

**RATIFIED 2026-10-09b (session 2): (a) = option (i), (b) = option (i)** — the
proposals below are now owner law, executed verbatim as written.

(a) Treat the **shipped §2.1-derived defense set** (`defenseRoles.ts`:
Absorb/Classify/Meter/Contain/Detect/Recover/Deter/Divert/Negotiate) as the law
defense vocabulary. At the next spec re-markup: amend the §4.5 heading (16291) text
to the shipped nine (Block removed, Negotiate/Meter/Deter/Divert/Absorb present),
and amend §4.2 (15178) to state that the nine BUILD roles are a **planned
content-tagging layer**, not the Coverage Grid's vocabulary — the shared-tag promise
becomes a Phase-2 task ("tag every buildable with both a build role and its defense
coverage"), not a broken present-tense claim. No code change proposed.

(b) The **MAX-never-sum combine law stands** (code is law; it is deliberate,
docblocked, and golden-pinned). At the next spec re-markup, §4.5's multiplicative
example at 16331 receives a ratified-law note ("superseded by implementation:
per-role coverage combines as MAX, never multiplicatively/sum") rather than the
engine being rewritten toward the prose. The unbuilt stacking clauses (diminishing
returns, synergy, Waste Indicator) move to the gap register as possible future
refinements of the MAX law, not as current obligations.

> **RULED 2026-10-09b (a) = (i)** — shipped §2.1-derived nine (`defenseRoles.ts`:
> Absorb/Classify/Meter/Contain/Detect/Recover/Deter/Divert/Negotiate) is THE law
> defense vocabulary; §4.2 (15178) and §4.5 (16291) spec prose amended with law-notes
> at this re-markup; the nine BUILD roles re-scoped as a **Phase-2 content-tagging
> task** in the MODULE-STATUS gap register. No code change.
>
> **RULED 2026-10-09b (b) = (i)** — MAX-never-sum combine law RETAINED; §4.5
> stacking prose (16331) annotated superseded-by-implementation with the ratified-law
> note; the unbuilt clauses (diminishing returns, synergy, latency-additive,
> Waste Indicator) sit in the gap register as POSSIBLE FUTURE refinements of the MAX
> law — explicitly NOT obligations, and **no unify/multiplicative lane is scheduled**.

## Consequences

EXECUTED at this ruling (no code changes anywhere): the three `hosting_game.md`
headings carry italic law-notes naming the outcomes above — "The Build Role Taxonomy"
(now 🔧: tagging layer, Phase-2), "The Nine Defense Roles" (now ✅ `e24e1bb`: shipped
nine = law), "Defense-in-Depth stacking rules" (now 🔧: MAX law ratified, prose
superseded). Both residual workstreams land in the `docs/MODULE-STATUS.md`
Spec-Audit Gap Register as **Phase-2/backlog items, not obligations**: (1) build-role
content tagging (cluster 5 vocabulary, interacts with the OD-14 type canon —
DECIDED (a) 2026-10-09b: 34 line entries / 20 launch bundles) and (2) possible future
refinements of the MAX stacking law. `docs/DECISIONS-PENDING.md` flips OD-14/21/22/23/
24/25 to DECIDED 2026-10-09b alongside this ADR; `reports/audit/SUMMARY.md` PROBLEMS
rows 15178/16291/16331 carry the disposition notes. Coverage Grid goldens, types.ts,
and every shipped gate are untouched — the contradiction was reconciled in the
docs direction, exactly as option (i)/(i) promised.

## Source
`reports/audit/SUMMARY.md` PROBLEMS rows 15178 / 16291 / 16331; `reports/audit/group-13.md` TOP-PROBLEMS #1; `reports/audit/group-14.md` TOP-PROBLEMS #1–2; `packages/sim-core/src/coverage/defenseRoles.ts:1-13,40-98`; `packages/sim-core/src/coverage/matrix.ts:5,189`; `hosting_game.md` §2.1 (twelve threat roles / nine defense roles table), §4.2, §4.5; `docs/DECISIONS-PENDING.md` OD-14 (type canon interacts); audit commit `ef74a2f` @ base `58f5186` (v0.3.0).
