import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  testEnvironment: 'jsdom',
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __BROWSER__: 'false',
    __VERSION__: '"unknown"',
  },
  include: ['__tests__/*.spec.ts'],
  resolve: {
    alias: {
      '@/': './',
      '@src': './src',
    },
  },
  setupFiles: ['./__tests__/setup.ts'],
  testTimeout: 10000,
});
