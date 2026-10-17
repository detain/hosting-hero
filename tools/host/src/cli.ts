/**
 * `tools/host/src/cli.ts` — dev entry: start the localhost co-op relay.
 *
 * `pnpm -F host-tools dev [--port 9210]` prints the ws:// URL (port 0 asks
 * the OS for an ephemeral one) and runs until Ctrl+C. Loopback bind, NO
 * AUTH — a dev prototype, never internet-exposed (README §security).
 *
 * Import-guard main (the media-lane M5 pattern): the module body stays inert
 * when imported (tests import server.ts, never this file, but the guard is
 * the house law for a runnable entry).
 */

import { pathToFileURL } from "node:url";
import { startHost } from "./server.ts";

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

async function main(): Promise<void> {
  const handle = await startHost({ port: parsePort(process.argv.slice(2)) });
  console.log(`hh-coop dev relay listening on ws://127.0.0.1:${handle.boundPort}`);
  console.log("localhost-only, no auth — NEVER expose this carrier to the internet.");
  console.log("kill with Ctrl+C (SIGINT closes every socket and stops the tick).");
  process.on("SIGINT", () => {
    void handle.stop().then(() => process.exit(0));
  });
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
