/**
 * Design Tokens Configuration
 * 
 * Defines the design system tokens for Multi Kreasi Printing application.
 * Uses professional business colors (sky blue primary, neutral grays) and
 * IBM Plex Sans typography (avoiding AI slop fonts like Inter, Geist, Space Grotesk).
 * 
 * Requirements satisfied:
 * - 1.1, 1.2, 1.3, 1.4, 1.5: Professional typography system
 * - 2.1-2.8: Professional business color palette
 * - 12.1-12.6: Design token configuration
 */

interface ColorToken {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

interface DesignTokens {
  colors: {
    primary: ColorToken;
    neutral: ColorToken;
    success: ColorToken;
    warning: ColorToken;
    error: ColorToken;
    info: ColorToken;
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadow: Record<string, string>;
  animation: {
    duration: Record<string, string>;
    easing: Record<string, string>;
  };
}

/**
 * Main design tokens object
 * 
 * Color palette uses professional business colors:
 * - Primary: Sky Blue (no purple/black scheme)
 * - Neutral: True grays (no rainbow colors)
 * - Semantic: Subtle success/warning/error (no neon colors)
 * 
 * Typography uses IBM Plex Sans and Work Sans (NOT Inter, Geist, or Space Grotesk)
 */
export const designTokens: DesignTokens = {
  colors: {
    // Primary color: Sky Blue (professional business color)
    // Requirements: 2.5, 2.6
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',  // Main primary color
      600: '#0284c7',  // Hover/active state
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },
    // Neutral colors: True grays (not pure white/black)
    // Requirements: 2.5, 2.7, 9.2
    neutral: {
      50: '#fafbfc',   // Base background (not pure white)
      100: '#f4f6f8',  // Elevated surface
      200: '#e5e9ed',  // Border color
      300: '#d1d7de',
      400: '#a3aeba',
      500: '#7b8794',
      600: '#5a6775',  // Secondary text
      700: '#424c58',
      800: '#2f3842',
      900: '#1e2329',  // Primary text
      950: '#0f1419'
    },
    // Success color: Professional green (not neon)
    // Requirements: 2.6, 2.8
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',  // Main success color
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16'
    },
    // Warning color: Professional amber (not neon)
    // Requirements: 2.6, 2.8
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',  // Main warning color
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },
    // Error color: Professional red (not neon)
    // Requirements: 2.6, 2.8
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',  // Main error color
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },
    // Info color: Professional blue (not neon)
    // Requirements: 2.6, 2.8
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Main info color
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    }
  },
  // Typography system using IBM Plex Sans and Work Sans
  // NOT using Inter, Geist, or Space Grotesk
  // Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 12.3
  typography: {
    fontFamily: {
      sans: '"IBM Plex Sans", "Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      mono: '"IBM Plex Mono", "SF Mono", "Consolas", monospace'
    },
    // Clear hierarchy with 5+ levels
    // Requirements: 1.3, 12.3
    fontSize: {
      xs: '0.75rem',    // 12px - Small labels
      sm: '0.875rem',   // 14px - Body text, minimum for sidebar labels
      base: '1rem',     // 16px - Default body text
      lg: '1.125rem',   // 18px - Subheadings
      xl: '1.25rem',    // 20px - Section headings
      '2xl': '1.5rem',  // 24px - Page titles
      '3xl': '1.875rem',// 30px - Hero text
      '4xl': '2.25rem', // 36px - Large headings
      '5xl': '3rem'     // 48px - Display text
    },
    // Consistent font weights (400, 500, 600, 700)
    // Requirements: 1.4
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    // Line height between 1.4 and 1.6 for body text
    // Requirements: 1.5
    lineHeight: {
      tight: 1.25,   // For headings
      normal: 1.5,   // For body text (meets 1.4-1.6 requirement)
      relaxed: 1.75  // For large text blocks
    }
  },
  // Spacing scale following 4px grid system
  // Requirements: 12.2
  spacing: {
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px - Minimum spacing between menu items
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem'      // 96px
  },
  // Border radius tokens (maximum 8px, not soft rounded corners)
  // Requirements: 4.7, 12.6
  borderRadius: {
    sm: '0.25rem',  // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px - Maximum border radius
    xl: '0.75rem',  // 12px - Use sparingly
    full: '9999px'  // For circular elements only
  },
  // Shadow system with maximum 3 levels (subtle only)
  // Requirements: 4.2, 12.4
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',  // Subtle shadow (< 2px blur)
    md: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',  // Standard shadow (2px blur)
    lg: '0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)'   // Maximum shadow (subtle)
  },
  // Animation system (maximum 200ms for hover animations)
  // Requirements: 8.1, 8.3, 8.4
  animation: {
    duration: {
      fast: '100ms',    // Quick feedback
      normal: '150ms',  // Standard transitions
      slow: '200ms'     // Maximum for hover animations
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',    // Natural motion
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',  // Ease out
      accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)'     // Ease in
    }
  }
};

/**
 * Semantic color mappings for easier component usage
 */
export const semanticColors = {
  // Background surfaces (not pure white)
  // Requirements: 9.1, 9.2, 9.4
  background: {
    base: designTokens.colors.neutral[50],      // Main background
    elevated: '#ffffff',                         // Cards and panels
    overlay: 'rgba(0, 0, 0, 0.5)'              // Modal overlays
  },
  // Text colors with sufficient contrast
  // Requirements: 9.3
  text: {
    primary: designTokens.colors.neutral[900],   // Main text
    secondary: designTokens.colors.neutral[600], // Supporting text
    tertiary: designTokens.colors.neutral[400],  // Disabled text
    inverse: '#ffffff'                           // Text on dark backgrounds
  },
  // Border colors
  border: {
    default: designTokens.colors.neutral[200],
    hover: designTokens.colors.neutral[300],
    focus: designTokens.colors.primary[500]
  }
};

/**
 * Export default for convenience
 */
export default designTokens;
