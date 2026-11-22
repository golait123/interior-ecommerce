import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon-only';
  showSubtitle?: boolean;
  className?: string;
}

export function BrandLogoIcon({ size = 38, className = '' }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-logo-svg ${className}`}
      aria-label="iG Logo"
    >
      <defs>
        <linearGradient id="igBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B2E5B" />
          <stop offset="100%" stopColor="#071D3A" />
        </linearGradient>
        <linearGradient id="igLetterGGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D8CFF" />
          <stop offset="100%" stopColor="#8EC5FF" />
        </linearGradient>
      </defs>

      {/* Rounded Navy App Icon Badge */}
      <rect width="100" height="100" rx="24" fill="url(#igBadgeGrad)" />

      {/* Lowercase 'i': dot and vertical stem with rounded caps */}
      <circle cx="28" cy="31" r="5.5" fill="#FFFFFF" />
      <rect x="22.5" y="42" width="11" height="33" rx="5.5" fill="#FFFFFF" />

      {/* Uppercase 'G': Modern geometric curve with brand blue gradient */}
      <path 
        d="M84 38 A 23 23 0 1 0 84 70 L 84 54 L 66 54" 
        fill="none" 
        stroke="url(#igLetterGGrad)" 
        strokeWidth="11" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

export function BrandLogo({ 
  size = 'md', 
  variant = 'full', 
  showSubtitle = true,
  className = '' 
}: BrandLogoProps) {
  const iconPx = size === 'sm' ? 30 : size === 'lg' ? 44 : 38;

  if (variant === 'icon-only') {
    return <BrandLogoIcon size={iconPx} className={className} />;
  }

  return (
    <div className={`brand-logo-lockup ${className}`}>
      <div className="brand-logo-icon">
        <BrandLogoIcon size={iconPx} />
      </div>
      <div className="brand-logo-text">
        <div className="brand-title">
          Interior<span className="brand-title-accent">G</span>
        </div>
        {showSubtitle && (
          <div className="brand-subtitle">
            Design • Discover • Transform Your Home
          </div>
        )}
      </div>
    </div>
  );
}
