const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { selectDropdownOption } = require('../../utils/filters');

// Column indices for the Splash Alert Management table. Verified against
// the live UAT table header: Alert Name, Alert Title, SKU/Promotion,
// Alert Type, Valid From, Valid To, Region, Depot, Status, Actions.
const COLUMN = {
    name: 0,
    type: 3,
    region: 6,
    depot: 7,
    status: 8,
};

async function verifyEmptyState(page) {
    await expect(page.getByText(/no (splash alerts|results|data) found/i)).toBeVisible({ timeout: 10000 });
}

// Every visible row's column must match expectedValue exactly.
//
// Wrapped in toPass() because the row count itself can still be settling
// (filtering here can involve a debounced re-fetch) - reading rowCount
// once and then looping against a fixed count can catch the table
// mid-transition, comparing stale rows against the new filter. toPass()
// re-reads everything from scratch each attempt until it's consistent.
async function verifyColumnEquals(page, columnIndex, expectedValue) {
    await expect(async () => {
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        if (rowCount === 0) {
            await verifyEmptyState(page);
            return;
        }
        for (let i = 0; i < rowCount; i++) {
            await expect(rows.nth(i).locator('td').nth(columnIndex)).toHaveText(expectedValue, { timeout: 2000 });
        }
    }).toPass({ timeout: 15000 });
}

// Every visible row's column must contain expectedSubstring - needed for
// Region/Depot, which can list multiple comma-separated values per alert.
// See verifyColumnEquals above for why this is wrapped in toPass().
async function verifyColumnContains(page, columnIndex, expectedSubstring) {
    await expect(async () => {
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        if (rowCount === 0) {
            await verifyEmptyState(page);
            return;
        }
        for (let i = 0; i < rowCount; i++) {
            await expect(rows.nth(i).locator('td').nth(columnIndex)).toContainText(expectedSubstring, { timeout: 2000 });
        }
    }).toPass({ timeout: 15000 });
}

