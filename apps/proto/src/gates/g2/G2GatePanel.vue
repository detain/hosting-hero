<script setup lang="ts">
/**
 * G2 — the Attack Surface Ledger panel (§9.13 gate #2).
 * Three columns, one argument: capability and risk are the SAME purchase.
 *   1. Build palette — every tile shows, BEFORE you buy, the exact threats
 *      it would invite (P2 at point of purchase).
 *   2. Live threat surface — the spawnable pool, collapsed by family, with
 *      mastery demotion (countered ≥5 ⇒ weather, "Mastered") and the
 *      retirement ghosts still haunting the deck.
 *   3. Construction log — the append-only build sequence that the ledger IS.
 *
 * Era-agnostic: consumes only the four chrome tokens (§1.6 token law).
 */
import { computed, ref, shallowRef } from "vue";
import { DEFAULT_LEDGER_CONFIG } from "@hh/sim-core/waves";
import type { G2BundleId, ThreatId } from "./corpus";
import { G2_BUNDLES, THREAT_CATALOG } from "./corpus";
import { createG2Session, type G2Session, type G2View } from "./g2Session";

const LAG = 20n; // demo-scoped retirement lag so the memo arrives on-screen
const cfg = { ...DEFAULT_LEDGER_CONFIG, retirementLagTicks: LAG };

const bundleId = ref<G2BundleId>("official:shared-web");
const session = shallowRef<G2Session>(createG2Session(bundleId.value, cfg));
const view = shallowRef<G2View>(session.value.view());

function refresh(): void {
  view.value = session.value.view();
}

function switchBundle(next: G2BundleId): void {
  bundleId.value = next;
  session.value = createG2Session(next, cfg);
  refresh();
}

function build(componentTemplateId: string): void {
  session.value.build(componentTemplateId);
  refresh();
}

function retire(componentTemplateId: string): void {
  session.value.retire(componentTemplateId);
  refresh();
}

function counter(threatId: ThreatId): void {
  session.value.counter(threatId);
  refresh();
}

function advance(n: number): void {
  session.value.tickForward(n);
  refresh();
}

function reset(): void {
  session.value = createG2Session(bundleId.value, cfg);
  refresh();
}

const components = computed(() => G2_BUNDLES[bundleId.value].components);
const threatFact = (id: ThreatId) => THREAT_CATALOG[id];

/** Buildables currently existing — last-op-wins fold of the visible log
 *  (the ledger's own semantics, mirrored for the button state only). */
function currentIds(): string[] {
  const last = new Map<string, "build" | "remove">();
  for (const row of view.value.log) last.set(row.buildableId, row.op);
  const out: string[] = [];
  for (const [id, op] of last) if (op === "build") out.push(id);
  return out;
}
const exists = computed(() => new Set(currentIds()));
</script>

