import { test, expect } from '@playwright/test';
import { ProductsPage } from '../../pages/ProductsPage';
import { CartPage } from '../../pages/CartPage';

test.describe('Product search and cart (E2E)', () => {
  test('searching for a product shows matching results', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    await productsPage.searchProduct('Top');

    await expect(productsPage.searchedProductsTitle).toHaveText(/searched products/i);
    await expect(productsPage.productItems.first()).toBeVisible();
  });

  test('add first product to cart shows confirmation modal', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    await productsPage.addFirstProductToCart();

    await expect(productsPage.cartModal).toBeVisible();
  });

  test('Case 17: Removing a product from the cart updates the cart count', async ({ page }) => {
    const productPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    await productPage.goto();

    async function removeProductFromCartByName(productName: string) {
      await productPage.addProductToCartByName(productName);
      await expect(productPage.cartModal).toBeVisible();

      // Open the cart directly from the modal
      await productPage.openCartFromModal();

      // Remove the target product and verify cart state via CartPage methods
      await cartPage.removeProduct(productName);
      await expect.poll(async () => cartPage.isCartEmpty()).toBe(true);
    }

    await removeProductFromCartByName('Sleeveless Dress');
  });
});
