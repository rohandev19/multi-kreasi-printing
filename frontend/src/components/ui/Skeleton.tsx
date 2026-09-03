import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'table' | 'chart';
  className?: string;
  rows?: number;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  className = '',
  rows = 3,
  width = '100%',
  height,
}) => {
  const baseClassName = `relative overflow-hidden rounded-md bg-[var(--color-neutral-200)] ${className}`;
  const inlineStyle = {
    width,
    height: height ?? undefined,
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
  };

  if (variant === 'card') {
    return (
      <div className={baseClassName} style={inlineStyle} aria-label="Loading content" />
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`${baseClassName} h-64`} style={{ width: '100%', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} aria-label="Loading chart" />
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-3" aria-label="Loading table">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className={`${baseClassName} h-11`}
            style={{ width: index % 2 === 0 ? '100%' : '82%', animation: 'skeleton-pulse 1.5s ease-in-out infinite' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${baseClassName} h-4`} style={inlineStyle} aria-label="Loading text" />
  );
};
