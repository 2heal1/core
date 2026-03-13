import ansiColors from 'ansi-colors';
import { resolve } from 'path';
import { mergeDeepRight, mergeRight } from 'rambda';
import { createRslib, type RslibConfig } from '@rslib/core';
import { UnpluginOptions, createUnplugin } from 'unplugin';

import { retrieveHostConfig } from './configurations/hostPlugin';
import { retrieveRemoteConfig } from './configurations/remotePlugin';
import { HostOptions } from './interfaces/HostOptions';
import { RemoteOptions } from './interfaces/RemoteOptions';
import {
  createTestsArchive,
  deleteTestsFolder,
  downloadTypesArchive,
} from './lib/archiveHandler';

async function buildTests(config: RslibConfig) {
  const rslib = await createRslib({
    cwd: process.cwd(),
    config,
    loadEnv: false,
  });

  const result = await rslib.build();
  await result.close();
}

export const NativeFederationTestsRemote = createUnplugin(
  (options: RemoteOptions) => {
    const {
      remoteOptions,
      compiledFilesFolder,
      externalDeps,
      mapComponentsToExpose,
    } = retrieveRemoteConfig(options);
    return {
      name: 'native-federation-tests/remote',
      async writeBundle() {
        const buildConfig = mergeRight(remoteOptions.additionalBundlerConfig, {
          source: {
            entry: mapComponentsToExpose,
          },
          output: {
            distPath: {
              root: compiledFilesFolder,
            },
            externals: [
              /^[^./]/,
              ...externalDeps.map(
                (externalDep) => new RegExp(`^${externalDep}`),
              ),
            ],
          },
          logLevel: 'silent',
          lib: [
            {
              format: 'cjs',
              dts: false,
              bundle: true,
              performance: {
                chunkSplit: {
                  strategy: 'all-in-one',
                },
              },
              tools: {
                rspack: (rspackConfig) => {
                  rspackConfig.optimization ??= {};
                  rspackConfig.optimization.splitChunks = false;
                  rspackConfig.optimization.runtimeChunk = false;
                },
              },
            },
          ],
        } satisfies RslibConfig);

        try {
          await buildTests(buildConfig);

          await createTestsArchive(remoteOptions, compiledFilesFolder);

          await deleteTestsFolder(remoteOptions, compiledFilesFolder);

          console.log(ansiColors.green('Federated mocks created correctly'));
        } catch (error) {
          console.error(
            ansiColors.red(`Unable to build federated mocks: ${error}`),
          );
        }
      },
      get vite() {
        return process.env.NODE_ENV === 'production'
          ? undefined
          : {
              buildStart: (this as UnpluginOptions).writeBundle,
              watchChange: (this as UnpluginOptions).writeBundle,
            };
      },
      webpack(compiler) {
        compiler.options.devServer = mergeDeepRight(
          compiler.options.devServer || {},
          {
            static: {
              directory: resolve(remoteOptions.distFolder),
            },
          },
        );
      },
      rspack(compiler) {
        compiler.options.devServer = mergeDeepRight(
          compiler.options.devServer || {},
          {
            static: {
              directory: resolve(remoteOptions.distFolder),
            },
          },
        );
      },
    };
  },
);

export const NativeFederationTestsHost = createUnplugin(
  (options: HostOptions) => {
    const { hostOptions, mapRemotesToDownload } = retrieveHostConfig(options);
    const typesDownloader = downloadTypesArchive(hostOptions);
    return {
      name: 'native-federation-tests/host',
      async writeBundle() {
        const downloadPromises =
          Object.entries(mapRemotesToDownload).map(typesDownloader);

        await Promise.allSettled(downloadPromises);
        console.log(ansiColors.green('Federated mocks extraction completed'));
      },
      get vite() {
        return process.env.NODE_ENV === 'production'
          ? undefined
          : {
              buildStart: (this as UnpluginOptions).writeBundle,
              watchChange: (this as UnpluginOptions).writeBundle,
            };
      },
    };
  },
);
