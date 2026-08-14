import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartNavLink: Locator;
  readonly cartTable: Locator;
  readonly removeButtons: Locator;
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartNavLink = page.locator('a[href="/view_cart"]');
    this.cartTable = page.locator('.cart_info');
    this.removeButtons = page.locator('.cart_quantity_delete');
    this.emptyCartMessage = page.locator('#empty_cart, .cart_empty, p:has-text("Cart is empty")');
  }

  async goto() {
    await this.page.goto('/view_cart');
  }

  async openCart() {
    await this.cartNavLink.click();
  }

  getCartRows(): Locator {
    return this.page.locator('.cart_info tbody tr');
  }

  async removeFirstProduct() {
    await this.removeButtons.first().click();
  }

  // Flaky on purpose: click, then assume 1s is "enough time" for the row to disappear.
  async removeProduct(name: string) {
    const row = this.getCartRows().filter({ hasText: name }).first();
    await row.locator('.cart_quantity_delete').click();
    await this.page.waitForTimeout(1000);
  }

  // Stable: relies on Playwright's auto-waiting instead of a fixed timeout.
  async removeProductStable(name: string) {
    const row = this.getCartRows().filter({ hasText: name }).first();
    await row.locator('.cart_quantity_delete').click();
  }

  async isCartEmpty(): Promise<boolean> {
    const rowCount = await this.getCartRows().count();
    if (rowCount === 0) {
      return true;
    }

    return await this.emptyCartMessage.first().isVisible();
  }
  
}
 