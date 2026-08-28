const {test, expect} = require('@playwright/test');
const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { selectDropdownOption } = require('../../utils/filters'); // added this import for selectDropdownOption function


test.beforeEach(async ({ page }) => {
    await login(page);
    await sideMenu(page, 'Sales Rep Management', 'Sales Rep Activity');
});

/*async function selectRegion(page, region) {
    
    const regionFilterDropDown = page.getByText('Region').locator('..').getByRole('combobox');
    //const regionFilterDropDown = page.locator('label:text("Region")').locator('xpath=ancestor::div[1]').getByRole('combobox');
    await expect(regionFilterDropDown).toBeVisible();
    await regionFilterDropDown.click();
    const option = page.getByRole('option', { name: region });
    await option.click();

    //await page.getByText(region, { exact: true }).click();
    //await expect(regionFilterDropDown).toContainText(region);  

}*/


test('30. Rep Activity - Region Lagos selection', async ({ page }) => {
    
    await selectDropdownOption(page, 'Region', 'Lagos', { exact: false });
    //await selectRegion(page, 'Lagos');
    // verify the depot name Lekki on the result set
    const rows = page.locator('tr', { hasText: 'Lekki' });
    await expect(rows.first()).toBeVisible();
});


test('31. Rep Activity - Region North selection', async ({ page }) => {
    await selectDropdownOption(page, 'Region', 'North', { exact: false });
    // verify the depot name Kano 2 on the result set
    const rows = page.locator('tr', { hasText: 'Kano 2' });
    await expect(rows.first()).toBeVisible();
})

test('32. Rep Activity - Region Middle Belt selection', async ({ page }) => {
    
    await selectDropdownOption(page, 'Region', 'Middle Belt', { exact: false });
    //await selectRegion(page, 'Middle Belt');
    // verify the depot name Jos 1 on the result set
    const rows = page.locator('tr', { hasText: 'Jos 1' });
    await expect(rows.first()).toBeVisible();
});

test('33. Rep Activity - Region South East selection', async ({ page }) => {
    
    await selectDropdownOption(page, 'Region', 'South East', { exact: false });
    //await selectRegion(page, 'South East');
    // verify the depot name Onitsha on the result set
    const rows = page.locator('tr', { hasText: 'Onitsha' });
    await expect(rows.first()).toBeVisible();
});

test('34. Rep Activity - Region South West selection', async ({ page }) => {

    await selectDropdownOption(page, 'Region', 'South West', { exact: false });
    //await selectRegion(page, 'South West');
    // verify the depot name Akure on the result set
    const rows = page.locator('tr', { hasText: 'Akure' });
    await expect(rows.first()).toBeVisible();
});