<template>
  <section class="g2" data-gate="G2" aria-label="Attack Surface Ledger gate">
    <header class="g2-head">
      <div class="ident">
        <span class="stamp">G2</span>
        <div>
          <h2>Attack Surface Ledger</h2>
          <p class="motto">your construction log <em>is</em> the threat deck</p>
        </div>
      </div>
      <div class="controls">
        <div class="bundles" role="tablist" aria-label="hosting type">
          <button
            v-for="id in Object.keys(G2_BUNDLES) as G2BundleId[]"
            :key="id"
            class="bundle-tab"
            :class="{ on: bundleId === id }"
            role="tab"
            :aria-selected="bundleId === id"
            @click="switchBundle(id)"
          >{{ G2_BUNDLES[id].label }}</button>
        </div>
        <div class="clockbox">
          <span class="tick" aria-live="polite">t+{{ view.tick }}</span>
          <button class="step" @click="advance(1)">+1</button>
          <button class="step" @click="advance(5)">+5</button>
          <button class="step ghost" @click="reset">reset</button>
        </div>
      </div>
    </header>

    <div class="g2-grid">
      <!-- ══════════ palette: the purchase decision ══════════ -->
      <div class="col palette-col">
        <h3 class="col-title">Build palette <span class="hint">surface is shown before you buy</span></h3>
        <article
          v-for="c in components"
          :key="c.id"
          class="tile"
          :class="{ built: exists.has(c.id) }"
          data-test="palette-tile"
        >
          <div class="tile-top">
            <h4>{{ c.label }}</h4>
            <span class="cost" :class="{ zero: view.previews[c.id]!.surfaceCost === 0 }" data-test="surface-cost">
              +{{ view.previews[c.id]!.surfaceCost }} surface
            </span>
          </div>
          <p class="capability">{{ c.capability }}</p>
          <div class="invites" aria-label="threats this invites">
            <span
              v-for="(t, i) in view.previews[c.id]!.invites"
              :key="t"
              class="chip"
              :class="[
                threatFact(t as ThreatId).family,
                view.previews[c.id]!.newlySpawnable.includes(t) ? 'new' : 'at-risk',
              ]"
              :style="{ animationDelay: i * 90 + 'ms' }"
              data-test="invite-chip"
            >
              <i class="dot" />{{ threatFact(t as ThreatId).label }}
              <em v-if="!view.previews[c.id]!.newlySpawnable.includes(t)">already at risk</em>
            </span>
            <span v-if="view.previews[c.id]!.invites.length === 0" class="chip none">no new surface</span>
          </div>
          <div class="tile-actions">
            <button v-if="!exists.has(c.id)" class="buy" data-test="build-btn" @click="build(c.id)">build</button>
            <button v-else class="retire" data-test="retire-btn" @click="retire(c.id)">retire</button>
          </div>
        </article>
      </div>

      <!-- ══════════ the live deck, by family ══════════ -->
      <div class="col ledger-col">
        <h3 class="col-title">
          Live threat surface
          <span class="count">{{ view.spawnableCount }}/{{ view.universeCount }}</span>
        </h3>
        <details
          v-for="group in view.poolByFamily"
          :key="group.family"
          class="family"
          :open="group.family === 'malicious'"
          data-test="family-group"
        >
          <summary>
            <i class="dot" :class="group.family" />{{ group.family }}
            <span class="fam-count">{{ group.rows.length }}</span>
          </summary>
          <ul>
            <li v-for="row in group.rows" :key="row.threatId" class="pool-row" data-test="pool-row">
              <span class="threat-label">{{ row.label }}</span>
              <span class="band" :class="row.effectiveBand">{{ row.effectiveBand }}</span>
              <span v-if="row.mastered" class="mastered" data-test="mastered-badge">Mastered</span>
              <button class="countered" data-test="counter-btn" @click="counter(row.threatId)"
                :title="'record a successful counterance (' + cfg.masteryDemotionAfter + ' ⇒ weather)'">
                ✓ {{ row.counters }}
              </button>
              <span class="why">
                <template v-if="row.inviters.length">← {{ row.inviters.length === 1 ? '' : 'also ' }}{{ row.inviters[0] }}<template v-if="row.inviters.length > 1"> +{{ row.inviters.length - 1 }}</template></template>
                <template v-else>ungated</template>
              </span>
            </li>
          </ul>
        </details>
        <div v-if="view.haunting.length" class="haunting" data-test="haunting">
          <div v-for="h in view.haunting" :key="h.buildableId" class="ghost-row">
            <span class="ghost-label">⌁ {{ h.label }} retired at t+{{ h.removedAtTick }}</span>
            <span class="memo">attackers get the memo in {{ h.ticksLeft }} ticks</span>
          </div>
        </div>
        <p v-if="view.spawnableCount === 0" class="empty">Nothing is spawnable. Nobody even knows you exist. Enjoy it.</p>
      </div>

      <!-- ══════════ construction log ══════════ -->
      <div class="col log-col">
        <h3 class="col-title">Your construction log</h3>
        <ol class="log" data-test="log">
          <li v-for="row in view.log" :key="row.seq" class="log-row" :class="row.op" data-test="log-row">
            <span class="log-tick">t+{{ row.atTick }}</span>
            <span class="log-op">{{ row.op === "build" ? "▲" : "▼" }}</span>
            <span class="log-label">{{ row.label }}</span>
          </li>
          <li v-if="view.log.length === 0" class="log-row empty">bare metal — the deck holds only what the world throws anyway</li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Atmosphere: this is a shipping manifest for trouble, not a settings pane.
   One committed palette — surface steel + accent amber/cyan via era tokens;
   family hues are the ONLY chromatic vocabulary, each carrying one job. */
