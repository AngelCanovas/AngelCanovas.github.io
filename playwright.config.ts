import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end and accessibility tests run against the production build served by
 * `scripts/serve-dist.mjs`, so the hashed CSP, hashed assets and committed CV
 * PDFs are the real artefacts. Run `npm run build` first (CI does).
 */
export default defineConfig({
  testDir: './e2e',
  captureGitInfo: { commit: false, diff: false },
  // Keep browser QA sequential on local machines/VPS; retain CI parallelism.
  fullyParallel: !!process.env.CI,
  workers: process.env.CI ? undefined : 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4321',
    // Use a regular Chrome UA: Playwright's default is `HeadlessChrome/...`,
    // which the site intentionally treats as a bot (no language redirect).
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node scripts/serve-dist.mjs --port 4321',
    url: 'http://127.0.0.1:4321/CV/cv/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
