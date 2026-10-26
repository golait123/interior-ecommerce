import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../api/products';
import { Eye, Ban, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart, setPendingCartItem } from '../contexts/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const { user } = useAuth();
  const { cart, addItem, updateItem, removeItem } = useCart();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Cart item lookup & quantity count
  const cartItem = cart?.items?.find((item) => item.product.id === product.id);
  const itemCount = cartItem ? cartItem.quantity : 0;

  const handleIncrement = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user) {
      setPendingCartItem({
        productId: product.id,
        quantity: 1,
        productName: product.name,
        returnTo: window.location.pathname + window.location.search,
      });
      toast('Please sign in to add this item to your cart. We\'ve saved your selection!', {
        id: 'signin-to-add-toast',
        icon: '🔐',
        duration: 4000,
      });
      navigate('/login?returnTo=/cart&reason=add_to_cart');
      return;
    }
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      if (itemCount === 0) {
        if (onAddToCart) {
          onAddToCart(product);
        } else {
          await addItem(product.id, 1);
          toast.success(`Added ${product.name} to bag!`);
        }
      } else if (cartItem) {
        await updateItem(cartItem.id, itemCount + 1);
      }
    } catch {
      toast.error('Could not update cart quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      if (itemCount === 1 && cartItem) {
        await removeItem(cartItem.id);
        toast('Removed from bag', { icon: '🗑️' });
      } else if (itemCount > 1 && cartItem) {
        await updateItem(cartItem.id, itemCount - 1);
      }
    } catch {
      toast.error('Could not update cart quantity');
    } finally {
      setIsUpdating(false);
    }
  };

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

  // Multi-image handling with fallback
  const fallbackImg = '/images/outdoor-garden.jpg';
  const rawImages = product.images && product.images.length > 0 ? product.images : [fallbackImg];
  const activeImg = rawImages[activeImgIdx % rawImages.length] || fallbackImg;
  const [imgSrc, setImgSrc] = useState(activeImg);

  useEffect(() => {
    const nextImg = rawImages[activeImgIdx % rawImages.length] || fallbackImg;
    setImgSrc(nextImg);
  }, [activeImgIdx, product.images]);

  // Touch Swipe for mobile devices
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 35 && rawImages.length > 1) {
      if (diff > 0) {
        setActiveImgIdx((prev) => (prev + 1) % rawImages.length);
      } else {
        setActiveImgIdx((prev) => (prev - 1 + rawImages.length) % rawImages.length);
      }
    }
    setTouchStartX(null);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev - 1 + rawImages.length) % rawImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev + 1) % rawImages.length);
  };

  // Space / Room information
  const spaceItem = product.spaces && product.spaces.length > 0 ? product.spaces[0] : null;
  const roomName = product.rooms && product.rooms.length > 0 ? product.rooms[0] : null;
  const spaceLabel = spaceItem ? `${spaceItem.icon} ${spaceItem.name}` : roomName ? roomName : null;

  return (
    <div className={`product-card group ${isOutOfStock ? 'opacity-90' : ''}`}>
      {/* 1. Studio Image Box with Multi-Image Slider */}
      <div 
        className="product-card-image-wrapper relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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

        {/* Previous Image Chevron Button */}
        {rawImages.length > 1 && (
          <button
            type="button"
            onClick={handlePrevImage}
            className="card-slide-nav-btn prev"
            aria-label="Previous image"
            title="Previous picture"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Next Image Chevron Button */}
        {rawImages.length > 1 && (
          <button
            type="button"
            onClick={handleNextImage}
            className="card-slide-nav-btn next"
            aria-label="Next image"
            title="Next picture"
          >
            <ChevronRight size={16} />
          </button>
        )}

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

        {/* Top-Right Badge: Frosted Space Pill */}
        {spaceLabel && (
          <div className="product-badge-domain">
            <span>{spaceLabel}</span>
          </div>
        )}

        {/* Interactive Image Slide Dots & Counter Pill */}
        {rawImages.length > 1 && (
          <div 
            className="card-slide-indicators"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div className="card-slide-dots">
              {rawImages.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveImgIdx(i);
                  }}
                  className={`card-slide-dot ${(activeImgIdx % rawImages.length) === i ? 'active' : ''}`}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
            <span className="card-slide-counter">
              {(activeImgIdx % rawImages.length) + 1}/{rawImages.length}
            </span>
          </div>
        )}

        {/* Hover Action Bar: Centered Quick View */}
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
              <Eye size={13} />
              <span>Quick View</span>
            </button>
          )}

          {isOutOfStock ? (
            <div 
              className="product-btn-addtocart flex items-center justify-center gap-1.5"
              style={{ background: '#71717a', color: '#fff', cursor: 'not-allowed', opacity: 0.9 }}
              title="Article currently out of stock"
            >
              <Ban size={13} />
              <span>Sold Out</span>
            </div>
          ) : itemCount > 0 ? (
            <div 
              className="product-qty-stepper product-qty-stepper-overlay"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="product-qty-btn product-qty-minus"
                title="Decrease quantity"
                disabled={isUpdating}
              >
                <Minus size={13} />
              </button>
              <span className="product-qty-count">{itemCount} in Bag</span>
              <button
                type="button"
                onClick={handleIncrement}
                className="product-qty-btn product-qty-plus"
                title="Increase quantity"
                disabled={isUpdating}
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleIncrement}
              className="product-btn-addtocart flex items-center gap-1"
              title="Add to cart"
              disabled={isUpdating}
            >
              <Plus size={13} />
              <span>Add to Bag</span>
            </button>
          )}
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

        {/* 3. Proportional Price & Action Footer (Button perfectly contained inside card) */}
        <div className="product-card-footer">
          <div className="product-price-wrapper">
            <div className="product-price-main-row">
              <span className="product-price-current">
                {product.priceRange || `₹${curPrice.toLocaleString('en-IN')}`}
              </span>
              <span className="product-price-unit">
                /{product.unit || 'pc'}
              </span>
            </div>
            {isDiscounted && (
              <div className="product-price-sub-row">
                <span className="product-price-original">
                  ₹{origPrice.toLocaleString('en-IN')}
                </span>
                {discountPct ? (
                  <span className="product-price-discount-tag">
                    {discountPct}% OFF
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Quick Footer Action Button: Interactive +/- Stepper (Screenshot 2) */}
          {isOutOfStock ? (
            <span 
              className="product-footer-action-btn flex items-center justify-center"
              style={{ background: '#f4f4f5', color: '#a1a1aa', cursor: 'not-allowed', border: '1px solid #e4e4e7' }}
              title="Out of stock"
            >
              <Ban size={14} />
            </span>
          ) : itemCount > 0 ? (
            <div 
              className="product-qty-stepper"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="product-qty-btn product-qty-minus"
                title="Decrease quantity"
                disabled={isUpdating}
                aria-label="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <span className="product-qty-count">{itemCount}</span>
              <button
                type="button"
                onClick={handleIncrement}
                className="product-qty-btn product-qty-plus"
                title="Increase quantity"
                disabled={isUpdating}
                aria-label="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleIncrement}
              className="product-qty-add-btn"
              title="Add to cart"
              disabled={isUpdating}
              aria-label="Add to cart"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
