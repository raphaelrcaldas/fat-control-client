import { defineConfig, devices } from "@playwright/test";
import fs from "fs";
import path from "path";

/**
 * Read environment variables from dynamic e2e_token file only.
 */
const e2eTokenPath = path.resolve(__dirname, ".e2e_token");

if (fs.existsSync(e2eTokenPath)) {
   process.env.DEV_TOKEN = fs.readFileSync(e2eTokenPath, "utf8").trim();
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
   testDir: "./tests/e2e",
   /* Run tests in files in parallel */
   fullyParallel: true,
   /* Fail the build on CI if you accidentally left test.only in the source code. */
   forbidOnly: !!process.env.CI,
   /* Retry on CI only */
   retries: process.env.CI ? 2 : 0,
   /* Opt out of parallel tests on CI. */
   workers: process.env.CI ? 1 : undefined,
   /* Reporter to use. See https://playwright.dev/docs/test-reporters */
   reporter: "html",
   /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
   use: {
      /* Base URL to use in actions like `await page.goto('/')`. */
      baseURL: "http://localhost:4000",

      /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
      trace: "on-first-retry",
      screenshot: "only-on-failure",
      video: "on-first-retry",
   },

   /* Configure projects for major browsers */
   projects: [
      {
         name: "firefox",
         use: { ...devices["Desktop Firefox"] },
      },
   ],

   /* Run your local dev servers before starting the tests */
   webServer: [
      {
         command:
            'stdbuf -oL npm run dev 2>&1 | stdbuf -oL sed "s/^/\\x1b[34m[CLIENT]\\x1b[0m /"',
         url: "http://localhost:4000",
         reuseExistingServer: !process.env.CI,
         timeout: 120 * 1000,
         stdout: "pipe",
         stderr: "pipe",
      },
      {
         command:
            "cd ../api && ./scripts/e2e_db_setup.sh && export DATABASE_URL='postgresql+asyncpg://postgres:e2e_password@localhost:5433/fcontrol_e2e' && stdbuf -oL uv run task run 2>&1 | stdbuf -oL sed \"s/^/\\x1b[32m[API]\\x1b[0m /\"",
         url: "http://localhost:8000/docs",
         reuseExistingServer: !process.env.CI,
         timeout: 180 * 1000,
         stdout: "pipe",
         stderr: "pipe",
      },
   ],
});
