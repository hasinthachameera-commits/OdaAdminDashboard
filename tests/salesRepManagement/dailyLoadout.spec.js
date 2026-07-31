const { test, expect } = require('@playwright/test');

const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');

const {
    search,
    selectRegion,
    selectDepot,
    resetFilters
} = require('../../utils/filters');

const {
    verifyRegionColumn,
    verifyDepotColumn,
    verifyEmptyState
} = require('../../utils/tableValidation');

const correctEDCode = 'E004369';
const incorrectEDCode = 'GHFE4232';
const partialName = 'Musa';

const REGIONS = [
    'Lagos',
    'Middle Belt',
    'North',
    'South East',
    'South West'
];

test('1. Daily Loadout Manager - Verify page loads with expected UI components', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');

    // Verify breadcrumb
    await expect(
        page.getByLabel('Breadcrumb').getByText('Sales Rep Management')
    ).toBeVisible();

    await expect(
        page.getByLabel('Breadcrumb').getByText('Daily Loadout')
    ).toBeVisible();

    // Verify page title
    await expect(
        page.getByRole('heading', { name: 'Load Out Manager' })
    ).toBeVisible();

    // Verify search textbox
    await expect(
        page.getByPlaceholder('Search ED Code, First Name or Last Name')
    ).toBeVisible();

    // Verify Region filter
    await expect(
        page.getByRole('combobox').first()
    ).toBeVisible();

    // Verify Depot filter (disabled by default)
    await expect(
        page.getByRole('combobox').nth(1)
    ).toBeDisabled();

    // Verify Reset Filters button
    await expect(
        page.getByRole('button', { name: 'Reset Filters' })
    ).toBeVisible();

    // Verify table headers
    await expect(
        page.getByRole('columnheader', { name: 'ED Code' })
    ).toBeVisible();

    await expect(
        page.getByRole('columnheader', { name: 'Daily Customers' })
    ).toBeVisible();

    await expect(
        page.getByRole('columnheader', { name: 'Actions' })
    ).toBeVisible();

});

test('2. Daily Loadout Manager - Search using valid ED Code and verify matching record is returned', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');

    await search(page, correctEDCode);

    const row = page.getByRole('row', {
        name: /Musa.*Ibrahim.*North.*Kano 2.*Great Brands Nigeria Limited.*Bike/i
    });

    await expect(row).toBeVisible();

});

test('3. Daily Loadout Manager - Search using invalid ED Code and verify no records are returned', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');

    await search(page, incorrectEDCode);

    await verifyEmptyState(page);

});

test('4. Daily Loadout Manager - Search using partial name and verify all returned records match the search term', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');

    await search(page, partialName);

    const rows = page.locator('tbody tr');

    await expect(rows.first()).toContainText(partialName);

    const rowCount = await rows.count();

    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {

        await expect(rows.nth(i)).toContainText(partialName);

    }

});

test.describe('5. Region Filter', () => {

    for (const [index, region] of REGIONS.entries()) {

        test(`5.${index + 1} Daily Loadout Manager - Verify ${region} region filter returns expected results`, async ({ page }) => {

            await login(page);

            await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');

            // Select Region
            await selectRegion(page, region);

            // Verify URL updated with selected Region
            await expect(page).toHaveURL(/region=/);

            const rows = page.locator('tbody tr');
            const rowCount = await rows.count();

            if (rowCount === 0) {

                await verifyEmptyState(page);

            } else {

                await verifyRegionColumn(page, region);

            }

        });

    }

});

test.describe('6. Depot Filter', () => {

    test.skip('6.1 Daily Loadout Manager - Verify Depot filter returns only records belonging to the selected depot', async ({ page }) => {

        await login(page);

        await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');

        // Select Region (Required to enable Depot filter)
        await selectRegion(page, 'Lagos');

        // Select Depot
        await selectDepot(page, 'Ikorodu');

        // Verify Depot filter is selected
        await expect(
            page.getByRole('combobox').nth(1)
        ).toContainText('Ikorodu');

        // Verify returned records belong to Ikorodu
        const depots = await page
            .locator('tbody tr td:nth-child(5)')
            .allTextContents();

        expect(depots.length).toBeGreaterThan(0);

        expect(
            depots.every(depot => depot.trim() === 'Ikorodu')
        ).toBeTruthy();

    });

});

