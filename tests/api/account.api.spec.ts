import { test, expect } from '@playwright/test';
import userData from '../../test-data/users.json';
import { env } from '../../config/env';

/**
 * Covers the account lifecycle documented at /api_list:
 * createAccount -> verifyLogin -> deleteAccount.
 * Each test creates and cleans up its own data (no shared state between tests).
 */
test.describe('Account API lifecycle', () => {
  test('verifyLogin fails for a non-existent user (negative case)', async ({ request }) => {
    const response = await request.post('/api/verifyLogin', {
      form: {
        email: userData.invalidUser.email,
        password: userData.invalidUser.password,
      },
    });
    const body = await response.json();
    expect(body.responseCode).toBe(404);
    expect(body.message).toContain('User not found');
  });

  test('createAccount then verifyLogin then deleteAccount (full lifecycle)', async ({ request }) => {
    const uniqueEmail = `${userData.newUserTemplate.email_prefix}${Date.now()}@example.com`;

    // 1. Create account
    const createAccountRequestBody = {
      ...userData.newUserTemplate,      
      email: uniqueEmail,
      password: env.testUserPassword,
      address1: userData.newUserTemplate.address1,
    };
    //console.log('createAccount request body:', createAccountRequestBody);

    const createResponse = await request.post('/api/createAccount', {
      form: createAccountRequestBody,
    });
    const createBody = await createResponse.json();
    //console.log('createAccount response body:', createBody);

    expect(createBody.responseCode).toBe(201);

    // 2. Verify the new account can log in
    const loginResponse = await request.post('/api/verifyLogin', {
      form: { email: uniqueEmail, password: env.testUserPassword },
    });
    const loginBody = await loginResponse.json();
    expect(loginBody.responseCode).toBe(200);
    expect(loginBody.message).toContain('exists');

    // 3. Clean up — delete the account so repeated test runs stay idempotent
    const deleteResponse = await request.delete('/api/deleteAccount', {
      form: { email: uniqueEmail, password: env.testUserPassword },
    });
    const deleteBody = await deleteResponse.json();
    expect(deleteBody.responseCode).toBe(200);
  });
  
  test('deleteAccount fails for a non-existent email (negative case)', async ({ request }) => {
    const nonExistentEmail = `not-exist-${Date.now()}@example.com`;

    const response = await request.delete('/api/deleteAccount', {
      form: {
        email: nonExistentEmail,
        password: env.testUserPassword,
      },
    });
    const body = await response.json();
    
    expect(body.responseCode).toBe(404);
    expect(body.message.toLowerCase()).toContain('not found');
  });

});
