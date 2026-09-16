const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { selectDropdownOption } = require('../../utils/filters');

// Column indices for the Pending Outlets table. Verified against the live
// UAT table header: URNO, Outlet Name, Date Added, Date Updated, Status,
// Region, Depot, Outlet Owner, Outlet Phone, Associated Sales Rep, ODA
// Merchant Onboarded, Details, Actions. Every row here is inherently
// "Pending" (this page is a pre-filtered view of All Outlets), so there's
// no Status filter to test - Region and Depot are the only filters.
const COLUMN = {
    name: 1,
    region: 5,
    depot: 6,
};

async function verifyEmptyState(page) {
    await expect(page.getByText(/no outlets found/i)).toBeVisible({ timeout: 10000 });
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
    await sideMenu(page, 'Outlet Management', 'Pending Outlets');
});

// Goal: prove the Region filter restricts this pre-filtered "Pending only"
// list correctly. Some regions may have zero pending outlets at any given
// time (a real, valid state, not a bug) - verifyColumnEquals already falls
// back to checking the empty state when that happens.
test.describe('1. Region filter', () => {

    const REGIONS = ['Lagos', 'Middle Belt', 'North', 'South East', 'South West'];

    for (const [index, region] of REGIONS.entries()) {
        test(`1.${index + 1} Pending Outlets - Region filter ${region}`, async ({ page }) => {
            await selectDropdownOption(page, 'Region', region);
            await verifyColumnEquals(page, COLUMN.region, region);
        });
    }

});

// Goal: Depot is disabled until a Region is chosen - exercises that
// two-step flow specifically.
test('2. Pending Outlets - Depot filter Lekki (requires Region to be selected first)', async ({ page }) => {

    await selectDropdownOption(page, 'Region', 'Lagos');
    await selectDropdownOption(page, 'Depot', 'Lekki');
    await verifyColumnEquals(page, COLUMN.depot, 'Lekki');

});

// Goal: the search box should narrow results to outlets whose name
// actually contains the search term, and the empty-state case proves a
// made-up name shows an honest "no outlets found" message.
test('3. Pending Outlets - Search by outlet name returns only matching outlets', async ({ page }) => {

    const searchTerm = 'HC';
    await page.getByPlaceholder('Search for an outlet').fill(searchTerm);
    await expect(async () => {
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        for (let i = 0; i < rowCount; i++) {
            await expect(rows.nth(i).locator('td').nth(COLUMN.name)).toContainText(searchTerm, { timeout: 2000 });
        }
    }).toPass({ timeout: 15000 });

});

test('4. Pending Outlets - Search with no matches shows empty state', async ({ page }) => {

    await page.getByPlaceholder('Search for an outlet').fill('NoSuchOutletXYZ123');
    await verifyEmptyState(page);

});

// Goal: "Reset Filters" needs to restore the page's default view (Region
// and Depot both back to "All"), not just clear the one filter changed.
test('5. Pending Outlets - Reset Filters restores the page to its default state', async ({ page }) => {

    await selectDropdownOption(page, 'Region', 'North');
    await verifyColumnEquals(page, COLUMN.region, 'North');

    await page.getByRole('button', { name: 'Reset Filters' }).click();

    const regionDropdown = page.getByText('Region').locator('..').getByRole('combobox');
    await expect(regionDropdown).toContainText('All');

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

});
