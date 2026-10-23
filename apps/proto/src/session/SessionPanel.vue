<script setup lang="ts">
/**
 * SessionPanel — the slice-(d) playable product session (§9.13 gap register).
 *
 * One continuous run of the colo line: real shipped waves (boot.corpus) over
 * a seeded four-node maze (boot.build), the watch-the-door book armed
 * (boot.rules), the money lane ticking, the door open from tick 1, and a
 * clean halt when the company dissolves. It reads ONLY the global observed
 * store (the LossCard/TopBar posture — frames arrive via the shell's own
 * SimClient ingest) and talks back ONLY through the sessionBus handle:
 * verbs via sendPlayerVerb, halt via client.halt(). Zero timers (the worker
 * ticks itself; the Step button pumps the in-process fake — a user gesture,
 * the G4 law). Zero globalBudget claims. Colors: era tokens + hue vars only.
 */
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { connectionState, projection } from "../state/observedStore";
import { hudPermanentRows } from "../chrome/metrics";
import { CAUSAL_EPILOGUE, CAUSE_UNKNOWN_EPILOGUE, extractDeathCause, extractDeathPhase } from "../chrome/deathWatch";
import { sessionHandle, type SessionPumpHost } from "./sessionBus";
import {
  SESSION_DOOR_VERBS,
  outcomeAttributionSum,
  parseMoneyTape,
  parseReceipts,
  parseRuleFires,
  readBoardHealth,
  entryAttributionSum,
  type MoneyTape,
  type ReceiptRow,
} from "./sessionModel";

const tape = ref<MoneyTape | null>(null);
const receipts = ref<readonly ReceiptRow[]>([]);
const ruleFires = ref<readonly string[]>([]);
const endedCause = ref<string | null>(null);
const halted = ref(false);

const boardRows = computed(() => readBoardHealth(projection.value));
const moneyRows = computed(() => hudPermanentRows(projection.value));
const running = computed(() => projection.value !== null && !halted.value);

function pumpHost(host: SessionPumpHost | null): void {
  host?.pump(1);
}

function sendVerb(args: Readonly<Record<string, string | number | null>>): void {
  sessionHandle.value?.client.sendPlayerVerb(args);
}

function step(): void {
  pumpHost(sessionHandle.value?.host ?? null);
}

function stop(): void {
  const handle = sessionHandle.value;
  if (handle === null || halted.value) return;
  handle.client.halt();
  halted.value = true;
}

watch(projection, (frame) => {
  // flush:"sync" — the store's shallowRef can receive WHOLE FRAMES back to
  // back faster than the default queue flushes (the fake's pump loop, a busy
  // worker). Batched watching would silently drop a receipt — or worse, the
  // dissolved rider that arms the terminal halt. Every frame gets folded.
  if (frame === null) return;
  tape.value = parseMoneyTape(frame.notices, tape.value);
  receipts.value = parseReceipts(frame.notices, receipts.value);
  ruleFires.value = parseRuleFires(frame.notices, ruleFires.value);
  if (halted.value) return;
  // Terminal law: the engine keeps folding post-dissolution no-op (B3), so
  // the HOST halts — the rider grammar is chrome/deathWatch's authority.
  if (extractDeathPhase(frame.notices) === "dissolved") {
    endedCause.value = extractDeathCause(frame.notices);
    stop();
  }
}, { flush: "sync" });

onBeforeUnmount(() => {
  // Leaving the view re-boots the sandbox (App law); the run must not keep
  // burning hands nobody is watching. Halt is idempotent worker-side.
  const handle = sessionHandle.value;
  if (handle !== null && !halted.value) handle.client.halt();
});

const tick = computed(() => projection.value?.tick ?? 0);
const minute = computed(() => projection.value?.minute ?? 0);
const counters = computed(() => projection.value?.counters ?? null);
const endEpilogue = computed(() =>
  endedCause.value !== null
    ? CAUSAL_EPILOGUE[endedCause.value as keyof typeof CAUSAL_EPILOGUE]
    : CAUSE_UNKNOWN_EPILOGUE,
);

