const {test, expect} = require('@playwright/test')

const { goToHome } = require('../utils/userlogin');
const { sideMenu } = require('../utils/navigationMenu');



// Load the Oda Admin Login page and Log as administrator
 test.describe('Oda Admin Dashboard Links Check', () => {
    //test.describe.configure({ mode: 'serial' });



    test.beforeEach(async ({ page }) => {
        //await login(page);
        await goToHome(page);
    });
   

    test('1. Home Page load after login', { tag: '@smoke' }, async({page}) => {


        await expect(page).toHaveURL(/home/, { timeout: 10000 });
        await expect(page.locator('h1')).toHaveText('Home');
        console.log('Home page load successfully ' + page.url());
        
    })
    

    /*test('2. Open Dashboard Menu', { tag: '@smoke' }, async({page}) => {

        await page.waitForTimeout(5000);
        await page.locator('svg.lucide-menu').click();
        await expect(page.getByText('ODA Admin', { exact: true })).toBeVisible({ timeout: 10000 });
        //await expect(page.getByText('Sales Rep Management')).toBeVisible();
        console.log ('Dashboard Menu Open');

    })*/

test('3. Sales Rep Activity page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Sales Rep Management', 'Sales Rep Activity');
    await expect(page.locator('h1')).toHaveText('Sales Rep Activity');
    console.log('Sales rep activity page load successfully ' + page.url());

})

test('4. Daily Outlet Plan page load', { tag: '@smoke' }, async({page}) => {

    /*await openDashboardMenu(page);
    await page.getByText('Sales Rep Management', { exact: true }).click();
    await expect (page.getByText('Daily Outlet Plan', { exact: true })).toBeVisible({ timeout: 5000 });
    await page.getByText('Daily Outlet Plan', { exact: true }).click();

    await expect(page.locator('h1')).toHaveText('Daily Outlet Plan');*/

    await sideMenu(page, 'Sales Rep Management', 'Daily Outlet Plan');
    await expect(page.locator('h1')).toHaveText('Daily Outlet Plan');
    console.log('Daily Outlet Plan page load successfully ' + page.url());


})

test('5. Daily loadout page load', { tag: '@smoke' }, async({page}) => {

    /*await openDashboardMenu(page);
    await page.getByText('Sales Rep Management', { exact: true }).click();
    await expect (page.getByText('Daily Loadout', { exact: true })).toBeVisible({ timeout: 5000 });
    await page.getByText('Daily Loadout', { exact: true }).click();

    await expect(page.locator('h1')).toHaveText('Load Out Manager');*/

    await sideMenu(page, 'Sales Rep Management', 'Daily Loadout');
    await expect(page.locator('h1')).toHaveText('Load Out Manager');
    console.log('Daily Loadout page load successfully ' + page.url());

})

test('6. Sales Rep Data Usage page load', { tag: '@smoke' }, async({page}) => {
    

    await sideMenu(page, 'Sales Rep Management', 'Sales Rep Data Usage');
    await expect(page.locator('h1')).toHaveText('Sales Rep Data Usage');
    console.log('Sales Rep Data Usage page load successfully ' + page.url());


})

test('7. Route Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Route Management', 'Route Management');
    await expect(page.locator('h1')).toHaveText('Route Management');
    console.log('Route Management page load successfully ' + page.url());


})

test('8. Route Optimisation page load', { tag: '@smoke' }, async({page}) => {
;
    await sideMenu(page, 'Route Management', 'Route Optimization');
    await expect(page.locator('h1')).toHaveText('Route Optimization');
    console.log('Route Optimization page load successfully ' + page.url());

})

test('9. Pending Outlets page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Outlet Management', 'Pending Outlets');
    await expect(page.locator('h1')).toContainText('Pending Outlets');
    console.log('Pending Outlets page load successfully ' + page.url());

})

test('10. All Outlets page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Outlet Management', 'All Outlets');
    await expect(page.locator('h1')).toContainText('All Outlets');
    console.log('All Outlets page load successfully ' + page.url());

})

test('11. Outlet Archive Requests page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Outlet Management', 'Outlet Archive Requests');
    await expect(page.locator('h1')).toHaveText('Outlet Archive Requests');
    console.log('Outlet Archive Requests page load successfully ' + page.url());

})

