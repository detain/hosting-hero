<!--
  gates/g7 · G7GatePanel — TWO BOARDS, ONE POOL (§9.13 gate #7, ADR-0018).

  THE LAW, made literal: the Iron Board (left) and The Book (right) draw from
  ONE hands pool and ONE attention denomination. The book fires while you
  watch the board; a cable you drag costs the same token the Book spends on
  its depth change; the failover card screams in the tape and changes nothing
  on the board (the bought-verb wall, §1.10 / ADR-0018).

  THE WATCH TOGGLE is the §1.10 sentence rendered: "You can pause one and not
  the other only by choosing where to look" — hiding a column hides INK, not
  the sim. The single driver keeps stepping; the tape keeps interleaving both
  boards' receipts. There is no second clock to pause.

  RENDERING LAW: DOM/SVG, not Pixi (the g4 precedent — focusable controls,
  real text, refusal copy). HUE LAW (hueLawGates scans gates/): state channels
  ride var(--hh-hue-*) ledger jobs — azure bounce (refusals), green served-ok
  (executions), alarm (the wall card), gold money-meters. The two HAND-ORIGIN
  inks: Book holds ride the ledger's `rule-ink` job (ADR-0019 program 6 — the
  Ghost Hands population of §7.14 rendered as one channel, not sprites; a
  deliberate desaturated near-miss on `violet`, ratified ON the ledger rather
  than spelled in the gate); player holds stay #d7e3ea — chrome ink, a
  hueLaw-allowlist neutral, and a neutral carries no ledger job.
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { asEntityId } from "@hh/sim-core/types";
import { G7Session, type G7Snapshot } from "./g7Runner.ts";

const props = withDefaults(defineProps<{ readonly seed?: number }>(), { seed: 904 });
const session = new G7Session(props.seed);
const snap = ref<G7Snapshot>(session.snapshot());
const autoRun = ref<number | null>(null);
/** §1.10: "board" = only the Iron Board visible, "book" = only The Book,
 *  "both" = default. Visibility ONLY — the driver never pauses. */
const watch = ref<"both" | "board" | "book">("both");
const refusal = ref<string | null>(null);

function step(): void {
  snap.value = session.step();
  const latest = snap.value.receipts.slice(-1)[0];
  refusal.value = latest !== undefined && latest.outcome === "refused" ? `${latest.verb}: ${latest.reason ?? ""}` : null;
}

function commit(ruleId: string): void {
  session.commitCard(ruleId);
  step();
}

function suspendResume(ruleId: string, committed: boolean): void {
  if (!committed) return;
  if (session.isSuspended(ruleId)) session.resumeRule(ruleId);
  else session.suspendRule(ruleId);
  snap.value = session.snapshot(); // the dial is host-side: no tick, no fee
}

function toggleShadow(): void {
  session.setShadow(!snap.value.shadow);
  snap.value = session.snapshot();
}

function takeWindow(): void {
  const result = session.openAttentionWindow("grace");
  refusal.value = result.opened ? null : result.refusal;
  snap.value = session.snapshot();
}

function place(): void {
  session.placeDevice();
  step();
}

function connect(fromId: string, toId: string): void {
  session.connectData(asEntityId(fromId), asEntityId(toId));
  step();
}

function pull(edgeId: string): void {
  session.pullCable(asEntityId(edgeId));
  step();
}

function postNote(): void {
  session.postNote("founder posts");
  step();
}

function toggleAuto(): void {
  if (autoRun.value !== null) {
    window.clearInterval(autoRun.value);
    autoRun.value = null;
  } else {
    autoRun.value = window.setInterval(step, 2000);
  }
}

onBeforeUnmount(() => {
  if (autoRun.value !== null) window.clearInterval(autoRun.value);
});

/* ── derived views ─────────────────────────────────────────────────────── */

