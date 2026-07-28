import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Login / Signup page.
 * Keeps selectors out of test files so tests read like specs, not scripts.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailLoginInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly signupNameInput: Locator;
  readonly signupEmailInput: Locator;
  readonly signupButton: Locator;
  readonly loginErrorMessage: Locator;
  readonly accountInfoHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailLoginInput = page.locator('input[data-qa="login-email"]');
    this.passwordInput = page.locator('input[data-qa="login-password"]');
    this.loginButton = page.locator('button[data-qa="login-button"]');
    this.signupNameInput = page.locator('input[data-qa="signup-name"]');
    this.signupEmailInput = page.locator('input[data-qa="signup-email"]');
    this.signupButton = page.locator('button[data-qa="signup-button"]');
    this.loginErrorMessage = page.locator('p:has-text("incorrect")');
    this.accountInfoHeading = page.locator('text=Enter Account Information');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailLoginInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async startSignup(name: string, email: string) {
    await this.signupNameInput.fill(name);
    await this.signupEmailInput.fill(email);
    await this.signupButton.click();
  }
}
