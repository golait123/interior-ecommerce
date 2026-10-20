import React from 'react';

export interface UIconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  brand?: boolean;
}

/**
 * Official Flaticon UIcon (Bold Rounded) Component
 * Sourced directly from https://www.flaticon.com/icon-fonts-most-downloaded?weight=bold&corner=rounded&type=uicon
 * Uses vector webfonts (WOFF2/WOFF) for pixel-perfect resolution at any scale.
 */
export const UIcon: React.FC<UIconProps> = ({
  name,
  size,
  color,
  className = '',
  style = {},
  brand = false,
  ...rest
}) => {
  const isBrand = brand || name.startsWith('brands-') || name.startsWith('fi-brands-');
  const cleanName = name.replace(/^(fi\s+|fi-br-|fi-brands-|brands-)/, '');
  const prefix = isBrand ? 'fi-brands' : 'fi-br';

  const computedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    lineHeight: 1,
    ...(size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : {}),
    ...(color ? { color } : {}),
    ...style,
  };

  return (
    <i
      className={`fi ${prefix}-${cleanName} ${className}`.trim()}
      style={computedStyle}
      aria-hidden="true"
      {...rest}
    />
  );
};

export default UIcon;