const nodeById = computed(() => new Map(snap.value.nodes.map((n) => [n.id, n])));
const dbPlaced = computed(() => nodeById.value.has("node/db"));
const cable = computed(() => snap.value.edges.find((e) => e.id === "edge:data:node/edge->node/origin") ?? null);
const spareCables = computed(() => snap.value.edges.filter((e) => e.id !== "edge:data:node/edge->node/origin"));
const visibleTape = computed(() => snap.value.tape.slice(-16).reverse());
const freeHands = computed(() => snap.value.hands.filter((h) => h.origin === null).length);
const rhoPct = (rho: bigint): number => Math.round(Number(rho) * 100 / 65536);

const HEADLINE = "two boards, one pool — the unwatched board runs on its standing policies";
</script>

<template>
  <section class="g7" data-test="g7-panel">
    <header class="g7-head">
      <div class="g7-title">
        <h2>Two Boards, One Pool</h2>
        <p class="g7-sub">{{ HEADLINE }} · <small>§7.15 — “a player who only plays one half loses”</small></p>
      </div>
      <div class="g7-meters" data-test="g7-meters">
        <span class="g7-meter g7-meter--cash" :title="'GameState cash bucket — the door never touches money (§7.5): in this world the pool starts at zero'">💰 {{ (Number(snap.cashFree) / 1_000_000).toFixed(2) }}</span>
        <span class="g7-meter">tick<b>{{ snap.tick }}</b></span>
        <span class="g7-meter">book<b :title="snap.ruleBookHash">{{ snap.ruleBookHash.slice(0, 8) || "shut" }}</b></span>
        <span class="g7-meter g7-meter--digest" :title="snap.digest">digest {{ snap.digest.slice(0, 8) }}</span>
      </div>
    </header>

    <div class="g7-toolbar" role="toolbar" aria-label="gate controls">
      <button class="g7-btn" data-test="g7-step" @click="step()">▶ step</button>
      <button class="g7-btn" :class="{ 'g7-btn--on': autoRun !== null }" data-test="g7-auto" :aria-pressed="autoRun !== null" @click="toggleAuto()">
        {{ autoRun === null ? "auto" : "halt" }}
      </button>
      <span class="g7-spacer" />
      <span class="g7-seg" role="group" aria-label="watch where" data-test="g7-watch">
        <button class="g7-btn g7-btn--seg" :class="{ 'g7-btn--on': watch === 'board' }" :aria-pressed="watch === 'board'" data-test="watch-board" @click="watch = 'board'">⛭ board</button>
        <button class="g7-btn g7-btn--seg" :class="{ 'g7-btn--on': watch === 'both' }" :aria-pressed="watch === 'both'" data-test="watch-both" @click="watch = 'both'">both</button>
        <button class="g7-btn g7-btn--seg" :class="{ 'g7-btn--on': watch === 'book' }" :aria-pressed="watch === 'book'" data-test="watch-book" @click="watch = 'book'">☰ book</button>
      </span>
      <button
        class="g7-btn"
        :class="{ 'g7-btn--on': snap.shadow }"
        :aria-pressed="snap.shadow"
        data-test="g7-dry-run"
        title="§7.14 Dry-Run Toggle: shadowEvaluationConfig through the same rule phase — firings visible, zero intents minted"
        @click="toggleShadow()"
      >
        ⌕ dry-run
      </button>
      <button
        class="g7-btn"
        data-test="g7-grace"
        title="§7.12 the focus hand is only ever minted by a bounded loan (attentionWindowEntry); the Book is exempt from attention — it works nights"
        @click="takeWindow()"
      >
        ✋ take the window <small v-if="snap.attention.debt > 0">debt {{ snap.attention.debt }}</small>
      </button>
    </div>

    <!-- THE THESIS, STRIPPED BARE: one rail spanning both boards. -->
    <div class="g7-rail" data-test="g7-hands" role="group" aria-label="one shared pool: hands and focus">
      <span class="g7-rail-label">hands</span>
      <span
        v-for="hand in snap.hands"
        :key="`h${hand.index}`"
        class="g7-hand"
        :class="hand.origin === null ? 'g7-hand--free' : hand.origin === 'rule' ? 'g7-hand--rule' : 'g7-hand--player'"
        :data-test="`hand-${hand.index}`"
      >
        ✋{{ hand.index + 1 }}
        <b v-if="hand.origin === 'rule'">Book</b>
        <b v-else-if="hand.origin === 'player'">you</b>
        <b v-else>free</b>
        <small v-if="hand.origin !== null">→ t{{ hand.busyUntilTick }}</small>
      </span>
      <span class="g7-rail-label g7-rail-label--att">focus</span>
      <span
        v-for="p in Math.max(snap.attention.capacity, 1)"
        :key="`a${p}`"
        class="g7-pip"
        :class="p <= snap.attention.freePips ? 'g7-pip--free' : 'g7-pip--held'"
        :data-test="`pip-${p - 1}`"
      >◉</span>
      <small class="g7-rail-note">{{ freeHands }} of {{ snap.hands.length }} hands free · Book holds cost NOTHING in focus (§7.12/D4)</small>
    </div>

    <p v-if="refusal !== null" class="g7-refusal" data-test="g7-refusal" role="alert">⤺ {{ refusal }}</p>
    <p v-if="watch !== 'both'" class="g7-unwatched" data-test="g7-unwatched" aria-live="polite">
      the hidden half keeps running — {{ watch === "book" ? "the Iron Board" : "the Book" }} acts unwatched (§1.10)
    </p>

    <div class="g7-stage">
      <!-- LEFT · the Iron Board -->
      <div v-show="watch !== 'book'" class="g7-col g7-board-col" data-test="g7-board-col">
        <h3 class="g7-col-title">⛭ the Iron Board</h3>
        <svg class="g7-board" viewBox="0 0 380 210" role="img" aria-label="iron board: edge and origin nodes with one data cable">
          <defs>
            <pattern id="g7-grid" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M 22 0 L 0 0 0 22" fill="none" stroke="var(--g7-grid-line)" stroke-width="0.6" />
            </pattern>
          </defs>
          <rect width="380" height="210" fill="url(#g7-grid)" />
          <line v-if="cable !== null" class="g7-cable" x1="90" y1="70" x2="290" y2="70" />
          <line v-for="e in spareCables" :key="e.id" class="g7-cable g7-cable--spare" x1="90" y1="70" x2="190" y2="160" />
          <g :transform="'translate(30,40)'">
            <rect class="g7-plate" width="120" height="60" />
            <text class="g7-plate-id" x="8" y="18">node/edge</text>
            <text class="g7-plate-meta" x="8" y="34">ρ {{ nodeById.get('node/edge') === undefined ? "—" : rhoPct(nodeById.get('node/edge')!.rho) }}% · q{{ nodeById.get('node/edge')?.queueDepth ?? 0 }}</text>
            <text class="g7-plate-depth" x="8" y="50" data-test="edge-depth">{{ nodeById.get('node/edge')?.inspectionDepth ?? "" }}</text>
          </g>
          <g :transform="'translate(230,40)'">
            <rect class="g7-plate" width="120" height="60" />
            <text class="g7-plate-id" x="8" y="18">node/origin</text>
            <text class="g7-plate-meta" x="8" y="34">ρ {{ nodeById.get('node/origin') === undefined ? "—" : rhoPct(nodeById.get('node/origin')!.rho) }}% · q{{ nodeById.get('node/origin')?.queueDepth ?? 0 }}</text>
          </g>
          <g v-if="dbPlaced" :transform="'translate(130,130)'">
            <rect class="g7-plate g7-plate--spare" width="120" height="50" />
            <text class="g7-plate-id" x="8" y="18">node/db</text>
            <text class="g7-plate-meta" x="8" y="34">ρ {{ rhoPct(nodeById.get('node/db')?.rho ?? 0n) }}%</text>
          </g>
        </svg>
        <div class="g7-board-actions">
          <button class="g7-btn" data-test="g7-place" :disabled="dbPlaced" @click="place()">▣ place db (3 ticks)</button>
          <button v-if="dbPlaced" class="g7-btn" data-test="g7-connect-edge-db" @click="connect('node/edge', 'node/db')">cable edge→db</button>
          <button v-if="dbPlaced" class="g7-btn" data-test="g7-connect-db-origin" @click="connect('node/db', 'node/origin')">cable db→origin</button>
          <button v-if="cable !== null" class="g7-btn" data-test="g7-pull" @click="pull(cable.id)">⨯ pull edge→origin (2 ticks)</button>
          <button class="g7-btn" data-test="g7-note" title="the human's communicate costs a focus hand; the Book's page carrier rides the same verb for free" @click="postNote()">✉ post note (hand+focus)</button>
        </div>
      </div>

      <!-- RIGHT · The Book -->
      <div v-show="watch !== 'board'" class="g7-col g7-book-col" data-test="g7-book-col">
        <h3 class="g7-col-title">☰ the Book <small>commit costs 1 hand + 1 focus hand; firing is free forever after — that is delegation</small></h3>
        <ul class="g7-cards" data-test="g7-book">
          <li v-for="c in snap.book" :key="c.id" class="g7-card" :data-test="`card-${c.id}`">
            <div class="g7-card-top">
              <b>{{ c.id }}</b>
              <span class="g7-band" :class="`g7-band--${c.band}`">{{ c.band }}</span>
              <span class="g7-card-scope">{{ c.scopeRef }} · {{ c.actionIds.join(",") }} · #{{ c.hash8 }}</span>
            </div>
            <p class="g7-card-blurb">{{ c.blurb }}</p>
            <div class="g7-card-state">
              <template v-if="!c.committed">
                <button class="g7-btn g7-btn--commit" :data-test="`commit-${c.id}`" @click="commit(c.id)">⚑ commit</button>
              </template>
              <template v-else>
                <span class="g7-card-live" :data-test="`live-${c.id}`">
                  <b>live</b>
                  <span v-if="c.firings > 0">· fired ×{{ c.firings }}</span>
                  <span v-if="c.shadowFirings > 0" class="g7-shadow">· would-fire ×{{ c.shadowFirings }}</span>
                  <span v-if="c.advisory">· advisory, zero intents</span>
                  <span v-else-if="c.executions > 0" class="g7-exec">· executed ×{{ c.executions }}</span>
                  <span v-if="c.refusals > 0" class="g7-refuse" :title="c.lastRefusalReason ?? ''">· refused ×{{ c.refusals }}</span>
                </span>
                <button
                  class="g7-btn"
                  :class="{ 'g7-btn--on': c.suspended }"
                  :aria-pressed="c.suspended"
                  :data-test="`suspend-${c.id}`"
                  title="Kill Switch (§7.14): a host dial, not a door verb — suppressed cards leave no adjudication rows"
                  @click="suspendResume(c.id, c.committed)"
                >{{ c.suspended ? "resume" : "suspend" }}</button>
              </template>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <ol class="g7-tape" data-test="g7-tape" role="log" aria-live="polite" aria-label="interleaved receipts and firings from both boards">
      <li v-for="(line, i) in visibleTape" :key="`${line.tick}-${i}`" class="g7-tape-line" :class="[`g7-tape--${line.kind}`, line.origin === 'rule' ? 'g7-tape--rule' : line.origin === 'player' ? 'g7-tape--player' : '']">
        {{ line.text }}
      </li>
    </ol>
  </section>
