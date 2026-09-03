# Implementation Plan: Hero Background Banner

## Overview

This implementation adds background image/banner support to the hero section of HomePage.tsx using responsive images, modern format support (WebP/AVIF), and text readability overlays. The solution uses the HTML `<picture>` element for format fallback, absolute positioning with z-index layers, and native lazy loading for optimal performance.

## Tasks

- [x] 1. Set up type definitions and constants
  - Create `frontend/src/types/heroImage.ts` with all interfaces and constants
  - Define `ImageSource` interface for multi-format image URLs
  - Define `HeroImageConfig` interface for complete background image configuration
  - Export constants for viewport breakpoints, recommended dimensions, and max file sizes
  - _Requirements: 5.1, 5.2, 5.4, 6.1-6.6_

- [x] 2. Implement HeroBackgroundImage component
  - [x] 2.1 Create component structure and helper functions
    - Create `frontend/src/components/HeroBackgroundImage.tsx` file
    - Implement `selectImageSource()` helper to choose appropriate image for viewport with fallback logic
    - Implement `generateSrcSet()` helper to build srcset strings from ImageSource objects
    - Implement `hasFormat()` helper to check format availability in configuration
    - _Requirements: 1.1, 1.4, 2.3, 5.3_

  - [x] 2.2 Implement picture element rendering logic
    - Build JSX structure with `<picture>` containing `<source>` elements and `<img>` fallback
    - Add AVIF sources with type="image/avif" if available (priority 1)
    - Add WebP sources with type="image/webp" if available (priority 2)
    - Add JPEG/PNG fallback sources with srcset
    - Apply absolute positioning classes: "absolute inset-0 w-full h-full z-0"
    - _Requirements: 1.1, 1.2, 1.4, 4.2, 4.3_

  - [x] 2.3 Implement responsive image attributes
    - Generate srcset for each format with width descriptors (1920w, 1024w, 768w)
    - Set sizes attribute to "100vw" for viewport-based selection
    - Apply object-fit: cover via Tailwind class "object-cover"
    - Apply object-position from config via inline style
    - Add loading="lazy" attribute to img element
    - Include alt text from config
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 7.1, 7.2_

  - [ ]* 2.4 Write unit tests for HeroBackgroundImage
    - Test component returns null when no config provided
    - Test picture element structure with full configuration (all formats)
    - Test picture element with minimal configuration (desktop only, single format)
    - Test srcset generation for all viewport sizes
    - Test object-position applies correctly from config
    - Test alt text renders correctly
    - Test loading="lazy" attribute is present
    - _Requirements: 1.1, 1.3, 2.1-2.5, 4.1, 5.3, 7.1_

- [x] 3. Implement HeroOverlay component
  - [x] 3.1 Create overlay component with configurable opacity
    - Create `frontend/src/components/HeroOverlay.tsx` file
    - Accept opacity prop (default 0.5, range 0.4-0.6)
    - Accept color prop (default 'rgb(15, 23, 42)' - slate-900)
    - Accept optional className prop
    - Render div with absolute positioning: "absolute inset-0 z-5"
    - Add "pointer-events-none" class to prevent click blocking
    - Add "aria-hidden='true'" attribute for accessibility
    - Apply opacity and color via inline styles
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.3_

  - [ ]* 3.2 Write unit tests for HeroOverlay
    - Test default opacity (0.5) is applied correctly
    - Test custom opacity from props
    - Test default color (slate-900) is applied
    - Test custom color from props
    - Test pointer-events-none class is present
    - Test aria-hidden attribute is present
    - Test z-5 class is present
    - _Requirements: 3.1, 3.2, 3.4, 7.3_

- [x] 4. Add custom Tailwind utilities
  - Update `frontend/tailwind.config.js` to extend theme.zIndex with custom values
  - Add z-index utility "1" for decorative blur circles
  - Add z-index utility "5" for overlay layer
  - _Requirements: 3.4_

