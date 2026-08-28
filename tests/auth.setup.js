const { test: setup, expect } = require('@playwright/test');
require('dotenv').config();

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {

    await page.goto(`${process.env.UAT_BASE_URL}login`);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    await page.getByPlaceholder('Username').fill(process.env.Admin_USERNAME);
    await page.getByPlaceholder('Password').fill(process.env.Admin_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/home/, { timeout: 20000 });

    // Save signed-in cookies/local storage so every test/worker can reuse
    // this single session instead of each one logging in independently
    await page.context().storageState({ path: authFile });
});