import { defineConfig, Options } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: {
    index: 'src/index.tsx'
  },
  clean: true,
  format: ['esm'],
  external: ['react', 'react-redux'],
  dts: true,
  ...options
}))
