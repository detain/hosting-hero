/**
 * `tools/host/src/cli.ts` — dev entry: start the localhost co-op carrier.
 *
 * `pnpm -F host-tools dev [--port 9210] [--sim] [--scope <seat>:<csv|all>]`
 * prints the ws:// URL (port 0 asks the OS for an ephemeral one) and runs
 * until Ctrl+C. Loopback bind, NO AUTH — a dev prototype, never
 * internet-exposed (README §security).
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

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const sim = argv.includes("--sim");
  const handle = await startHost({
    port: parsePort(argv),
    ...(sim ? { sim: { scopes: parseScopes(argv), defaultScope: "all" as const } } : {}),
  });
  const posture = sim ? "host-sim topology (a) — the host owns the engine, seats get fogged views" : "relay-only topology (b) — browsers run local sims, the host stamps and relays";
  console.log(`hh-coop dev ${sim ? "host-sim" : "relay"} listening on ws://127.0.0.1:${handle.boundPort}`);
  console.log(`posture: ${posture}`);
  console.log("localhost-only, no auth — NEVER expose this carrier to the internet.");
  console.log("kill with Ctrl+C (SIGINT closes every socket and stops the tick).");
  process.on("SIGINT", () => {
    void handle.stop().then(() => process.exit(0));
  });
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
