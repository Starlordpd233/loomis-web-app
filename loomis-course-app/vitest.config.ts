
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        include: ['**/*.test.ts', '**/*.test.tsx'],
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
})
