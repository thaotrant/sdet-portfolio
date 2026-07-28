import { Page, Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productItems: Locator;
  readonly searchedProductsTitle: Locator;
  readonly viewCartInModalLink: Locator;
  readonly cartModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.productItems = page.locator('.product-image-wrapper');
    this.searchedProductsTitle = page.locator('h2.title.text-center');
    this.viewCartInModalLink = page.getByRole('link', { name: /view cart/i });
    this.cartModal = page.locator('#cartModal');
  }

  async goto() {
    await this.page.goto('/products');
  }

  async searchProduct(name: string) {
    await this.searchInput.fill(name);
    await this.searchButton.click();
  }

  async addFirstProductToCart() {
    await this.productItems.first().hover();
    await this.page.locator('.add-to-cart').first().click();
  }

  async addProductToCartByName(productName: string) {
    const productCard = this.productItems.filter({ hasText: productName }).first();
    await productCard.hover();
    await productCard.locator('a.add-to-cart').first().click();
  }

  async openCartFromModal() {
    await this.viewCartInModalLink.click();
  }
}
