<script setup lang="ts">
/** GATE-G5 · pipeline kanban — Lead → Contracted → Billing → Renewal (+ Closed
 *  book). Driven EXCLUSIVELY by the read-projection frame; no sim mutators. */
import type { ExplainPayload, KanbanColumn } from "./projection.ts";

defineProps<{ columns: readonly KanbanColumn[] }>();
const emit = defineEmits<{ explain: [payload: ExplainPayload] }>();
</script>

<template>
  <section class="g5-kanban" aria-label="Deal pipeline">
    <div
      v-for="col in columns"
      :key="col.column"
      class="g5-col"
      :class="`g5-col--${col.column}`"
      :data-test="`g5-kanban-col-${col.column}`"
    >
      <button class="g5-col-head" type="button" @click="emit('explain', col.explain)">
        {{ col.title.toUpperCase() }}
        <span class="g5-col-count">{{ col.cards.length }}</span>
      </button>
      <ul class="g5-cards">
        <li
          v-for="card in col.cards"
          :key="card.contractId"
          class="g5-card"
          :class="`g5-role--${card.role}`"
          :data-test="`g5-card-${card.contractId}`"
          @click="emit('explain', card.explain)"
        >
          <span class="g5-card-id">{{ card.contractId }}</span>
          <span class="g5-card-label">{{ card.label }}</span>
          <span class="g5-card-mrc">{{ card.mrcText }}</span>
          <span class="g5-card-hint">{{ card.hint }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.g5-kanban {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 2px;
  background: var(--g5-rule);
}
.g5-col {
  background: var(--g5-panel);
  padding: 8px 8px 12px;
  min-height: 128px;
}
.g5-col-head {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font: 700 11px/1 var(--hh-typeface, var(--g5-typeface));
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--g5-ink-dim);
  background: none;
  border: 0;
  border-bottom: 2px solid var(--g5-ink-dim);
  padding: 0 0 6px;
  cursor: pointer;
}
.g5-col--renewal .g5-col-head { color: var(--g5-sodium); border-color: var(--g5-sodium); }
.g5-col--offbook .g5-col-head { color: var(--g5-oxide); border-color: var(--g5-oxide); }
.g5-col-count { font-size: 15px; letter-spacing: 0; }
.g5-cards { list-style: none; margin: 6px 0 0; padding: 0; display: grid; gap: 4px; }
.g5-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto;
  gap: 0 6px;
  padding: 5px 7px;
  background: var(--g5-card);
  border-left: 3px solid var(--g5-ink-dim);
  font-size: 12px;
  cursor: pointer;
}
.g5-card:hover { background: var(--g5-card-hot); }
.g5-card-id { font-weight: 700; color: var(--g5-ink); }
.g5-card-label { color: var(--g5-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.g5-card-mrc { color: var(--g5-mint); font-variant-numeric: tabular-nums; }
.g5-card-hint { grid-column: 1 / -1; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--g5-ink-dim); }
.g5-role--whale { border-left-color: var(--g5-sodium); }
.g5-role--doomed { border-left-color: var(--g5-oxide); }
.g5-role--survivor { border-left-color: var(--g5-teal); }
.g5-role--b2b { border-left-color: var(--g5-putty); }
</style>
