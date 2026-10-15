/**
 * Corpus mission wiring — the PROTO leg of the waves-tableId seam (@5df5586
 * `scenario/corpus.ts`). sim-core stays fs-free: `runScenario` takes a
 * host-injected `CorpusAuthority` and the scenario suite's own fixture host
 * (`corpusFixtures.ts`) reads content from disk with node:fs. This module is
 * what a BROWSER host does instead: the shipped g1 wave slice + the threat
 * registry arrive as `?raw` build-time strings (the lab coverage-grid
 * pattern), parse once, and seal into one memoized CorpusAuthority.
 *
 * The mission: `metastable-corpus`, the 11th §1.5 wire — the Metastable
 * heading's corpus twin, re-stormed from the REAL g1 wave table (wave 1 at
 * business-minute 30 over a 4/min floor) instead of hand-typed segments.
 * Witnesses are the scenario suite's own (base seed 904n, probe-derived
 * 2026-10-13): win arm offsets 0/1/2 stop at `win@240`; the ONE-field wire
 * flip `waves:[1] → [1,5]` stacks the corpus's 30/min wave 5 on top and the
 * run dies `guard:cascadeCollapse@80 / @81 / @85` by seed.
 *
 * Invitation law (the @bc11697 join, adopted browser-side): the shipped
 * type bundle's `threats.unlockedByBuildables` inverts into the real attack-
 * surface gate and the card shows BOTH readings side by side, never one
 * faked as the other. Probe answer over the cited waves: wave 1 composes
 * ONLY scanner-drizzle (behind public-whois-listing) — a fresh board starves
 * the authored arm entirely (fail-loud CORPUS_UNRESOLVED, never a quiet
 * season); wave 5 adds the ungated layer7-mimic, so the flip citation still
 * lands under the bare law, riding the packed cursor with its dice re-rolled
 * at m30 (storming m34 instead of the law-off m42). The seeded arm builds
 * every law buildable at tick 0 and replays the law-off witnesses BYTE-IDENT
 * — the suite's default-off honesty law (corpus.test.ts "fully built surface
 * replays the AUTHORED quarter"), so the pinned 6546099a… digest stands
 * untouched and the card documents law-on vs law-off rather than breaking
 * either.
 *
 * Honest scope: the board is the mission's own 8-slot web-1. Both host legs
 * now exist — the MAINLINE runner cites waves through the same public seam
 * (`runner/simCoreRunner.ts` @007a15d), and the WORKER LOOP adopted the
 * citation on the wire (additive `boot.corpus`, protocol still v1):
 * `shared/corpusHost.ts` builds the worker-side authority over all eight
 * shipped slices, law-off by default exactly like this card's "off" surface.
 */
import { asRunSeed } from "@hh/sim-core";
import sliceRaw from "../../../../packages/content/waves/g1-shared-web-first-quarter.json?raw";
import registryRaw from "../../../../packages/content/threats/registry-core.json?raw";
import bundleRaw from "../../../../packages/content/types/shared-web.json?raw";
import {
  SHIPPED_SCENARIO_WIRES,
  ScenarioError,
  gateCorpusWave,
  parseScenarioDoc,
  resolveCorpusWindows,
  runScenario,
  shippedScenario,
} from "@hh/sim-core/scenario";
import type {
  CorpusAuthority,
  CorpusWaveWindow,
  ScenarioCorpusTraffic,
  ScenarioDoc,
  ScenarioReport,
  ScenarioWire,
} from "@hh/sim-core/scenario";
import { buildInvitations } from "@hh/sim-core/waves";
import type { BuildOp, ForeignThreatMeta, ThreatInvitations } from "@hh/sim-core/waves";

export const CORPUS_MISSION_ID = "metastable-corpus";
export const G1_SLICE_STEM = "g1-shared-web-first-quarter";
/** The mission's authored seed base — the scenario suite's own BASE_SEED. */
export const CORPUS_MISSION_SEED = asRunSeed(904n);

/** Registry metadata the foreign entries do not carry (family, denomination)
 *  — the browser twin of corpusFixtures.buildThreatMeta, over ?raw text. */
function buildThreatMeta(): (threatId: string) => ForeignThreatMeta | undefined {
  const registry = JSON.parse(registryRaw) as {
    threats?: { id?: string; family?: string; denomination?: string }[];
  };
  const map = new Map<string, ForeignThreatMeta>();
  for (const raw of registry.threats ?? []) {
    if (
      typeof raw.id !== "string" ||
      typeof raw.family !== "string" ||
      typeof raw.denomination !== "string"
    ) {
      throw new Error(
        `corpusMission: registry-core threat record missing id/family/denomination: ${JSON.stringify(raw).slice(0, 80)}`,
      );
    }
    map.set(raw.id, {
      family: raw.family as ForeignThreatMeta["family"],
      denomination: raw.denomination as ForeignThreatMeta["denomination"],
    });
  }
  return (threatId: string) => map.get(threatId);
}

