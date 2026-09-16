const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { selectDropdownOption } = require('../../utils/filters');

// Column indices for the Outlet Retention table. Verified against the live
// UAT table header: URNO, Route, Channel, Segment, Last Ordered, Last
// Visited, Current, Target, Gap, Gap %, Delivery Rate, Actions. This page
// has no Region/Depot columns in the table itself (Depot only exists as a
// filter, not a displayed column), so the Depot filter test below can only
// verify the filter takes visible effect, not match a specific column -
// same limitation as Hot Deal on Promotion Management.
const COLUMN = {
    channel: 2,
    segment: 3,
};

// "All Segments" and "All Channels" have no separate <label> - their own
// placeholder text is the only identifier (same pattern as Qty Type on
// Splash Alert Management), so selectDropdownOption's label-then-sibling
// lookup doesn't apply. Selects by the combobox's own current text instead
// - called with the placeholder text before a selection is made.
async function selectUnlabeledDropdown(page, currentText, optionName) {
    const dropdown = page.locator('button[role="combobox"]').filter({ hasText: currentText });
    await dropdown.click();
    await page.getByRole('option', { name: optionName, exact: true }).click();
}

async function verifyEmptyState(page) {
    await expect(page.getByText(/no outlets found|no results/i)).toBeVisible({ timeout: 10000 });
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
    await sideMenu(page, 'Outlet Management', 'Outlet Retention');
});

// Goal: prove the Segment filter (the colored M/R/U/MC legend badges at
// the top of the page) actually restricts the table to matching rows.
test.describe('1. Segment filter', () => {

    // The Segment column displays the short codes from the M/R/U/MC legend
    // at the top of the page, not the full names used by the filter.
    const SEGMENTS = {
        'Oda Merchant': 'M',
        'Oda Rider': 'R',
        'USSD': 'U',
        'Multi Channel': 'MC',
    };

    Object.entries(SEGMENTS).forEach(([segment, code], index) => {
        test(`1.${index + 1} Outlet Retention - Segment filter ${segment}`, async ({ page }) => {
            await selectUnlabeledDropdown(page, 'All Segments', segment);
            await verifyColumnEquals(page, COLUMN.segment, code);
        });
    });

});

// Goal: same idea for the Channel filter (Bike / Van).
test.describe('2. Channel filter', () => {

    const CHANNELS = ['Bike', 'Van'];

    for (const [index, channel] of CHANNELS.entries()) {
        test(`2.${index + 1} Outlet Retention - Channel filter ${channel}`, async ({ page }) => {
            await selectUnlabeledDropdown(page, 'All Channels', channel);
            await verifyColumnEquals(page, COLUMN.channel, channel);
        });
    }

});

// Goal: the Depot filter has no corresponding table column here (unlike
// every other section in this app), so this can only verify the filter
// visibly does something - either real rows appear or the empty state
// shows - rather than checking a specific column value.
test('3. Outlet Retention - Depot filter Lekki', async ({ page }) => {

    await selectDropdownOption(page, 'Depot', 'Lekki');
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount === 0) {
        await verifyEmptyState(page);
    } else {
        await expect(rows.first()).toBeVisible();
    }

});

// Goal: "Reset Filters" needs to restore the page's default view (Depot,
// Segment, and Channel all back to their "All" defaults).
test('4. Outlet Retention - Reset Filters restores the page to its default state', async ({ page }) => {

    await selectUnlabeledDropdown(page, 'All Channels', 'Bike');
    await verifyColumnEquals(page, COLUMN.channel, 'Bike');

    await page.getByRole('button', { name: 'Reset Filters' }).click();

    const channelDropdown = page.locator('button[role="combobox"]').filter({ hasText: 'All Channels' });
    await expect(channelDropdown).toBeVisible();

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

});
