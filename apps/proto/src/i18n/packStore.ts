/**
 * i18n · pack store — the proto UI's copy layer over the shipped grammar packs.
 *
 * §9.11's "adding a type is a data task" proved end-to-end in the browser:
 * the SAME packs packages/content/script/validate.mjs keeps — ALL TWELVE on
 * disk (844 templates: shared-web 103, trunk-group-voip 69, exchange-colo
 * 68, serverless 68, colo 68, object-storage 67, backup-archival 66, dbaas 66, dedicated 66, dns-hosting
 * 65, game 75, mail-hosting 63; widened by ADR-0014 #D5) — are parsed at module init
 * through the loader's boundary
 * (`loadI18nPack` — already tested in sim-core; this file is a thin, loud
 * wrapper, Law 2: the wire JSON becomes a trusted frozen LoadedI18nPack
 * exactly once) and read by UI copy paths through `t()`.
 *
 * Source law: the packs live under packages/content/ and are READ-ONLY here —
 * the content lane owns authoring, the validator owns quality gates, this
 * store only resolves. A rename upstream surfaces as a MISSING_FIELD throw
 * at the consumer (or red in src/i18n/__tests__/corpusDrift.test.ts, which
 * pins every wire code the UI maps to a pack key).
 *
 * Determinism: no Date, no Intl, no localeCompare anywhere — era selection is
 * a plain integer year, sorting (when consumers need it) rides chrome's
 * textLaw.compareCodeUnits. The loader already pins pack-internal order.
 *
 * Era seam: the shell's toggle lives in `eraState.ts` (lifted from App.vue's
 * former local ref — same module-singleton pattern as chrome's observedStore).
 * `t()` defaults its `eraYear` to `getEra()`, so a caller inside a computed/
 * render effect tracks the ref and era-variant copy re-derives on a flip; an
 * explicit year still wins. DEFAULT_ERA_YEAR is the ref's INITIAL value and
 * stays re-exported here for importers that pin the constant by name.
 */
import sharedWebWire from "../../../../packages/content/packs/shared-web.i18n.json?raw";
import gameWire from "../../../../packages/content/packs/game.i18n.json?raw";
import backupArchivalWire from "../../../../packages/content/packs/backup-archival.i18n.json?raw";
import coloWire from "../../../../packages/content/packs/colo.i18n.json?raw";
import dbaasWire from "../../../../packages/content/packs/dbaas.i18n.json?raw";
import dedicatedWire from "../../../../packages/content/packs/dedicated.i18n.json?raw";
import dnsHostingWire from "../../../../packages/content/packs/dns-hosting.i18n.json?raw";
import exchangeColoWire from "../../../../packages/content/packs/exchange-colo.i18n.json?raw";
import mailHostingWire from "../../../../packages/content/packs/mail-hosting.i18n.json?raw";
import objectStorageWire from "../../../../packages/content/packs/object-storage.i18n.json?raw";
import serverlessWire from "../../../../packages/content/packs/serverless.i18n.json?raw";
import trunkGroupVoipWire from "../../../../packages/content/packs/trunk-group-voip.i18n.json?raw";
import { getEra } from "./eraState.ts";
import {
  fillTemplateBody,
  loadI18nPack,
  pickEraText,
  resolveTemplate,
  type I18nTemplate,
  type LoadedI18nPack,
} from "@hh/sim-core/loader";

/** Every shipped pack, by its short consumer-facing id (ADR-0014 #D5: the
 *  roster is the full disk truth — the two baseline packs keep their leading
 *  order, the ten type packs follow code-unit sorted). */
export type PackId =
  | "shared-web"
  | "game"
  | "backup-archival"
  | "colo"
  | "dbaas"
  | "dedicated"
  | "dns-hosting"
  | "exchange-colo"
  | "mail-hosting"
  | "object-storage"
  | "serverless"
  | "trunk-group-voip";

export const PACK_IDS: readonly PackId[] = Object.freeze([
  "shared-web",
  "game",
  "backup-archival",
  "colo",
  "dbaas",
  "dedicated",
  "dns-hosting",
  "exchange-colo",
  "mail-hosting",
  "object-storage",
  "serverless",
  "trunk-group-voip",
] as const);

/** The shared toggle's initial era (single home: eraState.ts). */
export { DEFAULT_ERA_YEAR } from "./eraState.ts";

/** Fail-loud boundary parse (LoaderError names the exact path if content
 *  ever ships a pack CI rejected). JSON.parse of a ?raw string cannot fail
 *  in practice — the drift test re-parses the same file independently. */
const PARSED: Readonly<Record<PackId, LoadedI18nPack>> = Object.freeze({
  "shared-web": loadI18nPack(JSON.parse(sharedWebWire)),
  game: loadI18nPack(JSON.parse(gameWire)),
  "backup-archival": loadI18nPack(JSON.parse(backupArchivalWire)),
  colo: loadI18nPack(JSON.parse(coloWire)),
  dbaas: loadI18nPack(JSON.parse(dbaasWire)),
  dedicated: loadI18nPack(JSON.parse(dedicatedWire)),
  "dns-hosting": loadI18nPack(JSON.parse(dnsHostingWire)),
  "exchange-colo": loadI18nPack(JSON.parse(exchangeColoWire)),
  "mail-hosting": loadI18nPack(JSON.parse(mailHostingWire)),
  "object-storage": loadI18nPack(JSON.parse(objectStorageWire)),
  serverless: loadI18nPack(JSON.parse(serverlessWire)),
  "trunk-group-voip": loadI18nPack(JSON.parse(trunkGroupVoipWire)),
} satisfies Record<PackId, LoadedI18nPack>);

export function packOf(packId: PackId): LoadedI18nPack {
  const pack: LoadedI18nPack | undefined = PARSED[packId];
  if (pack === undefined) {
    throw new RangeError(
      `packStore: unknown pack '${packId}' — the store holds [${PACK_IDS.join(", ")}]`,
    );
  }
  return pack;
}

/** Cheap membership probe for copy paths that must FALL BACK to the raw wire
 *  string instead of throwing (door refusals, notice kinds without a key). */
export function hasKey(packId: PackId, key: string): boolean {
  const pack = packOf(packId);
  return pack.decision.has(key) || pack.flavour.has(key);
}

/** The trusted template behind a key (introspection for tests: kind, slots). */
export function templateOf(packId: PackId, key: string): I18nTemplate {
  return resolveTemplate(packOf(packId), key);
}

/**
 * Resolve pack prose: the template for `key` (decision OR flavour — keys are
 * globally unique by parse), era-selected when the template is an
 * era-variant, then exact-set slot-filled. The default `eraYear` reads the
 * SHARED era ref (eraState.getEra) at call time — inside a computed that
 * means the resolution tracks the toggle. Throws LoaderError (naming the
 * key + pack) when the key is absent or the slot set is wrong — copy paths
 * that tolerate absence call `hasKey` first.
 */
export function t(
  packId: PackId,
  key: string,
  slots: Readonly<Record<string, string | number>> = {},
  eraYear: number = getEra(),
): string {
  const pack = packOf(packId);
  const template = resolveTemplate(pack, key);
  const body = template.kind === "era-variant" ? pickEraText(pack, key, eraYear) : template.body;
  return fillTemplateBody(body, slots, `${pack.packId} ${key}`);
}
