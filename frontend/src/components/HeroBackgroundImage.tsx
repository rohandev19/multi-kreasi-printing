import type { CSSProperties, ReactElement } from 'react';
import type { HeroImageConfig, ImageFormat, ImageSource } from '../types/heroImage';

export interface HeroBackgroundImageProps {
  config: HeroImageConfig | null;
  className?: string;
}

const FORMAT_TYPES: Record<ImageFormat, string> = {
  avif: 'image/avif',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  png: 'image/png',
};

const FORMAT_PRIORITY: ImageFormat[] = ['avif', 'webp', 'jpg', 'png'];
const VIEWPORT_KEYS = ['desktop', 'tablet', 'mobile'] as const;

type ViewportKey = (typeof VIEWPORT_KEYS)[number];
const VIEWPORT_FALLBACK_ORDER: Record<ViewportKey, ViewportKey[]> = {
  mobile: ['mobile', 'tablet', 'desktop'],
  tablet: ['tablet', 'desktop', 'mobile'],
  desktop: ['desktop', 'tablet', 'mobile'],
};

export function hasFormat(config: HeroImageConfig, format: ImageFormat): boolean {
  return VIEWPORT_KEYS.some((viewport) => Boolean(config[viewport]?.[format]));
}

export function selectImageSource(
  config: HeroImageConfig,
  viewport: ViewportKey,
): ImageSource | undefined {
  return VIEWPORT_FALLBACK_ORDER[viewport].map((key) => config[key]).find(Boolean);
}

export function generateSrcSet(config: HeroImageConfig, format: ImageFormat): string {
  return VIEWPORT_KEYS
    .filter((viewport) => Boolean(config[viewport]?.[format]))
    .map((viewport) => `${config[viewport]?.[format]} ${viewport === 'desktop' ? 1920 : viewport === 'tablet' ? 1024 : 768}w`)
    .join(', ');
}

function createSource(
  config: HeroImageConfig,
  format: ImageFormat,
  media: string,
): ReactElement | null {
  if (!hasFormat(config, format)) {
    return null;
  }

  return (
    <source
      key={`${format}-${media}`}
      type={FORMAT_TYPES[format]}
      media={media}
      srcSet={generateSrcSet(config, format)}
      sizes="100vw"
    />
  );
}

export function HeroBackgroundImage({
  config,
  className = '',
}: HeroBackgroundImageProps): ReactElement | null {
  if (!config || !VIEWPORT_KEYS.some((viewport) => selectImageSource(config, viewport))) {
    return null;
  }

  const desktopSource = selectImageSource(config, 'desktop');
  const fallbackSrc = FORMAT_PRIORITY.map((format) => desktopSource?.[format]).find(Boolean)
    ?? FORMAT_PRIORITY.map((format) => selectImageSource(config, 'mobile')?.[format]).find(Boolean);

  if (!fallbackSrc) {
    return null;
  }

  const fallbackFormat = FORMAT_PRIORITY.find((format) => Boolean(desktopSource?.[format]))
    ?? FORMAT_PRIORITY.find((format) => Boolean(selectImageSource(config, 'mobile')?.[format]));

  const imageStyle: CSSProperties = {
    objectPosition: config.objectPosition ?? 'center center',
  };

  return (
    <picture className={`absolute inset-0 z-0 h-full w-full ${className}`.trim()}>
      {createSource(config, 'avif', '(min-width: 1024px)')}
      {createSource(config, 'avif', '(min-width: 768px) and (max-width: 1023px)')}
      {createSource(config, 'avif', '(max-width: 767px)')}
      {createSource(config, 'webp', '(min-width: 1024px)')}
      {createSource(config, 'webp', '(min-width: 768px) and (max-width: 1023px)')}
      {createSource(config, 'webp', '(max-width: 767px)')}
      {createSource(config, 'jpg', '(min-width: 1024px)')}
      {createSource(config, 'jpg', '(min-width: 768px) and (max-width: 1023px)')}
      {createSource(config, 'jpg', '(max-width: 767px)')}
      {createSource(config, 'png', '(min-width: 1024px)')}
      {createSource(config, 'png', '(min-width: 768px) and (max-width: 1023px)')}
      {createSource(config, 'png', '(max-width: 767px)')}
      <img
        src={fallbackSrc}
        srcSet={fallbackFormat ? generateSrcSet(config, fallbackFormat) : undefined}
        sizes="100vw"
        alt={config.alt ?? ''}
        loading="lazy"
        className="h-full w-full object-cover"
        style={imageStyle}
      />
    </picture>
  );
}
