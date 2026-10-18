/**
 * `tools/host/src/cli.ts` — dev entry: start the localhost co-op carrier.
 *
 * `pnpm -F host-tools dev [--port 9210] [--sim] [--scope <seat>:<csv|all>] [--token SECRET]`
 * prints the ws:// URL (port 0 asks the OS for an ephemeral one) and runs
 * until Ctrl+C. Loopback bind; NO AUTH is the standing posture (BY RULING —
 * dev prototype, never internet-exposed, README §security). `--token` flips
 * on the OPT-IN dev gate: seats must connect with `?token=SECRET` or the
 * carrier closes 1008 before the hub sees a byte.
 *
 * Default posture is topology (b) — the relay-only two-browser local-sim
 * demo. `--sim` engages topology (a): the host runs the engine itself
 * (fixed boot seed, simLoop.ts) and every seat receives a fogged `view`
 * rider; without `--scope` flags seats default to the estate ("all", a
 * shared-world demo), repeatable `--scope alice:edge` narrows one seat.
 *
 * Import-guard main (the media-lane M5 pattern): the module body stays inert
 * when imported (tests import server.ts, never this file, but the guard is
 * the house law for a runnable entry).
 */

import { pathToFileURL } from "node:url";
import { startHost } from "./server.ts";
import type { HostSimScopes } from "./simLoop.ts";

function parsePort(argv: readonly string[]): number {
  const at = argv.indexOf("--port");
  if (at === -1) return 0; // ephemeral — the printed URL carries the truth
  const raw = argv[at + 1];
  const port = raw === undefined ? Number.NaN : Number(raw);
  if (!Number.isSafeInteger(port) || port < 0 || port > 65_535) {
    console.error(`host-tools dev: --port expects an integer 0..65535, got "${String(raw)}"`);
    process.exit(1);
  }
  return port;
}

/** `--scope alice:edge,origin` (repeatable). "all" means the whole estate. */
function parseScopes(argv: readonly string[]): HostSimScopes {
  const scopes: Record<string, readonly string[] | "all"> = {};
  for (let at = argv.indexOf("--scope"); at !== -1; at = argv.indexOf("--scope", at + 1)) {
    const raw = argv[at + 1];
    if (raw === undefined || !raw.includes(":")) {
      console.error(`host-tools dev: --scope expects <seat>:<csv|"all">, got "${String(raw)}"`);
      process.exit(1);
    }
    const colon = raw.indexOf(":");
    const seat = raw.slice(0, colon);
    const value = raw.slice(colon + 1);
    if (seat.length === 0 || value.length === 0) {
      console.error(`host-tools dev: --scope seat and entities must be non-empty, got "${raw}"`);
      process.exit(1);
    }
    scopes[seat] = value === "all" ? "all" : Object.freeze(value.split(",").map((part) => part.trim()).filter((part) => part.length > 0));
  }
  return scopes;
}

/** `--era <year>` (L-EM, ADR-0019 program 4) — arms the era mechanics pilot
 *  on the host-sim door: with `--sim`, a 1998 run refuses `place-device`
 *  intents for techs the pilot bundle (official:shared-web, or
 *  `--era-bundle <path>`) does not grant in that year. Absent ⇒ the door is
 *  byte-ident to the pre-era host. */
function parseEra(argv: readonly string[]): number | undefined {
  const at = argv.indexOf("--era");
  if (at === -1) return undefined;
  const raw = argv[at + 1];
  const year = raw === undefined ? Number.NaN : Number(raw);
  if (!Number.isSafeInteger(year) || year < 0) {
    console.error(`host-tools dev: --era expects a non-negative integer year, got "${String(raw)}"`);
    process.exit(1);
  }
  return year;
}

/** `--era-bundle <path>` — override the pilot type-bundle JSON path. */
function parseEraBundle(argv: readonly string[]): string | undefined {
  const at = argv.indexOf("--era-bundle");
  if (at === -1) return undefined;
  const raw = argv[at + 1];
  if (raw === undefined || raw.length === 0 || raw.startsWith("--")) {
    console.error("host-tools dev: --era-bundle expects a path to a type-bundle JSON");
    process.exit(1);
  }
  return raw;
}

/** `--token SECRET` — OPT-IN dev token auth (default absent keeps the
 *  standing localhost-no-auth posture). Seats connect `ws://…/?token=SECRET`. */
function parseToken(argv: readonly string[]): string | undefined {
  const at = argv.indexOf("--token");
  if (at === -1) return undefined;
  const raw = argv[at + 1];
  if (raw === undefined || raw.length === 0 || raw.startsWith("--")) {
    console.error("host-tools dev: --token expects a non-empty secret");
    process.exit(1);
  }
  return raw;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const sim = argv.includes("--sim");
  const token = parseToken(argv);
  const eraYear = parseEra(argv);
  const eraBundlePath = parseEraBundle(argv);
  const handle = await startHost({
    port: parsePort(argv),
    ...(sim
      ? {
          sim: {
            scopes: parseScopes(argv),
            defaultScope: "all" as const,
            ...(eraYear === undefined ? {} : { eraYear }),
            ...(eraBundlePath === undefined ? {} : { eraBundlePath }),
          },
        }
      : {}),
    ...(token === undefined ? {} : { auth: { secret: token } }),
  });
  const posture = sim ? "host-sim topology (a) — the host owns the engine, seats get fogged views" : "relay-only topology (b) — browsers run local sims, the host stamps and relays";
  console.log(`hh-coop dev ${sim ? "host-sim" : "relay"} listening on ws://127.0.0.1:${handle.boundPort}`);
  console.log(`posture: ${posture}`);
  if (token === undefined) {
    console.log("localhost-only, no auth — NEVER expose this carrier to the internet.");
  } else {
    console.log("localhost-only, token auth ON — seats must connect with ?token=<secret>; a refusal closes 1008. NEVER expose this carrier to the internet (this is a dev gate, not TLS).");
  }
  console.log("kill with Ctrl+C (SIGINT closes every socket and stops the tick).");
  process.on("SIGINT", () => {
    void handle.stop().then(() => process.exit(0));
  });
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
