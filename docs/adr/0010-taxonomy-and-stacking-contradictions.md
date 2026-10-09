# ADR-0010 — Record the §4.5 role-taxonomy split and the defense-stacking MAX law as spec contradictions pending owner ruling

## Status
**Proposed** (triage-docs lane, 2026-10-09, from the `reports/audit/` full-spec sweep).
NOT ratified — this ADR records the contradictions and carries a recommendation per
item; the owner decision blocks below must be resolved (amend spec / extend code /
unify) before any wording here becomes law. Until then: **shipped code behavior is
the de-facto law** (it is what tests pin and gates exercise) and the spec text at the
cited headings remains a known divergence, marked ⚠️ in `hosting_game.md`.

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

**PROPOSED — awaiting owner ruling; not law yet.**

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

> **OWNER DECISION BLOCK (a)** — ratify/decline: shipped §2.1 set is the defense
> taxonomy; §4.2/§4.5 spec text amended at re-markup; build-role tagging deferred to
> a Phase-2 content lane. Alternatives: extend code with Block column + build-role
> field; or unify ontologies.
>
> **OWNER DECISION BLOCK (b)** — ratify/decline: MAX combine law retained; §4.5
> stacking prose marked superseded with a law note at re-markup; refinement clauses
> gap-registered. Alternative: re-implement multiplicative stacking (goldens move).

## Consequences

While PROPOSED, nothing changes in code or docs behavior: the audit's ⚠️ markers at
15178/16291/16331 remain, and `docs/MODULE-STATUS.md` §"Spec-Audit Gap Register"
cluster 5 (§4.5 defenses) already tells content lanes to map new defenses onto the
**shipped** nine roles. If ratified: the next re-markup of `hosting_game.md` (owned
by the audit lane) amends the three headings' prose and downgrades the ⚠️ rows to
recorded law; the build-role tagging enters the Phase-2 content backlog (with the
OD-14 type-count work it interacts with). If declined in favor of code extension:
expect Coverage Grid geometry re-cuts (goldens in `coverage/__tests__`), a types.ts
contract change for a role field, and re-anchored citations in `docs/API-REFERENCE.md`
— a separately-metered engine lane, not a docs edit. Neither path blocks any shipped
gate; this is a wording-vs-code reconciliation.

## Source
`reports/audit/SUMMARY.md` PROBLEMS rows 15178 / 16291 / 16331; `reports/audit/group-13.md` TOP-PROBLEMS #1; `reports/audit/group-14.md` TOP-PROBLEMS #1–2; `packages/sim-core/src/coverage/defenseRoles.ts:1-13,40-98`; `packages/sim-core/src/coverage/matrix.ts:5,189`; `hosting_game.md` §2.1 (twelve threat roles / nine defense roles table), §4.2, §4.5; `docs/DECISIONS-PENDING.md` OD-14 (type canon interacts); audit commit `ef74a2f` @ base `58f5186` (v0.3.0).
