import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: 'src/index.ts',
      runtimePlugin: 'src/runtimePlugin.ts',
      recordDynamicRemoteEntryHashPlugin:
        'src/recordDynamicRemoteEntryHashPlugin.ts',
      'utils/index': 'src/utils/index.ts',
      'utils/flush-chunks': 'src/utils/flush-chunks.ts',
      'utils/hot-reload': 'src/utils/hot-reload.ts',
      'filesystem/stratagies': 'src/filesystem/stratagies.ts',
      'types/index': 'src/types/index.ts',
      'plugins/AutomaticPublicPathPlugin':
        'src/plugins/AutomaticPublicPathPlugin.ts',
      'plugins/CommonJsChunkLoadingPlugin':
        'src/plugins/CommonJsChunkLoadingPlugin.ts',
      'plugins/ChunkCorrelationPlugin': 'src/plugins/ChunkCorrelationPlugin.ts',
      'plugins/DynamicFilesystemChunkLoadingRuntimeModule':
        'src/plugins/DynamicFilesystemChunkLoadingRuntimeModule.ts',
      'plugins/EntryChunkTrackerPlugin':
        'src/plugins/EntryChunkTrackerPlugin.ts',
      'plugins/NodeFederationPlugin': 'src/plugins/NodeFederationPlugin.ts',
      'plugins/RemotePublicPathRuntimeModule':
        'src/plugins/RemotePublicPathRuntimeModule.ts',
      'plugins/StreamingTargetPlugin': 'src/plugins/StreamingTargetPlugin.ts',
      'plugins/UniversalFederationPlugin':
        'src/plugins/UniversalFederationPlugin.ts',
      'plugins/UniverseEntryChunkTrackerPlugin':
        'src/plugins/UniverseEntryChunkTrackerPlugin.ts',
      'plugins/webpackChunkUtilities': 'src/plugins/webpackChunkUtilities.ts',
    },
    tsconfigPath: 'tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
    externals: ['@module-federation/*', 'webpack', 'tapable'],
  },
  lib: [
    {
      id: 'cjs',
      format: 'cjs',
      bundle: false,
      outBase: 'src',
      dts: {
        autoExtension: true,
        distPath: 'dist/src',
      },
      source: {
        define: {
          'process.env.IS_ESM_BUILD': JSON.stringify('false'),
        },
      },
      output: {
        distPath: 'dist/src',
        cleanDistPath: true,
      },
    },
    {
      id: 'esm',
      format: 'esm',
      bundle: false,
      outBase: 'src',
      dts: {
        autoExtension: true,
        distPath: 'dist/src',
      },
      source: {
        define: {
          'process.env.IS_ESM_BUILD': JSON.stringify('true'),
        },
      },
      output: {
        distPath: 'dist/src',
        cleanDistPath: false,
      },
    },
  ],
});
