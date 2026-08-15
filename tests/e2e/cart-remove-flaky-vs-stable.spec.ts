import { test, expect } from '@playwright/test';
import { ProductsPage } from '../../pages/ProductsPage';
import { CartPage } from '../../pages/CartPage';

/**
 * Demo: fixed wait + one-shot check (flaky) vs Playwright auto-retrying
 * assertion (stable), under variable network latency.
 * Run with --repeat-each to see the difference:
 *   npx playwright test tests/e2e/cart-remove-flaky-vs-stable.spec.ts --repeat-each=10
 */
test.describe('Remove from cart: flaky wait vs stable auto-wait', () => {
  test.beforeEach(async ({ page }) => {
    // Simulate variable server latency (0-1500ms) on the delete request that
    // fires after the click, before the row actually disappears from the DOM.
    await page.route('**/delete_cart_item/**', async (route) => {
      const delay = Math.random() * 1500;
      await new Promise((resolve) => setTimeout(resolve, delay));
      await route.continue();
    });
  });

  test('FLAKY: removeProduct() + one-shot check', async ({ page }) => {
    // Intentionally flaky by design (fixed 1000ms wait racing 0-1500ms
    // injected latency) — skipped in CI so it can't flip the merge gate red.
    // Run it locally to see the point: npx playwright test tests/e2e/cart-remove-flaky-vs-stable.spec.ts --repeat-each=10
    test.skip(!!process.env.CI, 'Intentionally flaky demo test — not part of the CI gate');

    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await productsPage.goto();
    await productsPage.addProductToCartByName('Sleeveless Dress');
    await productsPage.openCartFromModal();

    // removeProduct() clicks, then waits a fixed 1000ms assuming that's
    // "enough time" for the row to disappear.
    await cartPage.removeProduct('Sleeveless Dress');

    // One-shot check, no retry: fails whenever the real delete_cart_item
    // response took longer than the fixed 1000ms wait.
    const remaining = await cartPage.getCartRows().filter({ hasText: 'Sleeveless Dress' }).count();
    expect(remaining).toBe(0);
  });

  test('STABLE: removeProductStable() + auto-retrying assertion', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await productsPage.goto();
    await productsPage.addProductToCartByName('Sleeveless Dress');
    await productsPage.openCartFromModal();
    //await page.pause();

    // removeProductStable() only clicks - no fixed wait.
    await cartPage.removeProductStable('Sleeveless Dress');   

    // Web-first assertion: polls until the row is gone (or times out),
    // so it absorbs the same 0-1500ms injected latency *plus* the live
    // site's own baseline latency, without hard-coding a number.
    await expect(cartPage.getCartRows().filter({ hasText: 'Sleeveless Dress' })).toHaveCount(0, {
      timeout: 8000,
    });
  });
});
