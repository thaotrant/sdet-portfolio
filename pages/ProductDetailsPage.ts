import { Page, Locator } from '@playwright/test';

export class ProductDetailsPage {
  readonly page: Page;
  readonly productName: Locator;
  readonly productCategory: Locator;
  readonly productPrice: Locator;
  readonly productAvailability: Locator;
  readonly productCondition: Locator;
  readonly productBrand: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly cartModal: Locator;
  readonly viewCartInModalLink: Locator;

  constructor(page: Page) {
    this.page = page;
    const info = page.locator('.product-information');
    this.productName = info.locator('h2');
    this.productCategory = info.locator('p', { hasText: 'Category' });
    this.productPrice = info.locator('span span');
    this.productAvailability = info.locator('p', { hasText: 'Availability' });
    this.productCondition = info.locator('p', { hasText: 'Condition' });
    this.productBrand = info.locator('p', { hasText: 'Brand' });
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = info.getByRole('button', { name: /add to cart/i });
    this.cartModal = page.locator('#cartModal');
    this.viewCartInModalLink = page.getByRole('link', { name: /view cart/i });
  }

  async goto(productId: number) {
    await this.page.goto(`/product_details/${productId}`);
  }

  async setQuantity(quantity: number) {
    await this.quantityInput.fill(quantity.toString());
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async openCartFromModal() {
    await this.viewCartInModalLink.click();
  }
}
