import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Package, Activity, AlertTriangle, LogOut, ExternalLink } from 'lucide-react';

export function StockLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: '/stock', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { to: '/stock/inventory', icon: <Package size={20} />, label: 'Inventory' },
    { to: '/stock/movements', icon: <Activity size={20} />, label: 'Movements' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="logo text-xl">
            <span className="logo-casa">Interior</span><span className="logo-canvas">G</span> <span className="text-sm font-normal text-muted">STOCK</span>
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
