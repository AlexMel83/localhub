import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Unit tests for framework-free logic (server/utils, shared helpers).
// Component tests can later move to a separate project via defineVitestConfig.
export default defineConfig({
  resolve: {
    alias: {
      '~~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  test: {
    include: ['test/unit/**/*.test.ts'],
    environment: 'node',
  },
});
