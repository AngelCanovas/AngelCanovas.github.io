import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/CV/',
  test: {
    env: { BASE_URL: '/CV/' },
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
