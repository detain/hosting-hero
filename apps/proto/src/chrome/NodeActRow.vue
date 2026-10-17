<script setup lang="ts">
/**
 * NodeActRow — the §7.16 Act row as one-click chrome (L-HUD).
 *
 * Thin by law: every status word and every minted payload comes from
 * actRow.ts pure logic; this file only selects a node, clicks, and shows
 * the door's own receipt VERBATIM (refusals are law-teaching — the raw
 * `code: detail` rides through describeRefusal, which voices the five
 * pack-covered codes and falls back visibly for everything else).
 *
 * Zero timers, zero watchers: the parent's stepper drives reactivity by
 * replacing the `facts` prop after each headlessStep (computed-from-state
 * pattern, FlavourFeed's structural twin). No sink (`submit: null`) ⇒
 * every button renders disabled — the lab never fakes a live door.
 */
import { computed, ref } from "vue";
import type { PlayerIntent } from "@hh/sim-core/types";
import type { TickFacts } from "../runner/simCoreRunner";
import { describeRefusal } from "../i18n/refusalCopy";
import { compareCodeUnits } from "./textLaw";
import { actIntentClock, deriveActReceipt, deriveActRow, mintActIntent, type ActAction } from "./actRow";

const props = defineProps<{
  readonly facts: TickFacts | null;
  readonly submit: ((intent: PlayerIntent) => void) | null;
}>();

const selected = ref<string | null>(null);
const seq = ref(0);

const nodeIds = computed<readonly string[]>(() =>
  props.facts === null ? [] : [...props.facts.game.nodes.keys()].map(String).sort(compareCodeUnits),
);

const activeNodeId = computed<string | null>(() => {
  const ids = nodeIds.value;
  if (ids.length === 0) return null;
  return selected.value !== null && ids.includes(selected.value) ? selected.value : (ids[0] ?? null);
});

const model = computed(() =>
  props.facts === null || activeNodeId.value === null ? null : deriveActRow(props.facts.game, activeNodeId.value),
);

const actRows = computed(() => model.value?.rows.filter((r) => r.section === "act") ?? []);
const deskRows = computed(() => model.value?.rows.filter((r) => r.section === "desk") ?? []);

const receipt = computed(() => (props.facts === null ? null : deriveActReceipt(props.facts.events)));

/** Refusal copy: the five voiced door codes speak from the pack; anything
 *  else rides raw (describeRefusal's visible-fallback law). `source` keeps
 *  the origin honest for tests: wire = executed detail, pack|raw = refusal. */
const receiptView = computed<{ text: string; source: "none" | "wire" | "pack" | "raw" }>(() => {
  const r = receipt.value;
  const facts = props.facts;
  if (r === null || facts === null) return { text: "no door receipt yet — nothing has gone through the rail", source: "none" };
  if (r.kind === "executed") return { text: `${r.verb} ✓ ${r.text}`, source: "wire" };
  const line = describeRefusal(r.text, {
    verb: r.verb,
    tick: String(facts.game.context.tick),
    hands: (facts.game.hands?.tokens ?? []).map((t) => ({ busyUntilTick: String(t.busyUntilTick), busyCauseId: t.busyCauseId })),
  });
  return { text: `${r.verb} ✗ ${line.text}`, source: line.fromPack ? "pack" : "raw" };
});

function chipClass(verbKey: string, live: boolean): string {
  if (!live) return "idle";
  switch (verbKey) {
    case "isolate": return "alarm";
    case "throttle": case "restart": return "amber";
    case "reclaim": return "tomb";
    default: return "green";
  }
}

