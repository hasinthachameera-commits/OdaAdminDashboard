const {test, expect} = require('@playwright/test');
const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { paginationForwardButton} = require('../../utils/pagination');

test.beforeEach(async ({ page }) => {
    await login(page);
    await sideMenu(page, 'Product Management', 'Supplier Management');
});


test('1. Supplier Management - Select a value from Brand Filter', async ({ page }) => {
    
    const brandDropdown = page.getByText('Brand').locator('..').getByRole('combobox');
    await expect(brandDropdown).toBeVisible();
    await brandDropdown.click();
    const option = page.getByRole('option', { name: 'Dunhill', exact: true });
    await option.click();

    //wait until dropdown reflects selected value
    await expect(brandDropdown).toContainText('Dunhill');
    const rows = page.locator('tr', { hasText: /Dunhill/i }); 
    await expect(rows.first()).toBeVisible({ timeout: 10000 });

    const text = await rows.first().textContent();
    console.log('Filtered Dunhill Row:', text);


});

test('2. Supplier Management - Search a supplier using Supplier Name', async ({ page }) => {

    const searchInput = page.getByPlaceholder('Search for a supplier');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Hellman');
   // await searchInput.press('Enter');

    const rows = page.locator('tr', { hasText: /Hellman/i }); 
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    const text = await rows.first().textContent();
    console.log('Search Hellman Row:', text);


});

test('3. Supplier Management - Check the pagination', async ({ page }) => {

    await paginationForwardButton(page);

    const firstRow = page.locator('tbody tr').first();
    const firstRowText = await firstRow.textContent();
    console.log('Page 2 First Row:', firstRowText);

});

test('4. Supplier Management - Check the Reset Filter option', async ({ page }) => {

});
