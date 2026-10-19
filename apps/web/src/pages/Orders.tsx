import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { useLocationContext } from '../contexts/LocationContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  Package, 
  Truck, 
  Calendar, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  MapPin 
} from 'lucide-react';

export default function Orders() {
  const { formatPrice } = useLocationContext();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.list
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-green text-xs font-semibold px-2.5 py-0.5">Delivered & Installed</span>;
      case 'SHIPPED':
        return <span className="badge badge-blue text-xs font-semibold px-2.5 py-0.5">In White-Glove Transit</span>;
      case 'PROCESSING':
        return <span className="badge badge-purple text-xs font-semibold px-2.5 py-0.5">Artisan Fabrication</span>;
      case 'CONFIRMED':
        return <span className="badge badge-yellow text-xs font-semibold px-2.5 py-0.5">Commission Confirmed</span>;
      case 'CANCELLED':
        return <span className="badge badge-red text-xs font-semibold px-2.5 py-0.5">Cancelled</span>;
      default:
        return <span className="badge badge-gray text-xs font-semibold px-2.5 py-0.5">{status}</span>;
    }
  };

  return (
    <div className="page-wrapper bg-white">
      <Header />

      <main className="page py-8">
        {/* EDITORIAL BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs text-muted mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-dark">Home</Link>
          <ChevronRight size={12} />
          <Link to="/customer/dashboard" className="hover:text-dark">Sanctuary Account</Link>
          <ChevronRight size={12} />
          <span className="text-dark font-medium">Order Archive</span>
        </nav>

        {/* EDITORIAL PAGE HEADER */}
        <div className="mb-10 pb-6 border-b border-[#eaeaea] flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-green text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5">
                Client Archive
              </span>
              <span className="text-xs text-muted">
                {orders?.length || 0} Total Records
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-normal text-dark tracking-tight m-0">
              Your Commissioned Orders
            </h1>
            <p className="text-muted text-sm sm:text-base mt-2 max-w-2xl font-light">
              Review fabrication progress, shipment trackers, and historical architectural commissions.
            </p>
          </div>

          <Link 
            to="/shop" 
            className="btn btn-secondary text-xs uppercase tracking-wider px-5 py-2.5 inline-flex items-center gap-2"
          >
            <span>Explore New Pieces</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-muted">
            <div className="loading-spinner mb-4 mx-auto" />
            <p className="font-serif italic text-lg">Retrieving your sanctuary records...</p>
          </div>
        ) : !orders?.length ? (
          <div className="text-center py-16 px-4 bg-[#faf9f7] border border-[#ded9d0] rounded-lg max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-[#e0dad0] text-muted">
              <Package size={28} />
            </div>
            <h2 className="font-serif italic text-2xl mb-2 text-dark">No Commissions Placed Yet</h2>
            <p className="text-muted text-sm max-w-md mx-auto mb-6">
              When you order custom wall murals, living botanical arrangements, or architectural furniture from InteriorG, your records will appear here.
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
          <div className="space-y-6">
            {orders.map(order => {
              const isExpanded = expandedId === order.id;
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <div 
                  key={order.id} 
                  className={`bg-white border transition-all rounded-lg overflow-hidden ${
                    isExpanded ? 'border-[var(--navy)] shadow-md' : 'border-[#eaeaea] hover:border-[var(--border-navy)]'
                  }`}
                >
                  {/* CARD HEADER ROW */}
                  <div 
                    className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#f8fafc]"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white border border-[#e0dad0] flex items-center justify-center text-[var(--navy)] flex-shrink-0">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-serif text-lg font-medium text-dark">
                            Order #{order.orderNumber}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} /> {formattedDate}
                          </span>
                          <span>&bull;</span>
                          <span>{order.items.length} {order.items.length === 1 ? 'Piece' : 'Pieces'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-0 border-[#eaeaea]">
                      <div className="text-left md:text-right">
                        <span className="text-xs uppercase tracking-widest text-muted block">Total Investment</span>
                        <span className="font-serif text-xl font-medium text-dark">
                          {formatPrice(Number(order.total))}
                        </span>
                      </div>
                      
                      <button 
                        type="button"
                        className="w-9 h-9 rounded-full bg-white border border-[#ded9d0] flex items-center justify-center text-dark hover:border-[var(--navy)] hover:text-[var(--navy)] transition-colors"
                        aria-label={isExpanded ? 'Collapse order' : 'Expand order'}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDABLE DETAILS */}
                  {isExpanded && (
                    <div className="p-6 sm:p-8 border-t border-[#eaeaea] bg-white">
                      
                      {/* Destination Address if present */}
                      {order.address && (
                        <div className="mb-6 pb-6 border-b border-[#f0f0f0] flex items-start gap-3 text-sm">
                          <MapPin size={18} className="text-accent mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-xs uppercase tracking-wider text-muted font-semibold block mb-0.5">
                              White-Glove Delivery Destination
                            </span>
                            <p className="text-dark font-medium m-0">{order.address.line1}</p>
                            <p className="text-muted text-xs m-0 mt-0.5">
                              {order.address.city}, {order.address.state} — {order.address.postalCode}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Items List */}
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
                        Commissioned Pieces ({order.items.length})
                      </h4>

                      <div className="space-y-4">
                        {order.items.map(item => {
                          const isNursery = item.customization?.bespokeType === 'Nursery Architectural Commission' || Boolean(item.customization?.spaceName);
                          const cust = item.customization;

                          return (
                            <div 
                              key={item.id} 
                              className="flex flex-col p-4 rounded-lg bg-[#faf9f7] border border-[#f0eee9]"
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded bg-white border border-[#ded9d0] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {item.product.images?.[0] ? (
                                      <img 
                                        src={item.product.images[0]} 
                                        alt={item.product.name} 
                                        className="w-full h-full object-cover" 
                                      />
                                    ) : (
                                      <div className="w-full h-full gradient-bg flex items-center justify-center text-muted">
                                        <Sparkles size={16} />
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <p className="font-serif text-base font-medium text-dark m-0">
                                      {isNursery && cust?.spaceName ? `${cust.spaceName} — Bespoke Nursery` : item.product.name}
                                    </p>
                                    <p className="text-xs text-muted mt-1 m-0">
                                      Unit Price: {formatPrice(Number(item.unitPrice))} &times; {item.quantity}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right self-end sm:self-center">
                                  <span className="text-xs text-muted block uppercase tracking-wider">Item Subtotal</span>
                                  <span className="font-serif text-base font-medium text-dark">
                                    {formatPrice(item.quantity * Number(item.unitPrice))}
                                  </span>
                                </div>
                              </div>

                              {/* Bespoke Nursery or Customization Details */}
                              {cust && (
                                <div className="mt-3 pt-3 border-t border-[#ede8de] text-xs">
                                  {isNursery ? (
                                    <div className="space-y-1.5">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="badge badge-green text-[11px] font-semibold">
                                          🌿 {cust.spaceName || 'Bespoke Nursery'} ({cust.dimensions || `${cust.width}×${cust.height} ft`})
                                        </span>
                                        {cust.plantPack && (
                                          <span className="text-slate-700 bg-white px-2 py-0.5 rounded border border-[#ded9d0]">
                                            <strong>Pack:</strong> {cust.plantPack} ({cust.plantCount})
                                          </span>
                                        )}
                                        {cust.planterType && (
                                          <span className="text-slate-700 bg-white px-2 py-0.5 rounded border border-[#ded9d0]">
                                            <strong>Pots:</strong> {cust.planterType}
                                          </span>
                                        )}
                                      </div>

                                      {cust.addonsSelected?.length > 0 && (
                                        <div className="text-[11px] text-slate-600">
                                          <strong>Care Add-ons:</strong> {cust.addonsSelected.join(', ')}
                                        </div>
                                      )}

                                      {/* Store Manager & Admin Tracking Section */}
                                      <div className="mt-2 p-2.5 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] flex flex-col gap-1">
                                        <div className="flex items-center justify-between flex-wrap gap-2 font-semibold">
                                          <span>📦 Polyhouse & Transit Stage: <strong>{cust.fulfillmentStatus || 'Commission Confirmed'}</strong></span>
                                          {cust.trackingNumber && (
                                            <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#86efac] text-[#0f492c]">
                                              AWB Track: {cust.trackingNumber}
                                            </span>
                                          )}
                                        </div>
                                        {cust.nurseryNotes && (
                                          <div className="text-[11px] text-[#15803d] mt-0.5">
                                            🌱 <strong>Nursery Acclimation Log:</strong> {cust.nurseryNotes}
                                          </div>
                                        )}
                                        {cust.adjustments && (
                                          <div className="text-[11px] text-[#15803d]">
                                            ✨ <strong>Custom Adjustments:</strong> {cust.adjustments}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ) : cust.width && cust.height ? (
                                    <div className="flex items-center gap-2 text-slate-700">
                                      <span>📐 Made-to-measure: {cust.width}×{cust.height} {cust.unit || 'ft'}</span>
                                      {cust.wallpaperName && <span>• {cust.wallpaperName}</span>}
                                      {cust.trackingNumber && <span className="font-mono ml-auto">Track: {cust.trackingNumber}</span>}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Financial breakdown */}
                      <div className="mt-6 pt-6 border-t border-[#f0f0f0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-muted">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-[#6a8c6f]" />
                          <span>Included: 1-Year Structural Warranty & White-Glove Care Guarantee</span>
                        </div>
                        <div className="space-x-4">
                          <span>Subtotal: {formatPrice(Number(order.subtotal))}</span>
                          <span>Tax: {formatPrice(Number(order.tax))}</span>
                          <span className="font-bold text-dark text-sm">
                            Total: {formatPrice(Number(order.total))}
                          </span>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
