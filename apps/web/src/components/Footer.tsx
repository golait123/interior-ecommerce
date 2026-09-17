import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Footer() {
  const { user } = useAuth();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="logo mb-4 inline-block">
            <span className="logo-casa">Interior</span><span className="logo-canvas">G</span>
          </Link>
          <p className="tagline" style={{ fontSize: '13px', lineHeight: '1.6' }}>
            Artisanal Soul. Architectural Elegance.<br />
            Born in Sector 58 Banjara Market Gurugram.
          </p>
          <div className="social-links mt-4">
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Pinterest">PIN</a>
          </div>
        </div>
        
        <div className="footer-links">
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link to="/#shop">Shop Collection</Link></li>
              <li><Link to="/#works">Recent Works</Link></li>
              <li><Link to="/#custom">Bespoke Studio</Link></li>
              <li><Link to="/#journal">The Journal</Link></li>
              <li><Link to="/#story">Artisan Story</Link></li>
            </ul>
          </div>
          
          <div>
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping & Returns</Link></li>
            </ul>
          </div>

          {user && ['ADMIN', 'STOCK_MANAGER'].includes(user.role) && (
            <div>
              <h4>Team</h4>
              <ul>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 InteriorG. All rights reserved.</p>
      </div>
    </footer>
  );
}
