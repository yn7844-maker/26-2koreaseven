const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { browserName: 'chromium', launchOptions: { executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] }, baseURL: 'http://127.0.0.1:8766' },
  webServer: { command: 'python3 -m http.server 8766 --bind 127.0.0.1 --directory public', url: 'http://127.0.0.1:8766', reuseExistingServer: !process.env.CI }
});
