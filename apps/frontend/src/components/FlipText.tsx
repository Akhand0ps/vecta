import React, { useState } from 'react';

export interface FlipTextProps {
  children: string;
  className?: string;
  duration?: number;
  yOffset?: number;
  style?: React.CSSProperties;
}

/**
 * FlipText Component (inspired by ObsidianUI)
 * Splices children strings into interactive characters with 3D rotateX and vertical lift physics.
 */
export function FlipText({
  children,
  className = '',
  duration = 0.4,
  yOffset = -8,
  style,
}: FlipTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <span
      className={`inline-flex select-none ${className}`}
      aria-label={children}
      style={{
        perspective: '1000px',
        ...style,
      }}
    >
      {children.split('').map((char, index) => {
        const isHovered = hoveredIndex === index;
        return (
          <span
            key={index}
            aria-hidden="true"
            className="inline-block cursor-pointer will-change-transform"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              display: 'inline-block',
              transformStyle: 'preserve-3d',
              transform: isHovered
                ? `rotateX(360deg) translateY(${yOffset}px)`
                : 'rotateX(0deg) translateY(0px)',
              transition: `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1)`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
}

export default FlipText;
