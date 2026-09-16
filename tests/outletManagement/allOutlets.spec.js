const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { selectDropdownOption } = require('../../utils/filters');

// Known app bug (confirmed live, not test flakiness): selecting Status =
// "Approved" or "Onboarded" updates the dropdown's own displayed value but
// never actually re-filters the table - verified by waiting 20+ real
// seconds directly in the browser outside Playwright entirely. Tests
// 1.2 and 1.4 below are expected to fail until this is fixed in the app.

// Column indices for the All Outlets table. Verified against the live UAT
// table header: URNO, Outlet Name, Date Added, Date Updated, Status,
// Region, Depot, Route, Outlet Owner, Outlet Phone, Associated Sales Rep,
// ODA Merchant Onboarded, Phone Verified, Phone Correct, Details, Actions.
const COLUMN = {
    name: 1,
    status: 4,
    region: 5,
    depot: 6,
    route: 7,
    merchantOnboarded: 11,
    phoneVerified: 12,
    phoneCorrect: 13,
};

async function verifyEmptyState(page) {
    await expect(page.getByText(/no outlets found/i)).toBeVisible({ timeout: 10000 });
}

// Every visible row's column must match expectedValue exactly. Wrapped in
// toPass() since filtering here can involve a debounced re-fetch - reading
// row count once and looping against a fixed count can catch the table
// mid-transition (see splashAlertManagement.spec.js for the same issue).
async function verifyColumnEquals(page, columnIndex, expectedValue) {
    await expect(async () => {
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        // The empty state renders as a single <tr> with one spanning
        // message cell ("No outlets found."), not zero rows - a plain
        // rowCount === 0 check misses it and tries to read a column that
        // doesn't exist on that row.
        if (rowCount === 0 || (await rows.first().locator('td').count()) <= columnIndex) {
            await verifyEmptyState(page);
            return;
        }
        for (let i = 0; i < rowCount; i++) {
            await expect(rows.nth(i).locator('td').nth(columnIndex)).toHaveText(expectedValue, { timeout: 2000 });
        }
    }).toPass({ timeout: 15000 });
}

test.beforeEach(async ({ page }) => {
    await goToHome(page);
    await sideMenu(page, 'Outlet Management', 'All Outlets');
});

// Goal: prove the Status dropdown actually restricts the table for every
// status it offers - the original version of this file only checked 5 of
// the 6 real values (missing "Update Pending"), and used a loose
// page.locator('tr', { hasText }) check that would pass even if an
// unrelated column happened to contain the same text.
test.describe('1. Status filter', () => {

    const STATUSES = ['Pending', 'Approved', 'Rejected', 'Onboarded', 'Update Pending', 'Archived'];

    for (const [index, status] of STATUSES.entries()) {
        test(`1.${index + 1} All Outlets - Status filter ${status} shows only ${status} outlets`, async ({ page }) => {
            await selectDropdownOption(page, 'Status', status);
            await verifyColumnEquals(page, COLUMN.status, status);
        });
    }

});

// Goal: "Route Assigned" has no dedicated Yes/No column - it reflects
// whether the Route column has a value at all. Checked live first: every
// outlet currently has a route, so "No" is a genuine empty-state case here
// rather than an assumption (the same mistake made once already on Splash
// Alert Management's Alert Type filter).
test('2. All Outlets - Route Assigned filter Yes shows outlets with a route', async ({ page }) => {

    await selectDropdownOption(page, 'Route Assigned', 'Yes');
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    const rowCount = await rows.count();
    for (let i = 0; i < rowCount; i++) {
        await expect(rows.nth(i).locator('td').nth(COLUMN.route)).not.toBeEmpty();
    }

});

test('3. All Outlets - Route Assigned filter No shows no outlets (none are currently unassigned)', async ({ page }) => {

    await selectDropdownOption(page, 'Route Assigned', 'No');
    await verifyEmptyState(page);

});

