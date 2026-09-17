import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { user, login, googleLogin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'STOCK_MANAGER') return <Navigate to="/stock" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="logo text-center d-block mb-8">
          <span className="logo-casa">Interior</span><span className="logo-canvas">G</span>
        </Link>
        
        <div className="auth-box">
          <h2 className="mb-6 text-center">Welcome back.</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" required className="input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" required className="input" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="auth-separator"><span>or</span></div>

          <button onClick={googleLogin} className="btn btn-secondary w-full d-flex justify-center align-center gap-2">
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" className="text-accent font-medium">Create one</Link>
          </div>
        </div>

        <div className="alert-info mt-6 text-sm">
          <strong>Demo credentials (click to autofill):</strong>
          <div className="flex flex-col gap-2 mt-3">
            <button
              type="button"
              className="btn btn-secondary text-sm text-left py-2 px-3"
              style={{ background: '#fff', border: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => { setEmail('customer@interiorg.local'); setPassword('Customer@12345'); }}
            >
              <strong>Customer:</strong> customer@interiorg.local / Customer@12345
            </button>
            <button
              type="button"
              className="btn btn-secondary text-sm text-left py-2 px-3"
              style={{ background: '#fff', border: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => { setEmail('admin@interiorg.local'); setPassword('Admin@12345'); }}
            >
              <strong>Admin:</strong> admin@interiorg.local / Admin@12345
            </button>
            <button
              type="button"
              className="btn btn-secondary text-sm text-left py-2 px-3"
              style={{ background: '#fff', border: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => { setEmail('stock@interiorg.local'); setPassword('Stock@12345'); }}
            >
              <strong>Stock Manager:</strong> stock@interiorg.local / Stock@12345
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
