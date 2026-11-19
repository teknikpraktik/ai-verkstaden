import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 4321);

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}${(process.env.BASE_PATH ?? '/').replace(/\/?$/, '/')}`,
    trace: 'off',
    locale: 'sv-SE',
  },
  projects: [
    { name: 'dator', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 800 } } },
    { name: 'mobil', use: { ...devices['Pixel 7'] }, grep: /@mobil/ },
  ],
  webServer: {
    command: `npx astro preview --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}${(process.env.BASE_PATH ?? '/').replace(/\/?$/, '/')}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
