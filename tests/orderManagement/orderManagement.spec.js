const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { selectDropdownOption } = require('../../utils/filters');

// Column indices for the Order Management table. Verified against the live
// UAT table header: Order Id, Show Details, URNO, Outlet, Status,
// Quantity, Amount, Region, Depot, Product Category, Platform, Created At,
// Delivered At, Cancelled At, Actions.
const COLUMN = {
    showDetails: 1,
    outlet: 3,
    status: 4,
    region: 7,
    depot: 8,
    category: 9,
    platform: 10,
};

async function verifyEmptyState(page) {
    // The app's own text is "No orders founds" (a typo, not ours) -
    // matched loosely so this doesn't break if it's ever corrected.
    await expect(page.getByText(/no orders founds?/i)).toBeVisible({ timeout: 10000 });
}

// Every visible row's column must match expectedValue exactly (case
// insensitive - the Status column renders lowercase, e.g. "pending", while
// the filter option is "Pending"; every other column matches case exactly
// but case-insensitive comparison is harmless for those too).
//
// Wrapped in toPass() since filtering can involve a debounced re-fetch -
// reading row count once and looping against a fixed count can catch the
// table mid-transition. Also checks the first row's cell count before
// reading a specific column: the empty state renders as a single <tr>
// with one spanning message cell, not zero rows, so a plain
// rowCount === 0 check would miss it and try to read a column that
// doesn't exist on that row (see outletManagement specs for the same fix).
async function verifyColumnEquals(page, columnIndex, expectedValue) {
    await expect(async () => {
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        if (rowCount === 0 || (await rows.first().locator('td').count()) <= columnIndex) {
            await verifyEmptyState(page);
            return;
        }
        for (let i = 0; i < rowCount; i++) {
            await expect(rows.nth(i).locator('td').nth(columnIndex)).toHaveText(
                new RegExp(`^${expectedValue}$`, 'i'),
                { timeout: 2000 }
            );
        }
    }).toPass({ timeout: 15000 });
}

test.beforeEach(async ({ page }) => {
    await goToHome(page);
    await sideMenu(page, 'Order Management');
});

// Goal: prove the Status dropdown actually restricts the table for every
// status it offers.
test.describe('1. Status filter', () => {

    const STATUSES = ['Pending', 'Delivered', 'Cancelled', 'Expired'];

    for (const [index, status] of STATUSES.entries()) {
        test(`1.${index + 1} Order Management - Status filter ${status} shows only ${status} orders`, async ({ page }) => {
            await selectDropdownOption(page, 'Status', status);
            await verifyColumnEquals(page, COLUMN.status, status);
        });
    }

});

// Goal: prove the Region filter restricts the table correctly across every
// region it offers.
test.describe('2. Region filter', () => {

    const REGIONS = ['Lagos', 'Middle Belt', 'North', 'South East', 'South West'];

    for (const [index, region] of REGIONS.entries()) {
        test(`2.${index + 1} Order Management - Region filter ${region}`, async ({ page }) => {
            await selectDropdownOption(page, 'Region', region);
            await verifyColumnEquals(page, COLUMN.region, region);
        });
    }

});

// Goal: Depot is disabled until a Region is chosen - exercises that
// two-step flow specifically.
test('3. Order Management - Depot filter Kano 2 (requires Region to be selected first)', async ({ page }) => {

    await selectDropdownOption(page, 'Region', 'North');
    await selectDropdownOption(page, 'Depot', 'Kano 2');
    await verifyColumnEquals(page, COLUMN.depot, 'Kano 2');

});

// Goal: Tobacco has real orders, Electronics genuinely has none (checked
// live first, not assumed - Beverages looked like a safe "empty" choice
// but actually has real order data too). One test proves the filter
// narrows correctly, the other proves a category with no orders shows an
// honest empty state instead of an error or stale table.
test('4. Order Management - Product Category filter Tobacco shows only Tobacco orders', async ({ page }) => {

    await selectDropdownOption(page, 'Product Category', 'Tobacco');
    await verifyColumnEquals(page, COLUMN.category, 'Tobacco');

});

