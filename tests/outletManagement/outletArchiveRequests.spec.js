const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { selectDropdownOption } = require('../../utils/filters');

// Column indices for the Outlet Archive Requests table. Verified against
// the live UAT table header: URNO, Outlet Name, Region, Outlet Owner,
// Owner's Phone Number, Associated Sales Rep, Oda Merchant Onboarded,
// Outlet Closed Reason, Show Details, Actions. Region is the only filter
// this page has, alongside search.
const COLUMN = {
    name: 1,
    region: 2,
};

async function verifyEmptyState(page) {
    await expect(page.getByText(/no results/i)).toBeVisible({ timeout: 10000 });
}

// Every visible row's column must match expectedValue exactly. Wrapped in
// toPass() for the same debounce-safety reason as allOutlets.spec.js.
async function verifyColumnEquals(page, columnIndex, expectedValue) {
    await expect(async () => {
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        // The empty state renders as a single <tr> with one spanning
        // message cell, not zero rows - a plain rowCount === 0 check
        // misses it and tries to read a column that doesn't exist there.
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
    await sideMenu(page, 'Outlet Management', 'Outlet Archive Requests');
});

// Goal: prove the Region filter restricts this list correctly. Some
// regions may have zero close requests at any given time (a real, valid
// state) - verifyColumnEquals falls back to checking the empty state then.
test.describe('1. Region filter', () => {

    const REGIONS = ['Lagos', 'Middle Belt', 'North', 'South East', 'South West'];

    for (const [index, region] of REGIONS.entries()) {
        test(`1.${index + 1} Outlet Archive Requests - Region filter ${region}`, async ({ page }) => {
            await selectDropdownOption(page, 'Region', region);
            await verifyColumnEquals(page, COLUMN.region, region);
        });
    }

});

// Goal: the search box should narrow results to outlets whose name
// actually contains the search term, and the empty-state case proves a
// made-up name shows an honest "no results" message.
test('2. Outlet Archive Requests - Search by outlet name returns only matching outlets', async ({ page }) => {

    const searchTerm = 'a';
    await page.getByPlaceholder('Search for an outlet').fill(searchTerm);
    await expect(async () => {
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        for (let i = 0; i < rowCount; i++) {
            await expect(rows.nth(i).locator('td').nth(COLUMN.name)).toContainText(searchTerm, { timeout: 2000, ignoreCase: true });
        }
    }).toPass({ timeout: 15000 });

});

test('3. Outlet Archive Requests - Search with no matches shows empty state', async ({ page }) => {

    await page.getByPlaceholder('Search for an outlet').fill('NoSuchOutletXYZ123');
    await verifyEmptyState(page);

});
