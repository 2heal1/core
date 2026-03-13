import { defineConfig } from '@rslib/core';
import {
  getLicenseCopyPatterns,
  packageDirFromMetaUrl,
} from '../../tools/scripts/rslib/config-helpers';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig({
  source: {
    entry: {
      index: 'src/index.ts',
      runtime: 'src/runtime.ts',
      'runtime-core': 'src/runtime-core.ts',
      'webpack-bundler-runtime': 'src/webpack-bundler-runtime.ts',
    },
    tsconfigPath: 'tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
    copy: getLicenseCopyPatterns(packageDir),
    externals: ['@module-federation/*'],
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
        distPath: 'dist',
        cleanDistPath: false,
      },
    },
  ],
});
