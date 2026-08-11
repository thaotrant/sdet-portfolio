import { APIResponse } from '@playwright/test';

export interface JsonResult {
  response: APIResponse;
  body: any;
}

/**
 * Issues an API request and parses the body as JSON, retrying the request
 * itself (not just the parse) when the body isn't valid JSON. Guards against
 * automationexercise.com occasionally returning a transient HTML block/reload
 * page instead of its real JSON payload — seen intermittently from CI runner
 * IPs even though the same request succeeds locally or moments later.
 *
 * Takes a thunk rather than an already-fetched response because retrying
 * requires re-issuing the HTTP call; parsing alone can't recover from a bad
 * response that already happened.
 *
 * Checks the body itself rather than the content-type header:
 * automationexercise.com always labels its JSON responses as text/html, so
 * the header can't be used to distinguish a real payload from a block page.
 */
export async function fetchJson(
  makeRequest: () => Promise<APIResponse>,
  { retries = 2, delayMs = 1500 }: { retries?: number; delayMs?: number } = {},
): Promise<JsonResult> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await makeRequest();
    const text = await response.text();
    try {
      return { response, body: JSON.parse(text) };
    } catch {
      lastError = new Error(
        `Expected JSON response but got non-JSON body ` +
          `(status ${response.status()} ${response.statusText()}) from ${response.url()}.\n` +
          `Body preview: ${text.slice(0, 300)}`,
      );
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}
