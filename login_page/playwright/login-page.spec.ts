import { expect, test } from '@playwright/test';

test.describe('Login page motion', () => {
  test('form enters and buttons respond to hover', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const mainClasses = await page.locator('main').evaluate((el) => Array.from(el.classList));
    expect(mainClasses.some((cls) => cls.includes('pageLoaded'))).toBeTruthy();

    const primaryButton = page.getByRole('button', { name: 'Continue with Loomis Account' });
    await expect(primaryButton).toBeVisible();

    const baseShadow = await primaryButton.evaluate((el) => getComputedStyle(el).boxShadow);
    await primaryButton.hover();
    await page.waitForTimeout(220);
    const hoverShadow = await primaryButton.evaluate((el) => getComputedStyle(el).boxShadow);

    test.info().annotations.push({ type: 'shadow-before', description: baseShadow });
    test.info().annotations.push({ type: 'shadow-after', description: hoverShadow });

    expect(hoverShadow).not.toEqual(baseShadow);
  });
});
