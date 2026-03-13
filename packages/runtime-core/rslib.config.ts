import { defineConfig } from '@rslib/core';
import {
  getLicenseCopyPatterns,
  packageDirFromMetaUrl,
  readPackageVersion,
} from '../../tools/scripts/rslib/config-helpers';

const packageDir = packageDirFromMetaUrl(import.meta.url);
const version = readPackageVersion(packageDir);
const buildMode =
  process.env.RUNTIME_CORE_TSDOWN_MODE === 'debug' ? 'debug' : 'build';

const standardDefine = {
  __VERSION__: JSON.stringify(version),
  FEDERATION_DEBUG: JSON.stringify(process.env.FEDERATION_DEBUG || ''),
};

const debugDefine = {
  __VERSION__: JSON.stringify(version),
  FEDERATION_DEBUG: JSON.stringify('true'),
};

const entry = {
  index: ['./src/**/*.{ts,tsx}', '!./src/**/*.spec.*', '!./src/**/*.test.*'],
};

export default defineConfig(
  buildMode === 'debug'
    ? {
        source: {
          entry: { index: 'src/index.ts' },
          tsconfigPath: 'tsconfig.lib.json',
          define: debugDefine,
        },
        output: {
          target: 'web',
          sourceMap: true,
        },
        lib: [
          {
            id: 'debug',
            format: 'iife',
            autoExternal: false,
            output: {
              distPath: 'dist/debug',
              cleanDistPath: false,
              externals: [],
            },
            performance: {
              chunkSplit: {
                strategy: 'all-in-one',
              },
            },
            tools: {
              rspack: (config) => {
                config.output ??= {};
                config.output.asyncChunks = false;
                config.output.library = {
                  name: 'ModuleFederationRuntime',
                  type: 'var',
                };
              },
            },
          },
        ],
      }
    : {
        source: {
          entry,
          tsconfigPath: 'tsconfig.lib.json',
          define: standardDefine,
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
      },
);
