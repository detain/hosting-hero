/** Shared fixtures for the observed-layer test suite (not a test file). */

import type { EntityId, Fixed, ObservedKey, SimTimeUs } from "../../types";
import { asCauseId, asEntityId, observedKey, ResolutionBand } from "../../types";
import { FIXED_ONE, fromInt } from "../../kernel/fixed";
import { MICROS_PER_SEC } from "../../kernel/time";
import {
  CLASS_GRAPHS_30S,
  CLASS_GRAPHS_5MIN,
  CLASS_HEALTHCHECK,
  CLASS_PACKET_TAP,
  CLASS_TRACING,
  type InstrumentBinding,
  type InstrumentClass,
} from "../instrument";
import type { GroundPatch, InstrumentPatch, ObservedRecord } from "../store";

export const ENTITIES: readonly EntityId[] = ["web-1", "web-2", "db-1", "cache-1", "edge-1"].map(asEntityId);

export const PROPERTIES: readonly string[] = ["cpu", "latency", "health", "up"];

export function key(entity: EntityId | string, property: string): ObservedKey {
  return observedKey(typeof entity === "string" ? asEntityId(entity) : entity, property);
}

export function sec(n: number | bigint): SimTimeUs {
  return BigInt(n) * MICROS_PER_SEC;
}

export function fixed(x: number): Fixed {
  return fromInt(x);
}

export const CLASSES: readonly InstrumentClass[] = [
  CLASS_GRAPHS_5MIN,
  CLASS_GRAPHS_30S,
  CLASS_TRACING,
  CLASS_PACKET_TAP,
  CLASS_HEALTHCHECK,
];

/** Honest full-coverage binding (source === target). */
export function honestBinding(target: ObservedKey, cls: InstrumentClass, coverage: Fixed = FIXED_ONE): InstrumentBinding {
  return { instrumentId: `${cls.id}:${target}`, target, source: target, cls, coverage, misBound: false };
}

/** Mis-bound probe: faithfully reports `source`, labelled as `target`. */
export function misBoundBinding(target: ObservedKey, source: ObservedKey, cls: InstrumentClass): InstrumentBinding {
  return { instrumentId: `wrong:${target}`, target, source, cls, coverage: FIXED_ONE, misBound: true };
}

export function ground(keyValue: ObservedKey, value: unknown, changedAtUs: SimTimeUs): GroundPatch {
  return { kind: "ground", key: keyValue, value, changedAtUs };
}

export function groundInChannel(
  keyValue: ObservedKey,
  value: unknown,
  changedAtUs: SimTimeUs,
  channel: "site-preview" | "pulse-strip",
): GroundPatch {
  return { kind: "ground", key: keyValue, value, changedAtUs, fairnessChannel: channel };
}

export function instrument(binding: InstrumentBinding): InstrumentPatch {
  return { kind: "instrument", binding };
}

export const CAUSE = asCauseId("test/step12");

export { ResolutionBand };
