import { defineConfig } from '@rslib/core';

const libraryEntry = {
  index: 'src/index.ts',
  core: 'src/core/index.ts',
  'fork-dev-worker': 'src/dev-worker/forkDevWorker.ts',
  'start-broker': 'src/server/broker/startBroker.ts',
  'fork-generate-dts': 'src/core/lib/forkGenerateDts.ts',
  'dynamic-remote-type-hints-plugin':
    'src/runtime-plugins/dynamic-remote-type-hints-plugin.ts',
};

export default defineConfig({
  source: {
    tsconfigPath: 'tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
  },
  lib: [
    {
      id: 'cjs',
      format: 'cjs',
      bundle: false,
      outBase: 'src',
      dts: { distPath: 'dist' },
      source: {
        entry: libraryEntry,
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
        entry: libraryEntry,
      },
      output: {
        distPath: 'dist/esm',
        cleanDistPath: true,
      },
    },
    {
      id: 'iife',
      format: 'iife',
      autoExternal: false,
      dts: false,
      source: {
        entry: {
          'launch-web-client': 'src/server/launchWebClient.ts',
        },
      },
      output: {
        target: 'web',
        distPath: 'dist/iife',
        cleanDistPath: true,
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
        },
      },
    },
  ],
});
