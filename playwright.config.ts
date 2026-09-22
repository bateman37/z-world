import { defineConfig, devices } from "@playwright/test";

/**
 * Configuración E2E mínima (§19.7 de WEB-001). Usa el Chromium
 * preinstalado del entorno en vez de descargar uno nuevo.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
          args: ["--headless=new"],
        },
      },
    },
  ],
});
