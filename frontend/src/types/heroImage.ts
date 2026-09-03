export type ImageFormat = 'avif' | 'webp' | 'jpg' | 'png';

export interface ImageSource {
  avif?: string;
  webp?: string;
  jpg?: string;
  png?: string;
}

export interface HeroImageConfig {
  desktop?: ImageSource;
  tablet?: ImageSource;
  mobile?: ImageSource;
  alt?: string;
  objectPosition?: string;
  overlayOpacity?: number;
}

export const HERO_BREAKPOINTS = {
  mobileMax: 767,
  tabletMin: 768,
  tabletMax: 1023,
  desktopMin: 1024,
} as const;

export const HERO_DIMENSIONS = {
  desktop: ['1920x1080', '1920x800'],
  tablet: ['1024x768'],
  mobile: ['768x1024', '768x512'],
} as const;

export const HERO_MAX_FILE_SIZE_KB = {
  desktop: 500,
  mobile: 200,
} as const;

export const HERO_IMAGE_WIDTHS = {
  desktop: 1920,
  tablet: 1024,
  mobile: 768,
} as const;
