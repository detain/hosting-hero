<script setup lang="ts">
/**
 * Alert Stack (§8.8 left rail) — grouping, triage, and fatigue math all
 * live in alertStack.ts (pure, tested); this SFC is paint. Rules honored:
 * newest top, grouped by kind+lane, ack/snooze/silence, silenced stay
 * VISIBLE greyed, low signal-to-noise dims the whole stack, and the
 * cap-overflow ("+N" / "N suppressed by fatigue") rows are expandable —
 * suppression is visible, never silent (fairness contract).
 */
import { computed, ref, watch } from "vue";
import { projection } from "../state/observedStore";
import {
  EMPTY_STACK,
  ackAlert,
  ingestNotices,
  layoutStack,
  releaseExpiredSnoozes,
  reopenAlert,
  silenceAlert,
  snoozeAlert,
  type AlertStackState,
} from "./alertStack";
import { formatLatencyFromUs } from "./numberLaw";

const state = ref<AlertStackState>(EMPTY_STACK);
const showSuppressed = ref(false);
const SNOOZE_MINUTES = 30;

watch(projection, (p) => {
  if (p === null) return;
  let next = ingestNotices(state.value, p.notices);
  next = releaseExpiredSnoozes(next, p.minute);
  state.value = next;
});

const layout = computed(() => layoutStack(state.value));

function at(key: string, op: (s: AlertStackState, k: string) => AlertStackState): void {
  state.value = op(state.value, key);
}

function snooze(key: string): void {
  const until = (projection.value?.minute ?? 0) + SNOOZE_MINUTES;
  state.value = snoozeAlert(state.value, key, until);
}

/** atUs is sim-µs since t0 — show it as an elapsed-ms ruler (§8.15 ms law). */
function age(atUs: bigint, nowSimUs: bigint | undefined): string {
  if (nowSimUs === undefined) return "?";
  return `${formatLatencyFromUs(nowSimUs > atUs ? nowSimUs - atUs : 0n).value}ms ago`;
}

const nowSimUs = computed(() => projection.value?.clocks.simUs);
</script>

<template>
  <aside class="alert-stack" :class="{ dimmed: layout.dimmed }" data-test="alert-stack" aria-label="alert stack">
    <header class="snr">
      <span class="snr-label">signal : noise</span>
      <span class="snr-track" aria-hidden="true">
        <i class="snr-fill" :data-test="`snr-bar`" :style="{ width: `${Math.round(layout.snr * 100)}%` }" />
      </span>
      <b class="snr-value">{{ Math.round(layout.snr * 100) }}%</b>
    </header>

    <ol v-if="layout.rows.length > 0" class="rows">
      <li
        v-for="row in layout.rows"
        :key="row.key"
        class="row"
        :class="[`sev-${row.severity}`, { greyed: row.status !== 'new', snoozed: row.status === 'snoozed' }]"
        :data-test="`alert-row-${row.key}`"
        :data-status="row.status"
      >
        <span class="sev" aria-hidden="true">{{ "▮".repeat(row.severity === 1 ? 3 : row.severity === 2 ? 2 : 1) }}</span>
        <span class="body">
          <b class="kind">{{ row.kind }}</b>
          <i class="lane">{{ row.laneId ?? "global" }}</i>
          <em v-if="row.occurrences > 1" class="count">×{{ row.occurrences }}</em>
          <span class="age">{{ age(row.lastAtUs, nowSimUs) }}</span>
        </span>
        <span class="actions">
          <button v-if="row.status === 'new'" type="button" data-test="alert-ack" title="acknowledge" @click="at(row.key, ackAlert)">✓</button>
          <button v-if="row.status === 'new'" type="button" data-test="alert-snooze" title="snooze 30m" @click="snooze(row.key)">z</button>
          <button v-if="row.status === 'new'" type="button" data-test="alert-silence" title="silence (stays visible)" @click="at(row.key, silenceAlert)">∅</button>
          <button v-else type="button" data-test="alert-reopen" title="reopen" @click="at(row.key, reopenAlert)">↺</button>
        </span>
      </li>
    </ol>
    <p v-else class="empty" data-test="alert-empty">— quiet —</p>

    <button
      v-if="layout.suppressed.length > 0"
      type="button"
      class="suppressed"
      data-test="suppressed-toggle"
      :aria-expanded="showSuppressed"
      @click="showSuppressed = !showSuppressed"
    >
      {{ showSuppressed ? "▾" : "▸" }} {{ layout.suppressed.length }} suppressed by fatigue / overflow
    </button>
    <ul v-if="showSuppressed" class="suppressed-list" data-test="suppressed-list">
      <li v-for="row in layout.suppressed" :key="row.key" :data-test="`suppressed-${row.key}`">
        {{ row.kind }}@{{ row.laneId ?? "global" }} — {{ row.status }} ×{{ row.occurrences }}
        <button type="button" data-test="suppressed-reopen" @click="at(row.key, reopenAlert)">↺</button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.alert-stack {
  display: grid;
  gap: 6px;
  padding: 8px;
  font-family: var(--hh-typeface);
  color: color-mix(in srgb, var(--hh-accent) 70%, #fff);
  background: color-mix(in srgb, var(--hh-surface) 90%, #000);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 22%, transparent);
  border-radius: var(--hh-radius);
  max-width: 320px;
}
.alert-stack.dimmed { opacity: .45; }
.dimmed:hover { opacity: .85; } /* reachable, never sealed away */
.snr { display: flex; align-items: center; gap: 8px; font-size: 10px; letter-spacing: .08em; }
.snr-track { flex: 1; height: 3px; background: color-mix(in srgb, var(--hh-hue-grey) 25%, transparent); border-radius: 2px; overflow: hidden; }
.snr-fill { display: block; height: 100%; background: var(--hh-hue-green); transition: width .3s ease; }
@media (prefers-reduced-motion: reduce) { .snr-fill { transition: none; } }
.snr-value { font-variant-numeric: tabular-nums; }
.rows, .suppressed-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.row { display: flex; align-items: baseline; gap: 8px; font-size: 12px; border-radius: calc(var(--hh-radius) / 2); padding: 2px 4px; }
.row.greyed { opacity: .5; } /* silenced/acked: VISIBLE but greyed (§8.8) */
.row .sev { letter-spacing: -2px; }
.sev-1 .sev { color: var(--hh-hue-alarm); }
.sev-2 .sev { color: var(--hh-hue-gold); }
.sev-3 .sev { color: var(--hh-hue-azure); }
.body { flex: 1; display: flex; gap: 6px; align-items: baseline; }
.kind { font-weight: 600; }
.lane, .age { opacity: .55; font-size: 10px; font-style: normal; }
.count { font-variant-numeric: tabular-nums; color: var(--hh-hue-gold); font-size: 10px; }
.actions { display: flex; gap: 2px; }
.actions button { border: 1px solid color-mix(in srgb, var(--hh-accent) 35%, transparent); background: transparent; color: inherit; font: inherit; font-size: 10px; border-radius: 3px; padding: 0 5px; cursor: pointer; }
.actions button:hover { background: color-mix(in srgb, var(--hh-accent) 18%, transparent); }
.empty { margin: 0; font-size: 11px; opacity: .4; letter-spacing: .12em; text-align: center; }
.suppressed { border: none; background: transparent; color: inherit; font: inherit; font-size: 10px; opacity: .65; cursor: pointer; text-align: left; padding: 0; }
.suppressed:hover { opacity: 1; }
.suppressed-list { font-size: 10px; opacity: .7; }
</style>
