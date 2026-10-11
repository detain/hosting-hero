<script setup lang="ts">
/**
 * Loss Card (§9.9 "Failure is Narrated, Not Punished") — the obituary the
 * company earns. batch-E v0 chrome consumer of the OD-25(a) death riders.
 *
 * Reads ONLY what the projection wire carries (economy-notice riders parsed
 * by deathWatch.ts): a `death-imminent` rider raises the warning strip; a
 * `company-dissolved` rider slams the full-screen obituary. The phase is
 * monotone — once the ledger stopped, chrome never pretends it restarted.
 *
 * The voice stack, in priority order: the ZERO-SLOT pack line
 * (alert.death-imminent / alert.company-dissolved, lane L4) resolved through
 * the shared era toggle, then the sober provisional consts behind `??`.
 * The per-cause epilogue needs the CAUSE, which today's two-segment wire
 * does not carry (seam reported to the runner lane) — so the card says so
 * honestly and points at the replay instead of guessing.
 *
 * Budget law: claims NOTHING from globalBudget — a terminal full-screen
 * presentation is a mode (PanicLayout precedent), not a competing admission;
 * the death rows' screen accounting lives in the alert stack's pinned tier.
 */
import { computed, ref, watch } from "vue";
import { projection } from "../state/observedStore";
import { noticeWireCopy } from "../i18n/noticeCopy";
import { formatMicroUsd, formatRunClock } from "./metrics";
import {
  CAUSAL_EPILOGUE,
  CAUSE_UNKNOWN_EPILOGUE,
  DEATH_WATCH_VOICE,
  DISSOLVED_HEADLINE,
  extractDeathCause,
  extractDeathPhase,
  type CompanyDeathCause,
  type DeathWatchPhase,
} from "./deathWatch";

const phase = ref<DeathWatchPhase | null>(null);
const cause = ref<CompanyDeathCause | null>(null);

watch(
  projection,
  (p) => {
    if (p === null) return;
    const rung = extractDeathPhase(p.notices);
    if (rung === "dissolved") phase.value = "dissolved";
    else if (rung === "notice" && phase.value === null) phase.value = "notice";
    if (cause.value === null) cause.value = extractDeathCause(p.notices);
  },
  { immediate: true },
);

const frame = computed(() => projection.value);
const warningVoice = computed(
  () => noticeWireCopy("death-imminent", null) ?? DEATH_WATCH_VOICE.line,
);
const dissolvedVoice = computed(
  () => noticeWireCopy("company-dissolved", null) ?? DISSOLVED_HEADLINE,
);
const epilogue = computed(() =>
  cause.value === null ? CAUSE_UNKNOWN_EPILOGUE : CAUSAL_EPILOGUE[cause.value],
);
</script>

<template>
  <div
    v-if="phase === 'notice'"
    class="death-warning"
    role="alert"
    aria-live="assertive"
    data-test="death-warning"
  >
    <b class="strip-title">{{ DEATH_WATCH_VOICE.headline }}</b>
    <span class="strip-line">{{ warningVoice }}</span>
  </div>

  <div v-else-if="phase === 'dissolved'" class="loss-scrim" data-test="loss-scrim">
    <section class="loss-card" role="alertdialog" aria-label="company dissolved" data-test="loss-card">
      <h2 class="headline">{{ DISSOLVED_HEADLINE }}</h2>
      <p class="voice" data-test="loss-voice">{{ dissolvedVoice }}</p>
      <p class="epilogue" data-test="loss-epilogue">{{ epilogue }}</p>
      <dl v-if="frame !== null" class="facts" data-test="loss-facts">
        <div><dt>run clock</dt><dd>{{ formatRunClock(frame.clocks.simUs) }}</dd></div>
        <div><dt>final cash</dt><dd>{{ formatMicroUsd(frame.freeCashMicroUsd) }}</dd></div>
        <div><dt>served</dt><dd>{{ frame.counters.served }}</dd></div>
        <div><dt>bounced</dt><dd>{{ frame.counters.bounced }}</dd></div>
        <div><dt>amber-403</dt><dd>{{ frame.counters.blockedFalsePositive }}</dd></div>
        <div><dt>landed</dt><dd>{{ frame.counters.landed }}</dd></div>
      </dl>
      <p class="footnote">
        Traffic, counters, and the clock keep running — the economy stopped.
        What happened here is replayable, minute by minute.
      </p>
    </section>
  </div>
</template>

<style scoped>
.death-warning {
  position: fixed;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  gap: 10px;
  align-items: baseline;
  max-width: min(640px, calc(100vw - 48px));
  padding: 6px 14px;
  font-family: var(--hh-typeface);
  font-size: 12px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--hh-hue-alarm) 82%, var(--hh-accent));
  background: color-mix(in srgb, var(--hh-surface) 88%, #000);
  border: 1px solid var(--hh-hue-alarm);
  border-radius: var(--hh-radius);
}
.strip-title { letter-spacing: .14em; text-transform: uppercase; font-size: 10px; }
.strip-line { opacity: .85; }

.loss-scrim {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  background:
    radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--hh-hue-alarm) 7%, transparent) 0%, transparent 55%),
    color-mix(in srgb, var(--hh-surface) 94%, #000);
  font-family: var(--hh-typeface);
}
.loss-card {
  width: min(560px, calc(100vw - 48px));
  padding: 26px 30px 20px;
  color: var(--hh-accent);
  background: color-mix(in srgb, var(--hh-surface) 80%, #000);
  border: 1px solid color-mix(in srgb, var(--hh-hue-alarm) 60%, transparent);
  border-radius: var(--hh-radius);
  box-shadow: 0 24px 80px color-mix(in srgb, #000 65%, transparent);
  animation: slam .45s cubic-bezier(.2, .9, .25, 1) 1;
}
@keyframes slam {
  from { transform: translateY(-18px) scale(1.04); opacity: 0; }
  to { transform: none; opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .loss-card { animation: none; }
}
.headline {
  margin: 0 0 10px;
  font-size: 22px;
  letter-spacing: .01em;
  color: color-mix(in srgb, var(--hh-hue-alarm) 85%, var(--hh-accent));
}
.voice, .epilogue { margin: 0 0 10px; font-size: 13px; line-height: 1.55; }
.epilogue { opacity: .8; }
.facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 14px;
  margin: 14px 0 4px;
  padding: 12px 0 0;
  border-top: 1px dashed color-mix(in srgb, var(--hh-accent) 26%, transparent);
}
.facts div { display: grid; gap: 2px; }
.facts dt { font-size: 9px; letter-spacing: .16em; text-transform: uppercase; opacity: .5; }
.facts dd { margin: 0; font-size: 14px; font-variant-numeric: tabular-nums; }
.footnote { margin: 12px 0 0; font-size: 10px; opacity: .45; letter-spacing: .04em; }
</style>
