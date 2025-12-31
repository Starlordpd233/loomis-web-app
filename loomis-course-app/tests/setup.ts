/**
 * Vitest Test Setup
 * 
 * This file is executed before each test file to configure the test environment.
 * It provides global mocks, cleanup utilities, and common test fixtures.
 */

import '@testing-library/jest-dom'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// =============================================================================
// AUTOMATIC CLEANUP
// =============================================================================

/**
 * Clean up React Testing Library after each test.
 * This unmounts any mounted components and clears the DOM.
 */
afterEach(() => {
    cleanup()
})

// =============================================================================
// LOCALSTORAGE MOCK
// =============================================================================

/**
 * Create a fresh localStorage mock for each test.
 * This ensures test isolation - no data leaks between tests.
 */
const createLocalStorageMock = () => {
    let store: Record<string, string> = {}

    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key]
        }),
        clear: vi.fn(() => {
            store = {}
        }),
        get length() {
            return Object.keys(store).length
        },
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    }
}

// Apply localStorage mock globally
Object.defineProperty(globalThis, 'localStorage', {
    value: createLocalStorageMock(),
    writable: true,
})

// Reset localStorage before each test for isolation
beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
})

// =============================================================================
// CONSOLE SPY SETUP
// =============================================================================

/**
 * Spy on console methods to verify error handling in tests.
 * Use vi.spyOn(console, 'error') in individual tests for assertions.
 */
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(() => {
    // Suppress expected console errors during tests
    // Individual tests can spy on these if they need to verify error logging
    console.error = vi.fn()
    console.warn = vi.fn()
})

afterEach(() => {
    // Restore console methods
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
})

// =============================================================================
// FETCH MOCK (optional - uncomment if needed)
// =============================================================================

// Uncomment if you need to mock fetch globally:
// globalThis.fetch = vi.fn()

// =============================================================================
// COMMON TEST UTILITIES
// =============================================================================

/**
 * Wait for a specified number of milliseconds.
 * Useful for testing async operations.
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Create a deferred promise for testing async flows.
 */
export const createDeferred = <T>() => {
    let resolve: (value: T) => void
    let reject: (error: Error) => void

    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })

    return { promise, resolve: resolve!, reject: reject! }
}
