import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: 'test/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  // PW_CHANNEL=chrome uses the locally installed Chrome instead of downloaded browsers.
  use: { baseURL, trace: 'retain-on-failure', channel: process.env.PW_CHANNEL || undefined },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: 'npm run dev', url: baseURL, reuseExistingServer: true, timeout: 180_000 },
});
