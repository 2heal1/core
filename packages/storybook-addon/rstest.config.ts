import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  name: 'storybook-addon',
  testEnvironment: 'jsdom',
  coverage: {
    reportsDirectory: '../../coverage/packages/storybook-addon',
  },
});
