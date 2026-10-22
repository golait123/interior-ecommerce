import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  Package, 
  Sprout, 
  ShoppingCart, 
  User as UserIcon,
  Compass
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export function MobileBottomNav() {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  // Hide on admin and stock management routes
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/stock')) {
    return null;
  }

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      exact: true
    },
    {
      to: '/shop',
      label: 'Shop',
      icon: ShoppingBag
    },
    {
      to: '/packages',
      label: 'Packages',
      icon: Package,
      badge: 'Hot'
    },
    {
      to: '/gardening',
      label: 'Nursery',
      icon: Sprout
    },
    {
      to: '/cart',
      label: 'Bag',
      icon: ShoppingCart,
      count: itemCount
    },
    {
      to: user ? '/customer/dashboard' : '/login',
      label: user ? 'Account' : 'Sign In',
      icon: UserIcon
    }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-container">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? location.pathname === item.to 
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive: linkActive }) => 
                `mobile-bottom-tab ${linkActive ? 'active' : ''}`
              }
            >
              <div className="mobile-tab-icon-wrapper">
                <Icon size={20} className="mobile-tab-icon" />
                {item.count !== undefined && item.count > 0 && (
                  <span className="mobile-tab-badge">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
                {item.badge && !item.count && (
                  <span className="mobile-tab-pill-badge">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mobile-tab-label">{item.label}</span>
              {isActive && <span className="mobile-tab-active-indicator" />}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
