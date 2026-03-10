import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['src/**/*.test.ts', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/utils/**/*.ts', 'src/calculators/**/*.ts'],
    },
    reporters: ['verbose'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
