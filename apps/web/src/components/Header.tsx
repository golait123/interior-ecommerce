import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  User as UserIcon, 
  Menu, 
  X, 
  LayoutDashboard, 
  Smartphone,
  Heart,
  ChevronDown,
  Sparkles,
  PhoneCall,
  MapPin,
  Box,
  Compass,
  Sprout,
  Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { LuckyBookingModal } from './LuckyBookingModal';

export function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentDomain = searchParams.get('domain');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isLuckyModalOpen, setIsLuckyModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="site-header">
      {/* 1. TOP UTILITY STRIP */}
      <div className="header-utility-strip">
        <div className="header-utility-container">
          <div className="utility-left">
            <span className="utility-tagline hidden lg:inline">
              <Sparkles size={12} className="inline mr-1 text-gold" />
              Interior Architecture | Luxury Wall Decor | Green Living — <em>Design. Visualize. Personalize. Live Better.</em>
            </span>
          </div>

          {/* Lucky Booking Window Section from Screenshot */}
          <button
            type="button"
            onClick={() => setIsLuckyModalOpen(true)}
            className="utility-lucky-banner-btn"
            title="Click to enter the 5-Minute Lucky Booking Window"
          >
            <span className="lucky-pulse-dot" />
            <span className="lucky-text-highlight">🎁 Free Lucky Draw:</span>
            <span>Free Gardening Kit + 1 Room Decor Service</span>
            <span className="lucky-countdown-pill">⚡ 5-Min Fast Book</span>
          </button>

          <div className="utility-right">
            {/* Country / Currency Selector */}
            <div className="currency-selector-dropdown">
              <button
                type="button"
                className="currency-btn"
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                aria-label="Select country & currency"
              >
                <span>🇮🇳 India (INR ₹)</span>
                <ChevronDown size={12} />
              </button>
              {isCurrencyOpen && (
                <div className="currency-menu">
                  <button
                    type="button"
                    className="currency-item active"
                    onClick={() => { setSelectedCurrency('INR'); setIsCurrencyOpen(false); }}
                  >
                    🇮🇳 India (INR ₹)
                  </button>
                  <button
                    type="button"
                    className="currency-item"
                    onClick={() => { setSelectedCurrency('USD'); setIsCurrencyOpen(false); }}
                  >
                    🇺🇸 USA (USD $)
                  </button>
                  <button
                    type="button"
                    className="currency-item"
                    onClick={() => { setSelectedCurrency('AED'); setIsCurrencyOpen(false); }}
                  >
                    🇦🇪 UAE (AED د.إ)
                  </button>
                  <button
                    type="button"
                    className="currency-item"
                    onClick={() => { setSelectedCurrency('GBP'); setIsCurrencyOpen(false); }}
                  >
                    🇬🇧 UK (GBP £)
                  </button>
                </div>
              )}
            </div>

            <span className="utility-divider">|</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('pwa-install-request'))}
              className="utility-link app-link-btn"
            >
              <Smartphone size={12} className="inline mr-1" />
              App Download
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Logo, Search Bar, Account, Wishlist, Cart) */}
      <div className="header-main-bar">
        <div className="header-main-container">
          {/* Mobile hamburger */}
          <div className="header-mobile-toggle">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              aria-label="Toggle menu" 
              className="header-icon-btn"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* InteriorG Brand Identity */}
          <Link to="/" className="brand-logo-lockup" onClick={closeMenu}>
            <div className="brand-logo-icon">
              <Sprout size={24} className="sprout-icon" />
            </div>
            <div className="brand-logo-text">
              <div className="brand-title">
                Interior<span className="brand-title-accent">G</span>
              </div>
              <div className="brand-subtitle">Walls • Plants • Spaces • You</div>
            </div>
          </Link>

          {/* Central Search Bar */}
          <form className="header-search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search wallpapers, plants, panels, room studio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="header-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="header-action-group">
            {/* Wishlist Link */}
            <Link to="/customer/dashboard?tab=wishlist" className="header-action-item" title="Wishlist">
              <div className="action-icon-wrapper">
                <Heart size={20} />
                <span className="action-badge-dot">3</span>
              </div>
              <span className="action-label">Wishlist</span>
            </Link>

            {/* Account / User Menu */}
            {user ? (
              <div className="user-account-dropdown">
                <button className="header-action-item user-btn">
                  <div className="action-icon-wrapper">
                    <UserIcon size={20} />
                  </div>
                  <span className="action-label">{user.name ? user.name.split(' ')[0] : 'Account'}</span>
                </button>
                <div className="user-flyout-menu">
                  <div className="flyout-header">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                    <span className="flyout-role-tag">{user.role}</span>
                  </div>
                  <div className="flyout-links">
                    <Link to="/customer/dashboard" className="flyout-link">
                      Customer Dashboard
                    </Link>
                    <Link to="/orders" className="flyout-link">
                      My Orders
                    </Link>
                    {['ADMIN', 'STOCK_MANAGER'].includes(user.role) && (
                      <Link to="/dashboard" className="flyout-link highlight">
                        <LayoutDashboard size={14} className="inline mr-1" />
                        Admin Workspace
                      </Link>
                    )}
                    <button type="button" onClick={logout} className="flyout-logout-btn">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="header-action-item" title="Sign In">
                <div className="action-icon-wrapper">
                  <UserIcon size={20} />
                </div>
                <span className="action-label">Sign In</span>
              </Link>
            )}

            {/* Cart Bag */}
            <Link to="/cart" className="header-action-item cart-action-btn" title="View Cart">
              <div className="action-icon-wrapper">
                <ShoppingBag size={20} />
                {itemCount > 0 && <span className="cart-badge-count">{itemCount}</span>}
              </div>
              <span className="action-label">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY PRODUCT NAVIGATION BAR */}
      <nav className="header-nav-bar">
        <div className="header-nav-container">
          <ul className="primary-nav-list">
            <li className="nav-item">
              <Link 
                to="/shop?domain=indoor" 
                className={`nav-link ${location.pathname === '/shop' && (!currentDomain || currentDomain === 'indoor') ? 'active' : ''}`}
              >
                Interior Design
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/shop?domain=outdoor" 
                className={`nav-link ${location.pathname === '/shop' && currentDomain === 'outdoor' ? 'active' : ''}`}
              >
                Exterior Design
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/gardening" 
                className={`nav-link ${location.pathname === '/gardening' ? 'active' : ''}`}
              >
                Nursery Decor
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/packages" 
                className={`nav-link nav-curved-square-btn ${location.pathname === '/packages' ? 'active' : ''}`}
                title="Home Decor + Nursery Combo Packages"
              >
                <Package size={13} className="text-[#8c6f52]" />
                <span>Packages</span>
                <span className="nav-package-badge">Combos</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/shop?tag=sale" 
                className={`nav-link sale-link ${location.pathname === '/shop' && searchParams.get('tag') === 'sale' ? 'active' : ''}`}
              >
                Sale
                <span className="sale-pill">Up to 40% Off</span>
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <div className="nav-quick-perk hidden xl:block">
              <span>Free Sample Swatches • 10-Year Warranty • 50+ Cities Installation</span>
            </div>

            {/* Dedicated Separate Space: 360° Room Studio Launcher */}
            <Link 
              to="/room-studio" 
              className="room-studio-launcher-btn"
              title="Launch 360° Interactive 3D Room Studio"
            >
              <Compass size={14} className="spin-slow text-[#8c6f52]" />
              <span>360° Room Studio</span>
              <span className="badge-3d-pulse">3D</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER */}
      {isMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div className="brand-logo-lockup">
                <div className="brand-logo-icon">
                  <Sprout size={20} className="sprout-icon" />
                </div>
                <div className="brand-logo-text">
                  <div className="brand-title">Interior<span>G</span></div>
                  <div className="brand-subtitle">Walls • Plants • Spaces</div>
                </div>
              </div>
              <button onClick={closeMenu} className="close-drawer-btn" aria-label="Close menu">
                <X size={22} />
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mobile-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search wallpapers, plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Mobile Links */}
            <div className="mobile-nav-links">
              <Link to="/" onClick={closeMenu} className="mobile-nav-item">
                Home
              </Link>
              <Link to="/shop?domain=indoor" onClick={closeMenu} className="mobile-nav-item">
                Interior Design
              </Link>
              <Link to="/shop?domain=outdoor" onClick={closeMenu} className="mobile-nav-item">
                Exterior Design
              </Link>
              <Link to="/gardening" onClick={closeMenu} className="mobile-nav-item">
                Nursery Decor
              </Link>
              <Link to="/packages" onClick={closeMenu} className="mobile-nav-item flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package size={14} className="text-[#8c6f52]" />
                  <span>Packages (Home + Nursery)</span>
                </span>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">Combos</span>
              </Link>
              <Link to="/shop?tag=sale" onClick={closeMenu} className="mobile-nav-item sale-item">
                Sale (Up to 40% Off)
              </Link>

              {/* Dedicated Lucky Customer Draw Card */}
              <div 
                className="mobile-lucky-drawer-card" 
                onClick={() => { setIsMenuOpen(false); setIsLuckyModalOpen(true); }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="lucky-pulse-dot" />
                  <span className="text-xs font-bold text-amber-300">⚡ 5-Minute Lucky Draw Window</span>
                </div>
                <p className="text-xs text-white/90 font-medium m-0 leading-snug">
                  Free Deluxe Gardening Kit + 1 Single Room Decoration Service
                </p>
                <span className="text-[11px] text-amber-300 mt-1.5 font-bold inline-flex items-center gap-1">
                  <span>Fast Book Now (Registered Members)</span>
                  <Sparkles size={11} />
                </span>
              </div>

              {/* Dedicated Separate Space: 360° Room Studio Card */}
              <div className="p-3 my-2 bg-gradient-to-r from-[#faf7f2] to-[#f4ede3] rounded-xl border border-[#ded5c7]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-dark flex items-center gap-1.5">
                    <Compass size={15} className="text-[#8c6f52] animate-spin-slow" />
                    360° Room Studio
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#8c6f52] text-white">
                    3D Interactive
                  </span>
                </div>
                <p className="text-[11px] text-muted mb-2 font-light">
                  Experience your rooms in realistic 360° virtual 3D staging.
                </p>
                <Link
                  to="/room-studio"
                  onClick={closeMenu}
                  className="btn btn-sm btn-primary w-full text-xs py-1.5 flex items-center justify-center gap-1.5 font-semibold"
                >
                  <span>Launch 360° Studio</span>
                </Link>
              </div>

              <hr className="drawer-separator" />
              <Link to="/customer/dashboard" onClick={closeMenu} className="mobile-nav-item">
                Customer Dashboard
              </Link>
              <Link to="/orders" onClick={closeMenu} className="mobile-nav-item">
                My Orders
              </Link>
              <Link to="/about" onClick={closeMenu} className="mobile-nav-item">
                About & Consultation
              </Link>
            </div>

            <div className="mobile-drawer-footer">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('pwa-install-request'));
                  closeMenu();
                }}
                className="mobile-app-download-btn"
              >
                <Smartphone size={16} className="inline mr-2" />
                Install InteriorG App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lucky Booking Modal */}
      <LuckyBookingModal 
        isOpen={isLuckyModalOpen} 
        onClose={() => setIsLuckyModalOpen(false)} 
      />
    </header>
  );
}
