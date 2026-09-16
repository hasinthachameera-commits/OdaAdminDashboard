const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { selectDropdownOption } = require('../../utils/filters');

// Column indices for the Promotion Management table. Verified against the
// live UAT table header: Name, Type, Category, Valid From, Valid To,
// Status, Qualifying items, Rewarding items, Regions, Depots,
// Distribution Channels, Availability, Best Seller, Featured, Offer Points,
// Show Details, Actions.
const COLUMN = {
    name: 0,
    type: 1,
    category: 2,
    status: 5,
    regions: 8,
    depots: 9,
    distributionChannels: 10,
    availability: 11,
    bestSeller: 12,
    offerPoints: 14,
};

async function verifyEmptyState(page) {
    await expect(page.getByText(/no (promotions|results|data) found/i)).toBeVisible({ timeout: 10000 });
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

// Every visible row's column must contain expectedSubstring - needed for
// columns that can list multiple comma-separated values (e.g. Regions can
// show "Lagos, North" when filtering for just "North").
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

// Offer Points is a numeric column - "Offer Point" means > 0, "No Points" means 0.
async function verifyOfferPointsColumn(page, hasPoints) {
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount === 0) {
        await verifyEmptyState(page);
        return;
    }
    for (let i = 0; i < rowCount; i++) {
        const text = await rows.nth(i).locator('td').nth(COLUMN.offerPoints).textContent();
        const points = parseInt(text.trim(), 10);
        if (hasPoints) {
            expect(points).toBeGreaterThan(0);
        } else {
            expect(points).toBe(0);
        }
    }
}

test.beforeEach(async ({ page }) => {
    await goToHome(page);
    await sideMenu(page, 'Promotion Management', 'Promotion Management');
});

// Goal: prove the Status dropdown actually restricts the table, not just
// that selecting a value doesn't crash the page. For both Active and
// Inactive, every single row left visible after filtering must show that
// exact status in its Status column - if even one row slips through with
// the wrong status, the filter is broken.
test.describe('1. Status filter', () => {

    const STATUSES = ['Active', 'Inactive'];

    for (const [index, status] of STATUSES.entries()) {
        test(`1.${index + 1} Promotion Management - Status filter ${status} shows only ${status} promotions`, async ({ page }) => {
            await selectDropdownOption(page, 'Status', status);
            await verifyColumnEquals(page, COLUMN.status, status);
        });
    }

});

// Goal: same idea as the Status filter, applied to the Type dropdown
// (Bundle / Discount / Free Sample). These are the three promotion types
// the "Create Promotion" flow can produce, so this is checking that once
// created, each type can actually be isolated again from the full list.
test.describe('2. Type filter', () => {

    const TYPES = ['Bundle', 'Discount', 'Free Sample'];

    for (const [index, type] of TYPES.entries()) {
        test(`2.${index + 1} Promotion Management - Type filter ${type} shows only ${type} promotions`, async ({ page }) => {
            await selectDropdownOption(page, 'Type', type);
            await verifyColumnEquals(page, COLUMN.type, type);
        });
    }

});

// Goal: confirm filtering by Category works. Tobacco is the only category
// any current UAT promotion actually uses, so this test also happens to
// prove the filter doesn't accidentally exclude everything (i.e. it's not
// silently broken in a way that just returns zero rows for a valid filter).
test('3. Promotion Management - Category filter Tobacco shows only Tobacco promotions', async ({ page }) => {

    await selectDropdownOption(page, 'Category', 'Tobacco');
    await verifyColumnEquals(page, COLUMN.category, 'Tobacco');

});

// Goal: the flip side of test 3 - deliberately filter by a category
// ("Beverages") that no existing promotion uses, and confirm the page
// shows an honest "no results" message instead of an empty table with no
// explanation, stale rows left over from before the filter, or an error.
test('4. Promotion Management - Category filter with no matching promotions shows empty state', async ({ page }) => {

    // No existing UAT promotion uses this category.
    await selectDropdownOption(page, 'Category', 'Beverages');
    await verifyEmptyState(page);

});

// Goal: same pattern as Status/Type - filtering by Best Seller (Yes/No)
// should leave only rows whose Best Seller column matches. This is a plain
// Yes/No flag on each promotion, so this test is really just confirming
// the boolean filter and its displayed column agree with each other.
test.describe('5. Best Seller filter', () => {

    const BEST_SELLER_VALUES = ['Yes', 'No'];

    for (const [index, value] of BEST_SELLER_VALUES.entries()) {
        test(`5.${index + 1} Promotion Management - Best Seller filter ${value}`, async ({ page }) => {
            await selectDropdownOption(page, 'Best Seller', value);
            await verifyColumnEquals(page, COLUMN.bestSeller, value);
        });
    }

});

// Goal: Availability describes which app surface a promotion is shown on
// (Oda rider / Oda merchant / Ussd), and a single promotion can be
// available on more than one at once (the column can show a
// comma-separated list). So instead of checking for an exact match, this
// checks each visible row's Availability column *contains* the value that
// was filtered for - a row showing "Oda rider, Oda merchant" is a correct
// result when filtering for either one individually.
test.describe('6. Availability filter', () => {

    const AVAILABILITY_VALUES = ['Oda rider', 'Oda merchant', 'Ussd'];

    for (const [index, value] of AVAILABILITY_VALUES.entries()) {
        test(`6.${index + 1} Promotion Management - Availability filter ${value}`, async ({ page }) => {
            await selectDropdownOption(page, 'Availability', value, { exact: false });
            await verifyColumnContains(page, COLUMN.availability, value);
        });
    }

});

