import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Star, 
  ShieldCheck, 
  Truck, 
  Award, 
  Sparkles, 
  ChevronRight, 
  ArrowRight,
  Leaf,
  Layers,
  Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../api/products';
import { ImageZoomViewer } from './ImageZoomViewer';
import { useLocationContext } from '../contexts/LocationContext';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => Promise<void>;
}

export function ProductQuickViewModal({ product, onClose, onAddToCart }: ProductQuickViewModalProps) {
  if (!product) return null;

  const { formatPrice, currentCountry } = useLocationContext();
  const navigate = useNavigate();
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent background body scroll while modal is open
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  const curPrice = Number(product.discountPrice || product.price);
  const origPrice = Number(product.price);
  const hasDiscount = product.discountPrice !== null && Number(product.discountPrice) < origPrice;
  const discountPct = hasDiscount ? Math.round(((origPrice - curPrice) / origPrice) * 100) : null;
  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[selectedImageIdx] || images[0] || null;

  const availableStock = product.inventoryAvailable !== undefined 
    ? product.inventoryAvailable 
    : product.inventory 
      ? (product.inventory.totalQuantity - product.inventory.reservedQuantity - (product.inventory.damagedQuantity || 0)) 
      : 10;
  const isOutOfStock = product.inStock === false || availableStock <= 0;

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(product, quantity);
      onClose();
    } catch {
      // Toast notification is managed by parent
    } finally {
      setIsAdding(false);
    }
  };

  const handleViewFullPage = () => {
    onClose();
    navigate(`/products/${product.id}`);
  };

  return (
    <div className="quickview-backdrop" onClick={onClose}>
      <div 
        className="quickview-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Quick View: ${product.name}`}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="quickview-close-btn"
          aria-label="Close Quick View"
          type="button"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto flex-1">
          {/* ================================================================= */}
          {/* LEFT: IMAGE GALLERY WITH STANDARD ASPECT RATIO                    */}
          {/* ================================================================= */}
          <div className="p-5 sm:p-6 bg-[#f8fafc] border-b md:border-b-0 md:border-r border-[#cbdceb]/80 flex flex-col justify-between">
            <div>
              {/* Main Product Showcase Box */}
              <ImageZoomViewer
                src={currentImage}
                alt={product.name}
                aspectRatio="4/5"
                fallbackGradient={`gradient-${product.type.toLowerCase()}`}
                className="w-full max-h-[380px] md:max-h-[420px] mb-3"
                badges={
                  <>
                    {hasDiscount && (
                      <span className="bg-[#be123c] text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded shadow-sm">
                        {discountPct}% OFF
                      </span>
                    )}
                    <span className="bg-[#0f2444] text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded shadow-sm">
                      {product.isCustomizable ? '✨ BESPOKE' : '🏺 HANDCRAFTED'}
                    </span>
                  </>
                }
              />

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1.5 pt-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`product-thumbnail-btn ${selectedImageIdx === idx ? 'active' : ''}`}
                      aria-label={`Select product image view ${idx + 1}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Guarantee Row */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#cbdceb]/70 text-[11px] text-[#536b88]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#0f2444] flex-shrink-0" />
                <span className="truncate font-medium">100% Authentic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-[#0f2444] flex-shrink-0" />
                <span className="truncate font-medium">Insured Transit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award size={14} className="text-[#0f2444] flex-shrink-0" />
                <span className="truncate font-medium">1-Yr Warranty</span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT: EDITORIAL DETAILS & BUYING FLOW                            */}
          {/* ================================================================= */}
          <div className="p-5 sm:p-7 flex flex-col justify-between bg-white overflow-y-auto">
            <div>
              {/* Category, Space & Provenance Header */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f2444] bg-[#edf4fc] border border-[#cbdceb] px-2.5 py-0.5 rounded-full">
                  {product.category?.name || 'InteriorG Collection'}
                </span>

                {product.primaryDomain && (
                  <span className={`text-[10px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${
                    product.primaryDomain === 'outdoor' 
                      ? 'bg-[#dce9d8] text-[#2e5926]' 
                      : product.primaryDomain === 'both'
                      ? 'bg-[#ede3f7] text-[#552d79]'
                      : 'bg-[#f0f5fc] text-[#0f2444]'
                  }`}>
                    {product.primaryDomain === 'outdoor' ? '🌿 Outdoor & Garden' : product.primaryDomain === 'both' ? '🏡 Indoor & Outdoor' : '🛋️ Indoor Living'}
                  </span>
                )}
              </div>

              {/* Product Title in Italic Serif */}
              <h2 className="text-xl sm:text-2xl font-serif italic font-normal text-[#0a192f] m-0 mb-2 leading-tight">
                {product.name}
              </h2>

              {/* Rating & Review Badge */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#0a192f]">4.9</span>
                <span className="text-xs text-[#536b88]">• 48 Verified Customer Reviews</span>
              </div>

              {/* Price Presentation */}
              <div className="mb-3.5 pb-3 border-b border-[#e2e8f0]">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl font-serif font-bold text-[#0f2444]">
                    {formatPrice(curPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-[#8fa4bf] line-through">
                      {formatPrice(origPrice)}
                    </span>
                  )}
                  <span className="text-xs text-[#536b88] uppercase tracking-wider">
                    / {product.unit || 'piece'}
                  </span>
                </div>
                <p className="text-[11px] text-[#536b88] mt-1 m-0">
                  Inclusive of {currentCountry.tax.name} • {currentCountry.deliveryNotice}
                </p>
              </div>

              {/* Live Inventory Status */}
              <div className="mb-3.5">
                <span className="inline-flex items-center gap-2 text-xs text-[#15803d] font-semibold bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse"></span>
                  <span>In Stock • Ready for Express Dispatch in 24–48 Hours</span>
                </span>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Botanical Benefits Pills (If Available) */}
              {product.botanicalBenefits && product.botanicalBenefits.length > 0 && (
                <div className="bg-[#f0f7ef] p-3 rounded-xl border border-[#cbe1c7] mb-4">
                  <div className="flex items-center gap-1.5 font-bold text-[#2e5926] mb-1.5 text-xs">
                    <Leaf size={13} className="text-[#2e5926]" />
                    <span>Botanical Living Attributes:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.botanicalBenefits.slice(0, 2).map((benefit, bIdx) => (
                      <span key={bIdx} className="text-[11px] font-medium bg-white text-[#2e5926] px-2.5 py-0.5 rounded-md border border-[#cbe1c7]">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Architectural Specifications Grid */}
              <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#cbdceb] text-xs grid grid-cols-2 gap-2 mb-4">
                {product.material && (
                  <div>
                    <span className="text-[#536b88] block text-[11px]">Material</span>
                    <span className="font-semibold text-[#0a192f]">{product.material}</span>
                  </div>
                )}
                {product.finish && (
                  <div>
                    <span className="text-[#536b88] block text-[11px]">Finish</span>
                    <span className="font-semibold text-[#0a192f]">{product.finish}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#536b88] block text-[11px]">SKU Reference</span>
                  <span className="font-mono text-[11px] font-semibold text-[#0a192f]">{product.sku}</span>
                </div>
                {product.pricePerSqFt && (
                  <div>
                    <span className="text-[#536b88] block text-[11px]">Bespoke Rate</span>
                    <span className="font-semibold text-[#0f2444]">₹{product.pricePerSqFt}/sq ft</span>
                  </div>
                )}
              </div>
            </div>

            {/* =============================================================== */}
            {/* BOTTOM COMMERCE ACTIONS                                         */}
            {/* =============================================================== */}
            <div className="pt-3 border-t border-[#e2e8f0]">
              {product.isCustomizable ? (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleViewFullPage}
                    className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-wider font-semibold"
                  >
                    <Sparkles size={14} />
                    <span>Configure Custom Wall Dimensions</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleViewFullPage}
                    className="w-full text-xs text-center text-[#0f2444] hover:text-[#1b3a6b] font-semibold py-1.5 flex items-center justify-center gap-1"
                  >
                    <span>View Architectural Specifications & Gallery</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Quantity and Subtotal Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-[#0a192f]">Quantity:</span>
                      <div className="inline-flex items-center rounded-lg bg-[#f8fafc] border border-[#cbdceb] overflow-hidden">
                        <button 
                          type="button" 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#0a192f] hover:bg-[#edf4fc] cursor-pointer border-none bg-transparent"
                          aria-label="Decrease quantity"
                        >
                          &minus;
                        </button>
                        <span className="w-9 text-center text-xs font-bold text-[#0a192f]">
                          {quantity}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#0a192f] hover:bg-[#edf4fc] cursor-pointer border-none bg-transparent"
                          aria-label="Increase quantity"
                        >
                          &#43;
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-[#536b88] block">Subtotal</span>
                      <strong className="text-sm font-serif font-bold text-[#0f2444]">
                        {formatPrice(curPrice * quantity)}
                      </strong>
                    </div>
                  </div>

                  {/* Add to Cart CTA or Sold Out */}
                  {isOutOfStock ? (
                    <div className="w-full py-3 px-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-center text-xs font-semibold">
                      ⚠️ This article is currently out of stock and cannot be ordered.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={isAdding}
                      className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-wider font-semibold cursor-pointer shadow-md"
                    >
                      <ShoppingBag size={15} />
                      <span>{isAdding ? 'Adding to Bag...' : `Add to Bag • ${formatPrice(curPrice * quantity)}`}</span>
                    </button>
                  )}

                  {/* Direct Link to Full Product Page */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleViewFullPage}
                      className="text-xs text-[#0f2444] hover:text-[#1b3a6b] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      <span>Explore Complete Heritage Story & Specifications</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
