<script setup lang="ts">
/**
 * CoopRoom — the "Incident Room" panel: the OD-9 seat ledger and the OD-17-A
 * shared incident timeline made playable with two simulated seats and no
 * transport. Thin over coopRoom.ts: every button is one pure law call; every
 * refusal printed here is the ENGINE's own sentence (save/coop + replay/
 * coopTimeline throws), quoted verbatim — nothing is swallowed, nothing is
 * paraphrased. Timeline-side demo only: no save writes (see coopRoom.ts
 * scope disclosure).
 *
 * Zero timers, zero declared motion (the whole panel is click-driven).
 * Colors: era tokens + census-audited ledger hue vars (grey/amber/green/
 * alarm) only — the Strobe/Motion audit sees no animation surface here.
 */
import { computed, ref } from "vue";
import type { CoopTimelineKind } from "@hh/sim-core/replay";
import { COOP_MAX_SEAT_WRITERS } from "@hh/sim-core/save";
import type { EntityId } from "@hh/sim-core/types";
import {
  attributionGuardStatus,
  attributionPreview,
  advanceClock,
  buildTape,
  COOP_ROOM_PARTICIPANTS,
  COOP_ROOM_VERBS,
  coopRoomLedger,
  createCoopRoom,
  digestEquivalenceProbe,
  joinSeat,
  mergeFeeds,
  pendingFeedOf,
  replayLastRelay,
  stageRecord,
  vacateSeatInRoom,
} from "./coopRoom";

const TAPE_LIMIT = 10;

const room = ref(createCoopRoom());
const refusal = ref<{ text: string; source: "engine" | "ghost-preview" } | null>(null);
const verb = ref<string>(COOP_ROOM_VERBS[0] ?? "patch");

const primarySeats = COOP_ROOM_PARTICIPANTS.filter((p) => !p.bench);
const bench = COOP_ROOM_PARTICIPANTS.filter((p) => p.bench);

/** One guarded law call: a throw quotes the engine verbatim, and a call may
 *  RETURN a visible refusal of its own (the ghost preview) — Law 4: the panel
 *  is a witness, never a filter. Success without a surfacing clears the toast. */
function law(run: () => { text: string; source: "engine" | "ghost-preview" } | null): void {
  try {
    refusal.value = run();
  } catch (error) {
    refusal.value = { text: error instanceof Error ? error.message : String(error), source: "engine" };
  }
}

function onAdvance(): void {
  law(() => {
    room.value = advanceClock(room.value);
    return null;
  });
}

function onJoin(id: EntityId): void {
  law(() => {
    // joins ride the NEXT relay tick: the engine's append-only ledger refuses
    // two join rows sharing one tick, so the demo stamps seats like a real
    // relay delivers them — one tick per seat event.
    room.value = joinSeat(advanceClock(room.value), id);
    return null;
  });
}

function onVacate(id: EntityId): void {
  law(() => {
    room.value = vacateSeatInRoom(advanceClock(room.value), id);
    return null;
  });
}

/** Staging an unseated author is LEGAL transport — the refusal lands at the
 *  attribution preview, and that refusal is what the toast surfaces. */
function onAppend(id: EntityId, kind: CoopTimelineKind): void {
  law(() => {
    const next = stageRecord(room.value, id, kind, kind === "action" ? verb.value : undefined);
    room.value = next;
    const feed = next.pending.get(id);
    const staged = feed === undefined ? undefined : feed[feed.length - 1];
    if (staged === undefined) return null;
    const preview = attributionPreview(next, staged);
    return preview.seated ? null : { text: preview.reasons.join("; "), source: "ghost-preview" as const };
  });
}

function onReplay(): void {
  law(() => {
    room.value = replayLastRelay(room.value);
    return null;
  });
}

function onDrain(): void {
  law(() => {
    room.value = mergeFeeds(room.value);
    return null;
  });
}

function onReset(): void {
  room.value = createCoopRoom();
  refusal.value = null;
}

/* ── derived views (all pure recomputes over room.value) ── */

const tape = computed(() => buildTape(room.value, TAPE_LIMIT));
const probe = computed(() => digestEquivalenceProbe(room.value));
const guard = computed(() => attributionGuardStatus(room.value));
const ledger = computed(() => coopRoomLedger(room.value));
const pendingCount = computed(() => [...room.value.pending.values()].reduce((n, feed) => n + feed.length, 0));
const distinctArmDigests = computed(() => new Set(probe.value.arms.map((arm) => arm.digest)).size);

