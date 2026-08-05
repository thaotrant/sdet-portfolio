import { APIResponse } from '@playwright/test';

/**
 * Parses an API response as JSON, failing with a readable diagnostic instead
 * of a cryptic "Unexpected token '<'" when the target returns non-JSON — e.g.
 * an HTML block/challenge page from a WAF instead of the expected API
 * payload. Seen intermittently against public demo APIs when called from
 * CI runner IPs even though the same request succeeds locally.
 *
 * Deliberately checks the body itself rather than the content-type header:
 * automationexercise.com always labels its JSON responses as text/html, so
 * the header can't be used to distinguish a real payload from a block page.
 */
export async function safeJson(response: APIResponse): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Expected JSON response but got non-JSON body ` +
        `(status ${response.status()} ${response.statusText()}) from ${response.url()}.\n` +
        `Body preview: ${text.slice(0, 300)}`,
    );
  }
}
