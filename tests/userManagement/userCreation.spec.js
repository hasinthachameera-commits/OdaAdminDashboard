const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { selectDropdownOption } = require('../../utils/filters');

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

// Scoped to the <label> tag specifically (not getByText('Company'), which
// also matches the "Company Information" section heading and would resolve
// ambiguously). Verified directly against the live UAT form.
async function selectCompany(page, companyName) {
    const companyDropdown = page.locator('label').filter({ hasText: 'Company' }).locator('..').getByRole('combobox');
    await expect(companyDropdown).toBeVisible();
    await companyDropdown.click();

    const popup = page.locator('[role="listbox"]');
    await expect(popup).toBeVisible({ timeout: 10000 });

    const companyOption = popup.getByText(companyName, { exact: true });
    await expect(companyOption).toBeVisible();
    await companyOption.click();

    await expect(companyDropdown).toContainText(companyName);
}

async function fillPersonalAndAuth(page, { firstName, lastName, username, password }) {
    await page.getByPlaceholder('First Name').fill(firstName);
    await page.getByPlaceholder('Last Name').fill(lastName);
    await page.getByPlaceholder('Username').fill(username);
    // getByPlaceholder('Password') would substring-match both "Enter Password"
    // and "Confirm Password" - exact:true pins it to the first field only.
    await page.getByPlaceholder('Enter Password', { exact: true }).fill(password);
    await page.getByPlaceholder('Confirm Password').fill(password);
}

async function submitAndVerifyCreated(page) {
    // role="switch" with no accessible name (no aria-label/aria-labelledby) -
    // getByRole with a name filter can never match it. #isActive is stable and unique.
    const activeToggle = page.locator('#isActive');
    await expect(activeToggle).toBeVisible();
    await activeToggle.click();

    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // The broad regex matched 3 elements in the success toast (title, body,
    // etc.) - the exact toast title text avoids the ambiguity.
    await expect(page.getByText('Success!', { exact: true })).toBeVisible({ timeout: 10000 });
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

// --- Group A: Phone, Company, Region, ED Code required (Email not required) ---

test('2. User Management - Create new user with Accounting & Finance role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'Accounting & Finance');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'AFUser',
        username: 'TestAccFin01',
        password: 'G123'
    });

    await page.locator('input[name="phoneNumber"]').fill('0905345301');

    await selectCompany(page, 'Great Brands Nigeria Limited');
    await selectDropdownOption(page, 'Region', 'North');

    await page.getByPlaceholder('ED Code').fill('TSTACF001');

    await submitAndVerifyCreated(page);

});

test('3. User Management - Create new user with ERP role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'ERP');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'ERPUser',
        username: 'TestErp01',
        password: 'G123'
    });

    await page.locator('input[name="phoneNumber"]').fill('0905345304');

    await selectCompany(page, 'Great Brands Nigeria Limited');
    await selectDropdownOption(page, 'Region', 'North');

    await page.getByPlaceholder('ED Code').fill('TSTERP001');

    await submitAndVerifyCreated(page);

});

test('4. User Management - Create new user with ODA Academy role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'ODA Academy');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'ODAUser',
        username: 'TestOdaAcd01',
        password: 'G123'
    });

    await page.locator('input[name="phoneNumber"]').fill('0905345305');

    await selectCompany(page, 'Great Brands Nigeria Limited');
    await selectDropdownOption(page, 'Region', 'North');

    await page.getByPlaceholder('ED Code').fill('TSTODA001');

    await submitAndVerifyCreated(page);

});

// --- Group B: Email, Company required (Phone/Region/ED Code not required) ---

test('5. User Management - Create new user with OPay Finance role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'OPay Finance');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'OFUser',
        username: 'TestOpayFin01',
        password: 'G123'
    });

    await page.getByPlaceholder('Email Address').fill('qa.opayfinance@oda-test.com');

    await selectCompany(page, 'Great Brands Nigeria Limited');

    await submitAndVerifyCreated(page);

});

test('6. User Management - Create new user with OPS Platform Manager role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'OPS Platform Manager');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'OPMUser',
        username: 'TestOpsMgr01',
        password: 'G123'
    });

    await page.getByPlaceholder('Email Address').fill('qa.opsplatformmanager@oda-test.com');

    await selectCompany(page, 'Great Brands Nigeria Limited');

    await submitAndVerifyCreated(page);

});

// --- Group C: Phone, Email, Company, Region, ED Code all required ---

