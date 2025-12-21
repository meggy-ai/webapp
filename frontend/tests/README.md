# Frontend Testing - README

## 🚀 Quick Start

### Running Tests

```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# Run all tests (unit + E2E)
npm run test:all
```

## 📁 Test Structure

```
tests/
├── unit/                    # Unit tests (Jest + React Testing Library)
│   ├── components/          # Component tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests
├── e2e/                    # End-to-end tests (Playwright)
├── fixtures/               # Test data and fixtures
│   ├── timer-data.ts       # Mock timer data
│   ├── auth-helpers.ts     # Authentication helpers
│   └── websocket-mock.ts   # WebSocket mock server
└── utils/                  # Test utilities
    ├── test-utils.tsx      # React Testing Library helpers
    └── playwright-helpers.ts # Playwright helpers
```

## 🧪 Test Types

### Unit Tests
- Test individual components in isolation
- Fast execution
- Use Jest + React Testing Library
- Located in `tests/unit/`

### Integration Tests
- Test component interactions
- Test API integration
- Located in `tests/integration/`

### E2E Tests
- Test complete user flows
- Test across different browsers
- Use Playwright
- Located in `tests/e2e/`

## 📝 Writing Tests

### Unit Test Example

```typescript
import { render, screen } from '@/tests/utils/test-utils';
import TimerDisplay from '@/components/chat/TimerDisplay';

describe('TimerDisplay', () => {
  it('should render empty state', () => {
    render(<TimerDisplay />);
    expect(screen.getByText(/no active timers/i)).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';
import { createTimerViaDialog } from '@/tests/utils/playwright-helpers';

test('create timer via dialog', async ({ page }) => {
  await page.goto('/chat');
  await createTimerViaDialog(page, 'Focus Session', 25);
  await expect(page.locator('text=Focus Session')).toBeVisible();
});
```

## 🛠️ Available Helpers

### Playwright Helpers
- `waitForElement()` - Wait for element to be visible
- `fillForm()` - Fill form fields
- `mockAPI()` - Mock API endpoints
- `createTimerViaDialog()` - Create timer through UI
- `clickTimerButton()` - Interact with timer buttons
- `sendChatMessage()` - Send chat messages

### Authentication Helpers
- `loginViaUI()` - Login through UI
- `loginViaAPI()` - Login via API (faster)
- `setMockAuth()` - Set mock authentication
- `isAuthenticated()` - Check authentication status

### WebSocket Mock
- `MockWebSocketServer` - Mock WebSocket server
- `sendTimerUpdate()` - Send timer update event
- `sendTimerWarning()` - Send timer warning event
- `sendTimerCompleted()` - Send completion event

## 🎯 Phase 1 Complete ✅

All infrastructure is set up and ready for test implementation:
- ✅ Testing dependencies installed
- ✅ Configuration files created
- ✅ Test fixtures available
- ✅ Helper utilities ready
- ✅ Test scripts added to package.json

## 📚 Next Steps

Ready to implement actual tests! Start with:
1. Phase 2: Component Unit Tests
2. Phase 3: E2E Functional Tests (highest priority)

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
