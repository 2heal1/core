import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: ['src/**/*.{ts,tsx,mts,cts}', '!src/**/*.d.ts', '!src/scripts/**'],
    },
    tsconfigPath: 'tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
    externals: [/^[^./]/, /package\.json$/],
  },
  lib: [
    {
      id: 'cjs',
      format: 'cjs',
      bundle: false,
      outBase: 'src',
      dts: { distPath: 'dist/src' },
      output: {
        distPath: 'dist/src',
        cleanDistPath: true,
      },
    },
  ],
});
