/**
 * G2 proto-side headless tests (pnpm -F proto test, node env).
 *
 *  A. DRIFT PINS — corpus.ts must equal the shipped packages/content JSON
 *     byte-for-byte on every field the panel renders.
 *  B. PURCHASE-TIME CONTRACT — deriveThreatInvitations is pure, exact, and
 *     mirrors the sim-core golden in packages/sim-core/src/__tests__/
 *     gate-g2.test.ts (same delta strings on both sides of the wall).
 *  C. SESSION FOLD — build → grow, retire → haunt → re-close, mastery →
 *     weather, with no RNG anywhere (two folds are deep-equal).
 */

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildInvitations, ledgerSnapshot } from "@hh/sim-core/waves";
import { G2_BUNDLES, THREAT_CATALOG } from "../corpus";
import { activeInvitersOf, deriveThreatInvitations, invitedThreatIds, spawnablePool } from "../deriveInvitations";
import { createG2Session } from "../g2Session";
import { GATE_MOUNTS } from "../index";

/* ═══════════════════════ corpus fixtures ═══════════════════════ */

const CONTENT_ROOT = join(process.cwd(), "..", "..", "packages", "content");

function readJson(rel: string): any {
  const abs = join(CONTENT_ROOT, rel);
  if (!existsSync(abs)) throw new Error(`gate-g2 proto: corpus missing at ${abs} — run via pnpm -F proto test`);
  return JSON.parse(readFileSync(abs, "utf8"));
}

const SHARED_WEB = readJson("types/shared-web.json");
const GAME_SERVERS = readJson("types/game-servers.json");
const REGISTRY = readJson("threats/registry-core.json");
const SHARED_SLICE = readJson("waves/g1-shared-web-first-quarter.json");
const GS_SLICE = readJson("waves/g1-game-servers-first-quarter.json");

/* ═══════════════════════ A. drift pins ═══════════════════════ */

describe("G2 corpus mirror — drift pins against shipped content JSON", () => {
  const bundles: readonly { readonly data: any; readonly slice: any; readonly bundleId: string }[] = [
    { data: SHARED_WEB, slice: SHARED_SLICE, bundleId: "official:shared-web" },
    { data: GAME_SERVERS, slice: GS_SLICE, bundleId: "official:game-servers" },
  ];

  for (const { data, slice, bundleId } of bundles) {
    it(`${bundleId}: component invites === threats.unlockedByBuildables`, () => {
      const authored: Record<string, readonly string[]> = data.threats.unlockedByBuildables;
      const bundle = (G2_BUNDLES as any)[bundleId];
      const mirrored: Record<string, readonly string[]> = {};
      for (const c of bundle.components) mirrored[c.id] = [...c.invites].sort();
      const expected: Record<string, readonly string[]> = {};
      for (const id of Object.keys(authored).sort()) expected[id] = [...(authored[id] ?? [])].sort();
      expect(mirrored).toEqual(expected);
    });

    it(`${bundleId}: universe === slice threat roster`, () => {
      const roster = new Set<string>();
      for (const w of slice.waves) for (const e of w.entries) roster.add(e.threat);
      expect([...(G2_BUNDLES as any)[bundleId].universe].sort()).toEqual([...roster].sort());
    });
  }

  it("threat catalog === registry-core (family, band, denomination; full coverage)", () => {
    const byId = new Map<string, { family: string; band: string; denomination: string }>(
      (REGISTRY.threats as { id: string; family: string; band: string; denomination: string }[]).map(
        (t) => [t.id, t],
      ),
    );
    expect(new Set(Object.keys(THREAT_CATALOG))).toEqual(new Set(byId.keys()));
    for (const [id, fact] of Object.entries(THREAT_CATALOG)) {
      const t = byId.get(id);
      if (t === undefined) throw new Error(`registry-core has no "${id}"`);
      expect([fact.family, fact.band, fact.denomination], id).toEqual([t.family, t.band, t.denomination]);
    }
  });
});

/* ═══════════════════════ B. purchase-time contract ═══════════════════════ */

const SW_INVITATIONS = buildInvitations(
  Object.fromEntries(G2_BUNDLES["official:shared-web"].components.map((c) => [c.id, c.invites])),
);
const GS_INVITATIONS = buildInvitations(
  Object.fromEntries(G2_BUNDLES["official:game-servers"].components.map((c) => [c.id, c.invites])),
);
const bare = ledgerSnapshot([], 0n);

