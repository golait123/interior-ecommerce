import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  Store, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  KeyRound, 
  Building2, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface StaffLoginProps {
  defaultPortal?: 'admin' | 'stock';
}

export default function StaffLogin({ defaultPortal }: StaffLoginProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();

  // Determine initial portal mode from props or URL
  const initialPortal = defaultPortal || 
    (location.pathname.includes('stock') || location.pathname.includes('shop') ? 'stock' : 'admin');
  
  const [activePortal, setActivePortal] = useState<'admin' | 'stock'>(initialPortal);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sync state if URL changes
  useEffect(() => {
    if (location.pathname.includes('stock') || location.pathname.includes('shop')) {
      setActivePortal('stock');
    } else if (location.pathname.includes('admin')) {
      setActivePortal('admin');
    }
  }, [location.pathname]);

  // Redirect if already authenticated with staff roles
  useEffect(() => {
    if (user) {
      const searchParams = new URLSearchParams(location.search);
      const returnTo = searchParams.get('returnTo');

      if (user.role === 'ADMIN') {
        navigate(returnTo && returnTo.startsWith('/admin') ? returnTo : '/admin', { replace: true });
      } else if (user.role === 'STOCK_MANAGER') {
        navigate(returnTo && returnTo.startsWith('/stock') ? returnTo : '/stock', { replace: true });
      }
    }
  }, [user, navigate, location.search]);

  const handlePortalSwitch = (portal: 'admin' | 'stock') => {
    setActivePortal(portal);
    setEmail('');
    setPassword('');
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get('returnTo');
    const newPath = portal === 'admin' ? '/admin/login' : '/stock/login';
    const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
    window.history.pushState(null, '', newPath + query);
  };

  const handleQuickFill = (portal: 'admin' | 'stock') => {
    if (portal === 'admin') {
      setEmail('admin@interiorg.local');
      setPassword('Admin@12345');
      toast.success('Admin credentials loaded', { icon: '🛡️', duration: 2500 });
    } else {
      setEmail('stock@interiorg.local');
      setPassword('Stock@12345');
      toast.success('Shop Manager credentials loaded', { icon: '📦', duration: 2500 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    try {
      await login(email.trim(), password);

      // Verify role after login
      const rawUser = localStorage.getItem('cc_user');
      const parsedUser = rawUser ? JSON.parse(rawUser) : null;
      const role = parsedUser?.role;

      const searchParams = new URLSearchParams(location.search);
      const returnTo = searchParams.get('returnTo');

      if (role === 'ADMIN') {
        toast.success(`Welcome Administrator ${parsedUser?.name || ''}!`, { icon: '🛡️' });
        navigate(returnTo && returnTo.startsWith('/admin') ? returnTo : '/admin', { replace: true });
      } else if (role === 'STOCK_MANAGER') {
        toast.success(`Welcome Shop Manager ${parsedUser?.name || ''}!`, { icon: '📦' });
        navigate(returnTo && returnTo.startsWith('/stock') ? returnTo : '/stock', { replace: true });
      } else {
        toast.error('Access Restricted: Customer accounts do not have staff management privileges. Redirecting to Customer Sanctuary...', {
          duration: 5000,
          icon: '⚠️'
        });
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please verify management credentials.');
    }
  };

  const isAdmin = activePortal === 'admin';

  return (
    <div className="min-h-screen bg-[#070f1e] text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-900 relative overflow-hidden font-sans">
      
      {/* Background Subtle Mesh & Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[130px] opacity-25"
          style={{ background: isAdmin ? 'radial-gradient(circle, #3b82f6 0%, #1e3a8a 70%, transparent 100%)' : 'radial-gradient(circle, #10b981 0%, #064e3b 70%, transparent 100%)' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-4 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-white no-underline group">
          <img 
            src="/interiorg-mark-transparent.png" 
            alt="InteriorG" 
            className="w-8 h-8 object-contain transition-transform group-hover:scale-105" 
          />
          <span className="font-bold tracking-tight text-lg">
            Interior<span className="text-amber-400">G</span>
          </span>
          <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 ml-1">
            Enterprise Console
          </span>
        </Link>

        <Link 
          to="/login" 
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700/80 transition-all shadow-xs"
        >
          <ArrowLeft size={13} />
          <span>Customer Patron Login</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-6">
        
        {/* Portal Switcher Tabs */}
        <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-xl mb-4 flex gap-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${
              isAdmin 
                ? 'bg-gradient-to-r from-blue-700 to-[#0f2444] text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 bg-transparent'
            }`}
          >
            <ShieldCheck size={16} className={isAdmin ? 'text-amber-300' : 'text-slate-500'} />
            <span>Admin Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('stock')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${
              !isAdmin 
                ? 'bg-gradient-to-r from-emerald-700 to-[#064e3b] text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 bg-transparent'
            }`}
          >
            <Store size={16} className={!isAdmin ? 'text-emerald-300' : 'text-slate-500'} />
            <span>Shop Manager Portal</span>
          </button>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative">
          
          {/* Subtle Top Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isAdmin 
                ? 'bg-blue-950/80 text-blue-300 border-blue-800/80' 
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
            }`}>
              {isAdmin ? <ShieldCheck size={13} /> : <Store size={13} />}
              <span>{isAdmin ? 'System Administration & Ledger' : 'Inventory & Store Operations'}</span>
            </span>

            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SECURE TLS
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
            {isAdmin ? 'Administrator Sign In' : 'Shop Manager Sign In'}
          </h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {isAdmin 
              ? 'Authorized administrative personnel only. Access global catalog, financials & customer accounts.' 
              : 'Authorized store managers only. Manage live showroom inventory, movements & dispatch queues.'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Staff Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder={isAdmin ? 'admin@interiorg.local' : 'stock@interiorg.local'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Management Passkey
                </label>
                <span 
                  onClick={() => toast('For credential assistance, contact your InteriorG System Lead.', { icon: '🔐' })}
                  className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Forgot passkey?
                </span>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-0 bg-transparent border-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg ${
                isAdmin 
                  ? 'bg-gradient-to-r from-blue-600 to-[#0f2444] hover:from-blue-500 hover:to-[#173766] shadow-blue-900/30' 
                  : 'bg-gradient-to-r from-emerald-600 to-[#064e3b] hover:from-emerald-500 hover:to-[#096a51] shadow-emerald-900/30'
              } disabled:opacity-50`}
            >
              <span>{loading ? 'Authenticating Clearance...' : isAdmin ? 'Authorize Admin Session' : 'Authorize Shop Manager Session'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Fill For Convenience */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Demo Access:
            </span>
            <button
              type="button"
              onClick={() => handleQuickFill(activePortal)}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound size={12} className="text-amber-400" />
              <span>Fill {isAdmin ? 'Admin' : 'Shop Manager'} Demo</span>
            </button>
          </div>

        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-center text-[11px] text-slate-400">
          <p className="m-0 flex items-center justify-center gap-1.5 text-amber-400 font-medium mb-0.5">
            <AlertTriangle size={12} />
            <span>Restricted Corporate Workspace</span>
          </p>
          <span>All actions, order dispatches and inventory updates are audited with immutable timestamp telemetry.</span>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 gap-2">
        <div>
          © {new Date().getFullYear()} InteriorG Crafts & Botanical Murals. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-white no-underline">
            Main Storefront
          </Link>
          <Link to="/login" className="text-slate-400 hover:text-white no-underline">
            Patron Login
          </Link>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400">256-Bit SSL Encrypted</span>
        </div>
      </footer>

    </div>
  );
}