let authority: CorpusAuthority | null = null;

/** The law-free authority (every threat spawnable) — the stance the win /
 *  lose-flip witnesses were pinned against; memoized like the fixture host. */
export function protoCorpusAuthority(): CorpusAuthority {
  if (authority !== null) return authority;
  const slices = new Map<string, unknown>();
  slices.set(G1_SLICE_STEM, JSON.parse(sliceRaw) as unknown);
  authority = Object.freeze({ slices, threatMeta: buildThreatMeta() });
  return authority;
}

/* ─────────── the REAL attack-surface law (browser twin of @bc11697) ─────────── */

/** The shipped shared-web invite table, read the way corpusFixtures.
 *  sharedWebInvitationLaw reads it from disk — over the ?raw bundle the
 *  build already embeds. Fail loud if the content ever drops the law. */
function sharedWebInvitationLaw(): Readonly<Record<string, readonly string[]>> {
  const bundle = JSON.parse(bundleRaw) as {
    threats?: { unlockedByBuildables?: Record<string, readonly string[]> };
  };
  const law = bundle.threats?.unlockedByBuildables;
  if (law === undefined || Object.keys(law).length === 0) {
    throw new Error("corpusMission: shared-web.json carries no threats.unlockedByBuildables law");
  }
  return law;
}

let invitations: ThreatInvitations | null = null;

/** threat-id → inviter pool, inverted by the SAME public `buildInvitations`
 *  the sim-core fixture host uses — no second authority is invented here. */
export function protoInvitations(): ThreatInvitations {
  if (invitations !== null) return invitations;
  invitations = buildInvitations(sharedWebInvitationLaw());
  return invitations;
}

/** Browser twin of corpusFixtures.FULL_BUILD_LOG: every buildable the law
 *  names, built at tick 0 — the fully-informed surface. */
export function protoFullBuildLog(): readonly BuildOp[] {
  return Object.freeze(
    Object.keys(sharedWebInvitationLaw())
      .sort()
      .map((buildableId) => Object.freeze({ atTick: 0n, op: "build" as const, buildableId })),
  );
}

/** Which attack surface a run (or a verdict walk) is judged against.
 *  "off" is the law-free authority the original witnesses were pinned on. */
export type CorpusMissionSurface = "off" | "empty-surface" | "seeded-surface";

const surfaceAuthorities = new Map<CorpusMissionSurface, CorpusAuthority>();

/** The CorpusAuthority for one surface — memoized per surface, frozen. */
export function authorityForSurface(surface: CorpusMissionSurface): CorpusAuthority {
  const cached = surfaceAuthorities.get(surface);
  if (cached !== undefined) return cached;
  const base = protoCorpusAuthority();
  const authorityFor: CorpusAuthority =
    surface === "off"
      ? base
      : surface === "empty-surface"
        ? Object.freeze({ ...base, invitations: protoInvitations() })
        : Object.freeze({ ...base, invitations: protoInvitations(), buildLog: protoFullBuildLog() });
  surfaceAuthorities.set(surface, authorityFor);
  return authorityFor;
}

/** The shipped win doc (never mutated — the wall is re-crossed per arm). */
export function corpusMissionDoc(): ScenarioDoc {
  return shippedScenario(CORPUS_MISSION_ID) as ScenarioDoc;
}

/** LOSE arm: clone the SHIPPED WIRE JSON, flip ONE field (waves [1] → [1,5],
 *  stacking the corpus's 30/min wave 5), re-cross the parse wall. Same law
 *  as the scenario suite's twinWire — the wire literal, never the parsed doc
 *  (the parsed board carries bigints and JSON has no bigint). */
export function corpusMissionFlipDoc(): ScenarioDoc {
  const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES[CORPUS_MISSION_ID])) as ScenarioWire & {
    traffic: { tableId: string; waves?: number[] };
  };
  wire.traffic.waves = [1, 5];
  return parseScenarioDoc(wire);
}

export type CorpusMissionArm =
  | "win"
  | "lose-flip"
  | "no-authority"
  | "law-empty-win"
  | "law-empty-flip"
  | "law-seeded-win"
  | "law-seeded-flip";

interface ArmSpec {
  readonly flip: boolean;
  readonly surface: CorpusMissionSurface | "none";
  /** Arms the invitation law predicts refuse: the run path renders the
   *  ScenarioError instead of a report. Any OTHER throw re-raises loud. */
  readonly refusalExpected: boolean;
}

