const {test, expect} = require('@playwright/test')

require('dotenv').config();

async function login(page) {
    

        await page.goto(`${process.env.UAT_BASE_URL}login`);

        //await page.goto(`${UATBaseUrl}/login`);
        //await expect(page.locator('h2')).toHaveText('Sign in to your account');
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

        await page.getByPlaceholder('Username').fill(process.env.Admin_USERNAME);  // enter the username
        await page.getByPlaceholder('Password').fill(process.env.Admin_PASSWORD); // enter the password

        
        await page.getByRole('button').click();
        //await page.getByRole('button',{name: /Sign in/i }).click(); // click sign in button
        await page.waitForLoadState('domcontentloaded');


        await expect(page).toHaveURL(/home/, { timeout: 20000 });


    }

    module.exports = { login };