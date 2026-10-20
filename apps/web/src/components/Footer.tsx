import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UIcon } from './UIcon';

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
            <UIcon name="brands-instagram" size={14} />
            <span>Instagram</span>
          </a>

          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-social-pill" 
            aria-label="InteriorG Studio Instagram"
          >
            <UIcon name="brands-instagram" size={14} />
            <span>Instagram Studio</span>
          </a>

          <a 
            href="https://pinterest.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-social-pill" 
            aria-label="Pinterest"
          >
            <UIcon name="brands-pinterest" size={14} />
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
