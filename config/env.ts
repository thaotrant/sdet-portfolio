import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

/**
 * Single, typed source of truth for environment configuration.
 *
 * Test code must never read process.env directly. Everything is read and
 * validated once, here, at startup — so a missing or malformed value fails
 * the run immediately with a readable message, instead of surfacing later as
 * something opaque like `navigate to "undefined/login"`.
 */

const KNOWN_ENVIRONMENTS = ['production', 'staging', 'local'] as const;
type Environment = (typeof KNOWN_ENVIRONMENTS)[number];

/** Reads a var, falling back when unset or blank. */
function read(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value.trim() : fallback;
}

function asUrl(key: string, value: string): string {
  try {
    new URL(value);
  } catch {
    throw new Error(
      `Invalid ${key}: "${value}" is not a valid URL. Check your .env file.`,
    );
  }
  return value.replace(/\/+$/, ''); // strip trailing slash so path joins stay predictable
}

function asEnvironment(value: string): Environment {
  if (!(KNOWN_ENVIRONMENTS as readonly string[]).includes(value)) {
    throw new Error(
      `Invalid TEST_ENV: "${value}". Expected one of: ${KNOWN_ENVIRONMENTS.join(', ')}.`,
    );
  }
  return value as Environment;
}

export const env = {
  /** Which environment the run is targeting. Surfaced in reports. */
  environment: asEnvironment(read('TEST_ENV', 'production')),

  /** Target host for both API and E2E layers. */
  baseURL: asUrl('BASE_URL', read('BASE_URL', 'https://automationexercise.com')),

  /**
   * Password used for the throwaway accounts the API lifecycle test creates
   * and deletes. Non-secret against this public practice site — it lives in
   * env so a real project swaps it for a CI secret without touching code.
   */
  testUserPassword: read('TEST_USER_PASSWORD', 'TestPass123!'),

  isCI: process.env.CI !== undefined && process.env.CI !== '',
} as const;
