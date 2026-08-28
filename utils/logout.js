const { expect } = require('@playwright/test');

async function logout(page) {

    // user avatar icon (stable selector)
    const userIcon = page.locator(
        'span.relative.flex.h-8.w-8.rounded-full'
    );

    await expect(userIcon).toBeVisible({ timeout: 10000 });
    await userIcon.click();

    // logout button (adjust if label differs in your UI)
    const logoutBtn = page.getByRole('button', { name: /logout/i });

    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    await logoutBtn.click();

    // confirm redirected to login
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
}

module.exports = { logout };