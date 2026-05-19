import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  name: 'core',
  coverage: {
    reportsDirectory: '../../coverage/packages/core',
  },
});
