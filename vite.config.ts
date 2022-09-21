/* eslint-disable import/no-extraneous-dependencies */
// Code for single vite config copied from https://github.com/vitest-dev/vitest/blob/main/examples/react-testing-lib-msw/vite.config.ts
/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['test/testSetup.ts'],
  },
});
