const {test, expect} = require('@playwright/test');
const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');

async function selectUserRole(page, userrole) {
    

    await login(page);
    await sideMenu(page, 'User Management', 'User Management');
    const userRoleDropDown = page.getByText('Role').locator('..').getByRole('combobox');
    await expect(userRoleDropDown).toBeVisible();
    await userRoleDropDown.click();
    const option = page.getByRole('option', { name: userrole });
    await option.click();

    //wait until dropdown reflects selected value
    await expect(userRoleDropDown).toContainText(userrole);

    //wait for table to refresh (to replace waitForSelector inside tests)
    await page.waitForTimeout(2000);

}

test('1. User Management - Verify the Admin Role', async ({ page }) => {

        await selectUserRole(page, 'Admin');
        //await page.waitForSelector('tbody tr');
        // verify the Admin role on the result set
        const rows = page.locator('td', { hasText: 'Admin' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });

});

test('2. User Management - Verify the Territory Manager Role', async ({ page }) => {

        await selectUserRole(page, 'Territory Manager');
        //await page.waitForSelector('tbody tr');
        // verify the Territory Manager role on the result set
        const rows = page.locator('td', { hasText: 'Territory Manager' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });


});

test('3. User Management - Verify the Accounting & Finance Role', async ({ page }) => {

        await selectUserRole(page, 'Accounting & Finance');
        // verify the Accounting & Finance role on the result set
        const rows = page.locator('td', { hasText: 'Accounting & Finance' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });


});

test('4. User Management - Verify the CS Associate Role', async ({ page }) => {

        await selectUserRole(page, 'CS Associate');
        //await page.waitForSelector('tbody tr');
        // verify the CS Associate role on the result set
        const rows = page.locator('td', { hasText: 'CS Associate' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });


});

test('5. User Management - Verify the CS Manager Role', async ({ page }) => {

        await selectUserRole(page, 'CS Manager');
        // verify the CS Manager role on the result set
        const rows = page.locator('td', { hasText: 'CS Manager' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });


});

test('6. User Management - Verify the ERP Role', async ({ page }) => {

        await selectUserRole(page, 'ERP');
        // verify the ERP role on the result set
        const rows = page.locator('td', { hasText: 'ERP' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });

});

test('7. User Management - Verify the Oda Academy Role', async ({ page }) => {

        await selectUserRole(page, 'ODA Academy');
        // verify the Oda Academy role on the result set
        const rows = page.locator('td', { hasText: 'ODA Academy' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });


});

test('8. User Management - Verify the Onboarding Representative Role', async ({ page }) => {

        await selectUserRole(page, 'Onboarding Representative');
        //await page.waitForSelector('tbody tr');
        // verify the Onboarding Representative role on the result set
        const rows = page.locator('td', { hasText: 'Onboarding Representative' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });


});

test('9. User Management - Verify the OPS Platform Manager Role', async ({ page }) => {

        await selectUserRole(page, 'OPS Platform Manager');
        // verify the OPS Platform Manager role on the result set
        const rows = page.locator('td', { hasText: 'OPS Platform Manager' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });


});

test('10. User Management - Verify the OPS Platform Associate Role', async ({ page }) => {

        await selectUserRole(page, 'OPS Platform Associate');
        // verify the OPS Platform Associate role on the result set
        const rows = page.locator('td', { hasText: 'OPS Platform Associate' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });


});

test('11. User Management - Verify the Regional Sales Manager Role', async ({ page }) => {

        await selectUserRole(page, 'Regional Sales Manager');
        // verify the Regional Sales Manager role on the result set
        const rows = page.locator('td', { hasText: 'Regional Sales Manager' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });



});

test('12. User Management - Verify the Sales Representative Role', async ({ page }) => {

        await selectUserRole(page, 'Sales Representative');
        // verify the Sales Representative role on the result set
        const rows = page.locator('td', { hasText: 'Sales Representative' });
        await expect(rows.first()).toBeVisible({ timeout: 10000 });


});
