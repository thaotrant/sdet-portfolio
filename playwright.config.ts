import { defineConfig } from '@playwright/test';
import { env } from './config/env';

/**
 * Central config for both API and E2E UI test layers.
 * Base URL points to the target app; API tests hit /api/* on the same host.
 * All environment-dependent values come from config/env.ts — see .env.example.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: env.isCI ? 1 : 0,
  workers: env.isCI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: env.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: {
        browserName: 'chromium',
        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
  ],
});
