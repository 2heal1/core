import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  testEnvironment: 'node',
  include: ['__tests__/**/*.spec.ts', '__tests__/**/*.test.ts'],
});
