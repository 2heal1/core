import { defineConfig } from '@rstest/core';
import path from 'path';

export default defineConfig({
  globals: true,
  testEnvironment: 'jsdom',
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __BROWSER__: 'false',
    __VERSION__: '"unknown"',
    __APP_VERSION__: '"0.0.0"',
  },
  include: [
    path.resolve(__dirname, '__tests__/*.spec.ts'),
    path.resolve(__dirname, '__tests__/*.spec.tsx'),
  ],
  testTimeout: 10000,
});
