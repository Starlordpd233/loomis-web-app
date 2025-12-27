# Testing Guide

## Test Framework

We use:
- **Vitest** for unit testing
- **Playwright** for end-to-end (E2E) testing

## Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# E2E tests only
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Test Structure

```
loomis-course-app/
├── src/
│   ├── components/
│   │   └── __tests__/
│   │       ├── CourseCard.test.tsx
│   │       └── PlannerGrid.test.tsx
│   ├── lib/
│   │   └── __tests__/
│   │       └── courseUtils.test.ts
├── e2e/
│   ├── course-browser.spec.ts
│   └── planner.spec.ts
└── vitest.config.ts
```

## Writing Tests

### Unit Test Example

```typescript
// src/lib/__tests__/courseUtils.test.ts
import { describe, it, expect } from 'vitest';
import { flattenDatabase } from '../courseUtils';

describe('flattenDatabase', () => {
  it('normalizes raw catalog data', () => {
    const rawCatalog = {
      departments: [{
        department: 'English',
        courses: [{ title: 'English I' }]
      }]
    };

    const result = flattenDatabase(rawCatalog);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('English I');
  });

  it('derives tags from course properties', () => {
    const rawCatalog = {
      departments: [{
        department: 'Science',
        courses: [{
          title: 'Advanced Physics',
          gesc: true,
          rigor: 2
        }]
      }]
    };

    const result = flattenDatabase(rawCatalog);

    expect(result[0].tags).toContain('GESC');
    expect(result[0].level).toBe('ADV');
  });
});
```

### E2E Test Example

```typescript
// e2e/course-browser.spec.ts
import { test, expect } from '@playwright/test';

test('search filters courses by department', async ({ page }) => {
  await page.goto('/browser');

  // Search for courses
  await page.fill('[data-testid="search-input"], input[placeholder*="search"]', 'English');

  // Filter by department
  await page.selectOption('select[data-testid="department-filter"], select:first-of-type', 'English');

  // Verify results
  const courseCards = page.locator('[data-testid="course-card"], .course-card');
  await expect(courseCards.first()).toBeVisible();

  // Check course title contains English
  await expect(courseCards.first()).toContainText(/English/);
});

test('add course to shopping list', async ({ page }) => {
  await page.goto('/browser');

  // Find and click add button
  const addButton = page.locator('button:has-text("Add"), [data-testid="add-button"]').first();
  await addButton.click();

  // Verify in shopping list
  const shoppingList = page.locator('[data-testid="shopping-list"], .shopping-list');
  await expect(shoppingList).toContainText(/Added/);
});
```

## Coverage Requirements

| Metric | Minimum |
|--------|---------|
| Overall coverage | 80% |
| Critical paths | 95% |
| New code | 90% |

## Test Best Practices

1. **Arrange-Act-Assert** pattern
2. Use `data-testid` for E2E element selection
3. Mock external dependencies
4. Test edge cases and error states
5. Keep tests isolated and independent
6. Use meaningful test descriptions

## CI Integration

Tests run automatically on:

- Pull requests
- Push to main branch
- Failed tests block merge

## Debugging Tests

```bash
# Run with verbose output
npm run test:unit -- --reporter=verbose

# Run single test file
npm run test:unit -- src/lib/__tests__/courseUtils.test.ts

# Open UI
npm run test:ui
```
