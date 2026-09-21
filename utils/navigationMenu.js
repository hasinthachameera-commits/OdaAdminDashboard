const { expect } = require('@playwright/test');

// If the app silently drops us back to the login page (expired/invalid
// session) mid-navigation, fail with a clear message immediately instead of
// a generic "element not found" timeout that just looks like flakiness.
function failFastIfRedirectedToLogin(page) {
    if (/\/login(?:[/?]|$)/.test(page.url())) {
        throw new Error(
            `Redirected to the login page instead of staying in the app (session expired or not authenticated). Current URL: ${page.url()}`
        );
    }
}

async function openDashboardMenu(page) {

        const hamburgerIcon = page.locator('svg.lucide-menu:visible');

        if (await hamburgerIcon.count() > 0) {
        await hamburgerIcon.first().click();
    }

        try {
            await expect(page.getByText('ODA Admin', { exact: true }).filter({ visible: true })).toBeVisible({ timeout: 15000 });
        } catch (err) {
            failFastIfRedirectedToLogin(page);
            throw err;
        }
    }


async function navigateAndWait(page, link) {
    const href = await link.getAttribute('href');
    await link.click();

    // Confirm the SPA actually finished routing before handing control
    // back to the test, instead of relying on the caller's next
    // assertion (default 5s) to happen to catch a slow navigation.
    if (href) {
        try {
            await page.waitForURL(`**${href}`, { timeout: 15000 });
        } catch (err) {
            failFastIfRedirectedToLogin(page);
            throw err;
        }
    }
}


async function sideMenu(page, mainMenu, subMenu) {

    // open hambergurmenu
    await openDashboardMenu(page);

    // Some sidebar entries (e.g. Home, Order Management) are direct links
    // with no submenu, rather than an expandable heading with children.
    if (!subMenu) {
        const directLink = page.getByRole('link', { name: mainMenu, exact: true }).filter({ visible: true });
        await expect(directLink).toBeVisible({ timeout: 15000 });
        await navigateAndWait(page, directLink);
        return;
    }

    // click main menu
    const main = page.getByRole('heading', { name: mainMenu }).filter({ visible: true });
    await expect(main).toBeVisible({ timeout: 15000 });
    await main.click();

    // click submenu
    const sub = page.getByRole('link', { name: subMenu, exact: true }).filter({ visible: true });
    await expect(sub).toBeVisible({ timeout: 15000 });
    await navigateAndWait(page, sub);

}

module.exports = {
    openDashboardMenu,
    sideMenu
};