.g2 {
  font-family: var(--hh-typeface);
  color: color-mix(in srgb, var(--hh-surface) 12%, #e8ecf1);
  background:
    radial-gradient(120% 90% at 12% -10%, color-mix(in srgb, var(--hh-accent) 7%, transparent), transparent 55%),
    repeating-linear-gradient(0deg, transparent 0 31px, color-mix(in srgb, #e8ecf1 3%, transparent) 31px 32px),
    color-mix(in srgb, var(--hh-surface) 94%, #000);
  border-radius: var(--hh-radius);
  padding: 18px 20px 22px;
  min-height: 100%;
}

.g2-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 18px; flex-wrap: wrap; }
.ident { display: flex; gap: 14px; align-items: center; }
.stamp {
  border: 2px solid var(--hh-accent);
  color: var(--hh-accent);
  padding: 6px 10px;
  font-size: 22px;
  letter-spacing: 2px;
  transform: skewX(-8deg);
  box-shadow: 4px 4px 0 color-mix(in srgb, var(--hh-accent) 25%, transparent);
}
h2 { margin: 0; font-size: 21px; letter-spacing: 0.5px; }
.motto { margin: 2px 0 0; font-size: 12px; opacity: 0.65; }
.motto em { color: var(--hh-accent); font-style: normal; }

.controls { display: flex; gap: 14px; align-items: center; }
.bundles { display: flex; gap: 0; border: 1px solid color-mix(in srgb, #e8ecf1 22%, transparent); border-radius: var(--hh-radius); overflow: hidden; }
.bundle-tab {
  all: unset; cursor: pointer; padding: 6px 12px; font-size: 13px;
  color: color-mix(in srgb, #e8ecf1 70%, transparent);
}
.bundle-tab.on { background: var(--hh-accent); color: var(--hh-surface); font-weight: 700; }
.clockbox { display: flex; gap: 6px; align-items: center; }
.tick { font-size: 15px; min-width: 5ch; color: var(--hh-accent); }
.step {
  all: unset; cursor: pointer; padding: 4px 9px; font-size: 13px;
  border: 1px solid color-mix(in srgb, #e8ecf1 30%, transparent); border-radius: var(--hh-radius);
}
.step:hover { border-color: var(--hh-accent); color: var(--hh-accent); }
.step.ghost { opacity: 0.6; }

.g2-grid {
  display: grid; gap: 18px; margin-top: 18px;
  grid-template-columns: minmax(250px, 1.15fr) minmax(260px, 1.25fr) minmax(180px, 0.75fr);
}
@media (max-width: 980px) { .g2-grid { grid-template-columns: 1fr; } }

.col-title {
  margin: 0 0 10px; font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase;
  color: color-mix(in srgb, #e8ecf1 55%, transparent);
  border-bottom: 1px solid color-mix(in srgb, #e8ecf1 14%, transparent);
  padding-bottom: 6px;
}
.col-title .hint { text-transform: none; letter-spacing: 0; font-size: 11px; opacity: 0.7; }
.col-title .count { float: right; color: var(--hh-accent); letter-spacing: 1px; }

/* — tiles — */
.tile {
  border: 1px solid color-mix(in srgb, #e8ecf1 16%, transparent);
  border-left: 3px solid color-mix(in srgb, var(--hh-accent) 60%, transparent);
  border-radius: var(--hh-radius);
  padding: 10px 12px 12px;
  margin-bottom: 12px;
  background: color-mix(in srgb, #e8ecf1 3%, transparent);
}
.tile.built { border-left-color: color-mix(in srgb, #e8ecf1 25%, transparent); opacity: 0.85; }
.tile-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
h4 { margin: 0; font-size: 15px; }
.cost { font-size: 11px; color: #ff5d7a; white-space: nowrap; }
.cost.zero { color: color-mix(in srgb, #e8ecf1 45%, transparent); }
.capability { margin: 4px 0 8px; font-size: 12px; opacity: 0.72; }

.invites { display: flex; flex-wrap: wrap; gap: 6px; min-height: 22px; }
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11.5px; padding: 2px 8px;
  border: 1px solid color-mix(in srgb, #e8ecf1 20%, transparent);
  border-radius: 999px;
}
.chip em { opacity: 0.6; font-style: normal; font-size: 10px; }
.chip.new { animation: surface-flash 1.1s ease-out both; border-color: currentColor; }
.chip.at-risk { opacity: 0.55; }
.chip.none { opacity: 0.5; }
.dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; background: currentColor; }
.chip.malicious, .dot.malicious { color: #ff5d7a; }
.chip.human, .dot.human { color: #f2b133; }
.chip.systemic, .dot.systemic { color: #35e0e6; }
.chip.entropic, .dot.entropic { color: #9d8cff; }
.chip.customerAsThreat, .dot.customerAsThreat { color: #7ee081; }

.tile-actions { margin-top: 9px; }
.buy, .retire {
  all: unset; cursor: pointer; font-size: 13px; padding: 5px 16px;
  border: 1px solid var(--hh-accent); color: var(--hh-accent);
  border-radius: var(--hh-radius);
  transition: background 140ms ease, color 140ms ease;
}
.buy:hover { background: var(--hh-accent); color: var(--hh-surface); }
.retire { border-color: color-mix(in srgb, #ff5d7a 70%, transparent); color: #ff5d7a; }
.retire:hover { background: #ff5d7a; color: var(--hh-surface); }

/* — ledger — */
.family { margin-bottom: 8px; }
.family summary {
  cursor: pointer; list-style: none; display: flex; gap: 8px; align-items: center;
  font-size: 13px; text-transform: capitalize; letter-spacing: 0.5px;
  padding: 4px 0;
}
.family summary::-webkit-details-marker { display: none; }
.fam-count { margin-left: auto; font-size: 11px; opacity: 0.6; }
.family ul { list-style: none; margin: 2px 0 0; padding: 0 0 0 6px; }
.pool-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 4px 0; border-top: 1px dashed color-mix(in srgb, #e8ecf1 10%, transparent);
  font-size: 12.5px;
}
.threat-label { min-width: 34%; }
.band {
  font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; padding: 1px 7px;
  border-radius: 3px; border: 1px solid currentColor;
}
.band.weather { color: #8fd6ff; }
.band.storm { color: #c9a2ff; }
.band.hunter { color: #ff9d5c; }
.band.entropy { color: #9d8cff; }
.mastered {
  font-size: 10px; letter-spacing: 1px; color: var(--hh-accent);
  border-bottom: 1px dotted var(--hh-accent);
}
.countered {
  all: unset; cursor: pointer; font-size: 11px; padding: 1px 8px;
  border: 1px solid color-mix(in srgb, #e8ecf1 22%, transparent); border-radius: 999px;
}
.countered:hover { border-color: var(--hh-accent); }
.why { font-size: 10.5px; opacity: 0.55; margin-left: auto; }
.haunting { margin-top: 10px; }
.ghost-row {
  display: flex; justify-content: space-between; gap: 8px;
  font-size: 11.5px; font-style: italic; opacity: 0.66;
  border-left: 2px solid color-mix(in srgb, #ff5d7a 45%, transparent);
  padding: 3px 8px; margin-bottom: 4px;
  animation: ghost-flicker 2.4s ease-in-out infinite;
}
.memo { color: #ff5d7a; font-style: normal; white-space: nowrap; }
.empty { font-size: 12.5px; opacity: 0.6; font-style: italic; }

/* — log — */
.log { list-style: none; margin: 0; padding: 0; border-left: 1px solid color-mix(in srgb, #e8ecf1 18%, transparent); }
.log-row {
  position: relative; display: flex; gap: 8px; align-items: baseline;
  padding: 5px 0 5px 12px; font-size: 12.5px;
  animation: log-reveal 320ms ease-out both;
}
.log-row::before {
  content: ""; position: absolute; left: -4px; top: 12px;
  width: 7px; height: 7px; border-radius: 50%; background: var(--hh-accent);
}
.log-row.remove::before { background: #ff5d7a; }
.log-row.empty { opacity: 0.55; font-style: italic; }
.log-row.empty::before { display: none; }
.log-tick { opacity: 0.55; font-size: 11px; min-width: 5ch; }
.log-op { color: var(--hh-accent); }
.log-row.remove .log-op { color: #ff5d7a; }

@keyframes surface-flash {
  0% { background: color-mix(in srgb, #ff5d7a 55%, transparent); transform: translateY(-3px); }
  60% { background: color-mix(in srgb, #ff5d7a 22%, transparent); }
  100% { background: transparent; transform: none; }
}
@keyframes ghost-flicker { 0%, 100% { opacity: 0.66; } 50% { opacity: 0.38; } }
@keyframes log-reveal { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
</style>
