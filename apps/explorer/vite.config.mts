/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  optimizeDeps: {
    include: ['@alephium/shared-crypto'] // To allow for using npm link https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin({
      include: '**/*.svg?react'
    }),
    nodePolyfills({
      exclude: mode === 'test' ? ['fs', 'http', 'https'] : [],
      globals: {
        Buffer: true,
        process: true
      }
    })
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/setupTests.js',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/setupTests.js']
    }
  },
  build: {
    target: 'es2020',
    outDir: 'build',
    commonjsOptions: {
      include: [/node_modules/, /shared-crypto/]
    }
  }
}))
