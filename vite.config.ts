import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import resolvePlugin from 'vite-plugin-resolve'

export default defineConfig(({ mode }) => {
  return {
    root: null,
    plugins:
      mode === 'development'
        ? [dts({ rollupTypes: true })]
        : [resolvePlugin({ react: {} }), dts({ rollupTypes: true })],
    resolve: {},
    build: {
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, 'lib/index.ts'),
        name: 'adnf',
        formats: ['es', 'umd', 'cjs'],
        // the proper extensions will be added
        fileName: 'adnf',
      },
    },
  }
})
