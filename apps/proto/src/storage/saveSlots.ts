/**
 * storage/saveSlots — named LONG SAVE slots over a Storage-shaped port.
 *
 * v0 storage is `localStorage` (the mission's sanctioned choice), reached
 * only through the `SlotStorage` port below — the same injected-port
 * posture the engine's SaveStorePort takes on the filesystem side, minus
 * the tmp+rename atomicity (a single setItem is atomic per key in
 * Web Storage; the engine's codec guarantees the payload's integrity, and
 * a torn write would simply fail the strict parse at read as a corrupt
 * slot, listed honestly and never silently repaired).
 *
 * Laws pinned here:
 *  - NAMES are player data: trimmed, non-empty, <= 40 chars, no control
 *    characters (they ride inside a storage key). Refused fail-loud.
 *  - NO SILENT OVERWRITE: writing over an existing slot throws unless the
 *    caller passes `overwrite: true` — the UI owns the confirm gesture.
 *  - CORRUPT IS DATA, NOT DEATH: a slot whose text fails the strict
 *    restore is listed with `corrupt: true` (honest disabled load button),
 *    never thrown out of the listing.
 */
import { restoreCampaignSave } from "./longSave";

/** The slice of DOM Storage this module needs; localStorage satisfies it
 *  structurally, a Map-backed test double satisfies it honestly. */
export interface SlotStorage {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const SAVE_KEY_PREFIX = "hh-long-save:v1:";

export class SaveSlotError extends Error {
  constructor(code: string, detail: string) {
    super(`save-slot[${code}]: ${detail}`);
    this.name = "SaveSlotError";
  }
}

/** Validate + canonicalize a player-supplied slot name. Early-exit on every
 *  refusal; the returned string is what the key embeds. */
export function normalizeSlotName(raw: string): string {
  const name = raw.trim();
  if (name.length === 0) {
    throw new SaveSlotError("bad-name", "slot name is empty after trim");
  }
  if (name.length > 40) {
    throw new SaveSlotError("bad-name", `slot name is ${name.length} chars, cap is 40`);
  }
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(name)) {
    throw new SaveSlotError("bad-name", "slot name contains control characters");
  }
  return name;
}

function slotKey(name: string): string {
  return SAVE_KEY_PREFIX + name;
}

/** Names of every campaign slot, code-unit sorted (deterministic listing). */
export function listSlotNames(storage: SlotStorage): string[] {
  const names: string[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key !== null && key.startsWith(SAVE_KEY_PREFIX)) {
      names.push(key.slice(SAVE_KEY_PREFIX.length));
    }
  }
  return names.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

export interface SlotSummary {
  readonly name: string;
  /** Marks parse OK and the marks are roster-sequential? (a foreign-but-
   *  well-formed save is corrupt FOR THIS PANEL's purposes). */
  readonly resumable: boolean;
  /** Arcs the slot has played, in order — EMPTY on a corrupt slot. */
  readonly playedArcIds: readonly string[];
  readonly chaptersPlayed: number;
  /** kind of the last stored ending snapshot, when the slot carries one. */
  readonly lastEndingKind: string | null;
  readonly corrupt: boolean;
}

/** Roster-sequential arc prefix from marks — shared with campaignModel, so
 *  it lives here as a pure helper over already-parsed marks. */
export function arcsFromMarks(
  marks: readonly { arcId: string }[],
  rosterArcIds: readonly string[],
): readonly string[] {
  const arcs: string[] = [];
  for (const mark of marks) {
    if (arcs.length > 0 && arcs[arcs.length - 1] === mark.arcId) continue;
    if (arcs.includes(mark.arcId)) {
      throw new Error(`campaign-play[not-sequential]: arc "${mark.arcId}" repeats after leaving it`);
    }
    arcs.push(mark.arcId);
  }
  for (let i = 0; i < arcs.length; i += 1) {
    if (arcs[i] !== rosterArcIds[i]) {
      throw new Error(`campaign-play[not-sequential]: slot plays "${arcs[i]}" at position ${i}, roster demands "${rosterArcIds[i] ?? "nothing"}"`);
    }
  }
  return arcs;
}

/** List every slot with honest per-slot status; corrupt slots are DATA. */
export function listSlots(storage: SlotStorage, rosterArcIds: readonly string[]): SlotSummary[] {
  return listSlotNames(storage).map((name) => {
    const text = storage.getItem(slotKey(name));
    if (text === null) {
      // raced between key-scan and read — honest corrupt, never a crash.
      return { name, resumable: false, playedArcIds: [], chaptersPlayed: 0, lastEndingKind: null, corrupt: true };
    }
    try {
      const { marks } = restoreCampaignSave(text);
      const playedArcIds = arcsFromMarks(marks, rosterArcIds);
      const last = marks[marks.length - 1];
      return {
        name,
        resumable: true,
        playedArcIds,
        chaptersPlayed: marks.length,
        lastEndingKind: last?.ending?.kind ?? null,
        corrupt: false,
      };
    } catch {
      return { name, resumable: false, playedArcIds: [], chaptersPlayed: 0, lastEndingKind: null, corrupt: true };
    }
  });
}

/** Raw canonical text of a slot, or null when absent. */
export function readCampaignSave(storage: SlotStorage, rawName: string): string | null {
  return storage.getItem(slotKey(normalizeSlotName(rawName)));
}

/** Write the canonical text. No silent overwrite: an existing slot refuses
 *  unless `overwrite` is explicitly true. */
export function writeCampaignSave(
  storage: SlotStorage,
  rawName: string,
  text: string,
  options: { readonly overwrite?: boolean } = {},
): string {
  const name = normalizeSlotName(rawName);
  const key = slotKey(name);
  if (storage.getItem(key) !== null && options.overwrite !== true) {
    throw new SaveSlotError("exists", `slot "${name}" already holds a save — pass overwrite to replace it`);
  }
  storage.setItem(key, text);
  return name;
}

/** The browser's own storage, guarded so SSR/worker imports never explode at
 *  module load; callers fall back to a Map-backed double in tests. */
export function browserStorage(): SlotStorage | null {
  const candidate = globalThis.localStorage as SlotStorage | undefined;
  if (candidate === undefined || typeof candidate.setItem !== "function") return null;
  return candidate;
}
