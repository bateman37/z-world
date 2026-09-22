import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/**/*.integration.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    environment: "node",
    hookTimeout: 30000,
    testTimeout: 30000,
    fileParallelism: false,
  },
});