function seatStatus(id: EntityId): string {
  const row = ledger.value.seatHolders.find((r) => r.participantId === id);
  if (row === undefined) return "unrecorded";
  if (row.leftAtTick === undefined) return `seated since t${row.joinedAtTick}`;
  return `left at t${row.leftAtTick}`;
}

function isOpen(id: EntityId): boolean {
  const row = ledger.value.seatHolders.find((r) => r.participantId === id);
  return row !== undefined && row.leftAtTick === undefined;
}

function outbox(id: EntityId) {
  return pendingFeedOf(room.value, id);
}
</script>

<template>
  <div class="room" data-test="coop-room" :data-tick="room.tick.toString()">
    <div class="room-bar">
      <span class="tick" data-test="coop-tick">t{{ room.tick }}</span>
      <button type="button" data-test="coop-advance" @click="onAdvance">relay tick +1</button>
      <button type="button" data-test="coop-drain" :disabled="pendingCount === 0" @click="onDrain">drain feeds → shared log</button>
      <button type="button" data-test="coop-replay" :disabled="room.log.length === 0" @click="onReplay">double-send last relay</button>
      <button type="button" data-test="coop-reset" @click="onReset">reset room</button>
      <span class="guard" data-test="coop-guard" :data-armed="guard.armed">{{ guard.note }}</span>
    </div>

    <p
      v-if="refusal !== null"
      class="refusal"
      role="alert"
      data-test="coop-refusal"
      :data-refusal-source="refusal.source"
    >{{ refusal.text }}</p>

    <div class="seats">
      <section v-for="seat in primarySeats" :key="seat.id" class="seat" :data-test="`coop-seat-${seat.id}`">
        <h5>{{ seat.label }} <span class="seat-status" :data-open="isOpen(seat.id)">{{ seatStatus(seat.id) }}</span></h5>
        <div class="seat-btns">
          <button type="button" :data-test="`coop-join-${seat.id}`" :disabled="isOpen(seat.id)" @click="onJoin(seat.id)">join</button>
          <button type="button" :data-test="`coop-vacate-${seat.id}`" :disabled="!isOpen(seat.id)" @click="onVacate(seat.id)">vacate</button>
        </div>
        <div class="acts">
          <button type="button" data-test="coop-append-note" @click="onAppend(seat.id, 'note')">note</button>
          <button type="button" data-test="coop-append-sightline" @click="onAppend(seat.id, 'sightline')">sightline</button>
          <label class="verb">
            act
            <select v-model="verb" :data-test="`coop-verb-${seat.id}`">
              <option v-for="v in COOP_ROOM_VERBS" :key="v" :value="v">{{ v }}</option>
            </select>
            <button type="button" data-test="coop-append-act" @click="onAppend(seat.id, 'action')">append</button>
          </label>
        </div>
        <ul v-if="outbox(seat.id).length > 0" class="outbox">
          <li v-for="row in outbox(seat.id)" :key="row.key" data-test="coop-outbox-row" :data-ghost="!row.seated">
            t{{ row.tick }}·s{{ row.seq }}·{{ row.kind }}
          </li>
        </ul>
        <p v-else class="outbox-empty">outbox empty</p>
      </section>
    </div>

    <div class="bench" data-test="coop-bench">
      <span class="bench-title">bench (max-{{ COOP_MAX_SEAT_WRITERS }} seats law):</span>
      <span v-for="p in bench" :key="p.id" class="bench-seat">
        {{ p.label }} {{ seatStatus(p.id) }}
        <button v-if="!isOpen(p.id)" type="button" :data-test="`coop-join-${p.id}`" @click="onJoin(p.id)">join</button>
        <button v-else type="button" :data-test="`coop-vacate-${p.id}`" @click="onVacate(p.id)">vacate</button>
      </span>
    </div>

    <div class="columns">
      <section class="col">
        <h5>shared log — newest first</h5>
        <ul v-if="tape.length > 0" class="tape">
          <li v-for="row in tape" :key="row.key" class="tape-row" data-test="coop-tape-row" :data-ghost="!row.seated">
            <span class="ts">(t{{ row.tick }},s{{ row.seq }})</span>
            <span class="who">{{ row.label }}</span>
            <span class="kind">{{ row.kind }}</span>
            <span class="what">{{ row.payloadText }}</span>
            <span v-if="!row.seated" class="ghost">GHOST</span>
          </li>
        </ul>
        <p v-else class="empty" data-test="coop-tape-empty">empty room — the shared log has no lines yet; the digest below is the honest digest of nothing.</p>
      </section>

      <section class="col">
        <h5>equivalence readout (OD-17)</h5>
        <p class="digest" data-test="coop-digest" :data-equal="probe.invariantsHold">
          merged digest <code>{{ probe.digest }}</code>
        </p>
        <template v-if="probe.collision !== null">
          <p class="collision" data-test="coop-collision">probe held — logical set ambiguous: {{ probe.collision }}</p>
        </template>
        <template v-else>
          <p class="verdict" data-test="coop-equal" :data-equal="probe.invariantsHold">
            {{ probe.records }} records × {{ probe.arms.length }} arrival interleavings → {{ distinctArmDigests }} digest{{ distinctArmDigests === 1 ? " (one — the invariant holds)" : "s (DIVERGED)" }}
          </p>
          <p class="control" data-test="coop-control" :data-differs="String(probe.controlDiffers)">
            <template v-if="probe.controlDiffers === null">control arm idle — nothing to tamper yet</template>
            <template v-else-if="probe.controlDiffers">control ✓ tampered copy hashes differently (the readout discriminates)</template>
            <template v-else>control FAILED — a mutated record hashed the SAME</template>
          </p>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.room { display: grid; gap: 8px; font-family: var(--hh-typeface); font-size: 11px; }
