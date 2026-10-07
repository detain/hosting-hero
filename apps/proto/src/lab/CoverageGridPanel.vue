<script setup lang="ts">
/**
 * CoverageGridPanel — the §2.1 Coverage Grid (12 threat roles × 9 defense
 * roles = 108 cells) played with the SHARED-WEB palette: check buildables,
 * watch the ladder repaint, read which dark rows the currently-spawnable
 * threats actually exploit (P2 invites flagged on the sample chips).
 *
 * Ladder paint is the model's documented call (coverageGridModel header):
 * dark = hole (dashed grey — absence has no hue job), thin = amber
 * (alert-fill), ok = green washed (served-ok, partial), strong = green
 * solid. Invited-threat marks ride magenta (threat-mark). The fills are set
 * through INLINE :style color-mix so no ledger value is ever spelled in the
 * <style> block (the hue-law scanner walks lab/ too).
 */
import { computed, onBeforeUnmount, ref } from "vue";
import StatusChip from "../chrome/StatusChip.vue";
import { globalExplain } from "../chrome/explainRegistry";
import {
  DEFENSE_ROLE_IDS,
  THREAT_ROLES,
  buildPalette,
  cellTip,
  ladderStyle,
  rosterView,
  strengthRatio,
} from "./coverageGridModel";
import type { CoverageCell } from "@hh/sim-core/coverage";

const palette = buildPalette();

/** Start from the un-built world: every column dark, the report maximal —
 *  the panel's first lesson is that the grid is a HOLE-map before it is a
 *  scoreboard. */
const selected = ref<ReadonlySet<string>>(new Set<string>());

const view = computed(() => rosterView(palette, [...selected.value]));
const summary = computed(() => view.value.grid.summary);

