import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3002",
    ...devices["Desktop Chrome"],
    channel: "chrome",
    // Never retain passwords, profiles, or cookies in browser artifacts.
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: "node scripts/serve-auth-test.mjs",
    url: "http://localhost:3002/auth/login/",
    reuseExistingServer: false,
    timeout: 90000,
  },
});
