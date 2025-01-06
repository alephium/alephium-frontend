/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'
import svgrPlugin from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

/// <reference types="vitest" />

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 3000
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    },
    include: ['@alephium/shared-crypto'] // To allow for using npm link https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    electron({
      main: { entry: 'electron/main.ts' },
      preload: { input: 'electron/preload.ts' }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js', '@vitest/web-worker'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/setupTests.js']
    }
  },
  build: {
    target: 'es2020',
    outDir: 'build',
    assetsInlineLimit: 0, // Prevents small assets from being inlined (was causing some svgs to not load)
    commonjsOptions: {
      include: [/node_modules/, /shared-crypto/]
    }
  },
  base: ''
})
