import { build } from "tsup";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const packageJsonPath = resolve(process.cwd(), "package.json");

const args = process.argv.slice(2);
const watch = args.includes("--watch");

async function run() {
  const packageJsonText = await readFile(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(packageJsonText) as { version: string };

  await build({
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    dts: true,
    minify: true,
    sourcemap: true,
    clean: !watch,
    watch,
    define: {
      __SDK_VERSION__: JSON.stringify(packageJson.version),
    },
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
