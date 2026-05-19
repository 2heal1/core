import { defineConfig } from '@rstest/core';
import { resolve } from 'path';

export default defineConfig({
  globals: true,
  testEnvironment: 'jsdom',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
