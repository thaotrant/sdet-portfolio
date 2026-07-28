import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the site homepage.
 * Encapsulates top-nav entry points commonly used by E2E flows.
 */
export class Homepage {
  readonly page: Page;
  readonly homeNavLink: Locator;
  readonly productsNavLink: Locator;
  readonly cartNavLink: Locator;
  readonly loginSignupNavLink: Locator;
  readonly loggedInAsLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.homeNavLink = page.locator('a[href="/"]');
    this.productsNavLink = page.locator('a[href="/products"]');
    this.cartNavLink = page.locator('a[href="/view_cart"]');
    this.loginSignupNavLink = page.locator('a[href="/login"]');
    this.loggedInAsLabel = page.locator('li:has-text("Logged in as")');
  }

  async goto() {
    await this.page.goto('/');
  }

  async openProducts() {
    await this.productsNavLink.click();
  }

  async openCart() {
    await this.cartNavLink.click();
  }

  async openLoginSignup() {
    await this.loginSignupNavLink.click();
  }

  async addProductToCart(productName: string) {
    const productCard = this.page.locator('.product-image-wrapper').filter({ hasText: productName }).first();
    await productCard.hover();
    await productCard.locator('a.add-to-cart').first().click();
  }
}