// Goal: prove the Region filter restricts the table correctly across every
// region it offers.
test.describe('4. Region filter', () => {

    const REGIONS = ['Lagos', 'Middle Belt', 'North', 'South East', 'South West'];

    for (const [index, region] of REGIONS.entries()) {
        test(`4.${index + 1} All Outlets - Region filter ${region}`, async ({ page }) => {
            await selectDropdownOption(page, 'Region', region);
            await verifyColumnEquals(page, COLUMN.region, region);
        });
    }

});

// Goal: Depot is disabled until a Region is chosen (same dependency as
// every other Depot filter in this app) - this exercises that two-step
// flow specifically.
test('5. All Outlets - Depot filter Kano 2 (requires Region to be selected first)', async ({ page }) => {

    await selectDropdownOption(page, 'Region', 'North');
    await selectDropdownOption(page, 'Depot', 'Kano 2');
    await verifyColumnEquals(page, COLUMN.depot, 'Kano 2');

});

// Goal: the three Yes/No data-quality flags (ODA Merchant Onboarded, Phone
// Verified, Phone Correct) each get the same treatment - prove the filter
// actually restricts its own column, for both values.
test.describe('6. ODA Merchant Onboarded filter', () => {

    const VALUES = ['Yes', 'No'];

    for (const [index, value] of VALUES.entries()) {
        test(`6.${index + 1} All Outlets - ODA Merchant Onboarded filter ${value}`, async ({ page }) => {
            await selectDropdownOption(page, 'Oda Merchant Onboarded', value);
            await verifyColumnEquals(page, COLUMN.merchantOnboarded, value);
        });
    }

});

test.describe('7. Phone Verified filter', () => {

    const VALUES = ['Yes', 'No'];

    for (const [index, value] of VALUES.entries()) {
        test(`7.${index + 1} All Outlets - Phone Verified filter ${value}`, async ({ page }) => {
            await selectDropdownOption(page, 'Phone Verified', value);
            await verifyColumnEquals(page, COLUMN.phoneVerified, value);
        });
    }

});

test.describe('8. Phone Correct filter', () => {

    const VALUES = ['Yes', 'No'];

    for (const [index, value] of VALUES.entries()) {
        test(`8.${index + 1} All Outlets - Phone Correct filter ${value}`, async ({ page }) => {
            await selectDropdownOption(page, 'Phone Correct', value);
            await verifyColumnEquals(page, COLUMN.phoneCorrect, value);
        });
    }

});

// Goal: the search box should narrow results to outlets whose name
// actually contains the search term, and an empty-state case proves a
// made-up name shows an honest "no results" message rather than an error
// or a stale unfiltered table.
test('9. All Outlets - Search by outlet name returns only matching outlets', async ({ page }) => {

    const searchTerm = 'QA Test';
    await page.getByPlaceholder('Search for an outlet').fill(searchTerm);
    await expect(async () => {
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        for (let i = 0; i < rowCount; i++) {
            await expect(rows.nth(i).locator('td').nth(COLUMN.name)).toContainText(searchTerm, { timeout: 2000 });
        }
    }).toPass({ timeout: 15000 });

});

test('10. All Outlets - Search with no matches shows empty state', async ({ page }) => {

    await page.getByPlaceholder('Search for an outlet').fill('NoSuchOutletXYZ123');
    await verifyEmptyState(page);

});

// Goal: "Reset Filters" needs to restore the page's actual default view
// (every filter back to "All"), not just clear the one filter that was
// changed.
test('11. All Outlets - Reset Filters restores the page to its default state', async ({ page }) => {

    // Using "Pending" here, not "Approved" - Status=Approved is a confirmed
    // broken filter on this page (see the Known Issues note at the top of
    // this file), and this test only needs any working filter change to
    // verify Reset Filters, not to re-validate Approved specifically.
    await selectDropdownOption(page, 'Status', 'Pending');
    await verifyColumnEquals(page, COLUMN.status, 'Pending');

    await page.getByRole('button', { name: 'Reset Filters' }).click();

    const statusDropdown = page.getByText('Status').locator('..').getByRole('combobox');
    await expect(statusDropdown).toContainText('All');

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

});
