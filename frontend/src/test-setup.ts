/**
 * Test Setup File
 *
 * This file runs before all tests to set up the test environment.
 * It imports the design tokens CSS so they're available in tests.
 */

import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';

beforeEach(() => {
  if (!document.documentElement) {
    const html = document.createElement('html');
    document.appendChild(html);
  }
});
