import { test, expect } from '@playwright/test';
import { fetchJson } from '../../utils/api-response';

/**
 * API layer tests — fastest, most stable layer of the pyramid.
 * Covers documented endpoints from https://automationexercise.com/api_list
 */
test.describe('Products API', () => {
  test('GET /api/productsList returns 200 and a product array', async ({ request }) => {
    const { response, body } = await fetchJson(() => request.get('/api/productsList'));
    expect(response.status()).toBe(200);
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('POST /api/productsList is not supported (405) — negative/method test', async ({ request }) => {
    const { body } = await fetchJson(() => request.post('/api/productsList'));
    // API documents this as a 200-wrapped 405 message rather than an HTTP 405 —
    // asserting on the documented responseCode/message, not just HTTP status.
    expect(body.responseCode).toBe(405);
    expect(body.message).toContain('not supported');
  });

  test('POST /api/searchProduct returns matching products', async ({ request }) => {
    const { body } = await fetchJson(() =>
      request.post('/api/searchProduct', { form: { search_product: 'top' } }),
    );
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBeTruthy();
  });

  test('POST /api/searchProduct without param returns a bad-request message', async ({ request }) => {
    const { body } = await fetchJson(() => request.post('/api/searchProduct', { form: {} }));
    expect(body.responseCode).toBe(400);
    expect(body.message.toLowerCase()).toContain('missing');
  });

  test('GET /api/searchProduct is not supported (405) — negative/method test', async ({ request }) => {
    const { body } = await fetchJson(() => request.get('/api/searchProduct'));
    expect(body.responseCode).toBe(405);
    expect(body.message).toContain('not supported');
  });

  test('POST /api/searchProduct with empty string returns all products (empty filter matches everything)', async ({
    request,
  }) => {
    const { body } = await fetchJson(() =>
      request.post('/api/searchProduct', { form: { search_product: '' } }),
    );
    // An empty string is still a present param (unlike the missing-param case above),
    // so the API treats it as a no-op filter instead of a 400.
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBeGreaterThan(0);
    // `message` only appears on the error path (see 400 test above); success
    // responses don't carry one.
    expect(body.message).toBeUndefined();
  });

  test('POST /api/searchProduct with all-space string returns 200 with no matches', async ({ request }) => {
    const { body } = await fetchJson(() =>
      request.post('/api/searchProduct', { form: { search_product: '   ' } }),
    );
    // Whitespace is a valid (non-empty) param, so it's a real search term —
    // no product name contains it, so the result is an empty match list, not an error.
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBe(0);
    expect(body.message).toBeUndefined();
  });

  test('POST /api/searchProduct with a very long search term returns 200 with no matches', async ({
    request,
  }) => {
    const longSearchTerm = 'a'.repeat(500);
    const { body } = await fetchJson(() =>
      request.post('/api/searchProduct', { form: { search_product: longSearchTerm } }),
    );
    // No product name is anywhere near 500 chars long, so this is just an
    // ordinary no-match search — asserting the API doesn't error/truncate/crash on it.
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBeTruthy();
    expect(body.products.length).toBe(0);
    expect(body.message).toBeUndefined();
  });

  test('GET /api/brandsList returns 200 and a brand array', async ({ request }) => {
    const { body } = await fetchJson(() => request.get('/api/brandsList'));
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.brands)).toBeTruthy();
  });
});
