import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UIcon } from '../../components/UIcon';

export function StockLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: '/stock', icon: <UIcon name="apps" size={18} />, label: 'Overview' },
    { to: '/stock/products', icon: <UIcon name="box-alt" size={18} />, label: 'Products & Catalog' },
    { to: '/stock/inventory', icon: <UIcon name="boxes" size={18} />, label: 'Inventory' },
    { to: '/stock/orders', icon: <UIcon name="shopping-bag" size={18} />, label: 'Orders & Tracking' },
    { to: '/stock/movements', icon: <UIcon name="refresh" size={18} />, label: 'Movements' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="logo text-xl flex items-center gap-2.5">
            <img src="/interiorg-mark-transparent.png" alt="InteriorG" className="w-7 h-7 object-contain" />
            <span>Interior<span className="logo-g">G</span></span> <span className="text-xs font-semibold uppercase tracking-wider text-muted ml-1">Stock</span>
          </Link>
        </div>
        <nav className="admin-sidebar-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`admin-nav-item ${pathname === l.to ? 'active' : ''}`}>
              {l.icon} <span>{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item">
            <UIcon name="shop" size={18} /> <span>Back to Store</span>
          </Link>
          <button onClick={logout} className="admin-nav-item text-danger w-full text-left">
            <UIcon name="sign-out-alt" size={18} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