const ARM_SPECS: Readonly<Record<CorpusMissionArm, ArmSpec>> = Object.freeze({
  win: { flip: false, surface: "off", refusalExpected: false },
  "lose-flip": { flip: true, surface: "off", refusalExpected: false },
  "no-authority": { flip: false, surface: "none", refusalExpected: true },
  "law-empty-win": { flip: false, surface: "empty-surface", refusalExpected: true },
  "law-empty-flip": { flip: true, surface: "empty-surface", refusalExpected: false },
  "law-seeded-win": { flip: false, surface: "seeded-surface", refusalExpected: false },
  "law-seeded-flip": { flip: true, surface: "seeded-surface", refusalExpected: false },
});

export interface CorpusMissionOutcome {
  readonly arm: CorpusMissionArm;
  readonly seedOffset: number;
  readonly report?: ScenarioReport;
  /** Set on the fail-loud arm: the ScenarioError message the wall answered. */
  readonly error?: string;
}

/** Run one arm. "no-authority" shows the original fail-law (a corpus doc
 *  run WITHOUT config.corpus throws CORPUS_UNRESOLVED at 'config.corpus'
 *  before tick 1); "law-empty-win" extends it: the REAL law starves the
 *  fully-gated wave-1 citation at 'traffic.waves' — same no-quiet-seasons
 *  law, deeper reason. */
export function runCorpusMission(arm: CorpusMissionArm, seedOffset = 0): CorpusMissionOutcome {
  const spec = ARM_SPECS[arm];
  const doc = spec.flip ? corpusMissionFlipDoc() : corpusMissionDoc();
  const corpus = spec.surface === "none" ? undefined : authorityForSurface(spec.surface);
  try {
    const report =
      corpus === undefined
        ? runScenario(doc, CORPUS_MISSION_SEED, { seedOffset })
        : runScenario(doc, CORPUS_MISSION_SEED, { seedOffset, corpus });
    return Object.freeze({ arm, seedOffset, report });
  } catch (error) {
    if (!spec.refusalExpected) throw error;
    const message = error instanceof ScenarioError ? `${error.code} at '${error.path}'` : String(error);
    return Object.freeze({ arm, seedOffset, error: message });
  }
}

/* ─────────────── per-wave invitation verdicts (display surface) ─────────────── */

/** One cited wave's gate decision at its cursor position — the plan the
 *  seam itself computed for scheduled waves, re-gated (zero dice) for the
 *  excluded ones so the card can name what the fresh board never sees. */
export interface CorpusMissionVerdict {
  readonly waveN: number;
  /** False iff the whole storm was excluded (nothing spawnable as-of). */
  readonly scheduled: boolean;
  /** Cursor minute the gate judged the wave at. */
  readonly startMinute: number;
  readonly gatedThreatIds: readonly string[];
  readonly invitedThreatIds: readonly string[];
  readonly spawns: boolean;
}

function corpusTrafficOf(doc: ScenarioDoc): ScenarioCorpusTraffic {
  const traffic = doc.traffic;
  if (traffic.profile !== "corpus") {
    throw new Error(`corpusMission: doc "${doc.id}" is not a corpus citation — verdicts need traffic.profile === "corpus"`);
  }
  return traffic;
}

/** The entry threat-ids one cited wave composes — read off the raw slice
 *  (the join the law is threat-id based on; the slice carries no markers). */
function sliceThreatIds(tableId: string, waveN: number): readonly string[] {
  const raw = protoCorpusAuthority().slices.get(tableId) as {
    waves?: { n: number; entries?: { threat?: string }[] }[];
  };
  const wave = raw.waves?.find((w) => w.n === waveN);
  if (wave === undefined) {
    throw new Error(`corpusMission: corpus table "${tableId}" ships no wave ${waveN}`);
  }
  const ids = (wave.entries ?? []).map((entry) => entry.threat);
  if (ids.some((id) => typeof id !== "string")) {
    throw new Error(`corpusMission: corpus table "${tableId}" wave ${waveN} has an entry without a threat id`);
  }
  return ids as string[];
}

/** Walk a citation through the seam's own scheduling authority:
 *  `resolveCorpusWindows` answers for every wave that LANDS (its `plan` is
 *  the shipped witness), and `gateCorpusWave` — the same pure decision the
 *  seam runs internally — answers for the storms the surface starved, at
 *  the packed-cursor minute the seam judged them. A disagreement throws:
 *  the card would rather crash than render a fake gate. */