- [x] 5. Integrate components into HomePage
  - [x] 5.1 Add imports and configuration to HomePage.tsx
    - Import `HeroBackgroundImage` and `HeroOverlay` components
    - Import `HeroImageConfig` type
    - Define `heroImageConfig` object above component with sample image paths
    - Include desktop, tablet, and mobile image sources with WebP and JPG formats
    - Set alt text to descriptive value or empty string
    - Set objectPosition to 'center center' or custom focal point
    - Set overlayOpacity to 0.5 (configurable 0.4-0.6)
    - _Requirements: 5.1, 5.2, 5.4, 7.1, 7.2_

  - [x] 5.2 Modify hero section JSX structure
    - Wrap existing gradient divs in conditional render: only show if `heroImageConfig` is null
    - Add conditional render for `HeroBackgroundImage` and `HeroOverlay` when config is present
    - Place components before existing blur circle divs
    - Update blur circle opacity: change from "opacity-20" to conditional expression `${heroImageConfig ? 'opacity-10' : 'opacity-20'}`
    - Ensure content div maintains "relative z-10" positioning
    - _Requirements: 1.2, 1.3, 3.3, 3.4, 8.1, 8.2_

  - [ ]* 5.3 Write integration tests for HomePage hero section
    - Test gradient renders when heroImageConfig is null
    - Test HeroBackgroundImage renders when config is provided
    - Test HeroOverlay renders when config is provided
    - Test blur circles have reduced opacity (opacity-10) when image present
    - Test blur circles have normal opacity (opacity-20) when no image
    - Test content div maintains z-10 positioning
    - Test z-index layering: content (z-10) > overlay (z-5) > blur (z-1) > image (z-0)
    - _Requirements: 1.2, 1.3, 3.3, 3.4, 8.1, 8.2_

- [ ] 6. Create sample images and documentation
  - [ ] 6.1 Generate placeholder images
    - Create desktop placeholder image (1920x1080 or 1920x800)
    - Create tablet placeholder image (1024x768)
    - Create mobile placeholder image (768x1024 or 768x512)
    - Place images in `frontend/public/images/hero/` directory
    - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.2, 6.3, 6.4_

  - [ ] 6.2 Process images to modern formats
    - Convert desktop placeholder to WebP format (target < 500KB)
    - Convert tablet placeholder to WebP format (target < 300KB)
    - Convert mobile placeholder to WebP format (target < 200KB)
    - Verify compression quality maintains visual fidelity (80-90%)
    - _Requirements: 4.2, 4.4, 4.5, 6.5, 6.6_

  - [ ] 6.3 Create developer documentation
    - Document HeroImageConfig interface with all fields and default values
    - Provide configuration examples: full config, minimal config, no image
    - Document helper functions and their usage
    - Add troubleshooting section for common issues
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 6.4 Create owner guide for image preparation
    - Document optimal dimensions for desktop, tablet, mobile viewports
    - Specify recommended aspect ratios (16:9, 4:3, 3:4)
    - Document maximum file size limits per viewport
    - Recommend image format priority (AVIF > WebP > JPG/PNG)
    - List recommended tools: ImageMagick, Squoosh, sharp, Optimizilla
    - Provide guidelines for alt text: descriptive vs decorative
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Verify performance and accessibility
  - [ ]* 8.1 Run performance tests
    - Run Lighthouse audit on HomePage and verify Performance score >= 90
    - Verify Largest Contentful Paint (LCP) < 2.5s
    - Verify Cumulative Layout Shift (CLS) < 0.1
    - Test image loading with network throttling (Fast 3G, Slow 3G)
    - Verify lazy loading defers image load appropriately
    - Confirm gradient fallback displays during slow image loads
    - _Requirements: 4.1, 4.4, 4.5, 8.1, 8.3, 8.4_

  - [ ]* 8.2 Run accessibility tests
    - Run axe DevTools scan and verify no violations
    - Run Lighthouse audit and verify Accessibility score = 100
    - Test with screen reader (NVDA or JAWS) to verify alt text announcement
    - Verify overlay has aria-hidden attribute
    - Test keyboard navigation through hero section interactive elements
    - Verify heading structure unchanged (h1 remains logical)
    - Measure color contrast ratio on overlay (text vs background) >= 4.5:1
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 8.3 Test browser compatibility
    - Test in Chrome 90+ (verify AVIF and WebP support)
    - Test in Firefox 90+ (verify WebP and AVIF support)
    - Test in Safari 14+ (verify WebP support, fallback from AVIF)
    - Test in Safari 16+ (verify AVIF support)
    - Test in legacy browser (verify JPEG/PNG fallback)
    - Verify picture element format selection in each browser
    - _Requirements: 1.4, 4.2, 4.3_

- [ ] 9. Final checkpoint and deployment preparation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The design document uses TypeScript/React, so all implementation is in TypeScript
- No property-based tests are needed - this is a UI rendering feature covered by snapshot tests, example-based tests, and integration tests
- Browser-native behavior (srcset selection, picture format fallback, lazy loading) is tested via integration tests
- Visual regression testing and performance testing are marked optional but recommended

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3"] },
    { "id": 4, "tasks": ["2.4", "3.2"] },
    { "id": 5, "tasks": ["5.1"] },
    { "id": 6, "tasks": ["5.2"] },
    { "id": 7, "tasks": ["5.3", "6.1"] },
    { "id": 8, "tasks": ["6.2"] },
    { "id": 9, "tasks": ["6.3", "6.4"] },
    { "id": 10, "tasks": ["8.1", "8.2", "8.3"] }
  ]
}
```
