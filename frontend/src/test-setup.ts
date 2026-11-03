/**
 * Test Setup File
 *
 * This file runs before all tests to set up the test environment.
 * It imports the design tokens CSS so they're available in tests.
 */

import { beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock IntersectionObserver for framer-motion in jsdom
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
  unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

beforeEach(() => {
  if (!document.documentElement) {
    const html = document.createElement('html');
    document.appendChild(html);
  }
});
