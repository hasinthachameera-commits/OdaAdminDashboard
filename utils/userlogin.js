const {test, expect} = require('@playwright/test')

require('dotenv').config();

async function login(page) {
    

        await page.goto(`${process.env.UAT_BASE_URL}login`);
        //await expect(page.locator('h2')).toHaveText('Sign in to your account');
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

        await page.getByPlaceholder('Username').fill(process.env.Admin_USERNAME);  // enter the username
        await page.getByPlaceholder('Password').fill(process.env.Admin_PASSWORD); // enter the password

        
        await page.getByRole('button').click();
        //await page.getByRole('button',{name: /Sign in/i }).click(); // click sign in button
        await page.waitForLoadState('domcontentloaded');


        await expect(page).toHaveURL(/home/, { timeout: 20000 });


    }

    async function goToHome(page) {

        await page.goto(`${process.env.UAT_BASE_URL}home`);
        await expect(page).toHaveURL(/home/, { timeout: 20000 });

    }

    module.exports = { login, goToHome };


// Used only by tests/auth.setup.js to perform the one-time login and
// capture storageState. Regular spec files should use goToHome() instead -
// they run with the saved session already loaded, so calling login() in
// every test would log in again on top of that saved session and cause the
// exact parallel-session collisions we saw (tests randomly bounced back to
// /login, or the "Sign in" heading never rendering because a redirect to
// /home fired before it could).


// Used by every spec file's beforeEach now. The browser context is already
// authenticated via the storageState saved by auth.setup.js, so this just
// needs to load the app - no login form interaction, no session collision.

