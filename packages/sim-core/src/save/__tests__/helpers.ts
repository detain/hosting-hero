/**
 * Shared fixtures for the save/ suite: a founder node with a book of
 * business, unlocks (incl. scar-hung ones), a museum, and a manifest-legal
 * spawn setup. Deterministic literals only — no randomness anywhere.
 */

import { asEntityId, asMoney, asRunSeed, type EntityId, type SimTick } from "../../types";
import type { CompanyNode, CustomerBookRecord, DoctrineEntry, MuseumExhibitRecord, NodeUnlockRecord, PlaybookSlotRecord } from "../node";
import { newCompanyNode } from "../node";
import type { InheritanceManifest, LineageGraph } from "../lineage";
import { emptyLineageGraph, foundCompany } from "../lineage";

export const id = (s: string): EntityId => asEntityId(s);
export const tick = (n: bigint): SimTick => n;

export const KINDNESS = 20000n; // ~0.305 in Q16.16 — "drove out at 2am" grade
export const SHORTCUT = -24000n; // ~ -0.366 — a price hike remembered

export function unlockedNodeRecord(node: string, via: NodeUnlockRecord["via"], scarRef: string | null = null): NodeUnlockRecord {
  return {
    node: id(node),
    via,
    scarRef: scarRef === null ? null : id(scarRef),
    incidentRef: null,
    stamp: via === "scar" ? "learned_hard_way" : null,
    stampAtTick: via === "scar" ? 100n : null,
    handwritingOwnerStaffId: null,
    faded: 0,
  };
}

export function customerBook(overrides: Omit<Partial<CustomerBookRecord>, "id" | "name"> & { id: string; name: string }): CustomerBookRecord {
  return {
    plan: "shared-web",
    mrrMicroUsd: asMoney(5_000_000n),
    tenureMin: 1000,
    termEndMin: 5000,
    cohortId: "cohort-1",
    treatmentLog: [],
    grudgeScore: 0n,
    referenceEligible: false,
    status: "active",
    whaleShare: 1000n,
    ...overrides,
    id: id(overrides.id),
  };
}

export function museumExhibit(overrides: Omit<Partial<MuseumExhibitRecord>, "id" | "title"> & { id: string; title: string }): MuseumExhibitRecord {
  return {
    sourceFacet: "postmortems",
    sourceRef: "pm-1",
    runId: id("run-1"),
    runSeed: asRunSeed(7n),
    acquiredAtTick: 50n,
    deprecated: false,
    memorialNote: null,
    ...overrides,
    id: id(overrides.id),
  };
}

export function playbookSlot(runbookId: string, rung: number, carried = true, sealState: PlaybookSlotRecord["sealState"] = "drilled"): PlaybookSlotRecord {
  return { runbookId, rung, draftedByStaffId: null, sealState, carried, mttrBonusUs: rung * 30 };
}

export function doctrine(id_: string, textRef: string = "cheap partial answers beat heroics"): DoctrineEntry {
  return { id: id(id_), textRef, adoptedAtTick: 10n };
}

/** Founder node: era "dial-up", 4 unlocked nodes (3 kept + 1 left behind),
 *  one scar, one museum exhibit, two customers. */
export function founderNode(): CompanyNode {
  const base = newCompanyNode({ id: "co-gen-1", parentId: null, name: "Pipe & Panic", eraOrigin: "dial-up", foundedAtTick: 0n, successionType: "found" });
  return {
    ...base,
    tierReached: 3,
    nodesUnlocked: [
      unlockedNodeRecord("load-balancer", "scar", "scar-data-loss"),
      unlockedNodeRecord("self-service-portal", "foresight"),
      unlockedNodeRecord("abuse-desk", "testimony"),
      unlockedNodeRecord("anycast", "milestone"),
    ],
    scars: [
      {
        id: id("scar-data-loss"),
        originEventRef: "cause-outage-9",
        acquiredAtTick: 90n,
        modifierPayload: { mttrMultiplier: 65536n },
        // unit fraction per the S-4 display-domain law: ~31/90 clean days
        clearance: { rule: "90_clean_days", progress: 0.3444 },
        disclosure: "disclosed",
        payoffGrant: null,
        mapPosition: { x: 4, y: 2 },
      },
    ],
    museum: [museumExhibit({ id: "exhibit-first-polaroid", title: "The 2am Drive" })],
    customerBooks: [customerBook({ id: "cust-acme", name: "Acme Webs" }), customerBook({ id: "cust-globex", name: "Globex" })],
    playbook: [playbookSlot("runbook-failover", 4), playbookSlot("runbook-restore", 2)],
    doctrine: { perAct: [doctrine("doc-1")], current: doctrine("doc-1") },
  };
}

export function legalManifest(parentId = "co-gen-1"): InheritanceManifest {
  return {
    keptNodes: [id("load-balancer"), id("self-service-portal"), id("abuse-desk")],
    doctrine: doctrine("doc-1"),
    playbook: [playbookSlot("runbook-failover", 4)],
    cashSliceMicroUsd: null,
    failureOnlyUnlock: null,
    handwritingParent: id(parentId),
  };
}

/** Graph with one founder registered under the given ids. */
export function graphWithFounder(node?: CompanyNode): { graph: LineageGraph; founderId: EntityId } {
  const founder = node ?? founderNode();
  const { graph } = foundCompany(emptyLineageGraph(), { id: founder.id, name: founder.identity.name, eraOrigin: founder.identity.eraOrigin, foundedAtTick: founder.identity.foundedAtTick });
  // replace the generated empty node with the rich founder (test setup only)
  const nodes = new Map(graph.nodes);
  nodes.set(founder.id, founder);
  return { graph: { ...graph, nodes }, founderId: founder.id };
}