</template>

<style scoped>
/* gate-local chord on the era tokens (--hh-*): EVERY semantic channel — the
   hand-origin inks included (rule-ink joined the ledger, ADR-0019 program 6) —
   rides a ledger var; the only spelled hex left here is the allowlisted
   chrome-ink neutral. hueLawGates scans this block: zero ledger-valued
   literals, zero invented --hh-hue-* names. The plate lift uses the ledger
   grey (its neutral-aggregate job); the lift was re-tuned 82%→88% surface
   when the off-ledger #9aa7b8 retired — accent plate labels need the AA 4.5
   text floor in all four canon eras, and the weakest pairing (2008 blue on
   plate) moves 4.20 → 4.92 under the house contrast math (g7Hues.test.ts). */
.g7 {
  --g7-ink: var(--hh-accent);
  --g7-line: color-mix(in srgb, var(--hh-accent) 35%, transparent);
  --g7-grid-line: color-mix(in srgb, var(--hh-accent) 12%, transparent);
  --g7-plate: color-mix(in srgb, var(--hh-surface) 88%, var(--hh-hue-grey));
  --g7-hand-player: #d7e3ea; /* chrome ink neutral — a human holding a hand */
  --g7-hand-rule: var(--hh-hue-rule-ink); /* §7.14 Ghost Hands — the Book's
                             signature ink, ledger job "rule-ink": a by-design
                             desaturated near-miss on violet, not a re-spell */
  font-family: var(--hh-typeface, "Space Grotesk", monospace);
  color: var(--g7-ink);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 100%;
}
.g7-head { display: flex; justify-content: space-between; align-items: baseline; gap: 18px; flex-wrap: wrap; }
.g7-title h2 { margin: 0; font-size: 22px; letter-spacing: 0.04em; text-transform: uppercase; }
.g7-sub { margin: 2px 0 0; opacity: 0.8; font-size: 12px; }
.g7-meters { display: flex; gap: 10px; font-size: 12px; }
.g7-meter { border: 1px solid var(--g7-ink); padding: 2px 8px; border-radius: var(--hh-radius, 12px); }
.g7-meter b { margin-left: 4px; }
.g7-meter--digest { opacity: 0.7; font-variant-numeric: tabular-nums; }
.g7-meter--cash { color: var(--hh-hue-gold); border-color: var(--hh-hue-gold); }

