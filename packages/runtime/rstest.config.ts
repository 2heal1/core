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
  },
  include: [path.resolve(__dirname, '__tests__/*.spec.ts')],
  setupFiles: [path.resolve(__dirname, './__tests__/setup.ts')],
  testTimeout: 10000,
});
