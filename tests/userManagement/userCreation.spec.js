const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');

async function createNewUser(page, userrole) {

    await goToHome(page);
    await sideMenu(page, 'User Management', 'User Management');
    const addNewUserBtn = page.getByRole('button', { name: 'Add New User' });
    await expect(addNewUserBtn).toBeVisible();
    await addNewUserBtn.click();
    // verify the Add New User page is open
    const newUserPageText = page.getByText('Fill in information in order to create a user profile');
    await expect(newUserPageText).toBeVisible({ timeout: 10000 }); 

    const roleDropdown = page.getByText('Select Role').locator('..').getByRole('combobox');
    await expect(roleDropdown).toBeVisible();
    await roleDropdown.click();
    const option = page.getByRole('option', { name: userrole, exact: true });
    await option.click();

    //wait until dropdown reflects selected value
    await expect(roleDropdown).toContainText(userrole);


}

test('1. User Management - Create new user with Admin role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page,'Admin');
    const userRoleDropDown = page.getByText('Role').locator('..').getByRole('combobox');
    await expect(userRoleDropDown).toContainText('Admin');

    // Enter First Name, Last Name, Phone Number
    await page.getByPlaceholder('First Name').fill('Test');
    await page.getByPlaceholder('Last Name').fill('User');
    await page.locator('input[name="phoneNumber"]').fill('0905345346');

    // Select Company, Region from dropdowns and Enter the ED code
    // Select Company dropdown
// Company dropdown

    // Company dropdown
    const companyDropdown = page.locator('button[role="combobox"]').first();

await expect(companyDropdown).toBeVisible();
await companyDropdown.click();

// WAIT for Radix popup (key fix)
const popup = page.locator('[role="listbox"]');

await expect(popup).toBeVisible({ timeout: 10000 });

// NOW select from popup only
const companyOption = popup.getByText('Great Brands Nigeria Limited', {
  exact: true
});

await expect(companyOption).toBeVisible();
await companyOption.click();

// verify selection
await expect(companyDropdown).toContainText('Great Brands Nigeria Limited');

    /*const companyDropdown = page.locator('div').filter({ hasText: /Company/ }).getByRole('combobox').first();
    await expect(companyDropdown).toBeVisible();
    await companyDropdown.click();
    const companyOption = page.getByText(/Great Brands Nigeria Limited/i);
    await expect(companyOption).toBeVisible({ timeout: 10000 });
    await companyOption.click();*/

    const regionDropdown = page.getByText('Region').locator('..').getByRole('combobox');
    await expect(regionDropdown).toBeVisible();
    await regionDropdown.click();
    const regionOption = page.getByRole('option', { name: 'North', exact: true });
    await regionOption.click();
    await expect(regionDropdown).toContainText('North');

    await page.getByPlaceholder('ED Code').fill('YTRF9876');

    // Enter username, password and confirm password
    await page.getByPlaceholder('Username').fill('TrazorGT66');
    await page.getByPlaceholder('Password').fill('G123');
    await page.getByPlaceholder('Confirm Password').fill('G123');

    // Toggle the Active button
    const activeToggle = page.getByRole('checkbox', { name: /active/i });
    await expect(activeToggle).toBeVisible();
    await activeToggle.click();

    // Click the Submit button to create the user
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify user was created successfully
    await expect(page.getByText(/user created successfully|success/i)).toBeVisible({ timeout: 10000 });

});