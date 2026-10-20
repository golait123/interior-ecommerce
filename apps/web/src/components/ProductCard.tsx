import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../api/products';
import { UIcon } from './UIcon';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const isDiscounted = product.discountPrice !== null;
  const curPrice = Number(product.discountPrice || product.price);
  const origPrice = Number(product.price);
  const discountPct = isDiscounted && origPrice > curPrice 
    ? Math.round(((origPrice - curPrice) / origPrice) * 100) 
    : null;

  const availableStock = product.inventoryAvailable !== undefined 
    ? product.inventoryAvailable 
    : product.inventory 
      ? (product.inventory.totalQuantity - product.inventory.reservedQuantity - (product.inventory.damagedQuantity || 0)) 
      : 10;
  const isOutOfStock = product.inStock === false || availableStock <= 0;

  // Safe Image handling with fallback to avoid broken icons & alt text leak
  const fallbackImg = '/images/outdoor-garden.jpg';
  const initialImg = (product.images && product.images.length > 0 && product.images[0]) ? product.images[0] : fallbackImg;
  const [imgSrc, setImgSrc] = useState(initialImg);

  useEffect(() => {
    setImgSrc((product.images && product.images.length > 0 && product.images[0]) ? product.images[0] : fallbackImg);
  }, [product.images]);

  // Space / Room information
  const spaceItem = product.spaces && product.spaces.length > 0 ? product.spaces[0] : null;
  const roomName = product.rooms && product.rooms.length > 0 ? product.rooms[0] : null;
  const spaceLabel = spaceItem ? `${spaceItem.icon} ${spaceItem.name}` : roomName ? roomName : null;

  return (
    <div className={`product-card group ${isOutOfStock ? 'opacity-90' : ''}`}>
      {/* 1. Studio Image Box */}
      <div className="product-card-image-wrapper relative">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <div className="product-image-placeholder">
            <img 
              src={imgSrc} 
              alt={product.name} 
              loading="lazy" 
              onError={() => {
                if (imgSrc !== fallbackImg) setImgSrc(fallbackImg);
              }}
            />
          </div>
        </Link>

        {/* Top-Left Badge: Single clean, non-overlapping pill */}
        <div className="product-badge-corner">
          {isOutOfStock ? (
            <span 
              className="product-badge-pill"
              style={{ background: '#b91c1c', color: '#fff', fontWeight: 700, letterSpacing: '0.04em' }}
            >
              OUT OF STOCK
            </span>
          ) : discountPct ? (
            <span className="product-badge-pill product-badge-discount">
              {discountPct}% OFF
            </span>
          ) : product.isCustomizable ? (
            <span className="product-badge-pill product-badge-custom">
              CUSTOM
            </span>
          ) : (
            <span className="product-badge-pill product-badge-curated">
              CURATED
            </span>
          )}
        </div>

        {/* Top-Right Badge: Frosted Space/Domain Pill */}
        {product.primaryDomain === 'outdoor' ? (
          <div className="product-badge-domain">
            <span>🌿 Outdoor</span>
          </div>
        ) : product.primaryDomain === 'indoor' ? (
          <div className="product-badge-domain">
            <span>🏠 Indoor</span>
          </div>
        ) : spaceLabel ? (
          <div className="product-badge-domain">
            <span>{spaceLabel}</span>
          </div>
        ) : null}

        {/* Hover Action Bar: Centered slide up */}
        <div className="product-card-actions">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="product-btn-quickview"
              title="Quick preview product"
            >
              <UIcon name="eye" size={13} />
              <span>Quick View</span>
            </button>
          )}

          {isOutOfStock ? (
            <div 
              className="product-btn-addtocart flex items-center justify-center gap-1.5"
              style={{ background: '#71717a', color: '#fff', cursor: 'not-allowed', opacity: 0.9 }}
              title="Article currently out of stock"
            >
              <UIcon name="ban" size={13} />
              <span>Sold Out</span>
            </div>
          ) : onAddToCart ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="product-btn-addtocart"
              title="Add to cart"
            >
              <UIcon name="shopping-bag" size={13} />
              <span>Add</span>
            </button>
          ) : product.isCustomizable ? (
            <Link
              to={`/products/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="product-btn-addtocart"
            >
              <UIcon name="settings-sliders" size={13} />
              <span>Customize</span>
            </Link>
          ) : null}
        </div>
      </div>
      
      {/* 2. Organized Content & Clean Typography */}
      <div className="product-card-content">
        <div>
          {/* Metadata Row: Category & Space */}
          <div className="product-meta-row">
            <span className="product-category-text" title={product.category?.name || 'Collection'}>
              {product.category?.name || 'Collection'}
            </span>
            {spaceLabel && !product.primaryDomain && (
              <span className="product-space-text" title={spaceLabel}>
                {spaceLabel}
              </span>
            )}
          </div>

          {/* Product Title (Clean, 2-line clamped modern sans-serif) */}
          <Link 
            to={`/products/${product.id}`} 
            className="product-title-link"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Botanical / Craft Highlight or Stock indicator */}
          {isOutOfStock ? (
            <span className="product-highlight-pill text-red-700 bg-red-50 border-red-200" style={{ color: '#b91c1c' }}>
              ⚠️ Currently Out of Stock
            </span>
          ) : availableStock > 0 && availableStock <= 5 ? (
            <span className="product-highlight-pill text-amber-700 bg-amber-50 border-amber-200" style={{ color: '#b45309' }}>
              🔥 Only {availableStock} left!
            </span>
          ) : product.botanicalBenefits && product.botanicalBenefits.length > 0 ? (
            <span className="product-highlight-pill" title={product.botanicalBenefits[0]}>
              🌱 {product.botanicalBenefits[0]}
            </span>
          ) : product.material ? (
            <span className="product-highlight-pill" title={product.material}>
              ✨ {product.material}
            </span>
          ) : null}
        </div>

        {/* 3. Price & Action Footer */}
        <div className="product-card-footer">
          <div className="product-price-wrapper">
            <span className="product-price-current">
              {product.priceRange || `₹${curPrice.toLocaleString()}`}
            </span>
            {isDiscounted && (
              <span className="product-price-original">
                ₹{origPrice.toLocaleString()}
              </span>
            )}
            <span className="product-price-unit">
              /{product.unit || 'piece'}
            </span>
          </div>

          {/* Quick Footer Action Button */}
          {isOutOfStock ? (
            <span 
              className="product-footer-action-btn flex items-center justify-center"
              style={{ background: '#f4f4f5', color: '#a1a1aa', cursor: 'not-allowed', border: '1px solid #e4e4e7' }}
              title="Out of stock"
            >
              <UIcon name="ban" size={14} />
            </span>
          ) : onAddToCart ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="product-footer-action-btn"
              title="Add to cart"
            >
              <UIcon name="shopping-bag" size={14} />
            </button>
          ) : product.isCustomizable ? (
            <Link
              to={`/products/${product.id}`}
              className="product-footer-action-btn"
              title="Customize product"
            >
              <UIcon name="settings-sliders" size={14} />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

