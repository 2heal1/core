import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  name: 'inject-external-runtime-core-plugin',
  testEnvironment: 'node',
  coverage: {
    reportsDirectory: '../../../coverage/packages/runtime-plugins/inject-external-runtime-core-plugin',
  },
});