test('5. Order Management - Product Category filter with no matching orders shows empty state', async ({ page }) => {

    await selectDropdownOption(page, 'Product Category', 'Electronics');
    await verifyEmptyState(page);

});

// Goal: prove the Platform filter restricts the table correctly across
// every platform it offers.
test.describe('6. Platform filter', () => {

    const PLATFORMS = ['ReOda', 'USSD', 'ODA Rider', 'ODA Merchant'];

    for (const [index, platform] of PLATFORMS.entries()) {
        test(`6.${index + 1} Order Management - Platform filter ${platform}`, async ({ page }) => {
            await selectDropdownOption(page, 'Platform', platform);
            await verifyColumnEquals(page, COLUMN.platform, platform);
        });
    }

});

// Goal: the search box should narrow results to orders whose outlet name
// actually contains the search term, and the empty-state case proves a
// made-up term shows an honest "no orders founds" message.
test('7. Order Management - Search by outlet name returns only matching orders', async ({ page }) => {

    const searchTerm = 'bala';
    await page.getByPlaceholder('Search by Order Id, URN or Outlet Name').fill(searchTerm);
    await expect(async () => {
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        for (let i = 0; i < rowCount; i++) {
            await expect(rows.nth(i).locator('td').nth(COLUMN.outlet)).toContainText(searchTerm, { timeout: 2000, ignoreCase: true });
        }
    }).toPass({ timeout: 15000 });

});

test('8. Order Management - Search with no matches shows empty state', async ({ page }) => {

    await page.getByPlaceholder('Search by Order Id, URN or Outlet Name').fill('NoSuchOrderXYZ123');
    await verifyEmptyState(page);

});

// Goal: "Reset Filters" needs to restore the page's default view (every
// filter back to "All"), not just clear the one filter that was changed.
test('9. Order Management - Reset Filters restores the page to its default state', async ({ page }) => {

    await selectDropdownOption(page, 'Status', 'Pending');
    await verifyColumnEquals(page, COLUMN.status, 'Pending');

    await page.getByRole('button', { name: 'Reset Filters' }).click();

    const statusDropdown = page.getByText('Status').locator('..').getByRole('combobox');
    await expect(statusDropdown).toContainText('All');

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

});

// Goal: "Show Details" expands an inline panel for that specific row (not
// a modal or navigation) - prove it shows the right order's data, and
// that it can be collapsed again via the same button (which relabels
// itself to "Hide Details").
//
// This column (`lg:hidden`) only exists below the 1024px breakpoint - at
// the default desktop viewport the app shows every column directly
// instead, so there is nothing to expand and the button isn't in the DOM
// at all. Narrowing the viewport here exercises the condensed layout
// where "Show Details" is actually the app's real behaviour. Selected by
// column position rather than accessible name/text: the button's text
// label also lives in a <span class="hidden md:block">, hidden below the
// md breakpoint, so a name-based selector is viewport-fragile too.
test('10. Order Management - Show Details expands the correct order\'s details', async ({ page }) => {

    await page.setViewportSize({ width: 800, height: 900 });

    const firstRow = page.locator('tbody tr').first();
    const outletName = await firstRow.locator('td').nth(COLUMN.outlet).textContent();
    const showDetailsBtn = firstRow.locator('td').nth(COLUMN.showDetails).locator('button');

    await showDetailsBtn.click();

    const detailsPanel = page.getByText(`Outlet: ${outletName}`);
    await expect(detailsPanel).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(`URN: `)).toBeVisible();

    await expect(showDetailsBtn).toContainText('Hide Details');
    await showDetailsBtn.click();
    await expect(page.getByText(`Outlet: ${outletName}`)).not.toBeVisible();

});
