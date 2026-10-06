/**
 * G2 corpus mirror — the REAL component templates and threat metadata
 * transcribed verbatim from packages/content (read-only consumer law).
 * The drift pin in __tests__/deriveInvitations.test.ts re-reads the shipped
 * JSON and fails loudly if this file and the corpus ever disagree.
 *
 * Source of truth:
 *   packages/content/types/{shared-web,game-servers}.json → threats.unlockedByBuildables
 *   packages/content/threats/registry-core.json           → family / band / denomination
 *   packages/content/waves/g1-*-first-quarter.json        → per-slice threat rosters
 */
import type { DamageDenomination, TelegraphBand, ThreatRole } from "@hh/sim-core/waves";
import type { ThreatFamily } from "@hh/sim-core/types";

export interface ComponentTemplate {
  readonly id: string;
  readonly label: string;
  /** The capability half of the same purchase (§2.24: "capability and risk
   *  are the same purchase") — what building it lets you SELL. */
  readonly capability: string;
  /** Threat ids this template invites — verbatim from the type bundle. */
  readonly invites: readonly string[];
}

export interface ThreatFact {
  readonly label: string;
  readonly family: ThreatFamily;
  readonly band: TelegraphBand;
  readonly role: ThreatRole;
  readonly denomination: DamageDenomination;
}

export interface G2Bundle {
  readonly id: string;
  readonly label: string;
  readonly components: readonly ComponentTemplate[];
  /** Every threat id the quarter's wave slice actually authors (the pool
   *  universe shown to the player — gated and ungated alike). */
  readonly universe: readonly string[];
}

/** All sixteen registry-core threats (the two prototype-anchor types). */
export const THREAT_CATALOG = {
  "scanner-drizzle": {
    label: "Scanner drizzle",
    family: "malicious",
    band: "weather",
    role: "stealth",
    denomination: "data-integrity",
  },
  "wp-login-brute-squad": {
    label: "wp-login brute squad",
    family: "malicious",
    band: "weather",
    role: "swarm",
    denomination: "concurrency",
  },
  "xmlrpc-pingback-amplifier": {
    label: "XML-RPC pingback amplifier",
    family: "malicious",
    band: "storm",
    role: "parasite",
    denomination: "reputation",
  },
  "slowloris-sipper": {
    label: "Slowloris sipper",
    family: "malicious",
    band: "storm",
    role: "sapper",
    denomination: "concurrency",
  },
  "layer7-mimic": {
    label: "Layer-7 mimic",
    family: "malicious",
    band: "hunter",
    role: "mimic",
    denomination: "concurrency",
  },
  "vulnerable-plugin-compromise": {
    label: "Vulnerable-plugin compromise",
    family: "malicious",
    band: "storm",
    role: "bypass",
    denomination: "data-integrity",
  },
  "noisy-query-table-scan": {
    label: "Noisy-query table scan",
    family: "human",
    band: "entropy",
    role: "debuffer",
    denomination: "concurrency",
  },
  "ticket-avalanche-hydra": {
    label: "Ticket-avalanche hydra",
    family: "human",
    band: "storm",
    role: "swarm",
    denomination: "hands",
  },
  "hoarder-noisy-neighbor": {
    label: "Hoarder noisy neighbour",
    family: "human",
    band: "entropy",
    role: "parasite",
    denomination: "concurrency",
  },
  "grudge-booter": {
    label: "Grudge booter",
    family: "malicious",
    band: "storm",
    role: "tank",
    denomination: "bandwidth",
  },
  "udp-amplification-barrage": {
    label: "UDP amplification barrage",
    family: "malicious",
    band: "storm",
    role: "siege",
    denomination: "bandwidth",
  },
  "open-resolver-reflection": {
    label: "Open-resolver reflection",
    family: "malicious",
    band: "storm",
    role: "bypass",
    denomination: "reputation",
  },
  "cheat-client-griefer": {
    label: "Cheat-client griefer",
    family: "human",
    band: "hunter",
    role: "mimic",
    denomination: "reputation",
  },
  "mod-update-day": {
    label: "Mod update day",
    family: "systemic",
    band: "storm",
    role: "splitter",
    denomination: "data-integrity",
  },
  "empty-server-spiral": {
    label: "Empty-server spiral",
    family: "systemic",
    band: "entropy",
    role: "debuffer",
    denomination: "reputation",
  },
  "chargeback-swarm": {
    label: "Chargeback swarm",
    family: "human",
    band: "weather",
    role: "swarm",
    denomination: "cash",
  },
} as const satisfies Record<string, ThreatFact>;

export type ThreatId = keyof typeof THREAT_CATALOG;

export const G2_BUNDLES = {
  "official:shared-web": {
    id: "official:shared-web",
    label: "Shared Web",
    components: [
      {
        id: "public-whois-listing",
        label: "Public WHOIS listing",
        capability: "Sell domains with a visible ownership record.",
        invites: ["scanner-drizzle"],
      },
      {
        id: "homogeneous-cpanel-image",
        label: "Homogeneous cPanel image",
        capability: "Sell one-click managed hosting to everyone, identical.",
        invites: ["vulnerable-plugin-compromise", "wp-login-brute-squad"],
      },
      {
        id: "unmetered-wordpress-default",
        label: "Unmetered WordPress default",
        capability: 'Sell "unlimited" WordPress plans at thin margin.',
        invites: ["hoarder-noisy-neighbor", "noisy-query-table-scan"],
      },
    ],
    universe: [
      "hoarder-noisy-neighbor",
      "layer7-mimic",
      "noisy-query-table-scan",
      "scanner-drizzle",
      "slowloris-sipper",
      "ticket-avalanche-hydra",
      "vulnerable-plugin-compromise",
      "wp-login-brute-squad",
      "xmlrpc-pingback-amplifier",
    ],
  },
  "official:game-servers": {
    id: "official:game-servers",
    label: "Game Servers",
    components: [
      {
        id: "public-server-browser-listing",
        label: "Public server browser listing",
        capability: "Let the world discover and join your fleet.",
        invites: ["open-resolver-reflection", "scanner-drizzle"],
      },
      {
        id: "default-udp-game-image",
        label: "Default UDP game image",
        capability: "Ship zero-config low-latency UDP servers.",
        invites: ["open-resolver-reflection", "udp-amplification-barrage"],
      },
      {
        id: "open-modding-api",
        label: "Open modding API",
        capability: "Sell a third-party mod ecosystem on day one.",
        invites: ["cheat-client-griefer", "mod-update-day"],
      },
    ],
    universe: [
      "chargeback-swarm",
      "cheat-client-griefer",
      "empty-server-spiral",
      "grudge-booter",
      "mod-update-day",
      "open-resolver-reflection",
      "ticket-avalanche-hydra",
      "udp-amplification-barrage",
    ],
  },
} as const satisfies Record<string, G2Bundle>;

export type G2BundleId = keyof typeof G2_BUNDLES;

export const BAND_LABEL: Readonly<Record<TelegraphBand, string>> = {
  weather: "weather",
  storm: "storm",
  hunter: "hunter",
  entropy: "entropy",
};
