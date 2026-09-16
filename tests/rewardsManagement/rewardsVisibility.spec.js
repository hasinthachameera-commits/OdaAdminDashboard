const {test, expect} = require('@playwright/test');
const { goToHome } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');

// Selecting a depot on this page opens an outlet picker that starts with
// every outlet pre-selected (its "Select All" switch defaults on). This
// turns it off first so the test can commit a small, controlled number of
// outlets instead of the entire depot's outlet list - important given some
// depots here have 1000+ outlets, and picking the wrong control would
// silently select all of them.
async function addDepotWithOutlets(page, depotDropdown, depotName, outletCount) {
    await depotDropdown.click();
    await page.getByRole('option', { name: depotName, exact: true }).click();

    const modalHeading = page.getByRole('heading', { name: `Select outlets in ${depotName}` });
    await expect(modalHeading).toBeVisible({ timeout: 10000 });

    const selectAllToggle = page.locator('#select-all-outlets');
    await expect(selectAllToggle).toHaveAttribute('aria-checked', 'true');
    await selectAllToggle.click();
    await expect(selectAllToggle).toHaveAttribute('aria-checked', 'false');

    const checkboxes = page.locator('[role="dialog"] input[type="checkbox"]');
    // The list is 1000+ items - turning off Select All has to re-render
    // every one of them unchecked, which lags behind the toggle's own
    // aria-checked flip. Wait for that re-render to actually reach the
    // DOM before checking individual boxes, otherwise .check() below can
    // find them still (visually) checked and treat them as already
    // satisfying the target state, silently doing nothing.
    await expect(checkboxes.first()).not.toBeChecked();

    for (let i = 0; i < outletCount; i++) {
        await checkboxes.nth(i).check();
    }

    const checkedCount = page.locator('[role="dialog"] input[type="checkbox"]:checked');
    await expect(checkedCount).toHaveCount(outletCount);

    await page.getByRole('button', { name: 'Done' }).click();
    await expect(modalHeading).not.toBeVisible({ timeout: 10000 });
}

async function verifySelectedOutletCount(page, depotName, expectedCount) {
    const depotBlock = page.locator('p', { hasText: depotName }).locator('..').locator('..');
    const chips = depotBlock.locator('.flex.flex-wrap.gap-2 > span');
    await expect(chips).toHaveCount(expectedCount);
}

test.beforeEach(async ({ page }) => {
    await goToHome(page);
    await sideMenu(page, 'Rewards Management', 'Rewards Visibility');
});

// Goal: prove the full Rewards Visibility flow works end to end for the
// North region - adding two depots (Kano 1 and Sokoto 1, both previously
// unconfigured so this doesn't touch the large existing Kano 2 / Sokoto 2
// outlet lists), picking exactly 5 outlets for each, and saving via
// Update. This is a real, deliberately small and scoped write to the live
// UAT data - proving both that the outlet picker correctly commits a
// partial selection (not "all or nothing"), and that Update actually
// persists the change.
test('1. Rewards Visibility - Add depots with selected outlets under North region and save', async ({ page }) => {

    // Lagos is the first region block on the page, North the second - the
    // "Select depot" combobox at that position belongs to North.
    // Using a text-content filter rather than getByRole(..., { name }) -
    // this app's Select-trigger buttons don't expose "Select depot" as
    // their computed accessible name even though it's the visible text.
    const northDepotDropdown = page.locator('button[role="combobox"]').filter({ hasText: 'Select depot' }).nth(1);

    await addDepotWithOutlets(page, northDepotDropdown, 'Kano 1', 5);
    await verifySelectedOutletCount(page, 'Kano 1', 5);

    await addDepotWithOutlets(page, northDepotDropdown, 'Sokoto 1', 5);
    await verifySelectedOutletCount(page, 'Sokoto 1', 5);

    await page.getByRole('button', { name: 'Update' }).click();

    // The success toast has both a title ("Success!") and a body message
    // containing "successfully" - a loose /success/i match hits both.
    await expect(page.getByText('Success!', { exact: true })).toBeVisible({ timeout: 10000 });

});
