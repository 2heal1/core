import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  name: 'utils',
  coverage: {
    reportsDirectory: '../../coverage/packages/utils',
  },
});
