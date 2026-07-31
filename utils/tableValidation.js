const { expect } = require('@playwright/test');

/**
 * Verify every visible row contains the expected value
 * in the specified column.
 *
 * @param {Page} page
 * @param {number} columnIndex
 * @param {string} expectedValue
 */
async function verifyAllRowsContainValue(page, columnIndex, expectedValue) {

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount === 0) {
        await verifyEmptyState(page);
        return;
    }

    for (let i = 0; i < rowCount; i++) {

        const row = rows.nth(i);

        await expect(row).toBeVisible();

        const cell = row.locator('td').nth(columnIndex);

        await expect(cell).toHaveText(expectedValue);

    }

}

/**
 * Verify Region column.
 *
 * @param {Page} page
 * @param {string} region
 */
async function verifyRegionColumn(page, region) {

    await verifyAllRowsContainValue(
        page,
        3,
        region
    );

}

/**
 * Verify Depot column.
 *
 * @param {Page} page
 * @param {string} depot
 */
async function verifyDepotColumn(page, depot) {

    await verifyAllRowsContainValue(
        page,
        4,
        depot
    );

}

/**
 * Verify empty state.
 *
 * @param {Page} page
 */
async function verifyEmptyState(page) {

    await expect(
        page.getByRole('row', {
            name: /No Sales Reps Found/i
        })
    ).toBeVisible();

}

module.exports = {
    verifyRegionColumn,
    verifyDepotColumn,
    verifyEmptyState
};






// const { expect } = require('@playwright/test');

// /**
//  * Verifies that every visible row contains the expected value
//  * in the specified column.
//  *
//  * @param {Page} page
//  * @param {number} columnIndex
//  * @param {string} expectedValue
//  */
// async function verifyAllRowsContainValue(page, columnIndex, expectedValue) {

//     const rows = page.locator('tbody tr');

//     const rowCount = await rows.count();

//     if (rowCount === 0) {

//         await expect(
//             page.getByRole('row', { name: /No Sales Reps Found/i })
//         ).toBeVisible();

//         return;
//     }

//     for (let i = 0; i < rowCount; i++) {

//         const cell = rows.nth(i).locator('td').nth(columnIndex);

//         await expect(cell).toHaveText(expectedValue);

//     }
// }

// /**
//  * Verifies that the table displays the empty state.
//  *
//  * @param {Page} page
//  */
// async function verifyEmptyState(page) {

//     await expect(
//         page.getByRole('row', { name: /No Sales Reps Found/i })
//     ).toBeVisible();

// }

// module.exports = {
//     verifyAllRowsContainValue,
//     verifyEmptyState
// };