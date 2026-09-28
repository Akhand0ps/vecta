import React from 'react';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Kbd Component (inspired by Kobra Systems)
 * Embossed tactile keyboard badge for shortcut affordances.
 */
export const Kbd: React.FC<KbdProps> = ({
  children,
  size = 'md',
  className = '',
  style,
  ...props
}) => {
  const sizeStyles: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
    sm: { fontSize: 10, padding: '1px 4px', minWidth: 16, height: 16 },
    md: { fontSize: 11, padding: '2px 5px', minWidth: 18, height: 18 },
    lg: { fontSize: 12, padding: '3px 7px', minWidth: 22, height: 22 },
  };

  return (
    <kbd
      className={`kbd-badge ${className}`}
      style={{
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </kbd>
  );
};

export default Kbd;
