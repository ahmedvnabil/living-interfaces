import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'browser.spec.mjs',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4176',
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: 'python3 -m http.server 4176',
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: true,
  },
});
