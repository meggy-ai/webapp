import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Custom render function that wraps components with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any custom options here
}

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Add any providers here (e.g., Theme, Context, etc.) */}
      {children}
    </>
  )
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Override render method
export { customRender as render }

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    const result = await condition()
    if (result) return
    
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error(`Timeout waiting for condition after ${timeout}ms`)
}

/**
 * Mock timer data generator
 */
export function createMockTimer(overrides = {}) {
  return {
    id: 'timer-test-' + Math.random().toString(36).substr(2, 9),
    name: 'Test Timer',
    duration_seconds: 600,
    end_time: new Date(Date.now() + 600000).toISOString(),
    status: 'active',
    time_remaining: 600,
    time_remaining_display: '00:10:00',
    three_minute_warning_sent: false,
    completion_notification_sent: false,
    ...overrides,
  }
}

/**
 * Mock API response helper
 */
export function mockApiResponse(data: any, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  })
}

/**
 * Mock fetch for API calls
 */
export function setupMockFetch() {
  global.fetch = jest.fn()
  return global.fetch
}

/**
 * Clear all mocks
 */
export function clearAllMocks() {
  jest.clearAllMocks()
  jest.clearAllTimers()
}
