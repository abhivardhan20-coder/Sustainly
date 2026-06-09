import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: { 
      provider: 'v8', 
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },
    // @ts-expect-error environmentMatchGlobs is valid but missing in this Vitest type version
    environmentMatchGlobs: [
      ['src/**/*.tsx', 'jsdom'],
      ['src/**/*.ts', 'jsdom'],
      ['tests/**/*.ts', 'node'],
    ],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
