import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/',
  test: {
    env: { BASE_URL: '/' },
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
