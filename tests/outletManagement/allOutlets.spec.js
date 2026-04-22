const {test, expect} = require('@playwright/test');
const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');


async function selectOutletStatus(page, outletstatus) {
    

    await login(page);
    await sideMenu(page, 'Outlet Management', 'All Outlets');
    const outletStatusFilterDropDown = page.getByText('Status').locator('..').getByRole('combobox');
    //const regionFilterDropDown = page.locator('label:text("Region")').locator('xpath=ancestor::div[1]').getByRole('combobox');
    await expect(outletStatusFilterDropDown).toBeVisible();
    await outletStatusFilterDropDown.click();
    const option = page.getByRole('option', { name: outletstatus });
    await option.click();

    //await page.getByText(region, { exact: true }).click();
    //await expect(regionFilterDropDown).toContainText(region);  

}


test('1. All Outlets - Verify the Approved Status', async ({ page }) => {

        await selectOutletStatus(page, 'Approved');
        // verify the Approved status result set
        const rows = page.locator('tr', { hasText: 'Approved' });
        await expect(rows.first()).toBeVisible();

});

test('2. All Outlets - Verify the Pending Status', async ({ page }) => {

        await selectOutletStatus(page, 'Pending');
        // verify the Pending status result set
        const rows = page.locator('tr', { hasText: 'Pending' });
        await expect(rows.first()).toBeVisible();

});

test('3. All Outlets - Verify the Rejected Status', async ({ page }) => {

        await selectOutletStatus(page, 'Rejected');
        // verify the Rejected status result set
        const rows = page.locator('tr', { hasText: 'Rejected' });
        await expect(rows.first()).toBeVisible();

});

test('4. All Outlets - Verify the Onboarded Status', async ({ page }) => {

        await selectOutletStatus(page, 'Onboarded');
        // verify the Onboarded status result set
        const rows = page.locator('tr', { hasText: 'Onboarded' });
        await expect(rows.first()).toBeVisible();

});

test('5. All Outlets - Verify the Archived Status', async ({ page }) => {

        await selectOutletStatus(page, 'Archived');
        // verify the Archived status result set
        const rows = page.locator('tr', { hasText: 'Archived' });
        await expect(rows.first()).toBeVisible();

});