describe("deriveThreatInvitations — the purchase-time answer", () => {
  it("GOLDEN cold-start deltas equal the sim-core gate-g2 goldens (same wall, same strings)", () => {
    expect(deriveThreatInvitations("public-whois-listing", bare, SW_INVITATIONS)).toEqual({
      componentTemplateId: "public-whois-listing",
      invites: ["scanner-drizzle"],
      alreadySpawnable: [],
      newlySpawnable: ["scanner-drizzle"],
      surfaceCost: 1,
    });
    expect(deriveThreatInvitations("homogeneous-cpanel-image", bare, SW_INVITATIONS)).toEqual({
      componentTemplateId: "homogeneous-cpanel-image",
      invites: ["vulnerable-plugin-compromise", "wp-login-brute-squad"],
      alreadySpawnable: [],
      newlySpawnable: ["vulnerable-plugin-compromise", "wp-login-brute-squad"],
      surfaceCost: 2,
    });
    expect(deriveThreatInvitations("unmetered-wordpress-default", bare, SW_INVITATIONS)).toEqual({
      componentTemplateId: "unmetered-wordpress-default",
      invites: ["hoarder-noisy-neighbor", "noisy-query-table-scan"],
      alreadySpawnable: [],
      newlySpawnable: ["hoarder-noisy-neighbor", "noisy-query-table-scan"],
      surfaceCost: 2,
    });
  });

  it("two inviters, one risk — the second purchase invites nothing NEW", () => {
    const afterListing = ledgerSnapshot(
      [{ atTick: 3n, buildableId: "public-server-browser-listing", op: "build" }],
      3n,
    );
    const preview = deriveThreatInvitations("default-udp-game-image", afterListing, GS_INVITATIONS);
    expect(preview.invites).toEqual(["open-resolver-reflection", "udp-amplification-barrage"]);
    expect(preview.alreadySpawnable).toEqual(["open-resolver-reflection"]);
    expect(preview.newlySpawnable).toEqual(["udp-amplification-barrage"]);
    expect(preview.surfaceCost).toBe(1);
  });

  it("is pure: snapshots and invitations survive the query untouched", () => {
    const snap = ledgerSnapshot([{ atTick: 1n, buildableId: "public-whois-listing", op: "build" }], 1n);
    const poolBefore = spawnablePool(snap, SW_INVITATIONS);
    deriveThreatInvitations("homogeneous-cpanel-image", snap, SW_INVITATIONS);
    expect(spawnablePool(snap, SW_INVITATIONS)).toEqual(poolBefore);
    expect([...snap.existingBuildables]).toEqual(["public-whois-listing"]);
  });

  it("fails loud on an empty template id; answers empty (not throw) for a harmless one", () => {
    expect(() => deriveThreatInvitations("", bare, SW_INVITATIONS)).toThrow(/non-empty/);
    expect(invitedThreatIds("status-page", SW_INVITATIONS)).toEqual([]);
  });

  it("activeInvitersOf names the builds to blame; ungated threats blame nobody", () => {
    const snap = ledgerSnapshot([{ atTick: 2n, buildableId: "homogeneous-cpanel-image", op: "build" }], 2n);
    expect(activeInvitersOf("vulnerable-plugin-compromise", snap, SW_INVITATIONS)).toEqual(["homogeneous-cpanel-image"]);
    expect(activeInvitersOf("slowloris-sipper", snap, SW_INVITATIONS)).toEqual([]);
  });
});

/* ═══════════════════════ C. session fold (UI view-model) ═══════════════════════ */

