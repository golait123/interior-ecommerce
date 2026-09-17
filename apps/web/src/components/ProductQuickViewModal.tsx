import React, { useState } from 'react';
import { X, ShoppingBag, Check, Star, ShieldCheck, Truck, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../api/products';
import toast from 'react-hot-toast';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => Promise<void>;
}

export function ProductQuickViewModal({ product, onClose, onAddToCart }: ProductQuickViewModalProps) {
  if (!product) return null;

  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const curPrice = Number(product.discountPrice || product.price);
  const origPrice = Number(product.price);
  const hasDiscount = product.discountPrice !== null && Number(product.discountPrice) < origPrice;
  const discountPct = hasDiscount ? Math.round(((origPrice - curPrice) / origPrice) * 100) : null;
  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[selectedImageIdx] || images[0];

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(product, quantity);
      onClose();
    } catch {
      // toast handled in parent
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 110 }}>
      <div 
        className="modal-box bg-white overflow-hidden shadow-2xl relative" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px', width: '95%', padding: '0', borderRadius: '8px' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-dark shadow flex items-center justify-center border-none cursor-pointer transition-all"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Image Gallery */}
          <div className="p-6 bg-[#fbf9f5] border-r flex flex-col justify-between" style={{ borderColor: '#ded9d0' }}>
            <div className="w-full h-80 bg-white border rounded overflow-hidden relative shadow-inner" style={{ borderColor: '#ded9d0' }}>
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full gradient-bg gradient-${product.type.toLowerCase()}`} />
              )}

              {hasDiscount && (
                <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                  {discountPct}% OFF
                </span>
              )}

              <span className={`absolute bottom-3 left-3 badge ${product.isCustomizable ? 'badge-blue' : 'badge-yellow'} text-xs shadow-sm`}>
                {product.isCustomizable ? '✨ BESPOKE CUSTOMIZABLE' : '🏺 BANJARA CURATED'}
              </span>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-14 h-14 rounded border overflow-hidden p-0 flex-shrink-0 cursor-pointer transition-all ${
                      selectedImageIdx === idx ? 'border-accent ring-2 ring-accent/30' : 'border-[#ded9d0] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Guarantees */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t text-[11px] text-muted" style={{ borderColor: '#ded9d0' }}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-accent" />
                <span>Authentic Banjara Craft</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-accent" />
                <span>Insured Indian Delivery</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between bg-white">
            <div>
              {/* Category & Spaces Header */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge badge-gray text-xs">{product.category?.name || 'Home Decor'}</span>
                {product.primaryDomain && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    product.primaryDomain === 'outdoor' 
                      ? 'bg-[#dce9d8] text-[#2e5926]' 
                      : product.primaryDomain === 'both'
                      ? 'bg-[#ede3f7] text-[#552d79]'
                      : 'bg-[#f4ebd9] text-[#795627]'
                  }`}>
                    {product.primaryDomain === 'outdoor' ? '🌿 Outdoor Space' : product.primaryDomain === 'both' ? '🏠🌿 Indoor & Outdoor' : '🏠 Indoor Space'}
                  </span>
                )}
                {product.spaces && product.spaces.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1">
                    {product.spaces.slice(0, 3).map(s => (
                      <span key={s.slug} className="text-xs text-accent font-medium bg-[#f5efe6] px-2 py-0.5 rounded flex items-center gap-1">
                        <span>{s.icon}</span>
                        <span>{s.name}</span>
                      </span>
                    ))}
                  </div>
                ) : product.rooms && product.rooms.length > 0 ? (
                  <span className="text-xs text-accent font-medium bg-[#f5efe6] px-2 py-0.5 rounded">
                    📍 {product.rooms.slice(0, 2).join(' • ')}
                  </span>
                ) : null}
              </div>

              {/* Product Title */}
              <h2 className="text-2xl font-normal text-dark m-0 leading-snug">
                {product.name}
              </h2>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 my-3">
                <span className="text-2xl font-bold text-accent font-playfair">
                  ₹{curPrice.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-base text-muted line-through">
                    ₹{origPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-muted">/ {product.unit}</span>
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  In Stock • Ready to Dispatch from Gurugram
                </span>
              </div>

              {/* Description */}
              <p className="text-xs md:text-sm text-muted leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Botanical Freshness & Health Benefits */}
              {product.botanicalBenefits && product.botanicalBenefits.length > 0 && (
                <div className="bg-[#f2f8f1] p-3.5 rounded border border-[#cbe1c7] mb-4 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#2a5424] mb-2 uppercase text-[11px] tracking-wider">
                    <span>🌱</span>
                    <span>Freshness & Wellness Benefits:</span>
                  </div>
                  <ul className="m-0 pl-4 space-y-1.5 text-[#2d4d28] list-disc font-medium">
                    {product.botanicalBenefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="leading-snug">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specs & Material */}
              <div className="bg-[#faf8f5] p-3.5 rounded border text-xs space-y-1.5 mb-6" style={{ borderColor: '#ded9d0' }}>
                {product.material && (
                  <div className="flex justify-between">
                    <span className="text-muted">Material:</span>
                    <span className="font-semibold text-dark">{product.material}</span>
                  </div>
                )}
                {product.finish && (
                  <div className="flex justify-between">
                    <span className="text-muted">Finish:</span>
                    <span className="font-semibold text-dark">{product.finish}</span>
                  </div>
                )}
                {product.pricePerSqFt && (
                  <div className="flex justify-between">
                    <span className="text-muted">Rate per sq ft:</span>
                    <span className="font-semibold text-accent">₹{product.pricePerSqFt}/sq ft</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div>
              {product.isCustomizable ? (
                <div className="space-y-2">
                  <a
                    href="#custom"
                    onClick={onClose}
                    className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold"
                  >
                    <Sparkles size={16} />
                    <span>Calculate Custom Wall Dimensions</span>
                  </a>
                  <Link
                    to={`/products/${product.id}`}
                    onClick={onClose}
                    className="btn btn-ghost w-full text-xs text-center text-muted hover:text-dark block"
                  >
                    View Product Details & Specifications →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-dark">Quantity:</span>
                    <div className="qty-control rounded" style={{ border: '1px solid #ded9d0' }}>
                      <button 
                        type="button" 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1 cursor-pointer font-bold text-dark hover:bg-gray-100 border-none bg-transparent"
                      >
                        -
                      </button>
                      <input 
                        type="text" 
                        value={quantity} 
                        readOnly 
                        className="w-10 text-center text-xs font-semibold border-none bg-transparent"
                      />
                      <button 
                        type="button" 
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1 cursor-pointer font-bold text-dark hover:bg-gray-100 border-none bg-transparent"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-muted ml-auto">
                      Subtotal: <strong className="text-dark">₹{(curPrice * quantity).toLocaleString('en-IN')}</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isAdding}
                    className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-sm cursor-pointer"
                  >
                    <ShoppingBag size={16} />
                    <span>{isAdding ? 'Adding to cart...' : `Add to Cart • ₹${(curPrice * quantity).toLocaleString('en-IN')}`}</span>
                  </button>

                  <div className="text-center">
                    <Link
                      to={`/products/${product.id}`}
                      onClick={onClose}
                      className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Full Product Story & Customer Reviews</span>
                      <ChevronRight size={13} />
                    </Link>
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
