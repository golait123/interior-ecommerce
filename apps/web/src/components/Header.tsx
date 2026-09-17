import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User as UserIcon, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery)}#shop`);
      setIsMenuOpen(false);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header">
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-content">
          <span>✦ Curated Sector 58 Banjara Market Masterpieces • Bespoke Wall Murals • Complimentary Architectural Styling across NCR ✦</span>
        </div>
      </div>

      <div className="header-container">
        <div className="header-brand-nav">
          <div className="header-mobile-toggle">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <Link to="/" className="logo" onClick={closeMenu}>
            <span className="logo-casa">Interior</span><span className="logo-canvas">G</span>
          </Link>

          <nav className="desktop-nav">
            <Link to="/shop">Shopping</Link>
            <Link to="/gardening">Gardening & Plants</Link>
            <Link to="/#works">Our Works</Link>
            <Link to="/#custom">Bespoke Studio</Link>
            <Link to="/#journal">The Journal</Link>
            <Link to="/#story">Artisan Story</Link>
          </nav>
        </div>

        <div className="header-actions">
          <form className="search-bar desktop-search" onSubmit={handleSearch}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {(!user || user.role === 'CUSTOMER') && (
            <Link to="/cart" className="cart-icon" aria-label="Cart">
              <ShoppingBag size={24} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          )}

          {user ? (
            <div className="user-menu">
              {['ADMIN', 'STOCK_MANAGER'].includes(user.role) && (
                <Link to="/dashboard" className="btn btn-ghost" style={{ padding: '0.5rem' }} title="Dashboard">
                  <LayoutDashboard size={20} />
                </Link>
              )}
              {user.role === 'CUSTOMER' && (
                <>
                  <Link to="/customer/dashboard" className="btn btn-ghost text-sm" style={{ padding: '0.4rem 0.75rem' }}>
                    Dashboard
                  </Link>
                  <Link to="/orders" className="btn btn-ghost text-sm" style={{ padding: '0.4rem 0.75rem' }}>
                    My Orders
                  </Link>
                </>
              )}
              <div className="user-avatar-container group" style={{ position: 'relative' }}>
                <button 
                  className="user-avatar" 
                  aria-label="User menu"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '4px', background: '#e8e2d8' }}
                >
                  <UserIcon size={18} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                </button>
                <div className="user-dropdown dropdown-menu">
                  <div className="dropdown-header">
                    <p style={{ fontWeight: 600 }}>{user.name}</p>
                    <small className="text-muted">{user.email}</small>
                    <div style={{ marginTop: '4px' }}>
                      <span className="badge badge-gray text-xs">{user.role}</span>
                    </div>
                  </div>
                  {user.role === 'CUSTOMER' && <Link to="/customer/dashboard" className="dropdown-item">Customer Dashboard</Link>}
                  {user.role === 'CUSTOMER' && <Link to="/orders" className="dropdown-item">My Orders</Link>}
                  {['ADMIN', 'STOCK_MANAGER'].includes(user.role) && <Link to="/dashboard" className="dropdown-item">Management Console</Link>}
                  <button onClick={logout} className="dropdown-item text-danger">Sign Out</button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary login-btn">Sign In</Link>
          )}
        </div>
      </div>

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
            <Link to="/shop" onClick={closeMenu}>Shopping</Link>
            <Link to="/gardening" onClick={closeMenu}>Gardening & Plants</Link>
            <Link to="/#works" onClick={closeMenu}>Our Works</Link>
            <Link to="/#custom" onClick={closeMenu}>Bespoke Studio</Link>
            <Link to="/#journal" onClick={closeMenu}>The Journal</Link>
            <Link to="/#story" onClick={closeMenu}>Artisan Story</Link>
            {user && user.role === 'CUSTOMER' && <Link to="/orders" onClick={closeMenu}>My Orders</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}
