const {test, expect} = require('@playwright/test');
const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');


test('1. Product Management - Find the Tobacco category on the result set', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Product Management', 'Category Management');

     const row1 = page.getByRole('row', { name: /Tobacco.*Yes/i });

    //const row = page.getByRole('row', { name: /\bTobacco\b/i });
    const row = page.locator('tr', { hasText: 'Tobacco' });
    const nextBtn = page.locator('button:has(svg.lucide-chevron-right)');
    


    // Page 1
    if (!(await row1.first().isVisible().catch(() => false))) {
        await nextBtn.click();
        await page.waitForTimeout(3000);
    }

    // Page 2
    if (!(await row1.first().isVisible().catch(() => false))) {
        await nextBtn.click();
        await page.waitForTimeout(3000);
    }

    // Page 3
    await page.waitForTimeout(5000);
    await expect(row1.first()).toBeVisible();


});


/*await expect(cell.first()).toBeVisible();

    // Check the Tobacco category availability on Page 1
    if (await cell.count() > 0) {
        await expect(cell.first()).toBeVisible({ timeout: 10000 });
        return;
    }

    await nextBtn.click();
    //Check the Tobacco category availability on Page 2
    if (await cell.count() > 0) {
        await expect(cell.first()).toBeVisible({ timeout: 10000 });
        return;
    }

    //Check the Tobacco category availability on Page 3
    await nextBtn.click();
    await expect(cell.first()).toBeVisible({ timeout: 10000 });*/



    test('2. Product Management - Find Tobacco gdgdfgd drgd category in pagination', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Product Management', 'Category Management');

    const nextBtn = page.locator('button:has(svg.lucide-chevron-right)');
    const firstRow = page.locator('tbody tr').first();

// Page 1
    const page1Row = await firstRow.textContent();
    console.log('Page 1 First Row:', page1Row);

// Page 2
    await nextBtn.click();
    await page.waitForTimeout(2000);
    const page2Row = await firstRow.textContent();
    console.log('Page 2 First Row:', page2Row);


// Validation
expect(page1Row).not.toBe(page2Row);

    /*const nextBtn = page.locator('button:has(svg.lucide-chevron-right)');

    for (let i = 0; i < 3; i++) {

        const row = page.locator('tr', { hasText: 'Tobacco' });

        if (await row.count() > 0) {
            await expect(row.first()).toBeVisible();
            return;
        }

        await nextBtn.click();
        await page.waitForTimeout(2000);
    }

    throw new Error('Tobacco category not found in pagination');*/
});