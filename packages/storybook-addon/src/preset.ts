import { withModuleFederation } from './utils/with-module-federation-enhanced-rsbuild';

import type { RsbuildConfig } from '@rsbuild/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

export default {
  rsbuildFinal: (
    config: RsbuildConfig,
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
  ) => {
    const { remotes, shared, name, shareStrategy } = options;

    return withModuleFederation(config, {
      name,
      remotes,
      shared,
      shareStrategy,
    });
  },
};
export { PLUGIN_NAME } from './utils/with-module-federation-enhanced-rsbuild';
