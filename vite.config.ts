import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true, outDir: "dist/types" })],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        components: resolve(__dirname, "src/components/index.ts"),
        utils: resolve(__dirname, "src/utils/index.ts")
      },
      formats: ["es", "cjs"]
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        entryFileNames: (chunk) => `${chunk.name}/index.[format].js`
      }
    }
  }
});
