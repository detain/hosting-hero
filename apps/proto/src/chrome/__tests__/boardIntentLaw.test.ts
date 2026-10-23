// @vitest-environment node
/**
 * The onIntent law, PINNED at the source level (L-B close of §3.1).
 *
 * world.ts always NAMED the seam ("the only writes leaving this side of the
 * seam are discrete intents via onIntent"); no component implemented it —
 * the mouse could not mint a PlayerVerb. This file locks the landing:
 *  · WorldView carries the onIntent hook, wires the machine's sink through
 *    it, folds every new projection through ingest, and hands frames to the
 *    Pixi layer;
 *  · WorldStage.vue mounts the HUD, builds the machine, and binds
 *    onIntent → the host `submit` prop (the SimClient.sendPlayerVerb shape);
 *  · App.vue welds the sandbox mount to that prop — the mouse's verbs reach
 *    the door, closing the parent diff L-B @17ba785 owed (no SHA self-quote:
 *    the weld commit rides the record, the pin below is the authority);
 *  · the pure module's only chrome import is textLaw (ordering leaf) — the
 *    render→chrome direction stays a single deliberate hairline;
 *  · the HUD keeps the proven chrome disciplines: describeRefusal voicing,
 *    R32 PORT_GLYPHS reuse, role=alert bounce, reduced-motion arm, and
 *    STATIC --hh-hue- vars only (hueLaw cannot see through interpolation —
 *    an armed probe proves this scanner catches a planted dynamic var).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(...rel: string[]): string {
  return readFileSync(join(process.cwd(), ...rel), "utf8");
}

const WORLD = source("src", "render", "world.ts");
const PICK = source("src", "render", "boardPick.ts");
const INTENT = source("src", "render", "boardIntent.ts");
const STAGE = source("src", "chrome", "WorldStage.vue");
const HUD = source("src", "chrome", "BoardIntentHud.vue");

describe("the §3.1 onIntent seam is implemented, not just named", () => {
  it("WorldView owns the hook and is the machine's only exit", () => {
    expect(WORLD).toMatch(/onIntent:\s*\(\(args: MintArgs, clock: ClockKind\) => void\) \| null = null/);
    expect(WORLD).toContain("this.board.setSink((args, clock) => this.onIntent?.(args, clock))");
    expect(WORLD).toContain("this.board.ingest(current)");
    expect(WORLD).toContain("this.boardLayer?.frame(cameraFrame.transform)");
    expect(WORLD).toContain("new BoardIntentLayer(compositor, this.board)");
    expect(WORLD).toContain("this.boardLayer?.destroy()");
  });

  it("WorldStage binds the hook to the host submit prop and shares one machine", () => {
    expect(STAGE).toContain("createBoardIntentMachine()");
    expect(STAGE).toContain("view.onIntent = (args, clock) => props.submit?.(args, clock)");
    expect(STAGE).toContain("globalBudget, board");
    expect(STAGE).toContain('import BoardIntentHud from "./BoardIntentHud.vue"');
    expect(STAGE).toContain("<BoardIntentHud :machine=\"board\" />");
    expect(STAGE).toMatch(/submit\?: \(\(args: MintArgs, clock: ClockKind\) => void\) \| null/);
  });

  it("the shell welds the stage: App.vue binds :submit to the client's sendPlayerVerb", () => {
    const APP = source("src", "App.vue");
    // Exactly one WorldStage mount in the shell (the sandbox v-else branch;
    // the session branch mounts SessionPanel, not a second stage).
    expect(APP.match(/<WorldStage\b/g) ?? []).toHaveLength(1);
    // The mount carries the weld — minted verbs leave through the SAME
    // SimClient the gates ride. Falsifiable both ways: in a world without
    // the weld the bare `<WorldStage />` (dark desk) is what the shell
    // renders, and these two assertions fail in opposite directions.
    expect(APP).toContain('<WorldStage :submit="(args, clock) => clientRef?.sendPlayerVerb(args, clock)" />');
    expect(APP).not.toContain("<WorldStage />");
  });

  it("the pure module crosses into chrome exactly once, for the text law", () => {
    const chromeImports = INTENT.match(/from "\.\.\/chrome\/[^"]+"/g) ?? [];
    expect(chromeImports).toEqual(['from "../chrome/textLaw"']);
  });

  it("boardPick is pixi + law only: screenToWorld math, ledger hues, no DOM", () => {
    expect(PICK).toContain('import { screenToWorld');
    expect(PICK).toContain("hueHex(RELATION_HUES");
    expect(PICK).not.toMatch(/from "vue"|document\.|window\./);
    // hit-testing rides vector containers, never a pixel read
    expect(PICK).toContain("hitArea = new Rectangle");
    expect(PICK).toContain("hitArea = new Circle");
  });
});

describe("the HUD keeps the proven chrome disciplines", () => {
  it("refusals voice through describeRefusal with the bounce-chip contract", () => {
    expect(HUD).toContain('import { describeRefusal } from "../i18n/refusalCopy"');
    expect(HUD).toContain('role="alert"');
    expect(HUD).toContain("data-test=\"board-refuse-flash\"");
    expect(HUD).toContain("data-refusal-source");
  });

  it("wiring mode is W + a button, and the port rail is where Tab lives", () => {
    expect(HUD).toContain('"w"');
    expect(HUD).toContain("board-wiring-toggle");
    expect(HUD).toMatch(/@keydown\.enter\.prevent="onPortActivate/);
    expect(HUD).toMatch(/@keydown\.enter\.prevent="confirmTerms"/);
    expect(HUD).toMatch(/@keydown\.escape\.prevent="cancelTerms"/);
  });

  it("R32 glyphs are reused, not re-invented", () => {
    expect(HUD).toContain('import { PORT_GLYPHS } from "../gates/g4/portShapes"');
    expect(HUD).toContain("port.glyph.path");
    expect(HUD).toContain("port.glyph.ariaLabel");
  });

  it("motion carries its reduced-motion arm in the same file", () => {
    expect(HUD).toContain("@media (prefers-reduced-motion: reduce)");
    const armed = new Set<string>();
    for (const m of HUD.matchAll(/\n\.([a-z0-9-]+)[^{]*\{[^}]*animation:/gi)) {
      armed.add(m[1] as string);
    }
    expect(armed.size).toBeGreaterThan(0);
    const armBlock = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/.exec(HUD);
    expect(armBlock, "reduced-motion block present").not.toBeNull();
    for (const cls of armed) {
      expect(armBlock?.[1] ?? "", `${cls} must be armed`).toContain(`.${cls}`);
    }
    // armed probe (synthetic): the scanner's claim is falsifiable
    const planted = "\n.x { animation: t 1s; }\n@media (prefers-reduced-motion: reduce) {\n  .y { transition: none; }\n}\n";
    expect([...planted.matchAll(/\n\.([a-z0-9-]+)[^{]*\{[^}]*animation:/gi)].length).toBe(1);
    const arm = /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/.exec(planted);
    expect(arm !== null && (arm[1] ?? "").includes(".x"), "planted motion without an arm must be caught").toBe(false);
  });

  it("every --hh-hue- var the HUD renders is spelled statically (hueLaw visibility)", () => {
    const dynamic = HUD.match(/--hh-hue-\$\{/g) ?? [];
    expect(dynamic, "interpolated hue vars are invisible to the law scan").toEqual([]);
    const names = [...HUD.matchAll(/--hh-hue-([A-Za-z0-9-]+)/g)].map((m) => m[1] as string);
    expect(new Set(names).size).toBeGreaterThan(0);
    // armed probe: the extraction regex catches a planted interpolation
    expect(/--hh-hue-\$\{/.test("color: var(--hh-hue-${x})")).toBe(true);
  });
});