.room-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.room-bar button, .seat-btns button, .acts button {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 40%, transparent);
  background: transparent;
  color: var(--hh-accent);
  font: inherit;
  border-radius: var(--hh-radius);
  padding: 1px 8px;
  cursor: pointer;
}
.room-bar button:disabled, .seat-btns button:disabled, .acts button:disabled { opacity: .4; cursor: default; }
.tick { color: var(--hh-hue-grey); font-variant-numeric: tabular-nums; }
.guard { margin-left: auto; color: var(--hh-hue-grey); }
.guard[data-armed="true"] { color: var(--hh-hue-green); }
.refusal {
  margin: 0;
  padding: 4px 8px;
  border: 1px solid color-mix(in srgb, var(--hh-hue-alarm) 55%, transparent);
  border-radius: var(--hh-radius);
  color: var(--hh-hue-alarm);
}
.seats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.seat, .col {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 18%, transparent);
  border-radius: var(--hh-radius);
  padding: 6px 8px;
}
.seat h5, .col h5 { margin: 0 0 6px; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; opacity: .6; }
.seat-status { float: right; text-transform: none; letter-spacing: 0; color: var(--hh-hue-amber); }
.seat-status[data-open="true"] { color: var(--hh-hue-green); }
.seat-btns, .acts { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; }
.verb { display: inline-flex; gap: 4px; align-items: center; }
.verb select {
  font: inherit;
  background: transparent;
  color: var(--hh-accent);
  border: 1px solid color-mix(in srgb, var(--hh-accent) 40%, transparent);
  border-radius: var(--hh-radius);
}
.outbox, .tape { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.outbox li { color: var(--hh-hue-amber); font-variant-numeric: tabular-nums; }
.outbox li[data-ghost="true"], .tape-row[data-ghost="true"] { color: var(--hh-hue-alarm); }
.outbox-empty, .empty { margin: 0; color: var(--hh-hue-grey); }
.bench { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; color: var(--hh-hue-grey); }
.bench-seat button {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 40%, transparent);
  background: transparent;
  color: var(--hh-accent);
  font: inherit;
  border-radius: var(--hh-radius);
  padding: 0 6px;
  cursor: pointer;
}
.columns { display: grid; grid-template-columns: 3fr 2fr; gap: 8px; }
.tape-row { display: flex; gap: 8px; font-variant-numeric: tabular-nums; }
.tape-row .ts { color: var(--hh-hue-grey); }
.tape-row .kind { color: var(--hh-hue-grey); }
.tape-row .ghost { color: var(--hh-hue-alarm); letter-spacing: .12em; }
.digest { margin: 0 0 4px; }
.digest code { color: var(--hh-accent); word-break: break-all; }
.verdict { margin: 0; color: var(--hh-hue-green); }
.verdict[data-equal="false"] { color: var(--hh-hue-alarm); }
.control { margin: 0; color: var(--hh-hue-grey); }
.collision { margin: 0; color: var(--hh-hue-alarm); }
</style>
