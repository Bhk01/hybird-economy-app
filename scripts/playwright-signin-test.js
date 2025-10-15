const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.message, stack: err.stack }));

  await page.goto('http://localhost:3001');

  // Wait for landing to load and click sign in
  await page.waitForSelector('text=Sign in', { timeout: 5000 });
  await page.click('text=Sign in');

  // Wait for email input and fill
  await page.waitForSelector('#login-email', { timeout: 5000 });
  await page.fill('#login-email', 'test+playwright@example.test');
  await page.fill('#login-password', 'pass');

  // Submit
  await Promise.all([
    page.click('text=Sign in'),
    page.waitForTimeout(1000)
  ]);

  // Grab localStorage lastClientError if any
  const lastClientError = await page.evaluate(() => window.localStorage.getItem('lastClientError'));

  console.log('PLAYWRIGHT LOGS:', JSON.stringify(logs, null, 2));
  console.log('lastClientError:', lastClientError);

  await browser.close();
})();
