import { defineConfig } from "tsup";

export default defineConfig((options) => {
  return {
    entry: ["src/cli.ts"],
    minify: !options.watch,
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    target: "node20",
    format: ["esm"],
  };
});