function fire(a: ActAction): void {
  const modelValue = model.value;
  if (!a.enabled || props.submit === null || modelValue === null) return;
  const args = mintActIntent(a.verb, modelValue.nodeId, modelValue.minute, a.options);
  props.submit(
    Object.freeze({
      seq: seq.value++,
      clock: actIntentClock(a.verb),
      atUs: 0n,
      origin: "player" as const,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  );
}
</script>

<template>
  <div class="act-row" data-test="act-row" :data-minute="model === null ? '' : model.minute">
    <div class="nodes" data-test="act-nodes">
      <button
        v-for="id in nodeIds"
        :key="id"
        type="button"
        class="node"
        :class="{ on: id === activeNodeId }"
        :data-test="`act-node-${id}`"
        @click="selected = id"
      >{{ id }}</button>
      <span v-if="nodeIds.length === 0" class="empty" data-test="act-nodes-empty">no nodes — world not stepped yet</span>
    </div>

    <template v-if="model !== null">
      <p class="label">Act — one-click emergency, at most four (§7.16)</p>
      <div v-for="r in actRows" :key="r.verbKey" class="r">
        <span class="chip" :class="chipClass(r.verbKey, r.live)" :data-test="`act-status-${r.verbKey}`" :data-live="r.live">{{ r.status === "" ? "idle" : r.status }}</span>
        <button
          v-for="a in r.actions"
          :key="a.key"
          type="button"
          class="a"
          :data-test="`act-${a.key}`"
          :data-enabled="a.enabled"
          :disabled="!a.enabled || props.submit === null"
          :title="a.title ?? undefined"
          @click="fire(a)"
        >{{ a.label }}</button>
      </div>

      <p class="label">Desk — tier successors & live books (readouts via the engine's own as-of laws)</p>
      <div v-for="r in deskRows" :key="r.verbKey" class="r">
        <span class="chip" :class="chipClass(r.verbKey, r.live)" :data-test="`act-status-${r.verbKey}`" :data-live="r.live">{{ r.status === "" ? "idle" : r.status }}</span>
        <button
          v-for="a in r.actions"
          :key="a.key"
          type="button"
          class="a"
          :data-test="`act-${a.key}`"
          :data-enabled="a.enabled"
          :disabled="!a.enabled || props.submit === null"
          :title="a.title ?? undefined"
          @click="fire(a)"
        >{{ a.label }}</button>
      </div>
    </template>

    <p class="receipt" :class="`receipt--${receipt === null ? 'none' : receipt.kind}`" :data-source="receiptView.source" data-test="act-receipt">{{ receiptView.text }}</p>
  </div>
</template>

<style scoped>
.act-row { display: grid; gap: 8px; font-family: var(--hh-typeface); }
.nodes { display: flex; flex-wrap: wrap; gap: 6px; }
.empty { font-size: 10px; color: var(--hh-hue-grey); }
.label {
  margin: 2px 0 0;
  font-size: 9px;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: var(--hh-hue-grey);
}
.r { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.chip {
  min-width: 150px;
  padding: 1px 8px;
  font-size: 10px;
  border-radius: var(--hh-radius);
  border: 1px solid color-mix(in srgb, var(--hh-hue-grey) 40%, transparent);
  color: var(--hh-hue-grey);
  font-variant-numeric: tabular-nums;
}
.chip.alarm { color: var(--hh-hue-alarm); border-color: color-mix(in srgb, var(--hh-hue-alarm) 55%, transparent); }
.chip.amber { color: var(--hh-hue-amber); border-color: color-mix(in srgb, var(--hh-hue-amber) 55%, transparent); }
/* Contrast census law (a11y/contrastAudit.ts, untouched by this lane): the
   tombstone frames itself with the ledger's final-state red but SPEAKS in
   the audited klaxon alarm; executed receipts ride the audited served-ok
   green — white intent-ink stays a canvas job, not a text pair. */
.chip.tomb { color: var(--hh-hue-alarm); border-color: color-mix(in srgb, var(--hh-hue-red) 70%, transparent); }
.chip.green { color: var(--hh-hue-green); border-color: color-mix(in srgb, var(--hh-hue-green) 55%, transparent); }
button.node, button.a {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 40%, transparent);
  background: transparent;
  color: var(--hh-accent);
  font: inherit;
  font-size: 11px;
  border-radius: var(--hh-radius);
  padding: 2px 10px;
  cursor: pointer;
}
button.node.on { background: var(--hh-accent); color: var(--hh-surface); border-color: var(--hh-accent); }
button.a:disabled, button.node:disabled { opacity: .4; cursor: default; }
.receipt { margin: 0; font-size: 11px; font-variant-numeric: tabular-nums; color: var(--hh-hue-green); }
.receipt--refused { color: var(--hh-hue-azure); }
.receipt--none { color: var(--hh-hue-grey); }
</style>
