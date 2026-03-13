import { defineConfig } from '@rslib/core';
import {
  getLicenseCopyPatterns,
  packageDirFromMetaUrl,
} from '../../tools/scripts/rslib/config-helpers';

const packageDir = packageDirFromMetaUrl(import.meta.url);

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
    copy: getLicenseCopyPatterns(packageDir),
    externals: ['@module-federation/*', 'isomorphic-rslog', 'webpack'],
  },
  lib: [
    {
      id: 'cjs',
      format: 'cjs',
      bundle: false,
      outBase: 'src',
      dts: { distPath: 'dist' },
      source: {
        define: {
          'process.env.IS_ESM_BUILD': JSON.stringify('false'),
        },
      },
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
      source: {
        define: {
          'process.env.IS_ESM_BUILD': JSON.stringify('true'),
        },
      },
      output: {
        distPath: 'dist',
        cleanDistPath: false,
      },
    },
  ],
});
