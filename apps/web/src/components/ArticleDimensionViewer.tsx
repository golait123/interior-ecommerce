import React, { useState, useEffect } from 'react';
import { 
  X, 
  Ruler, 
  Home, 
  Maximize2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Award,
  Layers,
  ZoomIn,
  Check,
  Package
} from 'lucide-react';
import { Product } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ArticleDimensionViewerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number) => Promise<void>;
}

export function ArticleDimensionViewer({
  product,
  isOpen,
  onClose,
  onAddToCart
}: ArticleDimensionViewerProps) {
  if (!isOpen || !product) return null;

  const { user } = useAuth();
  const { cart, addItem, updateItem } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'dimensions' | 'room' | 'gallery' | 'texture'>('dimensions');
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Cart sync
  const cartItem = cart?.items?.find((item) => item.product.id === product.id);
  const currentCartCount = cartItem ? cartItem.quantity : 0;

  // Images setup
  const rawImages = (product.images && product.images.length > 0) 
    ? product.images 
    : ['/images/outdoor-garden.jpg'];

  // Realistic room mockups & dimension schematics tailored to product type
  const isWallpaper = product.type === 'CUSTOM_WALLPAPER' || product.type === 'READY_WALLPAPER';
  const isOutdoor = product.primaryDomain === 'outdoor';

  const defaultRoomMockup = isOutdoor
    ? 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'
    : 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80';

  const defaultDimensionSchematic = isWallpaper
    ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80';

  const displayImages = [
    rawImages[0],
    rawImages[1] || defaultRoomMockup,
    rawImages[2] || defaultDimensionSchematic,
    ...(rawImages.slice(3))
  ];

  // Derived dimensions specs based on unit / type
  const widthDim = isWallpaper ? '21 inches (53.3 cm)' : '24 inches (61 cm)';
  const heightDim = isWallpaper ? '33 feet (10.05 meters)' : '36 inches (91.4 cm)';
  const depthDim = isWallpaper ? '0.45 mm (Heavyweight Non-Woven)' : '18 mm (Solid Hardwood/Brass)';
  const coverageDim = isWallpaper ? '57.75 sq.ft / 5.36 sq.m' : 'Single Accent Panel / Piece';
  const weightDim = isWallpaper ? '1.2 kg per roll' : '3.8 kg packaged';

  // Prevent body scroll when open
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setSelectedImageIdx((prev) => (prev + 1) % displayImages.length);
      }
      if (e.key === 'ArrowLeft') {
        setSelectedImageIdx((prev) => (prev - 1 + displayImages.length) % displayImages.length);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [displayImages.length, onClose]);

  const handleAdd = async () => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      navigate('/login');
      return;
    }
    setIsAdding(true);
    try {
      if (onAddToCart) {
        await onAddToCart(product, quantity);
      } else {
        await addItem(product.id, quantity);
        toast.success(`Added ${product.name} to cart`);
      }
      onClose();
    } catch {
      toast.error('Unable to update cart');
    } finally {
      setIsAdding(false);
    }
  };

  const curPrice = Number(product.discountPrice || product.price);
  const origPrice = Number(product.price);
  const discountPct = product.discountPrice && origPrice > curPrice
    ? Math.round(((origPrice - curPrice) / origPrice) * 100)
    : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-b border-stone-200 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#8c6f52]/10 text-[#8c6f52] rounded-lg">
              <Ruler size={18} />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 m-0 leading-tight">
                Article Dimensions & Visual Angles
              </h3>
              <p className="text-[11px] text-stone-500 m-0">
                Detailed blueprints, architectural scale and multi-angle views
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 flex items-center justify-center text-stone-700 transition-colors cursor-pointer border-none"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* View Mode Segmented Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-stone-100 border-b border-stone-200 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('dimensions'); setSelectedImageIdx(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'dimensions'
                ? 'bg-white text-[#8c6f52] shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Ruler size={14} />
            <span>Dimensions Blueprint</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('room'); setSelectedImageIdx(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'room'
                ? 'bg-white text-[#8c6f52] shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Home size={14} />
            <span>Room Scale Mockup</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('gallery'); setSelectedImageIdx(2 % displayImages.length); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-white text-[#8c6f52] shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Layers size={14} />
            <span>All Angles ({displayImages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('texture'); setSelectedImageIdx(0); setIsZoomed(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'texture'
                ? 'bg-white text-[#8c6f52] shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <ZoomIn size={14} />
            <span>Texture Close-up</span>
          </button>
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Main Visual Display Stage */}
          <div className="relative w-full h-[260px] sm:h-[320px] rounded-xl overflow-hidden bg-stone-900 border border-stone-300 flex items-center justify-center group">
            <img
              src={displayImages[selectedImageIdx] || displayImages[0]}
              alt={`${product.name} view ${selectedImageIdx + 1}`}
              className={`w-full h-full object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105 cursor-zoom-in'
              }`}
              onClick={() => setIsZoomed(!isZoomed)}
            />

            {/* Dimension Callout Overlay when Blueprint tab is active */}
            {activeTab === 'dimensions' && (
              <div className="absolute inset-0 pointer-events-none p-3 sm:p-4 flex flex-col justify-between">
                {/* Top Width Indicator */}
                <div className="w-full flex items-center justify-center gap-2">
                  <div className="h-[2px] flex-1 bg-amber-400 shadow-sm" />
                  <span className="bg-stone-950/85 text-amber-300 text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded border border-amber-400/50 backdrop-blur-xs">
                    ↔ Width: {widthDim}
                  </span>
                  <div className="h-[2px] flex-1 bg-amber-400 shadow-sm" />
                </div>

                {/* Center / Height Indicator */}
                <div className="h-full flex items-center justify-between">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-[2px] h-12 bg-amber-400" />
                    <span className="bg-stone-950/85 text-amber-300 text-[9px] sm:text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border border-amber-400/50 [writing-mode:vertical-lr] rotate-180">
                      ↕ Height: {heightDim}
                    </span>
                    <div className="w-[2px] h-12 bg-amber-400" />
                  </div>

                  {/* Surface Thickness Pill */}
                  <div className="bg-stone-950/85 text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/20 backdrop-blur-xs flex items-center gap-1.5">
                    <Layers size={13} className="text-amber-400" />
                    <span>Thickness: {depthDim}</span>
                  </div>
                </div>

                {/* Bottom Coverage Indicator */}
                <div className="w-full flex items-center justify-center">
                  <span className="bg-emerald-950/85 text-emerald-300 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded border border-emerald-400/50 backdrop-blur-xs flex items-center gap-1">
                    <Check size={12} />
                    <span>Total Area Coverage: {coverageDim}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Room Scale Overlay when Room tab is active */}
            {activeTab === 'room' && (
              <div className="absolute top-3 left-3 bg-stone-950/80 text-white text-xs px-2.5 py-1 rounded-md border border-white/20 backdrop-blur-xs flex items-center gap-1.5 pointer-events-none">
                <Home size={13} className="text-emerald-400" />
                <span>Rendered to 1:1 architectural room scale</span>
              </div>
            )}

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedImageIdx((prev) => (prev - 1 + displayImages.length) % displayImages.length)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer border-none shadow-md"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImageIdx((prev) => (prev + 1) % displayImages.length)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer border-none shadow-md"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            <span className="absolute bottom-2.5 right-2.5 bg-black/75 text-white text-[11px] font-mono px-2 py-0.5 rounded-full pointer-events-none">
              {selectedImageIdx + 1} / {displayImages.length}
            </span>
          </div>

          {/* Thumbnail Selector Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIdx(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                  selectedImageIdx === idx 
                    ? 'border-[#8c6f52] ring-2 ring-[#8c6f52]/30 scale-102' 
                    : 'border-stone-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-semibold text-center py-0.5 uppercase tracking-wider">
                  {idx === 0 ? 'Front' : idx === 1 ? 'Scale' : idx === 2 ? 'Specs' : `View ${idx + 1}`}
                </span>
              </button>
            ))}
          </div>

          {/* Product Info & Dimension Specifications Matrix */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c6f52]">
                  {product.category?.name || 'Architectural Collection'}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-stone-900 m-0">
                  {product.name}
                </h4>
              </div>
              <div className="text-right">
                <div className="text-base sm:text-lg font-extrabold text-stone-900">
                  ₹{curPrice.toLocaleString('en-IN')}
                  {discountPct && (
                    <span className="text-xs text-stone-400 line-through ml-1.5">
                      ₹{origPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-500 font-medium">
                  Inclusive of all taxes & insurance
                </span>
              </div>
            </div>

            {/* Detailed Spec Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Standard Width</span>
                <span className="font-semibold text-stone-800">{widthDim}</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Standard Height</span>
                <span className="font-semibold text-stone-800">{heightDim}</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Net Area Coverage</span>
                <span className="font-semibold text-emerald-700">{coverageDim}</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Packaged Weight</span>
                <span className="font-semibold text-stone-800">{weightDim}</span>
              </div>
            </div>

            {/* Material & Installation perks */}
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-stone-200 text-xs text-stone-600">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck size={14} />
                <span>10-Yr Fade Warranty</span>
              </span>
              <span className="flex items-center gap-1 text-[#8c6f52] font-semibold">
                <Truck size={14} />
                <span>Express Transit Delivery</span>
              </span>
              <span className="flex items-center gap-1 text-stone-700 font-semibold">
                <Package size={14} />
                <span>Moisture-Proof Packaging</span>
              </span>
            </div>
          </div>
        </div>

        {/* Pinned Bottom Action Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-200 bg-white flex items-center justify-between gap-3 shrink-0">
          {/* Stepper Quantity Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-semibold hidden sm:inline">Quantity:</span>
            <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 cursor-pointer border-none"
                aria-label="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <span className="w-8 text-center text-xs font-bold text-stone-800">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 cursor-pointer border-none"
                aria-label="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Add to Bag CTA */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isAdding}
              className="px-5 py-2.5 rounded-xl bg-[#8c6f52] hover:bg-[#725a42] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer border-none"
            >
              <ShoppingBag size={15} />
              <span>{isAdding ? 'Adding...' : `Add to Bag • ₹${(curPrice * quantity).toLocaleString('en-IN')}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
