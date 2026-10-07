<script setup lang="ts">
/**
 * Explain-This-Number popover card (§8.8): the formula, its inputs, and —
 * the part that makes it a MECHANISM — inputs that are themselves clickable
 * whenever the registry maps them to a child entry. Drill-down walks a
 * `stepIntoTrail` stack (cycle + depth guarded), so recursion terminates on
 * raw facts or on the guard, never on luck.
 *
 * Modal budget: the popover asks the BudgetManager `modal` slot on open; if
 * refused, the parent renderer decides (we still show — chrome defies the
 * budget only for the one modal it IS).
 */
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { globalExplain, stepBackTrail, stepIntoTrail, type ExplainPayload } from "./explainRegistry";
import { globalBudget } from "../render/budget";

const props = defineProps<{
  /** Entry registered in the global explain registry (drill root). */
  rootId: string;
  open: boolean;
}>();

const emit = defineEmits<{ (e: "close"): void }>();

const trail = ref<readonly string[]>([props.rootId]);
watch(
  () => props.rootId,
  (id) => {
    trail.value = [id];
  },
);

const refusal = ref<string | null>(null);

const current = computed<{ id: string; payload: ExplainPayload } | null>(() => {
  const id = trail.value[trail.value.length - 1];
  if (id === undefined) return null;
  const entry = globalExplain.lookup(id);
  return entry === undefined ? null : { id, payload: entry.payload };
});

function childIdFor(inputName: string): string | undefined {
  const head = trail.value[trail.value.length - 1];
  if (head === undefined) return undefined;
  return globalExplain.childIdFor(head, inputName);
}

function drill(inputName: string): void {
  const childId = childIdFor(inputName);
  if (childId === undefined) return;
  const result = stepIntoTrail(trail.value, childId);
  if (!result.ok) {
    refusal.value = result.reason === "cycle" ? "already shown above — this is a raw fact loop" : "explanation depth limit";
    return;
  }
  refusal.value = null;
  trail.value = result.trail;
}

function back(): void {
  refusal.value = null;
  trail.value = stepBackTrail(trail.value);
}

const MODAL_ID = computed(() => `explain:${props.rootId}`);
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) globalBudget.admit({ id: MODAL_ID.value, category: "modal", priority: 40, pinned: true });
    else globalBudget.release(MODAL_ID.value);
  },
  { immediate: true },
);
onBeforeUnmount(() => globalBudget.release(MODAL_ID.value));
</script>

<template>
  <div v-if="props.open" class="explain" role="dialog" :aria-label="current?.payload.title ?? 'explain this number'" data-test="explain-popover">
    <header>
      <h3>{{ current?.payload.title ?? "unregistered figure" }}</h3>
      <button type="button" class="x" data-test="explain-close" aria-label="close" @click="emit('close')">✕</button>
    </header>
    <p v-if="current === null" class="fallback">
      No explanation registered — this number arrived from the wire unexplained. (Fog of authorship, not of data.)
    </p>
    <template v-else>
      <p class="formula" data-test="explain-formula">{{ current.payload.formula }}</p>
      <ul class="inputs">
        <li v-for="input in current.payload.inputs" :key="input.name">
          <button
            v-if="childIdFor(input.name) !== undefined"
            type="button"
            class="drill"
            :data-test="`explain-input-${input.name}`"
            @click="drill(input.name)"
          >
            <i>{{ input.name }}</i><b>{{ input.value }}</b>
          </button>
          <span v-else :data-test="`explain-input-${input.name}`"><i>{{ input.name }}</i><b>{{ input.value }}</b></span>
        </li>
      </ul>
      <p v-if="refusal !== null" class="refusal" data-test="explain-refusal">{{ refusal }}</p>
      <footer>
        <span class="depth">fact {{ trail.length }}</span>
        <button v-if="trail.length > 1" type="button" data-test="explain-back" @click="back">◂ back</button>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.explain {
  position: relative;
  min-width: 240px;
  max-width: 320px;
  padding: 10px 12px;
  font-family: var(--hh-typeface);
  background: color-mix(in srgb, var(--hh-surface) 94%, #fff 6%);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 45%, transparent);
  border-radius: var(--hh-radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, .45);
  color: color-mix(in srgb, var(--hh-accent) 70%, #fff);
}
header { display: flex; justify-content: space-between; align-items: baseline; }
h3 { margin: 0; font-size: 13px; letter-spacing: .04em; }
.x { border: none; background: transparent; color: inherit; cursor: pointer; font-size: 12px; opacity: .6; }
.formula {
  margin: 8px 0;
  padding: 6px 8px;
  font-size: 12px;
  background: color-mix(in srgb, var(--hh-accent) 8%, transparent);
  border-left: 2px solid color-mix(in srgb, var(--hh-accent) 60%, transparent);
  border-radius: 2px;
}
.inputs { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.inputs i { font-style: normal; opacity: .6; margin-right: 8px; font-size: 11px; }
.inputs b { font-variant-numeric: tabular-nums; font-size: 12px; }
.drill {
  border: none;
  border-bottom: 1px dashed color-mix(in srgb, var(--hh-accent) 55%, transparent);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  padding: 0;
}
.drill:hover { background: color-mix(in srgb, var(--hh-accent) 12%, transparent); }
.refusal { font-size: 11px; color: var(--hh-hue-gold); margin: 6px 0 0; }
footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.depth { font-size: 10px; opacity: .5; letter-spacing: .08em; }
footer button { border: none; background: transparent; color: inherit; font: inherit; font-size: 11px; cursor: pointer; }
</style>
