const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { selectDropdownOption } = require('../../utils/filters');

// Column indices for the Rewards Management table. Verified against the
// live UAT table header: Reward Name, Product, Category, Minimum Points,
// Unit of Measure, Reward Quantity, Status, Actions.
const COLUMN = {
    name: 0,
    product: 1,
    category: 2,
    status: 6,
};

async function verifyEmptyState(page) {
    await expect(page.getByText(/no (rewards|results|data) found/i)).toBeVisible({ timeout: 10000 });
}

// Every visible row's column must match expectedValue exactly.
async function verifyColumnEquals(page, columnIndex, expectedValue) {
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount === 0) {
        await verifyEmptyState(page);
        return;
    }
    for (let i = 0; i < rowCount; i++) {
        await expect(rows.nth(i).locator('td').nth(columnIndex)).toHaveText(expectedValue);
    }
}

// Every visible row's column must contain expectedSubstring.
async function verifyColumnContains(page, columnIndex, expectedSubstring) {
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount === 0) {
        await verifyEmptyState(page);
        return;
    }
    for (let i = 0; i < rowCount; i++) {
        await expect(rows.nth(i).locator('td').nth(columnIndex)).toContainText(expectedSubstring);
    }
}

// The search box matches against Reward Name OR Product (per its own
// placeholder text), so a row can legitimately match via Product without
// its Name containing the search term at all - checking only the Name
// column would wrongly fail on those rows.
//
// Wrapped in toPass() because the search is debounced: right after fill(),
// the table can still be showing the previous (unfiltered) result set for
// a second or two. A one-shot read would catch that stale state and fail
// on rows that haven't been filtered out yet.
async function verifyNameOrProductContains(page, expectedSubstring) {
    await expect(async () => {
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        if (rowCount === 0) {
            await verifyEmptyState(page);
            return;
        }
        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const name = (await row.locator('td').nth(COLUMN.name).textContent()) ?? '';
            const product = (await row.locator('td').nth(COLUMN.product).textContent()) ?? '';
            const matches = name.includes(expectedSubstring) || product.includes(expectedSubstring);
            expect(matches, `Row ${i}: neither Name ("${name}") nor Product ("${product}") contains "${expectedSubstring}"`).toBe(true);
        }
    }).toPass({ timeout: 10000 });
}

test.beforeEach(async ({ page }) => {
    await goToHome(page);
    await sideMenu(page, 'Rewards Management', 'Rewards Management');
});

// Goal: prove the Status dropdown actually restricts the table, not just
// that selecting a value doesn't crash the page. For both Active and
// Inactive, every row left visible after filtering must show that exact
// status in its Status column.
test.describe('1. Status filter', () => {

    const STATUSES = ['Active', 'Inactive'];

    for (const [index, status] of STATUSES.entries()) {
        test(`1.${index + 1} Rewards Management - Status filter ${status} shows only ${status} rewards`, async ({ page }) => {
            await selectDropdownOption(page, 'Status', status);
            await verifyColumnEquals(page, COLUMN.status, status);
        });
    }

});

// Goal: confirm filtering by Category works. Tobacco is the only category
// any current UAT reward actually uses, so this also proves the filter
// doesn't accidentally exclude everything (i.e. it's not silently broken
// in a way that just returns zero rows for a valid filter).
test('2. Rewards Management - Category filter Tobacco shows only Tobacco rewards', async ({ page }) => {

    await selectDropdownOption(page, 'Category', 'Tobacco');
    await verifyColumnEquals(page, COLUMN.category, 'Tobacco');

});

// Goal: the flip side of test 2 - deliberately filter by a category
// ("Beverages") that no existing reward uses, and confirm the page shows
// an honest "no results" message instead of an empty table with no
// explanation, stale rows left over from before the filter, or an error.
test('3. Rewards Management - Category filter with no matching rewards shows empty state', async ({ page }) => {

    // No existing UAT reward uses this category.
    await selectDropdownOption(page, 'Category', 'Beverages');
    await verifyEmptyState(page);

});

// Goal: the search box covers both Reward Name and Product (per its
// placeholder "Search by name or product"), so this checks that a partial
// match against either field narrows the table correctly - proving search
// is a real match against the underlying data, not something that's
// silently ignored.
test('4. Rewards Management - Search by name returns only matching rewards', async ({ page }) => {

    const searchTerm = 'TCT YY';
    await page.getByPlaceholder('Search by name or product').fill(searchTerm);
    await verifyNameOrProductContains(page, searchTerm);

});

// Goal: the empty-state counterpart to test 4 - searching for something
// that can't possibly match any real reward name or product should show
// the honest "no results" state, not an error or a stale unfiltered table.
test('5. Rewards Management - Search with no matches shows empty state', async ({ page }) => {

    await page.getByPlaceholder('Search by name or product').fill('NoSuchRewardXYZ123');
    await verifyEmptyState(page);

});

// Goal: "Reset Filters" needs to restore the page's actual default view.
// Unlike Promotion Management (which defaults Status to Active), Rewards
// Management defaults both Status and Category to "All" - so this test
// deliberately changes Status away from its default first, to catch a
// Reset that does nothing at all, not just one that resets to the wrong
// value.
test('6. Rewards Management - Reset Filters restores the page to its default state', async ({ page }) => {

    await selectDropdownOption(page, 'Status', 'Active');
    await verifyColumnEquals(page, COLUMN.status, 'Active');

    await page.getByRole('button', { name: 'Reset Filters' }).click();

    const statusDropdown = page.getByText('Status').locator('..').getByRole('combobox');
    await expect(statusDropdown).toContainText('All');

    const categoryDropdown = page.getByText('Category').locator('..').getByRole('combobox');
    await expect(categoryDropdown).toContainText('All');

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

});
