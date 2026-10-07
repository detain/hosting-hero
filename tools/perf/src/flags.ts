/** CLI flag parsing shared by every perf-tools entry point.
 *  Mirrors tools/headless/src/cli.ts conventions: `--flag value` or
 *  `--flag=value`, bare `--flag` = presence, everything else positional. */

export class UsageError extends Error {}
export class PerfError extends Error {}

export interface Flags {
  readonly get: (name: string) => string | undefined;
  readonly has: (name: string) => boolean;
  readonly all: (name: string) => readonly string[];
}

export function parseFlags(args: readonly string[]): { readonly positional: string[]; readonly flags: Flags } {
  const positional: string[] = [];
  const map = new Map<string, string[]>();
  const set = new Set<string>();
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i] ?? "";
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq !== -1) {
        const name = arg.slice(2, eq);
        push(map, name, arg.slice(eq + 1));
        set.add(name);
      } else {
        const name = arg.slice(2);
        const next = args[i + 1];
        if (next !== undefined && !next.startsWith("--")) {
          push(map, name, next);
          set.add(name);
          i += 1;
        } else {
          set.add(name);
        }
      }
      continue;
    }
    positional.push(arg);
  }
  return {
    positional,
    flags: {
      get: (name) => map.get(name)?.[0],
      has: (name) => set.has(name),
      all: (name) => map.get(name) ?? [],
    },
  };
}

function push(map: Map<string, string[]>, name: string, value: string): void {
  const existing = map.get(name);
  if (existing === undefined) map.set(name, [value]);
  else existing.push(value);
}

export function parsePositiveInt(raw: string, label: string): number {
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new UsageError(`--${label} must be a positive integer, got "${raw}"`);
  }
  return value;
}

/** "2,10,50,200" → [2,10,50,200], each a positive integer. */
export function parsePositiveIntList(raw: string, label: string): number[] {
  const parts = raw.split(",").map((p) => p.trim()).filter((p) => p.length > 0);
  if (parts.length === 0) throw new UsageError(`--${label} needs at least one value, got "${raw}"`);
  return parts.map((part) => parsePositiveInt(part, label));
}

/** Narrow a raw string into a closed union, fail-loud with the vocabulary. */
export function parseEnum<T extends string>(raw: string | undefined, allowed: readonly T[], label: string): T {
  if (raw === undefined) throw new UsageError(`--${label} is required (one of: ${allowed.join(", ")})`);
  if ((allowed as readonly string[]).includes(raw)) return raw as T;
  throw new UsageError(`--${label} must be one of ${allowed.join(", ")}, got "${raw}"`);
}
