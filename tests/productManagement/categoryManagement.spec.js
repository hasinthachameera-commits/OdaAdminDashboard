const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');

// Goal: prove a category can be found on the result set regardless of which
// page it happens to land on. The category list is alphabetical and grows
// over time as categories are added, so a category's page number drifts -
// searching by name instead of paginating to a fixed page number removes
// that as a source of failure entirely.
async function searchAndVerifyCategory(page, categoryName) {
    const searchBox = page.getByPlaceholder('Search for a category');
    await searchBox.fill(categoryName);

    const row = page.getByRole('row', { name: new RegExp(categoryName, 'i') });
    await expect(row.first()).toBeVisible({ timeout: 10000 });
}

test('1. Product Management - Find the Tobacco category on the result set', async ({ page }) => {

    await goToHome(page);
    await sideMenu(page, 'Product Management', 'Category Management');

    await searchAndVerifyCategory(page, 'Beverages');
    await searchAndVerifyCategory(page, 'GBN');
    await searchAndVerifyCategory(page, 'Tobacco');

});