test('12. Credit Eligible SKUs page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Credit Management', 'Credit Eligible SKUs');
    await expect(page.locator('h1')).toHaveText('Credit Eligible SKUs');
    console.log('Credit Eligible SKUs page load successfully ' + page.url());


})

test('13. Credit Limits page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Credit Management', 'Credit Limits');
    await expect(page.locator('h1')).toHaveText('Credit Limits');
    console.log('Credit Limits page load successfully ' + page.url());


})

test('14. Credit Utilisation page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Credit Management', 'Credit Utilisation');
    await expect(page.locator('h1')).toHaveText('Credit Utilisation');
    console.log('Credit Utilisation page load successfully ' + page.url());

})

test('15. Promotion Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Promotion Management', 'Promotion Management');
    await expect(page.locator('h1')).toHaveText('Promotion Management');
    console.log('Promotion Management page load successfully ' + page.url());


})

test('16. Splash Alert Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Promotion Management', 'Splash Alert Management');
    await expect(page.locator('h1')).toHaveText('Splash Alert Management');
    console.log('Credit Utilisation page load successfully ' + page.url());

})

test('17. Category Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Product Management', 'Category Management');
    await expect(page.locator('h1')).toHaveText('Category Management');
    console.log('Category Management page load successfully ' + page.url());


})

test('18. Brand Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Product Management', 'Brand Management');
    await expect(page.locator('h1')).toHaveText('Brand Management');
    console.log('Brand Management page load successfully ' + page.url());



})

test('19. Supplier Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Product Management', 'Supplier Management');
    await expect(page.locator('h1')).toHaveText('Supplier Management');
    console.log('Supplier Management page load successfully ' + page.url());



})

test('20. UOM Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Product Management', 'UOM Management');
    await expect(page.locator('h1')).toHaveText('UOM Management');
    console.log('UOM Management page load successfully ' + page.url());



})

// This page renders noticeably slower than the rest, so the h1 assertion
// gets longer than the global 10s. At the moment of failure the sidebar and
// tab title were already done but the page body, h1 included, still hadn't
// drawn - measured at ~12s for the server to respond. The h1 itself is
// correct and reads "Product Management"; it just arrives late.
test('21. Product Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Product Management', 'Product Management');
    await expect(page.locator('h1')).toHaveText('Product Management', { timeout: 30000 });
    console.log('Product Management page load successfully ' + page.url());

})

test('22. Competitor Product Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Product Management', 'Competitor Product Management');
    await expect(page.locator('h1')).toHaveText('Competitor Product Management');
    console.log('Competitor Product Management page load successfully ' + page.url());

})

test('23. Order Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Order Management');
    await expect(page.locator('h1')).toHaveText('Order Management');
    console.log('Order Management page load successfully ' + page.url());


})

test('24. User Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'User Management', 'User Management');
    await expect(page.locator('h1')).toHaveText('User Management');
    console.log('User Management page load successfully ' + page.url());


})

test('25. User Issues page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'User Management', 'User Issue');
    await expect(page.locator('h1')).toHaveText('User Issue');
    console.log('User Issue page load successfully ' + page.url());

})

test('26. Compliance Document Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Content Management', 'Compliance Document Management');
    await expect(page.locator('h1')).toHaveText('Compliance Document Management');
    console.log('Compliance Document Management page load successfully ' + page.url());

})

test('27. Outlet Retention page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Outlet Management', 'Outlet Retention');
    await expect(page.locator('h1')).toHaveText('Outlet Retention');
    console.log('Outlet Retention page load successfully ' + page.url());

})

test('28. Rewards Management page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Rewards Management', 'Rewards Management');
    await expect(page.locator('h1')).toHaveText('Rewards Management');
    console.log('Rewards Management page load successfully ' + page.url());

})

test('29. Rewards Visibility page load', { tag: '@smoke' }, async({page}) => {

    await sideMenu(page, 'Rewards Management', 'Rewards Visibility');
    await expect(page.locator('h1')).toHaveText('Rewards Visibility');
    console.log('Rewards Visibility page load successfully ' + page.url());

})

});


    

