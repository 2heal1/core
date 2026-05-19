import { defineConfig } from '@rstest/core';

export default defineConfig({
  // Migrated from jest.config.ts (ts-jest, node environment)
  // Rstest uses SWC for TypeScript by default - no transform config needed
  testEnvironment: 'node',
});
