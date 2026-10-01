import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "ui.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: "list",
  use: {
    baseURL: process.env.JARVIS_TEST_URL ?? "http://localhost:3000",
    viewport: { width: 1366, height: 900 },
    launchOptions: {
      executablePath: process.env.CHROME_PATH ?? "/opt/google/chrome/chrome",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
