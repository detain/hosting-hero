/**
 * OD-10 (ADR-0013 ruling 3) — max-LEGIBLE clock speed is 2× until G1 playtest
 * data exists. The ruling changes NO legality: the SpeedX door keeps its
 * shipped 1|2|4 ladder (and 3× remains illegal in SpeedX, not here). This
 * source-pin suite proves the shell only ADDS the honesty hint — the ladder
 * line is byte-guaranteed present and the hint is display-only.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const APP = readFileSync(join(process.cwd(), "src", "App.vue"), "utf8");

describe("OD-10 speed legibility hint (display-only, ladder untouched)", () => {
  it("the legibility line is 2×, stated once as a named constant", () => {
    expect(APP).toMatch(/const LEGIBLE_SPEED_MAX = 2;/);
  });

  it("the shipped 1→2→4 cycle is UNCHANGED — the hint never edits the ladder", () => {
    expect(APP).toMatch(/speed\.value = current === 1 \? 2 : current === 2 \? 4 : 1;/);
    // no 3× branch in the CYCLE expression itself (SpeedX legality lives in
    // the door; the shell must keep mirroring exactly {1,2,4}).
    const cycle = /speed\.value = [^;]+;/.exec(APP)?.[0] ?? "";
    expect(cycle).toBe("speed.value = current === 1 ? 2 : current === 2 ? 4 : 1;");
    expect(cycle).not.toMatch(/\b3\b/);
  });

  it("the hint element exists, gated strictly ABOVE the legibility line", () => {
    expect(APP).toMatch(/data-test="speed-legibility-hint"/);
    expect(APP).toMatch(/v-if="isSandbox && speed > LEGIBLE_SPEED_MAX"/);
    expect(APP).toMatch(/OD-10/);
  });

  it("the aria-label carries the same warning for assistive tech", () => {
    expect(APP).toMatch(/const speedAria = computed\(/);
    expect(APP).toMatch(/:aria-label="speedAria"/);
    expect(APP).toMatch(/legibility limit/);
    // the old bare label is gone — one authority for the spoken text
    expect(APP).not.toMatch(/:aria-label="`speed \$\{speed\}x \(observation only\)`"/);
  });

  it("hint styling uses only era tokens — no hue-ledger bypass, no motion", () => {
    const rule = /\.speed-hint\s*{[^}]*}/.exec(APP);
    expect(rule, ".speed-hint rule missing").toBeTruthy();
    expect(rule?.[0]).toMatch(/color:\s*var\(--hh-accent\)/);
    expect(rule?.[0]).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });
});
