# Implementation Plan: Remove AI Slop Design

## Overview

This implementation plan transforms the Multi Kreasi Printing application from AI-generated template design (AI slop) to a professional, business-focused design system. The refactoring maintains the React + TypeScript + Tailwind CSS v4 architecture while introducing professional typography, color schemes, icon system (Phosphor Icons), and refined UI components that prioritize data density and business functionality.

## Tasks

- [x] 1. Set up Design Token System
  - [x] 1.1 Create design tokens TypeScript configuration file
    - Create `frontend/src/styles/design-tokens.ts` with color palette, typography, spacing, shadows, and animation tokens
    - Export `designTokens` object with all token definitions
    - Ensure no purple/black color schemes, rainbow colors, or neon colors
    - Use professional business colors (sky blue primary, neutral grays)
    - Define typography system using IBM Plex Sans or Work Sans (NOT Inter, Geist, or Space Grotesk)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 12.1, 12.2, 12.3, 12.4, 12.6_

  - [x] 1.2 Create design tokens CSS file with custom properties
    - Create `frontend/src/styles/design-tokens.css` with CSS custom properties for all tokens
    - Apply tokens to `:root` element
    - Include `@media (prefers-reduced-motion: reduce)` support for accessibility
    - Define semantic color mappings (primary, success, warning, error)
    - _Requirements: 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 12.1, 12.5_

  - [x] 1.3 Import and apply design tokens in main application
    - Import `design-tokens.css` in `frontend/src/main.tsx` or `frontend/src/index.css`
    - Ensure tokens are loaded before component rendering
    - Verify CSS custom properties are accessible via `var(--token-name)`
    - _Requirements: 12.5_

- [x] 2. Replace Icon System from Lucide to Phosphor
  - [x] 2.1 Install Phosphor Icons library
    - Run `npm install @phosphor-icons/react` in frontend directory
    - Verify installation in `package.json`
    - _Requirements: 3.1, 3.2_

  - [x] 2.2 Create icon migration utility and type definitions
    - Create `frontend/src/components/icons/types.ts` with `IconProps` interface
    - Create `frontend/src/components/icons/migration-map.ts` with Lucide to Phosphor icon mappings
    - Map all icons used in the application (LayoutDashboard → SquaresFour, ShoppingCart → ShoppingCart, etc.)
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 2.3 Migrate Sidebar component icons
    - Update `frontend/src/components/layout/Sidebar.tsx` to use Phosphor icons
    - Replace all Lucide icon imports with Phosphor equivalents using migration map
    - Ensure consistent stroke width and sizing (20px for navigation)
    - Remove sparkle icons or animated arrows if present
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.4 Migrate Header component icons
    - Update `frontend/src/components/layout/Header.tsx` to use Phosphor icons
    - Replace all Lucide icon imports with Phosphor equivalents
    - Maintain consistent sizing (16px or 20px)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.5 Migrate remaining components with Lucide icons
    - Search for all remaining Lucide icon usages across the codebase
    - Update each component to use Phosphor icons
    - Ensure `weight="regular"` prop is set consistently
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Refactor Sidebar Component to Professional Design
  - [x] 3.1 Remove colored left stripe from sidebar navigation
    - Update `frontend/src/components/layout/Sidebar.tsx` active state styling
    - Replace colored stripe (`border-l-4 border-indigo-600`) with background color and subtle border
    - Use `bg-neutral-100` for active state background
    - Apply design token CSS custom properties for colors
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 3.2 Update sidebar spacing and typography
    - Ensure minimum 8px spacing between menu items
    - Set font size to minimum 14px for labels
    - Apply consistent padding using design token spacing scale
    - _Requirements: 7.3, 7.4_

  - [x] 3.3 Implement professional hover and transition effects
    - Limit hover animation duration to maximum 200ms
    - Use subtle opacity or scale changes (maximum 5%)
    - Apply cubic-bezier easing from design tokens
    - Remove any excessive animations
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 3.4 Ensure tooltip functionality for collapsed state
    - Verify tooltip displays on hover when sidebar is collapsed
    - Ensure tooltips have proper contrast and readability
    - _Requirements: 7.5_

- [x] 4. Refactor Header Component to Professional Design
  - [x] 4.1 Update header background and shadow styling
    - Replace harsh shadows with subtle shadow from design tokens (`--shadow-sm` or `--shadow-md`)
    - Ensure background uses appropriate surface color
    - Apply maximum 2px blur radius for shadows
    - _Requirements: 4.1, 4.2, 4.6_

  - [x] 4.2 Refactor header animations and hover effects
    - Limit hover animations to maximum 200ms duration
    - Use subtle feedback (max 5% opacity/scale change)
    - Apply design token easing functions
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 4.3 Update header color scheme
    - Replace any purple/black colors with neutral colors from design tokens
    - Ensure text has sufficient contrast (WCAG AA minimum)
    - Use semantic colors from design tokens for icons and badges
    - _Requirements: 2.1, 2.5, 2.7, 2.8, 9.3_

