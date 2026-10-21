import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser', timeout:30000, workers:2, reporter:'list',
 use:{baseURL:'http://127.0.0.1:4324',headless:true},
 webServer:{command:'npx tsx tests/browser-server.ts',url:'http://127.0.0.1:4324',reuseExistingServer:false},
});