test.describe('7. Reset Filters', () => {

    test('7.1 Daily Loadout Manager - Verify Reset Filters restores the page to its default state', async ({ page }) => {

        await login(page);
        await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');

        // Apply Search filter
        await search(page, partialName);

        // Apply Region filter
        await selectRegion(page, 'Lagos');

        // Apply Depot filter
        await selectDepot(page, 'Ikorodu');

        // Verify filters are reflected in the URL
        await expect(page).toHaveURL(/region=.*depot=.*company=.*search=.*/);

        // Reset all filters
        await resetFilters(page);

        // Verify Search textbox is cleared
        await expect(page.getByPlaceholder('Search ED Code, First Name or Last Name')
        ).toHaveValue('');

        // Verify Region filter resets to All
        await expect(page.getByRole('combobox').first()
        ).toContainText('All');

        // Verify Depot filter resets to All
        await expect(page.getByRole('combobox').nth(1)
        ).toContainText('All');

        // Verify Depot filter is disabled
        await expect(page.getByRole('combobox').nth(1)
        ).toBeDisabled();

        // Verify URL returns to default state
        await expect(page).toHaveURL(/company=1/);

        // Verify default dataset is displayed again
        const rows = page.locator('tbody tr');

        expect(await rows.count()).toBeGreaterThan(0);

    });

});




// const { test, expect } = require('@playwright/test');
// const { login } = require('../../utils/userlogin');
// const { sideMenu } = require('../../utils/navigationMenu');

// const correctEDCode = 'E004369';
// const incorrectEDCode = 'GHFE4232';
// const partialName = 'Musa';

// test('1. Daily Loadout Manager - Verify page loads with expected UI components', async ({ page }) => {

//     await login(page);
//     await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');

//     // Verify breadcrumb
//     await expect(page.getByLabel('Breadcrumb').getByText('Sales Rep Management')).toBeVisible();
//     await expect(page.getByLabel('Breadcrumb').getByText('Daily Loadout')).toBeVisible();

//     // Verify page title
//     await expect(page.getByRole('heading', { name: 'Load Out Manager' })).toBeVisible();

//     // Verify search textbox
//     await expect(page.getByPlaceholder('Search ED Code, First Name or Last Name')).toBeVisible();

//     // Verify Region filter
//     await expect(page.getByRole('combobox').first()).toBeVisible();

//     // Verify Depot filter
//     await expect(page.getByRole('combobox').nth(1)).toBeVisible();

//     // Verify Reset Filters button
//     await expect(page.getByRole('button', { name: 'Reset Filters' })).toBeVisible();

//     // Verify table headers
//     await expect(page.getByRole('columnheader', { name: 'ED Code' })).toBeVisible();
//     await expect(page.getByRole('columnheader', { name: 'Daily Customers' })).toBeVisible();
//     await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();

// });

// test('2. Daily Loadout Manager - Search using valid ED Code and verify matching record is returned', async ({ page }) => {

//     await login(page);
//     await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');

//     const searchBox = page.getByPlaceholder('Search ED Code, First Name or Last Name');

//     await searchBox.fill(correctEDCode);

//     const row = page.getByRole('row', {
//         name: /Musa.*Ibrahim.*North.*Kano 2.*Great Brands Nigeria Limited.*Bike/i
//     });

//     await expect(row).toBeVisible();

// });

// test('3. Daily Loadout Manager - Search using invalid ED Code and verify no records are returned', async ({ page }) => {

//     await login(page);
//     await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');

//     const searchBox = page.getByPlaceholder('Search ED Code, First Name or Last Name');

//     await searchBox.fill(incorrectEDCode);

//     const row = page.getByRole('row', { name: /No Sales Reps Found/i });

//     await expect(row).toBeVisible();

// });

// test('4. Daily Loadout Manager - Search using partial name and verify all returned records match the search term', async ({ page }) => {

//     await login(page);
//     await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');

//     const searchBox = page.getByPlaceholder('Search ED Code, First Name or Last Name');

//     await searchBox.fill(partialName);

//     const rows = page.locator('tbody tr');

//     // Wait for search results to load
//     await expect(rows.first()).toContainText(partialName);

//     const rowCount = await rows.count();

//     expect(rowCount).toBeGreaterThan(0);

//     // Verify every returned record contains the search term
//     for (let i = 0; i < rowCount; i++) {
//         await expect(rows.nth(i)).toContainText(partialName);
//     }

// });