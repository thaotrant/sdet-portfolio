import { test, expect } from '@playwright/test';

/**
 * API layer tests — fastest, most stable layer of the pyramid.
 * Covers documented endpoints from https://automationexercise.com/api_list
 */
test.describe('Products API', () => {
  test('GET /api/productsList returns 200 and a product array', async ({ request }) => {
    const response = await request.get('/api/productsList');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('POST /api/productsList is not supported (405) — negative/method test', async ({ request }) => {
    const response = await request.post('/api/productsList');
    const body = await response.json();
    // API documents this as a 200-wrapped 405 message rather than an HTTP 405 —
    // asserting on the documented responseCode/message, not just HTTP status.
    expect(body.responseCode).toBe(405);
    expect(body.message).toContain('not supported');
  });

  test('POST /api/searchProduct returns matching products', async ({ request }) => {
    const response = await request.post('/api/searchProduct', {
      form: { search_product: 'top' },
    });
    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBeTruthy();
  });

  test('POST /api/searchProduct without param returns a bad-request message', async ({ request }) => {
    const response = await request.post('/api/searchProduct', { form: {} });
    const body = await response.json();
    expect(body.responseCode).toBe(400);
    expect(body.message.toLowerCase()).toContain('missing');
  });

  test('GET /api/brandsList returns 200 and a brand array', async ({ request }) => {
    const response = await request.get('/api/brandsList');
    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.brands)).toBeTruthy();
  });
});
