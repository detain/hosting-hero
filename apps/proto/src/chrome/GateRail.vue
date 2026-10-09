<script setup lang="ts">
/**
 * GateRail — the shell's left mount-selector (J1). Vertical rail listing every
 * stage-mountable gate by title (plus the "Sandbox" mock-runner view), driven
 * by the frozen ALL_GATE_MOUNTS aggregate. Keyboard-navigable per §1.10:
 * role="tablist" with roving tabindex — ArrowUp/ArrowDown move focus AND
 * selection (the stage swaps live), Home/End jump to the ends.
 *
 * Styling obeys the era law: only the four --hh-* tokens carry identity, so
 * the rail re-skins 1998↔2026 for free. The selected row gets the accent
 * edge-bar and a surface lift — one quiet motion, no confetti.
 */
import { ref, watch, nextTick } from "vue";

export interface RailEntry {
  readonly id: string;
  readonly badge: string;
  readonly title: string;
  readonly subtitle: string;
}

const props = defineProps<{
  readonly entries: readonly RailEntry[];
  readonly modelValue: string;
}>();

const emit = defineEmits<{ "update:modelValue": [id: string] }>();

const buttons = ref<(HTMLButtonElement | null)[]>([]);

function select(index: number): void {
  const entry = props.entries[index];
  if (entry === undefined) return;
  emit("update:modelValue", entry.id);
}

function onKeydown(event: KeyboardEvent, index: number): void {
  const last = props.entries.length - 1;
  let next: number | null = null;
  if (event.key === "ArrowDown") next = index === last ? 0 : index + 1;
  else if (event.key === "ArrowUp") next = index === 0 ? last : index - 1;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = last;
  if (next === null) return;
  event.preventDefault();
  select(next);
  void nextTick(() => buttons.value[next]?.focus());
}

// Keep the roving tabindex honest when the selection changes from elsewhere.
watch(
  () => props.modelValue,
  () => {
    /* focus is intentionally NOT stolen on external change (e.g. keybinds). */
  },
);
</script>

<template>
  <nav class="gate-rail" role="tablist" aria-orientation="vertical" aria-label="prototype gates">
    <button
      v-for="(entry, i) in props.entries"
      :key="entry.id"
      :ref="(el) => (buttons[i] = el as HTMLButtonElement | null)"
      class="gate-rail__item"
      :class="{ 'gate-rail__item--active': entry.id === props.modelValue }"
      role="tab"
      type="button"
      :aria-selected="entry.id === props.modelValue"
      :tabindex="entry.id === props.modelValue ? 0 : -1"
      :data-test-id="`gate-rail-${entry.id}`"
      @click="select(i)"
      @keydown="onKeydown($event, i)"
    >
      <span class="gate-rail__badge" aria-hidden="true">{{ entry.badge }}</span>
      <span class="gate-rail__text">
        <span class="gate-rail__title">{{ entry.title }}</span>
        <span class="gate-rail__subtitle">{{ entry.subtitle }}</span>
      </span>
    </button>
  </nav>
</template>

<style scoped>
.gate-rail {
  position: absolute;
  top: 52px;
  bottom: 34px;
  left: 0;
  width: 208px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 0;
  overflow-y: auto;
  z-index: 25;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--hh-surface) 92%, #fff 8%) 0%,
      color-mix(in srgb, var(--hh-surface) 99%, #000 1%) 100%
    );
  border-right: 1px solid color-mix(in srgb, var(--hh-accent) 26%, transparent);
  box-shadow: 18px 0 40px -28px #000;
}
.gate-rail__item {
  all: unset;
  display: flex;
  align-items: stretch;
  gap: 10px;
  padding: 8px 10px 8px 0;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background 140ms ease, border-color 140ms ease;
}
.gate-rail__item:hover {
  background: color-mix(in srgb, var(--hh-accent) 8%, transparent);
}
.gate-rail__item:focus-visible {
  outline: 2px solid var(--hh-accent);
  outline-offset: -2px;
}
.gate-rail__item--active {
  border-left-color: var(--hh-accent);
  background: color-mix(in srgb, var(--hh-accent) 14%, transparent);
}
/* §8.14 reduced-motion law — hover/border easing goes instant when requested. */
@media (prefers-reduced-motion: reduce) {
  .gate-rail__item { transition: none; }
}
.gate-rail__badge {
  align-self: center;
  min-width: 34px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  letter-spacing: 0.08em;
  padding: 3px 4px;
  border-radius: var(--hh-radius);
  color: var(--hh-accent);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 40%, transparent);
  background: color-mix(in srgb, var(--hh-surface) 70%, #000);
}
.gate-rail__item--active .gate-rail__badge {
  color: var(--hh-surface);
  background: var(--hh-accent);
}
.gate-rail__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.gate-rail__title {
  font-size: 13px;
  line-height: 1.2;
  color: color-mix(in srgb, var(--hh-accent) 85%, #fff);
}
.gate-rail__subtitle {
  font-size: 10.5px;
  line-height: 1.35;
  color: color-mix(in srgb, var(--hh-accent) 45%, #fff);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
