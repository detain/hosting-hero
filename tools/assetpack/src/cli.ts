/**
 * CLI (node --experimental-transform-types, headless-tools pattern):
 *   make-kit  render the seed kit (kit.json + 5 placeholder PNGs) to disk
 *   emit      hand-emit the HH manifest + vendor .assetpack.mjs config
 *   build     run the vendor @assetpack/core pipeline if resolvable, else
 *             fall back to the documented hand-emitted PASSAGE
 *             (--out <path> writes the HH manifest elsewhere — probe a vendor
 *             build without clobbering the committed manifest, then `emit`)
 *   verify    re-run layout validation over every committed kit (CI helper)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseHhSkinKit, repoRoot, validateKitLayout, writePlaceholderKit } from "./kit.ts";
import { kitSpecOrThrow, SEED_SHARED_WEB } from "./kits.ts";
import { writeHhManifest, writeVendorConfig } from "./emit.ts";
import { buildKit } from "./build.ts";
import { SEED_SHARED_WEB_KIT } from "./seed.ts";

function argKit(argv: readonly string[]): string {
  const index = argv.indexOf("--kit");
  const value = index >= 0 ? argv[index + 1] : undefined;
  return value ?? SEED_SHARED_WEB.kit;
}

function argOut(argv: readonly string[]): string | undefined {
  const index = argv.indexOf("--out");
  return index >= 0 ? argv[index + 1] : undefined;
}

async function main(argv: readonly string[]): Promise<number> {
  const command = argv[0];
  const root = repoRoot();
  const spec = kitSpecOrThrow(argKit(argv));

  if (command === "make-kit") {
    const kit = parseHhSkinKit(SEED_SHARED_WEB_KIT);
    const written = writePlaceholderKit(join(root, spec.kitDir), kit);
    process.stdout.write(`make-kit ${spec.kit}: ${written.join(", ")}\n`);
    return 0;
  }

  if (command === "emit") {
    const manifest = writeHhManifest(root, spec);
    const config = writeVendorConfig(join(root, "tools/assetpack/configs"), spec);
    process.stdout.write(`emit ${spec.kit}: manifest ${manifest}\nemit ${spec.kit}: vendor config ${config}\n`);
    return 0;
  }

  if (command === "build") {
    const outcome = await buildKit(root, spec, argOut(argv));
    process.stdout.write(`build ${outcome.kit} via ${outcome.via}: ${outcome.manifestPath}\n${outcome.detail}\n`);
    return 0;
  }

  if (command === "verify") {
    const kit = parseHhSkinKit(JSON.parse(readFileSync(join(root, spec.kitDir, "kit.json"), "utf8")) as unknown);
    const problems = validateKitLayout(join(root, spec.kitDir), kit);
    for (const problem of problems) process.stderr.write(`verify ${spec.kit}: ${problem}\n`);
    process.stdout.write(`verify ${spec.kit}: ${problems.length === 0 ? "PASS" : "FAIL"}\n`);
    return problems.length === 0 ? 0 : 1;
  }

  process.stderr.write(`unknown command "${command ?? ""}" — expected make-kit | emit | build | verify\n`);
  return 2;
}

main(process.argv.slice(2))
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
