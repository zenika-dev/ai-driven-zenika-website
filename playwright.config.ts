import { defineConfig, devices } from '@playwright/test';

// Dedicated port so tests never hit a dev or preview server started by hand.
const PORT = 4399;
const desktop = { viewport: { width: 1280, height: 800 } };
const mobile = { viewport: { width: 375, height: 812 } };

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], ...desktop } },
    { name: 'chromium-mobile', use: { ...devices['Desktop Chrome'], ...mobile } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'], ...desktop } },
    { name: 'webkit-mobile', use: { ...devices['Desktop Safari'], ...mobile } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}/en/`,
    // Always test a fresh production build, never a running dev server.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
