import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, LogOut, ExternalLink, MapPin, DollarSign, Landmark } from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: '/admin', icon: <Landmark size={20} />, label: 'Financial & Revenue' },
    { to: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Orders & Ledger' },
    { to: '/admin/customers', icon: <Users size={20} />, label: 'Customers' },
    { to: '/admin/locations', icon: <MapPin size={20} />, label: 'Location Analytics' },
    { to: '/stock/products', icon: <Package size={20} />, label: 'Stock & Catalog Portal' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="logo text-xl flex items-center gap-2.5">
            <img src="/interiorg-mark-transparent.png" alt="InteriorG" className="w-7 h-7 object-contain" />
            <span>Interior<span className="logo-g">G</span></span> <span className="text-xs font-semibold uppercase tracking-wider text-muted ml-1">Admin</span>
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
