import { defineConfig } from '@rslib/core';

const SUPPORTED_BUNDLERS = [
  'esbuild',
  'rollup',
  'vite',
  'webpack',
  'rspack',
  'rolldown',
  'farm',
];

const entry = Object.fromEntries([
  ['index', 'src/index.ts'],
  ...SUPPORTED_BUNDLERS.map((bundler) => [bundler, `src/${bundler}.ts`]),
]);

export default defineConfig({
  source: {
    entry,
    tsconfigPath: 'tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
    minify: true,
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