.g7-toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.g7-spacer { flex: 1; }
.g7-btn {
  font: inherit; font-size: 12px;
  background: transparent; color: var(--g7-ink);
  border: 1px solid var(--g7-ink);
  border-radius: var(--hh-radius, 12px);
  padding: 4px 10px; cursor: pointer;
}
.g7-btn small { opacity: 0.65; margin-left: 4px; }
.g7-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.g7-btn--on { background: var(--g7-ink); color: var(--hh-surface); }
.g7-btn--seg { border-radius: 0; border-right-width: 0; }
.g7-btn--seg:last-child { border-right-width: 1px; }
.g7-seg { display: inline-flex; }
.g7-btn--commit { border-width: 2px; font-weight: 700; }

.g7-rail {
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
  border: 2px solid var(--g7-ink); border-radius: var(--hh-radius, 12px);
  padding: 6px 12px;
}
.g7-rail-label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.7; }
.g7-rail-label--att { margin-left: 8px; }
.g7-hand { border: 1px solid currentColor; border-radius: var(--hh-radius, 12px); padding: 3px 8px; font-size: 12px; }
.g7-hand b { margin-left: 4px; }
.g7-hand small { opacity: 0.8; margin-left: 4px; }
.g7-hand--free { opacity: 0.55; }
.g7-hand--player { color: var(--g7-hand-player); }
.g7-hand--rule { color: var(--g7-hand-rule); animation: g7-ghost 1.4s steps(2) infinite alternate; }
/* steps(2,end) renders the pair {1.00, 0.84} — the trough endpoint itself is
   never displayed, but the rendered dip must keep rule-ink on the body wash
   above the AA 4.5 text floor in every era (0.84 dip = 4.65–5.12; the retired
   0.62 endpoint dipped to 4.45 in 2008). ADR-0019 program 6 pairing adjust. */
