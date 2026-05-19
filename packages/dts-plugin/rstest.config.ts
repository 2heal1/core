import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  testEnvironment: 'node',
  include: [
    'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    'tests/**/*.spec.ts',
  ],
  testTimeout: 60000,
  globalSetup: ['./tests/setup.ts'],
});
