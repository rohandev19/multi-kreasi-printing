/**
 * Test Setup File
 * 
 * This file runs before all tests to set up the test environment.
 * It imports the design tokens CSS so they're available in tests.
 */

import '@testing-library/jest-dom';
import './index.css'; // This imports design-tokens.css via @import

// Setup for CSS custom properties in tests
beforeEach(() => {
  // Ensure document.documentElement exists
  if (!document.documentElement) {
    const html = document.createElement('html');
    document.appendChild(html);
  }
});
