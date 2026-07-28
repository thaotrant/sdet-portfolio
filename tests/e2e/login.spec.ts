import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import userData from '../../test-data/users.json';

/**
 * E2E UI layer — deliberately kept small (test pyramid: only critical journeys here).
 * Login/signup entry point was chosen because it gates every other user journey
 * (cart, checkout, account) — highest-risk shared dependency in the app.
 */
test.describe('Login page (E2E)', () => {
  test('shows an error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(userData.invalidUser.email, userData.invalidUser.password);

    await expect(loginPage.loginErrorMessage).toBeVisible();
  });

  test('signup form accepts a new name/email and proceeds to account info step', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const uniqueEmail = `sdet.portfolio.${Date.now()}@example.com`;
    await loginPage.startSignup('QA Portfolio Tester', uniqueEmail);

    // Site navigates to an "Enter Account Information" step on success
    await expect(loginPage.accountInfoHeading).toBeVisible();
  });
});
