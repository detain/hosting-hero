<!--
  progression/UnlockLedger.vue — the between-levels progression screen,
  §1.6 "The Codex Shelf". Pure presentational mount: plain-data props in
  (no store imports, so a campaign player, the Sim Lab, or the sandbox can
  each hand it their own facts), one deterministic projection out
  (buildUnlockLedger does every verdict; this file only lays it out).

  Weld contract: <UnlockLedger :cards :lines :satisfied :proposals :ladder />
  All props optional — an empty ledger states itself honestly.
-->
<script setup lang="ts">
import { computed } from "vue";
import { buildUnlockLedger } from "./unlockModel";
import type {
  UnlockLedgerCard,
  UnlockLedgerInput,
  UnlockLedgerLine,
  UnlockLedgerRow,
} from "./unlockModel";

type UnlockProposalLike = NonNullable<UnlockLedgerInput["proposals"]>[number];

const props = defineProps<{
  readonly cards?: readonly UnlockLedgerCard[] | undefined;
  readonly lines?: readonly UnlockLedgerLine[] | undefined;
  readonly satisfied?: readonly string[] | undefined;
  readonly proposals?: readonly UnlockProposalLike[] | undefined;
  readonly ladder?: UnlockLedgerInput["ladder"];
}>();

const view = computed(() =>
  buildUnlockLedger({
    cards: props.cards,
    lines: props.lines,
    satisfied: props.satisfied,
    proposals: props.proposals,
    ladder: props.ladder,
  }),
);

function rowKey(band: string, row: UnlockLedgerRow, index: number): string {
  return `${band}-${row.shape}-${row.id}-${String(index)}`;
}
</script>

<template>
  <section class="unlock-ledger" data-test="unlock-ledger">
    <header class="ledger-head">
      <h2 class="ledger-title">The Unlock Ledger</h2>
      <p class="ledger-census" data-test="unlock-census">
        {{ view.census.earned }} earned · {{ view.census.next }} in play ·
        {{ view.census.locked }} still locked
      </p>
    </header>

    <div class="ledger-band band-earned" data-test="unlock-section-earned">
      <h3 class="band-title">Earned</h3>
      <p v-if="view.earned.length === 0" class="band-empty" data-test="unlock-earned-empty">
        Nothing earned yet — the shelf is honest about it.
      </p>
      <ul v-else class="band-rows">
        <li
          v-for="(row, index) in view.earned"
          :key="rowKey('earned', row, index)"
          class="ledger-row"
          data-test="unlock-earned-row"
        >
          <span class="row-id">{{ row.label }}</span>
          <span v-if="row.shape === 'proposal'" class="row-via">{{ row.via }}</span>
          <span class="row-note">{{ row.note }}</span>
        </li>
      </ul>
    </div>

    <div class="ledger-band band-next" data-test="unlock-section-next">
      <h3 class="band-title">In play</h3>
      <p v-if="view.next.length === 0" class="band-empty" data-test="unlock-next-empty">
        No ladder mid-climb right now.
      </p>
      <ul v-else class="band-rows">
        <li
          v-for="(row, index) in view.next"
          :key="rowKey('next', row, index)"
          class="ledger-row"
          data-test="unlock-next-row"
        >
          <span class="row-id">{{ row.label }}</span>
          <span class="row-stage">{{ row.stage }}</span>
          <span class="row-gap">{{ row.gap }}</span>
        </li>
      </ul>
    </div>

    <div class="ledger-band band-locked" data-test="unlock-section-locked">
      <h3 class="band-title">Still locked</h3>
      <p v-if="view.locked.length === 0" class="band-empty" data-test="unlock-locked-empty">
        Nothing locked — every declared route already runs through.
      </p>
      <ul v-else class="band-rows">
        <li
          v-for="(row, index) in view.locked"
          :key="rowKey('locked', row, index)"
          class="ledger-row"
          data-test="unlock-locked-row"
        >
          <span class="row-id">{{ row.label }}</span>
          <span v-if="row.shape === 'card'" class="row-gap">{{ row.gap }}</span>
          <ul v-else class="row-locks">
            <li
              v-for="(lock, lockIndex) in row.locks"
              :key="`${row.id}-lock-${String(lockIndex)}`"
              class="lock-line"
              data-test="unlock-lock-row"
            >
              {{ lock }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.unlock-ledger {
  font: inherit;
  color: var(--hh-accent);
  border: 1px solid color-mix(in srgb, var(--hh-hue-grey) 45%, transparent);
  border-radius: var(--hh-radius);
  padding: 0.75rem 1rem 1rem 1rem;
  display: grid;
  gap: 0.6rem;
}
.ledger-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.ledger-title {
  margin: 0;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ledger-census {
  margin: 0;
  color: color-mix(in srgb, var(--hh-hue-grey) 88%, transparent);
  font-variant-numeric: tabular-nums;
}
.ledger-band {
  border-top: 1px dashed color-mix(in srgb, var(--hh-hue-grey) 40%, transparent);
  padding-top: 0.4rem;
}
.band-title {
  margin: 0 0 0.3rem 0;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.band-earned .band-title {
  color: var(--hh-hue-green);
}
.band-next .band-title {
  color: var(--hh-hue-azure);
}
.band-locked .band-title {
  color: var(--hh-hue-grey);
}
.band-empty {
  margin: 0;
  color: color-mix(in srgb, var(--hh-hue-grey) 75%, transparent);
}
.band-rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.25rem;
}
.ledger-row {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.row-id {
  font-weight: 700;
}
.band-earned .row-id {
  color: var(--hh-hue-green);
}
.band-next .row-id {
  color: var(--hh-hue-azure);
}
.band-locked .row-id {
  color: color-mix(in srgb, var(--hh-hue-grey) 92%, transparent);
}
.row-via,
.row-stage {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid currentColor;
  border-radius: var(--hh-radius);
  padding: 0 0.35rem;
}
.row-via {
  color: var(--hh-hue-gold);
}
.row-stage {
  color: var(--hh-hue-cyan);
}
.row-note,
.row-gap {
  color: color-mix(in srgb, var(--hh-accent) 78%, transparent);
  font-variant-numeric: tabular-nums;
}
.row-locks {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.15rem;
  flex: 1 1 100%;
}
.lock-line {
  color: color-mix(in srgb, var(--hh-hue-amber) 88%, transparent);
  font-size: 0.85em;
}
@media (prefers-reduced-motion: reduce) {
  .unlock-ledger *,
  .unlock-ledger {
    animation: none;
  }
}
</style>
