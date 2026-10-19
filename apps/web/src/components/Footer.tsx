import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Instagram } from 'lucide-react';

export function Footer() {
  const { user } = useAuth();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Vertical Brand Identity */}
        <div className="footer-brand">
          <Link to="/" className="logo">
            <img 
              src="/interiorg-mark-transparent.png" 
              alt="InteriorG" 
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            />
            <span>Interior<span className="logo-g">G</span></span>
          </Link>
          <p className="tagline">
            Artisanal Soul. Architectural Elegance.<br />
            Born in Sector 58 Banjara Market Gurugram.
          </p>
        </div>

        <div className="footer-divider" />
        
        {/* 2-Column Horizontal Links */}
        <div className="footer-links">
          <div className="footer-links-section">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/shop">Shop Collection</Link></li>
              <li><Link to="/gardening">Gardening & Plants</Link></li>
              <li><Link to="/nursery-customizer">Bespoke Nursery Studio</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>
          
          <div className="footer-links-section">
            <h4>Support</h4>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping & Returns</Link></li>
            </ul>
          </div>

          {user && ['ADMIN', 'STOCK_MANAGER'].includes(user.role) && (
            <div className="footer-links-section" style={{ gridColumn: 'span 2' }}>
              <h4>Team</h4>
              <ul>
                <li><Link to="/dashboard">Admin Dashboard</Link></li>
              </ul>
            </div>
          )}
        </div>

        <div className="footer-divider" />

        {/* Social Links with Icons */}
        <div className="footer-social-links">
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-social-pill" 
            aria-label="InteriorG Instagram"
          >
            <Instagram size={14} />
            <span>Instagram</span>
          </a>

          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-social-pill" 
            aria-label="InteriorG Studio Instagram"
          >
            <Instagram size={14} />
            <span>Instagram Studio</span>
          </a>

          <a 
            href="https://pinterest.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-social-pill" 
            aria-label="Pinterest"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
            </svg>
            <span>Pinterest</span>
          </a>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2026 InteriorG. All rights reserved.</p>
      </div>
    </footer>
  );
}
