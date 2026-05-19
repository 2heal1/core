import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  name: '@module-federation/metro-plugin-rnc-cli',
  testEnvironment: 'node',
  coverage: {
    reportsDirectory: '../../coverage/packages/metro-rnc-cli',
  },
});
