const {test, expect} = require('@playwright/test')

const UATBaseUrl = 'https://uat-dashboard.mobiletraderv3.com';
// user details

//admin
const UserName = 'surajudeen.y@mt3.com';
const Psw = '4205'

async function login(page) {
    

        await page.goto(`${UATBaseUrl}/login`);

        //await page.goto(`${UATBaseUrl}/login`);
        await expect(page.locator('h2')).toHaveText('Sign in to your account');

        await page.getByPlaceholder('Username').fill(UserName);  // enter the username
        await page.getByPlaceholder('Password').fill(Psw); // enter the password

        
        await page.getByRole('button').click();
        //await page.getByRole('button',{name: /Sign in/i }).click(); // click sign in button
        await page.waitForLoadState('domcontentloaded');


        await expect(page).toHaveURL(/home/, { timeout: 20000 });


    }

    module.exports = { login };