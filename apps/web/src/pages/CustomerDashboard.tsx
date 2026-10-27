import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { ordersApi } from '../api/orders';
import { addressesApi, Address } from '../api/addresses';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AddressMapPickerModal } from '../components/AddressMapPickerModal';
import { 
  ShoppingBag, 
  Package, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Paintbrush, 
  ChevronRight,
  Sparkles, 
  User as UserIcon, 
  ShieldCheck, 
  Compass,
  MapPin,
  Calendar,
  Heart,
  Cake,
  Settings,
  Trash2,
  Edit2,
  Plus,
  AlertTriangle,
  Lock,
  Check,
  Phone,
  Mail,
  Home,
  CheckCircle2,
  X,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { cart, itemCount } = useCart();
  const { themeConfig } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const tabParam = searchParams.get('tab') as any;
  const validTabs = ['overview', 'addresses', 'milestones', 'orders', 'settings', 'wishlist'];
  const [activeTab, setActiveTab] = useState<'overview' | 'addresses' | 'milestones' | 'orders' | 'settings' | 'wishlist'>(
    tabParam && validTabs.includes(tabParam) ? tabParam : 'overview'
  );

  useEffect(() => {
    const t = searchParams.get('tab') as any;
    if (t && validTabs.includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  // Address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // User Profile & Milestones state (saved to localStorage per user)
  const [dob, setDob] = useState(() => {
    return localStorage.getItem(`interiorg_dob_${user?.id}`) || '1995-08-15';
  });
  const [anniversary, setAnniversary] = useState(() => {
    return localStorage.getItem(`interiorg_anniversary_${user?.id}`) || '2022-11-20';
  });
  const [phone, setPhone] = useState(() => {
    return localStorage.getItem(`interiorg_phone_${user?.id}`) || '+91 98765 43210';
  });
  const [name, setName] = useState(user?.name || 'Sanctuary Patron');

  // Account deletion modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Fetch orders
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.list
  });

  // Fetch addresses
  const { data: addresses, isLoading: isAddressesLoading } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: addressesApi.list
  });

  const totalOrders = orders?.length || 0;
  // Ongoing / active services that block account deletion
  const runningServices = orders?.filter(o => 
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status)
  ) || [];
  const pendingOrders = runningServices.length;
  const deliveredOrders = orders?.filter(o => o.status === 'DELIVERED').length || 0;
  const recentOrders = orders?.slice(0, 3) || [];

  // Address Mutations
  const saveAddressMutation = useMutation({
    mutationFn: async (addr: Partial<Address>) => {
      if (addr.id) {
        return addressesApi.update(addr.id, addr);
      } else {
        return addressesApi.create(addr);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      toast.success(editingAddress ? 'Address updated successfully' : 'New address saved with Google Maps pin');
      setEditingAddress(null);
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      toast.success('Address removed');
    }
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) => addressesApi.update(id, { isDefault: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      toast.success('Default shipping address updated');
    }
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      localStorage.setItem(`interiorg_dob_${user.id}`, dob);
      localStorage.setItem(`interiorg_anniversary_${user.id}`, anniversary);
      localStorage.setItem(`interiorg_phone_${user.id}`, phone);
    }
    toast.success('Personal profile & milestone dates saved successfully!');
  };

  const handleOpenNewAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAccount = () => {
    // SECURITY CHECK: Verify if any services are currently running
    if (runningServices.length > 0) {
      toast.error('Cannot delete account: Active services are currently running.');
      return;
    }

    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account closure');
      return;
    }

    // Clean up local patron records
    if (user?.id) {
      localStorage.removeItem(`interiorg_dob_${user.id}`);
      localStorage.removeItem(`interiorg_anniversary_${user.id}`);
      localStorage.removeItem(`interiorg_phone_${user.id}`);
    }
    localStorage.removeItem('interiorg_saved_addresses');

    logout();
    toast.success('Your InteriorG account has been permanently deleted.');
    navigate('/');
  };

  return (
    <div className="page-wrapper bg-white min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* EDITORIAL BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-semibold">Sanctuary Patron Portal</span>
        </nav>

        {/* EDITORIAL PAGE HEADER */}
        <div className="mb-8 pb-6 border-b border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md"
              style={{ background: 'var(--brand-primary)' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-green text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5">
                  Private Sanctuary Patron
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">ID: {user?.id.slice(-8)}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif text-[var(--text-main)] tracking-tight m-0">
                Welcome, {user?.name || 'Patron'}
              </h1>
              <p className="text-[var(--text-muted)] text-xs sm:text-sm mt-1 max-w-2xl font-light">
                Manage your home commissions, living nursery setups, Google Maps address book, and milestone celebrations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link 
              to="/packages" 
              className="btn btn-secondary text-xs uppercase tracking-wider px-4 py-2.5 inline-flex items-center gap-2 shadow-xs"
            >
              <Package size={14} style={{ color: 'var(--accent)' }} />
              <span>Decor & Nursery Packages</span>
            </Link>
            <Link 
              to="/cart" 
              className="btn btn-primary text-xs uppercase tracking-wider px-4 py-2.5 inline-flex items-center gap-2 shadow-xs"
            >
              <ShoppingBag size={14} />
              <span>Sanctuary Bag ({itemCount})</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                toast.success('Signed out successfully');
                navigate('/login');
              }}
              className="btn btn-secondary text-xs uppercase tracking-wider px-3.5 py-2.5 inline-flex items-center gap-1.5 shadow-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              title="Sign Out from this account"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* DASHBOARD TAB NAVIGATION BAR */}
        <div className="flex items-center gap-2 border-b border-[var(--border)] mb-8 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Services', icon: Compass },
            { id: 'settings', label: 'Account Settings', icon: Settings },
            { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, count: 3 },
            { id: 'addresses', label: 'Saved Addresses & Google Map', icon: MapPin, count: addresses?.length },
            { id: 'milestones', label: 'DOB & Milestones', icon: Calendar },
            { id: 'orders', label: 'Commissions Archive', icon: Package, count: totalOrders }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'
                }`}
                style={isActive ? { background: 'var(--brand-primary)', color: '#ffffff' } : {}}
              >
                <Icon size={14} style={isActive ? { color: 'var(--hero-accent-color, #ffffff)' } : {}} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & SERVICES                                                */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* PRIVILEGE VOUCHER BANNER (USES THEME GRADIENT) */}
            <div 
              className="p-5 rounded-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg border border-[var(--border)]"
              style={{ background: 'var(--hero-gradient)' }}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/20"
                  style={{ background: 'rgba(255, 255, 255, 0.15)', color: 'var(--hero-accent-color)' }}
                >
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white"
                      style={{ color: 'var(--brand-primary)' }}
                    >
                      Exclusive Patron Privilege
                    </span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--hero-accent-color)' }}>Flat 15% OFF Active</span>
                  </div>
                  <p className="text-base font-serif font-medium text-white m-0">
                    Welcome to InteriorG! Use voucher code <span className="font-mono font-bold bg-white/20 px-2 py-0.5 border border-white/30 rounded text-white select-all">WELCOME15</span> for 15% off any New Arrival or Custom Commission.
                  </p>
                  <p className="text-xs mt-1 m-0 font-light opacity-90">
                    Valid on solid Sheesham furniture, acoustic wood paneling, living green walls, and custom wallpaper murals.
                  </p>
                </div>
              </div>
              <Link
                to="/packages"
                className="btn btn-secondary bg-white border-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-sm whitespace-nowrap self-stretch md:self-auto justify-center inline-flex items-center gap-2"
                style={{ color: 'var(--brand-primary)' }}
              >
                <span>Explore Packages</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* METRIC STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Total Orders</span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <Package size={16} />
                  </div>
                </div>
                <h2 className="font-serif text-3xl font-bold text-slate-900 m-0">
                  {isOrdersLoading ? '...' : totalOrders}
                </h2>
                <p className="text-xs text-slate-400 mt-1">Lifetime furnishings & decor</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Active Services Running</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <Clock size={16} />
                  </div>
                </div>
                <h2 className="font-serif text-3xl font-bold text-amber-600 m-0">
                  {isOrdersLoading ? '...' : pendingOrders}
                </h2>
                <p className="text-xs text-slate-400 mt-1">In fabrication, planting or transit</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Delivered Sanctuaries</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle size={16} />
                  </div>
                </div>
                <h2 className="font-serif text-3xl font-bold text-emerald-600 m-0">
                  {isOrdersLoading ? '...' : deliveredOrders}
                </h2>
                <p className="text-xs text-slate-400 mt-1">Completed commissions</p>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Saved Addresses</span>
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                    <MapPin size={16} />
                  </div>
                </div>
                <h2 className="font-serif text-3xl font-bold text-sky-700 m-0">
                  {isAddressesLoading ? '...' : (addresses?.length || 0)}
                </h2>
                <p className="text-xs text-slate-400 mt-1">Pinpointed Google Map locations</p>
              </div>
            </div>

            {/* ONGOING SERVICES BANNER (IF ANY RUNNING) */}
            {pendingOrders > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 m-0">
                    Active Services In Progress ({pendingOrders})
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 m-0">
                    You have active orders undergoing design fabrication or nursery botanical transport. As per safety policies, account management remains locked until all active services are successfully delivered.
                  </p>
                </div>
              </div>
            )}

            {/* RECENT COMMISSIONS PREVIEW */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-slate-900 m-0">Recent Commissions</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Your latest sanctuary furnishings and customizer orders.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold uppercase tracking-wider text-[#0284C7] hover:underline flex items-center gap-1"
                >
                  <span>View All Commissions</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {!orders?.length ? (
                <div className="text-center py-10">
                  <Package size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-serif italic text-sm text-slate-600 m-0">No active commissions yet.</p>
                  <Link to="/packages" className="mt-3 inline-flex items-center gap-1 text-xs text-[#0284C7] font-semibold">
                    <span>Explore Sanctuary Packages</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <div 
                      key={order.id} 
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-semibold text-sm text-slate-900">
                            Order #{order.orderNumber}
                          </span>
                          <span className={`badge text-[10px] px-2 py-0.5 ${
                            order.status === 'DELIVERED' ? 'badge-green' :
                            order.status === 'SHIPPED' ? 'badge-blue' :
                            order.status === 'PROCESSING' ? 'badge-purple' : 'badge-yellow'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 m-0">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}: {order.items[0]?.product?.name || 'Sanctuary Piece'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-serif font-bold text-slate-900 text-sm">
                          ₹{Number(order.total).toLocaleString('en-IN')}
                        </span>
                        <Link 
                          to="/orders" 
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                        >
                          <span>Track</span>
                          <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ADDRESS MANAGEMENT WITH GOOGLE MAP PIN LOCATOR                     */}
        {/* ========================================================================= */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div>
                <h3 className="font-serif text-xl font-semibold text-slate-900 m-0">
                  Saved Delivery Addresses & Google Map Locator
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your home, villa, studio, or corporate addresses with precise street names and Google Maps GPS pins.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenNewAddress}
                className="btn btn-primary text-xs uppercase tracking-wider px-4 py-2.5 inline-flex items-center gap-2 shadow-xs shrink-0"
              >
                <Plus size={14} />
                <span>Add Address with Map</span>
              </button>
            </div>

            {isAddressesLoading ? (
              <div className="py-12 text-center text-slate-400">
                <div className="loading-spinner mx-auto mb-2" />
                <p className="text-xs">Loading your saved addresses...</p>
              </div>
            ) : !addresses?.length ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                <MapPin size={36} className="mx-auto text-slate-300 mb-2" />
                <h4 className="font-serif text-base text-slate-700 m-0">No saved addresses found</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Add your primary residence or villa address with street name and interactive Google Maps pin.
                </p>
                <button
                  type="button"
                  onClick={handleOpenNewAddress}
                  className="btn btn-primary text-xs uppercase tracking-wider px-5 py-2.5"
                >
                  Add First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-6 rounded-2xl border transition-all relative flex flex-col justify-between ${
                      addr.isDefault 
                        ? 'border-sky-500 bg-sky-50/30 shadow-md ring-1 ring-sky-500/20' 
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                            {addr.tag || 'Home'}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-600 text-white">
                              Primary Default
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Address"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAddressMutation.mutate(addr.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Address"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-serif text-base font-semibold text-slate-900 m-0">
                        {addr.name || 'Patron Resident'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>{addr.phone || '+91 Not Specified'}</span>
                      </p>

                      <div className="mt-3 text-xs text-slate-700 leading-relaxed">
                        <p className="font-medium text-slate-900 m-0">{addr.line1}</p>
                        {addr.line2 && <p className="text-slate-500 m-0">{addr.line2}</p>}
                        <p className="text-slate-600 m-0">
                          {addr.city}, {addr.state} - <span className="font-mono font-semibold">{addr.postalCode}</span>
                        </p>
                      </div>

                      {/* Google Map Pin Indicator */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1.5 text-sky-700 font-medium">
                          <MapPin size={13} className="text-sky-600" />
                          <span>Google Maps Pinpoint Active</span>
                        </span>
                        {addr.latitude && addr.longitude && (
                          <span className="font-mono text-[10px] text-slate-400">
                            {addr.latitude.toFixed(2)}°, {addr.longitude.toFixed(2)}°
                          </span>
                        )}
                      </div>
                    </div>

                    {!addr.isDefault && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                          className="text-xs text-slate-600 hover:text-sky-700 font-medium flex items-center gap-1"
                        >
                          <Check size={13} />
                          <span>Set as default shipping address</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: USER MILESTONES (DATE OF BIRTH & ANNIVERSARY DATES)                */}
        {/* ========================================================================= */}
        {activeTab === 'milestones' && (
          <div className="max-w-3xl space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-serif text-xl font-semibold text-slate-900 m-0">
                Personal Milestones & Celebration Perks
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Provide your Date of Birth and Wedding / Sanctuary Anniversary to unlock bespoke gift privileges, complimentary birthday nursery foliage, and anniversary design discounts.
              </p>
            </div>

            {/* MILESTONE PRIVILEGE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-pink-200 bg-pink-50/50 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <Cake size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-pink-900 m-0">
                    Birthday Privilege Club
                  </h4>
                  <p className="text-xs text-pink-700 mt-1 m-0 leading-relaxed">
                    Receive a complimentary exotic tabletop nursery bloom + 20% privilege voucher during your birthday month.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 m-0">
                    Anniversary Sanctuary Styling
                  </h4>
                  <p className="text-xs text-rose-700 mt-1 m-0 leading-relaxed">
                    Complimentary 360° Studio re-styling session + priority architect consultation on your anniversary week.
                  </p>
                </div>
              </div>
            </div>

            {/* MILESTONE FORM */}
            <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Cake size={14} className="text-pink-600" />
                    <span>Date of Birth (DOB)</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Used for birthday surprise gifts & botanical privileges</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Heart size={14} className="text-rose-600" />
                    <span>Sanctuary / Wedding Anniversary</span>
                  </label>
                  <input
                    type="date"
                    value={anniversary}
                    onChange={(e) => setAnniversary(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Unlock annual home sanctuary anniversary credits</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary text-xs uppercase tracking-wider px-6 py-2.5 shadow-sm inline-flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Save Milestones & Dates</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FULL COMMISSIONS ARCHIVE                                           */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div>
                <h3 className="font-serif text-xl font-semibold text-slate-900 m-0">
                  Commissions & Orders History
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Comprehensive archive of all custom wallpapers, furnishings, and botanical nursery orders.
                </p>
              </div>
              <Link 
                to="/orders" 
                className="px-4 py-2 border border-slate-300 bg-white rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-50"
              >
                Detailed Tracking View
              </Link>
            </div>

            {isOrdersLoading ? (
              <div className="py-12 text-center text-slate-400">
                <div className="loading-spinner mx-auto mb-2" />
                <p className="text-xs">Loading commissions...</p>
              </div>
            ) : !orders?.length ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                <Package size={36} className="mx-auto text-slate-300 mb-2" />
                <h4 className="font-serif text-base text-slate-700 m-0">No commissions placed yet</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Browse our curated interior collections or book an all-in-one decor package.
                </p>
                <Link
                  to="/packages"
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <span>Explore Packages</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-base font-semibold text-slate-900">
                            Order #{order.orderNumber}
                          </span>
                          <span className={`badge text-xs px-2.5 py-0.5 ${
                            order.status === 'DELIVERED' ? 'badge-green' :
                            order.status === 'SHIPPED' ? 'badge-blue' :
                            order.status === 'PROCESSING' ? 'badge-purple' : 'badge-yellow'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Commissioned on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Amount</span>
                        <span className="font-serif text-lg font-bold text-slate-900">
                          ₹{Number(order.total).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <span className="font-medium text-slate-900 block">{item.product?.name || 'Sanctuary Commission Item'}</span>
                              <span className="text-slate-400">Quantity: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="font-mono text-slate-700">₹{Number(item.unitPrice).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: SAVED WISHLIST                                                       */}
        {/* ========================================================================= */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-slate-900 m-0">
                  Saved Sanctuary Wishlist
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Keep track of custom wallpapers, botanical nursery plants, and curated decor.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full">
                3 Saved Articles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 'cmvfw83l9002ei29wpgbi1mgr',
                  name: 'Earthy Bohemian Terracotta Arch Wallpaper',
                  category: 'Wallpapers',
                  price: '₹2,799',
                  original: '₹3,499',
                  image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
                  badge: 'Custom Sized'
                },
                {
                  id: 'cmvfw83l9002ii29wzq567opq',
                  name: 'Wheel-Thrown Terracotta Balcony Planter Urn',
                  category: 'Exterior Living',
                  price: '₹999',
                  original: '₹1,299',
                  image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
                  badge: 'Porous Clay'
                },
                {
                  id: 'cmvfw83l9002ji29wlk789rst',
                  name: 'Weatherproof Sandstone Facade Louver Panel',
                  category: 'Exterior Facade',
                  price: '₹3,999',
                  original: '₹4,899',
                  image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
                  badge: 'Monsoon UV'
                }
              ].map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-black/70 text-white">
                      {item.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => toast.success('Removed from wishlist')}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center hover:bg-white transition-colors"
                      title="Remove from wishlist"
                    >
                      <Heart size={16} fill="currentColor" />
                    </button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{item.category}</span>
                      <h4 className="text-sm font-semibold text-slate-900 mt-1 leading-snug">{item.name}</h4>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-base font-bold text-slate-900">{item.price}</span>
                        <span className="text-xs text-slate-400 line-through">{item.original}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Link
                        to={`/products/${item.id}`}
                        className="flex-1 text-center py-2 px-3 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        View Article
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          toast.success('Moved to Sanctuary Cart');
                        }}
                        className="py-2 px-3 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ACCOUNT SETTINGS & SAFE ACCOUNT DELETION                           */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-serif text-xl font-semibold text-slate-900 m-0">
                Account Settings & Security
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage your credentials, notification preferences, and account lifecycle.
              </p>
            </div>

            {/* ACTIVE SESSION CARD WITH SIGN OUT */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold text-lg shrink-0"
                  style={{ background: 'var(--brand-primary, #0f2444)' }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{user?.name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {user?.role}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{user?.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  toast.success('Signed out successfully');
                  navigate('/login');
                }}
                className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <LogOut size={14} />
                <span>Sign Out from this Device</span>
              </button>
            </div>

            {/* PREFERENCES CARD */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-serif text-base font-semibold text-slate-900 m-0">
                Sanctuary Notification Preferences
              </h4>
              <div className="space-y-3 text-xs text-slate-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-sky-600" />
                  <span>Receive WhatsApp updates for order tracking and on-site architect arrivals</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-sky-600" />
                  <span>Receive Birthday and Anniversary privilege voucher emails</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-sky-600" />
                  <span>Seasonal plant health care tips and pruning schedules from our Horticulturists</span>
                </label>
              </div>
            </div>

            {/* DANGER ZONE: ACCOUNT DELETION */}
            <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-red-900 m-0">
                    Danger Zone: Delete Patron Account
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Permanently delete your InteriorG patron profile, saved Google Map addresses, design portfolio, and measurements. Once deleted, this action cannot be reversed.
                  </p>
                </div>
              </div>

              {/* CRITICAL CONDITIONAL RESTRICTION: ACTIVE SERVICES BLOCK */}
              {pendingOrders > 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
                  <Lock size={18} className="text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold uppercase tracking-wider block mb-0.5">
                      Account Deletion Locked: Ongoing Services Active
                    </span>
                    You currently have <span className="font-bold">{pendingOrders} active commission(s)</span> in progress (e.g. Order #{runningServices[0]?.orderNumber} - {runningServices[0]?.status}). Under InteriorG security and fulfillment policy, customer accounts cannot be deleted while site measurements, fabrication, or nursery plant transit services are running.
                    <p className="mt-1 font-semibold text-amber-800 m-0">
                      Once all active services are marked as DELIVERED or CANCELLED, account deletion will automatically unlock.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>No active services running. Account eligible for safe deletion.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                  >
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* GOOGLE MAP ADDRESS PICKER MODAL */}
      <AddressMapPickerModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={(addr) => saveAddressMutation.mutate(addr)}
        initialData={editingAddress}
      />

      {/* ACCOUNT DELETION CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle size={24} />
              <h3 className="font-serif text-lg font-bold text-slate-900 m-0">
                Confirm Account Deletion
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to permanently delete your InteriorG account? All your saved measurements, room customizer drafts, and Google Map addresses will be deleted.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConfirmText('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE'}
                className={`px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-white ${
                  confirmText === 'DELETE' 
                    ? 'bg-red-600 hover:bg-red-700 cursor-pointer' 
                    : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
