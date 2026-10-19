/**
 * productionRules — the G7 panel-PRODUCTION arm (owner ruling 2026-10-19:
 * "(ii) Panel production arming — yes, watch-the-door on the mainline
 * stepper" — RATIFIED; closes the wave-28 fresh ask, successor to the
 * wave-25 "G7-mainline adoption" ask).
 *
 * Main-thread home of the SHIPPED content deck
 * `packages/content/decks/watch-the-door.json`. The file parses through the
 * REAL loader at module scope — `parsePolicyDeck` → `bootRulesFromDeck`,
 * the same authority chain the headless wire witness proved @`34bb32e`
 * (schema→loader→bootRulesFromDeck→boot.rules→worker→armed rule phase) —
 * and hands the trusted book to the production boot path. `SimClient.boot`
 * stringifies at the send boundary (`encodeBootRules`, E2b in boot
 * clothing); the worker hosts revive via the ONE `workerRulesLookup`
 * builder, so the book App.vue puts on the wire and the book the runner
 * arms with cannot drift. PROTOCOL_VERSION stays 1; the rider is
 * additive-optional (omit-when-unset, wave-26 envelope symmetry @`a757f6c`).
 *
 * Worker-graph law (mirrors the i18n packStore direction, inverted): this
 * module must NEVER be imported by `src/worker/**` or re-exported from the
 * `src/runner/index.ts` barrel — the worker receives the book over the
 * wire, never by reading content off disk, and the ?raw deck string belongs
 * to the main-thread bundle alone. Pinned by productionRules.test.ts
 * (source scan) and by the build-gate flatness of the worker/fakeWorker
 * chunks.
 *
 * Dormant switch: the adoption ships ARMED by owner ruling; the switch is
 * a module flag, not a UI feature. `setProductionRulesArmed(false)` boots
 * the mainline stepper WITHOUT the book — the dormant path lives in tests,
 * where it re-pins the legacy 100-frame goldens and the money literals
 * byte-standing (the un-armed wire the app spoke before this ruling).
 */
import watchTheDoorRaw from "../../../../packages/content/decks/watch-the-door.json?raw";
import { bootRulesFromDeck, parsePolicyDeck, type LoadedBootRules } from "@hh/sim-core/loader";
import type { BootRules } from "../shared/protocol";

/** Provenance: what this book IS, named so tests and closeout can pin it
 *  without re-quoting the deck's laws. */
export const PRODUCTION_DECK_SOURCE = "packages/content/decks/watch-the-door.json";
export const PRODUCTION_DECK_ID = "deck:watch-the-door";

/** The trusted book, parsed once at module scope. Fail-loud by construction:
 *  if the shipped deck ever stops parsing (schema drift, hash collision
 *  inside the book), this module throws at import — the app refuses to boot
 *  a production panel on a book it cannot read, never half-arms. */
export const PRODUCTION_DECK_BOOK: LoadedBootRules = bootRulesFromDeck(
  parsePolicyDeck(JSON.parse(watchTheDoorRaw)),
);

/** Owner ruling 2026-10-19 — the adoption DEFAULT. The dormant path is a
 *  test/dev lever, not a product state: nothing in the shipped app flips
 *  this; App.vue and the boot-path tests read it through the helpers. */
const PRODUCTION_ARMED_DEFAULT = true;
let productionArmed = PRODUCTION_ARMED_DEFAULT;

/** The switch, readable — so the app's own boot site stays a pure call. */
export function productionRulesArmed(): boolean {
  return productionArmed;
}

/** Test-only lever (documented above): flips the production boot between
 *  ARMED (owner-ratified default) and DORMANT (the pre-ruling wire shape). */
export function setProductionRulesArmed(next: boolean): void {
  productionArmed = next;
}

/** What `SimClient.boot`'s 6th positional takes: the trusted book when
 *  armed, `undefined` when dormant — and `undefined` means the `rules`
 *  key is never posted at all (the bridge's omit-when-unset spread), so
 *  the dormant boot message is byte-identical to the pre-adoption wire. */
export function productionBootRules(): BootRules | undefined {
  if (!productionArmed) return undefined;
  return PRODUCTION_DECK_BOOK;
}
