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

    const roleDropdown = page.getByText('Select Role').locator('..').getByRole('combobox').filter({ visible: true });
    await expect(roleDropdown).toBeVisible();
    await roleDropdown.click();
    const option = page.getByRole('option', { name: userrole, exact: true }).filter({ visible: true });
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

    // Select Company, Region from dropdowns and Enter the ED code.
    // Scoped by the label's exact text ("Company *") since a plain
    // substring match on "Company" also matches the "Company Information"
    // section heading - unlike the other labeled fields on this page. A
    // previous version of this selector used
    // `page.locator('button[role="combobox"]').first()`, which actually
    // grabbed the Role dropdown (the first combobox in DOM order) instead
    // of Company, so it silently opened the wrong dropdown.
    const companyDropdown = page.getByText('Company *', { exact: true }).locator('..').getByRole('combobox').filter({ visible: true });
    await expect(companyDropdown).toBeVisible();
    await companyDropdown.click();

    const companyOption = page.getByRole('option', { name: 'Great Brands Nigeria Limited', exact: true }).filter({ visible: true });
    await expect(companyOption).toBeVisible();
    await companyOption.click();

    // verify selection
    await expect(companyDropdown).toContainText('Great Brands Nigeria Limited');

    const regionDropdown = page.getByText('Region').locator('..').getByRole('combobox').filter({ visible: true });
    await expect(regionDropdown).toBeVisible();
    await regionDropdown.click();
    const regionOption = page.getByRole('option', { name: 'North', exact: true }).filter({ visible: true });
    await regionOption.click();
    await expect(regionDropdown).toContainText('North');

    // Unique per run: a fixed username/ED code would only work the first
    // time this test is ever run - any rerun (CI retry, re-running the
    // suite locally) would hit the app's duplicate-username validation
    // instead of the success toast. Trimmed to the last 6 digits of the
    // timestamp to stay close to the original values' length/format.
    const uniqueSuffix = Date.now().toString().slice(-6);
    await page.getByPlaceholder('ED Code').fill(`YTRF${uniqueSuffix}`);

    // Enter username, password and confirm password
    await page.getByPlaceholder('Username').fill(`TrazorGT${uniqueSuffix}`);
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