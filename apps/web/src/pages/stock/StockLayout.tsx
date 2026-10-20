import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, Activity, AlertTriangle, LogOut, ExternalLink, ShoppingBag, PackageCheck } from 'lucide-react';

export function StockLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: '/stock', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { to: '/stock/products', icon: <PackageCheck size={20} />, label: 'Products & Catalog' },
    { to: '/stock/inventory', icon: <Package size={20} />, label: 'Inventory' },
    { to: '/stock/orders', icon: <ShoppingBag size={20} />, label: 'Orders & Tracking' },
    { to: '/stock/movements', icon: <Activity size={20} />, label: 'Movements' },
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
            <ExternalLink size={20} /> <span>Back to Store</span>
          </Link>
          <button onClick={logout} className="admin-nav-item text-danger w-full text-left">
            <LogOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
