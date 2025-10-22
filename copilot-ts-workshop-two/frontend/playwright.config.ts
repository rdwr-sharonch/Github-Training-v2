import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 1,
	workers: process.env.CI ? 1 : undefined,
	reporter: [
		['html'],
		['line'],
		['json', { outputFile: 'test-results/results.json' }]
	],
	use: {
		baseURL: 'http://localhost:3001',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},
	outputDir: 'test-results/',
	testMatch: '**/tests/**/*.@(spec|test).@(ts|js)',
	testIgnore: ['**/src/**', '**/*.test.js', '**/*.test.ts'],

	// Timeout settings
	timeout: 30000,
	expect: {
		timeout: 10000,
		toHaveScreenshot: {
			mode: 'css',
			animations: 'disabled'
		}
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
		},
		// Mobile testing
		{
			name: 'Mobile Chrome',
			use: { ...devices['Pixel 5'] },
		},
		{
			name: 'Mobile Safari',
			use: { ...devices['iPhone 12'] },
		},
	],
});
