/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// `react()` returns plugins typed against the top-level `vite` package, while
// vitest 2.x ships with its own (newer) `vite` peer. Cast to `any` to bridge
// the two `Plugin<>` types — runtime behavior is identical.
export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react()] as any,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build', '.vite', 'tests/api'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.config.*',
        '**/*.d.ts',
        'src/main.tsx',
        'components/ui/**', // shadcn-generated UI
      ],
    },
  },
});
