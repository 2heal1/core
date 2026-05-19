import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  name: 'bridge-react',
  testEnvironment: 'jsdom',
  setupFiles: ['./__tests__/setupTests.ts'],
  include: ['__tests__/**/*.spec.ts', '__tests__/**/*.spec.tsx'],
  coverage: {
    reportsDirectory: '../../../coverage/packages/bridge/bridge-react',
  },
});
