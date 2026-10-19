import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ordersApi } from '../api/orders';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
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
  Compass
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { cart, itemCount } = useCart();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.list
  });

  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status)).length || 0;
  const deliveredOrders = orders?.filter(o => o.status === 'DELIVERED').length || 0;
  const recentOrders = orders?.slice(0, 3) || [];

  return (
    <div className="page-wrapper bg-white">
      <Header />

      <main className="page py-8">
        {/* EDITORIAL BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs text-muted mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-dark">Home</Link>
          <ChevronRight size={12} />
          <span className="text-dark font-medium">Sanctuary Account</span>
        </nav>

        {/* EDITORIAL PAGE HEADER */}
        <div className="mb-10 pb-6 border-b border-[#eaeaea] flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex items-start gap-4">
            <img 
              src="/interiorg-mark-transparent.png" 
              alt="InteriorG Patron" 
              className="w-12 h-12 object-contain flex-shrink-0 hidden sm:block" 
            />
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="badge badge-green text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5">
                  Private Sanctuary
                </span>
                <span className="text-xs text-muted">ID: {user?.id.slice(-8)}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic font-normal text-dark tracking-tight m-0">
                Welcome, {user?.name || 'Patron'}
              </h1>
              <p className="text-muted text-sm sm:text-base mt-2 max-w-2xl font-light">
                Manage your architectural commissions, custom wall measurements, and personal sanctuary profile.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link 
              to="/shop" 
              className="btn btn-secondary text-xs uppercase tracking-wider px-4 py-2.5 inline-flex items-center gap-2"
            >
              <Compass size={14} />
              <span>Explore Collection</span>
            </Link>
            <Link 
              to="/cart" 
              className="btn btn-primary text-xs uppercase tracking-wider px-4 py-2.5 inline-flex items-center gap-2"
            >
              <ShoppingBag size={14} />
              <span>View Bag ({itemCount})</span>
            </Link>
          </div>
        </div>

        {/* EXCLUSIVE MEMBER WELCOME DISCOUNT BANNER */}
        <div className="mb-10 p-5 rounded-xl border border-[#cbdceb] bg-gradient-to-r from-[#0a192f] via-[#0f2444] to-[#1b3a6b] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-[#93c5fd] flex items-center justify-center flex-shrink-0 shadow-sm border border-white/20">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white text-[#0a192f]">
                  Exclusive Member Privilege
                </span>
                <span className="text-xs font-semibold text-[#93c5fd]">Flat 15% OFF Active</span>
              </div>
              <p className="text-base font-serif font-medium text-white m-0">
                Welcome to InteriorG! Use voucher code <span className="font-mono font-bold bg-white/20 px-2 py-0.5 border border-white/30 rounded text-white select-all">WELCOME15</span> for 15% off any New Arrival or Custom Commission.
              </p>
              <p className="text-xs text-blue-100 mt-1 m-0 font-light">
                Applicable on all handcrafted Sheesham consoles, sunburst brass mirrors, botanical planters, and wallpaper murals.
              </p>
            </div>
          </div>
          <Link
            to="/shop"
            className="btn btn-secondary bg-white text-[#0a192f] border-white hover:bg-blue-50 px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm whitespace-nowrap self-stretch md:self-auto justify-center inline-flex items-center gap-2"
          >
            <span>Redeem 15% OFF</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* LUXURY METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-[#faf9f7] border border-[#ded9d0] p-6 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-muted font-medium">Total Commissions</span>
              <div className="w-8 h-8 rounded-full bg-white border border-[#e0dad0] flex items-center justify-center text-dark">
                <Package size={16} />
              </div>
            </div>
            <h2 className="font-serif text-3xl font-medium text-dark m-0">
              {isLoading ? '...' : totalOrders}
            </h2>
            <p className="text-xs text-muted mt-2">Lifetime bespoke orders</p>
          </div>

          <div className="bg-[#faf9f7] border border-[#ded9d0] p-6 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-muted font-medium">In Fabrication / Transit</span>
              <div className="w-8 h-8 rounded-full bg-white border border-[#e0dad0] flex items-center justify-center text-accent">
                <Clock size={16} />
              </div>
            </div>
            <h2 className="font-serif text-3xl font-medium text-dark m-0">
              {isLoading ? '...' : pendingOrders}
            </h2>
            <p className="text-xs text-muted mt-2">Active commissions</p>
          </div>

          <div className="bg-[#faf9f7] border border-[#ded9d0] p-6 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-muted font-medium">Installed Sanctuaries</span>
              <div className="w-8 h-8 rounded-full bg-white border border-[#e0dad0] flex items-center justify-center text-[#6a8c6f]">
                <CheckCircle size={16} />
              </div>
            </div>
            <h2 className="font-serif text-3xl font-medium text-dark m-0">
              {isLoading ? '...' : deliveredOrders}
            </h2>
            <p className="text-xs text-muted mt-2">Successfully delivered</p>
          </div>

          <div className="bg-[#faf9f7] border border-[#ded9d0] p-6 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-muted font-medium">Curated Bag</span>
              <div className="w-8 h-8 rounded-full bg-white border border-[#e0dad0] flex items-center justify-center text-dark">
                <ShoppingBag size={16} />
              </div>
            </div>
            <h2 className="font-serif text-3xl font-medium text-dark m-0">
              {itemCount}
            </h2>
            <p className="text-xs text-muted mt-2">Pieces ready for checkout</p>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: RECENT ORDERS */}
          <div className="lg:col-span-8 bg-white border border-[#eaeaea] rounded-lg p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#f0f0f0]">
              <div>
                <h3 className="font-serif text-xl font-medium text-dark m-0">Recent Commissions</h3>
                <p className="text-xs text-muted mt-1">Your latest sanctuary furnishings and wall customizer orders.</p>
              </div>
              <Link 
                to="/orders" 
                className="text-xs uppercase tracking-wider text-dark font-medium flex items-center gap-1 hover:text-accent transition-colors"
              >
                <span>View Full Archive</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-muted">
                <div className="loading-spinner mb-3 mx-auto" />
                <p className="font-serif italic text-sm">Loading commissions...</p>
              </div>
            ) : !orders?.length ? (
              <div className="text-center py-12 px-4 bg-[#faf9f7] rounded-lg border border-[#e8e4dc]">
                <Package size={32} className="mx-auto text-muted mb-3" />
                <h4 className="font-serif italic text-lg text-dark mb-1">Your Archive is Empty</h4>
                <p className="text-xs text-muted max-w-sm mx-auto mb-5">
                  Begin curating your residence with bespoke wallpapers, wooden furniture, and botanical plants.
                </p>
                <Link 
                  to="/shop" 
                  className="btn btn-primary py-2.5 px-6 text-xs uppercase tracking-wider"
                >
                  Browse InteriorG Collections
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div 
                    key={order.id} 
                    className="p-4 sm:p-5 rounded-lg border border-[#eaeaea] hover:border-[#cfcfcf] transition-all bg-[#faf9f7]"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                      <div>
                        <span className="font-serif text-base font-medium text-dark">
                          Order #{order.orderNumber}
                        </span>
                        <span className="text-xs text-muted ml-3">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-medium text-sm text-dark">
                          ₹{Number(order.total).toLocaleString('en-IN')}
                        </span>
                        <span className={`badge text-xs ${
                          order.status === 'DELIVERED' ? 'badge-green' :
                          order.status === 'SHIPPED' ? 'badge-blue' :
                          order.status === 'PROCESSING' ? 'badge-purple' : 'badge-yellow'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-[#e8e4dc] pt-3 mt-2 flex items-center justify-between text-xs text-muted">
                      <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}: {order.items[0]?.product.name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}</span>
                      <Link to="/orders" className="text-[var(--navy)] font-medium hover:underline flex items-center gap-1">
                        Track Details <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: ACCOUNT DETAILS & QUICK SERVICES */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Services */}
            <div className="bg-white border border-[var(--border)] rounded-lg p-6 shadow-xs">
              <h3 className="font-serif text-lg font-medium text-dark mb-4 pb-2 border-b border-[#e8e4dc]">
                Interior Services
              </h3>
              <div className="space-y-3">
                <Link 
                  to="/shop" 
                  className="p-3.5 bg-white border border-[#eaeaea] rounded flex items-center justify-between hover:border-[var(--navy)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Paintbrush size={18} className="text-accent" />
                    <div>
                      <p className="font-serif text-sm font-medium text-dark m-0">Curated Collection</p>
                      <p className="text-xs text-muted m-0">Explore bespoke furniture & wall art</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </Link>

                <Link 
                  to="/gardening" 
                  className="p-3.5 bg-white border border-[#eaeaea] rounded flex items-center justify-between hover:border-[var(--navy)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} className="text-[#6a8c6f]" />
                    <div>
                      <p className="font-serif text-sm font-medium text-dark m-0">Home Nursery & Decor</p>
                      <p className="text-xs text-muted m-0">Lawn, balcony & botanical plants</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </Link>

                <Link 
                  to="/orders" 
                  className="p-3.5 bg-white border border-[#eaeaea] rounded flex items-center justify-between hover:border-[var(--navy)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package size={18} className="text-dark" />
                    <div>
                      <p className="font-serif text-sm font-medium text-dark m-0">Order Archive</p>
                      <p className="text-xs text-muted m-0">Invoices & shipping trackers</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </Link>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white border border-[#eaeaea] rounded-lg p-6">
              <h3 className="font-serif text-lg font-medium text-dark mb-4 pb-2 border-b border-[#f0f0f0]">
                Client Profile
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted uppercase tracking-wider block mb-0.5">Full Name</span>
                  <span className="font-medium text-dark text-sm">{user?.name}</span>
                </div>
                <div>
                  <span className="text-muted uppercase tracking-wider block mb-0.5">Email Address</span>
                  <span className="font-medium text-dark text-sm">{user?.email}</span>
                </div>
                <div>
                  <span className="text-muted uppercase tracking-wider block mb-0.5">Membership Tier</span>
                  <span className="badge badge-green text-xs font-semibold">{user?.role}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#f0f0f0] flex items-center gap-2 text-xs text-muted">
                <ShieldCheck size={16} className="text-[#6a8c6f]" />
                <span>InteriorG Patron Privileges Active</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