test('7. User Management - Create new user with CS Associate role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'CS Associate');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'CSAUser',
        username: 'TestCsAsc01',
        password: 'G123'
    });

    await page.locator('input[name="phoneNumber"]').fill('0905345302');
    await page.getByPlaceholder('Email Address').fill('qa.csassociate@oda-test.com');

    await selectCompany(page, 'Great Brands Nigeria Limited');
    await selectDropdownOption(page, 'Region', 'North');

    await page.getByPlaceholder('ED Code').fill('TSTCSA001');

    await submitAndVerifyCreated(page);

});

test('8. User Management - Create new user with CS Manager role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'CS Manager');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'CSMUser',
        username: 'TestCsMgr01',
        password: 'G123'
    });

    await page.locator('input[name="phoneNumber"]').fill('0905345303');
    await page.getByPlaceholder('Email Address').fill('qa.csmanager@oda-test.com');

    await selectCompany(page, 'Great Brands Nigeria Limited');
    await selectDropdownOption(page, 'Region', 'North');

    await page.getByPlaceholder('ED Code').fill('TSTCSM001');

    await submitAndVerifyCreated(page);

});

test('9. User Management - Create new user with OPS Platform Associate role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'OPS Platform Associate');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'OPAUser',
        username: 'TestOpsAsc01',
        password: 'G123'
    });

    await page.locator('input[name="phoneNumber"]').fill('0905345307');
    await page.getByPlaceholder('Email Address').fill('qa.opsplatformassociate@oda-test.com');

    await selectCompany(page, 'Great Brands Nigeria Limited');
    await selectDropdownOption(page, 'Region', 'North');

    await page.getByPlaceholder('ED Code').fill('TSTOPA001');

    await submitAndVerifyCreated(page);

});

test('10. User Management - Create new user with Regional Sales Manager role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'Regional Sales Manager');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'RSMUser',
        username: 'TestRegSlsMgr01',
        password: 'G123'
    });

    await page.locator('input[name="phoneNumber"]').fill('0905345308');
    await page.getByPlaceholder('Email Address').fill('qa.regionalsalesmanager@oda-test.com');

    await selectCompany(page, 'Great Brands Nigeria Limited');
    await selectDropdownOption(page, 'Region', 'North');

    await page.getByPlaceholder('ED Code').fill('TSTRSM001');

    await submitAndVerifyCreated(page);

});

test('11. User Management - Create new user with Territory Manager role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'Territory Manager');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'TMUser',
        username: 'TestTerrMgr01',
        password: 'G123'
    });

    await page.locator('input[name="phoneNumber"]').fill('0905345310');
    await page.getByPlaceholder('Email Address').fill('qa.territorymanager@oda-test.com');

    await selectCompany(page, 'Great Brands Nigeria Limited');
    await selectDropdownOption(page, 'Region', 'North');

    await page.getByPlaceholder('ED Code').fill('TSTTRM001');

    await submitAndVerifyCreated(page);

});

// --- Group D: Phone, Company, Region, Depot, Distribution Channel, ED Code, Phone IMEI, Device Brand required ---

test('12. User Management - Create new user with Onboarding Representative role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'Onboarding Representative');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'ORUser',
        username: 'TestOnbRep01',
        password: 'G123'
    });

    await page.locator('input[name="phoneNumber"]').fill('0905345306');

    await selectCompany(page, 'Great Brands Nigeria Limited');
    await selectDropdownOption(page, 'Region', 'North');
    await selectDropdownOption(page, 'Depot', 'Kano 2');
    await selectDropdownOption(page, 'Distribution Channel', 'Bike');

    await page.getByPlaceholder('ED Code').fill('TSTONB001');

    await page.getByPlaceholder('Phone IMEI').fill('356789101234561');
    await selectDropdownOption(page, 'Device Brand', 'Infinix Smart 10');

    await submitAndVerifyCreated(page);

});

test('13. User Management - Create new user with Sales Representative role by entering only the mandatory values', async ({ page }) => {

    await createNewUser(page, 'Sales Representative');

    await fillPersonalAndAuth(page, {
        firstName: 'QA',
        lastName: 'SRUser',
        username: 'TestSlsRep01',
        password: 'G123'
    });

    await page.locator('input[name="phoneNumber"]').fill('0905345309');

    await selectCompany(page, 'Great Brands Nigeria Limited');
    await selectDropdownOption(page, 'Region', 'North');
    await selectDropdownOption(page, 'Depot', 'Kano 2');
    await selectDropdownOption(page, 'Distribution Channel', 'Bike');

    await page.getByPlaceholder('ED Code').fill('TSTSLR001');

    await page.getByPlaceholder('Phone IMEI').fill('356789101234562');
    await selectDropdownOption(page, 'Device Brand', 'Infinix Smart 10');

    await submitAndVerifyCreated(page);

});
