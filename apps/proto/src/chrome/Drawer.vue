<script setup lang="ts">
/**
 * Drawer skeleton (§1.4 house spec): the graph-drawer slot, closed by default,
 * opens under the top bar. P0 = panels that prove the promotion hand-off and
 * the readout toggle live here; real drawers (Ledger Tape etc.) land later.
 */
import { ref } from "vue";

const open = ref(false);
const readout = defineModel<boolean>("readout", { default: false });

defineExpose({ open });
</script>

<template>
  <aside class="drawer" :class="{ open }" aria-label="chrome drawer">
    <button class="tab" @click="open = !open" :aria-expanded="open">
      {{ open ? "▾" : "▴" }} DRAWER
    </button>
    <div v-if="open" class="body">
      <label class="toggle">
        <input type="checkbox" v-model="readout" />
        Readout Mode <em>(honest text instead of diegetic faces)</em>
      </label>
      <p class="note">Ledger Tape · Alerts · Policy ghosts land here in later waves.</p>
    </div>
  </aside>
</template>

<style scoped>
.drawer {
  position: absolute;
  left: 16px;
  bottom: 0;
  font-family: var(--hh-typeface);
}
.tab {
  background: color-mix(in srgb, var(--hh-surface) 90%, #000);
  color: var(--hh-accent);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 35%, transparent);
  border-bottom: none;
  border-radius: var(--hh-radius) var(--hh-radius) 0 0;
  padding: 6px 14px;
  cursor: pointer;
  letter-spacing: .14em;
  font-size: 11px;
}
.body {
  width: 320px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--hh-surface) 94%, #000);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 35%, transparent);
  border-bottom: none;
  border-radius: var(--hh-radius) var(--hh-radius) 0 0;
  color: var(--hh-accent);
}
.toggle { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
.toggle em { opacity: .55; font-style: normal; font-size: 11px; }
.note { opacity: .5; font-size: 11px; margin-bottom: 0; }
</style>
