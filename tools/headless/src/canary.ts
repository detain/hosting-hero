/**
 * Forbidden-API canary — enforces docs/CONVENTIONS.md §4 on sim-core sources.
 *
 * WHY: MASTER_REPORT §3.4 / docs/ARCHITECTURE.md §6 make runtime neutrality a
 * law: `Math.random`, `Date.now`, `Intl`, `performance.now` and float literals
 * in logic paths are the exact mechanisms by which the browser-JS engine and
 * the Node port would silently diverge (RISK-1). This scanner fails the build
 * with a violation list.
 *
 * Method (deliberately dumb, deliberately loud):
 *  1. Walk `.ts` sources, skipping `__tests__` dirs and `.d.ts`.
 *  2. MASK comments and string/template literals (same length, whitespace)
 *     so line/column stay true and quoted prose never matches.
 *  3. Match the forbidden rules against masked code → FAILURES.
 *  4. Match Node-only APIs against comment-stripped source (import specifiers
 *     are strings!) → ADVISORIES (report-only per mandate: sim-core fixes are
 *     not this package's lane).
 *
 * Known limitation (documented): regex literals are not parsed — a forbidden
 * name inside a regex literal could slip through; none exist in today's tree
 * and the planted-violation test locks the detection behavior.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

export type CanaryRuleName =
  | "forbidden:Math.random"
  | "forbidden:Date.now"
  | "forbidden:new Date"
  | "forbidden:Intl"
  | "forbidden:performance.now"
  | "forbidden:float-literal";

export type AdvisoryRuleName =
  | "node-only:process"
  | "node-only:require"
  | "node-only:node-import"
  | "node-only:__dirname/__filename"
  | "node-only:Buffer";

export interface CanaryFinding {
  readonly file: string; // relative to scan root
  readonly line: number; // 1-based
  readonly column: number; // 1-based
  readonly rule: CanaryRuleName | AdvisoryRuleName;
  readonly snippet: string;
}

export interface CanaryReport {
  readonly root: string;
  readonly filesScanned: number;
  readonly violations: readonly CanaryFinding[];
  readonly advisories: readonly CanaryFinding[];
}

interface Rule {
  readonly name: CanaryRuleName | AdvisoryRuleName;
  readonly pattern: RegExp;
  readonly kind: "violation" | "advisory";
}

const RULES: readonly Rule[] = [
  { name: "forbidden:Math.random", pattern: /\bMath\s*\.\s*random\b/g, kind: "violation" },
  { name: "forbidden:Date.now", pattern: /\bDate\s*\.\s*now\b/g, kind: "violation" },
  { name: "forbidden:new Date", pattern: /\bnew\s+Date\b/g, kind: "violation" },
  { name: "forbidden:Intl", pattern: /\bIntl\b/g, kind: "violation" },
  { name: "forbidden:performance.now", pattern: /\bperformance\s*\.\s*now\b/g, kind: "violation" },
  // Float literals: d.d, .d, or 1e5 / 1E-3 (no trailing `n`; bigint never has
  // a dot; member access `a.b` never starts with a digit).
  {
    name: "forbidden:float-literal",
    pattern: /(?<![\w$.])\d[\d_]*\.[\d_]+(?:[eE][-+]?\d+)?\b|(?<![\w$.])\.\d[\d_]*(?:[eE][-+]?\d+)?\b|(?<![\w$.])\d[\d_]*[eE][-+]?\d+\b/g,
    kind: "violation",
  },
  // Advisory set — Node-only APIs (reported, not failed, per mandate).
  { name: "node-only:process", pattern: /\bprocess\s*\./g, kind: "advisory" },
  { name: "node-only:require", pattern: /\brequire\s*\(/g, kind: "advisory" },
  { name: "node-only:node-import", pattern: /(?:\bfrom\s*|\bimport\s*\(\s*)["']node:/g, kind: "advisory" },
  { name: "node-only:__dirname/__filename", pattern: /\b__(?:dirname|filename)\b/g, kind: "advisory" },
  { name: "node-only:Buffer", pattern: /\bBuffer\s*\.\s*(?:from|alloc|concat|isBuffer)\b/g, kind: "advisory" },
];

/* ─────────────────────────── masking ─────────────────────────── */

/**
 * Replace comment + string/template-literal bodies with spaces (newlines
 * preserved) so offsets, lines and columns survive. Exported for tests.
 */
