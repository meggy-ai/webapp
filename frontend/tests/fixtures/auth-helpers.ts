/**
 * Authentication helpers for testing
 */

import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  name: string;
}

export const testUsers = {
  default: {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User',
  },
  
  secondary: {
    email: 'test2@example.com',
    password: 'testpassword456',
    name: 'Test User 2',
  },
};

/**
 * Mock authentication tokens
 */
export const mockAuthTokens = {
  accessToken: 'mock-access-token-' + Math.random().toString(36).substr(2, 9),
  refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substr(2, 9),
};

/**
 * Set authentication tokens in localStorage
 */
export function setMockAuth(page: Page) {
  return page.evaluate(({ accessToken, refreshToken }) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }, mockAuthTokens);
}

/**
 * Clear authentication tokens from localStorage
 */
export function clearMockAuth(page: Page) {
  return page.evaluate(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  });
}

/**
 * Login user via UI (for E2E tests)
 */
export async function loginViaUI(page: Page, user: TestUser = testUsers.default) {
  await page.goto('/auth/login');
  
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to chat page
  await page.waitForURL('/chat', { timeout: 10000 });
}

/**
 * Login user via API (faster for setup)
 */
export async function loginViaAPI(page: Page, user: TestUser = testUsers.default) {
  const response = await page.request.post('/api/auth/login/', {
    data: {
      email: user.email,
      password: user.password,
    },
  });
  
  if (response.ok()) {
    const data = await response.json();
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    }, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });
  } else {
    throw new Error(`Login failed: ${response.status()}`);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  return !!token;
}

/**
 * Logout user
 */
export async function logout(page: Page) {
  await clearMockAuth(page);
  await page.goto('/auth/login');
}

/**
 * Mock API authentication middleware for tests
 */
export function mockAuthMiddleware() {
  return {
    beforeEach: async ({ page }) => {
      await page.route('**/api/**', (route) => {
        const headers = route.request().headers();
        
        // Add mock authorization header if not present
        if (!headers['authorization']) {
          headers['authorization'] = `Bearer ${mockAuthTokens.accessToken}`;
        }
        
        route.continue({ headers });
      });
    },
  };
}
