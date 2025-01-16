import { defineConfig, Options } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: {
    index: 'src/index.ts'
  },
  clean: true,
  format: ['esm', 'cjs'],
  dts: true,
  ...options
}))