export function maskCode(source: string, opts: { readonly maskStrings: boolean }): string {
  const out: string[] = [];
  let i = 0;
  const n = source.length;
  const blank = (chunk: string): string => chunk.replace(/[^\n]/g, " ");

  while (i < n) {
    const c = source[i] ?? "";
    const next = source[i + 1] ?? "";

    if (c === "/" && next === "/") {
      const end = indexOfOrEnd(source, "\n", i);
      out.push(blank(source.slice(i, end)));
      i = end;
      continue;
    }
    if (c === "/" && next === "*") {
      const end = indexOfOrEnd(source, "*/", i + 2);
      const stop = Math.min(end + 2, n);
      out.push(blank(source.slice(i, stop)));
      i = stop;
      continue;
    }

    if (opts.maskStrings && (c === '"' || c === "'" || c === "`")) {
      const quote = c;
      let j = i + 1;
      while (j < n) {
        const d = source[j] ?? "";
        if (d === "\\") {
          j += 2;
          continue;
        }
        if (d === quote) {
          j += 1;
          break;
        }
        j += 1;
      }
      out.push(blank(source.slice(i, j)));
      i = j;
      continue;
    }

    out.push(c);
    i += 1;
  }
  return out.join("");
}

function indexOfOrEnd(source: string, needle: string, from: number): number {
  const at = source.indexOf(needle, from);
  return at === -1 ? source.length : at;
}

/* ─────────────────────────── scanning ─────────────────────────── */

export function scanSource(source: string, relFile: string): { violations: CanaryFinding[]; advisories: CanaryFinding[] } {
  const maskedForViolations = maskCode(source, { maskStrings: true });
  const maskedForAdvisories = maskCode(source, { maskStrings: false });
  const lines = source.split("\n");
  const violations: CanaryFinding[] = [];
  const advisories: CanaryFinding[] = [];

  const collect = (rule: Rule, text: string, sink: CanaryFinding[]): void => {
    const sourceLines = text.split("\n");
    for (const [index, lineText] of sourceLines.entries()) {
      rule.pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = rule.pattern.exec(lineText)) !== null) {
        const original = lines[index] ?? "";
        sink.push({
          file: relFile,
          line: index + 1,
          column: match.index + 1,
          rule: rule.name,
          snippet: original.trim().slice(0, 120),
        });
      }
    }
  };

  for (const rule of RULES) {
    collect(rule, rule.kind === "violation" ? maskedForViolations : maskedForAdvisories, rule.kind === "violation" ? violations : advisories);
  }
  return { violations, advisories };
}

function isSkippedFile(name: string): boolean {
  return name.endsWith(".d.ts");
}

function walkTs(dir: string, root: string, acc: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      walkTs(full, root, acc);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".ts") || isSkippedFile(entry.name)) continue;
    acc.push(full);
  }
}

export function scanDirectory(root: string): CanaryReport {
  if (!statSync(root).isDirectory()) throw new Error(`canary: ${root} is not a directory`);
  const files: string[] = [];
  walkTs(root, root, files);
  files.sort();

  const violations: CanaryFinding[] = [];
  const advisories: CanaryFinding[] = [];
  for (const file of files) {
    const rel = relative(root, file).split(sep).join("/");
    const found = scanSource(readFileSync(file, "utf8"), rel);
    violations.push(...found.violations);
    advisories.push(...found.advisories);
  }
  return { root, filesScanned: files.length, violations, advisories };
}

/** Default scan target: sim-core sources (repo-relative from this package). */
export function simCoreSrcDir(): string {
  return new URL("../../../packages/sim-core/src", import.meta.url).pathname;
}

export function formatReport(report: CanaryReport): string {
  const head = `canary: ${report.filesScanned} files scanned under ${report.root}`;
  if (report.violations.length === 0 && report.advisories.length === 0) {
    return `${head}\ncanary: PASS — no forbidden APIs, no Node-only advisories`;
  }
  const lines = [head];
  for (const v of report.violations) lines.push(`VIOLATION ${v.file}:${String(v.line)}:${String(v.column)} [${v.rule}] ${v.snippet}`);
  for (const a of report.advisories) lines.push(`advisory ${a.file}:${String(a.line)}:${String(a.column)} [${a.rule}] ${a.snippet}`);
  lines.push(`canary: ${report.violations.length === 0 ? "PASS" : "FAIL"} — ${String(report.violations.length)} violation(s), ${String(report.advisories.length)} advisory(ies)`);
  return lines.join("\n");
}
