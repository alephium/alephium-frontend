import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['node_modules', 'dist', 'coverage']
    },
    include: ['test/**/*.{test,spec}.{js,ts}', '**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'coverage']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
