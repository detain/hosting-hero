<!--
  progression/EpilogueCard.vue — §1.6's terminal readout as ONE mount-ready
  card for all three ending kinds (the Obituary, The Exit, The Quiet Handoff),
  the money-at-the-end legs when the host carries a payout, the museum shelf,
  and the succession line.

  Weld contract: <EpilogueCard :ending :payout :museum :succession />
  - `ending` is a CampaignEnding straight from endCampaign — the only
    required prop; everything else is plain optional data the host already
    holds (ScenarioReport.exitPayout, CompanyNode.museum, CompanyNode.succession).
  - Zero store imports, zero engine calls, zero timers: pure projection
    (buildEpilogueView) laid out. Every number carries an ExplainValue.
-->
<script setup lang="ts">
import { computed } from "vue";
import { buildEpilogueView } from "./epilogueModel";
import type { EpilogueFact, EpilogueInput } from "./epilogueModel";

const props = defineProps<EpilogueInput>();

const view = computed(() => buildEpilogueView(props));

/** §8.15 "every number explainable" without the globalExplain registry:
 *  the payload rides the model verbatim as an inline disclosure, so the
 *  card stays plain-data-mountable in any host (weld contract). */
function explainInputs(fact: EpilogueFact): string {
  return fact.explain.inputs.map((input) => `${input.name} = ${input.value}`).join("  ·  ");
}

const KIND_BANDS: Record<EpilogueInput["ending"]["kind"], string> = {
  obituary: "kind-obituary",
  exit: "kind-exit",
  "quiet-handoff": "kind-quiet",
};
</script>

