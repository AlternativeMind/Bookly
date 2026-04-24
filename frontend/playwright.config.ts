import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3002',
    headless: true,
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3002',
    reuseExistingServer: true,
    timeout: 60000,
  },
})
