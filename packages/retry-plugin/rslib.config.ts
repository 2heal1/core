import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: 'src/index.ts',
    },
    tsconfigPath: 'tsconfig.json',
  },
  output: {
    sourceMap: true,
    externals: ['@module-federation/sdk'],
  },
  lib: [
    {
      id: 'cjs',
      format: 'cjs',
      bundle: false,
      outBase: 'src',
      dts: { distPath: 'dist' },
      output: {
        distPath: 'dist',
        cleanDistPath: true,
      },
    },
    {
      id: 'esm',
      format: 'esm',
      bundle: false,
      outBase: 'src',
      dts: false,
      output: {
        distPath: 'dist/esm',
        cleanDistPath: true,
      },
    },
  ],
});
