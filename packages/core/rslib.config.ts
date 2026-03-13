import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: 'src/index.ts',
    },
    tsconfigPath: 'tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
    externals: [/^[^./]/],
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