<template>
  <article class="epilogue-card" :class="KIND_BANDS[view.kind]" data-test="epilogue-card" :data-kind="view.kind">
    <header class="epilogue-head">
      <p class="epilogue-kicker" data-test="epilogue-kind">{{ view.kind }}</p>
      <h2 class="epilogue-title" data-test="epilogue-title">{{ view.title }}</h2>
      <p class="epilogue-epitaph" data-test="epilogue-epitaph">{{ view.epitaph }}</p>
    </header>

    <div v-if="view.death !== null" class="epilogue-death" data-test="epilogue-death">
      <span class="fact-label">{{ view.death.label }}</span>
      <span class="fact-value">{{ view.death.value }}</span>
      <details class="fact-explain" data-test="epilogue-explain">
        <summary>why</summary>
        <p class="explain-formula">{{ view.death.explain.formula }}</p>
        <p class="explain-inputs">{{ explainInputs(view.death) }}</p>
      </details>
    </div>

    <div v-if="view.money !== null" class="epilogue-money" data-test="epilogue-money">
      <h3 class="section-title">The money at the end · {{ view.money.exitKind }}</h3>
      <div class="money-leg money-headline" data-test="epilogue-headline">
        <span class="fact-label">{{ view.money.headline.label }}</span>
        <span class="fact-value">{{ view.money.headline.value }}</span>
        <details class="fact-explain" data-test="epilogue-explain">
          <summary>why</summary>
          <p class="explain-formula">{{ view.money.headline.explain.formula }}</p>
          <p class="explain-inputs">{{ explainInputs(view.money.headline) }}</p>
        </details>
      </div>
      <div class="money-leg money-slice" data-test="epilogue-slice">
        <span class="fact-label">{{ view.money.slice.label }}</span>
        <span class="fact-value">{{ view.money.slice.value }}</span>
        <details class="fact-explain" data-test="epilogue-explain">
          <summary>why</summary>
          <p class="explain-formula">{{ view.money.slice.explain.formula }}</p>
          <p class="explain-inputs">{{ explainInputs(view.money.slice) }}</p>
        </details>
      </div>
      <ul class="money-legs">
        <li
          v-for="(leg, index) in view.money.legs"
          :key="`leg-${leg.label}-${String(index)}`"
          class="money-leg"
          data-test="epilogue-leg"
        >
          <span class="fact-label">{{ leg.label }}</span>
          <span class="fact-value">{{ leg.value }}</span>
          <details class="fact-explain" data-test="epilogue-explain">
            <summary>why</summary>
            <p class="explain-formula">{{ leg.explain.formula }}</p>
            <p class="explain-inputs">{{ explainInputs(leg) }}</p>
          </details>
        </li>
      </ul>
    </div>
    <p v-else class="epilogue-money-absent" data-test="epilogue-money-absent">
      {{ view.moneyAbsentLine }}
    </p>

    <div v-if="view.declaredExit !== null" class="epilogue-declared" data-test="epilogue-declared">
      <span class="fact-label">{{ view.declaredExit.label }}</span>
      <span class="fact-value">{{ view.declaredExit.value }}</span>
      <details class="fact-explain" data-test="epilogue-explain">
        <summary>why</summary>
        <p class="explain-formula">{{ view.declaredExit.explain.formula }}</p>
        <p class="explain-inputs">{{ explainInputs(view.declaredExit) }}</p>
      </details>
    </div>

    <div class="epilogue-section" data-test="epilogue-succession">
      <h3 class="section-title">Succession</h3>
      <ul class="fact-list">
        <li
          v-for="(row, index) in view.successionFacts"
          :key="`suc-${row.label}-${String(index)}`"
          class="fact-row"
          data-test="epilogue-succession-row"
        >
          <span class="fact-label">{{ row.label }}</span>
          <span class="fact-value">{{ row.value }}</span>
          <details class="fact-explain" data-test="epilogue-explain">
            <summary>why</summary>
            <p class="explain-formula">{{ row.explain.formula }}</p>
            <p class="explain-inputs">{{ explainInputs(row) }}</p>
          </details>
        </li>
      </ul>
    </div>

    <div class="epilogue-section" data-test="epilogue-evidence">
      <h3 class="section-title">What the record stands on</h3>
      <ul class="fact-list">
        <li
          v-for="row in view.facts"
          :key="`fact-${row.label}`"
          class="fact-row"
          data-test="epilogue-fact"
        >
          <span class="fact-label">{{ row.label }}</span>
          <span class="fact-value">{{ row.value }}</span>
          <details class="fact-explain" data-test="epilogue-explain">
            <summary>why</summary>
            <p class="explain-formula">{{ row.explain.formula }}</p>
            <p class="explain-inputs">{{ explainInputs(row) }}</p>
          </details>
        </li>
      </ul>
    </div>

    <div class="epilogue-section" data-test="epilogue-museum">
      <h3 class="section-title">The museum</h3>
      <p v-if="view.museum.length === 0" class="museum-empty" data-test="epilogue-museum-empty">
        The shelf is empty — this line never earned an exhibit.
      </p>
      <ul v-else class="fact-list">
        <li
          v-for="exhibit in view.museum"
          :key="`museum-${exhibit.id}`"
          class="fact-row"
          :class="{ 'museum-deprecated': !exhibit.onShelf }"
          data-test="epilogue-museum-row"
        >
          <span class="fact-label">{{ exhibit.title }}</span>
          <span class="fact-value">{{ exhibit.provenance.value }}</span>
          <details class="fact-explain" data-test="epilogue-explain">
            <summary>why</summary>
            <p class="explain-formula">{{ exhibit.provenance.explain.formula }}</p>
            <p class="explain-inputs">{{ explainInputs(exhibit.provenance) }}</p>
          </details>
          <span v-if="exhibit.note !== null" class="museum-note">{{ exhibit.note }}</span>
        </li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.epilogue-card {
  font: inherit;
  color: var(--hh-accent);
  border: 1px solid color-mix(in srgb, var(--hh-hue-grey) 45%, transparent);
  border-left: 4px solid var(--hh-hue-grey);
  border-radius: var(--hh-radius);
  padding: 0.9rem 1rem 1rem 1rem;
  display: grid;
  gap: 0.7rem;
}
.epilogue-card.kind-obituary {
  border-left-color: var(--hh-hue-red);
}
.epilogue-card.kind-exit {
  border-left-color: var(--hh-hue-green);
}
.epilogue-card.kind-quiet {
  border-left-color: var(--hh-hue-warm-grey-amber);
}
.epilogue-head {
  display: grid;
  gap: 0.2rem;
}
.epilogue-kicker {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--hh-hue-grey) 85%, transparent);
}
.epilogue-title {
  margin: 0;
  font-size: 1.3rem;
  letter-spacing: 0.03em;
}
.kind-obituary .epilogue-title {
  color: var(--hh-hue-red);
}
.kind-exit .epilogue-title {
  color: var(--hh-hue-green);
}
.kind-quiet .epilogue-title {
  color: color-mix(in srgb, var(--hh-hue-warm-grey-amber) 90%, transparent);
}
.epilogue-epitaph {
  margin: 0;
  white-space: pre-wrap;
}
.epilogue-death {
  margin: 0;
  padding: 0.35rem 0.5rem;
  background: color-mix(in srgb, var(--hh-hue-red) 12%, transparent);
  border-radius: var(--hh-radius);
}
.epilogue-money {
  border-top: 1px dashed color-mix(in srgb, var(--hh-hue-green) 45%, transparent);
  padding-top: 0.45rem;
  display: grid;
  gap: 0.3rem;
}
.epilogue-money .money-headline .fact-value {
  color: var(--hh-hue-green);
  font-weight: 700;
}
.epilogue-money .money-slice .fact-value {
  color: color-mix(in srgb, var(--hh-hue-green) 80%, transparent);
}
.epilogue-money-absent {
  margin: 0;
  color: color-mix(in srgb, var(--hh-hue-grey) 78%, transparent);
}
.section-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--hh-hue-grey) 88%, transparent);
}
.epilogue-section {
  border-top: 1px dashed color-mix(in srgb, var(--hh-hue-grey) 40%, transparent);
  padding-top: 0.45rem;
}
.fact-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.22rem;
}
.fact-row,
.money-leg {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  flex-wrap: wrap;
  margin: 0;
}
.fact-label {
  color: color-mix(in srgb, var(--hh-hue-grey) 82%, transparent);
}
.fact-value {
  font-variant-numeric: tabular-nums;
}
.money-legs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.18rem;
}
.museum-deprecated .fact-label {
  text-decoration: line-through;
  color: color-mix(in srgb, var(--hh-hue-alarm) 80%, transparent);
}
.museum-note {
  flex: 1 1 100%;
  font-size: 0.85em;
  color: color-mix(in srgb, var(--hh-hue-grey) 75%, transparent);
}
.fact-explain {
  font-size: 0.78em;
  color: color-mix(in srgb, var(--hh-hue-rule-ink) 85%, transparent);
}
.fact-explain summary {
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.explain-formula,
.explain-inputs {
  margin: 0.15rem 0 0 0;
  color: color-mix(in srgb, var(--hh-accent) 80%, transparent);
}
.explain-inputs {
  font-variant-numeric: tabular-nums;
}
@media (prefers-reduced-motion: reduce) {
  .epilogue-card *,
  .epilogue-card {
    animation: none;
  }
}
</style>
