const { expect } = require('@playwright/test');

/**
 * Selects an option from a labeled combobox/dropdown filter and waits
 * until the dropdown reflects the selected value.
 *
 * Consolidates the pattern that was previously duplicated as
 * selectCategory / selectRegion / selectUserRole / selectOutletStatus /
 * selectStatus / the inline brand-dropdown logic across multiple spec files.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} labelText - Visible label text next to the combobox (e.g. 'Region', 'Status', 'Category', 'Role', 'Brand')
 * @param {string} optionName - Visible text of the option to select
 * @param {{ exact?: boolean }} [options]
 */
async function selectDropdownOption(page, labelText, optionName, { exact = true } = {}) {
    const dropdown = page.getByText(labelText).locator('..').getByRole('combobox');
    await expect(dropdown).toBeVisible();
    await dropdown.click();

    const option = page.getByRole('option', { name: optionName, exact });
    await expect(option).toBeVisible();
    await option.click();

    // wait until dropdown reflects the selected value
    await expect(dropdown).toContainText(optionName);
}

module.exports = {
    selectDropdownOption
};

