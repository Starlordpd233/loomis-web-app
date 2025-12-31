/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        // Environment
        environment: 'jsdom',
        globals: true,

        // Setup
        setupFiles: ['./tests/setup.ts'],

        // Test file patterns
        include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
        exclude: ['node_modules', 'dist', '.next', 'build'],

        // Path aliases - match tsconfig paths
        alias: {
            '@': resolve(__dirname, './src'),
            '@/lib': resolve(__dirname, './src/lib'),
            '@/types': resolve(__dirname, './src/types'),
            '@/components': resolve(__dirname, './src/components'),
        },

        // Timeouts and retries for stability
        testTimeout: 10000,
        hookTimeout: 10000,

        // Coverage configuration
        coverage: {
            enabled: false, // Enable with --coverage flag
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            reportsDirectory: './coverage',
            include: ['src/lib/**/*.ts'],
            exclude: [
                'node_modules',
                'tests',
                '**/*.d.ts',
                '**/*.test.ts',
                '**/*.test.tsx',
            ],
            thresholds: {
                statements: 60,
                branches: 50,
                functions: 60,
                lines: 60,
            },
        },

        // Reporter configuration
        reporters: ['default'],

        // Pool configuration for test isolation
        pool: 'forks',
        isolate: true,
    },
})
