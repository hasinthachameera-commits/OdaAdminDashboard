const {test, expect} = require('@playwright/test')
   

async function paginationForwardButton(page) {

    const forwardBtn = page.locator('button:has(svg.lucide-chevron-right)');
    await forwardBtn.click();
    await page.waitForTimeout(5000);

};


async function paginationLastPageButton(page) {

    const lastPageBtn = page.locator('button:has(svg.lucide-chevrons-right)');   
    await lastPageBtn.click();
    await page.waitForTimeout(3000);

};

async function paginationBackButton(page) {

    const backBtn = page.locator('button:has(svg.lucide-chevron-left)'); 
    await backBtn.click();
    await page.waitForTimeout(3000);

};

async function paginationFirstPageButton(page) {

    const firstPageBtn = page.locator('button:has(svg.lucide-chevrons-left)');
    await firstPageBtn.click();
    await page.waitForTimeout(3000);

};

module.exports = {
    paginationForwardButton,
    paginationLastPageButton,
    paginationBackButton,
    paginationFirstPageButton
};
