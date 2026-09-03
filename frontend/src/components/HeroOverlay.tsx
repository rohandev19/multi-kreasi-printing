import type { CSSProperties, ReactElement } from 'react';

export interface HeroOverlayProps {
  opacity?: number;
  color?: string;
  className?: string;
}

const DEFAULT_OVERLAY_OPACITY = 0.5;
const MIN_OVERLAY_OPACITY = 0.4;
const MAX_OVERLAY_OPACITY = 0.6;
const DEFAULT_OVERLAY_COLOR = 'rgb(15, 23, 42)';

export function HeroOverlay({
  opacity = DEFAULT_OVERLAY_OPACITY,
  color = DEFAULT_OVERLAY_COLOR,
  className = '',
}: HeroOverlayProps): ReactElement {
  const boundedOpacity = Math.min(MAX_OVERLAY_OPACITY, Math.max(MIN_OVERLAY_OPACITY, opacity));
  const style: CSSProperties = { backgroundColor: color, opacity: boundedOpacity };

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-5 ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}
