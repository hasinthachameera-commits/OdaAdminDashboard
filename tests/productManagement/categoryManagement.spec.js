const {test, expect} = require('@playwright/test');
const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');
const { paginationForwardButton} = require('../../utils/pagination');


test('1. Product Management - Find the Tobacco category on the result set', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Product Management', 'Category Management');

     //const row1 = page.getByRole('row', { name: /Tobacco.*Yes/i });

    const rowPage1 = page.getByRole('row', { name: /Beverages/i });
    const rowPage2 = page.getByRole('row', { name: /GBN/i });
    const rowPage3 = page.getByRole('row', { name: /Tobacco/i });
    const firstRow = page.locator('tbody tr').first();
   
    //const nextBtn = page.locator('button:has(svg.lucide-chevron-right)');
    await expect(rowPage1.first()).toBeVisible();
    const page1Row = await firstRow.textContent();
    console.log('Page 1 First Row:', page1Row);

    // button click with method
    await paginationForwardButton(page);
    //await nextBtn.click();
  
    /*await nextBtn.click();
    await page.waitForTimeout(3000);*/
    await expect(rowPage2.first()).toBeVisible();
    const page2Row = await firstRow.textContent();
    console.log('Page 2 First Row:', page2Row);


    await paginationForwardButton(page);

    const page3Row = await firstRow.textContent();
    console.log('Page 3 First Row:', page3Row);


    //await nextBtn.click();
    //await page.waitForTimeout(3000);
    //await expect(rowPage3.first()).toBeVisible();
    //const page3Row = await firstRow.textContent();
    //console.log('Page 3 First Row:', page3Row);
    
/*
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
    await expect(row1.first()).toBeVisible();*/


});

