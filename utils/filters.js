const { expect } = require('@playwright/test');

/**
 * Search using the Daily Loadout search textbox.
 *
 * @param {Page} page
 * @param {string} searchTerm
 */
async function search(page, searchTerm) {

    const searchBox = page.getByPlaceholder(
        'Search ED Code, First Name or Last Name'
    );

    await expect(searchBox).toBeVisible();

    await searchBox.fill(searchTerm);

}

/**
 * Select a Region.
 *
 * @param {Page} page
 * @param {string} region
 */
async function selectRegion(page, region) {

    const regionFilter = page.getByRole('combobox').first();

    await expect(regionFilter).toBeVisible();

    await regionFilter.click();

    await page
        .getByRole('option', { name: region })
        .click();

}

/**
 * Select a Depot.
 *
 * @param {Page} page
 * @param {string} depot
 */
async function selectDepot(page, depot) {

    const depotFilter = page.getByRole('combobox').nth(1);

    await expect(depotFilter).toBeEnabled();

    await depotFilter.click();

    await page
        .getByRole('option', { name: depot })
        .click();

}

/**
 * Reset all applied filters.
 *
 * @param {Page} page
 */
async function resetFilters(page) {

    const resetBtn = page.getByRole('button', {
        name: 'Reset Filters'
    });

    await expect(resetBtn).toBeVisible();

    await resetBtn.click();

}

module.exports = {
    search,
    selectRegion,
    selectDepot,
    resetFilters
};




// const { expect } = require('@playwright/test');

// /**
//  * Search using the Daily Loadout search textbox.
//  *
//  * @param {Page} page
//  * @param {string} searchTerm
//  */
// async function search(page, searchTerm) {

//     const searchBox = page.getByPlaceholder(
//         'Search ED Code, First Name or Last Name'
//     );

//     await expect(searchBox).toBeVisible();

//     await searchBox.fill(searchTerm);

// }

// /**
//  * Select a Region.
//  *
//  * @param {Page} page
//  * @param {string} region
//  */
// async function selectRegion(page, region) {

//     const regionFilter = page.getByRole('combobox').first();

//     await expect(regionFilter).toBeVisible();

//     await regionFilter.click();

//     await page
//         .getByRole('option', { name: region })
//         .click();

// }

// /**
//  * Select a Depot.
//  *
//  * @param {Page} page
//  * @param {string} depot
//  */
// async function selectDepot(page, depot) {

//     const depotFilter = page.getByRole('combobox').nth(1);

//     await expect(depotFilter).toBeEnabled();

//     await depotFilter.click();

//     await page
//         .getByRole('option', { name: depot })
//         .click();

// }

// /**
//  * Reset all applied filters.
//  *
//  * @param {Page} page
//  */
// async function resetFilters(page) {

//     const resetBtn = page.getByRole('button', {
//         name: 'Reset Filters'
//     });

//     await expect(resetBtn).toBeVisible();

//     await resetBtn.click();

// }

// module.exports = {
//     search,
//     selectRegion,
//     selectDepot,
//     resetFilters
// };

