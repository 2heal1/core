import { defineConfig } from '@rstest/core';

export default defineConfig({
  // Migrated from jest.config.ts (ts-jest, node environment, E2E with global setup/teardown)
  // Rstest uses SWC for TypeScript by default - no transform config needed
  testEnvironment: 'node',
  globalSetup: ['./src/support/global-setup.ts'],
  globalTeardown: ['./src/support/global-teardown.ts'],
  setupFiles: ['./src/support/test-setup.ts'],
});