- [x] 5. Checkpoint - Verify Design Token and Component Updates
  - Run the application and verify that:
    - Design tokens are properly loaded and applied
    - Phosphor icons render correctly with consistent sizing
    - Sidebar and Header have professional styling without AI slop elements
    - No purple/black color schemes or rainbow colors are present
    - Hover animations are subtle and under 200ms
    - Tooltips work correctly in collapsed sidebar
  - Ensure all tests pass, ask the user if questions arise

- [ ] 6. Refactor Card and Container Components
  - [ ] 6.1 Remove excessive visual effects from cards
    - Identify all card components in the codebase (Dashboard cards, metric cards, etc.)
    - Remove harsh gradients, liquid glass effects, radial orbs, dot grids
    - Apply subtle borders or flat surfaces using design tokens
    - Use corner radius maximum 8px (not soft rounded corners)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ] 6.2 Update surface and background colors
    - Replace pure white (#FFFFFF) backgrounds with neutral backgrounds from design tokens
    - Use `--bg-base` and `--bg-elevated` for surface levels
    - Ensure sufficient contrast for all text on backgrounds (WCAG AA)
    - Define maximum 3 surface levels (base, raised, overlay)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 6.3 Update shadow and border styling
    - Apply shadow system with maximum 3 levels from design tokens
    - Ensure shadows don't exceed 2px blur radius
    - Use consistent border colors from design tokens
    - _Requirements: 4.2, 4.6, 12.4_

- [ ] 7. Redesign Dashboard Layout
  - [ ] 7.1 Refactor dashboard grid layout
    - Update main Dashboard component to remove 3-column feature cards
    - Remove bento grid layout if present
    - Implement asymmetric grid or data-first layout
    - Use 4-column metric row, 2/3 + 1/3 main content split, and 1/2 + 1/2 charts row
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 7.2 Remove marketing clichés from dashboard
    - Remove emojis in interface text
    - Remove "It's not X, it's Y" copywriting patterns
    - Remove checkmark bullets for feature lists
    - Remove 3 pricing tiers layout if present
    - Replace marketing content with real product functionality
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ] 7.3 Implement data-focused metric cards
    - Create or update MetricCard component prioritizing data density
    - Display real production data (not fake testimonials)
    - Use clean typography and minimal decoration
    - Include optional trend indicators with subtle styling
    - _Requirements: 5.5, 5.6_

- [ ] 8. Implement Professional Loading States
  - [ ] 8.1 Create Skeleton Loader component
    - Create `frontend/src/components/ui/Skeleton.tsx` with variants (text, card, table, chart)
    - Implement pulse animation with 1.5s duration
    - Match skeleton shapes to actual content structure
    - Ensure sufficient contrast (WCAG AA minimum)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 8.2 Add smooth transition animation for loading completion
    - Implement fade-in transition when skeleton is replaced with content
    - Avoid jarring flashes or color changes
    - Use design token animation timing
    - _Requirements: 10.5_

  - [ ] 8.3 Apply skeleton loaders to key components
    - Add skeleton loaders to Dashboard, Orders, Customers, and other data-heavy pages
    - Replace any rainbow spinners or neon loading indicators
    - _Requirements: 10.1, 10.2_

- [ ] 9. Create Legal and Support Pages
  - [ ] 9.1 Create Terms of Service page
    - Create `frontend/src/pages/legal/TermsOfService.tsx`
    - Implement readable format (not wall of text) with proper typography
    - Use design tokens for styling
    - _Requirements: 11.1, 11.4_

  - [ ] 9.2 Create Privacy Policy page
    - Create `frontend/src/pages/legal/PrivacyPolicy.tsx`
    - Implement readable format with sections and headings
    - Apply professional typography from design tokens
    - _Requirements: 11.2, 11.4_

  - [ ] 9.3 Create Help/Support page
    - Create `frontend/src/pages/Help.tsx` with contact information
    - Include FAQ or support resources
    - Use clean, professional layout
    - _Requirements: 11.5_

  - [ ] 9.4 Add footer with legal page links
    - Create or update Footer component with links to Terms, Privacy, and Help
    - Ensure footer uses design token colors and typography
    - Add footer to main layout component
    - _Requirements: 11.3_

  - [ ] 9.5 Update router configuration
    - Add routes for `/terms`, `/privacy`, and `/help` pages in `frontend/src/router.tsx`
    - Ensure routes are accessible without authentication where appropriate
    - _Requirements: 11.1, 11.2, 11.5_