test.describe('Splash Alert Management - list filters', () => {

    test.beforeEach(async ({ page }) => {
        await goToHome(page);
        await sideMenu(page, 'Promotion Management', 'Splash Alert Management');
    });

    // Goal: prove the Status dropdown actually restricts the table, not
    // just that selecting a value doesn't crash the page.
    test.describe('1. Status filter', () => {

        const STATUSES = ['Active', 'Inactive'];

        for (const [index, status] of STATUSES.entries()) {
            test(`1.${index + 1} Splash Alert Management - Status filter ${status} shows only ${status} alerts`, async ({ page }) => {
                await selectDropdownOption(page, 'Status', status);
                await verifyColumnEquals(page, COLUMN.status, status);
            });
        }

    });

    // Goal: prove the Alert Type dropdown actually restricts the table for
    // every type it offers. Unlike Category on Promotion/Rewards
    // Management, all four Alert Types here have real UAT data (the first
    // page of the unfiltered list happened to show only Product-type rows,
    // which is why this suite doesn't assume an empty-state case for any
    // of them - checked each one directly against the live data first).
    test.describe('2. Alert Type filter', () => {

        const TYPES = ['Product', 'Bundle', 'Discount', 'Free Sample'];

        for (const [index, type] of TYPES.entries()) {
            test(`2.${index + 1} Splash Alert Management - Alert Type filter ${type} shows only ${type} alerts`, async ({ page }) => {
                await selectDropdownOption(page, 'Alert Type', type);
                await verifyColumnEquals(page, COLUMN.type, type);
            });
        }

    });

    // Goal: Region can list multiple values per alert (an alert can target
    // several regions at once), so this checks each visible row's Region
    // column *contains* the filtered value rather than matching it exactly.
    test.describe('3. Region filter', () => {

        const REGIONS = ['Lagos', 'North'];

        for (const [index, region] of REGIONS.entries()) {
            test(`3.${index + 1} Splash Alert Management - Region filter ${region}`, async ({ page }) => {
                await selectDropdownOption(page, 'Region', region);
                await verifyColumnContains(page, COLUMN.region, region);
            });
        }

    });

    // Goal: Depot is disabled until a Region is chosen first (a real
    // dependency in the UI) - this exercises that two-step flow and checks
    // the Depot column narrows correctly, same contains-check reasoning as
    // Region above.
    test('4. Splash Alert Management - Depot filter Lekki (requires Region to be selected first)', async ({ page }) => {

        await selectDropdownOption(page, 'Region', 'Lagos');
        await selectDropdownOption(page, 'Depot', 'Lekki');
        await verifyColumnContains(page, COLUMN.depot, 'Lekki');

    });

    // Goal: the search box should narrow results to alerts whose name
    // actually matches, proving it's a real filter and not silently
    // ignored - and the empty-state test alongside it proves a made-up
    // search term shows an honest "no results" message instead of an
    // error or a stale unfiltered table.
    test('5. Splash Alert Management - Search by alert name returns only matching alerts', async ({ page }) => {

        const searchTerm = 'Test';
        await page.getByPlaceholder('Search by Alert name or SKU/Promotion').fill(searchTerm);
        // The app's search is case-insensitive (it correctly returns names
        // like "Just testing"), so the verification needs to be too -
        // otherwise a legitimately-matching lowercase row would look like
        // a false positive from the app.
        await verifyColumnContains(page, COLUMN.name, new RegExp(searchTerm, 'i'));

    });

    test('6. Splash Alert Management - Search with no matches shows empty state', async ({ page }) => {

        await page.getByPlaceholder('Search by Alert name or SKU/Promotion').fill('NoSuchSplashAlertXYZ123');
        await verifyEmptyState(page);

    });

    // Goal: "Reset Filters" needs to restore the page's actual default
    // view (both Status and Alert Type default to "All" here, unlike
    // Promotion Management which defaults Status to Active) - this
    // deliberately changes Status away from its default first, to catch a
    // Reset that does nothing at all, not just one that resets to the
    // wrong value.
    test('7. Splash Alert Management - Reset Filters restores the page to its default state', async ({ page }) => {

        await selectDropdownOption(page, 'Status', 'Active');
        await verifyColumnEquals(page, COLUMN.status, 'Active');

        await page.getByRole('button', { name: 'Reset Filters' }).click();

        const statusDropdown = page.getByText('Status').locator('..').getByRole('combobox');
        await expect(statusDropdown).toContainText('All');

        const typeDropdown = page.getByText('Alert Type').locator('..').getByRole('combobox');
        await expect(typeDropdown).toContainText('All');

        const rows = page.locator('tbody tr');
        await expect(rows.first()).toBeVisible();

    });

});

