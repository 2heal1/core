import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  name: 'runtime-tools',
  testEnvironment: 'node',
  coverage: {
    reportsDirectory: '../../coverage/packages/runtime',
  },
});
