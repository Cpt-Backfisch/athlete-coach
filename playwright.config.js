// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Alle Smoke-Tests gegen die live GitHub-Pages-URL
  use: {
    baseURL: 'https://cpt-backfisch.github.io/athlete-coach',
    // Kein lokaler Dev-Server nötig
    trace: 'on-first-retry',
  },

  // Testdateien in tests/e2e/
  testDir: 'tests/e2e',

  // Parallele Ausführung — Tests sind unabhängig voneinander
  fullyParallel: true,

  // In CI: kein Retry-Rauschen bei echten Fehlern
  retries: process.env.CI ? 1 : 0,

  // Reporter
  reporter: process.env.CI ? 'github' : 'list',

  // Nur Chromium für Smoke-Tests (schnell, ausreichend für Basis-Rauchertest)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
