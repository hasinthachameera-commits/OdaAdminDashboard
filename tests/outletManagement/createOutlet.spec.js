const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { selectDropdownOption } = require('../../utils/filters');


test('1. Outlet Management - Create Outlet option visible', async ({ page }) => {

    await goToHome(page);
    await sideMenu(page, 'Outlet Management', 'All Outlets');
    const createOutletBtn = page.getByRole('button', { name: 'create outlet' });
    await expect(createOutletBtn).toBeVisible();
    await createOutletBtn.click();
    // verify the create outlet popup is open
    const sidebarText = page.getByText('Review all the following steps and confirm that everything is correct');
    await expect(sidebarText).toBeVisible({ timeout: 10000 });

});

test('2. Outlet Management - Create Outlet by entering only the mandatory values', async ({ page }) => {

    await goToHome(page);
    await sideMenu(page, 'Outlet Management', 'All Outlets');

    const createOutletBtn = page.getByRole('button', { name: 'create outlet' });
    await expect(createOutletBtn).toBeVisible();
    await createOutletBtn.click();

    const sidebarText = page.getByText('Review all the following steps and confirm that everything is correct');
    await expect(sidebarText).toBeVisible({ timeout: 10000 });

    // --- Step 1: Outlet Details ---
    // Note: the Outlet Manager fields have a duplicate id="managerFirstName"
    // on both the first-name and last-name inputs, and their placeholders
    // are swapped (first-name field shows placeholder "Last Name" and vice
    // versa) - a real bug in the live app. Checking "Same as outlet owner"
    // disables those fields entirely, so mandatory-field tests never need
    // to touch them.
    await page.locator('#outletName').fill('QA Test Outlet');
    await page.locator('#phoneNumber').fill('8012345671');
    await page.locator('#ownerFirstName').fill('QA');
    await page.locator('#ownerLastName').fill('Owner');
    await page.locator('#sameAsOwner').click();

    await page.getByRole('button', { name: 'Next' }).click();

    // --- Step 2: Physical Address ---
    await expect(page.getByText('Outlet Address Details')).toBeVisible({ timeout: 10000 });
    await page.locator('#address').fill('Lekki Phase 1, Lagos');
    await page.locator('#coordinates').fill('6.524379, 3.379206');

    await page.getByRole('button', { name: 'Next' }).click();

    // --- Step 3: Additional Info ---
    await expect(page.getByRole('button', { name: 'English', exact: true })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'English', exact: true }).click();

    await selectDropdownOption(page, 'Outlet Type', 'Shop and Browse');
    await selectDropdownOption(page, 'Retail Channel', 'Provision Store');
    await selectDropdownOption(page, 'Region', 'North');
    await selectDropdownOption(page, 'Depot', 'Kano 2');
    await selectDropdownOption(page, 'Route', 'NT_KAN2_15');

    await page.getByRole('button', { name: 'Submit' }).click();

    // Verify the outlet was created successfully
    await expect(page.getByText('Success!', { exact: true })).toBeVisible({ timeout: 10000 });

});
