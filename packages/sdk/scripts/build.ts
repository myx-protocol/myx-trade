import { build } from "tsup";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const packageJsonPath = resolve(process.cwd(), "package.json");

const args = process.argv.slice(2);
const watch = args.includes("--watch");
const sourcemap = args.includes("--sourcemap");

async function run() {
  const packageJsonText = await readFile(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonText) as {
    version: string;
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };

  /** Do not bundle npm deps into dist — keeps published tarball small; consumers resolve from their node_modules. */
  const external = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ];

  await build({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    minify: true,
    sourcemap,
    clean: !watch,
    watch,
    external,
    define: {
      __SDK_VERSION__: JSON.stringify(packageJson.version),
    },
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
