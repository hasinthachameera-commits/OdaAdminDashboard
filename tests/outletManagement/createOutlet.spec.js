const {test, expect} = require('@playwright/test');
const { login } = require('../../utils/userlogin');
const { sideMenu } = require('../../utils/navigationMenu');


test('1. Outlet Management - Create Outlet option visible', async ({ page }) => {

    await login(page);
    await sideMenu(page, 'Outlet Management', 'All Outlets');
    const createOutletBtn = page.getByRole('button', { name: 'create outlet' });
    await expect(createOutletBtn).toBeVisible();
    await createOutletBtn.click();
    // verify the create outlet popup is open
    const sidebarText = page.getByText('Review all the following steps and confirm that everything is correct');
    await expect(sidebarText).toBeVisible({ timeout: 10000 }); 

});

