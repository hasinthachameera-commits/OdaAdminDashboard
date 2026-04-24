const {test, expect} = require('@playwright/test');
const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');

async function selectStatus(page, status) {
    

    await login(page);
    await sideMenu(page, 'Product Management', 'Product Management');
    const statusDropdown = page.getByText('Status').locator('..').getByRole('combobox');
    await expect(statusDropdown).toBeVisible();
    await statusDropdown.click();
    const option = page.getByRole('option', { name: status, exact: true });
    await option.click();

    //wait until dropdown reflects selected value
    await expect(statusDropdown).toContainText(status);
}


test('1. Product Management - Verify Inactive status products', async ({ page }) => {

            await selectStatus(page, 'Inactive');
            // verify the Inactive status products on the result set
            const rows = page.locator('tr', { hasText: /10047371.*Rothmans Boost/i }); 
            await expect(rows.first()).toBeVisible({ timeout: 10000 });
    

});


test('2. Product Management - Verify Active status products', async ({ page }) => {

            await selectStatus(page, 'Active');
            // verify the Active status products on the result set
            const rows = page.locator('tr', { hasText: /10211686.*Pallmall Rubi/i }); 
            await expect(rows.first()).toBeVisible({ timeout: 10000 });
    

});

