import React from 'react';

/**
 * Decorative print-production marks (crop marks, registration target, CMYK
 * color bar). They give the public site an identity borrowed from the actual
 * trade instead of generic gradients. All are aria-hidden.
 */

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const cornerPosition: Record<Corner, React.CSSProperties> = {
  tl: { top: 0, left: 0 },
  tr: { top: 0, right: 0, transform: 'scaleX(-1)' },
  bl: { bottom: 0, left: 0, transform: 'scaleY(-1)' },
  br: { bottom: 0, right: 0, transform: 'scale(-1, -1)' },
};

/** L-shaped trim marks placed just outside each corner of the parent (parent must be `relative`). */
export const CropMarks: React.FC<{ offset?: number; size?: number; color?: string }> = ({
  offset = 12,
  size = 18,
  color = 'var(--color-process-key)',
}) => (
  <>
    {(Object.keys(cornerPosition) as Corner[]).map((corner) => (
      <svg
        key={corner}
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 18 18"
        className="pointer-events-none absolute"
        style={{
          ...cornerPosition[corner],
          margin: -offset - size,
          color,
        }}
      >
        <path d="M18 17.5H6M17.5 18V6" stroke="currentColor" strokeWidth="1" fill="none" transform="translate(-6 -6)" />
      </svg>
    ))}
  </>
);

/** Registration target (circle + crosshair). */
export const RegistrationMark: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 20 20" className={className}>
    <circle cx="10" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
    <path d="M10 0V20M0 10H20" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const processSwatches = [
  { label: 'C', color: 'var(--color-process-cyan)' },
  { label: 'M', color: 'var(--color-process-magenta)' },
  { label: 'Y', color: 'var(--color-process-yellow)' },
  { label: 'K', color: 'var(--color-process-key)' },
];

/** Horizontal CMYK control strip with tint steps, used as a section divider. */
export const ColorBar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div aria-hidden="true" className={`flex h-3 w-full overflow-hidden ${className}`}>
    {processSwatches.map(({ label, color }) =>
      [100, 70, 40].map((tint) => (
        <span
          key={`${label}-${tint}`}
          className="flex-1"
          style={{ backgroundColor: color, opacity: tint / 100 }}
        />
      )),
    )}
  </div>
);