describe("g2Session — deterministic fold of the scripted quarter", () => {
  const cfg = { retirementLagTicks: 20n, masteryDemotionAfter: 5 };

  it("building grows the live deck by the EXACT previewed delta", () => {
    const s = createG2Session("official:shared-web", cfg);
    const t0 = s.view();
    expect(t0.spawnableCount).toBe(4); // the authored-ungated floor of the g1 slice
    s.build("homogeneous-cpanel-image");
    const t1 = s.view();
    const added = t1.pool.map((r) => r.threatId).filter((id) => !t0.pool.some((r) => r.threatId === id)).sort();
    expect(added).toEqual(["vulnerable-plugin-compromise", "wp-login-brute-squad"]);
    expect(t1.log).toEqual([
      { seq: 0, atTick: 0, op: "build", buildableId: "homogeneous-cpanel-image", label: "Homogeneous cPanel image" },
    ]);
  });

  it("retire → haunts with a memo countdown → re-closes after the lag", () => {
    const s = createG2Session("official:shared-web", cfg);
    s.build("homogeneous-cpanel-image"); // t0
    s.tickForward(10);
    s.retire("homogeneous-cpanel-image"); // t10, lag 20 → memo at t30
    const mid = s.view();
    expect(mid.pool.some((r) => r.threatId === "vulnerable-plugin-compromise")).toBe(true);
    expect(mid.haunting).toEqual([
      {
        buildableId: "homogeneous-cpanel-image",
        label: "Homogeneous cPanel image",
        removedAtTick: 10,
        memoArrivesAtTick: 30,
        ticksLeft: 20,
      },
    ]);
    s.tickForward(20); // now t30 ≥ memo
    const late = s.view();
    expect(late.haunting).toEqual([]);
    expect(late.pool.some((r) => r.threatId === "vulnerable-plugin-compromise")).toBe(false);
    expect(late.pool.some((r) => r.threatId === "ticket-avalanche-hydra")).toBe(true); // ungated floor stays
  });

  it("five counterances demote the storm band to weather — Mastered, existence kept", () => {
    const s = createG2Session("official:shared-web", cfg);
    s.build("homogeneous-cpanel-image");
    const row = () => s.view().pool.find((r) => r.threatId === "vulnerable-plugin-compromise")!;
    for (let i = 0; i < 4; i += 1) s.counter("vulnerable-plugin-compromise");
    expect(row().effectiveBand).toBe("storm");
    expect(row().mastered).toBe(false);
    s.counter("vulnerable-plugin-compromise");
    expect(row().effectiveBand).toBe("weather");
    expect(row().mastered).toBe(true);
    expect(row().counters).toBe(5);
  });

  it("the fold has no hidden state: same ops ⇒ byte-equal views; guards are loud", () => {
    const script = (s: ReturnType<typeof createG2Session>) => {
      s.build("public-whois-listing");
      s.tickForward(5);
      s.build("unmetered-wordpress-default");
      s.tickForward(3);
    };
    const a = createG2Session("official:shared-web", cfg);
    const b = createG2Session("official:shared-web", cfg);
    script(a);
    script(b);
    expect(JSON.stringify(a.view())).toBe(JSON.stringify(b.view()));
    expect(JSON.stringify(a.view())).toBe(JSON.stringify(a.view())); // re-fold stable
    expect(() => a.build("public-whois-listing")).toThrow(/already exists/);
    expect(() => b.retire("slowloris-sipper")).toThrow(/does not exist/);
  });

  it("game-servers bundle answers from its own corpus pair", () => {
    const s = createG2Session("official:game-servers", cfg);
    const before = s.view().spawnableCount;
    expect(s.view().previews["open-modding-api"]!.newlySpawnable).toEqual(["cheat-client-griefer", "mod-update-day"]);
    s.build("open-modding-api");
    expect(s.view().spawnableCount).toBe(before + 2);
    // post-purchase, the same query flips them to alreadySpawnable (surface paid)
    expect(s.view().previews["open-modding-api"]!.newlySpawnable).toEqual([]);
    expect(s.view().previews["open-modding-api"]!.alreadySpawnable).toEqual(["cheat-client-griefer", "mod-update-day"]);
  });
});

/* ═══════════════════════ manifest ═══════════════════════ */

describe("GATE_MOUNTS manifest (shell integrator door)", () => {
  it("ships exactly one frozen G2 stage mount with a component", () => {
    expect(GATE_MOUNTS).toHaveLength(1);
    const mount = GATE_MOUNTS[0]!;
    expect(mount.gateId).toBe("G2");
    expect(mount.mountId).toBe("gate-g2-panel");
    expect(mount.slot).toBe("stage");
    expect(mount.component).toBeTruthy();
    expect(mount.description.length).toBeGreaterThan(40);
  });
});
