import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  clearMocks: true,
  testEnvironment: 'node',
  include: ['__tests__/**/**.spec.[jt]s?(x)'],
  exclude: ['**/node_modules/**'],
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __BROWSER__: 'false',
    __VERSION__: '"unknown"',
  },
});
