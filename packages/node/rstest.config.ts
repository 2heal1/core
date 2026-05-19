import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  name: 'node',
  testEnvironment: 'node',
  coverage: {
    reportsDirectory: '../../coverage/packages/node',
  },
});
