/**
 * i18n packStore — resolution proofs against the SHIPPED packs (node env).
 * The pack files are read-only inputs; these assertions quote their current
 * authored bodies, so a content rename lands here as a named red (the
 * corpusDrift test carries the structural half of that pin).
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_ERA_YEAR,
  PACK_IDS,
  hasKey,
  packOf,
  t,
  templateOf,
} from "../packStore.ts";

describe("i18n/packStore · loads the shipped packs through the loader boundary", () => {
  it("both packs parse at init, frozen, ids exact", () => {
    expect([...PACK_IDS]).toEqual(["shared-web", "game"]);
    for (const id of PACK_IDS) {
      const pack = packOf(id);
      expect(Object.isFrozen(pack)).toBe(true);
      expect(pack.decision.size + pack.flavour.size).toBeGreaterThan(0);
    }
    // 103 = 98 + the three economy-notice keys (contract-activated /
    // covenant-breached / chargeback-posted, docs-sync lane) + the two
    // canonical-death keys (death-imminent / company-dissolved, lane L4).
    expect(packOf("shared-web").decision.size + packOf("shared-web").flavour.size).toBe(103);
    expect(packOf("game").decision.size + packOf("game").flavour.size).toBe(75);
  });

  it("t() resolves a plain decision template with slot fill", () => {
    expect(t("shared-web", "refusal.unknown-node", { nodeId: "db-1" })).toBe(
      "No board object named db-1 exists at the current tick. Nothing was changed.",
    );
  });

  it("t() resolves flavour keys too (keys are globally unique per pack)", () => {
    expect(hasKey("shared-web", "ticket.subject.cron")).toBe(true);
    expect(t("shared-web", "ticket.subject.cron")).toBe("my cron didnt run"); // 2026 default
  });

  it("era-variant pick: exact > earlier > fallback (plain integer years)", () => {
    expect(templateOf("shared-web", "ticket.subject.cron").kind).toBe("era-variant");
    expect(t("shared-web", "ticket.subject.cron", {}, 1998)).toBe("my hit counter doesnt go up");
    expect(t("shared-web", "ticket.subject.cron", {}, 2026)).toBe("my cron didnt run");
    expect(t("shared-web", "ticket.subject.cron", {}, 2025)).toBe("my hit counter doesnt go up"); // earlier
    expect(t("shared-web", "ticket.subject.cron", {}, 1990)).toBe("my cron didnt run"); // fallback
    expect(DEFAULT_ERA_YEAR).toBe(2026);
  });

  it("numeric slots are accepted (safe ints)", () => {
    expect(t("shared-web", "terms.prepay-lock", { introPrice: "$3,600", termMonths: 12 })).toContain(
      "holds $3,600 for 12 months",
    );
  });

  it("game pack has NO era-variants (zero era objects authored)", () => {
    for (const key of packOf("game").decision.keys()) {
      expect(templateOf("game", key).kind).toBe("plain");
      break;
    }
    expect(templateOf("game", "refusal.unknown-node").kind).toBe("plain");
    // era year is inert on plain templates:
    expect(t("game", "refusal.unknown-node", { nodeId: "x" }, 1998)).toBe(
      t("game", "refusal.unknown-node", { nodeId: "x" }, 2026),
    );
  });
});

describe("i18n/packStore · fail-loud edges (thin wrapper, loader owns the error grammar)", () => {
  it("unknown key throws, naming pack and key", () => {
    expect(() => t("shared-web", "refusal.no-such-code")).toThrow(/refusal\.no-such-code/);
    expect(hasKey("shared-web", "refusal.no-such-code")).toBe(false);
  });

  it("missing slot throws (exact-set law)", () => {
    expect(() => t("shared-web", "refusal.edge-exists", { nodeId: "web-1" })).toThrow();
  });

  it("extra slot throws (exact-set law)", () => {
    expect(() => t("shared-web", "refusal.unknown-node", { nodeId: "db-1", bogus: "x" })).toThrow();
  });

  it("resolution is deterministic: same inputs, identical output", () => {
    const a = t("shared-web", "alert.churn-fuse", { customer: "MegaBlog Ltd (WHALE)" });
    const b = t("shared-web", "alert.churn-fuse", { customer: "MegaBlog Ltd (WHALE)" });
    expect(a).toBe(b);
    expect(a).toBe(
      "Cancellation in progress: MegaBlog Ltd (WHALE). The fuse tripped before renewal; the stated reason is in the ledger.",
    );
  });
});
