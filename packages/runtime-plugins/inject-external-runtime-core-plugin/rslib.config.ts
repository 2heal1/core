import { defineConfig } from '@rslib/core';
import {
  getLicenseCopyPatterns,
  packageDirFromMetaUrl,
  readPackageVersion,
} from '../../../tools/scripts/rslib/config-helpers';

const packageDir = packageDirFromMetaUrl(import.meta.url);
const version = readPackageVersion(packageDir);

export default defineConfig({
  source: {
    entry: {
      index: 'src/index.ts',
    },
    tsconfigPath: 'tsconfig.lib.json',
    define: {
      __VERSION__: JSON.stringify(version),
    },
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
