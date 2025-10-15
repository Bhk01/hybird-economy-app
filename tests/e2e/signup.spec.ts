import { test, expect } from '@playwright/test';

// Basic E2E scaffold - requires Playwright browsers installed to run
test('signup -> onboard -> add project -> reset', async ({ page }) => {
  // Start at app root
  await page.goto('http://localhost:3000');

  // This test is a scaffold. Interactions will vary based on UI selectors.
  // For now, just ensure the landing page loads and shows Get Started
  await expect(page).toHaveTitle(/Work & Invest|Hybrid Economy App/);
});
