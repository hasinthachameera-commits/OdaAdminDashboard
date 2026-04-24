const {test, expect} = require('@playwright/test');
const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');


async function selectCategory(page, category) {
    

    await login(page);
    await sideMenu(page, 'Product Management', 'Brand Management');
    const categoryDropDown = page.getByText('Category').locator('..').getByRole('combobox');
    await expect(categoryDropDown).toBeVisible();
    await categoryDropDown.click();
    const option = page.getByRole('option', { name: category });
    await option.click();

    //wait until dropdown reflects selected value
    await expect(categoryDropDown).toContainText(category);

}


test('1. Brand Management - Verify tobacco category Brands', async ({ page }) => {

            await selectCategory(page, 'Tobacco');
            // verify the Tobacco category on the result set
            const rows = page.locator('td', { hasText: /Dunhill/i });
            await expect(rows.first()).toBeVisible({ timeout: 10000 });
    

});

test('2. Brand Management - Verify Energy drinks category Brands', async ({ page }) => {

            await selectCategory(page, 'Energy Drinks');
            // verify the Energy Drinks category on the result set
            const rows = page.locator('td', { hasText: /Sensation/i });
            await expect(rows.first()).toBeVisible({ timeout: 10000 });
    

});