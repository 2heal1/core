import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  name: 'typescript',
  coverage: {
    reportsDirectory: '../../coverage/packages/typescript',
  },
});
