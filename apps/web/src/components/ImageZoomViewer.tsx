import React from 'react';
import { Sparkles } from 'lucide-react';

interface ImageZoomViewerProps {
  src?: string | null;
  alt: string;
  aspectRatio?: string;
  staticHeight?: number | string;
  badges?: React.ReactNode;
  className?: string;
  fallbackGradient?: string;
  objectFit?: 'cover' | 'contain';
  zoomScale?: number; // Optional for backward compatibility
}

export function ImageZoomViewer({
  src,
  alt,
  aspectRatio = '4/5',
  staticHeight,
  badges,
  className = '',
  fallbackGradient = 'gradient-home_decor',
  objectFit = 'cover'
}: ImageZoomViewerProps) {
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(staticHeight
      ? { height: typeof staticHeight === 'number' ? `${staticHeight}px` : staticHeight }
      : { aspectRatio: aspectRatio.replace('/', ' / ') }),
  };

  return (
    <div
      className={`image-zoom-box bg-white select-none ${className}`}
      style={containerStyle}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: objectFit,
            objectPosition: 'center',
            display: 'block'
          }}
          className="transition-opacity duration-300"
          loading="eager"
        />
      ) : (
        <div className={`w-full h-full gradient-bg ${fallbackGradient} flex items-center justify-center text-muted`}>
          <Sparkles size={36} className="text-[#8fa4bf] opacity-60" />
        </div>
      )}

      {/* Badges Overlay strictly pinned to top-left inside frame */}
      {badges && (
        <div
          className="product-frame-badges"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 10,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            pointerEvents: 'none'
          }}
        >
          {badges}
        </div>
      )}
    </div>
  );
}
