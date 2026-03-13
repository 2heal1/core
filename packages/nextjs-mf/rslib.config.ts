import { defineConfig } from '@rslib/core';
import {
  getLicenseCopyPatterns,
  packageDirFromMetaUrl,
} from '../../tools/scripts/rslib/config-helpers';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig({
  source: {
    entry: {
      'src/index': 'src/index.ts',
      'src/federation-noop': 'src/federation-noop.ts',
      'src/loaders/fixImageLoader': 'src/loaders/fixImageLoader.ts',
      'src/loaders/nextPageMapLoader': 'src/loaders/nextPageMapLoader.ts',
      'src/loaders/fixUrlLoader': 'src/loaders/fixUrlLoader.ts',
      'src/plugins/container/runtimePlugin':
        'src/plugins/container/runtimePlugin.ts',
      'utils/index': 'utils/index.ts',
    },
    tsconfigPath: 'tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
    copy: getLicenseCopyPatterns(packageDir),
    externals: [
      '@module-federation/*',
      'next',
      'react',
      'react-dom',
      'webpack',
    ],
  },
  lib: [
    {
      id: 'cjs',
      format: 'cjs',
      bundle: false,
      outBase: '.',
      dts: {
        autoExtension: true,
        distPath: 'dist',
      },
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
      outBase: '.',
      dts: {
        autoExtension: true,
        distPath: 'dist',
      },
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
