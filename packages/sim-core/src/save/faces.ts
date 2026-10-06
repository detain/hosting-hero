/**
 * The four read faces (Appendix C §2.3, RATIFIED R-3): Wall / Scrapbook /
 * Almanac / People — plus the Museum walk-through — are QUERY VIEWS over the
 * write facets, NEVER storage buckets (WS-6 R6: treating faces as buckets
 * destroys the runbook ladder and the anticipation-token economy).
 *
 * Everything in this file is a derived projection: no face owns data, each
 * knows only where to read. (The write side lives in modes.ts + node.ts.)
 */

import type { CompanyNode } from "./node.ts";
import type { LineageGraph } from "./lineage.ts";
import { getNode } from "./lineage.ts";
import type { SharedStreaks } from "./streaks.ts";

export type ReadFace = "wall" | "scrapbook" | "almanac" | "people";

/* ═══════════════════════ WALL — proof of mastery ═══════════════════════ */

export interface WallView {
  readonly nodesUnlocked: CompanyNode["nodesUnlocked"];
  readonly credentials: CompanyNode["credentials"];
  readonly medals: CompanyNode["medals"];
  readonly linesEverRun: CompanyNode["linesEverRun"];
  /** Shared cross-mode counters surface on the Wall (L9/L21 cross-sees). */
  readonly streaks: SharedStreaks;
  readonly codex: CompanyNode["codex"];
}

export function readWall(node: CompanyNode, streaks: SharedStreaks): WallView {
  return {
    nodesUnlocked: node.nodesUnlocked,
    credentials: node.credentials,
    medals: node.medals,
    linesEverRun: node.linesEverRun,
    streaks,
    codex: node.codex,
  };
}

/* ═══════════════════════ SCRAPBOOK — the memoir face ═══════════════════════ */

export interface ScrapbookView {
  readonly scars: CompanyNode["scars"];
  /** Immortal history: retired scars stay readable even while inactive. */
  readonly scarsRetired: CompanyNode["scarsRetired"];
  readonly postmortems: CompanyNode["postmortems"];
  readonly ghosts: CompanyNode["ghosts"];
  readonly lifetimeCostOfLessonsMicroUsd: CompanyNode["lifetimeCostOfLessonsMicroUsd"];
  readonly deadDrives: CompanyNode["deadDrives"];
  readonly unlockDraftsPassed: CompanyNode["unlockDraftsPassed"];
  /** Self-confrontation view: the Past-Self generator's input (L19). */
  readonly habits: CompanyNode["habits"];
}

export function readScrapbook(node: CompanyNode): ScrapbookView {
  return {
    scars: node.scars,
    scarsRetired: node.scarsRetired,
    postmortems: node.postmortems,
    ghosts: node.ghosts,
    lifetimeCostOfLessonsMicroUsd: node.lifetimeCostOfLessonsMicroUsd,
    deadDrives: node.deadDrives,
    unlockDraftsPassed: node.unlockDraftsPassed,
    habits: node.habits,
  };
}

/* ═══════════════════════ ALMANAC — the ledger face ═══════════════════════ */

export interface AlmanacView {
  readonly records: CompanyNode["records"];
  readonly finances: CompanyNode["finances"];
  readonly theMultiple: CompanyNode["theMultiple"];
  readonly creditGrade: CompanyNode["creditGrade"];
  /** Searchable attribution stream (L13 Retro-Thread source). */
  readonly attributionEvents: CompanyNode["attributionEvents"];
  readonly annualReports: CompanyNode["annualReports"];
  /** Cross-lineage counters ride beside the node's own (L8 "every company"). */
  readonly globalRecords: Readonly<Record<string, number | string>>;
}

export function readAlmanac(node: CompanyNode, globalRecords: Readonly<Record<string, number | string>> = {}): AlmanacView {
  return {
    records: node.records,
    finances: node.finances,
    theMultiple: node.theMultiple,
    creditGrade: node.creditGrade,
    attributionEvents: node.attributionEvents,
    annualReports: node.annualReports,
    globalRecords,
  };
}

/* ═══════════════════════ PEOPLE — the cast face ═══════════════════════ */

export interface PeopleView {
  readonly staff: CompanyNode["staff"];
  readonly alumni: CompanyNode["alumni"];
  readonly spineCast: CompanyNode["spineCast"];
  readonly culture: CompanyNode["culture"];
  /** Wiki authorship is a PEOPLE-face read (who wrote what, L4). */
  readonly wikiAuthorship: readonly { readonly topic: string; readonly authorStaffId: string | null }[];
  /** Who holds which skill nodes (staff as assignable cards, §7.5). */
  readonly skillHolders: readonly { readonly staffId: string; readonly skillNode: string }[];
}

export function readPeople(node: CompanyNode): PeopleView {
  return {
    staff: node.staff,
    alumni: node.alumni,
    spineCast: node.spineCast,
    culture: node.culture,
    wikiAuthorship: node.wiki.map((w) => ({ topic: w.topic, authorStaffId: w.authorStaffId })),
    skillHolders: node.staff.flatMap((s) => s.skillNodesHeld.map((k) => ({ staffId: s.id, skillNode: k }))),
  };
}

/* ═══════════════════════ dispatcher + museum walk-through ═══════════════════════ */

export type FaceView =
  | { readonly face: "wall"; readonly view: WallView }
  | { readonly face: "scrapbook"; readonly view: ScrapbookView }
  | { readonly face: "almanac"; readonly view: AlmanacView }
  | { readonly face: "people"; readonly view: PeopleView };

export interface FaceReadContext {
  readonly streaks: SharedStreaks;
  readonly globalRecords: Readonly<Record<string, number | string>>;
}

/** The single read API per face (WS-7 renders ONLY from here — faces are the
 *  contract between storage and screens). */
export function readFace(nodeId: string, graph: LineageGraph, face: ReadFace, ctx: FaceReadContext): FaceView {
  const node = getNode(graph, nodeId as CompanyNode["id"]);
  switch (face) {
    case "wall":
      return { face, view: readWall(node, ctx.streaks) };
    case "scrapbook":
      return { face, view: readScrapbook(node) };
    case "almanac":
      return { face, view: readAlmanac(node, ctx.globalRecords) };
    case "people":
      return { face, view: readPeople(node) };
  }
}

/** Museum = all four faces, spatially arranged (floorplan is WS-7's job;
 *  save-side the museum is just the union read + the exhibit registry). */
export interface MuseumTourView {
  readonly wall: WallView;
  readonly scrapbook: ScrapbookView;
  readonly almanac: AlmanacView;
  readonly people: PeopleView;
  readonly exhibits: CompanyNode["museum"];
}

export function readMuseum(node: CompanyNode, ctx: FaceReadContext): MuseumTourView {
  return {
    wall: readWall(node, ctx.streaks),
    scrapbook: readScrapbook(node),
    almanac: readAlmanac(node, ctx.globalRecords),
    people: readPeople(node),
    exhibits: node.museum,
  };
}