- [ ] 10. Global Style Updates and CSS Cleanup
  - [x] 10.1 Update global CSS file with design tokens
    - Update `frontend/src/index.css` to use design token CSS custom properties
    - Replace any hardcoded Inter, Geist, or Space Grotesk font imports
    - Import IBM Plex Sans or Work Sans fonts (from Google Fonts or local files)
    - Apply base typography styles using design tokens
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ] 10.2 Remove AI slop color classes from codebase
    - Search for hardcoded purple/indigo colors and replace with design token colors
    - Remove any rainbow color schemes or neon colors
    - Update Tailwind configuration if custom colors are defined
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 10.3 Update animation and transition durations
    - Search for CSS transitions exceeding 200ms and reduce to design token values
    - Remove animated arrows or sparkle animations
    - Ensure all animations respect `prefers-reduced-motion`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 10.4 Update border radius values
    - Replace soft rounded corners (> 8px) with design token border radius (max 8px)
    - Apply consistent border radius from design tokens across all components
    - _Requirements: 4.7, 12.6_

- [ ] 11. Checkpoint - Comprehensive UI Review
  - Run the application and conduct thorough UI review:
    - Verify all pages use new design system consistently
    - Check that no AI slop elements remain (colored stripes, harsh gradients, rainbow colors, etc.)
    - Verify loading states use professional skeleton loaders
    - Confirm legal pages are accessible and properly styled
    - Test responsive behavior on different screen sizes
    - Verify accessibility (contrast ratios, reduced motion support)
  - Ensure all tests pass, ask the user if questions arise

- [ ] 12. Write unit tests for design token system
  - [ ] 12.1 Create test file for design tokens
    - Create `frontend/src/styles/__tests__/design-tokens.test.ts`
    - Test that all required tokens are defined (colors, typography, spacing, shadows, animation)
    - Verify no purple/black color schemes in palette
    - Verify font family doesn't include Inter, Geist, or Space Grotesk
    - _Requirements: 1.1, 2.1, 12.1, 12.2, 12.3_

  - [ ] 12.2 Create test file for contrast validation
    - Create utility function to calculate contrast ratios
    - Test that all color combinations meet WCAG AA standards (4.5:1 minimum)
    - Test contrast between text colors and background colors
    - _Requirements: 9.3_

- [ ] 13. Write integration tests for refactored components
  - [ ] 13.1 Write tests for Sidebar component
    - Test that active navigation items display correct styling (no colored stripe)
    - Test tooltip appears on hover in collapsed state
    - Test that Phosphor icons render correctly
    - Test spacing and typography meet requirements (min 8px spacing, min 14px font)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 13.2 Write tests for Header component
    - Test that header uses subtle shadows (max 2px blur)
    - Test hover animations don't exceed 200ms
    - Test that Phosphor icons render correctly
    - Test sufficient color contrast for all text elements
    - _Requirements: 3.1, 4.1, 4.2, 4.6, 8.1, 8.2, 8.3_

  - [ ] 13.3 Write tests for Skeleton Loader component
    - Test all variants render correctly (text, card, table, chart)
    - Test pulse animation duration is 1.5s
    - Test sufficient contrast for skeleton elements
    - _Requirements: 10.1, 10.3, 10.4_

  - [ ] 13.4 Write tests for legal pages
    - Test Terms of Service page renders and is accessible
    - Test Privacy Policy page renders and is accessible
    - Test Help page renders with correct content
    - Test footer links navigate to correct pages
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

- [ ] 14. Final Checkpoint and Documentation
  - Conduct final review of all changes:
    - All AI slop design elements have been removed
    - Design token system is fully implemented and consistently applied
    - Icon system migrated from Lucide to Phosphor
    - All components use professional, business-focused design
    - Animations are subtle and respect user preferences
    - Accessibility standards are met (contrast, reduced motion)
    - Legal pages are complete and accessible
    - All tests pass
  - Update README or documentation with design system guidelines
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- This implementation focuses on UI/UX refactoring and design system implementation
- No property-based testing is required as this is a visual design refactoring (no complex algorithmic logic)
- Testing strategy emphasizes unit tests for utilities and integration tests for component behavior
- All requirements are traced back to specific requirement IDs for full coverage
- Each checkpoint ensures incremental validation and early detection of issues
- Design tokens provide single source of truth for all styling decisions
- Icon migration map ensures consistent replacement across entire codebase
- Accessibility is prioritized throughout (WCAG AA contrast, reduced motion support)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["1.3", "2.2"] },
    { "id": 3, "tasks": ["2.3", "2.4", "10.1"] },
    { "id": 4, "tasks": ["2.5", "3.1", "4.1", "10.2"] },
    { "id": 5, "tasks": ["3.2", "3.3", "4.2", "4.3", "10.3", "10.4"] },
    { "id": 6, "tasks": ["3.4", "6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 8, "tasks": ["7.2", "7.3", "8.1"] },
    { "id": 9, "tasks": ["8.2", "8.3", "9.1", "9.2", "9.3"] },
    { "id": 10, "tasks": ["9.4", "9.5"] },
    { "id": 11, "tasks": ["12.1", "12.2"] },
    { "id": 12, "tasks": ["13.1", "13.2", "13.3", "13.4"] }
  ]
}
```
