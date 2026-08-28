const {test, expect} = require('@playwright/test')

/**
 * Clicks a pagination button and waits for the table's first row to actually
 * change, instead of relying purely on a fixed sleep. Falls back to a short
 * timeout as a safety margin for any trailing UI animation/render.
 *
 * NOTE: this assumes the table body is `tbody tr`. If a specific page uses a
 * different table structure, pass its own row locator via `rowLocator`.
 */

async function waitForTableToChange(page, rowLocator) {
    const firstRow = rowLocator ?? page.locator('tbody tr').first();
    const previousText = await firstRow.textContent().catch(() => null);

    if (previousText !== null) {
        await expect(async () => {
            const currentText = await firstRow.textContent();
            expect(currentText).not.toBe(previousText);
        }).toPass({ timeout: 10000 });
    } else {
        // Table was empty/not yet rendered - just wait for a row to appear.
        await expect(firstRow).toBeVisible({ timeout: 10000 });
    }
}
   

async function paginationForwardButton(page, rowLocator) {

    const forwardBtn = page.locator('button:has(svg.lucide-chevron-right)');
    await forwardBtn.click();
    await waitForTableToChange(page, rowLocator);
    //await page.waitForTimeout(5000);
    

};


async function paginationLastPageButton(page, rowLocator) {

    const lastPageBtn = page.locator('button:has(svg.lucide-chevrons-right)');   
    await lastPageBtn.click();
    await waitForTableToChange(page, rowLocator);
    //await page.waitForTimeout(3000);

};

async function paginationBackButton(page, rowLocator) {

    const backBtn = page.locator('button:has(svg.lucide-chevron-left)'); 
    await backBtn.click();
    await waitForTableToChange(page, rowLocator);
    //await page.waitForTimeout(3000);

};

async function paginationFirstPageButton(page, rowLocator) {

    const firstPageBtn = page.locator('button:has(svg.lucide-chevrons-left)');
    await firstPageBtn.click();
    await waitForTableToChange(page, rowLocator);
    //await page.waitForTimeout(3000);

};

module.exports = {
    paginationForwardButton,
    paginationLastPageButton,
    paginationBackButton,
    paginationFirstPageButton
};


