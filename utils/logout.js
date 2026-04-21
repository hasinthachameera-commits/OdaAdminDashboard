const { expect } = require('@playwright/test');

async function logout(page) {

    // click user profile
    const userProfile = page.locator('span:has-text("Surajudeen")');

    await expect(userProfile).toBeVisible({ timeout: 10000 });
    await userProfile.click();

    // click logout button
    const logoutBtn = page.getByRole('button', { name: /logout/i });

    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    await logoutBtn.click();

    // verify back to login page
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
}

module.exports = { logout };