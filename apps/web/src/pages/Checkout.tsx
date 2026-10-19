import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart, getItemUnitPrice } from '../contexts/CartContext';
import { useLocationContext, PaymentMethodConfig } from '../contexts/LocationContext';
import { addressesApi } from '../api/addresses';
import { ordersApi } from '../api/orders';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Lock, 
  Sparkles, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft,
  Tag,
  Check,
  Award,
  Clock,
  Layers,
  Globe,
  Building2,
  Smartphone,
  ExternalLink,
  ChevronDown,
  Leaf
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { currentCountry, formatPrice } = useLocationContext();
  const navigate = useNavigate();
  const [addressId, setAddressId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment method dynamically initialized to current country's recommended option
  const [paymentMethod, setPaymentMethod] = useState<string>(() => {
    return currentCountry.paymentMethods.find(m => m.isRecommended)?.id || currentCountry.paymentMethods[0]?.id || 'card';
  });

  // Localized payment field inputs (for simulated authorization)
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // New address form
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Keep payment method in sync when user changes region/country
  useEffect(() => {
    const hasMatching = currentCountry.paymentMethods.some(pm => pm.id === paymentMethod);
    if (!hasMatching) {
      const recommended = currentCountry.paymentMethods.find(pm => pm.isRecommended) || currentCountry.paymentMethods[0];
      if (recommended) {
        setPaymentMethod(recommended.id);
      }
    }
  }, [currentCountry]);

  // Voucher Code State
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountPct: number } | null>(null);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesApi.list
  });

  // Automatically select first saved address if available
  useEffect(() => {
    if (addresses && addresses.length > 0 && !addressId) {
      setAddressId(addresses[0].id);
    }
  }, [addresses, addressId]);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME15') {
      setAppliedVoucher({ code: 'WELCOME15', discountPct: 0.15 });
      toast.success('✨ 15% VIP Sanctuary Voucher applied!');
      setVoucherInput('');
    } else if (code === 'HERITAGE10') {
      setAppliedVoucher({ code: 'HERITAGE10', discountPct: 0.10 });
      toast.success('✨ 10% Guild Heirlooms Voucher applied!');
      setVoucherInput('');
    } else {
      toast.error('Invalid voucher code. Try WELCOME15 for 15% off.');
    }
  };

  const discountAmount = appliedVoucher ? subtotal * appliedVoucher.discountPct : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxRate = currentCountry.tax.rate;
  const taxName = currentCountry.tax.name;
  const tax = discountedSubtotal * taxRate;
  const total = discountedSubtotal + tax;

  const handlePlaceOrder = async () => {
    if (!cart?.items.length) {
      toast.error('Your shopping bag is empty.');
      return;
    }
    
    let finalAddressId = addressId;
    setIsSubmitting(true);

    try {
      if (!finalAddressId) {
        if (!line1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
          toast.error(`Please enter a complete delivery address with City, State, and ${currentCountry.postalCodeLabel}.`);
          setIsSubmitting(false);
          return;
        }
        const fullLine1 = line2.trim() ? `${line1.trim()}, ${line2.trim()}` : line1.trim();
        const newAddr = await addressesApi.create({ 
          line1: fullLine1, 
          city: city.trim(), 
          state: state.trim(), 
          postalCode: postalCode.trim(), 
          country: currentCountry.name 
        });
        finalAddressId = newAddr.id;
      }

      const orderItems = cart.items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        customization: i.customization
      }));

      await ordersApi.create({ addressId: finalAddressId, items: orderItems });
      await clearCart();
      toast.success('Your sanctuary commission has been confirmed and reserved successfully!');
      navigate('/orders');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to place order. Please review your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPaymentIcon = (iconType: string) => {
    switch (iconType) {
      case 'upi':
        return (
          <div className="w-9 h-9 rounded-lg bg-[#ebf3fc] text-[var(--navy)] flex items-center justify-center shrink-0 font-bold text-xs">
            UPI
          </div>
        );
      case 'apple_google_pay':
        return (
          <div className="w-9 h-9 rounded-lg bg-[#0f172a] text-white flex items-center justify-center shrink-0 font-semibold text-xs tracking-tight">
            Pay
          </div>
        );
      case 'paypal':
        return (
          <div className="w-9 h-9 rounded-lg bg-[#003087] text-white flex items-center justify-center shrink-0 font-bold text-xs italic">
            P
          </div>
        );
      case 'klarna':
        return (
          <div className="w-9 h-9 rounded-lg bg-[#fce7f3] text-[#9d174d] flex items-center justify-center shrink-0 font-bold text-xs">
            BNPL
          </div>
        );
      case 'bank':
        return (
          <div className="w-9 h-9 rounded-lg bg-[#f0f4f8] text-[var(--navy)] flex items-center justify-center shrink-0">
            <Building2 size={18} />
          </div>
        );
      case 'truck':
        return (
          <div className="w-9 h-9 rounded-lg bg-[#f0f6f1] text-[#2e6930] flex items-center justify-center shrink-0">
            <Truck size={18} />
          </div>
        );
      case 'card':
      default:
        return (
          <div className="w-9 h-9 rounded-lg bg-[#f4f2ee] text-dark flex items-center justify-center shrink-0">
            <CreditCard size={18} />
          </div>
        );
    }
  };

  return (
    <div className="page-wrapper bg-white min-h-screen">
      <Header />

      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* EDITORIAL BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs text-muted mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-dark transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/cart" className="hover:text-dark transition-colors">Shopping Bag</Link>
          <ChevronRight size={12} />
          <span className="text-dark font-semibold">Sanctuary Checkout</span>
        </nav>

        {/* HIGH-FASHION PROGRESS STEPPER */}
        <div className="checkout-stepper">
          <div className="checkout-step-item completed">
            <span className="checkout-step-num">
              <Check size={12} />
            </span>
            <span>Shopping Bag</span>
          </div>
          <div className="checkout-step-divider" />
          <div className="checkout-step-item active">
            <span className="checkout-step-num">2</span>
            <span>Delivery Destination</span>
          </div>
          <div className="checkout-step-divider" />
          <div className="checkout-step-item active">
            <span className="checkout-step-num">3</span>
            <span>Payment & Invoice</span>
          </div>
        </div>

        {/* EDITORIAL PAGE HEADER */}
        <div className="mb-8 pb-5 border-b border-[#eaeaea] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge badge-navy text-[11px] uppercase tracking-widest font-semibold px-2.5 py-0.5">
                Verified Guild Checkout
              </span>
              <span className="text-xs text-muted font-medium">• Final Step</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif italic font-normal text-dark tracking-tight m-0">
              Finalize Your Sanctuary Commission
            </h1>
            <p className="text-muted text-xs sm:text-sm mt-1 max-w-2xl font-light leading-relaxed m-0">
              Specify your destination for white-glove unboxing, bespoke fabrication, and secure transit packaging.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted bg-[#fafafa] px-3.5 py-2 rounded-md border border-[#e5e5e5] shrink-0">
            <ShieldCheck size={16} className="text-[#3c6e47]" />
            <span>256-Bit Bank Grade SSL Encryption</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: DESTINATION ADDRESS & PAYMENT METHOD                         */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. SHIPPING ADDRESS SECTION */}
            <div className="bg-white border border-[#e8e4dc] rounded-xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#f0ece4]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--navy)] text-white flex items-center justify-center font-serif text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-medium text-dark m-0">Delivery Destination</h2>
                    <p className="text-xs text-muted mt-0.5">Where shall our white-glove courier deliver and assemble your pieces?</p>
                  </div>
                </div>
              </div>

              {/* Pan-India Delivery Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0" role="img" aria-label="India">
                    🇮🇳
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-dark">
                        Pan-India White-Glove Delivery
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white border border-[#cbd5e1] rounded text-slate-700 font-bold">
                        INR (₹)
                      </span>
                    </div>
                    <span className="text-[11px] text-muted block mt-0.5">
                      Complimentary white-glove courier delivery, unboxing & structural assembly across all Indian states.
                    </span>
                  </div>
                </div>
              </div>

              {/* Saved Addresses Tabs / List */}
              {addresses && addresses.length > 0 && (
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted block">
                      Saved Sanctuary Addresses ({addresses.length})
                    </label>
                    {addressId !== '' && (
                      <span className="text-xs text-[#3c6e47] font-medium flex items-center gap-1">
                        <Check size={12} /> Address Selected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map(addr => {
                      const isSelected = addressId === addr.id;
                      return (
                        <div 
                          key={addr.id}
                          onClick={() => setAddressId(addr.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all flex items-start justify-between ${
                            isSelected 
                              ? 'border-[var(--navy)] bg-[#f4f7fb] shadow-sm' 
                              : 'border-[#eaeaea] hover:border-[#cfcfcf] bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 ${isSelected ? 'text-[var(--navy)]' : 'text-stone-400'}`}>
                              <MapPin size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-dark m-0">{addr.line1}</p>
                              {addr.line2 && <p className="text-xs text-stone-600 m-0">{addr.line2}</p>}
                              <p className="text-xs text-muted mt-1">
                                {addr.city}, {addr.state} — <span className="font-mono font-medium text-dark">{addr.postalCode}</span> ({addr.country || currentCountry.name})
                              </p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'border-[var(--navy)] bg-[var(--navy)]' : 'border-[#d0d0d0] bg-white'
                          }`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setAddressId('')}
                      className={`p-3 text-xs uppercase tracking-wider font-semibold border rounded-lg text-center transition-all ${
                        addressId === '' 
                          ? 'border-[var(--navy)] bg-[#f4f7fb] text-[var(--navy)] shadow-sm' 
                          : 'border-dashed border-[#ded9d0] text-muted hover:border-dark hover:text-dark bg-[#faf9f7]'
                      }`}
                    >
                      + Enter A New Delivery Destination
                    </button>
                  </div>
                </div>
              )}

              {/* New Address Fields */}
              {addressId === '' && (
                <div className="space-y-4 pt-2 border-t border-[#f0ece4]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-dark">
                      New Delivery Destination ({currentCountry.name}):
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1.5">
                      House / Flat / Villa / Apartment & Street Address *
                    </label>
                    <input 
                      type="text" 
                      className="input w-full p-3 text-sm border border-[#ded9d0] rounded-lg focus:border-[var(--navy)] focus:outline-none" 
                      placeholder="e.g. Penthouse 1204, Tower B, Magnolia Residences" 
                      value={line1} 
                      onChange={e => setLine1(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1.5">
                      Landmark / Suite / Area (Optional)
                    </label>
                    <input 
                      type="text" 
                      className="input w-full p-3 text-sm border border-[#ded9d0] rounded-lg focus:border-[var(--navy)] focus:outline-none" 
                      placeholder="e.g. Opposite Central Park, West End" 
                      value={line2} 
                      onChange={e => setLine2(e.target.value)} 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="form-group">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1.5">
                        City *
                      </label>
                      <input 
                        type="text" 
                        className="input w-full p-3 text-sm border border-[#ded9d0] rounded-lg focus:border-[var(--navy)] focus:outline-none" 
                        placeholder={currentCountry.code === 'IN' ? 'e.g. Gurugram' : currentCountry.code === 'US' ? 'e.g. San Francisco' : 'e.g. London'} 
                        value={city} 
                        onChange={e => setCity(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1.5">
                        State / Province / Region *
                      </label>
                      <input 
                        type="text" 
                        className="input w-full p-3 text-sm border border-[#ded9d0] rounded-lg focus:border-[var(--navy)] focus:outline-none" 
                        placeholder={currentCountry.defaultStatePlaceholder} 
                        value={state} 
                        onChange={e => setState(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1.5">
                        {currentCountry.postalCodeLabel} *
                      </label>
                      <input 
                        type="text" 
                        className="input w-full p-3 text-sm border border-[#ded9d0] rounded-lg focus:border-[var(--navy)] focus:outline-none font-mono" 
                        placeholder={currentCountry.postalCodePlaceholder} 
                        value={postalCode} 
                        onChange={e => setPostalCode(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Assurance Notice */}
              <div className="mt-4 pt-3 border-t border-[#f0ece4] flex items-center gap-2.5 text-xs text-muted">
                <Truck size={14} className="text-[var(--navy)] shrink-0" />
                <span>{currentCountry.deliveryNotice}</span>
              </div>
            </div>

            {/* 2. DYNAMIC PAYMENT METHOD SELECTION */}
            <div className="bg-white border border-[#e8e4dc] rounded-xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#f0ece4] flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--navy)] text-white flex items-center justify-center font-serif text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-medium text-dark m-0">Payment Method</h2>
                    <p className="text-xs text-muted mt-0.5">
                      All transactions are encrypted with 256-bit bank-grade SSL security.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ebf3fc] border border-[#bcd7f7] text-[var(--navy)] flex items-center gap-1.5">
                    <span>🇮🇳</span>
                    <span>India (INR ₹)</span>
                  </span>
                </div>
              </div>

              {/* Secure Payment Notice */}
              <div className="mb-4 text-xs text-[#524a3e] bg-[#fbf9f4] p-3 rounded-lg border border-[#e8e2d5] flex items-start gap-2">
                <Sparkles size={14} className="text-[#8c6f52] shrink-0 mt-0.5" />
                <span>
                  All payments are securely processed in <strong>Indian Rupee (INR ₹)</strong> with 256-bit bank-grade encryption.
                </span>
              </div>

              {/* Dynamic list of payment options for this country */}
              <div className="space-y-3">
                {currentCountry.paymentMethods.map(pm => {
                  const isSelected = paymentMethod === pm.id;

                  return (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`checkout-payment-card ${isSelected ? 'active' : ''}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3.5">
                          {renderPaymentIcon(pm.iconType)}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif text-sm font-semibold text-dark">{pm.name}</span>
                              <span className={`badge ${
                                pm.badgeColor === 'green' ? 'badge-green' :
                                pm.badgeColor === 'yellow' ? 'badge-yellow' :
                                pm.badgeColor === 'purple' ? 'badge-orange' : 'badge-navy'
                              } text-[10px] py-0.5`}>
                                {pm.badge}
                              </span>
                            </div>
                            <p className="text-xs text-muted mt-0.5 m-0">{pm.subtitle}</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                          isSelected ? 'border-[var(--navy)] bg-[var(--navy)]' : 'border-[#ccc]'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>

                      {/* Interactive Sub-Details Accordion when active */}
                      {isSelected && (
                        <div className="mt-4 pt-3.5 border-t border-[#e2edf9] w-full text-xs animate-fade-in">
                          {/* UPI Sub-form */}
                          {pm.id === 'upi' && (
                            <div className="space-y-2">
                              <label className="font-semibold text-stone-700 block">
                                Enter your UPI Virtual Payment Address (VPA):
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                                  value={upiId}
                                  onChange={e => setUpiId(e.target.value)}
                                  className="w-full text-xs p-2.5 bg-white border border-[#cbd5e1] rounded-md focus:border-[var(--navy)] focus:outline-none"
                                />
                                <span className="px-3 py-2 bg-white border border-[#cbd5e1] text-stone-600 font-semibold rounded-md flex items-center shrink-0">
                                  Verify
                                </span>
                              </div>
                              <p className="text-[11px] text-muted m-0">
                                A payment request prompt will be dispatched instantly to your Google Pay, PhonePe, or Paytm app.
                              </p>
                            </div>
                          )}

                          {/* Card Sub-form */}
                          {pm.id === 'card' && (
                            <div className="space-y-2.5">
                              <div>
                                <label className="font-semibold text-stone-700 block mb-1">
                                  Card Number:
                                </label>
                                <input
                                  type="text"
                                  placeholder="•••• •••• •••• ••••"
                                  value={cardNumber}
                                  onChange={e => setCardNumber(e.target.value)}
                                  className="w-full text-xs p-2.5 bg-white border border-[#cbd5e1] rounded-md focus:border-[var(--navy)] focus:outline-none font-mono"
                                  maxLength={19}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="font-semibold text-stone-700 block mb-1">
                                    Expiry:
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="MM / YY"
                                    value={cardExpiry}
                                    onChange={e => setCardExpiry(e.target.value)}
                                    className="w-full text-xs p-2.5 bg-white border border-[#cbd5e1] rounded-md focus:border-[var(--navy)] focus:outline-none font-mono"
                                    maxLength={5}
                                  />
                                </div>
                                <div>
                                  <label className="font-semibold text-stone-700 block mb-1">
                                    Security CVV:
                                  </label>
                                  <input
                                    type="password"
                                    placeholder="•••"
                                    value={cardCvc}
                                    onChange={e => setCardCvc(e.target.value)}
                                    className="w-full text-xs p-2.5 bg-white border border-[#cbd5e1] rounded-md focus:border-[var(--navy)] focus:outline-none font-mono"
                                    maxLength={4}
                                  />
                                </div>
                              </div>
                              <p className="text-[11px] text-stone-500 m-0 flex items-center gap-1.5">
                                <ShieldCheck size={13} className="text-emerald-600" />
                                <span>3D Secure 2.0 authorization tokenized via 256-bit TLS encryption.</span>
                              </p>
                            </div>
                          )}

                          {/* Apple / Google Pay Sub-form */}
                          {pm.id === 'apple_google_pay' && (
                            <div className="p-3 bg-white rounded-lg border border-[#cbd5e1] flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <Smartphone size={16} className="text-[var(--navy)]" />
                                <span className="text-xs text-stone-700">
                                  Biometric one-touch payment will trigger securely upon placing your commission.
                                </span>
                              </div>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#f1f5f9] rounded text-slate-700">
                                Ready
                              </span>
                            </div>
                          )}

                          {/* PayPal Sub-form */}
                          {pm.id === 'paypal' && (
                            <div className="p-3 bg-[#f0f4fc] rounded-lg border border-[#cce0fc] text-xs text-[#003087]">
                              You will be redirected to PayPal's secure portal to authorize your payment in {currentCountry.currency.code}. Full Buyer Protection is active.
                            </div>
                          )}

                          {/* Buy Now Pay Later (Klarna, Tabby, Afterpay) */}
                          {(pm.id === 'klarna' || pm.id === 'afterpay' || pm.id === 'tabby') && (
                            <div className="p-3 bg-[#fff1f2] rounded-lg border border-[#fecdd3] text-xs text-[#881337] space-y-1">
                              <p className="font-semibold m-0">
                                ✨ 4 interest-free installments of {formatPrice(total / 4)}:
                              </p>
                              <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 font-mono">
                                <div className="bg-white p-1 rounded border border-[#fecdd3]">Today: {formatPrice(total / 4)}</div>
                                <div className="bg-white p-1 rounded border border-[#fecdd3]">2 Wks: {formatPrice(total / 4)}</div>
                                <div className="bg-white p-1 rounded border border-[#fecdd3]">4 Wks: {formatPrice(total / 4)}</div>
                                <div className="bg-white p-1 rounded border border-[#fecdd3]">6 Wks: {formatPrice(total / 4)}</div>
                              </div>
                            </div>
                          )}

                          {/* Bank Debit / ACH / SEPA / Interac / Netbanking */}
                          {(pm.id === 'netbanking' || pm.id === 'sepa' || pm.id === 'ideal_sofort' || pm.id === 'interac' || pm.id === 'wire_ach' || pm.id === 'paynow') && (
                            <div className="p-3 bg-white rounded-lg border border-[#cbd5e1] text-xs text-stone-700">
                              <p className="font-medium text-dark m-0">
                                Direct electronic banking verification enabled for {currentCountry.name}.
                              </p>
                              <p className="text-[11px] text-muted mt-1 m-0">
                                Automated instant settlement confirmation with zero intermediate surcharge fees.
                              </p>
                            </div>
                          )}

                          {/* Cash or Card on Delivery */}
                          {(pm.id === 'cod' || pm.id === 'cod_gcc') && (
                            <div className="p-3 bg-[#f0f6f1] rounded-lg border border-[#c2e2c5] text-xs text-[#2e6930]">
                              Our white-glove logistics handler will present your handcrafted piece for complete physical inspection upon arrival before you complete payment.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Back link */}
            <div className="pt-1">
              <Link to="/cart" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted hover:text-dark transition-colors">
                <ArrowLeft size={14} /> Return to Shopping Bag
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: LUXURY COMMISSION INVOICE & PROPORTIONAL IMAGE WINDOWS       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5">
            <div className="bg-[#faf9f7] border border-[#ded9d0] rounded-xl p-6 sm:p-7 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-widest text-muted font-semibold">
                  Commission Review
                </span>
                <span className="text-xs font-semibold bg-white border border-[#ded9d0] px-2 py-0.5 rounded text-dark">
                  {cart?.items.length || 0} {cart?.items.length === 1 ? 'Piece' : 'Pieces'}
                </span>
              </div>

              <h3 className="font-serif italic text-2xl font-normal text-dark mb-4 m-0">
                Order Summary
              </h3>

              {/* ===================================================================== */}
              {/* PROPORTIONAL PRODUCT IMAGE WINDOWS                                     */}
              {/* ===================================================================== */}
              <div className="mb-5 max-h-80 overflow-y-auto pr-1 border-b border-[#e8e4dc]">
                {cart?.items.map(item => {
                  const isNursery = item.customization?.bespokeType === 'Nursery Architectural Commission' || Boolean(item.customization?.spaceName);
                  const unitPrice = getItemUnitPrice(item);
                  const lineTotal = item.quantity * unitPrice;
                  const itemImg = item.product.images?.[0] || null;

                  return (
                    <div key={item.id} className="checkout-item-row group">
                      {/* DEDICATED PROPORTIONAL IMAGE WINDOW */}
                      <div className="checkout-img-window">
                        {itemImg ? (
                          <img 
                            src={itemImg} 
                            alt={item.product.name} 
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted bg-[#f0ede6]">
                            <Sparkles size={16} />
                          </div>
                        )}
                        {/* Floating Quantity Badge */}
                        <span className="checkout-img-qty-badge">
                          ×{item.quantity}
                        </span>
                      </div>

                      {/* Product Details & Specs */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold block mb-0.5">
                          {isNursery ? 'Nurserylive Curated Sanctuary' : (item.product.category?.name || 'InteriorG Piece')}
                        </span>
                        
                        <p className="text-sm font-serif font-medium text-dark truncate m-0 group-hover:text-accent transition-colors">
                          {isNursery && item.customization?.spaceName ? `${item.customization.spaceName} — Bespoke Nursery` : item.product.name}
                        </p>

                        {/* Made-to-measure / Bespoke nursery specs */}
                        {isNursery ? (
                          <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] p-1.5 rounded">
                            <div className="flex items-center gap-1 font-semibold">
                              <Leaf size={11} className="text-[#166534]" />
                              <span>{item.customization.spaceName || 'Bespoke Nursery'} ({item.customization.dimensions || `${item.customization.width}×${item.customization.height} ft`})</span>
                            </div>
                            {item.customization.plantPack && (
                              <span className="text-[10.5px] text-[#14532d]">• <strong>Pack:</strong> {item.customization.plantPack} ({item.customization.plantCount})</span>
                            )}
                            {item.customization.planterType && (
                              <span className="text-[10.5px] text-[#14532d]">• <strong>Pots:</strong> {item.customization.planterType}</span>
                            )}
                            {item.customization.addonsSelected?.length > 0 && (
                              <span className="text-[10px] text-[#15803d]">• <strong>Add-ons:</strong> {item.customization.addonsSelected.join(', ')}</span>
                            )}
                          </div>
                        ) : Boolean(item.customization?.width && item.customization?.height) ? (
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-600 bg-white border border-[#e5dfd5] px-2 py-0.5 rounded w-fit">
                            <Layers size={10} className="text-stone-500" />
                            <span>
                              {item.customization.width}×{item.customization.height} {item.customization.unit || 'ft'}
                            </span>
                            {item.customization.billableAreaSqFt && (
                              <span>• {item.customization.billableAreaSqFt} sq ft</span>
                            )}
                          </div>
                        ) : null}

                        <div className="mt-1 text-xs text-muted">
                          <span>{formatPrice(unitPrice)}</span>
                          <span className="font-light"> / {isNursery ? 'complete set' : (item.product.unit || 'piece')}</span>
                        </div>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-sm font-serif font-semibold text-dark text-right shrink-0">
                        {formatPrice(lineTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VOUCHER PROMO INPUT */}
              <form onSubmit={handleApplyVoucher} className="mb-5 pb-5 border-b border-[#e8e4dc]">
                <label className="text-xs uppercase tracking-wider text-muted font-semibold block mb-2">
                  Artisan Guild Voucher
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input 
                      type="text" 
                      placeholder="e.g. WELCOME15" 
                      value={voucherInput}
                      onChange={e => setVoucherInput(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-[#ded9d0] rounded-lg focus:border-[var(--navy)] focus:outline-none uppercase font-mono tracking-wider"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#2d2a27] hover:bg-[#1a1816] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border-none shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {appliedVoucher && (
                  <div className="mt-2 flex items-center justify-between text-xs text-[#2e6930] bg-[#f0f6f1] px-2.5 py-1 rounded border border-[#d2e5d4]">
                    <span>✨ {appliedVoucher.code} applied ({(appliedVoucher.discountPct * 100)}% off)</span>
                    <button 
                      type="button" 
                      onClick={() => setAppliedVoucher(null)} 
                      className="text-stone-400 hover:text-stone-700 bg-transparent border-none p-0 cursor-pointer font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </form>

              {/* PRICING BREAKDOWN */}
              <div className="space-y-3 text-sm pb-5 border-b border-[#e8e4dc]">
                <div className="flex justify-between text-stone-600">
                  <span>Pieces Subtotal</span>
                  <span className="font-medium text-dark">{formatPrice(subtotal)}</span>
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-[#2e6930]">
                    <span>Guild Discount ({appliedVoucher.code})</span>
                    <span className="font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <span>Pan-India White-Glove Delivery</span>
                    <span className="badge badge-green text-[10px] py-0 px-1.5">
                      {subtotal >= currentCountry.freeShippingThreshold ? 'Free' : 'Standard'}
                    </span>
                  </span>
                  <span className="text-[#3c6e47] font-medium">
                    {subtotal >= currentCountry.freeShippingThreshold ? 'Complimentary' : formatPrice(currentCountry.code === 'IN' ? 0 : 2500)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>{taxName}</span>
                  <span className="font-medium text-dark">{formatPrice(tax)}</span>
                </div>
              </div>

              {/* TOTAL AMOUNT */}
              <div className="flex justify-between items-baseline pt-4 pb-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted block font-semibold">Total Investment</span>
                  <span className="text-[11px] text-muted">All regional taxes & logistics included</span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-3xl font-medium text-dark">
                    {formatPrice(total)}
                  </span>

                </div>
              </div>

              {/* CONFIRM COMMISSION ACTION BUTTON */}
              <button 
                type="button"
                className="btn btn-primary w-full py-4 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !cart?.items.length}
              >
                <Lock size={15} />
                <span>{isSubmitting ? 'Securing Your Commission...' : 'Confirm Sanctuary Commission'}</span>
              </button>

              {/* TRUST & WARRANTY BADGES */}
              <div className="mt-6 pt-5 border-t border-[#e8e4dc] space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-muted">
                  <Award size={15} className="text-[#3c6e47] shrink-0" />
                  <span>1-Year Structural Heirlooms Warranty & Kiln-Dried Certification</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted">
                  <Truck size={15} className="text-[var(--navy)] shrink-0" />
                  <span>Insured climate-controlled transport with real-time dispatch tracking</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-muted">
                  <Clock size={15} className="text-stone-500 shrink-0" />
                  <span>7-Day In-Home Inspection Guarantee upon white-glove arrival</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