@keyframes g7-ghost { to { opacity: 0.68; } }
@media (prefers-reduced-motion: reduce) {
  .g7-hand--rule { animation: none; } /* the ghost rests at full ink */
}
.g7-pip { font-size: 13px; }
.g7-pip--free { color: var(--hh-hue-white); }
.g7-pip--held { color: var(--hh-hue-alarm); }
.g7-rail-note { opacity: 0.75; font-size: 11px; }

.g7-refusal { margin: 0; padding: 6px 10px; border: 2px dashed var(--hh-hue-azure); border-radius: var(--hh-radius, 12px); color: color-mix(in srgb, var(--hh-hue-azure) 65%, white); font-size: 11.5px; }
.g7-unwatched { margin: 0; font-size: 11px; opacity: 0.75; letter-spacing: 0.03em; }

.g7-stage { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
.g7-col { border: 1px solid var(--g7-line); border-radius: var(--hh-radius, 12px); padding: 10px 12px; }
.g7-col-title { margin: 0 0 8px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
.g7-col-title small { display: block; text-transform: none; letter-spacing: 0; opacity: 0.65; font-weight: 400; margin-top: 2px; }

.g7-board { width: 100%; background: var(--hh-surface); border: 1px solid var(--g7-line); border-radius: var(--hh-radius, 12px); }
.g7-plate { fill: var(--g7-plate); stroke: color-mix(in srgb, var(--g7-ink) 60%, transparent); rx: 6; }
.g7-plate--spare { stroke: var(--hh-hue-green); } /* spare = green FRAME, not
   a green fill wash: any wash strong enough to read would sink the accent
   plate labels below the AA text floor (2008: 3.36); the frame clears the UI
   3:1 floor by width (green on plate = 6.18 in every era) and the db labels
   then ride the audited plain-plate pairing — g7Hues.test.ts. */
.g7-plate-id { fill: var(--g7-ink); font-size: 13px; font-weight: 700; }
.g7-plate-meta { fill: var(--g7-ink); font-size: 10.5px; opacity: 0.8; }
.g7-plate-depth { fill: var(--hh-hue-green); font-size: 10.5px; }
.g7-cable { stroke: var(--hh-hue-cyan); stroke-width: 2.5; }
.g7-cable--spare { stroke: color-mix(in srgb, var(--hh-hue-cyan) 55%, transparent); stroke-dasharray: 5 4; }
.g7-board-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }

.g7-cards { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.g7-card { border: 1px solid var(--g7-line); border-radius: var(--hh-radius, 12px); padding: 8px 10px; font-size: 12px; }
.g7-card-top { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.g7-card-scope { opacity: 0.65; font-size: 10.5px; }
.g7-card-blurb { margin: 4px 0; opacity: 0.85; font-size: 11.5px; }
.g7-card-state { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.g7-card-live { font-size: 11px; }
.g7-band { font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; border: 1px solid currentColor; border-radius: 3px; padding: 0 4px; }
.g7-band--execute { color: var(--hh-hue-white); }
.g7-band--consult { color: var(--hh-hue-gold); }
.g7-band--inform { color: var(--hh-hue-grey); }
.g7-shadow { color: var(--hh-hue-azure); }
.g7-exec { color: var(--hh-hue-green); }
.g7-refuse { color: var(--hh-hue-alarm); cursor: help; }

.g7-tape { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; max-height: 210px; overflow-y: auto; font-size: 10.5px; opacity: 0.92; }
.g7-tape-line { border-bottom: 1px dotted color-mix(in srgb, var(--g7-ink) 25%, transparent); padding-bottom: 2px; }
.g7-tape--firing { color: var(--g7-hand-rule); }
.g7-tape-line.g7-tape--receipt { color: var(--g7-ink); }
.g7-tape-line.g7-tape--receipt.g7-tape--rule { color: var(--g7-hand-rule); }
</style>
