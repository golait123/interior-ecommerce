import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User as UserIcon, Menu, X, LayoutDashboard, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
      setIsSearchOpen(false);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Mobile menu hamburger */}
        <div className="header-mobile-toggle">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu" className="header-action-btn">
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Brand Logo in Pure Typography */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <span>Interior<span className="logo-g">G</span></span>
        </Link>

        {/* Centered Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/" className={isActive('/') ? 'active-link' : ''}>
            Home
          </Link>
          <Link to="/shop" className={location.pathname === '/shop' ? 'active-link' : ''}>
            Paintings & Craft
          </Link>
          <Link to="/gardening" className={isActive('/gardening') ? 'active-link' : ''}>
            Gardening & Decor
          </Link>
          <Link to="/about" className={isActive('/about') ? 'active-link' : ''}>
            Our Story
          </Link>
        </nav>

        {/* Right Header Actions */}
        <div className="header-actions">
          {/* PWA App Install Trigger */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('pwa-install-request'))}
            className="app-install-badge"
            title="Install InteriorG App on Android, iOS & Web"
          >
            <Smartphone size={13} />
            <span>Get App</span>
          </button>

          {/* Search Toggle */}
          <button 
            type="button" 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
            className="header-action-btn"
            title="Search collection"
          >
            <Search size={19} />
          </button>

          {/* User Profile */}
          {user ? (
            <div className="user-menu">
              {['ADMIN', 'STOCK_MANAGER'].includes(user.role) && (
                <Link to="/dashboard" className="header-action-btn" title="Dashboard">
                  <LayoutDashboard size={19} />
                </Link>
              )}
              <div className="user-avatar-container group" style={{ position: 'relative' }}>
                <button className="header-action-btn" aria-label="User account">
                  <UserIcon size={20} />
                </button>
                <div className="user-dropdown dropdown-menu">
                  <div className="dropdown-header">
                    <p style={{ fontWeight: 600 }}>{user.name}</p>
                    <small className="text-muted">{user.email}</small>
                    <div style={{ marginTop: '4px' }}>
                      <span className="badge badge-gray text-xs">{user.role}</span>
                    </div>
                  </div>
                  {user.role === 'CUSTOMER' && <Link to="/customer/dashboard" className="dropdown-item">Dashboard</Link>}
                  {user.role === 'CUSTOMER' && <Link to="/orders" className="dropdown-item">My Orders</Link>}
                  {['ADMIN', 'STOCK_MANAGER'].includes(user.role) && <Link to="/dashboard" className="dropdown-item">Management Console</Link>}
                  <button onClick={logout} className="dropdown-item text-danger">Sign Out</button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="header-action-btn" title="Account">
              <UserIcon size={20} />
            </Link>
          )}

          {/* Shopping Bag Icon */}
          <Link to="/cart" className="cart-icon" aria-label="Shopping Bag">
            <ShoppingBag size={21} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        </div>
      </div>

      {/* Expandable Search Input Drawer */}
      {isSearchOpen && (
        <div className="search-drawer bg-white border-b py-3 px-4 shadow-sm" style={{ borderColor: '#eaeaea' }}>
          <form className="max-w-xl mx-auto flex items-center gap-3" onSubmit={handleSearch}>
            <Search size={18} className="text-muted" />
            <input
              type="text"
              placeholder="Search chairs, consoles, brass decor, mirrors, wallpapers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm border-none bg-transparent focus:outline-none py-1.5 font-sans"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-xs text-muted hover:text-dark border-none bg-transparent cursor-pointer"
            >
              ✕ Close
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <nav className="mobile-nav">
            <Link to="/" onClick={closeMenu}>Home</Link>
            <Link to="/shop" onClick={closeMenu}>Paintings & Craft</Link>
            <Link to="/gardening" onClick={closeMenu}>Gardening & Decor</Link>
            <Link to="/about" onClick={closeMenu}>Our Story</Link>
            {user && user.role === 'CUSTOMER' && <Link to="/orders" onClick={closeMenu}>My Orders</Link>}
            <button
              type="button"
              onClick={() => {
                closeMenu();
                window.dispatchEvent(new CustomEvent('pwa-install-request'));
              }}
              className="flex items-center gap-2 py-2 text-dark font-semibold text-sm bg-transparent border-none cursor-pointer"
            >
              <Smartphone size={16} />
              <span>Install InteriorG App</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
