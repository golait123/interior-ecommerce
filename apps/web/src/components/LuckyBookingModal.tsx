import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Gift, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Lock, 
  ArrowRight, 
  Phone, 
  MapPin, 
  Home, 
  Copy, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface LuckyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LuckyBookingModal({ isOpen, onClose }: LuckyBookingModalProps) {
  const { user, login, register } = useAuth();

  // 5-Minute Timer (300 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    const saved = localStorage.getItem('cc_lucky_round_end');
    if (saved) {
      const diff = Math.floor((Number(saved) - Date.now()) / 1000);
      return diff > 0 ? diff : 300;
    }
    const end = Date.now() + 300 * 1000;
    localStorage.setItem('cc_lucky_round_end', end.toString());
    return 300;
  });

  // Auth mode if not logged in
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Booking fields
  const [selectedRoom, setSelectedRoom] = useState('Living Room');
  const [cityPincode, setCityPincode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [decorGoal, setDecorGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(() => {
    return Boolean(localStorage.getItem('cc_lucky_booked'));
  });
  const [voucherCopied, setVoucherCopied] = useState(false);

  // Timer Countdown Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Restart a new 5-minute round
          const nextEnd = Date.now() + 300 * 1000;
          localStorage.setItem('cc_lucky_round_end', nextEnd.toString());
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        if (!authName.trim()) {
          toast.error('Please enter your full name');
          return;
        }
        await register(authName.trim(), authEmail.trim(), authPassword);
        toast.success('Registration successful! You are now eligible to book.');
      } else {
        await login(authEmail.trim(), authPassword);
        toast.success('Signed in successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.trim().length < 10) {
      toast.error('Please enter a valid 10-digit phone number for verification.');
      return;
    }
    if (!cityPincode.trim()) {
      toast.error('Please enter your city and pincode for delivery.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsBooked(true);
      localStorage.setItem('cc_lucky_booked', 'true');
      toast.success('🎉 Congratulations! Fast booking registered in the 5-minute lucky round.');
    }, 900);
  };

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText('FREEROOM2026');
    setVoucherCopied(true);
    toast.success('Voucher FREEROOM2026 copied to clipboard!');
    setTimeout(() => setVoucherCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white max-w-xl w-full rounded-2xl shadow-2xl relative border border-[#ded9d0] overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-[var(--navy)] text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-stone-900 shadow-xs">
              <Sparkles size={13} />
              <span>5-Minute Lucky Customer Draw</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif italic font-normal text-white m-0 tracking-tight">
            Free Gardening Kit & Single Room Decor Service
          </h2>

          <p className="text-xs sm:text-sm text-stone-300 mt-2 font-light leading-relaxed m-0">
            Selected live every 5 minutes based on fast booking submission. Open exclusively to registered members.
          </p>

          {/* Live 5-Minute Timer Bar */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <Clock size={15} className="animate-spin text-amber-400" style={{ animationDuration: '4s' }} />
              <span>Active 5-Min Selection Window Closes In:</span>
            </div>
            <div className="bg-black/40 px-3 py-1 rounded-md border border-amber-400/40 font-mono text-base font-bold text-amber-300 tracking-wider">
              {formatTimer(secondsRemaining)}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {/* Confirmed / Booked State */}
          {isBooked ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
                <CheckCircle2 size={36} />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                🎉 Fast Booking Registered (#1 in Queue)
              </span>

              <h3 className="text-2xl font-serif italic text-stone-900 mt-3 mb-1">
                You're In The Active 5-Minute Draw!
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed mb-5">
                Because you completed the fastest booking as a registered member, your entry has been locked for the free room decoration service and botanical gardening kit.
              </p>

              {/* What You Receive Card */}
              <div className="bg-[#f8fafc] border border-stone-200 rounded-xl p-4 text-left mb-5 space-y-2.5 text-xs text-stone-700">
                <div className="font-bold text-stone-900 text-sm mb-1 flex items-center gap-2">
                  <Gift size={16} className="text-[var(--navy)]" />
                  Your 100% Free Privilege Bundle:
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Deluxe Living Gardening Kit:</strong> Hand-thrown terracotta planter, NASA-rated air-purifying foliage, organic bio-soil, and brass shears.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>1-Time Single Room Decoration Service:</strong> Personal interior styling, custom wallpaper or wall art curation, and room layout advisory.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span><strong>Zero Hidden Costs:</strong> Completely complimentary for our selected lucky member.</span>
                </div>
              </div>

              {/* Voucher Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Your Lucky Booking Pass:</span>
                  <span className="font-mono font-bold text-sm text-amber-950">FREEROOM2026</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyVoucher}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {voucherCopied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{voucherCopied ? 'Copied' : 'Copy Pass'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('cc_lucky_booked');
                    setIsBooked(false);
                  }}
                  className="btn btn-secondary btn-sm flex-1 text-xs"
                >
                  Book Another Space
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-primary btn-sm flex-1 text-xs"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : !user ? (
            /* User NOT Registered -> Registration Prompt */
            <div>
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl mb-5 flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong>User Registration Required:</strong> To prevent bots and ensure fast verification of your free room decor service and delivery address, you must be a registered member. Sign up in 10 seconds below to unlock immediate booking.
                </div>
              </div>

              {/* Toggle Register vs Login */}
              <div className="flex border-b border-stone-200 mb-4">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`pb-2.5 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                    authMode === 'register' 
                      ? 'border-[var(--navy)] text-[var(--navy)]' 
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Create Free Account
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`pb-2.5 px-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                    authMode === 'login' 
                      ? 'border-[var(--navy)] text-[var(--navy)]' 
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Existing Member Sign In
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:border-[var(--navy)] focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:border-[var(--navy)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:border-[var(--navy)] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-2 py-3 bg-[var(--navy)] hover:bg-[#1b3a6b] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {authLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === 'register' ? 'Register & Enter 5-Min Lucky Window' : 'Sign In & Enter'}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* User IS Registered -> Fast Booking Form */
            <div>
              <div className="bg-[#f0f5fc] border border-[#cbdceb] p-3 rounded-xl mb-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className="text-[var(--navy)]" />
                  <span className="text-stone-800">
                    Logged in as <strong>{user.name}</strong> ({user.email})
                  </span>
                </div>
                <span className="badge badge-green text-[10px] font-bold">✓ Registered Member</span>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1 flex items-center gap-1.5">
                    <Home size={13} className="text-[var(--navy)]" />
                    <span>Select Single Room For Free Decor Service *</span>
                  </label>
                  <select
                    value={selectedRoom}
                    onChange={e => setSelectedRoom(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white focus:border-[var(--navy)] focus:outline-none cursor-pointer"
                  >
                    <option value="Living Room">Living Room / Lounge Sanctuary</option>
                    <option value="Master Bedroom">Master Bedroom</option>
                    <option value="Balcony Garden">Balcony / Terrace Living Garden</option>
                    <option value="Dining Area">Dining & Entertaining Space</option>
                    <option value="Home Study">Home Study / Executive Work Studio</option>
                    <option value="Kids Room">Kids Room / Nursery Sanctuary</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1 flex items-center gap-1.5">
                      <MapPin size={13} className="text-[var(--navy)]" />
                      <span>City & Delivery Pincode *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bangalore, 560001"
                      value={cityPincode}
                      onChange={e => setCityPincode(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:border-[var(--navy)] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1 flex items-center gap-1.5">
                      <Phone size={13} className="text-[var(--navy)]" />
                      <span>Contact Phone (For Fast Booking) *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:border-[var(--navy)] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Decor Preference or Current Challenge (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Need air-purifying foliage and modern wallpaper accent"
                    value={decorGoal}
                    onChange={e => setDecorGoal(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 focus:border-[var(--navy)] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[var(--navy)] hover:bg-[#1b3a6b] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={14} className="text-amber-400" />
                        <span>Submit Fast Booking (Enter Active 5-Min Round)</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-stone-400 text-center mt-2 m-0">
                    ⚡ Selection takes place every 5 minutes based on the earliest registered booking timestamp.
                  </p>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}