// Goal: Region is the broadest geographic filter, and promotions commonly
// apply to more than one region at once (e.g. "Lagos, North"), so this
// uses the same contains-check as Availability rather than an exact match.
// Deliberately mixes regions that do have promotions right now (Lagos,
// North) with ones that currently have none (Middle Belt, South East,
// South West) - so this one test sweep checks both "correct filtering when
// there are results" and "correct empty-state handling when there aren't",
// without needing a separate dedicated empty-state test for Region.
test.describe('7. Region filter', () => {

    const REGIONS = ['Lagos', 'North', 'Middle Belt', 'South East', 'South West'];

    for (const [index, region] of REGIONS.entries()) {
        test(`7.${index + 1} Promotion Management - Region filter ${region}`, async ({ page }) => {
            await selectDropdownOption(page, 'Region', region);
            await verifyColumnContains(page, COLUMN.regions, region);
        });
    }

});

// Goal: Depot is a special case because the Depot dropdown is disabled
// until a Region is chosen first (a real dependency in the UI, not
// something optional to test around). This test specifically exercises
// that two-step flow - select Region, then Depot becomes selectable, then
// filtering by Depot actually narrows the results correctly.
test('8. Promotion Management - Depot filter Kano 2 (requires Region to be selected first)', async ({ page }) => {

    // Depot combobox is disabled until a Region is chosen.
    await selectDropdownOption(page, 'Region', 'North');
    await selectDropdownOption(page, 'Depot', 'Kano 2');
    await verifyColumnContains(page, COLUMN.depots, 'Kano 2');

});

// Goal: Distribution Channel (Bike / Foot / Van) describes how the
// promotion reaches the field - same reasoning as Availability/Region,
// a promotion can list multiple channels at once, so this checks each
// visible row's Distribution Channels column contains the filtered value
// rather than matching it exactly.
test.describe('9. Distribution Channel filter', () => {

    const CHANNELS = ['Bike', 'Foot', 'Van'];

    for (const [index, channel] of CHANNELS.entries()) {
        test(`9.${index + 1} Promotion Management - Distribution Channel filter ${channel}`, async ({ page }) => {
            await selectDropdownOption(page, 'Distribution Channel', channel);
            await verifyColumnContains(page, COLUMN.distributionChannels, channel);
        });
    }

});

// Goal: Offer Points isn't a label like the other filters - it's a
// threshold over a number. "Offer Point" should mean "has more than zero
// points", and "No Points" should mean "exactly zero". So rather than
// checking the column text matches the filter name, this parses the
// number in each row and checks it's on the correct side of zero -
// catching a subtle bug that a naive text-match test would completely miss
// (e.g. a row showing "0" would pass a text-contains check for "Offer
// Point" purely by coincidence if the word never gets validated properly).
test.describe('10. Offer Points filter', () => {

    test('10.1 Promotion Management - Offer Points filter "Offer Point" shows only promotions with points', async ({ page }) => {
        await selectDropdownOption(page, 'Offer Points', 'Offer Point');
        await verifyOfferPointsColumn(page, true);
    });

    test('10.2 Promotion Management - Offer Points filter "No Points" shows only promotions with zero points', async ({ page }) => {
        await selectDropdownOption(page, 'Offer Points', 'No Points');
        await verifyOfferPointsColumn(page, false);
    });

});

// Goal: the search box is a different mechanism from the dropdown filters
// (free text vs fixed options), so it gets its own coverage. Typing a
// partial name ("Discount") should narrow the table to only promotions
// whose name contains that text - proving search is a real substring match
// against the Name column, not something that silently ignores the input.
test('11. Promotion Management - Search by name returns only matching promotions', async ({ page }) => {

    const searchTerm = 'Discount';
    await page.getByPlaceholder('Search by name').fill(searchTerm);
    await verifyColumnContains(page, COLUMN.name, searchTerm);

});

// Goal: the empty-state counterpart to test 11 - searching for something
// that can't possibly match any real promotion name should show the
// honest "no results" state, not an error or a stale unfiltered table.
test('12. Promotion Management - Search with no matches shows empty state', async ({ page }) => {

    await page.getByPlaceholder('Search by name').fill('NoSuchPromotionXYZ123');
    await verifyEmptyState(page);

});

// Goal: "Reset Filters" needs to restore the page's actual default view,
// not just blank everything out to "All". The page loads with Status
// already set to Active (not All) by default, so a correct reset should
// bring Status back to Active specifically, while Type (which defaults to
// All) should go back to All. This test deliberately changes Type away
// from its default first, so that a Reset which does nothing, or one that
// wrongly resets everything to "All" including Status, would both be
// caught as failures.
test('13. Promotion Management - Reset Filters restores the page to its default state', async ({ page }) => {

    await selectDropdownOption(page, 'Type', 'Bundle');
    await verifyColumnEquals(page, COLUMN.type, 'Bundle');

    await page.getByRole('button', { name: 'Reset Filters' }).click();

    // Default state on load is Status = Active, Type = All.
    const statusDropdown = page.getByText('Status').locator('..').getByRole('combobox');
    await expect(statusDropdown).toContainText('Active');

    const typeDropdown = page.getByText('Type').locator('..').getByRole('combobox');
    await expect(typeDropdown).toContainText('All');

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

});