test.describe('Splash Alert Management - create flow', () => {

    test.beforeEach(async ({ page }) => {
        await goToHome(page);
        await sideMenu(page, 'Promotion Management', 'Splash Alert Management');
    });

    // Goal: prove the full Create Splash Alert flow works end to end for
    // an Alert Type of "Product" - including two fields that turned out to
    // be required in practice despite showing no visible "*" in the UI
    // (Depot, and Qty Type when the type is Product), discovered by
    // probing the live form's real validation rather than trusting the
    // static labels. The Active toggle is deliberately left untouched
    // (it defaults to off/Inactive) so this doesn't create a splash alert
    // that would actually show to real users - only a real, harmless,
    // inactive record.
    test('1. Splash Alert Management - Create splash alert with only the mandatory values stays Inactive', async ({ page }) => {

        const createBtn = page.getByRole('button', { name: 'Create Splash Alert' });
        await expect(createBtn).toBeVisible();
        await createBtn.click();

        await expect(page.getByRole('heading', { name: 'New Splash Alert' })).toBeVisible({ timeout: 10000 });

        await page.locator('#name').fill('QA Automated Splash Alert');
        await page.locator('#title').fill('QA Automated Splash Title');

        await selectDropdownOption(page, 'Select Region', 'Lagos');

        // A "Select" button appears once a Region is chosen, opening a
        // depot picker - at least one depot is required even though the
        // static label carries no "*".
        const selectDepotBtn = page.getByRole('button', { name: 'Select', exact: true });
        await selectDepotBtn.click();
        const depotModalHeading = page.getByText('Select depots in Lagos');
        await expect(depotModalHeading).toBeVisible({ timeout: 10000 });
        // The checkbox itself has no aria-label/aria-labelledby (same class
        // of accessible-name gap seen elsewhere in this app), but it does
        // have a real <label for="..."> association, which getByLabel uses.
        await page.getByLabel('Lekki', { exact: true }).click();
        await page.getByRole('button', { name: 'Done' }).click();
        await expect(depotModalHeading).not.toBeVisible({ timeout: 10000 });

        await selectDropdownOption(page, 'Alert Type', 'Product');

        await selectDropdownOption(page, 'Product Category', 'Tobacco');
        await selectDropdownOption(page, 'Product Brand', 'Dunhill');

        // "Product *" would also substring-match the "Select Product *"
        // section heading above it - exact match on the label avoids that.
        const productDropdown = page.getByText('Product *', { exact: true }).locator('..').getByRole('combobox');
        await productDropdown.click();
        await page.getByRole('option', { name: 'Dunhill Switch', exact: true }).click();
        await expect(productDropdown).toContainText('Dunhill Switch');

        // Only required when Alert Type is Product, despite no "*" shown.
        // It also has no separate <label> at all (unlike every other
        // field) - its own placeholder text "Qty Type" doubles as the only
        // label, so selectDropdownOption's label-then-sibling-combobox
        // pattern can't apply; address the combobox directly instead.
        const qtyTypeDropdown = page.locator('button[role="combobox"]').filter({ hasText: 'Qty Type' });
        await qtyTypeDropdown.click();
        // Can't re-check qtyTypeDropdown afterward: it's filtered by the
        // text "Qty Type", which is only true before a selection is made -
        // once "Pack" is picked, the same locator no longer matches
        // anything. Verifying the option's own popup closes instead.
        const qtyOption = page.getByRole('option', { name: 'Pack', exact: true });
        await qtyOption.click();
        await expect(qtyOption).not.toBeVisible();

        // Date cells are react-datepicker days, addressed by their stable
        // "--0NN" day-of-month class rather than by visible text, which
        // would otherwise ambiguously match multi-digit days containing
        // the same digit.
        await page.locator('input[placeholder="Select start date"]').click();
        await page.locator('.react-datepicker__day--020:not(.react-datepicker__day--outside-month)').click();

        await page.locator('input[placeholder="Select end date"]').click();
        await page.locator('.react-datepicker__day--025:not(.react-datepicker__day--outside-month)').click();

        await page.locator('#dailyFrequency').fill('1');

        // The CTA label sits grouped with the button-text input, one level
        // away from the action combobox (a sibling of that group, not a
        // sibling of the label directly) - selectDropdownOption's single
        // parent-hop can't reach it, so this goes up two levels instead.
        const cta1Dropdown = page.getByText('CTA 1 (Primary)').locator('..').locator('..').getByRole('combobox');
        await cta1Dropdown.click();
        await page.getByRole('option', { name: 'Product/Promotion Details', exact: true }).click();
        await expect(cta1Dropdown).toContainText('Product/Promotion Details');
        await page.locator('#cta1Text').fill('View');

        const cta2Dropdown = page.getByText('CTA 2 (Secondary)').locator('..').locator('..').getByRole('combobox');
        await cta2Dropdown.click();
        await page.getByRole('option', { name: 'Close Splash Alert', exact: true }).click();
        await expect(cta2Dropdown).toContainText('Close Splash Alert');
        await page.locator('#cta2Text').fill('Close');

        // Splash Alert Image has no visible "*" and the live form accepts
        // Save without one - intentionally not uploading one here.

        // Active is intentionally left unchecked - defaults to off, and
        // this test must not produce a splash alert real users would see.
        const activeToggle = page.locator('#active');
        await expect(activeToggle).toHaveAttribute('aria-checked', 'false');

        await page.getByRole('button', { name: 'Save' }).click();

        await expect(page.getByText('Success!', { exact: true })).toBeVisible({ timeout: 10000 });

        // Confirm it actually landed back in the list as Inactive.
        await expect(page).toHaveURL(/\/promotion-management\/splash-alert$/, { timeout: 10000 });
        const newRow = page.getByRole('row', { name: /QA Automated Splash Alert/ });
        await expect(newRow).toBeVisible();
        await expect(newRow).toContainText('Inactive');

    });

});
