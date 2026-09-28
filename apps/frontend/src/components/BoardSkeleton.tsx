import React from 'react';

export const BoardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        padding: 'clamp(12px, 3vw, 24px)',
        width: '100%',
        maxWidth: '100vw',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: 16,
        alignItems: 'start',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
      aria-label="Loading workspace board..."
      role="status"
    >
      {[1, 2, 3, 4].map((colIndex) => (
        <div
          key={colIndex}
          style={{
            backgroundColor: 'var(--bg-column)',
            border: '1px solid var(--border-line)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 10px',
            minHeight: '480px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* Column Header Skeleton */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 8px 6px' }}>
            <div className="skeleton-shimmer" style={{ width: 90, height: 16, borderRadius: 'var(--radius-xs)' }} />
            <div className="skeleton-shimmer" style={{ width: 22, height: 22, borderRadius: 'var(--radius-xs)' }} />
          </div>

          {/* Card Skeletons */}
          {[1, 2, colIndex === 1 ? 3 : 2].map((cardIndex) => (
            <div
              key={cardIndex}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div className="skeleton-shimmer" style={{ width: '40%', height: 12, borderRadius: 'var(--radius-xs)' }} />
              <div className="skeleton-shimmer" style={{ width: '90%', height: 15, borderRadius: 'var(--radius-xs)' }} />
              <div className="skeleton-shimmer" style={{ width: '70%', height: 15, borderRadius: 'var(--radius-xs)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <div className="skeleton-shimmer" style={{ width: 60, height: 14, borderRadius: 'var(--radius-xs)' }} />
                <div className="skeleton-shimmer" style={{ width: 22, height: 22, borderRadius: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
