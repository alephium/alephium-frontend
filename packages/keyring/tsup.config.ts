import { defineConfig, Options } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: {
    'buffer-polyfill': 'src/buffer-polyfill.ts',
    index: 'src/index.ts'
  },
  clean: true,
  format: ['esm'],
  dts: true,
  ...options
}))
