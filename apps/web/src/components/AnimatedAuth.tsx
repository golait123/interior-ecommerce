import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPendingCartItem } from '../contexts/CartContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import '../auth-animated.css';

interface AnimatedAuthProps {
  initialMode: 'sign-in' | 'sign-up';
}

export function AnimatedAuth({ initialMode }: AnimatedAuthProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(initialMode);
  const { user, login, register, googleLogin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Redirect if authenticated - Seamlessly routes customers with pending cart items to their bag
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'STOCK_MANAGER') {
        navigate('/stock', { replace: true });
      } else {
        const pending = getPendingCartItem();
        const searchParams = new URLSearchParams(location.search);
        const returnTo = searchParams.get('returnTo');

        if (pending || returnTo === '/cart') {
          navigate('/cart', { replace: true });
        } else if (returnTo) {
          navigate(returnTo, { replace: true });
        } else {
          navigate('/customer/dashboard', { replace: true });
        }
      }
    }
  }, [user, navigate, location.search]);

  // Sync mode with route if initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleToggle = (targetMode: 'sign-in' | 'sign-up') => {
    setMode(targetMode);
    window.history.pushState(null, '', targetMode === 'sign-in' ? '/login' : '/register');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginEmail.trim(), loginPassword);
      toast.success('Welcome back to InteriorG! Your 15% discount code WELCOME15 is active!', {
        duration: 6000,
        icon: '🏷️'
      });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Login failed. Check your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await register(regName.trim(), regEmail.trim(), regPassword);
      toast.success('Welcome to InteriorG! Your 15% discount code WELCOME15 is ready!', {
        duration: 6000,
        icon: '🎁'
      });
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="anim-auth-page">
      {/* ATMOSPHERIC LIGHT BANNER BACKDROP */}
      <div className="anim-auth-backdrop">
        <img 
          src="/images/majestic-hero-banner.jpg" 
          alt="InteriorG Sanctuary" 
        />
        <div className="scrim" />
      </div>

      {/* TOP RETURN LINK */}
      <Link to="/" className="anim-auth-return">
        <ArrowLeft size={13} />
        <span>Return to Store</span>
      </Link>

      {/* MAIN BOUNDED SLIDING FRAME */}
      <div className={`anim-card-frame ${mode}`}>
        
        {/* DUAL FORM PANELS */}
        <div className="anim-panel-forms">
          
          {/* SIGN IN FORM (LEFT SIDE) */}
          <div className="anim-form-side sign-in">
            <div className="anim-form-header">
              <div className="anim-form-brand">
                <img 
                  src="/interiorg-mark-transparent.png" 
                  alt="InteriorG" 
                  style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                />
                <span>Interior<span className="logo-g">G</span></span>
              </div>
              <h2 className="anim-form-title">Welcome Back</h2>
              <p className="anim-form-subtitle">
                Access your commissions, custom wall calculations & sanctuary bag.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="anim-input-field">
                <Mail size={15} className="field-icon" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required 
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="anim-input-field">
                <Lock size={15} className="field-icon" />
                <input 
                  type={showLoginPassword ? 'text' : 'password'} 
                  placeholder="Password" 
                  required 
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowLoginPassword(!showLoginPassword)} 
                  className="eye-toggle"
                  aria-label="Toggle password visibility"
                >
                  {showLoginPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <div className="flex justify-between items-center mb-2 px-1 text-xs">
                <span className="text-muted">Private Client Access</span>
                <span 
                  onClick={() => toast('Password reset instructions sent to your email', { icon: '✉️' })}
                  className="text-muted hover:text-dark cursor-pointer font-light"
                >
                  Forgot password?
                </span>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="anim-btn-primary"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In To InteriorG'}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            <div className="anim-divider">
              <span>or</span>
            </div>

            {/* GOOGLE SIGN IN (EXACT 18px FIXED ICON) */}
            <button 
              type="button" 
              onClick={googleLogin} 
              className="anim-btn-google"
            >
              <svg 
                style={{ width: '18px', height: '18px', minWidth: '18px', flexShrink: 0 }} 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* DEMO 1-CLICK PILLS */}
            <div className="anim-demo-row">
              <span className="anim-demo-label">One-Click Demo Fill:</span>
              <div className="anim-demo-buttons">
                <button
                  type="button"
                  className="anim-demo-btn"
                  onClick={() => { setLoginEmail('customer@interiorg.local'); setLoginPassword('Customer@12345'); }}
                >
                  Patron
                </button>
                <button
                  type="button"
                  className="anim-demo-btn"
                  onClick={() => { setLoginEmail('admin@interiorg.local'); setLoginPassword('Admin@12345'); }}
                >
                  Admin
                </button>
                <button
                  type="button"
                  className="anim-demo-btn"
                  onClick={() => { setLoginEmail('stock@interiorg.local'); setLoginPassword('Stock@12345'); }}
                >
                  Stock
                </button>
              </div>
            </div>

            {/* Mobile Switch link */}
            <p className="anim-mobile-switch">
              Don't have an account? <b onClick={() => handleToggle('sign-up')}>Register here</b>
            </p>
          </div>

          {/* SIGN UP FORM (RIGHT SIDE) */}
          <div className="anim-form-side sign-up">
            <div className="anim-form-header">
              <div className="anim-form-brand">
                <img 
                  src="/interiorg-mark-transparent.png" 
                  alt="InteriorG" 
                  style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                />
                <span>Interior<span className="logo-g">G</span></span>
              </div>
              <h2 className="anim-form-title">Create Account</h2>
              <p className="anim-form-subtitle">
                Unlock custom wallpaper calculators & private sanctuary commissions.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="anim-input-field">
                <User size={15} className="field-icon" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required 
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                />
              </div>

              <div className="anim-input-field">
                <Mail size={15} className="field-icon" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required 
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="anim-input-field">
                  <Lock size={15} className="field-icon" />
                  <input 
                    type={showRegPassword ? 'text' : 'password'} 
                    placeholder="Password" 
                    required 
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowRegPassword(!showRegPassword)} 
                    className="eye-toggle"
                    aria-label="Toggle password visibility"
                  >
                    {showRegPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>

                <div className="anim-input-field">
                  <Lock size={15} className="field-icon" />
                  <input 
                    type={showRegPassword ? 'text' : 'password'} 
                    placeholder="Confirm" 
                    required 
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={regConfirm}
                    onChange={e => setRegConfirm(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="anim-btn-primary"
              >
                <span>{loading ? 'Creating Account...' : 'Register As Patron'}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            <div className="anim-divider">
              <span>or</span>
            </div>

            {/* GOOGLE SIGN IN (EXACT 18px FIXED ICON) */}
            <button 
              type="button" 
              onClick={googleLogin} 
              className="anim-btn-google"
            >
              <svg 
                style={{ width: '18px', height: '18px', minWidth: '18px', flexShrink: 0 }} 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Mobile Switch link */}
            <p className="anim-mobile-switch">
              Already have an account? <b onClick={() => handleToggle('sign-in')}>Sign in here</b>
            </p>
          </div>

        </div>

        {/* SLIDING BRAND CURTAIN (CODEPEN ANIMATED SLIDER OVERLAY) */}
        <div className="anim-overlay-slider">
          <div className="anim-slider-content">
            
            {/* Displayed when card is in SIGN-IN mode (prompts to join) */}
            {mode === 'sign-in' ? (
              <div className="anim-slider-inner">
                <div className="anim-slider-medallion">
                  <img 
                    src="/interiorg-mark-transparent.png" 
                    alt="InteriorG 3D Emblem" 
                    className="anim-slider-logo"
                  />
                </div>
                <h2 className="anim-slider-title">Join with us</h2>
                <p className="anim-slider-desc">
                  Discover haute architecture, bespoke wall murals, and living botanical decor crafted for fine residences.
                </p>
                <button 
                  type="button" 
                  className="anim-slider-btn"
                  onClick={() => handleToggle('sign-up')}
                >
                  Create Patron Account
                </button>
              </div>
            ) : (
              /* Displayed when card is in SIGN-UP mode (prompts to sign in) */
              <div className="anim-slider-inner">
                <div className="anim-slider-medallion">
                  <img 
                    src="/interiorg-mark-transparent.png" 
                    alt="InteriorG 3D Emblem" 
                    className="anim-slider-logo"
                  />
                </div>
                <h2 className="anim-slider-title">Welcome Back</h2>
                <p className="anim-slider-desc">
                  To keep connected with your custom design commissions, please sign in with your credentials.
                </p>
                <button 
                  type="button" 
                  className="anim-slider-btn"
                  onClick={() => handleToggle('sign-in')}
                >
                  Sign In
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
