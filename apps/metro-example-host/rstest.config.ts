import { defineConfig } from '@rstest/core';

export default defineConfig({
  // Migrated from jest.config.js (react-native preset)
  // Using node environment as a simplified replacement for RN test env
  testEnvironment: 'node',
});
