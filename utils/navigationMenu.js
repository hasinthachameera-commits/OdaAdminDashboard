const { expect } = require('@playwright/test');

async function openDashboardMenu(page) {


        const hamburgerIcon = page.locator('svg.lucide-menu');

     /*  if (await hamburgerIcon.isVisible().catch(() => false)) {
        await hamburgerIcon.click();
    }*/

        if (await hamburgerIcon.count() > 0) {
        await hamburgerIcon.first().click();
    }
        //await expect(hamburgerIcon).toBeVisible({timeout : 10000});
        //await hamburgerIcon.click();
        await expect (page.getByText('ODA Admin', { exact: true })).toBeVisible({ timeout: 10000 });  
    }


async function sideMenu(page, mainMenu, subMenu) {

    // open hambergurmenu
    await openDashboardMenu(page);

    // click main menu
    const main = page.getByRole('heading', { name: mainMenu });
    await expect(main).toBeVisible();
    await main.click();
    

    // click submenu
    if (subMenu) {
        const sub = page.getByRole('link', { name: subMenu, exact: true });
        await expect(sub).toBeVisible({ timeout: 10000 });
        await sub.click();

    }
}

module.exports = {
    openDashboardMenu,
    sideMenu
};