function toggle(id: string): void {
  const next = new Set(selected.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selected.value = next;
}

function cellFor(threatRole: string, defenseRole: string): CoverageCell | null {
  return view.value.grid.cells.get(`${threatRole}|${defenseRole}`) ?? null;
}

/** Inline paint per the documented ladder mapping (see header). */
function cellStyle(cell: CoverageCell): Record<string, string> {
  const style = ladderStyle(cell.state);
  if (style.hole) return {};
  const hue = style.hueVar ?? "transparent";
  return {
    background: `color-mix(in srgb, ${hue} ${Math.round(style.wash * 100)}%, transparent)`,
    borderColor: hue,
  };
}

function titleFor(cell: CoverageCell): string {
  const tip = cellTip(cell);
  return `${tip.threatRole} × ${tip.defenseRole} — ${tip.state} (${tip.strengthPct})${
    tip.contributors.length > 0 ? `\ncontributors: ${tip.contributors.join(", ")}` : "\nnothing declares this column"
  }`;
}

const invitedSet = computed(() => new Set(view.value.recentInvites));

const selectedCount = computed(() => selected.value.size);

onBeforeUnmount(() => {
  globalExplain.clear();
});

/** One Explain anchor: the hole-count header number. */
globalExplain.register({
  id: "lab:coverage-dark",
  payload: {
    title: "dark cells",
    formula: "count of cells with max-contributor strength < COVERAGE_LADDER.darkBelow (≈0.10)",
    inputs: [
      { name: "roster size", value: String(selectedCount.value) },
      { name: "cells", value: String(view.value.grid.cells.size) },
    ],
  },
});
</script>

<template>
  <div class="coverage-lab" data-test="lab-coverage">
    <header class="lab-head">
      <h2>Coverage Grid — {{ THREAT_ROLES.length }} × {{ DEFENSE_ROLE_IDS.length }} = {{ view.grid.cells.size }} cells</h2>
      <p class="sub">shared-web palette, registry counters as data. Toggling a tile repaints the ladder live;
        practices only open the spawnable pool.</p>
    </header>

    <div class="lab-cols">
      <!-- roster editor -->
      <section class="roster" aria-label="roster editor">
        <h3>Buildables</h3>
        <ul class="tiles">
          <li v-for="item in palette.items.filter((i) => i.kind === 'defense')" :key="item.id">
            <label class="tile" :class="{ 'tile--on': selected.has(item.id), 'tile--untagged': item.defenseRoles.length === 0 }"
                   :data-test="`lab-tile-${item.id}`">
              <input type="checkbox" :checked="selected.has(item.id)" data-test="lab-tile-check" @change="toggle(item.id)" />
              <span class="tile-id">{{ item.id }}</span>
              <span v-if="item.defenseRoles.length === 0" class="untagged" title="no registry counter credits this buildable — it fills no column">
                no column
              </span>
              <span v-else class="roles">{{ item.defenseRoles.join(" · ") }}</span>
            </label>
          </li>
        </ul>
        <h3>Practices (surface openers)</h3>
        <ul class="tiles">
          <li v-for="item in palette.items.filter((i) => i.kind === 'practice')" :key="item.id">
            <label class="tile tile--practice" :class="{ 'tile--on': selected.has(item.id) }" :data-test="`lab-tile-${item.id}`">
              <input type="checkbox" :checked="selected.has(item.id)" data-test="lab-tile-check" @change="toggle(item.id)" />
              <span class="tile-id">{{ item.id }}</span>
              <span class="invite-badge" :title="`invites: ${item.invites.join(', ')}`">+{{ item.invites.length }}</span>
            </label>
          </li>
        </ul>
        <p class="spawn-note" data-test="lab-spawnable">
          spawnable {{ view.spawnable.length }}/{{ palette.allThreatIds.length }} ·
          invited now {{ view.recentInvites.length }}
        </p>
        <p v-if="view.untaggedSelected.length > 0" class="spawn-note" data-test="lab-untagged">
          untagged (honest, excluded from profile): {{ view.untaggedSelected.join(", ") }}
        </p>
      </section>

      <!-- grid + report -->
      <section class="gridside" aria-label="coverage grid">
        <div class="summary">
          <span class="chip" data-test="lab-dark-count">
            <StatusChip value="DOWN" :count="summary.darkCount" /> dark
          </span>
          <span class="chip"><StatusChip value="AT RISK" :count="summary.thinCount" /> thin</span>
          <span class="chip"><StatusChip value="DEGRADED" :count="summary.okCount" /> ok</span>
          <span class="chip"><StatusChip value="HEALTHY" :count="summary.strongCount" /> strong</span>
          <span class="chip">best {{ Math.round(strengthRatio(summary.bestCoverage) * 100) }}%</span>
        </div>

        <table class="grid" data-test="lab-grid">
          <thead>
            <tr>
              <th class="corner">role ↓ / defense →</th>
              <th v-for="def in DEFENSE_ROLE_IDS" :key="def">{{ def }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in THREAT_ROLES" :key="role" :data-test="`lab-row-${role}`">
              <th class="row-head">{{ role }}</th>
              <td v-for="def in DEFENSE_ROLE_IDS" :key="def">
                <div
                  v-if="cellFor(role, def) !== null"
                  class="cell"
                  :class="{ 'cell--hole': ladderStyle(cellFor(role, def)!.state).hole }"
                  :style="cellFor(role, def) !== null ? cellStyle(cellFor(role, def)!) : {}"
                  :title="cellFor(role, def) !== null ? titleFor(cellFor(role, def)!) : ''"
                  :data-test="`lab-cell-${role}-${def}`"
                >
                  <span v-if="cellFor(role, def) !== null && cellFor(role, def)!.contributors.length > 0" class="own">▲</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="view.gaps.length > 0" class="gaps" data-test="lab-gaps">
          single-answer rows (< 2 columns at ok+): <code>{{ view.gaps.join(", ") }}</code>
        </p>

        <h3>Dark-cell report — holes the spawnable pool can actually poke</h3>
        <table class="report" data-test="lab-dark-report">
          <thead>
            <tr><th>role</th><th>exposure</th><th>weakest defenses</th><th>sample threats</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in view.darkRows" :key="row.threatRole" :data-test="`lab-dark-row-${row.threatRole}`">
              <td class="role">{{ row.threatRole }}</td>
              <td><StatusChip :value="ladderStyle(row.state).status" /></td>
              <td class="weakest">{{ row.weakestDefenses.join(", ") }}</td>
              <td class="samples">
                <span v-for="t in row.sampleThreatIds" :key="t" class="threat"
                      :class="{ invited: invitedSet.has(t) }" :data-test="`lab-threat-${t}`">{{ t }}<template v-if="invitedSet.has(t)"> ✦</template></span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="view.darkRows.length === 0" class="covered" data-test="lab-covered">
          no exposed dark/thin row meets a spawnable threat — the holes nobody can poke are still holes, just quiet ones.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Era tokens + ledger vars only — see UnattendedLabPanel header for the
   hue-job ledger of this lane. */
.coverage-lab {
  font-family: var(--hh-typeface);
  color: var(--hh-accent);
  padding: 14px 18px 40px;
  max-width: 1240px;
}
.lab-head h2 { margin: 0 0 2px; font-size: 17px; letter-spacing: 0.04em; }
.sub { margin: 0 0 10px; font-size: 11px; color: color-mix(in srgb, var(--hh-accent) 62%, transparent); }
.lab-cols { display: grid; grid-template-columns: minmax(280px, 360px) 1fr; gap: 18px; align-items: start; }
h3 { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; margin: 10px 0 4px; opacity: 0.75; }
.tiles { list-style: none; margin: 0; padding: 0; }
.tile {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  border: 1px solid color-mix(in srgb, var(--hh-accent) 20%, transparent);
  border-radius: var(--hh-radius);
  padding: 3px 8px;
  margin: 3px 0;
  cursor: pointer;
}
.tile--on { border-color: var(--hh-hue-green); background: color-mix(in srgb, var(--hh-hue-green) 10%, transparent); }
.tile--practice { border-style: dashed; }
.tile--untagged { opacity: 0.75; }
.tile-id { flex: 1; }
.roles { font-size: 10px; opacity: 0.7; }
.untagged { font-size: 10px; color: var(--hh-hue-grey); }
.invite-badge {
  font-size: 10px;
  border: 1px solid var(--hh-hue-magenta);
  color: var(--hh-hue-magenta);
  border-radius: var(--hh-radius);
  padding: 0 5px;
}
.spawn-note { font-size: 11px; opacity: 0.8; }
.summary { display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px; margin-bottom: 8px; }
.chip { display: inline-flex; align-items: center; gap: 4px; }

table { border-collapse: collapse; font-size: 11px; }
.grid { margin-bottom: 10px; }
.grid th { font-weight: 600; opacity: 0.75; padding: 2px 5px; }
.corner { text-align: left; }
.row-head { text-align: left; white-space: nowrap; }
.grid td { padding: 2px; }
.cell {
  width: 44px;
  height: 20px;
  border: 1px solid color-mix(in srgb, var(--hh-accent) 18%, transparent);
  border-radius: 2px;
  position: relative;
  background: color-mix(in srgb, var(--hh-surface) 85%, #000 5%);
}
.cell--hole {
  border: 1px dashed var(--hh-hue-grey);
  background: color-mix(in srgb, var(--hh-surface) 70%, #000 12%);
}
.own {
  position: absolute;
  right: 2px;
  bottom: 0;
  font-size: 9px;
  opacity: 0.85;
}
.gaps code { font-size: 11px; }
.report { width: 100%; }
.report th, .report td { border-bottom: 1px solid color-mix(in srgb, var(--hh-accent) 12%, transparent); padding: 3px 6px; text-align: left; vertical-align: top; }
.report .role { font-weight: 700; white-space: nowrap; }
.weakest { opacity: 0.85; }
.samples { display: flex; flex-wrap: wrap; gap: 4px; }
.threat {
  border: 1px solid color-mix(in srgb, var(--hh-accent) 30%, transparent);
  border-radius: var(--hh-radius);
  padding: 0 6px;
  font-size: 10px;
}
.threat.invited {
  border-color: var(--hh-hue-magenta);
  color: var(--hh-hue-magenta);
}
.covered { font-size: 12px; opacity: 0.8; }
</style>
