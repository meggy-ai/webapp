/**
 * Playwright helper utilities for E2E testing
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for element to be visible with custom timeout
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10000
) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
  return page.locator(selector);
}

/**
 * Wait for element to disappear
 */
export async function waitForElementToDisappear(
  page: Page,
  selector: string,
  timeout = 10000
) {
  await page.waitForSelector(selector, { state: 'hidden', timeout });
}

/**
 * Fill form and submit
 */
export async function fillForm(
  page: Page,
  fields: Record<string, string>,
  submitButtonSelector?: string
) {
  for (const [selector, value] of Object.entries(fields)) {
    await page.fill(selector, value);
  }
  
  if (submitButtonSelector) {
    await page.click(submitButtonSelector);
  }
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
) {
  return page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  fullPage = false
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage,
  });
}

/**
 * Mock API endpoint
 */
export async function mockAPI(
  page: Page,
  method: string,
  urlPattern: string | RegExp,
  response: any,
  statusCode = 200
) {
  await page.route(urlPattern, (route) => {
    if (route.request().method() === method) {
      route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    } else {
      route.continue();
    }
  });
}

/**
 * Mock all timer API endpoints
 */
export async function mockTimerAPIs(page: Page) {
  // Mock get active timers
  await mockAPI(page, 'GET', '**/api/timers/active/', []);
  
  // Mock create timer
  await mockAPI(page, 'POST', '**/api/timers/', {
    id: 'test-timer-1',
    name: 'Test Timer',
    duration_seconds: 600,
    status: 'active',
  }, 201);
  
  // Mock pause timer
  await mockAPI(page, 'POST', '**/api/timers/*/pause/', {
    message: 'Timer paused',
  });
  
  // Mock resume timer
  await mockAPI(page, 'POST', '**/api/timers/*/resume/', {
    message: 'Timer resumed',
  });
  
  // Mock cancel timer
  await mockAPI(page, 'POST', '**/api/timers/*/cancel/', {
    message: 'Timer cancelled',
  });
  
  // Mock cancel all timers
  await mockAPI(page, 'POST', '**/api/timers/cancel_all/', {
    message: 'All timers cancelled',
  });
}

/**
 * Check if timer is displayed
 */
export async function isTimerDisplayed(
  page: Page,
  timerName: string
): Promise<boolean> {
  try {
    await page.waitForSelector(`text=${timerName}`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get timer countdown text
 */
export async function getTimerCountdown(
  page: Page,
  timerName: string
): Promise<string> {
  const timerCard = page.locator(`text=${timerName}`).locator('..').locator('..');
  const countdown = timerCard.locator('.font-mono');
  return countdown.textContent() || '';
}

/**
 * Click timer button (pause/resume/cancel)
 */
export async function clickTimerButton(
  page: Page,
  timerName: string,
  buttonType: 'pause' | 'resume' | 'cancel'
) {
  const timerCard = page.locator(`text=${timerName}`).locator('..').locator('..');
  
  let buttonLocator;
  if (buttonType === 'pause') {
    buttonLocator = timerCard.locator('button:has-text("Pause"), button:has(svg[class*="lucide-pause"])');
  } else if (buttonType === 'resume') {
    buttonLocator = timerCard.locator('button:has-text("Resume"), button:has(svg[class*="lucide-play"])');
  } else if (buttonType === 'cancel') {
    buttonLocator = timerCard.locator('button:has-text("Cancel"), button:has(svg[class*="lucide-x"])');
  }
  
  await buttonLocator?.click();
}

/**
 * Create timer via dialog
 */
export async function createTimerViaDialog(
  page: Page,
  name: string,
  minutes: number
) {
  // Click "New Timer" button
  await page.click('button:has-text("New Timer")');
  
  // Wait for dialog to open
  await waitForElement(page, 'input#timer-name');
  
  // Fill in timer details
  await page.fill('input#timer-name', name);
  await page.fill('input#timer-duration', minutes.toString());
  
  // Click create button
  await page.click('button:has-text("Create Timer")');
  
  // Wait for dialog to close
  await page.waitForSelector('input#timer-name', { state: 'hidden', timeout: 5000 });
}

/**
 * Send chat message
 */
export async function sendChatMessage(page: Page, message: string) {
  await page.fill('input[type="text"][placeholder*="message"], textarea[placeholder*="message"]', message);
  await page.click('button[type="submit"], button:has(svg[class*="lucide-send"])');
}

/**
 * Wait for chat response
 */
export async function waitForChatResponse(page: Page, timeout = 10000) {
  // Wait for loading indicator to appear and disappear
  try {
    await page.waitForSelector('[class*="animate-spin"]', { state: 'visible', timeout: 2000 });
    await page.waitForSelector('[class*="animate-spin"]', { state: 'hidden', timeout });
  } catch {
    // Loading indicator might be too fast, that's okay
  }
}

/**
 * Assert element is visible
 */
export async function assertVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeVisible();
}

/**
 * Assert element has text
 */
export async function assertHasText(page: Page, selector: string, text: string | RegExp) {
  await expect(page.locator(selector)).toContainText(text);
}

/**
 * Assert element count
 */
export async function assertCount(page: Page, selector: string, count: number) {
  await expect(page.locator(selector)).toHaveCount(count);
}

/**
 * Get all timer cards count
 */
export async function getTimerCount(page: Page): Promise<number> {
  const timers = page.locator('[data-testid="timer-card"], .timer-card, div:has(> button:has(svg[class*="lucide-pause"]))');
  return timers.count();
}

/**
 * Wait for network idle (no pending requests)
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}
