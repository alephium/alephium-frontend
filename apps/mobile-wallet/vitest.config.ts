import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitestSetupFile.ts'],
    include: ['__tests__/**/*.{test,spec}.{js,ts}']
  }
})
