import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    tsconfigPath: 'tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
    externals: [/^[^./]/],
  },
  lib: [
    {
      id: 'main',
      format: 'esm',
      bundle: false,
      outBase: 'src',
      dts: { distPath: 'dist/src' },
      source: {
        entry: {
          index: 'src/index.ts',
        },
      },
      output: {
        distPath: 'dist/src',
        cleanDistPath: true,
      },
    },
    {
      id: 'preset',
      format: 'esm',
      bundle: false,
      outBase: 'src',
      dts: { distPath: 'dist' },
      source: {
        entry: {
          preset: 'src/preset.ts',
        },
      },
      output: {
        distPath: 'dist',
        cleanDistPath: false,
      },
    },
  ],
});
