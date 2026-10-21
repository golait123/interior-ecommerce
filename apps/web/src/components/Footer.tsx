import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sprout, 
  Truck, 
  ShieldCheck, 
  Wrench, 
  Calculator, 
  RotateCcw, 
  Sparkles, 
  Mail, 
  ArrowRight,
  QrCode,
  Smartphone,
  Instagram,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Footer() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      toast.success('Welcome to InteriorG Sanctuary! Check your inbox for ₹500 off.');
      setEmail('');
    }
  };

  return (
    <footer className="mega-footer">
      {/* 1. SIX TRUST PILLARS STRIP */}
      <div className="trust-pillars-strip">
        <div className="trust-pillars-container">
          <div className="trust-pillar-card">
            <div className="trust-icon-box">
              <Truck size={22} />
            </div>
            <div className="trust-pillar-text">
              <h4>Free Pan-India Delivery</h4>
              <p>On all orders above ₹999 with moisture-safe packaging</p>
            </div>
          </div>

          <div className="trust-pillar-card">
            <div className="trust-icon-box">
              <ShieldCheck size={22} />
            </div>
            <div className="trust-pillar-text">
              <h4>10-Year Warranty</h4>
              <p>Fade-resistant, peel-proof, and washable materials</p>
            </div>
          </div>

          <div className="trust-pillar-card">
            <div className="trust-icon-box">
              <Wrench size={22} />
            </div>
            <div className="trust-pillar-text">
              <h4>Certified Installation</h4>
              <p>White-glove master installers in 50+ major cities</p>
            </div>
          </div>

          <div className="trust-pillar-card">
            <div className="trust-icon-box">
              <Calculator size={22} />
            </div>
            <div className="trust-pillar-text">
              <h4>Smart Room Calculator</h4>
              <p>Precision wall sizing with zero excess roll wastage</p>
            </div>
          </div>

          <div className="trust-pillar-card">
            <div className="trust-icon-box">
              <RotateCcw size={22} />
            </div>
            <div className="trust-pillar-text">
              <h4>7-Day Easy Returns</h4>
              <p>Hassle-free replacement guarantee on all catalog items</p>
            </div>
          </div>

          <div className="trust-pillar-card">
            <div className="trust-icon-box">
              <Sparkles size={22} />
            </div>
            <div className="trust-pillar-text">
              <h4>Design Consultation</h4>
              <p>Free space planning by certified interior architects</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NEWSLETTER STRIP */}
      <div className="footer-newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-copy">
            <div className="flex items-center gap-2 mb-1">
              <Sprout size={18} className="text-primary-green" />
              <span className="newsletter-badge">InteriorG Sanctuary Club</span>
            </div>
            <h3 className="newsletter-heading">Get ₹500 off your first room makeover</h3>
            <p className="newsletter-sub">
              Receive curated wallpaper collections, indoor plant care tips, and exclusive preview invites.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="newsletter-form">
            <div className="newsletter-input-box">
              <Mail size={18} className="newsletter-icon" />
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
            </div>
            <button type="submit" className="newsletter-submit-btn">
              <span>Subscribe</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* 3. MAIN MEGA FOOTER LINKS & APP DOWNLOAD */}
      <div className="footer-main-links-section">
        <div className="footer-links-container">
          {/* Col 1: Brand Info */}
          <div className="footer-col brand-col">
            <Link to="/" className="brand-logo-lockup mb-3">
              <div className="brand-logo-icon">
                <Sprout size={22} className="sprout-icon" />
              </div>
              <div className="brand-logo-text">
                <div className="brand-title">Interior<span>G</span></div>
                <div className="brand-subtitle">Walls • Plants • Spaces • You</div>
              </div>
            </Link>
            <p className="footer-brand-bio">
              Interior Architecture | Luxury Wall Decor | Green Living. Designing personalized, biophilic sanctuaries that connect humans with nature and refined aesthetics.
            </p>
            <div className="footer-origin-tag">
              <span>Crafted in Sector 58, Banjara Market • Gurugram & New Delhi</span>
            </div>

            <div className="footer-social-row mt-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon-btn" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon-btn" aria-label="Pinterest">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Wallpapers & Paneling */}
          <div className="footer-col">
            <h4 className="footer-col-title">Wallpapers & Paneling</h4>
            <ul className="footer-menu">
              <li><Link to="/shop?category=botanical">Botanical & Floral Wallpapers</Link></li>
              <li><Link to="/shop?category=textured">Textured Linen & Raw Silk</Link></li>
              <li><Link to="/shop?category=3d-panels">3D Fluted Wall Panels</Link></li>
              <li><Link to="/shop?category=acoustic">Acoustic Wooden Slats</Link></li>
              <li><Link to="/shop?category=murals">Hand-painted Scenic Murals</Link></li>
              <li><Link to="/shop?category=peel-stick">Peel & Stick Ready Rolls</Link></li>
            </ul>
          </div>

          {/* Col 3: Plants & Gardening */}
          <div className="footer-col">
            <h4 className="footer-col-title">Plants & Gardening</h4>
            <ul className="footer-menu">
              <li><Link to="/gardening?filter=indoor">Air-Purifying Indoor Plants</Link></li>
              <li><Link to="/gardening?filter=low-light">Low-Light Office Plants</Link></li>
              <li><Link to="/gardening?filter=pet-friendly">Pet-Friendly Botanicals</Link></li>
              <li><Link to="/gardening?filter=bonsai">Tabletop Bonsai Trees</Link></li>
              <li><Link to="/gardening?filter=planters">Handcrafted Ceramic Pots</Link></li>
              <li><Link to="/gardening/customize">Bespoke Nursery Studio</Link></li>
            </ul>
          </div>

          {/* Col 4: Visualizer & Studio */}
          <div className="footer-col">
            <h4 className="footer-col-title">Visualizer & Tools</h4>
            <ul className="footer-menu">
              <li><Link to="/room-studio">360° Room Studio</Link></li>
              <li><Link to="/#calculator">Smart Wall Roll Calculator</Link></li>
              <li><Link to="/gardening/customize">Custom Space Configurator</Link></li>
              <li><Link to="/about">Book Architect Consultation</Link></li>
              <li><Link to="/customer/dashboard?tab=saved-rooms">My Saved 3D Spaces</Link></li>
              {user && ['ADMIN', 'STOCK_MANAGER'].includes(user.role) && (
                <li><Link to="/admin" className="text-gold font-medium">Admin Management Portal</Link></li>
              )}
            </ul>
          </div>

          {/* Col 5: App Download Box (Matches bottom right of poster) */}
          <div className="footer-col app-download-col">
            <div className="app-download-card">
              <div className="app-card-badge">
                <Smartphone size={14} className="inline mr-1" />
                <span>InteriorG AR App</span>
              </div>
              <h5 className="app-card-title">Experience 3D In Your Space</h5>
              <p className="app-card-desc">
                Scan the QR code to project wallpapers and plants directly onto your real walls with augmented reality.
              </p>
              
              {/* QR Code Graphic */}
              <div className="app-qr-box">
                <div className="qr-visual">
                  <QrCode size={64} className="qr-svg" />
                </div>
                <div className="qr-meta">
                  <span className="qr-scan-label">Point phone camera</span>
                  <span className="qr-version">iOS & Android Compatible</span>
                </div>
              </div>

              {/* Store Badges */}
              <div className="store-badges-row">
                <div className="store-pill">
                  <span className="store-brand">Google Play</span>
                </div>
                <div className="store-pill">
                  <span className="store-brand">App Store</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. COPYRIGHT BAR */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <p className="copyright-text">
            © 2026 InteriorG. All rights reserved. Interior Architecture | Luxury Wall Decor | Green Living — Design. Visualize. Personalize. Live Better.
          </p>
          <div className="footer-legal-links">
            <Link to="/about">Privacy Policy</Link>
            <span className="dot">•</span>
            <Link to="/about">Terms of Service</Link>
            <span className="dot">•</span>
            <Link to="/about">Installation Guidelines</Link>
            <span className="dot">•</span>
            <span>Made with 🌿 in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
