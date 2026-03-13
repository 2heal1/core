import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: [
        './src/**/*.{ts,tsx}',
        '!./src/**/*.spec.*',
        '!./src/**/*.test.*',
      ],
    },
    tsconfigPath: 'tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
    externals: ['@module-federation/*'],
  },
  lib: [
    {
      id: 'cjs',
      format: 'cjs',
      bundle: false,
      outBase: 'src',
      dts: {
        autoExtension: true,
        distPath: 'dist',
      },
      output: {
        distPath: 'dist',
        cleanDistPath: true,
        filename: {
          js: '[name].cjs',
        },
      },
    },
    {
      id: 'esm',
      format: 'esm',
      bundle: false,
      outBase: 'src',
      dts: {
        autoExtension: true,
        distPath: 'dist',
      },
      output: {
        distPath: 'dist',
        cleanDistPath: false,
      },
    },
  ],
});
