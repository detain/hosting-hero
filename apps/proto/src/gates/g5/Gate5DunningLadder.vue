<script setup lang="ts">
/** GATE-G5 · dunning ladder widget — per-contract stage pip chain (§6.4).
 *  failed → retry → reminder → warning → suspend → terminate. */
import type { DunningRow, ExplainPayload } from "./projection.ts";

defineProps<{ rows: readonly DunningRow[] }>();
const emit = defineEmits<{ explain: [payload: ExplainPayload] }>();
</script>

<template>
  <section class="g5-panel" aria-label="Dunning ladders">
    <h2 class="g5-h">DUNNING LADDER · every rung has a date</h2>
    <ul class="g5-ladders">
      <li
        v-for="row in rows"
        :key="row.contractId"
        class="g5-ladder"
        :data-test="`g5-dunning-row-${row.contractId}`"
        @click="emit('explain', row.explain)"
      >
        <span class="g5-lid">{{ row.contractId }}</span>
        <span class="g5-llabel">{{ row.label }}</span>
        <span class="g5-pips" role="img" :aria-label="`ladder ${row.outcome}`">
          <span
            v-for="pip in row.pips"
            :key="pip.stage"
            class="g5-pip"
            :class="{ 'g5-pip--on': pip.reached }"
            :data-test="`g5-dunning-pip-${row.contractId}-${pip.stage}`"
            :title="pip.label"
          />
        </span>
        <span
          class="g5-loutcome"
          :class="row.outcome === 'written off' ? 'g5-dead' : row.outcome.startsWith('RESURRECTED') ? 'g5-back' : 'g5-climbing'"
        >{{ row.outcome }}</span>
      </li>
      <li v-if="rows.length === 0" class="g5-quiet">no card has declined yet. enjoy it.</li>
    </ul>
  </section>
</template>

<style scoped>
.g5-ladders { list-style: none; margin: 0; padding: 0; }
.g5-ladder {
  display: grid;
  grid-template-columns: 34px minmax(90px, 1fr) auto 148px;
  gap: 10px;
  align-items: center;
  padding: 6px 4px;
  border-bottom: 1px dotted var(--g5-rule);
  font-size: 11.5px;
  cursor: pointer;
}
.g5-ladder:hover { background: var(--g5-card-hot); }
.g5-lid { font-weight: 700; }
.g5-llabel { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.g5-pips { display: flex; gap: 4px; }
.g5-pip {
  width: 14px;
  height: 14px;
  border: 1px solid var(--g5-rule-strong);
  background: var(--g5-card);
  transform: rotate(45deg);
}
.g5-pip--on { background: var(--g5-oxide); border-color: var(--g5-oxide); }
.g5-loutcome { text-align: right; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; }
.g5-dead { color: var(--g5-oxide); }
.g5-back { color: var(--g5-mint); }
.g5-climbing { color: var(--g5-sodium); }
.g5-quiet { color: var(--g5-ink-dim); font-style: italic; font-size: 11.5px; padding: 6px 4px; }
</style>