export function missionVerdicts(doc: ScenarioDoc, surface: CorpusMissionSurface): readonly CorpusMissionVerdict[] {
  const traffic = corpusTrafficOf(doc);
  const authority = authorityForSurface(surface);
  let windows: readonly CorpusWaveWindow[];
  try {
    windows = resolveCorpusWindows(traffic, CORPUS_MISSION_SEED, authority);
  } catch (error) {
    // The seam refuses a citation whose EVERY storm is gated — never a
    // quiet season by accident. The card still owes the per-wave WHY, so
    // the walk proceeds on zero scheduled windows; any other refusal
    // (missing slice, malformed wave) re-raises loud.
    const everyStormStarved =
      error instanceof ScenarioError &&
      error.code === "CORPUS_UNRESOLVED" &&
      error.message.includes("uninvited at the attack surface");
    if (!everyStormStarved) throw error;
    windows = [];
  }
  const scheduledByWave = new Map(windows.map((w) => [w.waveN, w]));
  const invitationsOf = authority.invitations ?? buildInvitations({});
  const buildLogOf = authority.buildLog ?? [];
  const verdicts: CorpusMissionVerdict[] = [];
  let cursor = traffic.waveStartMinute;
  for (const waveN of traffic.waves) {
    const landed = scheduledByWave.get(waveN);
    if (landed !== undefined) {
      verdicts.push(
        Object.freeze({
          waveN,
          scheduled: true,
          startMinute: landed.startMinute,
          gatedThreatIds: landed.plan.gatedThreatIds,
          invitedThreatIds: landed.plan.invitedThreatIds,
          spawns: landed.plan.spawns,
        }),
      );
      cursor += landed.windowMinutes;
      continue;
    }
    const starved = gateCorpusWave(waveN, sliceThreatIds(traffic.tableId, waveN), cursor, invitationsOf, buildLogOf);
    if (starved.spawns) {
      throw new Error(
        `corpusMission: cursor walk invites wave ${waveN} but resolveCorpusWindows excluded it — the display and the seam disagree`,
      );
    }
    verdicts.push(
      Object.freeze({
        waveN,
        scheduled: false,
        startMinute: starved.scheduledStartMinute,
        gatedThreatIds: starved.gatedThreatIds,
        invitedThreatIds: starved.invitedThreatIds,
        spawns: false,
      }),
    );
  }
  return Object.freeze(verdicts);
}

/** Render lines for the verdict walk — counts plus the gated names, one
 *  honest line per cited wave. A fully starved citation prints its EXCLUDED
 *  rows plus the seam's refusal, so the panel never shows an empty season. */
export function verdictRows(doc: ScenarioDoc, surface: CorpusMissionSurface): readonly string[] {
  const verdicts = missionVerdicts(doc, surface);
  const rows = verdicts.map((v) => {
    const gate =
      v.gatedThreatIds.length === 0
        ? "ungated storm"
        : `gated ${v.gatedThreatIds.join(", ")} · invited ${v.invitedThreatIds.length}/${v.gatedThreatIds.length}`;
    const verdict = v.scheduled ? `LANDS @ m${v.startMinute}` : `EXCLUDED @ m${v.startMinute} (nothing spawnable)`;
    return `wave ${v.waveN} — ${gate} — ${verdict}`;
  });
  if (verdicts.length > 0 && verdicts.every((v) => !v.scheduled)) {
    rows.push("citation refused — CORPUS_UNRESOLVED (never a quiet season by silence)");
  }
  return Object.freeze(rows);
}

/** Render lines for one finished run — outcome, stop witness, boundary,
 *  digest, and the raw trace census. No derived claims. */
export function missionRows(outcome: CorpusMissionOutcome): readonly string[] {
  if (outcome.report === undefined) {
    return Object.freeze([`offset ${outcome.seedOffset}: threw ${outcome.error ?? "(unknown)"}`]);
  }
  const r = outcome.report;
  const winLine = r.objectives.win[0];
  const winText = winLine === undefined ? "(no win objective)" : `${winLine.holds ? "held" : "open"} ${winLine.progress.toString()}/65536`;
  return Object.freeze([
    `offset ${outcome.seedOffset} · ${r.scenarioId} · seed ${r.runSeed.toString()}`,
    `outcome ${r.outcome} — stop ${r.stopReason} at m${r.endMinute} (tick ${r.endTick})`,
    `digest ${r.endDigest}`,
    `trace: arrivals ${r.trace.arrivals} · served ${r.trace.served} · bounced ${r.trace.bounced} · landed ${r.trace.landed} · FP ${r.trace.falsePositives}`,
    `economy: ${r.trace.economyRounds} folds · ${r.trace.economyRefusals} refusals · cash ${r.cashStartMicroUsd.toString()}→${r.cashEndMicroUsd.toString()} µ$`,
    `win objective: ${winText}`,
  ]);
}
