const {test, expect} = require('@playwright/test');
const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');

test('1. Daily Outlet Plan - Verify the day filter default value Monday', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Sales Rep Management', 'Daily Outlet Plan');
    //Day filter default value
    const dayDropdown = page.getByText('Day').locator('..').getByRole('combobox');
    await expect(dayDropdown).toBeVisible();
    await expect(dayDropdown).toContainText('Monday');
    
});

test('2. Daily Outlet Plan - Verify the record availablility and open the popup using action button', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Sales Rep Management', 'Daily Outlet Plan');
    //verify the record availability
    const row = page.getByRole('row', { name: /SALIHU.*HASIMU.*Sales Representative.*Middle Belt.*Bauchi/i });
    await expect(row).toBeVisible();
    //locate and click on the action button
    const actionBtn = row.locator('svg.lucide-ellipsis-vertical');
    await actionBtn.click();
    //click on edit option
    await page.getByText('View Daily Route', { exact: true }).click();

    // Verify popup is opened
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    //Verify popup title
    await expect(dialog.getByText(/Monday Outlets -> SALIHU HASIMU/i)).toBeVisible();

    //close the popup
    await dialog.getByRole('button', { name: 'Close' }).last().click();
    await expect(dialog).not.toBeVisible();

    
});