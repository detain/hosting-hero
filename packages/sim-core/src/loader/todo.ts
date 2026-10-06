/**
 * `_todo` placeholder collector (schema-header PLACEHOLDER CONVENTION:
 * "where hosting_game.md states no number, a numeric field is null and the
 * nearest enclosing object carries '_todo': '<§-cite>' so the loader lint can
 * flag it").
 *
 * Warn, never throw (owner directive for this slice): loading proceeds with
 * nulls intact — the engine treats null as "unauthored", the CI report treats
 * it as debt. Each entry carries the dotted field path, the nearest enclosing
 * `_todo` cite (§-reference), and a criticality class so the backlog sorts
 * itself: physics numbers the sim still needs beat cosmetic picks.
 */

export type TodoCriticality =
  /** Sim physics/tuning number unauthored — engine cannot run this path yet. */
  | "critical"
  /** Skin/altitude/visual pick unauthored. */
  | "cosmetic"
  /** Prose keys, registry refs, era dates — content-CI backlog, not engine. */
  | "standard"
  /** Declared exemption (content README): null means "subsystem off", not TODO. */
  | "exempt";

export interface TodoEntry {
  /** Dotted path of the null field, e.g. "skin.densityMultiplier". */
  readonly field: string;
  /** Nearest enclosing "_todo" cite; null when the author left none. */
  readonly cite: string | null;
  readonly criticality: TodoCriticality;
}

export interface TodoReport {
  /** Free-form label for the scanned document (file name, bundle id…). */
  readonly source: string;
  readonly entries: readonly TodoEntry[];
  readonly counts: Readonly<Record<TodoCriticality, number>>;
}

/** Physics numerics the pipeline cannot substitute at runtime (R-32/R-60/
 *  R24/R25 — these nulls block tuning, hence "critical"). */
const CRITICAL_FIELDS: ReadonlySet<string> = new Set([
  "patience",
  "value",
  "weight",
  "loyalty",
  "fragility",
  "budgetMs",
  "bounceSigmoid",
  "coefficient",
  "threshold",
  "malicious",
  "human",
  "entropic",
  "systemic",
  "customerAsThreat",
  "ticketsPerCustomer",
  "densityMultiplier",
  "minWarningMinutes",
  "hardware",
  "software",
  "network",
  "data",
  "pctOfRevenue",
  "launchMultiplier",
  "launchWeeks",
  "evaporationPct",
]);

function classify(path: string, key: string, parent: Record<string, unknown>): TodoCriticality {
  if (path.endsWith("visitor.party.size") && parent.allOrNothing === false) return "exempt";
  if (path.endsWith("visitor.herding.coefficient") && parent.enabled === false) return "exempt";
  if (path.startsWith("skin.")) return "cosmetic";
  if (CRITICAL_FIELDS.has(key)) return "critical";
  return "standard";
}

function walk(
  node: unknown,
  path: string,
  citeStack: readonly string[],
  entries: TodoEntry[],
): void {
  if (Array.isArray(node)) {
    node.forEach((element, index) => walk(element, `${path}[${index}]`, citeStack, entries));
    return;
  }
  if (node === null || typeof node !== "object") return;

  const record = node as Record<string, unknown>;
  const ownCite = typeof record["_todo"] === "string" ? (record["_todo"] as string) : null;
  const stack = ownCite === null ? citeStack : [...citeStack, ownCite];

  for (const [key, value] of Object.entries(record)) {
    if (key === "_todo") continue;
    const childPath = path.length === 0 ? key : `${path}.${key}`;
    if (value === null) {
      entries.push({
        field: childPath,
        cite: ownCite ?? (stack.length > 0 ? stack[stack.length - 1]! : null),
        criticality: classify(childPath, key, record),
      });
      continue;
    }
    walk(value, childPath, stack, entries);
  }
}

/**
 * Gather every null placeholder + its nearest `_todo` cite into a load report.
 * Never throws on well-formed JSON objects; anything non-object yields an
 * empty report (the strict loader owns shape failures).
 */
export function collectTodos(raw: unknown, source: string): TodoReport {
  const entries: TodoEntry[] = [];
  walk(raw, "", [], entries);
  const counts: Record<TodoCriticality, number> = {
    critical: 0,
    cosmetic: 0,
    standard: 0,
    exempt: 0,
  };
  for (const entry of entries) counts[entry.criticality] += 1;
  return { source, entries, counts };
}
