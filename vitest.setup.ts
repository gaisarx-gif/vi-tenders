// Global test setup — runs before each test file.
// Adds jest-dom matchers (toBeInTheDocument, toHaveClass, etc.) to expect().

import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Auto-unmount React trees after every test to prevent leakage.
afterEach(() => {
  cleanup();
});
