const { expect } = require('@playwright/test');

async function openDashboardMenu(page) {


        const hamburgerIcon = page.locator('svg.lucide-menu');

        if (await hamburgerIcon.count() > 0) {
        await hamburgerIcon.first().click();
    }
        await expect (page.getByText('ODA Admin', { exact: true })).toBeVisible({ timeout: 10000 });
    }


async function navigateAndWait(page, link) {
    const href = await link.getAttribute('href');
    await link.click();

    // Confirm the SPA actually finished routing before handing control
    // back to the test, instead of relying on the caller's next
    // assertion (default 5s) to happen to catch a slow navigation.
    if (href) {
        await page.waitForURL(`**${href}`, { timeout: 15000 });
    }
}


async function sideMenu(page, mainMenu, subMenu) {

    // open hambergurmenu
    await openDashboardMenu(page);

    // Some sidebar entries (e.g. Home, Order Management) are direct links
    // with no submenu, rather than an expandable heading with children.
    if (!subMenu) {
        const directLink = page.getByRole('link', { name: mainMenu, exact: true });
        await expect(directLink).toBeVisible();
        await navigateAndWait(page, directLink);
        return;
    }

    // click main menu
    const main = page.getByRole('heading', { name: mainMenu });
    await expect(main).toBeVisible();
    await main.click();

    // click submenu
    const sub = page.getByRole('link', { name: subMenu, exact: true });
    await expect(sub).toBeVisible({ timeout: 10000 });
    await navigateAndWait(page, sub);

}

module.exports = {
    openDashboardMenu,
    sideMenu
};