/**
 * portShapes · R32 typed sockets — shape, hue AND dash per relation;
 * the pluggability law consults the REAL topology socket grammar.
 */
import { describe, expect, it } from "vitest";
import { PORT_GLYPHS, isValidTarget, portsPluggable, type PortSpec } from "../portShapes.ts";

const port = (
  portId: string,
  nodeId: string,
  relation: PortSpec["relation"],
  needs: readonly string[],
  provides: readonly string[],
  slot: string | null = null,
): PortSpec => Object.freeze({ portId, nodeId, relation, label: portId, needs, provides, slot });

const webEth0 = port("web-1:data:eth0", "web-1", "data", ["http-out"], ["http-in"]);
const webDb = port("web-1:data:db-out", "web-1", "data", ["sql-out"], []);
const webPsu1 = port("web-1:power:psu1", "web-1", "power", [], [], "psu1");
const webConsole = port("web-1:control:console", "web-1", "control", ["ssh-out"], ["ssh-in"]);
const panelIn = port("sw-1:data:panel-in", "sw-1", "data", [], ["http-in"]);
const panelPsu1 = port("sw-1:power:psu1", "sw-1", "power", [], [], "psu1");
const web2Console = port("web-2:control:console", "web-2", "control", ["ssh-out"], ["ssh-in"]);

describe("R32 · four relations, four redundant channels", () => {
  const relations: PortSpec["relation"][] = ["data", "power", "control", "trust"];

  it("every relation has a distinct glyph, hue variable, dash, aria label", () => {
    const glyphs = relations.map((r) => PORT_GLYPHS[r].glyph);
    const hues = relations.map((r) => PORT_GLYPHS[r].hueVar);
    const dashes = relations.map((r) => PORT_GLYPHS[r].dash);
    const labels = relations.map((r) => PORT_GLYPHS[r].ariaLabel);
    expect(new Set(glyphs).size).toBe(4);
    expect(new Set(hues).size).toBe(4);
    expect(new Set(dashes).size).toBe(4); // color NEVER the only channel
    expect(new Set(labels).size).toBe(4);
    expect(glyphs).toStrictEqual(["trapezoid", "kettle", "circle", "slot"]);
  });
});

describe("portsPluggable · the pre-drop law", () => {
  it("grammar fit: http-out meets http-in", () => {
    expect(portsPluggable(webEth0, panelIn)).toStrictEqual({ ok: true });
  });

  it("grammar mismatch names both sides in topology's words", () => {
    const verdict = portsPluggable(webDb, panelIn);
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) expect(verdict.reason).toBe("wrong socket type — needs sql-in but target speaks http-in");
  });

  it("shape mismatch is refused by glyph vocabulary, not by feel", () => {
    const verdict = portsPluggable(webEth0, panelPsu1);
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) expect(verdict.reason).toContain("trapezoid");
    if (!verdict.ok) expect(verdict.reason).toContain("kettle");
  });

  it("a device cannot cable itself", () => {
    expect(portsPluggable(webEth0, panelInFrom(webEth0)).ok).toBe(false);
  });

  it("power ports seat on power regardless of grammar (slot law lives in the door)", () => {
    expect(portsPluggable(webPsu1, panelPsu1)).toStrictEqual({ ok: true });
  });

  it("control consoles fit consoles (ssh-out → ssh-in)", () => {
    expect(portsPluggable(webConsole, web2Console)).toStrictEqual({ ok: true });
  });

  it("isValidTarget mirrors portsPluggable's ok bit for wiring-mode glow", () => {
    expect(isValidTarget(webEth0, panelIn)).toBe(true);
    expect(isValidTarget(webDb, panelIn)).toBe(false);
    expect(isValidTarget(webEth0, webEth0)).toBe(false);
  });
});

function panelInFrom(self: PortSpec): PortSpec {
  return { ...self, portId: `${self.nodeId}:data:second-jack` };
}
