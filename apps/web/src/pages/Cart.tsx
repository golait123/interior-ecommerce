import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, getItemUnitPrice } from '../contexts/CartContext';
import { useLocationContext } from '../contexts/LocationContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck, Sparkles, ChevronRight } from 'lucide-react';

export default function Cart() {
  const { cart, itemCount, subtotal, updateItem, removeItem } = useCart();
  const { currentCountry, formatPrice } = useLocationContext();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const taxRate = currentCountry.tax.rate;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="page-wrapper bg-white">
      <Header />
      
      <main className="page py-8">
        {/* EDITORIAL BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs text-muted mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-dark">Home</Link>
          <ChevronRight size={12} />
          <span className="text-dark font-medium">Shopping Bag</span>
        </nav>

        {/* EDITORIAL PAGE HEADER (HOME TEMPLATE) */}
        <div className="mb-10 pb-6 border-b border-[#eaeaea]">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-green text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5">
              Curated Bag
            </span>
            <span className="text-xs text-muted">
              {itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'} Selected
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-normal text-dark tracking-tight m-0">
            Your Sanctuary Selection
          </h1>
          <p className="text-muted text-sm sm:text-base mt-2 max-w-2xl font-light">
            Handcrafted architectural furnishings, made-to-measure murals, and living botanical decor reserved for your space.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#faf9f7] border border-[#ded9d0] rounded-lg max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-[#e0dad0] text-muted">
              <ShoppingBag size={28} />
            </div>
            <h2 className="font-serif italic text-2xl mb-2 text-dark">Your bag is currently vacant</h2>
            <p className="text-muted text-sm max-w-md mx-auto mb-6">
              Explore our master artisan collections of Sheesham woodwork, bespoke wallpaper murals, and botanical decor to furnish your sanctuary.
            </p>
            <Link 
              to="/shop" 
              className="btn btn-primary inline-flex items-center gap-2 py-3 px-8 text-sm"
            >
              <span>Explore The Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="cart-page-grid">
            
            {/* ITEMS LIST COLUMN */}
            <div className="cart-items-column">
              {items.map(item => {
                const isCustom = Boolean(item.customization && (item.customization.unitPrice || item.customization.materialCost || item.customization.spaceName || item.customization.width));
                const unitPrice = getItemUnitPrice(item);
                const originalPrice = isCustom ? Math.round(unitPrice * 1.35) : Number(item.product.price);
                const lineTotal = unitPrice * item.quantity;
                const isNursery = item.customization?.bespokeType === 'Nursery Architectural Commission' || Boolean(item.customization?.spaceName);
                const hasValidCustomization = Boolean(item.customization?.width && item.customization?.height);

                return (
                  <div key={item.id} className="cart-item-card">
                    {/* Left: Image & Specs */}
                    <div className="cart-item-left">
                      {/* Proportional Studio Image Window */}
                      <div className="cart-item-img-window">
                        {item.product.images?.[0] ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <Sparkles size={20} />
                          </div>
                        )}
                      </div>

                      {/* Product Metadata & Price */}
                      <div className="cart-item-info">
                        <span className="cart-item-subtitle">
                          {isNursery ? 'Nurserylive Curated Botanical Sanctuary' : (item.product.category?.name || 'InteriorG Studio Piece')}
                        </span>
                        
                        <Link to={`/products/${item.product.id}`} className="cart-item-title">
                          {isNursery && item.customization?.spaceName ? `${item.customization.spaceName} — Bespoke Nursery` : item.product.name}
                        </Link>

                        <div className="cart-item-price-row">
                          <span className="cart-item-price-current">
                            {formatPrice(unitPrice)}
                          </span>
                          <span className="cart-item-price-original">
                            {formatPrice(originalPrice)}
                          </span>
                          <span className="cart-item-price-unit">/ {isNursery ? 'complete set' : (item.product.unit || 'piece')}</span>
                        </div>

                        {/* Made-to-Measure / Bespoke Nursery Customization badge */}
                        {isNursery ? (
                          <div className="cart-item-m2m-badge" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
                            <div style={{ fontWeight: 700, marginBottom: 2 }}>
                              🌿 {item.customization.spaceName || 'Bespoke Nursery'} ({item.customization.dimensions || `${item.customization.width}×${item.customization.height} ft`})
                            </div>
                            {item.customization.plantPack && (
                              <div style={{ fontSize: 11 }}>• <strong>Pack:</strong> {item.customization.plantPack} ({item.customization.plantCount || 'Certified specimens'})</div>
                            )}
                            {item.customization.planterType && (
                              <div style={{ fontSize: 11 }}>• <strong>Pots:</strong> {item.customization.planterType} ({item.customization.planterFinish})</div>
                            )}
                            {item.customization.addonsSelected?.length > 0 && (
                              <div style={{ fontSize: 10.5, color: '#15803d' }}>• <strong>Living Accents:</strong> {item.customization.addonsSelected.join(', ')}</div>
                            )}
                          </div>
                        ) : hasValidCustomization ? (
                          <div className="cart-item-m2m-badge">
                            <span>📐 Made-to-Measure:</span>
                            <span>{item.customization.width} × {item.customization.height} {item.customization.unit || 'ft'}</span>
                            {item.customization.walls && <span>• {item.customization.walls} Wall(s)</span>}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Right: Quantity Stepper, Line Total & Remove */}
                    <div className="cart-item-controls">
                      {/* Interactive Capsule Stepper */}
                      <div className="cart-item-stepper">
                        <button 
                          type="button"
                          onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                          className="cart-item-stepper-btn"
                          title="Reduce quantity"
                          aria-label="Reduce quantity"
                        >
                          -
                        </button>
                        <input 
                          type="text" 
                          value={item.quantity} 
                          readOnly 
                          className="cart-item-stepper-val" 
                          aria-label="Selected quantity"
                        />
                        <button 
                          type="button"
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="cart-item-stepper-btn"
                          title="Increase quantity"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="cart-item-total-col">
                        <span className="cart-item-total-label">Subtotal</span>
                        <span className="cart-item-total-val">
                          {formatPrice(lineTotal)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button 
                        type="button"
                        className="cart-item-remove-btn" 
                        onClick={() => removeItem(item.id)}
                        title="Remove piece from bag"
                        aria-label="Remove piece from bag"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SUMMARY COLUMN */}
            <div className="lg:col-span-4">
              <div 
                className="bg-[#faf9f7] border border-[#ded9d0] p-6 rounded-lg sticky top-28 shadow-sm"
              >
                <div className="flex items-center justify-between pb-4 border-b border-[#e5dfd5] mb-4">
                  <h3 className="font-serif italic text-xl m-0 text-dark">Order Summary</h3>
                  <span className="text-xs font-mono text-muted uppercase">{currentCountry.currency.code} ({currentCountry.currency.symbol})</span>
                </div>

                <div className="space-y-3 text-sm text-stone-700 mb-6">
                  <div className="flex justify-between">
                    <span>Selected Pieces ({itemCount})</span>
                    <span className="font-medium text-dark">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{currentCountry.tax.name} ({(taxRate * 100).toFixed(0)}%)</span>
                    <span className="font-medium text-dark">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[#3c6e47] bg-[#eff5f0] p-2 rounded">
                    <span className="flex items-center gap-1 font-medium">
                      <Truck size={14} /> White-Glove Delivery
                    </span>
                    <span className="font-semibold uppercase">Complimentary</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-4 border-t border-[#e5dfd5] mb-6">
                  <span className="font-serif text-lg text-dark">Total Investment</span>
                  <span className="text-2xl font-serif font-semibold text-dark">
                    {formatPrice(total)}
                  </span>
                </div>

                <button 
                  className="btn btn-primary w-full py-3.5 px-6 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  onClick={() => navigate('/checkout')}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-[#e5dfd5] space-y-2 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-[#6a8c6f]" />
                    <span>Direct from Sector 58 Banjara Master Artisans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={15} className="text-[#6a8c6f]" />
                    <span>Tracked & insured transit with protective crating</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