function display(n: number | null): string {
  return n === null ? "?" : Number.isInteger(n) ? String(n) : n.toFixed(2);
}
</script>

<template>
  <div class="session-panel" data-test="sess-panel">
    <header class="sess-head">
      <div class="sess-status" role="status" aria-live="polite">
        <strong>colo line — live session</strong>
        <span data-test="sess-tick">tick {{ tick }} · minute {{ minute }}</span>
        <span v-if="connectionState !== 'live'" class="sess-fault">{{ connectionState }}</span>
        <span v-else-if="halted" class="sess-halt" data-test="sess-halted">halted</span>
        <span v-else class="sess-live">running</span>
      </div>
      <div class="sess-controls">
        <button v-if="sessionHandle?.host" type="button" data-test="sess-step" @click="step">Step</button>
        <button type="button" data-test="sess-stop" :disabled="halted" @click="stop">Stop</button>
      </div>
    </header>

    <section class="sess-leg" aria-label="money leg">
      <h2>Money</h2>
      <table class="sess-table" data-test="sess-money">
        <tbody>
          <tr v-for="row in moneyRows" :key="row.id" :data-test="`sess-money-${row.id}`">
            <th scope="row">{{ row.label }}</th>
            <td :class="{ 'sess-nodata': row.state === 'no-data' }">{{ row.value }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="sess-leg" aria-label="board leg">
      <h2>Board</h2>
      <table class="sess-table sess-board" data-test="sess-board">
        <thead>
          <tr>
            <th scope="col">node</th><th scope="col">ρ</th><th scope="col">queue</th>
            <th scope="col">entered</th><th scope="col">served</th><th scope="col">bounced</th>
            <th scope="col">fp-blocks</th><th scope="col">landed</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in boardRows" :key="r.id" :data-test="`sess-node-${r.id.replace('/', '-')}`">
            <th scope="row">{{ r.id }}</th>
            <td>{{ display(r.rho) }}</td>
            <td>{{ display(r.queueDepth) }}</td>
            <td>{{ display(r.entryArrivalsTotal) }}</td>
            <td>{{ display(r.outcomeServedTotal) }}</td>
            <td>{{ display(r.outcomeBouncedTotal) }}</td>
            <td>{{ display(r.outcomeFalsePositiveTotal) }}</td>
            <td>{{ display(r.outcomeLandedTotal) }}</td>
          </tr>
        </tbody>
      </table>
      <p class="sess-conservation" data-test="sess-conservation">
        attribution: entered {{ entryAttributionSum(boardRows) }} · outcomes
        {{ outcomeAttributionSum(boardRows) }} · counters
        {{ counters ? counters.served + counters.bounced + counters.blockedFalsePositive + counters.landed : "?" }}
      </p>
    </section>

    <section class="sess-leg" aria-label="door leg">
      <h2>Intent door — hands rail of 3 from tick 1</h2>
      <div class="sess-verbs">
        <button
          v-for="verb in SESSION_DOOR_VERBS"
          :key="verb.id"
          type="button"
          :data-test="`sess-verb-${verb.id}`"
          :title="verb.why"
          :disabled="halted"
          @click="sendVerb(verb.args)"
        >{{ verb.label }}</button>
      </div>
      <ul class="sess-tape" role="log" aria-live="polite" data-test="sess-receipts">
        <li v-for="(r, i) in receipts" :key="`${i}-${r.detail}`" :class="r.kind">
          <span class="receipt-kind">{{ r.kind === "intent-executed" ? "✓" : "✗" }}</span>
          {{ r.detail }}
        </li>
      </ul>
    </section>

    <section class="sess-leg" aria-label="money tape">
      <h2>Economy tape</h2>
      <ul class="sess-tape" role="log" aria-live="polite" data-test="sess-tape">
        <li v-for="(row, i) in tape?.rows ?? []" :key="`${i}-${row.kind}-${row.contractId}`">
          {{ row.kind }} · {{ row.contractId }}
        </li>
      </ul>
      <p v-if="ruleFires.length" class="sess-rules" data-test="sess-rules">
        book fired: <span v-for="f in ruleFires" :key="f" class="rule-chip">{{ f }}</span>
      </p>
    </section>

    <aside v-if="halted" class="sess-end" role="alertdialog" aria-label="end of run" data-test="sess-end">
      <h2>End of run</h2>
      <p class="sess-end-cause" data-test="sess-end-cause">{{ endEpilogue }}</p>
      <p v-if="counters" class="sess-end-counters">
        served {{ counters.served }} · bounced {{ counters.bounced }} ·
        false-positive blocks {{ counters.blockedFalsePositive }} · landed {{ counters.landed }}
      </p>
      <p class="sess-end-money" data-test="sess-end-money">
        cash {{ moneyRows.find((m) => m.id === 'cash')?.value ?? '?' }} ·
        reputation {{ moneyRows.find((m) => m.id === 'reputation')?.value ?? '?' }}
      </p>
    </aside>
  </div>
</template>

<style scoped>
.session-panel {
  padding: 16px 20px 56px;
  display: grid;
  gap: 18px;
  max-width: 880px;
}
.sess-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid color-mix(in srgb, var(--hh-accent) 22%, transparent);
  padding-bottom: 8px;
}
.sess-status {
  display: flex;
  gap: 14px;
  font-size: 13px;
}
.sess-live {
  color: var(--hh-hue-green);
}
.sess-halt,
.sess-fault {
  color: var(--hh-hue-alarm);
}
.sess-controls {
  display: flex;
  gap: 8px;
}
.sess-leg h2 {
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
  opacity: .6;
  margin: 0 0 6px;
}
.sess-table {
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  width: 100%;
}
.sess-table th,
.sess-table td {
  text-align: left;
  padding: 2px 10px 2px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--hh-accent) 10%, transparent);
}
.sess-nodata {
  opacity: .45;
}
.sess-conservation {
  font-size: 11px;
  opacity: .55;
  margin: 6px 0 0;
  font-variant-numeric: tabular-nums;
}
.sess-verbs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.sess-verbs button {
  border-radius: var(--hh-radius);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 35%, transparent);
  background: color-mix(in srgb, var(--hh-surface) 88%, var(--hh-accent));
  color: var(--hh-accent);
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}
.sess-verbs button:disabled {
  opacity: .4;
  cursor: default;
}
.sess-tape {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 12px;
  max-height: 168px;
  overflow: auto;
  color: color-mix(in srgb, var(--hh-accent) 85%, #fff);
}
.sess-tape li {
  padding: 2px 0;
  border-bottom: 1px dashed color-mix(in srgb, var(--hh-accent) 12%, transparent);
}
.sess-tape li.intent-refused .receipt-kind {
  color: var(--hh-hue-alarm);
}
.sess-tape li.intent-executed .receipt-kind {
  color: var(--hh-hue-green);
}
.sess-rules {
  font-size: 11px;
  margin: 6px 0 0;
  opacity: .8;
}
.rule-chip {
  display: inline-block;
  margin-right: 6px;
  padding: 1px 6px;
  border: 1px solid color-mix(in srgb, var(--hh-hue-rule-ink) 60%, transparent);
  border-radius: var(--hh-radius);
  color: var(--hh-hue-rule-ink);
}
.sess-end {
  border: 1px solid var(--hh-hue-alarm);
  border-radius: var(--hh-radius);
  padding: 12px 16px;
  background: color-mix(in srgb, var(--hh-hue-alarm) 10%, var(--hh-surface));
}
.sess-end h2 {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--hh-hue-alarm);
  margin: 0 0 6px;
}
.sess-end-cause,
.sess-end-counters,
.sess-end-money {
  font-size: 12px;
  margin: 4px 0;
}
</style>
