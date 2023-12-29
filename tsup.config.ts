import { defineConfig } from "tsup";

export default defineConfig((options) => {
  return {
    entry: ["src/cli.ts", "src/index.ts"],
    minify: !options.watch,
    splitting: true,
    sourcemap: true,
    clean: true,
    dts: true,
    target: "node20",
    format: ["esm"],
    bundle: true,
  };
});
