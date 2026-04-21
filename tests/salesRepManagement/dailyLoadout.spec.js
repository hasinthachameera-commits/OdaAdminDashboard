const {test, expect} = require('@playwright/test');
const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');

const correctEDCode = 'E004369';
const incorrectEDcode = 'GHFE4232';

test('1. Daily Loadout Manager - Search record using EDcode and verify the record available', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');
    // Enter the text to the textbox
    const searchBox = page.getByPlaceholder('Search ED Code, First Name or Last Name');
    await searchBox.click();
    await searchBox.fill(correctEDCode);
    // verify the result
    const row = page.getByRole('row', { name: /Musa.*Ibrahim.*North.*Kano 2.*Great Brands Nigeria Limited.*Bike/i });
    await expect(row).toBeVisible();
    
});

test('2. Daily Loadout Manager - Search record using incorrect EDcode and verify there are no results', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');
    // Enter the text to the textbox
    const searchBox = page.getByPlaceholder('Search ED Code, First Name or Last Name');
    await searchBox.click();
    await searchBox.fill(incorrectEDcode);
    // verify the result
    const row = page.getByRole('row', { name: /No Sales Reps Found/i });
    await expect(row).toBeVisible();
    
});