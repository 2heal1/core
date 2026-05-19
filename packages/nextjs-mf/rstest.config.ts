import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  name: 'nextjs-mf',
  testEnvironment: 'node',
  coverage: {
    reportsDirectory: '../../coverage/packages/nextjs-mf',
  },
});
